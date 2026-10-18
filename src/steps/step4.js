import * as THREE from 'three';

/**
 * Etape 4 : Reseau et decentralisation.
 */
export const step4 = {
  id: 4,
  title: "Reseau et decentralisation",
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
    const center = trainConvoy.getTrainCenter();
    cameraController.moveTo(new THREE.Vector3(center.x, 5.5, 13.0), center, 1.2);
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
          <h2 class="step-panel-title">La Decentralisation</h2>
          <p class="step-panel-subtitle">Une copie identique dans chaque gare</p>
        </header>
        <div class="step-panel-scroll">
          <section class="step-card metaphor-card">
            <div class="card-icon-badge">SYNCHRONISATION</div>
            <h3>Pas de chef de gare unique !</h3>
            <p>Il n'existe aucun serveur central. Chaque noeud du reseau possede la copie conforme de tous les wagons.</p>
          </section>
          <div class="step-actions-row">
            <button id="btn-step4-prev" class="btn-step-action secondary">&larr; Etape 3</button>
            <button id="btn-step4-next" class="btn-step-action primary">Etape 5 &rarr;</button>
          </div>
        </div>
      </div>
    `;
    document.getElementById('btn-step4-prev')?.addEventListener('click', () => this.ctx.onPrevStep?.());
    document.getElementById('btn-step4-next')?.addEventListener('click', () => this.ctx.onNextStep?.());
  }
};
