# Page de téléchargement — Ma Communauté

Une page, un bouton. C'est l'adresse qu'on donne à un nouveau client pour qu'il
installe l'application. Elle ne mentionne jamais GitHub.

```
telechargement/
├── index.html      la page (ne change jamais)
├── version.json    le numéro de version et les nouveautés
└── assets/         logo et favicon
```

## Publier une nouvelle version : rien à faire

Tout est automatique. Tu montes le numéro de version dans `package.json`, tu
pousses, et la chaîne se déroule seule :

1. `desktop-release.yml` construit l'installateur et publie la release ;
2. `deploy-telechargement.yml` la reprend, reconstruit `version.json` et envoie
   la page **et** l'installateur sur Netlify.

Les nouveautés affichées viennent du **texte de ta release GitHub** : seules
les lignes commençant par un tiret, les six premières. Écris-les pour un
pasteur, pas pour un développeur.

Le `version.json` du dépôt ne sert que de repli, quand un déploiement est
déclenché par une simple retouche de la page :

```json
{
  "version": "1.0.13",
  "date": "2026-10-24",
  "taille": "93 Mo",
  "nouveautes": ["Une phrase par nouveauté"]
}
```

La mise en place, à faire une fois : [MISE-EN-PLACE.md](MISE-EN-PLACE.md).

## Le piège à connaître : écraser dans Git ne libère rien

L'exécutable **ne doit pas** être versionné avec la page.

Git conserve **chaque version passée** de chaque fichier. Remplacer un
exécutable de 93 Mo par un autre n'enlève pas l'ancien : il reste dans
l'historique, pour toujours. Après dix sorties, le dépôt pèse près d'un
gigaoctet alors qu'un seul fichier est visible — et le déploiement finit par
être refusé.

D'où le choix retenu : l'installateur n'entre jamais dans le dépôt. Le workflow
le reprend de la dernière release GitHub à chaque déploiement, et l'envoie sur
Netlify à côté de la page. Un garde-fou refuse d'ailleurs tout `.exe` commité
dans ce dossier.

## Où vit l'exécutable

Sur **le même site Netlify que la page**, déposé par le workflow à chaque
version. Le lien de la page reste donc relatif, et rien n'est à tenir à jour.

Le détail du choix — et pourquoi ni Cloudflare R2, ni Cloudflare Pages, ni un
proxy Netlify ne convenaient — est dans [MISE-EN-PLACE.md](MISE-EN-PLACE.md).

## Ce que la page ne fait pas

- **Elle ne filtre personne.** Qui a l'adresse télécharge. Un code d'accès par
  client demanderait une petite fonction serveur : une page statique ne peut
  rien garder secret, son code est lisible par le visiteur.
- **Elle ne sert pas aux mises à jour.** Les postes déjà installés les reçoivent
  directement dans l'application. Cette page ne sert qu'à la **première**
  installation.
- **Elle ne garde aucun historique.** Une seule version est proposée, la plus
  récente. C'est voulu : personne ne doit pouvoir installer une version d'il y a
  six mois.
