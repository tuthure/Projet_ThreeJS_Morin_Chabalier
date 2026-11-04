import * as THREE from 'three';

/**
 * Étape 4 : Réseau et décentralisation.
 * Métaphore : Les nœuds du réseau sont des Gares réparties sur le territoire,
 * reliées en maillage pair-à-pair (P2P) sans gare centrale.
 * Interaction : Émettre une transaction propage un signal lumineux à toutes les gares
 * qui synchronisent leur copie locale du registre.
 */
export const step4 = {
  id: 4,
  title: 'Réseau et décentralisation',
  ctx: null,

  rafId: null,
  networkGroup: null,
  stations: [],
  links: [],
  packets: [],

  isPropagating: false,
  syncedCount: 6,
  txCount: 3,
  lastTxLabel: 'Arthur -> Alban (15 MMI)',

  stationCoords: [
    { name: 'Gare Nord-Ouest', pos: new THREE.Vector3(-4.5, -0.45, -6.8) },
    { name: 'Gare Nord-Centre', pos: new THREE.Vector3(3.8, -0.45, -8.2) },
    { name: 'Gare Nord-Est', pos: new THREE.Vector3(12.0, -0.45, -6.4) },
    { name: 'Gare Sud-Ouest', pos: new THREE.Vector3(-3.0, -0.45, 5.2) },
    { name: 'Gare Sud-Centre', pos: new THREE.Vector3(4.2, -0.45, 6.0) },
    { name: 'Gare Sud-Est', pos: new THREE.Vector3(11.2, -0.45, 4.8) }
  ],

  // Paires d'indices formant le maillage décentralisé entre les 6 gares
  meshEdges: [
    [0, 1], [1, 2], [3, 4], [4, 5],
    [0, 3], [1, 4], [2, 5],
    [0, 4], [1, 5], [1, 3], [2, 4]
  ],

  init(context) {
    this.ctx = context;
  },

  enter() {
    const { trainConvoy, cameraController, environment } = this.ctx;

    this.isPropagating = false;
    this.syncedCount = 6;
    this.txCount = 3;
    this.lastTxLabel = 'Arthur -> Alban (15 MMI)';

    if (cameraController) {
      cameraController.setViewOffset(210);
    }

    if (environment) {
      environment.setSpeed(2.0);
    }

    if (trainConvoy) {
      trainConvoy.resetConvoy([
        { emetteur: 'Arthur', destinataire: 'Alban', montant: 15, unite: 'MMI-Coin' },
        { emetteur: 'Alban', destinataire: 'Equipe-R507', montant: 30, unite: 'MMI-Coin' },
        { emetteur: 'Quai-Nord', destinataire: 'Gare-Est', montant: 8, unite: 'MMI-Coin' }
      ]);
      if (cameraController) {
        cameraController.setInteractiveObjects(trainConvoy.getInteractiveObjects());
      }
    }

    this.buildNetworkMesh();

    // Dézoom de la caméra pour embrasser le convoi au milieu du maillage de gares
    if (cameraController) {
      cameraController.moveTo(
        new THREE.Vector3(3.8, 10.5, 17.5),
        new THREE.Vector3(3.8, 0.2, -0.8),
        1.3
      );
    }

    this.startAnimationLoop();
    this.renderLeftPanel();
  },

  exit() {
    this.stopAnimationLoop();

    if (this.networkGroup && this.ctx?.scene) {
      this.ctx.scene.remove(this.networkGroup);
      this.networkGroup = null;
    }
    this.stations = [];
    this.links = [];
    this.packets = [];

    const panel = document.getElementById('step-panel-left');
    if (panel) {
      const inner = panel.querySelector('.step-panel-inner');
      if (inner) inner.remove();
    }
  },

  /**
   * Construit les 6 Gares (Nœuds) et le maillage de connexions P2P en 3D.
   */
  buildNetworkMesh() {
    const { scene } = this.ctx;
    if (!scene) return;

    if (this.networkGroup) {
      scene.remove(this.networkGroup);
    }

    this.networkGroup = new THREE.Group();
    this.stations = [];
    this.links = [];
    this.packets = [];

    const baseGeo = new THREE.BoxGeometry(2.0, 0.2, 1.3);
    const bodyGeo = new THREE.BoxGeometry(1.5, 0.85, 0.95);
    const roofGeo = new THREE.ConeGeometry(1.15, 0.55, 4);
    const mastGeo = new THREE.CylinderGeometry(0.035, 0.035, 0.9, 8);
    const beaconGeo = new THREE.SphereGeometry(0.18, 14, 14);
    const ringGeo = new THREE.RingGeometry(1.15, 1.35, 28);
    const ledgerGeo = new THREE.BoxGeometry(0.45, 0.58, 0.08);

    const baseMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.8 });
    const bodyMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.6, metalness: 0.2 });
    const roofMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.5, flatShading: true });
    const mastMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.8, roughness: 0.2 });

    this.stationCoords.forEach((info, idx) => {
      const stationGroup = new THREE.Group();
      stationGroup.position.copy(info.pos);

      const base = new THREE.Mesh(baseGeo, baseMat);
      base.position.y = 0.1;
      stationGroup.add(base);

      const body = new THREE.Mesh(bodyGeo, bodyMat);
      body.position.y = 0.62;
      stationGroup.add(body);

      // Fenêtres éclairées sur la façade
      const winGeo = new THREE.PlaneGeometry(1.1, 0.28);
      const winMat = new THREE.MeshBasicMaterial({ color: 0xfef08a, side: THREE.DoubleSide });
      const winFront = new THREE.Mesh(winGeo, winMat);
      winFront.position.set(0, 0.65, 0.485);
      stationGroup.add(winFront);
      const winBack = new THREE.Mesh(winGeo, winMat);
      winBack.position.set(0, 0.65, -0.485);
      stationGroup.add(winBack);

      const roof = new THREE.Mesh(roofGeo, roofMat);
      roof.position.y = 1.32;
      roof.rotation.y = Math.PI / 4;
      stationGroup.add(roof);

      const mast = new THREE.Mesh(mastGeo, mastMat);
      mast.position.y = 1.85;
      stationGroup.add(mast);

      const beaconMat = new THREE.MeshStandardMaterial({
        color: 0x38bdf8,
        emissive: 0x0284c7,
        emissiveIntensity: 1.8,
        roughness: 0.2
      });
      const beacon = new THREE.Mesh(beaconGeo, beaconMat);
      beacon.position.y = 2.35;
      stationGroup.add(beacon);

      // Anneau halo de synchronisation au sol
      const ringMat = new THREE.MeshBasicMaterial({
        color: 0x38bdf8,
        transparent: true,
        opacity: 0.45,
        side: THREE.DoubleSide
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.rotation.x = -Math.PI / 2;
      ring.position.y = 0.04;
      stationGroup.add(ring);

      // Petit registre flottant (copie locale de la blockchain)
      const ledgerMat = new THREE.MeshStandardMaterial({
        color: 0x10b981,
        emissive: 0x059669,
        emissiveIntensity: 1.2,
        transparent: true,
        opacity: 0.85
      });
      const ledger = new THREE.Mesh(ledgerGeo, ledgerMat);
      ledger.position.set(0.95, 1.4, 0);
      stationGroup.add(ledger);

      this.networkGroup.add(stationGroup);
      this.stations.push({
        index: idx,
        name: info.name,
        group: stationGroup,
        beaconMat,
        ringMat,
        ledgerMat,
        ledger,
        pos: info.pos.clone().add(new THREE.Vector3(0, 2.35, 0)),
        synced: true,
        pulseTime: 0
      });
    });

    // Lignes du maillage P2P reliant les gares entre elles
    this.meshEdges.forEach(([a, b]) => {
      const pA = this.stations[a].pos;
      const pB = this.stations[b].pos;

      const points = [pA, pB];
      const lineGeo = new THREE.BufferGeometry().setFromPoints(points);
      const lineMat = new THREE.LineBasicMaterial({
        color: 0x38bdf8,
        transparent: true,
        opacity: 0.35
      });
      const line = new THREE.Line(lineGeo, lineMat);
      this.networkGroup.add(line);
      this.links.push({ a, b, pA, pB, lineMat });
    });

    scene.add(this.networkGroup);
  },

  /**
   * Lance la propagation d'une nouvelle transaction à travers toutes les gares du maillage.
   */
  broadcastTransaction(txLabel) {
    if (this.isPropagating) return;

    this.isPropagating = true;
    this.syncedCount = 1;
    this.txCount += 1;
    this.lastTxLabel = txLabel || `Gare #1 -> Réseau (${Math.floor(Math.random() * 25) + 5} MMI)`;

    // Réinitialise l'état des gares (Gare 0 est l'émettrice initiale)
    this.stations.forEach((st, idx) => {
      if (idx === 0) {
        st.synced = true;
        st.pulseTime = performance.now();
        st.beaconMat.color.setHex(0xfacc15);
        st.beaconMat.emissive.setHex(0xeab308);
        st.ringMat.color.setHex(0xfacc15);
      } else {
        st.synced = false;
        st.beaconMat.color.setHex(0x64748b);
        st.beaconMat.emissive.setHex(0x334155);
        st.ringMat.color.setHex(0x64748b);
      }
    });

    // Crée les paquets lumineux sur les liens du maillage avec un léger décalage par saut (hop)
    const packetGeo = new THREE.SphereGeometry(0.16, 12, 12);
    const packetMat = new THREE.MeshBasicMaterial({ color: 0xfef08a });

    const scheduleWave = (fromIdx, delayMs) => {
      this.meshEdges.forEach(([a, b]) => {
        let targetIdx = -1;
        if (a === fromIdx) targetIdx = b;
        else if (b === fromIdx) targetIdx = a;

        if (targetIdx !== -1) {
          const mesh = new THREE.Mesh(packetGeo, packetMat);
          mesh.visible = false;
          this.networkGroup.add(mesh);

          this.packets.push({
            mesh,
            startPos: this.stations[fromIdx].pos.clone(),
            endPos: this.stations[targetIdx].pos.clone(),
            targetIdx,
            startTime: performance.now() + delayMs,
            duration: 650,
            completed: false
          });
        }
      });
    };

    // Vague 1 : depuis la Gare 0 vers ses voisines (1, 3, 4)
    scheduleWave(0, 0);
    // Vague 2 : relais depuis les gares 1 et 4 vers les gares 2 et 5
    scheduleWave(1, 550);
    scheduleWave(4, 550);

    this.renderLeftPanel();
  },

  startAnimationLoop() {
    this.stopAnimationLoop();

    const loop = () => {
      const now = performance.now();
      const time = now * 0.003;

      // Animation flottante des registres de chaque gare
      this.stations.forEach((st, idx) => {
        if (st.ledger) {
          st.ledger.position.y = 1.38 + Math.sin(time * 2 + idx) * 0.08;
          st.ledger.rotation.y = Math.sin(time + idx) * 0.35;
        }
        if (st.synced && !this.isPropagating) {
          const pulse = 1.4 + Math.sin(time * 3 + idx) * 0.35;
          st.beaconMat.emissiveIntensity = pulse;
        }
      });

      // Mise à jour des paquets de transaction en transit
      if (this.packets.length > 0) {
        let allDone = true;

        for (let i = 0; i < this.packets.length; i++) {
          const pkt = this.packets[i];
          if (pkt.completed) continue;

          if (now < pkt.startTime) {
            allDone = false;
            continue;
          }

          const progress = Math.min((now - pkt.startTime) / pkt.duration, 1.0);
          pkt.mesh.visible = true;
          pkt.mesh.position.lerpVectors(pkt.startPos, pkt.endPos, progress);
          // Légère arche parabolique
          pkt.mesh.position.y += Math.sin(progress * Math.PI) * 0.6;

          if (progress >= 1.0) {
            pkt.completed = true;
            pkt.mesh.visible = false;
            this.networkGroup?.remove(pkt.mesh);

            const targetStation = this.stations[pkt.targetIdx];
            if (targetStation && !targetStation.synced) {
              targetStation.synced = true;
              targetStation.beaconMat.color.setHex(0x10b981);
              targetStation.beaconMat.emissive.setHex(0x059669);
              targetStation.beaconMat.emissiveIntensity = 2.5;
              targetStation.ringMat.color.setHex(0x10b981);
              this.syncedCount = this.stations.filter((s) => s.synced).length;
              this.updateFeedbackDOM();
            }
          } else {
            allDone = false;
          }
        }

        if (allDone) {
          this.isPropagating = false;
          this.packets = [];
          this.stations.forEach((st) => {
            st.beaconMat.color.setHex(0x10b981);
            st.beaconMat.emissive.setHex(0x059669);
            st.ringMat.color.setHex(0x10b981);
          });
          this.syncedCount = this.stations.length;
          this.renderLeftPanel();
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

  updateFeedbackDOM() {
    const syncEl = document.getElementById('step4-sync-val');
    if (syncEl) {
      syncEl.textContent = `${this.syncedCount} / ${this.stations.length} Gares à jour`;
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

    inner.innerHTML = `
      <header class="step-panel-header">
        <h2 class="step-panel-title">Réseau et Décentralisation</h2>
      </header>

      <div class="step-panel-scroll">
        <article class="step-card context-card animate-fade">
          <h3 class="card-title">Un maillage de gares sans centre unique</h3>
          <p>
            Dans un réseau classique, un serveur central unique dirige le trafic. Dans une blockchain, le réseau est <strong>décentralisé</strong> : il est composé d'une multitude de <strong>nœuds</strong> (ici représentés par les 6 gares réparties autour de la voie).
          </p>
          <p>
            Chaque gare conserve une <strong>copie intégrale du registre</strong>. Lorsqu'une transaction est émise, elle se propage de proche en proche à toutes les gares pour vérification.
          </p>
        </article>

        <article class="step-card action-card animate-fade">
          <h3 class="card-title">Propager une transaction sur le réseau</h3>
          <p class="card-instruction">
            Diffusez un nouvel échange depuis une gare et observez la synchronisation des copies distribuées :
          </p>

          <div class="action-choices">
            <button id="btn-step4-tx1" class="btn-choice" ${this.isPropagating ? 'disabled' : ''}>
              <span>Émettre une transaction (Emma &rarr; Lucas : 20 MMI)</span>
              <span class="btn-choice-icon">Diffuser P2P</span>
            </button>
            <button id="btn-step4-tx2" class="btn-choice" ${this.isPropagating ? 'disabled' : ''}>
              <span>Émettre une transaction (Gare-Sud &rarr; Quai-Est : 45 MMI)</span>
              <span class="btn-choice-icon">Diffuser P2P</span>
            </button>
          </div>

          <div class="action-feedback-box ${this.syncedCount === 6 && !this.isPropagating ? 'success' : ''}">
            <div class="feedback-row">
              <span class="feedback-label">Topologie réseau :</span>
              <span class="feedback-val">Pair-à-pair (P2P) sans centre</span>
            </div>
            <div class="feedback-row">
              <span class="feedback-label">Dernier message :</span>
              <span class="feedback-val">${this.lastTxLabel}</span>
            </div>
            <div class="feedback-row">
              <span class="feedback-label">Copies distribuées :</span>
              <span id="step4-sync-val" class="feedback-val ${this.syncedCount === 6 ? 'success-val' : 'hash-val'}">
                ${this.syncedCount} / 6 Gares synchronisées
              </span>
            </div>
            <div class="feedback-row">
              <span class="feedback-label">Registre local :</span>
              <span class="feedback-val">${this.txCount} transactions validées</span>
            </div>
          </div>
        </article>

        <article class="step-card keypoint-card animate-fade">
          <h4 class="card-title keypoint-title">Point clé</h4>
          <p class="keypoint-text">
            Si une gare tombe en panne ou tente de tricher sur son registre local, les 5 autres gares conservent la version authentique : il n'y a aucun point de défaillance unique.
          </p>
        </article>

        <div class="substep-action-box animate-fade">
          <button id="btn-step4-action-next" class="btn-panel-primary">
            <span>Étape 5 : Validation et minage</span>
            <span class="btn-arrow">&rarr;</span>
          </button>
        </div>
      </div>
    `;

    panel.prepend(inner);
    this.setupEvents();
  },

  setupEvents() {
    document.getElementById('btn-step4-tx1')?.addEventListener('click', () => {
      this.broadcastTransaction('Emma -> Lucas (20 MMI)');
    });

    document.getElementById('btn-step4-tx2')?.addEventListener('click', () => {
      this.broadcastTransaction('Gare-Sud -> Quai-Est (45 MMI)');
    });

    document.getElementById('btn-step4-action-next')?.addEventListener('click', () => {
      if (typeof this.ctx.onNextStep === 'function') {
        this.ctx.onNextStep();
      }
    });
  }
};
