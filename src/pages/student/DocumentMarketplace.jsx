import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { getApiErrorMessage } from '../../api/errors';
import StudentLayout from '../../components/StudentLayout';
import {
  useDocumentFiltersQuery,
  useDocumentMarketplaceQuery,
} from '../../features/documents/hooks';

const CATEGORY_MAP = {
  đề_thi: 'Đề thi',
  tài_liệu: 'Tài liệu',
  bài_giảng: 'Bài giảng',
  sách: 'Sách',
  khác: 'Khác',
};

const CATEGORY_BADGE = {
  đề_thi: 'badge-red',
  tài_liệu: 'badge-blue',
  bài_giảng: 'badge-purple',
  sách: 'badge-green',
  khác: 'badge-gray',
};

const CATEGORY_GRADIENT = {
  đề_thi: 'linear-gradient(135deg, #ef4444, #dc2626)',
  tài_liệu: 'linear-gradient(135deg, #3b82f6, #2563eb)',
  bài_giảng: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
  sách: 'linear-gradient(135deg, #10b981, #059669)',
  khác: 'linear-gradient(135deg, #64748b, #475569)',
};

const CATEGORY_ICON = {
  đề_thi: '📝',
  tài_liệu: '📄',
  bài_giảng: '🎓',
  sách: '📚',
  khác: '📎',
};

const SORT_OPTIONS = [
  { value: 'newest', label: 'Mới nhất' },
  { value: 'popular', label: 'Phổ biến' },
  { value: 'price_asc', label: 'Giá tăng dần' },
  { value: 'price_desc', label: 'Giá giảm dần' },
];

const formatPrice = (price) => {
  if (!price || price === 0) return 'Miễn phí';
  return price.toLocaleString('vi-VN') + 'đ';
};

const StarRating = ({ rating = 0, size = 'text-sm' }) => {
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    stars.push(
      <span key={i} className={size} style={{ color: i <= Math.round(rating) ? 'var(--amber)' : 'var(--border)' }}>
        {i <= Math.round(rating) ? '★' : '☆'}
      </span>
    );
  }
  return <span className="inline-flex gap-0.5">{stars}</span>;
};

const SkeletonCard = () => (
  <div className="card rounded-2xl overflow-hidden">
    <div className="skeleton h-36 w-full" style={{ borderRadius: 0 }} />
    <div className="p-4 space-y-3">
      <div className="skeleton h-3 w-16" />
      <div className="skeleton h-4 w-full" />
      <div className="skeleton h-4 w-3/4" />
      <div className="flex gap-2">
        <div className="skeleton h-3 w-12" />
        <div className="skeleton h-3 w-12" />
      </div>
      <div className="flex justify-between items-center">
        <div className="skeleton h-3 w-20" />
        <div className="skeleton h-5 w-16" />
      </div>
    </div>
  </div>
);

const DocumentMarketplace = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Filters
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [subject, setSubject] = useState(searchParams.get('subject') || '');
  const [grade, setGrade] = useState(searchParams.get('grade') || '');
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [sort, setSort] = useState(searchParams.get('sort') || 'newest');
  const [page, setPage] = useState(Number(searchParams.get('page')) || 1);

  // Debounced search
  const [debouncedSearch, setDebouncedSearch] = useState(search);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const documentFiltersQuery = useDocumentFiltersQuery();
  const documentsQuery = useDocumentMarketplaceQuery({
    category: category || undefined,
    grade: grade || undefined,
    page,
    search: debouncedSearch || undefined,
    sort,
    subject: subject || undefined,
  });

  const subjects = documentFiltersQuery.data?.subjects || [];
  const grades = documentFiltersQuery.data?.grades || [];
  const documents = documentsQuery.data?.documents || [];
  const total = documentsQuery.data?.total || 0;
  const totalPages = documentsQuery.data?.totalPages || 0;
  const loading = documentsQuery.isPending;
  const documentsErrorMessage = documentsQuery.isError
    ? getApiErrorMessage(documentsQuery.error, 'Không thể tải kho tài liệu')
    : '';

  // Sync filters to URL
  useEffect(() => {
    const params = new URLSearchParams();
    if (debouncedSearch) params.set('search', debouncedSearch);
    if (subject) params.set('subject', subject);
    if (grade) params.set('grade', grade);
    if (category) params.set('category', category);
    if (sort !== 'newest') params.set('sort', sort);
    if (page > 1) params.set('page', page);
    setSearchParams(params, { replace: true });
  }, [debouncedSearch, subject, grade, category, sort, page, setSearchParams]);

  const handleFilterChange = (setter) => (e) => {
    setter(e.target.value);
    setPage(1);
  };

  return (
    <StudentLayout>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6 fade-in">
          <h1 className="font-display text-2xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
            Kho Tài Liệu
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
            Khám phá và tải về tài liệu học tập chất lượng cao
          </p>
        </div>

        {/* Search bar */}
        <div className="mb-4 fade-in-up">
          <div className="relative">
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-muted)' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm kiếm tài liệu..."
              className="input pl-11"
            />
          </div>
        </div>

        {/* Filter bar */}
        <div className="flex flex-wrap gap-2 mb-5 fade-in-up">
          <select
            value={subject}
            onChange={handleFilterChange(setSubject)}
            className="px-3 py-2 rounded-xl border text-sm"
            style={{ borderColor: 'var(--border)', background: 'var(--white)', color: 'var(--text-primary)' }}
          >
            <option value="">Tất cả môn</option>
            {subjects.map(s => <option key={s} value={s}>{s}</option>)}
          </select>

          <select
            value={grade}
            onChange={handleFilterChange(setGrade)}
            className="px-3 py-2 rounded-xl border text-sm"
            style={{ borderColor: 'var(--border)', background: 'var(--white)', color: 'var(--text-primary)' }}
          >
            <option value="">Tất cả lớp</option>
            {grades.map(g => <option key={g} value={g}>{g}</option>)}
          </select>

          <select
            value={category}
            onChange={handleFilterChange(setCategory)}
            className="px-3 py-2 rounded-xl border text-sm"
            style={{ borderColor: 'var(--border)', background: 'var(--white)', color: 'var(--text-primary)' }}
          >
            <option value="">Tất cả loại</option>
            {Object.entries(CATEGORY_MAP).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>

          <select
            value={sort}
            onChange={handleFilterChange(setSort)}
            className="px-3 py-2 rounded-xl border text-sm ml-auto"
            style={{ borderColor: 'var(--border)', background: 'var(--white)', color: 'var(--text-primary)' }}
          >
            {SORT_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        {/* Results count */}
        {!loading && !documentsErrorMessage && (
          <div className="mb-4 text-xs font-medium fade-in" style={{ color: 'var(--text-muted)' }}>
            {total > 0 ? `Tìm thấy ${total} tài liệu` : ''}
          </div>
        )}

        {/* Loading skeletons */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : documentsErrorMessage ? (
          <div className="card p-12 text-center fade-in-up">
            <div className="w-16 h-16 mx-auto rounded-2xl flex items-center justify-center mb-4" style={{ background: 'var(--danger-light)' }}>
              <span className="text-3xl">⚠️</span>
            </div>
            <h3 className="font-display font-bold text-lg" style={{ color: 'var(--text-primary)' }}>
              Không thể tải tài liệu
            </h3>
            <p className="text-sm mt-1 mb-5" style={{ color: 'var(--text-muted)' }}>
              {documentsErrorMessage}
            </p>
            <button
              onClick={() => documentsQuery.refetch()}
              className="btn-primary inline-flex items-center gap-2 py-2.5 px-5 text-sm rounded-xl"
            >
              Thử lại
            </button>
          </div>
        ) : documents.length === 0 ? (
          /* Empty state */
          <div className="card p-12 text-center fade-in-up">
            <div className="w-16 h-16 mx-auto rounded-2xl flex items-center justify-center mb-4" style={{ background: 'var(--amber-soft)' }}>
              <span className="text-3xl">📚</span>
            </div>
            <h3 className="font-display font-bold text-lg" style={{ color: 'var(--text-primary)' }}>
              Không tìm thấy tài liệu
            </h3>
            <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
              Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm
            </p>
            {(search || subject || grade || category) && (
              <button
                onClick={() => { setSearch(''); setSubject(''); setGrade(''); setCategory(''); setSort('newest'); setPage(1); }}
                className="btn-secondary mt-4 inline-flex items-center gap-2 py-2 px-4 text-sm rounded-xl"
              >
                Xóa bộ lọc
              </button>
            )}
          </div>
        ) : (
          /* Document grid */
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 stagger-children">
              {documents.map((doc) => (
                <Link
                  key={doc._id}
                  to={`/student/documents/${doc._id}`}
                  className="card-interactive rounded-2xl overflow-hidden block"
                >
                  {/* Thumbnail / gradient placeholder */}
                  <div className="relative h-36 overflow-hidden">
                    {doc.thumbnailUrl ? (
                      <img
                        src={doc.thumbnailUrl}
                        alt={doc.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div
                        className="w-full h-full flex items-center justify-center"
                        style={{ background: CATEGORY_GRADIENT[doc.category] || CATEGORY_GRADIENT.khác }}
                      >
                        <span className="text-4xl opacity-80">
                          {CATEGORY_ICON[doc.category] || CATEGORY_ICON.khác}
                        </span>
                      </div>
                    )}
                    {/* Category badge overlay */}
                    <div className="absolute top-3 left-3">
                      <span className={`badge ${CATEGORY_BADGE[doc.category] || 'badge-gray'}`}>
                        {CATEGORY_MAP[doc.category] || 'Khác'}
                      </span>
                    </div>
                    {/* Price badge overlay */}
                    {doc.price === 0 && (
                      <div className="absolute top-3 right-3">
                        <span className="badge badge-green">Miễn phí</span>
                      </div>
                    )}
                  </div>

                  {/* Card body */}
                  <div className="p-4">
                    {/* Title */}
                    <h3
                      className="font-semibold text-sm leading-snug line-clamp-2 mb-2"
                      style={{ color: 'var(--text-primary)' }}
                    >
                      {doc.title}
                    </h3>

                    {/* Subject + Grade tags */}
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {doc.subject && (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ background: 'var(--info-light)', color: '#1e40af' }}>
                          {doc.subject}
                        </span>
                      )}
                      {doc.grade && (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ background: 'var(--purple-light)', color: '#5b21b6' }}>
                          {doc.grade}
                        </span>
                      )}
                    </div>

                    {/* Rating + downloads */}
                    <div className="flex items-center gap-2 mb-3">
                      <StarRating rating={doc.averageRating || 0} size="text-xs" />
                      <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                        ({doc.reviewCount || 0})
                      </span>
                      <span className="text-[10px] ml-auto" style={{ color: 'var(--text-muted)' }}>
                        <svg className="inline w-3 h-3 mr-0.5 -mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                          <polyline points="7 10 12 15 17 10" />
                          <line x1="12" y1="15" x2="12" y2="3" />
                        </svg>
                        {doc.downloadCount || 0}
                      </span>
                    </div>

                    {/* Price */}
                    <div className="flex items-center justify-between">
                      <span
                        className="font-display font-bold text-sm"
                        style={{ color: doc.price === 0 ? 'var(--success)' : 'var(--amber-warm)' }}
                      >
                        {formatPrice(doc.price)}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8 fade-in">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="px-3 py-2 rounded-xl text-sm font-medium border transition-all"
                  style={{
                    borderColor: 'var(--border)',
                    color: page <= 1 ? 'var(--text-muted)' : 'var(--text-secondary)',
                    background: 'var(--white)',
                    opacity: page <= 1 ? 0.5 : 1,
                    cursor: page <= 1 ? 'not-allowed' : 'pointer',
                  }}
                >
                  ← Trước
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                  .reduce((acc, p, idx, arr) => {
                    if (idx > 0 && p - arr[idx - 1] > 1) {
                      acc.push('...');
                    }
                    acc.push(p);
                    return acc;
                  }, [])
                  .map((p, idx) =>
                    p === '...' ? (
                      <span key={`ellipsis-${idx}`} className="px-2 text-sm" style={{ color: 'var(--text-muted)' }}>
                        ...
                      </span>
                    ) : (
                      <button
                        key={p}
                        onClick={() => setPage(p)}
                        className="w-9 h-9 rounded-xl text-sm font-semibold transition-all"
                        style={{
                          background: p === page ? 'var(--grad-amber)' : 'var(--white)',
                          color: p === page ? 'white' : 'var(--text-secondary)',
                          border: p === page ? 'none' : '1px solid var(--border)',
                          boxShadow: p === page ? 'var(--shadow-amber)' : 'none',
                        }}
                      >
                        {p}
                      </button>
                    )
                  )}

                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                  className="px-3 py-2 rounded-xl text-sm font-medium border transition-all"
                  style={{
                    borderColor: 'var(--border)',
                    color: page >= totalPages ? 'var(--text-muted)' : 'var(--text-secondary)',
                    background: 'var(--white)',
                    opacity: page >= totalPages ? 0.5 : 1,
                    cursor: page >= totalPages ? 'not-allowed' : 'pointer',
                  }}
                >
                  Sau →
                </button>
              </div>
            )}

            {/* Page info */}
            {totalPages > 1 && (
              <div className="text-center mt-3 text-xs" style={{ color: 'var(--text-muted)' }}>
                Trang {page} / {totalPages}
              </div>
            )}
          </>
        )}
      </div>
    </StudentLayout>
  );
};

export default DocumentMarketplace;
