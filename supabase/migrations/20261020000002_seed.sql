-- Starter content. Contains NO prices, clients, reviews or statistics.
-- Safe to edit later from the admin dashboard.

insert into public.services (slug, title, summary, deliverables, sort_order) values
('social-media-management', 'Social Media Management',
 'Consistent, on-brand presence across your social channels, planned and managed for you.',
 array['Content calendar','Post design and captions','Page setup and optimisation','Community replies and monitoring','Regular activity reports'], 1),
('digital-marketing-strategy', 'Digital Marketing Strategy',
 'A clear plan that connects your goals, audience and channels before any money is spent.',
 array['Brand and market review','Audience and competitor research','Channel and content plan','Campaign roadmap','Goal and tracking setup'], 2),
('video-production-editing', 'Video Production and Editing',
 'Short-form and promotional video, from shooting to final edit, built for social platforms.',
 array['Concept and script support','Shooting','Editing, captions and sound','Reels and short-form cuts','Platform-ready exports'], 3),
('graphic-design-branding', 'Graphic Design and Branding',
 'Logos, visual identity and everyday design assets that keep your brand looking consistent.',
 array['Logo and identity design','Social post and cover designs','Brand colour and type guidance','Print-ready artwork','Editable source files'], 4),
('paid-advertising', 'Paid Advertising',
 'Targeted ad campaigns on social platforms, set up, monitored and adjusted over time.',
 array['Audience targeting','Ad creative and copy','Campaign setup and boosting','Budget monitoring','Campaign performance reports'], 5),
('content-creation', 'Content Creation',
 'Photos, copy and creative ideas that give your brand something worth following.',
 array['Photo and product shoots','Copywriting','Creative concepts','Story and carousel formats','Bangla and English content'], 6),
('website-design-development', 'Website Design and Development',
 'Fast, mobile-friendly websites that present your business clearly and make it easy to get in touch.',
 array['Page design and build','Mobile-first layout','Contact and WhatsApp integration','Basic SEO setup','Handover and guidance'], 7)
on conflict (slug) do nothing;

insert into public.site_settings (key, value) values
('phone_display', '+880 1778-854463'),
('phone_tel', '+8801778854463'),
('whatsapp_number', '8801778854463'),
('email', 'thumbstop870@gmail.com'),
('address', '9/15, Junayed Complex, Delta Mor, Rajashon Road, Savar-1340, Dhaka, Bangladesh'),
('facebook', ''), ('instagram', ''), ('youtube', ''), ('linkedin', '')
on conflict (key) do nothing;
