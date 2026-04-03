export const SITE_PHONE_DISPLAY = "+91-9667092077";
export const SITE_PHONE_TEL = "+919667092077";
export const SITE_EMAIL = "shivratech03@gmail.com";

const defaultContactMessage =
  "Hi ShivraTech, I want to know more about your gadgets and local delivery options.";
const defaultEmailSubject = "ShivraTech inquiry";
const defaultEmailBody = `${defaultContactMessage}\n\nName:\nPhone:\nRequirement:`;

export const SITE_WHATSAPP_LINK = `https://wa.me/919667092077?text=${encodeURIComponent(defaultContactMessage)}`;
export const SITE_EMAIL_LINK = `mailto:${SITE_EMAIL}?subject=${encodeURIComponent(defaultEmailSubject)}&body=${encodeURIComponent(defaultEmailBody)}`;
