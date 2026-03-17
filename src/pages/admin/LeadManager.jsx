import { useDeferredValue, useEffect, useMemo, useState } from 'react';
import { getApiErrorMessage } from '../../api/errors';
import { useAdminStudentsQuery } from '../../features/admin/lookups';
import { useAdminLeadsQuery, useLeadDashboardQuery, useUpdateLeadMutation } from '../../features/leads/hooks';
import AdminLayout from '../../components/AdminLayout';
import AdminQueryErrors from '../../components/AdminQueryErrors';
import AdminToast from '../../components/AdminToast';

const STATUS_OPTIONS = [
  { value: '', label: 'Tất cả pipeline' },
  { value: 'new', label: 'Mới' },
  { value: 'contacted', label: 'Đã liên hệ' },
  { value: 'qualified', label: 'Đủ điều kiện' },
  { value: 'converted', label: 'Đã chuyển đổi' },
  { value: 'lost', label: 'Mất lead' },
];

const SOURCE_OPTIONS = [
  { value: '', label: 'Tất cả nguồn' },
  { value: 'direct', label: 'Direct' },
  { value: 'organic-blog', label: 'Organic Blog' },
  { value: 'paid-ads', label: 'Paid Ads' },
  { value: 'referral', label: 'Referral' },
  { value: 'other', label: 'Khác' },
];

const STATUS_BADGES = {
  new: 'badge-blue',
  contacted: 'badge-amber',
  qualified: 'badge-purple',
  converted: 'badge-green',
  lost: 'badge-red',
};

const HANDOFF_FIELDS = [
  { key: 'consultationCompleted', label: 'Tư vấn xong' },
  { key: 'placementReviewed', label: 'Xếp lớp sơ bộ' },
  { key: 'trialClassBooked', label: 'Đã chốt học thử' },
  { key: 'scheduleShared', label: 'Đã gửi lịch học' },
  { key: 'tuitionExplained', label: 'Đã báo học phí' },
  { key: 'enrollmentConfirmed', label: 'Chốt nhập học' },
];

const EMPTY_EDIT_FORM = {
  status: 'new',
  source: 'direct',
  assignedToId: '',
  followUpAt: '',
  lastContactedAt: '',
  nextAction: '',
  notes: '',
  convertedStudentId: '',
  handoffNotes: '',
  handoffChecklist: HANDOFF_FIELDS.reduce((result, item) => ({ ...result, [item.key]: false }), {}),
};

const formatDateTimeInput = (value) => {
  if (!value) {
    return '';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '';
  }

  const timezoneOffset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - timezoneOffset).toISOString().slice(0, 16);
};

const isOpenLead = (status) => ['new', 'contacted', 'qualified'].includes(status);

const isOverdueLead = (lead) => (
  Boolean(lead.followUpAt)
  && isOpenLead(lead.status)
  && new Date(lead.followUpAt).getTime() < Date.now()
);

const LeadManager = () => {
  const [message, setMessage] = useState({ type: '', content: '' });
  const [filterStatus, setFilterStatus] = useState('');
  const [filterSource, setFilterSource] = useState('');
  const [filterOwner, setFilterOwner] = useState('');
  const [search, setSearch] = useState('');
  const [showOverdueOnly, setShowOverdueOnly] = useState(false);
  const [page, setPage] = useState(1);
  const [editingLead, setEditingLead] = useState(null);
  const [editForm, setEditForm] = useState(EMPTY_EDIT_FORM);
  const deferredSearch = useDeferredValue(search.trim());

  const dashboardQuery = useLeadDashboardQuery();
  const leadsQuery = useAdminLeadsQuery({
    status: filterStatus,
    source: filterSource,
    ownerId: filterOwner,
    overdue: showOverdueOnly,
    search: deferredSearch,
    page,
    limit: 20,
  });
  const studentsQuery = useAdminStudentsQuery({ enabled: Boolean(editingLead) });
  const updateLeadMutation = useUpdateLeadMutation();

  useEffect(() => {
    setPage(1);
  }, [filterOwner, filterSource, filterStatus, deferredSearch, showOverdueOnly]);

  const leads = leadsQuery.data?.leads || [];
  const pagination = leadsQuery.data?.pagination || { page: 1, limit: 20, total: 0, totalPages: 1 };
  const summary = dashboardQuery.data?.summary || {
    total: 0,
    new: 0,
    contacted: 0,
    qualified: 0,
    converted: 0,
    lost: 0,
    overdue: 0,
    dueToday: 0,
    conversionRate: 0,
  };
  const owners = dashboardQuery.data?.owners || [];
  const ownerBreakdown = dashboardQuery.data?.ownerBreakdown || [];
  const sourceBreakdown = dashboardQuery.data?.sources || [];
  const students = studentsQuery.data || [];

  const cards = useMemo(() => ([
    { key: 'total', label: 'Tổng lead', value: summary.total, color: 'var(--text-primary)' },
    { key: 'conversionRate', label: 'Tỷ lệ chuyển đổi', value: `${summary.conversionRate}%`, color: 'var(--success)' },
    { key: 'qualified', label: 'Lead đủ điều kiện', value: summary.qualified, color: 'var(--purple)' },
    { key: 'converted', label: 'Đã nhập học', value: summary.converted, color: 'var(--success)' },
    { key: 'overdue', label: 'Follow-up trễ hạn', value: summary.overdue, color: 'var(--danger)' },
    { key: 'dueToday', label: 'Cần xử lý hôm nay', value: summary.dueToday, color: 'var(--amber-warm)' },
  ]), [summary]);

  const queryErrors = [
    dashboardQuery.isError
      ? {
          key: 'lead-dashboard',
          message: getApiErrorMessage(dashboardQuery.error, 'Không thể tải dashboard lead'),
          onRetry: () => dashboardQuery.refetch(),
        }
      : null,
    leadsQuery.isError
      ? {
          key: 'lead-list',
          message: getApiErrorMessage(leadsQuery.error, 'Không thể tải danh sách lead'),
          onRetry: () => leadsQuery.refetch(),
        }
      : null,
  ].filter(Boolean);

  const showMessage = (content, type = 'success') => {
    setMessage({ type, content });
    window.setTimeout(() => setMessage({ type: '', content: '' }), 4000);
  };

  const openEditModal = (lead) => {
    setEditingLead(lead);
    setEditForm({
      status: lead.status || 'new',
      source: lead.source || 'direct',
      assignedToId: lead.assignedTo?._id || '',
      followUpAt: formatDateTimeInput(lead.followUpAt),
      lastContactedAt: formatDateTimeInput(lead.lastContactedAt),
      nextAction: lead.nextAction || '',
      notes: lead.notes || '',
      convertedStudentId: lead.convertedStudent?._id || '',
      handoffNotes: lead.handoffNotes || '',
      handoffChecklist: HANDOFF_FIELDS.reduce((result, item) => ({
        ...result,
        [item.key]: Boolean(lead.handoffChecklist?.[item.key]),
      }), {}),
    });
  };

  const handleSaveLead = async () => {
    if (!editingLead) {
      return;
    }

    try {
      await updateLeadMutation.mutateAsync({
        leadId: editingLead._id,
        payload: {
          status: editForm.status,
          source: editForm.source,
          assignedToId: editForm.assignedToId || null,
          followUpAt: editForm.followUpAt || null,
          lastContactedAt: editForm.lastContactedAt || null,
          nextAction: editForm.nextAction,
          notes: editForm.notes,
          convertedStudentId: editForm.convertedStudentId || null,
          handoffNotes: editForm.handoffNotes,
          handoffChecklist: editForm.handoffChecklist,
        },
      });

      setEditingLead(null);
      setEditForm(EMPTY_EDIT_FORM);
      showMessage('Đã cập nhật lead');
    } catch (error) {
      showMessage(getApiErrorMessage(error, 'Lỗi khi cập nhật lead'), 'error');
    }
  };

  return (
    <AdminLayout>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6 fade-in">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
            Lead CRM
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
            Pipeline từ landing page tới nhập học với phân công, follow-up và handoff checklist
          </p>
        </div>
      </div>

      <AdminToast message={message.content} type={message.type} />
      <AdminQueryErrors errors={queryErrors} />

      <div className="grid grid-cols-2 xl:grid-cols-6 gap-3 mb-6">
        {cards.map((card) => (
          <div key={card.key} className="card p-4">
            <div className="text-xs font-medium mb-1" style={{ color: 'var(--text-muted)' }}>{card.label}</div>
            <div className="font-display font-bold text-lg" style={{ color: card.color }}>{card.value}</div>
          </div>
        ))}
      </div>

      <div className="grid xl:grid-cols-[1.2fr_0.8fr] gap-4 mb-6">
        <div className="card p-4">
          <div className="flex items-center justify-between gap-3 mb-4">
            <div>
              <h2 className="font-display text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>Nguồn chuyển đổi</h2>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Hiệu quả từng kênh lead</p>
            </div>
          </div>
          <div className="space-y-3">
            {sourceBreakdown.map((item) => (
              <div key={item.source}>
                <div className="flex items-center justify-between gap-3 mb-1.5">
                  <div className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>{item.label}</div>
                  <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    {item.total} lead · {item.conversionRate}% chuyển đổi
                  </div>
                </div>
                <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--border-light)' }}>
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${summary.total > 0 ? Math.max((item.total / summary.total) * 100, item.total > 0 ? 6 : 0) : 0}%`,
                      background: 'var(--grad-amber)',
                    }}
                  />
                </div>
              </div>
            ))}
            {sourceBreakdown.length === 0 && (
              <div className="text-sm" style={{ color: 'var(--text-muted)' }}>Chưa có dữ liệu nguồn lead</div>
            )}
          </div>
        </div>

        <div className="card p-4">
          <div className="mb-4">
            <h2 className="font-display text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>Tải theo owner</h2>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Ai đang giữ lead và đã chuyển đổi bao nhiêu</p>
          </div>
          <div className="space-y-3">
            {ownerBreakdown.slice(0, 6).map((owner) => (
              <div key={owner.ownerId} className="rounded-2xl p-3" style={{ background: 'var(--bg-secondary)' }}>
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>{owner.ownerName}</div>
                    <div className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                      {owner.open} open · {owner.converted} converted
                    </div>
                  </div>
                  <span className="badge badge-blue">{owner.total} lead</span>
                </div>
              </div>
            ))}
            {ownerBreakdown.length === 0 && (
              <div className="text-sm" style={{ color: 'var(--text-muted)' }}>Chưa có dữ liệu owner</div>
            )}
          </div>
        </div>
      </div>

      <div className="card p-4 mb-4">
        <div className="grid lg:grid-cols-[1.2fr_repeat(4,minmax(0,0.6fr))] gap-3 items-end">
          <div>
            <label className="block text-xs mb-1.5" style={{ color: 'var(--text-muted)' }}>Tìm kiếm</label>
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="input"
              placeholder="Tên, SĐT, mục tiêu, ghi chú..."
            />
          </div>
          <div>
            <label className="block text-xs mb-1.5" style={{ color: 'var(--text-muted)' }}>Pipeline</label>
            <select value={filterStatus} onChange={(event) => setFilterStatus(event.target.value)} className="input">
              {STATUS_OPTIONS.map((option) => (
                <option key={option.value || 'all-status'} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs mb-1.5" style={{ color: 'var(--text-muted)' }}>Nguồn</label>
            <select value={filterSource} onChange={(event) => setFilterSource(event.target.value)} className="input">
              {SOURCE_OPTIONS.map((option) => (
                <option key={option.value || 'all-source'} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs mb-1.5" style={{ color: 'var(--text-muted)' }}>Owner</label>
            <select value={filterOwner} onChange={(event) => setFilterOwner(event.target.value)} className="input">
              <option value="">Tất cả owner</option>
              <option value="unassigned">Chưa phân công</option>
              {owners.map((owner) => (
                <option key={owner._id} value={owner._id}>{owner.fullName || owner.username}</option>
              ))}
            </select>
          </div>
          <label className="flex items-center gap-2 rounded-2xl px-3 py-2.5 h-11" style={{ background: 'var(--bg-secondary)' }}>
            <input
              type="checkbox"
              checked={showOverdueOnly}
              onChange={(event) => setShowOverdueOnly(event.target.checked)}
            />
            <span className="text-sm" style={{ color: 'var(--text-primary)' }}>Chỉ lead quá hạn</span>
          </label>
        </div>
      </div>

      <div className="card overflow-hidden">
        {leadsQuery.isPending ? (
          <div className="py-12 text-center text-sm" style={{ color: 'var(--text-muted)' }}>Đang tải...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr style={{ background: 'var(--cream)', borderBottom: '1px solid var(--border-light)' }}>
                  {['Lead', 'Pipeline', 'Nguồn', 'Owner', 'Follow-up', 'Handoff', 'Liên hệ gần nhất', 'Thao tác'].map((header) => (
                    <th key={header} className="px-5 py-3 text-left text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>
                      {header.toUpperCase()}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {leads.map((lead) => (
                  <tr key={lead._id} className="table-row border-b align-top" style={{ borderColor: 'var(--border-light)' }}>
                    <td className="px-5 py-3.5 min-w-[260px]">
                      <div className="font-medium" style={{ color: 'var(--text-primary)' }}>{lead.name}</div>
                      <div className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                        {lead.phone} · Lớp {lead.grade}
                      </div>
                      <div className="text-xs mt-1 line-clamp-2" style={{ color: 'var(--text-secondary)' }}>
                        {lead.goal || 'Chưa có mục tiêu học tập'}
                      </div>
                    </td>
                    <td className="px-5 py-3.5 min-w-[160px]">
                      <span className={`badge ${STATUS_BADGES[lead.status] || 'badge-gray'}`}>
                        {lead.statusLabel || lead.status}
                      </span>
                      {lead.convertedStudent && (
                        <div className="text-xs mt-2" style={{ color: 'var(--success)' }}>
                          Link LMS: {lead.convertedStudent.fullName}
                        </div>
                      )}
                    </td>
                    <td className="px-5 py-3.5 min-w-[170px]">
                      <div className="font-medium" style={{ color: 'var(--text-primary)' }}>{lead.sourceLabel || lead.source}</div>
                      <div className="text-xs mt-1 line-clamp-2" style={{ color: 'var(--text-muted)' }}>
                        {lead.sourceDetail || lead.referrer || lead.landingPagePath || 'Không có chi tiết'}
                      </div>
                    </td>
                    <td className="px-5 py-3.5 min-w-[160px]">
                      <div className="font-medium" style={{ color: 'var(--text-primary)' }}>
                        {lead.assignedTo?.fullName || 'Chưa phân công'}
                      </div>
                      <div className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                        {lead.nextAction || 'Chưa có next action'}
                      </div>
                    </td>
                    <td className="px-5 py-3.5 min-w-[170px]">
                      {lead.followUpAt ? (
                        <>
                          <div className="font-medium" style={{ color: 'var(--text-primary)' }}>
                            {new Date(lead.followUpAt).toLocaleString('vi-VN')}
                          </div>
                          <div className="text-xs mt-1" style={{ color: isOverdueLead(lead) ? 'var(--danger)' : 'var(--text-muted)' }}>
                            {isOverdueLead(lead) ? 'Quá hạn' : 'Đúng hạn'}
                          </div>
                        </>
                      ) : (
                        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Chưa lên lịch</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 min-w-[140px]">
                      <div className="font-medium" style={{ color: 'var(--text-primary)' }}>
                        {lead.handoffProgress?.completed || 0}/{lead.handoffProgress?.total || 6} bước
                      </div>
                      <div className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                        {lead.handoffProgress?.isComplete ? 'Hoàn tất handoff' : 'Đang chờ hoàn thiện'}
                      </div>
                    </td>
                    <td className="px-5 py-3.5 min-w-[160px]">
                      {lead.lastContactedAt ? (
                        <span style={{ color: 'var(--text-secondary)' }}>{new Date(lead.lastContactedAt).toLocaleString('vi-VN')}</span>
                      ) : (
                        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Chưa ghi nhận</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 min-w-[120px]">
                      <button
                        onClick={() => openEditModal(lead)}
                        className="badge badge-blue cursor-pointer hover:opacity-80 transition-opacity"
                      >
                        Mở CRM
                      </button>
                    </td>
                  </tr>
                ))}
                {leads.length === 0 && (
                  <tr>
                    <td colSpan="8" className="px-5 py-12 text-center text-sm" style={{ color: 'var(--text-muted)' }}>
                      Không có lead phù hợp bộ lọc hiện tại
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
          <div className="modal-content card p-6 w-full max-w-5xl max-h-[90vh] overflow-y-auto" onClick={(event) => event.stopPropagation()}>
            <div className="flex flex-wrap items-start justify-between gap-3 mb-5">
              <div>
                <h3 className="font-display font-semibold text-xl" style={{ color: 'var(--text-primary)' }}>
                  {editingLead.name}
                </h3>
                <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
                  {editingLead.phone} · Lớp {editingLead.grade} · {editingLead.sourceLabel || editingLead.source}
                </p>
              </div>
              <span className={`badge ${STATUS_BADGES[editForm.status] || 'badge-gray'}`}>
                {STATUS_OPTIONS.find((option) => option.value === editForm.status)?.label || editForm.status}
              </span>
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Pipeline</label>
                    <select
                      value={editForm.status}
                      onChange={(event) => setEditForm((current) => ({ ...current, status: event.target.value }))}
                      className="input"
                    >
                      {STATUS_OPTIONS.filter((option) => option.value).map((option) => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Nguồn</label>
                    <select
                      value={editForm.source}
                      onChange={(event) => setEditForm((current) => ({ ...current, source: event.target.value }))}
                      className="input"
                    >
                      {SOURCE_OPTIONS.filter((option) => option.value).map((option) => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Owner</label>
                    <select
                      value={editForm.assignedToId}
                      onChange={(event) => setEditForm((current) => ({ ...current, assignedToId: event.target.value }))}
                      className="input"
                    >
                      <option value="">Chưa phân công</option>
                      {owners.map((owner) => (
                        <option key={owner._id} value={owner._id}>{owner.fullName || owner.username}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Lead đã vào LMS</label>
                    <select
                      value={editForm.convertedStudentId}
                      onChange={(event) => setEditForm((current) => ({ ...current, convertedStudentId: event.target.value }))}
                      className="input"
                    >
                      <option value="">Chưa liên kết học viên</option>
                      {students.map((student) => (
                        <option key={student._id} value={student._id}>
                          {student.fullName} ({student.username})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Follow-up tiếp theo</label>
                    <input
                      type="datetime-local"
                      value={editForm.followUpAt}
                      onChange={(event) => setEditForm((current) => ({ ...current, followUpAt: event.target.value }))}
                      className="input"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Liên hệ gần nhất</label>
                    <input
                      type="datetime-local"
                      value={editForm.lastContactedAt}
                      onChange={(event) => setEditForm((current) => ({ ...current, lastContactedAt: event.target.value }))}
                      className="input"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Next action</label>
                  <input
                    value={editForm.nextAction}
                    onChange={(event) => setEditForm((current) => ({ ...current, nextAction: event.target.value }))}
                    className="input"
                    placeholder="Ví dụ: gọi lại sau giờ tan học, gửi lịch học thử..."
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Ghi chú CRM</label>
                  <textarea
                    rows={5}
                    value={editForm.notes}
                    onChange={(event) => setEditForm((current) => ({ ...current, notes: event.target.value }))}
                    className="input resize-none"
                    placeholder="Nhu cầu phụ huynh, ngân sách, phản hồi tư vấn..."
                  />
                </div>

                <div className="rounded-2xl p-4" style={{ background: 'var(--bg-secondary)' }}>
                  <div className="font-medium mb-3" style={{ color: 'var(--text-primary)' }}>Attribution</div>
                  <div className="grid sm:grid-cols-2 gap-3 text-sm">
                    <div>
                      <div className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Source detail</div>
                      <div style={{ color: 'var(--text-primary)' }}>{editingLead.sourceDetail || 'Không có'}</div>
                    </div>
                    <div>
                      <div className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Landing path</div>
                      <div style={{ color: 'var(--text-primary)' }}>{editingLead.landingPagePath || '/'}</div>
                    </div>
                    <div className="sm:col-span-2">
                      <div className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Referrer</div>
                      <div className="break-all" style={{ color: 'var(--text-primary)' }}>{editingLead.referrer || 'Không có'}</div>
                    </div>
                    <div className="sm:col-span-2">
                      <div className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>UTM</div>
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(editingLead.utm || {}).filter(([, value]) => value).map(([key, value]) => (
                          <span key={key} className="badge badge-blue">{key}: {value}</span>
                        ))}
                        {Object.values(editingLead.utm || {}).every((value) => !value) && (
                          <span style={{ color: 'var(--text-muted)' }}>Không có UTM</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="rounded-2xl p-4" style={{ background: 'var(--bg-secondary)' }}>
                  <div className="flex items-center justify-between gap-3 mb-3">
                    <div className="font-medium" style={{ color: 'var(--text-primary)' }}>Checklist handoff nhập học</div>
                    <span className="badge badge-green">
                      {Object.values(editForm.handoffChecklist).filter(Boolean).length}/{HANDOFF_FIELDS.length}
                    </span>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {HANDOFF_FIELDS.map((item) => (
                      <label key={item.key} className="flex items-center gap-2 rounded-2xl px-3 py-2.5" style={{ background: 'var(--surface)' }}>
                        <input
                          type="checkbox"
                          checked={Boolean(editForm.handoffChecklist[item.key])}
                          onChange={(event) => setEditForm((current) => ({
                            ...current,
                            handoffChecklist: {
                              ...current.handoffChecklist,
                              [item.key]: event.target.checked,
                            },
                          }))}
                        />
                        <span className="text-sm" style={{ color: 'var(--text-primary)' }}>{item.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Ghi chú handoff</label>
                  <textarea
                    rows={5}
                    value={editForm.handoffNotes}
                    onChange={(event) => setEditForm((current) => ({ ...current, handoffNotes: event.target.value }))}
                    className="input resize-none"
                    placeholder="Tình trạng đóng học phí, lớp đề xuất, ai phụ trách nhập học..."
                  />
                </div>

                <div className="rounded-2xl p-4" style={{ background: 'linear-gradient(135deg, rgba(15,23,42,0.04), rgba(245,158,11,0.1))' }}>
                  <div className="font-medium mb-2" style={{ color: 'var(--text-primary)' }}>Trạng thái xử lý</div>
                  <div className="space-y-2 text-sm">
                    <div style={{ color: 'var(--text-secondary)' }}>
                      Tạo lead: {new Date(editingLead.createdAt).toLocaleString('vi-VN')}
                    </div>
                    <div style={{ color: 'var(--text-secondary)' }}>
                      Follow-up: {editForm.followUpAt ? new Date(editForm.followUpAt).toLocaleString('vi-VN') : 'Chưa đặt lịch'}
                    </div>
                    <div style={{ color: 'var(--text-secondary)' }}>
                      Liên hệ gần nhất: {editForm.lastContactedAt ? new Date(editForm.lastContactedAt).toLocaleString('vi-VN') : 'Chưa ghi nhận'}
                    </div>
                    <div style={{ color: 'var(--text-secondary)' }}>
                      Gắn học viên LMS: {editForm.convertedStudentId ? 'Đã liên kết' : 'Chưa liên kết'}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-2 justify-end mt-6">
              <button onClick={() => setEditingLead(null)} className="btn-secondary">
                Hủy
              </button>
              <button onClick={handleSaveLead} disabled={updateLeadMutation.isPending} className="btn-primary disabled:opacity-60">
                Lưu CRM
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default LeadManager;
