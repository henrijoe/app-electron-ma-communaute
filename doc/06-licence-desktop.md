# 06 — Licence desktop

Le verrou qui protège une installation posée chez un client.

> **Avertissement.** Ce document décrit le **fonctionnement**. L'analyse de
> sécurité de ce verrou et son plan de correction vivent hors des dépôts, dans
> `communaute/plan-securite.md` : ils citent des fichiers et des lignes précises,
> et ces dépôts sont publics.

## Le fichier de licence

Un fichier chiffré, `.desktop-license.secure`, à côté des bases (voir
[02](02-base-de-donnees.md)). Il porte :

| Champ | Rôle |
|---|---|
| `expiresAt` | Date de fin d'accès |
| `manuallyBlocked` | Blocage posé à la main |
| `machineBinding` | Empreinte du poste autorisé |
| `unlockCodes` | Codes de déblocage, stockés hachés |
| `superAdminUsers` | Qui peut entrer même quand c'est bloqué |

## Les trois façons d'être bloqué

1. **L'essai est écoulé.** 30 jours à l'installation — réglable par
   `DESKTOP_TRIAL_DAYS`, sans retoucher au code.
2. **Un blocage manuel** a été posé.
3. **La licence appartient à un autre ordinateur.** L'empreinte est dérivée du
   `MachineGuid` de Windows, avec un repli sur nom de machine, plateforme,
   architecture et processeur.

Le superadministrateur entre dans tous les cas : c'est ce qui permet de dépanner
un poste bloqué.

> **L'essai n'est calculé qu'à la création du fichier**, au tout premier
> lancement. Changer `DESKTOP_TRIAL_DAYS` ne prolonge pas les installations
> existantes — elles gardent leur date. Pour les prolonger, c'est le déblocage.

## Déblocage

Trois voies, dans `desktop-control/services.ts` :

| Voie | Route | Qui |
|---|---|---|
| Renouvellement | `/desktop-control/unlock` | Le superadmin, avec ses identifiants |
| Code hors ligne | `/desktop-control/unlock-code` | Le client, avec un code reçu |
| Rattachement | `/desktop-control/rebind-machine` | Le superadmin, après changement d'ordinateur |

Un code prolonge **à partir de l'expiration en cours** si elle est encore
valide, sinon à partir d'aujourd'hui : débloquer en avance ne fait pas perdre les
jours restants. Un code ne sert qu'une fois, et seulement sur le poste auquel la
licence est liée.

## Forfaits

Les durées proposées sont figées dans le code
(`DESKTOP_UNLOCK_CODE_PLANS`) : 10 × 30 jours, 5 × 60 jours, 5 × 6 mois,
5 × 1 an, soit 25 codes par installation.

**Les codes sont générés sur la machine du client**, au moment où sa licence est
créée. Seul leur **hachage** est conservé ; les codes en clair ne peuvent être
exportés qu'**une fois**, par le superadmin, depuis ce poste.

> C'est la limite du dispositif actuel : on ne peut pas dépanner à distance
> quelqu'un chez qui on n'est jamais allé. Le plan de correction remplace ce
> mécanisme par des tickets signés, générables depuis n'importe où.

## Déploiement serveur

Le verrou n'a aucun sens sur un serveur partagé : l'empreinte machine y change au
moindre redimensionnement, et l'expiration bloquerait toutes les églises d'un
coup.

```
DESKTOP_LICENSE_ENFORCED=false
```

L'état reste calculé et visible dans les paramètres, mais il ne ferme plus
l'accès à personne. Là, c'est l'abonnement qui ouvre la porte
(`ABONNEMENT_REQUIS=true`).

## Variables

| Variable | Défaut | Effet |
|---|---|---|
| `DESKTOP_TRIAL_DAYS` | `30` | Durée de l'essai et d'un renouvellement sans durée précisée |
| `DESKTOP_LICENSE_ENFORCED` | `true` | `false` neutralise le verrou |
| `DESKTOP_SUPERADMINS` | — | Liste de noms, séparés par des virgules |
| `JWT_SECRET` | — | Clé de signature des jetons |
| `DB_MODE` | `sqlite` | `sqlite` ou `mysql` |
| `SQLITE_DB_DIR` | selon l'OS | Dossier des bases |
