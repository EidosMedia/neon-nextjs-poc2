'use client';
import { Children, isValidElement, useState, useRef } from 'react';
import { X, Check, LockKeyhole } from 'lucide-react';
import useLoggedUserInfo from '@/hooks/useLoggedUserInfo';
import useVersions from '@/hooks/useVersions';
import { ArticleModel } from '@/types/models/ArticleModel';
import useAuthContext from '@/hooks/useAuthContext';
import { normalizeViewStatus, ViewStatus } from '@eidosmedia/neon-frontoffice-ts-sdk';
import { useContentEditingContext } from './ContentEditingContext';

const lockLabel = (lock: unknown): string => {
  if (typeof lock === 'string') return lock;
  if (lock && typeof lock === 'object') {
    if ('userName' in lock && typeof lock.userName === 'string') return lock.userName;
    if ('name' in lock && typeof lock.name === 'string') return lock.name;
  }
  return 'another editor';
};

type ContentEditableProps = {
  data?: ArticleModel;
  children?: React.ReactNode;
  showLockedByTooltip?: boolean;
  viewStatus?: ViewStatus;
  minimal?: boolean;
};

const ContentEditable: React.FC<ContentEditableProps> = ({
  data,
  children,
  showLockedByTooltip = true,
  viewStatus,
  minimal,
}) => {
  const articleId = data?.id;
  const editingContext = useContentEditingContext();
  const child = Children.toArray(children)[0];
  const contentItemId = isValidElement<{ id?: string }>(child) ? child.props.id : undefined;

  // Preserve the legacy collaboration exception; v2 blocks inline editing for every Neon lock.
  const ownLock = !editingContext && data?.sys?.lockedBy === 'CollaborationEditor' ? null : data?.sys?.lockedBy;
  const scopedLock = editingContext && editingContext.objectId === articleId ? editingContext.lockedBy : undefined;
  const lockedBy = scopedLock === undefined ? ownLock : scopedLock;
  const divRef = useRef<HTMLDivElement>(null);
  const divButtonsRef = useRef<HTMLDivElement>(null);
  //console.log('data in contentEditable', data);

  const { data: authContext } = useAuthContext();
  const normalizedViewStatus = normalizeViewStatus(editingContext?.viewStatus ?? viewStatus);
  const canUseVersions = normalizedViewStatus === ViewStatus.PREVIEW || authContext.hasEditorialAuth;

  const { changeEdited, refetch: refetchVersions } = useVersions({
    currentNode: data,
    viewStatus: normalizedViewStatus,
    notLoadOnInit: minimal,
    enabled: canUseVersions,
  });
  const { data: loggedUserInfo } = useLoggedUserInfo();

  const [previousContentString, setPreviousContentString] = useState<string>('');

  const showDivButtons = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    e.nativeEvent.stopImmediatePropagation();

    if (divRef.current) {
      setPreviousContentString(divRef.current.innerHTML);
    }

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
        await refetchVersions(); // Refresh versions after successful update
        window.location.reload(); // Reload the page to reflect changes
      } else {
        alert('Failed to update content with articleId=' + articleId + '\nResponse status: ' + response.statusText);
        console.warn('Failed to update content - response:', response);
        window.location.reload(); // Reload the page if update fails
      }
    } catch (error) {
      console.error('Error updating content:', error);
    }
  };

  const handleSave = (event?: React.MouseEvent) => {
    event?.stopPropagation();
    if (!canEdit || !contentItemId) return;

    if (divRef.current) {
      const firstChild = divRef.current.firstElementChild;
      if (!firstChild || firstChild.id !== contentItemId) {
        console.warn('Cannot save content item: edited element is missing or changed', { articleId, contentItemId });
        alert('The editable content item has changed. Reload the page before trying again.');
        return;
      }
      const content = firstChild.innerHTML;

      handleUpdateContentItem(contentItemId, content);
      setPreviousContentString(divRef?.current?.innerHTML);
      changeEdited(true); // Mark as edited
      hideDivButtons(); // Hide buttons after save
      divRef.current?.blur(); // Remove focus from the div

      //setTimeout(() => {
      //  location.reload();
      //}, 400); // Reload the page to reflect changes
    }
  };

  const handleCancel = (event?: React.MouseEvent) => {
    event?.stopPropagation();
    if (divRef.current) {
      divRef.current.innerHTML = previousContentString; // Reset to previous content
    }
    hideDivButtons(); // Hide buttons after cancel
    divRef.current?.blur(); // Remove focus from the div
  };

  // Hide buttons when the contenteditable div loses focus
  const handleBlur = (event: React.FocusEvent<HTMLDivElement>) => {
    if (divRef.current && !divRef.current.contains(event.relatedTarget as Node)) {
      hideDivButtons();
    }
  };

  const canEdit =
    !!articleId && !!contentItemId && !!loggedUserInfo?.inspectItems &&
    normalizedViewStatus === ViewStatus.PREVIEW && !loggedUserInfo?.preview && !lockedBy;

  return lockedBy ? (
    <div className="relative group">
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
              Locked by {lockLabel(lockedBy)}
            </div>
          </>
        )}
      </div>
    </div>
  ) : (
    <div>
      <div
        ref={divRef}
        contentEditable={canEdit}
        suppressContentEditableWarning={!!loggedUserInfo?.inspectItems}
        onClick={canEdit ? showDivButtons : undefined}
        onBlur={canEdit ? handleBlur : undefined}
        className={`relative rounded z-10 ${
          canEdit ? 'border-1 border-neutral-light/30 hover:border-primary p-1 cursor-text' : ''
        }`}
        tabIndex={canEdit ? 0 : undefined}
      >
        {children}
      </div>
      {canEdit && (
        <div className="relative">
          <div
            ref={divButtonsRef}
            className="bg-white z-20 flex absolute right-0 flex-row items-center justify-end rounded shadow-lg border-gray-500 border-1 ml-auto w-fit hidden"
          >
            <button
              type="button"
              className="p-1 rounded hover:bg-gray-200 cursor-pointer"
              onMouseDown={handleSave}
              aria-label="Save"
              tabIndex={-1}
            >
              <Check className="h-5 w-5 text-gray-700" />
            </button>
            <button
              type="button"
              className="p-1 rounded hover:bg-gray-200 cursor-pointer"
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
