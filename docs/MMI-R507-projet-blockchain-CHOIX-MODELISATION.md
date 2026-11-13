# BUT MMI 3e année — R507

## Projet Three.js — Visualisation pédagogique de la blockchain

### `MMI-R507-projet-blockchain-CHOIX-MODELISATION.md` — livrable officiel

Ce document constitue le livrable officiel de cadrage et de justification des choix de modélisation pour le projet de visualisation pédagogique de la blockchain avec Three.js (**Le Convoi Ferroviaire Blindé**). Il rassemble les partis pris scénaristiques, visuels, techniques et ergonomiques retenus pour permettre à un public non initié de comprendre les 7 notions obligatoires en autonomie complète.

## 1. Informations générales

| Champ | Contenu |
|:---|:---|
| Groupe | Binôme Arthur Morin (`@tuthure`) & Alban Chabalier (`@achabalier14`) |
| Membres et rôles | **Alban Chabalier** (`@achabalier14`) : Gestion de projet (GitHub Projects, jalons, suivi hebdomadaire), conception UX/UI (HUD latéral, infobulles), ergonomie caméra, narration pédagogique des 7 notions et protocole de tests.<br>**Arthur Morin** (`@tuthure`) : Architecture technique Three.js, modélisation procédurale 3D (locomotive, wagons vitrés, gares, aiguillages), animations mécaniques, logique cryptographique (`Block.js`, `Blockchain.js`) et intégration Vite. |
| Public cible | Utilisateur non initié (personne extérieure au groupe, n'ayant pas suivi le cours R507 et ne recevant aucune explication orale préalable). |
| Lien vers la démo en ligne | https://tuthure.github.io/Projet_ThreeJS_Morin_Chabalier/ |
| Lien vers GitHub Projects | https://github.com/tuthure/Projet_ThreeJS_Morin_Chabalier/projects |
| Lien du formulaire de test | https://forms.gle/SrQx1cJVSrnMt7sc9 |
| Livrables associés | [`PROTOCOLE-TESTS.md`](PROTOCOLE-TESTS.md) · [`SOUTENANCE.md`](SOUTENANCE.md) · [`MMI-R507-projet-blockchain-GRILLE-AUTOEVAL.md`](MMI-R507-projet-blockchain-GRILLE-AUTOEVAL.md) · [`docs/suivi-hebdo/`](suivi-hebdo/) |
| Version et date de mise à jour | v1.1 — 13/11/2026 (densification complète des 7 fiches notions, synthèse des tests utilisateurs à 4,25/5 et bibliographie primaire annotée) |

---

## 2. Univers visuel et métaphore principale

### 2.1 Public cible et objectifs pédagogiques
Le dispositif s'adresse à un public étudiant ou grand public sans bagage technique préalable en cryptographie ou en systèmes distribués, découvrant l'application en autonomie complète sans commentaire oral.
À l'issue du parcours interactif (de l'écran d'accueil jusqu'à l'étape 7), l'utilisateur doit pouvoir :
- Comprendre qu'une blockchain fonctionne comme un réseau ferroviaire public géré collectivement, sans compagnie centrale ni chef de gare unique.
- Identifier les quatre composants essentiels d'un bloc (données, hash, previousHash, nonce) et comprendre que le hash est calculé de façon déterministe à partir du contenu.
- Visualiser comment l'empreinte cryptographique (`previousHash`) lie chaque bloc à son parent dans un ordre chronologique strict.
- Constater pourquoi la moindre altération d'un bloc passé brise l'attelage en aval et devient détectable par tous les autres nœuds (immutabilité pratique).
- Appréhender la décentralisation à travers un réseau pair-à-pair de gares autonomes résistant aux pannes isolées et aux copies falsifiées.
- Comprendre le rôle du minage en Proof-of-Work (recherche par essais-erreurs d'un Nonce sous contrainte de difficulté) et son asymétrie avec la vérification.
- Comparer les mécanismes de consensus Preuve de Travail (PoW) et Preuve d'Enjeu (PoS) en termes d'énergie et de sélection.
- Suivre le cycle de vie complet d'une transaction et comprendre la règle de la chaîne la plus longue face à une attaque des 51 %.

### 2.2 Métaphore retenue : Le Convoi Ferroviaire Blindé
Nous avons retenu la métaphore d'un **convoi ferroviaire blindé à parois vitrées** circulant à travers un réseau de gares interconnectées :
- **L'Étape 0 — Le Réseau Ferroviaire Public (`step0.js` et `welcome.js`)** : Sas d'entrée introductif présentant le train complet en mouvement. Aucune compagnie centrale ni aucun chef de gare unique ne dirige ces rails : le réseau est entretenu et vérifié collectivement par toutes les gares présentes le long de la ligne.
- **La locomotive de tête (Bloc Genesis #0 et protocole)** : Elle ouvre la marche sur le rail principal et impose les règles mathématiques partagées du réseau.
- **Chaque wagon vitré représente un bloc** : Ses parois translucides laissent voir les caisses de marchandises (les transactions) afin de rappeler que la blockchain est un registre public lisible par tous, tout en empêchant une modification discrète de son chargement.
- **L'attelage magnétique coloré représente le chaînage cryptographique** : L'anneau arrière du wagon parent porte la couleur et le code de son Hash, tandis que le crochet avant du wagon suivant porte ce même code en tant que `previousHash`. L'attelage ne reste verrouillé que si les deux empreintes et les deux couleurs concordent.
- **La rupture mécanique d'attelage illustre la détection de falsification** : Altérer une cargaison dans un wagon déjà attelé recalcule immédiatement son Hash. Sa couleur d'anneau arrière change (jaune ambre), créant une discordance évidente avec le crochet avant du wagon suivant resté sur l'ancienne signature cyan : l'attelage décroche physiquement et les wagons suivants basculent en alerte rouge.
- **L'archipel de gares autonomes modélise la décentralisation** : Six gares ferroviaires de taille identique réparties sur le territoire maintiennent chacune sur leur quai une copie complète du train et se relaient les nouveautés de proche en proche, sans gare centrale.
- **La molette latérale crantée du Nonce figure le minage (PoW)** : Pour gagner le droit d'atteler un wagon candidat, la gare-atelier doit faire tourner la molette crantée du Nonce cran par cran jusqu'à trouver un Hash respectant le nombre de zéros imposé par la difficulté.

### 2.3 Justification pédagogique et limites
| Question | Réponse et analyse |
|:---|:---|
| Quelles propriétés deviennent évidentes ? | L'ordre chronologique strict des blocs (gauche vers droite), la dépendance directe de chaque bloc envers le Hash de son parent, la propagation en cascade d'une falsification sur la suite du convoi, l'absence de point central dans un réseau de gares, le caractère itératif et coûteux du minage face à la simplicité de la vérification, ainsi que l'arbitrage par la chaîne la plus longue sur un aiguillage en Y. |
| Quelles propriétés sont difficiles à représenter ou risquent d'être déformées ? | 1. **Confusion entre transparence et chiffrement** : des parois vitrées et un « sceau » peuvent laisser croire soit que les données sont secrètes, soit qu'un attelage est une simple attache matérielle qu'on pourrait recoller.<br>2. **Encombrement visuel des cargaisons** : lors des premiers tests, l'accumulation d'éléments à l'intérieur des wagons créait un « effet tunnel » gênant la lecture.<br>3. **Échelle de temps et taille du réseau** : un vrai réseau compte des milliers de nœuds et exige des milliards de milliards d'essais par bloc, là où une démonstration interactive doit répondre en quelques secondes avec 6 gares lisibles.<br>4. **Nature discrète des blocs** : un train évoque un mouvement continu alors que les blocs sont scellés par lots discrets. |
| Comment ces limites sont-elles compensées ? | 1. La formule déterministe `SHA-256(Index + Parent + Cargaison + Nonce)` et les chaînes hexadécimales réelles calculées par `sha256Sync()` sont affichées en temps réel sur les infobulles 3D et dans le panneau latéral.<br>2. L'intérieur des wagons (`WagonMesh.js`) a été épuré pour n'afficher que deux caisses espacées et une verrière allégée.<br>3. L'étape 5 affiche côte à côte le nombre d'essais réels et la moyenne mathématique théorique (`16`, `256`, `4 096` essais), tandis que les textes rappellent l'échelle réelle du réseau Bitcoin.<br>4. À l'étape 5, le wagon candidat reste immobilisé en attente à distance (`x = 8.55`) et ne vient s'atteler qu'au moment précis où le Nonce gagnant est trouvé. |

### 2.4 Métaphores écartées
| Métaphore envisagée | Points forts | Pourquoi écartée |
|:---|:---|:---|
| Coffres-forts dans une salle d'archives | Bonne représentation du scellement et de la sécurité | Convoque involontairement l'imaginaire d'une banque centrale unique et manque de dynamisme mécanique dans un espace 3D. |
| Cubes abstraits flottants dans le vide | Esthétique épurée et rapide à modéliser | Trop abstrait pour un public non initié ; ne transmet pas l'intuition physique d'un attelage mécanique qui résiste ou se décroche ni celle d'un aiguillage. |
| Registre comptable papier tamponné | Fidèle à l'analogie comptable du grand livre | Difficile à mettre en scène dans une caméra orbitale dynamique et peu propice à la démonstration de la décentralisation territoriale ou de la course de deux branches. |

### 2.5 Charte visuelle
| Élément | Choix retenu | Justification pédagogique |
|:---|:---|:---|
| Palette et signification des couleurs | Fond nocturne bleu ardoise (`#0c192e`), châssis acier sombre (`#1e293b`), parois vitrées translucides, vert émeraude (`#10b981`) pour un wagon et un attelage valides, jaune ambre (`#f59e0b`) pour un bloc modifié ou en attente de minage, rouge signalisation (`#ef4444`) pour la rupture d'attelage et les blocs invalidés. Couleur dédiée dérivée du Hash (`hashToColorHex`) sur les anneaux d'attelage. | Double codage visuel : couleurs fonctionnelles constantes (vert = valide, ambre = altération/activité, rouge = rupture/alerte) complétées par une couleur d'empreinte unique dérivée du Hash réel, permettant de repérer immédiatement la concordance ou la divergence entre deux anneaux voisins. |
| Formes, style et niveau d'abstraction | Modélisation procédurale low-poly lisible : locomotive identifiable, wagons vitrés laissant voir deux caisses de marchandises épurées, molette crantée octogonale sur le flanc, gares complètes (quai, bâtiment brique/verre, horloge, signalisation) sur un territoire dégagé. | Assure une identification immédiate de chaque organe fonctionnel tout en garantissant une fluidité constante entre 55 et 60 FPS sans chargement d'assets lourds externes. |
| Éclairage et ambiance | Ambiance nocturne avec brouillard lointain (`Fog` bleu ardoise), éclairage trois points (`ambientLight`, `keyLight` cyan, `rimLight` ambré), `ACESFilmicToneMapping` et halos émissifs sur les anneaux magnétiques et les voies de propagation. | Dirige naturellement le regard de l'utilisateur vers les zones actives (attelages, molettes, liaisons entre gares) sans éblouissement. |
| Typographie et lisibilité | Police sans-serif sobre pour les explications du volet gauche ; police à chasse fixe (monospace) pour les empreintes hexadécimales SHA-256, les formules de hachage et les compteurs de Nonce. | Facilite la lecture caractère par caractère des préfixes de zéros (`0`, `00`, `000`) et la comparaison directe entre `Hash` et `previousHash`. |
| Échelle et rapport de taille | Wagons de 2.4 unités de long espacés régulièrement sur l'axe X (`WAGON_SPACING`) ; infobulles HTML/SVG projetées en 2D à partir des coordonnées 3D exactes des pièces. | Garantit que les étiquettes restent parfaitement lisibles et jamais superposées au texte 3D quel que soit l'angle d'orbite choisi. |
| Mouvement et mécanique causale | Transitions caméra amorties (`cameraController.moveTo`), rotation crantée stricte (`1 essai = +1 cran de 45 degrés`), recul physique du Wagon #2 sur les rails lors d'une falsification (étape 3), impulsions séquentielles de gare en gare (étape 4), translation latérale de la branche gagnante vers le rail central sur l'aiguillage en Y (étape 7). | Chaque mouvement porte un sens technique exact et remplace de longs paragraphes par un lien causal visuellement observable. |
| Accessibilité, lisibilité et ergonomie | **Double codage systématique** : chaque état coloré (vert/ambre/rouge) est toujours accompagné d'un libellé explicite (`VALIDE`, `MODIFIÉ`, `ROMPU`, `HORS LIGNE`, `REJETÉ`) et du code hexadécimal afin de rester compréhensible pour les utilisateurs daltoniens. **Redondance des contrôles** : toute action 3D cliquable par Raycaster (molette du Nonce, mise en panne d'une gare, inspection) possède un bouton équivalent dans le volet gauche. | Un utilisateur novice ou gêné par une manipulation 3D peut tout accomplir depuis le panneau latéral sans jamais rester bloqué. |

---

## 3. Caméra, espace et navigation

| Question | Réponse et justification |
|:---|:---|
| Caméra libre, guidée ou mixte ? | **Caméra mixte** : chaque changement d'étape déclenche un déplacement cinématique amorti (`cameraController.moveTo`) vers le point d'intérêt adapté à la notion, puis laisse à l'utilisateur la liberté d'orbiter à 360 degrés et de zoomer via `OrbitControls` (avec limites d'élévation pour éviter de passer sous les rails). |
| Comment l'utilisateur sait-il où regarder ? | Outre le recadrage automatique, des **infobulles 3D reliées par des pointeurs vectoriels SVG** (`updateTooltipsPosition`) désignent avec précision les pièces concernées (plaque de Hash, crochet `previousHash`, molette du Nonce, gares, compteurs d'essais). |
| Organisation spatiale et signification des positions | Sur les étapes ferroviaires (`0`, `1`, `2`, `3`, `5`, `7`), le train est aligné sur l'axe X de gauche à droite. Sur l'étape `4`, la scène s'ouvre sur un **territoire décentralisé** étalé dans le plan XZ regroupant 6 gares autonomes afin de dissocier visuellement la topologie réseau d'une ligne unique. Sur l'étape `6`, 3 gares sont alignées symétriquement face au convoi pour comparer PoW et PoS à parts égales. |
| Représentation du temps | Le sens de lecture de gauche à droite représente l'axe chronologique : la locomotive Genesis (#0) est à gauche, suivie du Wagon #1, du Wagon #2 et des wagons candidats ajoutés à droite. |
| Passage d'une notion à l'autre | Double navigation sur le volet gauche : boutons progressifs « Étape suivante » / « Étape précédente » en bas du panneau, complétés par des **marque-pages numérotés de 0 à 7** fixés en permanence pour accéder directement à n'importe quelle notion (utile en démonstration et en soutenance). |
| Fluidité, performances WebGL (>= 30 FPS) et gestion mémoire | Maintien constant entre **55 et 60 FPS** (mesuré en continu par le compteur `#fps-counter` intégré à l'écran). Cet objectif est assuré par une modélisation 100 % procédurale low-poly (`BoxGeometry`, `CylinderGeometry`, `TorusGeometry`) sans modèles `.gltf` ni textures matricielles externes, un `pixelRatio` plafonné à `2`, la suppression d'un maillage circulaire filaire parasite sur la locomotive à l'étape 5, et un nettoyage systématique (`exit()`, arrêt des intervalles et boucles d'animation) orchestré par `StepManager.js` à chaque transition. |

---

## 4. Fiches des 7 notions obligatoires

### Correspondance synthétique entre notions, modules et sources

| Notion officielle | Étape | Module source | Interaction 3D et calcul réel | Sources associées |
|:---|:---:|:---|:---|:---|
| *Introduction et cadrage* | **0** | `welcome.js`, `step0.js` | Découverte panoramique du convoi et des 3 piliers | `[S1]`, `[S3]`, `[S10]` |
| **1. Structure d'un bloc** | **1** | `step1.js`, `Block.js` | Inspection 360°, modification de cargaison et molette Nonce (`sha256Sync`) | `[S1]`, `[S2]`, `[S9]`, `[S10]` |
| **2. Chaînage cryptographique** | **2** | `step2.js`, `Blockchain.js` | Vérification multi-jonctions et attelage de nouveaux wagons | `[S1]`, `[S2]`, `[S4]`, `[S9]` |
| **3. Immutabilité et détection de falsification** | **3** | `step3.js`, `Blockchain.js` | Falsification du Wagon #1, changement d'anneau et décrochage en cascade (`getBlockValidityList`) | `[S1]`, `[S2]`, `[S7]` |
| **4. Réseau et décentralisation** | **4** | `step4.js` | Propagation Gossip séquentielle sur 6 gares, panne au clic et rejet de copie pirate | `[S1]`, `[S3]`, `[S4]`, `[S7]` |
| **5. Validation et minage (PoW)** | **5** | `step5.js`, `Block.js` | Clic sur molette 3D (`+1` cran = `+1` essai) et boucle réelle `mineBlock()` avec stats | `[S1]`, `[S4]`, `[S5]` |
| **6. Comparaison PoW vs PoS** | **6** | `step6.js` | Course simultanée des 3 gares (PoW) vs loterie pondérée + validation unique (PoS) | `[S4]`, `[S5]`, `[S6]` |
| **7. Cycle de vie et attaque des 51 %** | **7** | `step7.js` | Aiguillage en Y : course 20 % vs 80 % puis 60 % vs 40 % (règle de la chaîne la plus longue) | `[S1]`, `[S4]`, `[S5]`, `[S9]` |

---

### 4.1 — Structure d'un bloc : données, hash du bloc, hash du bloc parent et, si pertinent, nonce

**Issues liées :** #6, #7  
**Séquence(s) concernée(s) :** Étape 1 (`src/steps/step1.js`, `src/blockchain/Block.js`)

#### a) Objectif pédagogique
> L'utilisateur doit comprendre qu'un bloc n'est pas une boîte noire opaque, mais un conteneur structuré réunissant quatre composants précis : les **données** transportées (transactions), l'**empreinte du bloc parent** (`previousHash`), un compteur d'ajustement (**Nonce**) et l'**empreinte cryptographique propre du bloc** (`Hash`), recalculée de façon déterministe dès que l'un des trois premiers éléments change.

#### b) Risque de mauvaise compréhension
> L'utilisateur ne doit pas croire que le Hash chiffre ou cache le contenu du wagon (les vitres transparentes montrent au contraire que les transactions sont lisibles par tous), ni que le Hash est un identifiant attribué au hasard, ni que tourner la molette du Nonce modifie les marchandises à l'intérieur.

#### c) Représentation choisie
| Dimension | Choix | Pourquoi ce choix sert la compréhension |
|:---|:---|:---|
| Forme / géométrie | Wagon blindé à parois vitrées entouré de 4 infobulles 3D reliées par des lignes SVG aux 4 organes physiques : caisses de marchandises à l'intérieur, crochet avant (`previousHash`), molette crantée sur le flanc (`Nonce`) et plaque centrale (`Hash`). | Associe chaque notion abstraite à une pièce mécanique localisable sur le wagon. |
| Taille et échelle | Cadrage rapproché sur le Wagon #1 isolé avec la locomotive (#0) visible en amorce à sa gauche. | Évite la surcharge visuelle en concentrant l'attention sur l'anatomie d'un seul bloc. |
| Couleur / matériau / texture | Parois en verre physique translucide (`MeshPhysicalMaterial`) laissant apparaître deux caisses de fret épurées, anneau arrière prenant dynamiquement la couleur issue du Hash réel (`hashToColorHex`). | Illustre la visibilité publique d'un bloc tout en donnant une traduction visuelle immédiate aux changements de signature hexadécimale. |
| Position | Wagon #1 centré face à la caméra avec orbite libre à 360 degrés. | Encourage l'utilisateur à inspecter l'avant (crochet), le flanc (molette) et l'arrière (anneau). |
| Mouvement / animation | Modification visuelle des caisses lors d'un changement de fret et rotation crantée de 45 degrés de la molette lors de l'incrémentation du Nonce. | Établit une correspondance immédiate entre l'action utilisateur et le composant concerné. |
| Interaction et retour visuel | Boutons directs dans le volet gauche (« Modifier la cargaison » et « Tourner la molette du Nonce (+1) »), clic sur les pièces 3D et affichage en direct de l'équation `SHA-256(Index + Parent + Cargaison + Nonce)`. | Prouve par l'expérimentation que le Hash agit comme un sceau d'intégrité déterministe : les mêmes entrées redonnent toujours la même empreinte. |
| Son, si utilisé | Aucun. | Sobriété et concentration sur les valeurs affichées. |
| Texte d'accompagnement | Explication directe dans le volet gauche (expliquant explicitement que le Hash agit comme un sceau numérique), encadré de formule SHA-256 et 4 infobulles anatomiques. | Harmonise le vocabulaire entre la métaphore ferroviaire et les termes cryptographiques officiels. |

#### d) Correspondance avec la réalité technique
| Élément visuel | Élément réel (`src/blockchain/Block.js`) | Fidélité (exacte / simplifiée / approximative) |
|:---|:---|:---|
| Caisses de marchandises visibles à travers les vitres | Liste des transactions (`this.data`) | **Simplifiée** : un lot de fret cohérent (marchandises ferroviaires) remplace des centaines d'entrées UTXO pour rester lisible. |
| Crochet d'attelage avant et étiquette | Champ `this.previousHash` dans l'en-tête du bloc | **Exacte** dans son rôle de référence au bloc précédent. |
| Molette latérale crantée | Champ `this.nonce` incrémenté lors du minage | **Exacte** dans son principe d'entier d'ajustement modifiant l'empreinte sans toucher aux transactions. |
| Plaque centrale et couleur de l'anneau arrière | Empreinte de 64 caractères calculée par `sha256Sync()` dans `calculateHash()` | **Exacte** sur le calcul SHA-256 déterministe et l'effet avalanche, affichée au format abrégé + code couleur pour le confort visuel. |

#### e) Alternative écartée
| Alternative | Raison du rejet |
|:---|:---|
| Mots soulignés factices (curseur `?` sans action sur « Hash ») et boutons gadgets (« Mettre en surbrillance », « Faire pulser le flux ») | Crée une fausse affordance et des interactions sans valeur pédagogique ; tous les éléments décoratifs sans effet explicatif ont été supprimés lors de la passe de nettoyage UX. |
| Mélange d'exemples hétérogènes (`10 BTC / 150 MMI / contrat`) dans les cargaisons | Cassait la cohérence du récit ; remplacé par un fil conducteur homogène de cargaisons ferroviaires tout en expliquant le rôle de registre des transactions. |
| Wagon surchargé de multiples caisses imbriquées | Jugé confus (« effet tunnel ») lors des tests utilisateurs ; simplifié à deux caisses espacées avec verrière allégée dans `WagonMesh.js`. |

#### f) Tests utilisateurs
- **Hypothèse vérifiée :** Un novice identifie les 4 composants d'un bloc et comprend que le Hash est calculé depuis le contenu.
- **Résultats (`PROTOCOLE-TESTS.md`) :** L'étape 1 est l'une des plus appréciées (Testeur 1 et Testeur 4 ont trouvé l'empreinte juste et très claire ; Testeur 2 a donné une réponse technique exacte mais signalé un « effet tunnel » dans le vitrage du wagon).

| Observation issue des tests | Modification appliquée | Issue |
|:---|:---|:---|
| Pré-tests : risque de croire que le Hash est tiré au hasard à chaque clic. | Ajout de la formule déterministe en temps réel `SHA-256(Index + Parent + Cargaison + Nonce)`. | #7, #17 |
| Testeur 2 (`PROTOCOLE-TESTS.md`) : intérieur des wagons jugé confus (« effet tunnel »). | Épuration de l'intérieur dans `WagonMesh.js` (2 caisses nettes bien espacées et opacité du verre allégée). | #17 |

#### g) Limites assumées
L'arbre de Merkle interne à un bloc Bitcoin, la sérialisation binaire d'en-tête et la taille réelle de 64 caractères hexadécimaux complets dans chaque étiquette 3D sont simplifiés : les cargaisons sont regroupées en deux caisses lisibles et les étiquettes 3D affichent les préfixes/suffixes significatifs du vrai SHA-256 calculé par `Block.js`.

---

### 4.2 — Chaînage cryptographique : hash/empreinte cryptographique, lien avec le bloc parent et effet de la moindre modification

**Issues liées :** #8  
**Séquence(s) concernée(s) :** Étape 2 (`src/steps/step2.js`, `src/blockchain/Blockchain.js`)

#### a) Objectif pédagogique
> L'utilisateur doit comprendre que les blocs forment une chaîne ordonnée non pas grâce à une attache physique arbitraire, mais parce que l'en-tête de chaque nouveau wagon (`previousHash`) recopie mathématiquement l'empreinte exacte (`Hash`) du wagon précédent. Modifier un seul caractère dans un wagon change toute son empreinte et rompt cette concordance.

#### b) Risque de mauvaise compréhension
> L'utilisateur ne doit pas croire que le faisceau vert entre deux wagons est un simple câble physique indépendant des données, ni croire que le chaînage seul suffit à rendre la chaîne infalsifiable (sans coût de minage, un tricheur pourrait recalculer tous les hashs suivants — point résolu à l'étape 5).

#### c) Représentation choisie
| Dimension | Choix | Pourquoi ce choix sert la compréhension |
|:---|:---|:---|
| Forme / géométrie | Vue panoramique du convoi montrant simultanément les jonctions entre wagons, surmontées de cartes de liaison SVG comparant côte à côte le `Hash` du wagon `N-1` et le `PreviousHash` du wagon `N`. | Met en évidence la répétition du même principe cryptographique d'un maillon à l'autre. |
| Taille et échelle | Plan d'ensemble cadrant la locomotive (#0) et jusqu'à 3 wagons successifs (#1, #2, #3). | Permet d'embrasser d'un regard l'enchaînement complet et le sens de propagation de gauche à droite. |
| Couleur / matériau / texture | Concordance chromatique stricte : l'anneau arrière du wagon parent et le crochet avant du wagon enfant partagent exactement la même teinte issue du Hash parent, reliés par un faisceau lumineux valide. | Permet de vérifier instantanément l'égalité `Wagon[N].previousHash === Wagon[N-1].hash` avant même de comparer les caractères hexadécimaux. |
| Position | Alignement horizontal gauche vers droite sur la voie principale. | Respecte la chronologie (du plus ancien au plus récent). |
| Mouvement / animation | Arrivée cinématique et verrouillage magnétique d'un nouveau wagon lorsque l'utilisateur ajoute un maillon, avec recadrage automatique de la caméra. | Illustre comment chaque bloc s'arrime uniquement au dernier maillon validé. |
| Interaction et retour visuel | Bouton « Atteler un nouveau wagon au convoi » ajoutant les Wagons #2 puis #3 avec vrai chaînage dans `Blockchain.addBlock()`, et sélection de jonction pour lire la paire exacte d'empreintes. | Rend l'utilisateur acteur de la construction de la chaîne. |
| Son, si utilisé | Aucun. | Cohérence avec l'ensemble de l'application. |
| Texte d'accompagnement | Cartes comparatives au-dessus des jonctions (`Hash #N-1 == Attache #N : LIÉ`) et texte pédagogique concis dans le volet gauche. | Formalise la relation mathématique montrée à l'écran. |

#### d) Correspondance avec la réalité technique
| Élément visuel | Élément réel (`src/blockchain/Blockchain.js`) | Fidélité (exacte / simplifiée / approximative) |
|:---|:---|:---|
| Double anneau de même couleur entre le wagon `N-1` et le wagon `N` | Pointeur `newBlock = new Block(newIndex, newTimestamp, data, latestBlock.hash, 0)` | **Exacte** : chaque bloc stocke réellement le hash SHA-256 calculé de son parent. |
| Locomotive #0 comme point de départ | `createGenesisBlock()` initialisé avec `previousHash = '0'` | **Exacte** dans son rôle de bloc d'origine sans parent. |
| Faisceau lumineux reliant les deux anneaux | Relation mathématique d'égalité vérifiée par `previousBlock.hash === currentBlock.previousHash` | **Simplifiée** : matérialisation visuelle d'une vérification logique. |

#### e) Alternative écartée
| Alternative | Raison du rejet |
|:---|:---|
| Inspection d'une seule jonction figée sans ajout de wagon | Ne montrait pas le caractère extensible et récursif d'une chaîne de blocs en croissance. |
| Badges artificiels (« CONTEXTE · NOTION 2 ») au-dessus du panneau | Alourdissaient la lecture sans information utile ; supprimés lors du nettoyage de l'interface. |

#### f) Tests utilisateurs
- **Hypothèse vérifiée :** L'utilisateur comprend que chaque wagon embarque la signature du précédent pour verrouiller son rang dans la file.

| Observation | Modification | Issue |
|:---|:---|:---|
| Besoin de comparer toutes les jonctions sans multiplier les clics individuels. | Affichage simultané d'un bandeau de cartes SVG au-dessus des liaisons actives du train. | #8, #17 |
| Clarification vocabulaire lors de la passe post-tests (`PROTOCOLE-TESTS.md`). | Simplification des textes pour éviter le jargon non défini. | #17 |

#### g) Limites assumées
Pour isoler la notion de chaînage dans cette étape 2, `addBlock()` mine automatiquement chaque nouveau wagon ajouté afin de montrer des attelages valides ; le coût du minage est abordé à part à l'étape 5, et le nombre de wagons affichés est volontairement borné à 3 pour conserver un cadrage lisible sur tout écran.

---

### 4.3 — Immutabilité et détection de falsification : une modification rend les empreintes incohérentes et doit être détectable par les autres nœuds

**Issues liées :** #9  
**Séquence(s) concernée(s) :** Étape 3 (`src/steps/step3.js`, `src/blockchain/Blockchain.js`)

#### a) Objectif pédagogique
> L'utilisateur doit comprendre que modifier une donnée ancienne est possible sur une copie locale, mais provoque immédiatement un recalcul du Hash du wagon concerné (effet avalanche). Comme l'attache `previousHash` du wagon suivant conserve l'ancienne empreinte, la discordance devient flagrante, l'attelage rompt et tous les wagons situés en aval deviennent invalides.

#### b) Risque de mauvaise compréhension
> L'utilisateur ne doit pas croire qu'il est matériellement impossible d'éditer un bloc sur son propre ordinateur, ni croire que la falsification d'un bloc #1 casserait aussi la liaison en amont avec la Locomotive #0.

#### c) Représentation choisie
| Dimension | Choix | Pourquoi ce choix sert la compréhension |
|:---|:---|:---|
| Forme / géométrie | Cadrage sur la Locomotive (#0), le Wagon #1 (cible) et le Wagon #2 (témoin), avec 2 infobulles 3D reliées en SVG à la plaque centrale + anneau arrière du Wagon #1 d'une part, et au crochet avant décroché du Wagon #2 d'autre part. | Localise exactement le point de fracture entre la nouvelle empreinte émise et l'ancienne empreinte attendue. |
| Taille et échelle | Plan moyen englobant le maillon intact (`#0 <-> #1`) et le maillon rompu (`#1 <-> #2`). | Démontre que la falsification n'affecte pas le passé avant le bloc altéré, uniquement la suite de la chaîne. |
| Couleur / matériau / texture | Lors de l'altération (`corruptBlock(1, ...)`): le Wagon #1 passe en jaune ambre et son anneau arrière change explicitement de couleur (ex. du cyan valide vers une nouvelle signature jaune corrompue), tandis que le crochet avant du Wagon #2 reste sur l'ancien cyan attendu ; cette discordance visuelle déclenche le décrochage puis le passage en rouge alerte (`#ef4444`) de la suite du convoi. | Rend la cause du détachement immédiatement lisible sans même avoir à lire les lignes de texte. |
| Position | Le Wagon #2 recule physiquement sur les rails au moment de la fraude pour matérialiser un espace vide de rupture. | Traduit l'invalidité cryptographique par une rupture spatiale nette. |
| Mouvement / animation | Recul mécanique amorti du Wagon #2 lors de la falsification, puis ré-accrochage lumineux lorsque l'utilisateur restaure le chargement d'origine. | Matérialise le lien causal direct entre intégrité des données et solidarité du train. |
| Interaction et retour visuel | Choix de cargaisons falsifiées (détournement de cargaison, modification frauduleuse) et bouton « Restaurer le chargement légitime ». | L'utilisateur déclenche lui-même l'incident et compare état sain / état corrompu. |
| Son, si utilisé | Aucun. | Sobriété visuelle. |
| Texte d'accompagnement | Texte neutre avant le clic pour ne pas divulgâcher l'effet, suivi du diagnostic comparant le nouveau `Hash #1` et l'`Attache #2` devenue incompatible. | Laisse l'observation précéder la règle théorique. |

#### d) Correspondance avec la réalité technique
| Élément visuel | Élément réel (`src/blockchain/Blockchain.js`) | Fidélité (exacte / simplifiée / approximative) |
|:---|:---|:---|
| Recalcul immédiat de l'empreinte du Wagon #1 | `corruptBlock(1, newData)` met à jour `targetBlock.data` et `targetBlock.calculateHash()` | **Exacte** : vrai calcul SHA-256 déclenché sur la modification. |
| Décrochage entre `#1` et `#2` et invalidation en cascade | `getBlockValidityList()` compare `currentBlock.previousHash === previousBlock.hash` et propage `chainIntact = false` | **Exacte** sur le mécanisme de propagation logique d'invalidation. |
| Maintien de l'attelage `#0 <-> #1` | Le `previousHash` du Wagon #1 pointe toujours validement vers la Locomotive #0 | **Exacte**. |

#### e) Alternative écartée
| Alternative | Raison du rejet |
|:---|:---|
| Colorer directement tout le convoi en rouge uniforme dès le clic | Cachait la cause réelle du détachement ; distinguer la couleur corrompue de l'anneau du Wagon #1 face à la couleur cyan attendue par le Wagon #2 rend la fracture mathématique évidente. |
| Bloquer la modification avec un message « Action impossible » | Aurait transmis l'idée fausse qu'un bloc est physiquement verrouillé, alors que chacun peut modifier sa copie mais que cela se détecte immédiatement. |

#### f) Tests utilisateurs
- **Hypothèse vérifiée :** L'utilisateur explique qu'altérer un wagon passé change son Hash et casse la correspondance avec les wagons suivants.
- **Résultats (`PROTOCOLE-TESTS.md`) :** La rupture des wagons a été l'un des éléments les plus marquants du test (3 testeurs sur 4 ont répondu juste sans hésitation ; le Testeur 2 a qualifié la rupture visuelle de « très efficace »).

| Observation | Modification | Issue |
|:---|:---|:---|
| Les traits SVG des infobulles devaient rester pointés au pixel près sur les anneaux lors des mouvements de caméra. | Calcul de projection 3D vers 2D exécuté à chaque frame (`updateTooltipsPosition`). | #9, #17 |
| Complément demandé par le sujet : montrer que les autres nœuds détectent aussi la fraude. | Relié explicitement à la fonction « Tenter une tricherie locale » de l'étape 4 où les 5 autres gares rejettent la copie divergente. | #10, #17 |

#### g) Limites assumées
Dans cette étape 3, la falsification modifie uniquement le Wagon #1 sans que le fraudeur tente de re-miner toute la suite du train ; l'impossibilité pratique de rattraper la chaîne honnête face au reste du réseau est traitée à l'étape 7 (course de minage sur l'aiguillage).

---

### 4.4 — Réseau et décentralisation : nœuds, copies distribuées et propagation des transactions/blocs, sans centre unique

**Issues liées :** #10  
**Séquence(s) concernée(s) :** Étape 4 (`src/steps/step4.js`)

#### a) Objectif pédagogique
> L'utilisateur doit comprendre qu'**il n'existe aucun serveur central ni aucune entreprise** détenant l'unique copie officielle : le réseau repose sur des nœuds indépendants et égaux (les gares) qui possèdent chacun leur propre copie complète du convoi, diffusent les transactions de voisin en voisin (protocole *Gossip*), continuent de fonctionner si un nœud tombe en panne et rejettent toute copie locale trafiquée.

#### b) Risque de mauvaise compréhension
> L'utilisateur ne doit pas croire qu'un « serveur central » distribue les trains aux gares, ni que toutes les gares sont connectées directement en un seul saut, ni que la panne d'une gare bloque l'ensemble du réseau.

#### c) Représentation choisie
| Dimension | Choix | Pourquoi ce choix sert la compréhension |
|:---|:---|:---|
| Forme / géométrie | **Territoire séparé de 6 gares ferroviaires complètes** (Gare A à Gare F : quai, bâtiment de brique/verre, horloge, signalisation), reliées par un maillage de lignes de communication et exposant chacune sa propre copie miniature du convoi sur quai. | Dissocie spatialement le réseau décentralisé d'un convoi linéaire unique et rend concret le statut de nœud complet (*full node*). |
| Taille et échelle | Vue aérienne dégagée embrassant les 6 gares simultanément, toutes de taille et d'architecture strictement équivalentes. | Supprime visuellement toute hiérarchie ou notion de gare centrale dominante. |
| Couleur / matériau / texture | Gares actives éclairées en vert émeraude, câbles actifs parcourus par des signaux lumineux cyan séquentiels, gare mise hors-ligne assombrie en gris, gare isolée clignotant en rouge lors d'une tricherie rejetée. | Permet de lire d'un seul coup d'œil l'état synchronisé, déconnecté ou rejeté de chaque nœud. |
| Position | Topologie maillée dans le plan XZ offrant plusieurs chemins alternatifs entre A et F sans aucun nœud central. | Indispensable pour prouver visuellement le contournement d'une panne par d'autres voies. |
| Mouvement / animation | **Propagation séquentielle claire (Gossip)** : la transaction part de la Gare A, voyage lentement vers ses voisines immédiates (B et C), puis seulement après réception, B et C relaient vers D et E jusqu'à F. | Remplace une diffusion simultanée confuse par une propagation étape par étape fidèle au routage pair-à-pair. |
| Interaction et retour visuel | 1) **Émettre et propager une transaction** de proche en proche.<br>2) **Cliquer directement en 3D sur une gare** (Raycaster) ou via le panneau pour la mettre en panne et vérifier le contournement automatique.<br>3) **Simuler une tricherie locale sur une gare** et constater son rejet par les 5 autres gares. | Fait expérimenter les 3 piliers d'un réseau pair-à-pair : propagation Gossip, tolérance aux pannes et consensus majoritaire face à une fraude locale. |
| Son, si utilisé | Aucun (un carillon Web Audio initialement testé a été retiré). | Garde l'attention focalisée sur les chemins de propagation. |
| Texte d'accompagnement | Étiquettes 3D sur chaque gare (nom, statut, copies synchronisées), journal de routage et mention explicite en gras : **« Il n'y a AUCUN serveur central ou entreprise qui gère le réseau. »** | Lève l'ambiguïté majeure détectée lors des tests utilisateurs. |

#### d) Correspondance avec la réalité technique
| Élément visuel | Élément réel | Fidélité (exacte / simplifiée / approximative) |
|:---|:---|:---|
| 6 gares de même taille avec mini-train sur quai | Nœuds complets (*Full Nodes*) conservant chacun une copie intégrale du registre | **Simplifiée en nombre** (6 nœuds au lieu de milliers) mais **exacte** sur l'absence de serveur maître. |
| Transmission A -> B,C -> D,E -> F | Diffusion pair-à-pair de proche en proche (protocole *Gossip*) | **Exacte** sur le principe séquentiel de relais entre pairs connectés. |
| Contournement d'une gare éteinte au clic | Tolérance aux pannes du graphe maillé | **Exacte**. |
| Rejet d'une copie trafiquée sur une gare par les 5 autres | Vérification indépendante des règles cryptographiques par chaque nœud du réseau | **Simplifiée** : en pratique, chaque nœud rejette un bloc invalide dès vérification de son hash sans attendre un « vote ». |

#### e) Alternative écartée
| Alternative | Raison du rejet |
|:---|:---|
| Petites cabanes superposées directement au-dessus du train principal | Visuellement pauvre et mélangeait l'anatomie du wagon avec la vue réseau ; remplacées par de véritables modèles de gares sur un espace territorial dégagé. |
| Balles envoyées simultanément dans toutes les directions | Rendait l'ordre de transmission illisible ; remplacé par un séquencement par vagues (`B,C` puis `D,E`). |
| Interface de panneau latéral trop dense débordant verticalement | Refactorisée dans `step4.js` et `style.css` pour tenir confortablement dans la hauteur d'écran sans troncature. |

#### f) Tests utilisateurs
- **Hypothèse vérifiée :** Le testeur comprend que le registre est copié chez chaque participant sans serveur central.
- **Résultats (`PROTOCOLE-TESTS.md`) :** Point critique révélé par l'évaluation : 2 testeurs sur 4 (Testeurs 3 et 4) avaient répondu « sur un serveur central » avant le correctif.

| Observation issue des tests | Modification appliquée | Issue |
|:---|:---|:---|
| Testeurs 3 et 4 : réponse erronée « serveur central » sur le lieu d'enregistrement des données. | Refonte complète de `step4.js` (séparation spatiale sur plateau dédié de 6 gares égales, Gossip séquentiel, ajout de l'encadré explicite en gras : *« Il n'y a AUCUN serveur central ou entreprise qui gère le réseau »*). | #10, #17 |
| Besoin de relier la falsification de l'étape 3 au rejet collectif. | Ajout de l'action « Simuler une tricherie sur une gare » montrant les 5 gares majoritaires refuser le wagon divergent. | #10, #17 |

#### g) Limites assumées
Le réseau est simulé en mémoire dans le navigateur avec 6 gares au lieu de milliers de nœuds réels communiquant par sockets TCP/IP, et la latence entre sauts est ralentie à l'échelle humaine afin que l'œil puisse suivre les relais successifs et identifier les chemins de contournement.

---

### 4.5 — Validation et minage : vérification d'une transaction ou d'un bloc et, dans le cas du proof of work (PoW), recherche d'un nonce sous contrainte de difficulté

**Issues liées :** #11  
**Séquence(s) concernée(s) :** Étape 5 (`src/steps/step5.js`, `src/blockchain/Block.js`)

#### a) Objectif pédagogique
> L'utilisateur doit comprendre pourquoi l'ajout d'un nouveau bloc exige une preuve de travail : pour avoir le droit d'atteler le Wagon #2 candidat, il faut faire varier le `Nonce` (en tournant la molette crantée) jusqu'à obtenir une empreinte SHA-256 respectant la contrainte de difficulté (commencer par `0`, `00` ou `000`). Trouver ce Nonce demande un grand nombre d'essais aléatoires, alors qu'un seul calcul suffit aux autres gares pour le vérifier.

#### b) Risque de mauvaise compréhension
> L'utilisateur ne doit pas croire que miner consiste à « résoudre une équation intelligente », ni qu'un résultat comme « 22 essais » serait toujours fixe, ni que les mineurs créent arbitrairement des transactions.

#### c) Représentation choisie
| Dimension | Choix | Pourquoi ce choix sert la compréhension |
|:---|:---|:---|
| Forme / géométrie | Convoi validé à gauche (Locomotive #0 et Wagon #1) et **Wagon #2 candidat immobilisé à distance sur les rails (`x = 8.55`)** avec sa molette crantée du Nonce et 2 infobulles SVG dégagées vers le compteur et la plaque de Hash. | La séparation physique matérialise qu'un wagon non miné n'est pas encore admis dans la chaîne officielle. |
| Taille et échelle | Cadrage centré sur le Wagon #2 candidat, sa molette latérale et l'intervalle d'attelage avec le Wagon #1. | Facilite le clic direct sur la molette 3D et la lecture simultanée des premiers caractères du Hash. |
| Couleur / matériau / texture | Voyant orange tant que le préfixe cible n'est pas atteint ; passage instantané au vert émeraude dès qu'un Hash respectant `0`, `00` ou `000` est découvert. | Signal visuel immédiat distinguant les essais rejetés du succès. |
| Position | Le Wagon #2 attend à `x = 8.55` puis glisse physiquement jusqu'à `x = 7.60` pour verrouiller son attelage au Wagon #1 dès la découverte du Nonce valide. | Fait de l'attelage mécanique la conséquence directe du travail de minage accompli. |
| Mouvement / animation | **Synchronisation stricte : 1 essai = +1 sur le Nonce = +1 cran de 45 degrés sur la molette 3D**, avec vitesse proportionnelle à la difficulté en mode automatique. | Relie chaque itération SHA-256 à un mouvement mécanique comptable. |
| Interaction et retour visuel | 1) Choix de difficulté (`0`, `00`, `000`).<br>2) Clic direct sur la molette 3D ou bouton `+1 essai`.<br>3) Bouton de minage automatique affichant le tirage réel comparé à la moyenne théorique : par ex. *« Nonce trouvé : X, après Y essais réels. (Moyenne théorique : 16 / 256 / 4 096 essais) »*, suivi de la mention *« Vérification : Un seul calcul suffit pour que les autres gares valident ce wagon. »* | Démontre par l'expérience l'aléa du tirage, la croissance exponentielle par facteur 16 par zéro supplémentaire et l'asymétrie coût/vérification. |
| Son, si utilisé | Aucun. | Sobriété visuelle. |
| Texte d'accompagnement | Encadré pédagogique expliquant clairement l'utilité sécuritaire du minage (rendre la réécriture de l'historique prohibitivement coûteuse) et infobulles dégagées hors des labels 3D. | Corrige les contresens sur la « création d'argent par le calcul ». |

#### d) Correspondance avec la réalité technique
| Élément visuel | Élément réel (`src/blockchain/Block.js`) | Fidélité (exacte / simplifiée / approximative) |
|:---|:---|:---|
| Rotation d'un cran incrémentant le Nonce | Boucle `while (this.hash.substring(0, difficulty) !== targetPrefix)` avec `this.nonce++` | **Exacte**. |
| Résultat variable d'un clic à l'autre | Ajout d'un sel d'horodatage aléatoire (`_miningSalt = ${Date.now()}-${Math.random()...}`) dans `mineBlock()` avant la boucle | **Exacte** dans l'esprit : en réel, chaque tentative ou candidat varie par l'horodatage/coinbase et empêche un résultat figé (auparavant bloqué à « 22 essais »). |
| Comparaison essais réels vs `16`, `256`, `4 096` | Loi géométrique de probabilité `1 / 16^d` sur un préfixe hexadécimal uniforme | **Exacte** mathématiquement. |
| Vérification en 1 seul calcul | Contrôle unique `block.hash === block.calculateHash()` par les autres nœuds | **Exacte** sur le principe d'asymétrie entre preuve et vérification. |

#### e) Alternative écartée
| Alternative | Raison du rejet |
|:---|:---|
| Minage sans sel aléatoire produisant toujours exactement « 22 essais » pour `0` | Induisait l'erreur pédagogique de croire que le minage est une formule déterministe à coût fixe ; corrigé par l'ajout de `_miningSalt` dans `Block.js` et l'affichage de la moyenne statistique. |
| Maillage circulaire wireframe autour de la chaudière de la locomotive | Traversait le panneau HTML `LOCOMOTIVE // BLOC #0` et rendait le texte illisible ; supprimé. |
| Particules d'étincelles décoratives au-dessus du wagon | Masquaient les plaques chiffrées ; retirées au profit de la rotation exacte de la molette. |

#### f) Tests utilisateurs
- **Hypothèse vérifiée :** Le testeur comprend que miner consiste à chercher par essais un Nonce valide et pourquoi ce coût sécurise la chaîne.
- **Résultats (`PROTOCOLE-TESTS.md`) :** L'animation de la molette du Nonce a été jugée très parlante (Testeur 1 et Testeur 2), tandis que le Testeur 3 n'avait pas saisi l'utilité globale du minage (« je ne sais pas ») avant ajout de l'encadré explicatif.

| Observation issue des tests | Modification appliquée | Issue |
|:---|:---|:---|
| Testeur 3 (`PROTOCOLE-TESTS.md`) : rôle du minage non acquis. | Ajout d'un encadré explicatif direct sur `step5.js` précisant que le minage sert à rendre la falsification coûteuse, et ajout de la comparaison essais réels / moyenne théorique + vérification en 1 calcul. | #11, #17 |
| Bug visuel signalé : le cercle filaire de la locomotive croisait l'étiquette 3D et les infobulles mordaient sur le compteur de Nonce. | Suppression du maillage circulaire parasite et décalage des ancres SVG. | #11, #17 |

#### g) Limites assumées
Sur Bitcoin, la difficulté cible exige de l'ordre de 19 zéros hexadécimaux (et s'ajuste tous les 2 016 blocs) nécessitant des milliards de milliards d'essais par seconde via matériel ASIC. Limiter l'expérimentation à `0`, `00` ou `000` (moyennes de 16, 256 et 4 096 essais) permet d'observer réellement la boucle `while` de `mineBlock()` dans le navigateur en quelques secondes sans figer l'affichage.

---

### 4.6 — Comparaison d'au moins deux mécanismes de consensus : par exemple proof of work (PoW) et proof of stake (PoS), en expliquant leurs différences, avantages et limites

**Issues liées :** #12  
**Séquence(s) concernée(s) :** Étape 6 (`src/steps/step6.js`)

#### a) Objectif pédagogique
> L'utilisateur doit comprendre comment des gares sans chef s'accordent sur celle qui aura le droit d'atteler le prochain wagon, et distinguer deux règles majeures :
> - **Preuve de Travail (PoW)** : toutes les gares font tourner leur molette à pleine puissance en parallèle ; la plus rapide gagne, mais le calcul et l'énergie dépensés par les gares perdantes sont gaspillés.
> - **Preuve d'Enjeu (PoS)** : chaque gare dépose une caution financière sur le quai ; une loterie pondérée par la caution désigne une seule gare validatrice qui scelle le wagon, évitant toute compétition énergétique entre les autres gares.

#### b) Risque de mauvaise compréhension
> L'utilisateur ne doit pas croire que la gare la plus puissante ou la plus riche gagne automatiquement à chaque manche, ni qu'en PoS il suffit de « payer pour tricher » (la caution sert au contraire de garantie confiscable en cas de fraude), ni qu'il n'y a plus de validation en PoS.

#### c) Représentation choisie
| Dimension | Choix | Pourquoi ce choix sert la compréhension |
|:---|:---|:---|
| Forme / géométrie | **Comparaison directe sur 3 gares équipées de quais de chargement (mempool)** : `Gare A` (50 %, caisses bleues et jaunes), `Gare B` (35 %, caisses vertes et orange) et `Gare C` (15 %, caisses violettes et rouges), chacune dotée de son propre **wagon candidat** posé sur voie de quai (Wagon A, Wagon B, Wagon C) et relié par raccordement vers le train principal en circulation. L'indicateur de consensus (molette en PoW, pile de jetons en PoS) est décalé sur le côté droit du quai. | Montre concrètement que chaque nœud prépare un bloc candidat avec ses propres transactions en attente, ce qui impose des calculs SHA-256 et des Nonces différents. |
| Taille et échelle | Plan d'ensemble en plongée modérée montrant simultanément le train principal en circulation en arrière-plan et les 3 gares + caisses + wagons candidats au premier plan dans les deux tiers droits. | Permet de suivre le chargement, la sélection et le raccordement au convoi sans aucun dézoom manuel. |
| Couleur / matériau / texture | Caisses distinctes par gare (bleues/jaunes, vertes/orange, violettes/rouges). En PoW, les 3 molettes tournent puis le wagon gagnant passe au vert tandis que les 2 perdants basculent en gris/rouge et s'estompent. En PoS, un halo balaye les piles de jetons puis seule la gare élue charge et scelle son wagon en vert. | Visualise immédiatement l'unicité de chaque contenu candidat et le contraste entre calcul parallèle gaspillé (PoW) et sélection ciblée (PoS). |
| Position | Les 3 gares et leurs quais de chargement sont alignés au premier plan (`z = 3.15`) face à la voie principale (`z = 0`) sur laquelle circule le convoi. | Sépare clairement le registre officiel déjà validé (le convoi en marche) des propositions en concurrence sur quai. |
| Mouvement / animation | - **PoW en 3 temps** : 1) Chargement simultané des caisses colorées dans les 3 wagons candidats (`1,2 s`) ; 2) Course au Nonce à probabilités réelles 50 / 35 / 15 % ; 3) Raccordement du wagon gagnant à l'arrière du train en circulation tandis que les wagons perdants s'estompent.<br>- **PoS en 3 temps** : 1) Tirage au sort sur caution par balayage des jetons (`1,5 s`) ; 2) Chargement et verrouillage en vert par la seule gare élue (`1,2 s`) ; 3) Raccordement au convoi pendant que les caisses des deux autres gares restent en attente sur leur quai. | Traduit physiquement la file d'attente des transactions (mempool), la concurrence cryptographique et l'économie énergétique de la Preuve d'Enjeu. |
| Interaction et retour visuel | Onglets « PoW (Course) » et « PoS (Loterie) », bouton de lancement / relance réinitialisant proprement les 3 quais et encarts dédiés expliquant le chargement des caisses colorées et le choix du validateur. | Permet de constater sur plusieurs manches que le tirage reste probabiliste (une gare à 15 % peut parfois gagner) tout en gardant un état propre d'un tour à l'autre. |
| Son, si utilisé | Aucun. | Sobriété générale. |
| Texte d'accompagnement | Explications directes sur les quais de chargement (mempool propre à chaque gare), la course PoW et la sélection par caution PoS dans le panneau latéral. | Évite un texte théorique abstrait déconnecté du convoi et des marchandises. |

#### d) Correspondance avec la réalité technique
| Élément visuel | Élément réel | Fidélité (exacte / simplifiée / approximative) |
|:---|:---|:---|
| Caisses de couleurs différentes sur chaque quai et chargement dans les wagons candidats | Mempool local propre à chaque mineur/validateur contenant un lot de transactions distinct | **Exacte** sur le fait que deux nœuds construisent des blocs candidats différents (et donc des hashs et Nonces différents). |
| Course des 3 molettes à 50 %, 35 %, 15 % | Compétition de *hashrate* en Proof-of-Work avec travail annulé pour les perdants | **Exacte** sur le caractère probabiliste et la dépense énergétique des perdants. |
| Loterie pondérée par 50, 35, 15 jetons puis chargement unique | Sélection pseudo-aléatoire du proposant pondérée par le *stake* en Proof-of-Stake | **Simplifiée** : Ethereum associe cette sélection à des comités de validateurs qui attestent le bloc. |
| Raccordement au convoi et repos des autres quais en PoS | Intégration du bloc validé à la chaîne canonique et réduction > 99,9 % de la consommation électrique en PoS | **Exacte** sur l'ordre de grandeur documenté (`[S6]`). |

#### e) Alternative écartée
| Alternative | Raison du rejet |
|:---|:---|
| Comparateur purement textuel sans animation sur les gares | Contraire au cahier des charges R507 exigeant une visualisation 3D interactive pour chaque notion. |
| Validateur PoS attelant instantanément le wagon sans rotation de molette | Laissait penser qu'il n'y avait aucune validation du bloc en PoS ; ajout de la phase `pos_mining` uniquement sur la gare élue. |
| Texte comparatif déconnecté de l'univers ferroviaire | Réécrit pour reprendre systématiquement les gares et les wagons du convoi. |

#### f) Tests utilisateurs
- **Hypothèse vérifiée :** Le testeur distingue ce qui détermine la sélection dans chaque mode (calcul en PoW vs caution en PoS) et comprend l'écart énergétique.
- **Résultats (`PROTOCOLE-TESTS.md`) :** L'étape 6 (comparaison PoW vs PoS) a été citée parmi les séquences les plus claires et les plus appréciées (Testeur 1).

| Observation | Modification | Issue |
|:---|:---|:---|
| Besoin de montrer concrètement le rôle de la gare élue en PoS sans laisser croire à une validation magique. | Ajout de la phase d'actionnement de la molette sur la seule gare élue pendant que les deux autres affichent `0 cran (repos)`. | #12, #17 |

#### g) Limites assumées
Les mécanismes complets du PoS moderne (périodes *epochs/slots*, comités d'attestation multiples et procédure détaillée de *slashing* en cas de double signature) ainsi que l'émission de récompense de bloc ne sont pas animés individuellement dans la scène 3D mais expliqués dans le panneau comparatif afin de préserver la clarté de l'opposition énergie vs caution.

---

### 4.7 — Cycle de vie d'une transaction et scénario d'attaque illustré : création, propagation, validation, inclusion dans un bloc, confirmation, puis illustration d'une attaque et de sa détection/limitation

**Issues liées :** #13, #17  
**Séquence(s) concernée(s) :** Étape 7 (`src/steps/step7.js`)

#### a) Objectif pédagogique
> L'utilisateur doit relier l'ensemble du parcours en suivant le **cycle de vie complet d'une transaction** (création/émission -> propagation sur le réseau de gares -> validation par les nœuds -> inclusion dans un bloc miné -> confirmations successives par l'ajout de wagons suivants), puis comprendre comment une **attaque par double dépense (attaque des 51 %)** tente de réécrire l'historique sur une voie parallèle et comment la **règle de la chaîne la plus longue** départage les deux branches.

#### b) Risque de mauvaise compréhension
> L'utilisateur ne doit pas croire qu'une attaque des 51 % permet de créer des jetons à partir de rien ou de voler le portefeuille d'un inconnu sans clé privée : elle permet uniquement de réorganiser les blocs récents pour annuler sa propre dépense (**double dépense**) en minant plus vite que le reste du réseau honnête.

#### c) Représentation choisie
| Dimension | Choix | Pourquoi ce choix sert la compréhension |
|:---|:---|:---|
| Forme / géométrie | **Aiguillage symétrique en Y juste après le Wagon #1** :<br>- À gauche sur le rail central (`z = 0`) : la Locomotive (#0) et le Wagon #1 déjà confirmés.<br>- En haut (`z = -1.85`) : la branche assemblée par les **Gares honnêtes** (Wagons #2, #3, #4).<br>- En bas (`z = +1.85`) : la branche concurrente préparée par le **Pirate** (Wagons pirates #2, #3, #4). | L'aiguillage ferroviaire en Y (*fork*) est la traduction spatiale directe d'une bifurcation de chaîne. |
| Taille et échelle | Vue d'ensemble cadrant le tronc commun à gauche, l'aiguillage central et les deux voies parallèles de course à droite. | Permet de comparer en temps réel l'avancement du nombre de wagons sur chaque branche. |
| Couleur / matériau / texture | Branche honnête en cyan/émeraude, branche pirate en rouge/ambre avec molettes de minage tournant en tête de chaque branche ; la branche perdante est grisée sur voie de garage après arbitrage. | Identifie sans ambiguïté le camp gagnant retenu sur le rail principal et la branche orpheline rejetée. |
| Position | Pendant la course, aucune des deux branches n'est rattachée au Wagon #1 ; à l'arrivée, **seule la branche atteignant 3 wagons en premier glisse latéralement sur le rail central (`z = 0`)** et s'attelle au Wagon #1. | Illustre physiquement la règle de la chaîne la plus longue (cumulant le plus de preuve de travail). |
| Mouvement / animation | Course cadencée d'assemblage des wagons #2, #3 et #4 selon le rapport de puissance :<br>- **Scénario 1 — Réseau sain (Pirate à 20 % vs Réseau à 80 %)** : les gares honnêtes assemblent 3 wagons contre 1 pour le pirate et s'attellent au Wagon #1.<br>- **Scénario 2 — Attaque des 51 % (Pirate à 60 % vs Réseau à 40 %)** : le pirate mine plus vite, atteint 3 wagons avant le réseau et s'attelle au rail central. | Fait expérimenter pourquoi la décentralisation (empêcher tout acteur de dépasser 50 % de puissance) garantit la sécurité du registre. |
| Interaction et retour visuel | Bascule entre les deux scénarios (20 % vs 60 %), bouton de lancement de la course et infobulles 3D affichant en direct le décompte des wagons sur chaque voie, accompagné du rappel des 5 étapes du cycle de vie d'une transaction. | Montre par comparaison le basculement critique au-delà de 50 % de puissance. |
| Son, si utilisé | Aucun. | Sobriété visuelle. |
| Texte d'accompagnement | Phrases raccourcies et clarifiées dans le volet gauche synthétisant le cycle complet (création, propagation, validation, minage/inclusion, confirmations) et les limites d'une attaque des 51 %. | Permet de lire le bilan tout en suivant l'aiguillage sans perdre le fil. |

#### d) Correspondance avec la réalité technique
| Élément visuel | Élément réel | Fidélité (exacte / simplifiée / approximative) |
|:---|:---|:---|
| Rappel des 5 phases dans le parcours (étapes 4 -> 5 -> 7) | Cycle complet d'une transaction (création, diffusion *Gossip*, validation, inclusion dans bloc miné, confirmations) | **Exacte** sur l'ordre chronologique des phases (signature ECDSA évoquée textuellement). |
| Aiguillage en Y après le Bloc #1 | Bifurcation (*blockchain fork*) entre chaîne honnête et chaîne secrète concurrente | **Exacte**. |
| Victoire de la branche à 3 wagons sur le rail central | Règle de Nakamoto : adoption de la chaîne valide ayant accumulé le plus de preuve de travail | **Exacte**. |
| Branche perdante grisée sur la voie de garage | Blocs orphelins abandonnés lors d'une réorganisation de chaîne (*chain reorg*) | **Exacte**. |

#### e) Alternative écartée
| Alternative | Raison du rejet |
|:---|:---|
| Modifier directement un wagon au milieu de la chaîne sans aiguillage parallèle | Laissait croire à une modification sur place, alors que l'attaquant doit miner une chaîne parallèle complète plus rapidement que tout le reste du réseau. |
| Maintenir l'une des branches déjà pré-attachée au Wagon #1 pendant la course | Biaisait la lecture en donnant l'impression que la branche honnête était gagnante d'avance ; corrigé par un découplage symétrique jusqu'à la fin de la course. |

#### f) Tests utilisateurs
- **Hypothèse vérifiée :** L'utilisateur comprend pourquoi un attaquant minoritaire échoue face au réseau et pourquoi la détention de plus de 50 % de la puissance permet une double dépense.
- **Résultats (`PROTOCOLE-TESTS.md`) :** Le Testeur 4 a signalé un blocage et une sensation de texte trop dense combinés à une animation de course trop rapide à suivre à l'étape 7.

| Observation issue des tests | Modification appliquée | Issue |
|:---|:---|:---|
| Branches pré-attachées donnant l'illusion d'un résultat prédéterminé. | Découplage symétrique des deux voies sur l'aiguillage en Y pendant la course, avec glissement final du seul vainqueur sur le rail central. | #13, #17 |
| Testeur 4 (`PROTOCOLE-TESTS.md`) : textes trop denses et course trop rapide à l'étape 7. | Raccourcissement des phrases du volet gauche et ralentissement volontaire de l'assemblage des wagons sur les deux branches dans `step7.js`. | #17 |

#### g) Limites assumées
La course est condensée sur l'assemblage de 3 wagons en quelques secondes (contre 6 confirmations d'environ 10 minutes chacune sur Bitcoin) et avec des vitesses représentatives (20 % vs 60 %) plutôt qu'une longue simulation stochastique, afin que l'utilisateur perçoive immédiatement le mécanisme de fork et de réorganisation. Les signatures cryptographiques (clés publique/privée) et le détail du tri par frais dans le mempool sont expliqués sans être modélisés séparément.

---

## 5. Cohérence globale

| Question | Réponse |
|:---|:---|
| Les codes visuels sont-ils constants ? | Oui : sur l'ensemble du parcours (Accueil et Étapes 0 à 7), le vert émeraude (`#10b981`) indique « valide / synchronisé », le jaune ambre (`#f59e0b`) indique « en cours de modification ou de minage », le rouge (`#ef4444`) indique « falsifié / décroché / alerte », et la teinte de chaque anneau d'attelage est dérivée de l'empreinte SHA-256 réelle du bloc. |
| Un même élément est-il représenté de la même façon partout ? | Oui : les classes procédurales `WagonMesh` (châssis, deux caisses internes, parois vitrées, plaque de Hash, crochet avant `previousHash`, molette crantée du Nonce) et `LocomotiveMesh` sont réutilisées à l'identique dans toutes les étapes ferroviaires, et le motif de gare est partagé entre les étapes 4 et 6. |
| L'ordre des séquences est-il progressif ? | Oui : le parcours progresse du global vers le détail puis vers le réseau : vue d'ensemble du réseau ferroviaire public (Étape 0), anatomie d'un wagon (Étape 1), chaînage entre wagons (Étape 2), rupture par falsification (Étape 3), décentralisation sur 6 gares autonomes (Étape 4), minage d'un wagon candidat (Étape 5), comparaison des consensus PoW vs PoS (Étape 6) et arbitrage sur aiguillage face à une attaque (Étape 7). |
| Quelle notion est la moins bien représentée ? | La structure interne de l'arbre de Merkle et le tri du mempool par frais de transaction (étapes 1 et 7) sont volontairement synthétisés sous forme de cargaisons groupées afin de ne pas surcharger un public non initié dès la découverte. |
| Quelle décision reverriez-vous avec une semaine de plus ? | Nous aurions réalisé une première session de tests utilisateurs plus tôt (dès la fin de la semaine 2) afin d'ajuster encore plus en amont la densité de l'étape 7 et l'explicitation du réseau sans serveur central à l'étape 4, et nous ajouterions un travelling caméra continu reliant l'étape 4 à l'étape 5. |

---

## 6. Rôle de l'IA générative

Conformément au règlement du projet R507, l'usage de l'IA générative est documenté de façon transparente. Seuls deux outils ont été utilisés (**Gemini** et **Antigravity**), toujours sous le pilotage et la vérification critique du binôme :

| Domaine | Outil(s) | Apports retenus | Contrôle et corrections effectués par le binôme |
|:---|:---|:---|:---|
| Initialisation et architecture Vite / Three.js | Gemini | Aide à la mise en place de la configuration Vite / ES Modules, du découpage par étapes (`StepManager.js`, `step0.js` à `step7.js`) et de l'ossature initiale du projet. | Réorganisation manuelle des modules (`Block.js`, `Blockchain.js`, `WagonMesh.js`), vérification du build de production et du déploiement GitHub Pages. |
| Modélisation 3D et géométrie interactive | Antigravity | Assistance sur le positionnement spatial des composants Three.js, la refonte des modèles de gares (étape 4), le calcul de projection 3D vers SVG des infobulles et l'alignement symétrique de l'aiguillage en Y (étape 7). | Vérification visuelle sur navigateur à 60 FPS, correction manuelle de la synchronisation `1 essai = +1 cran de 45 degrés` à l'étape 5 et suppression du cercle wireframe gênant la lecture sur la locomotive. |
| Ergonomie, narration et correctifs post-tests | Gemini, Antigravity | Relecture critique de la clarté des panneaux latéraux et mise en œuvre rapide des correctifs CSS (suppression des débordements à l'étape 4). | Réécriture complète dans un ton étudiant naturel des explications trop longues ou scolaires ; harmonisation stricte de la métaphore ferroviaire (suppression des mentions de « banque » à l'étape 0 et adaptation des textes PoW/PoS aux gares à l'étape 6). |
| Documentation et suivi GitHub Projects | Antigravity | Mise en forme structurée des livrables Markdown (`CHOIX-MODELISATION.md`, `PROTOCOLE-TESTS.md`, `GRILLE-AUTOEVAL.md`, `SOUTENANCE.md`) et automatisation des requêtes GitHub CLI pour le suivi Kanban. | Relecture complète, ajout des notes et justifications factuelles d'auto-évaluation, saisie et analyse des réponses réelles des 4 testeurs externes, contrôle strict du zéro emoji. |

**Éléments proposés par l'IA puis rejetés ou corrigés par le binôme :**
- Suppression des mots soulignés factices à curseur `?` sans action réelle et des boutons gadgets (« Mettre en surbrillance », « Faire pulser le flux »).
- Suppression des badges artificiels (« CONTEXTE · LE CHARGEMENT PUBLIC », « Notion 1 ») dans les en-têtes du panneau latéral.
- Retrait des particules d'étincelles à l'étape 5 et du carillon Web Audio testé à l'étape 4, qui nuisaient à la sobriété pédagogique.
- Correction de l'algorithme de minage qui renvoyait toujours exactement « 22 essais » pour la difficulté `0` avant l'ajout d'un sel aléatoire (`_miningSalt`) dans `Block.js`.

Toutes les décisions de conception, la métaphore du Convoi Ferroviaire Blindé, les scénarios d'interaction et la validation technique relèvent intégralement du binôme Arthur Morin & Alban Chabalier.

---

## 7. Protocole et bilan des tests utilisateurs

La campagne d'évaluation complète est détaillée dans [`docs/PROTOCOLE-TESTS.md`](PROTOCOLE-TESTS.md).

- **Formulaire public soumis aux testeurs :** https://forms.gle/SrQx1cJVSrnMt7sc9
- **Échantillon :** **4 testeurs externes** au groupe (tranche 18-25 ans, dont 3 en découverte totale et 1 ayant seulement entendu parler du sujet), soit le double du minimum exigé (2 testeurs).
- **Protocole de passation à distance en autonomie complète :** aucune explication orale ni guidage préalable pendant la navigation de l'écran d'accueil à l'étape 7, puis remplissage autonome du questionnaire Google Forms et contrôle du compteur FPS (>= 30 FPS).

### Bilan chiffré et résultats
- **Note moyenne de compréhension globale après parcours :** **4,25 / 5** (5/5 pour T1 et T2, 4/5 pour T4, 3/5 pour T3).
- **Confort de lecture et clarté des textes :** **4,50 / 5** (5/5 pour T1 et T3, 4/5 pour T2 et T4).
- **Équilibre entre texte et animation 3D :** **5,00 / 5** (les 4 testeurs ont attribué 5/5).
- **Fluidité 3D ressentie :** **100 % fluide**, aucun ralentissement signalé sur les 4 ordinateurs personnels.

### Synthèse des 5 correctifs appliqués suite aux retours

| Constat issu de la campagne | Testeurs concernés | Correctif implémenté dans le code |
|:---|:---|:---|
| 50 % des testeurs ont répondu « serveur central » sur le lieu de stockage de la blockchain. | T3, T4 | **Étape 4 (`step4.js`)** : ajout de la mention explicite en gras (*« Il n'y a AUCUN serveur central ou entreprise qui gère le réseau. »*), séparation spatiale en archipel de 6 gares autonomes et animation séquentielle Gossip. |
| Intérieur des wagons jugé confus à travers la verrière (« effet tunnel »). | T2 | **Modélisation (`WagonMesh.js`)** : réduction à deux caisses bien espacées à l'intérieur des wagons et allègement de l'opacité du vitrage. |
| Utilité sécuritaire du minage non comprise par un testeur novice. | T3 | **Étape 5 (`step5.js`)** : encadré pédagogique expliquant que le minage rend la réécriture coûteuse, plus tirage aléatoire réel comparé à la moyenne théorique (`16`, `256`, `4 096`). |
| Blocage et texte jugé trop dense à l'étape 7 lors de la course sur l'aiguillage. | T4 | **Étape 7 (`step7.js`)** : raccourcissement des textes du volet gauche et ralentissement de la vitesse de course des trains sur l'aiguillage en Y. |
| Vocabulaire encore trop technique à certains endroits pour un débutant. | T1, T2 | **Étapes 0 à 7 (`src/steps/`)** : passe générale de simplification et d'harmonisation avec la métaphore ferroviaire. |

---

## 8. Sources et références

Les contenus pédagogiques, les calculs et les limites assumées s'appuient sur les références primaires suivantes :

- **`[S1]` Satoshi Nakamoto (2008), *Bitcoin: A Peer-to-Peer Electronic Cash System*** — https://bitcoin.org/bitcoin.pdf  
  *Apport :* Définition fondatrice de la structure d'un bloc, du chaînage séquentiel par empreinte, de la preuve de travail (section 4), du réseau pair-à-pair (section 5) et de la règle de la chaîne la plus longue face à une tentative de double dépense (section 11). Utilisée aux étapes 0, 1, 2, 3, 4, 5 et 7.
- **`[S2]` NIST FIPS 180-4 (2015), *Secure Hash Standard (SHS)*** — https://nvlpubs.nist.gov/nistpubs/FIPS/NIST.FIPS.180-4.pdf  
  *Apport :* Spécification mathématique officielle de l'algorithme SHA-256 implémenté de manière synchrone dans `src/blockchain/Block.js` (`sha256Sync`), garantissant le déterminisme, la taille fixe (64 caractères hexadécimaux) et l'effet avalanche démontrés aux étapes 1, 2 et 3.
- **`[S3]` Dylan Yaga, Peter Mell, Nik Roby & Karen Scarfone (2018), *NIST IR 8202 — Blockchain Technology Overview*** — https://doi.org/10.6028/NIST.IR.8202  
  *Apport :* Synthèse institutionnelle sur les registres distribués sans tiers de confiance, mobilisée pour structurer la présentation des nœuds complets sans serveur central (étape 4) et formuler rigoureusement les limites d'immutabilité.
- **`[S4]` *Bitcoin Developer Guide — Block Chain, P2P Network, Transactions & Mining*** — https://developer.bitcoin.org/devguide/  
  *Apport :* Documentation technique de référence utilisée pour modéliser le relais de proche en proche entre pairs (étape 4), le mécanisme de cible de difficulté (étape 5) et le cycle complet d'une transaction jusqu'aux confirmations (étape 7).
- **`[S5]` *Ethereum.org — Consensus Mechanisms : Proof-of-Work (PoW) & Proof-of-Stake (PoS)*** — https://ethereum.org/en/developers/docs/consensus-mechanisms/  
  *Apport :* Comparaison factuelle des ressources mobilisées (puissance de calcul vs capital immobilisé en caution), de la sécurité économique et des vulnérabilités respectives des deux mécanismes mis en scène à l'étape 6.
- **`[S6]` *Ethereum.org — Energy Consumption / The Merge* & Cambridge Centre for Alternative Finance (CBECI)** — https://ethereum.org/en/energy-consumption/ et https://ccaf.io/cbnsi/cbeci  
  *Apport :* Ordres de grandeur sur la consommation énergétique de la Preuve de Travail (dépense électrique continue) et l'économie supérieure à 99,9 % permise par le passage à la Preuve d'Enjeu, cités dans le comparatif de l'étape 6.
- **`[S7]` CNIL (2018), *Blockchain et RGPD : quelles solutions pour un usage responsable en présence de données personnelles ?*** — https://www.cnil.fr/fr/blockchain-et-rgpd-quelles-solutions-pour-un-usage-responsable-en-presence-de-donnees-personnelles  
  *Apport :* Cadrage sur la visibilité publique des données inscrites dans une blockchain ouverte et sur la portée réelle de l'immutabilité (étapes 1, 3 et 4).
- **`[S8]` Documentation officielle Three.js & MDN Web Docs** — https://threejs.org/docs/ et https://developer.mozilla.org/fr/docs/Web/API/SubtleCrypto/digest  
  *Apport :* Mise en œuvre du moteur WebGL (`BufferGeometry`, `MeshPhysicalMaterial`, `Raycaster`, `OrbitControls`, `ACESFilmicToneMapping`) et des primitives cryptographiques côté navigateur.
- **`[S9]` Documentation officielle Vite & Anders Brownworth (*Blockchain 101 — A Visual Demo*)** — https://vitejs.dev/guide/ et https://andersbrownworth.com/blockchain/  
  *Apport :* Configuration du bundler ES Modules / GitHub Pages et inspiration pédagogique sur la manipulation directe du couple Données / Nonce / Hash et l'invalidation en cascade, entièrement transposée dans l'univers 3D ferroviaire.
- **`[S10]` Supports de cours R507 — *Dispositifs interactifs*** (BUT MMI 3e année, IUT de Béziers)  
  *Apport :* Cadrage des 7 notions obligatoires, contrainte de fluidité >= 30 FPS et grille d'évaluation par tests utilisateurs sans explication orale.
