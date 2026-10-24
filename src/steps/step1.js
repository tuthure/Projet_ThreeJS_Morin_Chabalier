import * as THREE from 'three';

/**
 * Etape 1 : Anatomie d'un Bloc (La metaphore du wagon de verre).
 * Objectif pedagogique pour les personnes naives :
 * - Montrer uniquement la locomotive et le Wagon #0.
 * - Expliquer visuellement la composition d'un wagon :
 *   1. Les Marchandises (les transactions)
 *   2. Le Nombre magique (la molette du Nonce)
 *   3. Le Sceau officiel du wagon (le Hash SHA-256)
 *   4. Le Sceau du coffre d'avant (l'attelage Previous Hash arrime a la motrice)
 * - Proposer une navigation interactive avec gros plans camera sur chaque element.
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
   * Active l'etape 1 :
   * - Arrete le defilement du decor (train a l'arret a quai pour inspection tranquille)
   * - Reinitialise le convoi avec uniquement la locomotive et le wagon #0
   * - Positionne la camera en vue 3/4 ideale
   * - Affiche le volet d'inspection gauche
   */
  enter() {
    const { trainConvoy, cameraController, environment } = this.ctx;

    // 1. Arrete le mouvement du decor pour une observation sereine a quai
    if (environment) {
      environment.setSpeed(0);
    }

    // 2. Reinitialise le convoi pour ne garder que la locomotive et le premier wagon (#0)
    trainConvoy.resetConvoy([]);

    // 3. Met a jour la liste des objets cliquables dans la scene Three.js
    cameraController.setInteractiveObjects(trainConvoy.getInteractiveObjects());

    // 4. Ferme le volet lateral d'edition a droite si ouvert pour ne pas encombrer l'ecran
    const inspectionSidebar = document.getElementById('inspection-sidebar');
    if (inspectionSidebar) {
      inspectionSidebar.classList.remove('open');
      inspectionSidebar.setAttribute('aria-hidden', 'true');
    }

    // 5. Genere le panneau pedagogique de gauche dedie a l'etape 1
    this.renderLeftPanel();

    // 6. Cadre la camera sur la locomotive et le wagon Genesis (#0)
    this.focusOverview();
  },

  /**
   * Quitte l'etape 1 et nettoie l'interface.
   */
  exit() {
    const panel = document.getElementById('step-panel-left');
    if (panel) {
      panel.classList.remove('active');
      panel.innerHTML = '';
    }
  },

  /**
   * Genere le contenu HTML interactif du volet lateral gauche.
   */
  renderLeftPanel() {
    const panel = document.getElementById('step-panel-left');
    if (!panel) return;

    panel.classList.add('active');
    panel.innerHTML = `
      <div class="step-panel-inner">
        <header class="step-panel-header">
          <div class="step-panel-kicker">ETAPE 01 / ANATOMIE</div>
          <h2 class="step-panel-title">Qu'est-ce qu'un Bloc ?</h2>
          <p class="step-panel-subtitle">Le wagon aux parois de verre et ses 4 constituants</p>
        </header>

        <div class="step-panel-scroll">
          <!-- 1. Explication vulgarisee de la metaphore -->
          <section class="editorial-section">
            <h3 class="editorial-heading">La transparence absolue</h3>
            <p>
              Dans ce convoi, chaque wagon represente un <strong>bloc</strong>. Ses parois sont faites de <strong>verre parfaitement transparent</strong> : n'importe quel observateur peut inspecter son contenu sans jamais ouvrir ses portes.
            </p>
            <div class="editorial-callout warning">
              <span class="callout-label">PRINCIPE FONDAMENTAL</span>
              <p class="callout-text">
                Tout le monde peut verifier l'interieur d'un bloc. En revanche, tenter d'en forcer l'acces ou d'en alterer la cargaison brise instantanement son sceau d'inviolabilite.
              </p>
            </div>
          </section>

          <!-- 2. Les 4 elements anatomiques du wagon -->
          <section class="editorial-section">
            <div class="section-lead-row">
              <h3 class="editorial-heading">Anatomie du wagon</h3>
              <span class="section-hint">Cliquez sur un composant pour zoomer</span>
            </div>

            <div class="inspector-list">
              <!-- Composant 1 : Marchandises / Transactions -->
              <button class="inspector-item" data-comp="transactions" id="btn-comp-transactions">
                <span class="inspector-index">01</span>
                <div class="inspector-info">
                  <div class="inspector-title">La Marchandise</div>
                  <div class="inspector-subtitle">Transactions et contrats certifiees</div>
                </div>
                <span class="inspector-location">Interieur</span>
              </button>

              <!-- Composant 2 : Le Nonce -->
              <button class="inspector-item" data-comp="nonce" id="btn-comp-nonce">
                <span class="inspector-index">02</span>
                <div class="inspector-info">
                  <div class="inspector-title">Le Nombre Magique</div>
                  <div class="inspector-subtitle">Molette de verrouillage (Nonce)</div>
                </div>
                <span class="inspector-location">Flanc droit</span>
              </button>

              <!-- Composant 3 : Le Sceau (Hash actuel) -->
              <button class="inspector-item" data-comp="hash" id="btn-comp-hash">
                <span class="inspector-index">03</span>
                <div class="inspector-info">
                  <div class="inspector-title">Le Sceau Officiel</div>
                  <div class="inspector-subtitle">Empreinte cryptographique (SHA-256)</div>
                </div>
                <span class="inspector-location">Plaque vitree</span>
              </button>

              <!-- Composant 4 : Le Sceau d'avant (Previous Hash) -->
              <button class="inspector-item" data-comp="prev" id="btn-comp-prev">
                <span class="inspector-index">04</span>
                <div class="inspector-info">
                  <div class="inspector-title">Le Sceau d'Avant</div>
                  <div class="inspector-subtitle">Attelage au vehicule precedent</div>
                </div>
                <span class="inspector-location">Face avant</span>
              </button>
            </div>

            <!-- Fiche d'inspection dynamique -->
            <div id="component-detail-box" class="inspector-detail-box">
              <div class="detail-placeholder">
                Cliquez sur l'un des 4 composants ci-dessus pour vous en approcher et decouvrir son role.
              </div>
            </div>
          </section>

          <!-- 3. Actions de navigation -->
          <div class="step-nav-bar">
            <button id="btn-step1-prev" class="btn-ghost-pill" title="Retour a l'introduction">
              &larr; Prologue
            </button>
            <button id="btn-step1-overview" class="btn-ghost-pill">
              Vue d'ensemble
            </button>
            <button id="btn-step1-next" class="btn-primary-pill">
              <span>Etape 2</span>
              <span class="btn-arrow">&rarr;</span>
            </button>
          </div>
        </div>
      </div>
    `;

    // Attachement des evenements aux cartes
    this.setupPanelEvents();
  },

  /**
   * Connecte les ecouteurs de clics sur les cartes et boutons du volet gauche.
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
   * Selectionne un des 4 composants du wagon, deplace la camera et affiche son explication.
   * @param {'transactions'|'nonce'|'hash'|'prev'} compName
   */
  selectComponent(compName) {
    this.activeComponent = compName;
    const { cameraController, trainConvoy } = this.ctx;
    const wagonPos = trainConvoy.getWagonPosition(0);

    // 1. Mise a jour des classes actives sur les boutons
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
            <div class="detail-kicker">COMPOSANT 01</div>
            <h4 class="detail-title">La Marchandise &middot; Les Transactions</h4>
            <p class="detail-body">
              Dans un train classique, on transporte des marchandises physiques. Dans la blockchain, ce wagon transporte <strong>des transactions</strong> : echanges de valeur, signatures de contrats ou titres numeriques.
            </p>
            <p class="detail-insight">
              Grace aux parois transparentes du wagon, ces echanges sont verifiables par tous sans intermediaire. Une fois le wagon scelle, ces donnees deviennent <strong>invariables et eternelles</strong>.
            </p>
          </div>
        `;
        break;

      case 'nonce':
        // Zoom rapproche sur la molette marron du Nonce sur le flanc
        camPos = new THREE.Vector3(wagonPos.x + 0.15, 0.35, 1.55);
        camTarget = new THREE.Vector3(wagonPos.x, 0.22, 0.7);
        detailHtml = `
          <div class="detail-card animate-fade">
            <div class="detail-kicker">COMPOSANT 02</div>
            <h4 class="detail-title">Le Nombre Magique &middot; Le Nonce</h4>
            <p class="detail-body">
              Cette molette crantee sur le flanc du chassis affiche un nombre entier specifique nomme le <strong>Nonce</strong> (abreviation de <em>number used once</em>).
            </p>
            <p class="detail-insight">
              Trouver cette valeur exacte est le but du <strong>minage</strong> : un calcul intensif consistant a tester des millions de nombres jusqu'a trouver celui qui permet au sceau de respecter la regle mathematique du reseau.
            </p>
          </div>
        `;
        break;

      case 'hash':
        // Vue orthogonale nette sur la plaque d'immatriculation centrale HASH
        camPos = new THREE.Vector3(wagonPos.x, 0.62, 1.95);
        camTarget = new THREE.Vector3(wagonPos.x, 0.62, 0.6);
        detailHtml = `
          <div class="detail-card animate-fade">
            <div class="detail-kicker">COMPOSANT 03</div>
            <h4 class="detail-title">Le Sceau Officiel &middot; L'Empreinte HASH</h4>
            <p class="detail-body">
              Inscrit sur la plaque vitree, ce code hexadecimal unique est calcule par l'algorithme <strong>SHA-256</strong>. C'est la signature cryptographique du wagon entier.
            </p>
            <p class="detail-insight">
              Ce sceau depend mathematiquement de tout le contenu du wagon. Modifier un seul caractere de transaction briserait instantanement cette valeur et invaliderait le bloc.
            </p>
          </div>
        `;
        break;

      case 'prev':
        // Vue rapprochee sur la plaque transversale avant et l'attelage reliant a la locomotive
        camPos = new THREE.Vector3(wagonPos.x - 2.55, 1.15, 1.85);
        camTarget = new THREE.Vector3(wagonPos.x - 1.4, 0.45, 0);
        detailHtml = `
          <div class="detail-card animate-fade">
            <div class="detail-kicker">COMPOSANT 04</div>
            <h4 class="detail-title">Le Sceau d'Avant &middot; L'Attelage</h4>
            <p class="detail-body">
              Pour etre raccorde au convoi, chaque wagon doit imperativement porter sur son crochet avant <strong>l'empreinte exacte du wagon qui le precede</strong>.
            </p>
            <p class="detail-insight">
              Puisque ce wagon est le tout premier du train (le <strong>Bloc Genesis</strong>), il est arrime a la locomotive motrice avec une signature originelle formee exclusivement de zeros : <code>0000000000000000</code>.
            </p>
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
   * Replace la camera en vue globale sur la locomotive et le wagon #0.
   */
  focusOverview() {
    this.activeComponent = null;
    document.querySelectorAll('.inspector-item').forEach((b) => b.classList.remove('active'));

    const detailBox = document.getElementById('component-detail-box');
    if (detailBox) {
      detailBox.innerHTML = `
        <div class="detail-placeholder">
          Cliquez sur l'un des 4 composants ci-dessus pour vous en approcher et decouvrir son role.
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
