# BUT MMI 3e année — R507

## Projet Three.js — Visualisation pédagogique de la blockchain

### Fiche de suivi hebdomadaire — Semaine 02

## 0. Informations générales

| Champ | Contenu |
|:---|:---|
| Groupe | Binôme Arthur Morin (@tuthure) & Alban Chabalier (@achabalier14) |
| Projet | Visualisation pédagogique de la blockchain avec Three.js (Le Convoi Ferroviaire Blindé) |
| Semaine | 02 |
| Dates couvertes | Du 10 au 16 octobre 2026 |
| Membres présents | Arthur Morin, Alban Chabalier |
| Lien dépôt / GitHub Projects | https://github.com/tuthure/Projet_ThreeJS_Morin_Chabalier / https://github.com/tuthure/Projet_ThreeJS_Morin_Chabalier/projects |
| Lien démo (si disponible) | https://tuthure.github.io/Projet_ThreeJS_Morin_Chabalier/ |

## 1. Avancement

**Objectifs prévus pour la semaine :**
- Fusionner et modéliser le train 3D complet (locomotive + wagons articulés).
- Structurer le code applicatif avec un gestionnaire d'étapes (StepManager) pour orchestrer les 7 notions pédagogiques.
- Brancher l'interaction entre le HUD, le panneau d'inspection latéral et la blockchain en temps réel.
- Développer la logique des étapes 1 (Structure du bloc), 2 (Chaînage cryptographique) et 3 (Immutabilité et falsification).

### 1.1 Réalisé
| Issue / tâche | Notion concernée | Statut | Preuve |
|:---|:---|:---|:---|
| Modélisation de la locomotive et des wagons avec géométries modulaires et attelages magnétiques | Structure d'un bloc / Chaînage cryptographique | Fonctionnel | `src/three/LocomotiveMesh.js` et `src/three/WagonMesh.js` intégrés et visibles dans la scène Three.js |
| Contrôleur ferroviaire global et synchronisation avec la blockchain | Chaînage cryptographique | Fonctionnel | Classe `TrainConvoy` dans `src/train.js` synchronisée avec l'état de la chaîne |
| Logique de falsification en cascade et recalcul de preuve de travail (PoW) | Immutabilité et détection de falsification | Fonctionnel | Rupture visuelle d'attelage et recalcul de hash opérationnels dans l'inspecteur |
| Architecture modulaire des séquences pédagogiques via StepManager | Notions 1 à 7 | Fonctionnel | `src/steps/StepManager.js` opérationnel avec navigation étape par étape (fichiers `step1.js` à `step7.js`) |
| Contrôleur de caméra avec waypoints et transitions cinématiques par wagon | Ergonomie et navigation 3D | Fonctionnel | Transitions fluides OrbitControls dans `src/cameraController.js` selon le bloc ciblé |
| Panneau latéral d'inspection (Drawer) pour la saisie, détection de rupture et minage | Structure d'un bloc / Immutabilité / Minage | Fonctionnel | Interface HUD interactive connectée aux événements Three.js et aux données de bloc |
| Mesure et optimisation des performances | Performance technique | Testé | Boucle d'animation stable à 60 FPS mesurée sur poste de TP standard |

### 1.2 Prévu mais non réalisé
| Tâche | Cause | Report |
|:---|:---|:---|
| Aucune | Tous les objectifs fixés pour la semaine 2 ont été atteints | N/A |

### 1.3 État des 7 notions

| Notion obligatoire | État | Remarque / preuve |
|:---|:---|:---|
| Structure d'un bloc | Fonctionnel | Wagon blindé modélisé avec compartiments de transactions, plaque de hash, connecteur previousHash et cadran de nonce. Logique validée dans `src/steps/step1.js`. |
| Chaînage cryptographique | Fonctionnel | Attelages magnétiques reliant les wagons consécutifs. Synchronisation du convoi 3D avec les blocs dans `src/train.js` et `src/steps/step2.js`. |
| Immutabilité et détection de falsification | Fonctionnel | Détection en direct d'altération de transaction dans le Drawer, rupture physique de l'attelage en cascade et passage au rouge d'alerte dans `src/steps/step3.js`. |
| Réseau et décentralisation | En cours | Architecture modulaire prête dans `src/steps/step4.js`. Modélisation des voies parallèles et aiguilleurs planifiée pour la semaine 3. |
| Validation et minage | En cours | Calcul PoW et recalcul de hash fonctionnels dans `Block.js` et `Blockchain.js`. Modélisation de la motrice en surchauffe et cadran de difficulté en cours dans `src/steps/step5.js`. |
| Comparaison d'au moins deux mécanismes de consensus | En cours | Cadrage conceptuel PoW vs PoS documenté. Fichier `src/steps/step6.js` initialisé pour la confrontation motrice thermique vs caution d'aiguillage. |
| Cycle de vie d'une transaction et scénario d'attaque illustré | En cours | Parcours colis (mempool vers wagon) et rejet de double dépense cadrés. Squelette technique initialisé dans `src/steps/step7.js`. |

**Définitions des états :**

- `En cours` = une partie est implémentée mais incomplète ou non vérifiée ;
- `Fonctionnel` = le parcours prévu fonctionne localement au moins une fois ; 
- `Testé` = il a été vérifié par au moins un test documenté (et, pour les tests externes, par une personne extérieure au groupe). 
- `Non commencé` et `Bloqué` peuvent aussi être utilisés.

## 2. Répartition du travail

| Membre | Tâches / issues | Issues traitées | Commits |
|:---|:---|:---:|:---:|
| Arthur Morin | Conception et modélisation de la locomotive (`src/three/LocomotiveMesh.js`) et affinement des wagons (`src/three/WagonMesh.js`) avec géométries modulaires et attelages magnétiques. Développement du contrôleur ferroviaire global (`src/train.js`) et synchronisation de l'état de la chaîne avec les meshes 3D. Logique de falsification en cascade et recalcul de preuve de travail (PoW). | #1, #3, #6 | Commits sur la modélisation 3D, locomotive, wagons, contrôleur de train et logique de falsification |
| Alban Chabalier | Mise en place de l'architecture modulaire des séquences pédagogiques via `StepManager.js` et création des fichiers dédiés `src/steps/step1.js` à `step7.js`. Raccordement du contrôleur de caméra (`cameraController.js`) avec waypoints et transitions cinématiques adaptées à chaque wagon inspecté. Intégration du panneau latéral d'inspection (Drawer) permettant la saisie interactive des transactions, la détection en direct de la rupture d'attelage et le déclenchement du minage. Mesure des performances : boucle d'animation stable à 60 FPS sur poste de TP standard. | #4, #7, #8 | Commits sur StepManager, modules d'étapes, cinématique caméra, HUD Drawer et benchmark de performance |

## 3. GitHub Projects

| Question | Réponse |
|:---|:---|
| Issues créées | 4 issues créées (#6, #7, #8, #9) pour le découpage des étapes 1 à 3, les transitions cinématiques et l'orchestration globale |
| Issues fermées | 3 issues fermées (#1 modélisation initiale des meshes, #4 structure du HUD, #6 attelages et rupture d'immutabilité) |
| Nombre dans `Backlog` / `À faire` / `En cours` / `À vérifier` / `Terminé` | 3 dans `Backlog`, 2 dans `À faire`, 2 dans `En cours`, 1 dans `À vérifier`, 5 dans `Terminé` |
| Board mis à jour pendant la semaine ? | Oui, mis à jour de manière continue lors de la création des issues, des branches de fonctionnalités et des revues de code |
| Milestone concerné et état | Jalon 2 "Prototype fonctionnel interactif (étapes 1 à 3 validées)" (échéance 23/10/2026) : en bonne voie d'achèvement |

## 4. Choix de modélisation

| Question | Réponse |
|:---|:---|
| Fiches de `MMI-R507-projet-blockchain-CHOIX-MODELISATION.md` complétées | Fiches 1 (Structure du bloc), 2 (Chaînage cryptographique) et 3 (Immutabilité et falsification) mises à jour suite à l'implémentation 3D. |
| Choix important et justification | Séparation nette entre la locomotive (tête du convoi représentant le Genesis / machinerie de validation) et les wagons articulés (blocs de données). Cela élimine l'ambiguïté visuelle entre le conteneur de transactions et le moteur de consensus. |
| Choix remis en question | Remplacement du panneau modal centré par un panneau latéral escamotable (Drawer). La boîte modale masquait la scène 3D, alors que le panneau latéral permet de voir en temps réel l'impact de la saisie sur le wagon inspecté et la rupture d'attelage. |

## 5. Tests utilisateurs

| Question | Réponse |
|:---|:---|
| Nombre de testeurs extérieurs cette semaine | 0 (semaine axée sur la stabilisation technique et le raccordement des interactions de base) |
| Compréhension ou problème observé | Tests d'ergonomie internes menés en binôme : nécessité de guider visuellement l'utilisateur lors du focus wagon (résolue par l'interpolation fluide de caméra) et besoin d'un retour immédiat et contrasté lors de la rupture d'attelage. |
| Issue corrective | Issue #12 ouverte pour formaliser le protocole et la grille d'observation de la session de tests utilisateurs externe programmée en semaine 3. |

## 6. IA, difficultés et besoins

| Question | Réponse |
|:---|:---|
| Usage de l'IA et vérifications effectuées | Assistance pour la formulation mathématique des interpolations de caméra (trajectoires d'amortissement Three.js) et la structure du StepManager. Chaque proposition de code a fait l'objet d'une relecture rigoureuse, d'une adaptation aux contraintes du projet et de tests manuels sur navigateur. |
| Blocage technique | - Conflit d'initialisation DOM dans `main.js` (erreur `ReferenceError` sur `chainStatusPill` avant instanciation) : résolu par une réorganisation stricte de l'ordre d'évaluation des sélecteurs DOM et une sécurisation des callbacks d'état.<br>- Gestion du module bundler Vite sur GitHub Pages (erreur de résolution d'imports de packages Three.js) : résolu en configurant correctement le base path dans `vite.config.js` (`base: './'`) et en pointant le déploiement CI/CD sur le répertoire de build `dist/`.<br>- Fusion des branches locales : modularisation réussie sans écrasement grâce à l'isolation de la couche 3D (`WagonMesh` / `LocomotiveMesh` / `TrainConvoy`) séparée de la couche logique/UI (`StepManager` / `HUD`). |
| Blocage pédagogique ou organisationnel | Aucun blocage. La répartition modulaire entre rendu 3D et logique UI/pédagogique permet un développement en parallèle fluide. |
| Besoin d'un point enseignant | Aucun besoin critique. Présentation prévue lors du point d'étape planifié. |

## 7. Objectifs de la semaine suivante

| Objectif | Responsable | Issue |
|:---|:---|:---|
| Finaliser et enrichir les interactions 3D des étapes 4 (Réseau décentralisé et multi-voies) et 5 (Minage et calcul visuel du nonce sous contrainte de difficulté) | Arthur Morin | #9, #10 |
| Préparer la comparaison visuelle des consensus PoW et PoS pour l'étape 6 | Alban Chabalier | #11 |
| Préparer et mener la première session de tests utilisateurs auprès de 2 personnes extérieures au groupe pour recueillir leurs retours sur l'ergonomie et la clarté de la métaphore ferroviaire | Alban Chabalier & Arthur Morin | #12 |

## 8. Signaux d'alerte

- [ ] Le board n'a été mis à jour qu'aujourd'hui.
- [ ] La répartition est fortement déséquilibrée et non expliquée.
- [x] Nous n'avons pas encore atteint les 2 testeurs extérieurs requis.
- [ ] Un choix de modélisation important n'est pas justifié.
- [ ] Une notion n'a pas avancé depuis 2 semaines.

**Règle vérifiable d'absence d'avancement depuis 2 semaines :** cocher cette case si, entre les deux dernières fiches hebdomadaires successives, aucune évolution visible n'est constatée pour la notion concernée dans le code, l'interface, `CHOIX-MODELISATION.md`, les issues ou les tests (aucun commit, issue déplacée/fermée, preuve ajoutée ou observation nouvelle). Nommer la notion et la preuve vérifiée : Aucune notion en stagnation ; les notions 1, 2 et 3 sont désormais fonctionnelles, et les notions 4 à 7 disposent de leur structure modulaire initialisée dans `src/steps/`.

## 9. Validation

| Élément | Réponse |
|:---|:---|
| Fiche relue par tous | Oui |
| Date d'envoi | 16/10/2026 |
| Noms des membres | Arthur Morin, Alban Chabalier |
