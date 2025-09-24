// Frontend mirror of backend normalization (subset)
export function normalizeWebsiteFrontend(raw) {
  if (raw === undefined || raw === null) return undefined;
  let value = String(raw).trim();
  if (value === '') return '';
  if (!/^https?:\/\//i.test(value)) value = 'https://' + value;
  let url;
  try { url = new URL(value); } catch { throw new Error('Invalid website URL'); }
  if (!/^https?:$/i.test(url.protocol)) throw new Error('Website URL must use http or https');
  url.hostname = url.hostname.toLowerCase();
  if ((url.protocol === 'https:' && url.port === '443') || (url.protocol === 'http:' && url.port === '80')) url.port = '';
  if (url.pathname !== '/' && url.pathname.endsWith('/')) {
    url.pathname = url.pathname.replace(/\/+$/, '');
    if (url.pathname === '') url.pathname = '/';
  }
  url.hash = '';
  url.search = '';
  return url.toString();
}
