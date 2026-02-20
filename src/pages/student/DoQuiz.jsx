import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';
import LatexRenderer from '../../components/LatexRenderer';

const DoQuiz = () => {
  const { attemptId } = useParams();
  const navigate = useNavigate();
  const [attempt, setAttempt] = useState(null);
  const [answers, setAnswers] = useState({});
  const [currentIdx, setCurrentIdx] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [timeLeft, setTimeLeft] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [saveStatus, setSaveStatus] = useState('');
  const saveTimer = useRef(null);
  const timerRef = useRef(null);

  useEffect(() => {
    const fetchAttempt = async () => {
      try {
        setLoading(true);
        const res = await axiosClient.get(`/attempts/${attemptId}`);
        const data = res.data.attempt;
        setAttempt(data);

        const existingAnswers = {};
        data.questions?.forEach(q => {
          const qId = q.question?._id || q.question;
          if (q.selectedOption >= 0) {
            existingAnswers[qId] = q.selectedOption;
          }
        });
        setAnswers(existingAnswers);

        if (data.quiz?.duration) {
          const elapsed = Math.floor((Date.now() - new Date(data.startedAt).getTime()) / 1000);
          const remaining = Math.max(0, data.quiz.duration * 60 - elapsed);
          setTimeLeft(remaining);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAttempt();
  }, [attemptId]);

  useEffect(() => {
    if (timeLeft === null || timeLeft <= 0) return;
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft !== null]);

  const doSave = useCallback(async () => {
    if (Object.keys(answers).length === 0) return;
    try {
      setSaveStatus('saving');
      const answerList = Object.entries(answers).map(([questionId, selectedOption]) => ({
        questionId, selectedOption
      }));
      await axiosClient.put(`/attempts/${attemptId}/save`, { answers: answerList });
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus(''), 2000);
    } catch {
      setSaveStatus('');
    }
  }, [answers, attemptId]);

  useEffect(() => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(doSave, 15000);
    return () => clearTimeout(saveTimer.current);
  }, [answers, doSave]);

  const handleSelectOption = (questionId, optionIndex) => {
    setAnswers(prev => ({ ...prev, [questionId]: optionIndex }));
  };

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      const answerList = Object.entries(answers).map(([questionId, selectedOption]) => ({
        questionId, selectedOption
      }));
      if (answerList.length > 0) {
        await axiosClient.put(`/attempts/${attemptId}/save`, { answers: answerList });
      }
      await axiosClient.post(`/attempts/${attemptId}/submit`);
      navigate(`/student/quiz-result/${attemptId}`, { replace: true });
    } catch (err) {
      alert(err.response?.data?.message || 'Lỗi khi nộp bài');
      setSubmitting(false);
    }
  };

  const formatTime = (seconds) => {
    if (seconds === null) return '--:--';
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--cream)' }}>
        <div className="text-center fade-in-up">
          <div className="w-16 h-16 mx-auto rounded-2xl flex items-center justify-center mb-4" style={{ background: 'var(--amber-soft)' }}>
            <svg className="animate-spin w-7 h-7" style={{ color: 'var(--amber)' }} viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          </div>
          <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Đang tải câu hỏi...</p>
        </div>
      </div>
    );
  }

  if (!attempt || !attempt.questions?.length) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--cream)' }}>
        <div className="text-center fade-in-up">
          <div className="w-16 h-16 mx-auto rounded-2xl flex items-center justify-center mb-4" style={{ background: 'var(--danger-light)' }}>
            <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7" style={{ color: 'var(--danger)' }}>
              <path d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <p className="font-display font-bold" style={{ color: 'var(--text-primary)' }}>Không tìm thấy bài làm</p>
          <button onClick={() => navigate('/student/quizzes')} className="btn-secondary mt-4 py-2 px-5 text-sm">
            Quay lại
          </button>
        </div>
      </div>
    );
  }

  const questions = attempt.questions;
  const currentQ = questions[currentIdx];
  const questionData = currentQ?.question;
  const answeredCount = Object.keys(answers).length;
  const isUrgent = timeLeft !== null && timeLeft < 60;
  const progressPercent = Math.round((answeredCount / questions.length) * 100);

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--cream)' }}>
      {/* Top bar */}
      <header className="sticky top-0 z-30 glass" style={{ borderBottom: '1px solid var(--border)' }}>
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => setShowConfirm(true)} className="p-1.5 rounded-lg transition-all" style={{ color: 'var(--text-muted)', background: '#f1f5f9' }}>
              <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" /></svg>
            </button>
            <h1 className="font-display font-bold text-sm truncate max-w-[200px] md:max-w-none" style={{ color: 'var(--text-primary)' }}>
              {attempt.quiz?.title || 'Quiz'}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            {saveStatus && (
              <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
                {saveStatus === 'saving' ? (
                  <span className="flex items-center gap-1">
                    <svg className="animate-spin w-3 h-3" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                    Đang lưu
                  </span>
                ) : (
                  <span className="flex items-center gap-1" style={{ color: 'var(--success)' }}>
                    <svg viewBox="0 0 16 16" fill="currentColor" className="w-3 h-3"><path fillRule="evenodd" d="M12.416 3.376a.75.75 0 01.208 1.04l-5 7.5a.75.75 0 01-1.154.114l-3-3a.75.75 0 011.06-1.06l2.353 2.353 4.493-6.74a.75.75 0 011.04-.207z" clipRule="evenodd" /></svg>
                    Đã lưu
                  </span>
                )}
              </span>
            )}

            {timeLeft !== null && (
              <div
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-mono font-bold ${isUrgent ? 'animate-pulse' : ''}`}
                style={{
                  background: isUrgent ? 'var(--danger-light)' : 'var(--info-light)',
                  color: isUrgent ? 'var(--danger)' : 'var(--info)',
                }}
              >
                <svg viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5"><path fillRule="evenodd" d="M1 8a7 7 0 1114 0A7 7 0 011 8zm7.75-4.25a.75.75 0 00-1.5 0V8c0 .414.336.75.75.75h3.25a.75.75 0 000-1.5h-2.5v-3.5z" clipRule="evenodd" /></svg>
                {formatTime(timeLeft)}
              </div>
            )}

            <div className="badge badge-amber font-bold">
              {answeredCount}/{questions.length}
            </div>
          </div>
        </div>
        {/* Progress bar */}
        <div className="progress-bar" style={{ height: 3, borderRadius: 0 }}>
          <div className="progress-bar-fill" style={{ width: `${progressPercent}%` }} />
        </div>
      </header>

      <div className="flex-1 max-w-5xl mx-auto w-full px-4 py-6 flex gap-6">
        {/* Main question area */}
        <div className="flex-1">
          {questionData && (
            <div className="card p-6 md:p-8 fade-in">
              {/* Question header */}
              <div className="flex items-center gap-3 mb-6">
                <span className="w-9 h-9 flex items-center justify-center rounded-xl text-sm font-bold text-white" style={{ background: 'var(--grad-amber)' }}>
                  {currentIdx + 1}
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {questionData.subject && <span className="badge badge-blue">{questionData.subject}</span>}
                  {questionData.topic && <span className="badge badge-purple">{questionData.topic}</span>}
                </div>
              </div>

              {/* Question content */}
              <div className="text-base leading-relaxed mb-6" style={{ color: 'var(--text-primary)' }}>
                <LatexRenderer text={questionData.content} />
              </div>

              {/* Media */}
              {questionData.mediaUrl && (
                <div className="mb-6">
                  <img src={questionData.mediaUrl} alt="" className="max-w-full rounded-xl border" style={{ borderColor: 'var(--border)' }} />
                </div>
              )}

              {/* Options */}
              {questionData.type === 'mcq' && questionData.options && (
                <div className="space-y-3">
                  {questionData.options.map((opt, i) => {
                    const qId = questionData._id;
                    const isSelected = answers[qId] === i;
                    return (
                      <button key={i} onClick={() => handleSelectOption(qId, i)}
                        className="w-full text-left flex items-center gap-3.5 px-5 py-4 rounded-xl border-2 transition-all"
                        style={{
                          borderColor: isSelected ? 'var(--amber)' : 'var(--border)',
                          background: isSelected ? 'var(--amber-soft)' : 'var(--white)',
                          boxShadow: isSelected ? 'var(--shadow-amber)' : 'none',
                        }}
                      >
                        <span
                          className="w-9 h-9 flex items-center justify-center rounded-full text-sm font-bold shrink-0 transition-all"
                          style={{
                            background: isSelected ? 'var(--grad-amber)' : '#f1f5f9',
                            color: isSelected ? 'white' : 'var(--text-muted)',
                          }}
                        >
                          {String.fromCharCode(65 + i)}
                        </span>
                        <span className="text-sm" style={{ color: isSelected ? 'var(--text-primary)' : 'var(--text-secondary)', fontWeight: isSelected ? 600 : 400 }}>
                          <LatexRenderer text={opt.text} />
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Nav buttons */}
              <div className="flex justify-between items-center mt-8 pt-6 border-t" style={{ borderColor: 'var(--border-light)' }}>
                <button disabled={currentIdx === 0} onClick={() => setCurrentIdx(currentIdx - 1)}
                  className="btn-secondary py-2.5 px-4 text-sm disabled:opacity-30">
                  <span className="flex items-center gap-1.5">
                    <svg viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5"><path fillRule="evenodd" d="M12.5 8a.75.75 0 01-.75.75H5.56l2.22 2.22a.75.75 0 11-1.06 1.06l-3.5-3.5a.75.75 0 010-1.06l3.5-3.5a.75.75 0 011.06 1.06L5.56 7.25h6.19A.75.75 0 0112.5 8z" clipRule="evenodd" /></svg>
                    Câu trước
                  </span>
                </button>

                {currentIdx < questions.length - 1 ? (
                  <button onClick={() => setCurrentIdx(currentIdx + 1)} className="btn-primary py-2.5 px-5 text-sm">
                    <span className="flex items-center gap-1.5">
                      Câu sau
                      <svg viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5"><path fillRule="evenodd" d="M3.5 8a.75.75 0 01.75-.75h6.19L8.22 5.03a.75.75 0 011.06-1.06l3.5 3.5a.75.75 0 010 1.06l-3.5 3.5a.75.75 0 01-1.06-1.06l2.22-2.22H4.25A.75.75 0 013.5 8z" clipRule="evenodd" /></svg>
                    </span>
                  </button>
                ) : (
                  <button onClick={() => setShowConfirm(true)}
                    className="py-2.5 px-5 rounded-xl text-sm font-semibold text-white transition-all"
                    style={{ background: 'linear-gradient(135deg, #10b981, #059669)', boxShadow: '0 4px 14px rgba(16,185,129,0.3)' }}>
                    <span className="flex items-center gap-1.5">
                      <svg viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5"><path fillRule="evenodd" d="M12.416 3.376a.75.75 0 01.208 1.04l-5 7.5a.75.75 0 01-1.154.114l-3-3a.75.75 0 011.06-1.06l2.353 2.353 4.493-6.74a.75.75 0 011.04-.207z" clipRule="evenodd" /></svg>
                      Nộp bài
                    </span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right sidebar: question nav */}
        <div className="hidden md:block w-56 shrink-0">
          <div className="card p-4 sticky top-20">
            <h4 className="text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--text-muted)' }}>Câu hỏi</h4>
            <div className="grid grid-cols-5 gap-1.5">
              {questions.map((q, i) => {
                const qId = q.question?._id || q.question;
                const isAnswered = answers[qId] !== undefined;
                const isCurrent = i === currentIdx;
                return (
                  <button key={i} onClick={() => setCurrentIdx(i)}
                    className="w-9 h-9 flex items-center justify-center rounded-lg text-xs font-bold transition-all"
                    style={{
                      background: isCurrent ? 'var(--grad-amber)' : isAnswered ? 'var(--success-light)' : '#f1f5f9',
                      color: isCurrent ? 'white' : isAnswered ? '#065f46' : 'var(--text-muted)',
                      border: isCurrent ? 'none' : isAnswered ? '1px solid #a7f3d0' : '1px solid #e2e8f0',
                      boxShadow: isCurrent ? 'var(--shadow-amber)' : 'none',
                    }}
                  >
                    {i + 1}
                  </button>
                );
              })}
            </div>

            <div className="mt-4 pt-3 border-t space-y-2" style={{ borderColor: 'var(--border-light)' }}>
              <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--text-muted)' }}>
                <span className="w-3.5 h-3.5 rounded" style={{ background: 'var(--success-light)', border: '1px solid #a7f3d0' }} /> Đã trả lời ({answeredCount})
              </div>
              <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--text-muted)' }}>
                <span className="w-3.5 h-3.5 rounded" style={{ background: '#f1f5f9', border: '1px solid #e2e8f0' }} /> Chưa trả lời ({questions.length - answeredCount})
              </div>
            </div>

            <button onClick={() => setShowConfirm(true)}
              className="w-full mt-4 py-2.5 rounded-xl text-sm font-bold text-white transition-all"
              style={{ background: 'linear-gradient(135deg, #10b981, #059669)', boxShadow: '0 4px 14px rgba(16,185,129,0.25)' }}>
              Nộp bài
            </button>
          </div>
        </div>
      </div>

      {/* Mobile bottom bar */}
      <div className="md:hidden sticky bottom-0 z-20 glass p-3" style={{ borderTop: '1px solid var(--border)' }}>
        <div className="flex gap-2">
          <button disabled={currentIdx === 0} onClick={() => setCurrentIdx(currentIdx - 1)}
            className="btn-secondary flex-1 py-2.5 text-sm disabled:opacity-30">Trước</button>
          {currentIdx < questions.length - 1 ? (
            <button onClick={() => setCurrentIdx(currentIdx + 1)} className="btn-primary flex-1 py-2.5 text-sm">Sau</button>
          ) : (
            <button onClick={() => setShowConfirm(true)}
              className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white"
              style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}>Nộp bài</button>
          )}
        </div>
      </div>

      {/* Submit confirmation modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 modal-overlay">
          <div className="bg-white rounded-2xl w-full max-w-sm p-7 text-center modal-content" style={{ boxShadow: 'var(--shadow-xl)' }}>
            <div className="w-16 h-16 mx-auto rounded-2xl flex items-center justify-center mb-4" style={{ background: 'var(--amber-soft)' }}>
              <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7" style={{ color: 'var(--amber-warm)' }}>
                <path d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <h3 className="font-display text-lg font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Nộp bài?</h3>
            <p className="text-sm mb-1" style={{ color: 'var(--text-secondary)' }}>
              Đã trả lời: <span className="font-bold" style={{ color: 'var(--success)' }}>{answeredCount}</span> / {questions.length} câu
            </p>
            {answeredCount < questions.length && (
              <p className="text-xs font-medium mb-4" style={{ color: 'var(--amber-warm)' }}>
                Còn {questions.length - answeredCount} câu chưa trả lời
              </p>
            )}
            <div className="flex gap-3 mt-5">
              <button onClick={() => setShowConfirm(false)} className="btn-secondary flex-1 py-2.5 text-sm">
                Tiếp tục làm
              </button>
              <button onClick={() => { setShowConfirm(false); handleSubmit(); }} disabled={submitting}
                className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white transition-all disabled:opacity-50"
                style={{ background: 'linear-gradient(135deg, #10b981, #059669)', boxShadow: '0 4px 14px rgba(16,185,129,0.25)' }}>
                {submitting ? 'Đang nộp...' : 'Nộp bài'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoQuiz;
