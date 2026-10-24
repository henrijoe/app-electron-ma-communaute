import type { ChangeEvent } from 'react';

import { useRef, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Step from '@mui/material/Step';
import Grid from '@mui/material/Unstable_Grid2';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Stepper from '@mui/material/Stepper';
import MenuItem from '@mui/material/MenuItem';
import StepLabel from '@mui/material/StepLabel';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import CardContent from '@mui/material/CardContent';
import LinearProgress from '@mui/material/LinearProgress';
import CircularProgress from '@mui/material/CircularProgress';
import {
  CloseRounded,
  SchoolRounded,
  ChildCareRounded,
  CheckCircleRounded,
  PhotoCameraRounded,
  FamilyRestroomRounded,
  PersonAddAlt1Rounded,
} from '@mui/icons-material';

import { apiClient, getApiErrorMessage } from 'src/utils/apiClient';
import { SelectRecherche } from 'src/components/select-recherche';

// ----------------------------------------------------------------------
// Inscription d'un enfant à l'école du dimanche, depuis le QR code affiché en
// salle. Reprend la forme de l'inscription des membres : mêmes étapes, même
// barre de progression, même photo — c'est le même geste, par les mêmes gens,
// sur le même téléphone.
//
// Trois choix guident cet écran :
//
//  - la page est PUBLIQUE, donc rien de ce qu'elle envoie n'est digne de
//    confiance. Le périmètre de l'église vient du lien, et le serveur le
//    reprend de là plutôt que du formulaire ;
//  - elle est découpée en trois étapes courtes. Un parent debout, au milieu
//    d'autres parents, abandonne devant une liste de quinze champs ;
//  - elle ne demande que ce qui identifie et permet de rappeler. Le reste de la
//    fiche d'inscription se complète au calme, côté secrétariat.

const ETAPES = [
  {
    cle: 'enfant',
    libelle: "L'enfant",
    description: "Qui est l'enfant à inscrire ?",
    icone: ChildCareRounded,
  },
  {
    cle: 'ecole',
    libelle: 'École et maison',
    description: 'Où vit-il, et où étudie-t-il ?',
    icone: SchoolRounded,
  },
  {
    cle: 'parents',
    libelle: 'Les parents',
    description: 'Qui faut-il contacter si besoin ?',
    icone: FamilyRestroomRounded,
  },
] as const;

const MOIS_LABELS = [
  'Janv.',
  'Févr.',
  'Mars',
  'Avril',
  'Mai',
  'Juin',
  'Juil.',
  'Août',
  'Sept.',
  'Oct.',
  'Nov.',
  'Déc.',
];

const pad2 = (valeur: number | string) => String(valeur).padStart(2, '0');

/** Les enfants de l'école du dimanche ont entre 2 et 20 ans : on borne la liste. */
const ANNEE_OPTIONS = (() => {
  const courante = new Date().getFullYear();
  return Array.from({ length: 22 }, (_, index) => String(courante - index));
})();

const joursDuMois = (annee: string, mois: string): number => {
  if (!annee || !mois) return 31;
  return new Date(Number(annee), Number(mois), 0).getDate();
};

const TAILLE_PHOTO_MAX = 5 * 1024 * 1024;

const formulaireVide = {
  photoEnfant: '',
  nomEnfant: '',
  prenomEnfant: '',
  sexeEnfant: '',
  lieuNaissEnfant: '',
  lieuHabitationEnfant: '',
  niveauScolaireEnfant: '',
  ecoleEnfant: '',
  nomPere: '',
  nomMere: '',
  avecQuiVientEglise: '',
  nomParentEnfant: '',
  contactParentEnfant: '',
};

const versBase64 = (fichier: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const lecteur = new FileReader();
    lecteur.readAsDataURL(fichier);
    lecteur.onload = () => resolve(lecteur.result as string);
    lecteur.onerror = (erreur) => reject(erreur);
  });

export function PublicEnfantRegistrationView() {
  const [searchParams] = useSearchParams();

  const idUtilisateur = Number(searchParams.get('user') || searchParams.get('idUtilisateur') || 0);
  const nomEglise = searchParams.get('church') || 'Ma Communauté';

  const champFichier = useRef<HTMLInputElement>(null);

  const [etape, setEtape] = useState(0);
  const [formulaire, setFormulaire] = useState(formulaireVide);
  /**
   * Date de naissance en trois listes.
   *
   * Un calendrier natif oblige à remonter mois par mois jusqu'à 2015, ce qui est
   * pénible au téléphone. Les trois parties sont gardées séparément : une date
   * incomplète n'a nulle part où exister sous sa forme « AAAA-MM-JJ », et la
   * partie déjà choisie disparaîtrait au rendu suivant.
   */
  const [naissance, setNaissance] = useState({ jour: '', mois: '', annee: '' });
  const [erreurs, setErreurs] = useState<Record<string, string>>({});
  const [erreurPhoto, setErreurPhoto] = useState('');
  const [envoi, setEnvoi] = useState(false);
  const [envoye, setEnvoye] = useState(false);
  const [erreur, setErreur] = useState('');
  const [validationRequise, setValidationRequise] = useState(true);

  const etapeCourante = ETAPES[etape];
  const IconeEtape = etapeCourante.icone;
  const progression = Math.round(((etape + 1) / ETAPES.length) * 100);

  const changer = (champ: keyof typeof formulaireVide, valeur: string) => {
    setFormulaire((precedent) => ({ ...precedent, [champ]: valeur }));
    setErreurs((precedent) => ({ ...precedent, [champ]: '' }));
  };

  const dateNaissEnfant = useMemo(
    () =>
      naissance.jour && naissance.mois && naissance.annee
        ? `${naissance.annee}-${naissance.mois}-${naissance.jour}`
        : '',
    [naissance]
  );

  const choisirPhoto = async (evenement: ChangeEvent<HTMLInputElement>) => {
    const fichier = evenement.target.files?.[0];
    // Remis à zéro tout de suite : sans cela, rechoisir le même fichier après
    // l'avoir retiré ne déclenche aucun évènement.
    evenement.target.value = '';

    if (!fichier) return;

    if (!fichier.type.startsWith('image/')) {
      setErreurPhoto('Choisis une image.');
      return;
    }

    if (fichier.size > TAILLE_PHOTO_MAX) {
      setErreurPhoto('La photo ne doit pas dépasser 5 Mo.');
      return;
    }

    setErreurPhoto('');
    changer('photoEnfant', await versBase64(fichier));
  };

  /** Vrai si l'étape est complète. Les manques sont signalés sous les champs. */
  const etapeValide = (index: number): boolean => {
    const manques: Record<string, string> = {};

    if (index === 0 && !formulaire.nomEnfant.trim()) {
      manques.nomEnfant = "Le nom de l'enfant est requis.";
    }

    if (index === 2 && !formulaire.contactParentEnfant.trim()) {
      manques.contactParentEnfant = 'Un numéro est nécessaire pour vous joindre.';
    }

    setErreurs(manques);
    return Object.keys(manques).length === 0;
  };

  const envoyer = async () => {
    setErreur('');

    if (!idUtilisateur) {
      setErreur("Ce lien d'inscription est incomplet. Demande un nouveau QR code.");
      return;
    }

    // Les étapes précédentes sont revérifiées : on peut atteindre la dernière
    // puis revenir effacer un champ obligatoire.
    const premiereIncomplete = [0, 1, 2].find((index) => !etapeValide(index));

    if (premiereIncomplete !== undefined) {
      setEtape(premiereIncomplete);
      return;
    }

    try {
      setEnvoi(true);

      const reponse: any = await apiClient.createDemandeInscriptionEnfant({
        ...formulaire,
        dateNaissEnfant,
        // La date d'inscription est celle du jour : c'est ce que porte la fiche
        // officielle, et le parent n'a pas à la saisir.
        dateEntreeEcodim: new Date().toISOString().slice(0, 10),
        idUtilisateur,
      });

      setValidationRequise(reponse?.data?.validationRequise !== false);
      setEnvoye(true);
    } catch (probleme) {
      setErreur(getApiErrorMessage(probleme, "L'inscription n'a pas pu être envoyée."));
    } finally {
      setEnvoi(false);
    }
  };

  // ----------------------------------------------------------- confirmation

  if (envoye) {
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', p: 2 }}>
        <Card sx={{ maxWidth: 560, mx: 'auto', mt: { xs: 4, sm: 8 } }}>
          <CardContent sx={{ textAlign: 'center', py: 6 }}>
            <CheckCircleRounded sx={{ fontSize: 64, color: 'success.main' }} />

            <Typography variant="h5" sx={{ mt: 2 }}>
              Inscription envoyée
            </Typography>

            <Typography color="text.secondary" sx={{ mt: 1, maxWidth: 420, mx: 'auto' }}>
              Merci. {nomEglise}{' '}
              {validationRequise
                ? "a bien reçu la fiche de l'enfant. Un responsable de l'école du dimanche la validera."
                : "a bien reçu la fiche : l'enfant est inscrit à l'école du dimanche."}
            </Typography>

            <Button
              sx={{ mt: 3 }}
              variant="outlined"
              startIcon={<PersonAddAlt1Rounded />}
              onClick={() => {
                // Une même famille inscrit souvent plusieurs enfants à la suite :
                // on garde ce qui ne change pas d'un frère à l'autre.
                setFormulaire({
                  ...formulaireVide,
                  nomPere: formulaire.nomPere,
                  nomMere: formulaire.nomMere,
                  nomParentEnfant: formulaire.nomParentEnfant,
                  contactParentEnfant: formulaire.contactParentEnfant,
                  lieuHabitationEnfant: formulaire.lieuHabitationEnfant,
                });
                setNaissance({ jour: '', mois: '', annee: '' });
                setErreurs({});
                setEtape(0);
                setEnvoye(false);
              }}
            >
              Inscrire un autre enfant
            </Button>
          </CardContent>
        </Card>
      </Box>
    );
  }

  // ------------------------------------------------------------- formulaire

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', p: 2 }}>
      <Card sx={{ maxWidth: 560, mx: 'auto', mt: { xs: 1, sm: 4 }, mb: 4 }}>
        <CardContent>
          <Stack spacing={3}>
            {/* ------------------------------------------------- en-tête */}
            <Stack direction="row" spacing={2} alignItems="center">
              <Box
                sx={{
                  width: 52,
                  height: 52,
                  borderRadius: 2,
                  display: 'grid',
                  placeItems: 'center',
                  color: 'primary.main',
                  bgcolor: 'primary.lighter',
                  flexShrink: 0,
                }}
              >
                <ChildCareRounded />
              </Box>
              <Box sx={{ minWidth: 0 }}>
                <Typography
                  variant="overline"
                  color="text.secondary"
                  sx={{ overflowWrap: 'anywhere' }}
                >
                  {nomEglise}
                </Typography>
                <Typography variant="h4" sx={{ fontSize: { xs: '1.45rem', sm: '2rem' } }}>
                  Inscription à l&apos;Ecodim
                </Typography>
              </Box>
            </Stack>

            {/* Le Stepper demande de la largeur : sur téléphone, c'est la barre
                de progression seule qui situe l'avancement. */}
            <Stepper activeStep={etape} alternativeLabel sx={{ display: { xs: 'none', sm: 'flex' } }}>
              {ETAPES.map((item) => (
                <Step key={item.cle}>
                  <StepLabel>{item.libelle}</StepLabel>
                </Step>
              ))}
            </Stepper>

            <Box>
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                sx={{ mb: 0.75 }}
              >
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                  Étape {etape + 1} sur {ETAPES.length}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {progression} %
                </Typography>
              </Stack>
              <LinearProgress
                variant="determinate"
                value={progression}
                sx={{ height: 8, borderRadius: 999, bgcolor: 'action.hover' }}
              />
            </Box>

            <Stack direction="row" spacing={1.5} alignItems="flex-start">
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  display: 'grid',
                  placeItems: 'center',
                  color: 'primary.main',
                  bgcolor: 'primary.lighter',
                  flexShrink: 0,
                }}
              >
                <IconeEtape fontSize="small" />
              </Box>
              <Box>
                <Typography variant="subtitle1">{etapeCourante.libelle}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {etapeCourante.description}
                </Typography>
              </Box>
            </Stack>

            {!idUtilisateur && (
              <Alert severity="error">
                Ce lien est incomplet. Demande un nouveau QR code au secrétariat.
              </Alert>
            )}

            {erreur && (
              <Alert severity="error" onClose={() => setErreur('')}>
                {erreur}
              </Alert>
            )}

            {/* ------------------------------------------- étape 1 : l'enfant */}
            {etape === 0 && (
              <Grid container spacing={2}>
                <Grid xs={12}>
                  <Stack alignItems="center" spacing={1}>
                    <Box sx={{ position: 'relative' }}>
                      <Avatar
                        src={formulaire.photoEnfant || undefined}
                        sx={{ width: 96, height: 96, bgcolor: 'primary.lighter' }}
                      >
                        {!formulaire.photoEnfant && (
                          <ChildCareRounded fontSize="large" sx={{ color: 'primary.main' }} />
                        )}
                      </Avatar>

                      {formulaire.photoEnfant && (
                        <IconButton
                          size="small"
                          onClick={() => changer('photoEnfant', '')}
                          sx={{
                            position: 'absolute',
                            top: -4,
                            right: -4,
                            bgcolor: 'background.paper',
                            border: (theme) => `1px solid ${theme.palette.divider}`,
                          }}
                        >
                          <CloseRounded fontSize="small" />
                        </IconButton>
                      )}
                    </Box>

                    <Button
                      size="small"
                      startIcon={<PhotoCameraRounded />}
                      onClick={() => champFichier.current?.click()}
                    >
                      {formulaire.photoEnfant ? 'Changer la photo' : 'Ajouter une photo'}
                    </Button>

                    <Typography variant="caption" color="text.secondary">
                      Facultatif. Elle apparaîtra sur la fiche de l&apos;enfant.
                    </Typography>

                    {erreurPhoto && (
                      <Typography variant="caption" color="error">
                        {erreurPhoto}
                      </Typography>
                    )}

                    <input
                      ref={champFichier}
                      type="file"
                      accept="image/*"
                      hidden
                      onChange={choisirPhoto}
                    />
                  </Stack>
                </Grid>

                <Grid xs={12}>
                  <TextField
                    label="Nom de l'enfant *"
                    value={formulaire.nomEnfant}
                    onChange={(event) => changer('nomEnfant', event.target.value)}
                    error={Boolean(erreurs.nomEnfant)}
                    helperText={erreurs.nomEnfant}
                    fullWidth
                  />
                </Grid>
                <Grid xs={12}>
                  <TextField
                    label="Prénoms de l'enfant"
                    value={formulaire.prenomEnfant}
                    onChange={(event) => changer('prenomEnfant', event.target.value)}
                    fullWidth
                  />
                </Grid>
                <Grid xs={12}>
                  <SelectRecherche
                    label="Sexe"
                    value={formulaire.sexeEnfant}
                    onChange={(event) => changer('sexeEnfant', event.target.value)}
                    fullWidth
                  >
                    <MenuItem value="M">Masculin</MenuItem>
                    <MenuItem value="F">Féminin</MenuItem>
                  </SelectRecherche>
                </Grid>

                <Grid xs={12}>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ display: 'block', mb: 0.5 }}
                  >
                    Date de naissance
                  </Typography>
                  <Stack direction="row" spacing={1}>
                    <SelectRecherche
                      label="Jour"
                      value={naissance.jour}
                      onChange={(event) =>
                        setNaissance((precedent) => ({ ...precedent, jour: event.target.value }))
                      }
                      sx={{ flex: 1, minWidth: 0 }}
                    >
                      {Array.from(
                        { length: joursDuMois(naissance.annee, naissance.mois) },
                        (_, index) => pad2(index + 1)
                      ).map((jour) => (
                        <MenuItem key={jour} value={jour}>
                          {jour}
                        </MenuItem>
                      ))}
                    </SelectRecherche>

                    <SelectRecherche
                      label="Mois"
                      value={naissance.mois}
                      onChange={(event) =>
                        setNaissance((precedent) => {
                          const mois = event.target.value;
                          const maximum = joursDuMois(precedent.annee, mois);
                          // Le 31 d'un mois qui n'en compte que 30 serait une
                          // date inexistante : on ramène au dernier jour.
                          const jour =
                            precedent.jour && Number(precedent.jour) > maximum
                              ? pad2(maximum)
                              : precedent.jour;

                          return { ...precedent, mois, jour };
                        })
                      }
                      sx={{ flex: 1.6, minWidth: 0 }}
                    >
                      {MOIS_LABELS.map((libelle, index) => (
                        <MenuItem key={libelle} value={pad2(index + 1)}>
                          {libelle}
                        </MenuItem>
                      ))}
                    </SelectRecherche>

                    <SelectRecherche
                      label="Année"
                      value={naissance.annee}
                      onChange={(event) =>
                        setNaissance((precedent) => {
                          const annee = event.target.value;
                          const maximum = joursDuMois(annee, precedent.mois);
                          const jour =
                            precedent.jour && Number(precedent.jour) > maximum
                              ? pad2(maximum)
                              : precedent.jour;

                          return { ...precedent, annee, jour };
                        })
                      }
                      sx={{ flex: 1.2, minWidth: 0 }}
                    >
                      {ANNEE_OPTIONS.map((annee) => (
                        <MenuItem key={annee} value={annee}>
                          {annee}
                        </MenuItem>
                      ))}
                    </SelectRecherche>
                  </Stack>
                </Grid>

                <Grid xs={12}>
                  <TextField
                    label="Lieu de naissance"
                    value={formulaire.lieuNaissEnfant}
                    onChange={(event) => changer('lieuNaissEnfant', event.target.value)}
                    fullWidth
                  />
                </Grid>
              </Grid>
            )}

            {/* --------------------------------------- étape 2 : école et maison */}
            {etape === 1 && (
              <Grid container spacing={2}>
                <Grid xs={12}>
                  <TextField
                    label="Lieu d'habitation"
                    value={formulaire.lieuHabitationEnfant}
                    onChange={(event) => changer('lieuHabitationEnfant', event.target.value)}
                    fullWidth
                  />
                </Grid>
                <Grid xs={12}>
                  <TextField
                    label="Niveau scolaire"
                    placeholder="Ex : CM2, 6e"
                    value={formulaire.niveauScolaireEnfant}
                    onChange={(event) => changer('niveauScolaireEnfant', event.target.value)}
                    fullWidth
                  />
                </Grid>
                <Grid xs={12}>
                  <TextField
                    label="École"
                    value={formulaire.ecoleEnfant}
                    onChange={(event) => changer('ecoleEnfant', event.target.value)}
                    fullWidth
                  />
                </Grid>
                <Grid xs={12}>
                  <Alert severity="info">
                    La classe de l&apos;Ecodim est choisie par l&apos;école du dimanche, selon
                    l&apos;âge de l&apos;enfant.
                  </Alert>
                </Grid>
              </Grid>
            )}

            {/* ------------------------------------------ étape 3 : les parents */}
            {etape === 2 && (
              <Grid container spacing={2}>
                <Grid xs={12}>
                  <TextField
                    label="Nom du père"
                    value={formulaire.nomPere}
                    onChange={(event) => changer('nomPere', event.target.value)}
                    fullWidth
                  />
                </Grid>
                <Grid xs={12}>
                  <TextField
                    label="Nom de la mère"
                    value={formulaire.nomMere}
                    onChange={(event) => changer('nomMere', event.target.value)}
                    fullWidth
                  />
                </Grid>
                <Grid xs={12}>
                  <TextField
                    label="Avec qui vient-il à l'église ?"
                    value={formulaire.avecQuiVientEglise}
                    onChange={(event) => changer('avecQuiVientEglise', event.target.value)}
                    fullWidth
                  />
                </Grid>
                <Grid xs={12}>
                  <TextField
                    label="Parent ou tuteur à contacter"
                    value={formulaire.nomParentEnfant}
                    onChange={(event) => changer('nomParentEnfant', event.target.value)}
                    fullWidth
                  />
                </Grid>
                <Grid xs={12}>
                  <TextField
                    label="Téléphone du parent ou tuteur *"
                    value={formulaire.contactParentEnfant}
                    // Seuls les chiffres sont conservés : on nettoie au lieu de
                    // refuser, pour ne pas perdre ce qui est déjà tapé.
                    onChange={(event) =>
                      changer('contactParentEnfant', event.target.value.replace(/\D/g, ''))
                    }
                    error={Boolean(erreurs.contactParentEnfant)}
                    helperText={erreurs.contactParentEnfant}
                    inputMode="numeric"
                    fullWidth
                  />
                </Grid>
              </Grid>
            )}

            {/* ---------------------------------------------- navigation */}
            <Stack direction="row" spacing={1.5}>
              <Button
                color="inherit"
                onClick={() => setEtape((precedent) => Math.max(precedent - 1, 0))}
                disabled={etape === 0 || envoi}
              >
                Retour
              </Button>

              <Box sx={{ flex: 1 }} />

              {etape < ETAPES.length - 1 ? (
                <Button
                  variant="contained"
                  onClick={() => {
                    if (etapeValide(etape)) {
                      setEtape((precedent) => precedent + 1);
                    }
                  }}
                  disabled={!idUtilisateur}
                >
                  Continuer
                </Button>
              ) : (
                <Button
                  variant="contained"
                  onClick={envoyer}
                  disabled={envoi || !idUtilisateur}
                  startIcon={envoi ? <CircularProgress size={18} color="inherit" /> : null}
                >
                  {envoi ? 'Envoi en cours...' : "Envoyer l'inscription"}
                </Button>
              )}
            </Stack>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}
