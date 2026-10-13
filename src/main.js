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
// 1. Scene, Canvas et Moteur de Rendu Three.js
// ============================================================================
const canvas = document.querySelector('#webgl');
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
// 2. Eclairage cinematique
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
// 3. Decor ferroviaire (Rails metalliques et traverses)
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

  // Rails longitudinaux le long de l'axe X (espacement de 1.32 adapte aux roues des wagons)
  const railLength = 90;
  const railDistance = 1.32;
  const railGeometry = new THREE.BoxGeometry(railLength, 0.12, 0.08);
  const railMaterial = new THREE.MeshStandardMaterial({
    color: 0x94a3b8,
    metalness: 0.9,
    roughness: 0.2
  });

  const railLeft = new THREE.Mesh(railGeometry, railMaterial);
  railLeft.position.set(-12, -0.32, -railDistance / 2);
  envGroup.add(railLeft);

  const railRight = new THREE.Mesh(railGeometry, railMaterial);
  railRight.position.set(-12, -0.32, railDistance / 2);
  envGroup.add(railRight);

  // Traverses de voie ferree regulieres
  const sleeperCount = 80;
  const sleeperSpacing = 1.1;
  const sleeperGeometry = new THREE.BoxGeometry(0.3, 0.08, 1.9);
  const sleeperMaterial = new THREE.MeshStandardMaterial({
    color: 0x1f2937,
    roughness: 0.85,
    metalness: 0.2
  });

  const startX = -12 - (sleeperCount * sleeperSpacing) / 2;
  for (let i = 0; i < sleeperCount; i++) {
    const sleeper = new THREE.Mesh(sleeperGeometry, sleeperMaterial);
    sleeper.position.set(startX + i * sleeperSpacing, -0.42, 0);
    envGroup.add(sleeper);
  }

  scene.add(envGroup);
}
setupEnvironment();

// ============================================================================
// 4. Initialisation du Convoi Ferroviaire (TrainConvoy)
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
// 5. Controleur de Camera et Interactions
// ============================================================================
let inspectedBlockIndex = 0;

const cameraController = new CameraController(camera, renderer.domElement, (blockData) => {
  openInspectionSidebar(blockData);
});
cameraController.setInteractiveObjects(trainConvoy.getWagonMeshes());

// ============================================================================
// 6. Navigation Pedagogique des 7 Notions
// ============================================================================
const sequencesInfo = [
  {
    step: 1,
    title: "Sequence 1 : Structure d'un bloc",
    desc: "Anatomie d'un wagon : coffre de transactions, plaque gravée SHA-256, connecteur previousHash et molette de Nonce.",
    getCamPos: () => new THREE.Vector3(1.6, 2.0, 4.4),
    getCamTarget: () => new THREE.Vector3(0, 0.4, 0),
    wagonIndex: 0
  },
  {
    step: 2,
    title: "Sequence 2 : Chainage cryptographique",
    desc: "L'attelage magnetique scelle le wagon precedent au suivant. Chaque bloc integre l'empreinte du wagon qui le precede.",
    getCamPos: () => new THREE.Vector3(-1.0, 1.8, 3.8),
    getCamTarget: () => new THREE.Vector3(-1.9, 0.3, 0),
    wagonIndex: 1
  },
  {
    step: 3,
    title: "Sequence 3 : Immutabilite et falsification",
    desc: "Modifiez les transactions dans le panneau lateral : la rupture de l'attelage magnetique invalide instantanement tous les wagons suivants.",
    getCamPos: () => new THREE.Vector3(-2.2, 2.2, 4.8),
    getCamTarget: () => new THREE.Vector3(-3.8, 0.4, 0),
    wagonIndex: 1
  },
  {
    step: 4,
    title: "Sequence 4 : Reseau et decentralisation",
    desc: "Vue elargie du convoi : chaque participant au reseau conserve une copie conforme de l'integralite du convoi ferroviaire.",
    getCamPos: () => {
      const center = trainConvoy.getTrainCenter();
      return new THREE.Vector3(center.x, 6.0, 13.5);
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
      return new THREE.Vector3(center.x + 2.0, 7.5, 15.0);
    },
    getCamTarget: () => trainConvoy.getTrainCenter(),
    wagonIndex: 1
  },
  {
    step: 7,
    title: "Sequence 7 : Cycle de vie et illustration d'attaque",
    desc: "Trajectoire d'une transaction du quai d'embarquement jusqu'a son scellement definitif et rejet des tentatives de double depense.",
    getCamPos: () => new THREE.Vector3(3.5, 3.5, 8.5),
    getCamTarget: () => trainConvoy.getTrainCenter(),
    wagonIndex: 0
  }
];

let currentStep = 1;

// ============================================================================
// 7. Interface Utilisateur HUD 2D et Sidebar d'Inspection
// ============================================================================
const sequenceTitleEl = document.getElementById('sequence-title');
const sequenceDescEl = document.getElementById('sequence-desc');
const stepButtons = document.querySelectorAll('.step-btn');
const btnPrev = document.getElementById('btn-prev');
const btnNext = document.getElementById('btn-next');

const chainStatusPill = document.getElementById('chain-status-pill');
const chainStatusText = document.getElementById('chain-status-text');

// Elements de la Sidebar
const sidebarEl = document.getElementById('inspection-sidebar');
const btnCloseSidebar = document.getElementById('btn-close-sidebar');
const sidebarTitleEl = document.getElementById('sidebar-wagon-title');
const fieldIndex = document.getElementById('field-index');
const fieldData = document.getElementById('field-data');
const fieldPrevHash = document.getElementById('field-prev-hash');
const fieldHash = document.getElementById('field-hash');
const fieldNonce = document.getElementById('field-nonce');
const fieldStatus = document.getElementById('field-status');
const fieldStatusText = document.getElementById('field-status-text');
const btnRecalculate = document.getElementById('btn-recalculate');
const btnResetBlock = document.getElementById('btn-reset-block');

// Boutons d'actions rapides
const btnAddBlock = document.getElementById('btn-add-block');
const btnCorruptBlock = document.getElementById('btn-corrupt-block');
const btnRestoreChain = document.getElementById('btn-restore-chain');

function setSequence(stepNumber) {
  currentStep = Math.max(1, Math.min(stepNumber, 7));
  const seq = sequencesInfo[currentStep - 1];

  // Mise a jour textuelle du HUD
  sequenceTitleEl.textContent = seq.title;
  sequenceDescEl.textContent = seq.desc;

  // Mise a jour de la barre d'etapes
  stepButtons.forEach((btn) => {
    btn.classList.toggle('active', parseInt(btn.dataset.step) === currentStep);
  });

  btnPrev.disabled = currentStep === 1;
  btnNext.disabled = currentStep === 7;

  // Deplacement de la camera vers le point de vue scenarise
  const camPos = seq.getCamPos();
  const camTarget = seq.getCamTarget();
  cameraController.moveTo(camPos, camTarget, 1.2);

  // Ouvre le panneau sur le wagon associe si pertinent
  if (seq.wagonIndex !== null) {
    const targetBlock = trainConvoy.getBlock(seq.wagonIndex);
    if (targetBlock) {
      openInspectionSidebar(targetBlock);
    }
  }
}

stepButtons.forEach((btn) => {
  btn.addEventListener('click', () => {
    setSequence(parseInt(btn.dataset.step));
  });
});

btnPrev.addEventListener('click', () => {
  if (currentStep > 1) setSequence(currentStep - 1);
});

btnNext.addEventListener('click', () => {
  if (currentStep < 7) setSequence(currentStep + 1);
});

// Ouverture et remplissage de la Sidebar
function openInspectionSidebar(block) {
  inspectedBlockIndex = block.index;

  const wagonLabel = block.index === 0 ? 'Bloc Genesis' : `Bloc #${block.index}`;
  sidebarTitleEl.textContent = `Wagon #${block.index} (${wagonLabel})`;

  fieldIndex.value = block.index;
  fieldData.value = typeof block.data === 'string'
    ? block.data
    : JSON.stringify(block.data, null, 2);
  fieldPrevHash.value = block.previousHash || '0000000000000000';
  fieldHash.value = block.hash;
  fieldNonce.value = block.nonce;

  const validityList = trainConvoy.blockchain.getBlockValidityList();
  const isValid = validityList[block.index] ?? false;
  updateSidebarStatus(isValid);

  sidebarEl.classList.add('open');
  sidebarEl.setAttribute('aria-hidden', 'false');
}

function updateSidebarStatus(isValid) {
  if (isValid) {
    fieldStatus.className = 'status-indicator valid';
    fieldStatusText.textContent = 'Attelage magnetique actif (valide)';
  } else {
    fieldStatus.className = 'status-indicator invalid';
    fieldStatusText.textContent = 'Rupture d\'attelage (hash corrompu)';
  }
}

btnCloseSidebar.addEventListener('click', () => {
  sidebarEl.classList.remove('open');
  sidebarEl.setAttribute('aria-hidden', 'true');
});

// ============================================================================
// 8. Falsification en direct via le champ de donnees
// ============================================================================
fieldData.addEventListener('input', () => {
  const block = trainConvoy.getBlock(inspectedBlockIndex);
  if (!block) return;

  let parsedData = fieldData.value;
  try {
    parsedData = JSON.parse(fieldData.value);
  } catch {
    parsedData = fieldData.value;
  }

  // Falsifie deliberement les donnees sans recalculer le hash
  trainConvoy.corruptBlock(inspectedBlockIndex, parsedData);

  const validityList = trainConvoy.blockchain.getBlockValidityList();
  const isValid = validityList[inspectedBlockIndex] ?? false;
  updateSidebarStatus(isValid);
});

// Bouton Valider / recalculer (minage / re-scellement de la chaine)
btnRecalculate.addEventListener('click', () => {
  const result = trainConvoy.recalculateAndMineBlock(inspectedBlockIndex, 1);
  if (!result) return;

  const updatedBlock = result.block;
  fieldHash.value = updatedBlock.hash;
  fieldNonce.value = updatedBlock.nonce;
  updateSidebarStatus(true);
});

// Bouton Reinitialiser le wagon
btnResetBlock.addEventListener('click', () => {
  trainConvoy.resetBlock(inspectedBlockIndex);
  const block = trainConvoy.getBlock(inspectedBlockIndex);
  if (block) {
    openInspectionSidebar(block);
  }
});

// ============================================================================
// 9. Actions Rapides du HUD
// ============================================================================
if (btnAddBlock) {
  btnAddBlock.addEventListener('click', () => {
    const newBlock = trainConvoy.addBlock();
    cameraController.setInteractiveObjects(trainConvoy.getWagonMeshes());
    openInspectionSidebar(newBlock);

    const wagonPos = trainConvoy.getWagonPosition(newBlock.index);
    cameraController.moveTo(
      new THREE.Vector3(wagonPos.x + 2.2, 2.2, 4.4),
      new THREE.Vector3(wagonPos.x, 0.4, 0),
      1.0
    );
  });
}

if (btnCorruptBlock) {
  btnCorruptBlock.addEventListener('click', () => {
    const targetIndex = 1;
    trainConvoy.corruptBlock(targetIndex, {
      emetteur: 'Attaquant',
      destinataire: 'Compte-Pirate',
      montant: 9999,
      unite: 'MMI-Coin'
    });

    const block = trainConvoy.getBlock(targetIndex);
    if (block) {
      openInspectionSidebar(block);
      const wagonPos = trainConvoy.getWagonPosition(targetIndex);
      cameraController.moveTo(
        new THREE.Vector3(wagonPos.x + 2.2, 2.2, 4.4),
        new THREE.Vector3(wagonPos.x, 0.4, 0),
        1.0
      );
    }
  });
}

if (btnRestoreChain) {
  btnRestoreChain.addEventListener('click', () => {
    trainConvoy.restoreEntireTrain();
    const block = trainConvoy.getBlock(inspectedBlockIndex);
    if (block) {
      openInspectionSidebar(block);
    }
  });
}

// Mise a jour visuelle des indicateurs du HUD lors des mutations de chaine
function handleChainStateChange(summary) {
  if (chainStatusPill && chainStatusText) {
    if (summary.isValid) {
      chainStatusPill.className = 'stat-pill status-ok';
      chainStatusText.textContent = `Chaine valide (${summary.totalWagons} wagons)`;
    } else {
      chainStatusPill.className = 'stat-pill status-error';
      chainStatusText.textContent = `Alerte : Rupture au wagon #${summary.firstInvalidIndex}`;
    }
  }

  // Si le panneau est ouvert, rafraichit l'indicateur d'etat du bloc courant
  const validityList = summary.validityList;
  if (sidebarEl.classList.contains('open') && validityList) {
    const currentIsValid = validityList[inspectedBlockIndex] ?? false;
    updateSidebarStatus(currentIsValid);
  }
}

// ============================================================================
// 10. Indicateur de performances FPS
// ============================================================================
const fpsCounterEl = document.getElementById('fps-counter');
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
