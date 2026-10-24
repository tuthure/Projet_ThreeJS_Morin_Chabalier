import * as THREE from 'three';

/**
 * Decor ferroviaire dynamique et defilement continu.
 * Gere les rails longitudinaux, les traverses recyclables, les poteaux telegraphiques
 * avec lanternes et l'emission de vapeur de la locomotive.
 * Optimise pour 60 FPS sans allocation memoire a chaque frame.
 */
export class Environment {
  /**
   * @param {THREE.Scene} scene - Scene Three.js principale
   */
  constructor(scene) {
    this.scene = scene;
    this.group = new THREE.Group();
    this.scene.add(this.group);

    this.currentSpeed = 0.0;
    this.targetSpeed = 0.0;

    // Tableaux des elements mobiles a recycler
    this.sleepers = [];
    this.poles = [];
    this.steamParticles = [];

    this.railLength = 160;
    this.railDistance = 1.32;

    this.setupStaticDecor();
    this.setupDynamicSleepers();
    this.setupPoles();
    this.setupSteam();
  }

  /**
   * Cree le sol, la grille industrielle et les rails fixes longitudinaux.
   */
  setupStaticDecor() {
    // Sol sombre uniforme
    const groundGeo = new THREE.PlaneGeometry(220, 100);
    const groundMat = new THREE.MeshStandardMaterial({
      color: 0x050811,
      roughness: 0.95,
      metalness: 0.1
    });
    const groundMesh = new THREE.Mesh(groundGeo, groundMat);
    groundMesh.rotation.x = -Math.PI / 2;
    groundMesh.position.y = -0.52;
    groundMesh.receiveShadow = true;
    this.group.add(groundMesh);

    // Grille au sol industrielle
    const gridHelper = new THREE.GridHelper(160, 80, 0x1e293b, 0x0c1322);
    gridHelper.position.y = -0.5;
    this.group.add(gridHelper);

    // Ballast sureleve en gravier sombre sous la voie
    const ballastGeo = new THREE.BoxGeometry(this.railLength, 0.14, 2.6);
    const ballastMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.98,
      metalness: 0.05
    });
    const ballast = new THREE.Mesh(ballastGeo, ballastMat);
    ballast.position.set(0, -0.47, 0);
    this.group.add(ballast);

    // Rails metalliques longitudinaux
    const railGeo = new THREE.BoxGeometry(this.railLength, 0.12, 0.08);
    const railMat = new THREE.MeshStandardMaterial({
      color: 0x94a3b8,
      metalness: 0.9,
      roughness: 0.2
    });

    const railLeft = new THREE.Mesh(railGeo, railMat);
    railLeft.position.set(0, -0.32, -this.railDistance / 2);
    this.group.add(railLeft);

    const railRight = new THREE.Mesh(railGeo, railMat);
    railRight.position.set(0, -0.32, this.railDistance / 2);
    this.group.add(railRight);
  }

  /**
   * Instancie les traverses de bois qui defileront en boucle infinie.
   */
  setupDynamicSleepers() {
    this.sleeperCount = 130;
    this.sleeperSpacing = 1.1;
    this.totalSleepersWidth = this.sleeperCount * this.sleeperSpacing;
    this.sleeperMinX = -this.totalSleepersWidth / 2;

    const sleeperGeo = new THREE.BoxGeometry(0.32, 0.08, 2.1);
    const sleeperMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.85,
      metalness: 0.2
    });

    for (let i = 0; i < this.sleeperCount; i++) {
      const sleeper = new THREE.Mesh(sleeperGeo, sleeperMat);
      sleeper.position.set(this.sleeperMinX + i * this.sleeperSpacing, -0.41, 0);
      this.group.add(sleeper);
      this.sleepers.push(sleeper);
    }
  }

  /**
   * Cree des poteaux telegraphiques rythmant le decor sur les bas-cotes.
   */
  setupPoles() {
    this.poleCount = 18;
    this.poleSpacing = 9.0;
    this.totalPolesWidth = this.poleCount * this.poleSpacing;
    this.poleMinX = -this.totalPolesWidth / 2;

    const poleMat = new THREE.MeshStandardMaterial({
      color: 0x334155,
      roughness: 0.7,
      metalness: 0.3
    });
    const lampMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x0284c7,
      emissiveIntensity: 0.8,
      roughness: 0.3
    });

    for (let i = 0; i < this.poleCount; i++) {
      const poleGroup = new THREE.Group();

      // Mat vertical
      const mastGeo = new THREE.CylinderGeometry(0.06, 0.08, 4.2, 8);
      const mast = new THREE.Mesh(mastGeo, poleMat);
      mast.position.y = 1.6;
      poleGroup.add(mast);

      // Bras horizontal superieur
      const armGeo = new THREE.BoxGeometry(0.08, 0.08, 1.2);
      const arm = new THREE.Mesh(armGeo, poleMat);
      arm.position.set(0, 3.4, 0);
      poleGroup.add(arm);

      // Petite lanterne lumineuse
      const lampGeo = new THREE.SphereGeometry(0.09, 8, 8);
      const lamp = new THREE.Mesh(lampGeo, lampMat);
      lamp.position.set(0, 3.3, 0.5);
      poleGroup.add(lamp);

      // Alternance de part et d'autre de la voie
      const sideZ = i % 2 === 0 ? -3.6 : 3.6;
      poleGroup.position.set(this.poleMinX + i * this.poleSpacing, -0.5, sideZ);

      this.group.add(poleGroup);
      this.poles.push(poleGroup);
    }
  }

  /**
   * Prepare un pool de particules de vapeur recyclees.
   */
  setupSteam() {
    this.steamCount = 20;
    const steamGeo = new THREE.SphereGeometry(0.18, 6, 6);
    const steamMat = new THREE.MeshStandardMaterial({
      color: 0x94a3b8,
      transparent: true,
      opacity: 0.35,
      roughness: 1.0,
      metalness: 0.0
    });

    for (let i = 0; i < this.steamCount; i++) {
      const puff = new THREE.Mesh(steamGeo, steamMat.clone());
      puff.visible = false;
      puff.userData = {
        age: i * 0.12,
        lifetime: 2.2
      };
      this.group.add(puff);
      this.steamParticles.push(puff);
    }
  }

  /**
   * Definit la vitesse cible du convoi (0 = a l'arret, > 0 = en mouvement).
   * @param {number} target - Vitesse en unites/seconde.
   * @param {boolean} [instant=false] - Application immediate sans transition.
   */
  setSpeed(target, instant = false) {
    this.targetSpeed = Math.max(0, target);
    if (instant) {
      this.currentSpeed = this.targetSpeed;
    }
  }

  /**
   * Met a jour le defilement des traverses, des poteaux et de la vapeur.
   * @param {number} delta - Temps ecoule en secondes.
   * @param {number} elapsedTime - Temps global en secondes.
   */
  update(delta, elapsedTime) {
    // Transition fluide vers la vitesse cible
    this.currentSpeed = THREE.MathUtils.lerp(this.currentSpeed, this.targetSpeed, delta * 2.5);

    if (this.currentSpeed > 0.01) {
      const shift = this.currentSpeed * delta;

      // 1. Defilement et recyclage des traverses
      for (let i = 0; i < this.sleepers.length; i++) {
        const sleeper = this.sleepers[i];
        sleeper.position.x -= shift;
        if (sleeper.position.x < this.sleeperMinX) {
          sleeper.position.x += this.totalSleepersWidth;
        }
      }

      // 2. Defilement et recyclage des poteaux
      for (let i = 0; i < this.poles.length; i++) {
        const pole = this.poles[i];
        pole.position.x -= shift;
        if (pole.position.x < this.poleMinX) {
          pole.position.x += this.totalPolesWidth;
        }
      }

      // 3. Animation de la vapeur de la locomotive
      const chimneyPos = { x: -2.3, y: 1.6, z: 0 };
      for (let i = 0; i < this.steamParticles.length; i++) {
        const puff = this.steamParticles[i];
        puff.userData.age += delta;

        if (puff.userData.age >= puff.userData.lifetime) {
          puff.userData.age = 0;
          puff.position.set(
            chimneyPos.x + (Math.random() - 0.5) * 0.1,
            chimneyPos.y,
            chimneyPos.z + (Math.random() - 0.5) * 0.1
          );
          puff.scale.setScalar(0.4 + Math.random() * 0.3);
          puff.material.opacity = 0.4;
          puff.visible = true;
        } else {
          const progress = puff.userData.age / puff.userData.lifetime;
          puff.position.x -= shift * 0.95;
          puff.position.y += delta * 0.6;
          const scale = 0.5 + progress * 2.2;
          puff.scale.setScalar(scale);
          puff.material.opacity = (1 - progress) * 0.35;
        }
      }
    } else {
      // Masquer la vapeur a l'arret
      for (let i = 0; i < this.steamParticles.length; i++) {
        this.steamParticles[i].visible = false;
      }
    }
  }
}
