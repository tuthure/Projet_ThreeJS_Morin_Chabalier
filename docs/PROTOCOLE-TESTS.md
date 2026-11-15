# BUT MMI 3e année — R507

## Projet Three.js — Visualisation pédagogique de la blockchain

### Protocole et résultats des tests utilisateurs

> **Statut :** Campagne de tests clôturée en 2 phases -- Phase 1 (4 testeurs externes : Testeur 1 à Testeur 4) et Phase 2 après application des correctifs (3 testeurs externes : Testeur 2.1, Testeur 2.2 et Testeur 2.3).

Ce document présente le cadre méthodologique utilisé par le binôme (Arthur Morin & Alban Chabalier) pour évaluer l'application **Le Convoi Ferroviaire Blindé** auprès d'utilisateurs extérieurs en totale autonomie à distance, ainsi que les résultats complets recueillis sur les deux phases et les correctifs apportés.

---

## 1. Objectif et profil des testeurs

### 1.1 Objectif de l'évaluation
Vérifier qu'un utilisateur non initié parvient à comprendre en autonomie les 7 notions obligatoires de la blockchain grâce à la métaphore du convoi ferroviaire, sans aucune explication préalable ni intervention extérieure, et identifier les éventuels points de friction ergonomiques, visuels ou pédagogiques.

### 1.2 Profil cible (Critères du sujet officiel)
- **Nombre minimum requis** : Au moins **2 personnes extérieures au groupe** (7 testeurs externes interrogés au total : 4 en Phase 1 et 3 en Phase 2 après correctifs).
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

### 6.2 Phase 2 (Clôturée -- Validation après correctifs : Testeur 2.1, Testeur 2.2 et Testeur 2.3)

Une deuxième phase de tests a été menée sur la version mise à jour suite aux premiers correctifs. Le tableau ci-dessous synthétise les retours complets et anonymisés des trois participants de cette phase (**Testeur 2.1**, **Testeur 2.2** et **Testeur 2.3**).

| Question / Critère | Réponse de Testeur 2.1 | Réponse de Testeur 2.2 | Réponse de Testeur 2.3 |
|:---|:---|:---|:---|
| **Avant cette expérience, quel était votre niveau sur la blockchain ?** | En avait entendu parler sans savoir comment ça marche (Découverte) | J'en avais entendu parler sans savoir comment ça marche | Aucune connaissance (découverte totale) |
| **Votre tranche d'âge** | 18 - 25 ans | 26 - 40 ans | Moins de 18 ans |
| **Sur quel support avez-vous fait le test ?** | Ordinateur | Ordinateur | Ordinateur |
| **D'après vous, à quoi sert l'empreinte numérique (ou Hash) d'un bloc ?** | **Juste** : *"C'est une signature unique qui change dès que le contenu du bloc est modifié"* | **Juste** : *"C'est une signature unique qui change dès que le contenu du bloc est modifié"* | **Juste** : *"C'est une signature unique qui change dès que le contenu du bloc est modifié"* |
| **Que se passe-t-il si quelqu'un tente de modifier une transaction passée ?** | **Juste** : *"Le lien avec les blocs suivants se brise et la falsification est visible par tout le monde"* | **Juste** : *"Le lien avec les blocs suivants se brise et la falsification est visible par tout le monde"* | **Juste** : *"Le lien avec les blocs suivants se brise et la falsification est visible par tout le monde"* |
| **Où les informations de la blockchain sont-elles enregistrées ?** | **Juste** : *"Dans une multitude de copies synchronisées et réparties sur tout le réseau (les gares / nœuds)"* | **Juste** : *"Dans une multitude de copies synchronisées et réparties sur tout le réseau (les gares / nœuds)"* | **Juste** : *"Dans une multitude de copies synchronisées et réparties sur tout le réseau (les gares / nœuds)"* |
| **Quel est le rôle principal du minage ?** | **Juste** : *"Rendre la validation coûteuse en calcul pour empêcher la triche"* | **Juste** : *"Rendre la validation coûteuse en calcul pour empêcher la triche"* | **Juste** : *"Rendre la validation coûteuse en calcul pour empêcher la triche"* |
| **En une ou deux phrases avec vos propres mots : comment décririez-vous la blockchain à un proche ?** | *"C'est un ensemble de blocs reliés entre eux, chacun possède un code unique calculé pour empêcher toute tentative de fraude."* | *"C'est un registre en ligne partagé ou toutes les transactions sont inscrites publiquement et impossibles à modifier. Ca permet de s'échanger des données en toute confiance, sans avoir besoin d'un service qui fait l'intermédiaire"* | *"C'est une suite de données sécurisées par plusieurs serveurs qui permettent le transfert de ressources sans pouvoir être falsifié"* |
| **La métaphore du convoi ferroviaire vous a-t-elle aidé à visualiser le fonctionnement ?** | *"Oui, cela rend les notions très concrètes"* | *"Oui, cela rend les notions très concrètes"* | *"Oui, cela rend les notions très concrètes"* |
| **Concernant les codes couleurs : les avez-vous compris ?** | *"Je les ai compris spontanément"* | *"Je les ai compris spontanément"* | *"Je les ai compris spontanément"* |
| **Avez-vous essayé d'interagir avec la scène 3D ?** | *"Oui, j'ai manipulé les éléments et testé les boutons"* | *"Oui, j'ai manipulé les éléments et testé les boutons"* | *"J'ai cliqué sur quelques boutons sans toucher à la 3D"* |
| **Y a-t-il une étape ou une animation qui vous a particulièrement marqué(e) ou paru très claire ?** | Étape 4 : *"L'étape où on voit les 6 gares reliées et comment elles se transfèrent les informations lorsqu'un nouveau bloc est créé"* | Étapes 4 et 6 : *"Les étapes 4 et 6 avec les gares et les animations de transactions envoyées et les wagons qui se font charger avec le nonce qui tourne. Pas mal puis ça dynamise le tout"* | *"Les étapes de 1 à 4 clean"* |
| **À l'inverse, y a-t-il un moment où vous vous êtes senti(e) perdu(e), confus(e) ou bloqué(e) ?** | Étape 5 : *"Je n'ai pas super bien compris le minage, il faudrait plus expliquer au début que c'est fait par les utilisateurs eux-mêmes et ce qu'ils doivent vraiment faire"* | *"Peut être quand on a parlé de triche au début, je comprenais pas le lien avec le train, mais j'ai fait le lien avec le domaine de la crypto par exemple ou c'est 'utile' de vouloir tricher et voila"* | *"Je ne comprends pas la métaphore des wagons qui s'attachent progressivement / Un peu plus de détails sur le bloc genesis? Comment il apparaît, ce qu'il représente concrètement etc / Qui tourne le nonce? / Pas compris le but de PoW et Pos"* |
| **Facilité à comprendre ce qu'il faut faire dès l'arrivée sur le site (Note de 1 à 5)** | **5 / 5** | **5 / 5** | **5 / 5** |
| **Clarté et lisibilité des textes dans le volet d'explication (Note de 1 à 5)** | **5 / 5** | **5 / 5** | **5 / 5** |
| **Équilibre entre le texte explicatif et l'animation 3D (Note de 1 à 5)** | **5 / 5** | **4 / 5** | **4 / 5** |
| **Fluidité de l'animation 3D sur votre écran** | Parfaitement fluide | Parfaitement fluide | Quelques légers ralentissements |
| **Pensez-vous avoir une meilleure compréhension de la blockchain après ce test ? (Note de 1 à 5)** | **4 / 5** | **5 / 5** | **3 / 5** |
| **Combien de temps avez-vous passé sur le site environ ?** | Entre 8 et 15 minutes | Entre 8 et 15 minutes | Plus de 15 minutes |
| **Si vous aviez une seule chose à améliorer ou modifier en priorité sur le site, ce serait quoi ?** | *"Quand on clique sur un bouton pour lancer une action, la barre sur le côté où apparaît le texte remonte tout en haut, ça serait plus pratique si elle restait à la position où elle était quand on a cliqué (sur les pages 4 et 5)"* | *"Peut être ajouter une outro pour faire la comparaison et le lien entre votre train et la crypto qui est un bon cas d'utilisation."* | *"Je pense qu'introduire plus de concret avant (et pendant si possible) le modèle du train serait utile"* |
| **Une dernière remarque libre, un bug remarqué ou autre chose ?** | - | - | *"étape 4: en sélectionnant A B et F par exemple, il indique 3/3 gares à jour alors que la F ne peut pas recevoir / Des isolements qui fonctionnent quand même en bref"* |

**Conclusion de la Phase 2 :** Avec **3 testeurs externes supplémentaires** (`Testeur 2.1`, `Testeur 2.2` et `Testeur 2.3`, répartis de moins de 18 ans à 40 ans), la Phase 2 atteint **100 % de réussite aux 4 QCM techniques (12 / 12 réponses exactes)** sur l'ensemble des participants (hash, immuabilité, stockage distribué sans serveur central et minage). La facilité de prise en main à l'arrivée et la clarté des textes obtiennent toutes deux une moyenne maximale de **5,0 / 5**, l'équilibre entre texte et 3D atteint **4,33 / 5**, et la note moyenne de compréhension perçue en Phase 2 s'établit à **4,0 / 5** (`(4 + 5 + 3) / 3`), incluant le profil totalement novice du `Testeur 2.3`. La suggestion du `Testeur 2.2` a été intégrée avec la création de l'**étape 8 (`src/steps/step8.js`)**, et les remarques très précises du `Testeur 2.3` ont permis d'effectuer une dernière passe de qualité : affichage explicite des contrôles caméra souris dès l'étape 0, détection réelle des gares isolées à l'étape 4 (en empêchant qu'une gare coupée du réseau soit marquée à jour) et approfondissement des explications concrètes aux étapes 0, 2, 5 et 6.

---

## 7. Synthèse des retours et correctifs appliqués

L'analyse des 4 retours de la **Phase 1** avait mis en évidence **une moyenne de compréhension globale de 4,25 / 5** et permis de déployer **5 premiers correctifs** (mention d'absence de serveur central à l'étape 4, épuration de l'intérieur des wagons, encadré sur le rôle du minage à l'étape 5, simplification de l'étape 7 et vulgarisation générale).

La **Phase 2 (`Testeur 2.1`, `Testeur 2.2` et `Testeur 2.3`)** confirme l'acquisition des concepts -- **12 / 12 (100 %) de réponses justes aux 4 QCM techniques**, **5,0 / 5 en facilité de prise en main et en clarté des textes**, **100 % de réussite sur la notion de décentralisation** et **4,0 / 5 de compréhension perçue moyenne** -- et a donné lieu aux derniers correctifs de clôture :

| Constat issu des tests | Phase / Testeurs concernés | Correctif implémenté dans l'application |
|:---|:---|:---|
| **50 % des testeurs ont répondu "serveur central"** à la question sur l'enregistrement des données. | Phase 1 : Testeur 3, Testeur 4 | **Étape 4 (`step4.js`)** : ajout d'une mention explicite en gras (*"Il n'y a AUCUN serveur central ou entreprise qui gère le réseau."*) et insistance dans les textes et les étiquettes 3D sur le fait que *chaque gare* détient sa propre copie intégrale. |
| **Intérieur des wagons jugé confus ("effet tunnel")** à travers la verrière. | Phase 1 : Testeur 2 | **Modélisation (`WagonMesh.js`)** : réduction du nombre d'éléments superposés à l'intérieur des wagons pour ne conserver que deux caisses bien lisibles et espacées, et allègement visuel de l'opacité du vitrage. |
| **Le rôle du minage reste incompris** par un participant novice ("je ne sais pas"). | Phase 1 : Testeur 3 | **Étape 5 (`step5.js`)** : mise en avant d'un encadré pédagogique expliquant clairement que le minage ne sert pas à créer de l'argent, mais à rendre la validation mathématiquement coûteuse pour empêcher les tricheurs de réécrire l'historique. |
| **Blocage / perte de repères à l'étape 7** lors de la course entre les deux voies. | Phase 1 : Testeur 4 | **Étape 7 (`step7.js`)** : raccourcissement et simplification des phrases du volet gauche, et ralentissement de la course / du train pirate par rapport au train honnête pour laisser le temps d'observer l'aiguillage. |
| **Termes jugés trop abstraits ou techniques** sur certaines notions. | Phase 1 : Testeur 1, Testeur 2 | **Étapes 1 à 7 (`src/steps/`)** : passe de vulgarisation globale sur l'ensemble des textes pour adopter un vocabulaire courant accessible à un public collège. |
| **Acteurs du minage pas assez explicites au début de l'étape 5.** | Phase 2 : Testeur 2.1, Testeur 2.3 | **Étape 5 (`step5.js`)** : précision explicite dès la première phrase indiquant que les ordinateurs des gares (les mineurs) tournent la molette du Nonce par milliards d'essais automatiques, et que l'utilisateur joue le rôle d'un opérateur. |
| **Remontée en haut du volet latéral gauche lors du clic sur un bouton d'action** (étapes 4 et 5). | Phase 2 : Testeur 2.1 | **Navigation et volet gauche (`StepManager.js`, `step2.js` à `step7.js`)** : sauvegarde et restauration automatique de la position de défilement (`scrollTop`) du panneau latéral lors des clics sur les boutons d'action, avec défilement fluide vers le bloc de résultat. |
| **Absence de passerelle finale vers l'usage concret en cryptomonnaie (et pourquoi un fraudeur voudrait tricher).** | Phase 2 : Testeur 2.2 | **Étape 8 — Outro (`step8.js`, `StepManager.js`, `index.html`)** : création d'une étape finale dédiée avec mise en scène 3D comparative côte à côte (wagon et gare face à un bloc numérique translucide contenant des jetons et des nœuds serveurs, reliés par faisceaux et étiquettes) reliant directement la métaphore ferroviaire aux transactions en cryptomonnaie. |
| **Manque de guidage caméra à la souris et d'introduction concrète avant la métaphore du train (et détails sur le Bloc Genesis).** | Phase 2 : Testeur 2.3 | **Étape 0 (`step0.js`, `style.css`)** : ajout d'un encadré dans le volet gauche et d'un bandeau en bas de la scène indiquant les contrôles souris (clic gauche + glisser, molette), d'un paragraphe d'ouverture sur l'usage réel sans banque/tiers de confiance, et d'une explication détaillée du Bloc Genesis (#0). |
| **Incompréhension de l'attelage progressif des wagons et de l'objectif du consensus (PoW / PoS).** | Phase 2 : Testeur 2.3 | **Étapes 2 et 6 (`step2.js`, `step6.js`)** : ajout à l'étape 2 d'une explication sur le regroupement périodique des transactions en nouveaux wagons (ex. toutes les 10 minutes sur Bitcoin) et ajout en tête de l'étape 6 d'un encadré expliquant pourquoi le consensus est nécessaire pour départager les gares sans chef central. |
| **Bug de propagation réseau à l'étape 4 lorsqu'une gare reste isolée** (ex. A, B et F allumées avec D et E en panne comptabilisées `3/3 gares à jour`). | Phase 2 : Testeur 2.3 | **Étape 4 (`step4.js`, `style.css`)** : calcul d'accessibilité réel par parcours en largeur (BFS) depuis la gare source ; les gares allumées coupées du réseau passent à l'état ambre `Isolée`, ne reçoivent pas de faisceau, sont exclues du compteur de synchronisation (`2 / 3 gares actives à jour (1 isolée)`), affichent un message explicite et se resynchronisent automatiquement dès qu'une gare relais est rallumée. |
