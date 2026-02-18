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
        <div className="text-center py-16 text-gray-400">Đang tải kết quả...</div>
      </StudentLayout>
    );
  }

  if (!attempt) {
    return (
      <StudentLayout>
        <div className="text-center py-16">
          <div className="text-5xl mb-4">❌</div>
          <h3 className="text-lg font-medium text-gray-600">Không tìm thấy kết quả</h3>
          <Link to="/student/quizzes" className="mt-4 inline-block px-5 py-2 rounded-lg text-sm font-medium border" style={{ borderColor: '#d6ccc0' }}>
            ← Quay lại
          </Link>
        </div>
      </StudentLayout>
    );
  }

  const { score, totalQuestions, percentage, questions, quiz } = attempt;
  const getGrade = () => {
    if (percentage >= 90) return { emoji: '🏆', text: 'Xuất sắc!', color: 'text-green-600', bg: 'bg-green-50' };
    if (percentage >= 80) return { emoji: '🎉', text: 'Giỏi!', color: 'text-blue-600', bg: 'bg-blue-50' };
    if (percentage >= 65) return { emoji: '👍', text: 'Khá!', color: 'text-amber-600', bg: 'bg-amber-50' };
    if (percentage >= 50) return { emoji: '📚', text: 'Trung bình', color: 'text-orange-600', bg: 'bg-orange-50' };
    return { emoji: '💪', text: 'Cần cố gắng hơn', color: 'text-red-600', bg: 'bg-red-50' };
  };
  const grade = getGrade();

  return (
    <StudentLayout>
      <div className="max-w-3xl mx-auto">
        {/* Result banner */}
        <div className={`rounded-2xl p-8 text-center mb-8 ${grade.bg}`}>
          <div className="text-6xl mb-3">{grade.emoji}</div>
          <h1 className={`text-2xl font-bold mb-1 ${grade.color}`}>{grade.text}</h1>
          <p className="text-sm text-gray-500 mb-4">{quiz?.title || 'Bài kiểm tra'}</p>

          <div className="flex items-center justify-center gap-8">
            <div className="text-center">
              <div className={`text-4xl font-bold ${grade.color}`}>{percentage}%</div>
              <div className="text-xs text-gray-400 mt-1">Tỷ lệ đúng</div>
            </div>
            <div className="w-px h-12 bg-gray-200"></div>
            <div className="text-center">
              <div className="text-4xl font-bold text-gray-700">{score}<span className="text-lg text-gray-400">/{totalQuestions}</span></div>
              <div className="text-xs text-gray-400 mt-1">Câu đúng</div>
            </div>
          </div>
        </div>

        {/* Question review */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold" style={{ color: '#1c1917' }}>Chi tiết bài làm</h2>
          <Link to="/student/quizzes" className="text-sm font-medium px-4 py-2 rounded-lg border hover:bg-gray-50"
            style={{ borderColor: '#d6ccc0', color: '#78716c' }}>
            ← Quay lại
          </Link>
        </div>

        <div className="space-y-4">
          {questions.map((item, idx) => {
            const q = item.question;
            if (!q) return null;

            const correctIndex = q.options?.findIndex(o => o.isCorrect);
            const studentAnswer = item.selectedOption;
            const isCorrect = item.isCorrect;
            const isUnanswered = studentAnswer < 0;

            return (
              <div key={item._id || idx} className={`bg-white rounded-xl border overflow-hidden ${isCorrect ? 'border-green-200' : 'border-red-200'}`}>
                <div className="p-5">
                  <div className="flex items-start gap-3 mb-4">
                    <span className={`w-7 h-7 flex items-center justify-center rounded-lg text-xs font-bold text-white shrink-0 ${isCorrect ? 'bg-green-500' : 'bg-red-500'}`}>
                      {idx + 1}
                    </span>
                    <div>
                      <p className="text-sm font-medium text-gray-800"><LatexRenderer text={q.content} /></p>
                      <div className="flex gap-1.5 mt-1.5">
                        {q.subject && <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-600">{q.subject}</span>}
                        {q.topic && <span className="text-xs px-2 py-0.5 rounded-full bg-purple-50 text-purple-600">{q.topic}</span>}
                      </div>
                    </div>
                    <span className="ml-auto shrink-0">{isCorrect ? '✅' : isUnanswered ? '⬜' : '❌'}</span>
                  </div>

                  {/* Image */}
                  {q.mediaUrl && (
                    <div className="mb-3 ml-10">
                      <img src={q.mediaUrl} alt="" className="max-w-md rounded-xl border" style={{ borderColor: '#e5ddd0' }} />
                    </div>
                  )}

                  {/* Options review */}
                  {q.type === 'mcq' && q.options && (
                    <div className="space-y-1.5 ml-10">
                      {q.options.map((opt, i) => {
                        const isStudentChoice = studentAnswer === i;
                        const isCorrectOpt = opt.isCorrect;
                        let optClass = 'bg-gray-50 text-gray-500';
                        if (isCorrectOpt) optClass = 'bg-green-50 text-green-700 border-green-200 font-medium';
                        if (isStudentChoice && !isCorrectOpt) optClass = 'bg-red-50 text-red-700 border-red-200 line-through';

                        return (
                          <div key={i} className={`flex items-center gap-2 text-sm px-3 py-2 rounded-lg border ${optClass}`}
                            style={{ borderColor: isCorrectOpt ? undefined : isStudentChoice ? undefined : '#e5ddd0' }}>
                            <span className={`w-5 h-5 flex items-center justify-center rounded-full text-xs font-bold ${isCorrectOpt ? 'bg-green-200 text-green-700' : isStudentChoice ? 'bg-red-200 text-red-700' : 'bg-gray-200 text-gray-400'}`}>
                              {String.fromCharCode(65 + i)}
                            </span>
                            <LatexRenderer text={opt.text} />
                            {isCorrectOpt && <span className="ml-auto text-green-500 text-xs shrink-0">✓ Đáp án đúng</span>}
                            {isStudentChoice && !isCorrectOpt && <span className="ml-auto text-red-500 text-xs shrink-0">✗ Bạn chọn</span>}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Explanation */}
                  {q.explanation && (
                    <div className="mt-3 ml-10 bg-blue-50 rounded-lg p-3 text-sm text-blue-700">
                      <span className="font-semibold">💡 Giải thích: </span><LatexRenderer text={q.explanation} />
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
