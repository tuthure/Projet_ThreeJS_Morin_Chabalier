import * as THREE from 'three';

/**
 * Étape 7 : Attaque et règle de la chaîne la plus longue (51 %).
 * Scénario concret :
 * 1. Arthur paie 20 MMI-Coin à un vendeur dans le train officiel (Voie principale, 3 blocs).
 * 2. En cachette, il tente de lancer un train pirate sur une voie bis (Fork, 2 blocs)
 *    dans lequel il garde ses 20 MMI-Coin pour lui-même (tentative de double dépense).
 * 3. Le réseau applique la règle de la chaîne la plus longue : toutes les gares honnêtes
 *    continuent d'allonger le train officiel (qui passe à 5 blocs), tandis que l'attaquant
 *    seul reste bloqué à 2 blocs. La voie pirate est abandonnée.
 */
export const step7 = {
  id: 7,
  title: 'Attaque et chaîne la plus longue',
  ctx: null,

  rafId: null,
  attackState: 'idle', // 'idle' | 'fork' | 'resolved'
  resolveProgress: 0,

  attackGroup: null,
  pirateTrainGroup: null,
  pirateMaterials: [],
  pirateLight: null,
  tooltipLayer: null,

  // Animation d'arrivée des nouveaux wagons officiels (#3 et #4) lors de la résolution
  newWagonsAnimProgress: 1.0,

  init(context) {
    this.ctx = context;
  },

  enter() {
    const { trainConvoy, cameraController, environment } = this.ctx;

    this.attackState = 'idle';
    this.resolveProgress = 0;
    this.newWagonsAnimProgress = 1.0;

    if (cameraController) {
      cameraController.setViewOffset(210);
    }

    // Le décor reste fixe pour observer clairement l'aiguillage et les deux voies parallèles
    if (environment) {
      environment.setSpeed(0);
    }

    if (trainConvoy) {
      trainConvoy.resetConvoy([
        { emetteur: 'Arthur', destinataire: 'Vendeur', montant: 20, unite: 'MMI-Coin' },
        { emetteur: 'Alban', destinataire: 'Equipe-R507', montant: 30, unite: 'MMI-Coin' }
      ]);
      if (cameraController) {
        cameraController.setInteractiveObjects(trainConvoy.getInteractiveObjects());
      }
    }

    this.buildParallelTrackAndPirateTrain();
    this.setupTooltipsLayer();
    this.createForkTooltips();

    if (cameraController) {
      cameraController.moveTo(
        new THREE.Vector3(4.2, 4.8, 11.2),
        new THREE.Vector3(4.0, 0.3, 1.4),
        1.15
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

    if (this.attackGroup && this.ctx?.scene) {
      this.ctx.scene.remove(this.attackGroup);
      this.attackGroup = null;
    }
    this.pirateTrainGroup = null;
    this.pirateMaterials = [];
    this.pirateLight = null;

    const panel = document.getElementById('step-panel-left');
    if (panel) {
      const inner = panel.querySelector('.step-panel-inner');
      if (inner) inner.remove();
    }
  },

  /**
   * Construit la voie ferrée de dérivation parallèle (z = 3.2) et le train pirate (2 blocs).
   */
  buildParallelTrackAndPirateTrain() {
    const { scene } = this.ctx;
    if (!scene) return;

    if (this.attackGroup) {
      scene.remove(this.attackGroup);
    }

    this.attackGroup = new THREE.Group();
    this.pirateMaterials = [];

    const parallelZ = 3.2;

    // 1. Ballast et rails de la voie bis parallèle
    const ballastGeo = new THREE.BoxGeometry(36, 0.14, 2.4);
    const ballastMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.9 });
    const ballast = new THREE.Mesh(ballastGeo, ballastMat);
    ballast.position.set(4.0, -0.46, parallelZ);
    this.attackGroup.add(ballast);

    const railGeo = new THREE.BoxGeometry(36, 0.1, 0.07);
    const railMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.85, roughness: 0.25 });

    const railL = new THREE.Mesh(railGeo, railMat);
    railL.position.set(4.0, -0.34, parallelZ - 0.66);
    this.attackGroup.add(railL);

    const railR = new THREE.Mesh(railGeo, railMat);
    railR.position.set(4.0, -0.34, parallelZ + 0.66);
    this.attackGroup.add(railR);

    // Traverses de la voie parallèle
    const sleeperGeo = new THREE.BoxGeometry(0.28, 0.08, 1.9);
    const sleeperMat = new THREE.MeshStandardMaterial({ color: 0x3b1d0e, roughness: 0.9 });
    for (let x = -12; x <= 20; x += 1.2) {
      const sleeper = new THREE.Mesh(sleeperGeo, sleeperMat);
      sleeper.position.set(x, -0.42, parallelZ);
      this.attackGroup.add(sleeper);
    }

    // Rails d'aiguillage obliques reliant la voie principale (z = 0) à la voie bis (z = 3.2)
    const switchGeo = new THREE.BoxGeometry(5.5, 0.09, 0.07);
    [-0.66, 0.66].forEach((offsetZ) => {
      const swRail = new THREE.Mesh(switchGeo, railMat);
      swRail.position.set(-2.2, -0.33, parallelZ / 2 + offsetZ);
      swRail.rotation.y = -0.54;
      this.attackGroup.add(swRail);
    });

    // 2. Train Pirate (2 blocs seulement : Locomotive + 1 wagon de double dépense)
    this.pirateTrainGroup = new THREE.Group();
    this.pirateTrainGroup.position.set(-4.5, 0, parallelZ);
    this.pirateTrainGroup.visible = false;

    const addPirateMat = (params, baseOpacity = 1.0) => {
      const mat = new THREE.MeshStandardMaterial({
        ...params,
        transparent: true,
        opacity: baseOpacity
      });
      mat.userData = { baseOpacity };
      this.pirateMaterials.push(mat);
      return mat;
    };

    const bodyMat = addPirateMat({
      color: 0x2b0909,
      emissive: 0x7f1d1d,
      emissiveIntensity: 0.4,
      metalness: 0.8,
      roughness: 0.3
    }, 1.0);

    const accentMat = addPirateMat({
      color: 0xef4444,
      emissive: 0xdc2626,
      emissiveIntensity: 1.3,
      metalness: 0.5,
      roughness: 0.2
    }, 1.0);

    // Locomotive pirate (x = 0)
    const locoGroup = new THREE.Group();
    const chassis = new THREE.Mesh(new THREE.BoxGeometry(2.5, 0.22, 1.24), bodyMat);
    locoGroup.add(chassis);

    const boiler = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.42, 1.4, 16), bodyMat);
    boiler.rotation.z = Math.PI / 2;
    boiler.position.set(-0.4, 0.55, 0);
    locoGroup.add(boiler);

    const cab = new THREE.Mesh(new THREE.BoxGeometry(0.9, 1.0, 1.22), bodyMat);
    cab.position.set(0.7, 0.65, 0);
    locoGroup.add(cab);

    const stack = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.09, 0.42, 12), accentMat);
    stack.position.set(-0.85, 1.1, 0);
    locoGroup.add(stack);

    const beacon = new THREE.Mesh(new THREE.SphereGeometry(0.11, 12, 12), accentMat);
    beacon.position.set(0.7, 1.24, 0);
    locoGroup.add(beacon);

    this.pirateTrainGroup.add(locoGroup);

    // Wagon pirate #1 (x = 3.8) : Contient la transaction contradictoire (Arthur garde ses 20 MMI-Coin)
    const wagonGroup = new THREE.Group();
    wagonGroup.position.set(3.8, 0, 0);

    const wBase = new THREE.Mesh(new THREE.BoxGeometry(2.5, 0.2, 1.24), bodyMat);
    wagonGroup.add(wBase);

    const glassMat = addPirateMat({
      color: 0xef4444,
      emissive: 0x991b1b,
      emissiveIntensity: 0.35
    }, 0.35);
    const wBox = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.95, 1.14), glassMat);
    wBox.position.y = 0.6;
    wagonGroup.add(wBox);

    const cargo = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.5, 0.7), accentMat);
    cargo.position.y = 0.45;
    wagonGroup.add(cargo);

    // Faisceau d'attelage pirate rouge
    const coupler = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 1.2, 10), accentMat);
    coupler.rotation.z = Math.PI / 2;
    coupler.position.set(-1.9, 0.1, 0);
    wagonGroup.add(coupler);

    this.pirateTrainGroup.add(wagonGroup);

    // Halo lumineux discret au-dessus du train pirate
    this.pirateLight = new THREE.PointLight(0xef4444, 0, 6.0);
    this.pirateLight.position.set(1.9, 1.6, 0);
    this.pirateTrainGroup.add(this.pirateLight);

    this.attackGroup.add(this.pirateTrainGroup);
    scene.add(this.attackGroup);
  },

  /**
   * Initialise le conteneur DOM pour les infobulles 3D comparant les deux trains.
   */
  setupTooltipsLayer() {
    const hud = document.getElementById('hud');
    if (!hud) return;

    if (!this.tooltipLayer) {
      this.tooltipLayer = document.createElement('div');
      this.tooltipLayer.id = 'step7-tooltips-layer';
      this.tooltipLayer.className = 'scene-tooltips-layer';
      hud.appendChild(this.tooltipLayer);
    }
    this.tooltipLayer.innerHTML = '';
  },

  /**
   * Crée 2 infobulles SVG : l'une sur le train officiel (z = 0), l'autre sur le train pirate (z = 3.2).
   */
  createForkTooltips() {
    if (!this.tooltipLayer) return;

    this.tooltipLayer.innerHTML = `
      <svg id="step7-tooltips-svg" style="position: absolute; inset: 0; width: 100%; height: 100%; pointer-events: none; overflow: visible; z-index: 10;">
        <line id="s7-line-official" stroke="#38bdf8" stroke-width="2" stroke-linecap="round" opacity="0.85" />
        <circle id="s7-dot-out-official" r="6.5" fill="none" stroke="#38bdf8" stroke-width="1.5" opacity="0.8" />
        <circle id="s7-dot-in-official" r="3" fill="#38bdf8" />

        <line id="s7-line-pirate" stroke="#ef4444" stroke-width="2" stroke-linecap="round" opacity="0" />
        <circle id="s7-dot-out-pirate" r="6.5" fill="none" stroke="#ef4444" stroke-width="1.5" opacity="0" />
        <circle id="s7-dot-in-pirate" r="3" fill="#ef4444" opacity="0" />
      </svg>

      <div id="tooltip-s7-official" class="scene-tooltip" style="--spot-color: #38bdf8; z-index: 12;">
        <button type="button" class="scene-tooltip-pill">
          <span class="scene-tooltip-dot"></span>
          <span class="scene-tooltip-label" id="s7-label-official">
            <strong>Train officiel</strong> · 3 wagons (Arthur paie le vendeur)
          </span>
        </button>
      </div>

      <div id="tooltip-s7-pirate" class="scene-tooltip" style="--spot-color: #ef4444; z-index: 12; opacity: 0; visibility: hidden;">
        <button type="button" class="scene-tooltip-pill">
          <span class="scene-tooltip-dot"></span>
          <span class="scene-tooltip-label" id="s7-label-pirate">
            <strong>Train pirate (Fork)</strong> · 2 wagons (Arthur garde ses jetons)
          </span>
        </button>
      </div>
    `;

    ['tooltip-s7-official', 'tooltip-s7-pirate'].forEach((id) => {
      document.getElementById(id)?.addEventListener('pointerdown', (e) => e.stopPropagation());
    });

    this.updateTooltipsDOM();
  },

  /**
   * Met à jour le texte et la couleur des 2 infobulles 3D selon l'état ('idle' | 'fork' | 'resolved').
   */
  updateTooltipsDOM() {
    const offWrap = document.getElementById('tooltip-s7-official');
    const offLabel = document.getElementById('s7-label-official');
    const offLine = document.getElementById('s7-line-official');
    const offDotIn = document.getElementById('s7-dot-in-official');
    const offDotOut = document.getElementById('s7-dot-out-official');

    const pirWrap = document.getElementById('tooltip-s7-pirate');
    const pirLabel = document.getElementById('s7-label-pirate');
    const pirLine = document.getElementById('s7-line-pirate');
    const pirDotIn = document.getElementById('s7-dot-in-pirate');
    const pirDotOut = document.getElementById('s7-dot-out-pirate');

    if (this.attackState === 'idle') {
      const offColor = '#38bdf8';
      offWrap?.style.setProperty('--spot-color', offColor);
      if (offLabel) offLabel.innerHTML = '<strong>Train officiel</strong> · 3 wagons (Arthur paie le vendeur)';
      offLine?.setAttribute('stroke', offColor);
      offDotIn?.setAttribute('fill', offColor);
      offDotOut?.setAttribute('stroke', offColor);

      if (pirWrap) {
        pirWrap.style.opacity = '0';
        pirWrap.style.visibility = 'hidden';
      }
      pirLine?.setAttribute('opacity', '0');
      pirDotIn?.setAttribute('opacity', '0');
      pirDotOut?.setAttribute('opacity', '0');
    } else if (this.attackState === 'fork') {
      const offColor = '#38bdf8';
      offWrap?.style.setProperty('--spot-color', offColor);
      if (offLabel) offLabel.innerHTML = '<strong>Train officiel (Gares honnêtes)</strong> · 3 wagons';
      offLine?.setAttribute('stroke', offColor);
      offDotIn?.setAttribute('fill', offColor);
      offDotOut?.setAttribute('stroke', offColor);

      const pirColor = '#ef4444';
      if (pirWrap) {
        pirWrap.style.setProperty('--spot-color', pirColor);
        pirWrap.style.opacity = '1';
        pirWrap.style.visibility = 'visible';
      }
      if (pirLabel) pirLabel.innerHTML = '<strong>Train pirate (Attaquant seul)</strong> · 2 wagons';
      pirLine?.setAttribute('stroke', pirColor);
      pirLine?.setAttribute('opacity', '0.85');
      pirDotIn?.setAttribute('fill', pirColor);
      pirDotIn?.setAttribute('opacity', '1');
      pirDotOut?.setAttribute('stroke', pirColor);
      pirDotOut?.setAttribute('opacity', '0.8');
    } else {
      const offColor = '#10b981';
      offWrap?.style.setProperty('--spot-color', offColor);
      if (offLabel) offLabel.innerHTML = '<strong>Train officiel · 5 wagons</strong> (Chaîne la plus longue — conservée)';
      offLine?.setAttribute('stroke', offColor);
      offDotIn?.setAttribute('fill', offColor);
      offDotOut?.setAttribute('stroke', offColor);

      const pirColor = '#64748b';
      if (pirWrap) {
        pirWrap.style.setProperty('--spot-color', pirColor);
        pirWrap.style.opacity = '1';
        pirWrap.style.visibility = 'visible';
      }
      if (pirLabel) pirLabel.innerHTML = '<strong>Train pirate · 2 wagons</strong> (Trop court — abandonné)';
      pirLine?.setAttribute('stroke', pirColor);
      pirLine?.setAttribute('opacity', '0.55');
      pirDotIn?.setAttribute('fill', pirColor);
      pirDotIn?.setAttribute('opacity', '0.7');
      pirDotOut?.setAttribute('stroke', pirColor);
      pirDotOut?.setAttribute('opacity', '0.6');
    }
  },

  /**
   * Phase 1 : Fait arriver le train pirate sur la voie bis parallèle (tentative de double dépense).
   */
  triggerForkAttack() {
    this.attackState = 'fork';
    this.resolveProgress = 0;

    if (this.pirateTrainGroup) {
      this.pirateTrainGroup.visible = true;
      this.pirateTrainGroup.position.set(-4.5, 0, 3.2);
    }

    this.pirateMaterials.forEach((mat) => {
      mat.opacity = mat.userData.baseOpacity;
    });

    if (this.pirateLight) {
      this.pirateLight.intensity = 2.8;
    }

    this.updateTooltipsDOM();
    this.renderLeftPanel();
  },

  /**
   * Phase 2 : Applique la règle de la chaîne la plus longue.
   * Les gares honnêtes ajoutent 2 nouveaux wagons au train officiel (qui passe à 5 wagons),
   * tandis que le train pirate (bloqué à 2 wagons) est abandonné et s'éteint.
   */
  resolveLongestChain() {
    if (this.attackState !== 'fork') return;

    this.attackState = 'resolved';
    this.resolveProgress = 0;
    this.newWagonsAnimProgress = 0;

    const { trainConvoy, cameraController } = this.ctx;
    if (trainConvoy && trainConvoy.blockchain.chain.length < 5) {
      trainConvoy.addBlock({
        emetteur: 'Gare-A',
        destinataire: 'Confirmation-1',
        montant: 40,
        unite: 'MMI-Coin'
      });
      trainConvoy.addBlock({
        emetteur: 'Gare-B',
        destinataire: 'Confirmation-2',
        montant: 25,
        unite: 'MMI-Coin'
      });

      if (cameraController) {
        cameraController.setInteractiveObjects(trainConvoy.getInteractiveObjects());
      }
    }

    if (cameraController) {
      cameraController.moveTo(
        new THREE.Vector3(6.8, 5.2, 13.2),
        new THREE.Vector3(6.4, 0.3, 1.2),
        1.15
      );
    }

    this.updateTooltipsDOM();
    this.renderLeftPanel();
  },

  /**
   * Réinitialise le scénario à l'état initial.
   */
  resetSimulation() {
    this.enter();
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

      // 1. Animation du train pirate et de l'allongement du train officiel
      if (this.attackState === 'fork' && this.pirateTrainGroup) {
        this.pirateTrainGroup.position.x = THREE.MathUtils.lerp(this.pirateTrainGroup.position.x, 0.0, Math.min(1, dt * 4.5));
        if (this.pirateLight) {
          this.pirateLight.intensity = 2.4 + Math.sin(now * 0.008) * 0.8;
        }
      } else if (this.attackState === 'resolved') {
        // Les wagons #3 et #4 arrivent de la droite et s'attellent au train officiel
        if (this.newWagonsAnimProgress < 1.0 && trainConvoy) {
          this.newWagonsAnimProgress = Math.min(1.0, this.newWagonsAnimProgress + dt * 1.6);
          const ease = 1 - Math.pow(1 - this.newWagonsAnimProgress, 3);
          const w3 = trainConvoy.getWagon(3);
          const w4 = trainConvoy.getWagon(4);
          if (w3) w3.position.x = THREE.MathUtils.lerp(13.2, 11.4, ease);
          if (w4) w4.position.x = THREE.MathUtils.lerp(17.4, 15.2, ease);
        }

        // Le train pirate s'éteint et devient fantomatique sur sa voie de garage
        if (this.pirateTrainGroup && this.resolveProgress < 1.0) {
          this.resolveProgress = Math.min(1.0, this.resolveProgress + dt * 1.2);
          const p = this.resolveProgress;

          this.pirateMaterials.forEach((mat) => {
            mat.opacity = THREE.MathUtils.lerp(mat.userData.baseOpacity, mat.userData.baseOpacity * 0.25, p);
          });

          if (this.pirateLight) {
            this.pirateLight.intensity = Math.max(0, (1 - p) * 2.4);
          }
        }
      }

      // 2. Projection 2D des 2 infobulles (Train officiel en haut, Train pirate en bas)
      if (this.tooltipLayer && camera) {
        const width = window.innerWidth;
        const height = window.innerHeight;
        const toX = (v) => (v.x * 0.5 + 0.5) * width;
        const toY = (v) => (-v.y * 0.5 + 0.5) * height;

        const officialAnchorX = this.attackState === 'resolved' ? 7.6 : 3.8;
        const officialWorld = new THREE.Vector3(officialAnchorX, 1.08, 0).project(camera);
        const pirateAnchorX = (this.pirateTrainGroup ? this.pirateTrainGroup.position.x : 0) + 2.2;
        const pirateWorld = new THREE.Vector3(pirateAnchorX, 1.05, 3.2).project(camera);

        if (officialWorld.z > 1 || pirateWorld.z > 1) {
          this.tooltipLayer.style.opacity = '0';
          this.tooltipLayer.style.visibility = 'hidden';
        } else {
          const offX = toX(officialWorld);
          const offY = toY(officialWorld);
          const pirX = toX(pirateWorld);
          const pirY = toY(pirateWorld);

          const isCovered = width > 768 && offX < 395;
          this.tooltipLayer.style.opacity = isCovered ? '0' : '1';
          this.tooltipLayer.style.visibility = isCovered ? 'hidden' : 'visible';

          const offPillX = Math.max(460, Math.min(width - 220, offX));
          const offPillY = Math.max(60, offY - 58);
          const offEl = document.getElementById('tooltip-s7-official');
          if (offEl) {
            offEl.style.transform = `translate3d(${offPillX.toFixed(1)}px, ${offPillY.toFixed(1)}px, 0) translate(-50%, -50%)`;
          }
          setLineAndDot('s7-line-official', 's7-dot-in-official', 's7-dot-out-official', offPillX, offPillY + 14, offX, offY);

          if (this.attackState !== 'idle') {
            const pirPillX = Math.max(460, Math.min(width - 220, pirX));
            const pirPillY = Math.min(height - 50, pirY + 64);
            const pirEl = document.getElementById('tooltip-s7-pirate');
            if (pirEl) {
              pirEl.style.transform = `translate3d(${pirPillX.toFixed(1)}px, ${pirPillY.toFixed(1)}px, 0) translate(-50%, -50%)`;
            }
            setLineAndDot('s7-line-pirate', 's7-dot-in-pirate', 's7-dot-out-pirate', pirPillX, pirPillY - 14, pirX, pirY);
          }
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

    const isIdle = this.attackState === 'idle';
    const isFork = this.attackState === 'fork';
    const isResolved = this.attackState === 'resolved';

    const stateExplanationHTML = isIdle
      ? `
        <p>
          Cliquez ci-dessous pour faire surgir le <strong>train pirate</strong> d'Arthur sur la voie de dérivation et créer un conflit entre deux versions de l'histoire (<strong>Fork</strong>) :
        </p>
        <button id="btn-step7-fork" class="btn-panel-danger">
          <span>1. Lancer le train pirate (Voie bis)</span>
        </button>
      `
      : isFork
        ? `
          <p>
            <strong>Dilemme pour le réseau :</strong> deux trains parallèles se contredisent. Mais l'attaquant est <strong>tout seul</strong> sur sa voie pirate (2 wagons), face à toutes les <strong>gares honnêtes réunies</strong> sur la voie officielle (3 wagons).
          </p>
          <button id="btn-step7-resolve" class="btn-panel-primary">
            <span>2. Faire avancer le réseau (Chaîne la plus longue)</span>
          </button>
        `
        : `
          <p>
            Les gares honnêtes ont continué d'accrocher des wagons au <strong>train officiel (5 wagons contre 2)</strong>. Le protocole suit toujours <strong>le train le plus long</strong> : la voie pirate est abandonnée.
          </p>
          <button id="btn-step7-reset" class="btn-panel-ghost" style="width: 100%;">
            <span>Rejouer la simulation</span>
          </button>
        `;

    inner.innerHTML = `
      <header class="step-panel-header">
        <h2 class="step-panel-title">Attaque et règle des 51 %</h2>
      </header>

      <div class="step-panel-scroll">
        <article class="step-card context-card animate-fade">
          <h3 class="card-title">Le dilemme des deux trains</h3>
          <p>
            Arthur paie <strong>20 MMI-Coin</strong> à un vendeur dans le <strong>train officiel</strong>. En cachette, il tente de lancer un <strong>train pirate</strong> sur une voie bis dans lequel il garde ses 20 MMI-Coin pour lui (<strong>double dépense</strong>).
          </p>
        </article>

        <article class="step-card ${isFork ? 'danger-card' : 'action-card'} animate-fade">
          <h3 class="card-title">Simulation : Voie officielle vs Voie pirate</h3>
          ${stateExplanationHTML}
        </article>

        ${isResolved ? `
          <article class="step-card keypoint-card animate-fade">
            <h4 class="card-title keypoint-title">Point clé : Pourquoi parle-t-on d'attaque des 51 % ?</h4>
            <p class="keypoint-text">
              Le réseau choisit toujours <strong>le train qui a le plus de wagons</strong>. Pour que son train pirate dépasse le train officiel, un attaquant devrait fabriquer des wagons plus vite que toutes les autres gares réunies : il lui faudrait contrôler plus de <strong>51 % du réseau</strong>, ce qui est quasi impossible à l'échelle mondiale.
            </p>
          </article>
        ` : ''}

        <nav class="step-nav-bar animate-fade">
          <button id="btn-step7-action-prev" class="btn-panel-ghost">
            <span class="btn-arrow">&larr;</span>
            <span>Étape 6 : Consensus</span>
          </button>
          <button id="btn-step7-restart" class="btn-panel-primary">
            <span>Accueil (Étape 0)</span>
            <span class="btn-arrow">&rarr;</span>
          </button>
        </nav>
      </div>
    `;

    panel.prepend(inner);
    this.setupEvents();
  },

  setupEvents() {
    document.getElementById('btn-step7-fork')?.addEventListener('click', () => {
      this.triggerForkAttack();
    });

    document.getElementById('btn-step7-resolve')?.addEventListener('click', () => {
      this.resolveLongestChain();
    });

    document.getElementById('btn-step7-reset')?.addEventListener('click', () => {
      this.resetSimulation();
    });

    document.getElementById('btn-step7-action-prev')?.addEventListener('click', () => {
      if (typeof this.ctx.onPrevStep === 'function') {
        this.ctx.onPrevStep();
      }
    });

    document.getElementById('btn-step7-restart')?.addEventListener('click', () => {
      if (typeof this.ctx.onGoToStep === 'function') {
        this.ctx.onGoToStep(0);
      }
    });
  }
};
