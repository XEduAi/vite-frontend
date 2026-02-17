import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import AdminLayout from '../components/AdminLayout';

const AdminDashboard = () => {
  const [stats, setStats] = useState({ students: 0, classes: 0, medias: 0 });
  const [recentStudents, setRecentStudents] = useState([]);

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
      }
    };
    fetchStats();
  }, []);

  const cards = [
    { label: 'Học viên', value: stats.students, color: 'blue', link: '/admin/students' },
    { label: 'Lớp học', value: stats.classes, color: 'green', link: '/admin/classes' },
    { label: 'Tài liệu', value: stats.medias, color: 'purple', link: '/admin/upload' },
  ];

  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Tổng quan</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {cards.map((card) => (
          <Link to={card.link} key={card.label}
            className={`bg-white p-6 rounded-lg shadow border-l-4 border-${card.color}-500 hover:shadow-md transition`}>
            <h3 className="text-gray-500 text-sm font-medium">{card.label}</h3>
            <p className="text-3xl font-bold text-gray-800 mt-2">{card.value}</p>
          </Link>
        ))}
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Học viên mới</h2>
          <Link to="/admin/students" className="text-blue-600 hover:underline text-sm">Xem tất cả →</Link>
        </div>
        <div className="divide-y">
          {recentStudents.map(s => (
            <div key={s._id} className="py-3 flex justify-between items-center">
              <div>
                <p className="font-medium text-sm">{s.fullName}</p>
                <p className="text-xs text-gray-400">@{s.username}{s.grade ? ` · Lớp ${s.grade}` : ''}</p>
              </div>
              <span className={`px-2 py-0.5 rounded-full text-xs ${s.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {s.status === 'active' ? 'Đang học' : 'Đã khóa'}
              </span>
            </div>
          ))}
          {recentStudents.length === 0 && (
            <p className="text-gray-400 text-sm py-4 text-center">Chưa có học viên</p>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;