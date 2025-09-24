// emailxp/frontend/src/components/Modal.js

import React from 'react';

const Modal = ({ isOpen, onClose, children, title }) => {
    if (!isOpen) return null;

    return (
        <div className="modal modal-open">
            <div className="modal-box relative">
                {title && <h3 className="text-lg font-bold">{title}</h3>}
                <button
                    className="btn btn-sm btn-ghost btn-circle absolute right-2 top-2"
                    onClick={onClose}
                    aria-label="Close"
                >
                    ✕
                </button>

                <div className="mt-4">
                    {children}
                </div>
            </div>
        </div>
    );
};

export default Modal;