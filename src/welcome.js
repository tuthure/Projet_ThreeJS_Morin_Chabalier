import * as THREE from 'three';

/**
 * Module de bienvenue (Écran d'accueil avant l'étape 0).
 * Met en scène le convoi ferroviaire au complet (une dizaine de wagons)
 * en plan demi-ensemble cinématique, servant de fond vivant
 * pour accueillir les apprenants avec un bloc central supérieur et un bouton héros inférieur.
 */
export const welcome = {
  ctx: null,
  active: false,

  /**
   * Initialise le module d'accueil avec le contexte global de l'application.
   * @param {object} context
   */
  init(context) {
    this.ctx = context;

    const btnStart = document.getElementById('btn-welcome-start');
    if (btnStart) {
      btnStart.addEventListener('click', () => {
        this.exit();
        if (this.ctx.stepManager) {
          this.ctx.stepManager.goToStep(0);
        }
      });
    }
  },

  /**
   * Active l'ecran d'accueil :
   * - Ferme le volet gauche d'etape et l'inspection droite
   * - Construit un convoi de 10 wagons (Genesis + 9 blocs)
   * - Active la vitesse de croisiere du decor
   * - Positionne la camera en plan demi-ensemble panoramique
   * - Affiche la superposition de bienvenue
   */
  enter() {
    this.active = true;

    const { trainConvoy, cameraController, environment, stepManager } = this.ctx;

    // 1. Sort de l'etape courante si elle etait active
    if (stepManager) {
      if (stepManager.currentStep && typeof stepManager.currentStep.exit === 'function') {
        stepManager.currentStep.exit();
      }
      stepManager.currentStep = null;
      stepManager.currentStepNum = -1;

      // Retire l'etat actif de tous les marque-pages
      const stepButtons = document.querySelectorAll('.step-tab-btn, .step-btn');
      stepButtons.forEach((btn) => btn.classList.remove('active'));
    }

    // 2. Masque le volet gauche des etapes
    const panel = document.getElementById('step-panel-left');
    if (panel) {
      panel.classList.remove('active');
    }

    // 3. Ferme le panneau d'inspection droit s'il etait ouvert
    const inspectionSidebar = document.getElementById('inspection-sidebar');
    if (inspectionSidebar) {
      inspectionSidebar.classList.remove('open');
      inspectionSidebar.setAttribute('aria-hidden', 'true');
    }

    // 4. Initialise le convoi avec une dizaine de cargaisons variees (Genesis + 9 wagons)
    const demoTransactions = [
      { emetteur: 'Gare Centrale', destinataire: 'Gare du Nord', montant: 45, unite: 'MMI' },
      { emetteur: 'Entrepôt Alpha', destinataire: 'Terminal Fret', montant: 18, unite: 'MMI' },
      { emetteur: 'Quai #03', destinataire: 'Gare de l\'Est', montant: 105, unite: 'MMI' },
      { emetteur: 'Dépôt Sud', destinataire: 'Plateforme Bêta', montant: 64, unite: 'MMI' },
      { emetteur: 'Gare Maritime', destinataire: 'Hub Transit', montant: 30, unite: 'MMI' },
      { emetteur: 'Ligne 07', destinataire: 'Gare Centrale', montant: 85, unite: 'MMI' },
      { emetteur: 'Quai #12', destinataire: 'Terminal Sud', montant: 12, unite: 'MMI' },
      { emetteur: 'Centre Logistique', destinataire: 'Gare Ouest', montant: 95, unite: 'MMI' },
      { emetteur: 'Relais Express', destinataire: 'Gare Centrale', montant: 50, unite: 'MMI' }
    ];

    if (trainConvoy) {
      trainConvoy.resetConvoy(demoTransactions);
      if (cameraController) {
        cameraController.setInteractiveObjects(trainConvoy.getInteractiveObjects());
      }
    }

    // 5. Active le defilement cinematique du decor
    if (environment) {
      environment.setSpeed(4.8);
    }

    // 6. Oriente la camera en plan demi-ensemble (plan large cadrant le convoi de 10 wagons et le decor)
    if (cameraController) {
      const camPos = new THREE.Vector3(13.5, 4.6, 25.5);
      const camTarget = new THREE.Vector3(14.5, 1.2, 0);
      cameraController.moveTo(camPos, camTarget, 1.6);
    }

    // 7. Affiche l'overlay de bienvenue
    const overlay = document.getElementById('welcome-overlay');
    if (overlay) {
      overlay.classList.add('active');
    }
  },

  /**
   * Masque l'ecran d'accueil.
   */
  exit() {
    this.active = false;
    const overlay = document.getElementById('welcome-overlay');
    if (overlay) {
      overlay.classList.remove('active');
    }
  },

  /**
   * Indique si l'ecran d'accueil est actif.
   * @returns {boolean}
   */
  isActive() {
    return this.active;
  }
};
