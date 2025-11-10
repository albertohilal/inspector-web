// test-paleta.js - Verificar que la nueva paleta está funcionando
import fs from 'fs';
import path from 'path';

// === Importar funciones del archivo principal ===
const PALETA_LUSSO = ['#0D0D0D', '#404040', '#EAEAEA', '#FFFFFF', '#D4AF37', '#d4af37'];
const TOLERANCIA = 25;

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

function estaEnPaletaLusso(color) {
  if (!color || !color.startsWith('rgb')) return false;
  const match = color.match(/\d+/g);
  if (!match) return false;
  const c = match.map(Number);
  return PALETA_LUSSO.some(hex => colorDistancia(c, hexToRgb(hex)) <= TOLERANCIA);
}

// === Tests específicos ===
console.log('🧪 PRUEBAS DE LA NUEVA PALETA LUSSO\n');

const coloresPrueba = [
  { nombre: 'Negro', hex: '#0D0D0D', rgb: 'rgb(13, 13, 13)' },
  { nombre: 'Gris intenso', hex: '#404040', rgb: 'rgb(64, 64, 64)' },
  { nombre: 'Blanco apagado', hex: '#EAEAEA', rgb: 'rgb(234, 234, 234)' },
  { nombre: 'Blanco', hex: '#FFFFFF', rgb: 'rgb(255, 255, 255)' },
  { nombre: 'Dorado D4AF37', hex: '#D4AF37', rgb: 'rgb(212, 175, 55)' },
  { nombre: 'Dorado d4af37', hex: '#d4af37', rgb: 'rgb(212, 175, 55)' },
  { nombre: 'Negro puro', hex: '#000000', rgb: 'rgb(0, 0, 0)' },
  { nombre: 'Color fuera de paleta', hex: '#FF0000', rgb: 'rgb(255, 0, 0)' },
];

coloresPrueba.forEach(color => {
  const enPaleta = estaEnPaletaLusso(color.rgb);
  const icono = enPaleta ? '✅' : '❌';
  console.log(`${icono} ${color.nombre} (${color.hex}) -> ${color.rgb}: ${enPaleta ? 'EN PALETA' : 'FUERA DE PALETA'}`);
});

console.log('\n📊 PALETA CONFIGURADA:');
PALETA_LUSSO.forEach((hex, i) => {
  console.log(`${i + 1}. ${hex}`);
});

console.log('\n🎯 TOLERANCIA CONFIGURADA:', TOLERANCIA, 'puntos RGB');