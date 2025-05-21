import Link from 'next/link';
import { BaseModel, PageData, Site} from '@eidosmedia/neon-frontoffice-ts-sdk';
import clsx from 'clsx';



export default function Navbarsite( { data }: { data: Site } ) {

  return (
    <nav className="w-full h-20 bg-white sticky top-0">
      <div className="container mx-auto px-4 h-full">
        <div className="flex justify-center items-center h-full">
          <Link className="flex items-center" href="/">
            <img src={data.logoUrl} alt={''} style={{ height: '80px' }} />
          </Link>
          <ul className="hidden md:flex gap-x-6">
            {data.root.items.map(item => (
              <li key={item.id}>
                <Link href={item.path} className={clsx(false && 'text-blue-500')}>
                  <span className="text-lg">{item.title}</span>
                </Link>
              </li>
            ))}
            <li>
              <Link href="/search">
                <span className="text-lg">🔍 Search</span>
              </Link>
            </li>
            <li>
              <Link href="/about">
                <span className="text-lg">ℹ️ About</span>
              </Link>
            </li>
          </ul>
          <button />
        </div>
      </div>
    </nav>
  );
}
