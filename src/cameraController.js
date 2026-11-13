import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

/**
 * Contrôleur de caméra cinématographique
 * Prise en charge :
 * - Mode libre : OrbitControls avec amortissement fluide
 * - Navigation guidée : Transitions lerp douces vers les positions/cibles des étapes
 * - Décalage optique (viewOffset) pour centrer la vue à droite du volet gauche
 */
export class CameraController {
  constructor(camera, domElement) {
    this.camera = camera;
    this.domElement = domElement;

    // Initialisation d'OrbitControls
    this.controls = new OrbitControls(this.camera, this.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.maxDistance = 65;
    this.controls.minDistance = 2.5;
    this.controls.maxPolarAngle = Math.PI / 2 - 0.02; // Évite de passer sous le plan des rails

    // État d'interpolation cinématographique
    this.isTransitioning = false;
    this.transitionTime = 0;
    this.transitionDuration = 1.2;

    this.startPosition = new THREE.Vector3();
    this.targetPosition = new THREE.Vector3();

    this.startTarget = new THREE.Vector3();
    this.targetTarget = new THREE.Vector3();
    this.onTransitionComplete = null;
    this._transitionResolve = null;

    // Décalage visuel horizontal (en pixels) pour centrer la scène dans l'espace utile libre (ex: à droite du volet gauche)
    this.viewOffsetX = 0;
  }

  /**
   * Définit le décalage horizontal (en pixels) pour centrer le point de mire
   * dans la portion visible de l'écran (hors volets HUD).
   * Une valeur positive décale le centre optique vers la droite.
   * @param {number} offsetX
   */
  setViewOffset(offsetX = 0) {
    this.viewOffsetX = offsetX;
    this.updateCameraViewOffset();
  }

  /**
   * Réapplique la matrice de vue décentrée sur la caméra Three.js.
   */
  updateCameraViewOffset() {
    const width = window.innerWidth;
    const height = window.innerHeight;

    if (this.viewOffsetX !== 0 && width > 768) {
      // Décaler vers la droite dans l'écran équivaut à un offset négatif sur l'origine du sous-frustum
      this.camera.setViewOffset(width, height, -this.viewOffsetX, 0, width, height);
    } else {
      this.camera.clearViewOffset();
    }
    this.camera.updateProjectionMatrix();
  }

  /**
   * Méthode de compatibilité (la sélection par clic 3D sur wagon a été retirée).
   */
  setInteractiveObjects(_objects) {
    // Aucune interaction par clic direct sur les wagons
  }

  /**
   * Annule immediatement toute transition camera en cours et reactive les controles.
   */
  cancelTransition() {
    this.isTransitioning = false;
    this.onTransitionComplete = null;
    if (this._transitionResolve) {
      const resolve = this._transitionResolve;
      this._transitionResolve = null;
      resolve(false);
    }
    this.controls.enabled = true;
  }

  /**
   * Declenche une transition fluide vers une nouvelle position et cible
   */
  moveTo(position, target, duration = 1.2, onComplete = null) {
    if (this._transitionResolve) {
      const prevResolve = this._transitionResolve;
      this._transitionResolve = null;
      prevResolve(false);
    }

    this.startPosition.copy(this.camera.position);
    this.targetPosition.copy(position);

    this.startTarget.copy(this.controls.target);
    this.targetTarget.copy(target);

    this.transitionTime = 0;
    this.transitionDuration = Math.max(0.2, duration);
    this.onTransitionComplete = typeof onComplete === 'function' ? onComplete : null;
    this.isTransitioning = true;
    this.controls.enabled = false;
    this.updateCameraViewOffset();

    return new Promise((resolve) => {
      this._transitionResolve = resolve;
    });
  }

  /**
   * Centre la camera sur un objet precis avec un decalage d'observation
   */
  focusOnObject(object, offset = new THREE.Vector3(3.5, 2.2, 4.0), duration = 1.0) {
    const worldPos = new THREE.Vector3();
    object.getWorldPosition(worldPos);

    const targetCamPos = new THREE.Vector3().copy(worldPos).add(offset);
    this.moveTo(targetCamPos, worldPos, duration);
  }

  /**
   * Fonction d'attenuation cubique douce (ease-in-out)
   */
  _easeInOutCubic(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  /**
   * Mise a jour par frame dans la boucle requestAnimationFrame
   */
  update(deltaTime = 0.016) {
    if (this.isTransitioning) {
      this.transitionTime += deltaTime;
      const progress = Math.min(this.transitionTime / this.transitionDuration, 1.0);
      const eased = this._easeInOutCubic(progress);

      this.camera.position.lerpVectors(this.startPosition, this.targetPosition, eased);
      this.controls.target.lerpVectors(this.startTarget, this.targetTarget, eased);
      this.updateCameraViewOffset();

      if (progress >= 1.0) {
        this.isTransitioning = false;
        this.controls.enabled = true;
        const cb = this.onTransitionComplete;
        const resolve = this._transitionResolve;
        this.onTransitionComplete = null;
        this._transitionResolve = null;
        if (cb) {
          cb();
        }
        if (resolve) {
          resolve(true);
        }
      }
    }

    this.controls.update();
  }
}
