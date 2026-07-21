import { useState, useCallback, createContext, useContext } from 'react';

const ToastContext = createContext(null);

/**
 * Toast notification system.
 * Wrap your app with <ToastProvider> and call useToast() to show notifications.
 */
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, variant = 'success', duration = 3000) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, variant }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
  }, []);

  const showSuccess = useCallback((msg) => addToast(msg, 'success'), [addToast]);
  const showError = useCallback((msg) => addToast(msg, 'error'), [addToast]);

  return (
    <ToastContext.Provider value={{ showSuccess, showError }}>
      {children}
      {/* Toast container */}
      <div
        className="fixed top-4 right-4 z-[60] flex flex-col gap-2 pointer-events-none"
        aria-live="polite"
        aria-label="Notifications"
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto px-4 py-3 rounded-xl shadow-lg text-[13px] font-medium toast-slide-in ${
              toast.variant === 'success'
                ? 'bg-emerald-600 text-white'
                : 'bg-rose-600 text-white'
            }`}
            role="status"
          >
            <div className="flex items-center gap-2">
              {toast.variant === 'success' ? (
                <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
              ) : (
                <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                </svg>
              )}
              {toast.message}
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return ctx;
}
