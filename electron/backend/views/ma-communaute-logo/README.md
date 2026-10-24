# Ma Communauté — Guide d'utilisation du logo

Le symbole est un **« m » dont le jambage central s'élève pour devenir une croix**. Les trois jambages représentent les membres de l'Église ; la croix naît au cœur de la communauté et la porte.

---

## Quel fichier utiliser ?

| Usage | Fichier |
|---|---|
| Site web, documents, en-têtes (fond clair) | `svg/ma-communaute-horizontal.svg` |
| Fond sombre ou photo foncée | `svg/ma-communaute-horizontal-fond-sombre.svg` |
| Affiches, bannières, couvertures (format haut) | `svg/ma-communaute-empile.svg` (fond sombre : `…-empile-fond-sombre.svg`) |
| Photo de profil réseaux sociaux, tampon, petit espace | `svg/ma-communaute-symbole.svg` |
| Impression une couleur, photocopie, gravure | `svg/ma-communaute-horizontal-noir.svg`, `svg/ma-communaute-symbole-noir.svg` |
| Sérigraphie / broderie sur tissu foncé | `svg/ma-communaute-horizontal-blanc.svg` |
| Le nom seul (pied de page, mentions) | `svg/ma-communaute-nom-seul.svg` |
| **App Store (iOS) et Google Play** | `icones-app/ma-communaute-icone-app-carre-1024.png` (carré : le store arrondit lui-même les coins) |
| Icône Android (launcher) | `icones-app/ma-communaute-icone-app-carre-192.png` / `-512.png` |
| Présentations, maquettes (icône déjà arrondie) | `icones-app/ma-communaute-icone-app-1024.png` |
| Site web (onglet du navigateur) | dossier `favicon/` (voir plus bas) |

Les fichiers **SVG** sont vectoriels : ils s'agrandissent à l'infini sans perte. Utilisez-les en priorité (site, application, imprimeur). Les **PNG** (dossier `png/`, fond transparent) servent pour Word, PowerPoint, WhatsApp, etc.

---

## Couleurs

| Nom | HEX | RVB | CMJN (approx.) | Rôle |
|---|---|---|---|---|
| **Bleu royal** | `#3557D4` | 53, 87, 212 | 75 / 59 / 0 / 17 | Le « m », fond de l'icône |
| **Or** | `#F0AE2E` | 240, 174, 46 | 0 / 27 / 81 / 6 | La croix — à réserver à la croix et aux accents |
| **Bleu nuit** | `#1E2A5A` | 30, 42, 90 | 67 / 53 / 0 / 65 | Le nom, les textes |
| Blanc | `#FFFFFF` | 255, 255, 255 | 0 / 0 / 0 / 0 | Fonds, version inversée |

Les valeurs CMJN sont des conversions approximatives : pour une impression professionnelle, demandez à l'imprimeur une épreuve couleur (ou des références Pantone équivalentes).

---

## Typographie

Le nom est écrit en **Outfit SemiBold (600)**, en minuscules, avec un interlettrage légèrement resserré.

- Police gratuite (licence libre SIL OFL) : https://fonts.google.com/specimen/Outfit
- Dans les fichiers du logo, le texte est **vectorisé** : il s'affiche correctement même sans la police installée.
- Pour les titres de l'application et des supports, utilisez Outfit (SemiBold pour les titres, Regular pour le texte courant) afin de rester cohérent avec le logo.

---

## Règles d'utilisation

**Zone de protection** — Laissez autour du logo un espace vide au moins égal à la **largeur d'un jambage du « m »** (environ la hauteur de la lettre « a » du nom). Aucun texte ni image ne doit y entrer.

**Taille minimale**
- Logo horizontal : 120 px de large à l'écran, 30 mm à l'impression.
- Symbole seul : 24 px à l'écran, 8 mm à l'impression.
- En dessous de ces tailles, utilisez le symbole seul ou l'icône d'application.

**À ne pas faire**
- Ne pas changer les couleurs (en particulier, la croix reste en or ou dans la couleur unique du logo).
- Ne pas étirer, déformer, pencher ou faire pivoter le logo.
- Ne pas ajouter d'ombre, de contour, de dégradé ou d'effet 3D.
- Ne pas mettre la version couleur (texte bleu nuit) sur un fond sombre : utilisez la version « fond sombre ».
- Ne pas réécrire le nom avec une autre police à côté du symbole.

---

## Favicon (site web)

Copiez le contenu du dossier `favicon/` à la racine du site, puis ajoutez dans le `<head>` :

```html
<link rel="icon" href="/favicon.ico" sizes="any">
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32.png">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
```

`icon-192.png` et `icon-512.png` servent au manifeste PWA (`manifest.json`) si l'application est aussi disponible en version web.

---

## Avant un dépôt de marque

Ce logo est une création originale. Avant de le déposer comme marque ou de l'imprimer à grande échelle, il est prudent de faire une recherche d'antériorité (par exemple auprès de l'OAPI pour l'Afrique francophone, ou de l'INPI / l'EUIPO selon les pays visés).
