import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

/**
 * Controleur de camera cinematographique et interactif
 * Prise en charge :
 * - Mode libre : OrbitControls avec amortissement fluide
 * - Navigation guidee : Transitions lerp douces vers les positions/cibles des 7 notions
 * - Raycasting : Selection au clic des wagons avec centrage de camera
 */
export class CameraController {
  constructor(camera, domElement, onSelectBlock = null) {
    this.camera = camera;
    this.domElement = domElement;
    this.onSelectBlock = onSelectBlock;

    // Initialisation d'OrbitControls
    this.controls = new OrbitControls(this.camera, this.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.maxDistance = 65;
    this.controls.minDistance = 2.5;
    this.controls.maxPolarAngle = Math.PI / 2 - 0.02; // Evite de passer sous le plan des rails

    // Etat d'interpolation cinematographique
    this.isTransitioning = false;
    this.transitionTime = 0;
    this.transitionDuration = 1.2;

    this.startPosition = new THREE.Vector3();
    this.targetPosition = new THREE.Vector3();

    this.startTarget = new THREE.Vector3();
    this.targetTarget = new THREE.Vector3();

    // Raycasting pour la selection au clic
    this.raycaster = new THREE.Raycaster();
    this.pointer = new THREE.Vector2();
    this.interactiveObjects = [];
    this.pointerDownPos = new THREE.Vector2();

    this._setupPointerEvents();
  }

  /**
   * Definit les objets cliquables dans la scene (wagons)
   */
  setInteractiveObjects(objects) {
    this.interactiveObjects = objects;
  }

  /**
   * Ecoute des interactions pointeur pour distinguer le clic du glissement de camera
   */
  _setupPointerEvents() {
    this.domElement.addEventListener('pointerdown', (e) => {
      this.pointerDownPos.set(e.clientX, e.clientY);
    });

    this.domElement.addEventListener('pointermove', (e) => {
      if (this.interactiveObjects.length === 0) return;

      const rect = this.domElement.getBoundingClientRect();
      this.pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      this.pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      this.raycaster.setFromCamera(this.pointer, this.camera);
      const intersects = this.raycaster.intersectObjects(this.interactiveObjects, true);

      if (intersects.length > 0) {
        this.domElement.style.cursor = 'pointer';
      } else {
        this.domElement.style.cursor = 'default';
      }
    });

    this.domElement.addEventListener('pointerup', (e) => {
      // Si la distance parcourue est superieure a 5px, c'est un glissement d'orbite, pas un clic
      const dist = Math.hypot(e.clientX - this.pointerDownPos.x, e.clientY - this.pointerDownPos.y);
      if (dist > 6) return;

      const rect = this.domElement.getBoundingClientRect();
      this.pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      this.pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      this.raycaster.setFromCamera(this.pointer, this.camera);
      const intersects = this.raycaster.intersectObjects(this.interactiveObjects, true);

      if (intersects.length > 0) {
        // Remonte jusqu'au groupe wagon ou locomotive porteur des donnees
        let obj = intersects[0].object;
        while (obj && !obj.userData.blockData && !obj.userData.isLocomotive && obj.parent) {
          obj = obj.parent;
        }

        if (obj && obj.userData.blockData) {
          const blockData = obj.userData.blockData;
          this.focusOnObject(obj, new THREE.Vector3(3.5, 2.2, 4.0), 1.0);

          if (typeof this.onSelectBlock === 'function') {
            this.onSelectBlock(blockData, obj);
          }
        } else if (obj && obj.userData.isLocomotive) {
          this.focusOnObject(obj, new THREE.Vector3(3.5, 2.2, 4.0), 1.0);

          if (typeof this.onSelectBlock === 'function') {
            this.onSelectBlock({ isLocomotive: true }, obj);
          }
        }
      }
    });
  }

  /**
   * Declenche une transition fluide vers une nouvelle position et cible
   */
  moveTo(position, target, duration = 1.2) {
    this.startPosition.copy(this.camera.position);
    this.targetPosition.copy(position);

    this.startTarget.copy(this.controls.target);
    this.targetTarget.copy(target);

    this.transitionTime = 0;
    this.transitionDuration = Math.max(0.2, duration);
    this.isTransitioning = true;
    this.controls.enabled = false;
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

      if (progress >= 1.0) {
        this.isTransitioning = false;
        this.controls.enabled = true;
      }
    }

    this.controls.update();
  }
}
