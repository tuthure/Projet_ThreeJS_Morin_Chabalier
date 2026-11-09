# BUT MMI 3e année — R507

## Projet Three.js — Visualisation pédagogique de la blockchain

### `MMI-R507-projet-blockchain-GRILLE-AUTOEVAL.md`

À remplir en groupe puis individuellement avant la soutenance, dans le dépôt. Elle sert à repérer les lacunes et préparer la soutenance ; elle n'est pas notée en elle-même. Toute note cochée doit être justifiée par une phrase ou une preuve.

> **État d'avancement (Semaine 5 — 06/11/2026) :** Grille pré-remplie pour les éléments déjà actés et fonctionnels (cadrage, GitHub Projects, déploiement en ligne, étapes 0 à 6 fonctionnelles, protocole de test). Les critères dépendant de la finalisation de l'étape 7, des retours des 2 testeurs extérieurs et de la répétition de soutenance restent volontairement ouverts pour la semaine 6.

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
| 1.1 | Les 7 notions obligatoires sont toutes représentées conformément à la liste commune. | 3 | Les notions 1 à 6 sont intégralement implémentées et fonctionnelles (`step1.js` à `step6.js`) ; la notion 7 (`step7.js`) est en cours de finalisation par Arthur. |
| 1.2 | Chaque notion possède une animation ou interaction observable. | 3 | Étapes 1 à 6 dotées d'interactions 3D dédiées (molette du Nonce, ajout de wagon, falsification et décrochage, extinction de gare au clic 3D, minage sous difficulté, course PoW vs loterie PoS) ; étape 7 à valider. |
| 1.3 | Un utilisateur non initié comprend sans explication orale préalable. | | *À valider en semaine 6 lors de la passation des tests auprès des 2 utilisateurs extérieurs.* |
| 1.4 | L'ordre est pédagogique et progressif. | 4 | Progression structurée du sas d'accueil et de l'étape 0 (principe du convoi) vers l'anatomie d'un bloc (1), le chaînage (2), la falsification (3), le réseau de gares (4), le minage (5), le consensus (6) et l'attaque (7). |
| 1.5 | Le fil rouge est cohérent. | 4 | Métaphore du Convoi Ferroviaire Blindé maintenue sans rupture : locomotive, wagons vitrés, attelages magnétiques colorés, molette crantée du Nonce, archipel de gares et aiguillage en Y. |
| 1.6 | Les métaphores ne créent pas de fausse compréhension. | 4 | Rappel explicite de la formule déterministe `SHA-256` et affichage des empreintes hexadécimales sur infobulles 3D reliées en SVG pour éviter toute confusion entre l'analogie mécanique et le calcul réel. |
| 1.7 | Au moins 2 testeurs extérieurs ont été sollicités et leurs retours intégrés. | | *En attente : formulaire Google Forms (https://forms.gle/SrQx1cJVSrnMt7sc9) et protocole (`docs/PROTOCOLE-TESTS.md`) prêts ; passation et corrections prévues en semaine 6.* |

## Partie 2 — Argumentation des choix (25 %)

| # | Critère | Score 0-4 | Justification / preuve |
|:---|:---|:---:|:---|
| 2.1 | `MMI-R507-projet-blockchain-CHOIX-MODELISATION.md` est complet et couvre les 7 notions. | 3 | Fiches détaillées complétées pour les notions 1 à 6 (les gares pour les nœuds, la molette et l'effort mécanique pour le minage, PoW vs PoS) ; notion 7 et bilans de tests à clôturer en semaine 6. |
| 2.2 | Formes et échelles sont justifiées. | 4 | Géométries des wagons vitrés, échelle du réseau de 6 gares et cadrages caméra justifiés dans les sections 2.5, 3 et 4 de `CHOIX-MODELISATION.md`. |
| 2.3 | Couleurs et codes sont cohérents et accessibles. | 4 | Sémantique chromatique constante sur toutes les étapes : vert émeraude (`#10b981`) valide, ambre (`#f59e0b`) modifié/minage, rouge (`#ef4444`) rupture, plus couleur d'anneau dérivée du Hash. |
| 2.4 | Animations et interactions servent la compréhension. | 4 | Synchronisation mécanique `1 essai = 1 cran` à l'étape 5, recul physique du wagon décroché à l'étape 3, contournement de gare éteinte à l'étape 4 et comparaison 3 molettes vs 1 molette à l'étape 6. |
| 2.5 | Une alternative écartée est documentée par notion. | 4 | Chaque fiche de notion dans `CHOIX-MODELISATION.md` comporte une sous-section `e) Alternative écartée` justifiant le rejet des pistes moins pertinentes. |
| 2.6 | Les risques de mauvaise interprétation sont traités. | 4 | Chaque fiche de notion identifie le risque de fausse compréhension en `b)` et les limites assumées en `g)`. |
| 2.7 | Les décisions s'appuient sur les tests utilisateurs. | | *À compléter en semaine 6 après recueil des réponses au formulaire Google Forms et traitement des issues correctives.* |

## Partie 3 — GitHub Projects (20 %)

| # | Critère | Score 0-4 | Justification / preuve |
|:---|:---|:---:|:---|
| 3.1 | Le board existe depuis la semaine 1 et utilise les 5 colonnes communes. | 4 | Board actif depuis la semaine 1 avec les 5 colonnes obligatoires : `Backlog`, `À faire`, `En cours`, `À vérifier`, `Terminé`. |
| 3.2 | Issues granulaires et assignées. | 4 | Issues découpées par étape pédagogique, livrable documentaire, suivi hebdomadaire et phase de test, assignées aux membres du binôme. |
| 3.3 | Labels cohérents. | 4 | Utilisation des labels pour distinguer les fonctionnalités (`enhancement`), la documentation (`documentation`) et les corrections (`bug`). |
| 3.4 | Milestones obligatoires correspondant au calendrier. | 4 | Les jalons officiels du sujet (Cadrage, Livraison du projet, Répétition finale, Soutenance) sont configurés et reliés aux issues. |
| 3.5 | Commits réguliers et liés aux issues. | 4 | Historique Git régulier de la semaine 1 à la semaine 5 avec messages conventionnels sobres sans emoji. |
| 3.6 | Le board reflète l'état réel. | 4 | Board mis à jour en continu : cadrage, déploiement, README, formulaire de test, étapes 1 à 6 et suivis S1-S5 dans `Terminé` ; étape 7 et passation des tests dans `En cours`. |
| 3.7 | Répartition visible et expliquée. | 4 | Répartition documentée dans le `README.md` et dans chacune des fiches `SEMAINE-01.md` à `SEMAINE-05.md`. |
| 3.8 | Retours transformés en issues puis traités. | | *À compléter en semaine 6 lors de la création et de la résolution des issues issues des 2 tests utilisateurs externes.* |
| 3.9 | Usage de l'IA déclaré. | 4 | Déclaration transparente de Gemini et Antigravity dans le `README.md`, dans la section 6 de `CHOIX-MODELISATION.md` et dans les suivis hebdomadaires. |
| 3.10 | README complet. | 4 | `README.md` complet incluant binôme, public cible, tableau des 7 notions, jalons, critères 30 FPS, protocole/lien de test utilisateur, déclaration IA et commandes de build. |

## Partie 4 — Interaction, UX et finition (15 %)

| # | Critère | Score 0-4 | Justification / preuve |
|:---|:---|:---:|:---|
| 4.1 | Navigation intuitive et éléments identifiables. | 4 | Écran d'accueil dédié, volet pédagogique à gauche avec marque-pages numérotés de 0 à 7 et pointeurs SVG reliant les infobulles aux éléments 3D. |
| 4.2 | Textes lisibles et contrastés. | 4 | Contraste élevé sur fond sombre, police monospace pour les Hashs/Nonces et textes concis pour une lecture directe sans surcharge. |
| 4.3 | Rythme des animations compréhensible. | 4 | Animations progressives (propagation Gossip par vagues, rotation crantée de molette, loterie PoS puis validation) calibrées pour l'observation sur les étapes 1 à 6. |
| 4.4 | Au moins 30 FPS sur ordinateur standard type poste de TP. | 4 | Fluidité mesurée entre 55 et 60 FPS constants grâce au partage des `BufferGeometry` et au nettoyage des scènes entre les étapes (indicateur FPS affiché dans le HUD). |
| 4.5 | Aucun bug bloquant le parcours principal. | 3 | Parcours des étapes 0 à 6 stable et vérifié avec `npm run build` ; validation finale du parcours complet à confirmer à la clôture de l'étape 7. |
| 4.6 | Déploiement en ligne réalisé. | 4 | Déploiement continu fonctionnel sur GitHub Pages : https://tuthure.github.io/Projet_ThreeJS_Morin_Chabalier/ |

## Partie 5 — Soutenance (15 %)

| # | Critère | Score 0-4 | Justification / preuve |
|:---|:---|:---:|:---|
| 5.1 | Démo répétée et plan B prévu. | | *À compléter en semaine 6 (capture vidéo de secours et répétition générale).* |
| 5.2 | Chaque membre justifie tous les choix. | | *À valider lors de la préparation de l'oral en semaine 6.* |
| 5.3 | Chaque membre explique les 7 notions. | | *À valider lors de la répétition finale.* |
| 5.4 | Bilan du projet appuyé sur des preuves. | | *À compléter avec les métriques finales et les retours des 2 testeurs.* |
| 5.5 | Temps de parole réparti dans les 20 minutes imparties. | | *À chronométrer lors de la répétition.* |
| 5.6 | Support dans le temps imparti. | | *Support de soutenance à finaliser en semaine 6.* |

## Estimation de votre note

Additionnez les scores obtenus dans chaque partie : P1 / 28, P2 / 28, P3 / 40, P4 / 24, P5 / 24. La note sur 20 est :

Note / 20 = (P1/28 * 5) + (P2/28 * 5) + (P3/40 * 4) + (P4/24 * 3) + (P5/24 * 3).

Note = *À calculer en semaine 6 une fois l'étape 7, les tests utilisateurs et la préparation de soutenance achevés.*

## Bilan individuel et actions

| Nom / prénom | Contribution, apprentissages, usage de l'IA, difficulté pour la soutenance |
|:---|:---|
| Arthur Morin | Architecture technique Three.js, modélisation procédurale 3D (locomotive, wagons vitrés, archipel de 6 gares, aiguillage en Y), raycasting 3D, animations des étapes 0 à 7 et intégration Vite. |
| Alban Chabalier | Gestion de projet (GitHub Projects, suivis hebdomadaires S1 à S5), conception UX/UI, scénarisation pédagogique, rédaction de `CHOIX-MODELISATION.md` et du `README.md`, création du formulaire Google Forms et du protocole de tests utilisateurs. |

| Les 3 actions prioritaires pour la semaine 6 | Responsable | Échéance |
|:---|:---|:---|
| Finaliser l'étape 7 (scénario d'attaque des 51 % et règle de la chaîne la plus longue) | Arthur Morin | Début Semaine 6 |
| Faire passer les tests utilisateurs à 2 personnes extérieures via le protocole et le Google Forms | Alban Chabalier & Arthur Morin | Semaine 6 |
| Intégrer les corrections UI/UX issues des tests, clôturer la grille d'auto-évaluation et préparer la soutenance | Alban Chabalier & Arthur Morin | Avant le 15/11/2026 |
