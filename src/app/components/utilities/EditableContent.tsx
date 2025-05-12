'use client';
import { useEffect } from 'react';

type EditableContentProps = {
  id: string;
  articleId?: string;
  children?: React.ReactNode;
};

const EditableContent: React.FC<EditableContentProps> = ({ id, articleId, children }) => {
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
  }, []);

  return (
    <div id={id} key={id} contentEditable>
      {children}
    </div>
  );
};

export default EditableContent;
