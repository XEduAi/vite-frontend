import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { getApiErrorMessage } from '../../api/errors';
import AdminLayout from '../../components/AdminLayout';
import AdminToast from '../../components/AdminToast';
import {
  useAdminDocumentsQuery,
  useDeleteDocumentMutation,
  useDocumentAnalyticsQuery,
  useSaveDocumentMutation,
} from '../../features/documents/hooks';

const CATEGORIES = [
  { value: 'đề_thi', label: 'Đề thi' },
  { value: 'tài_liệu', label: 'Tài liệu' },
  { value: 'bài_giảng', label: 'Bài giảng' },
  { value: 'sách', label: 'Sách' },
  { value: 'khác', label: 'Khác' },
];

const CATEGORY_MAP = {
  'đề_thi': 'Đề thi',
  'tài_liệu': 'Tài liệu',
  'bài_giảng': 'Bài giảng',
  'sách': 'Sách',
  'khác': 'Khác',
};

const CATEGORY_BADGE = {
  'đề_thi': 'badge-red',
  'tài_liệu': 'badge-blue',
  'bài_giảng': 'badge-purple',
  'sách': 'badge-green',
  'khác': 'badge-gray',
};

const ITEMS_PER_PAGE = 10;

const EMPTY_FORM = {
  title: '',
  description: '',
  subject: '',
  grade: '',
  topic: '',
  category: 'tài_liệu',
  price: 0,
  tags: '',
  previewUrl: '',
  isFeatured: false,
  isPublished: true,
};

const IconChart = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
    <path d="M18 20V10M12 20V4M6 20v-6" />
  </svg>
);

const IconPlus = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="w-4 h-4">
    <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const IconSearch = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" className="w-4 h-4">
    <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

const DocumentManager = () => {
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [selectedFile, setSelectedFile] = useState(null);
  const [msg, setMsg] = useState({ text: '', type: '' });
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const fileInputRef = useRef();
  const adminDocumentsQuery = useAdminDocumentsQuery();
  const analyticsQuery = useDocumentAnalyticsQuery();
  const saveDocumentMutation = useSaveDocumentMutation();
  const deleteDocumentMutation = useDeleteDocumentMutation();

  const documents = adminDocumentsQuery.data || [];
  const analytics = analyticsQuery.data || null;
  const loading = adminDocumentsQuery.isPending;
  const submitting = saveDocumentMutation.isPending;
  const documentsErrorMessage = adminDocumentsQuery.isError
    ? getApiErrorMessage(adminDocumentsQuery.error, 'Không thể tải danh sách tài liệu')
    : '';
  const analyticsErrorMessage = analyticsQuery.isError
    ? getApiErrorMessage(analyticsQuery.error, 'Không thể tải thống kê tài liệu')
    : '';

  const showMsg = (text, type = 'success') => {
    setMsg({ text, type });
    setTimeout(() => setMsg({ text: '', type: '' }), 4000);
  };

  const openCreate = () => {
    setEditingId(null);
    setForm({ ...EMPTY_FORM });
    setSelectedFile(null);
    setShowModal(true);
  };

  const openEdit = (doc) => {
    setEditingId(doc._id);
    setForm({
      title: doc.title || '',
      description: doc.description || '',
      subject: doc.subject || '',
      grade: doc.grade || '',
      topic: doc.topic || '',
      category: doc.category || 'tài_liệu',
      price: doc.price || 0,
      tags: (doc.tags || []).join(', '),
      previewUrl: doc.previewUrl || '',
      isFeatured: doc.isFeatured || false,
      isPublished: doc.isPublished !== false,
    });
    setSelectedFile(null);
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) { showMsg('Vui lòng nhập tên tài liệu', 'error'); return; }

    try {
      const formData = new FormData();
      formData.append('title', form.title);
      formData.append('description', form.description);
      formData.append('subject', form.subject);
      if (form.grade) formData.append('grade', Number(form.grade));
      formData.append('topic', form.topic);
      formData.append('category', form.category);
      formData.append('price', Number(form.price));
      formData.append('tags', form.tags);
      formData.append('previewUrl', form.previewUrl);
      formData.append('isFeatured', form.isFeatured);
      formData.append('isPublished', form.isPublished);
      if (selectedFile) formData.append('file', selectedFile);

      await saveDocumentMutation.mutateAsync({
        documentId: editingId,
        payload: formData,
      });

      if (editingId) {
        showMsg('Cập nhật tài liệu thành công');
      } else {
        showMsg('Thêm tài liệu thành công');
      }
      setShowModal(false);
    } catch (err) {
      showMsg(getApiErrorMessage(err, 'Lỗi khi lưu tài liệu'), 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc muốn xóa tài liệu này?')) return;
    try {
      await deleteDocumentMutation.mutateAsync(id);
      showMsg('Đã xóa tài liệu');
    } catch (err) {
      showMsg(getApiErrorMessage(err, 'Lỗi khi xóa tài liệu'), 'error');
    }
  };

  const handleTogglePublished = async (doc) => {
    try {
      await saveDocumentMutation.mutateAsync({
        documentId: doc._id,
        payload: { isPublished: !doc.isPublished },
      });
    } catch (err) {
      showMsg(getApiErrorMessage(err, 'Lỗi khi cập nhật trạng thái'), 'error');
    }
  };

  // Filter & search
  const filtered = documents.filter(doc => {
    const matchCategory = !filterCategory || doc.category === filterCategory;
    const matchSearch = !search || doc.title?.toLowerCase().includes(search.toLowerCase());
    return matchCategory && matchSearch;
  });

  // Pagination
  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  // Reset page when filters change
  useEffect(() => { setCurrentPage(1); }, [search, filterCategory]);

  const renderStars = (rating) => {
    const stars = [];
    const r = Math.round((rating || 0) * 2) / 2;
    for (let i = 1; i <= 5; i++) {
      if (i <= r) stars.push(<span key={i} style={{ color: '#f59e0b' }}>★</span>);
      else if (i - 0.5 === r) stars.push(<span key={i} style={{ color: '#f59e0b' }}>★</span>);
      else stars.push(<span key={i} style={{ color: 'var(--text-muted)' }}>☆</span>);
    }
    return <span className="text-sm">{stars}</span>;
  };

  return (
    <AdminLayout>
      {/* Header */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
            Kho Tài Liệu
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
            Quản lý tài liệu, đề thi và bài giảng
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/admin/documents/analytics"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all hover:shadow-md"
            style={{ background: 'var(--cream-warm)', color: 'var(--text-secondary)', border: '1px solid var(--border-light)' }}
          >
            <IconChart /> Phân tích
          </Link>
          <button onClick={openCreate}
            className="btn-primary flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold">
            <IconPlus /> Thêm tài liệu
          </button>
        </div>
      </div>

      {/* Toast */}
      <AdminToast message={msg.text} type={msg.type} />

      {(documentsErrorMessage || analyticsErrorMessage) && (
        <div className="card p-4 mb-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              {documentsErrorMessage && (
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                  {documentsErrorMessage}
                </p>
              )}
              {analyticsErrorMessage && (
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                  {analyticsErrorMessage}
                </p>
              )}
            </div>
            <div className="flex gap-2">
              {documentsErrorMessage && (
                <button
                  onClick={() => adminDocumentsQuery.refetch()}
                  className="btn-secondary inline-flex items-center gap-2 py-2 px-4 text-sm rounded-xl"
                >
                  Tải lại danh sách
                </button>
              )}
              {analyticsErrorMessage && (
                <button
                  onClick={() => analyticsQuery.refetch()}
                  className="btn-secondary inline-flex items-center gap-2 py-2 px-4 text-sm rounded-xl"
                >
                  Tải lại thống kê
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Stats Summary */}
      {analytics && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6 stagger-children">
          <div className="card p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center text-xl"
              style={{ background: 'var(--amber-soft)', color: 'var(--amber-warm)' }}>📄</div>
            <div>
              <div className="font-display text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                {analytics.totalDocuments || documents.length}
              </div>
              <div className="text-xs" style={{ color: 'var(--text-muted)' }}>Tổng tài liệu</div>
            </div>
          </div>
          <div className="card p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center text-xl"
              style={{ background: '#dbeafe', color: '#3b82f6' }}>⬇️</div>
            <div>
              <div className="font-display text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                {analytics.totalDownloads || 0}
              </div>
              <div className="text-xs" style={{ color: 'var(--text-muted)' }}>Lượt tải</div>
            </div>
          </div>
          <div className="card p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center text-xl"
              style={{ background: '#d1fae5', color: '#10b981' }}>💰</div>
            <div>
              <div className="font-display text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                {(analytics.totalRevenue || 0).toLocaleString('vi-VN')}đ
              </div>
              <div className="text-xs" style={{ color: 'var(--text-muted)' }}>Doanh thu</div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="card p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }}>
              <IconSearch />
            </span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm kiếm tài liệu..."
              className="w-full border rounded-xl pl-10 pr-4 py-2.5 text-sm"
              style={{ borderColor: 'var(--border-light)', color: 'var(--text-primary)', background: 'var(--cream-warm)' }}
            />
          </div>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="border rounded-xl px-4 py-2.5 text-sm"
            style={{ borderColor: 'var(--border-light)', color: 'var(--text-primary)', background: 'var(--cream-warm)' }}
          >
            <option value="">Tất cả danh mục</option>
            {CATEGORIES.map(c => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Documents Table */}
      <div className="card overflow-hidden">
        <div className="px-5 py-3.5 border-b" style={{ borderColor: 'var(--border-light)', background: 'var(--cream-warm)' }}>
          <h2 className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>
            DANH SÁCH TÀI LIỆU ({filtered.length})
          </h2>
        </div>

        {loading ? (
          <div className="py-12 text-center text-sm" style={{ color: 'var(--text-muted)' }}>Đang tải...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr style={{ background: 'var(--cream-warm)', borderBottom: '1px solid var(--border-light)' }}>
                  {['Tên tài liệu', 'Danh mục', 'Giá', 'Lượt tải', 'Đánh giá', 'Trạng thái', 'Thao tác'].map(h => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>
                      {h.toUpperCase()}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paginated.map((doc) => (
                  <tr key={doc._id} className="border-b table-row" style={{ borderColor: 'var(--border-light)' }}>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">📄</span>
                        <div className="min-w-0">
                          <p className="font-medium text-sm truncate max-w-[200px]" style={{ color: 'var(--text-primary)' }}>
                            {doc.title}
                          </p>
                          {doc.subject && (
                            <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>
                              {doc.subject}{doc.grade ? ` · Lớp ${doc.grade}` : ''}
                            </p>
                          )}
                        </div>
                        {doc.isFeatured && (
                          <span className="text-xs" title="Nổi bật">⭐</span>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`badge ${CATEGORY_BADGE[doc.category] || 'badge-gray'}`}>
                        {CATEGORY_MAP[doc.category] || doc.category}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="font-semibold text-sm" style={{ color: doc.price > 0 ? 'var(--text-primary)' : '#10b981' }}>
                        {doc.price > 0 ? `${doc.price.toLocaleString('vi-VN')}đ` : 'Miễn phí'}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                        {doc.downloadCount || 0}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1">
                        {renderStars(doc.averageRating)}
                        <span className="text-xs ml-1" style={{ color: 'var(--text-muted)' }}>
                          ({doc.ratingCount || 0})
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <button
                        onClick={() => handleTogglePublished(doc)}
                        className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors"
                        style={{ background: doc.isPublished ? '#10b981' : '#d1d5db' }}
                      >
                        <span
                          className="inline-block h-4 w-4 rounded-full bg-white transition-transform shadow-sm"
                          style={{ transform: doc.isPublished ? 'translateX(22px)' : 'translateX(4px)' }}
                        />
                      </button>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <button onClick={() => openEdit(doc)}
                          className="badge badge-amber cursor-pointer transition-opacity hover:opacity-80">
                          Sửa
                        </button>
                        <button onClick={() => handleDelete(doc._id)}
                          className="badge badge-red cursor-pointer transition-opacity hover:opacity-80">
                          Xóa
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {paginated.length === 0 && (
                  <tr>
                    <td colSpan="7" className="px-5 py-12 text-center">
                      <div className="text-3xl mb-2">📂</div>
                      <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                        {search || filterCategory ? 'Không tìm thấy tài liệu phù hợp' : 'Chưa có tài liệu nào'}
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t" style={{ borderColor: 'var(--border-light)' }}>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              Hiển thị {(currentPage - 1) * ITEMS_PER_PAGE + 1}–{Math.min(currentPage * ITEMS_PER_PAGE, filtered.length)} / {filtered.length}
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors disabled:opacity-40"
                style={{ borderColor: 'var(--border-light)', color: 'var(--text-secondary)' }}
              >
                ← Trước
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className="w-8 h-8 rounded-lg text-xs font-semibold transition-colors"
                  style={{
                    background: page === currentPage ? 'var(--amber-warm)' : 'transparent',
                    color: page === currentPage ? 'white' : 'var(--text-secondary)',
                  }}
                >
                  {page}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors disabled:opacity-40"
                style={{ borderColor: 'var(--border-light)', color: 'var(--text-secondary)' }}
              >
                Sau →
              </button>
            </div>
          </div>
        )}
      </div>

      {/* === CREATE/EDIT MODAL === */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-8 px-4" style={{ background: 'rgba(0,0,0,0.5)' }}>
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[88vh] overflow-y-auto shadow-2xl"
            style={{ background: 'var(--cream)' }}>
            <div className="sticky top-0 px-6 py-4 border-b flex items-center justify-between z-10"
              style={{ borderColor: 'var(--border-light)', background: 'var(--cream)' }}>
              <h2 className="font-display text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
                {editingId ? 'Sửa tài liệu' : 'Thêm tài liệu mới'}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-xl transition-colors hover:opacity-70"
                style={{ color: 'var(--text-muted)' }}>✕</button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {/* Title */}
              <div>
                <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--text-primary)' }}>
                  Tên tài liệu *
                </label>
                <input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full border rounded-xl px-4 py-2.5 text-sm"
                  style={{ borderColor: 'var(--border-light)', color: 'var(--text-primary)', background: 'var(--cream-warm)' }}
                  placeholder="VD: Đề thi thử Toán 12 — Lần 1"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--text-primary)' }}>
                  Mô tả
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={3}
                  className="w-full border rounded-xl px-4 py-2.5 text-sm resize-none"
                  style={{ borderColor: 'var(--border-light)', color: 'var(--text-primary)', background: 'var(--cream-warm)' }}
                  placeholder="Mô tả ngắn về tài liệu..."
                />
              </div>

              {/* Subject, Grade, Topic */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--text-primary)' }}>Môn học</label>
                  <input
                    value={form.subject}
                    onChange={(e) => setForm({ ...form, subject: e.target.value })}
                    className="w-full border rounded-xl px-4 py-2.5 text-sm"
                    style={{ borderColor: 'var(--border-light)', color: 'var(--text-primary)', background: 'var(--cream-warm)' }}
                    placeholder="VD: Toán"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--text-primary)' }}>Lớp</label>
                  <input
                    type="number"
                    value={form.grade}
                    onChange={(e) => setForm({ ...form, grade: e.target.value })}
                    className="w-full border rounded-xl px-4 py-2.5 text-sm"
                    style={{ borderColor: 'var(--border-light)', color: 'var(--text-primary)', background: 'var(--cream-warm)' }}
                    placeholder="VD: 12"
                    min={1} max={12}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--text-primary)' }}>Chủ đề</label>
                  <input
                    value={form.topic}
                    onChange={(e) => setForm({ ...form, topic: e.target.value })}
                    className="w-full border rounded-xl px-4 py-2.5 text-sm"
                    style={{ borderColor: 'var(--border-light)', color: 'var(--text-primary)', background: 'var(--cream-warm)' }}
                    placeholder="VD: Hình học"
                  />
                </div>
              </div>

              {/* Category & Price */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--text-primary)' }}>Danh mục</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full border rounded-xl px-4 py-2.5 text-sm"
                    style={{ borderColor: 'var(--border-light)', color: 'var(--text-primary)', background: 'var(--cream-warm)' }}
                  >
                    {CATEGORIES.map(c => (
                      <option key={c.value} value={c.value}>{c.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--text-primary)' }}>Giá (VNĐ)</label>
                  <input
                    type="number"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    className="w-full border rounded-xl px-4 py-2.5 text-sm"
                    style={{ borderColor: 'var(--border-light)', color: 'var(--text-primary)', background: 'var(--cream-warm)' }}
                    placeholder="0 = Miễn phí"
                    min={0}
                  />
                </div>
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--text-primary)' }}>
                  Tags <span className="font-normal" style={{ color: 'var(--text-muted)' }}>(phân cách bằng dấu phẩy)</span>
                </label>
                <input
                  value={form.tags}
                  onChange={(e) => setForm({ ...form, tags: e.target.value })}
                  className="w-full border rounded-xl px-4 py-2.5 text-sm"
                  style={{ borderColor: 'var(--border-light)', color: 'var(--text-primary)', background: 'var(--cream-warm)' }}
                  placeholder="VD: toán, lớp 12, đề thi"
                />
              </div>

              {/* File upload */}
              <div>
                <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--text-primary)' }}>
                  File tài liệu {!editingId && '*'}
                </label>
                <div
                  className="border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all"
                  style={{
                    borderColor: selectedFile ? 'var(--amber-warm)' : 'var(--border-light)',
                    background: selectedFile ? 'var(--amber-soft)' : 'var(--cream-warm)',
                  }}
                  onClick={() => fileInputRef.current?.click()}
                >
                  {selectedFile ? (
                    <>
                      <div className="text-2xl mb-1">📎</div>
                      <p className="text-sm font-medium" style={{ color: 'var(--amber-warm)' }}>{selectedFile.name}</p>
                      <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                        {(selectedFile.size / 1024 / 1024).toFixed(2)} MB · Nhấn để đổi file
                      </p>
                    </>
                  ) : (
                    <>
                      <div className="text-2xl mb-1">☁️</div>
                      <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Nhấn để chọn file</p>
                      <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>.pdf, .docx, .pptx, .xlsx</p>
                    </>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.docx,.pptx,.xlsx"
                    onChange={(e) => setSelectedFile(e.target.files[0])}
                    className="hidden"
                  />
                </div>
              </div>

              {/* Preview URL */}
              <div>
                <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--text-primary)' }}>
                  URL xem trước <span className="font-normal" style={{ color: 'var(--text-muted)' }}>(tùy chọn)</span>
                </label>
                <input
                  value={form.previewUrl}
                  onChange={(e) => setForm({ ...form, previewUrl: e.target.value })}
                  className="w-full border rounded-xl px-4 py-2.5 text-sm"
                  style={{ borderColor: 'var(--border-light)', color: 'var(--text-primary)', background: 'var(--cream-warm)' }}
                  placeholder="https://..."
                />
              </div>

              {/* Checkboxes */}
              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.isFeatured}
                    onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })}
                    className="w-4 h-4 rounded"
                    style={{ accentColor: 'var(--amber-warm)' }}
                  />
                  <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Nổi bật</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.isPublished}
                    onChange={(e) => setForm({ ...form, isPublished: e.target.checked })}
                    className="w-4 h-4 rounded"
                    style={{ accentColor: 'var(--amber-warm)' }}
                  />
                  <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Xuất bản</span>
                </label>
              </div>

              {/* Submit */}
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-primary px-6 py-2.5 rounded-xl text-sm font-semibold disabled:opacity-60"
                >
                  {submitting ? 'Đang lưu...' : editingId ? 'Cập nhật' : 'Thêm tài liệu'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-6 py-2.5 rounded-xl text-sm font-medium border transition-colors hover:opacity-80"
                  style={{ borderColor: 'var(--border-light)', color: 'var(--text-secondary)' }}
                >
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

export default DocumentManager;
