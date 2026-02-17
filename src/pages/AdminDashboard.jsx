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
      color: '#14213d',
      lightColor: 'rgba(20,33,61,0.06)',
    },
    {
      label: 'Lớp học',
      value: stats.classes,
      link: '/admin/classes',
      icon: <IconBook />,
      color: '#e8850a',
      lightColor: 'rgba(232,133,10,0.08)',
    },
    {
      label: 'Tài nguyên',
      value: stats.medias,
      link: '/admin/upload',
      icon: <IconPhoto />,
      color: '#059669',
      lightColor: 'rgba(5,150,105,0.07)',
    },
  ];

  return (
    <AdminLayout>
      {/* Page header */}
      <div className="mb-8">
        <h1 className="font-display text-2xl font-semibold" style={{ color: '#1c1917' }}>Tổng quan</h1>
        <p className="text-sm mt-1" style={{ color: '#78716c' }}>Xem thống kê và hoạt động gần đây</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {cards.map((card) => (
          <Link
            key={card.label}
            to={card.link}
            className="stat-card group relative bg-white rounded-2xl p-5 border flex items-center justify-between overflow-hidden"
            style={{ borderColor: '#e5ddd0', boxShadow: '0 1px 3px rgba(160,100,20,0.07)' }}
          >
            <div>
              <p className="text-sm font-medium" style={{ color: '#78716c' }}>{card.label}</p>
              <p className="font-display text-3xl font-semibold mt-1" style={{ color: '#1c1917' }}>
                {loading ? '—' : card.value}
              </p>
              <div
                className="flex items-center gap-1 text-xs font-medium mt-2 group-hover:gap-2 transition-all"
                style={{ color: card.color }}
              >
                Xem chi tiết <IconArrow />
              </div>
            </div>
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: card.lightColor, color: card.color }}
            >
              {card.icon}
            </div>
            {/* Subtle background accent */}
            <div
              className="absolute -right-6 -bottom-6 w-20 h-20 rounded-full pointer-events-none"
              style={{ background: card.lightColor }}
            />
          </Link>
        ))}
      </div>

      {/* Recent students */}
      <div
        className="bg-white rounded-2xl border overflow-hidden"
        style={{ borderColor: '#e5ddd0', boxShadow: '0 1px 3px rgba(160,100,20,0.07)' }}
      >
        <div
          className="flex items-center justify-between px-6 py-4 border-b"
          style={{ borderColor: '#f0ebe4' }}
        >
          <h2 className="font-semibold text-sm" style={{ color: '#1c1917' }}>Học viên gần đây</h2>
          <Link
            to="/admin/students"
            className="flex items-center gap-1 text-xs font-medium transition-colors"
            style={{ color: '#e8850a' }}
          >
            Xem tất cả <IconArrow />
          </Link>
        </div>

        <div className="divide-y" style={{ borderColor: '#f8f4f0' }}>
          {loading ? (
            <div className="py-10 text-center text-sm" style={{ color: '#a8a29e' }}>Đang tải...</div>
          ) : recentStudents.length === 0 ? (
            <div className="py-10 text-center text-sm" style={{ color: '#a8a29e' }}>Chưa có học viên</div>
          ) : (
            recentStudents.map((s) => (
              <div key={s._id} className="flex items-center justify-between px-6 py-3.5">
                <div className="flex items-center gap-3">
                  {/* Avatar */}
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0"
                    style={{ background: 'rgba(232,133,10,0.12)', color: '#e8850a' }}
                  >
                    {s.fullName?.charAt(0)?.toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-medium" style={{ color: '#1c1917' }}>{s.fullName}</p>
                    <p className="text-xs" style={{ color: '#a8a29e' }}>
                      @{s.username}{s.grade ? ` · Lớp ${s.grade}` : ''}
                    </p>
                  </div>
                </div>
                <span
                  className="text-xs font-medium px-2.5 py-1 rounded-full"
                  style={
                    s.status === 'active'
                      ? { background: '#d1fae5', color: '#065f46' }
                      : { background: '#fee2e2', color: '#991b1b' }
                  }
                >
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
