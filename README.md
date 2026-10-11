# Visualisation pédagogique de la blockchain

Projet Three.js réalisé dans le cadre de la ressource R507 en 3e année de BUT MMI.

## Membres du groupe

- Arthur Morin (@tuthure) : développement 3D et scène Three.js
- Alban Chabalier (@albanchab14) : logique, interface et gestion de projet

## Présentation du projet

L'objectif de ce projet est d'expliquer le fonctionnement d'une blockchain à un utilisateur non initié, à l'aide d'une scène 3D interactive développée avec Three.js.

Le but n'est pas de développer une vraie blockchain, mais de vulgariser visuellement les concepts clés : comment les blocs sont liés entre eux, pourquoi une modification invalide la chaîne, et comment le réseau valide les transactions sans serveur central.

L'application doit rester simple à prendre en main, fluide (au moins 30 FPS sur une machine standard de TP) et accessible directement dans le navigateur via GitHub Pages.

## Les 7 notions abordées

L'expérience illustre les 7 notions obligatoires du sujet :
1. Structure d'un bloc (données, hash du bloc, hash du bloc parent, nonce).
2. Chaînage cryptographique (empreinte reliant chaque bloc au précédent).
3. Immutabilité et détection de falsification (impact d'une modification sur les hashs suivants).
4. Réseau et décentralisation (répartition sur plusieurs nœuds sans autorité centrale).
5. Validation et minage (recherche d'un nonce valide en Proof of Work).
6. Comparaison de deux mécanismes de consensus (Proof of Work vs Proof of Stake).
7. Cycle de vie d'une transaction et scénario d'attaque (création, propagation, validation dans un bloc et tentative de double dépense rejetée).

## Organisation du dépôt

- docs/ : documents de conception et d'évaluation
  - MMI-R507-projet-blockchain-CHOIX-MODELISATION.md : choix visuels et justification des métaphores pour chaque notion
  - MMI-R507-projet-blockchain-GRILLE-AUTOEVAL.md : grille d'auto-évaluation du projet
  - suivi/ : fiches de suivi hebdomadaires (SEMAINE-01.md à SEMAINE-08.md)
- scripts/ : scripts d'aide à la configuration
- src/ : code source de l'application (Three.js, shaders, logique)
- public/ : assets statiques (textures, modèles)

## Calendrier et jalons

Le projet suit les 4 jalons imposés :
- 9 octobre 2026 (17h) : Cadrage, groupes, dépôt et GitHub Projects créés
- 15 novembre 2026 (23h59) : Livraison du projet (code, démo en ligne, fiches complétées)
- 19 novembre 2026 (9h30 - 11h) : Répétition finale
- 19 novembre 2026 (11h - 12h30) : Soutenance finale (20 minutes par groupe)

## Gestion de projet

Le suivi des tâches se fait avec un GitHub Project configuré en 5 colonnes :
- Backlog
- À faire
- En cours
- À vérifier
- Terminé

Les tâches sont découpées en issues précises, assignées à chaque membre et reliées aux jalons du calendrier.
