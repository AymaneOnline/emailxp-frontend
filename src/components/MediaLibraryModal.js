// emailxp/frontend/src/components/MediaLibraryModal.js

import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom'; // For portal
import fileService from '../services/fileService';
import { toast } from 'react-toastify';
import { FaUpload, FaTimes, FaTrashAlt, FaCheckCircle } from 'react-icons/fa'; // Icons
import { PhotoIcon } from "@heroicons/react/24/outline"; // Icon for image placeholder

function MediaLibraryModal({ isOpen, onClose, onSelectImage }) {
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const fileInputRef = useRef(null);

    const fetchFiles = async () => {
        setLoading(true);
        try {
            const fetchedFiles = await fileService.getFiles();
            setFiles(fetchedFiles);
        } catch (err) {
            console.error('Error fetching files:', err.response?.data || err.message);
            toast.error(err.response?.data?.message || 'Failed to load media library.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isOpen) {
            fetchFiles();
            document.body.style.overflow = 'hidden'; // Prevent scrolling body when modal is open
        } else {
            // Reset state when modal closes
            setFiles([]);
            setSelectedFile(null);
            setLoading(true);
            setUploading(false);
            document.body.style.overflow = 'unset'; // Restore scrolling
        }
        // Cleanup function for effect
        return () => {
            document.body.style.overflow = 'unset'; // Ensure scrolling is restored on unmount
        };
    }, [isOpen]);

    const handleFileUpload = async (event) => {
        const file = event.target.files ? event.target.files[0] : null;
        if (!file) return;

        setUploading(true);
        try {
            const newFile = await fileService.uploadFile(file);
            setFiles(prevFiles => [newFile, ...prevFiles]); // Add new file to the top
            setSelectedFile(newFile); // Automatically select the newly uploaded file
            toast.success('File uploaded successfully!');
        } catch (err) {
            console.error('Error uploading file:', err.response?.data || err.message);
            toast.error(err.response?.data?.message || 'Failed to upload file.');
        } finally {
            setUploading(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = ''; // Clear the file input
            }
        }
    };

    const handleDeleteFile = async (fileToDelete) => {
        if (!window.confirm(`Are you sure you want to delete "${fileToDelete.fileName}"? This cannot be undone.`)) {
            return;
        }
        try {
            await fileService.deleteFile(fileToDelete.publicId);
            setFiles(prevFiles => prevFiles.filter(f => f._id !== fileToDelete._id));
            if (selectedFile?._id === fileToDelete._id) {
                setSelectedFile(null);
            }
            toast.success('File deleted successfully!');
        } catch (err) {
            console.error('Error deleting file:', err.response?.data || err.message);
            toast.error(err.response?.data?.message || 'Failed to delete file.');
        }
    };

    const handleSelectClick = () => {
        if (selectedFile) {
            // Check if the selected file is an image before allowing insertion into Quill
            if (selectedFile.mimeType && selectedFile.mimeType.startsWith('image/')) {
                onSelectImage(selectedFile.url);
                onClose();
            } else {
                toast.error('Only image files can be inserted into the editor.');
            }
        } else {
            toast.warn('Please select an image first.');
        }
    };

    if (!isOpen) return null;

    // Use ReactDOM.createPortal to render the modal outside the current DOM hierarchy
    return ReactDOM.createPortal(
        // Modal Overlay (full screen, semi-transparent background)
        <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-[9999]"> {/* Very high z-index */}
            {/* Modal Content Box */}
            <div className="bg-white rounded-xl shadow-2xl p-6 md:p-8 w-11/12 max-w-4xl max-h-[90vh] flex flex-col relative transform transition-all scale-100 opacity-100">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 transition-colors duration-200 focus:outline-none"
                    title="Close"
                >
                    <FaTimes className="text-3xl" /> {/* Larger icon */}
                </button>

                <h3 className="text-3xl font-bold text-gray-800 mb-6 border-b border-gray-200 pb-4">Media Library</h3>

                {/* Upload Section */}
                <div className="border-2 border-dashed border-gray-300 p-6 rounded-lg text-center bg-gray-50 mb-6">
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileUpload}
                        accept="image/*"
                        id="media-upload-input"
                        disabled={uploading}
                        className="hidden" // Hide the default input
                    />
                    <label htmlFor="media-upload-input" className="cursor-pointer text-blue-600 font-semibold hover:text-blue-700 transition-colors duration-200 flex items-center justify-center gap-3 text-lg">
                        {uploading ? (
                            <>
                                <span className="h-6 w-6 border-4 border-t-4 border-blue-200 border-opacity-50 rounded-full animate-spin"></span> Uploading...
                            </>
                        ) : (
                            <><FaUpload className="text-xl" /> Click to upload a new image or drag and drop here.</>
                        )}
                    </label>
                    <p className="text-sm text-gray-500 mt-2">Accepted formats: Images (JPG, PNG, GIF, SVG). Max size: 10MB.</p>
                </div>

                {/* File Grid Body */}
                <div className="flex-grow overflow-y-auto pr-4 -mr-4"> {/* pr-4 -mr-4 to account for scrollbar space */}
                    {loading ? (
                        <div className="flex justify-center items-center h-48">
                            <span className="h-16 w-16 border-4 border-t-4 border-blue-500 border-gray-200 rounded-full animate-spin"></span>
                            <p className="ml-4 text-lg text-gray-600">Loading files...</p>
                        </div>
                    ) : files.length === 0 ? (
                        <p className="text-center text-gray-500 py-10 text-lg">No files found in your library. Upload one!</p>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 pb-4">
                            {files.map(file => (
                                <div
                                    key={file._id}
                                    className={`relative bg-white rounded-lg shadow-md border ${selectedFile?._id === file._id ? 'border-blue-500 ring-2 ring-blue-300' : 'border-gray-200'} cursor-pointer hover:shadow-lg transition-all duration-200 flex flex-col overflow-hidden`}
                                    onClick={() => setSelectedFile(file)}
                                >
                                    <figure className="h-28 sm:h-32 bg-gray-100 flex items-center justify-center overflow-hidden">
                                        {file.mimeType && file.mimeType.startsWith('image/') ? (
                                            <img
                                                src={file.url}
                                                alt={file.fileName}
                                                className="max-h-full max-w-full object-contain p-2"
                                                onError={(e) => { e.target.src = 'https://placehold.co/150x120/E0E0E0/ADADAD?text=Image+Error'; }}
                                            />
                                        ) : (
                                            <PhotoIcon className="text-5xl text-gray-400" />
                                        )}
                                    </figure>
                                    <div className="p-3 text-sm flex-grow">
                                        <h2 className="font-semibold text-gray-800 truncate mb-1">{file.fileName}</h2>
                                        <p className="text-gray-500 text-xs truncate">{file.mimeType}</p>
                                    </div>
                                    <div className="flex items-center justify-between p-2 border-t border-gray-100">
                                        {selectedFile?._id === file._id ? (
                                            <span className="text-blue-600 flex items-center gap-1 font-medium text-xs">
                                                <FaCheckCircle className="text-base" /> Selected
                                            </span>
                                        ) : (
                                            <span className="text-transparent text-xs select-none">Placeholder</span>
                                        )}
                                        <button
                                            className="p-1 rounded-full text-red-500 hover:bg-red-100 hover:text-red-700 transition-colors duration-200 focus:outline-none"
                                            onClick={(e) => { e.stopPropagation(); handleDeleteFile(file); }}
                                            title="Delete Image"
                                        >
                                            <FaTrashAlt className="text-base" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Modal Footer */}
                <div className="flex justify-end gap-3 mt-6 border-t border-gray-200 pt-6">
                    <button className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors duration-200 text-lg font-medium shadow-sm" onClick={onClose}>Close</button>
                    <button
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition-colors duration-200 text-lg font-medium"
                        onClick={handleSelectClick}
                        disabled={!selectedFile || (selectedFile.mimeType && !selectedFile.mimeType.startsWith('image/'))} // Ensure it's an image
                    >
                        Select Image
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
}

export default MediaLibraryModal;