import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';
import StudentLayout from '../../components/StudentLayout';

const ALL_BADGES = [
  { id: 'first_quiz',    name: 'Bước đầu tiên',      icon: '🎯', condition: 'Hoàn thành bài kiểm tra đầu tiên' },
  { id: 'quiz_10',       name: 'Chăm chỉ',            icon: '📚', condition: 'Hoàn thành 10 bài kiểm tra' },
  { id: 'quiz_50',       name: 'Học không ngừng',     icon: '🏅', condition: 'Hoàn thành 50 bài kiểm tra' },
  { id: 'first_perfect', name: 'Điểm tuyệt đối',      icon: '⭐', condition: 'Đạt 100% lần đầu tiên' },
  { id: 'streak_3',      name: '3 ngày liên tiếp',    icon: '🔥', condition: 'Học 3 ngày liên tiếp' },
  { id: 'streak_7',      name: 'Tuần lễ rực lửa',     icon: '🌟', condition: 'Học 7 ngày liên tiếp' },
  { id: 'streak_30',     name: 'Kiên trì',             icon: '💎', condition: 'Học 30 ngày liên tiếp' },
  { id: 'hard_master',   name: 'Chinh phục thử thách', icon: '🏆', condition: 'Đạt ≥80% trong bài khó' },
];

const Achievements = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axiosClient.get('/student/gamification')
      .then(res => setStats(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <StudentLayout>
        <div className="py-20 text-center">
          <div className="inline-flex items-center gap-3 px-5 py-3 rounded-2xl card">
            <svg className="animate-spin w-5 h-5" style={{ color: 'var(--amber)' }} viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Đang tải...</span>
          </div>
        </div>
      </StudentLayout>
    );
  }

  const earnedIds = new Set((stats?.badges || []).map(b => b.id));
  const xpProgress = stats?.xpProgress || 0;

  return (
    <StudentLayout>
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="font-display text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Thành tích</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>Hành trình học tập của bạn</p>
        </div>

        {/* Profile card */}
        <div className="card rounded-2xl p-6 mb-6 fade-in-up"
          style={{ background: 'linear-gradient(135deg, #0a1628 0%, #1e3a5f 100%)' }}>
          <div className="flex items-center gap-4 mb-5">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold text-white"
              style={{ background: 'rgba(245,158,11,0.3)', border: '2px solid rgba(245,158,11,0.5)' }}>
              {stats?.fullName?.charAt(0)?.toUpperCase() || '?'}
            </div>
            <div>
              <div className="font-display text-xl font-bold text-white">{stats?.fullName || 'Học viên'}</div>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                  style={{ background: 'rgba(245,158,11,0.25)', color: '#fbbf24' }}>
                  ⭐ Cấp {stats?.level || 1}
                </span>
                {stats?.streak > 0 && (
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                    style={{ background: 'rgba(239,68,68,0.25)', color: '#fca5a5' }}>
                    🔥 {stats.streak} ngày
                  </span>
                )}
              </div>
            </div>
            <div className="ml-auto text-right">
              <div className="font-display text-2xl font-bold" style={{ color: '#fbbf24' }}>{stats?.xp || 0}</div>
              <div className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>XP</div>
            </div>
          </div>

          {/* XP progress bar */}
          <div>
            <div className="flex justify-between text-xs mb-1.5" style={{ color: 'rgba(255,255,255,0.6)' }}>
              <span>Tiến độ lên cấp {(stats?.level || 1) + 1}</span>
              <span>{stats?.xpInCurrentLevel || 0} / 100 XP</span>
            </div>
            <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.1)' }}>
              <div className="h-full rounded-full transition-all duration-500"
                style={{ width: `${xpProgress}%`, background: 'linear-gradient(90deg, #f59e0b, #fbbf24)' }} />
            </div>
          </div>
        </div>

        {/* Badge grid */}
        <div className="mb-4">
          <h2 className="font-display text-lg font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
            Huy hiệu ({earnedIds.size}/{ALL_BADGES.length})
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {ALL_BADGES.map(badge => {
              const earned = earnedIds.has(badge.id);
              const earnedData = stats?.badges?.find(b => b.id === badge.id);
              return (
                <div key={badge.id}
                  className="card rounded-2xl p-4 text-center transition-all duration-200"
                  style={{
                    opacity: earned ? 1 : 0.45,
                    filter: earned ? 'none' : 'grayscale(0.8)',
                    border: earned ? '1.5px solid rgba(245,158,11,0.4)' : undefined,
                    boxShadow: earned ? '0 0 16px rgba(245,158,11,0.15)' : undefined,
                  }}>
                  <div className="text-3xl mb-2">{badge.icon}</div>
                  <div className="text-xs font-bold leading-tight mb-1" style={{ color: 'var(--text-primary)' }}>
                    {badge.name}
                  </div>
                  {earned && earnedData?.earnedAt ? (
                    <div className="text-[10px]" style={{ color: 'var(--success)' }}>
                      ✓ {new Date(earnedData.earnedAt).toLocaleDateString('vi-VN')}
                    </div>
                  ) : (
                    <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                      {badge.condition}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Link to performance */}
        <div className="text-center mt-6">
          <Link to="/student/performance"
            className="btn-secondary inline-flex items-center gap-2 py-2.5 px-5 text-sm rounded-xl">
            📊 Xem thống kê chi tiết
          </Link>
        </div>
      </div>
    </StudentLayout>
  );
};

export default Achievements;
