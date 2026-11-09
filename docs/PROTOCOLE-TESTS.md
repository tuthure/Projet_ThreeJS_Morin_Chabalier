# BUT MMI 3e année — R507

## Projet Three.js — Visualisation pédagogique de la blockchain

### Protocole de passation des tests utilisateurs

Ce document définit le protocole méthodologique utilisé par le binôme (Arthur Morin & Alban Chabalier) pour évaluer l'application **Le Convoi Ferroviaire Blindé** auprès d'utilisateurs extérieurs.

---

## 1. Objectif et profil des testeurs

### 1.1 Objectif de l'évaluation
Vérifier qu'un utilisateur non initié parvient à comprendre en autonomie les 7 notions obligatoires de la blockchain grâce à la métaphore du convoi ferroviaire, sans aucune explication orale préalable, et identifier les éventuels points de friction ergonomiques ou visuels.

### 1.2 Profil cible (Critères du sujet officiel)
- **Nombre minimum requis** : Au moins **2 personnes extérieures au groupe**.
- **Profil** : Personnes n'ayant pas suivi le cours R507 et ne disposant pas de connaissances techniques préalables sur le fonctionnement d'une blockchain.
- **Matériel de test** : Ordinateur standard type poste de TP avec un navigateur web récent, en utilisant le lien déployé en ligne sur GitHub Pages.

---

## 2. Liens utilisés pour la session

- **Application en ligne à ouvrir par le testeur** : https://tuthure.github.io/Projet_ThreeJS_Morin_Chabalier/
- **Formulaire d'évaluation à envoyer aux testeurs (Google Forms)** : https://forms.gle/SrQx1cJVSrnMt7sc9

---

## 3. Consignes strictes pour l'animateur (Arthur Morin / Alban Chabalier)

Pendant toute la durée du parcours (de l'écran d'accueil jusqu'à l'étape 7), le membre du binôme qui observe la session doit respecter les règles suivantes :

1. **Aucune explication orale préalable ni pendant le parcours** : Ne pas expliquer ce qu'est un bloc, un hash, un nonce ou un consensus avant ou pendant l'essai. L'interface et les animations 3D doivent se suffire à elles-mêmes.
2. **Laisser l'utilisateur interagir librement** : Laisser le testeur naviguer à son rythme entre les étapes (0 à 7), manipuler la caméra 3D et déclencher lui-même les boutons d'action ou les éléments cliquables en 3D (molette du Nonce, gares du réseau).
3. **Méthode de la pensée à voix haute (Think Aloud)** : Demander au testeur dès le départ d'exprimer tout haut ce qu'il voit, ce qu'il comprend de la scène 3D et ce qu'il cherche à faire lorsqu'il clique sur un élément.
4. **Chronométrage et relevé des blocages (> 30 secondes)** : Noter précisément toute hésitation ou tout blocage dépassant **30 secondes** (ex : difficulté à repérer un bouton d'action, incompréhension d'une infobulle 3D, doute sur la façon de passer à l'étape suivante). N'intervenir qu'au-delà de ce délai si l'utilisateur est totalement bloqué, en notant l'incident comme un problème UX à corriger.
5. **Relevé des performances (FPS)** : Relever la valeur affichée par le compteur de FPS en haut à gauche de l'écran sur chaque étape (objectif obligatoire : **au moins 30 FPS** constants sur machine standard, sans saccade gênant la compréhension).

---

## 4. Déroulé type d'une session de test (15 à 20 minutes)

| Phase | Durée indicative | Déroulement |
|:---|:---:|:---|
| **1. Accueil neutre** | 1 min | Installation devant le poste, ouverture du lien GitHub Pages sur l'écran d'accueil. Consigne unique : *"Explore l'application jusqu'à l'étape 7 en disant à voix haute ce que tu comprends."* |
| **2. Parcours autonome (Étapes 0 à 7)** | 10 à 12 min | Observation silencieuse par l'animateur. Prise de notes sur la grille d'observation (hésitations > 30 s, remarques spontanées, lecture des infobulles SVG, FPS relevés). |
| **3. Questionnaire Google Forms** | 5 min | À la fin de l'étape 7, le testeur remplit le formulaire en ligne (https://forms.gle/SrQx1cJVSrnMt7sc9) pour évaluer la clarté de chaque notion sans aide. |
| **4. Débriefing et création d'issues** | 2 min | Échange libre sur les points de friction ressentis. Chaque problème observé est consigné dans `CHOIX-MODELISATION.md` et converti en issue corrective dans GitHub Projects. |

---

## 5. Grille d'observation animateur (modèle de prise de notes)

| Étape observée | Action attendue de l'utilisateur | Blocage > 30 s ? (Oui / Non) | FPS relevés | Observations / Verbatims du testeur | Issue corrective créée |
|:---|:---|:---:|:---:|:---|:---|
| **Accueil & Étape 0** | Lancer l'exploration et comprendre les 3 éléments (motrice, wagons, attelages) | | | | |
| **Étape 1 — Structure du bloc** | Parcourir les 4 composants du wagon, changer le chargement et tourner le Nonce | | | | |
| **Étape 2 — Chaînage** | Observer la correspondance des couleurs de Hash et ajouter un wagon | | | | |
| **Étape 3 — Immutabilité** | Modifier la cargaison du Wagon #1 et constater la rupture de l'attelage | | | | |
| **Étape 4 — Réseau** | Propager une transaction entre les gares et cliquer sur une gare en 3D pour l'éteindre | | | | |
| **Étape 5 — Minage** | Tourner la molette du Nonce (ou lancer le minage) pour obtenir les zéros requis | | | | |
| **Étape 6 — PoW vs PoS** | Comparer la course des 3 molettes (PoW) et la loterie sur caution (PoS) | | | | |
| **Étape 7 — Attaque 51 %** | Tester le cas normal (20 %) puis l'attaque majoritaire (51 %) sur l'aiguillage en Y | | | | |
