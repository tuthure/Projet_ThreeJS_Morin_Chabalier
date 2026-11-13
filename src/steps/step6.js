import * as THREE from 'three';

/**
 * Étape 6 : Comparaison des consensus (PoW vs PoS).
 * Mise en scène comparative sur les 3 gares du réseau (Gare A, Gare B, Gare C)
 * cherchant à valider et atteler le prochain wagon (Wagon #2) :
 * - Mode Preuve de Travail (PoW — La course des 3 molettes) :
 *   Les % représentent la part des 100 % de puissance informatique du réseau :
 *   Gare A (50 % -> 10 crans/s), Gare B (35 % -> 7 crans/s), Gare C (15 % -> 3 crans/s).
 *   Les 3 molettes tournent simultanément : la première gare qui tombe sur le Nonce gagnant
 *   du Wagon #2 ("0...") l'attelle avec ce Nonce exact, et les 2 autres ont tourné pour rien.
 * - Mode Preuve d'Enjeu (PoS — Tirage au sort sur caution puis validation par 1 seule molette) :
 *   Les % représentent la part des 100 jetons déposés en caution au total (50, 35 et 15 jetons).
 *   1) Phase de tirage ('lottery') : un halo lumineux 3D et le curseur de la barre balaient
 *      les 3 gares puis s'arrêtent sur une seule gare élue.
 *   2) Phase de validation ('pos_mining') : seule la gare élue voit sa molette du Nonce
 *      apparaître et tourner jusqu'au Nonce gagnant du Wagon #2, pendant que les 2 autres
 *      restent sans molette au repos (0 cran tourné, 0 énergie gaspillée).
 */
export const step6 = {
  id: 6,
  title: 'Consensus : PoW vs PoS',
  ctx: null,

  rafId: null,
  mode: 'pow', // 'pow' | 'pos'

  // État d'animation ('idle' | 'running' | 'lottery' | 'pos_mining' | 'done')
  simState: 'idle',
  simTimer: 0,
  simDuration: 1.6,
  winnerIndex: 0,
  rouletteHighlightIndex: 0,
  lotteryCursorPercent: 25,
  lotteryTargetPercent: 25,
  lotteryStartPercent: 12,
  hasTestedPoW: false,
  hasTestedPoS: false,

  // Synchronisation réelle du Nonce et du Hash avec le Wagon #2
  roundCounter: 0,
  winningNonce: 18,
  winningHash: '00e4a1...',

  // Positions sur l'axe X du Wagon #2 (convoi completement attele en arriere-plan)
  spawnWagon2X: 8.9,
  unminedWagon2X: 7.6,
  minedWagon2X: 7.6,
  currentWagon2X: 7.6,
  currentWagon2Scale: 1.0,
  wasCoupled: false,
  couplerFlashRing: null,
  couplerFlashAlpha: 0,

  consensusGroup: null,
  lotteryHaloGroup: null,
  lotteryHaloX: 2.5,
  lotteryHaloZ: 2.45,
  validators: [],
  tooltipLayer: null,

  validatorData: [
    {
      id: 'gare-a',
      name: 'Gare A',
      share: 50,
      probLabel: '50 %',
      powShareLabel: '50 % de puissance (10 crans/s)',
      posShareLabel: '50 jetons sur 100 (50 %)',
      speedLabel: '10 crans/s (rapide)',
      tokens: 50,
      coinsMeshCount: 10,
      baseCrans: 24,
      x: 2.5,
      z: 2.45
    },
    {
      id: 'gare-b',
      name: 'Gare B',
      share: 35,
      probLabel: '35 %',
      powShareLabel: '35 % de puissance (7 crans/s)',
      posShareLabel: '35 jetons sur 100 (35 %)',
      speedLabel: '7 crans/s (moyenne)',
      tokens: 35,
      coinsMeshCount: 7,
      baseCrans: 16,
      x: 5.6,
      z: 2.45
    },
    {
      id: 'gare-c',
      name: 'Gare C',
      share: 15,
      probLabel: '15 %',
      powShareLabel: '15 % de puissance (3 crans/s)',
      posShareLabel: '15 jetons sur 100 (15 %)',
      speedLabel: '3 crans/s (lente)',
      tokens: 15,
      coinsMeshCount: 3,
      baseCrans: 8,
      x: 8.7,
      z: 2.45
    }
  ],

  init(context) {
    this.ctx = context;
  },

  enter() {
    const { trainConvoy, cameraController, environment } = this.ctx;

    this.mode = 'pow';
    this.simState = 'idle';
    this.simTimer = 0;
    this.winnerIndex = 0;
    this.rouletteHighlightIndex = 0;
    this.lotteryCursorPercent = 25;
    this.lotteryTargetPercent = 25;
    this.hasTestedPoW = false;
    this.hasTestedPoS = false;
    this.roundCounter = 0;
    this.currentWagon2X = this.unminedWagon2X;
    this.currentWagon2Scale = 1.0;
    this.wasCoupled = false;
    this.couplerFlashAlpha = 0;

    if (cameraController) {
      cameraController.setViewOffset(210);
    }

    // Le train reste à l'arrêt
    if (environment) {
      environment.setSpeed(0);
    }

    if (trainConvoy) {
      trainConvoy.resetConvoy([
        { emetteur: 'Arthur', destinataire: 'Alban', montant: 15, unite: 'MMI-Coin' },
        { emetteur: 'Alban', destinataire: 'Equipe-R507', montant: 30, unite: 'MMI-Coin' }
      ]);
      if (cameraController) {
        cameraController.setInteractiveObjects(trainConvoy.getInteractiveObjects());
      }
    }

    this.buildConsensusScene();
    this.prepareCandidateWagon(false, 18);
    this.setupTooltipsLayer();
    this.createStationTooltips();
    this.applyModeVisuals();

    // Cadrage avec les 3 Gares (A, B, C) bien visibles au premier plan devant le convoi
    if (cameraController) {
      cameraController.moveTo(
        new THREE.Vector3(5.6, 2.55, 8.35),
        new THREE.Vector3(5.6, 0.35, 0.95),
        1.15
      );
    }

    this.startAnimationLoop();
    this.renderLeftPanel();
  },

  exit() {
    this.stopAnimationLoop();

    const wagon2 = this.ctx?.trainConvoy?.getWagon(2);
    if (wagon2) {
      wagon2.position.x = this.minedWagon2X;
      wagon2.scale.setScalar(1);
      if (wagon2.nonceWheel) {
        wagon2.nonceWheel.rotation.set(Math.PI / 2, 0, 0);
      }
      if (wagon2.couplerGroup && wagon2.defaultCouplerPosition) {
        wagon2.couplerGroup.position.copy(wagon2.defaultCouplerPosition);
        wagon2.couplerGroup.rotation.z = 0;
      }
    }

    if (this.tooltipLayer) {
      this.tooltipLayer.remove();
      this.tooltipLayer = null;
    }

    if (this.consensusGroup && this.ctx?.scene) {
      this.ctx.scene.remove(this.consensusGroup);
      this.consensusGroup = null;
    }

    this.validators = [];
    this.couplerFlashRing = null;
    this.lotteryHaloGroup = null;

    const panel = document.getElementById('step-panel-left');
    if (panel) {
      const inner = panel.querySelector('.step-panel-inner');
      if (inner) inner.remove();
    }
  },

  /**
   * Prépare le Wagon #2 candidat à distance (x = 8.45) avec Nonce = 0 et calcule
   * une graine SHA-256 telle que le vrai Nonce gagnant du Wagon #2 soit exactement targetWinningNonce.
   * Si le wagon précédent était déjà attelé, le fait disparaître et fait arriver un nouveau wagon de la droite.
   */
  prepareCandidateWagon(animateSpawn = false, targetWinningNonce = 18) {
    const { trainConvoy } = this.ctx;
    if (!trainConvoy || !trainConvoy.blockchain) return;

    const chain = trainConvoy.blockchain.chain;
    const block0 = chain[0];
    const block1 = chain[1];
    const block2 = chain[2];
    const wagon2 = trainConvoy.getWagon(2);
    if (!block0 || !block1 || !block2 || !wagon2) return;

    this.roundCounter += 1;

    block0.mineBlock(1);
    block1.previousHash = block0.hash;
    block1.mineBlock(1);
    block2.previousHash = block1.hash;

    // Cherche une graine où Nonce = 0 ne commence pas par '0' et Nonce = targetWinningNonce commence par '0'
    let saltTry = 0;
    let foundHash = '';
    do {
      saltTry += 1;
      block2._miningSalt = `s6-${this.roundCounter}-${saltTry}-${Math.random().toString(36).substring(2, 7)}`;
      block2.nonce = 0;
      const h0 = block2.calculateHash();
      if (h0.startsWith('0')) continue;

      block2.nonce = targetWinningNonce;
      const hWin = block2.calculateHash();
      if (hWin.startsWith('0')) {
        foundHash = hWin;
        break;
      }
    } while (saltTry < 250);

    if (!foundHash) {
      foundHash = `00e4a1b8c9d0e1f2a3b4c5d6e7f8091a2b3c4d5e6f708192a3b4c5d6e7f8091a`;
    }

    this.winningNonce = targetWinningNonce;
    this.winningHash = foundHash;

    // Place le Wagon #2 à son état initial non miné (Nonce = 0)
    block2.nonce = 0;
    block2.hash = block2.calculateHash();
    trainConvoy.sync();

    if (wagon2.nonceWheel) {
      wagon2.nonceWheel.rotation.set(Math.PI / 2, 0, 0);
    }

    if (animateSpawn) {
      this.currentWagon2X = this.spawnWagon2X;
      this.currentWagon2Scale = 0.01;
    } else {
      this.currentWagon2X = this.unminedWagon2X;
      this.currentWagon2Scale = 1.0;
    }
    wagon2.position.x = this.currentWagon2X;
    wagon2.scale.setScalar(this.currentWagon2Scale);
  },

  /**
   * Synchronise le Nonce et le Hash affichés sur le Wagon #2 avec le Nonce trouvé par la gare gagnante.
   */
  syncWagon2WithNonce(nonceValue, isFinalWinner = false) {
    const { trainConvoy } = this.ctx;
    const block2 = trainConvoy?.blockchain?.chain?.[2];
    const wagon2 = trainConvoy?.getWagon(2);
    if (!block2 || !wagon2) return;

    block2.nonce = nonceValue;
    if (isFinalWinner) {
      block2.hash = this.winningHash;
      wagon2.updateStatus(true);
    } else {
      let h = block2.calculateHash();
      if (h.startsWith('0')) {
        h = `f${h.substring(1)}`;
      }
      block2.hash = h;
      wagon2.renderPlates();
    }

    if (wagon2.nonceWheel) {
      wagon2.nonceWheel.rotation.set(Math.PI / 2, nonceValue * (Math.PI / 4), 0);
    }
  },

  /**
   * Dessine le cadran central de la molette 3D d'une gare.
   */
  renderStationWheelDial(canvas, texture, cranCount, borderColor = '#f59e0b') {
    if (!canvas || !texture) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(128, 128, 120, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = borderColor;
    ctx.lineWidth = 10;
    ctx.beginPath();
    ctx.arc(128, 128, 114, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = borderColor;
    ctx.font = 'bold 26px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('NONCE', 128, 74);

    ctx.fillStyle = '#fef08a';
    ctx.font = 'bold 68px monospace';
    ctx.fillText(String(cranCount), 128, 144);

    texture.needsUpdate = true;
  },

  /**
   * Cree une texture Canvas pour l'horloge du beffroi de gare.
   */
  createClockTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#fef9c3';
    ctx.beginPath();
    ctx.arc(64, 64, 58, 0, Math.PI * 2);
    ctx.fill();

    ctx.lineWidth = 8;
    ctx.strokeStyle = '#b45309';
    ctx.stroke();

    ctx.strokeStyle = '#1e293b';
    for (let i = 0; i < 12; i++) {
      const angle = (i * Math.PI) / 6;
      const r1 = i % 3 === 0 ? 40 : 45;
      const r2 = 52;
      ctx.lineWidth = i % 3 === 0 ? 4 : 2;
      ctx.beginPath();
      ctx.moveTo(64 + Math.cos(angle) * r1, 64 + Math.sin(angle) * r1);
      ctx.lineTo(64 + Math.cos(angle) * r2, 64 + Math.sin(angle) * r2);
      ctx.stroke();
    }

    ctx.strokeStyle = '#0f172a';
    ctx.lineCap = 'round';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(64, 64);
    ctx.lineTo(42, 46);
    ctx.stroke();

    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.moveTo(64, 64);
    ctx.lineTo(88, 42);
    ctx.stroke();

    ctx.fillStyle = '#dc2626';
    ctx.beginPath();
    ctx.arc(64, 64, 4, 0, Math.PI * 2);
    ctx.fill();

    const tex = new THREE.CanvasTexture(canvas);
    tex.needsUpdate = true;
    return tex;
  },

  /**
   * Cree le panneau frontal de nom de gare ("GARE A", "GARE B", "GARE C").
   * @param {string} title
   */
  createStationSignTexture(title) {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, 256, 64);

    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 4;
    ctx.strokeRect(4, 4, 248, 56);

    ctx.fillStyle = '#f8fafc';
    ctx.font = 'bold 28px "Segoe UI", Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(title.toUpperCase(), 128, 33);

    const tex = new THREE.CanvasTexture(canvas);
    tex.needsUpdate = true;
    return tex;
  },

  /**
   * Construit le batiment de gare ferroviaire en 3D (inspire de l'etape 4)
   * a placer derriere le parvis technique de chaque gare au premier plan.
   */
  createStationBuildingMesh(v, shared) {
    const buildingGroup = new THREE.Group();
    buildingGroup.position.set(0, 0.08, -0.34);

    const plinth = new THREE.Mesh(shared.plinthGeo, shared.stoneTrimMat);
    plinth.position.set(-0.14, 0.07, 0);
    buildingGroup.add(plinth);

    const mainHall = new THREE.Mesh(shared.mainHallGeo, shared.brickMat);
    mainHall.position.set(-0.14, 0.5, 0);
    buildingGroup.add(mainHall);

    const cornice = new THREE.Mesh(shared.corniceGeo, shared.stoneTrimMat);
    cornice.position.set(-0.14, 0.9, 0);
    buildingGroup.add(cornice);

    const mainRoof = new THREE.Mesh(shared.roofPrismGeo, shared.slateRoofMat);
    mainRoof.position.set(-0.14, 1.16, 0);
    mainRoof.rotation.y = Math.PI / 4;
    mainRoof.scale.set(1.22, 1.0, 0.62);
    buildingGroup.add(mainRoof);

    // Fenetres eclairees sur la facade avant (+Z) face a la camera
    const windowMat = new THREE.MeshStandardMaterial({
      color: 0xfef08a,
      emissive: 0xf59e0b,
      emissiveIntensity: 1.0,
      roughness: 0.2
    });
    [-0.56, -0.14, 0.28].forEach((wx) => {
      const win = new THREE.Mesh(shared.winGeo, windowMat);
      win.position.set(wx, 0.45, 0.345);
      buildingGroup.add(win);
    });

    // Marquise metallique et plaque nominative visible
    const canopy = new THREE.Mesh(shared.canopyGeo, shared.darkMetalMat);
    canopy.position.set(-0.08, 0.56, 0.34);
    buildingGroup.add(canopy);

    [-0.78, -0.08, 0.62].forEach((px) => {
      const pillar = new THREE.Mesh(shared.pillarGeo, shared.darkMetalMat);
      pillar.position.set(px, 0.28, 0.46);
      buildingGroup.add(pillar);
    });

    const signTex = this.createStationSignTexture(v.name);
    const signMesh = new THREE.Mesh(
      shared.signBoardGeo,
      new THREE.MeshBasicMaterial({ map: signTex })
    );
    signMesh.position.set(-0.08, 0.68, 0.56);
    buildingGroup.add(signMesh);

    // Tour de l'horloge (beffroi) a droite du batiment
    const tower = new THREE.Mesh(shared.towerBodyGeo, shared.brickMat);
    tower.position.set(0.76, 0.68, 0);
    buildingGroup.add(tower);

    const towerRoof = new THREE.Mesh(shared.towerRoofGeo, shared.slateRoofMat);
    towerRoof.position.set(0.76, 1.56, 0);
    towerRoof.rotation.y = Math.PI / 4;
    buildingGroup.add(towerRoof);

    const clockFront = new THREE.Mesh(shared.clockFaceGeo, shared.clockMat);
    clockFront.position.set(0.76, 1.06, 0.245);
    buildingGroup.add(clockFront);

    // Mat de signalisation avec balise lumineuse d'etat
    const signalMast = new THREE.Mesh(shared.signalMastGeo, shared.darkMetalMat);
    signalMast.position.set(-1.02, 0.52, 0.14);
    buildingGroup.add(signalMast);

    const beaconMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x0284c7,
      emissiveIntensity: 1.6,
      roughness: 0.2
    });
    const beacon = new THREE.Mesh(shared.beaconGeo, beaconMat);
    beacon.position.set(-1.02, 1.06, 0.14);
    buildingGroup.add(beacon);

    return { buildingGroup, beaconMat, windowMat };
  },

  /**
   * Construit les 3 gares au premier plan (Gare A, Gare B, Gare C), leurs batiments 3D,
   * leurs molettes Nonce, leurs piles de jetons en caution et le projecteur PoS.
   */
  buildConsensusScene() {
    const { scene } = this.ctx;
    if (!scene) return;

    if (this.consensusGroup) {
      scene.remove(this.consensusGroup);
    }

    this.consensusGroup = new THREE.Group();
    this.validators = [];

    const platformGeo = new THREE.BoxGeometry(2.45, 0.16, 2.05);
    const platformMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.65,
      metalness: 0.3
    });

    const ringGeo = new THREE.RingGeometry(1.18, 1.32, 32);

    const wheelStandGeo = new THREE.BoxGeometry(0.32, 0.56, 0.14);
    const wheelStandMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      metalness: 0.85,
      roughness: 0.3
    });

    const wheelGeo = new THREE.CylinderGeometry(0.34, 0.34, 0.11, 24);
    const toothGeo = new THREE.BoxGeometry(0.075, 0.11, 0.095);
    const dialGeo = new THREE.CircleGeometry(0.31, 32);

    const coinGeo = new THREE.CylinderGeometry(0.34, 0.34, 0.09, 20);
    const couplerTarget = new THREE.Vector3(7.6, 0.15, 0);

    const clockTexture = this.createClockTexture();
    const sharedStationAssets = {
      plinthGeo: new THREE.BoxGeometry(1.62, 0.14, 0.72),
      mainHallGeo: new THREE.BoxGeometry(1.52, 0.76, 0.64),
      corniceGeo: new THREE.BoxGeometry(1.64, 0.06, 0.74),
      roofPrismGeo: new THREE.ConeGeometry(1.12, 0.46, 4),
      winGeo: new THREE.BoxGeometry(0.24, 0.34, 0.03),
      canopyGeo: new THREE.BoxGeometry(1.86, 0.055, 0.42),
      pillarGeo: new THREE.CylinderGeometry(0.028, 0.028, 0.54, 8),
      signBoardGeo: new THREE.PlaneGeometry(0.95, 0.24),
      towerBodyGeo: new THREE.BoxGeometry(0.46, 1.34, 0.46),
      towerRoofGeo: new THREE.ConeGeometry(0.38, 0.48, 4),
      clockFaceGeo: new THREE.CircleGeometry(0.15, 20),
      signalMastGeo: new THREE.CylinderGeometry(0.028, 0.032, 1.04, 8),
      beaconGeo: new THREE.SphereGeometry(0.1, 12, 12),
      brickMat: new THREE.MeshStandardMaterial({ color: 0x9a3412, roughness: 0.72 }),
      stoneTrimMat: new THREE.MeshStandardMaterial({ color: 0xcbd5e1, roughness: 0.6 }),
      slateRoofMat: new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.55, flatShading: true }),
      darkMetalMat: new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.75, roughness: 0.3 }),
      clockMat: new THREE.MeshBasicMaterial({ map: clockTexture })
    };

    this.validatorData.forEach((v) => {
      const vGroup = new THREE.Group();
      vGroup.position.set(v.x, -0.44, v.z);

      // Socle / parvis de gare au premier plan
      const platform = new THREE.Mesh(platformGeo, platformMat);
      vGroup.add(platform);

      // Anneau lumineux peripherique au sol
      const ringMat = new THREE.MeshBasicMaterial({
        color: 0x38bdf8,
        side: THREE.DoubleSide
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.rotation.x = -Math.PI / 2;
      ring.position.set(0, 0.09, 0.48);
      vGroup.add(ring);

      // Batiment de gare 3D a l'arriere du socle
      const { buildingGroup, beaconMat, windowMat } = this.createStationBuildingMesh(v, sharedStationAssets);
      vGroup.add(buildingGroup);

      // --- 1. Molette crantee du Nonce sur le parvis avant (+Z), directement face a la camera ---
      const powNodeGroup = new THREE.Group();
      powNodeGroup.position.set(0, 0, 0.56);

      const stand = new THREE.Mesh(wheelStandGeo, wheelStandMat);
      stand.position.set(0, 0.34, -0.05);
      powNodeGroup.add(stand);

      const wheelMat = new THREE.MeshStandardMaterial({
        color: 0x78350f,
        metalness: 0.8,
        roughness: 0.35,
        emissive: 0x451a03,
        emissiveIntensity: 0.25
      });
      const wheelMesh = new THREE.Mesh(wheelGeo, wheelMat);
      wheelMesh.rotation.x = Math.PI / 2;
      wheelMesh.position.set(0, 0.54, 0.06);
      powNodeGroup.add(wheelMesh);

      const toothMat = new THREE.MeshStandardMaterial({
        color: 0xf59e0b,
        metalness: 0.85,
        roughness: 0.25,
        emissive: 0xb45309,
        emissiveIntensity: 0.35
      });
      for (let i = 0; i < 8; i++) {
        const angle = (i * Math.PI) / 4;
        const tooth = new THREE.Mesh(toothGeo, toothMat);
        tooth.position.set(Math.cos(angle) * 0.36, 0, Math.sin(angle) * 0.36);
        tooth.rotation.y = -angle + Math.PI / 2;
        wheelMesh.add(tooth);
      }

      const dialCanvas = document.createElement('canvas');
      dialCanvas.width = 256;
      dialCanvas.height = 256;
      const dialTex = new THREE.CanvasTexture(dialCanvas);
      this.renderStationWheelDial(dialCanvas, dialTex, 0, '#f59e0b');

      const dialMesh = new THREE.Mesh(
        dialGeo,
        new THREE.MeshBasicMaterial({ map: dialTex, transparent: true })
      );
      dialMesh.position.set(0, 0.54, 0.125);
      powNodeGroup.add(dialMesh);

      vGroup.add(powNodeGroup);

      // --- 2. Pile de jetons deposes en caution sur le parvis avant (+Z) ---
      const posNodeGroup = new THREE.Group();
      posNodeGroup.position.set(0, 0, 0.56);
      const coinMat = new THREE.MeshStandardMaterial({
        color: 0xfacc15,
        emissive: 0xb45309,
        emissiveIntensity: 0.45,
        metalness: 0.85,
        roughness: 0.2
      });

      for (let c = 0; c < v.coinsMeshCount; c++) {
        const coin = new THREE.Mesh(coinGeo, coinMat);
        coin.position.set(0, 0.12 + c * 0.095, 0);
        posNodeGroup.add(coin);
      }
      vGroup.add(posNodeGroup);

      // Faisceau reliant la gare au premier plan vers le Wagon #2 sur les rails
      const linePoints = [
        new THREE.Vector3(v.x, -0.15, v.z - 0.72),
        couplerTarget.clone()
      ];
      const lineGeo = new THREE.BufferGeometry().setFromPoints(linePoints);
      const lineMat = new THREE.LineBasicMaterial({
        color: 0x38bdf8,
        transparent: true,
        opacity: 0.35
      });
      const linkLine = new THREE.Line(lineGeo, lineMat);
      this.consensusGroup.add(linkLine);

      this.consensusGroup.add(vGroup);
      this.validators.push({
        data: v,
        group: vGroup,
        powNodeGroup,
        posNodeGroup,
        wheelMesh,
        toothMat,
        dialCanvas,
        dialTex,
        ringMat,
        beaconMat,
        windowMat,
        coinMat,
        lineMat,
        currentCrans: 0,
        targetCrans: v.baseCrans,
        currentAngle: 0,
        wheelScale: 1,
        currentHash: 'a4f9c2...'
      });
    });

    // Halo / projecteur 3D mobile de tirage au sort PoS
    this.lotteryHaloGroup = new THREE.Group();
    const haloRingGeo = new THREE.RingGeometry(1.26, 1.44, 36);
    const haloRingMat = new THREE.MeshBasicMaterial({
      color: 0xfacc15,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.95
    });
    const haloRing = new THREE.Mesh(haloRingGeo, haloRingMat);
    haloRing.rotation.x = -Math.PI / 2;
    this.lotteryHaloGroup.add(haloRing);

    const haloBeamGeo = new THREE.CylinderGeometry(1.22, 1.22, 1.85, 28, 1, true);
    const haloBeamMat = new THREE.MeshBasicMaterial({
      color: 0xfacc15,
      transparent: true,
      opacity: 0.16,
      side: THREE.DoubleSide,
      depthWrite: false
    });
    const haloBeam = new THREE.Mesh(haloBeamGeo, haloBeamMat);
    haloBeam.position.y = 0.92;
    this.lotteryHaloGroup.add(haloBeam);

    this.lotteryHaloGroup.position.set(this.validatorData[0].x, -0.34, this.validatorData[0].z + 0.18);
    this.lotteryHaloGroup.visible = false;
    this.lotteryHaloGroup.userData = { haloRingMat, haloBeamMat };
    this.consensusGroup.add(this.lotteryHaloGroup);

    // Anneau flash vert au point d'attelage entre Wagon #1 et Wagon #2
    const flashGeo = new THREE.TorusGeometry(0.24, 0.035, 12, 32);
    flashGeo.rotateY(Math.PI / 2);
    const flashMat = new THREE.MeshBasicMaterial({
      color: 0x10b981,
      transparent: true,
      opacity: 0
    });
    this.couplerFlashRing = new THREE.Mesh(flashGeo, flashMat);
    this.couplerFlashRing.position.set(5.28, 0.05, 0);
    this.consensusGroup.add(this.couplerFlashRing);

    scene.add(this.consensusGroup);
  },

  /**
   * Initialise le conteneur DOM pour les infobulles 3D projetées.
   */
  setupTooltipsLayer() {
    const hud = document.getElementById('hud');
    if (!hud) return;

    if (!this.tooltipLayer) {
      this.tooltipLayer = document.createElement('div');
      this.tooltipLayer.id = 'step6-tooltips-layer';
      this.tooltipLayer.className = 'scene-tooltips-layer';
      hud.appendChild(this.tooltipLayer);
    }
    this.tooltipLayer.innerHTML = '';
  },

  /**
   * Crée les 3 infobulles SVG au-dessus des 3 gares (Gare A, Gare B, Gare C).
   */
  createStationTooltips() {
    if (!this.tooltipLayer) return;

    const svgLinesHTML = this.validatorData
      .map(
        (_, idx) => `
        <line id="s6-line-${idx}" stroke="#38bdf8" stroke-width="2" stroke-linecap="round" opacity="0.85" />
        <circle id="s6-dot-out-${idx}" r="6.5" fill="none" stroke="#38bdf8" stroke-width="1.5" opacity="0.8" />
        <circle id="s6-dot-in-${idx}" r="3" fill="#38bdf8" />
      `
      )
      .join('');

    const pillsHTML = this.validatorData
      .map(
        (v, idx) => `
        <div id="tooltip-s6-${idx}" class="scene-tooltip" style="--spot-color: #38bdf8; z-index: 12;">
          <button type="button" class="scene-tooltip-pill">
            <span class="scene-tooltip-dot"></span>
            <span class="scene-tooltip-label">
              <strong>${v.name}</strong> · <span id="s6-pill-status-${idx}" style="color: #cbd5e1;">${v.probLabel}</span>
            </span>
          </button>
        </div>
      `
      )
      .join('');

    this.tooltipLayer.innerHTML = `
      <svg id="step6-tooltips-svg" style="position: absolute; inset: 0; width: 100%; height: 100%; pointer-events: none; overflow: visible; z-index: 10;">
        ${svgLinesHTML}
      </svg>
      ${pillsHTML}
    `;

    this.validatorData.forEach((_, idx) => {
      const el = document.getElementById(`tooltip-s6-${idx}`);
      el?.addEventListener('pointerdown', (e) => e.stopPropagation());
    });

    this.updateTooltipsDOM();
  },

  /**
   * Bascule entre PoW et PoS en conservant les 3 mêmes gares (Gare A, Gare B, Gare C).
   * @param {'pow'|'pos'} targetMode
   */
  setMode(targetMode) {
    if (this.mode === targetMode) return;
    const shouldRespawn = this.simState === 'done' || this.wasCoupled;
    this.mode = targetMode;
    this.simState = 'idle';
    this.simTimer = 0;
    this.wasCoupled = false;
    this.couplerFlashAlpha = 0;
    this.lotteryCursorPercent = 25;

    this.validators.forEach((v) => {
      v.currentCrans = 0;
      v.currentAngle = 0;
      v.wheelScale = targetMode === 'pow' ? 1 : 0.01;
      if (v.wheelMesh) v.wheelMesh.rotation.set(Math.PI / 2, 0, 0);
      this.renderStationWheelDial(v.dialCanvas, v.dialTex, 0, '#f59e0b');
    });

    this.prepareCandidateWagon(shouldRespawn, 18);
    this.applyModeVisuals();
    this.updateTooltipsDOM();
    this.renderLeftPanel();
  },

  /**
   * Tire un index gagnant (0, 1 ou 2) selon les parts 50 % / 35 % / 15 %
   * et calcule la position exacte correspondante sur la barre de loterie (0..100%).
   */
  pickWeightedWinner() {
    const r = Math.random() * 100;
    if (r < 50) {
      this.lotteryTargetPercent = 8 + Math.random() * 36; // Intérieur franc du segment A (0..50%)
      return 0;
    }
    if (r < 85) {
      this.lotteryTargetPercent = 54 + Math.random() * 27; // Intérieur franc du segment B (50..85%)
      return 1;
    }
    this.lotteryTargetPercent = 88 + Math.random() * 9;   // Intérieur franc du segment C (85..100%)
    return 2;
  },

  /**
   * Génère un court hash hexadécimal ne commençant pas par 0.
   */
  randomRejectedHash() {
    const first = '123456789abcdef';
    const hex = '0123456789abcdef';
    let out = first[Math.floor(Math.random() * first.length)];
    for (let i = 0; i < 5; i++) {
      out += hex[Math.floor(Math.random() * hex.length)];
    }
    return `${out}...`;
  },

  /**
   * Lance soit la course des 3 molettes (PoW), soit le tirage au sort suivi de la molette unique (PoS).
   */
  startConsensusRound() {
    if (this.simState === 'running' || this.simState === 'lottery' || this.simState === 'pos_mining') {
      return;
    }

    const wasAlreadyAttached = this.simState === 'done' || this.wasCoupled;
    this.wasCoupled = false;
    this.couplerFlashAlpha = 0;

    this.winnerIndex = this.pickWeightedWinner();

    // Calcule le nombre de crans de chaque gare (en PoW, proportionnel à leur vitesse 10 / 7 / 3 crans/s)
    const jitter = 0.9 + Math.random() * 0.25;
    this.validators.forEach((v, idx) => {
      v.currentCrans = 0;
      v.currentAngle = 0;
      if (this.mode === 'pow') {
        v.targetCrans = Math.max(6, Math.round(v.data.baseCrans * jitter));
        v.wheelScale = 1;
      } else {
        // En PoS, seule la gare tirée au sort tournera sa molette (entre 9 et 15 crans)
        v.targetCrans = idx === this.winnerIndex ? 9 + Math.floor(Math.random() * 7) : 0;
        v.wheelScale = 0.01;
      }
      v.currentHash = this.randomRejectedHash();
      if (v.wheelMesh) v.wheelMesh.rotation.set(Math.PI / 2, 0, 0);
      this.renderStationWheelDial(v.dialCanvas, v.dialTex, 0, '#f59e0b');
    });

    // Le vrai Nonce gagnant du Wagon #2 est exactement le nombre de crans de la gare gagnante
    const targetWinningNonce = this.validators[this.winnerIndex].targetCrans;
    this.prepareCandidateWagon(wasAlreadyAttached, targetWinningNonce);

    if (this.mode === 'pow') {
      this.simState = 'running';
      this.simTimer = 0;
      this.simDuration = 1.65;
    } else {
      this.simState = 'lottery';
      this.simTimer = 0;
      this.simDuration = 1.75;
      this.lotteryStartPercent = this.lotteryCursorPercent;
      this.lotteryHaloX = this.validatorData[this.rouletteHighlightIndex].x;
      this.lotteryHaloZ = this.validatorData[this.rouletteHighlightIndex].z;
    }

    this.applyModeVisuals();
    this.updateTooltipsDOM();
    this.renderLeftPanel();
  },

  /**
   * Met à jour la visibilité des molettes PoW / cautions PoS et les couleurs des 3 gares.
   */
  applyModeVisuals() {
    const isPoW = this.mode === 'pow';

    this.validators.forEach((v, idx) => {
      const isWinner = idx === this.winnerIndex;

      if (isPoW) {
        // En PoW : les 3 gares ont leur molette visible en permanence
        v.powNodeGroup.visible = true;
        v.powNodeGroup.scale.setScalar(1);
        v.posNodeGroup.visible = false;
      } else {
        // En PoS :
        // - Pendant 'idle' et 'lottery' : les 3 gares affichent uniquement leurs piles de jetons
        // - Pendant 'pos_mining' et 'done' : la gare élue fait apparaître sa molette du Nonce
        //   (ses jetons se décalent sur le côté du socle), tandis que les 2 autres gardent leurs jetons sans molette.
        const showWinnerWheel = (this.simState === 'pos_mining' || this.simState === 'done') && isWinner;
        v.powNodeGroup.visible = showWinnerWheel;
        v.powNodeGroup.scale.setScalar(showWinnerWheel ? Math.max(0.01, v.wheelScale) : 0.01);

        v.posNodeGroup.visible = true;
        if (showWinnerWheel) {
          v.posNodeGroup.position.set(-0.62, 0, 0.56);
          v.posNodeGroup.scale.setScalar(0.72);
        } else {
          const isHigh = this.simState === 'lottery' && idx === this.rouletteHighlightIndex;
          v.posNodeGroup.position.set(0, isHigh ? 0.09 : 0, 0.56);
          v.posNodeGroup.scale.setScalar(isHigh ? 1.08 : 1.0);
        }
      }

      let colorHex = 0x38bdf8;
      let lineOpacity = 0.3;

      if (this.simState === 'running') {
        colorHex = 0xf59e0b;
        lineOpacity = 0.65;
      } else if (this.simState === 'lottery') {
        const isHighlighted = idx === this.rouletteHighlightIndex;
        colorHex = isHighlighted ? 0xfacc15 : 0x38bdf8;
        lineOpacity = isHighlighted ? 0.85 : 0.2;
      } else if (this.simState === 'pos_mining') {
        colorHex = isWinner ? 0xf59e0b : 0x475569;
        lineOpacity = isWinner ? 0.85 : 0.15;
      } else if (this.simState === 'done') {
        if (isWinner) {
          colorHex = 0x10b981;
          lineOpacity = 0.95;
        } else {
          colorHex = isPoW ? 0xef4444 : 0x475569;
          lineOpacity = 0.18;
        }
      }

      v.ringMat.color.setHex(colorHex);
      v.lineMat.color.setHex(colorHex);
      v.lineMat.opacity = lineOpacity;
      if (v.beaconMat) {
        v.beaconMat.color.setHex(colorHex);
        v.beaconMat.emissive.setHex(colorHex);
        v.beaconMat.emissiveIntensity = this.simState === 'done' && !isWinner && !isPoW ? 0.4 : 1.7;
      }
    });

    // Projecteur / halo 3D de tirage au sort PoS
    if (this.lotteryHaloGroup) {
      const showHalo = !isPoW && (this.simState === 'lottery' || this.simState === 'pos_mining' || this.simState === 'done');
      this.lotteryHaloGroup.visible = showHalo;
      if (showHalo) {
        const { haloRingMat, haloBeamMat } = this.lotteryHaloGroup.userData;
        const haloColor = this.simState === 'done' ? 0x10b981 : 0xfacc15;
        haloRingMat.color.setHex(haloColor);
        haloBeamMat.color.setHex(haloColor);
        haloBeamMat.opacity = this.simState === 'lottery' ? 0.22 : 0.12;
      }
    }
  },

  /**
   * Met à jour les 3 infobulles 3D et la barre de loterie.
   */
  updateTooltipsDOM() {
    const isPoW = this.mode === 'pow';
    const speedWords = ['rapide', 'moyenne', 'lente'];

    this.validators.forEach((v, idx) => {
      const statusEl = document.getElementById(`s6-pill-status-${idx}`);
      const pillWrap = document.getElementById(`tooltip-s6-${idx}`);
      const lineEl = document.getElementById(`s6-line-${idx}`);
      const dotInEl = document.getElementById(`s6-dot-in-${idx}`);
      const dotOutEl = document.getElementById(`s6-dot-out-${idx}`);
      const segEl = document.getElementById(`s6-seg-${idx}`);

      let spotColor = '#38bdf8';
      let statusText = isPoW
        ? `${v.data.probLabel} (${speedWords[idx]})`
        : `${v.data.tokens} jetons (${v.data.probLabel})`;
      let statusColor = '#cbd5e1';

      if (this.simState === 'running') {
        spotColor = '#f59e0b';
        statusText = `${v.data.probLabel} · Nonce #${v.currentCrans}`;
        statusColor = '#fde68a';
      } else if (this.simState === 'lottery') {
        const isHigh = idx === this.rouletteHighlightIndex;
        spotColor = isHigh ? '#facc15' : '#38bdf8';
        statusText = `${v.data.tokens} jetons (${v.data.probLabel})`;
        statusColor = isHigh ? '#fde047' : '#94a3b8';
      } else if (this.simState === 'pos_mining') {
        const isWinner = idx === this.winnerIndex;
        if (isWinner) {
          spotColor = '#f59e0b';
          statusText = `Élue · Nonce #${v.currentCrans}`;
          statusColor = '#fde68a';
        } else {
          spotColor = '#64748b';
          statusText = 'Au repos (0 cran)';
          statusColor = '#94a3b8';
        }
      } else if (this.simState === 'done') {
        const isWinner = idx === this.winnerIndex;
        if (isWinner) {
          spotColor = '#10b981';
          statusText = `Gagnante (Nonce #${v.currentCrans})`;
          statusColor = '#34d399';
        } else if (isPoW) {
          spotColor = '#ef4444';
          statusText = `Battue (${v.currentCrans} crans)`;
          statusColor = '#fca5a5';
        } else {
          spotColor = '#64748b';
          statusText = 'Au repos (0 cran)';
          statusColor = '#94a3b8';
        }
      }

      if (statusEl) {
        statusEl.textContent = statusText;
        statusEl.style.color = statusColor;
      }
      if (segEl) {
        const segBase = idx === 0 ? 'seg-a' : idx === 1 ? 'seg-b' : 'seg-c';
        const isSweep = this.simState === 'lottery' && idx === this.rouletteHighlightIndex;
        const isWin = (this.simState === 'pos_mining' || this.simState === 'done') && idx === this.winnerIndex;
        segEl.className = `pos-lottery-segment ${segBase} ${isSweep ? 'sweep-active' : ''} ${isWin ? 'winner' : ''}`;
      }
      if (pillWrap) {
        pillWrap.style.setProperty('--spot-color', spotColor);
      }
      if (lineEl) lineEl.setAttribute('stroke', spotColor);
      if (dotInEl) dotInEl.setAttribute('fill', spotColor);
      if (dotOutEl) dotOutEl.setAttribute('stroke', spotColor);
    });

    const cursorEl = document.getElementById('step6-lottery-cursor');
    if (cursorEl) {
      cursorEl.style.left = `${this.lotteryCursorPercent.toFixed(1)}%`;
    }
  },

  startAnimationLoop() {
    this.stopAnimationLoop();

    const setLineAndDot = (lineId, dotInId, dotOutId, x1, y1, x2, y2) => {
      const line = document.getElementById(lineId);
      const dotIn = document.getElementById(dotInId);
      const dotOut = document.getElementById(dotOutId);
      if (line) {
        line.setAttribute('x1', x1.toFixed(1));
        line.setAttribute('y1', y1.toFixed(1));
        line.setAttribute('x2', x2.toFixed(1));
        line.setAttribute('y2', y2.toFixed(1));
      }
      if (dotIn && dotOut) {
        dotIn.setAttribute('cx', x2.toFixed(1));
        dotIn.setAttribute('cy', y2.toFixed(1));
        dotOut.setAttribute('cx', x2.toFixed(1));
        dotOut.setAttribute('cy', y2.toFixed(1));
      }
    };

    let lastTime = performance.now();

    const loop = () => {
      const now = performance.now();
      const dt = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;

      const { trainConvoy, camera } = this.ctx;
      const wagon2 = trainConvoy?.getWagon(2);

      // 1A. Mode PoW : Course simultanée des 3 molettes à vitesses différentes (10 / 7 / 3 crans/s)
      if (this.simState === 'running') {
        this.simTimer += dt;
        const progress = Math.min(this.simTimer / this.simDuration, 1.0);

        if (progress < 1.0) {
          this.validators.forEach((v, idx) => {
            const newCrans = Math.max(1, Math.floor(v.targetCrans * progress));
            if (newCrans !== v.currentCrans) {
              v.currentCrans = newCrans;
              v.currentHash = this.randomRejectedHash();
              this.renderStationWheelDial(v.dialCanvas, v.dialTex, v.currentCrans, '#f59e0b');
              if (idx === this.winnerIndex) {
                this.syncWagon2WithNonce(v.currentCrans, false);
              }
            }
            const targetAngle = v.currentCrans * (Math.PI / 4);
            v.currentAngle = THREE.MathUtils.lerp(v.currentAngle, targetAngle, Math.min(1, dt * 18));
            if (v.wheelMesh) {
              v.wheelMesh.rotation.set(Math.PI / 2, v.currentAngle, 0);
            }
          });
          this.updateTooltipsDOM();
        } else {
          // Fin de la course PoW : la gare gagnante atteint winningNonce et met à jour le Wagon #2 avec ce Nonce exact
          this.simState = 'done';
          this.hasTestedPoW = true;
          const shortWinHash = `${this.winningHash.substring(0, 6)}...`;

          this.validators.forEach((v, idx) => {
            v.currentCrans = v.targetCrans;
            const isWinner = idx === this.winnerIndex;
            v.currentHash = isWinner ? shortWinHash : this.randomRejectedHash();
            this.renderStationWheelDial(
              v.dialCanvas,
              v.dialTex,
              v.currentCrans,
              isWinner ? '#10b981' : '#ef4444'
            );
            if (v.wheelMesh) {
              v.wheelMesh.rotation.set(Math.PI / 2, v.currentCrans * (Math.PI / 4), 0);
            }
          });

          this.syncWagon2WithNonce(this.winningNonce, true);
          this.applyModeVisuals();
          this.updateTooltipsDOM();
          this.renderLeftPanel();
        }
      }

      // 1B. Mode PoS — Phase 1 : Tirage au sort ('lottery') avec balayage décéléré et projecteur 3D
      if (this.simState === 'lottery') {
        this.simTimer += dt;
        const progress = Math.min(this.simTimer / this.simDuration, 1.0);

        if (progress < 1.0) {
          // Balayage aller-retour ample qui décélère progressivement vers lotteryTargetPercent
          const easeOut = 1 - Math.pow(1 - progress, 2.6);
          const damp = Math.pow(1 - progress, 1.45);
          const oscillation = Math.sin(progress * Math.PI * 5.2) * 52 * damp;
          const basePos = THREE.MathUtils.lerp(this.lotteryStartPercent, this.lotteryTargetPercent, easeOut);
          this.lotteryCursorPercent = Math.max(3, Math.min(97, basePos + oscillation));

          if (this.lotteryCursorPercent < 50) this.rouletteHighlightIndex = 0;
          else if (this.lotteryCursorPercent < 85) this.rouletteHighlightIndex = 1;
          else this.rouletteHighlightIndex = 2;

          this.applyModeVisuals();
          this.updateTooltipsDOM();
        } else {
          // La gare est tirée au sort ! Passage à la Phase 2 ('pos_mining') :
          // seule la molette du Nonce de cette gare apparaît et se met à tourner.
          this.lotteryCursorPercent = this.lotteryTargetPercent;
          this.rouletteHighlightIndex = this.winnerIndex;
          this.simState = 'pos_mining';
          this.simTimer = 0;
          this.simDuration = 1.35;

          this.applyModeVisuals();
          this.updateTooltipsDOM();
          this.renderLeftPanel();
        }
      }

      // 1C. Mode PoS — Phase 2 : Seule la gare tirée au sort fait apparaître et tourner sa molette ('pos_mining')
      if (this.simState === 'pos_mining') {
        this.simTimer += dt;
        const progress = Math.min(this.simTimer / this.simDuration, 1.0);
        const winnerVal = this.validators[this.winnerIndex];

        if (progress < 1.0 && winnerVal) {
          // Apparition fluide de la molette sur la gare élue (scale 0.01 -> 1.0) puis rotation cran par cran
          winnerVal.wheelScale = Math.min(1.0, progress * 4.2);
          winnerVal.powNodeGroup.scale.setScalar(winnerVal.wheelScale);

          const spinProgress = Math.max(0, (progress - 0.15) / 0.85);
          const newCrans = Math.max(1, Math.floor(winnerVal.targetCrans * spinProgress));
          if (newCrans !== winnerVal.currentCrans) {
            winnerVal.currentCrans = newCrans;
            winnerVal.currentHash = this.randomRejectedHash();
            this.renderStationWheelDial(winnerVal.dialCanvas, winnerVal.dialTex, winnerVal.currentCrans, '#f59e0b');
            this.syncWagon2WithNonce(winnerVal.currentCrans, false);
          }

          const targetAngle = winnerVal.currentCrans * (Math.PI / 4);
          winnerVal.currentAngle = THREE.MathUtils.lerp(winnerVal.currentAngle, targetAngle, Math.min(1, dt * 18));
          if (winnerVal.wheelMesh) {
            winnerVal.wheelMesh.rotation.set(Math.PI / 2, winnerVal.currentAngle, 0);
          }

          this.updateTooltipsDOM();
        } else if (winnerVal) {
          // Fin de la validation PoS : la gare élue atteint winningNonce et attelle le Wagon #2
          this.simState = 'done';
          this.hasTestedPoS = true;
          winnerVal.wheelScale = 1.0;
          winnerVal.currentCrans = winnerVal.targetCrans;
          winnerVal.currentHash = `${this.winningHash.substring(0, 6)}...`;
          this.renderStationWheelDial(winnerVal.dialCanvas, winnerVal.dialTex, winnerVal.currentCrans, '#10b981');
          if (winnerVal.wheelMesh) {
            winnerVal.wheelMesh.rotation.set(Math.PI / 2, winnerVal.currentCrans * (Math.PI / 4), 0);
          }

          this.syncWagon2WithNonce(this.winningNonce, true);
          this.applyModeVisuals();
          this.updateTooltipsDOM();
          this.renderLeftPanel();
        }
      }

      // Déplacement fluide du projecteur / halo 3D en mode PoS
      if (this.lotteryHaloGroup && this.lotteryHaloGroup.visible) {
        const targetIdx = this.simState === 'lottery' ? this.rouletteHighlightIndex : this.winnerIndex;
        const targetV = this.validatorData[targetIdx];
        this.lotteryHaloX = THREE.MathUtils.lerp(this.lotteryHaloX, targetV.x, Math.min(1, dt * 16));
        this.lotteryHaloZ = THREE.MathUtils.lerp(this.lotteryHaloZ, targetV.z, Math.min(1, dt * 16));
        this.lotteryHaloGroup.position.set(this.lotteryHaloX, -0.34, this.lotteryHaloZ + 0.18);
        this.lotteryHaloGroup.rotation.y += dt * 1.8;
      }

      // 2. Convoi ferroviaire en arrière-plan : toujours proprement attelé et aligné sur les rails
      if (wagon2) {
        const isValidated = this.simState === 'done';
        const targetX = this.minedWagon2X;
        this.currentWagon2X = THREE.MathUtils.lerp(this.currentWagon2X, targetX, Math.min(1, dt * 6.5));
        this.currentWagon2Scale = THREE.MathUtils.lerp(this.currentWagon2Scale, 1.0, Math.min(1, dt * 9.0));
        wagon2.position.x = this.currentWagon2X;
        wagon2.scale.setScalar(this.currentWagon2Scale);

        const isCoupledPosition = Math.abs(this.currentWagon2X - this.minedWagon2X) < 0.06 && isValidated;
        if (isCoupledPosition && !this.wasCoupled) {
          this.wasCoupled = true;
          this.couplerFlashAlpha = 1.0;
        } else if (!isCoupledPosition) {
          this.wasCoupled = false;
        }

        if (wagon2.couplerGroup && wagon2.defaultCouplerPosition) {
          wagon2.couplerGroup.position.copy(wagon2.defaultCouplerPosition);
          wagon2.couplerGroup.rotation.z = 0;
        }

        if (wagon2.beaconMaterial) {
          if (isValidated) {
            wagon2.beaconMaterial.color.setHex(0x10b981);
            wagon2.beaconMaterial.emissive.setHex(0x059669);
            wagon2.beaconMaterial.emissiveIntensity = 1.8;
          } else {
            wagon2.beaconMaterial.color.setHex(0xfacc15);
            wagon2.beaconMaterial.emissive.setHex(0xeab308);
            wagon2.beaconMaterial.emissiveIntensity = 1.4;
          }
        }
      }

      // 3. Aura circulaire verte au verrouillage exact de l'attelage
      if (this.couplerFlashRing) {
        if (this.couplerFlashAlpha > 0.01) {
          this.couplerFlashAlpha = Math.max(0, this.couplerFlashAlpha - dt * 1.4);
          const scale = 1.0 + (1.0 - this.couplerFlashAlpha) * 2.2;
          this.couplerFlashRing.scale.setScalar(scale);
          this.couplerFlashRing.material.opacity = this.couplerFlashAlpha * 0.85;
          this.couplerFlashRing.visible = true;
        } else {
          this.couplerFlashRing.visible = false;
        }
      }

      // 4. Projection 2D des 3 infobulles au-dessus des 3 gares
      if (this.tooltipLayer && camera && this.validators.length === 3) {
        const width = window.innerWidth;
        const height = window.innerHeight;
        const toX = (v) => (v.x * 0.5 + 0.5) * width;
        const toY = (v) => (-v.y * 0.5 + 0.5) * height;

        let anyBehind = false;
        const pts = this.validators.map((v) => {
          const worldP = new THREE.Vector3(v.data.x, -0.44 + 1.55, v.data.z - 0.15);
          const pr = worldP.project(camera);
          if (pr.z > 1) anyBehind = true;
          return { x: toX(pr), y: toY(pr) };
        });

        if (anyBehind) {
          this.tooltipLayer.style.opacity = '0';
          this.tooltipLayer.style.visibility = 'hidden';
        } else {
          const isCovered = width > 768 && pts[0].x < 395;
          this.tooltipLayer.style.opacity = isCovered ? '0' : '1';
          this.tooltipLayer.style.visibility = isCovered ? 'hidden' : 'visible';

          const pillX0 = Math.max(445, pts[0].x);
          const pillX1 = Math.max(pillX0 + 215, pts[1].x);
          const pillX2 = Math.max(pillX1 + 215, pts[2].x);
          const pillXs = [pillX0, pillX1, pillX2];

          pts.forEach((pt, idx) => {
            const px = pillXs[idx];
            const py = pt.y - 36;
            const el = document.getElementById(`tooltip-s6-${idx}`);
            if (el) {
              el.style.transform = `translate3d(${px.toFixed(1)}px, ${py.toFixed(1)}px, 0) translate(-50%, -50%)`;
            }
            setLineAndDot(
              `s6-line-${idx}`,
              `s6-dot-in-${idx}`,
              `s6-dot-out-${idx}`,
              px,
              py + 14,
              pt.x,
              pt.y
            );
          });
        }
      }

      this.rafId = requestAnimationFrame(loop);
    };

    this.rafId = requestAnimationFrame(loop);
  },

  stopAnimationLoop() {
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  },

  renderLeftPanel() {
    const panel = document.getElementById('step-panel-left');
    if (!panel) return;

    panel.classList.add('active');

    const oldInner = panel.querySelector('.step-panel-inner');
    if (oldInner) oldInner.remove();

    const inner = document.createElement('div');
    inner.className = 'step-panel-inner';

    const isPoW = this.mode === 'pow';
    const winner = this.validatorData[this.winnerIndex];
    const isBusy = this.simState === 'running' || this.simState === 'lottery' || this.simState === 'pos_mining';
    const isDone = this.simState === 'done';

    const actionButtonLabel = isPoW
      ? this.simState === 'running'
        ? 'Course en cours...'
        : isDone
          ? 'Relancer la course (nouveau wagon)'
          : 'Lancer la course des 3 molettes'
      : this.simState === 'lottery'
        ? 'Tirage au sort en cours...'
        : this.simState === 'pos_mining'
          ? `La ${winner.name} tourne seule sa molette...`
          : isDone
            ? 'Relancer un tirage (nouveau wagon)'
            : 'Tirer au sort une gare';

    const modeExplanationHTML = isPoW
      ? `
        <div class="share-meaning-banner">
          Chaque gare abrite une salle de serveurs qui vérifie et valide les transactions du réseau. Plus une gare possède d'ordinateurs puissants, plus sa molette teste de combinaisons à la seconde pour trouver le bon Nonce (<strong>50 %, 35 %, 15 %</strong>).
        </div>
      `
      : `
        <div class="share-meaning-banner">
          <strong>Garantie déposée (100 jetons en jeu) :</strong> plus une gare dépose de jetons, plus elle a de chances d'être tirée au sort (50 %, 35 % et 15 %).
        </div>
        <div class="pos-lottery-box">
          <div class="pos-lottery-track">
            <div id="s6-seg-0" class="pos-lottery-segment seg-a ${(this.simState === 'pos_mining' || isDone) && this.winnerIndex === 0 ? 'winner' : ''}">Gare A (50 %)</div>
            <div id="s6-seg-1" class="pos-lottery-segment seg-b ${(this.simState === 'pos_mining' || isDone) && this.winnerIndex === 1 ? 'winner' : ''}">Gare B (35 %)</div>
            <div id="s6-seg-2" class="pos-lottery-segment seg-c ${(this.simState === 'pos_mining' || isDone) && this.winnerIndex === 2 ? 'winner' : ''}">C (15 %)</div>
            <div id="step6-lottery-cursor" class="pos-lottery-cursor" style="left: ${this.lotteryCursorPercent.toFixed(1)}%;"></div>
          </div>
        </div>
      `;

    const resultHTML = isDone
      ? isPoW
        ? `
          <p style="margin: 10px 0 0 0;">
            La <strong>${winner.name}</strong> a trouvé le <strong>Nonce #${this.winningNonce}</strong> en premier et accroche le Wagon #2. Les 2 autres gares ont dépensé de l'électricité pour rien...
          </p>
        `
        : `
          <p style="margin: 10px 0 0 0;">
            La <strong>${winner.name}</strong> a été tirée au sort : seule sa molette a tourné jusqu'au <strong>Nonce #${this.winningNonce}</strong>. Les 2 autres gares sont restées au repos sans gaspiller d'énergie.
          </p>
        `
      : '';

    inner.innerHTML = `
      <header class="step-panel-header">
        <h2 class="step-panel-title">Consensus : PoW vs PoS</h2>
      </header>

      <div class="step-panel-scroll">
        <article class="step-card context-card animate-fade">
          <h3 class="card-title">Comment choisir la gare gagnante ?</h3>
          <p>
            Les <strong>Gares A, B et C</strong> veulent toutes accrocher le <strong>Wagon #2</strong>. Comparez deux méthodes : la <strong>course (PoW)</strong> et le <strong>tirage au sort (PoS)</strong>.
          </p>
        </article>

        <article class="step-card action-card animate-fade">
          <div class="difficulty-selector-row" role="tablist" aria-label="Choix de la méthode">
            <button id="btn-tab-pow" class="btn-diff-option ${isPoW ? 'active' : ''}" role="tab" aria-selected="${isPoW}" ${isBusy ? 'disabled' : ''}>
              <span>PoW (Course)</span>
            </button>
            <button id="btn-tab-pos" class="btn-diff-option ${!isPoW ? 'active' : ''}" role="tab" aria-selected="${!isPoW}" ${isBusy ? 'disabled' : ''}>
              <span>PoS (Loterie)</span>
            </button>
          </div>

          ${modeExplanationHTML}

          <button id="btn-step6-run" class="btn-panel-primary" ${isBusy ? 'disabled' : ''}>
            <span>${actionButtonLabel}</span>
          </button>

          ${resultHTML}
        </article>

        ${(this.hasTestedPoW || this.hasTestedPoS) ? `
          <article class="step-card keypoint-card animate-fade">
            <h4 class="card-title keypoint-title">Point clé : Preuve de Travail (PoW) vs Preuve d'Enjeu (PoS)</h4>
            <p class="keypoint-text">
              En <strong>PoW (Bitcoin)</strong>, tout le monde cherche en même temps : le travail des perdantes consomme de l'énergie pour rien. En <strong>PoS (Ethereum)</strong>, on tire une gare au sort grâce aux jetons déposés en garantie, et <strong>seule sa molette tourne</strong>.
            </p>
          </article>
        ` : ''}

        <nav class="step-nav-bar animate-fade">
          <button id="btn-step6-action-prev" class="btn-panel-ghost">
            <span class="btn-arrow">&larr;</span>
            <span>Étape 5 : Minage</span>
          </button>
          <button id="btn-step6-action-next" class="btn-panel-primary">
            <span>Étape 7 : Attaque</span>
            <span class="btn-arrow">&rarr;</span>
          </button>
        </nav>
      </div>
    `;

    panel.prepend(inner);
    this.setupEvents();
  },

  setupEvents() {
    const isBusy = () =>
      this.simState === 'running' || this.simState === 'lottery' || this.simState === 'pos_mining';

    document.getElementById('btn-tab-pow')?.addEventListener('click', () => {
      if (isBusy()) return;
      this.setMode('pow');
    });

    document.getElementById('btn-tab-pos')?.addEventListener('click', () => {
      if (isBusy()) return;
      this.setMode('pos');
    });

    document.getElementById('btn-step6-run')?.addEventListener('click', () => {
      this.startConsensusRound();
    });

    document.getElementById('btn-step6-action-prev')?.addEventListener('click', () => {
      if (typeof this.ctx.onPrevStep === 'function') {
        this.ctx.onPrevStep();
      }
    });

    document.getElementById('btn-step6-action-next')?.addEventListener('click', () => {
      if (typeof this.ctx.onNextStep === 'function') {
        this.ctx.onNextStep();
      }
    });
  }
};
