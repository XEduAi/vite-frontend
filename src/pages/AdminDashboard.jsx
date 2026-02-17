import AdminLayout from '../components/AdminLayout';

const AdminDashboard = () => {
  return (
    <AdminLayout>
      <h1 className="text-3xl font-bold text-gray-800 mb-4">Tổng quan</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card thống kê giả lập */}
        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-blue-500">
          <h3 className="text-gray-500 text-sm font-medium">Tổng số học viên</h3>
          <p className="text-2xl font-bold text-gray-800 mt-2">12</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-green-500">
          <h3 className="text-gray-500 text-sm font-medium">Khóa học đang hoạt động</h3>
          <p className="text-2xl font-bold text-gray-800 mt-2">5</p>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;