import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import AdminLayout from '../components/AdminLayout';

const IconUsers = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
    <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
  </svg>
);
const IconBook = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
    <path d="M4 19.5A2.5 2.5 0 016.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" />
  </svg>
);
const IconPhoto = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
    <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" />
    <polyline points="21 15 16 10 5 21" />
  </svg>
);
const IconArrow = () => (
  <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
    <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
  </svg>
);

const AdminDashboard = () => {
  const [stats, setStats] = useState({ students: 0, classes: 0, medias: 0 });
  const [recentStudents, setRecentStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [studentRes, classRes, mediaRes] = await Promise.all([
          axiosClient.get('/students'),
          axiosClient.get('/classes'),
          axiosClient.get('/media')
        ]);
        const studentList = studentRes.data.students || [];
        setStats({
          students: studentList.length,
          classes: (classRes.data.classes || []).length,
          medias: (mediaRes.data.medias || []).length
        });
        setRecentStudents(studentList.slice(0, 5));
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const cards = [
    {
      label: 'Học viên',
      value: stats.students,
      link: '/admin/students',
      icon: <IconUsers />,
      gradient: 'linear-gradient(135deg, #0a1628 0%, #1e3a5f 100%)',
      iconBg: 'rgba(245,158,11,0.15)',
      iconColor: '#f59e0b',
    },
    {
      label: 'Lớp học',
      value: stats.classes,
      link: '/admin/classes',
      icon: <IconBook />,
      gradient: 'linear-gradient(135deg, #f59e0b 0%, #ea580c 100%)',
      iconBg: 'rgba(255,255,255,0.2)',
      iconColor: '#ffffff',
      isLight: true,
    },
    {
      label: 'Tài nguyên',
      value: stats.medias,
      link: '/admin/upload',
      icon: <IconPhoto />,
      gradient: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
      iconBg: 'rgba(255,255,255,0.2)',
      iconColor: '#ffffff',
      isLight: true,
    },
  ];

  return (
    <AdminLayout>
      {/* Page header */}
      <div className="mb-8">
        <h1 className="font-display text-2xl md:text-3xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>Tổng quan</h1>
        <p className="text-sm mt-1.5" style={{ color: 'var(--text-secondary)' }}>Xem thống kê và hoạt động gần đây</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8 stagger-children">
        {cards.map((card) => (
          <Link
            key={card.label}
            to={card.link}
            className="stat-card group relative rounded-2xl p-6 flex items-center justify-between overflow-hidden"
            style={{ background: card.gradient, boxShadow: 'var(--shadow-lg)' }}
          >
            {/* Decorative elements */}
            <div className="absolute -right-8 -bottom-8 w-24 h-24 rounded-full" style={{ background: 'rgba(255,255,255,0.06)' }} />
            <div className="absolute -right-2 -top-2 w-16 h-16 rounded-full" style={{ background: 'rgba(255,255,255,0.04)' }} />

            <div className="relative z-10">
              <p className="text-sm font-medium" style={{ color: card.isLight ? 'rgba(255,255,255,0.75)' : 'rgba(255,255,255,0.6)' }}>{card.label}</p>
              <p className="font-display text-3xl font-bold mt-1 text-white">
                {loading ? (
                  <span className="inline-block w-12 h-8 skeleton rounded-lg" style={{ background: 'rgba(255,255,255,0.15)' }} />
                ) : card.value}
              </p>
              <div className="flex items-center gap-1 text-xs font-semibold mt-3 group-hover:gap-2 transition-all" style={{ color: card.isLight ? 'rgba(255,255,255,0.85)' : '#f59e0b' }}>
                Xem chi tiết <IconArrow />
              </div>
            </div>
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 relative z-10"
              style={{ background: card.iconBg, color: card.iconColor }}
            >
              {card.icon}
            </div>
          </Link>
        ))}
      </div>

      {/* Recent students */}
      <div className="card overflow-hidden fade-in" style={{ animationDelay: '0.2s' }}>
        <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: 'var(--border-light)' }}>
          <h2 className="font-display font-bold text-sm" style={{ color: 'var(--text-primary)' }}>Học viên gần đây</h2>
          <Link to="/admin/students" className="flex items-center gap-1 text-xs font-semibold transition-colors" style={{ color: 'var(--amber-warm)' }}>
            Xem tất cả <IconArrow />
          </Link>
        </div>

        <div className="divide-y" style={{ borderColor: 'var(--border-light)' }}>
          {loading ? (
            <div className="p-6 space-y-4">
              {[1, 2, 3].map(i => (
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
              <div className="w-12 h-12 mx-auto rounded-xl flex items-center justify-center mb-3" style={{ background: '#f1f5f9' }}>
                <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" style={{ color: 'var(--text-muted)' }}>
                  <path d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Chưa có học viên</p>
            </div>
          ) : (
            recentStudents.map((s) => (
              <div key={s._id} className="flex items-center justify-between px-6 py-3.5 table-row">
                <div className="flex items-center gap-3">
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                    style={{ background: 'var(--amber-soft)', color: 'var(--amber-warm)' }}
                  >
                    {s.fullName?.charAt(0)?.toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{s.fullName}</p>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                      @{s.username}{s.grade ? ` · Lớp ${s.grade}` : ''}
                    </p>
                  </div>
                </div>
                <span className={`badge ${s.status === 'active' ? 'badge-green' : 'badge-red'}`}>
                  {s.status === 'active' ? 'Đang học' : 'Đã khóa'}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
