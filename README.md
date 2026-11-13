# Visualisation pédagogique de la blockchain — Le Convoi Ferroviaire Blindé

Projet de BUT MMI 3e année — Ressource R507 : *Dispositifs interactifs* (Three.js, IUT de Béziers).  
Conception et développement d'une expérience web interactive en 3D avec Three.js visant à faire comprendre les principes d'une blockchain à un utilisateur non initié, sans aucune explication orale préalable.

> Note pédagogique : ce projet est un outil de médiation scientifique exécuté côté navigateur. Les empreintes SHA-256, le chaînage cryptographique et la recherche de Nonce sont réellement calculés en JavaScript (`Block.js` et `Blockchain.js`), tandis que la taille du réseau et la difficulté du minage sont volontairement adaptées pour rester observables en temps réel à 60 FPS.

---

## Équipe et répartition des rôles

| Membre | GitHub | Rôle principal |
|:---|:---|:---|
| **Arthur Morin** | `@tuthure` | Architecture technique Three.js, modélisation procédurale 3D (locomotive, wagons vitrés, gares, aiguillages), animations mécaniques, logique cryptographique et intégration Vite / GitHub Actions. |
| **Alban Chabalier** | `@achabalier14` | Gestion de projet (GitHub Projects, jalons, fiches hebdomadaires), conception UX/UI (volet pédagogique et infobulles SVG), ergonomie des contrôles caméra, scénarisation des 7 notions et campagne de tests utilisateurs. |

Chaque membre maîtrise l'ensemble des 7 notions obligatoires et l'architecture complète du dépôt en vue de la soutenance.

---

## Liens et livrables du projet

- **Démo interactive en ligne (GitHub Pages)** : https://tuthure.github.io/Projet_ThreeJS_Morin_Chabalier/
- **Dépôt GitHub** : https://github.com/tuthure/Projet_ThreeJS_Morin_Chabalier
- **Tableau de bord GitHub Projects (Kanban)** : https://github.com/tuthure/Projet_ThreeJS_Morin_Chabalier/projects
- **Formulaire public de tests utilisateurs** : https://forms.gle/SrQx1cJVSrnMt7sc9

| Livrable officiel R507 | Fichier / Emplacement | Contenu |
|:---|:---|:---|
| Application Three.js | `index.html`, `src/` | Parcours interactif (accueil + étapes 0 à 7), calcul SHA-256 réel et compteur FPS intégré. |
| Choix de modélisation (25 % de la note) | [`docs/MMI-R507-projet-blockchain-CHOIX-MODELISATION.md`](docs/MMI-R507-projet-blockchain-CHOIX-MODELISATION.md) | Justification détaillée de chaque notion, correspondance technique, alternatives écartées et limites assumées. |
| Protocole et bilan des tests | [`docs/PROTOCOLE-TESTS.md`](docs/PROTOCOLE-TESTS.md) | Questionnaire complet, résultats détaillés des 4 testeurs externes (4,25 / 5) et 5 correctifs appliqués. |
| Plan de soutenance | [`docs/SOUTENANCE.md`](docs/SOUTENANCE.md) | Répartition minutée (20 min), script de démo en direct (7 min), plan B et réponses aux questions du jury. |
| Grille d'auto-évaluation | [`docs/MMI-R507-projet-blockchain-GRILLE-AUTOEVAL.md`](docs/MMI-R507-projet-blockchain-GRILLE-AUTOEVAL.md) | Auto-évaluation factuelle critère par critère avant soutenance. |
| Fiches de suivi hebdomadaire | [`docs/suivi-hebdo/`](docs/suivi-hebdo/) | Suivi hebdomadaire de la progression, des commits et des décisions (`SEMAINE-01.md` à `SEMAINE-05.md`). |

---

## Public cible et métaphore du Convoi Ferroviaire Blindé

Le dispositif s'adresse à un **utilisateur non initié** découvrant l'application en autonomie totale. Chaque concept abstrait est traduit dans une métaphore ferroviaire cohérente et manipulable :

- **Le réseau ferroviaire public (Étape 0)** : Aucune compagnie centrale ni chef de gare unique ne contrôle les rails ; le réseau est maintenu et vérifié collectivement par toutes les gares.
- **La locomotive de tête (Bloc Genesis #0)** : Elle ouvre la marche et porte les règles partagées du convoi.
- **Les wagons vitrés (Les blocs)** : Leurs parois vitrées permettent de voir publiquement les cargaisons (transactions) transportées à l'intérieur, sans autoriser leur altération discrète.
- **L'attelage magnétique coloré (Hash et `previousHash`)** : L'anneau arrière d'un wagon affiche la couleur et le code de son Hash ; le crochet avant du wagon suivant doit porter exactement la même signature pour maintenir l'attelage verrouillé.
- **La molette latérale crantée (Le Nonce)** : Un engrenage rotatif fixé sur le wagon candidat permet d'incrémenter le Nonce cran par cran (`1 essai = +1 cran de 45 degrés`) lors du minage.
- **L'archipel de 6 gares autonomes (Le réseau décentralisé)** : Six gares de taille identique maintiennent chacune une copie complète du train et se relaient les transactions de proche en proche (protocole Gossip).

---

## Les 7 notions obligatoires et interactions 3D associées

| # | Notion obligatoire (sujet R507) | Module(s) | Métaphore ferroviaire | Interaction 3D et calcul réel | Limite pédagogique assumée |
|:---:|:---|:---|:---|:---|:---|
| **0** | *Accueil et cadrage* | `welcome.js`, `step0.js` | Convoi complet circulant sur un réseau ferroviaire public | Découverte panoramique des 3 piliers (locomotive, wagons vitrés, attelages) avant d'entrer dans le parcours. | Présentation introductive sans édition de bloc. |
| **1** | **Structure d'un bloc** : données, hash, hash du parent, nonce | `step1.js`, `Block.js` | Anatomie d'un wagon blindé à parois vitrées | Inspection à 360° avec 4 infobulles reliées en SVG ; modification de cargaison et rotation de la molette du Nonce recalculant un vrai SHA-256 (`sha256Sync`). | Arbre de Merkle synthétisé sous forme de deux caisses lisibles par wagon. |
| **2** | **Chaînage cryptographique** : hash, lien parent, sensibilité | `step2.js`, `Blockchain.js` | Attelage magnétique par concordance d'anneaux | Comparaison simultanée des jonctions (`Hash #N-1 == PreviousHash #N`) et ajout de nouveaux wagons au train. | Les wagons ajoutés ici sont pré-minés pour isoler la notion de chaînage. |
| **3** | **Immutabilité et détection de falsification** | `step3.js`, `Blockchain.js` | Altération du Wagon #1 et décrochage mécanique en cascade | Modification de la cargaison du Wagon #1 : son anneau vire au jaune, rompt l'attelage cyan du Wagon #2 (`getBlockValidityList()`) et passe la suite en alerte rouge. | Le fraudeur modifie localement sans tenter de re-miner toute la suite (vu à l'étape 7). |
| **4** | **Réseau et décentralisation** : nœuds, copies, propagation sans centre | `step4.js` | Archipel de 6 gares autonomes (A à F) sans gare centrale | Propagation Gossip séquentielle de voisin en voisin, mise en panne d'une gare au clic 3D avec contournement, et rejet d'une copie pirate par les 5 autres gares. | Réseau borné à 6 gares en mémoire locale (vs milliers de nœuds P2P réels). |
| **5** | **Validation et minage (PoW)** : vérification et recherche de nonce | `step5.js`, `Block.js` | Effort sur la molette crantée d'un wagon candidat à distance | Choix de difficulté (`0`, `00`, `000`), clic manuel cran par cran sur la molette 3D ou minage automatique (`mineBlock()` avec sel aléatoire) et stats réels vs moyenne théorique (`16`, `256`, `4 096`). | Difficulté limitée à 1-3 zéros hexadécimaux pour rester observable en quelques secondes. |
| **6** | **Comparaison PoW vs PoS** : différences, avantages et limites | `step6.js` | Compétition de 3 gares (PoW) face au tirage sur caution (PoS) | Comparaison à poids égaux (50 %, 35 %, 15 %) : en PoW les 3 molettes tournent simultanément (énergie perdue) ; en PoS une loterie élit une gare unique pendant que les 2 autres restent à 0 cran. | Les comités d'attestation et le *slashing* sont expliqués textuellement. |
| **7** | **Cycle de vie d'une transaction et attaque** (51 %) | `step7.js` | Aiguillage en Y opposant branche honnête et branche pirate | Rappel des 5 phases du cycle de vie, puis course d'assemblage sur l'aiguillage en Y : scénario 20 % vs 80 % (victoire honnête) et scénario 60 % vs 40 % (réorganisation par chaîne la plus longue). | Course condensée sur 3 wagons (vs 6 confirmations sur Bitcoin) ; pas de signature ECDSA. |

---

## Gestion de projet, calendrier et jalons

Le suivi est organisé sur **GitHub Projects** avec un tableau Kanban à 5 colonnes (`Backlog`, `À faire`, `En cours`, `À vérifier`, `Terminé`), des issues assignées liées aux commits et des bilans hebdomadaires dans [`docs/suivi-hebdo/`](docs/suivi-hebdo/).

| Jalon / échéance | Date (2026) | Attendu |
|:---|:---|:---|
| **Présentation du sujet** | 1er octobre 2026 | Prise en main des consignes R507 et définition de la métaphore ferroviaire. |
| **Cadrage et GitHub Projects** | 9 octobre 2026, 17h | Dépôt créé, board Kanban configuré, jalons et premières issues rédigées. |
| **Livraison du projet** | 15 novembre 2026, 23h59 | Application complète déployée sur GitHub Pages, documentation officielle et tests finalisés. |
| **Répétition finale** | 19 novembre 2026, 9h30 | Répétition chronométrée entre groupes avant passage devant le jury. |
| **Soutenance finale** | 19 novembre 2026, 11h00 | Présentation de 20 minutes avec diaporama et démonstration en direct. |

---

## Tests utilisateurs et qualité technique

### Bilan des tests utilisateurs (4 testeurs externes)
Conformément au protocole décrit dans [`docs/PROTOCOLE-TESTS.md`](docs/PROTOCOLE-TESTS.md), **4 personnes extérieures au groupe** (18-25 ans, novices sur la blockchain) ont parcouru l'application déployée à distance en totale autonomie sans explication orale préalable, puis ont répondu au formulaire Google Forms :

- **Compréhension globale après parcours :** **4,25 / 5** en moyenne.
- **Équilibre texte / animation 3D :** **5,00 / 5** auprès des 4 testeurs.
- **Fluidité WebGL constatée :** **100 % fluide** sur les 4 ordinateurs personnels (compteur intégré à 55-60 FPS en conditions standard, au-dessus du minimum exigé de 30 FPS).
- **5 correctifs implémentés suite aux retours :**
  1. Clarification explicite de l'absence de serveur central à l'étape 4 (50 % des testeurs avaient initialement répondu « serveur central ») et refonte des gares.
  2. Épuration de l'intérieur des wagons dans `WagonMesh.js` (2 caisses nettes, suppression de « l'effet tunnel »).
  3. Ajout d'un encadré direct sur le rôle sécuritaire du minage et statistiques réelles vs théoriques à l'étape 5.
  4. Raccourcissement des textes et ralentissement de la course sur l'aiguillage en Y à l'étape 7.
  5. Passe de simplification du vocabulaire sur l'ensemble des étapes 0 à 7.

---

## Stack technique et architecture du dépôt

### Technologies utilisées
- **Three.js** (`^0.170.0`) : Moteur de rendu 3D WebGL (géométries procédurales low-poly, `MeshPhysicalMaterial`, `Raycaster`, `OrbitControls`, `ACESFilmicToneMapping`).
- **Vite** (`^6.0.0`) : Serveur de développement rapide et bundler ES Modules pour la production.
- **JavaScript ES6+ / HTML5 / CSS3** : Architecture modulaire sans framework tiers ni texture externe lourde pour préserver la cible >= 30 FPS.
- **GitHub Actions & GitHub Pages** : Build et déploiement continu à chaque push sur la branche `main`.

### Structure du dépôt
```text
Projet_ThreeJS_Morin_Chabalier/
├── .github/workflows/deploy.yml          # Pipeline de déploiement GitHub Pages
├── docs/
│   ├── MMI-R507-projet-blockchain-CHOIX-MODELISATION.md   # Livrable officiel (25 %)
│   ├── MMI-R507-projet-blockchain-GRILLE-AUTOEVAL.md      # Auto-évaluation avant soutenance
│   ├── PROTOCOLE-TESTS.md                # Protocole, résultats (4 testeurs) et correctifs
│   ├── SOUTENANCE.md                     # Plan minuté (20 min), script démo et plan B
│   └── suivi-hebdo/                      # Fiches hebdomadaires SEMAINE-01.md à SEMAINE-05.md
├── src/
│   ├── main.js                           # Scène WebGL, éclairage, boucle FPS et orchestration
│   ├── welcome.js                        # Écran d'accueil introductif
│   ├── cameraController.js               # Transitions caméra amorties et OrbitControls
│   ├── environment.js                    # Voies ferrées, sol nocturne et décor procédural
│   ├── train.js                          # Assemblage et gestion dynamique du convoi
│   ├── style.css                         # Charte visuelle du volet gauche et infobulles SVG
│   ├── blockchain/
│   │   ├── Block.js                      # Implémentation SHA-256 synchrone et minage avec sel
│   │   └── Blockchain.js                 # Chaînage, validation en cascade et corruption de bloc
│   ├── three/
│   │   ├── LocomotiveMesh.js             # Modèle procédural de la locomotive (Genesis #0)
│   │   └── WagonMesh.js                  # Modèle procédural du wagon vitré et molette du Nonce
│   └── steps/
│       ├── StepManager.js                # Cycle de vie enter()/update()/exit() des étapes
│       └── step0.js … step7.js           # Mise en scène et logique de chaque étape (0 à 7)
├── index.html                            # Point d'entrée HTML et structure du HUD
├── package.json                          # Dépendances Three.js et Vite
└── README.md
```

### Commandes d'installation et de build local

```bash
# 1. Cloner le dépôt
git clone https://github.com/tuthure/Projet_ThreeJS_Morin_Chabalier.git
cd Projet_ThreeJS_Morin_Chabalier

# 2. Installer les dépendances
npm install

# 3. Lancer le serveur de développement local
npm run dev

# 4. Générer et prévisualiser le build de production (plan B soutenance)
npm run build
npm run preview
```

---

## Déclaration transparente de l'usage de l'IA générative

Conformément au règlement du module R507, l'utilisation d'outils d'IA générative est documentée ci-dessous et détaillée par domaine dans la section 6 de [`CHOIX-MODELISATION.md`](docs/MMI-R507-projet-blockchain-CHOIX-MODELISATION.md) :

| Outil utilisé | Usages réalisés dans le projet | Vérification et contrôle par le binôme |
|:---|:---|:---|
| **Gemini** | Aide à l'initialisation de la structure Vite / Three.js, appui sur le découpage modulaire par étapes (`step0.js` à `step7.js`) et mise en forme Markdown des documents de suivi. | Chaque extrait proposé a été relu, adapté à notre métaphore ferroviaire et testé manuellement par le binôme. |
| **Antigravity** | Assistance sur la modélisation procédurale Three.js (gares de l'étape 4, projection vectorielle SVG des infobulles, aiguillage en Y), correctifs CSS et rédaction/audit des livrables documentaires. | Tout le code a été vérifié sur navigateur (60 FPS, zéro erreur console), les propositions superflues ont été retirées et la rédaction a été relue sans emoji. |

---

## Sources principales

- **Nakamoto, S. (2008).** *Bitcoin: A Peer-to-Peer Electronic Cash System* — https://bitcoin.org/bitcoin.pdf
- **NIST (2015).** *FIPS 180-4, Secure Hash Standard (SHS)* — https://nvlpubs.nist.gov/nistpubs/FIPS/NIST.FIPS.180-4.pdf
- **Yaga, D. et al. (2018).** *NIST IR 8202, Blockchain Technology Overview* — https://doi.org/10.6028/NIST.IR.8202
- **Bitcoin Developer Guide.** *Block Chain, P2P Network, Transactions & Mining* — https://developer.bitcoin.org/devguide/
- **Ethereum.org.** *Consensus Mechanisms (PoW & PoS) & Energy Consumption* — https://ethereum.org/en/developers/docs/consensus-mechanisms/
- **CNIL (2018).** *Blockchain et RGPD : quelles solutions pour un usage responsable en présence de données personnelles ?* — https://www.cnil.fr/fr/blockchain-et-rgpd-quelles-solutions-pour-un-usage-responsable-en-presence-de-donnees-personnelles
- **Documentation Three.js, Vite & MDN Web Crypto API** — https://threejs.org/docs/ · https://vitejs.dev/guide/
- **Anders Brownworth.** *Blockchain 101 — A Visual Demo* — https://andersbrownworth.com/blockchain/
