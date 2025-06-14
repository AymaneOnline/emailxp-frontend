// emailxp/frontend/src/components/Modal.js

import React from 'react';
import { FaTimes } from 'react-icons/fa'; // Ensure react-icons is installed

import './Modal.css'; // Import modal specific styles

const Modal = ({ isOpen, onClose, children, title }) => {
    if (!isOpen) return null; // Don't render if not open

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <div className="modal-header">
                    {title && <h3 className="modal-title">{title}</h3>}
                    <button className="modal-close-button" onClick={onClose}>
                        <FaTimes />
                    </button>
                </div>
                <div className="modal-body">
                    {children} {/* This will render the content passed into the modal */}
                </div>
            </div>
        </div>
    );
};

export default Modal;