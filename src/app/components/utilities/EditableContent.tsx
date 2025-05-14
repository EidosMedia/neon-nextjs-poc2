'use client';
import { useEffect, useState } from 'react';

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

  useEffect(() => {
    const currentNode = document.getElementById(id);
    if (!lockedBy) {
      const handleBlurOrEnter = (event: Event | KeyboardEvent) => {
        if (event.type === 'blur' || (event instanceof KeyboardEvent && event.key === 'Enter')) {
          event.preventDefault();
          const dataId = currentNode?.firstChild?.getAttribute('data-id');
          const content = currentNode?.firstChild?.innerHTML;
          console.log('Content updated:', dataId, content);
          handleUpdateContentItem(dataId, content);
        }
      };

      currentNode.addEventListener('blur', handleBlurOrEnter);
      currentNode.addEventListener('keydown', handleBlurOrEnter);

      // Cleanup event listeners on unmount
      return () => {
        currentNode.removeEventListener('blur', handleBlurOrEnter);
        currentNode.removeEventListener('keydown', handleBlurOrEnter);
      };
    }
  }, [id, lockedBy]);

  const handleMouseMove = (event: React.MouseEvent) => {
    setTooltipPosition({ x: event.clientX, y: event.clientY });
  };

  const handleMouseLeave = () => {
    setTooltipPosition({ x: 0, y: 0 }); // Reset tooltip position
  };

  return lockedBy ? (
    <div
      id={id}
      key={id}
      className="relative group"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave} // Handle mouse leave
    >
      {children}
      {tooltipPosition.x !== 0 &&
        tooltipPosition.y !== 0 && ( // Render tooltip only if position is set
          <div
            className="fixed bg-gray-800 text-white text-sm px-2 py-1 rounded shadow-lg"
            style={{
              top: tooltipPosition.y + 10, // Offset 10px below the cursor
              left: tooltipPosition.x + 10, // Offset 10px to the right of the cursor
            }}
          >
            The content is not editable because it is locked by {lockedBy.userName}
          </div>
        )}
    </div>
  ) : (
    <div id={id} key={id} contentEditable>
      {children}
    </div>
  );
};

export default EditableContent;
