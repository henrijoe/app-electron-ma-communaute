# Mise en place — à faire une seule fois

**Aucune carte bancaire n'est demandée.** Dix minutes, trois étapes.

Après ça, publier une version ne demande plus rien : tu montes le numéro de
version, tu pousses, et l'installateur se retrouve seul sur la page.

---

## 1. Créer le compte Netlify

<https://app.netlify.com/signup> — se connecter avec GitHub est le plus rapide.
Le plan gratuit suffit : **100 Go de trafic par mois**, soit environ un millier
de téléchargements de 93 Mo.

## 2. Créer le site

Tableau de bord → *Add new site* → **Deploy manually**.

Glisser le dossier `telechargement/` dans la zone prévue. Le site est en ligne
immédiatement, à une adresse du type `https://chose-machin-123.netlify.app`.

Deux choses à faire ensuite, dans **Site configuration** :

- **Change site name** → mettre quelque chose de présentable, par exemple
  `ma-communaute`. L'adresse devient `https://ma-communaute.netlify.app`.
- Noter le **Site ID**, affiché juste en dessous.

> Ce premier dépôt manuel n'a pas encore l'installateur : le bouton ne
> fonctionnera qu'après le premier passage du workflow. C'est normal.

## 3. Créer le jeton d'accès

**Mon profil** (en haut à droite) → *Applications* → **Personal access tokens**
→ *New access token*.

Le copier : Netlify ne le réaffiche jamais.

## 4. Déposer les deux secrets sur GitHub

Dépôt `app-electron-ma-communaute` → **Settings** → *Secrets and variables* →
**Actions**.

Onglet **Secrets**, *New repository secret*, deux fois :

| Nom | Valeur |
|---|---|
| `NETLIFY_AUTH_TOKEN` | le jeton de l'étape 3 |
| `NETLIFY_SITE_ID` | le *Site ID* de l'étape 2 |

Onglet **Variables**, *New repository variable*, une fois :

| Nom | Valeur |
|---|---|
| `URL_TELECHARGEMENT` | `https://ma-communaute.netlify.app` — **sans barre oblique finale** |

> Pourquoi une *variable* et non un *secret* : cette adresse n'est pas
> confidentielle, c'est celle que tu donnes à tes clients. En variable, elle
> reste lisible dans les journaux, ce qui aide quand un déploiement échoue.

## 5. Lancer le premier déploiement

Onglet **Actions** → *Page de telechargement* → **Run workflow**.

Il reprend l'installateur de ta dernière release, construit le manifeste et
envoie le tout sur Netlify. Deux minutes.

---

## Ce qui se passe ensuite, tout seul

| Ce que tu fais | Ce qui arrive |
|---|---|
| Tu modifies `telechargement/` et tu pousses | La page est redéployée, l'installateur est repris au passage |
| Tu montes la version et tu pousses | `desktop-release.yml` publie la release, puis la page se met à jour seule |

**Rien à modifier dans `index.html`, jamais.** La page et l'installateur vivent
sur le même site, le lien est donc relatif et ne change pas d'une version à
l'autre.

Les nouveautés affichées sont **reprises du texte de ta release GitHub** :
seules les lignes commençant par un tiret, les six premières. Écris-les en
langage de pasteur, pas de développeur. Sans notes de release, la page garde
celles écrites à la main dans `version.json`.

---

## Pourquoi pas Cloudflare R2

C'était mon premier conseil, et il demandait une carte bancaire — même sans
rien prélever. Écarté.

Les autres pistes examinées, et pourquoi elles ne tiennent pas :

| Piste | Pourquoi non |
|---|---|
| **Cloudflare Pages** | Plafond strict de **25 Mo par fichier**. L'installateur en fait 93. |
| **Proxy Netlify vers GitHub** | Le proxy coupe à **26 secondes**. Un fichier de 93 Mo sur une connexion ivoirienne dépasse largement. |
| **Supabase Storage** | 5 Go de trafic par mois, soit à peine 53 téléchargements. Le quota se coupe sans prévenir. |

Netlify sert ici l'installateur comme un fichier statique ordinaire, pas à
travers un proxy : le timeout de 26 secondes ne s'applique pas.

> **Le point à surveiller.** Netlify ne documente pas de limite stricte par
> fichier, et leur support parle de limites « pratiques » plutôt que d'un
> plafond. Je n'ai pas pu le vérifier sur un fichier de 93 Mo. Si le
> déploiement était refusé, le repli sûr est un **second dépôt GitHub public
> ne contenant que les installateurs** : trafic illimité, 2 Go par fichier, et
> aucun code source visible. Le client verrait une adresse `github.com`, mais
> ne tomberait sur rien d'autre que des installateurs.

## Si ça coince

| Symptôme | Cause la plus probable |
|---|---|
| Le bouton télécharge un fichier vide ou renvoie 404 | Le workflow n'est jamais passé — le lancer à l'étape 5 |
| La page affiche « la plus récente » sans numéro | `version.json` absent du site : même cause |
| Le workflow échoue sur `gh release download` | Aucune release publiée sur le dépôt |
| La page ne se redéploie pas après un push | Tu as poussé hors de `telechargement/` : le filtre de chemin est volontaire |
