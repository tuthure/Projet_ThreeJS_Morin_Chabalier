import * as THREE from 'three';
import { hashToColorHex } from '../three/WagonMesh.js';

/**
 * Étape 1 : Structure d'un Bloc.
 * Anatomie d'un wagon aux parois de verre :
 * - Sous-partie 1.1 : Le compartiment des transactions (fret transporté et réaction visuelle 3D)
 * - Sous-partie 1.2 : L'empreinte numérique (Hash) et le lien parent (PreviousHash) avec surbrillance
 * - Sous-partie 1.3 : La molette du Nonce (rotation physique de la molette 3D et recalcul instantané du hash)
 */
export const step1 = {
  id: 1,
  title: "Structure d'un Bloc",
  subtitle: "Anatomie d'un wagon : fret, empreinte et verrouillage",
  ctx: null,

  subStep: 0, // 0: Transactions, 1: Hash/PreviousHash, 2: Nonce
  rafId: null,

  // Éléments visuels d'animation 3D
  cargoPulseProgress: 1.0,
  highlightLight: null,
  highlightLightPrev: null,
  initialNonceWheelRotation: null,

  /**
   * Initialise le module avec le contexte global de l'application.
   * @param {object} context
   */
  init(context) {
    this.ctx = context;
  },

  /**
   * Active l'étape 1 :
   * - Met en place le train à quai avec la locomotive, le wagon #0 (Genesis) et le wagon #1
   * - Arrête le défilement du décor pour une inspection précise
   * - Active la première sous-partie
   */
  enter() {
    const { trainConvoy, cameraController, environment, scene } = this.ctx;

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
        { emetteur: 'Alice', destinataire: 'Bob', montant: 10, unite: 'BTC' }
      ]);
      if (cameraController) {
        cameraController.setInteractiveObjects(trainConvoy.getInteractiveObjects());
      }
    }

    // 2. Halo lumineux d'éclairage pour la sous-partie 1.2
    if (scene && !this.highlightLight) {
      this.highlightLight = new THREE.PointLight(0x38bdf8, 0, 4.5);
      scene.add(this.highlightLight);

      this.highlightLightPrev = new THREE.PointLight(0x00f5d4, 0, 3.5);
      scene.add(this.highlightLightPrev);
    }

    // 3. Ferme le tiroir d'inspection droit s'il était ouvert
    const inspectionSidebar = document.getElementById('inspection-sidebar');
    if (inspectionSidebar) {
      inspectionSidebar.classList.remove('open');
      inspectionSidebar.setAttribute('aria-hidden', 'true');
    }

    // 4. Démarre la boucle d'animation dédiée de l'étape
    this.startAnimationLoop();

    // 5. Lance la sous-partie 1.1
    this.goToSubStep(0);
  },

  /**
   * Quitte l'étape 1 et nettoie la scène et l'interface.
   */
  exit() {
    this.stopAnimationLoop();

    if (this.highlightLight && this.ctx?.scene) {
      this.ctx.scene.remove(this.highlightLight);
      this.highlightLight = null;
    }
    if (this.highlightLightPrev && this.ctx?.scene) {
      this.ctx.scene.remove(this.highlightLightPrev);
      this.highlightLightPrev = null;
    }

    const panel = document.getElementById('step-panel-left');
    if (panel) {
      const inner = panel.querySelector('.step-panel-inner');
      if (inner) inner.remove();
    }
  },

  /**
   * Lance la boucle requestAnimationFrame pour les animations légères de l'étape 1.
   */
  startAnimationLoop() {
    this.stopAnimationLoop();

    const loop = () => {
      const { trainConvoy } = this.ctx;
      const wagon1 = trainConvoy?.getWagon(1);

      // Animation de rebond du compartiment de fret lors d'un chargement (Sous-partie 1.1)
      if (wagon1 && wagon1.cargoGroup && this.cargoPulseProgress < 1.0) {
        this.cargoPulseProgress += 0.045;
        const p = Math.min(this.cargoPulseProgress, 1.0);
        // Oscillation amortie
        const scale = 1.0 + Math.sin((1 - p) * Math.PI) * 0.18;
        wagon1.cargoGroup.scale.set(scale, scale, scale);

        // Flash émissif doux sur les conteneurs
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

      // Halo pulsant sur les plaques (Sous-partie 1.2)
      if (this.subStep === 1 && wagon1) {
        const time = performance.now() * 0.003;
        const pulse = 1.6 + Math.sin(time * 3) * 0.6;
        if (this.highlightLight) {
          const wagonPos = trainConvoy.getWagonPosition(1);
          this.highlightLight.position.set(wagonPos.x, 0.65, 1.2);
          this.highlightLight.intensity = pulse;
        }
        if (this.highlightLightPrev) {
          const wagonPos = trainConvoy.getWagonPosition(1);
          this.highlightLightPrev.position.set(wagonPos.x - 1.2, 0.65, 0.5);
          this.highlightLightPrev.intensity = pulse * 0.85;
        }
      } else {
        if (this.highlightLight) this.highlightLight.intensity = 0;
        if (this.highlightLightPrev) this.highlightLightPrev.intensity = 0;
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
   * Bascule vers l'une des 3 sous-parties de l'étape 1.
   * @param {number} subIndex - 0, 1 ou 2
   */
  goToSubStep(subIndex) {
    this.subStep = Math.max(0, Math.min(subIndex, 2));
    const { cameraController, trainConvoy } = this.ctx;
    const wagon1Pos = trainConvoy ? trainConvoy.getWagonPosition(1) : new THREE.Vector3(3.8, 0, 0);

    if (this.subStep === 0) {
      // 1.1 — Vue rapprochée sur l'intérieur ouvert du wagon 1
      if (cameraController) {
        cameraController.moveTo(
          new THREE.Vector3(wagon1Pos.x + 0.85, 1.55, 2.05),
          new THREE.Vector3(wagon1Pos.x, 0.52, 0),
          1.1
        );
      }
    } else if (this.subStep === 1) {
      // 1.2 — Vue cadrant l'empreinte centrale (Hash) et la plaque avant (PreviousHash)
      if (cameraController) {
        cameraController.moveTo(
          new THREE.Vector3(wagon1Pos.x - 0.35, 1.35, 2.75),
          new THREE.Vector3(wagon1Pos.x - 0.25, 0.52, 0),
          1.1
        );
      }
    } else if (this.subStep === 2) {
      // 1.3 — Vue rapprochée sur la molette du Nonce sur le flanc du châssis
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

    // Rotation physique du mesh de la molette en 3D
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
      // SOUS-PARTIE 1.1 : LE COMPARTIMENT DES TRANSACTIONS
      // ----------------------------------------------------------------------
      subStepContentHTML = `
        <!-- Carte Contexte -->
        <article class="step-card context-card animate-fade">
          <div class="card-header-tag">
            <span class="card-tag-dot"></span>
            <span>CONTEXTE &middot; LE CHARGEMENT PUBLIC</span>
          </div>
          <h3 class="card-title">Ce que transporte le wagon</h3>
          <p>
            Dans ce convoi, chaque wagon aux parois transparentes transporte des échanges concrets :
            transferts de monnaie, signatures de contrats ou messages chiffrés.
          </p>
          <p>
            Tout le monde sur le quai peut regarder à l'intérieur, mais personne ne peut modifier un chargement
            sans que son empreinte mathématique
            <span class="glossary-term" data-tooltip="Empreinte cryptographique fixe de 64 caractères (SHA-256) qui résume parfaitement le contenu.">
              Hash
            </span>
            ne change instantanément.
          </p>
        </article>

        <!-- Carte Action interactive -->
        <article class="step-card action-card animate-fade">
          <div class="card-header-tag">
            <span class="card-tag-dot action-dot"></span>
            <span>À VOUS DE TESTER &middot; ACTION INTERACTIVE</span>
          </div>
          <h3 class="card-title">Modifier la marchandise en direct</h3>
          <p class="card-instruction">
            Choisissez un chargement pré-rempli ou saisissez votre propre transaction pour observer la réaction immédiate du conteneur en 3D :
          </p>

          <div class="action-choices">
            <button id="btn-load-btc" class="btn-choice active">
              <span>Ajouter un chargement : 10 BTC</span>
              <span class="btn-choice-icon">Alice &rarr; Bob</span>
            </button>
            <button id="btn-load-contract" class="btn-choice">
              <span>Chargement express : Contrat signé</span>
              <span class="btn-choice-icon">Contrat #402</span>
            </button>
            <button id="btn-load-mmi" class="btn-choice">
              <span>Chargement lourd : 150 MMI-Coin</span>
              <span class="btn-choice-icon">Promo MMI</span>
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
              <span id="step1-data-preview" class="feedback-val">Alice &rarr; Bob (10 BTC)</span>
            </div>
            <div class="feedback-row">
              <span class="feedback-label">Empreinte SHA-256 :</span>
              <span id="step1-hash-preview" class="feedback-val hash-val">${currentHash.substring(0, 20)}...</span>
            </div>
          </div>
        </article>

        <!-- Carte Point clé -->
        <article class="step-card keypoint-card animate-fade">
          <div class="card-header-tag">
            <span class="card-tag-dot key-dot"></span>
            <span>POINT CLÉ À RETENIR</span>
          </div>
          <p class="keypoint-text">
            Chaque modification de marchandise recalculera automatiquement le sceau numérique du wagon.
            Il est impossible d'altérer un seul octet en toute discrétion.
          </p>
        </article>
      `;
    } else if (this.subStep === 1) {
      // ----------------------------------------------------------------------
      // SOUS-PARTIE 1.2 : L'EMPREINTE NUMÉRIQUE ET LE LIEN PARENT
      // ----------------------------------------------------------------------
      subStepContentHTML = `
        <!-- Carte Contexte -->
        <article class="step-card context-card animate-fade">
          <div class="card-header-tag">
            <span class="card-tag-dot"></span>
            <span>CONTEXTE &middot; LES DEUX SCEAUX OFFICIELS</span>
          </div>
          <h3 class="card-title">La plaque minéralogique infalsifiable</h3>
          <p>
            Regardez la scène 3D : le wagon porte deux plaques lumineuses distinctes, illuminées par un halo :
          </p>
          <p>
            1. <strong>La plaque centrale (Hash)</strong> : l'empreinte digitale unique calculée par l'algorithme
            <span class="glossary-term" data-tooltip="Fonction de hachage cryptographique produisant une signature irréversible de 256 bits.">SHA-256</span>.
          </p>
          <p>
            2. <strong>La plaque avant (PreviousHash)</strong> : le lien parent qui recopie exactement le sceau du wagon précédent.
          </p>
        </article>

        <!-- Carte Action interactive -->
        <article class="step-card action-card animate-fade">
          <div class="card-header-tag">
            <span class="card-tag-dot action-dot"></span>
            <span>À VOUS DE TESTER &middot; OBSERVATION GUIDÉE</span>
          </div>
          <h3 class="card-title">Vérifier la concordance des plaques</h3>
          <p class="card-instruction">
            Observez la concordance entre la plaque avant de ce wagon (#1) et le sceau d'origine de la locomotive / Wagon #0 :
          </p>

          <div class="action-feedback-box">
            <div class="feedback-row">
              <span class="feedback-label">Sceau arrière du Wagon 0 :</span>
              <span class="feedback-val">${currentPrev.substring(0, 18)}...</span>
            </div>
            <div class="feedback-row">
              <span class="feedback-label">Crochet avant du Wagon 1 :</span>
              <span class="feedback-val hash-val">${currentPrev.substring(0, 18)}...</span>
            </div>
            <div class="feedback-row">
              <span class="feedback-label">Sceau propre du Wagon 1 :</span>
              <span class="feedback-val">${currentHash.substring(0, 18)}...</span>
            </div>
          </div>

          <button id="btn-step1-highlight-toggle" class="btn-panel-primary">
            <span>Mettre en surbrillance les plaques</span>
            <span class="btn-arrow">&rarr;</span>
          </button>
        </article>

        <!-- Carte Point clé -->
        <article class="step-card keypoint-card animate-fade">
          <div class="card-header-tag">
            <span class="card-tag-dot key-dot"></span>
            <span>POINT CLÉ À RETENIR</span>
          </div>
          <p class="keypoint-text">
            Chaque bloc retient le sceau du bloc d'avant. C'est ce double ancrage qui forme une chaîne ininterrompue
            d'événements vérifiables.
          </p>
        </article>
      `;
    } else if (this.subStep === 2) {
      // ----------------------------------------------------------------------
      // SOUS-PARTIE 1.3 : LA MOLETTE DU NONCE
      // ----------------------------------------------------------------------
      subStepContentHTML = `
        <!-- Carte Contexte -->
        <article class="step-card context-card animate-fade">
          <div class="card-header-tag">
            <span class="card-tag-dot"></span>
            <span>CONTEXTE &middot; LA MOLETTE MÉCANIQUE</span>
          </div>
          <h3 class="card-title">Le Nombre Magique (Nonce)</h3>
          <p>
            Sur le flanc droit du châssis sombre se trouve un cadran rotatif numéroté : le
            <span class="glossary-term" data-tooltip="Number used once : nombre entier arbitraire ajusté pour faire varier le hash sans toucher aux transactions.">
              Nonce
            </span>.
          </p>
          <p>
            Comme on ne peut pas modifier les transactions des utilisateurs pour changer le hash,
            on fait tourner cette molette. Chaque cran change complètement l'empreinte mathématique !
          </p>
        </article>

        <!-- Carte Action interactive -->
        <article class="step-card action-card animate-fade">
          <div class="card-header-tag">
            <span class="card-tag-dot action-dot"></span>
            <span>À VOUS DE TESTER &middot; ACTION INTERACTIVE</span>
          </div>
          <h3 class="card-title">Tourner la molette du Nonce</h3>
          <p class="card-instruction">
            Actionnez les boutons ou le curseur pour faire pivoter la molette en 3D et observer le bouleversement complet du hash :
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

        <!-- Carte Point clé -->
        <article class="step-card keypoint-card animate-fade">
          <div class="card-header-tag">
            <span class="card-tag-dot key-dot"></span>
            <span>POINT CLÉ À RETENIR</span>
          </div>
          <p class="keypoint-text">
            Trouver un Nonce qui donne un Hash commençant par plusieurs zéros est le fondement du <strong>minage</strong>.
            C'est une loterie mathématique où seule la puissance de calcul permet d'essayer des millions de combinaisons.
          </p>
        </article>
      `;
    }

    inner.innerHTML = `
      <header class="step-panel-header">
        <div class="step-panel-header-top">
          <span class="step-badge">NOTION 1</span>
          <span class="substep-progress-indicator">Partie 1.${this.subStep + 1} sur 1.3</span>
        </div>
        <h2 class="step-panel-title">Structure du Bloc</h2>
        <p class="step-panel-subtitle">Anatomie d'un wagon : fret, empreinte et verrouillage</p>

        <!-- Stepper horizontal cliquable -->
        <div class="substep-stepper" role="tablist" aria-label="Sous-parties de l'étape 1">
          <button class="substep-pill ${this.subStep === 0 ? 'active' : 'completed'}" data-substep="0">
            <span class="substep-num">1.1</span>
            <span class="substep-label">Transactions</span>
          </button>
          <button class="substep-pill ${this.subStep === 1 ? 'active' : (this.subStep > 1 ? 'completed' : '')}" data-substep="1">
            <span class="substep-num">1.2</span>
            <span class="substep-label">Plaques Hash</span>
          </button>
          <button class="substep-pill ${this.subStep === 2 ? 'active' : ''}" data-substep="2">
            <span class="substep-num">1.3</span>
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
            <span>${this.subStep === 2 ? 'Étape 2 : Le Chaînage' : 'Partie suivante'}</span>
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
      if (this.subStep < 2) {
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

      document.getElementById('btn-load-btc')?.addEventListener('click', (e) => {
        resetChoiceButtons(e.currentTarget);
        this.applyTransactionData({ emetteur: 'Alice', destinataire: 'Bob', montant: 10, unite: 'BTC' });
      });

      document.getElementById('btn-load-contract')?.addEventListener('click', (e) => {
        resetChoiceButtons(e.currentTarget);
        this.applyTransactionData({ type: 'Contrat', ref: 'Bail-Numérique-402', statut: 'Validé' });
      });

      document.getElementById('btn-load-mmi')?.addEventListener('click', (e) => {
        resetChoiceButtons(e.currentTarget);
        this.applyTransactionData({ emetteur: 'Promo-MMI', destinataire: 'Serveur-3D', montant: 150, unite: 'MMI-Coin' });
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

    // 4. Interactions Sous-partie 1.2 (Plaques)
    if (this.subStep === 1) {
      document.getElementById('btn-step1-highlight-toggle')?.addEventListener('click', () => {
        // Déclenche un flash intense sur les halos lumineux
        if (this.highlightLight) {
          this.highlightLight.intensity = 5.0;
        }
        if (this.highlightLightPrev) {
          this.highlightLightPrev.intensity = 4.0;
        }
      });
    }

    // 5. Interactions Sous-partie 1.3 (Nonce)
    if (this.subStep === 2) {
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
