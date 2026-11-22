/** One customer studio destination; no credentials or customer data in URLs. */
export const STUDIO_ORIGIN = "https://custombro-display-studio-20261111.sturdy-swan-0605.chatgpt.site";
export const STUDIO_LINKS = {
  products: `${STUDIO_ORIGIN}/products`,
  keyring: `${STUDIO_ORIGIN}/keyring`,
  display: `${STUDIO_ORIGIN}/studio`,
  consultation: `${STUDIO_ORIGIN}/start`,
  requests: `${STUDIO_ORIGIN}/account/orders`,
  guestRequests: `${STUDIO_ORIGIN}/guest-orders`,
  support: `${STUDIO_ORIGIN}/studio?view=support`,
} as const;
