import React from 'react';
import { ArticleModel } from '@/types/models';
import { ContentElement, PageData } from '@eidosmedia/neon-frontoffice-ts-sdk';
import Navbar from '../components/Navbar';
import { renderContent, findElementsInContentJson } from '@/utilities/content';
import Grouphead from '../components/contentElements/Grouphead';
import MainImage from '../components/contentElements/MainImage';
import Footer from '../components/Footer';

type PageProps = {
  data: PageData<ArticleModel>;
};

const Article: React.FC<PageProps> = ({ data }) => {
  const articleData = data.model.data;

  return (
    <article className="container mx-auto">
      <Navbar data={data} />
      <div className="xl:px-52 mt-10 mb-12">
        <Grouphead data={articleData} />
        <MainImage data={articleData} />
        <div>
          {renderContent(
            findElementsInContentJson(['text'], articleData.files.content.data)[0],
            articleData,
            undefined,
            'flex flex-col gap-4'
          )}
        </div>
      </div>
      <div className="flex justify-center mb-24">
        {/* Placeholder for advertisement */}
        <img src="https://placehold.co/1200x259?text=Adv" alt="Advertisement" />
      </div>
      <Footer data={data}></Footer>
    </article>
  );
};

export default Article;
