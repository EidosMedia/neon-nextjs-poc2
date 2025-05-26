import Figure from '@/app/components/contentElements/Figure';
import { ContentElement, PageData } from '@eidosmedia/neon-frontoffice-ts-sdk';
import Link from 'next/link';
import { JSX, ReactNode } from 'react';
import { ArticleModel } from '@/types/models';
import ContentEditable from '@/app/components/utilities/ContentEditable';

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

export const buildAttributes = (node: ContentElement): Record<string, any> => {
  // replace "class" with "className" and "stroke-linecap" with "strokeLinecap"
  return Object.fromEntries(
    Object.entries(node.attributes || {}).map(([key, value]) => [
      key === 'class'
        ? 'className'
        : key === 'stroke-linecap'
        ? 'strokeLinecap'
        : key === 'stroke-linejoin'
        ? 'strokeLinejoin'
        : key === 'stroke-width'
        ? 'strokeWidth'
        : key === 'tabindex'
        ? 'tabIndex'
        : key === 'contenteditable'
        ? 'contentEditable'
        : key,
      key === 'style' ? convertStyleToObject(value) : value,
    ])
  );
};

export const renderContent = (content: ContentElement, data?: ArticleModel, parent?: string): ReactNode => {
  const key = content?.attributes?.id || new Date().toISOString() + Math.random().toString(36).substring(2, 15);

  switch (content.nodeType) {
    case 'headline':
      return (
        <ContentEditable key={key} articleId={data?.id} lockedBy={data?.sys?.lockedBy}>
          <h1 key={key} {...buildAttributes(content)}>
            {content.elements.map(elem => renderContent(elem, data))}
          </h1>
        </ContentEditable>
      );
    case 'overhead':
      return (
        <ContentEditable key={key} articleId={data?.id} lockedBy={data?.sys?.lockedBy}>
          <h5 key={key} {...buildAttributes(content)} className="uppercase">
            {content.elements.map(elem => renderContent(elem, data))}
          </h5>
        </ContentEditable>
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
          {content.elements.map(elem => renderContent(elem, data))}
        </div>
      );
    case 'text':
      return (
        <span id="text" key={key} {...buildAttributes(content)}>
          {content.elements.map(elem => renderContent(elem, data, 'text'))}
        </span>
      );
    case 'caption':
      return (
        <figcaption key={key} {...buildAttributes(content)}>
          {content.elements.map(elem => renderContent(elem, data))}
        </figcaption>
      );
    case 'credit':
      return (
        <span key={key} data-type="credit" {...buildAttributes(content)}>
          {content.elements.map(elem => renderContent(elem, data))}
        </span>
      );
    case 'p':
      if (parent === 'text') {
        return (
          <ContentEditable key={key} articleId={data?.id} lockedBy={data?.sys?.lockedBy}>
            <p key={key} {...buildAttributes(content)}>
              {content.elements.map(elem => renderContent(elem, data))}
            </p>
          </ContentEditable>
        );
      } else {
        return <p key={key}>{content.elements.map(elem => renderContent(elem, data))}</p>;
      }
    case 'plainText':
      return content.value;
    case 'summary':
      return (
        <ContentEditable key={key} articleId={data?.id} lockedBy={data?.sys?.lockedBy}>
          <div key={key} data-type="summary" {...buildAttributes(content)}>
            {content.elements.map(elem => renderContent(elem, data))}
          </div>
        </ContentEditable>
      );
    case 'inline-media-group':
      return <Figure key={key} data={content} alt="/public/file.svg" {...content.attributes} format={'Wide'} />;
    case 'anchor':
      return (
        <Link {...buildAttributes(content)} href={content.attributes.href} key={key} data-type="anchor">
          {content.elements.map(elem => renderContent(elem, data))}
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
          {content.elements.length > 0 && content.elements.map(elem => renderContent(elem, data))}
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

function convertStyleToObject(value: string): React.CSSProperties {
  return value.split(';').reduce((styleObj: React.CSSProperties, styleProp) => {
    const [property, val] = styleProp.split(':');
    if (property && val) {
      // Convert kebab-case to camelCase
      const camelCaseProp = property.trim().replace(/-([a-z])/g, (_, char) => char.toUpperCase());
      styleObj[camelCaseProp as keyof React.CSSProperties] = val.trim() as any;
    }
    return styleObj;
  }, {});
}

export const getPublicationDateString = (publicationTime: string) => {
  const date = new Date(publicationTime);
  return `${date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })} - ${date.toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
  })}`;
};
