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
- 🟡 **Paleta Corporativa Lusso** (`#d3af37`, `#000000`, `#ffffff`, `#f5f5f5`)
- 🎨 **Paleta Extendida** (variaciones adicionales permitidas)
- ⭐ **Cumplimiento de Estándar** (tipografía + paleta válida)
- 📊 **Estadísticas automáticas** con porcentajes de cumplimiento

**Columnas del reporte CSV:**
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

🟡 **Comparación automática con la paleta corporativa de Lusso** (`#d3af37`, `#000000`, `#ffffff`, `#f5f5f5`) - ✅ Disponible en V2.0

⚡ **Optimización para servidores lentos** - ✅ Disponible en V2.1

---

## � Próximas mejoras (V3)

�📘 Generación de reportes de accesibilidad (contraste WCAG)

🔍 Análisis de elementos específicos por selector CSS

📱 Detección responsive y breakpoints

🧑‍💻 Autor

Alberto Hilal
Desarrollador Web – desarrolloydisenio.com.ar

🪪 Licencia

MIT © 2025 Alberto Hilal