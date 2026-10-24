import * as THREE from 'three';
import { CameraController } from './cameraController.js';
import { TrainConvoy, WAGON_SPACING } from './train.js';
import { StepManager } from './steps/StepManager.js';
import { Environment } from './environment.js';

/**
 * Visualisation pedagogique de la blockchain - Le Convoi Ferroviaire
 * Integration binome :
 * - Alban Chabalier : UX/UI (HUD Overlay), Controleur camera, Scenarisation des 7 notions
 * - Arthur Morin : Architecture Three.js, Modelisation procedurale des wagons, Logique de chaine
 */

// ============================================================================
// 1. Elements du DOM et Interface Utilisateur (HUD 2D & Sidebar d'Inspection)
// ============================================================================
const canvas = document.querySelector('#webgl');

// Indicateur de performances FPS (HUD superieur)
const fpsCounterEl = document.getElementById('fps-counter');

// Panneau lateral droit d'inspection (Drawer)
const sidebarEl = document.getElementById('inspection-sidebar');
const btnCloseSidebar = document.getElementById('btn-close-sidebar');
const btnWagonPrev = document.getElementById('btn-wagon-prev');
const btnWagonNext = document.getElementById('btn-wagon-next');
const sidebarTitleEl = document.getElementById('sidebar-wagon-title');
const fieldIndex = document.getElementById('field-index');
const fieldData = document.getElementById('field-data');
const fieldPrevHash = document.getElementById('field-prev-hash');
const fieldHash = document.getElementById('field-hash');
const fieldNonce = document.getElementById('field-nonce');
const fieldStatus = document.getElementById('field-status');
const fieldStatusText = document.getElementById('field-status-text');

// Variables d'etat globales de l'application
let inspectedBlockIndex = 0;
let currentViewMode = 'quarter';

// ============================================================================
// 2. Scene, Canvas et Moteur de Rendu Three.js
// ============================================================================
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0c192e);
scene.fog = new THREE.Fog(0x0c192e, 25, 95);

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
const cameraController = new CameraController(camera, renderer.domElement, (blockData) => {
  if (blockData?.isLocomotive) {
    if (sidebarEl) {
      sidebarEl.classList.remove('open');
      sidebarEl.setAttribute('aria-hidden', 'true');
    }
  } else if (typeof blockData?.index === 'number') {
    selectWagon(blockData.index, false);
  }
});
cameraController.setInteractiveObjects(trainConvoy.getInteractiveObjects());

// ============================================================================
// 7. Navigation Pedagogique Modulaire des Notions (StepManager)
// ============================================================================
const stepManager = new StepManager({
  scene,
  camera,
  cameraController,
  trainConvoy,
  environment,
  selectWagon: (idx) => selectWagon(idx, false)
});

// ============================================================================
// 8. Gestion des Angles de Vue et Navigation Inter-Wagons
// ============================================================================

/**
 * Applique un angle de vue cinematographique specifique autour du wagon cible
 * ou sur l'ensemble du convoi.
 * @param {'quarter'|'profile'|'coupler'|'overview'} viewMode - Type de vue demande.
 * @param {number} [wagonIndex=inspectedBlockIndex] - Index du wagon concerne.
 * @param {number} [duration=1.0] - Duree de la transition camera en secondes.
 */
function applyViewAngle(viewMode = 'quarter', wagonIndex = inspectedBlockIndex, duration = 1.0) {
  currentViewMode = viewMode;

  const wagonPos = trainConvoy.getWagonPosition(wagonIndex);
  let targetPos;
  let targetLookAt;

  switch (viewMode) {
    case 'profile':
      // Vue de profil orthogonale axee sur la marchandise, le chassis et la molette du nonce
      targetPos = new THREE.Vector3(wagonPos.x, 0.7, 4.2);
      targetLookAt = new THREE.Vector3(wagonPos.x, 0.45, 0);
      break;

    case 'coupler':
      // Vue rapprochee sur l'attelage cryptographique et la plaque transversale previousHash a gauche
      targetPos = new THREE.Vector3(wagonPos.x - 2.6, 1.3, 2.4);
      targetLookAt = new THREE.Vector3(wagonPos.x - 1.6, 0.45, 0);
      break;

    case 'overview': {
      // Vue d'ensemble sur le convoi complet
      const center = trainConvoy.getTrainCenter();
      targetPos = new THREE.Vector3(center.x, 5.0, 12.0);
      targetLookAt = new THREE.Vector3(center.x, 0.4, 0);
      break;
    }

    case 'quarter':
    default:
      currentViewMode = 'quarter';
      // Vue de trois-quarts perspective equilibrant volume, cargaison et lisibilite
      targetPos = new THREE.Vector3(wagonPos.x + 2.0, 2.0, 4.2);
      targetLookAt = new THREE.Vector3(wagonPos.x, 0.45, 0);
      break;
  }

  cameraController.moveTo(targetPos, targetLookAt, duration);
}

/**
 * Selectionne un wagon, actualise la sidebar et deplace la camera selon l'angle actif.
 * @param {number} index - Index ordinal du bloc/wagon.
 * @param {boolean} [animateCam=true] - Declencher le mouvement de camera.
 */
function selectWagon(index, animateCam = true) {
  const total = trainConvoy.wagonMeshes.length;
  if (index < 0 || index >= total) return;

  inspectedBlockIndex = index;
  const block = trainConvoy.getBlock(inspectedBlockIndex);
  if (block) {
    openInspectionSidebar(block);
  }

  if (animateCam) {
    applyViewAngle(currentViewMode, inspectedBlockIndex);
  }
}

function updateWagonNavButtons() {
  const total = (typeof trainConvoy !== 'undefined' && trainConvoy?.wagonMeshes)
    ? trainConvoy.wagonMeshes.length
    : 0;
  if (btnWagonPrev) btnWagonPrev.disabled = inspectedBlockIndex <= 0;
  if (btnWagonNext) btnWagonNext.disabled = total > 0 ? (inspectedBlockIndex >= total - 1) : true;
}

if (btnWagonPrev) {
  btnWagonPrev.addEventListener('click', () => {
    if (inspectedBlockIndex > 0) {
      selectWagon(inspectedBlockIndex - 1, true);
    }
  });
}

if (btnWagonNext) {
  btnWagonNext.addEventListener('click', () => {
    if (inspectedBlockIndex < trainConvoy.wagonMeshes.length - 1) {
      selectWagon(inspectedBlockIndex + 1, true);
    }
  });
}

// ============================================================================
// 9. Panneau Lateral d'Inspection (Sidebar / Drawer en lecture seule)
// ============================================================================
function openInspectionSidebar(block) {
  if (!block) return;
  inspectedBlockIndex = block.index;

  const wagonLabel = block.index === 0 ? 'Wagon #0 (Bloc Genesis)' : `Wagon #${block.index} (Bloc #${block.index})`;
  if (sidebarTitleEl) sidebarTitleEl.textContent = wagonLabel;

  if (fieldIndex) fieldIndex.value = block.index;
  if (fieldData) {
    fieldData.value = typeof block.data === 'string'
      ? block.data
      : JSON.stringify(block.data, null, 2);
  }
  if (fieldPrevHash) fieldPrevHash.value = block.previousHash || '0000000000000000';
  if (fieldHash) fieldHash.value = block.hash;
  if (fieldNonce) fieldNonce.value = block.nonce;

  const validityList = trainConvoy.blockchain.getBlockValidityList();
  const isValid = validityList[block.index] ?? false;
  updateSidebarStatus(isValid);
  updateWagonNavButtons();

  if (sidebarEl) {
    sidebarEl.classList.add('open');
    sidebarEl.setAttribute('aria-hidden', 'false');
  }
}

function updateSidebarStatus(isValid) {
  if (!fieldStatus || !fieldStatusText) return;
  if (isValid) {
    fieldStatus.className = 'status-indicator valid';
    fieldStatusText.textContent = 'Attelage magnetique actif (valide)';
  } else {
    fieldStatus.className = 'status-indicator invalid';
    fieldStatusText.textContent = 'Rupture d\'attelage (hash corrompu)';
  }
}

if (btnCloseSidebar) {
  btnCloseSidebar.addEventListener('click', () => {
    if (sidebarEl) {
      sidebarEl.classList.remove('open');
      sidebarEl.setAttribute('aria-hidden', 'true');
    }
  });
}

// Mise a jour visuelle lors des mutations de chaine
function handleChainStateChange(summary) {
  // Si le panneau est ouvert, rafraichit l'indicateur d'etat du bloc courant
  const validityList = summary?.validityList;
  if (sidebarEl && sidebarEl.classList.contains('open') && validityList) {
    const currentIsValid = validityList[inspectedBlockIndex] ?? false;
    updateSidebarStatus(currentIsValid);
  }

  updateWagonNavButtons();
}

// ============================================================================
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
  camera.updateProjectionMatrix();

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

  // Suspension et legere oscillation des wagons adaptee a la vitesse
  trainConvoy.animateSuspension(elapsedTime, environment.currentSpeed);

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
    if (block) openInspectionSidebar(block);
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
    if (block) openInspectionSidebar(block);
  },

  recalculate: (index = 1) => {
    trainConvoy.recalculateAndMineBlock(index, 1);
    const block = trainConvoy.getBlock(index);
    if (block) openInspectionSidebar(block);
  },

  isValid: () => trainConvoy.blockchain.isChainValid(),

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

// Initialisation sur l'etape d'accueil (Etape 0) et demarrage de la boucle
stepManager.goToStep(0);
animate();

console.log('[LE CONVOI FERROVIAIRE - BLOCKCHAIN 3D]');
console.log('Commandes de test interactives :');
console.log('- window.blockchain.corruptBlock(1) : falsifie le wagon 1');
console.log('- window.blockchain.addBlock() : attelle un nouveau wagon');
console.log('- window.blockchain.restore() : retablit la chaine');
console.log('- window.blockchain.inspect() : affiche l etat de la blockchain');
