'use client';
import { useEffect, useState, useRef } from 'react';

type EditableContentProps = {
  id: string;
  articleId?: string;
  lockedBy?: lockedByInfo;
  children?: React.ReactNode;
};

type lockedByInfo = {
  userId: string;
  userName: string;
};

const EditableContent: React.FC<EditableContentProps> = ({ id, articleId, lockedBy, children }) => {
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [showButtons, setShowButtons] = useState(false);
  const divRef = useRef<HTMLDivElement>(null);

  const handleUpdateContentItem = async (contentItemId: string, payload: string) => {
    try {
      const response = await fetch(`/api/contentItems`, {
        method: 'POST',
        body: JSON.stringify({ id: articleId, contentItemId: contentItemId, payload: payload }),
      });
      if (response.ok) {
        console.log('Content updated successfully');
      } else {
        console.error('Failed to update content');
      }
    } catch (error) {
      console.error('Error updating content:', error);
    }
  };

  const handleSave = (event?: React.MouseEvent) => {
    event?.stopPropagation();
    const currentNode = document.getElementById(id);
    const dataId = currentNode?.firstChild?.getAttribute('data-id');
    const content = currentNode?.firstChild?.innerHTML;
    handleUpdateContentItem(dataId, content);
    setShowButtons(false);
    divRef.current?.blur(); // Remove focus from the div
  };

  const handleCancel = (event?: React.MouseEvent) => {
    event?.stopPropagation();
    setShowButtons(false);
    divRef.current?.blur(); // Remove focus from the div
  };

  const handleMouseMove = (event: React.MouseEvent) => {
    setTooltipPosition({ x: event.clientX, y: event.clientY });
  };

  const handleMouseLeave = () => {
    setTooltipPosition({ x: 0, y: 0 });
  };

  useEffect(() => {
    if (!showButtons) return;

    const handleBlur = (event: FocusEvent) => {
      if (divRef.current && !divRef.current.contains(event.relatedTarget as Node)) {
        setShowButtons(false);
      }
    };

    if (divRef.current) {
      divRef.current.addEventListener('blur', handleBlur, true);
    }
    return () => {
      if (divRef.current) {
        divRef.current.removeEventListener('blur', handleBlur, true);
      }
    };
  }, [showButtons]);

  return lockedBy ? (
    <div id={id} key={id} className="relative group" onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave}>
      {children}
      {tooltipPosition.x !== 0 && tooltipPosition.y !== 0 && (
        <div
          className="fixed bg-gray-800 text-white text-sm px-2 py-1 rounded shadow-lg"
          style={{
            top: tooltipPosition.y + 10,
            left: tooltipPosition.x + 10,
          }}
        >
          The content is not editable because it is locked by {lockedBy.userName}
        </div>
      )}
    </div>
  ) : (
    <div
      id={id}
      key={id}
      ref={divRef}
      contentEditable
      suppressContentEditableWarning
      onClick={() => setShowButtons(true)}
      className="relative"
    >
      {children}
      {showButtons && (
        <div className="absolute top-0 right-0 h-full flex flex-col justify-center space-y-2">
          {/* X (close) icon */}
          <button
            type="button"
            className="p-2 rounded hover:bg-gray-200 h-1/2"
            onClick={handleCancel}
            aria-label="Cancel"
            tabIndex={-1}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-gray-700"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          {/* V (check) icon */}
          <button
            type="button"
            className="p-2 rounded hover:bg-gray-200 h-1/2"
            onClick={handleSave}
            aria-label="Save"
            tabIndex={-1}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-gray-700"
              fill="none"
              viewBox="0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
};

export default EditableContent;
