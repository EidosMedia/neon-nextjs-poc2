import React from 'react';
import { ArticleModel } from '@/types/models';
import { ContentElement, PageData } from '@eidosmedia/neon-frontoffice-ts-sdk';
import Navbar from '../components/Navbar';
import { renderContent, findElementsInContentJson } from '@/utilities/content';
import Grouphead from '../components/contentElements/Grouphead';
import MainImage from '../components/contentElements/MainImage';
import PromotionButton from '../components/PromotionButton';

type PageProps = {
  data: PageData<ArticleModel>;
};

const Article: React.FC<PageProps> = ({ data }) => {
  const articleData = data.model.data;

  return (
    <article className="container mx-auto">
      <Navbar data={data}></Navbar>
      <Grouphead data={articleData} />
      <MainImage data={articleData} />
      <div className="mt-5">
        {renderContent(findElementsInContentJson(['summary'], articleData.files.content.data)[0], articleData)}
        {renderContent(findElementsInContentJson(['byline'], articleData.files.content.data)[0])}
      </div>
      <div className="mt-5">
        {renderContent(findElementsInContentJson(['text'], articleData.files.content.data)[0])}
      </div>
      <PromotionButton data={articleData} viewStatus={data.siteData.viewStatus} />
    </article>
  );
};

export default Article;
