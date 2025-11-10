// index.js
import fs from 'fs';
import path from 'path';
import puppeteer from 'puppeteer';
import { createObjectCsvWriter } from 'csv-writer';

// === CONFIGURACIÓN GENERAL ===
const OUTPUT_DIR = path.resolve('./reportes');
const DEFAULT_FONT = 'Inter';

// === FUNCIONES AUXILIARES ===

// Lee un argumento de línea de comandos
function getArg(flag) {
  const index = process.argv.indexOf(flag);
  return index !== -1 ? process.argv[index + 1] : null;
}

// Crea carpeta si no existe
function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`📁 Carpeta creada: ${dir}`);
  }
}

// === ENTRADAS ===
const url = getArg('--url');
const file = getArg('--file');

if (!url && !file) {
  console.error(`
❌ Debes usar uno de los siguientes parámetros:

  node index.js --url https://lussogroup.demo.ar.nf/investment/
  node index.js --file urls.txt

`);
  process.exit(1);
}

// === SALIDA ===
ensureDir(OUTPUT_DIR);
const now = new Date();
const fecha = now.toISOString().split('T')[0]; // YYYY-MM-DD
const hora = now.toTimeString().slice(0, 5).replace(':', ''); // HHMM
const reportName = `reporte-${fecha}-${hora}.csv`;
const csvPath = path.join(OUTPUT_DIR, reportName);

const csvWriter = createObjectCsvWriter({
  path: csvPath,
  header: [
    { id: 'url', title: 'URL' },
    { id: 'selector', title: 'Selector' },
    { id: 'text', title: 'Texto' },
    { id: 'font', title: 'Fuente detectada' },
    { id: 'status', title: 'Cumple estándar' },
  ],
});

// === FUNCIÓN PRINCIPAL DE ANÁLISIS ===
async function analyzePage(targetUrl) {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  console.log(`🔍 Analizando: ${targetUrl}`);

  try {
    await page.goto(targetUrl, {
      waitUntil: 'domcontentloaded',
      timeout: 90000,
    });
  } catch (error) {
    console.error(`⚠️ No se pudo cargar la página ${targetUrl}: ${error.message}`);
    await browser.close();
    return [];
  }

  // Extrae texto y fuente de los elementos visibles
  const results = await page.evaluate((DEFAULT_FONT) => {
    const elements = Array.from(document.querySelectorAll('*'));
    const data = [];
    for (const el of elements) {
      const style = window.getComputedStyle(el);
      const font = style.fontFamily || '';
      const text = el.innerText?.trim();
      if (text && text.length > 2) {
        data.push({
          selector: el.tagName.toLowerCase(),
          text: text.slice(0, 80).replace(/\s+/g, ' '),
          font,
          status: font.includes(DEFAULT_FONT) ? '✅' : '❌',
        });
      }
    }
    return data;
  }, DEFAULT_FONT);

  await browser.close();
  console.log(`📊 ${results.length} elementos analizados en ${targetUrl}`);

  return results.map((r) => ({ url: targetUrl, ...r }));
}

// === FLUJO PRINCIPAL ===
(async () => {
  const urls = [];

  if (url) urls.push(url);
  if (file && fs.existsSync(file)) {
    const lines = fs.readFileSync(file, 'utf8').split(/\r?\n/).filter(Boolean);
    urls.push(...lines);
  }

  if (urls.length === 0) {
    console.error('⚠️ No se encontraron URLs para analizar.');
    process.exit(1);
  }

  let allResults = [];

  for (const u of urls) {
    try {
      const results = await analyzePage(u);
      allResults.push(...results);
    } catch (err) {
      console.error(`❌ Error en ${u}: ${err.message}`);
    }
  }

  if (allResults.length > 0) {
    await csvWriter.writeRecords(allResults);
    
    // Estadísticas básicas
    const totalElementos = allResults.length;
    const cumpleEstandar = allResults.filter(r => r.cumple_estandar === '✅').length;
    
    console.log(`\n📊 RESULTADOS DEL ANÁLISIS (V1.0):`);
    console.log(`🌐 Páginas escaneadas: ${urls.length}`);
    if (urls.length === 1) {
      console.log(`📄 URL: ${allResults[0]?.url || 'N/A'}`);
    }
    console.log(`📄 Total de elementos analizados: ${totalElementos}`);
    console.log(`✅ Elementos con tipografía correcta: ${cumpleEstandar}/${totalElementos} (${Math.round(cumpleEstandar/totalElementos*100)}%)`);
    console.log(`\n✅ Reporte generado correctamente: ${csvPath}`);
  } else {
    console.log('⚠️ No se generaron resultados.');
  }
})();
