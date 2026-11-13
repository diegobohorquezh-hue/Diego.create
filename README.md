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
