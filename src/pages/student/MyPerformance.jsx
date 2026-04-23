import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';
import StudentLayout from '../../components/StudentLayout';

const difficultyLabel = { easy: 'Dễ', medium: 'Trung bình', hard: 'Khó' };
const difficultyColor = {
  easy: { bg: 'var(--olive-soft)', color: 'var(--olive)' },
  medium: { bg: 'var(--amber-soft)', color: 'var(--amber-warm)' },
  hard: { bg: 'var(--terracotta-soft)', color: 'var(--terracotta)' }
};

const scoreColor = (pct) =>
  pct >= 80 ? 'var(--olive)' : pct >= 50 ? 'var(--amber-warm)' : 'var(--terracotta)';
const scoreSoft = (pct) =>
  pct >= 80 ? 'var(--olive-soft)' : pct >= 50 ? 'var(--amber-soft)' : 'var(--terracotta-soft)';

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
            <div className="bento-label" style={{ color: 'var(--amber-warm)' }}>Phân tích</div>
            <h1 className="bento-hero-title mt-2" style={{ color: 'var(--text-primary)' }}>Thống kê học tập</h1>
          </div>
          <div className="bento-tile bento-tile-hero noise p-12 text-center fade-in-up">
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

  const { summary, topicStats, difficultyStats, scoreHistory, recentAttempts, mastery, recommendations } = data;
  const maxBarValue = Math.max(...scoreHistory.map(s => s.percentage), 1);

  return (
    <StudentLayout>
      <div className="max-w-4xl mx-auto">

        {/* ═══ HERO BENTO ROW ═══ */}
        <div className="grid grid-cols-12 gap-3 md:gap-4 mb-6 stagger-children">
          {/* HERO TILE — avg score + weak topic pills */}
          <div className="col-span-12 md:col-span-8 bento-tile bento-tile-hero noise">
            <div className="bento-label" style={{ color: 'var(--amber-warm)' }}>Phân tích học tập</div>
            <h1 className="bento-hero-title mt-2" style={{ color: 'var(--text-primary)' }}>
              Điểm trung bình <span style={{ color: scoreColor(summary.avgScore) }}>{summary.avgScore}%</span>
            </h1>
            <p className="text-sm md:text-base mt-2 max-w-lg" style={{ color: 'var(--text-secondary)' }}>
              Qua {summary.totalAttempts} bài kiểm tra. Cao nhất {summary.bestScore}%. Tổng {summary.totalCorrect}/{summary.totalQuestions} câu đúng.
            </p>
            {topicStats.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-1.5">
                <span className="text-xs mr-1" style={{ color: 'var(--text-muted)' }}>Cần ôn:</span>
                {topicStats.slice(0, 3).map(t => (
                  <span key={t.topic} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold"
                        style={{ background: 'var(--terracotta-soft)', color: 'var(--terracotta)' }}>
                    {t.topic} · {t.percentage}%
                  </span>
                ))}
              </div>
            )}
            <div className="mt-5 flex flex-wrap gap-2">
              {topicStats.length > 0 && (
                <button
                  onClick={handleSmartPractice}
                  disabled={smartLoading}
                  className="btn-primary flex items-center gap-2 py-2.5 px-4">
                  {smartLoading ? (
                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                  ) : '🎯'}
                  {smartLoading ? 'Đang tạo...' : 'Luyện tập điểm yếu'}
                </button>
              )}
              <button
                onClick={() => navigate('/student/chat?contextType=performance&contextLabel=Điểm yếu của tôi')}
                className="btn-secondary flex items-center gap-2 py-2.5 px-4">
                <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4">
                  <path d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Hỏi EduBot
              </button>
            </div>
          </div>

          {/* KPI STACK — 3 vertical metrics */}
          <div className="col-span-12 md:col-span-4 bento-tile bento-tile-warm p-5 md:p-6">
            <div className="bento-label mb-4">Tổng quan</div>
            <div className="space-y-3">
              <div className="flex items-baseline justify-between">
                <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>Bài đã làm</span>
                <span className="bento-display text-2xl" style={{ color: 'var(--text-primary)' }}>{summary.totalAttempts}</span>
              </div>
              <div className="rule-line" />
              <div className="flex items-baseline justify-between">
                <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>Điểm cao nhất</span>
                <span className="bento-display text-2xl" style={{ color: scoreColor(summary.bestScore) }}>{summary.bestScore}%</span>
              </div>
              <div className="rule-line" />
              <div className="flex items-baseline justify-between">
                <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>Câu đúng</span>
                <span className="bento-display text-2xl" style={{ color: 'var(--text-primary)' }}>
                  {summary.totalCorrect}<span className="text-base opacity-50">/{summary.totalQuestions}</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
          {/* Score history chart */}
          <div className="bento-tile bento-tile-surface p-5 fade-in-up">
            <div className="bento-label mb-1">Trend</div>
            <h2 className="font-display font-bold text-lg mb-4" style={{ color: 'var(--text-primary)' }}>
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
                          background: scoreColor(item.percentage),
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
          <div className="bento-tile bento-tile-surface p-5 fade-in-up">
            <div className="bento-label mb-1">Độ khó</div>
            <h2 className="font-display font-bold text-lg mb-4" style={{ color: 'var(--text-primary)' }}>
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
        <div className="bento-tile bento-tile-surface p-5 mb-6 fade-in-up">
          <div className="bento-label mb-1">Theo chủ đề</div>
          <h2 className="font-display font-bold text-lg mb-4" style={{ color: 'var(--text-primary)' }}>
            Nắm vững từng chủ đề
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
                          background: scoreColor(item.percentage),
                        }}
                      />
                    </div>
                    <div className="w-12 text-right text-sm font-bold flex-shrink-0 tabular-nums" style={{
                      color: scoreColor(item.percentage)
                    }}>
                      {item.percentage}%
                    </div>
                    {isWeak && (
                      <span className="text-xs px-2 py-0.5 rounded-md flex-shrink-0"
                            style={{ background: 'var(--terracotta-soft)', color: 'var(--terracotta)' }}>
                        Cần ôn
                      </span>
                    )}
                    {isStrong && (
                      <span className="text-xs px-2 py-0.5 rounded-md flex-shrink-0"
                            style={{ background: 'var(--olive-soft)', color: 'var(--olive)' }}>
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

        {mastery && (
          <div className="bento-tile bento-tile-surface p-5 mb-6 fade-in-up">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <div className="bento-label">Mastery</div>
                <h2 className="font-display font-bold text-lg mt-1" style={{ color: 'var(--text-primary)' }}>
                  Mức nắm vững tổng quát
                </h2>
                <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                  Kết hợp kết quả quiz, flashcard và tiến độ bài học
                </p>
              </div>
              <div className="bento-metric" style={{ color: scoreColor(mastery.summary?.overallMasteryScore || 0) }}>
                {mastery.summary?.overallMasteryScore || 0}%
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-5">
              <div className="bento-tile bento-tile-warm p-4">
                <div className="bento-label">Flashcard đến hạn</div>
                <div className="bento-display text-xl mt-2" style={{ color: 'var(--text-primary)' }}>
                  {mastery.summary?.overdueFlashcards || 0}
                </div>
              </div>
              <div className="bento-tile bento-tile-warm p-4">
                <div className="bento-label">Bài học đã xong</div>
                <div className="bento-display text-xl mt-2" style={{ color: 'var(--text-primary)' }}>
                  {mastery.summary?.completedLessons || 0}<span className="text-sm opacity-50">/{mastery.summary?.trackedLessons || 0}</span>
                </div>
              </div>
              <div className="bento-tile bento-tile-warm p-4">
                <div className="bento-label">Lần học gần nhất</div>
                <div className="text-sm font-semibold mt-2" style={{ color: 'var(--text-primary)' }}>
                  {mastery.summary?.lastStudyAt ? new Date(mastery.summary.lastStudyAt).toLocaleDateString('vi-VN') : 'Chưa có'}
                </div>
              </div>
            </div>

            {recommendations?.nextAction && (
              <div className="mt-4 rounded-2xl p-4" style={{ background: 'var(--amber-soft)', borderLeft: '3px solid var(--amber)' }}>
                <div className="bento-label" style={{ color: 'var(--amber-warm)' }}>
                  Hành động tiếp theo
                </div>
                <div className="font-display font-bold text-sm mt-1" style={{ color: 'var(--text-primary)' }}>
                  {recommendations.nextAction.title}
                </div>
                <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
                  {recommendations.nextAction.description}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Recent attempts */}
        <div className="bento-tile bento-tile-surface p-5 fade-in-up">
          <div className="bento-label mb-1">Hoạt động</div>
          <h2 className="font-display font-bold text-lg mb-4" style={{ color: 'var(--text-primary)' }}>
            Bài kiểm tra gần đây
          </h2>
          {recentAttempts.length > 0 ? (
            <div className="space-y-1">
              {recentAttempts.map((item) => (
                <div
                  key={item._id}
                  className="flex items-center gap-3 py-2.5 px-2 -mx-2 rounded-lg transition-colors hover:bg-[var(--ink-soft)]"
                >
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center font-display font-bold text-sm flex-shrink-0 tabular-nums"
                    style={{
                      background: scoreSoft(item.percentage),
                      color: scoreColor(item.percentage),
                    }}
                  >
                    {item.percentage}
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
                    className="text-[10px] px-2 py-0.5 rounded-md font-semibold flex-shrink-0"
                    style={{
                      background: item.quizType === 'official' ? 'var(--ink-soft)' : 'var(--amber-soft)',
                      color: item.quizType === 'official' ? 'var(--text-secondary)' : 'var(--amber-warm)'
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
