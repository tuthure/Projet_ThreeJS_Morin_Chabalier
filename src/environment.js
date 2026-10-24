import * as THREE from 'three';

/**
 * Gestionnaire du decor ferroviaire immersif et du defilement cinematique.
 * Comprend :
 * - Ciel crepusculaire profond avec etoiles scintillantes et lune stylisee
 * - Reliefs d'arriere-plan en parallaxe (montagnes lointaines et collines moyennes)
 * - Foret de sapins low-poly bordant la voie ferree
 * - Poteaux telegraphiques avec lanternes chaleureuses et lueurs au sol
 * - Rails, ballast de gravier et traverses en bois contrastes
 * - Panache de vapeur volumetrique soufflant vers l'arriere du convoi (+X)
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

    // Elements animes en boucle
    this.sleepers = [];
    this.trees = [];
    this.poles = [];
    this.midHills = [];
    this.farMountains = [];
    this.steamParticles = [];

    this.railLength = 180;
    this.railDistance = 1.32;

    this.setupSkyAndLights();
    this.setupGroundAndTracks();
    this.setupFarMountains();
    this.setupMidHills();
    this.setupTrees();
    this.setupPoles();
    this.setupSteam();
  }

  /**
   * Ciel nocturne, etoiles scintillantes et lune veilleuse.
   */
  setupSkyAndLights() {
    // 1. Champ d'etoiles lointaines
    const starsCount = 450;
    const starGeo = new THREE.BufferGeometry();
    const starPositions = new Float32Array(starsCount * 3);

    for (let i = 0; i < starsCount; i++) {
      starPositions[i * 3] = (Math.random() - 0.5) * 260;
      starPositions[i * 3 + 1] = 6 + Math.random() * 60;
      starPositions[i * 3 + 2] = -35 - Math.random() * 50;
    }

    starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    const starMat = new THREE.PointsMaterial({
      color: 0x93c5fd,
      size: 0.35,
      transparent: true,
      opacity: 0.8
    });
    const stars = new THREE.Points(starGeo, starMat);
    this.group.add(stars);

    // 2. Lune stylisee et son halo
    const moonGroup = new THREE.Group();
    moonGroup.position.set(-28, 22, -45);

    const moonGeo = new THREE.SphereGeometry(2.4, 24, 24);
    const moonMat = new THREE.MeshBasicMaterial({ color: 0xfef08a });
    const moonMesh = new THREE.Mesh(moonGeo, moonMat);
    moonGroup.add(moonMesh);

    // Halo lunaire
    const haloGeo = new THREE.RingGeometry(2.6, 4.8, 32);
    const haloMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.22,
      side: THREE.DoubleSide
    });
    const haloMesh = new THREE.Mesh(haloGeo, haloMat);
    moonGroup.add(haloMesh);

    this.group.add(moonGroup);
  }

  /**
   * Sol, ballast de gravier surélevé et rails métalliques brillants.
   */
  setupGroundAndTracks() {
    // 1. Grand plan de sol paysager (vert sombre ardoise / toundra nocturne)
    const groundGeo = new THREE.PlaneGeometry(280, 160);
    const groundMat = new THREE.MeshStandardMaterial({
      color: 0x13221c,
      roughness: 0.95,
      metalness: 0.05
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.52;
    ground.receiveShadow = true;
    this.group.add(ground);

    // 2. Talus de ballast en gravier granitique sombre
    const ballastGeo = new THREE.BoxGeometry(this.railLength, 0.18, 3.2);
    const ballastMat = new THREE.MeshStandardMaterial({
      color: 0x273549,
      roughness: 0.9,
      metalness: 0.15
    });
    const ballast = new THREE.Mesh(ballastGeo, ballastMat);
    ballast.position.set(0, -0.45, 0);
    this.group.add(ballast);

    // 3. Rails d'acier vifs le long de l'axe X
    const railGeo = new THREE.BoxGeometry(this.railLength, 0.12, 0.08);
    const railMat = new THREE.MeshStandardMaterial({
      color: 0xcbd5e1,
      metalness: 0.95,
      roughness: 0.15
    });

    const railLeft = new THREE.Mesh(railGeo, railMat);
    railLeft.position.set(0, -0.32, -this.railDistance / 2);
    this.group.add(railLeft);

    const railRight = new THREE.Mesh(railGeo, railMat);
    railRight.position.set(0, -0.32, this.railDistance / 2);
    this.group.add(railRight);

    // 4. Traverses de bois contrastées (mobiles)
    this.setupDynamicSleepers();
  }

  /**
   * Traverses en bois mobiles recyclées en continu.
   */
  setupDynamicSleepers() {
    this.sleeperCount = 140;
    this.sleeperSpacing = 1.1;
    this.totalSleepersWidth = this.sleeperCount * this.sleeperSpacing;
    this.sleeperMinX = -this.totalSleepersWidth / 2;
    this.sleeperMaxX = this.totalSleepersWidth / 2;

    const sleeperGeo = new THREE.BoxGeometry(0.32, 0.09, 2.2);
    const sleeperMat = new THREE.MeshStandardMaterial({
      color: 0x452311,
      roughness: 0.85,
      metalness: 0.15
    });

    for (let i = 0; i < this.sleeperCount; i++) {
      const sleeper = new THREE.Mesh(sleeperGeo, sleeperMat);
      sleeper.position.set(this.sleeperMinX + i * this.sleeperSpacing, -0.41, 0);
      this.group.add(sleeper);
      this.sleepers.push(sleeper);
    }
  }

  /**
   * Montagnes lointaines avec sommets polygonaux (défilement lent).
   */
  setupFarMountains() {
    this.mountainCount = 10;
    this.mountainSpacing = 28;
    this.totalMountainsWidth = this.mountainCount * this.mountainSpacing;
    this.mountainMinX = -this.totalMountainsWidth / 2;
    this.mountainMaxX = this.totalMountainsWidth / 2;

    const mountainMat = new THREE.MeshStandardMaterial({
      color: 0x0f1d33,
      roughness: 0.95,
      metalness: 0.1,
      flatShading: true
    });

    const snowMat = new THREE.MeshStandardMaterial({
      color: 0x25384e,
      roughness: 0.98,
      metalness: 0.0,
      flatShading: true,
      polygonOffset: true,
      polygonOffsetFactor: -2,
      polygonOffsetUnits: -4
    });

    for (let i = 0; i < this.mountainCount; i++) {
      const mtnGroup = new THREE.Group();

      const height = 14 + Math.sin(i * 1.7) * 4;
      const radius = 12 + Math.cos(i * 2.1) * 3;
      const coneGeo = new THREE.ConeGeometry(radius, height, 7);
      const cone = new THREE.Mesh(coneGeo, mountainMat);
      cone.position.y = height / 2 - 2;
      mtnGroup.add(cone);

      // Sommet rocheux sombre et discret, sans emission ni contraste criard
      const peakRadius = radius * 0.255;
      const peakHeight = height * 0.25;
      const peakGeo = new THREE.ConeGeometry(peakRadius, peakHeight, 7);
      const peak = new THREE.Mesh(peakGeo, snowMat);
      peak.position.y = height - peakHeight / 2 - 2 + 0.04;
      mtnGroup.add(peak);

      const x = this.mountainMinX + i * this.mountainSpacing;
      const z = -38 - (i % 3) * 3;
      mtnGroup.position.set(x, -0.5, z);

      this.group.add(mtnGroup);
      this.farMountains.push(mtnGroup);
    }
  }

  /**
   * Collines intermédiaires plus proches (défilement moyen).
   */
  setupMidHills() {
    this.hillCount = 14;
    this.hillSpacing = 18;
    this.totalHillsWidth = this.hillCount * this.hillSpacing;
    this.hillMinX = -this.totalHillsWidth / 2;
    this.hillMaxX = this.totalHillsWidth / 2;

    const hillMat = new THREE.MeshStandardMaterial({
      color: 0x162c26,
      roughness: 0.95,
      metalness: 0.05,
      flatShading: true
    });

    for (let i = 0; i < this.hillCount; i++) {
      const radius = 9 + (i % 4) * 2;
      const height = 5 + (i % 3) * 1.5;
      const hillGeo = new THREE.SphereGeometry(radius, 10, 7, 0, Math.PI * 2, 0, Math.PI / 2);
      const hill = new THREE.Mesh(hillGeo, hillMat);
      hill.scale.set(1.5, height / radius, 1.0);

      const x = this.hillMinX + i * this.hillSpacing;
      const z = -18 - (i % 2) * 4;
      hill.position.set(x, -0.5, z);

      this.group.add(hill);
      this.midHills.push(hill);
    }
  }

  /**
   * Forêt de sapins low-poly bordant la voie ferree (premier et second plan).
   */
  setupTrees() {
    this.treeCount = 38;
    this.treeSpacing = 6.0;
    this.totalTreesWidth = this.treeCount * this.treeSpacing;
    this.treeMinX = -this.totalTreesWidth / 2;
    this.treeMaxX = this.totalTreesWidth / 2;

    const trunkGeo = new THREE.CylinderGeometry(0.08, 0.12, 0.9, 6);
    const trunkMat = new THREE.MeshStandardMaterial({ color: 0x3e2723, roughness: 0.9 });

    const foliageMat1 = new THREE.MeshStandardMaterial({
      color: 0x064e3b,
      roughness: 0.85,
      flatShading: true
    });
    const foliageMat2 = new THREE.MeshStandardMaterial({
      color: 0x047857,
      roughness: 0.85,
      flatShading: true
    });

    for (let i = 0; i < this.treeCount; i++) {
      const tree = new THREE.Group();

      // Troncs
      const trunk = new THREE.Mesh(trunkGeo, trunkMat);
      trunk.position.y = 0.45;
      tree.add(trunk);

      // 3 étages de cônes pour le feuillage
      const mat = i % 2 === 0 ? foliageMat1 : foliageMat2;
      const scales = [1.0, 0.75, 0.52];
      const heights = [1.2, 1.8, 2.3];

      for (let s = 0; s < 3; s++) {
        const coneGeo = new THREE.ConeGeometry(0.7 * scales[s], 0.9 * scales[s], 6);
        const cone = new THREE.Mesh(coneGeo, mat);
        cone.position.y = heights[s];
        tree.add(cone);
      }

      // Disposition : majoritairement en arrière-plan (z = -3.8 à -10), quelques-uns au premier plan
      const isForeground = i % 7 === 0;
      const z = isForeground ? 4.2 + (i % 3) * 0.8 : -3.8 - (i % 4) * 1.8;
      const scaleRand = 0.85 + (i % 5) * 0.15;
      tree.scale.setScalar(scaleRand);

      const x = this.treeMinX + i * this.treeSpacing;
      tree.position.set(x, -0.5, z);

      this.group.add(tree);
      this.trees.push(tree);
    }
  }

  /**
   * Poteaux telegraphiques avec isolateurs et lanternes eclairantes.
   */
  setupPoles() {
    this.poleCount = 18;
    this.poleSpacing = 11.0;
    this.totalPolesWidth = this.poleCount * this.poleSpacing;
    this.poleMinX = -this.totalPolesWidth / 2;
    this.poleMaxX = this.totalPolesWidth / 2;

    const poleMat = new THREE.MeshStandardMaterial({
      color: 0x475569,
      roughness: 0.7,
      metalness: 0.3
    });
    const lampMat = new THREE.MeshStandardMaterial({
      color: 0xfef08a,
      emissive: 0xf59e0b,
      emissiveIntensity: 1.4,
      roughness: 0.2
    });

    for (let i = 0; i < this.poleCount; i++) {
      const poleGroup = new THREE.Group();

      // Mât vertical
      const mastGeo = new THREE.CylinderGeometry(0.06, 0.08, 4.4, 8);
      const mast = new THREE.Mesh(mastGeo, poleMat);
      mast.position.y = 1.7;
      poleGroup.add(mast);

      // Traverse horizontale
      const armGeo = new THREE.BoxGeometry(0.08, 0.08, 1.4);
      const arm = new THREE.Mesh(armGeo, poleMat);
      arm.position.set(0, 3.6, 0);
      poleGroup.add(arm);

      // Deux lanternes lumineuses ambrées
      [-0.55, 0.55].forEach((offsetZ) => {
        const lampGeo = new THREE.SphereGeometry(0.1, 8, 8);
        const lamp = new THREE.Mesh(lampGeo, lampMat);
        lamp.position.set(0, 3.5, offsetZ);
        poleGroup.add(lamp);
      });

      // Petite source de lumiere ponctuelle sur certains poteaux
      if (i % 3 === 0) {
        const light = new THREE.PointLight(0xfbbf24, 1.2, 7.0, 1.8);
        light.position.set(0, 3.3, 0);
        poleGroup.add(light);
      }

      // Placement à droite des rails (arrière-plan immédiat z = -3.2)
      poleGroup.position.set(this.poleMinX + i * this.poleSpacing, -0.5, -3.2);

      this.group.add(poleGroup);
      this.poles.push(poleGroup);
    }
  }

  /**
   * Panache de vapeur volumétrique émergeant précisément de la cheminée.
   * La locomotive avançant vers -X, la fumée est soufflée vers l'arrière (+X).
   */
  setupSteam() {
    this.steamCount = 28;
    const steamGeo = new THREE.SphereGeometry(0.18, 8, 8);

    for (let i = 0; i < this.steamCount; i++) {
      const steamMat = new THREE.MeshStandardMaterial({
        color: 0xf1f5f9,
        transparent: true,
        opacity: 0.45,
        roughness: 0.95,
        metalness: 0.0
      });
      const puff = new THREE.Mesh(steamGeo, steamMat);
      puff.visible = false;
      puff.userData = {
        age: (i / this.steamCount) * 2.2,
        lifetime: 2.2,
        driftY: 0.4 + Math.random() * 0.3,
        driftZ: (Math.random() - 0.5) * 0.15
      };
      this.group.add(puff);
      this.steamParticles.push(puff);
    }
  }

  /**
   * Définit la vitesse cible du convoi (0 = à l'arrêt, > 0 = en mouvement).
   * @param {number} target - Vitesse en unités/seconde.
   * @param {boolean} [instant=false] - Application immédiate sans transition.
   */
  setSpeed(target, instant = false) {
    this.targetSpeed = Math.max(0, target);
    if (instant) {
      this.currentSpeed = this.targetSpeed;
    }
  }

  /**
   * Met à jour le défilement continu avec effets de parallaxe.
   * Le train faisant face à -X (gauche) et avançant vers -X,
   * tout le décor recule vers la DROITE (+X) !
   * @param {number} delta - Temps écoulé depuis la dernière frame.
   * @param {number} elapsedTime - Temps total en secondes.
   */
  update(delta, elapsedTime) {
    // Transition fluide vers la vitesse cible
    this.currentSpeed = THREE.MathUtils.lerp(this.currentSpeed, this.targetSpeed, delta * 2.8);

    if (this.currentSpeed > 0.01) {
      // Déplacement vers +X (car le train avance vers -X)
      const shift = this.currentSpeed * delta;

      // 1. Défilement des traverses (pleine vitesse)
      for (let i = 0; i < this.sleepers.length; i++) {
        const sleeper = this.sleepers[i];
        sleeper.position.x += shift;
        if (sleeper.position.x > this.sleeperMaxX) {
          sleeper.position.x -= this.totalSleepersWidth;
        }
      }

      // 2. Défilement des arbres (pleine vitesse)
      for (let i = 0; i < this.trees.length; i++) {
        const tree = this.trees[i];
        tree.position.x += shift;
        if (tree.position.x > this.treeMaxX) {
          tree.position.x -= this.totalTreesWidth;
        }
      }

      // 3. Défilement des poteaux télégraphiques (pleine vitesse)
      for (let i = 0; i < this.poles.length; i++) {
        const pole = this.poles[i];
        pole.position.x += shift;
        if (pole.position.x > this.poleMaxX) {
          pole.position.x -= this.totalPolesWidth;
        }
      }

      // 4. Parallaxe des collines intermédiaires (vitesse 0.35x)
      const hillShift = shift * 0.35;
      for (let i = 0; i < this.midHills.length; i++) {
        const hill = this.midHills[i];
        hill.position.x += hillShift;
        if (hill.position.x > this.hillMaxX) {
          hill.position.x -= this.totalHillsWidth;
        }
      }

      // 5. Parallaxe des montagnes lointaines (vitesse 0.12x)
      const mtnShift = shift * 0.12;
      for (let i = 0; i < this.farMountains.length; i++) {
        const mtn = this.farMountains[i];
        mtn.position.x += mtnShift;
        if (mtn.position.x > this.mountainMaxX) {
          mtn.position.x -= this.totalMountainsWidth;
        }
      }

      // 6. Panache de vapeur sortant de la cheminée
      // Position réelle de la cheminée : X = -4.7 (-3.8 locomotive - 0.9 cheminée), Y = 1.38, Z = 0
      const chimneyX = -4.7;
      const chimneyY = 1.38;

      for (let i = 0; i < this.steamParticles.length; i++) {
        const puff = this.steamParticles[i];
        puff.userData.age += delta;

        if (puff.userData.age >= puff.userData.lifetime) {
          // Réinitialisation à la sortie de la cheminée
          puff.userData.age = 0;
          puff.position.set(
            chimneyX + (Math.random() - 0.5) * 0.08,
            chimneyY,
            (Math.random() - 0.5) * 0.08
          );
          puff.scale.setScalar(0.35);
          puff.material.opacity = 0.5;
          puff.visible = true;
        } else {
          // La fumée est soufflée vers l'arrière du train (+X) et monte (+Y)
          const progress = puff.userData.age / puff.userData.lifetime;
          puff.position.x += shift * 1.05 + delta * 0.4;
          puff.position.y += delta * puff.userData.driftY;
          puff.position.z += delta * puff.userData.driftZ;

          // Dilatation et dissipation progressive
          const scale = 0.35 + progress * 2.4;
          puff.scale.setScalar(scale);
          puff.material.opacity = (1 - progress) * 0.45;
        }
      }
    } else {
      // Train à l'arrêt : légère volute verticale douce
      const chimneyX = -4.7;
      const chimneyY = 1.38;
      for (let i = 0; i < this.steamParticles.length; i++) {
        const puff = this.steamParticles[i];
        if (i < 4) {
          puff.visible = true;
          puff.position.x = chimneyX + Math.sin(elapsedTime * 2 + i) * 0.08;
          puff.position.y = chimneyY + (i * 0.22);
          puff.scale.setScalar(0.28 + i * 0.12);
          puff.material.opacity = 0.35 - i * 0.08;
        } else {
          puff.visible = false;
        }
      }
    }
  }
}
