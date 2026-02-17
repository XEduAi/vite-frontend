import { useState } from 'react';
import axiosClient from '../../api/axiosClient';
import AdminLayout from '../../components/AdminLayout';

const ClassManager = () => {
  const [classes, setClasses] = useState([]);
  
  // State cho các form
  const [newClassName, setNewClassName] = useState('');
  const [assignData, setAssignData] = useState({ classId: '', studentUsername: '', mediaId: '' });
  const [message, setMessage] = useState('');

  // Lấy danh sách lớp khi vào trang (cần viết thêm API get all classes cho admin nếu chưa có, nhưng tạm thời ta sẽ thấy lớp mới sau khi tạo)
  // Ở đây tôi giả định bạn sẽ thấy lớp sau khi tạo xong.

  const handleCreateClass = async (e) => {
    e.preventDefault();
    try {
      const res = await axiosClient.post('/classes', { name: newClassName });
      setClasses([...classes, res.data]); // Thêm vào list hiển thị
      setNewClassName('');
      setMessage(`Đã tạo lớp: ${res.data.name}`);
    } catch {
      setMessage('Lỗi tạo lớp');
    }
  };

  const handleAssignStudent = async (e) => {
    e.preventDefault();
    try {
      await axiosClient.post('/classes/assign-student', {
        classId: assignData.classId,
        studentUsername: assignData.studentUsername
      });
      setMessage(`Đã thêm học viên ${assignData.studentUsername} vào lớp!`);
    } catch (err) {
      setMessage('Lỗi thêm học viên: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleAssignMedia = async (e) => {
    e.preventDefault();
    try {
      await axiosClient.post('/classes/assign-media', {
        classId: assignData.classId,
        mediaId: assignData.mediaId
      });
      setMessage('Đã thêm Media vào lớp thành công!');
    } catch {
      setMessage('Lỗi thêm Media');
    }
  };

  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold mb-6">Quản Lý Lớp Học</h1>
      {message && <div className="bg-blue-100 text-blue-800 p-3 mb-4 rounded">{message}</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* 1. Form Tạo Lớp */}
        <div className="bg-white p-6 rounded shadow">
          <h2 className="text-xl font-bold mb-4 text-blue-600">1. Tạo Lớp Mới</h2>
          <form onSubmit={handleCreateClass} className="flex gap-2">
            <input 
              type="text" placeholder="Tên lớp (VD: React K1)" 
              className="border p-2 rounded w-full"
              value={newClassName} onChange={(e) => setNewClassName(e.target.value)} required
            />
            <button className="bg-blue-600 text-white px-4 py-2 rounded">Tạo</button>
          </form>

          {/* Danh sách lớp tạm thời */}
          <div className="mt-4">
            <h3 className="font-semibold text-sm text-gray-500">Danh sách lớp vừa tạo (Copy ID):</h3>
            <ul className="mt-2 space-y-2">
              {classes.map(c => (
                <li key={c._id} className="bg-gray-50 p-2 text-sm flex justify-between">
                  <span>{c.name}</span>
                  <span className="font-mono text-gray-600 select-all">{c._id}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* 2. Form Gán Dữ Liệu */}
        <div className="bg-white p-6 rounded shadow space-y-6">
          
          {/* Gán Học Viên */}
          <div>
            <h2 className="text-lg font-bold mb-2 text-green-600">2. Thêm Học Viên vào Lớp</h2>
            <form onSubmit={handleAssignStudent} className="space-y-2">
              <input 
                type="text" placeholder="Class ID (Copy từ bên trái)" className="border p-2 w-full rounded"
                value={assignData.classId} onChange={(e) => setAssignData({...assignData, classId: e.target.value})}
              />
              <input 
                type="text" placeholder="Username học viên (VD: hocvien01)" className="border p-2 w-full rounded"
                value={assignData.studentUsername} onChange={(e) => setAssignData({...assignData, studentUsername: e.target.value})}
              />
              <button className="bg-green-600 text-white px-4 py-2 rounded w-full">Thêm Học Viên</button>
            </form>
          </div>

          <hr />

          {/* Gán Media */}
          <div>
            <h2 className="text-lg font-bold mb-2 text-purple-600">3. Thêm Media vào Lớp</h2>
            <form onSubmit={handleAssignMedia} className="space-y-2">
              <input 
                type="text" placeholder="Class ID" className="border p-2 w-full rounded"
                value={assignData.classId} onChange={(e) => setAssignData({...assignData, classId: e.target.value})}
              />
              <input 
                type="text" placeholder="Media ID (Lấy từ trang Media)" className="border p-2 w-full rounded"
                value={assignData.mediaId} onChange={(e) => setAssignData({...assignData, mediaId: e.target.value})}
              />
              <button className="bg-purple-600 text-white px-4 py-2 rounded w-full">Thêm Media</button>
            </form>
          </div>

        </div>
      </div>
    </AdminLayout>
  );
};

export default ClassManager;