import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';
import AdminLayout from '../../components/AdminLayout';

const STATUS_LABEL = {
  used: 'Đã dùng',
  unused: 'Còn hạn',
  expired: 'Hết hạn',
};

const formatDate = (value) => {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

const codeStatus = (code) => {
  if (code.usedBy) return 'used';
  if (new Date(code.expiresAt).getTime() < Date.now()) return 'expired';
  return 'unused';
};

const InviteCodeManager = () => {
  const { classId } = useParams();
  const [classInfo, setClassInfo] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [count, setCount] = useState(1);
  const [expiresInDays, setExpiresInDays] = useState(30);
  const [studentName, setStudentName] = useState('');
  const [parentPhone, setParentPhone] = useState('');
  const [lastCreated, setLastCreated] = useState([]);
  const [copied, setCopied] = useState(null);
  const [msg, setMsg] = useState({ type: '', text: '' });
  const [filter, setFilter] = useState('all');

  const load = async () => {
    try {
      setLoading(true);
      const [clsRes, codesRes] = await Promise.all([
        axiosClient.get(`/classes/${classId}`),
        axiosClient.get('/admin/invite-codes', { params: { classId, limit: 100 } }),
      ]);
      setClassInfo(clsRes.data.class || null);
      setItems(codesRes.data.items || []);
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.message || 'Không tải được dữ liệu' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();

  }, [classId]);

  const handleCreate = async (e) => {
    e.preventDefault();
    setMsg({ type: '', text: '' });
    setCreating(true);
    try {
      const body = {
        classId,
        count: Number(count) || 1,
        expiresInDays: Number(expiresInDays) || 30,
      };
      if (studentName || parentPhone) {
        body.prefill = {
          name: studentName.trim(),
          parentPhone: parentPhone.trim(),
        };
      }
      const res = await axiosClient.post('/admin/invite-codes', body);
      setLastCreated(res.data.items || []);
      setItems((prev) => [...(res.data.items || []), ...prev]);
      setStudentName('');
      setParentPhone('');
      setMsg({ type: 'success', text: res.data.message || 'Đã tạo mã' });
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.message || 'Tạo mã thất bại' });
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Xóa mã mời này?')) return;
    try {
      await axiosClient.delete(`/admin/invite-codes/${id}`);
      setItems((prev) => prev.filter((i) => i.id !== id));
      setMsg({ type: 'success', text: 'Đã xóa mã mời' });
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.message || 'Xóa thất bại' });
    }
  };

  const copyToClipboard = async (text, key) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(key);
      setTimeout(() => setCopied(null), 1500);
    } catch {
      setMsg({ type: 'error', text: 'Trình duyệt không hỗ trợ sao chép' });
    }
  };

  const visibleItems = items.filter((item) => {
    if (filter === 'all') return true;
    return codeStatus(item) === filter;
  });

  const stats = items.reduce(
    (acc, item) => {
      const s = codeStatus(item);
      acc[s] = (acc[s] || 0) + 1;
      return acc;
    },
    { unused: 0, used: 0, expired: 0 },
  );

  return (
    <AdminLayout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Link to="/admin/classes" className="text-sm" style={{ color: 'var(--text-muted)' }}>
            ← Quản lý lớp học
          </Link>
          <div className="bento-label mt-1" style={{ color: 'var(--amber-warm)' }}>Mã mời đăng ký</div>
          <h1 className="bento-hero-title mt-2" style={{ color: 'var(--text-primary)' }}>
            🎫 {classInfo?.name || 'Mã mời'}
          </h1>
          {classInfo?.grade && (
            <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
              Khối {classInfo.grade}
            </p>
          )}
        </div>

        {msg.text && (
          <div className={`toast ${msg.type === 'success' ? 'toast-success' : 'toast-error'} mb-4`}>
            {msg.text}
          </div>
        )}

        {/* Create form */}
        <div className="bento-tile bento-tile-surface p-5 mb-5">
          <div className="font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
            Tạo mã mời mới
          </div>
          <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>Số lượng</label>
              <input type="number" min={1} max={50} className="input" value={count} onChange={(e) => setCount(e.target.value)} />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>Hết hạn (ngày)</label>
              <input type="number" min={1} max={365} className="input" value={expiresInDays} onChange={(e) => setExpiresInDays(e.target.value)} />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>Tên học sinh (tuỳ chọn)</label>
              <input type="text" className="input" value={studentName} onChange={(e) => setStudentName(e.target.value)} placeholder="Nguyễn Văn A" />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>SĐT phụ huynh (tuỳ chọn)</label>
              <input type="tel" className="input" value={parentPhone} onChange={(e) => setParentPhone(e.target.value)} placeholder="091..." />
            </div>
            <div className="md:col-span-4 pt-1">
              <button type="submit" className="btn-primary px-5 py-2.5" disabled={creating}>
                {creating ? 'Đang tạo...' : 'Tạo mã'}
              </button>
            </div>
          </form>
        </div>

        {/* Just-created codes spotlight */}
        {lastCreated.length > 0 && (
          <div className="bento-tile bento-tile-warm p-5 mb-5 fade-in-up">
            <div className="font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
              Mã mới tạo — sao chép và gửi cho phụ huynh:
            </div>
            <div className="space-y-2">
              {lastCreated.map((code) => (
                <div key={code.id} className="flex flex-wrap items-center gap-3 p-3 rounded-xl" style={{ background: 'var(--white)' }}>
                  <span className="font-mono font-bold text-lg tracking-widest" style={{ color: 'var(--amber-warm)' }}>
                    {code.code}
                  </span>
                  <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    {code.shareUrl}
                  </span>
                  <div className="ml-auto flex gap-2">
                    <button
                      onClick={() => copyToClipboard(code.code, `code-${code.id}`)}
                      className="btn-secondary px-3 py-1.5 text-xs"
                    >
                      {copied === `code-${code.id}` ? '✓ Đã sao chép' : 'Sao chép mã'}
                    </button>
                    <button
                      onClick={() => copyToClipboard(code.shareUrl, `url-${code.id}`)}
                      className="btn-secondary px-3 py-1.5 text-xs"
                    >
                      {copied === `url-${code.id}` ? '✓ Đã sao chép' : 'Sao chép link'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Filter */}
        <div className="flex items-center gap-2 mb-3">
          {['all', 'unused', 'used', 'expired'].map((key) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`tab-pill ${filter === key ? 'active' : ''}`}
              style={filter !== key ? { color: 'var(--text-secondary)' } : {}}
            >
              {key === 'all' ? `Tất cả (${items.length})` : `${STATUS_LABEL[key]} (${stats[key] || 0})`}
            </button>
          ))}
        </div>

        {/* List */}
        {loading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => <div key={i} className="skeleton h-16 rounded-xl" />)}
          </div>
        ) : visibleItems.length === 0 ? (
          <div className="card rounded-2xl p-10 text-center">
            <div className="text-3xl mb-2">📭</div>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              {filter === 'all' ? 'Chưa có mã mời nào' : 'Không có mã phù hợp bộ lọc'}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {visibleItems.map((code) => {
              const status = codeStatus(code);
              const statusColor = status === 'used' ? 'var(--olive)' : status === 'expired' ? 'var(--terracotta)' : 'var(--amber-warm)';
              const statusSoft = status === 'used' ? 'var(--olive-soft)' : status === 'expired' ? 'var(--terracotta-soft)' : 'var(--amber-soft)';

              return (
                <div key={code.id} className="bento-tile bento-tile-surface p-4 flex flex-wrap items-center gap-3">
                  <span className="font-mono font-bold text-base tracking-widest" style={{ color: 'var(--text-primary)' }}>
                    {code.code}
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded-md font-semibold" style={{ background: statusSoft, color: statusColor }}>
                    {STATUS_LABEL[status]}
                  </span>
                  {code.prefill?.name && (
                    <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                      Cho: {code.prefill.name}
                    </span>
                  )}
                  {code.usedBy?.fullName && (
                    <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                      → {code.usedBy.fullName}
                    </span>
                  )}
                  <span className="text-xs ml-auto" style={{ color: 'var(--text-muted)' }}>
                    {status === 'used' ? `Dùng: ${formatDate(code.usedAt)}` : `Hết hạn: ${formatDate(code.expiresAt)}`}
                  </span>
                  <div className="flex gap-1">
                    {status === 'unused' && (
                      <>
                        <button
                          onClick={() => copyToClipboard(code.code, `c-${code.id}`)}
                          className="btn-secondary px-3 py-1.5 text-xs"
                        >
                          {copied === `c-${code.id}` ? '✓' : 'Sao chép'}
                        </button>
                        <button
                          onClick={() => copyToClipboard(code.shareUrl, `l-${code.id}`)}
                          className="btn-secondary px-3 py-1.5 text-xs"
                        >
                          {copied === `l-${code.id}` ? '✓' : 'Link'}
                        </button>
                        <button
                          onClick={() => handleDelete(code.id)}
                          className="btn-secondary px-3 py-1.5 text-xs"
                          style={{ color: 'var(--terracotta)' }}
                        >
                          Xóa
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default InviteCodeManager;
