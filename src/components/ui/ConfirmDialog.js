import React from 'react';
import { Modal } from './Modal';
import { Button } from './Button';

export function ConfirmDialog({ open, title = 'Confirm', description, confirmLabel = 'Confirm', cancelLabel = 'Cancel', variant = 'danger', onConfirm, onCancel, loading }) {
  return (
    <Modal open={open} onClose={onCancel} title={title} size="sm" footer={
      <>
        <Button variant="secondary" onClick={onCancel}>{cancelLabel}</Button>
        <Button variant={variant === 'danger' ? 'danger' : 'primary'} onClick={onConfirm} disabled={loading}>{loading ? 'Processing…' : confirmLabel}</Button>
      </>
    }>
      <p className="text-sm text-gray-600 dark:text-gray-300">{description}</p>
    </Modal>
  );
}

export default ConfirmDialog;
