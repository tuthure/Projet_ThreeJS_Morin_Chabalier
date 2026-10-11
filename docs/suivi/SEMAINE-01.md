# BUT MMI 3e année - R507

## Projet Three.js - Visualisation pédagogique de la blockchain

### Fiche de suivi - Semaine 1

## 0. Informations générales

| Champ | Contenu |
|:---|:---|
| Groupe | Arthur Morin (@tuthure), Alban Chabalier (@albanchab14) |
| Semaine | 1 |
| Dates couvertes | 1er octobre au 9 octobre 2026 |
| Membres présents | Arthur Morin, Alban Chabalier |
| Lien dépôt / GitHub Projects | https://github.com/tuthure/Projet_ThreeJS_Morin_Chabalier / https://github.com/tuthure/Projet_ThreeJS_Morin_Chabalier/projects |
| Lien démo (si disponible) | https://tuthure.github.io/Projet_ThreeJS_Morin_Chabalier/ |

## 1. Avancement

### 1.1 Réalisé
| Issue / tâche | Notion concernée | Statut | Preuve |
|:---|:---|:---|:---|
| Cadrage général, constitution du groupe et création du dépôt | Toutes | Fonctionnel | Dépôt GitHub initialisé avec README.md de cadrage |
| Création des dossiers et des livrables de documentation | Méthodologie | Fonctionnel | Fichiers CHOIX-MODELISATION.md, GRILLE-AUTOEVAL.md et SEMAINE-01.md dans docs/ |
| Création des 4 jalons officiels du calendrier | Méthodologie | Fonctionnel | Milestones créés sur GitHub (9 oct, 15 nov, 19 nov x2) |
| Rédaction et assignation des 5 premières issues | Toutes | Fonctionnel | Issues #1 à #5 créées, assignées et rattachées au Jalon 1 |
| Choix de la métaphore visuelle (cubes modulaires 3D) | Notions 1 à 7 | Fonctionnel | Section 2 de CHOIX-MODELISATION.md rédigée |

### 1.2 Prévu mais non réalisé
| Tâche | Cause | Report |
|:---|:---|:---|
| Aucune | Tous les éléments attendus pour le jalon du 9 octobre sont prêts | N/A |

### 1.3 État des 7 notions

| Notion obligatoire | État | Remarque / preuve |
|:---|:---|:---|
| 1. Structure d'un bloc | En cours | Spécifié dans CHOIX-MODELISATION.md (cube avec données, hash et nonce) |
| 2. Chaînage cryptographique | En cours | Métaphore des connecteurs reliant chaque bloc au parent validée |
| 3. Immutabilité et détection de falsification | En cours | Principe du passage au rouge et rupture de lien documenté |
| 4. Réseau et décentralisation | En cours | Disposition circulaire de 4 nœuds pairs définie |
| 5. Validation et minage | En cours | Principe de la recherche du nonce par compteur documenté |
| 6. Comparaison d'au moins deux mécanismes de consensus | En cours | Comparaison PoW vs PoS prévue dans le scénario |
| 7. Cycle de vie d'une transaction et scénario d'attaque illustré | En cours | Parcours d'une transaction et double dépense rejetée cadré |

Définitions des états :
- Non commencé = réflexion initiale non entamée
- En cours = spécifié ou en cours d'implémentation
- Fonctionnel = fonctionne au moins une fois
- Testé = vérifié par un test documenté

## 2. Répartition du travail

| Membre | Tâches / issues | Issues traitées | Commits |
|:---|:---|:---:|:---:|
| Arthur Morin | Cadrage technique Three.js, structure de scène, métaphores 3D | #1, #3 | Init & structure 3D |
| Alban Chabalier | Gestion de projet, Milestones, issues, README et documentation | #2, #4, #5 | Docs & suivi |

## 3. GitHub Projects

| Question | Réponse |
|:---|:---|
| Issues créées | 5 issues initiales créées sur le dépôt |
| Issues fermées | 0 (sprint de développement qui débute en semaine 2) |
| Nombre dans Backlog / À faire / En cours / À vérifier / Terminé | Réparties entre Backlog et À faire |
| Board mis à jour pendant la semaine ? | Oui, initialisé pour le jalon du 9 octobre |
| Milestone concerné et état | "Cadrage, groupes, dépôt et GitHub Projects créés" (9 octobre 2026) - Atteint |

## 4. Choix de modélisation

| Question | Réponse |
|:---|:---|
| Fiches de MMI-R507-projet-blockchain-CHOIX-MODELISATION.md complétées | Sections 1 à 7 complétées pour poser le cadre initial. |
| Choix important et justification | Choix de cubes simples avec connecteurs lumineux : très lisible, facile à comprendre et léger en calcul. |
| Choix remis en question | Abandon de la métaphore du train avec wagons, trop rigide pour représenter le réseau multi-nœuds. |

## 5. Tests utilisateurs

| Question | Réponse |
|:---|:---|
| Nombre de testeurs extérieurs cette semaine | 0 (phase de cadrage initiale) |
| Compréhension ou problème observé | N/A |
| Issue corrective | Prévue pour les phases de prototype (semaines 3 à 5) |

## 6. IA, difficultés et besoins

| Question | Réponse |
|:---|:---|
| Usage de l'IA et vérifications effectuées | Aide pour générer les trames des fiches markdown. Contenus relus, vérifiés et adaptés par le groupe. |
| Blocage technique | Aucun. |
| Blocage pédagogique ou organisationnel | Aucun, le binôme est bien calé sur la répartition. |
| Besoin d'un point enseignant | Aucun pour le moment. |

## 7. Objectifs de la semaine suivante

| Objectif | Responsable | Issue |
|:---|:---|:---|
| Initialiser l'application Three.js avec Vite | Arthur Morin | #1 |
| Rédiger le storyboard détaillé reliant les 7 notions | Alban Chabalier | #2 |
| Mettre en place la caméra et les premiers contrôles | Binôme | #4 |

## 8. Signaux d'alerte

- [ ] Le board n'a été mis à jour qu'aujourd'hui.
- [ ] La répartition est fortement déséquilibrée et non expliquée.
- [ ] Nous n'avons pas encore atteint les 2 testeurs extérieurs requis (normal en semaine 1).
- [ ] Un choix de modélisation important n'est pas justifié.
- [ ] Une notion n'a pas avancé depuis 2 semaines.

## 9. Validation

| Élément | Réponse |
|:---|:---|
| Fiche relue par tous | Oui |
| Date d'envoi | 9 octobre 2026 |
| Noms des membres | Arthur Morin, Alban Chabalier |
