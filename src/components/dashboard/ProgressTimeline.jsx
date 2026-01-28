import React from 'react';
import Card from '@components/common/Card';
import { formatters } from '@utils/formatters';
import { 
  IoDocumentTextOutline, 
  IoImageOutline,
  IoTimeOutline 
} from 'react-icons/io5';

/**
 * Progress Timeline Component
 * Shows chronological history of job progress uploads
 */
const ProgressTimeline = ({ progress }) => {
  console.log('Progress data:', progress);
  console.log('Has undefined?', progress.some(item => item == null));
  if (!progress || progress.length === 0) {
    return (
      <Card title="Progress History">
        <div className="text-center py-8">
          <IoTimeOutline
            size={48}
            className="text-primary-grey-300 mx-auto mb-3"
          />
          <p className="text-primary-grey-600">No progress uploaded yet</p>
        </div>
      </Card>
    );
  }

  const getFileIcon = (fileType) => {
    if (fileType?.startsWith('image/')) {
      return IoImageOutline;
    }
    return IoDocumentTextOutline;
  };

  return (
    <Card title="Progress History">
      <div className="space-y-4">
        
        {progress
        .filter(item => item != null)
        .map((item, index) => {
          const FileIcon = item.doc_link ? getFileIcon(item.file_type) : null;
          const isLast = index === progress.length - 1;

          return (
            <div key={item.id} className="relative">
              {/* Timeline Line */}
              {!isLast && (
                <div className="absolute left-5 top-12 w-0.5 h-full bg-primary-grey-200 -z-10" />
              )}

              <div className="flex gap-4">
                {/* Timeline Dot */}
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-[#3D1D1C] rounded-full flex items-center justify-center">
                    <IoTimeOutline size={20} className="text-white" />
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 pb-6">
                  <div className="bg-primary-grey-50 rounded-lg p-4">
                    {/* Timestamp */}
                    <p className="text-xs text-primary-grey-500 mb-2">
                      {formatters.dateTime(item.uploaded_at)}
                    </p>

                    {/* Comment */}
                    {item.comment && (
                      <p className="text-sm text-primary-grey-900 mb-3 whitespace-pre-wrap">
                        {item.comment}
                      </p>
                    )}

                    {/* File */}
                    {item.doc_link && (
                      <a
                        href={item.doc_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-3 py-2 bg-white border border-primary-grey-300 rounded-lg hover:bg-primary-grey-100 transition-colors text-sm"
                      >
                        {FileIcon && <FileIcon size={18} className="text-primary-grey-600" />}
                        <span className="text-primary-grey-700">
                          View Attachment
                        </span>
                        {item.file_size && (
                          <span className="text-xs text-primary-grey-500">
                            ({formatters.fileSize(item.file_size)})
                          </span>
                        )}
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};

export default ProgressTimeline;