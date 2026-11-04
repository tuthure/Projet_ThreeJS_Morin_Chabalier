import * as THREE from 'three';

/**
 * Étape 1 : Structure d'un Bloc.
 * Inspection anatomique d'un wagon (Bloc #1) à l'aide de 4 infobulles 3D
 * reliées par des traits SVG dynamiques aux éléments physiques :
 * 1) Chargement (Transactions) -> Conteneurs intérieurs sous la verrière
 * 2) Hash précédent (PreviousHash) -> Étiquette avant gauche + crochet d'attelage avant
 * 3) Nonce -> Molette mécanique sur le châssis
 * 4) Hash du bloc -> Étiquette centrale + prise d'attelage arrière
 */
export const step1 = {
  id: 1,
  title: "Structure d'un Bloc",
  subtitle: "Anatomie d'un wagon : chargement, empreinte précédente, Nonce et Hash",
  ctx: null,

  rafId: null,
  tooltipLayer: null,
  activeSpotId: null,

  /**
   * Initialise le module avec le contexte global de l'application.
   * @param {object} context
   */
  init(context) {
    this.ctx = context;
  },

  /**
   * Active l'étape 1 :
   * - Met en place le train à quai avec la Locomotive (#0) et le Wagon #1
   * - Crée les 4 infobulles anatomiques avec traits SVG
   * - Cadre la caméra sur le Wagon #1
   */
  enter() {
    const { trainConvoy, cameraController, environment } = this.ctx;

    this.activeSpotId = null;

    if (cameraController) {
      cameraController.setViewOffset(210);
    }

    if (environment) {
      environment.setSpeed(0);
    }

    if (trainConvoy) {
      trainConvoy.resetConvoy([
        { emetteur: 'Arthur', destinataire: 'Alban', montant: 15, unite: 'MMI-Coin' }
      ]);
      if (cameraController) {
        cameraController.setInteractiveObjects(trainConvoy.getInteractiveObjects());
      }
    }

    this.setupTooltipsLayer();
    this.createAnatomyTooltips();
    this.focusPart(null);
    this.startAnimationLoop();
    this.renderLeftPanel();
  },

  /**
   * Quitte l'étape 1 et nettoie la scène et l'interface.
   */
  exit() {
    this.stopAnimationLoop();

    if (this.tooltipLayer) {
      this.tooltipLayer.remove();
      this.tooltipLayer = null;
    }

    const panel = document.getElementById('step-panel-left');
    if (panel) {
      const inner = panel.querySelector('.step-panel-inner');
      if (inner) inner.remove();
    }
  },

  /**
   * Initialise le conteneur DOM pour les infobulles 3D projetées.
   */
  setupTooltipsLayer() {
    const hud = document.getElementById('hud');
    if (!hud) return;

    if (!this.tooltipLayer) {
      this.tooltipLayer = document.createElement('div');
      this.tooltipLayer.id = 'step1-tooltips-layer';
      this.tooltipLayer.className = 'scene-tooltips-layer';
      hud.appendChild(this.tooltipLayer);
    }
    this.tooltipLayer.innerHTML = '';
  },

  /**
   * Construit les 4 infobulles 3D d'anatomie du Wagon #1 avec leurs traits de rappel SVG.
   */
  createAnatomyTooltips() {
    if (!this.tooltipLayer) return;

    const { trainConvoy } = this.ctx;
    const wagon1 = trainConvoy?.getWagon(1);
    const block1 = trainConvoy?.getBlock(1);
    if (!wagon1 || !block1) return;

    const colorCargo = '#f97316';
    const colorPrev = '#' + wagon1.colorPrevHash.getHexString();
    const colorNonce = '#f59e0b';
    const colorHash = '#' + wagon1.colorHash.getHexString();

    const prevShort = block1.previousHash ? block1.previousHash.substring(0, 8) : '00a89f41';
    const hashShort = block1.hash ? block1.hash.substring(0, 8) : 'e55c70ac';
    const nonceVal = block1.nonce ?? 0;

    this.tooltipLayer.innerHTML = `
      <svg id="step1-tooltips-svg" style="position: absolute; inset: 0; width: 100%; height: 100%; pointer-events: none; overflow: visible; z-index: 10;">
        <!-- 1. PreviousHash -> Étiquette gauche (1A) et Crochet avant (1B) -->
        <line id="s1-line-prev-plate" stroke="${colorPrev}" stroke-width="2" stroke-linecap="round" opacity="0.9" />
        <circle id="s1-dot-prev-plate-out" r="7" fill="none" stroke="${colorPrev}" stroke-width="1.5" opacity="0.8" />
        <circle id="s1-dot-prev-plate-in" r="3.5" fill="${colorPrev}" />

        <line id="s1-line-prev-hook" stroke="${colorPrev}" stroke-width="2" stroke-linecap="round" opacity="0.9" />
        <circle id="s1-dot-prev-hook-out" r="7" fill="none" stroke="${colorPrev}" stroke-width="1.5" opacity="0.8" />
        <circle id="s1-dot-prev-hook-in" r="3.5" fill="${colorPrev}" />

        <!-- 2. Chargement (Transactions) -> Conteneurs intérieurs -->
        <line id="s1-line-cargo" stroke="${colorCargo}" stroke-width="2" stroke-linecap="round" opacity="0.9" />
        <circle id="s1-dot-cargo-out" r="7" fill="none" stroke="${colorCargo}" stroke-width="1.5" opacity="0.8" />
        <circle id="s1-dot-cargo-in" r="3.5" fill="${colorCargo}" />

        <!-- 3. Nonce -> Molette mécanique sur le châssis -->
        <line id="s1-line-nonce" stroke="${colorNonce}" stroke-width="2" stroke-linecap="round" opacity="0.9" />
        <circle id="s1-dot-nonce-out" r="7" fill="none" stroke="${colorNonce}" stroke-width="1.5" opacity="0.8" />
        <circle id="s1-dot-nonce-in" r="3.5" fill="${colorNonce}" />

        <!-- 4. Hash du bloc -> Étiquette centrale (4A) et Prise arrière (4B) -->
        <line id="s1-line-hash-plate" stroke="${colorHash}" stroke-width="2" stroke-linecap="round" opacity="0.9" />
        <circle id="s1-dot-hash-plate-out" r="7" fill="none" stroke="${colorHash}" stroke-width="1.5" opacity="0.8" />
        <circle id="s1-dot-hash-plate-in" r="3.5" fill="${colorHash}" />

        <line id="s1-line-hash-socket" stroke="${colorHash}" stroke-width="2" stroke-linecap="round" opacity="0.9" />
        <circle id="s1-dot-hash-socket-out" r="7" fill="none" stroke="${colorHash}" stroke-width="1.5" opacity="0.8" />
        <circle id="s1-dot-hash-socket-in" r="3.5" fill="${colorHash}" />
      </svg>

      <!-- Pastille 1 : PreviousHash -->
      <div id="tooltip-spot-prev" class="scene-tooltip" style="--spot-color: ${colorPrev}; z-index: 12;">
        <button type="button" class="scene-tooltip-pill">
          <span class="scene-tooltip-dot"></span>
          <span class="scene-tooltip-label">PreviousHash : <code>${prevShort}...</code></span>
        </button>
        <div class="scene-tooltip-card">
          <div class="scene-tooltip-card-title">1. Empreinte précédente (PreviousHash)</div>
          <p class="scene-tooltip-card-text">Recopie l'empreinte de la locomotive (Bloc #0) sur l'étiquette gauche et le crochet avant pour verrouiller l'attelage.</p>
        </div>
      </div>

      <!-- Pastille 2 : Chargement / Transactions -->
      <div id="tooltip-spot-cargo" class="scene-tooltip" style="--spot-color: ${colorCargo}; z-index: 12;">
        <button type="button" class="scene-tooltip-pill">
          <span class="scene-tooltip-dot"></span>
          <span class="scene-tooltip-label">Transactions (Chargement)</span>
        </button>
        <div class="scene-tooltip-card">
          <div class="scene-tooltip-card-title">2. Données / Transactions</div>
          <p class="scene-tooltip-card-text">Les marchandises placées dans le wagon vitré (ici : 15 MMI-Coin d'Arthur vers Alban), visibles et vérifiables par tous.</p>
        </div>
      </div>

      <!-- Pastille 3 : Nonce (placée sous le châssis) -->
      <div id="tooltip-spot-nonce" class="scene-tooltip tooltip-below" style="--spot-color: ${colorNonce}; z-index: 12;">
        <button type="button" class="scene-tooltip-pill">
          <span class="scene-tooltip-dot"></span>
          <span class="scene-tooltip-label">Molette Nonce : <code>${nonceVal}</code></span>
        </button>
        <div class="scene-tooltip-card">
          <div class="scene-tooltip-card-title">3. Compteur mécanique (Nonce)</div>
          <p class="scene-tooltip-card-text">Nombre ajusté lors de la validation du wagon en gare (étape 5) pour obtenir une empreinte conforme aux règles du réseau.</p>
        </div>
      </div>

      <!-- Pastille 4 : Hash actuel du bloc -->
      <div id="tooltip-spot-hash" class="scene-tooltip" style="--spot-color: ${colorHash}; z-index: 12;">
        <button type="button" class="scene-tooltip-pill">
          <span class="scene-tooltip-dot"></span>
          <span class="scene-tooltip-label">Hash #1 : <code>${hashShort}...</code></span>
        </button>
        <div class="scene-tooltip-card">
          <div class="scene-tooltip-card-title">4. Empreinte du bloc (Hash SHA-256)</div>
          <p class="scene-tooltip-card-text">Signature unique calculée à partir des 3 éléments (Transactions + PreviousHash + Nonce). Elle donne sa couleur à l'étiquette centrale et à la prise arrière.</p>
        </div>
      </div>
    `;

    ['prev', 'cargo', 'nonce', 'hash'].forEach((id) => {
      const el = document.getElementById(`tooltip-spot-${id}`);
      el?.querySelector('.scene-tooltip-pill')?.addEventListener('click', (e) => {
        e.stopPropagation();
        const nextId = this.activeSpotId === id ? null : id;
        this.focusPart(nextId);
      });
    });
  },

  /**
   * Cible la caméra et met en évidence l'un des 4 éléments anatomiques (ou vue globale si null).
   * @param {string|null} partId - 'prev' | 'cargo' | 'nonce' | 'hash' | null
   */
  focusPart(partId) {
    this.activeSpotId = partId;
    const { cameraController, trainConvoy } = this.ctx;
    const wagon1Pos = trainConvoy ? trainConvoy.getWagonPosition(1) : new THREE.Vector3(3.8, 0, 0);

    // Mise à jour de l'état actif sur les infobulles 3D
    ['prev', 'cargo', 'nonce', 'hash'].forEach((id) => {
      const el = document.getElementById(`tooltip-spot-${id}`);
      el?.classList.toggle('active', this.activeSpotId === id);
      if (el) {
        el.style.zIndex = this.activeSpotId === id ? '20' : '12';
      }
    });

    // Mise à jour de l'état actif sur les boutons du volet gauche
    document.querySelectorAll('.anatomy-item-btn').forEach((btn) => {
      btn.classList.toggle('active', btn.getAttribute('data-part') === (partId || 'all'));
    });

    if (!cameraController) return;

    if (partId === 'prev') {
      cameraController.moveTo(
        new THREE.Vector3(wagon1Pos.x - 1.65, 1.35, 3.1),
        new THREE.Vector3(wagon1Pos.x - 1.1, 0.35, 0),
        0.9
      );
    } else if (partId === 'cargo') {
      cameraController.moveTo(
        new THREE.Vector3(wagon1Pos.x - 0.1, 1.55, 2.7),
        new THREE.Vector3(wagon1Pos.x - 0.1, 0.55, 0),
        0.9
      );
    } else if (partId === 'nonce') {
      cameraController.moveTo(
        new THREE.Vector3(wagon1Pos.x + 0.1, 0.85, 2.55),
        new THREE.Vector3(wagon1Pos.x, 0.25, 0.4),
        0.9
      );
    } else if (partId === 'hash') {
      cameraController.moveTo(
        new THREE.Vector3(wagon1Pos.x + 1.15, 1.35, 3.2),
        new THREE.Vector3(wagon1Pos.x + 0.55, 0.38, 0),
        0.9
      );
    } else {
      // Vue d'ensemble idéale pour visualiser les 4 infobulles simultanément
      cameraController.moveTo(
        new THREE.Vector3(wagon1Pos.x + 0.1, 1.55, 4.15),
        new THREE.Vector3(wagon1Pos.x, 0.42, 0),
        1.0
      );
    }
  },

  /**
   * Boucle d'animation :
   * - Maintient les couleurs cryptographiques des anneaux (avant = previousHash, arrière = hash)
   * - Met à jour en temps réel les coordonnées 2D des 4 infobulles et de leurs traits SVG
   */
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

    const loop = () => {
      const { trainConvoy, camera } = this.ctx;
      const loco0 = trainConvoy?.getWagon(0);
      const wagon1 = trainConvoy?.getWagon(1);
      const time = performance.now() * 0.003;

      if (loco0 && wagon1) {
        const pulse = 1.4 + Math.sin(time * 3) * 0.2;

        if (loco0.rearRingMaterial) {
          loco0.rearRingMaterial.color.copy(loco0.colorHash);
          loco0.rearRingMaterial.emissive.copy(loco0.colorHash);
          loco0.rearRingMaterial.emissiveIntensity = pulse;
        }
        if (wagon1.frontRingMaterial) {
          wagon1.frontRingMaterial.color.copy(wagon1.colorPrevHash);
          wagon1.frontRingMaterial.emissive.copy(wagon1.colorPrevHash);
          wagon1.frontRingMaterial.emissiveIntensity = pulse;
        }
        if (wagon1.rearRingMaterial) {
          wagon1.rearRingMaterial.color.copy(wagon1.colorHash);
          wagon1.rearRingMaterial.emissive.copy(wagon1.colorHash);
          wagon1.rearRingMaterial.emissiveIntensity = pulse;
        }
      }

      if (this.tooltipLayer && camera && wagon1) {
        const width = window.innerWidth;
        const height = window.innerHeight;

        // Cibles 3D locales sur le Wagon #1
        const pPrevPlate = wagon1.localToWorld(new THREE.Vector3(-1.185, 0.62, 0.15));
        const pPrevHook = wagon1.localToWorld(new THREE.Vector3(-1.42, 0.0, 0.0));
        const pCargo = wagon1.localToWorld(new THREE.Vector3(-0.45, 0.72, 0.15));
        const pNonce = wagon1.localToWorld(new THREE.Vector3(0.0, 0.2, 0.71));
        const pHashPlate = wagon1.localToWorld(new THREE.Vector3(0.15, 0.62, 0.605));
        const pHashSocket = wagon1.localToWorld(new THREE.Vector3(1.48, 0.0, 0.0));

        const prPrevPlate = pPrevPlate.project(camera);
        const prPrevHook = pPrevHook.project(camera);
        const prCargo = pCargo.project(camera);
        const prNonce = pNonce.project(camera);
        const prHashPlate = pHashPlate.project(camera);
        const prHashSocket = pHashSocket.project(camera);

        if (
          prPrevPlate.z > 1 ||
          prCargo.z > 1 ||
          prNonce.z > 1 ||
          prHashPlate.z > 1
        ) {
          this.tooltipLayer.style.opacity = '0';
          this.tooltipLayer.style.pointerEvents = 'none';
        } else {
          const toX = (v) => (v.x * 0.5 + 0.5) * width;
          const toY = (v) => (-v.y * 0.5 + 0.5) * height;

          const prevPlateX = toX(prPrevPlate);
          const prevPlateY = toY(prPrevPlate);
          const prevHookX = toX(prPrevHook);
          const prevHookY = toY(prPrevHook);

          const cargoX = toX(prCargo);
          const cargoY = toY(prCargo);

          const nonceX = toX(prNonce);
          const nonceY = toY(prNonce);

          const hashPlateX = toX(prHashPlate);
          const hashPlateY = toY(prHashPlate);
          const hashSocketX = toX(prHashSocket);
          const hashSocketY = toY(prHashSocket);

          // Masquage si le wagon passe derrière le volet gauche
          const minX = Math.min(prevPlateX, cargoX, hashPlateX);
          const isCovered = width > 768 && minX < 390;
          this.tooltipLayer.style.opacity = isCovered ? '0' : '1';
          this.tooltipLayer.style.pointerEvents = isCovered ? 'none' : 'auto';

          // Rangée supérieure (3 infobulles espacées proprement sans chevauchement)
          const topBaseY = Math.min(prevPlateY, cargoY, hashPlateY) - 74;

          const pillPrevX = Math.max(455, Math.min(prevPlateX, prevHookX) - 10);
          const pillPrevY = topBaseY + 6;

          const pillCargoX = Math.max(cargoX, pillPrevX + 195);
          const pillCargoY = topBaseY - 24;

          const pillHashX = Math.max((hashPlateX + hashSocketX) * 0.5 + 15, pillCargoX + 195);
          const pillHashY = topBaseY + 6;

          // Rangée inférieure (infobulle Nonce sous le châssis)
          const pillNonceX = Math.max(465, nonceX);
          const pillNonceY = nonceY + 66;

          const setPillPos = (id, x, y) => {
            const el = document.getElementById(id);
            if (el) {
              el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0) translate(-50%, -50%)`;
            }
          };

          setPillPos('tooltip-spot-prev', pillPrevX, pillPrevY);
          setPillPos('tooltip-spot-cargo', pillCargoX, pillCargoY);
          setPillPos('tooltip-spot-nonce', pillNonceX, pillNonceY);
          setPillPos('tooltip-spot-hash', pillHashX, pillHashY);

          // Mise à jour des traits SVG
          // 1. PreviousHash -> étiquette gauche + crochet avant
          setLineAndDot(
            's1-line-prev-plate',
            's1-dot-prev-plate-in',
            's1-dot-prev-plate-out',
            pillPrevX + 16,
            pillPrevY + 14,
            prevPlateX,
            prevPlateY
          );
          setLineAndDot(
            's1-line-prev-hook',
            's1-dot-prev-hook-in',
            's1-dot-prev-hook-out',
            pillPrevX - 18,
            pillPrevY + 14,
            prevHookX,
            prevHookY
          );

          // 2. Chargement -> conteneur intérieur
          setLineAndDot(
            's1-line-cargo',
            's1-dot-cargo-in',
            's1-dot-cargo-out',
            pillCargoX,
            pillCargoY + 14,
            cargoX,
            cargoY
          );

          // 3. Nonce -> molette châssis (trait partant du haut de la pastille inférieure)
          setLineAndDot(
            's1-line-nonce',
            's1-dot-nonce-in',
            's1-dot-nonce-out',
            pillNonceX,
            pillNonceY - 14,
            nonceX,
            nonceY
          );

          // 4. Hash -> étiquette centrale + anneau arrière
          setLineAndDot(
            's1-line-hash-plate',
            's1-dot-hash-plate-in',
            's1-dot-hash-plate-out',
            pillHashX - 22,
            pillHashY + 14,
            hashPlateX,
            hashPlateY
          );
          setLineAndDot(
            's1-line-hash-socket',
            's1-dot-hash-socket-in',
            's1-dot-hash-socket-out',
            pillHashX + 22,
            pillHashY + 14,
            hashSocketX,
            hashSocketY
          );
        }
      }

      this.rafId = requestAnimationFrame(loop);
    };

    this.rafId = requestAnimationFrame(loop);
  },

  /**
   * Arrête la boucle d'animation.
   */
  stopAnimationLoop() {
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  },

  /**
   * Génère le volet pédagogique gauche pour l'étape 1.
   */
  renderLeftPanel() {
    const panel = document.getElementById('step-panel-left');
    if (!panel) return;

    panel.classList.add('active');

    const oldInner = panel.querySelector('.step-panel-inner');
    if (oldInner) oldInner.remove();

    const { trainConvoy } = this.ctx;
    const wagon1 = trainConvoy?.getWagon(1);
    const block1 = trainConvoy?.getBlock(1);

    const colorCargo = '#f97316';
    const colorPrev = wagon1 ? '#' + wagon1.colorPrevHash.getHexString() : '#38bdf8';
    const colorNonce = '#f59e0b';
    const colorHash = wagon1 ? '#' + wagon1.colorHash.getHexString() : '#10b981';

    const hashShort = block1?.hash ? block1.hash.substring(0, 10) : 'e55c70ac14';
    const prevShort = block1?.previousHash ? block1.previousHash.substring(0, 10) : '00a89f41b2';
    const nonceVal = block1?.nonce ?? 0;

    const inner = document.createElement('div');
    inner.className = 'step-panel-inner';

    inner.innerHTML = `
      <header class="step-panel-header">
        <h2 class="step-panel-title">Structure d'un Bloc</h2>
      </header>

      <div class="step-panel-scroll">
        <article class="step-card context-card animate-fade">
          <h3 class="card-title">Anatomie d'un wagon</h3>
          <p>
            Un bloc est comparable à un wagon aux parois de verre. Tout le réseau peut lire ce qu'il transporte, mais personne ne peut modifier son contenu une fois scellé.
          </p>
          <p>
            Cliquez sur une infobulle 3D ou sur un élément ci-dessous pour inspecter les <strong>4 composants</strong> qui forment un bloc :
          </p>

          <div class="anatomy-list">
            <button type="button" class="anatomy-item-btn" data-part="prev" style="--item-color: ${colorPrev};">
              <span class="anatomy-dot"></span>
              <span class="anatomy-name">1. PreviousHash (Attache avant)</span>
              <code class="anatomy-code">${prevShort}...</code>
            </button>

            <button type="button" class="anatomy-item-btn" data-part="cargo" style="--item-color: ${colorCargo};">
              <span class="anatomy-dot"></span>
              <span class="anatomy-name">2. Transactions (Conteneurs)</span>
              <code class="anatomy-code">15 MMI-Coin</code>
            </button>

            <button type="button" class="anatomy-item-btn" data-part="nonce" style="--item-color: ${colorNonce};">
              <span class="anatomy-dot"></span>
              <span class="anatomy-name">3. Molette du Nonce</span>
              <code class="anatomy-code">${nonceVal}</code>
            </button>

            <button type="button" class="anatomy-item-btn" data-part="hash" style="--item-color: ${colorHash};">
              <span class="anatomy-dot"></span>
              <span class="anatomy-name">4. Hash du bloc (Sceau actuel)</span>
              <code class="anatomy-code">${hashShort}...</code>
            </button>

            <button type="button" class="anatomy-item-btn active" data-part="all" style="--item-color: #94a3b8;">
              <span class="anatomy-dot"></span>
              <span class="anatomy-name">Vue d'ensemble du wagon</span>
              <code class="anatomy-code">Complet</code>
            </button>
          </div>
        </article>

        <article class="step-card keypoint-card animate-fade">
          <h4 class="card-title keypoint-title">Point clé : La recette de l'empreinte</h4>
          <p class="keypoint-text">
            L'empreinte unique du wagon (son <strong>Hash</strong>, qui colore son étiquette centrale et sa prise arrière) est calculée mathématiquement en combinant les trois premiers éléments :
          </p>
          <div class="block-formula-box">
            <span>PreviousHash</span> + <span>Transactions</span> + <span>Nonce</span> &rarr; <strong style="color: ${colorHash};">Hash du Bloc</strong>
          </div>
        </article>

        <nav class="step-nav-bar animate-fade">
          <button id="btn-step1-action-prev" class="btn-panel-ghost">
            <span class="btn-arrow">&larr;</span>
            <span>Accueil</span>
          </button>
          <button id="btn-step1-action-next" class="btn-panel-primary">
            <span>Étape 2 : Le Chaînage</span>
            <span class="btn-arrow">&rarr;</span>
          </button>
        </nav>
      </div>
    `;

    panel.prepend(inner);
    this.setupEvents();
  },

  /**
   * Attache les écouteurs d'interaction sur le volet gauche.
   */
  setupEvents() {
    document.querySelectorAll('.anatomy-item-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const part = btn.getAttribute('data-part');
        this.focusPart(part === 'all' ? null : part);
      });
    });

    document.getElementById('btn-step1-action-prev')?.addEventListener('click', () => {
      if (typeof this.ctx.onPrevStep === 'function') {
        this.ctx.onPrevStep();
      }
    });

    document.getElementById('btn-step1-action-next')?.addEventListener('click', () => {
      if (typeof this.ctx.onNextStep === 'function') {
        this.ctx.onNextStep();
      }
    });
  }
};
