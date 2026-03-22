import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getApiErrorMessage } from '../../api/errors';
import { useAuth } from '../../auth/useAuth';
import StudentLayout from '../../components/StudentLayout';
import { useStudentGamificationQuery } from '../../features/dashboard/hooks';
import {
  useDownloadDocumentMutation,
  useDocumentDetailQuery,
  useDocumentReviewsQuery,
  useMyDocumentsQuery,
  usePurchaseDocumentBundleMutation,
  usePurchaseDocumentMutation,
  useSubmitDocumentReviewMutation,
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

const StarSelector = ({ value, onChange }) => (
  <div className="flex gap-1">
    {[1, 2, 3, 4, 5].map(star => (
      <button
        key={star}
        type="button"
        onClick={() => onChange(star)}
        className="text-2xl transition-transform hover:scale-110"
        style={{ color: star <= value ? 'var(--amber)' : 'var(--border)' }}
      >
        {star <= value ? '★' : '☆'}
      </button>
    ))}
  </div>
);

const DocumentDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [message, setMessage] = useState({ type: '', content: '' });

  // Review form
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [downloadingFileIndex, setDownloadingFileIndex] = useState(null);

  // Payment method
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('bank_transfer');
  const documentQuery = useDocumentDetailQuery(id);
  const reviewsQuery = useDocumentReviewsQuery(id);
  const myDocumentsQuery = useMyDocumentsQuery();
  const gamificationQuery = useStudentGamificationQuery();
  const purchaseDocumentMutation = usePurchaseDocumentMutation(id);
  const purchaseDocumentBundleMutation = usePurchaseDocumentBundleMutation(id);
  const downloadDocumentMutation = useDownloadDocumentMutation();
  const submitDocumentReviewMutation = useSubmitDocumentReviewMutation(id);

  const doc = documentQuery.data || null;
  const reviews = reviewsQuery.data || [];
  const myDocuments = myDocumentsQuery.data || [];
  const purchased = myDocuments.some((purchase) => purchase.document?._id === id);
  const hasReviewed = Boolean(
    user?.id && reviews.some((review) => review.user?._id === user.id)
  );
  const userXp = gamificationQuery.data?.xp || 0;
  const loading = documentQuery.isPending || myDocumentsQuery.isPending;
  const purchasing = purchaseDocumentMutation.isPending;
  const bundlePurchasing = purchaseDocumentBundleMutation.isPending;
  const downloading = downloadDocumentMutation.isPending;
  const submittingReview = submitDocumentReviewMutation.isPending;
  const reviewsErrorMessage = reviewsQuery.isError
    ? getApiErrorMessage(reviewsQuery.error, 'Không thể tải đánh giá')
    : '';
  const bundleOffer = doc?.bundleOffer || null;
  const recommendedDocuments = doc?.recommendedDocuments || [];

  const showMsg = (content, type = 'success') => {
    setMessage({ type, content });
    setTimeout(() => setMessage({ type: '', content: '' }), 4000);
  };

  const handlePurchase = async () => {
    if (!doc) return;

    // Free document — auto-complete
    if (doc.price === 0) {
      try {
        const purchase = await purchaseDocumentMutation.mutateAsync({ paymentMethod: 'free' });
        showMsg(
          purchase?.accessGranted
            ? purchase?.followUp?.note || 'Đã thêm tài liệu miễn phí vào thư viện!'
            : 'Yêu cầu mua đã được ghi nhận'
        );
      } catch (err) {
        showMsg(getApiErrorMessage(err, 'Lỗi khi tải tài liệu'), 'error');
      }
      return;
    }

    // Paid document — show payment modal
    setShowPaymentModal(true);
  };

  const confirmPurchase = async () => {
    try {
      const purchase = await purchaseDocumentMutation.mutateAsync({ paymentMethod });
      showMsg(
        purchase?.accessGranted
          ? purchase?.followUp?.note || 'Mua tài liệu thành công! Bạn có thể tải ngay trong thư viện.'
          : 'Yêu cầu mua đã được ghi nhận.'
      );
      setShowPaymentModal(false);
    } catch (err) {
      showMsg(getApiErrorMessage(err, 'Lỗi khi mua tài liệu'), 'error');
    }
  };

  const handleBundlePurchase = async () => {
    if (!bundleOffer) return;

    try {
      const result = await purchaseDocumentBundleMutation.mutateAsync({ paymentMethod: 'bank_transfer' });
      showMsg(result?.followUp?.note || 'Đã mua trọn bộ tài liệu liên quan');
    } catch (err) {
      showMsg(getApiErrorMessage(err, 'Lỗi khi mua bundle tài liệu'), 'error');
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!reviewRating) {
      showMsg('Vui lòng chọn số sao', 'error');
      return;
    }
    try {
      await submitDocumentReviewMutation.mutateAsync({
        rating: reviewRating,
        comment: reviewComment,
      });
      showMsg('Đã gửi đánh giá!');
      setReviewComment('');
      setReviewRating(5);
    } catch (err) {
      showMsg(getApiErrorMessage(err, 'Lỗi khi gửi đánh giá'), 'error');
    }
  };

  const handleDownloadFile = async (fileIndex) => {
    try {
      setDownloadingFileIndex(fileIndex);
      const fallbackName = doc?.files?.[fileIndex]?.fileName || doc?.files?.[fileIndex]?.filename || doc?.title || 'document';
      await downloadDocumentMutation.mutateAsync({ documentId: id, fileIndex, fallbackName });
    } catch (err) {
      showMsg(getApiErrorMessage(err, 'Lỗi khi tải tài liệu'), 'error');
    } finally {
      setDownloadingFileIndex(null);
    }
  };

  if (loading) {
    return (
      <StudentLayout>
        <div className="py-20 text-center">
          <div className="inline-flex items-center gap-3 px-5 py-3 rounded-2xl card">
            <svg className="animate-spin w-5 h-5" style={{ color: 'var(--amber)' }} viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Đang tải...</span>
          </div>
        </div>
      </StudentLayout>
    );
  }

  if (!doc) {
    return (
      <StudentLayout>
        <div className="card p-12 text-center fade-in-up max-w-lg mx-auto">
          <div className="w-16 h-16 mx-auto rounded-2xl flex items-center justify-center mb-4" style={{ background: 'var(--danger-light)' }}>
            <span className="text-3xl">😕</span>
          </div>
          <h3 className="font-display font-bold text-lg" style={{ color: 'var(--text-primary)' }}>
            Không thể tải tài liệu
          </h3>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
            {getApiErrorMessage(documentQuery.error, 'Tài liệu này có thể đã bị xóa hoặc không tồn tại')}
          </p>
          <Link
            to="/student/documents"
            className="btn-secondary inline-flex items-center gap-2 py-2 px-4 text-sm rounded-xl mt-4"
          >
            ← Quay lại kho tài liệu
          </Link>
        </div>
      </StudentLayout>
    );
  }

  return (
    <StudentLayout>
      <div className="max-w-3xl mx-auto">
        {/* Back button */}
        <Link
          to="/student/documents"
          className="inline-flex items-center gap-1.5 text-sm font-medium mb-5 transition-colors fade-in"
          style={{ color: 'var(--text-muted)' }}
          onMouseEnter={e => e.currentTarget.style.color = 'var(--amber-warm)'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
          Quay lại kho tài liệu
        </Link>

        {/* Toast */}
        {message.content && (
          <div className={`toast mb-5 ${message.type === 'error' ? 'toast-error' : 'toast-success'}`}>
            {message.type === 'error' ? '⚠' : '✓'} {message.content}
          </div>
        )}

        {/* Document header card */}
        <div className="card rounded-2xl overflow-hidden mb-6 fade-in-up">
          {/* Preview / thumbnail */}
          {doc.previewUrl ? (
            <div className="relative">
              <img
                src={doc.previewUrl}
                alt={doc.title}
                className="w-full h-56 object-cover"
              />
              <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.4), transparent)' }} />
            </div>
          ) : doc.thumbnailUrl ? (
            <div className="relative">
              <img
                src={doc.thumbnailUrl}
                alt={doc.title}
                className="w-full h-56 object-cover"
              />
              <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.4), transparent)' }} />
            </div>
          ) : null}

          <div className="p-6">
            {/* Category + tags */}
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className={`badge ${CATEGORY_BADGE[doc.category] || 'badge-gray'}`}>
                {CATEGORY_MAP[doc.category] || 'Khác'}
              </span>
              {doc.subject && (
                <span className="badge badge-blue">{doc.subject}</span>
              )}
              {doc.grade && (
                <span className="badge badge-purple">{doc.grade}</span>
              )}
            </div>

            {/* Title */}
            <h1 className="font-display text-xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
              {doc.title}
            </h1>

            {/* Rating + stats */}
            <div className="flex items-center gap-3 mb-4">
              <StarRating rating={doc.averageRating || 0} />
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                ({doc.reviewCount || 0} đánh giá)
              </span>
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                ·
              </span>
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                <svg className="inline w-3.5 h-3.5 mr-0.5 -mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                {doc.downloadCount || 0} lượt tải
              </span>
            </div>

            {/* Author info */}
            {doc.uploadedBy && (
              <div className="flex items-center gap-2 mb-4">
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
                  style={{ background: 'var(--grad-amber)', color: 'white' }}
                >
                  {(doc.uploadedBy.fullName || 'A').charAt(0).toUpperCase()}
                </div>
                <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  {doc.uploadedBy.fullName || 'Giáo viên'}
                </span>
              </div>
            )}

            {/* Description */}
            {doc.description && (
              <div className="mb-5 pt-4" style={{ borderTop: '1px solid var(--border-light)' }}>
                <h3 className="text-xs font-semibold mb-2 uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                  Mô tả
                </h3>
                <p className="text-sm leading-relaxed whitespace-pre-line" style={{ color: 'var(--text-secondary)' }}>
                  {doc.description}
                </p>
              </div>
            )}

            {/* Price + Purchase */}
            <div className="pt-4" style={{ borderTop: '1px solid var(--border-light)' }}>
              <div className="flex items-center justify-between gap-4">
                <div>
                  <div className="text-xs font-semibold mb-1" style={{ color: 'var(--text-muted)' }}>Giá</div>
                  <div
                    className="font-display text-2xl font-bold"
                    style={{ color: doc.price === 0 ? 'var(--success)' : 'var(--amber-warm)' }}
                  >
                    {formatPrice(doc.price)}
                  </div>
                </div>

                {purchased ? (
                  <div className="flex items-center gap-2">
                    <span
                      className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold"
                      style={{ background: 'var(--success-light)', color: 'var(--success)' }}
                    >
                      ✓ Đã mua
                    </span>
                  </div>
                ) : (
                  <button
                    onClick={handlePurchase}
                    disabled={purchasing}
                    className="btn-primary py-2.5 px-6 rounded-xl text-sm"
                    style={{ opacity: purchasing ? 0.7 : 1 }}
                  >
                    {purchasing ? 'Đang xử lý...' : doc.price === 0 ? 'Tải miễn phí' : 'Mua ngay'}
                  </button>
                )}
              </div>

              {!purchased && bundleOffer && bundleOffer.documents?.length > 1 && (
                <div
                  className="mt-4 rounded-2xl p-4"
                  style={{ background: 'var(--amber-soft)', border: '1px solid rgba(245, 158, 11, 0.2)' }}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--amber-warm)' }}>
                        Bundle gợi ý
                      </div>
                      <div className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                        {bundleOffer.documents.length} tài liệu liên quan
                      </div>
                      <div className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                        Tổng lẻ {formatPrice(bundleOffer.originalPrice)} · giảm {bundleOffer.discountPercent}% · còn {formatPrice(bundleOffer.finalPrice)}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleBundlePurchase}
                      disabled={bundlePurchasing}
                      className="btn-primary py-2.5 px-4 rounded-xl text-xs"
                      style={{ opacity: bundlePurchasing ? 0.7 : 1 }}
                    >
                      {bundlePurchasing ? 'Đang xử lý...' : 'Mua trọn bộ'}
                    </button>
                  </div>

                  <div className="mt-3 grid gap-2 sm:grid-cols-2">
                    {bundleOffer.documents.map((item) => (
                      <Link
                        key={item._id}
                        to={`/student/documents/${item._id}`}
                        className="rounded-xl px-3 py-2 transition-all"
                        style={{ background: 'rgba(255,255,255,0.55)', border: '1px solid rgba(255,255,255,0.6)' }}
                      >
                        <div className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                          {item.title}
                        </div>
                        <div className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                          {formatPrice(item.price)}
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* File list section */}
        {doc.files && doc.files.length > 0 && (
          <div className="card rounded-2xl p-6 mb-6 fade-in-up">
            <h3 className="font-display font-bold text-base mb-4" style={{ color: 'var(--text-primary)' }}>
              Tệp đính kèm ({doc.files.length})
            </h3>
            <div className="space-y-2">
              {doc.files.map((file, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all"
                  style={{ background: 'rgba(245,158,11,0.04)', border: '1px solid var(--border-light)' }}
                >
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center text-sm flex-shrink-0"
                    style={{ background: 'var(--info-light)', color: '#1e40af' }}
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                      {file.fileName || `Tệp ${idx + 1}`}
                    </div>
                    {file.fileSize && (
                      <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                        {(file.fileSize / (1024 * 1024)).toFixed(1)} MB
                      </div>
                    )}
                  </div>
                  {purchased ? (
                    <button
                      type="button"
                      onClick={() => handleDownloadFile(idx)}
                      disabled={downloading && downloadingFileIndex === idx}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all disabled:opacity-60"
                      style={{ background: 'var(--success)', color: 'white' }}
                    >
                      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                        <polyline points="7 10 12 15 17 10" />
                        <line x1="12" y1="15" x2="12" y2="3" />
                      </svg>
                      {downloading && downloadingFileIndex === idx ? 'Đang tải...' : 'Tải về'}
                    </button>
                  ) : (
                    <span className="text-xs font-medium px-3 py-1.5 rounded-lg" style={{ background: 'var(--border-light)', color: 'var(--text-muted)' }}>
                      🔒 Mua để tải
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {recommendedDocuments.length > 0 && (
          <div className="card rounded-2xl p-6 mb-6 fade-in-up">
            <div className="flex items-center justify-between gap-3 mb-4">
              <div>
                <h3 className="font-display font-bold text-base" style={{ color: 'var(--text-primary)' }}>
                  Tài liệu nên xem tiếp
                </h3>
                <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                  Cùng môn học hoặc chủ đề liên quan để tiếp nối việc ôn tập
                </p>
              </div>
              <Link to="/student/documents" className="text-xs font-semibold" style={{ color: 'var(--amber-warm)' }}>
                Xem tất cả
              </Link>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              {recommendedDocuments.map((item) => (
                <Link
                  key={item._id}
                  to={`/student/documents/${item._id}`}
                  className="rounded-2xl p-4 transition-all hover:shadow-md"
                  style={{ border: '1px solid var(--border-light)', background: 'rgba(255,255,255,0.6)' }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                        {item.title}
                      </div>
                      <div className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                        {[item.subject, item.grade ? `Lớp ${item.grade}` : '', CATEGORY_MAP[item.category] || 'Tài liệu']
                          .filter(Boolean)
                          .join(' · ')}
                      </div>
                    </div>
                    <div className="text-xs font-semibold" style={{ color: item.price === 0 ? 'var(--success)' : 'var(--amber-warm)' }}>
                      {formatPrice(item.price)}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Reviews section */}
        <div className="card rounded-2xl p-6 fade-in-up">
          <h3 className="font-display font-bold text-base mb-1" style={{ color: 'var(--text-primary)' }}>
            Đánh giá
          </h3>

          {/* Average rating summary */}
          {(doc.reviewCount || 0) > 0 && (
            <div className="flex items-center gap-3 mb-5 pb-4" style={{ borderBottom: '1px solid var(--border-light)' }}>
              <div className="font-display text-3xl font-bold" style={{ color: 'var(--amber-warm)' }}>
                {(doc.averageRating || 0).toFixed(1)}
              </div>
              <div>
                <StarRating rating={doc.averageRating || 0} size="text-base" />
                <div className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                  {doc.reviewCount} đánh giá
                </div>
              </div>
            </div>
          )}

          {/* Review form — only if purchased and not yet reviewed */}
          {purchased && !hasReviewed && (
            <form onSubmit={handleSubmitReview} className="mb-6 pb-5" style={{ borderBottom: '1px solid var(--border-light)' }}>
              <div className="text-xs font-semibold mb-2 uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                Viết đánh giá
              </div>
              <div className="mb-3">
                <StarSelector value={reviewRating} onChange={setReviewRating} />
              </div>
              <textarea
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                placeholder="Chia sẻ trải nghiệm của bạn về tài liệu này..."
                className="input mb-3"
                style={{ minHeight: '80px', resize: 'vertical' }}
              />
              <button
                type="submit"
                disabled={submittingReview}
                className="btn-primary py-2 px-5 rounded-xl text-sm"
                style={{ opacity: submittingReview ? 0.7 : 1 }}
              >
                {submittingReview ? 'Đang gửi...' : 'Gửi đánh giá'}
              </button>
            </form>
          )}

          {/* Reviews list */}
          {reviewsErrorMessage ? (
            <div className="text-center py-6">
              <span className="text-2xl mb-2 block">⚠️</span>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                {reviewsErrorMessage}
              </p>
              <button
                onClick={() => reviewsQuery.refetch()}
                className="btn-secondary inline-flex items-center gap-2 py-2 px-4 text-sm rounded-xl mt-4"
              >
                Thử lại
              </button>
            </div>
          ) : reviews.length > 0 ? (
            <div className="space-y-4">
              {reviews.map((review) => (
                <div key={review._id} className="pb-4" style={{ borderBottom: '1px solid var(--border-light)' }}>
                  <div className="flex items-center gap-2 mb-2">
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                      style={{ background: 'var(--amber-soft)', color: 'var(--amber-warm)' }}
                    >
                      {(review.user?.fullName || 'U').charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
                        {review.user?.fullName || 'Người dùng'}
                      </div>
                      <div className="flex items-center gap-2">
                        <StarRating rating={review.rating} size="text-xs" />
                        <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                          {new Date(review.createdAt).toLocaleDateString('vi-VN')}
                        </span>
                      </div>
                    </div>
                  </div>
                  {review.comment && (
                    <p className="text-sm leading-relaxed ml-9" style={{ color: 'var(--text-secondary)' }}>
                      {review.comment}
                    </p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6">
              <span className="text-2xl mb-2 block">💬</span>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                Chưa có đánh giá nào
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 modal-overlay" onClick={() => setShowPaymentModal(false)} />
          <div className="card p-6 w-full max-w-md relative z-10 fade-in-up">
            <h3 className="font-display font-bold text-lg mb-2" style={{ color: 'var(--text-primary)' }}>
              Mua tài liệu
            </h3>
            <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>
              {doc.title}
            </p>

            <div className="font-display text-2xl font-bold mb-5" style={{ color: 'var(--amber-warm)' }}>
              {formatPrice(doc.price)}
            </div>

            {/* Payment method selection */}
            <div className="space-y-2 mb-5">
              <label className="text-xs font-semibold block mb-2 uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                Hình thức thanh toán
              </label>

              <button
                onClick={() => setPaymentMethod('bank_transfer')}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all border"
                style={{
                  borderColor: paymentMethod === 'bank_transfer' ? 'var(--amber)' : 'var(--border)',
                  background: paymentMethod === 'bank_transfer' ? 'var(--amber-soft)' : 'transparent',
                }}
              >
                <span className="text-lg">🏦</span>
                <div className="flex-1">
                  <div className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                    Chuyển khoản ngân hàng
                  </div>
                  <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    Thanh toán qua tài khoản ngân hàng
                  </div>
                </div>
                <div
                  className="w-5 h-5 rounded-full border-2 flex items-center justify-center"
                  style={{ borderColor: paymentMethod === 'bank_transfer' ? 'var(--amber)' : 'var(--border)' }}
                >
                  {paymentMethod === 'bank_transfer' && (
                    <div className="w-2.5 h-2.5 rounded-full" style={{ background: 'var(--amber)' }} />
                  )}
                </div>
              </button>

              <button
                onClick={() => setPaymentMethod('xp_points')}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all border"
                style={{
                  borderColor: paymentMethod === 'xp_points' ? 'var(--amber)' : 'var(--border)',
                  background: paymentMethod === 'xp_points' ? 'var(--amber-soft)' : 'transparent',
                }}
              >
                <span className="text-lg">⭐</span>
                <div className="flex-1">
                  <div className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                    Điểm XP
                  </div>
                  <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    Số dư hiện tại: <span className="font-semibold" style={{ color: 'var(--amber-warm)' }}>{userXp} XP</span>
                  </div>
                </div>
                <div
                  className="w-5 h-5 rounded-full border-2 flex items-center justify-center"
                  style={{ borderColor: paymentMethod === 'xp_points' ? 'var(--amber)' : 'var(--border)' }}
                >
                  {paymentMethod === 'xp_points' && (
                    <div className="w-2.5 h-2.5 rounded-full" style={{ background: 'var(--amber)' }} />
                  )}
                </div>
              </button>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setShowPaymentModal(false)}
                className="flex-1 py-2.5 rounded-xl text-sm font-medium transition-colors"
                style={{ background: 'var(--border-light)', color: 'var(--text-secondary)' }}
              >
                Hủy
              </button>
              <button
                onClick={confirmPurchase}
                disabled={purchasing}
                className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white transition-colors"
                style={{ background: 'var(--amber)', opacity: purchasing ? 0.7 : 1 }}
              >
                {purchasing ? 'Đang xử lý...' : 'Xác nhận mua'}
              </button>
            </div>
          </div>
        </div>
      )}
    </StudentLayout>
  );
};

export default DocumentDetail;
