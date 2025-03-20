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
  const key = content?.attributes?.id || new Date().toDateString();

  switch (content.nodeType) {
    case 'headline':
      return <h2 key={key}>{findText(content)}</h2>;
    case 'overhead':
      return <h6 key={key}>{findText(content)}</h6>;
    case 'summary':
    case 'subhead':
      return <h5 key={key}>{findText(content)}</h5>;
    case 'plainText':
      return <p key={key}>{content.value}</p>;
    case 'inline-media-group':
      return <Figure key={key} data={content} alt="/public/file.svg" />;
    default:
      return (
        <div key={key} {...buildAttributes(content)}>
          {content.elements.map((elem) => renderContent(elem))}
        </div>
      );
  }
};
