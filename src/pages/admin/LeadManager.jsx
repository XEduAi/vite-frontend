import { useMemo, useState } from 'react';
import { getApiErrorMessage } from '../../api/errors';
import AdminLayout from '../../components/AdminLayout';
import AdminQueryErrors from '../../components/AdminQueryErrors';
import AdminToast from '../../components/AdminToast';
import { useAdminLeadsQuery, useUpdateLeadStatusMutation } from '../../features/leads/hooks';

const STATUS_OPTIONS = [
  { value: '', label: 'Tất cả' },
  { value: 'new', label: 'Mới' },
  { value: 'contacted', label: 'Đã liên hệ' },
  { value: 'enrolled', label: 'Đã nhập học' },
  { value: 'cancelled', label: 'Hủy' },
];

const STATUS_LABELS = {
  new: 'Mới',
  contacted: 'Đã liên hệ',
  enrolled: 'Đã nhập học',
  cancelled: 'Hủy',
};

const STATUS_BADGES = {
  new: 'badge-blue',
  contacted: 'badge-amber',
  enrolled: 'badge-green',
  cancelled: 'badge-red',
};

const LeadManager = () => {
  const [message, setMessage] = useState({ type: '', content: '' });
  const [filterStatus, setFilterStatus] = useState('');
  const [page, setPage] = useState(1);
  const [editingLead, setEditingLead] = useState(null);
  const [editStatus, setEditStatus] = useState('new');
  const [editNotes, setEditNotes] = useState('');

  const leadsQuery = useAdminLeadsQuery({
    status: filterStatus,
    page,
    limit: 20,
  });
  const updateLeadStatusMutation = useUpdateLeadStatusMutation();

  const leads = leadsQuery.data?.leads || [];
  const pagination = leadsQuery.data?.pagination || { page: 1, limit: 20, total: 0, totalPages: 1 };
  const loading = leadsQuery.isPending;

  const summary = useMemo(() => (
    leads.reduce((accumulator, lead) => {
      accumulator.total += 1;
      accumulator[lead.status] = (accumulator[lead.status] || 0) + 1;
      return accumulator;
    }, { total: 0, new: 0, contacted: 0, enrolled: 0, cancelled: 0 })
  ), [leads]);

  const showMessage = (content, type = 'success') => {
    setMessage({ type, content });
    setTimeout(() => setMessage({ type: '', content: '' }), 4000);
  };

  const openEditModal = (lead) => {
    setEditingLead(lead);
    setEditStatus(lead.status || 'new');
    setEditNotes(lead.notes || '');
  };

  const handleSaveLead = async () => {
    if (!editingLead) {
      return;
    }

    try {
      await updateLeadStatusMutation.mutateAsync({
        leadId: editingLead._id,
        payload: {
          status: editStatus,
          notes: editNotes,
        },
      });

      setEditingLead(null);
      showMessage('Đã cập nhật trạng thái lead');
    } catch (error) {
      showMessage(getApiErrorMessage(error, 'Lỗi khi cập nhật lead'), 'error');
    }
  };

  const queryErrors = leadsQuery.isError
    ? [{
        key: 'leads',
        message: getApiErrorMessage(leadsQuery.error, 'Không thể tải danh sách lead'),
        onRetry: () => leadsQuery.refetch(),
      }]
    : [];

  return (
    <AdminLayout>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6 fade-in">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
            Lead Đăng ký
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
            {pagination.total || 0} đăng ký từ landing page
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <div className="card p-4">
          <div className="text-xs font-medium mb-1" style={{ color: 'var(--text-muted)' }}>Tổng lead</div>
          <div className="font-display font-bold text-lg" style={{ color: 'var(--text-primary)' }}>{pagination.total || 0}</div>
        </div>
        <div className="card p-4">
          <div className="text-xs font-medium mb-1" style={{ color: 'var(--text-muted)' }}>Mới trên trang</div>
          <div className="font-display font-bold text-lg" style={{ color: 'var(--info)' }}>{summary.new}</div>
        </div>
        <div className="card p-4">
          <div className="text-xs font-medium mb-1" style={{ color: 'var(--text-muted)' }}>Liên hệ trên trang</div>
          <div className="font-display font-bold text-lg" style={{ color: 'var(--amber-warm)' }}>{summary.contacted}</div>
        </div>
        <div className="card p-4">
          <div className="text-xs font-medium mb-1" style={{ color: 'var(--text-muted)' }}>Nhập học trên trang</div>
          <div className="font-display font-bold text-lg" style={{ color: 'var(--success)' }}>{summary.enrolled}</div>
        </div>
      </div>

      <AdminToast message={message.content} type={message.type} />
      <AdminQueryErrors errors={queryErrors} />

      <div className="card p-4 mb-4">
        <div className="flex flex-wrap gap-3 items-end">
          <div>
            <label className="block text-xs mb-1.5" style={{ color: 'var(--text-muted)' }}>Trạng thái</label>
            <select
              value={filterStatus}
              onChange={(e) => {
                setFilterStatus(e.target.value);
                setPage(1);
              }}
              className="input w-44"
            >
              {STATUS_OPTIONS.map((option) => (
                <option key={option.value || 'all'} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="card overflow-hidden">
        {loading ? (
          <div className="py-12 text-center text-sm" style={{ color: 'var(--text-muted)' }}>Đang tải...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr style={{ background: 'var(--cream)', borderBottom: '1px solid var(--border-light)' }}>
                  {['Học viên', 'Lớp', 'Liên hệ', 'Mục tiêu', 'Trạng thái', 'Ngày tạo', 'Thao tác'].map((header) => (
                    <th key={header} className="px-5 py-3 text-left text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>
                      {header.toUpperCase()}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {leads.map((lead) => (
                  <tr key={lead._id} className="table-row border-b" style={{ borderColor: 'var(--border-light)' }}>
                    <td className="px-5 py-3.5">
                      <div className="font-medium" style={{ color: 'var(--text-primary)' }}>{lead.name}</div>
                      <div className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{lead.source || 'landing-page'}</div>
                    </td>
                    <td className="px-5 py-3.5" style={{ color: 'var(--text-secondary)' }}>{lead.grade}</td>
                    <td className="px-5 py-3.5">
                      <div className="font-medium" style={{ color: 'var(--text-primary)' }}>{lead.phone}</div>
                    </td>
                    <td className="px-5 py-3.5 max-w-xs">
                      <div className="line-clamp-2" style={{ color: 'var(--text-secondary)' }}>
                        {lead.goal || 'Chưa có mục tiêu'}
                      </div>
                      {lead.notes && (
                        <div className="text-xs mt-1 line-clamp-2" style={{ color: 'var(--text-muted)' }}>
                          Ghi chú: {lead.notes}
                        </div>
                      )}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`badge ${STATUS_BADGES[lead.status] || 'badge-gray'}`}>
                        {STATUS_LABELS[lead.status] || lead.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-sm" style={{ color: 'var(--text-muted)' }}>
                      {new Date(lead.createdAt).toLocaleString('vi-VN')}
                    </td>
                    <td className="px-5 py-3.5">
                      <button onClick={() => openEditModal(lead)} className="badge badge-blue cursor-pointer hover:opacity-80 transition-opacity">
                        Cập nhật
                      </button>
                    </td>
                  </tr>
                ))}
                {leads.length === 0 && (
                  <tr>
                    <td colSpan="7" className="px-5 py-12 text-center text-sm" style={{ color: 'var(--text-muted)' }}>
                      Chưa có lead nào
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Trang {pagination.page} / {pagination.totalPages}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((currentPage) => Math.max(1, currentPage - 1))}
              disabled={pagination.page <= 1}
              className="btn-secondary text-sm disabled:opacity-50"
            >
              Trang trước
            </button>
            <button
              onClick={() => setPage((currentPage) => Math.min(pagination.totalPages, currentPage + 1))}
              disabled={pagination.page >= pagination.totalPages}
              className="btn-secondary text-sm disabled:opacity-50"
            >
              Trang sau
            </button>
          </div>
        </div>
      )}

      {editingLead && (
        <div className="modal-overlay fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setEditingLead(null)}>
          <div className="modal-content card p-6 w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-display font-semibold text-base mb-1" style={{ color: 'var(--text-primary)' }}>
              Cập nhật lead
            </h3>
            <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
              {editingLead.name} · {editingLead.phone}
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Trạng thái</label>
                <select value={editStatus} onChange={(e) => setEditStatus(e.target.value)} className="input">
                  {STATUS_OPTIONS.filter((option) => option.value).map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Ghi chú</label>
                <textarea
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  rows={4}
                  className="input resize-none"
                  placeholder="Ghi chú trao đổi, tình trạng tư vấn, ngày hẹn..."
                />
              </div>
            </div>

            <div className="flex gap-2 justify-end mt-5">
              <button onClick={() => setEditingLead(null)} className="btn-secondary">
                Hủy
              </button>
              <button onClick={handleSaveLead} disabled={updateLeadStatusMutation.isPending} className="btn-primary disabled:opacity-60">
                Lưu
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default LeadManager;
