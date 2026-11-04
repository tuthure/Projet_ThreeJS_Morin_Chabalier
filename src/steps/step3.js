import * as THREE from 'three';

/**
 * Étape 3 : Immuabilité et falsification.
 */
export const step3 = {
  id: 3,
  title: "Immuabilité et falsification",
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
    const pos = trainConvoy.getWagonPosition(1);
    cameraController.moveTo(new THREE.Vector3(pos.x + 2.0, 2.0, 4.4), new THREE.Vector3(pos.x, 0.45, 0), 1.2);
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
          <h2 class="step-panel-title">L'Immuabilité</h2>
        </header>
        <div class="step-panel-scroll">
          <article class="step-card context-card">
            <h3 class="card-title">Que se passe-t-il en cas de tentative de fraude ?</h3>
            <p>Si quelqu'un essaie d'ouvrir le wagon pour modifier les transactions, le sceau du wagon change instantanément, provoquant une rupture visible de l'attelage avec les wagons suivants.</p>
          </article>
        </div>
    `;

    panel.prepend(inner);
  }
};
