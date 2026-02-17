import { useState, useEffect } from 'react';
import axiosClient from '../../api/axiosClient';
import AdminLayout from '../../components/AdminLayout';

const StudentManager = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [message, setMessage] = useState({ type: '', content: '' });

  // Filters
  const [filterGrade, setFilterGrade] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [search, setSearch] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    username: '', password: '', fullName: '',
    phone: '', grade: '', parentName: '', parentPhone: ''
  });

  // Reset password modal
  const [resetModal, setResetModal] = useState(null);
  const [newPassword, setNewPassword] = useState('');

  useEffect(() => {
    fetchStudents();
  }, [filterGrade, filterStatus]);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filterGrade) params.grade = filterGrade;
      if (filterStatus) params.status = filterStatus;
      if (search) params.search = search;
      const res = await axiosClient.get('/students', { params });
      setStudents(res.data.students || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchStudents();
  };

  const showMessage = (content, type = 'success') => {
    setMessage({ type, content });
    setTimeout(() => setMessage({ type: '', content: '' }), 4000);
  };

  const resetForm = () => {
    setFormData({ username: '', password: '', fullName: '', phone: '', grade: '', parentName: '', parentPhone: '' });
    setEditingStudent(null);
    setShowForm(false);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        username: formData.username,
        password: formData.password,
        fullName: formData.fullName,
        phone: formData.phone || undefined,
        grade: formData.grade ? Number(formData.grade) : undefined,
        parentInfo: (formData.parentName || formData.parentPhone)
          ? { name: formData.parentName, phone: formData.parentPhone }
          : undefined
      };
      const res = await axiosClient.post('/students', payload);
      setStudents([res.data.student, ...students]);
      resetForm();
      showMessage('Tạo học viên thành công!');
    } catch (error) {
      showMessage(error.response?.data?.message || 'Lỗi tạo học viên', 'error');
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        fullName: formData.fullName,
        phone: formData.phone,
        grade: formData.grade ? Number(formData.grade) : undefined,
        parentInfo: { name: formData.parentName, phone: formData.parentPhone }
      };
      const res = await axiosClient.put(`/students/${editingStudent._id}`, payload);
      setStudents(students.map(s => s._id === editingStudent._id ? res.data.student : s));
      resetForm();
      showMessage('Cập nhật thành công!');
    } catch (error) {
      showMessage(error.response?.data?.message || 'Lỗi cập nhật', 'error');
    }
  };

  const handleEdit = (student) => {
    setEditingStudent(student);
    setFormData({
      username: student.username,
      password: '',
      fullName: student.fullName,
      phone: student.phone || '',
      grade: student.grade || '',
      parentName: student.parentInfo?.name || '',
      parentPhone: student.parentInfo?.phone || ''
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc muốn xóa học viên này? Sẽ tự động gỡ khỏi tất cả lớp.')) return;
    try {
      await axiosClient.delete(`/students/${id}`);
      setStudents(students.filter(s => s._id !== id));
      showMessage('Đã xóa học viên');
    } catch (error) {
      showMessage('Lỗi khi xóa', error);
    }
  };

  const handleToggleStatus = async (student) => {
    const newStatus = student.status === 'active' ? 'suspended' : 'active';
    try {
      const res = await axiosClient.put(`/students/${student._id}`, { status: newStatus });
      setStudents(students.map(s => s._id === student._id ? res.data.student : s));
      showMessage(`Đã ${newStatus === 'active' ? 'kích hoạt' : 'khóa'} tài khoản`);
    } catch (error) {
      showMessage('Lỗi', error);
    }
  };

  const handleResetPassword = async () => {
    if (!newPassword) return;
    try {
      await axiosClient.put(`/students/${resetModal._id}/reset-password`, { newPassword });
      setResetModal(null);
      setNewPassword('');
      showMessage('Đã đặt lại mật khẩu');
    } catch (error) {
      showMessage('Lỗi đặt lại mật khẩu', error);
    }
  };

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Quản lý Học viên</h1>
        <button
          onClick={() => { resetForm(); setShowForm(!showForm); }}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm"
        >
          {showForm && !editingStudent ? 'Đóng' : '+ Thêm học viên'}
        </button>
      </div>

      {/* Message */}
      {message.content && (
        <div className={`p-3 mb-4 rounded text-sm ${message.type === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
          {message.content}
        </div>
      )}

      {/* Create / Edit Form */}
      {showForm && (
        <div className="bg-white p-6 rounded shadow mb-6">
          <h2 className="text-lg font-semibold mb-4">
            {editingStudent ? `Sửa: ${editingStudent.fullName}` : 'Tạo học viên mới'}
          </h2>
          <form onSubmit={editingStudent ? handleUpdate : handleCreate} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {!editingStudent && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tên đăng nhập *</label>
                  <input type="text" value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    className="w-full border rounded px-3 py-2 text-sm" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu *</label>
                  <input type="text" value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full border rounded px-3 py-2 text-sm" required />
                </div>
              </>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Họ và tên *</label>
              <input type="text" value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                className="w-full border rounded px-3 py-2 text-sm" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại</label>
              <input type="text" value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full border rounded px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Khối lớp</label>
              <select value={formData.grade}
                onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                className="w-full border rounded px-3 py-2 text-sm">
                <option value="">-- Chọn --</option>
                {[6,7,8,9,10,11,12].map(g => <option key={g} value={g}>Lớp {g}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tên phụ huynh</label>
              <input type="text" value={formData.parentName}
                onChange={(e) => setFormData({ ...formData, parentName: e.target.value })}
                className="w-full border rounded px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">SĐT phụ huynh</label>
              <input type="text" value={formData.parentPhone}
                onChange={(e) => setFormData({ ...formData, parentPhone: e.target.value })}
                className="w-full border rounded px-3 py-2 text-sm" />
            </div>
            <div className="md:col-span-2 flex gap-2">
              <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 text-sm">
                {editingStudent ? 'Cập nhật' : 'Tạo học viên'}
              </button>
              <button type="button" onClick={resetForm} className="px-6 py-2 rounded border text-sm hover:bg-gray-50">
                Hủy
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white p-4 rounded shadow mb-4">
        <form onSubmit={handleSearch} className="flex flex-wrap gap-3 items-end">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Tìm kiếm</label>
            <input type="text" placeholder="Tên hoặc username..." value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="border rounded px-3 py-1.5 text-sm w-48" />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Khối lớp</label>
            <select value={filterGrade} onChange={(e) => setFilterGrade(e.target.value)}
              className="border rounded px-3 py-1.5 text-sm">
              <option value="">Tất cả</option>
              {[6,7,8,9,10,11,12].map(g => <option key={g} value={g}>Lớp {g}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Trạng thái</label>
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
              className="border rounded px-3 py-1.5 text-sm">
              <option value="">Tất cả</option>
              <option value="active">Đang học</option>
              <option value="suspended">Đã khóa</option>
            </select>
          </div>
          <button type="submit" className="bg-gray-100 hover:bg-gray-200 px-4 py-1.5 rounded text-sm font-medium">
            Tìm
          </button>
        </form>
      </div>

      {/* Student Table */}
      <div className="bg-white rounded shadow overflow-hidden">
        {loading ? (
          <p className="text-center text-gray-500 py-8">Đang tải...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                <tr>
                  <th className="px-4 py-3 text-left">Họ tên</th>
                  <th className="px-4 py-3 text-left">Username</th>
                  <th className="px-4 py-3 text-left">Lớp</th>
                  <th className="px-4 py-3 text-left">SĐT</th>
                  <th className="px-4 py-3 text-left">Trạng thái</th>
                  <th className="px-4 py-3 text-left">Ngày tạo</th>
                  <th className="px-4 py-3 text-left">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {students.map((s) => (
                  <tr key={s._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium">{s.fullName}</td>
                    <td className="px-4 py-3 text-gray-500 font-mono text-xs">{s.username}</td>
                    <td className="px-4 py-3">{s.grade ? `Lớp ${s.grade}` : '—'}</td>
                    <td className="px-4 py-3 text-gray-500">{s.phone || '—'}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        s.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {s.status === 'active' ? 'Đang học' : 'Đã khóa'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {new Date(s.createdAt).toLocaleDateString('vi-VN')}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2 text-xs">
                        <button onClick={() => handleEdit(s)} className="text-blue-600 hover:underline">Sửa</button>
                        <button onClick={() => handleToggleStatus(s)}
                          className={`${s.status === 'active' ? 'text-yellow-600' : 'text-green-600'} hover:underline`}>
                          {s.status === 'active' ? 'Khóa' : 'Mở'}
                        </button>
                        <button onClick={() => { setResetModal(s); setNewPassword(''); }}
                          className="text-purple-600 hover:underline">MK</button>
                        <button onClick={() => handleDelete(s._id)} className="text-red-600 hover:underline">Xóa</button>
                      </div>
                    </td>
                  </tr>
                ))}
                {students.length === 0 && (
                  <tr><td colSpan="7" className="px-4 py-8 text-center text-gray-500">Chưa có học viên nào</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Reset Password Modal */}
      {resetModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-sm shadow-xl">
            <h3 className="text-lg font-semibold mb-2">Đặt lại mật khẩu</h3>
            <p className="text-sm text-gray-500 mb-4">Cho: <strong>{resetModal.fullName}</strong></p>
            <input type="text" placeholder="Mật khẩu mới" value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full border rounded px-3 py-2 text-sm mb-4" />
            <div className="flex gap-2 justify-end">
              <button onClick={() => setResetModal(null)} className="px-4 py-2 rounded border text-sm hover:bg-gray-50">Hủy</button>
              <button onClick={handleResetPassword} className="px-4 py-2 rounded bg-blue-600 text-white text-sm hover:bg-blue-700">Xác nhận</button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default StudentManager;
