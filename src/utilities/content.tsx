import Figure from '@/app/components/contentElements/Figure';
import { ContentElement, PageData } from '@eidosmedia/neon-frontoffice-ts-sdk';
import Link from 'next/link';
import { JSX, ReactNode } from 'react';
import { ArticleModel } from '@/types/models';
import ContentEditable from '@/app/components/utilities/ContentEditable';
import CustomComponent from '@/app/components/base/CustomComponentClient';

/**
 * Recursively collects all `*-component` nodes from a content tree.
 * Used by server components to pre-resolve custom components before rendering.
 */
export function findCustomComponentNodes(content: ContentElement): ContentElement[] {
  const results: ContentElement[] = [];
  if (content.nodeType?.match(/^[a-z]+-component/)) results.push(content);
  for (const child of content.elements ?? []) results.push(...findCustomComponentNodes(child));
  return results;
}

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
      [],
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

/**
 * Identifica il provider da un URL di oembed
 */
const identifyOembedProvider = (url: string): string | null => {
  if (!url) return null;

  // YouTube patterns
  if (/(?:youtube\.com|youtu\.be)/i.test(url)) {
    return 'youtube';
  }

  // Altri provider possono essere aggiunti qui
  // if (/vimeo\.com/i.test(url)) return 'vimeo';
  // if (/twitter\.com|x\.com/i.test(url)) return 'twitter';

  return null;
};

/**
 * Estrae attributi dall'HTML dell'iframe (width, height, style)
 */
const extractIframeAttributes = (
  iframeHtml: string,
): {
  width?: string;
  height?: string;
  style?: string;
} => {
  const attrs: { width?: string; height?: string; style?: string } = {};

  // Estrai width
  const widthMatch = iframeHtml.match(/width=["']?(\d+)["']?/i);
  if (widthMatch) attrs.width = widthMatch[1];

  // Estrai height
  const heightMatch = iframeHtml.match(/height=["']?(\d+)["']?/i);
  if (heightMatch) attrs.height = heightMatch[1];

  // Estrai style
  const styleMatch = iframeHtml.match(/style=["']([^"']*)["']/i);
  if (styleMatch) attrs.style = styleMatch[1];

  return attrs;
};

/**
 * Estrae video ID da URL YouTube
 */
const extractYoutubeId = (url: string): string | null => {
  const patterns = [/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/, /youtube\.com\/embed\/([^&\n?#]+)/];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }

  return null;
};

/**
 * Renderizza un blocco oembed con personalizzazioni per provider
 */
const renderOembedBlock = (content: ContentElement, key: string): ReactNode => {
  const oembedUrl = content.attributes?.oembed;
  const provider = identifyOembedProvider(oembedUrl);
  const iframeHtml = content.elements?.[0]?.value || '';
  const iframeAttrs = extractIframeAttributes(iframeHtml);

  // YouTube: rendering personalizzato
  if (provider === 'youtube') {
    const videoId = extractYoutubeId(oembedUrl);
    if (videoId) {
      const customStyle = 'aspect-ratio: 2; width: 100%; max-width: 100%; height: auto;';

      return (
        <div key={key} data-type="oembedblock" data-provider="youtube" {...buildAttributes(content)}>
          <iframe
            src={`https://www.youtube.com/embed/${videoId}?wmode=transparent`}
            allowFullScreen
            style={convertStyleToObject(customStyle)}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          />
        </div>
      );
    }
  }

  // Default: mantieni rendering originale per provider non gestiti
  return (
    <div key={key} {...buildAttributes(content)} data-type="oembedblock" data-provider={provider || 'unknown'}>
      <div dangerouslySetInnerHTML={{ __html: iframeHtml }} />
    </div>
  );
};

/**
 * Selects the first image/graphic element from the list following prioritization logic:
 * 1. First element with softcropenabled="enabled-preferred"
 * 2. First element with softcropenabled="enabled"
 * 3. First available element
 */
const selectPreferredElement = (elements: ContentElement[], nodeTypePrefix: string): ContentElement | undefined => {
  const filteredElements = elements.filter(elem => elem.nodeType.startsWith(nodeTypePrefix));

  if (filteredElements.length === 0) return undefined;

  // 1. Look for the first "enabled-preferred"
  const preferredElement = filteredElements.find(elem => elem.attributes?.softcropenabled === 'enabled-preferred');
  if (preferredElement) return preferredElement;

  // 2. Look for the first "enabled"
  const enabledElement = filteredElements.find(elem => elem.attributes?.softcropenabled === 'enabled');
  if (enabledElement) return enabledElement;

  // 3. Return the first available
  return filteredElements[0];
};

export const buildAttributes = (node: ContentElement): Record<string, any> => {
  // replace "class" with "className" and "stroke-linecap" with "strokeLinecap"
  // exclude "key" as it is a reserved React prop and must not be spread into JSX
  return Object.fromEntries(
    Object.entries(node?.attributes || {})
      .filter(([key]) => key !== 'key')
      .map(([key, value]) => [
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
      ]),
  );
};

export const renderContent = (
  content: ContentElement,
  data?: ArticleModel,
  parent?: string,
  styles?: string,
  customComponents?: Map<string, React.ComponentType<Record<string, unknown>>>,
  nodeDataMap?: Map<string, unknown>,
  index?: number,
): ReactNode => {
  // Use a stable key derived from content structure — never random — so
  // components are not remounted on every client re-render. The structural
  // fallback also folds in the sibling index to disambiguate same-shape
  // siblings (e.g. empty <p> wrappers); the attributes.id branch stays purely id-based.
  const key =
    content?.attributes?.id ||
    `${content?.nodeType}-${content?.value ?? ''}-${JSON.stringify(content?.attributes ?? {})}-${index ?? 0}`;

  switch (content?.nodeType) {
    case 'headline':
      return (
        <ContentEditable key={key} data={data}>
          <h1 key={key} data-type="headline" {...buildAttributes(content)}>
            {content.elements.map((elem, idx) =>
              renderContent(elem, data, undefined, undefined, undefined, undefined, idx),
            )}
          </h1>
        </ContentEditable>
      );
    case 'overhead':
      return (
        <ContentEditable key={key} data={data}>
          <h5 key={key} data-type="overhead" {...buildAttributes(content)} className="uppercase">
            {content.elements.map((elem, idx) =>
              renderContent(elem, data, undefined, undefined, undefined, undefined, idx),
            )}
          </h5>
        </ContentEditable>
      );
    case 'grouphead':
      return (
        <div key={key} {...buildAttributes(content)} className={styles} data-type="grouphead">
          {content.elements
            .filter(elem => elem)
            .map((elem, idx) => {
              console.log('Grouphead Element:', elem);
              return renderContent(elem, data, undefined, undefined, customComponents, nodeDataMap, idx);
            })}
        </div>
      );
    case 'byline':
      return (
        <div key={key} data-type="byline" {...buildAttributes(content)} className={styles}>
          {content.elements.map((elem, idx) =>
            renderContent(elem, data, undefined, undefined, undefined, undefined, idx),
          )}
        </div>
      );
    case 'text':
      return (
        <div id="text" key={key} {...buildAttributes(content)} className={styles} data-type="text">
          {content.elements.map((elem, idx) =>
            renderContent(elem, data, 'text', undefined, customComponents, nodeDataMap, idx),
          )}
        </div>
      );
    case 'caption':
      return (
        <figcaption key={key} {...buildAttributes(content)} className="body-large italic" data-type="caption">
          {content.elements.map((elem, idx) =>
            renderContent(elem, data, undefined, undefined, undefined, undefined, idx),
          )}
        </figcaption>
      );
    case 'credit':
      return (
        <span key={key} data-type="credit" {...buildAttributes(content)} className="body-large italic text-gray-500">
          {content.elements.map((elem, idx) =>
            renderContent(elem, data, undefined, undefined, undefined, undefined, idx),
          )}
        </span>
      );
    case 'p':
      if (parent === 'text') {
        return data?.id ? (
          <ContentEditable key={key} data={data}>
            <p key={key} {...buildAttributes(content)} className={`${styles} body-large`}>
              {content.elements.map((elem, idx) =>
                renderContent(elem, data, undefined, undefined, undefined, undefined, idx),
              )}
            </p>
          </ContentEditable>
        ) : (
          <p key={key} {...buildAttributes(content)} className={`${styles} body-large`}>
            {content.elements.map((elem, idx) =>
              renderContent(elem, data, undefined, undefined, undefined, undefined, idx),
            )}
          </p>
        );
      } else {
        return (
          <p key={key}>
            {content.elements.map((elem, idx) =>
              renderContent(elem, data, undefined, styles, undefined, undefined, idx),
            )}
          </p>
        );
      }
    case 'plainText':
      return content.value;
    case 'summary':
      return (
        <ContentEditable key={key} data={data}>
          <div key={key} data-type="summary" {...buildAttributes(content)} className={styles}>
            {content.elements.map((elem, idx) =>
              renderContent(elem, data, undefined, styles, undefined, undefined, idx),
            )}
          </div>
        </ContentEditable>
      );
    case 'inline-media-group':
      const selectedImage = selectPreferredElement(content.elements, 'image');
      const selectedGraphic = selectPreferredElement(content.elements, 'graphic');
      console.log('elements in inline-media-group:', content.elements);
      console.log('selectedImage:', selectedImage);
      console.log('selectedGraphic:', selectedGraphic);

      if (selectedImage) {
        // Create a new content object with only the selected image element
        const filteredContent = {
          ...content,
          elements: [selectedImage, ...content.elements.filter(elem => elem.nodeType === 'image-caption')],
        };
        return (
          <div key={'img-' + key} data-type="inline-media-group">
            <Figure key={key} data={filteredContent} alt="/public/file.svg" format="Wide" />
            {renderContent(content.elements.filter(elem => elem.nodeType === 'image-caption')[0], data)}
          </div>
        );
      } else if (selectedGraphic) {
        // Create a new content object with only the selected graphic element
        const filteredContent = {
          ...content,
          elements: [selectedGraphic, ...content.elements.filter(elem => elem.nodeType === 'graphic-caption')],
        };
        return (
          <div data-type="inline-media-group">
            <Figure key={key} data={filteredContent} alt="/public/file.svg" format="Wide" />
            {renderContent(content.elements.filter(elem => elem.nodeType === 'graphic-caption')[0], data)}
          </div>
        );
      }
      return <div key={key} data-type="inline-media-group" {...buildAttributes(content)} />;
    case 'anchor':
      return (
        <Link {...buildAttributes(content)} href={content.attributes.href} key={key} data-type="anchor">
          {content.elements.map((elem, idx) =>
            renderContent(elem, data, undefined, undefined, undefined, undefined, idx),
          )}
        </Link>
      );
    case 'br':
      return <br key={key} {...buildAttributes(content)} />;
    case 'image':
      return <img key={key} {...buildAttributes(content)} alt="No image available" />;

    case 'table':
      return (
        <table key={key} {...buildAttributes(content)} data-type="table" className="w-full border-collapse">
          <tbody>
            {content.elements.map((elem, idx) =>
              renderContent(elem, data, undefined, undefined, undefined, undefined, idx),
            )}
          </tbody>
        </table>
      );
    case 'tr':
      return (
        <tr key={key} {...buildAttributes(content)} className="border-b">
          {content.elements.map((elem, idx) =>
            renderContent(elem, data, undefined, undefined, undefined, undefined, idx),
          )}
        </tr>
      );
    case 'td':
      return (
        <td key={key} {...buildAttributes(content)} className="px-4 py-2">
          {content.elements.map((elem, idx) =>
            renderContent(elem, data, undefined, undefined, undefined, undefined, idx),
          )}
        </td>
      );
    case 'th':
      return (
        <th key={key} {...buildAttributes(content)} className="px-4 py-2 font-bold text-left">
          {content.elements.map((elem, idx) =>
            renderContent(elem, data, undefined, undefined, undefined, undefined, idx),
          )}
        </th>
      );
    case 'oembedblock':
      console.log('Rendering oembedblock with content:', content);
      return renderOembedBlock(content, key);
    case 'adblock':
      return (
        <div key={key} className="flex justify-center my-6" data-type="ad">
          <img src="https://placehold.co/1200x259?text=Adv" alt="Advertisement" />
        </div>
      );
    case 'mediagallery':
      // Extract all images from inline-media-group and image elements
      const slides = content.elements
        .filter(elem => elem.nodeType === 'inline-media-group' || elem.nodeType.startsWith('image'))
        .map(elem => {
          if (elem.nodeType === 'inline-media-group') {
            // Find the image element inside inline-media-group
            const imageElem = elem.elements.find(e => e.nodeType.startsWith('image'));
            const captionElem = elem.elements.find(
              e => e.nodeType === 'image-caption' || e.nodeType === 'graphic-caption',
            );
            return imageElem ? { image: imageElem, caption: captionElem || null } : null;
          } else if (elem.nodeType.startsWith('image')) {
            return { image: elem, caption: null };
          }
          return null;
        })
        .filter((slide): slide is { image: ContentElement; caption: ContentElement | null } => slide !== null);

      if (slides.length === 0) {
        return null;
      }

      return (
        <div key={key} className="media-gallery-slider" data-type="mediagallery">
          {/* Navigation dots */}
          {slides.map((_, index) => (
            <a key={`nav-${key}-${index}`} href={`#slide-${key}-${index}`} className="media-gallery-nav">
              {index + 1}
            </a>
          ))}

          {/* Slides container */}
          <div className="media-gallery-slides">
            {slides.map((slide, index) => (
              <div key={`slide-${key}-${index}`} id={`slide-${key}-${index}`} className="media-gallery-slide">
                <Figure
                  data={{ elements: [slide.image], attributes: {}, nodeType: 'inline-media-group', value: '' }}
                  alt={slide.image?.attributes?.alt || 'Gallery image'}
                  format="Wide"
                />
                {slide.caption && renderContent(slide.caption, data)}
              </div>
            ))}
          </div>
        </div>
      );

    default:
      if (content?.nodeType?.match?.(/^[a-z]+-component/)?.[0]) {
        const componentname = content.attributes?.componentname ?? '';
        const Resolved = customComponents?.get(componentname);
        const NEON_ID_RE = /(?:^|\/)([0-9a-f]{4}-[0-9a-f]{12}-[0-9a-f]{12}-\d+)(?:\/|$)/i;
        const neonEmbedId = (content.attributes?.href ?? '').match(NEON_ID_RE)?.[1];
        const model = neonEmbedId ? nodeDataMap?.get(neonEmbedId) : undefined;

        const isNavigable = content.nodeType === 'story-component' || content.nodeType === 'liveblog-component';
        const itemHref = content.attributes?.href ?? null;

        if (Resolved) {
          const raw = { ...content.attributes };
          for (const child of content.elements ?? []) {
            if (child.nodeType.endsWith('-params')) {
              for (const entry of child.elements ?? []) {
                if (entry.nodeType === 'entry' && entry.attributes?.key) {
                  raw[entry.attributes.key] = entry.attributes.value ?? '';
                }
              }
            }
          }
          const attrs: Record<string, string | number | boolean> = {};
          for (const [k, v] of Object.entries(raw)) {
            if (v === 'true') attrs[k] = true;
            else if (v === 'false') attrs[k] = false;
            else if (v !== '' && !Number.isNaN(Number(v))) attrs[k] = Number(v);
            else attrs[k] = v;
          }

          const resolved = (
            <Resolved
              key={key}
              attributes={attrs}
              content={content as Record<string, unknown>}
              nodeType={content.nodeType}
              {...(model !== undefined ? { model } : {})}
            />
          );
          return isNavigable && itemHref ? (
            <Link key={key} href={itemHref}>
              {resolved}
            </Link>
          ) : (
            resolved
          );
        }
        const customComponent = (
          <CustomComponent
            key={key}
            nodeType={content.nodeType}
            content={content}
            componentname={componentname}
            model={model}
          />
        );
        return isNavigable && itemHref ? (
          <Link key={key} href={itemHref}>
            {customComponent}
          </Link>
        ) : (
          customComponent
        );
      }
      const CustomElement = content?.nodeType as keyof JSX.IntrinsicElements; // resolving the element name from the template as default
      return CustomElement ? (
        <CustomElement key={key} {...buildAttributes(content)}>
          {content.elements.length > 0 &&
            content.elements.map((elem, idx) =>
              renderContent(elem, data, undefined, undefined, undefined, undefined, idx),
            )}
        </CustomElement>
      ) : null;
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
