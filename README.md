# 🕵️‍♂️ Inspector Web – Analizador de Fuentes y Estilos

**Inspector Web** es una herramienta profesional desarrollada en **Node.js + Puppeteer** que permite analizar cualquier página web para verificar:

- ✅ Uso correcto de la tipografía corporativa (por defecto, **Inter**)
- 📊 Exportación automática a **CSV**
- ⚙️ Análisis múltiple desde archivo de URLs
- 💾 Reportes organizados por fecha en la carpeta `reportes/`

---

## 🚀 Instalación

```bash
git clone https://github.com/albertohilal/inspector-web.git
cd inspector-web
npm install
## 🧩 Uso

### 📝 Versión 1.0 - Análisis de Tipografías (por defecto)

**Analizar una sola URL:**
```bash
npm start -- --url https://lussogroup.demo.ar.nf/investment/
```

**Analizar múltiples URLs:**
```bash
npm start -- --file urls.txt
```

**¿Qué analiza?** Solamente verifica el uso correcto de la tipografía corporativa (Inter) en todos los elementos de la página.

---

### 🎨 Versión 2.0 - Análisis Completo de Colores + Tipografías

**Analizar una sola URL:**
```bash
node index_v2.js -- --url https://lussogroup.demo.ar.nf/investment/
```

**Analizar múltiples URLs:**
```bash
node index_v2.js -- --file urls.txt
```

**¿Qué analiza?**
- ✅ **Tipografías** (Inter, sans-serif)
- 🎨 **Colores de texto y fondo** (valores RGB completos)
- 🟡 **Paleta Corporativa Lusso** (`#0D0D0D`, `#404040`, `#EAEAEA`, `#FFFFFF`, `#D4AF37`)
- 🎨 **Paleta Extendida** (variaciones adicionales permitidas)
- ⭐ **Cumplimiento de Estándar** (tipografía + paleta válida)
- 🔍 **Identificación precisa** con selector CSS y posición
- 👻 **Manejo inteligente de transparencias** (alpha=0 considerado válido)
- 📊 **Estadísticas automáticas** con porcentajes de cumplimiento

**Columnas del reporte CSV:**
- `Selector CSS` - Identificador específico del elemento (ej: `div.header#menu`)
- `Pos X/Y` - Coordenadas exactas en la página
- `Ancho/Alto` - Dimensiones del elemento
- `✅ Tipografía OK` - Check individual de fuentes
- `🟡 Paleta Lusso` - Check de paleta corporativa oficial  
- `🎨 Paleta Extendida` - Check de paleta ampliada
- `⭐ Cumple Estándar` - Check combinado (tipografía + color)

---

### 🚀 Versión 2.1 - Análisis Optimizado (iFastNet)

**Analizar una sola URL:**
```bash
node index_v2.1.js -- --url https://lussogroup.demo.ar.nf/investment/
```

**¿Qué analiza?**
- ✅ Tipografías (Inter)
- 🎨 **Extracción básica de colores** (sin validación de paleta)
- ⚡ **Optimizado para servidores lentos** (timeout extendido + interceptación inteligente)

---

### 📊 Archivos de salida

Los reportes se guardan automáticamente con fecha y hora:
- **V1.0:** `/reportes/reporte-AAAA-MM-DD-HHMM.csv`
- **V2.0:** `/reportes/reporte-v2-AAAA-MM-DD-HHMM.csv`
- **V2.1:** `/reportes/reporte-v2.1-AAAA-MM-DD-HHMM.csv`

**Ejemplo:** `reporte-v2-2025-11-06-1330.csv` (6 nov 2025 a las 13:30)

---

## 💡 ¿Cuál versión usar?

| Situación | Versión recomendada | Comando |
|-----------|-------------------|---------|
| Solo necesitas verificar tipografías | **V1.0** | `npm start -- --url [URL]` |
| Necesitas análisis completo de colores + paleta corporativa | **V2.0** | `node index_v2.js -- --url [URL]` |
| Servidor lento o problemas de timeout | **V2.1** | `node index_v2.1.js -- --url [URL]` |

---

## ✅ Funcionalidades Implementadas (V2.0 y V2.1)

🎨 **Detección de colores de texto y fondo** - ✅ Disponible

🟡 **Comparación automática con la paleta corporativa de Lusso** (`#0D0D0D`, `#404040`, `#EAEAEA`, `#FFFFFF`, `#D4AF37`) - ✅ Disponible

⚡ **Optimización para servidores lentos** - ✅ Disponible en V2.1

🔍 **Identificación precisa de elementos** - ✅ Disponible

👻 **Manejo inteligente de transparencias** - ✅ Disponible

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
| Color | Código | Uso Recomendado |
|-------|--------|----------------|
| **Negro** | `#0D0D0D` | Texto principal, fondos de secciones elegantes |
| **Gris Intenso** | `#404040` | Subtítulos, iconografía secundaria |
| **Blanco Apagado** | `#EAEAEA` | Fondos suaves de tarjetas, separadores, bordes |
| **Blanco** | `#FFFFFF` | Fondo principal, áreas de respiro, contraste |
| **Dorado** | `#D4AF37` | Acentos fuertes, botones primarios, elementos activos |

### 🔧 **Ejemplo de uso para debugging:**
```bash
# Ejecutar análisis
node index_v2.js --url https://tudominio.com

# Buscar elementos problemáticos en el CSV
grep "❌" reportes/reporte-v2-2025-11-06-HHMM.csv

# El reporte te dará:
# - Selector CSS exacto para localizar en el código
# - Posición en pantalla para encontrar visualmente  
# - Colores específicos que causan el problema
```

---

## 🚧 Próximas mejoras (V3)

 **Reportes de accesibilidad** - Análisis de contraste WCAG AA/AAA

🧪 **Análisis de elementos específicos** - Filtros por selector CSS personalizado

📱 **Detección responsive** - Análisis en múltiples breakpoints (mobile, tablet, desktop)

🎨 **Paletas personalizables** - Configuración de colores corporativos por proyecto

📈 **Dashboard web** - Interface visual para análisis y comparaciones

🔄 **Análisis comparativo** - Diferencias entre versiones del sitio

🧑‍💻 Autor

Alberto Hilal
Desarrollador Web – desarrolloydisenio.com.ar

🪪 Licencia

MIT © 2025 Alberto Hilal