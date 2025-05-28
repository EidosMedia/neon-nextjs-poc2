import Link from 'next/link';
import ArticleOverlay from '../../ArticleOverlay';
import MainImage from '@/app/components/contentElements/MainImage';

type ArticleOrganismProps = {
  data: any; // Adjust type as needed
  linkedObject: any; // Adjust type as needed
  linkedObjects: any; // Adjust type as needed
  index: number;
  type: string;
};

const ArticleOrganism: React.FC<ArticleOrganismProps> = ({ data, linkedObject, linkedObjects, index, type }) => {
  const TitleComponent = type === 'article-xl' ? 'h1' : 'h2';

  console.log('ArticleOrganism data:', data);

  return (
    <ArticleOverlay data={linkedObject} viewStatus={data.siteData.viewStatus} width="max" data-type={type}>
      <Link className="no-underline" href={linkedObjects[`${index}`].url}>
        <div className="p-4 grid grid-cols-12">
          <div className="flex flex-col col-span-5">
            <span className="mt-2"></span>
            <TitleComponent className="mt-2 ">{linkedObject.title}</TitleComponent>
            <span className="mt-2">{linkedObject.summary}</span>
            <span className="mt-2">{linkedObject.author}</span>
          </div>
          <div className="col-span-7 flex justify-end items-end">
            <MainImage data={linkedObject} format="Wide_small" hideCaptions />
          </div>
        </div>
      </Link>
    </ArticleOverlay>
  );
};

export default ArticleOrganism;
