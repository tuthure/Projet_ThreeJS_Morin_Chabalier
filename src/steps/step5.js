import * as THREE from 'three';

/**
 * Étape 5 : Validation et minage (Proof of Work).
 * Métaphore : La locomotive fournit un effort mécanique et thermique intense
 * pour faire tourner la combinaison du verrou (Nonce) jusqu'à obtenir un Hash
 * commençant par le nombre de zéros exigé par la difficulté du réseau.
 */
export const step5 = {
  id: 5,
  title: 'Validation et minage',
  ctx: null,

  rafId: null,
  miningGroup: null,
  sparks: [],
  overheatSmoke: [],
  heatLight: null,
  scannerRing: null,
  scannerMat: null,

  difficulty: 2, // 1, 2 ou 3 zéros requis
  isMining: false,
  isMined: false,
  currentNonce: 0,
  currentHash: 'a94f1c82b7d03e15...',
  heatLevel: 0, // 0.0 à 1.0
  attemptsDone: 0,
  targetAttempts: 48,

  init(context) {
    this.ctx = context;
  },

  enter() {
    const { trainConvoy, cameraController, environment } = this.ctx;

    this.difficulty = 2;
    this.isMining = false;
    this.isMined = false;
    this.currentNonce = 0;
    this.currentHash = '7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069';
    this.heatLevel = 0;
    this.attemptsDone = 0;

    if (cameraController) {
      cameraController.setViewOffset(210);
    }

    if (environment) {
      environment.setSpeed(1.2);
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

    this.buildMiningEffects();

    if (cameraController) {
      cameraController.moveTo(
        new THREE.Vector3(-1.4, 2.15, 5.4),
        new THREE.Vector3(0.4, 0.55, 0),
        1.2
      );
    }

    this.startAnimationLoop();
    this.renderLeftPanel();
  },

  exit() {
    this.stopAnimationLoop();
    this.resetLocomotiveMaterials();

    if (this.miningGroup && this.ctx?.scene) {
      this.ctx.scene.remove(this.miningGroup);
      this.miningGroup = null;
    }
    this.sparks = [];
    this.overheatSmoke = [];
    this.heatLight = null;
    this.scannerRing = null;

    const panel = document.getElementById('step-panel-left');
    if (panel) {
      const inner = panel.querySelector('.step-panel-inner');
      if (inner) inner.remove();
    }
  },

  /**
   * Réinitialise les matériaux de la chaudière à leur teinte normale.
   */
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
   * Construit les particules d'étincelles, la fumée de surchauffe et l'anneau de calcul 3D.
   */
  buildMiningEffects() {
    const { scene } = this.ctx;
    if (!scene) return;

    if (this.miningGroup) {
      scene.remove(this.miningGroup);
    }

    this.miningGroup = new THREE.Group();
    this.sparks = [];
    this.overheatSmoke = [];

    // 1. Lumière de surchauffe thermique sur la chaudière
    this.heatLight = new THREE.PointLight(0xff5500, 0, 7.0);
    this.heatLight.position.set(-0.4, 0.8, 0.6);
    this.miningGroup.add(this.heatLight);

    // 2. Anneau de calcul mécanique autour de la chaudière
    const ringGeo = new THREE.TorusGeometry(0.68, 0.025, 10, 32);
    this.scannerMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x0284c7,
      emissiveIntensity: 1.5,
      wireframe: true
    });
    this.scannerRing = new THREE.Mesh(ringGeo, this.scannerMat);
    this.scannerRing.rotation.y = Math.PI / 2;
    this.scannerRing.position.set(-0.45, 0.56, 0);
    this.miningGroup.add(this.scannerRing);

    // 3. Étincelles incandescentes jaillissant des roues et de la chaudière
    const sparkGeo = new THREE.BoxGeometry(0.06, 0.06, 0.06);
    for (let i = 0; i < 36; i++) {
      const sparkMat = new THREE.MeshBasicMaterial({
        color: i % 2 === 0 ? 0xfacc15 : 0xf97316,
        transparent: true,
        opacity: 0
      });
      const spark = new THREE.Mesh(sparkGeo, sparkMat);
      spark.visible = false;
      spark.userData = {
        vx: (Math.random() - 0.3) * 3.5,
        vy: 1.2 + Math.random() * 2.8,
        vz: (Math.random() - 0.5) * 3.0,
        age: Math.random(),
        lifetime: 0.45 + Math.random() * 0.4
      };
      this.miningGroup.add(spark);
      this.sparks.push(spark);
    }

    // 4. Panache de fumée dense de surchauffe à la sortie de la cheminée
    const smokeGeo = new THREE.SphereGeometry(0.22, 8, 8);
    for (let i = 0; i < 18; i++) {
      const smokeMat = new THREE.MeshStandardMaterial({
        color: 0xfb923c,
        emissive: 0x9a3412,
        emissiveIntensity: 0.6,
        transparent: true,
        opacity: 0,
        roughness: 0.9
      });
      const puff = new THREE.Mesh(smokeGeo, smokeMat);
      puff.visible = false;
      puff.userData = {
        age: (i / 18) * 1.2,
        lifetime: 1.2
      };
      this.miningGroup.add(puff);
      this.overheatSmoke.push(puff);
    }

    scene.add(this.miningGroup);
  },

  /**
   * Lance la recherche intensive du Nonce selon la difficulté choisie.
   */
  startMining() {
    if (this.isMining) return;

    this.isMining = true;
    this.isMined = false;
    this.attemptsDone = 0;
    this.currentNonce = Math.floor(Math.random() * 500) + 100;

    // Nombre d'itérations visuelles selon la difficulté (1, 2 ou 3 zéros)
    if (this.difficulty === 1) this.targetAttempts = 22;
    else if (this.difficulty === 2) this.targetAttempts = 52;
    else this.targetAttempts = 92;

    if (this.ctx?.environment) {
      this.ctx.environment.setSpeed(5.5);
    }

    this.renderLeftPanel();
  },

  /**
   * Génère un faux hash hexadécimal aléatoire pour l'animation de recherche.
   */
  generateRandomHex(length = 24) {
    const chars = '123456789abcdef';
    let out = '';
    for (let i = 0; i < length; i++) {
      out += chars[Math.floor(Math.random() * chars.length)];
    }
    return out;
  },

  startAnimationLoop() {
    this.stopAnimationLoop();

    let lastStepTime = performance.now();

    const loop = () => {
      const now = performance.now();
      const dt = Math.min((now - lastStepTime) / 1000, 0.05);
      lastStepTime = now;

      const loco = this.ctx?.trainConvoy?.getWagon(0);

      if (this.isMining) {
        // Progression du minage
        this.attemptsDone += 1;
        this.currentNonce += Math.floor(Math.random() * 37) + 7;
        const progress = Math.min(this.attemptsDone / this.targetAttempts, 1.0);
        this.heatLevel = Math.min(1.0, progress * 1.25);

        if (this.attemptsDone < this.targetAttempts) {
          // Hash candidat invalide (ne commence pas par les zéros requis)
          this.currentHash = this.generateRandomHex(24);
          this.updateLiveMiningDOM();
        } else {
          // Hash valide trouvé !
          const zeros = '0'.repeat(this.difficulty);
          this.currentHash = zeros + this.generateRandomHex(24 - this.difficulty);
          this.isMining = false;
          this.isMined = true;
          this.heatLevel = 0.0;

          if (this.ctx?.environment) {
            this.ctx.environment.setSpeed(2.0);
          }

          // Ajoute un wagon fraîchement miné si moins de 4 blocs
          const convoy = this.ctx?.trainConvoy;
          if (convoy && convoy.blockchain.chain.length < 4) {
            convoy.addBlock({
              emetteur: 'Récompense-Mineur',
              destinataire: 'Locomotive-PoW',
              montant: 50,
              unite: 'MMI-Coin'
            });
          }

          this.resetLocomotiveMaterials();
          this.renderLeftPanel();
        }
      } else {
        this.heatLevel = THREE.MathUtils.lerp(this.heatLevel, 0, dt * 3.0);
      }

      // Effets visuels 3D sur la locomotive (rougeoiement, étincelles, fumée)
      if (loco && loco.bodyMaterials) {
        loco.bodyMaterials.forEach((mat) => {
          if (this.isMining) {
            mat.emissive.setHex(0xdc2626);
            mat.emissiveIntensity = this.heatLevel * 0.75 + Math.sin(now * 0.03) * 0.15;
          } else if (this.isMined) {
            mat.emissive.setHex(0x059669);
            mat.emissiveIntensity = Math.max(0, this.heatLevel * 0.5);
          }
        });
      }

      if (this.heatLight) {
        if (this.isMining) {
          this.heatLight.color.setHex(0xff4500);
          this.heatLight.intensity = 2.5 + this.heatLevel * 4.5 + Math.random() * 1.5;
        } else if (this.isMined) {
          this.heatLight.color.setHex(0x10b981);
          this.heatLight.intensity = 2.2;
        } else {
          this.heatLight.intensity = 0;
        }
      }

      if (this.scannerRing && this.scannerMat) {
        if (this.isMining) {
          this.scannerRing.rotation.x += dt * (8.0 + this.difficulty * 4.0);
          this.scannerMat.color.setHex(0xf97316);
          this.scannerMat.emissive.setHex(0xea580c);
        } else if (this.isMined) {
          this.scannerRing.rotation.x += dt * 1.2;
          this.scannerMat.color.setHex(0x10b981);
          this.scannerMat.emissive.setHex(0x059669);
        } else {
          this.scannerRing.rotation.x += dt * 0.8;
          this.scannerMat.color.setHex(0x38bdf8);
          this.scannerMat.emissive.setHex(0x0284c7);
        }
      }

      // Animation des étincelles
      this.sparks.forEach((spark) => {
        if (this.isMining) {
          spark.visible = true;
          spark.userData.age += dt;
          if (spark.userData.age >= spark.userData.lifetime) {
            spark.userData.age = 0;
            spark.position.set(
              -0.8 + Math.random() * 1.2,
              -0.15 + Math.random() * 0.7,
              (Math.random() - 0.5) * 1.1
            );
          } else {
            spark.position.x += spark.userData.vx * dt;
            spark.position.y += spark.userData.vy * dt;
            spark.position.z += spark.userData.vz * dt;
            const lifeRatio = 1 - spark.userData.age / spark.userData.lifetime;
            spark.material.opacity = lifeRatio;
          }
        } else {
          spark.visible = false;
        }
      });

      // Animation de la fumée de surchauffe
      this.overheatSmoke.forEach((puff) => {
        if (this.isMining) {
          puff.visible = true;
          puff.userData.age += dt * (1.5 + this.difficulty * 0.4);
          if (puff.userData.age >= puff.userData.lifetime) {
            puff.userData.age = 0;
            puff.position.set(-0.9, 1.4, (Math.random() - 0.5) * 0.15);
            puff.scale.setScalar(0.4);
          } else {
            const r = puff.userData.age / puff.userData.lifetime;
            puff.position.x += dt * 3.2;
            puff.position.y += dt * 2.4;
            puff.scale.setScalar(0.4 + r * 2.2);
            puff.material.opacity = (1 - r) * 0.65;
          }
        } else {
          puff.visible = false;
        }
      });

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

  updateLiveMiningDOM() {
    const nonceEl = document.getElementById('step5-nonce-val');
    const hashEl = document.getElementById('step5-hash-val');
    const tempEl = document.getElementById('step5-temp-val');

    if (nonceEl) nonceEl.textContent = `${this.currentNonce} (${this.attemptsDone} essais)`;
    if (hashEl) hashEl.textContent = `${this.currentHash.substring(0, 16)}...`;
    if (tempEl) {
      const deg = Math.round(120 + this.heatLevel * 720);
      tempEl.textContent = `Surchauffe (${deg}°C)`;
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

    const targetPrefix = '0'.repeat(this.difficulty);

    inner.innerHTML = `
      <header class="step-panel-header">
        <h2 class="step-panel-title">Validation et Minage</h2>
      </header>

      <div class="step-panel-scroll">
        <article class="step-card context-card animate-fade">
          <h3 class="card-title">L'effort mécanique de la Preuve de Travail</h3>
          <p>
            Pour valider et sceller un nouveau wagon, la locomotive doit résoudre une énigme cryptographique : tourner la molette du <strong>Nonce</strong> jusqu'à trouver un <strong>Hash</strong> commençant par un nombre imposé de zéros (la <strong>difficulté</strong>).
          </p>
          <p>
            Plus la difficulté est élevée, plus la locomotive doit tester de combinaisons et fournir un effort énergétique intense.
          </p>
        </article>

        <article class="step-card action-card animate-fade">
          <h3 class="card-title">Simulateur de minage (Proof of Work)</h3>
          <p class="card-instruction">
            Choisissez la cible de difficulté puis lancez la chauffe de la locomotive :
          </p>

          <div class="difficulty-selector-row">
            <button id="btn-diff-1" class="btn-diff-option ${this.difficulty === 1 ? 'active' : ''}" ${this.isMining ? 'disabled' : ''}>
              <span>Facile (0...)</span>
            </button>
            <button id="btn-diff-2" class="btn-diff-option ${this.difficulty === 2 ? 'active' : ''}" ${this.isMining ? 'disabled' : ''}>
              <span>Standard (00...)</span>
            </button>
            <button id="btn-diff-3" class="btn-diff-option ${this.difficulty === 3 ? 'active' : ''}" ${this.isMining ? 'disabled' : ''}>
              <span>Difficile (000...)</span>
            </button>
          </div>

          <button id="btn-step5-mine" class="btn-panel-primary" ${this.isMining ? 'disabled' : ''}>
            <span>${this.isMining ? 'Calcul intensif en cours...' : (this.isMined ? 'Relancer un cycle de minage' : 'Lancer le minage du bloc')}</span>
          </button>

          <div class="action-feedback-box ${this.isMined ? 'success' : (this.isMining ? 'error' : '')}">
            <div class="feedback-row">
              <span class="feedback-label">Cible requise :</span>
              <span class="feedback-val">Débuter par "${targetPrefix}"</span>
            </div>
            <div class="feedback-row">
              <span class="feedback-label">Nonce testé :</span>
              <span id="step5-nonce-val" class="feedback-val">${this.currentNonce} (${this.attemptsDone} essais)</span>
            </div>
            <div class="feedback-row">
              <span class="feedback-label">Hash calculé :</span>
              <span id="step5-hash-val" class="feedback-val ${this.isMined ? 'success-val' : 'hash-val'}">${this.currentHash.substring(0, 16)}...</span>
            </div>
            <div class="feedback-row">
              <span class="feedback-label">État chaudière :</span>
              <span id="step5-temp-val" class="feedback-val ${this.isMined ? 'success-val' : (this.isMining ? 'error-val' : '')}">
                ${this.isMining ? 'Surchauffe en cours...' : (this.isMined ? 'Bloc validé et scellé' : 'Prête (Repos)')}
              </span>
            </div>
          </div>
        </article>

        <article class="step-card keypoint-card animate-fade">
          <h4 class="card-title keypoint-title">Point clé</h4>
          <p class="keypoint-text">
            Trouver le bon Nonce exige des milliers d'essais par force brute (très coûteux), mais une fois trouvé, n'importe quelle gare peut vérifier en un seul calcul que le Hash commence bien par "${targetPrefix}".
          </p>
        </article>

        <div class="substep-action-box animate-fade">
          <button id="btn-step5-action-next" class="btn-panel-primary">
            <span>Étape 6 : Consensus PoW vs PoS</span>
            <span class="btn-arrow">&rarr;</span>
          </button>
        </div>
      </div>
    `;

    panel.prepend(inner);
    this.setupEvents();
  },

  setupEvents() {
    [1, 2, 3].forEach((lvl) => {
      document.getElementById(`btn-diff-${lvl}`)?.addEventListener('click', () => {
        if (this.isMining) return;
        this.difficulty = lvl;
        this.isMined = false;
        this.renderLeftPanel();
      });
    });

    document.getElementById('btn-step5-mine')?.addEventListener('click', () => {
      this.startMining();
    });

    document.getElementById('btn-step5-action-next')?.addEventListener('click', () => {
      if (typeof this.ctx.onNextStep === 'function') {
        this.ctx.onNextStep();
      }
    });
  }
};
