import { toast } from 'react-hot-toast';
import ERROR_MESSAGES_VI from './errorMessages.vi';

// Translate backend message to Vietnamese if known
const toVi = (msg) => {
  if (!msg) return null;
  // exact match first
  if (ERROR_MESSAGES_VI[msg]) return ERROR_MESSAGES_VI[msg];
  return null;
};

const extractMessage = (error) => {
  // Axios error shape or plain string
  const raw = error?.response?.data?.message || error?.message || error;
  const vi = toVi(raw);
  return vi || (typeof raw === 'string' ? raw : null) || 'Đã xảy ra lỗi, vui lòng thử lại sau.';
};

export const notify = {
  success: (message, opts = {}) => toast.success(message, opts),
  error: (error, fallback, opts = {}) => {
    const msg = extractMessage(error) || fallback || 'Đã xảy ra lỗi, vui lòng thử lại sau.';
    return toast.error(msg, opts);
  },
  info: (message, opts = {}) => toast(message, opts),
};

export default notify;
