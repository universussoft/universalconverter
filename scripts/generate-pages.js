#!/usr/bin/env node
/**
 * Generates static, crawlable landing pages for every category and
 * calculator listed in the sidebar, in all 6 site languages, plus a fresh
 * sitemap.xml with hreflang annotations.
 *
 * Each page embeds the real, working tool via index.html's existing
 * ?embed=1&cat=<key>&lang=<lang> mechanism (see openEmbedPanel()/
 * buildEmbedURL() in index.html) — no logic is duplicated, the page is
 * just SEO-friendly scaffolding (title/description/H1/unit list) around
 * an <iframe>.
 *
 * Layout:
 *   c/<pt-slug>/index.html        — Portuguese (default/canonical)
 *   en/c/<en-slug>/index.html     — English
 *   es/c/<es-slug>/index.html     — Spanish
 *   fr/c/<fr-slug>/index.html     — French
 *   de/c/<de-slug>/index.html     — German
 *   zh/c/<zh-slug>/index.html     — Chinese (slug falls back to the
 *                                    English one — Chinese names don't
 *                                    survive ASCII slugification)
 *
 * Input:  scripts/extracted-data.json — produced by running the JS in
 *         scripts/extract-in-browser.js inside a loaded copy of index.html.
 *         scripts/unit-translations.js — manual EN/ES/FR/DE/ZH translations
 *         for every unit/label string that isn't already language-neutral
 *         (symbols like "kg/L" or "PSI" need no entry there).
 * Output: one index.html per category per language, and sitemap.xml.
 *
 * Usage:  node scripts/generate-pages.js
 */
const fs = require('fs');
const path = require('path');
const UNIT_TRANSLATIONS = require('./unit-translations.js');

const ROOT = path.join(__dirname, '..');
const BASE_URL = 'https://universussoft.github.io/universalconverter'; // update if a custom domain goes live
const DATA_FILE = path.join(__dirname, 'extracted-data.json');
const TODAY = new Date().toISOString().slice(0, 10);
const LANGS = ['pt', 'en', 'es', 'fr', 'de', 'zh'];
const LANG_LOCALE = { pt: 'pt-PT', en: 'en', es: 'es', fr: 'fr', de: 'de', zh: 'zh-CN' };

// ── UI chrome strings (everything on the page that isn't category-specific) ──
const UI = {
  backHome: { pt: '← Universal Converter', en: '← Universal Converter', es: '← Universal Converter', fr: '← Universal Converter', de: '← Universal Converter', zh: '← Universal Converter' },
  freeSuffix: { pt: 'Grátis', en: 'Free', es: 'Gratis', fr: 'Gratuit', de: 'Kostenlos', zh: '免费' },
  unitsHeading: { pt: 'Unidades suportadas', en: 'Supported units', es: 'Unidades admitidas', fr: 'Unités prises en charge', de: 'Unterstützte Einheiten', zh: '支持的单位' },
  optionsHeading: { pt: 'Opções disponíveis', en: 'Available options', es: 'Opciones disponibles', fr: 'Options disponibles', de: 'Verfügbare Optionen', zh: '可选项' },
  footerTemplate: {
    pt: (name, total, home) => `${name} é uma das ${total}+ categorias e calculadoras grátis do <a href="${home}">Universal Converter</a> — +1300 unidades, 6 idiomas, sem anúncios, sem registo.`,
    en: (name, total, home) => `${name} is one of ${total}+ free categories and calculators on <a href="${home}">Universal Converter</a> — +1300 units, 6 languages, no ads, no sign-up.`,
    es: (name, total, home) => `${name} es una de las ${total}+ categorías y calculadoras gratuitas de <a href="${home}">Universal Converter</a> — +1300 unidades, 6 idiomas, sin anuncios, sin registro.`,
    fr: (name, total, home) => `${name} fait partie des ${total}+ catégories et calculatrices gratuites d'<a href="${home}">Universal Converter</a> — +1300 unités, 6 langues, sans publicité, sans inscription.`,
    de: (name, total, home) => `${name} ist eine von ${total}+ kostenlosen Kategorien und Rechnern auf <a href="${home}">Universal Converter</a> — +1300 Einheiten, 6 Sprachen, ohne Werbung, ohne Anmeldung.`,
    zh: (name, total, home) => `${name}是<a href="${home}">Universal Converter</a>提供的${total}+免费分类与计算器之一 — 超过1300种单位、6种语言、无广告、无需注册。`,
  },
  converterHeading: {
    pt: name => `Conversor de ${name}`,
    en: name => `${name} Converter`,
    es: name => `Conversor de ${name}`,
    fr: name => `Convertisseur de ${name}`,
    de: name => `${name}-Umrechner`,
    zh: name => `${name}换算器`,
  },
  converterDesc: {
    pt: (name, count, sample, more) => `Conversor de ${name}: converte entre ${count} unidades — ${sample}${more}. Grátis, instantâneo, sem anúncios.`,
    en: (name, count, sample, more) => `${name} converter: converts between ${count} units — ${sample}${more}. Free, instant, no ads.`,
    es: (name, count, sample, more) => `Conversor de ${name}: convierte entre ${count} unidades — ${sample}${more}. Gratis, instantáneo, sin anuncios.`,
    fr: (name, count, sample, more) => `Convertisseur de ${name} : convertit entre ${count} unités — ${sample}${more}. Gratuit, instantané, sans publicité.`,
    de: (name, count, sample, more) => `${name}-Umrechner: rechnet zwischen ${count} Einheiten um — ${sample}${more}. Kostenlos, sofort, ohne Werbung.`,
    zh: (name, count, sample, more) => `${name}换算器：支持${count}种单位互相换算 — ${sample}${more}。免费、即时、无广告。`,
  },
  lookupDesc: {
    pt: (name, count, sample, more) => `Tabela de conversão de ${name}: ${count} opções, incluindo ${sample}${more}. Grátis, sem anúncios.`,
    en: (name, count, sample, more) => `${name} conversion table: ${count} options, including ${sample}${more}. Free, no ads.`,
    es: (name, count, sample, more) => `Tabla de conversión de ${name}: ${count} opciones, incluyendo ${sample}${more}. Gratis, sin anuncios.`,
    fr: (name, count, sample, more) => `Table de conversion ${name} : ${count} options, dont ${sample}${more}. Gratuit, sans publicité.`,
    de: (name, count, sample, more) => `${name}-Umrechnungstabelle: ${count} Optionen, darunter ${sample}${more}. Kostenlos, ohne Werbung.`,
    zh: (name, count, sample, more) => `${name}对照表：共${count}个选项，包括${sample}${more}。免费，无广告。`,
  },
  calcFallbackDesc: {
    pt: name => `Calculadora de ${name} — grátis, instantânea, sem anúncios.`,
    en: name => `${name} calculator — free, instant, no ads.`,
    es: name => `Calculadora de ${name} — gratis, instantánea, sin anuncios.`,
    fr: name => `Calculatrice ${name} — gratuite, instantanée, sans publicité.`,
    de: name => `${name}-Rechner — kostenlos, sofort, ohne Werbung.`,
    zh: name => `${name}计算器 — 免费、即时、无广告。`,
  },
  more: { pt: ' e mais', en: ' and more', es: ' y más', fr: ' et plus', de: ' und mehr', zh: '等' },
  langSwitcherLabel: { pt: 'Idioma', en: 'Language', es: 'Idioma', fr: 'Langue', de: 'Sprache', zh: '语言' },
  supTitle: { pt: 'Gostou da ferramenta?', en: 'Find this useful?', es: '¿Te fue útil?', fr: 'Outil utile ?', de: 'Nützlich gefunden?', zh: '觉得有用吗？' },
  supDesc: {
    pt: 'Esta ferramenta é gratuita e sem anúncios. Se te foi útil, considera apoiar o desenvolvimento com qualquer valor — mesmo 1€ faz diferença!',
    en: 'This tool is free and ad-free. If it helped you, consider supporting development with any amount — even $1 makes a difference!',
    es: 'Esta herramienta es gratuita y sin anuncios. Si te ayudó, considera apoyar el desarrollo con cualquier cantidad.',
    fr: "Cet outil est gratuit et sans publicité. S'il vous a aidé, envisagez de soutenir son développement.",
    de: 'Dieses Tool ist kostenlos und werbefrei. Wenn es geholfen hat, unterstützen Sie die Entwicklung.',
    zh: '此工具免费且无广告。如果对您有帮助，请考虑支持开发。',
  },
  supBtn: { pt: 'Apoiar · Pague o que quiser', en: 'Support · Pay what you want', es: 'Apoyar · Paga lo que quieras', fr: 'Soutenir · Payez ce que vous voulez', de: 'Unterstützen · Zahlen Sie was Sie möchten', zh: '支持 · 随心付款' },
};
const DONATE_URL = 'https://buy.stripe.com/eVq00i49xemXgjJfVufIs00';

const GROUP_LABELS = {
  '📐 Física': { pt: 'Física', en: 'Physics', es: 'Física', fr: 'Physique', de: 'Physik', zh: '物理' },
  '⚡ Elétrica': { pt: 'Elétrica', en: 'Electrical', es: 'Eléctrica', fr: 'Électrique', de: 'Elektrik', zh: '电气' },
  '🌡️ Térmica': { pt: 'Térmica', en: 'Thermal', es: 'Térmica', fr: 'Thermique', de: 'Thermisch', zh: '热学' },
  '💻 Digital': { pt: 'Digital', en: 'Digital', es: 'Digital', fr: 'Numérique', de: 'Digital', zh: '数字' },
  '🧪 Química / Física': { pt: 'Química / Física', en: 'Chemistry / Physics', es: 'Química / Física', fr: 'Chimie / Physique', de: 'Chemie / Physik', zh: '化学/物理' },
  '🏗️ Engenharia': { pt: 'Engenharia', en: 'Engineering', es: 'Ingeniería', fr: 'Ingénierie', de: 'Technik', zh: '工程' },
  '🧍 Saúde': { pt: 'Saúde', en: 'Health', es: 'Salud', fr: 'Santé', de: 'Gesundheit', zh: '健康' },
  '💊 Farmácia': { pt: 'Farmácia', en: 'Pharmacy', es: 'Farmacia', fr: 'Pharmacie', de: 'Pharmazie', zh: '药学' },
  '🌍 Geo / Clima': { pt: 'Geo / Clima', en: 'Geo / Climate', es: 'Geo / Clima', fr: 'Géo / Climat', de: 'Geo / Klima', zh: '地理/气候' },
  '🔭 Astronomia': { pt: 'Astronomia', en: 'Astronomy', es: 'Astronomía', fr: 'Astronomie', de: 'Astronomie', zh: '天文' },
  '🎨 Artes / Média': { pt: 'Artes / Média', en: 'Arts / Media', es: 'Artes / Medios', fr: 'Arts / Médias', de: 'Kunst / Medien', zh: '艺术/媒体' },
  '👗 Moda / Tamanhos': { pt: 'Moda / Tamanhos', en: 'Fashion / Sizes', es: 'Moda / Tallas', fr: 'Mode / Tailles', de: 'Mode / Größen', zh: '时尚/尺码' },
  '📄 Papel / Monitor': { pt: 'Papel / Monitor', en: 'Paper / Screen', es: 'Papel / Pantalla', fr: 'Papier / Écran', de: 'Papier / Monitor', zh: '纸张/屏幕' },
  '🍳 Culinária': { pt: 'Culinária', en: 'Cooking', es: 'Cocina', fr: 'Cuisine', de: 'Küche', zh: '烹饪' },
  '💰 Finanças': { pt: 'Finanças', en: 'Finance', es: 'Finanzas', fr: 'Finance', de: 'Finanzen', zh: '金融' },
  '🕐 Tempo / Zona': { pt: 'Tempo / Zona', en: 'Time / Zone', es: 'Tiempo / Zona', fr: 'Temps / Fuseau', de: 'Zeit / Zone', zh: '时间/时区' },
  '🔢 Matemática': { pt: 'Matemática', en: 'Mathematics', es: 'Matemáticas', fr: 'Mathématiques', de: 'Mathematik', zh: '数学' },
  '⛏️ Materiais': { pt: 'Materiais', en: 'Materials', es: 'Materiales', fr: 'Matériaux', de: 'Materialien', zh: '材料' },
  '🏠 Casa & Quotidiano': { pt: 'Casa & Quotidiano', en: 'Home & Daily', es: 'Casa & Cotidiano', fr: 'Maison & Quotidien', de: 'Haus & Alltag', zh: '家居日常' },
  '🏅 Desporto': { pt: 'Desporto', en: 'Sport', es: 'Deporte', fr: 'Sport', de: 'Sport', zh: '运动' },
  '🎓 Educação': { pt: 'Educação', en: 'Education', es: 'Educación', fr: 'Éducation', de: 'Bildung', zh: '教育' },
};

const CALC_DESCRIPTIONS = {
  '🖨️ DPI Impressão': {
    pt: 'Calcula o DPI/PPI de uma imagem a partir da resolução em pixels e do tamanho de impressão, com resoluções comuns de impressão como referência.',
    en: 'Calculates an image\'s DPI/PPI from its pixel resolution and print size, with common print resolutions for reference.',
    es: 'Calcula el DPI/PPI de una imagen a partir de la resolución en píxeles y el tamaño de impresión, con resoluciones comunes como referencia.',
    fr: "Calcule le DPI/PPI d'une image à partir de sa résolution en pixels et de sa taille d'impression, avec des résolutions courantes en référence.",
    de: 'Berechnet den DPI/PPI-Wert eines Bildes aus Pixelauflösung und Druckgröße, mit gängigen Druckauflösungen als Referenz.',
    zh: '根据像素分辨率和打印尺寸计算图像的DPI/PPI，并提供常见打印分辨率作参考。',
  },
  '🖥️ Rácio de Aspeto': {
    pt: 'Simplifica largura×altura numa proporção (16:9, 4:3...), mostra o rácio decimal, os megapixels e presets comuns (Full HD, 4K, Stories, redes sociais).',
    en: 'Simplifies width×height into a ratio (16:9, 4:3...), shows the decimal ratio, megapixels, and common presets (Full HD, 4K, Stories, social media).',
    es: 'Simplifica ancho×alto en una proporción (16:9, 4:3...), muestra la relación decimal, los megapíxeles y presets comunes (Full HD, 4K, Stories, redes sociales).',
    fr: "Simplifie largeur×hauteur en un ratio (16:9, 4:3...), affiche le ratio décimal, les mégapixels et des préréglages courants (Full HD, 4K, Stories, réseaux sociaux).",
    de: 'Vereinfacht Breite×Höhe zu einem Verhältnis (16:9, 4:3...), zeigt das Dezimalverhältnis, Megapixel und gängige Voreinstellungen (Full HD, 4K, Stories, soziale Medien).',
    zh: '将宽×高化简为比例（16:9、4:3等），显示十进制比例、百万像素数，以及常见预设（全高清、4K、Stories、社交媒体）。',
  },
  '🔌 AWG': {
    pt: 'Converte bitola de fio elétrico AWG, calcula queda de tensão e sugere a secção mínima recomendada consoante a corrente e instalação.',
    en: 'Converts AWG electrical wire gauge, calculates voltage drop, and suggests the minimum recommended gauge for the current and installation.',
    es: 'Convierte calibre de cable eléctrico AWG, calcula la caída de tensión y sugiere la sección mínima recomendada según la corriente e instalación.',
    fr: 'Convertit la section de câble électrique AWG, calcule la chute de tension et suggère la section minimale recommandée selon le courant et l\'installation.',
    de: 'Rechnet AWG-Drahtquerschnitt um, berechnet den Spannungsabfall und schlägt den empfohlenen Mindestquerschnitt je nach Strom und Installation vor.',
    zh: '换算AWG电线规格，计算电压降，并根据电流和安装方式建议最小推荐线规。',
  },
  '🧮 IMC': {
    pt: 'Calcula o Índice de Massa Corporal a partir do peso e altura, com a classificação oficial da OMS.',
    en: 'Calculates Body Mass Index from weight and height, with the official WHO classification.',
    es: 'Calcula el Índice de Masa Corporal a partir del peso y la altura, con la clasificación oficial de la OMS.',
    fr: "Calcule l'Indice de Masse Corporelle à partir du poids et de la taille, avec la classification officielle de l'OMS.",
    de: 'Berechnet den Body-Mass-Index aus Gewicht und Größe, mit der offiziellen WHO-Klassifikation.',
    zh: '根据体重和身高计算体重指数（BMI），并采用世卫组织官方分类标准。',
  },
  '🔥 Calorias TDEE': {
    pt: 'Calcula as calorias diárias (TDEE) pelas fórmulas Mifflin-St Jeor, Harris-Benedict e Katch-McArdle, consoante idade, peso, altura e atividade.',
    en: 'Calculates daily calories (TDEE) using the Mifflin-St Jeor, Harris-Benedict, and Katch-McArdle formulas, based on age, weight, height, and activity.',
    es: 'Calcula las calorías diarias (TDEE) con las fórmulas Mifflin-St Jeor, Harris-Benedict y Katch-McArdle, según edad, peso, altura y actividad.',
    fr: "Calcule les calories quotidiennes (TDEE) selon les formules Mifflin-St Jeor, Harris-Benedict et Katch-McArdle, selon l'âge, le poids, la taille et l'activité.",
    de: 'Berechnet den täglichen Kalorienbedarf (TDEE) mit den Formeln Mifflin-St Jeor, Harris-Benedict und Katch-McArdle, je nach Alter, Gewicht, Größe und Aktivität.',
    zh: '根据Mifflin-St Jeor、Harris-Benedict和Katch-McArdle公式，结合年龄、体重、身高和活动量计算每日总能量消耗（TDEE）。',
  },
  '💊 Vitaminas': {
    pt: 'Converte unidades de vitaminas (IU ↔ µg) e mostra os valores de referência (RDA) por vitamina.',
    en: 'Converts vitamin units (IU ↔ µg) and shows the reference daily intake (RDA) per vitamin.',
    es: 'Convierte unidades de vitaminas (IU ↔ µg) y muestra los valores de referencia (RDA) por vitamina.',
    fr: 'Convertit les unités de vitamines (UI ↔ µg) et affiche les apports journaliers recommandés (AJR) par vitamine.',
    de: 'Rechnet Vitamineinheiten um (IE ↔ µg) und zeigt die empfohlene Tagesdosis (RDA) je Vitamin.',
    zh: '换算维生素单位（IU ↔ µg），并显示各维生素的每日参考摄入量（RDA）。',
  },
  '💧 Hidratação': {
    pt: 'Calcula a ingestão diária de água recomendada com base no peso, temperatura ambiente e exercício físico.',
    en: 'Calculates the recommended daily water intake based on weight, ambient temperature, and exercise.',
    es: 'Calcula la ingesta diaria de agua recomendada según el peso, la temperatura ambiente y el ejercicio físico.',
    fr: "Calcule l'apport hydrique quotidien recommandé selon le poids, la température ambiante et l'exercice.",
    de: 'Berechnet die empfohlene tägliche Wasseraufnahme basierend auf Gewicht, Umgebungstemperatur und Bewegung.',
    zh: '根据体重、环境温度和运动量计算每日建议饮水量。',
  },
  '😴 Calculadora de Sono': {
    pt: 'Calcula os horários ideais para dormir ou acordar em ciclos de 90 minutos, nos dois sentidos.',
    en: 'Calculates ideal bed or wake-up times in 90-minute cycles, in either direction.',
    es: 'Calcula los horarios ideales para dormir o despertar en ciclos de 90 minutos, en ambos sentidos.',
    fr: 'Calcule les heures idéales de coucher ou de réveil en cycles de 90 minutes, dans les deux sens.',
    de: 'Berechnet ideale Schlaf- oder Aufwachzeiten in 90-Minuten-Zyklen, in beide Richtungen.',
    zh: '以90分钟为一个周期，计算理想的入睡或起床时间（双向计算）。',
  },
  '📏 % Gordura Corporal': {
    pt: 'Estima a percentagem de gordura corporal pelo método de circunferências da Marinha dos EUA (altura, pescoço, cintura e anca).',
    en: 'Estimates body fat percentage using the US Navy circumference method (height, neck, waist, and hip).',
    es: 'Estima el porcentaje de grasa corporal mediante el método de circunferencias de la Marina de EE. UU. (altura, cuello, cintura y cadera).',
    fr: "Estime le pourcentage de masse grasse par la méthode des circonférences de l'US Navy (taille, cou, tour de taille et hanches).",
    de: 'Schätzt den Körperfettanteil mit der US-Navy-Umfangsmethode (Größe, Hals, Taille und Hüfte).',
    zh: '采用美国海军围度法（身高、颈围、腰围和臀围）估算体脂率。',
  },
  '🔭 Astronomia': {
    pt: 'Calculadora de mapa astral, fase da lua, calendários alternativos e astrologia chinesa.',
    en: 'Natal chart calculator, moon phase, alternative calendars, and Chinese astrology.',
    es: 'Calculadora de carta astral, fase lunar, calendarios alternativos y astrología china.',
    fr: 'Calculateur de thème astral, phase de la lune, calendriers alternatifs et astrologie chinoise.',
    de: 'Rechner für Geburtshoroskop, Mondphase, alternative Kalender und chinesische Astrologie.',
    zh: '出生星盘计算器、月相、其他历法体系及中国生肖占星。',
  },
  '💱 Moedas': {
    pt: 'Conversor de moedas com taxas de câmbio em tempo real (150+ moedas), atualizado a cada hora.',
    en: 'Currency converter with real-time exchange rates (150+ currencies), updated hourly.',
    es: 'Conversor de monedas con tipos de cambio en tiempo real (más de 150 monedas), actualizado cada hora.',
    fr: 'Convertisseur de devises avec taux de change en temps réel (150+ devises), mis à jour toutes les heures.',
    de: 'Währungsrechner mit Echtzeit-Wechselkursen (150+ Währungen), stündlich aktualisiert.',
    zh: '实时汇率货币转换器（150多种货币），每小时更新。',
  },
  '🧾 IVA': {
    pt: 'Adiciona ou retira IVA de um valor, com taxas por país (Portugal, Espanha, França, Alemanha, Reino Unido...).',
    en: 'Adds or removes VAT from a value, with rates per country (Portugal, Spain, France, Germany, UK...).',
    es: 'Añade o quita IVA de un valor, con tasas por país (Portugal, España, Francia, Alemania, Reino Unido...).',
    fr: 'Ajoute ou retire la TVA d\'une valeur, avec des taux par pays (Portugal, Espagne, France, Allemagne, Royaume-Uni...).',
    de: 'Addiert oder entfernt die Mehrwertsteuer von einem Wert, mit Sätzen je Land (Portugal, Spanien, Frankreich, Deutschland, UK...).',
    zh: '为金额加收或扣除增值税，提供各国税率（葡萄牙、西班牙、法国、德国、英国等）。',
  },
  '📈 Margem': {
    pt: 'Calculadora de margem e markup de venda, com referências típicas por setor.',
    en: 'Sales margin and markup calculator, with typical benchmarks per industry.',
    es: 'Calculadora de margen y markup de venta, con referencias típicas por sector.',
    fr: 'Calculatrice de marge et de majoration de vente, avec des références typiques par secteur.',
    de: 'Rechner für Verkaufsmarge und Aufschlag, mit typischen Branchenreferenzen.',
    zh: '销售毛利率与加价率计算器，附各行业典型参考值。',
  },
  '🏦 Prestação Crédito': {
    pt: 'Calcula a prestação mensal de um crédito e gera a tabela de amortização completa.',
    en: 'Calculates a loan\'s monthly payment and generates the full amortization table.',
    es: 'Calcula la cuota mensual de un crédito y genera la tabla de amortización completa.',
    fr: "Calcule la mensualité d'un crédit et génère le tableau d'amortissement complet.",
    de: 'Berechnet die monatliche Kreditrate und erstellt den vollständigen Tilgungsplan.',
    zh: '计算贷款月供并生成完整的还款摊销表。',
  },
  '🏷️ Desconto / Preço Final': {
    pt: 'Calcula o preço final e a poupança ao aplicar um desconto, com atalhos para 10/20/30/50%.',
    en: 'Calculates the final price and savings when applying a discount, with 10/20/30/50% quick presets.',
    es: 'Calcula el precio final y el ahorro al aplicar un descuento, con atajos para 10/20/30/50%.',
    fr: 'Calcule le prix final et les économies lors de l\'application d\'une remise, avec des raccourcis pour 10/20/30/50%.',
    de: 'Berechnet den Endpreis und die Ersparnis bei einem Rabatt, mit Schnellauswahl für 10/20/30/50%.',
    zh: '计算应用折扣后的最终价格和节省金额，提供10/20/30/50%快捷选项。',
  },
  '🗓️ Diferença de Datas': {
    pt: 'Calcula os dias, semanas, meses e dias úteis entre duas datas quaisquer.',
    en: 'Calculates the days, weeks, months, and business days between any two dates.',
    es: 'Calcula los días, semanas, meses y días hábiles entre dos fechas cualesquiera.',
    fr: 'Calcule les jours, semaines, mois et jours ouvrés entre deux dates quelconques.',
    de: 'Berechnet Tage, Wochen, Monate und Werktage zwischen zwei beliebigen Daten.',
    zh: '计算任意两个日期之间的天数、周数、月数和工作日数。',
  },
  '⏳ Contagem Decrescente': {
    pt: 'Mostra os dias, semanas e meses que faltam (ou já passaram) até qualquer data.',
    en: 'Shows the days, weeks, and months remaining (or elapsed) until any date.',
    es: 'Muestra los días, semanas y meses que faltan (o ya pasaron) hasta cualquier fecha.',
    fr: 'Affiche les jours, semaines et mois restants (ou écoulés) jusqu\'à n\'importe quelle date.',
    de: 'Zeigt die verbleibenden (oder vergangenen) Tage, Wochen und Monate bis zu einem beliebigen Datum.',
    zh: '显示距离任意日期还剩（或已过）多少天、周、月。',
  },
  '⚖️ Proporções': {
    pt: 'Regra de três, escala de modelos, ajuste de receitas e diluições (C₁V₁=C₂V₂).',
    en: 'Rule of three, model scaling, recipe adjustment, and dilutions (C₁V₁=C₂V₂).',
    es: 'Regla de tres, escala de modelos, ajuste de recetas y diluciones (C₁V₁=C₂V₂).',
    fr: 'Règle de trois, mise à l\'échelle de modèles, ajustement de recettes et dilutions (C₁V₁=C₂V₂).',
    de: 'Dreisatz, Modellmaßstab, Rezeptanpassung und Verdünnungen (C₁V₁=C₂V₂).',
    zh: '三率法、模型比例缩放、配方调整和稀释计算 (C₁V₁=C₂V₂)。',
  },
  '⚡ Custo Eletricidade': {
    pt: 'Calcula o custo de eletricidade em kWh, com tarifas de vários países e eletrodomésticos comuns.',
    en: 'Calculates electricity cost in kWh, with tariffs from several countries and common appliances.',
    es: 'Calcula el coste de electricidad en kWh, con tarifas de varios países y electrodomésticos comunes.',
    fr: "Calcule le coût de l'électricité en kWh, avec des tarifs de plusieurs pays et des appareils courants.",
    de: 'Berechnet die Stromkosten in kWh, mit Tarifen aus mehreren Ländern und gängigen Haushaltsgeräten.',
    zh: '计算千瓦时电费，提供多国电价和常见家电耗电参考。',
  },
  '🎨 Tinta Pintura': {
    pt: 'Calcula os litros de tinta necessários para pintar uma divisão, consoante a área e o rendimento da tinta.',
    en: 'Calculates the liters of paint needed to paint a room, based on area and paint coverage.',
    es: 'Calcula los litros de pintura necesarios para pintar una habitación, según el área y el rendimiento de la pintura.',
    fr: 'Calcule les litres de peinture nécessaires pour peindre une pièce, selon la surface et le rendement de la peinture.',
    de: 'Berechnet die benötigten Liter Farbe zum Streichen eines Raums, je nach Fläche und Farbergiebigkeit.',
    zh: '根据面积和油漆覆盖率计算粉刷房间所需的油漆升数。',
  },
  '⛽ Custo Viagem': {
    pt: 'Calcula o custo de combustível de uma viagem, com comparação entre gasolina, gasóleo e elétrico.',
    en: 'Calculates the fuel cost of a trip, comparing petrol, diesel, and electric.',
    es: 'Calcula el coste de combustible de un viaje, comparando gasolina, diésel y eléctrico.',
    fr: "Calcule le coût en carburant d'un trajet, en comparant essence, diesel et électrique.",
    de: 'Berechnet die Kraftstoffkosten einer Fahrt, im Vergleich zwischen Benzin, Diesel und Elektro.',
    zh: '计算旅程燃油成本，比较汽油、柴油和电动车的费用。',
  },
  '🌡️ Sensação Térmica': {
    pt: 'Calcula a temperatura sentida (wind chill, índice de calor e humidex) a partir da temperatura, vento e humidade.',
    en: 'Calculates the felt temperature (wind chill, heat index, and humidex) from temperature, wind, and humidity.',
    es: 'Calcula la temperatura sentida (sensación térmica por viento, índice de calor y humidex) a partir de la temperatura, el viento y la humedad.',
    fr: "Calcule la température ressentie (refroidissement éolien, indice de chaleur et humidex) à partir de la température, du vent et de l'humidité.",
    de: 'Berechnet die gefühlte Temperatur (Windchill, Hitzeindex und Humidex) aus Temperatur, Wind und Luftfeuchtigkeit.',
    zh: '根据温度、风速和湿度计算体感温度（风寒、热指数和湿热指数）。',
  },
  '💡 Gorjeta / Dividir Conta': {
    pt: 'Calcula a gorjeta, o total a pagar e o valor por pessoa, com atalhos para 10/15/18/20/25%.',
    en: 'Calculates the tip, total to pay, and amount per person, with 10/15/18/20/25% quick presets.',
    es: 'Calcula la propina, el total a pagar y el importe por persona, con atajos para 10/15/18/20/25%.',
    fr: 'Calcule le pourboire, le total à payer et le montant par personne, avec des raccourcis pour 10/15/18/20/25%.',
    de: 'Berechnet das Trinkgeld, den Gesamtbetrag und den Anteil pro Person, mit Schnellauswahl für 10/15/18/20/25%.',
    zh: '计算小费、应付总额和人均金额，提供10/15/18/20/25%快捷选项。',
  },
  '🛒 Comparador de Preço': {
    pt: 'Compara o preço por kg, litro ou unidade entre dois produtos e diz qual é o mais barato.',
    en: 'Compares the price per kg, liter, or unit between two products and tells you which is cheaper.',
    es: 'Compara el precio por kg, litro o unidad entre dos productos y dice cuál es más barato.',
    fr: 'Compare le prix au kg, au litre ou à l\'unité entre deux produits et indique lequel est le moins cher.',
    de: 'Vergleicht den Preis pro kg, Liter oder Stück zwischen zwei Produkten und zeigt, welches günstiger ist.',
    zh: '比较两种产品的每公斤、每升或每件价格，判断哪个更便宜。',
  },
  '🏋️ 1RM Força': {
    pt: 'Estima a repetição máxima (1RM) pelas fórmulas de Epley, Brzycki e Lander, com percentagens de carga por objetivo.',
    en: 'Estimates one-rep max (1RM) using the Epley, Brzycki, and Lander formulas, with load percentages by goal.',
    es: 'Estima la repetición máxima (1RM) mediante las fórmulas de Epley, Brzycki y Lander, con porcentajes de carga por objetivo.',
    fr: "Estime la répétition maximale (1RM) selon les formules d'Epley, Brzycki et Lander, avec des pourcentages de charge par objectif.",
    de: 'Schätzt das Einer-Wiederholungsmaximum (1RM) mit den Formeln von Epley, Brzycki und Lander, mit Lastprozentsätzen nach Ziel.',
    zh: '采用Epley、Brzycki和Lander公式估算单次最大重量（1RM），并按目标提供负荷百分比。',
  },
  '🚴 Ciclismo Potência': {
    pt: 'Calcula as zonas de treino de ciclismo (W/kg) a partir do FTP.',
    en: 'Calculates cycling training zones (W/kg) from FTP.',
    es: 'Calcula las zonas de entrenamiento de ciclismo (W/kg) a partir del FTP.',
    fr: "Calcule les zones d'entraînement cyclisme (W/kg) à partir du FTP.",
    de: 'Berechnet Radsport-Trainingszonen (W/kg) aus dem FTP-Wert.',
    zh: '根据FTP计算骑行训练区间 (W/kg)。',
  },
  '🏊 Natação': {
    pt: 'Converte o ritmo de natação entre /100m e /100yd e estima tempos de prova.',
    en: 'Converts swimming pace between /100m and /100yd and estimates race times.',
    es: 'Convierte el ritmo de natación entre /100m y /100yd y estima tiempos de carrera.',
    fr: 'Convertit l\'allure de natation entre /100m et /100yd et estime les temps de course.',
    de: 'Rechnet das Schwimmtempo zwischen /100m und /100yd um und schätzt Wettkampfzeiten.',
    zh: '换算游泳配速（每100米/每100码）并估算比赛用时。',
  },
  '🏔️ Altitude Hipóxia': {
    pt: 'Calcula a pressão atmosférica e a SpO₂ estimada consoante a altitude, com dicas de aclimatação.',
    en: 'Calculates atmospheric pressure and estimated SpO₂ based on altitude, with acclimatization tips.',
    es: 'Calcula la presión atmosférica y la SpO₂ estimada según la altitud, con consejos de aclimatación.',
    fr: "Calcule la pression atmosphérique et la SpO₂ estimée selon l'altitude, avec des conseils d'acclimatation.",
    de: 'Berechnet den Luftdruck und die geschätzte SpO₂ je nach Höhe, mit Akklimatisierungstipps.',
    zh: '根据海拔计算大气压力和估计血氧饱和度 (SpO₂)，并提供适应建议。',
  },
  '🎓 Média Ponderada': {
    pt: 'Calcula a média ponderada a partir de notas e pesos ou créditos — ideal para média final de curso ou disciplina.',
    en: 'Calculates the weighted average from grades and weights or credits — ideal for a final course or subject grade.',
    es: 'Calcula la media ponderada a partir de notas y pesos o créditos — ideal para la media final de un curso o asignatura.',
    fr: "Calcule la moyenne pondérée à partir de notes et de poids ou crédits — idéal pour la moyenne finale d'un cours ou d'une matière.",
    de: 'Berechnet den gewichteten Durchschnitt aus Noten und Gewichtungen oder Credits — ideal für die Abschlussnote eines Kurses oder Fachs.',
    zh: '根据成绩和权重/学分计算加权平均分 — 适合计算课程或学科的最终平均成绩。',
  },
};

function stripLeadingEmoji(str) {
  return str.replace(/^[\p{Extended_Pictographic}️‍]+\s*/u, '').trim();
}

function slugify(str) {
  const noEmoji = stripLeadingEmoji(str);
  const noAccents = noEmoji.normalize('NFD').replace(/[̀-ͯ]/g, '');
  return noAccents
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-');
}

function htmlEscape(str) {
  return String(str).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

// Anything with Portuguese diacritics/words and no dictionary entry gets
// reported so it can be added to unit-translations.js, instead of silently
// leaking Portuguese text onto a non-PT page.
const MISSING_TRANSLATIONS = new Set();
const PT_HINT = /[ãõçâê]|\b(de|da|do|com|para|até|após)\b/i;
function translateUnit(str, lang) {
  if (lang === 'pt') return str;
  const hit = UNIT_TRANSLATIONS[str];
  if (hit && hit[lang]) return hit[lang];
  if (PT_HINT.test(str)) {
    MISSING_TRANSLATIONS.add(str);
    // Fall back to just the bracketed symbol, if any — better than raw
    // Portuguese text (e.g. "Colher de chá extra (nova)" -> "(nova)" is
    // still wrong, but plain symbols like "(km)" are always safe).
    const m = /\(([^)]+)\)\s*$/.exec(str);
    if (m && !PT_HINT.test(m[1])) return m[1];
  }
  return str;
}

function buildDescription(entry, lang) {
  const name = entry.names[lang];
  const displayName = stripLeadingEmoji(name);
  if (entry.units && entry.units.length) {
    const translated = entry.units.map(u => translateUnit(u, lang));
    const sample = translated.slice(0, 6).join(', ');
    const more = entry.units.length > 6 ? UI.more[lang] : '';
    const fn = (entry.kind === 'sizing' || entry.kind === 'paper' || entry.kind === 'lookup') ? UI.lookupDesc[lang] : UI.converterDesc[lang];
    return fn(displayName, entry.units.length, sample, more);
  }
  const calc = CALC_DESCRIPTIONS[entry.key];
  if (calc && calc[lang]) return calc[lang];
  return UI.calcFallbackDesc[lang](displayName);
}

function buildUnitsBlock(entry, lang) {
  if (!entry.units || !entry.units.length) return '';
  const items = entry.units.map(u => `<li>${htmlEscape(translateUnit(u, lang))}</li>`).join('');
  const label = (entry.kind === 'sizing' || entry.kind === 'paper' || entry.kind === 'lookup') ? UI.optionsHeading[lang] : UI.unitsHeading[lang];
  return `<h2>${label}</h2>\n  <ul class="units">${items}</ul>\n`;
}

function pageUrl(entry, lang) {
  const slug = entry.slugs[lang];
  return lang === 'pt' ? `${BASE_URL}/c/${slug}/` : `${BASE_URL}/${lang}/c/${slug}/`;
}

function pageTemplate(entry, lang, ctx) {
  const displayName = stripLeadingEmoji(entry.names[lang]);
  const isConverter = entry.kind === 'units' || entry.kind === 'special' || entry.kind === 'sizing' || entry.kind === 'paper' || entry.kind === 'lookup';
  const h1 = isConverter ? UI.converterHeading[lang](entry.names[lang]) : entry.names[lang];
  const title = `${h1} — ${UI.freeSuffix[lang]} | Universal Converter`;
  const description = buildDescription(entry, lang);
  const canonical = pageUrl(entry, lang);
  const embedUrl = `${BASE_URL}/index.html?embed=1&cat=${encodeURIComponent(entry.key)}&lang=${lang}&theme=auto&border=0`;
  const groupLabel = (GROUP_LABELS[entry.group] && GROUP_LABELS[entry.group][lang]) || '';
  const unitsBlock = buildUnitsBlock(entry, lang);
  const home = homeUrl(lang);

  const hreflangLinks = LANGS.map(l => `<link rel="alternate" hreflang="${LANG_LOCALE[l]}" href="${pageUrl(entry, l)}">`).join('\n')
    + `\n<link rel="alternate" hreflang="x-default" href="${pageUrl(entry, 'pt')}">`;

  const langSwitcher = LANGS.map(l => {
    const flag = { pt: '🇵🇹', en: '🇬🇧', es: '🇪🇸', fr: '🇫🇷', de: '🇩🇪', zh: '🇨🇳' }[l];
    return l === lang
      ? `<span class="lang-current">${flag} ${l.toUpperCase()}</span>`
      : `<a href="${pageUrl(entry, l)}">${flag} ${l.toUpperCase()}</a>`;
  }).join(' · ');

  return `<!doctype html>
<html lang="${LANG_LOCALE[lang]}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${htmlEscape(title)}</title>
<meta name="description" content="${htmlEscape(description)}">
<meta name="robots" content="index, follow">
<link rel="canonical" href="${canonical}">
<meta property="og:type" content="website">
<meta property="og:title" content="${htmlEscape(title)}">
<meta property="og:description" content="${htmlEscape(description)}">
<meta property="og:url" content="${canonical}">
${hreflangLinks}
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=DM+Mono:wght@300;400;500&family=Fraunces:wght@300;400;600;700&display=swap" rel="stylesheet">
<style>
:root{--bg:#0d0d0f;--surface:#18181c;--border:#2e2e38;--accent:#c8f264;--text:#f0efe8;--muted:#9a9aac;--radius:12px;}
@media (prefers-color-scheme: light){:root{--bg:#f5f5f0;--surface:#ffffff;--border:#d8d8e8;--accent:#3f6b00;--text:#1a1a22;--muted:#5a5a6a;}}
*{box-sizing:border-box;}
body{margin:0;background:var(--bg);color:var(--text);font-family:'DM Mono',monospace;line-height:1.65;}
.wrap{max-width:720px;margin:0 auto;padding:2rem 1.25rem 3rem;}
a{color:var(--accent);}
.topbar{display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;margin-bottom:1rem;}
.back{font-size:.78rem;color:var(--muted);text-decoration:none;}
.back:hover{text-decoration:underline;}
.langs{font-size:.68rem;color:var(--muted);}
.langs a{color:var(--muted);text-decoration:none;}
.langs a:hover{text-decoration:underline;color:var(--text);}
.lang-current{color:var(--accent);font-weight:500;}
.eyebrow{font-size:.68rem;text-transform:uppercase;letter-spacing:.09em;color:var(--muted);margin:0 0 .4rem;}
h1{font-family:'Fraunces',serif;font-weight:600;font-size:1.85rem;margin:0 0 .6rem;line-height:1.2;}
.intro{color:var(--muted);font-size:.92rem;margin-bottom:1.5rem;max-width:60ch;}
iframe{width:100%;max-width:640px;height:480px;border:1px solid var(--border);border-radius:var(--radius);display:block;margin-bottom:2rem;background:var(--surface);}
h2{font-family:'Fraunces',serif;font-weight:600;font-size:1.05rem;margin:0 0 .75rem;}
.units{display:flex;flex-wrap:wrap;gap:6px;padding:0;list-style:none;margin:0 0 2rem;}
.units li{background:var(--surface);border:1px solid var(--border);border-radius:20px;padding:5px 12px;font-size:.7rem;color:var(--muted);}
footer{margin-top:2.5rem;padding-top:1.5rem;border-top:1px solid var(--border);font-size:.75rem;color:var(--muted);}
footer a{color:var(--muted);text-decoration:underline;}
.support{margin-top:2rem;background:linear-gradient(135deg,rgba(200,242,100,.08) 0%,rgba(126,244,200,.08) 100%);border:1px solid rgba(200,242,100,.25);border-radius:var(--radius);padding:1.25rem 1.5rem;display:flex;align-items:center;justify-content:space-between;gap:1.25rem;flex-wrap:wrap;}
.support-text h3{font-family:'Fraunces',serif;font-size:1rem;margin:0 0 .35rem;font-weight:600;}
.support-text p{margin:0;font-size:.78rem;color:var(--muted);max-width:48ch;}
.support-btn{display:inline-flex;align-items:center;gap:8px;padding:10px 20px;background:var(--accent);color:#0d0d0f;border:none;border-radius:8px;font-family:'DM Mono',monospace;font-size:.78rem;font-weight:500;text-decoration:none;white-space:nowrap;}
</style>
</head>
<body>
<div class="wrap">
  <div class="topbar">
    <a class="back" href="${home}">${UI.backHome[lang]}</a>
    <div class="langs">${langSwitcher}</div>
  </div>
  ${groupLabel ? `<p class="eyebrow">${htmlEscape(groupLabel)}</p>` : ''}
  <h1>${htmlEscape(h1)}</h1>
  <p class="intro">${htmlEscape(description)}</p>
  <iframe src="${embedUrl}" loading="lazy" title="${htmlEscape(displayName)}"></iframe>
  ${unitsBlock}
  <div class="support">
    <div class="support-text">
      <h3>${htmlEscape(UI.supTitle[lang])}</h3>
      <p>${htmlEscape(UI.supDesc[lang])}</p>
    </div>
    <a class="support-btn" href="${DONATE_URL}" target="_blank" rel="noopener">${htmlEscape(UI.supBtn[lang])}</a>
  </div>
  <footer>${UI.footerTemplate[lang](htmlEscape(displayName), ctx.total, home)}</footer>
</div>
</body>
</html>
`;
}

// ── Per-language homepage hubs (pt/en/es/fr/de/zh) ───────────────────────────
// The real interactive app lives only at the repo root (index.html). These
// hubs are real, crawlable link-directory pages (grouped links to every
// category/calculator page in that language) plus a prominent CTA to the
// app itself — not an iframe, so Google can actually follow and rank the
// internal links instead of seeing an opaque embedded widget.
const HOME_TITLE = {
  pt: 'Conversor Universal', en: 'Universal Converter', es: 'Conversor Universal',
  fr: 'Convertisseur Universel', de: 'Universalumrechner', zh: '通用单位转换器',
};
const HOME_TAGLINE = {
  pt: '+1300 unidades · 150+ categorias e calculadoras · 6 idiomas · 100% grátis · sem anúncios',
  en: '+1300 units · 150+ categories & calculators · 6 languages · 100% free · no ads',
  es: '+1300 unidades · 150+ categorías y calculadoras · 6 idiomas · 100% gratis · sin anuncios',
  fr: '+1300 unités · 150+ catégories et calculatrices · 6 langues · 100% gratuit · sans publicité',
  de: '+1300 Einheiten · 150+ Kategorien & Rechner · 6 Sprachen · 100% kostenlos · ohne Werbung',
  zh: '超过1300种单位 · 150多个分类和计算器 · 6种语言 · 100%免费 · 无广告',
};
const HOME_INTRO = {
  pt: 'Uma suite completa de conversores de unidades e calculadoras que corre inteiramente no browser — sem servidor, sem instalação, sem dependências.',
  en: 'A comprehensive unit converter and calculator suite that runs entirely in the browser — no server, no installation, no dependencies.',
  es: 'Una suite completa de conversores de unidades y calculadoras que se ejecuta enteramente en el navegador — sin servidor, sin instalación, sin dependencias.',
  fr: "Une suite complète de convertisseurs d'unités et de calculatrices qui fonctionne entièrement dans le navigateur — sans serveur, sans installation, sans dépendances.",
  de: 'Eine umfassende Suite aus Einheitenumrechnern und Rechnern, die vollständig im Browser läuft — ohne Server, ohne Installation, ohne Abhängigkeiten.',
  zh: '一套功能完整的单位换算与计算工具，完全在浏览器中运行 — 无需服务器、安装或任何依赖。',
};

const HOME_OPEN_APP = {
  pt: 'Abrir o conversor →', en: 'Open the converter →', es: 'Abrir el conversor →',
  fr: 'Ouvrir le convertisseur →', de: 'Umrechner öffnen →', zh: '打开换算器 →',
};
const HOME_BROWSE = {
  pt: 'Ou explora todas as categorias e calculadoras abaixo:',
  en: 'Or browse every category and calculator below:',
  es: 'O explora todas las categorías y calculadoras a continuación:',
  fr: 'Ou parcourez toutes les catégories et calculatrices ci-dessous :',
  de: 'Oder durchstöbern Sie unten alle Kategorien und Rechner:',
  zh: '或在下方浏览所有分类和计算器：',
};

function homeUrl(lang) {
  return `${BASE_URL}/${lang}/`;
}

function homepageTemplate(lang, entries) {
  const title = `${HOME_TITLE[lang]} — ${UI.freeSuffix[lang]} | +1300 Units`;
  const canonical = homeUrl(lang);
  const appUrl = lang === 'pt' ? `${BASE_URL}/` : `${BASE_URL}/index.html?lang=${lang}`;
  const hreflangLinks = LANGS.map(l => `<link rel="alternate" hreflang="${LANG_LOCALE[l]}" href="${homeUrl(l)}">`).join('\n')
    + `\n<link rel="alternate" hreflang="x-default" href="${homeUrl('pt')}">`;
  const langSwitcher = LANGS.map(l => {
    const flag = { pt: '🇵🇹', en: '🇬🇧', es: '🇪🇸', fr: '🇫🇷', de: '🇩🇪', zh: '🇨🇳' }[l];
    return l === lang ? `<span class="lang-current">${flag} ${l.toUpperCase()}</span>` : `<a href="${homeUrl(l)}">${flag} ${l.toUpperCase()}</a>`;
  }).join(' · ');

  // Group category links in the order groups first appear, translated headings.
  const groupsOrder = [];
  const byGroup = new Map();
  entries.forEach(e => {
    if (!byGroup.has(e.group)) { byGroup.set(e.group, []); groupsOrder.push(e.group); }
    byGroup.get(e.group).push(e);
  });
  const sections = groupsOrder.map(g => {
    const label = (GROUP_LABELS[g] && GROUP_LABELS[g][lang]) || g;
    const links = byGroup.get(g).map(e => `<li><a href="${pageUrl(e, lang)}">${htmlEscape(e.names[lang])}</a></li>`).join('');
    return `<section><h2>${htmlEscape(label)}</h2><ul class="linklist">${links}</ul></section>`;
  }).join('\n');

  return `<!doctype html>
<html lang="${LANG_LOCALE[lang]}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${htmlEscape(title)}</title>
<meta name="description" content="${htmlEscape(HOME_INTRO[lang])}">
<meta name="robots" content="index, follow">
<link rel="canonical" href="${canonical}">
<meta property="og:type" content="website">
<meta property="og:title" content="${htmlEscape(title)}">
<meta property="og:description" content="${htmlEscape(HOME_INTRO[lang])}">
<meta property="og:url" content="${canonical}">
${hreflangLinks}
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=DM+Mono:wght@300;400;500&family=Fraunces:wght@300;400;600;700&display=swap" rel="stylesheet">
<style>
:root{--bg:#0d0d0f;--surface:#18181c;--border:#2e2e38;--accent:#c8f264;--text:#f0efe8;--muted:#9a9aac;--radius:12px;}
@media (prefers-color-scheme: light){:root{--bg:#f5f5f0;--surface:#ffffff;--border:#d8d8e8;--accent:#3f6b00;--text:#1a1a22;--muted:#5a5a6a;}}
*{box-sizing:border-box;}
body{margin:0;background:var(--bg);color:var(--text);font-family:'DM Mono',monospace;line-height:1.65;}
.wrap{max-width:960px;margin:0 auto;padding:2rem 1.25rem 3rem;}
a{color:var(--accent);}
.topbar{display:flex;justify-content:flex-end;margin-bottom:1rem;}
.langs{font-size:.68rem;color:var(--muted);}
.langs a{color:var(--muted);text-decoration:none;}
.langs a:hover{text-decoration:underline;color:var(--text);}
.lang-current{color:var(--accent);font-weight:500;}
h1{font-family:'Fraunces',serif;font-weight:700;font-size:2.4rem;margin:0 0 .4rem;line-height:1.1;text-align:center;color:var(--accent);}
.tagline{text-align:center;color:var(--muted);font-size:.8rem;margin:0 0 1.5rem;}
.intro{color:var(--muted);font-size:.92rem;margin:0 auto 1rem;max-width:60ch;text-align:center;}
.cta-wrap{text-align:center;margin-bottom:.75rem;}
.cta{display:inline-flex;align-items:center;gap:8px;padding:12px 24px;background:var(--accent);color:#0d0d0f;border-radius:8px;font-family:'DM Mono',monospace;font-size:.85rem;font-weight:500;text-decoration:none;}
.browse{text-align:center;color:var(--muted);font-size:.78rem;margin:0 0 2rem;}
section{margin-bottom:1.75rem;}
h2{font-family:'Fraunces',serif;font-weight:600;font-size:1rem;margin:0 0 .6rem;border-bottom:1px solid var(--border);padding-bottom:.4rem;}
.linklist{display:flex;flex-wrap:wrap;gap:6px 14px;padding:0;list-style:none;margin:0;}
.linklist li{font-size:.78rem;}
.linklist a{color:var(--text);text-decoration:none;}
.linklist a:hover{color:var(--accent);text-decoration:underline;}
footer{margin-top:2.5rem;padding-top:1.5rem;border-top:1px solid var(--border);font-size:.75rem;color:var(--muted);text-align:center;}
.support{margin-top:2rem;background:linear-gradient(135deg,rgba(200,242,100,.08) 0%,rgba(126,244,200,.08) 100%);border:1px solid rgba(200,242,100,.25);border-radius:var(--radius);padding:1.25rem 1.5rem;display:flex;align-items:center;justify-content:space-between;gap:1.25rem;flex-wrap:wrap;}
.support-text h3{font-family:'Fraunces',serif;font-size:1rem;margin:0 0 .35rem;font-weight:600;}
.support-text p{margin:0;font-size:.78rem;color:var(--muted);max-width:48ch;}
.support-btn{display:inline-flex;align-items:center;gap:8px;padding:10px 20px;background:var(--accent);color:#0d0d0f;border:none;border-radius:8px;font-family:'DM Mono',monospace;font-size:.78rem;font-weight:500;text-decoration:none;white-space:nowrap;}
</style>
</head>
<body>
<div class="wrap">
  <div class="topbar"><div class="langs">${langSwitcher}</div></div>
  <h1>${htmlEscape(HOME_TITLE[lang])}</h1>
  <p class="tagline">${htmlEscape(HOME_TAGLINE[lang])}</p>
  <p class="intro">${htmlEscape(HOME_INTRO[lang])}</p>
  <div class="cta-wrap"><a class="cta" href="${appUrl}">${htmlEscape(HOME_OPEN_APP[lang])}</a></div>
  <p class="browse">${htmlEscape(HOME_BROWSE[lang])}</p>
  ${sections}
  <div class="support">
    <div class="support-text">
      <h3>${htmlEscape(UI.supTitle[lang])}</h3>
      <p>${htmlEscape(UI.supDesc[lang])}</p>
    </div>
    <a class="support-btn" href="${DONATE_URL}" target="_blank" rel="noopener">${htmlEscape(UI.supBtn[lang])}</a>
  </div>
  <footer>${htmlEscape(HOME_TITLE.pt)} · <a href="${appUrl}">${appUrl}</a></footer>
</div>
</body>
</html>
`;
}

function buildSitemap(entries) {
  const FLAGSHIP = new Set(['Comprimento', 'Massa', 'Temperatura', 'Volume', '💱 Moedas', '🧮 IMC', '🎂 Idade / Nascimento', '📊 Percentagens']);
  const WEEKLY = new Set(['💱 Moedas', '⚡ Custo Eletricidade', '⛽ Custo Viagem', '🌍 Fusos Ao Vivo']);
  const rows = [];

  // The real interactive app (Portuguese-first, but ?lang= switches it live).
  rows.push(`  <url>\n    <loc>${BASE_URL}/</loc>\n    <lastmod>${TODAY}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>1.0</priority>\n  </url>`);

  // Per-language link-directory hubs (pt included, for symmetry with /en/, /es/...).
  const homeAlternates = LANGS.map(l => `    <xhtml:link rel="alternate" hreflang="${LANG_LOCALE[l]}" href="${homeUrl(l)}"/>`).join('\n');
  LANGS.forEach(lang => {
    rows.push(`  <url>\n    <loc>${homeUrl(lang)}</loc>\n    <lastmod>${TODAY}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.9</priority>\n${homeAlternates}\n  </url>`);
  });

  entries.forEach(e => {
    const changefreq = WEEKLY.has(e.key) ? 'weekly' : 'monthly';
    const priority = FLAGSHIP.has(e.key) ? '0.9' : '0.7';
    LANGS.forEach(lang => {
      const alternates = LANGS.map(l => `    <xhtml:link rel="alternate" hreflang="${LANG_LOCALE[l]}" href="${pageUrl(e, l)}"/>`).join('\n');
      rows.push(`  <url>\n    <loc>${pageUrl(e, lang)}</loc>\n    <lastmod>${TODAY}</lastmod>\n    <changefreq>${changefreq}</changefreq>\n    <priority>${priority}</priority>\n${alternates}\n  </url>`);
    });
  });

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n\n  <!--\n    Universal Converter — sitemap.xml\n    Generated: ${TODAY} by scripts/generate-pages.js\n    Total URLs: ${rows.length}\n    Domain: ${BASE_URL}\n  -->\n\n${rows.join('\n\n')}\n\n</urlset>\n`;
}

function main() {
  if (!fs.existsSync(DATA_FILE)) {
    console.error(`Missing ${DATA_FILE}. Run the extraction snippet in scripts/extract-in-browser.js against a loaded index.html first.`);
    process.exit(1);
  }
  const raw = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));

  // Assign one slug per language. Non-PT slugs are built from that
  // language's own translated name; if slugifying it yields nothing usable
  // (always true for Chinese, since CJK characters aren't ASCII) fall back
  // to the English slug. Collisions within a language are resolved with a
  // numeric suffix.
  const usedSlugs = {};
  LANGS.forEach(l => (usedSlugs[l] = new Map()));
  const entries = raw.map(e => {
    const slugs = {};
    LANGS.forEach(lang => {
      let base = slugify(e.names[lang]);
      if (!base) base = slugify(e.names.en) || slugify(e.key);
      let slug = base;
      const used = usedSlugs[lang];
      if (used.has(slug)) {
        let i = 2;
        while (used.has(`${slug}-${i}`)) i++;
        slug = `${slug}-${i}`;
      }
      used.set(slug, e.key);
      slugs[lang] = slug;
    });
    return { ...e, slugs };
  });

  const ctx = { total: entries.length };

  let written = 0;
  entries.forEach(entry => {
    LANGS.forEach(lang => {
      const dir = lang === 'pt'
        ? path.join(ROOT, 'c', entry.slugs[lang])
        : path.join(ROOT, lang, 'c', entry.slugs[lang]);
      fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(path.join(dir, 'index.html'), pageTemplate(entry, lang, ctx));
      written++;
    });
  });

  // Per-language homepage hubs, including pt/ for symmetry with the others
  // (the actual interactive app stays at the repo root, index.html).
  LANGS.forEach(lang => {
    const dir = path.join(ROOT, lang);
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, 'index.html'), homepageTemplate(lang, entries));
  });

  fs.writeFileSync(path.join(ROOT, 'sitemap.xml'), buildSitemap(entries));

  console.log(`Generated ${written} category pages (${entries.length} categories × ${LANGS.length} languages)`);
  console.log(`Generated ${LANGS.length} homepage hubs (pt/en/es/fr/de/zh)`);
  console.log(`Regenerated sitemap.xml with ${entries.length * LANGS.length + LANGS.length + 1} URLs`);
  if (MISSING_TRANSLATIONS.size) {
    const list = [...MISSING_TRANSLATIONS].sort();
    fs.writeFileSync(path.join(__dirname, 'still-missing-translations.txt'), list.join('\n'));
    console.log(`⚠ ${list.length} strings still look Portuguese and have no dictionary entry — see scripts/still-missing-translations.txt`);
  } else {
    console.log('✓ No un-translated Portuguese-looking strings detected on non-PT pages.');
  }
}

main();
