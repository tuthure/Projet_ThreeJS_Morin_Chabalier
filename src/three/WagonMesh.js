import * as THREE from 'three';

/**
 * Fonction deterministe qui convertit une empreinte de hash en une couleur HSL vibrante et contrastee.
 * Permet a un non-initie de verifier visuellement l'egalite de deux hashs :
 * Si deux anneaux ou plaques ont la meme couleur, les empreintes sont identiques.
 * @param {string} hash - Chaine de hash ou previousHash.
 * @returns {THREE.Color} Couleur Three.js calculee.
 */
export function hashToColor(hash) {
  if (!hash || hash === '0' || hash === '') {
    // Teinte cyan par defaut pour l'origine (Genesis previousHash)
    return new THREE.Color(0x38bdf8);
  }
  let val = 0;
  for (let i = 0; i < hash.length; i++) {
    val = (val * 31 + hash.charCodeAt(i)) >>> 0;
  }
  const hue = (val % 360) / 360;
  const color = new THREE.Color();
  color.setHSL(hue, 0.85, 0.55);
  return color;
}

/**
 * Represente la structure 3D procedurale d'un wagon du convoi ferroviaire.
 * Metaphore : Un wagon aux parois transparentes transportant les transactions.
 * Agencement des informations pedagogiques :
 * - Etiquette centrale sur la verriere : Numero de bloc, HASH ACTUEL, Marchandises (TX), Nonce et Statut.
 * - Etiquette du PREVIOUS HASH : Montee directement sur la face arriere / transversale du wagon (vers l'attelage).
 * - Molette mecanique du Nonce sur le flanc avec cadran numerote.
 * - Anneaux cryptographiques aux extremites dont les couleurs correspondent quand la liaison est valide.
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

    // Couleurs cryptographiques deterministes deduites des empreintes
    this.colorHash = hashToColor(this.block.hash);
    this.colorPrevHash = hashToColor(this.block.previousHash);

    // References de materiaux pour modifications d'etat dynamiques
    this.containerMaterials = [];
    this.glassMaterials = [];
    this.edgeMaterials = [];

    // Badges textures et canevas
    this.badges = {
      center: { canvas: null, texture: null }, // Etiquette centrale (Hash actuel, TX, statut)
      prev: { canvas: null, texture: null },   // Etiquette face transversale/arriere (previousHash)
      nonce: { canvas: null, texture: null }   // Cadran numerote molette
    };

    // References d'anneaux et d'attelage pour synchronisation visuelle
    this.frontRingMaterial = null;
    this.rearRingMaterial = null;
    this.couplerBeamMaterial = null;
    this.couplerGroup = null;
    this.nonceWheel = null;
    this.beaconMaterial = null;

    // Identifiants pour le raycaster et l'inspection interactive
    this.userData.blockData = this.block;
    this.userData.wagonMesh = this;

    // 1. Assemblage procedurale du wagon
    this.buildChassis();
    this.buildWheels();
    this.buildCargoInterior();
    this.buildTranslucentCanopy();
    this.buildRearSocket();
    this.buildCoupler();
    this.buildNonceMechanism();
    this.buildPlates();
    this.buildStatusBeacon();

    // 2. Application de l'etat initial (valide)
    this.updateStatus(true);
  }

  /**
   * Construit la plateforme et le plancher du chassis metallique.
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

    // Plancher strie a l'interieur
    const deckGeometry = new THREE.BoxGeometry(2.35, 0.03, 1.15);
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
   * Construit les 4 essieux et roues metalliques.
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
   * Construit des marchandises variees et riches a l'interieur du wagon :
   * - Conteneur maritime nervure (grand colis principal orange)
   * - Caisses modulaires en bois et acier empilees avec sangles
   * - Bonbonnes cylindriques d'energie (jetons cryptographiques)
   * - Coffre-fort dore pour le bloc Genesis
   */
  buildCargoInterior() {
    this.cargoGroup = new THREE.Group();
    const isGenesis = this.block.index === 0;

    if (isGenesis) {
      // Le bloc Genesis transporte le coffre-fort d'origine de la blockchain
      const vaultGeo = new THREE.BoxGeometry(1.8, 0.75, 0.9);
      const vaultMat = new THREE.MeshStandardMaterial({
        color: 0x0f172a,
        metalness: 0.85,
        roughness: 0.2,
        emissive: 0x0284c7,
        emissiveIntensity: 0.3
      });
      this.containerMaterials.push(vaultMat);

      const vault = new THREE.Mesh(vaultGeo, vaultMat);
      vault.position.set(0, 0.52, 0);
      this.cargoGroup.add(vault);

      // Sceau dore central du coffre Genesis
      const emblemGeo = new THREE.CylinderGeometry(0.22, 0.22, 0.05, 24);
      const emblemMat = new THREE.MeshStandardMaterial({
        color: 0xf59e0b,
        metalness: 0.95,
        roughness: 0.15,
        emissive: 0xd97706,
        emissiveIntensity: 0.4
      });
      const emblem = new THREE.Mesh(emblemGeo, emblemMat);
      emblem.rotation.x = Math.PI / 2;
      emblem.position.set(0, 0.52, 0.46);
      this.cargoGroup.add(emblem);

      // Lingots / barres securisees au sommet du coffre
      for (let i = -1; i <= 1; i++) {
        const barGeo = new THREE.BoxGeometry(0.35, 0.1, 0.15);
        const barMat = new THREE.MeshStandardMaterial({
          color: 0xfbbf24,
          metalness: 0.9,
          roughness: 0.2,
          emissive: 0xb45309,
          emissiveIntensity: 0.3
        });
        const bar = new THREE.Mesh(barGeo, barMat);
        bar.position.set(i * 0.45, 0.94, 0);
        this.cargoGroup.add(bar);
      }
    } else {
      // 1. Grand conteneur maritime nervure (cote gauche, x = -0.55)
      const containerGeo = new THREE.BoxGeometry(0.85, 0.68, 0.85);
      const containerMat = new THREE.MeshStandardMaterial({
        color: 0xf97316, // Orange fret haute visibilite
        metalness: 0.65,
        roughness: 0.3,
        emissive: 0xc2410c,
        emissiveIntensity: 0.25
      });
      this.containerMaterials.push(containerMat);

      const containerMesh = new THREE.Mesh(containerGeo, containerMat);
      containerMesh.position.set(-0.55, 0.5, 0);
      this.cargoGroup.add(containerMesh);

      // Rainures de tole ondulee horizontales sur le conteneur
      for (let yOffset = -0.2; yOffset <= 0.2; yOffset += 0.12) {
        const ribGeo = new THREE.BoxGeometry(0.87, 0.03, 0.87);
        const ribMat = new THREE.MeshStandardMaterial({
          color: 0xea580c,
          metalness: 0.8,
          roughness: 0.25
        });
        const rib = new THREE.Mesh(ribGeo, ribMat);
        rib.position.set(-0.55, 0.5 + yOffset, 0);
        this.cargoGroup.add(rib);
      }

      // 2. Palette de caisses empilees en bois/acier (centre droit, x = 0.3)
      const crateBottomGeo = new THREE.BoxGeometry(0.55, 0.4, 0.7);
      const crateBottomMat = new THREE.MeshStandardMaterial({
        color: 0xd97706,
        metalness: 0.3,
        roughness: 0.7,
        emissive: 0x92400e,
        emissiveIntensity: 0.2
      });
      this.containerMaterials.push(crateBottomMat);
      const crateBottom = new THREE.Mesh(crateBottomGeo, crateBottomMat);
      crateBottom.position.set(0.28, 0.36, 0);
      this.cargoGroup.add(crateBottom);

      const crateTopGeo = new THREE.BoxGeometry(0.48, 0.32, 0.58);
      const crateTopMat = new THREE.MeshStandardMaterial({
        color: 0xb45309,
        metalness: 0.35,
        roughness: 0.65,
        emissive: 0x78350f,
        emissiveIntensity: 0.2
      });
      this.containerMaterials.push(crateTopMat);
      const crateTop = new THREE.Mesh(crateTopGeo, crateTopMat);
      crateTop.position.set(0.3, 0.72, 0.04);
      this.cargoGroup.add(crateTop);

      // Sangles metalliques de retenue sur les caisses
      const strapGeo = new THREE.BoxGeometry(0.5, 0.72, 0.03);
      const strapMat = new THREE.MeshStandardMaterial({
        color: 0x475569,
        metalness: 0.9,
        roughness: 0.3
      });
      const strap = new THREE.Mesh(strapGeo, strapMat);
      strap.position.set(0.29, 0.54, 0.36);
      this.cargoGroup.add(strap);

      // 3. Deux bonbonnes / canisters cylindriques d'energie (jetons, x = 0.85)
      [-0.26, 0.26].forEach((zPos) => {
        const canisterGeo = new THREE.CylinderGeometry(0.14, 0.14, 0.55, 16);
        const canisterMat = new THREE.MeshStandardMaterial({
          color: 0x0284c7, // Bleu cobalt haute technologie
          metalness: 0.8,
          roughness: 0.2,
          emissive: 0x0369a1,
          emissiveIntensity: 0.35
        });
        this.containerMaterials.push(canisterMat);

        const canister = new THREE.Mesh(canisterGeo, canisterMat);
        canister.position.set(0.85, 0.44, zPos);
        this.cargoGroup.add(canister);

        // Anneau neon central sur chaque bonbonne
        const ringGeo = new THREE.TorusGeometry(0.15, 0.02, 8, 20);
        const ringMat = new THREE.MeshStandardMaterial({
          color: 0x38bdf8,
          emissive: 0x38bdf8,
          emissiveIntensity: 1.2
        });
        const ring = new THREE.Mesh(ringGeo, ringMat);
        ring.rotation.x = Math.PI / 2;
        ring.position.set(0.85, 0.44, zPos);
        this.cargoGroup.add(ring);
      });
    }

    this.add(this.cargoGroup);
  }

  /**
   * Construit la verriere protectrice transparente du wagon.
   */
  buildTranslucentCanopy() {
    const glassGeometry = new THREE.BoxGeometry(2.35, 0.95, 1.18);
    const glassMaterial = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.28,
      metalness: 0.1,
      roughness: 0.15,
      depthWrite: false
    });
    this.glassMaterials.push(glassMaterial);

    const canopy = new THREE.Mesh(glassGeometry, glassMaterial);
    canopy.position.set(0, 0.6, 0);
    this.add(canopy);

    // Arêtes lumineuses cyan marquant les volumes du wagon
    const edgesGeo = new THREE.EdgesGeometry(glassGeometry);
    const edgeMaterial = new THREE.LineBasicMaterial({
      color: 0x38bdf8,
      linewidth: 2
    });
    this.edgeMaterials.push(edgeMaterial);

    const edgeSegments = new THREE.LineSegments(edgesGeo, edgeMaterial);
    canopy.add(edgeSegments);

    // Montants verticaux d'acier aux 4 coins
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
   * Construit la prise d'attelage arriere du wagon (Socket du Hash propre vers le wagon suivant).
   * L'anneau arriere prend la couleur deterministe associee a son propre hash (colorHash).
   * Comme le convoi se lit de gauche a droite, le wagon suivant se situe a droite (+X).
   */
  buildRearSocket() {
    this.rearSocketGroup = new THREE.Group();

    // Bras arriere metallique oriente vers la droite (+X)
    const armGeo = new THREE.BoxGeometry(0.18, 0.16, 0.32);
    const armMat = new THREE.MeshStandardMaterial({
      color: 0x334155,
      metalness: 0.9,
      roughness: 0.3
    });
    const arm = new THREE.Mesh(armGeo, armMat);
    arm.position.set(1.38, 0, 0);
    this.rearSocketGroup.add(arm);

    // Anneau de prise arriere : prend la couleur exacte du hash du bloc !
    const ringGeo = new THREE.CylinderGeometry(0.16, 0.16, 0.08, 24);
    this.rearRingMaterial = new THREE.MeshStandardMaterial({
      color: this.colorHash,
      emissive: this.colorHash,
      emissiveIntensity: 1.4,
      metalness: 0.3,
      roughness: 0.2
    });
    const ring = new THREE.Mesh(ringGeo, this.rearRingMaterial);
    ring.rotation.z = Math.PI / 2;
    ring.position.set(1.48, 0, 0);
    this.rearSocketGroup.add(ring);

    this.add(this.rearSocketGroup);
  }

  /**
   * Construit l'attelage cryptographique avant reliant ce wagon au precedent (previousHash).
   * L'anneau avant prend la couleur exacte du previousHash, concordant avec l'anneau arriere du precedent.
   * L'attelage s'etend vers la gauche (-X) vers le wagon precedent.
   */
  buildCoupler() {
    this.couplerGroup = new THREE.Group();

    // Le wagon Genesis n'a pas de predecesseur a sa gauche auquel s'atteler
    if (this.block.index === 0) {
      const frontAnchorGeo = new THREE.BoxGeometry(0.18, 0.18, 0.4);
      const frontAnchorMat = new THREE.MeshStandardMaterial({
        color: 0x475569,
        metalness: 0.9,
        roughness: 0.3
      });
      const frontAnchor = new THREE.Mesh(frontAnchorGeo, frontAnchorMat);
      frontAnchor.position.set(-1.36, 0, 0);
      this.add(frontAnchor);
      return;
    }

    const linkLength = Math.max(0.6, this.spacing - 2.6);
    const linkCenterX = -(1.3 + linkLength / 2);

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

    // Faisceau lumineux central (prend la couleur du previousHash)
    const beamGeo = new THREE.CylinderGeometry(0.065, 0.065, linkLength + 0.04, 16);
    this.couplerBeamMaterial = new THREE.MeshStandardMaterial({
      color: this.colorPrevHash,
      emissive: this.colorPrevHash,
      emissiveIntensity: 1.6,
      metalness: 0.2,
      roughness: 0.1
    });
    this.couplerBeam = new THREE.Mesh(beamGeo, this.couplerBeamMaterial);
    this.couplerBeam.rotation.z = Math.PI / 2;
    this.couplerGroup.add(this.couplerBeam);

    // Anneaux avant (crochet) : prennent la couleur du previousHash
    const frontRingGeo = new THREE.CylinderGeometry(0.16, 0.16, 0.08, 24);
    this.frontRingMaterial = new THREE.MeshStandardMaterial({
      color: this.colorPrevHash,
      emissive: this.colorPrevHash,
      emissiveIntensity: 1.5,
      metalness: 0.3,
      roughness: 0.2
    });

    const ringBase = new THREE.Mesh(frontRingGeo, this.frontRingMaterial);
    ringBase.rotation.z = Math.PI / 2;
    ringBase.position.x = -linkLength / 2;
    this.couplerGroup.add(ringBase);

    const ringTip = new THREE.Mesh(frontRingGeo, this.frontRingMaterial);
    ringTip.rotation.z = Math.PI / 2;
    ringTip.position.x = linkLength / 2;
    this.couplerGroup.add(ringTip);

    this.couplerGroup.position.set(linkCenterX, 0, 0);
    this.defaultCouplerPosition = this.couplerGroup.position.clone();
    this.add(this.couplerGroup);
  }

  /**
   * Construit la molette mecanique marron du Nonce sur le flanc du chassis.
   * Le nombre du nonce est directement imprime sur la face de la molette.
   */
  buildNonceMechanism() {
    this.nonceGroup = new THREE.Group();

    // Support technique monte sur le chassis
    const mountGeo = new THREE.BoxGeometry(0.32, 0.28, 0.08);
    const mountMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      metalness: 0.9,
      roughness: 0.3
    });
    const mount = new THREE.Mesh(mountGeo, mountMat);
    mount.position.set(0, 0.2, 0.63);
    this.nonceGroup.add(mount);

    // Molette rotative crantee marron metallique
    const wheelGeo = new THREE.CylinderGeometry(0.16, 0.16, 0.06, 24);
    const wheelMat = new THREE.MeshStandardMaterial({
      color: 0x78350f, // Marron bronze industriel
      metalness: 0.8,
      roughness: 0.35,
      emissive: 0x451a03,
      emissiveIntensity: 0.25
    });
    this.nonceWheel = new THREE.Mesh(wheelGeo, wheelMat);
    this.nonceWheel.rotation.x = Math.PI / 2;
    this.nonceWheel.position.set(0, 0.2, 0.68);
    this.nonceGroup.add(this.nonceWheel);

    // Disque circulaire imprime DIRECTEMENT sur la face avant de la molette marron
    const nonceCanvas = document.createElement('canvas');
    nonceCanvas.width = 256;
    nonceCanvas.height = 256;
    this.badges.nonce.canvas = nonceCanvas;
    const nonceTex = new THREE.CanvasTexture(nonceCanvas);
    this.badges.nonce.texture = nonceTex;

    const dialDiscGeo = new THREE.CircleGeometry(0.148, 32);
    const dialDiscMat = new THREE.MeshBasicMaterial({
      map: nonceTex,
      transparent: true,
      side: THREE.DoubleSide
    });
    const dialDisc = new THREE.Mesh(dialDiscGeo, dialDiscMat);
    dialDisc.position.set(0, 0.031, 0);
    dialDisc.rotation.x = -Math.PI / 2;
    this.nonceWheel.add(dialDisc);

    this.add(this.nonceGroup);
  }

  /**
   * Construit les etiquettes conformement a la demande :
   * 1. Etiquette centrale sur le flanc : contient le numero du bloc, le HASH ACTUEL, les TX et le statut.
   * 2. Etiquette PREVIOUS HASH : montee directement sur la face transversale/arriere du wagon (vers l'attelage).
   */
  buildPlates() {
    this.platesGroup = new THREE.Group();

    // 1. ETIQUETTE CENTRALE (Flanc de la verriere +Z)
    const centerCanvas = document.createElement('canvas');
    centerCanvas.width = 512;
    centerCanvas.height = 256;
    this.badges.center.canvas = centerCanvas;
    const centerTex = new THREE.CanvasTexture(centerCanvas);
    this.badges.center.texture = centerTex;

    const centerPlateGeo = new THREE.PlaneGeometry(1.15, 0.58);
    const centerPlateMat = new THREE.MeshBasicMaterial({
      map: centerTex,
      transparent: true,
      side: THREE.DoubleSide
    });
    const centerPlate = new THREE.Mesh(centerPlateGeo, centerPlateMat);
    centerPlate.position.set(0, 0.62, 0.605);
    this.platesGroup.add(centerPlate);

    // 2. ETIQUETTE PREVIOUS HASH (Montee sur la face transversale arriere vers l'attelage)
    // Seuls les wagons qui ont un predecesseur (index > 0) ont une plaque PREV HASH
    if (this.block.index > 0) {
      const prevCanvas = document.createElement('canvas');
      prevCanvas.width = 384;
      prevCanvas.height = 192;
      this.badges.prev.canvas = prevCanvas;
      const prevTex = new THREE.CanvasTexture(prevCanvas);
      this.badges.prev.texture = prevTex;

      const prevPlateGeo = new THREE.PlaneGeometry(0.78, 0.42);
      const prevPlateMat = new THREE.MeshBasicMaterial({
        map: prevTex,
        transparent: true,
        side: THREE.DoubleSide
      });
      const prevPlate = new THREE.Mesh(prevPlateGeo, prevPlateMat);
      // Parfaitement droite et orthogonale : alignee sur la face gauche vers le wagon precedent
      prevPlate.rotation.set(0, -Math.PI / 2, 0);
      prevPlate.position.set(-1.185, 0.62, 0);
      this.platesGroup.add(prevPlate);
    }

    this.add(this.platesGroup);
  }

  /**
   * Construit la balise lumineuse d'etat sur le toit du wagon.
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
   * Reecrit le contenu des plaques graphiques sur le wagon.
   */
  renderPlates() {
    const prevHex = `#${this.colorPrevHash.getHexString()}`;
    const hashHex = `#${this.colorHash.getHexString()}`;

    // 1. ETIQUETTE CENTRALE : BLOC, HASH ACTUEL, MARCHANDISES, STATUT
    if (this.badges.center.canvas) {
      const c = this.badges.center.canvas;
      const ctx = c.getContext('2d');
      ctx.fillStyle = this.isValid ? '#071524' : '#2b0707';
      ctx.fillRect(0, 0, c.width, c.height);

      ctx.strokeStyle = this.isValid ? '#00f5d4' : '#ef4444';
      ctx.lineWidth = 8;
      ctx.strokeRect(4, 4, c.width - 8, c.height - 8);

      // Titre
      ctx.fillStyle = this.isValid ? '#38bdf8' : '#f87171';
      ctx.font = 'bold 30px monospace';
      const label = this.block.index === 0
        ? 'WAGON #0 [GENESIS]'
        : `WAGON #${this.block.index} [BLOC]`;
      ctx.fillText(label, 20, 44);

      // HASH ACTUEL DU BLOC (avec couleur cryptographique dediee)
      ctx.fillStyle = this.isValid ? hashHex : '#f87171';
      ctx.font = 'bold 22px monospace';
      ctx.fillText(`HASH : ${this.block.hash.substring(0, 16)}...`, 20, 84);

      // MARCHANDISES / TRANSACTIONS
      ctx.fillStyle = '#f1f5f9';
      ctx.font = '20px monospace';
      let summary = typeof this.block.data === 'string'
        ? this.block.data.replace(/\s+/g, ' ')
        : JSON.stringify(this.block.data);
      if (summary.length > 24) summary = `${summary.substring(0, 24)}...`;
      ctx.fillText(`TX   : ${summary}`, 20, 122);

      // NONCE
      ctx.fillStyle = '#f59e0b';
      ctx.font = '20px monospace';
      ctx.fillText(`NONCE: ${this.block.nonce}`, 20, 158);

      // STATUT
      ctx.fillStyle = this.isValid ? '#10b981' : '#ef4444';
      ctx.font = 'bold 20px monospace';
      ctx.fillText(
        this.isValid ? 'ETAT : VALIDE (ATTACHE)' : 'ETAT : CORROMPU (RUPTURE)',
        20,
        198
      );

      this.badges.center.texture.needsUpdate = true;
    }

    // 2. ETIQUETTE PREVIOUS HASH (Sur la face transversale arriere, a la jonction de l'attelage)
    if (this.badges.prev.canvas) {
      const c = this.badges.prev.canvas;
      const ctx = c.getContext('2d');
      ctx.fillStyle = this.isValid ? '#061321' : '#2b0707';
      ctx.fillRect(0, 0, c.width, c.height);

      ctx.strokeStyle = this.isValid ? prevHex : '#ef4444';
      ctx.lineWidth = 8;
      ctx.strokeRect(4, 4, c.width - 8, c.height - 8);

      // Titre
      ctx.fillStyle = this.isValid ? prevHex : '#f87171';
      ctx.font = 'bold 28px monospace';
      ctx.fillText('◀ PREV HASH', 20, 48);

      // Valeur
      ctx.fillStyle = '#f1f5f9';
      ctx.font = 'bold 24px monospace';
      const prevVal = this.block.previousHash.length > 12
        ? `${this.block.previousHash.substring(0, 12)}...`
        : this.block.previousHash;
      ctx.fillText(prevVal, 20, 100);

      ctx.fillStyle = '#94a3b8';
      ctx.font = '18px monospace';
      ctx.fillText('(Sceau wagon avant)', 20, 146);

      this.badges.prev.texture.needsUpdate = true;
    }

    // 3. Cadran circulaire imprime DIRECTEMENT sur la molette marron
    if (this.badges.nonce.canvas) {
      const c = this.badges.nonce.canvas;
      const ctx = c.getContext('2d');
      ctx.clearRect(0, 0, c.width, c.height);

      // Fond circulaire de la molette marron
      ctx.beginPath();
      ctx.arc(128, 128, 122, 0, Math.PI * 2);
      ctx.fillStyle = '#451a03'; // Brun chaud metallique
      ctx.fill();

      // Bordure doree industrielle
      ctx.strokeStyle = '#d97706';
      ctx.lineWidth = 14;
      ctx.stroke();

      // Crans mecaniques autour du bord
      for (let a = 0; a < Math.PI * 2; a += Math.PI / 6) {
        const x1 = 128 + Math.cos(a) * 110;
        const y1 = 128 + Math.sin(a) * 110;
        const x2 = 128 + Math.cos(a) * 96;
        const y2 = 128 + Math.sin(a) * 96;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 4;
        ctx.stroke();
      }

      // Nombre du Nonce au centre de la molette (net et sans doublons)
      ctx.fillStyle = '#fef08a';
      ctx.font = 'bold 78px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(String(this.block.nonce), 128, 128);

      this.badges.nonce.texture.needsUpdate = true;
    }
  }

  /**
   * Fait tourner la molette du Nonce lors des operations de minage.
   * @param {number} angle - Angle en radians a ajouter a la rotation.
   */
  rotateNonceWheel(angle) {
    if (this.nonceWheel) {
      this.nonceWheel.rotation.y += angle;
    }
  }

  /**
   * Retourne les coordonnees 3D precises des 4 composants cles du wagon.
   * @returns {object} Coordonnees locales des 4 elements majeurs.
   */
  getAnnotationPoints() {
    return {
      // 1. Les marchandises / transactions au centre
      transactions: new THREE.Vector3(0, 0.55, 0),
      // 2. La molette du Nonce sur le flanc
      nonce: new THREE.Vector3(0, 0.2, 0.71),
      // 3. Le Hash actuel sur l'etiquette centrale
      hash: new THREE.Vector3(0, 0.62, 0.61),
      // 4. L'attelage avant et plaque previousHash sur la face transversale gauche
      previousHash: new THREE.Vector3(-1.185, 0.62, 0)
    };
  }

  /**
   * Met a jour l'etat visuel du wagon selon la validite de la blockchain.
   * @param {boolean} isValid - Statut de validite du bloc.
   */
  updateStatus(isValid) {
    this.isValid = isValid;

    // Recalcule les couleurs cryptographiques
    this.colorHash = hashToColor(this.block.hash);
    this.colorPrevHash = hashToColor(this.block.previousHash);

    if (isValid) {
      // 1. Conteneurs de marchandises en etat normal
      this.containerMaterials.forEach((mat) => {
        mat.emissiveIntensity = 0.25;
      });

      // 2. Verriere et aretes en cyan
      this.glassMaterials.forEach((mat) => {
        mat.color.setHex(0x38bdf8);
        mat.opacity = 0.28;
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

      // 4. Anneau arriere (couleur propre du Hash)
      if (this.rearRingMaterial) {
        this.rearRingMaterial.color.copy(this.colorHash);
        this.rearRingMaterial.emissive.copy(this.colorHash);
        this.rearRingMaterial.emissiveIntensity = 1.4;
      }

      // 5. Anneau avant et attelage (couleur du previousHash)
      if (this.frontRingMaterial) {
        this.frontRingMaterial.color.copy(this.colorPrevHash);
        this.frontRingMaterial.emissive.copy(this.colorPrevHash);
        this.frontRingMaterial.emissiveIntensity = 1.5;
      }

      if (this.couplerGroup && this.couplerBeamMaterial) {
        this.couplerGroup.visible = true;
        this.couplerGroup.position.copy(this.defaultCouplerPosition);
        this.couplerGroup.rotation.z = 0;

        this.couplerBeamMaterial.color.copy(this.colorPrevHash);
        this.couplerBeamMaterial.emissive.copy(this.colorPrevHash);
        this.couplerBeamMaterial.emissiveIntensity = 1.6;
      }
    } else {
      // 1. Conteneurs en alerte rouge
      this.containerMaterials.forEach((mat) => {
        mat.emissive.setHex(0xef4444);
        mat.emissiveIntensity = 0.65;
      });

      // 2. Verriere en alerte rouge
      this.glassMaterials.forEach((mat) => {
        mat.color.setHex(0xef4444);
        mat.opacity = 0.55;
      });
      this.edgeMaterials.forEach((mat) => {
        mat.color.setHex(0xf87171);
      });

      // 3. Balise de toit rouge
      if (this.beaconMaterial) {
        this.beaconMaterial.color.setHex(0xef4444);
        this.beaconMaterial.emissive.setHex(0xdc2626);
        this.beaconMaterial.emissiveIntensity = 2.0;
      }

      // 4. Anneau arriere vire au rouge d'alerte
      if (this.rearRingMaterial) {
        this.rearRingMaterial.color.setHex(0xef4444);
        this.rearRingMaterial.emissive.setHex(0xdc2626);
        this.rearRingMaterial.emissiveIntensity = 1.8;
      }

      // 5. Rupture physique de l'attelage
      if (this.frontRingMaterial) {
        this.frontRingMaterial.color.setHex(0x7f1d1d);
        this.frontRingMaterial.emissive.setHex(0x7f1d1d);
      }

      if (this.couplerGroup && this.couplerBeamMaterial) {
        this.couplerGroup.position.y = this.defaultCouplerPosition.y - 0.22;
        this.couplerGroup.rotation.z = 0.18;

        this.couplerBeamMaterial.color.setHex(0x7f1d1d);
        this.couplerBeamMaterial.emissive.setHex(0x7f1d1d);
        this.couplerBeamMaterial.emissiveIntensity = 0.2;
      }
    }

    // Rafraichit les plaques graphiques
    this.renderPlates();
  }
}
