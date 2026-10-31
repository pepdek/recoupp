// Public contact details. Until you set these env vars the site shows visible placeholders (never a personal address).
export const SUPPORT_EMAIL = process.env.NEXT_PUBLIC_SUPPORT_EMAIL ?? "";
export const PHONE = process.env.NEXT_PUBLIC_CONTACT_PHONE ?? "";
export const ADDRESS = process.env.NEXT_PUBLIC_CONTACT_ADDRESS ?? "";
export const telHref = (p: string) => `tel:${p.replace(/[^\d+]/g, "")}`;
