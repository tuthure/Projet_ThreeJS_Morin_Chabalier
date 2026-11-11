# BUT MMI 3e année — R507

## Projet Three.js — Visualisation pédagogique de la blockchain

### Protocole et résultats des tests utilisateurs

Ce document définit le protocole méthodologique utilisé par le binôme (Arthur Morin & Alban Chabalier) pour évaluer l'application **Le Convoi Ferroviaire Blindé** auprès d'utilisateurs extérieurs, puis synthétise les retours recueillis lors des sessions de test et les correctifs associés.

---

## 1. Objectif et profil des testeurs

### 1.1 Objectif de l'évaluation
Vérifier qu'un utilisateur non initié parvient à comprendre en autonomie les 7 notions obligatoires de la blockchain grâce à la métaphore du convoi ferroviaire, sans aucune explication orale préalable, et identifier les éventuels points de friction ergonomiques, visuels ou pédagogiques.

### 1.2 Profil cible (Critères du sujet officiel)
- **Nombre minimum requis** : Au moins **2 personnes extérieures au groupe** (4 testeurs externes interrogés dans notre campagne).
- **Profil** : Personnes n'ayant pas suivi le cours R507 et ne disposant pas de connaissances techniques préalables sur le fonctionnement d'une blockchain.
- **Matériel de test** : Ordinateur standard avec un navigateur web récent, en utilisant le lien déployé en ligne sur GitHub Pages.

---

## 2. Liens utilisés pour la session

- **Application en ligne à ouvrir par le testeur** : https://tuthure.github.io/Projet_ThreeJS_Morin_Chabalier/
- **Formulaire d'évaluation envoyé aux testeurs (Google Forms)** : https://forms.gle/SrQx1cJVSrnMt7sc9

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
| **2. Parcours autonome (Étapes 0 à 7)** | 4 à 15 min | Observation silencieuse par l'animateur. Navigation autonome du testeur de l'étape 0 à l'étape 7. |
| **3. Questionnaire Google Forms** | 5 min | À la fin de l'étape 7, le testeur remplit le formulaire en ligne (https://forms.gle/SrQx1cJVSrnMt7sc9) pour évaluer la clarté de chaque notion sans aide. |
| **4. Débriefing et création d'issues** | 2 min | Échange libre sur les points de friction ressentis. Chaque problème observé est consigné dans ce protocole et converti en correctif applicatif. |

---

## 5. Grille d'observation animateur (modèle de prise de notes)

| Étape observée | Action attendue de l'utilisateur | Blocage > 30 s ? (Oui / Non) | FPS relevés | Observations / Verbatims du testeur | Issue corrective créée |
|:---|:---|:---:|:---:|:---|:---|
| **Accueil & Étape 0** | Lancer l'exploration et comprendre les 3 éléments (motrice, wagons, attelages) | | | | |
| **Étape 1 — Structure du bloc** | Parcourir les 4 composants du wagon et observer le rôle de chacun | | | | |
| **Étape 2 — Chaînage** | Observer la correspondance des couleurs de Hash et ajouter un wagon | | | | |
| **Étape 3 — Immuabilité** | Modifier les transactions du Wagon #1 et constater la rupture de l'attelage | | | | |
| **Étape 4 — Réseau** | Propager une transaction entre les gares et cliquer sur une gare en 3D pour l'éteindre | | | | |
| **Étape 5 — Minage** | Tourner la molette du Nonce (ou lancer le minage) pour obtenir les zéros requis | | | | |
| **Étape 6 — PoW vs PoS** | Comparer la course des 3 molettes (PoW) et la loterie sur caution (PoS) | | | | |
| **Étape 7 — Attaque 51 %** | Tester le cas normal (20 %) puis l'attaque majoritaire (51 %) sur l'aiguillage en Y | | | | |

---

## 6. Questionnaire complet soumis aux testeurs (Google Forms)

Les 21 questions suivantes constituent le questionnaire rempli par chaque testeur à l'issue du parcours autonome :

1. Avant cette expérience, quel était votre niveau sur la blockchain ?
2. Votre tranche d'âge
3. Sur quel support avez-vous fait le test ?
4. D'après vous, à quoi sert l'empreinte numérique (ou Hash) d'un bloc ?
5. Que se passe-t-il si quelqu'un tente de modifier une transaction passée ?
6. Où les informations de la blockchain sont-elles enregistrées ?
7. Quel est le rôle principal du minage ?
8. En une ou deux phrases avec vos propres mots : comment décririez-vous la blockchain à un proche ?
9. La métaphore du convoi ferroviaire vous a-t-elle aidé à visualiser le fonctionnement ?
10. Concernant les codes couleurs : les avez-vous compris ?
11. Avez-vous essayé d'interagir avec la scène 3D ?
12. Y a-t-il une étape ou une animation qui vous a particulièrement marqué(e) ou paru très claire ?
13. À l'inverse, y a-t-il un moment où vous vous êtes senti(e) perdu(e), confus(e) ou bloqué(e) ?
14. Facilité à comprendre ce qu'il faut faire dès l'arrivée sur le site (1 à 5)
15. Clarté et lisibilité des textes dans le volet d'explication (1 à 5)
16. Équilibre entre le texte explicatif et l'animation 3D (1 à 5)
17. Fluidité de l'animation 3D sur votre écran
18. Pensez-vous avoir une meilleure compréhension de la blockchain après ce test ? (1 à 5)
19. Combien de temps avez-vous passé sur le site environ ?
20. Si vous aviez une seule chose à améliorer ou modifier en priorité sur le site, ce serait quoi ?
21. Une dernière remarque libre, un bug remarqué ou autre chose ?

---

## 7. Tableau récapitulatif des résultats — 4 testeurs externes

Le tableau ci-dessous regroupe les réponses et observations recueillies auprès de nos 4 testeurs externes (tous âgés de 18 à 25 ans, test effectué sur ordinateur).

| Question / Critère du questionnaire | Testeur 1 (Laura) | Testeur 2 (Mamo) | Testeur 3 (Ahmamanjaifaim) | Testeur 4 (Afadili) |
|:---|:---|:---|:---|:---|
| **Avant cette expérience, quel était votre niveau sur la blockchain ?** | Découverte totale | En avait entendu parler | Découverte totale | Découverte totale |
| **Votre tranche d'âge** | 18-25 ans | 18-25 ans | 18-25 ans | 18-25 ans |
| **Sur quel support avez-vous fait le test ?** | Ordinateur | Ordinateur | Ordinateur | Ordinateur |
| **D'après vous, à quoi sert l'empreinte numérique (ou Hash) d'un bloc ?** | Juste (notion comprise, quelques détails restent abstraits) | Juste (réponse technique exacte) | Réponse partielle / générale (site jugé très simplifié) | Juste (étape 1 particulièrement appréciée) |
| **Que se passe-t-il si quelqu'un tente de modifier une transaction passée ?** | Juste (rupture comprise, certains détails restent abstraits) | Juste (a retenu la rupture des wagons) | Réponse partielle | Juste |
| **Où les informations de la blockchain sont-elles enregistrées ?** | Juste (mais certains détails restent abstraits) | Juste (réponse technique exacte) | Erreur : a répondu "serveur central" | Erreur : a répondu "serveur central" |
| **Quel est le rôle principal du minage ?** | Juste (animation du Nonce très appréciée) | Juste (réponse technique exacte) | Erreur : a répondu "je ne sais pas" | Réponse partielle / générale |
| **En une ou deux phrases avec vos propres mots : comment décririez-vous la blockchain à un proche ?** | Explication globalement juste, quelques détails abstraits | Explication juste et précise | Explication incomplète sur le réseau et le minage | Explication juste sur la structure, confuse sur le réseau |
| **La métaphore du convoi ferroviaire vous a-t-elle aidé à visualiser le fonctionnement ?** | Oui, aide à visualiser (détails techniques parfois abstraits) | Oui, très parlante sur la rupture des wagons | Avis mitigé (parcours suivi sans creuser la 3D) | Oui, notamment aux étapes 1 et 4 |
| **Concernant les codes couleurs : les avez-vous compris ?** | Compris dans l'ensemble | Compris dans l'ensemble | Non précisé | Compris dans l'ensemble |
| **Avez-vous essayé d'interagir avec la scène 3D ?** | Oui (molette du Nonce, étapes interactives) | Oui (observation de l'intérieur et des ruptures) | Non : s'est contenté de faire défiler les étapes sans manipuler la 3D | Oui sur les étapes 1 et 4, bloqué sur l'étape 7 |
| **Y a-t-il une étape ou une animation qui vous a particulièrement marqué(e) ou paru très claire ?** | Animation de la molette Nonce (étape 5) et comparaison PoW vs PoS (étape 6) | Rupture d'attelage des wagons en cas de triche (étape 3) | Parcours jugé simple à parcourir dans l'ensemble | Étape 1 (Structure d'un bloc) et étape 4 (Réseau de gares) |
| **À l'inverse, y a-t-il un moment où vous vous êtes senti(e) perdu(e), confus(e) ou bloqué(e) ?** | Certains détails techniques restent un peu abstraits | Intérieur des wagons jugé confus ("effet tunnel") | Notion de décentralisation et rôle du minage non acquis | Perdu / bloqué à l'étape 7 (Attaque des 51 % / course) |
| **Facilité à comprendre ce qu'il faut faire dès l'arrivée sur le site (1 à 5)** | Non détaillé individuellement (pas de blocage à l'accueil) | Non détaillé individuellement (pas de blocage à l'accueil) | Parcours fluide d'étape en étape sans interaction 3D poussée | Pas de blocage au départ (blocage tardif à l'étape 7) |
| **Clarté et lisibilité des textes dans le volet d'explication (1 à 5)** | Positive, quelques termes encore abstraits | Suggère de simplifier davantage le vocabulaire | Site jugé "très simplifié" | Claire sur le début, insuffisante à l'étape 7 |
| **Équilibre entre le texte explicatif et l'animation 3D (1 à 5)** | Positif | Positif hors surcharge interne des wagons | Texte suivi seul, 3D peu exploitée | Positif aux étapes 1 et 4, trop rapide/confus à l'étape 7 |
| **Fluidité de l'animation 3D sur votre écran** | Fluide (aucun ralentissement signalé) | Fluide (aucun ralentissement signalé) | Fluide (aucun ralentissement signalé) | Fluide (aucun ralentissement signalé) |
| **Pensez-vous avoir une meilleure compréhension de la blockchain après ce test ? (1 à 5)** | **5 / 5** | **5 / 5** | **3 / 5** | **4 / 5** |
| **Combien de temps avez-vous passé sur le site environ ?** | 8-15 min | 4-8 min | 4-8 min | 8-15 min |
| **Si vous aviez une seule chose à améliorer ou modifier en priorité sur le site, ce serait quoi ?** | Rendre certains détails techniques moins abstraits | Épurer l'intérieur des wagons ("effet tunnel") et simplifier les textes pour un niveau enfant | Mieux clarifier l'absence de serveur central et l'utilité réelle du minage | Ralentir / simplifier la compréhension de l'étape 7 |
| **Une dernière remarque libre, un bug remarqué ou autre chose ?** | Animation du Nonce et PoW/PoS très appréciées | Rupture des wagons très efficace visuellement | Trouve le site "très simplifié" | Très bonne compréhension sur le début du parcours (étapes 1 et 4) |

---

## 8. Synthèse des retours et correctifs appliqués

L'analyse des 4 tests externes met en évidence **une moyenne de compréhension de 4,25 / 5**, une validation forte des mécaniques visuelles phares (molette du Nonce, rupture des attelages, comparaison PoW vs PoS), ainsi que **5 axes d'amélioration prioritaires** immédiatement traités :

| Constat issu des tests | Concernés | Correctif implémenté dans l'application |
|:---|:---|:---|
| **50 % des testeurs ont répondu "serveur central"** à la question sur le stockage des données. | Ahmamanjaifaim, Afadili | **Étape 4 (`step4.js`)** : ajout d'une mention explicite en gras (*"Il n'y a AUCUN serveur central ou entreprise qui gère le réseau."*) et insistance dans les textes et les étiquettes 3D sur le fait que *chaque gare* détient sa propre copie intégrale. |
| **Intérieur des wagons jugé confus ("effet tunnel")** à travers la verrière. | Mamo | **Modélisation (`WagonMesh.js`)** : réduction du nombre d'éléments superposés à l'intérieur des wagons pour ne conserver que deux caisses bien lisibles et espacées, et allègement visuel de l'opacité du vitrage. |
| **Le rôle du minage reste incompris** par un testeur novice ("je ne sais pas"). | Ahmamanjaifaim | **Étape 5 (`step5.js`)** : mise en avant d'un encadré pédagogique expliquant clairement que le minage ne sert pas à créer de l'argent, mais à rendre la validation coûteuse pour empêcher les tricheurs de réécrire l'historique. |
| **Blocage / perte de repères à l'étape 7** lors de la course entre les deux voies. | Afadili | **Étape 7 (`step7.js`)** : raccourcissement et simplification des phrases du volet gauche, et ralentissement de la course / du train pirate par rapport au train honnête pour laisser le temps d'observer l'aiguillage. |
| **Termes jugés trop abstraits ou techniques** sur certaines notions. | Laura, Mamo | **Étapes 1 à 7 (`src/steps/`)** : passe de vulgarisation globale sur l'ensemble des textes (remplacement des termes académiques tels que *déterministe*, *effet avalanche*, *aval*, *discordance*, *Gossip*, *nœud* par des formulations accessibles niveau collège). |
