// Espera a que cargue la página para que el contenedor exista
window.addEventListener("DOMContentLoaded", () => {
    const container = document.getElementById("skin-container");

    // Crea el visor de skin
    const skinViewer = new skinview3d.SkinViewer({
        domElement: container,
        width: 300,
        height: 400,
        skin: "textures/myskin.png"
    });

    // Animación: rotación automática
    skinViewer.autoRotate = true;

    // Animación de caminar
    const walk = skinViewer.animations.add(skinview3d.WalkingAnimation);
    walk.speed = 1;

    // Rotar con el mouse
    document.addEventListener("mousemove", (event) => {
        const x = (event.clientX / window.innerWidth) * 2 - 1;
        skinViewer.camera.rotation.y = x * 0.5;
    });
});
