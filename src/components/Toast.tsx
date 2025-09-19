import React from 'react';
import type { ToastMessage } from '../types';

interface ToastProps {
  toast: ToastMessage | null;
  onClose: () => void;
}

const toastTypeClasses = {
  success: 'alert-success',
  error: 'alert-error',
  info: 'alert-info',
};

const Toast: React.FC<ToastProps> = ({ toast, onClose }) => {
  if (!toast) return null;

  return (
    <div className="toast toast-center toast-bottom z-50">
      <div className={`alert ${toastTypeClasses[toast.type]} shadow-lg`}>
        <div>
          <span>{toast.message}</span>
          <button className="btn btn-sm btn-ghost" onClick={onClose}>✕</button>
        </div>
      </div>
    </div>
  );
};

export default Toast;