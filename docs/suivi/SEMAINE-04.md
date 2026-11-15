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
- Nettoyer l'interface utilisateur en supprimant les badges artificiels, textes soulignés superflus et fausses interactions.
- Refondre la logique visuelle de rupture de l'attelage à l'étape 2 (mise en évidence de la cause par discordance de couleur jaune/cyan).
- Enrichir exhaustivement le fichier README.md avec les liens utiles, les tableaux des 7 notions, des 4 jalons et la déclaration d'usage de l'IA.
- Mettre à jour l'état réel des issues et du Kanban GitHub Projects.

### 1.1 Réalisé
| Issue / tâche | Notion concernée | Statut | Preuve |
|:---|:---|:---|:---|
| Nettoyage de l'interface : suppression des badges artificiels et des textes soulignés avec curseur d'aide | Ergonomie / UX | Fonctionnel | Styles dans `src/style.css` épurés et nettoyage dans l'ensemble des modules d'étapes (`step0.js` à `step7.js`) |
| Suppression des interactions gadgets sans valeur pédagogique (boutons de surbrillance et pulsation superflus) | Ergonomie / UX | Fonctionnel | Simplification des étapes 1 et 2 en 2 sous-parties claires et sans fioritures |
| Refonte de la logique visuelle de rupture à l'étape 2 (anneau arrière jaune vs anneau avant cyan) | Notion 2 — Chaînage et avalanche | Testé | Module `src/steps/step2.js` : l'altération fait virer l'anneau du wagon 0 au jaune, provoquant le décrochage mécanique avec le crochet cyan du wagon 1 |
| Enrichissement complet du README.md (public, liens, tableau des 7 notions, 4 jalons, critères qualité et déclaration IA) | Documentation | Fonctionnel | `README.md` complété selon les critères académiques et standards du BUT MMI |
| Structuration guidée de l'Étape 0 (Locomotive sans conducteur, wagons transparents) | Étape 0 / Cadrage | Fonctionnel | Module `src/steps/step0.js` opérationnel avec repères caméra |
| Modélisation 3D et optimisation des maillages de la motrice et des wagons | Modélisation 3D | Testé | Classes `LocomotiveMesh.js` et `WagonMesh.js` assurant un framerate constant de 60 FPS |

### 1.2 Prévu mais non réalisé
| Tâche | Cause | Report |
|:---|:---|:---|
| Passation des 2 sessions de tests utilisateurs extérieurs | Priorité donnée à la fiabilisation complète des étapes 1 et 2 et à l'épuration UI pour proposer un parcours propre aux testeurs | Planifié en semaine 5 avec les étapes 0, 1, 2 et le prototype de l'étape 3 |

### 1.3 État des 7 notions

| Notion obligatoire | État | Remarque / preuve |
|:---|:---|:---|
| Structure d'un bloc | Testé | Découpage en 2 sous-parties percutantes : chargement interactif avec recalcul du Hash en 1.1, et rotation 3D de la molette de Nonce en 1.2 dans `step1.js` |
| Chaînage cryptographique | Testé | Découpage en 2 sous-parties : attelage magnétique en 2.1, rupture explicite par discordance jaune/cyan et restauration du convoi en 2.2 dans `step2.js` |
| Immutabilité et détection de falsification | En cours | Mécanique de rupture en cascade présente dans `train.js` ; intégration du parcours interactif dans `step3.js` |
| Réseau et décentralisation | En cours | Architecture définie dans `step4.js` ; modélisation des voies parallèles et cabines d'aiguillage en cours |
| Validation et minage | En cours | Molette mécanique et logique PoW opérationnelles ; mise en scène visuelle de la chauffe motrice en cours dans `step5.js` |
| Comparaison d'au moins deux mécanismes de consensus | En cours | Opposition motrice thermique (PoW) et caution d'aiguillage (PoS) cadrée dans `step6.js` |
| Cycle de vie d'une transaction et scénario d'attaque illustré | En cours | Scénario quai/mempool et rejet de double dépense cadré dans `step7.js` |

**Définitions des états :**
- `En cours` = une partie est implémentée mais incomplète ou non vérifiée ;
- `Fonctionnel` = le parcours prévu fonctionne localement au moins une fois ;
- `Testé` = il a été vérifié par au moins un test documenté (et, pour les tests externes, par une personne extérieure au groupe).

## 2. Répartition du travail

| Membre | Tâches / issues | Issues traitées | Commits |
|:---|:---|:---:|:---:|
| Arthur Morin | Affinement de la motrice, des wagons, des sous-parties de l'étape 0 et préparation des rails et décors. Ajustement des maillages, géométries des anneaux magnétiques et textures des plaques. | #14, #15, #16 | Commits sur `LocomotiveMesh.js`, `WagonMesh.js`, `step0.js` et `environment.js` |
| Alban Chabalier | Nettoyage de l'interface (suppression des badges artificiels et des textes soulignés), refonte de la logique visuelle de rupture à l'étape 2 (discordance jaune/cyan), enrichissement complet du `README.md` et mise à jour du board Kanban GitHub. | #7, #8, #16, #21, #28 | Commits sur `step1.js`, `step2.js`, `step0.js` à `step7.js`, `style.css`, `README.md` et `SEMAINE-04.md` |

## 3. GitHub Projects

| Question | Réponse |
|:---|:---|
| Issues créées | Issue #28 (Rédiger la fiche de suivi - Semaine 4) |
| Issues fermées | Issue #7, #8, #16, #21, #27, #28 |
| Nombre dans `Backlog` / `À faire` / `En cours` / `À vérifier` / `Terminé` | 8 dans `Backlog` (#17, #18, #19, #20, #22, #23, #24, #25), 3 dans `À faire` (#11, #12, #13), 2 dans `En cours` (#9, #10), 0 dans `À vérifier`, 13 dans `Terminé` (#1, #2, #3, #4, #5, #6, #7, #8, #14, #16, #21, #26, #27, #28) |
| Board mis à jour pendant la semaine ? | Oui, mis à jour via GitHub CLI : passage des tâches README, étapes 1 et 2 et interface dans "Terminé" ; étapes 3 et 4 positionnées dans "En cours" ; étape 5 dans "À faire" |
| Milestone concerné et état | Jalon 2 "Prototype fonctionnel interactif" : étapes 0, 1 et 2 entièrement validées, documentation et README à jour |

## 4. Choix de modélisation

| Question | Réponse |
|:---|:---|
| Fiches de `MMI-R507-projet-blockchain-CHOIX-MODELISATION.md` complétées | Les choix restent en parfaite cohérence avec les fiches de cadrage. La suppression des gadgets et des sous-étapes superflues renforce la lisibilité pédagogique. |
| Choix important et justification | **Cause visuelle de détachement par discordance de couleur (Étape 2.2) :** L'anneau arrière du wagon modifié passe au jaune corrompu alors que le crochet du wagon suivant attend du cyan. La discordance visuelle jaune != cyan explique immédiatement pourquoi l'arc magnétique ne peut s'enclencher, avant même que la suite ne vire au rouge. |
| Choix important et justification | **Élimination du format rigide en 3 sous-étapes :** Les étapes 1 et 2 sont désormais resserrées sur 2 sous-parties denses et concrètes au lieu de forcer une 3e sous-étape sans valeur ajoutée. |
| Choix remis en question | **Suppression des textes soulignés et infobulles "?" :** Les termes techniques avec soulignement pointillé et curseur d'aide ont été retirés pour éviter les fausses promesses d'interaction et préserver une typographie fluide et naturelle. |

## 5. Tests utilisateurs

| Question | Réponse |
|:---|:---|
| Nombre de testeurs extérieurs cette semaine | 0 (finalisation et consolidation des étapes 1 et 2) |
| Compréhension ou problème observé | Lors des tests internes, les boutons de surbrillance et de pulsation donnaient une impression de gadget sans apporter de compréhension supplémentaire. De plus, la rupture de chaîne n'était pas assez explicite sur la cause de la déconnexion. |
| Issue corrective | Simplification radicale des étapes 1 et 2, matérialisation de la signature corrompue en jaune sur l'anneau émetteur, et enrichissement de la documentation README. Première session extérieure planifiée en semaine 5. |

## 6. IA, difficultés et besoins

| Question | Réponse |
|:---|:---|
| Usage de l'IA et vérifications effectuées | Outils utilisés : Gemini et Antigravity. Rôle : aide à la structure Three.js, calculs de rotation de la molette et rédaction des fiches de suivi, sous le contrôle rigoureux du binôme. Aucun contenu n'a été intégré sans relecture et test préalable. |
| Blocage technique | Comportement des matériaux Three.js lors de la rupture : s'assurer que la boucle d'animation maintient l'anneau corrompu en jaune et le récepteur en cyan sans écraser les couleurs à chaque rafraîchissement. Résolu par une gestion d'état stricte dans `startAnimationLoop()`. |
| Blocage pédagogique ou organisationnel | Aucun blocage ; l'analogie ferroviaire est désormais claire, sobre et sans artifice textuel. |
| Besoin d'un point enseignant | Aucun blocage nécessitant une intervention urgente. Présentation du prototype interactif (étapes 0 à 2) prévue lors de la prochaine séance. |

## 7. Objectifs de la semaine suivante

| Objectif | Responsable | Issue |
|:---|:---|:---|
| Développer l'étape 3 : rupture d'immutabilité et scénario de falsification en cascade | Alban Chabalier | #9 |
| Modéliser les voies parallèles et le réseau distribué de cabines d'aiguillage (Étape 4) | Arthur Morin | #10 |
| Conduire la première session de tests utilisateurs (2 personnes extérieures) sur les étapes 0 à 3 | Alban Chabalier & Arthur Morin | #17 |

## 8. Signaux d'alerte

- [ ] Le board n'a été mis à jour qu'aujourd'hui.
- [ ] La répartition est fortement déséquilibrée et non expliquée.
- [x] Nous n'avons pas encore atteint les 2 testeurs extérieurs requis (protocole prêt, planifié en semaine 5 sur les étapes 0 à 3).
- [ ] Un choix de modélisation important n'est pas justifié.
- [ ] Une notion n'a pas avancé depuis 2 semaines.

**Règle vérifiable d'absence d'avancement depuis 2 semaines :** cocher cette case si, entre les deux dernières fiches hebdomadaires successives, aucune évolution visible n'est constatée pour la notion concernée dans le code, l'interface, `CHOIX-MODELISATION.md`, les issues ou les tests.
Nommer la notion et la preuve vérifiée : Aucune notion en stagnation ; avancée majeure avec les étapes 1 et 2 stabilisées et testées à 60 FPS, UI épurée et documentation README enrichie.

## 9. Validation

| Élément | Réponse |
|:---|:---|
| Fiche relue par tous | Oui |
| Date d'envoi | 30/10/2026 |
| Noms des membres | Arthur Morin, Alban Chabalier |
