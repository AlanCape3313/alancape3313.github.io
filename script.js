let skinViewer = new skinview3d.SkinViewer({
    canvas: document.getElementById("skin_container"),
    width: 300,
    height: 400,
    skin: "textures/skin/myskin.png"
});

// Cambiar tamaño
skinViewer.width = 600;
skinViewer.height = 800;

// Cargar capa
skinViewer.loadCape("textures/skin/cape.png");

// Fondo
skinViewer.background = 0x5a76f3;

// Cámara y zoom
skinViewer.fov = 70;
skinViewer.zoom = 0.5;

// Rotación y animación
skinViewer.autoRotate = true;
skinViewer.animation = new skinview3d.WalkingAnimation();
skinViewer.animation.speed = 3;
skinViewer.animation.paused = true;
