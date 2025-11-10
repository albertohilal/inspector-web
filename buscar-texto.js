// buscar-texto.js - Herramienta para localizar texto específico
import fs from 'fs';
import path from 'path';
import puppeteer from 'puppeteer';

// === CONFIGURACIÓN ===
const url = process.argv[2];
const textoABuscar = process.argv.slice(3).join(' ');

if (!url || !textoABuscar) {
  console.error(`
❌ Uso correcto:
  node buscar-texto.js https://google.com "GmailImágenes Acceder"
  
🔍 Este script localiza elementos que contienen texto específico.
`);
  process.exit(1);
}

// === FUNCIÓN PRINCIPAL ===
(async () => {
  console.log(`🔍 Buscando texto: "${textoABuscar}"`);
  console.log(`📄 En URL: ${url}\n`);

  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });

  // Buscar elementos que contengan el texto
  const resultados = await page.evaluate((texto) => {
    const elementos = [...document.querySelectorAll('*')];
    const matches = [];

    elementos.forEach((el, index) => {
      const textoElemento = el.textContent?.trim() || '';
      
      if (textoElemento.includes(texto)) {
        // Generar selector específico
        let selector = el.tagName.toLowerCase();
        if (el.id) selector += `#${el.id}`;
        if (el.className && typeof el.className === 'string') {
          const classes = el.className.trim().split(/\s+/).slice(0, 3);
          if (classes.length > 0 && classes[0]) {
            selector += '.' + classes.join('.');
          }
        }

        // Posición y dimensiones
        const rect = el.getBoundingClientRect();
        
        matches.push({
          indice: index,
          tag: el.tagName.toLowerCase(),
          selector: selector,
          texto: textoElemento.slice(0, 150),
          x: Math.round(rect.left),
          y: Math.round(rect.top),
          ancho: Math.round(rect.width),
          alto: Math.round(rect.height),
          esVisible: rect.width > 0 && rect.height > 0,
          atributos: {
            id: el.id || '',
            class: el.className || '',
            href: el.href || '',
            src: el.src || ''
          }
        });
      }
    });

    return matches;
  }, textoABuscar);

  console.log(`📊 Encontrados ${resultados.length} elementos que contienen: "${textoABuscar}"\n`);

  resultados.forEach((resultado, i) => {
    console.log(`🎯 ELEMENTO ${i + 1}:`);
    console.log(`   Tag: ${resultado.tag}`);
    console.log(`   Selector CSS: ${resultado.selector}`);
    console.log(`   Posición: (${resultado.x}, ${resultado.y})`);
    console.log(`   Tamaño: ${resultado.ancho}x${resultado.alto}px`);
    console.log(`   Visible: ${resultado.esVisible ? '👁️ Sí' : '🙈 No'}`);
    
    if (resultado.atributos.id) {
      console.log(`   ID: ${resultado.atributos.id}`);
    }
    if (resultado.atributos.class) {
      console.log(`   Clases: ${resultado.atributos.class}`);
    }
    if (resultado.atributos.href) {
      console.log(`   Enlace: ${resultado.atributos.href}`);
    }
    
    console.log(`   Texto: ${resultado.texto}`);
    console.log(`   ─────────────────────────────────────\n`);
  });

  if (resultados.length === 0) {
    console.log(`❌ No se encontró texto que contenga: "${textoABuscar}"`);
    console.log(`💡 Sugerencias:`);
    console.log(`   - Verifica que el texto sea exacto (respeta mayúsculas)`);
    console.log(`   - Prueba con una porción más pequeña del texto`);
    console.log(`   - El texto podría generarse dinámicamente`);
  }

  await browser.close();
})();