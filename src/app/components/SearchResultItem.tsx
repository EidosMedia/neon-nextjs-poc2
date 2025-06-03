import Link from 'next/link';
import ArticleOverlay from './base/ArticleOverlay';
import ErrorBoundaryContainer from './base/ErrorBoundaryContainer/ErrorBoundaryContainer';
import { Key } from 'react';

type SearchResultItemProps = {
  result: any;
  data: any;
  index: number;
  onChangeSelected: (id: string, nodeId: string, title: string) => (event: React.ChangeEvent<HTMLInputElement>) => void;
};

const getDimensionsFromUrl = (url: string): { width: number; height: number } | null => {
  const match = url.match(/:(\d+)x(\d+):/);
  if (match) {
    const width = parseInt(match[1], 10);
    const height = parseInt(match[2], 10);
    return { width, height };
  }
  return null;
};

const convertToDateString = (dateString: string) => {
  return new Date(dateString)
    .toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
    .replace(/^(\d{1,2})/, d => {
      const n = parseInt(d, 10);
      const suffix =
        n === 1 || n === 21 || n === 31 ? 'st' : n === 2 || n === 22 ? 'nd' : n === 3 || n === 23 ? 'rd' : 'th';
      return `${n}${suffix}`;
    });
};

const SearchResultItem = ({ result, data, onChangeSelected, index }: SearchResultItemProps) => {
  var title, summary;
  if (result.nodeData.attributes?.teaser?.title) {
    title = result.nodeData.attributes.teaser.title;
  } else {
    title = result.nodeData.title;
  }
  if (result.nodeData.attributes?.teaser?.summary) {
    summary = result.nodeData.attributes.teaser.summary;
  } else {
    summary = result.nodeData.summary;
  }

  const dimensions =
    result.nodeData.links?.system?.mainPicture[0]?.dynamicCropsResourceUrls.Wide_small &&
    getDimensionsFromUrl(result.nodeData.links?.system?.mainPicture[0]?.dynamicCropsResourceUrls.Wide_small);

  return (
    <div key={result.nodeData.id} className="grid grid-cols-1 md:grid-cols-1 gap-2">
      <div className="col-span-1 relative group">
        <div className="absolute top-2 left-[-30] z-10">
          <input
            type="checkbox"
            id="sel{index}"
            onChange={onChangeSelected(`sel${index}`, result.nodeData.id, title)}
            defaultChecked={true}
          />
        </div>
        <ArticleOverlay data={data.root} viewStatus={data.viewStatus}>
          <ErrorBoundaryContainer>
            <Link className="no-underline" href={result.nodeData.url}>
              <div className="text-left grid grid-cols-12 h-[250px] gap-4">
                <div
                  id={`item${index}`}
                  className="col-span-6 flex flex-col gap-2 relative"
                  style={{ maxHeight: '200px', overflow: 'hidden' }}
                  ref={el => {
                    if (el && el.scrollHeight > el.clientHeight && !el.dataset.showMoreInitialized) {
                      el.dataset.showMoreInitialized = 'true';
                      const btn = document.createElement('button');
                      btn.textContent = 'Show more';
                      btn.className = 'absolute bottom-0 right-0 bg-white px-2 py-1 text-blue-600 underline';
                      btn.onclick = () => {
                        el.style.maxHeight = 'none';
                        btn.remove();
                      };
                      el.appendChild(btn);
                    }
                  }}
                >
                  <h4>{convertToDateString(result.nodeData.pubInfo.publicationTime)}</h4>
                  <h3>
                    <span dangerouslySetInnerHTML={{ __html: title }} />
                  </h3>
                  {result.highlights && result.highlights['_full_text.content.all'] ? (
                    result.highlights['_full_text.content.all'].map(
                      (reference: string, idx: Key | null | undefined) => (
                        <p key={idx} className="text-italic">
                          ...
                          <span dangerouslySetInnerHTML={{ __html: reference.replaceAll('\n', ' ') }} />
                          ...
                        </p>
                      )
                    )
                  ) : (
                    <p />
                  )}
                </div>
                <div id={`photo${index}`} className="col-span-6">
                  <img
                    alt="/static/img/nothumb.jpeg"
                    decoding="async"
                    data-nimg="1"
                    src={
                      result.nodeData.links?.system?.mainPicture[0]?.dynamicCropsResourceUrls.Wide_small ||
                      '/static/img/nothumb.jpeg'
                    }
                    className="h-[250px] object-cover justify-self-end"
                    style={{ color: 'transparent' }}
                  />
                </div>
              </div>
            </Link>
          </ErrorBoundaryContainer>
        </ArticleOverlay>
      </div>
    </div>
  );
};

export default SearchResultItem;
