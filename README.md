# 🕵️‍♂️ Inspector Web – Analizador Corporativo de Fuentes y Colores

**Inspector Web** es una herramienta profesional desarrollada en **Node.js + Puppeteer** que analiza páginas web para verificar el cumplimiento de estándares corporativos de diseño.

## 🎯 Funcionalidades

- ✅ **Tipografía corporativa**: Validación de fuentes Inter y sans-serif
- 🎨 **Paleta de colores Lusso**: Verificación de colores corporativos con tolerancia
- 🧹 **Filtros inteligentes**: Excluye elementos técnicos y se enfoca en contenido visual
- 📊 **Reportes detallados CSV**: Con metadata completa y coordenadas de elementos
- � **Rendimiento optimizado**: Carga rápida bloqueando solo imágenes innecesarias
- 📍 **Identificación precisa**: Selectores CSS y posicionamiento de elementos problemáticos

## 🚀 Instalación

```bash
git clone https://github.com/albertohilal/inspector-web.git
cd inspector-web
npm install
```

## 🧩 Uso

### 📝 Comando Principal (Análisis Completo)

```bash
# Usando npm (recomendado)
npm start -- --url https://lussogroup.es/properties/

# O directamente
node inspector.js --url https://lussogroup.es/properties/
```

### 🔍 Comando de Búsqueda (Herramienta Auxiliar)

```bash
# Usando npm
npm run search https://lussogroup.es/properties/ "Home"

# O directamente  
node buscar-texto.js https://lussogroup.es/properties/ "Home"
```

## 🎯 ¿Qué Analiza Cada Comando?

### 📊 **Análisis Principal** (`npm start`)
**Función:** Análisis completo de cumplimiento corporativo

**Analiza:**
- ✅ **Tipografías**: Verifica uso correcto de Inter y sans-serif en TODOS los elementos
- 🎨 **Colores de texto**: Valida que usen la paleta corporativa Lusso
- 🎨 **Colores de fondo**: Verifica fondos dentro de estándares corporativos  
- 📊 **Elementos visuales**: Solo analiza elementos realmente visibles al usuario
- 📍 **Localización precisa**: Proporciona selectores CSS y coordenadas exactas
- 🧹 **Filtrado inteligente**: Excluye elementos técnicos (script, style, head, etc.)

**Salida:**
- 📋 **Reporte CSV detallado** con metadata completa
- 📊 **Estadísticas de cumplimiento** con porcentajes
- ⚠️ **Lista de elementos problemáticos** con ubicaciones exactas

### 🔍 **Búsqueda de Texto** (`npm run search`) 
**Función:** Localizar elementos específicos por contenido textual

**Analiza:**
- 🎯 **Búsqueda exacta** del texto especificado
- 📍 **Coordenadas** y tamaños de elementos encontrados
- 🏷️ **Selectores CSS** para localizar en código
- 👁️ **Visibilidad** de cada elemento
- 🎨 **Clases CSS** aplicadas a cada elemento

**Salida:**
- 📋 **Lista detallada** de elementos que contienen el texto
- 📍 **Posiciones exactas** para localización visual
- 🔧 **Información técnica** para debugging

## 🔬 Tipos de Análisis Detallados

El **análisis principal** realiza 4 tipos de validaciones simultáneas:

### 1. 🔤 **Análisis de Tipografía**
- **¿Qué valida?** Verifica que todos los elementos usen las fuentes corporativas
- **Fuentes permitidas:** `Inter`, `sans-serif`
- **Resultado:** ✅ Cumple / ❌ No cumple
- **Ejemplo problema:** Elemento usando `"Times New Roman"` en lugar de `Inter`

### 2. 🎨 **Análisis de Color de Texto**
- **¿Qué valida?** Colors RGB del texto de cada elemento
- **Paleta permitida:** Colores corporativos Lusso con tolerancia de ±25 puntos RGB
- **Resultado:** ✅ Dentro de paleta / ❌ Color no corporativo
- **Ejemplo problema:** Texto en `rgb(64, 68, 4)` (verde) en lugar de negro corporativo

### 3. 🖼️ **Análisis de Color de Fondo** 
- **¿Qué valida?** Colors RGB del fondo de cada elemento
- **Incluye:** Fondos sólidos y transparencias (alpha=0 considerado válido)
- **Resultado:** ✅ Dentro de paleta / ❌ Color no corporativo
- **Ejemplo problema:** Fondo en color personalizado no corporativo

### 4. ⭐ **Análisis de Cumplimiento Total**
- **¿Qué valida?** Combinación de tipografía + colores
- **Criterio:** Elemento debe cumplir TODOS los estándares simultáneamente
- **Resultado:** ⭐ Cumple estándar completo / ⚠️ Tiene problemas
- **Meta:** 100% de elementos cumpliendo el estándar completo

### 📊 Ejemplo de Salida

```
� Inspector Web - Análisis iniciado
🌐 URL objetivo: https://lussogroup.es/properties/
📅 Fecha: 2025-11-10 | ⏰ Hora: 13:42
✅ Página cargada correctamente
📊 Elementos analizados: 142

📊 RESULTADOS DEL ANÁLISIS:
═════════════════════════════════════════════════
🌐 Página: https://lussogroup.es/properties/
📄 Elementos analizados: 142
🔤 Tipografía correcta: 142/142 (100%)
🎨 Color texto correcto: 29/142 (20%)
🎨 Color fondo correcto: 142/142 (100%)
🟡 Paleta Lusso completa: 29/142 (20%)
⭐ Cumple estándar total: 29/142 (20%)

✅ Reporte generado: /reportes/reporte-2025-11-10-1342.csv
```

### � Estructura del Reporte CSV

El archivo CSV incluye las siguientes columnas:

| Campo | Descripción |
|-------|-------------|
| `fecha_analisis` | Fecha del análisis |
| `hora_analisis` | Hora del análisis |
| `url_analizada` | URL de la página analizada |
| `selector_css` | Selector CSS único del elemento |
| `elemento_tag` | Tipo de elemento HTML (div, h1, p, etc.) |
| `posicion_x`, `posicion_y` | Coordenadas del elemento en la página |
| `ancho`, `alto` | Dimensiones del elemento |
| `texto` | Contenido textual del elemento |
| `fuente_detectada` | Fuente CSS detectada |
| `tamano_fuente` | Tamaño de la fuente |
| `peso_fuente` | Peso de la fuente (bold, normal, etc.) |
| `tipografia_ok` | ✅/❌ Cumple tipografía corporativa |
| `color_texto`, `color_fondo` | Colores RGB detectados |
| `color_texto_ok`, `color_fondo_ok` | ✅/❌ Colores dentro de paleta |
| `paleta_lusso_ok` | ✅/❌ Cumple paleta completa |
| `cumple_estandar_completo` | ⭐/⚠️ Cumple todos los estándares |

### � Archivos de Salida

Los reportes se guardan automáticamente con fecha y hora en la carpeta `reportes/`:
- **Formato:** `reporte-AAAA-MM-DD-HHMM.csv`
- **Ejemplo:** `reporte-2025-11-10-1342.csv`

## 🧹 Filtrado Inteligente de Elementos

El Inspector Web incluye **filtros automáticos** para enfocarse solo en elementos relevantes:

### ❌ **Elementos Excluidos Automáticamente:**
- **Elementos técnicos:** `<head>`, `<script>`, `<style>`, `<meta>`, `<link>`
- **Elemento raíz:** `<html>` (contiene código técnico)
- **Elementos ocultos:** `display: none`, `visibility: hidden`, `opacity: 0`
- **Elementos sin dimensiones:** Ancho o alto = 0px
- **Elementos fuera de pantalla:** Posición < -1000px
- **Código embebido:** Elementos con JavaScript o CSS inline

### ✅ **Elementos Analizados:**
- **Solo elementos visuales** realmente visibles al usuario
- **Con contenido textual** relevante (3-100 caracteres)
- **Con dimensiones positivas** y posición visible
- **Sin código técnico** en su contenido

### 📊 **Beneficios del Filtrado:**
- **Reduce ruido:** Elimina ~40% de elementos irrelevantes
- **Resultados precisos:** Se enfoca en UX real del usuario
- **Reportes limpios:** Solo elementos que importan para branding

## 🎨 Configuración de Paletas

### Paleta Corporativa Lusso (por defecto)
- `#0D0D0D` - Negro corporativo
- `#404040` - Gris intenso  
- `#EAEAEA` - Blanco suave
- `#FFFFFF` - Blanco puro
- `#D4AF37` - Dorado corporativo

### Tipografías Permitidas
- `Inter` - Fuente corporativa principal
- `sans-serif` - Fuente de respaldo

---

## 🔍 Identificación de Elementos Problemáticos

### 📍 **Información de localización incluida:**
- **Selector CSS completo:** `div.elementor-element.elementor-element-5a1b6199.lusso-header`
- **Posición exacta:** Coordenadas X,Y en la página
- **Dimensiones:** Ancho y alto del elemento
- **Contenido:** Texto visible del elemento

### 🎨 **Manejo de transparencias:**
- **Colores transparentes** (`rgba(r,g,b,0)`) se consideran **válidos** ✅
- Solo se validan **colores visibles** (alpha > 0)
- **Análisis más preciso** del cumplimiento real de la paleta

### 🎨 **Nueva Paleta Corporativa Lusso:**
## 🔧 Herramientas Auxiliares

### 🔍 Búsqueda de Texto
Localiza elementos específicos por contenido:
```bash
node buscar-texto.js https://ejemplo.com "texto a buscar"
```

## 🚧 Versionado

- **Versiones anteriores**: Disponibles en `versiones-anteriores/`
- **Versión actual**: `inspector.js` - Versión unificada con todas las funcionalidades

## 🔧 Desarrollo

### Estructura del Proyecto
```
inspector-web/
├── inspector.js          # Herramienta principal unificada
├── buscar-texto.js       # Utilidad de búsqueda
├── reportes/            # Reportes CSV generados
├── versiones-anteriores/ # Versiones previas archivadas
└── README.md            # Documentación
```

### Para Desarrolladores
```bash
# Clonar e instalar
git clone https://github.com/albertohilal/inspector-web.git
cd inspector-web
npm install

# Ejecutar análisis
node inspector.js --url https://ejemplo.com

# Ver reportes
ls reportes/
```

---

**Desarrollado por el equipo de Lusso Group para el control de calidad de diseño web corporativo.**

📈 **Dashboard web** - Interface visual para análisis y comparaciones

🔄 **Análisis comparativo** - Diferencias entre versiones del sitio

🧑‍💻 Autor

Alberto Hilal
Desarrollador Web – desarrolloydisenio.com.ar

🪪 Licencia

MIT © 2025 Alberto Hilal