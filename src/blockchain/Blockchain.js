import { Block } from './Block.js';

/**
 * Gestionnaire du registre de la blockchain.
 * Pilote le convoi ferroviaire et la validite des liaisons cryptographiques.
 */
export class Blockchain {
  constructor() {
    this.difficulty = 1;
    this.lastMiningAttempts = 0;
    this.chain = [this.createGenesisBlock()];
  }

  /**
   * Genere un nonce aleatoire unique compris entre 0 et 999 sans doublon sur la chaine.
   * @returns {number}
   */
  generateUniqueNonce() {
    const used = new Set(this.chain ? this.chain.map((b) => b.nonce) : []);
    let nonce;
    let attempts = 0;
    do {
      nonce = Math.floor(Math.random() * 1000);
      attempts++;
    } while (used.has(nonce) && attempts < 2000);
    return nonce;
  }

  /**
   * Genere le premier bloc du convoi (Bloc Genesis), deja mine selon la difficulte par defaut.
   * @returns {Block}
   */
  createGenesisBlock() {
    const block = new Block(
      0,
      Date.now(),
      { type: 'GENESIS', label: 'Mise en service de la locomotive Genesis #0', transactions: 0 },
      '0',
      0
    );
    block.mineBlock(this.difficulty || 1);
    return block;
  }

  /**
   * Retourne le dernier wagon actuellement attele au convoi.
   * @returns {Block}
   */
  getLatestBlock() {
    return this.chain[this.chain.length - 1];
  }

  /**
   * Ajoute un nouveau wagon a la suite de la chaine, mine par defaut pour que tous les wagons
   * valides du convoi commencent bien par le nombre de zeros requis.
   * @param {any} data - Transactions ou donnees transportees.
   * @returns {Block} Le bloc nouvellement cree et ajoute.
   */
  addBlock(data) {
    const latestBlock = this.getLatestBlock();
    const newIndex = this.chain.length;
    const newTimestamp = Date.now();
    const newBlock = new Block(newIndex, newTimestamp, data, latestBlock.hash, 0);
    newBlock.mineBlock(this.difficulty || 1);

    this.chain.push(newBlock);
    return newBlock;
  }

  /**
   * Mine le dernier bloc de la chaine selon la difficulte demandee.
   * @param {number} difficulty - Nombre de zeros requis en debut de hash (1, 2 ou 3).
   * @returns {{ nonce: number, attempts: number, hash: string, block: Block }}
   */
  mineLatestBlock(difficulty = 1) {
    const latestBlock = this.getLatestBlock();
    const res = latestBlock.mineBlock(difficulty);
    this.lastMiningAttempts = res.attempts || 0;
    return {
      ...res,
      block: latestBlock
    };
  }

  /**
   * Verifie l'integrite globale de la blockchain.
   * @returns {boolean} Vrai si l'integralite du convoi est valide.
   */
  isChainValid() {
    const validityList = this.getBlockValidityList();
    return validityList.every((isValid) => isValid === true);
  }

  /**
   * Evalue la validite bloc par bloc pour la representation visuelle 3D.
   * Propage l'effet avalanche : des qu'un wagon est corrompu, tous les wagons suivants
   * perdent leur attelage et deviennent invalides.
   * @returns {boolean[]} Tableau de booleens indicant l'etat de chaque wagon.
   */
  getBlockValidityList() {
    const results = [];
    let chainIntact = true;

    for (let i = 0; i < this.chain.length; i++) {
      if (!chainIntact) {
        results.push(false);
        continue;
      }

      const currentBlock = this.chain[i];
      const isHashCorrect = currentBlock.hash === currentBlock.calculateHash();

      if (i === 0) {
        if (isHashCorrect) {
          results.push(true);
        } else {
          results.push(false);
          chainIntact = false;
        }
      } else {
        const previousBlock = this.chain[i - 1];
        const isPreviousHashCorrect = currentBlock.previousHash === previousBlock.hash;

        if (isHashCorrect && isPreviousHashCorrect) {
          results.push(true);
        } else {
          results.push(false);
          chainIntact = false;
        }
      }
    }

    return results;
  }

  /**
   * Altere deliberement les donnees d'un bloc et recalcule son hash.
   * La modification du chargement produit une nouvelle empreinte (effet avalanche),
   * rendant automatiquement le previousHash du bloc suivant faux et obsolete.
   * @param {number} index - Index du bloc a falsifier.
   * @param {any} newData - Nouvelles donnees falsifiees.
   * @returns {Block|null}
   */
  corruptBlock(index, newData) {
    if (index < 0 || index >= this.chain.length) {
      console.warn(`Indice de bloc hors limites : ${index}`);
      return null;
    }

    const targetBlock = this.chain[index];
    targetBlock.data = newData;
    targetBlock.hash = targetBlock.calculateHash();
    return targetBlock;
  }
}
