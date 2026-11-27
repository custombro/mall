/** Canonical Studio destinations; public mall links first check customer access. */
export const STUDIO_ORIGIN = "https://custombro-display-studio-20261111.sturdy-swan-0605.chatgpt.site";

export const STUDIO_DESTINATIONS = {
  products: "/products",
  keyring: "/keyring",
  display: "/studio",
  consultation: "/start",
  requests: "/account/orders",
  guestRequests: "/guest-orders",
  support: "/studio?view=support",
} as const;

/**
 * Same existing public mall, no extra order writer or customer session.
 * The Pages navigation gate only forwards when Studio accepts public visitors.
 */
export const STUDIO_LINKS = {
  products: "/studio-entry?to=products",
  keyring: "/studio-entry?to=keyring",
  display: "/studio-entry?to=display",
  consultation: "/studio-entry?to=consultation",
  requests: "/studio-entry?to=requests",
  guestRequests: "/studio-entry?to=guestRequests",
  support: "/studio-entry?to=support",
} as const;
