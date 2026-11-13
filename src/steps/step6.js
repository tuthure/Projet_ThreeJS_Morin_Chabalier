import * as THREE from 'three';
import { Block } from '../blockchain/Block.js';
import { WagonMesh } from '../three/WagonMesh.js';
import { updateLeftPanelPreserveScroll } from './StepManager.js';

/**
 * Etape 6 : Comparaison des consensus (PoW vs PoS).
 * Mise en scene 3D en 3 temps avec 3 gares (Gare A, Gare B, Gare C),
 * leurs quais de chargement (caisses colorees), leurs wagons candidats
 * et le raccordement du wagon gagnant au train principal en circulation.
 */
export const step6 = {
  id: 6,
  title: 'Consensus : PoW vs PoS',
  ctx: null,

  rafId: null,
  mode: 'pow', // 'pow' | 'pos'

  // Etats : 'idle' | 'pow_loading' | 'pow_racing' | 'pow_verdict' | 'pow_fade_losers' | 'pow_coupling' | 'pos_lottery' | 'pos_selected' | 'pos_zoom_in' | 'pos_loading' | 'pos_zoom_out' | 'pos_coupling' | 'done'
  simState: 'idle',
  simTimer: 0,
  winnerIndex: 0,
  rouletteHighlightIndex: 0,
  lotteryCursorPercent: 25,
  lotteryTargetPercent: 25,
  lotteryStartPercent: 12,
  hasTestedPoW: false,
  hasTestedPoS: false,
  posSealedInCloseUp: false,

  roundCounter: 0,
  winningNonce: 18,
  winningHash: '00e4a1...',
  powTickAccum: 0,

  overviewCamPos: new THREE.Vector3(3.8, 4.55, 12.45),
  overviewCamTarget: new THREE.Vector3(3.8, 0.32, 1.85),
  coupledTargetPos: new THREE.Vector3(7.6, 0.0, 0.0),
  sidingScale: 0.48,
  wasCoupled: false,
  couplerFlashRing: null,
  couplerFlashAlpha: 0,

  consensusGroup: null,
  lotteryHaloGroup: null,
  lotteryHaloX: 0.0,
  lotteryHaloZ: 3.25,
  validators: [],
  tooltipLayer: null,

  validatorData: [
    {
      id: 'gare-a',
      name: 'Gare A',
      share: 50,
      weight: 0.50,
      cransPerSec: 10,
      probLabel: '50 %',
      speedLabel: '10 crans/s (rapide)',
      tokens: 50,
      coinsMeshCount: 10,
      crateColors: [0x2563eb, 0xfacc15, 0x3b82f6, 0xeab308],
      crateLabel: 'caisses bleues et jaunes',
      candidateCargo: {
        lot: 'LOT-A-502',
        cargaison: 'Turbines bleues et bobines jaunes',
        quai: 'Quai Gare A'
      },
      x: 0.0,
      z: 3.25
    },
    {
      id: 'gare-b',
      name: 'Gare B',
      share: 35,
      weight: 0.35,
      cransPerSec: 7,
      probLabel: '35 %',
      speedLabel: '7 crans/s (moyenne)',
      tokens: 35,
      coinsMeshCount: 7,
      crateColors: [0x10b981, 0xf97316, 0x22c55e, 0xfb923c],
      crateLabel: 'caisses vertes et orange',
      candidateCargo: {
        lot: 'LOT-B-318',
        cargaison: 'Caisses vertes et moteurs orange',
        quai: 'Quai Gare B'
      },
      x: 3.8,
      z: 3.25
    },
    {
      id: 'gare-c',
      name: 'Gare C',
      share: 15,
      weight: 0.15,
      cransPerSec: 3,
      probLabel: '15 %',
      speedLabel: '3 crans/s (lente)',
      tokens: 15,
      coinsMeshCount: 3,
      crateColors: [0x8b5cf6, 0xef4444, 0xa855f7, 0xf87171],
      crateLabel: 'caisses violettes et rouges',
      candidateCargo: {
        lot: 'LOT-C-149',
        cargaison: 'Batteries violettes et modules rouges',
        quai: 'Quai Gare C'
      },
      x: 7.6,
      z: 3.25
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
    this.powTickAccum = 0;
    this.wasCoupled = false;
    this.couplerFlashAlpha = 0;

    if (cameraController) {
      cameraController.setViewOffset(215);
    }

    // Train principal en circulation en arriere-plan (voie z = 0 totalement degagee)
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
        { lot: 'Fret #104', cargaison: "15 tonnes d'acier", quai: 'Quai A -> Quai B' }
      ]);
      if (trainConvoy.group) {
        trainConvoy.group.position.x = 0;
      }
      if (trainConvoy.blockchain?.chain) {
        const b0 = trainConvoy.blockchain.chain[0];
        const b1 = trainConvoy.blockchain.chain[1];
        if (b0) b0.mineBlock(1);
        if (b1 && b0) {
          b1.previousHash = b0.hash;
          b1.mineBlock(1);
        }
        trainConvoy.sync();
      }
      if (cameraController) {
        cameraController.setInteractiveObjects(trainConvoy.getInteractiveObjects());
      }
    }

    this.buildConsensusScene();
    this.resetRoundVisuals();
    this.setupTooltipsLayer();
    this.createStationTooltips();
    this.applyModeVisuals();

    // Cadrage global rapproche : train en circulation en haut, 3 gares aerees devant
    if (cameraController) {
      cameraController.moveTo(
        this.overviewCamPos,
        this.overviewCamTarget,
        1.25
      );
    }

    this.startAnimationLoop();
    this.renderLeftPanel();
  },

  exit() {
    this.stopAnimationLoop();
    this.ctx?.cameraController?.cancelTransition();
    this.simState = 'idle';
    this.simTimer = 0;
    this.posSealedInCloseUp = false;

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

  isBusyState() {
    return (
      this.simState === 'pow_loading' ||
      this.simState === 'pow_racing' ||
      this.simState === 'pow_verdict' ||
      this.simState === 'pow_fade_losers' ||
      this.simState === 'pow_coupling' ||
      this.simState === 'pos_lottery' ||
      this.simState === 'pos_selected' ||
      this.simState === 'pos_zoom_in' ||
      this.simState === 'pos_loading' ||
      this.simState === 'pos_zoom_out' ||
      this.simState === 'pos_coupling'
    );
  },

  /**
   * Calcule une graine SHA-256 pour que candidateBlock ait un hash commencant par '0' exactement a targetWinningNonce.
   */
  solveCandidateSaltForNonce(block, targetWinningNonce) {
    let saltTry = 0;
    let foundHash = '';
    do {
      saltTry += 1;
      block._miningSalt = `s6-${this.roundCounter}-${saltTry}-${Math.random().toString(36).substring(2, 7)}`;
      block.nonce = 0;
      const h0 = block.calculateHash();
      if (h0.startsWith('0')) continue;

      block.nonce = targetWinningNonce;
      const hWin = block.calculateHash();
      if (hWin.startsWith('0')) {
        foundHash = hWin;
        break;
      }
    } while (saltTry < 250);

    if (!foundHash) {
      foundHash = '00e4a1b8c9d0e1f2a3b4c5d6e7f8091a2b3c4d5e6f708192a3b4c5d6e7f8091a';
    }

    return foundHash;
  },

  /**
   * Positionne chaque caisse d'un wagon candidat entre sa palette sur le quai (p=0) et l'interieur du wagon (p=1).
   */
  applyCratesLoadProgress(validator, progress) {
    const p = Math.max(0, Math.min(1, progress));
    const eased = p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
    const arcY = Math.sin(p * Math.PI) * 0.72;

    validator.crates.forEach((crate) => {
      crate.position.lerpVectors(crate.userData.startPos, crate.userData.targetPos, eased);
      crate.position.y += arcY;
      crate.rotation.y = (1 - eased) * crate.userData.startRotY;
    });
  },

  /**
   * Regle l'opacite et la visibilite d'une gare complete (quai, batiment, caisses, wagon, molette et voie).
   */
  setStationOpacity(v, alpha) {
    if (!v) return;
    const clamped = Math.max(0, Math.min(1, alpha));
    v.opacity = clamped;

    if (clamped <= 0.005) {
      if (v.group) v.group.visible = false;
      if (v.candidateWagon) v.candidateWagon.visible = false;
      if (v.linkLine) v.linkLine.visible = false;
      return;
    }

    if (v.group) v.group.visible = true;
    if (v.candidateWagon) v.candidateWagon.visible = true;
    if (v.linkLine) v.linkLine.visible = true;

    const isFading = clamped < 0.995;
    if (Array.isArray(v.fadeMaterials)) {
      v.fadeMaterials.forEach((mat) => {
        const baseTransparent = Boolean(mat.userData.baseTransparent);
        const baseOpacity = mat.userData.baseOpacity !== undefined ? mat.userData.baseOpacity : 1.0;
        const baseDepthWrite = mat.userData.baseDepthWrite !== undefined ? mat.userData.baseDepthWrite : true;

        if (isFading) {
          if (!mat.transparent) {
            mat.transparent = true;
            mat.needsUpdate = true;
          }
          mat.depthWrite = false;
          mat.opacity = baseOpacity * clamped;
        } else {
          if (mat.transparent !== baseTransparent) {
            mat.transparent = baseTransparent;
            mat.needsUpdate = true;
          }
          mat.depthWrite = baseDepthWrite;
          mat.opacity = baseOpacity;
        }
      });
    }
  },

  /**
   * Reinitialise les 3 quais, caisses, molettes et wagons candidats pour une nouvelle manche.
   */
  resetRoundVisuals() {
    const parentBlock = this.ctx?.trainConvoy?.blockchain?.chain?.[1];
    const prevHash = parentBlock ? parentBlock.hash : '0000abcd1234';

    this.roundCounter += 1;
    this.wasCoupled = false;
    this.couplerFlashAlpha = 0;

    this.validators.forEach((v, idx) => {
      v.cranFloat = 0;
      v.currentCrans = 0;
      v.targetCrans = 0;
      v.currentAngle = 0;
      v.wheelScale = this.mode === 'pow' ? 1 : 0.01;
      v.loadProgress = 0;
      v.coupleProgress = 0;
      v.currentHash = this.randomRejectedHash();

      if (v.wheelMesh) {
        v.wheelMesh.rotation.set(Math.PI / 2, 0, 0);
      }
      this.renderStationWheelDial(v.dialCanvas, v.dialTex, 0, '#f59e0b');

      if (v.candidateBlock) {
        v.candidateBlock.previousHash = prevHash;
        v.candidateBlock.nonce = 0;
        v.candidateBlock.data = { ...v.data.candidateCargo };
        let h = v.candidateBlock.calculateHash();
        if (h.startsWith('0')) h = `f${h.substring(1)}`;
        v.candidateBlock.hash = h;
      }

      if (v.candidateWagon) {
        v.candidateWagon.visible = true;
        v.candidateWagon.position.copy(v.sidingPos);
        v.candidateWagon.rotation.set(0, 0, 0);
        v.candidateWagon.scale.setScalar(this.sidingScale);
        v.candidateWagon.nonceDialAccentColor = '#f59e0b';
        v.candidateWagon.updateStatus(false);
        v.candidateWagon.glassMaterials.forEach((mat) => {
          mat.userData.baseOpacity = mat.opacity;
        });

        if (v.candidateWagon.couplerGroup) {
          v.candidateWagon.couplerGroup.visible = false;
        }
        if (v.candidateWagon.nonceWheel) {
          v.candidateWagon.nonceWheel.rotation.set(Math.PI / 2, 0, 0);
        }
        if (v.candidateWagon.beaconMaterial) {
          v.candidateWagon.beaconMaterial.color.setHex(0xfacc15);
          v.candidateWagon.beaconMaterial.emissive.setHex(0xeab308);
          v.candidateWagon.beaconMaterial.emissiveIntensity = 1.3;
        }
      }

      this.applyCratesLoadProgress(v, 0);
      this.setStationOpacity(v, 1.0);

      [`tooltip-s6-${idx}`, `s6-line-${idx}`, `s6-dot-in-${idx}`, `s6-dot-out-${idx}`].forEach((id) => {
        const el = document.getElementById(id);
        if (el) {
          el.style.display = '';
          el.style.opacity = id.startsWith('tooltip-') ? '1' : '';
        }
      });
    });

    ['tooltip-s6-wagon', 's6-line-wagon', 's6-dot-in-wagon', 's6-dot-out-wagon'].forEach((id) => {
      const el = document.getElementById(id);
      if (el) el.style.display = '';
    });
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
   */
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

  /**
   * Construit le batiment de gare ferroviaire en 3D au fond du quai,
   * avec enseigne blanche rehaussee au-dessus du wagon candidat.
   */
  createStationBuildingMesh(v, shared, stationMats) {
    const buildingGroup = new THREE.Group();
    buildingGroup.position.set(-0.12, 0.20, -0.82);
    buildingGroup.scale.setScalar(0.92);

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
    [-0.44, -0.10, 0.24].forEach((wx) => {
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

    const tower = new THREE.Mesh(shared.towerBodyGeo, stationMats.brickMat);
    tower.position.set(-0.66, 0.80, -0.14);
    buildingGroup.add(tower);

    const towerRoof = new THREE.Mesh(shared.towerRoofGeo, stationMats.slateRoofMat);
    towerRoof.position.set(-0.66, 1.78, -0.14);
    towerRoof.rotation.y = Math.PI / 4;
    buildingGroup.add(towerRoof);

    const clockFront = new THREE.Mesh(shared.clockFaceGeo, stationMats.clockMat);
    clockFront.position.set(-0.66, 1.44, 0.08);
    buildingGroup.add(clockFront);

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

  /**
   * Construit les 3 gares, leurs quais de chargement (caisses colorees), leurs wagons candidats,
   * leurs voies de raccordement vers le train principal, leurs molettes PoW et piles de jetons PoS.
   */
  buildConsensusScene() {
    const { scene, trainConvoy } = this.ctx;
    if (!scene) return;

    if (this.consensusGroup) {
      scene.remove(this.consensusGroup);
    }

    this.consensusGroup = new THREE.Group();
    this.validators = [];

    const parentBlock = trainConvoy?.blockchain?.chain?.[1];
    const parentHash = parentBlock ? parentBlock.hash : '0000abcd1234';

    const platformGeo = new THREE.BoxGeometry(3.42, 0.16, 2.68);
    const ringGeo = new THREE.RingGeometry(1.36, 1.48, 36);
    const wheelStandGeo = new THREE.BoxGeometry(0.30, 0.54, 0.14);
    const wheelGeo = new THREE.CylinderGeometry(0.32, 0.32, 0.11, 24);
    const toothGeo = new THREE.BoxGeometry(0.07, 0.10, 0.09);
    const dialGeo = new THREE.CircleGeometry(0.29, 32);
    const coinGeo = new THREE.CylinderGeometry(0.28, 0.28, 0.085, 20);
    const palletGeo = new THREE.BoxGeometry(0.84, 0.06, 0.68);
    const crateGeo = new THREE.BoxGeometry(0.56, 0.42, 0.40);
    const crateEdgesGeo = new THREE.EdgesGeometry(crateGeo);
    const sidingTieGeo = new THREE.BoxGeometry(0.08, 0.03, 0.72);
    const sidingRailGeo = new THREE.BoxGeometry(1.48, 0.04, 0.05);

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

    const crateTargets = [
      new THREE.Vector3(-0.56, 0.40, -0.23),
      new THREE.Vector3(0.48, 0.40, -0.23),
      new THREE.Vector3(-0.56, 0.40, 0.23),
      new THREE.Vector3(0.48, 0.40, 0.23)
    ];
    const crateStarts = [
      new THREE.Vector3(-2.72, 0.02, -0.22),
      new THREE.Vector3(-2.14, 0.02, -0.22),
      new THREE.Vector3(-2.72, 0.02, 0.22),
      new THREE.Vector3(-2.14, 0.02, 0.22)
    ];

    this.validatorData.forEach((v) => {
      const vGroup = new THREE.Group();
      vGroup.position.set(v.x, -0.44, v.z);

      // Materiaux dedies a cette gare uniquement (aucun partage pour permettre le fondu independant)
      const platformMat = new THREE.MeshStandardMaterial({
        color: 0x1e293b,
        roughness: 0.65,
        metalness: 0.3
      });
      const wheelStandMat = new THREE.MeshStandardMaterial({
        color: 0x0f172a,
        metalness: 0.85,
        roughness: 0.3
      });
      const palletMat = new THREE.MeshStandardMaterial({
        color: 0x78350f,
        roughness: 0.85
      });
      const sidingTieMat = new THREE.MeshStandardMaterial({ color: 0x3f2e21, roughness: 0.9 });
      const sidingRailMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.8, roughness: 0.3 });
      const stationMats = {
        brickMat: new THREE.MeshStandardMaterial({ color: 0x9a3412, roughness: 0.72 }),
        stoneTrimMat: new THREE.MeshStandardMaterial({ color: 0xcbd5e1, roughness: 0.6 }),
        slateRoofMat: new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.55, flatShading: true }),
        darkMetalMat: new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.75, roughness: 0.3 }),
        clockMat: new THREE.MeshBasicMaterial({ map: clockTexture })
      };

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

      const { buildingGroup, beaconMat, windowMat } = this.createStationBuildingMesh(
        v,
        sharedStationAssets,
        stationMats
      );
      vGroup.add(buildingGroup);

      // Palette de chargement bien a l'ecart sur la gauche du quai
      const pallet = new THREE.Mesh(palletGeo, palletMat);
      pallet.position.set(-1.24, 0.11, 0.42);
      vGroup.add(pallet);

      // Voie de quai centree pour le wagon candidat
      const sidingLocalX = -0.06;
      const sidingLocalZ = 0.42;
      for (let t = -3; t <= 3; t++) {
        const tie = new THREE.Mesh(sidingTieGeo, sidingTieMat);
        tie.position.set(sidingLocalX + t * 0.21, 0.095, sidingLocalZ);
        vGroup.add(tie);
      }
      [-0.31, 0.31].forEach((rz) => {
        const rail = new THREE.Mesh(sidingRailGeo, sidingRailMat);
        rail.position.set(sidingLocalX, 0.125, sidingLocalZ + rz);
        vGroup.add(rail);
      });

      // --- 1. Indicateur PoW : Molette du Nonce franchement sur la droite et vers l'avant (+X, +Z) ---
      const powNodeGroup = new THREE.Group();
      powNodeGroup.position.set(1.16, 0.06, 0.62);

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
        tooth.position.set(Math.cos(angle) * 0.34, 0, Math.sin(angle) * 0.34);
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

      // --- 2. Indicateur PoS : Pile de jetons strictement fixe sur la droite vers l'avant (+X, +Z) ---
      const posNodeGroup = new THREE.Group();
      posNodeGroup.position.set(0.84, 0.08, 0.58);
      const coinMat = new THREE.MeshStandardMaterial({
        color: 0xfacc15,
        emissive: 0xb45309,
        emissiveIntensity: 0.45,
        metalness: 0.85,
        roughness: 0.2
      });

      for (let c = 0; c < v.coinsMeshCount; c++) {
        const coin = new THREE.Mesh(coinGeo, coinMat);
        coin.position.set(0, 0.07 + c * 0.09, 0);
        posNodeGroup.add(coin);
      }
      vGroup.add(posNodeGroup);

      this.consensusGroup.add(vGroup);

      // --- 3. Wagon candidat propre a la gare (centre du quai, parallele a la voie) ---
      const sidingPos = new THREE.Vector3(v.x + sidingLocalX, -0.18, v.z + sidingLocalZ);
      const candidateBlock = new Block(2, Date.now(), { ...v.candidateCargo }, parentHash, 0);
      const candidateWagon = new WagonMesh(candidateBlock, { spacing: 3.8 });
      candidateWagon.position.copy(sidingPos);
      candidateWagon.scale.setScalar(this.sidingScale);
      if (candidateWagon.cargoGroup) {
        candidateWagon.cargoGroup.visible = false;
      }
      if (candidateWagon.couplerGroup) {
        candidateWagon.couplerGroup.visible = false;
      }

      // 4 caisses de marchandises aux couleurs distinctes de la gare (enfants du wagon candidat)
      const crates = [];
      for (let c = 0; c < 4; c++) {
        const crateColor = v.crateColors[c % v.crateColors.length];
        const crateMat = new THREE.MeshStandardMaterial({
          color: crateColor,
          emissive: crateColor,
          emissiveIntensity: 0.18,
          roughness: 0.38,
          metalness: 0.25
        });
        const crate = new THREE.Mesh(crateGeo, crateMat);
        const edges = new THREE.LineSegments(
          crateEdgesGeo,
          new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.35 })
        );
        crate.add(edges);

        const startPos = crateStarts[c].clone();
        const targetPos = crateTargets[c].clone();
        crate.userData = {
          startPos,
          targetPos,
          startRotY: (c % 2 === 0 ? 1 : -1) * 0.08
        };
        crate.position.copy(startPos);
        candidateWagon.add(crate);
        crates.push(crate);
      }

      this.consensusGroup.add(candidateWagon);

      // --- 4. Voie de raccordement courbe entre le quai de la gare et le train principal ---
      const ctrlPos = new THREE.Vector3((v.x + this.coupledTargetPos.x) * 0.5 + 0.55, -0.09, 1.55);
      const trackCurve = new THREE.QuadraticBezierCurve3(sidingPos.clone(), ctrlPos, this.coupledTargetPos.clone());
      const curvePts = trackCurve.getPoints(28);
      const lineGeo = new THREE.BufferGeometry().setFromPoints(curvePts);
      const lineMat = new THREE.LineBasicMaterial({
        color: 0x38bdf8,
        transparent: true,
        opacity: 0.32
      });
      const linkLine = new THREE.Line(lineGeo, lineMat);
      this.consensusGroup.add(linkLine);

      const fadeMaterialSet = new Set();
      const registerFadeMaterials = (root) => {
        if (!root) return;
        root.traverse((obj) => {
          if (!obj.material) return;
          const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
          mats.forEach((mat) => {
            if (!mat || fadeMaterialSet.has(mat)) return;
            fadeMaterialSet.add(mat);
            if (mat.userData.baseOpacity === undefined) {
              mat.userData.baseOpacity = mat.opacity !== undefined ? mat.opacity : 1.0;
            }
            if (mat.userData.baseTransparent === undefined) {
              mat.userData.baseTransparent = Boolean(mat.transparent);
            }
            if (mat.userData.baseDepthWrite === undefined) {
              mat.userData.baseDepthWrite = mat.depthWrite !== undefined ? mat.depthWrite : true;
            }
          });
        });
      };
      registerFadeMaterials(vGroup);
      registerFadeMaterials(candidateWagon);
      registerFadeMaterials(linkLine);

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
        linkLine,
        fadeMaterials: Array.from(fadeMaterialSet),
        opacity: 1.0,
        sidingPos,
        trackCurve,
        candidateBlock,
        candidateWagon,
        crates,
        cranFloat: 0,
        currentCrans: 0,
        targetCrans: 0,
        currentAngle: 0,
        wheelScale: 1,
        loadProgress: 0,
        coupleProgress: 0,
        currentHash: 'a4f9c2...'
      });
    });

    // Halo / projecteur 3D mobile de tirage au sort PoS
    this.lotteryHaloGroup = new THREE.Group();
    const haloRingGeo = new THREE.RingGeometry(1.38, 1.52, 36);
    const haloRingMat = new THREE.MeshBasicMaterial({
      color: 0xfacc15,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.95
    });
    const haloRing = new THREE.Mesh(haloRingGeo, haloRingMat);
    haloRing.rotation.x = -Math.PI / 2;
    this.lotteryHaloGroup.add(haloRing);

    const haloBeamGeo = new THREE.CylinderGeometry(1.38, 1.38, 1.85, 28, 1, true);
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

    this.lotteryHaloGroup.position.set(this.validatorData[0].x, -0.34, this.validatorData[0].z + 0.08);
    this.lotteryHaloGroup.visible = false;
    this.lotteryHaloGroup.userData = { haloRingMat, haloBeamMat };
    this.consensusGroup.add(this.lotteryHaloGroup);

    // Anneau flash vert au point d'attelage derriere Wagon #1
    const flashGeo = new THREE.TorusGeometry(0.26, 0.038, 12, 32);
    flashGeo.rotateY(Math.PI / 2);
    const flashMat = new THREE.MeshBasicMaterial({
      color: 0x10b981,
      transparent: true,
      opacity: 0
    });
    this.couplerFlashRing = new THREE.Mesh(flashGeo, flashMat);
    this.couplerFlashRing.position.set(5.28, 0.05, 0);
    this.couplerFlashRing.visible = false;
    this.consensusGroup.add(this.couplerFlashRing);

    scene.add(this.consensusGroup);
  },

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

    const wagonSvgHTML = `
      <line id="s6-line-wagon" stroke="#facc15" stroke-width="2" stroke-linecap="round" opacity="0.9" />
      <circle id="s6-dot-out-wagon" r="6.5" fill="none" stroke="#facc15" stroke-width="1.5" opacity="0.85" />
      <circle id="s6-dot-in-wagon" r="3" fill="#facc15" />
    `;

    const pillsHTML = this.validatorData
      .map(
        (v, idx) => `
        <div id="tooltip-s6-${idx}" class="scene-tooltip" style="--spot-color: #38bdf8; z-index: 12;">
          <button type="button" class="scene-tooltip-pill">
            <span class="scene-tooltip-dot"></span>
            <span class="scene-tooltip-label">
              <strong>${v.name}</strong> - <span id="s6-pill-status-${idx}" style="color: #cbd5e1;">${v.probLabel}</span>
            </span>
          </button>
        </div>
      `
      )
      .join('');

    const wagonPillHTML = `
      <div id="tooltip-s6-wagon" class="scene-tooltip" style="--spot-color: #38bdf8; z-index: 12;">
        <button type="button" class="scene-tooltip-pill">
          <span class="scene-tooltip-dot"></span>
          <span class="scene-tooltip-label">
            <strong id="s6-wagon-title">Convoi principal</strong> · <span id="s6-wagon-status" style="color: #bae6fd;">En circulation</span>
          </span>
        </button>
      </div>
    `;

    this.tooltipLayer.innerHTML = `
      <svg id="step6-tooltips-svg" style="position: absolute; inset: 0; width: 100%; height: 100%; pointer-events: none; overflow: visible; z-index: 10;">
        ${svgLinesHTML}
        ${wagonSvgHTML}
      </svg>
      ${pillsHTML}
      ${wagonPillHTML}
    `;

    this.validatorData.forEach((_, idx) => {
      const el = document.getElementById(`tooltip-s6-${idx}`);
      el?.addEventListener('pointerdown', (e) => e.stopPropagation());
    });
    document.getElementById('tooltip-s6-wagon')?.addEventListener('pointerdown', (e) => e.stopPropagation());

    this.updateTooltipsDOM();
  },

  setMode(targetMode) {
    if (this.mode === targetMode && this.simState === 'idle') return;
    this.ctx?.cameraController?.cancelTransition();
    this.mode = targetMode;
    this.simState = 'idle';
    this.simTimer = 0;
    this.posSealedInCloseUp = false;
    this.lotteryCursorPercent = 25;

    this.resetRoundVisuals();
    this.applyModeVisuals();
    this.updateTooltipsDOM();
    this.renderLeftPanel();

    if (this.ctx?.cameraController) {
      this.ctx.cameraController.moveTo(this.overviewCamPos, this.overviewCamTarget, 0.65);
    }
  },

  pickWeightedWinner() {
    const r = Math.random() * 100;
    if (r < 50) {
      this.lotteryTargetPercent = 8 + Math.random() * 36;
      return 0;
    }
    if (r < 85) {
      this.lotteryTargetPercent = 54 + Math.random() * 27;
      return 1;
    }
    this.lotteryTargetPercent = 88 + Math.random() * 9;
    return 2;
  },

  randomRejectedHash() {
    const first = '123456789abcdef';
    const hex = '0123456789abcdef';
    let out = first[Math.floor(Math.random() * first.length)];
    for (let i = 0; i < 5; i++) {
      out += hex[Math.floor(Math.random() * hex.length)];
    }
    return `${out}...`;
  },

  startConsensusRound() {
    this.ctx?.cameraController?.cancelTransition();
    if (this.ctx?.cameraController) {
      this.ctx.cameraController.moveTo(this.overviewCamPos, this.overviewCamTarget, 0.5);
    }

    this.resetRoundVisuals();
    this.powTickAccum = 0;
    this.simTimer = 0;
    this.posSealedInCloseUp = false;

    if (this.mode === 'pow') {
      this.winnerIndex = 0;
      this.simState = 'pow_loading';
    } else {
      this.winnerIndex = this.pickWeightedWinner();
      this.validators[this.winnerIndex].targetCrans = 9 + Math.floor(Math.random() * 7);
      this.simState = 'pos_lottery';
      this.lotteryStartPercent = this.lotteryCursorPercent;
      this.lotteryHaloX = this.validatorData[this.rouletteHighlightIndex].x;
      this.lotteryHaloZ = this.validatorData[this.rouletteHighlightIndex].z;
    }

    this.applyModeVisuals();
    this.updateTooltipsDOM();
    this.renderLeftPanel();
  },

  /**
   * Met a jour les visuels des molettes, jetons, anneaux et lignes de raccordement.
   * La hauteur et la taille des piles de jetons PoS restent strictement fixes.
   */
  applyModeVisuals() {
    const isPoW = this.mode === 'pow';
    const showPosWheel =
      !isPoW &&
      (this.simState === 'pos_selected' ||
        this.simState === 'pos_zoom_in' ||
        this.simState === 'pos_loading' ||
        this.simState === 'pos_zoom_out' ||
        this.simState === 'pos_coupling' ||
        this.simState === 'done');

    this.validators.forEach((v, idx) => {
      const isWinner = idx === this.winnerIndex;

      if (isPoW) {
        v.powNodeGroup.position.set(1.16, 0.06, 0.62);
        v.powNodeGroup.visible = true;
        v.powNodeGroup.scale.setScalar(1);
        v.posNodeGroup.visible = false;
      } else {
        const showWinnerWheel = showPosWheel && isWinner;
        v.powNodeGroup.position.set(1.38, 0.06, 0.62);
        v.powNodeGroup.visible = showWinnerWheel;
        v.powNodeGroup.scale.setScalar(showWinnerWheel ? Math.max(0.01, v.wheelScale) : 0.01);

        // Pile de jetons strictement fixe : aucune variation de hauteur ni de scale
        v.posNodeGroup.visible = true;
        v.posNodeGroup.position.set(0.84, 0.08, 0.58);
        v.posNodeGroup.scale.set(1, 1, 1);
      }

      let colorHex = 0x38bdf8;
      let lineOpacity = 0.28;

      if (this.simState === 'pow_loading' || this.simState === 'pow_racing') {
        colorHex = 0xf59e0b;
        lineOpacity = 0.58;
      } else if (this.simState === 'pos_lottery') {
        const isHigh = idx === this.rouletteHighlightIndex;
        colorHex = isHigh ? 0xfacc15 : 0x38bdf8;
        lineOpacity = isHigh ? 0.85 : 0.2;
      } else if (
        this.simState === 'pos_selected' ||
        this.simState === 'pos_zoom_in' ||
        this.simState === 'pos_loading'
      ) {
        colorHex = isWinner ? 0x10b981 : 0x475569;
        lineOpacity = isWinner ? 0.9 : 0.15;
      } else if (
        this.simState === 'pow_verdict' ||
        this.simState === 'pow_fade_losers' ||
        this.simState === 'pow_coupling' ||
        this.simState === 'pos_zoom_out' ||
        this.simState === 'pos_coupling' ||
        this.simState === 'done'
      ) {
        if (isWinner) {
          colorHex = 0x10b981;
          lineOpacity = 0.95;
        } else {
          colorHex = isPoW ? 0xef4444 : 0x475569;
          lineOpacity = 0.14;
        }
      }

      v.ringMat.color.setHex(colorHex);
      v.lineMat.color.setHex(colorHex);
      v.lineMat.opacity = lineOpacity * (v.opacity !== undefined ? v.opacity : 1.0);
      v.lineMat.userData.baseOpacity = lineOpacity;
      if (v.beaconMat) {
        v.beaconMat.color.setHex(colorHex);
        v.beaconMat.emissive.setHex(colorHex);
        v.beaconMat.emissiveIntensity =
          !isWinner &&
          (this.simState === 'done' || this.simState === 'pos_zoom_out' || this.simState === 'pos_coupling') &&
          !isPoW
            ? 0.4
            : 1.7;
      }
    });

    if (this.lotteryHaloGroup) {
      const showHalo =
        !isPoW &&
        (this.simState === 'pos_lottery' ||
          this.simState === 'pos_selected' ||
          this.simState === 'pos_zoom_in' ||
          this.simState === 'pos_loading' ||
          this.simState === 'pos_zoom_out' ||
          this.simState === 'pos_coupling' ||
          this.simState === 'done');
      this.lotteryHaloGroup.visible = showHalo;
      if (showHalo) {
        const { haloRingMat, haloBeamMat } = this.lotteryHaloGroup.userData;
        const isSweeping = this.simState === 'pos_lottery';
        const haloColor = isSweeping ? 0xfacc15 : 0x10b981;
        haloRingMat.color.setHex(haloColor);
        haloBeamMat.color.setHex(haloColor);
        haloBeamMat.opacity = isSweeping ? 0.22 : 0.14;
      }
    }
  },

  /**
   * Met a jour les infobulles 3D et la barre de loterie PoS.
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

      if (this.simState === 'pow_loading') {
        spotColor = '#f59e0b';
        statusText = 'Chargement des caisses...';
        statusColor = '#fde68a';
      } else if (this.simState === 'pow_racing') {
        spotColor = '#f59e0b';
        statusText = `${v.data.probLabel} · Nonce #${v.currentCrans}`;
        statusColor = '#fde68a';
      } else if (
        this.simState === 'pow_verdict' ||
        this.simState === 'pow_fade_losers' ||
        (isPoW && (this.simState === 'pow_coupling' || this.simState === 'done'))
      ) {
        const isWinner = idx === this.winnerIndex;
        if (isWinner) {
          spotColor = '#10b981';
          statusText = `Gagnante (Nonce #${v.currentCrans})`;
          statusColor = '#34d399';
        } else {
          spotColor = '#ef4444';
          statusText = 'Battue';
          statusColor = '#fca5a5';
        }
      } else if (this.simState === 'pos_lottery') {
        const isHigh = idx === this.rouletteHighlightIndex;
        spotColor = isHigh ? '#facc15' : '#38bdf8';
        statusText = `${v.data.tokens} jetons (${v.data.probLabel})`;
        statusColor = isHigh ? '#fde047' : '#94a3b8';
      } else if (this.simState === 'pos_selected' || this.simState === 'pos_zoom_in') {
        const isWinner = idx === this.winnerIndex;
        spotColor = isWinner ? '#10b981' : '#64748b';
        statusText = isWinner ? 'Choisie' : 'En attente';
        statusColor = isWinner ? '#34d399' : '#94a3b8';
      } else if (this.simState === 'pos_loading') {
        const isWinner = idx === this.winnerIndex;
        if (isWinner) {
          spotColor = '#10b981';
          statusText = this.posSealedInCloseUp
            ? `Choisie (Nonce #${this.winningNonce})`
            : this.simTimer < 0.85
              ? 'Chargement des caisses...'
              : `Nonce #${v.currentCrans}`;
          statusColor = '#34d399';
        } else {
          spotColor = '#64748b';
          statusText = 'En attente';
          statusColor = '#94a3b8';
        }
      } else if (
        this.simState === 'pos_zoom_out' ||
        this.simState === 'pos_coupling' ||
        (!isPoW && this.simState === 'done')
      ) {
        const isWinner = idx === this.winnerIndex;
        if (isWinner) {
          spotColor = '#10b981';
          statusText = `Choisie (Nonce #${this.winningNonce})`;
          statusColor = '#34d399';
        } else {
          spotColor = '#64748b';
          statusText = 'En attente';
          statusColor = '#94a3b8';
        }
      }

      if (statusEl) {
        statusEl.textContent = statusText;
        statusEl.style.color = statusColor;
      }
      if (segEl) {
        const segBase = idx === 0 ? 'seg-a' : idx === 1 ? 'seg-b' : 'seg-c';
        const isSweep = this.simState === 'pos_lottery' && idx === this.rouletteHighlightIndex;
        const isWin =
          (this.simState === 'pos_selected' ||
            this.simState === 'pos_zoom_in' ||
            this.simState === 'pos_loading' ||
            this.simState === 'pos_zoom_out' ||
            this.simState === 'pos_coupling' ||
            (!isPoW && this.simState === 'done')) &&
          idx === this.winnerIndex;
        segEl.className = `pos-lottery-segment ${segBase} ${isSweep ? 'sweep-active' : ''} ${isWin ? 'winner' : ''}`;
      }
      if (pillWrap) pillWrap.style.setProperty('--spot-color', spotColor);
      if (lineEl) lineEl.setAttribute('stroke', spotColor);
      if (dotInEl) dotInEl.setAttribute('fill', spotColor);
      if (dotOutEl) dotOutEl.setAttribute('stroke', spotColor);
    });

    const cursorEl = document.getElementById('step6-lottery-cursor');
    if (cursorEl) {
      cursorEl.style.left = `${this.lotteryCursorPercent.toFixed(1)}%`;
    }

    const wagonEl = document.getElementById('tooltip-s6-wagon');
    const wagonTitleEl = document.getElementById('s6-wagon-title');
    const wagonStatusEl = document.getElementById('s6-wagon-status');
    const wagonLineEl = document.getElementById('s6-line-wagon');
    const wagonDotIn = document.getElementById('s6-dot-in-wagon');
    const wagonDotOut = document.getElementById('s6-dot-out-wagon');

    const winnerData = this.validatorData[this.winnerIndex];
    let titleText = 'Convoi principal';
    let wagonColor = '#38bdf8';
    let wagonText = 'En circulation (#0 - #1)';

    if (this.simState === 'pow_loading' || this.simState === 'pow_racing') {
      wagonColor = '#f59e0b';
      wagonText = 'Attend le 1er wagon valide...';
    } else if (this.simState === 'pow_verdict' || this.simState === 'pow_fade_losers') {
      wagonColor = '#10b981';
      wagonText = `Wagon ${winnerData.name} validé`;
    } else if (this.simState === 'pos_lottery') {
      wagonColor = '#facc15';
      wagonText = 'Tirage de la gare...';
    } else if (this.simState === 'pos_selected' || this.simState === 'pos_zoom_in') {
      wagonColor = '#10b981';
      wagonText = `Gare élue : ${winnerData.name}`;
    } else if (this.simState === 'pos_loading') {
      wagonColor = this.posSealedInCloseUp ? '#10b981' : '#facc15';
      wagonText = this.posSealedInCloseUp
        ? `Wagon ${winnerData.name} scellé (#${this.winningNonce})`
        : `Chargement à ${winnerData.name}...`;
    } else if (
      this.simState === 'pos_zoom_out' ||
      this.simState === 'pow_coupling' ||
      this.simState === 'pos_coupling'
    ) {
      titleText = `Wagon ${winnerData.name}`;
      wagonColor = '#10b981';
      wagonText =
        this.simState === 'pos_zoom_out'
          ? 'Prêt pour raccordement...'
          : 'Raccordement au convoi...';
    } else if (this.simState === 'done') {
      titleText = `Wagon #2 (${winnerData.name})`;
      wagonColor = '#10b981';
      wagonText = `Attelé · Nonce #${this.winningNonce}`;
    }

    if (wagonTitleEl) wagonTitleEl.textContent = titleText;
    if (wagonStatusEl) {
      wagonStatusEl.textContent = wagonText;
      wagonStatusEl.style.color = wagonColor;
    }
    if (wagonEl) wagonEl.style.setProperty('--spot-color', wagonColor);
    if (wagonLineEl) wagonLineEl.setAttribute('stroke', wagonColor);
    if (wagonDotIn) wagonDotIn.setAttribute('fill', wagonColor);
    if (wagonDotOut) wagonDotOut.setAttribute('stroke', wagonColor);
  },

  /**
   * Finalise la victoire d'une gare (PoW ou PoS) : met a jour son wagon candidat en vert,
   * les perdants en gris/rouge (en PoW) et prepare la phase de raccordement.
   */
  sealWinnerAndPrepareCoupling(winIdx, winCrans, nextState = null) {
    this.winnerIndex = winIdx;
    const winVal = this.validators[winIdx];
    const resolvedCrans = Math.max(1, winCrans);

    winVal.currentCrans = resolvedCrans;
    winVal.candidateBlock.data = { ...winVal.data.candidateCargo };
    this.winningHash = this.solveCandidateSaltForNonce(winVal.candidateBlock, resolvedCrans);
    this.winningNonce = resolvedCrans;
    winVal.candidateBlock.nonce = resolvedCrans;
    winVal.candidateBlock.hash = this.winningHash;

    const shortWinHash = `${this.winningHash.substring(0, 6)}...`;
    winVal.currentHash = shortWinHash;

    this.renderStationWheelDial(winVal.dialCanvas, winVal.dialTex, resolvedCrans, '#10b981');
    if (winVal.wheelMesh) {
      winVal.wheelMesh.rotation.set(Math.PI / 2, resolvedCrans * (Math.PI / 4), 0);
    }

    if (winVal.candidateWagon) {
      winVal.candidateWagon.nonceDialAccentColor = '#10b981';
      winVal.candidateWagon.updateStatus(true);
      if (winVal.candidateWagon.couplerGroup) {
        winVal.candidateWagon.couplerGroup.visible = false;
      }
      if (winVal.candidateWagon.nonceWheel) {
        winVal.candidateWagon.nonceWheel.rotation.set(Math.PI / 2, resolvedCrans * (Math.PI / 4), 0);
      }
    }

    if (this.mode === 'pow') {
      this.validators.forEach((v, idx) => {
        if (idx === winIdx) return;
        v.currentHash = this.randomRejectedHash();
        this.renderStationWheelDial(v.dialCanvas, v.dialTex, v.currentCrans, '#ef4444');
        if (v.wheelMesh) {
          v.wheelMesh.rotation.set(Math.PI / 2, v.currentCrans * (Math.PI / 4), 0);
        }
        if (v.candidateWagon) {
          v.candidateWagon.nonceDialAccentColor = '#ef4444';
          v.candidateWagon.updateStatus(false);
          v.candidateWagon.glassMaterials.forEach((mat) => {
            mat.color.setHex(0xef4444);
            mat.opacity = 0.2;
            mat.userData.baseOpacity = 0.2;
          });
          v.candidateWagon.edgeMaterials.forEach((mat) => {
            mat.color.setHex(0x64748b);
          });
          if (v.candidateWagon.couplerGroup) {
            v.candidateWagon.couplerGroup.visible = false;
          }
        }
      });
    }

    if (nextState) {
      this.simState = nextState;
      this.simTimer = 0;
    }
    this.applyModeVisuals();
    this.updateTooltipsDOM();
    this.renderLeftPanel();
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

      const { trainConvoy, camera, cameraController } = this.ctx;
      const wheelPhase = trainConvoy?.wheelPhase || 0;

      // 1A. PoW — Temps 1 : Chargement simultane des caisses colorees sur les 3 quais (1.2 s)
      if (this.simState === 'pow_loading') {
        this.simTimer += dt;
        const p = Math.min(this.simTimer / 1.2, 1.0);
        this.validators.forEach((v) => {
          v.loadProgress = p;
          this.applyCratesLoadProgress(v, p);
        });
        if (p >= 1.0) {
          this.simState = 'pow_racing';
          this.simTimer = 0;
          this.powTickAccum = 0;
          this.applyModeVisuals();
          this.updateTooltipsDOM();
        }
      }

      // 1B. PoW — Temps 2 : Course simultanee aux probabilites reelles (50 % / 35 % / 15 %)
      if (this.simState === 'pow_racing') {
        this.simTimer += dt;
        const stepDt = 0.06;
        this.powTickAccum += dt;
        let winIdx = -1;

        while (this.powTickAccum >= stepDt && winIdx === -1) {
          this.powTickAccum -= stepDt;
          const incrementedIndices = [];

          this.validators.forEach((v, idx) => {
            v.cranFloat = (v.cranFloat || 0) + v.data.cransPerSec * stepDt;
            const nextCrans = Math.floor(v.cranFloat);
            if (nextCrans > v.currentCrans) {
              v.currentCrans = nextCrans;
              v.currentHash = this.randomRejectedHash();
              this.renderStationWheelDial(v.dialCanvas, v.dialTex, v.currentCrans, '#f59e0b');
              if (v.candidateBlock && v.candidateWagon) {
                v.candidateBlock.nonce = v.currentCrans;
                let h = v.candidateBlock.calculateHash();
                if (h.startsWith('0')) h = `f${h.substring(1)}`;
                v.candidateBlock.hash = h;
                v.candidateWagon.renderPlates();
              }
              incrementedIndices.push(idx);
            }
          });

          // Tirage aleatoire independant a chaque nouveau cran apres 2.5 s de course visible
          if (this.simTimer >= 2.5 && incrementedIndices.length > 0) {
            for (let i = incrementedIndices.length - 1; i > 0; i--) {
              const j = Math.floor(Math.random() * (i + 1));
              [incrementedIndices[i], incrementedIndices[j]] = [incrementedIndices[j], incrementedIndices[i]];
            }
            for (const idx of incrementedIndices) {
              if (Math.random() < 0.042) {
                winIdx = idx;
                break;
              }
            }
          }

          if (winIdx === -1 && this.simTimer >= 3.95) {
            winIdx = this.pickWeightedWinner();
          }
        }

        if (winIdx !== -1) {
          this.sealWinnerAndPrepareCoupling(winIdx, this.validators[winIdx].currentCrans, 'pow_verdict');
        } else {
          this.validators.forEach((v) => {
            const targetAngle = v.currentCrans * (Math.PI / 4);
            v.currentAngle = THREE.MathUtils.lerp(v.currentAngle, targetAngle, Math.min(1, dt * 18));
            if (v.wheelMesh) {
              v.wheelMesh.rotation.set(Math.PI / 2, v.currentAngle, 0);
            }
            if (v.candidateWagon?.nonceWheel) {
              v.candidateWagon.nonceWheel.rotation.set(Math.PI / 2, v.currentAngle, 0);
            }
          });
          this.updateTooltipsDOM();
        }
      }

      // 1C. PoW — Temps 2B : Verdict visuel (gagnante verte, 2 perdantes rouges maintenues 1.75 s)
      if (this.simState === 'pow_verdict') {
        this.simTimer += dt;
        if (this.simTimer >= 1.75) {
          this.simState = 'pow_fade_losers';
          this.simTimer = 0;
          this.applyModeVisuals();
          this.updateTooltipsDOM();
          this.renderLeftPanel();
        }
      }

      // 1D. PoW — Temps 2C : Disparition en fondu des 2 gares perdantes (0.8 s)
      if (this.simState === 'pow_fade_losers') {
        this.simTimer += dt;
        const fadeP = Math.min(this.simTimer / 0.8, 1.0);
        this.validators.forEach((v, idx) => {
          if (idx === this.winnerIndex) return;
          this.setStationOpacity(v, 1.0 - fadeP);
        });
        if (fadeP >= 1.0) {
          this.validators.forEach((v, idx) => {
            if (idx !== this.winnerIndex) {
              this.setStationOpacity(v, 0);
            }
          });
          this.simState = 'pow_coupling';
          this.simTimer = 0;
          this.applyModeVisuals();
          this.updateTooltipsDOM();
          this.renderLeftPanel();
        }
      }

      // 2A. PoS — Temps 1 : Tirage au sort sur les piles de jetons (2.5 s)
      if (this.simState === 'pos_lottery') {
        this.simTimer += dt;
        const sweepProgress = Math.min(this.simTimer / 2.5, 1.0);

        if (sweepProgress < 1.0) {
          const easeOut = 1 - Math.pow(1 - sweepProgress, 2.6);
          const damp = Math.pow(1 - sweepProgress, 1.45);
          const oscillation = Math.sin(sweepProgress * Math.PI * 5.2) * 52 * damp;
          const basePos = THREE.MathUtils.lerp(this.lotteryStartPercent, this.lotteryTargetPercent, easeOut);
          this.lotteryCursorPercent = Math.max(3, Math.min(97, basePos + oscillation));

          if (this.lotteryCursorPercent < 50) this.rouletteHighlightIndex = 0;
          else if (this.lotteryCursorPercent < 85) this.rouletteHighlightIndex = 1;
          else this.rouletteHighlightIndex = 2;

          const cursorEl = document.getElementById('step6-lottery-cursor');
          if (cursorEl) cursorEl.style.left = `${this.lotteryCursorPercent.toFixed(1)}%`;

          this.applyModeVisuals();
          this.updateTooltipsDOM();
        } else {
          this.lotteryCursorPercent = this.lotteryTargetPercent;
          this.rouletteHighlightIndex = this.winnerIndex;
          const cursorEl = document.getElementById('step6-lottery-cursor');
          if (cursorEl) cursorEl.style.left = `${this.lotteryCursorPercent.toFixed(1)}%`;

          const winnerVal = this.validators[this.winnerIndex];
          if (winnerVal) {
            winnerVal.wheelScale = 1.0;
          }
          this.simState = 'pos_selected';
          this.simTimer = 0;
          this.applyModeVisuals();
          this.updateTooltipsDOM();
          this.renderLeftPanel();
        }
      }

      // 2B. PoS — Temps 2 : Pause sur la selection verte en plan large (1.75 s)
      if (this.simState === 'pos_selected') {
        this.simTimer += dt;
        if (this.simTimer >= 1.75) {
          const winData = this.validatorData[this.winnerIndex];
          this.posSealedInCloseUp = false;
          this.simState = 'pos_zoom_in';
          this.simTimer = 0;
          if (cameraController && winData) {
            cameraController.moveTo(
              new THREE.Vector3(winData.x + 0.08, 1.95, winData.z + 4.65),
              new THREE.Vector3(winData.x + 0.08, 0.05, winData.z + 0.20),
              0.9
            );
          }
          this.applyModeVisuals();
          this.updateTooltipsDOM();
          this.renderLeftPanel();
        }
      }

      // 2C. PoS — Temps 3 : Fondu des 2 gares non retenues et gros zoom sur la gare elue (0.9 s)
      if (this.simState === 'pos_zoom_in') {
        this.simTimer += dt;
        const zoomP = Math.min(this.simTimer / 0.9, 1.0);
        this.validators.forEach((v, idx) => {
          if (idx === this.winnerIndex) return;
          this.setStationOpacity(v, 1.0 - zoomP);
        });
        if (this.simTimer >= 0.9) {
          this.validators.forEach((v, idx) => {
            if (idx !== this.winnerIndex) {
              this.setStationOpacity(v, 0);
            }
          });
          this.simState = 'pos_loading';
          this.simTimer = 0;
          this.applyModeVisuals();
          this.updateTooltipsDOM();
          this.renderLeftPanel();
        }
      }

      // 2D. PoS — Temps 4 : Gros plan — chargement des caisses puis rotation et verrouillage du Nonce (2.0 s)
      if (this.simState === 'pos_loading') {
        this.simTimer += dt;
        const winnerVal = this.validators[this.winnerIndex];

        if (winnerVal) {
          winnerVal.wheelScale = 1.0;
          winnerVal.powNodeGroup.scale.setScalar(1.0);

          const loadP = Math.min(this.simTimer / 0.85, 1.0);
          winnerVal.loadProgress = loadP;
          this.applyCratesLoadProgress(winnerVal, loadP);

          if (this.simTimer >= 0.85) {
            const dialP = Math.min((this.simTimer - 0.85) / 0.8, 1.0);
            const liveCran = Math.max(1, Math.floor(winnerVal.targetCrans * dialP));
            if (liveCran !== winnerVal.currentCrans) {
              winnerVal.currentCrans = liveCran;
              this.renderStationWheelDial(
                winnerVal.dialCanvas,
                winnerVal.dialTex,
                liveCran,
                this.posSealedInCloseUp ? '#10b981' : '#facc15'
              );
              if (winnerVal.candidateBlock && winnerVal.candidateWagon) {
                winnerVal.candidateBlock.nonce = liveCran;
                winnerVal.candidateWagon.renderPlates();
              }
              this.updateTooltipsDOM();
            }
            const angle = liveCran * (Math.PI / 4);
            winnerVal.currentAngle = THREE.MathUtils.lerp(winnerVal.currentAngle, angle, Math.min(1, dt * 18));
            if (winnerVal.wheelMesh) {
              winnerVal.wheelMesh.rotation.set(Math.PI / 2, winnerVal.currentAngle, 0);
            }
            if (winnerVal.candidateWagon?.nonceWheel) {
              winnerVal.candidateWagon.nonceWheel.rotation.set(Math.PI / 2, winnerVal.currentAngle, 0);
            }
          }

          if (this.simTimer >= 1.65 && !this.posSealedInCloseUp) {
            this.posSealedInCloseUp = true;
            this.sealWinnerAndPrepareCoupling(this.winnerIndex, winnerVal.targetCrans, null);
          }

          if (this.simTimer >= 2.0) {
            this.simState = 'pos_zoom_out';
            this.simTimer = 0;
            if (cameraController) {
              cameraController.moveTo(this.overviewCamPos, this.overviewCamTarget, 0.85);
            }
            this.applyModeVisuals();
            this.updateTooltipsDOM();
            this.renderLeftPanel();
          }
        }
      }

      // 2E. PoS — Temps 5A : Dezoom vers la vue d'ensemble (0.85 s, les 2 autres gares restent invisibles)
      if (this.simState === 'pos_zoom_out') {
        this.simTimer += dt;
        if (this.simTimer >= 0.85) {
          this.simState = 'pos_coupling';
          this.simTimer = 0;
          this.applyModeVisuals();
          this.updateTooltipsDOM();
          this.renderLeftPanel();
        }
      }

      // 3. Temps final commun (PoW & PoS) : Raccordement du wagon gagnant au train en circulation
      if (this.simState === 'pow_coupling' || this.simState === 'pos_coupling') {
        this.simTimer += dt;
        const couplingDuration = this.mode === 'pow' ? 1.5 : 1.35;
        const p = Math.min(this.simTimer / couplingDuration, 1.0);
        const eased = p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;

        const winnerVal = this.validators[this.winnerIndex];
        if (winnerVal?.candidateWagon && winnerVal.trackCurve) {
          const wagon = winnerVal.candidateWagon;
          const pos = winnerVal.trackCurve.getPoint(eased);
          wagon.position.copy(pos);
          wagon.scale.setScalar(THREE.MathUtils.lerp(this.sidingScale, 1.0, eased));

          // Oriente doucement le wagon vers l'axe X a l'approche du train
          const tangent = winnerVal.trackCurve.getTangent(eased);
          const yaw = Math.atan2(-tangent.z, tangent.x) * (1 - eased * eased);
          wagon.rotation.y = yaw;
          wagon.animateWheels(wheelPhase);

          if (wagon.couplerGroup && p >= 0.72) {
            wagon.couplerGroup.visible = true;
          }
        }

        if (p >= 1.0) {
          if (this.mode === 'pow') this.hasTestedPoW = true;
          else this.hasTestedPoS = true;

          this.simState = 'done';
          this.wasCoupled = true;
          this.couplerFlashAlpha = 1.0;

          if (winnerVal?.candidateWagon) {
            winnerVal.candidateWagon.position.copy(this.coupledTargetPos);
            winnerVal.candidateWagon.rotation.set(0, 0, 0);
            winnerVal.candidateWagon.scale.setScalar(1.0);
            if (winnerVal.candidateWagon.couplerGroup) {
              winnerVal.candidateWagon.couplerGroup.visible = true;
            }
          }

          this.applyModeVisuals();
          this.updateTooltipsDOM();
          this.renderLeftPanel('#s6-result-box');
        }
      }

      // Maintien de la rotation des roues du wagon raccordé avec le convoi en mouvement
      if (this.simState === 'done') {
        const winnerWagon = this.validators[this.winnerIndex]?.candidateWagon;
        if (winnerWagon) {
          winnerWagon.animateWheels(wheelPhase);
        }
      }

      // Deplacement fluide du projecteur 3D en mode PoS
      if (this.lotteryHaloGroup && this.lotteryHaloGroup.visible) {
        const targetIdx = this.simState === 'pos_lottery' ? this.rouletteHighlightIndex : this.winnerIndex;
        const targetV = this.validatorData[targetIdx];
        this.lotteryHaloX = THREE.MathUtils.lerp(this.lotteryHaloX, targetV.x, Math.min(1, dt * 16));
        this.lotteryHaloZ = THREE.MathUtils.lerp(this.lotteryHaloZ, targetV.z, Math.min(1, dt * 16));
        this.lotteryHaloGroup.position.set(this.lotteryHaloX, -0.34, this.lotteryHaloZ + 0.08);
        this.lotteryHaloGroup.rotation.y += dt * 1.8;
      }

      // Anneau flash vert au verrouillage de l'attelage
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

      // Projection 2D des infobulles
      if (this.tooltipLayer && camera && this.validators.length === 3) {
        const width = window.innerWidth;
        const height = window.innerHeight;
        const toX = (v) => (v.x * 0.5 + 0.5) * width;
        const toY = (v) => (-v.y * 0.5 + 0.5) * height;

        const isZoomedClose = this.simState === 'pos_zoom_in' || this.simState === 'pos_loading';
        let anyBehind = false;
        const pts = this.validators.map((v, idx) => {
          const worldP = new THREE.Vector3(v.data.x - 0.12, -0.44 + 1.85, v.data.z - 0.82);
          const pr = worldP.project(camera);
          if (pr.z > 1 && (!isZoomedClose || idx === this.winnerIndex)) {
            anyBehind = true;
          }
          return { x: toX(pr), y: toY(pr) };
        });

        let wagonWorld = new THREE.Vector3(3.8, 0.95, 0);
        const winnerWagon = this.validators[this.winnerIndex]?.candidateWagon;
        if (
          winnerWagon &&
          (this.simState === 'pow_coupling' || this.simState === 'pos_coupling' || this.simState === 'done')
        ) {
          wagonWorld = winnerWagon.localToWorld(new THREE.Vector3(0, 1.15, 0));
        }
        const prW = wagonWorld.project(camera);
        if (prW.z > 1 && !isZoomedClose) anyBehind = true;
        const wagonPt = { x: toX(prW), y: toY(prW) };

        if (anyBehind) {
          this.tooltipLayer.style.opacity = '0';
          this.tooltipLayer.style.visibility = 'hidden';
        } else {
          const firstStationVisible = (this.validators[0]?.opacity ?? 1) > 0.01;
          const isCovered = !isZoomedClose && firstStationVisible && width > 768 && pts[0].x < 365;
          this.tooltipLayer.style.opacity = isCovered ? '0' : '1';
          this.tooltipLayer.style.visibility = isCovered ? 'hidden' : 'visible';

          const setElDisplay = (id, show, opacity = 1) => {
            const node = document.getElementById(id);
            if (!node) return;
            node.style.display = show ? '' : 'none';
            if (show) {
              node.style.opacity = opacity >= 0.995 ? '1' : opacity.toFixed(2);
            }
          };

          const showWagon = !isZoomedClose;
          setElDisplay('tooltip-s6-wagon', showWagon, 1);
          setElDisplay('s6-line-wagon', showWagon, 1);
          setElDisplay('s6-dot-in-wagon', showWagon, 1);
          setElDisplay('s6-dot-out-wagon', showWagon, 1);

          if (showWagon) {
            const wPillX = Math.max(460, Math.min(width - 140, wagonPt.x));
            const wPillY = Math.max(38, wagonPt.y - 44);
            const elWagon = document.getElementById('tooltip-s6-wagon');
            if (elWagon) {
              elWagon.style.transform = `translate3d(${wPillX.toFixed(1)}px, ${wPillY.toFixed(1)}px, 0) translate(-50%, -50%)`;
            }
            setLineAndDot(
              's6-line-wagon',
              's6-dot-in-wagon',
              's6-dot-out-wagon',
              wPillX,
              wPillY + 14,
              wagonPt.x,
              wagonPt.y
            );
          }

          const minX = 465;
          const maxX = Math.max(minX + 300, width - 130);
          const minGap = Math.min(185, (maxX - minX) / 2);
          const pillX0 = Math.max(minX, Math.min(maxX - minGap * 2, pts[0].x));
          const pillX1 = Math.max(pillX0 + minGap, Math.min(maxX - minGap, pts[1].x));
          const pillX2 = Math.max(pillX1 + minGap, Math.min(maxX, pts[2].x));
          const pillXs = [pillX0, pillX1, pillX2];

          pts.forEach((pt, idx) => {
            const vOp = this.validators[idx]?.opacity ?? 1;
            const showStation = vOp > 0.01 && (!isZoomedClose || idx === this.winnerIndex);
            setElDisplay(`tooltip-s6-${idx}`, showStation, vOp);
            setElDisplay(`s6-line-${idx}`, showStation, vOp);
            setElDisplay(`s6-dot-in-${idx}`, showStation, vOp);
            setElDisplay(`s6-dot-out-${idx}`, showStation, vOp);
            if (!showStation) return;

            const px = isZoomedClose ? Math.max(465, Math.min(width - 130, pt.x)) : pillXs[idx];
            const py = pt.y - 34;
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

  renderLeftPanel(scrollTargetSelector = null) {
    const panel = document.getElementById('step-panel-left');
    if (!panel) return;

    panel.classList.add('active');

    const inner = document.createElement('div');
    inner.className = 'step-panel-inner';

    const isPoW = this.mode === 'pow';
    const winner = this.validatorData[this.winnerIndex];
    const isDone = this.simState === 'done';
    const isStarted = this.simState !== 'idle';

    const actionButtonLabel = isPoW
      ? isStarted
        ? 'Relancer la course'
        : 'Lancer la course des 3 molettes'
      : isStarted
        ? 'Relancer le tirage au sort'
        : 'Lancer le tirage au sort';

    const modeExplanationHTML = isPoW
      ? `
        <div class="share-meaning-banner" style="border-left-color: #38bdf8;">
          <strong>Course simultanée :</strong> chaque gare prépare son wagon avec ses propres marchandises et cherche son propre Nonce.
          <div style="margin-top: 5px; color: #cbd5e1;">
            La première qui trouve raccroche son wagon au train. Les autres gares ont tourné pour rien.
          </div>
        </div>
        <div class="panel-hint-row">
          Puissance : Gare A (${this.validatorData[0].probLabel}), Gare B (${this.validatorData[1].probLabel}), Gare C (${this.validatorData[2].probLabel}).
        </div>
      `
      : `
        <div class="share-meaning-banner" style="border-left-color: #a855f7;">
          <strong>Tirage au sort :</strong> le réseau sélectionne d'abord une seule gare selon sa caution de jetons (plus de jetons, plus de chances de gagner).
          <div style="margin-top: 5px; color: #cbd5e1;">
            Seule la gare élue prépare son wagon et l'attelle, sans aucune compétition d'énergie.
          </div>
        </div>
        <div class="pos-lottery-track">
          <div id="s6-seg-0" class="pos-lottery-segment seg-a ${(this.simState === 'pos_selected' || this.simState === 'pos_zoom_in' || this.simState === 'pos_loading' || this.simState === 'pos_zoom_out' || this.simState === 'pos_coupling' || isDone) && this.winnerIndex === 0 ? 'winner' : ''}">Gare A (50 %)</div>
          <div id="s6-seg-1" class="pos-lottery-segment seg-b ${(this.simState === 'pos_selected' || this.simState === 'pos_zoom_in' || this.simState === 'pos_loading' || this.simState === 'pos_zoom_out' || this.simState === 'pos_coupling' || isDone) && this.winnerIndex === 1 ? 'winner' : ''}">Gare B (35 %)</div>
          <div id="s6-seg-2" class="pos-lottery-segment seg-c ${(this.simState === 'pos_selected' || this.simState === 'pos_zoom_in' || this.simState === 'pos_loading' || this.simState === 'pos_zoom_out' || this.simState === 'pos_coupling' || isDone) && this.winnerIndex === 2 ? 'winner' : ''}">C (15 %)</div>
          <div id="step6-lottery-cursor" class="pos-lottery-cursor" style="left: ${this.lotteryCursorPercent.toFixed(1)}%;"></div>
        </div>
      `;

    const resultHTML = isDone
      ? isPoW
        ? `
          <div class="consensus-result-card pow-result">
            <p class="consensus-result-text">
              La <strong>${winner.name}</strong> a trouvé le <strong>Nonce #${this.winningNonce}</strong> en premier et raccroche son wagon (${winner.crateLabel}) au convoi. Les 2 autres gares ont calculé pour rien.
            </p>
          </div>
        `
        : `
          <div class="consensus-result-card pos-result">
            <p class="consensus-result-text">
              La <strong>${winner.name}</strong> a été tirée au sort : elle seule a chargé ses ${winner.crateLabel}, verrouillé le <strong>Nonce #${this.winningNonce}</strong> et raccroché son wagon au convoi.
            </p>
          </div>
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
            Le convoi roule en arrière-plan. Au premier plan, les <strong>Gares A, B et C</strong> préparent chacune leur wagon candidat avec leurs propres caisses. Comparez les deux mécanismes de consensus : <strong>POW (Proof Of Work)</strong> et le <strong>Proof of Stake (PoS)</strong>.
          </p>
        </article>

        <article class="step-card action-card animate-fade">
          <div class="difficulty-selector-row" role="tablist" aria-label="Choix de la méthode">
            <button id="btn-tab-pow" class="btn-diff-option ${isPoW ? 'active' : ''}" role="tab" aria-selected="${isPoW}">
              <span>PoW (Course)</span>
            </button>
            <button id="btn-tab-pos" class="btn-diff-option ${!isPoW ? 'active' : ''}" role="tab" aria-selected="${!isPoW}">
              <span>PoS (Loterie)</span>
            </button>
          </div>

          ${modeExplanationHTML}

          <button id="btn-step6-run" class="btn-panel-primary">
            <span>${actionButtonLabel}</span>
          </button>

          <div id="s6-result-box">${resultHTML}</div>
        </article>

        ${(this.hasTestedPoW || this.hasTestedPoS) ? `
          <article class="step-card keypoint-card animate-fade">
            <h4 class="card-title keypoint-title">Point clé : Preuve de Travail (PoW) vs Preuve d'Enjeu (PoS)</h4>
            <p class="keypoint-text">
              En <strong>PoW (Bitcoin)</strong>, toutes les gares chargent leur wagon et cherchent en même temps : le travail des perdantes est annulé. En <strong>PoS (Ethereum)</strong>, le réseau choisit d'abord une seule gare selon sa caution : seule celle-ci prépare, scelle et accroche son wagon.
            </p>
          </article>
        ` : ''}

        <nav class="step-nav-bar animate-fade">
          <button id="btn-step6-action-prev" class="btn-panel-ghost">
            <span class="btn-arrow">&larr;</span>
            <span>Étape 5 : Minage</span>
          </button>
          <button id="btn-step6-action-next" class="btn-panel-primary">
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
    document.getElementById('btn-tab-pow')?.addEventListener('click', () => {
      this.setMode('pow');
    });

    document.getElementById('btn-tab-pos')?.addEventListener('click', () => {
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
