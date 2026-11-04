import * as THREE from 'three';

/**
 * Étape 5 : Validation et minage (Proof of Work).
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
        </header>
        <div class="step-panel-scroll">
          <article class="step-card context-card">
            <h3 class="card-title">Comment scelle-t-on un nouveau wagon ?</h3>
            <p>Les validateurs (mineurs) testent des millions de combinaisons sur la molette (le Nonce) jusqu'à trouver celle qui produit un sceau respectant la règle de difficulté imposée par le protocole.</p>
          </article>
        </div>
    `;

    panel.prepend(inner);
  }
};
