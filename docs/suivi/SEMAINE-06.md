# BUT MMI 3e année — R507

## Projet Three.js — Visualisation pédagogique de la blockchain

### Fiche de suivi hebdomadaire — Semaine 06

## 0. Informations générales

| Champ | Contenu |
|:---|:---|
| Groupe | Binôme Arthur Morin (@tuthure) & Alban Chabalier (@achabalier14) |
| Projet | Visualisation pédagogique de la blockchain avec Three.js (Le Convoi Ferroviaire Blindé) |
| Semaine | 06 (Clôture) |
| Dates couvertes | Du 7 au 15 novembre 2026 |
| Membres présents | Arthur Morin, Alban Chabalier |
| Lien dépôt / GitHub Projects | https://github.com/tuthure/Projet_ThreeJS_Morin_Chabalier / https://github.com/tuthure/Projet_ThreeJS_Morin_Chabalier/projects |
| Lien démo en ligne | https://tuthure.github.io/Projet_ThreeJS_Morin_Chabalier/ |

## 1. Avancement

**Objectifs prévus pour la semaine :**
- Finaliser les animations des étapes 4 et 6 (isolation du plateau de gares, chargement des quais et chorégraphie complète PoW / PoS) ainsi que l'étape 7 (attaque des 51 %).
- Mener les deux vagues de tests utilisateurs externes (Phase 1 avec 4 testeurs et Phase 2 avec 2 testeurs) puis intégrer les retours, dont l'ajout d'une étape 8 d'outro comparative.
- Rédiger `docs/CADRAGE.md`, finaliser `docs/MMI-R507-projet-blockchain-CHOIX-MODELISATION.md` et réajuster de façon réaliste `docs/MMI-R507-projet-blockchain-GRILLE-AUTOEVAL.md`.
- Boucler le tableau Kanban GitHub Projects et vérifier le déploiement en ligne sur GitHub Pages à plus de 60 FPS avant la soutenance du 19 novembre 2026.

### 1.1 Réalisé
| Issue / tâche | Notion concernée | Statut | Preuve |
|:---|:---|:---|:---|
| Finalisation de l'Étape 4 : suppression du train parasite au centre du réseau et restauration de la topologie des 6 gares | Notion 4 — Réseau et décentralisation | Testé | Module `src/steps/step4.js` validé par les 6 testeurs (100 % de réussite sur la décentralisation en Phase 2) |
| Finalisation des animations de l'Étape 6 : chargement des caisses sur les quais, course PoW avec verdict vert/rouge et tirage PoS avec zoom sur la gare élue | Notion 6 — Comparaison de mécanismes de consensus | Testé | Module `src/steps/step6.js` et `src/cameraController.js`, nettoyage strict dans `exit()` |
| Finalisation de l'Étape 7 : aiguillage en Y et simulation d'attaque des 51 % (scénarios 20 % vs 80 % et 60 % vs 40 %) | Notion 7 — Cycle de vie et scénario d'attaque | Testé | Module `src/steps/step7.js` clôturé sur `#13` et jugé marquant lors des tests utilisateurs |
| Création de l'Étape 8 d'outro comparative entre le convoi ferroviaire et la blockchain / cryptomonnaie | Ouverture et synthèse pédagogique | Testé | Module `src/steps/step8.js` avec scène 3D comparative côte à côte et étiquettes projetées |
| Passation des 2 phases de tests utilisateurs externes (4 testeurs en Phase 1, 2 testeurs en Phase 2) et intégration des correctifs | Tests utilisateurs / UX | Testé | Résultats anonymisés et synthèse complète dans `docs/PROTOCOLE-TESTS.md` |
| Rédaction de `CADRAGE.md`, finalisation de `CHOIX-MODELISATION.md`, réajustement réaliste de `GRILLE-AUTOEVAL.md` et réorganisation de `docs/suivi/` | Documentation officielle | Testé | Livraison complète sur la branche `main` et note provisoire ajustée à 15,48 / 20 |
| Vérification des performances (> 60 FPS) et du déploiement continu sur GitHub Pages | Qualité logicielle et déploiement | Testé | Build Vite (`npm run build`) sans erreur et site actif sur GitHub Pages |

### 1.2 Prévu mais non réalisé
| Tâche | Cause | Report |
|:---|:---|:---|
| Répétition générale chronométrée en binôme (`#25`) | Créneau officiel fixé par le calendrier pédagogique au matin de la soutenance | Programmée le jeudi 19 novembre 2026 à 9h30 avant le passage devant le jury (11h00) |

### 1.3 État des 7 notions

| Notion obligatoire | État | Remarque / preuve |
|:---|:---|:---|
| Structure d'un bloc | Testé | Wagon blindé vitré et 4 infobulles reliées en SVG (`src/steps/step1.js`), vérifié par 6 testeurs externes |
| Chaînage cryptographique | Testé | Attelage par concordance de couleurs SHA-256 et ajout de wagons (`src/steps/step2.js`) |
| Immutabilité et détection de falsification | Testé | Altération du Wagon #1, recalcul du Hash et décrochage mécanique en chaîne (`src/steps/step3.js`) |
| Réseau et décentralisation | Testé | Plateau isolé de 6 gares autonomes sans serveur central et contournement de panne (`src/steps/step4.js`) |
| Validation et minage | Testé | Rotation crantée de la molette Nonce sur le wagon candidat avec choix de difficulté 1 à 3 zéros (`src/steps/step5.js`) |
| Comparaison d'au moins deux mécanismes de consensus | Testé | Chargement de caisses sur les quais et comparaison PoW (course) vs PoS (loterie + zoom) dans `src/steps/step6.js` |
| Cycle de vie d'une transaction et scénario d'attaque illustré | Testé | Aiguillage en Y et course de minage entre chaîne honnête et branche pirate (`src/steps/step7.js`), complété par l'outro crypto (`src/steps/step8.js`) |

**Définitions des états :**

- `En cours` = une partie est implémentée mais incomplète ou non vérifiée ;
- `Fonctionnel` = le parcours prévu fonctionne localement au moins une fois ;
- `Testé` = il a été vérifié par au moins un test documenté (et, pour les tests externes, par une personne extérieure au groupe).
- `Non commencé` et `Bloqué` peuvent aussi être utilisés.

## 2. Répartition du travail

| Membre | Tâches / issues | Issues traitées | Commits |
|:---|:---|:---:|:---:|
| Arthur Morin | Finalisation des scènes 3D des étapes 4, 6 et 7 (nettoyage de l'étape 4, animations de quais et transitions PoW/PoS, aiguillage de l'étape 7) et vérification du maintien au-dessus de 60 FPS. | #13, #18, #19, #24 | Commits sur `step4.js`, `step6.js`, `step7.js`, `step8.js` et `cameraController.js` |
| Alban Chabalier | Analyse des deux vagues de tests utilisateurs (`PROTOCOLE-TESTS.md`), intégration de l'étape 8 complète suite à la réponse de l'utilisateur 2.2, rédaction de `CADRAGE.md`, finalisation de `CHOIX-MODELISATION.md`, réajustement de `GRILLE-AUTOEVAL.md`, clôture du Kanban et fiche `SEMAINE-06.md`. | #17, #18, #20, #21, #22, #23 | Commits sur `PROTOCOLE-TESTS.md`, `CADRAGE.md`, `CHOIX-MODELISATION.md`, `GRILLE-AUTOEVAL.md`, `SEMAINE-06.md` et `README.md` |

## 3. GitHub Projects

| Question | Réponse |
|:---|:---|
| Issues créées | Complétion finale des tâches de clôture documentaire et de correctifs post-tests (`Testeur 2.1` et `Testeur 2.2`) |
| Issues fermées | Clôture de l'ensemble des issues de développement (#13 Notion 7), de tests (#17, #18), de modélisation (#20), d'auto-évaluation (#22), de support (#23) et de vidéo Plan B (#24) : 29 issues sur 30 sont fermées |
| Nombre dans `Backlog` / `À faire` / `En cours` / `À vérifier` / `Terminé` | `Backlog` : 0 / `À faire` : 1 (uniquement `#25 Répétition générale de la soutenance`) / `En cours` : 0 / `À vérifier` : 0 / `Terminé` : 29 |
| Board mis à jour pendant la semaine ? | Oui, synchronisé à l'issue de chaque lot de correctifs et vérifié à la clôture du jalon du 15 novembre |
| Milestone concerné et état | Jalon "Livraison du projet" (15/11/2026) terminé ; jalon "Soutenance" (19/11/2026) prêt avec seule la répétition générale (#25) restante |

## 4. Choix de modélisation

| Question | Réponse |
|:---|:---|
| Fiches de `MMI-R507-projet-blockchain-CHOIX-MODELISATION.md` complétées | Toutes les fiches (notions 1 à 7) sont finalisées avec correspondances techniques, alternatives écartées et limites pédagogiques assumées. |
| Choix important et justification | **Scène comparative train vs blockchain / cryptomonnaie (Étape 8) :** suite au retour du Testeur 2.2, mise en regard directe d'un wagon et d'une gare avec un bloc numérique translucide contenant des jetons et un réseau de nœuds serveurs, reliés par des faisceaux et des étiquettes d'équivalence (`Wagon = Bloc numérique`, `Caisses = Transactions`, `Attelage SHA-256 = Chaînage`, `Gares = Nœuds`). |
| Choix important et justification | **Réglage temporel et cadrage de l'Étape 6 :** maintien visible de la gare gagnante en vert et des perdantes en rouge avant leur fondu puis l'attelage, afin que l'utilisateur identifie clairement le vainqueur sans chevauchement de caméra. |
| Choix remis en question | **Suppression du train en mouvement en arrière-plan à l'Étape 4 et du vocabulaire ferroviaire ambigu dans l'outro :** isolement complet du plateau de 6 gares à l'étape 4 pour éviter toute confusion visuelle, et remplacement du terme « fret » dans l'étape 8 par « caisses de marchandises » face aux « transactions numériques ». |

## 5. Tests utilisateurs

| Question | Réponse |
|:---|:---|
| Nombre de testeurs extérieurs cette semaine | 6 testeurs externes au total sur la campagne : 4 en Phase 1 (`Testeur 1` à `Testeur 4`, moyenne de compréhension 4,25 / 5) puis 2 en Phase 2 après correctifs (`Testeur 2.1` et `Testeur 2.2`, 100 % de réussite aux questions techniques et 4,5 / 5 de compréhension). |
| Compréhension ou problème observé | En Phase 1, 2 testeurs avaient encore associé le stockage à un serveur central et l'intérieur des wagons paraissait chargé ; en Phase 2, `Testeur 2.1` a signalé la remontée du scroll sur le panneau gauche et `Testeur 2.2` a suggéré une outro reliant concrètement le train aux cryptomonnaies. |
| Issue corrective | Tous les retours ont été traités et validés sur les issues `#17` et `#18` : conservation de position du scroll gauche, explicitation de l'absence de serveur central, rééquilibrage des temps d'observation PoW/PoS et création de l'étape 8 comparative. |

## 6. IA, difficultés et besoins

| Question | Réponse |
|:---|:---|
| Usage de l'IA et vérifications effectuées | Outils déclarés : Gemini et Antigravity. Utilisés en appui sur le séquençage asynchrone de l'étape 6, la mise en scène 3D comparative de l'étape 8 et la structuration des livrables Markdown (`CADRAGE.md`, `PROTOCOLE-TESTS.md`, `SEMAINE-06.md`). Chaque modification a été vérifiée par `npm run build`, testée visuellement dans le navigateur et relue ligne par ligne par le binôme. |
| Blocage technique | Conflits résiduels d'objets 3D et de transitions caméra lors des changements rapides d'étape entre les étapes 4, 6 et 7. Résolus par un nettoyage systématique des groupes temporaires et l'annulation des transitions dans `exit()`. |
| Blocage pédagogique ou organisationnel | Aucun blocage. Le projet est terminé, fluide (> 60 FPS en condition standard) et déployé en ligne sur GitHub Pages. |
| Besoin d'un point enseignant | Aucun blocage avant la répétition générale et la soutenance du 19 novembre 2026. |

## 7. Objectifs de la semaine suivante

| Objectif | Responsable | Issue |
|:---|:---|:---|
| Effectuer la répétition générale chronométrée (20 min avec démo live et vérification du Plan B) le 19 novembre 2026 à 9h30 | Arthur Morin & Alban Chabalier | #25 |
| Assurer la soutenance finale devant le jury le 19 novembre 2026 à 11h00 | Arthur Morin & Alban Chabalier | — |
| Finaliser la colonne Partie 5 de la grille d'auto-évaluation après le passage oral | Alban Chabalier & Arthur Morin | #22 |

## 8. Signaux d'alerte

- [ ] Le board n'a été mis à jour qu'aujourd'hui.
- [ ] La répartition est fortement déséquilibrée et non expliquée.
- [ ] Nous n'avons pas encore atteint les 2 testeurs extérieurs requis.
- [ ] Un choix de modélisation important n'est pas justifié.
- [ ] Une notion n'a pas avancé depuis 2 semaines.

**Règle vérifiable d'absence d'avancement depuis 2 semaines :** cocher cette case si, entre les deux dernières fiches hebdomadaires successives, aucune évolution visible n'est constatée pour la notion concernée dans le code, l'interface, `CHOIX-MODELISATION.md`, les issues ou les tests.
Nommer la notion et la preuve vérifiée : Aucune notion en stagnation ; l'ensemble des 7 notions obligatoires et l'étape 8 d'outro sont à l'état `Testé`, avec build Vite valide et déploiement GitHub Pages opérationnel.

## 9. Validation

| Élément | Réponse |
|:---|:---|
| Fiche relue par tous | Oui |
| Date d'envoi | 15/11/2026 |
| Noms des membres | Arthur Morin, Alban Chabalier |
