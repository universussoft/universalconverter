# Universal Unit Converter

**+1300 units · 140+ categories · 6 languages · 100% free · no ads · single HTML file**

A comprehensive unit converter and calculator suite that runs entirely in the browser — no server, no installation, no dependencies. Just open the file.

---

## Features

### Unit Conversion (125 categories, 1300+ units)

| Group | Categories |
|---|---|
| **Physics** | Length, Mass, Temperature, Volume, Speed, Area, Time, Pressure, Energy, Power, Force, Torque, Acceleration, Density, Frequency, Angle, Wavenumber, Specific Impulse, Elastic Modulus, Entropy, Hardness, Moment of Inertia |
| **Electrical** | Voltage, Electric Charge, Capacitance, Inductance, Current, Resistance, Resistivity, Conductivity, Electric Field, Permittivity, Magnetic Field, Magnetic Flux, Permeability, Illuminance, Luminosity, Radioactivity, Radiation Dose |
| **Thermal** | Thermal Resistance, Irradiance, Energy Density, Power Density, Specific Heat, Thermal Conductivity |
| **Digital** | Data Storage, Data Speed, Bandwidth, Number Bases, ASCII/Unicode, IP/CIDR Networks, dBm/RF Power, DPI & Print |
| **Chemistry** | Concentration, Amount of Substance, Proportion, Ideal Gases, Moles/Mass, Water Hardness, pH |
| **Engineering** | Volume Flow, Mass Flow, Fuel Economy, AWG Wire Gauge, Drill Bits, Pipe Sizes, Sheet Metal Gauge, Screws/Bolts, Concrete Strength, Map Scale, Slope/Grade, Typography |
| **Health** | Blood Glucose, Cholesterol, HbA1c, Blood Pressure, Human Body, Running Pace, VO₂max, HR Training Zones |
| **Geo / Climate** | GPS Coordinates, Altitude/Pressure, Seismic Scale, Beaufort Wind, UV Index, Nautical |
| **Astronomy** | Stellar Magnitude, Wave ↔ Frequency |
| **Arts / Media** | Sound Level, Music/BPM, Photography, RGB Colors, Color Temperature |
| **Fashion / Sizes** | Women's/Men's/Kids' Shoes, Women's/Men's/Kids' Clothing, Jeans/Belts, Hats, Rings, Gloves, Tyre Sizes |
| **Paper / Screen** | ISO Paper (A/B/C), NA/JIS Paper, Monitor/TV sizes |
| **Cooking** | Volume, Weight, Wine Bottles |
| **Mathematics** | Roman Numerals (up to 3,999,999), Percentages, Z-score, Probability |
| **Materials** | Gold/Metals, Alternative Fuels, Agrarian Measures, Batteries |

### Interactive Calculators (15 cards)

| Calculator | Description |
|---|---|
| 💱 **Currency** | Live exchange rates (150+ currencies) via open.er-api.com, 1h cache, fallback offline rates |
| 🧮 **BMI** | Body Mass Index with WHO classification |
| 🕐 **Time Zones** | Convert any time between timezones + live clocks with day-progress bar |
| 💰 **Interest** | Simple and compound interest |
| ⚖️ **Proportions** | Rule of three, scale/model, recipe scaling, dilution (C₁V₁=C₂V₂) |
| ⚡ **Electricity Cost** | kWh cost calculator with country presets (PT, ES, FR, DE, UK, US...) |
| 🧾 **VAT** | Add/remove VAT with country tax rates |
| 📈 **Margin** | Margin & markup calculator with sector benchmarks |
| 🏦 **Loan** | Monthly payment + full amortization table |
| 🔥 **Calories / TDEE** | Mifflin-St Jeor, Harris-Benedict, Katch-McArdle formulas |
| 💊 **Vitamins** | Unit conversions (IU↔µg) + RDA reference values |
| 💧 **Hydration** | Daily water intake based on weight, temperature, exercise |
| 🌡️ **Wind Chill** | Feels-like temperature (wind chill + heat index + humidex) |
| ⛽ **Trip Cost** | Fuel cost calculator with multi-fuel comparison |
| 🎨 **Paint** | Litres needed per room with coverage and can sizes |

### Sport & Fitness Calculators

- **🏋️ 1RM Strength** — Epley, Brzycki, Lander formulas + load percentages by goal
- **🚴 Cycling Power** — FTP-based training zones (W/kg)
- **🏊 Swimming** — Pace /100m ↔ /100yd, event times
- **🏔️ Altitude & Hypoxia** — Atmospheric pressure, SpO₂ estimate, acclimatisation

### Astronomy & Astrology

- **🌟 Natal Chart** — Western zodiac sun/moon/rising sign + planets
- **🌙 Moon Phase** — Phase for any date + next phases + lunar distance
- **📅 Calendars** — Gregorian ↔ Julian, Hebrew, Islamic, Persian, Chinese, Coptic, Ethiopian
- **🗓️ Lunar Calendar** — Full/New moons, supermoons, eclipses for any year
- **🐉 Chinese Astrology** — Animal sign, element (Metal/Water/Wood/Fire/Earth), Yin/Yang, Ganzhi (干支) 60-year cycle, compatibility

### Sizing Charts (measurement input → all sizes)

Women's/Men's/Kids' shoes, clothing, jeans, hats, rings, gloves, tyre sizes — enter your measurement in cm/mm and see all equivalent sizes (EU, US, UK, JP, BR, CN...) instantly.

---

## Languages

Full UI translation in **6 languages**: Portuguese 🇵🇹 · English 🇬🇧 · Spanish 🇪🇸 · French 🇫🇷 · German 🇩🇪 · Chinese 🇨🇳

All category names, unit labels, calculator outputs, badges, buttons, and tooltips are translated. Language preference is saved locally.

---

## Technical Details

- **Single HTML file** — zero external dependencies at runtime (fonts load from Google Fonts)
- **~535 KB** — everything included: all data, all logic, all styles
- **No build step** — edit and open directly in any browser
- **Local storage** — saves language, theme, favourites, conversion history, active timezone clocks
- **Live data** — currency rates fetched from `open.er-api.com` with 1h localStorage cache; falls back to hardcoded rates if offline
- **Embed widget** — generates iframe or script snippet to embed the converter in any website
- **Export** — conversion history exportable as CSV
- **Dark/light mode** — auto-detects system preference, toggleable

### Architecture

```
index.html
├── <style>          CSS variables, layout, components (~700 lines)
├── <body>           All card HTML (~600 lines)
└── <script>         All logic (~7200 lines)
    ├── CATEGORIES   125 category definitions with unit conversion factors
    ├── C dict       147 entries for category name translations
    ├── HTML_LBL     162 entries for static label translations
    ├── VCAT_NAMES   24 virtual category name translations
    ├── NEW_VCATS    15 virtual calculator cards
    ├── CAT_GROUPS   Group definitions in 6 languages
    ├── Converters   toBase/fromBase, special converters (roman, rgb, ascii...)
    ├── Calculators  15 interactive calculator functions
    └── applyLang()  Full UI re-render on language switch
```

---

## Roman Numerals

Supports numbers from 1 to **3,999,999** using vinculum notation (combining macron = ×1000):

`V̄` = 5,000 · `X̄` = 10,000 · `L̄` = 50,000 · `C̄` = 100,000 · `D̄` = 500,000 · `M̄` = 1,000,000

---

## Development Status

Actively developed. New categories and features are added regularly. Some values may still be incomplete or require validation. If you find an error, please open an issue or contact the developer.

---

## License

Free to use. No ads. No tracking. No data collection.

---

*Built with ♥ · Free forever*
