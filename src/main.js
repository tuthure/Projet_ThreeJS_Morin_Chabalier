import * as THREE from 'three';
import { CameraController } from './cameraController.js';
import { TrainConvoy, WAGON_SPACING } from './train.js';

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

// HUD superieur (En-tete, sequence et indicateurs)
const sequenceTitleEl = document.getElementById('sequence-title');
const sequenceDescEl = document.getElementById('sequence-desc');
const chainStatusPill = document.getElementById('chain-status-pill');
const chainStatusText = document.getElementById('chain-status-text');
const fpsCounterEl = document.getElementById('fps-counter');

// HUD inferieur (Navigation des 7 notions)
const stepButtons = document.querySelectorAll('.step-btn');
const btnPrev = document.getElementById('btn-prev');
const btnNext = document.getElementById('btn-next');

// Boutons de changement d'angle de vue
const btnViewQuarter = document.getElementById('btn-view-quarter');
const btnViewProfile = document.getElementById('btn-view-profile');
const btnViewCoupler = document.getElementById('btn-view-coupler');
const btnViewOverview = document.getElementById('btn-view-overview');
const viewButtons = [btnViewQuarter, btnViewProfile, btnViewCoupler, btnViewOverview].filter(Boolean);

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
let currentStep = 1;

// ============================================================================
// 2. Scene, Canvas et Moteur de Rendu Three.js
// ============================================================================
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x070b14);
scene.fog = new THREE.FogExp2(0x070b14, 0.018);

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
renderer.toneMappingExposure = 1.1;

// ============================================================================
// 3. Eclairage cinematique
// ============================================================================
const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambientLight);

const keyLight = new THREE.DirectionalLight(0x7dd3fc, 2.0);
keyLight.position.set(12, 16, 10);
scene.add(keyLight);

const rimLight = new THREE.DirectionalLight(0xf59e0b, 0.7);
rimLight.position.set(-12, -4, -10);
scene.add(rimLight);

const fillLight = new THREE.DirectionalLight(0x38bdf8, 0.9);
fillLight.position.set(0, 8, -8);
scene.add(fillLight);

// ============================================================================
// 4. Decor ferroviaire (Rails metalliques et traverses)
// ============================================================================
function setupEnvironment() {
  const envGroup = new THREE.Group();

  // Grille au sol industrielle
  const gridHelper = new THREE.GridHelper(90, 90, 0x1e293b, 0x0f172a);
  gridHelper.position.y = -0.5;
  envGroup.add(gridHelper);

  // Plan de sol sombre
  const groundGeometry = new THREE.PlaneGeometry(90, 90);
  const groundMaterial = new THREE.MeshStandardMaterial({
    color: 0x050811,
    roughness: 0.95,
    metalness: 0.1
  });
  const groundMesh = new THREE.Mesh(groundGeometry, groundMaterial);
  groundMesh.rotation.x = -Math.PI / 2;
  groundMesh.position.y = -0.52;
  envGroup.add(groundMesh);

  // Rails longitudinaux le long de l'axe X (espacement de 1.32 adapte aux essieux)
  const railLength = 100;
  const railDistance = 1.32;
  const railGeometry = new THREE.BoxGeometry(railLength, 0.12, 0.08);
  const railMaterial = new THREE.MeshStandardMaterial({
    color: 0x94a3b8,
    metalness: 0.9,
    roughness: 0.2
  });

  const railCenterX = 6;
  const railLeft = new THREE.Mesh(railGeometry, railMaterial);
  railLeft.position.set(railCenterX, -0.32, -railDistance / 2);
  envGroup.add(railLeft);

  const railRight = new THREE.Mesh(railGeometry, railMaterial);
  railRight.position.set(railCenterX, -0.32, railDistance / 2);
  envGroup.add(railRight);

  // Traverses de voie ferree regulieres
  const sleeperCount = 90;
  const sleeperSpacing = 1.1;
  const sleeperGeometry = new THREE.BoxGeometry(0.3, 0.08, 1.9);
  const sleeperMaterial = new THREE.MeshStandardMaterial({
    color: 0x1f2937,
    roughness: 0.85,
    metalness: 0.2
  });

  const startX = railCenterX - (sleeperCount * sleeperSpacing) / 2;
  for (let i = 0; i < sleeperCount; i++) {
    const sleeper = new THREE.Mesh(sleeperGeometry, sleeperMaterial);
    sleeper.position.set(startX + i * sleeperSpacing, -0.42, 0);
    envGroup.add(sleeper);
  }

  scene.add(envGroup);
}
setupEnvironment();

// ============================================================================
// 5. Initialisation du Convoi Ferroviaire (TrainConvoy)
// ============================================================================
const trainConvoy = new TrainConvoy(scene, {
  spacing: WAGON_SPACING,
  onStateChange: handleChainStateChange
});

// Initialisation avec 3 wagons de transactions s'ajoutant au Genesis (#0)
trainConvoy.init([
  {
    emetteur: 'Arthur',
    destinataire: 'Alban',
    montant: 15,
    unite: 'MMI-Coin'
  },
  {
    emetteur: 'Alban',
    destinataire: 'Equipe-R507',
    montant: 30,
    unite: 'MMI-Coin'
  },
  {
    emetteur: 'Quai-Central',
    destinataire: 'Station-Nord',
    montant: 8,
    unite: 'MMI-Coin'
  }
]);

// ============================================================================
// 6. Controleur de Camera et Interactions
// ============================================================================
const cameraController = new CameraController(camera, renderer.domElement, (blockData) => {
  selectWagon(blockData.index, false);
});
cameraController.setInteractiveObjects(trainConvoy.getWagonMeshes());

// ============================================================================
// 7. Navigation Pedagogique des 7 Notions
// ============================================================================
const sequencesInfo = [
  {
    step: 1,
    title: "Sequence 1 : Structure d'un bloc",
    desc: "Anatomie d'un wagon : coffre de transactions, plaque gravée SHA-256, connecteur previousHash et molette de Nonce.",
    getCamPos: () => {
      const pos = trainConvoy.getWagonPosition(0);
      return new THREE.Vector3(pos.x + 2.0, 2.0, 4.2);
    },
    getCamTarget: () => {
      const pos = trainConvoy.getWagonPosition(0);
      return new THREE.Vector3(pos.x, 0.45, 0);
    },
    wagonIndex: 0
  },
  {
    step: 2,
    title: "Sequence 2 : Chainage cryptographique",
    desc: "L'attelage magnetique scelle le wagon precedent au suivant. Chaque bloc integre l'empreinte du wagon qui le precede.",
    getCamPos: () => {
      const pos = trainConvoy.getWagonPosition(1);
      return new THREE.Vector3(pos.x - 2.5, 1.4, 2.6);
    },
    getCamTarget: () => {
      const pos = trainConvoy.getWagonPosition(1);
      return new THREE.Vector3(pos.x - 1.9, 0.4, 0);
    },
    wagonIndex: 1
  },
  {
    step: 3,
    title: "Sequence 3 : Immutabilite et falsification",
    desc: "Modifiez les transactions dans le panneau lateral : la rupture de l'attelage magnetique invalide instantanement tous les wagons suivants.",
    getCamPos: () => {
      const pos = trainConvoy.getWagonPosition(1);
      return new THREE.Vector3(pos.x + 2.0, 2.0, 4.4);
    },
    getCamTarget: () => {
      const pos = trainConvoy.getWagonPosition(1);
      return new THREE.Vector3(pos.x, 0.45, 0);
    },
    wagonIndex: 1
  },
  {
    step: 4,
    title: "Sequence 4 : Reseau et decentralisation",
    desc: "Vue elargie du convoi : chaque participant au reseau conserve une copie conforme de l'integralite du convoi ferroviaire.",
    getCamPos: () => {
      const center = trainConvoy.getTrainCenter();
      return new THREE.Vector3(center.x, 5.5, 13.0);
    },
    getCamTarget: () => trainConvoy.getTrainCenter(),
    wagonIndex: 2
  },
  {
    step: 5,
    title: "Sequence 5 : Validation et minage (PoW)",
    desc: "Resolution mecanique du Nonce : les machines scellent le bloc pour que son hash respecte la regle de difficulte.",
    getCamPos: () => {
      const lastIndex = trainConvoy.wagonMeshes.length - 1;
      const pos = trainConvoy.getWagonPosition(lastIndex);
      return new THREE.Vector3(pos.x + 2.0, 2.2, 4.2);
    },
    getCamTarget: () => {
      const lastIndex = trainConvoy.wagonMeshes.length - 1;
      return trainConvoy.getWagonPosition(lastIndex);
    },
    wagonIndex: 3
  },
  {
    step: 6,
    title: "Sequence 6 : Comparaison des consensus (PoW vs PoS)",
    desc: "Confrontation energetique : la preuve de travail consomme de la puissance de calcul, la preuve d'enjeu sequestre des garanties.",
    getCamPos: () => {
      const center = trainConvoy.getTrainCenter();
      return new THREE.Vector3(center.x, 7.0, 15.0);
    },
    getCamTarget: () => trainConvoy.getTrainCenter(),
    wagonIndex: 1
  },
  {
    step: 7,
    title: "Sequence 7 : Cycle de vie et illustration d'attaque",
    desc: "Trajectoire d'une transaction du quai d'embarquement jusqu'a son scellement definitif et rejet des tentatives de double depense.",
    getCamPos: () => {
      const center = trainConvoy.getTrainCenter();
      return new THREE.Vector3(center.x, 4.5, 11.0);
    },
    getCamTarget: () => trainConvoy.getTrainCenter(),
    wagonIndex: 0
  }
];

function setSequence(stepNumber) {
  currentStep = Math.max(1, Math.min(stepNumber, 7));
  const seq = sequencesInfo[currentStep - 1];

  // Mise a jour textuelle du HUD
  if (sequenceTitleEl) sequenceTitleEl.textContent = seq.title;
  if (sequenceDescEl) sequenceDescEl.textContent = seq.desc;

  // Mise a jour de la barre d'etapes
  stepButtons.forEach((btn) => {
    btn.classList.toggle('active', parseInt(btn.dataset.step) === currentStep);
  });

  if (btnPrev) btnPrev.disabled = currentStep === 1;
  if (btnNext) btnNext.disabled = currentStep === 7;

  // Deplacement de la camera vers le point de vue scenarise
  const camPos = seq.getCamPos();
  const camTarget = seq.getCamTarget();
  cameraController.moveTo(camPos, camTarget, 1.2);

  // Ouvre le panneau sur le wagon associe si pertinent
  if (seq.wagonIndex !== null) {
    selectWagon(seq.wagonIndex, false);
  }
}

stepButtons.forEach((btn) => {
  btn.addEventListener('click', () => {
    setSequence(parseInt(btn.dataset.step));
  });
});

if (btnPrev) {
  btnPrev.addEventListener('click', () => {
    if (currentStep > 1) setSequence(currentStep - 1);
  });
}

if (btnNext) {
  btnNext.addEventListener('click', () => {
    if (currentStep < 7) setSequence(currentStep + 1);
  });
}

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
function applyViewAngle(viewMode, wagonIndex = inspectedBlockIndex, duration = 1.0) {
  currentViewMode = viewMode;

  // Mise a jour visuelle des boutons d'angles de vue
  viewButtons.forEach((btn) => {
    btn.classList.toggle('active', btn.id === `btn-view-${viewMode}`);
  });

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
      if (wagonIndex > 0) {
        targetPos = new THREE.Vector3(wagonPos.x - 2.6, 1.3, 2.4);
        targetLookAt = new THREE.Vector3(wagonPos.x - 1.6, 0.45, 0);
      } else {
        // Pour le wagon Genesis, focus sur la prise droite vers le wagon suivant
        targetPos = new THREE.Vector3(wagonPos.x + 2.6, 1.3, 2.4);
        targetLookAt = new THREE.Vector3(wagonPos.x + 1.5, 0.45, 0);
      }
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

if (btnViewQuarter) {
  btnViewQuarter.addEventListener('click', () => applyViewAngle('quarter'));
}
if (btnViewProfile) {
  btnViewProfile.addEventListener('click', () => applyViewAngle('profile'));
}
if (btnViewCoupler) {
  btnViewCoupler.addEventListener('click', () => applyViewAngle('coupler'));
}
if (btnViewOverview) {
  btnViewOverview.addEventListener('click', () => applyViewAngle('overview'));
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

  const wagonLabel = block.index === 0 ? 'Locomotive #0 (Bloc Genesis)' : `Wagon #${block.index} (Bloc #${block.index})`;
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

// Mise a jour visuelle des indicateurs du HUD lors des mutations de chaine
function handleChainStateChange(summary) {
  if (chainStatusPill && chainStatusText && summary) {
    if (summary.isValid) {
      chainStatusPill.className = 'stat-pill status-ok';
      chainStatusText.textContent = `Chaine valide (${summary.totalWagons} wagons)`;
    } else {
      chainStatusPill.className = 'stat-pill status-error';
      chainStatusText.textContent = `Alerte : Rupture au wagon #${summary.firstInvalidIndex}`;
    }
  }

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

  // Suspension et legere oscillation des wagons
  trainConvoy.animateSuspension(elapsedTime);

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
    cameraController.setInteractiveObjects(trainConvoy.getWagonMeshes());
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

// Initialisation sur la premiere sequence et demarrage de la boucle
setSequence(1);
animate();

console.log('[LE CONVOI FERROVIAIRE - BLOCKCHAIN 3D]');
console.log('Commandes de test interactives :');
console.log('- window.blockchain.corruptBlock(1) : falsifie le wagon 1');
console.log('- window.blockchain.addBlock() : attelle un nouveau wagon');
console.log('- window.blockchain.restore() : retablit la chaine');
console.log('- window.blockchain.inspect() : affiche l etat de la blockchain');
