import { useState, useEffect } from 'react';
import axiosClient from '../../api/axiosClient';
import AdminLayout from '../../components/AdminLayout';

const DAYS = ['', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ nhật'];

const inputCls = 'input';
const selectCls = 'input';

const ClassManager = () => {
  const [classes, setClasses] = useState([]);
  const [students, setStudents] = useState([]);
  const [medias, setMedias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: '', content: '' });

  const [showForm, setShowForm] = useState(false);
  const [editingClass, setEditingClass] = useState(null);
  const [formData, setFormData] = useState({
    name: '', description: '', tuitionFee: '', feeType: 'monthly', scheduleTemplate: []
  });

  const [selectedClass, setSelectedClass] = useState(null);
  const [assignStudentId, setAssignStudentId] = useState('');
  const [assignMediaId, setAssignMediaId] = useState('');

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    try {
      setLoading(true);
      const [classRes, studentRes, mediaRes] = await Promise.all([
        axiosClient.get('/classes'),
        axiosClient.get('/students'),
        axiosClient.get('/media')
      ]);
      setClasses(classRes.data.classes || []);
      setStudents(studentRes.data.students || []);
      setMedias(mediaRes.data.medias || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const showMsg = (content, type = 'success') => {
    setMessage({ type, content });
    setTimeout(() => setMessage({ type: '', content: '' }), 4000);
  };

  const resetForm = () => {
    setFormData({ name: '', description: '', tuitionFee: '', feeType: 'monthly', scheduleTemplate: [] });
    setEditingClass(null);
    setShowForm(false);
  };

  const handleCreateOrUpdate = async (e) => {
    e.preventDefault();
    const payload = {
      name: formData.name, description: formData.description,
      tuitionFee: formData.tuitionFee ? Number(formData.tuitionFee) : 0,
      feeType: formData.feeType,
      scheduleTemplate: formData.scheduleTemplate.filter(s => s.day && s.time)
    };
    try {
      if (editingClass) {
        const res = await axiosClient.put(`/classes/${editingClass._id}`, payload);
        setClasses(classes.map(c => c._id === editingClass._id ? res.data.class : c));
        if (selectedClass?._id === editingClass._id) setSelectedClass(res.data.class);
        showMsg('Cập nhật lớp thành công!');
      } else {
        const res = await axiosClient.post('/classes', payload);
        setClasses([res.data.class, ...classes]);
        showMsg('Tạo lớp thành công!');
      }
      resetForm();
    } catch (error) {
      showMsg(error.response?.data?.message || 'Lỗi', 'error');
    }
  };

  const handleEdit = (cls) => {
    setEditingClass(cls);
    setFormData({
      name: cls.name, description: cls.description || '',
      tuitionFee: cls.tuitionFee || '', feeType: cls.feeType || 'monthly',
      scheduleTemplate: cls.scheduleTemplate || []
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc muốn xóa lớp này?')) return;
    try {
      await axiosClient.delete(`/classes/${id}`);
      setClasses(classes.filter(c => c._id !== id));
      if (selectedClass?._id === id) setSelectedClass(null);
      showMsg('Đã xóa lớp');
    } catch {
      showMsg('Lỗi khi xóa', 'error');
    }
  };

  const addScheduleSlot = () => {
    setFormData({ ...formData, scheduleTemplate: [...formData.scheduleTemplate, { day: 2, time: '18:00', duration: 90 }] });
  };

  const updateScheduleSlot = (index, field, value) => {
    const updated = [...formData.scheduleTemplate];
    updated[index] = { ...updated[index], [field]: field === 'day' || field === 'duration' ? Number(value) : value };
    setFormData({ ...formData, scheduleTemplate: updated });
  };

  const removeScheduleSlot = (index) => {
    setFormData({ ...formData, scheduleTemplate: formData.scheduleTemplate.filter((_, i) => i !== index) });
  };

  const handleAssignStudent = async () => {
    if (!assignStudentId || !selectedClass) return;
    try {
      const res = await axiosClient.post(`/classes/${selectedClass._id}/students`, { studentId: assignStudentId });
      setSelectedClass(res.data.class);
      setClasses(classes.map(c => c._id === selectedClass._id ? res.data.class : c));
      setAssignStudentId('');
      showMsg('Đã thêm học viên vào lớp');
    } catch (error) {
      showMsg(error.response?.data?.message || 'Lỗi', 'error');
    }
  };

  const handleRemoveStudent = async (studentId) => {
    try {
      const res = await axiosClient.delete(`/classes/${selectedClass._id}/students/${studentId}`);
      setSelectedClass(res.data.class);
      setClasses(classes.map(c => c._id === selectedClass._id ? res.data.class : c));
      showMsg('Đã gỡ học viên khỏi lớp');
    } catch {
      showMsg('Lỗi', 'error');
    }
  };

  const handleAssignMedia = async () => {
    if (!assignMediaId || !selectedClass) return;
    try {
      const res = await axiosClient.post(`/classes/${selectedClass._id}/media`, { mediaId: assignMediaId });
      setSelectedClass(res.data.class);
      setClasses(classes.map(c => c._id === selectedClass._id ? res.data.class : c));
      setAssignMediaId('');
      showMsg('Đã gán tài liệu');
    } catch (err) {
      showMsg(err.response?.data?.message || 'Lỗi', 'error');
    }
  };

  const handleRemoveMedia = async (mediaId) => {
    try {
      const res = await axiosClient.delete(`/classes/${selectedClass._id}/media/${mediaId}`);
      setSelectedClass(res.data.class);
      setClasses(classes.map(c => c._id === selectedClass._id ? res.data.class : c));
      showMsg('Đã gỡ tài liệu');
    } catch {
      showMsg('Lỗi', 'error');
    }
  };

  const viewClassDetail = async (cls) => {
    try {
      const res = await axiosClient.get(`/classes/${cls._id}`);
      setSelectedClass(res.data.class);
    } catch {
      showMsg('Lỗi tải chi tiết lớp', 'error');
    }
  };

  const availableStudents = selectedClass
    ? students.filter(s => !selectedClass.students?.some(cs => (cs._id || cs) === s._id))
    : [];
  const availableMedias = selectedClass
    ? medias.filter(m => !selectedClass.mediaResources?.some(cm => (cm._id || cm) === m._id))
    : [];

  return (
    <AdminLayout>
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="font-display text-2xl font-semibold" style={{ color: 'var(--text-primary)' }}>Quản lý Lớp học</h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>{classes.length} lớp đang hoạt động</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowForm(!showForm); }}
          className="btn-primary"
        >
          {showForm && !editingClass ? '✕ Đóng' : '+ Tạo lớp mới'}
        </button>
      </div>

      {/* Toast */}
      {message.content && (
        <div className={`toast mb-5 ${message.type === 'error' ? 'toast-error' : 'toast-success'}`}>
          {message.type === 'error' ? '⚠' : '✓'} {message.content}
        </div>
      )}

      {/* Form */}
      {showForm && (
        <div className="card p-6 mb-6 fade-in">
          <h2 className="font-semibold text-sm mb-4 pb-3 border-b" style={{ color: 'var(--text-primary)', borderColor: 'var(--border-light)' }}>
            {editingClass ? `Chỉnh sửa: ${editingClass.name}` : 'Tạo lớp mới'}
          </h2>
          <form onSubmit={handleCreateOrUpdate} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Tên lớp *</label>
                <input type="text" value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className={inputCls} required placeholder="VD: Toán 9 Nâng Cao" />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Mô tả</label>
                <input type="text" value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className={inputCls} />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Học phí (VND)</label>
                <input type="number" value={formData.tuitionFee}
                  onChange={(e) => setFormData({ ...formData, tuitionFee: e.target.value })}
                  className={inputCls} placeholder="500000" />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Loại phí</label>
                <select value={formData.feeType}
                  onChange={(e) => setFormData({ ...formData, feeType: e.target.value })}
                  className={selectCls}>
                  <option value="monthly">Theo tháng</option>
                  <option value="per_session">Theo buổi</option>
                </select>
              </div>
            </div>

            {/* Schedule */}
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <label className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>Lịch học</label>
                <button type="button" onClick={addScheduleSlot}
                  className="text-xs font-medium px-2.5 py-1 rounded-lg transition-all"
                  style={{ color: 'var(--amber-warm)', background: 'var(--amber-soft)' }}>
                  + Thêm buổi
                </button>
              </div>
              <div className="space-y-2">
                {formData.scheduleTemplate.map((slot, i) => (
                  <div key={i} className="flex gap-2 items-center flex-wrap">
                    <select value={slot.day} onChange={(e) => updateScheduleSlot(i, 'day', e.target.value)}
                      className="input w-auto">
                      {[2, 3, 4, 5, 6, 7, 1].map(d => <option key={d} value={d}>{DAYS[d]}</option>)}
                    </select>
                    <input type="time" value={slot.time}
                      onChange={(e) => updateScheduleSlot(i, 'time', e.target.value)}
                      className="input w-auto" />
                    <input type="number" value={slot.duration}
                      onChange={(e) => updateScheduleSlot(i, 'duration', e.target.value)}
                      className="input w-20" placeholder="phút" />
                    <span className="text-xs" style={{ color: 'var(--text-muted)' }}>phút</span>
                    <button type="button" onClick={() => removeScheduleSlot(i)}
                      className="text-xs px-2 py-1 rounded-lg transition-all"
                      style={{ color: 'var(--danger)', background: 'var(--danger-light)' }}>✕</button>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-2 pt-1">
              <button type="submit" className="btn-primary">
                {editingClass ? 'Lưu thay đổi' : 'Tạo lớp'}
              </button>
              <button type="button" onClick={resetForm} className="btn-secondary">
                Hủy
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Two-panel layout */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">

        {/* Class list */}
        <div
          className="lg:col-span-2 card overflow-hidden"
        >
          <div className="px-5 py-3.5 border-b" style={{ borderColor: 'var(--border-light)', background: 'var(--cream-warm)' }}>
            <h3 className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>DANH SÁCH LỚP ({classes.length})</h3>
          </div>

          {loading ? (
            <div className="py-10 text-center text-sm" style={{ color: 'var(--text-muted)' }}>Đang tải...</div>
          ) : (
            <div className="divide-y overflow-y-auto" style={{ maxHeight: 560, borderColor: 'var(--border-light)' }}>
              {classes.map(cls => (
                <div
                  key={cls._id}
                  className="p-4 cursor-pointer transition-colors"
                  style={{
                    background: selectedClass?._id === cls._id ? 'var(--amber-soft)' : 'transparent',
                    borderLeft: selectedClass?._id === cls._id ? '3px solid var(--amber-warm)' : '3px solid transparent',
                  }}
                  onClick={() => viewClassDetail(cls)}
                  onMouseEnter={(e) => { if (selectedClass?._id !== cls._id) e.currentTarget.style.background = 'var(--cream-warm)'; }}
                  onMouseLeave={(e) => { if (selectedClass?._id !== cls._id) e.currentTarget.style.background = 'transparent'; }}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h4 className="font-medium text-sm truncate" style={{ color: 'var(--text-primary)' }}>{cls.name}</h4>
                      <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                        {cls.students?.length || 0} học viên · {cls.feeType === 'monthly' ? 'Tháng' : 'Buổi'}
                      </p>
                    </div>
                    <div className="flex gap-1 flex-shrink-0">
                      <button
                        onClick={(e) => { e.stopPropagation(); handleEdit(cls); }}
                        className="p-1.5 rounded-lg transition-all text-xs"
                        style={{ color: 'var(--amber-warm)', background: 'var(--amber-soft)' }}
                      >✏</button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDelete(cls._id); }}
                        className="p-1.5 rounded-lg transition-all text-xs"
                        style={{ color: 'var(--danger)', background: 'var(--danger-light)' }}
                      >✕</button>
                    </div>
                  </div>
                </div>
              ))}
              {classes.length === 0 && (
                <div className="py-10 text-center text-sm" style={{ color: 'var(--text-muted)' }}>Chưa có lớp nào</div>
              )}
            </div>
          )}
        </div>

        {/* Class detail */}
        <div className="lg:col-span-3 space-y-4">
          {selectedClass ? (
            <>
              {/* Info card */}
              <div className="card p-5">
                <h2 className="font-display text-lg font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>{selectedClass.name}</h2>
                <p className="text-sm mb-3" style={{ color: 'var(--text-secondary)' }}>{selectedClass.description || 'Chưa có mô tả'}</p>
                <div className="flex flex-wrap gap-2 text-xs">
                  <span className="badge badge-amber">
                    {selectedClass.tuitionFee?.toLocaleString('vi-VN') || 0}đ / {selectedClass.feeType === 'monthly' ? 'tháng' : 'buổi'}
                  </span>
                  {selectedClass.scheduleTemplate?.map((s, i) => (
                    <span key={i} className="badge badge-gray">
                      {DAYS[s.day]} {s.time} ({s.duration}p)
                    </span>
                  ))}
                </div>
              </div>

              {/* Students in class */}
              <div className="card p-5">
                <h3 className="font-semibold text-sm mb-3" style={{ color: 'var(--text-primary)' }}>
                  Học viên ({selectedClass.students?.length || 0})
                </h3>
                <div className="flex gap-2 mb-3">
                  <select value={assignStudentId} onChange={(e) => setAssignStudentId(e.target.value)}
                    className="input flex-1">
                    <option value="">-- Chọn học viên để thêm --</option>
                    {availableStudents.map(s => (
                      <option key={s._id} value={s._id}>{s.fullName} (@{s.username})</option>
                    ))}
                  </select>
                  <button onClick={handleAssignStudent}
                    className="px-4 py-2 rounded-xl text-sm font-medium text-white"
                    style={{ background: 'var(--success)' }}>
                    Thêm
                  </button>
                </div>
                <div className="space-y-1.5">
                  {selectedClass.students?.map(s => (
                    <div key={s._id} className="flex items-center justify-between px-3 py-2 rounded-xl" style={{ background: 'var(--cream-warm)' }}>
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold"
                          style={{ background: 'var(--amber-soft)', color: 'var(--amber-warm)' }}>
                          {s.fullName?.charAt(0)?.toUpperCase()}
                        </div>
                        <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{s.fullName}</span>
                        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>@{s.username}</span>
                        {s.grade && <span className="badge badge-amber">Lớp {s.grade}</span>}
                      </div>
                      <button onClick={() => handleRemoveStudent(s._id)}
                        className="text-xs px-2 py-1 rounded-lg"
                        style={{ color: 'var(--danger)', background: 'var(--danger-light)' }}>
                        Gỡ
                      </button>
                    </div>
                  ))}
                  {(!selectedClass.students || selectedClass.students.length === 0) && (
                    <p className="text-sm text-center py-3" style={{ color: 'var(--text-muted)' }}>Chưa có học viên</p>
                  )}
                </div>
              </div>

              {/* Media in class */}
              <div className="card p-5">
                <h3 className="font-semibold text-sm mb-3" style={{ color: 'var(--text-primary)' }}>
                  Tài liệu ({selectedClass.mediaResources?.length || 0})
                </h3>
                <div className="flex gap-2 mb-3">
                  <select value={assignMediaId} onChange={(e) => setAssignMediaId(e.target.value)}
                    className="input flex-1">
                    <option value="">-- Chọn tài liệu để gán --</option>
                    {availableMedias.map(m => (
                      <option key={m._id} value={m._id}>{m.title} ({m.type})</option>
                    ))}
                  </select>
                  <button onClick={handleAssignMedia}
                    className="px-4 py-2 rounded-xl text-sm font-medium text-white"
                    style={{ background: 'var(--purple)' }}>
                    Gán
                  </button>
                </div>
                <div className="space-y-1.5">
                  {selectedClass.mediaResources?.map(m => (
                    <div key={m._id} className="flex items-center justify-between px-3 py-2 rounded-xl" style={{ background: 'var(--cream-warm)' }}>
                      <a href={m.url} target="_blank" rel="noreferrer"
                        className="text-sm font-medium flex items-center gap-2 hover:underline"
                        style={{ color: 'var(--text-primary)' }}>
                        <span className="text-base">
                          {m.type === 'video' ? '📺' : m.type === 'image' ? '🖼️' : '📄'}
                        </span>
                        {m.title}
                      </a>
                      <button onClick={() => handleRemoveMedia(m._id)}
                        className="text-xs px-2 py-1 rounded-lg"
                        style={{ color: 'var(--danger)', background: 'var(--danger-light)' }}>
                        Gỡ
                      </button>
                    </div>
                  ))}
                  {(!selectedClass.mediaResources || selectedClass.mediaResources.length === 0) && (
                    <p className="text-sm text-center py-3" style={{ color: 'var(--text-muted)' }}>Chưa có tài liệu</p>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div
              className="card flex flex-col items-center justify-center"
              style={{ minHeight: 300 }}
            >
              <div className="text-4xl mb-3">📋</div>
              <p className="font-medium text-sm" style={{ color: 'var(--text-secondary)' }}>Chọn một lớp để xem chi tiết</p>
              <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Hoặc tạo lớp mới bằng nút phía trên</p>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default ClassManager;
