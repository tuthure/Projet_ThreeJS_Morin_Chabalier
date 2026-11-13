import * as THREE from 'three';
import { hashToColorHex } from '../three/WagonMesh.js';
import { updateLeftPanelPreserveScroll } from './StepManager.js';

/**
 * Etape 3 : Immuabilite et detection de falsification.
 * Experience interactive d'alteration du chargement du Wagon #1 :
 * - Avant falsification : presentation sobre sans divulgacher les consequences visuelles.
 * - Apres falsification : 2 infobulles 3D reliees avec precision aux elements 3D du train :
 *   1) L'infobulle du Hash #1 (couleur du hash) reliee a l'etiquette centrale ET a l'anneau arriere.
 *   2) L'infobulle du PreviousHash #2 (couleur de l'etiquette) pointant vers l'attache decrochee.
 *   Les traits SVG relient directement les infobulles aux cibles physiques sans flotter dans le vide.
 */
export const step3 = {
  id: 3,
  title: 'Immuabilite et falsification',
  ctx: null,

  rafId: null,
  isBroken: false,
  restoreWaveUntil: 0,

  // Couche DOM des infobulles 3D
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
   * Active l'etape 3 :
   * - Met en place la Locomotive (#0) et deux wagons (#1 et #2)
   * - Centre la camera sur le Wagon #1 et la liaison avec le Wagon #2
   */
  enter() {
    const { trainConvoy, cameraController, environment } = this.ctx;

    this.isBroken = false;
    this.restoreWaveUntil = 0;
    this.activeSpotId = null;

    if (cameraController) {
      cameraController.setViewOffset(210);
    }

    if (environment) {
      environment.setSpeed(0);
    }

    if (trainConvoy) {
      trainConvoy.resetConvoy([
        { lot: 'Fret #104', cargaison: "15 tonnes d'acier", quai: 'Quai A -> Quai B' },
        { lot: 'Convoi express', cargaison: '40 palettes matériel', quai: 'Quai B -> Quai C' }
      ]);
      if (cameraController) {
        cameraController.setInteractiveObjects(trainConvoy.getInteractiveObjects());
      }
    }

    this.setupTooltipsLayer();

    if (cameraController) {
      cameraController.moveTo(
        new THREE.Vector3(4.0, 1.85, 5.5),
        new THREE.Vector3(3.8, 0.5, 0),
        1.1
      );
    }

    this.startAnimationLoop();
    this.renderLeftPanel();
  },

  /**
   * Quitte l'etape 3 et nettoie les ressources 3D et DOM.
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
   * Initialise le conteneur DOM pour les infobulles 3D projetees.
   */
  setupTooltipsLayer() {
    const hud = document.getElementById('hud');
    if (!hud) return;

    if (!this.tooltipLayer) {
      this.tooltipLayer = document.createElement('div');
      this.tooltipLayer.id = 'step3-tooltips-layer';
      this.tooltipLayer.className = 'scene-tooltips-layer';
      hud.appendChild(this.tooltipLayer);
    }
    this.tooltipLayer.innerHTML = '';
  },

  /**
   * Construit les 2 infobulles 3D comparatives avec traits de rappel SVG :
   * 1) Infobulle Hash #1 : couleur du hash, reliee a l'etiquette ET a l'anneau arriere du Wagon 1.
   * 2) Infobulle PreviousHash #2 : couleur attendue, pointant vers l'attache decrochee du Wagon 2.
   */
  createComparativeTooltips() {
    if (!this.tooltipLayer) return;

    const { trainConvoy } = this.ctx;
    const wagon1 = trainConvoy?.getWagon(1);
    const wagon2 = trainConvoy?.getWagon(2);
    const block1 = trainConvoy?.getBlock(1);
    const block2 = trainConvoy?.getBlock(2);

    if (!wagon1 || !wagon2 || !block1 || !block2) return;

    const colorHash1 = '#' + wagon1.colorHash.getHexString();
    const colorPrev2 = '#' + wagon2.colorPrevHash.getHexString();
    const hash1Short = block1.hash ? block1.hash.substring(0, 10) : 'a4f18c';
    const prev2Short = block2.previousHash ? block2.previousHash.substring(0, 10) : 'e55c70';

    this.tooltipLayer.innerHTML = `
      <svg id="step3-tooltips-svg" style="position: absolute; inset: 0; width: 100%; height: 100%; pointer-events: none; overflow: visible; z-index: 10;">
        <!-- Ligne 1A : Infobulle 1 -> Etiquette centrale (Wagon 1) -->
        <line id="svg-line-1a" stroke="${colorHash1}" stroke-width="2" stroke-linecap="round" opacity="0.95" />
        <circle id="svg-dot-label1-outer" r="8" fill="none" stroke="${colorHash1}" stroke-width="1.5" opacity="0.8" />
        <circle id="svg-dot-label1-inner" r="4" fill="${colorHash1}" />

        <!-- Ligne 1B : Infobulle 1 -> Anneau arriere (Wagon 1) -->
        <line id="svg-line-1b" stroke="${colorHash1}" stroke-width="2" stroke-linecap="round" opacity="0.95" />
        <circle id="svg-dot-socket1-outer" r="8" fill="none" stroke="${colorHash1}" stroke-width="1.5" opacity="0.8" />
        <circle id="svg-dot-socket1-inner" r="4" fill="${colorHash1}" />

        <!-- Ligne 2 : Infobulle 2 -> Crochet d'attelage decroche (Wagon 2) -->
        <line id="svg-line-2" stroke="${colorPrev2}" stroke-width="2" stroke-linecap="round" opacity="0.95" />
        <circle id="svg-dot-coupler2-outer" r="8" fill="none" stroke="${colorPrev2}" stroke-width="1.5" opacity="0.8" />
        <circle id="svg-dot-coupler2-inner" r="4" fill="${colorPrev2}" />
      </svg>

      <div id="tooltip-spot-w1" class="scene-tooltip" style="--spot-color: ${colorHash1}; z-index: 12;">
        <button type="button" class="scene-tooltip-pill">
          <span class="scene-tooltip-dot"></span>
          <span class="scene-tooltip-label">Hash #1 : <code>${hash1Short}...</code></span>
        </button>
        <div class="scene-tooltip-card">
          <div class="scene-tooltip-card-title">Nouveau Hash (Wagon #1)</div>
          <p class="scene-tooltip-card-text">La plaque centrale et l'anneau arrière ont changé de couleur à cause de la modification.</p>
        </div>
      </div>

      <div id="tooltip-spot-w2" class="scene-tooltip" style="--spot-color: ${colorPrev2}; z-index: 12;">
        <button type="button" class="scene-tooltip-pill">
          <span class="scene-tooltip-dot"></span>
          <span class="scene-tooltip-label">PreviousHash : <code>${prev2Short}...</code></span>
        </button>
        <div class="scene-tooltip-card">
          <div class="scene-tooltip-card-title">Attache suivante (Wagon #2)</div>
          <p class="scene-tooltip-card-text">Le Wagon #2 attend toujours l'ancienne couleur. Comme elles ne correspondent plus, l'attache ne tient pas.</p>
        </div>
      </div>
    `;

    const el1 = document.getElementById('tooltip-spot-w1');
    const el2 = document.getElementById('tooltip-spot-w2');

    el1?.addEventListener('pointerdown', (e) => e.stopPropagation());
    el1?.querySelector('.scene-tooltip-pill')?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.toggleTooltipSpot('spot-w1');
    });

    el2?.addEventListener('pointerdown', (e) => e.stopPropagation());
    el2?.querySelector('.scene-tooltip-pill')?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.toggleTooltipSpot('spot-w2');
    });
  },

  /**
   * Active ou desactive la carte d'une infobulle.
   * @param {string} spotId
   */
  toggleTooltipSpot(spotId) {
    this.activeSpotId = this.activeSpotId === spotId ? null : spotId;

    const el1 = document.getElementById('tooltip-spot-w1');
    const el2 = document.getElementById('tooltip-spot-w2');

    el1?.classList.toggle('active', this.activeSpotId === 'spot-w1');
    el2?.classList.toggle('active', this.activeSpotId === 'spot-w2');
  },

  /**
   * Boucle d'animation :
   * - Respecte strictement le code couleur cryptographique (anneau arriere = hash, anneau avant = previousHash)
   * - Balise jaune d'avertissement sur le wagon 1 (modifie), balise rouge d'alerte sur le wagon 2 (rompu)
   * - Calcule les coordonnees 3D reelles et met a jour les traits de rappel SVG reliant les infobulles aux cibles
   */
  startAnimationLoop() {
    this.stopAnimationLoop();

    const loop = () => {
      const { trainConvoy, camera } = this.ctx;
      const loco0 = trainConvoy?.getWagon(0);
      const wagon1 = trainConvoy?.getWagon(1);
      const wagon2 = trainConvoy?.getWagon(2);
      const time = performance.now() * 0.003;
      const isRestoring = performance.now() < this.restoreWaveUntil;

      if (loco0 && wagon1 && wagon2) {
        const pulse = isRestoring ? (2.6 + Math.sin(time * 10) * 0.5) : (1.4 + Math.sin(time * 3) * 0.2);

        // 1. Locomotive #0 (Bloc 0) : anneau arriere derive de son propre hash
        if (loco0.rearRingMaterial) {
          loco0.rearRingMaterial.color.copy(loco0.colorHash);
          loco0.rearRingMaterial.emissive.copy(loco0.colorHash);
          loco0.rearRingMaterial.emissiveIntensity = pulse;
        }

        // 2. Wagon #1 (Bloc 1) :
        // - Anneau avant = previousHash (correspond a la Locomotive #0)
        // - Anneau arriere = hash du wagon 1 (recalcule apres modification)
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
        if (wagon1.couplerGroup && wagon1.defaultCouplerPosition) {
          wagon1.couplerGroup.position.copy(wagon1.defaultCouplerPosition);
          wagon1.couplerGroup.rotation.z = 0;
        }

        // 3. Wagon #2 (Bloc 2) :
        // - Anneau avant = previousHash (attend toujours l'ancien hash du wagon 1)
        // - Anneau arriere = hash propre du wagon 2
        if (wagon2.frontRingMaterial) {
          wagon2.frontRingMaterial.color.copy(wagon2.colorPrevHash);
          wagon2.frontRingMaterial.emissive.copy(wagon2.colorPrevHash);
          wagon2.frontRingMaterial.emissiveIntensity = pulse;
        }
        if (wagon2.rearRingMaterial) {
          wagon2.rearRingMaterial.color.copy(wagon2.colorHash);
          wagon2.rearRingMaterial.emissive.copy(wagon2.colorHash);
          wagon2.rearRingMaterial.emissiveIntensity = pulse;
        }

        // Gestion du decrochage mecanique de l'attelage
        if (wagon2.couplerGroup && wagon2.defaultCouplerPosition) {
          if (this.isBroken) {
            wagon2.couplerGroup.position.y = wagon2.defaultCouplerPosition.y - 0.22;
            wagon2.couplerGroup.rotation.z = 0.20;
          } else {
            wagon2.couplerGroup.position.copy(wagon2.defaultCouplerPosition);
            wagon2.couplerGroup.rotation.z = 0;
          }
        }

        // 4. Balises lumineuses sur le toit
        if (!this.isBroken) {
          if (loco0.beaconMaterial) {
            loco0.beaconMaterial.color.setHex(0x10b981);
            loco0.beaconMaterial.emissive.setHex(0x10b981);
            loco0.beaconMaterial.emissiveIntensity = pulse;
          }
          if (wagon1.beaconMaterial) {
            wagon1.beaconMaterial.color.setHex(0x10b981);
            wagon1.beaconMaterial.emissive.setHex(0x10b981);
            wagon1.beaconMaterial.emissiveIntensity = pulse;
          }
          if (wagon2.beaconMaterial) {
            wagon2.beaconMaterial.color.setHex(0x10b981);
            wagon2.beaconMaterial.emissive.setHex(0x10b981);
            wagon2.beaconMaterial.emissiveIntensity = pulse;
          }
        } else {
          const alertPulse = 2.0 + Math.sin(time * 8) * 0.8;
          if (loco0.beaconMaterial) {
            loco0.beaconMaterial.color.setHex(0x10b981);
            loco0.beaconMaterial.emissive.setHex(0x10b981);
            loco0.beaconMaterial.emissiveIntensity = 1.4;
          }
          // Le voyant au-dessus du Wagon 1 (bloc altere) passe au JAUNE d'avertissement
          if (wagon1.beaconMaterial) {
            wagon1.beaconMaterial.color.setHex(0xfacc15);
            wagon1.beaconMaterial.emissive.setHex(0xeab308);
            wagon1.beaconMaterial.emissiveIntensity = alertPulse;
          }
          // La lumiere au-dessus du Wagon 2 (invalide par la rupture amont) passe au ROUGE d'alerte
          if (wagon2.beaconMaterial) {
            wagon2.beaconMaterial.color.setHex(0xef4444);
            wagon2.beaconMaterial.emissive.setHex(0xdc2626);
            wagon2.beaconMaterial.emissiveIntensity = alertPulse;
          }
        }
      }

      // Projection 3D -> 2D des infobulles et mise a jour des traits de rappel
      if (this.tooltipLayer && camera && this.isBroken && wagon1 && wagon2) {
        const width = window.innerWidth;
        const height = window.innerHeight;

        // Cible 1A : Centre de l'etiquette de hash du Wagon #1
        const pLabel1 = new THREE.Vector3();
        wagon1.localToWorld(pLabel1.set(0, 0.62, 0.605));

        // Cible 1B : Centre de l'anneau arriere du Wagon #1
        const pSocket1 = new THREE.Vector3();
        wagon1.localToWorld(pSocket1.set(1.48, 0.05, 0.0));

        // Cible 2 : Centre du crochet d'attelage decroche du Wagon #2
        const pCoupler2 = new THREE.Vector3();
        if (wagon2.couplerGroup) {
          wagon2.couplerGroup.getWorldPosition(pCoupler2);
          pCoupler2.x -= 0.25;
        } else {
          wagon2.localToWorld(pCoupler2.set(-2.15, -0.22, 0.0));
        }

        const projLabel1 = pLabel1.clone().project(camera);
        const projSocket1 = pSocket1.clone().project(camera);
        const projCoupler2 = pCoupler2.clone().project(camera);

        if (projLabel1.z > 1 || projSocket1.z > 1 || projCoupler2.z > 1) {
          this.tooltipLayer.style.opacity = '0';
          this.tooltipLayer.style.visibility = 'hidden';
        } else {
          const lx1 = (projLabel1.x * 0.5 + 0.5) * width;
          const ly1 = (-projLabel1.y * 0.5 + 0.5) * height;

          const sx1 = (projSocket1.x * 0.5 + 0.5) * width;
          const sy1 = (-projSocket1.y * 0.5 + 0.5) * height;

          const cx2 = (projCoupler2.x * 0.5 + 0.5) * width;
          const cy2 = (-projCoupler2.y * 0.5 + 0.5) * height;

          // Masquage si passe derriere le volet gauche
          const isCovered = width > 768 && Math.min(lx1, sx1, cx2) < 420;
          this.tooltipLayer.style.opacity = isCovered ? '0' : '1';
          this.tooltipLayer.style.visibility = isCovered ? 'hidden' : 'visible';

          // Calcul des positions des 2 pastilles flottantes
          const pill1_X = (lx1 + sx1) * 0.5;
          const pill1_Y = Math.min(ly1, sy1) - 68;

          const pill2_X = Math.max(cx2 + 25, pill1_X + 175);
          const pill2_Y = pill1_Y;

          // Positionnement des blocs d'infobulle
          const el1 = document.getElementById('tooltip-spot-w1');
          const el2 = document.getElementById('tooltip-spot-w2');
          if (el1) {
            el1.style.transform = `translate3d(${pill1_X.toFixed(1)}px, ${pill1_Y.toFixed(1)}px, 0) translate(-50%, -50%)`;
          }
          if (el2) {
            el2.style.transform = `translate3d(${pill2_X.toFixed(1)}px, ${pill2_Y.toFixed(1)}px, 0) translate(-50%, -50%)`;
          }

          // Mise a jour des traits SVG reliant exactement les infobulles aux objets 3D
          const line1a = document.getElementById('svg-line-1a');
          const line1b = document.getElementById('svg-line-1b');
          const dotL1In = document.getElementById('svg-dot-label1-inner');
          const dotL1Out = document.getElementById('svg-dot-label1-outer');
          const dotS1In = document.getElementById('svg-dot-socket1-inner');
          const dotS1Out = document.getElementById('svg-dot-socket1-outer');

          const line2 = document.getElementById('svg-line-2');
          const dotC2In = document.getElementById('svg-dot-coupler2-inner');
          const dotC2Out = document.getElementById('svg-dot-coupler2-outer');

          // Ligne 1A : Infobulle 1 -> Etiquette de hash
          if (line1a) {
            line1a.setAttribute('x1', (pill1_X - 25).toFixed(1));
            line1a.setAttribute('y1', (pill1_Y + 14).toFixed(1));
            line1a.setAttribute('x2', lx1.toFixed(1));
            line1a.setAttribute('y2', ly1.toFixed(1));
          }
          if (dotL1In && dotL1Out) {
            dotL1In.setAttribute('cx', lx1.toFixed(1));
            dotL1In.setAttribute('cy', ly1.toFixed(1));
            dotL1Out.setAttribute('cx', lx1.toFixed(1));
            dotL1Out.setAttribute('cy', ly1.toFixed(1));
          }

          // Ligne 1B : Infobulle 1 -> Anneau arriere de sortie
          if (line1b) {
            line1b.setAttribute('x1', (pill1_X + 25).toFixed(1));
            line1b.setAttribute('y1', (pill1_Y + 14).toFixed(1));
            line1b.setAttribute('x2', sx1.toFixed(1));
            line1b.setAttribute('y2', sy1.toFixed(1));
          }
          if (dotS1In && dotS1Out) {
            dotS1In.setAttribute('cx', sx1.toFixed(1));
            dotS1In.setAttribute('cy', sy1.toFixed(1));
            dotS1Out.setAttribute('cx', sx1.toFixed(1));
            dotS1Out.setAttribute('cy', sy1.toFixed(1));
          }

          // Ligne 2 : Infobulle 2 -> Crochet d'attelage decroche
          if (line2) {
            line2.setAttribute('x1', pill2_X.toFixed(1));
            line2.setAttribute('y1', (pill2_Y + 14).toFixed(1));
            line2.setAttribute('x2', cx2.toFixed(1));
            line2.setAttribute('y2', cy2.toFixed(1));
          }
          if (dotC2In && dotC2Out) {
            dotC2In.setAttribute('cx', cx2.toFixed(1));
            dotC2In.setAttribute('cy', cy2.toFixed(1));
            dotC2Out.setAttribute('cx', cx2.toFixed(1));
            dotC2Out.setAttribute('cy', cy2.toFixed(1));
          }
        }
      }

      this.rafId = requestAnimationFrame(loop);
    };

    this.rafId = requestAnimationFrame(loop);
  },

  /**
   * Arrete la boucle d'animation.
   */
  stopAnimationLoop() {
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  },

  /**
   * Falsifie le chargement du Wagon #1 :
   * - Modifie le contenu de la transaction
   * - Recalcule le hash cryptographique SHA-256 du wagon (qui change de valeur et donc de couleur)
   * - Conserve le previousHash du wagon 1 pointant vers la locomotive (attelage amont intact)
   * - Deconnecte l'attelage du wagon 2 (car le wagon 2 garde l'ancien hash)
   */
  corruptWagon1() {
    const { trainConvoy, cameraController } = this.ctx;
    if (!trainConvoy) return;

    this.isBroken = true;

    // 1. Alteration des transactions du Wagon #1
    const block1 = trainConvoy.getBlock(1);
    const wagon1 = trainConvoy.getWagon(1);
    if (block1 && wagon1) {
      block1.data = {
        lot: 'Fret #104',
        cargaison: "999 tonnes d'or (FALSIFIE)",
        quai: 'Quai A -> Quai Pirate'
      };
      // Modifier une donnee modifie obligatoirement son hash SHA-256
      block1.hash = block1.calculateHash();
      wagon1.colorHash.set(hashToColorHex(block1.hash));
      wagon1.renderPlates();
    }

    // 2. Synchronisation du convoi (le Wagon #2 constate la rupture de concordance)
    trainConvoy.sync();

    // Le Wagon #1 prend son voyant jaune d'avertissement
    if (wagon1?.beaconMaterial) {
      wagon1.beaconMaterial.color.setHex(0xfacc15);
      wagon1.beaconMaterial.emissive.setHex(0xeab308);
      wagon1.beaconMaterial.emissiveIntensity = 2.0;
    }

    // 3. Affichage des 2 infobulles 3D comparatives avec traits de rappel
    this.createComparativeTooltips();

    if (cameraController) {
      cameraController.moveTo(
        new THREE.Vector3(4.5, 2.0, 6.2),
        new THREE.Vector3(3.9, 0.5, 0),
        1.0
      );
    }

    this.renderLeftPanel('.hash-contrast-box');
  },

  /**
   * Retablit le convoi a son etat authentique d'origine.
   */
  restoreConvoy() {
    const { trainConvoy, cameraController } = this.ctx;
    if (!trainConvoy) return;

    const wasBroken = this.isBroken || !trainConvoy.blockchain.isChainValid();

    trainConvoy.restoreEntireTrain();
    trainConvoy.sync();
    trainConvoy.getWagonMeshes().forEach((w) => {
      w.renderPlates();
      w.updateStatus(true);
    });

    this.isBroken = false;
    this.restoreWaveUntil = performance.now() + 2500;

    // Nettoie les infobulles
    if (this.tooltipLayer) {
      this.tooltipLayer.innerHTML = '';
    }

    if (cameraController) {
      cameraController.moveTo(
        new THREE.Vector3(4.0, 1.85, 5.5),
        new THREE.Vector3(3.8, 0.5, 0),
        1.0
      );
    }

    this.renderLeftPanel('#step3-restore-status');

    const statusEl = document.getElementById('step3-restore-status');
    if (statusEl) {
      statusEl.className = 'action-feedback-status visible ' + (wasBroken ? 'status-success' : 'status-info');
      statusEl.textContent = wasBroken
        ? "Train réparé : les données sont redevenues exactes et les wagons sont raccrochés."
        : "Le train est déjà en bon état et bien accroché.";
    }
  },

  /**
   * Genere le volet pedagogique gauche pour l'etape 3.
   * Interface sobre et epuree, sans infobulles ou cartes redondantes.
   */
  renderLeftPanel(scrollTargetSelector = null) {
    const panel = document.getElementById('step-panel-left');
    if (!panel) return;

    panel.classList.add('active');

    const { trainConvoy } = this.ctx;
    const wagon1 = trainConvoy?.getWagon(1);
    const wagon2 = trainConvoy?.getWagon(2);
    const block1 = trainConvoy?.getBlock(1);
    const block2 = trainConvoy?.getBlock(2);

    const colorHash1 = wagon1 ? '#' + wagon1.colorHash.getHexString() : '#38bdf8';
    const colorPrev2 = wagon2 ? '#' + wagon2.colorPrevHash.getHexString() : '#facc15';
    const hash1Short = block1?.hash ? block1.hash.substring(0, 10) : 'a4f18c';
    const prev2Short = block2?.previousHash ? block2.previousHash.substring(0, 10) : 'e55c70';

    const inner = document.createElement('div');
    inner.className = 'step-panel-inner';

    inner.innerHTML = `
      <header class="step-panel-header">
        <h2 class="step-panel-title">Immuabilité et Falsification</h2>
      </header>

      <div class="step-panel-scroll">
        ${!this.isBroken ? `
          <article class="step-card context-card animate-fade">
            <h3 class="card-title">Que signifie tricher et pourquoi cela casse la chaîne ?</h3>
            <p>
              Dans un registre financier ou logistique, tricher consiste à modifier discrètement une information déjà enregistrée dans un ancien wagon (par exemple changer le montant d'un virement ou effacer une livraison) pour s'enrichir à l'insu des autres.
            </p>
            <p>
              Chaque wagon transporte des échanges protégés par un code unique (son Hash). Voyons ce qui se passe si quelqu'un modifie les données du <strong>Wagon #1</strong> :
            </p>
          </article>

          <div class="substep-action-box animate-fade">
            <button id="btn-corrupt-wagon1" class="btn-panel-danger">
              <span>Tricher : modifier le Wagon #1</span>
              <span class="btn-arrow">&rarr;</span>
            </button>
          </div>
        ` : `
          <article class="step-card context-card animate-fade">
            <h3 class="card-title">Pourquoi l'attache a cassé ?</h3>
            <p>
              En modifiant le Wagon #1, son code Hash a changé :
            </p>

            <div class="hash-contrast-box">
              <div class="contrast-row">
                <span class="contrast-swatch" style="background: ${colorHash1}; box-shadow: 0 0 8px ${colorHash1};"></span>
                <span class="contrast-label">Hash Wagon #1 :</span>
                <code class="contrast-code" style="color: ${colorHash1};">${hash1Short}...</code>
              </div>
              <div class="contrast-row">
                <span class="contrast-swatch" style="background: ${colorPrev2}; box-shadow: 0 0 8px ${colorPrev2};"></span>
                <span class="contrast-label">Attendu Wagon #2 :</span>
                <code class="contrast-code" style="color: ${colorPrev2};">${prev2Short}...</code>
              </div>
              <div class="contrast-status">
                Couleurs différentes &rarr; L'attache se décroche
              </div>
            </div>

            <p class="contrast-summary">
              Le Wagon #2 attend toujours l'ancienne couleur. Comme elle ne correspond plus au Wagon #1, le lien casse.
            </p>
          </article>

          <div class="substep-action-box animate-fade">
            <button id="btn-restore-step3" class="btn-panel-success">
              <span>Annuler la triche et réparer le train</span>
            </button>
            <div id="step3-restore-status" class="action-feedback-status"></div>
          </div>

          <article class="step-card keypoint-card animate-fade">
            <h4 class="card-title keypoint-title">Point clé : La moindre triche saute aux yeux</h4>
            <p class="keypoint-text">
              Si on change un seul chiffre dans un wagon, son code change complètement. Le wagon suivant garde l'ancien code en mémoire et refuse de rester accroché. Tout le réseau voit tout de suite qu'il y a une fraude.
            </p>
          </article>
        `}

        <nav class="step-nav-bar animate-fade">
          <button id="btn-step3-action-prev" class="btn-panel-ghost">
            <span class="btn-arrow">&larr;</span>
            <span>Étape 2 : Chaînage</span>
          </button>
          <button id="btn-step3-action-next" class="btn-panel-primary">
            <span>Étape 4 : Réseau</span>
            <span class="btn-arrow">&rarr;</span>
          </button>
        </nav>
      </div>
    `;

    updateLeftPanelPreserveScroll(panel, inner, scrollTargetSelector);
    this.setupEvents();
  },

  /**
   * Attache les ecouteurs d'interaction sur le volet gauche.
   */
  setupEvents() {
    document.getElementById('btn-corrupt-wagon1')?.addEventListener('click', () => {
      this.corruptWagon1();
    });

    document.getElementById('btn-restore-step3')?.addEventListener('click', () => {
      this.restoreConvoy();
    });

    document.getElementById('btn-step3-action-prev')?.addEventListener('click', () => {
      if (typeof this.ctx.onPrevStep === 'function') {
        this.ctx.onPrevStep();
      }
    });

    document.getElementById('btn-step3-action-next')?.addEventListener('click', () => {
      if (this.isBroken) {
        this.restoreConvoy();
      }
      if (typeof this.ctx.onNextStep === 'function') {
        this.ctx.onNextStep();
      }
    });
  }
};
