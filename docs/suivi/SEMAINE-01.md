# BUT MMI 3e année — R507

## Projet Three.js — Visualisation pédagogique de la blockchain

### Fiche de suivi — Semaine 1

---

## 0. Informations générales

| Champ | Contenu |
|:---|:---|
| Groupe | Arthur Morin ([@tuthure](https://github.com/tuthure)), Alban Chabalier ([@albanchab14](https://github.com/albanchab14)) |
| Semaine | 1 |
| Dates couvertes | 1er octobre au 9 octobre 2026 |
| Membres présents | Arthur Morin, Alban Chabalier |
| Lien dépôt / GitHub Projects | https://github.com/tuthure/Projet_ThreeJS_Morin_Chabalier / https://github.com/users/tuthure/projects/ |
| Lien démo (si disponible) | https://tuthure.github.io/Projet_ThreeJS_Morin_Chabalier/ |

---

## 1. Avancement

### 1.1 Réalisé
| Issue / tâche | Notion concernée | Statut | Preuve |
|:---|:---|:---|:---|
| Cadrage global, constitution du binôme et dépôt Git | Toutes | Fonctionnel | Dépôt `Projet_ThreeJS_Morin_Chabalier` et `README.md` initialisés |
| Création de l'architecture documentaire (`docs/`, livrables) | Méthodologie | Fonctionnel | Fichiers `CHOIX-MODELISATION.md`, `GRILLE-AUTOEVAL.md` et `SEMAINE-01.md` créés |
| Initialisation du GitHub Project avec les 5 colonnes obligatoires | Méthodologie | Fonctionnel | Board Kanban configuré (Backlog, À faire, En cours, À vérifier, Terminé) |
| Définition des 4 Milestones officiels du calendrier | Méthodologie | Fonctionnel | Jalons créés sur GitHub (9 oct, 15 nov, 19 nov x2) |
| Rédaction et assignation des premières issues granulaires | Toutes | Fonctionnel | Au moins 5 issues créées, assignées et rattachées au Jalon 1 |
| Cadrage du fil rouge narratif et choix de métaphore visuelle | Notions 1 à 7 | Fonctionnel | Section 2 de `MMI-R507-projet-blockchain-CHOIX-MODELISATION.md` renseignée |

### 1.2 Prévu mais non réalisé
| Tâche | Cause | Report |
|:---|:---|:---|
| Aucune | Tous les livrables attendus pour le 1er jalon du 9 octobre sont complétés | N/A |

### 1.3 État des 7 notions

| Notion obligatoire | État | Remarque / preuve |
|:---|:---|:---|
| 1. Structure d'un bloc | Cadré / En cours | Spécifié dans `CHOIX-MODELISATION.md` (cube cristallin avec métadonnées) |
| 2. Chaînage cryptographique | Cadré / En cours | Métaphore des faisceaux lumineux liant le hash au bloc parent validée |
| 3. Immutabilité et détection de falsification | Cadré / En cours | Principe du basculement chromatique (rouge alerte) et rupture de faisceau documenté |
| 4. Réseau et décentralisation | Cadré / En cours | Topologie circulaire multi-nœuds sans autorité centrale définie |
| 5. Validation et minage | Cadré / En cours | Mécanisme de Proof of Work et loterie des nonces cadré |
| 6. Comparaison d'au moins deux mécanismes de consensus | Cadré / En cours | Comparatif PoW vs PoS prévu dans le scénario |
| 7. Cycle de vie d'une transaction et scénario d'attaque illustré | Cadré / En cours | Trajet mempool -> bloc -> confirmation -> tentative de double dépense cadré |

**Définitions des états :**
- `Non commencé` = réflexion initiale non entamée ;
- `En cours` = une partie est implémentée ou spécifiée mais incomplète / non vérifiée ;
- `Fonctionnel` = le parcours prévu fonctionne localement au moins une fois ;
- `Testé` = vérifié par au moins un test documenté (ou testeur externe).

---

## 2. Répartition du travail

| Membre | Tâches / issues | Issues traitées | Commits |
|:---|:---|:---:|:---:|
| Arthur Morin | Cadrage technique Three.js, structure de scène, métaphores 3D, création du dépôt | #1, #3 | Init & cadrage 3D |
| Alban Chabalier | Gestion de projet, GitHub Project & Milestones, rédaction README, livrables docs | #2, #4, #5 | Docs & gouvernance |

---

## 3. GitHub Projects

| Question | Réponse |
|:---|:---|
| Issues créées | 5 issues granulaires créées |
| Issues fermées | 0 (en cours de démarrage pour le cycle de développement) |
| Nombre dans `Backlog` / `À faire` / `En cours` / `À vérifier` / `Terminé` | 2 dans Backlog, 3 dans À faire, 0 en cours, 0 à vérifier, 0 terminé |
| Board mis à jour pendant la semaine ? | Oui, initialisé et alimenté pour le jalon du 9 octobre |
| Milestone concerné et état | "Cadrage, groupes, dépôt et GitHub Projects créés" (9 octobre 2026) — Atteint |

---

## 4. Choix de modélisation

| Question | Réponse |
|:---|:---|
| Fiches de `MMI-R507-projet-blockchain-CHOIX-MODELISATION.md` complétées | Sections 1, 2, 3, 5, 6, 7 complétées ; fiches 4.1 à 4.7 structurées pour le projet. |
| Choix important et justification | Choix de la métaphore des monolithes cristallins spatiaux avec faisceaux lumineux : lisible, abstrait mais intuitif pour la falsification. |
| Choix remis en question | Abandon de la métaphore ferroviaire (train/wagons) jugée trop rigide pour représenter la décentralisation. |

---

## 5. Tests utilisateurs

| Question | Réponse |
|:---|:---|
| Nombre de testeurs extérieurs cette semaine | 0 (phase de cadrage conceptuel) |
| Compréhension ou problème observé | N/A |
| Issue corrective | Prévue pour les jalons de prototypage (Semaines 3 à 5) |

---

## 6. IA, difficultés et besoins

| Question | Réponse |
|:---|:---|
| Usage de l'IA et vérifications effectuées | Utilisation d'assistants IA pour formaliser les templates de documentation et affiner la taxonomie des issues. Tous les contenus sont relus et validés par l'équipe. |
| Blocage technique | Aucun à ce stade. |
| Blocage pédagogique ou organisationnel | Aucun, le binôme est coordonné. |
| Besoin d'un point enseignant | Validation informelle du fil rouge lors du prochain cours. |

---

## 7. Objectifs de la semaine suivante

| Objectif | Responsable | Issue |
|:---|:---|:---|
| Initialisation de l'application Three.js avec Vite | Arthur Morin | #1 |
| Rédaction du storyboard détaillé reliant pas-à-pas les 7 notions | Alban Chabalier | #2 |
| Mise en place du workflow GitHub Pages pour déploiement automatique | Binôme | #5 |

---

## 8. Signaux d'alerte

- [ ] Le board n'a été mis à jour qu'aujourd'hui.
- [ ] La répartition est fortement déséquilibrée et non expliquée.
- [ ] Nous n'avons pas encore atteint les 2 testeurs extérieurs requis (normal en Semaine 1).
- [ ] Un choix de modélisation important n'est pas justifié.
- [ ] Une notion n'a pas avancé depuis 2 semaines.

---

## 9. Validation

| Élément | Réponse |
|:---|:---|
| Fiche relue par tous | Oui |
| Date d'envoi | 9 octobre 2026 |
| Noms des membres | Arthur Morin, Alban Chabalier |
