import type { BaseModel, PageData, WebpageNodeModel } from '@eidosmedia/neon-frontoffice-ts-sdk';
import PageShell from '../chrome/PageShell';
import ZoneRenderer from '../zones/ZoneRenderer';
import { AuthorContacts } from '../leaves/AuthorComponent';
import { renderInline } from '../zones/ZoneTitle';
import { resolveAuthorView, type AuthorNodeModel } from '@/lib/authors';

type PageProps = { data: PageData<BaseModel> };

type NodeWithSys = AuthorNodeModel & { sys?: { baseType?: string } };

/**
 * The page of an Author (NEON-2778): the Author is the first child of the page model, followed by the content that
 * mentions it. The legacy page of a free text author has no Author node and lists the content only.
 */
function AuthorPage({ data }: PageProps) {
  const children = data.model.data.children ?? [];
  const nodes = children
    .map(id => data.model.nodes[id] as unknown as NodeWithSys | undefined)
    .filter((n): n is NodeWithSys => Boolean(n));
  const authorNode = nodes.find(n => n.sys?.baseType === 'author');
  const items = nodes.filter(n => n !== authorNode) as unknown as WebpageNodeModel[];
  const view = resolveAuthorView(authorNode);

  return (
    <PageShell data={data}>
      <div className="v2-container">
        {view && (
          <header className="v2-author-page__head" data-testid="author-page-head">
            <h1 className="v2-author-page__name">{view.name}</h1>
            {view.nickName && <p className="v2-author-page__nick">{renderInline(view.nickName)}</p>}
            {view.summary && <p className="v2-author-page__summary">{view.summary}</p>}
            <AuthorContacts contacts={view.contacts} />
          </header>
        )}
        {items.length > 0 ? (
          <ZoneRenderer data={data} items={items} composition="datedListing" />
        ) : (
          view && <p className="v2-author-page__empty">No content yet.</p>
        )}
      </div>
    </PageShell>
  );
}

export default AuthorPage;
