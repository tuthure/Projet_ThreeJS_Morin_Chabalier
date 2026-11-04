import * as THREE from 'three';

/**
 * Étape 6 : Comparaison des consensus (PoW vs PoS).
 * Métaphore : Comparer la surchauffe mécanique de la locomotive (Preuve de Travail / PoW)
 * avec un portique d'aiguillage par tirage au sort pondéré selon les billets déposés en caution
 * par les gares (Preuve d'Enjeu / PoS).
 */
export const step6 = {
  id: 6,
  title: 'Comparaison des consensus (PoW vs PoS)',
  ctx: null,

  rafId: null,
  mode: 'pow', // 'pow' ou 'pos'
  selectedValidatorIndex: 0,

  consensusGroup: null,
  powGroup: null,
  posGroup: null,
  powSparks: [],
  powSmoke: [],
  powLight: null,
  validators: [],
  selectionBeam: null,

  validatorData: [
    { name: 'Gare Alpha', stake: 50, prob: '50%', x: -0.5, z: -3.2 },
    { name: 'Gare Bêta', stake: 35, prob: '35%', x: 2.5, z: -3.2 },
    { name: 'Gare Gamma', stake: 15, prob: '15%', x: 5.5, z: -3.2 }
  ],

  init(context) {
    this.ctx = context;
  },

  enter() {
    const { trainConvoy, cameraController, environment } = this.ctx;

    this.mode = 'pow';
    this.selectedValidatorIndex = 0;

    if (cameraController) {
      cameraController.setViewOffset(210);
    }

    if (environment) {
      environment.setSpeed(3.0);
    }

    if (trainConvoy) {
      trainConvoy.resetConvoy([
        { emetteur: 'Arthur', destinataire: 'Alban', montant: 15, unite: 'MMI-Coin' },
        { emetteur: 'Alban', destinataire: 'Equipe-R507', montant: 30, unite: 'MMI-Coin' }
      ]);
      if (cameraController) {
        cameraController.setInteractiveObjects(trainConvoy.getInteractiveObjects());
      }
    }

    this.buildConsensusScene();
    this.applyModeVisuals();
    this.startAnimationLoop();
    this.renderLeftPanel();
  },

  exit() {
    this.stopAnimationLoop();
    this.resetLocomotiveMaterials();

    if (this.consensusGroup && this.ctx?.scene) {
      this.ctx.scene.remove(this.consensusGroup);
      this.consensusGroup = null;
    }
    this.powSparks = [];
    this.powSmoke = [];
    this.validators = [];
    this.selectionBeam = null;

    const panel = document.getElementById('step-panel-left');
    if (panel) {
      const inner = panel.querySelector('.step-panel-inner');
      if (inner) inner.remove();
    }
  },

  resetLocomotiveMaterials() {
    const loco = this.ctx?.trainConvoy?.getWagon(0);
    if (loco && loco.bodyMaterials) {
      loco.bodyMaterials.forEach((mat) => {
        mat.emissive.setHex(0x000000);
        mat.emissiveIntensity = 0;
      });
    }
  },

  /**
   * Construit les deux dispositifs 3D :
   * - powGroup : effets de surchauffe thermique sur la locomotive
   * - posGroup : portique d'aiguillage et 3 gares validatrices avec piles de billets/jetons (Stake)
   */
  buildConsensusScene() {
    const { scene } = this.ctx;
    if (!scene) return;

    if (this.consensusGroup) {
      scene.remove(this.consensusGroup);
    }

    this.consensusGroup = new THREE.Group();
    this.powGroup = new THREE.Group();
    this.posGroup = new THREE.Group();
    this.powSparks = [];
    this.powSmoke = [];
    this.validators = [];

    // --- 1. DISPOSITIF PoW (Surchauffe mécanique) ---
    this.powLight = new THREE.PointLight(0xff4500, 4.5, 8.0);
    this.powLight.position.set(-0.3, 1.1, 0.8);
    this.powGroup.add(this.powLight);

    const sparkGeo = new THREE.BoxGeometry(0.06, 0.06, 0.06);
    for (let i = 0; i < 30; i++) {
      const sparkMat = new THREE.MeshBasicMaterial({
        color: i % 2 === 0 ? 0xfacc15 : 0xef4444,
        transparent: true,
        opacity: 0.9
      });
      const spark = new THREE.Mesh(sparkGeo, sparkMat);
      spark.userData = {
        vx: (Math.random() - 0.2) * 3.2,
        vy: 1.4 + Math.random() * 2.5,
        vz: (Math.random() - 0.5) * 2.5,
        age: Math.random() * 0.6,
        lifetime: 0.6
      };
      this.powGroup.add(spark);
      this.powSparks.push(spark);
    }

    const smokeGeo = new THREE.SphereGeometry(0.24, 8, 8);
    for (let i = 0; i < 16; i++) {
      const smokeMat = new THREE.MeshStandardMaterial({
        color: 0xf97316,
        emissive: 0x9a3412,
        emissiveIntensity: 0.7,
        transparent: true,
        opacity: 0.6,
        roughness: 0.9
      });
      const puff = new THREE.Mesh(smokeGeo, smokeMat);
      puff.userData = {
        age: (i / 16) * 1.2,
        lifetime: 1.2
      };
      this.powGroup.add(puff);
      this.powSmoke.push(puff);
    }

    // --- 2. DISPOSITIF PoS (Aiguillage écologique & Caution de jetons) ---
    const gantryMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      metalness: 0.8,
      roughness: 0.3
    });
    const pillarGeo = new THREE.CylinderGeometry(0.08, 0.1, 3.6, 10);
    const leftPillar = new THREE.Mesh(pillarGeo, gantryMat);
    leftPillar.position.set(1.9, 1.3, -1.8);
    this.posGroup.add(leftPillar);

    const rightPillar = new THREE.Mesh(pillarGeo, gantryMat);
    rightPillar.position.set(1.9, 1.3, 1.8);
    this.posGroup.add(rightPillar);

    const crossBarGeo = new THREE.BoxGeometry(0.22, 0.22, 3.8);
    const crossBar = new THREE.Mesh(crossBarGeo, gantryMat);
    crossBar.position.set(1.9, 3.1, 0);
    this.posGroup.add(crossBar);

    // Noyau d'aiguillage lumineux au sommet du portique
    const hubGeo = new THREE.OctahedronGeometry(0.32, 0);
    const hubMat = new THREE.MeshStandardMaterial({
      color: 0x10b981,
      emissive: 0x059669,
      emissiveIntensity: 2.2
    });
    const hubMesh = new THREE.Mesh(hubGeo, hubMat);
    hubMesh.position.set(1.9, 3.1, 0);
    this.posGroup.add(hubMesh);
    this.posHub = hubMesh;

    // 3 Gares validatrices avec piles de jetons (Stake)
    const platformGeo = new THREE.CylinderGeometry(0.85, 0.95, 0.18, 20);
    const platformMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.6 });
    const coinGeo = new THREE.CylinderGeometry(0.38, 0.38, 0.12, 16);

    this.validatorData.forEach((v, idx) => {
      const vGroup = new THREE.Group();
      vGroup.position.set(v.x, -0.42, v.z);

      const platform = new THREE.Mesh(platformGeo, platformMat);
      vGroup.add(platform);

      const ringGeo = new THREE.RingGeometry(0.88, 1.04, 24);
      const ringMat = new THREE.MeshBasicMaterial({
        color: idx === 0 ? 0x10b981 : 0x38bdf8,
        side: THREE.DoubleSide
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.rotation.x = -Math.PI / 2;
      ring.position.y = 0.1;
      vGroup.add(ring);

      // Empilement de jetons proportionnel à la mise (Stake)
      const coinCount = Math.round(v.stake / 5);
      const coinMat = new THREE.MeshStandardMaterial({
        color: 0xfacc15,
        emissive: 0xb45309,
        emissiveIntensity: 0.4,
        metalness: 0.85,
        roughness: 0.2
      });

      for (let c = 0; c < coinCount; c++) {
        const coin = new THREE.Mesh(coinGeo, coinMat);
        coin.position.y = 0.18 + c * 0.15;
        vGroup.add(coin);
      }

      // Balise sommitale
      const beaconGeo = new THREE.SphereGeometry(0.18, 12, 12);
      const beaconMat = new THREE.MeshStandardMaterial({
        color: idx === 0 ? 0x10b981 : 0x38bdf8,
        emissive: idx === 0 ? 0x059669 : 0x0284c7,
        emissiveIntensity: idx === 0 ? 2.4 : 0.8
      });
      const topY = 0.25 + coinCount * 0.15 + 0.25;
      const beacon = new THREE.Mesh(beaconGeo, beaconMat);
      beacon.position.y = topY;
      vGroup.add(beacon);

      this.posGroup.add(vGroup);
      this.validators.push({
        group: vGroup,
        ringMat,
        beaconMat,
        topWorldPos: new THREE.Vector3(v.x, -0.42 + topY, v.z)
      });
    });

    // Faisceau d'aiguillage reliant le portique à la gare tirée au sort
    const beamPoints = [
      new THREE.Vector3(1.9, 3.1, 0),
      this.validators[0].topWorldPos.clone()
    ];
    const beamGeo = new THREE.BufferGeometry().setFromPoints(beamPoints);
    const beamMat = new THREE.LineBasicMaterial({ color: 0x10b981, linewidth: 2 });
    this.selectionBeam = new THREE.Line(beamGeo, beamMat);
    this.posGroup.add(this.selectionBeam);

    this.consensusGroup.add(this.powGroup);
    this.consensusGroup.add(this.posGroup);
    scene.add(this.consensusGroup);
  },

  /**
   * Bascule entre l'affichage Preuve de Travail (PoW) et Preuve d'Enjeu (PoS).
   */
  toggleMode() {
    this.mode = this.mode === 'pow' ? 'pos' : 'pow';
    this.applyModeVisuals();
    this.renderLeftPanel();
  },

  /**
   * Tire au sort une gare validatrice en mode PoS selon sa mise en caution (Stake).
   */
  drawRandomValidator() {
    const r = Math.random() * 100;
    if (r < 50) this.selectedValidatorIndex = 0;
    else if (r < 85) this.selectedValidatorIndex = 1;
    else this.selectedValidatorIndex = 2;

    this.updateValidatorHighlight();
    this.renderLeftPanel();
  },

  updateValidatorHighlight() {
    this.validators.forEach((v, idx) => {
      const isSelected = idx === this.selectedValidatorIndex;
      v.ringMat.color.setHex(isSelected ? 0x10b981 : 0x38bdf8);
      v.beaconMat.color.setHex(isSelected ? 0x10b981 : 0x38bdf8);
      v.beaconMat.emissive.setHex(isSelected ? 0x059669 : 0x0284c7);
      v.beaconMat.emissiveIntensity = isSelected ? 2.6 : 0.7;
    });

    if (this.selectionBeam && this.validators[this.selectedValidatorIndex]) {
      const positions = this.selectionBeam.geometry.attributes.position;
      const target = this.validators[this.selectedValidatorIndex].topWorldPos;
      positions.setXYZ(1, target.x, target.y, target.z);
      positions.needsUpdate = true;
    }
  },

  applyModeVisuals() {
    const { cameraController, environment } = this.ctx;

    if (this.mode === 'pow') {
      if (this.powGroup) this.powGroup.visible = true;
      if (this.posGroup) this.posGroup.visible = false;
      if (environment) environment.setSpeed(4.5);

      if (cameraController) {
        cameraController.moveTo(
          new THREE.Vector3(0.5, 2.4, 6.2),
          new THREE.Vector3(0.8, 0.55, 0),
          1.1
        );
      }
    } else {
      if (this.powGroup) this.powGroup.visible = false;
      if (this.posGroup) this.posGroup.visible = true;
      this.resetLocomotiveMaterials();
      this.updateValidatorHighlight();
      if (environment) environment.setSpeed(2.5);

      if (cameraController) {
        cameraController.moveTo(
          new THREE.Vector3(2.4, 3.8, 8.2),
          new THREE.Vector3(2.2, 0.8, -1.2),
          1.1
        );
      }
    }
  },

  startAnimationLoop() {
    this.stopAnimationLoop();
    let lastTime = performance.now();

    const loop = () => {
      const now = performance.now();
      const dt = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;

      const loco = this.ctx?.trainConvoy?.getWagon(0);

      if (this.mode === 'pow') {
        // Surchauffe continue de la locomotive en PoW
        if (loco && loco.bodyMaterials) {
          loco.bodyMaterials.forEach((mat) => {
            mat.emissive.setHex(0xdc2626);
            mat.emissiveIntensity = 0.65 + Math.sin(now * 0.025) * 0.2;
          });
        }

        if (this.powLight) {
          this.powLight.intensity = 3.8 + Math.random() * 1.8;
        }

        this.powSparks.forEach((spark) => {
          spark.userData.age += dt;
          if (spark.userData.age >= spark.userData.lifetime) {
            spark.userData.age = 0;
            spark.position.set(
              -0.9 + Math.random() * 1.3,
              -0.15 + Math.random() * 0.8,
              (Math.random() - 0.5) * 1.1
            );
          } else {
            spark.position.x += spark.userData.vx * dt;
            spark.position.y += spark.userData.vy * dt;
            spark.position.z += spark.userData.vz * dt;
            spark.material.opacity = 1 - spark.userData.age / spark.userData.lifetime;
          }
        });

        this.powSmoke.forEach((puff) => {
          puff.userData.age += dt * 1.8;
          if (puff.userData.age >= puff.userData.lifetime) {
            puff.userData.age = 0;
            puff.position.set(-0.9, 1.4, (Math.random() - 0.5) * 0.14);
            puff.scale.setScalar(0.4);
          } else {
            const r = puff.userData.age / puff.userData.lifetime;
            puff.position.x += dt * 3.0;
            puff.position.y += dt * 2.2;
            puff.scale.setScalar(0.4 + r * 2.1);
            puff.material.opacity = (1 - r) * 0.65;
          }
        });
      } else {
        // Rotation fluide du noyau d'aiguillage en PoS
        if (this.posHub) {
          this.posHub.rotation.y += dt * 1.8;
          this.posHub.rotation.x += dt * 0.9;
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

    const isPoW = this.mode === 'pow';
    const currentValidator = this.validatorData[this.selectedValidatorIndex];

    inner.innerHTML = `
      <header class="step-panel-header">
        <h2 class="step-panel-title">Consensus : PoW vs PoS</h2>
      </header>

      <div class="step-panel-scroll">
        <article class="step-card context-card animate-fade">
          <h3 class="card-title">Force de calcul ou mise sous séquestre ?</h3>
          <p>
            Le <strong>consensus</strong> est la règle permettant au réseau de désigner qui a le droit d'atteler le prochain wagon :
          </p>
          <p>
            En <strong>Preuve de Travail (PoW)</strong>, les locomotives rivalisent de puissance thermique. En <strong>Preuve d'Enjeu (PoS)</strong>, un aiguillage tire au sort une gare en fonction des billets déposés en caution (<strong>Stake</strong>).
          </p>
        </article>

        <article class="step-card action-card animate-fade">
          <h3 class="card-title">Comparateur interactif de consensus</h3>
          <p class="card-instruction">
            Basculez entre les deux mécanismes pour comparer leur fonctionnement en 3D :
          </p>

          <button id="btn-step6-toggle" class="btn-panel-primary">
            <span>Basculer l'affichage (${isPoW ? 'Passer en PoS' : 'Passer en PoW'})</span>
          </button>

          ${!isPoW ? `
            <button id="btn-step6-draw" class="btn-panel-ghost" style="width: 100%;">
              <span>Tirer au sort une gare validatrice (Aiguillage PoS)</span>
            </button>
          ` : ''}

          <div class="action-feedback-box ${isPoW ? 'error' : 'success'}">
            <div class="feedback-row">
              <span class="feedback-label">Mécanisme actif :</span>
              <span class="feedback-val">${isPoW ? 'Proof of Work (PoW)' : 'Proof of Stake (PoS)'}</span>
            </div>
            <div class="feedback-row">
              <span class="feedback-label">Ressource engagée :</span>
              <span class="feedback-val">${isPoW ? 'Énergie et calcul matériel' : 'Caution de jetons (Stake)'}</span>
            </div>
            <div class="feedback-row">
              <span class="feedback-label">Coût énergétique :</span>
              <span class="feedback-val ${isPoW ? 'error-val' : 'success-val'}">
                ${isPoW ? 'Très élevé (Surchauffe)' : 'Très faible (-99.9% d\'énergie)'}
              </span>
            </div>
            <div class="feedback-row">
              <span class="feedback-label">${isPoW ? 'Sélection :' : 'Gare tirée au sort :'}</span>
              <span class="feedback-val">
                ${isPoW ? '1er à trouver le Nonce' : `${currentValidator.name} (${currentValidator.stake} jetons)`}
              </span>
            </div>
          </div>
        </article>

        <article class="step-card keypoint-card animate-fade">
          <h4 class="card-title keypoint-title">Point clé</h4>
          <p class="keypoint-text">
            ${isPoW
              ? "La Preuve de Travail (ex: Bitcoin) offre une sécurité éprouvée par la dépense électrique réelle, mais au prix d'une consommation énergétique considérable."
              : "La Preuve d'Enjeu (ex: Ethereum) remplace la dépense électrique par une caution financière : si la gare tirée au sort valide une fraude, sa caution est confisquée (Slashing)."}
          </p>
        </article>

        <div class="substep-action-box animate-fade">
          <button id="btn-step6-action-next" class="btn-panel-primary">
            <span>Étape 7 : Cycle de vie et Attaque</span>
            <span class="btn-arrow">&rarr;</span>
          </button>
        </div>
      </div>
    `;

    panel.prepend(inner);
    this.setupEvents();
  },

  setupEvents() {
    document.getElementById('btn-step6-toggle')?.addEventListener('click', () => {
      this.toggleMode();
    });

    document.getElementById('btn-step6-draw')?.addEventListener('click', () => {
      this.drawRandomValidator();
    });

    document.getElementById('btn-step6-action-next')?.addEventListener('click', () => {
      if (typeof this.ctx.onNextStep === 'function') {
        this.ctx.onNextStep();
      }
    });
  }
};
