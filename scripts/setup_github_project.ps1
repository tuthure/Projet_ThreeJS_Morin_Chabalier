# Configuration du depot GitHub R507 Three.js Blockchain
# Validation du Jalon 1 (Milestones, Issues, GitHub Project)

param(
    [string]$Repo = "tuthure/Projet_ThreeJS_Morin_Chabalier"
)

$ErrorActionPreference = "Continue"

Write-Host "Configuration du depot GitHub : $Repo"

# Verification de gh
if (-not (Get-Command "gh" -ErrorAction SilentlyContinue)) {
    if (Test-Path "C:\Program Files\GitHub CLI\gh.exe") {
        $env:Path += ";C:\Program Files\GitHub CLI"
    } else {
        Write-Error "GitHub CLI (gh) introuvable."
        exit 1
    }
}

$authCheck = gh auth status 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Warning "Non authentifie sur GitHub CLI. Lancez 'gh auth login'."
    exit 1
}

# 1. Milestones
Write-Host "Creation des Milestones..."
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

foreach ($m in $milestonesDef) {
    gh api "repos/$Repo/milestones" -X POST `
        -f title="$($m.title)" `
        -f due_on="$($m.due_on)" `
        -f description="$($m.description)" 2>$null
}

# 2. Issues
Write-Host "Creation des issues initiales..."
$issuesDef = @(
    @{
        title = "feat(threejs): Initialisation de la scène Three.js et intégration Vite"
        body = "Initialisation du projet front-end sous Vite avec Three.js. Mise en place de la scène, caméra perspective, renderer WebGL, éclairage et boucle requestAnimationFrame pour assurer au moins 30 FPS."
        assignees = "tuthure"
    },
    @{
        title = "docs(pedagogie): Rédaction du fil rouge narratif pour les 7 notions"
        body = "Définition du scénario pédagogique guidé reliant les 7 notions obligatoires dans CHOIX-MODELISATION.md pour un utilisateur non initié."
        assignees = "albanchab14"
    },
    @{
        title = "design(storyboard): Création du storyboard visuel et modélisation des blocs cristallins"
        body = "Définition de la charte visuelle (formes cubiques, couleurs vert/rouge/orange) et storyboard reliant les blocs."
        assignees = "tuthure"
    },
    @{
        title = "feat(controls): Implémentation de la navigation caméra et des interactions HUD"
        body = "Mise en place des contrôles de caméra (OrbitControls et transitions guidées) avec boutons HUD pour parcourir les notions."
        assignees = "albanchab14"
    },
    @{
        title = "ci(deploy): Configuration du workflow de déploiement automatisé GitHub Pages"
        body = "Automatisation du build et du déploiement en ligne sur GitHub Pages."
        assignees = "albanchab14"
    }
)

foreach ($iss in $issuesDef) {
    gh issue create --repo "$Repo" `
        --title "$($iss.title)" `
        --body "$($iss.body)" `
        --milestone "Cadrage, groupes, dépôt et GitHub Projects créés" `
        --assignee "$($iss.assignees)" 2>$null
}

Write-Host "Configuration terminee."
