/**
 * Inspector Web - Versión Unificada
 * Autor: Beto (LussoGroup)
 * 
 * Herramienta completa para análisis de tipografías y colores corporativos
 * 
 * Características:
 * ✅ Análisis completo de tipografías (Inter, sans-serif)
 * ✅ Validación de paleta corporativa Lusso
 * ✅ Filtros inteligentes (excluye elementos técnicos)
 * ✅ Detección precisa de elementos visuales
 * ✅ Reportes CSV detallados con metadata
 * ✅ Optimización de rendimiento (solo bloquea imágenes)
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
  console.error("💡 Uso: node inspector.js --url https://ejemplo.com");
  process.exit(1);
}

// === Configuración del reporte ===
const now = new Date();
const fecha = now.toISOString().slice(0, 10); // YYYY-MM-DD
const hora = now.toTimeString().slice(0, 5).replace(':', ''); // HHMM
const csvName = `reporte-${fecha}-${hora}.csv`;
const csvDir = path.join(__dirname, "reportes");
const csvPath = path.join(csvDir, csvName);
if (!fs.existsSync(csvDir)) fs.mkdirSync(csvDir, { recursive: true });

// === Configuración de validaciones ===
const FUENTES_PERMITIDAS = ['Inter', 'sans-serif'];
const PALETA_LUSSO = ['#0D0D0D', '#404040', '#EAEAEA', '#FFFFFF', '#D4AF37', '#d4af37']; // Nueva paleta corporativa oficial
const TOLERANCIA = 25; // Tolerancia para variaciones de color

// === Funciones de validación ===
function hexToRgb(hex) {
  const h = hex.replace('#', '');
  return [
    parseInt(h.substring(0, 2), 16),
    parseInt(h.substring(2, 4), 16),
    parseInt(h.substring(4, 6), 16)
  ];
}

function colorDistancia(color1, color2) {
  const [r1, g1, b1] = color1;
  const [r2, g2, b2] = color2;
  return Math.sqrt(Math.pow(r2 - r1, 2) + Math.pow(g2 - g1, 2) + Math.pow(b2 - b1, 2));
}

function parseRgbColor(color) {
  const match = color.match(/\d+/g);
  return match ? match.map(Number) : null;
}

function estaEnPaletaLusso(color) {
  if (!color || color === 'rgba(0, 0, 0, 0)' || color === 'transparent') return true; // Transparencia es válida
  const match = color.match(/\d+/g);
  if (!match) return false;
  const c = match.map(Number);
  
  // Si es totalmente transparente (alpha=0), considerarlo válido
  if (match.length === 4 && parseInt(match[3]) === 0) return true;
  
  return PALETA_LUSSO.some(hex => colorDistancia(c, hexToRgb(hex)) <= TOLERANCIA);
}

function validarTipografia(fontFamily) {
  if (!fontFamily) return false;
  const font = fontFamily.toLowerCase();
  return FUENTES_PERMITIDAS.some(permitida => font.includes(permitida.toLowerCase()));
}

// === Función principal ===
(async () => {
  console.log(`🔍 Inspector Web - Análisis iniciado`);
  console.log(`🌐 URL objetivo: ${url}`);
  console.log(`📅 Fecha: ${fecha} | ⏰ Hora: ${hora.replace(/(\d{2})(\d{2})/, '$1:$2')}`);

  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
  const page = await browser.newPage();

  // --- Interceptar peticiones para optimizar rendimiento ---
  await page.setRequestInterception(true);
  page.on("request", (req) => {
    const type = req.resourceType();
    if (["image"].includes(type)) { // Solo bloquear imágenes para velocidad
      req.abort();
    } else {
      req.continue(); // Permitir CSS, fuentes y JavaScript esenciales
    }
  });

  // --- Cargar página con timeout extendido ---
  try {
    await page.goto(url, {
      waitUntil: ["domcontentloaded", "networkidle0"],
      timeout: 180000, // 3 minutos
    });
    console.log(`✅ Página cargada correctamente`);
  } catch (err) {
    console.warn(`⚠️ Advertencia: Carga incompleta (${err.message})`);
  }

  // --- Extraer datos de elementos visuales ---
  const rawData = await page.evaluate(() => {
    const elements = [...document.querySelectorAll("*")];
    
    // Función para identificar elementos técnicos/no visuales
    function esElementoTecnico(el) {
      const tagName = el.tagName.toLowerCase();
      
      // Filtrar elementos técnicos del DOM
      const elementosTecnicos = ['head', 'meta', 'title', 'script', 'style', 'link', 'noscript'];
      if (elementosTecnicos.includes(tagName)) return true;
      if (tagName === 'html') return true; // HTML contiene código técnico
      
      // Filtrar elementos ocultos
      const style = window.getComputedStyle(el);
      if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') return true;
      
      // Filtrar elementos sin dimensiones
      const rect = el.getBoundingClientRect();
      if (rect.width === 0 && rect.height === 0) return true;
      if (rect.left < -1000 || rect.top < -1000) return true; // Elementos fuera de pantalla
      
      // Filtrar elementos con código CSS/JavaScript
      const text = el.textContent || '';
      if (text.includes('window._wpemojiSettings') || 
          text.includes('img.wp-smiley') ||
          text.includes(':root{--wp--preset') ||
          text.includes('contain-intrinsic-size') ||
          text.length > 200 && text.includes('{') && text.includes('}')) {
        return true;
      }
      
      return false;
    }

    const report = elements
      .filter(el => !esElementoTecnico(el))
      .map(el => {
        const style = window.getComputedStyle(el);
        const text = el.textContent?.trim();
        
        // Solo elementos con texto relevante
        if (!text || text.length === 0 || text.length > 100) return null;
        
        const rect = el.getBoundingClientRect();
        
        // Solo elementos realmente visibles
        if (rect.width <= 0 || rect.height <= 0 || 
            rect.left < 0 || rect.top < 0 ||
            style.display === 'none' || 
            style.visibility === 'hidden') return null;
        
        // Generar selector CSS específico
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
        
        return {
          selector: cssSelector,
          tag: el.tagName.toLowerCase(),
          posX: Math.round(rect.left),
          posY: Math.round(rect.top),
          width: Math.round(rect.width),
          height: Math.round(rect.height),
          text: text.replace(/\s+/g, ' ').slice(0, 50), // Normalizar espacios
          fontFamily: style.fontFamily,
          fontSize: style.fontSize,
          fontWeight: style.fontWeight,
          color: style.color,
          backgroundColor: style.backgroundColor,
        };
      })
      .filter(item => item !== null);
    
    return report;
  });

  console.log(`📊 Elementos analizados: ${rawData.length}`);

  // --- Procesar datos y aplicar validaciones ---
  const processedData = rawData.map(item => {
    const tipografiaOK = validarTipografia(item.fontFamily);
    const colorTextoOK = estaEnPaletaLusso(item.color);
    const colorFondoOK = estaEnPaletaLusso(item.backgroundColor);
    const paletaOK = colorTextoOK && colorFondoOK;
    const cumpleEstandar = tipografiaOK && paletaOK;

    return {
      // Metadata
      fecha_analisis: fecha,
      hora_analisis: hora.replace(/(\d{2})(\d{2})/, '$1:$2'),
      url_analizada: url,
      
      // Identificación del elemento
      selector_css: item.selector,
      elemento_tag: item.tag,
      posicion_x: item.posX,
      posicion_y: item.posY,
      ancho: item.width,
      alto: item.height,
      
      // Contenido
      texto: item.text,
      
      // Tipografía
      fuente_detectada: item.fontFamily,
      tamano_fuente: item.fontSize,
      peso_fuente: item.fontWeight,
      tipografia_ok: tipografiaOK ? '✅' : '❌',
      
      // Colores
      color_texto: item.color,
      color_fondo: item.backgroundColor,
      color_texto_ok: colorTextoOK ? '✅' : '❌',
      color_fondo_ok: colorFondoOK ? '✅' : '❌',
      paleta_lusso_ok: paletaOK ? '✅' : '❌',
      
      // Resultado final
      cumple_estandar_completo: cumpleEstandar ? '⭐' : '⚠️'
    };
  });

  // --- Calcular estadísticas ---
  const stats = {
    total: processedData.length,
    tipografiaOK: processedData.filter(r => r.tipografia_ok === '✅').length,
    colorTextoOK: processedData.filter(r => r.color_texto_ok === '✅').length,
    colorFondoOK: processedData.filter(r => r.color_fondo_ok === '✅').length,
    paletaOK: processedData.filter(r => r.paleta_lusso_ok === '✅').length,
    cumpleEstandar: processedData.filter(r => r.cumple_estandar_completo === '⭐').length,
  };

  // --- Generar reporte CSV ---
  const csv = parse(processedData, { 
    fields: [
      'fecha_analisis', 'hora_analisis', 'url_analizada',
      'selector_css', 'elemento_tag', 'posicion_x', 'posicion_y', 'ancho', 'alto',
      'texto', 'fuente_detectada', 'tamano_fuente', 'peso_fuente', 'tipografia_ok',
      'color_texto', 'color_fondo', 'color_texto_ok', 'color_fondo_ok', 'paleta_lusso_ok',
      'cumple_estandar_completo'
    ]
  });
  fs.writeFileSync(csvPath, csv, "utf8");

  // --- Mostrar resultados ---
  console.log(`\n📊 RESULTADOS DEL ANÁLISIS:`);
  console.log(`═════════════════════════════════════════════════`);
  console.log(`🌐 Página: ${url}`);
  console.log(`📄 Elementos analizados: ${stats.total}`);
  console.log(`🔤 Tipografía correcta: ${stats.tipografiaOK}/${stats.total} (${Math.round(stats.tipografiaOK/stats.total*100)}%)`);
  console.log(`🎨 Color texto correcto: ${stats.colorTextoOK}/${stats.total} (${Math.round(stats.colorTextoOK/stats.total*100)}%)`);
  console.log(`🎨 Color fondo correcto: ${stats.colorFondoOK}/${stats.total} (${Math.round(stats.colorFondoOK/stats.total*100)}%)`);
  console.log(`🟡 Paleta Lusso completa: ${stats.paletaOK}/${stats.total} (${Math.round(stats.paletaOK/stats.total*100)}%)`);
  console.log(`⭐ Cumple estándar total: ${stats.cumpleEstandar}/${stats.total} (${Math.round(stats.cumpleEstandar/stats.total*100)}%)`);
  console.log(`\n✅ Reporte generado: ${csvPath}`);
  
  // --- Mostrar elementos problemáticos si los hay ---
  const problemáticos = processedData.filter(r => r.cumple_estandar_completo === '⚠️');
  if (problemáticos.length > 0) {
    console.log(`\n⚠️ ELEMENTOS CON PROBLEMAS (${problemáticos.length}):`);
    problemáticos.slice(0, 5).forEach((elem, index) => {
      console.log(`${index + 1}. ${elem.elemento_tag} "${elem.texto}"`);
      if (elem.tipografia_ok === '❌') console.log(`   🔤 Fuente incorrecta: ${elem.fuente_detectada}`);
      if (elem.paleta_lusso_ok === '❌') console.log(`   🎨 Color no corporativo: ${elem.color_texto} / ${elem.color_fondo}`);
    });
    if (problemáticos.length > 5) {
      console.log(`   ... y ${problemáticos.length - 5} más (ver reporte completo)`);
    }
  }

  await browser.close();
  console.log(`\n🎯 Análisis completado exitosamente`);
})();