import * as THREE from 'three';
import { hashToColorHex } from '../three/WagonMesh.js';

/**
 * Étape 5 : Validation et minage (Proof of Work).
 * Métaphore corrigée et limpide :
 * - Le train est arrêté à quai devant une Gare-Atelier (un nœud mineur du réseau).
 * - Un nouveau wagon (Wagon #2) attend d'être validé et attelé au convoi.
 * - C'est la Gare-Atelier qui travaille et surchauffe en faisant tourner à toute vitesse
 *   la molette mécanique du Nonce sur le châssis du wagon jusqu'à trouver un Hash
 *   commençant par le nombre de zéros exigé par la difficulté ("0", "00" ou "000").
 * - Dès que le bon Nonce est trouvé, l'attelage se verrouille et le train repart.
 */
export const step5 = {
  id: 5,
  title: 'Validation et minage',
  ctx: null,

  rafId: null,
  miningGroup: null,
  stationBeaconMat: null,
  stationFurnaceMat: null,
  couplerArmMesh: null,
  sparks: [],
  overheatSmoke: [],
  heatLight: null,

  tooltipLayer: null,
  activeSpotId: null,

  difficulty: 1, // 1 ("0"), 2 ("00") ou 3 ("000") zéros requis
  isMining: false,
  isMined: false,
  hasEverMined: false,
  currentNonce: 0,
  currentHash: '7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069',
  heatLevel: 0,

  // Résultats réels du tirage SHA-256
  attemptsDone: 0,
  realAttempts: 0,
  foundNonce: 0,
  foundHash: '',
  animFramesDone: 0,
  animTotalFrames: 45,

  init(context) {
    this.ctx = context;
  },

  enter() {
    const { trainConvoy, cameraController, environment } = this.ctx;

    this.difficulty = 1;
    this.isMining = false;
    this.isMined = false;
    this.hasEverMined = false;
    this.activeSpotId = null;
    this.heatLevel = 0;
    this.attemptsDone = 0;
    this.realAttempts = 0;
    this.foundNonce = 0;
    this.foundHash = '';

    if (cameraController) {
      cameraController.setViewOffset(210);
    }

    // Le train s'arrête en gare pour faire valider et atteler son nouveau wagon
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

    this.prepareUnminedWagon();
    this.buildStationWorkshop();
    this.setupTooltipsLayer();
    this.createMiningTooltips();

    // Cadrage sur le Wagon #2 arrêté devant la Gare-Atelier
    const wagon2Pos = trainConvoy ? trainConvoy.getWagonPosition(2) : new THREE.Vector3(7.6, 0, 0);
    if (cameraController) {
      cameraController.moveTo(
        new THREE.Vector3(wagon2Pos.x - 0.2, 1.85, 4.8),
        new THREE.Vector3(wagon2Pos.x, 0.55, -0.3),
        1.2
      );
    }

    this.startAnimationLoop();
    this.renderLeftPanel();
  },

  exit() {
    this.stopAnimationLoop();

    if (this.tooltipLayer) {
      this.tooltipLayer.remove();
      this.tooltipLayer = null;
    }

    if (this.miningGroup && this.ctx?.scene) {
      this.ctx.scene.remove(this.miningGroup);
      this.miningGroup = null;
    }

    this.sparks = [];
    this.overheatSmoke = [];
    this.heatLight = null;
    this.stationBeaconMat = null;
    this.stationFurnaceMat = null;
    this.couplerArmMesh = null;

    const panel = document.getElementById('step-panel-left');
    if (panel) {
      const inner = panel.querySelector('.step-panel-inner');
      if (inner) inner.remove();
    }
  },

  /**
   * Place le Wagon #2 dans un état initial "non miné" (son hash ne commence pas par 0)
   * afin qu'il soit en attente de validation par la gare.
   */
  prepareUnminedWagon() {
    const { trainConvoy } = this.ctx;
    const wagon2 = trainConvoy?.getWagon(2);
    const block2 = trainConvoy?.getBlock(2);
    if (!wagon2 || !block2) return;

    block2._miningSalt = 'attente-gare';
    block2.nonce = 0;
    block2.hash = block2.calculateHash();
    while (block2.hash.startsWith('0')) {
      block2.nonce++;
      block2.hash = block2.calculateHash();
    }

    this.currentNonce = block2.nonce;
    this.currentHash = block2.hash;

    wagon2.colorHash.set(hashToColorHex(block2.hash));
    wagon2.renderPlates();
  },

  /**
   * Construit la Gare-Atelier de minage (Nœud mineur) juste derrière le Wagon #2 (x = 7.6, z = -1.75),
   * avec sa cheminée industrielle, sa chaudière de calcul et ses particules de surchauffe.
   */
  buildStationWorkshop() {
    const { scene, trainConvoy } = this.ctx;
    if (!scene) return;

    if (this.miningGroup) {
      scene.remove(this.miningGroup);
    }

    this.miningGroup = new THREE.Group();
    this.sparks = [];
    this.overheatSmoke = [];

    const wagon2Pos = trainConvoy ? trainConvoy.getWagonPosition(2) : new THREE.Vector3(7.6, 0, 0);
    const gx = wagon2Pos.x;
    const gz = -1.75;

    const stationRoot = new THREE.Group();
    stationRoot.position.set(gx, 0, gz);
    this.miningGroup.add(stationRoot);

    // 1. Quai en pierre / béton bordant les rails
    const platformGeo = new THREE.BoxGeometry(3.6, 0.32, 1.4);
    const platformMat = new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.8 });
    const platform = new THREE.Mesh(platformGeo, platformMat);
    platform.position.set(0, -0.18, 0.25);
    stationRoot.add(platform);

    // Ligne jaune de sécurité en bordure de quai
    const safetyGeo = new THREE.BoxGeometry(3.5, 0.02, 0.07);
    const safetyMat = new THREE.MeshBasicMaterial({ color: 0xfacc15 });
    const safetyLine = new THREE.Mesh(safetyGeo, safetyMat);
    safetyLine.position.set(0, -0.01, 0.86);
    stationRoot.add(safetyLine);

    // 2. Bâtiment de la Gare-Atelier
    const hallGeo = new THREE.BoxGeometry(2.6, 1.35, 1.05);
    const brickMat = new THREE.MeshStandardMaterial({ color: 0x7c2d12, roughness: 0.7 });
    const hall = new THREE.Mesh(hallGeo, brickMat);
    hall.position.set(0, 0.65, -0.05);
    stationRoot.add(hall);

    const roofGeo = new THREE.ConeGeometry(1.95, 0.65, 4);
    const roofMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.55, flatShading: true });
    const roof = new THREE.Mesh(roofGeo, roofMat);
    roof.position.set(0, 1.65, -0.05);
    roof.rotation.y = Math.PI / 4;
    roof.scale.set(1.1, 1.0, 0.65);
    stationRoot.add(roof);

    // Panneau frontal "GARE-ATELIER (MINEUR)"
    const signCanvas = document.createElement('canvas');
    signCanvas.width = 512;
    signCanvas.height = 96;
    const sctx = signCanvas.getContext('2d');
    sctx.fillStyle = '#0f172a';
    sctx.fillRect(0, 0, 512, 96);
    sctx.strokeStyle = '#38bdf8';
    sctx.lineWidth = 6;
    sctx.strokeRect(4, 4, 504, 88);
    sctx.fillStyle = '#f8fafc';
    sctx.font = 'bold 34px monospace';
    sctx.textAlign = 'center';
    sctx.textBaseline = 'middle';
    sctx.fillText('GARE-ATELIER (MINEUR)', 256, 50);
    const signTex = new THREE.CanvasTexture(signCanvas);
    const signMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(1.9, 0.36),
      new THREE.MeshBasicMaterial({ map: signTex })
    );
    signMesh.position.set(0, 1.15, 0.49);
    stationRoot.add(signMesh);

    // 3. Cœur thermique / Machine de hachage visible en façade de la gare
    const furnaceGeo = new THREE.BoxGeometry(1.2, 0.55, 0.12);
    this.stationFurnaceMat = new THREE.MeshStandardMaterial({
      color: 0xfef08a,
      emissive: 0xf59e0b,
      emissiveIntensity: 0.9,
      roughness: 0.2
    });
    const furnace = new THREE.Mesh(furnaceGeo, this.stationFurnaceMat);
    furnace.position.set(0, 0.52, 0.48);
    stationRoot.add(furnace);

    // 4. Grande cheminée industrielle d'extraction (à droite de la gare)
    const stackGeo = new THREE.CylinderGeometry(0.22, 0.28, 2.2, 16);
    const metalMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.8, roughness: 0.3 });
    const chimney = new THREE.Mesh(stackGeo, metalMat);
    chimney.position.set(1.05, 1.25, -0.15);
    stationRoot.add(chimney);

    // 5. Sémaphore lumineux de validation (à gauche du quai)
    const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 1.6, 8), metalMat);
    mast.position.set(-1.45, 0.8, 0.45);
    stationRoot.add(mast);

    this.stationBeaconMat = new THREE.MeshStandardMaterial({
      color: 0xfacc15,
      emissive: 0xeab308,
      emissiveIntensity: 1.8
    });
    const beacon = new THREE.Mesh(new THREE.SphereGeometry(0.14, 16, 16), this.stationBeaconMat);
    beacon.position.set(-1.45, 1.62, 0.45);
    stationRoot.add(beacon);

    // 6. Portique / Bras de transmission reliant la gare au châssis du Wagon #2
    const armGeo = new THREE.CylinderGeometry(0.055, 0.055, 1.6, 12);
    armGeo.rotateX(Math.PI / 2);
    const armMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      emissive: 0xd97706,
      emissiveIntensity: 0.6,
      metalness: 0.7,
      roughness: 0.3
    });
    this.couplerArmMesh = new THREE.Mesh(armGeo, armMat);
    this.couplerArmMesh.position.set(gx, 0.2, -0.8);
    this.miningGroup.add(this.couplerArmMesh);

    // 7. Lumière de surchauffe thermique
    this.heatLight = new THREE.PointLight(0xff5500, 0, 8.0);
    this.heatLight.position.set(gx, 1.2, -0.6);
    this.miningGroup.add(this.heatLight);

    // 8. Étincelles jaillissant de la machine de la gare et de la molette du Nonce
    const sparkGeo = new THREE.BoxGeometry(0.055, 0.055, 0.055);
    for (let i = 0; i < 36; i++) {
      const sparkMat = new THREE.MeshBasicMaterial({
        color: i % 2 === 0 ? 0xfacc15 : 0xf97316,
        transparent: true,
        opacity: 0
      });
      const spark = new THREE.Mesh(sparkGeo, sparkMat);
      spark.visible = false;
      spark.userData = {
         nearWheel: i < 18,
        vx: (Math.random() - 0.5) * 2.8,
        vy: 1.0 + Math.random() * 2.5,
        vz: (Math.random() - 0.5) * 2.5,
        age: Math.random(),
        lifetime: 0.4 + Math.random() * 0.35
      };
      this.miningGroup.add(spark);
      this.sparks.push(spark);
    }

    // 9. Panache de fumée sortant de la cheminée de la Gare-Atelier
    const smokeGeo = new THREE.SphereGeometry(0.22, 10, 10);
    for (let i = 0; i < 18; i++) {
      const smokeMat = new THREE.MeshStandardMaterial({
        color: 0xfb923c,
        emissive: 0x9a3412,
        emissiveIntensity: 0.6,
        transparent: true,
        opacity: 0,
        roughness: 0.9
      });
      const puff = new THREE.Mesh(smokeGeo, smokeMat);
      puff.visible = false;
      puff.userData = {
        age: (i / 18) * 1.2,
        lifetime: 1.2
      };
      this.miningGroup.add(puff);
      this.overheatSmoke.push(puff);
    }

    scene.add(this.miningGroup);
  },

  /**
   * Initialise le conteneur DOM pour les infobulles 3D projetées.
   */
  setupTooltipsLayer() {
    const hud = document.getElementById('hud');
    if (!hud) return;

    if (!this.tooltipLayer) {
      this.tooltipLayer = document.createElement('div');
      this.tooltipLayer.id = 'step5-tooltips-layer';
      this.tooltipLayer.className = 'scene-tooltips-layer';
      hud.appendChild(this.tooltipLayer);
    }
    this.tooltipLayer.innerHTML = '';
  },

  /**
   * Construit les 2 infobulles SVG pointant vers l'étiquette Hash et la molette Nonce du Wagon #2.
   */
  createMiningTooltips() {
    if (!this.tooltipLayer) return;

    const { trainConvoy } = this.ctx;
    const wagon2 = trainConvoy?.getWagon(2);
    if (!wagon2) return;

    const colorHash = '#' + wagon2.colorHash.getHexString();
    const colorNonce = '#f59e0b';
    const hashShort = this.currentHash.substring(0, 10);

    this.tooltipLayer.innerHTML = `
      <svg id="step5-tooltips-svg" style="position: absolute; inset: 0; width: 100%; height: 100%; pointer-events: none; overflow: visible; z-index: 10;">
        <line id="s5-line-hash" stroke="${colorHash}" stroke-width="2" stroke-linecap="round" opacity="0.9" />
        <circle id="s5-dot-hash-out" r="7" fill="none" stroke="${colorHash}" stroke-width="1.5" opacity="0.8" />
        <circle id="s5-dot-hash-in" r="3.5" fill="${colorHash}" />

        <line id="s5-line-nonce" stroke="${colorNonce}" stroke-width="2" stroke-linecap="round" opacity="0.9" />
        <circle id="s5-dot-nonce-out" r="7" fill="none" stroke="${colorNonce}" stroke-width="1.5" opacity="0.8" />
        <circle id="s5-dot-nonce-in" r="3.5" fill="${colorNonce}" />
      </svg>

      <!-- Infobulle 1 : Hash du Wagon #2 -->
      <div id="tooltip-s5-hash" class="scene-tooltip" style="--spot-color: ${colorHash}; z-index: 12;">
        <button type="button" class="scene-tooltip-pill">
          <span class="scene-tooltip-dot"></span>
          <span class="scene-tooltip-label">Hash : <code id="s5-pill-hash-code">${hashShort}...</code></span>
        </button>
        <div class="scene-tooltip-card">
          <div class="scene-tooltip-card-title">Empreinte calculée (Wagon #2)</div>
          <p class="scene-tooltip-card-text">Pour que le wagon soit accepté par le réseau, ce Hash doit commencer par le nombre de zéros imposé par la difficulté.</p>
        </div>
      </div>

      <!-- Infobulle 2 : Molette du Nonce (placée sous le wagon) -->
      <div id="tooltip-s5-nonce" class="scene-tooltip tooltip-below" style="--spot-color: ${colorNonce}; z-index: 12;">
        <button type="button" class="scene-tooltip-pill">
          <span class="scene-tooltip-dot"></span>
          <span class="scene-tooltip-label">Molette Nonce : <code id="s5-pill-nonce-code">${this.currentNonce}</code></span>
        </button>
        <div class="scene-tooltip-card">
          <div class="scene-tooltip-card-title">Compteur mécanique (Nonce)</div>
          <p class="scene-tooltip-card-text">La Gare-Atelier fait tourner cette molette cran par cran jusqu'à obtenir un Hash conforme sans modifier les transactions.</p>
        </div>
      </div>
    `;

    ['hash', 'nonce'].forEach((id) => {
      const el = document.getElementById(`tooltip-s5-${id}`);
      el?.addEventListener('pointerdown', (e) => e.stopPropagation());
      el?.querySelector('.scene-tooltip-pill')?.addEventListener('click', (e) => {
        e.stopPropagation();
        this.activeSpotId = this.activeSpotId === id ? null : id;
        document.getElementById('tooltip-s5-hash')?.classList.toggle('active', this.activeSpotId === 'hash');
        document.getElementById('tooltip-s5-nonce')?.classList.toggle('active', this.activeSpotId === 'nonce');
      });
    });
  },

  /**
   * Retourne la moyenne théorique d'essais selon la difficulté hexadécimale (16^d).
   * @param {number} diff
   */
  getTheoreticalAverageLabel(diff) {
    if (diff === 1) return '16';
    if (diff === 2) return '256';
    return '4 096';
  },

  /**
   * Lance la recherche réelle du Nonce par la Gare-Atelier sur le Wagon #2.
   */
  startMining() {
    if (this.isMining) return;

    const convoy = this.ctx?.trainConvoy;
    if (!convoy || !convoy.blockchain) return;

    // Arrête le train à quai pendant le travail de la gare
    if (this.ctx?.environment) {
      this.ctx.environment.setSpeed(0);
    }

    // Exécute le vrai minage SHA-256 sur le dernier wagon (Wagon #2)
    const result = convoy.blockchain.mineLatestBlock(this.difficulty);

    this.foundNonce = result.nonce;
    this.realAttempts = result.attempts;
    this.foundHash = result.hash;

    this.isMining = true;
    this.isMined = false;
    this.attemptsDone = 0;
    this.currentNonce = 0;
    this.animFramesDone = 0;

    if (this.difficulty === 1) this.animTotalFrames = 38;
    else if (this.difficulty === 2) this.animTotalFrames = 62;
    else this.animTotalFrames = 92;

    this.renderLeftPanel();
  },

  /**
   * Génère un hash hexadécimal intermédiaire ne commençant pas par 0 pendant la recherche.
   */
  generateRandomHex(length = 24) {
    const firstChars = '123456789abcdef';
    const chars = '0123456789abcdef';
    let out = firstChars[Math.floor(Math.random() * firstChars.length)];
    for (let i = 1; i < length; i++) {
      out += chars[Math.floor(Math.random() * chars.length)];
    }
    return out;
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

    let lastStepTime = performance.now();

    const loop = () => {
      const now = performance.now();
      const dt = Math.min((now - lastStepTime) / 1000, 0.05);
      lastStepTime = now;

      const { trainConvoy, camera } = this.ctx;
      const wagon2 = trainConvoy?.getWagon(2);
      const block2 = trainConvoy?.getBlock(2);
      const wagon2Pos = trainConvoy ? trainConvoy.getWagonPosition(2) : new THREE.Vector3(7.6, 0, 0);

      if (this.isMining) {
        this.animFramesDone += 1;
        const progress = Math.min(this.animFramesDone / this.animTotalFrames, 1.0);
        this.heatLevel = Math.min(1.0, progress * 1.25);

        if (progress < 1.0) {
          this.attemptsDone = Math.max(1, Math.floor(this.realAttempts * progress));
          this.currentNonce = this.attemptsDone;
          this.currentHash = this.generateRandomHex(24);

          // Rotation physique rapide de la molette du Nonce sur le Wagon #2
          if (wagon2 && block2) {
            if (wagon2.nonceWheel) {
              wagon2.nonceWheel.rotateOnAxis(new THREE.Vector3(0, 1, 0), 0.55);
            }
            // Rafraîchit les plaques 3D toutes les 3 frames pour rester à 60 FPS
            if (this.animFramesDone % 3 === 0) {
              block2.nonce = this.currentNonce;
              block2.hash = this.currentHash;
              wagon2.colorHash.set(hashToColorHex(this.currentHash));
              wagon2.renderPlates();
            }
          }

          this.updateLiveMiningDOM();
        } else {
          // Nonce gagnant trouvé !
          this.attemptsDone = this.realAttempts;
          this.currentNonce = this.foundNonce;
          this.currentHash = this.foundHash;
          this.isMining = false;
          this.isMined = true;
          this.hasEverMined = true;
          this.heatLevel = 0.0;

          if (wagon2 && block2) {
            block2.nonce = this.foundNonce;
            block2.hash = this.foundHash;
            wagon2.colorHash.set(hashToColorHex(this.foundHash));
            wagon2.renderPlates();
          }

          if (trainConvoy) {
            trainConvoy.sync();
          }

          // Le convoi validé peut repartir
          if (this.ctx?.environment) {
            this.ctx.environment.setSpeed(2.2);
          }

          this.updateLiveMiningDOM();
          this.renderLeftPanel();
        }
      } else {
        this.heatLevel = THREE.MathUtils.lerp(this.heatLevel, 0, dt * 3.0);
      }

      // État mécanique de l'attelage et du voyant du Wagon #2
      if (wagon2) {
        if (wagon2.couplerGroup && wagon2.defaultCouplerPosition) {
          if (!this.isMined) {
            // En attente de validation : attelage abaissé
            wagon2.couplerGroup.position.y = wagon2.defaultCouplerPosition.y - 0.18;
            wagon2.couplerGroup.rotation.z = 0.16;
          } else {
            // Validé par la Preuve de Travail : attelage verrouillé
            wagon2.couplerGroup.position.copy(wagon2.defaultCouplerPosition);
            wagon2.couplerGroup.rotation.z = 0;
          }
        }
        if (wagon2.beaconMaterial) {
          if (this.isMining) {
            wagon2.beaconMaterial.color.setHex(0xf97316);
            wagon2.beaconMaterial.emissive.setHex(0xea580c);
            wagon2.beaconMaterial.emissiveIntensity = 2.2;
          } else if (this.isMined) {
            wagon2.beaconMaterial.color.setHex(0x10b981);
            wagon2.beaconMaterial.emissive.setHex(0x059669);
            wagon2.beaconMaterial.emissiveIntensity = 1.8;
          } else {
            wagon2.beaconMaterial.color.setHex(0xfacc15);
            wagon2.beaconMaterial.emissive.setHex(0xeab308);
            wagon2.beaconMaterial.emissiveIntensity = 1.5;
          }
        }
        if (wagon2.rearRingMaterial) {
          wagon2.rearRingMaterial.color.copy(wagon2.colorHash);
          wagon2.rearRingMaterial.emissive.copy(wagon2.colorHash);
        }
      }

      // Effets thermiques sur la Gare-Atelier
      if (this.stationFurnaceMat) {
        if (this.isMining) {
          this.stationFurnaceMat.color.setHex(0xffedd5);
          this.stationFurnaceMat.emissive.setHex(0xef4444);
          this.stationFurnaceMat.emissiveIntensity = 1.8 + this.heatLevel * 2.2 + Math.sin(now * 0.04) * 0.4;
        } else if (this.isMined) {
          this.stationFurnaceMat.color.setHex(0xd1fae5);
          this.stationFurnaceMat.emissive.setHex(0x10b981);
          this.stationFurnaceMat.emissiveIntensity = 1.2;
        } else {
          this.stationFurnaceMat.color.setHex(0xfef08a);
          this.stationFurnaceMat.emissive.setHex(0xf59e0b);
          this.stationFurnaceMat.emissiveIntensity = 0.8;
        }
      }

      if (this.stationBeaconMat) {
        if (this.isMining) {
          this.stationBeaconMat.color.setHex(0xef4444);
          this.stationBeaconMat.emissive.setHex(0xdc2626);
        } else if (this.isMined) {
          this.stationBeaconMat.color.setHex(0x10b981);
          this.stationBeaconMat.emissive.setHex(0x059669);
        } else {
          this.stationBeaconMat.color.setHex(0xfacc15);
          this.stationBeaconMat.emissive.setHex(0xeab308);
        }
      }

      if (this.heatLight) {
        if (this.isMining) {
          this.heatLight.color.setHex(0xff4500);
          this.heatLight.intensity = 2.5 + this.heatLevel * 4.5 + Math.random() * 1.5;
        } else if (this.isMined) {
          this.heatLight.color.setHex(0x10b981);
          this.heatLight.intensity = 1.8;
        } else {
          this.heatLight.intensity = 0;
        }
      }

      // Étincelles sur la Gare-Atelier et sur la molette du Nonce
      this.sparks.forEach((spark) => {
        if (this.isMining) {
          spark.visible = true;
          spark.userData.age += dt;
          if (spark.userData.age >= spark.userData.lifetime) {
            spark.userData.age = 0;
            if (spark.userData.nearWheel) {
              spark.position.set(
                wagon2Pos.x + (Math.random() - 0.5) * 0.35,
                0.2 + (Math.random() - 0.5) * 0.25,
                0.68 + (Math.random() - 0.5) * 0.2
              );
            } else {
              spark.position.set(
                wagon2Pos.x + (Math.random() - 0.5) * 1.4,
                0.5 + Math.random() * 0.5,
                -1.25 + (Math.random() - 0.5) * 0.3
              );
            }
          } else {
            spark.position.x += spark.userData.vx * dt;
            spark.position.y += spark.userData.vy * dt;
            spark.position.z += spark.userData.vz * dt;
            spark.material.opacity = 1 - spark.userData.age / spark.userData.lifetime;
          }
        } else {
          spark.visible = false;
        }
      });

      // Panache de fumée à la sortie de la cheminée de la Gare-Atelier
      this.overheatSmoke.forEach((puff) => {
        if (this.isMining) {
          puff.visible = true;
          puff.userData.age += dt * (1.4 + this.difficulty * 0.4);
          if (puff.userData.age >= puff.userData.lifetime) {
            puff.userData.age = 0;
            puff.position.set(wagon2Pos.x + 1.05, 2.38, -1.9);
            puff.scale.setScalar(0.38);
          } else {
            const r = puff.userData.age / puff.userData.lifetime;
            puff.position.x += dt * 1.2;
            puff.position.y += dt * 2.4;
            puff.scale.setScalar(0.38 + r * 2.1);
            puff.material.opacity = (1 - r) * 0.65;
          }
        } else {
          puff.visible = false;
        }
      });

      // Projection 2D des 2 infobulles SVG sur le Wagon #2
      if (this.tooltipLayer && camera && wagon2) {
        const width = window.innerWidth;
        const height = window.innerHeight;

        const pHashPlate = wagon2.localToWorld(new THREE.Vector3(0.0, 0.62, 0.605));
        const pNonce = wagon2.localToWorld(new THREE.Vector3(0.0, 0.2, 0.71));

        const prHash = pHashPlate.project(camera);
        const prNonce = pNonce.project(camera);

        if (prHash.z > 1 || prNonce.z > 1) {
          this.tooltipLayer.style.opacity = '0';
          this.tooltipLayer.style.visibility = 'hidden';
        } else {
          const toX = (v) => (v.x * 0.5 + 0.5) * width;
          const toY = (v) => (-v.y * 0.5 + 0.5) * height;

          const hx = toX(prHash);
          const hy = toY(prHash);
          const nx = toX(prNonce);
          const ny = toY(prNonce);

          const isCovered = width > 768 && Math.min(hx, nx) < 410;
          this.tooltipLayer.style.opacity = isCovered ? '0' : '1';
          this.tooltipLayer.style.visibility = isCovered ? 'hidden' : 'visible';

          const pillHashX = Math.max(460, hx);
          const pillHashY = hy - 68;

          const pillNonceX = Math.max(460, nx);
          const pillNonceY = ny + 64;

          const elHash = document.getElementById('tooltip-s5-hash');
          const elNonce = document.getElementById('tooltip-s5-nonce');
          if (elHash) {
            elHash.style.transform = `translate3d(${pillHashX.toFixed(1)}px, ${pillHashY.toFixed(1)}px, 0) translate(-50%, -50%)`;
          }
          if (elNonce) {
            elNonce.style.transform = `translate3d(${pillNonceX.toFixed(1)}px, ${pillNonceY.toFixed(1)}px, 0) translate(-50%, -50%)`;
          }

          setLineAndDot('s5-line-hash', 's5-dot-hash-in', 's5-dot-hash-out', pillHashX, pillHashY + 14, hx, hy);
          setLineAndDot('s5-line-nonce', 's5-dot-nonce-in', 's5-dot-nonce-out', pillNonceX, pillNonceY - 14, nx, ny);
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

  updateLiveMiningDOM() {
    const nonceEl = document.getElementById('step5-nonce-val');
    const hashEl = document.getElementById('step5-hash-val');
    const statusEl = document.getElementById('step5-status-val');
    const pillHashEl = document.getElementById('s5-pill-hash-code');
    const pillNonceEl = document.getElementById('s5-pill-nonce-code');

    const avgLabel = this.getTheoreticalAverageLabel(this.difficulty);

    if (nonceEl) {
      nonceEl.textContent = `${this.currentNonce} (${this.attemptsDone} essais · moy. ${avgLabel})`;
    }
    if (hashEl) {
      hashEl.textContent = `${this.currentHash.substring(0, 14)}...`;
    }
    if (statusEl) {
      const deg = Math.round(110 + this.heatLevel * 650);
      statusEl.textContent = this.isMining
        ? `Gare en surchauffe (${deg}°C)`
        : 'Wagon validé et attelé au train';
    }
    if (pillHashEl) {
      pillHashEl.textContent = `${this.currentHash.substring(0, 10)}...`;
    }
    if (pillNonceEl) {
      pillNonceEl.textContent = String(this.currentNonce);
    }

    const { trainConvoy } = this.ctx;
    const wagon2 = trainConvoy?.getWagon(2);
    if (wagon2) {
      const colorHash = '#' + wagon2.colorHash.getHexString();
      const elHash = document.getElementById('tooltip-s5-hash');
      if (elHash) elHash.style.setProperty('--spot-color', colorHash);
      const lineHash = document.getElementById('s5-line-hash');
      const dotIn = document.getElementById('s5-dot-hash-in');
      const dotOut = document.getElementById('s5-dot-hash-out');
      if (lineHash) lineHash.setAttribute('stroke', colorHash);
      if (dotIn) dotIn.setAttribute('fill', colorHash);
      if (dotOut) dotOut.setAttribute('stroke', colorHash);
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

    const targetPrefix = '0'.repeat(this.difficulty);
    const avgLabel = this.getTheoreticalAverageLabel(this.difficulty);

    let nonceStatusHTML = `${this.currentNonce} (Moyenne théorique : ~${avgLabel} essais)`;
    if (this.isMining) {
      nonceStatusHTML = `${this.currentNonce} (${this.attemptsDone} essais... · moy. ~${avgLabel})`;
    } else if (this.isMined) {
      nonceStatusHTML = `Nonce ${this.foundNonce} trouvé en ${this.realAttempts} essais (moy. ~${avgLabel})`;
    }

    inner.innerHTML = `
      <header class="step-panel-header">
        <h2 class="step-panel-title">Validation et Minage</h2>
      </header>

      <div class="step-panel-scroll">
        <article class="step-card context-card animate-fade">
          <h3 class="card-title">Le travail de la Gare-Atelier</h3>
          <p>
            Ce n'est pas le train lui-même qui valide les blocs, mais <strong>une gare du réseau (un nœud mineur)</strong>.
          </p>
          <p>
            Le train est arrêté à quai : pour avoir le droit d'atteler le <strong>Wagon #2</strong>, la Gare-Atelier doit faire tourner sa <strong>molette du Nonce</strong> jusqu'à trouver un <strong>Hash commençant par "${targetPrefix}"</strong>.
          </p>
        </article>

        <article class="step-card action-card animate-fade">
          <h3 class="card-title">Atelier de Preuve de Travail (PoW)</h3>
          <p class="card-instruction">
            Choisissez le nombre de zéros exigé par le réseau puis lancez la machine de la gare :
          </p>

          <div class="difficulty-selector-row">
            <button id="btn-diff-1" class="btn-diff-option ${this.difficulty === 1 ? 'active' : ''}" ${this.isMining ? 'disabled' : ''}>
              <span>Facile ("0")</span>
            </button>
            <button id="btn-diff-2" class="btn-diff-option ${this.difficulty === 2 ? 'active' : ''}" ${this.isMining ? 'disabled' : ''}>
              <span>Standard ("00")</span>
            </button>
            <button id="btn-diff-3" class="btn-diff-option ${this.difficulty === 3 ? 'active' : ''}" ${this.isMining ? 'disabled' : ''}>
              <span>Difficile ("000")</span>
            </button>
          </div>

          <button id="btn-step5-mine" class="btn-panel-primary" ${this.isMining ? 'disabled' : ''}>
            <span>${this.isMining ? 'Rotation de la molette en cours...' : (this.isMined ? 'Relancer un nouveau tirage en gare' : 'Lancer le minage par la gare')}</span>
          </button>

          <div class="action-feedback-box ${this.isMined ? 'success' : (this.isMining ? 'error' : '')}">
            <div class="feedback-row">
              <span class="feedback-label">Cible exigée :</span>
              <span class="feedback-val">Hash débutant par "${targetPrefix}"</span>
            </div>
            <div class="feedback-row">
              <span class="feedback-label">Molette Nonce :</span>
              <span id="step5-nonce-val" class="feedback-val">${nonceStatusHTML}</span>
            </div>
            <div class="feedback-row">
              <span class="feedback-label">Hash obtenu :</span>
              <span id="step5-hash-val" class="feedback-val ${this.isMined ? 'success-val' : 'hash-val'}">${this.currentHash.substring(0, 14)}...</span>
            </div>
            <div class="feedback-row">
              <span class="feedback-label">État en gare :</span>
              <span id="step5-status-val" class="feedback-val ${this.isMined ? 'success-val' : (this.isMining ? 'error-val' : '')}">
                ${this.isMining ? 'Gare en surchauffe...' : (this.isMined ? 'Wagon validé et attelé au train' : 'Wagon en attente de minage')}
              </span>
            </div>
          </div>
        </article>

        ${this.hasEverMined ? `
          <article class="step-card keypoint-card animate-fade">
            <h4 class="card-title keypoint-title">Point clé : Difficile à trouver, instantané à vérifier</h4>
            <p class="keypoint-text">
              Trouver un Hash commençant par "${targetPrefix}" oblige la gare à tester en moyenne <strong>${avgLabel} combinaisons</strong> par force brute. En revanche, une fois le Nonce trouvé, toutes les autres gares du réseau vérifient le wagon en <strong>un seul calcul</strong>.
            </p>
          </article>
        ` : ''}

        <nav class="step-nav-bar animate-fade">
          <button id="btn-step5-action-prev" class="btn-panel-ghost">
            <span class="btn-arrow">&larr;</span>
            <span>Étape 4 : Réseau</span>
          </button>
          <button id="btn-step5-action-next" class="btn-panel-primary">
            <span>Étape 6 : Consensus</span>
            <span class="btn-arrow">&rarr;</span>
          </button>
        </nav>
      </div>
    `;

    panel.prepend(inner);
    this.setupEvents();
  },

  setupEvents() {
    [1, 2, 3].forEach((lvl) => {
      document.getElementById(`btn-diff-${lvl}`)?.addEventListener('click', () => {
        if (this.isMining) return;
        this.difficulty = lvl;
        this.isMined = false;
        if (this.ctx?.environment) {
          this.ctx.environment.setSpeed(0);
        }
        this.prepareUnminedWagon();
        this.updateLiveMiningDOM();
        this.renderLeftPanel();
      });
    });

    document.getElementById('btn-step5-mine')?.addEventListener('click', () => {
      this.startMining();
    });

    document.getElementById('btn-step5-action-prev')?.addEventListener('click', () => {
      if (typeof this.ctx.onPrevStep === 'function') {
        this.ctx.onPrevStep();
      }
    });

    document.getElementById('btn-step5-action-next')?.addEventListener('click', () => {
      if (typeof this.ctx.onNextStep === 'function') {
        this.ctx.onNextStep();
      }
    });
  }
};
