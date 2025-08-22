import React from 'react';
import { XMarkIcon, ExclamationTriangleIcon, CheckCircleIcon, InformationCircleIcon } from '@heroicons/react/24/outline';

const ConfirmModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  confirmText = "Confirmar", 
  cancelText = "Cancelar",
  type = "warning", // warning, danger, info, success
  loading = false 
}) => {
  if (!isOpen) return null;

  const getIcon = () => {
    switch (type) {
      case 'danger':
        return <ExclamationTriangleIcon className="w-12 h-12 text-error-600" />;
      case 'success':
        return <CheckCircleIcon className="w-12 h-12 text-success-600" />;
      case 'info':
        return <InformationCircleIcon className="w-12 h-12 text-primary-600" />;
      default:
        return <ExclamationTriangleIcon className="w-12 h-12 text-warning-600" />;
    }
  };

  const getButtonClass = () => {
    switch (type) {
      case 'danger':
        return 'btn-error';
      case 'success':
        return 'btn-success';
      case 'info':
        return 'btn-primary';
      default:
        return 'btn-warning';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-secondary-900">{title}</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-secondary-100 rounded-lg transition-colors"
              disabled={loading}
            >
              <XMarkIcon className="w-5 h-5 text-secondary-500" />
            </button>
          </div>

          <div className="text-center mb-6">
            <div className="mx-auto mb-4">
              {getIcon()}
            </div>
            <p className="text-secondary-700 leading-relaxed">{message}</p>
          </div>

          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="flex-1 btn-secondary"
              disabled={loading}
            >
              {cancelText}
            </button>
            <button
              onClick={onConfirm}
              className={`flex-1 ${getButtonClass()}`}
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Procesando...
                </div>
              ) : (
                confirmText
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;