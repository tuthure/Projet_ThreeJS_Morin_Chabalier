import { step0 } from './step0.js';
import { step1 } from './step1.js';
import { step2 } from './step2.js';
import { step3 } from './step3.js';
import { step4 } from './step4.js';
import { step5 } from './step5.js';
import { step6 } from './step6.js';
import { step7 } from './step7.js';

/**
 * Gestionnaire modulaire des etapes de la visualisation (Introduction + 7 notions).
 * Pilote l'activation de chaque fichier d'etape dedie (step0.js, step1.js...).
 * Gere les marque-pages numerotes situes sur le bord droit du volet gauche.
 */
export class StepManager {
  /**
   * @param {object} context - Contexte applicatif (trainConvoy, cameraController, scene, etc.)
   */
  constructor(context) {
    this.ctx = {
      ...context,
      onNextStep: () => this.next(),
      onPrevStep: () => this.prev(),
      onGoToStep: (num) => this.goToStep(num)
    };

    this.steps = new Map();
    this.currentStep = null;
    this.currentStepNum = 0;

    // Enregistrement des modules d'etape (Etape 0 d'accueil + Etapes 1 a 7)
    this.registerStep(step0);
    this.registerStep(step1);
    this.registerStep(step2);
    this.registerStep(step3);
    this.registerStep(step4);
    this.registerStep(step5);
    this.registerStep(step6);
    this.registerStep(step7);

    this.setupNavigationUI();
  }

  /**
   * Enregistre un module d'etape et l'initialise.
   * @param {object} stepModule
   */
  registerStep(stepModule) {
    if (!stepModule || typeof stepModule.id !== 'number') return;
    stepModule.init(this.ctx);
    this.steps.set(stepModule.id, stepModule);
  }

  /**
   * Initialise les ecouteurs sur les marque-pages et boutons d'etapes.
   */
  setupNavigationUI() {
    const stepButtons = document.querySelectorAll('.step-tab-btn, .step-btn');
    stepButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        const stepNum = parseInt(btn.dataset.step);
        if (!isNaN(stepNum)) {
          this.goToStep(stepNum);
        }
      });
    });

    const btnPrev = document.getElementById('btn-prev');
    if (btnPrev) {
      btnPrev.addEventListener('click', () => this.prev());
    }

    const btnNext = document.getElementById('btn-next');
    if (btnNext) {
      btnNext.addEventListener('click', () => this.next());
    }
  }

  /**
   * S'assure que les marque-pages sur le bord droit sont toujours presents dans le DOM.
   */
  ensureBookmarkTabs() {
    const panel = document.getElementById('step-panel-left');
    if (!panel) return;

    let tabsNav = document.getElementById('step-bookmark-tabs');
    if (!tabsNav) {
      tabsNav = document.createElement('nav');
      tabsNav.id = 'step-bookmark-tabs';
      tabsNav.className = 'step-bookmark-tabs';
      tabsNav.setAttribute('aria-label', 'Marque-pages des etapes');
      tabsNav.innerHTML = `
        <button class="step-tab-btn" data-step="0" title="Notion 0 : Introduction">0</button>
        <button class="step-tab-btn" data-step="1" title="Notion 1 : Structure du bloc">1</button>
        <button class="step-tab-btn" data-step="2" title="Notion 2 : Chainage cryptographique">2</button>
        <button class="step-tab-btn" data-step="3" title="Notion 3 : Immutabilite">3</button>
        <button class="step-tab-btn" data-step="4" title="Notion 4 : Reseau distribue">4</button>
        <button class="step-tab-btn" data-step="5" title="Notion 5 : Minage">5</button>
        <button class="step-tab-btn" data-step="6" title="Notion 6 : Consensus">6</button>
        <button class="step-tab-btn" data-step="7" title="Notion 7 : Attaque des 51%">7</button>
      `;
      panel.appendChild(tabsNav);
      this.setupNavigationUI();
    }
  }

  /**
   * Bascule vers une etape donnee (0 a 7).
   * @param {number} stepNumber
   */
  goToStep(stepNumber) {
    const targetNum = Math.max(0, Math.min(stepNumber, 7));
    if (targetNum === this.currentStepNum && this.currentStep) return;

    // 0. Ferme l'ecran d'accueil s'il etait actif
    if (this.ctx.welcome && typeof this.ctx.welcome.exit === 'function') {
      this.ctx.welcome.exit();
    }

    // 1. Sortie propre de l'etape precedente
    if (this.currentStep && typeof this.currentStep.exit === 'function') {
      this.currentStep.exit();
    }

    // 2. Mise a jour du numero d'etape
    this.currentStepNum = targetNum;
    this.currentStep = this.steps.get(targetNum) || null;

    // 3. Entree dans la nouvelle etape
    if (this.currentStep && typeof this.currentStep.enter === 'function') {
      this.currentStep.enter();
    }

    // 4. Verifie la presence des marque-pages et met a jour la classe active
    this.ensureBookmarkTabs();

    const stepButtons = document.querySelectorAll('.step-tab-btn, .step-btn');
    stepButtons.forEach((btn) => {
      btn.classList.toggle('active', parseInt(btn.dataset.step) === targetNum);
    });

    const btnPrev = document.getElementById('btn-prev');
    const btnNext = document.getElementById('btn-next');
    if (btnPrev) btnPrev.disabled = targetNum === 0;
    if (btnNext) btnNext.disabled = targetNum === 7;
  }

  /**
   * Passe a l'etape suivante.
   */
  next() {
    if (this.currentStepNum < 7) {
      this.goToStep(this.currentStepNum + 1);
    }
  }

  /**
   * Revient a l'etape precedente.
   */
  prev() {
    if (this.currentStepNum > 0) {
      this.goToStep(this.currentStepNum - 1);
    }
  }
}
