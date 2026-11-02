# BUT MMI 3e année — R507

## Projet Three.js — Visualisation pédagogique de la blockchain

### Fiche de suivi hebdomadaire — Semaine 04

## 0. Informations générales

| Champ | Contenu |
|:---|:---|
| Groupe | Binôme Arthur Morin (@tuthure) & Alban Chabalier (@achabalier14) |
| Projet | Visualisation pédagogique de la blockchain avec Three.js (Le Convoi Ferroviaire Blindé) |
| Semaine | 04 |
| Dates couvertes | Du 24 au 30 octobre 2026 |
| Membres présents | Arthur Morin, Alban Chabalier |
| Lien dépôt / GitHub Projects | https://github.com/tuthure/Projet_ThreeJS_Morin_Chabalier / https://github.com/tuthure/Projet_ThreeJS_Morin_Chabalier/projects |
| Lien démo en ligne | https://tuthure.github.io/Projet_ThreeJS_Morin_Chabalier/ |

## 1. Avancement

**Objectifs prévus pour la semaine :**
- Affiner la modélisation 3D de la motrice, des wagons et stabiliser l'introduction (étape 0).
- Concevoir et dynamiser les étapes 1 (Structure d'un bloc) et 2 (Chaînage cryptographique) par des interactions directes.
- Épurer l'interface utilisateur du volet gauche en supprimant les préfixes artificiels et étiquettes superflues.
- Fiabiliser les retours visuels 3D et textuels lors des actions utilisateurs (zoom plaques, rotation molette, rétablissement de la chaîne).

### 1.1 Réalisé
| Issue / tâche | Notion concernée | Statut | Preuve |
|:---|:---|:---|:---|
| Affinement de la motrice, des wagons vitrés et préparation des rails et décors | Modélisation 3D et immersion | Fonctionnel | Maillages optimisés dans `LocomotiveMesh.js` et `WagonMesh.js` avec géométries partagées |
| Structuration guidée de l'Étape 0 (Locomotive sans conducteur, wagons transparents) | Pédagogie / Étape 0 | Fonctionnel | Module `src/steps/step0.js` avec découpage en 3 sous-parties et repères caméra |
| Conception et dynamisation de l'Étape 1 (Structure du bloc en 3 sous-parties) | Notion 1 — Structure du bloc | Testé | Module `src/steps/step1.js` opérationnel : chargement de fret avec rebond 3D, surbrillance des plaques et rotation interactive de la molette de Nonce |
| Conception et dynamisation de l'Étape 2 (Chaînage cryptographique en 3 sous-parties) | Notion 2 — Chaînage et avalanche | Testé | Module `src/steps/step2.js` opérationnel : faisceau magnétique oscillant, simulation d'avalanche en direct et restauration complète de l'intégrité |
| Refonte ergonomique du volet gauche et suppression des badges artificiels | Interface et UX/UI | Fonctionnel | Styles dans `src/style.css` et nettoyage de `step0.js` à `step7.js` (titres sobres, suppression des préfixes verbeux) |
| Fiabilisation des feedbacks visuels 3D et textuels | Ergonomie et interactions | Testé | Halos cyan émissifs sur les plaques (1.2), pulsation verte de l'attelage à la réparation (2.3) et bandeaux de notification d'état |

### 1.2 Prévu mais non réalisé
| Tâche | Cause | Report |
|:---|:---|:---|
| Passation des 2 sessions de tests utilisateurs extérieurs | Priorité donnée à la fiabilisation complète des étapes 1 et 2 pour proposer un parcours interactif significatif aux testeurs | Planifié en semaine 5 avec les étapes 0, 1, 2 et le prototype de l'étape 3 |

### 1.3 État des 7 notions

| Notion obligatoire | État | Remarque / preuve |
|:---|:---|:---|
| Structure d'un bloc | Testé | Manipulations interactives complètes : modification de transaction, inspection des plaques Hash/PreviousHash et molette de Nonce physique dans `step1.js` |
| Chaînage cryptographique | Testé | Faisceau magnétique dynamique, déclenchement de la rupture en cascade et bouton de restauration d'intégrité dans `step2.js` |
| Immutabilité et détection de falsification | En cours | Mécanique de rupture présente dans `train.js` ; interface pas-à-pas en cours d'intégration dans `step3.js` |
| Réseau et décentralisation | En cours | Architecture définie dans `step4.js` ; modélisation des voies parallèles et cabines d'aiguillage en préparation |
| Validation et minage | En cours | Molette mécanique et boucle de preuve de travail opérationnelles ; mise en scène visuelle de la surchauffe motrice dans `step5.js` |
| Comparaison d'au moins deux mécanismes de consensus | En cours | Opposition locomotive thermique (PoW) et caution d'aiguillage (PoS) cadrée dans `step6.js` |
| Cycle de vie d'une transaction et scénario d'attaque illustré | En cours | Flux transactionnel du quai au wagon cadré dans `step7.js` |

**Définitions des états :**
- `En cours` = une partie est implémentée mais incomplète ou non vérifiée ;
- `Fonctionnel` = le parcours prévu fonctionne localement au moins une fois ;
- `Testé` = il a été vérifié par au moins un test documenté (et, pour les tests externes, par une personne extérieure au groupe).

## 2. Répartition du travail

| Membre | Tâches / issues | Issues traitées | Commits |
|:---|:---|:---:|:---:|
| Arthur Morin | Affinement de la motrice, des wagons, des sous-parties de l'étape 0 et préparation des rails et décors. Ajustement des maillages, géométries des anneaux magnétiques et textures des plaques. | #14, #15, #16 | Commits sur `LocomotiveMesh.js`, `WagonMesh.js`, `step0.js` et `environment.js` |
| Alban Chabalier | Conception et dynamisation interactive des étapes 1 et 2 (zoom plaques, rotation interactive de la molette de nonce, simulation d'avalanche). Épuration typographique du volet gauche, suppression des badges artificiels et fiabilisation des retours visuels. Rédaction du suivi hebdomadaire et mise à jour du Kanban. | #7, #8, #16, #28 | Commits sur `step1.js`, `step2.js`, `step0.js` à `step7.js`, `style.css` et `SEMAINE-04.md` |

## 3. GitHub Projects

| Question | Réponse |
|:---|:---|
| Issues créées | Issue #28 (Rédiger la fiche de suivi - Semaine 4) |
| Issues fermées | Issue #27 (Rédiger la fiche de suivi - Semaine 3) |
| Nombre dans `Backlog` / `À faire` / `En cours` / `À vérifier` / `Terminé` | 3 dans `Backlog` (#17, #18, #19), 5 dans `À faire` (#9, #10, #11, #12, #13), 4 dans `En cours` (#7, #8, #16, #28), 0 dans `À vérifier`, 9 dans `Terminé` (#1, #2, #3, #4, #5, #6, #14, #26, #27) |
| Board mis à jour pendant la semaine ? | Oui, mis à jour via GitHub CLI pour refléter l'achèvement des étapes 1 et 2 et la progression du Jalon 2 |
| Milestone concerné et état | Jalon 2 "Prototype fonctionnel interactif" : étapes 0, 1 et 2 entièrement interactives et validées |

## 4. Choix de modélisation

| Question | Réponse |
|:---|:---|
| Fiches de `MMI-R507-projet-blockchain-CHOIX-MODELISATION.md` complétées | Les choix restent parfaitement alignés avec les fiches validées. L'ajout de la molette 3D sur le flanc du wagon illustre concrètement le rôle du Nonce sans nécessiter de formule mathématique abstraite. |
| Choix important et justification | **Rotation physique de la molette du Nonce (Étape 1.3) :** Permettre à l'utilisateur de tourner la molette via des boutons ou un slider avec répercussion 3D immédiate fait comprendre instantanément que le Nonce est une variable ajustable pour recalculer le hash. |
| Choix important et justification | **Animation de rupture de l'arc magnétique (Étape 2.2) :** Faire chuter l'attelage et passer le faisceau en rouge clignotant lors d'une altération de bloc ancre visuellement la notion d'effet avalanche bien plus efficacement qu'un message textuel. |
| Choix remis en question | **Suppression intégrale des préfixes artificiels dans l'UI :** Les bandeaux du type "CONTEXTE · LE CHARGEMENT PUBLIC" ont été retirés au profit de titres directs ("Chargement du wagon") pour alléger l'écran et supprimer toute lourdeur de mise en page. |

## 5. Tests utilisateurs

| Question | Réponse |
|:---|:---|
| Nombre de testeurs extérieurs cette semaine | 0 (finalisation des interactions des étapes 1 et 2) |
| Compréhension ou problème observé | Lors des tests internes, le manque de retour visuel lors du clic sur la surbrillance des plaques et l'absence de message explicite lors du clic sur la restauration de l'intégrité créaient une impression d'inactivité. |
| Issue corrective | Correctif intégré immédiatement dans `step1.js` (halo émissif cyan sur les plaques, zoom caméra et notification) et dans `step2.js` (réinitialisation complète, impulsion verte et bandeau de statut). Première session externe programmée en semaine 5 sur le parcours complet 0 à 3. |

## 6. IA, difficultés et besoins

| Question | Réponse |
|:---|:---|
| Usage de l'IA et vérifications effectuées | Aide pour le calcul des matrices de rotation de la molette du Nonce sur son axe normal et la synchronisation des lumières ponctuelles lors des impulsions. Tout le code a été testé localement à 60 FPS et les textes ont été relus pour garantir un ton naturel et sobre. |
| Blocage technique | - Problème de surbrillance invisible à l'étape 1.2 : l'intensité de la lumière était écrasée par la boucle d'animation à chaque frame ; résolu par un timer dédié et l'ajout de plans émissifs cyan.<br>- Restauration incomplète du convoi à l'étape 2.3 : l'attelage conservait ses teintes rouges d'alerte ; résolu par une réinitialisation intégrale des matériaux, réécriture des textures de plaques et impulsion verte. |
| Blocage pédagogique ou organisationnel | Aucun blocage majeur ; la narration par analogie ferroviaire est bien acceptée et fluide lors des manipulations. |
| Besoin d'un point enseignant | Présentation du prototype interactif (étapes 0 à 2) lors de la prochaine séance pour recueillir les retours pédagogiques avant d'attaquer le réseau distribué (étape 4). |

## 7. Objectifs de la semaine suivante

| Objectif | Responsable | Issue |
|:---|:---|:---|
| Développer l'étape 3 : rupture d'immutabilité et scénario de falsification en cascade | Alban Chabalier | #9 |
| Modéliser les voies parallèles et le réseau distribué de cabines d'aiguillage (Étape 4) | Arthur Morin | #10 |
| Conduire la première session de tests utilisateurs (2 personnes extérieures) sur les étapes 0 à 3 | Alban Chabalier & Arthur Morin | #17 |

## 8. Signaux d'alerte

- [ ] Le board n'a été mis à jour qu'aujourd'hui.
- [ ] La répartition est fortement déséquilibrée et non expliquée.
- [x] Nous n'avons pas encore atteint les 2 testeurs extérieurs requis (protocole prêt, prévu en semaine 5 avec le socle des étapes 0 à 3 fonctionnel).
- [ ] Un choix de modélisation important n'est pas justifié.
- [ ] Une notion n'a pas avancé depuis 2 semaines.

**Règle vérifiable d'absence d'avancement depuis 2 semaines :** cocher cette case si, entre les deux dernières fiches hebdomadaires successives, aucune évolution visible n'est constatée pour la notion concernée dans le code, l'interface, `CHOIX-MODELISATION.md`, les issues ou les tests.
Nommer la notion et la preuve vérifiée : Aucune notion en stagnation ; avancée majeure cette semaine sur la structure du bloc (Notion 1) et le chaînage cryptographique (Notion 2) passés au statut Testé, avec maintien d'un framerate de 60 FPS.

## 9. Validation

| Élément | Réponse |
|:---|:---|
| Fiche relue par tous | Oui |
| Date d'envoi | 30/10/2026 |
| Noms des membres | Arthur Morin, Alban Chabalier |
