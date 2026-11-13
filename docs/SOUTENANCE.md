# Plan de soutenance — Le Convoi Ferroviaire Blindé

**Ressource :** R507 — Dispositifs interactifs (BUT MMI 3e année, IUT de Béziers)  
**Binôme :** Arthur Morin & Alban Chabalier  
**Dépôt :** `tuthure/Projet_ThreeJS_Morin_Chabalier`

---

## 1. Informations générales et support

- **Date et horaires :** Jeudi 19 novembre 2026 à 11h00 (répétition générale le même jour à 9h30).
- **Durée totale :** 20 minutes (environ 15 minutes de présentation et démonstration interactive, suivies de 5 minutes d'échange et de questions avec le jury, modulables selon le rythme de l'oral : 13-14 min + 6-7 min).
- **Support :** Présentation sous forme de **diaporama** (cadrage du sujet, justification des choix de modélisation, protocole de tests utilisateurs, gestion de projet et bilan) couplée à la **démonstration en direct** de l'application WebGL déployée sur GitHub Pages : `https://tuthure.github.io/Projet_ThreeJS_Morin_Chabalier/`.
- **Règle d'équipe :** Alternance équilibrée de prise de parole entre Arthur Morin et Alban Chabalier sur l'exposé et sur la manipulation en direct. Chaque membre maîtrise l'intégralité des 7 notions blockchain ainsi que l'architecture du code (`Block.js`, `Blockchain.js`, `StepManager.js`, `step0.js` à `step7.js`) pour pouvoir répondre à n'importe quelle question ciblée du jury.

---

## 2. Plan minuté de la soutenance (20 minutes)

| Temps | Support | Intervenant | Contenu et points clés |
|:---|:---|:---|:---|
| `0:00 – 1:30` | Diapo 1-2 | Alban | Accroche, problématique (vulgariser 7 notions blockchain abstraites pour un public novice sans explication orale) et présentation de la métaphore du Convoi Ferroviaire Blindé. |
| `1:30 – 3:00` | Diapo 3 | Arthur | Architecture du parcours (étapes 0 à 7), choix esthétiques low-poly procéduraux et lisibilité visuelle (codes couleurs cyan/émeraude, jaune ambre, rouge alerte). |
| `3:00 – 10:00` | Démo live | Alban & Arthur | Démonstration interactive des 7 notions sur le dispositif WebGL : Alban sur l'accueil et les notions 1 à 3, puis Arthur sur les notions 4 à 7. |
| `10:00 – 12:00` | Diapo 4-5 | Arthur | Justification des choix de modélisation (`CHOIX-MODELISATION.md`) et limites techniques assumées (ce qui est calculé réellement vs ce qui est simplifié ou simulé pour la pédagogie). |
| `12:00 – 14:00` | Diapo 6-7 | Alban | Protocole de tests utilisateurs (4 testeurs externes de 18 à 25 ans, `PROTOCOLE-TESTS.md`), score moyen de compréhension (4,25 / 5) et correctifs appliqués (clarification de l'absence de serveur central à l'étape 4, épuration de l'intérieur des wagons, ralentissement de l'étape 7). |
| `14:00 – 15:30` | Diapo 8-9 | Alban & Arthur | Gestion de projet (GitHub Projects, milestones, fiches hebdomadaires), performances WebGL (60+ FPS mesurés) et usage transparent de l'IA générative (Gemini et Antigravity). |
| `15:30 – 20:00` | Questions | Les deux | Échange et réponses aux questions du jury. |

---

## 3. Script de démonstration en direct (7 minutes — de 3:00 à 10:00)

- **Étape 0 — Accueil / Le Réseau Ferroviaire Public (~45 s, Alban)**
  - **Action :** Depuis l'écran d'accueil, cliquer sur « Démarrer l'exploration ». Faire pivoter brièvement la caméra autour du convoi complet à l'étape 0 pour montrer la locomotive (Bloc Genesis #0), les wagons vitrés et les attelages magnétiques.
  - **Phrase clé :** « Tout notre dispositif repose sur une analogie unique : la blockchain est un train blindé circulant sur un réseau ferroviaire public sans chef de gare central, où chaque wagon vitré transporte des transactions visibles par tous mais verrouillées par un attelage cryptographique. »

- **Étape 1 — Structure d'un bloc (~1 min, Alban)**
  - **Action :** Passer à l'étape 1, montrer les trois composants du wagon (les caisses de marchandises pour les données, l'horloge de quai pour l'horodatage, la plaque centrale pour le Hash). Cliquer sur une action modifiant le chargement du wagon et montrer le recalcul immédiat de l'empreinte SHA-256 et le changement de couleur de l'anneau.
  - **Phrase clé :** « Le Hash agit comme un sceau numérique calculé à partir du contenu exact du wagon : dès qu'on modifie une seule caisse à l'intérieur, l'empreinte hexadécimale et la couleur de l'anneau changent instantanément. »

- **Étape 2 — Chaînage cryptographique (~45 s, Alban)**
  - **Action :** Passer à l'étape 2, cadrer la jonction entre les wagons #1 et #2 et montrer que le crochet avant du wagon #2 (`Previous Hash`) reprend exactement la couleur et l'empreinte de la prise arrière du wagon #1.
  - **Phrase clé :** « Les wagons ne sont pas simplement posés les uns derrière les autres : le crochet avant de chaque wagon embarque l'empreinte exacte du wagon précédent, ce qui rend l'ordre du convoi mathématiquement indissociable. »

- **Étape 3 — Immutabilité et effet avalanche (~1 min, Alban)**
  - **Action :** À l'étape 3, modifier frauduleusement le contenu du wagon #1. Montrer que son attelage arrière vire au jaune ambre (nouveau hash calculé), que le wagon #2 (qui attend toujours l'ancien anneau cyan) rejette l'attelage et se décroche physiquement, et que toute la suite du train passe en alerte rouge. Cliquer ensuite sur « Restaurer » pour rétablir le convoi.
  - **Phrase clé :** « Si un fraudeur modifie un wagon déjà validé, son anneau change de couleur et ne correspond plus au crochet du wagon suivant : l'attelage se décroche immédiatement et invalide tous les wagons situés derrière lui. »

- **Étape 4 — Réseau et décentralisation (~1 min, Arthur)**
  - **Action :** Passer à l'étape 4 sur la carte du réseau de 6 gares interconnectées. Cliquer sur « Émettre une transaction » pour montrer la propagation séquentielle de proche en proche (*gossip protocol*) d'une gare à ses voisines. Cliquer ensuite sur une gare pour la mettre hors-ligne (panne) puis relancer une diffusion pour montrer que le réseau contourne la gare éteinte.
  - **Phrase clé :** « Il n'existe aucune gare centrale : chaque gare possède sa propre copie intégrale du registre des trains, diffuse les nouvelles transactions de proche en proche et le réseau continue de fonctionner même si un nœud tombe en panne. »

- **Étape 5 — Validation et minage / Proof-of-Work (~1 min, Arthur)**
  - **Action :** Passer à l'étape 5, sélectionner une difficulté (`0`, `00` ou `000`), lancer le minage automatique pour faire tourner la molette crantée du Nonce et montrer le compteur d'essais réels comparé à la moyenne théorique (16, 256 ou 4 096 essais) jusqu'au verrouillage d'un hash valide.
  - **Phrase clé :** « Pour avoir le droit d'atteler un nouveau wagon, une gare doit tourner la molette du Nonce par essais-erreurs jusqu'à trouver un Hash commençant par le bon nombre de zéros : c'est long à trouver, mais un seul calcul suffit ensuite aux autres gares pour le vérifier. »

- **Étape 6 — Mécanismes de consensus PoW vs PoS (~45 s, Arthur)**
  - **Action :** Passer à l'étape 6 et basculer entre les deux modes du comparateur interactif : d'abord la Preuve de Travail (compétition de puissance de calcul entre les gares avec dépense énergétique), puis la Preuve d'Enjeu (sélection pondérée d'une gare validatrice ayant immobilisé une caution sur le quai).
  - **Phrase clé :** « Là où la Preuve de Travail met toutes les gares en compétition de calcul au prix d'une forte consommation d'énergie, la Preuve d'Enjeu sélectionne une seule gare validatrice qui dépose une caution financière en garantie de son honnêteté. »

- **Étape 7 — Cycle de vie complet et attaque des 51 % (~45 s, Arthur)**
  - **Action :** Passer à l'étape 7 devant l'aiguillage en Y. Lancer d'abord le Scénario 1 (Pirate minoritaire à 20 % vs Gares honnêtes à 80 %) pour montrer que la branche honnête assemble 3 wagons en premier et glisse sur le rail central. Basculer ensuite sur le Scénario 2 (Attaque des 51 % — Pirate à 60 %) pour montrer que le pirate mine plus vite, impose sa branche sur le rail central et relègue la chaîne honnête sur la voie de garage.
  - **Phrase clé :** « Face à deux versions concurrentes sur l'aiguillage, le réseau applique la règle de la chaîne la plus longue : tant qu'aucun acteur ne détient plus de la moitié de la puissance totale, le train honnête gagne systématiquement la course. »

---

## 4. Plan B technique (en cas d'imprévu le jour J)

| Scénario d'incident | Parade immédiate |
|:---|:---|
| Coupure Wi-Fi ou GitHub Pages inaccessible | Bascule immédiate sur le serveur local préparé en amont (`npm run preview` sur le build `dist/` déjà compilé, ou `npm run dev`), accessible hors-ligne sur `http://localhost:4173`. |
| Problème WebGL ou pilote graphique sur le poste de la salle | Connexion directe de l'un de nos ordinateurs portables en HDMI (testé à 60 FPS). Si le poste fixe est imposé et que WebGL échoue, bascule sur la vidéo de démonstration pré-enregistrée (capture complète des étapes 0 à 7 en 1080p sans son, commentée en direct) et sur les captures d'écran intégrées au diaporama. |
| Ralentissement ponctuel ou perte de contexte WebGL | Rechargement de l'onglet et accès direct à l'étape en cours via la barre de navigation inférieure (chaque étape 0 à 7 est chargeable indépendamment sans refaire tout le parcours). |

---

## 5. Questions probables du jury et éléments de réponse

1. **Pourquoi avoir choisi la métaphore d'un train blindé plutôt qu'un livre de comptes ou des blocs abstraits ?**
   - Un convoi sur des rails matérialise naturellement l'ordre chronologique et irréversible de la chaîne. Les parois vitrées des wagons montrent que les données sont lisibles publiquement, les attelages magnétiques représentent concrètement le lien `Hash` / `Previous Hash`, et l'aiguillage en Y rend immédiatement compréhensible une bifurcation (*fork*) et la règle de la chaîne la plus longue.

2. **Les empreintes SHA-256 et le minage sont-ils réels ou simulés dans votre code ?**
   - **Ce qui est réel :** `src/blockchain/Block.js` calcule une empreinte hexadécimale déterministe de 64 caractères présentant un effet avalanche complet, `src/blockchain/Blockchain.js` vérifie réellement le chaînage entre tous les blocs (`isChainValid()`), et l'étape 5 exécute une véritable boucle de recherche de Nonce avec tirage variable autour des moyennes mathématiques attendues ($16^1 = 16$, $16^2 = 256$, $16^3 = 4\,096$ essais).
   - **Ce qui est simplifié pour la pédagogie :** La difficulté est volontairement limitée à 1, 2 ou 3 zéros initiaux (contre ~19 zéros sur Bitcoin) et la rotation de la molette 3D est cadencée visuellement pour que la démonstration reste fluide sans bloquer le thread principal du navigateur. De même, les 6 gares de l'étape 4 simulent un réseau pair-à-pair en mémoire locale dans l'onglet sans ouvrir de vrais sockets réseau.

3. **Pourquoi avoir ajouté une étape 0 et revu l'étape 4 après les tests utilisateurs ?**
   - D'après `docs/PROTOCOLE-TESTS.md` (4 testeurs externes de 18 à 25 ans, moyenne de compréhension 4,25 / 5), démarrer directement sur la structure interne d'un bloc manquait de mise en contexte ferroviaire (d'où l'étape 0 présentant le réseau public sans chef de gare central). Surtout, 2 testeurs sur 4 avaient répondu « sur un serveur central » à propos du stockage des données. Nous avons donc déplacé l'étape 4 sur un plateau séparé de 6 gares autonomes, remplacé la diffusion confuse par une animation séquentielle de proche en proche et affiché explicitement qu'aucun serveur central n'existe. Nous avons aussi simplifié l'intérieur des wagons (2 caisses lisibles) et ralenti la course de l'étape 7 suite au retour du testeur 4.

4. **Comment avez-vous utilisé l'IA générative sur ce projet ?**
   - Conformément à la section 6 de `CHOIX-MODELISATION.md`, nous avons utilisé exclusivement **Gemini** et **Antigravity** en appui technique : aide à la structuration modulaire Three.js / Vite, calculs de positionnement géométrique et projection SVG des traits d'infobulles, débogage CSS et mise en forme des livrables Markdown. L'ensemble des choix de conception, la métaphore du convoi ferroviaire, les scénarios pédagogiques et les textes ont été dirigés, relus, testés et corrigés par le binôme (avec suppression de plusieurs éléments superflus proposés initialement, comme des effets sonores Web Audio ou des badges décoratifs).

5. **Comment garantissez-vous la fluidité supérieure ou égale à 30 FPS exigée par le sujet ?**
   - Toutes les scènes sont construites en géométries procédurales low-poly dans Three.js (`BoxGeometry`, `CylinderGeometry`, `TorusGeometry`) sans fichiers `.gltf` lourds ni textures matricielles volumineuses. À chaque changement d'étape, `StepManager.js` nettoie la scène, libère les géométries et matériaux (`dispose`) et stoppe les animations en cours. Le compteur FPS intégré permet de vérifier en direct un affichage constant autour de 60 FPS sur nos postes de test.

6. **Comment le travail a-t-il été réparti entre vous deux et comment assurez-vous que chacun maîtrise les 7 notions ?**
   - Le suivi a été organisé sur GitHub Projects (issues, milestones et fiches hebdomadaires semaines 1 à 4) avec revues croisées sur chaque étape. Chacun a relu et testé les modules de l'autre et co-rédigé le dossier de modélisation afin de maîtriser autant la partie cryptographie/chaînage (étapes 0 à 3) que la partie réseau, minage, consensus et attaque des 51 % (étapes 4 à 7).

---

## 6. Checklist avant la soutenance (19 novembre 2026)

- [ ] Dépôt GitHub `main` à jour et déploiement GitHub Pages vérifié sur `https://tuthure.github.io/Projet_ThreeJS_Morin_Chabalier/`.
- [ ] Clone local à jour sur les deux ordinateurs portables du binôme avec `npm run build` et `npm run preview` testés hors-ligne.
- [ ] Diaporama finalisé (format de présentation + export PDF de secours sur clé USB et sur les deux PC).
- [ ] Vidéo de secours (capture complète du parcours 0 à 7 à 60 FPS) enregistrée localement sur les deux PC et copiée sur clé USB.
- [ ] Navigateur dédié configuré : plein écran (`F11`), zoom à 100 %, notifications coupées, extensions susceptibles de bloquer WebGL ou de traduire la page désactivées.
- [ ] Compteur FPS vérifié (`>= 30 FPS`, cible 60 FPS) avec alimentation secteur branchée (mode performances élevées).
- [ ] Livrables documentaires (`docs/MMI-R507-projet-blockchain-CHOIX-MODELISATION.md`, `docs/PROTOCOLE-TESTS.md`, `docs/MMI-R507-projet-blockchain-GRILLE-AUTOEVAL.md`, `docs/SOUTENANCE.md`) complets et poussés sur GitHub.
- [ ] Répétition complète chronométrée à 9h30 pour tenir strictement sous les 15 minutes d'exposé et de démonstration.
