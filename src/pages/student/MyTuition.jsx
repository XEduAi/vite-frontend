import { useState } from 'react';
import StudentLayout from '../../components/StudentLayout';
import {
  useMyTuitionQuery,
  usePendingPaymentsQuery,
  useSubmitPendingPaymentMutation,
  useTuitionQrMutation,
} from '../../features/tuition/hooks';

const formatVND = (v) => {
  if (!v && v !== 0) return '0đ';
  return v.toLocaleString('vi-VN') + 'đ';
};

const statusLabel = { unpaid: 'Chưa đóng', partial: 'Đóng 1 phần', paid: 'Đã đóng' };
const statusColor = {
  unpaid: { bg: 'var(--danger-light)', color: 'var(--danger)' },
  partial: { bg: '#fef3c7', color: '#d97706' },
  paid: { bg: 'var(--success-light)', color: 'var(--success)' }
};
const statusIcon = {
  unpaid: '⏳',
  partial: '💳',
  paid: '✅'
};

const MyTuition = () => {
  const [expandedFee, setExpandedFee] = useState(null);
  const [showQRModal, setShowQRModal] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(null);
  const [qrData, setQrData] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [transactionRef, setTransactionRef] = useState('');
  const [message, setMessage] = useState({ type: '', content: '' });
  const tuitionQuery = useMyTuitionQuery();
  const pendingPaymentsQuery = usePendingPaymentsQuery();
  const tuitionQrMutation = useTuitionQrMutation();
  const submitPendingPaymentMutation = useSubmitPendingPaymentMutation();

  const fees = tuitionQuery.data?.fees || [];
  const stats = tuitionQuery.data?.stats || {};
  const loading = tuitionQuery.isPending;
  const pendingPayments = pendingPaymentsQuery.data || [];

  const showMsg = (content, type = 'success') => {
    setMessage({ type, content });
    setTimeout(() => setMessage({ type: '', content: '' }), 4000);
  };

  const handleShowQR = async (fee) => {
    try {
      const remainingAmount = fee.finalAmount - fee.paidAmount;
      const data = await tuitionQrMutation.mutateAsync({
        feeId: fee._id,
        amount: remainingAmount,
      });
      setQrData(data);
      setShowQRModal(fee);
      setPaymentAmount(String(remainingAmount));
    } catch {
      showMsg('Không thể tạo mã QR', 'error');
    }
  };

  const handleConfirmPayment = async () => {
    if (!paymentAmount || Number(paymentAmount) <= 0) {
      showMsg('Vui lòng nhập số tiền', 'error');
      return;
    }
    try {
      await submitPendingPaymentMutation.mutateAsync({
        tuitionFeeId: qrData.feeId,
        amount: Number(paymentAmount),
        transactionRef
      });
      showMsg('Đã gửi xác nhận thanh toán!');
      setShowQRModal(null);
      setShowConfirmModal(null);
      setTransactionRef('');
    } catch (err) {
      showMsg(err.response?.data?.message || 'Lỗi khi gửi xác nhận', 'error');
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
            <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Đang tải học phí...</span>
          </div>
        </div>
      </StudentLayout>
    );
  }

  return (
    <StudentLayout>
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-6 fade-in">
          <h1 className="font-display text-2xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
            Học phí của tôi
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
            Theo dõi tình trạng đóng học phí theo từng học kỳ
          </p>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-3 gap-3 mb-6 stagger-children">
          <div className="card p-4 text-center">
            <div className="text-xs font-medium mb-1" style={{ color: 'var(--text-muted)' }}>Tổng học phí</div>
            <div className="font-display font-bold text-lg" style={{ color: 'var(--text-primary)' }}>
              {formatVND(stats.totalAmount)}
            </div>
          </div>
          <div className="card p-4 text-center">
            <div className="text-xs font-medium mb-1" style={{ color: 'var(--text-muted)' }}>Đã đóng</div>
            <div className="font-display font-bold text-lg" style={{ color: 'var(--success)' }}>
              {formatVND(stats.totalPaid)}
            </div>
          </div>
          <div className="card p-4 text-center">
            <div className="text-xs font-medium mb-1" style={{ color: 'var(--text-muted)' }}>Còn nợ</div>
            <div className="font-display font-bold text-lg" style={{ color: stats.totalUnpaid > 0 ? 'var(--danger)' : 'var(--success)' }}>
              {formatVND(stats.totalUnpaid)}
            </div>
          </div>
        </div>

        {/* Pending payments */}
        {pendingPayments.length > 0 && (
          <div className="card p-4 mb-6 fade-in-up">
            <div className="text-xs font-semibold mb-3" style={{ color: 'var(--text-muted)' }}>
              Yêu cầu thanh toán đang chờ duyệt ({pendingPayments.length})
            </div>
            <div className="space-y-2">
              {pendingPayments.map((pp) => (
                <div key={pp._id} className="flex items-center justify-between px-3 py-2 rounded-lg text-xs" style={{
                  background: pp.status === 'approved' ? 'rgba(16,185,129,0.04)' :
                           pp.status === 'rejected' ? 'rgba(239,68,68,0.04)' :
                           'rgba(245,158,11,0.04)'
                }}>
                  <div className="flex-1">
                    <span className="font-medium" style={{ color: 'var(--text-primary)' }}>
                      {formatVND(pp.amount)}
                    </span>
                    <span className="ml-2" style={{ color: 'var(--text-muted)' }}>
                      — {pp.tuitionFee?.semester}
                    </span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full font-semibold" style={{
                    background: pp.status === 'approved' ? 'var(--success-light)' :
                             pp.status === 'rejected' ? 'var(--danger-light)' :
                             'var(--amber-soft)',
                    color: pp.status === 'approved' ? 'var(--success)' :
                           pp.status === 'rejected' ? 'var(--danger)' :
                           'var(--amber-warm)'
                  }}>
                    {pp.status === 'approved' ? 'Đã duyệt' : pp.status === 'rejected' ? 'Đã từ chối' : 'Chờ duyệt'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Toast */}
        {message.content && (
          <div className={`toast mb-5 ${message.type === 'error' ? 'toast-error' : 'toast-success'}`}>
            {message.type === 'error' ? '⚠' : '✓'} {message.content}
          </div>
        )}

        {/* Fee list */}
        {fees.length === 0 ? (
          <div className="card p-12 text-center fade-in-up">
            <div className="w-16 h-16 mx-auto rounded-2xl flex items-center justify-center mb-4" style={{ background: 'var(--amber-soft)' }}>
              <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7" style={{ color: 'var(--amber)' }}>
                <path d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <h3 className="font-display font-bold text-lg" style={{ color: 'var(--text-primary)' }}>Chưa có học phí</h3>
            <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Học phí sẽ được hiển thị khi giáo viên tạo phiếu</p>
          </div>
        ) : (
          <div className="space-y-3 stagger-children">
            {fees.map((fee) => (
              <div key={fee._id} className="card overflow-hidden">
                <button
                  onClick={() => setExpandedFee(expandedFee === fee._id ? null : fee._id)}
                  className="w-full p-4 flex items-center gap-4 text-left transition-colors hover:bg-black/[0.01]"
                >
                  {/* Status icon */}
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
                    style={{ background: statusColor[fee.status]?.bg }}
                  >
                    {statusIcon[fee.status]}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm truncate" style={{ color: 'var(--text-primary)' }}>
                        {fee.class?.name || 'Lớp học'}
                      </span>
                      <span
                        className="inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold flex-shrink-0"
                        style={{ background: statusColor[fee.status]?.bg, color: statusColor[fee.status]?.color }}
                      >
                        {statusLabel[fee.status]}
                      </span>
                    </div>
                    <div className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                      {fee.semester} · {fee.schoolYear}
                    </div>
                  </div>

                  {/* Amount */}
                  <div className="text-right flex-shrink-0">
                    <div className="font-display font-bold text-sm" style={{ color: 'var(--text-primary)' }}>
                      {formatVND(fee.finalAmount)}
                    </div>
                    {fee.status !== 'paid' && fee.finalAmount - fee.paidAmount > 0 && (
                      <div className="text-xs" style={{ color: 'var(--danger)' }}>
                        Nợ: {formatVND(fee.finalAmount - fee.paidAmount)}
                      </div>
                    )}
                  </div>

                  {/* Chevron */}
                  <svg
                    viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 flex-shrink-0 transition-transform"
                    style={{
                      color: 'var(--text-muted)',
                      transform: expandedFee === fee._id ? 'rotate(180deg)' : 'rotate(0deg)'
                    }}
                  >
                    <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
                  </svg>
                </button>

                {/* Expanded details */}
                {expandedFee === fee._id && (
                  <div className="px-4 pb-4 pt-0 border-t" style={{ borderColor: 'var(--border-light)' }}>
                    <div className="grid grid-cols-2 gap-3 py-3 text-sm">
                      <div>
                        <div className="text-xs" style={{ color: 'var(--text-muted)' }}>Học phí gốc</div>
                        <div className="font-medium" style={{ color: 'var(--text-primary)' }}>{formatVND(fee.amount)}</div>
                      </div>
                      {fee.discount > 0 && (
                        <div>
                          <div className="text-xs" style={{ color: 'var(--text-muted)' }}>Giảm giá</div>
                          <div className="font-medium" style={{ color: 'var(--success)' }}>-{formatVND(fee.discount)}</div>
                        </div>
                      )}
                      <div>
                        <div className="text-xs" style={{ color: 'var(--text-muted)' }}>Đã thanh toán</div>
                        <div className="font-medium" style={{ color: 'var(--success)' }}>{formatVND(fee.paidAmount)}</div>
                      </div>
                      {fee.dueDate && (
                        <div>
                          <div className="text-xs" style={{ color: 'var(--text-muted)' }}>Hạn đóng</div>
                          <div className="font-medium" style={{ color: new Date(fee.dueDate) < new Date() && fee.status !== 'paid' ? 'var(--danger)' : 'var(--text-primary)' }}>
                            {new Date(fee.dueDate).toLocaleDateString('vi-VN')}
                            {new Date(fee.dueDate) < new Date() && fee.status !== 'paid' && ' (Quá hạn)'}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Payment history */}
                    {fee.payments && fee.payments.length > 0 && (
                      <div className="mt-2">
                        <div className="text-xs font-semibold mb-2" style={{ color: 'var(--text-muted)' }}>Lịch sử thanh toán</div>
                        <div className="space-y-1.5">
                          {fee.payments.map((p, i) => (
                            <div key={i} className="flex items-center justify-between px-3 py-2 rounded-lg text-xs" style={{ background: 'rgba(16,185,129,0.04)' }}>
                              <div>
                                <span className="font-medium" style={{ color: 'var(--success)' }}>+{formatVND(p.amount)}</span>
                                <span className="ml-2" style={{ color: 'var(--text-muted)' }}>
                                  {p.method === 'cash' ? 'Tiền mặt' : p.method === 'transfer' ? 'CK' : 'Khác'}
                                </span>
                                {p.note && <span className="ml-2" style={{ color: 'var(--text-muted)' }}>— {p.note}</span>}
                              </div>
                              <span style={{ color: 'var(--text-muted)' }}>
                                {new Date(p.paidAt).toLocaleDateString('vi-VN')}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Pay button */}
                    {fee.status !== 'paid' && fee.finalAmount - fee.paidAmount > 0 && (
                      <div className="mt-3">
                        <button
                          onClick={() => handleShowQR(fee)}
                          className="w-full py-2.5 rounded-lg text-sm font-medium transition-colors"
                          style={{ background: 'var(--amber)', color: 'white' }}
                        >
                          💳 Thanh toán qua QR Code
                        </button>
                      </div>
                    )}

                    {fee.note && (
                      <div className="mt-3 text-xs" style={{ color: 'var(--text-muted)' }}>
                        📝 {fee.note}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* QR Code Modal */}
      {showQRModal && qrData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 modal-overlay" onClick={() => setShowQRModal(null)} />
          <div className="card p-6 w-full max-w-md relative z-10 fade-in-up">
            <h3 className="font-display font-bold text-lg mb-4" style={{ color: 'var(--text-primary)' }}>
              Thanh toán học phí
            </h3>
            <div className="text-center mb-4">
              <img
                src={qrData.qrCode}
                alt="QR Code thanh toán"
                className="w-48 h-48 mx-auto rounded-lg"
              />
              <p className="text-xs mt-3" style={{ color: 'var(--text-muted)' }}>
                Quét mã QR để thanh toán qua Vietcombank
              </p>
              <p className="text-sm font-medium mt-1" style={{ color: 'var(--text-primary)' }}>
                {formatVND(qrData.amount)}
              </p>
            </div>
            <div className="space-y-3 mb-4">
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                  Số tiền thanh toán (VNĐ)
                </label>
                <input
                  type="number"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  className="input"
                  min="1"
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                  Mã giao dịch (tùy chọn)
                </label>
                <input
                  type="text"
                  value={transactionRef}
                  onChange={(e) => setTransactionRef(e.target.value)}
                  className="input"
                  placeholder="VD: 123456789"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowQRModal(null)}
                className="flex-1 py-2.5 rounded-lg text-sm font-medium transition-colors"
                style={{ background: 'var(--border-light)', color: 'var(--text-secondary)' }}
              >
                Đóng
              </button>
              <button
                onClick={() => setShowConfirmModal(true)}
                className="flex-1 py-2.5 rounded-lg text-sm font-medium transition-colors"
                style={{ background: 'var(--amber)', color: 'white' }}
              >
                Xác nhận đã thanh toán
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Payment Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 modal-overlay" onClick={() => setShowConfirmModal(false)} />
          <div className="card p-6 w-full max-w-md relative z-10 fade-in-up">
            <h3 className="font-display font-bold text-lg mb-2" style={{ color: 'var(--text-primary)' }}>
              Xác nhận thanh toán
            </h3>
            <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>
              Bạn đã chuyển {formatVND(Number(paymentAmount))} qua Vietcombank?
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 py-2.5 rounded-lg text-sm font-medium transition-colors"
                style={{ background: 'var(--border-light)', color: 'var(--text-secondary)' }}
              >
                Chưa
              </button>
              <button
                onClick={handleConfirmPayment}
                disabled={submitPendingPaymentMutation.isPending}
                className="flex-1 py-2.5 rounded-lg text-sm font-medium transition-colors"
                style={{ background: 'var(--success)', color: 'white' }}
              >
                {submitPendingPaymentMutation.isPending ? 'Đang gửi...' : 'Đã chuyển'}
              </button>
            </div>
          </div>
        </div>
      )}
    </StudentLayout>
  );
};

export default MyTuition;
