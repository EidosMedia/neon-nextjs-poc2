import { PageData } from '@eidosmedia/neon-frontoffice-ts-sdk';
import { WebpageModel } from '@/types/models';
import Navbar from '../components/Navbar';
import { getDwxLinkedObjects } from '../../services/utils';
import Card from "../components/Card";

type PageProps = {
    data: PageData<WebpageModel>;
};

const Webpage: React.FC<PageProps> = async ({ data }) => {
  const linkedObjects = await getDwxLinkedObjects(data, 'banner');
  const linkedObjectstop = await getDwxLinkedObjects(data, 'top');

  return (
    <div className="container mx-auto">
      <Navbar data={data}></Navbar>
      {linkedObjects.map((linkedObject: any) => (
                    <div key={linkedObject.id} className="p-4">
                        <a className="no-underline" href="/news/0296-1cf7c277c316-50d53c872df6-1000/index.html">
                            <div className="p-4 bg-gray-100 rounded-lg shadow-md">
                                <div className="flex items-center space-x-2">
                                    <svg className="w-6 h-6 text-gray-500" focusable="false" aria-hidden="true" viewBox="0 0 24 24" data-testid="CircleIcon">
                                        <path d="M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2z"></path>
                                    </svg>
                                    <p className="text-base font-medium text-gray-700">BREAKING NEWS</p>
                                </div>
                                <h6 className="mt-2 text-lg font-semibold text-gray-900">{linkedObject.title}</h6>
                            </div>
                        </a>
                    </div>
                ))}
        {linkedObjectstop.map((linkedObjecttop: any) => (
            <Card
                key={linkedObjecttop.id}
                linkedObjecttop={{
                    id: linkedObjecttop.id,
                    title: linkedObjecttop.title,
                    imageUrl: "/_next/image?url=%2Fapi%2FimageProxy%3Furl%3D%2Fresources%2F0296-1cf7c24a7432-666dd5bf59a6-1000%2Fformat%2Fsmall%2Fnews.webp&amp;w=1200&amp;q=75",
                    link: "/news/0296-1cf7c25b6434-2d2b47b681fa-1000/index.html"
                }}
            />
        ))}
    </div>
  );
};

export default Webpage;

