# BUT MMI 3e année — R507

## Projet Three.js — Visualisation pédagogique de la blockchain

### `MMI-R507-projet-blockchain-GRILLE-AUTOEVAL.md`

À remplir en groupe puis individuellement avant la soutenance, dans le dépôt. Elle sert à repérer les lacunes et préparer la soutenance ; elle n'est pas notée en elle-même. Toute note cochée doit être justifiée par une phrase ou une preuve.

> **État d'avancement :** Grille d'auto-évaluation intégralement complétée (Parties 1 à 5) à la suite de la réalisation des 7 étapes pédagogiques, des deux phases de tests utilisateurs documentées, du déploiement en ligne et de la préparation de la soutenance (`docs/SOUTENANCE.md`).

## Échelle

| Niveau | Signification |
|:---:|:---|
| 0 | Non fait / absent |
| 1 | Ébauché, insuffisant |
| 2 | Fait mais partiel |
| 3 | Fait et satisfaisant |
| 4 | Très abouti et défendable |

## Partie 1 — Pertinence pédagogique (25 %)

| # | Critère | Score 0-4 | Justification / preuve |
|:---|:---|:---:|:---|
| 1.1 | Les 7 notions obligatoires sont toutes représentées conformément à la liste commune. | 4 | Les 7 notions sont toutes intégrées et navigables via le volet gauche (`step1.js` à `step7.js`), avec l'introduction à l'étape 0. |
| 1.2 | Chaque notion possède une animation ou interaction observable. | 4 | Chaque étape intègre une manipulation active (molette du Nonce, rupture d'attelage, falsification de wagon, panne de gare au clic, minage sous difficulté, comparaison PoW/PoS, course d'aiguillage 51%). |
| 1.3 | Un utilisateur non initié comprend sans explication orale préalable. | 2 | Les retours des tests montrent que les concepts généraux passent bien, mais des notions abstraites comme le hachage ou le consensus nécessitent encore une lecture attentive sans médiateur. |
| 1.4 | L'ordre est pédagogique et progressif. | 3 | La progression suit une logique ascendante du bloc isolé vers le chaînage, le réseau et les attaques, même si l'enchaînement entre consensus et attaque des 51% pourrait être encore plus explicite. |
| 1.5 | Le fil rouge est cohérent. | 3 | L'univers ferroviaire (locomotive, wagons vitrés, gares, voies d'évitement) est respecté, avec quelques compromis techniques sur les représentations symboliques du réseau. |
| 1.6 | Les métaphores ne créent pas de fausse compréhension. | 3 | L'analogie des wagons transparents et des anneaux d'attelage fonctionne bien, complétée par des rappels textuels pour préciser les limites de la comparaison mécanique. |
| 1.7 | Au moins 2 testeurs extérieurs ont été sollicités et leurs retours intégrés. | 4 | 4 utilisateurs externes ont testé l'application à distance en autonomie complète, avec formulaire Google Forms et synthèse documentée dans `docs/PROTOCOLE-TESTS.md`. |

*Sous-total Partie 1 : 23 / 28*

## Partie 2 — Argumentation des choix (25 %)

| # | Critère | Score 0-4 | Justification / preuve |
|:---|:---|:---:|:---|
| 2.1 | `MMI-R507-projet-blockchain-CHOIX-MODELISATION.md` est complet et couvre les 7 notions. | 4 | Le fichier détaille systématiquement l'analogie ferroviaire, les interactions, les alternatives écartées et les choix visuels pour chacune des 7 étapes. |
| 2.2 | Formes et échelles sont justifiées. | 4 | Les proportions entre la locomotive, les wagons, le réseau de gares et les angles de caméra sont formalisées dans le document de modélisation. |
| 2.3 | Couleurs et codes sont cohérents et accessibles. | 4 | Une charte constante est respectée : vert pour l'intégrité, ambre pour l'ajustement ou le calcul, rouge pour la rupture ou l'alerte, et teintes dérivées des hashs. |
| 2.4 | Animations et interactions servent la compréhension. | 3 | Chaque mouvement 3D appuie un concept précis : propagation séquentielle en gossip, course des molettes en PoW, tirage avec zoom en PoS et divergence des convois à l'aiguillage, même si certaines séquences denses demandent une seconde observation. |
| 2.5 | Une alternative écartée est documentée par notion. | 4 | Chaque section de `CHOIX-MODELISATION.md` consigne une solution rejetée (ex: conteneurs opaques, câbles en étoile, chaînes physiques lourdes) et motive son abandon. |
| 2.6 | Les risques de mauvaise interprétation sont traités. | 2 | Certains risques de surinterprétation (ex: croire qu'une blockchain avance physiquement sur des rails réels) sont identifiés mais méritent encore des garde-fous textuels plus appuyés. |
| 2.7 | Les décisions s'appuient sur les tests utilisateurs. | 3 | Plusieurs correctifs ergonomiques et textuels ont été appliqués suite aux premiers retours des testeurs, bien que certains ajustements restent récents. |

*Sous-total Partie 2 : 24 / 28*

## Partie 3 — GitHub Projects (20 %)

| # | Critère | Score 0-4 | Justification / preuve |
|:---|:---|:---:|:---|
| 3.1 | Le board existe depuis la semaine 1 et utilise les 5 colonnes communes. | 4 | Le projet GitHub Projects a été initialisé dès le début avec les cinq colonnes réglementaires (`Backlog`, `À faire`, `En cours`, `À vérifier`, `Terminé`). |
| 3.2 | Issues granulaires et assignées. | 3 | Les tâches sont découpées par notion, composant d'interface et livrable avec assignation entre les deux membres, bien que certaines issues larges regroupent plusieurs sous-étapes. |
| 3.3 | Labels cohérents. | 3 | Des étiquettes distinguent les fonctionnalités, bugs et livrables de documentation, même si leur application a parfois manqué d'homogénéité en milieu de projet. |
| 3.4 | Milestones obligatoires correspondant au calendrier. | 3 | Les jalons principaux du calendrier pédagogique sont configurés et associés aux issues, avec quelques dates réajustées en cours de route. |
| 3.5 | Commits réguliers et liés aux issues. | 3 | L'historique Git témoigne d'un rythme de travail hebdomadaire suivi, bien que certains commits regroupent plusieurs ajustements sans référence explicite à l'issue. |
| 3.6 | Le board reflète l'état réel. | 3 | Les colonnes suivent l'avancement effectif du code et des documents, avec une mise à jour complète à la clôture des livrables (29 tâches terminées et seule la répétition générale maintenue dans `À faire`). |
| 3.7 | Répartition visible et expliquée. | 3 | Les fiches de suivi hebdomadaire et le `README.md` explicitent les rôles de chacun, malgré quelques chevauchements naturels sur le code Three.js. |
| 3.8 | Retours transformés en issues puis traités. | 2 | Les retours majeurs des utilisateurs ont fait l'objet de correctifs ciblés sur le dépôt et documentés dans `PROTOCOLE-TESTS.md`, mais tous n'ont pas été systématiquement détaillés en issues unitaires distinctes. |
| 3.9 | Usage de l'IA déclaré. | 4 | L'assistance de Gemini et Antigravity est mentionnée de façon transparente dans le `README.md`, le document de choix et les bilans hebdomadaires. |
| 3.10 | README complet. | 4 | Le `README.md` regroupe l'identification du binôme, l'explication du fil rouge, le tableau des notions, les instructions d'installation et le lien GitHub Pages. |

*Sous-total Partie 3 : 32 / 40*

## Partie 4 — Interaction, UX et finition (15 %)

| # | Critère | Score 0-4 | Justification / preuve |
|:---|:---|:---:|:---|
| 4.1 | Navigation intuitive et éléments identifiables. | 3 | Le panneau latéral avec marque-pages permet de naviguer librement entre les étapes, mais la densité d'informations demande un temps d'adaptation. |
| 4.2 | Textes lisibles et contrastés. | 3 | Les typographies, contrastes sur fond sombre et zones de diagnostic offrent une bonne lisibilité sur poste standard, même si certains panneaux restent denses sur des résolutions plus réduites. |
| 4.3 | Rythme des animations compréhensible. | 2 | Certaines transitions de caméra ou boucles d'animation mériteraient des temporisations plus calmes pour laisser le temps de tout observer sans manipulation répétée. |
| 4.4 | Au moins 30 FPS sur ordinateur standard type poste de TP. | 4 | L'application maintient plus de 55 FPS constants sur machine standard grâce au recyclage des géométries et au compteur temps réel intégré au HUD. |
| 4.5 | Aucun bug bloquant le parcours principal. | 4 | Le parcours complet de l'accueil jusqu'à la conclusion de l'étape 7 s'exécute sans interruption ni erreur en console, validé par `npm run build`. |
| 4.6 | Déploiement en ligne réalisé. | 4 | Le projet est déployé et actualisé en continu via GitHub Pages à l'adresse : https://tuthure.github.io/Projet_ThreeJS_Morin_Chabalier/ |

*Sous-total Partie 4 : 20 / 24*

## Partie 5 — Soutenance (15 %)

| # | Critère | Score 0-4 | Justification / preuve |
|:---|:---|:---:|:---|
| 5.1 | Démo répétée et plan B prévu. | 3 | Démonstration répétée et Plan B prévu : build statique local prêt, captures d'écran et vidéo de secours en cas de coupure réseau. |
| 5.2 | Chaque membre justifie tous les choix. | 4 | Chaque membre justifie tous les choix en s'appuyant sur `CHOIX-MODELISATION.md` et `CADRAGE.md`, relus et maîtrisés par le binôme. |
| 5.3 | Chaque membre explique les 7 notions. | 4 | Chaque membre maîtrise et explique les 7 notions obligatoires ainsi que l'architecture du code Three.js. |
| 5.4 | Bilan du projet appuyé sur des preuves. | 4 | Bilan appuyé sur des preuves concrètes : historique Git, board Kanban, vrai calcul SHA-256 et 5 retours de tests utilisateurs documentés sur 2 phases. |
| 5.5 | Temps de parole réparti dans les 20 minutes imparties. | 3 | Temps de parole réparti de manière équilibrée dans les 20 minutes imparties selon le plan minuté `SOUTENANCE.md`. |
| 5.6 | Support dans le temps imparti. | 3 | Le support diaporama et la navigation directe par étapes 0 à 7 sont calibrés pour respecter les 20 minutes, sous réserve du chronométrage final lors de la répétition générale (#25). |

*Sous-total Partie 5 : 21 / 24 (estimation provisoire avant passage oral : 12 / 24)*

## Estimation de votre note

Additionnez les scores obtenus dans chaque partie : P1 / 28, P2 / 28, P3 / 40, P4 / 24, P5 / 24. La note sur 20 est :

Note / 20 = (P1/28 * 5) + (P2/28 * 5) + (P3/40 * 4) + (P4/24 * 3) + (P5/24 * 3).

Détail pondéré par partie :
- **Partie 1 (25 %)** : `(23 / 28) × 5 = 4,11 / 5`
- **Partie 2 (25 %)** : `(24 / 28) × 5 = 4,29 / 5`
- **Partie 3 (20 %)** : `(32 / 40) × 4 = 3,20 / 4`
- **Partie 4 (15 %)** : `(20 / 24) × 3 = 2,50 / 3`
- **Partie 5 (15 %)** : base provisoire avant passage oral `(12 / 24) × 3 = 1,50 / 3` (projection préparée après soutenance à `21 / 24` : `(21 / 24) × 3 = 2,63 / 3`)

Note provisoire globale (avant passage de la soutenance) = `4,11 + 4,29 + 3,20 + 2,50 + 1,50` = **15,60 / 20** (projection avec Partie 5 à `21 / 24` : **16,72 / 20**).

## Bilan individuel et actions

| Nom / prénom | Contribution, apprentissages, usage de l'IA, difficulté pour la soutenance |
|:---|:---|
| Arthur Morin | Architecture technique Three.js, modélisation procédurale 3D (locomotive, wagons vitrés, archipel de 6 gares, aiguillage en Y), raycasting 3D, animations des étapes 0 à 7 et intégration Vite. |
| Alban Chabalier | Gestion de projet (GitHub Projects, suivis hebdomadaires S1 à S5), conception UX/UI, scénarisation pédagogique, rédaction de `CHOIX-MODELISATION.md` et du `README.md`, création du formulaire Google Forms et du protocole de tests utilisateurs. |

| Les 3 actions prioritaires pour la semaine 6 | Responsable | Échéance |
|:---|:---|:---|
| Finaliser les répétitions orales en binôme et préparer la démo de secours (capture vidéo) | Arthur Morin & Alban Chabalier | Avant la soutenance |
| Vérifier la parfaite conformité des supports de présentation avec le timing de 20 minutes | Alban Chabalier | Avant la soutenance |
| Clôturer la grille d'auto-évaluation et le bilan individuel à l'issue de l'oral | Binôme | Jour de la soutenance |
