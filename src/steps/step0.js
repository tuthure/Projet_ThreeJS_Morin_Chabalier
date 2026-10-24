import * as THREE from 'three';

/**
 * Etape 0 : Le Principe du Convoi.
 * Introduit l'analogie ferroviaire de la blockchain :
 * - La motrice (Locomotive) : Le moteur de consensus et le protocole reseau
 * - Les wagons : Les blocs contenant les transactions certifiees
 * - L'attelage magnetique : Le chainage cryptographique infalsifiable
 */
export const step0 = {
  id: 0,
  title: "Principe du Convoi",
  subtitle: "L'analogie ferroviaire de la blockchain",
  ctx: null,

  /**
   * Initialise le module avec le contexte global de l'application.
   * @param {object} context
   */
  init(context) {
    this.ctx = context;
  },

  /**
   * Active l'etape 0 :
   * - Met en place la locomotive, le wagon Genesis (#0) et le wagon #1
   * - Active le defilement du decor a vitesse de croisiere
   * - Positionne la camera sur les premiers maillons du convoi
   * - Affiche le volet pedagogique explicatif
   */
  enter() {
    const { trainConvoy, cameraController, environment } = this.ctx;

    // 1. Initialise le convoi avec la locomotive, le Genesis (#0) et un premier wagon attele (#1)
    const initialBlocks = [
      { emetteur: 'Gare Centrale', destinataire: 'Gare du Nord', montant: 50, unite: 'MMI' }
    ];
    if (trainConvoy) {
      trainConvoy.resetConvoy(initialBlocks);
      if (cameraController) {
        cameraController.setInteractiveObjects(trainConvoy.getInteractiveObjects());
      }
    }

    // 2. Active le defilement du decor
    if (environment) {
      environment.setSpeed(4.5);
    }

    // 3. Ferme l'inspection droite si elle etait ouverte
    const inspectionSidebar = document.getElementById('inspection-sidebar');
    if (inspectionSidebar) {
      inspectionSidebar.classList.remove('open');
      inspectionSidebar.setAttribute('aria-hidden', 'true');
    }

    // 4. Genere le volet gauche pedagogique
    this.renderLeftPanel();

    // 5. Oriente la camera sur les premiers wagons et l'attelage
    if (cameraController) {
      const camPos = new THREE.Vector3(2.4, 2.2, 5.8);
      const camTarget = new THREE.Vector3(0.8, 0.6, 0);
      cameraController.moveTo(camPos, camTarget, 1.4);
    }
  },

  /**
   * Quitte l'etape 0.
   */
  exit() {
    const panel = document.getElementById('step-panel-left');
    if (panel) {
      const inner = panel.querySelector('.step-panel-inner');
      if (inner) inner.remove();
    }
  },

  /**
   * Genere le contenu HTML du volet pedagogique gauche.
   */
  renderLeftPanel() {
    const panel = document.getElementById('step-panel-left');
    if (!panel) return;

    panel.classList.add('active');

    const oldInner = panel.querySelector('.step-panel-inner');
    if (oldInner) oldInner.remove();

    const inner = document.createElement('div');
    inner.className = 'step-panel-inner';
    inner.innerHTML = `
      <header class="step-panel-header">
        <div class="panel-kicker">
          <span class="kicker-dot"></span>
          <span class="kicker-text">CONVOI // NOTION 00</span>
        </div>
        <h2 class="step-panel-title">Le Principe du Convoi</h2>
        <p class="step-panel-subtitle">L'analogie ferroviaire de la blockchain</p>
      </header>

      <div class="step-panel-scroll">
        <section class="panel-section">
          <h3 class="section-title">L'analogie ferroviaire</h3>
          <p>
            Une blockchain fonctionne exactement comme un convoi de fret haute securite circulant a travers un reseau de gares interconnectees :
          </p>
          <p>
            <strong>La locomotive de tete</strong> incarne le protocole de communication et le moteur de consensus : elle dicte les regles du reseau et tracte le convoi.
          </p>
          <p>
            <strong>Chaque wagon</strong> represente un <em>bloc</em> scelle transportant des marchandises numeriques (transactions financieres, registres ou contrats certifies).
          </p>
          <p>
            <strong>L'attelage magnetique</strong> represente le <em>chainage cryptographique</em> (l'empreinte hash). Chaque wagon est indissociable du wagon precedent.
          </p>
        </section>

        <section class="panel-section">
          <h3 class="section-title">Pourquoi est-ce infalsifiable ?</h3>
          <p>
            Si un tiers malveillant modifiait discretement le contenu d'un wagon passe, son empreinte changerait aussitot : <strong>l'attelage magnetique se briserait instantanement</strong> sous les yeux de tout le reseau.
          </p>

          <div class="panel-callout">
            <span class="callout-tag">FEUILLE DE ROUTE</span>
            <p class="callout-text">
              En 7 notions interactives, vous allez inspecter un wagon, tester la resistance des attelages, simuler une falsification, miner de nouveaux blocs et synchroniser des gares distantes.
            </p>
          </div>
        </section>

        <div class="panel-actions">
          <button id="btn-step0-welcome" class="btn-step-action secondary" title="Retourner a l'ecran d'accueil">
            <span>&larr; Accueil</span>
          </button>
          <button id="btn-step0-next" class="btn-step-action primary">
            <span>Etape 1 : Structure</span>
            <span class="btn-arrow">&rarr;</span>
          </button>
        </div>
      </div>
    `;

    panel.prepend(inner);

    document.getElementById('btn-step0-welcome')?.addEventListener('click', () => {
      if (this.ctx.welcome && typeof this.ctx.welcome.enter === 'function') {
        this.ctx.welcome.enter();
      }
    });

    document.getElementById('btn-step0-next')?.addEventListener('click', () => {
      if (typeof this.ctx.onGoToStep === 'function') {
        this.ctx.onGoToStep(1);
      }
    });
  }
};
