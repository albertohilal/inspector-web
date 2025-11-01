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
🧩 Uso

Analizar una sola URL:

npm start -- --url https://lussogroup.demo.ar.nf/investment/


Analizar múltiples URLs (una por línea en urls.txt):

npm start -- --file urls.txt


El resultado se guarda en:

/reportes/reporte-AAAA-MM-DD.csv

🧠 Próxima versión (V2)

🎨 Detección de colores de texto y fondo.

🟡 Comparación automática con la paleta corporativa de Lusso (#d3af37, #000000, #ffffff, #f5f5f5).

📘 Generación de reportes de accesibilidad (contraste WCAG).

🧑‍💻 Autor

Alberto Hilal
Desarrollador Web – desarrolloydisenio.com.ar

🪪 Licencia

MIT © 2025 Alberto Hilal