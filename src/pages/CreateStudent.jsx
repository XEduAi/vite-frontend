import { useState } from 'react';
import axiosClient from '../api/axiosClient';
import AdminLayout from '../components/AdminLayout';

const CreateStudent = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    fullName: ''
  });
  const [message, setMessage] = useState({ type: '', content: '' });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: '', content: '' });

    try {
      // Gọi API Backend (Token đã tự động được axiosClient gắn vào)
      await axiosClient.post('/admin/create-student', formData);
      
      setMessage({ type: 'success', content: 'Tạo tài khoản học viên thành công!' });
      // Reset form
      setFormData({ username: '', password: '', fullName: '' });
      
    } catch (error) {
      setMessage({ 
        type: 'error', 
        content: error.response?.data?.message || 'Có lỗi xảy ra khi tạo tài khoản.' 
      });
    }
  };

  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Tạo Tài Khoản Học Viên Mới</h1>
      
      <div className="max-w-xl bg-white p-6 rounded-lg shadow">
        {message.content && (
          <div className={`p-4 mb-4 text-sm rounded ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {message.content}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Họ và tên</label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Tên đăng nhập (Username)</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Mật khẩu mặc định</label>
            <input
              type="text" // Để text cho Admin dễ nhìn khi tạo
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none"
          >
            Tạo Tài Khoản
          </button>
        </form>
      </div>
    </AdminLayout>
  );
};

export default CreateStudent;