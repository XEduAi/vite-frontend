import { useState, useEffect } from 'react';
import axiosClient from '../../api/axiosClient';
import AdminLayout from '../../components/AdminLayout';

const DAYS = ['', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ nhật'];

const ClassManager = () => {
  const [classes, setClasses] = useState([]);
  const [students, setStudents] = useState([]);
  const [medias, setMedias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: '', content: '' });

  // Create/Edit form
  const [showForm, setShowForm] = useState(false);
  const [editingClass, setEditingClass] = useState(null);
  const [formData, setFormData] = useState({
    name: '', description: '', tuitionFee: '', feeType: 'monthly', scheduleTemplate: []
  });

  // Detail view
  const [selectedClass, setSelectedClass] = useState(null);
  const [assignStudentId, setAssignStudentId] = useState('');
  const [assignMediaId, setAssignMediaId] = useState('');

  useEffect(() => {
    fetchAll();
  }, []);

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

  // === CLASS CRUD ===

  const handleCreateOrUpdate = async (e) => {
    e.preventDefault();
    const payload = {
      name: formData.name,
      description: formData.description,
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
      name: cls.name,
      description: cls.description || '',
      tuitionFee: cls.tuitionFee || '',
      feeType: cls.feeType || 'monthly',
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
    } catch (error) {
      showMsg('Lỗi khi xóa', error);
    }
  };

  // === SCHEDULE TEMPLATE ===

  const addScheduleSlot = () => {
    setFormData({
      ...formData,
      scheduleTemplate: [...formData.scheduleTemplate, { day: 2, time: '18:00', duration: 90 }]
    });
  };

  const updateScheduleSlot = (index, field, value) => {
    const updated = [...formData.scheduleTemplate];
    updated[index] = { ...updated[index], [field]: field === 'day' || field === 'duration' ? Number(value) : value };
    setFormData({ ...formData, scheduleTemplate: updated });
  };

  const removeScheduleSlot = (index) => {
    setFormData({ ...formData, scheduleTemplate: formData.scheduleTemplate.filter((_, i) => i !== index) });
  };

  // === ASSIGN/REMOVE ===

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
    } catch (error) {
      showMsg('Lỗi', error);
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
    } catch (error) {
      showMsg(error.response?.data?.message || 'Lỗi', 'error');
    }
  };

  const handleRemoveMedia = async (mediaId) => {
    try {
      const res = await axiosClient.delete(`/classes/${selectedClass._id}/media/${mediaId}`);
      setSelectedClass(res.data.class);
      setClasses(classes.map(c => c._id === selectedClass._id ? res.data.class : c));
      showMsg('Đã gỡ tài liệu');
    } catch (error) {
      showMsg('Lỗi', error);
    }
  };

  const viewClassDetail = async (cls) => {
    try {
      const res = await axiosClient.get(`/classes/${cls._id}`);
      setSelectedClass(res.data.class);
    } catch (error) {
      showMsg('Lỗi tải chi tiết lớp', error);
    }
  };

  // available students not yet in this class
  const availableStudents = selectedClass
    ? students.filter(s => !selectedClass.students?.some(cs => (cs._id || cs) === s._id))
    : [];

  // available media not yet in this class
  const availableMedias = selectedClass
    ? medias.filter(m => !selectedClass.mediaResources?.some(cm => (cm._id || cm) === m._id))
    : [];

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Quản lý Lớp học</h1>
        <button onClick={() => { resetForm(); setShowForm(!showForm); }}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm">
          {showForm && !editingClass ? 'Đóng' : '+ Tạo lớp mới'}
        </button>
      </div>

      {message.content && (
        <div className={`p-3 mb-4 rounded text-sm ${message.type === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
          {message.content}
        </div>
      )}

      {/* Create / Edit Form */}
      {showForm && (
        <div className="bg-white p-6 rounded shadow mb-6">
          <h2 className="text-lg font-semibold mb-4">{editingClass ? `Sửa: ${editingClass.name}` : 'Tạo lớp mới'}</h2>
          <form onSubmit={handleCreateOrUpdate} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tên lớp *</label>
                <input type="text" value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full border rounded px-3 py-2 text-sm" required placeholder="VD: Toán 9 Nâng Cao" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
                <input type="text" value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full border rounded px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Học phí</label>
                <input type="number" value={formData.tuitionFee}
                  onChange={(e) => setFormData({ ...formData, tuitionFee: e.target.value })}
                  className="w-full border rounded px-3 py-2 text-sm" placeholder="VD: 500000" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Loại phí</label>
                <select value={formData.feeType}
                  onChange={(e) => setFormData({ ...formData, feeType: e.target.value })}
                  className="w-full border rounded px-3 py-2 text-sm">
                  <option value="monthly">Theo tháng</option>
                  <option value="per_session">Theo buổi</option>
                </select>
              </div>
            </div>

            {/* Schedule Template */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">Lịch học</label>
                <button type="button" onClick={addScheduleSlot}
                  className="text-xs text-blue-600 hover:underline">+ Thêm buổi</button>
              </div>
              {formData.scheduleTemplate.map((slot, i) => (
                <div key={i} className="flex gap-2 items-center mb-2">
                  <select value={slot.day} onChange={(e) => updateScheduleSlot(i, 'day', e.target.value)}
                    className="border rounded px-2 py-1.5 text-sm">
                    {[2,3,4,5,6,7,1].map(d => <option key={d} value={d}>{DAYS[d]}</option>)}
                  </select>
                  <input type="time" value={slot.time} onChange={(e) => updateScheduleSlot(i, 'time', e.target.value)}
                    className="border rounded px-2 py-1.5 text-sm" />
                  <input type="number" value={slot.duration} onChange={(e) => updateScheduleSlot(i, 'duration', e.target.value)}
                    className="border rounded px-2 py-1.5 text-sm w-20" placeholder="phút" />
                  <span className="text-xs text-gray-400">phút</span>
                  <button type="button" onClick={() => removeScheduleSlot(i)} className="text-red-500 text-sm">✕</button>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 text-sm">
                {editingClass ? 'Cập nhật' : 'Tạo lớp'}
              </button>
              <button type="button" onClick={resetForm} className="px-6 py-2 rounded border text-sm hover:bg-gray-50">Hủy</button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Class List */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded shadow">
            <div className="px-4 py-3 border-b bg-gray-50">
              <h3 className="font-semibold text-sm text-gray-600 uppercase">Danh sách lớp ({classes.length})</h3>
            </div>
            {loading ? (
              <p className="text-center text-gray-500 py-6">Đang tải...</p>
            ) : (
              <div className="divide-y max-h-[600px] overflow-y-auto">
                {classes.map(cls => (
                  <div key={cls._id}
                    className={`p-4 cursor-pointer hover:bg-blue-50 transition ${selectedClass?._id === cls._id ? 'bg-blue-50 border-l-4 border-blue-600' : ''}`}
                    onClick={() => viewClassDetail(cls)}>
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium text-sm">{cls.name}</h4>
                        <p className="text-xs text-gray-500 mt-1">
                          {cls.students?.length || 0} học viên · {cls.feeType === 'monthly' ? 'Theo tháng' : 'Theo buổi'}
                        </p>
                      </div>
                      <div className="flex gap-1">
                        <button onClick={(e) => { e.stopPropagation(); handleEdit(cls); }}
                          className="text-blue-500 hover:text-blue-700 text-xs px-1">✏️</button>
                        <button onClick={(e) => { e.stopPropagation(); handleDelete(cls._id); }}
                          className="text-red-500 hover:text-red-700 text-xs px-1">🗑️</button>
                      </div>
                    </div>
                  </div>
                ))}
                {classes.length === 0 && (
                  <p className="text-center text-gray-400 py-6 text-sm">Chưa có lớp nào</p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Class Detail */}
        <div className="lg:col-span-2">
          {selectedClass ? (
            <div className="space-y-4">
              {/* Info */}
              <div className="bg-white p-6 rounded shadow">
                <h2 className="text-xl font-bold mb-2">{selectedClass.name}</h2>
                <p className="text-gray-500 text-sm mb-3">{selectedClass.description || 'Chưa có mô tả'}</p>
                <div className="flex gap-4 text-sm">
                  <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded">
                    {selectedClass.tuitionFee?.toLocaleString('vi-VN') || 0}đ / {selectedClass.feeType === 'monthly' ? 'tháng' : 'buổi'}
                  </span>
                  {selectedClass.scheduleTemplate?.map((s, i) => (
                    <span key={i} className="bg-gray-100 text-gray-700 px-3 py-1 rounded">
                      {DAYS[s.day]} {s.time} ({s.duration}p)
                    </span>
                  ))}
                </div>
              </div>

              {/* Students in class */}
              <div className="bg-white p-6 rounded shadow">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-semibold">Học viên trong lớp ({selectedClass.students?.length || 0})</h3>
                </div>
                <div className="flex gap-2 mb-4">
                  <select value={assignStudentId} onChange={(e) => setAssignStudentId(e.target.value)}
                    className="border rounded px-3 py-1.5 text-sm flex-1">
                    <option value="">-- Chọn học viên --</option>
                    {availableStudents.map(s => (
                      <option key={s._id} value={s._id}>{s.fullName} ({s.username})</option>
                    ))}
                  </select>
                  <button onClick={handleAssignStudent}
                    className="bg-green-600 text-white px-4 py-1.5 rounded text-sm hover:bg-green-700">Thêm</button>
                </div>
                <div className="space-y-2">
                  {selectedClass.students?.map(s => (
                    <div key={s._id} className="flex justify-between items-center bg-gray-50 px-3 py-2 rounded text-sm">
                      <div>
                        <span className="font-medium">{s.fullName}</span>
                        <span className="text-gray-400 ml-2 text-xs">@{s.username}</span>
                        {s.grade && <span className="text-gray-400 ml-2 text-xs">Lớp {s.grade}</span>}
                      </div>
                      <button onClick={() => handleRemoveStudent(s._id)}
                        className="text-red-500 hover:text-red-700 text-xs">Gỡ</button>
                    </div>
                  ))}
                  {(!selectedClass.students || selectedClass.students.length === 0) && (
                    <p className="text-gray-400 text-sm text-center py-2">Chưa có học viên</p>
                  )}
                </div>
              </div>

              {/* Media in class */}
              <div className="bg-white p-6 rounded shadow">
                <h3 className="font-semibold mb-4">Tài liệu ({selectedClass.mediaResources?.length || 0})</h3>
                <div className="flex gap-2 mb-4">
                  <select value={assignMediaId} onChange={(e) => setAssignMediaId(e.target.value)}
                    className="border rounded px-3 py-1.5 text-sm flex-1">
                    <option value="">-- Chọn tài liệu --</option>
                    {availableMedias.map(m => (
                      <option key={m._id} value={m._id}>{m.title} ({m.type})</option>
                    ))}
                  </select>
                  <button onClick={handleAssignMedia}
                    className="bg-purple-600 text-white px-4 py-1.5 rounded text-sm hover:bg-purple-700">Gán</button>
                </div>
                <div className="space-y-2">
                  {selectedClass.mediaResources?.map(m => (
                    <div key={m._id} className="flex justify-between items-center bg-gray-50 px-3 py-2 rounded text-sm">
                      <a href={m.url} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">
                        {m.type === 'video' ? '📺' : m.type === 'image' ? '🖼️' : '📄'} {m.title}
                      </a>
                      <button onClick={() => handleRemoveMedia(m._id)}
                        className="text-red-500 hover:text-red-700 text-xs">Gỡ</button>
                    </div>
                  ))}
                  {(!selectedClass.mediaResources || selectedClass.mediaResources.length === 0) && (
                    <p className="text-gray-400 text-sm text-center py-2">Chưa có tài liệu</p>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded shadow p-12 text-center text-gray-400">
              <p className="text-lg">← Chọn một lớp để xem chi tiết</p>
              <p className="text-sm mt-2">Hoặc tạo lớp mới bằng nút phía trên</p>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default ClassManager;