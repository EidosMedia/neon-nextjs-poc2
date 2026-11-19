import type { PageData } from '@eidosmedia/neon-frontoffice-ts-sdk';
import type { ArticleModel } from '@/types/models';
import { findElementsInContentJson } from '@/utilities/content';
import { getActiveTheme } from '@/lib/accessories/defaultThemeAccessories';
import { getBrand } from '../brands/registry';
import PageShell from '../chrome/PageShell';
import { extractGalleryImages, planAdSlots, withoutAdblocks, withoutGalleries } from '../lib/leafView';
import { getPageSettings, V2_DEFAULTS } from '../lib/settings';
import AdSlot from '../leaves/AdSlot';
import LeafBody from '../leaves/LeafBody';
import LeafHeader from '../leaves/LeafHeader';
import LeafLayout from '../leaves/LeafLayout';
import { loadContent } from '../leaves/loadContent';

type Image = ReturnType<typeof extractGalleryImages>[number];
type PageProps = { data: PageData<ArticleModel> };

const slideId = (i: number) => `v2-slide-${i}`;

/** Anchor-based slider: legacy `.media-gallery-slider/-slides` scroll-snap markup, no client JS. */
function Slider({ images, captions, thumbnails }: { images: Image[]; captions: boolean; thumbnails: boolean }) {
  if (images.length === 0) return null;
  return (
    <div className="v2-gallery">
      <div className="media-gallery-slider v2-gallery__slider" data-type="mediagallery">
        <div className="media-gallery-slides v2-gallery__slides">
          {images.map((img, i) => (
            <figure key={i} id={slideId(i)} className="v2-gallery__slide">
              <img src={img.src} alt={img.caption ?? ''} loading={i === 0 ? 'eager' : 'lazy'} />
              {captions && (img.caption || img.credit) && (
                <figcaption className="v2-gallery__caption">
                  {img.caption}
                  {img.credit && <span className="v2-gallery__credit">{img.credit}</span>}
                </figcaption>
              )}
            </figure>
          ))}
        </div>
      </div>
      {thumbnails && images.length > 1 && (
        <nav className="v2-gallery__thumbs" aria-label="Gallery thumbnails">
          {images.map((img, i) => (
            <a key={i} href={`#${slideId(i)}`} className="v2-gallery__thumb" aria-label={`Photo ${i + 1} of ${images.length}`}>
              <img src={img.src} alt="" loading="lazy" />
            </a>
          ))}
        </nav>
      )}
    </div>
  );
}

function Frames({ images, captions }: { images: Image[]; captions: boolean }) {
  return (
    <div className="v2-essay__frames">
      {images.map((img, i) => (
        <figure key={i} className="v2-essay__frame">
          <img src={img.src} alt={img.caption ?? ''} loading="lazy" />
          {captions && (img.caption || img.credit) && (
            <figcaption className="v2-essay__caption">
              {img.caption}
              {img.credit && <span className="v2-gallery__credit">{img.credit}</span>}
            </figcaption>
          )}
        </figure>
      ))}
    </div>
  );
}

const GalleryLeaf = async ({ data }: PageProps) => {
  const article = await loadContent(data.model.data);
  const leaf = getPageSettings(data).leaf;
  const settings = leaf?.kind === 'gallery' ? leaf : V2_DEFAULTS.galleryLeaf;
  const brand = getBrand(getActiveTheme(data));
  const slots = planAdSlots(settings.adDensity, brand.leafRail);

  const images = extractGalleryImages(article.files.content.data);
  const [rawText] = findElementsInContentJson(['text'], article.files.content.data);
  // The slider is rendered here; keep it out of the body text.
  const text = rawText ? withoutAdblocks(withoutGalleries(rawText)) : undefined;
  const { variant, captions, thumbnails } = settings;

  const header = <LeafHeader article={article} hero="none" titleSize="standard" showImage={false} />;
  const body = (
    <LeafBody
      article={article}
      pageNodes={data.model.nodes}
      text={text}
      insertAfter={slots.includes('midBody') ? <AdSlot placement="midBody" /> : undefined}
    />
  );
  const tail = slots.includes('end') && <AdSlot placement="end" />;
  const afterHero = slots.includes('afterHero') && <AdSlot placement="afterHero" />;
  const rail = slots.includes('rail') ? <AdSlot placement="rail" /> : undefined;
  const railAds = rail ? 1 : 0;

  return (
    <PageShell data={data}>
      <article className={`v2-leaf-gallery v2-leaf-gallery--${variant}`} data-leaf="gallery">
        {variant === 'heroGallery' && (
          <>
            <div className="v2-container v2-leaf-gallery__intro">{header}</div>
            <div className="v2-leaf-gallery__bleed">
              <Slider images={images} captions={captions} thumbnails={thumbnails} />
            </div>
            <LeafLayout brand={brand} data={data} railAds={railAds} rail={rail}>
              {afterHero}
              {body}
              {tail}
            </LeafLayout>
          </>
        )}
        {variant === 'storyGallery' && (
          <LeafLayout brand={brand} data={data} railAds={railAds} header={header} rail={rail}>
            {afterHero}
            <Slider images={images} captions={captions} thumbnails={thumbnails} />
            {body}
            {tail}
          </LeafLayout>
        )}
        {variant === 'photoEssay' && (
          <>
            <div className="v2-container v2-leaf-gallery__intro">{header}</div>
            {images[0] && (
              <figure className="v2-essay__opener">
                <img src={images[0].src} alt={images[0].caption ?? ''} />
                {captions && images[0].caption && <figcaption className="v2-essay__caption">{images[0].caption}</figcaption>}
              </figure>
            )}
            <LeafLayout brand={brand} data={data} railAds={railAds} rail={rail}>
              {afterHero}
              {body}
              <Frames images={images.slice(1)} captions={captions} />
              {tail}
            </LeafLayout>
          </>
        )}
      </article>
    </PageShell>
  );
};

export default GalleryLeaf;
