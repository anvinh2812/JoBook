export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
export const UPLOAD_BASE_URL = import.meta.env.VITE_UPLOAD_BASE_URL;

/**
 * Chuẩn hóa đường dẫn avatar/url ảnh
 * @param {string} path
 * @returns {string|null}
 */
export const getAvatarUrl = (path) => {
  if (!path) return null;

  // Nếu đã là absolute URL (http/https) thì giữ nguyên
  if (/^https?:\/\//.test(path)) return path;

  // Normalize: loại bỏ tiền tố "/uploads" thừa
  const normalized = path.startsWith("/uploads")
    ? path.replace(/^\/uploads/, "")
    : path;

  // Local → proxy đã map "/uploads" về backend → thêm prefix "/uploads"
  if (
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1"
  ) {
    return `/uploads/${normalized.replace(/^\/+/, "")}`;
  }

  // Production → gắn hẳn domain UPLOAD_BASE_URL
  return `${UPLOAD_BASE_URL.replace(/\/$/, "")}/${normalized.replace(/^\/+/, "")}`;
};
