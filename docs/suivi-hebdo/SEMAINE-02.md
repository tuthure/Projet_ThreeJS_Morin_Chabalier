# BUT MMI 3e annee - R507

## Projet Three.js - Visualisation pedagogique de la blockchain

### Fiche de suivi - Semaine 2

## 0. Informations generales

| Champ | Contenu |
|:---|:---|
| Groupe | Arthur Morin (@tuthure), Alban Chabalier (@achabalier14) |
| Semaine | 2 |
| Dates couvertes | 10 octobre au 18 octobre 2026 |
| Membres presents | Arthur Morin, Alban Chabalier |
| Lien depot / GitHub Projects | https://github.com/tuthure/Projet_ThreeJS_Morin_Chabalier / https://github.com/tuthure/Projet_ThreeJS_Morin_Chabalier/projects |
| Lien demo en ligne | https://tuthure.github.io/Projet_ThreeJS_Morin_Chabalier/ |

## 1. Avancement

### 1.1 Realise
| Issue / tache | Notion concernee | Statut | Preuve |
|:---|:---|:---|:---|
| Modelisation de la locomotive vide et du wagon Genesis (#0) | Notion 1 (Structure) | Fonctionnel | Separation physique de la motrice de consensus et du wagon Genesis dans train.js |
| Refonte procedurale du wagon : parois en verre transparentes | Notion 1 (Structure) | Fonctionnel | Materiau MeshPhysicalMaterial translucide (metaphore de la transparence publique des transactions) |
| Integration de la molette crantee du Nonce | Notion 1, Notion 5 | Fonctionnel | Cylindre mecanique sur le flanc droit avec valeur numerique aleatoire sans doublon |
| Dissociation spatiale des empreintes cryptographiques | Notions 1 & 2 | Fonctionnel | Plaque centrale SHA-256 (hash actuel) et plaque transversale avant (previousHash) |
| Alignement chronologique du convoi de gauche a droite | Ergonomie / Notions 1 a 7 | Fonctionnel | Sens de circulation aligne sur le sens de lecture occidental standard |
| Architecture modulaire par etape (1 fichier JS par etape) | Architecture logicielle | Fonctionnel | Creation de src/steps/ (step1.js a step7.js) pilotes par StepManager.js |
| Volet pedagogique interactif de l'Etape 1 (Structure d'un bloc) | Notion 1 (Structure) | Teste | Panneau gauche reactif avec zoom cinematique sur les 4 composants anatomiques |
| Epuration de l'interface HUD (suppression des textes et boutons superflus) | UX / Ergonomie | Fonctionnel | Retrait du bandeau encombrant, maintien exclusif d'un compteur FPS discret (60 FPS) |
| Validation du build de production Vite | DevOps / Performance | Teste | npm run build valide sans erreur, temps de build ~2s, bundle optimise |

### 1.2 Prevu mais non realise
| Tache | Cause | Report |
|:---|:---|:---|
| Developpement des notions 2 a 7 | Choix methodologique de se concentrer sur la finalisation soignee de l'Etape 1 (structure du bloc) et sur la mise en place du squelette d'accueil | Developpement progressif etape par etape (notions 2 et 3 prevues en Semaine 3) |

### 1.3 Etat des 7 notions

| Notion obligatoire | Etat | Remarque / preuve |
|:---|:---|:---|
| 1. Structure d'un bloc | Fonctionnel | Seule notion reellement traitee cette semaine : wagon de verre interactif, marchandise visible, molette de Nonce, plaque Hash et Previous Hash inspectables en 3D dans le volet pedagogique |
| 2. Chainage cryptographique | Non commence | Squelette technique mis en place par defaut dans step2.js pour le routage, mais conception pedagogique et interactions reelles a developper en Semaine 3 |
| 3. Immutabilite et detection de falsification | Non commence | Squelette technique mis en place par defaut dans step3.js ; mise en scene de la rupture et interactions non entamees |
| 4. Reseau et decentralisation | Non commence | Squelette technique mis en place par defaut dans step4.js ; travail non entame |
| 5. Validation et minage | Non commence | Squelette technique mis en place par defaut dans step5.js ; travail non entame |
| 6. Comparaison de consensus (PoW vs PoS) | Non commence | Squelette technique mis en place par defaut dans step6.js ; travail non entame |
| 7. Cycle de vie et scenario d'attaque | Non commence | Squelette technique mis en place par defaut dans step7.js ; travail non entame |

Definitions des etats :
- Non commence = reflexion initiale non entamee (ou simple squelette technique d'accueil sans travail de fond)
- En cours = specifie ou en cours d'implementation
- Fonctionnel = fonctionne au moins une fois
- Teste = verifie par un test documente

## 2. Repartition du travail

| Membre | Taches / issues | Issues traitees | Commits |
|:---|:---|:---:|:---:|
| Arthur Morin | Modelisation 3D procedurale Three.js de la locomotive et des wagons, materiaux translucides, molette crantee du Nonce, sens de circulation gauche-droite, optimisation du rendu (60 FPS) | #1, #3 | Commits de modelisation 3D, gestion des textures et disposition spatiale |
| Alban Chabalier | Architecture logicielle modulaire StepManager, conception pedagogique et redaction du volet gauche de l'etape 1, transitions cinematiques de camera, epuration de l'UI | #2, #4 | Commits d'architecture modulaire, UX/UI, controleur camera et documentation |

## 3. GitHub Projects

| Question | Reponse |
|:---|:---|
| Issues creees | Creation des sous-taches relatives a l'architecture modulaire et a la refonte des wagons |
| Issues fermees | 2 issues validees et cloturees sur le premier prototype de wagon et la structure du bloc |
| Nombre dans les colonnes | Notion 1 et infrastructure modulaire dans "Termine" ; notions 2 a 7 dans "A faire" / "Backlog" |
| Board mis a jour pendant la semaine ? | Oui, mis a jour a chaque iteration et etape de modelisation |
| Milestone concerne et etat | Jalon 2 "Prototype fonctionnel avec 3 notions minimum" : Notion 1 fonctionnelle et terminee, notions 2 et 3 a concevoir en Semaine 3 |

## 4. Choix de modelisation

| Question | Reponse |
|:---|:---|
| Fiches de CHOIX-MODELISATION.md completees | La fiche de la Notion 1 a ete actualisee pour integrer l'analogie des parois transparentes et la locomotive de tete. |
| Choix important et justification | **Parois en verre transparentes :** Permet a un public profane de comprendre l'essence meme de la blockchain : la transparence absolue (tout le monde peut verifier les transactions sans ouvrir le coffre) combinee a l'inviolabilite (ouvrir le wagon briserait le sceau mathematique). |
| Choix important et justification | **Dissociation de la locomotive et du premier wagon :** La locomotive incarne la puissance de calcul du reseau (consensus/moteur), tandis que le premier wagon attele est le veritable Bloc Genesis (#0). Cela evite la confusion frequente entre le reseau et les blocs qu'il transporte. |
| Choix remis en question | **Suppression de la surcharge d'interface :** Abandon des bandeaux et badges complexes d'en-tete qui encombraient la vision et donnaient une impression de template artificiel. L'interface est desormais epuree, centree sur le convoi 3D avec un volet d'explication lateral accessible. |

## 5. Tests utilisateurs

| Question | Reponse |
|:---|:---|
| Nombre de testeurs exterieurs cette semaine | 0 (focalisation sur l'architecture modulaire et la modelisation de l'etape 1) |
| Comprehension ou probleme observe | Les echanges internes au binome ont confirme qu'il est indispensable de developper un parcours interactif substantiel avant de solliciter des testeurs exterieurs. Tester un seul fragment isole ne permettrait pas aux personnes novices d'evaluer la continuite de la mediation scientifique. |
| Issue corrective | Decision methodologique : prioriser le developpement des notions 2 et 3 en semaine 3 afin d'avoir le coeur de la demonstration (bloc, chainage, falsification) avant d'organiser la premiere session de tests utilisateurs documentee. |

## 6. IA, difficultes et besoins

| Question | Reponse |
|:---|:---|
| Usage de l'IA et verifications effectuees | Utilisation de l'IA pour assister le refactoring modulaire du code en fichiers d'etapes dedies et optimiser le positionnement trigonometrique des composants 3D. Chaque bloc de code et texte a ete relu, affine et teste unitairement. Toute generation superflue ou visuellement artificielle a ete systematiquement epuree manuellement. |
| Blocage technique | Resolution d'un probleme d'initialisation ordonnee des variables d'inspection (ReferenceError) et inversion du calcul de translation pour aligner le convoi dans le sens de lecture occidental (de gauche a droite). |
| Blocage pedagogique ou organisationnel | Le risque de surcharge cognitive a ete resolu en masquant les commandes de falsification et la sidebar brute lors de la premiere etape, au profit d'un parcours pas-a-pas focalise sur les 4 composants fondamentaux. |
| Besoin d'un point enseignant | Aucun blocage majeur ; un retour rapide sur l'Etape 1 lors du prochain TD permettra de valider la trajectoire avant d'enchainer sur les etapes 2 et 3. |

## 7. Objectifs de la semaine suivante

| Objectif | Responsable | Issue |
|:---|:---|:---|
| Concevoir l'Etape 2 : animation pedagogique de l'attelage cryptographique et concordance des hashs | Arthur Morin | #3 |
| Implementer l'Etape 3 : mise en scene de la falsification d'une transaction et rupture visuelle de l'attelage en cascade | Alban Chabalier | #2, #4 |
| Stabiliser le socle interactif des 3 premieres notions pour preparer le premier banc de test complet | Binome | #1, #5 |

## 8. Signaux d'alerte

- [ ] Le board n'a ete mis a jour qu'aujourd'hui.
- [ ] La repartition est fortement desequilibree et non expliquee.
- [ ] Nous n'avons pas encore atteint les 2 testeurs exterieurs requis (normal a ce stade : les tests seront conduits des que le parcours des 3 premieres notions sera jouable).
- [ ] Un choix de modelisation important n'est pas justifie.
- [ ] Une notion n'a pas avance depuis 2 semaines.

## 9. Validation

| Element | Reponse |
|:---|:---|
| Fiche relue par tous | Oui |
| Date de validation | 18/10/2026 |
| Noms des membres | Arthur Morin, Alban Chabalier |
