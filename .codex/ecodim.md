# Module Ecodim — école du dimanche

Ce document décrit le fonctionnement de l'onglet **Ecodim** : classes, moniteurs et enfants.

## Le principe

L'école du dimanche s'appuie sur trois notions :

- une **classe** regroupe les enfants d'une tranche d'âge (« Benjamins », 6 à 8 ans) ;
- un **moniteur** encadre une classe. Ce n'est pas une nouvelle personne : c'est un **membre
  de l'église**, déjà saisi dans l'onglet Membre. Le module ne stocke que le rattachement ;
- un **enfant** est inscrit à l'école du dimanche et rattaché à une classe. Contrairement au
  moniteur, il n'est pas membre : on enregistre donc son parent ou tuteur pour le contact ;
- un **culte** est le compte rendu d'un dimanche dans une classe : le cahier de texte ;
- une **évaluation** est un devoir passé par les enfants : locale, régionale ou nationale ;
- une **activité** est un rendez-vous de l'école du dimanche : culte des enfants, sortie,
  répétition, fête. Elle vise une classe précise ou toutes les classes.

Ce choix évite la double saisie. Le nom, le contact et la photo d'un moniteur viennent
toujours de sa fiche membre : les corriger à un seul endroit suffit. L'enfant, lui, n'est pas
membre : il a sa propre photo, portée par le module.

## Les tables

Décrites dans `server/src/db/schema.ts`, donc créées automatiquement sur SQLite **et** MySQL.

### `ecodim_classe`

| Colonne | Rôle |
|---|---|
| `idClasseEcodim` | identifiant |
| `libelleClasse` | nom de la classe, unique par église |
| `trancheAge` | libellé affiché, **calculé** depuis les bornes (« 6 à 8 ans ») |
| `ageMin`, `ageMax` | bornes numériques : tri des classes, filtres à venir |
| `descriptionClasse` | note libre |
| `actifClasse` | 1 par défaut |
| `idUtilisateur` | l'église propriétaire |

### `ecodim_moniteur`

| Colonne | Rôle |
|---|---|
| `idMoniteur` | identifiant |
| `idMembre` | **le membre** qui exerce comme moniteur |
| `idClasseEcodim`, `estPrincipal` | **hérités** : conservés pour les lignes antérieures, plus utilisés |
| `fonctionMoniteur` | fonction au bureau de l'école du dimanche, vide = aucune |
| `dateAffectation` | date de prise de fonction |
| `actifMoniteur` | 1 par défaut |
| `idUtilisateur` | l'église propriétaire |

`trancheAge` n'est plus saisi. Il l'était en plus des deux bornes, ce qui revenait à écrire
deux fois la même chose : rien n'empêchait alors d'afficher « 3 à 6 ans » au-dessus de 7 et
10. Le formulaire ne demande que les nombres et montre le libellé qui en découle ; il est
réécrit à chaque enregistrement par `construireTrancheAge`. La colonne reste en base pour
l'impression, l'export et la recherche — et pour les classes saisies avant ce changement,
que l'affichage sait encore lire.

Ce sont les **bornes** qui porteront les filtres, jamais la phrase : « 3 à 6 ans », « 3-6 »
et « de 3 à 6 » ne se comparent pas. Comme l'âge d'un enfant se déduit de sa date de
naissance, elles permettront de proposer la bonne classe à l'inscription.

### `ecodim_moniteur_classe`

Le rattachement d'un moniteur à une classe : `idMoniteur`, `idClasseEcodim`, `estPrincipal`.

Un moniteur encadre **une ou plusieurs classes**, et peut être responsable de l'une sans
l'être de l'autre. La responsabilité porte donc sur le **lien**, pas sur le moniteur — c'est
ce qui a imposé une table de liaison plutôt qu'une colonne.

Les moniteurs saisis avant cette table n'ont aucun lien : leur ancienne `idClasseEcodim` est
reprise automatiquement à la première lecture, une fois. Sans cela, ils auraient disparu de
leur classe du jour au lendemain.

Une classe expose `nomResponsable` et `idMoniteurResponsable`, renseignés depuis ce lien.

**Deux notions distinctes**, volontairement séparées :

- `estPrincipal` répond à « qui dirige cette classe ? ». Le serveur s'en sert pour remonter
  les responsables en tête de liste.
- `fonctionMoniteur` répond à « quelle fonction occupe-t-il au bureau ? » : directeur,
  secrétaire à l'organisation adjointe, trésorière, aumônier… Les valeurs sont stockées
  **sans accent** (`Tresoriere`, `Aumonier`) et affichées via `sections/ecodim/constantes.ts`,
  partagé par l'écran, l'impression et l'export.

Les confondre obligerait à choisir entre les deux : un directeur peut très bien encadrer une
classe. Dans les listes, un moniteur sans fonction au bureau s'affiche « Moniteur » plutôt
qu'une cellule vide, qui se lirait comme une donnée manquante.

### `ecodim_enfant`

Le dossier complet de l'enfant, calqué sur le **formulaire d'identification** du département
enfants, en cinq volets :

- **identité** : nom, prénoms, sexe, naissance, lieu d'habitation, n° d'appartement, contact ;
- **le père** et **la mère**, pris séparément : nom, prénoms, lieu d'habitation, profession,
  contact, et s'ils sont convertis ;
- **parent ou tuteur** : les colonnes `nomParentEnfant`, `contactParentEnfant`,
  `emailParentEnfant`, `adresseParentEnfant` **portent le tuteur**. Elles existaient déjà et
  c'est bien ce qu'elles contiennent : les dédoubler aurait créé deux sources pour la même
  information. S'y ajoutent `religionParents` (l'église des parents) et `tuteurConverti`,
  puis `vitAvec` — `Pere`, `Mere` ou `Tuteur` ;
- **parcours à l'Ecodim** : date et niveau d'entrée, niveau actuel, date et lieu du baptême
  dans le Saint-Esprit, date et motif de sortie, `categorieSortieEcodim`
  (`BaptemeEau`, `Demenagement`, `RaisonsEtude`, `Autres`) ;
- **situation sociale et départ** : `situationSociale` (`Eleve`, `Etudiant`, `Autres`), sa
  précision, date et motifs du départ.

`actifEnfant` vaut 1 par défaut. Toutes les valeurs à choix sont stockées **sans accent** et
traduites à l'affichage par les dictionnaires de `sections/ecodim/constantes.ts`.

`lieuHabitationEnfant` est distinct de l'adresse du parent : un enfant ne vit pas toujours
chez le parent déclaré, et c'est son domicile qu'on cherche pour une visite.

Le **sexe est obligatoire** et n'a que deux valeurs, `M` et `F`, affichées « Masculin » et
« Féminin » dans les formulaires, « Garçon » et « Fille » sur la fiche. Il n'y a plus de
« Non précisé » : une liste nominative d'école du dimanche sans cette information se prête mal
aux regroupements.

La colonne `photoEnfant` ne contient **pas l'image** mais le **nom du fichier** écrit dans le
dossier `ecodim-medias`, comme pour les photos de membres. La photo se choisit **dans le
formulaire** d'ajout ou de modification, comme pour un membre, et reste facultative ; elle
peut aussi être changée depuis la fiche de l'enfant.

Le formulaire renvoie trois choses différentes dans ce champ, que le serveur distingue :
une image en base64 (nouvelle photo, écrite puis nommée), le nom du fichier déjà stocké
(photo inchangée, conservée telle quelle) ou du vide (photo retirée, fichier effacé). Sans
cette distinction, rouvrir une fiche et l'enregistrer sans y toucher recopierait la photo à
chaque fois et le dossier se remplirait de doublons. Une base qui transporte des images
en base64 devient vite illisible et impossible à sauvegarder.

L'**âge n'est pas stocké** : il se calcule à partir de la date de naissance. Une donnée
saisie deux fois finit toujours par diverger.

### `ecodim_activite`

| Colonne | Rôle |
|---|---|
| `idActiviteEcodim` | identifiant |
| `titreActivite` | intitulé, par exemple « Culte des enfants » |
| `typeActivite` | type libre (culte, sortie, répétition, fête…) |
| `lieuActivite` | lieu |
| `dateDebutActivite`, `dateFinActivite` | dates |
| `heureDebutActivite`, `heureFinActivite` | horaires |
| `idClasseEcodim` | la classe visée, **vide = toutes les classes** |
| `idMoniteurDirigeant`, `idMoniteurEnseignant` | qui a dirigé, qui a enseigné |
| `textesBibliques` | les textes utilisés pendant l'activité |
| `nombreFilles`, `nombreGarcons` | l'effectif présent ; le total se calcule |
| `statutActivite` | `Planifiee`, `EnCours`, `Terminee`, `Annulee` |
| `actifActivite` | 1 par défaut |
| `idUtilisateur` | l'église propriétaire |

Les statuts sont stockés **sans accent** et traduits à l'affichage par un dictionnaire de
libellés (`Planifiee` → « Planifiée »), exactement comme les statuts de l'agenda. Accentuer
la valeur stockée casserait la correspondance avec les lignes déjà enregistrées.

### `ecodim_activite_image`

| Colonne | Rôle |
|---|---|
| `idImageActivite` | identifiant |
| `idActiviteEcodim` | l'activité illustrée |
| `fichierImage` | nom du fichier dans `ecodim-medias` |
| `legendeImage` | légende, vide par défaut |
| `idUtilisateur` | l'église propriétaire |

Une activité peut porter **plusieurs photos, ou aucune** : elles sont facultatives, sur le
modèle de « Nos évènements ». Supprimer l'activité supprime ses images et leurs fichiers.

Une sortie, une veillée de prière ou une fête des enfants se raconte comme un culte : c'est
pourquoi l'activité porte les mêmes informations de déroulement (dirigeant, enseignant, textes
bibliques, effectif) en plus de sa galerie.

La galerie s'affiche **directement dans le formulaire** de l'activité : on ajoute les photos
d'une sortie au moment où l'on saisit son compte rendu, sans passer par une autre fenêtre. Le
même composant (`GalerieActivite`) sert aussi de contenu à la fenêtre ouverte depuis le menu
de la ligne, pour consulter les photos sans ouvrir le formulaire.

Les photos s'ajoutent **une fois l'activité enregistrée** : chaque image est rattachée à une
activité, qui doit donc exister. Le formulaire le dit explicitement tant que l'activité est
nouvelle, plutôt que d'afficher un bouton qui échouerait.

La galerie ne dépend que de l'**identifiant** de l'activité, jamais de l'objet : montée dans
le formulaire, dont l'objet est recréé à chaque frappe, elle rechargerait sinon les images à
chaque caractère tapé.

### Comment les colonnes du dossier enfant sont écrites

`CHAMPS_ENFANT`, dans `server/src/communaute/ecodim/functions.ts`, est **la seule liste** :
les noms de colonnes de l'`INSERT`, ses points d'interrogation, les affectations de l'`UPDATE`
et les valeurs en sont tous dérivés.

Tenues séparément, ces listes se décalent d'un cran au premier champ ajouté, et la requête
écrit alors chaque donnée dans la colonne voisine — sans qu'aucune erreur ne soit levée. Le
dossier compte 43 colonnes : la vérification à l'œil n'était plus tenable.

### Où sont rangés les fichiers

Dans `ecodim-medias`, à côté de `photo-membre` et `galerie-evenements`, servi en statique sur
`/ecodim-medias`. Le client reconstruit l'adresse avec `buildEcodimMediaUrl(nomFichier)` : le
nom seul est stocké, l'hôte n'est jamais figé en base, ce qui laisse la même base fonctionner
en local et en ligne.

### `ecodim_culte`

Le **cahier de texte** : une ligne par dimanche et par classe.

| Colonne | Rôle |
|---|---|
| `dateCulte`, `idClasseEcodim` | le dimanche et la classe concernés |
| `idMoniteurDirigeant` | le moniteur qui dirige |
| `nomDirigeantExterne` | ou le nom libre de celui qui dirige sans être moniteur |
| `sujetsPriere`, `chantsCulte` | listes libres, **une entrée par ligne** |
| `idMoniteurEnseignant` | le moniteur qui enseigne |
| `nomEnseignantExterne` | ou le nom libre de celui qui enseigne sans être moniteur |
| `leconDuJour`, `passageBiblique`, `resumePredication`, `versetOr` | l'enseignement |
| `montantOffrande` | l'offrande du jour |
| `nombreFilles`, `nombreGarcons` | l'effectif ; le total n'est pas stocké, il se calcule |
| `nomSignatureEnseignant`, `nomSignatureResponsable`, `nomSignatureDirection` | les signatures |
| `observationsCulte` | note libre |

Chaque dimanche, une classe réunit un dirigeant et un enseignant. Ce sont souvent deux
moniteurs, mais rien n'empêche que ce soit la même personne : les deux champs sont
indépendants.

**Ni l'un ni l'autre n'est forcément moniteur.** Un pasteur de passage, un parent ou un invité
peut diriger ou enseigner : son nom se saisit alors librement, à côté du sélecteur. Les deux
champs d'un même poste **s'excluent** — choisir un moniteur efface le nom libre, et saisir un
nom libre détache le moniteur. Sans cela, on ne saurait plus qui a tenu le poste.

L'affichage passe par `nomIntervenant` : le nom du moniteur joint par le serveur s'il existe,
sinon le nom libre. La liste, la recherche et l'export n'ont ainsi pas à savoir lequel des deux
cas s'applique.

Les signatures stockent le **nom** et non l'identifiant du moniteur. Le cahier est un
document d'archive : si la directrice change l'an prochain, les cultes de cette année doivent
continuer de porter le nom de celle qui a signé. Les noms sont proposés automatiquement
(l'enseignant du jour, le responsable de la classe, la direction de l'école) mais restent
modifiables, et c'est le nom saisi qui est conservé.

Sujets de prière et chants sont des **listes libres**, stockées une entrée par ligne. On les
relit telles quelles, on ne filtre jamais dessus : des tables séparées auraient alourdi le
modèle sans rien apporter.

### `ecodim_evaluation` et `ecodim_note`

Une **évaluation** porte son intitulé, son type (`Locale`, `Regionale`, `Nationale`, stockés
sans accent), sa date, sa **classe**, son **barème** (`noteSur`) et son **coefficient**. Une
**note** relie un enfant à une évaluation.

### `ecodim_evaluation_classe`

Une évaluation est rattachée à **une ou plusieurs classes**, par cette table de liaison.

Une évaluation régionale ou nationale est **une seule épreuve**, passée par plusieurs classes.
La dupliquer par classe donnerait autant de colonnes pour un même devoir — c'est l'erreur que
corrige ce modèle. Elle reste donc une ligne, avec autant de rattachements que de classes.

**Au moins une classe est exigée** : les notes ne se comparent qu'entre enfants d'une même
classe, et le classement se fait classe par classe. Une évaluation sans classe n'aurait pas de
peloton.

La colonne `ecodim_evaluation.idClasseEcodim` subsiste pour les lignes antérieures mais ne
fait plus foi.

Le barème et le coefficient sont les deux raisons d'être de ce modèle. Comparer un 8/10 et un
12/20 sans les ramener à une échelle commune donnerait un classement faux, et toutes les
évaluations ne pèsent pas pareil dans l'année.

Une note **vide efface la ligne** au lieu d'enregistrer une chaîne vide : une absence de note
et un zéro ne sont pas la même chose, et un zéro fantôme ferait chuter la moyenne d'un enfant
qui n'a simplement pas composé.

Supprimer une évaluation supprime ses notes : laissées derrière, elles fausseraient les
moyennes en se rattachant à une évaluation disparue.

## Les routes

Toutes sous `/communaute`, toutes derrière le jeton d'authentification.

```
GET  /recupclasseecodimbyutilisateur/:idUtilisateur
POST /insererclasseecodim
POST /modifierclasseecodim
POST /supprimerclasseecodim

GET  /recupmoniteurecodimbyutilisateur/:idUtilisateur
POST /inserermoniteurecodim
POST /modifiermoniteurecodim
POST /supprimermoniteurecodim

GET  /recupenfantecodimbyutilisateur/:idUtilisateur
POST /insererenfantecodim
POST /modifierenfantecodim
POST /supprimerenfantecodim

GET  /recupactiviteecodimbyutilisateur/:idUtilisateur
POST /insereractiviteecodim
POST /modifieractiviteecodim
POST /supprimeractiviteecodim

POST /enregistrerphotoenfantecodim
GET  /recupimageactiviteecodim/:idActiviteEcodim?idUtilisateur=
POST /insererimageactiviteecodim
POST /supprimerimageactiviteecodim

GET  /recupculteecodimbyutilisateur/:idUtilisateur
POST /insererculteecodim
POST /modifierculteecodim
POST /supprimerculteecodim

GET  /recupevaluationecodimbyutilisateur/:idUtilisateur
POST /insererevaluationecodim
POST /modifierevaluationecodim
POST /supprimerevaluationecodim
GET  /recupnoteecodimbyutilisateur/:idUtilisateur
POST /enregistrernoteecodim
```

Les images arrivent en base64 dans le corps de la requête ; le serveur écrit le fichier et ne
garde que son nom. Remplacer la photo d'un enfant efface l'ancien fichier : sans cela le
dossier grossirait indéfiniment.

Les lectures suivent la convention `...byutilisateur/:idUtilisateur` : le middleware
d'authentification y reconnaît le périmètre et renvoie **403** si un compte tente de lire
les données d'une autre église.

Les listes renvoient des libellés joints — nom du membre moniteur, nom de la classe, nombre
d'enfants et de moniteurs par classe — pour que l'interface affiche des noms sans un
aller-retour par ligne.

## Les règles métier

- **Deux classes de même nom** dans une église sont refusées.
- **Un membre déjà moniteur** ne peut pas être ajouté une seconde fois. La liste déroulante
  ne propose d'ailleurs que les membres encore disponibles.
- **Une classe qui compte encore des enfants ou des moniteurs ne peut pas être supprimée.**
  On refuse plutôt que de détacher en silence : des enfants sans classe disparaîtraient des
  listes sans que personne ne comprenne pourquoi.
- **Retirer un moniteur ne touche pas au membre** : il reste dans l'église. Ses rattachements,
  eux, partent avec lui — sans quoi une classe compterait encore un moniteur disparu et
  refuserait d'être supprimée.
- **Un seul culte par classe et par date.** Deux saisies pour le même dimanche signalent
  presque toujours une double transcription du cahier papier.
- Un culte exige une **date** et une **classe**, au moins **trois sujets de prière** et
  **trois chants**.
- **Supprimer un enfant efface sa photo**, supprimer une activité efface ses images. Un
  fichier orphelin n'est jamais récupérable par l'interface.
- Les photos sont limitées à **5 Mo** et refusées si le fichier n'est pas une image.

## L'interface

`src/sections/ecodim/view/ecodim-view.tsx` — un écran, cinq onglets (Classes, Moniteurs,
Enfants, Cultes, Activités), une recherche commune et des cartes de totaux.

Les cinq tableaux sont **paginés**, avec les mêmes réglages que la liste des membres : 5, 10
ou 25 lignes. Changer d'onglet ou lancer une recherche ramène en première page — rester en
page 3 d'une liste qui n'en compte plus qu'une afficherait un tableau vide sans explication.

La colonne **Actions** de chaque tableau est un menu **…**, repris de la liste des membres
(`view/row-actions.tsx`) pour que les deux écrans se manipulent de la même façon. Son contenu
dépend du volet ; pour un enfant : **Détail**, **Modifier**, **Fiche de suivi** (navigateur
seulement) et **Supprimer**. Une action indisponible est **retirée** du menu plutôt que
grisée : une entrée grisée sans explication n'apprend rien.

### Les pages de détail

Trois entités ont leur page, atteignable par **double-clic** sur la ligne ou par l'entrée
**Détail** du menu :

| Page | Ce qu'elle rassemble |
|---|---|
| `/ecodim/enfant/:id` | le dossier complet, la photo, les deux formulaires imprimables |
| `/ecodim/classe/:id` | ses moniteurs, ses enfants, ses derniers cultes |
| `/ecodim/moniteur/:id` | ses classes, les cultes qu'il a tenus, ses activités |

Les trois se naviguent entre elles : depuis une classe on ouvre un de ses moniteurs ou un de
ses enfants, depuis un moniteur on ouvre une de ses classes. Un moniteur renvoie aussi à sa
**fiche membre**, qui porte son état civil — un moniteur n'est pas une personne en soi, c'est
un membre dans un rôle, et dupliquer son identité ici créerait une seconde vérité.

Les cultes et les activités **n'ont pas** de page de détail : leur écran d'édition montre déjà
tout, et une page de consultation n'en serait que la copie en lecture seule.

Leur mise en page commune — bannière, cartes, lignes « libellé / valeur » — vit dans
`view/fiche-elements.tsx`.

La fiche d'un enfant est une **page**, `view/enfant-detail/enfant-detail.tsx`, exactement comme
celle d'un membre : son adresse propre, un bandeau coloré, la photo en médaillon, les puces de
repère, puis les cartes thématiques. C'était une boîte de dialogue ; une page se partage par
lien, se rouvre après un rafraîchissement et porte ses propres boutons d'impression — ce qu'une
fenêtre ne permet pas.

Le double-clic est repris de la liste des membres : sur une ligne aussi large, un simple clic
se déclenche trop facilement.

### Choisir un parent parmi les membres

Les parents des enfants sont très souvent membres de l'église. `view/selecteur-membre.tsx`
place, au-dessus de chaque bloc (le père, la mère, le parent ou tuteur), une liste déroulante
avec recherche qui **remplit les champs d'un coup** : nom, prénoms, contact, lieu d'habitation
et profession, et marque la personne comme convertie — elle est membre.

Les champs restent ensuite librement modifiables, et un parent qui n'est pas membre se saisit
simplement à la main : le sélecteur est facultatif. La recherche ignore les accents, « Ake »
trouvant « Aké ».

Ce que le sélecteur fait est une **recopie**, pas un lien : l'identifiant du membre n'est pas
conservé. Un parent dont le numéro change dans sa fiche membre ne se met donc pas à jour
automatiquement dans le dossier de l'enfant.

Chaque carte de total (Classes, Moniteurs, Enfants, Cultes, Activités) porte un bouton **+** qui bascule
sur le bon onglet et ouvre directement le formulaire d'ajout, comme dans « Cas sociaux ».
Cliquer la carte elle-même change simplement d'onglet.

Les boutons **Imprimer** et **Excel** ne sont montés que **hors application desktop**,
conformément à l'usage du projet :

- `etats/ecodim-print.tsx` propose les quatre listes et réutilise la mise en page d'impression
  commune, plus la **fiche de suivi vierge** ;
- `etats/fiche-suivi-enfant.tsx` reprend le formulaire officiel du département enfants ;
- `etats/ecodim-excel.ts` produit un seul classeur à quatre feuilles (une par onglet), nommé
  `ecodim-<eglise>-<date>.xlsx`. Le nom de fichier est désaccentué : certains systèmes de
  fichiers et clients de messagerie abîment les accents.

Deux fenêtres complètent les listes :

- un **double-clic** sur la ligne d'un enfant, ou l'entrée **Détail** du menu, ouvre sa
  **page** `/ecodim/enfant/:id` : la fiche complète
  avec l'avatar, l'identité, le parent ou tuteur, et l'ajout ou le remplacement de la photo ;
- **Photos** sur une ligne activité ouvre `view/activite-images-dialog.tsx` : la galerie de
  l'activité, avec envoi de plusieurs fichiers à la fois et suppression image par image.

L'envoi multiple est **séquentiel** : un lot de photos prises au téléphone dépasse vite la
taille de requête acceptée si on les envoie toutes ensemble.

Les écritures émettent des événements socket (`ajouterClasseEcodim`, `modifierMoniteurEcodim`,
`supprimerEnfantEcodim`…) : un poste qui ajoute un enfant met à jour l'écran des autres postes
sans rechargement.

## Les formulaires papier

Deux documents du département enfants sont repris à l'identique, et s'impriment de la même
façon : **vierges** depuis le menu Imprimer, pour en tirer un jeu à remplir à la main, ou
**pré-remplis** depuis le menu d'une ligne enfant.

Leur mise en page commune — pointillés, lignes « LIBELLÉ : valeur », bandeaux de section,
cartouche d'en-tête — vit dans `etats/fiche-commune.tsx`. Chaque formulaire garde en revanche
sa propre règle `@page` **nommée** (voir plus bas).

**Rien n'est écrit en dur dans l'en-tête.** Le nom de l'église, son logo et ses coordonnées
viennent des paramètres, via `useIdentiteEglise`. Les formulaires d'origine portent l'en-tête
d'une fédération précise ; imprimés ici, ils portent celui de l'église qui les imprime.

### Le formulaire d'identification de l'enfant

`etats/formulaire-identification-enfant.tsx` reprend le formulaire d'inscription : identité de
l'enfant avec sa photo d'identité, situation parentale (père, mère, tuteur, conversion),
situation à l'Ecodim, situation sociale, départ, puis les signatures du parent ou tuteur et du
directeur.

Sont repris des données de l'application : nom, prénoms, date et lieu de naissance, lieu
d'habitation, sexe, contact, classe, niveau scolaire, activité et photo.

**Tous les champs du formulaire se remplissent désormais automatiquement**, hormis les deux
signatures du bas, qui se posent au stylo. Un dossier complet donne un formulaire complet ;
un dossier partiel laisse en pointillés ce qui n'est pas renseigné, et la mise en page ne
change pas.

Les cases à cocher suivent la même règle en trois états : cochée quand la réponse est connue
et positive, vide et **barrable à la main** quand le dossier ne dit rien, vide aussi quand la
réponse est négative. Une absence de réponse et un « non » ne sont pas la même chose, et le
formulaire papier ne sait distinguer que par la case cochée.

### La fiche de suivi de l'enfant

`etats/fiche-suivi-enfant.tsx` reproduit le formulaire papier du département enfants. Sont repris des données de l'application : pour l'enfant, son nom, ses prénoms, sa date et son
lieu de naissance, sa classe et sa **photo** dans l'encadré prévu.

Restent à remplir à la main, faute d'être suivis dans l'application :

- la **région** ecclésiastique et le **groupe Ecodim**, qui relèvent de l'organisation
  régionale et ne sont pas des données de l'église ;
- les **notes** (évaluations locales, régionale, nationale, participation, conduite) et le
  **tableau d'assiduité** sur douze mois, qui se remplissent au stylo pendant l'année ;
- les **observations des moniteurs** et les signatures.

L'année ecclésiastique est déduite de la date du jour, en considérant qu'elle démarre en
septembre : imprimée en octobre 2026, la fiche porte « 2026 / 2027 ».

### Un piège d'impression à connaître

La fiche déclare une règle `@page` **nommée** (`ficheSuiviPortrait`), pas une règle anonyme.
Plusieurs documents imprimables restent montés en même temps dans la page, et `react-to-print`
recopie toutes les balises `<style>` dans son cadre d'impression : une règle `@page` générique
déclarée par un autre document écraserait la nôtre, à spécificité égale la dernière l'emportant.
Le même piège est documenté dans `sections/user/etats/listeMembrePdf.tsx`.

Pour la même raison, chaque document du menu Imprimer possède **sa propre référence**.
`react-to-print` lit le contenu au moment du clic : partager une référence unique avec un état
« document courant » imprimait le document précédemment sélectionné.

## Les évaluations

L'onglet **Évaluations** n'est pas une liste mais une **grille** : les enfants de la classe en
lignes, les évaluations en colonnes, la **moyenne** et le **rang** au bout. On choisit une
classe, éventuellement un type d'évaluation, on saisit les notes, on enregistre d'un bloc.

Le but n'est pas d'archiver des notes mais de **comparer** : l'école récompense chaque année
les meilleurs de chaque classe. Les **trois premiers** sont donc mis en avant par une pastille,
et le classement est la colonne qui justifie tout le reste.

La moyenne ramène chaque note sur 20, puis la pondère par son coefficient :

```
moyenne = Σ (note / barème × 20 × coefficient) / Σ coefficient
```

Un enfant qui a 18/20 à une évaluation de coefficient 1 passe ainsi derrière celui qui a 8/10
à une évaluation de coefficient 3 — ce qui est le but.

Le formulaire propose un **choix multiple** de classes, avec un bouton « Sélectionner toutes
les classes » pour les évaluations communes à toute l'école.

L'**année ecclésiastique** est proposée d'office, au format « 2026-2027 », et démarre en
septembre comme sur la fiche de suivi.

Le tableau est **quadrillé** comme un tableur : sans bordures, on ne voit pas où commence et
où finit la case à remplir.

La grille s'exporte en **Excel** et en **PDF**. Le PDF n'imprime pas la grille de saisie, qui
sortirait en champs de formulaire, mais un tableau de texte construit à partir des mêmes
lignes. Les en-têtes y rappellent le barème et le coefficient : sorti du tableau, un « 8 » sans
son « /10 » ne veut plus rien dire.

## Le cahier de texte

`view/culte-editor-dialog.tsx` s'ouvre en **plein écran**, le plan à gauche et les sections à
droite, sur le modèle d'un éditeur de rapport : informations générales, direction du culte,
enseignement, offrande et présences, signatures. Une page unique obligerait à faire défiler
sans repère, alors que le cahier papier se lit section par section.

On valide une seule fois, en haut à droite. Un clic sur une ligne de la liste rouvre le même
écran pour corriger.

Le **total des enfants** est calculé, jamais saisi : un troisième nombre entré à la main
finirait par contredire les deux qu'il additionne.

Les moniteurs proposés sont **ceux de la classe choisie**. Si la classe n'en compte aucun,
la liste complète reste proposée plutôt que de bloquer la saisie.

Deux composants internes (`Section`, `ListeLignes`) sont définis **hors du corps du
composant**. Déclarés à l'intérieur, ils seraient recréés à chaque rendu : React remonterait
tout leur sous-arbre et le champ en cours de saisie perdrait le focus à chaque caractère tapé.

## Droits d'accès

Le module est contrôlé par la permission `ecodim`, déclarée dans
`src/utils/access-control.ts`. Elle apparaît donc dans les permissions attribuables aux
utilisateurs secondaires, et l'entrée de menu disparaît pour qui ne l'a pas.

## Ce qui n'est pas fait

Volontairement hors périmètre pour cette première version :

- la **création de comptes** pour les moniteurs ou les parents ;
- les **présences** par activité : l'activité est planifiée, mais personne n'est encore
  pointé. C'est la suite naturelle, et le modèle `deeadci` prévoyait pour cela une table
  `participants_activites` avec un indicateur de présence ;
- le suivi pédagogique et les ressources ;
- la **photo du moniteur** propre au module : c'est celle de sa fiche membre.

Ces briques existent dans le projet d'origine `deeadci` et pourront être reprises ensuite.
