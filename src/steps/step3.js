import * as THREE from 'three';

/**
 * Étape 3 : Immuabilité et détection de falsification.
 * Simulation interactive d'une altération du Bloc Genesis :
 * - Discordance entre l'anneau arrière jaune (hash altéré) et le crochet avant cyan
 * - Décrochage mécanique de l'attelage et effet avalanche sur la suite du convoi
 */
export const step3 = {
  id: 3,
  title: 'Immuabilité et falsification',
  ctx: null,

  rafId: null,
  isBroken: false,
  couplerLight: null,
  restoreWaveUntil: 0,

  /**
   * Initialise le module avec le contexte global de l'application.
   * @param {object} context
   */
  init(context) {
    this.ctx = context;
  },

  /**
   * Active l'étape 3 :
   * - Met en place la Locomotive (#0) et deux wagons (#1 et #2)
   * - Cadre la caméra sur l'attelage et le convoi aval pour observer l'effet avalanche
   */
  enter() {
    const { trainConvoy, cameraController, environment, scene } = this.ctx;

    this.isBroken = false;
    this.restoreWaveUntil = 0;

    if (cameraController) {
      cameraController.setViewOffset(210);
    }

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

    if (scene && !this.couplerLight) {
      this.couplerLight = new THREE.PointLight(0x00f3ff, 2.5, 4.5);
      this.couplerLight.position.set(1.9, 0.45, 0.3);
      scene.add(this.couplerLight);
    }

    if (cameraController) {
      cameraController.moveTo(
        new THREE.Vector3(2.2, 1.85, 5.2),
        new THREE.Vector3(2.4, 0.45, 0),
        1.1
      );
    }

    this.startAnimationLoop();
    this.renderLeftPanel();
  },

  /**
   * Quitte l'étape 3 et nettoie les ressources 3D et DOM.
   */
  exit() {
    this.stopAnimationLoop();

    if (this.couplerLight && this.ctx?.scene) {
      this.ctx.scene.remove(this.couplerLight);
      this.couplerLight = null;
    }

    const panel = document.getElementById('step-panel-left');
    if (panel) {
      const inner = panel.querySelector('.step-panel-inner');
      if (inner) inner.remove();
    }
  },

  /**
   * Boucle d'animation régulant la dynamique de l'attelage :
   * - État intact : anneau arrière (0) et anneau avant (1) en concordance Cyan
   * - État altéré : anneau arrière (0) en JAUNE, anneau avant (1) en CYAN, attelage brisé
   */
  startAnimationLoop() {
    this.stopAnimationLoop();

    const loop = () => {
      const { trainConvoy } = this.ctx;
      const wagon1 = trainConvoy?.getWagon(1);
      const wagon2 = trainConvoy?.getWagon(2);
      const loco0 = trainConvoy?.getWagon(0);
      const time = performance.now() * 0.003;
      const isRestoring = performance.now() < this.restoreWaveUntil;

      if (wagon1 && loco0) {
        if (!this.isBroken) {
          const pulse = isRestoring ? (3.2 + Math.sin(time * 10) * 0.8) : (1.5 + Math.sin(time * 4) * 0.35);

          if (loco0.rearRingMaterial) {
            loco0.rearRingMaterial.color.setHex(0x00f3ff);
            loco0.rearRingMaterial.emissive.setHex(0x0284c7);
            loco0.rearRingMaterial.emissiveIntensity = pulse;
          }

          if (wagon1.frontRingMaterial) {
            wagon1.frontRingMaterial.color.setHex(0x00f3ff);
            wagon1.frontRingMaterial.emissive.setHex(0x0284c7);
            wagon1.frontRingMaterial.emissiveIntensity = pulse;
          }

          if (wagon1.couplerBeamMaterial) {
            wagon1.couplerBeamMaterial.color.setHex(0x00f3ff);
            wagon1.couplerBeamMaterial.emissive.setHex(0x10b981);
            wagon1.couplerBeamMaterial.emissiveIntensity = pulse;
          }

          if (wagon1.couplerGroup && wagon1.defaultCouplerPosition) {
            wagon1.couplerGroup.position.copy(wagon1.defaultCouplerPosition);
            wagon1.couplerGroup.rotation.z = 0;
          }

          if (wagon2 && wagon2.couplerGroup && wagon2.defaultCouplerPosition) {
            wagon2.couplerGroup.position.copy(wagon2.defaultCouplerPosition);
            wagon2.couplerGroup.rotation.z = 0;
          }

          if (this.couplerLight) {
            this.couplerLight.color.setHex(0x00f3ff);
            this.couplerLight.intensity = isRestoring ? 6.0 : (2.2 + Math.sin(time * 3) * 0.5);
          }
        } else {
          // 1. L'anneau arrière de la Locomotive devient JAUNE CORROMPU (nouveau hash calculé divergent)
          if (loco0.rearRingMaterial) {
            loco0.rearRingMaterial.color.setHex(0xfacc15);
            loco0.rearRingMaterial.emissive.setHex(0xeab308);
            loco0.rearRingMaterial.emissiveIntensity = 2.4;
          }

          // 2. L'anneau avant du Wagon 1 reste en CYAN (il exige toujours l'ancienne empreinte)
          if (wagon1.frontRingMaterial) {
            wagon1.frontRingMaterial.color.setHex(0x38bdf8);
            wagon1.frontRingMaterial.emissive.setHex(0x0284c7);
            wagon1.frontRingMaterial.emissiveIntensity = 1.6;
          }

          // 3. Discordance Jaune != Cyan : L'attelage magnétique se décroche physiquement
          if (wagon1.couplerGroup && wagon1.defaultCouplerPosition) {
            wagon1.couplerGroup.position.y = wagon1.defaultCouplerPosition.y - 0.22;
            wagon1.couplerGroup.rotation.z = 0.20;
          }

          if (wagon2 && wagon2.couplerGroup && wagon2.defaultCouplerPosition) {
            wagon2.couplerGroup.position.y = wagon2.defaultCouplerPosition.y - 0.16;
            wagon2.couplerGroup.rotation.z = 0.14;
          }

          // Faisceau résiduel clignotant rouge/sombre (rupture)
          if (wagon1.couplerBeamMaterial) {
            const flicker = Math.random() > 0.4 ? 1.6 : 0.2;
            wagon1.couplerBeamMaterial.color.setHex(0xef4444);
            wagon1.couplerBeamMaterial.emissive.setHex(0xdc2626);
            wagon1.couplerBeamMaterial.emissiveIntensity = flicker;
          }

          if (this.couplerLight) {
            this.couplerLight.color.setHex(0xef4444);
            this.couplerLight.intensity = 1.2 + Math.random() * 0.8;
          }
        }
      }

      this.rafId = requestAnimationFrame(loop);
    };

    this.rafId = requestAnimationFrame(loop);
  },

  /**
   * Arrête la boucle d'animation.
   */
  stopAnimationLoop() {
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  },

  /**
   * Falsifie le Bloc Genesis (#0) pour déclencher la discordance de couleur et la rupture en cascade.
   */
  corruptWagon0() {
    const { trainConvoy, cameraController } = this.ctx;
    if (!trainConvoy) return;

    this.isBroken = true;

    trainConvoy.corruptBlock(0, {
      type: 'GENESIS_CORROMPU',
      label: 'Tentative de falsification',
      transactions: 9999
    });

    if (cameraController) {
      cameraController.moveTo(
        new THREE.Vector3(2.8, 2.05, 6.2),
        new THREE.Vector3(3.0, 0.45, 0),
        1.0
      );
    }

    this.renderLeftPanel();
  },

  /**
   * Rétablit le convoi à son état d'origine et réenclenche l'attelage en cyan.
   */
  restoreConvoy() {
    const { trainConvoy, cameraController } = this.ctx;
    if (!trainConvoy) return;

    const wasBroken = this.isBroken || !trainConvoy.blockchain.isChainValid();

    trainConvoy.restoreEntireTrain();
    trainConvoy.sync();
    trainConvoy.getWagonMeshes().forEach((w) => {
      w.renderPlates();
      w.updateStatus(true);
    });

    this.isBroken = false;
    this.restoreWaveUntil = performance.now() + 2500;

    if (cameraController) {
      cameraController.moveTo(
        new THREE.Vector3(2.2, 1.85, 5.2),
        new THREE.Vector3(2.4, 0.45, 0),
        1.0
      );
    }

    this.renderLeftPanel();

    const statusEl = document.getElementById('step3-restore-status');
    if (statusEl) {
      statusEl.className = 'action-feedback-status visible ' + (wasBroken ? 'status-success' : 'status-info');
      statusEl.textContent = wasBroken
        ? "Intégrité rétablie : les anneaux concordent à nouveau en cyan et l'attelage est reverrouillé."
        : "Chaîne déjà intègre : les attelages sont conformes et verrouillés.";
    }
  },

  /**
   * Génère le volet pédagogique gauche pour l'étape 3.
   */
  renderLeftPanel() {
    const panel = document.getElementById('step-panel-left');
    if (!panel) return;

    panel.classList.add('active');

    const oldInner = panel.querySelector('.step-panel-inner');
    if (oldInner) oldInner.remove();

    const inner = document.createElement('div');
    inner.className = 'step-panel-inner';

    const { trainConvoy } = this.ctx;
    const wagon0 = trainConvoy?.getBlock(0);
    const wagon1 = trainConvoy?.getBlock(1);
    const wagon0Hash = wagon0 ? wagon0.hash : '0000a89f41b2c3d4';
    const wagon1Prev = wagon1 ? wagon1.previousHash : '0000a89f41b2c3d4';

    inner.innerHTML = `
      <header class="step-panel-header">
        <h2 class="step-panel-title">Immuabilité et Falsification</h2>
      </header>

      <div class="step-panel-scroll">
        <article class="step-card context-card animate-fade">
          <h3 class="card-title">Simulation d'une falsification</h3>
          <p>
            L'<strong>immuabilité</strong> désigne l'impossibilité pratique de modifier un bloc passé sans que la fraude ne soit immédiatement détectée par le reste du convoi.
          </p>
          <p>
            Si un attaquant modifie les données dans la locomotive (Bloc #0), son empreinte de sortie change aussitôt : son anneau arrière passe au <strong>jaune</strong>, tandis que le wagon 1 attend toujours du <strong>cyan</strong>.
          </p>
        </article>

        <article class="step-card ${this.isBroken ? 'danger-card' : 'action-card'} animate-fade">
          <h3 class="card-title">Rupture par discordance de signature</h3>
          <p class="card-instruction">
            ${this.isBroken
              ? "L'attelage s'est décroché : l'anneau jaune ne s'adapte plus au crochet cyan !"
              : "Cliquez pour falsifier les données de la locomotive (Bloc #0) et observer la réaction en chaîne :"}
          </p>

          ${!this.isBroken
            ? `
              <div class="action-feedback-box success">
                <div class="feedback-row">
                  <span class="feedback-label">Anneau (Locomotive #0) :</span>
                  <span class="feedback-val">Cyan (${wagon0Hash.substring(0, 10)}...)</span>
                </div>
                <div class="feedback-row">
                  <span class="feedback-label">Crochet (Wagon #1) :</span>
                  <span class="feedback-val">Cyan (${wagon1Prev.substring(0, 10)}...)</span>
                </div>
                <div class="feedback-row">
                  <span class="feedback-label">État du convoi :</span>
                  <span class="feedback-val success-val">Intègre &middot; Aucune altération</span>
                </div>
              </div>

              <button id="btn-corrupt-wagon0" class="btn-panel-danger">
                <span>Altérer le Bloc Genesis (Locomotive)</span>
              </button>
            `
            : `
              <div class="action-feedback-box error">
                <div class="feedback-row">
                  <span class="feedback-label">Anneau (Locomotive #0) :</span>
                  <span class="feedback-val" style="color: #facc15;">Jaune (Hash modifié)</span>
                </div>
                <div class="feedback-row">
                  <span class="feedback-label">Crochet (Wagon #1) :</span>
                  <span class="feedback-val" style="color: #38bdf8;">Cyan (Hash initial requis)</span>
                </div>
                <div class="feedback-row">
                  <span class="feedback-label">Conséquence :</span>
                  <span class="feedback-val error-val">Discordance &rarr; Décrochage</span>
                </div>
                <div class="feedback-row">
                  <span class="feedback-label">Effet avalanche :</span>
                  <span class="feedback-val error-val">Alerte rouge sur le convoi aval</span>
                </div>
              </div>

              <button id="btn-restore-step3" class="btn-panel-success">
                <span>Restaurer l'intégrité du convoi</span>
              </button>

              <div id="step3-restore-status" class="action-feedback-status"></div>
            `
          }
        </article>

        <article class="step-card keypoint-card animate-fade">
          <h4 class="card-title keypoint-title">Point clé</h4>
          <p class="keypoint-text">
            C'est l'effet avalanche : altérer un seul bloc brise immédiatement le lien cryptographique avec le bloc suivant, invalidant en cascade tous les blocs qui lui succèdent.
          </p>
        </article>

        <div class="substep-action-box animate-fade">
          <button id="btn-step3-action-next" class="btn-panel-primary">
            <span>Étape 4 : Réseau et décentralisation</span>
            <span class="btn-arrow">&rarr;</span>
          </button>
        </div>
      </div>
    `;

    panel.prepend(inner);
    this.setupEvents();
  },

  /**
   * Attache les écouteurs d'interaction sur le volet gauche.
   */
  setupEvents() {
    document.getElementById('btn-corrupt-wagon0')?.addEventListener('click', () => {
      this.corruptWagon0();
    });

    document.getElementById('btn-restore-step3')?.addEventListener('click', () => {
      this.restoreConvoy();
    });

    document.getElementById('btn-step3-action-next')?.addEventListener('click', () => {
      if (this.isBroken) {
        this.restoreConvoy();
      }
      if (typeof this.ctx.onNextStep === 'function') {
        this.ctx.onNextStep();
      }
    });
  }
};
