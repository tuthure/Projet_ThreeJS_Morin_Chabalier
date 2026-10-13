# Configuration du depot GitHub R507 Three.js Blockchain
# Validation du Jalon 1 (Milestones, Issues, GitHub Project)

param(
    [string]$Repo = "tuthure/Projet_ThreeJS_Morin_Chabalier"
)

$ErrorActionPreference = "Continue"

Write-Host "Configuration du depot GitHub : $Repo"

# Verification de GitHub CLI
if (-not (Get-Command "gh" -ErrorAction SilentlyContinue)) {
    if (Test-Path "C:\Program Files\GitHub CLI\gh.exe") {
        $env:Path += ";C:\Program Files\GitHub CLI"
    } else {
        Write-Error "GitHub CLI (gh) introuvable."
        exit 1
    }
}

# Verification de l'authentification
$authCheck = gh auth status 2>&1
if ($LASTEXITCODE -ne 0 -and -not $env:GH_TOKEN) {
    Write-Warning "Non authentifie sur GitHub CLI. Renseignez la variable GH_TOKEN ou lancez 'gh auth login'."
    exit 1
}

# 1. Milestones du calendrier officiel
Write-Host "Verification et creation des Milestones..."
$milestonesDef = @(
    @{
        title = "Cadrage, groupes, depot et GitHub Projects crees"
        due_on = "2026-10-09T17:00:00Z"
        description = "Groupes de 2 ou 3, depot, GitHub Projects et premieres issues."
    },
    @{
        title = "Livraison du projet"
        due_on = "2026-11-15T23:59:00Z"
        description = "Github, Github project et demo finale."
    },
    @{
        title = "Repetition finale"
        due_on = "2026-11-19T11:00:00Z"
        description = "Repetition finale entre les differents groupes (9h30-11h)."
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

# 2. Issues granulaires associees au Jalon 1
Write-Host "Verification et creation des issues initiales..."
$issuesDef = @(
    @{
        title = "feat(threejs): Initialisation de la scene Three.js et integration Vite"
        body = "Initialisation du projet front-end sous Vite avec Three.js. Mise en place de la scene, camera perspective, renderer WebGL, eclairage, boucle requestAnimationFrame et premier wagon temoin."
        assignees = "tuthure"
    },
    @{
        title = "docs(pedagogie): Cadrage documentaire et fil rouge du convoi ferroviaire blinde"
        body = "Redaction de CHOIX-MODELISATION.md avec adaptation des 7 notions a la metaphore du train infini (wagons, attelages magnetiques, voies paralleles, motrice PoW), grille d'autoevaluation et fiche de suivi hebdo semaine 1."
        assignees = "achabalier14"
    },
    @{
        title = "design(storyboard): Conception visuelle et modelisation 3D des wagons du convoi ferroviaire"
        body = "Conception du convoi ferroviaire blinde : modelisation des wagons (blocs), des marchandises (transactions) et des attelages magnetiques (hashs cryptographiques). Definition de la charte de couleurs et des etats visuels."
        assignees = "tuthure"
    },
    @{
        title = "feat(controls): Implementation de la navigation camera et des interactions HUD"
        body = "Mise en place des controles de camera (OrbitControls et transitions guidees) avec boutons HUD pour parcourir les notions pedagogiques du train."
        assignees = "achabalier14"
    },
    @{
        title = "ci(deploy): Configuration du workflow de deploiement automatise GitHub Pages"
        body = "Automatisation du build et du deploiement en ligne sur GitHub Pages via GitHub Actions."
        assignees = "achabalier14"
    }
)

foreach ($iss in $issuesDef) {
    gh issue create --repo "$Repo" `
        --title "$($iss.title)" `
        --body "$($iss.body)" `
        --milestone "Cadrage, groupes, depot et GitHub Projects crees" `
        --assignee "$($iss.assignees)" 2>$null
}

Write-Host "Configuration terminee avec succes."
