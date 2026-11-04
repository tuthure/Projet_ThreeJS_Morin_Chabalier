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

  difficulty: 1, // 1 ("0"), 2 ("00") ou 3 ("000") zéros requis
  isMining: false,
  isMined: false,
  currentNonce: 0,
  currentHash: '7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069',
  heatLevel: 0, // 0.0 à 1.0

  // Résultats réels du tirage SHA-256
  attemptsDone: 0,
  realAttempts: 0,
  foundNonce: 0,
  foundHash: '',
  animFramesDone: 0,
  animTotalFrames: 45,

  init(context) {
    this.ctx = context;
  },

  enter() {
    const { trainConvoy, cameraController, environment } = this.ctx;

    this.difficulty = 1;
    this.isMining = false;
    this.isMined = false;
    this.currentNonce = 0;
    this.currentHash = '7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069';
    this.heatLevel = 0;
    this.attemptsDone = 0;
    this.realAttempts = 0;
    this.foundNonce = 0;
    this.foundHash = '';

    if (cameraController) {
      cameraController.setViewOffset(210);
    }

    if (environment) {
      environment.setSpeed(1.2);
    }

    if (trainConvoy) {
      trainConvoy.resetConvoy([
        '50 caisses de matériel',
        'Bon de livraison #402 - Quai Central'
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
   * Construit les particules d'étincelles et la fumée de surchauffe (sans cercle filaire gênant la plaque).
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

    // 2. Étincelles incandescentes jaillissant des roues et de la chaudière
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

    // 3. Panache de fumée dense de surchauffe à la sortie de la cheminée
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
   * Retourne la moyenne théorique d'essais selon la difficulté hexadécimale (16^d).
   * @param {number} diff
   */
  getTheoreticalAverageLabel(diff) {
    if (diff === 1) return '16';
    if (diff === 2) return '256';
    return '4 096';
  },

  /**
   * Lance la recherche réelle du Nonce (SHA-256 avec timestamp/sel aléatoire avant le while).
   */
  startMining() {
    if (this.isMining) return;

    const convoy = this.ctx?.trainConvoy;
    if (!convoy || !convoy.blockchain) return;

    // Exécute le vrai minage SHA-256 (qui injecte un léger timestamp aléatoire avant la boucle while)
    const result = convoy.blockchain.mineLatestBlock(this.difficulty);

    this.foundNonce = result.nonce;
    this.realAttempts = result.attempts;
    this.foundHash = result.hash;

    this.isMining = true;
    this.isMined = false;
    this.attemptsDone = 0;
    this.currentNonce = 0;
    this.animFramesDone = 0;

    // Durée d'animation visuelle fluide adaptée au niveau de difficulté
    if (this.difficulty === 1) this.animTotalFrames = 32;
    else if (this.difficulty === 2) this.animTotalFrames = 55;
    else this.animTotalFrames = 85;

    if (this.ctx?.environment) {
      this.ctx.environment.setSpeed(5.5);
    }

    this.renderLeftPanel();
  },

  /**
   * Génère un faux hash hexadécimal aléatoire pendant les frames de recherche.
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
        this.animFramesDone += 1;
        const progress = Math.min(this.animFramesDone / this.animTotalFrames, 1.0);
        this.heatLevel = Math.min(1.0, progress * 1.25);

        if (progress < 1.0) {
          this.attemptsDone = Math.max(1, Math.floor(this.realAttempts * progress));
          this.currentNonce = this.attemptsDone;
          this.currentHash = this.generateRandomHex(24);
          this.updateLiveMiningDOM();
        } else {
          // Résultat réel atteint !
          this.attemptsDone = this.realAttempts;
          this.currentNonce = this.foundNonce;
          this.currentHash = this.foundHash;
          this.isMining = false;
          this.isMined = true;
          this.heatLevel = 0.0;

          if (this.ctx?.environment) {
            this.ctx.environment.setSpeed(2.0);
          }

          const convoy = this.ctx?.trainConvoy;
          if (convoy) {
            if (convoy.blockchain.chain.length < 4) {
              convoy.addBlock('Convoi validé par Preuve de Travail');
            }
            convoy.sync();
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
    const avgLabel = this.getTheoreticalAverageLabel(this.difficulty);

    if (nonceEl) {
      nonceEl.textContent = `Recherche en cours : ${this.attemptsDone} essais... (Moyenne théorique : ${avgLabel} essais)`;
    }
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
    const avgLabel = this.getTheoreticalAverageLabel(this.difficulty);

    let nonceStatusHTML = `En attente de lancement (Moyenne théorique : ${avgLabel} essais)`;
    if (this.isMining) {
      nonceStatusHTML = `Recherche en cours : ${this.attemptsDone} essais... (Moyenne théorique : ${avgLabel} essais)`;
    } else if (this.isMined) {
      nonceStatusHTML = `Nonce trouvé : ${this.foundNonce}, après ${this.realAttempts} essais réels. (Moyenne théorique : ${avgLabel} essais)`;
    }

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
            Comme chaque caractère hexadécimal a 1 chance sur 16 d'être un zéro, le nombre d'essais varie à chaque tirage autour d'une moyenne mathématique précise.
          </p>
        </article>

        <article class="step-card action-card animate-fade">
          <h3 class="card-title">Simulateur de minage (Proof of Work)</h3>
          <p class="card-instruction">
            Choisissez la cible de difficulté puis lancez la chauffe plusieurs fois pour comparer votre tirage à la moyenne théorique :
          </p>

          <div class="difficulty-selector-row">
            <button id="btn-diff-1" class="btn-diff-option ${this.difficulty === 1 ? 'active' : ''}" ${this.isMining ? 'disabled' : ''}>
              <span>Facile ("0")</span>
            </button>
            <button id="btn-diff-2" class="btn-diff-option ${this.difficulty === 2 ? 'active' : ''}" ${this.isMining ? 'disabled' : ''}>
              <span>Standard ("00")</span>
            </button>
            <button id="btn-diff-3" class="btn-diff-option ${this.difficulty === 3 ? 'active' : ''}" ${this.isMining ? 'disabled' : ''}>
              <span>Difficile ("000")</span>
            </button>
          </div>

          <button id="btn-step5-mine" class="btn-panel-primary" ${this.isMining ? 'disabled' : ''}>
            <span>${this.isMining ? 'Calcul intensif en cours...' : (this.isMined ? 'Relancer un nouveau tirage de minage' : 'Lancer le minage du bloc')}</span>
          </button>

          <div class="action-feedback-box ${this.isMined ? 'success' : (this.isMining ? 'error' : '')}">
            <div class="feedback-row">
              <span class="feedback-label">Cible requise :</span>
              <span class="feedback-val">Débuter par "${targetPrefix}"</span>
            </div>
            <div class="feedback-row">
              <span class="feedback-label">Résultat du tirage :</span>
              <span id="step5-nonce-val" class="feedback-val">${nonceStatusHTML}</span>
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

          <div class="alert-box-info" style="margin-top: 8px;">
            <strong>Vérification :</strong> Un seul calcul suffit pour que les autres gares valident ce wagon.
          </div>
        </article>

        <article class="step-card keypoint-card animate-fade">
          <h4 class="card-title keypoint-title">Point clé</h4>
          <p class="keypoint-text">
            Trouver un Hash commençant par "${targetPrefix}" demande en moyenne ${avgLabel} essais par force brute, mais le hasard peut être chanceux ou malchanceux. En revanche, vérifier le résultat final est instantané : un seul calcul suffit.
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
