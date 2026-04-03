import { ArrowRight } from "lucide-react";
import { Link, useParams } from "react-router-dom";

const PRIMARY = "#4A0D4F";
const ACCENT = "#B35FA3";

const supportTopics = {
  faqs: {
    eyebrow: "Support",
    title: "Frequently asked questions",
    intro:
      "Quick answers for shoppers and sellers reviewing the routed ShivraTech experience.",
    items: [
      "How do I navigate the storefront now? Use the navbar, footer, and page explorer cards to move between routed screens.",
      "Can vendors advertise products here? Yes. The contact page and hero actions now send people into clear route-driven flows.",
      "Is there a category view? Yes. The dropdown and category cards open the dedicated categories route.",
    ],
  },
  privacy: {
    eyebrow: "Policy",
    title: "Privacy overview",
    intro:
      "This screen acts as a routed placeholder for privacy content linked from the footer.",
    items: [
      "Customer contact information should be handled carefully and only for service-related communication.",
      "Marketing outreach should remain transparent, permission-based, and easy to opt out from.",
      "Support requests should use the official phone, email, or contact form routes shown in the app.",
    ],
  },
  terms: {
    eyebrow: "Policy",
    title: "Terms of service",
    intro:
      "A route-ready content area for platform expectations, seller responsibilities, and buying flows.",
    items: [
      "Listings should be accurate, current, and clearly priced.",
      "Promotions and delivery promises should match what shoppers actually receive.",
      "Support routes and marketplace actions should be used in good faith by both buyers and sellers.",
    ],
  },
  refund: {
    eyebrow: "Policy",
    title: "Refund guidance",
    intro:
      "A routed refund placeholder page so footer policy links land on something visible and structured.",
    items: [
      "Refund timelines should be stated clearly before checkout.",
      "Damaged or incorrect items should have a direct support path for quick resolution.",
      "Payment reversals and return handling should be communicated through the contact channels shown in the app.",
    ],
  },
};

const quickLinks = [
  { label: "FAQs", to: "/support/faqs" },
  { label: "Privacy", to: "/support/privacy" },
  { label: "Terms", to: "/support/terms" },
  { label: "Refund", to: "/support/refund" },
];

const SupportPage = () => {
  const { topic = "faqs" } = useParams();
  const content = supportTopics[topic] ?? supportTopics.faqs;

  return (
    <section className="px-4 pb-12 pt-8 sm:px-6 sm:pb-16 sm:pt-10">
      <div className="mx-auto max-w-5xl space-y-8">
        <div
          className="rounded-[32px] border px-5 py-8 sm:px-8 sm:py-10 md:px-12 md:py-12"
          style={{
            borderColor: "#eadbe6",
            background:
              "linear-gradient(135deg, rgba(247,240,246,0.96) 0%, rgba(255,255,255,1) 100%)",
          }}
        >
          <div className="space-y-4">
            <p
              className="text-xs font-bold uppercase tracking-[0.18em]"
              style={{ color: PRIMARY }}
            >
              {content.eyebrow}
            </p>
            <h1 className="text-3xl font-black tracking-tight text-slate-900 sm:text-4xl md:text-5xl">
              {content.title}
            </h1>
            <p className="max-w-3xl text-sm leading-7 text-slate-600 sm:text-base sm:leading-8">
              {content.intro}
            </p>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            {quickLinks.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="rounded-full border bg-white px-4 py-2 text-sm font-semibold transition hover:-translate-y-0.5"
                style={{
                  borderColor: item.to.endsWith(topic) ? PRIMARY : ACCENT,
                  color: PRIMARY,
                }}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="grid gap-4">
          {content.items.map((item) => (
            <article
              key={item}
              className="rounded-[24px] border bg-white p-5 shadow-[0_16px_42px_rgba(74,13,79,0.05)] sm:p-6"
              style={{ borderColor: "#eadbe6" }}
            >
              <p className="text-sm leading-7 text-slate-700">{item}</p>
            </article>
          ))}
        </div>

        <div
          className="rounded-[28px] border px-5 py-6 sm:px-8 sm:py-8"
          style={{ borderColor: "#eadbe6", backgroundColor: "#fbf6fa" }}
        >
          <h2 className="text-2xl font-bold text-slate-900">
            Need a direct response?
          </h2>
          <p className="mt-3 text-sm leading-7 text-slate-600">
            Use the routed contact page if you want to continue this flow with a
            form, or return to the shop to keep reviewing the site visually.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Link
              to="/contact"
              className="inline-flex w-full items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 sm:w-auto"
              style={{
                background: `linear-gradient(135deg, ${PRIMARY} 0%, ${ACCENT} 100%)`,
              }}
            >
              Contact support
              <ArrowRight size={16} />
            </Link>
            <Link
              to="/shop"
              className="w-full rounded-full border px-5 py-3 text-center text-sm font-semibold transition hover:-translate-y-0.5 sm:w-auto"
              style={{ borderColor: ACCENT, color: PRIMARY }}
            >
              Back to shop
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SupportPage;
