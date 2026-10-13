import * as THREE from 'three';

/**
 * Represente la structure 3D procedurale d'un wagon du convoi ferroviaire blinde.
 * Metaphore : Un wagon aux parois transparentes transportant les transactions.
 * Chaque wagon incarne un bloc de la blockchain avec 4 composants majeurs :
 * 1. Les conteneurs visibles a l'interieur (Transactions)
 * 2. L'attelage magnetique avant (previousHash)
 * 3. La plaque gravee au laser (hash du bloc)
 * 4. La molette mecanique crantee sur le flanc (nonce)
 */
export class WagonMesh extends THREE.Group {
  /**
   * @param {import('../blockchain/Block.js').Block} block - Instance du bloc associe.
   * @param {object} [options={}] - Options de configuration visuelle.
   * @param {number} [options.spacing=3.8] - Ecart entre le centre de deux wagons consecutifs.
   */
  constructor(block, options = {}) {
    super();

    this.block = block;
    this.spacing = options.spacing || 3.8;
    this.isValid = true;

    // References de materiaux pour modifications d'etat en temps reel
    this.containerMaterials = [];
    this.glassMaterials = [];
    this.edgeMaterials = [];
    this.badgeCanvases = [];
    this.badgeTextures = [];

    // References d'objets pour animations (molette, attelage)
    this.nonceWheel = null;
    this.couplerGroup = null;
    this.couplerBeam = null;
    this.couplerBeamMaterial = null;
    this.beaconMaterial = null;

    // Identifiants pour le raycaster et l'inspection interactive
    this.userData.blockData = this.block;
    this.userData.wagonMesh = this;

    // 1. Construction procedurale des composants du wagon
    this.buildChassis();
    this.buildWheels();
    this.buildCargoInterior();
    this.buildTranslucentCanopy();
    this.buildNonceWheel();
    this.buildHashPlate();
    this.buildCoupler();
    this.buildStatusBeacon();

    // 2. Application de l'etat initial (valide)
    this.updateStatus(true);
  }

  /**
   * Construit la plateforme et le chassis metallique blinde.
   */
  buildChassis() {
    const chassisGeometry = new THREE.BoxGeometry(2.6, 0.22, 1.28);
    const chassisMaterial = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      metalness: 0.85,
      roughness: 0.35
    });
    const chassis = new THREE.Mesh(chassisGeometry, chassisMaterial);
    chassis.position.y = 0;
    this.add(chassis);

    // Bords et renforts inferieurs du pare-chocs
    const bumperGeometry = new THREE.BoxGeometry(2.64, 0.08, 1.34);
    const bumperMaterial = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      metalness: 0.95,
      roughness: 0.25
    });
    const bumper = new THREE.Mesh(bumperGeometry, bumperMaterial);
    bumper.position.y = -0.09;
    this.add(bumper);

    // Plaques de plancher striees
    const deckGeometry = new THREE.BoxGeometry(2.4, 0.04, 1.15);
    const deckMaterial = new THREE.MeshStandardMaterial({
      color: 0x334155,
      metalness: 0.7,
      roughness: 0.5
    });
    const deck = new THREE.Mesh(deckGeometry, deckMaterial);
    deck.position.y = 0.12;
    this.add(deck);
  }

  /**
   * Construit les 4 essieux, roues d'acier et boites d'essieux.
   */
  buildWheels() {
    const wheelGeometry = new THREE.CylinderGeometry(0.24, 0.24, 0.14, 24);
    const wheelMaterial = new THREE.MeshStandardMaterial({
      color: 0x475569,
      metalness: 0.9,
      roughness: 0.25
    });

    const wheelPositions = [
      [-0.8, -0.18, 0.66],
      [0.8, -0.18, 0.66],
      [-0.8, -0.18, -0.66],
      [0.8, -0.18, -0.66]
    ];

    wheelPositions.forEach(([x, y, z]) => {
      const wheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
      wheel.rotation.x = Math.PI / 2;
      wheel.position.set(x, y, z);
      this.add(wheel);

      // Boite d'essieu metallique (moyeu)
      const capGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.18, 12);
      const capMat = new THREE.MeshStandardMaterial({
        color: 0x94a3b8,
        metalness: 0.95,
        roughness: 0.2
      });
      const cap = new THREE.Mesh(capGeo, capMat);
      cap.rotation.x = Math.PI / 2;
      cap.position.set(x, y, z);
      this.add(cap);
    });

    // Essieux transversaux reliant les paires de roues
    const axleGeometry = new THREE.CylinderGeometry(0.045, 0.045, 1.32, 12);
    const axleMaterial = new THREE.MeshStandardMaterial({
      color: 0x334155,
      metalness: 0.85,
      roughness: 0.35
    });

    [-0.8, 0.8].forEach((x) => {
      const axle = new THREE.Mesh(axleGeometry, axleMaterial);
      axle.rotation.x = Math.PI / 2;
      axle.position.set(x, -0.18, 0);
      this.add(axle);
    });
  }

  /**
   * Construit l'interieur du wagon : les marchandises transportees (Transactions).
   * Visibles a travers les parois translucides.
   */
  buildCargoInterior() {
    this.cargoGroup = new THREE.Group();
    const isGenesis = this.block.index === 0;

    if (isGenesis) {
      // Le bloc Genesis transporte le coffre-fort d'origine de la blockchain
      const vaultGeo = new THREE.BoxGeometry(1.8, 0.75, 0.9);
      const vaultMat = new THREE.MeshStandardMaterial({
        color: 0x0f172a,
        metalness: 0.8,
        roughness: 0.2,
        emissive: 0x0284c7,
        emissiveIntensity: 0.3
      });
      this.containerMaterials.push(vaultMat);

      const vault = new THREE.Mesh(vaultGeo, vaultMat);
      vault.position.set(0, 0.52, 0);
      this.cargoGroup.add(vault);

      // Sceau dore central du bloc Genesis
      const emblemGeo = new THREE.CylinderGeometry(0.2, 0.2, 0.04, 20);
      const emblemMat = new THREE.MeshStandardMaterial({
        color: 0xf59e0b,
        metalness: 0.9,
        roughness: 0.2,
        emissive: 0xd97706,
        emissiveIntensity: 0.4
      });
      const emblem = new THREE.Mesh(emblemGeo, emblemMat);
      emblem.rotation.x = Math.PI / 2;
      emblem.position.set(0, 0.52, 0.46);
      this.cargoGroup.add(emblem);
    } else {
      // Wagons standards : 2 a 3 conteneurs / caisses de fret representant les transactions
      const crateConfigs = [
        { x: -0.62, y: 0.48, z: 0, size: [0.85, 0.7, 0.85], color: 0x0284c7 },
        { x: 0.62, y: 0.48, z: 0, size: [0.85, 0.7, 0.85], color: 0x2563eb }
      ];

      crateConfigs.forEach((cfg) => {
        const crateGeo = new THREE.BoxGeometry(...cfg.size);
        const crateMat = new THREE.MeshStandardMaterial({
          color: cfg.color,
          metalness: 0.5,
          roughness: 0.35,
          emissive: cfg.color,
          emissiveIntensity: 0.25
        });
        this.containerMaterials.push(crateMat);

        const crate = new THREE.Mesh(crateGeo, crateMat);
        crate.position.set(cfg.x, cfg.y, cfg.z);
        this.cargoGroup.add(crate);

        // Cerclages metalliques renforces sur les caisses de marchandises
        const strapGeo = new THREE.BoxGeometry(cfg.size[0] + 0.02, 0.06, cfg.size[2] + 0.02);
        const strapMat = new THREE.MeshStandardMaterial({
          color: 0x64748b,
          metalness: 0.9,
          roughness: 0.2
        });
        const strap1 = new THREE.Mesh(strapGeo, strapMat);
        strap1.position.set(cfg.x, cfg.y + 0.18, cfg.z);
        const strap2 = new THREE.Mesh(strapGeo, strapMat);
        strap2.position.set(cfg.x, cfg.y - 0.18, cfg.z);
        this.cargoGroup.add(strap1);
        this.cargoGroup.add(strap2);
      });
    }

    this.add(this.cargoGroup);
  }

  /**
   * Construit la verriere protectrice transparente du wagon.
   * Permet a tout observateur de voir les transactions transportees sans pouvoir les modifier.
   */
  buildTranslucentCanopy() {
    // Parois en verre blinde translucide
    const glassGeometry = new THREE.BoxGeometry(2.35, 0.95, 1.18);
    const glassMaterial = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.32,
      metalness: 0.1,
      roughness: 0.15,
      depthWrite: false
    });
    this.glassMaterials.push(glassMaterial);

    const canopy = new THREE.Mesh(glassGeometry, glassMaterial);
    canopy.position.set(0, 0.6, 0);
    this.add(canopy);

    // Armature metallique aux aretes (montants structurels)
    const edgesGeo = new THREE.EdgesGeometry(glassGeometry);
    const edgeMaterial = new THREE.LineBasicMaterial({
      color: 0x38bdf8,
      linewidth: 2
    });
    this.edgeMaterials.push(edgeMaterial);

    const edgeSegments = new THREE.LineSegments(edgesGeo, edgeMaterial);
    canopy.add(edgeSegments);

    // Montants verticaux aux 4 coins
    const pillarGeo = new THREE.BoxGeometry(0.06, 0.95, 0.06);
    const pillarMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      metalness: 0.9,
      roughness: 0.2
    });

    [
      [-1.17, 0.6, -0.58],
      [1.17, 0.6, -0.58],
      [-1.17, 0.6, 0.58],
      [1.17, 0.6, 0.58]
    ].forEach(([x, y, z]) => {
      const pillar = new THREE.Mesh(pillarGeo, pillarMat);
      pillar.position.set(x, y, z);
      this.add(pillar);
    });
  }

  /**
   * Construit la molette mecanique crantee du Nonce sur le flanc du wagon.
   * Represente la valeur d'ajustement modifiee lors de la preuve de travail (minage).
   */
  buildNonceWheel() {
    this.nonceWheelGroup = new THREE.Group();

    // Support de la molette sur le flanc du chassis
    const mountGeo = new THREE.BoxGeometry(0.35, 0.32, 0.08);
    const mountMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      metalness: 0.9,
      roughness: 0.3
    });
    const mount = new THREE.Mesh(mountGeo, mountMat);
    mount.position.set(-0.45, 0.24, 0.62);
    this.nonceWheelGroup.add(mount);

    // Molette rotative crantee (engrenage en bronze/acier)
    const wheelGeo = new THREE.CylinderGeometry(0.16, 0.16, 0.06, 18);
    const wheelMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      metalness: 0.9,
      roughness: 0.25,
      emissive: 0xb45309,
      emissiveIntensity: 0.3
    });
    this.nonceWheel = new THREE.Mesh(wheelGeo, wheelMat);
    this.nonceWheel.rotation.x = Math.PI / 2;
    this.nonceWheel.position.set(-0.45, 0.24, 0.67);
    this.nonceWheelGroup.add(this.nonceWheel);

    // Axe central et cadran numerote
    const axisGeo = new THREE.CylinderGeometry(0.06, 0.06, 0.08, 12);
    const axisMat = new THREE.MeshStandardMaterial({
      color: 0x475569,
      metalness: 0.95,
      roughness: 0.2
    });
    const axis = new THREE.Mesh(axisGeo, axisMat);
    axis.rotation.x = Math.PI / 2;
    axis.position.set(-0.45, 0.24, 0.68);
    this.nonceWheelGroup.add(axis);

    this.add(this.nonceWheelGroup);
  }

  /**
   * Construit la plaque d'empreinte gravee au laser (Hash du bloc).
   * Affichee sur le flanc du wagon avec son identifiant hexadecimal.
   */
  buildHashPlate() {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 256;
    this.badgeCanvases.push(canvas);

    const texture = new THREE.CanvasTexture(canvas);
    this.badgeTextures.push(texture);

    // Plaque metallique support
    const plateGeo = new THREE.PlaneGeometry(0.95, 0.52);
    const plateMat = new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
      side: THREE.DoubleSide
    });

    const plateMesh = new THREE.Mesh(plateGeo, plateMat);
    plateMesh.position.set(0.35, 0.6, 0.605);
    this.add(plateMesh);
  }

  /**
   * Reecrit le contenu textuel et graphique de la plaque d'empreinte (HUD sur le wagon).
   */
  renderBadgeTexture() {
    for (let i = 0; i < this.badgeCanvases.length; i++) {
      const canvas = this.badgeCanvases[i];
      const ctx = canvas.getContext('2d');
      const texture = this.badgeTextures[i];

      // Fond du cadran
      ctx.fillStyle = this.isValid ? '#071524' : '#2b0707';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Bordure technique luminescente
      ctx.strokeStyle = this.isValid ? '#00f5d4' : '#ef4444';
      ctx.lineWidth = 10;
      ctx.strokeRect(5, 5, canvas.width - 10, canvas.height - 10);

      // Titre du bloc
      ctx.font = 'bold 36px monospace';
      ctx.fillStyle = this.isValid ? '#38bdf8' : '#f87171';
      const label = this.block.index === 0
        ? 'WAGON #0 [GENESIS]'
        : `WAGON #${this.block.index} [BLOC]`;
      ctx.fillText(label, 24, 52);

      // Statut de validation
      ctx.font = 'bold 24px monospace';
      ctx.fillStyle = this.isValid ? '#10b981' : '#ef4444';
      ctx.fillText(
        `ETAT : ${this.isValid ? 'VALIDE (ATTACHE)' : 'CORROMPU (RUPTURE)'}`,
        24,
        92
      );

      // Hash du bloc (empreinte)
      ctx.font = '22px monospace';
      ctx.fillStyle = '#f1f5f9';
      ctx.fillText(`HASH : ${this.block.hash.substring(0, 16)}...`, 24, 134);

      // Previous Hash (attelage d'avant)
      ctx.fillStyle = '#94a3b8';
      ctx.fillText(`PREV : ${this.block.previousHash.substring(0, 16)}...`, 24, 172);

      // Nonce
      ctx.font = '20px monospace';
      ctx.fillStyle = '#f59e0b';
      ctx.fillText(`NONCE : ${this.block.nonce}`, 24, 212);

      texture.needsUpdate = true;
    }
  }

  /**
   * Construit l'attelage cryptographique (coupler) reliant ce wagon au wagon precedent.
   * Correspond visuellement a la liaison previousHash.
   */
  buildCoupler() {
    this.couplerGroup = new THREE.Group();

    // Le wagon Genesis (wagon de tete) n'a pas de predecesseur auquel s'accrocher
    if (this.block.index === 0) {
      const frontAnchorGeo = new THREE.BoxGeometry(0.18, 0.18, 0.4);
      const frontAnchorMat = new THREE.MeshStandardMaterial({
        color: 0x475569,
        metalness: 0.9,
        roughness: 0.3
      });
      const frontAnchor = new THREE.Mesh(frontAnchorGeo, frontAnchorMat);
      frontAnchor.position.set(1.36, 0, 0);
      this.add(frontAnchor);
      return;
    }

    // Calcul de la portee de l'attelage sur l'intervalle spacing
    const linkLength = Math.max(0.6, this.spacing - 2.6);
    const linkCenterX = 1.3 + linkLength / 2;

    // Tube protecteur mecanique
    const sleeveGeo = new THREE.CylinderGeometry(0.11, 0.11, linkLength, 16);
    const sleeveMat = new THREE.MeshStandardMaterial({
      color: 0x334155,
      metalness: 0.9,
      roughness: 0.3
    });
    this.couplerSleeve = new THREE.Mesh(sleeveGeo, sleeveMat);
    this.couplerSleeve.rotation.z = Math.PI / 2;
    this.couplerGroup.add(this.couplerSleeve);

    // Faisceau lumineux d'attelage (flux cryptographique securise)
    const beamGeo = new THREE.CylinderGeometry(0.065, 0.065, linkLength + 0.04, 16);
    this.couplerBeamMaterial = new THREE.MeshStandardMaterial({
      color: 0x10b981,
      emissive: 0x10b981,
      emissiveIntensity: 1.6,
      metalness: 0.2,
      roughness: 0.1
    });
    this.couplerBeam = new THREE.Mesh(beamGeo, this.couplerBeamMaterial);
    this.couplerBeam.rotation.z = Math.PI / 2;
    this.couplerGroup.add(this.couplerBeam);

    // Anneaux magnetiques de verrouillage
    const ringGeo = new THREE.CylinderGeometry(0.15, 0.15, 0.09, 16);
    const ringMat = new THREE.MeshStandardMaterial({
      color: 0x64748b,
      metalness: 0.95,
      roughness: 0.2
    });

    [-linkLength / 2, linkLength / 2].forEach((xOffset) => {
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.rotation.z = Math.PI / 2;
      ring.position.x = xOffset;
      this.couplerGroup.add(ring);
    });

    this.couplerGroup.position.set(linkCenterX, 0, 0);
    this.defaultCouplerPosition = this.couplerGroup.position.clone();
    this.add(this.couplerGroup);
  }

  /**
   * Construit une balise de signalisation sur le toit du wagon.
   */
  buildStatusBeacon() {
    const beaconBaseGeo = new THREE.CylinderGeometry(0.08, 0.1, 0.06, 12);
    const beaconBaseMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      metalness: 0.9,
      roughness: 0.3
    });
    const beaconBase = new THREE.Mesh(beaconBaseGeo, beaconBaseMat);
    beaconBase.position.set(0, 1.1, 0);
    this.add(beaconBase);

    const beaconGeo = new THREE.SphereGeometry(0.075, 16, 16);
    this.beaconMaterial = new THREE.MeshStandardMaterial({
      color: 0x10b981,
      emissive: 0x10b981,
      emissiveIntensity: 1.5,
      metalness: 0.1,
      roughness: 0.1
    });
    const beacon = new THREE.Mesh(beaconGeo, this.beaconMaterial);
    beacon.position.set(0, 1.16, 0);
    this.add(beacon);
  }

  /**
   * Fait tourner la molette du Nonce (utilise lors des animations de minage).
   * @param {number} angle - Angle en radians a ajouter a la rotation.
   */
  rotateNonceWheel(angle) {
    if (this.nonceWheel) {
      this.nonceWheel.rotation.y += angle;
    }
  }

  /**
   * Retourne les coordonnees 3D precises des 4 composants cles du wagon
   * pour relier les pastilles d'annotations et reperes pedagogiques (Sequence 1).
   * @returns {object} Coordonnees locales des 4 elements majeurs.
   */
  getAnnotationPoints() {
    return {
      // 1. Les marchandises / transactions au centre
      transactions: new THREE.Vector3(0, 0.55, 0),
      // 2. La molette du Nonce sur le flanc
      nonce: new THREE.Vector3(-0.45, 0.24, 0.67),
      // 3. La plaque gravee du Hash
      hash: new THREE.Vector3(0.35, 0.6, 0.62),
      // 4. L'attelage avant (previousHash)
      previousHash: this.block.index === 0
        ? new THREE.Vector3(1.36, 0, 0)
        : new THREE.Vector3(this.spacing / 2, 0, 0)
    };
  }

  /**
   * Met a jour l'etat visuel du wagon selon la validite de la blockchain.
   * Si valide : emission douce cyan/vert, attelage magnetique verrouille et actif.
   * Si corrompu : virage en rouge d'alerte, attelage desactive ou brise physiquement.
   * @param {boolean} isValid - Statut de validite du bloc.
   */
  updateStatus(isValid) {
    this.isValid = isValid;

    if (isValid) {
      // 1. Conteneurs de marchandises en etat securise
      this.containerMaterials.forEach((mat) => {
        mat.color.setHex(this.block.index === 0 ? 0x0f172a : 0x0284c7);
        mat.emissive.setHex(0x0284c7);
        mat.emissiveIntensity = 0.25;
      });

      // 2. Verriere et aretes en cyan serein
      this.glassMaterials.forEach((mat) => {
        mat.color.setHex(0x38bdf8);
        mat.opacity = 0.32;
      });
      this.edgeMaterials.forEach((mat) => {
        mat.color.setHex(0x38bdf8);
      });

      // 3. Balise de toit verte
      if (this.beaconMaterial) {
        this.beaconMaterial.color.setHex(0x10b981);
        this.beaconMaterial.emissive.setHex(0x10b981);
        this.beaconMaterial.emissiveIntensity = 1.4;
      }

      // 4. Attelage magnetique actif et aligne
      if (this.couplerGroup && this.couplerBeamMaterial) {
        this.couplerGroup.visible = true;
        this.couplerGroup.position.copy(this.defaultCouplerPosition);
        this.couplerGroup.rotation.z = 0;

        this.couplerBeamMaterial.color.setHex(0x10b981);
        this.couplerBeamMaterial.emissive.setHex(0x10b981);
        this.couplerBeamMaterial.emissiveIntensity = 1.6;
      }
    } else {
      // 1. Conteneurs en alerte rouge critique
      this.containerMaterials.forEach((mat) => {
        mat.color.setHex(0x450a0a);
        mat.emissive.setHex(0xef4444);
        mat.emissiveIntensity = 0.65;
      });

      // 2. Verriere et aretes en rouge vif d'alerte
      this.glassMaterials.forEach((mat) => {
        mat.color.setHex(0xef4444);
        mat.opacity = 0.55;
      });
      this.edgeMaterials.forEach((mat) => {
        mat.color.setHex(0xf87171);
      });

      // 3. Balise de toit rouge clignotante
      if (this.beaconMaterial) {
        this.beaconMaterial.color.setHex(0xef4444);
        this.beaconMaterial.emissive.setHex(0xdc2626);
        this.beaconMaterial.emissiveIntensity = 2.0;
      }

      // 4. Rupture physique de l'attelage (affaissement et decrochage)
      if (this.couplerGroup && this.couplerBeamMaterial) {
        this.couplerGroup.position.y = this.defaultCouplerPosition.y - 0.22;
        this.couplerGroup.rotation.z = -0.18;

        this.couplerBeamMaterial.color.setHex(0x7f1d1d);
        this.couplerBeamMaterial.emissive.setHex(0x7f1d1d);
        this.couplerBeamMaterial.emissiveIntensity = 0.2;
      }
    }

    // Rafraichit l'affichage de la plaque d'empreinte
    this.renderBadgeTexture();
  }
}
