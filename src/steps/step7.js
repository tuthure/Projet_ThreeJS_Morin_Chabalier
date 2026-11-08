import * as THREE from 'three';

/**
 * Étape 7 : Attaque des 51 % et règle de la chaîne la plus longue.
 * Liens logiques avec les étapes précédentes :
 * 1. Pourquoi créer une voie bis (Fork) ? À l'étape 3, on a vu qu'on ne peut pas modifier
 *    un wagon déjà accroché. Pour annuler un paiement du Wagon #1, le pirate place donc un
 *    aiguillage juste après la Locomotive (#0) pour construire sa propre file de wagons sur une voie bis.
 * 2. Comment le réseau choisit-il entre les deux trains ? Il garde toujours le train qui a
 *    le plus de wagons (la chaîne la plus longue).
 * 3. Deux cas à comparer :
 *    - Cas normal (Gares honnêtes 80 % vs Pirate 20 %) : les gares honnêtes assemblent 4 wagons
 *      pendant que le pirate n'en assemble que 2 -> la voie pirate est abandonnée.
 *    - Attaque des 51 % (Pirate 60 % vs Gares honnêtes 40 %) : le pirate possède plus de la moitié
 *      de la puissance du réseau, assemble 4 wagons contre 2, et impose son train pirate.
 */
export const step7 = {
  id: 7,
  title: 'Attaque des 51 % et chaîne la plus longue',
  ctx: null,

  rafId: null,
  mode: 'normal', // 'normal' (Pirate 20 % vs 80 %) | 'attack51' (Pirate 60 % vs 40 %)
  raceState: 'idle', // 'idle' | 'running' | 'done'
  raceTimer: 0,
  raceDuration: 2.8,
  hasTestedNormal: false,
  hasTestedAttack51: false,

  honestCount: 1,
  pirateCount: 1,

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
    this.honestCount = 1;
    this.pirateCount = 1;

    if (cameraController) {
      cameraController.setViewOffset(210);
    }

    if (environment) {
      environment.setSpeed(0);
    }

    // Crée la Locomotive (#0) et 4 wagons sur la voie officielle (seul le Wagon #1 est visible au départ)
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
        new THREE.Vector3(7.4, 5.2, 14.2),
        new THREE.Vector3(7.2, 0.3, 1.4),
        1.15
      );
    }

    this.startAnimationLoop();
    this.renderLeftPanel();
  },

  exit() {
    this.stopAnimationLoop();

    // Restaure la visibilité et la position nominale des wagons officiels avant de quitter
    const { trainConvoy } = this.ctx || {};
    if (trainConvoy) {
      for (let i = 1; i <= 4; i++) {
        const w = trainConvoy.getWagon(i);
        if (w) {
          w.visible = true;
          w.position.x = i * 3.8;
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
   * Crée un socle avec une molette Nonce 3D à 8 crans (pour les gares honnêtes ou pour le pirate).
   */
  createStationWheelNode(x, z, mainColorHex, borderHexStr) {
    const group = new THREE.Group();
    group.position.set(x, -0.4, z);

    const platform = new THREE.Mesh(
      new THREE.CylinderGeometry(0.88, 1.0, 0.18, 24),
      new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.65, metalness: 0.3 })
    );
    group.add(platform);

    const ringMat = new THREE.MeshBasicMaterial({ color: mainColorHex, side: THREE.DoubleSide });
    const ring = new THREE.Mesh(new THREE.RingGeometry(0.91, 1.06, 32), ringMat);
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = 0.1;
    group.add(ring);

    const stand = new THREE.Mesh(
      new THREE.BoxGeometry(0.34, 0.68, 0.18),
      new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.85, roughness: 0.3 })
    );
    stand.position.set(0, 0.4, -0.05);
    group.add(stand);

    const wheelMesh = new THREE.Mesh(
      new THREE.CylinderGeometry(0.38, 0.38, 0.12, 24),
      new THREE.MeshStandardMaterial({
        color: 0x78350f,
        metalness: 0.8,
        roughness: 0.35,
        emissive: 0x451a03,
        emissiveIntensity: 0.25
      })
    );
    wheelMesh.rotation.x = Math.PI / 2;
    wheelMesh.position.set(0, 0.62, 0.08);
    group.add(wheelMesh);

    const toothGeo = new THREE.BoxGeometry(0.08, 0.12, 0.1);
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
      tooth.position.set(Math.cos(angle) * 0.4, 0, Math.sin(angle) * 0.4);
      tooth.rotation.y = -angle + Math.PI / 2;
      wheelMesh.add(tooth);
    }

    const dialCanvas = document.createElement('canvas');
    dialCanvas.width = 256;
    dialCanvas.height = 256;
    const dialTex = new THREE.CanvasTexture(dialCanvas);
    this.renderWheelDial(dialCanvas, dialTex, 0, borderHexStr);

    const dialMesh = new THREE.Mesh(
      new THREE.CircleGeometry(0.34, 32),
      new THREE.MeshBasicMaterial({ map: dialTex, transparent: true })
    );
    dialMesh.position.set(0, 0.62, 0.145);
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
   * Construit un wagon pirate 3D à la position cible donnée sur la voie bis (z = 3.1).
   */
  createPirateWagonMesh(index, targetX) {
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
    const chassis = new THREE.Mesh(new THREE.BoxGeometry(2.55, 0.22, 1.24), chassisMat);
    wGroup.add(chassis);

    // 4 roues
    const wheelGeo = new THREE.CylinderGeometry(0.22, 0.22, 0.14, 18);
    const wheelMat = regMat(
      new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.85, roughness: 0.3 }),
      1.0
    );
    [
      [-0.78, -0.18, 0.64],
      [-0.78, -0.18, -0.64],
      [0.78, -0.18, 0.64],
      [0.78, -0.18, -0.64]
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
    const canopy = new THREE.Mesh(new THREE.BoxGeometry(2.3, 0.92, 1.15), glassMat);
    canopy.position.y = 0.58;
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
    const cargo = new THREE.Mesh(new THREE.BoxGeometry(1.15, 0.52, 0.72), cargoMat);
    cargo.position.y = 0.44;
    wGroup.add(cargo);

    // Plaque latérale indiquant "BLOC PIRATE #X"
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
    pCtx.fillText(`PIRATE #${index}`, 22, 48);
    pCtx.fillStyle = '#ef4444';
    pCtx.font = '18px monospace';
    pCtx.fillText(index === 1 ? 'Triche : garde 20' : 'Bloc pirate suivant', 22, 90);
    const pTex = new THREE.CanvasTexture(pCanvas);
    const plateMat = regMat(new THREE.MeshBasicMaterial({ map: pTex }), 1.0);
    const plate = new THREE.Mesh(new THREE.PlaneGeometry(1.1, 0.54), plateMat);
    plate.position.set(0, 0.6, 0.585);
    wGroup.add(plate);

    // Bras d'attelage avant
    const couplerMat = regMat(
      new THREE.MeshStandardMaterial({
        color: 0xef4444,
        emissive: 0xdc2626,
        emissiveIntensity: 1.2
      }),
      1.0
    );
    if (index === 1) {
      // Le 1er wagon pirate est relié en biais à la Locomotive #0 (aiguillage)
      const diagBeam = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.055, 3.6, 12), couplerMat);
      diagBeam.rotation.z = Math.PI / 2;
      diagBeam.rotation.y = 0.92;
      diagBeam.position.set(-1.95, 0.02, -1.45);
      wGroup.add(diagBeam);
    } else {
      const straightBeam = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 1.25, 12), couplerMat);
      straightBeam.rotation.z = Math.PI / 2;
      straightBeam.position.set(-1.9, 0.02, 0);
      wGroup.add(straightBeam);
    }

    return {
      index,
      group: wGroup,
      materials,
      targetX,
      currentX: targetX
    };
  },

  /**
   * Construit l'aiguillage, la voie bis parallèle (z = 3.1), les 4 wagons pirates
   * et les 2 molettes de minage (Gares honnêtes en haut, Pirate en bas).
   */
  buildParallelRaceScene() {
    const { scene } = this.ctx;
    if (!scene) return;

    if (this.attackGroup) {
      scene.remove(this.attackGroup);
    }

    this.attackGroup = new THREE.Group();
    this.pirateWagons = [];

    const parallelZ = 3.1;

    // 1. Ballast et rails de la voie bis pirate (partant après la Locomotive #0)
    const ballastGeo = new THREE.BoxGeometry(22, 0.14, 2.3);
    const ballastMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.9 });
    const ballast = new THREE.Mesh(ballastGeo, ballastMat);
    ballast.position.set(10.5, -0.46, parallelZ);
    this.attackGroup.add(ballast);

    const railGeo = new THREE.BoxGeometry(22, 0.1, 0.07);
    const railMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.85, roughness: 0.25 });

    const railL = new THREE.Mesh(railGeo, railMat);
    railL.position.set(10.5, -0.34, parallelZ - 0.66);
    this.attackGroup.add(railL);

    const railR = new THREE.Mesh(railGeo, railMat);
    railR.position.set(10.5, -0.34, parallelZ + 0.66);
    this.attackGroup.add(railR);

    const sleeperGeo = new THREE.BoxGeometry(0.28, 0.08, 1.85);
    const sleeperMat = new THREE.MeshStandardMaterial({ color: 0x3b1d0e, roughness: 0.9 });
    for (let x = 1.6; x <= 19.5; x += 1.2) {
      const sleeper = new THREE.Mesh(sleeperGeo, sleeperMat);
      sleeper.position.set(x, -0.42, parallelZ);
      this.attackGroup.add(sleeper);
    }

    // Rails d'aiguillage obliques juste après la Locomotive #0 (x = 0.8 .. 3.0)
    const switchGeo = new THREE.BoxGeometry(3.8, 0.09, 0.07);
    [-0.66, 0.66].forEach((offsetZ) => {
      const swRail = new THREE.Mesh(switchGeo, railMat);
      swRail.position.set(1.85, -0.33, parallelZ / 2 + offsetZ);
      swRail.rotation.y = -0.82;
      this.attackGroup.add(swRail);
    });

    // 2. Les 4 wagons pirates sur la voie bis (z = 3.1)
    for (let i = 1; i <= 4; i++) {
      const targetX = i * 3.8;
      const pw = this.createPirateWagonMesh(i, targetX);
      pw.group.position.set(targetX, 0, parallelZ);
      this.attackGroup.add(pw.group);
      this.pirateWagons.push(pw);
    }

    // 3. Molette des Gares honnêtes (derrière la voie officielle, z = -2.35)
    //    et Molette du Pirate (devant la voie bis, z = 5.25)
    this.honestWheelObj = this.createStationWheelNode(5.7, -2.35, 0x38bdf8, '#38bdf8');
    this.pirateWheelObj = this.createStationWheelNode(5.7, 5.25, 0xef4444, '#ef4444');
    this.attackGroup.add(this.honestWheelObj.group);
    this.attackGroup.add(this.pirateWheelObj.group);

    scene.add(this.attackGroup);
  },

  /**
   * Place les deux voies à leur état de départ :
   * - Voie officielle : Locomotive #0 + Wagon #1 (les wagons #2, #3, #4 sont cachés)
   * - Voie bis pirate : Wagon pirate #1 (les wagons pirates #2, #3, #4 sont cachés)
   */
  resetWagonsToStart() {
    const { trainConvoy } = this.ctx;
    this.honestCount = 1;
    this.pirateCount = 1;

    if (trainConvoy) {
      for (let i = 1; i <= 4; i++) {
        const w = trainConvoy.getWagon(i);
        if (!w) continue;
        w.updateStatus(true);
        if (i === 1) {
          w.visible = true;
          w.position.x = 3.8;
          w.scale.setScalar(1.0);
        } else {
          w.visible = false;
          w.position.x = i * 3.8 + 1.4;
          w.scale.setScalar(0.01);
        }
      }
    }

    this.pirateWagons.forEach((pw, idx) => {
      pw.materials.forEach((m) => {
        m.opacity = m.userData.baseOpacity;
      });
      if (idx === 0) {
        pw.group.visible = true;
        pw.currentX = pw.targetX;
        pw.group.position.x = pw.targetX;
        pw.group.scale.setScalar(1.0);
      } else {
        pw.group.visible = false;
        pw.currentX = pw.targetX + 1.4;
        pw.group.position.x = pw.currentX;
        pw.group.scale.setScalar(0.01);
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
   * Lance la course d'assemblage des wagons sur les deux voies parallèles.
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
   * Crée les 2 infobulles SVG pointant sur la Voie officielle et la Voie bis pirate.
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
   * Met à jour les 2 infobulles 3D selon le mode et le nombre de wagons assemblés.
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

    const hWords = `${this.honestCount} wagon${this.honestCount > 1 ? 's' : ''}`;
    const pWords = `${this.pirateCount} wagon${this.pirateCount > 1 ? 's' : ''}`;

    let offColor = '#38bdf8';
    let pirColor = '#ef4444';
    let offHTML = `<strong>Voie officielle (${honestShare})</strong> · ${hWords}`;
    let pirHTML = `<strong>Voie bis pirate (${pirateShare})</strong> · ${pWords}`;

    if (this.raceState === 'done') {
      if (isNormal) {
        offColor = '#10b981';
        pirColor = '#64748b';
        offHTML = `<strong>Voie officielle (${honestShare})</strong> · 4 wagons (La plus longue — conservée)`;
        pirHTML = `<strong>Voie bis pirate (${pirateShare})</strong> · 2 wagons (Trop courte — rejetée)`;
      } else {
        offColor = '#64748b';
        pirColor = '#ef4444';
        offHTML = `<strong>Voie officielle (${honestShare})</strong> · 2 wagons (Dépassée — annulée)`;
        pirHTML = `<strong>Voie bis pirate (${pirateShare})</strong> · 4 wagons (La plus longue — gagne !)`;
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

      // 1. Progression de la course entre les 2 trains
      if (this.raceState === 'running') {
        this.raceTimer += dt;
        const p = Math.min(this.raceTimer / this.raceDuration, 1.0);

        // Rotation des 2 molettes selon leur part de puissance (80/20 ou 40/60)
        const honestMaxCrans = isNormal ? 32 : 14;
        const pirateMaxCrans = isNormal ? 10 : 28;

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

        // Déblocage progressif des wagons selon la vitesse de chaque voie
        const newHonestCount = isNormal
          ? p >= 0.82 ? 4 : p >= 0.54 ? 3 : p >= 0.26 ? 2 : 1
          : p >= 0.56 ? 2 : 1;

        const newPirateCount = isNormal
          ? p >= 0.58 ? 2 : 1
          : p >= 0.82 ? 4 : p >= 0.54 ? 3 : p >= 0.26 ? 2 : 1;

        if (newHonestCount !== this.honestCount || newPirateCount !== this.pirateCount) {
          this.honestCount = newHonestCount;
          this.pirateCount = newPirateCount;
          this.updateTooltipsDOM();
        }

        if (p >= 1.0) {
          this.raceState = 'done';
          if (isNormal) this.hasTestedNormal = true;
          else this.hasTestedAttack51 = true;

          // En cas d'attaque 51% réussie, la voie officielle plus courte passe au rouge (abandonnée)
          if (!isNormal && trainConvoy) {
            for (let i = 1; i <= 2; i++) {
              const w = trainConvoy.getWagon(i);
              if (w && w.beaconMaterial) {
                w.beaconMaterial.color.setHex(0xef4444);
                w.beaconMaterial.emissive.setHex(0xdc2626);
              }
            }
          }

          this.updateTooltipsDOM();
          this.renderLeftPanel();
        }
      }

      // 2. Animation fluide d'attelage des wagons officiels (#1 à #honestCount)
      if (trainConvoy) {
        for (let i = 1; i <= 4; i++) {
          const w = trainConvoy.getWagon(i);
          if (!w) continue;
          const active = i <= this.honestCount;
          w.visible = active;
          if (active) {
            const targetX = i * 3.8;
            w.position.x = THREE.MathUtils.lerp(w.position.x, targetX, Math.min(1, dt * 8));
            const nextScale = THREE.MathUtils.lerp(w.scale.x, 1.0, Math.min(1, dt * 10));
            w.scale.setScalar(nextScale);
          }
        }
      }

      // 3. Animation fluide d'attelage des wagons pirates (#1 à #pirateCount)
      this.pirateWagons.forEach((pw, idx) => {
        const active = idx + 1 <= this.pirateCount;
        pw.group.visible = active;
        if (active) {
          pw.currentX = THREE.MathUtils.lerp(pw.currentX, pw.targetX, Math.min(1, dt * 8));
          pw.group.position.x = pw.currentX;
          const nextScale = THREE.MathUtils.lerp(pw.group.scale.x, 1.0, Math.min(1, dt * 10));
          pw.group.scale.setScalar(nextScale);

          // Si la voie pirate a perdu (mode normal, fin de course), elle s'estompe
          const isAbandoned = this.raceState === 'done' && isNormal;
          pw.materials.forEach((m) => {
            const targetOp = isAbandoned ? m.userData.baseOpacity * 0.28 : m.userData.baseOpacity;
            m.opacity = THREE.MathUtils.lerp(m.opacity, targetOp, Math.min(1, dt * 5));
          });
        }
      });

      // 4. Projection 2D des 2 infobulles (Voie officielle en haut, Voie bis pirate en bas)
      if (this.tooltipLayer && camera) {
        const width = window.innerWidth;
        const height = window.innerHeight;
        const toX = (v) => (v.x * 0.5 + 0.5) * width;
        const toY = (v) => (-v.y * 0.5 + 0.5) * height;

        const offAnchorX = Math.min(11.4, this.honestCount * 3.8);
        const pirAnchorX = Math.min(11.4, this.pirateCount * 3.8);

        const offWorld = new THREE.Vector3(offAnchorX, 1.08, 0).project(camera);
        const pirWorld = new THREE.Vector3(pirAnchorX, 1.02, 3.1).project(camera);

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

          const offPillX = Math.max(465, Math.min(width - 230, offX));
          const offPillY = Math.max(58, offY - 56);
          const offEl = document.getElementById('tooltip-s7-official');
          if (offEl) {
            offEl.style.transform = `translate3d(${offPillX.toFixed(1)}px, ${offPillY.toFixed(1)}px, 0) translate(-50%, -50%)`;
          }
          setLineAndDot('s7-line-official', 's7-dot-in-official', 's7-dot-out-official', offPillX, offPillY + 14, offX, offY);

          const pirPillX = Math.max(465, Math.min(width - 230, pirX));
          const pirPillY = Math.min(height - 48, pirY + 58);
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
      ? 'Course des 2 trains en cours...'
      : isDone
        ? 'Relancer la course des 2 trains'
        : 'Lancer la course des 2 trains';

    const modeBannerHTML = isNormal
      ? `
        <div class="share-meaning-banner">
          <strong>Cas réel (80 % contre 20 %) :</strong> les gares honnêtes réunies possèdent 80 % de la puissance du réseau. Le pirate est seul sur sa voie bis avec 20 %.
        </div>
      `
      : `
        <div class="share-meaning-banner" style="border-left-color: #ef4444;">
          <strong>Hypothèse d'attaque (> 51 %) :</strong> imaginez que le pirate contrôle à lui seul <strong>60 % des machines du monde</strong> contre 40 % pour les gares honnêtes.
        </div>
      `;

    const resultHTML = isDone
      ? isNormal
        ? `
          <p style="margin: 10px 0 0 0;">
            Les gares honnêtes (80 %) ont assemblé <strong>4 wagons contre 2</strong> pour le pirate. Le réseau garde toujours <strong>le train le plus long</strong> : la voie bis pirate est abandonnée.
          </p>
        `
        : `
          <p style="margin: 10px 0 0 0;">
            Avec <strong>60 % de la puissance</strong>, la molette du pirate a tourné plus vite et assemblé <strong>4 wagons contre 2</strong> ! Son train pirate étant devenu le plus long, le réseau le prend pour le vrai train.
          </p>
        `
      : '';

    inner.innerHTML = `
      <header class="step-panel-header">
        <h2 class="step-panel-title">Attaque des 51 %</h2>
      </header>

      <div class="step-panel-scroll">
        <article class="step-card context-card animate-fade">
          <h3 class="card-title">Pourquoi créer une voie bis ?</h3>
          <p>
            À l'étape 3, on a vu qu'on <strong>ne peut pas modifier un wagon déjà accroché</strong>. Pour annuler un paiement du Wagon #1, la seule astuce d'un pirate est de créer un <strong>aiguillage (voie bis)</strong> pour construire son propre train concurrent.
          </p>
          <p>
            Face à deux trains parallèles, la règle du réseau est automatique : <strong>il garde uniquement le train qui a le plus de wagons</strong>.
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
              Pour que son train pirate dépasse le train officiel, un tricheur doit fabriquer des wagons plus vite que tout le reste de la planète réuni (posséder <strong>plus de 51 %</strong> des machines en PoW ou de la caution en PoS), ce qui coûterait des milliards d'euros.
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
