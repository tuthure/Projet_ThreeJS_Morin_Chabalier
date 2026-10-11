# BUT MMI 3e année - R507

## Projet Three.js - Visualisation pédagogique de la blockchain

### MMI-R507-projet-blockchain-CHOIX-MODELISATION.md - livrable officiel

Ce document détaillé est le livrable officiel consacré aux choix de modélisation. Il compte pour 25 % de la note. Il est complété au fur et à mesure du projet pour justifier les choix visuels et interactifs pour chaque notion obligatoire.

## 1. Informations générales

| Champ | Contenu |
|:---|:---|
| Groupe | Morin, Alban Chabalier |
| Membres et rôles | Arthur Morin (@tuthure) : développement 3D et modélisation Three.js<br>Alban Chabalier (@albanchab14) : logique, interface et gestion de projet |
| Public cible | Utilisateur non initié (étudiants hors informatique ou grand public curieux) |
| Lien vers la démo | https://tuthure.github.io/Projet_ThreeJS_Morin_Chabalier/ |
| Lien vers GitHub Projects | https://github.com/tuthure/Projet_ThreeJS_Morin_Chabalier/projects |
| Version et date de mise à jour | v0.1 - 09/10/2026 |

## 2. Univers visuel et métaphore principale

### 2.1 Public cible et objectif
L'utilisateur visé n'a pas de connaissances particulières en cryptographie ni en développement web. À la fin du parcours, il doit comprendre :
- ce que contient un bloc et comment les blocs sont reliés entre eux ;
- pourquoi modifier une ancienne donnée casse la chaîne et se voit immédiatement ;
- comment plusieurs ordinateurs (nœuds) se mettent d'accord sans avoir besoin d'un serveur central.

### 2.2 Métaphore retenue
Nous utilisons une chaîne de cubes modulaires semi-transparents placés dans un espace neutre et sombre. Chaque cube représente un bloc. À l'intérieur, des panneaux lisibles affichent les transactions, le hash du bloc, le hash du bloc précédent et le nonce. Les liens entre les blocs sont représentés par des connecteurs lumineux reliant la face arrière d'un bloc à la face avant du suivant.

### 2.3 Justification et limites
| Question | Réponse |
|:---|:---|
| Quelles propriétés deviennent évidentes ? | L'ordre chronologique des blocs, le lien direct avec le bloc précédent, et la rupture visuelle immédiate quand un bloc devient invalide. |
| Quelles propriétés sont difficiles à représenter ou risquent d'être déformées ? | Le calcul mathématique du hachage (SHA-256) ne peut pas être montré en détail sans perdre l'utilisateur. |
| Comment ces limites sont-elles compensées ? | On montre le résultat du hash (une chaîne de caractères qui change brutalement à la moindre frappe) et une animation de compteur pour la recherche du nonce. |

### 2.4 Métaphores écartées
| Métaphore | Points forts | Pourquoi écartée |
|:---|:---|:---|
| Train avec des wagons reliés par des attaches | Métaphore très courante et facile à imaginer au départ | Trop rigide pour montrer la décentralisation avec plusieurs copies du réseau et l'arrivée de transactions non confirmées. |
| Coffres-forts dans une salle d'archives | Donne une idée claire de sécurité et de stockage | Rappelle trop le fonctionnement d'une banque classique avec un bâtiment centralisé. |

### 2.5 Charte visuelle
| Élément | Choix | Justification pédagogique |
|:---|:---|:---|
| Palette et signification des couleurs | Vert pour les blocs valides, rouge pour les blocs corrompus ou invalides, orange pour les actions en cours (minage, transaction en attente). Fond sombre neutre. | Ce sont des codes couleurs simples et universels, faciles à interpréter sans explication technique. |
| Formes, style et niveau d'abstraction | Cubes simples avec arrêtes nettes, faces légèrement translucides et typographies nettes. | Évite de charger la scène inutilement et garantit une bonne fluidité (au moins 30 FPS). |
| Éclairage et ambiance | Lumière ambiante douce avec spots ciblés sur le bloc actuellement sélectionné par l'utilisateur. | Permet de guider naturellement le regard vers l'élément important. |
| Typographie et lisibilité | Police sans empattement lisible pour les textes, police à chasse fixe (monospace) pour les hashs. | Facilite la comparaison entre deux hashs. |
| Échelle et rapport de taille | Blocs de même taille alignés horizontalement, avec un espacement régulier. | Permet d'avoir une vue d'ensemble claire sans déformation d'échelle. |

## 3. Caméra, espace et navigation

| Question | Réponse et justification |
|:---|:---|
| Caméra libre, guidée ou mixte ? | Mixte : un mode guidé pour suivre l'explication étape par étape, et la possibilité de tourner autour du bloc avec la souris (OrbitControls) pour regarder les détails. |
| Comment l'utilisateur sait-il où regarder ? | La caméra se déplace automatiquement sur le bloc concerné à chaque étape, et le bloc actif est mis en surbrillance. |
| Organisation spatiale et signification des positions | Organisation linéaire de gauche à droite pour la chaîne principale ; disposition en réseau circulaire pour l'étape montrant les différents nœuds. |
| Représentation du temps | L'axe horizontal représente le temps : les blocs les plus anciens sont à gauche, les plus récents à droite. |
| Passage d'une notion à l'autre | Des boutons simples "Étape précédente" et "Étape suivante" dans une interface 2D par-dessus la scène 3D. |

## 4. Fiches des 7 notions obligatoires

### 4.1 - Structure d'un bloc

Issues liées : #1, #2  
Séquence(s) concernée(s) : Séquence 1 (Découverte d'un bloc)

#### a) Objectif pédagogique
L'utilisateur doit comprendre qu'un bloc regroupe des informations précises : des transactions, son propre hash, le hash du bloc précédent qui le précède, et un nombre appelé nonce.

#### b) Risque de mauvaise compréhension
L'utilisateur ne doit pas penser qu'un bloc est un simple fichier texte sans lien avec les autres.

#### c) Représentation choisie
| Dimension | Choix | Pourquoi ce choix sert la compréhension |
|:---|:---|:---|
| Forme / géométrie | Cube 3D | Forme simple et identifiable. |
| Taille et échelle | 2x2x2 unités | Lisible à l'écran tout en laissant de la place pour les voisins. |
| Couleur / matériau | Matériau légèrement translucide avec bordures claires | Permet de voir le contenu sans surcharger la scène. |
| Position | Centre de l'écran lors de la première étape | Focalise l'attention sur les détails du bloc. |
| Mouvement / animation | Légère rotation sur lui-même au survol | Indique que l'objet est interactif. |
| Interaction et retour visuel | Clic pour ouvrir les détails des transactions | Permet d'explorer le contenu sans forcer la lecture. |
| Son, si utilisé | Non utilisé | Évite les distractions. |
| Texte d'accompagnement | Panneau 2D contextuel avec résumé simple | Donne les définitions clés avec des mots simples. |

#### d) Correspondance avec la réalité technique
| Élément visuel | Élément réel | Fidélité |
|:---|:---|:---|
| Face supérieure : hash | Empreinte SHA-256 | Exacte (affiché sous forme tronquée pour rester lisible) |
| Connecteur arrière : previousHash | Lien cryptographique vers le bloc parent | Exact |
| Corps du cube : liste de transactions | Données du bloc (mempool validée) | Simplifiée (2 ou 3 transactions courtes) |
| Nonce affiché sur le côté | Entier incrémenté lors du minage | Exact |

#### e) Alternative écartée
| Alternative | Raison du rejet |
|:---|:---|
| Afficher toutes les transactions réelles de Bitcoin | Trop lourd et illisible pour un débutant. |

#### f) Tests utilisateurs
| Observation | Modification | Issue |
|:---|:---|:---|
| Prévu en semaine 3 | À documenter lors des tests | À créer |

#### g) Limites assumées
Le hash complet de 64 caractères est tronqué (ex. 0000a4f...8c) pour ne pas encombrer l'affichage.

### 4.2 - Chaînage cryptographique

Issues liées : #2, #3  
Séquence(s) concernée(s) : Séquence 2 (La chaîne)

#### a) Objectif pédagogique
L'utilisateur doit comprendre que chaque bloc intègre l'empreinte du bloc précédent, ce qui crée un lien direct et indissociable entre eux.

#### b) Risque de mauvaise compréhension
L'utilisateur ne doit pas penser que les blocs sont juste posés les uns à côté des autres par ordre d'arrivée sans vérification technique.

#### c) Représentation choisie
| Dimension | Choix | Pourquoi ce choix sert la compréhension |
|:---|:---|:---|
| Forme / géométrie | Ligne lumineuse reliant la sortie d'un bloc à l'entrée du bloc suivant | Montre visuellement le lien de dépendance. |
| Couleur | Même couleur verte que les blocs valides | Renforce l'idée de continuité et de validité. |
| Interaction | Survol d'un lien pour mettre en valeur le hash partagé | Montre que la valeur de sortie du bloc N est identique à l'entrée du bloc N+1. |

#### d) Correspondance avec la réalité technique
| Élément visuel | Élément réel | Fidélité |
|:---|:---|:---|
| Câble / faisceau reliant deux blocs | Champ previousHash vérifié par le nœud | Simplifiée mais fidèle au principe |

#### e) Alternative écartée
| Alternative | Raison du rejet |
|:---|:---|
| Des maillons de chaîne métalliques | Métaphore trop lourde visuellement et difficile à colorer selon l'état de validité. |

#### f) Tests utilisateurs
| Observation | Modification | Issue |
|:---|:---|:---|
| Prévu en semaine 3 | À documenter lors des tests | À créer |

#### g) Limites assumées
Le calcul réel du hash se fait instantanément en JavaScript plutôt que par un véritable algorithme de minage réseau.

### 4.3 - Immutabilité et détection de falsification

Issues liées : #2, #3  
Séquence(s) concernée(s) : Séquence 3 (Test de modification)

#### a) Objectif pédagogique
L'utilisateur doit constater que modifier ne serait-ce qu'un caractère dans un bloc passé change son hash, brise le lien avec les blocs suivants et rend toute la suite invalide.

#### b) Risque de mauvaise compréhension
L'utilisateur ne doit pas croire qu'il est physiquement impossible de changer un fichier, mais plutôt que toute modification est immédiatement repérée et rejetée par le réseau.

#### c) Représentation choisie
| Dimension | Choix | Pourquoi ce choix sert la compréhension |
|:---|:---|:---|
| Interaction | Champ texte modifiable dans un bloc ancien | L'utilisateur teste lui-même en modifiant un montant. |
| Retour visuel | Le bloc modifié et tous les suivants virent au rouge instantanément | Rend la rupture flagrante et intuitive. |
| Animation | Le lien entre les blocs se brise visuellement | Montre la déconnexion cryptographique. |

#### d) Correspondance avec la réalité technique
| Élément visuel | Élément réel | Fidélité |
|:---|:---|:---|
| Virage au rouge des blocs suivants | Invalidation de l'arbre de hashs dans les nœuds | Exacte dans le principe |

#### e) Alternative écartée
| Alternative | Raison du rejet |
|:---|:---|
| Bloquer la modification avec un cadenas | Donnerait l'impression fausse qu'un pirate ne peut pas toucher aux données, alors qu'en réalité il peut les modifier localement mais se fera rejeter. |

#### f) Tests utilisateurs
| Observation | Modification | Issue |
|:---|:---|:---|
| Prévu en semaine 4 | À documenter lors des tests | À créer |

#### g) Limites assumées
L'invalidation est montrée sur 3 ou 4 blocs pour que tout reste visible d'un coup d'œil à l'écran.

### 4.4 - Réseau et décentralisation

Issues liées : #2, #4  
Séquence(s) concernée(s) : Séquence 4 (Vue réseau)

#### a) Objectif pédagogique
L'utilisateur doit comprendre qu'il n'y a pas de serveur central : plusieurs ordinateurs ont chacun une copie identique de la chaîne et comparent leurs versions.

#### b) Risque de mauvaise compréhension
L'utilisateur ne doit pas penser qu'un serveur principal contrôle le réseau et envoie des ordres aux autres.

#### c) Représentation choisie
| Dimension | Choix | Pourquoi ce choix sert la compréhension |
|:---|:---|:---|
| Organisation | Vue dézoomée montrant 4 stations disposées en cercle | Met chaque nœud sur un pied d'égalité visuel. |
| Animation | Propagation d'une pulsation lumineuse d'un nœud vers les autres | Illustre le partage pair-à-pair. |
| Comparaison | Affichage côte à côte de la chaîne de chaque nœud | Montre que la majorité l'emporte en cas de divergence. |

#### d) Correspondance avec la réalité technique
| Élément visuel | Élément réel | Fidélité |
|:---|:---|:---|
| 4 nœuds interconnectés | Réseau P2P mondial à milliers de nœuds | Très simplifiée mais représentative de la logique distribuée |

#### e) Alternative écartée
| Alternative | Raison du rejet |
|:---|:---|
| Représenter un globe terrestre avec des milliers de points | Trop complexe à afficher et distrait de la notion de consensus. |

#### f) Tests utilisateurs
| Observation | Modification | Issue |
|:---|:---|:---|
| Prévu en semaine 4 | À documenter lors des tests | À créer |

#### g) Limites assumées
Le nombre de nœuds est limité à 4 pour garder une scène lisible et fluide.

### 4.5 - Validation et minage

Issues liées : #1, #4  
Séquence(s) concernée(s) : Séquence 5 (Recherche du nonce)

#### a) Objectif pédagogique
L'utilisateur doit comprendre le rôle du Proof of Work : pour valider un bloc, un ordinateur doit chercher un nombre (nonce) qui donne un hash respectant une règle précise (par exemple commencer par plusieurs zéros).

#### b) Risque de mauvaise compréhension
L'utilisateur ne doit pas penser que le mineur résout une énigme logique ou une devinette intelligente : c'est un tirage au sort par essais répétés à grande vitesse.

#### c) Représentation choisie
| Dimension | Choix | Pourquoi ce choix sert la compréhension |
|:---|:---|:---|
| Animation | Défilement rapide d'un compteur de nonces et des hashs correspondants | Montre la recherche par force brute. |
| Retour visuel | Bloc teinté en orange pendant le calcul, passant au vert dès que la cible est atteinte | Signale clairement la réussite de l'étape. |
| Interaction | Bouton "Lancer le minage" avec curseur de difficulté | Permet de voir que plus la difficulté est haute, plus le calcul est long. |

#### d) Correspondance avec la réalité technique
| Élément visuel | Élément réel | Fidélité |
|:---|:---|:---|
| Recherche d'un hash avec zéros au début | Défi de difficulté du protocole Bitcoin | Exacte dans le principe, difficulté allégée pour le navigateur |

#### e) Alternative écartée
| Alternative | Raison du rejet |
|:---|:---|
| Faire tourner un vrai calcul lourd pendant plusieurs minutes | Bloquerait le navigateur de l'utilisateur et gâcherait l'expérience. |

#### f) Tests utilisateurs
| Observation | Modification | Issue |
|:---|:---|:---|
| Prévu en semaine 5 | À documenter lors des tests | À créer |

#### g) Limites assumées
La difficulté est calibrée pour que le minage prenne 2 à 3 secondes dans la démo.

### 4.6 - Comparaison d'au moins deux mécanismes de consensus

Issues liées : #2, #4  
Séquence(s) concernée(s) : Séquence 6 (PoW contre PoS)

#### a) Objectif pédagogique
L'utilisateur doit comprendre la différence principale entre Proof of Work (basé sur la puissance de calcul et l'énergie) et Proof of Stake (basé sur la quantité de jetons mis en jeu).

#### b) Risque de mauvaise compréhension
L'utilisateur ne doit pas penser que le Proof of Stake est une simple variante sans règles ou sans risque pour les participants.

#### c) Représentation choisie
| Dimension | Choix | Pourquoi ce choix sert la compréhension |
|:---|:---|:---|
| Affichage | Écran partagé en deux colonnes 3D comparatives | Permet une comparaison directe côte à côte. |
| Représentation PoW | Ordinateurs avec jauge de calcul et consommation d'énergie | Illustre le coût matériel et énergétique. |
| Représentation PoS | Coffres de jetons déposés en garantie (staking) | Illustre le principe de mise sous séquestre. |

#### d) Correspondance avec la réalité technique
| Élément visuel | Élément réel | Fidélité |
|:---|:---|:---|
| Comparatif puissance vs jetons | Protocoles Bitcoin (PoW) et Ethereum (PoS) | Simplifiée mais juste |

#### e) Alternative écartée
| Alternative | Raison du rejet |
|:---|:---|
| Présenter plus de 3 consensus différents (PoA, DPoS, etc.) | Risquerait de noyer le public sous trop de détails techniques. |

#### f) Tests utilisateurs
| Observation | Modification | Issue |
|:---|:---|:---|
| Prévu en semaine 5 | À documenter lors des tests | À créer |

#### g) Limites assumées
Les mécanismes de pénalité (slashing en PoS) sont résumés dans un court panneau explicatif.

### 4.7 - Cycle de vie d'une transaction et scénario d'attaque illustré

Issues liées : #2, #5  
Séquence(s) concernée(s) : Séquence 7 (De l'émission à l'attaque repoussée)

#### a) Objectif pédagogique
L'utilisateur doit suivre une transaction depuis sa création par un utilisateur jusqu'à son inclusion dans un bloc validé, puis observer comment une tentative de double dépense est détectée et refusée.

#### b) Risque de mauvaise compréhension
L'utilisateur ne doit pas penser qu'une transaction est définitive dès qu'elle est envoyée, ni qu'une attaque peut réussir sans convaincre la majorité du réseau.

#### c) Représentation choisie
| Dimension | Choix | Pourquoi ce choix sert la compréhension |
|:---|:---|:---|
| Particule | Petite sphère colorée représentant la transaction | Montre son voyage dans l'espace 3D. |
| Étapes | 1. Mempool -> 2. Prise en charge par un mineur -> 3. Validation -> 4. Blocs suivants | Découpe le parcours en phases claires. |
| Attaque | Émission de deux transactions contradictoires avec le même solde | Montre que le réseau ne valide que la première et rejette la seconde. |

#### d) Correspondance avec la réalité technique
| Élément visuel | Élément réel | Fidélité |
|:---|:---|:---|
| Trajet mempool vers bloc | File d'attente des transactions non confirmées | Exacte dans le principe |
| Rejet de la transaction en conflit | Règle de consensus contre la double dépense | Exacte |

#### e) Alternative écartée
| Alternative | Raison du rejet |
|:---|:---|
| Simuler une attaque des 51 % complète | Trop longue à mettre en scène et moins courante à expliquer pour un premier niveau de vulgarisation. |

#### f) Tests utilisateurs
| Observation | Modification | Issue |
|:---|:---|:---|
| Prévu en semaine 6 | À documenter lors des tests | À créer |

#### g) Limites assumées
Le scénario d'attaque est pré-enregistré avec des choix interactifs pour l'utilisateur plutôt qu'une simulation réseau complète.

## 5. Cohérence globale

| Question | Réponse |
|:---|:---|
| Les codes visuels sont-ils constants ? | Oui, les couleurs ont la même signification partout (vert = valide, rouge = problème, orange = en attente). |
| Un même élément est-il représenté de la même façon partout ? | Oui, les blocs gardent leur format cubique tout au long de l'expérience. |
| L'ordre des séquences est-il progressif ? | Oui, on commence par le bloc isolé, puis la chaîne, la falsification, le réseau, le minage, les consensus, et enfin le parcours d'une transaction avec l'attaque. |
| Quelle notion est la moins bien représentée ? | Le minage : il est difficile d'expliquer la cryptographie sans formule, nous compensons par un compteur de nonces interactif. |
| Quelle décision reverriez-vous avec une semaine de plus ? | Ajouter des animations plus détaillées lors du passage d'un nœud à un autre dans la vue réseau. |

## 6. Rôle de l'IA générative

Conformément aux consignes de transparence de l'UE R507 :
- Les outils d'IA ont été utilisés comme aide pour structurer les documents de cadrage et préparer les trames des fiches.
- Les choix techniques, la scénarisation pédagogique et l'implémentation du code Three.js sont réalisés et validés par les deux étudiants du groupe.

## 7. Sources

- Documentation officielle Three.js (https://threejs.org/docs/)
- Bitcoin Whitepaper (Satoshi Nakamoto, 2008)
- Documentation Ethereum sur le Proof of Stake
