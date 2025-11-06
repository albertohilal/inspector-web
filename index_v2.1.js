/**
 * Inspector Web v2.1 — Versión optimizada para iFastNet
 * Autor: Beto (LussoGroup)
 * Mejora: Timeout extendido + Interceptación inteligente
 */

import fs from "fs";
import path from "path";
import puppeteer from "puppeteer";
import { fileURLToPath } from "url";
import { dirname } from "path";
import { parse } from "json2csv";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// === Parámetros ===
const args = process.argv.slice(2);
const urlArgIndex = args.indexOf("--url");
const url = urlArgIndex !== -1 ? args[urlArgIndex + 1] : null;

if (!url) {
  console.error("❌ Debes especificar una URL con el parámetro --url");
  process.exit(1);
}

// === Configuración del reporte ===
const now = new Date();
const fecha = now.toISOString().slice(0, 10); // YYYY-MM-DD
const hora = now.toTimeString().slice(0, 5).replace(':', ''); // HHMM
const csvName = `reporte-v2.1-${fecha}-${hora}.csv`;
const csvDir = path.join(__dirname, "reportes");
const csvPath = path.join(csvDir, csvName);
if (!fs.existsSync(csvDir)) fs.mkdirSync(csvDir, { recursive: true });

// === Configuración de validaciones ===
const FUENTES_PERMITIDAS = ['Inter', 'sans-serif'];
const PALETA_LUSSO = ['#d3af37', '#000000', '#ffffff', '#f5f5f5'];
const TOLERANCIA = 25;

// === Funciones de validación ===
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

function estaEnPaletaLusso(color) {
  if (!color || !color.startsWith('rgb')) return false;
  
  // Los colores transparentes se consideran válidos
  if (esColorTransparente(color)) return true;
  
  const match = color.match(/\d+/g);
  if (!match) return false;
  const c = match.map(Number);
  return PALETA_LUSSO.some(hex => colorDistancia(c, hexToRgb(hex)) <= TOLERANCIA);
}

function validarTipografia(fontFamily) {
  if (!fontFamily) return false;
  const font = fontFamily.toLowerCase();
  return FUENTES_PERMITIDAS.some(permitida => font.includes(permitida.toLowerCase()));
}

// === Función principal ===
(async () => {
  console.log(`🔍 Analizando: ${url}`);

  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
  const page = await browser.newPage();

  // --- Interceptar peticiones para acelerar ---
  await page.setRequestInterception(true);
  page.on("request", (req) => {
    const type = req.resourceType();
    if (["image", "font", "stylesheet"].includes(type)) {
      req.abort();
    } else {
      req.continue();
    }
  });

  // --- Intentar cargar la página con timeout extendido ---
  try {
    await page.goto(url, {
      waitUntil: ["domcontentloaded", "networkidle0"],
      timeout: 180000, // 3 minutos
    });
  } catch (err) {
    console.warn(`⚠️ Advertencia: ${url} no completó carga total (${err.message})`);
  }

  // --- Extraer estilos y fuentes ---
  const rawData = await page.evaluate(() => {
    const elements = [...document.querySelectorAll("*")];
    const report = elements.map(el => {
      const style = window.getComputedStyle(el);
      
      // Generar selector CSS más específico
      let cssSelector = el.tagName.toLowerCase();
      if (el.id) {
        cssSelector += `#${el.id}`;
      }
      if (el.className && typeof el.className === 'string') {
        const classes = el.className.trim().split(/\s+/).slice(0, 3);
        if (classes.length > 0 && classes[0]) {
          cssSelector += '.' + classes.join('.');
        }
      }

      // Obtener posición
      const rect = el.getBoundingClientRect();
      
      return {
        selector: cssSelector,
        tag: el.tagName.toLowerCase(),
        posX: Math.round(rect.left),
        posY: Math.round(rect.top),
        width: Math.round(rect.width),
        height: Math.round(rect.height),
        text: el.textContent.trim().slice(0, 80),
        fontFamily: style.fontFamily,
        fontSize: style.fontSize,
        color: style.color,
        backgroundColor: style.backgroundColor,
      };
    });
    return report.filter(item => item.text && item.text.length > 2);
  });

  // --- Procesar datos y añadir validaciones ---
  const processedData = rawData.map(item => {
    const tipografiaOK = validarTipografia(item.fontFamily);
    const colorLusso = estaEnPaletaLusso(item.color) || estaEnPaletaLusso(item.backgroundColor);
    const cumpleEstandar = tipografiaOK && colorLusso;

    return {
      url: url,
      selector_css: item.selector,
      elemento_tag: item.tag,
      posicion_x: item.posX,
      posicion_y: item.posY,
      ancho: item.width,
      alto: item.height,
      texto: item.text,
      fuente: item.fontFamily,
      'tipografia_check': tipografiaOK ? '✅' : '❌',
      color_texto: item.color,
      color_fondo: item.backgroundColor,
      'paleta_lusso': colorLusso ? '✅' : '❌',
      'cumple_estandar': cumpleEstandar ? '⭐' : '⚠️'
    };
  });

  // --- Estadísticas ---
  const stats = {
    total: processedData.length,
    tipografiaOK: processedData.filter(r => r.tipografia_check === '✅').length,
    paletaOK: processedData.filter(r => r.paleta_lusso === '✅').length,
    cumpleEstandar: processedData.filter(r => r.cumple_estandar === '⭐').length,
  };

  // --- Exportar CSV ---
  const csv = parse(processedData, { 
    fields: [
      'url', 'selector_css', 'elemento_tag', 'posicion_x', 'posicion_y', 'ancho', 'alto',
      'texto', 'fuente', 'tipografia_check', 'color_texto', 'color_fondo', 'paleta_lusso', 'cumple_estandar'
    ]
  });
  fs.writeFileSync(csvPath, csv, "utf8");

  console.log(`\n📊 RESULTADOS DEL ANÁLISIS (V2.1 Optimizada):`);
  console.log(`📄 Total de elementos analizados: ${stats.total}`);
  console.log(`✅ Tipografía correcta: ${stats.tipografiaOK}/${stats.total} (${Math.round(stats.tipografiaOK/stats.total*100)}%)`);
  console.log(`🟡 Paleta Lusso: ${stats.paletaOK}/${stats.total} (${Math.round(stats.paletaOK/stats.total*100)}%)`);
  console.log(`⭐ Cumple estándar completo: ${stats.cumpleEstandar}/${stats.total} (${Math.round(stats.cumpleEstandar/stats.total*100)}%)`);
  console.log(`\n✅ Reporte detallado generado: ${csvPath}`);

  await browser.close();
})();
