# BUT MMI 3e année — R507

## Projet Three.js — Visualisation pédagogique de la blockchain

### Fiche de suivi hebdomadaire — Semaine 03

## 0. Informations générales

| Champ | Contenu |
|:---|:---|
| Groupe | Binôme Arthur Morin (@tuthure) & Alban Chabalier (@achabalier14) |
| Projet | Visualisation pédagogique de la blockchain avec Three.js (Le Convoi Ferroviaire Blindé) |
| Semaine | 03 |
| Dates couvertes | Du 17 au 23 octobre 2026 |
| Membres présents | Arthur Morin, Alban Chabalier |
| Lien dépôt / GitHub Projects | https://github.com/tuthure/Projet_ThreeJS_Morin_Chabalier / https://github.com/tuthure/Projet_ThreeJS_Morin_Chabalier/projects |
| Lien démo en ligne | https://tuthure.github.io/Projet_ThreeJS_Morin_Chabalier/ |

## 1. Avancement

**Objectifs prévus pour la semaine :**
- Améliorer l'environnement 3D général et l'habillage du convoi ferroviaire.
- Concevoir un sas d'introduction / accueil pour l'utilisateur non initié avant d'entrer dans les étapes techniques.
- Restructurer la navigation et le volet latéral pour intégrer une étape 0 (bienvenue / contexte) et fluidifier le passage des étapes 1 à 7.
- Poursuivre la réflexion sur la pédagogie et l'inclusivité des interactions.

### 1.1 Réalisé
| Issue / tâche | Notion concernée | Statut | Preuve |
|:---|:---|:---|:---|
| Refonte de l'environnement 3D et du décor ferroviaire (parallaxe, reliefs, sapins, lanternes, rails et vapeur) | Métaphore et immersion 3D | Fonctionnel | Classe `Environment` dans `src/environment.js` intégrée dans la boucle de rendu |
| Développement du sas d'accueil et d'introduction avec convoi panoramique à 10 wagons | Sas d'introduction / UX | Fonctionnel | Module `src/welcome.js` et carte d'accueil dans `index.html` activés au chargement |
| Intégration de l'Étape 0 (Le Principe du Convoi) posant l'analogie ferroviaire vulgarisée | Cadrage pédagogique / Notion 0 | Fonctionnel | Module `src/steps/step0.js` opérationnel avec navigation pas-à-pas |
| Restructuration du volet latéral gauche avec marque-pages 0 à 7 sur le bord droit | Ergonomie et navigation | Fonctionnel | `src/steps/StepManager.js` avec onglets numérotés verticaux et retrait de la barre inférieure |
| Optimisation des performances et maintien d'un framerate stable à 60 FPS | Performance technique | Testé | Maintien de 60 FPS constants sur machine standard grâce aux géométries low-poly partagées |
| Cadrage ergonomique et préparation des étapes d'interaction (notamment étapes 4 à 6) | Pédagogie / Notions 4 à 6 | En cours | Squelettes des modules `step4.js`, `step5.js` et `step6.js` préparés avec vulgarisation des termes |

### 1.2 Prévu mais non réalisé
| Tâche | Cause | Report |
|:---|:---|:---|
| Conduite des 2 tests utilisateurs extérieurs | Priorité donnée à la mise en place du sas d'accueil et de l'étape 0 pour disposer d'un parcours intelligible pour des novices | Reprogrammé en semaine 4 dès que les interactions des étapes 2 et 3 seront totalement enrichies |

### 1.3 État des 7 notions

| Notion obligatoire | État | Remarque / preuve |
|:---|:---|:---|
| Structure d'un bloc | Fonctionnel | Wagon blindé translucide avec molette de Nonce, plaque Hash, Previous Hash et conteneur de données ; étape 1 entièrement intégrée dans `src/steps/step1.js` |
| Chaînage cryptographique | En cours | Attelage magnétique reliant previousHash et hash ; module `src/steps/step2.js` prêt pour l'enrichissement des interactions |
| Immutabilité et détection de falsification | En cours | Mécanique de rupture en cascade présente dans `train.js` ; intégration du pas-à-pas interactif dans `src/steps/step3.js` |
| Réseau et décentralisation | En cours | Architecture définie dans `src/steps/step4.js` ; représentation multi-voies et aiguilleurs en cours de cadrage |
| Validation et minage | En cours | Molette mécanique et logique PoW opérationnelles ; mise en scène de la surchauffe motrice dans `src/steps/step5.js` |
| Comparaison d'au moins deux mécanismes de consensus | En cours | Motrice thermique modélisée pour figurer PoW face à la caution d'aiguillage PoS ; module `src/steps/step6.js` initialisé |
| Cycle de vie d'une transaction et scénario d'attaque illustré | En cours | Flux transactionnel quai/mempool et scénario double dépense cadrés ; module `src/steps/step7.js` initialisé |

**Définitions des états :**

- `En cours` = une partie est implémentée mais incomplète ou non vérifiée ;
- `Fonctionnel` = le parcours prévu fonctionne localement au moins une fois ; 
- `Testé` = il a été vérifié par au moins un test documenté (et, pour les tests externes, par une personne extérieure au groupe). 
- `Non commencé` et `Bloqué` peuvent aussi être utilisés.

## 2. Répartition du travail

| Membre | Tâches / issues | Issues traitées | Commits |
|:---|:---|:---:|:---:|
| Arthur Morin | Refonte de l'environnement 3D et du convoi ferroviaire (décors nocturnes, parallaxe, sapins, lanternes, ballast, rails, fumée). Développement du module d'introduction (`welcome.js` / étape 0) et de la vue panoramique sur 10 wagons. Restructuration du volet latéral gauche avec système de marque-pages 0 à 7 et épuration CSS. Correction du z-fighting et ajustement de l'éclairage. | #14, #15, #16 | Commits sur `environment.js`, `welcome.js`, `step0.js`, `StepManager.js`, `style.css` et `index.html` |
| Alban Chabalier | Cadrage ergonomique et pédagogique des étapes à venir : vulgarisation des concepts pour le public non initié et suppression du jargon mathématique intimidant. Préparation de la structure des prochaines étapes d'interaction (étapes 4 à 6). Suivi du tableau de bord GitHub Projects, mise à jour des issues et de la documentation hebdomadaire. | #7, #8, #14, #26 | Rédaction de la documentation, suivi de projet, cadrage UX des étapes 0 à 6 |

## 3. GitHub Projects

| Question | Réponse |
|:---|:---|
| Issues créées | Aucune nouvelle issue majeure cette semaine, travail articulé sur les issues existantes du Jalon 2 |
| Issues fermées | Issue #14 (Storyboard du parcours complet et mise en scène du train), Issue #26 (Fiche de suivi Semaine 2), Issue #6 (Initialisation du dépôt Vite/Three.js) |
| Nombre dans `Backlog` / `À faire` / `En cours` / `À vérifier` / `Terminé` | 3 dans `Backlog`, 10 dans `À faire`, 5 dans `En cours` (#7, #8, #9, #10, #11), 0 dans `À vérifier`, 8 dans `Terminé` (#1, #2, #3, #4, #5, #6, #14, #26) |
| Board mis à jour pendant la semaine ? | Oui, mis à jour via GitHub CLI pour refléter l'achèvement de la mise en scène du train et l'avancement des étapes 1 à 5 |
| Milestone concerné et état | Jalon 2 "Prototype fonctionnel interactif" : bonne progression avec l'introduction et l'étape 0 achevées, étapes 1 à 3 en cours de finition interactive |

## 4. Choix de modélisation

| Question | Réponse |
|:---|:---|
| Fiches de `MMI-R507-projet-blockchain-CHOIX-MODELISATION.md` complétées | Les fiches restent cohérentes avec les choix validés en semaine 2. L'intégration de l'étape 0 confirme la pertinence de l'analogie locomotive/moteur et wagon/bloc. |
| Choix important et justification | **Sas d'accueil panoramique (Écran Welcome) :** Présenter un convoi long de 10 wagons en circulation dans un décor vivant avant toute interaction permet à l'apprenant d'appréhender intuitivement l'objet d'étude dans sa globalité avant d'en disséquer les maillons individuels. |
| Choix important et justification | **Navigation par marque-pages verticaux (0 à 7) :** L'intégration des onglets directement sur le volet gauche supprime le besoin d'une barre de navigation inférieure encombrante, libérant ainsi le champ de vision sur la voie ferrée et la scène 3D. |
| Choix remis en question | **Suppression des badges d'état lumineux superflus :** Les badges lumineux surchargés dans les en-têtes ont été retirés pour préserver une interface sobre et reposante, évitant l'effet tableau de bord gadget. |

## 5. Tests utilisateurs

| Question | Réponse |
|:---|:---|
| Nombre de testeurs extérieurs cette semaine | 0 (étape de cadrage de l'introduction et stabilisation du décor 3D) |
| Compréhension ou problème observé | Lors des tests internes, le saut direct dans l'étape 1 (Structure du bloc) apparaissait trop brutal pour un novice qui ne comprenait pas ce que représentait le wagon sans mise en contexte préalable. L'ajout du sas Welcome et de l'Étape 0 résout ce point de friction. |
| Issue corrective | Issue #17 planifiée pour la semaine 4 : organisation concrète de la première session de tests avec 2 personnes extérieures au groupe sur le parcours Welcome + Étapes 0 à 3. |

## 6. IA, difficultés et besoins

| Question | Réponse |
|:---|:---|
| Usage de l'IA et vérifications effectuées | Assistance pour l'agencement algorithmique des éléments répétitifs de l'environnement (positionnement et dispersion des sapins et poteaux le long de la voie) et le calcul des décalages de texture pour le défilement en boucle. Chaque proposition de code a fait l'objet d'une relecture rigoureuse, d'une vérification de performances et d'un nettoyage manuel du style CSS. |
| Blocage technique | - Équilibre entre richesse visuelle de l'environnement et fluidité d'exécution : maintien des 30+ FPS sur machine standard grâce à l'utilisation de géométries Three.js partagées (BufferGeometry low-poly réutilisées pour les arbres et poteaux).<br>- Phénomène de z-fighting constaté sur les crêtes des montagnes lointaines : éliminé en séparant nettement les plans de profondeur et en ajustant la superposition des sommets enneigés. |
| Blocage pédagogique ou organisationnel | Accessibilité et pédagogie pour public non initié : risque de décrochage si les concepts techniques (hash SHA-256, nonce) sont abordés sans préparation. Résolu par l'introduction de l'étape 0 vulgarisée et l'épuration du vocabulaire. |
| Besoin d'un point enseignant | Aucun blocage technique nécessitant une intervention d'urgence. Un retour rapide sur l'ergonomie du volet à marque-pages lors du prochain TD serait appréciable. |

## 7. Objectifs de la semaine suivante

| Objectif | Responsable | Issue |
|:---|:---|:---|
| Approfondir le contenu pédagogique et interactif de chaque étape (rendre les interactions plus concrètes et moins scolaires) | Alban Chabalier | #7, #8, #9 |
| Finaliser les maquettes / prototypes UI et intégrer les mécaniques des étapes 4 (réseau / aiguillages) et 5 (minage) | Arthur Morin | #10, #11 |
| Planifier et mener les créneaux pour les deux tests utilisateurs obligatoires | Alban Chabalier & Arthur Morin | #17 |

## 8. Signaux d'alerte

- [ ] Le board n'a été mis à jour qu'aujourd'hui.
- [ ] La répartition est fortement déséquilibrée et non expliquée.
- [x] Nous n'avons pas encore atteint les 2 testeurs extérieurs requis (normal à ce stade : le sas d'accueil et les étapes 0 à 3 fournissent le socle nécessaire qui sera testé en semaine 4).
- [ ] Un choix de modélisation important n'est pas justifié.
- [ ] Une notion n'a pas avancé depuis 2 semaines.

**Règle vérifiable d'absence d'avancement depuis 2 semaines :** cocher cette case si, entre les deux dernières fiches hebdomadaires successives, aucune évolution visible n'est constatée pour la notion concernée dans le code, l'interface, `CHOIX-MODELISATION.md`, les issues ou les tests (aucun commit, issue déplacée/fermée, preuve ajoutée ou observation nouvelle). Nommer la notion et la preuve vérifiée : Aucune notion en stagnation ; enrichissement global de l'écosystème avec l'étape 0 d'introduction, et progression continue sur les structures de code des notions 1 à 5.

## 9. Validation

| Élément | Réponse |
|:---|:---|
| Fiche relue par tous | Oui |
| Date d'envoi | 23/10/2026 |
| Noms des membres | Arthur Morin, Alban Chabalier |
