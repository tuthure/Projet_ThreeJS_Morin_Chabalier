# Visualisation pédagogique de la blockchain

Projet de BUT MMI 3e année — Ressource R507 : Dispositifs interactifs (Three.js).  
Conception et développement d'un dispositif 3D interactif pour vulgariser le fonctionnement de la blockchain auprès d'un public non initié.

## Binôme

- **Alban Chabalier** (@achabalier14) : Gestion de projet, conception UX/UI, ergonomie des contrôles caméra, narration pédagogique et scénarisation des interactions.
- **Arthur Morin** (@tuthure) : Architecture technique Three.js, modélisation et rendu 3D (géométries des wagons, motrice, éclairage, matériaux), logique de chaîne et intégration Vite.

## Liens utiles

- Démo interactive en ligne : https://tuthure.github.io/Projet_ThreeJS_Morin_Chabalier/
- Tableau de bord GitHub Projects : https://github.com/tuthure/Projet_ThreeJS_Morin_Chabalier/projects
- Dépôt source GitHub : https://github.com/tuthure/Projet_ThreeJS_Morin_Chabalier

---

## Public visé et objectif

Le projet s'adresse en priorité à un public non initié (lycéens, étudiants ou adultes curieux) ne disposant d'aucun bagage préalable en informatique ou en cryptographie.  
L'objectif est d'expliquer concrètement comment des individus peuvent s'accorder sur un registre d'échanges infalsifiable sans autorité centrale, en remplaçant les formules mathématiques abstraites par des métaphores visuelles et physiques immédiates.

### Le fil rouge : Le Convoi Ferroviaire Blindé

Le convoi ferroviaire circulant sur les rails incarne la blockchain :
- **La locomotive autonome** : Elle avance sans conducteur à bord. Elle obéit strictement aux règles programmées du réseau que nul ne peut soudoyer.
- **Les wagons vitrés (les blocs)** : Leurs parois transparentes permettent à tout observateur sur le quai de consulter les transactions publiques scellées à l'intérieur.
- **L'attelage magnétique (le Hash et PreviousHash)** : La liaison entre chaque wagon repose sur la concordance exacte des signatures lumineuses entre l'anneau arrière du wagon parent et le crochet avant du wagon fils.
- **La rupture mécanique (l'effet avalanche)** : Altérer une marchandise dans un wagon ancien change aussitôt la signature de sortie. La discordance de couleur avec le wagon suivant décroche l'attelage et plonge toute la suite du train en alerte rouge.
- **Les voies parallèles et aiguilleurs (le réseau décentralisé)** : Plusieurs voies cheminent de concert, chacune tenue par un aiguilleur autonome qui compare et synchronise son convoi avec ses pairs.

---

## Notions abordées et interactions 3D

| Notion obligatoire | Métaphore ferroviaire | Interaction 3D concrète |
|:---|:---|:---|
| 1. Structure d'un bloc | Wagon vitré, plaques d'immatriculation et molette latérale | Saisie libre de transactions avec réaction physique du cargo en 3D, visualisation du Hash / PreviousHash et rotation manuelle de la molette du Nonce sur le châssis. |
| 2. Chaînage cryptographique | Attelage magnétique scellant les wagons par concordance de signature | Cadrage rapproché sur le faisceau énergétique reliant l'anneau arrière du bloc 0 à l'anneau avant du bloc 1 ; mise en évidence de la correspondance de couleur cyan. |
| 3. Immutabilité et détection de falsification | Décrochage mécanique et effet avalanche en cascade | Falsification d'une transaction dans le bloc 0 : son anneau arrière vire au jaune, provoquant la rupture mécanique avec l'anneau cyan du bloc 1 et la bascule au rouge alerte du convoi. |
| 4. Réseau et décentralisation | Voies ferrées parallèles surveillées par des cabines d'aiguilleurs | Vue panoramique sur plusieurs voies simultanées représentant les nœuds pairs, avec propagation des wagons validés sans autorité centrale. |
| 5. Validation et minage (PoW) | Effort mécanique de chauffe et recherche de la bonne encoche | Rotation de la molette du Nonce jusqu'à satisfaire la difficulté imposée par le réseau, déclenchant l'accrochage d'un nouveau wagon au train. |
| 6. Comparaison de mécanismes de consensus | Motrice thermique à charbon (PoW) face à la caution d'aiguillage (PoS) | Confrontation visuelle entre dépense continue d'énergie de calcul (PoW) et mise sous séquestre de jetons de caution par les validateurs (PoS). |
| 7. Cycle de vie et tentative d'attaque | Colis en attente sur le quai (mempool), chargement et rejet de double dépense | Parcours guidé d'une transaction depuis la salle d'attente jusqu'à son inclusion dans un wagon scellé, avec démonstration du rejet d'une tentative de double émission. |

---

## Jalons et gestion de projet

Le projet s'articule autour des 4 jalons imposés dans le cadre du BUT MMI :

| Jalon | Date limite | Description des livrables attendus |
|:---|:---|:---|
| Jalon 1 — Cadrage et initialisation | 09/10/2026 | Rôles de l'équipe, métaphore choisie, dépôt GitHub, GitHub Projects Kanban et scène Three.js initiale. |
| Jalon 2 — Prototype fonctionnel interactif | 15/11/2026 | Code source finalisé, les 7 notions intégrées avec interactions 3D concrètes, documentation et démo en ligne. |
| Jalon 3 — Répétition finale | 19/11/2026 (9h30 - 11h) | Répétition générale inter-groupes, tests croisés et derniers ajustements ergonomiques. |
| Jalon 4 — Soutenance finale | 19/11/2026 (11h - 12h30) | Présentation orale de 20 minutes devant les enseignants avec démo interactive et justification des choix techniques. |

---

## Critères de qualité et performances

- **Fluidité et performance graphique** : L'application maintient 60 FPS constants sur machine standard (objectif minimal de 30 FPS largement respecté) grâce à l'utilisation de BufferGeometry partagées, de matériaux low-poly optimisés et à l'élimination des calculs superflus dans la boucle de rendu.
- **Ergonomie de navigation** : Contrôleur de caméra cinématique fluide assurant des transitions douces entre les étapes pédagogiques, avec possibilité d'inspection libre (orbite, zoom, panoramique).
- **Sobriété de l'interface** : Volet latéral épuré sans badges artificiels ni jargon superflu, structuré autour d'actions directes et de synthèses pédagogiques claires.
- **Tests utilisateurs prévus** : Deux sessions formelles de tests utilisateurs seront conduites auprès de personnes extérieures au projet afin de mesurer l'efficacité de la transmission pédagogique et d'affiner l'ergonomie.

---

## Déclaration relative à l'usage de l'IA générative

Conformément aux exigences de transparence académique, ce projet a eu recours à l'assistance d'outils d'IA générative dans un cadre strictement documenté et supervisé :

| Outil d'IA | Cadre d'utilisation | Intervention et contrôle du binôme |
|:---|:---|:---|
| Gemini (Google) | Recherche documentaire initiale, élaboration des squelettes algorithmiques de hachage SHA-256 en JavaScript pur, relecture des fiches de cadrage et de suivi hebdomadaire. | Chaque proposition algorithmique a été relue, adaptée aux contraintes pédagogiques du convoi et intégrée manuellement dans l'arborescence du projet. |
| Antigravity (Google DeepMind) | Assistance au prototypage de la scène Three.js, calculs des matrices de transformation spatiale pour la rotation 3D de la molette et automatisation des commandes de synchronisation GitHub CLI. | L'ensemble du code produit a été testé localement, refactorisé pour respecter la charte sobre (zéro émoji, performances > 30 FPS) et validé sur le dépôt distant. |

---

## Stack technique

- **Three.js** (r128+) : Moteur de rendu WebGL 3D dans le navigateur.
- **Vite** : Environnement de développement et outil de bundling optimisé.
- **HTML5 & CSS3** : Interface utilisateur 2D en superposition (HUD) responsive et accessible.
- **GitHub Actions & Pages** : Pipeline CI/CD automatisé déployant le projet lors de chaque commit sur `main`.

---

## Installation et exécution locale

### Prérequis
- Node.js (version 18 ou supérieure recommandée)
- Gestionnaire de paquets npm

### Instructions

1. Cloner le dépôt :
```bash
git clone https://github.com/tuthure/Projet_ThreeJS_Morin_Chabalier.git
cd Projet_ThreeJS_Morin_Chabalier
```

2. Installer les dépendances :
```bash
npm install
```

3. Lancer le serveur local de développement :
```bash
npm run dev
```

4. Compiler pour la production :
```bash
npm run build
```
Les fichiers packagés sont générés dans le répertoire `dist/`.
