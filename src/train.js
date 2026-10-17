import * as THREE from 'three';
import { Block } from './blockchain/Block.js';
import { Blockchain } from './blockchain/Blockchain.js';
import { WagonMesh } from './three/WagonMesh.js';

/**
 * Espacement standard longitudinal entre deux wagons consecutifs.
 */
export const WAGON_SPACING = 3.8;

/**
 * Gestionnaire unifie du convoi ferroviaire 3D et de la blockchain pedagogique.
 * Fait la passerelle entre les structures de donnees cryptographiques (Block, Blockchain)
 * et leur incarnation visuelle dans Three.js (WagonMesh, attelages, signaux).
 */
export class TrainConvoy {
  /**
   * @param {THREE.Scene} scene - Scene Three.js receptive.
   * @param {object} [options={}] - Options de configuration du convoi.
   * @param {number} [options.spacing=3.8] - Intervalle entre chaque wagon.
   * @param {Function} [options.onStateChange] - Rappel declenche lors d'une mutation d'etat.
   */
  constructor(scene, options = {}) {
    this.scene = scene;
    this.spacing = options.spacing || WAGON_SPACING;
    this.onStateChange = options.onStateChange || null;

    this.blockchain = new Blockchain();
    this.wagonMeshes = [];
    this.originalDataBackup = new Map();

    this.group = new THREE.Group();
    this.scene.add(this.group);
  }

  /**
   * Initialise le convoi avec les blocs de depart.
   * @param {Array<any>} initialBlocks - Donnees des wagons a inserer a la suite du Genesis.
   */
  init(initialBlocks = []) {
    // Sauvegarde des donnees du wagon Genesis (#0)
    this.originalDataBackup.set(0, JSON.parse(JSON.stringify(this.blockchain.chain[0].data)));

    // Ajout et sauvegarde des blocs supplementaires
    initialBlocks.forEach((data) => {
      const block = this.blockchain.addBlock(data);
      this.originalDataBackup.set(block.index, JSON.parse(JSON.stringify(data)));
    });

    this.sync();
  }

  /**
   * Synchronise les modeles 3D des wagons avec la liste des blocs de la blockchain.
   * Instancie les maillons manquants, aligne les positions et propage l'etat de validite.
   * @returns {boolean[]} Liste des etats de validite par wagon.
   */
  sync() {
    const chain = this.blockchain.chain;
    const validityList = this.blockchain.getBlockValidityList();

    // 1. Instanciation des nouveaux wagons manquants
    for (let i = this.wagonMeshes.length; i < chain.length; i++) {
      const block = chain[i];
      const wagon = new WagonMesh(block, { spacing: this.spacing });

      // Alignement du convoi le long de l'axe X (le train grandit vers les X positifs, de gauche a droite)
      wagon.position.set(i * this.spacing, 0, 0);

      this.group.add(wagon);
      this.wagonMeshes.push(wagon);
    }

    // 2. Propagation des etats de validite a chaque wagon 3D
    for (let i = 0; i < this.wagonMeshes.length; i++) {
      const wagon = this.wagonMeshes[i];
      const isValid = validityList[i] ?? false;
      wagon.updateStatus(isValid);
    }

    // 3. Notification d'ecouteur d'evenements
    if (typeof this.onStateChange === 'function') {
      this.onStateChange(this.getSummary());
    }

    return validityList;
  }

  /**
   * Retourne la liste des groupes WagonMesh pour les interactions de raycasting.
   * @returns {WagonMesh[]}
   */
  getWagonMeshes() {
    return this.wagonMeshes;
  }

  /**
   * Retourne une instance de WagonMesh par son index ordinal.
   * @param {number} index - Index du bloc/wagon recherche.
   * @returns {WagonMesh|undefined}
   */
  getWagon(index) {
    return this.wagonMeshes[index];
  }

  /**
   * Retourne un bloc logique de la blockchain par son index.
   * @param {number} index - Index du bloc recherche.
   * @returns {Block|undefined}
   */
  getBlock(index) {
    return this.blockchain.chain[index];
  }

  /**
   * Calcule les coordonnees mondiales du centre d'un wagon.
   * @param {number} index - Index du wagon.
   * @returns {THREE.Vector3}
   */
  getWagonPosition(index) {
    const wagon = this.wagonMeshes[index];
    if (wagon) {
      const pos = new THREE.Vector3();
      wagon.getWorldPosition(pos);
      return pos;
    }
    return new THREE.Vector3(index * this.spacing, 0, 0);
  }

  /**
   * Barycentre du train complet pour le positionnement de camera en vue d'ensemble.
   * @returns {THREE.Vector3}
   */
  getTrainCenter() {
    const count = this.wagonMeshes.length;
    const centerX = count > 0 ? ((count - 1) * this.spacing) / 2 : 0;
    return new THREE.Vector3(centerX, 0.4, 0);
  }

  /**
   * Altere les donnees d'un wagon specifique sans regenerer son empreinte.
   * Provoque la rupture d'attelage et l'effet avalanche visuel.
   * @param {number} index - Index du wagon a corrompre.
   * @param {any} newData - Contenu frauduleux.
   */
  corruptBlock(index, newData) {
    const block = this.blockchain.corruptBlock(index, newData);
    if (!block) return null;

    this.sync();
    return {
      block,
      validity: this.blockchain.getBlockValidityList()
    };
  }

  /**
   * Valide et recalcule l'empreinte d'un bloc corrompu, puis propage les empreintes
   * successives sur l'ensemble du convoi pour restaurer l'integrite de la chaine.
   * @param {number} index - Index a partir duquel recalculer.
   * @param {number} [difficulty=1] - Difficulte de preuve de travail.
   */
  recalculateAndMineBlock(index, difficulty = 1) {
    if (index < 0 || index >= this.blockchain.chain.length) return null;

    const block = this.blockchain.chain[index];
    block.mineBlock(difficulty);

    // Propager la mise a jour du previousHash et recalculer les blocs suivants
    for (let i = index + 1; i < this.blockchain.chain.length; i++) {
      const prev = this.blockchain.chain[i - 1];
      const curr = this.blockchain.chain[i];
      curr.previousHash = prev.hash;
      curr.mineBlock(difficulty);
    }

    this.sync();
    return {
      block,
      validity: this.blockchain.getBlockValidityList()
    };
  }

  /**
   * Restaure les donnees d'origine d'un wagon cible et repare la liaison.
   * @param {number} index - Index du wagon a reinitialiser.
   */
  resetBlock(index) {
    if (this.originalDataBackup.has(index)) {
      const originalData = JSON.parse(JSON.stringify(this.originalDataBackup.get(index)));
      this.blockchain.chain[index].data = originalData;

      for (let i = index; i < this.blockchain.chain.length; i++) {
        const curr = this.blockchain.chain[i];
        if (i > 0) {
          curr.previousHash = this.blockchain.chain[i - 1].hash;
        }
        curr.hash = curr.calculateHash();
      }

      this.sync();
    }
  }

  /**
   * Restaure l'integralite du convoi ferroviaire a ses donnees d'origine.
   */
  restoreEntireTrain() {
    this.blockchain.chain.forEach((block) => {
      if (this.originalDataBackup.has(block.index)) {
        block.data = JSON.parse(JSON.stringify(this.originalDataBackup.get(block.index)));
      }
    });

    for (let i = 0; i < this.blockchain.chain.length; i++) {
      const curr = this.blockchain.chain[i];
      if (i > 0) {
        curr.previousHash = this.blockchain.chain[i - 1].hash;
      }
      curr.hash = curr.calculateHash();
    }

    this.sync();
  }

  /**
   * Attelle dynamiquement un nouveau wagon a la fin du train.
   * @param {any} [data] - Contenu transportee par le wagon.
   * @returns {Block} Le bloc cree.
   */
  addBlock(data) {
    const payload = data || {
      emetteur: `Station-${this.blockchain.chain.length}`,
      destinataire: 'Depot-Central',
      montant: Math.floor(Math.random() * 50) + 1,
      unite: 'MMI-Coin'
    };

    const block = this.blockchain.addBlock(payload);
    this.originalDataBackup.set(block.index, JSON.parse(JSON.stringify(payload)));
    this.sync();
    return block;
  }

  /**
   * Animation douce d'oscillation verticale reproduisant la suspension sur rails.
   * @param {number} elapsedTime - Temps ecoule en secondes.
   */
  animateSuspension(elapsedTime) {
    for (let i = 0; i < this.wagonMeshes.length; i++) {
      const wagon = this.wagonMeshes[i];
      wagon.position.y = Math.sin(elapsedTime * 1.8 + i * 0.7) * 0.025;
    }
  }

  /**
   * Synthese d'etat globale de la blockchain pour le HUD.
   */
  getSummary() {
    const validityList = this.blockchain.getBlockValidityList();
    const isAllValid = validityList.every((val) => val === true);
    const firstInvalidIndex = validityList.findIndex((val) => val === false);

    return {
      totalWagons: this.blockchain.chain.length,
      isValid: isAllValid,
      validityList,
      firstInvalidIndex: firstInvalidIndex !== -1 ? firstInvalidIndex : null
    };
  }
}

export { Block, Blockchain, WagonMesh };
