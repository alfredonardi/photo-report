import toast from 'react-hot-toast';

/**
 * Sistema de notificações Toast
 * Substitui os alerts nativos por notificações modernas e não-invasivas
 */

export const showToast = {
  success: (message: string) => {
    toast.success(message, {
      duration: 3000,
      position: 'top-center',
      style: {
        background: '#10b981',
        color: '#fff',
        padding: '16px',
        borderRadius: '8px',
        fontSize: '14px',
        fontWeight: '500',
      },
      icon: '✓',
    });
  },

  error: (message: string) => {
    toast.error(message, {
      duration: 4000,
      position: 'top-center',
      style: {
        background: '#ef4444',
        color: '#fff',
        padding: '16px',
        borderRadius: '8px',
        fontSize: '14px',
        fontWeight: '500',
      },
      icon: '✗',
    });
  },

  warning: (message: string) => {
    toast(message, {
      duration: 3500,
      position: 'top-center',
      style: {
        background: '#f59e0b',
        color: '#fff',
        padding: '16px',
        borderRadius: '8px',
        fontSize: '14px',
        fontWeight: '500',
      },
      icon: '⚠️',
    });
  },

  info: (message: string) => {
    toast(message, {
      duration: 3000,
      position: 'top-center',
      style: {
        background: '#3b82f6',
        color: '#fff',
        padding: '16px',
        borderRadius: '8px',
        fontSize: '14px',
        fontWeight: '500',
      },
      icon: 'ℹ️',
    });
  },

  loading: (message: string) => {
    return toast.loading(message, {
      position: 'top-center',
      style: {
        background: '#6b7280',
        color: '#fff',
        padding: '16px',
        borderRadius: '8px',
        fontSize: '14px',
        fontWeight: '500',
      },
    });
  },

  dismiss: (toastId: string) => {
    toast.dismiss(toastId);
  },
};
