import * as THREE from 'three';

/**
 * Etape 7 : Cycle de vie et illustration d'attaque.
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

    const titleEl = document.getElementById('sequence-title');
    const descEl = document.getElementById('sequence-desc');
    if (titleEl) titleEl.textContent = "Sequence 7 : Cycle de vie et illustration d'attaque";
    if (descEl) descEl.textContent = "Trajectoire d'une transaction du quai jusqu'au bloc scelle, et protection contre les attaques.";

    this.renderLeftPanel();
    const center = trainConvoy.getTrainCenter();
    cameraController.moveTo(new THREE.Vector3(center.x, 4.5, 11.0), center, 1.2);
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
          <div class="step-badge-row"><span class="step-badge">Etape 7 sur 7</span><span class="step-concept-tag">Securite</span></div>
          <h2 class="step-panel-title">Cycle de Vie & Attaque</h2>
          <p class="step-panel-subtitle">De l'emission a l'inviolabilite</p>
        </header>
        <div class="step-panel-scroll">
          <section class="step-card metaphor-card">
            <div class="card-icon-badge">CYCLE DE VIE</div>
            <h3>Du colis sur le quai jusqu'au convoi</h3>
            <p>Une transaction attend d'abord dans une salle d'embarquement (mempool), puis est chargee dans un wagon, scellee par un mineur et validee par le reste du reseau.</p>
          </section>
          <div class="step-actions-row">
            <button id="btn-step7-prev" class="btn-step-action secondary">&larr; Etape 6</button>
            <button id="btn-step7-restart" class="btn-step-action primary">&#8634; Recommencer a l'Etape 1</button>
          </div>
        </div>
      </div>
    `;
    document.getElementById('btn-step7-prev')?.addEventListener('click', () => this.ctx.onPrevStep?.());
    document.getElementById('btn-step7-restart')?.addEventListener('click', () => this.ctx.onGoToStep?.(1));
  }
};
