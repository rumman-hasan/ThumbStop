import { getSite } from "@/lib/data";
import { whatsappLink } from "@/lib/whatsapp";

export async function WhatsAppButton() {
  const s = await getSite();
  return (
    <a
      href={whatsappLink(undefined, s.whatsappNumber)}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with ThumbStop on WhatsApp"
      className="fixed bottom-5 right-5 z-50 inline-flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition-transform hover:scale-105"
    >
      <svg width="28" height="28" viewBox="0 0 32 32" fill="currentColor" aria-hidden="true">
        <path d="M16.04 3C9.4 3 4 8.4 4 15.04c0 2.12.55 4.18 1.6 6L4 29l8.14-1.56a12 12 0 0 0 3.9.64h.01C22.7 28.08 28 22.68 28 16.04 28 9.4 22.7 3 16.04 3zm0 22.06c-1.2 0-2.38-.32-3.4-.92l-.24-.14-4.83.93.96-4.7-.16-.25a9.9 9.9 0 0 1-1.52-5.28c0-5.5 4.48-9.98 9.99-9.98 5.5 0 9.98 4.48 9.98 9.98 0 5.5-4.48 9.98-9.98 9.98zm5.47-7.47c-.3-.15-1.77-.87-2.04-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.27-.47-2.42-1.5-.9-.8-1.5-1.78-1.67-2.08-.17-.3-.02-.46.13-.61.14-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.48 0 1.46 1.07 2.88 1.22 3.08.15.2 2.1 3.2 5.08 4.49.71.3 1.27.49 1.7.63.72.23 1.37.2 1.88.12.57-.08 1.77-.72 2.02-1.42.25-.7.25-1.3.17-1.42-.07-.13-.27-.2-.57-.35z" />
      </svg>
    </a>
  );
}
