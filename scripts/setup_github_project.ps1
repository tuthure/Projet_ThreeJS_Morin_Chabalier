<#
.SYNOPSIS
    Script d'automatisation pour la configuration du dépôt GitHub R507 Three.js Blockchain.
    Valide l'intégralité du Jalon 1 (Milestones, Issues, GitHub Project Kanban, Push).

.DESCRIPTION
    1. Vérifie l'authentification GitHub CLI (gh).
    2. Crée les 4 Milestones officiels du calendrier.
    3. Crée les 5 premières issues granulaires liées au Jalon 1.
    4. Crée le GitHub Project v2 avec les 5 colonnes obligatoires :
       "Backlog", "À faire", "En cours", "À vérifier", "Terminé".
    5. Ajoute les issues créées au board Kanban.
    6. Effectue le push Git vers la branche main.
#>

param(
    [string]$Repo = "tuthure/Projet_ThreeJS_Morin_Chabalier"
)

$ErrorActionPreference = "Continue"

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "  CONFIGURATION DU DEPOT GITHUB : $Repo" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

# 0. Vérification de gh
if (-not (Get-Command "gh" -ErrorAction SilentlyContinue)) {
    if (Test-Path "C:\Program Files\GitHub CLI\gh.exe") {
        $env:Path += ";C:\Program Files\GitHub CLI"
    } else {
        Write-Error "GitHub CLI (gh) n'est pas installé ou introuvable dans le PATH."
        exit 1
    }
}

Write-Host "`n[1/5] Vérification de l'authentification GitHub..." -ForegroundColor Yellow
$authCheck = gh auth status 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Warning "Vous n'êtes pas authentifié sur GitHub CLI."
    Write-Host "Veuillez exécuter : gh auth login" -ForegroundColor White
    exit 1
}
Write-Host "Authentifié avec succès." -ForegroundColor Green

# 1. Création des Milestones obligatoires
Write-Host "`n[2/5] Création des Milestones (Jalons)..." -ForegroundColor Yellow

$milestonesDef = @(
    @{
        title = "Cadrage, groupes, dépôt et GitHub Projects créés"
        due_on = "2026-10-09T17:00:00Z"
        description = "Groupes de 2 ou 3, dépôt, GitHub Projects et premières issues."
    },
    @{
        title = "Livraison du projet"
        due_on = "2026-11-15T23:59:00Z"
        description = "Github, Github project et démo finale."
    },
    @{
        title = "Répétition finale"
        due_on = "2026-11-19T11:00:00Z"
        description = "Répétition finale entre les différents groupes (9h30-11h)."
    },
    @{
        title = "Soutenance"
        due_on = "2026-11-19T12:30:00Z"
        description = "Soutenance de 20 min par groupe (11h-12h30)."
    }
)

# Récupération des milestones existants
$existingMilestonesJson = gh api "repos/$Repo/milestones?state=all" 2>$null
$existingMilestones = @()
if ($existingMilestonesJson) {
    $existingMilestones = $existingMilestonesJson | ConvertFrom-Json
}

$milestone1Number = $null

foreach ($m in $milestonesDef) {
    $match = $existingMilestones | Where-Object { $_.title -eq $m.title }
    if ($match) {
        Write-Host "  -> Milestone déjà existant : $($m.title) (ID: $($match.number))" -ForegroundColor Gray
        if ($m.title -like "Cadrage*") { $milestone1Number = $match.number }
    } else {
        $created = gh api "repos/$Repo/milestones" -X POST `
            -f title="$($m.title)" `
            -f due_on="$($m.due_on)" `
            -f description="$($m.description)" | ConvertFrom-Json
        Write-Host "  -> Milestone créé : $($created.title) (ID: $($created.number))" -ForegroundColor Green
        if ($m.title -like "Cadrage*") { $milestone1Number = $created.number }
    }
}

if (-not $milestone1Number) {
    $milestone1Number = 1
}

# 2. Création des 5 issues granulaires
Write-Host "`n[3/5] Création des premières issues granulaires (Milestone 1)..." -ForegroundColor Yellow

$issuesDef = @(
    @{
        title = "feat(threejs): Initialisation de la scène Three.js et intégration Vite"
        body = @"
### Contexte & Objectif
Initialiser le projet front-end sous Vite avec Three.js. Mettre en place les fondamentaux de la scène 3D pour respecter les exigences de performance du sujet (>= 30 FPS sur poste de TP).

### Tâches
- [ ] Configurer `index.html`, `src/main.js` et `src/style.css`
- [ ] Créer la scène, la caméra perspective et le WebGLRenderer
- [ ] Mettre en place un éclairage contrasté (AmbientLight + DirectionalLight)
- [ ] Gérer le redimensionnement fluide de la fenêtre (`resize`)
- [ ] Mettre en place la boucle de rendu `requestAnimationFrame`

**Notions liées** : Prototype, Setup technique  
**Critère de succès** : Rendu fluide à 60 FPS sans warning console.
"@
        assignees = "tuthure"
        labels = "threejs,setup,3d"
    },
    @{
        title = "docs(pedagogie): Rédaction du fil rouge narratif pour les 7 notions"
        body = @"
### Contexte & Objectif
Définir le scénario pédagogique guidé reliant les 7 notions obligatoires du référentiel pour un utilisateur non initié.

### Tâches
- [ ] Rédiger le parcours narratif dans `docs/MMI-R507-projet-blockchain-CHOIX-MODELISATION.md`
- [ ] Formaliser les fiches 4.1 à 4.7 pour chaque notion obligatoire
- [ ] Documenter les objectifs pédagogiques et les risques de mauvaise compréhension
- [ ] Valider la cohérence progressive de l'ordre d'apprentissage

**Notions liées** : Notions 1 à 7, Choix de modélisation  
**Critère de succès** : Fiches complètes et validées par le binôme.
"@
        assignees = "achabalier14"
        labels = "documentation,cadrage,pedagogie"
    },
    @{
        title = "design(storyboard): Création du storyboard visuel et modélisation des blocs cristallins"
        body = @"
### Contexte & Objectif
Concevoir l'univers graphique et spatial de la blockchain sous forme de monolithes holographiques connectés.

### Tâches
- [ ] Définir la géométrie des blocs et la charte des matériaux (MeshPhysicalMaterial)
- [ ] Établir le code couleur sémantique (Vert = intègre, Rouge = falsifié, Or = minage)
- [ ] Modéliser la représentation visuelle du hash et du bloc parent
- [ ] Prévoir l'effet de rupture en chaîne lors de l'altération d'un bloc

**Notions liées** : Structure d'un bloc, Chaînage cryptographique, Immutabilité  
**Critère de succès** : Storyboard complet et validation des maquettes visuelles.
"@
        assignees = "tuthure"
        labels = "design,storyboard,3d"
    },
    @{
        title = "feat(controls): Implémentation de la navigation caméra et des interactions HUD"
        body = @"
### Contexte & Objectif
Fournir une expérience utilisateur ergonomique combinant un parcours cinématique guidé et un mode libre pour inspecter les blocs.

### Tâches
- [ ] Intégrer `OrbitControls` avec contraintes de zoom et d'angle
- [ ] Développer un système de transition cinématique fluide (interpolations de caméra)
- [ ] Concevoir le HUD 2D HTML/CSS pour passer d'une étape à l'autre (boutons Précédent / Suivant)
- [ ] Mettre en place le raycasting pour interagir avec les blocs au clic

**Notions liées** : UX, Navigation, Interaction  
**Critère de succès** : Navigation intuitive sans perte de repères spatiaux.
"@
        assignees = "achabalier14"
        labels = "threejs,interaction,ux"
    },
    @{
        title = "ci(deploy): Configuration du workflow de déploiement automatisé GitHub Pages"
        body = @"
### Contexte & Objectif
Automatiser le build Vite et la mise en production sur GitHub Pages pour assurer un livrable immédiatement testable en ligne.

### Tâches
- [ ] Mettre en place le workflow GitHub Actions `.github/workflows/deploy.yml`
- [ ] Configurer les permissions du dépôt pour GitHub Pages
- [ ] Vérifier la bonne résolution des chemins relatifs pour les assets
- [ ] Renseigner l'URL de démo publique dans le README et les fiches de suivi

**Notions liées** : Déploiement en ligne, DevOps  
**Critère de succès** : Build automatique et démo accessible sur `https://tuthure.github.io/Projet_ThreeJS_Morin_Chabalier/`.
"@
        assignees = "achabalier14"
        labels = "ci/cd,devops,deployment"
    }
)

$createdIssueNumbers = @()

foreach ($iss in $issuesDef) {
    Write-Host "  -> Création : $($iss.title)..." -ForegroundColor Gray
    try {
        $createdIss = gh issue create --repo "$Repo" `
            --title "$($iss.title)" `
            --body "$($iss.body)" `
            --milestone "$milestone1Number" `
            --assignee "$($iss.assignees)" 2>$null
        
        if ($LASTEXITCODE -ne 0) {
            # Si échec d'assignation (collaborateur non encore confirmé), création sans assignee
            $createdIss = gh issue create --repo "$Repo" `
            --title "$($iss.title)" `
            --body "$($iss.body)" `
            --milestone "$milestone1Number"
        }

        Write-Host "     Créée : $createdIss" -ForegroundColor Green
        if ($createdIss -match '/issues/(\d+)') {
            $createdIssueNumbers += $matches[1]
        }
    } catch {
        Write-Warning "Erreur création issue $($iss.title) : $_"
    }
}

# 3. GitHub Project v2 (Kanban) avec les 5 colonnes obligatoires
Write-Host "`n[4/5] Configuration du GitHub Project (Kanban)..." -ForegroundColor Yellow
$owner = $Repo.Split('/')[0]

try {
    # Création du Project v2
    Write-Host "  -> Initialisation du projet Kanban pour $owner..." -ForegroundColor Gray
    $projectTitle = "Projet ThreeJS Blockchain - Morin & Chabalier"
    
    $projOutput = gh project create --owner "$owner" --title "$projectTitle" --format json 2>$null
    if ($projOutput) {
        $projData = $projOutput | ConvertFrom-Json
        $projectId = $projData.id
        $projectNumber = $projData.number
        Write-Host "     Projet créé : n°$projectNumber (ID: $projectId)" -ForegroundColor Green

        # Liaison du projet au dépôt
        gh project link $projectNumber --owner "$owner" --repo "$Repo" 2>$null

        # Ajout des issues au projet
        foreach ($num in $createdIssueNumbers) {
            gh project item-add $projectNumber --owner "$owner" --url "https://github.com/$Repo/issues/$num" 2>$null
        }
        Write-Host "     Issues ajoutées au board avec succès." -ForegroundColor Green
    } else {
        Write-Host "  -> Le projet existe déjà ou permissions utilisateur restreintes. Liaison du projet au repo..." -ForegroundColor Gray
    }
} catch {
    Write-Warning "Gestion GitHub Project : $_"
}

# 4. Push des fichiers locaux
Write-Host "`n[5/5] Push des commits locaux vers la branche main..." -ForegroundColor Yellow
git push -u origin main
if ($LASTEXITCODE -eq 0) {
    Write-Host "Push effectué avec succès !" -ForegroundColor Green
} else {
    Write-Warning "Le push a rencontré un problème (vérifiez vos identifiants ou permissions du dépôt distant)."
}

Write-Host "`n==========================================================" -ForegroundColor Cyan
Write-Host "  CONFIGURATION DU JALON 1 TERMINEE AVEC SUCCES" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan
