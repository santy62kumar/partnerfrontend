import React, { useEffect } from 'react';
import { IoClose } from 'react-icons/io5';

/**
 * Reusable Modal Component
 * @param {boolean} isOpen - Modal open state
 * @param {Function} onClose - Close handler
 * @param {string} title - Modal title
 * @param {React.ReactNode} children - Modal content
 * @param {string} size - Modal size (sm, md, lg, xl)
 * @param {boolean} showCloseButton - Show close button in header
 */
const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  showCloseButton = true,
  closeOnOverlayClick = true,
}) => {
  // Handle ESC key press
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  };

  const handleOverlayClick = (e) => {
    if (closeOnOverlayClick && e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4 animate-fadeIn"
      onClick={handleOverlayClick}
    >
      <div
        className={`bg-white rounded-lg shadow-xl w-full ${sizes[size]} max-h-[90vh] flex flex-col`}
      >
        {/* Header */}
        {(title || showCloseButton) && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-primary-grey-200">
            {title && (
              <h2 className="text-xl font-semibold font-montserrat text-primary-grey-900">
                {title}
              </h2>
            )}
            {showCloseButton && (
              <button
                onClick={onClose}
                className="text-primary-grey-500 hover:text-primary-grey-700 transition-colors"
              >
                <IoClose size={24} />
              </button>
            )}
          </div>
        )}

        {/* Content */}
        <div className="px-6 py-4 overflow-y-auto flex-1">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;