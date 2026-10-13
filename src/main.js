import * as THREE from 'three';

/**
 * Scene Three.js - Visualisation pedagogique de la blockchain
 * Metaphore : Le Convoi Ferroviaire Blinde
 * Jalon 1 : Scene de base et premier wagon temoin (Bloc Genesis)
 */

// 1. Initialisation de la scene et du canvas
const canvas = document.querySelector('#webgl');
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0b0f19);

// 2. Tailles et ratio
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight
};

// 3. Camera perspective
const camera = new THREE.PerspectiveCamera(45, sizes.width / sizes.height, 0.1, 100);
camera.position.set(4, 3, 5);
scene.add(camera);

// 4. Eclairage
const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0x38bdf8, 2.0);
directionalLight.position.set(5, 8, 4);
scene.add(directionalLight);

const warmFillLight = new THREE.DirectionalLight(0xf59e0b, 0.6);
warmFillLight.position.set(-5, -2, -4);
scene.add(warmFillLight);

// 5. Elements de decor (rails et sol)
const gridHelper = new THREE.GridHelper(20, 20, 0x1e293b, 0x0f172a);
gridHelper.position.y = -1;
scene.add(gridHelper);

// 6. Mesh temoin : Wagon de base (Bloc Genesis)
const wagonGroup = new THREE.Group();

// Corps du wagon (conteneur de transactions)
const bodyGeometry = new THREE.BoxGeometry(2, 1.2, 1.2);
const bodyMaterial = new THREE.MeshStandardMaterial({
  color: 0x1e293b,
  metalness: 0.6,
  roughness: 0.3
});
const wagonBody = new THREE.Mesh(bodyGeometry, bodyMaterial);
wagonBody.position.y = 0;
wagonGroup.add(wagonBody);

// Aretes lumineuses du wagon (indicateur de structure)
const edgesGeometry = new THREE.EdgesGeometry(bodyGeometry);
const edgesMaterial = new THREE.LineBasicMaterial({ color: 0x38bdf8 });
const edgesMesh = new THREE.LineSegments(edgesGeometry, edgesMaterial);
wagonBody.add(edgesMesh);

// Attelage magnetique arriere (symbolisant le hash de liaison)
const couplerGeometry = new THREE.CylinderGeometry(0.18, 0.18, 0.3, 16);
const couplerMaterial = new THREE.MeshStandardMaterial({
  color: 0x10b981,
  emissive: 0x059669,
  emissiveIntensity: 0.6,
  metalness: 0.8,
  roughness: 0.2
});
const coupler = new THREE.Mesh(couplerGeometry, couplerMaterial);
coupler.rotation.z = Math.PI / 2;
coupler.position.set(1.15, 0, 0);
wagonGroup.add(coupler);

// Essieux / roues temoins
const wheelGeometry = new THREE.CylinderGeometry(0.22, 0.22, 0.15, 16);
const wheelMaterial = new THREE.MeshStandardMaterial({
  color: 0x475569,
  metalness: 0.8,
  roughness: 0.4
});

const wheelPositions = [
  [-0.6, -0.65, 0.65],
  [0.6, -0.65, 0.65],
  [-0.6, -0.65, -0.65],
  [0.6, -0.65, -0.65]
];

wheelPositions.forEach(([x, y, z]) => {
  const wheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
  wheel.rotation.x = Math.PI / 2;
  wheel.position.set(x, y, z);
  wagonGroup.add(wheel);
});

scene.add(wagonGroup);
camera.lookAt(wagonGroup.position);

// 7. Moteur de rendu (WebGLRenderer)
const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// 8. Gestion du redimensionnement de la fenetre
window.addEventListener('resize', () => {
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

// 9. Boucle d'animation (requestAnimationFrame)
const clock = new THREE.Clock();

function animate() {
  const elapsedTime = clock.getElapsedTime();

  // Animation douce du wagon temoin
  wagonGroup.rotation.y = Math.sin(elapsedTime * 0.5) * 0.35;
  wagonGroup.position.y = Math.sin(elapsedTime * 1.5) * 0.05;

  // Rendu de la scene
  renderer.render(scene, camera);

  requestAnimationFrame(animate);
}

animate();
