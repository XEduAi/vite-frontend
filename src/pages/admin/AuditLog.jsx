import { useState } from 'react';
import { getApiErrorMessage } from '../../api/errors';
import AdminLayout from '../../components/AdminLayout';
import AdminQueryErrors from '../../components/AdminQueryErrors';
import { useAuditLogsQuery } from '../../features/audit/hooks';

const AuditLog = () => {
  const [search, setSearch] = useState('');
  const [submittedSearch, setSubmittedSearch] = useState('');
  const [action, setAction] = useState('');
  const [entityType, setEntityType] = useState('');
  const [page, setPage] = useState(1);

  const auditLogsQuery = useAuditLogsQuery({
    page,
    limit: 20,
    search: submittedSearch,
    action,
    entityType,
  });

  const logs = auditLogsQuery.data?.logs || [];
  const pagination = auditLogsQuery.data?.pagination || { page: 1, totalPages: 1, total: 0 };

  const queryErrors = auditLogsQuery.isError ? [{
    key: 'audit',
    message: getApiErrorMessage(auditLogsQuery.error, 'Không thể tải audit log'),
    onRetry: () => auditLogsQuery.refetch(),
  }] : [];

  return (
    <AdminLayout>
      <div className="flex flex-wrap items-end justify-between gap-4 mb-8 fade-in">
        <div>
          <div className="bento-label" style={{ color: 'var(--amber-warm)' }}>Hệ thống</div>
          <h1 className="bento-hero-title mt-1" style={{ color: 'var(--text-primary)' }}>
            Audit Log
          </h1>
          <p className="text-sm mt-2" style={{ color: 'var(--text-muted)' }}>
            {pagination.total || 0} sự kiện quản trị đã được ghi nhận
          </p>
        </div>
      </div>

      <AdminQueryErrors errors={queryErrors} />

      <div className="card p-4 mb-4">
        <form
          onSubmit={(event) => {
            event.preventDefault();
            setSubmittedSearch(search.trim());
            setPage(1);
          }}
          className="flex flex-wrap gap-2.5 items-end"
        >
          <div className="flex-1 min-w-44">
            <label className="block text-xs mb-1.5" style={{ color: 'var(--text-muted)' }}>Tìm kiếm</label>
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="input"
              placeholder="Tên admin, entity, action..."
            />
          </div>
          <div>
            <label className="block text-xs mb-1.5" style={{ color: 'var(--text-muted)' }}>Action</label>
            <input value={action} onChange={(event) => { setAction(event.target.value); setPage(1); }} className="input w-40" />
          </div>
          <div>
            <label className="block text-xs mb-1.5" style={{ color: 'var(--text-muted)' }}>Entity</label>
            <input value={entityType} onChange={(event) => { setEntityType(event.target.value); setPage(1); }} className="input w-40" />
          </div>
          <button type="submit" className="btn-primary">Lọc</button>
        </form>
      </div>

      <div className="card overflow-hidden">
        {auditLogsQuery.isPending ? (
          <div className="py-12 text-center text-sm" style={{ color: 'var(--text-muted)' }}>Đang tải...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr style={{ background: 'var(--cream)', borderBottom: '1px solid var(--border-light)' }}>
                  {['Thời gian', 'Người thực hiện', 'Action', 'Entity', 'Chi tiết'].map((header) => (
                    <th key={header} className="px-5 py-3 text-left text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>
                      {header.toUpperCase()}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log._id} className="table-row border-b" style={{ borderColor: 'var(--border-light)' }}>
                    <td className="px-5 py-3.5 text-sm" style={{ color: 'var(--text-muted)' }}>
                      {new Date(log.createdAt).toLocaleString('vi-VN')}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="font-medium" style={{ color: 'var(--text-primary)' }}>{log.actorName || 'Unknown'}</div>
                      <div className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{log.actorRole}</div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="badge badge-blue">{log.action}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="font-medium" style={{ color: 'var(--text-primary)' }}>{log.entityType}</div>
                      <div className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{log.entityLabel || log.entityId}</div>
                    </td>
                    <td className="px-5 py-3.5 max-w-lg">
                      <pre
                        className="whitespace-pre-wrap text-xs rounded-xl p-3 overflow-x-auto"
                        style={{ background: 'var(--bg-secondary)', color: 'var(--text-secondary)' }}
                      >
                        {JSON.stringify(log.metadata || {}, null, 2)}
                      </pre>
                    </td>
                  </tr>
                ))}
                {logs.length === 0 && (
                  <tr>
                    <td colSpan="5" className="px-5 py-12 text-center text-sm" style={{ color: 'var(--text-muted)' }}>
                      Chưa có log nào
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
    </AdminLayout>
  );
};

export default AuditLog;
