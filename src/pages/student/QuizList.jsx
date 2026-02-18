import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';
import StudentLayout from '../../components/StudentLayout';

const QuizList = () => {
  const navigate = useNavigate();
  const [officialQuizzes, setOfficialQuizzes] = useState([]);
  const [practiceQuizzes, setPracticeQuizzes] = useState([]);
  const [attempts, setAttempts] = useState({});
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('official');
  const [showBuilder, setShowBuilder] = useState(false);

  // Practice quiz builder state
  const [filterOptions, setFilterOptions] = useState({ subjects: [], topics: [], grades: [] });
  const [builderForm, setBuilderForm] = useState({
    title: '', duration: 30,
    randomConfig: [{ subject: '', topic: '', grade: '', difficulty: '', count: 10 }]
  });
  const [builderMsg, setBuilderMsg] = useState('');

  const fetchQuizzes = async () => {
    try {
      setLoading(true);
      const res = await axiosClient.get('/my-quizzes');
      setOfficialQuizzes(res.data.officialQuizzes || []);
      setPracticeQuizzes(res.data.practiceQuizzes || []);
      setAttempts(res.data.attempts || {});
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchFilters = async () => {
    try {
      const res = await axiosClient.get('/questions/filters');
      setFilterOptions(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => { fetchQuizzes(); fetchFilters(); }, []);

  const handleStartQuiz = async (quizId) => {
    try {
      const res = await axiosClient.post(`/quizzes/${quizId}/start`);
      navigate(`/student/quiz/${res.data.attempt._id}`);
    } catch (err) {
      alert(err.response?.data?.message || 'Lỗi khi bắt đầu quiz');
    }
  };

  const updateBuilderConfig = (index, field, value) => {
    const newConfig = [...builderForm.randomConfig];
    newConfig[index] = { ...newConfig[index], [field]: value };
    setBuilderForm({ ...builderForm, randomConfig: newConfig });
  };

  const addBuilderCriteria = () => {
    setBuilderForm({ ...builderForm, randomConfig: [...builderForm.randomConfig, { subject: '', topic: '', grade: '', difficulty: '', count: 5 }] });
  };

  const removeBuilderCriteria = (index) => {
    if (builderForm.randomConfig.length <= 1) return;
    setBuilderForm({ ...builderForm, randomConfig: builderForm.randomConfig.filter((_, i) => i !== index) });
  };

  const handleCreatePractice = async (e) => {
    e.preventDefault();
    setBuilderMsg('');
    try {
      const data = {
        title: builderForm.title || 'Bài luyện tập',
        duration: Number(builderForm.duration),
        randomConfig: builderForm.randomConfig.map(r => ({
          ...r,
          grade: r.grade ? Number(r.grade) : undefined,
          count: Number(r.count)
        }))
      };
      const res = await axiosClient.post('/practice-quizzes', data);
      // Auto-start the quiz
      const startRes = await axiosClient.post(`/quizzes/${res.data.quiz._id}/start`);
      navigate(`/student/quiz/${startRes.data.attempt._id}`);
    } catch (err) {
      setBuilderMsg(err.response?.data?.message || 'Lỗi tạo bài luyện tập');
    }
  };

  const getAttemptBadge = (quizId) => {
    const a = attempts[quizId];
    if (!a) return null;
    if (a.status === 'submitted') {
      return (
        <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${a.percentage >= 80 ? 'bg-green-100 text-green-700' : a.percentage >= 50 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
          {a.score}/{a.totalQuestions} ({a.percentage}%)
        </span>
      );
    }
    return <span className="text-xs px-2.5 py-1 rounded-full bg-blue-100 text-blue-700 font-medium">Đang làm</span>;
  };

  const renderQuizCard = (quiz) => {
    const attempt = attempts[quiz._id];
    const isSubmitted = attempt?.status === 'submitted';
    const isInProgress = attempt?.status === 'in_progress';

    return (
      <div key={quiz._id} className="bg-white rounded-xl border overflow-hidden transition-all hover:shadow-md" style={{ borderColor: '#e5ddd0' }}>
        <div className="p-5">
          <div className="flex items-start justify-between mb-3">
            <h3 className="font-semibold text-gray-800">{quiz.title}</h3>
            {getAttemptBadge(quiz._id)}
          </div>

          <div className="flex flex-wrap gap-2 mb-4">
            <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">⏱ {quiz.duration} phút</span>
            {quiz.classIds?.map(c => (
              <span key={c._id || c} className="text-xs px-2 py-0.5 rounded-full bg-amber-50 text-amber-700">
                {c.name || 'Lớp học'}
              </span>
            ))}
            {quiz.endTime && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-red-50 text-red-700">
                Hạn: {new Date(quiz.endTime).toLocaleDateString('vi-VN')}
              </span>
            )}
          </div>

          {isSubmitted ? (
            <Link to={`/student/quiz-result/${attempt._id}`}
              className="block w-full text-center py-2.5 rounded-lg text-sm font-semibold transition-all border"
              style={{ borderColor: '#d6ccc0', color: '#78716c' }}>
              Xem kết quả
            </Link>
          ) : (
            <button onClick={() => handleStartQuiz(quiz._id)}
              className="w-full py-2.5 rounded-lg text-sm font-semibold text-white transition-all hover:shadow-lg"
              style={{ background: isInProgress ? '#3b82f6' : '#e8850a' }}>
              {isInProgress ? '▶ Tiếp tục làm' : '🚀 Bắt đầu'}
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <StudentLayout>
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: '#1c1917' }}>Bài kiểm tra</h1>
          <p className="text-sm mt-1" style={{ color: '#78716c' }}>Làm bài kiểm tra hoặc tự luyện tập</p>
        </div>
        <button onClick={() => setShowBuilder(true)}
          className="px-5 py-2.5 rounded-lg text-sm font-semibold text-white transition-all hover:shadow-lg"
          style={{ background: '#e8850a' }}>
          ✨ Tạo bài luyện tập
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-white rounded-xl border p-1 mb-6" style={{ borderColor: '#e5ddd0' }}>
        <button onClick={() => setTab('official')}
          className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${tab === 'official' ? 'text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          style={tab === 'official' ? { background: '#e8850a' } : {}}>
          📋 Bài kiểm tra ({officialQuizzes.length})
        </button>
        <button onClick={() => setTab('practice')}
          className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${tab === 'practice' ? 'text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          style={tab === 'practice' ? { background: '#e8850a' } : {}}>
          🎯 Tự luyện tập ({practiceQuizzes.length})
        </button>
      </div>

      {loading ? (
        <div className="text-center py-16 text-gray-400">Đang tải...</div>
      ) : (
        <>
          {tab === 'official' && (
            officialQuizzes.length === 0 ? (
              <div className="text-center py-16">
                <div className="text-5xl mb-4">📭</div>
                <h3 className="text-lg font-medium text-gray-600">Chưa có bài kiểm tra nào</h3>
                <p className="text-gray-400 mt-2">Giáo viên sẽ giao bài kiểm tra cho lớp của bạn</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {officialQuizzes.map(renderQuizCard)}
              </div>
            )
          )}

          {tab === 'practice' && (
            practiceQuizzes.length === 0 ? (
              <div className="text-center py-16">
                <div className="text-5xl mb-4">🎯</div>
                <h3 className="text-lg font-medium text-gray-600">Chưa có bài luyện tập</h3>
                <p className="text-gray-400 mt-2">Tạo bài luyện tập từ ngân hàng câu hỏi</p>
                <button onClick={() => setShowBuilder(true)}
                  className="mt-4 px-5 py-2.5 rounded-lg text-sm font-semibold text-white transition-all"
                  style={{ background: '#e8850a' }}>
                  ✨ Tạo ngay
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {practiceQuizzes.map(renderQuizCard)}
              </div>
            )
          )}
        </>
      )}

      {/* === PRACTICE QUIZ BUILDER MODAL === */}
      {showBuilder && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-10 px-4" style={{ background: 'rgba(0,0,0,0.5)' }}>
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-white px-6 py-4 border-b flex items-center justify-between z-10" style={{ borderColor: '#e5ddd0' }}>
              <h2 className="text-lg font-bold" style={{ color: '#1c1917' }}>✨ Tạo bài luyện tập</h2>
              <button onClick={() => setShowBuilder(false)} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
            </div>

            <form onSubmit={handleCreatePractice} className="p-6 space-y-5">
              {builderMsg && (
                <div className="px-4 py-3 rounded-lg text-sm font-medium bg-red-50 text-red-700 border border-red-200">{builderMsg}</div>
              )}

              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-semibold mb-1.5" style={{ color: '#44403c' }}>Tên bài</label>
                  <input value={builderForm.title} onChange={e => setBuilderForm({ ...builderForm, title: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2 text-sm" style={{ borderColor: '#d6ccc0' }}
                    placeholder="VD: Luyện Toán đại số" />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1.5" style={{ color: '#44403c' }}>Phút</label>
                  <input type="number" value={builderForm.duration} onChange={e => setBuilderForm({ ...builderForm, duration: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2 text-sm" style={{ borderColor: '#d6ccc0' }} min={5} />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: '#44403c' }}>
                  Chọn loại câu hỏi
                </label>
                <div className="space-y-3">
                  {builderForm.randomConfig.map((rc, i) => (
                    <div key={i} className="border rounded-xl p-3 space-y-2" style={{ borderColor: '#e5ddd0' }}>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-gray-400">Nhóm #{i + 1}</span>
                        {builderForm.randomConfig.length > 1 && (
                          <button type="button" onClick={() => removeBuilderCriteria(i)}
                            className="text-red-400 hover:text-red-600 text-xs">✕</button>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <input value={rc.topic} onChange={e => updateBuilderConfig(i, 'topic', e.target.value)}
                          className="border rounded-lg px-2 py-1.5 text-sm" style={{ borderColor: '#d6ccc0' }}
                          placeholder="Chủ đề (VD: Đại số, Hình học)" />
                        <select value={rc.grade} onChange={e => updateBuilderConfig(i, 'grade', e.target.value)}
                          className="border rounded-lg px-2 py-1.5 text-sm" style={{ borderColor: '#d6ccc0' }}>
                          <option value="">Lớp</option>
                          {filterOptions.grades.map(g => <option key={g} value={g}>Lớp {g}</option>)}
                        </select>
                        <select value={rc.difficulty} onChange={e => updateBuilderConfig(i, 'difficulty', e.target.value)}
                          className="border rounded-lg px-2 py-1.5 text-sm" style={{ borderColor: '#d6ccc0' }}>
                          <option value="">Độ khó</option>
                          <option value="easy">Dễ</option>
                          <option value="medium">Trung bình</option>
                          <option value="hard">Khó</option>
                        </select>
                      </div>
                      <div className="flex items-center gap-2">
                        <label className="text-xs text-gray-500">Số câu:</label>
                        <input type="number" value={rc.count} onChange={e => updateBuilderConfig(i, 'count', e.target.value)}
                          className="w-20 border rounded-lg px-2 py-1 text-sm" style={{ borderColor: '#d6ccc0' }} min={1} />
                      </div>
                    </div>
                  ))}
                </div>
                <button type="button" onClick={addBuilderCriteria}
                  className="mt-2 text-sm font-medium px-3 py-1.5 rounded-lg border border-dashed hover:bg-gray-50"
                  style={{ borderColor: '#d6ccc0', color: '#78716c' }}>
                  + Thêm nhóm câu hỏi
                </button>
              </div>

              <button type="submit"
                className="w-full py-3 rounded-lg text-sm font-semibold text-white transition-all hover:shadow-lg"
                style={{ background: '#e8850a' }}>
                🚀 Tạo & Bắt đầu làm bài
              </button>
            </form>
          </div>
        </div>
      )}
    </StudentLayout>
  );
};

export default QuizList;
