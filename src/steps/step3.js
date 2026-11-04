import * as THREE from 'three';
import { hashToColorHex } from '../three/WagonMesh.js';

/**
 * Etape 3 : Immuabilite et detection de falsification.
 * Experience interactive d'alteration du chargement du Wagon #1 :
 * - Avant falsification : presentation sobre sans divulgacher les consequences visuelles.
 * - Apres falsification : 2 infobulles 3D colorees directement selon les hashs :
 *   1) Infobulle couleur du hash du bloc 1, reliee a l'etiquette et l'attache arriere.
 *   2) Infobulle couleur de l'attache du bloc suivant (previousHash attendu).
 *   La difference de couleur entre les deux met en valeur la rupture de maniere evidente.
 */
export const step3 = {
  id: 3,
  title: 'Immuabilite et falsification',
  ctx: null,

  rafId: null,
  isBroken: false,
  restoreWaveUntil: 0,

  // Infobulles 3D projetees sur le convoi
  tooltipLayer: null,
  tooltipElements: new Map(),
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
        { emetteur: 'Arthur', destinataire: 'Alban', montant: 15, unite: 'MMI-Coin' },
        { emetteur: 'Alban', destinataire: 'Equipe-R507', montant: 30, unite: 'MMI-Coin' }
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
    this.tooltipElements.clear();

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
    this.tooltipElements.clear();
  },

  /**
   * Genere les 2 infobulles 3D comparatives une fois la fraude declenchee :
   * 1) Infobulle du Hash du bloc 1 (de la couleur exacte du hash du wagon 1).
   * 2) Infobulle de l'attache du train suivant (de la couleur attendue par le wagon 2).
   */
  createComparativeTooltips() {
    if (!this.tooltipLayer) return;

    const { trainConvoy } = this.ctx;
    const wagon1 = trainConvoy?.getWagon(1);
    const wagon2 = trainConvoy?.getWagon(2);
    const block1 = trainConvoy?.getBlock(1);
    const block2 = trainConvoy?.getBlock(2);

    if (!wagon1 || !wagon2 || !block1 || !block2) return;

    this.tooltipLayer.innerHTML = '';
    this.tooltipElements.clear();

    const colorHash1 = '#' + wagon1.colorHash.getHexString();
    const colorPrev2 = '#' + wagon2.colorPrevHash.getHexString();
    const hash1Short = block1.hash ? block1.hash.substring(0, 10) : 'a4f18c';
    const prev2Short = block2.previousHash ? block2.previousHash.substring(0, 10) : 'e55c70';

    const spots = [
      {
        id: 'spot-w1',
        color: colorHash1,
        label: `Hash #1 : ${hash1Short}...`,
        title: 'Hash calculé (Wagon #1)',
        text: 'Empreinte SHA-256 issue des données modifiées. L\'étiquette centrale et l\'attache arrière portent cette couleur.',
        getPos: () => new THREE.Vector3(4.8, 1.28, 0.25)
      },
      {
        id: 'spot-w2',
        color: colorPrev2,
        label: `PreviousHash : ${prev2Short}...`,
        title: 'Attache aval (Wagon #2)',
        text: 'L\'attache et l\'étiquette du Wagon #2 attendent cette couleur d\'origine. Ne correspondant plus, l\'attelage se décroche.',
        getPos: () => new THREE.Vector3(6.1, 1.18, 0.25)
      }
    ];

    spots.forEach((spot) => {
      const el = document.createElement('div');
      const isActive = this.activeSpotId === spot.id;
      el.className = 'scene-tooltip' + (isActive ? ' active' : '');
      el.dataset.spotId = spot.id;
      el.style.setProperty('--spot-color', spot.color);

      el.innerHTML = `
        <button type="button" class="scene-tooltip-pill" aria-expanded="${isActive}">
          <span class="scene-tooltip-dot"></span>
          <span class="scene-tooltip-label">${spot.label}</span>
        </button>
        <div class="scene-tooltip-card">
          <div class="scene-tooltip-card-title">${spot.title}</div>
          <p class="scene-tooltip-card-text">${spot.text}</p>
        </div>
        <div class="scene-tooltip-stem"></div>
      `;

      const pillBtn = el.querySelector('.scene-tooltip-pill');
      pillBtn?.addEventListener('click', (e) => {
        e.stopPropagation();
        this.toggleTooltipSpot(spot.id);
      });

      this.tooltipLayer.appendChild(el);
      this.tooltipElements.set(spot.id, { el, spot });
    });
  },

  /**
   * Active ou desactive une infobulle precise.
   * @param {string} spotId
   */
  toggleTooltipSpot(spotId) {
    this.activeSpotId = this.activeSpotId === spotId ? null : spotId;

    this.tooltipElements.forEach(({ el }, id) => {
      const isActive = id === this.activeSpotId;
      el.classList.toggle('active', isActive);
      const btn = el.querySelector('.scene-tooltip-pill');
      if (btn) btn.setAttribute('aria-expanded', String(isActive));
    });
  },

  /**
   * Boucle d'animation :
   * - Respecte strictement le code couleur cryptographique (anneau arriere = hash, anneau avant = previousHash)
   * - Balise jaune d'avertissement sur le wagon 1 (modifie), balise rouge d'alerte sur le wagon 2 (rompu)
   * - Projette les coordonnees 3D des infobulles sur l'ecran 2D
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

      // Projection 3D -> 2D des infobulles sur l'ecran
      if (this.tooltipLayer && camera && this.tooltipElements.size > 0) {
        const width = window.innerWidth;
        const height = window.innerHeight;

        this.tooltipElements.forEach(({ el, spot }) => {
          const worldPos = spot.getPos();
          const projected = worldPos.clone().project(camera);

          if (projected.z > 1) {
            el.style.opacity = '0';
            el.style.pointerEvents = 'none';
            return;
          }

          const x = (projected.x * 0.5 + 0.5) * width;
          const y = (-projected.y * 0.5 + 0.5) * height;

          const isCoveredByLeftPanel = width > 768 && x < 440;
          el.style.opacity = isCoveredByLeftPanel ? '0' : '1';
          el.style.pointerEvents = isCoveredByLeftPanel ? 'none' : 'auto';
          el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`;
        });
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
        emetteur: 'Arthur',
        destinataire: 'Attaquant',
        montant: 9999,
        unite: 'MMI-Coin'
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

    // 3. Affichage des 2 infobulles 3D comparatives
    this.createComparativeTooltips();

    if (cameraController) {
      cameraController.moveTo(
        new THREE.Vector3(4.5, 2.0, 6.2),
        new THREE.Vector3(3.9, 0.5, 0),
        1.0
      );
    }

    this.renderLeftPanel();
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
      this.tooltipElements.clear();
    }

    if (cameraController) {
      cameraController.moveTo(
        new THREE.Vector3(4.0, 1.85, 5.5),
        new THREE.Vector3(3.8, 0.5, 0),
        1.0
      );
    }

    this.renderLeftPanel();

    const statusEl = document.getElementById('step3-restore-status');
    if (statusEl) {
      statusEl.className = 'action-feedback-status visible ' + (wasBroken ? 'status-success' : 'status-info');
      statusEl.textContent = wasBroken
        ? "Intégrité rétablie : les données sont conformes et les attelages sont reverrouillés."
        : "Chaîne déjà intègre : les données et attelages sont conformes.";
    }
  },

  /**
   * Genere le volet pedagogique gauche pour l'etape 3.
   * Interface sobre et epuree, sans infobulles ou cartes redondantes.
   */
  renderLeftPanel() {
    const panel = document.getElementById('step-panel-left');
    if (!panel) return;

    panel.classList.add('active');

    const oldInner = panel.querySelector('.step-panel-inner');
    if (oldInner) oldInner.remove();

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
            <h3 class="card-title">L'intégrité d'un bloc scellé</h3>
            <p>
              Dans le convoi, chaque wagon transporte des transactions scellées par son empreinte cryptographique (Hash).
            </p>
            <p>
              Que se passe-t-il si un fraudeur tente d'altérer les données enregistrées à l'intérieur du <strong>Wagon #1</strong> ?
            </p>
          </article>

          <div class="substep-action-box animate-fade">
            <button id="btn-corrupt-wagon1" class="btn-panel-danger">
              <span>Falsifier les transactions du Wagon #1</span>
              <span class="btn-arrow">&rarr;</span>
            </button>
          </div>
        ` : `
          <article class="step-card context-card animate-fade">
            <h3 class="card-title">Comparaison des empreintes</h3>
            <p>
              La falsification du Wagon #1 a recalculé son Hash :
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
                Discordance de couleur &rarr; Décrochage mécanique
              </div>
            </div>

            <p class="contrast-summary">
              L'attache du Wagon #2 exige l'ancienne couleur. Ne correspondant pas à l'anneau arrière du Wagon #1, la liaison se rompt.
            </p>
          </article>

          <div class="substep-action-box animate-fade">
            <button id="btn-restore-step3" class="btn-panel-success">
              <span>Restaurer l'intégrité du convoi</span>
            </button>
            <div id="step3-restore-status" class="action-feedback-status"></div>
          </div>

          <article class="step-card keypoint-card animate-fade">
            <h4 class="card-title keypoint-title">Point clé : L'effet avalanche</h4>
            <p class="keypoint-text">
              La moindre altération des données recalcule une nouvelle empreinte. Le wagon suivant, conservant l'ancien hash dans son registre, rejette immédiatement la connexion. La fraude est visible immédiatement par l'ensemble du réseau.
            </p>
          </article>
        `}

        <nav class="step-nav-bar animate-fade">
          <button id="btn-step3-action-prev" class="btn-panel-ghost">
            <span class="btn-arrow">&larr;</span>
            <span>Étape 2</span>
          </button>
          <button id="btn-step3-action-next" class="btn-panel-primary">
            <span>Étape 4 : Réseau distribué</span>
            <span class="btn-arrow">&rarr;</span>
          </button>
        </nav>
      </div>
    `;

    panel.prepend(inner);
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
