import * as THREE from 'three';

/**
 * Étape 6 : Comparaison des consensus (PoW vs PoS).
 * Mise en scène comparative sur les 3 gares du réseau (Gare A, Gare B, Gare C)
 * cherchant à atteler le prochain wagon (Wagon #2) :
 * - Mode Preuve de Travail (PoW — La course des 3 molettes) :
 *   Chaque gare possède sa propre molette crantée du Nonce qui tourne selon sa puissance
 *   (Gare A : rapide 50 %, Gare B : moyenne 35 %, Gare C : lente 15 %).
 *   Les 3 molettes tournent en même temps : la première qui tombe sur "00..." attelle le wagon,
 *   et les 2 autres ont tourné à fond pour rien.
 * - Mode Preuve d'Enjeu (PoS — La loterie proportionnelle sur caution) :
 *   Les molettes laissent place à des piles de jetons déposés en caution (50, 35 et 15 jetons).
 *   Un curseur balaie la barre de tirage (50 % / 35 % / 15 %) et désigne une seule gare qui
 *   attelle directement le wagon sans que les autres ne dépensent d'énergie.
 */
export const step6 = {
  id: 6,
  title: 'Consensus : PoW vs PoS',
  ctx: null,

  rafId: null,
  mode: 'pow', // 'pow' | 'pos'

  // État d'animation ('idle' | 'running' | 'done')
  simState: 'idle',
  simTimer: 0,
  simDuration: 1.5,
  winnerIndex: 0,
  rouletteHighlightIndex: 0,
  lotteryCursorPercent: 25,
  lotteryTargetPercent: 25,
  hasTestedPoW: false,
  hasTestedPoS: false,

  // Position X du Wagon #2 (attend à 8.45, s'attelle à 7.60 quand une gare gagne)
  unminedWagon2X: 8.45,
  minedWagon2X: 7.6,
  currentWagon2X: 8.45,
  wasCoupled: false,
  couplerFlashRing: null,
  couplerFlashAlpha: 0,

  consensusGroup: null,
  validators: [],
  tooltipLayer: null,

  validatorData: [
    {
      id: 'gare-a',
      name: 'Gare A',
      share: 50,
      probLabel: '50 %',
      speedLabel: ' Vitesse rapide',
      tokens: 50,
      coinsMeshCount: 10,
      maxCrans: 32,
      x: 2.8,
      z: -2.45
    },
    {
      id: 'gare-b',
      name: 'Gare B',
      share: 35,
      probLabel: '35 %',
      speedLabel: 'Vitesse moyenne',
      tokens: 35,
      coinsMeshCount: 7,
      maxCrans: 21,
      x: 5.6,
      z: -2.75
    },
    {
      id: 'gare-c',
      name: 'Gare C',
      share: 15,
      probLabel: '15 %',
      speedLabel: 'Vitesse lente',
      tokens: 15,
      coinsMeshCount: 3,
      maxCrans: 9,
      x: 8.4,
      z: -2.45
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
    this.currentWagon2X = this.unminedWagon2X;
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
      const wagon2 = trainConvoy.getWagon(2);
      if (wagon2) {
        wagon2.position.x = this.currentWagon2X;
      }
    }

    this.buildConsensusScene();
    this.setupTooltipsLayer();
    this.createStationTooltips();
    this.applyModeVisuals();

    // Cadrage rapproché englobant les 3 Gares (A, B, C) et la jonction Wagon #1 <-> Wagon #2
    if (cameraController) {
      cameraController.moveTo(
        new THREE.Vector3(5.85, 2.75, 6.7),
        new THREE.Vector3(5.75, 0.55, -0.75),
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

    const panel = document.getElementById('step-panel-left');
    if (panel) {
      const inner = panel.querySelector('.step-panel-inner');
      if (inner) inner.remove();
    }
  },

  /**
   * Dessine le cadran central de la molette 3D d'une gare en mode PoW.
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
   * Construit les 3 plateformes (Gare A, Gare B, Gare C) :
   * - En mode PoW : une grande molette crantée du Nonce orientée face caméra sur chaque gare.
   * - En mode PoS : une pile de jetons dorés déposés en caution (50, 35, 15 jetons).
   */
  buildConsensusScene() {
    const { scene } = this.ctx;
    if (!scene) return;

    if (this.consensusGroup) {
      scene.remove(this.consensusGroup);
    }

    this.consensusGroup = new THREE.Group();
    this.validators = [];

    const platformGeo = new THREE.CylinderGeometry(0.92, 1.05, 0.18, 24);
    const platformMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.65,
      metalness: 0.3
    });

    const wheelStandGeo = new THREE.BoxGeometry(0.36, 0.72, 0.18);
    const wheelStandMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      metalness: 0.85,
      roughness: 0.3
    });

    const wheelGeo = new THREE.CylinderGeometry(0.42, 0.42, 0.12, 24);
    const toothGeo = new THREE.BoxGeometry(0.085, 0.13, 0.11);
    const dialGeo = new THREE.CircleGeometry(0.38, 32);

    const coinGeo = new THREE.CylinderGeometry(0.42, 0.42, 0.11, 20);
    const couplerTarget = new THREE.Vector3(5.28, 0.05, 0);

    this.validatorData.forEach((v) => {
      const vGroup = new THREE.Group();
      vGroup.position.set(v.x, -0.4, v.z);

      // Socle circulaire de la gare
      const platform = new THREE.Mesh(platformGeo, platformMat);
      vGroup.add(platform);

      // Anneau lumineux périphérique
      const ringGeo = new THREE.RingGeometry(0.95, 1.12, 32);
      const ringMat = new THREE.MeshBasicMaterial({
        color: 0x38bdf8,
        side: THREE.DoubleSide
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.rotation.x = -Math.PI / 2;
      ring.position.y = 0.1;
      vGroup.add(ring);

      // --- 1. Équipement PoW : Grande molette crantée du Nonce (comme à l'étape 5) ---
      const powNodeGroup = new THREE.Group();

      const stand = new THREE.Mesh(wheelStandGeo, wheelStandMat);
      stand.position.set(0, 0.42, -0.06);
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
      wheelMesh.position.set(0, 0.65, 0.08);
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
        tooth.position.set(Math.cos(angle) * 0.44, 0, Math.sin(angle) * 0.44);
        tooth.rotation.y = -angle + Math.PI / 2;
        wheelMesh.add(tooth);
      }

      // Cadran central fixe (toujours droit pendant que les crans tournent)
      const dialCanvas = document.createElement('canvas');
      dialCanvas.width = 256;
      dialCanvas.height = 256;
      const dialTex = new THREE.CanvasTexture(dialCanvas);
      this.renderStationWheelDial(dialCanvas, dialTex, 0, '#f59e0b');

      const dialMesh = new THREE.Mesh(
        dialGeo,
        new THREE.MeshBasicMaterial({ map: dialTex, transparent: true })
      );
      dialMesh.position.set(0, 0.65, 0.145);
      powNodeGroup.add(dialMesh);

      vGroup.add(powNodeGroup);

      // --- 2. Équipement PoS : Pile de jetons déposés en caution (10, 7 ou 3 jetons) ---
      const posNodeGroup = new THREE.Group();
      const coinMat = new THREE.MeshStandardMaterial({
        color: 0xfacc15,
        emissive: 0xb45309,
        emissiveIntensity: 0.45,
        metalness: 0.85,
        roughness: 0.2
      });

      for (let c = 0; c < v.coinsMeshCount; c++) {
        const coin = new THREE.Mesh(coinGeo, coinMat);
        coin.position.set(0, 0.16 + c * 0.12, 0);
        posNodeGroup.add(coin);
      }
      vGroup.add(posNodeGroup);

      // Faisceau reliant la gare au point d'attelage du Wagon #2
      const linePoints = [
        new THREE.Vector3(v.x, -0.28, v.z + 0.92),
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
        coinMat,
        lineMat,
        currentCrans: 0,
        targetCrans: v.maxCrans,
        currentAngle: 0,
        currentHash: 'a4f9c2...'
      });
    });

    // Anneau flash vert au point d'attelage entre Wagon #1 et Wagon #2
    const flashGeo = new THREE.TorusGeometry(0.24, 0.035, 12, 32);
    flashGeo.rotateY(Math.PI / 2);
    const flashMat = new THREE.MeshBasicMaterial({
      color: 0x10b981,
      transparent: true,
      opacity: 0
    });
    this.couplerFlashRing = new THREE.Mesh(flashGeo, flashMat);
    this.couplerFlashRing.position.copy(couplerTarget);
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
              <strong>${v.name}</strong> (<span id="s6-pill-share-${idx}">${v.probLabel}</span>) ·
              <span id="s6-pill-status-${idx}" style="color: #94a3b8;">Prête</span>
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
    this.mode = targetMode;
    this.simState = 'idle';
    this.simTimer = 0;
    this.wasCoupled = false;
    this.couplerFlashAlpha = 0;
    this.currentWagon2X = this.unminedWagon2X;
    this.lotteryCursorPercent = 25;

    this.validators.forEach((v) => {
      v.currentCrans = 0;
      v.currentAngle = 0;
      if (v.wheelMesh) v.wheelMesh.rotation.set(Math.PI / 2, 0, 0);
      this.renderStationWheelDial(v.dialCanvas, v.dialTex, 0, '#f59e0b');
    });

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
    this.lotteryTargetPercent = Math.max(4, Math.min(96, r));
    if (r < 50) return 0; // Gare A (0% .. 50%)
    if (r < 85) return 1; // Gare B (50% .. 85%)
    return 2;             // Gare C (85% .. 100%)
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
   * Lance soit la course des 3 molettes (PoW), soit la loterie sur caution (PoS).
   */
  startConsensusRound() {
    if (this.simState === 'running') return;

    this.currentWagon2X = this.unminedWagon2X;
    this.wasCoupled = false;
    this.couplerFlashAlpha = 0;

    this.winnerIndex = this.pickWeightedWinner();
    this.simState = 'running';
    this.simTimer = 0;
    this.simDuration = this.mode === 'pow' ? 1.55 : 1.25;

    const jitter = 0.85 + Math.random() * 0.3;
    this.validators.forEach((v) => {
      v.currentCrans = 0;
      v.currentAngle = 0;
      v.targetCrans = Math.max(5, Math.round(v.data.maxCrans * jitter));
      v.currentHash = this.randomRejectedHash();
      this.renderStationWheelDial(v.dialCanvas, v.dialTex, 0, '#f59e0b');
    });

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
      v.powNodeGroup.visible = isPoW;
      v.posNodeGroup.visible = !isPoW;

      let colorHex = 0x38bdf8;
      let lineOpacity = 0.3;

      if (this.simState === 'running') {
        if (isPoW) {
          colorHex = 0xf59e0b;
          lineOpacity = 0.65;
        } else {
          const isHighlighted = idx === this.rouletteHighlightIndex;
          colorHex = isHighlighted ? 0xfacc15 : 0x38bdf8;
          lineOpacity = isHighlighted ? 0.85 : 0.22;
        }
      } else if (this.simState === 'done') {
        const isWinner = idx === this.winnerIndex;
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
    });
  },

  /**
   * Met à jour les 3 infobulles 3D et le bloc de suivi dans le volet gauche.
   */
  updateTooltipsDOM() {
    const isPoW = this.mode === 'pow';

    this.validators.forEach((v, idx) => {
      const shareEl = document.getElementById(`s6-pill-share-${idx}`);
      const statusEl = document.getElementById(`s6-pill-status-${idx}`);
      const pillWrap = document.getElementById(`tooltip-s6-${idx}`);
      const lineEl = document.getElementById(`s6-line-${idx}`);
      const dotInEl = document.getElementById(`s6-dot-in-${idx}`);
      const dotOutEl = document.getElementById(`s6-dot-out-${idx}`);
      const raceStatEl = document.getElementById(`s6-race-stat-${idx}`);

      if (shareEl) {
        shareEl.textContent = isPoW
          ? `${v.data.probLabel} puissance`
          : `${v.data.tokens} jetons (${v.data.probLabel})`;
      }

      let spotColor = '#38bdf8';
      let statusText = isPoW ? v.data.speedLabel : 'Caution prête';
      let statusColor = '#94a3b8';

      if (this.simState === 'running') {
        if (isPoW) {
          spotColor = '#f59e0b';
          statusText = `Cran #${v.currentCrans} (${v.currentHash})`;
          statusColor = '#fde68a';
        } else {
          const isHigh = idx === this.rouletteHighlightIndex;
          spotColor = isHigh ? '#facc15' : '#38bdf8';
          statusText = isHigh ? 'Sous le curseur...' : 'Au repos';
          statusColor = isHigh ? '#fde047' : '#94a3b8';
        }
      } else if (this.simState === 'done') {
        const isWinner = idx === this.winnerIndex;
        if (isWinner) {
          spotColor = '#10b981';
          statusText = isPoW
            ? `Trouvé "00..." (${v.currentCrans} crans) · Gagnante !`
            : 'Tirée au sort · Attelle le wagon !';
          statusColor = '#34d399';
        } else if (isPoW) {
          spotColor = '#ef4444';
          statusText = `Battue (${v.currentCrans} crans tournés pour rien)`;
          statusColor = '#fca5a5';
        } else {
          spotColor = '#64748b';
          statusText = 'Au repos (0 énergie dépensée)';
          statusColor = '#94a3b8';
        }
      }

      if (statusEl) {
        statusEl.textContent = statusText;
        statusEl.style.color = statusColor;
      }
      if (raceStatEl) {
        raceStatEl.textContent = statusText;
        raceStatEl.style.color = statusColor;
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

      // 1. Progression de la simulation (Course des 3 molettes PoW ou Loterie PoS)
      if (this.simState === 'running') {
        this.simTimer += dt;
        const progress = Math.min(this.simTimer / this.simDuration, 1.0);

        if (progress < 1.0) {
          if (this.mode === 'pow') {
            this.validators.forEach((v) => {
              const newCrans = Math.max(1, Math.floor(v.targetCrans * progress));
              if (newCrans !== v.currentCrans) {
                v.currentCrans = newCrans;
                v.currentHash = this.randomRejectedHash();
                this.renderStationWheelDial(v.dialCanvas, v.dialTex, v.currentCrans, '#f59e0b');
              }
              const targetAngle = v.currentCrans * (Math.PI / 4);
              v.currentAngle = THREE.MathUtils.lerp(v.currentAngle, targetAngle, Math.min(1, dt * 18));
              if (v.wheelMesh) {
                v.wheelMesh.rotation.set(Math.PI / 2, v.currentAngle, 0);
              }
            });
          } else {
            // Le curseur de loterie balaie la barre (0..100%) avant d'atterrir sur lotteryTargetPercent
            const easeOut = 1 - Math.pow(1 - progress, 3);
            const sweep = Math.sin(progress * Math.PI * 3.5) * (1 - progress) * 42;
            this.lotteryCursorPercent = Math.max(
              3,
              Math.min(97, THREE.MathUtils.lerp(12, this.lotteryTargetPercent, easeOut) + sweep)
            );
            if (this.lotteryCursorPercent < 50) this.rouletteHighlightIndex = 0;
            else if (this.lotteryCursorPercent < 85) this.rouletteHighlightIndex = 1;
            else this.rouletteHighlightIndex = 2;
            this.applyModeVisuals();
          }
          this.updateTooltipsDOM();
        } else {
          // Fin de la manche : une gare remporte le droit d'atteler le Wagon #2
          this.simState = 'done';
          if (this.mode === 'pow') {
            this.hasTestedPoW = true;
            this.validators.forEach((v, idx) => {
              v.currentCrans = v.targetCrans;
              const isWinner = idx === this.winnerIndex;
              v.currentHash = isWinner ? '00e4a1...' : this.randomRejectedHash();
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
          } else {
            this.hasTestedPoS = true;
            this.lotteryCursorPercent = this.lotteryTargetPercent;
            this.rouletteHighlightIndex = this.winnerIndex;
          }

          this.applyModeVisuals();
          this.updateTooltipsDOM();
          this.renderLeftPanel();
        }
      }

      // 2. Déplacement du Wagon #2 : avance et s'attelle quand une gare a validé le bloc (simState === 'done')
      if (wagon2) {
        const isValidated = this.simState === 'done';
        const targetX = isValidated ? this.minedWagon2X : this.unminedWagon2X;
        this.currentWagon2X = THREE.MathUtils.lerp(this.currentWagon2X, targetX, Math.min(1, dt * 6.5));
        wagon2.position.x = this.currentWagon2X;

        const isCoupledPosition = Math.abs(this.currentWagon2X - this.minedWagon2X) < 0.06 && isValidated;
        if (isCoupledPosition && !this.wasCoupled) {
          this.wasCoupled = true;
          this.couplerFlashAlpha = 1.0;
        } else if (!isCoupledPosition) {
          this.wasCoupled = false;
        }

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

      // 4. Projection 2D des 3 infobulles au-dessus des 3 gares (ancrées sur le sommet pour ne pas cacher les molettes)
      if (this.tooltipLayer && camera && this.validators.length === 3) {
        const width = window.innerWidth;
        const height = window.innerHeight;
        const toX = (v) => (v.x * 0.5 + 0.5) * width;
        const toY = (v) => (-v.y * 0.5 + 0.5) * height;

        let anyBehind = false;
        const pts = this.validators.map((v) => {
          const topY = this.mode === 'pow' ? 1.15 : 0.22 + v.data.coinsMeshCount * 0.12;
          const worldP = new THREE.Vector3(v.data.x, -0.4 + topY, v.data.z);
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
            const py = pt.y - 52;
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
    const isRunning = this.simState === 'running';
    const isDone = this.simState === 'done';

    const actionButtonLabel = isPoW
      ? isRunning
        ? 'Les 3 molettes tournent...'
        : isDone
          ? 'Relancer la course des 3 molettes'
          : 'Lancer la course des 3 molettes (PoW)'
      : isRunning
        ? 'Tirage au sort en cours...'
        : isDone
          ? 'Relancer un tirage au sort (PoS)'
          : 'Tirer au sort une gare (PoS)';

    const visualWidgetHTML = isPoW
      ? `
        <div class="pow-race-box">
          ${this.validators
            .map((v, idx) => {
              const rowClass = isDone ? (idx === this.winnerIndex ? 'winner' : 'loser') : '';
              const statText = isDone
                ? idx === this.winnerIndex
                  ? `Trouvé "00..." (${v.currentCrans} crans) · Gagnante !`
                  : `Battue (${v.currentCrans} crans pour rien)`
                : v.data.speedLabel;
              const statColor = isDone ? (idx === this.winnerIndex ? '#34d399' : '#fca5a5') : '#94a3b8';
              return `
                <div class="pow-race-row ${rowClass}">
                  <span class="pow-race-name">${v.data.name} (${v.data.probLabel})</span>
                  <span id="s6-race-stat-${idx}" class="pow-race-stat" style="color: ${statColor};">${statText}</span>
                </div>
              `;
            })
            .join('')}
        </div>
      `
      : `
        <div class="pos-lottery-box">
          <div class="pos-lottery-title">
            <span>Barre de loterie (selon caution déposée)</span>
            <span style="color: #facc15;">1 seule gare élue</span>
          </div>
          <div class="pos-lottery-track">
            <div class="pos-lottery-segment seg-a ${isDone && this.winnerIndex === 0 ? 'winner' : ''}">Gare A (50 %)</div>
            <div class="pos-lottery-segment seg-b ${isDone && this.winnerIndex === 1 ? 'winner' : ''}">Gare B (35 %)</div>
            <div class="pos-lottery-segment seg-c ${isDone && this.winnerIndex === 2 ? 'winner' : ''}">C (15 %)</div>
            <div id="step6-lottery-cursor" class="pos-lottery-cursor" style="left: ${this.lotteryCursorPercent.toFixed(1)}%;"></div>
          </div>
        </div>
      `;

    const feedbackHTML = isPoW
      ? `
        <div class="action-feedback-box ${isDone ? 'error' : ''}">
          <div class="feedback-row">
            <span class="feedback-label">Principe :</span>
            <span class="feedback-val">Les 3 gares tournent chacune leur <strong>molette du Nonce en même temps</strong> (plus une gare est puissante, plus sa molette tourne vite).</span>
          </div>
          <div class="feedback-row">
            <span class="feedback-label">Gagnante :</span>
            <span class="feedback-val ${isDone ? 'success-val' : ''}">
              ${isDone
                ? `La <strong>${winner.name}</strong> tombe sur "00..." en premier et attelle le Wagon #2.`
                : 'La première gare qui tombe sur "00..." gagne.'}
            </span>
          </div>
          <div class="feedback-row">
            <span class="feedback-label">Inconvénient :</span>
            <span class="feedback-val error-val">
              ${isDone
                ? 'Les 2 autres gares ont fait tourner leur molette à fond pour rien (énergie perdue).'
                : 'Toutes les gares perdantes dépensent de l’électricité en pure perte.'}
            </span>
          </div>
        </div>
      `
      : `
        <div class="action-feedback-box ${isDone ? 'success' : ''}">
          <div class="feedback-row">
            <span class="feedback-label">Principe :</span>
            <span class="feedback-val">Plus de course de molettes : chaque gare dépose des <strong>jetons en caution</strong> qui lui donnent une part sur la barre de tirage.</span>
          </div>
          <div class="feedback-row">
            <span class="feedback-label">Gagnante :</span>
            <span class="feedback-val ${isDone ? 'success-val' : ''}">
              ${isDone
                ? `Le curseur désigne la <strong>${winner.name}</strong> (${winner.tokens} jetons), qui attelle seule le Wagon #2.`
                : 'Le curseur tire au sort une seule gare avant tout travail.'}
            </span>
          </div>
          <div class="feedback-row">
            <span class="feedback-label">Avantage :</span>
            <span class="feedback-val success-val">
              Seule la gare tirée au sort travaille : les 2 autres restent au repos (99,9 % d'électricité économisée).
            </span>
          </div>
        </div>
      `;

    inner.innerHTML = `
      <header class="step-panel-header">
        <h2 class="step-panel-title">Consensus : PoW vs PoS</h2>
      </header>

      <div class="step-panel-scroll">
        <article class="step-card context-card animate-fade">
          <h3 class="card-title">Comment départager les 3 gares ?</h3>
          <p>
            Les <strong>Gares A, B et C</strong> veulent toutes les trois valider et atteler le prochain wagon. Deux méthodes existent : faire la <strong>course avec 3 molettes (PoW)</strong>, ou <strong>tirer au sort 1 seule gare avant de travailler (PoS)</strong>.
          </p>
        </article>

        <article class="step-card action-card animate-fade">
          <h3 class="card-title">Comparateur : Course vs Loterie</h3>

          <div class="difficulty-selector-row" role="tablist" aria-label="Choix du mécanisme de consensus">
            <button id="btn-tab-pow" class="btn-diff-option ${isPoW ? 'active' : ''}" role="tab" aria-selected="${isPoW}" ${isRunning ? 'disabled' : ''}>
              <span>PoW (3 molettes en course)</span>
            </button>
            <button id="btn-tab-pos" class="btn-diff-option ${!isPoW ? 'active' : ''}" role="tab" aria-selected="${!isPoW}" ${isRunning ? 'disabled' : ''}>
              <span>PoS (Loterie sur caution)</span>
            </button>
          </div>

          ${visualWidgetHTML}

          <button id="btn-step6-run" class="btn-panel-primary" ${isRunning ? 'disabled' : ''}>
            <span>${actionButtonLabel}</span>
          </button>

          ${feedbackHTML}
        </article>

        ${(this.hasTestedPoW || this.hasTestedPoS) ? `
          <article class="step-card keypoint-card animate-fade">
            <h4 class="card-title keypoint-title">Point clé : Pourquoi le PoS a été inventé</h4>
            <p class="keypoint-text">
              En <strong>PoW (Bitcoin)</strong>, toutes les gares du monde tournent leur molette en même temps, mais une seule gagne : tout le calcul des autres est perdu. En <strong>PoS (Ethereum)</strong>, on tire au sort la gare gagnante <strong>avant</strong> de travailler grâce à sa caution, ce qui divise la consommation électrique par mille.
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
    document.getElementById('btn-tab-pow')?.addEventListener('click', () => {
      if (this.simState === 'running') return;
      this.setMode('pow');
    });

    document.getElementById('btn-tab-pos')?.addEventListener('click', () => {
      if (this.simState === 'running') return;
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
