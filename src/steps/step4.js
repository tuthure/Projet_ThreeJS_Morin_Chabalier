import * as THREE from 'three';

/**
 * Étape 4 : Réseau et décentralisation.
 * Métaphore : L'archipel ferroviaire décentralisé. Chaque gare représente un nœud
 * (un ordinateur qui possède une copie complète du registre).
 * Interactions :
 * 1. Propager une transaction de proche en proche (protocole Gossip séquentiel : A -> B, C -> D, E -> F).
 * 2. Cliquer sur une gare (en 3D ou via le panneau) pour l'éteindre (panne de nœud) et observer
 *    comment la transaction contourne automatiquement la gare éteinte par un autre chemin.
 */
export const step4 = {
  id: 4,
  title: 'Réseau et décentralisation',
  ctx: null,

  rafId: null,
  networkGroup: null,
  stations: [],
  links: [],
  packets: [],

  isPropagating: false,
  hasBroadcasted: false,
  txCount: 3,
  lastTxLabel: '50 caisses de matériel (Gare A)',
  lastRouteSummary: 'Gare A -> Gares B, C -> Gares D, E -> Gare F',
  statusFeedbackMessage: '',

  // Raycaster pour le clic direct sur les gares 3D
  raycaster: new THREE.Raycaster(),
  pointerDownPos: { x: 0, y: 0 },
  hoveredStationIdx: -1,
  _onPointerDown: null,
  _onPointerUp: null,
  _onPointerMove: null,

  // Sauvegarde de visibilité du décor linéaire pour isoler la carte du territoire
  _savedEnvVisibility: null,

  // Coordonnées des 6 gares sur le territoire dégagé (Archipel du Réseau)
  stationCoords: [
    { code: 'A', name: 'Gare A', region: 'Ouest', pos: new THREE.Vector3(-8.2, 0, 0.0) },
    { code: 'B', name: 'Gare B', region: 'Nord-Ouest', pos: new THREE.Vector3(-2.6, 0, -4.8) },
    { code: 'C', name: 'Gare C', region: 'Sud-Ouest', pos: new THREE.Vector3(-2.6, 0, 4.8) },
    { code: 'D', name: 'Gare D', region: 'Nord-Est', pos: new THREE.Vector3(3.6, 0, -4.8) },
    { code: 'E', name: 'Gare E', region: 'Sud-Est', pos: new THREE.Vector3(3.6, 0, 4.8) },
    { code: 'F', name: 'Gare F', region: 'Est', pos: new THREE.Vector3(9.2, 0, 0.0) }
  ],

  // Liaisons primaires (flux direct de gauche à droite sans croisement)
  primaryEdges: [
    [0, 1], // Gare A - Gare B
    [0, 2], // Gare A - Gare C
    [1, 3], // Gare B - Gare D
    [2, 4], // Gare C - Gare E
    [3, 5], // Gare D - Gare F
    [4, 5]  // Gare E - Gare F
  ],

  // Liaisons secondaires de secours (utilisées automatiquement pour contourner une gare éteinte)
  backupEdges: [
    [1, 2], // Gare B - Gare C
    [3, 4], // Gare D - Gare E
    [1, 4], // Gare B - Gare E (diagonale Nord-Ouest -> Sud-Est)
    [2, 3]  // Gare C - Gare D (diagonale Sud-Ouest -> Nord-Est)
  ],

  init(context) {
    this.ctx = context;
  },

  enter() {
    const { trainConvoy, cameraController, environment } = this.ctx;

    this.isPropagating = false;
    this.hasBroadcasted = false;
    this.txCount = 3;
    this.lastTxLabel = '50 caisses de matériel (Gare A)';
    this.lastRouteSummary = 'Gare A -> Gares B, C -> Gares D, E -> Gare F';
    this.statusFeedbackMessage = '';
    this.hoveredStationIdx = -1;

    if (cameraController) {
      cameraController.setViewOffset(210);
    }

    // Arrête le défilement et isole la zone "Territoire / Archipel Réseau" du train
    if (environment) {
      environment.setSpeed(0, true);
      this.isolateTerritoryEnvironment(true);
    }

    if (trainConvoy && trainConvoy.group) {
      trainConvoy.group.visible = false;
    }

    this.buildNetworkMesh();
    this.setupCanvasInteractions();

    // Vue aérienne dégagée sur l'archipel des 6 gares ferroviaires
    if (cameraController) {
      cameraController.moveTo(
        new THREE.Vector3(0.5, 13.5, 17.5),
        new THREE.Vector3(0.5, 0.5, 0.2),
        1.3
      );
    }

    this.startAnimationLoop();
    this.renderLeftPanel();
  },

  exit() {
    this.stopAnimationLoop();
    this.removeCanvasInteractions();

    if (this.networkGroup && this.ctx?.scene) {
      this.ctx.scene.remove(this.networkGroup);
      this.networkGroup = null;
    }

    // Restaure la visibilité du train et du décor ferroviaire linéaire
    if (this.ctx?.trainConvoy?.group) {
      this.ctx.trainConvoy.group.visible = true;
    }
    this.isolateTerritoryEnvironment(false);

    this.stations = [];
    this.links = [];
    this.packets = [];

    const panel = document.getElementById('step-panel-left');
    if (panel) {
      const inner = panel.querySelector('.step-panel-inner');
      if (inner) inner.remove();
    }
  },

  /**
   * Masque temporairement les éléments du couloir ferroviaire (arbres, caténaires, tunnels, rails principaux)
   * pour dégager l'espace autour de la carte du réseau décentralisé.
   * @param {boolean} isolate
   */
  isolateTerritoryEnvironment(isolate) {
    const env = this.ctx?.environment;
    if (!env) return;

    const arrayKeys = ['trees', 'poles', 'passingStations', 'tunnels', 'sleepers', 'towns', 'steamParticles'];
    if (isolate) {
      this._savedEnvVisibility = [];
      arrayKeys.forEach((key) => {
        if (Array.isArray(env[key])) {
          env[key].forEach((obj) => {
            obj.visible = false;
          });
        }
      });
      // Masque le ballast et les deux rails du convoi principal (situés entre y = -0.46 et y = -0.30)
      if (env.group && Array.isArray(env.group.children)) {
        env.group.children.forEach((child) => {
          if (child.isMesh && child.position.y > -0.48 && child.position.y < -0.28) {
            this._savedEnvVisibility.push({ child, visible: child.visible });
            child.visible = false;
          }
        });
      }
    } else if (this._savedEnvVisibility) {
      arrayKeys.forEach((key) => {
        if (Array.isArray(env[key])) {
          env[key].forEach((obj) => {
            obj.visible = true;
          });
        }
      });
      this._savedEnvVisibility.forEach(({ child, visible }) => {
        child.visible = visible;
      });
      this._savedEnvVisibility = null;
    }
  },

  /**
   * Crée une texture Canvas pour le cadran d'horloge de la tour de gare.
   */
  createClockTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');

    // Fond ivoire
    ctx.fillStyle = '#fef9c3';
    ctx.beginPath();
    ctx.arc(64, 64, 58, 0, Math.PI * 2);
    ctx.fill();

    // Cerclage cuivré
    ctx.lineWidth = 8;
    ctx.strokeStyle = '#b45309';
    ctx.stroke();

    // Index des heures
    ctx.strokeStyle = '#1e293b';
    for (let i = 0; i < 12; i++) {
      const angle = (i * Math.PI) / 6;
      const r1 = i % 3 === 0 ? 40 : 45;
      const r2 = 52;
      ctx.lineWidth = i % 3 === 0 ? 4 : 2;
      ctx.beginPath();
      ctx.moveTo(64 + Math.cos(angle) * r1, 64 + Math.sin(angle) * r1);
      ctx.lineTo(64 + Math.cos(angle) * r2, 64 + Math.sin(angle) * r2);
      ctx.stroke();
    }

    // Aiguilles (10h10)
    ctx.strokeStyle = '#0f172a';
    ctx.lineCap = 'round';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(64, 64);
    ctx.lineTo(42, 46);
    ctx.stroke();

    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.moveTo(64, 64);
    ctx.lineTo(88, 42);
    ctx.stroke();

    ctx.fillStyle = '#dc2626';
    ctx.beginPath();
    ctx.arc(64, 64, 4, 0, Math.PI * 2);
    ctx.fill();

    const tex = new THREE.CanvasTexture(canvas);
    tex.needsUpdate = true;
    return tex;
  },

  /**
   * Crée le panneau frontal de nom de gare (style plaque émaillée bleu marine).
   * @param {string} title
   */
  createStationSignTexture(title) {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, 256, 64);

    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 4;
    ctx.strokeRect(4, 4, 248, 56);

    ctx.fillStyle = '#f8fafc';
    ctx.font = 'bold 28px "Segoe UI", Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(title.toUpperCase(), 128, 33);

    const tex = new THREE.CanvasTexture(canvas);
    tex.needsUpdate = true;
    return tex;
  },

  /**
   * Met à jour l'étiquette flottante (Sprite) au-dessus d'une gare selon son état.
   * @param {object} st
   */
  updateStationLabelSprite(st) {
    if (!st.labelCanvas || !st.labelTexture) return;
    const canvas = st.labelCanvas;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    let borderColor = '#10b981';
    let dotColor = '#10b981';
    let statusText = `COPIE INTEGRALE (${this.txCount})`;

    if (!st.online) {
      borderColor = '#ef4444';
      dotColor = '#ef4444';
      statusText = 'EN PANNE (Cliquer)';
    } else if (st.state === 'emitting') {
      borderColor = '#facc15';
      dotColor = '#facc15';
      statusText = 'ENVOI AUX VOISINES...';
    } else if (st.state === 'waiting') {
      borderColor = '#38bdf8';
      dotColor = '#38bdf8';
      statusText = 'EN ATTENTE...';
    } else if (st.state === 'synced') {
      borderColor = '#10b981';
      dotColor = '#10b981';
      statusText = `COPIE A JOUR (${this.txCount})`;
    }

    // Fond de carte arrondi
    ctx.fillStyle = 'rgba(15, 23, 42, 0.92)';
    ctx.strokeStyle = borderColor;
    ctx.lineWidth = 4;

    const x = 6;
    const y = 6;
    const w = canvas.width - 12;
    const h = canvas.height - 12;
    const r = 16;

    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Titre de la gare
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 26px "Segoe UI", Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`${st.name} (Copie ${st.code})`, canvas.width / 2, 40);

    // Pastille et statut
    ctx.fillStyle = dotColor;
    ctx.beginPath();
    ctx.arc(44, 76, 8, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = st.online ? '#cbd5e1' : '#fca5a5';
    ctx.font = 'bold 20px Consolas, monospace';
    ctx.textAlign = 'left';
    ctx.fillText(statusText, 62, 83);

    st.labelTexture.needsUpdate = true;
  },

  /**
   * Construit le plateau territorial et les 6 gares ferroviaires détaillées en 3D.
   */
  buildNetworkMesh() {
    const { scene } = this.ctx;
    if (!scene) return;

    if (this.networkGroup) {
      scene.remove(this.networkGroup);
    }

    this.networkGroup = new THREE.Group();
    this.stations = [];
    this.links = [];
    this.packets = [];

    // 1. Grand socle "Carte du Territoire / Archipel Réseau"
    const territoryBoardGeo = new THREE.CylinderGeometry(14.5, 15.2, 0.3, 8);
    const territoryBoardMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.9,
      metalness: 0.1
    });
    const territoryBoard = new THREE.Mesh(territoryBoardGeo, territoryBoardMat);
    territoryBoard.position.set(0.5, -0.35, 0.0);
    territoryBoard.rotation.y = Math.PI / 8;
    this.networkGroup.add(territoryBoard);

    const territoryBorderGeo = new THREE.RingGeometry(14.1, 14.45, 8);
    const territoryBorderMat = new THREE.MeshBasicMaterial({
      color: 0x1e3a5f,
      side: THREE.DoubleSide
    });
    const territoryBorder = new THREE.Mesh(territoryBorderGeo, territoryBorderMat);
    territoryBorder.rotation.x = -Math.PI / 2;
    territoryBorder.rotation.z = Math.PI / 8;
    territoryBorder.position.set(0.5, -0.18, 0.0);
    this.networkGroup.add(territoryBorder);

    // Géométries et matériaux partagés pour les gares ferroviaires
    const islandGeo = new THREE.CylinderGeometry(2.25, 2.45, 0.28, 6);
    const islandTopGeo = new THREE.CylinderGeometry(2.05, 2.2, 0.1, 6);
    const ringGeo = new THREE.RingGeometry(2.15, 2.38, 6);

    const ballastGeo = new THREE.BoxGeometry(3.1, 0.07, 0.68);
    const railGeo = new THREE.BoxGeometry(3.1, 0.05, 0.045);
    const sleeperGeo = new THREE.BoxGeometry(0.14, 0.04, 0.58);

    const platformGeo = new THREE.BoxGeometry(3.0, 0.22, 1.08);
    const safetyLineGeo = new THREE.BoxGeometry(2.94, 0.02, 0.06);

    const plinthGeo = new THREE.BoxGeometry(1.92, 0.2, 0.94);
    const mainHallGeo = new THREE.BoxGeometry(1.82, 0.98, 0.86);
    const corniceGeo = new THREE.BoxGeometry(1.94, 0.08, 0.96);
    const roofPrismGeo = new THREE.ConeGeometry(1.38, 0.58, 4);

    const towerBodyGeo = new THREE.BoxGeometry(0.58, 1.72, 0.58);
    const towerRoofGeo = new THREE.ConeGeometry(0.48, 0.62, 4);
    const clockFaceGeo = new THREE.CircleGeometry(0.2, 24);

    const canopyGeo = new THREE.BoxGeometry(2.35, 0.07, 0.56);
    const pillarGeo = new THREE.CylinderGeometry(0.035, 0.035, 0.72, 8);
    const signBoardGeo = new THREE.PlaneGeometry(1.15, 0.28);

    const signalMastGeo = new THREE.CylinderGeometry(0.035, 0.04, 1.35, 8);
    const signalBoxGeo = new THREE.BoxGeometry(0.18, 0.36, 0.14);
    const beaconGeo = new THREE.SphereGeometry(0.13, 14, 14);
    const ledgerGeo = new THREE.BoxGeometry(0.46, 0.56, 0.1);

    const islandMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.85 });
    const islandTopMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.8 });
    const ballastMat = new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.9 });
    const railMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.9, roughness: 0.2 });
    const sleeperMat = new THREE.MeshStandardMaterial({ color: 0x452311, roughness: 0.85 });
    const platformMat = new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.75 });
    const safetyMat = new THREE.MeshBasicMaterial({ color: 0xfacc15 });

    const brickMat = new THREE.MeshStandardMaterial({ color: 0x9a3412, roughness: 0.7 });
    const stoneTrimMat = new THREE.MeshStandardMaterial({ color: 0xcbd5e1, roughness: 0.6 });
    const slateRoofMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.55, flatShading: true });
    const darkMetalMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.75, roughness: 0.3 });

    const clockTexture = this.createClockTexture();
    const clockMat = new THREE.MeshBasicMaterial({ map: clockTexture });

    // 2. Construction des 6 Gares Ferroviaires
    this.stationCoords.forEach((info, idx) => {
      const stationGroup = new THREE.Group();
      stationGroup.position.copy(info.pos);
      stationGroup.userData = { stationIndex: idx };

      // Socle hexagonal de l'îlot
      const island = new THREE.Mesh(islandGeo, islandMat);
      island.position.y = -0.05;
      stationGroup.add(island);

      const islandTop = new THREE.Mesh(islandTopGeo, islandTopMat);
      islandTop.position.y = 0.12;
      stationGroup.add(islandTop);

      // Halo lumineux d'état autour de l'îlot
      const ringMat = new THREE.MeshBasicMaterial({
        color: 0x10b981,
        transparent: true,
        opacity: 0.65,
        side: THREE.DoubleSide
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.rotation.x = -Math.PI / 2;
      ring.position.y = 0.02;
      stationGroup.add(ring);

      // Voie ferrée passant devant le quai (+Z)
      const ballast = new THREE.Mesh(ballastGeo, ballastMat);
      ballast.position.set(0, 0.2, 0.72);
      stationGroup.add(ballast);

      const rail1 = new THREE.Mesh(railGeo, railMat);
      rail1.position.set(0, 0.25, 0.56);
      stationGroup.add(rail1);

      const rail2 = new THREE.Mesh(railGeo, railMat);
      rail2.position.set(0, 0.25, 0.88);
      stationGroup.add(rail2);

      for (let s = -3; s <= 3; s++) {
        const sleeper = new THREE.Mesh(sleeperGeo, sleeperMat);
        sleeper.position.set(s * 0.42, 0.23, 0.72);
        stationGroup.add(sleeper);
      }

      // Quai de gare et ligne de sécurité jaune
      const platform = new THREE.Mesh(platformGeo, platformMat);
      platform.position.set(0, 0.28, -0.15);
      stationGroup.add(platform);

      const safetyLine = new THREE.Mesh(safetyLineGeo, safetyMat);
      safetyLine.position.set(0, 0.4, 0.34);
      stationGroup.add(safetyLine);

      // Bâtiment voyageurs (soubassement pierre + murs de briques + corniche + toit d'ardoise)
      const plinth = new THREE.Mesh(plinthGeo, stoneTrimMat);
      plinth.position.set(-0.22, 0.48, -0.22);
      stationGroup.add(plinth);

      const mainHall = new THREE.Mesh(mainHallGeo, brickMat);
      mainHall.position.set(-0.22, 1.05, -0.22);
      stationGroup.add(mainHall);

      const cornice = new THREE.Mesh(corniceGeo, stoneTrimMat);
      cornice.position.set(-0.22, 1.56, -0.22);
      stationGroup.add(cornice);

      const mainRoof = new THREE.Mesh(roofPrismGeo, slateRoofMat);
      mainRoof.position.set(-0.22, 1.88, -0.22);
      mainRoof.rotation.y = Math.PI / 4;
      mainRoof.scale.set(1.25, 1.0, 0.68);
      stationGroup.add(mainRoof);

      // Baies vitrées cintrées et porte vitrée (matériau dynamique qui s'éteint en cas de panne)
      const windowMat = new THREE.MeshStandardMaterial({
        color: 0xfef08a,
        emissive: 0xf59e0b,
        emissiveIntensity: 1.1,
        roughness: 0.2
      });

      const winArchGeo = new THREE.BoxGeometry(0.32, 0.48, 0.04);
      [-0.72, -0.22, 0.28].forEach((wx) => {
        const winFront = new THREE.Mesh(winArchGeo, windowMat);
        winFront.position.set(wx, 0.98, 0.21);
        stationGroup.add(winFront);

        const winBack = new THREE.Mesh(winArchGeo, windowMat);
        winBack.position.set(wx, 0.98, -0.65);
        stationGroup.add(winBack);
      });

      // Marquise / auvent métallique de quai et ses piliers
      const canopy = new THREE.Mesh(canopyGeo, darkMetalMat);
      canopy.position.set(-0.05, 1.12, 0.14);
      stationGroup.add(canopy);

      [-1.0, -0.05, 0.9].forEach((px) => {
        const pillar = new THREE.Mesh(pillarGeo, darkMetalMat);
        pillar.position.set(px, 0.75, 0.3);
        stationGroup.add(pillar);
      });

      // Panneau nominatif sur le fronton de la marquise
      const signTex = this.createStationSignTexture(info.name);
      const signMat = new THREE.MeshBasicMaterial({ map: signTex });
      const signMesh = new THREE.Mesh(signBoardGeo, signMat);
      signMesh.position.set(-0.05, 1.28, 0.43);
      stationGroup.add(signMesh);

      // Tour de l'Horloge (Beffroi de gare) à droite du bâtiment
      const tower = new THREE.Mesh(towerBodyGeo, brickMat);
      tower.position.set(0.88, 1.24, -0.22);
      stationGroup.add(tower);

      const towerRoof = new THREE.Mesh(towerRoofGeo, slateRoofMat);
      towerRoof.position.set(0.88, 2.4, -0.22);
      towerRoof.rotation.y = Math.PI / 4;
      stationGroup.add(towerRoof);

      const clockFront = new THREE.Mesh(clockFaceGeo, clockMat);
      clockFront.position.set(0.88, 1.75, 0.08);
      stationGroup.add(clockFront);

      const clockBack = new THREE.Mesh(clockFaceGeo, clockMat);
      clockBack.position.set(0.88, 1.75, -0.52);
      clockBack.rotation.y = Math.PI;
      stationGroup.add(clockBack);

      // Signalisation ferroviaire (Sémaphore lumineux à gauche du quai)
      const signalMast = new THREE.Mesh(signalMastGeo, darkMetalMat);
      signalMast.position.set(-1.35, 1.05, 0.15);
      stationGroup.add(signalMast);

      const signalBox = new THREE.Mesh(signalBoxGeo, darkMetalMat);
      signalBox.position.set(-1.35, 1.65, 0.15);
      stationGroup.add(signalBox);

      const beaconMat = new THREE.MeshStandardMaterial({
        color: 0x10b981,
        emissive: 0x059669,
        emissiveIntensity: 2.0,
        roughness: 0.2
      });
      const beacon = new THREE.Mesh(beaconGeo, beaconMat);
      beacon.position.set(-1.35, 1.65, 0.24);
      stationGroup.add(beacon);

      // Registre local flottant (copie complète de la blockchain détenue par la gare)
      const ledgerMat = new THREE.MeshStandardMaterial({
        color: 0x10b981,
        emissive: 0x059669,
        emissiveIntensity: 1.2,
        transparent: true,
        opacity: 0.9
      });
      const ledger = new THREE.Mesh(ledgerGeo, ledgerMat);
      ledger.position.set(-1.35, 2.25, 0.15);
      stationGroup.add(ledger);

      // Étiquette Sprite 3D haute lisibilité au-dessus de la gare
      const labelCanvas = document.createElement('canvas');
      labelCanvas.width = 360;
      labelCanvas.height = 108;
      const labelTexture = new THREE.CanvasTexture(labelCanvas);
      const labelMat = new THREE.SpriteMaterial({
        map: labelTexture,
        transparent: true,
        depthTest: false
      });
      const labelSprite = new THREE.Sprite(labelMat);
      labelSprite.position.set(0, 3.25, 0);
      labelSprite.scale.set(3.4, 1.02, 1);
      stationGroup.add(labelSprite);

      // Marque tous les enfants pour la détection au clic 3D
      stationGroup.traverse((child) => {
        child.userData.stationIndex = idx;
      });

      this.networkGroup.add(stationGroup);

      const stationObj = {
        index: idx,
        code: info.code,
        name: info.name,
        region: info.region,
        group: stationGroup,
        beaconMat,
        ringMat,
        windowMat,
        ledgerMat,
        ledger,
        labelCanvas,
        labelTexture,
        labelSprite,
        cableAnchor: info.pos.clone().add(new THREE.Vector3(0, 0.22, 0)),
        online: true,
        state: 'synced' // 'synced' | 'emitting' | 'waiting'
      };

      this.updateStationLabelSprite(stationObj);
      this.stations.push(stationObj);
    });

    // 3. Construction des câbles de communication P2P reliant les gares sur le territoire
    const allEdges = [
      ...this.primaryEdges.map((pair) => ({ pair, isBackup: false })),
      ...this.backupEdges.map((pair) => ({ pair, isBackup: true }))
    ];

    allEdges.forEach(({ pair, isBackup }) => {
      const [a, b] = pair;
      const pA = this.stations[a].cableAnchor;
      const pB = this.stations[b].cableAnchor;

      const dir = new THREE.Vector3().subVectors(pB, pA);
      const length = dir.length();
      const mid = new THREE.Vector3().addVectors(pA, pB).multiplyScalar(0.5);

      const cableRadius = isBackup ? 0.045 : 0.075;
      const cableGeo = new THREE.CylinderGeometry(cableRadius, cableRadius, length, 8);
      cableGeo.rotateX(Math.PI / 2);

      const cableMat = new THREE.MeshStandardMaterial({
        color: isBackup ? 0x334155 : 0x0284c7,
        emissive: isBackup ? 0x0f172a : 0x0369a1,
        emissiveIntensity: isBackup ? 0.3 : 0.85,
        roughness: 0.4,
        transparent: true,
        opacity: isBackup ? 0.45 : 0.85
      });

      const cableMesh = new THREE.Mesh(cableGeo, cableMat);
      cableMesh.position.copy(mid);
      cableMesh.lookAt(pB);

      this.networkGroup.add(cableMesh);
      this.links.push({
        a,
        b,
        isBackup,
        pA: pA.clone(),
        pB: pB.clone(),
        mesh: cableMesh,
        mat: cableMat,
        activeRoute: false
      });
    });

    scene.add(this.networkGroup);
  },

  /**
   * Met à jour l'apparence 3D d'une gare et des câbles adjacents selon son état (en ligne / en panne).
   */
  refreshNetworkVisuals() {
    this.stations.forEach((st) => {
      if (!st.online) {
        // Gare éteinte (en panne)
        st.beaconMat.color.setHex(0xef4444);
        st.beaconMat.emissive.setHex(0x991b1b);
        st.beaconMat.emissiveIntensity = 0.8;
        st.ringMat.color.setHex(0xef4444);
        st.ringMat.opacity = 0.35;
        st.windowMat.color.setHex(0x1e293b);
        st.windowMat.emissive.setHex(0x000000);
        st.windowMat.emissiveIntensity = 0.0;
        if (st.ledger) st.ledger.visible = false;
      } else {
        // Gare en ligne
        st.windowMat.color.setHex(0xfef08a);
        st.windowMat.emissive.setHex(0xf59e0b);
        st.windowMat.emissiveIntensity = 1.1;
        if (st.ledger) st.ledger.visible = true;

        if (st.state === 'emitting') {
          st.beaconMat.color.setHex(0xfacc15);
          st.beaconMat.emissive.setHex(0xeab308);
          st.beaconMat.emissiveIntensity = 2.4;
          st.ringMat.color.setHex(0xfacc15);
          st.ringMat.opacity = 0.85;
        } else if (st.state === 'waiting') {
          st.beaconMat.color.setHex(0x38bdf8);
          st.beaconMat.emissive.setHex(0x0284c7);
          st.beaconMat.emissiveIntensity = 1.0;
          st.ringMat.color.setHex(0x38bdf8);
          st.ringMat.opacity = 0.45;
        } else {
          st.beaconMat.color.setHex(0x10b981);
          st.beaconMat.emissive.setHex(0x059669);
          st.beaconMat.emissiveIntensity = 2.0;
          st.ringMat.color.setHex(0x10b981);
          st.ringMat.opacity = 0.7;
        }
      }
      this.updateStationLabelSprite(st);
    });

    // Mise à jour des câbles P2P
    this.links.forEach((link) => {
      const stA = this.stations[link.a];
      const stB = this.stations[link.b];
      if (!stA.online || !stB.online) {
        // Câble coupé car l'une des deux gares est éteinte
        link.mat.color.setHex(0x450a0a);
        link.mat.emissive.setHex(0x000000);
        link.mat.emissiveIntensity = 0;
        link.mat.opacity = 0.22;
      } else if (link.activeRoute) {
        // Câble emprunté par la propagation Gossip actuelle
        link.mat.color.setHex(0x10b981);
        link.mat.emissive.setHex(0x059669);
        link.mat.emissiveIntensity = 1.6;
        link.mat.opacity = 0.95;
      } else {
        link.mat.color.setHex(link.isBackup ? 0x334155 : 0x0284c7);
        link.mat.emissive.setHex(link.isBackup ? 0x0f172a : 0x0369a1);
        link.mat.emissiveIntensity = link.isBackup ? 0.25 : 0.75;
        link.mat.opacity = link.isBackup ? 0.4 : 0.8;
      }
    });
  },

  /**
   * Permet d'éteindre ou de rallumer une gare (simulation de panne d'un nœud).
   * @param {number} stationIdx
   */
  toggleStation(stationIdx) {
    if (this.isPropagating) return;
    const st = this.stations[stationIdx];
    if (!st) return;

    const onlineCount = this.stations.filter((s) => s.online).length;
    if (st.online && onlineCount <= 2) {
      this.statusFeedbackMessage = 'Gardez au moins 2 gares allumées pour voir la diffusion entre deux gares.';
      this.renderLeftPanel();
      return;
    }

    st.online = !st.online;
    st.state = st.online ? 'synced' : 'offline';

    // Réinitialise le surlignage de route jusqu'à la prochaine émission
    this.links.forEach((l) => {
      l.activeRoute = false;
    });

    if (!st.online) {
      this.statusFeedbackMessage = `${st.name} éteinte (en panne). Envoyez une transaction pour voir comment le message passe par une autre voie.`;
    } else {
      this.statusFeedbackMessage = `${st.name} rallumée : elle met sa copie à jour avec les autres gares.`;
    }

    this.refreshNetworkVisuals();
    this.renderLeftPanel();
  },

  /**
   * Calcule l'arbre de propagation séquentiel (Gossip de proche en proche)
   * en contournant les gares éteintes.
   * @param {number} sourceIdx
   */
  computeGossipWaves(sourceIdx) {
    const visited = new Set([sourceIdx]);
    let currentWaveNodes = [sourceIdx];
    const waves = []; // Chaque vague contient [{ from, to, link }]

    while (currentWaveNodes.length > 0) {
      const nextWaveNodes = [];
      const waveHops = [];

      // 1. D'abord les liaisons primaires directes (sans croisement)
      for (const u of currentWaveNodes) {
        for (const [a, b] of this.primaryEdges) {
          const v = a === u ? b : b === u ? a : -1;
          if (v !== -1 && this.stations[v].online && !visited.has(v)) {
            visited.add(v);
            nextWaveNodes.push(v);
            const link = this.links.find((l) => (l.a === u && l.b === v) || (l.a === v && l.b === u));
            waveHops.push({ from: u, to: v, link });
          }
        }
      }

      // 2. Puis les liaisons secondaires / diagonales de secours si des gares sont en panne
      for (const u of currentWaveNodes) {
        for (const [a, b] of this.backupEdges) {
          const v = a === u ? b : b === u ? a : -1;
          if (v !== -1 && this.stations[v].online && !visited.has(v)) {
            visited.add(v);
            nextWaveNodes.push(v);
            const link = this.links.find((l) => (l.a === u && l.b === v) || (l.a === v && l.b === u));
            waveHops.push({ from: u, to: v, link });
          }
        }
      }

      if (waveHops.length > 0) {
        waves.push({
          hops: waveHops,
          targets: nextWaveNodes
        });
      }

      currentWaveNodes = nextWaveNodes;
    }

    return { waves, reachableCount: visited.size };
  },

  /**
   * Lance la propagation séquentielle d'une transaction (protocole Gossip).
   * Étape 1 : Gare A -> voisines immédiates (B et C).
   * Étape 2 (seulement après réception) : B et C -> D et E.
   * Étape 3 (seulement après réception) : D et E -> F.
   */
  broadcastTransaction(txLabel) {
    if (this.isPropagating) return;

    // Choisit la Gare A par défaut, ou la première gare en ligne si la Gare A est éteinte
    const sourceStation = this.stations.find((s) => s.online);
    if (!sourceStation) return;

    const sourceIdx = sourceStation.index;
    const { waves } = this.computeGossipWaves(sourceIdx);

    this.isPropagating = true;
    this.hasBroadcasted = true;
    this.txCount += 1;
    this.lastTxLabel = txLabel || `Bon d'expédition #${100 + this.txCount} (${sourceStation.name})`;

    // Construit le résumé lisible du chemin de propagation
    const waveNames = [`Gare ${sourceStation.code}`];
    waves.forEach((w) => {
      const codes = w.targets.map((idx) => this.stations[idx].code).join(', ');
      waveNames.push(w.targets.length > 1 ? `Gares ${codes}` : `Gare ${codes}`);
    });
    this.lastRouteSummary = waveNames.join(' -> ');

    const offlineNames = this.stations.filter((s) => !s.online).map((s) => s.name);
    if (offlineNames.length > 0) {
      this.statusFeedbackMessage = `Contournement de ${offlineNames.join(', ')} : chaque gare active reçoit sa copie par ${this.lastRouteSummary}.`;
    } else {
      this.statusFeedbackMessage = `Envoi de gare en gare : ${this.lastRouteSummary}.`;
    }

    // Réinitialise l'état visuel des gares actives et des câbles
    this.links.forEach((l) => {
      l.activeRoute = false;
    });

    this.stations.forEach((st, idx) => {
      if (!st.online) return;
      st.state = idx === sourceIdx ? 'emitting' : 'waiting';
    });
    this.refreshNetworkVisuals();

    // Nettoie d'éventuels anciens paquets
    this.packets.forEach((p) => this.networkGroup?.remove(p.mesh));
    this.packets = [];

    // Création des paquets lumineux séquentiels vague par vague
    const hopDuration = 1150; // Lent et lisible (1,15s par câble)
    const relayPause = 260;   // Pause dans chaque gare avant de relayer à la suivante
    const baseTime = performance.now();

    const packetGeo = new THREE.SphereGeometry(0.24, 16, 16);
    const haloGeo = new THREE.RingGeometry(0.28, 0.44, 20);

    waves.forEach((wave, waveIdx) => {
      const waveStart = baseTime + waveIdx * (hopDuration + relayPause);

      wave.hops.forEach((hop) => {
        const pktGroup = new THREE.Group();

        const coreMat = new THREE.MeshBasicMaterial({ color: 0xfef08a });
        const core = new THREE.Mesh(packetGeo, coreMat);
        pktGroup.add(core);

        const haloMat = new THREE.MeshBasicMaterial({
          color: 0xfacc15,
          transparent: true,
          opacity: 0.75,
          side: THREE.DoubleSide
        });
        const halo = new THREE.Mesh(haloGeo, haloMat);
        halo.rotation.x = -Math.PI / 2;
        pktGroup.add(halo);

        pktGroup.visible = false;
        this.networkGroup.add(pktGroup);

        this.packets.push({
          mesh: pktGroup,
          fromIdx: hop.from,
          targetIdx: hop.to,
          link: hop.link,
          startPos: this.stations[hop.from].cableAnchor.clone(),
          endPos: this.stations[hop.to].cableAnchor.clone(),
          startTime: waveStart,
          duration: hopDuration,
          started: false,
          completed: false
        });
      });
    });

    // Cas où toutes les voisines directes de la gare source sont coupées
    if (this.packets.length === 0) {
      this.isPropagating = false;
      sourceStation.state = 'synced';
      this.statusFeedbackMessage = `${sourceStation.name} est isolée car ses gares voisines sont éteintes.`;
      this.refreshNetworkVisuals();
    }

    this.renderLeftPanel();
  },

  /**
   * Boucle d'animation de la scène 3D (registres flottants et propagation séquentielle).
   */
  startAnimationLoop() {
    this.stopAnimationLoop();

    const loop = () => {
      const now = performance.now();
      const time = now * 0.003;

      // Animation douce des registres locaux au-dessus des gares actives
      this.stations.forEach((st, idx) => {
        if (st.online && st.ledger) {
          st.ledger.position.y = 2.25 + Math.sin(time * 2 + idx) * 0.06;
          st.ledger.rotation.y = Math.sin(time + idx) * 0.35;
        }
      });

      // Progression séquentielle des paquets le long des câbles P2P
      if (this.packets.length > 0) {
        let allDone = true;

        for (let i = 0; i < this.packets.length; i++) {
          const pkt = this.packets[i];
          if (pkt.completed) continue;

          if (now < pkt.startTime) {
            allDone = false;
            continue;
          }

          if (!pkt.started) {
            pkt.started = true;
            const fromSt = this.stations[pkt.fromIdx];
            if (fromSt && fromSt.online) {
              fromSt.state = 'emitting';
              this.refreshNetworkVisuals();
            }
            if (pkt.link) {
              pkt.link.mat.color.setHex(0xfacc15);
              pkt.link.mat.emissive.setHex(0xeab308);
              pkt.link.mat.emissiveIntensity = 2.0;
              pkt.link.mat.opacity = 1.0;
            }
          }

          const progress = Math.min((now - pkt.startTime) / pkt.duration, 1.0);
          pkt.mesh.visible = true;
          // Trajectoire rectiligne le long du câble de communication (sans rebond chaotique)
          pkt.mesh.position.lerpVectors(pkt.startPos, pkt.endPos, progress);
          pkt.mesh.position.y += 0.08;

          if (progress >= 1.0) {
            pkt.completed = true;
            pkt.mesh.visible = false;
            this.networkGroup?.remove(pkt.mesh);

            if (pkt.link) {
              pkt.link.activeRoute = true;
            }

            const fromStation = this.stations[pkt.fromIdx];
            if (fromStation && fromStation.online) {
              fromStation.state = 'synced';
            }

            const targetStation = this.stations[pkt.targetIdx];
            if (targetStation && targetStation.online) {
              targetStation.state = 'synced';
            }

            this.refreshNetworkVisuals();
            this.updateFeedbackDOM();
          } else {
            allDone = false;
          }
        }

        if (allDone) {
          this.isPropagating = false;
          this.packets = [];
          this.stations.forEach((st) => {
            if (st.online) st.state = 'synced';
          });
          this.refreshNetworkVisuals();
          this.renderLeftPanel();
        }
      }

      this.rafId = requestAnimationFrame(loop);
    };

    this.rafId = requestAnimationFrame(loop);
  },

  stopAnimationLoop() {
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  },

  /**
   * Configure la détection de clic et de survol sur les gares dans le canvas 3D.
   */
  setupCanvasInteractions() {
    this.removeCanvasInteractions();
    const canvas = document.getElementById('webgl');
    if (!canvas) return;

    const getStationIndexAtEvent = (clientX, clientY) => {
      if (!this.ctx?.camera || !this.networkGroup) return -1;
      const rect = canvas.getBoundingClientRect();
      const mouse = new THREE.Vector2(
        ((clientX - rect.left) / rect.width) * 2 - 1,
        -((clientY - rect.top) / rect.height) * 2 + 1
      );
      this.raycaster.setFromCamera(mouse, this.ctx.camera);
      const meshes = [];
      this.stations.forEach((s) => {
        s.group.traverse((child) => {
          if (child.isMesh) meshes.push(child);
        });
      });

      const hits = this.raycaster.intersectObjects(meshes, false);
      if (hits.length > 0) {
        let obj = hits[0].object;
        while (obj) {
          if (typeof obj.userData?.stationIndex === 'number') {
            return obj.userData.stationIndex;
          }
          obj = obj.parent;
        }
      }
      return -1;
    };

    this._onPointerDown = (e) => {
      this.pointerDownPos = { x: e.clientX, y: e.clientY };
    };

    this._onPointerUp = (e) => {
      const dx = e.clientX - this.pointerDownPos.x;
      const dy = e.clientY - this.pointerDownPos.y;
      if (Math.hypot(dx, dy) > 6) return; // Ignore les mouvements de rotation de caméra

      const stationIdx = getStationIndexAtEvent(e.clientX, e.clientY);
      if (stationIdx !== -1) {
        this.toggleStation(stationIdx);
      }
    };

    this._onPointerMove = (e) => {
      const stationIdx = getStationIndexAtEvent(e.clientX, e.clientY);
      this.hoveredStationIdx = stationIdx;
      canvas.style.cursor = stationIdx !== -1 ? 'pointer' : '';
    };

    canvas.addEventListener('pointerdown', this._onPointerDown);
    canvas.addEventListener('pointerup', this._onPointerUp);
    canvas.addEventListener('pointermove', this._onPointerMove);
  },

  removeCanvasInteractions() {
    const canvas = document.getElementById('webgl');
    if (!canvas) return;
    if (this._onPointerDown) canvas.removeEventListener('pointerdown', this._onPointerDown);
    if (this._onPointerUp) canvas.removeEventListener('pointerup', this._onPointerUp);
    if (this._onPointerMove) canvas.removeEventListener('pointermove', this._onPointerMove);
    canvas.style.cursor = '';
    this._onPointerDown = null;
    this._onPointerUp = null;
    this._onPointerMove = null;
  },

  /**
   * Met à jour en direct le compteur de synchronisation dans le DOM.
   */
  updateFeedbackDOM() {
    const syncEl = document.getElementById('step4-sync-val');
    if (syncEl) {
      const onlineStations = this.stations.filter((s) => s.online);
      const syncedStations = onlineStations.filter((s) => s.state === 'synced');
      const offlineCount = this.stations.length - onlineStations.length;
      const offlineSuffix = offlineCount > 0 ? ` (${offlineCount} en panne)` : '';
      syncEl.textContent = `${syncedStations.length} / ${onlineStations.length} gares actives à jour${offlineSuffix}`;
    }
  },

  renderLeftPanel() {
    const panel = document.getElementById('step-panel-left');
    if (!panel) return;

    panel.classList.add('active');

    const oldInner = panel.querySelector('.step-panel-inner');
    if (oldInner) oldInner.remove();

    const inner = document.createElement('div');
    inner.className = 'step-panel-inner';

    const onlineStations = this.stations.filter((s) => s.online);
    const syncedStations = onlineStations.filter((s) => s.state === 'synced');
    const offlineCount = this.stations.length - onlineStations.length;
    const offlineSuffix = offlineCount > 0 ? ` (${offlineCount} en panne)` : '';

    const stationsButtonsHTML = this.stations
      .map(
        (st) => `
        <button class="station-node-btn ${st.online ? 'online' : 'offline'}" data-station-idx="${st.index}" ${this.isPropagating ? 'disabled' : ''} title="Cliquer pour simuler une panne">
          <span>${st.name}</span>
          <span class="station-node-dot"></span>
        </button>
      `
      )
      .join('');

    inner.innerHTML = `
      <header class="step-panel-header">
        <h2 class="step-panel-title">Réseau et Décentralisation</h2>
      </header>

      <div class="step-panel-scroll">
        <article class="step-card context-card animate-fade">
          <h3 class="card-title">Un réseau sans chef de gare central</h3>
          <div class="share-meaning-banner" style="margin-top: 4px; margin-bottom: 10px;">
            <strong>Il n'y a AUCUN serveur central ou entreprise qui gère le réseau.</strong>
          </div>
          <p>
            Chaque gare représente un ordinateur indépendant : <strong>chaque gare possède sa propre copie intégrale</strong> de tout le train et de toutes les transactions passées (le bloc vert au-dessus d'elle).
          </p>
          <p>
            Quand une transaction est envoyée, elle ne passe pas par un serveur unique : elle se transmet de gare en gare, d'une voisine à l'autre, par les câbles du réseau.
          </p>
          <div class="panel-hint-row" style="margin-top: 10px;">
            <strong>Et si une gare essaie de tricher ?</strong> Les gares voisines comparent aussitôt le message avec <em>leur propre copie</em> et refusent de le transmettre si les données ne collent pas.
          </div>
        </article>

        <article class="step-card action-card animate-fade">
          <h3 class="card-title">Tester l'envoi et les pannes</h3>
          <p class="card-instruction">
            Cliquez sur <strong>Envoyer</strong> pour copier une nouvelle transaction dans chaque gare. Vous pouvez aussi cliquer sur une gare (ou son icône en 3D) pour la mettre en panne :
          </p>

          <div class="station-nodes-grid" role="group" aria-label="État des 6 gares du réseau">
            ${stationsButtonsHTML}
          </div>

          <div class="substep-action-box" style="margin-top: 10px;">
            <button id="btn-step4-broadcast" class="btn-panel-primary" ${this.isPropagating ? 'disabled' : ''}>
              <span>${this.isPropagating ? 'Envoi de gare en gare...' : 'Envoyer une transaction sur le réseau'}</span>
              ${!this.isPropagating ? '<span class="btn-arrow">&rarr;</span>' : ''}
            </button>
          </div>

          ${this.statusFeedbackMessage
            ? `<div class="action-feedback-status visible status-info" style="margin-top: 8px;">${this.statusFeedbackMessage}</div>`
            : ''
          }

          <div class="action-feedback-box ${!this.isPropagating ? 'success' : ''}" style="margin-top: 10px;">
            <div class="feedback-row">
              <span class="feedback-label">Copies dans les gares :</span>
              <span id="step4-sync-val" class="feedback-val ${!this.isPropagating ? 'success-val' : 'hash-val'}">
                ${syncedStations.length} / ${onlineStations.length} gares à jour${offlineSuffix}
              </span>
            </div>
            <div class="feedback-row">
              <span class="feedback-label">Chemin suivi :</span>
              <span class="feedback-val">${this.lastRouteSummary}</span>
            </div>
          </div>
        </article>

        ${this.hasBroadcasted ? `
          <article class="step-card keypoint-card animate-fade">
            <h4 class="card-title keypoint-title">Point clé : Aucune gare n'est indispensable</h4>
            <p class="keypoint-text">
              Comme il n'existe aucun ordinateur central et que <strong>chaque gare garde sa propre copie intégrale</strong>, même si des gares tombent en panne, les messages passent par un autre chemin et le réseau ne s'arrête jamais.
            </p>
          </article>
        ` : ''}

        <nav class="step-nav-bar animate-fade">
          <button id="btn-step4-action-prev" class="btn-panel-ghost">
            <span class="btn-arrow">&larr;</span>
            <span>Étape 3 : Immuabilité</span>
          </button>
          <button id="btn-step4-action-next" class="btn-panel-primary">
            <span>Étape 5 : Minage</span>
            <span class="btn-arrow">&rarr;</span>
          </button>
        </nav>
      </div>
    `;

    panel.prepend(inner);
    this.setupEvents();
  },

  setupEvents() {
    document.querySelectorAll('.station-node-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.dataset.stationIdx, 10);
        if (!isNaN(idx)) {
          this.toggleStation(idx);
        }
      });
    });

    document.getElementById('btn-step4-broadcast')?.addEventListener('click', () => {
      this.broadcastTransaction('15 MMI-Coin vers Alban');
    });

    document.getElementById('btn-step4-action-prev')?.addEventListener('click', () => {
      if (typeof this.ctx.onPrevStep === 'function') {
        this.ctx.onPrevStep();
      }
    });

    document.getElementById('btn-step4-action-next')?.addEventListener('click', () => {
      if (typeof this.ctx.onNextStep === 'function') {
        this.ctx.onNextStep();
      }
    });
  }
};
