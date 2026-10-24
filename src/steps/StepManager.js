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
   * Initialise les ecouteurs sur les boutons de navigation inferieurs.
   */
  setupNavigationUI() {
    const stepButtons = document.querySelectorAll('.step-btn');
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
   * Bascule vers une etape donnee (0 a 7).
   * @param {number} stepNumber
   */
  goToStep(stepNumber) {
    const targetNum = Math.max(0, Math.min(stepNumber, 7));
    if (targetNum === this.currentStepNum && this.currentStep) return;

    // 1. Sortie propre de l'etape precedente
    if (this.currentStep && typeof this.currentStep.exit === 'function') {
      this.currentStep.exit();
    }

    // 2. Mise a jour du numero d'etape
    this.currentStepNum = targetNum;
    this.currentStep = this.steps.get(targetNum) || null;

    // 3. Mise a jour de la barre d'etapes du HUD
    const stepButtons = document.querySelectorAll('.step-btn');
    stepButtons.forEach((btn) => {
      btn.classList.toggle('active', parseInt(btn.dataset.step) === targetNum);
    });

    const btnPrev = document.getElementById('btn-prev');
    const btnNext = document.getElementById('btn-next');
    if (btnPrev) btnPrev.disabled = targetNum === 0;
    if (btnNext) btnNext.disabled = targetNum === 7;

    // 4. Entree dans la nouvelle etape
    if (this.currentStep && typeof this.currentStep.enter === 'function') {
      this.currentStep.enter();
    }
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
