import * as THREE from 'three';

/**
 * Étape 7 : Cycle de vie et illustration d'attaque.
 */
export const step7 = {
  id: 7,
  title: "Cycle de vie et illustration d'attaque",
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
    cameraController.moveTo(new THREE.Vector3(center.x, 4.5, 11.0), center, 1.2);
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
          <h2 class="step-panel-title">Cycle de Vie & Attaque</h2>
          <p class="step-panel-subtitle">De l'émission à l'inviolabilité</p>
        </header>
        <div class="step-panel-scroll">
          <section class="step-card metaphor-card">
            <h3>Du colis sur le quai jusqu'au convoi</h3>
            <p>Une transaction attend d'abord dans une salle d'embarquement (mempool), puis est chargée dans un wagon, scellée par un mineur et validée par le reste du réseau.</p>
          </section>
          <div class="step-actions-row">
            <button id="btn-step7-prev" class="btn-step-action secondary">&larr; Étape 6</button>
            <button id="btn-step7-restart" class="btn-step-action primary">&#8634; Recommencer à l'Étape 1</button>
          </div>
        </div>
    `;

    panel.prepend(inner);

    document.getElementById('btn-step7-prev')?.addEventListener('click', () => this.ctx.onPrevStep?.());
    document.getElementById('btn-step7-restart')?.addEventListener('click', () => this.ctx.onGoToStep?.(1));
  }
};
