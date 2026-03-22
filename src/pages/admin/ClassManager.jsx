import { useState } from 'react';
import { Link } from 'react-router-dom';
import { getApiErrorMessage } from '../../api/errors';
import AdminQueryErrors from '../../components/AdminQueryErrors';
import AdminLayout from '../../components/AdminLayout';
import AdminToast from '../../components/AdminToast';
import { useAdminClassesQuery, useAdminMediaQuery, useAdminStudentsQuery } from '../../features/admin/lookups';
import {
  useAdminClassDetailQuery,
  useAssignClassMediaMutation,
  useAssignStudentToClassMutation,
  useDeleteClassMutation,
  useRemoveClassMediaMutation,
  useRemoveStudentFromClassMutation,
  useSaveClassMutation,
} from '../../features/classes/hooks';

const DAYS = ['', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ nhật'];
const EMPTY_FORM = {
  name: '',
  description: '',
  tuitionFee: '',
  feeType: 'monthly',
  scheduleTemplate: [],
};

const inputCls = 'input';
const selectCls = 'input';

const ClassManager = () => {
  const [message, setMessage] = useState({ type: '', content: '' });
  const [showForm, setShowForm] = useState(false);
  const [editingClass, setEditingClass] = useState(null);
  const [formData, setFormData] = useState({ ...EMPTY_FORM });
  const [selectedClassId, setSelectedClassId] = useState(null);
  const [assignStudentId, setAssignStudentId] = useState('');
  const [assignMediaId, setAssignMediaId] = useState('');

  const classesQuery = useAdminClassesQuery();
  const studentsQuery = useAdminStudentsQuery();
  const mediaQuery = useAdminMediaQuery();
  const resolvedSelectedClassId = classesQuery.data?.some((item) => item._id === selectedClassId)
    ? selectedClassId
    : null;
  const classDetailQuery = useAdminClassDetailQuery(resolvedSelectedClassId);
  const saveClassMutation = useSaveClassMutation();
  const deleteClassMutation = useDeleteClassMutation();
  const assignStudentMutation = useAssignStudentToClassMutation();
  const removeStudentMutation = useRemoveStudentFromClassMutation();
  const assignMediaMutation = useAssignClassMediaMutation();
  const removeMediaMutation = useRemoveClassMediaMutation();

  const classes = classesQuery.data || [];
  const students = studentsQuery.data || [];
  const medias = mediaQuery.data || [];
  const selectedClassPreview = classes.find((item) => item._id === resolvedSelectedClassId) || null;
  const selectedClass = classDetailQuery.data || selectedClassPreview;
  const loading = classesQuery.isPending || studentsQuery.isPending || mediaQuery.isPending;

  const showMsg = (content, type = 'success') => {
    setMessage({ type, content });
    setTimeout(() => setMessage({ type: '', content: '' }), 4000);
  };

  const resetForm = () => {
    setFormData({ ...EMPTY_FORM });
    setEditingClass(null);
    setShowForm(false);
  };

  const handleCreateOrUpdate = async (e) => {
    e.preventDefault();

    try {
      const savedClass = await saveClassMutation.mutateAsync({
        classId: editingClass?._id,
        payload: {
          name: formData.name,
          description: formData.description,
          tuitionFee: formData.tuitionFee ? Number(formData.tuitionFee) : 0,
          feeType: formData.feeType,
          scheduleTemplate: formData.scheduleTemplate.filter((slot) => slot.day && slot.time),
        },
      });

      setSelectedClassId(savedClass?._id || selectedClassId);
      showMsg(editingClass ? 'Cập nhật lớp thành công!' : 'Tạo lớp thành công!');
      resetForm();
    } catch (error) {
      showMsg(getApiErrorMessage(error, 'Lỗi khi lưu lớp học'), 'error');
    }
  };

  const handleEdit = (classItem) => {
    setEditingClass(classItem);
    setFormData({
      name: classItem.name,
      description: classItem.description || '',
      tuitionFee: classItem.tuitionFee || '',
      feeType: classItem.feeType || 'monthly',
      scheduleTemplate: classItem.scheduleTemplate || [],
    });
    setShowForm(true);
  };

  const handleDelete = async (classId) => {
    if (!window.confirm('Bạn có chắc muốn xóa lớp này?')) {
      return;
    }

    try {
      await deleteClassMutation.mutateAsync(classId);
      if (selectedClassId === classId) {
        setSelectedClassId(null);
      }
      if (editingClass?._id === classId) {
        resetForm();
      }
      showMsg('Đã xóa lớp');
    } catch (error) {
      showMsg(getApiErrorMessage(error, 'Lỗi khi xóa lớp'), 'error');
    }
  };

  const addScheduleSlot = () => {
    setFormData((previousForm) => ({
      ...previousForm,
      scheduleTemplate: [
        ...previousForm.scheduleTemplate,
        { day: 2, time: '18:00', duration: 90 },
      ],
    }));
  };

  const updateScheduleSlot = (index, field, value) => {
    const nextScheduleTemplate = [...formData.scheduleTemplate];
    nextScheduleTemplate[index] = {
      ...nextScheduleTemplate[index],
      [field]: field === 'day' || field === 'duration' ? Number(value) : value,
    };
    setFormData({ ...formData, scheduleTemplate: nextScheduleTemplate });
  };

  const removeScheduleSlot = (index) => {
    setFormData({
      ...formData,
      scheduleTemplate: formData.scheduleTemplate.filter((_, itemIndex) => itemIndex !== index),
    });
  };

  const handleAssignStudent = async () => {
    if (!assignStudentId || !selectedClassId) {
      return;
    }

    try {
      await assignStudentMutation.mutateAsync({ classId: selectedClassId, studentId: assignStudentId });
      setAssignStudentId('');
      showMsg('Đã thêm học viên vào lớp');
    } catch (error) {
      showMsg(getApiErrorMessage(error, 'Lỗi khi thêm học viên vào lớp'), 'error');
    }
  };

  const handleRemoveStudent = async (studentId) => {
    if (!selectedClassId) {
      return;
    }

    try {
      await removeStudentMutation.mutateAsync({ classId: selectedClassId, studentId });
      showMsg('Đã gỡ học viên khỏi lớp');
    } catch (error) {
      showMsg(getApiErrorMessage(error, 'Lỗi khi gỡ học viên khỏi lớp'), 'error');
    }
  };

  const handleAssignMedia = async () => {
    if (!assignMediaId || !selectedClassId) {
      return;
    }

    try {
      await assignMediaMutation.mutateAsync({ classId: selectedClassId, mediaId: assignMediaId });
      setAssignMediaId('');
      showMsg('Đã gán tài liệu');
    } catch (error) {
      showMsg(getApiErrorMessage(error, 'Lỗi khi gán tài liệu'), 'error');
    }
  };

  const handleRemoveMedia = async (mediaId) => {
    if (!selectedClassId) {
      return;
    }

    try {
      await removeMediaMutation.mutateAsync({ classId: selectedClassId, mediaId });
      showMsg('Đã gỡ tài liệu');
    } catch (error) {
      showMsg(getApiErrorMessage(error, 'Lỗi khi gỡ tài liệu'), 'error');
    }
  };

  const availableStudents = selectedClass
    ? students.filter(
        (student) => !selectedClass.students?.some((classStudent) => (classStudent._id || classStudent) === student._id)
      )
    : [];
  const availableMedias = selectedClass
    ? medias.filter(
        (media) => !selectedClass.mediaResources?.some((classMedia) => (classMedia._id || classMedia) === media._id)
      )
    : [];

  const queryErrors = [
    classesQuery.isError
      ? {
          key: 'classes',
          message: getApiErrorMessage(classesQuery.error, 'Không thể tải danh sách lớp'),
          onRetry: () => classesQuery.refetch(),
        }
      : null,
    studentsQuery.isError
      ? {
          key: 'students',
          message: getApiErrorMessage(studentsQuery.error, 'Không thể tải danh sách học viên'),
          onRetry: () => studentsQuery.refetch(),
        }
      : null,
    mediaQuery.isError
      ? {
          key: 'media',
          message: getApiErrorMessage(mediaQuery.error, 'Không thể tải danh sách tài liệu'),
          onRetry: () => mediaQuery.refetch(),
        }
      : null,
    resolvedSelectedClassId && classDetailQuery.isError
      ? {
          key: 'class-detail',
          message: getApiErrorMessage(classDetailQuery.error, 'Không thể tải chi tiết lớp học'),
          onRetry: () => classDetailQuery.refetch(),
        }
      : null,
  ].filter(Boolean);

  const renderClassDetail = () => {
    if (resolvedSelectedClassId && !selectedClass && classDetailQuery.isPending) {
      return (
        <div className="card flex flex-col items-center justify-center" style={{ minHeight: 300 }}>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Đang tải chi tiết lớp...</p>
        </div>
      );
    }

    if (!selectedClass) {
      return (
        <div className="card flex flex-col items-center justify-center" style={{ minHeight: 300 }}>
          <div className="text-4xl mb-3">📋</div>
          <p className="font-medium text-sm" style={{ color: 'var(--text-secondary)' }}>Chọn một lớp để xem chi tiết</p>
          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Hoặc tạo lớp mới bằng nút phía trên</p>
        </div>
      );
    }

    return (
      <>
        <div className="card p-5">
          <h2 className="font-display text-lg font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>{selectedClass.name}</h2>
          <p className="text-sm mb-3" style={{ color: 'var(--text-secondary)' }}>{selectedClass.description || 'Chưa có mô tả'}</p>
          <div className="flex flex-wrap gap-2 text-xs">
            <span className="badge badge-amber">
              {selectedClass.tuitionFee?.toLocaleString('vi-VN') || 0}đ / {selectedClass.feeType === 'monthly' ? 'tháng' : 'buổi'}
            </span>
            {selectedClass.scheduleTemplate?.map((slot, index) => (
              <span key={`${slot.day}-${slot.time}-${index}`} className="badge badge-gray">
                {DAYS[slot.day]} {slot.time} ({slot.duration}p)
              </span>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t" style={{ borderColor: 'var(--border-light)' }}>
            <Link
              to={`/admin/classes/${selectedClass._id}/lessons`}
              className="inline-flex items-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-xl transition-all"
              style={{ background: 'var(--amber-soft)', color: 'var(--amber-warm)' }}
            >
              📚 Quản lý bài học
            </Link>
          </div>
        </div>

        <div className="card p-5">
          <h3 className="font-semibold text-sm mb-3" style={{ color: 'var(--text-primary)' }}>
            Học viên ({selectedClass.students?.length || 0})
          </h3>
          <div className="flex gap-2 mb-3">
            <select
              value={assignStudentId}
              onChange={(e) => setAssignStudentId(e.target.value)}
              className="input flex-1"
            >
              <option value="">-- Chọn học viên để thêm --</option>
              {availableStudents.map((student) => (
                <option key={student._id} value={student._id}>
                  {student.fullName} (@{student.username})
                </option>
              ))}
            </select>
            <button
              onClick={handleAssignStudent}
              disabled={assignStudentMutation.isPending}
              className="px-4 py-2 rounded-xl text-sm font-medium text-white disabled:opacity-60"
              style={{ background: 'var(--success)' }}
            >
              Thêm
            </button>
          </div>
          <div className="space-y-1.5">
            {selectedClass.students?.map((student) => (
              <div key={student._id} className="flex items-center justify-between px-3 py-2 rounded-xl" style={{ background: 'var(--cream-warm)' }}>
                <div className="flex items-center gap-2">
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold"
                    style={{ background: 'var(--amber-soft)', color: 'var(--amber-warm)' }}
                  >
                    {student.fullName?.charAt(0)?.toUpperCase()}
                  </div>
                  <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{student.fullName}</span>
                  <span className="text-xs" style={{ color: 'var(--text-muted)' }}>@{student.username}</span>
                  {student.grade && <span className="badge badge-amber">Lớp {student.grade}</span>}
                </div>
                <button
                  onClick={() => handleRemoveStudent(student._id)}
                  disabled={removeStudentMutation.isPending}
                  className="text-xs px-2 py-1 rounded-lg disabled:opacity-60"
                  style={{ color: 'var(--danger)', background: 'var(--danger-light)' }}
                >
                  Gỡ
                </button>
              </div>
            ))}
            {(!selectedClass.students || selectedClass.students.length === 0) && (
              <p className="text-sm text-center py-3" style={{ color: 'var(--text-muted)' }}>Chưa có học viên</p>
            )}
          </div>
        </div>

        <div className="card p-5">
          <h3 className="font-semibold text-sm mb-3" style={{ color: 'var(--text-primary)' }}>
            Tài liệu ({selectedClass.mediaResources?.length || 0})
          </h3>
          <div className="flex gap-2 mb-3">
            <select
              value={assignMediaId}
              onChange={(e) => setAssignMediaId(e.target.value)}
              className="input flex-1"
            >
              <option value="">-- Chọn tài liệu để gán --</option>
              {availableMedias.map((media) => (
                <option key={media._id} value={media._id}>
                  {media.title} ({media.type})
                </option>
              ))}
            </select>
            <button
              onClick={handleAssignMedia}
              disabled={assignMediaMutation.isPending}
              className="px-4 py-2 rounded-xl text-sm font-medium text-white disabled:opacity-60"
              style={{ background: 'var(--purple)' }}
            >
              Gán
            </button>
          </div>
          <div className="space-y-1.5">
            {selectedClass.mediaResources?.map((media) => (
              <div key={media._id} className="flex items-center justify-between px-3 py-2 rounded-xl" style={{ background: 'var(--cream-warm)' }}>
                <a
                  href={media.url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm font-medium flex items-center gap-2 hover:underline"
                  style={{ color: 'var(--text-primary)' }}
                >
                  <span className="text-base">
                    {media.type === 'video' ? '📺' : media.type === 'image' ? '🖼️' : '📄'}
                  </span>
                  {media.title}
                </a>
                <button
                  onClick={() => handleRemoveMedia(media._id)}
                  disabled={removeMediaMutation.isPending}
                  className="text-xs px-2 py-1 rounded-lg disabled:opacity-60"
                  style={{ color: 'var(--danger)', background: 'var(--danger-light)' }}
                >
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
    );
  };

  return (
    <AdminLayout>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="font-display text-2xl font-semibold" style={{ color: 'var(--text-primary)' }}>Quản lý Lớp học</h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>{classes.length} lớp đang hoạt động</p>
        </div>
        <button
          onClick={() => {
            if (showForm && !editingClass) {
              resetForm();
              return;
            }
            resetForm();
            setShowForm(true);
          }}
          className="btn-primary"
        >
          {showForm && !editingClass ? '✕ Đóng' : '+ Tạo lớp mới'}
        </button>
      </div>

      <AdminToast message={message.content} type={message.type} />

      <AdminQueryErrors errors={queryErrors} />

      {showForm && (
        <div className="card p-6 mb-6 fade-in">
          <h2 className="font-semibold text-sm mb-4 pb-3 border-b" style={{ color: 'var(--text-primary)', borderColor: 'var(--border-light)' }}>
            {editingClass ? `Chỉnh sửa: ${editingClass.name}` : 'Tạo lớp mới'}
          </h2>
          <form onSubmit={handleCreateOrUpdate} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Tên lớp *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className={inputCls}
                  required
                  placeholder="VD: Toán 9 Nâng Cao"
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Mô tả</label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className={inputCls}
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Học phí (VND)</label>
                <input
                  type="number"
                  value={formData.tuitionFee}
                  onChange={(e) => setFormData({ ...formData, tuitionFee: e.target.value })}
                  className={inputCls}
                  placeholder="500000"
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Loại phí</label>
                <select
                  value={formData.feeType}
                  onChange={(e) => setFormData({ ...formData, feeType: e.target.value })}
                  className={selectCls}
                >
                  <option value="monthly">Theo tháng</option>
                  <option value="per_session">Theo buổi</option>
                </select>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2.5">
                <label className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>Lịch học</label>
                <button
                  type="button"
                  onClick={addScheduleSlot}
                  className="text-xs font-medium px-2.5 py-1 rounded-lg transition-all"
                  style={{ color: 'var(--amber-warm)', background: 'var(--amber-soft)' }}
                >
                  + Thêm buổi
                </button>
              </div>
              <div className="space-y-2">
                {formData.scheduleTemplate.map((slot, index) => (
                  <div key={`${slot.day}-${slot.time}-${index}`} className="flex gap-2 items-center flex-wrap">
                    <select
                      value={slot.day}
                      onChange={(e) => updateScheduleSlot(index, 'day', e.target.value)}
                      className="input w-auto"
                    >
                      {[2, 3, 4, 5, 6, 7, 1].map((day) => (
                        <option key={day} value={day}>{DAYS[day]}</option>
                      ))}
                    </select>
                    <input
                      type="time"
                      value={slot.time}
                      onChange={(e) => updateScheduleSlot(index, 'time', e.target.value)}
                      className="input w-auto"
                    />
                    <input
                      type="number"
                      value={slot.duration}
                      onChange={(e) => updateScheduleSlot(index, 'duration', e.target.value)}
                      className="input w-20"
                      placeholder="phút"
                    />
                    <span className="text-xs" style={{ color: 'var(--text-muted)' }}>phút</span>
                    <button
                      type="button"
                      onClick={() => removeScheduleSlot(index)}
                      className="text-xs px-2 py-1 rounded-lg transition-all"
                      style={{ color: 'var(--danger)', background: 'var(--danger-light)' }}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-2 pt-1">
              <button type="submit" disabled={saveClassMutation.isPending} className="btn-primary disabled:opacity-60">
                {editingClass ? 'Lưu thay đổi' : 'Tạo lớp'}
              </button>
              <button type="button" onClick={resetForm} className="btn-secondary">
                Hủy
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <div className="lg:col-span-2 card overflow-hidden">
          <div className="px-5 py-3.5 border-b" style={{ borderColor: 'var(--border-light)', background: 'var(--cream-warm)' }}>
            <h3 className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>DANH SÁCH LỚP ({classes.length})</h3>
          </div>

          {loading ? (
            <div className="py-10 text-center text-sm" style={{ color: 'var(--text-muted)' }}>Đang tải...</div>
          ) : (
            <div className="divide-y overflow-y-auto" style={{ maxHeight: 560, borderColor: 'var(--border-light)' }}>
              {classes.map((classItem) => (
                <div
                  key={classItem._id}
                  className="p-4 cursor-pointer transition-colors"
                  style={{
                    background: selectedClassId === classItem._id ? 'var(--amber-soft)' : 'transparent',
                    borderLeft: selectedClassId === classItem._id ? '3px solid var(--amber-warm)' : '3px solid transparent',
                  }}
                  onClick={() => setSelectedClassId(classItem._id)}
                  onMouseEnter={(e) => {
                    if (selectedClassId !== classItem._id) e.currentTarget.style.background = 'var(--cream-warm)';
                  }}
                  onMouseLeave={(e) => {
                    if (selectedClassId !== classItem._id) e.currentTarget.style.background = 'transparent';
                  }}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h4 className="font-medium text-sm truncate" style={{ color: 'var(--text-primary)' }}>{classItem.name}</h4>
                      <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                        {classItem.students?.length || 0} học viên · {classItem.feeType === 'monthly' ? 'Tháng' : 'Buổi'}
                      </p>
                    </div>
                    <div className="flex gap-1 flex-shrink-0">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEdit(classItem);
                        }}
                        className="p-1.5 rounded-lg transition-all text-xs"
                        style={{ color: 'var(--amber-warm)', background: 'var(--amber-soft)' }}
                      >
                        ✏
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(classItem._id);
                        }}
                        className="p-1.5 rounded-lg transition-all text-xs"
                        style={{ color: 'var(--danger)', background: 'var(--danger-light)' }}
                      >
                        ✕
                      </button>
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

        <div className="lg:col-span-3 space-y-4">
          {renderClassDetail()}
        </div>
      </div>
    </AdminLayout>
  );
};

export default ClassManager;
