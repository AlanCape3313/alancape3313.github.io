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

const canvas = document.getElementById(`skin_container`);

canvas.addEventListener(`mousemove`, (event) => {
    const rect = canvas.getBoundingClientRect();
    
    const x = ((event.clientX - rect.left) / rect.width - 0.5) * 2;  
    const y = ((event.clientY - rect.top) / rect.height - 0.5) * 2;

    skinViewer.player.rotation.y = x * Math.PI;        // de -180° a 180°
    skinViewer.player.rotation.x = -y * Math.PI * 0.25; // un cuarto de rotación vertical
})