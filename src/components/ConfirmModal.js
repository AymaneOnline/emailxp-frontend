// emailxp/frontend/src/components/ConfirmModal.js

import React from 'react';
import '../App.css'; // Assuming App.css or a global CSS file defines .modal-overlay, .modal-content, etc.

const ConfirmModal = ({ show, onClose, onConfirm, message }) => {
    if (!show) {
        return null;
    }

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h3>Confirmation</h3>
                <p>{message}</p>
                <div className="button-group-form"> {/* Reusing button-group-form for styling */}
                    <button
                        onClick={onConfirm}
                        className="btn btn-danger margin-right-small"
                    >
                        Confirm
                    </button>
                    <button
                        onClick={onClose}
                        className="btn btn-secondary"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmModal;