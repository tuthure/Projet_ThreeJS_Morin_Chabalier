import * as THREE from 'three';

/**
 * Étape 2 : Le Chaînage cryptographique.
 * Explique comment le wagon #1 s'accroche au wagon #0 grâce à son empreinte.
 */
export const step2 = {
  id: 2,
  title: "Chaînage cryptographique",
  subtitle: "L'attelage invisible qui lie les blocs",
  ctx: null,

  init(context) {
    this.ctx = context;
  },

  enter() {
    const { trainConvoy, cameraController } = this.ctx;

    // Pour l'étape 2, le train comprend la locomotive, le wagon #0 et le wagon #1
    trainConvoy.resetConvoy([
      { emetteur: 'Arthur', destinataire: 'Alban', montant: 15, unite: 'MMI-Coin' }
    ]);
    cameraController.setInteractiveObjects(trainConvoy.getInteractiveObjects());

    this.renderLeftPanel();

    // Oriente la caméra vers l'attelage reliant le wagon #0 et le wagon #1
    const pos = trainConvoy.getWagonPosition(1);
    cameraController.moveTo(new THREE.Vector3(pos.x - 2.5, 1.4, 2.6), new THREE.Vector3(pos.x - 1.9, 0.4, 0), 1.2);
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
          <h2 class="step-panel-title">Le Chaînage Cryptographique</h2>
          <p class="step-panel-subtitle">L'attelage qui lie les blocs pour l'éternité</p>
        </header>

        <div class="step-panel-scroll">
          <section class="step-card metaphor-card">
            <h3>Comment s'attachent deux wagons ?</h3>
            <p>
              Pour qu'un nouveau wagon (le <strong>Wagon #1</strong>) puisse s'accrocher derrière le <strong>Wagon #0</strong>, son attelage avant doit correspondre exactement à la couleur et à la valeur du sceau du wagon précédent.
            </p>
            <div class="alert-box-warning">
              <strong>Empreinte partagée :</strong> L'anneau arrière du wagon #0 et l'anneau avant du wagon #1 s'illuminent de la même couleur déterministe.
            </div>
          </section>

          <div class="step-actions-row">
            <button id="btn-step2-prev" class="btn-step-action secondary">
              &larr; Étape 1 : Structure
            </button>
            <button id="btn-step2-next" class="btn-step-action primary">
              Étape 3 : Immuabilité &rarr;
            </button>
          </div>
        </div>
    `;

    panel.prepend(inner);

    document.getElementById('btn-step2-prev')?.addEventListener('click', () => {
      this.ctx.onPrevStep?.();
    });
    document.getElementById('btn-step2-next')?.addEventListener('click', () => {
      this.ctx.onNextStep?.();
    });
  }
};
