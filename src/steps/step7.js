import * as THREE from 'three';

/**
 * Étape 7 : Cycle de vie et illustration d'attaque.
 * Métaphore : Un train pirate emprunte une voie ferrée de dérivation parallèle
 * pour tenter une double dépense (Fork malveillant).
 * Interaction : Visualiser le conflit entre les deux voies parallèles et appliquer
 * la règle du consensus de la chaîne la plus longue qui détruit le train pirate.
 */
export const step7 = {
  id: 7,
  title: "Cycle de vie et illustration d'attaque",
  ctx: null,

  rafId: null,
  attackState: 'idle', // 'idle' | 'fork' | 'resolved'
  destroyProgress: 0,

  attackGroup: null,
  pirateTrainGroup: null,
  pirateMaterials: [],
  pirateDebris: [],
  pirateLight: null,

  init(context) {
    this.ctx = context;
  },

  enter() {
    const { trainConvoy, cameraController, environment } = this.ctx;

    this.attackState = 'idle';
    this.destroyProgress = 0;

    if (cameraController) {
      cameraController.setViewOffset(210);
    }

    if (environment) {
      environment.setSpeed(2.5);
    }

    if (trainConvoy) {
      trainConvoy.resetConvoy([
        { emetteur: 'Arthur', destinataire: 'Vendeur-A', montant: 20, unite: 'MMI-Coin' },
        { emetteur: 'Alban', destinataire: 'Equipe-R507', montant: 30, unite: 'MMI-Coin' }
      ]);
      if (cameraController) {
        cameraController.setInteractiveObjects(trainConvoy.getInteractiveObjects());
      }
    }

    this.buildParallelTrackAndPirateTrain();

    if (cameraController) {
      cameraController.moveTo(
        new THREE.Vector3(3.8, 5.8, 12.5),
        new THREE.Vector3(3.8, 0.2, 1.5),
        1.2
      );
    }

    this.startAnimationLoop();
    this.renderLeftPanel();
  },

  exit() {
    this.stopAnimationLoop();

    if (this.attackGroup && this.ctx?.scene) {
      this.ctx.scene.remove(this.attackGroup);
      this.attackGroup = null;
    }
    this.pirateTrainGroup = null;
    this.pirateMaterials = [];
    this.pirateDebris = [];
    this.pirateLight = null;

    const panel = document.getElementById('step-panel-left');
    if (panel) {
      const inner = panel.querySelector('.step-panel-inner');
      if (inner) inner.remove();
    }
  },

  /**
   * Construit la voie ferrée de dérivation parallèle (z = 3.2) et le train pirate.
   */
  buildParallelTrackAndPirateTrain() {
    const { scene } = this.ctx;
    if (!scene) return;

    if (this.attackGroup) {
      scene.remove(this.attackGroup);
    }

    this.attackGroup = new THREE.Group();
    this.pirateMaterials = [];
    this.pirateDebris = [];

    const parallelZ = 3.2;

    // 1. Ballast et rails de la voie de dérivation parallèle
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

    // Rails d'aiguillage obliques reliant la voie principale (z=0) à la voie pirate (z=3.2)
    const switchGeo = new THREE.BoxGeometry(5.5, 0.09, 0.07);
    [-0.66, 0.66].forEach((offsetZ) => {
      const swRail = new THREE.Mesh(switchGeo, railMat);
      swRail.position.set(-2.2, -0.33, parallelZ / 2 + offsetZ);
      swRail.rotation.y = -0.54;
      this.attackGroup.add(swRail);
    });

    // 2. Train Pirate (Locomotive pirate + 1 wagon de double dépense)
    this.pirateTrainGroup = new THREE.Group();
    this.pirateTrainGroup.position.set(0, 0, parallelZ);
    this.pirateTrainGroup.visible = false;

    const addPirateMat = (params) => {
      const mat = new THREE.MeshStandardMaterial({
        ...params,
        transparent: true,
        opacity: 1.0
      });
      this.pirateMaterials.push(mat);
      return mat;
    };

    const bodyMat = addPirateMat({
      color: 0x2b0909,
      emissive: 0x7f1d1d,
      emissiveIntensity: 0.45,
      metalness: 0.8,
      roughness: 0.3
    });

    const accentMat = addPirateMat({
      color: 0xef4444,
      emissive: 0xdc2626,
      emissiveIntensity: 1.5,
      metalness: 0.5,
      roughness: 0.2
    });

    // Locomotive pirate (X = 0)
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

    const beacon = new THREE.Mesh(new THREE.SphereGeometry(0.12, 12, 12), accentMat);
    beacon.position.set(0.7, 1.25, 0);
    locoGroup.add(beacon);

    this.pirateTrainGroup.add(locoGroup);

    // Wagon pirate #1 (X = 3.8) : Contient la transaction frauduleuse (Arthur -> Arthur)
    const wagonGroup = new THREE.Group();
    wagonGroup.position.set(3.8, 0, 0);

    const wBase = new THREE.Mesh(new THREE.BoxGeometry(2.5, 0.2, 1.24), bodyMat);
    wagonGroup.add(wBase);

    const glassMat = addPirateMat({
      color: 0xef4444,
      emissive: 0x991b1b,
      emissiveIntensity: 0.4,
      transparent: true,
      opacity: 0.35
    });
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

    // Lumière rouge menaçante au-dessus du train pirate
    this.pirateLight = new THREE.PointLight(0xef4444, 0, 7.0);
    this.pirateLight.position.set(1.9, 1.8, 0);
    this.pirateTrainGroup.add(this.pirateLight);

    // Particules de désintégration pour la destruction du train pirate
    const debrisGeo = new THREE.BoxGeometry(0.16, 0.16, 0.16);
    for (let i = 0; i < 28; i++) {
      const dMat = new THREE.MeshBasicMaterial({
        color: i % 2 === 0 ? 0xef4444 : 0xfacc15,
        transparent: true,
        opacity: 0
      });
      const dMesh = new THREE.Mesh(debrisGeo, dMat);
      dMesh.visible = false;
      dMesh.userData = {
        originX: -0.5 + Math.random() * 5.2,
        originY: 0.2 + Math.random() * 0.9,
        originZ: (Math.random() - 0.5) * 1.0,
        vx: (Math.random() - 0.5) * 4.5,
        vy: 1.5 + Math.random() * 3.5,
        vz: (Math.random() - 0.5) * 4.5
      };
      this.pirateTrainGroup.add(dMesh);
      this.pirateDebris.push(dMesh);
    }

    this.attackGroup.add(this.pirateTrainGroup);
    scene.add(this.attackGroup);
  },

  /**
   * Phase 1 : Fait surgir le train pirate sur la voie de dérivation (tentative de double dépense).
   */
  triggerForkAttack() {
    this.attackState = 'fork';
    this.destroyProgress = 0;

    if (this.pirateTrainGroup) {
      this.pirateTrainGroup.visible = true;
      this.pirateTrainGroup.position.set(-4.0, 0, 3.2);
      this.pirateTrainGroup.scale.set(1, 1, 1);
      this.pirateTrainGroup.rotation.set(0, 0, 0);
    }

    this.pirateMaterials.forEach((mat) => {
      mat.opacity = mat === this.pirateMaterials[2] ? 0.35 : 1.0;
    });

    if (this.pirateLight) {
      this.pirateLight.intensity = 3.5;
    }

    this.renderLeftPanel();
  },

  /**
   * Phase 2 : Applique la règle de la chaîne la plus longue.
   * Le convoi officiel ajoute de nouveaux wagons validés et le train pirate est détruit.
   */
  resolveLongestChain() {
    if (this.attackState !== 'fork') return;

    this.attackState = 'resolved';
    this.destroyProgress = 0.01;

    const { trainConvoy, cameraController } = this.ctx;
    if (trainConvoy && trainConvoy.blockchain.chain.length < 5) {
      trainConvoy.addBlock({
        emetteur: 'Réseau-Majoritaire',
        destinataire: 'Validation-Officielle',
        montant: 40,
        unite: 'MMI-Coin'
      });
      trainConvoy.addBlock({
        emetteur: 'Confirmation-Finale',
        destinataire: 'Vendeur-A',
        montant: 20,
        unite: 'MMI-Coin'
      });
    }

    // Initialise les débris d'explosion / désintégration du train pirate
    this.pirateDebris.forEach((d) => {
      d.visible = true;
      d.position.set(d.userData.originX, d.userData.originY, d.userData.originZ);
      d.material.opacity = 1.0;
    });

    if (cameraController) {
      cameraController.moveTo(
        new THREE.Vector3(5.2, 6.2, 13.8),
        new THREE.Vector3(4.8, 0.2, 1.4),
        1.2
      );
    }

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
    let lastTime = performance.now();

    const loop = () => {
      const now = performance.now();
      const dt = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;

      if (this.attackState === 'fork' && this.pirateTrainGroup) {
        // Le train pirate remonte sur la voie parallèle pour se mettre à hauteur du convoi
        this.pirateTrainGroup.position.x = THREE.MathUtils.lerp(this.pirateTrainGroup.position.x, 0.0, dt * 3.5);
        if (this.pirateLight) {
          this.pirateLight.intensity = 2.8 + Math.sin(now * 0.012) * 1.2;
        }
      } else if (this.attackState === 'resolved' && this.pirateTrainGroup) {
        if (this.destroyProgress < 1.0) {
          this.destroyProgress = Math.min(1.0, this.destroyProgress + dt * 0.75);
          const p = this.destroyProgress;

          // Affaissement et disparition du train pirate rejeté par le consensus
          this.pirateTrainGroup.position.y = -p * 0.85;
          this.pirateTrainGroup.rotation.x = p * 0.35;

          this.pirateMaterials.forEach((mat) => {
            mat.opacity = Math.max(0, (1 - p) * 0.8);
          });

          if (this.pirateLight) {
            this.pirateLight.intensity = Math.max(0, (1 - p) * 4.0);
          }

          this.pirateDebris.forEach((d) => {
            d.position.x += d.userData.vx * dt;
            d.position.y += d.userData.vy * dt;
            d.position.z += d.userData.vz * dt;
            d.userData.vy -= 6.5 * dt;
            d.rotation.x += dt * 5;
            d.rotation.y += dt * 4;
            d.material.opacity = Math.max(0, 1 - p);
          });

          if (p >= 1.0) {
            this.pirateTrainGroup.visible = false;
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

    const officialLength = this.ctx?.trainConvoy?.blockchain?.chain?.length || 3;

    inner.innerHTML = `
      <header class="step-panel-header">
        <h2 class="step-panel-title">Cycle de Vie et Attaque</h2>
      </header>

      <div class="step-panel-scroll">
        <article class="step-card context-card animate-fade">
          <h3 class="card-title">Du quai d'embarquement au conflit de voies</h3>
          <p>
            Une transaction suit un cycle précis : <strong>1. Création</strong> &rarr; <strong>2. Propagation P2P</strong> &rarr; <strong>3. Attente sur le quai (Mempool)</strong> &rarr; <strong>4. Minage dans un wagon</strong> &rarr; <strong>5. Confirmation par les wagons suivants</strong>.
          </p>
          <p>
            Mais que se passe-t-il si un attaquant lance un <strong>train pirate</strong> sur une voie de dérivation parallèle pour dépenser deux fois les mêmes jetons ?
          </p>
        </article>

        <article class="step-card ${this.attackState === 'fork' ? 'danger-card' : 'action-card'} animate-fade">
          <h3 class="card-title">Simulation d'attaque de double dépense</h3>
          <p class="card-instruction">
            ${this.attackState === 'idle'
              ? 'Lancez un train pirate sur la voie de dérivation pour créer un conflit de registres (Fork) :'
              : (this.attackState === 'fork'
                ? 'Conflit en cours : deux trains parallèles revendiquent des transactions opposées !'
                : 'Le réseau majoritaire a tranché : la chaîne officielle la plus longue l\'emporte et détruit le train pirate.')}
          </p>

          ${this.attackState === 'idle' ? `
            <button id="btn-step7-fork" class="btn-panel-danger">
              <span>1. Lancer l'attaque (Train pirate parallèle)</span>
            </button>
          ` : ''}

          ${this.attackState === 'fork' ? `
            <button id="btn-step7-resolve" class="btn-panel-primary">
              <span>2. Appliquer le consensus (Chaîne la plus longue)</span>
            </button>
          ` : ''}

          ${this.attackState === 'resolved' ? `
            <button id="btn-step7-reset" class="btn-panel-ghost" style="width: 100%;">
              <span>Rejouer la simulation d'attaque</span>
            </button>
          ` : ''}

          <div class="action-feedback-box ${this.attackState === 'fork' ? 'error' : (this.attackState === 'resolved' ? 'success' : '')}">
            <div class="feedback-row">
              <span class="feedback-label">Voie principale :</span>
              <span class="feedback-val">${officialLength} blocs validés (Honnête)</span>
            </div>
            <div class="feedback-row">
              <span class="feedback-label">Voie de dérivation :</span>
              <span class="feedback-val ${this.attackState === 'fork' ? 'error-val' : ''}">
                ${this.attackState === 'idle' ? 'Inactive (0 bloc)' : (this.attackState === 'fork' ? '2 blocs (Double dépense)' : 'Branche abandonnée / Détruite')}
              </span>
            </div>
            <div class="feedback-row">
              <span class="feedback-label">Règle d'arbitrage :</span>
              <span class="feedback-val">Chaîne la plus longue (> 51%)</span>
            </div>
            <div class="feedback-row">
              <span class="feedback-label">Statut du réseau :</span>
              <span class="feedback-val ${this.attackState === 'fork' ? 'error-val' : 'success-val'}">
                ${this.attackState === 'fork' ? 'Conflit de branches (Fork)' : (this.attackState === 'resolved' ? 'Attaque neutralisée' : 'Circulation normale')}
              </span>
            </div>
          </div>
        </article>

        <article class="step-card keypoint-card animate-fade">
          <h4 class="card-title keypoint-title">Point clé</h4>
          <p class="keypoint-text">
            Pour que son train pirate dépasse le convoi officiel, l'attaquant devrait contrôler plus de 51% de la puissance de toutes les gares réunies. Sans cette majorité, le réseau honnête allonge sa chaîne plus vite et annule la voie pirate.
          </p>
        </article>

        <div class="substep-action-box animate-fade">
          <button id="btn-step7-restart" class="btn-panel-ghost">
            <span>&larr; Revenir au début du parcours (Étape 0)</span>
          </button>
        </div>
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

    document.getElementById('btn-step7-restart')?.addEventListener('click', () => {
      if (typeof this.ctx.onGoToStep === 'function') {
        this.ctx.onGoToStep(0);
      }
    });
  }
};
