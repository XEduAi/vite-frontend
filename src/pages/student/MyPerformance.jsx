import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';
import StudentLayout from '../../components/StudentLayout';

const difficultyLabel = { easy: 'Dễ', medium: 'Trung bình', hard: 'Khó' };
const difficultyColor = {
  easy: { bg: 'var(--success-light)', color: 'var(--success)' },
  medium: { bg: '#fef3c7', color: '#d97706' },
  hard: { bg: 'var(--danger-light)', color: 'var(--danger)' }
};

const MyPerformance = () => {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [smartLoading, setSmartLoading] = useState(false);

  useEffect(() => {
    fetchPerformance();
  }, []);

  const fetchPerformance = async () => {
    try {
      setLoading(true);
      const res = await axiosClient.get('/my-performance');
      setData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSmartPractice = async () => {
    try {
      setSmartLoading(true);
      const res = await axiosClient.post('/student/smart-practice');
      navigate(`/student/quiz/${res.data.attemptId}`);
    } catch (err) {
      alert(err.response?.data?.message || 'Không thể tạo bài luyện tập. Hãy làm thêm bài để có dữ liệu điểm yếu.');
      setSmartLoading(false);
    }
  };

  if (loading) {
    return (
      <StudentLayout>
        <div className="py-20 text-center">
          <div className="inline-flex items-center gap-3 px-5 py-3 rounded-2xl card">
            <svg className="animate-spin w-5 h-5" style={{ color: 'var(--amber)' }} viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Đang tải thống kê...</span>
          </div>
        </div>
      </StudentLayout>
    );
  }

  if (!data || data.summary.totalAttempts === 0) {
    return (
      <StudentLayout>
        <div className="max-w-3xl mx-auto">
          <div className="mb-6 fade-in">
            <h1 className="font-display text-2xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
              Thống kê học tập
            </h1>
          </div>
          <div className="card p-12 text-center fade-in-up">
            <div className="w-16 h-16 mx-auto rounded-2xl flex items-center justify-center mb-4" style={{ background: 'var(--amber-soft)' }}>
              <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7" style={{ color: 'var(--amber)' }}>
                <path d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <h3 className="font-display font-bold text-lg" style={{ color: 'var(--text-primary)' }}>Chưa có dữ liệu</h3>
            <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Hoàn thành các bài kiểm tra để xem thống kê học tập</p>
          </div>
        </div>
      </StudentLayout>
    );
  }

  const { summary, topicStats, difficultyStats, scoreHistory, recentAttempts } = data;
  const maxBarValue = Math.max(...scoreHistory.map(s => s.percentage), 1);

  return (
    <StudentLayout>
      <div className="max-w-4xl mx-auto">
        {/* Header + Smart Practice CTA */}
        <div className="flex items-start justify-between gap-4 mb-6 fade-in flex-wrap">
          <div>
            <h1 className="font-display text-2xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
              Thống kê học tập
            </h1>
            <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
              Theo dõi tiến trình và cải thiện kết quả học tập
            </p>
            {/* Weak topics hint */}
            {topicStats.length > 0 && (
              <p className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>
                Dựa trên kết quả:{' '}
                {topicStats.slice(0, 2).map((t, i) => (
                  <span key={t.topic}>
                    {i > 0 && ', '}
                    <span style={{ color: 'var(--danger)' }}>{t.topic} ({t.percentage}%)</span>
                  </span>
                ))}
              </p>
            )}
          </div>
          {topicStats.length > 0 && (
            <button
              onClick={handleSmartPractice}
              disabled={smartLoading}
              className="shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all"
              style={{
                background: smartLoading ? 'var(--border)' : 'linear-gradient(135deg, #f59e0b, #d97706)',
                color: 'white',
                opacity: smartLoading ? 0.7 : 1,
              }}>
              {smartLoading ? (
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : '🎯'}
              {smartLoading ? 'Đang tạo...' : 'Luyện tập điểm yếu'}
            </button>
          )}
          {/* Ask EduBot about performance */}
          <button
            onClick={() => navigate('/student/chat?contextType=performance&contextLabel=Điểm yếu của tôi')}
            className="shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all"
            style={{
              background: 'var(--amber-soft)',
              color: 'var(--amber)',
              border: '1px solid var(--amber)'
            }}
          >
            <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4">
              <path d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Hỏi EduBot
          </button>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6 stagger-children">
          <div className="card p-4 text-center">
            <div className="w-10 h-10 mx-auto rounded-xl flex items-center justify-center mb-2" style={{ background: 'var(--amber-soft)' }}>
              <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" style={{ color: 'var(--amber)' }}>
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div className="font-display font-bold text-2xl" style={{ color: 'var(--text-primary)' }}>{summary.totalAttempts}</div>
            <div className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>Bài đã làm</div>
          </div>

          <div className="card p-4 text-center">
            <div className="w-10 h-10 mx-auto rounded-xl flex items-center justify-center mb-2" style={{ background: 'rgba(59,130,246,0.1)' }}>
              <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" style={{ color: 'var(--info)' }}>
                <path d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75z" stroke="currentColor" strokeWidth="1.5" />
                <path d="M9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625z" stroke="currentColor" strokeWidth="1.5" />
                <path d="M16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" stroke="currentColor" strokeWidth="1.5" />
              </svg>
            </div>
            <div className="font-display font-bold text-2xl" style={{ color: 'var(--text-primary)' }}>{summary.avgScore}%</div>
            <div className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>Điểm trung bình</div>
          </div>

          <div className="card p-4 text-center">
            <div className="w-10 h-10 mx-auto rounded-xl flex items-center justify-center mb-2" style={{ background: 'var(--success-light)' }}>
              <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" style={{ color: 'var(--success)' }}>
                <path d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 007.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M18.75 4.236c.982.143 1.954.317 2.916.52A6.003 6.003 0 0016.27 9.728M18.75 4.236V4.5c0 2.108-.966 3.99-2.48 5.228m0 0a6.023 6.023 0 01-2.77.896m0 0c-.507.048-1.02.073-1.5.073s-.993-.025-1.5-.073m3 0a6.023 6.023 0 01-2.77-.896" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div className="font-display font-bold text-2xl" style={{ color: 'var(--text-primary)' }}>{summary.bestScore}%</div>
            <div className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>Điểm cao nhất</div>
          </div>

          <div className="card p-4 text-center">
            <div className="w-10 h-10 mx-auto rounded-xl flex items-center justify-center mb-2" style={{ background: 'rgba(139,92,246,0.1)' }}>
              <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" style={{ color: '#8b5cf6' }}>
                <path d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0012 13.489a50.702 50.702 0 007.74-3.342" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div className="font-display font-bold text-2xl" style={{ color: 'var(--text-primary)' }}>
              {summary.totalCorrect}/{summary.totalQuestions}
            </div>
            <div className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>Câu đúng</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-6">
          {/* Score history chart */}
          <div className="card p-5 fade-in-up">
            <h2 className="font-display font-bold text-sm mb-4" style={{ color: 'var(--text-primary)' }}>
              Lịch sử điểm số
            </h2>
            {scoreHistory.length > 0 ? (
              <div className="space-y-2">
                {scoreHistory.map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-20 text-xs truncate flex-shrink-0" style={{ color: 'var(--text-muted)' }} title={item.quizTitle}>
                      {item.quizTitle.length > 10 ? item.quizTitle.slice(0, 10) + '...' : item.quizTitle}
                    </div>
                    <div className="flex-1 h-6 rounded-lg overflow-hidden" style={{ background: 'var(--border-light)' }}>
                      <div
                        className="h-full rounded-lg flex items-center px-2 transition-all"
                        style={{
                          width: `${Math.max((item.percentage / maxBarValue) * 100, 8)}%`,
                          background: item.percentage >= 80 ? 'var(--success)' :
                                     item.percentage >= 50 ? 'var(--amber)' : 'var(--danger)',
                        }}
                      >
                        <span className="text-[10px] font-bold text-white whitespace-nowrap">{item.percentage}%</span>
                      </div>
                    </div>
                    <div className="text-[10px] w-12 text-right flex-shrink-0" style={{ color: 'var(--text-muted)' }}>
                      {item.score}/{item.total}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Chưa có dữ liệu</p>
            )}
          </div>

          {/* Difficulty breakdown */}
          <div className="card p-5 fade-in-up">
            <h2 className="font-display font-bold text-sm mb-4" style={{ color: 'var(--text-primary)' }}>
              Theo độ khó
            </h2>
            {difficultyStats.length > 0 ? (
              <div className="space-y-4">
                {difficultyStats.map((item) => (
                  <div key={item.difficulty}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span
                        className="inline-block px-2.5 py-1 rounded-full text-xs font-semibold"
                        style={{
                          background: difficultyColor[item.difficulty]?.bg,
                          color: difficultyColor[item.difficulty]?.color
                        }}
                      >
                        {difficultyLabel[item.difficulty] || item.difficulty}
                      </span>
                      <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                        {item.correct}/{item.total} ({item.percentage}%)
                      </span>
                    </div>
                    <div className="w-full h-2.5 rounded-full" style={{ background: 'var(--border-light)' }}>
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${item.percentage}%`,
                          background: difficultyColor[item.difficulty]?.color || 'var(--amber)'
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Chưa có dữ liệu</p>
            )}
          </div>
        </div>

        {/* Topic performance - full width */}
        <div className="card p-5 mb-6 fade-in-up">
          <h2 className="font-display font-bold text-sm mb-4" style={{ color: 'var(--text-primary)' }}>
            Theo chủ đề
            <span className="text-xs font-normal ml-2" style={{ color: 'var(--text-muted)' }}>(yếu nhất ở trên)</span>
          </h2>
          {topicStats.length > 0 ? (
            <div className="space-y-3">
              {topicStats.map((item) => {
                const isWeak = item.percentage < 50;
                const isStrong = item.percentage >= 80;
                return (
                  <div key={item.topic} className="flex items-center gap-3">
                    <div className="w-28 flex-shrink-0">
                      <div className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }} title={item.topic}>
                        {item.topic}
                      </div>
                      <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                        {item.correct}/{item.total} câu đúng
                      </div>
                    </div>
                    <div className="flex-1 h-3 rounded-full" style={{ background: 'var(--border-light)' }}>
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${Math.max(item.percentage, 3)}%`,
                          background: isWeak ? 'var(--danger)' : isStrong ? 'var(--success)' : 'var(--amber)'
                        }}
                      />
                    </div>
                    <div className="w-12 text-right text-sm font-bold flex-shrink-0" style={{
                      color: isWeak ? 'var(--danger)' : isStrong ? 'var(--success)' : 'var(--amber-warm)'
                    }}>
                      {item.percentage}%
                    </div>
                    {isWeak && (
                      <span className="text-xs px-2 py-0.5 rounded-full flex-shrink-0" style={{ background: 'var(--danger-light)', color: 'var(--danger)' }}>
                        Cần ôn
                      </span>
                    )}
                    {isStrong && (
                      <span className="text-xs px-2 py-0.5 rounded-full flex-shrink-0" style={{ background: 'var(--success-light)', color: 'var(--success)' }}>
                        Tốt
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Chưa có dữ liệu</p>
          )}
        </div>

        {/* Recent attempts */}
        <div className="card p-5 fade-in-up">
          <h2 className="font-display font-bold text-sm mb-4" style={{ color: 'var(--text-primary)' }}>
            Bài kiểm tra gần đây
          </h2>
          {recentAttempts.length > 0 ? (
            <div className="space-y-2">
              {recentAttempts.map((item) => (
                <div
                  key={item._id}
                  className="flex items-center gap-3 p-3 rounded-xl transition-colors"
                  style={{ background: 'rgba(15,23,42,0.01)' }}
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center font-display font-bold text-sm flex-shrink-0"
                    style={{
                      background: item.percentage >= 80 ? 'var(--success-light)' :
                                 item.percentage >= 50 ? '#fef3c7' : 'var(--danger-light)',
                      color: item.percentage >= 80 ? 'var(--success)' :
                             item.percentage >= 50 ? '#d97706' : 'var(--danger)'
                    }}
                  >
                    {item.percentage}%
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                      {item.quizTitle}
                    </div>
                    <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                      {item.score}/{item.totalQuestions} câu đúng &middot; {new Date(item.submittedAt).toLocaleDateString('vi-VN')}
                    </div>
                  </div>
                  <span
                    className="text-[10px] px-2 py-0.5 rounded-full font-medium flex-shrink-0"
                    style={{
                      background: item.quizType === 'official' ? 'rgba(59,130,246,0.1)' : 'var(--amber-soft)',
                      color: item.quizType === 'official' ? 'var(--info)' : 'var(--amber-warm)'
                    }}
                  >
                    {item.quizType === 'official' ? 'Kiểm tra' : 'Luyện tập'}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Chưa có dữ liệu</p>
          )}
        </div>
      </div>
    </StudentLayout>
  );
};

export default MyPerformance;
