import { Link, useNavigate } from 'react-router-dom';

const AdminLayout = ({ children }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Xóa token và chuyển về trang login
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar bên trái */}
      <div className="w-64 bg-white shadow-md flex flex-col">
        <div className="p-6 text-2xl font-bold text-blue-600 border-b">
          Admin Panel
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          <Link to="/admin/dashboard" className="block px-4 py-2 text-gray-700 rounded hover:bg-blue-50 hover:text-blue-600 transition">
            🏠 Trang chủ
          </Link>
          <Link to="/admin/create-student" className="block px-4 py-2 text-gray-700 rounded hover:bg-blue-50 hover:text-blue-600 transition">
            ➕ Tạo Học Viên
          </Link>
           {/* Sau này sẽ thêm menu Upload Media ở đây */}
          <Link to="/admin/upload" className="block px-4 py-2 text-gray-700 rounded hover:bg-blue-50 hover:text-blue-600 transition">
            ☁️ Quản lý Media (R2)
          </Link>
        </nav>

        <div className="p-4 border-t">
          <button 
            onClick={handleLogout}
            className="w-full px-4 py-2 text-sm font-medium text-red-600 border border-red-200 rounded hover:bg-red-50"
          >
            Đăng xuất
          </button>
        </div>
      </div>

      {/* Nội dung chính bên phải (thay đổi tùy trang) */}
      <div className="flex-1 overflow-y-auto p-8">
        {children}
      </div>
    </div>
  );
};

export default AdminLayout;