export const siteHref = (path = "/") => `/review/site${path.startsWith("/") ? path : "/" + path}`;
