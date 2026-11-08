import * as THREE from 'three';

/**
 * Étape 7 : Attaque des 51 % et règle de la chaîne la plus longue.
 * Mise en scène après le Wagon #1 :
 * - À gauche sur le rail central (z = 0) : la Locomotive (#0) et le Wagon #1 déjà validés.
 * - Juste après le Wagon #1, un aiguillage en Y sépare deux branches candidates :
 *   1) En haut (z = -1.85) : la suite préparée par les Gares honnêtes (Wagons #2, #3, #4).
 *   2) En bas (z = +1.85) : la suite préparée par le Pirate (Wagons pirates #2, #3, #4) pour modifier la suite.
 * - Pendant la course, aucune des deux branches n'est encore attachée au Wagon #1.
 * - À la fin de la course, SEULE la branche qui a assemblé le plus de wagons (3 wagons contre 1)
 *   glisse sur le rail central (z = 0) et vient s'attacher physiquement à l'arrière du Wagon #1,
 *   tandis que la branche perdante reste isolée sur sa voie de garage.
 */
export const step7 = {
  id: 7,
  title: 'Attaque des 51 % et chaîne la plus longue',
  ctx: null,

  rafId: null,
  mode: 'normal', // 'normal' (Pirate 20 % vs 80 %) | 'attack51' (Pirate 60 % vs 40 %)
  raceState: 'idle', // 'idle' | 'running' | 'done'
  raceTimer: 0,
  raceDuration: 2.7,
  hasTestedNormal: false,
  hasTestedAttack51: false,

  // Nombre de nouveaux wagons assemblés après le Wagon #1 sur chaque branche (de 1 à 3)
  honestBranchCount: 1,
  pirateBranchCount: 1,

  // Coordonnées des branches de préparation (avant attachement sur le rail central z = 0)
  honestBranchZ: -1.85,
  pirateBranchZ: 1.85,
  branchOffsetX: 0.65, // Décalage X tant que la branche n'est pas attachée au Wagon #1

  wasWinnerCoupled: false,
  couplerFlashRing: null,
  couplerFlashAlpha: 0,

  attackGroup: null,
  pirateWagons: [],
  honestWheelObj: null,
  pirateWheelObj: null,
  tooltipLayer: null,

  init(context) {
    this.ctx = context;
  },

  enter() {
    const { trainConvoy, cameraController, environment } = this.ctx;

    this.mode = 'normal';
    this.raceState = 'idle';
    this.raceTimer = 0;
    this.hasTestedNormal = false;
    this.hasTestedAttack51 = false;
    this.honestBranchCount = 1;
    this.pirateBranchCount = 1;
    this.wasWinnerCoupled = false;
    this.couplerFlashAlpha = 0;

    if (cameraController) {
      cameraController.setViewOffset(210);
    }

    if (environment) {
      environment.setSpeed(0);
    }

    // Crée la Locomotive (#0), le Wagon #1 (tronc commun) et les Wagons #2, #3, #4 (branche honnête)
    if (trainConvoy) {
      trainConvoy.resetConvoy([
        { emetteur: 'Arthur', destinataire: 'Vendeur', montant: 20, unite: 'MMI-Coin' },
        { emetteur: 'Alban', destinataire: 'Equipe-R507', montant: 30, unite: 'MMI-Coin' },
        { emetteur: 'Gare-A', destinataire: 'Confirmation-1', montant: 15, unite: 'MMI-Coin' },
        { emetteur: 'Gare-B', destinataire: 'Confirmation-2', montant: 25, unite: 'MMI-Coin' }
      ]);
      if (cameraController) {
        cameraController.setInteractiveObjects(trainConvoy.getInteractiveObjects());
      }
    }

    this.buildParallelRaceScene();
    this.resetWagonsToStart();
    this.setupTooltipsLayer();
    this.createRaceTooltips();

    if (cameraController) {
      cameraController.moveTo(
        new THREE.Vector3(8.0, 5.5, 13.8),
        new THREE.Vector3(7.6, 0.3, 0.15),
        1.15
      );
    }

    this.startAnimationLoop();
    this.renderLeftPanel();
  },

  exit() {
    this.stopAnimationLoop();

    // Restaure la position nominale sur le rail central (z = 0) de tous les wagons officiels
    const { trainConvoy } = this.ctx || {};
    if (trainConvoy) {
      for (let i = 1; i <= 4; i++) {
        const w = trainConvoy.getWagon(i);
        if (w) {
          w.visible = true;
          w.position.set(i * 3.8, 0, 0);
          w.scale.setScalar(1);
          w.updateStatus(true);
        }
      }
    }

    if (this.tooltipLayer) {
      this.tooltipLayer.remove();
      this.tooltipLayer = null;
    }

    if (this.attackGroup && this.ctx?.scene) {
      this.ctx.scene.remove(this.attackGroup);
      this.attackGroup = null;
    }

    this.pirateWagons = [];
    this.honestWheelObj = null;
    this.pirateWheelObj = null;
    this.couplerFlashRing = null;

    const panel = document.getElementById('step-panel-left');
    if (panel) {
      const inner = panel.querySelector('.step-panel-inner');
      if (inner) inner.remove();
    }
  },

  /**
   * Dessine le cadran d'une molette 3D (Gares honnêtes ou Pirate).
   */
  renderWheelDial(canvas, texture, cranCount, borderColor) {
    if (!canvas || !texture) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(128, 128, 120, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = borderColor;
    ctx.lineWidth = 10;
    ctx.beginPath();
    ctx.arc(128, 128, 114, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = borderColor;
    ctx.font = 'bold 26px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('NONCE', 128, 74);

    ctx.fillStyle = '#fef08a';
    ctx.font = 'bold 68px monospace';
    ctx.fillText(String(cranCount), 128, 144);

    texture.needsUpdate = true;
  },

  /**
   * Crée un socle avec une molette Nonce 3D à 8 crans.
   */
  createStationWheelNode(x, z, mainColorHex, borderHexStr) {
    const group = new THREE.Group();
    group.position.set(x, -0.4, z);

    const platform = new THREE.Mesh(
      new THREE.CylinderGeometry(0.85, 0.96, 0.18, 24),
      new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.65, metalness: 0.3 })
    );
    group.add(platform);

    const ringMat = new THREE.MeshBasicMaterial({ color: mainColorHex, side: THREE.DoubleSide });
    const ring = new THREE.Mesh(new THREE.RingGeometry(0.88, 1.02, 32), ringMat);
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = 0.1;
    group.add(ring);

    const stand = new THREE.Mesh(
      new THREE.BoxGeometry(0.32, 0.66, 0.18),
      new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.85, roughness: 0.3 })
    );
    stand.position.set(0, 0.39, -0.05);
    group.add(stand);

    const wheelMesh = new THREE.Mesh(
      new THREE.CylinderGeometry(0.36, 0.36, 0.12, 24),
      new THREE.MeshStandardMaterial({
        color: 0x78350f,
        metalness: 0.8,
        roughness: 0.35,
        emissive: 0x451a03,
        emissiveIntensity: 0.25
      })
    );
    wheelMesh.rotation.x = Math.PI / 2;
    wheelMesh.position.set(0, 0.6, 0.08);
    group.add(wheelMesh);

    const toothGeo = new THREE.BoxGeometry(0.075, 0.115, 0.1);
    const toothMat = new THREE.MeshStandardMaterial({
      color: mainColorHex,
      metalness: 0.85,
      roughness: 0.25,
      emissive: mainColorHex,
      emissiveIntensity: 0.25
    });
    for (let i = 0; i < 8; i++) {
      const angle = (i * Math.PI) / 4;
      const tooth = new THREE.Mesh(toothGeo, toothMat);
      tooth.position.set(Math.cos(angle) * 0.38, 0, Math.sin(angle) * 0.38);
      tooth.rotation.y = -angle + Math.PI / 2;
      wheelMesh.add(tooth);
    }

    const dialCanvas = document.createElement('canvas');
    dialCanvas.width = 256;
    dialCanvas.height = 256;
    const dialTex = new THREE.CanvasTexture(dialCanvas);
    this.renderWheelDial(dialCanvas, dialTex, 0, borderHexStr);

    const dialMesh = new THREE.Mesh(
      new THREE.CircleGeometry(0.32, 32),
      new THREE.MeshBasicMaterial({ map: dialTex, transparent: true })
    );
    dialMesh.position.set(0, 0.6, 0.145);
    group.add(dialMesh);

    return {
      group,
      wheelMesh,
      ringMat,
      dialCanvas,
      dialTex,
      currentCrans: 0,
      currentAngle: 0
    };
  },

  /**
   * Construit un wagon pirate (#2, #3 ou #4) destiné à venir s'attacher après le Wagon #1
   * si la branche pirate remporte la course.
   */
  createPirateWagonMesh(blockNumber, coupledX) {
    const wGroup = new THREE.Group();
    const materials = [];

    const regMat = (mat, baseOpacity = 1.0) => {
      mat.transparent = true;
      mat.opacity = baseOpacity;
      mat.userData = { baseOpacity };
      materials.push(mat);
      return mat;
    };

    const chassisMat = regMat(
      new THREE.MeshStandardMaterial({
        color: 0x2b0909,
        metalness: 0.8,
        roughness: 0.35
      }),
      1.0
    );
    const chassis = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.22, 1.28), chassisMat);
    wGroup.add(chassis);

    // 4 roues
    const wheelGeo = new THREE.CylinderGeometry(0.24, 0.24, 0.14, 18);
    const wheelMat = regMat(
      new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.85, roughness: 0.3 }),
      1.0
    );
    [
      [-0.8, -0.18, 0.66],
      [-0.8, -0.18, -0.66],
      [0.8, -0.18, 0.66],
      [0.8, -0.18, -0.66]
    ].forEach(([wx, wy, wz]) => {
      const w = new THREE.Mesh(wheelGeo, wheelMat);
      w.rotation.x = Math.PI / 2;
      w.position.set(wx, wy, wz);
      wGroup.add(w);
    });

    // Verrière rouge translucide
    const glassMat = regMat(
      new THREE.MeshStandardMaterial({
        color: 0xef4444,
        emissive: 0x991b1b,
        emissiveIntensity: 0.3,
        depthWrite: false
      }),
      0.32
    );
    const canopy = new THREE.Mesh(new THREE.BoxGeometry(2.35, 0.95, 1.18), glassMat);
    canopy.position.y = 0.6;
    wGroup.add(canopy);

    // Cargaison pirate à l'intérieur
    const cargoMat = regMat(
      new THREE.MeshStandardMaterial({
        color: 0xdc2626,
        emissive: 0x7f1d1d,
        emissiveIntensity: 0.45,
        metalness: 0.5,
        roughness: 0.3
      }),
      1.0
    );
    const cargo = new THREE.Mesh(new THREE.BoxGeometry(1.15, 0.54, 0.74), cargoMat);
    cargo.position.y = 0.46;
    wGroup.add(cargo);

    // Plaque latérale indiquant "PIRATE #2", "#3", "#4"
    const pCanvas = document.createElement('canvas');
    pCanvas.width = 256;
    pCanvas.height = 128;
    const pCtx = pCanvas.getContext('2d');
    pCtx.fillStyle = '#1f0606';
    pCtx.fillRect(0, 0, 256, 128);
    pCtx.strokeStyle = '#ef4444';
    pCtx.lineWidth = 6;
    pCtx.strokeRect(3, 3, 250, 122);
    pCtx.fillStyle = '#fca5a5';
    pCtx.font = 'bold 26px monospace';
    pCtx.fillText(`PIRATE #${blockNumber}`, 22, 48);
    pCtx.fillStyle = '#ef4444';
    pCtx.font = '18px monospace';
    pCtx.fillText(blockNumber === 2 ? 'Triche : annule #1' : 'Suite pirate', 22, 90);
    const pTex = new THREE.CanvasTexture(pCanvas);
    const plateMat = regMat(new THREE.MeshBasicMaterial({ map: pTex }), 1.0);
    const plate = new THREE.Mesh(new THREE.PlaneGeometry(1.15, 0.56), plateMat);
    plate.position.set(0, 0.62, 0.605);
    wGroup.add(plate);

    // Bras d'attelage avant identique aux wagons officiels (pour s'emboîter dans le Wagon #1 à x = 7.6, z = 0)
    const couplerGroup = new THREE.Group();
    const linkLength = 1.2;
    const linkCenterX = -(1.3 + linkLength / 2);

    const sleeveMat = regMat(
      new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.9, roughness: 0.3 }),
      1.0
    );
    const sleeve = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.11, linkLength, 16), sleeveMat);
    sleeve.rotation.z = Math.PI / 2;
    couplerGroup.add(sleeve);

    const beamMat = regMat(
      new THREE.MeshStandardMaterial({
        color: 0xef4444,
        emissive: 0xdc2626,
        emissiveIntensity: 1.5
      }),
      1.0
    );
    const beam = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.065, linkLength + 0.04, 16), beamMat);
    beam.rotation.z = Math.PI / 2;
    couplerGroup.add(beam);

    const ringGeo = new THREE.CylinderGeometry(0.16, 0.16, 0.08, 24);
    const ringFront = new THREE.Mesh(ringGeo, beamMat);
    ringFront.rotation.z = Math.PI / 2;
    ringFront.position.x = -linkLength / 2;
    couplerGroup.add(ringFront);

    couplerGroup.position.set(linkCenterX, 0, 0);
    wGroup.add(couplerGroup);

    return {
      blockNumber,
      group: wGroup,
      couplerGroup,
      materials,
      coupledX,
      currentX: coupledX + this.branchOffsetX,
      currentZ: this.pirateBranchZ
    };
  },

  /**
   * Construit l'aiguillage en Y après le Wagon #1 (x = 3.8, z = 0) :
   * - Voie de préparation honnête en haut (z = -1.85)
   * - Voie de préparation pirate en bas (z = +1.85)
   * - Rail central (z = 0) sur lequel la chaîne gagnante vient s'aligner et s'attacher au Wagon #1.
   */
  buildParallelRaceScene() {
    const { scene } = this.ctx;
    if (!scene) return;

    if (this.attackGroup) {
      scene.remove(this.attackGroup);
    }

    this.attackGroup = new THREE.Group();
    this.pirateWagons = [];

    const railMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.85, roughness: 0.25 });
    const ballastMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.9 });
    const sleeperMat = new THREE.MeshStandardMaterial({ color: 0x3b1d0e, roughness: 0.9 });

    // Construit les deux voies de préparation symétriques après le Wagon #1 (z = -1.85 et z = +1.85)
    [this.honestBranchZ, this.pirateBranchZ].forEach((branchZ) => {
      const sign = Math.sign(branchZ);

      const ballast = new THREE.Mesh(new THREE.BoxGeometry(13.5, 0.14, 2.1), ballastMat);
      ballast.position.set(12.2, -0.46, branchZ);
      this.attackGroup.add(ballast);

      const railGeo = new THREE.BoxGeometry(13.5, 0.1, 0.07);
      const railL = new THREE.Mesh(railGeo, railMat);
      railL.position.set(12.2, -0.34, branchZ - 0.66);
      this.attackGroup.add(railL);

      const railR = new THREE.Mesh(railGeo, railMat);
      railR.position.set(12.2, -0.34, branchZ + 0.66);
      this.attackGroup.add(railR);

      const sleeperGeo = new THREE.BoxGeometry(0.26, 0.08, 1.75);
      for (let x = 6.2; x <= 18.2; x += 1.2) {
        const sleeper = new THREE.Mesh(sleeperGeo, sleeperMat);
        sleeper.position.set(x, -0.42, branchZ);
        this.attackGroup.add(sleeper);
      }

      // Rails d'aiguillage reliant l'arrière du Wagon #1 (x = 5.2, z = 0) à chaque branche
      const switchGeo = new THREE.BoxGeometry(2.6, 0.09, 0.07);
      [-0.66, 0.66].forEach((offsetZ) => {
        const swRail = new THREE.Mesh(switchGeo, railMat);
        swRail.position.set(5.9, -0.33, branchZ / 2 + offsetZ);
        swRail.rotation.y = -sign * 0.68;
        this.attackGroup.add(swRail);
      });
    });

    // Les 3 wagons pirates candidats (#2, #3, #4 aux positions couplées 7.6, 11.4, 15.2)
    for (let bNum = 2; bNum <= 4; bNum++) {
      const coupledX = bNum * 3.8;
      const pw = this.createPirateWagonMesh(bNum, coupledX);
      pw.group.position.set(pw.currentX, 0, pw.currentZ);
      this.attackGroup.add(pw.group);
      this.pirateWagons.push(pw);
    }

    // Molette des Gares honnêtes (en haut, z = -3.65) et Molette du Pirate (en bas, z = +3.65)
    this.honestWheelObj = this.createStationWheelNode(8.2, -3.65, 0x38bdf8, '#38bdf8');
    this.pirateWheelObj = this.createStationWheelNode(8.2, 3.65, 0xef4444, '#ef4444');
    this.attackGroup.add(this.honestWheelObj.group);
    this.attackGroup.add(this.pirateWheelObj.group);

    // Anneau flash au point d'attelage derrière le Wagon #1 (x = 5.28, z = 0)
    const flashGeo = new THREE.TorusGeometry(0.25, 0.04, 12, 32);
    flashGeo.rotateY(Math.PI / 2);
    const flashMat = new THREE.MeshBasicMaterial({
      color: 0x10b981,
      transparent: true,
      opacity: 0
    });
    this.couplerFlashRing = new THREE.Mesh(flashGeo, flashMat);
    this.couplerFlashRing.position.set(5.28, 0.02, 0);
    this.attackGroup.add(this.couplerFlashRing);

    scene.add(this.attackGroup);
  },

  /**
   * Place le tronc commun (Locomotive #0 + Wagon #1 sur z = 0) et les deux branches candidates
   * détachées (sur z = -1.85 et z = +1.85) avant le départ de la course.
   */
  resetWagonsToStart() {
    const { trainConvoy } = this.ctx;
    this.honestBranchCount = 1;
    this.pirateBranchCount = 1;
    this.wasWinnerCoupled = false;
    this.couplerFlashAlpha = 0;

    if (trainConvoy) {
      // Wagon #1 reste fixe sur le rail central (z = 0) derrière la Locomotive (#0)
      const w1 = trainConvoy.getWagon(1);
      if (w1) {
        w1.visible = true;
        w1.position.set(3.8, 0, 0);
        w1.scale.setScalar(1.0);
        w1.updateStatus(true);
      }

      // Wagons #2, #3, #4 (branche honnête) commencent sur la voie de préparation haute (z = -1.85), détachés du Wagon #1
      for (let i = 2; i <= 4; i++) {
        const w = trainConvoy.getWagon(i);
        if (!w) continue;
        w.updateStatus(true);
        const uncoupledX = i * 3.8 + this.branchOffsetX;
        if (i === 2) {
          w.visible = true;
          w.position.set(uncoupledX, 0, this.honestBranchZ);
          w.scale.setScalar(1.0);
          if (w.couplerGroup && w.defaultCouplerPosition) {
            w.couplerGroup.position.y = w.defaultCouplerPosition.y - 0.12;
            w.couplerGroup.rotation.z = 0.12;
          }
        } else {
          w.visible = false;
          w.position.set(uncoupledX + 1.3, 0, this.honestBranchZ);
          w.scale.setScalar(0.01);
        }
      }
    }

    // Wagons pirates #2, #3, #4 commencent symétriquement sur la voie de préparation basse (z = +1.85), détachés du Wagon #1
    this.pirateWagons.forEach((pw, idx) => {
      pw.materials.forEach((m) => {
        m.opacity = m.userData.baseOpacity;
      });
      const uncoupledX = pw.coupledX + this.branchOffsetX;
      pw.currentZ = this.pirateBranchZ;
      if (idx === 0) {
        pw.group.visible = true;
        pw.currentX = uncoupledX;
        pw.group.position.set(pw.currentX, 0, pw.currentZ);
        pw.group.scale.setScalar(1.0);
        pw.couplerGroup.position.y = -0.12;
        pw.couplerGroup.rotation.z = 0.12;
      } else {
        pw.group.visible = false;
        pw.currentX = uncoupledX + 1.3;
        pw.group.position.set(pw.currentX, 0, pw.currentZ);
        pw.group.scale.setScalar(0.01);
        pw.couplerGroup.position.y = 0;
        pw.couplerGroup.rotation.z = 0;
      }
    });

    if (this.honestWheelObj) {
      this.honestWheelObj.currentCrans = 0;
      this.honestWheelObj.currentAngle = 0;
      this.honestWheelObj.wheelMesh.rotation.set(Math.PI / 2, 0, 0);
      this.renderWheelDial(this.honestWheelObj.dialCanvas, this.honestWheelObj.dialTex, 0, '#38bdf8');
    }

    if (this.pirateWheelObj) {
      this.pirateWheelObj.currentCrans = 0;
      this.pirateWheelObj.currentAngle = 0;
      this.pirateWheelObj.wheelMesh.rotation.set(Math.PI / 2, 0, 0);
      this.renderWheelDial(this.pirateWheelObj.dialCanvas, this.pirateWheelObj.dialTex, 0, '#ef4444');
    }
  },

  /**
   * Bascule entre le Cas normal (Pirate 20 %) et l'Attaque des 51 % (Pirate 60 %).
   */
  setMode(targetMode) {
    if (this.mode === targetMode || this.raceState === 'running') return;
    this.mode = targetMode;
    this.raceState = 'idle';
    this.raceTimer = 0;
    this.resetWagonsToStart();
    this.updateTooltipsDOM();
    this.renderLeftPanel();
  },

  /**
   * Lance la course d'assemblage des wagons après le Wagon #1.
   */
  startRace() {
    if (this.raceState === 'running') return;
    this.resetWagonsToStart();
    this.raceState = 'running';
    this.raceTimer = 0;
    this.updateTooltipsDOM();
    this.renderLeftPanel();
  },

  /**
   * Initialise le conteneur DOM pour les infobulles 3D.
   */
  setupTooltipsLayer() {
    const hud = document.getElementById('hud');
    if (!hud) return;

    if (!this.tooltipLayer) {
      this.tooltipLayer = document.createElement('div');
      this.tooltipLayer.id = 'step7-tooltips-layer';
      this.tooltipLayer.className = 'scene-tooltips-layer';
      hud.appendChild(this.tooltipLayer);
    }
    this.tooltipLayer.innerHTML = '';
  },

  /**
   * Crée les 2 infobulles SVG pointant sur la Branche honnête et la Branche pirate.
   */
  createRaceTooltips() {
    if (!this.tooltipLayer) return;

    this.tooltipLayer.innerHTML = `
      <svg id="step7-tooltips-svg" style="position: absolute; inset: 0; width: 100%; height: 100%; pointer-events: none; overflow: visible; z-index: 10;">
        <line id="s7-line-official" stroke="#38bdf8" stroke-width="2" stroke-linecap="round" opacity="0.85" />
        <circle id="s7-dot-out-official" r="6.5" fill="none" stroke="#38bdf8" stroke-width="1.5" opacity="0.8" />
        <circle id="s7-dot-in-official" r="3" fill="#38bdf8" />

        <line id="s7-line-pirate" stroke="#ef4444" stroke-width="2" stroke-linecap="round" opacity="0.85" />
        <circle id="s7-dot-out-pirate" r="6.5" fill="none" stroke="#ef4444" stroke-width="1.5" opacity="0.8" />
        <circle id="s7-dot-in-pirate" r="3" fill="#ef4444" />
      </svg>

      <div id="tooltip-s7-official" class="scene-tooltip" style="--spot-color: #38bdf8; z-index: 12;">
        <button type="button" class="scene-tooltip-pill">
          <span class="scene-tooltip-dot"></span>
          <span class="scene-tooltip-label" id="s7-label-official"></span>
        </button>
      </div>

      <div id="tooltip-s7-pirate" class="scene-tooltip" style="--spot-color: #ef4444; z-index: 12;">
        <button type="button" class="scene-tooltip-pill">
          <span class="scene-tooltip-dot"></span>
          <span class="scene-tooltip-label" id="s7-label-pirate"></span>
        </button>
      </div>
    `;

    ['tooltip-s7-official', 'tooltip-s7-pirate'].forEach((id) => {
      document.getElementById(id)?.addEventListener('pointerdown', (e) => e.stopPropagation());
    });

    this.updateTooltipsDOM();
  },

  /**
   * Met à jour les 2 infobulles 3D selon l'état de la course et indique quelle branche est attachée au Wagon #1.
   */
  updateTooltipsDOM() {
    const isNormal = this.mode === 'normal';
    const honestShare = isNormal ? '80 %' : '40 %';
    const pirateShare = isNormal ? '20 %' : '60 %';

    const offWrap = document.getElementById('tooltip-s7-official');
    const offLabel = document.getElementById('s7-label-official');
    const offLine = document.getElementById('s7-line-official');
    const offDotIn = document.getElementById('s7-dot-in-official');
    const offDotOut = document.getElementById('s7-dot-out-official');

    const pirWrap = document.getElementById('tooltip-s7-pirate');
    const pirLabel = document.getElementById('s7-label-pirate');
    const pirLine = document.getElementById('s7-line-pirate');
    const pirDotIn = document.getElementById('s7-dot-in-pirate');
    const pirDotOut = document.getElementById('s7-dot-out-pirate');

    const hWords = `+${this.honestBranchCount} wagon${this.honestBranchCount > 1 ? 's' : ''}`;
    const pWords = `+${this.pirateBranchCount} wagon${this.pirateBranchCount > 1 ? 's' : ''}`;

    let offColor = '#38bdf8';
    let pirColor = '#ef4444';
    let offHTML = `<strong>Branche honnête (${honestShare})</strong> · ${hWords} (en attente)`;
    let pirHTML = `<strong>Branche pirate (${pirateShare})</strong> · ${pWords} (en attente)`;

    if (this.raceState === 'running') {
      offHTML = `<strong>Branche honnête (${honestShare})</strong> · ${hWords}`;
      pirHTML = `<strong>Branche pirate (${pirateShare})</strong> · ${pWords}`;
    } else if (this.raceState === 'done') {
      if (isNormal) {
        offColor = '#10b981';
        pirColor = '#64748b';
        offHTML = `<strong>Branche honnête (${honestShare})</strong> · +3 wagons (Attachée au Wagon #1 !)`;
        pirHTML = `<strong>Branche pirate (${pirateShare})</strong> · +1 wagon (Trop courte — isolée)`;
      } else {
        offColor = '#64748b';
        pirColor = '#ef4444';
        offHTML = `<strong>Branche honnête (${honestShare})</strong> · +1 wagon (Trop courte — isolée)`;
        pirHTML = `<strong>Branche pirate (${pirateShare})</strong> · +3 wagons (Attachée au Wagon #1 !)`;
      }
    }

    offWrap?.style.setProperty('--spot-color', offColor);
    if (offLabel) offLabel.innerHTML = offHTML;
    offLine?.setAttribute('stroke', offColor);
    offDotIn?.setAttribute('fill', offColor);
    offDotOut?.setAttribute('stroke', offColor);

    pirWrap?.style.setProperty('--spot-color', pirColor);
    if (pirLabel) pirLabel.innerHTML = pirHTML;
    pirLine?.setAttribute('stroke', pirColor);
    pirDotIn?.setAttribute('fill', pirColor);
    pirDotOut?.setAttribute('stroke', pirColor);
  },

  startAnimationLoop() {
    this.stopAnimationLoop();

    const setLineAndDot = (lineId, dotInId, dotOutId, x1, y1, x2, y2) => {
      const line = document.getElementById(lineId);
      const dotIn = document.getElementById(dotInId);
      const dotOut = document.getElementById(dotOutId);
      if (line) {
        line.setAttribute('x1', x1.toFixed(1));
        line.setAttribute('y1', y1.toFixed(1));
        line.setAttribute('x2', x2.toFixed(1));
        line.setAttribute('y2', y2.toFixed(1));
      }
      if (dotIn && dotOut) {
        dotIn.setAttribute('cx', x2.toFixed(1));
        dotIn.setAttribute('cy', y2.toFixed(1));
        dotOut.setAttribute('cx', x2.toFixed(1));
        dotOut.setAttribute('cy', y2.toFixed(1));
      }
    };

    let lastTime = performance.now();

    const loop = () => {
      const now = performance.now();
      const dt = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;

      const { trainConvoy, camera } = this.ctx;
      const isNormal = this.mode === 'normal';
      const isDone = this.raceState === 'done';

      // 1. Progression de la course entre les 2 branches candidates après le Wagon #1
      if (this.raceState === 'running') {
        this.raceTimer += dt;
        const p = Math.min(this.raceTimer / this.raceDuration, 1.0);

        const honestMaxCrans = isNormal ? 30 : 12;
        const pirateMaxCrans = isNormal ? 9 : 28;

        if (this.honestWheelObj) {
          const hCrans = Math.max(1, Math.floor(honestMaxCrans * p));
          if (hCrans !== this.honestWheelObj.currentCrans) {
            this.honestWheelObj.currentCrans = hCrans;
            this.renderWheelDial(this.honestWheelObj.dialCanvas, this.honestWheelObj.dialTex, hCrans, '#38bdf8');
          }
          this.honestWheelObj.currentAngle = THREE.MathUtils.lerp(
            this.honestWheelObj.currentAngle,
            hCrans * (Math.PI / 4),
            Math.min(1, dt * 18)
          );
          this.honestWheelObj.wheelMesh.rotation.set(Math.PI / 2, this.honestWheelObj.currentAngle, 0);
        }

        if (this.pirateWheelObj) {
          const pCrans = Math.max(1, Math.floor(pirateMaxCrans * p));
          if (pCrans !== this.pirateWheelObj.currentCrans) {
            this.pirateWheelObj.currentCrans = pCrans;
            this.renderWheelDial(this.pirateWheelObj.dialCanvas, this.pirateWheelObj.dialTex, pCrans, '#ef4444');
          }
          this.pirateWheelObj.currentAngle = THREE.MathUtils.lerp(
            this.pirateWheelObj.currentAngle,
            pCrans * (Math.PI / 4),
            Math.min(1, dt * 18)
          );
          this.pirateWheelObj.wheelMesh.rotation.set(Math.PI / 2, this.pirateWheelObj.currentAngle, 0);
        }

        // Assemblage progressif des wagons #2, #3, #4 (de 1 à 3 wagons sur la branche la plus rapide)
        const newHonest = isNormal ? (p >= 0.72 ? 3 : p >= 0.36 ? 2 : 1) : 1;
        const newPirate = isNormal ? 1 : (p >= 0.72 ? 3 : p >= 0.36 ? 2 : 1);

        if (newHonest !== this.honestBranchCount || newPirate !== this.pirateBranchCount) {
          this.honestBranchCount = newHonest;
          this.pirateBranchCount = newPirate;
          this.updateTooltipsDOM();
        }

        if (p >= 1.0) {
          this.raceState = 'done';
          if (isNormal) this.hasTestedNormal = true;
          else this.hasTestedAttack51 = true;

          this.updateTooltipsDOM();
          this.renderLeftPanel();
        }
      }

      // 2. Déplacement et attachement au Wagon #1 de la branche honnête (Wagons #2, #3, #4)
      const honestWins = isDone && isNormal;
      const pirateWins = isDone && !isNormal;

      if (trainConvoy) {
        for (let i = 2; i <= 4; i++) {
          const w = trainConvoy.getWagon(i);
          if (!w) continue;
          const branchIdx = i - 1; // 1, 2 ou 3
          const active = branchIdx <= this.honestBranchCount;
          w.visible = active;

          if (active) {
            // Si la branche honnête gagne, elle glisse sur le rail central (z = 0) et s'attache à x = 7.6, 11.4, 15.2
            const targetX = honestWins ? i * 3.8 : i * 3.8 + this.branchOffsetX;
            const targetZ = honestWins ? 0 : this.honestBranchZ;

            w.position.x = THREE.MathUtils.lerp(w.position.x, targetX, Math.min(1, dt * 7.5));
            w.position.z = THREE.MathUtils.lerp(w.position.z, targetZ, Math.min(1, dt * 7.5));
            const nextScale = THREE.MathUtils.lerp(w.scale.x, 1.0, Math.min(1, dt * 10));
            w.scale.setScalar(nextScale);

            // Redresse le crochet d'attelage du Wagon #2 quand il s'emboîte dans le Wagon #1
            if (i === 2 && w.couplerGroup && w.defaultCouplerPosition) {
              const isCoupled = honestWins && Math.abs(w.position.z) < 0.08 && Math.abs(w.position.x - 7.6) < 0.08;
              if (isCoupled) {
                w.couplerGroup.position.copy(w.defaultCouplerPosition);
                w.couplerGroup.rotation.z = 0;
                if (!this.wasWinnerCoupled) {
                  this.wasWinnerCoupled = true;
                  this.couplerFlashAlpha = 1.0;
                  this.couplerFlashRing?.material.color.setHex(0x10b981);
                }
              } else {
                w.couplerGroup.position.y = w.defaultCouplerPosition.y - 0.12;
                w.couplerGroup.rotation.z = 0.12;
              }
            }

            if (w.beaconMaterial && pirateWins) {
              w.beaconMaterial.color.setHex(0x64748b);
              w.beaconMaterial.emissive.setHex(0x334155);
            }
          }
        }
      }

      // 3. Déplacement et attachement au Wagon #1 de la branche pirate (Pirate #2, #3, #4)
      this.pirateWagons.forEach((pw, idx) => {
        const active = idx + 1 <= this.pirateBranchCount;
        pw.group.visible = active;

        if (active) {
          // Si la branche pirate gagne (Attaque 51 %), elle glisse sur le rail central (z = 0) et s'attache au Wagon #1 !
          const targetX = pirateWins ? pw.coupledX : pw.coupledX + this.branchOffsetX;
          const targetZ = pirateWins ? 0 : this.pirateBranchZ;

          pw.currentX = THREE.MathUtils.lerp(pw.currentX, targetX, Math.min(1, dt * 7.5));
          pw.currentZ = THREE.MathUtils.lerp(pw.currentZ, targetZ, Math.min(1, dt * 7.5));
          pw.group.position.set(pw.currentX, 0, pw.currentZ);

          const nextScale = THREE.MathUtils.lerp(pw.group.scale.x, 1.0, Math.min(1, dt * 10));
          pw.group.scale.setScalar(nextScale);

          if (idx === 0) {
            const isCoupled = pirateWins && Math.abs(pw.currentZ) < 0.08 && Math.abs(pw.currentX - 7.6) < 0.08;
            if (isCoupled) {
              pw.couplerGroup.position.y = 0;
              pw.couplerGroup.rotation.z = 0;
              if (!this.wasWinnerCoupled) {
                this.wasWinnerCoupled = true;
                this.couplerFlashAlpha = 1.0;
                this.couplerFlashRing?.material.color.setHex(0xef4444);
              }
            } else {
              pw.couplerGroup.position.y = -0.12;
              pw.couplerGroup.rotation.z = 0.12;
            }
          }

          const isAbandoned = honestWins;
          pw.materials.forEach((m) => {
            const targetOp = isAbandoned ? m.userData.baseOpacity * 0.28 : m.userData.baseOpacity;
            m.opacity = THREE.MathUtils.lerp(m.opacity, targetOp, Math.min(1, dt * 5));
          });
        }
      });

      // 4. Aura circulaire au verrouillage exact sur l'arrière du Wagon #1 (x = 5.28, z = 0)
      if (this.couplerFlashRing) {
        if (this.couplerFlashAlpha > 0.01) {
          this.couplerFlashAlpha = Math.max(0, this.couplerFlashAlpha - dt * 1.4);
          const scale = 1.0 + (1.0 - this.couplerFlashAlpha) * 2.2;
          this.couplerFlashRing.scale.setScalar(scale);
          this.couplerFlashRing.material.opacity = this.couplerFlashAlpha * 0.85;
          this.couplerFlashRing.visible = true;
        } else {
          this.couplerFlashRing.visible = false;
        }
      }

      // 5. Projection 2D des 2 infobulles suivant en direct la position des deux branches
      if (this.tooltipLayer && camera) {
        const width = window.innerWidth;
        const height = window.innerHeight;
        const toX = (v) => (v.x * 0.5 + 0.5) * width;
        const toY = (v) => (-v.y * 0.5 + 0.5) * height;

        const w2 = trainConvoy?.getWagon(2);
        const p2 = this.pirateWagons[0];

        const offWorld = new THREE.Vector3(
          w2 ? w2.position.x + 1.2 : 8.8,
          1.08,
          w2 ? w2.position.z : this.honestBranchZ
        ).project(camera);

        const pirWorld = new THREE.Vector3(
          p2 ? p2.currentX + 1.2 : 8.8,
          1.02,
          p2 ? p2.currentZ : this.pirateBranchZ
        ).project(camera);

        if (offWorld.z > 1 || pirWorld.z > 1) {
          this.tooltipLayer.style.opacity = '0';
          this.tooltipLayer.style.visibility = 'hidden';
        } else {
          const offX = toX(offWorld);
          const offY = toY(offWorld);
          const pirX = toX(pirWorld);
          const pirY = toY(pirWorld);

          const isCovered = width > 768 && offX < 395;
          this.tooltipLayer.style.opacity = isCovered ? '0' : '1';
          this.tooltipLayer.style.visibility = isCovered ? 'hidden' : 'visible';

          const offPillX = Math.max(465, Math.min(width - 235, offX));
          const offPillY = Math.max(58, offY - 54);
          const offEl = document.getElementById('tooltip-s7-official');
          if (offEl) {
            offEl.style.transform = `translate3d(${offPillX.toFixed(1)}px, ${offPillY.toFixed(1)}px, 0) translate(-50%, -50%)`;
          }
          setLineAndDot('s7-line-official', 's7-dot-in-official', 's7-dot-out-official', offPillX, offPillY + 14, offX, offY);

          const pirPillX = Math.max(465, Math.min(width - 235, pirX));
          const pirPillY = Math.min(height - 48, pirY + 56);
          const pirEl = document.getElementById('tooltip-s7-pirate');
          if (pirEl) {
            pirEl.style.transform = `translate3d(${pirPillX.toFixed(1)}px, ${pirPillY.toFixed(1)}px, 0) translate(-50%, -50%)`;
          }
          setLineAndDot('s7-line-pirate', 's7-dot-in-pirate', 's7-dot-out-pirate', pirPillX, pirPillY - 14, pirX, pirY);
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

  renderLeftPanel() {
    const panel = document.getElementById('step-panel-left');
    if (!panel) return;

    panel.classList.add('active');

    const oldInner = panel.querySelector('.step-panel-inner');
    if (oldInner) oldInner.remove();

    const inner = document.createElement('div');
    inner.className = 'step-panel-inner';

    const isNormal = this.mode === 'normal';
    const isRunning = this.raceState === 'running';
    const isDone = this.raceState === 'done';

    const buttonLabel = isRunning
      ? 'Course des 2 branches en cours...'
      : isDone
        ? 'Relancer la course'
        : 'Lancer la course des 2 branches';

    const modeBannerHTML = isNormal
      ? `
        <div class="share-meaning-banner">
          <strong>Cas réel (80 % contre 20 %) :</strong> les gares honnêtes réunies possèdent 80 % de la puissance du réseau, contre 20 % pour le pirate seul.
        </div>
      `
      : `
        <div class="share-meaning-banner" style="border-left-color: #ef4444;">
          <strong>Hypothèse d'attaque (> 51 %) :</strong> imaginez que le pirate contrôle à lui seul <strong>60 % des machines du réseau</strong> contre 40 % pour les gares honnêtes.
        </div>
      `;

    const resultHTML = isDone
      ? isNormal
        ? `
          <p style="margin: 10px 0 0 0;">
            La branche honnête est plus longue (<strong>+3 wagons contre +1</strong>) : c'est elle qui vient <strong>s'attacher au Wagon #1</strong> sur le rail central, tandis que le wagon pirate reste isolé.
          </p>
        `
        : `
          <p style="margin: 10px 0 0 0;">
            Avec 60 % de la puissance, la branche pirate est devenue plus longue (<strong>+3 wagons contre +1</strong>) : c'est donc la <strong>branche pirate qui s'attache au Wagon #1</strong> sur le rail central !
          </p>
        `
      : '';

    inner.innerHTML = `
      <header class="step-panel-header">
        <h2 class="step-panel-title">Attaque des 51 %</h2>
      </header>

      <div class="step-panel-scroll">
        <article class="step-card context-card animate-fade">
          <h3 class="card-title">Deux suites possibles après le Wagon #1</h3>
          <p>
            La Locomotive (<code>#0</code>) et le <strong>Wagon #1</strong> sont déjà sur les rails. Juste derrière le Wagon #1, un pirate crée un <strong>aiguillage</strong> pour tenter d'attacher sa propre file de wagons à la place de la suite honnête.
          </p>
          <p>
            Règle automatique du réseau : <strong>seule la file qui compte le plus de wagons a le droit de s'attacher au Wagon #1</strong>.
          </p>
        </article>

        <article class="step-card action-card animate-fade">
          <div class="difficulty-selector-row" role="tablist" aria-label="Choix du scénario">
            <button id="btn-tab-normal" class="btn-diff-option ${isNormal ? 'active' : ''}" role="tab" aria-selected="${isNormal}" ${isRunning ? 'disabled' : ''}>
              <span>Cas normal (Pirate 20 %)</span>
            </button>
            <button id="btn-tab-attack51" class="btn-diff-option ${!isNormal ? 'active' : ''}" role="tab" aria-selected="${!isNormal}" ${isRunning ? 'disabled' : ''}>
              <span>Attaque 51 % (Pirate 60 %)</span>
            </button>
          </div>

          ${modeBannerHTML}

          <button id="btn-step7-run" class="btn-panel-primary" ${isRunning ? 'disabled' : ''}>
            <span>${buttonLabel}</span>
          </button>

          ${resultHTML}
        </article>

        ${(this.hasTestedNormal || this.hasTestedAttack51) ? `
          <article class="step-card keypoint-card animate-fade">
            <h4 class="card-title keypoint-title">Point clé : Pourquoi l'attaque des 51 % est quasi impossible</h4>
            <p class="keypoint-text">
              Pour que sa branche dépasse la branche honnête et s'attache au train, un tricheur doit fabriquer des wagons plus vite que tout le reste du monde réuni (posséder <strong>plus de 51 %</strong> des machines en PoW ou de la caution en PoS).
            </p>
          </article>
        ` : ''}

        <nav class="step-nav-bar animate-fade">
          <button id="btn-step7-action-prev" class="btn-panel-ghost">
            <span class="btn-arrow">&larr;</span>
            <span>Étape 6 : Consensus</span>
          </button>
          <button id="btn-step7-restart" class="btn-panel-primary">
            <span>Accueil (Étape 0)</span>
            <span class="btn-arrow">&rarr;</span>
          </button>
        </nav>
      </div>
    `;

    panel.prepend(inner);
    this.setupEvents();
  },

  setupEvents() {
    document.getElementById('btn-tab-normal')?.addEventListener('click', () => {
      this.setMode('normal');
    });

    document.getElementById('btn-tab-attack51')?.addEventListener('click', () => {
      this.setMode('attack51');
    });

    document.getElementById('btn-step7-run')?.addEventListener('click', () => {
      this.startRace();
    });

    document.getElementById('btn-step7-action-prev')?.addEventListener('click', () => {
      if (typeof this.ctx.onPrevStep === 'function') {
        this.ctx.onPrevStep();
      }
    });

    document.getElementById('btn-step7-restart')?.addEventListener('click', () => {
      if (typeof this.ctx.onGoToStep === 'function') {
        this.ctx.onGoToStep(0);
      }
    });
  }
};
