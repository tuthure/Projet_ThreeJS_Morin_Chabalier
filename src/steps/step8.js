import * as THREE from 'three';
import { updateLeftPanelPreserveScroll } from './StepManager.js';

/**
 * Étape 8 (Épilogue) : Du train à la cryptomonnaie.
 * Page de clôture qui synthétise les parallèles entre le convoi ferroviaire 3D,
 * les nœuds du réseau et l'application réelle aux cryptomonnaies (Bitcoin, Ethereum).
 */
export const step8 = {
  id: 8,
  title: 'Épilogue : Du train à la cryptomonnaie',
  subtitle: 'Comment cette mécanique ferroviaire sécurise les monnaies numériques sans banque centrale',
  ctx: null,

  /**
   * Initialise le module avec le contexte global de l'application.
   * @param {object} context
   */
  init(context) {
    this.ctx = context;
  },

  /**
   * Active l'épilogue :
   * - Restaure un convoi propre et valide de 4 blocs en mouvement
   * - Replace la caméra en vue panoramique sur le train qui avance
   * - Affiche le comparatif final dans le volet gauche
   */
  enter() {
    const { trainConvoy, cameraController, environment } = this.ctx;

    if (cameraController) {
      cameraController.setViewOffset(210);
      cameraController.moveTo(
        new THREE.Vector3(5.6, 2.6, 11.4),
        new THREE.Vector3(5.2, 0.55, 0),
        1.2
      );
    }

    if (environment) {
      environment.setSpeed(4.5);
    }

    if (trainConvoy) {
      trainConvoy.resetConvoy([
        { lot: 'TX #104', cargaison: 'Transfert 2.4 BTC : A -> B', quai: 'Registre validé' },
        { lot: 'TX #208', cargaison: 'Transfert 0.85 ETH : C -> D', quai: 'Registre validé' },
        { lot: 'TX #312', cargaison: 'Contrat intelligent validé', quai: 'Registre validé' }
      ]);
      if (cameraController) {
        cameraController.setInteractiveObjects(trainConvoy.getInteractiveObjects());
      }
    }

    this.renderLeftPanel();
  },

  /**
   * Quitte l'épilogue et nettoie le volet gauche.
   */
  exit() {
    const panel = document.getElementById('step-panel-left');
    if (panel) {
      const inner = panel.querySelector('.step-panel-inner');
      if (inner) inner.remove();
    }
  },

  /**
   * Affiche le comparatif complet entre le convoi ferroviaire 3D et la cryptomonnaie.
   */
  renderLeftPanel() {
    const panel = document.getElementById('step-panel-left');
    if (!panel) return;

    const inner = document.createElement('div');
    inner.className = 'step-panel-inner';

    inner.innerHTML = `
      <header class="step-panel-header">
        <h2 class="step-panel-title">Épilogue : Du train à la cryptomonnaie</h2>
      </header>

      <div class="step-panel-scroll">
        <article class="step-card context-card animate-fade">
          <h3 class="card-title">Bilan de la métaphore</h3>
          <p>
            Tout au long de ce parcours, le convoi ferroviaire a illustré l'architecture d'une blockchain. Chaque pièce du décor correspond à un mécanisme informatique réel :
          </p>
          <ul class="clean-bullet-list">
            <li><strong>Le train = la Blockchain :</strong> une chaîne ordonnée de wagons (les blocs) où chaque attelage verrouille un bloc à son prédécesseur grâce à son empreinte cryptographique (SHA-256).</li>
            <li><strong>Les gares = les nœuds du réseau P2P :</strong> chaque gare conserve une copie identique du registre et contrôle la validité des nouveaux wagons sans chef d'orchestre central.</li>
            <li><strong>La course ou le tirage au sort = le Consensus :</strong> la Preuve de Travail (PoW) ou la Preuve d'Enjeu (PoS) tranche de façon transparente quelle gare ajoute le bloc suivant.</li>
          </ul>
        </article>

        <article class="step-card action-card animate-fade">
          <h3 class="card-title">Application concrète : la cryptomonnaie</h3>
          <p>
            Aujourd'hui, l'application la plus répandue de cette technologie reste la <strong>cryptomonnaie</strong> (comme Bitcoin ou Ethereum).
          </p>
          <p style="margin-top: 8px;">
            Dans ce cas, les caisses transportées dans chaque wagon ne contiennent plus du fret, mais des <strong>transactions financières vérifiées</strong> : qui envoie quel montant à qui.
          </p>
          <p style="margin-top: 8px;">
            Grâce au chaînage, au minage et à la réplication entre toutes les gares, personne ne peut dépenser deux fois la même somme ni falsifier un ancien paiement, et ce <strong>sans aucune banque centrale</strong> pour garantir les échanges.
          </p>
        </article>

        <article class="step-card keypoint-card animate-fade">
          <h4 class="card-title keypoint-title">Tableau récapitulatif</h4>
          <ul class="clean-bullet-list">
            <li><strong>Wagon :</strong> Bloc de transactions horodaté</li>
            <li><strong>Cargaison :</strong> Paiements ou données certifiées</li>
            <li><strong>Molette Nonce :</strong> Calcul du sceau cryptographique</li>
            <li><strong>Attelage coloré :</strong> Liaison Hash / PreviousHash</li>
            <li><strong>Gares du réseau :</strong> Nœuds mineurs ou validateurs</li>
            <li><strong>Convoi majoritaire :</strong> Chaîne légitime (règle des 51 %)</li>
          </ul>
        </article>

        <nav class="step-nav-bar animate-fade">
          <button id="btn-step8-action-prev" class="btn-panel-ghost">
            <span class="btn-arrow">&larr;</span>
            <span>Étape 7 : Attaque 51 %</span>
          </button>
          <button id="btn-step8-restart" class="btn-panel-primary">
            <span>Recommencer (Étape 0)</span>
            <span class="btn-arrow">&rarr;</span>
          </button>
        </nav>
      </div>
    `;

    updateLeftPanelPreserveScroll(panel, inner);
    this.setupEvents();
  },

  /**
   * Attache les écouteurs de navigation de l'épilogue.
   */
  setupEvents() {
    document.getElementById('btn-step8-action-prev')?.addEventListener('click', () => {
      if (typeof this.ctx.onPrevStep === 'function') {
        this.ctx.onPrevStep();
      }
    });

    document.getElementById('btn-step8-restart')?.addEventListener('click', () => {
      if (typeof this.ctx.onGoToStep === 'function') {
        this.ctx.onGoToStep(0);
      }
    });
  }
};
