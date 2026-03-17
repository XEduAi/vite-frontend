import { useRef, useState } from 'react';
import { getApiErrorMessage } from '../../api/errors';
import AdminQueryErrors from '../../components/AdminQueryErrors';
import AdminLayout from '../../components/AdminLayout';
import AdminToast from '../../components/AdminToast';
import { useAdminStudentsQuery } from '../../features/admin/lookups';
import {
  useDeleteStudentMutation,
  useImportStudentsMutation,
  useResetStudentPasswordMutation,
  useSaveStudentMutation,
} from '../../features/students/hooks';

const EMPTY_FORM = {
  username: '',
  password: '',
  fullName: '',
  phone: '',
  grade: '',
  parentName: '',
  parentPhone: '',
};

const parseCsvStudents = (text) => {
  const lines = text.split('\n').filter((line) => line.trim());

  if (lines.length === 0) {
    return [];
  }

  const headers = lines[0].split(',').map((header) => header.trim().toLowerCase());

  return lines.slice(1).map((line) => {
    const values = line.split(',').map((value) => value.trim());
    const student = {};

    headers.forEach((header, index) => {
      student[header] = values[index];
    });

    return {
      username: student.username || student['ten dang nhap'] || student['tên đăng nhập'],
      password: student.password || student['mat khau'] || student['mật khẩu'],
      fullName: student.fullname || student['họ tên'] || student['ho ten'] || student['full name'],
      phone: student.phone || student['sđt'] || student['so dien thoai'] || student['số điện thoại'],
      grade: student.grade || student['lớp'] || student['lop'],
      parentName: student.parentname || student['tên phụ huynh'] || student['ten phu huynh'],
      parentPhone: student.parentphone || student['sđt phụ huynh'] || student['sdt phu huynh'],
    };
  });
};

const parseImportFile = async (file) => {
  const text = await file.text();

  if (file.name.endsWith('.json')) {
    return JSON.parse(text);
  }

  if (file.name.endsWith('.csv')) {
    return parseCsvStudents(text);
  }

  throw new Error('Vui lòng chọn file CSV hoặc JSON');
};

const StudentManager = () => {
  const [showForm, setShowForm] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [message, setMessage] = useState({ type: '', content: '' });
  const [filterGrade, setFilterGrade] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [search, setSearch] = useState('');
  const [submittedSearch, setSubmittedSearch] = useState('');
  const [formData, setFormData] = useState({ ...EMPTY_FORM });
  const [resetModal, setResetModal] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  const [showImport, setShowImport] = useState(false);
  const [importResult, setImportResult] = useState(null);
  const fileInputRef = useRef(null);

  const studentsQuery = useAdminStudentsQuery({
    filters: {
      grade: filterGrade,
      status: filterStatus,
      search: submittedSearch,
    },
  });
  const saveStudentMutation = useSaveStudentMutation();
  const deleteStudentMutation = useDeleteStudentMutation();
  const resetStudentPasswordMutation = useResetStudentPasswordMutation();
  const importStudentsMutation = useImportStudentsMutation();

  const students = studentsQuery.data || [];
  const loading = studentsQuery.isPending;
  const importing = importStudentsMutation.isPending;

  const showMessage = (content, type = 'success') => {
    setMessage({ type, content });
    setTimeout(() => setMessage({ type: '', content: '' }), 4000);
  };

  const resetForm = () => {
    setFormData({ ...EMPTY_FORM });
    setEditingStudent(null);
    setShowForm(false);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setSubmittedSearch(search.trim());
  };

  const handleCreateOrUpdate = async (e) => {
    e.preventDefault();

    try {
      await saveStudentMutation.mutateAsync({
        studentId: editingStudent?._id,
        payload: editingStudent
          ? {
              fullName: formData.fullName,
              phone: formData.phone,
              grade: formData.grade ? Number(formData.grade) : undefined,
              parentInfo: { name: formData.parentName, phone: formData.parentPhone },
            }
          : {
              username: formData.username,
              password: formData.password,
              fullName: formData.fullName,
              phone: formData.phone || undefined,
              grade: formData.grade ? Number(formData.grade) : undefined,
              parentInfo: formData.parentName || formData.parentPhone
                ? { name: formData.parentName, phone: formData.parentPhone }
                : undefined,
            },
      });

      resetForm();
      showMessage(editingStudent ? 'Cập nhật thành công!' : 'Tạo học viên thành công!');
    } catch (error) {
      showMessage(getApiErrorMessage(error, editingStudent ? 'Lỗi cập nhật học viên' : 'Lỗi tạo học viên'), 'error');
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
      parentPhone: student.parentInfo?.phone || '',
    });
    setShowForm(true);
  };

  const handleDelete = async (studentId) => {
    if (!window.confirm('Bạn có chắc muốn xóa học viên này? Sẽ tự động gỡ khỏi tất cả lớp.')) {
      return;
    }

    try {
      await deleteStudentMutation.mutateAsync(studentId);
      if (editingStudent?._id === studentId) {
        resetForm();
      }
      showMessage('Đã xóa học viên');
    } catch (error) {
      showMessage(getApiErrorMessage(error, 'Lỗi khi xóa học viên'), 'error');
    }
  };

  const handleToggleStatus = async (student) => {
    const nextStatus = student.status === 'active' ? 'suspended' : 'active';

    try {
      await saveStudentMutation.mutateAsync({
        studentId: student._id,
        payload: { status: nextStatus },
      });

      showMessage(`Đã ${nextStatus === 'active' ? 'kích hoạt' : 'khóa'} tài khoản`);
    } catch (error) {
      showMessage(getApiErrorMessage(error, 'Lỗi khi cập nhật trạng thái'), 'error');
    }
  };

  const handleResetPassword = async () => {
    if (!newPassword || !resetModal) {
      return;
    }

    try {
      await resetStudentPasswordMutation.mutateAsync({
        studentId: resetModal._id,
        newPassword,
      });
      setResetModal(null);
      setNewPassword('');
      showMessage('Đã đặt lại mật khẩu');
    } catch (error) {
      showMessage(getApiErrorMessage(error, 'Lỗi đặt lại mật khẩu'), 'error');
    }
  };

  const handleImport = async (e) => {
    const file = e.target.files?.[0];

    if (!file) {
      return;
    }

    setImportResult(null);

    try {
      const parsedStudents = await parseImportFile(file);
      const data = await importStudentsMutation.mutateAsync(parsedStudents);
      setImportResult(data.results);
      showMessage(data.message || 'Import học viên thành công');
    } catch (error) {
      showMessage(getApiErrorMessage(error, error.message || 'Lỗi khi import học viên'), 'error');
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const queryErrors = studentsQuery.isError
    ? [
        {
          key: 'students',
          message: getApiErrorMessage(studentsQuery.error, 'Không thể tải danh sách học viên'),
          onRetry: () => studentsQuery.refetch(),
        },
      ]
    : [];

  return (
    <AdminLayout>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6 fade-in">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
            Quản lý Học viên
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
            {students.length} học viên trong hệ thống
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => {
              if (showForm && !editingStudent) {
                resetForm();
                return;
              }
              resetForm();
              setShowForm(true);
            }}
            className={showForm && !editingStudent ? 'btn-secondary flex items-center gap-2' : 'btn-primary flex items-center gap-2'}
          >
            {showForm && !editingStudent ? '✕ Đóng' : '+ Thêm học viên'}
          </button>
          <button
            onClick={() => setShowImport(true)}
            className="btn-secondary flex items-center gap-2"
          >
            📥 Import Excel
          </button>
        </div>
      </div>

      <AdminToast message={message.content} type={message.type} />

      <AdminQueryErrors errors={queryErrors} />

      {showForm && (
        <div className="card p-6 mb-6 fade-in-up">
          <h2
            className="font-display font-semibold text-sm mb-5 pb-3 border-b"
            style={{ color: 'var(--text-primary)', borderColor: 'var(--border-light)' }}
          >
            {editingStudent ? `Chỉnh sửa: ${editingStudent.fullName}` : 'Tạo học viên mới'}
          </h2>
          <form onSubmit={handleCreateOrUpdate} className="grid grid-cols-1 sm:grid-cols-2 gap-4 stagger-children">
            {!editingStudent && (
              <>
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Tên đăng nhập *</label>
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    className="input"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Mật khẩu *</label>
                  <input
                    type="text"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="input"
                    required
                  />
                </div>
              </>
            )}
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Họ và tên *</label>
              <input
                type="text"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                className="input"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Số điện thoại</label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="input"
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Khối lớp</label>
              <select
                value={formData.grade}
                onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                className="input"
              >
                <option value="">-- Chọn --</option>
                {[6, 7, 8, 9, 10, 11, 12].map((grade) => (
                  <option key={grade} value={grade}>Lớp {grade}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Tên phụ huynh</label>
              <input
                type="text"
                value={formData.parentName}
                onChange={(e) => setFormData({ ...formData, parentName: e.target.value })}
                className="input"
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>SĐT phụ huynh</label>
              <input
                type="text"
                value={formData.parentPhone}
                onChange={(e) => setFormData({ ...formData, parentPhone: e.target.value })}
                className="input"
              />
            </div>
            <div className="sm:col-span-2 flex gap-2 pt-1">
              <button type="submit" disabled={saveStudentMutation.isPending} className="btn-primary disabled:opacity-60">
                {editingStudent ? 'Lưu thay đổi' : 'Tạo học viên'}
              </button>
              <button type="button" onClick={resetForm} className="btn-secondary">
                Hủy
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="card p-4 mb-4 fade-in">
        <form onSubmit={handleSearch} className="flex flex-wrap gap-2.5 items-end">
          <div className="flex-1 min-w-36">
            <label className="block text-xs mb-1.5" style={{ color: 'var(--text-muted)' }}>Tìm kiếm</label>
            <input
              type="text"
              placeholder="Tên hoặc username..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input"
            />
          </div>
          <div>
            <label className="block text-xs mb-1.5" style={{ color: 'var(--text-muted)' }}>Khối lớp</label>
            <select value={filterGrade} onChange={(e) => setFilterGrade(e.target.value)} className="input w-32">
              <option value="">Tất cả</option>
              {[6, 7, 8, 9, 10, 11, 12].map((grade) => (
                <option key={grade} value={grade}>Lớp {grade}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs mb-1.5" style={{ color: 'var(--text-muted)' }}>Trạng thái</label>
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="input w-36">
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

      <div className="card overflow-hidden fade-in-up">
        {loading ? (
          <div className="p-6 space-y-3">
            {[...Array(5)].map((_, index) => (
              <div key={index} className="flex items-center gap-4">
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
                  {['Học viên', 'Username', 'Lớp', 'Điện thoại', 'Trạng thái', 'Ngày tạo', 'Thao tác'].map((header) => (
                    <th key={header} className="px-5 py-3 text-left text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>
                      {header.toUpperCase()}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {students.map((student) => (
                  <tr key={student._id} className="table-row border-b" style={{ borderColor: 'var(--border-light)' }}>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0"
                          style={{ background: 'var(--amber-soft)', color: 'var(--amber-warm)' }}
                        >
                          {student.fullName?.charAt(0)?.toUpperCase()}
                        </div>
                        <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{student.fullName}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 font-mono text-xs" style={{ color: 'var(--text-muted)' }}>{student.username}</td>
                    <td className="px-5 py-3.5 text-sm">
                      {student.grade ? (
                        <span className="badge badge-amber">Lớp {student.grade}</span>
                      ) : (
                        <span style={{ color: 'var(--text-muted)' }}>--</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-sm" style={{ color: 'var(--text-secondary)' }}>{student.phone || '--'}</td>
                    <td className="px-5 py-3.5">
                      <span className={`badge ${student.status === 'active' ? 'badge-green' : 'badge-red'}`}>
                        {student.status === 'active' ? 'Đang học' : 'Đã khóa'}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-sm" style={{ color: 'var(--text-muted)' }}>
                      {new Date(student.createdAt).toLocaleDateString('vi-VN')}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1">
                        <button onClick={() => handleEdit(student)} className="badge badge-blue cursor-pointer hover:opacity-80 transition-opacity">
                          Sửa
                        </button>
                        <button
                          onClick={() => handleToggleStatus(student)}
                          className={`badge cursor-pointer hover:opacity-80 transition-opacity ${student.status === 'active' ? 'badge-amber' : 'badge-green'}`}
                        >
                          {student.status === 'active' ? 'Khóa' : 'Mở'}
                        </button>
                        <button
                          onClick={() => {
                            setResetModal(student);
                            setNewPassword('');
                          }}
                          className="badge badge-purple cursor-pointer hover:opacity-80 transition-opacity"
                        >
                          MK
                        </button>
                        <button onClick={() => handleDelete(student._id)} className="badge badge-red cursor-pointer hover:opacity-80 transition-opacity">
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

      {resetModal && (
        <div className="modal-overlay fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setResetModal(null)}>
          <div className="modal-content card p-6 w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
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
              <button onClick={handleResetPassword} disabled={resetStudentPasswordMutation.isPending} className="btn-primary disabled:opacity-60">
                Xác nhận
              </button>
            </div>
          </div>
        </div>
      )}

      {showImport && (
        <div
          className="modal-overlay fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={() => {
            setShowImport(false);
            setImportResult(null);
          }}
        >
          <div className="modal-content card p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-display font-semibold text-base mb-1" style={{ color: 'var(--text-primary)' }}>
              Import học viên từ Excel
            </h3>
            <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
              Chọn file CSV hoặc JSON chứa danh sách học viên
            </p>

            <div className="mb-4 p-4 rounded-xl" style={{ background: 'var(--bg-secondary)' }}>
              <p className="text-xs font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Định dạng file:</p>
              <ul className="text-xs space-y-1" style={{ color: 'var(--text-muted)' }}>
                <li>• CSV: username, password, fullName, phone, grade, parentName, parentPhone</li>
                <li>• JSON: Array với các trường tương tự</li>
              </ul>
            </div>

            <input
              type="file"
              ref={fileInputRef}
              accept=".csv,.json"
              onChange={handleImport}
              className="input mb-4"
              disabled={importing}
            />

            {importing && (
              <div className="text-center py-2 mb-4">
                <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Đang import...</span>
              </div>
            )}

            {importResult && (
              <div
                className="mb-4 p-3 rounded-xl text-sm"
                style={{
                  background: importResult.failed > 0 ? 'rgba(239,68,68,0.1)' : 'rgba(34,197,94,0.1)',
                  color: importResult.failed > 0 ? '#ef4444' : 'var(--success)',
                }}
              >
                <p>Thành công: {importResult.success}</p>
                <p>Thất bại: {importResult.failed}</p>
                {importResult.errors.length > 0 && (
                  <details className="mt-2">
                    <summary className="cursor-pointer text-xs">Xem lỗi</summary>
                    <ul className="mt-1 text-xs">
                      {importResult.errors.slice(0, 5).map((error, index) => (
                        <li key={`${error}-${index}`}>• {error}</li>
                      ))}
                      {importResult.errors.length > 5 && (
                        <li>... và {importResult.errors.length - 5} lỗi khác</li>
                      )}
                    </ul>
                  </details>
                )}
              </div>
            )}

            <div className="flex gap-2 justify-end">
              <button
                onClick={() => {
                  setShowImport(false);
                  setImportResult(null);
                }}
                className="btn-secondary"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default StudentManager;
