# ThumbStop সেটআপ গাইড (বাংলা)

এই গাইড শেষ করলে আপনি নিজের ইমেইল আর পাসওয়ার্ড দিয়ে `/admin`-এ লগইন করতে পারবেন।
সময় লাগবে প্রায় ১৫ মিনিট। সব কাজ বিনামূল্যে।

> একটা জিনিস মনে রাখুন: Supabase-এর `service_role` কী আর `.env.local` ফাইল কাউকে দেবেন না, কোথাও আপলোডও করবেন না।

---

## ধাপ ১: Supabase অ্যাকাউন্ট ও প্রজেক্ট

1. https://supabase.com এ গিয়ে **Start your project** চাপুন এবং GitHub বা ইমেইল দিয়ে সাইন আপ করুন।
2. **New project** চাপুন।
   - **Name:** `thumbstop`
   - **Database Password:** একটি শক্ত পাসওয়ার্ড দিন এবং কোথাও লিখে রাখুন।
   - **Region:** Singapore (বাংলাদেশের সবচেয়ে কাছে)।
3. **Create new project** চাপুন। তৈরি হতে ১-২ মিনিট লাগে।

## ধাপ ২: ডাটাবেস টেবিল তৈরি

1. Supabase-এর বাঁ দিকের মেনু থেকে **SQL Editor** খুলুন, তারপর **New query** চাপুন।
2. VS Code-এ `supabase/migrations/20261020000001_init_schema.sql` ফাইলটি খুলুন। `Ctrl + A`, তারপর `Ctrl + C`।
3. SQL Editor-এ পেস্ট করে (`Ctrl + V`) **Run** চাপুন। নিচে **Success** লেখা এলে ঠিক আছে।
4. আবার **New query** খুলুন। এবার `supabase/migrations/20261020000002_seed.sql` ফাইলের লেখা কপি করে পেস্ট করে **Run** চাপুন।

প্রথম ফাইলটি দুইবার চালাবেন না, দ্বিতীয়বার error দেখাবে।

## ধাপ ৩: কী (key) কপি করে `.env.local` ফাইল বানানো

1. Supabase-এ **Project Settings** (গিয়ার আইকন) → **API** খুলুন।
2. VS Code-এ `.env.example` ফাইলে রাইট-ক্লিক করে **Copy**, তারপর ফাঁকা জায়গায় রাইট-ক্লিক করে **Paste** করুন। নতুন ফাইলটির নাম বদলে `.env.local` রাখুন।
3. `.env.local` খুলে এই চারটি লাইন বদলান:

```
NEXT_PUBLIC_SUPABASE_URL=         ← "Project URL" এর লেখা
NEXT_PUBLIC_SUPABASE_ANON_KEY=    ← "anon public" কী
SUPABASE_SERVICE_ROLE_KEY=        ← "service_role" কী ("Reveal" চেপে দেখুন)
RATE_LIMIT_SALT=                  ← যেকোনো লম্বা এলোমেলো লেখা, যেমন: x8Kd92LmQp7ZvT3wNe41
```

`=` এর পরে কোনো ফাঁকা বা উদ্ধৃতি চিহ্ন (") দেবেন না। ফাইল Save করুন (`Ctrl + S`)।

## ধাপ ৪: লগইনের ঠিকানা সেট করা

1. Supabase-এ **Authentication** → **URL Configuration** খুলুন।
2. **Site URL** এ লিখুন: `http://localhost:3000`
3. **Redirect URLs** এ **Add URL** চেপে লিখুন: `http://localhost:3000/auth/callback`। Save করুন।
4. (শুরুতে সহজ করতে) **Authentication** → **Providers** → **Email** এ গিয়ে **Confirm email** বন্ধ করে Save করুন।
   ওয়েবসাইট অনলাইনে দেওয়ার আগে এটি আবার চালু করে নেবেন।

## ধাপ ৫: সাইট চালু করা

VS Code-এর টার্মিনালে (`Ctrl + ~`) চালান:

```
npm install
npm run dev
```

`.env.local` বদলালে সাইট বন্ধ করে (`Ctrl + C`) আবার `npm run dev` চালাতে হবে।
ব্রাউজারে http://localhost:3000/login খুলুন। ফর্ম এখন চালু থাকা উচিত।

## ধাপ ৬: নিজেকে Admin বানানো

নিরাপত্তার জন্য ওয়েবসাইটের রেজিস্ট্রেশনে কেউ নিজেকে admin বানাতে পারে না। প্রথম admin একবার ডাটাবেস থেকে বানাতে হয়:

1. http://localhost:3000/register এ গিয়ে আপনার ইমেইল আর পাসওয়ার্ড দিয়ে অ্যাকাউন্ট খুলুন।
2. Supabase **SQL Editor** → **New query** এ এই লাইনটি লিখে (ইমেইলটি আপনারটি দিন) **Run** চাপুন:

```sql
update public.profiles set role = 'admin' where lower(email) = lower('আপনার-ইমেইল@example.com');
```

3. নিচে `Success. 1 row affected` (বা সমতুল্য) দেখাবে। না দেখালে ইমেইল ভুল আছে।
4. http://localhost:3000/login এ লগইন করুন। আপনি সরাসরি `/admin`-এ চলে যাবেন।

পরে আরও কাউকে Staff বা Admin করতে চাইলে সে আগে রেজিস্টার করবে, তারপর আপনি **Users & Roles** পেজ থেকে তার role বদলে দেবেন।

## ধাপ ৭: প্রথম কাজগুলো

- **Website Settings:** ফোন, ইমেইল, ঠিকানা, ফেসবুক লিংক ঠিক করুন।
- **Services & Packages:** সার্ভিসের লেখা আর প্রাইস প্যাকেজ দিন। প্রাইস ফাঁকা থাকলে সাইটে “Price on request” দেখায়।
- **Portfolio & Reviews:** শুধু আসল কাজ আর আসল রিভিউ দিন। Publish টিক না দিলে সাইটে আসে না।
- **Clients → Projects → Invoices:** ক্লায়েন্ট যোগ করে প্রজেক্ট আর ইনভয়েস বানান। হাতে টাকা পেলে ইনভয়েসে payment রেকর্ড করুন।

## সমস্যা হলে

| সমস্যা | কারণ ও সমাধান |
|---|---|
| লগইন ফর্ম ধূসর/বন্ধ | `.env.local` ফাইল নেই, নামে ভুল আছে বা মান বসেনি। ঠিক করে সাইট বন্ধ করে আবার `npm run dev` চালান। |
| “Invalid email or password” | ইমেইল/পাসওয়ার্ড ভুল। Confirm email চালু থাকলে আগে ইমেইলের লিংকে ক্লিক করুন। |
| লগইনের পর `/admin` না গিয়ে `/portal` এ যায় | আপনার role এখনো `client`। ধাপ ৬-এর SQL ঠিকমতো চালান। |
| Contact form: “Enquiry saving is not set up yet” | `SUPABASE_SERVICE_ROLE_KEY` বসেনি। |
| ছবি আপলোড হচ্ছে না | ধাপ ২-এর প্রথম SQL ফাইলটি পুরো চালানো হয়নি (storage অংশ বাদ গেছে)। |

## এখনো তৈরি হয়নি (সৎভাবে)

- **ক্লায়েন্ট পোর্টাল (`/portal`)**: ক্লায়েন্ট লগইন করলে এখনো কোনো পেজ নেই। পরের ধাপে বানানো হবে।
- **অনলাইন পেমেন্ট (SSLCommerz)**: এখন শুধু হাতে (ক্যাশ, ব্যাংক, bKash/Nagad ম্যানুয়াল) পেমেন্ট রেকর্ড করা যায়।
- **ইমেইল পাঠানো**: সাইট থেকে কোনো ইমেইল যায় না। শুধু Supabase-এর লগইন/রিসেট ইমেইল যায়।
