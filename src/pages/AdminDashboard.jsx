import { Link } from 'react-router-dom';
import AdminLayout from '../components/AdminLayout';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useAdminDashboardStatsQuery, useAdminOverviewQuery } from '../features/admin-dashboard/hooks';

const ArrowIcon = () => (
  <svg viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
    <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
  </svg>
);

const formatDate = () => {
  const today = new Date();
  return today.toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
};

const formatCurrency = (value) => {
  const num = Number(value) || 0;
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(0)}k`;
  return num.toLocaleString('vi-VN');
};

const AdminDashboard = () => {
  const statsQuery = useAdminDashboardStatsQuery();
  const overviewQuery = useAdminOverviewQuery();

  const stats = statsQuery.data?.stats || { students: 0, classes: 0, medias: 0 };
  const recentStudents = statsQuery.data?.recentStudents || [];
  const loading = statsQuery.isPending;
  const analytics = overviewQuery.data;
  const analyticsLoading = overviewQuery.isPending;

  const avgScore = analytics?.quizStats?.averageScore || 0;
  const completionRate = analytics?.quizStats?.completionRate || 0;
  const activeStudents = analytics?.students?.active || 0;
  const revenue = analytics?.revenue?.total || 0;

  const quickActions = [
    { label: 'Thêm học viên mới', to: '/admin/students', section: 'Học tập' },
    { label: 'Cập nhật học phí', to: '/admin/tuition', section: 'Vận hành' },
    { label: 'Tạo quiz mới', to: '/admin/quizzes', section: 'Nội dung' },
    { label: 'Xem leads mới', to: '/admin/leads', section: 'Vận hành' },
  ];

  const metrics = [
    {
      label: 'Học viên',
      value: stats.students,
      subtitle: 'tổng trên hệ thống',
      accent: 'var(--amber-warm)',
      loading,
      link: '/admin/students',
    },
    {
      label: 'Lớp đang mở',
      value: stats.classes,
      subtitle: 'lớp hoạt động',
      accent: 'var(--olive)',
      loading,
      link: '/admin/classes',
    },
    {
      label: 'Điểm TB quiz',
      value: `${avgScore}%`,
      subtitle: `tỉ lệ hoàn thành ${completionRate}%`,
      accent: avgScore >= 80 ? 'var(--olive)' : avgScore >= 50 ? 'var(--amber-warm)' : 'var(--terracotta)',
      loading: analyticsLoading,
      link: '/admin/quizzes',
    },
    {
      label: 'HV hoạt động',
      value: activeStudents,
      subtitle: 'trong 7 ngày qua',
      accent: 'var(--amber-warm)',
      loading: analyticsLoading,
      link: '/admin/students',
    },
  ];

  return (
    <AdminLayout>
      {/* Hero */}
      <div className="mb-10">
        <div className="bento-label" style={{ color: 'var(--amber-warm)' }}>Bảng điều hành</div>
        <h1 className="bento-hero-title mt-2" style={{ color: 'var(--text-primary)' }}>
          Xin chào, Thầy Long
        </h1>
        <p className="text-sm mt-3" style={{ color: 'var(--text-secondary)' }}>
          {formatDate()}
          <span className="mx-2" style={{ color: 'var(--border)' }}>•</span>
          Doanh thu tháng này: <span className="font-semibold tabular-nums" style={{ color: 'var(--text-primary)' }}>{formatCurrency(revenue)}đ</span>
        </p>
      </div>

      {/* Pulse strip — Swiss editorial */}
      <div className="mb-10">
        <div className="flex items-end justify-between mb-4">
          <div className="bento-label" style={{ color: 'var(--text-muted)' }}>Chỉ số</div>
          <div className="rule-line flex-1 mx-4 mb-1.5" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-px" style={{ background: 'var(--border-light)' }}>
          {metrics.map((m) => (
            <Link
              key={m.label}
              to={m.link}
              className="group p-5 transition-all"
              style={{ background: 'var(--white)' }}
            >
              <div className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                {m.label}
              </div>
              <div className="bento-metric mt-2" style={{ color: m.accent }}>
                {m.loading ? <span className="skeleton inline-block w-16 h-8 rounded" /> : m.value}
              </div>
              <div className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                {m.subtitle}
              </div>
              <div className="flex items-center gap-1 mt-3 text-[11px] font-semibold opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: m.accent }}>
                Xem chi tiết <ArrowIcon />
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Two-column: Recent students + Quick actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
        {/* Recent students — col-span-2 */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div className="bento-label" style={{ color: 'var(--text-muted)' }}>Học viên gần đây</div>
            <Link to="/admin/students" className="flex items-center gap-1 text-xs font-semibold" style={{ color: 'var(--amber-warm)' }}>
              Xem tất cả <ArrowIcon />
            </Link>
          </div>
          <div className="bento-tile bento-tile-surface">
            {loading ? (
              <div className="p-5 space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="skeleton w-9 h-9 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <div className="skeleton h-3 w-1/3" />
                      <div className="skeleton h-2.5 w-1/4" />
                    </div>
                  </div>
                ))}
              </div>
            ) : recentStudents.length === 0 ? (
              <div className="py-12 text-center">
                <div className="text-3xl mb-2">👥</div>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Chưa có học viên</p>
              </div>
            ) : (
              <div className="divide-y" style={{ borderColor: 'var(--border-light)' }}>
                {recentStudents.map((s) => (
                  <div key={s._id} className="flex items-center justify-between px-5 py-3.5">
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                        style={{ background: 'var(--amber-soft)', color: 'var(--amber-warm)' }}
                      >
                        {s.fullName?.charAt(0)?.toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{s.fullName}</p>
                        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                          @{s.username}{s.grade ? ` · Lớp ${s.grade}` : ''}
                        </p>
                      </div>
                    </div>
                    <span
                      className="text-[11px] px-2 py-0.5 rounded-md font-semibold shrink-0"
                      style={{
                        background: s.status === 'active' ? 'var(--olive-soft)' : 'var(--terracotta-soft)',
                        color: s.status === 'active' ? 'var(--olive)' : 'var(--terracotta)',
                      }}
                    >
                      {s.status === 'active' ? 'Đang học' : 'Đã khóa'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Quick actions */}
        <div>
          <div className="bento-label mb-4" style={{ color: 'var(--text-muted)' }}>Lối tắt nhanh</div>
          <div className="bento-tile bento-tile-surface p-1">
            {quickActions.map((a, i) => (
              <Link
                key={a.to}
                to={a.to}
                className={`group flex items-center justify-between px-4 py-3 rounded-xl transition-all hover:opacity-70 ${i < quickActions.length - 1 ? 'border-b' : ''}`}
                style={{ borderColor: 'var(--border-light)' }}
              >
                <div>
                  <div className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                    {a.section}
                  </div>
                  <div className="text-sm font-semibold mt-0.5" style={{ color: 'var(--text-primary)' }}>
                    {a.label}
                  </div>
                </div>
                <ArrowIcon />
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Analytics — editorial block */}
      {!analyticsLoading && analytics && (
        <div>
          <div className="flex items-end justify-between mb-4">
            <div>
              <div className="bento-label" style={{ color: 'var(--text-muted)' }}>Phân tích</div>
              <h2 className="font-display font-bold text-lg mt-1" style={{ color: 'var(--text-primary)' }}>
                Tăng trưởng & doanh thu
              </h2>
            </div>
            <div className="rule-line flex-1 ml-6 mb-1" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bento-tile bento-tile-surface p-5">
              <div className="flex items-baseline justify-between mb-3">
                <h3 className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>Học viên mới theo tháng</h3>
                <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>6 tháng qua</span>
              </div>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={analytics.studentGrowth || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-light)" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="var(--text-muted)" />
                  <YAxis tick={{ fontSize: 11 }} stroke="var(--text-muted)" />
                  <Tooltip />
                  <Line type="monotone" dataKey="count" stroke="var(--amber-warm)" strokeWidth={2} dot={{ r: 3 }} name="Học viên" />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="bento-tile bento-tile-surface p-5">
              <div className="flex items-baseline justify-between mb-3">
                <h3 className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>Doanh thu theo tháng</h3>
                <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>6 tháng qua</span>
              </div>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={analytics.revenue?.monthly || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-light)" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="var(--text-muted)" />
                  <YAxis tick={{ fontSize: 11 }} stroke="var(--text-muted)" />
                  <Tooltip formatter={(value) => `${Number(value).toLocaleString('vi-VN')}đ`} />
                  <Bar dataKey="revenue" fill="var(--olive)" radius={[4, 4, 0, 0]} name="Doanh thu" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminDashboard;
