import * as THREE from 'three';

/**
 * Étape 2 : Chaînage Cryptographique.
 * Focus exclusif sur l'attelage magnétique en fonctionnement normal :
 * chaque wagon recopie l'empreinte (Hash) du bloc précédent dans son PreviousHash.
 */
export const step2 = {
  id: 2,
  title: 'Chaînage Cryptographique',
  ctx: null,

  rafId: null,
  couplerLight: null,
  focusedCouplerIndex: 1, // 1: Attelage Loco #0 <-> Wagon #1, 2: Attelage Wagon #1 <-> Wagon #2

  /**
   * Initialise le module avec le contexte global de l'application.
   * @param {object} context
   */
  init(context) {
    this.ctx = context;
  },

  /**
   * Active l'étape 2 :
   * - Met en place la Locomotive (#0) et deux wagons (#1 et #2)
   * - Arrête le défilement pour observer les faisceaux d'attelage
   * - Installe l'éclairage d'accentuation sur le point de liaison
   */
  enter() {
    const { trainConvoy, cameraController, environment, scene } = this.ctx;

    this.focusedCouplerIndex = 1;

    if (cameraController) {
      cameraController.setViewOffset(210);
    }

    if (environment) {
      environment.setSpeed(0);
    }

    if (trainConvoy) {
      trainConvoy.resetConvoy([
        { emetteur: 'Alice', destinataire: 'Bob', montant: 15, unite: 'MMI-Coin' },
        { emetteur: 'Bob', destinataire: 'Charlie', montant: 8, unite: 'MMI-Coin' }
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

    this.startAnimationLoop();
    this.focusOnCoupler(1);
  },

  /**
   * Quitte l'étape 2 et nettoie les ressources 3D et DOM.
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
   * Boucle d'animation illustrant la concordance magnétique des anneaux d'attelage.
   */
  startAnimationLoop() {
    this.stopAnimationLoop();

    const loop = () => {
      const { trainConvoy } = this.ctx;
      const time = performance.now() * 0.003;
      const pulse = 1.5 + Math.sin(time * 4) * 0.35;

      const loco0 = trainConvoy?.getWagon(0);
      const wagons = trainConvoy?.getWagonMeshes() || [];

      if (loco0 && loco0.rearRingMaterial) {
        loco0.rearRingMaterial.color.setHex(0x00f3ff);
        loco0.rearRingMaterial.emissive.setHex(0x0284c7);
        loco0.rearRingMaterial.emissiveIntensity = pulse;
      }

      wagons.forEach((wagon) => {
        if (wagon.frontRingMaterial) {
          wagon.frontRingMaterial.color.setHex(0x00f3ff);
          wagon.frontRingMaterial.emissive.setHex(0x0284c7);
          wagon.frontRingMaterial.emissiveIntensity = pulse;
        }
        if (wagon.couplerBeamMaterial) {
          wagon.couplerBeamMaterial.color.setHex(0x00f3ff);
          wagon.couplerBeamMaterial.emissive.setHex(0x10b981);
          wagon.couplerBeamMaterial.emissiveIntensity = pulse;
        }
        if (wagon.couplerGroup && wagon.defaultCouplerPosition) {
          wagon.couplerGroup.position.copy(wagon.defaultCouplerPosition);
          wagon.couplerGroup.rotation.z = 0;
        }
      });

      if (this.couplerLight) {
        const couplerX = (this.focusedCouplerIndex - 0.5) * 3.8;
        this.couplerLight.position.x = THREE.MathUtils.lerp(this.couplerLight.position.x, couplerX, 0.1);
        this.couplerLight.color.setHex(0x00f3ff);
        this.couplerLight.intensity = 2.2 + Math.sin(time * 3) * 0.5;
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
   * Oriente la caméra sur un attelage donné du convoi.
   * @param {number} childBlockIndex - Index du wagon enfant (1, 2 ou 3)
   */
  focusOnCoupler(childBlockIndex) {
    const { cameraController, trainConvoy } = this.ctx;
    const totalBlocks = trainConvoy ? trainConvoy.blockchain.chain.length : 3;
    this.focusedCouplerIndex = Math.max(1, Math.min(childBlockIndex, totalBlocks - 1));

    const couplerX = (this.focusedCouplerIndex - 0.5) * 3.8;

    if (cameraController) {
      cameraController.moveTo(
        new THREE.Vector3(couplerX, 1.45, 3.2),
        new THREE.Vector3(couplerX, 0.45, 0),
        1.0
      );
    }

    this.renderLeftPanel();
  },

  /**
   * Ajoute un nouveau wagon à la fin du convoi et déplace la caméra sur son attelage.
   */
  attachNewWagon() {
    const { trainConvoy } = this.ctx;
    if (!trainConvoy) return;

    if (trainConvoy.blockchain.chain.length >= 4) {
      this.focusOnCoupler(3);
      return;
    }

    trainConvoy.addBlock({
      emetteur: 'Charlie',
      destinataire: 'Diane',
      montant: 12,
      unite: 'MMI-Coin'
    });

    const newIndex = trainConvoy.blockchain.chain.length - 1;
    this.focusOnCoupler(newIndex);
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
    const childIdx = this.focusedCouplerIndex;
    const parentIdx = childIdx - 1;

    const parentBlock = trainConvoy?.getBlock(parentIdx);
    const childBlock = trainConvoy?.getBlock(childIdx);

    const parentHash = parentBlock ? parentBlock.hash : '0000a89f41b2c3d4';
    const childPrev = childBlock ? childBlock.previousHash : '0000a89f41b2c3d4';
    const parentLabel = parentIdx === 0 ? 'Locomotive #0' : `Wagon #${parentIdx}`;
    const childLabel = `Wagon #${childIdx}`;
    const hasThirdWagon = (trainConvoy?.blockchain?.chain?.length || 0) >= 4;

    inner.innerHTML = `
      <header class="step-panel-header">
        <h2 class="step-panel-title">Chaînage Cryptographique</h2>
      </header>

      <div class="step-panel-scroll">
        <article class="step-card context-card animate-fade">
          <h3 class="card-title">L'attelage magnétique</h3>
          <p>
            Dans une blockchain, les blocs ne sont pas simplement posés les uns derrière les autres : chaque nouveau wagon intègre à l'avant la copie exacte de l'empreinte du wagon qui le précède (le champ <strong>PreviousHash</strong>).
          </p>
          <p>
            Le verrouillage magnétique ne s'enclenche que si l'anneau arrière du bloc parent et le crochet avant du bloc suivant affichent exactement la même signature cryptographique.
          </p>
        </article>

        <article class="step-card action-card animate-fade">
          <h3 class="card-title">Inspecter les liaisons du convoi</h3>
          <p class="card-instruction">
            Sélectionnez un point d'attelage ou attachez un nouveau wagon pour vérifier la transmission de l'empreinte :
          </p>

          <div class="action-choices">
            <button id="btn-step2-coupler-1" class="btn-choice ${childIdx === 1 ? 'active' : ''}">
              <span>Liaison Locomotive #0 &rarr; Wagon #1</span>
              <span class="btn-choice-icon">Attelage 1</span>
            </button>
            <button id="btn-step2-coupler-2" class="btn-choice ${childIdx === 2 ? 'active' : ''}">
              <span>Liaison Wagon #1 &rarr; Wagon #2</span>
              <span class="btn-choice-icon">Attelage 2</span>
            </button>
            ${hasThirdWagon ? `
              <button id="btn-step2-coupler-3" class="btn-choice ${childIdx === 3 ? 'active' : ''}">
                <span>Liaison Wagon #2 &rarr; Wagon #3</span>
                <span class="btn-choice-icon">Attelage 3</span>
              </button>
            ` : `
              <button id="btn-step2-add-wagon" class="btn-choice">
                <span>Atteler un nouveau wagon (Bloc #3)</span>
                <span class="btn-choice-icon">+ Wagon</span>
              </button>
            `}
          </div>

          <div class="action-feedback-box success">
            <div class="feedback-row">
              <span class="feedback-label">Prise (${parentLabel}) :</span>
              <span class="feedback-val">Cyan (${parentHash.substring(0, 10)}...)</span>
            </div>
            <div class="feedback-row">
              <span class="feedback-label">Crochet (${childLabel}) :</span>
              <span class="feedback-val">Cyan (${childPrev.substring(0, 10)}...)</span>
            </div>
            <div class="feedback-row">
              <span class="feedback-label">État du verrou :</span>
              <span class="feedback-val success-val">Concordance 100% &middot; Scellé</span>
            </div>
          </div>
        </article>

        <article class="step-card keypoint-card animate-fade">
          <h4 class="card-title keypoint-title">Point clé</h4>
          <p class="keypoint-text">
            Chaque bloc contient l'empreinte cryptographique de son parent. C'est cette dépendance mathématique continue qui soude les blocs en une chaîne ordonnée.
          </p>
        </article>

        <div class="substep-action-box animate-fade">
          <button id="btn-step2-action-next" class="btn-panel-primary">
            <span>Étape 3 : Immuabilité et falsification</span>
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
    document.getElementById('btn-step2-coupler-1')?.addEventListener('click', () => {
      this.focusOnCoupler(1);
    });

    document.getElementById('btn-step2-coupler-2')?.addEventListener('click', () => {
      this.focusOnCoupler(2);
    });

    document.getElementById('btn-step2-coupler-3')?.addEventListener('click', () => {
      this.focusOnCoupler(3);
    });

    document.getElementById('btn-step2-add-wagon')?.addEventListener('click', () => {
      this.attachNewWagon();
    });

    document.getElementById('btn-step2-action-next')?.addEventListener('click', () => {
      if (typeof this.ctx.onNextStep === 'function') {
        this.ctx.onNextStep();
      }
    });
  }
};
