import * as THREE from 'three';

/**
 * Étape 2 : Chaînage Cryptographique.
 * Mise en scène du principe fondamental de la blockchain :
 * chaque wagon intègre à l'avant l'empreinte exacte (PreviousHash) du wagon qui le précède.
 *
 * Utilise 2 infobulles 3D projetées avec traits SVG comparatifs (symétrie avec l'Étape 3) :
 * 1) Hash du wagon parent (étiquette centrale + prise d'attelage arrière)
 * 2) PreviousHash du wagon suivant (étiquette avant gauche + crochet d'attelage)
 * Les deux éléments partagent la même signature et la même couleur, scellant l'attelage.
 */
export const step2 = {
  id: 2,
  title: 'Chaînage Cryptographique',
  subtitle: 'Transmission de l’empreinte : l’attelage magnétique entre les wagons',
  ctx: null,

  rafId: null,
  focusedCouplerIndex: 2, // 1: Loco #0 <-> Wagon #1, 2: Wagon #1 <-> Wagon #2, 3: Wagon #2 <-> Wagon #3
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
   * - Réinitialise le convoi avec Locomotive (#0) et Wagons (#1 et #2)
   * - Configure les infobulles comparatives
   * - Cadre la caméra sur l'attelage standard Wagon #1 <-> Wagon #2
   */
  enter() {
    const { trainConvoy, cameraController, environment } = this.ctx;

    this.focusedCouplerIndex = 2;
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
    this.focusOnCoupler(2);
    this.startAnimationLoop();
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
   * Construit les 2 infobulles 3D comparatives avec leurs traits de rappel SVG :
   * 1) Infobulle Hash parent -> étiquette + prise arrière du parent
   * 2) Infobulle PreviousHash enfant -> étiquette + crochet avant de l'enfant
   */
  createComparativeTooltips() {
    if (!this.tooltipLayer) return;

    const { trainConvoy } = this.ctx;
    const childIdx = this.focusedCouplerIndex;
    const parentIdx = childIdx - 1;

    const parentWagon = trainConvoy?.getWagon(parentIdx);
    const childWagon = trainConvoy?.getWagon(childIdx);
    const parentBlock = trainConvoy?.getBlock(parentIdx);
    const childBlock = trainConvoy?.getBlock(childIdx);

    if (!parentWagon || !childWagon || !parentBlock || !childBlock) return;

    const colorParent = '#' + parentWagon.colorHash.getHexString();
    const colorChild = '#' + childWagon.colorPrevHash.getHexString();

    const parentHashShort = parentBlock.hash ? parentBlock.hash.substring(0, 8) : '00a89f41';
    const childPrevShort = childBlock.previousHash ? childBlock.previousHash.substring(0, 8) : '00a89f41';

    const parentTitle = parentIdx === 0 ? 'Locomotive #0' : `Wagon #${parentIdx}`;
    const childTitle = `Wagon #${childIdx}`;

    this.tooltipLayer.innerHTML = `
      <svg id="step2-tooltips-svg" style="position: absolute; inset: 0; width: 100%; height: 100%; pointer-events: none; overflow: visible; z-index: 10;">
        <!-- Ligne 1A : Infobulle 1 -> Plaque Hash parent -->
        <line id="s2-line-1a" stroke="${colorParent}" stroke-width="2" stroke-linecap="round" opacity="0.9" />
        <circle id="s2-dot-1a-out" r="7" fill="none" stroke="${colorParent}" stroke-width="1.5" opacity="0.8" />
        <circle id="s2-dot-1a-in" r="3.5" fill="${colorParent}" />

        <!-- Ligne 1B : Infobulle 1 -> Prise arrière parent -->
        <line id="s2-line-1b" stroke="${colorParent}" stroke-width="2" stroke-linecap="round" opacity="0.9" />
        <circle id="s2-dot-1b-out" r="7" fill="none" stroke="${colorParent}" stroke-width="1.5" opacity="0.8" />
        <circle id="s2-dot-1b-in" r="3.5" fill="${colorParent}" />

        <!-- Ligne 2A : Infobulle 2 -> Plaque PreviousHash enfant -->
        <line id="s2-line-2a" stroke="${colorChild}" stroke-width="2" stroke-linecap="round" opacity="0.9" />
        <circle id="s2-dot-2a-out" r="7" fill="none" stroke="${colorChild}" stroke-width="1.5" opacity="0.8" />
        <circle id="s2-dot-2a-in" r="3.5" fill="${colorChild}" />

        <!-- Ligne 2B : Infobulle 2 -> Crochet avant enfant -->
        <line id="s2-line-2b" stroke="${colorChild}" stroke-width="2" stroke-linecap="round" opacity="0.9" />
        <circle id="s2-dot-2b-out" r="7" fill="none" stroke="${colorChild}" stroke-width="1.5" opacity="0.8" />
        <circle id="s2-dot-2b-in" r="3.5" fill="${colorChild}" />
      </svg>

      <!-- Infobulle 1 : Hash du bloc parent -->
      <div id="tooltip-spot-parent" class="scene-tooltip" style="--spot-color: ${colorParent}; z-index: 12;">
        <button type="button" class="scene-tooltip-pill">
          <span class="scene-tooltip-dot"></span>
          <span class="scene-tooltip-label">Hash : <code>${parentHashShort}...</code></span>
        </button>
        <div class="scene-tooltip-card">
          <div class="scene-tooltip-card-title">Empreinte de sortie (${parentTitle})</div>
          <p class="scene-tooltip-card-text">L'étiquette centrale et la prise arrière portent cette couleur unique, calculée à partir des données de ce bloc.</p>
        </div>
      </div>

      <!-- Infobulle 2 : PreviousHash du bloc suivant -->
      <div id="tooltip-spot-child" class="scene-tooltip" style="--spot-color: ${colorChild}; z-index: 12;">
        <button type="button" class="scene-tooltip-pill">
          <span class="scene-tooltip-dot"></span>
          <span class="scene-tooltip-label">PreviousHash : <code>${childPrevShort}...</code></span>
        </button>
        <div class="scene-tooltip-card">
          <div class="scene-tooltip-card-title">Attache amont (${childTitle})</div>
          <p class="scene-tooltip-card-text">L'étiquette gauche et le crochet d'attelage recopient exactement l'empreinte du wagon précédent : la concordance parfaite verrouille la liaison.</p>
        </div>
      </div>
    `;

    const el1 = document.getElementById('tooltip-spot-parent');
    const el2 = document.getElementById('tooltip-spot-child');

    el1?.addEventListener('pointerdown', (e) => e.stopPropagation());
    el1?.querySelector('.scene-tooltip-pill')?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.toggleTooltipSpot('parent');
    });

    el2?.addEventListener('pointerdown', (e) => e.stopPropagation());
    el2?.querySelector('.scene-tooltip-pill')?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.toggleTooltipSpot('child');
    });
  },

  /**
   * Active ou désactive la carte d'une infobulle.
   * @param {string} spotId
   */
  toggleTooltipSpot(spotId) {
    this.activeSpotId = this.activeSpotId === spotId ? null : spotId;

    const el1 = document.getElementById('tooltip-spot-parent');
    const el2 = document.getElementById('tooltip-spot-child');

    el1?.classList.toggle('active', this.activeSpotId === 'parent');
    el2?.classList.toggle('active', this.activeSpotId === 'child');
  },

  /**
   * Oriente la caméra sur un attelage donné du convoi et met à jour les infobulles.
   * @param {number} childBlockIndex - Index du wagon enfant (1, 2 ou 3)
   */
  focusOnCoupler(childBlockIndex) {
    const { cameraController, trainConvoy } = this.ctx;
    const totalBlocks = trainConvoy ? trainConvoy.blockchain.chain.length : 3;
    this.focusedCouplerIndex = Math.max(1, Math.min(childBlockIndex, totalBlocks - 1));

    this.createComparativeTooltips();

    const couplerX = (this.focusedCouplerIndex - 0.5) * 3.8;

    if (cameraController) {
      cameraController.moveTo(
        new THREE.Vector3(couplerX, 1.45, 3.8),
        new THREE.Vector3(couplerX, 0.45, 0),
        1.0
      );
    }

    this.renderLeftPanel();
  },

  /**
   * Ajoute un nouveau wagon à la fin du convoi et déplace la caméra sur son attelage.
   */
  attachNewWagon() {
    const { trainConvoy } = this.ctx;
    if (!trainConvoy) return;

    if (trainConvoy.blockchain.chain.length >= 4) {
      this.focusOnCoupler(3);
      return;
    }

    trainConvoy.addBlock({
      emetteur: 'Charlie',
      destinataire: 'Diane',
      montant: 12,
      unite: 'MMI-Coin'
    });

    const newIndex = trainConvoy.blockchain.chain.length - 1;
    this.focusOnCoupler(newIndex);
  },

  /**
   * Boucle d'animation :
   * - Met à jour les anneaux et faisceaux lumineux selon les hashs
   * - Calcule les positions 2D des infobulles et traits SVG
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

      // Projection 3D -> 2D des infobulles comparatives
      const childIdx = this.focusedCouplerIndex;
      const parentIdx = childIdx - 1;
      const parentWagon = trainConvoy?.getWagon(parentIdx);
      const childWagon = trainConvoy?.getWagon(childIdx);

      if (this.tooltipLayer && camera && parentWagon && childWagon) {
        const width = window.innerWidth;
        const height = window.innerHeight;

        // Cibles parent (Plaque centrale et Prise arrière)
        const pParentPlate = new THREE.Vector3();
        if (parentIdx === 0) {
          parentWagon.localToWorld(pParentPlate.set(-0.35, 0.65, 0.64));
        } else {
          parentWagon.localToWorld(pParentPlate.set(0.15, 0.62, 0.605));
        }

        const pParentSocket = new THREE.Vector3();
        parentWagon.localToWorld(pParentSocket.set(1.48, 0.05, 0.0));

        // Cibles enfant (Plaque PreviousHash et Crochet avant)
        const pChildPlate = new THREE.Vector3();
        childWagon.localToWorld(pChildPlate.set(-1.185, 0.62, 0.15));

        const pChildCoupler = new THREE.Vector3();
        childWagon.localToWorld(pChildCoupler.set(-1.42, 0.0, 0.0));

        const prPPlate = pParentPlate.project(camera);
        const prPSocket = pParentSocket.project(camera);
        const prCPlate = pChildPlate.project(camera);
        const prCCoupler = pChildCoupler.project(camera);

        if (prPPlate.z > 1 || prPSocket.z > 1 || prCPlate.z > 1 || prCCoupler.z > 1) {
          this.tooltipLayer.style.opacity = '0';
          this.tooltipLayer.style.visibility = 'hidden';
        } else {
          const toX = (v) => (v.x * 0.5 + 0.5) * width;
          const toY = (v) => (-v.y * 0.5 + 0.5) * height;

          const px1 = toX(prPPlate);
          const py1 = toY(prPPlate);
          const sx1 = toX(prPSocket);
          const sy1 = toY(prPSocket);

          const cx2 = toX(prCPlate);
          const cy2 = toY(prCPlate);
          const kx2 = toX(prCCoupler);
          const ky2 = toY(prCCoupler);

          // Masquage si passe derrière le volet gauche
          const minX = Math.min(px1, sx1, cx2, kx2);
          const isCovered = width > 768 && minX < 410;
          this.tooltipLayer.style.opacity = isCovered ? '0' : '1';
          this.tooltipLayer.style.visibility = isCovered ? 'hidden' : 'visible';

          // Calcul des positions des 2 pastilles flottantes
          const pill1_X = (px1 + sx1) * 0.5;
          const pill1_Y = Math.min(py1, sy1) - 66;

          const pill2_X = Math.max((cx2 + kx2) * 0.5, pill1_X + 175);
          const pill2_Y = pill1_Y;

          const el1 = document.getElementById('tooltip-spot-parent');
          const el2 = document.getElementById('tooltip-spot-child');
          if (el1) {
            el1.style.transform = `translate3d(${pill1_X.toFixed(1)}px, ${pill1_Y.toFixed(1)}px, 0) translate(-50%, -50%)`;
          }
          if (el2) {
            el2.style.transform = `translate3d(${pill2_X.toFixed(1)}px, ${pill2_Y.toFixed(1)}px, 0) translate(-50%, -50%)`;
          }

          // Lignes SVG parent
          setLineAndDot('s2-line-1a', 's2-dot-1a-in', 's2-dot-1a-out', pill1_X - 22, pill1_Y + 14, px1, py1);
          setLineAndDot('s2-line-1b', 's2-dot-1b-in', 's2-dot-1b-out', pill1_X + 22, pill1_Y + 14, sx1, sy1);

          // Lignes SVG enfant
          setLineAndDot('s2-line-2a', 's2-dot-2a-in', 's2-dot-2a-out', pill2_X - 22, pill2_Y + 14, cx2, cy2);
          setLineAndDot('s2-line-2b', 's2-dot-2b-in', 's2-dot-2b-out', pill2_X + 22, pill2_Y + 14, kx2, ky2);
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
    const childIdx = this.focusedCouplerIndex;
    const parentIdx = childIdx - 1;

    const parentBlock = trainConvoy?.getBlock(parentIdx);
    const childBlock = trainConvoy?.getBlock(childIdx);
    const parentWagon = trainConvoy?.getWagon(parentIdx);
    const childWagon = trainConvoy?.getWagon(childIdx);

    const parentHash = parentBlock ? parentBlock.hash : '0000a89f41b2c3d4';
    const childPrev = childBlock ? childBlock.previousHash : '0000a89f41b2c3d4';
    const colorParent = parentWagon ? '#' + parentWagon.colorHash.getHexString() : '#38bdf8';
    const colorChild = childWagon ? '#' + childWagon.colorPrevHash.getHexString() : '#38bdf8';

    const parentHashShort = parentHash.substring(0, 10);
    const childPrevShort = childPrev.substring(0, 10);

    const parentLabel = parentIdx === 0 ? 'Locomotive #0' : `Wagon #${parentIdx}`;
    const childLabel = `Wagon #${childIdx}`;
    const totalBlocks = trainConvoy?.blockchain?.chain?.length || 3;

    inner.innerHTML = `
      <header class="step-panel-header">
        <h2 class="step-panel-title">Chaînage Cryptographique</h2>
      </header>

      <div class="step-panel-scroll">
        <article class="step-card context-card animate-fade">
          <h3 class="card-title">Le principe de l'attelage</h3>
          <p>
            Chaque nouveau wagon intègre à l'avant la copie exacte de l'empreinte du wagon qui le précède (le champ <strong>PreviousHash</strong>).
          </p>
          <p>
            Observez les infobulles 3D : la prise arrière et le crochet avant portent <strong>exactement la même empreinte et la même couleur</strong>, garantissant le verrouillage mécanique.
          </p>

          <div class="hash-contrast-box">
            <div class="contrast-row">
              <span class="contrast-swatch" style="background: ${colorParent}; box-shadow: 0 0 8px ${colorParent};"></span>
              <span class="contrast-label">Hash ${parentLabel} :</span>
              <code class="contrast-code" style="color: ${colorParent};">${parentHashShort}...</code>
            </div>
            <div class="contrast-row">
              <span class="contrast-swatch" style="background: ${colorChild}; box-shadow: 0 0 8px ${colorChild};"></span>
              <span class="contrast-label">PreviousHash ${childLabel} :</span>
              <code class="contrast-code" style="color: ${colorChild};">${childPrevShort}...</code>
            </div>
            <div class="contrast-status match">
              Concordance parfaite &rarr; Attelage verrouillé et chaîne intègre
            </div>
          </div>
        </article>

        <article class="step-card action-card animate-fade">
          <h3 class="card-title">Changer de liaison à observer</h3>
          <p class="card-instruction">
            Sélectionnez un point d'attelage ou attachez un nouveau wagon pour vérifier la transmission continue de l'empreinte :
          </p>

          <div class="action-choices">
            <button id="btn-step2-coupler-2" class="btn-choice ${childIdx === 2 ? 'active' : ''}">
              <span>Liaison Wagon #1 &rarr; Wagon #2</span>
              <span class="btn-choice-icon">Attelage 2</span>
            </button>
            <button id="btn-step2-coupler-1" class="btn-choice ${childIdx === 1 ? 'active' : ''}">
              <span>Liaison Locomotive #0 &rarr; Wagon #1</span>
              <span class="btn-choice-icon">Attelage 1</span>
            </button>
            ${totalBlocks >= 4 ? `
              <button id="btn-step2-coupler-3" class="btn-choice ${childIdx === 3 ? 'active' : ''}">
                <span>Liaison Wagon #2 &rarr; Wagon #3</span>
                <span class="btn-choice-icon">Attelage 3</span>
              </button>
            ` : `
              <button id="btn-step2-add-wagon" class="btn-choice">
                <span>+ Atteler un wagon (Bloc #3)</span>
                <span class="btn-choice-icon">Ajouter</span>
              </button>
            `}
          </div>
        </article>

        <article class="step-card keypoint-card animate-fade">
          <h4 class="card-title keypoint-title">Point clé : Une dépendance continue</h4>
          <p class="keypoint-text">
            Chaque bloc dépend mathématiquement du précédent. Si quelqu'un voulait modifier un wagon du passé, il briserait tous les attelages suivants jusqu'à la fin du train.
          </p>
        </article>

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
    document.getElementById('btn-step2-coupler-1')?.addEventListener('click', () => {
      this.focusOnCoupler(1);
    });

    document.getElementById('btn-step2-coupler-2')?.addEventListener('click', () => {
      this.focusOnCoupler(2);
    });

    document.getElementById('btn-step2-coupler-3')?.addEventListener('click', () => {
      this.focusOnCoupler(3);
    });

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
