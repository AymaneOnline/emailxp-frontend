// emailxp/frontend/src/components/ConfirmModal.js

import React from 'react';

const ConfirmModal = ({ show, onClose, onConfirm, message }) => {
    if (!show) return null;

    return (
        <div className="modal modal-open">
            <div className="modal-box">
                <h3 className="font-bold text-lg">Confirmation</h3>
                <p className="py-4">{message}</p>
                <div className="modal-action">
                    <button onClick={onConfirm} className="btn btn-error">Confirm</button>
                    <button onClick={onClose} className="btn btn-ghost">Cancel</button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmModal;