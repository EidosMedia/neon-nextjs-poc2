export class NeonConnection {
  neonFoURL = '';
  backOfficeAccessKey = '';
  REVALIDATE_TIMEOUT = 3600;

  constructor(neonFoURL: string, backOfficeAccessKey: string) {
    this.neonFoURL = neonFoURL;
    this.backOfficeAccessKey = backOfficeAccessKey;
  }

  async getSiteViewByURL(url: string) {
    return await fetch(`${this.neonFoURL}/api/site-view?url=${url}`, {
      headers: {
        'x-neon-backend-access-key': this.backOfficeAccessKey,
      },
    });
  }

  async getSitesList() {
    const req = await fetch(`${process.env.BASE_NEON_FE_URL}/api/sites/live`, {
      next: {
        tags: ['sites'],
      },
    });
    const sites = await req.json();
    return sites;
  }
}
