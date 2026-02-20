import { useState, useEffect } from 'react';
import axiosClient from '../../api/axiosClient';
import AdminLayout from '../../components/AdminLayout';

const StudentManager = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [message, setMessage] = useState({ type: '', content: '' });

  const [filterGrade, setFilterGrade] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [search, setSearch] = useState('');

  const [formData, setFormData] = useState({
    username: '', password: '', fullName: '',
    phone: '', grade: '', parentName: '', parentPhone: ''
  });

  const [resetModal, setResetModal] = useState(null);
  const [newPassword, setNewPassword] = useState('');

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { fetchStudents(); }, [filterGrade, filterStatus]);

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

  const handleSearch = (e) => { e.preventDefault(); fetchStudents(); };

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
        username: formData.username, password: formData.password, fullName: formData.fullName,
        phone: formData.phone || undefined,
        grade: formData.grade ? Number(formData.grade) : undefined,
        parentInfo: (formData.parentName || formData.parentPhone)
          ? { name: formData.parentName, phone: formData.parentPhone } : undefined
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
        fullName: formData.fullName, phone: formData.phone,
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
      username: student.username, password: '',
      fullName: student.fullName, phone: student.phone || '',
      grade: student.grade || '', parentName: student.parentInfo?.name || '',
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
    } catch {
      showMessage('Lỗi khi xóa', 'error');
    }
  };

  const handleToggleStatus = async (student) => {
    const newStatus = student.status === 'active' ? 'suspended' : 'active';
    try {
      const res = await axiosClient.put(`/students/${student._id}`, { status: newStatus });
      setStudents(students.map(s => s._id === student._id ? res.data.student : s));
      showMessage(`Đã ${newStatus === 'active' ? 'kích hoạt' : 'khóa'} tài khoản`);
    } catch {
      showMessage('Lỗi', 'error');
    }
  };

  const handleResetPassword = async () => {
    if (!newPassword) return;
    try {
      await axiosClient.put(`/students/${resetModal._id}/reset-password`, { newPassword });
      setResetModal(null);
      setNewPassword('');
      showMessage('Đã đặt lại mật khẩu');
    } catch {
      showMessage('Lỗi đặt lại mật khẩu', 'error');
    }
  };

  return (
    <AdminLayout>
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6 fade-in">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
            Quản lý Học viên
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
            {students.length} học viên trong hệ thống
          </p>
        </div>
        <button
          onClick={() => { resetForm(); setShowForm(!showForm); }}
          className={showForm && !editingStudent ? 'btn-secondary flex items-center gap-2' : 'btn-primary flex items-center gap-2'}
        >
          {showForm && !editingStudent ? '✕ Đóng' : '+ Thêm học viên'}
        </button>
      </div>

      {/* Toast message */}
      {message.content && (
        <div className={`toast mb-5 ${message.type === 'error' ? 'toast-error' : 'toast-success'}`}>
          {message.type === 'error' ? '⚠' : '✓'} {message.content}
        </div>
      )}

      {/* Create / Edit Form */}
      {showForm && (
        <div className="card p-6 mb-6 fade-in-up">
          <h2
            className="font-display font-semibold text-sm mb-5 pb-3 border-b"
            style={{ color: 'var(--text-primary)', borderColor: 'var(--border-light)' }}
          >
            {editingStudent ? `Chỉnh sửa: ${editingStudent.fullName}` : 'Tạo học viên mới'}
          </h2>
          <form onSubmit={editingStudent ? handleUpdate : handleCreate} className="grid grid-cols-1 sm:grid-cols-2 gap-4 stagger-children">
            {!editingStudent && (
              <>
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Tên đăng nhập *</label>
                  <input type="text" value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    className="input" required />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Mật khẩu *</label>
                  <input type="text" value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="input" required />
                </div>
              </>
            )}
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Họ và tên *</label>
              <input type="text" value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                className="input" required />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Số điện thoại</label>
              <input type="text" value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="input" />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Khối lớp</label>
              <select value={formData.grade}
                onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                className="input">
                <option value="">-- Chọn --</option>
                {[6, 7, 8, 9, 10, 11, 12].map(g => <option key={g} value={g}>Lớp {g}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Tên phụ huynh</label>
              <input type="text" value={formData.parentName}
                onChange={(e) => setFormData({ ...formData, parentName: e.target.value })}
                className="input" />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>SĐT phụ huynh</label>
              <input type="text" value={formData.parentPhone}
                onChange={(e) => setFormData({ ...formData, parentPhone: e.target.value })}
                className="input" />
            </div>
            <div className="sm:col-span-2 flex gap-2 pt-1">
              <button type="submit" className="btn-primary">
                {editingStudent ? 'Lưu thay đổi' : 'Tạo học viên'}
              </button>
              <button type="button" onClick={resetForm} className="btn-secondary">
                Hủy
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filters */}
      <div className="card p-4 mb-4 fade-in">
        <form onSubmit={handleSearch} className="flex flex-wrap gap-2.5 items-end">
          <div className="flex-1 min-w-36">
            <label className="block text-xs mb-1.5" style={{ color: 'var(--text-muted)' }}>Tìm kiếm</label>
            <input type="text" placeholder="Tên hoặc username..." value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input" />
          </div>
          <div>
            <label className="block text-xs mb-1.5" style={{ color: 'var(--text-muted)' }}>Khối lớp</label>
            <select value={filterGrade} onChange={(e) => setFilterGrade(e.target.value)}
              className="input w-32">
              <option value="">Tất cả</option>
              {[6, 7, 8, 9, 10, 11, 12].map(g => <option key={g} value={g}>Lớp {g}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs mb-1.5" style={{ color: 'var(--text-muted)' }}>Trạng thái</label>
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
              className="input w-36">
              <option value="">Tất cả</option>
              <option value="active">Đang học</option>
              <option value="suspended">Đã khóa</option>
            </select>
          </div>
          <button type="submit" className="btn-primary">
            Tìm
          </button>
        </form>
      </div>

      {/* Student Table */}
      <div className="card overflow-hidden fade-in-up">
        {loading ? (
          <div className="p-6 space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="skeleton w-8 h-8 rounded-full flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="skeleton h-4 w-1/3" />
                  <div className="skeleton h-3 w-1/5" />
                </div>
                <div className="skeleton h-6 w-16 rounded-full" />
              </div>
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr style={{ background: 'var(--cream)', borderBottom: '1px solid var(--border-light)' }}>
                  {['Học viên', 'Username', 'Lớp', 'Điện thoại', 'Trạng thái', 'Ngày tạo', 'Thao tác'].map(h => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>
                      {h.toUpperCase()}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {students.map((s) => (
                  <tr
                    key={s._id}
                    className="table-row border-b"
                    style={{ borderColor: 'var(--border-light)' }}
                  >
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0"
                          style={{ background: 'var(--amber-soft)', color: 'var(--amber-warm)' }}
                        >
                          {s.fullName?.charAt(0)?.toUpperCase()}
                        </div>
                        <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{s.fullName}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 font-mono text-xs" style={{ color: 'var(--text-muted)' }}>{s.username}</td>
                    <td className="px-5 py-3.5 text-sm">
                      {s.grade ? (
                        <span className="badge badge-amber">Lớp {s.grade}</span>
                      ) : (
                        <span style={{ color: 'var(--text-muted)' }}>--</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-sm" style={{ color: 'var(--text-secondary)' }}>{s.phone || '--'}</td>
                    <td className="px-5 py-3.5">
                      <span className={`badge ${s.status === 'active' ? 'badge-green' : 'badge-red'}`}>
                        {s.status === 'active' ? 'Đang học' : 'Đã khóa'}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-sm" style={{ color: 'var(--text-muted)' }}>
                      {new Date(s.createdAt).toLocaleDateString('vi-VN')}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleEdit(s)}
                          className="badge badge-blue cursor-pointer hover:opacity-80 transition-opacity"
                        >
                          Sửa
                        </button>
                        <button
                          onClick={() => handleToggleStatus(s)}
                          className={`badge cursor-pointer hover:opacity-80 transition-opacity ${s.status === 'active' ? 'badge-amber' : 'badge-green'}`}
                        >
                          {s.status === 'active' ? 'Khóa' : 'Mở'}
                        </button>
                        <button
                          onClick={() => { setResetModal(s); setNewPassword(''); }}
                          className="badge badge-purple cursor-pointer hover:opacity-80 transition-opacity"
                        >
                          MK
                        </button>
                        <button
                          onClick={() => handleDelete(s._id)}
                          className="badge badge-red cursor-pointer hover:opacity-80 transition-opacity"
                        >
                          Xóa
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {students.length === 0 && (
                  <tr>
                    <td colSpan="7" className="px-5 py-12 text-center text-sm" style={{ color: 'var(--text-muted)' }}>
                      Chưa có học viên nào
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Reset Password Modal */}
      {resetModal && (
        <div
          className="modal-overlay fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={() => setResetModal(null)}
        >
          <div
            className="modal-content card p-6 w-full max-w-sm"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-display font-semibold text-base mb-1" style={{ color: 'var(--text-primary)' }}>
              Đặt lại mật khẩu
            </h3>
            <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
              Cho: <strong>{resetModal.fullName}</strong>
            </p>
            <input
              type="text"
              placeholder="Mật khẩu mới"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="input mb-4"
              autoFocus
            />
            <div className="flex gap-2 justify-end">
              <button onClick={() => setResetModal(null)} className="btn-secondary">
                Hủy
              </button>
              <button onClick={handleResetPassword} className="btn-primary">
                Xác nhận
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default StudentManager;
