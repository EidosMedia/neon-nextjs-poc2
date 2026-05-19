import React from 'react';
import { ArticleModel } from '@/types/models';
import { PageData } from '@eidosmedia/neon-frontoffice-ts-sdk';
import Navbar from '../components/Navbar';
import { renderContent, findElementsInContentJson, findCustomComponentNodes } from '@/utilities/content';
import Grouphead from '../components/contentElements/Grouphead';
import MainImage from '../components/contentElements/MainImage';
import LiveblogPosts from './LiveblogPosts';
import Footer from '../components/Footer';
import { CircleDot } from 'lucide-react';
import { resolveServerComponent } from '@/services/uiComponentsServerLoader';

type PageProps = {
  data: PageData<ArticleModel>;
};

const Liveblog = async ({ data }: PageProps) => {
  const articleData = data.model.data;

  const textContent = findElementsInContentJson(['text'], articleData.files.content.data)[0];

  // Pre-resolve custom components server-side so renderContent can render them
  // without any client-side JS.
  const customComponents = new Map<string, React.ComponentType<Record<string, unknown>>>();
  const customNodes = findCustomComponentNodes(
    textContent ?? { nodeType: '', elements: [], attributes: {}, value: '' },
  );
  await Promise.all(
    [...new Set(customNodes.map(n => n.attributes?.componentname).filter(Boolean))].map(async name => {
      const Comp = (await resolveServerComponent('editor', name)) as React.ComponentType<
        Record<string, unknown>
      > | null;
      if (Comp) customComponents.set(name, Comp);
    }),
  );

  return (
    <article className="container mx-auto">
      <Navbar data={data} />
      <div className="xl:px-52 mt-10 mb-12">
        <div className="flex items-center gap-1 mb-4 w-fit max-h-[30px] p-2 rounded-xs bg-feedback-red text-neutral-lightest">
          <CircleDot className="w-4 h-4" />
          <span className="subhead1 pt-[3px]">Live</span>
        </div>
        <Grouphead data={articleData} />
        <MainImage data={articleData} preferredImage="main" />
        <div className="mb-8">
          {renderContent(textContent, articleData, undefined, 'flex flex-col gap-4', customComponents)}
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
