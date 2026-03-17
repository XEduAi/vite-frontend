const DEFAULT_ERROR_MESSAGE = 'Đã có lỗi xảy ra. Vui lòng thử lại.';

export function normalizeApiError(error, options = {}) {
  const fallbackMessage = options.fallbackMessage || DEFAULT_ERROR_MESSAGE;
  const status = error?.response?.status || null;
  const payload = error?.response?.data;
  const code = payload?.code || null;
  const fieldErrors = Array.isArray(payload?.errors) ? payload.errors : [];

  let message =
    payload?.message ||
    (typeof payload === 'string' ? payload : '') ||
    (fieldErrors.length > 0 ? fieldErrors[0]?.message : '');

  if (!message && !error?.response) {
    message = 'Không thể kết nối tới máy chủ. Vui lòng thử lại.';
  }

  if (!message && status === 401) {
    message = 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.';
  }

  if (!message && status === 403) {
    message = 'Bạn không có quyền thực hiện thao tác này.';
  }

  if (!message && status === 404) {
    message = 'Không tìm thấy dữ liệu yêu cầu.';
  }

  if (!message) {
    message = fallbackMessage;
  }

  return {
    code,
    details: fieldErrors,
    isForbidden: status === 403 || code === 'AUTH_FORBIDDEN',
    isNetworkError: !error?.response,
    isUnauthorized: status === 401 || code === 'AUTH_UNAUTHORIZED',
    message,
    status,
  };
}

export function getApiErrorMessage(error, fallbackMessage) {
  return normalizeApiError(error, { fallbackMessage }).message;
}
