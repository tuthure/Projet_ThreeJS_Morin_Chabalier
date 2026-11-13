# BUT MMI 3e année — R507

## Projet Three.js — Visualisation pédagogique de la blockchain

### `MMI-R507-projet-blockchain-CHOIX-MODELISATION.md` — livrable officiel

Ce document constitue le livrable officiel de cadrage et de justification des choix de modélisation pour le projet de visualisation pédagogique de la blockchain avec Three.js (**Le Convoi Ferroviaire Blindé**). Il est tenu à jour tout au long des jalons du projet.

## 1. Informations générales

| Champ | Contenu |
|:---|:---|
| Groupe | Binôme Arthur Morin (`@tuthure`) & Alban Chabalier (`@achabalier14`) |
| Membres et rôles | **Alban Chabalier** (`@achabalier14`) : Gestion de projet, conception UX/UI, ergonomie des contrôles caméra, narration pédagogique, scénarisation des 7 notions et protocole de tests.<br>**Arthur Morin** (`@tuthure`) : Architecture technique Three.js, modélisation procédurale 3D (locomotive, wagons, gares, aiguillages), animations mécaniques, logique de chaîne et intégration Vite. |
| Public cible | Utilisateur non initié (personne extérieure au groupe, n'ayant pas suivi le cours R507 et ne recevant aucune explication orale préalable). |
| Lien vers la démo en ligne | https://tuthure.github.io/Projet_ThreeJS_Morin_Chabalier/ |
| Lien vers GitHub Projects | https://github.com/tuthure/Projet_ThreeJS_Morin_Chabalier/projects |
| Lien du formulaire de test | https://forms.gle/SrQx1cJVSrnMt7sc9 |
| Version et date de mise à jour | v1.0 — 13/11/2026 |

---

## 2. Univers visuel et métaphore principale

### 2.1 Public cible et objectifs pédagogiques
Le dispositif s'adresse à un public sans bagage technique préalable en cryptographie ou en systèmes distribués, découvrant l'application en autonomie complète sans commentaire oral.
À l'issue du parcours interactif (de l'accueil à l'étape 7), l'utilisateur doit pouvoir :
- Identifier les quatre composants essentiels d'un bloc (données, hash, previousHash, nonce) et leur fonction respective.
- Comprendre comment l'empreinte cryptographique (hash) lie physiquement chaque bloc à son parent.
- Visualiser concrètement pourquoi la moindre altération d'un bloc passé rompt la chaîne en aval (immutabilité et détection de falsification).
- Appréhender la décentralisation à travers un réseau de gares autonomes sans serveur central, capable de résister aux pannes et aux tricheries isolées.
- Comprendre le rôle du minage (recherche d'un Nonce sous contrainte de difficulté) et l'effort mécanique qu'il exige.
- Distinguer le fonctionnement et le coût énergétique de la Preuve de Travail (PoW) face à la Preuve d'Enjeu (PoS).
- Suivre une tentative d'attaque (course de chaînes et règle de la chaîne la plus longue) sur un aiguillage ferroviaire.

### 2.2 Métaphore retenue : Le Convoi Ferroviaire Blindé
Nous avons retenu la métaphore d'un **convoi ferroviaire blindé à parois vitrées** circulant à travers un réseau de gares interconnectées :
- **La locomotive de tête (Bloc Genesis #0 et protocole)** : Elle ouvre la voie sans conducteur central et impose les règles mathématiques du réseau.
- **Chaque wagon vitré représente un bloc** : Ses parois transparentes permettent à tout observateur de vérifier la cargaison (transactions) tout en empêchant son ouverture frauduleuse.
- **L'attelage magnétique coloré représente le chaînage cryptographique** : L'anneau arrière du wagon parent porte la couleur et le code de son Hash, tandis que le crochet avant du wagon suivant porte ce même code en tant que `previousHash`. L'attelage ne se verrouille que si les deux couleurs et signatures concordent.
- **La rupture mécanique d'attelage illustre la détection de falsification** : Modifier une cargaison dans un wagon déjà attelé recalcule immédiatement son Hash. Sa couleur d'anneau arrière change, créant une discordance avec le crochet avant du wagon suivant : l'attelage décroche physiquement et toute la suite du train passe en alerte rouge.
- **L'archipel de gares autonomes modélise la décentralisation** : Six gares réparties sur le territoire maintiennent chacune une copie complète du convoi et se relaient les nouvelles transactions de proche en proche, sans gare centrale.
- **L'effort mécanique et la molette crantée du Nonce figurent le minage (PoW)** : Pour atteler un nouveau wagon candidat, la machinerie doit faire tourner la molette crantée du Nonce cran par cran jusqu'à obtenir un Hash commençant par le nombre de zéros exigé par la difficulté du réseau.

### 2.3 Justification pédagogique et limites
| Question | Réponse et analyse |
|:---|:---|
| Quelles propriétés deviennent évidentes ? | L'ordre chronologique strict des blocs, la dépendance directe de chaque bloc envers son parent, le caractère immédiatement visible d'une rupture d'attelage en cas de fraude, et la résilience d'un réseau de gares sans chef central. |
| Quelles propriétés sont difficiles à représenter ou risquent d'être déformées ? | La fonction de hachage SHA-256 pourrait être perçue comme une simple attache mécanique plutôt que comme un calcul mathématique déterministe à sens unique. Par ailleurs, un train évoque un mouvement continu alors que les blocs sont validés par intervalles discrets. |
| Comment ces limites sont-elles compensées ? | La formule déterministe `SHA-256(Index + Parent + Cargaison + Nonce)` et les chaînes hexadécimales sont affichées en temps réel sur des infobulles 3D reliées par des traits SVG aux plaques des wagons. De plus, à l'étape 5, le wagon candidat attend à distance sur les rails et ne vient s'atteler par un à-coup net qu'à l'instant précis où le Nonce gagnant est trouvé. |

### 2.4 Métaphores écartées
| Métaphore envisagée | Points forts | Pourquoi écartée |
|:---|:---|:---|
| Coffres-forts dans une salle d'archives | Bonne représentation du scellement et de la sécurité | Convoque involontairement l'imaginaire d'une banque centrale unique et manque de dynamisme mécanique dans un espace 3D. |
| Cubes abstraits flottants dans le vide | Esthétique épurée et rapide à modéliser | Trop abstrait pour un public non initié ; ne transmet pas l'intuition physique d'un attelage mécanique qui résiste ou se décroche. |
| Registre comptable papier tamponné | Fidèle à l'analogie comptable du grand livre | Difficile à mettre en scène en 3D interactive et ne permet pas d'illustrer simplement l'effort du minage ou les aiguillages de branches. |

### 2.5 Charte visuelle
| Élément | Choix retenu | Justification pédagogique |
|:---|:---|:---|
| Palette et signification des couleurs | Fond nocturne bleu ardoise (`#0c192e`), châssis acier sombre (`#1e293b`), parois vitrées translucides, vert émeraude (`#10b981`) pour un wagon et un attelage valides, jaune ambre (`#f59e0b`) pour l'élément modifié ou en cours de minage, rouge signalisation (`#ef4444`) pour la rupture d'attelage et les blocs invalidés. Couleur dédiée dérivée du Hash (`hashToColorHex`) sur les anneaux d'attelage. | Double codage visuel : couleurs fonctionnelles normalisées (vert = valide, ambre = activité/modification, rouge = rupture/alerte) complétées par une couleur d'empreinte unique permettant de vérifier d'un seul coup d'œil si deux anneaux consécutifs portent la même signature. |
| Formes, style et niveau d'abstraction | Modélisation procédurale low-poly lisible : locomotive identifiable, wagons vitrés laissant voir les caisses de marchandises, molette crantée octogonale sur le flanc, gares stylisées sur pilotis. | Assure une identification immédiate de chaque organe fonctionnel tout en garantissant une fluidité supérieure à 55-60 FPS sur poste de TP. |
| Éclairage et ambiance | Ambiance nocturne crépusculaire avec éclairage trois points (keyLight, rimLight, fillLight) et halos émissifs sur les anneaux magnétiques et les voies de propagation. | Dirige naturellement le regard de l'utilisateur vers les zones actives (attelages, molettes, faisceaux entre gares) sans éblouissement. |
| Typographie et lisibilité | Police sans-serif sobre pour les explications du volet gauche ; police à chasse fixe (monospace) pour les empreintes hexadécimales, les formules SHA-256 et les compteurs de Nonce. | Facilite la lecture caractère par caractère des préfixes de zéros (`0`, `00`, `000`) et la comparaison entre `Hash` et `previousHash`. |
| Échelle et rapport de taille | Wagons de 2.4 unités de long espacés régulièrement sur l'axe X ; infobulles HTML/SVG projetées en 2D à partir des coordonnées 3D exactes des pièces. | Garantit que les étiquettes restent parfaitement lisibles quelle que soit la distance ou l'angle d'orbite choisi par l'utilisateur. |

---

## 3. Caméra, espace et navigation

| Question | Réponse et justification |
|:---|:---|
| Caméra libre, guidée ou mixte ? | **Caméra mixte** : chaque changement d'étape (ou clic sur un composant à inspecter) déclenche un déplacement cinématique amorti (`cameraController.moveTo`) vers le point d'intérêt, puis laisse à l'utilisateur la liberté de tourner autour de la scène à 360 degrés et de zoomer via `OrbitControls`. |
| Comment l'utilisateur sait-il où regarder ? | Outre le recadrage automatique de la caméra, des **infobulles 3D reliées par des pointeurs vectoriels SVG** désignent avec précision les pièces concernées (plaque de Hash, crochet `previousHash`, molette du Nonce, gares). |
| Organisation spatiale et signification des positions | Sur les étapes ferroviaires (0, 1, 2, 3, 5, 7), le train est aligné sur l'axe X de gauche à droite. Sur l'étape 4, le décor linéaire s'efface au profit d'un **archipel territorial** étalé dans le plan XZ regroupant 6 gares. Sur l'étape 6, 3 gares sont alignées symétriquement face à l'utilisateur pour comparer PoW et PoS. |
| Représentation du temps | Le sens de lecture occidental (de gauche à droite) représente la chronologie : la locomotive Genesis (#0) est à gauche, suivie du Wagon #1, du Wagon #2 et des nouveaux wagons candidats à droite. |
| Passage d'une notion à l'autre | Navigation à double entrée sur le volet latéral gauche : boutons d'action progressifs en bas de volet ("Étape suivante") et **marque-pages numérotés de 0 à 7** fixés en permanence sur la tranche droite du volet. |

---

## 4. Fiches des 7 notions obligatoires

### 4.1 — Structure d'un bloc : données, hash du bloc, hash du bloc parent et, si pertinent, nonce

**Issues liées :** #6, #7  
**Séquence(s) concernée(s) :** Étape 1 (`src/steps/step1.js`)

#### a) Objectif pédagogique
> L'utilisateur doit comprendre qu'un bloc n'est pas une boîte noire opaque, mais un conteneur structuré réunissant quatre éléments indissociables : les données transportées (transactions), l'empreinte du bloc parent (`previousHash`), un compteur d'ajustement mécanique (`Nonce`) et l'empreinte cryptographique propre du bloc (`Hash`), calculée de manière déterministe à partir des trois premiers éléments.

#### b) Risque de mauvaise compréhension
> L'utilisateur ne doit pas comprendre que le Hash est un numéro attribué au hasard ou que le Nonce modifie les transactions transportées dans le bloc.

#### c) Représentation choisie
| Dimension | Choix | Pourquoi ce choix sert la compréhension |
|:---|:---|:---|
| Forme / géométrie | Wagon blindé à parois vitrées entouré de 4 infobulles 3D reliées par des lignes SVG aux 4 organes physiques : caisses de marchandises à l'intérieur, crochet avant (`previousHash`), molette crantée sur le flanc (`Nonce`) et plaque centrale (`Hash`). | Permet d'associer chaque terme technique à une pièce mécanique concrète et localisable dans l'espace 3D. |
| Taille et échelle | Cadrage rapproché sur le Wagon #1 isolé avec la locomotive (#0) à sa gauche. | Évite toute surcharge visuelle en concentrant l'attention sur l'anatomie d'un seul wagon. |
| Couleur / matériau / texture | Parois en verre physique translucide (`MeshPhysicalMaterial`), caisses internes colorées selon le chargement, anneau arrière prenant dynamiquement la couleur issue du Hash (`hashToColorHex`). | Illustre la transparence publique de la blockchain : le contenu est lisible de l'extérieur mais scellé dans le wagon. |
| Position | Wagon #1 centré face à la caméra avec rotation orbitale débloquée à 360 degrés. | Invite l'utilisateur à tourner autour du wagon pour observer ses quatre faces. |
| Mouvement / animation | Apparition/modification physique des caisses lors du changement de cargaison et rotation crantée de 45 degrés de la molette lors de l'incrémentation du Nonce. | Montre immédiatement quelle pièce bouge lorsque l'utilisateur agit sur les données ou sur le Nonce. |
| Interaction et retour visuel | Deux boutons d'expérimentation directe (« Modifier la cargaison » et « Tourner la molette du Nonce (+1) ») + clic sur les 4 infobulles anatomiques + affichage en direct de la formule déterministe `SHA-256(...)`. | L'utilisateur vérifie par lui-même que changer la cargaison ou tourner le Nonce recalcule instantanément une empreinte SHA-256 différente, et qu'un même couple (cargaison, Nonce) redonne toujours exactement le même Hash. |
| Son, si utilisé | Aucun. | Sobriété et concentration sur les retours visuels. |
| Texte d'accompagnement | Volet pédagogique gauche structuré + encadré de formule mathématique SHA-256 + 4 infobulles 3D synthétiques. | Relie l'observation 3D à la règle mathématique réelle du hachage déterministe. |

#### d) Correspondance avec la réalité technique
| Élément visuel | Élément réel | Fidélité (exacte / simplifiée / approximative) |
|:---|:---|:---|
| Caisses de marchandises visibles à travers les vitres | Données du bloc (liste des transactions validées) | Simplifiée (un lot de transactions résumé par wagon pour la lisibilité). |
| Crochet d'attelage avant et son étiquette | Champ `previousHash` dans l'en-tête du bloc | Exacte dans son rôle de référence au bloc parent. |
| Molette latérale crantée | Champ `nonce` (entier incrémenté dans l'en-tête du bloc) | Exacte dans son principe d'entier variable modifiant l'empreinte. |
| Plaque centrale et couleur de l'anneau arrière | Empreinte cryptographique SHA-256 du bloc courant | Exacte sur le déterminisme et l'effet avalanche, affichée en format tronqué + code couleur. |

#### e) Alternative écartée
| Alternative | Raison du rejet |
|:---|:---|
| Panneau de formulaire 2D plein écran sans pointeurs sur le wagon 3D | Déconnectait les champs textuels de la géométrie 3D du wagon ; les 4 infobulles reliées en SVG directement aux pièces du wagon se sont révélées beaucoup plus parlantes. |

#### f) Tests utilisateurs
| Observation | Modification | Issue |
|:---|:---|:---|
| Lors des pré-tests internes, l'utilisateur comprenait que le Hash changeait mais pouvait croire qu'il était tiré aléatoirement à chaque clic. | Ajout de l'encadré affichant en temps réel l'équation déterministe `SHA-256(Bloc #1 + Parent + Cargaison + Nonce)` pour prouver que revenir aux mêmes entrées redonne le même Hash. | #7, #17 |

#### g) Limites assumées
L'arbre de Merkle est représenté sous la forme d'un chargement unifié de caisses dans le wagon afin de ne pas noyer un débutant sous un graphe binaire dès la première étape.

---

### 4.2 — Chaînage cryptographique : hash/empreinte cryptographique, lien avec le bloc parent et effet de la moindre modification

**Issues liées :** #8  
**Séquence(s) concernée(s) :** Étape 2 (`src/steps/step2.js`)

#### a) Objectif pédagogique
> L'utilisateur doit comprendre que les blocs ne sont pas simplement posés les uns derrière les autres, mais scellés entre eux parce que chaque nouveau bloc embarque à l'avant (`previousHash`) la copie exacte de l'empreinte (`Hash`) du bloc qui le précède.

#### b) Risque de mauvaise compréhension
> L'utilisateur ne doit pas penser que l'attelage entre deux wagons est un simple câble physique indépendant des données contenues dans les wagons.

#### c) Représentation choisie
| Dimension | Choix | Pourquoi ce choix sert la compréhension |
|:---|:---|:---|
| Forme / géométrie | Vue panoramique du convoi montrant simultanément les jonctions entre wagons, surmontées de cartes de liaison SVG comparant côte à côte le `Hash` du wagon `N-1` et le `PreviousHash` du wagon `N`. | Met en évidence la répétition du mécanisme d'attelage sur toute la longueur du train. |
| Taille et échelle | Plan d'ensemble cadrant la locomotive (#0) et jusqu'à 3 wagons successifs (#1, #2, #3). | Permet d'embrasser du regard la chaîne complète et de suivre la transmission des empreintes de gauche à droite. |
| Couleur / matériau / texture | Concordance chromatique stricte : l'anneau arrière du wagon parent et le crochet avant du wagon enfant partagent exactement la même teinte issue du Hash parent, reliés par un faisceau vert émeraude valide. | La correspondance de couleur prouve visuellement l'égalité `Wagon[N].previousHash === Wagon[N-1].hash` avant même de lire les caractères hexadécimaux. |
| Position | Alignement chronologique horizontal de gauche à droite sur la voie principale. | Respecte le sens naturel de lecture pour suivre l'héritage des empreintes. |
| Mouvement / animation | Arrivée cinématique et verrouillage d'un nouveau wagon lorsque l'utilisateur agrandit le convoi, avec recadrage automatique de la caméra pour garder tout le train visible. | Montre dynamiquement comment un nouveau bloc s'arrime au dernier maillon existant. |
| Interaction et retour visuel | Bouton « Atteler un nouveau wagon au convoi » permettant d'ajouter les Wagons #2 puis #3, et sélection directe de n'importe quelle liaison pour inspecter la paire d'empreintes. | Rend l'utilisateur acteur de la construction de la chaîne bloc par bloc. |
| Son, si utilisé | Aucun. | Cohérence avec la charte silencieuse du projet. |
| Texte d'accompagnement | Infobulles comparatives symétriques au-dessus de chaque jonction (`Hash #1 == Attache #2 : LIÉ`) et synthèse progressive dans le volet gauche. | Valide explicitement la condition mathématique d'attelage sur chaque maillon. |

#### d) Correspondance avec la réalité technique
| Élément visuel | Élément réel | Fidélité (exacte / simplifiée / approximative) |
|:---|:---|:---|
| Double anneau de même couleur entre le wagon `N-1` et le wagon `N` | Pointeur cryptographique `block[N].previousHash === block[N-1].hash` | Exacte. |
| Ajout d'un wagon reprenant la signature arrière du dernier wagon | Création d'un bloc enfant référençant le dernier bloc de la chaîne | Exacte. |

#### e) Alternative écartée
| Alternative | Raison du rejet |
|:---|:---|
| Inspection d'une seule jonction isolée sans possibilité d'allonger le train | Ne faisait pas assez ressentir la notion de « chaîne » évolutive qui s'allonge de bloc en bloc. |

#### f) Tests utilisateurs
| Observation | Modification | Issue |
|:---|:---|:---|
| Besoin de comparer simultanément toutes les jonctions du train sans devoir cliquer sur chaque wagon un par un. | Mise en place d'un bandeau panoramique d'infobulles SVG affichant toutes les liaisons actives en parallèle. | #8, #17 |

#### g) Limites assumées
Dans cette étape 2 dédiée à la compréhension du chaînage normal, les nouveaux wagons s'attellent directement avec un Hash valide afin d'isoler la notion de pointeur cryptographique avant d'aborder le minage à l'étape 5.

---

### 4.3 — Immutabilité et détection de falsification : une modification rend les empreintes incohérentes et doit être détectable par les autres nœuds

**Issues liées :** #9  
**Séquence(s) concernée(s) :** Étape 3 (`src/steps/step3.js`)

#### a) Objectif pédagogique
> L'utilisateur doit comprendre pourquoi une donnée enregistrée dans un bloc ancien est réputée immuable : modifier après coup le contenu du Wagon #1 recalcule immédiatement son empreinte (`Hash #1`), ce qui brise la correspondance avec l'attache (`PreviousHash #2`) du wagon suivant et invalide en cascade toute la suite du convoi.

#### b) Risque de mauvaise compréhension
> L'utilisateur ne doit pas croire qu'une falsification est matériellement impossible à tenter localement ; il doit comprendre qu'elle est **immédiatement détectable** car elle rompt la cohérence mathématique de la chaîne.

#### c) Représentation choisie
| Dimension | Choix | Pourquoi ce choix sert la compréhension |
|:---|:---|:---|
| Forme / géométrie | Cadrage centré sur le Wagon #1 et sa jonction avec le Wagon #2, accompagné de 2 infobulles 3D reliées par des lignes SVG : l'une pointant à la fois sur la plaque centrale et l'anneau arrière du Wagon #1, l'autre pointant sur le crochet avant décroché du Wagon #2. | Montre avec une précision chirurgicale l'endroit exact où naît l'incohérence entre le bloc modifié et son successeur. |
| Taille et échelle | Plan moyen englobant la Locomotive (#0), le Wagon #1 (cible de la falsification) et le Wagon #2 (témoin de la rupture). | Permet de voir simultanément que la liaison amont (`#0 <-> #1`) reste intacte tandis que la liaison aval (`#1 <-> #2`) se brise. |
| Couleur / matériau / texture | Lors de la falsification : le Wagon #1 vire au jaune ambre (bloc altéré) et son anneau arrière prend la nouvelle couleur de son Hash recalculé, tandis que le crochet avant du Wagon #2 conserve l'ancienne couleur attendue ; le faisceau d'attelage disparaît et le Wagon #2 passe au rouge alerte (`#ef4444`). | Rend la cause du décrochage évidente : les deux anneaux qui se font face n'ont plus ni le même code hexadécimal ni la même couleur. |
| Position | Le Wagon #2 recule physiquement sur les rails au moment de la falsification pour matérialiser un espace vide de rupture entre les deux wagons. | Traduit l'invalidité cryptographique par une séparation spatiale franche dans la scène 3D. |
| Mouvement / animation | Recul mécanique amorti du Wagon #2 lors de la fraude, puis onde lumineuse de restauration et ré-accrochage lorsque l'utilisateur rétablit la cargaison d'origine. | Renforce le lien de cause à effet entre l'intégrité de la cargaison et la solidarité mécanique du train. |
| Interaction et retour visuel | Choix interactif de plusieurs cargaisons falsifiées (détournement de destinataire, gonflement du montant) et bouton de restauration de la cargaison légitime. | L'utilisateur provoque lui-même la fraude et observe en direct la réaction de la chaîne. |
| Son, si utilisé | Aucun. | Sobriété visuelle privilégiée. |
| Texte d'accompagnement | Présentation neutre avant l'action (sans divulgâcher l'effet), puis apparition du diagnostic détaillé expliquant la divergence entre le nouveau `Hash #1` et l'`Attache #2` restée figée. | Favorise l'apprentissage actif par l'observation avant de formaliser l'explication. |

#### d) Correspondance avec la réalité technique
| Élément visuel | Élément réel | Fidélité (exacte / simplifiée / approximative) |
|:---|:---|:---|
| Changement immédiat du Hash #1 et de sa couleur dès la modification du chargement | Effet avalanche de la fonction SHA-256 (toute modification de `data` produit un hash radicalement différent) | Exacte. |
| Décrochage entre l'anneau arrière du Wagon #1 et le crochet avant du Wagon #2 | Invalidation du lien `block[2].previousHash !== block[1].hash` lors de la vérification de la chaîne | Exacte. |
| Maintien de l'attelage entre la Locomotive #0 et le Wagon #1 | Le `previousHash` du bloc #1 pointe toujours validement vers le bloc #0 ; ce sont uniquement les blocs suivants qui sont décrochés | Exacte (corrige l'erreur fréquente consistant à casser le lien amont). |

#### e) Alternative écartée
| Alternative | Raison du rejet |
|:---|:---|
| Colorer tout le train en rouge uniforme sans distinguer le bloc modifié des blocs décrochés | Empêchait de comprendre *pourquoi* la chaîne cassait : en mettant le Wagon #1 en ambre (modifié) avec sa nouvelle couleur de Hash et le Wagon #2 en rouge (décroché), la mécanique causale devient limpide. |

#### f) Tests utilisateurs
| Observation | Modification | Issue |
|:---|:---|:---|
| Les traits des infobulles devaient pointer précisément sur l'étiquette centrale et sur les anneaux d'attelage sans flotter dans le vide lors des rotations caméra. | Implémentation d'un calcul de projection 3D vers SVG recalculé à chaque frame (`updateTooltipsPosition`) reliant exactement les boîtes aux connecteurs 3D. | #9, #17 |

#### g) Limites assumées
Dans cette étape 3, le pirate modifie la donnée sans recalculer la preuve de travail des blocs suivants ; la question du recalcul complet d'une chaîne concurrente par un attaquant puissant est traitée spécifiquement à l'étape 7 (attaque des 51 %).

---

### 4.4 — Réseau et décentralisation : nœuds, copies distribuées et propagation des transactions/blocs, sans centre unique

**Issues liées :** #10  
**Séquence(s) concernée(s) :** Étape 4 (`src/steps/step4.js`)

#### a) Objectif pédagogique
> L'utilisateur doit comprendre qu'il n'existe aucun serveur central détenant « la » blockchain : le réseau est constitué d'une multitude de nœuds autonomes (les gares) qui possèdent chacun une copie complète du convoi, se propagent les nouveautés de proche en proche et rejettent majoritairement toute copie locale falsifiée.

#### b) Risque de mauvaise compréhension
> L'utilisateur ne doit pas imaginer qu'une gare centrale distribue les ordres ou que la panne d'un nœud bloque l'ensemble du réseau.

#### c) Représentation choisie
| Dimension | Choix | Pourquoi ce choix sert la compréhension |
|:---|:---|:---|
| Forme / géométrie | **Archipel ferroviaire décentralisé de 6 gares autonomes** (Gare A à Gare F) réparties sur un territoire dégagé et reliées par un maillage de voies ferrées, chaque gare exposant sur son quai son propre mini-convoi (copie locale du registre). | Remplace avantageusement un schéma abstrait de graphes informatiques tout en restant fidèle à l'univers ferroviaire : chaque gare est un nœud complet (*full node*) qui conserve sa copie du train. |
| Taille et échelle | Vue aérienne plongeante embrassant l'ensemble du territoire et les 6 gares simultanément. | Montre d'emblée l'absence de centre hiérarchique : toutes les gares ont la même taille et le même statut. |
| Couleur / matériau / texture | Gares actives éclairées en vert émeraude, impulsions lumineuses cyan circulant le long des voies lors de la propagation, gare éteinte (en panne) assombrie en gris ardoise, gare pirate isolée clignotant en rouge lors d'une tentative de tricherie locale. | Permet de lire instantanément l'état de santé et de synchronisation de chaque nœud du réseau. |
| Position | Disposition hexagonale/maillée dans le plan XZ (Ouest, Nord-Ouest, Sud-Ouest, Nord-Est, Sud-Est, Est) offrant plusieurs chemins redondants entre la Gare A et la Gare F. | Indispensable pour démontrer visuellement le routage alternatif lorsqu'une gare intermédiaire tombe en panne. |
| Mouvement / animation | Propagation séquentielle par vagues de proche en proche (protocole *Gossip* : `Gare A -> Gares B, C -> Gares D, E -> Gare F`) matérialisée par des convois/impulsions lumineuses, suivie de l'ajout simultané d'un wagon sur le quai de chaque gare atteinte. | Illustre concrètement que l'information ne voyage pas d'un centre vers des clients, mais rebondit de voisin en voisin jusqu'à synchroniser tous les quais. |
| Interaction et retour visuel | Trois interactions complémentaires :<br>1) **Propager une transaction** de proche en proche.<br>2) **Cliquer directement en 3D sur une gare** (Raycaster) pour l'éteindre (panne de nœud) et vérifier que la transaction contourne l'obstacle par les gares voisines.<br>3) **Simuler une tricherie locale sur une gare** et observer son rejet par les 5 autres gares majoritaires. | Couvre par l'expérimentation directe les trois propriétés clés d'un réseau pair-à-pair : propagation Gossip, tolérance aux pannes et résistance à la falsification isolée. |
| Son, si utilisé | Aucun (le carillon Web Audio testé initialement a été retiré pour préserver la sobriété). | Évite toute distraction auditive lors de l'observation des trajets de propagation. |
| Texte d'accompagnement | Étiquettes 3D au-dessus de chaque gare (nom, état actif/éteint, nombre de wagons en registre) et journal de routage dans le volet gauche. | Confirme par le texte le chemin exact emprunté par la propagation et le maintien du consensus majoritaire. |

#### d) Correspondance avec la réalité technique
| Élément visuel | Élément réel | Fidélité (exacte / simplifiée / approximative) |
|:---|:---|:---|
| Gare autonome avec son mini-train sur le quai | Nœud complet (*Full Node*) stockant localement une copie intégrale de la blockchain | Exacte. |
| Impulsions voyageant de gare voisine en gare voisine | Diffusion pair-à-pair par protocole *Gossip* (inondation de proche en proche) | Exacte. |
| Contournement d'une gare éteinte au clic 3D | Tolérance aux pannes du maillage P2P décentralisé | Exacte. |
| Rejet d'un wagon falsifié sur une seule gare par les 5 autres | Impossibilité pour un nœud isolé d'imposer un historique invalide au reste du réseau | Exacte. |

#### e) Alternative écartée
| Alternative | Raison du rejet |
|:---|:---|
| Représenter des tours d'ordinateurs reliées par des câbles RJ45 | Rompait brutalement la métaphore du Convoi Ferroviaire Blindé ; les gares ferroviaires dotées de leur propre copie du train sur quai prolongent naturellement le fil rouge. |

#### f) Tests utilisateurs
| Observation | Modification | Issue |
|:---|:---|:---|
| S'assurer que l'utilisateur comprend pourquoi la modification réussie localement à l'étape 3 ne suffit pas à tromper le réseau à l'étape 4. | Ajout du bouton « Tenter une tricherie sur une gare » montrant que les 5 autres gares comparent leur registre et refusent la version altérée de la gare isolée. | #10, #17 |

#### g) Limites assumées
Le réseau est représenté avec 6 gares afin que chaque nœud et chaque voie de liaison restent parfaitement lisibles à l'écran tout en maintenant 60 FPS constants, là où une blockchain publique réelle compte des milliers de nœuds.

---

### 4.5 — Validation et minage : vérification d'une transaction ou d'un bloc et, dans le cas du proof of work (PoW), recherche d'un nonce sous contrainte de difficulté

**Issues liées :** #11  
**Séquence(s) concernée(s) :** Étape 5 (`src/steps/step5.js`)

#### a) Objectif pédagogique
> L'utilisateur doit comprendre pourquoi l'ajout d'un nouveau bloc exige du travail : pour avoir le droit d'atteler le Wagon #2 candidat au convoi, il faut faire tourner la molette du `Nonce` jusqu'à découvrir par essais successifs une empreinte `Hash` commençant par le nombre de zéros imposé par la difficulté du réseau (`0`, `00` ou `000`).

#### b) Risque de mauvaise compréhension
> L'utilisateur ne doit pas penser que le minage consiste à chiffrer les données ou à résoudre une équation directe sans tâtonnement ; il s'agit d'une recherche par force brute (essais/erreurs) dont la durée augmente fortement avec le nombre de zéros exigés.

#### c) Représentation choisie
| Dimension | Choix | Pourquoi ce choix sert la compréhension |
|:---|:---|:---|
| Forme / géométrie | À gauche, le convoi déjà validé (Locomotive #0 et Wagon #1 dont les Hashs commencent déjà par les zéros requis) ; à droite, **maintenu à distance sur les rails (`x = 8.55`), le Wagon #2 candidat** muni de sa molette crantée du Nonce et de 2 infobulles SVG pointant sur la molette et sur la plaque de Hash. | La séparation spatiale entre le convoi validé et le wagon candidat en attente matérialise visuellement qu'un bloc non miné n'a pas encore le droit d'être attelé. |
| Taille et échelle | Cadrage rapproché centré sur le Wagon #2 candidat, sa molette latérale et l'espace d'attelage qui le sépare du Wagon #1. | Permet à l'utilisateur de cliquer directement sur la molette 3D et de lire en temps réel les premiers caractères du Hash sur la plaque. |
| Couleur / matériau / texture | Tant que le Hash ne commence pas par les zéros requis, le voyant et le statut du Wagon #2 restent en orange d'attente ; dès que le préfixe cible (`0`, `00` ou `000`) est atteint, la plaque et l'anneau passent au vert émeraude et une aura circulaire lumineuse souligne le verrouillage de l'attelage. | Offre un retour visuel binaire immédiat entre un essai infructueux (orange) et la découverte du Nonce gagnant (vert + flash d'attelage). |
| Position | Le Wagon #2 candidat stationne à `x = 8.55` pendant toute la recherche, puis glisse sur les rails jusqu'à `x = 7.60` pour s'accrocher physiquement au Wagon #1 dès que le Nonce valide est trouvé. | Montre que l'accrochage physique à la chaîne est la récompense directe de la preuve de travail accomplie. |
| Mouvement / animation | **Cohérence mécanique stricte : 1 essai = +1 sur le Nonce = +1 cran de 45 degrés sur la molette 3D**. En mode automatique, la molette accélère proportionnellement à la difficulté choisie et s'arrête pile sur le cran du Nonce gagnant avant la translation d'attelage. | Établit un lien physique 1:1 entre l'itération algorithmique (`nonce++`) et le mouvement mécanique de l'engrenage 3D. |
| Interaction et retour visuel | Trois actions complémentaires :<br>1) **Sélecteur de difficulté** (1 zéro `"0"`, 2 zéros `"00"`, 3 zéros `"000"`).<br>2) **Clic direct en 3D sur la molette** (ou bouton `+1 essai`) pour tester manuellement cran par cran.<br>3) **Bouton de minage automatique** poursuivant la rotation depuis le cran actuel jusqu'au Nonce gagnant, avec compteur d'essais et rappel de la formule `SHA-256`. | En essayant d'abord manuellement cran par cran, l'utilisateur ressent le caractère fastidieux du tâtonnement avant de comprendre pourquoi une machine automatisée est nécessaire lorsque la difficulté augmente. |
| Son, si utilisé | Aucun. | Maintien de la sobriété générale. |
| Texte d'accompagnement | Infobulles SVG dégagées hors des plaques pour ne jamais masquer le numéro du Nonce, affichage de la cible exigée (`Hash commençant par 00...`) et bilan du nombre d'essais réalisés. | Explicite la règle du jeu (trouver le préfixe de zéros) et quantifie l'effort fourni. |

#### d) Correspondance avec la réalité technique
| Élément visuel | Élément réel | Fidélité (exacte / simplifiée / approximative) |
|:---|:---|:---|
| Rotation d'un cran de la molette incrémentant le Nonce de +1 | Incrémentation de la variable `nonce` dans l'en-tête du bloc à chaque itération de hachage | Exacte. |
| Exigence d'un Hash débutant par `"0"`, `"00"` ou `"000"` | Cible de difficulté (*difficulty target*) imposant que le hash soit inférieur à un seuil donné (préfixe de zéros) | Exacte dans son principe, avec un nombre de zéros réduit à 1-3 pour rester observable en quelques secondes. |
| Attelage du Wagon #2 au convoi une fois le préfixe obtenu | Validation et ajout du bloc miné à la blockchain | Exacte. |

#### e) Alternative écartée
| Alternative | Raison du rejet |
|:---|:---|
| Générer un nuage d'étincelles purement décoratif sans lier l'angle de la molette au numéro exact du Nonce | Les étincelles masquaient les plaques de texte et donnaient une impression d'animation factice ; elles ont été retirées au profit d'une synchronisation stricte `1 essai = 1 cran = 1 Hash réel`. |

#### f) Tests utilisateurs
| Observation | Modification | Issue |
|:---|:---|:---|
| Initialement, lancer le minage automatique repartait de zéro au lieu de continuer depuis les crans déjà tournés à la main par l'utilisateur, et certaines infobulles mordaient sur le chiffre du Nonce. | Correction de la logique pour poursuivre exactement depuis le `nonce` courant et décalage des ancres SVG hors des plaques et du compteur. | #11, #17 |

#### g) Limites assumées
Sur Bitcoin, la cible exige des dizaines de zéros binaires et des milliards de milliards d'essais par seconde ; limiter l'interaction à 1, 2 ou 3 zéros hexadécimaux permet à l'utilisateur de voir défiler les crans et de vérifier lui-même le préfixe obtenu.

---

### 4.6 — Comparaison d'au moins deux mécanismes de consensus : par exemple proof of work (PoW) et proof of stake (PoS), en expliquant leurs différences, avantages et limites

**Issues liées :** #12  
**Séquence(s) concernée(s) :** Étape 6 (`src/steps/step6.js`)

#### a) Objectif pédagogique
> L'utilisateur doit comprendre la différence fondamentale entre la **Preuve de Travail (PoW)** — où toutes les gares font tourner leur molette en même temps dans une course énergivore alors qu'une seule gagnera — et la **Preuve d'Enjeu (PoS)** — où une loterie pondérée par la caution déposée désigne d'abord une unique gare qui valide ensuite le wagon avec une seule molette, sans gaspillage d'énergie chez les autres.

#### b) Risque de mauvaise compréhension
> L'utilisateur ne doit pas croire qu'en PoS il n'y a plus aucune validation du bloc, ni confondre la part de puissance informatique (en PoW) avec la part de jetons mis en caution (en PoS).

#### c) Représentation choisie
| Dimension | Choix | Pourquoi ce choix sert la compréhension |
|:---|:---|:---|
| Forme / géométrie | **Mise en scène comparative symétrique sur 3 gares du réseau** (Gare A : 50 %, Gare B : 35 %, Gare C : 15 %) alignées face au convoi et cherchant à valider et atteler le même Wagon #2 candidat :<br>- **En mode PoW** : les 3 gares sont équipées d'une molette du Nonce.<br>- **En mode PoS** : les gares exposent leur coffre de caution ; un halo lumineux 3D balaye les gares lors du tirage au sort, puis seule la gare élue déploie sa molette pour valider le wagon. | Conserver exactement les 3 mêmes gares et les mêmes pourcentages (50 %, 35 %, 15 %) dans les deux modes permet une comparaison rigoureuse toutes choses égales par ailleurs. |
| Taille et échelle | Plan d'ensemble cadrant simultanément les 3 gares en arrière-plan et le convoi (Locomotive #0, Wagon #1 et Wagon #2 candidat) au premier plan. | Permet d'observer en un seul coup d'œil l'activité des 3 gares et son résultat concret sur l'attelage du Wagon #2. |
| Couleur / matériau / texture | En PoW, les 3 molettes s'illuminent simultanément pendant la course, puis les 2 perdantes s'éteignent (travail perdu). En PoS, un halo ambre/cyan balaye les 3 gares pendant le tirage au sort avant de se fixer en vert sur la gare élue pendant que les 2 autres restent au repos. | Rend immédiatement visible l'opposition entre la dépense énergétique collective (3 gares actives en PoW) et la sobriété ciblée (1 seule gare active en PoS). |
| Position | Les 3 gares sont disposées côte à côte le long de la voie avec leurs infobulles 3D respectives indiquant leur part (en % de puissance ou en % de caution) et leur compteur de crans tournés. | Facilite la lecture comparative des compteurs de crans et d'énergie dépensée entre les 3 gares. |
| Mouvement / animation | - **En PoW (course des 3 molettes)** : les 3 molettes tournent en même temps à des vitesses proportionnelles à leur puissance informatique (Gare A : 10 crans/s, Gare B : 7 crans/s, Gare C : 3 crans/s) jusqu'à ce que l'une trouve le Nonce gagnant du Wagon #2.<br>- **En PoS (loterie puis molette unique)** : 1) une barre de loterie proportionnelle et un halo 3D tirent au sort une gare selon sa caution ; 2) seule la gare tirée au sort fait tourner sa molette jusqu'au Nonce du Wagon #2 pendant que les 2 autres restent à `0 cran`. | Démontre visuellement pourquoi le PoW consomme énormément d'énergie (2 gares sur 3 ont tourné à pleine vitesse pour rien) tandis que le PoS économise plus de 99 % de cet effort. |
| Interaction et retour visuel | Bascule libre entre les onglets **« Preuve de Travail (PoW) »** et **« Preuve d'Enjeu (PoS) »**, bouton de lancement de la validation sur plusieurs manches successives, barre de loterie proportionnelle en PoS et tableau comparatif synthétique (critère de sélection, dépense énergétique, avantage, limite). | L'utilisateur expérimente les deux régimes de consensus et constate la synchronisation réelle du Nonce gagnant sur le Wagon #2 attelé. |
| Son, si utilisé | Aucun. | Cohérence globale. |
| Texte d'accompagnement | Infobulles 3D épurées au-dessus de chaque gare et paragraphe de résultat expliquant pourquoi la gare gagnante l'a emporté et quel a été le coût pour le réseau. | Traduit l'animation 3D en bilan énergétique et économique clair. |

#### d) Correspondance avec la réalité technique
| Élément visuel | Élément réel | Fidélité (exacte / simplifiée / approximative) |
|:---|:---|:---|
| Course simultanée des 3 molettes à 10, 7 et 3 crans/s (50 %, 35 %, 15 %) | Compétition de hachage en Proof of Work proportionnelle au *hashrate* de chaque mineur | Exacte dans son principe probabiliste et énergétique. |
| Travail perdu des 2 gares non retenues en PoW | Calculs de hachage rejetés des mineurs n'ayant pas trouvé le bloc en premier | Exacte. |
| Tirage au sort sur barre proportionnelle aux jetons déposés (50, 35, 15 jetons) | Sélection pseudo-aléatoire du validateur pondérée par le *stake* en Proof of Stake | Exacte. |
| Validation par la seule gare élue pendant que les 2 autres restent à 0 cran | Absence de compétition énergétique en PoS : seul le validateur désigné forge et signe le bloc | Simplifiée (la signature d'attestation PoS est représentée par la molette unique pour conserver le repère visuel familier du wagon). |

#### e) Alternative écartée
| Alternative | Raison du rejet |
|:---|:---|
| Afficher uniquement un tableau de texte comparatif PoW / PoS sans mise en scène sur les gares | Contraire à l'esprit du projet R507 où chaque notion doit reposer sur une animation 3D observable et interactive. |

#### f) Tests utilisateurs
| Observation | Modification | Issue |
|:---|:---|:---|
| En PoS, si le wagon s'attelait instantanément après la loterie sans action sur le wagon, l'utilisateur comprenait mal le lien avec l'attelage du bloc. | Ajout d'une seconde phase (`pos_mining`) où seule la gare élue actionne sa molette pour sceller le Wagon #2 pendant que les 2 autres gares affichent explicitement `0 cran tourné (repos)`. | #12, #17 |

#### g) Limites assumées
Les mécanismes de *slashing* (confiscation de la caution en cas de fraude en PoS) et de comités d'attestation sont résumés dans l'explication pédagogique afin de garder la scène 3D centrée sur la différence fondamentale entre compétition mécanique (PoW) et élection pondérée par l'enjeu (PoS).

---

### 4.7 — Cycle de vie d'une transaction et scénario d'attaque illustré : création, propagation, validation, inclusion dans un bloc, confirmation, puis illustration d'une attaque et de sa détection/limitation

**Issues liées :** #13, #17  
**Séquence(s) concernée(s) :** Étape 7 (`src/steps/step7.js`)

#### a) Objectif pédagogique
> L'utilisateur doit comprendre comment le réseau tranche entre deux historiques concurrents grâce à la **règle de la chaîne la plus longue** (ou accumulant le plus de travail), et pourquoi un attaquant isolé (20 % de puissance) échoue à remplacer une transaction confirmée alors qu'un attaquant contrôlant la majorité du réseau (**attaque des 51 %**) parvient à assembler une branche pirate plus longue qui finit par s'imposer sur l'aiguillage.

#### b) Risque de mauvaise compréhension
> L'utilisateur ne doit pas croire qu'une attaque des 51 % permet de créer des jetons à partir de rien ou de voler n'importe quel portefeuille sans clé privée ; elle permet uniquement de réorganiser les derniers blocs pour réaliser une **double dépense** en doublant de vitesse la chaîne honnête.

#### c) Représentation choisie
| Dimension | Choix | Pourquoi ce choix sert la compréhension |
|:---|:---|:---|
| Forme / géométrie | **Aiguillage symétrique en Y juste après le Wagon #1** :<br>- À gauche sur le rail central (`z = 0`) : la Locomotive (#0) et le Wagon #1 déjà validés.<br>- En haut (`z = -1.85`) : la branche préparée par les **Gares honnêtes** (Wagons #2, #3, #4).<br>- En bas (`z = +1.85`) : la branche préparée en parallèle par le **Pirate** (Wagons pirates #2, #3, #4 tentant d'imposer une transaction détournée). | L'embranchement ferroviaire en Y (*fork*) est la traduction spatiale la plus directe d'une bifurcation de chaîne (deux versions concurrentes de la suite du train). |
| Taille et échelle | Vue d'ensemble cadrant le tronc commun à gauche, l'aiguillage en Y au centre et les deux voies parallèles de course à droite. | Permet de comparer en temps réel la longueur des deux branches en cours d'assemblage. |
| Couleur / matériau / texture | Branche honnête en teintes cyan/émeraude, branche pirate en teintes rouge/ambre avec molettes de minage tournant en tête de chaque branche. La branche perdante est grisée sur sa voie de garage une fois la course terminée. | Identifie immédiatement les deux camps et le statut final (branche retenue sur le rail central vs branche orpheline abandonnée). |
| Position | Pendant la course, aucune des deux branches n'est encore rattachée au Wagon #1 ; à l'issue de la course, **seule la branche qui a assemblé 3 wagons en premier glisse latéralement sur le rail central (`z = 0`)** et vient s'atteler physiquement au Wagon #1. | Illustre physiquement la règle de consensus : le réseau ne retient comme vérité officielle que la chaîne valide la plus longue. |
| Mouvement / animation | Course d'assemblage des wagons #2, #3 et #4 sur les deux branches selon le rapport de puissance choisi :<br>- **Cas normal (Pirate minoritaire 20 % vs Réseau 80 %)** : les gares honnêtes assemblent 3 wagons pendant que le pirate n'en assemble qu'un seul ; la branche honnête glisse sur le rail central et s'attelle au Wagon #1.<br>- **Attaque des 51 % (Pirate majoritaire 60 % vs Réseau 40 %)** : la molette pirate tourne plus vite, assemble 3 wagons avant le réseau et vient s'atteler au Wagon #1, reléguant la branche honnête sur la voie de garage. | Fait vivre visuellement la notion de course de vitesse (*race attack*) qui sous-tend à la fois la sécurité normale de la blockchain et le cas limite de l'attaque des 51 %. |
| Interaction et retour visuel | Bascule interactive entre le **Scénario 1 : Réseau sain (Pirate à 20 %)** et le **Scénario 2 : Attaque des 51 % (Pirate à 60 %)**, bouton de lancement de la course de minage et infobulles 3D sur chaque branche indiquant le nombre de wagons assemblés. | Permet de constater par comparaison pourquoi la décentralisation (empêcher tout acteur d'atteindre 51 %) est la condition de survie du registre. |
| Son, si utilisé | Aucun. | Sobriété et lisibilité. |
| Texte d'accompagnement | Infobulles 3D synthétiques sur les deux branches et explication dans le volet gauche reliant l'ensemble des 7 étapes (cycle complet d'une transaction et limite de sécurité). | Clôt le parcours pédagogique en synthétisant les acquis des étapes 1 à 6. |

#### d) Correspondance avec la réalité technique
| Élément visuel | Élément réel | Fidélité (exacte / simplifiée / approximative) |
|:---|:---|:---|
| Aiguillage en Y séparant la voie honnête et la voie pirate après le Bloc #1 | Bifurcation de chaîne (*blockchain fork*) lors d'une tentative de double dépense | Exacte. |
| Victoire de la branche ayant assemblé 3 wagons contre 1 et raccordement au tronc commun | Règle de Nakamoto : les nœuds adoptent la chaîne valide ayant accumulé le plus de preuve de travail (chaîne la plus longue) | Exacte. |
| Abandon de la branche perdante sur la voie de garage | Blocs orphelins / réorganisation de chaîne (*chain reorg*) | Exacte. |

#### e) Alternative écartée
| Alternative | Raison du rejet |
|:---|:---|
| Remplacer un wagon au milieu du train sans montrer l'embranchement parallèle | Ne faisait pas comprendre que le pirate est obligé de recalculer et de miner une chaîne entière plus vite que tout le reste du réseau réuni. |

#### f) Tests utilisateurs
| Observation | Modification | Issue |
|:---|:---|:---|
| Tant que l'une des branches restait attachée d'avance au Wagon #1 pendant la course, on avait l'impression que le vainqueur était joué d'avance. | Découplage symétrique des deux branches sur l'aiguillage en Y pendant la course, suivi du glissement physique de la seule branche gagnante vers le rail central à la fin. | #13, #17 |
| Lors de la session de test (`PROTOCOLE-TESTS.md`), le testeur 4 a trouvé le texte de fin trop dense et l'animation de course entre les deux trains trop rapide à suivre. | Raccourcissement des textes explicatifs du volet gauche et ralentissement de la course sur l'aiguillage en Y pour laisser le temps d'observer l'écart entre la branche honnête et la branche pirate. | #17 |

#### g) Limites assumées
La course est condensée sur l'assemblage de 3 blocs en quelques secondes afin que l'utilisateur observe clairement l'écart de vitesse et le basculement de l'aiguillage sans attente excessive.

---

## 5. Cohérence globale

| Question | Réponse |
|:---|:---|
| Les codes visuels sont-ils constants ? | Oui : d'un bout à l'autre des 8 vues (Accueil et Étapes 0 à 7), le vert émeraude (`#10b981`) signifie toujours « valide / synchronisé », le jaune ambre (`#f59e0b`) signifie « en cours de modification ou de calcul », le rouge (`#ef4444`) signifie « falsifié / décroché », et les couleurs d'anneaux sont systématiquement dérivées de la valeur hexadécimale du Hash. |
| Un même élément est-il représenté de la même façon partout ? | Oui : le modèle procédural `WagonMesh` (châssis, parois vitrées, caisses internes, plaque centrale de Hash, crochet avant `previousHash` et molette latérale crantée du Nonce) et la `LocomotiveMesh` sont strictement identiques dans toutes les étapes. |
| L'ordre des séquences est-il progressif ? | Oui : le parcours suit une progression du microscopique vers le macroscopique : découverte du train (Étape 0), anatomie d'un seul wagon (Étape 1), liaison entre deux wagons (Étape 2), rupture de cette liaison par falsification (Étape 3), réplication du train dans un réseau de gares (Étape 4), effort de minage pour ajouter un wagon (Étape 5), comparaison des méthodes de validation PoW vs PoS entre les gares (Étape 6), et enfin arbitrage du réseau face à une attaque de branche (Étape 7). |
| Quelle notion est la moins bien représentée ? | La structure interne d'un arbre de Merkle à l'intérieur d'un bloc (Étape 1) est volontairement simplifiée sous la forme de caisses de chargement groupées afin de préserver la lisibilité pour un public non initié. |
| Quelle décision reverriez-vous avec une semaine de plus ? | Avec une semaine supplémentaire, nous enrichirions la transition entre l'étape 4 (vue macroscopique de l'archipel des 6 gares) et l'étape 5 (zoom sur le quai d'une gare-atelier minant un wagon) par un travelling continu sans coupure de scène. |

---

## 6. Rôle de l'IA générative

Conformément au règlement du projet R507, l'usage de l'IA générative est documenté de façon transparente. Seuls deux outils ont été mobilisés :

1. **Gemini** :
   - *Idées et usages retenus* : Aide à l'initialisation de la configuration Vite / Three.js, appui sur la structuration modulaire du code en fichiers d'étapes (`StepManager.js`, `step0.js` à `step7.js`) et mise en forme Markdown des documents de suivi.
   - *Éléments rejetés ou corrigés* : Les premières formulations textuelles trop longues ou scolaires ont été réécrites et raccourcies pour privilégier des phrases directes dans le volet gauche et les infobulles 3D.
2. **Antigravity** :
   - *Idées et usages retenus* : Assistance sur le positionnement géométrique Three.js, le calcul de projection vectorielle des traits SVG reliant les infobulles aux pièces 3D, la mise en forme des livrables Markdown et l'exécution des commandes GitHub CLI (`gh`) pour la tenue du board Kanban.
   - *Éléments rejetés ou corrigés* : Retrait d'effets visuels ou sonores superflus (particules d'étincelles à l'étape 5, carillon Web Audio à l'étape 4, badges lumineux décoratifs) qui nuisaient à la sobriété et à la clarté pédagogique ; correction manuelle de la synchronisation `1 essai = 1 cran de molette` et de l'alignement symétrique de l'aiguillage en Y à l'étape 7.

Toutes les décisions de conception, la métaphore du Convoi Ferroviaire Blindé, les scénarios d'interaction et la validation technique (maintien de 60 FPS, vérification du code) relèvent intégralement du binôme Arthur Morin & Alban Chabalier.

---

## 7. Protocole de tests utilisateurs

Le protocole complet est détaillé dans le fichier dédié [`docs/PROTOCOLE-TESTS.md`](PROTOCOLE-TESTS.md).

- **Formulaire public envoyé aux testeurs** : https://forms.gle/SrQx1cJVSrnMt7sc9
- **Cible** : Au moins 2 personnes extérieures au groupe et non initiées à la blockchain.
- **Consignes appliquées par l'animateur** :
  1. Ne donner aucune explication orale préalable ni pendant le parcours.
  2. Laisser l'utilisateur interagir librement du sas d'accueil jusqu'à l'étape 7.
  3. Demander au testeur de penser à voix haute (*Think Aloud*).
  4. Noter tout blocage ou hésitation dépassant 30 secondes.
  5. Relever le compteur de FPS sur le poste de test (exigence >= 30 FPS).

---

## 8. Sources et références

### Fondements et architecture Bitcoin
- **Satoshi Nakamoto (2008), *Bitcoin: A Peer-to-Peer Electronic Cash System*** (https://bitcoin.org/bitcoin.pdf) : référence fondatrice utilisée pour modéliser fidèlement la structure interne d'un bloc (étape 1), le chaînage séquentiel par empreinte `Previous Hash` (étape 2), la preuve de travail par recherche de Nonce (étape 5) et la règle de la chaîne valide la plus longue lors d'une bifurcation ou d'une attaque des 51 % (étape 7).

### Cryptographie et fonctions de hachage
- **NIST FIPS 180-4 (2015), *Secure Hash Standard (SHS)*** (https://nvlpubs.nist.gov/nistpubs/FIPS/NIST.FIPS.180-4.pdf) : spécification officielle du SHA-256 ayant servi à illustrer les trois propriétés cryptographiques mises en scène aux étapes 1, 2 et 3 : déterminisme (un même chargement produit toujours le même sceau), non-réversibilité (impossible de déduire les caisses à partir de la plaque de hash) et effet avalanche (un seul caractère modifié change intégralement l'empreinte et rompt l'attelage).

### Guides techniques développeurs
- ***Bitcoin Developer Guide — Block Chain, Transactions & Mining*** (https://developer.bitcoin.org/devguide/) : documentation technique mobilisée pour structurer le cycle de vie d'une transaction depuis sa diffusion sur le réseau jusqu'à son inclusion dans un bloc et l'accumulation des confirmations (étapes 4, 5 et 7).
- **Dylan Yaga, Peter Mell, Nik Roby & Karen Scarfone (2018), *NIST IR 8202 — Blockchain Technology Overview*** (https://doi.org/10.6028/NIST.IR.8202) : synthèse pédagogique de référence sur les registres distribués sans tiers de confiance, utilisée pour concevoir la topologie pair-à-pair des 6 gares autonomes à l'étape 4 et délimiter les simplifications pédagogiques assumées.

### Mécanismes de consensus (PoW vs PoS)
- **Documentation officielle *Ethereum.org — Consensus Mechanisms : Proof-of-Work (PoW) & Proof-of-Stake (PoS)*** (https://ethereum.org/en/developers/docs/consensus-mechanisms/) : référence utilisée à l'étape 6 pour comparer de manière factuelle l'effort mécanique énergivore des mineurs en Preuve de Travail avec la sélection pondérée des validateurs immobilisant une caution (*staking*) en Preuve d'Enjeu.

### Outils techniques, cours et inspirations interactives
- **Cours et supports pédagogiques R507** : ressource *Dispositifs interactifs* — BUT MMI 3e année (IUT de Béziers), cadrage des 7 notions obligatoires et du protocole d'évaluation utilisateur.
- **Documentation officielle *Three.js*** (https://threejs.org/docs/) : mise en œuvre du rendu WebGL, des géométries procédurales low-poly (`BufferGeometry`, `MeshStandardMaterial`, `MeshPhysicalMaterial`), du `Raycaster`, de `OrbitControls` et du tone mapping.
- **MDN Web Docs — *Web Crypto API (`SubtleCrypto.digest`)*** (https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/digest) : documentation de référence sur les primitives cryptographiques et le calcul d'empreintes côté navigateur.
- **Documentation officielle *Vite*** (https://vitejs.dev/guide/) : configuration du bundler ES Modules et du pipeline de déploiement statique sur GitHub Pages.
- **Anders Brownworth, *Blockchain 101 — A Visual Demo*** (https://andersbrownworth.com/blockchain/) : inspiration pédagogique sur la manipulation directe du couple Données / Nonce / Hash et la propagation visuelle de l'invalidation en cascade, transposée ici en environnement 3D ferroviaire.
