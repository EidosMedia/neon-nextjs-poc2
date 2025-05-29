import { ArticleModel } from '@/types/models';
import { findElementsInContentJson, renderContent } from '@/utilities/content';
import { Link2, Bookmark, Share } from 'lucide-react';
import { Button } from '../baseComponents/button';

type GroupheadProps = {
  data: ArticleModel;
};

const Grouphead: React.FC<GroupheadProps> = ({ data }) => {
  const publicationTime = data?.pubInfo?.publicationTime;
  return (
    <div className="flex flex-col gap-4 mb-8">
      {/* OVERHEAD & TITLE */}
      {renderContent(
        findElementsInContentJson(['grouphead'], data.files.content.data)[0],
        data,
        undefined,
        'flex flex-col gap-4'
      )}
      {/* SUMMARY */}
      {renderContent(findElementsInContentJson(['summary'], data.files.content.data)[0], data)}
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          {/* AUTHOR */}
          <span className="author-medium font-semibold whitespace-pre">By </span>
          {renderContent(
            findElementsInContentJson(['byline'], data.files.content.data)[0],
            data,
            undefined,
            'author-medium [&>p]:font-semibold'
          )}
          {/* DATE */}
          <span className="author-medium font-semibold whitespace-pre">
            {' '}
            |{' '}
            {new Date(publicationTime)
              .toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
              .replace(/(\d+)(?=,)/, match => `${match}th`)}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {/* ICONS */}
          <Button variant="ghost">
            <Share className="w-4 h-4" />
          </Button>
          <Button variant="ghost">
            <Bookmark className="w-4 h-4" />
          </Button>
          <Button variant="ghost">
            <Link2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Grouphead;
