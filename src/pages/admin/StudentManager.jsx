import { useState, useEffect } from 'react';
import axiosClient from '../../api/axiosClient';
import AdminLayout from '../../components/AdminLayout';

// ── Shared input style ──
const inputCls = 'w-full px-3.5 py-2.5 rounded-xl border text-sm transition-all';
const inputStyle = { borderColor: '#e5ddd0', background: '#ffffff', color: '#1c1917' };

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

  const selectCls = 'px-3.5 py-2.5 rounded-xl border text-sm transition-all bg-white';
  const selectStyle = { borderColor: '#e5ddd0', color: '#1c1917' };

  return (
    <AdminLayout>
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="font-display text-2xl font-semibold" style={{ color: '#1c1917' }}>Quản lý Học viên</h1>
          <p className="text-sm mt-0.5" style={{ color: '#78716c' }}>{students.length} học viên trong hệ thống</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowForm(!showForm); }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-white transition-all"
          style={{ background: '#e8850a' }}
          onMouseEnter={(e) => e.currentTarget.style.background = '#d4740a'}
          onMouseLeave={(e) => e.currentTarget.style.background = '#e8850a'}
        >
          {showForm && !editingStudent ? '✕ Đóng' : '+ Thêm học viên'}
        </button>
      </div>

      {/* Toast message */}
      {message.content && (
        <div
          className="flex items-center gap-2.5 p-3.5 rounded-xl mb-5 text-sm border fade-in"
          style={
            message.type === 'error'
              ? { background: '#fef2f2', borderColor: '#fecaca', color: '#b91c1c' }
              : { background: '#f0fdf4', borderColor: '#bbf7d0', color: '#166534' }
          }
        >
          {message.type === 'error' ? '⚠' : '✓'} {message.content}
        </div>
      )}

      {/* Create / Edit Form */}
      {showForm && (
        <div
          className="bg-white rounded-2xl border p-6 mb-6 fade-in"
          style={{ borderColor: '#e5ddd0', boxShadow: '0 2px 8px rgba(160,100,20,0.07)' }}
        >
          <h2 className="font-semibold text-sm mb-5 pb-3 border-b" style={{ color: '#1c1917', borderColor: '#f0ebe4' }}>
            {editingStudent ? `Chỉnh sửa: ${editingStudent.fullName}` : 'Tạo học viên mới'}
          </h2>
          <form onSubmit={editingStudent ? handleUpdate : handleCreate} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {!editingStudent && (
              <>
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: '#78716c' }}>Tên đăng nhập *</label>
                  <input type="text" value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    className={inputCls} style={inputStyle} required />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: '#78716c' }}>Mật khẩu *</label>
                  <input type="text" value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className={inputCls} style={inputStyle} required />
                </div>
              </>
            )}
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: '#78716c' }}>Họ và tên *</label>
              <input type="text" value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                className={inputCls} style={inputStyle} required />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: '#78716c' }}>Số điện thoại</label>
              <input type="text" value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className={inputCls} style={inputStyle} />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: '#78716c' }}>Khối lớp</label>
              <select value={formData.grade}
                onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                className={`${selectCls} w-full`} style={selectStyle}>
                <option value="">-- Chọn --</option>
                {[6, 7, 8, 9, 10, 11, 12].map(g => <option key={g} value={g}>Lớp {g}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: '#78716c' }}>Tên phụ huynh</label>
              <input type="text" value={formData.parentName}
                onChange={(e) => setFormData({ ...formData, parentName: e.target.value })}
                className={inputCls} style={inputStyle} />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: '#78716c' }}>SĐT phụ huynh</label>
              <input type="text" value={formData.parentPhone}
                onChange={(e) => setFormData({ ...formData, parentPhone: e.target.value })}
                className={inputCls} style={inputStyle} />
            </div>
            <div className="sm:col-span-2 flex gap-2 pt-1">
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl text-sm font-medium text-white transition-all"
                style={{ background: '#e8850a' }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#d4740a'}
                onMouseLeave={(e) => e.currentTarget.style.background = '#e8850a'}
              >
                {editingStudent ? 'Lưu thay đổi' : 'Tạo học viên'}
              </button>
              <button
                type="button" onClick={resetForm}
                className="px-5 py-2.5 rounded-xl border text-sm font-medium transition-all"
                style={{ borderColor: '#e5ddd0', color: '#78716c', background: '#faf7f2' }}
              >
                Hủy
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filters */}
      <div
        className="bg-white rounded-2xl border p-4 mb-4"
        style={{ borderColor: '#e5ddd0', boxShadow: '0 1px 3px rgba(160,100,20,0.06)' }}
      >
        <form onSubmit={handleSearch} className="flex flex-wrap gap-2.5 items-end">
          <div className="flex-1 min-w-36">
            <label className="block text-xs mb-1.5" style={{ color: '#a8a29e' }}>Tìm kiếm</label>
            <input type="text" placeholder="Tên hoặc username..." value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border text-sm"
              style={{ borderColor: '#e5ddd0', background: '#faf7f2' }} />
          </div>
          <div>
            <label className="block text-xs mb-1.5" style={{ color: '#a8a29e' }}>Khối lớp</label>
            <select value={filterGrade} onChange={(e) => setFilterGrade(e.target.value)}
              className={`${selectCls} w-32`} style={selectStyle}>
              <option value="">Tất cả</option>
              {[6, 7, 8, 9, 10, 11, 12].map(g => <option key={g} value={g}>Lớp {g}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs mb-1.5" style={{ color: '#a8a29e' }}>Trạng thái</label>
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
              className={`${selectCls} w-36`} style={selectStyle}>
              <option value="">Tất cả</option>
              <option value="active">Đang học</option>
              <option value="suspended">Đã khóa</option>
            </select>
          </div>
          <button
            type="submit"
            className="px-4 py-2 rounded-xl text-sm font-medium transition-all"
            style={{ background: '#14213d', color: '#ffffff' }}
            onMouseEnter={(e) => e.currentTarget.style.background = '#1e3557'}
            onMouseLeave={(e) => e.currentTarget.style.background = '#14213d'}
          >
            Tìm
          </button>
        </form>
      </div>

      {/* Student Table */}
      <div
        className="bg-white rounded-2xl border overflow-hidden"
        style={{ borderColor: '#e5ddd0', boxShadow: '0 1px 3px rgba(160,100,20,0.06)' }}
      >
        {loading ? (
          <div className="py-12 text-center text-sm" style={{ color: '#a8a29e' }}>Đang tải...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr style={{ background: '#faf7f2', borderBottom: '1px solid #f0ebe4' }}>
                  {['Học viên', 'Username', 'Lớp', 'Điện thoại', 'Trạng thái', 'Ngày tạo', 'Thao tác'].map(h => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-semibold" style={{ color: '#a8a29e' }}>
                      {h.toUpperCase()}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {students.map((s) => (
                  <tr
                    key={s._id}
                    className="border-b transition-colors"
                    style={{ borderColor: '#f8f4f0' }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#fdf8f5'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0"
                          style={{ background: 'rgba(232,133,10,0.1)', color: '#e8850a' }}
                        >
                          {s.fullName?.charAt(0)?.toUpperCase()}
                        </div>
                        <span className="font-medium" style={{ color: '#1c1917' }}>{s.fullName}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 font-mono text-xs" style={{ color: '#a8a29e' }}>{s.username}</td>
                    <td className="px-5 py-3.5 text-sm" style={{ color: '#78716c' }}>
                      {s.grade ? (
                        <span className="px-2 py-0.5 rounded-lg text-xs font-medium" style={{ background: '#fef3c7', color: '#92400e' }}>
                          Lớp {s.grade}
                        </span>
                      ) : '—'}
                    </td>
                    <td className="px-5 py-3.5 text-sm" style={{ color: '#78716c' }}>{s.phone || '—'}</td>
                    <td className="px-5 py-3.5">
                      <span
                        className="px-2.5 py-1 rounded-full text-xs font-medium"
                        style={
                          s.status === 'active'
                            ? { background: '#d1fae5', color: '#065f46' }
                            : { background: '#fee2e2', color: '#991b1b' }
                        }
                      >
                        {s.status === 'active' ? 'Đang học' : 'Đã khóa'}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-sm" style={{ color: '#a8a29e' }}>
                      {new Date(s.createdAt).toLocaleDateString('vi-VN')}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleEdit(s)}
                          className="px-2.5 py-1 rounded-lg text-xs font-medium transition-all"
                          style={{ color: '#14213d', background: 'rgba(20,33,61,0.07)' }}
                          onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(20,33,61,0.14)'}
                          onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(20,33,61,0.07)'}
                        >
                          Sửa
                        </button>
                        <button
                          onClick={() => handleToggleStatus(s)}
                          className="px-2.5 py-1 rounded-lg text-xs font-medium transition-all"
                          style={
                            s.status === 'active'
                              ? { color: '#92400e', background: 'rgba(251,191,36,0.12)' }
                              : { color: '#065f46', background: 'rgba(5,150,105,0.1)' }
                          }
                        >
                          {s.status === 'active' ? 'Khóa' : 'Mở'}
                        </button>
                        <button
                          onClick={() => { setResetModal(s); setNewPassword(''); }}
                          className="px-2.5 py-1 rounded-lg text-xs font-medium transition-all"
                          style={{ color: '#5b21b6', background: 'rgba(91,33,182,0.08)' }}
                        >
                          MK
                        </button>
                        <button
                          onClick={() => handleDelete(s._id)}
                          className="px-2.5 py-1 rounded-lg text-xs font-medium transition-all"
                          style={{ color: '#991b1b', background: 'rgba(220,38,38,0.07)' }}
                          onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(220,38,38,0.14)'}
                          onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(220,38,38,0.07)'}
                        >
                          Xóa
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {students.length === 0 && (
                  <tr>
                    <td colSpan="7" className="px-5 py-12 text-center text-sm" style={{ color: '#a8a29e' }}>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.5)' }}>
          <div
            className="bg-white rounded-2xl p-6 w-full max-w-sm fade-in"
            style={{ boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-semibold text-base mb-1" style={{ color: '#1c1917' }}>Đặt lại mật khẩu</h3>
            <p className="text-sm mb-4" style={{ color: '#78716c' }}>Cho: <strong>{resetModal.fullName}</strong></p>
            <input
              type="text"
              placeholder="Mật khẩu mới"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border text-sm mb-4"
              style={{ borderColor: '#e5ddd0' }}
              autoFocus
            />
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setResetModal(null)}
                className="px-4 py-2 rounded-xl border text-sm font-medium"
                style={{ borderColor: '#e5ddd0', color: '#78716c' }}
              >
                Hủy
              </button>
              <button
                onClick={handleResetPassword}
                className="px-4 py-2 rounded-xl text-sm font-medium text-white"
                style={{ background: '#e8850a' }}
              >
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
