import * as THREE from 'three';

/**
 * Gestionnaire du decor ferroviaire immersif et du defilement cinematique.
 * Comprend :
 * - Ciel crepusculaire profond avec etoiles scintillantes et lune stylisee
 * - Reliefs d'arriere-plan en parallaxe (montagnes lointaines et collines moyennes)
 * - Petites villes et hameaux low-poly illumines en second plan
 * - Gares de passage avec quais, marquises et panneaux le long de la voie
 * - Portails de tunnels ferroviaires en pierre et roche enjambant les rails
 * - Foret de sapins low-poly bordant la voie ferree
 * - Poteaux electriques / catenaires avec isolateurs et lanternes
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

    // Elements animes en boucle avec parallaxe
    this.sleepers = [];
    this.trees = [];
    this.poles = [];
    this.passingStations = [];
    this.tunnels = [];
    this.towns = [];
    this.midHills = [];
    this.farMountains = [];
    this.steamParticles = [];

    this.railLength = 200;
    this.railDistance = 1.32;

    this.setupSkyAndLights();
    this.setupGroundAndTracks();
    this.setupFarMountains();
    this.setupMidHills();
    this.setupTowns();
    this.setupPassingStations();
    this.setupTunnels();
    this.setupTrees();
    this.setupPoles();
    this.setupSteam();
  }

  /**
   * Ciel nocturne, etoiles scintillantes et lune veilleuse.
   */
  setupSkyAndLights() {
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

    const moonGroup = new THREE.Group();
    moonGroup.position.set(-4, 16, -45);

    const moonGeo = new THREE.SphereGeometry(2.4, 24, 24);
    const moonMat = new THREE.MeshBasicMaterial({ color: 0xfef08a });
    const moonMesh = new THREE.Mesh(moonGeo, moonMat);
    moonGroup.add(moonMesh);

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
   * Sol, ballast de gravier sureleve et rails metalliques brillants.
   */
  setupGroundAndTracks() {
    const groundGeo = new THREE.PlaneGeometry(300, 180);
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

    const ballastGeo = new THREE.BoxGeometry(this.railLength, 0.18, 3.2);
    const ballastMat = new THREE.MeshStandardMaterial({
      color: 0x273549,
      roughness: 0.9,
      metalness: 0.15
    });
    const ballast = new THREE.Mesh(ballastGeo, ballastMat);
    ballast.position.set(0, -0.45, 0);
    this.group.add(ballast);

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

    this.setupDynamicSleepers();
  }

  /**
   * Traverses en bois mobiles recyclees en continu.
   */
  setupDynamicSleepers() {
    this.sleeperCount = 150;
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
   * Montagnes lointaines avec sommets polygonaux (defilement lent).
   */
  setupFarMountains() {
    this.mountainCount = 10;
    this.mountainSpacing = 28;
    this.totalMountainsWidth = this.mountainCount * this.mountainSpacing;
    this.mountainMinX = -this.totalMountainsWidth / 2;
    this.mountainMaxX = this.totalMountainsWidth / 2;

    const mountainMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.9,
      metalness: 0.1,
      flatShading: true
    });

    const snowMat = new THREE.MeshStandardMaterial({
      color: 0x64748b,
      roughness: 0.85,
      metalness: 0.1,
      emissive: 0x1e3a5f,
      emissiveIntensity: 0.25,
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
   * Collines intermediaires plus proches (defilement moyen).
   */
  setupMidHills() {
    this.hillCount = 14;
    this.hillSpacing = 18;
    this.totalHillsWidth = this.hillCount * this.hillSpacing;
    this.hillMinX = -this.totalHillsWidth / 2;
    this.hillMaxX = this.totalHillsWidth / 2;

    const hillMat = new THREE.MeshStandardMaterial({
      color: 0x1e3a34,
      roughness: 0.92,
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
   * Petites villes low-poly en second plan (maisons eclairees, immeubles et clochers).
   */
  setupTowns() {
    this.townCount = 6;
    this.townSpacing = 36;
    this.totalTownsWidth = this.townCount * this.townSpacing;
    this.townMinX = -this.totalTownsWidth / 2;
    this.townMaxX = this.totalTownsWidth / 2;

    const wallMat1 = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.85, flatShading: true });
    const wallMat2 = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.8, flatShading: true });
    const roofMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.7, flatShading: true });
    const warmWindowMat = new THREE.MeshBasicMaterial({ color: 0xfef08a });
    const cyanWindowMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });

    const winGeo = new THREE.PlaneGeometry(0.24, 0.24);

    for (let i = 0; i < this.townCount; i++) {
      const townGroup = new THREE.Group();

      // 4 batiments par hameau avec hauteurs et largeurs variees
      const buildingConfigs = [
        { ox: -2.2, oz: -0.6, w: 1.5, h: 1.8, d: 1.3, tower: false },
        { ox: -0.3, oz: -1.4, w: 1.2, h: 3.1, d: 1.2, tower: true },
        { ox: 1.4, oz: -0.4, w: 1.7, h: 1.5, d: 1.3, tower: false },
        { ox: 3.1, oz: -1.1, w: 1.4, h: 2.3, d: 1.2, tower: false }
      ];

      buildingConfigs.forEach((cfg, bIdx) => {
        const bGroup = new THREE.Group();
        bGroup.position.set(cfg.ox, 0, cfg.oz);

        const bodyGeo = new THREE.BoxGeometry(cfg.w, cfg.h, cfg.d);
        const body = new THREE.Mesh(bodyGeo, (i + bIdx) % 2 === 0 ? wallMat1 : wallMat2);
        body.position.y = cfg.h / 2;
        bGroup.add(body);

        // Toit pyramidal low-poly
        const roofGeo = new THREE.ConeGeometry(cfg.w * 0.78, cfg.tower ? 1.1 : 0.65, 4);
        const roof = new THREE.Mesh(roofGeo, roofMat);
        roof.position.y = cfg.h + (cfg.tower ? 0.55 : 0.32);
        roof.rotation.y = Math.PI / 4;
        bGroup.add(roof);

        // Fenetres illuminees en facade (+Z)
        const rows = cfg.tower ? 3 : 2;
        for (let r = 0; r < rows; r++) {
          [-0.28, 0.28].forEach((wx, wCol) => {
            const win = new THREE.Mesh(winGeo, (r + wCol + i) % 3 === 0 ? cyanWindowMat : warmWindowMat);
            win.position.set(wx * (cfg.w * 0.7), 0.55 + r * 0.75, cfg.d / 2 + 0.02);
            bGroup.add(win);
          });
        }

        townGroup.add(bGroup);
      });

      const x = this.townMinX + i * this.townSpacing;
      const z = -11.5 - (i % 2) * 2.5;
      townGroup.position.set(x, -0.5, z);

      this.group.add(townGroup);
      this.towns.push(townGroup);
    }
  }

  /**
   * Gares de passage ferroviaires bordant directement la voie ferree.
   */
  setupPassingStations() {
    this.stationCount = 3;
    this.stationSpacing = 66;
    this.totalStationsWidth = this.stationCount * this.stationSpacing;
    this.stationMinX = -this.totalStationsWidth / 2;
    this.stationMaxX = this.totalStationsWidth / 2;

    const platformGeo = new THREE.BoxGeometry(5.6, 0.28, 1.6);
    const platformMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.85 });

    const safetyLineGeo = new THREE.BoxGeometry(5.5, 0.02, 0.08);
    const safetyLineMat = new THREE.MeshBasicMaterial({ color: 0xfacc15 });

    const buildingGeo = new THREE.BoxGeometry(2.6, 1.25, 1.0);
    const buildingMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.7 });

    const canopyGeo = new THREE.BoxGeometry(4.6, 0.1, 1.45);
    const canopyMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.7, roughness: 0.35 });

    const pillarGeo = new THREE.CylinderGeometry(0.05, 0.05, 1.4, 8);
    const pillarMat = new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.8 });

    const signGeo = new THREE.BoxGeometry(1.4, 0.28, 0.08);
    const signMat = new THREE.MeshBasicMaterial({ color: 0x0284c7 });

    const glassGeo = new THREE.PlaneGeometry(1.8, 0.48);
    const glassMat = new THREE.MeshBasicMaterial({ color: 0xfef08a });

    for (let i = 0; i < this.stationCount; i++) {
      const stGroup = new THREE.Group();

      // Quai de gare
      const platform = new THREE.Mesh(platformGeo, platformMat);
      platform.position.set(0, 0.14, 0);
      stGroup.add(platform);

      // Ligne jaune de securite en bord de quai
      const safetyLine = new THREE.Mesh(safetyLineGeo, safetyLineMat);
      safetyLine.position.set(0, 0.29, 0.7);
      stGroup.add(safetyLine);

      // Batiment voyageurs
      const building = new THREE.Mesh(buildingGeo, buildingMat);
      building.position.set(0, 0.9, -0.22);
      stGroup.add(building);

      // Baie vitree eclairee
      const glass = new THREE.Mesh(glassGeo, glassMat);
      glass.position.set(0, 0.82, 0.29);
      stGroup.add(glass);

      // Marquise / auvent de quai
      const canopy = new THREE.Mesh(canopyGeo, canopyMat);
      canopy.position.set(0, 1.65, 0.05);
      stGroup.add(canopy);

      [-1.8, 1.8].forEach((px) => {
        const pillar = new THREE.Mesh(pillarGeo, pillarMat);
        pillar.position.set(px, 0.95, 0.45);
        stGroup.add(pillar);
      });

      // Panneau indicateur de gare
      const sign = new THREE.Mesh(signGeo, signMat);
      sign.position.set(0, 1.88, 0.75);
      stGroup.add(sign);

      const x = this.stationMinX + i * this.stationSpacing + 22;
      stGroup.position.set(x, -0.5, -2.55);

      this.group.add(stGroup);
      this.passingStations.push(stGroup);
    }
  }

  /**
   * Portails et arches de tunnels ferroviaires enjambant la voie ferree.
   */
  setupTunnels() {
    this.tunnelCount = 2;
    this.tunnelSpacing = 98;
    this.totalTunnelsWidth = this.tunnelCount * this.tunnelSpacing;
    this.tunnelMinX = -this.totalTunnelsWidth / 2;
    this.tunnelMaxX = this.totalTunnelsWidth / 2;

    const stoneMat = new THREE.MeshStandardMaterial({
      color: 0x334155,
      roughness: 0.85,
      metalness: 0.15,
      flatShading: true
    });

    const darkRockMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.92,
      flatShading: true
    });

    const signalMat = new THREE.MeshBasicMaterial({ color: 0x10b981 });

    const sideWallGeo = new THREE.BoxGeometry(3.8, 3.6, 0.9);
    const topArchGeo = new THREE.BoxGeometry(3.8, 1.1, 5.4);
    const rockMassGeo = new THREE.ConeGeometry(4.2, 5.5, 6);

    for (let i = 0; i < this.tunnelCount; i++) {
      const tunnelGroup = new THREE.Group();

      // Piliers lateraux (degagement large z = -2.25 et +2.25 pour laisser passer le train au centre)
      const leftWall = new THREE.Mesh(sideWallGeo, stoneMat);
      leftWall.position.set(0, 1.8, -2.25);
      tunnelGroup.add(leftWall);

      const rightWall = new THREE.Mesh(sideWallGeo, stoneMat);
      rightWall.position.set(0, 1.8, 2.25);
      tunnelGroup.add(rightWall);

      // Linteau superieur enjambant la voie a y = 3.85
      const topArch = new THREE.Mesh(topArchGeo, stoneMat);
      topArch.position.set(0, 3.85, 0);
      tunnelGroup.add(topArch);

      // Massif rocheux adosse a l'arriere du tunnel
      const rock = new THREE.Mesh(rockMassGeo, darkRockMat);
      rock.position.set(0, 2.6, -4.2);
      tunnelGroup.add(rock);

      // Feux de signalisation ferroviaire verts sur les montants du portail
      [-1.85, 1.85].forEach((fx) => {
        const sig = new THREE.Mesh(new THREE.SphereGeometry(0.11, 8, 8), signalMat);
        sig.position.set(fx, 3.55, 1.7);
        tunnelGroup.add(sig);
      });

      const x = this.tunnelMinX + i * this.tunnelSpacing + 45;
      tunnelGroup.position.set(x, -0.5, 0);

      this.group.add(tunnelGroup);
      this.tunnels.push(tunnelGroup);
    }
  }

  /**
   * Foret de sapins low-poly bordant la voie ferree (premier et second plan).
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

      const trunk = new THREE.Mesh(trunkGeo, trunkMat);
      trunk.position.y = 0.45;
      tree.add(trunk);

      const mat = i % 2 === 0 ? foliageMat1 : foliageMat2;
      const scales = [1.0, 0.75, 0.52];
      const heights = [1.2, 1.8, 2.3];

      for (let s = 0; s < 3; s++) {
        const coneGeo = new THREE.ConeGeometry(0.7 * scales[s], 0.9 * scales[s], 6);
        const cone = new THREE.Mesh(coneGeo, mat);
        cone.position.y = heights[s];
        tree.add(cone);
      }

      const isForeground = i % 7 === 0;
      const z = isForeground ? 4.4 + (i % 3) * 0.8 : -4.2 - (i % 4) * 1.8;
      const scaleRand = 0.85 + (i % 5) * 0.15;
      tree.scale.setScalar(scaleRand);

      const x = this.treeMinX + i * this.treeSpacing;
      tree.position.set(x, -0.5, z);

      this.group.add(tree);
      this.trees.push(tree);
    }
  }

  /**
   * Poteaux electriques / catenaires avec isolateurs cyan et lanternes eclairantes.
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
      metalness: 0.4
    });
    const lampMat = new THREE.MeshStandardMaterial({
      color: 0xfef08a,
      emissive: 0xf59e0b,
      emissiveIntensity: 1.4,
      roughness: 0.2
    });
    const insulatorMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });

    const mastGeo = new THREE.CylinderGeometry(0.06, 0.08, 4.5, 8);
    const armGeo = new THREE.BoxGeometry(0.08, 0.08, 1.8);
    const insulatorGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.18, 8);
    const lampGeo = new THREE.SphereGeometry(0.1, 8, 8);

    for (let i = 0; i < this.poleCount; i++) {
      const poleGroup = new THREE.Group();

      const mast = new THREE.Mesh(mastGeo, poleMat);
      mast.position.y = 1.75;
      poleGroup.add(mast);

      const arm = new THREE.Mesh(armGeo, poleMat);
      arm.position.set(0, 3.65, 0.2);
      poleGroup.add(arm);

      // Isolateurs haute tension cyan
      [-0.5, 0.0, 0.85].forEach((oz) => {
        const ins = new THREE.Mesh(insulatorGeo, insulatorMat);
        ins.position.set(0, 3.78, oz);
        poleGroup.add(ins);
      });

      // Deux lanternes lumineuses ambrees
      [-0.55, 0.55].forEach((offsetZ) => {
        const lamp = new THREE.Mesh(lampGeo, lampMat);
        lamp.position.set(0, 3.5, offsetZ);
        poleGroup.add(lamp);
      });

      if (i % 3 === 0) {
        const light = new THREE.PointLight(0xfbbf24, 1.2, 7.0, 1.8);
        light.position.set(0, 3.3, 0);
        poleGroup.add(light);
      }

      poleGroup.position.set(this.poleMinX + i * this.poleSpacing, -0.5, -3.2);

      this.group.add(poleGroup);
      this.poles.push(poleGroup);
    }
  }

  /**
   * Panache de vapeur volumetrique emergeant precisement de la cheminee.
   * La locomotive avancant vers -X, la fumee est soufflee vers l'arriere (+X).
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
   * Met a jour le defilement continu avec effets de parallaxe.
   * @param {number} delta - Temps ecoule depuis la derniere frame.
   * @param {number} elapsedTime - Temps total en secondes.
   */
  update(delta, elapsedTime) {
    this.currentSpeed = THREE.MathUtils.lerp(this.currentSpeed, this.targetSpeed, delta * 2.8);

    if (this.currentSpeed > 0.01) {
      const shift = this.currentSpeed * delta;

      // 1. Defilement des traverses (pleine vitesse)
      for (let i = 0; i < this.sleepers.length; i++) {
        const sleeper = this.sleepers[i];
        sleeper.position.x += shift;
        if (sleeper.position.x > this.sleeperMaxX) {
          sleeper.position.x -= this.totalSleepersWidth;
        }
      }

      // 2. Defilement des arbres (pleine vitesse)
      for (let i = 0; i < this.trees.length; i++) {
        const tree = this.trees[i];
        tree.position.x += shift;
        if (tree.position.x > this.treeMaxX) {
          tree.position.x -= this.totalTreesWidth;
        }
      }

      // 3. Defilement des poteaux electriques (pleine vitesse)
      for (let i = 0; i < this.poles.length; i++) {
        const pole = this.poles[i];
        pole.position.x += shift;
        if (pole.position.x > this.poleMaxX) {
          pole.position.x -= this.totalPolesWidth;
        }
      }

      // 4. Defilement des gares de passage (pleine vitesse)
      for (let i = 0; i < this.passingStations.length; i++) {
        const st = this.passingStations[i];
        st.position.x += shift;
        if (st.position.x > this.stationMaxX) {
          st.position.x -= this.totalStationsWidth;
        }
      }

      // 5. Defilement des tunnels ferroviaires (pleine vitesse)
      for (let i = 0; i < this.tunnels.length; i++) {
        const tun = this.tunnels[i];
        tun.position.x += shift;
        if (tun.position.x > this.tunnelMaxX) {
          tun.position.x -= this.totalTunnelsWidth;
        }
      }

      // 6. Parallaxe des petites villes low-poly (vitesse 0.65x)
      const townShift = shift * 0.65;
      for (let i = 0; i < this.towns.length; i++) {
        const town = this.towns[i];
        town.position.x += townShift;
        if (town.position.x > this.townMaxX) {
          town.position.x -= this.totalTownsWidth;
        }
      }

      // 7. Parallaxe des collines intermediaires (vitesse 0.35x)
      const hillShift = shift * 0.35;
      for (let i = 0; i < this.midHills.length; i++) {
        const hill = this.midHills[i];
        hill.position.x += hillShift;
        if (hill.position.x > this.hillMaxX) {
          hill.position.x -= this.totalHillsWidth;
        }
      }

      // 8. Parallaxe des montagnes lointaines (vitesse 0.12x)
      const mtnShift = shift * 0.12;
      for (let i = 0; i < this.farMountains.length; i++) {
        const mtn = this.farMountains[i];
        mtn.position.x += mtnShift;
        if (mtn.position.x > this.mountainMaxX) {
          mtn.position.x -= this.totalMountainsWidth;
        }
      }

      // 9. Panache de vapeur sortant de la cheminee (X = -0.9, Y = 1.38)
      const chimneyX = -0.9;
      const chimneyY = 1.38;

      for (let i = 0; i < this.steamParticles.length; i++) {
        const puff = this.steamParticles[i];
        puff.userData.age += delta;

        if (puff.userData.age >= puff.userData.lifetime) {
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
          const progress = puff.userData.age / puff.userData.lifetime;
          puff.position.x += shift * 1.05 + delta * 0.4;
          puff.position.y += delta * puff.userData.driftY;
          puff.position.z += delta * puff.userData.driftZ;

          const scale = 0.35 + progress * 2.4;
          puff.scale.setScalar(scale);
          puff.material.opacity = (1 - progress) * 0.45;
        }
      }
    } else {
      const chimneyX = -0.9;
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
