import React from "react";
import { SITE_EMAIL_LINK, SITE_WHATSAPP_LINK } from "../data/siteContact";

const WhatsAppIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true" className="fill-current h-7 w-7">
    <path d="M20.52 3.48A11.8 11.8 0 0 0 12.1 0C5.52 0 .16 5.36.16 11.94c0 2.1.55 4.15 1.59 5.95L0 24l6.29-1.65a11.87 11.87 0 0 0 5.8 1.48h.01c6.58 0 11.94-5.36 11.94-11.94 0-3.19-1.24-6.19-3.52-8.41ZM12.1 21.8h-.01a9.83 9.83 0 0 1-5.01-1.37l-.36-.21-3.73.98 1-3.64-.24-.38a9.87 9.87 0 0 1-1.51-5.24c0-5.45 4.43-9.89 9.88-9.89 2.64 0 5.12 1.03 6.98 2.9a9.8 9.8 0 0 1 2.9 6.98c0 5.45-4.44 9.88-9.89 9.88Zm5.42-7.4c-.3-.15-1.77-.87-2.05-.98-.27-.1-.47-.15-.67.15-.2.29-.77.97-.95 1.17-.17.2-.35.23-.65.08-.3-.15-1.26-.46-2.4-1.47-.88-.79-1.48-1.76-1.65-2.05-.18-.3-.02-.46.13-.61.14-.14.3-.35.45-.53.15-.18.2-.3.3-.5.1-.2.05-.38-.02-.53-.08-.15-.68-1.64-.93-2.25-.24-.58-.49-.5-.67-.51l-.57-.01c-.2 0-.53.08-.8.38-.28.3-1.05 1.03-1.05 2.5s1.07 2.9 1.22 3.1c.15.2 2.1 3.2 5.08 4.49.71.31 1.27.49 1.7.62.71.23 1.35.2 1.86.12.57-.08 1.77-.72 2.02-1.42.25-.7.25-1.3.17-1.42-.08-.13-.28-.2-.58-.35Z" />
  </svg>
);

const EmailIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true" className="h-7 w-7">
    <path
      fill="#EA4335"
      d="M2.4 6.6 12 13.8l9.6-7.2A2.4 2.4 0 0 0 19.2 4H4.8A2.4 2.4 0 0 0 2.4 6.6Z"
    />
    <path
      fill="#34A853"
      d="M21.6 6.6 12 13.8 2.4 6.6V18a2.4 2.4 0 0 0 2.4 2.4H7.2V10.8l4.8 3.6 4.8-3.6v9.6h2.4A2.4 2.4 0 0 0 21.6 18V6.6Z"
    />
    <path
      fill="#FBBC04"
      d="M2.4 18a2.4 2.4 0 0 0 2.4 2.4H7.2V10.8L2.4 6.6V18Z"
    />
    <path
      fill="#4285F4"
      d="M16.8 20.4h2.4a2.4 2.4 0 0 0 2.4-2.4V6.6l-4.8 4.2v9.6Z"
    />
  </svg>
);

const FloatingContactButtons = () => {
  return (
    <div className="fixed z-50 flex flex-col items-end gap-3 bottom-6 right-6">
      <a
        href={SITE_WHATSAPP_LINK}
        target="_blank"
        rel="noreferrer"
        aria-label="Chat on WhatsApp"
        className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-[0_16px_34px_rgba(37,211,102,0.34)] ring-4 ring-white transition hover:-translate-y-0.5"
      >
        <WhatsAppIcon />
      </a>

      <a
        href={SITE_EMAIL_LINK}
        aria-label="Email ShivraTech"
        className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-white shadow-[0_16px_34px_rgba(74,13,79,0.18)] ring-4 ring-white transition hover:-translate-y-0.5"
      >
        <EmailIcon />
      </a>
    </div>
  );
};

export default FloatingContactButtons;
