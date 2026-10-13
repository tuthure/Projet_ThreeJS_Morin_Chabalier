import * as THREE from 'three';

/**
 * Represente la structure 3D procedurale d'un wagon du convoi.
 * Chaque wagon encapsule un bloc de la blockchain et adapte son etat visuel
 * selon la validite cryptographique (attelage, materiaux et eclairage d'alerte).
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

    // References de materiaux pour mutations d'etats
    this.containerMaterials = [];
    this.edgeMaterials = [];
    this.badgeCanvases = [];
    this.badgeTextures = [];

    // Assemblage procedurale du wagon
    this.buildChassis();
    this.buildWheels();
    this.buildContainers();
    this.buildCoupler();
    this.buildStatusBeacon();

    // Application de l'etat initial (valide par defaut)
    this.updateStatus(true);
  }

  /**
   * Construit la plateforme et le plancher metallique du chassis.
   */
  buildChassis() {
    const chassisGeometry = new THREE.BoxGeometry(2.5, 0.2, 1.25);
    const chassisMaterial = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      metalness: 0.85,
      roughness: 0.35
    });
    const chassis = new THREE.Mesh(chassisGeometry, chassisMaterial);
    chassis.position.y = 0;
    this.add(chassis);

    // Bords et pare-chocs metalliques
    const bumperGeometry = new THREE.BoxGeometry(2.54, 0.06, 1.3);
    const bumperMaterial = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      metalness: 0.9,
      roughness: 0.3
    });
    const bumper = new THREE.Mesh(bumperGeometry, bumperMaterial);
    bumper.position.y = -0.08;
    this.add(bumper);
  }

  /**
   * Construit les 4 essieux et roues metalliques.
   */
  buildWheels() {
    const wheelGeometry = new THREE.CylinderGeometry(0.24, 0.24, 0.14, 20);
    const wheelMaterial = new THREE.MeshStandardMaterial({
      color: 0x475569,
      metalness: 0.9,
      roughness: 0.3
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
    });

    // Essieux transversaux reliant les roues
    const axleGeometry = new THREE.CylinderGeometry(0.04, 0.04, 1.3, 12);
    const axleMaterial = new THREE.MeshStandardMaterial({
      color: 0x334155,
      metalness: 0.8,
      roughness: 0.4
    });

    [-0.8, 0.8].forEach((x) => {
      const axle = new THREE.Mesh(axleGeometry, axleMaterial);
      axle.rotation.x = Math.PI / 2;
      axle.position.set(x, -0.18, 0);
      this.add(axle);
    });
  }

  /**
   * Construit les conteneurs de donnees (transactions) transportes sur le wagon.
   */
  buildContainers() {
    const isGenesis = this.block.index === 0;

    if (isGenesis) {
      // Le bloc Genesis transporte un coffre blinde securise central
      const vaultGeometry = new THREE.BoxGeometry(2.0, 0.95, 1.05);
      const vaultMaterial = new THREE.MeshStandardMaterial({
        color: 0x0f172a,
        metalness: 0.7,
        roughness: 0.25,
        emissive: 0x0284c7,
        emissiveIntensity: 0.2
      });
      this.containerMaterials.push(vaultMaterial);

      const vault = new THREE.Mesh(vaultGeometry, vaultMaterial);
      vault.position.y = 0.58;
      this.add(vault);

      // Aretes lumineuses du coffre Genesis
      const edges = new THREE.EdgesGeometry(vaultGeometry);
      const edgeMaterial = new THREE.LineBasicMaterial({ color: 0x38bdf8 });
      this.edgeMaterials.push(edgeMaterial);
      const edgeLines = new THREE.LineSegments(edges, edgeMaterial);
      vault.add(edgeLines);

      // Panneau lateral HUD
      this.buildSideBadge(vault, 0.95, 0.55);
    } else {
      // Les blocs standards transportent deux conteneurs de transactions distincts
      const containerPositions = [-0.58, 0.58];

      containerPositions.forEach((posX, idx) => {
        const boxGeometry = new THREE.BoxGeometry(0.95, 0.9, 1.05);
        const boxMaterial = new THREE.MeshStandardMaterial({
          color: 0x1e293b,
          metalness: 0.65,
          roughness: 0.35,
          emissive: 0x0284c7,
          emissiveIntensity: 0.2
        });
        this.containerMaterials.push(boxMaterial);

        const container = new THREE.Mesh(boxGeometry, boxMaterial);
        container.position.set(posX, 0.55, 0);
        this.add(container);

        // Aretes lumineuses
        const edges = new THREE.EdgesGeometry(boxGeometry);
        const edgeMaterial = new THREE.LineBasicMaterial({ color: 0x38bdf8 });
        this.edgeMaterials.push(edgeMaterial);
        const edgeLines = new THREE.LineSegments(edges, edgeMaterial);
        container.add(edgeLines);

        // Badge d'information sur la face avant du conteneur 1
        if (idx === 0) {
          this.buildSideBadge(container, 0.95, 0.55);
        }
      });
    }
  }

  /**
   * Genere une texture dynamique d'affichage des donnees du bloc sur le flanc du wagon.
   * @param {THREE.Mesh} parentMesh
   * @param {number} width
   * @param {number} height
   */
  buildSideBadge(parentMesh, width, height) {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 256;
    this.badgeCanvases.push(canvas);

    const texture = new THREE.CanvasTexture(canvas);
    this.badgeTextures.push(texture);

    const badgeGeometry = new THREE.PlaneGeometry(width * 0.85, height * 0.7);
    const badgeMaterial = new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
      side: THREE.DoubleSide
    });

    const badgeMesh = new THREE.Mesh(badgeGeometry, badgeMaterial);
    badgeMesh.position.set(0, 0, 0.535);
    parentMesh.add(badgeMesh);
  }

  /**
   * Reecrit le contenu textuel de la surface d'affichage HUD sur le wagon.
   */
  renderBadgeTexture() {
    for (let i = 0; i < this.badgeCanvases.length; i++) {
      const canvas = this.badgeCanvases[i];
      const ctx = canvas.getContext('2d');
      const texture = this.badgeTextures[i];

      // Fond du terminal
      ctx.fillStyle = this.isValid ? '#09182a' : '#2d0606';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Bordure
      ctx.strokeStyle = this.isValid ? '#00f5d4' : '#ef4444';
      ctx.lineWidth = 8;
      ctx.strokeRect(4, 4, canvas.width - 8, canvas.height - 8);

      // Titre
      ctx.font = 'bold 36px monospace';
      ctx.fillStyle = this.isValid ? '#38bdf8' : '#f87171';
      const title = this.block.index === 0
        ? `WAGON #0 [GENESIS]`
        : `WAGON #${this.block.index} [BLOC]`;
      ctx.fillText(title, 24, 52);

      // Statut
      ctx.font = 'bold 26px monospace';
      ctx.fillStyle = this.isValid ? '#10b981' : '#ef4444';
      ctx.fillText(`ETAT : ${this.isValid ? 'VALIDE (ATTACHE)' : 'CORROMPU (RUPTURE)'}`, 24, 94);

      // Hash du bloc
      ctx.font = '22px monospace';
      ctx.fillStyle = '#cbd5e1';
      ctx.fillText(`HASH : ${this.block.hash.substring(0, 18)}...`, 24, 136);

      // Previous Hash
      ctx.fillText(`PREV : ${this.block.previousHash.substring(0, 18)}...`, 24, 174);

      // Donnees resumees
      let dataSummary = typeof this.block.data === 'string'
        ? this.block.data
        : JSON.stringify(this.block.data);
      if (dataSummary.length > 24) {
        dataSummary = `${dataSummary.substring(0, 24)}...`;
      }
      ctx.fillStyle = '#94a3b8';
      ctx.fillText(`DATA : ${dataSummary}`, 24, 214);

      texture.needsUpdate = true;
    }
  }

  /**
   * Construit l'attelage cryptographique (coupler) reliant ce wagon au wagon precedent.
   */
  buildCoupler() {
    this.couplerGroup = new THREE.Group();

    // Le wagon Genesis (tete de convoi) n'a pas de wagon precedent auquel s'atteler
    if (this.block.index === 0) {
      // Pare-chocs avant temoin sans liaison active
      const frontAnchorGeo = new THREE.BoxGeometry(0.15, 0.16, 0.35);
      const frontAnchorMat = new THREE.MeshStandardMaterial({
        color: 0x475569,
        metalness: 0.9,
        roughness: 0.3
      });
      const frontAnchor = new THREE.Mesh(frontAnchorGeo, frontAnchorMat);
      frontAnchor.position.set(1.32, 0, 0);
      this.add(frontAnchor);
      return;
    }

    // Calcul de la distance d'attelage : de l'avant de ce wagon vers l'arriere du wagon precedent
    // Le wagon precedent est situe a +this.spacing sur l'axe X
    // Avant de ce wagon = +1.25, arriere du precedent = +this.spacing - 1.25
    // Longueur de la liaison = this.spacing - 2.5
    const linkLength = Math.max(0.6, this.spacing - 2.5);
    const linkCenterX = 1.25 + linkLength / 2;

    // Tube mecanique de guidage
    const sleeveGeometry = new THREE.CylinderGeometry(0.11, 0.11, linkLength, 16);
    const sleeveMaterial = new THREE.MeshStandardMaterial({
      color: 0x334155,
      metalness: 0.9,
      roughness: 0.3
    });
    this.couplerSleeve = new THREE.Mesh(sleeveGeometry, sleeveMaterial);
    this.couplerSleeve.rotation.z = Math.PI / 2;
    this.couplerGroup.add(this.couplerSleeve);

    // Faisceau lumineux central (symbolise le flux de confiance / lien de hash)
    const beamGeometry = new THREE.CylinderGeometry(0.065, 0.065, linkLength + 0.02, 16);
    this.couplerBeamMaterial = new THREE.MeshStandardMaterial({
      color: 0x10b981,
      emissive: 0x10b981,
      emissiveIntensity: 1.6,
      metalness: 0.2,
      roughness: 0.1
    });
    this.couplerBeam = new THREE.Mesh(beamGeometry, this.couplerBeamMaterial);
    this.couplerBeam.rotation.z = Math.PI / 2;
    this.couplerGroup.add(this.couplerBeam);

    // Anneaux magnetiques aux extremites
    const ringGeometry = new THREE.CylinderGeometry(0.14, 0.14, 0.08, 16);
    const ringMaterial = new THREE.MeshStandardMaterial({
      color: 0x64748b,
      metalness: 0.95,
      roughness: 0.2
    });

    [-linkLength / 2, linkLength / 2].forEach((xOffset) => {
      const ring = new THREE.Mesh(ringGeometry, ringMaterial);
      ring.rotation.z = Math.PI / 2;
      ring.position.x = xOffset;
      this.couplerGroup.add(ring);
    });

    this.couplerGroup.position.set(linkCenterX, 0, 0);
    this.defaultCouplerPosition = this.couplerGroup.position.clone();
    this.add(this.couplerGroup);
  }

  /**
   * Construit une balise lumineuse sur le toit du wagon.
   */
  buildStatusBeacon() {
    const beaconBaseGeo = new THREE.CylinderGeometry(0.08, 0.1, 0.06, 12);
    const beaconBaseMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      metalness: 0.9,
      roughness: 0.3
    });
    const beaconBase = new THREE.Mesh(beaconBaseGeo, beaconBaseMat);
    beaconBase.position.set(0, 1.08, 0);
    this.add(beaconBase);

    const beaconGeo = new THREE.SphereGeometry(0.07, 16, 16);
    this.beaconMaterial = new THREE.MeshStandardMaterial({
      color: 0x10b981,
      emissive: 0x10b981,
      emissiveIntensity: 1.5,
      metalness: 0.1,
      roughness: 0.1
    });
    const beacon = new THREE.Mesh(beaconGeo, this.beaconMaterial);
    beacon.position.set(0, 1.14, 0);
    this.add(beacon);
  }

  /**
   * Met a jour l'etat visuel du wagon selon la validite de la blockchain.
   * Si valide : emission douce bleu/vert, attelage parfaitement aligne et actif.
   * Si corrompu : virage en rouge d'alerte, attelage desactive ou brise physiquement.
   * @param {boolean} isValid - Statut de validite du bloc.
   */
  updateStatus(isValid) {
    this.isValid = isValid;

    if (isValid) {
      // 1. Materiaux des conteneurs en etat normal / securise
      this.containerMaterials.forEach((mat) => {
        mat.color.setHex(0x1e293b);
        mat.emissive.setHex(0x0284c7);
        mat.emissiveIntensity = 0.25;
      });

      // 2. Aretes lumineuses cyan
      this.edgeMaterials.forEach((mat) => {
        mat.color.setHex(0x38bdf8);
      });

      // 3. Balise de toit verte
      if (this.beaconMaterial) {
        this.beaconMaterial.color.setHex(0x10b981);
        this.beaconMaterial.emissive.setHex(0x10b981);
        this.beaconMaterial.emissiveIntensity = 1.4;
      }

      // 4. Attelage actif et aligne
      if (this.couplerGroup && this.couplerBeamMaterial) {
        this.couplerGroup.visible = true;
        this.couplerGroup.position.copy(this.defaultCouplerPosition);
        this.couplerGroup.rotation.z = 0;

        this.couplerBeamMaterial.color.setHex(0x10b981);
        this.couplerBeamMaterial.emissive.setHex(0x10b981);
        this.couplerBeamMaterial.emissiveIntensity = 1.6;
      }
    } else {
      // 1. Materiaux des conteneurs en alerte rouge critique
      this.containerMaterials.forEach((mat) => {
        mat.color.setHex(0x450a0a);
        mat.emissive.setHex(0xef4444);
        mat.emissiveIntensity = 0.65;
      });

      // 2. Aretes d'alerte rouge
      this.edgeMaterials.forEach((mat) => {
        mat.color.setHex(0xf87171);
      });

      // 3. Balise de toit rouge clignotante
      if (this.beaconMaterial) {
        this.beaconMaterial.color.setHex(0xef4444);
        this.beaconMaterial.emissive.setHex(0xdc2626);
        this.beaconMaterial.emissiveIntensity = 2.0;
      }

      // 4. Attelage desactive ou physiquement brise (affaissement et deconnexion)
      if (this.couplerGroup && this.couplerBeamMaterial) {
        // Rupture visible : faisceau eteint/rouge sombre, attelage decroche
        this.couplerGroup.position.y = this.defaultCouplerPosition.y - 0.22;
        this.couplerGroup.rotation.z = -0.18; // Inclinaison de cassure

        this.couplerBeamMaterial.color.setHex(0x7f1d1d);
        this.couplerBeamMaterial.emissive.setHex(0x7f1d1d);
        this.couplerBeamMaterial.emissiveIntensity = 0.2;
      }
    }

    // Rafraichit la texture HUD sur le flanc du wagon
    this.renderBadgeTexture();
  }
}
