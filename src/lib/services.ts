// Static fallback content, used when the database is not connected.
// Descriptions are descriptive only: no prices, clients or performance claims.

export type Service = {
  slug: string;
  title: string;
  summary: string;
  deliverables: string[];
};

export const services: Service[] = [
  {
    slug: "social-media-management",
    title: "Social Media Management",
    summary: "Consistent, on-brand presence across your social channels, planned and managed for you.",
    deliverables: ["Content calendar", "Post design and captions", "Page setup and optimisation", "Community replies and monitoring", "Regular activity reports"],
  },
  {
    slug: "digital-marketing-strategy",
    title: "Digital Marketing Strategy",
    summary: "A clear plan that connects your goals, audience and channels before any money is spent.",
    deliverables: ["Brand and market review", "Audience and competitor research", "Channel and content plan", "Campaign roadmap", "Goal and tracking setup"],
  },
  {
    slug: "video-production-editing",
    title: "Video Production and Editing",
    summary: "Short-form and promotional video, from shooting to final edit, built for social platforms.",
    deliverables: ["Concept and script support", "Shooting", "Editing, captions and sound", "Reels and short-form cuts", "Platform-ready exports"],
  },
  {
    slug: "graphic-design-branding",
    title: "Graphic Design and Branding",
    summary: "Logos, visual identity and everyday design assets that keep your brand looking consistent.",
    deliverables: ["Logo and identity design", "Social post and cover designs", "Brand colour and type guidance", "Print-ready artwork", "Editable source files"],
  },
  {
    slug: "paid-advertising",
    title: "Paid Advertising",
    summary: "Targeted ad campaigns on social platforms, set up, monitored and adjusted over time.",
    deliverables: ["Audience targeting", "Ad creative and copy", "Campaign setup and boosting", "Budget monitoring", "Campaign performance reports"],
  },
  {
    slug: "content-creation",
    title: "Content Creation",
    summary: "Photos, copy and creative ideas that give your brand something worth following.",
    deliverables: ["Photo and product shoots", "Copywriting", "Creative concepts", "Story and carousel formats", "Bangla and English content"],
  },
  {
    slug: "website-design-development",
    title: "Website Design and Development",
    summary: "Fast, mobile-friendly websites that present your business clearly and make it easy to get in touch.",
    deliverables: ["Page design and build", "Mobile-first layout", "Contact and WhatsApp integration", "Basic SEO setup", "Handover and guidance"],
  },
];

export const processSteps = [
  { title: "Discover", text: "We learn about your business, audience and goals." },
  { title: "Plan", text: "We agree a clear scope, timeline and content direction." },
  { title: "Create", text: "Our team designs, shoots, writes and builds." },
  { title: "Launch", text: "We publish, run campaigns and keep you updated." },
  { title: "Improve", text: "We review results with you and refine the plan." },
];

export const whyChoose = [
  { title: "One team, many skills", text: "Strategy, design, video, ads and web under one roof, so your brand stays consistent." },
  { title: "Clear communication", text: "Direct WhatsApp access and a client portal for progress, files and invoices." },
  { title: "Honest scope", text: "We agree deliverables and timelines upfront and never promise results nobody can guarantee." },
  { title: "Local understanding", text: "Based in Savar, Dhaka, creating content for Bangladeshi audiences in Bangla and English." },
];
