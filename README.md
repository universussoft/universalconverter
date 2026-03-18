# 🔭 Universal Converter

> **1,300+ units · 145 categories · 30+ interactive calculators · Free, no ads**

🌐 **Live:** [universalconverter.xyz](https://universalconverter.xyz)  
📦 **GitHub Pages:** [universussoft.github.io/universalconverter](https://universussoft.github.io/universalconverter/)

---

## What is it?

A complete, single-file web tool for unit conversion and interactive calculators. Runs 100% in the browser — no backend, no database, no sign-up required.

- **Single file** (`index.html`, ~360 KB) — download and open directly
- **6 languages** — PT · EN · ES · FR · DE · ZH
- **No ads, no tracking, no paywall**
- **Light/dark mode**, favourites, history, and built-in search

---

## Categories (145 total)

Organised into **19 collapsible groups**:

| Group | Main categories |
|---|---|
| 📐 Physics | Length, Mass, Temperature, Volume, Speed, Area, Time, Pressure, Energy, Power, Force, Torque, Acceleration, Density, Frequency, Angle… |
| ⚡ Electrical | Voltage, Current, Resistance, Capacitance, Inductance, Magnetic Field, Illuminance, Luminosity… |
| 🌡️ Thermal | Thermal Conductivity, Thermal Resistance, Irradiance, Energy Density… |
| 💻 Digital | Data Storage, Data Speed, Number Bases, ASCII/Unicode, IP/CIDR Networks, dBm/RF, DPI… |
| 🧪 Chemistry | pH, Ideal Gases, Moles/Mass, Concentration, Radioactivity, Radiation Dose, Viscosity… |
| 🏗️ Engineering | Map Scale, Typography, AWG Wire Gauge, Drill Bits, Pipe/Sheet Gauge, Bolts, Slope… |
| 🧍 Health | BMI, TDEE/Calories, Blood Glucose, Cholesterol, HbA1c, Blood Pressure, Vitamins, Hydration… |
| 🌍 Geo / Weather | GPS Coordinates, Altitude/Pressure, Seismic Scale, Beaufort/Wind, UV Index, Nautical… |
| 🔭 Astronomy | Natal Chart, Moon Phase, Lunar Year Calendar, Stellar Magnitude, Wave↔Frequency… |
| 🎨 Arts / Media | Sound Level, Music/BPM, Photography, RGB Colours, Colour Temperature… |
| 👗 Fashion / Sizes | Shoes (Women/Men/Kids), Clothing, Jeans, Hats, Rings, Gloves, Tyres, Monitor/TV… |
| 📄 Paper / Screen | ISO Paper (A/B/C), NA/JIS Paper, Monitor/TV diagonal… |
| 💰 Finance | Interest, Live Currency, VAT, Margin/Markup, Loan Payment… |
| 🏠 Home & Daily Life | Electricity Cost, Trip Cost, Paint Calculator, Wind Chill… |
| 🏅 Sports | 1RM/Loads, Cycling Power, Swimming, Altitude/Hypoxia, Running Pace… |
| 🔢 Maths | Roman Numerals, Percentages, Z-score, Probability, Proportions/Scales… |
| 🍳 Cooking | Culinary Measures, Wine Bottles, Recipe Scaling… |
| ⛏️ Materials | Gold/Metals, Batteries, Agrarian Measures, Alternative Fuels… |
| 🕐 Time / Zones | Timezone Table, Live Clocks (real-time)… |

---

## Interactive Calculators

Beyond numeric conversion, the tool includes **30+ interactive calculators**:

### 💱 Live Currency Converter
- 150+ currencies via [`open.er-api.com`](https://open.er-api.com) (free, no API key needed)
- 1-hour cache · Works offline after first load

### 🔭 Astronomy & Astrology
- **Natal chart** — Sun sign, Moon sign and all 10 planet positions for any date/time
- **Moon phase** — illumination %, Earth distance, Supermoon/Micromoon detection, next 4 phases
- **Lunar year calendar** — every phase in a year, Supermoons, Micromoons, Blue Moons, possible solar and lunar eclipses — Meeus algorithm, ±2 min accuracy
- **Calendar converter** — Gregorian → Julian, Islamic (Hijri), Hebrew, Persian (Solar Hijri), Julian Day Number, Unix timestamp

### 🏥 Health

| Calculator | What it does |
|---|---|
| 🧮 BMI | Weight + height → BMI with WHO visual scale |
| 🔥 Calories & TDEE | Mifflin/Harris-Benedict, macros, weight goals |
| 💊 Vitamins | mcg ↔ IU for A/D/E/K + minerals, % RDA and upper limit |
| 💧 Daily Hydration | Weight + temperature + exercise → litres/day |
| 🌡️ Feels Like | Wind Chill, Humidex, Heat Index |

### 💰 Finance

| Calculator | What it does |
|---|---|
| 🧾 VAT | Bidirectional, preset rates for PT/ES/FR/DE/UK/BR |
| 📈 Margin & Markup | Cost ↔ selling price, % margin ↔ % markup |
| 🏦 Loan Payment | Monthly PMT + full annual amortisation table |
| 💰 Interest | Simple and compound, year-by-year evolution table |
| ⚡ Electricity Cost | W × h × days → kWh and cost in €/$, preset tariffs for 6 countries |

### 🏠 Daily Life

| Calculator | What it does |
|---|---|
| ⛽ Trip Cost | Distance + consumption + price → cost, compares fuel types |
| 🎨 Paint Calculator | m² + coats + coverage rate → litres and tins needed |
| ⚖️ Proportions & Scales | Rule of three, scale models, recipe scaling, dilution C₁V₁=C₂V₂ |

### 🏅 Sports

| Calculator | What it does |
|---|---|
| 🏋️ 1RM & Loads | Epley + Brzycki + Lander, % by training goal |
| 🚴 Cycling Power | W/kg, FTP, 7 training zones, kcal estimate |
| 🏊 Swimming | pace /100m ↔ /100yd, race time predictions |
| 🏔️ Altitude & Hypoxia | pO₂, estimated SpO₂, acclimatisation days, famous peaks |

---

## UX Features

| Feature | Description |
|---|---|
| 🔍 Category search | Live filter by category name or unit name |
| ⭐ Favourites | Pin categories to the top, saved in localStorage |
| 📜 History | Last 10 conversions, click any entry to restore |
| 📤 Export CSV | Download full history as `.csv` |
| 🌙 Light / dark mode | Toggle + automatic OS preference detection |
| 📋 Copy result | One click copies value + unit to clipboard |
| 🔗 Shareable URL | `?cat=...&from=...&to=...&val=...` |
| 🧮 Formula display | Shows conversion formula or factor below the result |
| 🗂️ Collapsible groups | 19 groups with collapse state saved between sessions |
| 🌍 Live timezones | Real-time clocks for world cities, add/remove freely |

---

## SEO & Metadata

- Dynamic `<title>` per language
- Meta description, keywords, author
- **Open Graph** (Facebook, WhatsApp, LinkedIn)
- **Twitter/X Card** `summary_large_image`
- **JSON-LD Structured Data**: `WebApplication` + `FAQPage` + `BreadcrumbList`
- `<link rel="canonical">` → `universalconverter.xyz`
- `<link rel="alternate">` → GitHub Pages
- Crawlable `<section>` listing all 145 categories for Googlebot
- [`sitemap.xml`](sitemap.xml) — 144 URLs with priorities and `changefreq`
- [`robots.txt`](robots.txt) pointing to both sitemaps

---

## Tech Stack

| Technology | Usage |
|---|---|
| HTML5 / CSS3 / Vanilla JS | Everything — zero runtime dependencies |
| CSS Custom Properties | Light/dark theme, design system tokens |
| `localStorage` + memory fallback | Favourites, history, groups, theme — works on `file://` too |
| `open.er-api.com` | Live exchange rates, no API key required |
| Google Fonts | DM Mono + Fraunces |
| Web Share API + Clipboard API | Native mobile sharing + copy to clipboard |
| `execCommand` fallback | Full compatibility including local `file://` |
| Meeus *Astronomical Algorithms* | Sun longitude, moon phase JDE, eclipse detection |

**No frameworks. No build tools. No npm. No server.**  
Open `index.html` in any browser — it just works.

---

## Project Structure

```
universalconverter/
├── index.html    # Complete application (~360 KB, single file)
├── sitemap.xml   # 144 URLs for Google Search Console
├── robots.txt    # Crawler configuration
└── README.md     # This file
```

---

## Deployment

### GitHub Pages (current)
Served from the `main` branch.  
URL: `https://universussoft.github.io/universalconverter/`

### Custom domain
`universalconverter.xyz` redirects to GitHub Pages via CNAME.

1. Create a `CNAME` file in the repo root containing `universalconverter.xyz`
2. In your domain registrar, add a CNAME record pointing to `universussoft.github.io`

### Run locally
```bash
# No server needed
open index.html

# With local server (recommended for PWA features)
python3 -m http.server 8080
# or
npx serve .
```

---

## Google Search Console Setup

1. Go to [search.google.com/search-console](https://search.google.com/search-console)
2. Add property `universalconverter.xyz`
3. Verify via HTML file or DNS TXT record
4. Under *Sitemaps* → submit `https://universalconverter.xyz/sitemap.xml`
5. Use *URL Inspection* to request indexing of the homepage
6. Test structured data at [search.google.com/test/rich-results](https://search.google.com/test/rich-results)

---

## Project Stats

| Metric | Value |
|---|---|
| Deliverable | Single `index.html` |
| File size | ~360 KB (uncompressed) |
| Lines of code | ~6,500 |
| Conversion categories | 145 |
| Indexed units | 1,300+ |
| Interactive calculators | 30+ |
| Languages | 6 (PT, EN, ES, FR, DE, ZH) |
| Category groups | 19 |
| Sitemap URLs | 144 |
| Runtime dependencies | **0** |

---

## Roadmap

- [ ] **PWA** — Service Worker + `manifest.json` for home screen installation
- [ ] **Inline calculator** — evaluate math expressions (`5*12`, `sqrt(9)`) in the input field
- [ ] **Keyboard shortcuts** — `S` swap, `/` search, `?` shortcut modal
- [ ] **Quiz mode** — learn unit scales through gameplay with scoring and streaks
- [ ] **Natural language chat** — "how many km is 3 miles?" powered by Anthropic API
- [ ] **Stats dashboard** — top categories, daily streak, weekly activity graph
- [ ] **Custom units** — define your own name, symbol and conversion factor
- [ ] **Conversion graph** — inline SVG curve showing the relationship between two units
- [ ] **Calories burned** — MET values for 35+ activities

---

## Author

**Américo Rodrigues**  
[linkedin.com/in/americomateusrodrigues](https://www.linkedin.com/in/americomateusrodrigues/)

Actively developed — new categories and calculators are added regularly.  
Found a bug or have a suggestion? Open an [issue](https://github.com/universussoft/universalconverter/issues) or reach out on LinkedIn.

---

## License

Distributed freely for personal and educational use.  
© Américo Rodrigues — All rights reserved.

---

<div align="center">
  Made with ♥ &nbsp;·&nbsp; Free forever &nbsp;·&nbsp; <a href="https://universalconverter.xyz">universalconverter.xyz</a>
</div>
