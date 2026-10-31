import { toast } from "react-toastify";

/**
 * Modern Tailwind / React-Toastify proxy for Ant Design's `message` API.
 * Provides 100% backward-compatibility: message.success, message.error, message.warning, message.info
 */
export const message = {
  success: (content, duration = 3) => {
    toast.success(content, { autoClose: duration * 1000 });
  },
  error: (content, duration = 4) => {
    toast.error(content, { autoClose: duration * 1000 });
  },
  warning: (content, duration = 3.5) => {
    toast.warning(content, { autoClose: duration * 1000 });
  },
  info: (content, duration = 3) => {
    toast.info(content, { autoClose: duration * 1000 });
  },
  loading: (content, duration = 2) => {
    toast.loading(content, { autoClose: duration * 1000 });
  },
};

export default message;

