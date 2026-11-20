import * as THREE from 'three';
import { updateLeftPanelPreserveScroll } from './StepManager.js';

/**
 * Etape 6.2 : Recompenses de bloc et Retour sur Investissement (ROI).
 * Compare l'economie d'une gare validatrice en PoW (materiel + electricite payee par tous)
 * et en PoS (caution preservee + rendement sans gachis electrique), avec les memes 3 gares
 * proportionnelles qu'a l'etape 6.1.
 */
export const step6_2 = {
  id: '6.2',
  title: 'Récompenses & Retour sur investissement',
  ctx: null,

  rafId: null,
  mode: 'pow', // 'pow' | 'pos'

  // Etats : 'idle' | 'spending' | 'rewarding'
  simState: 'idle',
  simTimer: 0,
  spendDuration: 0.65,
  rewardDuration: 1.0,
  remainingRounds: 0,
  totalBatchRounds: 1,
  winnerIndex: 0,
  rouletteHighlightIndex: 0,
  lastEventText: ['', '', ''],
  lastEventColor: ['#94a3b8', '#94a3b8', '#94a3b8'],
  lastEventTimer: 0,

  hasTestedPoW: false,
  hasTestedPoS: false,
  roundsPlayed: { pow: 0, pos: 0 },
  lastWinnerByMode: { pow: '', pos: '' },
  ledgers: null,

  overviewCamPos: new THREE.Vector3(3.8, 5.15, 14.8),
  overviewCamTarget: new THREE.Vector3(3.8, 0.25, 1.85),
  rewardSourcePos: new THREE.Vector3(7.6, 0.72, 0.0),

  rewardGroup: null,
  lotteryHaloGroup: null,
  lotteryHaloX: 0.0,
  lotteryHaloZ: 3.25,
  rewardArcLine: null,
  rewardArcCurve: null,
  flyingCoins: [],
  stations: [],
  tooltipLayer: null,

  // Modeles simplifies en entiers sur la base des 3 gares (50 % / 35 % / 15 %)
  rewardRates: {
    pow: { total: 10 },
    pos: { total: 4 }
  },

  validatorData: [
    {
      id: 'gare-a',
      name: 'Gare A',
      share: 50,
      weight: 0.50,
      energyPerRound: 3,
      coinsMeshCount: 10,
      buildingScale: 1.08,
      windowCount: 3,
      hasSpire: true,
      hasAnnex: true,
      towerScaleY: 1.06,
      x: 0.0,
      z: 3.25
    },
    {
      id: 'gare-b',
      name: 'Gare B',
      share: 35,
      weight: 0.35,
      energyPerRound: 2,
      coinsMeshCount: 7,
      buildingScale: 0.93,
      windowCount: 3,
      hasSpire: false,
      hasAnnex: false,
      towerScaleY: 1.0,
      x: 3.8,
      z: 3.25
    },
    {
      id: 'gare-c',
      name: 'Gare C',
      share: 15,
      weight: 0.15,
      energyPerRound: 1,
      coinsMeshCount: 3,
      buildingScale: 0.78,
      windowCount: 2,
      hasSpire: false,
      hasAnnex: false,
      towerScaleY: 0.86,
      x: 7.6,
      z: 3.25
    }
  ],

  init(context) {
    this.ctx = context;
    this.resetAllLedgers();
  },

  resetAllLedgers() {
    this.ledgers = {
      pow: [
        { blocksWon: 0, earned: 0, energySpent: 0 },
        { blocksWon: 0, earned: 0, energySpent: 0 },
        { blocksWon: 0, earned: 0, energySpent: 0 }
      ],
      pos: [
        { blocksWon: 0, earned: 0, energySpent: 0 },
        { blocksWon: 0, earned: 0, energySpent: 0 },
        { blocksWon: 0, earned: 0, energySpent: 0 }
      ]
    };
    this.roundsPlayed = { pow: 0, pos: 0 };
    this.lastWinnerByMode = { pow: '', pos: '' };
  },

  resetCurrentModeLedger() {
    this.ledgers[this.mode] = [
      { blocksWon: 0, earned: 0, energySpent: 0 },
      { blocksWon: 0, earned: 0, energySpent: 0 },
      { blocksWon: 0, earned: 0, energySpent: 0 }
    ];
    this.roundsPlayed[this.mode] = 0;
    this.lastWinnerByMode[this.mode] = '';
    this.lastEventText = ['', '', ''];
    this.lastEventTimer = 0;
    this.syncVisualsFromLedger(true);
    this.updateTooltipsDOM();
    this.renderLeftPanel('#s62-roi-board');
  },

  enter() {
    const { trainConvoy, cameraController, environment } = this.ctx;

    this.mode = 'pow';
    this.simState = 'idle';
    this.simTimer = 0;
    this.remainingRounds = 0;
    this.totalBatchRounds = 1;
    this.winnerIndex = 0;
    this.rouletteHighlightIndex = 0;
    this.lastEventText = ['', '', ''];
    this.lastEventTimer = 0;
    this.hasTestedPoW = false;
    this.hasTestedPoS = false;
    this.resetAllLedgers();

    if (cameraController) {
      cameraController.setViewOffset(215);
    }

    // Convoi principal complet en arriere-plan (Genesis #0 + Wagon #1 + Wagon #2 recompense)
    if (environment) {
      environment.setSpeed(4.5);
      if (Array.isArray(environment.passingStations)) {
        environment.passingStations.forEach((st) => {
          st.visible = false;
        });
      }
    }

    if (trainConvoy) {
      trainConvoy.resetConvoy([
        { lot: 'Fret #104', cargaison: "15 tonnes d'acier", quai: 'Quai A -> Quai B' },
        { lot: 'Fret #105', cargaison: 'Composants valides', quai: 'Quai B -> Quai C' }
      ]);
      if (trainConvoy.group) {
        trainConvoy.group.position.x = 0;
      }
      if (trainConvoy.blockchain?.chain) {
        const chain = trainConvoy.blockchain.chain;
        for (let i = 0; i < chain.length; i++) {
          if (i > 0) chain[i].previousHash = chain[i - 1].hash;
          chain[i].mineBlock(1);
        }
        trainConvoy.sync();
      }
      if (cameraController) {
        cameraController.setInteractiveObjects(trainConvoy.getInteractiveObjects());
      }
    }

    this.buildRewardScene();
    this.setupTooltipsLayer();
    this.createTooltips();
    this.syncVisualsFromLedger(true);

    if (cameraController) {
      cameraController.moveTo(this.overviewCamPos, this.overviewCamTarget, 1.15);
    }

    this.startAnimationLoop();
    this.renderLeftPanel();
  },

  exit() {
    this.stopAnimationLoop();
    this.ctx?.cameraController?.cancelTransition();
    this.simState = 'idle';
    this.remainingRounds = 0;

    if (this.ctx?.trainConvoy?.group) {
      this.ctx.trainConvoy.group.position.x = 0;
    }

    if (this.ctx?.environment?.passingStations) {
      this.ctx.environment.passingStations.forEach((st) => {
        st.visible = true;
      });
    }

    if (this.tooltipLayer) {
      this.tooltipLayer.remove();
      this.tooltipLayer = null;
    }

    if (this.rewardGroup && this.ctx?.scene) {
      this.disposeHierarchy(this.rewardGroup);
      this.ctx.scene.remove(this.rewardGroup);
      this.rewardGroup = null;
    }

    this.stations = [];
    this.flyingCoins = [];
    this.rewardArcLine = null;
    this.rewardArcCurve = null;
    this.lotteryHaloGroup = null;

    const panel = document.getElementById('step-panel-left');
    if (panel) {
      const inner = panel.querySelector('.step-panel-inner');
      if (inner) inner.remove();
    }
  },

  disposeHierarchy(root) {
    const disposedGeos = new Set();
    const disposedMats = new Set();
    const disposedTexs = new Set();

    root.traverse((obj) => {
      if (obj.geometry && !disposedGeos.has(obj.geometry)) {
        disposedGeos.add(obj.geometry);
        obj.geometry.dispose();
      }
      if (obj.material) {
        const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
        mats.forEach((mat) => {
          if (!mat || disposedMats.has(mat)) return;
          disposedMats.add(mat);
          if (mat.map && !disposedTexs.has(mat.map)) {
            disposedTexs.add(mat.map);
            mat.map.dispose();
          }
          mat.dispose();
        });
      }
    });
  },

  isBusyState() {
    return this.simState !== 'idle' || this.remainingRounds > 0;
  },

  formatNum(val) {
    const rounded = Math.round(val * 10) / 10;
    if (Math.abs(rounded) < 0.05) return '0';
    return Number.isInteger(rounded)
      ? String(rounded)
      : rounded.toFixed(1).replace('.', ',');
  },

  formatSigned(val) {
    const rounded = Math.round(val * 10) / 10;
    if (Math.abs(rounded) < 0.05) return '0';
    const prefix = rounded > 0 ? '+' : '';
    return `${prefix}${this.formatNum(rounded)}`;
  },

  computeStationMetrics(idx) {
    const cfg = this.validatorData[idx];
    const row = this.ledgers[this.mode][idx];
    const isPoW = this.mode === 'pow';
    const netOps = isPoW ? row.earned - row.energySpent : row.earned;
    return {
      cfg,
      row,
      netOps
    };
  },

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

  createStationSignTexture(title) {
    const canvas = document.createElement('canvas');
    canvas.width = 320;
    canvas.height = 80;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#071324';
    ctx.fillRect(0, 0, 320, 80);

    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 5;
    ctx.strokeRect(4, 4, 312, 72);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 42px "Segoe UI", Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(title.toUpperCase(), 160, 42);

    const tex = new THREE.CanvasTexture(canvas);
    tex.needsUpdate = true;
    return tex;
  },

  createStationBuildingMesh(v, shared, stationMats) {
    const buildingGroup = new THREE.Group();
    buildingGroup.position.set(-0.12, 0.09, -0.82);
    buildingGroup.scale.setScalar(v.buildingScale || 0.92);

    const plinth = new THREE.Mesh(shared.plinthGeo, stationMats.stoneTrimMat);
    plinth.position.set(-0.10, 0.07, 0);
    buildingGroup.add(plinth);

    const mainHall = new THREE.Mesh(shared.mainHallGeo, stationMats.brickMat);
    mainHall.position.set(-0.10, 0.59, 0);
    buildingGroup.add(mainHall);

    const cornice = new THREE.Mesh(shared.corniceGeo, stationMats.stoneTrimMat);
    cornice.position.set(-0.10, 1.08, 0);
    buildingGroup.add(cornice);

    const mainRoof = new THREE.Mesh(shared.roofPrismGeo, stationMats.slateRoofMat);
    mainRoof.position.set(-0.10, 1.32, 0);
    mainRoof.rotation.y = Math.PI / 4;
    mainRoof.scale.set(1.16, 1.0, 0.62);
    buildingGroup.add(mainRoof);

    const windowMat = new THREE.MeshStandardMaterial({
      color: 0xfef08a,
      emissive: 0xf59e0b,
      emissiveIntensity: 1.0,
      roughness: 0.2
    });
    const winXs = v.windowCount === 2 ? [-0.30, 0.10] : [-0.44, -0.10, 0.24];
    winXs.forEach((wx) => {
      const win = new THREE.Mesh(shared.winGeo, windowMat);
      win.position.set(wx, 0.42, 0.31);
      buildingGroup.add(win);
    });

    const canopy = new THREE.Mesh(shared.canopyGeo, stationMats.darkMetalMat);
    canopy.position.set(-0.10, 0.60, 0.28);
    buildingGroup.add(canopy);

    [-0.68, 0.48].forEach((px) => {
      const pillar = new THREE.Mesh(shared.pillarGeo, stationMats.darkMetalMat);
      pillar.position.set(px, 0.30, 0.42);
      buildingGroup.add(pillar);
    });

    const signBack = new THREE.Mesh(shared.signBackGeo, stationMats.darkMetalMat);
    signBack.position.set(-0.10, 0.88, 0.46);
    buildingGroup.add(signBack);

    const signTex = this.createStationSignTexture(v.name);
    const signMesh = new THREE.Mesh(
      shared.signBoardGeo,
      new THREE.MeshBasicMaterial({ map: signTex })
    );
    signMesh.position.set(-0.10, 0.88, 0.485);
    buildingGroup.add(signMesh);

    const tScaleY = v.towerScaleY || 1.0;
    const tower = new THREE.Mesh(shared.towerBodyGeo, stationMats.brickMat);
    tower.scale.y = tScaleY;
    tower.position.set(-0.66, 0.02 + 0.78 * tScaleY, -0.14);
    buildingGroup.add(tower);

    const towerRoofY = 0.22 + 1.56 * tScaleY;
    const towerRoof = new THREE.Mesh(shared.towerRoofGeo, stationMats.slateRoofMat);
    towerRoof.position.set(-0.66, towerRoofY, -0.14);
    towerRoof.rotation.y = Math.PI / 4;
    buildingGroup.add(towerRoof);

    const clockFront = new THREE.Mesh(shared.clockFaceGeo, stationMats.clockMat);
    clockFront.position.set(-0.66, 0.14 + 1.30 * tScaleY, 0.08);
    buildingGroup.add(clockFront);

    if (v.hasSpire) {
      const spire = new THREE.Mesh(
        new THREE.CylinderGeometry(0.012, 0.025, 0.28, 8),
        stationMats.darkMetalMat
      );
      spire.position.set(-0.66, towerRoofY + 0.30, -0.14);
      buildingGroup.add(spire);
    }

    if (v.hasAnnex) {
      const annex = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.56, 0.48), stationMats.brickMat);
      annex.position.set(0.70, 0.28, -0.06);
      buildingGroup.add(annex);

      const annexRoof = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.07, 0.54), stationMats.slateRoofMat);
      annexRoof.position.set(0.70, 0.595, -0.06);
      buildingGroup.add(annexRoof);
    }

    const signalMast = new THREE.Mesh(shared.signalMastGeo, stationMats.darkMetalMat);
    signalMast.position.set(-0.90, 0.56, 0.24);
    buildingGroup.add(signalMast);

    const beaconMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x0284c7,
      emissiveIntensity: 1.6,
      roughness: 0.2
    });
    const beacon = new THREE.Mesh(shared.beaconGeo, beaconMat);
    beacon.position.set(-0.90, 1.12, 0.24);
    buildingGroup.add(beacon);

    return { buildingGroup, beaconMat, windowMat };
  },

  buildRewardScene() {
    const { scene } = this.ctx;
    if (!scene) return;

    if (this.rewardGroup) {
      this.disposeHierarchy(this.rewardGroup);
      scene.remove(this.rewardGroup);
    }

    this.rewardGroup = new THREE.Group();
    this.stations = [];
    this.flyingCoins = [];

    const platformGeo = new THREE.BoxGeometry(3.56, 0.16, 2.68);
    const ringGeo = new THREE.RingGeometry(1.36, 1.48, 36);
    const clockTexture = this.createClockTexture();

    const sharedStationAssets = {
      plinthGeo: new THREE.BoxGeometry(1.38, 0.14, 0.68),
      mainHallGeo: new THREE.BoxGeometry(1.30, 0.90, 0.60),
      corniceGeo: new THREE.BoxGeometry(1.40, 0.06, 0.70),
      roofPrismGeo: new THREE.ConeGeometry(0.96, 0.42, 4),
      winGeo: new THREE.BoxGeometry(0.20, 0.24, 0.03),
      canopyGeo: new THREE.BoxGeometry(1.42, 0.05, 0.34),
      pillarGeo: new THREE.CylinderGeometry(0.024, 0.024, 0.56, 8),
      signBackGeo: new THREE.BoxGeometry(1.32, 0.32, 0.04),
      signBoardGeo: new THREE.PlaneGeometry(1.28, 0.28),
      towerBodyGeo: new THREE.BoxGeometry(0.42, 1.56, 0.42),
      towerRoofGeo: new THREE.ConeGeometry(0.35, 0.46, 4),
      clockFaceGeo: new THREE.CircleGeometry(0.14, 20),
      signalMastGeo: new THREE.CylinderGeometry(0.026, 0.030, 1.12, 8),
      beaconGeo: new THREE.SphereGeometry(0.095, 12, 12)
    };

    const genBaseGeo = new THREE.BoxGeometry(0.68, 0.14, 0.58);
    const genBodyGeo = new THREE.BoxGeometry(0.50, 0.38, 0.42);
    const energyPylonGeo = new THREE.CylinderGeometry(0.10, 0.14, 0.44, 14);
    const sparkGeo = new THREE.SphereGeometry(0.055, 8, 8);
    const stakeCoinGeo = new THREE.CylinderGeometry(0.24, 0.24, 0.08, 18);
    const vaultGlassGeo = new THREE.CylinderGeometry(0.35, 0.35, 1.05, 20, 1, true);

    const chestPadGeo = new THREE.CylinderGeometry(0.38, 0.42, 0.08, 16);
    const chestRimGeo = new THREE.TorusGeometry(0.36, 0.035, 8, 20);
    const rewardCoinGeo = new THREE.CylinderGeometry(0.23, 0.23, 0.065, 18);
    const roiBaseGeo = new THREE.BoxGeometry(0.28, 0.06, 0.28);
    const roiBarGeo = new THREE.BoxGeometry(0.18, 1.0, 0.18);
    roiBarGeo.translate(0, 0.5, 0);

    const flashRingGeo = new THREE.RingGeometry(0.36, 0.50, 28);

    this.validatorData.forEach((v, idx) => {
      const vGroup = new THREE.Group();
      vGroup.position.set(v.x, -0.44, v.z);

      const platformMat = new THREE.MeshStandardMaterial({
        color: 0x1e293b,
        roughness: 0.65,
        metalness: 0.3
      });
      const platform = new THREE.Mesh(platformGeo, platformMat);
      vGroup.add(platform);

      const ringMat = new THREE.MeshBasicMaterial({
        color: 0x38bdf8,
        side: THREE.DoubleSide
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.rotation.x = -Math.PI / 2;
      ring.position.set(0, 0.09, 0.08);
      vGroup.add(ring);

      const stationMats = {
        brickMat: new THREE.MeshStandardMaterial({ color: 0x9a3412, roughness: 0.72 }),
        stoneTrimMat: new THREE.MeshStandardMaterial({ color: 0xcbd5e1, roughness: 0.6 }),
        slateRoofMat: new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.55, flatShading: true }),
        darkMetalMat: new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.75, roughness: 0.3 }),
        clockMat: new THREE.MeshBasicMaterial({ map: clockTexture })
      };

      const { buildingGroup, beaconMat } = this.createStationBuildingMesh(
        v,
        sharedStationAssets,
        stationMats
      );
      vGroup.add(buildingGroup);

      // --- Module gauche (-1.12, 0.52) : Cout electrique (PoW) / Caution protegee (PoS) ---
      const powCostGroup = new THREE.Group();
      powCostGroup.position.set(-1.12, 0.08, 0.52);

      const genBase = new THREE.Mesh(
        genBaseGeo,
        new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.7, metalness: 0.5 })
      );
      genBase.position.y = 0.07;
      powCostGroup.add(genBase);

      const genBody = new THREE.Mesh(
        genBodyGeo,
        new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.55, metalness: 0.6 })
      );
      genBody.position.y = 0.33;
      powCostGroup.add(genBody);

      const energyPylonMat = new THREE.MeshStandardMaterial({
        color: 0xf97316,
        emissive: 0xea580c,
        emissiveIntensity: 0.6,
        roughness: 0.25
      });
      const energyPylon = new THREE.Mesh(energyPylonGeo, energyPylonMat);
      energyPylon.position.y = 0.70;
      powCostGroup.add(energyPylon);

      const energySparks = [];
      for (let s = 0; s < 6; s++) {
        const sparkMat = new THREE.MeshBasicMaterial({
          color: s % 2 === 0 ? 0xfb923c : 0xef4444,
          transparent: true,
          opacity: 0
        });
        const spark = new THREE.Mesh(sparkGeo, sparkMat);
        spark.visible = false;
        spark.userData = {
          phase: (s / 6) * Math.PI * 2,
          offsetX: ((s % 3) - 1) * 0.14,
          offsetZ: (s % 2 === 0 ? 1 : -1) * 0.10
        };
        powCostGroup.add(spark);
        energySparks.push(spark);
      }
      vGroup.add(powCostGroup);

      // Module Caution PoS (pile d'or protegee dans un coffre vitre)
      const posStakeGroup = new THREE.Group();
      posStakeGroup.position.set(-1.12, 0.08, 0.52);

      const stakeCoinMat = new THREE.MeshStandardMaterial({
        color: 0xfacc15,
        emissive: 0xb45309,
        emissiveIntensity: 0.4,
        metalness: 0.85,
        roughness: 0.22
      });
      for (let c = 0; c < v.coinsMeshCount; c++) {
        const coin = new THREE.Mesh(stakeCoinGeo, stakeCoinMat);
        coin.position.set(0, 0.05 + c * 0.085, 0);
        posStakeGroup.add(coin);
      }
      const vaultGlass = new THREE.Mesh(
        vaultGlassGeo,
        new THREE.MeshBasicMaterial({
          color: 0x38bdf8,
          transparent: true,
          opacity: 0.18,
          side: THREE.DoubleSide,
          depthWrite: false
        })
      );
      vaultGlass.position.y = 0.54;
      posStakeGroup.add(vaultGlass);
      vGroup.add(posStakeGroup);

      // --- Module droit (+1.00, 0.52) : Coffre de recompenses et Colonne ROI 3D ---
      const rewardPadGroup = new THREE.Group();
      rewardPadGroup.position.set(0.95, 0.08, 0.52);

      const chestPad = new THREE.Mesh(
        chestPadGeo,
        new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.5, metalness: 0.65 })
      );
      chestPad.position.y = 0.04;
      rewardPadGroup.add(chestPad);

      const chestRimMat = new THREE.MeshStandardMaterial({
        color: 0xfacc15,
        emissive: 0xca8a04,
        emissiveIntensity: 0.4,
        metalness: 0.75,
        roughness: 0.25
      });
      const chestRim = new THREE.Mesh(chestRimGeo, chestRimMat);
      chestRim.rotation.x = Math.PI / 2;
      chestRim.position.y = 0.08;
      rewardPadGroup.add(chestRim);

      const rewardCoinMat = new THREE.MeshStandardMaterial({
        color: 0xfde047,
        emissive: 0xeab308,
        emissiveIntensity: 0.55,
        metalness: 0.88,
        roughness: 0.18
      });
      const rewardCoins = [];
      for (let c = 0; c < 18; c++) {
        const coin = new THREE.Mesh(rewardCoinGeo, rewardCoinMat);
        coin.position.set(0, 0.11 + c * 0.072, 0);
        coin.visible = false;
        rewardPadGroup.add(coin);
        rewardCoins.push(coin);
      }

      const flashMat = new THREE.MeshBasicMaterial({
        color: 0xfde047,
        transparent: true,
        opacity: 0,
        side: THREE.DoubleSide
      });
      const rewardFlashRing = new THREE.Mesh(flashRingGeo, flashMat);
      rewardFlashRing.rotation.x = -Math.PI / 2;
      rewardFlashRing.position.y = 0.11;
      rewardFlashRing.visible = false;
      rewardPadGroup.add(rewardFlashRing);

      // Barre verticale ROI 3D juste a droite du coffre (+0.48 en X)
      const roiBase = new THREE.Mesh(
        roiBaseGeo,
        new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.6, metalness: 0.5 })
      );
      roiBase.position.set(0.50, 0.03, 0);
      rewardPadGroup.add(roiBase);

      const roiBarMat = new THREE.MeshStandardMaterial({
        color: 0xf59e0b,
        emissive: 0xd97706,
        emissiveIntensity: 0.5,
        roughness: 0.3
      });
      const roiBarMesh = new THREE.Mesh(roiBarGeo, roiBarMat);
      roiBarMesh.position.set(0.50, 0.06, 0);
      roiBarMesh.scale.y = 0.15;
      rewardPadGroup.add(roiBarMesh);

      vGroup.add(rewardPadGroup);
      this.rewardGroup.add(vGroup);

      this.stations.push({
        index: idx,
        data: v,
        group: vGroup,
        ringMat,
        beaconMat,
        powCostGroup,
        posStakeGroup,
        energyPylonMat,
        energySparks,
        rewardCoins,
        rewardFlashRing,
        rewardFlashAlpha: 0,
        roiBarMesh,
        roiBarMat,
        currentRoiHeight: 0.15,
        targetRoiHeight: 0.15,
        chestWorldPos: new THREE.Vector3(v.x + 0.95, -0.44 + 0.24, v.z + 0.52)
      });
    });

    // Halo doré PoS réutilisé entre les 3 gares
    this.lotteryHaloGroup = new THREE.Group();
    const haloRing = new THREE.Mesh(
      new THREE.RingGeometry(1.38, 1.52, 36),
      new THREE.MeshBasicMaterial({
        color: 0xfacc15,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.9
      })
    );
    haloRing.rotation.x = -Math.PI / 2;
    this.lotteryHaloGroup.add(haloRing);

    const haloBeam = new THREE.Mesh(
      new THREE.CylinderGeometry(1.38, 1.38, 1.85, 28, 1, true),
      new THREE.MeshBasicMaterial({
        color: 0xfacc15,
        transparent: true,
        opacity: 0.16,
        side: THREE.DoubleSide,
        depthWrite: false
      })
    );
    haloBeam.position.y = 0.92;
    this.lotteryHaloGroup.add(haloBeam);
    this.lotteryHaloGroup.visible = false;
    this.rewardGroup.add(this.lotteryHaloGroup);

    // Arc lumineux et pool de 5 pièces d'or volantes (Wagon #2 -> Coffre gagnant)
    const arcGeo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(1, 1, 1)
    ]);
    this.rewardArcLine = new THREE.Line(
      arcGeo,
      new THREE.LineBasicMaterial({ color: 0xfde047, transparent: true, opacity: 0.85 })
    );
    this.rewardArcLine.visible = false;
    this.rewardGroup.add(this.rewardArcLine);

    const flyingCoinGeo = new THREE.CylinderGeometry(0.18, 0.18, 0.06, 18);
    const flyingCoinMat = new THREE.MeshStandardMaterial({
      color: 0xfde047,
      emissive: 0xf59e0b,
      emissiveIntensity: 0.95,
      metalness: 0.9,
      roughness: 0.15
    });
    for (let i = 0; i < 5; i++) {
      const mesh = new THREE.Mesh(flyingCoinGeo, flyingCoinMat);
      mesh.visible = false;
      this.rewardGroup.add(mesh);
      this.flyingCoins.push({ mesh, delay: i * 0.1 });
    }

    scene.add(this.rewardGroup);
  },

  setupTooltipsLayer() {
    const hud = document.getElementById('hud');
    if (!hud) return;

    if (!this.tooltipLayer) {
      this.tooltipLayer = document.createElement('div');
      this.tooltipLayer.id = 'step62-tooltips-layer';
      this.tooltipLayer.className = 'scene-tooltips-layer';
      hud.appendChild(this.tooltipLayer);
    }
    this.tooltipLayer.innerHTML = '';
  },

  createTooltips() {
    if (!this.tooltipLayer) return;

    const svgLinesHTML = this.validatorData
      .map(
        (_, idx) => `
        <line id="s62-line-${idx}" stroke="#38bdf8" stroke-width="2" stroke-linecap="round" opacity="0.85" />
        <circle id="s62-dot-out-${idx}" r="6.5" fill="none" stroke="#38bdf8" stroke-width="1.5" opacity="0.8" />
        <circle id="s62-dot-in-${idx}" r="3" fill="#38bdf8" />
      `
      )
      .join('');

    const wagonSvgHTML = `
      <line id="s62-line-wagon" stroke="#10b981" stroke-width="2" stroke-linecap="round" opacity="0.9" />
      <circle id="s62-dot-out-wagon" r="6.5" fill="none" stroke="#10b981" stroke-width="1.5" opacity="0.85" />
      <circle id="s62-dot-in-wagon" r="3" fill="#10b981" />
    `;

    const pillsHTML = this.validatorData
      .map(
        (v, idx) => `
        <div id="tooltip-s62-${idx}" class="scene-tooltip" style="--spot-color: #38bdf8; z-index: 12;">
          <button type="button" class="scene-tooltip-pill">
            <span class="scene-tooltip-dot"></span>
            <span class="scene-tooltip-label">
              <strong>${v.name}</strong> · <span id="s62-pill-status-${idx}" style="color: #cbd5e1;">Prête</span>
            </span>
          </button>
        </div>
      `
      )
      .join('');

    const wagonPillHTML = `
      <div id="tooltip-s62-wagon" class="scene-tooltip" style="--spot-color: #10b981; z-index: 12;">
        <button type="button" class="scene-tooltip-pill">
          <span class="scene-tooltip-dot"></span>
          <span class="scene-tooltip-label">
            <strong>Wagon validé</strong> · <span id="s62-wagon-status" style="color: #6ee7b7;">Récompense : +10 jetons</span>
          </span>
        </button>
      </div>
    `;

    this.tooltipLayer.innerHTML = `
      <svg id="step62-tooltips-svg" style="position: absolute; inset: 0; width: 100%; height: 100%; pointer-events: none; overflow: visible; z-index: 10;">
        ${svgLinesHTML}
        ${wagonSvgHTML}
      </svg>
      ${pillsHTML}
      ${wagonPillHTML}
    `;

    this.validatorData.forEach((_, idx) => {
      document.getElementById(`tooltip-s62-${idx}`)?.addEventListener('pointerdown', (e) => e.stopPropagation());
    });
    document.getElementById('tooltip-s62-wagon')?.addEventListener('pointerdown', (e) => e.stopPropagation());

    this.updateTooltipsDOM();
  },

  setMode(targetMode) {
    if (this.isBusyState() || this.mode === targetMode) return;
    this.mode = targetMode;
    this.lastEventText = ['', '', ''];
    this.lastEventTimer = 0;

    if (this.lotteryHaloGroup) {
      this.lotteryHaloGroup.visible = false;
    }

    this.syncVisualsFromLedger(true);
    this.updateTooltipsDOM();
    this.renderLeftPanel();
  },

  pickWeightedWinner() {
    const r = Math.random() * 100;
    if (r < 50) return 0;
    if (r < 85) return 1;
    return 2;
  },

  runSimRounds(count) {
    if (this.isBusyState()) return;
    this.totalBatchRounds = count;
    this.remainingRounds = count;
    this.startSingleRound();
  },

  startSingleRound() {
    const isPoW = this.mode === 'pow';
    const isFast = this.totalBatchRounds > 1;
    this.spendDuration = isFast ? 0.32 : 0.72;
    this.rewardDuration = isFast ? 0.56 : 1.05;

    this.winnerIndex = this.pickWeightedWinner();
    this.simState = 'spending';
    this.simTimer = 0;

    if (isPoW) {
      this.hasTestedPoW = true;
      this.validatorData.forEach((v, idx) => {
        this.ledgers.pow[idx].energySpent += v.energyPerRound;
        this.lastEventText[idx] = 'Paie l\'électricité';
        this.lastEventColor[idx] = '#fca5a5';
      });
    } else {
      this.hasTestedPoS = true;
      this.rouletteHighlightIndex = (this.winnerIndex + 1) % 3;
      this.lotteryHaloX = this.validatorData[this.rouletteHighlightIndex].x;
      this.lotteryHaloZ = this.validatorData[this.rouletteHighlightIndex].z;
      this.lastEventText = ['Caution intacte', 'Caution intacte', 'Caution intacte'];
      this.lastEventColor = ['#94a3b8', '#94a3b8', '#94a3b8'];
    }

    this.lastEventTimer = 1.4;
    this.syncVisualsFromLedger(false);
    this.updateTooltipsDOM();
    this.updateRoiCardsDOM();
    this.renderLeftPanel();
  },

  prepareRewardArc(winIdx) {
    const winStation = this.stations[winIdx];
    if (!winStation || !this.rewardArcLine) return;

    const start = this.rewardSourcePos.clone();
    const end = winStation.chestWorldPos.clone();
    const mid = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);
    mid.y += 1.55;

    this.rewardArcCurve = new THREE.QuadraticBezierCurve3(start, mid, end);
    const pts = this.rewardArcCurve.getPoints(28);
    this.rewardArcLine.geometry.dispose();
    this.rewardArcLine.geometry = new THREE.BufferGeometry().setFromPoints(pts);
    this.rewardArcLine.visible = true;
  },

  finalizeSingleRoundReward() {
    const rewardAmount = this.rewardRates[this.mode].total;
    const row = this.ledgers[this.mode][this.winnerIndex];
    row.blocksWon += 1;
    row.earned += rewardAmount;
    this.roundsPlayed[this.mode] += 1;
    this.lastWinnerByMode[this.mode] = this.validatorData[this.winnerIndex].name;

    const winStation = this.stations[this.winnerIndex];
    if (winStation) {
      winStation.rewardFlashAlpha = 1.0;
    }

    this.lastEventText[this.winnerIndex] = `+${rewardAmount} jetons !`;
    this.lastEventColor[this.winnerIndex] = '#fde047';
    this.lastEventTimer = 1.8;

    this.syncVisualsFromLedger(false);
    this.updateTooltipsDOM();
    this.updateRoiCardsDOM();
  },

  syncVisualsFromLedger(snapBarHeight = false) {
    const isPoW = this.mode === 'pow';

    this.stations.forEach((st, idx) => {
      st.powCostGroup.visible = isPoW;
      st.posStakeGroup.visible = !isPoW;

      const { netOps, row } = this.computeStationMetrics(idx);

      // Pool de pieces d'or pre-allouees (jusqu'a 18 pieces)
      const visibleCoins = Math.min(18, Math.floor(row.earned / 2));
      st.rewardCoins.forEach((coin, cIdx) => {
        coin.visible = cIdx < visibleCoins;
      });

      // Hauteur cible de la colonne 3D pilotee directement par le solde net
      const norm = Math.max(0, netOps) / 24;
      st.targetRoiHeight = Math.min(1.45, Math.max(0.14, 0.18 + norm * 1.15));
      if (snapBarHeight) {
        st.currentRoiHeight = st.targetRoiHeight;
        st.roiBarMesh.scale.y = st.currentRoiHeight;
      }

      if (netOps > 0) {
        st.roiBarMat.color.setHex(0x10b981);
        st.roiBarMat.emissive.setHex(0x059669);
      } else if (netOps < 0) {
        st.roiBarMat.color.setHex(0xef4444);
        st.roiBarMat.emissive.setHex(0xdc2626);
      } else {
        st.roiBarMat.color.setHex(0xf59e0b);
        st.roiBarMat.emissive.setHex(0xb45309);
      }

      // Couleur anneau + balise de gare
      let ringColor = 0x38bdf8;
      if (this.simState === 'spending') {
        ringColor = isPoW ? 0xf97316 : idx === this.rouletteHighlightIndex ? 0xfacc15 : 0x38bdf8;
      } else if (this.simState === 'rewarding') {
        ringColor = idx === this.winnerIndex ? 0x10b981 : isPoW ? 0xef4444 : 0x475569;
      } else if (this.roundsPlayed[this.mode] > 0) {
        ringColor = netOps > 0 ? 0x10b981 : netOps < 0 ? 0xef4444 : 0x38bdf8;
      }

      st.ringMat.color.setHex(ringColor);
      st.beaconMat.color.setHex(ringColor);
      st.beaconMat.emissive.setHex(ringColor);
    });

    if (this.lotteryHaloGroup) {
      const showHalo = !isPoW && (this.simState === 'spending' || this.simState === 'rewarding');
      this.lotteryHaloGroup.visible = showHalo;
      if (showHalo) {
        const haloColor = this.simState === 'spending' ? 0xfacc15 : 0x10b981;
        this.lotteryHaloGroup.children.forEach((child) => {
          child.material?.color?.setHex(haloColor);
        });
      }
    }
  },

  updateTooltipsDOM() {
    const isPoW = this.mode === 'pow';
    const rewardAmount = this.rewardRates[this.mode].total;
    const rounds = this.roundsPlayed[this.mode];

    this.validatorData.forEach((_, idx) => {
      const statusEl = document.getElementById(`s62-pill-status-${idx}`);
      const pillWrap = document.getElementById(`tooltip-s62-${idx}`);
      const lineEl = document.getElementById(`s62-line-${idx}`);
      const dotInEl = document.getElementById(`s62-dot-in-${idx}`);
      const dotOutEl = document.getElementById(`s62-dot-out-${idx}`);

      const { netOps } = this.computeStationMetrics(idx);

      let spotColor = '#38bdf8';
      let labelText = '';
      let textColor = '#cbd5e1';

      if (this.simState === 'spending') {
        if (isPoW) {
          spotColor = '#f97316';
          labelText = "Paie l'électricité";
          textColor = '#fca5a5';
        } else if (idx === this.rouletteHighlightIndex) {
          spotColor = '#facc15';
          labelText = 'Tirage...';
          textColor = '#fde047';
        } else {
          spotColor = '#38bdf8';
          labelText = 'Caution intacte';
          textColor = '#94a3b8';
        }
      } else if (this.simState === 'rewarding' && idx === this.winnerIndex) {
        spotColor = '#10b981';
        labelText = `+${rewardAmount} jetons !`;
        textColor = '#fde047';
      } else if (rounds === 0) {
        spotColor = '#38bdf8';
        labelText = isPoW ? 'Prête' : 'Caution intacte';
        textColor = '#cbd5e1';
      } else if (isPoW) {
        if (netOps > 0) {
          spotColor = '#10b981';
          labelText = `Bénéfice (+${netOps})`;
          textColor = '#34d399';
        } else if (netOps < 0) {
          spotColor = '#ef4444';
          labelText = `En perte (${netOps})`;
          textColor = '#fca5a5';
        } else {
          spotColor = '#f59e0b';
          labelText = 'Équilibre (0)';
          textColor = '#fde68a';
        }
      } else {
        if (netOps > 0) {
          spotColor = '#10b981';
          labelText = `+${netOps} jetons`;
          textColor = '#34d399';
        } else {
          spotColor = '#38bdf8';
          labelText = 'Caution intacte';
          textColor = '#cbd5e1';
        }
      }

      if (statusEl) {
        statusEl.textContent = labelText;
        statusEl.style.color = textColor;
      }
      if (pillWrap) pillWrap.style.setProperty('--spot-color', spotColor);
      if (lineEl) lineEl.setAttribute('stroke', spotColor);
      if (dotInEl) dotInEl.setAttribute('fill', spotColor);
      if (dotOutEl) dotOutEl.setAttribute('stroke', spotColor);
    });

    const wagonStatusEl = document.getElementById('s62-wagon-status');
    if (wagonStatusEl) {
      wagonStatusEl.textContent = `Récompense : +${rewardAmount} jetons`;
    }
  },

  buildRoiCardsHTML() {
    const isPoW = this.mode === 'pow';
    const rounds = this.roundsPlayed[this.mode];

    return this.validatorData
      .map((_, idx) => {
        const { cfg, netOps } = this.computeStationMetrics(idx);

        let statusText = '';
        let statusClass = 'roi-val-warn';
        let barColor = '#38bdf8';
        let barWidth = 0;

        if (isPoW) {
          if (rounds === 0) {
            statusText = 'En attente';
            statusClass = '';
            barColor = '#38bdf8';
            barWidth = 0;
          } else if (netOps > 0) {
            statusText = `Rentable (+${netOps} jetons)`;
            statusClass = 'roi-val-pos';
            barColor = '#10b981';
            barWidth = Math.min(100, Math.max(16, Math.round((netOps / 20) * 100)));
          } else if (netOps < 0) {
            statusText = `En perte (${netOps} jetons)`;
            statusClass = 'roi-val-neg';
            barColor = '#ef4444';
            barWidth = 14;
          } else {
            statusText = "À l'équilibre";
            statusClass = 'roi-val-warn';
            barColor = '#f59e0b';
            barWidth = 8;
          }
        } else {
          if (netOps > 0) {
            statusText = `+${netOps} jetons gagnés`;
            statusClass = 'roi-val-pos';
            barColor = '#10b981';
            barWidth = Math.min(100, Math.max(16, Math.round((netOps / 16) * 100)));
          } else {
            statusText = 'Caution intacte (0 perte)';
            statusClass = '';
            barColor = '#38bdf8';
            barWidth = 0;
          }
        }

        return `
          <div class="roi-station-card" data-roi-idx="${idx}">
            <div class="roi-station-head">
              <span><strong>${cfg.name}</strong></span>
              <span class="${statusClass}">${statusText}</span>
            </div>
            <div class="roi-bar-track">
              <div class="roi-bar-fill" style="width: ${barWidth}%; background: ${barColor};"></div>
            </div>
          </div>
        `;
      })
      .join('');
  },

  buildSummaryHTML() {
    const rounds = this.roundsPlayed[this.mode];
    const winnerName = this.lastWinnerByMode[this.mode];
    if (rounds === 0 || !winnerName) return '';

    const isPoW = this.mode === 'pow';
    const text = isPoW
      ? `La dernière récompense revient à la <strong>${winnerName}</strong>. Sur la durée, seules les gares qui gagnent assez compensent leur facture d'électricité.`
      : `La dernière récompense revient à la <strong>${winnerName}</strong>. Même sans gagner à chaque tour, aucune gare ne perd d'argent.`;

    return `
      <div class="consensus-result-card ${isPoW ? 'pow-result' : 'pos-result'}">
        <p class="consensus-result-text">${text}</p>
      </div>
    `;
  },

  updateRoiCardsDOM() {
    const board = document.getElementById('s62-roi-board');
    if (board) {
      board.innerHTML = this.buildRoiCardsHTML();
    }
    const summaryBox = document.getElementById('s62-summary-box');
    if (summaryBox) {
      summaryBox.innerHTML = this.buildSummaryHTML();
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
      const elapsed = now * 0.001;
      const { camera } = this.ctx;
      const isPoW = this.mode === 'pow';

      if (this.lastEventTimer > 0) {
        this.lastEventTimer = Math.max(0, this.lastEventTimer - dt);
        if (this.lastEventTimer === 0) {
          this.updateTooltipsDOM();
        }
      }

      // 1. Etat SPENDING : depense electrique (PoW) ou tirage au sort protege (PoS)
      if (this.simState === 'spending') {
        this.simTimer += dt;
        const p = Math.min(1, this.simTimer / this.spendDuration);

        if (isPoW) {
          this.stations.forEach((st) => {
            st.energyPylonMat.emissiveIntensity = 1.6 + Math.sin(elapsed * 18) * 0.6;
            st.energySparks.forEach((spark) => {
              const sp = (p * 1.8 + spark.userData.phase / (Math.PI * 2)) % 1;
              spark.visible = true;
              spark.position.set(
                spark.userData.offsetX,
                0.78 + sp * 0.95,
                spark.userData.offsetZ
              );
              spark.material.opacity = Math.sin(sp * Math.PI) * 0.95;
            });
          });
        } else {
          const sweepIdx = p < 0.72 ? Math.floor((p * 10) % 3) : this.winnerIndex;
          if (sweepIdx !== this.rouletteHighlightIndex) {
            this.rouletteHighlightIndex = sweepIdx;
            this.syncVisualsFromLedger(false);
            this.updateTooltipsDOM();
          }
        }

        if (p >= 1.0) {
          this.stations.forEach((st) => {
            st.energyPylonMat.emissiveIntensity = 0.6;
            st.energySparks.forEach((spark) => {
              spark.visible = false;
              spark.material.opacity = 0;
            });
          });
          this.rouletteHighlightIndex = this.winnerIndex;
          this.simState = 'rewarding';
          this.simTimer = 0;
          this.prepareRewardArc(this.winnerIndex);
          this.syncVisualsFromLedger(false);
          this.updateTooltipsDOM();
        }
      }

      // 2. Etat REWARDING : pluie de pieces dorées le long de la courbe jusqu'au coffre gagnant
      if (this.simState === 'rewarding') {
        this.simTimer += dt;
        const p = Math.min(1, this.simTimer / this.rewardDuration);

        if (this.rewardArcCurve) {
          this.flyingCoins.forEach((fc) => {
            const t = Math.max(0, Math.min(1, (p - fc.delay) / 0.62));
            if (t > 0 && t < 1) {
              fc.mesh.visible = true;
              this.rewardArcCurve.getPoint(t, fc.mesh.position);
              fc.mesh.rotation.x = elapsed * 6;
              fc.mesh.rotation.z = elapsed * 4;
            } else {
              fc.mesh.visible = false;
            }
          });
        }

        if (p >= 1.0) {
          this.flyingCoins.forEach((fc) => {
            fc.mesh.visible = false;
          });
          if (this.rewardArcLine) {
            this.rewardArcLine.visible = false;
          }

          this.finalizeSingleRoundReward();
          this.remainingRounds = Math.max(0, this.remainingRounds - 1);

          if (this.remainingRounds > 0) {
            this.startSingleRound();
          } else {
            this.simState = 'idle';
            this.syncVisualsFromLedger(false);
            this.updateTooltipsDOM();
            this.renderLeftPanel('#s62-roi-board');
          }
        }
      }

      // 3. Animations continues : barres ROI 3D en douceur, halo PoS et flash recompense
      this.stations.forEach((st) => {
        st.currentRoiHeight = THREE.MathUtils.lerp(
          st.currentRoiHeight,
          st.targetRoiHeight,
          Math.min(1, dt * 7.5)
        );
        st.roiBarMesh.scale.y = st.currentRoiHeight;

        if (st.rewardFlashAlpha > 0.01) {
          st.rewardFlashAlpha = Math.max(0, st.rewardFlashAlpha - dt * 1.8);
          st.rewardFlashRing.visible = true;
          st.rewardFlashRing.scale.setScalar(1.0 + (1.0 - st.rewardFlashAlpha) * 1.8);
          st.rewardFlashRing.material.opacity = st.rewardFlashAlpha * 0.9;
        } else {
          st.rewardFlashRing.visible = false;
        }
      });

      if (this.lotteryHaloGroup && this.lotteryHaloGroup.visible) {
        const targetIdx = this.simState === 'spending' ? this.rouletteHighlightIndex : this.winnerIndex;
        const targetV = this.validatorData[targetIdx];
        this.lotteryHaloX = THREE.MathUtils.lerp(this.lotteryHaloX, targetV.x, Math.min(1, dt * 16));
        this.lotteryHaloZ = THREE.MathUtils.lerp(this.lotteryHaloZ, targetV.z, Math.min(1, dt * 16));
        this.lotteryHaloGroup.position.set(this.lotteryHaloX, -0.34, this.lotteryHaloZ + 0.08);
        this.lotteryHaloGroup.rotation.y += dt * 1.8;
      }

      // 4. Projection 2D des infobulles SVG
      if (this.tooltipLayer && camera && this.stations.length === 3) {
        const width = window.innerWidth;
        const height = window.innerHeight;
        const toX = (v) => (v.x * 0.5 + 0.5) * width;
        const toY = (v) => (-v.y * 0.5 + 0.5) * height;

        const pts = this.stations.map((st) => {
          const topY = -0.44 + 0.09 + 1.98 * (st.data.buildingScale || 0.92);
          const worldP = new THREE.Vector3(st.data.x - 0.12, topY, st.data.z - 0.82);
          const pr = worldP.project(camera);
          return { x: toX(pr), y: toY(pr), behind: pr.z > 1 };
        });

        const wagonPr = this.rewardSourcePos.clone().add(new THREE.Vector3(0, 0.35, 0)).project(camera);
        const wagonPt = { x: toX(wagonPr), y: toY(wagonPr), behind: wagonPr.z > 1 };

        const setElVisible = (id, show) => {
          const node = document.getElementById(id);
          if (node) node.style.display = show ? '' : 'none';
        };

        this.tooltipLayer.style.opacity = '1';
        this.tooltipLayer.style.visibility = 'visible';

        const showWagon = !wagonPt.behind && !(width > 768 && wagonPt.x < 400);
        setElVisible('tooltip-s62-wagon', showWagon);
        setElVisible('s62-line-wagon', showWagon);
        setElVisible('s62-dot-in-wagon', showWagon);
        setElVisible('s62-dot-out-wagon', showWagon);

        if (showWagon) {
          const wPillX = Math.max(475, Math.min(width - 155, wagonPt.x - 30));
          const wPillY = Math.max(38, wagonPt.y - 54);
          const elWagon = document.getElementById('tooltip-s62-wagon');
          if (elWagon) {
            elWagon.style.transform = `translate3d(${wPillX.toFixed(1)}px, ${wPillY.toFixed(1)}px, 0) translate(-50%, -50%)`;
          }
          setLineAndDot(
            's62-line-wagon',
            's62-dot-in-wagon',
            's62-dot-out-wagon',
            wPillX,
            wPillY + 14,
            wagonPt.x,
            wagonPt.y
          );
        }

        const minX = 475;
        const maxX = Math.max(minX + 300, width - 155);
        const minGap = Math.min(185, (maxX - minX) / 2);
        const pillX0 = Math.max(minX, Math.min(maxX - minGap * 2, pts[0].x));
        const pillX1 = Math.max(pillX0 + minGap, Math.min(maxX - minGap, pts[1].x));
        const pillX2 = Math.max(pillX1 + minGap, Math.min(maxX, pts[2].x));
        const pillXs = [pillX0, pillX1, pillX2];

        pts.forEach((pt, idx) => {
          const showSt = !pt.behind && !(width > 768 && pt.x < 400);
          setElVisible(`tooltip-s62-${idx}`, showSt);
          setElVisible(`s62-line-${idx}`, showSt);
          setElVisible(`s62-dot-in-${idx}`, showSt);
          setElVisible(`s62-dot-out-${idx}`, showSt);
          if (!showSt) return;

          const px = pillXs[idx];
          const py = pt.y - 34;
          const el = document.getElementById(`tooltip-s62-${idx}`);
          if (el) {
            el.style.transform = `translate3d(${px.toFixed(1)}px, ${py.toFixed(1)}px, 0) translate(-50%, -50%)`;
          }
          setLineAndDot(
            `s62-line-${idx}`,
            `s62-dot-in-${idx}`,
            `s62-dot-out-${idx}`,
            px,
            py + 14,
            pt.x,
            pt.y
          );
        });
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

  renderLeftPanel(scrollTargetSelector = null) {
    const panel = document.getElementById('step-panel-left');
    if (!panel) return;

    panel.classList.add('active');

    const inner = document.createElement('div');
    inner.className = 'step-panel-inner';

    const isPoW = this.mode === 'pow';
    const isBusy = this.isBusyState();
    const rounds = this.roundsPlayed[this.mode];

    const formulaHTML = isPoW
      ? `
        <div class="roi-formula-banner pow-banner">
          La gagnante reçoit <strong>+10 jetons</strong>, mais les 3 gares paient leur électricité à chaque tour : celles qui perdent ont dépensé pour rien.
        </div>
      `
      : `
        <div class="roi-formula-banner pos-banner">
          La gare tirée au sort reçoit <strong>+4 jetons</strong>. Aucune électricité n'est gaspillée : les autres gardent leur caution intacte sans rien perdre.
        </div>
      `;

    inner.innerHTML = `
      <header class="step-panel-header">
        <h2 class="step-panel-title">Récompenses des gares</h2>
        <div class="substep-stepper" role="navigation" aria-label="Sous-étapes du consensus">
          <button type="button" id="btn-s62-sub-61" class="substep-pill" ${isBusy ? 'disabled' : ''}>
            <span class="substep-num">6.1</span>
            <span>Consensus</span>
          </button>
          <button type="button" class="substep-pill active">
            <span class="substep-num">6.2</span>
            <span>Récompenses</span>
          </button>
        </div>
      </header>

      <div class="step-panel-scroll">
        <article class="step-card context-card animate-fade">
          <h3 class="card-title">Comment les gares rentabilisent-elles leur travail ?</h3>
          <div class="share-meaning-banner" style="margin-top: 2px; margin-bottom: 8px;">
            À chaque wagon validé (en PoW comme en PoS), le réseau verse automatiquement une <strong>récompense en jetons</strong> à la gare gagnante.
          </div>
          <p>
            C'est le principe du <strong>retour sur investissement</strong> : ces récompenses doivent compenser ce que la gare a engagé au départ — ses machines et son électricité en PoW, ou la caution qu'elle a déposée en PoS.
          </p>
        </article>

        <article class="step-card action-card animate-fade">
          <div class="difficulty-selector-row" role="tablist" aria-label="Choix du modèle économique">
            <button id="btn-s62-tab-pow" class="btn-diff-option ${isPoW ? 'active' : ''}" role="tab" aria-selected="${isPoW}" ${isBusy ? 'disabled' : ''}>
              <span>PoW (Électricité)</span>
            </button>
            <button id="btn-s62-tab-pos" class="btn-diff-option ${!isPoW ? 'active' : ''}" role="tab" aria-selected="${!isPoW}" ${isBusy ? 'disabled' : ''}>
              <span>PoS (Caution)</span>
            </button>
          </div>

          ${formulaHTML}

          <div class="roi-action-row">
            <button id="btn-step62-run-1" class="btn-panel-primary" ${isBusy ? 'disabled' : ''}>
              <span>Valider 1 wagon</span>
            </button>
            <button id="btn-step62-run-5" class="btn-panel-primary btn-action-highlight" ${isBusy ? 'disabled' : ''}>
              <span>Simuler 5 wagons</span>
            </button>
          </div>

          <div class="roi-board-header">
            <span>Bilan des 3 gares</span>
            ${rounds > 0 ? `<button type="button" id="btn-step62-reset" class="roi-reset-link" ${isBusy ? 'disabled' : ''}>Réinitialiser</button>` : ''}
          </div>

          <div id="s62-roi-board" class="roi-station-list">
            ${this.buildRoiCardsHTML()}
          </div>

          <div id="s62-summary-box">${this.buildSummaryHTML()}</div>
        </article>

        ${(this.hasTestedPoW || this.hasTestedPoS) ? `
          <article class="step-card keypoint-card animate-fade">
            <h4 class="card-title keypoint-title">Point clé : La récompense finance la sécurité sans chef</h4>
            <p class="keypoint-text">
              La récompense motive les gares à sécuriser le réseau sans chef central. En PoW, la course électrique coûte cher aux perdantes ; en PoS, les gains sont plus modestes mais sans perte d'énergie.
            </p>
          </article>
        ` : ''}

        <nav class="step-nav-bar animate-fade">
          <button id="btn-step62-action-prev" class="btn-panel-ghost">
            <span class="btn-arrow">&larr;</span>
            <span>Étape 6.1 : Consensus</span>
          </button>
          <button id="btn-step62-action-next" class="btn-panel-primary">
            <span>Étape 7 : Attaque 51 %</span>
            <span class="btn-arrow">&rarr;</span>
          </button>
        </nav>
      </div>
    `;

    updateLeftPanelPreserveScroll(panel, inner, scrollTargetSelector);
    this.setupEvents();
  },

  setupEvents() {
    document.getElementById('btn-s62-sub-61')?.addEventListener('click', () => {
      if (!this.isBusyState() && typeof this.ctx.onGoToStep === 'function') {
        this.ctx.onGoToStep('6');
      }
    });

    document.getElementById('btn-s62-tab-pow')?.addEventListener('click', () => {
      this.setMode('pow');
    });

    document.getElementById('btn-s62-tab-pos')?.addEventListener('click', () => {
      this.setMode('pos');
    });

    document.getElementById('btn-step62-run-1')?.addEventListener('click', () => {
      this.runSimRounds(1);
    });

    document.getElementById('btn-step62-run-5')?.addEventListener('click', () => {
      this.runSimRounds(5);
    });

    document.getElementById('btn-step62-reset')?.addEventListener('click', () => {
      if (!this.isBusyState()) {
        this.resetCurrentModeLedger();
      }
    });

    document.getElementById('btn-step62-action-prev')?.addEventListener('click', () => {
      if (typeof this.ctx.onPrevStep === 'function') {
        this.ctx.onPrevStep();
      }
    });

    document.getElementById('btn-step62-action-next')?.addEventListener('click', () => {
      if (typeof this.ctx.onNextStep === 'function') {
        this.ctx.onNextStep();
      }
    });
  }
};
