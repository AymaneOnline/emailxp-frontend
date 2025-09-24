import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';

function Modal({ open, onClose, title, children, footer, size = 'md' }) {
  useEffect(() => {
    if (!open) return;

    const modalRoot = document.getElementById('modal-root') || document.body;
    const prevActive = document.activeElement;

    // Prevent background scroll
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    // Escape handler
    const onKey = (e) => { if (e.key === 'Escape') onClose?.(); };
    window.addEventListener('keydown', onKey);

    // Focus trap: cycle focusable elements inside the modal
    const focusableSelector = 'a[href], area[href], input:not([disabled]):not([type=hidden]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), [tabindex]:not([tabindex="-1"])';

    // Wait for the DOM to render
    requestAnimationFrame(() => {
      const dialog = modalRoot.querySelector('[role="dialog"]');
      if (!dialog) return;
      const focusables = Array.from(dialog.querySelectorAll(focusableSelector)).filter(el => el.offsetParent !== null);
      if (focusables.length) focusables[0].focus();

      const onTrap = (ev) => {
        if (ev.key !== 'Tab') return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (!first || !last) return;
        if (ev.shiftKey && document.activeElement === first) {
          ev.preventDefault();
          last.focus();
        } else if (!ev.shiftKey && document.activeElement === last) {
          ev.preventDefault();
          first.focus();
        }
      };

      dialog.addEventListener('keydown', onTrap);

      // Cleanup function for trap
      const cleanupTrap = () => dialog.removeEventListener('keydown', onTrap);

      // Cleanup on unmount
      return () => {
        cleanupTrap();
        window.removeEventListener('keydown', onKey);
        document.body.style.overflow = prev;
        try { prevActive?.focus?.(); } catch (e) {}
      };
    });

    // If effect returns nothing synchronously, return a cleanup that removes listeners and restores overflow/focus
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
      try { document.activeElement?.blur?.(); } catch (e) {}
    };
  }, [open, onClose]);

  if (!open) return null;

  const sizes = { sm: 'sm:max-w-sm', md: 'sm:max-w-lg', lg: 'sm:max-w-2xl', fullscreen: 'w-full h-full sm:!max-w-none sm:!h-auto' };
  const modalRoot = document.getElementById('modal-root') || document.body;
  return createPortal(
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-0 w-screen h-screen">
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />
      <div role="dialog" aria-modal="true" className={`relative ${sizes[size]} ${size === 'fullscreen' ? 'rounded-none' : 'rounded-lg'} bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-xl flex flex-col ${size === 'fullscreen' ? 'w-full h-screen' : 'w-full max-h-[90vh]'}`}>
        <div className={`px-5 py-4 border-b border-gray-200 dark:border-gray-700 flex items-start justify-between gap-4 ${size === 'fullscreen' ? 'sticky top-0 bg-white dark:bg-gray-800 z-10' : ''}`}>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
          <button onClick={onClose} aria-label="Close dialog" className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 focus:outline-none">✕</button>
        </div>
        <div className={`px-5 py-4 overflow-y-auto ${size === 'fullscreen' ? 'flex-1 min-h-0' : ''}`}>
          {children}
        </div>
        {footer && <div className="px-5 py-3 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3 bg-gray-50 dark:bg-gray-900">{footer}</div>}
      </div>
    </div>,
    modalRoot
  );
}

export { Modal };
export default Modal;
