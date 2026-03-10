import React from 'react';
import Card from '@components/common/Card';
import { formatters } from '@utils/formatters';
import {
  IoDocumentTextOutline,
  IoImageOutline,
  IoTimeOutline,
  IoOpenOutline,
} from 'react-icons/io5';

const ProgressTimeline = ({ progress }) => {
  const timelineItems = (progress || [])
    .filter((item) => item != null)
    .sort((a, b) => new Date(b.uploaded_at) - new Date(a.uploaded_at));

  if (timelineItems.length === 0) {
    return (
      <Card title="Progress History">
        <div className="text-center py-8">
          <IoTimeOutline
            size={48}
            className="text-accent mx-auto mb-3"
          />
          <p className="text-muted-foreground">No progress uploaded yet</p>
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
    <Card
      title="Progress History"
      headerRight={(
        <span className="text-xs font-medium text-muted-foreground">
          {timelineItems.length} update{timelineItems.length === 1 ? '' : 's'}
        </span>
      )}
    >
      <div className="space-y-4">
        {timelineItems.map((item, index) => {
          const FileIcon = item.doc_link ? getFileIcon(item.file_type) : null;
          const isLast = index === timelineItems.length - 1;

          return (
            <div key={item.id || `${item.uploaded_at}-${index}`} className="relative pl-14">
              {!isLast && (
                <div className="absolute left-[17px] top-10 bottom-[-8px] w-px bg-border" />
              )}

              <div className="absolute left-0 top-1 dashboard-timeline-marker">
                <IoTimeOutline size={16} />
              </div>

              <div className="dashboard-timeline-item">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 mb-2">
                  <p className="text-xs font-medium text-muted-foreground">
                    {formatters.dateTime(item.uploaded_at)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatters.relativeTime(item.uploaded_at)}
                  </p>
                </div>

                {item.comment ? (
                  <p className="text-sm text-foreground mb-3 whitespace-pre-wrap">
                    {item.comment}
                  </p>
                ) : (
                  <p className="text-sm text-muted-foreground mb-3 italic">
                    No comment added with this upload.
                  </p>
                )}

                {item.doc_link && (
                  <a
                    href={item.doc_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-3 py-2 bg-card border border-border rounded-lg hover:bg-secondary transition-colors text-sm"
                  >
                    {FileIcon && (
                      <FileIcon size={18} className="text-muted-foreground" />
                    )}
                    <span className="text-foreground font-medium">
                      Open attachment
                    </span>
                    {item.file_size && (
                      <span className="text-xs text-muted-foreground">
                        {formatters.fileSize(item.file_size)}
                      </span>
                    )}
                    <IoOpenOutline size={15} className="text-muted-foreground" />
                  </a>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};

export default ProgressTimeline;
