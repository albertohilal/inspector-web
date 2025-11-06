// index_v2.js
import fs from 'fs';
import path from 'path';
import puppeteer from 'puppeteer';
import { createObjectCsvWriter } from 'csv-writer';

// === CONFIGURACIÓN GENERAL ===
const OUTPUT_DIR = path.resolve('./reportes');
const FUENTES_PERMITIDAS = ['Inter', 'sans-serif']; // Fuentes corporativas permitidas
const PALETA_LUSSO = ['#d3af37', '#000000', '#ffffff', '#f5f5f5']; // Paleta corporativa oficial
const PALETA_EXTENDIDA = ['#0D0D0D', '#404040', '#EAEAEA', '#FFFFFF', '#B8860B', '#D4AF37']; // Paleta ampliada
const TOLERANCIA = 25; // margen de diferencia RGB

// === FUNCIONES AUXILIARES ===
function hexToRgb(hex) {
  const h = hex.replace('#', '');
  return [
    parseInt(h.substring(0, 2), 16),
    parseInt(h.substring(2, 4), 16),
    parseInt(h.substring(4, 6), 16)
  ];
}

function colorDistancia(c1, c2) {
  const [r1, g1, b1] = c1, [r2, g2, b2] = c2;
  return Math.sqrt((r1 - r2) ** 2 + (g1 - g2) ** 2 + (b1 - b2) ** 2);
}

function estaEnPaletaCorporativa(color) {
  if (!color || !color.startsWith('rgb')) return false;
  const match = color.match(/\d+/g);
  if (!match) return false;
  const c = match.map(Number);
  return PALETA_LUSSO.some(hex => colorDistancia(c, hexToRgb(hex)) <= TOLERANCIA);
}

function estaEnPaletaExtendida(color) {
  if (!color || !color.startsWith('rgb')) return false;
  const match = color.match(/\d+/g);
  if (!match) return false;
  const c = match.map(Number);
  return PALETA_EXTENDIDA.some(hex => colorDistancia(c, hexToRgb(hex)) <= TOLERANCIA);
}

function validarTipografia(fontFamily) {
  if (!fontFamily) return false;
  const font = fontFamily.toLowerCase();
  return FUENTES_PERMITIDAS.some(permitida => font.includes(permitida.toLowerCase()));
}

function getArg(flag) {
  const i = process.argv.indexOf(flag);
  return i !== -1 ? process.argv[i + 1] : null;
}

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

// === ENTRADAS ===
const url = getArg('--url');
const file = getArg('--file');

if (!url && !file) {
  console.error(`
❌ Debes usar:
  node index_v2.js --url https://lussogroup.demo.ar.nf/investment/
  node index_v2.js --file urls.txt
`);
  process.exit(1);
}

// === SALIDA ===
ensureDir(OUTPUT_DIR);
const reportName = `reporte-v2-${new Date().toISOString().split('T')[0]}.csv`;
const csvPath = path.join(OUTPUT_DIR, reportName);

const csvWriter = createObjectCsvWriter({
  path: csvPath,
  header: [
    { id: 'url', title: 'URL' },
    { id: 'selector', title: 'Selector' },
    { id: 'texto', title: 'Texto' },
    { id: 'fuente', title: 'Fuente detectada' },
    { id: 'tipografia_check', title: '✅ Tipografía OK' },
    { id: 'color_texto', title: 'Color de texto' },
    { id: 'color_fondo', title: 'Color de fondo' },
    { id: 'color_corporativo', title: '🟡 Paleta Lusso' },
    { id: 'color_extendida', title: '🎨 Paleta Extendida' },
    { id: 'cumple_estandar', title: '⭐ Cumple Estándar' },
  ],
});

// === FUNCIÓN PRINCIPAL ===
async function analyzePage(targetUrl) {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  console.log(`🔍 Analizando: ${targetUrl}`);
  await page.goto(targetUrl, { waitUntil: 'domcontentloaded', timeout: 90000 });

  const results = await page.evaluate(() => {
    const elements = Array.from(document.querySelectorAll('*'));
    const data = [];

    elements.forEach(el => {
      const style = window.getComputedStyle(el);
      const font = style.fontFamily || '';
      const color = style.color || '';
      const bg = style.backgroundColor || '';
      const text = el.innerText?.trim();

      if (text && text.length > 2) {
        data.push({
          selector: el.tagName.toLowerCase(),
          texto: text.slice(0, 80).replace(/\s+/g, ' '),
          fuente: font,
          color_texto: color,
          color_fondo: bg,
          // Los checks se evalúan en Node.js con las funciones de validación
        });
      }
    });
    return data;
  });

  await browser.close();
  return results.map(r => ({ url: targetUrl, ...r }));
}

// === FLUJO PRINCIPAL ===
(async () => {
  const urls = [];

  if (url) urls.push(url);
  if (file && fs.existsSync(file)) {
    const lines = fs.readFileSync(file, 'utf8').split(/\r?\n/).filter(Boolean);
    urls.push(...lines);
  }

  let allResults = [];

  for (const u of urls) {
    try {
      const pageResults = await analyzePage(u);
      // Procesar y validar datos en Node.js
      const enriched = pageResults.map(r => {
        const tipografiaOK = validarTipografia(r.fuente);
        const colorCorporativo = estaEnPaletaCorporativa(r.color_texto) || estaEnPaletaCorporativa(r.color_fondo);
        const colorExtendido = estaEnPaletaExtendida(r.color_texto) || estaEnPaletaExtendida(r.color_fondo);
        const cumpleEstandar = tipografiaOK && (colorCorporativo || colorExtendido);

        return {
          ...r,
          tipografia_check: tipografiaOK ? '✅' : '❌',
          color_corporativo: colorCorporativo ? '✅' : '❌',
          color_extendida: colorExtendido ? '✅' : '❌',
          cumple_estandar: cumpleEstandar ? '⭐' : '⚠️',
        };
      });
      allResults.push(...enriched);
    } catch (err) {
      console.error(`⚠️ Error analizando ${u}: ${err.message}`);
    }
  }

  await csvWriter.writeRecords(allResults);
  
  // Estadísticas del análisis
  const stats = {
    total: allResults.length,
    tipografiaOK: allResults.filter(r => r.tipografia_check === '✅').length,
    colorCorporativo: allResults.filter(r => r.color_corporativo === '✅').length,
    cumpleEstandar: allResults.filter(r => r.cumple_estandar === '⭐').length,
  };

  console.log(`\n📊 RESULTADOS DEL ANÁLISIS:`);
  console.log(`📄 Total de elementos analizados: ${stats.total}`);
  console.log(`✅ Tipografía correcta: ${stats.tipografiaOK}/${stats.total} (${Math.round(stats.tipografiaOK/stats.total*100)}%)`);
  console.log(`🟡 Paleta corporativa Lusso: ${stats.colorCorporativo}/${stats.total} (${Math.round(stats.colorCorporativo/stats.total*100)}%)`);
  console.log(`⭐ Cumple estándar completo: ${stats.cumpleEstandar}/${stats.total} (${Math.round(stats.cumpleEstandar/stats.total*100)}%)`);
  console.log(`\n✅ Reporte detallado generado: ${csvPath}`);
})();
