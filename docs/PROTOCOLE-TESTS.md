# BUT MMI 3e année — R507

## Projet Three.js — Visualisation pédagogique de la blockchain

### Protocole et résultats des tests utilisateurs

Ce document présente le cadre méthodologique utilisé par le binôme (Arthur Morin & Alban Chabalier) pour évaluer l'application **Le Convoi Ferroviaire Blindé** auprès d'utilisateurs extérieurs en totale autonomie à distance, ainsi que les résultats complets recueillis et les correctifs apportés.

---

## 1. Objectif et profil des testeurs

### 1.1 Objectif de l'évaluation
Vérifier qu'un utilisateur non initié parvient à comprendre en autonomie les 7 notions obligatoires de la blockchain grâce à la métaphore du convoi ferroviaire, sans aucune explication préalable ni intervention extérieure, et identifier les éventuels points de friction ergonomiques, visuels ou pédagogiques.

### 1.2 Profil cible (Critères du sujet officiel)
- **Nombre minimum requis** : Au moins **2 personnes extérieures au groupe** (4 testeurs externes interrogés lors de notre campagne).
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

## 6. Tableau récapitulatif des résultats (4 testeurs externes)

Le tableau suivant rassemble les réponses recueillies auprès des 4 testeurs externes à l'issue de leur parcours autonome à distance.

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

## 7. Synthèse des retours et correctifs appliqués

L'analyse des 4 retours met en évidence **une moyenne de compréhension globale de 4,25 / 5**, une validation nette des mécaniques visuelles phares (molette du Nonce, rupture des attelages, comparaison PoW vs PoS), ainsi que **5 axes d'amélioration prioritaires** immédiatement traités :

| Constat issu des tests | Testeurs concernés | Correctif implémenté dans l'application |
|:---|:---|:---|
| **50 % des testeurs ont répondu "serveur central"** à la question sur l'enregistrement des données. | Testeur 3, Testeur 4 | **Étape 4 (`step4.js`)** : ajout d'une mention explicite en gras (*"Il n'y a AUCUN serveur central ou entreprise qui gère le réseau."*) et insistance dans les textes et les étiquettes 3D sur le fait que *chaque gare* détient sa propre copie intégrale. |
| **Intérieur des wagons jugé confus ("effet tunnel")** à travers la verrière. | Testeur 2 | **Modélisation (`WagonMesh.js`)** : réduction du nombre d'éléments superposés à l'intérieur des wagons pour ne conserver que deux caisses bien lisibles et espacées, et allègement visuel de l'opacité du vitrage. |
| **Le rôle du minage reste incompris** par un participant novice ("je ne sais pas"). | Testeur 3 | **Étape 5 (`step5.js`)** : mise en avant d'un encadré pédagogique expliquant clairement que le minage ne sert pas à créer de l'argent, mais à rendre la validation mathématiquement coûteuse pour empêcher les tricheurs de réécrire l'historique. |
| **Blocage / perte de repères à l'étape 7** lors de la course entre les deux voies. | Testeur 4 | **Étape 7 (`step7.js`)** : raccourcissement et simplification des phrases du volet gauche, et ralentissement de la course / du train pirate par rapport au train honnête pour laisser le temps d'observer l'aiguillage. |
| **Termes jugés trop abstraits ou techniques** sur certaines notions. | Testeur 1, Testeur 2 | **Étapes 1 à 7 (`src/steps/`)** : passe de vulgarisation globale sur l'ensemble des textes pour adopter un vocabulaire courant accessible à un public collège. |
