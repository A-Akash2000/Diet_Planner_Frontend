import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Common toast options (with type-safe values)
const commonOptions = {
  position: "top-right" as const,
  autoClose: 3000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  progress: undefined as number | undefined,
};

// Toast types
export const showSuccessToast = (message: string): void => {
  toast.success(message, commonOptions);
};

export const showErrorToast = (message: string): void => {
  toast.error(message, commonOptions);
};

export const showInfoToast = (message: string): void => {
  toast.info(message, commonOptions);
};

export const showWarningToast = (message: string): void => {
  toast.warn(message, commonOptions);
};

// Promise-based toast
interface PromiseMessages {
  pending: string;
  success: string;
  error: string;
}

export const showPromiseToast = <T>(
  promise: Promise<T>,
  messages: PromiseMessages
): void => {
  toast.promise(
    promise,
    {
      pending: messages.pending,
      success: messages.success,
      error: messages.error,
    },
    commonOptions
  );
};
