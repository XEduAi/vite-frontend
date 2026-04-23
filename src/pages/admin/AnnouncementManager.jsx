import { useState } from 'react';
import { getApiErrorMessage } from '../../api/errors';
import AdminQueryErrors from '../../components/AdminQueryErrors';
import AdminLayout from '../../components/AdminLayout';
import AdminToast from '../../components/AdminToast';
import { useAdminClassesQuery } from '../../features/admin/lookups';
import {
  useAdminAnnouncementsQuery,
  useCreateAnnouncementMutation,
  useDeleteAnnouncementMutation,
} from '../../features/announcements/hooks';

const EMPTY_FORM = {
  title: '',
  content: '',
  targetClasses: [],
  priority: 'normal',
  expiresAt: '',
};

const AnnouncementManager = () => {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [msg, setMsg] = useState({ text: '', type: '' });

  const announcementsQuery = useAdminAnnouncementsQuery();
  const classesQuery = useAdminClassesQuery();
  const createAnnouncementMutation = useCreateAnnouncementMutation();
  const deleteAnnouncementMutation = useDeleteAnnouncementMutation();

  const announcements = announcementsQuery.data || [];
  const classes = classesQuery.data || [];
  const loading = announcementsQuery.isPending || classesQuery.isPending;

  const showMsg = (text, type = 'success') => {
    setMsg({ text, type });
    setTimeout(() => setMsg({ text: '', type: '' }), 3000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.title.trim() || !form.content.trim()) {
      showMsg('Vui lòng nhập tiêu đề và nội dung', 'error');
      return;
    }

    try {
      await createAnnouncementMutation.mutateAsync({
        ...form,
        expiresAt: form.expiresAt || undefined,
      });
      showMsg('Tạo thông báo thành công');
      setShowForm(false);
      setForm({ ...EMPTY_FORM });
    } catch (error) {
      showMsg(getApiErrorMessage(error, 'Lỗi khi tạo thông báo'), 'error');
    }
  };

  const handleDelete = async (announcementId) => {
    if (!window.confirm('Xóa thông báo này?')) {
      return;
    }

    try {
      await deleteAnnouncementMutation.mutateAsync(announcementId);
      showMsg('Đã xóa thông báo');
    } catch (error) {
      showMsg(getApiErrorMessage(error, 'Lỗi xóa thông báo'), 'error');
    }
  };

  const toggleClassSelect = (classId) => {
    setForm((previousForm) => ({
      ...previousForm,
      targetClasses: previousForm.targetClasses.includes(classId)
        ? previousForm.targetClasses.filter((id) => id !== classId)
        : [...previousForm.targetClasses, classId],
    }));
  };

  const timeAgo = (date) => {
    const now = new Date();
    const diff = now - new Date(date);
    const minutes = Math.floor(diff / 60000);

    if (minutes < 1) return 'Vừa xong';
    if (minutes < 60) return `${minutes} phút trước`;

    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} giờ trước`;

    const days = Math.floor(hours / 24);
    if (days < 7) return `${days} ngày trước`;

    return new Date(date).toLocaleDateString('vi-VN');
  };

  const queryErrors = [
    announcementsQuery.isError
      ? {
          key: 'announcements',
          message: getApiErrorMessage(announcementsQuery.error, 'Không thể tải danh sách thông báo'),
          onRetry: () => announcementsQuery.refetch(),
        }
      : null,
    classesQuery.isError
      ? {
          key: 'classes',
          message: getApiErrorMessage(classesQuery.error, 'Không thể tải danh sách lớp'),
          onRetry: () => classesQuery.refetch(),
        }
      : null,
  ].filter(Boolean);

  return (
    <AdminLayout>
      <div className="mb-8 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <div className="bento-label" style={{ color: 'var(--amber-warm)' }}>Vận hành</div>
          <h1 className="bento-hero-title mt-1" style={{ color: 'var(--text-primary)' }}>Thông báo</h1>
          <p className="text-sm mt-2" style={{ color: 'var(--text-muted)' }}>{announcements.length} thông báo</p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-primary px-5 py-2.5">
          + Tạo thông báo
        </button>
      </div>

      <AdminToast className="mb-4" message={msg.text} type={msg.type} />

      <AdminQueryErrors errors={queryErrors} />

      {loading ? (
        <div className="text-center py-16" style={{ color: 'var(--text-muted)' }}>Đang tải...</div>
      ) : announcements.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-5xl mb-4">📢</div>
          <h3 className="text-lg font-medium" style={{ color: 'var(--text-secondary)' }}>Chưa có thông báo nào</h3>
          <p className="mt-2" style={{ color: 'var(--text-muted)' }}>Tạo thông báo để gửi đến học viên</p>
        </div>
      ) : (
        <div className="space-y-3">
          {announcements.map((announcement) => (
            <div key={announcement._id} className="card overflow-hidden transition-all hover:shadow-md">
              <div className="p-5 flex items-start gap-4">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-lg mt-0.5"
                  style={{
                    background: announcement.priority === 'important'
                      ? 'var(--amber-soft)'
                      : 'var(--cream-warm)',
                    color: announcement.priority === 'important' ? 'var(--amber-warm)' : 'var(--text-muted)',
                  }}
                >
                  {announcement.priority === 'important' ? '⚡' : '📢'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{announcement.title}</h3>
                    {announcement.priority === 'important' && (
                      <span className="badge badge-amber">Quan trọng</span>
                    )}
                  </div>
                  <p className="text-sm mt-1.5 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                    {announcement.content}
                  </p>
                  <div className="flex flex-wrap items-center gap-3 mt-3">
                    <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                      {timeAgo(announcement.createdAt)}
                    </span>
                    {announcement.createdBy && (
                      <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                        · bởi {announcement.createdBy.fullName}
                      </span>
                    )}
                    {announcement.targetClasses?.length > 0 ? (
                      <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                        · {announcement.targetClasses.map((item) => item.name).join(', ')}
                      </span>
                    ) : (
                      <span className="badge badge-blue text-[10px]">Tất cả</span>
                    )}
                    {announcement.expiresAt && (
                      <span className="text-xs" style={{ color: new Date(announcement.expiresAt) < new Date() ? 'var(--danger)' : 'var(--text-muted)' }}>
                        · Hết hạn {new Date(announcement.expiresAt).toLocaleDateString('vi-VN')}
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(announcement._id)}
                  disabled={deleteAnnouncementMutation.isPending}
                  className="p-2 rounded-lg transition-colors shrink-0 disabled:opacity-60"
                  style={{ color: 'var(--danger)' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'var(--danger-light)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                  }}
                  title="Xóa"
                >
                  🗑️
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-10 px-4 modal-overlay">
          <div className="rounded-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto shadow-2xl modal-content" style={{ background: 'var(--white)' }}>
            <div className="sticky top-0 px-6 py-4 border-b flex items-center justify-between z-10" style={{ background: 'var(--white)', borderColor: 'var(--border)' }}>
              <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
                Tạo thông báo mới
              </h2>
              <button
                onClick={() => setShowForm(false)}
                className="text-xl transition-colors"
                style={{ color: 'var(--text-muted)' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = 'var(--text-primary)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = 'var(--text-muted)';
                }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--text-primary)' }}>Tiêu đề *</label>
                <input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="input"
                  placeholder="VD: Lịch nghỉ Tết, Thông báo thi..."
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--text-primary)' }}>Nội dung *</label>
                <textarea
                  value={form.content}
                  onChange={(e) => setForm({ ...form, content: e.target.value })}
                  rows={4}
                  className="input resize-none"
                  placeholder="Nội dung thông báo chi tiết..."
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Mức độ</label>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, priority: 'normal' })}
                    className="flex-1 py-2.5 rounded-xl text-sm font-medium border-2 transition-all"
                    style={{
                      borderColor: form.priority === 'normal' ? 'var(--olive)' : 'var(--border)',
                      background: form.priority === 'normal' ? 'var(--olive-soft)' : 'transparent',
                      color: form.priority === 'normal' ? 'var(--olive)' : 'var(--text-secondary)',
                    }}
                  >
                    📢 Bình thường
                  </button>
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, priority: 'important' })}
                    className="flex-1 py-2.5 rounded-xl text-sm font-medium border-2 transition-all"
                    style={{
                      borderColor: form.priority === 'important' ? 'var(--amber-warm)' : 'var(--border)',
                      background: form.priority === 'important' ? 'var(--amber-soft)' : 'transparent',
                      color: form.priority === 'important' ? 'var(--amber-warm)' : 'var(--text-secondary)',
                    }}
                  >
                    ⚡ Quan trọng
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                  Gửi đến lớp <span className="font-normal" style={{ color: 'var(--text-muted)' }}>(bỏ trống = tất cả)</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {classes.map((classItem) => (
                    <button
                      key={classItem._id}
                      type="button"
                      onClick={() => toggleClassSelect(classItem._id)}
                      className="px-3 py-1.5 rounded-lg text-sm border transition-all"
                      style={{
                        borderColor: form.targetClasses.includes(classItem._id) ? 'var(--amber-warm)' : 'var(--border)',
                        background: form.targetClasses.includes(classItem._id) ? 'var(--amber-soft)' : 'transparent',
                        color: form.targetClasses.includes(classItem._id) ? 'var(--amber-warm)' : 'var(--text-secondary)',
                      }}
                    >
                      {form.targetClasses.includes(classItem._id) ? '✓ ' : ''}{classItem.name}
                    </button>
                  ))}
                  {classes.length === 0 && (
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Chưa có lớp nào</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--text-primary)' }}>
                  Hết hạn <span className="font-normal" style={{ color: 'var(--text-muted)' }}>(tùy chọn)</span>
                </label>
                <input
                  type="datetime-local"
                  value={form.expiresAt}
                  onChange={(e) => setForm({ ...form, expiresAt: e.target.value })}
                  className="input"
                />
                <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Thông báo sẽ tự ẩn sau thời điểm này</p>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={createAnnouncementMutation.isPending} className="btn-primary disabled:opacity-60">
                  Tạo thông báo
                </button>
                <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">
                  Hủy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AnnouncementManager;
