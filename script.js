import skinview3d from 'https://cdn.jsdelivr.net/npm/skinview3d@3.4.1/+esm';

const container = document.getElementById("skin-container");

const skinViewer = new skinview3d.SkinViewer({
    domElement: container,
    width: 300,
    height: 400,
    skin: "textures/myskin.png"
});

skinViewer.autoRotate = false;

const walk = skinViewer.animations.add(skinview3d.WalkingAnimation);
walk.speed = 1;

container.addEventListener("mousemove", (event) => {
    const rect = container.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
    const y = ((event.clientY - rect.top) / rect.height - 0.5) * 2;

    skinViewer.player.rotation.y = x * Math.PI;       // rotación horizontal
    skinViewer.player.rotation.x = -y * Math.PI * 0.25; // rotación vertical
});