'use client';
import { useState, useRef } from 'react';
import { X, Check, LockKeyhole } from 'lucide-react';
import useLoggedUserInfo from '@/hooks/useLoggedUserInfo';
import ReactDOMServer from 'react-dom/server';
import { isString } from 'lodash';
import useVersions from '@/hooks/useVersions';
import { ArticleModel } from '@/types/models/ArticleModel';

type ContentEditableProps = {
  data?: ArticleModel;
  children?: React.ReactNode;
  showLockedByTooltip?: boolean;
};

type lockedByInfo =
  | {
      userId: string;
      userName: string;
    }
  | string;

const ContentEditable: React.FC<ContentEditableProps> = ({ data, children, showLockedByTooltip = true }) => {
  const articleId = data?.id;
  const lockedBy = data?.sys?.lockedBy;
  const divRef = useRef<HTMLDivElement>(null);
  const divButtonsRef = useRef<HTMLDivElement>(null);

  const { changeEdited } = useVersions({ currentNode: data as any }); // TODO: Replace 'any' with proper PageData<BaseModel> type conversion if available
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

    if (divRef.current) {
      const firstChild = divRef.current?.firstChild as HTMLElement;
      const dataId = firstChild?.getAttribute('id') || '';
      const content = firstChild?.innerHTML;

      handleUpdateContentItem(dataId, content);
      setContentString(divRef?.current?.innerHTML);
      setPreviousContentString(divRef?.current?.innerHTML);
      changeEdited(true); // Mark as edited
      hideDivButtons(); // Hide buttons after save
      divRef.current?.blur(); // Remove focus from the div
    }
  };

  const handleCancel = (event?: React.MouseEvent) => {
    event?.stopPropagation();
    if (divRef.current) {
      divRef.current.innerHTML = previousContentString; // Reset to previous content
    }
    setContentString(previousContentString);
    hideDivButtons(); // Hide buttons after cancel
    divRef.current?.blur(); // Remove focus from the div
  };

  // Hide buttons when the contenteditable div loses focus
  const handleBlur = (event: React.FocusEvent<HTMLDivElement>) => {
    if (divRef.current && !divRef.current.contains(event.relatedTarget as Node)) {
      hideDivButtons();
    }
  };

  return lockedBy ? (
    <div key={key} className="relative group">
      <div className="flex items-center">
        {children}
        {showLockedByTooltip && loggedUserInfo?.inspectItems && !loggedUserInfo?.preview && (
          <>
            <span
              className="ml-2 relative"
              onMouseEnter={e => {
                const tooltip = e.currentTarget.nextSibling as HTMLDivElement;
                if (tooltip) tooltip.classList.remove('hidden');
              }}
              onMouseLeave={e => {
                const tooltip = e.currentTarget.nextSibling as HTMLDivElement;
                if (tooltip) tooltip.classList.add('hidden');
              }}
            >
              <LockKeyhole />
            </span>
            <div className="hidden px-2 py-1 rounded bg-black text-white text-xs whitespace-nowrap shadow-lg z-10">
              Locked by {isString(lockedBy) ? lockedBy : (lockedBy as any).userName}
            </div>
          </>
        )}
      </div>
    </div>
  ) : (
    <div>
      <div
        key={key}
        ref={divRef}
        contentEditable={!!loggedUserInfo?.inspectItems && !loggedUserInfo?.preview}
        suppressContentEditableWarning={!!loggedUserInfo?.inspectItems}
        onClick={!!loggedUserInfo?.inspectItems ? showDivButtons : undefined}
        onBlur={!!loggedUserInfo?.inspectItems ? handleBlur : undefined}
        className={`relative rounded ${
          loggedUserInfo?.inspectItems ? 'border-1 border-neutral-light/30 hover:border-primary p-1' : ''
        }`}
        dangerouslySetInnerHTML={{ __html: contentString }}
        tabIndex={0}
      />
      {loggedUserInfo?.inspectItems && (
        <div className="relative">
          <div
            ref={divButtonsRef}
            className="bg-white z-10 flex absolute right-0 flex-row items-center justify-end rounded shadow-lg border-gray-500 border-1 ml-auto w-fit hidden"
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
        </div>
      )}
    </div>
  );
};

export default ContentEditable;
