# Document de cadrage — Le Convoi Ferroviaire Blindé (R507)

> Version 1.0 — 09/10/2026 (jalon M1 — Cadrage, consolidé pour la livraison M2).
>
> Dépôt : https://github.com/tuthure/Projet_ThreeJS_Morin_Chabalier
> Démo en ligne : https://tuthure.github.io/Projet_ThreeJS_Morin_Chabalier/
> Board Kanban : https://github.com/tuthure/Projet_ThreeJS_Morin_Chabalier/projects

## 1. Équipe

| Membre | GitHub | Rôle principal | Rôle transverse |
|:---|:---|:---|:---|
| Arthur Morin | [@tuthure](https://github.com/tuthure) | Architecture Three.js, modélisation procédurale 3D, animations mécaniques et calcul SHA-256 | Intégration Vite, déploiement GitHub Actions et mesures de performance WebGL |
| Alban Chabalier | [@achabalier14](https://github.com/achabalier14) | Conception UX/UI, scénarisation pédagogique, contrôles caméra et infobulles vectorielles SVG | Gestion du board GitHub Projects, rédaction de `CHOIX-MODELISATION.md` et protocole de tests utilisateurs |

Chaque membre du binôme maîtrise l'ensemble des 7 notions obligatoires et l'architecture complète du dépôt en vue de la soutenance.

## 2. Objectif pédagogique

Faire comprendre le fonctionnement d'une blockchain à un utilisateur non initié, grâce à une expérience web 3D interactive développée avec Three.js, en autonomie complète et sans explication orale préalable. Il ne s'agit pas de déployer un réseau blockchain réel, mais de proposer un outil de médiation scientifique où les empreintes SHA-256, le chaînage et la recherche de Nonce sont réellement calculés en JavaScript (`Block.js` et `Blockchain.js`), tandis que le nombre de nœuds et la difficulté sont calibrés pour rester observables en temps réel à 60 FPS.

## 3. Public cible

**Lycéens, étudiants hors filière informatique et jeunes adultes (16–25 ans)** ayant entendu parler de Bitcoin ou des cryptomonnaies sans connaître leur mécanisme interne.

- Ils naviguent dans un navigateur standard à la souris ou au pavé tactile, sans connaissance préalable en cryptographie ni en développement.
- Ils ne disposent d'aucun accompagnement oral avant ou pendant la découverte du dispositif.
- À l'issue du parcours (durée visée : 10 à 15 minutes), ils doivent pouvoir expliquer avec leurs propres mots pourquoi un bloc validé ne peut pas être modifié discrètement, pourquoi aucun serveur central ne gouverne le réseau et comment une transaction devient définitive face à une tentative d'attaque.

## 4. Fil rouge narratif

**Fil rouge : suivre l'acheminement et la sécurisation de cargaisons industrielles (« Fret #101 — 10 tonnes de cuivre », « Fret #104 — 15 tonnes d'acier ») au sein d'un convoi ferroviaire blindé circulant sur un réseau public sans chef de gare central.**

**Métaphore principale : le Convoi Ferroviaire Blindé sur un archipel de gares autonomes.**

- **La locomotive (Bloc Genesis `#0`)** ouvre la marche et fixe les règles partagées du convoi.
- **Les wagons à parois vitrées (Les blocs)** rendent les cargaisons (transactions) visibles publiquement tout en les protégeant sous verrière.
- **Les attelages magnétiques colorés (`Hash` et `Previous Hash`)** relient physiquement deux wagons lorsque l'empreinte arrière de l'un correspond exactement à la plaque avant du suivant.
- **La molette latérale crantée (Le `Nonce`)** matérialise l'effort de calcul itératif (`1 essai = +1 cran de 45 degrés`).
- **L'archipel de 6 gares autonomes et l'aiguillage en Y** illustrent le réseau pair-à-pair sans serveur central, la compétition de minage/consensus et la règle de la chaîne la plus longue.

| Étape du parcours | Notion R507 | Ce que fait l'utilisateur |
|:---|:---|:---|
| 0. Le réseau public | Cadrage introductif | Observe le convoi complet (locomotive, wagons vitrés, attelages) sur un réseau sans gare centrale |
| 1. Le wagon blindé | 1 — Structure d'un bloc | Inspecte les 4 composants du wagon, modifie la cargaison ou tourne le Nonce et observe le recalcul SHA-256 |
| 2. L'attelage magnétique | 2 — Chaînage cryptographique | Compare les jonctions (`Hash` / `Previous Hash`) et ajoute de nouveaux wagons à la suite du convoi |
| 3. Le wagon falsifié | 3 — Immutabilité et falsification | Altère le chargement du Wagon #1 : l'anneau change de teinte, l'attelage se rompt et les wagons suivants passent au rouge |
| 4. L'archipel de gares | 4 — Réseau et décentralisation | Propage une transaction de gare en gare (Gossip), coupe une gare au clic et observe le rejet d'un wagon pirate |
| 5. La molette de minage | 5 — Validation et minage (PoW) | Choisit la difficulté (`0`, `00`, `000`), actionne la molette cran par cran ou en auto jusqu'au Nonce valide |
| 6. PoW vs PoS | 6 — Comparaison de consensus | Compare la course simultanée de 3 gares (PoW) au tirage pondéré sur caution suivi d'un zoom sur la gare élue (PoS) |
| 7. L'aiguillage en Y | 7 — Cycle de vie et attaque 51 % | Suit le cycle complet d'une transaction puis lance la course sur l'aiguillage en Y (20 % honnête vs 60 % pirate) |

Le détail des justifications visuelles, des alternatives écartées et des limites assumées pour chaque notion est documenté dans [`MMI-R507-projet-blockchain-CHOIX-MODELISATION.md`](MMI-R507-projet-blockchain-CHOIX-MODELISATION.md).

## 5. Les 7 notions obligatoires

1. Structure d'un bloc (données, hash, hash du bloc précédent, nonce)
2. Chaînage cryptographique (hash, lien vers le parent, effet avalanche)
3. Immutabilité et détection de falsification
4. Réseau et décentralisation (nœuds, copies distribuées, propagation sans centre)
5. Validation et minage (vérification, recherche du nonce sous difficulté)
6. Comparaison d'au moins deux mécanismes de consensus (PoW vs PoS)
7. Cycle de vie d'une transaction et scénario d'attaque illustré (51 %)

## 6. Choix techniques

| Élément | Choix | Raison |
|:---|:---|:---|
| Moteur 3D | Three.js (`^0.170.0`) | Imposé par le sujet ; modélisation procédurale low-poly sans assets lourds pour tenir 55–60 FPS |
| Outil de build | Vite (`^6.0.0`) | Démarrage rapide, rechargement à chaud et bundle statique léger pour le plan B hors-ligne |
| Interface et repères | JavaScript ES6+, CSS3 et SVG | Volet pédagogique fixe à gauche et pointeurs SVG projetés sur les éléments 3D |
| Hébergement | GitHub Pages via GitHub Actions | Déploiement continu automatisé à chaque push sur `main` |
| Gestion de projet | GitHub Projects | Board Kanban commun à 5 colonnes (`Backlog`, `À faire`, `En cours`, `À vérifier`, `Terminé`) |

## 7. Organisation et suivi sur le Kanban

- **Branches et commits** : développement sur `main` avec historique linéaire lisible et messages conventionnels sans emoji.
- **Fiches hebdomadaires** : bilans rédigés et archivés dans [`docs/suivi-hebdo/`](suivi-hebdo/) (`SEMAINE-01.md` à `SEMAINE-05.md`).
- **État actualisé du board GitHub Projects** :
  - **Terminé (`CLOSED`)** : cadrage initial, initialisation Vite/Three.js, notions 1 à 7 (y compris l'issue `#13 — Notion 7`), protocole et sessions 1 et 2 de tests utilisateurs (`#17`, `#18`), mesures de performance (`#19`), finalisation de `CHOIX-MODELISATION.md` (`#20`), `README.md` (`#21`), `GRILLE-AUTOEVAL.md` (`#22`), préparation du support de soutenance (`#23`) et réalisation de la vidéo de démonstration de secours (`#24`).
  - **À faire (`OPEN`)** : uniquement l'issue `#25` (*Répétition générale de la soutenance*), programmée le 19 novembre 2026 à 9h30 avant le passage devant le jury.

## 8. Jalons et planning

| Milestone | Date (2026) | Attendu |
|:---|:---|:---|
| M1 — Cadrage | 09/10/2026, 17h | Constitution du binôme, dépôt GitHub, board Kanban, cadrage et premières issues |
| M2 — Livraison | 15/11/2026, 23h59 | Application complète déployée sur GitHub Pages, documentation officielle et tests utilisateurs bouclés |
| M3 — Soutenance | 19/11/2026 | Répétition générale à 9h30, soutenance orale de 20 minutes à 11h00 |

## 9. Risques identifiés

| Risque | Parade mise en place |
|:---|:---|
| Métaphore ferroviaire qui induit une fausse compréhension (ex. serveur central) | Tests utilisateurs externes en deux phases (`PROTOCOLE-TESTS.md`) et rappels explicites des limites dans chaque étape |
| Performances WebGL inférieures à 30 FPS sur poste de TP | Géométries procédurales légères partagées, nettoyage des scènes dans `exit()` et compteur FPS permanent dans le HUD |
| Coupure réseau ou panne navigateur le jour de la soutenance | Build statique local (`npm run preview`) et vidéo de démonstration complète en 1080p prête en plan B (`SOUTENANCE.md`) |
| Déséquilibre de maîtrise entre les deux membres à l'oral | Répartition équilibrée de la démo (étapes 0–3 / 4–7) et relecture croisée de tous les modules et documents |
