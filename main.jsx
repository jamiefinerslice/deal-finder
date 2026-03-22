// ─── SEARCH TYPE DEFINITIONS ─────────────────────────────────────────────────

export const SEARCH_TYPES = {
  spa_resort: {
    id: "spa_resort",
    label: "Tiny Home Spa",
    icon: "🛁",
    color: "#4a7c59",
    colorLight: "#edf4ea",
    tagline: "Micro Wellness Campground Resort",
    description: "Small campgrounds/cabin properties near NYC to transform into year-round wellness tiny home spa resorts with creek frontage.",
    criteria: [
      { key:"waterFrontage",          label:"Water Frontage",      emoji:"🌊", weight:20, description:"Creek/river on the actual parcel" },
      { key:"ownerSuccession",        label:"Owner Succession",    emoji:"👴", weight:20, description:"Long tenure, aging owner, no clear heir" },
      { key:"improvementOpportunity", label:"Upside Opportunity",  emoji:"📈", weight:15, description:"Seasonal only, minimal cabins, dated infrastructure" },
      { key:"bookingSystem",          label:"Booking System Age",  emoji:"📞", weight:10, description:"Phone/mail = owner not reinvesting" },
      { key:"webPresence",            label:"Weak Web Presence",   emoji:"🕸️", weight:10, description:"Old/basic site = same signal" },
      { key:"acreage",                label:"Acreage Fit",         emoji:"🗺️", weight:10, description:"20–80 acres is the sweet spot" },
      { key:"proximity",              label:"NYC Proximity",       emoji:"🗽", weight: 8, description:"Under 2 hrs from NYC" },
      { key:"existingCabins",         label:"Existing Structures", emoji:"🏚️", weight: 7, description:"Cabins/buildings to convert" },
    ],
    benchmarkNote: "Simpler Times Cabins, Phoenicia NY: 6ac, 9 cabins, 21 RV pads, Esopus Creek, 3-gen family, $2.1M. Now off market.",
    systemPrompt: (properties) => `You are an expert property research assistant for the "Tiny Home Spa" deal search — finding small campground/cabin properties near NYC to transform into year-round wellness micro resorts.

## THE INVESTMENT THESIS
Target: Small, family-owned campground or cabin operation with creek/river frontage within 2 hours of NYC. Transform into a wellness-focused tiny home spa resort with:
- 8–13 creekside tiny home spa units (~$130K each, ADR $450–$550/night)
- Renovated cabin village for groups
- Wellness amenity pods (sauna, fitness, cold plunge)
- Year-round operations (vs. seasonal)
- Target acquisition: $1.5M–$2.5M

## BENCHMARK
Simpler Times Cabins, Phoenicia NY: 6 acres, 9 cabins, 21 RV pads, Esopus Creek, 3-generation family, $2.1M. Now off market. This is the profile to match.

## SCORING CRITERIA
- 🌊 Water Frontage (20%): Creek/river on the actual parcel
- 👴 Owner Succession (20%): Long tenure, aging owner, no clear heir
- 📈 Upside Opportunity (15%): Seasonal only, minimal cabins, dated infrastructure
- 📞 Booking System Age (10%): Phone/mail = owner not reinvesting
- 🕸️ Weak Web Presence (10%): Old/basic site
- 🗺️ Acreage Fit (10%): 20–80 acres ideal
- 🗽 NYC Proximity (8%): Under 2 hrs
- 🏚️ Existing Structures (7%): Cabins to convert

## KEY DISQUALIFIERS
- Recently rebranded or new owners actively investing
- No confirmed water frontage on the parcel
- Corporate franchise (KOA etc.)
- Too large (150+ site RV resort)
- No septic infrastructure

## CURRENTLY TRACKED (${properties.length} properties)
${properties.map(p => `- ${p.name} | ${p.status} | Score: ${p.score ?? "★"} | ${p.acres ?? "?"}ac | Owner: ${p.owner}`).join("\n")}

You can suggest new properties using this exact JSON format:
\`\`\`add-property
{"name":"...","location":"...","address":"...","phone":"...","website":"...","owner":"...","founded_years":"...","acres":null,"sites":null,"cabins":null,"seasonal":true,"water_frontage":5,"owner_succession":5,"improvement_opportunity":5,"booking_system":5,"web_presence":5,"acreage":5,"proximity":5,"existing_cabins":5,"notes":"...","status":"investigate"}
\`\`\`

Be direct and actionable. Suggest real properties, draft real letters, give real analysis.`
  },

  luxury_airbnb: {
    id: "luxury_airbnb",
    label: "Luxury Airbnb",
    icon: "🏔",
    color: "#2563a8",
    colorLight: "#e8f0fb",
    tagline: "Ski / Mountain Premium STR",
    description: "Undervalued cabins and A-frames near ski mountains to develop into high-performing luxury short-term rentals.",
    criteria: [
      { key:"skiProximity",       label:"Ski Proximity",          emoji:"⛷️", weight:22, description:"Within 1mi of ski mountain or year-round draw" },
      { key:"viewsPrivacy",       label:"Views & Privacy",        emoji:"🏔",  weight:18, description:"Mountain views, secluded, no neighbors visible" },
      { key:"priceToRevenue",     label:"Price-to-Revenue",       emoji:"💰", weight:18, description:"Acquisition price vs. likely annual Airbnb revenue" },
      { key:"outdoorAmenities",   label:"Outdoor Amenity Upside", emoji:"🛁", weight:14, description:"Space for hot tub, sauna, fire pit, deck" },
      { key:"propertyCondition",  label:"Condition / Bones",      emoji:"🏗️", weight:12, description:"Good structure but cosmetically dated = opportunity" },
      { key:"uniqueArchitecture", label:"Unique Architecture",    emoji:"✨", weight: 8, description:"A-frame, log cabin — Instagram-worthy" },
      { key:"yearRoundAppeal",    label:"Year-Round Appeal",      emoji:"🍂", weight: 5, description:"Ski + hiking + foliage = 4-season income" },
      { key:"proximity",          label:"NYC Proximity",          emoji:"🗽", weight: 3, description:"Under 3 hrs from NYC" },
    ],
    benchmarkNote: "Hunter Mountain A-Frame: 5BR/4BA, 14 guests, 4.97★, 0.5mi to Hunter, hot tub, sauna, game loft, $600–$1,500/night.",
    systemPrompt: (properties) => `You are an expert short-term rental investment advisor specializing in luxury ski cabin properties in the Catskills and Northeast mountains.

## THE INVESTMENT THESIS
Find undervalued cabins, A-frames, and mountain homes near ski resorts within 2–3 hours of NYC. Acquire, upgrade, and operate as premium luxury STRs targeting $600–$1,500/night.

Key upgrades that transform performance: outdoor hot tub, barrel sauna, fire pit, premium kitchen, EV charger, game room.

## BENCHMARK
Hunter Mountain A-Frame (Airbnb 1318794587995802968):
- 5BR/4BA, 14 guests, 4.97★ (59 reviews), Superhost James
- 0.5 miles from Hunter Mountain
- Hot tub w/ mountain views, barrel sauna, game loft, fireplace, radiant heat, outdoor kitchen, EV charger
- This is the model to replicate

## TARGET METRICS
- Acquisition: under $800K
- Target ADR: $600–$1,500/night
- Target occupancy: 55–70%
- Target annual revenue: $150K–$300K
- Target NOI: 40–55% after expenses
- Payback: 8–12 years

## CURRENTLY TRACKED (${properties.length} properties)
${properties.map(p => `- ${p.name} | ${p.status} | ${p.address || p.location}`).join("\n")}

You can suggest new properties using:
\`\`\`add-property
{"name":"...","location":"...","address":"...","phone":"...","website":"...","owner":"...","founded_years":"...","acres":null,"asking_price":null,"bedrooms":null,"bathrooms":null,"ski_proximity":5,"views_privacy":5,"price_to_revenue":5,"outdoor_amenities":5,"property_condition":5,"unique_architecture":5,"year_round_appeal":5,"proximity":5,"notes":"...","status":"investigate"}
\`\`\`

Be direct. Give Zillow/Realtor links when possible. Assess Airbnb revenue potential. Recommend specific upgrades.`
  }
}

// ─── SCORING ─────────────────────────────────────────────────────────────────

export function scoreProperty(typeId, prop) {
  if (prop.is_benchmark) return "★"
  const criteria = SEARCH_TYPES[typeId]?.criteria || []
  let total = 0, max = 0
  criteria.forEach(({ key, weight }) => {
    // Support both camelCase (legacy) and snake_case (DB) keys
    const snakeKey = key.replace(/([A-Z])/g, '_$1').toLowerCase()
    const val = prop[key] ?? prop[snakeKey] ?? 0
    total += (val / 10) * weight
    max += weight
  })
  return Math.round((total / max) * 100)
}

export function grade(score) {
  if (score === "★") return { g:"★", color:"#7c5c00", bg:"#fff3cd" }
  if (score >= 75)   return { g:"A",  color:"#4a7c59", bg:"#edf4ea" }
  if (score >= 60)   return { g:"B",  color:"#2563a8", bg:"#e8f0fb" }
  if (score >= 45)   return { g:"C",  color:"#b07d2a", bg:"#fdf3e3" }
  return                    { g:"D",  color:"#9b2c2c", bg:"#fdecea" }
}

export const STATUS = {
  saved:       { label:"Saved",       icon:"✅", border:"#4a7c59" },
  investigate: { label:"Investigate", icon:"🔍", border:"#d4a017" },
  watch:       { label:"Watch",       icon:"👁",  border:"#4a80c4" },
  pass:        { label:"Pass",        icon:"❌", border:"#c0392b" },
}

export function barColor(v) { return v >= 7 ? "#4a7c59" : v >= 4 ? "#d4a017" : "#b5434a" }
export function formatUrl(u) { if (!u) return null; return u.startsWith("http") ? u : "https://"+u }
export function displayDomain(u) { if (!u) return null; try { return new URL(formatUrl(u)).hostname.replace("www.","") } catch { return u.slice(0,30) } }
export function fmtTime(ts) { const d = new Date(ts); return d.toLocaleDateString("en-US",{month:"short",day:"numeric"})+" "+d.toLocaleTimeString("en-US",{hour:"numeric",minute:"2-digit"}) }

export const SERIF = "'Georgia','Times New Roman',serif"
export const BG = "#0e1a11"
export const SURFACE = "#1a2d1e"
export const CREAM = "#f4f0e8"
export const MUTED = "#8aad78"
export const PARCHMENT = "#e8dfc8"
export const FOREST = "#1c2b1e"
