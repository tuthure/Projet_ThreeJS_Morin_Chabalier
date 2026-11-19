import * as THREE from 'three';
import { Block } from '../blockchain/Block.js';
import { WagonMesh } from '../three/WagonMesh.js';
import { updateLeftPanelPreserveScroll } from './StepManager.js';

/**
 * Étape 8 (Outro) : Du train à la blockchain et à la cryptomonnaie.
 * Scène 3D comparative côte à côte :
 * - À gauche : un wagon vitré, ses caisses colorées, son attelage SHA-256 et une gare miniature.
 * - À droite : un bloc numérique translucide contenant des jetons dorés et des lignes de transactions,
 *   relié par une chaîne lumineuse au bloc précédent et entouré de nœuds serveurs en réseau.
 * - Faisceaux de correspondance et étiquettes HTML flottantes reliant chaque paire d'équivalence.
 */
export const step8 = {
  id: 8,
  title: 'Outro : Du train à la cryptomonnaie',
  subtitle: 'Comparaison visuelle entre notre réseau ferroviaire et une blockchain réelle',
  ctx: null,

  rafId: null,
  comparisonGroup: null,
  tooltipLayer: null,
  activePairId: null,
  _savedEnvVisibility: null,

  coins: [],
  networkPackets: [],
  beamPackets: [],
  pulseRings: [],
  anchors: {},

  pairsConfig: [
    {
      id: 'nodes',
      pillLabel: 'Gares = Nœuds / Mineurs du réseau',
      color: '#10b981',
      title: 'Gares = Nœuds / Mineurs du réseau',
      desc: 'Chaque gare correspond à un serveur du réseau pair-à-pair : il stocke une copie complète du registre et vérifie chaque nouveau bloc.',
      midPos: new THREE.Vector3(0.25, 3.15, -3.4),
      below: true
    },
    {
      id: 'block',
      pillLabel: 'Wagon = Bloc numérique',
      color: '#38bdf8',
      title: 'Wagon = Bloc numérique',
      desc: 'Un wagon scellé joue le même rôle qu’un bloc informatique : un conteneur transparent qui regroupe un lot horodaté d’opérations.',
      midPos: new THREE.Vector3(0.75, 2.72, 1.6)
    },
    {
      id: 'tx',
      pillLabel: 'Caisses = Transactions / Virements',
      color: '#facc15',
      title: 'Caisses = Transactions / Virements',
      desc: 'À l’intérieur, les caisses de marchandises laissent place à des jetons numériques et des lignes de virements (ex. Bitcoin ou Ethereum).',
      midPos: new THREE.Vector3(0.75, 1.38, 1.85)
    },
    {
      id: 'hash',
      pillLabel: 'Attelage SHA-256 = Chaînage cryptographique',
      color: '#a855f7',
      title: 'Attelage SHA-256 = Chaînage cryptographique',
      desc: 'Comme le crochet magnétique entre deux wagons, l’empreinte SHA-256 soude mathématiquement chaque bloc au bloc précédent.',
      midPos: new THREE.Vector3(-0.35, -0.55, 2.75)
    }
  ],

  /**
   * Initialise le module avec le contexte global de l'application.
   * @param {object} context
   */
  init(context) {
    this.ctx = context;
  },

  /**
   * Active l'étape 8 et construit la scène comparative train vs crypto.
   */
  enter() {
    const { trainConvoy, cameraController, environment } = this.ctx;

    this.activePairId = null;

    if (cameraController) {
      cameraController.setViewOffset(235);
    }

    if (environment) {
      environment.setSpeed(0, true);
      this.isolateEnvironment(true);
    }

    // Masque temporairement le convoi linéaire principal pour isoler la scène comparative
    if (trainConvoy) {
      if (trainConvoy.group) trainConvoy.group.visible = false;
      if (trainConvoy.locomotiveMesh) trainConvoy.locomotiveMesh.visible = false;
      if (Array.isArray(trainConvoy.wagonMeshes)) {
        trainConvoy.wagonMeshes.forEach((w) => {
          w.visible = false;
        });
      }
    }

    this.buildComparativeScene();
    this.setupTooltipsLayer();
    this.createComparisonTooltips();

    if (cameraController) {
      cameraController.moveTo(
        new THREE.Vector3(0.0, 6.4, 11.6),
        new THREE.Vector3(0.0, 0.75, -0.6),
        1.2
      );
    }

    this.startAnimationLoop();
    this.renderLeftPanel();
  },

  /**
   * Quitte l'étape 8, nettoie tous les objets 3D, les étiquettes et restaure le décor.
   */
  exit() {
    this.stopAnimationLoop();
    this.ctx?.cameraController?.cancelTransition();
    this.activePairId = null;

    if (this.tooltipLayer) {
      this.tooltipLayer.remove();
      this.tooltipLayer = null;
    }

    if (this.comparisonGroup && this.ctx?.scene) {
      this.ctx.scene.remove(this.comparisonGroup);
      this.disposeObject3D(this.comparisonGroup);
      this.comparisonGroup = null;
    }

    this.coins = [];
    this.networkPackets = [];
    this.beamPackets = [];
    this.pulseRings = [];
    this.anchors = {};

    // Restaure la visibilité du convoi principal et du décor ferroviaire
    if (this.ctx?.trainConvoy) {
      if (this.ctx.trainConvoy.group) this.ctx.trainConvoy.group.visible = true;
      if (this.ctx.trainConvoy.locomotiveMesh) this.ctx.trainConvoy.locomotiveMesh.visible = true;
      if (Array.isArray(this.ctx.trainConvoy.wagonMeshes)) {
        this.ctx.trainConvoy.wagonMeshes.forEach((w) => {
          w.visible = true;
        });
      }
    }
    this.isolateEnvironment(false);

    const panel = document.getElementById('step-panel-left');
    if (panel) {
      const inner = panel.querySelector('.step-panel-inner');
      if (inner) inner.remove();
    }
  },

  /**
   * Libère proprement les géométries, matériaux et textures d'un groupe Three.js.
   * @param {THREE.Object3D} root
   */
  disposeObject3D(root) {
    root.traverse((obj) => {
      if (obj.geometry) {
        obj.geometry.dispose();
      }
      if (obj.material) {
        const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
        mats.forEach((mat) => {
          if (mat.map && typeof mat.map.dispose === 'function') {
            mat.map.dispose();
          }
          mat.dispose();
        });
      }
    });
  },

  /**
   * Masque temporairement les éléments linéaires du décor (rails centraux, arbres, tunnels, gares mobiles)
   * pour présenter proprement la comparaison côte à côte.
   * @param {boolean} isolate
   */
  isolateEnvironment(isolate) {
    const env = this.ctx?.environment;
    if (!env) return;

    const arrayKeys = ['trees', 'poles', 'passingStations', 'tunnels', 'sleepers', 'towns', 'steamParticles'];
    if (isolate) {
      this._savedEnvVisibility = [];
      arrayKeys.forEach((key) => {
        if (Array.isArray(env[key])) {
          env[key].forEach((obj) => {
            obj.visible = false;
          });
        }
      });
      if (env.group && Array.isArray(env.group.children)) {
        env.group.children.forEach((child) => {
          if (child.isMesh && child.position.y > -0.48 && child.position.y < -0.28) {
            this._savedEnvVisibility.push({ child, visible: child.visible });
            child.visible = false;
          }
        });
      }
    } else if (this._savedEnvVisibility) {
      arrayKeys.forEach((key) => {
        if (Array.isArray(env[key])) {
          env[key].forEach((obj) => {
            obj.visible = true;
          });
        }
      });
      this._savedEnvVisibility.forEach(({ child, visible }) => {
        child.visible = visible;
      });
      this._savedEnvVisibility = null;
    }
  },

  /**
   * Crée une texture Canvas pour l'enseigne d'une gare ou d'un bloc numérique.
   */
  createSignTexture(title, borderHex = '#38bdf8', accentHex = '#f8fafc') {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, 256, 64);
    ctx.strokeStyle = borderHex;
    ctx.lineWidth = 4;
    ctx.strokeRect(4, 4, 248, 56);

    ctx.fillStyle = accentHex;
    ctx.font = 'bold 22px "Segoe UI", Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(title, 128, 33);

    const tex = new THREE.CanvasTexture(canvas);
    tex.needsUpdate = true;
    return tex;
  },

  /**
   * Construit la scène 3D comparative :
   * - Monde ferroviaire à gauche (tronçon de voie, attelage SHA-256, wagon vitré, petite gare)
   * - Monde blockchain/crypto à droite (bloc précédent, chaîne hash, cube crypto avec jetons/tx, 3 nœuds serveurs)
   * - 4 faisceaux d'équivalence animés reliant chaque paire.
   */
  buildComparativeScene() {
    const { scene } = this.ctx;
    if (!scene) return;

    if (this.comparisonGroup) {
      scene.remove(this.comparisonGroup);
      this.disposeObject3D(this.comparisonGroup);
    }

    this.comparisonGroup = new THREE.Group();
    this.coins = [];
    this.networkPackets = [];
    this.beamPackets = [];
    this.pulseRings = [];
    this.anchors = {};

    // =========================================================================
    // 1. CÔTÉ GAUCHE : UNIVERS FERROVIAIRE (Wagon + Attelage + Petite gare)
    // =========================================================================
    const trackZ = 1.6;
    const wagonX = -2.1;

    // Socle discret côté ferroviaire
    const railBaseMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.85,
      metalness: 0.1
    });
    const ballastGeo = new THREE.BoxGeometry(4.4, 0.08, 1.35);
    const ballast = new THREE.Mesh(ballastGeo, railBaseMat);
    ballast.position.set(-2.75, -0.02, trackZ);
    this.comparisonGroup.add(ballast);

    const railMat = new THREE.MeshStandardMaterial({
      color: 0x94a3b8,
      metalness: 0.8,
      roughness: 0.25
    });
    const sleeperMat = new THREE.MeshStandardMaterial({ color: 0x451a03, roughness: 0.9 });
    for (let sx = -4.75; sx <= -0.75; sx += 0.45) {
      const sleeper = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.05, 1.05), sleeperMat);
      sleeper.position.set(sx, 0.03, trackZ);
      this.comparisonGroup.add(sleeper);
    }
    [-0.36, 0.36].forEach((rz) => {
      const rail = new THREE.Mesh(new THREE.BoxGeometry(4.3, 0.05, 0.07), railMat);
      rail.position.set(-2.75, 0.07, trackZ + rz);
      this.comparisonGroup.add(rail);
    });

    // Bloc précédent logique (#1) pour calculer un chaînage SHA-256 réel et un attelage verrouillé
    const prevBlock = new Block(
      1,
      '0000000000000000000000000000000000000000000000000000000000000000',
      { lot: 'Lot #101', cargaison: 'Caisses initiales', quai: 'Quai Départ' }
    );
    prevBlock.mineBlock(1);

    const mainBlock = new Block(2, prevBlock.hash, {
      lot: 'Lot #204',
      cargaison: 'Caisses de marchandises',
      quai: 'Quai A -> Quai B'
    });
    mainBlock.mineBlock(1);

    // Wagon principal complet (#2)
    const wagonMesh = new WagonMesh(mainBlock, { spacing: 3.8 });
    wagonMesh.position.set(wagonX, 0.37, trackZ);
    wagonMesh.updateStatus(true);
    if (wagonMesh.frontRingMaterial) {
      wagonMesh.frontRingMaterial.color.setHex(0xa855f7);
      wagonMesh.frontRingMaterial.emissive.setHex(0xa855f7);
    }
    if (wagonMesh.couplerSleeveMaterial) {
      wagonMesh.couplerSleeveMaterial.color.setHex(0xa855f7);
      wagonMesh.couplerSleeveMaterial.emissive.setHex(0xa855f7);
      wagonMesh.couplerSleeveMaterial.emissiveIntensity = 0.45;
    }
    if (wagonMesh.couplerBeamMaterial) {
      wagonMesh.couplerBeamMaterial.color.setHex(0xa855f7);
      wagonMesh.couplerBeamMaterial.emissive.setHex(0xa855f7);
    }
    if (wagonMesh.couplerHookMaterial) {
      wagonMesh.couplerHookMaterial.color.setHex(0xa855f7);
      wagonMesh.couplerHookMaterial.emissive.setHex(0xa855f7);
    }
    this.comparisonGroup.add(wagonMesh);

    // Module d'extrémité du wagon précédent (#1) à gauche pour illustrer l'attelage magnétique SHA-256
    const prevEndGroup = new THREE.Group();
    prevEndGroup.position.set(-4.35, 0.37, trackZ);
    const prevStub = new THREE.Mesh(
      new THREE.BoxGeometry(0.85, 0.72, 1.02),
      new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.65, metalness: 0.3 })
    );
    prevStub.position.set(0, 0.42, 0);
    prevEndGroup.add(prevStub);
    const prevChassis = new THREE.Mesh(
      new THREE.BoxGeometry(0.95, 0.16, 1.12),
      new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.7, metalness: 0.4 })
    );
    prevChassis.position.set(0, 0.02, 0);
    prevEndGroup.add(prevChassis);
    const prevRearRing = new THREE.Mesh(
      new THREE.TorusGeometry(0.16, 0.04, 12, 24),
      new THREE.MeshStandardMaterial({
        color: 0xa855f7,
        emissive: 0xa855f7,
        emissiveIntensity: 1.5
      })
    );
    prevRearRing.rotation.y = Math.PI / 2;
    prevRearRing.position.set(0.5, 0.02, 0);
    prevEndGroup.add(prevRearRing);
    this.comparisonGroup.add(prevEndGroup);

    // Faisceau d'attelage magnétique entre l'extrémité précédente et le crochet du wagon
    const couplerMat = new THREE.MeshStandardMaterial({
      color: 0xa855f7,
      emissive: 0xa855f7,
      emissiveIntensity: 1.8
    });
    const couplerBar = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.055, 0.56, 16), couplerMat);
    couplerBar.rotation.z = Math.PI / 2;
    couplerBar.position.set(-3.55, 0.39, trackZ);
    this.comparisonGroup.add(couplerBar);

    const couplerRing = new THREE.Mesh(
      new THREE.TorusGeometry(0.24, 0.025, 10, 28),
      new THREE.MeshBasicMaterial({ color: 0xc084fc, transparent: true, opacity: 0.75 })
    );
    couplerRing.rotation.y = Math.PI / 2;
    couplerRing.position.set(-3.55, 0.39, trackZ);
    this.comparisonGroup.add(couplerRing);
    this.pulseRings.push(couplerRing);

    // Petite gare miniature reculée à l'arrière gauche (dégagée au-dessus du wagon)
    const stationGroup = this.createMiniStationMesh();
    stationGroup.position.set(-3.2, 0.0, -3.35);
    stationGroup.scale.setScalar(1.18);
    this.comparisonGroup.add(stationGroup);

    // =========================================================================
    // 2. CÔTÉ DROIT : UNIVERS BLOCKCHAIN / CRYPTOMONNAIE
    // =========================================================================
    const cryptoCenterX = 3.9;

    // Plateforme numérique hexagonale discrète sous le bloc crypto
    const cryptoPad = new THREE.Mesh(
      new THREE.CylinderGeometry(1.55, 1.7, 0.08, 6),
      new THREE.MeshStandardMaterial({
        color: 0x0f172a,
        emissive: 0x0284c7,
        emissiveIntensity: 0.25,
        roughness: 0.4,
        metalness: 0.6
      })
    );
    cryptoPad.position.set(cryptoCenterX, -0.02, trackZ);
    this.comparisonGroup.add(cryptoPad);

    const cryptoPadRing = new THREE.Mesh(
      new THREE.RingGeometry(1.52, 1.62, 6),
      new THREE.MeshBasicMaterial({ color: 0x38bdf8, side: THREE.DoubleSide, transparent: true, opacity: 0.75 })
    );
    cryptoPadRing.rotation.x = -Math.PI / 2;
    cryptoPadRing.position.set(cryptoCenterX, 0.03, trackZ);
    this.comparisonGroup.add(cryptoPadRing);

    // Bloc numérique précédent (cube plus petit à gauche du bloc principal)
    const prevCryptoGroup = new THREE.Group();
    prevCryptoGroup.position.set(1.65, 0.92, trackZ);
    const prevCubeGeo = new THREE.BoxGeometry(0.92, 0.92, 0.92);
    const prevCubeMat = new THREE.MeshPhysicalMaterial({
      color: 0x0ea5e9,
      transparent: true,
      opacity: 0.24,
      roughness: 0.15,
      metalness: 0.1
    });
    prevCryptoGroup.add(new THREE.Mesh(prevCubeGeo, prevCubeMat));
    prevCryptoGroup.add(
      new THREE.LineSegments(
        new THREE.EdgesGeometry(prevCubeGeo),
        new THREE.LineBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.85 })
      )
    );
    const prevChip = new THREE.Mesh(
      new THREE.CylinderGeometry(0.18, 0.18, 0.05, 18),
      new THREE.MeshStandardMaterial({
        color: 0xfacc15,
        emissive: 0xca8a04,
        emissiveIntensity: 0.7,
        metalness: 0.85,
        roughness: 0.25
      })
    );
    prevChip.rotation.x = Math.PI / 2;
    prevCryptoGroup.add(prevChip);
    this.coins.push({ mesh: prevChip, phase: 0.2, baseY: 0 });
    this.comparisonGroup.add(prevCryptoGroup);

    // Chaîne lumineuse (Hash) entre le bloc crypto précédent et le bloc principal
    const chainGroup = new THREE.Group();
    const chainStartX = 2.15;
    const chainEndX = 3.0;
    const hashChainMat = new THREE.MeshStandardMaterial({
      color: 0xa855f7,
      emissive: 0xa855f7,
      emissiveIntensity: 1.5,
      metalness: 0.6,
      roughness: 0.2
    });
    const hashTube = new THREE.Mesh(
      new THREE.CylinderGeometry(0.04, 0.04, chainEndX - chainStartX, 12),
      hashChainMat
    );
    hashTube.rotation.z = Math.PI / 2;
    hashTube.position.set((chainStartX + chainEndX) * 0.5, 0.92, trackZ);
    chainGroup.add(hashTube);
    for (let i = 0; i < 3; i++) {
      const linkRing = new THREE.Mesh(
        new THREE.TorusGeometry(0.14, 0.03, 10, 20),
        hashChainMat
      );
      linkRing.position.set(chainStartX + 0.16 + i * 0.26, 0.92, trackZ);
      linkRing.rotation.x = i % 2 === 0 ? 0.35 : -0.35;
      linkRing.rotation.y = Math.PI / 2;
      chainGroup.add(linkRing);
    }
    this.comparisonGroup.add(chainGroup);

    // Bloc numérique principal de cryptomonnaie (cube translucide + jetons dorés + lignes de transactions)
    const mainCryptoGroup = new THREE.Group();
    mainCryptoGroup.position.set(cryptoCenterX, 0.92, trackZ);
    const mainCubeGeo = new THREE.BoxGeometry(1.56, 1.56, 1.56);
    const mainCubeMat = new THREE.MeshPhysicalMaterial({
      color: 0x0284c7,
      transparent: true,
      opacity: 0.18,
      roughness: 0.1,
      metalness: 0.1,
      depthWrite: false
    });
    mainCryptoGroup.add(new THREE.Mesh(mainCubeGeo, mainCubeMat));
    mainCryptoGroup.add(
      new THREE.LineSegments(
        new THREE.EdgesGeometry(mainCubeGeo),
        new THREE.LineBasicMaterial({ color: 0x38bdf8 })
      )
    );

    // Plaque frontale "BLOCK #2 - CRYPTO" sur la face supérieure avant du cube
    const blockHeaderPlane = new THREE.Mesh(
      new THREE.PlaneGeometry(1.22, 0.3),
      new THREE.MeshBasicMaterial({
        map: this.createSignTexture('BLOC #2 CRYPTO', '#38bdf8', '#facc15'),
        transparent: true
      })
    );
    blockHeaderPlane.position.set(0, 0.96, 0.0);
    mainCryptoGroup.add(blockHeaderPlane);

    // Jetons dorés flottants à l'intérieur du bloc crypto
    const goldMat = new THREE.MeshStandardMaterial({
      color: 0xfacc15,
      emissive: 0xd97706,
      emissiveIntensity: 0.75,
      metalness: 0.88,
      roughness: 0.22
    });
    const coinOffsets = [
      [-0.36, 0.26, 0.22],
      [0.02, 0.34, -0.18],
      [0.36, 0.22, 0.24],
      [-0.3, -0.18, -0.22],
      [0.12, -0.12, 0.26],
      [0.38, -0.24, -0.16]
    ];
    coinOffsets.forEach(([cx, cy, cz], idx) => {
      const coin = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.17, 0.05, 22), goldMat);
      coin.rotation.x = Math.PI / 2;
      coin.position.set(cx, cy, cz);
      mainCryptoGroup.add(coin);
      this.coins.push({ mesh: coin, phase: idx * 0.9, baseY: cy });
    });

    // Lignes lumineuses de transactions à l'intérieur du cube
    const txLineMat = new THREE.MeshBasicMaterial({ color: 0x7dd3fc });
    [-0.42, 0.02, 0.44].forEach((ly, idx) => {
      const bar = new THREE.Mesh(new THREE.BoxGeometry(0.95 - idx * 0.12, 0.04, 0.04), txLineMat);
      bar.position.set(-0.05, ly - 0.12, -0.38);
      mainCryptoGroup.add(bar);
    });

    this.comparisonGroup.add(mainCryptoGroup);

    // 3 Nœuds serveurs connectés en réseau, bien espacés et reculés à l'arrière droit
    const nodePositions = [
      new THREE.Vector3(1.75, 0.0, -3.15),
      new THREE.Vector3(3.75, 0.0, -3.95),
      new THREE.Vector3(5.65, 0.0, -2.95)
    ];
    nodePositions.forEach((pos, idx) => {
      const serverNode = this.createServerNodeMesh(idx + 1);
      serverNode.position.copy(pos);
      serverNode.scale.setScalar(1.08);
      this.comparisonGroup.add(serverNode);
    });

    // Liens P2P entre les nœuds serveurs et vers le bloc crypto principal
    const cryptoNodeTops = nodePositions.map((p) => new THREE.Vector3(p.x, 0.95, p.z));
    const blockNetworkPort = new THREE.Vector3(cryptoCenterX, 0.92, trackZ - 0.78);
    const p2pEdges = [
      [cryptoNodeTops[0], cryptoNodeTops[1]],
      [cryptoNodeTops[1], cryptoNodeTops[2]],
      [cryptoNodeTops[0], cryptoNodeTops[2]],
      [cryptoNodeTops[0], blockNetworkPort],
      [cryptoNodeTops[1], blockNetworkPort],
      [cryptoNodeTops[2], blockNetworkPort]
    ];

    p2pEdges.forEach(([from, to], idx) => {
      const lineGeo = new THREE.BufferGeometry().setFromPoints([from, to]);
      const lineMat = new THREE.LineBasicMaterial({
        color: 0x10b981,
        transparent: true,
        opacity: 0.7
      });
      this.comparisonGroup.add(new THREE.Line(lineGeo, lineMat));

      const pkt = new THREE.Mesh(
        new THREE.SphereGeometry(0.075, 12, 12),
        new THREE.MeshBasicMaterial({ color: 0x34d399 })
      );
      this.comparisonGroup.add(pkt);
      this.networkPackets.push({
        mesh: pkt,
        from,
        to,
        t: (idx * 0.23) % 1,
        speed: 0.45 + idx * 0.05
      });
    });

    // =========================================================================
    // 3. FAISCEAUX DE CORRESPONDANCE TRAIN <-> BLOCKCHAIN CRYPTO
    // =========================================================================
    this.anchors = {
      nodes: {
        left: new THREE.Vector3(-2.35, 1.35, -3.35),
        right: new THREE.Vector3(3.75, 1.38, -3.75)
      },
      block: {
        left: new THREE.Vector3(wagonX + 0.55, 1.48, trackZ),
        right: new THREE.Vector3(cryptoCenterX - 0.1, 1.74, trackZ)
      },
      tx: {
        left: new THREE.Vector3(wagonX + 0.45, 0.92, trackZ + 0.25),
        right: new THREE.Vector3(cryptoCenterX - 0.05, 1.12, trackZ + 0.25)
      },
      hash: {
        left: new THREE.Vector3(-3.55, 0.39, trackZ),
        right: new THREE.Vector3(2.58, 0.78, trackZ + 0.14)
      }
    };

    const beamSpecs = [
      { key: 'nodes', color: 0x10b981, arcY: 0.35 },
      { key: 'block', color: 0x38bdf8, arcY: 0.45 },
      { key: 'tx', color: 0xfacc15, arcY: 0.05 },
      { key: 'hash', color: 0xa855f7, arcY: -0.55 }
    ];

    beamSpecs.forEach(({ key, color, arcY }, idx) => {
      const { left, right } = this.anchors[key];
      const mid = new THREE.Vector3().addVectors(left, right).multiplyScalar(0.5);
      mid.y += arcY;

      const curve = new THREE.QuadraticBezierCurve3(left, mid, right);
      const pts = curve.getPoints(28);
      const curveGeo = new THREE.BufferGeometry().setFromPoints(pts);
      const curveMat = new THREE.LineBasicMaterial({
        color,
        transparent: true,
        opacity: 0.28
      });
      this.comparisonGroup.add(new THREE.Line(curveGeo, curveMat));

      const beamDot = new THREE.Mesh(
        new THREE.SphereGeometry(0.08, 14, 14),
        new THREE.MeshBasicMaterial({ color })
      );
      this.comparisonGroup.add(beamDot);
      this.beamPackets.push({
        mesh: beamDot,
        curve,
        t: (idx * 0.27) % 1,
        speed: 0.34
      });
    });

    scene.add(this.comparisonGroup);
  },

  /**
   * Construit une petite gare ferroviaire miniature pour l'univers de gauche.
   */
  createMiniStationMesh() {
    const group = new THREE.Group();

    const platform = new THREE.Mesh(
      new THREE.BoxGeometry(2.15, 0.16, 1.35),
      new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.85 })
    );
    platform.position.y = 0.08;
    group.add(platform);

    const hall = new THREE.Mesh(
      new THREE.BoxGeometry(1.45, 0.78, 0.82),
      new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.7 })
    );
    hall.position.set(0, 0.55, 0);
    group.add(hall);

    const roof = new THREE.Mesh(
      new THREE.ConeGeometry(1.08, 0.45, 4),
      new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.65 })
    );
    roof.rotation.y = Math.PI / 4;
    roof.position.set(0, 1.15, 0);
    group.add(roof);

    const windowMat = new THREE.MeshStandardMaterial({
      color: 0xfef08a,
      emissive: 0xfacc15,
      emissiveIntensity: 0.9
    });
    [-0.4, 0, 0.4].forEach((wx) => {
      const win = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.24, 0.04), windowMat);
      win.position.set(wx, 0.56, 0.42);
      group.add(win);
    });

    const sign = new THREE.Mesh(
      new THREE.PlaneGeometry(1.25, 0.3),
      new THREE.MeshBasicMaterial({
        map: this.createSignTexture('GARE / RÉSEAU', '#10b981', '#f8fafc')
      })
    );
    sign.position.set(0, 0.85, 0.43);
    group.add(sign);

    const antenna = new THREE.Mesh(
      new THREE.CylinderGeometry(0.025, 0.025, 0.45, 8),
      new THREE.MeshStandardMaterial({ color: 0x94a3b8 })
    );
    antenna.position.set(0, 1.5, 0);
    group.add(antenna);

    const beacon = new THREE.Mesh(
      new THREE.SphereGeometry(0.08, 12, 12),
      new THREE.MeshStandardMaterial({
        color: 0x10b981,
        emissive: 0x10b981,
        emissiveIntensity: 1.5
      })
    );
    beacon.position.set(0, 1.74, 0);
    group.add(beacon);

    return group;
  },

  /**
   * Construit un nœud serveur miniature low-poly avec voyants LED et étiquette.
   */
  createServerNodeMesh(nodeNum) {
    const group = new THREE.Group();

    const base = new THREE.Mesh(
      new THREE.CylinderGeometry(0.55, 0.62, 0.1, 16),
      new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.7 })
    );
    base.position.y = 0.05;
    group.add(base);

    const rack = new THREE.Mesh(
      new THREE.BoxGeometry(0.62, 1.1, 0.54),
      new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.45, metalness: 0.55 })
    );
    rack.position.y = 0.65;
    group.add(rack);

    const edgeFrame = new THREE.LineSegments(
      new THREE.EdgesGeometry(new THREE.BoxGeometry(0.63, 1.11, 0.55)),
      new THREE.LineBasicMaterial({ color: 0x10b981, transparent: true, opacity: 0.65 })
    );
    edgeFrame.position.y = 0.65;
    group.add(edgeFrame);

    [0.4, 0.65, 0.9].forEach((ly, idx) => {
      const led = new THREE.Mesh(
        new THREE.BoxGeometry(0.42, 0.05, 0.04),
        new THREE.MeshStandardMaterial({
          color: idx === 0 ? 0x10b981 : 0x38bdf8,
          emissive: idx === 0 ? 0x10b981 : 0x38bdf8,
          emissiveIntensity: 1.3
        })
      );
      led.position.set(0, ly, 0.28);
      group.add(led);
    });

    const plaque = new THREE.Mesh(
      new THREE.PlaneGeometry(0.8, 0.2),
      new THREE.MeshBasicMaterial({
        map: this.createSignTexture(`NŒUD #${nodeNum}`, '#10b981', '#e2e8f0')
      })
    );
    plaque.position.set(0, 1.38, 0);
    group.add(plaque);

    return group;
  },

  /**
   * Prépare le calque DOM des étiquettes flottantes et traits SVG de correspondance.
   */
  setupTooltipsLayer() {
    const hud = document.getElementById('hud');
    if (!hud) return;

    if (!this.tooltipLayer) {
      this.tooltipLayer = document.createElement('div');
      this.tooltipLayer.id = 'step8-tooltips-layer';
      this.tooltipLayer.className = 'scene-tooltips-layer';
      hud.appendChild(this.tooltipLayer);
    }
    this.tooltipLayer.innerHTML = '';
  },

  /**
   * Crée les 4 étiquettes HTML flottantes reliant chaque paire train <-> crypto.
   */
  createComparisonTooltips() {
    if (!this.tooltipLayer) return;

    const svgLines = this.pairsConfig
      .map(
        (pair) => `
        <line id="s8-line-${pair.id}-l" stroke="${pair.color}" stroke-width="2.6" stroke-dasharray="7 4" stroke-linecap="round" opacity="0.96" />
        <circle id="s8-dot-${pair.id}-l" r="5.5" fill="${pair.color}" stroke="#0f172a" stroke-width="1.6" />
        <line id="s8-line-${pair.id}-r" stroke="${pair.color}" stroke-width="2.6" stroke-dasharray="7 4" stroke-linecap="round" opacity="0.96" />
        <circle id="s8-dot-${pair.id}-r" r="5.5" fill="${pair.color}" stroke="#0f172a" stroke-width="1.6" />
      `
      )
      .join('');

    const pills = this.pairsConfig
      .map(
        (pair) => `
      <div id="tooltip-s8-${pair.id}" class="scene-tooltip ${pair.below ? 'tooltip-below' : ''}" style="--spot-color: ${pair.color}; z-index: 12;">
        <button type="button" class="scene-tooltip-pill">
          <span class="scene-tooltip-dot"></span>
          <span class="scene-tooltip-label">${pair.pillLabel}</span>
        </button>
        <div class="scene-tooltip-card">
          <div class="scene-tooltip-card-title">${pair.title}</div>
          <p class="scene-tooltip-card-text">${pair.desc}</p>
        </div>
      </div>
    `
      )
      .join('');

    this.tooltipLayer.innerHTML = `
      <svg id="step8-tooltips-svg" style="position: absolute; inset: 0; width: 100%; height: 100%; pointer-events: none; overflow: visible; z-index: 10;">
        ${svgLines}
      </svg>
      ${pills}
    `;

    this.pairsConfig.forEach((pair) => {
      const el = document.getElementById(`tooltip-s8-${pair.id}`);
      el?.addEventListener('pointerdown', (e) => e.stopPropagation());
      el?.addEventListener('mouseenter', () => {
        if (el) el.style.zIndex = '25';
      });
      el?.addEventListener('mouseleave', () => {
        if (el) el.style.zIndex = this.activePairId === pair.id ? '20' : '12';
      });
      el?.querySelector('.scene-tooltip-pill')?.addEventListener('click', (e) => {
        e.stopPropagation();
        this.activePairId = this.activePairId === pair.id ? null : pair.id;
        this.pairsConfig.forEach((p) => {
          const item = document.getElementById(`tooltip-s8-${p.id}`);
          const active = this.activePairId === p.id;
          item?.classList.toggle('active', active);
          if (item) item.style.zIndex = active ? '20' : '12';
        });
      });
    });
  },

  /**
   * Boucle d'animation douce :
   * - Rotation et flottement des jetons dorés dans le bloc crypto
   * - Circulation de paquets entre les nœuds serveurs et sur les faisceaux d'équivalence
   * - Projection 2D des 4 étiquettes d'équivalence et des connecteurs SVG
   */
  startAnimationLoop() {
    this.stopAnimationLoop();
    let lastTime = performance.now();

    const loop = () => {
      const now = performance.now();
      const dt = Math.min(0.05, (now - lastTime) * 0.001);
      lastTime = now;
      const elapsed = now * 0.001;

      // Jetons dorés en flottement et rotation lente
      this.coins.forEach((c) => {
        c.mesh.rotation.z += dt * 1.4;
        c.mesh.position.y = c.baseY + Math.sin(elapsed * 2.1 + c.phase) * 0.045;
      });

      // Anneaux pulsants
      this.pulseRings.forEach((ring, idx) => {
        const s = 1 + Math.sin(elapsed * 3.0 + idx) * 0.14;
        ring.scale.setScalar(s);
      });

      // Paquets circulant entre les nœuds serveurs
      this.networkPackets.forEach((pkt) => {
        pkt.t = (pkt.t + dt * pkt.speed) % 1;
        pkt.mesh.position.lerpVectors(pkt.from, pkt.to, pkt.t);
      });

      // Flux doux le long des 4 faisceaux d'équivalence train <-> crypto
      this.beamPackets.forEach((bp) => {
        bp.t = (bp.t + dt * bp.speed) % 1;
        bp.curve.getPoint(bp.t, bp.mesh.position);
      });

      // Projection 2D des étiquettes et traits SVG
      const camera = this.ctx?.camera;
      if (this.tooltipLayer && camera) {
        const width = window.innerWidth;
        const height = window.innerHeight;
        const toX = (v) => (v.x * 0.5 + 0.5) * width;
        const toY = (v) => (-v.y * 0.5 + 0.5) * height;

        let anyHidden = false;
        const projected = {};

        for (const pair of this.pairsConfig) {
          const anchor = this.anchors[pair.id];
          if (!anchor) continue;
          const pM = pair.midPos.clone().project(camera);
          const pL = anchor.left.clone().project(camera);
          const pR = anchor.right.clone().project(camera);
          if (pM.z > 1 || pL.z > 1 || pR.z > 1) {
            anyHidden = true;
            break;
          }
          projected[pair.id] = {
            mx: toX(pM),
            my: toY(pM),
            lx: toX(pL),
            ly: toY(pL),
            rx: toX(pR),
            ry: toY(pR)
          };
        }

        if (anyHidden) {
          this.tooltipLayer.style.opacity = '0';
          this.tooltipLayer.style.visibility = 'hidden';
        } else {
          this.tooltipLayer.style.opacity = '1';
          this.tooltipLayer.style.visibility = 'visible';

          this.pairsConfig.forEach((pair) => {
            const p = projected[pair.id];
            if (!p) return;

            const spotEl = document.getElementById(`tooltip-s8-${pair.id}`);
            if (spotEl) {
              spotEl.style.transform = `translate3d(${p.mx.toFixed(1)}px, ${p.my.toFixed(1)}px, 0) translate(-50%, -50%)`;
            }

            const lineL = document.getElementById(`s8-line-${pair.id}-l`);
            const dotL = document.getElementById(`s8-dot-${pair.id}-l`);
            const lineR = document.getElementById(`s8-line-${pair.id}-r`);
            const dotR = document.getElementById(`s8-dot-${pair.id}-r`);

            if (lineL) {
              lineL.setAttribute('x1', p.mx.toFixed(1));
              lineL.setAttribute('y1', p.my.toFixed(1));
              lineL.setAttribute('x2', p.lx.toFixed(1));
              lineL.setAttribute('y2', p.ly.toFixed(1));
            }
            if (dotL) {
              dotL.setAttribute('cx', p.lx.toFixed(1));
              dotL.setAttribute('cy', p.ly.toFixed(1));
            }
            if (lineR) {
              lineR.setAttribute('x1', p.mx.toFixed(1));
              lineR.setAttribute('y1', p.my.toFixed(1));
              lineR.setAttribute('x2', p.rx.toFixed(1));
              lineR.setAttribute('y2', p.ry.toFixed(1));
            }
            if (dotR) {
              dotR.setAttribute('cx', p.rx.toFixed(1));
              dotR.setAttribute('cy', p.ry.toFixed(1));
            }
          });
        }
      }

      this.rafId = requestAnimationFrame(loop);
    };

    this.rafId = requestAnimationFrame(loop);
  },

  /**
   * Arrête la boucle d'animation locale de l'étape 8.
   */
  stopAnimationLoop() {
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  },

  /**
   * Affiche le comparatif complet entre le convoi ferroviaire 3D et la cryptomonnaie.
   */
  renderLeftPanel() {
    const panel = document.getElementById('step-panel-left');
    if (!panel) return;

    const inner = document.createElement('div');
    inner.className = 'step-panel-inner';

    inner.innerHTML = `
      <header class="step-panel-header">
        <h2 class="step-panel-title">Outro : Du train à la cryptomonnaie</h2>
      </header>

      <div class="step-panel-scroll">
        <article class="step-card context-card animate-fade">
          <h3 class="card-title">Correspondance directe dans la scène 3D</h3>
          <p>
            Cette scène met face à face notre métaphore ferroviaire (à gauche) et une blockchain réelle de cryptomonnaie (à droite). Cliquez ou survolez les étiquettes pour explorer chaque lien :
          </p>
          <ul class="clean-bullet-list">
            <li><strong>Wagon = Bloc numérique :</strong> un conteneur transparent et horodaté qui regroupe un lot d'opérations validées.</li>
            <li><strong>Caisses = Transactions / Virements :</strong> à l'intérieur d'une blockchain financière, les chargements deviennent des échanges de jetons et de valeur.</li>
            <li><strong>Attelage SHA-256 = Chaînage cryptographique :</strong> chaque bloc reprend l'empreinte du bloc précédent pour rendre l'historique infalsifiable.</li>
            <li><strong>Gares = Nœuds / Mineurs du réseau :</strong> des serveurs connectés en réseau sans autorité centrale qui vérifient et répliquent le registre.</li>
          </ul>
        </article>

        <article class="step-card action-card animate-fade">
          <h3 class="card-title">De la métaphore aux monnaies numériques</h3>
          <p>
            Aujourd'hui, l'application la plus connue de cette architecture est la <strong>cryptomonnaie</strong> (comme Bitcoin ou Ethereum).
          </p>
          <p style="margin-top: 8px;">
            Dans ce cas, les wagons ne transportent plus des caisses de marchandises, mais des <strong>transactions numériques</strong> (comme des virements en cryptomonnaie) vérifiées par tout le réseau.
          </p>
          <p style="margin-top: 8px;">
            C'est aussi pour cela qu'un pirate cherche à tricher (étape 7) : si quelqu'un parvenait à réécrire un ancien bloc, il pourrait dépenser deux fois les mêmes jetons sans banque centrale pour l'en empêcher.
          </p>
        </article>

        <nav class="step-nav-bar animate-fade">
          <button id="btn-step8-action-prev" class="btn-panel-ghost">
            <span class="btn-arrow">&larr;</span>
            <span>Étape 7 : Attaque 51 %</span>
          </button>
          <button id="btn-step8-restart" class="btn-panel-primary">
            <span>Recommencer (Étape 0)</span>
            <span class="btn-arrow">&rarr;</span>
          </button>
        </nav>
      </div>
    `;

    updateLeftPanelPreserveScroll(panel, inner);
    this.setupEvents();
  },

  /**
   * Attache les écouteurs de navigation de l'outro.
   */
  setupEvents() {
    document.getElementById('btn-step8-action-prev')?.addEventListener('click', () => {
      if (typeof this.ctx.onPrevStep === 'function') {
        this.ctx.onPrevStep();
      }
    });

    document.getElementById('btn-step8-restart')?.addEventListener('click', () => {
      if (typeof this.ctx.onGoToStep === 'function') {
        this.ctx.onGoToStep(0);
      }
    });
  }
};
