# 04 — Membres et accès

## Le registre des membres

`src/sections/user/` — le module le plus utilisé de l'application.

Chaque membre porte un **matricule** `M2026-000001`, attribué à
l'enregistrement et jamais modifié (voir [02](02-base-de-donnees.md)). C'est lui
qu'on dicte au téléphone, et le seul qui distingue deux homonymes à coup sûr. Il
apparaît en tête du tableau, sur la fiche détail, dans l'export Excel, sur la
liste imprimée, et la recherche le trouve.

**Les décès retirent le membre de partout.** Le filtre est en SQL, et il doit
suivre la personne dans tous les rôles qu'elle occupe — voir
[02](02-base-de-donnees.md).

### Inscription par QR code

Un visiteur scanne l'affiche, remplit le formulaire depuis son téléphone, et sa
fiche arrive dans `membre_inscription_demande`. **Rien n'entre dans la liste des
membres avant validation** par un responsable.

Le réglage « un responsable doit valider chaque inscription » est dans
Paramètres. Désactivé, les fiches entrent directement — utile un dimanche de
forte affluence, où personne n'a le temps de les valider une par une. Un
anti-doublon (nom + téléphone) reste actif dans les deux cas.

Le lien du QR code contient l'adresse réseau du poste, l'identifiant de l'église
et son nom : le téléphone qui scanne sait à quelle église rattacher la demande.

## Les comptes secondaires

Une église peut ouvrir jusqu'à **5 comptes** en plus du compte principal.
Paramètres → « Utilisateurs et droits d'accès ».

**Un compte part toujours d'un membre.** Le formulaire commence par un choix du
membre de l'église ; sélectionner quelqu'un remplit son nom, son prénom, son
téléphone et son email. Un accès se donne à quelqu'un que l'église connaît.

- Les champs restent modifiables : le nom d'utilisateur sert à se connecter, et
  une église peut vouloir un identifiant plus court que le nom complet.
- Les membres décédés n'apparaissent pas dans la liste.
- La **modification** d'un compte existant ne réclame pas de membre : les comptes
  créés avant cette règle n'en ont aucun, et les bloquer les rendrait impossibles
  à corriger.
- Le lien membre → compte n'est pas stocké en base. Il ne sert qu'à remplir le
  formulaire.

### Rôles et permissions

| Rôle | Ce qu'il peut faire |
|---|---|
| `admin` | Tout, y compris gérer les comptes secondaires |
| `gestionnaire` | Agir dans les modules cochés |
| `lecteur` | Consulter les modules cochés, sans rien écrire |

Les permissions sont cochées onglet par onglet. **Seul le tableau de bord est
coché d'avance**, et il l'est parce qu'il est verrouillé — tout utilisateur y a
accès. Les autres se choisissent : un accès ne s'accorde pas par défaut.

> `comptabilite` était coché d'avance par un reliquat de code. C'était le pire
> onglet à offrir sans le vouloir, puisqu'il donne accès aux finances de
> l'église.

Le garde-fou est posé à la route (`GuardedPage` dans `routes/sections.tsx`), pas
seulement dans le menu : masquer une entrée de menu n'empêche personne de taper
l'adresse.

## Session et jeton

L'authentification passe par un JWT de 12 h, porté par `apiClient`.

Une réponse **401 termine la session** et renvoie à l'écran de connexion. Sans
cela, l'application tournait avec un jeton périmé : les écrans restaient
affichés, mais chaque action échouait sans que l'utilisateur comprenne pourquoi.

La coupure est faite dans `src/utils/functions.ts`, qui envoie les actions Redux
**par leur nom** (`'authentification/setToken'`) plutôt qu'en important les
créateurs d'action — l'import créerait un cycle entre le client HTTP et le store.

La condition de déclenchement est « l'application se croit connectée », et non
« un jeton existe » : l'état cassé qu'on voulait rattraper était précisément une
session persistée d'avant l'arrivée des JWT, avec `connecter: true` et un jeton
vide.
