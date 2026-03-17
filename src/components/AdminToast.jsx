const AdminToast = ({ className = 'mb-5', message, type = 'success' }) => {
  if (!message) {
    return null;
  }

  return (
    <div className={`toast ${className} ${type === 'error' ? 'toast-error' : 'toast-success'}`}>
      {type === 'error' ? '⚠' : '✓'} {message}
    </div>
  );
};

export default AdminToast;
