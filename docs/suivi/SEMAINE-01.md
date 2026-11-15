# BUT MMI 3e annee - R507

## Projet Three.js - Visualisation pedagogique de la blockchain

### Fiche de suivi - Semaine 1

## 0. Informations generales

| Champ | Contenu |
|:---|:---|
| Groupe | Arthur Morin (@tuthure), Alban Chabalier (@achabalier14) |
| Semaine | 1 |
| Dates couvertes | 1er octobre au 9 octobre 2026 |
| Membres presents | Arthur Morin, Alban Chabalier |
| Lien depot / GitHub Projects | https://github.com/tuthure/Projet_ThreeJS_Morin_Chabalier / https://github.com/tuthure/Projet_ThreeJS_Morin_Chabalier/projects |
| Lien demo en ligne | https://tuthure.github.io/Projet_ThreeJS_Morin_Chabalier/ |

## 1. Avancement

### 1.1 Realise
| Issue / tache | Notion concernee | Statut | Preuve |
|:---|:---|:---|:---|
| Constitution du binome et repartition des roles | Methodologie | Fonctionnel | Roles formalises dans CHOIX-MODELISATION.md et README.md |
| Creation du depot distant GitHub et initialisation locale | Methodologie | Fonctionnel | Depot tuthure/Projet_ThreeJS_Morin_Chabalier avec branche main |
| Creation des 4 Milestones officielles et du calendrier | Methodologie | Fonctionnel | Milestones crees avec dates limites sur GitHub |
| Decoupage et creation des issues initiales | Toutes | Fonctionnel | 5 issues granulaires assignees et reliees au Jalon 1 |
| Choix du fil rouge : Le Convoi Ferroviaire Blinde | Notions 1 a 7 | Fonctionnel | Section 2 de CHOIX-MODELISATION.md entierement redigee |
| Initialisation de l'environnement Vite et Three.js | Architecture 3D | Fonctionnel | Scene Three.js operationnelle, mesh temoin de wagon sur rails, build Vite valide |
| Configuration de l'integration continue GitHub Pages | DevOps | Fonctionnel | Workflow .github/workflows/deploy.yml cree et configure |

### 1.2 Prevu mais non realise
| Tache | Cause | Report |
|:---|:---|:---|
| Aucune | Tous les objectifs du Jalon 1 (cadrage, depot, issues, livrables) sont atteints a date | N/A |

### 1.3 Etat des 7 notions

| Notion obligatoire | Etat | Remarque / preuve |
|:---|:---|:---|
| 1. Structure d'un bloc | En cours | Wagon blinde avec conteneurs de marchandises, plaque de hash, connecteur previousHash et cadran nonce |
| 2. Chainage cryptographique | En cours | Attelage magnetique inviolable reliant les wagons consecutifs |
| 3. Immutabilite et detection de falsification | En cours | Rupture d'attelage en cascade et passage au rouge d'alerte lors d'une tentative de fraude |
| 4. Reseau et decentralisation | En cours | Voies ferrees paralleles supervisees par des cabines d'aiguilleurs autonomes |
| 5. Validation et minage | En cours | Surchauffe de la motrice et cadence mecanique pour aligner le Nonce sous la difficulte |
| 6. Comparaison de consensus (PoW vs PoS) | En cours | Confrontation entre motrice thermique lourde (PoW) et caution d'aiguillage gagée (PoS) |
| 7. Cycle de vie et scenario d'attaque | En cours | Parcours colis sur le quai (mempool), inclusion wagon et rejet d'un colis duplique (double depense) |

Definitions des etats :
- Non commence = reflexion initiale non entamee
- En cours = specifie ou en cours d'implementation
- Fonctionnel = fonctionne au moins une fois
- Teste = verifie par un test documente

## 2. Repartition du travail

| Membre | Taches / issues | Issues traitees | Commits |
|:---|:---|:---:|:---:|
| Arthur Morin | Architecture technique Three.js, shaders, boucle d'animation, wagon temoin et setup Vite | #1, #3 | Setup technique et scene Three.js |
| Alban Chabalier | Gestion de projet, cadrage pedagogique, redaction du convoi ferroviaire, GitHub Projects et CI/CD | #2, #4, #5 | Documentation, cadrage et CI |

## 3. GitHub Projects

| Question | Reponse |
|:---|:---|
| Issues creees | 5 issues granulaires associees au Jalon 1 |
| Issues fermees | 0 (entree dans le developpement actif prevue pour les semaines 2 a 6) |
| Nombre dans les colonnes | Reparties entre Backlog et A faire sur le tableau Kanban a 5 colonnes |
| Board mis a jour pendant la semaine ? | Oui, initialise et structure conformement aux exigences |
| Milestone concerne et etat | Jalon 1 "Cadrage, groupes, depot et GitHub Projects crees" (09/10/2026) : atteint |

## 4. Choix de modelisation

| Question | Reponse |
|:---|:---|
| Fiches de CHOIX-MODELISATION.md completees | L'ensemble des 7 fiches de notions est complete et formalise. |
| Choix important et justification | Choix du convoi ferroviaire blinde : metaphore tres parlante pour le public cible (lyceens, non inities), matérialisant physiquement l'attelage resistant a l'arrachement et la rupture spectaculaire en cascade. |
| Choix remis en question | Abandon des cubes abstraits deconnectes de la realite physique au profit du train infini sur rails. |

## 5. Tests utilisateurs

| Question | Reponse |
|:---|:---|
| Nombre de testeurs exterieurs cette semaine | 0 (etape initiale de cadrage theorique et architectural) |
| Comprehension ou probleme observe | N/A |
| Issue corrective | Prevues a partir de la semaine 3 sur le premier prototype interactif |

## 6. IA, difficultes et besoins

| Question | Reponse |
|:---|:---|
| Usage de l'IA et verifications effectuees | Utilisation de l'IA pour structurer les canevas documentaires markdown et assister le setup initial. Tous les choix narratifs, roles et codes Three.js ont ete relus, corriges et valides manuellement par le binome. |
| Blocage technique | Aucun blocage technique rencontre sur l'initialisation Three.js / Vite. |
| Blocage pedagogique ou organisationnel | Aucun, repartition claire et consensus valide sur la metaphore ferroviaire. |
| Besoin d'un point enseignant | Non necessaire pour le Jalon 1, tous les voyants sont au vert. |

## 7. Objectifs de la semaine suivante

| Objectif | Responsable | Issue |
|:---|:---|:---|
| Enrichir le wagon Three.js avec ses compartiments de marchandises et roues | Arthur Morin | #1, #3 |
| Mettre en place OrbitControls et les premiers boutons de transition du HUD | Alban Chabalier | #4 |
| Tester les premiers shaders de lueur magnetique pour les attelages | Arthur Morin | #3 |

## 8. Signaux d'alerte

- [ ] Le board n'a ete mis a jour qu'aujourd'hui.
- [ ] La repartition est fortement desequilibree et non expliquee.
- [ ] Nous n'avons pas encore atteint les 2 testeurs exterieurs requis (normal en semaine 1).
- [ ] Un choix de modelisation important n'est pas justifie.
- [ ] Une notion n'a pas avance depuis 2 semaines.

## 9. Validation

| Element | Reponse |
|:---|:---|
| Fiche relue par tous | Oui |
| Date de validation | 09/10/2026 |
| Noms des membres | Arthur Morin, Alban Chabalier |
