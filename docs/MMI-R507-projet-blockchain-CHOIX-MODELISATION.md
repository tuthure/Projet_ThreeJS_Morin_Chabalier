# Choix de modelisation - Visualisation pedagogique de la blockchain

Ce document constitue le livrable de cadrage et de justification des choix de modelisation pour le projet de visualisation pedagogique de la blockchain avec Three.js. Il est tenu a jour tout au long des jalons du projet.

## 1. Informations generales

| Champ | Contenu |
|:---|:---|
| Groupe | Arthur Morin, Alban Chabalier |
| Membres et roles | Alban Chabalier (@achabalier14) : Gestion de projet, conception UX/UI, ergonomie des controles camera, narration pedagogique et scenarisation des 7 notions.<br>Arthur Morin (@tuthure) : Architecture technique Three.js, rendu 3D (shaders, eclairage, materiaux des wagons), logique de manipulation de la chaine et integration Vite. |
| Public cible | Grand public non initie, lyceens et etudiants decouvrant les concepts de la blockchain. |
| Lien vers la demo en ligne | https://tuthure.github.io/Projet_ThreeJS_Morin_Chabalier/ |
| Lien vers GitHub Projects | https://github.com/tuthure/Projet_ThreeJS_Morin_Chabalier/projects |
| Version et date | v0.1 - 09/10/2026 |

## 2. Univers visuel et metaphore principale

### 2.1 Public cible et objectifs pedagogiques
Le dispositif s'adresse a un public sans bagage technique prealable en mathematiques cryptographiques ou en architecture reseau distribuee.
A l'issue de l'experience, l'utilisateur doit pouvoir :
- Identifier les composants essentiels d'un bloc et leur utilite.
- Comprendre pourquoi et comment l'empreinte numerique (hash) lie les blocs de maniere inalterable.
- Visualiser concretement l'effet domino (effet avalanche) lorsqu'une transaction passee est alteree.
- Apprehender le consensus sans autorite centrale grace a un reseau distribue de voies paralleles.
- Distinguer le fonctionnement et les implications energetiques de la Preuve de Travail (PoW) par rapport a la Preuve d'Enjeu (PoS).
- Suivre le parcours d'une transaction et comprendre pourquoi une tentative de double depense echoue.

### 2.2 Metaphore retenue : Le Convoi Ferroviaire Blinde (Le train infini)
Nous avons opte pour la metaphore d'un convoi ferroviaire blindÃ© progressant sur des voies ferrees.
Dans cette analogie :
- Chaque wagon represente un bloc de la chaine.
- L'interieur du wagon accueille des conteneurs de marchandises securisees representant les transactions.
- L'attelage entre deux wagons est un dispositif magnetique inviolable materialisant le hash cryptographique. Cet attelage n'accepte de se verrouiller que si le connecteur arriere du wagon N s'aligne exactement sur le connecteur avant du wagon N-1 (previousHash).
- La rupture d'attelage illustre l'effet avalanche et la perte d'immutabilite : alterer la moindre marchandise a bord d'un wagon modifie immediatement sa polarisation magnetique. L'attelage se rompt dans une lueur rouge d'alerte, et tous les wagons suivants sont desolidarises du train.
- Les voies ferrées paralleles et leurs aiguilleurs independants modelisent la decentralisation. Plusieurs aiguilleurs surveillent chacun une voie identique sans chef de gare central.
- La motrice et sa chaudiere mecanique figurent la Preuve de Travail (PoW) : pour forger et atteler un nouveau wagon, la machinerie doit depenser de l'energie pour caler ses rouages sur le Nonce requis par la difficulte du reseau.

### 2.3 Justification pedagogique et limites
| Question | Reponse et analyse |
|:---|:---|
| Quelles proprietes deviennent evidentes ? | L'ordre chronologique strict des blocs, la dependance directe a l'etat anterieur, la severite de la rupture d'inalterabilite, et la nature distribuee des observateurs du convoi. |
| Quelles proprietes risquent d'etre deformees ? | Le calcul de la fonction de hachage SHA-256 risque d'etre percu comme une simple attache physique plutot que comme un calcul mathematique a sens unique. De meme, un train suggere une continuite temporelle continue alors que les blocs sont produits par intervalles discrets. |
| Comment ces limites sont-elles compensees ? | Des compteurs numeriques et cadrans interactifs affichent la chaine hexadecimale du hash en temps reel. Les wagons s'assemblent par a-coups nets au moment de la resolution du nonce. |

### 2.4 Metaphores ecartees
| Metaphore envisagee | Points forts | Pourquoi ecartee |
|:---|:---|:---|
| Coffres-forts dans une salle d'archives | Bonne representation de la securite et du scellement | Convoque involontairement l'imaginaire bancaire centralise et manque de dynamisme interactif dans l'espace 3D. |
| Cubes de verre abstraits flottants | Esthetique moderne et epuree | Trop abstraite pour des lyceens, ne transmet pas l'intuition physique de l'attelage resistant a l'arrachement. |
| Registre papier tamponne | Proche de l'historique comptable reel | Difficile a animer en Three.js de facon engageante et ne valorise pas l'espace tridimensionnel. |

### 2.5 Charte visuelle et sonore
| Element | Choix retenu | Justification pedagogique |
|:---|:---|:---|
| Palette chromatique | Gris acier bleute (#1e293b) pour les wagons valides, vert emeraude (#10b981) pour les attelages stables, rouge signalisation (#ef4444) pour les ruptures d'attelage et falsifications, orange ambre (#f59e0b) pour le minage en cours. Fond d'espace sombre (#0b0f19). | Utilisation de contrastes chromatiques normalises : le vert valide, l'orange signale le travail en cours, le rouge alerte sur l'invalidite. |
| Formes et silhouettes | Wagons stylises et anguleux, voies metalliques rectilignes, cadrans hexagonaux pour les hashs. | Formes nettes et sobres, faciles a analyser visuellement sous tous les angles de camera. |
| Eclairage | Ambiance tamisee avec spots directionnels places sur le wagon etudie. Halo lumineux emissif sur les points de jonction magnetique. | Focalise naturellement l'attention de l'apprenant sur la zone d'interaction sans artifice inutile. |
| Typographie | Police sans-serif moderne et neutre pour l'interface HUD ; police monospace (chasse fixe) pour les hashs et nonces. | Permet la comparaison terme a terme des chaines hexadecimales sans decalage d'alignement. |
| Son | Non utilise. | Maintient la sobriete du dispositif et evite la saturation cognitive lors d'une utilisation en salle de cours ou au casque. |

## 3. Camera, espace et navigation

| Question | Reponse et justification |
|:---|:---|
| Mode de camera (libre, guide, mixte) | Camera mixte : trajectoire automatique guidee lors des transitions de notions, avec possibilite de rotation libre (OrbitControls) sur chaque wagon pour inspecter les marchandises et cadrans. |
| Reperage de l'utilisateur | La camera se recadre avec un travelling fluide vers le wagon ou l'element concerne. Une etiquette textuelle HUD indique en permanence la notion en cours. |
| Organisation spatiale | Voie principale orientee le long de l'axe X (de gauche a droite). Les voies paralleles des autres noeuds sont disposees sur l'axe Z a distance constante. |
| Representation temporelle | Sens de circulation de gauche a droite : le wagon Genesis est a l'arriere gauche, le wagon le plus recent est a droite en tete de convoi. |
| Passage entre notions | Boutons de navigation pas-a-pas "Precedent" et "Suivant" dans le HUD superpose, doubles d'un fil d'ariane cliquable. |

## 4. Fiches des 7 notions obligatoires

### 4.1 - Structure d'un bloc

Issues liees : #1, #2, #3  
Sequence concernee : Sequence 1 (Decouverte du wagon de base)

#### a) Objectif pedagogique
Faire comprendre qu'un bloc n'est pas une donnee brute unitaire, mais un conteneur structure associant quatre champs indissociables : des transactions (marchandises), une empreinte propre (hash du bloc), l'empreinte du bloc precedent (previousHash), et un facteur d'ajustement (nonce).

#### b) Risque de mauvaise comprehension
Confondre le hash du bloc avec une transaction, ou imaginer que le nonce est un numero d'ordre arbitraire.

#### c) Representation choisie
| Dimension | Choix | Pourquoi ce choix sert la comprehension |
|:---|:---|:---|
| Forme / geometrie | Wagon blindé rectangulaire stylise avec compartiment superieur transparent et attelages aux extremites. | Rend tangible l'idee d'un volume qui transporte des charges utiles. |
| Taille et echelle | 2.5 x 1.4 x 1.4 unites 3D. | Taille ideale pour une bonne lisibilite des faces a distance standard de camera. |
| Couleur / materiau | Metal sombre satine avec marquages luminescents cyan. | Donne un aspect technique robuste sans charger la geometrie. |
| Position | Centre de la scene pour le premier wagon (Bloc 0 / Genesis). | Focalise le regard sur l'anatomie interne du wagon. |
| Mouvement / animation | Legere lévitation elastique au-dessus des rails au repos. | Signale l'interactivite de l'objet sans distraire. |
| Interaction et retour visuel | Clic sur le wagon pour deployer un panneau d'inspection des marchandises, de la plaque de hash et du cadran du nonce. | Permet une observation a deux niveaux : vue macro du convoi et vue micro du contenu. |
| Son, si utilise | Aucun. | Sobriete cognitive. |
| Texte d'accompagnement | Fiche descriptive synthetique dans le HUD listant les 4 champs fondamentaux. | Formalise le vocabulaire technique avec des termes clairs. |

#### d) Correspondance avec la realite technique
| Element visuel | Element reel | Fidelite |
|:---|:---|:---|
| Caisses scellees dans le compartiment | Transactions composant le bloc (mempool futee) | Simplifiee a 3 transactions explicites (ex: "Alice -> Bob : 2 BTC"). |
| Plaque metallique avant gravee | Hash SHA-256 du bloc courant | Exacte (affiche sous forme abregee lisible, ex: 0000a89f...3c). |
| Connecteur magnetique arriere | previousHash (hash du bloc parent) | Exacte dans le principe de reproduction de l'empreinte precedente. |
| Cadran a molettes numerotees | Nonce (entier naturel teste pour le scellement) | Exacte, represente sous forme de compteur numerique. |

#### e) Alternative ecartee
| Alternative | Raison du rejet |
|:---|:---|
| Affichage exhaustif d'un arbre de Merkle complet dans le wagon | Trop touffu visuellement pour un novice lors d'une premiere prise en main. |

#### f) Tests utilisateurs
| Observation prevue | Modification prevue | Issue associee |
|:---|:---|:---|
| Verifier si l'utilisateur identifie les 4 champs sans assistance orale. | Ajuster les labels du panneau d'inspection si confusion. | A ouvrir en phase de test utilisateur. |

#### g) Limites assumees
Le hash est tronque pour garantir une lisibilite immediate sur les ecrans de resolution standard.

---

### 4.2 - Chainage cryptographique

Issues liees : #1, #2, #3  
Sequence concernee : Sequence 2 (Attelage et dependance)

#### a) Objectif pedagogique
Comprendre que l'incorporation de l'empreinte du bloc N-1 dans l'entete du bloc N cree une liaison directionnelle stricte et inviolable.

#### b) Risque de mauvaise comprehension
Penser que les blocs sont de simples maillons interchangeables ou relies par une simple liste chainee modifiable en memoire.

#### c) Representation choisie
| Dimension | Choix | Pourquoi ce choix sert la comprehension |
|:---|:---|:---|
| Forme / geometrie | Faisceau magnetique cylindrique dense reliant la plaque arriere du wagon N a la plaque avant du wagon N-1. | Concrétise physiquement la transmission de l'identifiant d'un bloc a l'autre. |
| Couleur | Lueur verte stabilisée (#10b981). | Atteste de la parfaite concordance entre previousHash et le hash reel du parent. |
| Interaction | Survol du faisceau pour illuminer simultanement les deux plaques identiques sur les deux wagons. | Met en evidence la relation d'egalite mathematique entre la source et la cible. |

#### d) Correspondance avec la realite technique
| Element visuel | Element reel | Fidelite |
|:---|:---|:---|
| Faisceau magnetique verouille | Verification de l'integrite du champ previousHash par les pairs | Fidelite logique fidele a l'algorithme de validation. |

#### e) Alternative ecartee
| Alternative | Raison du rejet |
|:---|:---|
| Chaine de maillons metalliques classiques | Suggere une attache purement physique sans support d'information cryptographique. |

#### f) Tests utilisateurs
| Observation prevue | Modification prevue | Issue associee |
|:---|:---|:---|
| Tester si la notion de liaison par empreinte est comprise spontanement. | Renforcer le marquage lumineux si le lien est neglige. | Phase de validation. |

#### g) Limites assumees
L'attelage est represente par une lumiere continue plutot que par un calcul cryptographique abstrait execute sous les yeux de l'apprenant.

---

### 4.3 - Immutabilite et detection de falsification

Issues liees : #2, #3  
Sequence concernee : Sequence 3 (Tentative d'alteration d'un wagon)

#### a) Objectif pedagogique
Visualiser l'effet avalanche : modifier un caractere d'une transaction passee change integralement son hash, rendant caducs tous les attelages des wagons suivants.

#### b) Risque de mauvaise comprehension
Croire qu'une modification discrete dans le passe peut passer inapercue si les wagons recents ne sont pas touches.

#### c) Representation choisie
| Dimension | Choix | Pourquoi ce choix sert la comprehension |
|:---|:---|:---|
| Forme / geometrie | Champ de saisie interactif permettant d'editer une marchandise dans un wagon ancien (Wagon 1 sur un convoi de 4). | Place l'utilisateur en posture active d'attaquant ou de falsificateur. |
| Animation / retour visuel | Instantanement, le hash du wagon altere vire au rouge vif ; les attelages magnetiques vers les wagons suivants se brisent avec des arcs electriques ; tous les wagons aval basculent en position desaxee avec clignotement rouge d'alarme. | L'effet domino est immediat et spectaculaire : l'echec de validation saute aux yeux. |
| Texte contextuel | Message expliquant que l'ancien convoi rejette ces wagons devenus incompatibles. | Donne l'explication logique du phenomene observe. |

#### d) Correspondance avec la realite technique
| Element visuel | Element reel | Fidelite |
|:---|:---|:---|
| Rupture des liens et bascule en rouge | Rejet par les regles de consensus des blocs dont le previousHash ne matche plus | Exacte sur la cascade d'invalidation. |

#### e) Alternative ecartee
| Alternative | Raison du rejet |
|:---|:---|
| Simple message texte d'erreur sans animation 3D | Ne tire aucun parti de Three.js et manque cruellement d'impact pedagogique. |

#### f) Tests utilisateurs
| Observation prevue | Modification prevue | Issue associee |
|:---|:---|:---|
| Observer la surprise et la deduction de l'utilisateur face a la rupture en cascade. | Calibrer la vitesse de l'effet d'avalanche pour que chaque wagon soit vu en train de rompre. | Phase de tests. |

#### g) Limites assumees
La rupture se propage de facon quasi instantanee a des fins visuelles, alors que sur un reseau reel elle intervient au moment du broadcast des blocs.

---

### 4.4 - Reseau et decentralisation

Issues liees : #1, #2, #4  
Sequence concernee : Sequence 4 (Les voies d'aiguillage paralleles)

#### a) Objectif pedagogique
Demontrer qu'aucune entite unique ne possede la verite du registre : plusieurs voies paralleles hebergent une copie fidele du train, inspectee par des aiguilleurs autonomes (noeuds du reseau).

#### b) Risque de mauvaise comprehension
S'imaginer qu'il existe un serveur principal qui synchronise des terminaux passifs esclaves.

#### c) Representation choisie
| Dimension | Choix | Pourquoi ce choix sert la comprehension |
|:---|:---|:---|
| Organisation spatiale | Dezoom camera revelant 3 voies ferrees paralleles cote a cote, transportant chacune une copie identique du convoi. | Materialise visuellement le registre distribue. |
| Entites autonomes | Des cabines d'aiguillage independantes le long des voies avec fanions verts de synchronisation. | Symbolisent les noeuds validateurs complets (full nodes). |
| Interaction | L'utilisateur peut modifier un wagon sur une seule voie : les deux autres aiguilleurs refusent la mise a jour et isolent la voie corrompue. | Met en evidence le principe de majorite du reseau. |

#### d) Correspondance avec la realite technique
| Element visuel | Element reel | Fidelite |
|:---|:---|:---|
| Voies paralleles | Registres locaux maintenus par chaque noeud complet | Fidele au paradigme pair-a-pair. |
| Decision de l'aiguilleur | Regles de consensus appliquees par chaque client blockchain | Exacte. |

#### e) Alternative ecartee
| Alternative | Raison du rejet |
|:---|:---|
| Reseau de serveurs informatiques en rack 19 pouces | Iconographie informatique classique mais depourvue de lien avec notre fil rouge ferroviaire. |

#### f) Tests utilisateurs
| Observation prevue | Modification prevue | Issue associee |
|:---|:---|:---|
| Verifier que l'utilisateur comprend qu'il n'y a pas de cabine centrale chef. | Accentuer la symetrie absolue des cabines d'aiguillage. | Phase de tests. |

#### g) Limites assumees
Le nombre de voies est limite a 3 ou 4 pour preserver la fluidite de calcul Three.js (viser >= 30 FPS).

---

### 4.5 - Validation et minage (Proof of Work)

Issues liees : #1, #2, #3  
Sequence concernee : Sequence 5 (La motrice en surchauffe et le Nonce)

#### a) Objectif pedagogique
Expliquer le cout en calcul de l'ajout d'un bloc : trouver un Nonce generant un hash satisfaisant la difficulte imposee (ex: commencant par plusieurs zeros).

#### b) Risque de mauvaise comprehension
Croire que le minage resout une equation complexe utile ou qu'il s'agit d'un tirage au sort passif sans depense de travail.

#### c) Representation choisie
| Dimension | Choix | Pourquoi ce choix sert la comprehension |
|:---|:---|:---|
| Forme / geometrie | La motrice de queue / tete avec piston mecanique, chaudiere lumineuse et cadran rotatif rapide pour le nonce. | Rend visible l'effort mecanique et thermique associe a la preuve de travail. |
| Animation | Lors du clic sur "Lancer le minage", la motrice s'emballe, les pistons accelerent, les cadrans defilent rapidement, puis s'arretent des qu'un hash valide est trouve (ex: debutant par 0000). | Permet de vivre l'attente et l'effort statistique du processus. |
| Couleur | Passage de l'orange d'activite intense au vert d'achevement des la trouvaille du nonce valide. | Feedback positif direct. |

#### d) Correspondance avec la realite technique
| Element visuel | Element reel | Fidelite |
|:---|:---|:---|
| Defilement des cadrans | Incrementation par force brute de l'entier Nonce | Fidele a la recherche d'une empreinte valide sous la cible de difficulte. |
| Fumee / surchauffe | Consommation electrique et puissance de hachage (hashrate) | Analogie directe de la consommation energetique. |

#### e) Alternative ecartee
| Alternative | Raison du rejet |
|:---|:---|
| Afficher une ligne de commande textuelle brute du mineur | Totalement hermetique pour notre public cible de lyceens et non inities. |

#### f) Tests utilisateurs
| Observation prevue | Modification prevue | Issue associee |
|:---|:---|:---|
| Mesurer la comprehension du temps de resolution face a la difficulte. | Permettre a l'utilisateur de tester deux niveaux de difficulte (1 zero vs 3 zeros). | Phase de tests. |

#### g) Limites assumees
La difficulte est artificielle et reduite a quelques caracteres pour ne pas bloquer le thread JavaScript du navigateur pendant plusieurs minutes.

---

### 4.6 - Comparaison de deux mecanismes de consensus (PoW vs PoS)

Issues liees : #2, #4  
Sequence concernee : Sequence 6 (L'effort mecanique vs la caution d'aiguillage)

#### a) Objectif pedagogique
Comparer objectivement la Preuve de Travail (Proof of Work) et la Preuve d'Enjeu (Proof of Stake) sur leurs criteres fondamentaux : consommation d'energie, vitesse de validation et critere de selection du validateur.

#### b) Risque de mauvaise comprehension
Penser que le Proof of Stake est moins securise par essence ou ne pas comprendre le role de la mise sous sequestre (stake/caution).

#### c) Representation choisie
| Dimension | Choix | Pourquoi ce choix sert la comprehension |
|:---|:---|:---|
| Mise en scene comparative | Ecran scinde ou bascule interactive entre deux motrices :<br>1. Mode PoW : Motrice thermique brulant du combustible, pistons bruyants, validation lente et couteuse.<br>2. Mode PoS : Cabine d'aiguilleur deposant un coffre de caution (lingots scelles). Tirage proportionnel a la caution, attelage instantane et silencieux. | Confrontation visuelle directe des deux philosophies de consensus. |
| Indicateurs comparatifs | Jauge de consommation energetique et chronometre compares cote a cote dans le HUD. | Donne des reperes quantitatifs simples et marquants. |

#### d) Correspondance avec la realite technique
| Element visuel | Element reel | Fidelite |
|:---|:---|:---|
| Surchauffe motrice PoW | Consommation electrique massive de l'algorithme SHA-256 | Exacte dans les ordres de grandeur energetiques. |
| Caution deposee PoS | Depose de tokens en staking avec penalite de slashing | Exacte sur le principe d'engagement financier. |

#### e) Alternative ecartee
| Alternative | Raison du rejet |
|:---|:---|
| Tableau purement textuel sans representation 3D | Trop scolaire, rate l'opportunite d'illustrer la difference par l'animation 3D. |

#### f) Tests utilisateurs
| Observation prevue | Modification prevue | Issue associee |
|:---|:---|:---|
| Verifier si la notion de caution immobilisee est bien comprise en PoS. | Ajouter une infobulle precisant le risque de confiscation en cas de triche. | Phase de tests. |

#### g) Limites assumees
Le tirage pseudo-aleatoire du validateur en PoS est synthetise par une roulette visuelle simplifiee.

---

### 4.7 - Cycle de vie d'une transaction et scenario d'attaque illustre

Issues liees : #2, #3, #4  
Sequence concernee : Sequence 7 (Du quai au rejet de la double depense)

#### a) Objectif pedagogique
Visualiser les etapes successives d'une transaction (creation, mempool d'attente, integration dans un bloc scelle, propagation sur les voies) et demontrer pourquoi une attaque de type double depense est neutralisee par le reseau.

#### b) Risque de mauvaise comprehension
Croire qu'une transaction est immediate des sa creation ou ne pas comprendre pourquoi deux transactions contradictoires ne peuvent coexister.

#### c) Representation choisie
| Dimension | Choix | Pourquoi ce choix sert la comprehension |
|:---|:---|:---|
| Cycle standard | 1. Un colis numerique arrive sur le quai de chargement (zone mempool).<br>2. Le colis est embarque dans le wagon en cours de scellement.<br>3. Le wagon est arrime et la mise a jour roule sur toutes les voies paralleles. | Decompose clairement la chronologie d'inclusion. |
| Scenario d'attaque (Double depense) | L'utilisateur tente d'envoyer le meme colis sur la voie 1 et sur la voie 2 avec deux destinataires differents. Des que les aiguilleurs comparent l'historique de leurs voies, la deuxieme transaction est ejectee du convoi avec un signal sonore/visuel d'invalidation. | Demonstration par l'experience de la resolution du conflit. |

#### d) Correspondance avec la realite technique
| Element visuel | Element reel | Fidelite |
|:---|:---|:---|
| Colis sur le quai | Transaction diffusee en attente dans la mempool | Exacte. |
| Embarquement dans le convoi | Validation par inclusion dans un bloc scelle | Exacte. |
| Ejection du doublon | Regle univoque empechant la reutilisation des memes UTXO | Fidele au protocole Bitcoin/Ethereum. |

#### e) Alternative ecartee
| Alternative | Raison du rejet |
|:---|:---|
| Attaque des 51% detaillee des cette etape | Trop complexe a simuler pour un premier niveau de decouverte sans noyer l'utilisateur. |

#### f) Tests utilisateurs
| Observation prevue | Modification prevue | Issue associee |
|:---|:---|:---|
| Valider si la difference entre mempool et transaction confirmee est nette. | Ajouter un statut explicite "En attente sur le quai" puis "Confirmee dans le convoi". | Phase de tests. |

#### g) Limites assumees
Le temps de latence reseau entre les noeuds est contracte a quelques secondes pour maintenir le dynamisme de la demonstration.
