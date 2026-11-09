# Visualisation pédagogique de la blockchain — Le Convoi Ferroviaire Blindé

Projet de BUT MMI 3e année — Ressource R507 : Dispositifs interactifs (Three.js).  
Conception et développement d'une expérience web interactive en 3D avec Three.js visant à faire comprendre le fonctionnement d'une blockchain à un utilisateur non initié.

---

## Équipe et répartition des rôles

- **Arthur Morin** (`@tuthure`) : Architecture technique Three.js, modélisation procédurale 3D (locomotive, wagons vitrés, archipel de gares, aiguillages), animations mécaniques, logique cryptographique et intégration Vite.
- **Alban Chabalier** (`@achabalier14`) : Gestion de projet (GitHub Projects, jalons, suivis hebdomadaires), conception UX/UI, ergonomie des contrôles caméra, scénarisation pédagogique des 7 notions et protocole de tests utilisateurs.

## Liens du projet

- **Démo interactive en ligne (GitHub Pages)** : https://tuthure.github.io/Projet_ThreeJS_Morin_Chabalier/
- **Tableau de bord GitHub Projects (Kanban)** : https://github.com/tuthure/Projet_ThreeJS_Morin_Chabalier/projects
- **Dépôt GitHub** : https://github.com/tuthure/Projet_ThreeJS_Morin_Chabalier
- **Formulaire de tests utilisateurs** : https://forms.gle/SrQx1cJVSrnMt7sc9
- **Livrable des choix de modélisation** : [`docs/MMI-R507-projet-blockchain-CHOIX-MODELISATION.md`](docs/MMI-R507-projet-blockchain-CHOIX-MODELISATION.md)
- **Protocole de test utilisateur** : [`docs/PROTOCOLE-TESTS.md`](docs/PROTOCOLE-TESTS.md)
- **Grille d'auto-évaluation** : [`docs/MMI-R507-projet-blockchain-GRILLE-AUTOEVAL.md`](docs/MMI-R507-projet-blockchain-GRILLE-AUTOEVAL.md)

---

## Public cible et objectif pédagogique

Le dispositif s'adresse à un **utilisateur non initié** (personne extérieure au groupe, n'ayant pas suivi le cours R507 et ne recevant **aucune explication orale préalable**).  
L'objectif de médiation scientifique consiste à traduire les concepts abstraits de la blockchain en représentations spatiales, animées et interactives à travers une métaphore fil rouge cohérente : **Le Convoi Ferroviaire Blindé**.

### Principe de la métaphore ferroviaire

- **La locomotive de tête (Protocole et bloc Genesis #0)** : Elle ouvre la marche sans conducteur central et applique les règles mathématiques du réseau.
- **Les wagons vitrés (Les blocs)** : Leurs parois transparentes permettent à chacun de vérifier les cargaisons (transactions) transportées à l'intérieur, tout en restant scellées.
- **L'attelage magnétique coloré (Hash et PreviousHash)** : Chaque wagon possède une plaque d'empreinte centrale (son Hash) et un crochet avant (PreviousHash). L'attelage entre deux wagons ne se verrouille que si la couleur et le code du crochet avant correspondent exactement à l'anneau arrière du wagon précédent.
- **La molette latérale crantée (Le Nonce)** : Un engrenage mécanique rotatif fixé sur le châssis du wagon permet de faire varier le Nonce cran par cran pour modifier l'empreinte du bloc lors du minage.
- **L'archipel de gares (Le réseau décentralisé)** : Six gares autonomes réparties sur le territoire maintiennent chacune une copie complète du train et se transmettent les nouveaux wagons de proche en proche.

---

## Les 7 notions obligatoires et interactions 3D associées

Chaque notion obligatoire du programme est traduite par une mise en scène spatiale et une interaction directe dans la scène Three.js :

| # | Notion obligatoire (formulation officielle) | Métaphore ferroviaire | Interaction 3D codée dans l'application |
|:---:|:---|:---|:---|
| **0** | *Sas d'accueil et introduction* | Vue panoramique d'un convoi de 10 wagons en circulation nocturne | Découverte libre du train en mouvement et présentation des 3 piliers (locomotive, wagons, attelages) avant d'entrer dans le parcours. |
| **1** | **Structure d'un bloc** : données, hash du bloc, hash du bloc parent et, si pertinent, nonce | Anatomie d'un wagon blindé à parois vitrées | Inspection à 360 degrés avec 4 infobulles 3D reliées en SVG aux composants physiques ; modification du chargement (transactions) et rotation de la molette du Nonce recalculant en direct l'empreinte SHA-256. |
| **2** | **Chaînage cryptographique** : hash/empreinte cryptographique, lien avec le bloc parent et effet de la moindre modification | Attelage magnétique par concordance de signature entre wagons consécutifs | Vue panoramique des liaisons entre wagons avec infobulles comparatives montrant l'égalité entre le Hash du bloc parent et le PreviousHash du bloc enfant ; ajout interactif de nouveaux wagons au convoi. |
| **3** | **Immutabilité et détection de falsification** : une modification rend les empreintes incohérentes et doit être détectable par les autres nœuds | Altération frauduleuse d'une cargaison provoquant le décrochage mécanique en cascade | Modification du chargement du Wagon #1 : son Hash change immédiatement de valeur et de couleur, brisant la concordance avec l'attache du Wagon #2 et faisant basculer la suite du convoi en alerte rouge. |
| **4** | **Réseau et décentralisation** : nœuds, copies distribuées et propagation des transactions/blocs, sans centre unique | Archipel de 6 gares autonomes (Gares A à F) hébergeant chacune une copie du train | Déclenchement d'une propagation pair-à-pair (protocole Gossip de proche en proche), clic direct en 3D sur une gare pour simuler une panne de nœud avec contournement automatique, et simulation d'une tricherie locale rejetée par la majorité. |
| **5** | **Validation et minage** : vérification d'une transaction ou d'un bloc et, dans le cas du proof of work (PoW), recherche d'un nonce sous contrainte de difficulté | Effort mécanique sur la molette d'un wagon candidat pour aligner les zéros requis | Réglage de la difficulté (1, 2 ou 3 zéros exigés en tête du Hash), clic direct en 3D sur la molette crantée du Wagon #2 candidat (1 essai = +1 cran de 45 degrés) ou lancement du minage automatique jusqu'au verrouillage de l'attelage. |
| **6** | **Comparaison d'au moins deux mécanismes de consensus** : proof of work (PoW) et proof of stake (PoS), différences, avantages et limites | Course simultanée de 3 molettes (PoW) face au tirage au sort sur caution (PoS) entre 3 gares | Bascule interactive sur les 3 gares (50 %, 35 %, 15 %) : en PoW, les 3 molettes tournent simultanément et 2 gares dépensent leur énergie en pure perte ; en PoS, une loterie pondérée par la caution désigne une seule gare qui tourne son unique molette sans gaspillage énergétique. |
| **7** | **Cycle de vie d'une transaction et scénario d'attaque illustré** : création, propagation, validation, inclusion dans un bloc, confirmation, puis illustration d'une attaque et de sa détection/limitation | Aiguillage symétrique en Y opposant la chaîne des gares honnêtes à une branche pirate (attaque des 51 %) | Simulation de course d'assemblage de wagons après le Wagon #1 selon deux modes : cas normal (pirate à 20 % battu par les 80 % du réseau, sa branche est abandonnée sur voie de garage) et attaque des 51 % (pirate majoritaire à 60 % assemblant plus vite la chaîne la plus longue qui s'attache au rail central). |

---

## Calendrier et jalons officiels

Le suivi du projet s'appuie sur les jalons définis dans le sujet officiel R507 et configurés sous forme de *Milestones* dans GitHub Projects :

| Jalon / échéance | Date et heure (2026) | Livrable ou attendu |
|:---|:---|:---|
| **Présentation du projet** | 1er octobre 2026 | Lancement du sujet et prise en main des documents de référence. |
| **Cadrage, groupes, dépôt et GitHub Projects créés** | 9 octobre 2026, 17h | Groupes de 2 ou 3, dépôt GitHub, board GitHub Projects à 5 colonnes et premières issues. |
| **Livraison du projet** | 15 novembre 2026, 23h59 | Dépôt GitHub complet, GitHub Projects à jour, documentation officielle et démo en ligne fonctionnelle. |
| **Répétition finale** | 19 novembre 2026, 9h30 - 11h | Répétition générale croisée entre les différents groupes. |
| **Soutenance** | 19 novembre 2026, 11h - 12h30 | Soutenance finale de 20 minutes par groupe avec démonstration interactive. |

---

## Critères de qualité et performances

- **Fluidité graphique (objectif >= 30 FPS)** : Le parcours principal est conçu pour maintenir entre 55 et 60 FPS sur un ordinateur standard de salle de TP (au-delà du seuil minimal exigé de 30 FPS). Cet objectif est atteint grâce au partage des instances `BufferGeometry`, à l'emploi de matériaux standards sobres et au nettoyage systématique des groupes 3D et écouteurs d'événements lors des changements d'étape (`exit()`).
- **Compréhension en autonomie** : L'interface combine un volet pédagogique structuré à gauche (avec marque-pages numérotés de 0 à 7) et des infobulles contextuelles 3D reliées par des pointeurs vectoriels SVG aux pièces exactes du train.
- **Validation par tests utilisateurs** : Évaluation du dispositif auprès d'au moins 2 personnes extérieures au groupe et non initiées à la blockchain, sans intervention orale pendant la découverte.

---

## Tests utilisateurs

Pour évaluer la clarté de la métaphore ferroviaire et l'ergonomie des interactions auprès d'un public non initié, un protocole de test et un questionnaire de recueil ont été mis en place :

- **Lien du formulaire public Google Forms** : https://forms.gle/SrQx1cJVSrnMt7sc9
- **Protocole détaillé pour l'animateur** : disponible dans [`docs/PROTOCOLE-TESTS.md`](docs/PROTOCOLE-TESTS.md).

---

## Déclaration d'usage de l'IA générative

Conformément aux consignes du projet R507, l'utilisation d'outils d'intelligence artificielle générative est déclarée ci-dessous de manière transparente :

| Outil utilisé | Usages réalisés dans le projet | Vérification et contrôle par le binôme |
|:---|:---|:---|
| **Gemini** | Aide à l'initialisation de la structure Vite / Three.js, appui sur la structuration modulaire du code (découpage par étapes) et mise en forme Markdown des documents de suivi. | Chaque extrait proposé a été relu, compris, adapté à notre métaphore du convoi ferroviaire et vérifié manuellement par les deux membres du groupe. |
| **Antigravity** | Assistance sur l'architecture du code JavaScript/Three.js (positionnement spatial des composants 3D, projection des infobulles SVG), structuration des fichiers Markdown et synchronisation du suivi GitHub Projects. | Tout le code intégré a été testé localement sur navigateur, corrigé pour garantir la fluidité à plus de 30 FPS et le respect strict des consignes (zéro emoji, sobriété éditoriale). |

---

## Stack technique et installation locale

### Technologies utilisées

- **Three.js** (`^0.170.0`) : Moteur de rendu 3D WebGL (scène, éclairage, matériaux physiques et standards, Raycaster, OrbitControls).
- **Vite** (`^5.4.10`) : Serveur de développement rapide et bundler de production.
- **JavaScript ES6+ / HTML5 / CSS3** : Architecture modulaire sans framework lourd pour préserver les performances.
- **GitHub Actions & GitHub Pages** : Déploiement continu automatisé à chaque push sur la branche `main`.

### Commandes d'installation et de build

1. **Cloner le dépôt** :
```bash
git clone https://github.com/tuthure/Projet_ThreeJS_Morin_Chabalier.git
cd Projet_ThreeJS_Morin_Chabalier
```

2. **Installer les dépendances** :
```bash
npm install
```

3. **Lancer le serveur de développement local** :
```bash
npm run dev
```

4. **Générer le build de production** :
```bash
npm run build
```

5. **Prévisualiser le build de production localement** :
```bash
npm run preview
```
