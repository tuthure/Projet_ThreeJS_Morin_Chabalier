import * as THREE from 'three';

/**
 * Étape 0 : Le Principe du Convoi.
 * Découverte interactive de l'analogie générale du train :
 * - Vue d'ensemble d'un convoi public qui roule aux yeux de tous
 * - Observation de la locomotive sans conducteur (programme informatique automatique)
 * - Observation des wagons vitrés qui transportent les échanges à découvert
 */
export const step0 = {
  id: 0,
  title: 'Principe du Convoi',
  subtitle: 'Comprendre la blockchain grâce au train',
  ctx: null,

  // Phase de lecture actuelle dans l'étape 0 (0: Convoi, 1: Locomotive, 2: Wagons vitrés)
  subStep: 0,
  activeTooltipId: null,
  tooltipLayer: null,
  tooltipElements: new Map(),
  rafId: null,

  /**
   * Initialise le module avec le contexte global de l'application.
   * @param {object} context
   */
  init(context) {
    this.ctx = context;
  },

  /**
   * Active l'étape 0 :
   * - Met en place la locomotive et 3 wagons vitrés (Genesis #0, Wagon #1, Wagon #2)
   * - Active le défilement du décor à vitesse de croisière
   * - Crée les infobulles 3D projetées sur la scène
   */
  enter() {
    const { trainConvoy, cameraController, environment } = this.ctx;

    this.subStep = 0;
    this.activeTooltipId = null;

    if (cameraController) {
      cameraController.setViewOffset(210);
    }

    // 1. Initialise le convoi avec la locomotive et 3 wagons vitrés
    const initialBlocks = [
      { emetteur: 'Alice', destinataire: 'Bob', montant: 10, unite: 'jetons' },
      { emetteur: 'Lucas', destinataire: 'Emma', montant: 25, unite: 'jetons' }
    ];
    if (trainConvoy) {
      trainConvoy.resetConvoy(initialBlocks);
      if (cameraController) {
        cameraController.setInteractiveObjects(trainConvoy.getInteractiveObjects());
      }
    }

    // 2. Active le défilement du décor
    if (environment) {
      environment.setSpeed(4.5);
    }

    // 3. Ferme le tiroir d'inspection droit s'il était ouvert
    const inspectionSidebar = document.getElementById('inspection-sidebar');
    if (inspectionSidebar) {
      inspectionSidebar.classList.remove('open');
      inspectionSidebar.setAttribute('aria-hidden', 'true');
    }

    // 4. Monte la couche d'infobulles 3D et démarre le suivi caméra
    this.setupSceneTooltips();
    this.startTooltipLoop();

    // 5. Lance la première phase de découverte
    this.goToSubStep(0);
  },

  /**
   * Quitte l'étape 0 et nettoie les éléments DOM / boucles d'animation.
   */
  exit() {
    this.stopTooltipLoop();

    if (this.tooltipLayer) {
      this.tooltipLayer.remove();
      this.tooltipLayer = null;
    }
    this.tooltipElements.clear();

    const panel = document.getElementById('step-panel-left');
    if (panel) {
      const inner = panel.querySelector('.step-panel-inner');
      if (inner) inner.remove();
    }
  },

  /**
   * Définit les points d'intérêt 3D (infobulles) présents sur le convoi (sans l'attelage, réservé à l'étape 2).
   */
  getHotspotsData() {
    return [
      {
        id: 'loco',
        label: 'Locomotive',
        title: 'Cabine sans conducteur',
        text: 'Aucune compagnie centrale ni chef de gare à bord : ce sont les règles programmées du réseau qui font avancer le train automatiquement.',
        getPos: () => {
          const yOffset = this.ctx.trainConvoy?.locomotiveMesh?.position.y || 0;
          return new THREE.Vector3(-3.8, 1.95 + yOffset, 0);
        },
        camPos: new THREE.Vector3(-3.1, 1.85, 5.2),
        camTarget: new THREE.Vector3(-3.3, 0.75, 0)
      },
      {
        id: 'wagon0',
        label: 'Wagon 0 (Départ)',
        title: 'Le tout premier wagon',
        text: 'C\'est le wagon d\'origine mis sur les rails au lancement du réseau. Tous les autres wagons viennent à sa suite.',
        getPos: () => {
          const yOffset = this.ctx.trainConvoy?.wagonMeshes?.[0]?.position.y || 0;
          return new THREE.Vector3(0, 1.65 + yOffset, 0);
        },
        camPos: new THREE.Vector3(-0.6, 1.85, 5.2),
        camTarget: new THREE.Vector3(-0.8, 0.65, 0)
      },
      {
        id: 'wagon1',
        label: 'Wagon 1',
        title: 'Cargaison : Alice → Bob (10 jetons)',
        text: 'Ses parois sont transparentes : tout le monde sur le quai peut voir qu\'Alice envoie 10 jetons à Bob.',
        getPos: () => {
          const yOffset = this.ctx.trainConvoy?.wagonMeshes?.[1]?.position.y || 0;
          return new THREE.Vector3(3.8, 1.65 + yOffset, 0);
        },
        camPos: new THREE.Vector3(2.8, 1.85, 5.5),
        camTarget: new THREE.Vector3(2.5, 0.65, 0)
      },
      {
        id: 'wagon2',
        label: 'Wagon 2',
        title: 'Cargaison : Lucas → Emma (25 jetons)',
        text: 'Chaque nouveau wagon transporte les échanges suivants sans jamais cacher ce qui s\'est passé dans les wagons précédents.',
        getPos: () => {
          const yOffset = this.ctx.trainConvoy?.wagonMeshes?.[2]?.position.y || 0;
          return new THREE.Vector3(7.6, 1.65 + yOffset, 0);
        },
        camPos: new THREE.Vector3(6.2, 1.85, 5.5),
        camTarget: new THREE.Vector3(6.0, 0.65, 0)
      }
    ];
  },

  /**
   * Crée ou met à jour les infobulles 2D projetées depuis l'espace 3D.
   */
  setupSceneTooltips() {
    const hud = document.getElementById('hud');
    if (!hud) return;

    if (!this.tooltipLayer) {
      this.tooltipLayer = document.createElement('div');
      this.tooltipLayer.id = 'step0-tooltips-layer';
      this.tooltipLayer.className = 'scene-tooltips-layer';
      hud.appendChild(this.tooltipLayer);
    }

    this.tooltipLayer.innerHTML = '';
    this.tooltipElements.clear();

    const hotspots = this.getHotspotsData();
    hotspots.forEach((spot) => {
      const el = document.createElement('div');
      el.className = 'scene-tooltip' + (this.activeTooltipId === spot.id ? ' active' : '');
      el.dataset.spotId = spot.id;
      el.innerHTML = `
        <button type="button" class="scene-tooltip-pill" aria-expanded="${this.activeTooltipId === spot.id}">
          <span class="scene-tooltip-dot"></span>
          <span class="scene-tooltip-label">${spot.label}</span>
        </button>
        <div class="scene-tooltip-card">
          <div class="scene-tooltip-card-title">${spot.title}</div>
          <p class="scene-tooltip-card-text">${spot.text}</p>
        </div>
        <div class="scene-tooltip-stem"></div>
      `;

      const pillBtn = el.querySelector('.scene-tooltip-pill');
      pillBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.focusHotspot(spot.id);
      });

      this.tooltipLayer.appendChild(el);
      this.tooltipElements.set(spot.id, { el, spot });
    });
  },

  /**
   * Active une infobulle spécifique et oriente la caméra dessus.
   * @param {string} spotId
   */
  focusHotspot(spotId) {
    const entry = this.tooltipElements.get(spotId);
    if (!entry) return;

    this.activeTooltipId = this.activeTooltipId === spotId ? null : spotId;

    this.tooltipElements.forEach(({ el }, id) => {
      const isActive = id === this.activeTooltipId;
      el.classList.toggle('active', isActive);
      const btn = el.querySelector('.scene-tooltip-pill');
      if (btn) btn.setAttribute('aria-expanded', String(isActive));
    });

    if (this.activeTooltipId && this.ctx.cameraController) {
      this.ctx.cameraController.moveTo(entry.spot.camPos, entry.spot.camTarget, 1.0);
    }
  },

  /**
   * Met à jour les coordonnées écran des infobulles 3D à chaque frame.
   */
  startTooltipLoop() {
    this.stopTooltipLoop();

    const updatePositions = () => {
      if (!this.tooltipLayer || !this.ctx?.camera) return;

      const camera = this.ctx.camera;
      const width = window.innerWidth;
      const height = window.innerHeight;

      this.tooltipElements.forEach(({ el, spot }) => {
        const worldPos = spot.getPos();
        const projected = worldPos.clone().project(camera);

        if (projected.z > 1) {
          el.style.opacity = '0';
          el.style.pointerEvents = 'none';
          return;
        }

        const x = (projected.x * 0.5 + 0.5) * width;
        const y = (-projected.y * 0.5 + 0.5) * height;

        // Masque doucement si l'infobulle passe derrière le volet de gauche
        const isCoveredByLeftPanel = width > 768 && x < 475;
        el.style.opacity = isCoveredByLeftPanel ? '0' : '1';
        el.style.pointerEvents = isCoveredByLeftPanel ? 'none' : 'auto';
        el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`;
      });

      this.rafId = requestAnimationFrame(updatePositions);
    };

    this.rafId = requestAnimationFrame(updatePositions);
  },

  stopTooltipLoop() {
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  },

  /**
   * Change de phase dans l'étape 0 et adapte la caméra et les infobulles.
   * @param {number} index - 0, 1 ou 2
   */
  goToSubStep(index) {
    this.subStep = index;
    const { cameraController } = this.ctx;

    if (index === 0) {
      this.activeTooltipId = null;
      if (cameraController) {
        cameraController.moveTo(
          new THREE.Vector3(1.2, 2.7, 10.5),
          new THREE.Vector3(0.6, 0.7, 0),
          1.2
        );
      }
    } else if (index === 1) {
      this.activeTooltipId = 'loco';
      if (cameraController) {
        cameraController.moveTo(
          new THREE.Vector3(-3.1, 1.85, 5.2),
          new THREE.Vector3(-3.3, 0.75, 0),
          1.1
        );
      }
    } else if (index === 2) {
      this.activeTooltipId = 'wagon1';
      if (cameraController) {
        cameraController.moveTo(
          new THREE.Vector3(2.8, 1.95, 6.2),
          new THREE.Vector3(2.4, 0.65, 0),
          1.2
        );
      }
    }

    this.setupSceneTooltips();
    this.renderLeftPanel();
  },

  /**
   * Génère le contenu HTML du volet pédagogique gauche selon la phase active.
   */
  renderLeftPanel() {
    const panel = document.getElementById('step-panel-left');
    if (!panel) return;

    panel.classList.add('active');

    const oldInner = panel.querySelector('.step-panel-inner');
    if (oldInner) oldInner.remove();

    const inner = document.createElement('div');
    inner.className = 'step-panel-inner';

    let subStepContentHTML = '';

    if (this.subStep === 0) {
      subStepContentHTML = `
        <article class="step-card context-card animate-fade">
          <h3 class="card-title">Un réseau ferroviaire public</h3>
          <p>
            Imaginez un réseau ferroviaire public. Aucune compagnie centrale ou chef de gare unique ne contrôle ces rails. Le réseau est géré et vérifié collectivement par tous ceux qui se trouvent sur le quai.
          </p>
          <p>
            Ce train de marchandises avance sur les rails sous les yeux de tous. Approchez-vous de la locomotive pour observer qui est aux commandes.
          </p>
        </article>

        <div class="substep-action-box animate-fade">
          <button id="btn-step0-action-loco" class="btn-panel-primary">
            <span>Approcher de la locomotive</span>
            <span class="btn-arrow">&rarr;</span>
          </button>
        </div>
      `;
    } else if (this.subStep === 1) {
      subStepContentHTML = `
        <article class="step-card context-card animate-fade">
          <h3 class="card-title">Une locomotive sans conducteur</h3>
          <p>
            La cabine à l'avant est vide : il n'y a pas de conducteur. La locomotive avance toute seule en obéissant à un programme informatique que personne ne peut soudoyer.
          </p>
          <p>
            Regardez maintenant ce qu'elle tire derrière elle : toute une file de wagons aux parois entièrement vitrées.
          </p>
          <p>
            Déplacez-vous vers les wagons pour voir ce qu'ils transportent à l'intérieur.
          </p>
        </article>

        <div class="substep-action-box animate-fade">
          <button id="btn-step0-action-wagons" class="btn-panel-primary">
            <span>Regarder à l'intérieur des wagons</span>
            <span class="btn-arrow">&rarr;</span>
          </button>
        </div>
      `;
    } else if (this.subStep === 2) {
      subStepContentHTML = `
        <article class="step-card context-card animate-fade">
          <h3 class="card-title">Des wagons aux parois vitrées</h3>
          <p>
            Contrairement à un entrepôt fermé à clé, chaque wagon est ici un <strong>bloc</strong> aux parois transparentes : tout le monde sur le quai peut vérifier les cargaisons rangées à l'intérieur.
          </p>
          <p>
            Dès que de nouveaux échanges ont lieu sur le réseau, on remplit un nouveau wagon et on l'ajoute à la suite du train.
          </p>
          <p>
            Mais un wagon ne contient pas que des marchandises : il possède aussi des pièces de sécurité bien précises. Approchons-nous d'un seul wagon pour le démonter pièce par pièce.
          </p>
        </article>

        <div class="substep-action-box animate-fade">
          <button id="btn-step0-next-step" class="btn-panel-primary">
            <span>Étape 1 : Inspecter un wagon</span>
            <span class="btn-arrow">&rarr;</span>
          </button>
        </div>
      `;
    }

    inner.innerHTML = `
      <header class="step-panel-header">
        <div class="step-panel-header-top">
          <span class="substep-progress-indicator">Partie 0.${this.subStep + 1} sur 0.3</span>
        </div>
        <h2 class="step-panel-title">Le Principe du Convoi</h2>
        <p class="step-panel-subtitle">Comprendre la blockchain grâce au train</p>

        <div class="substep-stepper" role="tablist" aria-label="Sous-parties de l'étape 0">
          <button class="substep-pill ${this.subStep === 0 ? 'active' : 'completed'}" data-substep="0">
            <span class="substep-num">0.1</span>
            <span class="substep-label">Convoi</span>
          </button>
          <button class="substep-pill ${this.subStep === 1 ? 'active' : (this.subStep > 1 ? 'completed' : '')}" data-substep="1">
            <span class="substep-num">0.2</span>
            <span class="substep-label">Locomotive</span>
          </button>
          <button class="substep-pill ${this.subStep === 2 ? 'active' : ''}" data-substep="2">
            <span class="substep-num">0.3</span>
            <span class="substep-label">Wagons</span>
          </button>
        </div>
      </header>

      <div class="step-panel-scroll">
        ${subStepContentHTML}

        <div class="panel-actions panel-footer-nav">
          <button id="btn-step0-prev" class="btn-step-action secondary">
            <span>&larr; ${this.subStep === 0 ? 'Accueil' : 'Retour'}</span>
          </button>
          <button id="btn-step0-skip" class="btn-step-action secondary">
            <span>Étape 1 &rarr;</span>
          </button>
        </div>
      </div>
    `;

    panel.prepend(inner);

    // Clics sur les pilules du stepper
    const pills = inner.querySelectorAll('.substep-stepper .substep-pill');
    pills.forEach((pill) => {
      pill.addEventListener('click', () => {
        const targetSub = parseInt(pill.dataset.substep);
        if (!isNaN(targetSub)) {
          this.goToSubStep(targetSub);
        }
      });
    });

    // Actions principales de chaque phase
    document.getElementById('btn-step0-action-loco')?.addEventListener('click', () => {
      this.goToSubStep(1);
    });

    document.getElementById('btn-step0-action-wagons')?.addEventListener('click', () => {
      this.goToSubStep(2);
    });

    document.getElementById('btn-step0-next-step')?.addEventListener('click', () => {
      if (typeof this.ctx.onGoToStep === 'function') {
        this.ctx.onGoToStep(1);
      }
    });

    // Navigation bas de panneau (Retour / Passer)
    document.getElementById('btn-step0-prev')?.addEventListener('click', () => {
      if (this.subStep > 0) {
        this.goToSubStep(this.subStep - 1);
      } else if (this.ctx.welcome && typeof this.ctx.welcome.enter === 'function') {
        this.ctx.welcome.enter();
      }
    });

    document.getElementById('btn-step0-skip')?.addEventListener('click', () => {
      if (typeof this.ctx.onGoToStep === 'function') {
        this.ctx.onGoToStep(1);
      }
    });
  }
};
