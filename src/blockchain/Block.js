/**
 * Algorithme SHA-256 synchrone autonome (sans dependance externe).
 * Produit une empreinte hexadecimale de 64 caracteres.
 * @param {string} input - Chaine source a hacher.
 * @returns {string} Empreinte SHA-256 en minuscule.
 */
function sha256Sync(input) {
  function rightRotate(value, amount) {
    return (value >>> amount) | (value << (32 - amount));
  }

  const maxWord = Math.pow(2, 32);
  let i;
  let j;
  let result = '';

  // Conversion UTF-8
  const utf8 = unescape(encodeURIComponent(input));
  const words = [];
  const bitLength = utf8.length * 8;

  let hash = [];
  const k = [];

  let primeCounter = 0;
  const isComposite = {};
  for (let candidate = 2; primeCounter < 64; candidate++) {
    if (!isComposite[candidate]) {
      for (i = 0; i < 313; i += candidate) {
        isComposite[i] = candidate;
      }
      hash[primeCounter] = (Math.pow(candidate, 0.5) * maxWord) | 0;
      k[primeCounter++] = (Math.pow(candidate, 1 / 3) * maxWord) | 0;
    }
  }

  let ascii = utf8 + '\x80';
  while (ascii.length % 64 - 56) {
    ascii += '\x00';
  }

  for (i = 0; i < ascii.length; i++) {
    j = ascii.charCodeAt(i);
    words[i >> 2] |= j << ((3 - i) % 4) * 8;
  }

  words[words.length] = ((bitLength / maxWord) | 0);
  words[words.length] = (bitLength | 0);

  for (j = 0; j < words.length;) {
    const w = words.slice(j, (j += 16));
    const oldHash = hash;
    hash = hash.slice(0, 8);

    for (i = 0; i < 64; i++) {
      const w15 = w[i - 15];
      const w2 = w[i - 2];
      const s0 = rightRotate(w15, 7) ^ rightRotate(w15, 18) ^ (w15 >>> 3);
      const s1 = rightRotate(w2, 17) ^ rightRotate(w2, 19) ^ (w2 >>> 10);
      w[i] = (i < 16) ? w[i] : (w[i - 16] + s0 + w[i - 7] + s1) | 0;

      const ch = (hash[4] & hash[5]) ^ (~hash[4] & hash[6]);
      const maj = (hash[0] & hash[1]) ^ (hash[0] & hash[2]) ^ (hash[1] & hash[2]);
      const temp1 = hash[7] + (rightRotate(hash[4], 6) ^ rightRotate(hash[4], 11) ^ rightRotate(hash[4], 25)) + ch + k[i] + w[i];
      const temp2 = (rightRotate(hash[0], 2) ^ rightRotate(hash[0], 13) ^ rightRotate(hash[0], 22)) + maj;

      hash = [(temp1 + temp2) | 0].concat(hash);
      hash[4] = (hash[4] + temp1) | 0;
    }

    for (i = 0; i < 8; i++) {
      hash[i] = (hash[i] + oldHash[i]) | 0;
    }
  }

  for (i = 0; i < 8; i++) {
    for (j = 3; j >= 0; j--) {
      const b = (hash[i] >> (j * 8)) & 255;
      result += ((b < 16) ? '0' : '') + b.toString(16);
    }
  }

  return result;
}

/**
 * Classe representant un bloc logique de la blockchain.
 * Dans la metaphore ferroviaire, chaque bloc correspond a un wagon du convoi.
 */
export class Block {
  /**
   * @param {number} index - Position ordonnee du bloc dans la chaine.
   * @param {number|string} timestamp - Horodatage de creation.
   * @param {any} data - Donnees / transactions transportees dans le bloc.
   * @param {string} previousHash - Empreinte cryptographique du bloc precedent.
   * @param {number} [nonce=0] - Valeur d'ajustement utilisee pour la preuve de travail.
   */
  constructor(index, timestamp, data, previousHash = '', nonce = 0) {
    this.index = index;
    this.timestamp = timestamp;
    this.data = data;
    this.previousHash = previousHash;
    this.nonce = nonce;
    this.hash = this.calculateHash();
  }

  /**
   * Calcule le hash SHA-256 a partir des attributs immuables du bloc.
   * @returns {string} Empreinte SHA-256 du bloc.
   */
  calculateHash() {
    const rawPayload = `${this.index}${this.previousHash}${this.timestamp}${JSON.stringify(this.data)}${this.nonce}`;
    return sha256Sync(rawPayload);
  }

  /**
   * Methode utilitaire pour miner le bloc avec une difficulte donnee (zeros initiaux).
   * @param {number} difficulty - Nombre de zeros requis en tete du hash.
   */
  mineBlock(difficulty) {
    const targetPrefix = '0'.repeat(difficulty);
    while (this.hash.substring(0, difficulty) !== targetPrefix) {
      this.nonce++;
      this.hash = this.calculateHash();
    }
  }
}
