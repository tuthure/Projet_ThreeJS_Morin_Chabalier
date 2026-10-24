import * as THREE from 'three';

/**
 * Étape 1 : Anatomie d'un Bloc (La métaphore du wagon de verre).
 * Objectif pédagogique pour les personnes novices :
 * - Montrer uniquement la locomotive et le Wagon #0.
 * - Expliquer visuellement la composition d'un wagon :
 *   1. Les Marchandises (les transactions)
 *   2. Le Nombre magique (la molette du Nonce)
 *   3. Le Sceau officiel du wagon (le Hash SHA-256)
 *   4. Le Sceau du coffre d'avant (l'attelage Previous Hash arrimé à la motrice)
 * - Proposer une navigation interactive avec gros plans caméra sur chaque élément.
 */
export const step1 = {
  id: 1,
  title: "Anatomie d'un Bloc",
  subtitle: "La structure du wagon de verre",
  ctx: null,
  activeComponent: null,

  /**
   * Initialise le module avec le contexte global de l'application.
   * @param {object} context
   */
  init(context) {
    this.ctx = context;
  },

  /**
   * Active l'étape 1 :
   * - Arrête le défilement du décor (train à l'arrêt à quai pour inspection tranquille)
   * - Réinitialise le convoi avec uniquement la locomotive et le wagon #0
   * - Positionne la caméra en vue 3/4 idéale
   * - Affiche le volet d'inspection gauche
   */
  enter() {
    const { trainConvoy, cameraController, environment } = this.ctx;

    // 1. Arrête le mouvement du décor pour une observation sereine à quai
    if (environment) {
      environment.setSpeed(0);
    }

    // 2. Réinitialise le convoi pour ne garder que la locomotive et le premier wagon (#0)
    trainConvoy.resetConvoy([]);

    // 3. Met à jour la liste des objets cliquables dans la scène Three.js
    cameraController.setInteractiveObjects(trainConvoy.getInteractiveObjects());

    // 4. Ferme le volet latéral d'édition à droite si ouvert pour ne pas encombrer l'écran
    const inspectionSidebar = document.getElementById('inspection-sidebar');
    if (inspectionSidebar) {
      inspectionSidebar.classList.remove('open');
      inspectionSidebar.setAttribute('aria-hidden', 'true');
    }

    // 5. Génère le volet pédagogique dédié à l'étape 1
    this.renderLeftPanel();

    // 6. Cadre la caméra sur la locomotive et le wagon Genesis (#0)
    this.focusOverview();
  },

  /**
   * Quitte l'étape 1 et nettoie l'interface.
   */
  exit() {
    const panel = document.getElementById('step-panel-left');
    if (panel) {
      const inner = panel.querySelector('.step-panel-inner');
      if (inner) inner.remove();
    }
  },

  /**
   * Génère le contenu HTML interactif du volet latéral gauche.
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
        <h2 class="step-panel-title">Qu'est-ce qu'un Bloc ?</h2>
        <p class="step-panel-subtitle">La métaphore du wagon aux parois de verre</p>
      </header>

      <div class="step-panel-scroll">
        <!-- 1. Explication vulgarisée de la métaphore -->
        <section class="panel-section">
          <h3 class="section-title">Pourquoi un wagon en verre ?</h3>
          <p>
            Dans ce convoi, chaque wagon représente un <strong>bloc</strong>. Ses parois sont faites de <strong>verre parfaitement transparent</strong> : n'importe qui sur le quai peut regarder à l'intérieur et vérifier ce qu'il transporte, sans jamais avoir besoin d'ouvrir la porte.
          </p>
          <div class="panel-callout warning">
            <span class="callout-tag">RÈGLE D'OR DU RÉSEAU</span>
            <p class="callout-text">
              Tout le monde peut voir l'intérieur, mais forcer le wagon ou modifier son contenu briserait immédiatement son sceau d'inviolabilité !
            </p>
          </div>
        </section>

        <!-- 2. Les 4 éléments anatomiques du wagon -->
        <section class="panel-section">
          <div class="section-lead-row">
            <h3 class="section-title">Regardons dans le wagon</h3>
            <span class="section-hint">Cliquez sur un composant pour vous en approcher :</span>
          </div>

          <div class="inspector-list">
            <!-- Composant 1 : Marchandises / Transactions -->
            <button class="inspector-item" data-comp="transactions" id="btn-comp-transactions">
              <span class="inspector-index">01</span>
              <div class="inspector-info">
                <div class="inspector-title">La Marchandise</div>
                <div class="inspector-subtitle">Les Transactions & Contrats</div>
              </div>
              <span class="inspector-location">Intérieur</span>
            </button>

            <!-- Composant 2 : Le Nonce -->
            <button class="inspector-item" data-comp="nonce" id="btn-comp-nonce">
              <span class="inspector-index">02</span>
              <div class="inspector-info">
                <div class="inspector-title">Le Nombre Magique</div>
                <div class="inspector-subtitle">La Molette du Nonce</div>
              </div>
              <span class="inspector-location">Flanc droit</span>
            </button>

            <!-- Composant 3 : Le Sceau (Hash actuel) -->
            <button class="inspector-item" data-comp="hash" id="btn-comp-hash">
              <span class="inspector-index">03</span>
              <div class="inspector-info">
                <div class="inspector-title">Le Sceau du Wagon</div>
                <div class="inspector-subtitle">L'Empreinte HASH (SHA-256)</div>
              </div>
              <span class="inspector-location">Plaque vitrée</span>
            </button>

            <!-- Composant 4 : Le Sceau d'avant (Previous Hash) -->
            <button class="inspector-item" data-comp="prev" id="btn-comp-prev">
              <span class="inspector-index">04</span>
              <div class="inspector-info">
                <div class="inspector-title">Le Sceau d'Avant</div>
                <div class="inspector-subtitle">L'Attelage (Previous Hash)</div>
              </div>
              <span class="inspector-location">Face avant</span>
            </button>
          </div>

          <!-- Fiche d'inspection dynamique -->
          <div id="component-detail-box" class="inspector-detail-box">
            <div class="detail-placeholder">
              Cliquez sur un des 4 éléments ci-dessus pour zoomer dessus et comprendre son secret !
            </div>
          </div>
        </section>

        <!-- 3. Actions de navigation -->
        <div class="step-nav-bar">
          <button id="btn-step1-prev" class="btn-panel-ghost" title="Retour à l'introduction">
            &larr; Intro
          </button>
          <button id="btn-step1-overview" class="btn-panel-ghost">
            Vue globale
          </button>
          <button id="btn-step1-next" class="btn-panel-primary">
            <span>Étape 2 : Le Chaînage</span>
            <span class="btn-arrow">&rarr;</span>
          </button>
        </div>
      </div>
    `;

    panel.prepend(inner);

    // Attachement des événements aux cartes
    this.setupPanelEvents();
  },

  /**
   * Connecte les écouteurs de clics sur les cartes et boutons du volet gauche.
   */
  setupPanelEvents() {
    const compButtons = document.querySelectorAll('.inspector-item');
    compButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        const compName = btn.dataset.comp;
        this.selectComponent(compName);
      });
    });

    const btnPrev = document.getElementById('btn-step1-prev');
    if (btnPrev) {
      btnPrev.addEventListener('click', () => {
        if (typeof this.ctx.onPrevStep === 'function') {
          this.ctx.onPrevStep();
        }
      });
    }

    const btnOverview = document.getElementById('btn-step1-overview');
    if (btnOverview) {
      btnOverview.addEventListener('click', () => {
        this.focusOverview();
      });
    }

    const btnNext = document.getElementById('btn-step1-next');
    if (btnNext) {
      btnNext.addEventListener('click', () => {
        if (typeof this.ctx.onNextStep === 'function') {
          this.ctx.onNextStep();
        }
      });
    }
  },

  /**
   * Sélectionne un des 4 composants du wagon, déplace la caméra et affiche son explication.
   * @param {'transactions'|'nonce'|'hash'|'prev'} compName
   */
  selectComponent(compName) {
    this.activeComponent = compName;
    const { cameraController, trainConvoy } = this.ctx;
    const wagonPos = trainConvoy.getWagonPosition(0);

    // 1. Mise à jour des classes actives sur les boutons
    document.querySelectorAll('.inspector-item').forEach((b) => {
      b.classList.toggle('active', b.dataset.comp === compName);
    });

    const detailBox = document.getElementById('component-detail-box');
    let camPos;
    let camTarget;
    let detailHtml = '';

    switch (compName) {
      case 'transactions':
        // Gros plan plongeant dans le wagon sur le coffre de marchandises
        camPos = new THREE.Vector3(wagonPos.x + 1.25, 1.45, 1.65);
        camTarget = new THREE.Vector3(wagonPos.x, 0.52, 0);
        detailHtml = `
          <div class="detail-card animate-fade">
            <div class="detail-kicker">COMPOSANT 01 &middot; MARCHANDISES</div>
            <h4 class="detail-title">Ce que transporte le wagon</h4>
            <p class="detail-body">
              Dans un train classique, on transporte des caisses ou du fret. Dans une blockchain, on transporte <strong>des transactions</strong> : échanges de monnaie, signatures de contrats ou certificats numériques.
            </p>
            <div class="detail-insight">
              Grâce aux parois en verre du wagon, tout le monde peut consulter publiquement ces données. Une fois scellées, il est <strong>impossible de les modifier ou de les supprimer</strong>.
            </div>
          </div>
        `;
        break;

      case 'nonce':
        // Zoom rapproché sur la molette marron du Nonce sur le flanc
        camPos = new THREE.Vector3(wagonPos.x + 0.15, 0.35, 1.55);
        camTarget = new THREE.Vector3(wagonPos.x, 0.22, 0.7);
        detailHtml = `
          <div class="detail-card animate-fade">
            <div class="detail-kicker">COMPOSANT 02 &middot; LE NONCE</div>
            <h4 class="detail-title">La combinaison secrète de verrouillage</h4>
            <p class="detail-body">
              Cette molette crantée sur le flanc du châssis affiche un nombre entier spécifique nommé le <strong>Nonce</strong> (<em>"number used once"</em>).
            </p>
            <div class="detail-insight">
              Trouver cette valeur exacte est le but du <strong>minage</strong> : un calcul informatique intense consistant à tester des millions de nombres jusqu'à trouver celui qui permet au sceau de respecter la règle mathématique du réseau.
            </div>
          </div>
        `;
        break;

      case 'hash':
        // Vue orthogonale nette sur la plaque d'immatriculation centrale HASH
        camPos = new THREE.Vector3(wagonPos.x, 0.62, 1.95);
        camTarget = new THREE.Vector3(wagonPos.x, 0.62, 0.6);
        detailHtml = `
          <div class="detail-card animate-fade">
            <div class="detail-kicker">COMPOSANT 03 &middot; EMPREINTE HASH</div>
            <h4 class="detail-title">L'empreinte digitale unique du wagon</h4>
            <p class="detail-body">
              Gravé sur cette grande plaque centrale, ce code est généré par la formule mathématique <strong>SHA-256</strong>. C'est l'empreinte digitale exacte du wagon.
            </p>
            <div class="detail-insight">
              Ce sceau dépend mathématiquement de tout ce qui compose le wagon. <strong>Si vous changiez une seule virgule à l'intérieur, ce sceau changerait complètement</strong> !
            </div>
          </div>
        `;
        break;

      case 'prev':
        // Vue rapprochée sur la plaque transversale avant et l'attelage reliant à la locomotive
        camPos = new THREE.Vector3(wagonPos.x - 2.55, 1.15, 1.85);
        camTarget = new THREE.Vector3(wagonPos.x - 1.4, 0.45, 0);
        detailHtml = `
          <div class="detail-card animate-fade">
            <div class="detail-kicker">COMPOSANT 04 &middot; ATTELAGE PREVIOUS HASH</div>
            <h4 class="detail-title">L'attelage qui relie le wagon au convoi</h4>
            <p class="detail-body">
              Pour être raccordé au convoi, chaque wagon doit obligatoirement porter sur son crochet avant <strong>l'empreinte exacte du wagon qui le précède</strong>.
            </p>
            <div class="detail-insight">
              Comme ce wagon est le tout premier du train (le <strong>Bloc Genesis</strong>), il est arrimé à la locomotive motrice avec une signature originelle formée exclusivement de zéros : <code>0000000000000000</code>.
            </div>
          </div>
        `;
        break;
    }

    if (detailBox) {
      detailBox.innerHTML = detailHtml;
    }

    if (camPos && camTarget) {
      cameraController.moveTo(camPos, camTarget, 1.1);
    }
  },

  /**
   * Replace la caméra en vue globale sur la locomotive et le wagon #0.
   */
  focusOverview() {
    this.activeComponent = null;
    document.querySelectorAll('.inspector-item').forEach((b) => b.classList.remove('active'));

    const detailBox = document.getElementById('component-detail-box');
    if (detailBox) {
      detailBox.innerHTML = `
        <div class="detail-placeholder">
          Cliquez sur un des 4 éléments ci-dessus pour zoomer dessus et comprendre son secret !
        </div>
      `;
    }

    const { cameraController, trainConvoy } = this.ctx;
    const wagonPos = trainConvoy.getWagonPosition(0);

    // Vue d'ensemble 3/4 montrant la motrice et le wagon #0
    const targetPos = new THREE.Vector3(wagonPos.x + 2.2, 1.8, 3.8);
    const targetLookAt = new THREE.Vector3(wagonPos.x - 0.7, 0.45, 0);
    cameraController.moveTo(targetPos, targetLookAt, 1.2);
  }
};
