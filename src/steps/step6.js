import * as THREE from 'three';

/**
 * Etape 6 : Comparaison des consensus (PoW vs PoS).
 */
export const step6 = {
  id: 6,
  title: "Comparaison des consensus (PoW vs PoS)",
  ctx: null,
  init(context) { this.ctx = context; },
  enter() {
    const { trainConvoy, cameraController } = this.ctx;
    trainConvoy.resetConvoy([
      { emetteur: 'Arthur', destinataire: 'Alban', montant: 15, unite: 'MMI-Coin' },
      { emetteur: 'Alban', destinataire: 'Equipe-R507', montant: 30, unite: 'MMI-Coin' }
    ]);
    cameraController.setInteractiveObjects(trainConvoy.getInteractiveObjects());

    this.renderLeftPanel();
    const center = trainConvoy.getTrainCenter();
    cameraController.moveTo(new THREE.Vector3(center.x, 7.0, 15.0), center, 1.2);
  },
  exit() {
    const panel = document.getElementById('step-panel-left');
    if (panel) {
      const inner = panel.querySelector('.step-panel-inner');
      if (inner) inner.remove();
    }
  },
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
          <h2 class="step-panel-title">PoW contre PoS</h2>
          <p class="step-panel-subtitle">Deux philosophies de scellement</p>
        </header>
        <div class="step-panel-scroll">
          <section class="step-card metaphor-card">
            <div class="card-icon-badge">ENERGIE</div>
            <h3>Calcul ou mise sous sequestre ?</h3>
            <p>La preuve de travail utilise de l'energie pour faire tourner la molette, tandis que la preuve d'enjeu confie le scellement a des validateurs bloquant des fonds en caution.</p>
          </section>
          <div class="step-actions-row">
            <button id="btn-step6-prev" class="btn-step-action secondary">&larr; Etape 5</button>
            <button id="btn-step6-next" class="btn-step-action primary">Etape 7 &rarr;</button>
          </div>
        </div>
    `;

    panel.prepend(inner);

    document.getElementById('btn-step6-prev')?.addEventListener('click', () => this.ctx.onPrevStep?.());
    document.getElementById('btn-step6-next')?.addEventListener('click', () => this.ctx.onNextStep?.());
  }
};
