// URL-friendly path for a product page, e.g. /product/289/mama-sitas-annatto-powder-achuete-10g.
// Only the numeric id is used to look the product up - the slug is for readable, shareable links
// (and search engines), so a renamed product keeps working under its old URL.
export function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

export function productPath(id: string | number, name: string): string {
  const slug = slugify(name);
  return slug ? `/product/${id}/${slug}` : `/product/${id}`;
}
