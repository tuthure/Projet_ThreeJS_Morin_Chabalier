# BUT MMI 3e année — R507

## Projet Three.js — Visualisation pédagogique de la blockchain

### `MMI-R507-projet-blockchain-CHOIX-MODELISATION.md` — livrable officiel

Ce document détaillé est le **livrable officiel** consacré aux choix de modélisation. Il compte pour 25 % de la note. Il doit être complété au fur et à mesure du projet, avec une section par notion, au format `docs/MMI-R507-projet-blockchain-CHOIX-MODELISATION.md`. Chaque choix doit expliquer sa valeur pédagogique, une alternative écartée et l'effet des tests utilisateurs.

---

## 1. Informations générales

| Champ | Contenu |
|:---|:---|
| Groupe | Morin, Alban Chabalier |
| Membres et rôles | **Arthur Morin** ([@tuthure](https://github.com/tuthure)) : Lead Développeur 3D & Architecte Scène (Three.js)<br>**Alban Chabalier** ([@achabalier14](https://github.com/achabalier14)) : Lead Développeur Logique / Interaction & Chef de Projet |
| Public cible | Utilisateur non initié (étudiants hors filière informatique, grand public curieux) |
| Lien vers la démo | https://tuthure.github.io/Projet_ThreeJS_Morin_Chabalier/ |
| Lien vers GitHub Projects | https://github.com/users/tuthure/projects/1 ou https://github.com/tuthure/Projet_ThreeJS_Morin_Chabalier/projects |
| Version et date de mise à jour | v0.1 — 09/10/2026 |

---

## 2. Univers visuel et métaphore principale

### 2.1 Public cible et objectif
- **Public cible** : Tout utilisateur sans bagage technique préalable en cryptographie ni en réseaux distribués.
- **Objectif d'apprentissage** : À l'issue de l'expérience, l'utilisateur doit avoir compris intuitivement :
  1. Pourquoi un bloc ne peut pas être modifié sans briser toute la chaîne (effet d'avalanche du hash).
  2. Pourquoi aucune autorité centrale n'est nécessaire pour garantir la vérité historique (consensus distribué et validation par les pairs).
  3. Comment une transaction est vérifiée, packagée et gravée de manière infalsifiable dans l'historique commun.

### 2.2 Métaphore retenue
- **Univers visuel** : Espace cosmique / architectural épuré avec des monolithes cristallins holographiques interconnectés par des faisceaux lumineux d'énergie cryptographique.
- **Fil rouge narratif** : "Le grand livre lumineux de la vérité partagée". L'utilisateur suit le voyage d'une transaction, depuis son statut d'impulsion lumineuse flottante (mempool) jusqu'à son intégration dans un cristal immuable (bloc), scellé par une formule mathématique (minage/hash), puis répliqué dans une constellation de stations réceptrices (nœuds du réseau).

### 2.3 Justification et limites
| Question | Réponse |
|:---|:---|
| Quelles propriétés deviennent évidentes ? | Le chaînage séquentiel par faisceau lumineux ; la rupture visuelle instantanée (virage au rouge, fracture géométrique) si une donnée est falsifiée ; la réplication instantanée entre stations distantes. |
| Quelles propriétés sont difficiles à représenter ou risquent d'être déformées ? | La complexité cryptographique du hachage mathématique (SHA-256) risque d'être perçue comme un simple mot de passe magique ; le coût énergétique du PoW doit être visualisé sans saturer la machine client en calculs réels. |
| Comment ces limites sont-elles compensées ? | Par des cartouches explicatifs clairs (ex. défilement accéléré d'un compteur de nonces pour le PoW), des tooltips contextuels et une jauge d'état d'intégrité globale. |

### 2.4 Métaphores écartées
| Métaphore | Points forts | Pourquoi écartée |
|:---|:---|:---|
| Wagons de train blindés reliés par des chaînes mécaniques | Très concret pour le grand public | Trop rigide visuellement, rend complexe la représentation d'un réseau décentralisé multi-nœuds et de la mempool. |
| Coffres-forts dans une banque d'archives physique | Notions de sécurité et de conservation évidentes | Connote lourdement la centralisation financière traditionnelle, en contradiction directe avec le concept de décentralisation. |

### 2.5 Charte visuelle
| Élément | Choix | Justification pédagogique |
|:---|:---|:---|
| Palette et signification des couleurs | Émeraude / Cyan (Intégrité, bloc valide), Carmin / Rouge d'alerte (Falsification, rupture), Or ambré (Validation en cours / Minage), Bleu nuit profond (Fond d'espace neutre et reposant). | Codes universels de sécurité / succès / alerte facilitant la lecture instantanée par un novice. |
| Formes, style et niveau d'abstraction | Monolithes biseautés semi-transparents avec reflets émissifs ; particules fines pour les flux de données. | Abstraction moderne et lisible, limitant la complexité polygonale pour garantir 60 FPS constants. |
| Éclairage et ambiance | Éclairage ambiant tamisé à fort contraste avec lumières ponctuelles (`PointLight`) émanant des blocs actifs. | Focalise l'attention de l'utilisateur sur le bloc en cours d'étude sans polluer la scène. |
| Typographie et lisibilité | Typographie sans-serif géométrique haute lisibilité (ex. Inter / Roboto Mono pour les hashs tronqués). | Hashs affichés avec mise en évidence des préfixes discriminants (ex. `0000...`). |
| Échelle et rapport de taille | Blocs cubiques homogènes (ratio 1:1:1.5) reliés par des ponts d'une longueur équivalente à la moitié d'un bloc. | Offre une vue d'ensemble claire sans perte d'échelle lors des dézooms pour les 7 étapes. |

---

## 3. Caméra, espace et navigation

| Question | Réponse et justification |
|:---|:---|
| Caméra libre, guidée ou mixte ? | **Mixte** : Trajectoire cinématique fluide guidée lors du déroulement du scénario pédagogique, débrayable en mode orbite libre (`OrbitControls`) pour inspecter les détails d'un bloc au clic. |
| Comment l'utilisateur sait-il où regarder ? | Interpolation de caméra douce (`Camera.lookAt` guidé par lerp / GSAP) et halo lumineux focalisé sur l'élément interactif courant. |
| Organisation spatiale et signification des positions | Organisation linéaire de gauche à droite pour la blockchain principale ; disposition circulaire concentrique pour représenter le réseau décentralisé des nœuds. |
| Représentation du temps | L'axe des X symbolise la progression chronologique des blocs validés ; les animations de pulsations indiquent les actions en temps réel (minage, propagation). |
| Passage d'une notion à l'autre | Stepper interactif ("Étape suivante / Étape précédente") accompagné de transitions de caméra dynamiques reliant chaque notion du fil rouge. |

---

## 4. Fiches des 7 notions obligatoires

### 4.1 — Structure d'un bloc
- **Données techniques** : données de transaction, hash du bloc, hash du bloc parent, nonce.
- **Issues liées** : #1, #2
- **Séquence(s) concernée(s)** : Séquence 1 (Introduction au bloc unitaire)
- **Objectif pédagogique** : L'utilisateur doit comprendre qu'un bloc est une capsule inviolable contenant des transactions horodatées, son empreinte unique et le lien vers son antécédent direct.
- **Représentation choisie** : Cube translucide aux facettes interactives révélant par survol les couches internes (corps de données, en-tête avec hash et nonce).

### 4.2 — Chaînage cryptographique
- **Données techniques** : hash / empreinte cryptographique, lien avec le bloc parent et effet de la moindre modification.
- **Issues liées** : #2, #3
- **Séquence(s) concernée(s)** : Séquence 2 (La chaîne de blocs)
- **Objectif pédagogique** : L'utilisateur doit constater visuellement que chaque bloc contient le hash du précédent, formant un pont incassable reliant le présent au bloc genèse.

### 4.3 — Immutabilité et détection de falsification
- **Données techniques** : une modification rend les empreintes incohérentes et doit être détectable par les autres nœuds.
- **Issues liées** : #2, #3
- **Séquence(s) concernée(s)** : Séquence 3 (Tentative d'altération)
- **Objectif pédagogique** : L'utilisateur manipule une valeur dans un bloc ancien et observe immédiatement la désynchronisation catastrophique des hashs en cascade.

### 4.4 — Réseau et décentralisation
- **Données techniques** : nœuds, copies distribuées et propagation des transactions/blocs, sans centre unique.
- **Issues liées** : #2, #4
- **Séquence(s) concernée(s)** : Séquence 4 (Constellation des pairs)
- **Objectif pédagogique** : Démontrer qu'il n'y a aucun serveur maître : chaque nœud détient une réplique exacte et propage les nouveautés par commérage (gossip).

### 4.5 — Validation et minage
- **Données techniques** : vérification d'une transaction ou d'un bloc et recherche d'un nonce sous contrainte de difficulté (PoW).
- **Issues liées** : #1, #4
- **Séquence(s) concernée(s)** : Séquence 5 (Le travail du mineur)
- **Objectif pédagogique** : Faire comprendre la loterie mathématique du Proof of Work où des milliards d'essais de nonces sont testés pour trouver un hash commençant par une série de zéros.

### 4.6 — Comparaison d'au moins deux mécanismes de consensus
- **Données techniques** : Proof of Work (PoW) vs Proof of Stake (PoS), différences, avantages et limites.
- **Issues liées** : #2, #4
- **Séquence(s) concernée(s)** : Séquence 6 (Arène des consensus)
- **Objectif pédagogique** : Comparer visuellement la dépense d'énergie/matériel du PoW contre la mise sous séquestre d'actifs (staking) du PoS.

### 4.7 — Cycle de vie d'une transaction et scénario d'attaque illustré
- **Données techniques** : création, propagation, validation, inclusion dans un bloc, confirmation, puis scénario d'attaque (double dépense) et limitation.
- **Issues liées** : #2, #5
- **Séquence(s) concernée(s)** : Séquence 7 (Le voyage de la transaction & l'attaque repoussée)
- **Objectif pédagogique** : Suivre une transaction depuis sa signature jusqu'à son ancrage définitif, puis illustrer comment une tentative de double dépense est rejetée par les règles du réseau.

---

## 5. Cohérence globale

| Question | Réponse |
|:---|:---|
| Les codes visuels sont-ils constants ? | Oui, la sémiologie des couleurs (Vert = valide, Rouge = altéré, Or = minage) est rigoureusement identique sur toutes les séquences. |
| Un même élément est-il représenté de la même façon partout ? | Absolument : les blocs conservent leur géométrie et leur identifiant sur l'ensemble des scènes. |
| L'ordre des séquences est-il progressif ? | Oui : on part de la brique élémentaire (1 bloc) vers l'assemblage (chaîne), puis l'épreuve de sécurité (falsification), l'échelle réseau (décentralisation), le consensus (minage) et enfin la vue systémique dynamique (transaction & attaque). |
| Quelle notion est la moins bien représentée ? | Le minage mathématique (PoW) : compensé par une visualisation animée de la roulette des nonces. |
| Quelle décision reverriez-vous avec une semaine de plus ? | Intégration d'effets de shaders GLSL plus poussés pour matérialiser les flux de propagation réseau. |

---

## 6. Rôle de l'IA générative

Conformément aux consignes de transparence de l'UE R507 :
- Les outils d'IA sont utilisés pour accélérer le prototypage de scripts utilitaires, la rédaction de structures de documentation et l'optimisation des fragments de code Three.js.
- Chaque algorithme, formule géométrique et concept est relu, validé et maîtrisé individuellement par les deux membres du groupe (Arthur Morin et Alban Chabalier).

---

## 7. Sources

- Support de cours officiel : [Three.js Lessons par J. Azé](https://j-aze.github.io/threejs-lessons/cours.html)
- Documentation officielle [Three.js Documentation & Examples](https://threejs.org/docs/)
- Bitcoin Whitepaper (Satoshi Nakamoto, 2008) pour les définitions exactes du chaînage cryptographique et du Proof of Work.
- Ethereum Documentation pour la comparaison Proof of Work / Proof of Stake.
