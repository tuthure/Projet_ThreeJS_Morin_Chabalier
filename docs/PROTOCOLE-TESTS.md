# BUT MMI 3e année — R507

## Projet Three.js — Visualisation pédagogique de la blockchain

### Protocole et résultats des tests utilisateurs

> **Statut :** Campagne de tests structurée en 2 phases — Phase 1 terminée (4 testeurs externes : Testeur 1 à Testeur 4) et Phase 2 en cours après application des premiers correctifs (Testeur 2.1).

Ce document présente le cadre méthodologique utilisé par le binôme (Arthur Morin & Alban Chabalier) pour évaluer l'application **Le Convoi Ferroviaire Blindé** auprès d'utilisateurs extérieurs en totale autonomie à distance, ainsi que les résultats complets recueillis sur les deux phases et les correctifs apportés.

---

## 1. Objectif et profil des testeurs

### 1.1 Objectif de l'évaluation
Vérifier qu'un utilisateur non initié parvient à comprendre en autonomie les 7 notions obligatoires de la blockchain grâce à la métaphore du convoi ferroviaire, sans aucune explication préalable ni intervention extérieure, et identifier les éventuels points de friction ergonomiques, visuels ou pédagogiques.

### 1.2 Profil cible (Critères du sujet officiel)
- **Nombre minimum requis** : Au moins **2 personnes extérieures au groupe** (5 testeurs externes interrogés au total : 4 en Phase 1 et 1 en Phase 2 après correctifs).
- **Profil** : Personnes n'ayant pas suivi le cours R507 et ne disposant pas de connaissances techniques préalables sur le fonctionnement d'une blockchain.
- **Matériel de test** : Ordinateur personnel standard équipé d'un navigateur web récent, en accédant directement au site déployé sur GitHub Pages.

---

## 2. Liens transmis pour la passation à distance

- **Application en ligne** : https://tuthure.github.io/Projet_ThreeJS_Morin_Chabalier/
- **Formulaire d'évaluation (Google Forms)** : https://forms.gle/SrQx1cJVSrnMt7sc9

---

## 3. Conditions de passation (autonomie complète à distance)

Tous les tests ont été réalisés **à distance et en totale autonomie** par chaque participant, selon les principes suivants :

1. **Aucune explication ni assistance** : Les testeurs n'ont reçu aucune explication orale ou écrite préalable sur la blockchain et n'ont pas été accompagnés ni guidés pendant leur navigation.
2. **Découverte libre** : Chaque participant a parcouru à son rythme l'écran d'accueil et les étapes 0 à 7, avec la liberté d'explorer la scène 3D (rotation caméra, infobulles, boutons d'action, molette du Nonce, gares du réseau).
3. **Évaluation asynchrone via formulaire** : Une fois l'exploration terminée, le testeur a rempli seul le questionnaire Google Forms afin de mesurer sa compréhension réelle et son ressenti ergonomique.
4. **Performance sur poste standard** : L'application intègre un compteur de FPS en haut à gauche permettant de vérifier le maintien d'une fluidité constante supérieure ou égale à **30 FPS**.

---

## 4. Déroulé type d'une passation à distance

| Phase | Durée indicative | Déroulement |
|:---|:---:|:---|
| **1. Réception des liens** | - | Transmission au testeur du lien vers l'application en ligne et du lien vers le Google Forms, sans aucune consigne technique sur le sujet. |
| **2. Exploration autonome (Étapes 0 à 7)** | 4 à 15 min | Parcours libre et individuel sur ordinateur personnel, sans aucune intervention extérieure. |
| **3. Questionnaire Google Forms** | 5 min | Remplissage autonome du formulaire en ligne à l'issue du parcours pour évaluer les notions retenues et le confort d'utilisation. |
| **4. Exploitation des retours** | - | Analyse des réponses collectées et mise en place des correctifs UX, 3D et rédactionnels sur le dépôt. |

---

## 5. Questionnaire complet soumis aux testeurs (Google Forms)

- **Section 1 : Votre profil**
  - Avant cette expérience, quel était votre niveau sur la blockchain ?
  - Votre tranche d'âge
  - Sur quel support avez-vous fait le test ?
- **Section 2 : Ce que vous avez retenu**
  - D'après vous, à quoi sert l'empreinte numérique (ou Hash) d'un bloc ?
  - Que se passe-t-il si quelqu'un tente de modifier une transaction passée ?
  - Où les informations de la blockchain sont-elles enregistrées ?
  - Quel est le rôle principal du minage ?
  - En une ou deux phrases avec vos propres mots : comment décririez-vous la blockchain à un proche ?
- **Section 3 : La métaphore visuelle et l'interactivité**
  - La métaphore du convoi ferroviaire vous a-t-elle aidé à visualiser le fonctionnement ?
  - Concernant les codes couleurs : les avez-vous compris ?
  - Avez-vous essayé d'interagir avec la scène 3D ?
  - Y a-t-il une étape ou une animation qui vous a particulièrement marqué(e) ou paru très claire ?
  - À l'inverse, y a-t-il un moment où vous vous êtes senti(e) perdu(e), confus(e) ou bloqué(e) ?
- **Section 4 : Ergonomie et confort de lecture**
  - Facilité à comprendre ce qu'il faut faire dès l'arrivée sur le site (Note de 1 à 5)
  - Clarté et lisibilité des textes dans le volet d'explication (Note de 1 à 5)
  - Équilibre entre le texte explicatif et l'animation 3D (Note de 1 à 5)
  - Fluidité de l'animation 3D sur votre écran
- **Section 5 : Bilan global**
  - Pensez-vous avoir une meilleure compréhension de la blockchain après ce test ? (Note de 1 à 5)
  - Combien de temps avez-vous passé sur le site environ ?
  - Si vous aviez une seule chose à améliorer ou modifier en priorité sur le site, ce serait quoi ?
  - Une dernière remarque libre, un bug remarqué ou autre chose ?

---

## 6. Résultats observés

### 6.1 Phase 1 (Terminée — 4 testeurs externes : Testeur 1 à Testeur 4)

Le tableau suivant rassemble les réponses recueillies lors de la première campagne auprès de 4 testeurs externes à l'issue de leur parcours autonome à distance.

| Question / Critère | Testeur 1 | Testeur 2 | Testeur 3 | Testeur 4 |
|:---|:---|:---|:---|:---|
| **Avant cette expérience, quel était votre niveau sur la blockchain ?** | Découverte totale | En avait entendu parler | Découverte totale | Découverte totale |
| **Votre tranche d'âge** | 18-25 ans | 18-25 ans | 18-25 ans | 18-25 ans |
| **Sur quel support avez-vous fait le test ?** | Ordinateur | Ordinateur | Ordinateur | Ordinateur |
| **D'après vous, à quoi sert l'empreinte numérique (ou Hash) d'un bloc ?** | Juste (notion comprise, quelques détails restent abstraits) | Juste (réponse technique exacte) | Réponse partielle | Juste (étape 1 particulièrement appréciée) |
| **Que se passe-t-il si quelqu'un tente de modifier une transaction passée ?** | Juste (rupture comprise, quelques détails restent abstraits) | Juste (a retenu la rupture des wagons) | Réponse partielle | Juste |
| **Où les informations de la blockchain sont-elles enregistrées ?** | Juste (quelques détails restent abstraits) | Juste (réponse technique exacte) | Erreur : a répondu "serveur central" | Erreur : a répondu "serveur central" |
| **Quel est le rôle principal du minage ?** | Juste (animation du Nonce très appréciée) | Juste (réponse technique exacte) | Erreur : a répondu "je ne sais pas" | Réponse partielle |
| **En une ou deux phrases avec vos propres mots : comment décririez-vous la blockchain à un proche ?** | Explication globalement juste, quelques détails abstraits | Explication juste et précise | Explication incomplète sur le réseau et le minage | Explication juste sur la structure, confuse sur le réseau |
| **La métaphore du convoi ferroviaire vous a-t-elle aidé à visualiser le fonctionnement ?** | Oui, aide à visualiser (certains détails restent abstraits) | Oui, très parlante sur la rupture des wagons | Avis mitigé (parcours suivi sans approfondir la 3D) | Oui, notamment aux étapes 1 et 4 |
| **Concernant les codes couleurs : les avez-vous compris ?** | Compris dans l'ensemble | Compris dans l'ensemble | Non précisé | Compris dans l'ensemble |
| **Avez-vous essayé d'interagir avec la scène 3D ?** | Oui (molette du Nonce, étapes interactives) | Oui (observation de l'intérieur et des ruptures) | Non : n'a pas beaucoup interagi avec la 3D au-delà du défilement des étapes | Oui aux étapes 1 et 4, bloqué sur l'étape 7 |
| **Y a-t-il une étape ou une animation qui vous a particulièrement marqué(e) ou paru très claire ?** | Animation du Nonce (étape 5) et étape PoW vs PoS (étape 6) | Rupture des wagons (étape 3) | Site jugé "très simplifié" | Étape 1 (Structure d'un bloc) et étape 4 (Réseau) |
| **À l'inverse, y a-t-il un moment où vous vous êtes senti(e) perdu(e), confus(e) ou bloqué(e) ?** | Certains détails restent abstraits | Intérieur des wagons trop confus ("effet tunnel") | Notion de réseau décentralisé et rôle du minage non acquis | Perdu / bloqué à l'étape 7 |
| **Facilité à comprendre ce qu'il faut faire dès l'arrivée sur le site (Note de 1 à 5)** | 5/5 | 5/5 | 3/5 | 4/5 |
| **Clarté et lisibilité des textes dans le volet d'explication (Note de 1 à 5)** | 5/5 | 4/5 (suggère de simplifier le vocabulaire) | 5/5 | 4/5 (claire au début, insuffisante à l'étape 7) |
| **Équilibre entre le texte explicatif et l'animation 3D (Note de 1 à 5)** | 5/5 | 5/5 | 5/5 (mais a signalé ne pas avoir beaucoup interagi avec la 3D) | 5/5 (mais trop confus à l'étape 7) |
| **Fluidité de l'animation 3D sur votre écran** | Fluide (aucun ralentissement signalé) | Fluide (aucun ralentissement signalé) | Fluide (aucun ralentissement signalé) | Fluide (aucun ralentissement signalé) |
| **Pensez-vous avoir une meilleure compréhension de la blockchain après ce test ? (Note de 1 à 5)** | 5/5 | 5/5 | 3/5 | 4/5 |
| **Combien de temps avez-vous passé sur le site environ ?** | 8-15 min | 4-8 min | 4-8 min | 8-15 min |
| **Si vous aviez une seule chose à améliorer ou modifier en priorité sur le site, ce serait quoi ?** | Essayer de rendre moins abstraits certains éléments (si faisable). | Épurer l'intérieur des wagons ("effet tunnel") et simplifier encore les textes pour les rendre compréhensibles par un enfant. | Mieux expliquer l'utilité du minage. | |
| **Une dernière remarque libre, un bug remarqué ou autre chose ?** | Animation du Nonce et PoW/PoS très appréciées. | Rupture des wagons très efficace visuellement. | Trouve le site "très simplifié". | |

---

### 6.2 Phase 2 (En cours — Validation après correctifs : Testeur 2.1)

Une deuxième phase de tests est engagée sur la version mise à jour suite aux 5 premiers correctifs. Le tableau ci-dessous synthétise le retour complet et anonymisé du premier testeur de cette phase (**Testeur 2.1**).

| Question / Critère | Réponse de Testeur 2.1 |
|:---|:---|
| **Avant cette expérience, quel était votre niveau sur la blockchain ?** | En avait entendu parler sans savoir comment ça marche (Découverte) |
| **Votre tranche d'âge** | 18 - 25 ans |
| **Sur quel support avez-vous fait le test ?** | Ordinateur (PC / Mac) |
| **D'après vous, à quoi sert l'empreinte numérique (ou Hash) d'un bloc ?** | **Juste** : *"C'est une signature unique qui change dès que le contenu du bloc est modifié"* |
| **Que se passe-t-il si quelqu'un tente de modifier une transaction passée ?** | **Juste** : *"Le lien avec les blocs suivants se brise et la falsification est visible par tout le monde"* |
| **Où les informations de la blockchain sont-elles enregistrées ?** | **Juste** : *"Dans une multitude de copies synchronisées et réparties sur tout le réseau (les gares / nœuds)"* (100 % de réussite sur la décentralisation en Phase 2 contre 50 % en Phase 1) |
| **Quel est le rôle principal du minage ?** | **Juste** : *"Rendre la validation coûteuse en calcul pour empêcher la triche"* |
| **En une ou deux phrases avec vos propres mots : comment décririez-vous la blockchain à un proche ?** | *"C'est un ensemble de blocs reliés entre eux, chacun possède un code unique calculé pour empêcher toute tentative de fraude."* |
| **La métaphore du convoi ferroviaire vous a-t-elle aidé à visualiser le fonctionnement ?** | *"Oui, cela rend les notions très concrètes"* |
| **Concernant les codes couleurs : les avez-vous compris ?** | *"Je les ai compris spontanément"* |
| **Avez-vous essayé d'interagir avec la scène 3D ?** | *"Oui, j'ai manipulé les éléments et testé les boutons"* |
| **Y a-t-il une étape ou une animation qui vous a particulièrement marqué(e) ou paru très claire ?** | Étape 4 : *"L'étape où on voit les 6 gares reliées et comment elles se transfèrent les informations lorsqu'un nouveau bloc est créé"* |
| **À l'inverse, y a-t-il un moment où vous vous êtes senti(e) perdu(e), confus(e) ou bloqué(e) ?** | Étape 5 : *"Je n'ai pas super bien compris le minage, il faudrait plus expliquer au début que c'est fait par les utilisateurs eux-mêmes et ce qu'ils doivent vraiment faire"* |
| **Facilité à comprendre ce qu'il faut faire dès l'arrivée sur le site (Note de 1 à 5)** | **5 / 5** |
| **Clarté et lisibilité des textes dans le volet d'explication (Note de 1 à 5)** | **5 / 5** |
| **Équilibre entre le texte explicatif et l'animation 3D (Note de 1 à 5)** | **5 / 5** |
| **Fluidité de l'animation 3D sur votre écran** | Parfaitement fluide |
| **Pensez-vous avoir une meilleure compréhension de la blockchain après ce test ? (Note de 1 à 5)** | **4 / 5** |
| **Combien de temps avez-vous passé sur le site environ ?** | Entre 8 et 15 minutes |
| **Si vous aviez une seule chose à améliorer ou modifier en priorité sur le site, ce serait quoi ?** | *"Quand on clique sur un bouton pour lancer une action, la barre sur le côté où apparaît le texte remonte tout en haut, ça serait plus pratique si elle restait à la position où elle était quand on a cliqué (sur les pages 4 et 5)"* |

---

## 7. Synthèse des retours et correctifs appliqués

L'analyse des 4 retours de la **Phase 1** avait mis en évidence **une moyenne de compréhension globale de 4,25 / 5** et permis de déployer **5 premiers correctifs** (mention d'absence de serveur central à l'étape 4, épuration de l'intérieur des wagons, encadré sur le rôle du minage à l'étape 5, simplification de l'étape 7 et vulgarisation générale).

Les premiers retours de la **Phase 2 (`Testeur 2.1`)** confirment l'efficacité de ces corrections — avec **4 / 4 (100 %) aux questions techniques QCM**, **5 / 5 en ergonomie et clarté des textes** et **100 % de réussite sur la notion de décentralisation** — tout en permettant d'apporter **2 nouveaux correctifs ciblés** :

| Constat issu des tests | Phase / Testeurs concernés | Correctif implémenté dans l'application |
|:---|:---|:---|
| **50 % des testeurs ont répondu "serveur central"** à la question sur l'enregistrement des données. | Phase 1 : Testeur 3, Testeur 4 | **Étape 4 (`step4.js`)** : ajout d'une mention explicite en gras (*"Il n'y a AUCUN serveur central ou entreprise qui gère le réseau."*) et insistance dans les textes et les étiquettes 3D sur le fait que *chaque gare* détient sa propre copie intégrale. |
| **Intérieur des wagons jugé confus ("effet tunnel")** à travers la verrière. | Phase 1 : Testeur 2 | **Modélisation (`WagonMesh.js`)** : réduction du nombre d'éléments superposés à l'intérieur des wagons pour ne conserver que deux caisses bien lisibles et espacées, et allègement visuel de l'opacité du vitrage. |
| **Le rôle du minage reste incompris** par un participant novice ("je ne sais pas"). | Phase 1 : Testeur 3 | **Étape 5 (`step5.js`)** : mise en avant d'un encadré pédagogique expliquant clairement que le minage ne sert pas à créer de l'argent, mais à rendre la validation mathématiquement coûteuse pour empêcher les tricheurs de réécrire l'historique. |
| **Blocage / perte de repères à l'étape 7** lors de la course entre les deux voies. | Phase 1 : Testeur 4 | **Étape 7 (`step7.js`)** : raccourcissement et simplification des phrases du volet gauche, et ralentissement de la course / du train pirate par rapport au train honnête pour laisser le temps d'observer l'aiguillage. |
| **Termes jugés trop abstraits ou techniques** sur certaines notions. | Phase 1 : Testeur 1, Testeur 2 | **Étapes 1 à 7 (`src/steps/`)** : passe de vulgarisation globale sur l'ensemble des textes pour adopter un vocabulaire courant accessible à un public collège. |
| **Acteurs du minage pas assez explicites au début de l'étape 5.** | Phase 2 : Testeur 2.1 | **Étape 5 (`step5.js`)** : ajout dès la première phrase explicative d'une précision indiquant que le minage est réalisé directement par les gares du réseau (via leurs ordinateurs) qui font tourner leur molette pour tester des milliers de combinaisons jusqu'à verrouiller le wagon. |
| **Remontée en haut du volet latéral gauche lors du clic sur un bouton d'action** (étapes 4 et 5). | Phase 2 : Testeur 2.1 | **Navigation et volet gauche (`StepManager.js`, `step2.js` à `step7.js`)** : sauvegarde et restauration automatique de la position de défilement (`scrollTop`) du panneau latéral lors des clics sur les boutons d'action, avec défilement fluide vers le bloc de résultat. |
