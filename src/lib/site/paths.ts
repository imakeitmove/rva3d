// Previous private-candidate navigation prefixed every buyer URL with /review/site.
// export const siteHref = (path = "/") => `/review/site${path.startsWith("/") ? path : "/" + path}`;
export const siteHref = (path = "/") =>
  path.startsWith("/") ? path : `/${path}`;
