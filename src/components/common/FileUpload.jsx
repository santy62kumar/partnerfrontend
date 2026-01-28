import React, { useRef } from 'react';
import { IoCloudUploadOutline, IoClose, IoDocumentTextOutline } from 'react-icons/io5';
import { formatters } from '@utils/formatters';

/**
 * File Upload Component with drag and drop
 * @param {File} file - Selected file
 * @param {string} preview - File preview URL (for images)
 * @param {Function} onFileSelect - File select handler
 * @param {Function} onClear - Clear file handler
 * @param {string} error - Error message
 * @param {boolean} disabled - Disable upload
 * @param {string} accept - Accepted file types
 */
const FileUpload = ({
  file,
  preview,
  onFileSelect,
  onClear,
  error,
  disabled = false,
  accept = 'image/jpeg,image/jpg,image/png,application/pdf',
  label = 'Upload File',
}) => {
  const fileInputRef = useRef(null);
  const [isDragging, setIsDragging] = React.useState(false);

  const handleClick = () => {
    if (!disabled) {
      fileInputRef.current?.click();
    }
  };

  const handleChange = (e) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      onFileSelect(selectedFile);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (!disabled) {
      const droppedFile = e.dataTransfer.files?.[0];
      if (droppedFile) {
        onFileSelect(droppedFile);
      }
    }
  };

//   return (
//   <div className="w-full">
//     {label && (
//       <label className="block text-xs font-medium text-primary-grey-700 mb-1">
//         {label}
//       </label>
//     )}

//     {!file ? (
//       <div
//         onClick={handleClick}
//         onDragOver={handleDragOver}
//         onDragLeave={handleDragLeave}
//         onDrop={handleDrop}
//         className={`
//           border border-dashed rounded-md p-4 text-center cursor-pointer
//           transition-all duration-200
//           ${
//             isDragging
//               ? 'border-primary-green bg-green-50'
//               : error
//               ? 'border-primary-red bg-red-50'
//               : 'border-primary-grey-300 hover:border-primary-green hover:bg-primary-grey-50'
//           }
//           ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
//         `}
//       >
//         <IoCloudUploadOutline
//           className={`mx-auto mb-2 ${
//             error ? 'text-primary-red' : 'text-primary-grey-400'
//           }`}
//           size={28}
//         />

//         <p className="text-xs font-medium text-primary-grey-700">
//           Click or drag file
//         </p>
//         <p className="text-[11px] text-primary-grey-500">
//           JPG, PNG, PDF · Max 5MB
//         </p>

//         <input
//           ref={fileInputRef}
//           type="file"
//           accept={accept}
//           onChange={handleChange}
//           disabled={disabled}
//           className="hidden"
//         />
//       </div>
//     ) : (
//       <div className="border border-primary-grey-300 rounded-md p-2 flex items-center justify-between bg-primary-grey-50">
//         <div className="flex items-center gap-2 flex-1 min-w-0">
//           {preview ? (
//             <img
//               src={preview}
//               alt="Preview"
//               className="w-8 h-8 object-cover rounded"
//             />
//           ) : (
//             <IoDocumentTextOutline
//               className="text-primary-grey-400 flex-shrink-0"
//               size={22}
//             />
//           )}

//           <div className="min-w-0">
//             <p className="text-xs font-medium text-primary-grey-900 truncate">
//               {file.name}
//             </p>
//             <p className="text-[11px] text-primary-grey-500">
//               {formatters.fileSize(file.size)}
//             </p>
//           </div>
//         </div>

//         <button
//           onClick={onClear}
//           className="text-primary-grey-500 hover:text-primary-red transition-colors ml-2"
//           type="button"
//         >
//           <IoClose size={16} />
//         </button>
//       </div>
//     )}

//     {error && (
//       <p className="mt-1 text-xs text-primary-red">{error}</p>
//     )}
//   </div>
// );


  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-primary-grey-700 mb-2">
          {label}
        </label>
      )}

      {!file ? (
        <div
          onClick={handleClick}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`
            border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
            transition-all duration-200
                          ${
                isDragging
                  ? 'border-[#3D1D1C] bg-[#3D1D1C]/10'
                  : error
                  ? 'border-primary-red bg-red-50'
                  : 'border-primary-grey-300 hover:border-[#3D1D1C] hover:bg-[#3D1D1C]/5'
              }
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        >
          <IoCloudUploadOutline
            className={`mx-auto mb-4 ${
              error ? 'text-primary-red' : 'text-primary-grey-400'
            }`}
            size={48}
          />
          <p className="text-sm font-medium text-primary-grey-700 mb-1">
            Click to upload or drag and drop
          </p>
          <p className="text-xs text-primary-grey-500">
            JPG, PNG or PDF (Max 5MB)
          </p>

          <input
            ref={fileInputRef}
            type="file"
            accept={accept}
            onChange={handleChange}
            disabled={disabled}
            className="hidden"
          />
        </div>
      ) : (
        <div className="border border-primary-grey-300 rounded-lg p-4 flex items-center justify-between bg-primary-grey-50">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            {preview ? (
              <img
                src={preview}
                alt="Preview"
                className="w-12 h-12 object-cover rounded"
              />
            ) : (
              <IoDocumentTextOutline
                className="text-primary-grey-400 flex-shrink-0"
                size={32}
              />
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-primary-grey-900 truncate">
                {file.name}
              </p>
              <p className="text-xs text-primary-grey-500">
                {formatters.fileSize(file.size)}
              </p>
            </div>
          </div>
          <button
            onClick={onClear}
            className="text-primary-grey-500 hover:text-primary-red transition-colors ml-2"
            type="button"
          >
            <IoClose size={20} />
          </button>
        </div>
      )}

      {error && (
        <p className="mt-2 text-sm text-primary-red">{error}</p>
      )}
    </div>
  );
};

export default FileUpload;