import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

/**
 * Gestionnaire du moteur et de la scene Three.js.
 * Configure la scene, la camera perspective, l'eclairage cinematique,
 * l'environnement ferroviaire (rails, traverses, sol) et la boucle de rendu a 60 FPS.
 */
export class TrainScene {
  /**
   * @param {HTMLCanvasElement} canvas - Element canvas HTML cible.
   */
  constructor(canvas) {
    this.canvas = canvas;

    this.sizes = {
      width: window.innerWidth,
      height: window.innerHeight
    };

    // 1. Scene Three.js
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x070b14);
    this.scene.fog = new THREE.FogExp2(0x070b14, 0.018);

    // 2. Camera perspective
    this.camera = new THREE.PerspectiveCamera(
      45,
      this.sizes.width / this.sizes.height,
      0.1,
      1000
    );
    this.camera.position.set(6, 6, 12);

    // 3. Renderer WebGL avec antialias
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(this.sizes.width, this.sizes.height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.1;

    // 4. Controles orbitaux
    this.controls = new OrbitControls(this.camera, this.canvas);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.target.set(-3.5, 0.5, 0);
    this.controls.maxPolarAngle = Math.PI / 2 - 0.05;
    this.controls.minDistance = 3;
    this.controls.maxDistance = 50;

    // 5. Horloge pour les animations
    this.clock = new THREE.Clock();
    this.updatables = [];

    // 6. Initialisation de l'eclairage et du decor ferroviaire
    this.setupLights();
    this.setupEnvironment();

    // 7. Ecouteur de redimensionnement
    this.handleResize = this.onResize.bind(this);
    window.addEventListener('resize', this.handleResize);

    // 8. Lancement de la boucle d'animation
    this.animate = this.animate.bind(this);
    requestAnimationFrame(this.animate);
  }

  /**
   * Configure l'eclairage principal, d'ambiance et de remplissage.
   */
  setupLights() {
    // Lumiere ambiante douce
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    this.scene.add(ambientLight);

    // Lumiere principale directive (clef)
    const keyLight = new THREE.DirectionalLight(0x7dd3fc, 2.0);
    keyLight.position.set(12, 16, 10);
    this.scene.add(keyLight);

    // Lumiere de contre-champ chaude pour le volume industriel
    const rimLight = new THREE.DirectionalLight(0xf59e0b, 0.7);
    rimLight.position.set(-12, -4, -10);
    this.scene.add(rimLight);

    // Halo bleute sur le convoi
    const blueFillLight = new THREE.DirectionalLight(0x38bdf8, 0.9);
    blueFillLight.position.set(0, 8, -8);
    this.scene.add(blueFillLight);
  }

  /**
   * Genere le decor ferroviaire : rails metalliques, traverses et grille industrielle.
   */
  setupEnvironment() {
    const environmentGroup = new THREE.Group();

    // Grille au sol
    const gridHelper = new THREE.GridHelper(80, 80, 0x1e293b, 0x0f172a);
    gridHelper.position.y = -0.5;
    environmentGroup.add(gridHelper);

    // Plan d'assise sombre sous les rails
    const groundGeometry = new THREE.PlaneGeometry(80, 80);
    const groundMaterial = new THREE.MeshStandardMaterial({
      color: 0x050811,
      roughness: 0.95,
      metalness: 0.1
    });
    const groundMesh = new THREE.Mesh(groundGeometry, groundMaterial);
    groundMesh.rotation.x = -Math.PI / 2;
    groundMesh.position.y = -0.52;
    environmentGroup.add(groundMesh);

    // Rails longitudinaux (axe X)
    const railLength = 80;
    const railDistance = 1.3;
    const railGeometry = new THREE.BoxGeometry(railLength, 0.12, 0.08);
    const railMaterial = new THREE.MeshStandardMaterial({
      color: 0x94a3b8,
      metalness: 0.9,
      roughness: 0.2
    });

    // Rail gauche
    const leftRail = new THREE.Mesh(railGeometry, railMaterial);
    leftRail.position.set(-10, -0.32, -railDistance / 2);
    environmentGroup.add(leftRail);

    // Rail droit
    const rightRail = new THREE.Mesh(railGeometry, railMaterial);
    rightRail.position.set(-10, -0.32, railDistance / 2);
    environmentGroup.add(rightRail);

    // Traverses ferroviaires espacees
    const sleeperCount = 70;
    const sleeperSpacing = 1.1;
    const sleeperGeometry = new THREE.BoxGeometry(0.3, 0.08, 1.9);
    const sleeperMaterial = new THREE.MeshStandardMaterial({
      color: 0x1f2937,
      roughness: 0.85,
      metalness: 0.2
    });

    const startX = -10 - (sleeperCount * sleeperSpacing) / 2;
    for (let i = 0; i < sleeperCount; i++) {
      const sleeper = new THREE.Mesh(sleeperGeometry, sleeperMaterial);
      sleeper.position.set(startX + i * sleeperSpacing, -0.42, 0);
      environmentGroup.add(sleeper);
    }

    this.scene.add(environmentGroup);
  }

  /**
   * Ajoute un objet 3D a la scene.
   * @param {THREE.Object3D} object
   */
  add(object) {
    this.scene.add(object);
  }

  /**
   * Retire un objet 3D de la scene.
   * @param {THREE.Object3D} object
   */
  remove(object) {
    this.scene.remove(object);
  }

  /**
   * Enregistre un objet ou une fonction necessitant une mise a jour a chaque frame.
   * @param {Function|{update: Function}} updatable
   */
  registerUpdatable(updatable) {
    this.updatables.push(updatable);
  }

  /**
   * Ajuste la camera et la zone de rendu au redimensionnement de la fenetre.
   */
  onResize() {
    this.sizes.width = window.innerWidth;
    this.sizes.height = window.innerHeight;

    this.camera.aspect = this.sizes.width / this.sizes.height;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(this.sizes.width, this.sizes.height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  }

  /**
   * Boucle d'animation principale (60 FPS).
   */
  animate() {
    const delta = this.clock.getDelta();
    const elapsedTime = this.clock.getElapsedTime();

    this.controls.update();

    for (let i = 0; i < this.updatables.length; i++) {
      const item = this.updatables[i];
      if (typeof item === 'function') {
        item(delta, elapsedTime);
      } else if (item && typeof item.update === 'function') {
        item.update(delta, elapsedTime);
      }
    }

    this.renderer.render(this.scene, this.camera);
    requestAnimationFrame(this.animate);
  }

  /**
   * Nettoie les ecouteurs et ressources lors de la destruction.
   */
  dispose() {
    window.removeEventListener('resize', this.handleResize);
    this.renderer.dispose();
  }
}
