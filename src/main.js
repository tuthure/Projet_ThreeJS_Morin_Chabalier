import { Blockchain } from './blockchain/Blockchain.js';
import { TrainScene } from './three/TrainScene.js';
import { WagonMesh } from './three/WagonMesh.js';

/**
 * Point d'entree principal de la visualisation 3D de la blockchain.
 * Relie le registre Blockchain aux modeles proceduraux Three.js (WagonMesh)
 * au sein de la scene ferroviaire (TrainScene).
 */

const canvas = document.querySelector('#webgl');
if (!canvas) {
  throw new Error('Canvas WebGL introuvable dans le DOM');
}

// 1. Initialisation de la scene 3D
const trainScene = new TrainScene(canvas);

// 2. Initialisation de la blockchain et generation des premiers blocs
const blockchain = new Blockchain();
const originalBlocksBackup = new Map();

// Sauvegarde des donnees initiales pour permettre une reinitialisation
originalBlocksBackup.set(0, JSON.parse(JSON.stringify(blockchain.chain[0].data)));

// Ajout des deux blocs initiaux (transactions temoins)
const block1 = blockchain.addBlock({
  emetteur: 'Arthur',
  destinataire: 'Alban',
  montant: 15,
  unite: 'MMI-Coin'
});
originalBlocksBackup.set(1, JSON.parse(JSON.stringify(block1.data)));

const block2 = blockchain.addBlock({
  emetteur: 'Alban',
  destinataire: 'Equipe-R507',
  montant: 30,
  unite: 'MMI-Coin'
});
originalBlocksBackup.set(2, JSON.parse(JSON.stringify(block2.data)));

// 3. Gestion de la flotte de wagons 3D
const WAGON_SPACING = 3.8;
const wagonMeshes = [];

/**
 * Synchronise les maillons 3D (wagons) avec la liste des blocs de la blockchain.
 * Met a jour l'alignement le long de l'axe X et propage les etats de validite.
 */
function syncTrainWithBlockchain() {
  const chainLength = blockchain.chain.length;
  const validityList = blockchain.getBlockValidityList();

  // Instancie les nouveaux wagons manquants
  for (let i = wagonMeshes.length; i < chainLength; i++) {
    const block = blockchain.chain[i];
    const wagon = new WagonMesh(block, { spacing: WAGON_SPACING });

    // Alignement longitudinal des wagons le long de l'axe X
    wagon.position.x = -i * WAGON_SPACING;
    wagon.position.y = 0;
    wagon.position.z = 0;

    trainScene.add(wagon);
    wagonMeshes.push(wagon);
  }

  // Met a jour l'etat de validite de chaque wagon existant
  for (let i = 0; i < wagonMeshes.length; i++) {
    const wagon = wagonMeshes[i];
    const isValid = validityList[i] ?? false;
    wagon.updateStatus(isValid);
  }

  // Recentre doucement la cible des controles sur le barycentre du train
  const trainCenterX = -((chainLength - 1) * WAGON_SPACING) / 2;
  trainScene.controls.target.x = trainCenterX;

  // Mise a jour du HUD d'information HTML
  updateHUDStatus(validityList);
}

/**
 * Met a jour l'affichage informatif de l'interface utilisateur.
 * @param {boolean[]} validityList - Tableau de validite par wagon.
 */
function updateHUDStatus(validityList) {
  const badgeEl = document.querySelector('.hud-info .badge');
  const descEl = document.querySelector('.hud-info .desc');

  if (!badgeEl || !descEl) {
    return;
  }

  const isAllValid = validityList.every((val) => val === true);
  const totalWagons = validityList.length;

  if (isAllValid) {
    badgeEl.textContent = `Chaine valide - ${totalWagons} wagons synchronises`;
    badgeEl.style.color = '#10b981';
    descEl.textContent = 'Tous les attelages cryptographiques sont stables et verrouilles.';
  } else {
    const firstInvalidIndex = validityList.findIndex((val) => val === false);
    badgeEl.textContent = `Alerte : Rupture au wagon #${firstInvalidIndex}`;
    badgeEl.style.color = '#ef4444';
    descEl.textContent = `Effet avalanche actif : les wagons de #${firstInvalidIndex} a #${totalWagons - 1} sont invalides.`;
  }
}

// 4. Animation d'oscillation douce de suspension des wagons
trainScene.registerUpdatable((delta, elapsedTime) => {
  for (let i = 0; i < wagonMeshes.length; i++) {
    const wagon = wagonMeshes[i];
    // Legere oscillation verticale asynchrone simulant la suspension sur rails
    wagon.position.y = Math.sin(elapsedTime * 1.8 + i * 0.7) * 0.025;
  }
});

// 5. Premiere synchronisation au demarrage
syncTrainWithBlockchain();

// 6. Exposition des methodes de manipulation dans l'objet global window.blockchain
window.blockchain = {
  instance: blockchain,

  /**
   * Modifie arbitrairement les donnees d'un bloc sans regenerer son hash.
   * Provoque visuellement la rupture d'attelage et le passage au rouge des wagons suivants.
   * @param {number} [index=1] - Indice du wagon a falsifier.
   * @param {any} [newData='TRANSACTION_FALSIFIEE_9999_BTC'] - Contenu frauduleux.
   */
  corruptBlock: (index = 1, newData = 'TRANSACTION_FALSIFIEE_9999_BTC') => {
    const targetBlock = blockchain.corruptBlock(index, newData);
    if (!targetBlock) {
      console.warn(`Impossible de corrompre le bloc a l'index ${index}`);
      return;
    }

    syncTrainWithBlockchain();

    console.warn(`[BLOCKCHAIN] Bloc #${index} falsifie.`);
    console.warn(`Nouvelles donnees injectees :`, newData);
    console.warn(`Etat de validite :`, blockchain.getBlockValidityList());
  },

  /**
   * Ajoute un nouveau wagon attele a la fin du train avec calcul de hash cryptographique.
   * @param {any} [data] - Donnees de la transaction a integrer.
   * @returns {import('./blockchain/Block.js').Block}
   */
  addBlock: (data) => {
    const payload = data || {
      emetteur: `Station-${blockchain.chain.length}`,
      destinataire: 'Depot-Central',
      quantite: Math.floor(Math.random() * 50) + 1,
      horodatage: new Date().toLocaleTimeString('fr-FR')
    };

    const newBlock = blockchain.addBlock(payload);
    originalBlocksBackup.set(newBlock.index, JSON.parse(JSON.stringify(payload)));

    syncTrainWithBlockchain();

    console.info(`[BLOCKCHAIN] Nouveau wagon #${newBlock.index} attele au convoi.`);
    console.info(`Hash : ${newBlock.hash}`);
    console.info(`PreviousHash : ${newBlock.previousHash}`);
    return newBlock;
  },

  /**
   * Restaure les donnees initiales d'un bloc ou de l'ensemble de la chaine.
   * @param {number} [index] - Indice a restaurer, ou restaure tout si omis.
   */
  restore: (index) => {
    if (typeof index === 'number') {
      if (originalBlocksBackup.has(index)) {
        blockchain.chain[index].data = JSON.parse(JSON.stringify(originalBlocksBackup.get(index)));
        console.info(`[BLOCKCHAIN] Bloc #${index} retabli a ses donnees d'origine.`);
      }
    } else {
      blockchain.chain.forEach((block) => {
        if (originalBlocksBackup.has(block.index)) {
          block.data = JSON.parse(JSON.stringify(originalBlocksBackup.get(block.index)));
        }
      });
      console.info('[BLOCKCHAIN] Tous les blocs ont ete restaures a leur etat initial.');
    }

    syncTrainWithBlockchain();
  },

  /**
   * Retourne la validite globale de la chaine.
   * @returns {boolean}
   */
  isValid: () => blockchain.isChainValid(),

  /**
   * Retourne la validite detaillee wagon par wagon.
   * @returns {boolean[]}
   */
  getValidityList: () => blockchain.getBlockValidityList(),

  /**
   * Affiche un tableau recapitulatif dans la console de developpement.
   */
  inspect: () => {
    console.table(
      blockchain.chain.map((b, i) => ({
        index: b.index,
        valide: blockchain.getBlockValidityList()[i],
        hash: `${b.hash.substring(0, 12)}...`,
        previousHash: `${b.previousHash.substring(0, 12)}...`,
        data: typeof b.data === 'string' ? b.data : JSON.stringify(b.data)
      }))
    );
  }
};

// 7. Connexion des boutons d'interaction du HUD (s'ils existent dans le DOM)
const btnAdd = document.querySelector('#btn-add-block');
if (btnAdd) {
  btnAdd.addEventListener('click', () => window.blockchain.addBlock());
}

const btnCorrupt = document.querySelector('#btn-corrupt-block');
if (btnCorrupt) {
  btnCorrupt.addEventListener('click', () => window.blockchain.corruptBlock(1));
}

const btnRestore = document.querySelector('#btn-restore-chain');
if (btnRestore) {
  btnRestore.addEventListener('click', () => window.blockchain.restore());
}

// 8. Message d'accueil et consignes de test en console
console.log('%c[LE CONVOI FERROVIAIRE - BLOCKCHAIN 3D]', 'color: #38bdf8; font-weight: bold; font-size: 14px;');
console.log('Commandes de test interactives disponibles dans la console :');
console.log('- window.blockchain.corruptBlock(1) : Falsifie le wagon #1 pour declencher la rupture de la chaine.');
console.log('- window.blockchain.addBlock({ ... }) : Attelle dynamiquement un nouveau wagon au train.');
console.log('- window.blockchain.restore() : Restaure les donnees valides et retablit les attelages.');
console.log('- window.blockchain.inspect() : Affiche l etat structurel de la blockchain.');
