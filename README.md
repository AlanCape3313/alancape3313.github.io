# AlanCape3313.github.io — v3

Cambios de esta versión:
- Three.js local en `node_modules/three`, usando una única instancia (0.180.0) para `player.js`, `GLTFLoader`, `OrbitControls` y las librerías del modelo.
- Restaurada la implementación original de `player.js` que cargaba `resources/models/player.gltf`.
- Navegación de pestañas embebida en `index.html`, sin `fetch()`, para que el sitio no dependa de CORS al abrirlo localmente.
- Diseño más horizontal y aprovechamiento de ancho (hasta 1540px / 96vw).
- Botones con las proporciones y efectos del estilo Minecraft original.
- Fondo morado oscuro con cuadrícula y partículas geométricas.
- YouTube con URLs de embed limpias. En GitHub Pages se muestran los iframes; al abrir `index.html` con `file://`, se muestra un enlace directo a YouTube en lugar del Error 153 que YouTube produce al no recibir un Referer HTTP.
