/**
 * Tiny event bus so any CTA (nav, hero, resolution) can open the contact
 * drawer without prop-drilling through the act tree.
 */

export const ENQUIRY_EVENT = "codera:enquiry"

export function openEnquiry() {
  window.dispatchEvent(new CustomEvent(ENQUIRY_EVENT))
}
