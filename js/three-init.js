// Load Three.js and its addons as ES modules via unpkg :contentReference[oaicite:9]{index=9}
import * as THREE from 'https://unpkg.com/three@0.136.0/build/three.module.js';
import { OrbitControls } from 'https://unpkg.com/three@0.136.0/examples/jsm/controls/OrbitControls.js'; :contentReference[oaicite:10]{index=10}
import { GLTFLoader }    from 'https://unpkg.com/three@0.136.0/examples/jsm/loaders/GLTFLoader.js'; :contentReference[oaicite:11]{index=11}

// Scene, camera, renderer
const scene    = new THREE.Scene();
const camera   = new THREE.PerspectiveCamera(50, window.innerWidth/window.innerHeight, .1, 1000);
const renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('scene'), alpha:true, antialias:true });
renderer.setSize(window.innerWidth, window.innerHeight);
camera.position.set(0,1.5,3);

// OrbitControls for drag/zoom :contentReference[oaicite:12]{index=12}
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

// Hemisphere light
const light = new THREE.HemisphereLight(0xffffff,0x444444,1);
scene.add(light);

// Load the expressive robot model
const loader = new GLTFLoader();
loader.load(
  'https://threejs.org/examples/models/gltf/RobotExpressive/RobotExpressive.glb',
  gltf => {
    const model = gltf.scene;
    model.scale.set(1.5,1.5,1.5);
    model.position.set(0,-1,0);
    scene.add(model);
    animate();
  },
  undefined,
  err => console.error('Model load error:', err)
);

// Handle window resizing :contentReference[oaicite:13]{index=13}
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth/window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// Animation loop
function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}
