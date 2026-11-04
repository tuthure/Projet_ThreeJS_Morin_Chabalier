import * as THREE from 'three';

/**
 * Étape 2 : Chaînage Cryptographique.
 * Vue d'ensemble du convoi complet et de ses liaisons successives :
 * - Chaque wagon transporte deux empreintes distinctes :
 *   * À l'avant : l'empreinte du wagon précédent (PreviousHash)
 *   * À l'arrière : sa propre empreinte (Hash)
 * - Vue simultanée des liaisons (Liaison 0-1, Liaison 1-2) avec infobulles 3D et traits SVG
 * - Action interactive : Atteler un nouveau wagon (Bloc #3) pour voir la chaîne s'allonger en direct
 */
export const step2 = {
  id: 2,
  title: 'Chaînage Cryptographique',
  subtitle: 'La règle des dominos : chaque wagon s’arrime à l’empreinte du précédent',
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
   * Active l'étape 2 :
   * - Réinitialise le train avec Locomotive (#0) et Wagons (#1 et #2)
   * - Vue panoramique sur l'ensemble du convoi
   * - Initialise les infobulles des liaisons
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
        { emetteur: 'Arthur', destinataire: 'Alban', montant: 15, unite: 'MMI-Coin' },
        { emetteur: 'Alban', destinataire: 'Equipe-R507', montant: 30, unite: 'MMI-Coin' }
      ]);
      if (cameraController) {
        cameraController.setInteractiveObjects(trainConvoy.getInteractiveObjects());
      }
    }

    this.setupTooltipsLayer();
    this.updateCameraView(false);
    this.createChainTooltips();
    this.startAnimationLoop();
    this.renderLeftPanel();
  },

  /**
   * Quitte l'étape 2 et nettoie les ressources 3D et DOM.
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
   * Adapte le cadrage caméra selon le nombre de wagons (vue d'ensemble du convoi).
   * @param {boolean} hasThreeWagons
   */
  updateCameraView(hasThreeWagons = false) {
    const { cameraController } = this.ctx;
    if (!cameraController) return;

    if (hasThreeWagons) {
      cameraController.moveTo(
        new THREE.Vector3(5.7, 2.5, 11.5),
        new THREE.Vector3(5.7, 0.55, 0),
        1.1
      );
    } else {
      cameraController.moveTo(
        new THREE.Vector3(3.8, 2.2, 9.6),
        new THREE.Vector3(3.8, 0.55, 0),
        1.1
      );
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
      this.tooltipLayer.id = 'step2-tooltips-layer';
      this.tooltipLayer.className = 'scene-tooltips-layer';
      hud.appendChild(this.tooltipLayer);
    }
    this.tooltipLayer.innerHTML = '';
  },

  /**
   * Construit les infobulles 3D projetées sur les liaisons du train.
   */
  createChainTooltips() {
    if (!this.tooltipLayer) return;

    const { trainConvoy } = this.ctx;
    if (!trainConvoy) return;

    const totalBlocks = trainConvoy.blockchain.chain.length; // Ex: 3 (Loco + Wagon 1 + Wagon 2) ou 4 (+ Wagon 3)
    const linksCount = totalBlocks - 1; // 2 ou 3

    let svgLinesHTML = '';
    let pillsHTML = '';

    for (let i = 1; i <= linksCount; i++) {
      const parentIdx = i - 1;
      const childIdx = i;

      const parentWagon = trainConvoy.getWagon(parentIdx);
      const childWagon = trainConvoy.getWagon(childIdx);
      const parentBlock = trainConvoy.getBlock(parentIdx);
      const childBlock = trainConvoy.getBlock(childIdx);

      if (!parentWagon || !childWagon || !parentBlock || !childBlock) continue;

      const color = '#' + parentWagon.colorHash.getHexString();
      const hashShort = parentBlock.hash ? parentBlock.hash.substring(0, 8) : '00a89f41';
      const parentName = parentIdx === 0 ? 'Locomotive #0' : `Wagon #${parentIdx}`;
      const childName = `Wagon #${childIdx}`;

      svgLinesHTML += `
        <!-- Liaison ${i} : Ligne gauche vers prise parent -->
        <line id="s2-line-${i}-left" stroke="${color}" stroke-width="2" stroke-linecap="round" opacity="0.9" />
        <circle id="s2-dot-${i}-left-out" r="7" fill="none" stroke="${color}" stroke-width="1.5" opacity="0.8" />
        <circle id="s2-dot-${i}-left-in" r="3.5" fill="${color}" />

        <!-- Liaison ${i} : Ligne droite vers crochet enfant -->
        <line id="s2-line-${i}-right" stroke="${color}" stroke-width="2" stroke-linecap="round" opacity="0.9" />
        <circle id="s2-dot-${i}-right-out" r="7" fill="none" stroke="${color}" stroke-width="1.5" opacity="0.8" />
        <circle id="s2-dot-${i}-right-in" r="3.5" fill="${color}" />
      `;

      pillsHTML += `
        <div id="tooltip-link-${i}" class="scene-tooltip" style="--spot-color: ${color}; z-index: 12;">
          <button type="button" class="scene-tooltip-pill">
            <span class="scene-tooltip-dot"></span>
            <span class="scene-tooltip-label">Liaison ${parentIdx}-${childIdx} : <code>${hashShort}...</code></span>
          </button>
          <div class="scene-tooltip-card">
            <div class="scene-tooltip-card-title">Attelage ${parentName} &rarr; ${childName}</div>
            <p class="scene-tooltip-card-text">
              La prise arrière de ${parentName} et le crochet avant de ${childName} partagent exactement la même empreinte cryptographique.
            </p>
          </div>
        </div>
      `;
    }

    this.tooltipLayer.innerHTML = `
      <svg id="step2-tooltips-svg" style="position: absolute; inset: 0; width: 100%; height: 100%; pointer-events: none; overflow: visible; z-index: 10;">
        ${svgLinesHTML}
      </svg>
      ${pillsHTML}
    `;

    for (let i = 1; i <= linksCount; i++) {
      const el = document.getElementById(`tooltip-link-${i}`);
      el?.addEventListener('pointerdown', (e) => e.stopPropagation());
      el?.querySelector('.scene-tooltip-pill')?.addEventListener('click', (e) => {
        e.stopPropagation();
        this.toggleTooltipSpot(`link-${i}`);
      });
    }
  },

  /**
   * Active ou désactive la carte d'une infobulle.
   * @param {string} spotId
   */
  toggleTooltipSpot(spotId) {
    this.activeSpotId = this.activeSpotId === spotId ? null : spotId;

    const { trainConvoy } = this.ctx;
    const linksCount = (trainConvoy?.blockchain?.chain?.length || 3) - 1;

    for (let i = 1; i <= linksCount; i++) {
      const el = document.getElementById(`tooltip-link-${i}`);
      el?.classList.toggle('active', this.activeSpotId === `link-${i}`);
    }
  },

  /**
   * Ajoute un nouveau wagon (Bloc #3) au convoi et réactualise la vue.
   */
  attachNewWagon() {
    const { trainConvoy } = this.ctx;
    if (!trainConvoy) return;

    if (trainConvoy.blockchain.chain.length >= 4) return;

    trainConvoy.addBlock({
      emetteur: 'Alban',
      destinataire: 'Charlie',
      montant: 8,
      unite: 'MMI-Coin'
    });

    this.updateCameraView(true);
    this.createChainTooltips();
    this.renderLeftPanel();
  },

  /**
   * Boucle d'animation :
   * - Maintient les couleurs des anneaux et faisceaux lumineux
   * - Projette les infobulles sur chaque liaison du train en temps réel
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
      const time = performance.now() * 0.003;
      const pulse = 1.4 + Math.sin(time * 3) * 0.2;

      const loco0 = trainConvoy?.getWagon(0);
      const wagons = trainConvoy?.getWagonMeshes() || [];

      if (loco0 && loco0.rearRingMaterial) {
        loco0.rearRingMaterial.color.copy(loco0.colorHash);
        loco0.rearRingMaterial.emissive.copy(loco0.colorHash);
        loco0.rearRingMaterial.emissiveIntensity = pulse;
      }

      wagons.forEach((wagon) => {
        if (wagon.frontRingMaterial) {
          wagon.frontRingMaterial.color.copy(wagon.colorPrevHash);
          wagon.frontRingMaterial.emissive.copy(wagon.colorPrevHash);
          wagon.frontRingMaterial.emissiveIntensity = pulse;
        }
        if (wagon.rearRingMaterial) {
          wagon.rearRingMaterial.color.copy(wagon.colorHash);
          wagon.rearRingMaterial.emissive.copy(wagon.colorHash);
          wagon.rearRingMaterial.emissiveIntensity = pulse;
        }
        if (wagon.couplerBeamMaterial) {
          wagon.couplerBeamMaterial.color.copy(wagon.colorPrevHash);
          wagon.couplerBeamMaterial.emissive.copy(wagon.colorPrevHash);
          wagon.couplerBeamMaterial.emissiveIntensity = pulse;
        }
        if (wagon.couplerGroup && wagon.defaultCouplerPosition) {
          wagon.couplerGroup.position.copy(wagon.defaultCouplerPosition);
          wagon.couplerGroup.rotation.z = 0;
        }
      });

      // Projection 3D -> 2D pour chaque liaison
      if (this.tooltipLayer && camera && trainConvoy) {
        const width = window.innerWidth;
        const height = window.innerHeight;
        const linksCount = trainConvoy.blockchain.chain.length - 1;

        let anyBehindCamera = false;
        let anyCoveredByPanel = false;

        const toX = (v) => (v.x * 0.5 + 0.5) * width;
        const toY = (v) => (-v.y * 0.5 + 0.5) * height;

        for (let i = 1; i <= linksCount; i++) {
          const parentWagon = trainConvoy.getWagon(i - 1);
          const childWagon = trainConvoy.getWagon(i);
          if (!parentWagon || !childWagon) continue;

          // Prise arrière du parent
          const pSocket = new THREE.Vector3();
          parentWagon.localToWorld(pSocket.set(1.48, 0.05, 0.0));

          // Crochet avant de l'enfant
          const pHook = new THREE.Vector3();
          childWagon.localToWorld(pHook.set(-1.42, 0.0, 0.0));

          const prSocket = pSocket.project(camera);
          const prHook = pHook.project(camera);

          if (prSocket.z > 1 || prHook.z > 1) {
            anyBehindCamera = true;
            break;
          }

          const sx = toX(prSocket);
          const sy = toY(prSocket);
          const hx = toX(prHook);
          const hy = toY(prHook);

          if (width > 768 && Math.min(sx, hx) < 410) {
            anyCoveredByPanel = true;
          }

          const pillX = (sx + hx) * 0.5;
          const pillY = Math.min(sy, hy) - 58;

          const pillEl = document.getElementById(`tooltip-link-${i}`);
          if (pillEl) {
            pillEl.style.transform = `translate3d(${pillX.toFixed(1)}px, ${pillY.toFixed(1)}px, 0) translate(-50%, -50%)`;
          }

          setLineAndDot(
            `s2-line-${i}-left`,
            `s2-dot-${i}-left-in`,
            `s2-dot-${i}-left-out`,
            pillX - 16,
            pillY + 12,
            sx,
            sy
          );

          setLineAndDot(
            `s2-line-${i}-right`,
            `s2-dot-${i}-right-in`,
            `s2-dot-${i}-right-out`,
            pillX + 16,
            pillY + 12,
            hx,
            hy
          );
        }

        const isHidden = anyBehindCamera || anyCoveredByPanel;
        this.tooltipLayer.style.opacity = isHidden ? '0' : '1';
        this.tooltipLayer.style.visibility = isHidden ? 'hidden' : 'visible';
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
   * Génère le volet pédagogique gauche pour l'étape 2.
   */
  renderLeftPanel() {
    const panel = document.getElementById('step-panel-left');
    if (!panel) return;

    panel.classList.add('active');

    const oldInner = panel.querySelector('.step-panel-inner');
    if (oldInner) oldInner.remove();

    const inner = document.createElement('div');
    inner.className = 'step-panel-inner';

    const { trainConvoy } = this.ctx;
    const totalBlocks = trainConvoy?.blockchain?.chain?.length || 3;
    const hasThirdWagon = totalBlocks >= 4;

    inner.innerHTML = `
      <header class="step-panel-header">
        <h2 class="step-panel-title">Chaînage Cryptographique</h2>
      </header>

      <div class="step-panel-scroll">
        <article class="step-card context-card animate-fade">
          <h3 class="card-title">La règle des dominos</h3>
          <p>
            Dans une blockchain, chaque wagon transporte deux empreintes distinctes :
          </p>
          <ul class="clean-bullet-list">
            <li><strong>À l'avant :</strong> l'empreinte du wagon précédent (<em>PreviousHash</em>).</li>
            <li><strong>À l'arrière :</strong> sa propre empreinte (<em>Hash</em>).</li>
          </ul>
          <p>
            Observez les points d'attelage dans la scène : chaque articulation possède sa propre couleur. L'anneau arrière du wagon parent et le crochet avant du wagon suivant affichent toujours la même signature.
          </p>
        </article>

        <article class="step-card action-card animate-fade">
          <h3 class="card-title">Agrandir la chaîne</h3>
          <p class="card-instruction">
            ${!hasThirdWagon
              ? "Ajoutez un wagon pour observer l'enclenchement instantané d'une nouvelle liaison conforme :"
              : "Le convoi compte 4 blocs. Chaque ajout étend la chaîne sans jamais altérer les liaisons antérieures."}
          </p>

          ${!hasThirdWagon ? `
            <div class="substep-action-box" style="margin-top: 10px;">
              <button id="btn-step2-add-wagon" class="btn-panel-primary">
                <span>+ Atteler un wagon supplémentaire</span>
              </button>
            </div>
          ` : `
            <div class="action-feedback-status visible status-success" style="margin-top: 8px;">
              Chaîne de 4 blocs intègre : la 3e liaison s'est verrouillée sur le Hash du Wagon #2.
            </div>
          `}
        </article>

        ${hasThirdWagon ? `
          <article class="step-card keypoint-card animate-fade">
            <h4 class="card-title keypoint-title">Point clé : L'effet domino inverse</h4>
            <p class="keypoint-text">
              Chaque bloc dépend mathématiquement de son ancêtre. Pour falsifier un ancien bloc, un attaquant devrait obligatoirement recalculer et ré-atteler <strong>tous les wagons qui le suivent</strong> jusqu'au bout du convoi.
            </p>
          </article>
        ` : ''}

        <nav class="step-nav-bar animate-fade">
          <button id="btn-step2-action-prev" class="btn-panel-ghost">
            <span class="btn-arrow">&larr;</span>
            <span>Étape 1 : Structure</span>
          </button>
          <button id="btn-step2-action-next" class="btn-panel-primary">
            <span>Étape 3 : Immuabilité</span>
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
    document.getElementById('btn-step2-add-wagon')?.addEventListener('click', () => {
      this.attachNewWagon();
    });

    document.getElementById('btn-step2-action-prev')?.addEventListener('click', () => {
      if (typeof this.ctx.onPrevStep === 'function') {
        this.ctx.onPrevStep();
      }
    });

    document.getElementById('btn-step2-action-next')?.addEventListener('click', () => {
      if (typeof this.ctx.onNextStep === 'function') {
        this.ctx.onNextStep();
      }
    });
  }
};
