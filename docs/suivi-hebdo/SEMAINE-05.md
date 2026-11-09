# BUT MMI 3e année — R507

## Projet Three.js — Visualisation pédagogique de la blockchain

### Fiche de suivi hebdomadaire — Semaine 05

## 0. Informations générales

| Champ | Contenu |
|:---|:---|
| Groupe | Binôme Arthur Morin (@tuthure) & Alban Chabalier (@achabalier14) |
| Projet | Visualisation pédagogique de la blockchain avec Three.js (Le Convoi Ferroviaire Blindé) |
| Semaine | 05 |
| Dates couvertes | Du 31 octobre au 6 novembre 2026 |
| Membres présents | Arthur Morin, Alban Chabalier |
| Lien dépôt / GitHub Projects | https://github.com/tuthure/Projet_ThreeJS_Morin_Chabalier / https://github.com/tuthure/Projet_ThreeJS_Morin_Chabalier/projects |
| Lien démo en ligne | https://tuthure.github.io/Projet_ThreeJS_Morin_Chabalier/ |

## 1. Avancement

**Objectifs prévus pour la semaine :**
- Développer et intégrer les interactions 3D complètes des étapes 3 (Immutabilité et falsification), 4 (Réseau décentralisé de gares), 5 (Validation et minage sur la molette du Nonce) et 6 (Comparaison PoW vs PoS).
- Concevoir et valider le protocole ainsi que le formulaire de test utilisateur sur Google Forms.
- Engager le développement et la mise en scène 3D de l'étape 7 (Attaque et double dépense).
- Mettre à jour la documentation officielle (`README.md`, `CHOIX-MODELISATION.md`, `GRILLE-AUTOEVAL.md`) et le tableau GitHub Projects.

### 1.1 Réalisé
| Issue / tâche | Notion concernée | Statut | Preuve |
|:---|:---|:---|:---|
| Développement et intégration interactive de l'Étape 3 (altération du chargement, recalcul du Hash et décrochage de l'attelage avec infobulles SVG) | Notion 3 — Immutabilité et détection de falsification | Fonctionnel | Module `src/steps/step3.js` opérationnel avec traits SVG reliés aux éléments 3D |
| Développement de l'Étape 4 : archipel ferroviaire de 6 gares, propagation pair-à-pair Gossip et simulation de panne de nœud au clic 3D | Notion 4 — Réseau et décentralisation | Fonctionnel | Module `src/steps/step4.js` permettant d'éteindre une gare et d'observer le contournement automatique |
| Développement de l'Étape 5 : wagon candidat à distance, clic direct sur la molette 3D du Nonce (1 essai = 1 cran) et choix de difficulté (1 à 3 zéros) | Notion 5 — Validation et minage | Fonctionnel | Module `src/steps/step5.js` avec verrouillage mécanique de l'attelage dès que le Hash commence par les zéros requis |
| Développement de l'Étape 6 : comparaison symétrique PoW (course simultanée des 3 molettes) vs PoS (loterie pondérée par la caution puis 1 seule molette active) | Notion 6 — Comparaison de mécanismes de consensus | Fonctionnel | Module `src/steps/step6.js` illustrant la différence de dépense énergétique sur les 3 gares |
| Début de la finalisation de l'Étape 7 : aiguillage en Y après le Wagon #1 et course d'assemblage entre gares honnêtes et branche pirate | Notion 7 — Cycle de vie et scénario d'attaque | En cours | Module `src/steps/step7.js` en cours de finalisation par Arthur |
| Création et validation du formulaire de test utilisateur via Google Forms et rédaction du protocole de passation | Tests utilisateurs / UX | Fonctionnel | Formulaire en ligne (https://forms.gle/SrQx1cJVSrnMt7sc9) et fichier `docs/PROTOCOLE-TESTS.md` |
| Mise à jour du `README.md`, de `CHOIX-MODELISATION.md` (notions 3 à 6) et pré-remplissage de `GRILLE-AUTOEVAL.md` | Documentation officielle | Fonctionnel | Fichiers mis à jour dans le dépôt sur la branche `main` |

### 1.2 Prévu mais non réalisé
| Tâche | Cause | Report |
|:---|:---|:---|
| Passation effective des tests auprès des 2 utilisateurs externes | Priorité donnée à la finalisation complète des interactions 3D des étapes 3 à 6 et à la création du formulaire Google Forms pour tester un parcours quasi complet | Passation programmée en début de semaine 6 avec intégration immédiate des retours |

### 1.3 État des 7 notions

| Notion obligatoire | État | Remarque / preuve |
|:---|:---|:---|
| Structure d'un bloc | Testé | Inspection anatomique du wagon en 4 composants avec infobulles SVG et recalcul déterministe SHA-256 dans `src/steps/step1.js` |
| Chaînage cryptographique | Testé | Vue panoramique des liaisons magnétiques, correspondance des couleurs de Hash et ajout interactif de wagons dans `src/steps/step2.js` |
| Immutabilité et détection de falsification | Fonctionnel | Modification de la cargaison du Wagon #1, changement immédiat du Hash et rupture physique de l'attelage avec le Wagon #2 dans `src/steps/step3.js` |
| Réseau et décentralisation | Fonctionnel | Réseau de 6 gares autonomes, propagation de proche en proche, contournement de gare en panne et rejet de tricherie locale dans `src/steps/step4.js` |
| Validation et minage | Fonctionnel | Recherche de Nonce par rotation de molette (manuelle en 3D ou automatique) sous contrainte de 1 à 3 zéros avant attelage dans `src/steps/step5.js` |
| Comparaison d'au moins deux mécanismes de consensus | Fonctionnel | Confrontation visuelle sur 3 gares entre la course énergivore des 3 molettes (PoW) et le tirage sur caution à molette unique (PoS) dans `src/steps/step6.js` |
| Cycle de vie d'une transaction et scénario d'attaque illustré | En cours | Aiguillage symétrique en Y et course de minage entre chaîne honnête et chaîne pirate (cas 20 % vs 51 %) en cours de finalisation dans `src/steps/step7.js` |

**Définitions des états :**

- `En cours` = une partie est implémentée mais incomplète ou non vérifiée ;
- `Fonctionnel` = le parcours prévu fonctionne localement au moins une fois ;
- `Testé` = il a été vérifié par au moins un test documenté (et, pour les tests externes, par une personne extérieure au groupe).
- `Non commencé` et `Bloqué` peuvent aussi être utilisés.

## 2. Répartition du travail

| Membre | Tâches / issues | Issues traitées | Commits |
|:---|:---|:---:|:---:|
| Arthur Morin | Développement et intégration 3D des étapes 3, 4, 5 et 6 (géométries des gares, aiguillages, raycasting sur la molette et les gares, animations de course PoW/PoS, connecteurs SVG). Début de la finalisation de l'étape 7 (aiguillage en Y et course d'assemblage). | #9, #10, #11, #12, #13 | Commits sur `step3.js`, `step4.js`, `step5.js`, `step6.js`, `step7.js` et `style.css` |
| Alban Chabalier | Conception et validation du formulaire Google Forms et du protocole de test utilisateur (`docs/PROTOCOLE-TESTS.md`). Refonte professionnelle du `README.md`, complétion des justifications des notions 3 à 6 dans `CHOIX-MODELISATION.md`, pré-remplissage de `GRILLE-AUTOEVAL.md` et mise à jour du Kanban GitHub Projects. | #9, #10, #11, #12, #17, #20, #21, #22 | Commits documentaires sur `README.md`, `PROTOCOLE-TESTS.md`, `CHOIX-MODELISATION.md`, `GRILLE-AUTOEVAL.md` et `SEMAINE-05.md` |

## 3. GitHub Projects

| Question | Réponse |
|:---|:---|
| Issues créées | Issues de suivi et de découpage pour la création du formulaire de test, le développement des étapes 3-4, 5-6, l'étape 7 et la fiche Semaine 5 |
| Issues fermées | Clôture des issues relatives aux étapes 3, 4, 5 et 6, au README, à la création du formulaire de test et au suivi hebdomadaire Semaine 5 |
| Nombre dans `Backlog` / `À faire` / `En cours` / `À vérifier` / `Terminé` | Répartition actualisée sur le board : Cadrage, Déploiement, README, Étapes 1 à 6, Formulaire de test et Fiches S1-S5 dans `Terminé` ; Étape 7 et Passation des tests utilisateurs dans `En cours` ; Corrections post-tests, Auto-évaluation finale, Répétition et Soutenance dans `À faire` / `Backlog` |
| Board mis à jour pendant la semaine ? | Oui, synchronisé via GitHub CLI (`gh`) pour refléter la livraison des étapes 3 à 6 et le lancement de la phase de tests |
| Milestone concerné et état | Jalon "Livraison du projet" (échéance 15/11/2026) : 6 notions sur 7 fonctionnelles, 7e notion en cours de finition |

## 4. Choix de modélisation

| Question | Réponse |
|:---|:---|
| Fiches de `MMI-R507-projet-blockchain-CHOIX-MODELISATION.md` complétées | Les fiches des notions 3, 4, 5 et 6 ont été intégralement complétées et alignées sur les interactions finales codées cette semaine. |
| Choix important et justification | **Gares autonomes pour les nœuds (Étape 4) :** Représenter les nœuds par 6 gares réparties en archipel, chacune dotée de son mini-train de registre, rend immédiatement lisible l'absence de gare centrale et la tolérance aux pannes lorsqu'on éteint une gare au clic. |
| Choix important et justification | **Course des 3 molettes (PoW) face au tirage sur caution (PoS) à l'Étape 6 :** Utiliser les 3 mêmes gares dans les deux modes permet une comparaison directe : 3 molettes qui tournent en même temps (dont 2 en pure perte) en PoW, contre un tirage au sort pondéré qui n'active qu'une seule molette en PoS. |
| Choix remis en question | **Retrait du carillon audio Web Audio et des étincelles superflues :** Lors du développement des étapes 4 et 5, les effets sonores et particules d'étincelles alourdissaient la scène et détournaient l'attention du mécanisme cryptographique. Ils ont été retirés pour conserver une esthétique sobre et lisible. |

## 5. Tests utilisateurs

| Question | Réponse |
|:---|:---|
| Nombre de testeurs extérieurs cette semaine | 0 (formulaire Google Forms et protocole finalisés cette semaine ; passation programmée en début de semaine 6) |
| Compréhension ou problème observé | Les revues internes ont montré que les traits des infobulles 3D devaient pointer avec exactitude sur les plaques et anneaux sans masquer le numéro du Nonce, ce qui a été corrigé dans les étapes 2, 3 et 5. |
| Issue corrective | Issue dédiée à la passation des tests utilisateurs en cours (#17) et issue prévue pour l'intégration des corrections UI/UX issues des retours (#18). |

## 6. IA, difficultés et besoins

| Question | Réponse |
|:---|:---|
| Usage de l'IA et vérifications effectuées | Outils déclarés : Gemini et Antigravity. Utilisés pour l'aide à la structuration des scènes Three.js (projection 2D/3D des connecteurs SVG, synchronisation des états d'animation des étapes 4 à 7) et la mise en forme Markdown de la documentation. Chaque fichier a été relu, testé dans le navigateur et validé par le binôme. |
| Blocage technique | Synchronisation mécanique entre les essais de hachage et l'angle de rotation de la molette 3D à l'étape 5, ainsi que le positionnement dynamique des pointeurs SVG lors des mouvements de caméra. Résolu par un calcul de projection vectorielle à chaque frame et un incrément angulaire strict de 45 degrés par essai. |
| Blocage pédagogique ou organisationnel | Aucun blocage. L'avancement technique permet d'aborder la dernière ligne droite avec les 6 premières notions opérationnelles. |
| Besoin d'un point enseignant | Pas de besoin urgent ; validation des derniers détails de l'étape 7 avant les tests externes. |

## 7. Objectifs de la semaine suivante

| Objectif | Responsable | Issue |
|:---|:---|:---|
| Terminer l'étape 7 (scénario d'attaque des 51 % et règle de la chaîne la plus longue) | Arthur Morin | #13 |
| Faire passer les tests utilisateurs à 2 personnes extérieures au groupe avec le formulaire Google Forms | Alban Chabalier & Arthur Morin | #17 |
| Intégrer les retours des testeurs (corrections UI/UX), finaliser la grille d'auto-évaluation et préparer le support d'oral | Alban Chabalier & Arthur Morin | #18, #20, #22, #23 |

## 8. Signaux d'alerte

- [ ] Le board n'a été mis à jour qu'aujourd'hui.
- [ ] La répartition est fortement déséquilibrée et non expliquée.
- [x] Nous n'avons pas encore atteint les 2 testeurs extérieurs requis (le formulaire https://forms.gle/SrQx1cJVSrnMt7sc9 et le protocole sont prêts, passation dès le début de la semaine 6).
- [ ] Un choix de modélisation important n'est pas justifié.
- [ ] Une notion n'a pas avancé depuis 2 semaines.

**Règle vérifiable d'absence d'avancement depuis 2 semaines :** cocher cette case si, entre les deux dernières fiches hebdomadaires successives, aucune évolution visible n'est constatée pour la notion concernée dans le code, l'interface, `CHOIX-MODELISATION.md`, les issues ou les tests.
Nommer la notion et la preuve vérifiée : Aucune notion en stagnation ; les notions 3, 4, 5 et 6 sont passées à l'état fonctionnel et la notion 7 est en cours de finalisation active.

## 9. Validation

| Élément | Réponse |
|:---|:---|
| Fiche relue par tous | Oui |
| Date d'envoi | 06/11/2026 |
| Noms des membres | Arthur Morin, Alban Chabalier |
