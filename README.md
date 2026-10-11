# Visualisation pédagogique de la blockchain 🌐⛓️

Projet d'expérience web 3D interactive développé avec **Three.js** dans le cadre de la ressource **R507** (3e année de BUT Métiers du Multimédia et de l'Internet — Parcours Développement Web & Dispositifs Interactifs).

Cours de référence : [Three.js Lessons — J. Azé](https://j-aze.github.io/threejs-lessons/cours.html)

---

## 👥 Équipe de projet

| Membre | Identifiant GitHub | Rôle principal |
| :--- | :--- | :--- |
| **Arthur Morin** | [@tuthure](https://github.com/tuthure) | Lead Développeur 3D & Architecte Scène (Three.js) |
| **Alban Chabalier** | [@albanchab14](https://github.com/albanchab14) | Lead Développeur Logique / Interaction & Chef de Projet |

---

## 🎯 Cadrage & Objectifs du projet

### 1. Contexte & Médiation scientifique
L'objectif de ce projet est de rendre compréhensibles les mécanismes complexes et abstraits d'une blockchain à destination d'un **utilisateur non initié** (grand public, étudiants non informaticiens). À travers une scène 3D temps réel interactive, l'expérience traduit les concepts cryptographiques et distribués en métaphores visuelles et spatiales intuitives.

Il ne s'agit pas d'émuler une blockchain réelle, mais de modéliser visuellement ses règles invariantes et ses propriétés fondamentales. Chaque choix visuel et interactif est explicité, justifié et testé auprès d'utilisateurs extérieurs.

### 2. Les 7 Notions obligatoires à vulgariser
L'application couvrira de manière didactique et interactive les 7 notions prescrites au référentiel :
1. **Structure d'un bloc** : Données de transaction, hash du bloc, hash du bloc parent (`previousHash`), et `nonce`.
2. **Chaînage cryptographique** : Empreinte cryptographique reliant chaque bloc au précédent, et propagation visuelle de l'effet de rupture en cascade lors d'une altération.
3. **Immutabilité et détection de falsification** : Invalidation immédiate des hashs consécutifs lors de la modification d'un bloc et rejet par les nœuds observateurs.
4. **Réseau et décentralisation** : Topologie multi-nœuds, distribution des copies du grand livre et propagation des blocs/transactions sans autorité centrale.
5. **Validation et minage** : Démonstration du Proof of Work (PoW) par recherche d'un nonce respectant une contrainte de difficulté (zéros en tête).
6. **Comparaison de mécanismes de consensus** : Mise en parallèle pédagogique de deux consensus (ex. Proof of Work vs Proof of Stake), avec leurs dynamiques énergétiques, de rapidité et d'incitation.
7. **Cycle de vie d'une transaction & scénario d'attaque** : Émission, propagation en mempool, minage/validation, confirmation, couplé à une tentative d'attaque (double dépense ou altération d'historique) et sa neutralisation par le réseau.

---

## 📁 Structure du dépôt

```text
Projet_ThreeJS_Morin_Chabalier/
├── .github/
│   └── workflows/              # Workflows CI/CD (déploiement GitHub Pages)
├── docs/
│   ├── MMI-R507-projet-blockchain-CHOIX-MODELISATION.md   # Livrable officiel des choix de modélisation (25 %)
│   ├── MMI-R507-projet-blockchain-GRILLE-AUTOEVAL.md       # Grille d'auto-évaluation avant soutenance
│   └── suivi/
│       ├── SEMAINE-01.md       # Fiche de suivi hebdo n°1 (Lancement & cadrage)
│       └── ...                 # SEMAINE-02.md à SEMAINE-08.md
├── src/                        # Code source Three.js / shaders / scripts
├── public/                     # Assets 3D (modèles GLTF/GLB, textures, sons)
├── index.html                  # Point d'entrée de l'application
├── package.json                # Dépendances Vite, Three.js, etc.
└── README.md                   # Document de cadrage initial
```

---

## 🗓️ Calendrier & Milestones du projet

Le projet est rythmé par les 4 jalons obligatoires :

- 🏁 **Jalon 1 (9 octobre 2026, 17h)** : *Cadrage, groupes, dépôt et GitHub Projects créés*
  - Constitution du binôme, initialisation du dépôt Git et de la documentation.
  - Configuration du GitHub Project (board Kanban) et création des premières issues.
- 📦 **Jalon 2 (15 novembre 2026, 23h59)** : *Livraison du projet*
  - Dépôt finalisé, application Three.js fonctionnelle, démo en ligne et fiches complétées.
- 🎭 **Jalon 3 (19 novembre 2026, 9h30 - 11h)** : *Répétition finale*
  - Répétition générale croisée entre les différents groupes.
- 🎓 **Jalon 4 (19 novembre 2026, 11h - 12h30)** : *Soutenance*
  - Présentation orale de 20 minutes par groupe avec démonstration live et défense des choix.

---

## 📋 Méthodologie & GitHub Projects

Le pilotage du projet s'effectue via un **GitHub Project** structuré selon les 5 colonnes obligatoires :
1. `Backlog`
2. `À faire`
3. `En cours`
4. `À vérifier`
5. `Terminé`

Chaque tâche fait l'objet d'une issue granulaire assignée à un membre de l'équipe, rattachée au jalon correspondant, et tracée via des commits et pull requests explicites.

---

## ⚙️ Spécifications techniques & Performances

- **Moteur 3D** : Three.js (via Vite)
- **Cible de performance** : Fluide à au moins 30 FPS sur une configuration standard de TP universitaire.
- **Accessibilité & Ergonomie** : Prise en charge des contrastes, typographie lisible, retours d'actions clairs, caméra guidée avec option libre.
- **Déploiement en ligne** : Déploiement automatisé sur GitHub Pages.
- **Transparence IA** : Tout recours aux outils d'IA générative est consigné de façon transparente dans les fiches de suivi et les choix de modélisation.
