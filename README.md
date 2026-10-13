# Visualisation pedagogique de la blockchain

Application web 3D interactive de vulgarisation des concepts fondamentaux de la blockchain, concue avec Three.js et Vite.

## Membres du binome

- Alban Chabalier (@achabalier14) : Gestion de projet, conception UX/UI, ergonomie des controles camera, narration pedagogique et scenarisation des 7 notions.
- Arthur Morin (@tuthure) : Architecture technique Three.js, rendu 3D (shaders, eclairage, materiaux des wagons), logique de manipulation de la chaine et integration Vite.

## Metaphore centrale : Le Convoi Ferroviaire Blinde

Pour rendre accessibles des principes cryptographiques abstraits a un public non initie, le projet repose sur la metaphore d'un train infini circulant a grande vitesse :

- Les wagons representent les blocs. Chaque wagon transporte des marchandises scellees qui correspondent aux transactions du bloc.
- L'attelage magnetique inviolable materialise le hash cryptographique. Le verrouillage energetique du wagon N ne peut s'enclencher que s'il reconnait la signature magnetique exacte du wagon precedent (previousHash).
- La rupture d'attelage illustre l'effet avalanche et l'immutabilite : modifier une marchandise a l'interieur d'un wagon corrompt instantanement sa signature, brisant l'attelage magnetique avec tous les wagons suivants qui passent au rouge et se decrochent.
- Les voies ferrees paralleles et les aiguilleurs independants modelisent le reseau pair-a-pair decentralise. Chaque aiguilleur (noeud) entretient sa propre voie et s'assure de la validite du convoi sans autorite centrale.
- La motrice et le verrouillage mecanique incarnent le minage et la preuve de travail (Proof of Work). Pour accrocher un nouveau wagon, la chaudiere doit chauffer et faire tourner ses mecanismes pour trouver la combinaison exacte (le Nonce) respectant la difficulte demandee.

## Notions abordees

1. Structure d'un bloc (marchandises, hash, previousHash, nonce).
2. Chainage cryptographique (attelage magnetique scellant les wagons).
3. Immutabilite et detection de falsification (rupture d'attelage en cascade).
4. Reseau et decentralisation (voies paralleles surveillees par des aiguilleurs).
5. Validation et minage (chauffe de la motrice et resolution du nonce en PoW).
6. Comparaison de mecanismes de consensus (effort energetique PoW vs caution d'aiguilleurs PoS).
7. Cycle de vie d'une transaction et tentative d'attaque (colis sur le quai, validation et rejet de la double depense).

## Stack technique

- Three.js (rendu 3D WebGL)
- Vite (outillage de developpement et bundling)
- HTML5 / CSS3 (interface HUD et styles responsive)
- GitHub Actions & GitHub Pages (integration continue et deploiement)

## Installation et execution locale

Pre-requis : Node.js (version 18 ou superieure) et npm.

1. Cloner le depot :
```bash
git clone https://github.com/tuthure/Projet_ThreeJS_Morin_Chabalier.git
cd Projet_ThreeJS_Morin_Chabalier
```

2. Installer les dependances :
```bash
npm install
```

3. Lancer le serveur local de developpement :
```bash
npm run dev
```

4. Compiler pour la production :
```bash
npm run build
```

Les fichiers compiles sont generes dans le dossier `dist/`.

## Structure du repertoire

- `docs/` : Documents de cadrage, choix de modelisation et fiches de suivi.
  - `MMI-R507-projet-blockchain-CHOIX-MODELISATION.md` : Justification pedagogique et technique des choix 3D.
  - `MMI-R507-projet-blockchain-GRILLE-AUTOEVAL.md` : Grille d'auto-evaluation du projet.
  - `suivi/` : Suivi hebdomadaire de l'avancement.
- `src/` : Code source JavaScript et CSS de l'application.
  - `main.js` : Point d'entree de la scene Three.js, rendu et boucle d'animation.
  - `style.css` : Mise en page plein ecran et HUD.
- `public/` : Ressources statiques (textures, modeles, icones).
- `.github/workflows/` : Pipeline d'automatisation du deploiement.

## Jalons du projet

- Jalon 1 (09/10/2026) : Cadrage, groupe, depot GitHub, GitHub Projects et premiere scene Three.js.
- Jalon 2 (15/11/2026) : Livraison complete du projet, code source et demo en ligne.
- Jalon 3 (19/11/2026, 9h30 - 11h) : Repetition finale inter-groupes.
- Jalon 4 (19/11/2026, 11h - 12h30) : Soutenance finale.
