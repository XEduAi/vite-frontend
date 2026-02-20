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
      const cls = a.percentage >= 80 ? 'badge-green' : a.percentage >= 50 ? 'badge-amber' : 'badge-red';
      return <span className={`badge ${cls}`}>{a.score}/{a.totalQuestions} ({a.percentage}%)</span>;
    }
    return <span className="badge badge-blue">Đang làm</span>;
  };

  const renderQuizCard = (quiz) => {
    const attempt = attempts[quiz._id];
    const isSubmitted = attempt?.status === 'submitted';
    const isInProgress = attempt?.status === 'in_progress';

    return (
      <div key={quiz._id} className="card p-5 transition-all hover:shadow-lg group">
        <div className="flex items-start justify-between mb-3">
          <h3 className="font-display font-bold text-[15px]" style={{ color: 'var(--text-primary)' }}>{quiz.title}</h3>
          {getAttemptBadge(quiz._id)}
        </div>

        <div className="flex flex-wrap gap-2 mb-5">
          <span className="badge badge-blue">
            <svg viewBox="0 0 16 16" fill="currentColor" className="w-3 h-3"><path fillRule="evenodd" d="M1 8a7 7 0 1114 0A7 7 0 011 8zm7.75-4.25a.75.75 0 00-1.5 0V8c0 .414.336.75.75.75h3.25a.75.75 0 000-1.5h-2.5v-3.5z" clipRule="evenodd" /></svg>
            {quiz.duration} phút
          </span>
          {quiz.classIds?.map(c => (
            <span key={c._id || c} className="badge badge-amber">{c.name || 'Lớp học'}</span>
          ))}
          {quiz.endTime && (
            <span className="badge badge-red">
              Hạn: {new Date(quiz.endTime).toLocaleDateString('vi-VN')}
            </span>
          )}
        </div>

        {isSubmitted ? (
          <Link to={`/student/quiz-result/${attempt._id}`} className="btn-secondary block w-full text-center py-2.5 text-sm">
            Xem kết quả
          </Link>
        ) : (
          <button onClick={() => handleStartQuiz(quiz._id)} className="btn-primary w-full py-2.5 text-sm">
            {isInProgress ? 'Tiếp tục làm bài' : 'Bắt đầu làm bài'}
          </button>
        )}
      </div>
    );
  };

  return (
    <StudentLayout>
      <div className="mb-7 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>Bài kiểm tra</h1>
          <p className="text-sm mt-1.5" style={{ color: 'var(--text-secondary)' }}>Làm bài kiểm tra hoặc tự luyện tập</p>
        </div>
        <button onClick={() => setShowBuilder(true)} className="btn-primary flex items-center gap-2 py-2.5 px-5">
          <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" /></svg>
          Tạo bài luyện tập
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl mb-6 card" style={{ padding: 4 }}>
        {[
          { key: 'official', label: 'Bài kiểm tra', count: officialQuizzes.length, icon: '📋' },
          { key: 'practice', label: 'Tự luyện tập', count: practiceQuizzes.length, icon: '🎯' },
        ].map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`tab-pill flex-1 flex items-center justify-center gap-2 py-2.5 ${tab === t.key ? 'active' : ''}`}
            style={tab !== t.key ? { color: 'var(--text-secondary)' } : {}}
          >
            {t.label} ({t.count})
          </button>
        ))}
      </div>

      {loading ? (
        <div className="py-20 text-center">
          <div className="inline-flex items-center gap-3 px-5 py-3 rounded-2xl card">
            <svg className="animate-spin w-5 h-5" style={{ color: 'var(--amber)' }} viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Đang tải...</span>
          </div>
        </div>
      ) : (
        <>
          {tab === 'official' && (
            officialQuizzes.length === 0 ? (
              <div className="text-center py-20 fade-in-up">
                <div className="w-20 h-20 mx-auto rounded-2xl flex items-center justify-center mb-5" style={{ background: '#f1f5f9' }}>
                  <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8" style={{ color: 'var(--text-muted)' }}>
                    <path d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <h3 className="font-display font-bold text-lg" style={{ color: 'var(--text-primary)' }}>Chưa có bài kiểm tra nào</h3>
                <p className="text-sm mt-2" style={{ color: 'var(--text-muted)' }}>Giáo viên sẽ giao bài kiểm tra cho lớp của bạn</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 stagger-children">
                {officialQuizzes.map(renderQuizCard)}
              </div>
            )
          )}

          {tab === 'practice' && (
            practiceQuizzes.length === 0 ? (
              <div className="text-center py-20 fade-in-up">
                <div className="w-20 h-20 mx-auto rounded-2xl flex items-center justify-center mb-5" style={{ background: 'var(--amber-soft)' }}>
                  <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8" style={{ color: 'var(--amber-warm)' }}>
                    <path d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.631 8.41m5.96 5.96a14.926 14.926 0 01-5.841 2.58m-.119-8.54a6 6 0 00-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 00-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 01-2.448-2.448 14.9 14.9 0 01.06-.312m-2.24 2.39a4.493 4.493 0 00-1.757 4.306 4.493 4.493 0 004.306-1.758M16.5 9a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <h3 className="font-display font-bold text-lg" style={{ color: 'var(--text-primary)' }}>Chưa có bài luyện tập</h3>
                <p className="text-sm mt-2" style={{ color: 'var(--text-muted)' }}>Tạo bài luyện tập từ ngân hàng câu hỏi</p>
                <button onClick={() => setShowBuilder(true)} className="btn-primary mt-5 py-2.5 px-6">
                  Tạo ngay
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 stagger-children">
                {practiceQuizzes.map(renderQuizCard)}
              </div>
            )
          )}
        </>
      )}

      {/* === PRACTICE QUIZ BUILDER MODAL === */}
      {showBuilder && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-10 px-4 modal-overlay">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto modal-content" style={{ boxShadow: 'var(--shadow-xl)' }}>
            <div className="sticky top-0 bg-white px-6 py-4 border-b flex items-center justify-between z-10" style={{ borderColor: 'var(--border)' }}>
              <h2 className="font-display text-lg font-bold" style={{ color: 'var(--text-primary)' }}>Tạo bài luyện tập</h2>
              <button onClick={() => setShowBuilder(false)} className="p-1.5 rounded-lg transition-all" style={{ color: 'var(--text-muted)', background: '#f1f5f9' }}>
                <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" /></svg>
              </button>
            </div>

            <form onSubmit={handleCreatePractice} className="p-6 space-y-5">
              {builderMsg && <div className="toast toast-error">{builderMsg}</div>}

              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Tên bài</label>
                  <input value={builderForm.title} onChange={e => setBuilderForm({ ...builderForm, title: e.target.value })}
                    className="input" placeholder="VD: Luyện Toán đại số" />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Phút</label>
                  <input type="number" value={builderForm.duration} onChange={e => setBuilderForm({ ...builderForm, duration: e.target.value })}
                    className="input" min={5} />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>Chọn loại câu hỏi</label>
                <div className="space-y-3">
                  {builderForm.randomConfig.map((rc, i) => (
                    <div key={i} className="card p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>Nhóm #{i + 1}</span>
                        {builderForm.randomConfig.length > 1 && (
                          <button type="button" onClick={() => removeBuilderCriteria(i)}
                            className="text-xs font-medium px-2 py-1 rounded-lg transition-all" style={{ color: 'var(--danger)', background: 'var(--danger-light)' }}>Xóa</button>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <input value={rc.topic} onChange={e => updateBuilderConfig(i, 'topic', e.target.value)}
                          className="input text-sm" placeholder="Chủ đề" />
                        <select value={rc.grade} onChange={e => updateBuilderConfig(i, 'grade', e.target.value)}
                          className="input text-sm">
                          <option value="">Lớp</option>
                          {filterOptions.grades.map(g => <option key={g} value={g}>Lớp {g}</option>)}
                        </select>
                        <select value={rc.difficulty} onChange={e => updateBuilderConfig(i, 'difficulty', e.target.value)}
                          className="input text-sm">
                          <option value="">Độ khó</option>
                          <option value="easy">Dễ</option>
                          <option value="medium">Trung bình</option>
                          <option value="hard">Khó</option>
                        </select>
                      </div>
                      <div className="flex items-center gap-2">
                        <label className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>Số câu:</label>
                        <input type="number" value={rc.count} onChange={e => updateBuilderConfig(i, 'count', e.target.value)}
                          className="input w-20 text-sm" min={1} />
                      </div>
                    </div>
                  ))}
                </div>
                <button type="button" onClick={addBuilderCriteria}
                  className="mt-3 btn-secondary text-sm py-2 px-4 border-dashed">
                  + Thêm nhóm câu hỏi
                </button>
              </div>

              <button type="submit" className="btn-primary w-full py-3">
                Tạo & Bắt đầu làm bài
              </button>
            </form>
          </div>
        </div>
      )}
    </StudentLayout>
  );
};

export default QuizList;
