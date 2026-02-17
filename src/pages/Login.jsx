import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../api/axiosClient';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(''); // Reset lỗi cũ

    try {
      // Gọi API Login
      const { data } = await axiosClient.post('/login', { username, password });

      // Lưu Token và Role vào trình duyệt
      localStorage.setItem('token', data.token);
      localStorage.setItem('role', data.role);

      // Chuyển hướng dựa trên quyền (Role)
      if (data.role === 'admin') {
        alert('Xin chào Admin!');
        navigate('/admin/dashboard');
      } else {
        alert('Đăng nhập thành công!');
        navigate('/');
      }
    } catch (err) {
      console.error(err);
      // Hiển thị lỗi từ Backend trả về
      setError(err.response?.data?.message || 'Đăng nhập thất bại. Vui lòng thử lại.');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-lg">
        <h2 className="mb-6 text-2xl font-bold text-center text-blue-600">
          E-Learning Login
        </h2>

        {error && (
          <div className="p-3 mb-4 text-sm text-red-700 bg-red-100 border border-red-400 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              Tên đăng nhập
            </label>
            <input
              type="text"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="admin"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              Mật khẩu
            </label>
            <input
              type="password"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="w-full py-2 font-bold text-white transition duration-200 bg-blue-600 rounded-lg hover:bg-blue-700"
          >
            Đăng Nhập
          </button>
        </form>
      </div>
    </div>
  );
}