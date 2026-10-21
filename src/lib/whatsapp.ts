import { site } from "./site-config";

/** Official WhatsApp click-to-chat link with a prefilled message. */
export function whatsappLink(message?: string, number: string = site.whatsappNumber): string {
  const text = message ?? "Hello ThumbStop, I would like to know more about your services.";
  return `https://wa.me/${number}?text=${encodeURIComponent(text)}`;
}
