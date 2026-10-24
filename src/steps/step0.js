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

    // 4. Genere le volet gauche d'accueil inclusif
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
   * Genere le contenu HTML du volet d'accueil des debutants.
   */
  renderLeftPanel() {
    const panel = document.getElementById('step-panel-left');
    if (!panel) return;

    panel.classList.add('active');
    panel.innerHTML = `
      <div class="step-panel-inner">
        <header class="step-panel-header">
          <div class="step-panel-kicker">PROLOGUE</div>
          <h2 class="step-panel-title">Bienvenue a bord</h2>
          <p class="step-panel-subtitle">Une immersion visuelle pour comprendre la blockchain sans jargon</p>
        </header>

        <div class="step-panel-scroll">
          <section class="editorial-section">
            <h3 class="editorial-heading">Le voyage commence ici</h3>
            <p>
              Vous avez sans doute deja croise les termes <strong>blockchain</strong>, <em>registre infalsifiable</em> ou <em>crypto-actifs</em> sans representation visuelle concrete de leur fonctionnement.
            </p>
            <p>
              Ici, nul besoin d'equations complexes. Nous explorons cette technologie a travers une metaphore tangible : <strong>un convoi ferroviaire transparent en circulation</strong>.
            </p>
          </section>

          <section class="editorial-section">
            <h3 class="editorial-heading">L'analogie du convoi</h3>
            <p>
              Chaque wagon represente un <strong>bloc</strong> contenant des donnees certifiees : des transactions, des contrats ou des titres de propriete.
            </p>
            <p>
              Ces wagons sont scelles entre eux par des <strong>attelages cryptographiques inviolables</strong>. Si une personne tentait de modifier le contenu d'un wagon passe, l'attelage se briserait instantanement a la vue de l'ensemble du reseau.
            </p>

            <div class="editorial-callout">
              <span class="callout-label">L'EXPERIENCE</span>
              <p class="callout-text">
                En 7 etapes interactives, vous inspecterez les wagons, manipulerez leurs composants et decouvrirez pourquoi ce systeme est concu pour resister a toute falsification.
              </p>
            </div>
          </section>

          <div class="editorial-actions">
            <button id="btn-start-exploration" class="btn-primary-pill">
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
