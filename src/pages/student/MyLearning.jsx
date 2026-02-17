import { useEffect, useState } from 'react';
import axiosClient from '../../api/axiosClient';
import { useNavigate } from 'react-router-dom';

const MyLearning = () => {
  const [classes, setClasses] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const res = await axiosClient.get('/my-classes'); // API lấy lớp của user đang login
        setClasses(res.data);
      } catch (error) {
        console.error("Lỗi tải lớp học:", error);
      }
    };
    fetchClasses();
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header đơn giản */}
      <header className="bg-white shadow p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-blue-600">E-Learning Student</h1>
        <button onClick={handleLogout} className="text-red-500 hover:underline">Đăng xuất</button>
      </header>

      <main className="container mx-auto p-6">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Khoá học của tôi</h2>

        {classes.length === 0 ? (
          <p className="text-gray-500">Bạn chưa được ghi danh vào lớp nào.</p>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {classes.map((cls) => (
              <div key={cls._id} className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                <h3 className="text-xl font-bold text-gray-800">{cls.name}</h3>
                <p className="text-gray-600 mb-4">{cls.description || 'Chưa có mô tả'}</p>
                
                <div className="bg-gray-50 p-4 rounded">
                  <h4 className="font-semibold text-sm text-gray-500 mb-3 uppercase">Tài liệu học tập:</h4>
                  {cls.mediaResources && cls.mediaResources.length > 0 ? (
                    <ul className="space-y-2">
                      {cls.mediaResources.map((media) => (
                        <li key={media._id} className="flex items-center gap-2">
                          <span className="text-2xl">
                            {media.type === 'video' ? '📺' : media.type === 'image' ? '🖼️' : '📄'}
                          </span>
                          <a 
                            href={media.url} 
                            target="_blank" 
                            rel="noreferrer"
                            className="text-blue-600 hover:underline font-medium"
                          >
                            {media.title}
                          </a>
                          <span className="text-xs text-gray-400">({media.type})</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-gray-400 italic">Chưa có tài liệu nào.</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default MyLearning;