// v2 page barrel. Re-exports the legacy default pages for keys not yet swapped; explicit named exports below override the star.
export * from '../_pages';
export { default as HomeWebPage } from './pages/HomePage';
export { default as SectionWebPage } from './pages/SectionPage';
export { default as WebpageColumnsLayout } from './pages/WebPage';
export { default as DefaultSection, default as DefaultLanding } from './pages/ChildrenPage';
export { default as UIStyleGuide } from './ui/StyleGuide';
