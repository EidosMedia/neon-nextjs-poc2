import Figure from '@/app/components/contentElements/Figure';
import { ContentElement } from '@eidosmedia/neon-frontoffice-ts-sdk';
import { ReactNode } from 'react';

/**
 *
 * @param elementNames
 * @param json
 */
export function findElementsInContentJson(
  elementNames: string | string[],
  json: ContentElement
): ContentElement[] {
  if (
    (Array.isArray(elementNames) && elementNames.includes(json?.nodeType)) ||
    elementNames === json?.nodeType
  ) {
    return [json];
  }
  if (json?.elements) {
    return json.elements.reduce(
      (acc: ContentElement[], elem: ContentElement) => [
        ...acc,
        ...findElementsInContentJson(elementNames, elem),
      ],
      []
    );
  }
  return [];
}

export const findText = (node: ContentElement): ReactNode => {
  if (node.nodeType === 'plainText') {
    return node.value;
  }
  return node.elements.map((elem) => findText(elem)).join('');
};

export const buildAttributes = (
  node: ContentElement
): Record<string, string> => {
  // add data- prefix to every attribute
  return Object.fromEntries(
    Object.entries(node.attributes).map(([key, value]) => [
      `data-${key}`,
      value,
    ])
  );
};

export const renderContent = (content: ContentElement): ReactNode => {
  switch (content.nodeType) {
    case 'headline':
      return <h2 key={content.attributes.id}>{findText(content)}</h2>;
    case 'overhead':
      return <h6>{findText(content)}</h6>;
    case 'summary':
    case 'subhead':
      return <h5>{findText(content)}</h5>;
    case 'plainText':
      return <p>{content.value}</p>;
    case 'inline-media-group':
      console.log('web-image-group', content);
      return (
        <Figure
          key={content.attributes.id || new Date().toDateString()}
          data={content}
          alt="/public/file.svg"
        />
      );
    default:
      return (
        <div
          key={content.attributes.id || new Date().toDateString()}
          {...buildAttributes(content)}
        >
          {content.elements.map((elem) => renderContent(elem))}
        </div>
      );
  }
};
