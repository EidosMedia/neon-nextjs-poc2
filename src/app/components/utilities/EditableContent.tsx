'use client';
import { useEffect, useState, useRef } from 'react';
import { X, Check } from 'lucide-react';

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
    const dataId = currentNode?.firstChild?.getAttribute('id');
    const content = currentNode?.firstChild?.innerHTML;

    console.log('========== Content to save:', dataId);
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
        <div className="absolute bottom-0 right-0 mb-2 mr-2 flex flex-row items-center space-x-2">
          {/* X (close) icon */}
          <button
            type="button"
            className="p-2 rounded hover:bg-gray-200"
            onClick={handleCancel}
            aria-label="Cancel"
            tabIndex={-1}
          >
            <X className="h-5 w-5 text-gray-700" />
          </button>
          {/* V (check) icon */}
          <button
            type="button"
            className="p-2 rounded hover:bg-gray-200"
            onClick={handleSave}
            aria-label="Save"
            tabIndex={-1}
          >
            <Check className="h-5 w-5 text-gray-700" />
          </button>
        </div>
      )}
    </div>
  );
};

export default EditableContent;
