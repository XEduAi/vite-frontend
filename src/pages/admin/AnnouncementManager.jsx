import { useEffect, useState } from 'react';
import axiosClient from '../../api/axiosClient';
import AdminLayout from '../../components/AdminLayout';

const AnnouncementManager = () => {
    const [announcements, setAnnouncements] = useState([]);
    const [classes, setClasses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({ title: '', content: '', targetClasses: [], priority: 'normal', expiresAt: '' });
    const [msg, setMsg] = useState({ text: '', type: '' });

    const showMsg = (text, type = 'success') => {
        setMsg({ text, type });
        setTimeout(() => setMsg({ text: '', type: '' }), 3000);
    };

    const fetchAnnouncements = async () => {
        try {
            setLoading(true);
            const res = await axiosClient.get('/announcements');
            setAnnouncements(res.data.announcements || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const fetchClasses = async () => {
        try {
            const res = await axiosClient.get('/classes');
            setClasses(res.data.classes || []);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchAnnouncements();
        fetchClasses();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.title.trim() || !form.content.trim()) {
            showMsg('Vui lòng nhập tiêu đề và nội dung', 'error');
            return;
        }
        try {
            const data = {
                ...form,
                expiresAt: form.expiresAt || undefined
            };
            await axiosClient.post('/announcements', data);
            showMsg('Tạo thông báo thành công');
            setShowForm(false);
            setForm({ title: '', content: '', targetClasses: [], priority: 'normal', expiresAt: '' });
            fetchAnnouncements();
        } catch (err) {
            showMsg(err.response?.data?.message || 'Lỗi', 'error');
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Xóa thông báo này?')) return;
        try {
            await axiosClient.delete(`/announcements/${id}`);
            showMsg('Đã xóa thông báo');
            fetchAnnouncements();
        } catch (err) {
            showMsg('Lỗi xóa', 'error');
        }
    };

    const toggleClassSelect = (classId) => {
        setForm(prev => ({
            ...prev,
            targetClasses: prev.targetClasses.includes(classId)
                ? prev.targetClasses.filter(id => id !== classId)
                : [...prev.targetClasses, classId]
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

    return (
        <AdminLayout>
            <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Thông báo</h1>
                    <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>{announcements.length} thông báo</p>
                </div>
                <button onClick={() => setShowForm(true)} className="btn-primary">
                    + Tạo thông báo
                </button>
            </div>

            {/* Toast */}
            {msg.text && (
                <div className={`toast mb-4 ${msg.type === 'error' ? 'toast-error' : 'toast-success'}`}>
                    {msg.type === 'error' ? '⚠' : '✓'} {msg.text}
                </div>
            )}

            {/* Announcement List */}
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
                    {announcements.map(a => (
                        <div key={a._id} className="card overflow-hidden transition-all hover:shadow-md">
                            <div className="p-5 flex items-start gap-4">
                                <div
                                    className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-lg mt-0.5"
                                    style={{
                                        background: a.priority === 'important'
                                            ? 'linear-gradient(135deg, #fef3c7, #fde68a)'
                                            : 'var(--cream-warm)',
                                        color: a.priority === 'important' ? '#d97706' : 'var(--text-muted)'
                                    }}
                                >
                                    {a.priority === 'important' ? '⚡' : '📢'}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <h3 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{a.title}</h3>
                                        {a.priority === 'important' && (
                                            <span className="badge badge-amber">Quan trọng</span>
                                        )}
                                    </div>
                                    <p className="text-sm mt-1.5 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                                        {a.content}
                                    </p>
                                    <div className="flex flex-wrap items-center gap-3 mt-3">
                                        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                                            {timeAgo(a.createdAt)}
                                        </span>
                                        {a.createdBy && (
                                            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                                                · bởi {a.createdBy.fullName}
                                            </span>
                                        )}
                                        {a.targetClasses?.length > 0 ? (
                                            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                                                · {a.targetClasses.map(c => c.name).join(', ')}
                                            </span>
                                        ) : (
                                            <span className="badge badge-blue text-[10px]">Tất cả</span>
                                        )}
                                        {a.expiresAt && (
                                            <span className="text-xs" style={{ color: new Date(a.expiresAt) < new Date() ? 'var(--danger)' : 'var(--text-muted)' }}>
                                                · Hết hạn {new Date(a.expiresAt).toLocaleDateString('vi-VN')}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleDelete(a._id)}
                                    className="p-2 rounded-lg transition-colors shrink-0"
                                    style={{ color: 'var(--danger)' }}
                                    onMouseEnter={(e) => e.currentTarget.style.background = 'var(--danger-light)'}
                                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                    title="Xóa"
                                >
                                    🗑️
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* === CREATE FORM MODAL === */}
            {showForm && (
                <div className="fixed inset-0 z-50 flex items-start justify-center pt-10 px-4 modal-overlay">
                    <div className="rounded-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto shadow-2xl modal-content" style={{ background: 'var(--white)' }}>
                        <div className="sticky top-0 px-6 py-4 border-b flex items-center justify-between z-10" style={{ background: 'var(--white)', borderColor: 'var(--border)' }}>
                            <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
                                Tạo thông báo mới
                            </h2>
                            <button onClick={() => setShowForm(false)} className="text-xl transition-colors" style={{ color: 'var(--text-muted)' }}
                                onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text-primary)'}
                                onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}>✕</button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-5">
                            {/* Title */}
                            <div>
                                <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--text-primary)' }}>Tiêu đề *</label>
                                <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
                                    className="input" placeholder="VD: Lịch nghỉ Tết, Thông báo thi..." />
                            </div>

                            {/* Content */}
                            <div>
                                <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--text-primary)' }}>Nội dung *</label>
                                <textarea value={form.content} onChange={e => setForm({ ...form, content: e.target.value })}
                                    rows={4} className="input resize-none" placeholder="Nội dung thông báo chi tiết..." />
                            </div>

                            {/* Priority */}
                            <div>
                                <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Mức độ</label>
                                <div className="flex gap-3">
                                    <button type="button" onClick={() => setForm({ ...form, priority: 'normal' })}
                                        className="flex-1 py-2.5 rounded-xl text-sm font-medium border-2 transition-all"
                                        style={{
                                            borderColor: form.priority === 'normal' ? '#2563eb' : 'var(--border)',
                                            background: form.priority === 'normal' ? '#dbeafe' : 'transparent',
                                            color: form.priority === 'normal' ? '#2563eb' : 'var(--text-secondary)'
                                        }}>
                                        📢 Bình thường
                                    </button>
                                    <button type="button" onClick={() => setForm({ ...form, priority: 'important' })}
                                        className="flex-1 py-2.5 rounded-xl text-sm font-medium border-2 transition-all"
                                        style={{
                                            borderColor: form.priority === 'important' ? '#d97706' : 'var(--border)',
                                            background: form.priority === 'important' ? '#fef3c7' : 'transparent',
                                            color: form.priority === 'important' ? '#d97706' : 'var(--text-secondary)'
                                        }}>
                                        ⚡ Quan trọng
                                    </button>
                                </div>
                            </div>

                            {/* Target Classes */}
                            <div>
                                <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                                    Gửi đến lớp <span className="font-normal" style={{ color: 'var(--text-muted)' }}>(bỏ trống = tất cả)</span>
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {classes.map(cls => (
                                        <button
                                            key={cls._id}
                                            type="button"
                                            onClick={() => toggleClassSelect(cls._id)}
                                            className="px-3 py-1.5 rounded-lg text-sm border transition-all"
                                            style={{
                                                borderColor: form.targetClasses.includes(cls._id) ? 'var(--amber-warm)' : 'var(--border)',
                                                background: form.targetClasses.includes(cls._id) ? 'var(--amber-soft)' : 'transparent',
                                                color: form.targetClasses.includes(cls._id) ? 'var(--amber-warm)' : 'var(--text-secondary)'
                                            }}
                                        >
                                            {form.targetClasses.includes(cls._id) ? '✓ ' : ''}{cls.name}
                                        </button>
                                    ))}
                                    {classes.length === 0 && (
                                        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Chưa có lớp nào</p>
                                    )}
                                </div>
                            </div>

                            {/* Expires At */}
                            <div>
                                <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--text-primary)' }}>
                                    Hết hạn <span className="font-normal" style={{ color: 'var(--text-muted)' }}>(tùy chọn)</span>
                                </label>
                                <input
                                    type="datetime-local"
                                    value={form.expiresAt}
                                    onChange={e => setForm({ ...form, expiresAt: e.target.value })}
                                    className="input"
                                />
                                <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Thông báo sẽ tự ẩn sau thời điểm này</p>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-3 pt-2">
                                <button type="submit" className="btn-primary">
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
