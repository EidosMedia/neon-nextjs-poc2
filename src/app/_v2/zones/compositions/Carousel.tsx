import type { Cell } from './types';
import CarouselFrame from './CarouselFrame';

/** Horizontal track of the zone items; the slides stay server-rendered, the frame adds autoplay and dots. */
export default function Carousel({ cells, autoplay, dots }: { cells: Cell[]; autoplay: boolean; dots: boolean }) {
  return (
    <CarouselFrame autoplay={autoplay} dots={dots}>
      <div className="v2-comp v2-comp--carousel" data-carousel-track>
        {cells.map((c) => <div key={c.key} className="v2-comp__cell v2-comp__slide">{c.el}</div>)}
      </div>
    </CarouselFrame>
  );
}
