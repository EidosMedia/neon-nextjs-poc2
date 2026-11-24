type Props = { loading: boolean; variant?: 'timeline' | 'feed' };

export default function LiveblogPostsStatus({ loading, variant = 'timeline' }: Props) {
  if (!loading) return <p role="status">Unable to load live blog posts. Retrying shortly.</p>;

  return (
    <div className={`liveblog-skeleton liveblog-skeleton--${variant}`} role="status" aria-label="Loading live blog posts" aria-busy="true">
      <div aria-hidden="true">
        {[0, 1, 2].map((index) => (
          <div className="liveblog-skeleton__post" key={index}>
            <span className="liveblog-skeleton__stamp" />
            <span className="liveblog-skeleton__line" />
            {variant === 'feed' && <span className="liveblog-skeleton__line liveblog-skeleton__line--short" />}
          </div>
        ))}
      </div>
    </div>
  );
}
