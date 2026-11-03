import * as THREE from 'three';
import { hashToColorHex } from '../three/WagonMesh.js';

/**
 * Étape 1 : Structure d'un Bloc.
 * Anatomie d'un wagon aux parois de verre :
 * - Sous-partie 1.1 : Transactions et empreinte numérique (Hash)
 * - Sous-partie 1.2 : La molette mécanique du Nonce
 */
export const step1 = {
  id: 1,
  title: "Structure d'un Bloc",
  subtitle: "Anatomie d'un wagon : chargement, empreinte et molette de Nonce",
  ctx: null,

  subStep: 0, // 0: Transactions & Hash, 1: Nonce
  rafId: null,

  // Animation de réaction 3D
  cargoPulseProgress: 1.0,

  /**
   * Initialise le module avec le contexte global de l'application.
   * @param {object} context
   */
  init(context) {
    this.ctx = context;
  },

  /**
   * Active l'étape 1 :
   * - Met en place le train à quai avec le wagon #0 (Genesis) et le wagon #1
   * - Arrête le décor pour observer le wagon en détail
   * - Lance la première sous-partie
   */
  enter() {
    const { trainConvoy, cameraController, environment } = this.ctx;

    this.subStep = 0;
    this.cargoPulseProgress = 1.0;

    if (cameraController) {
      cameraController.setViewOffset(210);
    }

    if (environment) {
      environment.setSpeed(0);
    }

    // 1. Initialise le convoi avec Wagon 0 (Genesis) et Wagon 1 (Bloc standard)
    if (trainConvoy) {
      trainConvoy.resetConvoy([
        '50 caisses de matériel'
      ]);
      if (cameraController) {
        cameraController.setInteractiveObjects(trainConvoy.getInteractiveObjects());
      }
    }

    // 2. Ferme le tiroir d'inspection droit s'il était ouvert
    const inspectionSidebar = document.getElementById('inspection-sidebar');
    if (inspectionSidebar) {
      inspectionSidebar.classList.remove('open');
      inspectionSidebar.setAttribute('aria-hidden', 'true');
    }

    // 3. Démarre la boucle d'animation dédiée
    this.startAnimationLoop();

    // 4. Cadrage sur la première sous-partie
    this.goToSubStep(0);
  },

  /**
   * Quitte l'étape 1 et nettoie la scène et l'interface.
   */
  exit() {
    this.stopAnimationLoop();

    const panel = document.getElementById('step-panel-left');
    if (panel) {
      const inner = panel.querySelector('.step-panel-inner');
      if (inner) inner.remove();
    }
  },

  /**
   * Boucle d'animation légère pour le rebond 3D du chargement.
   */
  startAnimationLoop() {
    this.stopAnimationLoop();

    const loop = () => {
      const { trainConvoy } = this.ctx;
      const wagon1 = trainConvoy?.getWagon(1);

      // Rebond physique du fret lors d'un chargement
      if (wagon1 && wagon1.cargoGroup && this.cargoPulseProgress < 1.0) {
        this.cargoPulseProgress += 0.045;
        const p = Math.min(this.cargoPulseProgress, 1.0);
        const scale = 1.0 + Math.sin((1 - p) * Math.PI) * 0.18;
        wagon1.cargoGroup.scale.set(scale, scale, scale);

        const flashIntensity = Math.sin((1 - p) * Math.PI) * 0.8;
        wagon1.containerMaterials.forEach((mat) => {
          mat.emissive.setHex(0x38bdf8);
          mat.emissiveIntensity = flashIntensity;
        });

        if (p >= 1.0) {
          wagon1.cargoGroup.scale.set(1.0, 1.0, 1.0);
          wagon1.containerMaterials.forEach((mat) => {
            mat.emissive.setHex(0x000000);
            mat.emissiveIntensity = 0;
          });
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
   * Déclenche un rebond physique visuel sur le chargement du wagon 1.
   */
  triggerCargoPulse() {
    this.cargoPulseProgress = 0.0;
  },

  /**
   * Bascule vers l'une des 2 sous-parties de l'étape 1.
   * @param {number} subIndex - 0: Données & Hash, 1: Molette Nonce
   */
  goToSubStep(subIndex) {
    this.subStep = Math.max(0, Math.min(subIndex, 1));
    const { cameraController, trainConvoy } = this.ctx;
    const wagon1Pos = trainConvoy ? trainConvoy.getWagonPosition(1) : new THREE.Vector3(3.8, 0, 0);

    if (this.subStep === 0) {
      // 1.1 — Vue cadrant l'intérieur du conteneur et les plaques
      if (cameraController) {
        cameraController.moveTo(
          new THREE.Vector3(wagon1Pos.x + 0.65, 1.45, 2.3),
          new THREE.Vector3(wagon1Pos.x, 0.52, 0),
          1.1
        );
      }
    } else if (this.subStep === 1) {
      // 1.2 — Vue rapprochée sur la molette du Nonce sur le flanc
      if (cameraController) {
        cameraController.moveTo(
          new THREE.Vector3(wagon1Pos.x + 0.1, 0.38, 1.35),
          new THREE.Vector3(wagon1Pos.x, 0.2, 0.68),
          1.1
        );
      }
    }

    this.renderLeftPanel();
  },

  /**
   * Met à jour les données du wagon 1, recalcule son hash et actualise le rendu 3D.
   * @param {any} newData
   */
  applyTransactionData(newData) {
    const { trainConvoy } = this.ctx;
    const wagon1 = trainConvoy?.getWagon(1);
    if (!wagon1) return;

    wagon1.block.data = newData;
    wagon1.block.hash = wagon1.block.calculateHash();

    // Actualise la couleur d'empreinte et les plaques graphiques
    wagon1.colorHash.set(hashToColorHex(wagon1.block.hash));
    wagon1.renderPlates();

    // Déclenche l'animation de réaction visuelle dans la scène 3D
    this.triggerCargoPulse();

    // Met à jour le récapitulatif dans l'interface
    const displayEl = document.getElementById('step1-hash-preview');
    if (displayEl) {
      displayEl.textContent = `${wagon1.block.hash.substring(0, 20)}...`;
    }
    const dataDescEl = document.getElementById('step1-data-preview');
    if (dataDescEl) {
      dataDescEl.textContent = typeof newData === 'string' ? newData : JSON.stringify(newData);
    }
  },

  /**
   * Fait tourner physiquement la molette du Nonce en 3D et recalcule le hash.
   * @param {number} delta
   */
  stepNonce(delta = 1) {
    const { trainConvoy } = this.ctx;
    const wagon1 = trainConvoy?.getWagon(1);
    if (!wagon1) return;

    wagon1.block.nonce += delta;
    if (wagon1.block.nonce < 0) wagon1.block.nonce = 0;

    // Rotation physique du maillage de la molette en 3D
    if (wagon1.nonceWheel) {
      wagon1.nonceWheel.rotateOnAxis(new THREE.Vector3(0, 1, 0), delta * 0.25);
    }

    // Recalcul du hash avec le nouveau nonce
    wagon1.block.hash = wagon1.block.calculateHash();
    wagon1.colorHash.set(hashToColorHex(wagon1.block.hash));
    wagon1.renderPlates();

    // Met à jour l'affichage dans le volet
    const nonceDisplay = document.getElementById('step1-nonce-display');
    if (nonceDisplay) {
      nonceDisplay.textContent = String(wagon1.block.nonce);
    }
    const hashPreview = document.getElementById('step1-nonce-hash-preview');
    if (hashPreview) {
      hashPreview.textContent = `${wagon1.block.hash.substring(0, 24)}...`;
    }
    const slider = document.getElementById('step1-nonce-slider');
    if (slider) {
      slider.value = String(wagon1.block.nonce % 100);
    }
  },

  /**
   * Génère le volet interactif gauche pour l'étape 1.
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
    const wagon1 = trainConvoy?.getWagon(1);
    const currentHash = wagon1 ? wagon1.block.hash : '0000c14b88f921ea';
    const currentNonce = wagon1 ? wagon1.block.nonce : 4912;
    const currentPrev = wagon1 ? wagon1.block.previousHash : '0000a89f41b2c3d4';

    let subStepContentHTML = '';

    if (this.subStep === 0) {
      // ----------------------------------------------------------------------
      // SOUS-PARTIE 1.1 : TRANSACTIONS ET EMPREINTE (HASH)
      // ----------------------------------------------------------------------
      subStepContentHTML = `
        <article class="step-card context-card animate-fade">
          <h3 class="card-title">Chargement et empreinte numérique</h3>
          <p>
            Chaque wagon transparent transporte des marchandises vérifiables par tous.
            Son contenu est résumé par une empreinte numérique unique de 64 caractères (le Hash SHA-256), qui agit comme un sceau de cire inviolable : si le contenu change, l'empreinte change du tout au tout.
          </p>
          <p>
            Sur la face avant, la plaque PreviousHash recopie l'empreinte du wagon précédent, assurant l'ancrage solide dans la chaîne.
          </p>
        </article>

        <article class="step-card action-card animate-fade">
          <h3 class="card-title">Modifier le chargement en direct</h3>
          <p class="card-instruction">
            Modifiez le texte ci-dessus pour comprendre : le moindre changement dans le chargement modifie instantanément l'empreinte globale (Hash) du wagon.
          </p>

          <div class="action-choices">
            <button id="btn-load-cargo1" class="btn-choice active">
              <span>Charger 50 caisses de matériel</span>
              <span class="btn-choice-icon">Fret #1</span>
            </button>
            <button id="btn-load-cargo2" class="btn-choice">
              <span>Ajouter un bon de livraison</span>
              <span class="btn-choice-icon">Bon #402</span>
            </button>
          </div>

          <div class="action-input-row">
            <input type="text" id="step1-custom-data-input" class="action-input" placeholder="Ou tapez un chargement libre..." maxlength="60">
            <button id="btn-step1-custom-submit" class="btn-input-submit">Charger</button>
          </div>

          <!-- Diagnostic en temps réel -->
          <div class="action-feedback-box">
            <div class="feedback-row">
              <span class="feedback-label">Données en boîte :</span>
              <span id="step1-data-preview" class="feedback-val">50 caisses de matériel</span>
            </div>
            <div class="feedback-row">
              <span class="feedback-label">Empreinte propre (Hash) :</span>
              <span id="step1-hash-preview" class="feedback-val hash-val">${currentHash.substring(0, 20)}...</span>
            </div>
            <div class="feedback-row">
              <span class="feedback-label">Lien parent (PreviousHash) :</span>
              <span class="feedback-val">${currentPrev.substring(0, 20)}...</span>
            </div>
          </div>
        </article>

        <article class="step-card keypoint-card animate-fade">
          <h4 class="card-title keypoint-title">Point clé</h4>
          <p class="keypoint-text">
            Chaque modification de marchandise recalcule automatiquement l'empreinte numérique (Hash) du wagon.
            Il est impossible d'altérer un seul caractère sans bouleverser entièrement cette signature mathématique.
          </p>
        </article>
      `;
    } else if (this.subStep === 1) {
      // ----------------------------------------------------------------------
      // SOUS-PARTIE 1.2 : LA MOLETTE DU NONCE
      // ----------------------------------------------------------------------
      subStepContentHTML = `
        <article class="step-card context-card animate-fade">
          <h3 class="card-title">La molette mécanique du Nonce</h3>
          <p>
            Le Nonce est une molette d'ajustement. Modifier le chargement invalide le wagon. Pour le rendre à nouveau valide (trouver une empreinte commençant par des zéros), les mineurs doivent tester des milliers de combinaisons avec cette molette sans toucher aux marchandises.
          </p>
          <p>
            Chaque cran de molette recalcule entièrement le Hash sans jamais modifier le contenu transporté.
          </p>
        </article>

        <article class="step-card action-card animate-fade">
          <h3 class="card-title">Tourner la molette du Nonce</h3>
          <p class="card-instruction">
            Actionnez les commandes pour faire pivoter la molette en 3D et constater la recalculation instantanée de l'empreinte (Hash) :
          </p>

          <div class="nonce-controller">
            <div class="nonce-stepper-row">
              <button id="btn-nonce-plus1" class="btn-nonce-step">Tourner (+1)</button>
              <div id="step1-nonce-display" class="nonce-value-display">${currentNonce}</div>
              <button id="btn-nonce-plus10" class="btn-nonce-step">Tourner (+10)</button>
            </div>

            <div class="nonce-slider-wrap">
              <input type="range" id="step1-nonce-slider" class="nonce-slider" min="0" max="99" value="${currentNonce % 100}">
            </div>
          </div>

          <div class="action-feedback-box">
            <div class="feedback-row">
              <span class="feedback-label">Empreinte SHA-256 en direct :</span>
              <span id="step1-nonce-hash-preview" class="feedback-val hash-val">${currentHash.substring(0, 22)}...</span>
            </div>
          </div>
        </article>

        <article class="step-card keypoint-card animate-fade">
          <h4 class="card-title keypoint-title">Point clé</h4>
          <p class="keypoint-text">
            En Preuve de Travail (PoW), les mineurs cherchent le bon Nonce qui produit une empreinte valide respectant la difficulté du réseau.
          </p>
        </article>
      `;
    }

    inner.innerHTML = `
      <header class="step-panel-header">
        <div class="step-panel-header-top">
          <span class="substep-progress-indicator">Partie 1.${this.subStep + 1} sur 1.2</span>
        </div>
        <h2 class="step-panel-title">Structure du Bloc</h2>
        <p class="step-panel-subtitle">Anatomie d'un wagon : fret, empreinte et verrouillage</p>

        <!-- Stepper horizontal cliquable à 2 sous-parties -->
        <div class="substep-stepper" role="tablist" aria-label="Sous-parties de l'étape 1">
          <button class="substep-pill ${this.subStep === 0 ? 'active' : 'completed'}" data-substep="0">
            <span class="substep-num">1.1</span>
            <span class="substep-label">Transactions & Hash</span>
          </button>
          <button class="substep-pill ${this.subStep === 1 ? 'active' : ''}" data-substep="1">
            <span class="substep-num">1.2</span>
            <span class="substep-label">Molette Nonce</span>
          </button>
        </div>
      </header>

      <div class="step-panel-scroll">
        ${subStepContentHTML}

        <!-- Barre de navigation inférieure -->
        <div class="step-nav-bar panel-footer-nav">
          <button id="btn-step1-prev-sub" class="btn-panel-ghost">
            <span>&larr; ${this.subStep === 0 ? 'Intro' : 'Précédent'}</span>
          </button>

          <button id="btn-step1-next-sub" class="btn-panel-primary">
            <span>${this.subStep === 1 ? 'Étape 2 : Le Chaînage' : 'Partie suivante'}</span>
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
    document.getElementById('btn-step1-prev-sub')?.addEventListener('click', () => {
      if (this.subStep > 0) {
        this.goToSubStep(this.subStep - 1);
      } else if (typeof this.ctx.onPrevStep === 'function') {
        this.ctx.onPrevStep();
      }
    });

    document.getElementById('btn-step1-next-sub')?.addEventListener('click', () => {
      if (this.subStep < 1) {
        this.goToSubStep(this.subStep + 1);
      } else if (typeof this.ctx.onNextStep === 'function') {
        this.ctx.onNextStep();
      }
    });

    // 3. Interactions Sous-partie 1.1 (Transactions)
    if (this.subStep === 0) {
      const choiceButtons = document.querySelectorAll('.action-choices .btn-choice');
      const resetChoiceButtons = (activeBtn) => {
        choiceButtons.forEach((b) => b.classList.remove('active'));
        if (activeBtn) activeBtn.classList.add('active');
      };

      document.getElementById('btn-load-cargo1')?.addEventListener('click', (e) => {
        resetChoiceButtons(e.currentTarget);
        this.applyTransactionData('50 caisses de matériel');
      });

      document.getElementById('btn-load-cargo2')?.addEventListener('click', (e) => {
        resetChoiceButtons(e.currentTarget);
        this.applyTransactionData('Bon de livraison #402 - Quai Central');
      });

      document.getElementById('btn-step1-custom-submit')?.addEventListener('click', () => {
        const input = document.getElementById('step1-custom-data-input');
        if (input && input.value.trim().length > 0) {
          resetChoiceButtons(null);
          this.applyTransactionData(input.value.trim());
        }
      });

      document.getElementById('step1-custom-data-input')?.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          document.getElementById('btn-step1-custom-submit')?.click();
        }
      });
    }

    // 4. Interactions Sous-partie 1.2 (Nonce)
    if (this.subStep === 1) {
      document.getElementById('btn-nonce-plus1')?.addEventListener('click', () => {
        this.stepNonce(1);
      });

      document.getElementById('btn-nonce-plus10')?.addEventListener('click', () => {
        this.stepNonce(10);
      });

      document.getElementById('step1-nonce-slider')?.addEventListener('input', (e) => {
        const val = parseInt(e.target.value);
        if (!isNaN(val)) {
          const { trainConvoy } = this.ctx;
          const wagon1 = trainConvoy?.getWagon(1);
          if (wagon1) {
            const baseHundreds = Math.floor(wagon1.block.nonce / 100) * 100;
            const newNonce = baseHundreds + val;
            const delta = newNonce - wagon1.block.nonce;
            this.stepNonce(delta);
          }
        }
      });
    }
  }
};
