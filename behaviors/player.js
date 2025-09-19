import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { Vector2 } from "three";

import { BoneStructure } from './lib/three/boneStructure.js';
import { Animation } from './lib/animation.js';
import { ease, linearInterval, linearWave } from "./lib/easing.js";
import { clamp, sigmoid } from "./lib/util.js";

// === ESCENA ===
const viewScale = 1.25;
const viewSize = new Vector2(0.75 * viewScale, 1 * viewScale);

const canvas = document.getElementById("skin_container");
const renderer = new THREE.WebGLRenderer({ canvas, alpha: true });
renderer.setSize(600, 800);

const scene = new THREE.Scene();

const camera = new THREE.OrthographicCamera(
    -viewSize.x, viewSize.x, viewSize.y, -viewSize.y, 0.1, 1000
);
camera.position.set(0, 1.1, -1);
camera.rotation.set(0.1, Math.PI, 0);

scene.add(new THREE.AmbientLight(0xffffff, 0.5));

const dirLight1 = new THREE.DirectionalLight(0xffffff, 3);
dirLight1.position.set(0, 1, 0);
scene.add(dirLight1);

const dirLight2 = new THREE.DirectionalLight(0xffffff, 0.25);
dirLight2.position.set(0, 0, -1);
scene.add(dirLight2);

// === VARIABLES GLOBALES ===
let bones; // BoneStructure
let glideMouse = new Vector2();
let lastGlideMouse = new Vector2();
let mouseVelocity = new Vector2();
let distanceToEye = 100;
let mouse = new Vector2();

let anims; // Animations

const clock = new THREE.Clock();

// === MOUSE INPUT ===
window.addEventListener("mousemove", (e) => {
    const x = (e.clientX / window.innerWidth) * 2 - 1;
    const y = -(e.clientY / window.innerHeight) * 2 + 1;
    mouse.lerp(new Vector2(x, y - 0.8).multiplyScalar(0.5), 0.2);
    mouse.clampScalar(-2, 2);
});

// === CARGA DEL MODELO ===
const loader = new GLTFLoader();
loader.load("/models/player.gltf", (gltf) => {
    scene.add(gltf.scene);

    bones = new BoneStructure(gltf.scene);

    anims = setupAnimations();
});

// === CONFIGURACIÓN DE ANIMACIONES ===
function setupAnimations() {
    const idle = new Animation('idle', bones, (q) => {
        // === PRE-FRAME: ACTUALIZAR MOUSE Y DELTA ===
        mouseVelocity.subVectors(glideMouse, lastGlideMouse).clampScalar(-0.1, 0.1);
        const mouseSpeed = clamp(mouseVelocity.length(), -0.1, 0.1);
        lastGlideMouse.copy(glideMouse);
        glideMouse.lerpVectors(glideMouse, mouse, 14 * clamp(q.delta, 0, 0.01));

        const distanceVec = mouse.clone();
        distanceVec.y += 0.1;
        distanceToEye = distanceVec.length();

        return { ...q, mouse, mouseSpeed };
    });

    // === ANIMADORES DE HUESOS ===
    idle
        .setBoneAnimator('root', (root, q) => {
            root.rotation.y = glideMouse.x * 0.25;
        })
        .setBoneAnimator('waist', (waist, q) => {
            waist.rotation.y = glideMouse.x * 0.125;
            waist.rotation.x = -glideMouse.y * -0.05;
            waist.position.y = -7 / 16 + Math.sin(q.time) * 0.025;
            waist.position.z = -glideMouse.y * 0.05;
            waist.scale.y = 1 + q.mouseSpeed * -0.25;
            waist.scale.z = 1 + q.mouseSpeed * 0.25;
            waist.scale.x = 1 + q.mouseSpeed * 0.25;
        })
        .setBoneAnimator('left_arm', (leftArm, q) => {
            leftArm.rotation.x = -Math.cos(q.time) * 0.05125 + -glideMouse.y * 0.1;
            leftArm.rotation.z = Math.sin(q.time) * 0.05125 - 0.06 - Math.abs(mouseVelocity.x) * 1;
            leftArm.rotation.y = -Math.sin(q.time) * 0.125 + 0.25;
        })
        .setBoneAnimator('right_arm', (rightArm, q) => {
            rightArm.rotation.x = Math.cos(q.time) * 0.05125 + -glideMouse.y * 0.1;
            rightArm.rotation.z = -Math.sin(q.time) * 0.05125 + 0.06 + Math.abs(mouseVelocity.x) * 1;
            rightArm.rotation.y = Math.sin(q.time) * 0.125 - 0.25;
        })
        .setBoneAnimator('left_leg', (leftLeg, q) => {
            leftLeg.rotation.z = -0.05;
            leftLeg.rotation.y = 0.125 + glideMouse.x * -0.1;
            leftLeg.rotation.x = -glideMouse.y * 0.05;
            leftLeg.position.z = -glideMouse.y * 0.05;
        })
        .setBoneAnimator('right_leg', (rightLeg, q) => {
            rightLeg.rotation.z = 0.05;
            rightLeg.rotation.y = -0.125 + glideMouse.x * -0.1;
            rightLeg.rotation.x = -glideMouse.y * 0.05;
            rightLeg.position.z = -glideMouse.y * 0.05;
        })
        .setBoneAnimator('left_eye_ring', (leftEyeRing, q) => {
            leftEyeRing.position.x = -2 / 16 + ease('easeInOutExpo', linearWave(q.time)) * 0.025 - 0.025;
            leftEyeRing.position.x -= 0.0125 + sigmoid(distanceToEye, 1, 0.00001) * 0.0125;
        })
        .setBoneAnimator('right_eye_ring', (rightEyeRing, q) => {
            rightEyeRing.position.x = 2 / 16 - ease('easeInOutExpo', linearWave(q.time)) * 0.025 + 0.025;
            rightEyeRing.position.x += 0.0125 + sigmoid(distanceToEye, 1, 0.00001) * 0.0125;
        })
        .setBoneAnimator('eye', (eye, q) => {
            eye.position.x = clamp(q.mouse.x * -0.25, -0.05, 0.05);
            eye.position.y = 4 / 16 - clamp((-q.mouse.y - 0.05) * 0.25, -0.05, 0.05);
            eye.scale.y = clamp(
                1 + clamp(ease('easeInCubic', linearInterval(q.time * 4, 16)) * -1.25, -1, 0) - q.mouseSpeed * 2,
                0, 2
            );
            eye.scale.x = 1 + ease('easeInCubic', linearInterval(q.time * 4, 16)) * 0.25 - q.mouseSpeed * -2;
            const extra = 0.75 + sigmoid(distanceToEye, 1, 0.00001) * 0.75;
            eye.scale.x += extra;
            eye.scale.y += extra;
        })
        .setBoneAnimator('left_ear', (leftEar, q) => {
            leftEar.rotation.x = -0.125 + ease('easeInOutExpo', linearWave(q.time - 0.25)) * 0.125 - mouseVelocity.y * 5;
        })
        .setBoneAnimator('right_ear', (rightEar, q) => {
            rightEar.rotation.x = -0.125 + ease('easeInOutExpo', linearWave(q.time - 0.25)) * 0.125 - mouseVelocity.y * 5;
        })
        .setBoneAnimator('head', (head, q) => {
            head.lookAt(q.mouse.x * 2, -q.mouse.y + 1.25, 5);
            head.scale.y = 1 + q.mouseSpeed * -0.5;
            head.scale.z = 1 + q.mouseSpeed * 0.5;
            head.scale.x = 1 + q.mouseSpeed * 0.5;
        });

    return { idle };
}

// === BUCLE DE ANIMACIÓN ===
function animate() {
    requestAnimationFrame(animate);
    const delta = clock.getDelta();

    if (anims) anims.idle.tick(delta);

    renderer.render(scene, camera);
}

animate();