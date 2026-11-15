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
  cameraBannerEl: null,

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
   */
  enter() {
    const { trainConvoy, cameraController, environment } = this.ctx;

    this.subStep = 0;

    if (cameraController) {
      cameraController.setViewOffset(210);
    }

    // 1. Initialise le convoi avec la locomotive (Bloc 0) et deux wagons de transactions
    const initialBlocks = [
      { lot: 'Fret #104', cargaison: "15 tonnes d'acier", quai: 'Quai A -> Quai B' },
      { lot: 'Convoi express', cargaison: '40 palettes matériel', quai: 'Quai B -> Quai C' }
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

    // 3. Bandeau discret d'aide aux contrôles caméra dans la scène 3D
    this.renderSceneCameraBanner();

    // 4. Lance la première phase de découverte
    this.goToSubStep(0);
  },

  /**
   * Quitte l'étape 0 et nettoie les éléments DOM.
   */
  exit() {
    if (this.cameraBannerEl) {
      this.cameraBannerEl.remove();
      this.cameraBannerEl = null;
    }

    const panel = document.getElementById('step-panel-left');
    if (panel) {
      const inner = panel.querySelector('.step-panel-inner');
      if (inner) inner.remove();
    }
  },

  /**
   * Affiche un bandeau discret au bas de la scène 3D pour guider les contrôles souris.
   */
  renderSceneCameraBanner() {
    if (this.cameraBannerEl) {
      this.cameraBannerEl.remove();
      this.cameraBannerEl = null;
    }

    const hud = document.getElementById('hud');
    if (!hud) return;

    const banner = document.createElement('div');
    banner.id = 'step0-camera-banner';
    banner.className = 'scene-camera-controls-banner animate-fade';
    banner.innerHTML = `
      <span class="camera-banner-title">Caméra 3D</span>
      <span class="camera-banner-sep">|</span>
      <span><strong>Clic gauche + glisser</strong> pour pivoter</span>
      <span class="camera-banner-sep">|</span>
      <span><strong>Molette</strong> pour zoomer / dézoomer</span>
    `;
    hud.appendChild(banner);
    this.cameraBannerEl = banner;
  },

  /**
   * Change de phase dans l'étape 0 et adapte la caméra.
   * @param {number} index - 0, 1 ou 2
   */
  goToSubStep(index) {
    this.subStep = index;
    const { cameraController } = this.ctx;

    if (index === 0) {
      if (cameraController) {
        cameraController.moveTo(
          new THREE.Vector3(3.6, 2.7, 10.5),
          new THREE.Vector3(2.5, 0.7, 0),
          1.2
        );
      }
    } else if (index === 1) {
      if (cameraController) {
        cameraController.moveTo(
          new THREE.Vector3(0.7, 1.85, 5.2),
          new THREE.Vector3(0, 0.75, 0),
          1.1
        );
      }
    } else if (index === 2) {
      if (cameraController) {
        cameraController.moveTo(
          new THREE.Vector3(5.2, 1.95, 6.2),
          new THREE.Vector3(4.2, 0.65, 0),
          1.2
        );
      }
    }

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
          <h3 class="card-title">À quoi sert concrètement une blockchain ?</h3>
          <div class="share-meaning-banner" style="margin-top: 2px; margin-bottom: 8px;">
            <strong>Un registre sans tiers de confiance :</strong> Sur Internet, lorsque vous envoyez de l'argent ou signez un contrat, il faut d'habitude passer par une banque ou un tiers de confiance qui tient les comptes. La blockchain permet à des milliers d'ordinateurs de tenir ensemble un registre public infalsifiable, sans aucun chef central. Pour rendre ce mécanisme visible, nous le représentons ici sous la forme d'un convoi ferroviaire blindé.
          </div>
          <p>
            Imaginez un réseau ferroviaire public. Aucune compagnie centrale ou chef de gare unique ne contrôle ces rails. Le réseau est géré et vérifié collectivement par tous ceux qui se trouvent sur le quai.
          </p>
          <p>
            Ce train de marchandises avance sur les rails sous les yeux de tous. Approchez-vous de la locomotive pour observer qui est aux commandes.
          </p>
        </article>

        <div class="substep-action-box animate-fade">
          <button id="btn-step0-action-loco" class="btn-panel-primary">
            <span>S'approcher de la locomotive</span>
            <span class="btn-arrow">&rarr;</span>
          </button>
        </div>
      `;
    } else if (this.subStep === 1) {
      subStepContentHTML = `
        <article class="step-card context-card animate-fade">
          <h3 class="card-title">La tête du convoi : le Bloc Genesis (Bloc #0)</h3>
          <p>
            La motrice représente le <strong>Bloc Genesis (Bloc #0)</strong> : c'est le tout premier bloc créé au démarrage du réseau (par exemple le 3 janvier 2009 pour Bitcoin). Contrairement aux wagons suivants, il n'a aucun bloc parent avant lui : il sert de point d'ancrage fixe et immuable auquel tout le reste du train vient s'attacher.
          </p>
          <p>
            Aucun chef unique ne conduit ce train : ce sont les gares du réseau qui vérifient et accrochent chaque nouveau wagon en suivant les mêmes règles mathématiques.
          </p>
          <p>
            Déplacez-vous maintenant vers les wagons vitrés qu'elle tire derrière elle.
          </p>
        </article>

        <div class="substep-action-box animate-fade">
          <button id="btn-step0-action-wagons" class="btn-panel-primary">
            <span>Regarder les wagons de transactions</span>
            <span class="btn-arrow">&rarr;</span>
          </button>
          <button id="btn-step0-back-to-0" class="btn-panel-ghost">
            <span>&larr; Retour</span>
          </button>
        </div>
      `;
    } else if (this.subStep === 2) {
      subStepContentHTML = `
        <article class="step-card context-card animate-fade">
          <h3 class="card-title">Des wagons aux parois vitrées</h3>
          <p>
            Contrairement à un entrepôt fermé à clé, chaque wagon est ici un <strong>bloc</strong> aux parois transparentes : tout le monde sur le quai peut vérifier les cargaisons rangées à l'intérieur (Wagon 1, Wagon 2...).
          </p>
          <p>
            Dès que de nouveaux échanges ont lieu sur le réseau, on remplit un nouveau wagon et on l'accroche à la suite du train.
          </p>
          <p>
            Mais un wagon ne contient pas que des marchandises : il possède aussi des pièces de sécurité bien précises. Arrêtons ce train et approchons-nous d'un seul wagon pour le démonter pièce par pièce.
          </p>
        </article>

        <div class="substep-action-box animate-fade">
          <button id="btn-step0-next-step" class="btn-panel-primary">
            <span>Étape 1 : Inspecter un wagon</span>
            <span class="btn-arrow">&rarr;</span>
          </button>
          <button id="btn-step0-back-to-1" class="btn-panel-ghost">
            <span>&larr; Retour</span>
          </button>
        </div>
      `;
    }

    const cameraControlsBoxHTML = `
      <article class="step-card camera-controls-hint-card animate-fade">
        <div class="card-header-tag">
          <span class="card-tag-dot"></span>
          <span>Contrôles de la caméra 3D</span>
        </div>
        <ul class="clean-bullet-list" style="margin: 2px 0 0 16px;">
          <li><strong>Pivoter la caméra</strong> : maintenez le clic gauche enfoncé et déplacez la souris pour tourner autour de la scène.</li>
          <li><strong>Zoomer / Dézoomer</strong> : utilisez la molette de la souris pour vous rapprocher ou vous éloigner des éléments.</li>
        </ul>
      </article>
    `;

    inner.innerHTML = `
      <header class="step-panel-header">
        <h2 class="step-panel-title">Le Principe du Convoi</h2>
      </header>

      <div class="step-panel-scroll">
        ${cameraControlsBoxHTML}
        ${subStepContentHTML}
      </div>
    `;

    panel.prepend(inner);

    // Actions principales du parcours
    document.getElementById('btn-step0-action-loco')?.addEventListener('click', () => {
      this.goToSubStep(1);
    });

    document.getElementById('btn-step0-back-to-0')?.addEventListener('click', () => {
      this.goToSubStep(0);
    });

    document.getElementById('btn-step0-action-wagons')?.addEventListener('click', () => {
      this.goToSubStep(2);
    });

    document.getElementById('btn-step0-back-to-1')?.addEventListener('click', () => {
      this.goToSubStep(1);
    });

    document.getElementById('btn-step0-next-step')?.addEventListener('click', () => {
      if (typeof this.ctx.onGoToStep === 'function') {
        this.ctx.onGoToStep(1);
      }
    });
  }
};
