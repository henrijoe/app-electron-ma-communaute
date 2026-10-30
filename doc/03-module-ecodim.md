# 03 — Module Ecodim

L'école du dimanche. C'est le module le plus fourni du projet : huit onglets,
une quinzaine de tables, et les états officiels du département enfants.

`src/sections/ecodim/view/ecodim-view.tsx` porte l'écran principal. Trois
onglets sont des composants à part, parce qu'ils ne sont pas des listes :
`evaluations-grille.tsx`, `assiduite-grille.tsx` et `finances-grille.tsx`.

## Les huit onglets

| # | Onglet | Table | Ce qu'on y fait |
|---|---|---|---|
| 0 | Classes | `ecodim_classe` | Tranches d'âge, responsable, effectifs |
| 1 | Moniteurs | `ecodim_moniteur` + `ecodim_moniteur_classe` | Encadrants, pris parmi les membres |
| 2 | Enfants | `ecodim_enfant` | Le dossier complet de chaque enfant |
| 3 | Cultes | `ecodim_culte` | Le cahier de texte, une ligne par dimanche et par classe |
| 4 | Évaluations | `ecodim_evaluation` + `ecodim_note` | Les notes, saisies en grille |
| 5 | Activités | `ecodim_activite` | Sorties, veillées, fêtes |
| 6 | Assiduité | `ecodim_presence` | L'appel du dimanche |
| 7 | Finances | `ecodim_finance` | La caisse du département |

> **L'ordre des onglets est un identifiant.** Tout l'écran raisonne en
> positions (`onglet === 3`, `onglet === 6`...). Un onglet inséré au milieu
> décale tous les suivants. C'est pourquoi Finances a été ajouté **en dernier**,
> même si sa place logique serait ailleurs.

## Les filtres sont propres à chaque onglet

Une barre partagée — recherche, classe, mois, année, moniteur — mais **chaque
onglet n'affiche que les filtres qui agissent sur lui**. `FILTRES_PAR_ONGLET`
décide :

| Onglet | Classe | Mois / Année | Moniteur |
|---|:---:|:---:|:---:|
| Classes | ✅ | — | — |
| Moniteurs | ✅ | — | ✅ |
| Enfants | ✅ | — | — |
| Cultes | ✅ | ✅ | ✅ |
| Activités | ✅ | ✅ | ✅ |
| Finances | — | ✅ | — |

Sur Classes ou Enfants, choisir « Mars » ne changeait rien : ces lignes n'ont pas
de date. Un filtre qui ne change rien là où il est posé est une promesse que
l'écran ne tient pas.

**Deux conséquences à ne pas perdre de vue :**

Les valeurs de filtre **persistent d'un onglet à l'autre**. Quand un filtre est
retiré d'un onglet, la condition correspondante doit l'être aussi du calcul —
sinon il continue d'agir en coulisse depuis un champ devenu invisible. C'est
pour cette raison que `financesFiltrees` ignore la classe.

La table ne décide que de l'**affichage**. Ce qui est appliqué reste décidé par
chaque liste : les cartes du haut comptent les huit volets à la fois, et la carte
Cultes doit suivre le mois même quand on regarde l'onglet des classes.

Le **select Année** n'est pas une plage calculée : il relève les années
réellement présentes dans les cultes, activités, évaluations et finances.
Proposer une année sans aucune ligne donnerait un tableau vide sans explication.
→ Toute source datée sur laquelle le filtre agit doit figurer dans ce balayage.

## Enfants

Le dossier le plus riche du projet — une cinquantaine de colonnes, parce qu'il
suit les deux formulaires papier officiels du département.

**Inscription.** Tous les enfants qui fréquentent l'Ecodim sont saisis, mais tous
ne sont pas inscrits. `inscritEcodim` dit lesquels le sont et
`dateInscriptionEcodim` depuis quand. Cocher la case propose la date du jour :
c'est le cas le plus courant, et une inscription sans date ne s'enregistre pas.
`dateEntreeEcodim` répond à une autre question — depuis quand l'enfant vient,
inscrit ou non.

**Inscription par QR code.** Même principe que pour les membres. Un parent remplit
le formulaire depuis son téléphone ; la fiche arrive dans
`ecodim_enfant_demande` et n'entre dans la liste qu'après validation. Le dépôt
est public, la lecture et le traitement exigent une session.

## Assiduité

Deux vues, deux usages.

**L'appel** : une grille enfants × dimanches d'un mois. C'est la forme de la
fiche papier, et elle permet de rattraper un mois entier d'un coup. Un clic fait
défiler les statuts :

| Lettre | Valeur stockée | Sens |
|---|---|---|
| P | `present` | Présent |
| A | `absent` | Absent |
| D | `deplacement` | En voyage, chez de la famille |
| *(vide)* | aucune ligne | **Pas appelé** — ce n'est pas une absence |

La case vide est le point important : l'enfant n'a pas été appelé, et sa fiche de
suivi doit rester vide pour ce dimanche.

**Un dimanche à venir ne se pointe pas.** La grille affiche le mois entier ; sans
ce verrou, on pouvait ouvrir novembre fin octobre et marquer des présences pour
une classe qui n'a pas eu lieu. Le blocage se fait par dimanche, pas par mois :
dans le mois en cours, les dimanches passés restent saisissables. Les dimanches à
venir sont écartés une seconde fois à l'enregistrement — la saisie les refuse
déjà, mais un brouillon peut leur survivre.

Une présence est rattachée à une **séance**, pas à une date libre : la séance
porte déjà le dimanche, la classe et la leçon. Un dimanche sans séance en fait
naître une à l'enregistrement — si des enfants étaient là, c'est bien qu'il y a
eu classe.

**La synthèse** répond à la question posée : qui vient fidèlement ? Certains
enfants ne sont pas scolarisés et n'auront jamais de notes ; leur assiduité est
la seule chose qui les distingue, et c'est elle qu'on récompense.

> Seules les **lignes** sont paginées. La ligne « Présents » et le compteur de
> chaque colonne portent sur la classe entière : c'est ce chiffre qu'on recopie
> sur le registre, et un total réduit à la page affichée serait faux.

## Finances

La caisse du département, tenue à part de la comptabilité de l'église — offrande
des enfants, cotisation d'une sortie, achat de cahiers, goûter d'une fête.

Une ligne par mouvement, une recette **ou** une dépense. Le type décide lequel
des deux montants est renseigné, l'autre reste à zéro : les additionner en
aveugle sur une ligne mal saisie fausserait tout le solde.

Les montants sont des **entiers** — le franc CFA n'a pas de centimes, et un réel
introduirait des arrondis là où il n'y en a pas.

**Supprimer, c'est mettre à la corbeille.** Une caisse ne se corrige pas en
effaçant : une ligne retirée reste consultable avec son motif, pour que le point
financier d'un mois passé puisse toujours s'expliquer. Les routes de restauration
et de purge définitive existent côté serveur ; l'écran de corbeille reste à
faire.

> L'offrande de l'école du dimanche a quitté le relevé de culte pour cette
> caisse. La colonne `culte.offrandeEcodim` reste en base et n'est plus écrite :
> les relevés déjà saisis gardent leur montant, et la fiche détail d'un culte
> l'affiche sur une ligne marquée « ancien relevé ».

## Les états officiels

Les fiches du département enfants sont reproduites à l'identique — même bleu
(`#1F3864`), même police, même cartouche — pour qu'une fiche imprimée se range
sans détonner à côté de celles remplies à la main.

| Document | Rempli par |
|---|---|
| Fiche d'inscription de l'enfant | Le dossier de l'enfant |
| Fiche de suivi de l'enfant | Le dossier **et l'assiduité**, qui remplit le tableau toute seule |
| Formulaire d'identification | Le dossier |

Rien n'est écrit en dur dans l'en-tête : le nom, le logo et les coordonnées
viennent des paramètres de l'église. Les formulaires d'origine portent l'en-tête
d'une fédération précise ; imprimés ici, ils portent celui de l'église qui les
imprime.

Voir [05 — États et exports](05-etats-et-exports.md) pour les pièges
d'impression.
