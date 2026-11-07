import * as THREE from 'three';

/**
 * Étape 6 : Comparaison des consensus (PoW vs PoS).
 * Mise en scène comparative sur les 3 mêmes gares du réseau (Béziers, Nîmes, Montpellier)
 * cherchant à atteler le prochain wagon (Wagon #2) au train arrêté à quai :
 * - Mode Preuve de Travail (PoW) : Course de puissance de calcul. Les 3 gares tournent et
 *   consomment de l'énergie en même temps ; la première qui trouve le Nonce attelle le wagon,
 *   et toute l'énergie dépensée par les 2 autres gares est perdue.
 * - Mode Preuve d'Enjeu (PoS) : Tirage au sort pondéré par la caution (Stake). Chaque gare
 *   immobilise une pile de jetons en garantie ; le réseau tire au sort une seule gare qui
 *   attelle le wagon sans que personne ne gaspille d'électricité.
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
  simDuration: 1.25,
  winnerIndex: 0,
  rouletteHighlightIndex: 0,
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
  activeSpotId: null,

  validatorData: [
    {
      id: 'beziers',
      name: 'Gare de Béziers',
      shortName: 'Béziers',
      share: 50,
      probLabel: '50 %',
      machines: 3,
      coins: 10,
      speedFactor: 1.35,
      x: 2.2,
      z: -2.85
    },
    {
      id: 'nimes',
      name: 'Gare de Nîmes',
      shortName: 'Nîmes',
      share: 35,
      probLabel: '35 %',
      machines: 2,
      coins: 7,
      speedFactor: 0.95,
      x: 5.4,
      z: -3.25
    },
    {
      id: 'montpellier',
      name: 'Gare de Montpellier',
      shortName: 'Montpellier',
      share: 15,
      probLabel: '15 %',
      machines: 1,
      coins: 3,
      speedFactor: 0.45,
      x: 8.6,
      z: -2.85
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
    this.hasTestedPoW = false;
    this.hasTestedPoS = false;
    this.activeSpotId = null;
    this.currentWagon2X = this.unminedWagon2X;
    this.wasCoupled = false;
    this.couplerFlashAlpha = 0;

    if (cameraController) {
      cameraController.setViewOffset(210);
    }

    // Le train reste à l'arrêt pour que les 3 gares soient fixes par rapport au décor
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

    // Cadrage panoramique englobant les 3 gares en arrière-plan et le train au premier plan
    if (cameraController) {
      cameraController.moveTo(
        new THREE.Vector3(5.5, 3.25, 7.6),
        new THREE.Vector3(5.5, 0.55, -0.9),
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
   * Construit les 3 plateformes des gares (Béziers, Nîmes, Montpellier) :
   * - Chaque gare possède un groupe PoW (colonnes de calcul) et un groupe PoS (pile de jetons en caution).
   * - Chaque gare est reliée par une ligne au point d'attelage (x = 5.28) entre le Wagon #1 et le Wagon #2.
   */
  buildConsensusScene() {
    const { scene } = this.ctx;
    if (!scene) return;

    if (this.consensusGroup) {
      scene.remove(this.consensusGroup);
    }

    this.consensusGroup = new THREE.Group();
    this.validators = [];

    const platformGeo = new THREE.CylinderGeometry(0.95, 1.08, 0.18, 24);
    const platformMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.65,
      metalness: 0.3
    });

    const machineBodyGeo = new THREE.BoxGeometry(0.34, 0.85, 0.34);
    const machineBodyMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      metalness: 0.85,
      roughness: 0.3
    });
    const machineCoreGeo = new THREE.BoxGeometry(0.24, 0.58, 0.37);

    const coinGeo = new THREE.CylinderGeometry(0.38, 0.38, 0.11, 20);
    const couplerTarget = new THREE.Vector3(5.28, 0.05, 0);

    this.validatorData.forEach((v) => {
      const vGroup = new THREE.Group();
      vGroup.position.set(v.x, -0.4, v.z);

      // Socle circulaire de la gare
      const platform = new THREE.Mesh(platformGeo, platformMat);
      vGroup.add(platform);

      // Anneau lumineux périphérique
      const ringGeo = new THREE.RingGeometry(0.98, 1.14, 32);
      const ringMat = new THREE.MeshBasicMaterial({
        color: 0x38bdf8,
        side: THREE.DoubleSide
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.rotation.x = -Math.PI / 2;
      ring.position.y = 0.1;
      vGroup.add(ring);

      // --- 1. Équipement PoW : Unités de calcul (3, 2 ou 1 tours de hachage) ---
      const powNodeGroup = new THREE.Group();
      const coreMaterials = [];
      const spacing = 0.44;
      const startX = -((v.machines - 1) * spacing) / 2;

      for (let m = 0; m < v.machines; m++) {
        const mx = startX + m * spacing;
        const body = new THREE.Mesh(machineBodyGeo, machineBodyMat);
        body.position.set(mx, 0.52, 0);
        powNodeGroup.add(body);

        const coreMat = new THREE.MeshStandardMaterial({
          color: 0xfef08a,
          emissive: 0xf59e0b,
          emissiveIntensity: 0.7,
          roughness: 0.2
        });
        coreMaterials.push(coreMat);
        const core = new THREE.Mesh(machineCoreGeo, coreMat);
        core.position.set(mx, 0.52, 0);
        powNodeGroup.add(core);
      }
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

      for (let c = 0; c < v.coins; c++) {
        const coin = new THREE.Mesh(coinGeo, coinMat);
        coin.position.set(0, 0.16 + c * 0.125, 0);
        posNodeGroup.add(coin);
      }
      vGroup.add(posNodeGroup);

      // Faisceau reliant la gare au point d'attelage du Wagon #2
      const linePoints = [
        new THREE.Vector3(v.x, -0.28, v.z + 0.95),
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
        ringMat,
        coreMaterials,
        coinMat,
        lineMat,
        currentAttempts: 0
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
   * Crée les 3 infobulles SVG nettes au-dessus des 3 gares (Béziers, Nîmes, Montpellier).
   */
  createStationTooltips() {
    if (!this.tooltipLayer) return;

    const svgLinesHTML = this.validatorData
      .map(
        (v, idx) => `
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
              <strong>${v.shortName}</strong> (<span id="s6-pill-share-${idx}">${v.probLabel}</span>) ·
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
   * Bascule entre PoW et PoS en conservant les 3 mêmes gares à l'écran.
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

    this.applyModeVisuals();
    this.updateTooltipsDOM();
    this.renderLeftPanel();
  },

  /**
   * Tire un index gagnant (0, 1 ou 2) selon les parts 50 % / 35 % / 15 %.
   */
  pickWeightedWinner() {
    const r = Math.random() * 100;
    if (r < 50) return 0;
    if (r < 85) return 1;
    return 2;
  },

  /**
   * Lance soit la course de calcul (PoW), soit le tirage au sort sur caution (PoS).
   */
  startConsensusRound() {
    if (this.simState === 'running') return;

    // Si le Wagon #2 était déjà attelé, on le replace à distance pour la nouvelle manche
    this.currentWagon2X = this.unminedWagon2X;
    this.wasCoupled = false;
    this.couplerFlashAlpha = 0;

    this.winnerIndex = this.pickWeightedWinner();
    this.simState = 'running';
    this.simTimer = 0;
    this.simDuration = this.mode === 'pow' ? 1.35 : 0.95;

    this.validators.forEach((v) => {
      v.currentAttempts = 0;
    });

    this.applyModeVisuals();
    this.updateTooltipsDOM();
    this.renderLeftPanel();
  },

  /**
   * Met à jour la visibilité des équipements PoW / PoS et les couleurs des 3 gares.
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
          // En PoW, les 3 gares chauffent simultanément
          colorHex = 0xf97316;
          lineOpacity = 0.65;
        } else {
          // En PoS, un curseur lumineux balaie les gares sans surchauffe
          const isHighlighted = idx === this.rouletteHighlightIndex;
          colorHex = isHighlighted ? 0xfacc15 : 0x38bdf8;
          lineOpacity = isHighlighted ? 0.85 : 0.25;
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

      v.coreMaterials.forEach((cMat) => {
        if (this.simState === 'running' && isPoW) {
          cMat.color.setHex(0xffedd5);
          cMat.emissive.setHex(0xf97316);
          cMat.emissiveIntensity = 1.6;
        } else if (this.simState === 'done' && idx === this.winnerIndex) {
          cMat.color.setHex(0xd1fae5);
          cMat.emissive.setHex(0x10b981);
          cMat.emissiveIntensity = 1.3;
        } else if (this.simState === 'done' && isPoW) {
          cMat.color.setHex(0xfecaca);
          cMat.emissive.setHex(0xdc2626);
          cMat.emissiveIntensity = 0.55;
        } else {
          cMat.color.setHex(0xfef08a);
          cMat.emissive.setHex(0xf59e0b);
          cMat.emissiveIntensity = 0.7;
        }
      });
    });
  },

  /**
   * Met à jour le texte et la couleur des 3 infobulles au-dessus des gares.
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

      if (shareEl) {
        shareEl.textContent = isPoW
          ? `${v.data.probLabel} calcul`
          : `${v.data.coins} jetons (${v.data.probLabel})`;
      }

      let spotColor = '#38bdf8';
      let statusText = isPoW ? 'Prête à miner' : 'Caution déposée';
      let statusColor = '#94a3b8';

      if (this.simState === 'running') {
        if (isPoW) {
          spotColor = '#f97316';
          statusText = `${v.currentAttempts.toLocaleString('fr-FR')} essais...`;
          statusColor = '#fdba74';
        } else {
          const isHigh = idx === this.rouletteHighlightIndex;
          spotColor = isHigh ? '#facc15' : '#38bdf8';
          statusText = isHigh ? 'Tirage...' : 'En attente';
          statusColor = isHigh ? '#fde047' : '#94a3b8';
        }
      } else if (this.simState === 'done') {
        const isWinner = idx === this.winnerIndex;
        if (isWinner) {
          spotColor = '#10b981';
          statusText = isPoW
            ? `1re (${v.currentAttempts.toLocaleString('fr-FR')} essais) · Attelle`
            : 'Tirée au sort · Attelle';
          statusColor = '#34d399';
        } else if (isPoW) {
          spotColor = '#ef4444';
          statusText = `Battue (${v.currentAttempts.toLocaleString('fr-FR')} essais perdus)`;
          statusColor = '#fca5a5';
        } else {
          spotColor = '#64748b';
          statusText = 'Non tirée (0 énergie perdue)';
          statusColor = '#94a3b8';
        }
      }

      if (statusEl) {
        statusEl.textContent = statusText;
        statusEl.style.color = statusColor;
      }
      if (pillWrap) {
        pillWrap.style.setProperty('--spot-color', spotColor);
      }
      if (lineEl) lineEl.setAttribute('stroke', spotColor);
      if (dotInEl) dotInEl.setAttribute('fill', spotColor);
      if (dotOutEl) dotOutEl.setAttribute('stroke', spotColor);
    });
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

      // 1. Progression de la simulation (Course PoW ou Tirage PoS)
      if (this.simState === 'running') {
        this.simTimer += dt;
        const progress = Math.min(this.simTimer / this.simDuration, 1.0);

        if (progress < 1.0) {
          if (this.mode === 'pow') {
            this.validators.forEach((v) => {
              v.currentAttempts = Math.floor(progress * 28000 * v.data.speedFactor);
            });
          } else {
            // Balayage rapide entre les 3 gares avant de s'arrêter sur la gagnante
            const stepIndex = Math.floor(progress * 11);
            this.rouletteHighlightIndex = stepIndex % 3;
            this.applyModeVisuals();
          }
          this.updateTooltipsDOM();
        } else {
          // Fin de la manche : une gare remporte le droit d'atteler le Wagon #2
          this.simState = 'done';
          if (this.mode === 'pow') {
            this.hasTestedPoW = true;
            this.validators.forEach((v, idx) => {
              const base = Math.floor(28000 * v.data.speedFactor);
              v.currentAttempts = idx === this.winnerIndex ? Math.max(4200, base) : Math.max(3100, base - 1200);
            });
          } else {
            this.hasTestedPoS = true;
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

      // 3. Aura circulaire verte au verrouillage de l'attelage
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
          const topY = this.mode === 'pow' ? 0.98 : 0.22 + v.data.coins * 0.125;
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
            const py = pt.y - 54;
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
        ? 'Course de calcul en cours...'
        : isDone
          ? 'Relancer une course (PoW)'
          : 'Lancer la course de minage (PoW)'
      : isRunning
        ? 'Tirage au sort en cours...'
        : isDone
          ? 'Relancer un tirage au sort (PoS)'
          : 'Tirer au sort une gare (PoS)';

    const feedbackHTML = isPoW
      ? `
        <div class="action-feedback-box ${isDone ? 'error' : ''}">
          <div class="feedback-row">
            <span class="feedback-label">Principe :</span>
            <span class="feedback-val">Les 3 gares font tourner leurs machines <strong>en même temps</strong> pour trouver le Nonce en premier.</span>
          </div>
          <div class="feedback-row">
            <span class="feedback-label">Résultat :</span>
            <span class="feedback-val ${isDone ? 'success-val' : ''}">
              ${isDone
                ? `La <strong>${winner.name}</strong> (${winner.probLabel} de la puissance) gagne et attelle le Wagon #2.`
                : 'Lancez la course pour voir quelle gare trouve le Nonce en premier.'}
            </span>
          </div>
          <div class="feedback-row">
            <span class="feedback-label">Coût énergétique :</span>
            <span class="feedback-val error-val">
              ${isDone
                ? 'Élevé : les 2 autres gares ont calculé à plein régime pour rien.'
                : 'Toutes les gares dépensent de l’électricité à chaque bloc.'}
            </span>
          </div>
        </div>
      `
      : `
        <div class="action-feedback-box ${isDone ? 'success' : ''}">
          <div class="feedback-row">
            <span class="feedback-label">Principe :</span>
            <span class="feedback-val">Chaque gare bloque des jetons en <strong>caution (Stake)</strong>. Le réseau tire au sort une seule gare avant tout calcul.</span>
          </div>
          <div class="feedback-row">
            <span class="feedback-label">Résultat :</span>
            <span class="feedback-val ${isDone ? 'success-val' : ''}">
              ${isDone
                ? `La <strong>${winner.name}</strong> (${winner.probLabel} des jetons en caution) est tirée au sort et attelle le Wagon #2.`
                : 'Lancez le tirage pour désigner la gare qui attellera le wagon.'}
            </span>
          </div>
          <div class="feedback-row">
            <span class="feedback-label">Coût & sécurité :</span>
            <span class="feedback-val success-val">
              Aucune énergie gaspillée. Si la gare choisie triche, elle perd sa caution.
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
          <h3 class="card-title">Quelle gare a le droit d'atteler le wagon ?</h3>
          <p>
            À l'étape 5, on a vu comment <strong>une</strong> gare valide un wagon. Mais sur le réseau, <strong>toutes les gares</strong> veulent valider le prochain wagon pour toucher la récompense.
          </p>
          <p>
            Il existe deux grandes méthodes pour les départager : la <strong>Preuve de Travail (PoW)</strong> et la <strong>Preuve d'Enjeu (PoS)</strong>.
          </p>
        </article>

        <article class="step-card action-card animate-fade">
          <h3 class="card-title">Comparer sur les 3 gares</h3>
          <p class="card-instruction">
            Basculez entre les deux méthodes et lancez une validation :
          </p>

          <div class="difficulty-selector-row" role="tablist" aria-label="Choix du mécanisme de consensus">
            <button id="btn-tab-pow" class="btn-diff-option ${isPoW ? 'active' : ''}" role="tab" aria-selected="${isPoW}" ${isRunning ? 'disabled' : ''}>
              <span>PoW (Course de calcul)</span>
            </button>
            <button id="btn-tab-pos" class="btn-diff-option ${!isPoW ? 'active' : ''}" role="tab" aria-selected="${!isPoW}" ${isRunning ? 'disabled' : ''}>
              <span>PoS (Tirage sur caution)</span>
            </button>
          </div>

          <button id="btn-step6-run" class="btn-panel-primary" ${isRunning ? 'disabled' : ''}>
            <span>${actionButtonLabel}</span>
          </button>

          ${feedbackHTML}
        </article>

        ${(this.hasTestedPoW || this.hasTestedPoS) ? `
          <article class="step-card keypoint-card animate-fade">
            <h4 class="card-title keypoint-title">Point clé : Puissance électrique vs Caution</h4>
            <p class="keypoint-text">
              En <strong>PoW (Bitcoin)</strong>, tout le monde calcule en même temps et seule la plus rapide gagne : c'est très sûr, mais énergivore. En <strong>PoS (Ethereum)</strong>, on tire au sort une seule gare selon sa caution avant de fabriquer le bloc : cela économise 99,9 % d'électricité.
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
