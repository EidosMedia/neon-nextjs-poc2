import type { Site } from '@eidosmedia/neon-frontoffice-ts-sdk';
import PageShell from '../chrome/PageShell';
import LoginForm from '../../components/LoginForm';

/** Web-user login: the legacy LoginForm inside the v2 frame. */
export default function LoginPage({ data }: { data: Site }) {
  return (
    <PageShell site={data}>
      <div className="v2-container v2-special v2-special--login">
        <LoginForm />
      </div>
    </PageShell>
  );
}
