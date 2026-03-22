-- ============================================================
-- DEAL FINDER — Supabase Schema
-- Run this entire file in the Supabase SQL Editor
-- ============================================================

-- 1. SEARCHES
create table searches (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  type_id text not null,           -- 'spa_resort' | 'luxury_airbnb'
  filter text default 'all',
  sort_by text default 'score',
  created_at timestamptz default now()
);

-- 2. PROPERTIES
create table properties (
  id uuid primary key default gen_random_uuid(),
  search_id uuid references searches(id) on delete cascade,
  is_benchmark boolean default false,
  name text not null,
  location text,
  address text,
  phone text,
  website text,
  owner text,
  founded_years text,
  acres numeric,
  sites integer,
  cabins integer,
  bedrooms integer,
  bathrooms integer,
  asking_price numeric,
  seasonal boolean default true,
  status text default 'investigate',  -- saved | investigate | watch | pass
  notes text,

  -- Spa Resort criteria scores (0–10)
  water_frontage integer default 5,
  owner_succession integer default 5,
  improvement_opportunity integer default 5,
  booking_system integer default 5,
  web_presence integer default 5,
  acreage integer default 5,
  proximity integer default 5,
  existing_cabins integer default 5,

  -- Luxury Airbnb criteria scores (0–10)
  ski_proximity integer default 5,
  views_privacy integer default 5,
  price_to_revenue integer default 5,
  outdoor_amenities integer default 5,
  property_condition integer default 5,
  unique_architecture integer default 5,
  year_round_appeal integer default 5,

  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 3. COMMENTS
create table comments (
  id uuid primary key default gen_random_uuid(),
  property_id uuid references properties(id) on delete cascade,
  text text not null,
  created_at timestamptz default now()
);

-- 4. CHAT MESSAGES
create table chat_messages (
  id uuid primary key default gen_random_uuid(),
  search_id uuid references searches(id) on delete cascade,
  role text not null,   -- 'user' | 'assistant'
  content text not null,
  created_at timestamptz default now()
);

-- ============================================================
-- ROW LEVEL SECURITY (allow public read/write for now)
-- ============================================================
alter table searches enable row level security;
alter table properties enable row level security;
alter table comments enable row level security;
alter table chat_messages enable row level security;

create policy "public_all" on searches for all using (true) with check (true);
create policy "public_all" on properties for all using (true) with check (true);
create policy "public_all" on comments for all using (true) with check (true);
create policy "public_all" on chat_messages for all using (true) with check (true);

-- ============================================================
-- SEED DATA — Tiny Home Spa search
-- ============================================================

-- Insert the search
insert into searches (id, name, type_id) values
  ('a1000000-0000-0000-0000-000000000001', 'Tiny Home Spa', 'spa_resort'),
  ('a2000000-0000-0000-0000-000000000002', 'Hunter Airbnb Expansion', 'luxury_airbnb');

-- Tiny Home Spa properties
insert into properties (search_id, is_benchmark, name, location, address, phone, website, owner, founded_years, acres, sites, cabins, seasonal, status, water_frontage, owner_succession, improvement_opportunity, booking_system, web_presence, acreage, proximity, existing_cabins, notes) values

('a1000000-0000-0000-0000-000000000001', true,
 '⭐ Simpler Times (Benchmark)', 'Phoenicia, NY · Ulster Co.',
 '5973 State Route 28, Phoenicia, NY 12464', '(845) 688-5410',
 'https://simplertimescabins2.com', '3-generation family — OFF MARKET',
 '50+ yrs', 6, 21, 9, true, 'saved',
 10,10,10,9,9,4,9,10,
 'THE ORIGINAL TARGET — now off market. 6ac, 9 cabins, 21 RV pads, Esopus Creek, ~$2.1M. Measure everything against this.'),

('a1000000-0000-0000-0000-000000000001', false,
 'Russell Brook Campsites', 'Roscoe, NY · Delaware Co.',
 '731 Russell Brook Rd, Roscoe, NY 12776', '(607) 498-5416',
 'https://russellbrook.com', 'Charlie Janis / Terri Janis',
 '47+ yrs', 58.9, 150, 3, true, 'saved',
 9,9,9,8,8,9,8,6,
 'PRIORITY #1. 47yr family op, daughter Terri now running. 3 cabins on 58ac. Russell Brook + 0.5mi to Beaverkill.'),

('a1000000-0000-0000-0000-000000000001', false,
 'Peaceful Valley Campsite', 'Downsville, NY · Delaware Co.',
 '485 Banker Rd, Downsville, NY 13755', '(607) 363-2211',
 'http://www.nypeacefulvalley.com', 'Arnold Banker',
 'Since 1968', 500, null, null, true, 'saved',
 10,10,7,10,10,4,7,7,
 'Road named after family. 57yr ownership. Mail/Venmo reservations. 1mi Delaware River. 500ac too large — quarry + airstrip concerns.'),

('a1000000-0000-0000-0000-000000000001', false,
 'Uncle Pete''s Campground', 'Phoenicia, NY · Ulster Co.',
 '570 Old Rt-28, Phoenicia, NY 12464', '(845) 688-5000',
 'http://unclepetescampground.com', 'Unknown — listed $925K in 2017',
 'Unknown', 57, 60, 1, true, 'investigate',
 10,7,9,7,7,9,9,5,
 'Near-identical Simpler Times profile. 57ac, 60 sites, 1 cabin. 0.5mi Esopus Creek. DEP septic. Was $925K in 2017 — verify current owner.'),

('a1000000-0000-0000-0000-000000000001', false,
 'Neversink River Campgrounds', 'Woodbourne, NY · Sullivan Co.',
 '192 Campground Rd, Woodbourne, NY 12788', '(845) 434-8926',
 'https://www.neversinkrivercampgrounds.com', 'Julia Dolgas',
 'Long established', null, null, null, true, 'investigate',
 9,7,8,8,8,5,8,4,
 'NOT the glamping resort. Original Woodbourne campground. Julia Dolgas owner. On Neversink River. Needs research on acreage/tenure.'),

('a1000000-0000-0000-0000-000000000001', false,
 'SoHi Campground (For Sale)', 'Accord, NY · Ulster Co.',
 '425 Woodland Rd, Accord, NY 12404', 'Win Morrison Realty',
 'https://www.loopnet.com/Listing/425-Woodland-Rd-Accord-NY/38226111/', 'Listed — $3.199M',
 'Est. 1975', 42.6, 109, 0, true, 'investigate',
 5,10,8,5,5,8,9,2,
 'ACTIVELY FOR SALE $3.199M. Near Minnewaska/Mohonk/Inness. Spring ponds, no creek. Half undeveloped.'),

('a1000000-0000-0000-0000-000000000001', false,
 'Covered Bridge Campsite', 'Livingston Manor · Sullivan Co.',
 '68 Conklin Hill Rd, Livingston Manor, NY', '(845) 439-5093',
 'https://coveredbridgecamping.com', 'Scott & Heidi W.',
 'Active', 26, null, 0, true, 'pass',
 10,2,3,2,3,7,8,2,
 '1mi Willowemoc frontage. BUT active invested owners on Campspot. Not a succession target.'),

('a1000000-0000-0000-0000-000000000001', false,
 'Neversink River Resort', 'Godeffroy, NY · Orange Co.',
 '108 Guymard Turnpike, Godeffroy, NY', '(845) 239-7598',
 'https://www.stayneversink.com', 'Team Outsider (NYC group)',
 'Rebranded 2022', 70, 300, null, true, 'pass',
 10,0,0,0,0,8,8,8,
 'HARD PASS. NYC hospitality group, Google Ads, design agency.');

-- Hunter Airbnb benchmark
insert into properties (search_id, is_benchmark, name, location, address, website, owner, seasonal, status, ski_proximity, views_privacy, price_to_revenue, outdoor_amenities, property_condition, unique_architecture, year_round_appeal, proximity, bedrooms, bathrooms, notes) values
('a2000000-0000-0000-0000-000000000002', true,
 '⭐ Hunter Mountain A-Frame (Benchmark)', 'Hunter, NY · Greene Co.',
 'Hunter, NY 12442',
 'https://www.airbnb.com/rooms/1318794587995802968',
 'James (Superhost)', false, 'saved',
 10,9,7,10,8,9,9,8,
 5, 4,
 '5BR/4BA A-frame. 14 guests. 4.97★, 59 reviews. 0.5mi to Hunter Mountain. Hot tub w/ mountain views, barrel sauna, game loft, fireplace, radiant heat, outdoor kitchen, EV charger. The model to replicate.');
