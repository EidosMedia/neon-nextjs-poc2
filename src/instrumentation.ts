import { getConnection } from './services/utils';

export async function register() {
  // get the version from Neon, check if the version is compatible. Check the beginning for version compatibility start with NEON-{YEAR}.{MONTH}.
  // Compatible versions should be put in the code
  // fetch the sites to populate fetch
  // if there is connection error or something about one of the above tasks throw an error and NextJS will not start.
  // Object.assign(globalThis, { connection: getConnection(), test: 'test' });
}

// if a site not found the cache should be invalidated
// keep the latest sites list in the globalThis object as fallback

// Those properties should be passed to the client

// cache-control:
// max-age=360000, s-maxage=360000
// etag:
// "Cobalt-1551134078"

// last-modified:
// Mon, 02 Sep 2024 09:58:37 GMT

// neon-frontoffice-ts
// develop
