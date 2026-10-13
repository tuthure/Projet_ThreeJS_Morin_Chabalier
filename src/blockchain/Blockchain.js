import { Block } from './Block.js';

/**
 * Gestionnaire du registre de la blockchain.
 * Pilote le convoi ferroviaire et la validite des liaisons cryptographiques.
 */
export class Blockchain {
  constructor() {
    this.chain = [this.createGenesisBlock()];
    this.difficulty = 1;
  }

  /**
   * Genere le premier bloc du convoi (Bloc Genesis).
   * @returns {Block}
   */
  createGenesisBlock() {
    return new Block(
      0,
      Date.now(),
      { type: 'GENESIS', label: 'Origine du convoi', transactions: 0 },
      '0'
    );
  }

  /**
   * Retourne le dernier wagon actuellement attele au convoi.
   * @returns {Block}
   */
  getLatestBlock() {
    return this.chain[this.chain.length - 1];
  }

  /**
   * Ajoute un nouveau wagon a la suite de la chaine.
   * @param {any} data - Transactions ou donnees transportees.
   * @returns {Block} Le bloc nouvellement cree et ajoute.
   */
  addBlock(data) {
    const latestBlock = this.getLatestBlock();
    const newIndex = this.chain.length;
    const newTimestamp = Date.now();
    const newBlock = new Block(newIndex, newTimestamp, data, latestBlock.hash);

    this.chain.push(newBlock);
    return newBlock;
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
   * Altere deliberement les donnees d'un bloc sans recalculer son hash.
   * Simule une falsification malveillante des transactions d'un wagon.
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
    return targetBlock;
  }
}
