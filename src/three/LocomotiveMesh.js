import * as THREE from 'three';
import { hashToColorHex } from './WagonMesh.js';

/**
 * Represente la locomotive tractant le convoi et incarnant le Bloc 0 (Genesis).
 * Metaphore : La motrice qui tire le train represente le bloc d'origine de la blockchain :
 * - Le protocole reseau et le moteur de consensus
 * - Le Bloc Genesis (#0) portant le premier sceau cryptographique
 * - L'attelage arriere distribuant l'empreinte initiale au wagon 1.
 */
export class LocomotiveMesh extends THREE.Group {
  /**
   * @param {object} [block=null] - Instance du bloc logique Genesis (#0).
   * @param {object} [options={}]
   * @param {number} [options.spacing=3.8] - Intervalle longitudinal d'attelage.
   */
  constructor(block = null, options = {}) {
    super();
    this.block = block;
    this.spacing = options.spacing || 3.8;
    this.isValid = true;

    // Empreinte chromatique du Bloc Genesis
    const hexHash = this.block ? hashToColorHex(this.block.hash) : '#38bdf8';
    this.colorHash = new THREE.Color(hexHash);

    // References de materiaux pour reactions d'etat (alerte / normal)
    this.bodyMaterials = [];
    this.beaconMaterial = null;
    this.rearRingMaterial = null;
    this.headlightSpot = null;
    this.headlightLens = null;
    this.rods = [];

    // Badges et plaques d'identification du Bloc Genesis
    this.badges = {
      center: { canvas: null, texture: null }
    };
    this.platesGroup = null;

    // Metadonnees pour l'interaction et la selection
    this.userData.isLocomotive = true;
    if (this.block) {
      this.userData.blockData = this.block;
    }

    // Construction procedurale complete de la motrice ferroviaire pure
    this.buildChassis();
    this.buildWheelsAndRods();
    this.buildBoilerAndStack();
    this.buildDriverCab();
    this.buildCowcatcherAndBuffers();
    this.buildHeadlight();
    this.buildRearSocket();
    this.buildStatusBeacon();
    this.buildPlates();

    this.renderPlates();
    this.updateStatus(true);
  }

  /**
   * Plateforme et longerons de chassis lourd.
   */
  buildChassis() {
    const chassisGeo = new THREE.BoxGeometry(2.6, 0.22, 1.28);
    const chassisMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      metalness: 0.85,
      roughness: 0.35
    });
    const chassis = new THREE.Mesh(chassisGeo, chassisMat);
    chassis.position.y = 0;
    this.add(chassis);

    // Tablier superieur de marchepied
    const deckGeo = new THREE.BoxGeometry(2.65, 0.05, 1.34);
    const deckMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      metalness: 0.9,
      roughness: 0.3
    });
    const deck = new THREE.Mesh(deckGeo, deckMat);
    deck.position.y = 0.12;
    this.add(deck);
  }

  /**
   * 6 grandes roues motrices (3 essieux) reliees par des bielles d'accouplement.
   */
  buildWheelsAndRods() {
    const wheelGeo = new THREE.CylinderGeometry(0.25, 0.25, 0.14, 24);
    const wheelMat = new THREE.MeshStandardMaterial({
      color: 0x475569,
      metalness: 0.92,
      roughness: 0.22
    });

    const xPositions = [-0.85, 0, 0.85];

    xPositions.forEach((x) => {
      // Roues gauche (+Z) et droite (-Z)
      [-0.66, 0.66].forEach((z) => {
        const wheel = new THREE.Mesh(wheelGeo, wheelMat);
        wheel.rotation.x = Math.PI / 2;
        wheel.position.set(x, -0.18, z);
        this.add(wheel);

        // Moyeu central dore / laiton
        const capGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.18, 12);
        const capMat = new THREE.MeshStandardMaterial({
          color: 0xd97706,
          metalness: 0.95,
          roughness: 0.2
        });
        const cap = new THREE.Mesh(capGeo, capMat);
        cap.rotation.x = Math.PI / 2;
        cap.position.set(x, -0.18, z);
        this.add(cap);
      });

      // Essieu transversal
      const axleGeo = new THREE.CylinderGeometry(0.045, 0.045, 1.32, 12);
      const axleMat = new THREE.MeshStandardMaterial({
        color: 0x334155,
        metalness: 0.85,
        roughness: 0.35
      });
      const axle = new THREE.Mesh(axleGeo, axleMat);
      axle.rotation.x = Math.PI / 2;
      axle.position.set(x, -0.18, 0);
      this.add(axle);
    });

    // Bielles d'accouplement laterales en acier
    [-0.74, 0.74].forEach((z) => {
      const rod = new THREE.Mesh(
        new THREE.BoxGeometry(1.7, 0.045, 0.03),
        new THREE.MeshStandardMaterial({
          color: 0x94a3b8,
          metalness: 0.95,
          roughness: 0.15
        })
      );
      rod.position.set(0, -0.18, z);
      this.rods.push(rod);
      this.add(rod);
    });
  }

  /**
   * Chaudiere cylindrique, colliers de laiton, boite a fumee, cheminee et dome.
   */
  buildBoilerAndStack() {
    const boilerRadius = 0.44;
    const boilerLength = 1.4;
    const boilerCenterX = -0.45;

    // Corps de chaudiere
    const boilerGeo = new THREE.CylinderGeometry(boilerRadius, boilerRadius, boilerLength, 24);
    const boilerMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      metalness: 0.88,
      roughness: 0.25
    });
    this.bodyMaterials.push(boilerMat);

    const boilerMesh = new THREE.Mesh(boilerGeo, boilerMat);
    boilerMesh.rotation.z = Math.PI / 2;
    boilerMesh.position.set(boilerCenterX, 0.56, 0);
    this.add(boilerMesh);

    // 4 cerclages de laiton dores
    [-0.95, -0.65, -0.35, -0.05].forEach((x) => {
      const strapGeo = new THREE.TorusGeometry(boilerRadius + 0.008, 0.016, 8, 24);
      const strapMat = new THREE.MeshStandardMaterial({
        color: 0xd97706,
        metalness: 0.95,
        roughness: 0.2,
        emissive: 0xb45309,
        emissiveIntensity: 0.2
      });
      const strap = new THREE.Mesh(strapGeo, strapMat);
      strap.rotation.y = Math.PI / 2;
      strap.position.set(x, 0.56, 0);
      this.add(strap);
    });

    // Boite a fumee et porte avant de chaudiere (vers -X)
    const doorGeo = new THREE.CylinderGeometry(boilerRadius * 0.94, boilerRadius * 0.94, 0.06, 24);
    const doorMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      metalness: 0.95,
      roughness: 0.3
    });
    const door = new THREE.Mesh(doorGeo, doorMat);
    door.rotation.z = Math.PI / 2;
    door.position.set(boilerCenterX - boilerLength / 2 - 0.02, 0.56, 0);
    this.add(door);

    // Volant de verrouillage dore sur la porte
    const latchGeo = new THREE.TorusGeometry(0.08, 0.018, 8, 16);
    const latchMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      metalness: 0.9,
      roughness: 0.2
    });
    const latch = new THREE.Mesh(latchGeo, latchMat);
    latch.rotation.y = Math.PI / 2;
    latch.position.set(boilerCenterX - boilerLength / 2 - 0.055, 0.56, 0);
    this.add(latch);

    // Cheminee industrielle avant
    const stackGeo = new THREE.CylinderGeometry(0.12, 0.09, 0.44, 16);
    const stackMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      metalness: 0.9,
      roughness: 0.3
    });
    const stack = new THREE.Mesh(stackGeo, stackMat);
    stack.position.set(-0.9, 1.15, 0);
    this.add(stack);

    // Collerette doree de la cheminee
    const stackRimGeo = new THREE.TorusGeometry(0.125, 0.024, 8, 16);
    const stackRimMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      metalness: 0.95,
      roughness: 0.2
    });
    const stackRim = new THREE.Mesh(stackRimGeo, stackRimMat);
    stackRim.rotation.x = Math.PI / 2;
    stackRim.position.set(-0.9, 1.36, 0);
    this.add(stackRim);

    // Dome vapeur
    const domeGeo = new THREE.SphereGeometry(0.16, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2);
    const domeMat = new THREE.MeshStandardMaterial({
      color: 0xd97706,
      metalness: 0.9,
      roughness: 0.2,
      emissive: 0x78350f,
      emissiveIntensity: 0.3
    });
    const dome = new THREE.Mesh(domeGeo, domeMat);
    dome.position.set(-0.4, 0.98, 0);
    this.add(dome);
  }

  /**
   * Cabine de pilotage surelevee avec vitres retro-eclairees et plaque signaletique.
   */
  buildDriverCab() {
    const cabGeo = new THREE.BoxGeometry(0.95, 1.05, 1.26);
    const cabMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      metalness: 0.85,
      roughness: 0.3
    });
    this.bodyMaterials.push(cabMat);
    const cab = new THREE.Mesh(cabGeo, cabMat);
    cab.position.set(0.72, 0.68, 0);
    this.add(cab);

    // Toit de cabine
    const roofGeo = new THREE.BoxGeometry(1.02, 0.08, 1.34);
    const roofMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      metalness: 0.9,
      roughness: 0.3
    });
    const roof = new THREE.Mesh(roofGeo, roofMat);
    roof.position.set(0.72, 1.24, 0);
    this.add(roof);

    // Pare-brise avant de cabine (tourne vers -X)
    [-0.32, 0.32].forEach((z) => {
      const winGeo = new THREE.PlaneGeometry(0.34, 0.28);
      const winMat = new THREE.MeshStandardMaterial({
        color: 0x38bdf8,
        emissive: 0x0284c7,
        emissiveIntensity: 0.6,
        roughness: 0.1,
        metalness: 0.9
      });
      const win = new THREE.Mesh(winGeo, winMat);
      win.rotation.y = -Math.PI / 2;
      win.position.set(0.24, 0.82, z);
      this.add(win);
    });

    // Fenetres laterales (+Z et -Z)
    [-0.635, 0.635].forEach((z) => {
      const sideWinGeo = new THREE.PlaneGeometry(0.38, 0.26);
      const sideWinMat = new THREE.MeshStandardMaterial({
        color: 0x38bdf8,
        emissive: 0x0284c7,
        emissiveIntensity: 0.5,
        roughness: 0.1,
        metalness: 0.9
      });
      const sideWin = new THREE.Mesh(sideWinGeo, sideWinMat);
      if (z > 0) sideWin.rotation.y = 0;
      else sideWin.rotation.y = Math.PI;
      sideWin.position.set(0.85, 0.82, z);
      this.add(sideWin);
    });
  }

  /**
   * Chasse-pierres / Chasse-belier en V et tampons ferroviaires de choc.
   */
  buildCowcatcherAndBuffers() {
    const cowcatcher = new THREE.Group();
    const plowGeo = new THREE.BoxGeometry(0.35, 0.22, 0.05);
    const plowMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      metalness: 0.95,
      roughness: 0.25
    });

    const plowL = new THREE.Mesh(plowGeo, plowMat);
    plowL.rotation.y = 0.55;
    plowL.position.set(-1.42, -0.15, 0.26);
    cowcatcher.add(plowL);

    const plowR = new THREE.Mesh(plowGeo, plowMat);
    plowR.rotation.y = -0.55;
    plowR.position.set(-1.42, -0.15, -0.26);
    cowcatcher.add(plowR);

    // Tampons de choc ferroviaires avant
    [-0.42, 0.42].forEach((z) => {
      const stem = new THREE.Mesh(
        new THREE.CylinderGeometry(0.04, 0.04, 0.18, 12),
        new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.9, roughness: 0.3 })
      );
      stem.rotation.z = Math.PI / 2;
      stem.position.set(-1.38, -0.06, z);
      cowcatcher.add(stem);

      const disk = new THREE.Mesh(
        new THREE.CylinderGeometry(0.12, 0.12, 0.04, 16),
        new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.95, roughness: 0.2 })
      );
      disk.rotation.z = Math.PI / 2;
      disk.position.set(-1.48, -0.06, z);
      cowcatcher.add(disk);
    });

    this.add(cowcatcher);
  }

  /**
   * Phare avant haute intensite avec faisceau reel SpotLight oriente sur les rails.
   */
  buildHeadlight() {
    const headlightGroup = new THREE.Group();

    const housing = new THREE.Mesh(
      new THREE.CylinderGeometry(0.16, 0.18, 0.22, 16),
      new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.95, roughness: 0.2 })
    );
    housing.rotation.z = Math.PI / 2;
    headlightGroup.add(housing);

    this.headlightLens = new THREE.Mesh(
      new THREE.CircleGeometry(0.15, 24),
      new THREE.MeshStandardMaterial({
        color: 0xfef08a,
        emissive: 0xfef08a,
        emissiveIntensity: 2.2,
        roughness: 0.1
      })
    );
    this.headlightLens.rotation.y = -Math.PI / 2;
    this.headlightLens.position.set(-0.115, 0, 0);
    headlightGroup.add(this.headlightLens);

    headlightGroup.position.set(-1.22, 0.65, 0);
    this.add(headlightGroup);

    // Faisceau SpotLight oriente vers l'avant (-X)
    this.headlightSpot = new THREE.SpotLight(0xfffbeb, 4.0, 22, Math.PI / 5, 0.45, 1.2);
    this.headlightSpot.position.set(-1.3, 0.65, 0);

    const spotTarget = new THREE.Object3D();
    spotTarget.position.set(-9.0, -0.4, 0);
    this.add(this.headlightSpot);
    this.add(spotTarget);
    this.headlightSpot.target = spotTarget;
  }

  /**
   * Prise d'attelage arriere (+X) a laquelle s'arrime le Wagon #0 (Bloc Genesis).
   */
  buildRearSocket() {
    const armGeo = new THREE.BoxGeometry(0.18, 0.16, 0.32);
    const armMat = new THREE.MeshStandardMaterial({
      color: 0x334155,
      metalness: 0.9,
      roughness: 0.3
    });
    const arm = new THREE.Mesh(armGeo, armMat);
    arm.position.set(1.38, 0, 0);
    this.add(arm);

    // Anneau de prise d'attelage arriere (Ancrage Genesis)
    const ringGeo = new THREE.CylinderGeometry(0.16, 0.16, 0.08, 24);
    this.rearRingMaterial = new THREE.MeshStandardMaterial({
      color: this.colorHash,
      emissive: this.colorHash,
      emissiveIntensity: 1.5,
      metalness: 0.3,
      roughness: 0.2
    });
    const ring = new THREE.Mesh(ringGeo, this.rearRingMaterial);
    ring.rotation.z = Math.PI / 2;
    ring.position.set(1.48, 0, 0);
    this.add(ring);
  }

  /**
   * Construit la plaque d'identification du Bloc 0 (Genesis) sur le flanc de la chaudière.
   */
  buildPlates() {
    this.platesGroup = new THREE.Group();

    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 256;
    this.badges.center.canvas = canvas;
    const tex = new THREE.CanvasTexture(canvas);
    this.badges.center.texture = tex;

    const plateGeo = new THREE.PlaneGeometry(1.2, 0.6);
    const plateMat = new THREE.MeshBasicMaterial({
      map: tex,
      transparent: true,
      side: THREE.DoubleSide
    });
    const plate = new THREE.Mesh(plateGeo, plateMat);
    // Positionnée sur le flanc droit visible (+Z) de la chaudière
    plate.position.set(-0.35, 0.65, 0.64);
    this.platesGroup.add(plate);

    this.add(this.platesGroup);
  }

  /**
   * Génère le graphisme de la plaque d'identification du Bloc Genesis (#0).
   */
  renderPlates() {
    if (!this.badges.center.canvas) return;

    const c = this.badges.center.canvas;
    const ctx = c.getContext('2d');
    const hashHex = `#${this.colorHash.getHexString()}`;

    ctx.fillStyle = this.isValid ? '#071524' : '#2b0707';
    ctx.fillRect(0, 0, c.width, c.height);

    ctx.strokeStyle = this.isValid ? hashHex : '#ef4444';
    ctx.lineWidth = 10;
    ctx.strokeRect(5, 5, c.width - 10, c.height - 10);

    ctx.fillStyle = this.isValid ? 'rgba(56, 189, 248, 0.16)' : 'rgba(239, 68, 68, 0.18)';
    ctx.fillRect(10, 10, c.width - 20, 60);

    ctx.fillStyle = this.isValid ? '#fbbf24' : '#f87171';
    ctx.font = 'bold 30px monospace';
    ctx.fillText('LOCOMOTIVE // BLOC #0', 24, 50);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '16px monospace';
    ctx.fillText('BLOC GENESIS DU CONVOI', 24, 98);

    ctx.strokeStyle = 'rgba(148, 163, 184, 0.3)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(24, 114);
    ctx.lineTo(c.width - 24, 114);
    ctx.stroke();

    ctx.fillStyle = '#cbd5e1';
    ctx.font = 'bold 20px monospace';
    ctx.fillText('SCEAU HASH (ORIGINE) :', 24, 150);

    const hashStr = this.block ? this.block.hash : '0000a89f41b2c3d4';
    ctx.fillStyle = this.isValid ? hashHex : '#ef4444';
    ctx.font = 'bold 24px monospace';
    ctx.fillText(`${hashStr.substring(0, 22)}...`, 24, 188);

    ctx.fillStyle = '#64748b';
    ctx.font = '16px monospace';
    ctx.fillText('PREVIOUS: 0000000000000000', 24, 226);

    if (this.badges.center.texture) {
      this.badges.center.texture.needsUpdate = true;
    }
  }

  /**
   * Balise d'etat lumineuse sur le toit de la cabine.
   */
  buildStatusBeacon() {
    const beaconBase = new THREE.Mesh(
      new THREE.CylinderGeometry(0.08, 0.1, 0.06, 12),
      new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.9, roughness: 0.3 })
    );
    beaconBase.position.set(0.72, 1.28, 0);
    this.add(beaconBase);

    this.beaconMaterial = new THREE.MeshStandardMaterial({
      color: 0x10b981,
      emissive: 0x10b981,
      emissiveIntensity: 1.8,
      metalness: 0.2,
      roughness: 0.1
    });
    const beacon = new THREE.Mesh(new THREE.SphereGeometry(0.075, 16, 16), this.beaconMaterial);
    beacon.position.set(0.72, 1.34, 0);
    this.add(beacon);
  }

  /**
   * Actualise l'etat visuel selon la validite de la blockchain.
   * @param {boolean} isValid
   */
  updateStatus(isValid) {
    this.isValid = isValid;

    if (this.block) {
      const hexHash = hashToColorHex(this.block.hash);
      this.colorHash.set(hexHash);
    }

    if (isValid) {
      this.bodyMaterials.forEach((mat) => {
        mat.emissive.setHex(0x000000);
        mat.emissiveIntensity = 0;
      });

      if (this.beaconMaterial) {
        this.beaconMaterial.color.setHex(0x10b981);
        this.beaconMaterial.emissive.setHex(0x10b981);
        this.beaconMaterial.emissiveIntensity = 1.8;
      }

      if (this.rearRingMaterial) {
        this.rearRingMaterial.color.copy(this.colorHash);
        this.rearRingMaterial.emissive.copy(this.colorHash);
        this.rearRingMaterial.emissiveIntensity = 1.5;
      }

      if (this.headlightSpot) {
        this.headlightSpot.intensity = 4.0;
        this.headlightSpot.color.setHex(0xfffbeb);
      }
    } else {
      this.bodyMaterials.forEach((mat) => {
        mat.emissive.setHex(0x450a0a);
        mat.emissiveIntensity = 0.35;
      });

      if (this.beaconMaterial) {
        this.beaconMaterial.color.setHex(0xef4444);
        this.beaconMaterial.emissive.setHex(0xdc2626);
        this.beaconMaterial.emissiveIntensity = 2.2;
      }

      if (this.rearRingMaterial) {
        this.rearRingMaterial.color.setHex(0xfacc15);
        this.rearRingMaterial.emissive.setHex(0xeab308);
        this.rearRingMaterial.emissiveIntensity = 2.4;
      }

      if (this.headlightSpot) {
        this.headlightSpot.intensity = 1.2;
        this.headlightSpot.color.setHex(0xf87171);
      }
    }

    this.renderPlates();
  }

  /**
   * Anime les bielles laterales pour donner vie a la motrice ferroviaire.
   * @param {number} elapsedTime
   * @param {number} [speed=0] - Vitesse de translation du convoi.
   */
  animate(elapsedTime, speed = 0) {
    const timeScale = speed > 0.5 ? elapsedTime * 8.5 : elapsedTime * 3.5;
    const offsetX = Math.sin(timeScale) * 0.05;
    const offsetY = Math.cos(timeScale) * 0.03;
    this.rods.forEach((rod) => {
      rod.position.x = offsetX;
      rod.position.y = -0.18 + offsetY;
    });
  }
}
