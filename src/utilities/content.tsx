import Figure from '@/app/components/contentElements/Figure';
import { ContentElement } from '@eidosmedia/neon-frontoffice-ts-sdk';
import { JSX, ReactNode } from 'react';

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
  return Object.fromEntries(Object.entries(node.attributes).map(([key, value]) => [`data-${key}`, value]));
};

export const renderContent = (content: ContentElement): ReactNode => {
  const key = content?.attributes?.id || new Date().toDateString();

  switch (content.nodeType) {
    case 'headline':
      return (
        <h1 key={key} {...buildAttributes(content)}>
          {content.elements.map(elem => renderContent(elem))}
        </h1>
      );
    case 'overhead':
      return (
        <h6 key={key} {...buildAttributes(content)}>
          {content.elements.map(elem => renderContent(elem))}
        </h6>
      );
    case 'grouphead':
      return (
        <div key={key} {...buildAttributes(content)}>
          {content.elements.map(elem => renderContent(elem))}
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
        <div key={key} data-type="summary" {...buildAttributes(content)}>
          {content.elements.map(elem => renderContent(elem))}
        </div>
      );
    case 'inline-media-group':
      return <Figure key={key} data={content} alt="/public/file.svg" {...content.attributes} format="Portrait" />;
    default:
      const CustomElement = content.nodeType as keyof JSX.IntrinsicElements; // resolving the element name from the template as default

      return (
        <CustomElement key={key} {...buildAttributes(content)}>
          {content.elements.map(elem => renderContent(elem))}
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
