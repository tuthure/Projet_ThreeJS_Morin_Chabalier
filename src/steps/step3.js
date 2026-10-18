import * as THREE from 'three';

/**
 * Etape 3 : Immutabilite et falsification.
 */
export const step3 = {
  id: 3,
  title: "Immutabilite et falsification",
  ctx: null,
  init(context) { this.ctx = context; },
  enter() {
    const { trainConvoy, cameraController } = this.ctx;
    trainConvoy.resetConvoy([
      { emetteur: 'Arthur', destinataire: 'Alban', montant: 15, unite: 'MMI-Coin' },
      { emetteur: 'Alban', destinataire: 'Equipe-R507', montant: 30, unite: 'MMI-Coin' }
    ]);
    cameraController.setInteractiveObjects(trainConvoy.getInteractiveObjects());

    const titleEl = document.getElementById('sequence-title');
    const descEl = document.getElementById('sequence-desc');
    if (titleEl) titleEl.textContent = "Sequence 3 : Immutabilite et falsification";
    if (descEl) descEl.textContent = "Toute modification frauduleuse d'une transaction brise la liaison magnetique et invalide les wagons suivants.";

    this.renderLeftPanel();
    const pos = trainConvoy.getWagonPosition(1);
    cameraController.moveTo(new THREE.Vector3(pos.x + 2.0, 2.0, 4.4), new THREE.Vector3(pos.x, 0.45, 0), 1.2);
  },
  exit() {
    const panel = document.getElementById('step-panel-left');
    if (panel) { panel.classList.remove('active'); panel.innerHTML = ''; }
  },
  renderLeftPanel() {
    const panel = document.getElementById('step-panel-left');
    if (!panel) return;
    panel.classList.add('active');
    panel.innerHTML = `
      <div class="step-panel-inner">
        <header class="step-panel-header">
          <div class="step-badge-row"><span class="step-badge">Etape 3 sur 7</span><span class="step-concept-tag">Securite</span></div>
          <h2 class="step-panel-title">L'Immutabilite</h2>
          <p class="step-panel-subtitle">Impossible de tricher sans briser la chaine</p>
        </header>
        <div class="step-panel-scroll">
          <section class="step-card metaphor-card">
            <div class="card-icon-badge">INVIOLABILITE</div>
            <h3>Que se passe-t-il en cas de tentative de fraude ?</h3>
            <p>Si quelqu'un essaie d'ouvrir le wagon pour modifier les transactions, le sceau du wagon change instantanement, provoquant une rupture visible de l'attelage avec les wagons suivants.</p>
          </section>
          <div class="step-actions-row">
            <button id="btn-step3-prev" class="btn-step-action secondary">&larr; Etape 2</button>
            <button id="btn-step3-next" class="btn-step-action primary">Etape 4 &rarr;</button>
          </div>
        </div>
      </div>
    `;
    document.getElementById('btn-step3-prev')?.addEventListener('click', () => this.ctx.onPrevStep?.());
    document.getElementById('btn-step3-next')?.addEventListener('click', () => this.ctx.onNextStep?.());
  }
};
