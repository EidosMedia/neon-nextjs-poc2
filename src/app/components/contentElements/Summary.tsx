import { ArticleModel } from '@/types/models';
import { findElementsInContentJson, renderContent } from '@/utilities/content';

type SummaryProps = {
  data: ArticleModel;
};

const Summary: React.FC<SummaryProps> = ({ data }) => {
  const summaryContent = findElementsInContentJson(['summary'], data.files.content.data)[0];

  if (!summaryContent) {
    return null;
  }

  return (
    <div className="summary-container mb-8 pb-8 border-b border-gray-200">
      <div className="leading-relaxed text-gray-700">
        {renderContent(summaryContent, data, undefined, 'text-2xl')}
      </div>
    </div>
  );
};

export default Summary;
