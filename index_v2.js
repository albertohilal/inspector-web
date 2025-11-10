// index_v2.js
import fs from 'fs';
import path from 'path';
import puppeteer from 'puppeteer';
import { createObjectCsvWriter } from 'csv-writer';

// === CONFIGURACIÓN GENERAL ===
const OUTPUT_DIR = path.resolve('./reportes');
const FUENTES_PERMITIDAS = ['Inter', 'sans-serif']; // Fuentes corporativas permitidas
const PALETA_LUSSO = ['#0D0D0D', '#404040', '#EAEAEA', '#FFFFFF', '#D4AF37', '#d4af37']; // Nueva paleta corporativa oficial (incluye variaciones de dorado)
const PALETA_EXTENDIDA = ['#0D0D0D', '#404040', '#EAEAEA', '#FFFFFF', '#D4AF37', '#000000', '#f5f5f5']; // Paleta ampliada con variaciones
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

function esColorTransparente(color) {
  if (!color || !color.startsWith('rgba')) return false;
  const match = color.match(/rgba\((\d+),\s*(\d+),\s*(\d+),\s*([01](?:\.\d+)?)\)/);
  if (!match) return false;
  const alpha = parseFloat(match[4]);
  return alpha === 0; // Completamente transparente
}

function estaEnPaletaCorporativa(color) {
  if (!color || !color.startsWith('rgb')) return false;
  
  // Los colores transparentes se consideran válidos
  if (esColorTransparente(color)) return true;
  
  const match = color.match(/\d+/g);
  if (!match) return false;
  const c = match.map(Number);
  return PALETA_LUSSO.some(hex => colorDistancia(c, hexToRgb(hex)) <= TOLERANCIA);
}

function estaEnPaletaExtendida(color) {
  if (!color || !color.startsWith('rgb')) return false;
  
  // Los colores transparentes se consideran válidos
  if (esColorTransparente(color)) return true;
  
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
const now = new Date();
const fecha = now.toISOString().split('T')[0]; // YYYY-MM-DD
const hora = now.toTimeString().slice(0, 5).replace(':', ''); // HHMM
const reportName = `reporte-v2-${fecha}-${hora}.csv`;
const csvPath = path.join(OUTPUT_DIR, reportName);

const csvWriter = createObjectCsvWriter({
  path: csvPath,
  header: [
    { id: 'url', title: 'URL' },
    { id: 'selector', title: 'Selector CSS' },
    { id: 'elemento_tag', title: 'Tag' },
    { id: 'posicion_x', title: 'Pos X' },
    { id: 'posicion_y', title: 'Pos Y' },
    { id: 'ancho', title: 'Ancho' },
    { id: 'alto', title: 'Alto' },
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

    elements.forEach((el, index) => {
      const style = window.getComputedStyle(el);
      const font = style.fontFamily || '';
      const color = style.color || '';
      const bg = style.backgroundColor || '';
      const text = el.innerText?.trim();

      if (text && text.length > 2) {
        // Generar selector CSS más específico
        let cssSelector = el.tagName.toLowerCase();
        if (el.id) {
          cssSelector += `#${el.id}`;
        }
        if (el.className && typeof el.className === 'string') {
          const classes = el.className.trim().split(/\s+/).slice(0, 3); // Máximo 3 clases
          if (classes.length > 0 && classes[0]) {
            cssSelector += '.' + classes.join('.');
          }
        }

        // Obtener posición en la página
        const rect = el.getBoundingClientRect();
        
        data.push({
          selector: cssSelector,
          elemento_tag: el.tagName.toLowerCase(),
          posicion_x: Math.round(rect.left),
          posicion_y: Math.round(rect.top),
          ancho: Math.round(rect.width),
          alto: Math.round(rect.height),
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
  
  // Agregar metadata al principio del archivo
  if (allResults.length > 0) {
    const csvContent = fs.readFileSync(csvPath, 'utf8');
    const metadata = `# Inspector Web - Reporte de Análisis\n# Fecha: ${new Date().toLocaleString('es-ES')}\n# Página analizada: ${allResults[0].url}\n# Versión: 2.0\n# ═══════════════════════════════════════════════════════\n\n`;
    fs.writeFileSync(csvPath, metadata + csvContent, 'utf8');
  }
  
  // Estadísticas del análisis
  const stats = {
    total: allResults.length,
    tipografiaOK: allResults.filter(r => r.tipografia_check === '✅').length,
    colorCorporativo: allResults.filter(r => r.color_corporativo === '✅').length,
    cumpleEstandar: allResults.filter(r => r.cumple_estandar === '⭐').length,
  };

  console.log(`\n📊 RESULTADOS DEL ANÁLISIS:`);
  console.log(`🌐 Página escaneada: ${allResults[0]?.url || 'N/A'}`);
  console.log(`📄 Total de elementos analizados: ${stats.total}`);
  console.log(`✅ Tipografía correcta: ${stats.tipografiaOK}/${stats.total} (${Math.round(stats.tipografiaOK/stats.total*100)}%)`);
  console.log(`🟡 Paleta corporativa Lusso: ${stats.colorCorporativo}/${stats.total} (${Math.round(stats.colorCorporativo/stats.total*100)}%)`);
  console.log(`⭐ Cumple estándar completo: ${stats.cumpleEstandar}/${stats.total} (${Math.round(stats.cumpleEstandar/stats.total*100)}%)`);
  console.log(`\n✅ Reporte detallado generado: ${csvPath}`);
})();
