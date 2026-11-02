import * as THREE from 'three';

/**
 * Étape 2 : Chaînage Cryptographique.
 * L'attelage magnétique reliant chaque wagon au précédent :
 * - Sous-partie 2.1 : L'attelage magnétique et le transfert de l'empreinte (PreviousHash)
 * - Sous-partie 2.2 : L'effet avalanche en direct (tentative d'altération et rupture visuelle de l'attelage)
 * - Sous-partie 2.3 : Le principe d'intégrité et restauration du convoi
 */
export const step2 = {
  id: 2,
  title: "Chaînage Cryptographique",
  subtitle: "L'attelage invisible qui lie les blocs pour l'éternité",
  ctx: null,

  subStep: 0, // 0: Attelage, 1: Effet avalanche, 2: Intégrité
  rafId: null,

  // Éléments d'animation 3D
  isBroken: false,
  couplerLight: null,
  pulseBoostEndTime: 0,

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
    this.pulseBoostEndTime = 0;

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

    // 2. Lumière ponctuelle verte/cyan dédiée à l'attelage magnétique entre wagon 0 et wagon 1
    if (scene && !this.couplerLight) {
      this.couplerLight = new THREE.PointLight(0x10b981, 2.5, 4.0);
      this.couplerLight.position.set(1.9, 0.45, 0.3);
      scene.add(this.couplerLight);
    }

    // 3. Ferme le tiroir d'inspection droit s'il était ouvert
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
   * Boucle d'animation légère dédiée à l'attelage magnétique.
   */
  startAnimationLoop() {
    this.stopAnimationLoop();

    const loop = () => {
      const { trainConvoy } = this.ctx;
      const wagon1 = trainConvoy?.getWagon(1);
      const wagon0 = trainConvoy?.getWagon(0);
      const time = performance.now() * 0.003;
      const isBoosted = performance.now() < (this.pulseBoostEndTime || 0);

      if (wagon1 && wagon1.couplerBeamMaterial) {
        if (!this.isBroken) {
          // Attelage intact : faisceau vert/cyan régulier ou suralimenté lors de la restauration
          const pulse = isBoosted ? (3.4 + Math.sin(time * 12) * 1.0) : (1.4 + Math.sin(time * 5) * 0.45);

          wagon1.couplerBeamMaterial.color.setHex(0x10b981);
          wagon1.couplerBeamMaterial.emissive.setHex(0x059669);
          wagon1.couplerBeamMaterial.emissiveIntensity = pulse;

          if (wagon1.frontRingMaterial) {
            wagon1.frontRingMaterial.color.setHex(0x10b981);
            wagon1.frontRingMaterial.emissive.setHex(0x059669);
            wagon1.frontRingMaterial.emissiveIntensity = isBoosted ? 3.2 : (1.3 + Math.cos(time * 5) * 0.35);
          }
          if (wagon0 && wagon0.rearRingMaterial) {
            wagon0.rearRingMaterial.color.setHex(0x10b981);
            wagon0.rearRingMaterial.emissive.setHex(0x059669);
            wagon0.rearRingMaterial.emissiveIntensity = isBoosted ? 3.2 : (1.3 + Math.sin(time * 5 + 1) * 0.35);
          }

          if (this.couplerLight) {
            this.couplerLight.color.setHex(0x10b981);
            this.couplerLight.intensity = isBoosted ? 6.5 : (2.2 + Math.sin(time * 4) * 0.6);
          }
        } else {
          // Attelage rompu : clignotement d'alerte rouge erratique
          const flicker = Math.random() > 0.3 ? 1.8 : 0.4;
          wagon1.couplerBeamMaterial.color.setHex(0xef4444);
          wagon1.couplerBeamMaterial.emissive.setHex(0xdc2626);
          wagon1.couplerBeamMaterial.emissiveIntensity = flicker;

          if (this.couplerLight) {
            this.couplerLight.color.setHex(0xef4444);
            this.couplerLight.intensity = flicker * 1.6;
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
   * Bascule vers l'une des 3 sous-parties de l'étape 2.
   * @param {number} subIndex - 0, 1 ou 2
   */
  goToSubStep(subIndex) {
    this.subStep = Math.max(0, Math.min(subIndex, 2));
    const { cameraController } = this.ctx;

    if (this.subStep === 0) {
      // 2.1 — Vue cinématique rapprochée sur l'attelage reliant le wagon 0 au wagon 1
      if (cameraController) {
        cameraController.moveTo(
          new THREE.Vector3(1.85, 1.45, 3.1),
          new THREE.Vector3(1.9, 0.45, 0),
          1.1
        );
      }
    } else if (this.subStep === 1) {
      // 2.2 — Vue légèrement élargie pour observer l'effet avalanche et la bascule au rouge
      if (cameraController) {
        cameraController.moveTo(
          new THREE.Vector3(1.9, 1.85, 4.3),
          new THREE.Vector3(1.9, 0.45, 0),
          1.1
        );
      }
    } else if (this.subStep === 2) {
      // 2.3 — Vue de synthèse sur le lien d'intégrité
      if (cameraController) {
        cameraController.moveTo(
          new THREE.Vector3(1.85, 1.55, 3.4),
          new THREE.Vector3(1.9, 0.45, 0),
          1.1
        );
      }
    }

    this.renderLeftPanel();
  },

  /**
   * Falsifie le wagon 0 pour déclencher visuellement l'effet avalanche.
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
   * Rétablit l'intégralité du convoi à ses données d'origine et reverrouille l'attelage.
   * @param {string} statusElementId - Identifiant du bloc de notification dans l'UI.
   */
  restoreConvoy(statusElementId = 'step2-restore-status') {
    const { trainConvoy } = this.ctx;
    if (!trainConvoy) return;

    const wasBroken = this.isBroken || !trainConvoy.blockchain.isChainValid();

    // 1. Réinitialisation complète des blocs et recalcul des hashs
    trainConvoy.restoreEntireTrain();

    // 2. Synchronisation complète de la 3D
    trainConvoy.sync();
    trainConvoy.getWagonMeshes().forEach((w) => {
      w.renderPlates();
      w.updateStatus(true);
    });

    this.isBroken = false;
    this.pulseBoostEndTime = performance.now() + 2500;

    const wagon1 = trainConvoy.getWagon(1);
    const wagon0 = trainConvoy.getWagon(0);

    if (wagon1?.couplerBeamMaterial) {
      wagon1.couplerBeamMaterial.color.setHex(0x10b981);
      wagon1.couplerBeamMaterial.emissive.setHex(0x059669);
      wagon1.couplerBeamMaterial.emissiveIntensity = wasBroken ? 4.5 : 3.0;
    }
    if (wagon1?.frontRingMaterial) {
      wagon1.frontRingMaterial.color.setHex(0x10b981);
      wagon1.frontRingMaterial.emissive.setHex(0x059669);
      wagon1.frontRingMaterial.emissiveIntensity = wasBroken ? 4.0 : 2.5;
    }
    if (wagon0?.rearRingMaterial) {
      wagon0.rearRingMaterial.color.setHex(0x10b981);
      wagon0.rearRingMaterial.emissive.setHex(0x059669);
      wagon0.rearRingMaterial.emissiveIntensity = wasBroken ? 4.0 : 2.5;
    }

    if (this.couplerLight) {
      this.couplerLight.color.setHex(0x10b981);
      this.couplerLight.intensity = wasBroken ? 8.0 : 5.0;
    }

    this.renderLeftPanel();

    const statusEl = document.getElementById(statusElementId);
    if (statusEl) {
      statusEl.className = 'action-feedback-status visible ' + (wasBroken ? 'status-success' : 'status-info');
      statusEl.textContent = wasBroken
        ? "Intégrité rétablie : les empreintes concordent et l'attelage magnétique est reverrouillé."
        : "Chaîne déjà intègre : tous les attelages sont verrouillés et conformes.";
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
          <h3 class="card-title">Attelage magnétique</h3>
          <p>
            Entre le <strong>Wagon #0 (Genesis)</strong> à gauche et le <strong>Wagon #1</strong> à droite,
            l'attelage n'est pas une simple chaîne mécanique en acier.
          </p>
          <p>
            C'est un <strong>arc d'énergie magnétique</strong> : le faisceau lumineux transmet l'empreinte mathématique
            <span class="glossary-term" data-tooltip="Le hash du bloc précédent (PreviousHash) scellé dans l'en-tête du bloc suivant.">
              PreviousHash
            </span>
            calculée sur le wagon précédent pour verrouiller le wagon suivant.
          </p>
        </article>

        <article class="step-card action-card animate-fade">
          <h3 class="card-title">Observer le transfert d'empreinte</h3>
          <p class="card-instruction">
            Regardez la concordance des couleurs des anneaux au point d'attache :
          </p>

          <div class="action-feedback-box success">
            <div class="feedback-row">
              <span class="feedback-label">Anneau arrière (Wagon #0) :</span>
              <span class="feedback-val success-val">${wagon0Hash.substring(0, 16)}...</span>
            </div>
            <div class="feedback-row">
              <span class="feedback-label">Crochet avant (Wagon #1) :</span>
              <span class="feedback-val success-val">${wagon1Prev.substring(0, 16)}...</span>
            </div>
            <div class="feedback-row">
              <span class="feedback-label">État du verrou :</span>
              <span class="feedback-val success-val">Scellé &middot; Concordance 100%</span>
            </div>
          </div>

          <button id="btn-step2-pulse-beam" class="btn-panel-primary">
            <span>Faire pulser le flux énergétique</span>
            <span class="btn-arrow">&rarr;</span>
          </button>
        </article>

        <article class="step-card keypoint-card animate-fade">
          <h4 class="card-title keypoint-title">Point clé</h4>
          <p class="keypoint-text">
            Chaque nouveau wagon emporte avec lui le sceau complet du wagon qui le précède.
            C'est cette liaison rigide qui forme la chaîne de la blockchain.
          </p>
        </article>
      `;
    } else if (this.subStep === 1) {
      // ----------------------------------------------------------------------
      // SOUS-PARTIE 2.2 : L'EFFET AVALANCHE EN DIRECT
      // ----------------------------------------------------------------------
      subStepContentHTML = `
        <article class="step-card context-card animate-fade">
          <h3 class="card-title">Simulation d'une falsification</h3>
          <p>
            Imaginons qu'un faussaire s'introduise dans le <strong>Wagon #0</strong> pour s'attribuer clandestinement
            des milliers de jetons.
          </p>
          <p>
            Cliquez sur le bouton ci-dessous pour simuler cette falsification et observer la rupture immédiate
            sur l'attelage dans la scène 3D :
          </p>
        </article>

        <article class="step-card ${this.isBroken ? 'danger-card' : 'action-card'} animate-fade">
          <h3 class="card-title">Provoquer la rupture de chaîne</h3>
          <p class="card-instruction">
            ${this.isBroken
              ? 'L\'attelage s\'est décroché et le faisceau clignote en rouge critique.'
              : 'Cliquez sur le bouton pour altérer les transactions du wagon 0 :'}
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
                  <span class="feedback-label">Nouveau Hash du Wagon 0 :</span>
                  <span class="feedback-val error-val">e4b9f12a... (MODIFIÉ)</span>
                </div>
                <div class="feedback-row">
                  <span class="feedback-label">Attelage attendu par Wagon 1 :</span>
                  <span class="feedback-val">${wagon1Prev.substring(0, 16)}...</span>
                </div>
                <div class="feedback-row">
                  <span class="feedback-label">Statut du convoi :</span>
                  <span class="feedback-val error-val">RUPTURE D'ATTELAGE (EFFET AVALANCHE)</span>
                </div>
              </div>

              <button id="btn-restore-step2-fast" class="btn-panel-success">
                <span>Rétablir les données d'origine</span>
              </button>

              <div id="step2-restore-status-fast" class="action-feedback-status"></div>
            `
          }
        </article>

        <article class="step-card keypoint-card animate-fade">
          <h4 class="card-title keypoint-title">Point clé</h4>
          <p class="keypoint-text">
            C'est l'<strong>effet avalanche</strong> : altérer un seul wagon brise immédiatement la liaison
            avec le wagon suivant et tous les wagons qui lui succèdent.
          </p>
        </article>
      `;
    } else if (this.subStep === 2) {
      // ----------------------------------------------------------------------
      // SOUS-PARTIE 2.3 : LE PRINCIPE D'INTÉGRITÉ
      // ----------------------------------------------------------------------
      subStepContentHTML = `
        <article class="step-card context-card animate-fade">
          <h3 class="card-title">Règle du consensus et rejet</h3>
          <p>
            Le wagon 1 applique une règle mathématique sans pitié : son crochet avant exige
            rigoureusement l'empreinte originale du wagon 0.
          </p>
          <p>
            Pour qu'un pirate réussisse à faire accepter son wagon falsifié, il devrait <strong>recalculer
            le wagon 1, puis le wagon 2, et tous les wagons suivants</strong> plus vite que l'ensemble
            des ordinateurs du réseau réunis.
          </p>
        </article>

        <article class="step-card action-card animate-fade">
          <h3 class="card-title">Vérification et restauration de l'intégrité</h3>
          <p class="card-instruction">
            Rétablissez les données conformes du wagon 0 pour voir l'arc magnétique se réaligner et se reverrouiller en vert :
          </p>

          <button id="btn-restore-wagon0" class="btn-panel-success">
            <span>Restaurer l'intégrité du convoi</span>
          </button>

          <div id="step2-restore-status" class="action-feedback-status"></div>

          <div class="action-feedback-box ${this.isBroken ? 'error' : 'success'}">
            <div class="feedback-row">
              <span class="feedback-label">État du verrou magnétique :</span>
              <span class="feedback-val ${this.isBroken ? 'error-val' : 'success-val'}">
                ${this.isBroken ? 'Désolidarisé (Hash discordant)' : 'Verrouillé (Chaîne intègre)'}
              </span>
            </div>
          </div>
        </article>

        <article class="step-card keypoint-card animate-fade">
          <h4 class="card-title keypoint-title">Point clé</h4>
          <p class="keypoint-text">
            Grâce au chaînage cryptographique, plus un wagon est ancien dans le convoi, plus il est impossible
            à falsifier : il est protégé par l'ensemble des wagons qui ont été accrochés derrière lui.
          </p>
        </article>
      `;
    }

    inner.innerHTML = `
      <header class="step-panel-header">
        <div class="step-panel-header-top">
          <span class="substep-progress-indicator">Partie 2.${this.subStep + 1} sur 2.3</span>
        </div>
        <h2 class="step-panel-title">Chaînage Cryptographique</h2>
        <p class="step-panel-subtitle">L'attelage invisible qui lie les blocs pour l'éternité</p>

        <!-- Stepper horizontal cliquable -->
        <div class="substep-stepper" role="tablist" aria-label="Sous-parties de l'étape 2">
          <button class="substep-pill ${this.subStep === 0 ? 'active' : 'completed'}" data-substep="0">
            <span class="substep-num">2.1</span>
            <span class="substep-label">Attelage</span>
          </button>
          <button class="substep-pill ${this.subStep === 1 ? 'active' : (this.subStep > 1 ? 'completed' : '')}" data-substep="1">
            <span class="substep-num">2.2</span>
            <span class="substep-label">Effet Avalanche</span>
          </button>
          <button class="substep-pill ${this.subStep === 2 ? 'active' : ''}" data-substep="2">
            <span class="substep-num">2.3</span>
            <span class="substep-label">Intégrité</span>
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
            <span>${this.subStep === 2 ? 'Étape 3 : Immuabilité' : 'Partie suivante'}</span>
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
      if (this.subStep < 2) {
        this.goToSubStep(this.subStep + 1);
      } else if (typeof this.ctx.onNextStep === 'function') {
        this.ctx.onNextStep();
      }
    });

    // 3. Interactions Sous-partie 2.1 (Pulsation d'énergie)
    if (this.subStep === 0) {
      document.getElementById('btn-step2-pulse-beam')?.addEventListener('click', () => {
        this.pulseBoostEndTime = performance.now() + 2000;
        if (this.couplerLight) {
          this.couplerLight.intensity = 5.5;
        }
        const { trainConvoy } = this.ctx;
        const wagon1 = trainConvoy?.getWagon(1);
        if (wagon1?.couplerBeamMaterial) {
          wagon1.couplerBeamMaterial.emissiveIntensity = 3.2;
        }
      });
    }

    // 4. Interactions Sous-partie 2.2 (Altération et effet avalanche)
    if (this.subStep === 1) {
      document.getElementById('btn-corrupt-wagon0')?.addEventListener('click', () => {
        this.corruptWagon0();
      });

      document.getElementById('btn-restore-step2-fast')?.addEventListener('click', () => {
        this.restoreConvoy('step2-restore-status-fast');
      });
    }

    // 5. Interactions Sous-partie 2.3 (Restauration d'intégrité)
    if (this.subStep === 2) {
      document.getElementById('btn-restore-wagon0')?.addEventListener('click', () => {
        this.restoreConvoy('step2-restore-status');
      });
    }
  }
};
