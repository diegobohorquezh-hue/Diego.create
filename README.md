# Ámbar — Cocina & Bar

Landing page para un restaurante bar, en HTML, CSS y JS puros (sin dependencias ni compilación).

## Ver en local

```bash
python3 -m http.server 8080   # y abre http://localhost:8080
```

## Estructura

- `index.html`: contenido y secciones
- `css/styles.css`: diseño, colores (variables en `:root`) y animaciones CSS
- `js/main.js`: preloader, reveals, parallax, galería horizontal, cursor, botones magnéticos, tilt 3D, carta y formulario

## Personalizar

- Nombre, textos, precios, horario, dirección y contacto están en `index.html` (los datos actuales son de ejemplo).
- Las fotos vienen de Unsplash; cámbialas por las del local.
- El formulario de reservas solo muestra la confirmación: conéctalo a tu backend, a WhatsApp o a un servicio como Formspree.
- Si el sistema del visitante tiene activado "reducir movimiento", las animaciones se desactivan.

## Versión 2 (`v2/`): skill design-taste-frontend

Una segunda landing, hecha al pie de la letra con la skill `design-taste-frontend` (instalada en `.claude/skills/`), para comparar con la versión animada de la raíz.

- Nombre inventado y verificado: **Brasolé** (búsqueda en `v2/names.json`).
- Diseño claro y guiado por fotos, una animación principal ("picture-develops" en la foto de la terraza), micro-interacciones al pasar el ratón.
- Pasa la verificación final de la skill: `GATE: PASS`.
- Horarios y precios supuestos (marcados con `data-assumed`); las fotos son provisionales de Unsplash.
- El formulario envía a `reservas@brasole.example` (provisional): hay que poner la dirección real o un servicio de formularios en `data-endpoint`.

Ver en local: `cd v2 && python3 -m http.server 8081` y abre http://localhost:8081.
