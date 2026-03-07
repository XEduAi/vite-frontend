import { useState, useEffect } from 'react';
import axiosClient from '../../api/axiosClient';
import AdminLayout from '../../components/AdminLayout';

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

const pendingStatusLabel = { pending: 'Chờ duyệt', approved: 'Đã duyệt', rejected: 'Đã từ chối' };
const pendingStatusColor = {
  pending: { bg: 'var(--amber-soft)', color: 'var(--amber-warm)' },
  approved: { bg: 'var(--success-light)', color: 'var(--success)' },
  rejected: { bg: 'var(--danger-light)', color: 'var(--danger)' }
};

const TuitionManager = () => {
  const [fees, setFees] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formMode, setFormMode] = useState('single'); // 'single' | 'batch'
  const [message, setMessage] = useState({ type: '', content: '' });
  const [paymentModal, setPaymentModal] = useState(null);
  const [paymentData, setPaymentData] = useState({ amount: '', method: 'cash', note: '' });
  const [activeTab, setActiveTab] = useState('fees'); // 'fees' | 'pending'

  // Pending payments state
  const [pendingPayments, setPendingPayments] = useState([]);
  const [pendingFilter, setPendingFilter] = useState('pending');
  const [reviewModal, setReviewModal] = useState(null);
  const [reviewNote, setReviewNote] = useState('');

  // Filters
  const [filterSemester, setFilterSemester] = useState('');
  const [filterClass, setFilterClass] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [search, setSearch] = useState('');
  const [semesters, setSemesters] = useState([]);
  const [classes, setClasses] = useState([]);
  const [students, setStudents] = useState([]);

  const [formData, setFormData] = useState({
    studentId: '', classId: '', semester: '', schoolYear: '',
    amount: '', discount: '', note: '', dueDate: ''
  });

  useEffect(() => {
    fetchFees();
    fetchSemesters();
    fetchClasses();
    fetchStudents();
    fetchPendingPayments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterSemester, filterClass, filterStatus, activeTab]);

  useEffect(() => {
    if (activeTab === 'pending') {
      fetchPendingPayments();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingFilter]);

  const fetchFees = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filterSemester) params.semester = filterSemester;
      if (filterClass) params.classId = filterClass;
      if (filterStatus) params.status = filterStatus;
      if (search) params.search = search;
      const res = await axiosClient.get('/tuition-fees', { params });
      setFees(res.data.fees || []);
      setStats(res.data.stats || {});
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSemesters = async () => {
    try {
      const res = await axiosClient.get('/tuition-fees/semesters');
      setSemesters(res.data.semesters || []);
    } catch { /* */ }
  };

  const fetchClasses = async () => {
    try {
      const res = await axiosClient.get('/classes');
      setClasses(res.data.classes || []);
    } catch { /* */ }
  };

  const fetchStudents = async () => {
    try {
      const res = await axiosClient.get('/students');
      setStudents(res.data.students || []);
    } catch { /* */ }
  };

  const fetchPendingPayments = async () => {
    try {
      const params = {};
      if (pendingFilter) params.status = pendingFilter;
      const res = await axiosClient.get('/pending-payments', { params });
      setPendingPayments(res.data.pendingPayments || []);
    } catch (err) {
      console.error(err);
    }
  };

  const showMsg = (content, type = 'success') => {
    setMessage({ type, content });
    setTimeout(() => setMessage({ type: '', content: '' }), 4000);
  };

  const resetForm = () => {
    setFormData({ studentId: '', classId: '', semester: '', schoolYear: '', amount: '', discount: '', note: '', dueDate: '' });
    setShowForm(false);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      if (formMode === 'batch') {
        const res = await axiosClient.post('/tuition-fees/batch', {
          classId: formData.classId,
          semester: formData.semester,
          schoolYear: formData.schoolYear,
          amount: Number(formData.amount),
          discount: formData.discount ? Number(formData.discount) : 0,
          dueDate: formData.dueDate || undefined
        });
        showMsg(res.data.message);
      } else {
        await axiosClient.post('/tuition-fees', {
          studentId: formData.studentId,
          classId: formData.classId,
          semester: formData.semester,
          schoolYear: formData.schoolYear,
          amount: Number(formData.amount),
          discount: formData.discount ? Number(formData.discount) : 0,
          note: formData.note,
          dueDate: formData.dueDate || undefined
        });
        showMsg('Tạo phiếu học phí thành công!');
      }
      resetForm();
      fetchFees();
      fetchSemesters();
    } catch (err) {
      showMsg(err.response?.data?.message || 'Lỗi tạo phiếu học phí', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc muốn xóa phiếu học phí này?')) return;
    try {
      await axiosClient.delete(`/tuition-fees/${id}`);
      setFees(fees.filter(f => f._id !== id));
      showMsg('Đã xóa phiếu học phí');
    } catch {
      showMsg('Lỗi khi xóa', 'error');
    }
  };

  const handlePayment = async () => {
    if (!paymentData.amount || Number(paymentData.amount) <= 0) return;
    try {
      const res = await axiosClient.post(`/tuition-fees/${paymentModal._id}/payment`, {
        amount: Number(paymentData.amount),
        method: paymentData.method,
        note: paymentData.note
      });
      setFees(fees.map(f => f._id === paymentModal._id ? res.data.fee : f));
      setPaymentModal(null);
      setPaymentData({ amount: '', method: 'cash', note: '' });
      showMsg('Ghi nhận thanh toán thành công!');
      fetchFees();
    } catch (err) {
      showMsg(err.response?.data?.message || 'Lỗi thanh toán', 'error');
    }
  };

  const handleApprove = async () => {
    try {
      await axiosClient.put(`/pending-payments/${reviewModal._id}/approve`, { note: reviewNote });
      showMsg('Đã duyệt thanh toán!');
      setReviewModal(null);
      setReviewNote('');
      fetchPendingPayments();
      fetchFees();
    } catch (err) {
      showMsg(err.response?.data?.message || 'Lỗi khi duyệt', 'error');
    }
  };

  const handleReject = async () => {
    try {
      await axiosClient.put(`/pending-payments/${reviewModal._id}/reject`, { note: reviewNote });
      showMsg('Đã từ chối thanh toán!');
      setReviewModal(null);
      setReviewNote('');
      fetchPendingPayments();
    } catch (err) {
      showMsg(err.response?.data?.message || 'Lỗi khi từ chối', 'error');
    }
  };

  const handleDeletePending = async (id) => {
    if (!window.confirm('Bạn có chắc muốn xóa yêu cầu này?')) return;
    try {
      await axiosClient.delete(`/pending-payments/${id}`);
      setPendingPayments(pendingPayments.filter(p => p._id !== id));
      showMsg('Đã xóa yêu cầu');
    } catch {
      showMsg('Lỗi khi xóa', 'error');
    }
  };

  const handleSearch = (e) => { e.preventDefault(); fetchFees(); };

  return (
    <AdminLayout>
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6 fade-in">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
            Quản lý Học phí
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
            {stats.total || 0} phiếu học phí · Theo học kỳ
          </p>
        </div>
        <button
          onClick={() => { resetForm(); setShowForm(!showForm); }}
          className={showForm ? 'btn-secondary flex items-center gap-2' : 'btn-primary flex items-center gap-2'}
        >
          {showForm ? '✕ Đóng' : '+ Tạo phiếu học phí'}
        </button>
      </div>

      {/* Stats cards */}
      {!loading && stats.total > 0 && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6 stagger-children">
          <div className="card p-4">
            <div className="text-xs font-medium mb-1" style={{ color: 'var(--text-muted)' }}>Tổng học phí</div>
            <div className="font-display font-bold text-lg" style={{ color: 'var(--text-primary)' }}>{formatVND(stats.totalAmount)}</div>
          </div>
          <div className="card p-4">
            <div className="text-xs font-medium mb-1" style={{ color: 'var(--text-muted)' }}>Đã thu</div>
            <div className="font-display font-bold text-lg" style={{ color: 'var(--success)' }}>{formatVND(stats.totalPaid)}</div>
          </div>
          <div className="card p-4">
            <div className="text-xs font-medium mb-1" style={{ color: 'var(--text-muted)' }}>Còn nợ</div>
            <div className="font-display font-bold text-lg" style={{ color: 'var(--danger)' }}>{formatVND(stats.totalUnpaid)}</div>
          </div>
          <div className="card p-4">
            <div className="text-xs font-medium mb-1" style={{ color: 'var(--text-muted)' }}>Tỷ lệ thu</div>
            <div className="font-display font-bold text-lg" style={{ color: 'var(--amber-warm)' }}>
              {stats.totalAmount > 0 ? Math.round((stats.totalPaid / stats.totalAmount) * 100) : 0}%
            </div>
            <div className="w-full h-1.5 rounded-full mt-2" style={{ background: 'var(--border-light)' }}>
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${stats.totalAmount > 0 ? Math.round((stats.totalPaid / stats.totalAmount) * 100) : 0}%`,
                  background: 'var(--grad-amber)'
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {message.content && (
        <div className={`toast mb-5 ${message.type === 'error' ? 'toast-error' : 'toast-success'}`}>
          {message.type === 'error' ? '⚠' : '✓'} {message.content}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 mb-5">
        <button
          onClick={() => setActiveTab('fees')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'fees' ? '' : ''}`}
          style={{
            background: activeTab === 'fees' ? 'var(--amber-soft)' : 'transparent',
            color: activeTab === 'fees' ? 'var(--amber-warm)' : 'var(--text-muted)',
            border: `1px solid ${activeTab === 'fees' ? 'var(--amber)' : 'var(--border)'}`,
          }}
        >
          Phiếu học phí
        </button>
        <button
          onClick={() => setActiveTab('pending')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'pending' ? '' : ''}`}
          style={{
            background: activeTab === 'pending' ? 'var(--amber-soft)' : 'transparent',
            color: activeTab === 'pending' ? 'var(--amber-warm)' : 'var(--text-muted)',
            border: `1px solid ${activeTab === 'pending' ? 'var(--amber)' : 'var(--border)'}`,
          }}
        >
          Yêu cầu thanh toán
          {pendingPayments.filter(p => p.status === 'pending').length > 0 && (
            <span className="ml-2 px-1.5 py-0.5 rounded-full text-[10px] font-bold" style={{ background: 'var(--danger)', color: 'white' }}>
              {pendingPayments.filter(p => p.status === 'pending').length}
            </span>
          )}
        </button>
      </div>

      {/* Create Form */}
      {showForm && (
        <div className="card p-6 mb-6 fade-in-up">
          {/* Mode tabs */}
          <div className="flex gap-2 mb-5">
            <button
              onClick={() => setFormMode('single')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${formMode === 'single' ? '' : ''}`}
              style={{
                background: formMode === 'single' ? 'var(--amber-soft)' : 'transparent',
                color: formMode === 'single' ? 'var(--amber-warm)' : 'var(--text-muted)',
                border: `1px solid ${formMode === 'single' ? 'var(--amber)' : 'var(--border)'}`,
              }}
            >
              Tạo cho 1 học viên
            </button>
            <button
              onClick={() => setFormMode('batch')}
              className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
              style={{
                background: formMode === 'batch' ? 'var(--amber-soft)' : 'transparent',
                color: formMode === 'batch' ? 'var(--amber-warm)' : 'var(--text-muted)',
                border: `1px solid ${formMode === 'batch' ? 'var(--amber)' : 'var(--border)'}`,
              }}
            >
              Tạo cho cả lớp
            </button>
          </div>

          <form onSubmit={handleCreate} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {formMode === 'single' && (
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Học viên *</label>
                <select value={formData.studentId} onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                  className="input" required>
                  <option value="">-- Chọn học viên --</option>
                  {students.map(s => (
                    <option key={s._id} value={s._id}>{s.fullName} ({s.username}) - Lớp {s.grade || '?'}</option>
                  ))}
                </select>
              </div>
            )}
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Lớp học *</label>
              <select value={formData.classId} onChange={(e) => setFormData({ ...formData, classId: e.target.value })}
                className="input" required>
                <option value="">-- Chọn lớp --</option>
                {classes.map(c => (
                  <option key={c._id} value={c._id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Học kỳ *</label>
              <input type="text" placeholder="VD: HK1 2025-2026" value={formData.semester}
                onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                className="input" required />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Năm học *</label>
              <input type="text" placeholder="VD: 2025-2026" value={formData.schoolYear}
                onChange={(e) => setFormData({ ...formData, schoolYear: e.target.value })}
                className="input" required />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Số tiền (VNĐ) *</label>
              <input type="number" placeholder="VD: 3000000" value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                className="input" required min="0" />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Giảm giá (VNĐ)</label>
              <input type="number" placeholder="0" value={formData.discount}
                onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
                className="input" min="0" />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Hạn đóng</label>
              <input type="date" value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                className="input" />
            </div>
            {formMode === 'single' && (
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Ghi chú</label>
                <input type="text" value={formData.note}
                  onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                  className="input" />
              </div>
            )}
            <div className="sm:col-span-2">
              <button type="submit" className="btn-primary">
                {formMode === 'batch' ? 'Tạo cho cả lớp' : 'Tạo phiếu học phí'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Fees Tab */}
      {activeTab === 'fees' && (
        <>
          {/* Filters */}
          <div className="card p-4 mb-5">
            <form onSubmit={handleSearch} className="flex flex-wrap items-end gap-3">
              <div className="flex-1 min-w-[180px]">
                <label className="block text-[11px] font-medium mb-1" style={{ color: 'var(--text-muted)' }}>Tìm kiếm</label>
                <input type="text" placeholder="Tên học viên..." value={search}
                  onChange={(e) => setSearch(e.target.value)} className="input" />
              </div>
              <div>
                <label className="block text-[11px] font-medium mb-1" style={{ color: 'var(--text-muted)' }}>Học kỳ</label>
                <select value={filterSemester} onChange={(e) => setFilterSemester(e.target.value)} className="input">
                  <option value="">Tất cả</option>
                  {semesters.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-medium mb-1" style={{ color: 'var(--text-muted)' }}>Lớp</label>
                <select value={filterClass} onChange={(e) => setFilterClass(e.target.value)} className="input">
                  <option value="">Tất cả</option>
                  {classes.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-medium mb-1" style={{ color: 'var(--text-muted)' }}>Trạng thái</label>
                <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="input">
                  <option value="">Tất cả</option>
                  <option value="unpaid">Chưa đóng</option>
                  <option value="partial">Đóng 1 phần</option>
                  <option value="paid">Đã đóng</option>
                </select>
              </div>
              <button type="submit" className="btn-secondary py-2.5 px-4">Lọc</button>
            </form>
          </div>

          {/* Table */}
          {loading ? (
            <div className="py-20 text-center">
              <div className="inline-flex items-center gap-3 px-5 py-3 rounded-2xl card">
                <svg className="animate-spin w-5 h-5" style={{ color: 'var(--amber)' }} viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Đang tải...</span>
              </div>
            </div>
          ) : fees.length === 0 ? (
            <div className="card p-12 text-center fade-in-up">
              <div className="w-16 h-16 mx-auto rounded-2xl flex items-center justify-center mb-4" style={{ background: 'var(--amber-soft)' }}>
                <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7" style={{ color: 'var(--amber)' }}>
                  <path d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <h3 className="font-display font-bold text-lg" style={{ color: 'var(--text-primary)' }}>Chưa có phiếu học phí</h3>
              <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Tạo phiếu học phí cho học viên để bắt đầu theo dõi</p>
            </div>
          ) : (
            <div className="card overflow-hidden fade-in-up">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr style={{ background: 'rgba(15,23,42,0.02)', borderBottom: '1px solid var(--border-light)' }}>
                      <th className="text-left px-4 py-3 font-semibold text-xs" style={{ color: 'var(--text-muted)' }}>Học viên</th>
                      <th className="text-left px-4 py-3 font-semibold text-xs" style={{ color: 'var(--text-muted)' }}>Lớp</th>
                      <th className="text-left px-4 py-3 font-semibold text-xs" style={{ color: 'var(--text-muted)' }}>Học kỳ</th>
                      <th className="text-right px-4 py-3 font-semibold text-xs" style={{ color: 'var(--text-muted)' }}>Học phí</th>
                      <th className="text-right px-4 py-3 font-semibold text-xs" style={{ color: 'var(--text-muted)' }}>Đã đóng</th>
                      <th className="text-right px-4 py-3 font-semibold text-xs" style={{ color: 'var(--text-muted)' }}>Còn lại</th>
                      <th className="text-center px-4 py-3 font-semibold text-xs" style={{ color: 'var(--text-muted)' }}>Trạng thái</th>
                      <th className="text-center px-4 py-3 font-semibold text-xs" style={{ color: 'var(--text-muted)' }}>Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {fees.map((fee) => (
                      <tr key={fee._id} className="border-t" style={{ borderColor: 'var(--border-light)' }}>
                        <td className="px-4 py-3">
                          <div className="font-medium" style={{ color: 'var(--text-primary)' }}>
                            {fee.student?.fullName || '—'}
                          </div>
                          <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                            {fee.student?.username} {fee.student?.grade ? `• Lớp ${fee.student.grade}` : ''}
                          </div>
                        </td>
                        <td className="px-4 py-3" style={{ color: 'var(--text-secondary)' }}>{fee.class?.name || '—'}</td>
                        <td className="px-4 py-3" style={{ color: 'var(--text-secondary)' }}>
                          <div>{fee.semester}</div>
                          {fee.dueDate && (
                            <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                              HSD: {new Date(fee.dueDate).toLocaleDateString('vi-VN')}
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right font-medium" style={{ color: 'var(--text-primary)' }}>
                          {formatVND(fee.finalAmount)}
                          {fee.discount > 0 && (
                            <div className="text-xs" style={{ color: 'var(--success)' }}>-{formatVND(fee.discount)}</div>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right font-medium" style={{ color: 'var(--success)' }}>
                          {formatVND(fee.paidAmount)}
                        </td>
                        <td className="px-4 py-3 text-right font-medium" style={{ color: fee.finalAmount - fee.paidAmount > 0 ? 'var(--danger)' : 'var(--success)' }}>
                          {formatVND(fee.finalAmount - fee.paidAmount)}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span
                            className="inline-block px-2.5 py-1 rounded-full text-[11px] font-semibold"
                            style={{
                              background: statusColor[fee.status]?.bg,
                              color: statusColor[fee.status]?.color
                            }}
                          >
                            {statusLabel[fee.status]}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <div className="flex items-center justify-center gap-1">
                            {fee.status !== 'paid' && (
                              <button
                                onClick={() => {
                                  setPaymentModal(fee);
                                  setPaymentData({ amount: String(fee.finalAmount - fee.paidAmount), method: 'cash', note: '' });
                                }}
                                className="px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors"
                                style={{ background: 'var(--success-light)', color: 'var(--success)' }}
                                title="Ghi nhận thanh toán"
                              >
                                💰 Thu
                              </button>
                            )}
                            <button
                              onClick={() => handleDelete(fee._id)}
                              className="px-2 py-1.5 rounded-lg text-xs font-medium transition-colors"
                              style={{ background: 'var(--danger-light)', color: 'var(--danger)' }}
                              title="Xóa"
                            >
                              🗑
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {/* Pending Payments Tab */}
      {activeTab === 'pending' && (
        <>
          {/* Filter */}
          <div className="card p-4 mb-5">
            <div className="flex items-center gap-3">
              <label className="text-[11px] font-medium" style={{ color: 'var(--text-muted)' }}>Lọc theo trạng thái:</label>
              <select value={pendingFilter} onChange={(e) => setPendingFilter(e.target.value)} className="input">
                <option value="pending">Chờ duyệt</option>
                <option value="approved">Đã duyệt</option>
                <option value="rejected">Đã từ chối</option>
              </select>
            </div>
          </div>

          {/* Pending Payments List */}
          {pendingPayments.length === 0 ? (
            <div className="card p-12 text-center fade-in-up">
              <div className="w-16 h-16 mx-auto rounded-2xl flex items-center justify-center mb-4" style={{ background: 'var(--amber-soft)' }}>
                <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7" style={{ color: 'var(--amber)' }}>
                  <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <h3 className="font-display font-bold text-lg" style={{ color: 'var(--text-primary)' }}>Không có yêu cầu nào</h3>
              <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Chưa có yêu cầu thanh toán nào</p>
            </div>
          ) : (
            <div className="space-y-3 fade-in-up">
              {pendingPayments.map((pp) => (
                <div key={pp._id} className="card p-4">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
                          {pp.student?.fullName || '—'}
                        </span>
                        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                          ({pp.student?.username})
                        </span>
                        <span
                          className="px-2 py-0.5 rounded-full text-[10px] font-semibold"
                          style={{
                            background: pendingStatusColor[pp.status]?.bg,
                            color: pendingStatusColor[pp.status]?.color
                          }}
                        >
                          {pendingStatusLabel[pp.status]}
                        </span>
                      </div>
                      <div className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>
                        {pp.tuitionFee?.semester} · {pp.tuitionFee?.schoolYear} · {pp.tuitionFee?.class?.name}
                      </div>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="font-medium" style={{ color: 'var(--text-primary)' }}>
                          {formatVND(pp.amount)}
                        </span>
                        <span style={{ color: 'var(--text-muted)' }}>
                          {pp.method === 'transfer' ? 'Chuyển khoản' : pp.method === 'cash' ? 'Tiền mặt' : 'Khác'}
                        </span>
                        {pp.transactionRef && (
                          <span style={{ color: 'var(--text-muted)' }}>
                            Mã GD: {pp.transactionRef}
                          </span>
                        )}
                      </div>
                      <div className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                        Gửi lúc: {new Date(pp.submittedAt).toLocaleString('vi-VN')}
                      </div>
                      {pp.adminNote && (
                        <div className="text-xs mt-2 px-2 py-1 rounded" style={{ background: 'var(--border-light)', color: 'var(--text-secondary)' }}>
                          Ghi chú: {pp.adminNote}
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2">
                      {pp.status === 'pending' && (
                        <>
                          <button
                            onClick={() => { setReviewModal(pp); setReviewNote(''); }}
                            className="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                            style={{ background: 'var(--success-light)', color: 'var(--success)' }}
                            title="Duyệt"
                          >
                            ✓ Duyệt
                          </button>
                          <button
                            onClick={() => { setReviewModal(pp); setReviewNote(''); }}
                            className="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                            style={{ background: 'var(--danger-light)', color: 'var(--danger)' }}
                            title="Từ chối"
                          >
                            ✕ Từ chối
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => handleDeletePending(pp._id)}
                        className="px-2 py-1.5 rounded-lg text-xs font-medium transition-colors"
                        style={{ background: 'var(--border-light)', color: 'var(--text-muted)' }}
                        title="Xóa"
                      >
                        🗑
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Payment Modal */}
      {paymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 modal-overlay" onClick={() => setPaymentModal(null)} />
          <div className="card p-6 w-full max-w-md relative z-10 fade-in-up">
            <h3 className="font-display font-bold text-lg mb-1" style={{ color: 'var(--text-primary)' }}>
              Ghi nhận thanh toán
            </h3>
            <p className="text-sm mb-5" style={{ color: 'var(--text-muted)' }}>
              {paymentModal.student?.fullName} — {paymentModal.class?.name} — {paymentModal.semester}
            </p>
            <div className="space-y-3 mb-5 text-sm" style={{ color: 'var(--text-secondary)' }}>
              <div className="flex justify-between">
                <span>Tổng học phí:</span>
                <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{formatVND(paymentModal.finalAmount)}</span>
              </div>
              <div className="flex justify-between">
                <span>Đã đóng:</span>
                <span className="font-medium" style={{ color: 'var(--success)' }}>{formatVND(paymentModal.paidAmount)}</span>
              </div>
              <div className="flex justify-between font-medium" style={{ color: 'var(--danger)' }}>
                <span>Còn lại:</span>
                <span>{formatVND(paymentModal.finalAmount - paymentModal.paidAmount)}</span>
              </div>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Số tiền thanh toán (VNĐ) *</label>
                <input type="number" value={paymentData.amount}
                  onChange={(e) => setPaymentData({ ...paymentData, amount: e.target.value })}
                  className="input" required min="1" />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Phương thức</label>
                <select value={paymentData.method} onChange={(e) => setPaymentData({ ...paymentData, method: e.target.value })} className="input">
                  <option value="cash">Tiền mặt</option>
                  <option value="transfer">Chuyển khoản</option>
                  <option value="other">Khác</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Ghi chú</label>
                <input type="text" value={paymentData.note}
                  onChange={(e) => setPaymentData({ ...paymentData, note: e.target.value })}
                  className="input" placeholder="VD: Đóng ngày 15/3" />
              </div>
            </div>
            <div className="flex gap-2 mt-5">
              <button onClick={() => setPaymentModal(null)} className="btn-secondary flex-1">Hủy</button>
              <button onClick={handlePayment} className="btn-primary flex-1">Xác nhận thanh toán</button>
            </div>
          </div>
        </div>
      )}

      {/* Review Modal */}
      {reviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 modal-overlay" onClick={() => setReviewModal(null)} />
          <div className="card p-6 w-full max-w-md relative z-10 fade-in-up">
            <h3 className="font-display font-bold text-lg mb-4" style={{ color: 'var(--text-primary)' }}>
              Xem xét yêu cầu thanh toán
            </h3>
            <div className="space-y-3 mb-4 text-sm">
              <div className="flex justify-between">
                <span style={{ color: 'var(--text-muted)' }}>Học viên:</span>
                <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{reviewModal.student?.fullName}</span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: 'var(--text-muted)' }}>Số tiền:</span>
                <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{formatVND(reviewModal.amount)}</span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: 'var(--text-muted)' }}>Học kỳ:</span>
                <span style={{ color: 'var(--text-secondary)' }}>{reviewModal.tuitionFee?.semester}</span>
              </div>
              {reviewModal.transactionRef && (
                <div className="flex justify-between">
                  <span style={{ color: 'var(--text-muted)' }}>Mã GD:</span>
                  <span style={{ color: 'var(--text-secondary)' }}>{reviewModal.transactionRef}</span>
                </div>
              )}
            </div>
            <div className="mb-4">
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Ghi chú (tùy chọn)</label>
              <textarea
                value={reviewNote}
                onChange={(e) => setReviewNote(e.target.value)}
                className="input"
                rows="2"
                placeholder="Lý do duyệt/từ chối..."
              />
            </div>
            <div className="flex gap-2">
              <button onClick={() => setReviewModal(null)} className="btn-secondary flex-1">Hủy</button>
              <button onClick={handleReject} className="btn-danger flex-1">Từ chối</button>
              <button onClick={handleApprove} className="btn-success flex-1">Duyệt</button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default TuitionManager;
