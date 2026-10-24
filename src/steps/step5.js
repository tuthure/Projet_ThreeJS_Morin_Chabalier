import * as THREE from 'three';

/**
 * Etape 5 : Validation et minage (Proof of Work).
 */
export const step5 = {
  id: 5,
  title: "Validation et minage",
  ctx: null,
  init(context) { this.ctx = context; },
  enter() {
    const { trainConvoy, cameraController } = this.ctx;
    trainConvoy.resetConvoy([
      { emetteur: 'Arthur', destinataire: 'Alban', montant: 15, unite: 'MMI-Coin' },
      { emetteur: 'Alban', destinataire: 'Equipe-R507', montant: 30, unite: 'MMI-Coin' },
      { emetteur: 'Quai-Central', destinataire: 'Station-Nord', montant: 8, unite: 'MMI-Coin' }
    ]);
    cameraController.setInteractiveObjects(trainConvoy.getInteractiveObjects());

    this.renderLeftPanel();
    const lastIndex = trainConvoy.wagonMeshes.length - 1;
    const pos = trainConvoy.getWagonPosition(lastIndex);
    cameraController.moveTo(new THREE.Vector3(pos.x + 2.0, 2.2, 4.2), pos, 1.2);
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
          <h2 class="step-panel-title">Le Minage (PoW)</h2>
          <p class="step-panel-subtitle">La course mathematique pour sceller le bloc</p>
        </header>
        <div class="step-panel-scroll">
          <section class="step-card metaphor-card">

            <h3>Comment scelle-t-on un nouveau wagon ?</h3>
            <p>Les mineurs testent des millions de combinaisons sur la molette (le Nonce) jusqu'a trouver celle qui produit un sceau respectant la regle de difficulte.</p>
          </section>
          <div class="step-actions-row">
            <button id="btn-step5-prev" class="btn-step-action secondary">&larr; Etape 4</button>
            <button id="btn-step5-next" class="btn-step-action primary">Etape 6 &rarr;</button>
          </div>
        </div>
    `;

    panel.prepend(inner);

    document.getElementById('btn-step5-prev')?.addEventListener('click', () => this.ctx.onPrevStep?.());
    document.getElementById('btn-step5-next')?.addEventListener('click', () => this.ctx.onNextStep?.());
  }
};
