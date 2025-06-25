import React from 'react';
import { ArticleModel } from '@/types/models';
import { PageData } from '@eidosmedia/neon-frontoffice-ts-sdk';
import Navbar from '../components/Navbar';
import { renderContent, findElementsInContentJson } from '@/utilities/content';
import Grouphead from '../components/contentElements/Grouphead';
import MainImage from '../components/contentElements/MainImage';
import LiveblogPosts from './LiveblogPosts';
import Footer from '../components/Footer';
import { CircleDot } from 'lucide-react';

type PageProps = {
  data: PageData<ArticleModel>;
};

const Liveblog: React.FC<PageProps> = ({ data }) => {
  const articleData = data.model.data;

  return (
    <article className="container mx-auto">
      <Navbar data={data} />
      <div className="xl:px-52 mt-10 mb-12">
        <div className="flex items-center gap-1 mb-4 w-fit max-h-[30px] p-2 rounded-xs bg-feedback-red text-neutral-lightest">
          <CircleDot className="w-4 h-4" />
          <span className="subhead1 pt-[3px]">Live</span>
        </div>
        <Grouphead data={articleData} />
        <MainImage data={articleData} />
        <div className="mb-8">
          {renderContent(
            findElementsInContentJson(['text'], articleData.files.content.data)[0],
            articleData,
            undefined,
            'flex flex-col gap-4'
          )}
        </div>
        <LiveblogPosts data={data} />
      </div>
      <div className="flex justify-center mb-24">
        {/* Placeholder for advertisement */}
        <img src="https://placehold.co/1200x259?text=Adv" alt="Advertisement" />
      </div>
      <Footer data={data} />
    </article>
  );
};

export default Liveblog;
