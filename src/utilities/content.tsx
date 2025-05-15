import Figure from '@/app/components/contentElements/Figure';
import { ContentElement, PageData } from '@eidosmedia/neon-frontoffice-ts-sdk';
import Link from 'next/link';
import { JSX, ReactNode } from 'react';
import { ArticleModel } from '@/types/models';
import EditableContent from '@/app/components/utilities/EditableContent';


/**
 *
 * @param elementNames
 * @param json
 */
export function findElementsInContentJson(elementNames: string | string[], json: ContentElement): ContentElement[] {
  if ((Array.isArray(elementNames) && elementNames.includes(json?.nodeType)) || elementNames === json?.nodeType) {
    return [json];
  }
  if (json?.elements) {
    return json.elements.reduce(
      (acc: ContentElement[], elem: ContentElement) => [...acc, ...findElementsInContentJson(elementNames, elem)],
      []
    );
  }
  return [];
}

export const findText = (node: ContentElement): ReactNode => {
  if (node.nodeType === 'plainText') {
    return node.value;
  }
  return node.elements.map(elem => findText(elem)).join('');
};

export const buildAttributes = (node: ContentElement): Record<string, string> => {
  // add data- prefix to every attribute
  return Object.fromEntries(Object.entries(node.attributes || {}).map(([key, value]) => [`${key}`, value]));
};

export const renderContent = (content: ContentElement, data?: ArticleModel): ReactNode => {
  const key = content?.attributes?.id || new Date().toISOString() + Math.random().toString(36).substring(2, 15);

  switch (content.nodeType) {
    case 'headline':
      return (
        <EditableContent key={key} id="headline" articleId={data?.id} lockedBy={data?.sys?.lockedBy}>
          <h1 key={key} {...buildAttributes(content)}>
            {content.elements.map(elem => renderContent(elem))}
          </h1>
        </EditableContent>
      );
    case 'overhead':
      return (
        <EditableContent key={key} id="overhead" articleId={data?.id} lockedBy={data?.sys?.lockedBy}>
          <h6 key={key} {...buildAttributes(content)}>
            {content.elements.map(elem => renderContent(elem))}
          </h6>
        </EditableContent>
      );
    case 'grouphead':
      return (
        <div key={key} {...buildAttributes(content)}>
          {content.elements.map(elem => renderContent(elem, data))}
        </div>
      );
    case 'byline':
      return (
        <div key={key} data-type="byline" {...buildAttributes(content)}>
          {content.elements.map(elem => renderContent(elem))}
        </div>
      );
    case 'text':
      return (
        <span key={key} {...buildAttributes(content)}>
          {content.elements.map(elem => renderContent(elem))}
        </span>
      );
    case 'caption':
      return (
        <figcaption key={key} {...buildAttributes(content)}>
          {content.elements.map(elem => renderContent(elem))}
        </figcaption>
      );
    case 'credit':
      return (
        <span key={key} data-type="credit" {...buildAttributes(content)}>
          {content.elements.map(elem => renderContent(elem))}
        </span>
      );
    case 'plainText':
      return content.value;
    case 'summary':
      return (
        <EditableContent key={key} id="summary" articleId={data?.id} lockedBy={data?.sys?.lockedBy}>
          <div key={key} data-type="summary" {...buildAttributes(content)}>
            {content.elements.map(elem => renderContent(elem, data))}
          </div>
        </EditableContent>
      );
    case 'inline-media-group':
      return <Figure key={key} data={content} alt="/public/file.svg" {...content.attributes} />;
    case 'anchor':
      return (
        <Link {...buildAttributes(content)} href={content.attributes.href} key={key} data-type="anchor">
          {content.elements.map(elem => renderContent(elem))}
        </Link>
      );
    case 'br':
      return <br key={key} {...buildAttributes(content)} />;
    case 'image':
      return <img key={key} {...buildAttributes(content)} alt="No image available" />;
    default:
      const CustomElement = content.nodeType as keyof JSX.IntrinsicElements; // resolving the element name from the template as default

      return (
        <CustomElement key={key} {...buildAttributes(content)}>
          {content.elements.length > 0 && content.elements.map(elem => renderContent(elem))}
        </CustomElement>
      );
  }
};

export const getFamilyRef = (ref: string): string => {
  const idElements = ref.split('-');

  if (idElements.length === 5) {
    return idElements.slice(0, -1).join('-');
  }
  return idElements.join('-');
};
