import * as THREE from 'https://unpkg.com/three@0.126.1/build/three.module.js';
import { OrbitControls } from 'https://unpkg.com/three@0.126.1/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from "https://unpkg.com/three@0.126.1/examples/jsm/loaders/GLTFLoader.js";
import { Vector2 } from 'https://unpkg.com/three@0.126.1/build/three.module.js';
import { BoneStructure } from './lib/three/boneStructure.js';
import { Animation } from './lib/animation.js';
import { ease, linearInterval, linearWave } from "./lib/easing.js";
import { clamp, sigmoid } from "./lib/util.js";

// === SCENE ===
const width = 600;
const height = 800;

const viewScale = 1.25;
const viewSize = new Vector2(0.75 * viewScale, 1 * viewScale);

const scene = new THREE.Scene();
const camera = new THREE.OrthographicCamera(
    -viewSize.x, viewSize.x, viewSize.y, -viewSize.y, 0.1, 1000
);
camera.position.set(0, 0, -6);
camera.rotation.set(0.1, Math.PI, 0);

const renderer = new THREE.WebGLRenderer({ alpha: true });
renderer.setSize(width, height);
renderer.setClearColor(0x313233);
document.getElementById("skin_container").appendChild(renderer.domElement);

let controls;
controls = new OrbitControls(camera, renderer.domElement);
controls.enableRotate = false;
controls.enableZoom = false;
controls.enablePan = false;
controls.update();

// === LIGHTS ===
const ambientLight = new THREE.AmbientLight(0xffffff, 1);
scene.add(ambientLight)
const dirLight1 = new THREE.DirectionalLight(0xffffff, 3);
dirLight1.position.set(0, 1, 2);
scene.add(dirLight1);

const dirLight2 = new THREE.DirectionalLight(0xffffff, 0.25);
dirLight2.position.set(0, 0, -1);
scene.add(dirLight2);

// === RENDER MODEL ===
let bones; // BoneStructure
let glideMouse = new Vector2();
let lastGlideMouse = new Vector2();
let mouseVelocity = new Vector2();
let mouse = new Vector2();

let anims; // Animations

const loader = new GLTFLoader();
loader.load("../resources/models/player.gltf", (gltf) => {
    scene.add(gltf.scene);

    bones = new BoneStructure(gltf.scene);

    anims = setupAnimations();
});

const clock = new THREE.Clock();
const jumpClock = new THREE.Clock(false);

function setupAnimations() {
    // === ANIMATIONS ===
    const idle = new Animation('idle', bones, (q) => {
        mouseVelocity.subVectors(glideMouse, lastGlideMouse).clampScalar(-0.1, 0.1);
        const mouseSpeed = clamp(mouseVelocity.length(), -0.1, 0.1);
        lastGlideMouse.copy(glideMouse);
        glideMouse.lerpVectors(glideMouse, mouse, 14 * clamp(q.delta, 0, 0.01));

        const distanceVec = mouse.clone();
        distanceVec.y += 0.1;

        return { ...q, mouse, mouseSpeed };
    });

    idle
        .setBoneAnimator('root', (root, q) => {
            root.rotation.y = glideMouse.x * 0.5;
        })
        .setBoneAnimator('waist', (waist, q) => {
            waist.rotation.y = glideMouse.x * 0.3;
            waist.rotation.x = -glideMouse.y * -0.05;
            waist.position.y = -7 / 16 + Math.sin(q.time) * 0.025;
            waist.position.z = -glideMouse.y * 0.05;
            waist.scale.y = 1 + q.mouseSpeed * -2.25;
            waist.scale.z = 1 + q.mouseSpeed * 2.25;
            waist.scale.x = 1 + q.mouseSpeed * 2.25;
        })
        .setBoneAnimator('leftArm', (leftArm, q) => {
            leftArm.rotation.x = -Math.cos(q.time) * 0.05125 + -glideMouse.y * 0.1;
            leftArm.rotation.z = Math.sin(q.time) * 0.05125 - 0.06 - Math.abs(mouseVelocity.x) * 10;
            leftArm.rotation.y = -Math.sin(q.time) * 0.125 + 0.25;
        })
        .setBoneAnimator('rightArm', (rightArm, q) => {
            rightArm.rotation.x = Math.cos(q.time) * 0.05125 + -glideMouse.y * 0.1;
            rightArm.rotation.z = -Math.sin(q.time) * 0.05125 + 0.06 + Math.abs(mouseVelocity.x) * 10;
            rightArm.rotation.y = Math.sin(q.time) * 0.125 - 0.25;
        })
        .setBoneAnimator('leftLeg', (leftLeg, q) => {
            leftLeg.rotation.z = -0.05;
            leftLeg.rotation.y = 0.125 + glideMouse.x * 0.1;
            leftLeg.rotation.x = -glideMouse.y * 0.05;
            leftLeg.position.z = -glideMouse.y * 0.05;
            leftLeg.position.y = -0.4
        })
        .setBoneAnimator('rightLeg', (rightLeg, q) => {
            rightLeg.rotation.z = 0.05;
            rightLeg.rotation.y = -0.125 + glideMouse.x * 0.1;
            rightLeg.rotation.x = -glideMouse.y * 0.05;
            rightLeg.position.z = -glideMouse.y * 0.05;
            rightLeg.position.y = -0.4
        })
        .setBoneAnimator('head', (head, q) => {
            head.lookAt(q.mouse.x * 10, -q.mouse.y * 10, 5);
            head.scale.set(1 + q.mouseSpeed * 0.5, 1 + q.mouseSpeed * 0.5, 1 + q.mouseSpeed * 0.5);
        });

    const wave = new Animation('wave', bones, (q) => {
        return { ...q }
    });
    wave
        .setBoneAnimator('rightArm', (rightArm, q) => {
            const t = q.time;

            rightArm.rotation.z = -Math.cos(t * 5) * 0.5 - 0.5;
            rightArm.rotation.y = Math.sin(t * 5) * 0.25;
        })
        .setBoneAnimator('waist', (waist, q) => {
            const t = q.time;

            waist.rotation.y = Math.sin(t * 2) * 0.1;
        });
    const jump = new Animation('jump', bones, (q) => {
        return {...q}
    });
    jump
        .setBoneAnimator('root', (root, q) => {
            const t = jumpClock.getElapsedTime();

            root.position.y = Math.max(0, Math.sin(t) * 30 -Math.pow(t, 2) * 100);
        })

    return { idle, wave, jump };
};

// === START ===
let activeAnim = 'idle';

function animate() {
    requestAnimationFrame(animate);
    const delta = clock.getDelta();

    if (!anims) return;

    if (activeAnim === 'idle') anims.idle.tick(delta);
    else if (activeAnim === 'wave') anims.jump.tick(delta);

    renderer.render(scene, camera);
};

// === EVENTS ===
window.addEventListener("mousemove", (e) => {
    const x = (e.clientX / window.innerWidth) * 2 - 1;
    const y = -(e.clientY / window.innerHeight) * 2 + 1;
    mouse.lerp(new Vector2(x, y - 0.8).multiplyScalar(0.5), 0.2);
    mouse.clampScalar(-2, 2);
});
window.addEventListener('resize', () => {
    const container = document.getElementById('skin_container');

    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;

    const scale = Math.min(containerWidth / width, containerHeight / height, 1);

    const newWidth = width * scale;
    const newHeight = height * scale;

    renderer.setSize(newWidth, newHeight);
    camera.aspect = newWidth / newHeight;
    camera.updateProjectionMatrix();
});
window.addEventListener('click', () => {
    if (activeAnim === 'wave') return;

    activeAnim = 'wave';
    jumpClock.start();
    setTimeout(() => {
        activeAnim = 'idle';
    }, 1000);
});

animate();