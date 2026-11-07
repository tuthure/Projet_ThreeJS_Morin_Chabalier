import * as THREE from 'three';
import { hashToColorHex } from '../three/WagonMesh.js';

/**
 * Étape 5 : Validation et minage (Proof of Work).
 * Mise en scène 3D centrée sur les wagons :
 * - À gauche : le convoi déjà validé (Locomotive #0 et Wagon #1), dont les Hashs
 *   commencent déjà par le nombre de zéros exigé ("0", "00" ou "000").
 * - À droite, à distance sur les rails (x = 9.35) : un nouveau Wagon #2 candidat,
 *   dont le Hash ne commence pas encore par des zéros et qui ne peut donc pas s'atteler.
 * - L'utilisateur peut :
 *   1) Cliquer directement sur la molette 3D du Nonce (ou son infobulle) pour
 *      tourner d'un cran (+1) à la main et constater que le Hash change mais reste refusé.
 *   2) Lancer le minage automatique dans le panneau gauche : la molette tourne à
 *      toute vitesse jusqu'à tomber sur un Hash commençant par les zéros requis,
 *      puis le Wagon #2 avance sur les rails (9.35 -> 7.60) et s'attelle au Wagon #1.
 *   3) S'il souhaite recommencer une fois le wagon attelé, le wagon attaché disparaît
 *      et un nouveau wagon candidat apparaît directement à distance (jamais de marche arrière).
 */
export const step5 = {
  id: 5,
  title: 'Validation et minage',
  ctx: null,

  rafId: null,
  fxGroup: null,
  sparks: [],
  wheelLight: null,
  couplerFlashRing: null,
  couplerFlashAlpha: 0,

  tooltipLayer: null,
  activeSpotId: null,

  // Raycaster pour cliquer directement sur la molette 3D du Nonce
  raycaster: new THREE.Raycaster(),
  pointerDownPos: { x: 0, y: 0 },
  isHoveringWheel: false,
  boundOnPointerMove: null,
  boundOnPointerDown: null,
  boundOnPointerUp: null,

  // Positions sur l'axe X du Wagon #2 (arrivée -> attente à distance -> attelé)
  spawnWagon2X: 9.45,
  unminedWagon2X: 8.55,
  minedWagon2X: 7.6,
  currentWagon2X: 8.55,
  currentWagon2Scale: 1.0,
  targetWheelAngle: 0,
  currentWheelAngle: 0,
  manualSparkTimer: 0,

  difficulty: 1, // 1 ("0"), 2 ("00") ou 3 ("000") zéros requis
  isMining: false,
  isMined: false,
  hasEverMined: false,
  manualClicksCount: 0,
  candidateCounter: 0,
  currentNonce: 0,
  currentHash: '7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069',

  // Résultats réels du tirage SHA-256 automatique
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
    this.manualClicksCount = 0;
    this.candidateCounter = 0;
    this.activeSpotId = null;
    this.attemptsDone = 0;
    this.realAttempts = 0;
    this.foundNonce = 0;
    this.foundHash = '';
    this.targetWheelAngle = 0;
    this.currentWheelAngle = 0;
    this.manualSparkTimer = 0;
    this.couplerFlashAlpha = 0;

    if (cameraController) {
      cameraController.setViewOffset(210);
    }

    // Le train reste à l'arrêt pendant toute l'étape 5
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

    this.prepareConvoyForDifficulty(false);
    this.buildWheelEffects();
    this.setupTooltipsLayer();
    this.createMiningTooltips();
    this.setupWheelPointerEvents();

    // Cadrage rapproché et centré sur la zone d'attelage et le Wagon #2 (avec le Wagon #1 visible à gauche)
    if (cameraController) {
      cameraController.moveTo(
        new THREE.Vector3(6.65, 1.55, 5.15),
        new THREE.Vector3(6.55, 0.45, 0),
        1.15
      );
    }

    this.startAnimationLoop();
    this.renderLeftPanel();
  },

  exit() {
    this.stopAnimationLoop();
    this.removeWheelPointerEvents();

    // Remet le Wagon #2 à sa place et son échelle nominales en quittant l'étape
    const wagon2 = this.ctx?.trainConvoy?.getWagon(2);
    if (wagon2) {
      wagon2.position.x = this.minedWagon2X;
      wagon2.scale.setScalar(1);
      if (wagon2.couplerGroup && wagon2.defaultCouplerPosition) {
        wagon2.couplerGroup.position.copy(wagon2.defaultCouplerPosition);
        wagon2.couplerGroup.rotation.z = 0;
      }
    }

    if (this.tooltipLayer) {
      this.tooltipLayer.remove();
      this.tooltipLayer = null;
    }

    if (this.fxGroup && this.ctx?.scene) {
      this.ctx.scene.remove(this.fxGroup);
      this.fxGroup = null;
    }

    this.sparks = [];
    this.wheelLight = null;
    this.couplerFlashRing = null;

    const panel = document.getElementById('step-panel-left');
    if (panel) {
      const inner = panel.querySelector('.step-panel-inner');
      if (inner) inner.remove();
    }
  },

  /**
   * Garantit la cohérence de toute la chaîne et fait apparaître un nouveau Wagon #2 candidat à distance :
   * - La Locomotive (#0) et le Wagon #1 commencent tous deux par le nombre de zéros exigé ("0", "00" ou "000").
   * - Le Wagon #2 (candidat) apparaît directement à distance à droite (sans jamais reculer depuis le train).
   * @param {boolean} [animateSpawn=true] - Si vrai, fait apparaître le nouveau wagon à distance avec une transition d'entrée.
   */
  prepareConvoyForDifficulty(animateSpawn = true) {
    const { trainConvoy } = this.ctx;
    if (!trainConvoy || !trainConvoy.blockchain) return;

    const chain = trainConvoy.blockchain.chain;
    const block0 = chain[0];
    const block1 = chain[1];
    const block2 = chain[2];
    const wagon1 = trainConvoy.getWagon(1);
    const wagon2 = trainConvoy.getWagon(2);
    if (!block0 || !block1 || !block2 || !wagon1 || !wagon2) return;

    this.candidateCounter += 1;

    // 1. Mine les wagons déjà présents dans le train selon la difficulté choisie
    block0.mineBlock(this.difficulty);
    block1.previousHash = block0.hash;
    block1.mineBlock(this.difficulty);

    // 2. Prépare un nouveau Wagon #2 dans un état initial "non miné" (son hash ne commence pas par '0')
    block2.previousHash = block1.hash;
    block2._miningSalt = `candidat-${this.candidateCounter}-diff-${this.difficulty}`;
    block2.nonce = 0;
    block2.hash = block2.calculateHash();
    while (block2.hash.startsWith('0')) {
      block2._miningSalt = `candidat-${Math.random().toString(36).substring(2, 7)}`;
      block2.hash = block2.calculateHash();
    }

    this.currentNonce = block2.nonce;
    this.currentHash = block2.hash;
    this.attemptsDone = 0;
    this.manualClicksCount = 0;
    this.isMined = false;
    this.isMining = false;
    this.targetWheelAngle = 0;
    this.currentWheelAngle = 0;

    // 3. Synchronise l'affichage des plaques et place immédiatement le nouveau wagon à distance à droite
    trainConvoy.sync();
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
   * Crée les étincelles de la molette du Nonce et l'anneau lumineux de verrouillage d'attelage.
   */
  buildWheelEffects() {
    const { scene } = this.ctx;
    if (!scene) return;

    if (this.fxGroup) {
      scene.remove(this.fxGroup);
    }

    this.fxGroup = new THREE.Group();
    this.sparks = [];

    // Lumière ambrée sur la molette pendant sa rotation
    this.wheelLight = new THREE.PointLight(0xf59e0b, 0, 3.5);
    this.fxGroup.add(this.wheelLight);

    // Étincelles jaillissant des crans de la molette du Nonce
    const sparkGeo = new THREE.BoxGeometry(0.045, 0.045, 0.045);
    for (let i = 0; i < 24; i++) {
      const sparkMat = new THREE.MeshBasicMaterial({
        color: i % 2 === 0 ? 0xfacc15 : 0xf97316,
        transparent: true,
        opacity: 0
      });
      const spark = new THREE.Mesh(sparkGeo, sparkMat);
      spark.visible = false;
      spark.userData = {
        vx: (Math.random() - 0.5) * 2.2,
        vy: 0.6 + Math.random() * 1.8,
        vz: 0.3 + Math.random() * 1.4,
        age: Math.random() * 0.35,
        lifetime: 0.28 + Math.random() * 0.25
      };
      this.fxGroup.add(spark);
      this.sparks.push(spark);
    }

    // Anneau flash vert au point d'attelage entre Wagon #1 et Wagon #2 lors de la validation
    const ringGeo = new THREE.TorusGeometry(0.24, 0.035, 12, 32);
    ringGeo.rotateY(Math.PI / 2);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x10b981,
      transparent: true,
      opacity: 0
    });
    this.couplerFlashRing = new THREE.Mesh(ringGeo, ringMat);
    this.couplerFlashRing.position.set(5.1, 0, 0);
    this.fxGroup.add(this.couplerFlashRing);

    scene.add(this.fxGroup);
  },

  /**
   * Permet de cliquer directement sur la molette 3D du Nonce du Wagon #2 pour la tourner d'un cran (+1).
   */
  setupWheelPointerEvents() {
    const canvas = document.getElementById('webgl');
    if (!canvas) return;

    this.removeWheelPointerEvents();

    const isIntersectingWheel = (clientX, clientY) => {
      const { camera, trainConvoy } = this.ctx;
      const wagon2 = trainConvoy?.getWagon(2);
      if (!camera || !wagon2 || !wagon2.nonceGroup) return false;

      const rect = canvas.getBoundingClientRect();
      const ndc = new THREE.Vector2(
        ((clientX - rect.left) / rect.width) * 2 - 1,
        -((clientY - rect.top) / rect.height) * 2 + 1
      );
      this.raycaster.setFromCamera(ndc, camera);
      const hits = this.raycaster.intersectObject(wagon2.nonceGroup, true);
      return hits.length > 0;
    };

    this.boundOnPointerMove = (e) => {
      if (this.isMining || this.isMined) {
        if (this.isHoveringWheel) {
          this.isHoveringWheel = false;
          canvas.style.cursor = '';
        }
        return;
      }
      const hit = isIntersectingWheel(e.clientX, e.clientY);
      if (hit !== this.isHoveringWheel) {
        this.isHoveringWheel = hit;
        canvas.style.cursor = hit ? 'pointer' : '';
      }
    };

    this.boundOnPointerDown = (e) => {
      this.pointerDownPos.x = e.clientX;
      this.pointerDownPos.y = e.clientY;
    };

    this.boundOnPointerUp = (e) => {
      if (this.isMining || this.isMined) return;
      const dx = e.clientX - this.pointerDownPos.x;
      const dy = e.clientY - this.pointerDownPos.y;
      if (Math.hypot(dx, dy) > 6) return; // Ignore un glisser-déposer de caméra

      if (isIntersectingWheel(e.clientX, e.clientY)) {
        this.stepManualNonce();
      }
    };

    canvas.addEventListener('pointermove', this.boundOnPointerMove);
    canvas.addEventListener('pointerdown', this.boundOnPointerDown);
    canvas.addEventListener('pointerup', this.boundOnPointerUp);
  },

  removeWheelPointerEvents() {
    const canvas = document.getElementById('webgl');
    if (canvas) {
      if (this.boundOnPointerMove) canvas.removeEventListener('pointermove', this.boundOnPointerMove);
      if (this.boundOnPointerDown) canvas.removeEventListener('pointerdown', this.boundOnPointerDown);
      if (this.boundOnPointerUp) canvas.removeEventListener('pointerup', this.boundOnPointerUp);
      canvas.style.cursor = '';
    }
    this.boundOnPointerMove = null;
    this.boundOnPointerDown = null;
    this.boundOnPointerUp = null;
    this.isHoveringWheel = false;
  },

  /**
   * Tourne manuellement la molette du Nonce d'un cran (+1) suite à un clic sur la molette 3D ou son infobulle.
   */
  stepManualNonce() {
    if (this.isMining || this.isMined) return;

    const { trainConvoy } = this.ctx;
    const wagon2 = trainConvoy?.getWagon(2);
    const block2 = trainConvoy?.getBlock(2);
    if (!wagon2 || !block2) return;

    this.manualClicksCount += 1;
    this.attemptsDone += 1;
    this.currentNonce += 1;
    this.targetWheelAngle += Math.PI / 4; // 1 cran = 45° (8 crans sur la molette)
    this.manualSparkTimer = 0.32;

    const targetPrefix = '0'.repeat(this.difficulty);
    block2.nonce = this.currentNonce;
    block2.hash = block2.calculateHash();

    // Sur les 3 premiers clics manuels, évite qu'un coup de chance (1/16 en difficulté 1)
    // ne tombe déjà sur un zéro afin que l'utilisateur observe bien le refus d'attelage.
    if (this.manualClicksCount <= 3 && block2.hash.startsWith(targetPrefix)) {
      while (block2.hash.startsWith(targetPrefix)) {
        block2._miningSalt = `manuel-${this.manualClicksCount}-${Math.random().toString(36).substring(2, 6)}`;
        block2.hash = block2.calculateHash();
      }
    }

    this.currentHash = block2.hash;
    const matchesTarget = this.currentHash.startsWith(targetPrefix);

    if (matchesTarget) {
      this.isMined = true;
      this.hasEverMined = true;
      this.foundNonce = this.currentNonce;
      this.foundHash = this.currentHash;
      this.realAttempts = this.attemptsDone;
      this.couplerFlashAlpha = 1.0;
    } else {
      this.isMined = false;
    }

    wagon2.colorHash.set(hashToColorHex(this.currentHash));
    wagon2.renderPlates();

    this.updateLiveMiningDOM();
    this.renderLeftPanel();
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
   * Construit les 3 infobulles SVG :
   * 1) Hash du Wagon #1 (déjà validé à gauche, commence par "0...")
   * 2) Hash du Wagon #2 (en attente à droite -> validé une fois miné)
   * 3) Molette Nonce du Wagon #2 (placée sous le wagon, cliquable pour tourner +1 cran)
   */
  createMiningTooltips() {
    if (!this.tooltipLayer) return;

    const { trainConvoy } = this.ctx;
    const wagon1 = trainConvoy?.getWagon(1);
    const block1 = trainConvoy?.getBlock(1);
    const wagon2 = trainConvoy?.getWagon(2);
    if (!wagon1 || !block1 || !wagon2) return;

    const colorW1 = '#10b981';
    const colorHash2 = '#' + wagon2.colorHash.getHexString();
    const colorNonce = '#f59e0b';
    const targetPrefix = '0'.repeat(this.difficulty);
    const hash1Short = block1.hash.substring(0, 8);
    const hash2Short = this.currentHash.substring(0, 8);

    this.tooltipLayer.innerHTML = `
      <svg id="step5-tooltips-svg" style="position: absolute; inset: 0; width: 100%; height: 100%; pointer-events: none; overflow: visible; z-index: 10;">
        <line id="s5-line-w1" stroke="${colorW1}" stroke-width="2" stroke-linecap="round" opacity="0.85" />
        <circle id="s5-dot-w1-out" r="6.5" fill="none" stroke="${colorW1}" stroke-width="1.5" opacity="0.8" />
        <circle id="s5-dot-w1-in" r="3" fill="${colorW1}" />

        <line id="s5-line-hash" stroke="${colorHash2}" stroke-width="2" stroke-linecap="round" opacity="0.9" />
        <circle id="s5-dot-hash-out" r="7" fill="none" stroke="${colorHash2}" stroke-width="1.5" opacity="0.8" />
        <circle id="s5-dot-hash-in" r="3.5" fill="${colorHash2}" />

        <line id="s5-line-nonce" stroke="${colorNonce}" stroke-width="2" stroke-linecap="round" opacity="0.9" />
        <circle id="s5-dot-nonce-out" r="7" fill="none" stroke="${colorNonce}" stroke-width="1.5" opacity="0.8" />
        <circle id="s5-dot-nonce-in" r="3.5" fill="${colorNonce}" />
      </svg>

      <!-- Infobulle 1 : Wagon #1 déjà validé dans le convoi -->
      <div id="tooltip-s5-w1" class="scene-tooltip" style="--spot-color: ${colorW1}; z-index: 11;">
        <button type="button" class="scene-tooltip-pill">
          <span class="scene-tooltip-dot"></span>
          <span class="scene-tooltip-label">Wagon #1 (Validé) : <code id="s5-pill-w1-code">${hash1Short}...</code></span>
        </button>
        <div class="scene-tooltip-card">
          <div class="scene-tooltip-card-title">Déjà miné et attelé</div>
          <p class="scene-tooltip-card-text">Comme la Locomotive #0, ce wagon a déjà été miné : son Hash commence bien par "${targetPrefix}".</p>
        </div>
      </div>

      <!-- Infobulle 2 : Hash du Wagon #2 candidat -->
      <div id="tooltip-s5-hash" class="scene-tooltip" style="--spot-color: ${colorHash2}; z-index: 12;">
        <button type="button" class="scene-tooltip-pill">
          <span class="scene-tooltip-dot"></span>
          <span class="scene-tooltip-label">Hash #2 : <code id="s5-pill-hash-code">${hash2Short}...</code> · <strong id="s5-pill-hash-badge" style="color: #fb923c;">Sans "${targetPrefix}" (Bloqué)</strong></span>
        </button>
        <div class="scene-tooltip-card">
          <div class="scene-tooltip-card-title">Condition d'attelage (Preuve de Travail)</div>
          <p class="scene-tooltip-card-text">Tant que ce Hash ne commence pas par "${targetPrefix}", le Wagon #2 reste bloqué à distance et ne peut pas rejoindre le train.</p>
        </div>
      </div>

      <!-- Infobulle 3 : Molette du Nonce (placée sous le Wagon #2, cliquable pour +1 cran) -->
      <div id="tooltip-s5-nonce" class="scene-tooltip tooltip-below" style="--spot-color: ${colorNonce}; z-index: 12;">
        <button type="button" class="scene-tooltip-pill" title="Cliquer pour tourner la molette d'un cran (+1)">
          <span class="scene-tooltip-dot"></span>
          <span class="scene-tooltip-label">Molette Nonce : <code id="s5-pill-nonce-code">${this.currentNonce}</code><span id="s5-pill-nonce-action"> · <span style="text-decoration: underline; color: #fde68a;">+1 cran</span></span></span>
        </button>
      </div>
    `;

    ['w1', 'hash'].forEach((id) => {
      const el = document.getElementById(`tooltip-s5-${id}`);
      el?.addEventListener('pointerdown', (e) => e.stopPropagation());
      el?.querySelector('.scene-tooltip-pill')?.addEventListener('click', (e) => {
        e.stopPropagation();
        this.activeSpotId = this.activeSpotId === id ? null : id;
        document.getElementById('tooltip-s5-w1')?.classList.toggle('active', this.activeSpotId === 'w1');
        document.getElementById('tooltip-s5-hash')?.classList.toggle('active', this.activeSpotId === 'hash');
      });
    });

    // Cliquer sur l'infobulle de la molette fait aussi tourner la molette d'un cran (+1)
    const nonceEl = document.getElementById('tooltip-s5-nonce');
    nonceEl?.addEventListener('pointerdown', (e) => e.stopPropagation());
    nonceEl?.querySelector('.scene-tooltip-pill')?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.stepManualNonce();
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
   * Lance la recherche automatique à haute vitesse du Nonce sur le Wagon #2.
   */
  startMining() {
    if (this.isMining) return;

    const convoy = this.ctx?.trainConvoy;
    if (!convoy || !convoy.blockchain) return;

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
    else this.animTotalFrames = 90;

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
      const wagon1 = trainConvoy?.getWagon(1);
      const wagon2 = trainConvoy?.getWagon(2);
      const block2 = trainConvoy?.getBlock(2);

      // 1. Animation du minage automatique
      if (this.isMining) {
        this.animFramesDone += 1;
        const progress = Math.min(this.animFramesDone / this.animTotalFrames, 1.0);

        if (progress < 1.0) {
          this.attemptsDone = Math.max(1, Math.floor(this.realAttempts * progress));
          this.currentNonce = this.attemptsDone;
          this.currentHash = this.generateRandomHex(24);
          this.targetWheelAngle += 0.62;

          if (wagon2 && block2 && this.animFramesDone % 3 === 0) {
            block2.nonce = this.currentNonce;
            block2.hash = this.currentHash;
            wagon2.colorHash.set(hashToColorHex(this.currentHash));
            wagon2.renderPlates();
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
          this.couplerFlashAlpha = 1.0;

          if (wagon2 && block2) {
            block2.nonce = this.foundNonce;
            block2.hash = this.foundHash;
            wagon2.colorHash.set(hashToColorHex(this.foundHash));
            wagon2.renderPlates();
          }

          this.updateLiveMiningDOM();
          this.renderLeftPanel();
        }
      }

      // 2. Position et échelle du Wagon #2 :
      //    - Apparition à distance (10.65 -> 9.35)
      //    - Une fois miné, avance vers la gauche (9.35 -> 7.60) pour s'atteler au Wagon #1
      if (wagon2) {
        const targetX = this.isMined ? this.minedWagon2X : this.unminedWagon2X;
        this.currentWagon2X = THREE.MathUtils.lerp(this.currentWagon2X, targetX, Math.min(1, dt * 6.5));
        this.currentWagon2Scale = THREE.MathUtils.lerp(this.currentWagon2Scale, 1.0, Math.min(1, dt * 9.0));
        wagon2.position.x = this.currentWagon2X;
        wagon2.scale.setScalar(this.currentWagon2Scale);

        // Rotation mécanique des crans de la molette du Nonce
        this.currentWheelAngle = THREE.MathUtils.lerp(
          this.currentWheelAngle,
          this.targetWheelAngle,
          Math.min(1, dt * 16.0)
        );
        if (wagon2.nonceWheel) {
          wagon2.nonceWheel.rotation.set(Math.PI / 2, this.currentWheelAngle, 0);
          const wheelMat = wagon2.nonceWheel.material;
          if (wheelMat) {
            wheelMat.emissiveIntensity = this.isMining
              ? 1.1
              : this.isHoveringWheel
                ? 0.75
                : 0.25;
          }
        }

        // État du bras d'attelage et du voyant du Wagon #2
        const isCoupledPosition = Math.abs(this.currentWagon2X - this.minedWagon2X) < 0.08 && this.isMined;
        if (wagon2.couplerGroup && wagon2.defaultCouplerPosition) {
          if (!isCoupledPosition) {
            wagon2.couplerGroup.position.y = wagon2.defaultCouplerPosition.y - 0.12;
            wagon2.couplerGroup.rotation.z = 0.12;
          } else {
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

      // 3. Étincelles sur la molette (pendant le minage auto ou lors d'un clic manuel +1 cran)
      if (this.manualSparkTimer > 0) {
        this.manualSparkTimer = Math.max(0, this.manualSparkTimer - dt);
      }
      const emitSparks = this.isMining || this.manualSparkTimer > 0;

      if (this.wheelLight) {
        this.wheelLight.position.set(this.currentWagon2X, 0.25, 0.95);
        this.wheelLight.intensity = emitSparks ? 2.4 : this.isHoveringWheel ? 0.9 : 0;
      }

      this.sparks.forEach((spark) => {
        if (emitSparks) {
          spark.visible = true;
          spark.userData.age += dt;
          if (spark.userData.age >= spark.userData.lifetime) {
            spark.userData.age = 0;
            spark.position.set(
              this.currentWagon2X + (Math.random() - 0.5) * 0.28,
              0.2 + (Math.random() - 0.5) * 0.24,
              0.7 + (Math.random() - 0.5) * 0.1
            );
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

      // 4. Flash d'attelage vert quand le Wagon #2 vient s'encastrer dans le Wagon #1
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

      // 5. Projection 2D des 3 infobulles SVG
      if (this.tooltipLayer && camera && wagon1 && wagon2) {
        const width = window.innerWidth;
        const height = window.innerHeight;

        const pW1Plate = wagon1.localToWorld(new THREE.Vector3(0.0, 0.62, 0.605));
        const pHashPlate = wagon2.localToWorld(new THREE.Vector3(0.0, 0.62, 0.605));
        const pNonce = wagon2.localToWorld(new THREE.Vector3(0.0, 0.2, 0.71));

        const prW1 = pW1Plate.project(camera);
        const prHash = pHashPlate.project(camera);
        const prNonce = pNonce.project(camera);

        if (prW1.z > 1 || prHash.z > 1 || prNonce.z > 1 || this.currentWagon2Scale < 0.35) {
          this.tooltipLayer.style.opacity = '0';
          this.tooltipLayer.style.visibility = 'hidden';
        } else {
          const toX = (v) => (v.x * 0.5 + 0.5) * width;
          const toY = (v) => (-v.y * 0.5 + 0.5) * height;

          const w1x = toX(prW1);
          const w1y = toY(prW1);
          const hx = toX(prHash);
          const hy = toY(prHash);
          const nx = toX(prNonce);
          const ny = toY(prNonce);

          const isCovered = width > 768 && hx < 410;
          this.tooltipLayer.style.opacity = isCovered ? '0' : '1';
          this.tooltipLayer.style.visibility = isCovered ? 'hidden' : 'visible';

          const pillW1X = Math.max(430, Math.min(w1x, hx - 220));
          const pillW1Y = w1y - 72;

          const pillHashX = Math.max(pillW1X + 220, hx);
          const pillHashY = hy - 72;

          const pillNonceX = Math.max(450, nx);
          const pillNonceY = ny + 68;

          const elW1 = document.getElementById('tooltip-s5-w1');
          const elHash = document.getElementById('tooltip-s5-hash');
          const elNonce = document.getElementById('tooltip-s5-nonce');

          if (elW1) {
            elW1.style.transform = `translate3d(${pillW1X.toFixed(1)}px, ${pillW1Y.toFixed(1)}px, 0) translate(-50%, -50%)`;
          }
          if (elHash) {
            elHash.style.transform = `translate3d(${pillHashX.toFixed(1)}px, ${pillHashY.toFixed(1)}px, 0) translate(-50%, -50%)`;
          }
          if (elNonce) {
            elNonce.style.transform = `translate3d(${pillNonceX.toFixed(1)}px, ${pillNonceY.toFixed(1)}px, 0) translate(-50%, -50%)`;
          }

          setLineAndDot('s5-line-w1', 's5-dot-w1-in', 's5-dot-w1-out', pillW1X, pillW1Y + 14, w1x, w1y);
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
    const pillW1El = document.getElementById('s5-pill-w1-code');
    const pillHashEl = document.getElementById('s5-pill-hash-code');
    const pillBadgeEl = document.getElementById('s5-pill-hash-badge');
    const pillNonceEl = document.getElementById('s5-pill-nonce-code');
    const pillNonceActionEl = document.getElementById('s5-pill-nonce-action');

    const targetPrefix = '0'.repeat(this.difficulty);
    const avgLabel = this.getTheoreticalAverageLabel(this.difficulty);

    if (nonceEl) {
      nonceEl.textContent = `${this.currentNonce} (${this.attemptsDone} essai${this.attemptsDone > 1 ? 's' : ''} · moy. ~${avgLabel})`;
    }
    if (hashEl) {
      hashEl.textContent = `${this.currentHash.substring(0, 14)}...`;
    }
    if (statusEl) {
      statusEl.textContent = this.isMining
        ? 'Recherche rapide du Nonce en cours...'
        : this.isMined
          ? `Validé (débute par "${targetPrefix}") · Wagon attelé`
          : `Refusé (ne débute pas par "${targetPrefix}") · Wagon à l'écart`;
    }

    const block1 = this.ctx?.trainConvoy?.getBlock(1);
    if (pillW1El && block1) {
      pillW1El.textContent = `${block1.hash.substring(0, 8)}...`;
    }
    if (pillHashEl) {
      pillHashEl.textContent = `${this.currentHash.substring(0, 8)}...`;
    }
    if (pillBadgeEl) {
      if (this.isMined) {
        pillBadgeEl.textContent = `Validé ("${targetPrefix}...")`;
        pillBadgeEl.style.color = '#34d399';
      } else if (this.isMining) {
        pillBadgeEl.textContent = 'Calcul en cours...';
        pillBadgeEl.style.color = '#fbbf24';
      } else {
        pillBadgeEl.textContent = `Sans "${targetPrefix}" (Bloqué)`;
        pillBadgeEl.style.color = '#fb923c';
      }
    }
    if (pillNonceEl) {
      pillNonceEl.textContent = String(this.currentNonce);
    }
    if (pillNonceActionEl) {
      pillNonceActionEl.style.display = this.isMined ? 'none' : 'inline';
    }

    const wagon2 = this.ctx?.trainConvoy?.getWagon(2);
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

    let nonceStatusHTML = `${this.currentNonce} (${this.attemptsDone} essai${this.attemptsDone > 1 ? 's' : ''} · moy. ~${avgLabel})`;
    if (this.isMined) {
      nonceStatusHTML = `Nonce ${this.foundNonce} trouvé en ${this.realAttempts} essai${this.realAttempts > 1 ? 's' : ''} (moy. ~${avgLabel})`;
    }

    inner.innerHTML = `
      <header class="step-panel-header">
        <h2 class="step-panel-title">Validation et Minage</h2>
      </header>

      <div class="step-panel-scroll">
        <article class="step-card context-card animate-fade">
          <h3 class="card-title">La condition pour rejoindre le train</h3>
          <p>
            Regardez les wagons déjà attelés à gauche (Locomotive #0 et Wagon #1) : leurs Hashs commencent tous par <strong>"${targetPrefix}"</strong>.
          </p>
          <p>
            À droite, le nouveau <strong>Wagon #2</strong> est maintenu à l'écart car son Hash actuel (<code>${this.currentHash.substring(0, 6)}...</code>) ne commence pas par <strong>"${targetPrefix}"</strong>. Pour trouver un Hash valide sans modifier les transactions, il faut tourner la <strong>molette du Nonce</strong>.
          </p>
        </article>

        <article class="step-card action-card animate-fade">
          <h3 class="card-title">Preuve de Travail (Proof of Work)</h3>
          <p class="card-instruction">
            Cliquez directement sur la <strong>molette du Nonce en 3D</strong> pour tester 1 cran à la main, ou lancez le <strong>minage automatique</strong> :
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
            <span>${this.isMining ? 'Rotation rapide de la molette...' : (this.isMined ? 'Recommencer avec un nouveau wagon' : 'Lancer le minage automatique')}</span>
          </button>

          <div class="action-feedback-box ${this.isMined ? 'success' : (this.isMining || this.attemptsDone > 0 ? 'error' : '')}">
            <div class="feedback-row">
              <span class="feedback-label">Règle d'admission :</span>
              <span class="feedback-val">Hash débutant par "${targetPrefix}"</span>
            </div>
            <div class="feedback-row">
              <span class="feedback-label">Molette Nonce :</span>
              <span id="step5-nonce-val" class="feedback-val">${nonceStatusHTML}</span>
            </div>
            <div class="feedback-row">
              <span class="feedback-label">Hash #2 obtenu :</span>
              <span id="step5-hash-val" class="feedback-val ${this.isMined ? 'success-val' : 'hash-val'}">${this.currentHash.substring(0, 14)}...</span>
            </div>
            <div class="feedback-row">
              <span class="feedback-label">Statut Wagon #2 :</span>
              <span id="step5-status-val" class="feedback-val ${this.isMined ? 'success-val' : (this.isMining || this.attemptsDone > 0 ? 'error-val' : '')}">
                ${this.isMining ? 'Recherche rapide du Nonce en cours...' : (this.isMined ? `Validé (débute par "${targetPrefix}") · Wagon attelé` : `Refusé (ne débute pas par "${targetPrefix}") · Wagon à l'écart`)}
              </span>
            </div>
          </div>
        </article>

        ${this.hasEverMined ? `
          <article class="step-card keypoint-card animate-fade">
            <h4 class="card-title keypoint-title">Point clé : Pourquoi imposer cette loterie ?</h4>
            <p class="keypoint-text">
              Obtenir un Hash commençant par "${targetPrefix}" oblige un mineur à tester en moyenne <strong>${avgLabel} crans de Nonce</strong> par force brute avant de pouvoir atteler le wagon. C'est ce coût de calcul qui empêche un pirate de réécrire les wagons passés en un clin d'œil.
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
        this.prepareConvoyForDifficulty(true);
        this.createMiningTooltips();
        this.updateLiveMiningDOM();
        this.renderLeftPanel();
      });
    });

    document.getElementById('btn-step5-mine')?.addEventListener('click', () => {
      if (this.isMining) return;
      if (this.isMined) {
        // Le wagon attaché disparaît et un nouveau wagon candidat apparaît à distance
        this.prepareConvoyForDifficulty(true);
        this.createMiningTooltips();
        this.updateLiveMiningDOM();
        this.renderLeftPanel();
      } else {
        this.startMining();
      }
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
