'use client';
import { useEffect, useState, useRef } from 'react';
import { X, Check } from 'lucide-react';
import useLoggedUserInfo from '@/hooks/useLoggedUserInfo';
import ReactDOMServer from 'react-dom/server';

type ContentEditableProps = {
  articleId?: string;
  lockedBy?: lockedByInfo;
  children?: React.ReactNode;
};

type lockedByInfo = {
  userId: string;
  userName: string;
};

const ContentEditable: React.FC<ContentEditableProps> = ({ articleId, lockedBy, children }) => {
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  const divRef = useRef<HTMLDivElement>(null);
  const divButtonsRef = useRef<HTMLDivElement>(null);

  const { data: loggedUserInfo } = useLoggedUserInfo();
  const [contentString, setContentString] = useState<string>(ReactDOMServer.renderToStaticMarkup(children));
  const [previousContentString, setPreviousContentString] = useState<string>(
    ReactDOMServer.renderToStaticMarkup(children)
  );
  const key = new Date().toISOString() + Math.random().toString(36).substring(2, 15);

  const showDivButtons = () => {
    divButtonsRef.current?.classList.remove('hidden');
  };

  const hideDivButtons = () => {
    divButtonsRef.current?.classList.add('hidden');
  };

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
    const dataId = divRef.current?.firstChild?.getAttribute('id');
    const content = divRef.current?.firstChild?.innerHTML;

    handleUpdateContentItem(dataId, content);
    setContentString(divRef?.current?.innerHTML);
    setPreviousContentString(divRef?.current?.innerHTML);

    hideDivButtons(); // Hide buttons after save
    divRef.current?.blur(); // Remove focus from the div
  };

  const handleCancel = (event?: React.MouseEvent) => {
    event?.stopPropagation();
    setContentString(previousContentString);
    hideDivButtons(); // Hide buttons after cancel
    divRef.current?.blur(); // Remove focus from the div
  };

  const handleMouseMove = (event: React.MouseEvent) => {
    setTooltipPosition({ x: event.clientX, y: event.clientY });
  };

  const handleMouseLeave = () => {
    setTooltipPosition({ x: 0, y: 0 });
  };

  // Hide buttons when the contenteditable div loses focus
  const handleBlur = (event: React.FocusEvent<HTMLDivElement>) => {
    if (divRef.current && !divRef.current.contains(event.relatedTarget as Node)) {
      hideDivButtons();
    }
  };

  return lockedBy ? (
    <div key={key} className="relative group" onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave}>
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
    <>
      <div
        key={key}
        ref={divRef}
        contentEditable={!!loggedUserInfo?.inspectItems}
        suppressContentEditableWarning={!!loggedUserInfo?.inspectItems}
        onClick={showDivButtons}
        onBlur={handleBlur}
        className={`relative rounded ${loggedUserInfo?.inspectItems ? 'border-1 border-blue-600' : ''}`}
        dangerouslySetInnerHTML={{ __html: contentString }}
        tabIndex={0}
      ></div>

      <div
        ref={divButtonsRef}
        className="bg-white flex flex-row items-center justify-end rounded shadow-lg border-gray-500 border-1 ml-auto w-fit hidden"
      >
        <button
          type="button"
          className="p-1 rounded hover:bg-gray-200"
          onMouseDown={handleSave}
          aria-label="Save"
          tabIndex={-1}
        >
          <Check className="h-5 w-5 text-gray-700" />
        </button>
        <button
          type="button"
          className="p-1 rounded hover:bg-gray-200"
          onMouseDown={handleCancel}
          aria-label="Cancel"
          tabIndex={-1}
        >
          <X className="h-5 w-5 text-gray-700" />
        </button>
      </div>
    </>
  );
};

export default ContentEditable;
