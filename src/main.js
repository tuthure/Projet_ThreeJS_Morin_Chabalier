import * as THREE from 'three';
import { CameraController } from './cameraController.js';
import { TrainConvoy, WAGON_SPACING } from './train.js';
import { StepManager } from './steps/StepManager.js';
import { Environment } from './environment.js';
import { welcome } from './welcome.js';

/**
 * Visualisation pedagogique de la blockchain - Le Convoi Ferroviaire
 * Integration binome :
 * - Alban Chabalier : UX/UI (HUD Overlay), Controleur camera, Scenarisation des 7 notions
 * - Arthur Morin : Architecture Three.js, Modelisation procedurale des wagons, Logique de chaine
 */

// ============================================================================
// 1. Elements du DOM et Interface Utilisateur (HUD 2D)
// ============================================================================
const canvas = document.querySelector('#webgl');

// Indicateur de performances FPS (HUD superieur)
const fpsCounterEl = document.getElementById('fps-counter');

// ============================================================================
// 2. Scene, Canvas et Moteur de Rendu Three.js
// ============================================================================
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0c192e);
scene.fog = new THREE.Fog(0x0c192e, 40, 160);

const sizes = {
  width: window.innerWidth,
  height: window.innerHeight
};

const camera = new THREE.PerspectiveCamera(45, sizes.width / sizes.height, 0.1, 1000);
camera.position.set(4.5, 3.2, 7.5);
scene.add(camera);

const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true,
  powerPreference: 'high-performance'
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.15;

// ============================================================================
// 3. Eclairage cinematique
// ============================================================================
const ambientLight = new THREE.AmbientLight(0xdbeafe, 0.75);
scene.add(ambientLight);

const keyLight = new THREE.DirectionalLight(0xa5f3fc, 2.2);
keyLight.position.set(14, 20, 12);
scene.add(keyLight);

const rimLight = new THREE.DirectionalLight(0xfef08a, 1.2);
rimLight.position.set(-20, 15, -15);
scene.add(rimLight);

const fillLight = new THREE.DirectionalLight(0x38bdf8, 1.0);
fillLight.position.set(0, 8, 12);
scene.add(fillLight);

// ============================================================================
// 4. Decor ferroviaire dynamique (Rails, traverses mobiles et environnement)
// ============================================================================
const environment = new Environment(scene);

// ============================================================================
// 5. Initialisation du Convoi Ferroviaire (TrainConvoy)
// ============================================================================
const trainConvoy = new TrainConvoy(scene, {
  spacing: WAGON_SPACING,
  onStateChange: handleChainStateChange
});

// Initialisation du train : pour l'etape 1, seule la locomotive et le wagon Genesis (#0) sont presents
trainConvoy.init([]);

// ============================================================================
// 6. Controleur de Camera et Interactions
// ============================================================================
const cameraController = new CameraController(camera, renderer.domElement);

// ============================================================================
// 7. Navigation Pedagogique Modulaire des Notions (StepManager) & Accueil (Welcome)
// ============================================================================
const welcomeContext = {
  scene,
  camera,
  cameraController,
  trainConvoy,
  environment,
  stepManager: null
};

welcome.init(welcomeContext);

const stepManager = new StepManager({
  scene,
  camera,
  cameraController,
  trainConvoy,
  environment,
  welcome
});

welcomeContext.stepManager = stepManager;

// ============================================================================
// 8. Gestion des evenements de chaine
// ============================================================================
function handleChainStateChange(summary) {
  // Callback lors des mutations de la blockchain
}

// 10. Indicateur de performances FPS
// ============================================================================
let frameCount = 0;
let lastFpsTime = performance.now();

function updateFps() {
  frameCount++;
  const now = performance.now();
  if (now - lastFpsTime >= 500) {
    const fps = Math.round((frameCount * 1000) / (now - lastFpsTime));
    if (fpsCounterEl) {
      fpsCounterEl.textContent = `${fps} FPS`;
    }
    frameCount = 0;
    lastFpsTime = now;
  }
}

// ============================================================================
// 11. Redimensionnement de la fenetre
// ============================================================================
window.addEventListener('resize', () => {
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  camera.aspect = sizes.width / sizes.height;
  cameraController.updateCameraViewOffset();

  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

// ============================================================================
// 12. Boucle de rendu (requestAnimationFrame)
// ============================================================================
const clock = new THREE.Clock();

function animate() {
  const delta = clock.getDelta();
  const elapsedTime = clock.getElapsedTime();

  // Mise a jour de la camera
  cameraController.update(delta);

  // Mise a jour du decor ferroviaire defilant
  environment.update(delta, elapsedTime);

  // Suspension et rotation des roues adaptees a la vitesse du convoi
  trainConvoy.animateSuspension(elapsedTime, environment.currentSpeed, delta);

  // Rendu WebGL
  renderer.render(scene, camera);

  // Calcul du taux de rafraichissement
  updateFps();

  requestAnimationFrame(animate);
}

// ============================================================================
// 13. Exposition globale window.blockchain pour tests et verification
// ============================================================================
window.blockchain = {
  instance: trainConvoy.blockchain,
  convoy: trainConvoy,

  corruptBlock: (index = 1, newData = 'TRANSACTION_FALSIFIEE_9999_MMI') => {
    trainConvoy.corruptBlock(index, newData);
    const block = trainConvoy.getBlock(index);
    
  },

  addBlock: (data) => {
    const newBlock = trainConvoy.addBlock(data);
    cameraController.setInteractiveObjects(trainConvoy.getInteractiveObjects());
    return newBlock;
  },

  restore: (index) => {
    if (typeof index === 'number') {
      trainConvoy.resetBlock(index);
    } else {
      trainConvoy.restoreEntireTrain();
    }
    const block = trainConvoy.getBlock(inspectedBlockIndex);
    
  },

  recalculate: (index = 1) => {
    trainConvoy.recalculateAndMineBlock(index, 1);
    const block = trainConvoy.getBlock(index);
    
  },

  isValid: () => trainConvoy.blockchain.isChainValid(),

  welcome: () => welcome.enter(),

  goToStep: (num) => stepManager.goToStep(num),

  inspect: () => {
    const validityList = trainConvoy.blockchain.getBlockValidityList();
    console.table(
      trainConvoy.blockchain.chain.map((b, i) => ({
        index: b.index,
        valide: validityList[i],
        hash: `${b.hash.substring(0, 12)}...`,
        previousHash: `${b.previousHash.substring(0, 12)}...`,
        data: typeof b.data === 'string' ? b.data : JSON.stringify(b.data)
      }))
    );
  }
};

// Affichage initial de l'ecran d'accueil (avant l'etape 0) et demarrage de la boucle
welcome.enter();
animate();

console.log('[LE CONVOI FERROVIAIRE - BLOCKCHAIN 3D]');
console.log('Commandes de test interactives :');
console.log('- window.blockchain.corruptBlock(1) : falsifie le wagon 1');
console.log('- window.blockchain.addBlock() : attelle un nouveau wagon');
console.log('- window.blockchain.restore() : retablit la chaine');
console.log('- window.blockchain.inspect() : affiche l etat de la blockchain');
