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

  // Fetch attempt data
  useEffect(() => {
    const fetchAttempt = async () => {
      try {
        setLoading(true);
        const res = await axiosClient.get(`/attempts/${attemptId}`);
        const data = res.data.attempt;
        setAttempt(data);

        // Init answers from existing data
        const existingAnswers = {};
        data.questions?.forEach(q => {
          const qId = q.question?._id || q.question;
          if (q.selectedOption >= 0) {
            existingAnswers[qId] = q.selectedOption;
          }
        });
        setAnswers(existingAnswers);

        // Calculate remaining time
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

  // Timer countdown
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
  }, [timeLeft !== null]);

  // Auto-save every 15 seconds
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
    } catch (err) {
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
      // Save answers first
      const answerList = Object.entries(answers).map(([questionId, selectedOption]) => ({
        questionId, selectedOption
      }));
      if (answerList.length > 0) {
        await axiosClient.put(`/attempts/${attemptId}/save`, { answers: answerList });
      }
      // Submit
      const res = await axiosClient.post(`/attempts/${attemptId}/submit`);
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
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#f8f5f0' }}>
        <div className="text-center">
          <div className="text-4xl mb-3">⏳</div>
          <p className="text-gray-500">Đang tải câu hỏi...</p>
        </div>
      </div>
    );
  }

  if (!attempt || !attempt.questions?.length) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#f8f5f0' }}>
        <div className="text-center">
          <div className="text-4xl mb-3">❌</div>
          <p className="text-gray-600 font-medium">Không tìm thấy bài làm</p>
          <button onClick={() => navigate('/student/quizzes')}
            className="mt-4 px-5 py-2 rounded-lg text-sm font-medium border" style={{ borderColor: '#d6ccc0' }}>
            ← Quay lại
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

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#f8f5f0' }}>
      {/* Top bar */}
      <header className="sticky top-0 z-30 bg-white border-b shadow-sm" style={{ borderColor: '#e5ddd0' }}>
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => setShowConfirm(true)} className="text-gray-400 hover:text-gray-600 text-sm">✕</button>
            <h1 className="font-semibold text-sm text-gray-800 truncate max-w-[200px] md:max-w-none">
              {attempt.quiz?.title || 'Quiz'}
            </h1>
          </div>

          <div className="flex items-center gap-4">
            {/* Save status */}
            {saveStatus && (
              <span className="text-xs text-gray-400">
                {saveStatus === 'saving' ? '💾 Đang lưu...' : '✓ Đã lưu'}
              </span>
            )}

            {/* Timer */}
            {timeLeft !== null && (
              <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-mono font-bold ${isUrgent ? 'bg-red-100 text-red-700 animate-pulse' : 'bg-blue-50 text-blue-700'}`}>
                ⏱ {formatTime(timeLeft)}
              </div>
            )}

            {/* Progress */}
            <span className="text-xs font-medium px-2.5 py-1 rounded-full" style={{ background: '#fef8ee', color: '#e8850a' }}>
              {answeredCount}/{questions.length}
            </span>
          </div>
        </div>
      </header>

      <div className="flex-1 max-w-5xl mx-auto w-full px-4 py-6 flex gap-6">
        {/* Main question area */}
        <div className="flex-1">
          {questionData && (
            <div className="bg-white rounded-2xl border p-6 md:p-8" style={{ borderColor: '#e5ddd0' }}>
              {/* Question header */}
              <div className="flex items-center gap-3 mb-5">
                <span className="w-8 h-8 flex items-center justify-center rounded-lg text-xs font-bold text-white" style={{ background: '#e8850a' }}>
                  {currentIdx + 1}
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {questionData.subject && <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-600">{questionData.subject}</span>}
                  {questionData.topic && <span className="text-xs px-2 py-0.5 rounded-full bg-purple-50 text-purple-600">{questionData.topic}</span>}
                </div>
              </div>

              {/* Question content */}
              <div className="text-base leading-relaxed mb-6" style={{ color: '#1c1917' }}>
                <LatexRenderer text={questionData.content} />
              </div>

              {/* Media */}
              {questionData.mediaUrl && (
                <div className="mb-6">
                  <img src={questionData.mediaUrl} alt="" className="max-w-full rounded-xl border" style={{ borderColor: '#e5ddd0' }} />
                </div>
              )}

              {/* Options */}
              {questionData.type === 'mcq' && questionData.options && (
                <div className="space-y-2.5">
                  {questionData.options.map((opt, i) => {
                    const qId = questionData._id;
                    const isSelected = answers[qId] === i;
                    return (
                      <button key={i} onClick={() => handleSelectOption(qId, i)}
                        className={`w-full text-left flex items-center gap-3 px-4 py-3.5 rounded-xl border-2 transition-all ${isSelected ? 'border-amber-400 bg-amber-50 shadow-sm' : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'}`}>
                        <span className={`w-8 h-8 flex items-center justify-center rounded-full text-xs font-bold shrink-0 transition-colors ${isSelected ? 'bg-amber-500 text-white' : 'bg-gray-100 text-gray-500'}`}>
                          {String.fromCharCode(65 + i)}
                        </span>
                        <span className={`text-sm ${isSelected ? 'font-medium text-gray-800' : 'text-gray-600'}`}><LatexRenderer text={opt.text} /></span>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Nav buttons */}
              <div className="flex justify-between items-center mt-8 pt-5 border-t" style={{ borderColor: '#f5f0eb' }}>
                <button disabled={currentIdx === 0} onClick={() => setCurrentIdx(currentIdx - 1)}
                  className="px-4 py-2 rounded-lg text-sm font-medium border transition-colors disabled:opacity-30"
                  style={{ borderColor: '#d6ccc0', color: '#78716c' }}>
                  ← Câu trước
                </button>

                {currentIdx < questions.length - 1 ? (
                  <button onClick={() => setCurrentIdx(currentIdx + 1)}
                    className="px-5 py-2 rounded-lg text-sm font-semibold text-white transition-all hover:shadow-lg"
                    style={{ background: '#e8850a' }}>
                    Câu sau →
                  </button>
                ) : (
                  <button onClick={() => setShowConfirm(true)}
                    className="px-5 py-2 rounded-lg text-sm font-semibold text-white transition-all hover:shadow-lg bg-green-600">
                    ✓ Nộp bài
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right sidebar: question nav */}
        <div className="hidden md:block w-56 shrink-0">
          <div className="bg-white rounded-xl border p-4 sticky top-20" style={{ borderColor: '#e5ddd0' }}>
            <h4 className="text-xs font-semibold text-gray-400 mb-3">DANH SÁCH CÂU HỎI</h4>
            <div className="grid grid-cols-5 gap-1.5">
              {questions.map((q, i) => {
                const qId = q.question?._id || q.question;
                const isAnswered = answers[qId] !== undefined;
                const isCurrent = i === currentIdx;
                return (
                  <button key={i} onClick={() => setCurrentIdx(i)}
                    className={`w-9 h-9 flex items-center justify-center rounded-lg text-xs font-semibold transition-all ${isCurrent ? 'text-white shadow-sm' : isAnswered ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-gray-50 text-gray-400 border border-gray-200 hover:border-gray-300'}`}
                    style={isCurrent ? { background: '#e8850a' } : {}}>
                    {i + 1}
                  </button>
                );
              })}
            </div>

            <div className="mt-4 pt-3 border-t space-y-1.5" style={{ borderColor: '#f5f0eb' }}>
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <span className="w-3 h-3 rounded bg-green-100 border border-green-200"></span> Đã trả lời ({answeredCount})
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <span className="w-3 h-3 rounded bg-gray-50 border border-gray-200"></span> Chưa trả lời ({questions.length - answeredCount})
              </div>
            </div>

            <button onClick={() => setShowConfirm(true)}
              className="w-full mt-4 py-2.5 rounded-lg text-sm font-semibold text-white transition-all hover:shadow-lg bg-green-600">
              ✓ Nộp bài
            </button>
          </div>
        </div>
      </div>

      {/* Submit confirmation modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4" style={{ background: 'rgba(0,0,0,0.5)' }}>
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 text-center shadow-2xl">
            <div className="text-4xl mb-3">📝</div>
            <h3 className="text-lg font-bold mb-2" style={{ color: '#1c1917' }}>Nộp bài?</h3>
            <p className="text-sm text-gray-500 mb-1">
              Đã trả lời: <span className="font-semibold text-green-600">{answeredCount}</span> / {questions.length} câu
            </p>
            {answeredCount < questions.length && (
              <p className="text-xs text-amber-600 mb-4">
                ⚠ Còn {questions.length - answeredCount} câu chưa trả lời
              </p>
            )}
            <div className="flex gap-3 mt-5">
              <button onClick={() => setShowConfirm(false)}
                className="flex-1 py-2.5 rounded-lg text-sm font-medium border hover:bg-gray-50"
                style={{ borderColor: '#d6ccc0', color: '#78716c' }}>
                Tiếp tục làm
              </button>
              <button onClick={() => { setShowConfirm(false); handleSubmit(); }} disabled={submitting}
                className="flex-1 py-2.5 rounded-lg text-sm font-semibold text-white transition-all bg-green-600 hover:bg-green-700 disabled:opacity-50">
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
