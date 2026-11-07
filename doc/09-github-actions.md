# 09 — GitHub Actions : qui déclenche quoi

Deux workflows, dans `.github/workflows/`. Ils ne font pas le même travail et ne
partent pas sur les mêmes évènements.

| Fichier | Ce qu'il fait | Où il tourne | Durée |
|---|---|---|---|
| `desktop-release.yml` | Construit l'installateur Windows et publie la release | `windows-latest` | ~10 min |
| `deploy-telechargement.yml` | Publie la page de téléchargement et l'installateur dessus | `ubuntu-latest` | ~2 min |

## L'enchaînement normal

```
tu montes "version" dans package.json, puis git push
        │
        ├──► desktop-release.yml          (declencheur : push sur main)
        │       construit l'app, cree la release v1.0.14
        │       │
        │       └──► deploy-telechargement.yml   (declencheur : workflow_run)
        │               reprend le .exe de la release
        │               reconstruit version.json
        │               deploie page + installateur sur Netlify
        │
        └──► deploy-telechargement.yml    (declencheur : push, si telechargement/ a change)
```

Un seul `git push` peut donc lancer les deux, et la page passe deux fois : une
fois tout de suite avec l'ancien installateur, une fois après la construction
avec le nouveau. Ce n'est pas un défaut — le second passage écrase le premier.

## Les quatre déclencheurs, et quand ils servent

### `push`

```yaml
on:
  push:
    branches: [main]
    paths:
      - "telechargement/**"
```

Part à chaque `git push` sur `main`. Le **filtre de chemin** limite le
déclenchement : sans lui, chaque correction dans l'application redéploierait la
page sans raison.

`desktop-release.yml`, lui, n'a pas de filtre — il part à chaque push, mais
**décide ensuite s'il construit** (voir plus bas).

### `workflow_run`

```yaml
on:
  workflow_run:
    workflows: ["Desktop release"]
    types: [completed]
```

Part quand l'autre workflow **se termine**. C'est ce qui enchaîne la page
derrière la construction.

> **Le piège qui nous a coûté une version.** On avait d'abord écrit
> `release: types: [published]`, ce qui paraît logique. Ça n'a jamais marché :
> **GitHub refuse de démarrer un workflow sur un évènement provoqué par
> `GITHUB_TOKEN`**, pour éviter les boucles infinies. La release étant publiée
> par un workflow, l'évènement existait mais ne déclenchait rien. La 1.0.14 est
> sortie, la page a continué de servir la 1.0.13, et aucun voyant n'était rouge.

`workflow_run` part que l'autre ait réussi ou échoué. D'où la garde :

```yaml
jobs:
  deployer:
    if: >-
      github.event_name != 'workflow_run' ||
      github.event.workflow_run.conclusion == 'success'
```

Une construction échouée n'a produit aucun installateur : déployer quand même
servirait l'ancien fichier sous le nouveau numéro de version.

### `release`

```yaml
on:
  release:
    types: [published]
```

Conservé pour une release publiée **à la main** depuis l'interface GitHub. Dans
ce cas l'évènement vient de toi, pas d'un jeton de workflow, et il déclenche
bien.

> Attention : `published` ne couvre pas `edited`. Si tu ajoutes les notes de
> release **après** la publication, la page ne bouge pas — il faut relancer le
> déploiement à la main.

### `workflow_dispatch`

Le bouton **Run workflow** dans l'onglet Actions, et la commande
`gh workflow run`. Toujours utile : rattraper un déploiement raté, reposer une
version, tester une modification du workflow.

## Pourquoi `desktop-release` ne construit pas à chaque push

Il part à chaque push sur `main`, mais la première étape compare la version du
`package.json` avec celle du commit précédent :

```bash
should_release="false"
if [ "$EVENT_NAME" = "workflow_dispatch" ] \
   || [ "$current_version" != "$previous_version" ] \
   || [ "$tag_exists" != "true" ]; then
  should_release="true"
fi
```

Toutes les étapes suivantes portent `if: steps.version.outputs.should_release == 'true'`.
Un push qui ne change pas la version traverse le workflow en quelques secondes
sans rien construire — et le workflow est **vert**, pas ignoré.

C'est pour ça qu'un `git push` ordinaire ne produit pas de release.

## Les commandes

### Publier une version

```bash
cd frond
npm version 1.0.15 --no-git-tag-version   # ou editer package.json a la main
git add -A
git commit -m "version 1.0.15"
git push
```

> Les **notes de release** s'écrivent sur la page de la release, en lignes
> commençant par un tiret. La page n'en reprend que les six premières. Écris-les
> pour un pasteur, pas pour un développeur.

### Suivre ce qui tourne

```bash
gh run list --limit 5              # les derniers passages
gh run watch                       # suivre celui en cours, en direct
gh run view <id>                   # le detail d'un passage
gh run view <id> --log-failed      # uniquement ce qui a echoue
```

### Relancer à la main

```bash
gh workflow run deploy-telechargement.yml --ref main
gh workflow run desktop-release.yml --ref main       # force une construction
```

### Les secrets et variables

```bash
gh secret list                                  # les noms, jamais les valeurs
gh variable list                                # noms et valeurs
gh variable get URL_TELECHARGEMENT | od -c      # voir les caracteres invisibles
```

> `od -c` a déjà servi : l'adresse collée dans `URL_TELECHARGEMENT` traînait un
> `\r\n\n` invisible, curl recevait une URL coupée en deux et le workflow
> échouait sur un déploiement par ailleurs réussi.

Poser un secret sans que sa valeur passe par la ligne de commande :

```bash
gh secret set NETLIFY_AUTH_TOKEN < fichier-contenant-le-jeton
```

### Vérifier le résultat

```bash
curl -I https://ma-communaute.netlify.app/ma-communaute-setup.exe
curl -s https://ma-communaute.netlify.app/version.json
gh release list --limit 3
```

## Ce que les deux workflows attendent

| Nom | Type | Rôle |
|---|---|---|
| `NETLIFY_AUTH_TOKEN` | secret | Le droit de déployer sur ton compte Netlify |
| `NETLIFY_SITE_ID` | secret | Quel site déployer |
| `URL_TELECHARGEMENT` | variable | L'adresse publique, pour le contrôle final |
| `GITHUB_TOKEN` | fourni | Automatique, rien à poser |

Site ID et URL ne sont pas confidentiels. Seul le jeton l'est : il donne le
droit de déployer. S'il fuite, on le révoque sur Netlify et on en pose un autre.

## Quand ça casse

| Symptôme | Cause la plus probable |
|---|---|
| Workflow vert, page sur l'ancienne version | Le déclencheur ne part pas — vérifier `workflow_run` |
| `Unauthorized: could not retrieve site` | `NETLIFY_AUTH_TOKEN` absent, périmé ou mal collé |
| `exit code 3` sur curl | URL malformée : caractère invisible dans la variable |
| `Aucun .exe dans la release` | La construction a échoué, ou aucune release n'existe |
| Push sans effet | Version inchangée, ou filtre de chemin non satisfait |

Le réflexe, dans tous les cas :

```bash
gh run list --limit 3
gh run view <id> --log-failed
```
