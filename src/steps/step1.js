import * as THREE from 'three';

/**
 * Etape 1 : Structure d'un bloc (Le wagon aux parois transparentes).
 * Pedagogie dediee aux debutants :
 * - Le convoi ne comporte que la locomotive et le wagon #0 (Bloc Genesis).
 * - Volet lateral gauche expliquant la metaphore du verre et les 4 composants :
 *   1. La marchandise (les transactions)
 *   2. Un nombre magique (le nonce sur la molette)
 *   3. Son sceau officiel (l'empreinte Hash)
 *   4. Le sceau du coffre d'avant (le previousHash et l'attelage)
 */
export const step1 = {
  id: 1,
  title: "Structure d'un bloc",
  subtitle: "Le wagon aux parois de verre",
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
   * - Restreint le convoi a la locomotive vide et a l'unique wagon #0
   * - Construit et affiche le volet pedagogique gauche
   * - Positionne la camera sur une vue accueillante
   */
  enter() {
    const { trainConvoy, cameraController, environment } = this.ctx;

    // 0. Arrete le train au quai d'inspection pour etudier le bloc
    if (environment) {
      environment.setSpeed(0.0);
    }

    // 1. Reinitialise le train avec UNIQUEMENT le wagon Genesis (wagon #0)
    trainConvoy.resetConvoy([]);

    // 2. Met a jour la liste des objets interactifs du raycaster
    cameraController.setInteractiveObjects(trainConvoy.getInteractiveObjects());

    // 3. Ferme l'ancien panneau d'inspection brut a droite s'il etait ouvert
    const inspectionSidebar = document.getElementById('inspection-sidebar');
    if (inspectionSidebar) {
      inspectionSidebar.classList.remove('open');
      inspectionSidebar.setAttribute('aria-hidden', 'true');
    }

    // 4. Genere le volet gauche d'apprentissage
    this.renderLeftPanel();

    // 5. Oriente la camera sur la vue d'ensemble du wagon
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
          <h2 class="step-panel-title">Qu'est-ce qu'un Bloc ?</h2>
          <p class="step-panel-subtitle">La metaphore du wagon aux parois de verre</p>
        </header>

        <div class="step-panel-scroll">
          <!-- 1. Explication vulgarisee de la metaphore -->
          <section class="step-card metaphor-card">
            <div class="card-icon-badge">TRANSPARENCE</div>
            <h3>Pourquoi un wagon en verre ?</h3>
            <p>
              Imaginez un train bien particulier. Dans ce convoi, chaque wagon represente un <strong>bloc</strong> de donnees.
            </p>
            <p>
              Ses parois sont faites <strong>de verre parfaitement transparent</strong> : n'importe qui sur le quai peut regarder a l'interieur et verifier ce qu'il transporte, sans jamais avoir besoin d'ouvrir la porte.
            </p>
            <div class="alert-box-warning">
              <strong>Regle d'or de la blockchain :</strong> Tout le monde peut voir l'interieur, mais forcer le wagon ou modifier son contenu briserait immediatement son <em>sceau d'inviolabilite</em> !
            </div>
          </section>

          <!-- 2. Les 4 elements anatomiques du wagon -->
          <section class="step-card components-card">
            <div class="components-header">
              <h3>Regardons dans le wagon</h3>
              <span class="components-hint">Cliquez sur un composant pour vous en approcher :</span>
            </div>

            <div class="component-grid">
              <!-- Composant 1 : Marchandises / Transactions -->
              <button class="component-item" data-comp="transactions" id="btn-comp-transactions">
                <div class="comp-item-header">
                  <span class="comp-num">1</span>
                  <span class="comp-tag">Interieur</span>
                </div>
                <div class="comp-item-title">La Marchandise</div>
                <div class="comp-item-role">Les Transactions & Contrats</div>
                <div class="comp-item-preview">Coffre securise contenant les donnees certifiees.</div>
              </button>

              <!-- Composant 2 : Le Nonce (Molette) -->
              <button class="component-item" data-comp="nonce" id="btn-comp-nonce">
                <div class="comp-item-header">
                  <span class="comp-num">2</span>
                  <span class="comp-tag">Flanc droit</span>
                </div>
                <div class="comp-item-title">Le Nombre Magique</div>
                <div class="comp-item-role">La Molette du Nonce</div>
                <div class="comp-item-preview">Nombre trouve par calcul pour sceller le wagon.</div>
              </button>

              <!-- Composant 3 : Le Sceau (Hash actuel) -->
              <button class="component-item" data-comp="hash" id="btn-comp-hash">
                <div class="comp-item-header">
                  <span class="comp-num">3</span>
                  <span class="comp-tag">Plaque vitree</span>
                </div>
                <div class="comp-item-title">Le Sceau du Wagon</div>
                <div class="comp-item-role">L'Empreinte HASH (SHA-256)</div>
                <div class="comp-item-preview">Empreinte digitale unique calculant tout le wagon.</div>
              </button>

              <!-- Composant 4 : Le Sceau d'avant (Previous Hash) -->
              <button class="component-item" data-comp="prev" id="btn-comp-prev">
                <div class="comp-item-header">
                  <span class="comp-num">4</span>
                  <span class="comp-tag">Face avant</span>
                </div>
                <div class="comp-item-title">Le Sceau d'Avant</div>
                <div class="comp-item-role">L'Attelage (Previous Hash)</div>
                <div class="comp-item-preview">Anneau arrime au vehicule precedent (locomotive).</div>
              </button>
            </div>

            <!-- Encadre dynamique d'explication detaillee selon l'element selectionne -->
            <div id="component-detail-box" class="component-detail-box">
              <div class="detail-placeholder">
                Cliquez sur un des 4 elements ci-dessus pour zoomer dessus et comprendre son secret !
              </div>
            </div>
          </section>

          <!-- 3. Actions d'observation -->
          <div class="step-actions-row">
            <button id="btn-step1-prev" class="btn-step-action secondary" title="Retour a l'introduction">
              &larr; Intro
            </button>
            <button id="btn-step1-overview" class="btn-step-action secondary">
              Vue globale
            </button>
            <button id="btn-step1-next" class="btn-step-action primary">
              Etape 2 : Le Chainage &rarr;
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
    const compButtons = document.querySelectorAll('.component-item');
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
    document.querySelectorAll('.component-item').forEach((b) => {
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
          <div class="detail-content detail-transactions">
            <div class="detail-badge-title">1. Les Marchandises (Transactions)</div>
            <h4>Ce que transporte le wagon</h4>
            <p>
              Dans un train classique, on transporte des caisses ou du charbon. Dans une blockchain, on transporte <strong>des transactions</strong> : des transferts de monnaie, des signatures de contrats ou des certificats numeriques.
            </p>
            <p class="detail-highlight">
              Grace aux parois en verre du wagon, tout le monde peut consulter publiquement ces donnees. Une fois scellees, il est <strong>impossible de les supprimer ou de les modifier</strong>.
            </p>
          </div>
        `;
        break;

      case 'nonce':
        // Zoom rapproche sur la molette marron du Nonce sur le flanc
        camPos = new THREE.Vector3(wagonPos.x + 0.15, 0.35, 1.55);
        camTarget = new THREE.Vector3(wagonPos.x, 0.22, 0.7);
        detailHtml = `
          <div class="detail-content detail-nonce">
            <div class="detail-badge-title">2. Le Nombre Magique (Le Nonce)</div>
            <h4>La combinaison secrete de verrouillage</h4>
            <p>
              Remarquez cette molette crantee sur le flanc du chassis. Elle affiche un nombre appele le <strong>Nonce</strong> (mot anglais signifiant <em>"nombre utilise une seule fois"</em>).
            </p>
            <p class="detail-highlight">
              Trouver le bon nombre est le resultat d'un calcul informatique intense (le <strong>minage</strong>). C'est ce chiffre precis qui permet au wagon d'obtenir une empreinte cryptographique valide respectant les regles de la blockchain.
            </p>
          </div>
        `;
        break;

      case 'hash':
        // Vue orthogonale nette sur la plaque d'immatriculation centrale HASH
        camPos = new THREE.Vector3(wagonPos.x, 0.62, 1.95);
        camTarget = new THREE.Vector3(wagonPos.x, 0.62, 0.6);
        detailHtml = `
          <div class="detail-content detail-hash">
            <div class="detail-badge-title">3. Son Sceau Officiel (L'empreinte HASH)</div>
            <h4>L'empreinte digitale unique du wagon</h4>
            <p>
              Grave sur cette grande plaque centrale, ce code est genere par une formule mathematique appelee <strong>SHA-256</strong>. C'est l'empreinte digitale exacte du wagon.
            </p>
            <p class="detail-highlight">
              Ce sceau depend mathematiquement de tout ce qui compose le wagon (sa cargaison, son nonce et le sceau du wagon precedent). <strong>Si vous changiez une seule virgule a l'interieur, ce sceau changerait du tout au tout</strong> !
            </p>
          </div>
        `;
        break;

      case 'prev':
        // Vue rapprochee sur la plaque transversale avant et l'attelage reliant a la locomotive
        camPos = new THREE.Vector3(wagonPos.x - 2.55, 1.15, 1.85);
        camTarget = new THREE.Vector3(wagonPos.x - 1.4, 0.45, 0);
        detailHtml = `
          <div class="detail-content detail-prev">
            <div class="detail-badge-title">4. Le Sceau du Coffre d'Avant (Previous Hash)</div>
            <h4>L'attelage qui relie le wagon au convoi</h4>
            <p>
              Pour avoir le droit de s'accrocher au convoi, le wagon doit obligatoirement porter sur son crochet avant <strong>le sceau exact du vehicule qui roule devant lui</strong>.
            </p>
            <p class="detail-highlight">
              Comme ce wagon est le tout premier wagon du train (le <strong>Bloc Genesis</strong>), il est arrime directement a la locomotive avec un sceau initial symbolique compose de zeros : <code>0000000000000000</code>.
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
    document.querySelectorAll('.component-item').forEach((b) => b.classList.remove('active'));

    const detailBox = document.getElementById('component-detail-box');
    if (detailBox) {
      detailBox.innerHTML = `
        <div class="detail-placeholder">
          Cliquez sur un des 4 elements ci-dessus pour zoomer dessus et comprendre son secret !
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
