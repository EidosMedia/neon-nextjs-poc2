import type { Site } from '@eidosmedia/neon-frontoffice-ts-sdk';
import PageShell from '../chrome/PageShell';
import LoginForm from '../special/LoginForm';

/** Web-user login: the v2 LoginForm (same endpoint and webauth flow as the legacy form) inside the v2 frame. */
export default function LoginPage({ data }: { data: Site }) {
  return (
    <PageShell site={data}>
      <div className="v2-container v2-special v2-special--login">
        <LoginForm />
      </div>
    </PageShell>
  );
}
