import { ArticleModel } from '@/types/models';
import { findElementsInContentJson, renderContent } from '@/utilities/content';

type GroupheadProps = {
  data: ArticleModel;
};

const Grouphead: React.FC<GroupheadProps> = ({ data }) => {
  return (
    <div className="justify-center">
      {renderContent(
        findElementsInContentJson(['grouphead'], data.files.content.data)[0]
      )}
      {/* <p>{data.description}</p> */}
    </div>
  );
};

export default Grouphead;
