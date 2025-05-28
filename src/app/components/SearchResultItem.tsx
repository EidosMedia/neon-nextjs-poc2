import Link from 'next/link';
import ArticleOverlay from './base/ArticleOverlay';
import ErrorBoundaryContainer from './base/ErrorBoundaryContainer/ErrorBoundaryContainer';

const SearchResultItem = ({ result, data }) => {
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

  return (
    <ArticleOverlay data={data.root} viewStatus={data.viewStatus}>
      <ErrorBoundaryContainer>
        <Link className="no-underline" href={result.nodeData.url}>
          <div className="p-4 flex text-left">
            <div id="photo{index}" className="mr-4">
              <img
                alt="/static/img/nothumb.jpeg"
                width="200"
                height="200"
                decoding="async"
                data-nimg="1"
                src={result.nodeData.links?.system?.mainPicture[0]?.dynamicCropsResourceUrls.Portrait_small}
                className="w-48 h-48 object-cover"
                style={{ color: 'transparent' }}
              />
            </div>
            <div id="item{index}" className="flex-1">
              <h6 className="text-xl font-semibold">
                <span dangerouslySetInnerHTML={{ __html: title }} />
              </h6>
              <p className="text-base">
                <span dangerouslySetInnerHTML={{ __html: summary }} />
              </p>
              {result.highlights && result.highlights['_full_text.content.all'] ? (
                result.highlights['_full_text.content.all'].map((reference, idx) => (
                  <p key={idx}>
                    ...
                    <span dangerouslySetInnerHTML={{ __html: reference.replaceAll('\n', ' ') }} />
                    ...
                  </p>
                ))
              ) : (
                <p />
              )}
            </div>
          </div>
        </Link>
      </ErrorBoundaryContainer>
    </ArticleOverlay>
  );
};

export default SearchResultItem;
