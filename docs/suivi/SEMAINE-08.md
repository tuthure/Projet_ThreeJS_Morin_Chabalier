# Fiche de suivi hebdomadaire -- Semaine 8 (Clôture)

## 0. Informations générales
- **Semaine :** S8 (Semaine de clôture du projet)
- **Date :** 15 novembre 2026
- **Auteurs :** Alban Chabalier & Arthur Morin
- **Projet :** Le Convoi Ferroviaire Blindé (BUT MMI 3e année -- R507 Dispositifs interactifs Three.js)
- **Dépôt :** [Projet_ThreeJS_Morin_Chabalier](https://github.com/albanchab14/Projet_ThreeJS_Morin_Chabalier)

---

## 1. Objectifs de la semaine
1. Finaliser les derniers ajustements 3D et ergonomiques sur le parcours pédagogique (étapes 4, 6 et ajout de l'épilogue étape 8 sur les cryptomonnaies).
2. Mener la campagne de tests utilisateurs Phase 2 (`Testeur 2.1` et `Testeur 2.2`) après application des correctifs.
3. Vérifier les performances de rendu (`60+ FPS` sur poste standard), le build de production Vite (`npm run build`) et la mise en ligne sur GitHub Pages.
4. Clôturer l'ensemble de la documentation de rendu (`docs/CADRAGE.md`, `docs/PROTOCOLE-TESTS.md`, `docs/MMI-R507-projet-blockchain-GRILLE-AUTOEVAL.md`) et boucler le tableau Kanban GitHub Projects avant la répétition générale.

---

## 2. Réalisations effectuées

### 2.1 Scénographie 3D et ergonomie pédagogique
- **Étape 4 (`src/steps/step4.js`) :** Suppression du train parasite au centre des gares et restauration de la topologie d'origine du réseau distribué.
- **Étape 6 (`src/steps/step6.js`, `src/cameraController.js`) :** Refonte complète des séquences PoW (course visuelle avec mise en évidence de la gare gagnante et fondu des perdantes avant attelage) et PoS (sélection pondérée, zoom sur la gare élue, chargement et scellement avant dézoom et raccordement au convoi), avec nettoyage strict des objets temporaires dans `exit()`.
- **Épilogue (`src/steps/step8.js`, `src/steps/StepManager.js`, `index.html`) :** Ajout d'une étape finale de clôture (`Étape 8 : Du train à la cryptomonnaie`) faisant explicitement le lien entre le convoi ferroviaire (blocs et chaînages SHA-256), les gares (nœuds P2P) et l'application concrète aux cryptomonnaies (Bitcoin, Ethereum) sans banque centrale.

### 2.2 Campagne de tests utilisateurs et validations techniques
- **Tests Phase 2 :** Réalisation de deux sessions d'évaluation complémentaires (`Testeur 2.1` et `Testeur 2.2`, portant le total à 6 testeurs externes sur l'ensemble du projet). Retours très positifs sur la fluidité, la compréhension des mécanismes de hash, d'immuabilité et d'attaque des 51 %, ainsi que l'ajout de l'épilogue crypto demandé par `Testeur 2.2`.
- **Qualité logicielle et performances :** Maintien d'un framerate supérieur à `60 FPS` en navigation continue (`vite build` sans erreur ni avertissement critique) et déploiement validé sur GitHub Pages.

### 2.3 Documentation et gestion de projet
- Rédaction et intégration de `docs/CADRAGE.md` aligné sur le scénario du Convoi Ferroviaire Blindé.
- Mise à jour de `docs/PROTOCOLE-TESTS.md` (ajout de `Testeur 2.2` anonymisé, conclusion de la Phase 2 et synthèse des correctifs).
- Réajustement réaliste de la grille d'auto-évaluation (`docs/MMI-R507-projet-blockchain-GRILLE-AUTOEVAL.md`).
- Bouclage du Kanban GitHub Projects : 29 issues clôturées (`Terminé`), aucune tâche en cours, et maintien exclusif de l'issue `#25` (`Répétition générale de la soutenance`) dans `À faire`.

---

## 3. Difficultés rencontrées et solutions apportées
- **Synchronisation des animations à l'étape 6 (PoW / PoS) :** Risque de chevauchement entre le zoom caméra et l'attelage du wagon candidat. Résolu par un séquençage asynchrone strict et un suivi d'état permettant d'annuler proprement les transitions lors d'un changement d'étape.
- **Clôture de la transition narrative :** Un testeur de Phase 2 (`Testeur 2.2`) a souligné que le passage entre l'attaque des 51 % et l'application réelle aux cryptomonnaies méritait une page de synthèse dédiée. Ajout immédiat de l'étape 8 (`src/steps/step8.js`) accessible après l'étape 7 et depuis les onglets marque-pages.

---

## 4. Répartition du travail du binôme
- **Arthur Morin :** Finalisation des scènes 3D, ajustements de cadrage caméra, séquençage des gares et intégration des correctifs visuels.
- **Alban Chabalier :** Implémentation du panneau pédagogique, ajout de l'épilogue étape 8, conduite des tests Phase 2, rédaction de `SEMAINE-08.md`, mise à jour de `PROTOCOLE-TESTS.md`, `GRILLE-AUTOEVAL.md` et clôture du Kanban.

---

## 5. État d'avancement du Kanban (GitHub Projects)
- **Terminé :** 29 issues sur 30 (`#1` à `#24` et `#26` à `#30` -- toutes les notions 0 à 8, tests Phase 1 et Phase 2, support de soutenance, vidéo Plan B, cadrage, choix de modélisation et grille d'auto-évaluation).
- **En cours :** 0 issue.
- **À faire :** 1 seule issue restante -- `#25` (*Répétition générale de la soutenance*), programmée le **19 novembre 2026 à 9h30**.

---

## 6. Bilan global S1 à S8
- **S1 - S2 :** Cadrage du scénario métaphorique (*Le Convoi Ferroviaire Blindé*), prototypage du décor ferroviaire Three.js et mise en place de l'architecture modulaire par étapes (`StepManager`).
- **S3 - S4 :** Implémentation des notions fondamentales (bloc, chaînage SHA-256 réel en Web Crypto API, détection de falsification par effet domino, réseau distribué de 3 gares).
- **S5 - S6 :** Développement des notions avancées (minage interactif avec difficulté variable, consensus PoW et PoS, simulation d'attaque des 51 %), campagne de tests Phase 1 (4 testeurs) et première vague de correctifs ergonomiques.
- **S7 - S8 :** Polissage complet de la scénographie 3D, tests Phase 2 (`Testeur 2.1` et `Testeur 2.2`), ajout de l'épilogue cryptomonnaie (`step8.js`), livraison complète de la documentation universitaire et préparation de la soutenance orale.

---

## 7. Indicateurs de clôture
- **Nombre total d'étapes interactives :** 9 écrans (`0` Introduction à `7` Attaque 51 %, plus `8` Épilogue Crypto).
- **Testeurs externes interrogés :** 6 testeurs (4 en Phase 1, 2 en Phase 2).
- **Performance mesurée :** `60+ FPS` sur navigateur desktop (Chrome / Edge / Firefox).
- **Build & déploiement :** `npm run build` opérationnel et hébergement GitHub Pages actif.

---

## 8. Prochaine échéance avant soutenance
- **Jeudi 19 novembre 2026 à 9h30 :** Répétition générale chronométrée (`#25`) du support de présentation et de la démonstration en direct (avec vérification finale de la vidéo de secours Plan B).

---

## 9. Validation
- **État du dépôt :** Prêt pour la soutenance (code, build, documentation et Kanban synchronisés).
- **Validé par le binôme :** Alban Chabalier & Arthur Morin -- 15 novembre 2026.
