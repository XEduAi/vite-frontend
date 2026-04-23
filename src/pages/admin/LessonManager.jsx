import { useCallback, useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';

const ITEM_TYPES = ['video', 'pdf', 'document', 'link'];
const ITEM_TYPE_LABEL = { video: 'Video', pdf: 'PDF', document: 'Tài liệu', link: 'Đường dẫn' };

const emptyItem = () => ({ title: '', type: 'document', externalUrl: '', duration: '' });
const emptyLesson = () => ({ title: '', description: '', isPublished: false, items: [emptyItem()] });

const LessonManager = () => {
  const { classId } = useParams();
  const [lessons, setLessons] = useState([]);
  const [className, setClassName] = useState('');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null); // lesson object or null
  const [form, setForm] = useState(emptyLesson());
  const [saving, setSaving] = useState(false);
  const fetchLessons = useCallback(async () => {
    try {
      setLoading(true);
      const [lessRes, clsRes] = await Promise.all([
        axiosClient.get(`/admin/lessons?classId=${classId}`),
        axiosClient.get(`/classes/${classId}`),
      ]);
      setLessons(lessRes.data.lessons || []);
      setClassName(clsRes.data.class?.name || '');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [classId]);

  useEffect(() => { fetchLessons(); }, [fetchLessons]);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyLesson());
    setShowModal(true);
  };

  const openEdit = (lesson) => {
    setEditing(lesson);
    setForm({
      title: lesson.title,
      description: lesson.description || '',
      isPublished: lesson.isPublished,
      items: lesson.items?.length ? lesson.items.map(i => ({
        title: i.title,
        type: i.type,
        externalUrl: i.externalUrl || '',
        duration: i.duration || '',
      })) : [emptyItem()],
    });
    setShowModal(true);
  };

  const setItemField = (idx, field, value) => {
    setForm(f => ({
      ...f,
      items: f.items.map((item, i) => i === idx ? { ...item, [field]: value } : item),
    }));
  };

  const addItem = () => setForm(f => ({ ...f, items: [...f.items, emptyItem()] }));
  const removeItem = (idx) => setForm(f => ({ ...f, items: f.items.filter((_, i) => i !== idx) }));

  const handleSave = async () => {
    if (!form.title.trim()) return alert('Vui lòng nhập tiêu đề bài học');
    setSaving(true);
    try {
      const payload = {
        ...form,
        class: classId,
        order: editing ? editing.order : (lessons.length + 1),
        items: form.items
          .filter(i => i.title.trim())
          .map((i, idx) => ({ ...i, order: idx, duration: i.duration ? Number(i.duration) : undefined })),
      };
      if (editing) {
        await axiosClient.put(`/admin/lessons/${editing._id}`, payload);
      } else {
        await axiosClient.post('/admin/lessons', payload);
      }
      setShowModal(false);
      await fetchLessons();
    } catch (err) {
      alert(err.response?.data?.message || 'Lỗi khi lưu bài học');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Xóa bài học này?')) return;
    try {
      await axiosClient.delete(`/admin/lessons/${id}`);
      setLessons(l => l.filter(x => x._id !== id));
    } catch {
      alert('Không thể xóa');
    }
  };

  const togglePublish = async (lesson) => {
    try {
      await axiosClient.put(`/admin/lessons/${lesson._id}`, { isPublished: !lesson.isPublished });
      setLessons(prev => prev.map(l => l._id === lesson._id ? { ...l, isPublished: !l.isPublished } : l));
    } catch { alert('Lỗi'); }
  };

  return (
    <div className="min-h-screen" style={{ background: 'var(--cream)' }}>
      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <Link to="/admin/classes" className="text-sm" style={{ color: 'var(--text-muted)' }}>
              ← Quản lý lớp
            </Link>
            <h1 className="font-display text-2xl font-bold mt-1" style={{ color: 'var(--text-primary)' }}>
              Bài học — {className}
            </h1>
          </div>
          <button onClick={openCreate}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white"
            style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}>
            + Thêm bài học
          </button>
        </div>

        {/* Lesson list */}
        {loading && <p className="text-sm text-center py-12" style={{ color: 'var(--text-muted)' }}>Đang tải...</p>}
        {!loading && lessons.length === 0 && (
          <div className="card p-12 text-center rounded-2xl">
            <div className="text-4xl mb-3">📭</div>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Chưa có bài học nào. Hãy thêm bài học đầu tiên!</p>
          </div>
        )}

        <div className="space-y-3">
          {lessons.map((lesson) => (
            <div key={lesson._id} className="card rounded-2xl p-5 flex items-start gap-4">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-white shrink-0"
                style={{ background: 'linear-gradient(135deg,#f59e0b,#d97706)' }}>
                {lesson.order}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>{lesson.title}</span>
                  <span
                    className="text-[11px] px-2 py-0.5 rounded-full font-semibold"
                    style={lesson.isPublished
                      ? { background: 'var(--olive-soft)', color: 'var(--olive)' }
                      : { background: 'var(--border-light)', color: 'var(--text-muted)' }}
                  >
                    {lesson.isPublished ? 'Đã đăng' : 'Nháp'}
                  </span>
                </div>
                {lesson.description && (
                  <p className="text-xs mt-0.5 line-clamp-1" style={{ color: 'var(--text-muted)' }}>{lesson.description}</p>
                )}
                <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                  {lesson.items?.length || 0} mục
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button onClick={() => togglePublish(lesson)}
                  className="text-xs px-2.5 py-1.5 rounded-lg border"
                  style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}>
                  {lesson.isPublished ? 'Ẩn' : 'Đăng'}
                </button>
                <button onClick={() => openEdit(lesson)}
                  className="text-xs px-2.5 py-1.5 rounded-lg"
                  style={{ background: 'var(--amber-soft)', color: 'var(--amber-warm)' }}>
                  Sửa
                </button>
                <button onClick={() => handleDelete(lesson._id)}
                  className="text-xs px-2.5 py-1.5 rounded-lg"
                  style={{ background: 'var(--terracotta-soft)', color: 'var(--terracotta)' }}>
                  Xóa
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
          onClick={(e) => { if (e.target === e.currentTarget) setShowModal(false); }}>
          <div className="w-full max-w-lg rounded-2xl overflow-hidden" style={{ background: 'var(--white)', maxHeight: '85vh', display: 'flex', flexDirection: 'column' }}>
            <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
              <h2 className="font-display font-bold text-lg" style={{ color: 'var(--text-primary)' }}>
                {editing ? 'Chỉnh sửa bài học' : 'Thêm bài học mới'}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-xl leading-none" style={{ color: 'var(--text-muted)' }}>✕</button>
            </div>

            <div className="overflow-y-auto flex-1 p-6 space-y-4">
              {/* Title */}
              <div>
                <label className="text-xs font-semibold block mb-1.5" style={{ color: 'var(--text-muted)' }}>TIÊU ĐỀ BÀI HỌC *</label>
                <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  placeholder="Chương 1: Phương trình bậc nhất"
                  className="w-full px-3 py-2.5 rounded-xl border text-sm"
                  style={{ borderColor: 'var(--border)', background: 'var(--white)', color: 'var(--text-primary)' }} />
              </div>

              {/* Description */}
              <div>
                <label className="text-xs font-semibold block mb-1.5" style={{ color: 'var(--text-muted)' }}>MÔ TẢ</label>
                <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  placeholder="Mô tả ngắn về bài học..."
                  rows={2}
                  className="w-full px-3 py-2.5 rounded-xl border text-sm resize-none"
                  style={{ borderColor: 'var(--border)', background: 'var(--white)', color: 'var(--text-primary)' }} />
              </div>

              {/* Publish toggle */}
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <div className="relative">
                    <input type="checkbox" className="sr-only" checked={form.isPublished}
                      onChange={e => setForm(f => ({ ...f, isPublished: e.target.checked }))} />
                    <div className="w-10 h-5 rounded-full transition-colors"
                      style={{ background: form.isPublished ? 'var(--olive)' : 'var(--border)' }} />
                    <div className="absolute top-0.5 left-0.5 w-4 h-4 rounded-full shadow transition-transform"
                      style={{ background: '#ffffff', transform: form.isPublished ? 'translateX(20px)' : 'translateX(0)' }} />
                  </div>
                  <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                    {form.isPublished ? 'Đã đăng (học viên thấy)' : 'Nháp (chỉ admin)'}
                  </span>
                </label>
              </div>

              {/* Items */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>NỘI DUNG ({form.items.length} mục)</label>
                  <button onClick={addItem} className="text-xs font-semibold px-2.5 py-1 rounded-lg"
                    style={{ background: 'var(--amber-soft)', color: 'var(--amber-warm)' }}>
                    + Thêm mục
                  </button>
                </div>
                <div className="space-y-3">
                  {form.items.map((item, idx) => (
                    <div key={idx} className="border rounded-xl p-3 space-y-2" style={{ borderColor: 'var(--border)' }}>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold shrink-0 w-5" style={{ color: 'var(--text-muted)' }}>{idx + 1}.</span>
                        <input value={item.title} onChange={e => setItemField(idx, 'title', e.target.value)}
                          placeholder="Tên mục (VD: Bài 1.1 Định nghĩa)"
                          className="flex-1 px-2.5 py-1.5 rounded-lg border text-sm"
                          style={{ borderColor: 'var(--border)', background: 'var(--white)', color: 'var(--text-primary)' }} />
                        <button onClick={() => removeItem(idx)}
                          disabled={form.items.length <= 1}
                          className="text-xs shrink-0 p-1.5 rounded-lg"
                          style={{ color: 'var(--terracotta)', background: 'var(--terracotta-soft)' }}>✕</button>
                      </div>
                      <div className="flex gap-2 ml-7">
                        <select value={item.type} onChange={e => setItemField(idx, 'type', e.target.value)}
                          className="flex-1 px-2 py-1.5 rounded-lg border text-xs"
                          style={{ borderColor: 'var(--border)', background: 'var(--white)', color: 'var(--text-primary)' }}>
                          {ITEM_TYPES.map(t => <option key={t} value={t}>{ITEM_TYPE_LABEL[t]}</option>)}
                        </select>
                        <input value={item.duration} onChange={e => setItemField(idx, 'duration', e.target.value)}
                          placeholder="Phút" type="number" min="0"
                          className="w-20 px-2 py-1.5 rounded-lg border text-xs"
                          style={{ borderColor: 'var(--border)', background: 'var(--white)', color: 'var(--text-primary)' }} />
                      </div>
                      {(item.type === 'link' || item.externalUrl) && (
                        <div className="ml-7">
                          <input value={item.externalUrl} onChange={e => setItemField(idx, 'externalUrl', e.target.value)}
                            placeholder="https://..."
                            className="w-full px-2.5 py-1.5 rounded-lg border text-xs"
                            style={{ borderColor: 'var(--border)', background: 'var(--white)', color: 'var(--text-primary)' }} />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-3 px-6 py-4 border-t" style={{ borderColor: 'var(--border)' }}>
              <button onClick={() => setShowModal(false)}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold border"
                style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}>
                Hủy
              </button>
              <button onClick={handleSave} disabled={saving}
                className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white"
                style={{ background: 'linear-gradient(135deg,#f59e0b,#d97706)', opacity: saving ? 0.7 : 1 }}>
                {saving ? 'Đang lưu...' : (editing ? 'Cập nhật' : 'Tạo bài học')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LessonManager;
