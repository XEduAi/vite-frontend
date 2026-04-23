import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';
import StudentLayout from '../../components/StudentLayout';
import ShareButtons from '../../components/ShareButtons';

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
          <div className="bento-label" style={{ color: 'var(--amber-warm)' }}>Hành trình học tập</div>
          <h1 className="bento-hero-title mt-2" style={{ color: 'var(--text-primary)' }}>Thành tích</h1>
        </div>

        {/* Profile card — dark bento tile */}
        <div className="bento-tile bento-tile-ink p-6 mb-6 fade-in-up dot-pattern relative overflow-hidden">
          <div className="flex items-center gap-4 mb-5 relative">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold text-white shrink-0"
              style={{ background: 'var(--amber-soft)', border: '2px solid var(--amber)' }}>
              {stats?.fullName?.charAt(0)?.toUpperCase() || '?'}
            </div>
            <div className="min-w-0">
              <div className="font-display text-xl font-bold text-white truncate">{stats?.fullName || 'Học viên'}</div>
              <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                <span className="text-xs font-bold px-2 py-0.5 rounded-md"
                  style={{ background: 'var(--amber-soft)', color: 'var(--amber-glow)' }}>
                  ⭐ Cấp {stats?.level || 1}
                </span>
                {stats?.streak > 0 && (
                  <span className="text-xs font-bold px-2 py-0.5 rounded-md"
                    style={{ background: 'var(--terracotta-soft)', color: 'var(--terracotta-glow)' }}>
                    🔥 {stats.streak} ngày
                  </span>
                )}
              </div>
            </div>
            <div className="ml-auto text-right shrink-0">
              <div className="bento-metric" style={{ color: 'var(--amber-glow)' }}>{(stats?.xp || 0).toLocaleString('vi-VN')}</div>
              <div className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>XP</div>
            </div>
          </div>

          {/* XP progress bar */}
          <div className="relative">
            <div className="flex justify-between text-xs mb-1.5" style={{ color: 'rgba(255,255,255,0.6)' }}>
              <span>Tiến độ lên cấp {(stats?.level || 1) + 1}</span>
              <span className="tabular-nums">{stats?.xpInCurrentLevel || 0} / 100 XP</span>
            </div>
            <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.1)' }}>
              <div className="h-full rounded-full transition-all duration-500"
                style={{ width: `${xpProgress}%`, background: 'var(--grad-amber)' }} />
            </div>
          </div>

          {/* Share achievements */}
          <div className="mt-4 pt-4 relative" style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }}>
            <ShareButtons
              title="Thành tích EduVN"
              text={`🎓 Tôi đã đạt cấp ${stats?.level || 1} với ${stats?.xp || 0} XP và ${earnedIds.size} huy hiệu trên EduVN! 🏆`}
              url={window.location.origin + '/student/achievements'}
            />
          </div>
        </div>

        {/* Badge grid */}
        <div className="mb-4">
          <div className="flex items-baseline justify-between mb-4">
            <div>
              <div className="bento-label">Bộ sưu tập</div>
              <h2 className="font-display text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
                Huy hiệu
              </h2>
            </div>
            <span className="text-sm font-bold tabular-nums" style={{ color: 'var(--amber-warm)' }}>
              {earnedIds.size}<span className="opacity-50">/{ALL_BADGES.length}</span>
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {ALL_BADGES.map(badge => {
              const earned = earnedIds.has(badge.id);
              const earnedData = stats?.badges?.find(b => b.id === badge.id);
              return (
                <div key={badge.id}
                  className="bento-tile bento-tile-surface p-4 text-center transition-all duration-200"
                  style={{
                    opacity: earned ? 1 : 0.55,
                    filter: earned ? 'none' : 'grayscale(0.7)',
                    border: earned ? '1.5px solid var(--amber)' : undefined,
                    boxShadow: earned ? '0 0 20px var(--amber-soft)' : undefined,
                  }}>
                  <div className="text-3xl mb-2">{badge.icon}</div>
                  <div className="text-xs font-bold leading-tight mb-1" style={{ color: 'var(--text-primary)' }}>
                    {badge.name}
                  </div>
                  {earned && earnedData?.earnedAt ? (
                    <div className="text-[10px] font-semibold" style={{ color: 'var(--olive)' }}>
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
