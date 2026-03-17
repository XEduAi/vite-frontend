const AdminQueryErrors = ({ errors = [] }) => {
  if (errors.length === 0) {
    return null;
  }

  return (
    <div className="card p-4 mb-4">
      <div className="space-y-3">
        {errors.map((error) => (
          <div key={error.key} className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{error.message}</p>
            <button
              onClick={error.onRetry}
              className="btn-secondary text-sm"
            >
              {error.actionLabel || 'Thử lại'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminQueryErrors;
