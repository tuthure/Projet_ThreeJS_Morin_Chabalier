import * as THREE from 'three';

/**
 * Étape 2 : Chaînage Cryptographique.
 * L'attelage magnétique reliant chaque wagon au précédent :
 * - Sous-partie 2.1 : L'attelage magnétique et le transfert de l'empreinte (PreviousHash)
 * - Sous-partie 2.2 : Falsification, discordance de couleur et rupture en cascade
 */
export const step2 = {
  id: 2,
  title: "Chaînage Cryptographique",
  subtitle: "L'attelage invisible qui lie les blocs pour l'éternité",
  ctx: null,

  subStep: 0, // 0: Attelage magnétique, 1: Falsification et rupture
  rafId: null,

  // États d'animation 3D
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
   * Active l'étape 2 :
   * - Met en place le wagon Genesis (#0) et le wagon #1
   * - Arrête le décor pour observer le faisceau d'attelage
   * - Installe la lumière ponctuelle d'attelage
   */
  enter() {
    const { trainConvoy, cameraController, environment, scene } = this.ctx;

    this.subStep = 0;
    this.isBroken = false;
    this.restoreWaveUntil = 0;

    if (cameraController) {
      cameraController.setViewOffset(210);
    }

    if (environment) {
      environment.setSpeed(0);
    }

    // 1. Initialise le convoi avec Wagon 0 (Genesis) et Wagon 1
    if (trainConvoy) {
      trainConvoy.resetConvoy([
        { emetteur: 'Alice', destinataire: 'Bob', montant: 10, unite: 'BTC' }
      ]);
      if (cameraController) {
        cameraController.setInteractiveObjects(trainConvoy.getInteractiveObjects());
      }
    }

    // 2. Lumière ponctuelle verte/cyan dédiée à l'attelage magnétique
    if (scene && !this.couplerLight) {
      this.couplerLight = new THREE.PointLight(0x00f3ff, 2.5, 4.0);
      this.couplerLight.position.set(1.9, 0.45, 0.3);
      scene.add(this.couplerLight);
    }

    // 3. Ferme le tiroir d'inspection s'il était ouvert
    const inspectionSidebar = document.getElementById('inspection-sidebar');
    if (inspectionSidebar) {
      inspectionSidebar.classList.remove('open');
      inspectionSidebar.setAttribute('aria-hidden', 'true');
    }

    // 4. Démarre la boucle d'animation dédiée de l'attelage
    this.startAnimationLoop();

    // 5. Lance la sous-partie 2.1
    this.goToSubStep(0);
  },

  /**
   * Quitte l'étape 2 et nettoie les effets 3D et écouteurs.
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
      const wagon0 = trainConvoy?.getWagon(0);
      const time = performance.now() * 0.003;
      const isRestoring = performance.now() < this.restoreWaveUntil;

      if (wagon1 && wagon0) {
        if (!this.isBroken) {
          // --- ÉTAT VALIDE & INTACT ---
          const pulse = isRestoring ? (3.2 + Math.sin(time * 10) * 0.8) : (1.5 + Math.sin(time * 4) * 0.35);

          // Anneau arrière du Wagon 0 : Cyan (Hash d'origine)
          if (wagon0.rearRingMaterial) {
            wagon0.rearRingMaterial.color.setHex(0x00f3ff);
            wagon0.rearRingMaterial.emissive.setHex(0x0284c7);
            wagon0.rearRingMaterial.emissiveIntensity = pulse;
          }

          // Anneau avant du Wagon 1 : Cyan (PreviousHash concordant)
          if (wagon1.frontRingMaterial) {
            wagon1.frontRingMaterial.color.setHex(0x00f3ff);
            wagon1.frontRingMaterial.emissive.setHex(0x0284c7);
            wagon1.frontRingMaterial.emissiveIntensity = pulse;
          }

          // Faisceau magnétique d'attelage : Cyan/Vert stable
          if (wagon1.couplerBeamMaterial) {
            wagon1.couplerBeamMaterial.color.setHex(0x00f3ff);
            wagon1.couplerBeamMaterial.emissive.setHex(0x10b981);
            wagon1.couplerBeamMaterial.emissiveIntensity = pulse;
          }

          // Position d'attelage alignée
          if (wagon1.couplerGroup) {
            wagon1.couplerGroup.position.copy(wagon1.defaultCouplerPosition);
            wagon1.couplerGroup.rotation.z = 0;
          }

          if (this.couplerLight) {
            this.couplerLight.color.setHex(0x00f3ff);
            this.couplerLight.intensity = isRestoring ? 6.0 : (2.2 + Math.sin(time * 3) * 0.5);
          }
        } else {
          // --- ÉTAT ALTÉRÉ / RUPTURE (CAUSE VISUELLE EXPLICITE) ---

          // 1. L'anneau arrière du Wagon 0 devient JAUNE CORROMPU (nouveau hash calculé divergent)
          if (wagon0.rearRingMaterial) {
            wagon0.rearRingMaterial.color.setHex(0xfacc15);
            wagon0.rearRingMaterial.emissive.setHex(0xeab308);
            wagon0.rearRingMaterial.emissiveIntensity = 2.4;
          }

          // 2. L'anneau avant du Wagon 1 reste en CYAN (il exige toujours l'ancienne empreinte)
          if (wagon1.frontRingMaterial) {
            wagon1.frontRingMaterial.color.setHex(0x38bdf8);
            wagon1.frontRingMaterial.emissive.setHex(0x0284c7);
            wagon1.frontRingMaterial.emissiveIntensity = 1.6;
          }

          // 3. Discordance Jaune != Cyan : L'attelage magnétique ne peut s'enclencher, il se décroche
          if (wagon1.couplerGroup) {
            wagon1.couplerGroup.position.y = wagon1.defaultCouplerPosition.y - 0.22;
            wagon1.couplerGroup.rotation.z = 0.20;
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
   * Bascule vers l'une des 2 sous-parties de l'étape 2.
   * @param {number} subIndex - 0: Attelage régulier, 1: Rupture et réparation
   */
  goToSubStep(subIndex) {
    this.subStep = Math.max(0, Math.min(subIndex, 1));
    const { cameraController } = this.ctx;

    if (this.subStep === 0) {
      // 2.1 — Gros plan sur l'attelage magnétique reliant wagon 0 et wagon 1
      if (cameraController) {
        cameraController.moveTo(
          new THREE.Vector3(1.85, 1.45, 3.1),
          new THREE.Vector3(1.9, 0.45, 0),
          1.1
        );
      }
    } else if (this.subStep === 1) {
      // 2.2 — Vue légèrement élargie pour observer la rupture et la bascule au rouge
      if (cameraController) {
        cameraController.moveTo(
          new THREE.Vector3(1.9, 1.75, 4.2),
          new THREE.Vector3(1.9, 0.45, 0),
          1.1
        );
      }
    }

    this.renderLeftPanel();
  },

  /**
   * Falsifie le wagon 0 pour déclencher la discordance de couleur et la rupture.
   */
  corruptWagon0() {
    const { trainConvoy } = this.ctx;
    if (!trainConvoy) return;

    this.isBroken = true;

    // Altère les données du premier wagon
    trainConvoy.corruptBlock(0, {
      type: 'PIRATAGE',
      label: 'Modification frauduleuse de 50 000 jetons',
      transactions: 50000
    });

    this.renderLeftPanel();
  },

  /**
   * Rétablit le convoi à son état d'origine et réenclenche l'attelage en cyan.
   */
  restoreConvoy() {
    const { trainConvoy } = this.ctx;
    if (!trainConvoy) return;

    const wasBroken = this.isBroken || !trainConvoy.blockchain.isChainValid();

    // 1. Réinitialisation complète des blocs et recalcul des hashs
    trainConvoy.restoreEntireTrain();

    // 2. Synchronisation de la scène 3D
    trainConvoy.sync();
    trainConvoy.getWagonMeshes().forEach((w) => {
      w.renderPlates();
      w.updateStatus(true);
    });

    this.isBroken = false;
    this.restoreWaveUntil = performance.now() + 2500;

    this.renderLeftPanel();

    const statusEl = document.getElementById('step2-restore-status');
    if (statusEl) {
      statusEl.className = 'action-feedback-status visible ' + (wasBroken ? 'status-success' : 'status-info');
      statusEl.textContent = wasBroken
        ? "Intégrité rétablie : les anneaux concordent à nouveau en cyan et l'attelage est reverrouillé."
        : "Chaîne déjà intègre : les attelages sont conformes et verrouillés.";
    }
  },

  /**
   * Génère le volet pédagogique gauche pour l'étape 2.
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

    let subStepContentHTML = '';

    if (this.subStep === 0) {
      // ----------------------------------------------------------------------
      // SOUS-PARTIE 2.1 : L'ATTELAGE MAGNÉTIQUE
      // ----------------------------------------------------------------------
      subStepContentHTML = `
        <article class="step-card context-card animate-fade">
          <h3 class="card-title">L'attelage magnétique</h3>
          <p>
            Entre le Wagon 0 (Genesis) à gauche et le Wagon 1 à droite, la liaison s'effectue par un faisceau d'énergie magnétique.
          </p>
          <p>
            Le verrouillage ne peut se faire que si l'anneau émetteur du wagon précédent transmet exactement la signature
            attendue par le crochet récepteur du wagon suivant.
          </p>
        </article>

        <article class="step-card action-card animate-fade">
          <h3 class="card-title">Observer la concordance des anneaux</h3>
          <p class="card-instruction">
            Regardez la concordance des couleurs des anneaux au point d'attache :
          </p>

          <div class="action-feedback-box success">
            <div class="feedback-row">
              <span class="feedback-label">Anneau arrière (Wagon 0) :</span>
              <span class="feedback-val" style="color: #38bdf8;">Cyan (${wagon0Hash.substring(0, 14)}...)</span>
            </div>
            <div class="feedback-row">
              <span class="feedback-label">Crochet avant (Wagon 1) :</span>
              <span class="feedback-val" style="color: #38bdf8;">Cyan (${wagon1Prev.substring(0, 14)}...)</span>
            </div>
            <div class="feedback-row">
              <span class="feedback-label">État du verrou :</span>
              <span class="feedback-val success-val">Concordance 100% &middot; Attelage scellé</span>
            </div>
          </div>
        </article>

        <article class="step-card keypoint-card animate-fade">
          <h4 class="card-title keypoint-title">Point clé</h4>
          <p class="keypoint-text">
            Chaque nouveau wagon emporte avec lui le sceau complet du wagon qui le précède.
            C'est cette dépendance stricte qui forme la chaîne de la blockchain.
          </p>
        </article>
      `;
    } else if (this.subStep === 1) {
      // ----------------------------------------------------------------------
      // SOUS-PARTIE 2.2 : FALSIFICATION ET RUPTURE EN CASCADE
      // ----------------------------------------------------------------------
      subStepContentHTML = `
        <article class="step-card context-card animate-fade">
          <h3 class="card-title">Simulation d'une falsification</h3>
          <p>
            Si un attaquant modifie une transaction dans le Wagon 0, son empreinte de sortie change aussitôt.
          </p>
          <p>
            Observez la scène 3D : son anneau arrière passe au <strong>jaune</strong>, alors que le wagon suivant attend toujours du <strong>cyan</strong>.
            Cette discordance entraîne le décrochage mécanique de l'attelage et l'alerte rouge de toute la suite du train.
          </p>
        </article>

        <article class="step-card ${this.isBroken ? 'danger-card' : 'action-card'} animate-fade">
          <h3 class="card-title">Rupture par discordance de signature</h3>
          <p class="card-instruction">
            ${this.isBroken
              ? 'L\'attelage s\'est décroché : l\'anneau jaune ne s\'adapte pas au crochet cyan !'
              : 'Cliquez pour falsifier les données du Wagon 0 et observer la rupture :'}
          </p>

          ${!this.isBroken
            ? `
              <button id="btn-corrupt-wagon0" class="btn-panel-danger">
                <span>Altérer une transaction dans le wagon 0</span>
              </button>
            `
            : `
              <div class="action-feedback-box error">
                <div class="feedback-row">
                  <span class="feedback-label">Anneau de sortie (Wagon 0) :</span>
                  <span class="feedback-val" style="color: #facc15; font-weight: 700;">Jaune (Hash modifié)</span>
                </div>
                <div class="feedback-row">
                  <span class="feedback-label">Crochet attendu (Wagon 1) :</span>
                  <span class="feedback-val" style="color: #38bdf8; font-weight: 700;">Cyan (Hash original requis)</span>
                </div>
                <div class="feedback-row">
                  <span class="feedback-label">Conséquence :</span>
                  <span class="feedback-val error-val">Discordance de couleur &rarr; Décrochage</span>
                </div>
                <div class="feedback-row">
                  <span class="feedback-label">Effet avalanche :</span>
                  <span class="feedback-val error-val">Alerte rouge sur le convoi aval</span>
                </div>
              </div>

              <button id="btn-restore-step2" class="btn-panel-success">
                <span>Restaurer l'intégrité du convoi</span>
              </button>

              <div id="step2-restore-status" class="action-feedback-status"></div>
            `
          }
        </article>

        <article class="step-card keypoint-card animate-fade">
          <h4 class="card-title keypoint-title">Point clé</h4>
          <p class="keypoint-text">
            C'est l'effet avalanche : altérer un seul bloc brise immédiatement le lien cryptographique
            avec le bloc suivant, invalidant instantanément tous les blocs qui lui succèdent.
          </p>
        </article>
      `;
    }

    inner.innerHTML = `
      <header class="step-panel-header">
        <div class="step-panel-header-top">
          <span class="substep-progress-indicator">Partie 2.${this.subStep + 1} sur 1.2</span>
        </div>
        <h2 class="step-panel-title">Chaînage Cryptographique</h2>
        <p class="step-panel-subtitle">L'attelage invisible qui lie les blocs pour l'éternité</p>

        <!-- Stepper horizontal cliquable à 2 sous-parties -->
        <div class="substep-stepper" role="tablist" aria-label="Sous-parties de l'étape 2">
          <button class="substep-pill ${this.subStep === 0 ? 'active' : 'completed'}" data-substep="0">
            <span class="substep-num">2.1</span>
            <span class="substep-label">Attelage</span>
          </button>
          <button class="substep-pill ${this.subStep === 1 ? 'active' : ''}" data-substep="1">
            <span class="substep-num">2.2</span>
            <span class="substep-label">Rupture & Avalanche</span>
          </button>
        </div>
      </header>

      <div class="step-panel-scroll">
        ${subStepContentHTML}

        <!-- Barre de navigation inférieure -->
        <div class="step-nav-bar panel-footer-nav">
          <button id="btn-step2-prev-sub" class="btn-panel-ghost">
            <span>&larr; ${this.subStep === 0 ? 'Étape 1' : 'Précédent'}</span>
          </button>

          <button id="btn-step2-next-sub" class="btn-panel-primary">
            <span>${this.subStep === 1 ? 'Étape 3 : Immuabilité' : 'Partie suivante'}</span>
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
    // 1. Clics sur les pilules du stepper horizontal
    const pills = document.querySelectorAll('.substep-stepper .substep-pill');
    pills.forEach((pill) => {
      pill.addEventListener('click', () => {
        const targetSub = parseInt(pill.dataset.substep);
        if (!isNaN(targetSub)) {
          this.goToSubStep(targetSub);
        }
      });
    });

    // 2. Navigation bas de volet (Précédent / Suivant)
    document.getElementById('btn-step2-prev-sub')?.addEventListener('click', () => {
      if (this.subStep > 0) {
        this.goToSubStep(this.subStep - 1);
      } else if (typeof this.ctx.onPrevStep === 'function') {
        this.ctx.onPrevStep();
      }
    });

    document.getElementById('btn-step2-next-sub')?.addEventListener('click', () => {
      if (this.subStep < 1) {
        this.goToSubStep(this.subStep + 1);
      } else if (typeof this.ctx.onNextStep === 'function') {
        this.ctx.onNextStep();
      }
    });

    // 3. Interactions Sous-partie 2.2 (Altération et restauration)
    if (this.subStep === 1) {
      document.getElementById('btn-corrupt-wagon0')?.addEventListener('click', () => {
        this.corruptWagon0();
      });

      document.getElementById('btn-restore-step2')?.addEventListener('click', () => {
        this.restoreConvoy();
      });
    }
  }
};
