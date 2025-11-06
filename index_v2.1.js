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
const fecha = new Date().toISOString().slice(0, 10);
const csvName = `reporte-v2.1-${fecha}.csv`;
const csvDir = path.join(__dirname, "reportes");
const csvPath = path.join(csvDir, csvName);
if (!fs.existsSync(csvDir)) fs.mkdirSync(csvDir, { recursive: true });

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
  const data = await page.evaluate(() => {
    const elements = [...document.querySelectorAll("*")];
    const report = elements.map(el => {
      const style = window.getComputedStyle(el);
      return {
        tag: el.tagName.toLowerCase(),
        text: el.textContent.trim().slice(0, 80), // recorte de texto
        fontFamily: style.fontFamily,
        fontSize: style.fontSize,
        color: style.color,
        backgroundColor: style.backgroundColor,
      };
    });
    return report;
  });

  // --- Exportar CSV ---
  const csv = parse(data, { fields: Object.keys(data[0] || {}) });
  fs.writeFileSync(csvPath, csv, "utf8");

  console.log(`✅ Reporte generado: ${csvPath}`);

  await browser.close();
})();
