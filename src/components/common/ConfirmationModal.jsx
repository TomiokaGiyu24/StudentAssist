import React from 'react';

/**
 * Custom Confirmation Modal
 * Replaces native window.confirm with a styled dialog
 */
const ConfirmationModal = ({ isOpen, title, message, onConfirm, onCancel, confirmText = 'Confirm', cancelText = 'Cancel', isDangerous = false }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm transition-opacity"
                onClick={onCancel}
            />

            {/* Modal */}
            <div className="relative bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 animate-scale-in">
                <div className="mb-4">
                    <h3 className="text-lg font-bold text-stone-900 mb-2">
                        {title}
                    </h3>
                    <p className="text-stone-600 text-sm leading-relaxed">
                        {message}
                    </p>
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={onCancel}
                        className="flex-1 px-4 py-2.5 rounded-xl border border-stone-200 text-stone-600 font-medium hover:bg-stone-50 transition-colors"
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={onConfirm}
                        className={`flex-1 px-4 py-2.5 rounded-xl font-medium text-white shadow-lg transition-all hover:-translate-y-0.5 ${isDangerous
                                ? 'bg-red-500 hover:bg-red-600 shadow-red-500/25'
                                : 'gradient-accent shadow-indigo-500/25'
                            }`}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmationModal;
