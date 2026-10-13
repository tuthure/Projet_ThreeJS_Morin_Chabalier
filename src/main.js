import * as THREE from 'three';
import { CameraController } from './cameraController.js';

/**
 * Visualisation pedagogique de la blockchain - Convoi Ferroviaire
 * Pôle Alban Chabalier : UX/UI (HUD Overlay), Controleur camera, Notions 1 a 3
 */

// ============================================================================
// 1. Scene, Canvas et Moteur de Rendu
// ============================================================================
const canvas = document.querySelector('#webgl');
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0b0f19);
scene.fog = new THREE.FogExp2(0x0b0f19, 0.025);

const sizes = {
  width: window.innerWidth,
  height: window.innerHeight
};

const camera = new THREE.PerspectiveCamera(45, sizes.width / sizes.height, 0.1, 100);
camera.position.set(5.5, 3.5, 6.5);
scene.add(camera);

const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true,
  powerPreference: 'high-performance'
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// ============================================================================
// 2. Eclairage de la scene
// ============================================================================
const ambientLight = new THREE.AmbientLight(0xffffff, 0.75);
scene.add(ambientLight);

const keyLight = new THREE.DirectionalLight(0x38bdf8, 2.2);
keyLight.position.set(6, 10, 8);
scene.add(keyLight);

const fillLight = new THREE.DirectionalLight(0xf59e0b, 0.8);
fillLight.position.set(-8, -2, -6);
scene.add(fillLight);

// ============================================================================
// 3. Decor ferroviaire (Rails et traverses)
// ============================================================================
function createTracks() {
  const tracksGroup = new THREE.Group();

  // Rails metalliques le long de l'axe X
  const railGeometry = new THREE.BoxGeometry(32, 0.08, 0.08);
  const railMaterial = new THREE.MeshStandardMaterial({
    color: 0x94a3b8,
    metalness: 0.9,
    roughness: 0.2
  });

  const railLeft = new THREE.Mesh(railGeometry, railMaterial);
  railLeft.position.set(4, -0.62, 0.7);
  tracksGroup.add(railLeft);

  const railRight = new THREE.Mesh(railGeometry, railMaterial);
  railRight.position.set(4, -0.62, -0.7);
  tracksGroup.add(railRight);

  // Traverses de chemin de fer regulieres
  const sleeperGeometry = new THREE.BoxGeometry(0.35, 0.08, 1.9);
  const sleeperMaterial = new THREE.MeshStandardMaterial({
    color: 0x1e293b,
    metalness: 0.2,
    roughness: 0.8
  });

  for (let x = -10; x <= 18; x += 0.8) {
    const sleeper = new THREE.Mesh(sleeperGeometry, sleeperMaterial);
    sleeper.position.set(x, -0.68, 0);
    tracksGroup.add(sleeper);
  }

  // Grille de sol subtile
  const gridHelper = new THREE.GridHelper(36, 36, 0x1e293b, 0x0f172a);
  gridHelper.position.y = -0.72;
  tracksGroup.add(gridHelper);

  scene.add(tracksGroup);
}
createTracks();

// ============================================================================
// 4. Modele et construction des Wagons du Convoi
// ============================================================================
const initialBlocksData = [
  {
    index: 0,
    label: 'Bloc Genesis',
    data: 'Genese du convoi ferroviaire. Emission initiale de 50 jetons.',
    previousHash: '0000000000000000',
    hash: '0000a89f41b2c3d4',
    nonce: 1042,
    isValid: true
  },
  {
    index: 1,
    label: 'Wagon #1',
    data: 'Alice -> Bob : 2.5 BTC\nFrais de convoi : 0.001 BTC',
    previousHash: '0000a89f41b2c3d4',
    hash: '0000c14b88f921ea',
    nonce: 4912,
    isValid: true
  },
  {
    index: 2,
    label: 'Wagon #2',
    data: 'Bob -> Charlie : 1.0 BTC\nDavid -> Eva : 0.4 BTC',
    previousHash: '0000c14b88f921ea',
    hash: '0000f28e57ad1942',
    nonce: 7301,
    isValid: true
  },
  {
    index: 3,
    label: 'Wagon #3',
    data: 'Charlie -> David : 0.8 BTC\nEva -> Alice : 0.2 BTC',
    previousHash: '0000f28e57ad1942',
    hash: '000094bc72de0051',
    nonce: 3120,
    isValid: true
  }
];

const wagonSpacing = 4.2;
const wagonGroups = [];
const couplers = [];

function buildWagonMesh(blockData, posX) {
  const group = new THREE.Group();
  group.position.x = posX;
  group.userData.blockData = blockData;

  // 1. Corps principal du wagon (chassis blindé)
  const bodyGeometry = new THREE.BoxGeometry(2.4, 1.3, 1.3);
  const bodyMaterial = new THREE.MeshStandardMaterial({
    color: 0x1e293b,
    metalness: 0.7,
    roughness: 0.35
  });
  const bodyMesh = new THREE.Mesh(bodyGeometry, bodyMaterial);
  bodyMesh.position.y = 0;
  group.add(bodyMesh);

  // Aretes neon du wagon
  const edgesGeometry = new THREE.EdgesGeometry(bodyGeometry);
  const edgesMaterial = new THREE.LineBasicMaterial({ color: 0x38bdf8 });
  const edgesMesh = new THREE.LineSegments(edgesGeometry, edgesMaterial);
  group.add(edgesMesh);

  // 2. Conteneur central transparent (marchandises / transactions visibles)
  const cargoGeometry = new THREE.BoxGeometry(1.6, 0.7, 1.1);
  const cargoMaterial = new THREE.MeshStandardMaterial({
    color: 0x0284c7,
    metalness: 0.3,
    roughness: 0.2,
    transparent: true,
    opacity: 0.65
  });
  const cargoMesh = new THREE.Mesh(cargoGeometry, cargoMaterial);
  cargoMesh.position.y = 0.1;
  group.add(cargoMesh);

  // 3. Plaque avant gravée (previousHash)
  const frontPlateGeom = new THREE.BoxGeometry(0.1, 0.5, 0.8);
  const frontPlateMat = new THREE.MeshStandardMaterial({
    color: 0x334155,
    metalness: 0.8,
    roughness: 0.3
  });
  const frontPlate = new THREE.Mesh(frontPlateGeom, frontPlateMat);
  frontPlate.position.set(-1.22, 0, 0);
  group.add(frontPlate);

  // 4. Plaque arriere gravée (hash propre)
  const rearPlate = new THREE.Mesh(frontPlateGeom, frontPlateMat);
  rearPlate.position.set(1.22, 0, 0);
  group.add(rearPlate);

  // 5. Cadran a molette du Nonce sur le flanc
  const nonceGeom = new THREE.CylinderGeometry(0.2, 0.2, 0.1, 16);
  const nonceMat = new THREE.MeshStandardMaterial({
    color: 0xf59e0b,
    metalness: 0.9,
    roughness: 0.2
  });
  const nonceDial = new THREE.Mesh(nonceGeom, nonceMat);
  nonceDial.rotation.x = Math.PI / 2;
  nonceDial.position.set(0, -0.2, 0.68);
  group.add(nonceDial);

  // 6. Roues et essieux
  const wheelGeom = new THREE.CylinderGeometry(0.25, 0.25, 0.15, 16);
  const wheelMat = new THREE.MeshStandardMaterial({
    color: 0x475569,
    metalness: 0.8,
    roughness: 0.4
  });

  const wheelCoords = [
    [-0.75, -0.65, 0.7],
    [0.75, -0.65, 0.7],
    [-0.75, -0.65, -0.7],
    [0.75, -0.65, -0.7]
  ];

  wheelCoords.forEach(([wx, wy, wz]) => {
    const wheel = new THREE.Mesh(wheelGeom, wheelMat);
    wheel.rotation.x = Math.PI / 2;
    wheel.position.set(wx, wy, wz);
    group.add(wheel);
  });

  // Reference interne pour les mises a jour visuelles
  group.userData.elements = {
    bodyMesh,
    cargoMesh,
    edgesMesh
  };

  return group;
}

// Construction des 4 wagons initiaux
initialBlocksData.forEach((data, i) => {
  const posX = i * wagonSpacing;
  const wagon = buildWagonMesh(data, posX);
  scene.add(wagon);
  wagonGroups.push(wagon);
});

// Construction des attelages magnetiques entre wagons consecutifs
function buildCouplers() {
  for (let i = 0; i < wagonGroups.length - 1; i++) {
    const couplerGroup = new THREE.Group();
    const startX = i * wagonSpacing + 1.25;
    const endX = (i + 1) * wagonSpacing - 1.25;
    const length = endX - startX;
    const midX = (startX + endX) / 2;

    // Faisceau d'energie magnetique cylindrique
    const beamGeometry = new THREE.CylinderGeometry(0.12, 0.12, length, 16);
    const beamMaterial = new THREE.MeshStandardMaterial({
      color: 0x10b981,
      emissive: 0x059669,
      emissiveIntensity: 0.8,
      metalness: 0.5,
      roughness: 0.2,
      transparent: true,
      opacity: 0.9
    });
    const beamMesh = new THREE.Mesh(beamGeometry, beamMaterial);
    beamMesh.rotation.z = Math.PI / 2;
    couplerGroup.add(beamMesh);

    // Halo lumineux directionnel
    const light = new THREE.PointLight(0x10b981, 1.2, 3);
    couplerGroup.add(light);

    couplerGroup.position.set(midX, 0, 0);
    scene.add(couplerGroup);

    couplers.push({
      group: couplerGroup,
      mesh: beamMesh,
      light,
      sourceIndex: i,
      targetIndex: i + 1
    });
  }
}
buildCouplers();

// ============================================================================
// 5. Mise a jour visuelle de la chaine (Attelages et Falsification)
// ============================================================================
function updateChainVisualState() {
  let hasCorruption = false;

  wagonGroups.forEach((wagon, i) => {
    const data = wagon.userData.blockData;
    const elements = wagon.userData.elements;

    if (!data.isValid || hasCorruption) {
      hasCorruption = true;
      // Wagon corrompu / invalide
      elements.cargoMesh.material.color.setHex(0xef4444);
      elements.edgesMesh.material.color.setHex(0xef4444);
    } else {
      // Wagon conforme
      elements.cargoMesh.material.color.setHex(0x0284c7);
      elements.edgesMesh.material.color.setHex(0x38bdf8);
    }
  });

  // Mise a jour des faisceaux magnetiques
  let breakSubsequent = false;
  couplers.forEach((coupler) => {
    const sourceWagon = wagonGroups[coupler.sourceIndex];
    if (!sourceWagon.userData.blockData.isValid || breakSubsequent) {
      breakSubsequent = true;
      coupler.mesh.material.color.setHex(0xef4444);
      coupler.mesh.material.emissive.setHex(0xb91c1c);
      coupler.mesh.scale.set(0.6, 1, 0.6);
      coupler.light.color.setHex(0xef4444);
    } else {
      coupler.mesh.material.color.setHex(0x10b981);
      coupler.mesh.material.emissive.setHex(0x059669);
      coupler.mesh.scale.set(1, 1, 1);
      coupler.light.color.setHex(0x10b981);
    }
  });
}

// ============================================================================
// 6. Navigation cinematographique et Waypoints des 7 Notions
// ============================================================================
const sequencesInfo = [
  {
    step: 1,
    title: "Sequence 1 : Structure d'un bloc",
    desc: "Anatomie d'un wagon : compartiment de transactions, plaque de hash, connecteur previousHash et cadran du nonce.",
    camPos: new THREE.Vector3(0, 1.8, 3.8),
    camTarget: new THREE.Vector3(0, 0, 0),
    wagonIndex: 0
  },
  {
    step: 2,
    title: "Sequence 2 : Chainage cryptographique",
    desc: "L'attelage magnetique relie le wagon precedent au suivant. Le hash du bloc N-1 est scelle dans l'entete du bloc N.",
    camPos: new THREE.Vector3(2.1, 1.6, 3.4),
    camTarget: new THREE.Vector3(2.1, 0, 0),
    wagonIndex: 1
  },
  {
    step: 3,
    title: "Sequence 3 : Immutabilite et falsification",
    desc: "Modifiez les transactions dans le panneau : la rupture de l'attelage magnetique desolidarise instantanement les wagons suivants.",
    camPos: new THREE.Vector3(4.8, 2.6, 5.2),
    camTarget: new THREE.Vector3(4.2, 0, 0),
    wagonIndex: 1
  },
  {
    step: 4,
    title: "Sequence 4 : Reseau et decentralisation",
    desc: "Vue elargie du convoi : plusieurs voies paralleles hebergent la meme chaine sans autorite centrale.",
    camPos: new THREE.Vector3(6.3, 4.5, 9.5),
    camTarget: new THREE.Vector3(6.3, 0, 0),
    wagonIndex: 2
  },
  {
    step: 5,
    title: "Sequence 5 : Validation et minage (PoW)",
    desc: "Resolution mecanique du Nonce : la machinerie tourne pour trouver une empreinte valide sous la difficulte requise.",
    camPos: new THREE.Vector3(12.5, 2.4, 4.2),
    camTarget: new THREE.Vector3(12.6, 0, 0),
    wagonIndex: 3
  },
  {
    step: 6,
    title: "Sequence 6 : Comparaison de consensus (PoW vs PoS)",
    desc: "Confrontation entre effort thermique mecanique (PoW) et caution d'aiguillage sequestree (PoS).",
    camPos: new THREE.Vector3(6.3, 5.0, 11.0),
    camTarget: new THREE.Vector3(6.3, 0, 0),
    wagonIndex: 2
  },
  {
    step: 7,
    title: "Sequence 7 : Cycle de vie et double depense",
    desc: "Trajectoire d'une transaction du quai au wagon, et rejet univoque de toute tentative de double depense.",
    camPos: new THREE.Vector3(6.3, 6.5, 13.5),
    camTarget: new THREE.Vector3(6.3, 0, 0),
    wagonIndex: 0
  }
];

let currentStep = 1;
let selectedBlockData = null;

// Initialisation du controleur de camera
const cameraController = new CameraController(camera, renderer.domElement, (blockData) => {
  openInspectionSidebar(blockData);
});
cameraController.setInteractiveObjects(wagonGroups);

// ============================================================================
// 7. Gestion de l'interface HUD Overlay
// ============================================================================
const sequenceTitleEl = document.getElementById('sequence-title');
const sequenceDescEl = document.getElementById('sequence-desc');
const stepButtons = document.querySelectorAll('.step-btn');
const btnPrev = document.getElementById('btn-prev');
const btnNext = document.getElementById('btn-next');

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

function setSequence(stepNumber) {
  currentStep = Math.max(1, Math.min(stepNumber, 7));
  const seq = sequencesInfo[currentStep - 1];

  // Mise a jour textuelle
  sequenceTitleEl.textContent = seq.title;
  sequenceDescEl.textContent = seq.desc;

  // Mise a jour des boutons
  stepButtons.forEach((btn) => {
    btn.classList.toggle('active', parseInt(btn.dataset.step) === currentStep);
  });

  btnPrev.disabled = currentStep === 1;
  btnNext.disabled = currentStep === 7;

  // Deplacement fluide de la camera vers le waypoint de la sequence
  cameraController.moveTo(seq.camPos, seq.camTarget, 1.2);

  // Ouvre automatiquement le panneau d'inspection sur le wagon ciblé
  if (seq.wagonIndex !== null && wagonGroups[seq.wagonIndex]) {
    openInspectionSidebar(wagonGroups[seq.wagonIndex].userData.blockData);
  }
}

// Ecoute des clics sur la barre de navigation
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
function openInspectionSidebar(blockData) {
  selectedBlockData = blockData;
  sidebarTitleEl.textContent = `Wagon #${blockData.index} (${blockData.label})`;
  fieldIndex.value = blockData.index;
  fieldData.value = blockData.data;
  fieldPrevHash.value = blockData.previousHash;
  fieldHash.value = blockData.hash;
  fieldNonce.value = blockData.nonce;

  updateSidebarStatus(blockData.isValid);
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

// Simulation de falsification lors de l'edition du champ de donnees
fieldData.addEventListener('input', () => {
  if (!selectedBlockData) return;

  const originalText = initialBlocksData[selectedBlockData.index].data;
  const isChanged = fieldData.value !== originalText;

  if (isChanged) {
    // Calcul d'un hash corrompu non conforme
    selectedBlockData.isValid = false;
    selectedBlockData.data = fieldData.value;
    selectedBlockData.hash = 'e8b49a1f' + Math.floor(Math.random() * 89999999 + 10000000);
    fieldHash.value = selectedBlockData.hash;
    updateSidebarStatus(false);
  } else {
    selectedBlockData.isValid = true;
    selectedBlockData.data = originalText;
    selectedBlockData.hash = initialBlocksData[selectedBlockData.index].hash;
    fieldHash.value = selectedBlockData.hash;
    updateSidebarStatus(true);
  }

  updateChainVisualState();
});

// Bouton Valider / recalculer (minage / re-scellement)
btnRecalculate.addEventListener('click', () => {
  if (!selectedBlockData) return;

  // Re-calcule un hash et un nonce valides (debutant par 0000)
  selectedBlockData.nonce = Math.floor(Math.random() * 8000 + 1000);
  selectedBlockData.hash = '0000' + Math.random().toString(16).substring(2, 14);
  selectedBlockData.isValid = true;

  fieldNonce.value = selectedBlockData.nonce;
  fieldHash.value = selectedBlockData.hash;
  updateSidebarStatus(true);
  updateChainVisualState();
});

// Bouton Reinitialiser le wagon
btnResetBlock.addEventListener('click', () => {
  if (!selectedBlockData) return;

  const initial = initialBlocksData[selectedBlockData.index];
  selectedBlockData.data = initial.data;
  selectedBlockData.hash = initial.hash;
  selectedBlockData.nonce = initial.nonce;
  selectedBlockData.isValid = true;

  fieldData.value = initial.data;
  fieldHash.value = initial.hash;
  fieldNonce.value = initial.nonce;

  updateSidebarStatus(true);
  updateChainVisualState();
});

// ============================================================================
// 8. Indicateur de performances FPS
// ============================================================================
const fpsCounterEl = document.getElementById('fps-counter');
let frameCount = 0;
let lastFpsTime = performance.now();

function updateFps() {
  frameCount++;
  const now = performance.now();
  if (now - lastFpsTime >= 500) {
    const fps = Math.round((frameCount * 1000) / (now - lastFpsTime));
    fpsCounterEl.textContent = `${fps} FPS`;
    frameCount = 0;
    lastFpsTime = now;
  }
}

// ============================================================================
// 9. Gestion du redimensionnement de la fenetre
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
// 10. Boucle d'animation principale (requestAnimationFrame)
// ============================================================================
const clock = new THREE.Clock();

function animate() {
  const delta = clock.getDelta();
  const elapsedTime = clock.getElapsedTime();

  // Mise a jour du controleur camera cinematographique
  cameraController.update(delta);

  // Animation elastique legere et oscillation des wagons pour donner vie au train
  wagonGroups.forEach((wagon, i) => {
    const offset = i * 0.4;
    wagon.position.y = Math.sin(elapsedTime * 1.5 + offset) * 0.035;
  });

  // Rendu de la scene Three.js
  renderer.render(scene, camera);

  // Calcul des FPS
  updateFps();

  requestAnimationFrame(animate);
}

// Initialisation au chargement sur la premiere sequence
setSequence(1);
animate();
