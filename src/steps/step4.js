import * as THREE from 'three';

/**
 * Étape 4 : Réseau et décentralisation.
 */
export const step4 = {
  id: 4,
  title: "Réseau et décentralisation",
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
          <h2 class="step-panel-title">La Décentralisation</h2>
        </header>
        <div class="step-panel-scroll">
          <article class="step-card context-card">
            <h3 class="card-title">Pas de chef de gare unique</h3>
            <p>Il n'existe aucun serveur central ni autorité centrale. Chaque nœud participant au réseau possède la copie conforme et synchronisée de l'ensemble des wagons du convoi.</p>
          </article>
        </div>
    `;

    panel.prepend(inner);
  }
};
