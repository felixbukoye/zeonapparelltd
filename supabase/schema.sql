-- ============================================================================
-- ZEON Healthcare Apparelltd — Supabase schema
--
-- How to use:
--   1. Create a project at https://supabase.com (free tier is fine to start)
--   2. Open SQL Editor (left sidebar → SQL Editor → New query)
--   3. Paste this whole file and run it
--   4. Copy the values for your app's environment variables:
--        SUPABASE_URL             Settings → API → Project URL
--        SUPABASE_SERVICE_ROLE_KEY Settings → API → Project API keys →
--                                 service_role (secret) — server-only!
--
-- Column names intentionally mirror the camelCase TypeScript types in
-- lib/types.ts so Supabase rows map 1:1 with no field mapping in code.
-- RLS is enabled with no policies (deny-by-default); the app connects with
-- the service-role key server-side, which bypasses RLS.
-- ============================================================================

-- ---------------------------------------------------------------- products --
create table if not exists "products" (
  "id"          text primary key,
  "slug"        text not null unique,
  "name"        text not null,
  "category"    text not null,
  "price"       numeric not null,
  "compareAt"   numeric,
  "colors"      jsonb not null default '[]',
  "sizes"       jsonb not null default '[]',
  "description" text not null default '',
  "details"     jsonb not null default '[]',
  "fabric"      text not null default '',
  "images"      jsonb not null default '[]',
  "featured"    boolean,
  "badge"       text,
  "stock"       integer not null default 0,
  "rating"      numeric not null default 5,
  "reviewCount" integer not null default 0,
  "createdAt"   timestamptz not null default now()
);
alter table "products" enable row level security;

-- ----------------------------------------------------------------- users --
create table if not exists "users" (
  "id"           text primary key,
  "name"         text not null,
  "email"        text not null unique,
  "passwordHash" text not null,
  "salt"         text not null,
  "role"         text not null default 'coordinator',
  "phone"        text,
  "orgName"      text,
  "orgType"      text,
  "address"      text,
  "city"         text,
  "createdAt"    timestamptz not null default now()
);
alter table "users" enable row level security;

-- --------------------------------------------------------------- orders --
create table if not exists "orders" (
  "id"            text primary key,
  "code"          text not null unique,
  "userId"        text,
  "email"         text not null,
  "name"          text not null,
  "phone"         text not null,
  "address"       text not null,
  "city"          text not null,
  "zone"          text not null,
  "items"         jsonb not null default '[]',
  "subtotal"      numeric not null,
  "delivery"      numeric not null,
  "discount"      numeric,
  "total"         numeric not null,
  "paymentMethod" text not null,
  "paymentStatus" text not null,
  "status"        text not null,
  "notes"         text,
  "timeline"      jsonb not null default '[]',
  "createdAt"     timestamptz not null default now()
);
create index if not exists orders_email_idx on "orders" ("email");
alter table "orders" enable row level security;

-- ---------------------------------------------------------------- reviews --
create table if not exists "reviews" (
  "id"        text primary key,
  "productId" text not null,
  "name"      text not null,
  "rating"    integer not null,
  "title"     text,
  "body"      text not null,
  "status"    text not null default 'pending',
  "createdAt" timestamptz not null default now()
);
create index if not exists reviews_product_idx on "reviews" ("productId");
alter table "reviews" enable row level security;

-- ------------------------------------------------------------- enquiries --
create table if not exists "enquiries" (
  "id"           text primary key,
  "kind"         text not null,
  "name"         text not null,
  "email"        text not null,
  "phone"        text not null,
  "organisation" text,
  "quantity"     text,
  "products"     text,
  "message"      text not null,
  "status"       text not null default 'new',
  "createdAt"    timestamptz not null default now()
);
alter table "enquiries" enable row level security;

-- ----------------------------------------------------------- collections --
create table if not exists "collections" (
  "id"              text primary key,
  "coordinatorId"   text not null,
  "name"            text not null,
  "mode"            text not null,
  "genders"         jsonb not null default '[]',
  "categories"      jsonb not null default '[]',
  "styles"          jsonb not null default '[]',
  "approvedColours" jsonb not null default '[]',
  "embroideryRules" jsonb not null default '[]',
  "status"          text not null default 'draft',
  "version"         integer not null default 1,
  "history"         jsonb not null default '[]',
  "createdAt"       timestamptz not null default now()
);
create index if not exists collections_coordinator_idx on "collections" ("coordinatorId");
alter table "collections" enable row level security;

-- ----------------------------------------------------------- team orders --
create table if not exists "team_orders" (
  "id"           text primary key,
  "code"         text not null unique,
  "productIds"   jsonb not null default '[]',
  "collectionId" text not null,
  "coordinatorId" text not null,
  "orgName"      text not null,
  "headcount"    integer not null,
  "departments"  jsonb not null default '[]',
  "type"         text not null,
  "inviteToken"  text not null unique,
  "inviteExpiry" timestamptz not null,
  "roster"       jsonb not null default '[]',
  "quote"        jsonb not null,
  "depositPaid"  boolean not null default false,
  "depositAt"    timestamptz,
  "balancePaid"  boolean not null default false,
  "balanceAt"    timestamptz,
  "embroidery"   jsonb not null,
  "production"   jsonb not null,
  "status"       text not null default 'draft',
  "trackingCode" text,
  "createdAt"    timestamptz not null default now()
);
create index if not exists team_orders_coordinator_idx on "team_orders" ("coordinatorId");
alter table "team_orders" enable row level security;

-- ----------------------------------------------------- individual orders --
create table if not exists "individual_orders" (
  "id"            text primary key,
  "code"          text not null unique,
  "productId"     text not null,
  "styleId"       text not null,
  "styleName"     text not null,
  "image"         text not null,
  "colour"        text not null,
  "gender"        text not null,
  "careerStage"   text not null,
  "sizeMode"      text not null,
  "size"          text,
  "fit"           text not null,
  "measurements"  jsonb,
  "sets"          integer not null,
  "embroidery"    jsonb,
  "name"          text not null,
  "email"         text not null,
  "phone"         text not null,
  "address"       text not null,
  "city"          text not null,
  "zone"          text not null,
  "subtotal"      numeric not null,
  "delivery"      numeric not null,
  "total"         numeric not null,
  "paymentMethod" text not null,
  "paidAt"        timestamptz,
  "production"    jsonb not null,
  "status"        text not null,
  "trackingCode"  text,
  "sizeProfileId" text,
  "createdAt"     timestamptz not null default now()
);
create index if not exists individual_orders_email_idx on "individual_orders" ("email");
alter table "individual_orders" enable row level security;

-- --------------------------------------------------------- size profiles --
create table if not exists "size_profiles" (
  "id"           text primary key,
  "identity"     text not null unique,
  "name"         text,
  "sizeMode"     text not null,
  "size"         text,
  "fit"          text not null,
  "measurements" jsonb,
  "helper"       jsonb,
  "updatedAt"    timestamptz not null default now()
);
alter table "size_profiles" enable row level security;

-- -------------------------------------------------------- discovery --
create table if not exists "discovery_sessions" (
  "id"             text primary key,
  "mode"           text not null,
  "name"           text,
  "contact"        text,
  "ambassador"     text,
  "answers"        jsonb not null default '[]',
  "currentSection" integer not null default 1,
  "completed"      boolean not null default false,
  "points"         integer not null default 0,
  "communityOptIn" boolean,
  "orderCode"      text,
  "createdAt"      timestamptz not null default now(),
  "completedAt"    timestamptz
);
alter table "discovery_sessions" enable row level security;

-- ----------------------------------------------------------- feedback --
create table if not exists "feedback" (
  "id"          text primary key,
  "orderCode"   text not null,
  "kind"        text not null,
  "wearerName"  text,
  "fit"         text not null,
  "ratings"     jsonb not null,
  "nameCorrect" boolean,
  "deptCorrect" boolean,
  "text"        text,
  "createdAt"   timestamptz not null default now()
);
alter table "feedback" enable row level security;

-- ------------------------------------------------------------- events --
create table if not exists "events" (
  "id"    text primary key,
  "name"  text not null,
  "props" jsonb,
  "at"    timestamptz not null default now()
);
create index if not exists events_at_idx on "events" ("at");
alter table "events" enable row level security;

-- ============================================================================
-- Seed: catalogue (migrated from data/products.json)
-- Idempotent — safe to re-run.
-- ============================================================================

insert into "products" ("id", "slug", "name", "category", "price", "compareAt", "colors", "sizes", "description", "details", "fabric", "images", "featured", "badge", "stock", "rating", "reviewCount", "createdAt")
values ('p001-scrub-top-ceil', 'essential-vneck-scrub-top-ceil-blue', 'Essential V-Neck Scrub Top', 'Scrub Tops', 18500, 22000, '["Ceil Blue","Navy","Teal","Hunter Green","Wine"]', '["XS","S","M","L","XL","2XL"]', 'Our best-selling scrub top, cut for long shifts. A modern classic fit with a flattering V-neck, two roomy patch pockets and a hidden inner pocket for your phone or scissors. The 4-way stretch fabric moves with you from ward rounds to theatre.', '["Modern classic fit with side vents","2 patch pockets + 1 hidden inner pocket","Reinforced double-needle stitching","Fade-resistant, autoclavable fabric","Free embroidery of name & role on orders of 10+"]', '72% Polyester / 21% Viscose / 7% Spandex, 180 GSM', '["/images/products/scrub-top-ceil.jpg","/images/fabric-detail.jpg"]', true, true, 240, 4.7, 3, '2026-01-12T09:00:00.000Z')on conflict ("slug") do nothing;

insert into "products" ("id", "slug", "name", "category", "price", "compareAt", "colors", "sizes", "description", "details", "fabric", "images", "featured", "badge", "stock", "rating", "reviewCount", "createdAt")
values ('p002-scrub-set-navy', 'prostretch-scrub-set-navy', 'ProStretch Scrub Set (Top + Trousers)', 'Scrub Sets', 32000, null, '["Navy","Ceil Blue","Teal","Black","Hunter Green"]', '["XS","S","M","L","XL","2XL"]', 'A perfectly matched top and trouser set in our premium ProStretch fabric. The top features a chest pocket and pen slot; the trousers have a yoga-knit waistband, drawstring and five pockets including a zip cargo pocket. Save more versus buying separates.', '["Matched V-neck top + mid-rise trousers","Yoga-knit waistband with drawstring","6 pockets including zip cargo pocket","Wrinkle-resistant, quick-dry finish","Ideal for hospital bulk uniform programmes"]', '78% Polyester / 17% Viscose / 5% Spandex, 195 GSM', '["/images/products/scrub-set-navy.jpg","/images/fabric-detail.jpg"]', true, true, 180, 5, 2, '2026-02-02T09:00:00.000Z')on conflict ("slug") do nothing;

insert into "products" ("id", "slug", "name", "category", "price", "compareAt", "colors", "sizes", "description", "details", "fabric", "images", "featured", "badge", "stock", "rating", "reviewCount", "createdAt")
values ('p003-lab-coat-white', 'classic-lab-coat-white', 'Classic Lab Coat', 'Lab Coats', 28500, null, '["White"]', '["S","M","L","XL","2XL"]', 'The timeless white coat, tailored in Lagos. A 40-inch full-length coat with notched lapels, three roomy pockets, pen slots and a chest pocket sized for phones and pagers. Breathable poly-cotton that stays crisp through clinics and ward rounds.', '["40-inch full length with centre vent","Notched lapels, 4-button closure","3 pockets + pen slots + chest pocket","Side slits for easy movement","Complimentary name embroidery available"]', '65% Polyester / 35% Cotton twill, 200 GSM', '["/images/products/lab-coat.jpg","/images/fabric-detail.jpg"]', true, null, 150, 4.5, 2, '2026-01-20T09:00:00.000Z')on conflict ("slug") do nothing;

insert into "products" ("id", "slug", "name", "category", "price", "compareAt", "colors", "sizes", "description", "details", "fabric", "images", "featured", "badge", "stock", "rating", "reviewCount", "createdAt")
values ('p004-scrub-jacket-teal', 'warm-up-scrub-jacket-teal', 'Warm-Up Scrub Jacket', 'Jackets', 22000, null, '["Teal","Navy","Ceil Blue","Black","Wine"]', '["XS","S","M","L","XL","2XL"]', 'For freezing theatres and night shifts. A soft, stretchy warm-up jacket with ribbed cuffs, a full front zip and two roomy pockets. Layers perfectly over any Zeon scrub top without restricting movement.', '["Full front zip with chin guard","Ribbed cuffs and hem","2 roomy outer pockets","Lightweight yet warm knit","Matches all Zeon scrub colours"]', '74% Polyester / 20% Viscose / 6% Spandex fleece-back knit', '["/images/products/scrub-jacket-teal.jpg","/images/fabric-detail.jpg"]', null, null, 120, 5, 1, '2026-02-18T09:00:00.000Z')on conflict ("slug") do nothing;

insert into "products" ("id", "slug", "name", "category", "price", "compareAt", "colors", "sizes", "description", "details", "fabric", "images", "featured", "badge", "stock", "rating", "reviewCount", "createdAt")
values ('p005-trousers-green', 'cargo-scrub-trousers-hunter-green', 'Cargo Scrub Trousers', 'Trousers', 16000, null, '["Hunter Green","Navy","Ceil Blue","Teal","Black"]', '["XS","S","M","L","XL","2XL"]', 'Mid-rise scrub trousers with serious pocket game: two front slash pockets, a zip cargo pocket and two back pockets. The elastic-plus-drawstring waist keeps you comfortable through 12-hour shifts.', '["Mid-rise with elastic + drawstring waist","5 pockets including zip cargo pocket","Straight leg with side vents","Wrinkle-resistant stretch twill","Reinforced knees for durability"]', '78% Polyester / 17% Viscose / 5% Spandex, 195 GSM', '["/images/products/scrub-trousers-green.jpg","/images/fabric-detail.jpg"]', null, null, 200, 4, 1, '2026-01-28T09:00:00.000Z')on conflict ("slug") do nothing;

insert into "products" ("id", "slug", "name", "category", "price", "compareAt", "colors", "sizes", "description", "details", "fabric", "images", "featured", "badge", "stock", "rating", "reviewCount", "createdAt")
values ('p006-nurse-tunic', 'nurse-tunic-white', 'Nurse Tunic', 'Tunics', 21000, null, '["White","Ceil Blue"]', '["S","M","L","XL","2XL"]', 'A smart, feminine tunic designed with working nurses. Princess seams for shape, a mandarin collar option, two roomy patch pockets and side slits for easy movement. Pairs beautifully with white trousers or leggings.', '["Flattering princess-seam cut","Mandarin collar with snap buttons","2 patch pockets + pen slot","Side slits, hip-length","Easy-iron, stain-resistant finish"]', '65% Polyester / 35% Cotton poplin, 170 GSM', '["/images/products/nurse-tunic.jpg","/images/fabric-detail.jpg"]', null, null, 90, 5, 1, '2026-03-05T09:00:00.000Z')on conflict ("slug") do nothing;

insert into "products" ("id", "slug", "name", "category", "price", "compareAt", "colors", "sizes", "description", "details", "fabric", "images", "featured", "badge", "stock", "rating", "reviewCount", "createdAt")
values ('p007-clogs', 'anti-slip-nursing-clogs', 'Anti-Slip Nursing Clogs', 'Footwear', 24000, null, '["White","Navy","Black"]', '["36","37","38","39","40","41","42","43","44","45","46"]', 'Cloud-soft clogs built for 12-hour shifts. Anti-slip oil-resistant soles, a cushioned anatomical footbed, ventilation ports and a wipe-clean waterproof upper. Autoclavable and odour-resistant.', '["SRC-rated anti-slip sole","Anatomical cushioned footbed","Wipe-clean waterproof upper","Ventilation ports + heel strap","Autoclavable up to 134°C"]', 'EVA + rubber composite sole', '["/images/products/clogs.jpg","/images/fabric-detail.jpg"]', true, true, 160, 4.5, 2, '2026-02-10T09:00:00.000Z')on conflict ("slug") do nothing;

insert into "products" ("id", "slug", "name", "category", "price", "compareAt", "colors", "sizes", "description", "details", "fabric", "images", "featured", "badge", "stock", "rating", "reviewCount", "createdAt")
values ('p008-socks', 'compression-socks-3-pack', 'Compression Socks (3-Pack)', 'Accessories', 9500, null, '["Black","White","Navy"]', '["S/M","L/XL"]', '15–20 mmHg graduated compression socks that keep legs fresh through long shifts. Cushioned sole, arch support and breathable mesh zones. Pack of three pairs in your choice of colour mix.', '["15–20 mmHg graduated compression","Cushioned sole + arch support","Breathable mesh ventilation zones","Pack of 3 pairs","Reduces swelling on long shifts"]', '85% Nylon / 15% Spandex', '["/images/products/socks.jpg","/images/fabric-detail.jpg"]', null, null, 300, 5, 1, '2026-03-12T09:00:00.000Z')on conflict ("slug") do nothing;

insert into "products" ("id", "slug", "name", "category", "price", "compareAt", "colors", "sizes", "description", "details", "fabric", "images", "featured", "badge", "stock", "rating", "reviewCount", "createdAt")
values ('p009-surgical-cap', 'tie-back-surgical-cap', 'Tie-Back Surgical Cap', 'Headwear', 4500, null, '["Teal","Navy","Ceil Blue","Wine"]', '["One Size"]', 'A breathable tie-back theatre cap with an absorbent sweatband and adjustable ties for a secure fit. Fully covers hair, survives daily autoclaving, and matches Zeon theatre sets.', '["Adjustable tie-back closure","Absorbent inner sweatband","Full hair coverage","Autoclavable, quick-dry","Bulk discounts for theatres"]', '100% Polyester microfibre, 150 GSM', '["/images/products/surgical-cap.jpg","/images/fabric-detail.jpg"]', null, null, 400, 4, 1, '2026-01-15T09:00:00.000Z')on conflict ("slug") do nothing;

insert into "products" ("id", "slug", "name", "category", "price", "compareAt", "colors", "sizes", "description", "details", "fabric", "images", "featured", "badge", "stock", "rating", "reviewCount", "createdAt")
values ('p010-hijab', 'performance-scrub-hijab', 'Performance Scrub Hijab', 'Headwear', 6500, null, '["Black","Navy","White","Ceil Blue","Teal"]', '["One Size"]', 'Designed with Muslim healthcare professionals: a secure, lightweight scrub hijab that stays put under theatre caps and masks. Breathable jersey with a snug under-cap band — full coverage, zero slipping, all shift.', '["Secure-fit under-cap band","Lightweight breathable jersey","Full neck + chest coverage","Mask-friendly ear loops","Quick-dry, autoclavable"]', '92% Polyester / 8% Spandex jersey', '["/images/products/hijab-scrub.jpg","/images/fabric-detail.jpg"]', true, true, 220, 5, 2, '2026-04-01T09:00:00.000Z')on conflict ("slug") do nothing;

insert into "products" ("id", "slug", "name", "category", "price", "compareAt", "colors", "sizes", "description", "details", "fabric", "images", "featured", "badge", "stock", "rating", "reviewCount", "createdAt")
values ('p011-underscrub', 'long-sleeve-underscrub-tee', 'Long-Sleeve Underscrub Tee', 'Scrub Tops', 8500, null, '["Black","White","Navy","Ceil Blue"]', '["XS","S","M","L","XL","2XL"]', 'The perfect base layer for cold wards and theatres. A silky long-sleeve tee that fits smoothly under scrubs without bunching, with thumbholes to keep sleeves in place while gloving up.', '["Smooth second-skin fit under scrubs","Thumbholes for gloving","Moisture-wicking + odour control","Tagless comfort neckline","Matches all Zeon scrub colours"]', '88% Polyester / 12% Spandex performance knit', '["/images/products/underscrub.jpg","/images/fabric-detail.jpg"]', null, null, 260, 4, 1, '2026-03-20T09:00:00.000Z')on conflict ("slug") do nothing;

insert into "products" ("id", "slug", "name", "category", "price", "compareAt", "colors", "sizes", "description", "details", "fabric", "images", "featured", "badge", "stock", "rating", "reviewCount", "createdAt")
values ('p012-wlab-coat', 'tailored-womens-lab-coat', 'Tailored Women''s Lab Coat', 'Lab Coats', 30000, null, '["White"]', '["XS","S","M","L","XL"]', 'A lab coat cut for her — not a shrunken men''s coat. Princess seams, a tapered waist and a flattering 36-inch length, with all the pockets a doctor needs: tablet pocket, pen slots and a phone chest pocket.', '["Feminine tailored silhouette","36-inch length with back vent","Tablet pocket + pen slots","Phone-sized chest pocket","Wrinkle-resistant easy care"]', '65% Polyester / 35% Cotton twill, 200 GSM', '["/images/products/lab-coat-women.jpg","/images/fabric-detail.jpg"]', true, null, 110, 5, 1, '2026-04-10T09:00:00.000Z')on conflict ("slug") do nothing;
