# Configuration et synchronisation des 25 issues du projet R507 Three.js Blockchain
# Metaphore : Le Convoi Ferroviaire Blinde

param(
    [string]$Repo = "tuthure/Projet_ThreeJS_Morin_Chabalier",
    [string]$ProjectOwner = "tuthure",
    [int]$ProjectNumber = 1
)

$ErrorActionPreference = "Continue"

Write-Host "Verification et configuration du depot GitHub : $Repo"

# Verification de GitHub CLI
if (-not (Get-Command "gh" -ErrorAction SilentlyContinue)) {
    if (Test-Path "C:\Program Files\GitHub CLI\gh.exe") {
        $env:Path += ";C:\Program Files\GitHub CLI"
    } else {
        Write-Error "GitHub CLI (gh) introuvable."
        exit 1
    }
}

if (-not $env:GH_TOKEN) {
    $env:GH_TOKEN = [System.Environment]::GetEnvironmentVariable("GH_TOKEN", "User")
}

# Liste des 25 issues officielles avec leurs colonnes cibles
$issuesConfig = @(
    # 1. Phase Cadrage (Milestone 1)
    @{ number = 1; title = "Définir les rôles de l'équipe"; column = "Terminé"; milestone = "Cadrage, groupes, dépôt et GitHub Projects créés"; assignees = @("achabalier14", "tuthure") },
    @{ number = 2; title = "Créer le board GitHub Projects et ses colonnes"; column = "Terminé"; milestone = "Cadrage, groupes, dépôt et GitHub Projects créés"; assignees = @("tuthure") },
    @{ number = 3; title = "Choisir le public cible, la métaphore principale et le fil rouge"; column = "Terminé"; milestone = "Cadrage, groupes, dépôt et GitHub Projects créés"; assignees = @("achabalier14") },
    @{ number = 4; title = "Compléter le document de cadrage (MMI-R507-projet-blockchain-CHOIX-MODELISATION.md)"; column = "À vérifier"; milestone = "Cadrage, groupes, dépôt et GitHub Projects créés"; assignees = @("achabalier14") },
    @{ number = 5; title = "Rédiger la fiche de suivi - Semaine 1"; column = "À vérifier"; milestone = "Cadrage, groupes, dépôt et GitHub Projects créés"; assignees = @("achabalier14") },
    @{ number = 6; title = "Initialisation du dépôt (Vite + Three.js + workflow Pages)"; column = "En cours"; milestone = "Cadrage, groupes, dépôt et GitHub Projects créés"; assignees = @("tuthure") },

    # 2. Phase Développement & Notions (Milestone 2)
    @{ number = 7; title = "Notion 1 - Structure d'un bloc (données, hash, parentHash, nonce)"; column = "À faire"; milestone = "Livraison du projet"; assignees = @("tuthure") },
    @{ number = 8; title = "Notion 2 - Chaînage cryptographique et effet avalanche"; column = "À faire"; milestone = "Livraison du projet"; assignees = @("tuthure") },
    @{ number = 9; title = "Notion 3 - Immutabilité et détection de falsification"; column = "À faire"; milestone = "Livraison du projet"; assignees = @("achabalier14") },
    @{ number = 10; title = "Notion 4 - Réseau, décentralisation et copies distribuées"; column = "À faire"; milestone = "Livraison du projet"; assignees = @("tuthure") },
    @{ number = 11; title = "Notion 5 - Validation et minage, preuve de travail"; column = "À faire"; milestone = "Livraison du projet"; assignees = @("achabalier14") },
    @{ number = 12; title = "Notion 6 - Comparaison des mécanismes de consensus (PoW vs PoS)"; column = "Backlog"; milestone = "Livraison du projet"; assignees = @("achabalier14") },
    @{ number = 13; title = "Notion 7 - Cycle de vie d'une transaction et illustration d'attaque"; column = "Backlog"; milestone = "Livraison du projet"; assignees = @("tuthure") },
    @{ number = 14; title = "Storyboard du parcours complet et mise en scène du train"; column = "À faire"; milestone = "Livraison du projet"; assignees = @("achabalier14") },
    @{ number = 15; title = "Caméra, navigation et transitions entre séquences"; column = "À faire"; milestone = "Livraison du projet"; assignees = @("tuthure") },
    @{ number = 16; title = "Charte visuelle, interface HUD et accessibilité"; column = "Backlog"; milestone = "Livraison du projet"; assignees = @("achabalier14") },
    @{ number = 17; title = "Tests utilisateurs - session 1 (2 personnes extérieures)"; column = "Backlog"; milestone = "Livraison du projet"; assignees = @("achabalier14", "tuthure") },
    @{ number = 18; title = "Tests utilisateurs - session 2 (après retours et corrections)"; column = "Backlog"; milestone = "Livraison du projet"; assignees = @("achabalier14", "tuthure") },
    @{ number = 19; title = "Mesure des performances : assurer 30 FPS sur poste de TP"; column = "Backlog"; milestone = "Livraison du projet"; assignees = @("tuthure") },
    @{ number = 20; title = "Finaliser le document officiel CHOIX-MODELISATION.md"; column = "Backlog"; milestone = "Livraison du projet"; assignees = @("achabalier14") },
    @{ number = 21; title = "Finaliser le README du projet"; column = "Backlog"; milestone = "Livraison du projet"; assignees = @("achabalier14") },

    # 3. Phase Soutenance (Milestone 4)
    @{ number = 22; title = "Remplir la grille d'auto-évaluation (MMI-R507-projet-blockchain-GRILLE-AUTOEVAL.md)"; column = "Backlog"; milestone = "Soutenance"; assignees = @("achabalier14", "tuthure") },
    @{ number = 23; title = "Préparer le support de soutenance pour la présentation de 20 min"; column = "Backlog"; milestone = "Soutenance"; assignees = @("achabalier14", "tuthure") },
    @{ number = 24; title = "Réalisation d'une vidéo de démonstration de secours (Plan B)"; column = "Backlog"; milestone = "Soutenance"; assignees = @("tuthure") },
    @{ number = 25; title = "Répétition générale de la soutenance"; column = "Backlog"; milestone = "Soutenance"; assignees = @("achabalier14", "tuthure") }
)

Write-Host "Synchronisation des items avec le GitHub Project : $ProjectOwner/projects/$ProjectNumber"
foreach ($item in $issuesConfig) {
    $url = "https://github.com/$Repo/issues/$($item.number)"
    Write-Host "Traitement issue #$($item.number) ($($item.title)) -> Colonne: $($item.column)"
    gh project item-add $ProjectNumber --owner $ProjectOwner --url $url 2>$null
}

Write-Host "Synchronisation terminee."
