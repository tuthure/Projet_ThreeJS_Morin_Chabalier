import * as THREE from 'three';

/**
 * Etape 0 : Introduction et accueil des decouvreurs.
 * Met en scene le convoi ferroviaire en mouvement dynamique,
 * et accueille chaleureusement les apprenants sans aucun prerequis technique.
 */
export const step0 = {
  id: 0,
  title: "Introduction",
  subtitle: "Bienvenue a bord du convoi",
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
   * - Met le convoi en mouvement (decor defilant a vitesse de croisiere)
   * - Affiche la locomotive et le wagon Genesis (#0)
   * - Positionne la camera en vue panoramique dynamique
   * - Affiche le volet d'accueil gauche
   */
  enter() {
    const { trainConvoy, cameraController, environment } = this.ctx;

    // 1. Initialise le convoi avec la locomotive et le Wagon #0
    trainConvoy.resetConvoy([]);
    cameraController.setInteractiveObjects(trainConvoy.getInteractiveObjects());

    // 2. Active le defilement du decor pour simuler la marche du train
    if (environment) {
      environment.setSpeed(4.5);
    }

    // 3. Ferme l'inspection droite si elle etait ouverte
    const inspectionSidebar = document.getElementById('inspection-sidebar');
    if (inspectionSidebar) {
      inspectionSidebar.classList.remove('open');
      inspectionSidebar.setAttribute('aria-hidden', 'true');
    }

    // 4. Genere le volet gauche d'accueil
    this.renderLeftPanel();

    // 5. Oriente la camera sur une vue panoramique 3/4 eloignee montrant le convoi en marche
    const camPos = new THREE.Vector3(1.8, 2.0, 5.2);
    const camTarget = new THREE.Vector3(-1.0, 0.45, 0);
    cameraController.moveTo(camPos, camTarget, 1.4);
  },

  /**
   * Quitte l'etape 0.
   */
  exit() {
    const panel = document.getElementById('step-panel-left');
    if (panel) {
      panel.classList.remove('active');
      panel.innerHTML = '';
    }
  },

  /**
   * Genere le contenu HTML du volet d'accueil gauche.
   */
  renderLeftPanel() {
    const panel = document.getElementById('step-panel-left');
    if (!panel) return;

    panel.classList.add('active');
    panel.innerHTML = `
      <div class="step-panel-inner">
        <header class="step-panel-header">
          <div class="panel-kicker">
            <span class="kicker-dot"></span>
            <span class="kicker-text">CONVOI // NOTION 00</span>
          </div>
          <h2 class="step-panel-title">Bienvenue a bord !</h2>
          <p class="step-panel-subtitle">Comprendre la blockchain sans aucun jargon</p>
        </header>

        <div class="step-panel-scroll">
          <section class="panel-section">
            <h3 class="section-title">Le voyage commence ici</h3>
            <p>
              Vous avez sans doute deja croise les termes <strong>blockchain</strong>, <em>registre infalsifiable</em> ou <em>crypto</em> sans representation visuelle concrete de leur fonctionnement.
            </p>
            <p>
              Pas d'inquietude : ici, aucun calcul complexe ni jargon incomprehensible. Nous decouvrons cette technologie a travers une image tangible : <strong>un convoi ferroviaire transparent en circulation</strong>.
            </p>
          </section>

          <section class="panel-section">
            <h3 class="section-title">Comment ca marche ?</h3>
            <p>
              Dans ce train, chaque wagon represente un <strong>bloc</strong> contenant des donnees certifiees (des echanges d'argent, des contrats ou des certificats numeriques).
            </p>
            <p>
              Ces wagons sont scelles les uns aux autres par des <strong>attelages cryptographiques invisibles</strong>. Si quelqu'un tente d'ouvrir un wagon passe pour frauder, l'attelage se brise instantanement sous les yeux de tous les observateurs !
            </p>

            <div class="panel-callout">
              <span class="callout-tag">VOTRE PARCOURS</span>
              <p class="callout-text">
                En 7 etapes courtes et interactives, vous inspecterez les wagons, manipulerez leurs composants et comprendrez pourquoi ce reseau est impossible a pirater.
              </p>
            </div>
          </section>

          <div class="panel-actions">
            <button id="btn-start-exploration" class="btn-panel-primary">
              <span>Commencer l'exploration</span>
              <span class="btn-arrow">&rarr;</span>
            </button>
          </div>
        </div>
      </div>
    `;

    document.getElementById('btn-start-exploration')?.addEventListener('click', () => {
      if (typeof this.ctx.onGoToStep === 'function') {
        this.ctx.onGoToStep(1);
      }
    });
  }
};
