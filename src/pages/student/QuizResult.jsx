import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';
import StudentLayout from '../../components/StudentLayout';
import LatexRenderer from '../../components/LatexRenderer';

const QuizResult = () => {
  const { attemptId } = useParams();
  const [attempt, setAttempt] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResult = async () => {
      try {
        setLoading(true);
        const res = await axiosClient.get(`/attempts/${attemptId}/result`);
        setAttempt(res.data.attempt);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchResult();
  }, [attemptId]);

  if (loading) {
    return (
      <StudentLayout>
        <div className="py-20 text-center">
          <div className="inline-flex items-center gap-3 px-5 py-3 rounded-2xl card">
            <svg className="animate-spin w-5 h-5" style={{ color: 'var(--amber)' }} viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Đang tải kết quả...</span>
          </div>
        </div>
      </StudentLayout>
    );
  }

  if (!attempt) {
    return (
      <StudentLayout>
        <div className="py-20 text-center fade-in-up">
          <div className="w-16 h-16 mx-auto rounded-2xl flex items-center justify-center mb-4" style={{ background: 'var(--danger-light)' }}>
            <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7" style={{ color: 'var(--danger)' }}>
              <path d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h3 className="font-display font-bold text-lg" style={{ color: 'var(--text-primary)' }}>Không tìm thấy kết quả</h3>
          <Link to="/student/quizzes" className="btn-secondary inline-flex items-center gap-1.5 mt-4 py-2 px-5 text-sm">
            Quay lại
          </Link>
        </div>
      </StudentLayout>
    );
  }

  const { score, totalQuestions, percentage, questions, quiz } = attempt;
  const getGrade = () => {
    if (percentage >= 90) return { text: 'Xuất sắc!', color: '#059669', bg: '#d1fae5', gradient: 'linear-gradient(135deg, #d1fae5, #a7f3d0)', icon: 'M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z' };
    if (percentage >= 80) return { text: 'Giỏi!', color: '#2563eb', bg: '#dbeafe', gradient: 'linear-gradient(135deg, #dbeafe, #bfdbfe)', icon: 'M6.633 10.5c.806 0 1.533-.446 2.031-1.08a9.041 9.041 0 012.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 00.322-1.672V3.75a.75.75 0 01.75-.75A2.25 2.25 0 0116.5 5.25c0 1.152-.26 2.243-.723 3.218-.266.558.107 1.282.725 1.282h3.126c1.026 0 1.945.694 2.054 1.715.045.422.068.85.068 1.285a11.95 11.95 0 01-2.649 7.521c-.388.482-.987.729-1.605.729H13.48c-.483 0-.964-.078-1.423-.23l-3.114-1.04a4.501 4.501 0 00-1.423-.23H5.904M14.25 9h2.25M5.904 18.75c.083.205.173.405.27.602.197.4-.078.898-.523.898h-.908c-.889 0-1.713-.518-1.972-1.368a12 12 0 01-.521-3.507c0-1.553.295-3.036.831-4.398C3.387 9.953 4.167 9.5 5 9.5h1.053c.472 0 .745.556.5.96a8.958 8.958 0 00-1.302 4.665c0 1.194.232 2.333.654 3.375z' };
    if (percentage >= 65) return { text: 'Khá tốt!', color: '#d97706', bg: '#fef3c7', gradient: 'linear-gradient(135deg, #fef3c7, #fde68a)', icon: 'M15.182 15.182a4.5 4.5 0 01-6.364 0M21 12a9 9 0 11-18 0 9 9 0 0118 0zM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75zm-.375 0h.008v.015h-.008V9.75zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75zm-.375 0h.008v.015h-.008V9.75z' };
    if (percentage >= 50) return { text: 'Trung bình', color: '#ea580c', bg: '#fff7ed', gradient: 'linear-gradient(135deg, #fff7ed, #fed7aa)', icon: 'M15.182 16.318A4.486 4.486 0 0012.016 15a4.486 4.486 0 00-3.198 1.318M21 12a9 9 0 11-18 0 9 9 0 0118 0zM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75zm-.375 0h.008v.015h-.008V9.75zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75zm-.375 0h.008v.015h-.008V9.75z' };
    return { text: 'Cần cố gắng hơn', color: '#dc2626', bg: '#fef2f2', gradient: 'linear-gradient(135deg, #fef2f2, #fecaca)', icon: 'M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z' };
  };
  const grade = getGrade();

  return (
    <StudentLayout>
      <div className="max-w-3xl mx-auto">
        {/* Result banner */}
        <div className="rounded-2xl p-8 md:p-10 text-center mb-8 relative overflow-hidden fade-in-up" style={{ background: grade.gradient }}>
          {/* Decorative elements */}
          <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full" style={{ background: grade.color, opacity: 0.05 }} />
          <div className="absolute -bottom-10 -left-10 w-32 h-32 rounded-full" style={{ background: grade.color, opacity: 0.05 }} />

          <div className="relative z-10">
            <div className="w-20 h-20 mx-auto rounded-2xl flex items-center justify-center mb-5" style={{ background: `${grade.color}15` }}>
              <svg viewBox="0 0 24 24" fill="none" className="w-9 h-9" style={{ color: grade.color }}>
                <path d={grade.icon} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <h1 className="font-display text-2xl md:text-3xl font-bold mb-1" style={{ color: grade.color }}>{grade.text}</h1>
            <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>{quiz?.title || 'Bài kiểm tra'}</p>

            <div className="flex items-center justify-center gap-8">
              <div className="text-center">
                <div className="font-display text-4xl font-bold" style={{ color: grade.color }}>{percentage}%</div>
                <div className="text-xs font-medium mt-1" style={{ color: 'var(--text-muted)' }}>Tỷ lệ đúng</div>
              </div>
              <div className="w-px h-14" style={{ background: `${grade.color}20` }} />
              <div className="text-center">
                <div className="font-display text-4xl font-bold" style={{ color: 'var(--text-primary)' }}>
                  {score}<span className="text-lg" style={{ color: 'var(--text-muted)' }}>/{totalQuestions}</span>
                </div>
                <div className="text-xs font-medium mt-1" style={{ color: 'var(--text-muted)' }}>Câu đúng</div>
              </div>
            </div>
          </div>
        </div>

        {/* Question review */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-display text-lg font-bold" style={{ color: 'var(--text-primary)' }}>Chi tiết bài làm</h2>
          <Link to="/student/quizzes" className="btn-secondary py-2 px-4 text-sm">
            Quay lại
          </Link>
        </div>

        <div className="space-y-4 stagger-children">
          {questions.map((item, idx) => {
            const q = item.question;
            if (!q) return null;

            const studentAnswer = item.selectedOption;
            const isCorrect = item.isCorrect;
            const isUnanswered = studentAnswer < 0;

            return (
              <div key={item._id || idx} className="card overflow-hidden" style={{ borderColor: isCorrect ? '#a7f3d0' : '#fecaca' }}>
                <div className="p-5 md:p-6">
                  <div className="flex items-start gap-3 mb-4">
                    <span className="w-8 h-8 flex items-center justify-center rounded-lg text-xs font-bold text-white shrink-0"
                      style={{ background: isCorrect ? 'linear-gradient(135deg, #10b981, #059669)' : 'linear-gradient(135deg, #ef4444, #dc2626)' }}>
                      {idx + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}><LatexRenderer text={q.content} /></div>
                      <div className="flex gap-1.5 mt-2">
                        {q.subject && <span className="badge badge-blue">{q.subject}</span>}
                        {q.topic && <span className="badge badge-purple">{q.topic}</span>}
                      </div>
                    </div>
                    <span className="shrink-0">
                      {isCorrect ? (
                        <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5" style={{ color: 'var(--success)' }}><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" /></svg>
                      ) : isUnanswered ? (
                        <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5" style={{ color: 'var(--text-muted)' }}><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" /></svg>
                      ) : (
                        <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5" style={{ color: 'var(--danger)' }}><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" /></svg>
                      )}
                    </span>
                  </div>

                  {q.mediaUrl && (
                    <div className="mb-3 ml-11">
                      <img src={q.mediaUrl} alt="" className="max-w-md rounded-xl border" style={{ borderColor: 'var(--border)' }} />
                    </div>
                  )}

                  {q.type === 'mcq' && q.options && (
                    <div className="space-y-2 ml-11">
                      {q.options.map((opt, i) => {
                        const isStudentChoice = studentAnswer === i;
                        const isCorrectOpt = opt.isCorrect;
                        let bg = '#f8fafc';
                        let border = 'var(--border)';
                        let color = 'var(--text-secondary)';
                        if (isCorrectOpt) { bg = '#d1fae5'; border = '#a7f3d0'; color = '#065f46'; }
                        if (isStudentChoice && !isCorrectOpt) { bg = '#fee2e2'; border = '#fecaca'; color = '#991b1b'; }

                        return (
                          <div key={i} className="flex items-center gap-2.5 text-sm px-4 py-2.5 rounded-xl border"
                            style={{ background: bg, borderColor: border, color, textDecoration: isStudentChoice && !isCorrectOpt ? 'line-through' : 'none' }}>
                            <span className="w-6 h-6 flex items-center justify-center rounded-full text-[10px] font-bold"
                              style={{
                                background: isCorrectOpt ? '#a7f3d0' : isStudentChoice ? '#fecaca' : '#e2e8f0',
                                color: isCorrectOpt ? '#065f46' : isStudentChoice ? '#991b1b' : 'var(--text-muted)',
                              }}>
                              {String.fromCharCode(65 + i)}
                            </span>
                            <span className="flex-1"><LatexRenderer text={opt.text} /></span>
                            {isCorrectOpt && <span className="text-xs font-semibold shrink-0" style={{ color: '#059669' }}>Đáp án đúng</span>}
                            {isStudentChoice && !isCorrectOpt && <span className="text-xs font-semibold shrink-0" style={{ color: '#dc2626' }}>Bạn chọn</span>}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {q.explanation && (
                    <div className="mt-3 ml-11 rounded-xl p-4 text-sm" style={{ background: 'var(--info-light)', color: '#1e40af' }}>
                      <span className="font-bold">Giải thích: </span><LatexRenderer text={q.explanation} />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </StudentLayout>
  );
};

export default QuizResult;
