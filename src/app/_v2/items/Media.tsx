type Props = { url?: string; ratio: '16-9' | '3-2' | '4-5' | 'circle'; alt?: string };

export default function Media({ url, ratio, alt = '' }: Props) {
  if (!url) return null;
  return (
    <div className={`v2-item__media v2-item__media--${ratio}`}>
      <img src={url} alt={alt} loading="lazy" />
    </div>
  );
}
