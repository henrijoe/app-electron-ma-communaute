import { useRef, useMemo, useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

import {
  Box,
  Card,
  Chip,
  Stack,
  alpha,
  Avatar,
  Button,
  useTheme,
  Typography,
  IconButton,
  CircularProgress,
} from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2';
import {
  HomeRounded,
  PrintRounded,
  SchoolRounded,
  PersonRounded,
  ChurchRounded,
  PhoneRounded,
  WorkRounded,
  EmailRounded,
  PlaceRounded,
  ArrowBackRounded,
  FamilyRestroomRounded,
  CalendarTodayRounded,
  PhotoCameraRounded,
  LocalActivityRounded,
} from '@mui/icons-material';
import { useReactToPrint } from 'react-to-print';

import { useSelector } from 'react-redux';

import type { IReduxState } from 'src/store/store';
import { DashboardContent } from 'src/layouts/dashboard';
import { useNotificationSnackbar } from 'src/components/alert/notificationSnackbar';
import {
  getSessionUser,
  getScopeUserIdFromUser,
  isDesktopAppRuntime,
} from 'src/utils/access-control';
import { apiClient, getApiErrorMessage, buildEcodimMediaUrl } from 'src/utils/apiClient';

import {
  CATEGORIES_SORTIE,
  PERSONNES_REFERENTES,
  SITUATIONS_SOCIALES,
} from '../../constantes';
import { FicheSuiviEnfant, FICHE_SUIVI_PAGE_STYLE } from '../../etats/fiche-suivi-enfant';
import {
  FicheInscriptionEnfant,
  FICHE_INSCRIPTION_PAGE_STYLE,
} from '../../etats/fiche-inscription-enfant';
import {
  FormulaireIdentificationEnfant,
  FICHE_IDENTIFICATION_PAGE_STYLE,
} from '../../etats/formulaire-identification-enfant';

// ----------------------------------------------------------------------
// Page de détail d'un enfant, construite sur le même modèle que la page détail
// d'un membre : une adresse propre, un bandeau coloré avec la photo et les
// repères du jour, puis des cartes thématiques.
//
// C'était auparavant une boîte de dialogue. Une page se partage par lien,
// s'imprime et se rouvre après un rafraîchissement — ce qu'une fenêtre ne permet
// pas, et ce que la fiche membre offrait déjà.

const TAILLE_MAXI_MO = 5;
const VALEUR_ABSENTE = 'Non renseigné';



const valeurOuDefaut = (valeur?: string | null): string => {
  const texte = String(valeur ?? '').trim();
  return texte || VALEUR_ABSENTE;
};

const Fait = ({
  icone,
  libelle,
  valeur,
}: {
  icone: React.ReactNode;
  libelle: string;
  valeur?: string | null;
}) => (
  // Libellé à gauche, valeur à droite sur la même ligne : empilés, ils doublaient
  // la hauteur des cartes alors que toute la moitié droite restait vide.
  <Stack direction="row" spacing={1.5} alignItems="center">
    <Box sx={{ color: 'primary.main', display: 'flex' }}>{icone}</Box>
    <Typography
      variant="subtitle1"
      color="text.secondary"
      sx={{ flexShrink: 0, minWidth: { sm: 150 } }}
    >
      {libelle}
    </Typography>
    <Typography
      variant="h6"
      sx={{ fontWeight: 600, wordBreak: 'break-word', textAlign: 'right', flexGrow: 1 }}
    >
      {valeurOuDefaut(valeur)}
    </Typography>
  </Stack>
);

const formaterDate = (date?: string | null): string => {
  if (!date) return '';

  const valeur = new Date(date);
  if (Number.isNaN(valeur.getTime())) return String(date);

  return valeur.toLocaleDateString('fr-FR');
};

const ageDepuisNaissance = (date?: string | null): string => {
  if (!date) return VALEUR_ABSENTE;

  const naissance = new Date(date);
  if (Number.isNaN(naissance.getTime())) return VALEUR_ABSENTE;

  const maintenant = new Date();
  let age = maintenant.getFullYear() - naissance.getFullYear();
  const mois = maintenant.getMonth() - naissance.getMonth();

  if (mois < 0 || (mois === 0 && maintenant.getDate() < naissance.getDate())) {
    age -= 1;
  }

  return age >= 0 ? `${age} ans` : VALEUR_ABSENTE;
};

export default function EnfantDetail() {
  const theme = useTheme();
  const navigate = useNavigate();
  const { id } = useParams();
  const { showNotification, NotificationComponent } = useNotificationSnackbar();
  const sessionUser = useSelector((state: IReduxState) => getSessionUser(state));
  const scopeUtilisateur = getScopeUserIdFromUser(sessionUser) || 0;
  const champFichier = useRef<HTMLInputElement>(null);
  const [envoi, setEnvoi] = useState(false);
  const [chargement, setChargement] = useState(true);
  const [enfant, setEnfant] = useState<any | null>(null);
  // Appels de l’enfant : ils remplissent le tableau d’assiduité de sa fiche de suivi.
  const [presences, setPresences] = useState<any[]>([]);

  const isDesktopApp = isDesktopAppRuntime();
  const modifiable = !isDesktopApp;
  const idUtilisateur = Number(enfant?.idUtilisateur) || scopeUtilisateur;

  const referenceSuivi = useRef<HTMLDivElement>(null);
  const referenceIdentification = useRef<HTMLDivElement>(null);
  const referenceInscription = useRef<HTMLDivElement>(null);

  const imprimerSuivi = useReactToPrint({
    content: () => referenceSuivi.current,
    pageStyle: FICHE_SUIVI_PAGE_STYLE,
  });

  const imprimerIdentification = useReactToPrint({
    content: () => referenceIdentification.current,
    pageStyle: FICHE_IDENTIFICATION_PAGE_STYLE,
  });

  const imprimerInscription = useReactToPrint({
    content: () => referenceInscription.current,
    pageStyle: FICHE_INSCRIPTION_PAGE_STYLE,
  });

  // Il n'existe pas de route « un enfant par identifiant » : on relit la liste de
  // l'église et on y retrouve l'enfant. Une liste d'école du dimanche reste courte,
  // et cela évite d'ajouter une route dont ce serait le seul usage.
  const charger = useCallback(async () => {
    if (!id) {
      setChargement(false);
      return;
    }

    try {
      setChargement(true);
      const [reponse, appels] = await Promise.all([
        apiClient.getEnfantsEcodim(scopeUtilisateur),
        // L'appel n'est pas indispensable à l'écran : son échec ne doit pas
        // empêcher d'afficher l'enfant, seulement laisser l'assiduité vide.
        apiClient.getPresencesEcodim(scopeUtilisateur).catch(() => ({ data: [] })),
      ]);

      const trouve = (reponse?.data || []).find(
        (element: any) => String(element.idEnfantEcodim) === String(id)
      );
      setEnfant(trouve || null);
      setPresences(
        ((appels as any)?.data || []).filter(
          (presence: any) => String(presence.idEnfantEcodim) === String(id)
        )
      );
    } catch (error) {
      showNotification(getApiErrorMessage(error, 'Chargement impossible.'), 'error');
      setEnfant(null);
    } finally {
      setChargement(false);
    }
  }, [id, scopeUtilisateur, showNotification]);

  useEffect(() => {
    charger();
  }, [charger]);

  const nomComplet = useMemo(
    () => `${enfant?.nomEnfant || ''} ${enfant?.prenomEnfant || ''}`.trim() || 'Enfant',
    [enfant]
  );

  const photo = enfant?.photoEnfant ? buildEcodimMediaUrl(enfant.photoEnfant) : '';

  const choisirPhoto = async (fichier?: File | null) => {
    if (!fichier) {
      return;
    }

    if (!fichier.type.startsWith('image/')) {
      showNotification('Choisissez une image (JPG ou PNG).', 'warning');
      return;
    }

    if (fichier.size > TAILLE_MAXI_MO * 1024 * 1024) {
      showNotification(`La photo ne doit pas dépasser ${TAILLE_MAXI_MO} Mo.`, 'warning');
      return;
    }

    try {
      setEnvoi(true);
      // On transmet la photo en base64 ; le serveur l'écrit en fichier et ne garde
      // que son nom en base.
      const base64 = await new Promise<string>((resolve, reject) => {
        const lecteur = new FileReader();
        lecteur.onload = () => resolve(String(lecteur.result || ''));
        lecteur.onerror = () => reject(new Error("La photo n'a pas pu être lue."));
        lecteur.readAsDataURL(fichier);
      });

      await apiClient.enregistrerPhotoEnfantEcodim({
        idEnfantEcodim: enfant.idEnfantEcodim,
        idUtilisateur,
        photo: base64,
      });

      showNotification('Photo enregistrée.', 'success');
      await charger();
    } catch (error) {
      showNotification(getApiErrorMessage(error, 'Photo non enregistrée.'), 'error');
    } finally {
      setEnvoi(false);

      if (champFichier.current) {
        // Sans cette remise à zéro, rechoisir le même fichier ne déclenche rien.
        champFichier.current.value = '';
      }
    }
  };

  if (chargement) {
    return (
      <DashboardContent>
        <Stack alignItems="center" justifyContent="center" sx={{ py: 10 }}>
          <CircularProgress />
        </Stack>
      </DashboardContent>
    );
  }

  if (!enfant) {
    return (
      <DashboardContent>
        <Stack spacing={2} alignItems="flex-start" sx={{ py: 6 }}>
          <Typography variant="h5">Enfant introuvable</Typography>
          <Typography variant="body2" color="text.secondary">
            Cette fiche a peut-être été supprimée depuis l&apos;ouverture du lien.
          </Typography>
          <Button startIcon={<ArrowBackRounded />} onClick={() => navigate('/ecodim')}>
            Revenir à l&apos;Ecodim
          </Button>
        </Stack>
      </DashboardContent>
    );
  }

  return (
    <DashboardContent>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        flexWrap="wrap"
        spacing={2}
        sx={{ mb: 3 }}
      >
        <Button startIcon={<ArrowBackRounded />} onClick={() => navigate('/ecodim')}>
          Retour
        </Button>

        {!isDesktopApp && (
          <Stack direction="row" spacing={1}>
            <Button
              variant="outlined"
              startIcon={<PrintRounded />}
              onClick={() => imprimerSuivi?.()}
            >
              Fiche de suivi
            </Button>
            <Button
              variant="outlined"
              startIcon={<PrintRounded />}
              onClick={() => imprimerInscription?.()}
            >
              Fiche d&apos;inscription
            </Button>
            <Button
              variant="outlined"
              startIcon={<PrintRounded />}
              onClick={() => imprimerIdentification?.()}
            >
              Formulaire d&apos;identification
            </Button>
          </Stack>
        )}
      </Stack>

      <Card
        sx={{
          overflow: 'hidden',
          border: `1px solid ${alpha(theme.palette.primary.main, 0.14)}`,
        }}
      >
          {/* ---------------------------------------------- bandeau de couverture */}
          <Box
            sx={{
              height: { xs: 150, md: 210 },
              position: 'relative',
              background: `
                radial-gradient(circle at top left, ${alpha(theme.palette.common.white, 0.22)} 0, transparent 30%),
                radial-gradient(circle at bottom right, ${alpha(theme.palette.info.light, 0.4)} 0, transparent 28%),
                linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 52%, ${theme.palette.info.main} 100%)
              `,
            }}
          />

          {/* La photo chevauche la couverture et reste centrée, comme sur un profil
              de réseau social : le regard tombe dessus avant les informations. */}
          <Box
            sx={{
              px: { xs: 3, md: 5 },
              pb: 4,
              mt: { xs: -9, md: -12 },
              position: 'relative',
            }}
          >
            <Stack spacing={2} alignItems="center" sx={{ mb: 4 }}>
              <Box position="relative">
                <Avatar
                  src={photo || undefined}
                  alt={nomComplet}
                  sx={{
                    width: { xs: 150, md: 210 },
                    height: { xs: 150, md: 210 },
                    border: `6px solid ${theme.palette.background.paper}`,
                    boxShadow: `0 18px 48px ${alpha(theme.palette.common.black, 0.24)}`,
                    bgcolor: 'grey.300',
                  }}
                >
                  {!photo && <PersonRounded sx={{ fontSize: { xs: 72, md: 100 } }} />}
                </Avatar>

                {modifiable && (
                  <IconButton
                    component="label"
                    disabled={envoi}
                    sx={{
                      position: 'absolute',
                      bottom: 8,
                      right: 8,
                      backgroundColor: 'primary.main',
                      color: 'white',
                      '&:hover': { backgroundColor: 'primary.dark' },
                    }}
                  >
                    <PhotoCameraRounded />
                    <input
                      ref={champFichier}
                      type="file"
                      hidden
                      accept="image/*"
                      onChange={(event) => choisirPhoto(event.target.files?.[0])}
                    />
                  </IconButton>
                )}
              </Box>

              <Stack spacing={0.5} alignItems="center">
                <Typography
                  variant="overline"
                  color="text.secondary"
                  sx={{ letterSpacing: 1.4 }}
                >
                  École du dimanche
                </Typography>
                <Typography variant="h3" sx={{ fontWeight: 800, textAlign: 'center' }}>
                  {nomComplet}
                </Typography>
              </Stack>

              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap justifyContent="center">
                <Chip
                  size="medium"
                  color="primary"
                  variant="outlined"
                  label={enfant.libelleClasse || 'Aucune classe'}
                />
                <Chip
                  size="medium"
                  color="secondary"
                  variant="outlined"
                  label={ageDepuisNaissance(enfant.dateNaissEnfant)}
                />
                {enfant.sexeEnfant && (
                  <Chip
                    size="medium"
                    variant="outlined"
                    color={enfant.sexeEnfant === 'F' ? 'warning' : 'info'}
                    label={enfant.sexeEnfant === 'F' ? 'Fille' : 'Garçon'}
                  />
                )}
              </Stack>
            </Stack>

            {/* ------------------------------------------------ cartes de faits */}
            <Grid container spacing={3} sx={{ mt: 1 }}>
              <Grid xs={12} md={6}>
                <Card sx={{ p: 3, borderRadius: 3, height: 1 }}>
                  <Typography variant="h4" sx={{ fontWeight: 700, mb: 2 }}>
                    Identité
                  </Typography>
                  <Stack spacing={1.25}>
                    <Fait
                      icone={<CalendarTodayRounded />}
                      libelle="Naissance"
                      valeur={
                        [formaterDate(enfant.dateNaissEnfant), enfant.lieuNaissEnfant]
                          .filter(Boolean)
                          .join(' • ') || null
                      }
                    />
                    <Fait
                      icone={<HomeRounded />}
                      libelle="Lieu d'habitation"
                      valeur={
                        [enfant.lieuHabitationEnfant, enfant.numeroAppartement]
                          .filter(Boolean)
                          .join(' • ') || null
                      }
                    />
                    <Fait
                      icone={<PhoneRounded />}
                      libelle="Contact de l'enfant"
                      valeur={enfant.contactEnfant}
                    />
                    <Fait
                      icone={<SchoolRounded />}
                      libelle="Niveau scolaire"
                      valeur={enfant.niveauScolaireEnfant}
                    />
                    <Fait
                      icone={<LocalActivityRounded />}
                      libelle="Activité"
                      valeur={enfant.activiteEnfant}
                    />
                  </Stack>
                </Card>
              </Grid>

              <Grid xs={12} md={6}>
                <Card sx={{ p: 3, borderRadius: 3, height: 1 }}>
                  <Typography variant="h4" sx={{ fontWeight: 700, mb: 2 }}>
                    Parent ou tuteur
                  </Typography>
                  <Stack spacing={1.25}>
                    <Fait
                      icone={<FamilyRestroomRounded />}
                      libelle="Nom"
                      valeur={enfant.nomParentEnfant}
                    />
                    <Fait
                      icone={<PhoneRounded />}
                      libelle="Contact"
                      valeur={enfant.contactParentEnfant}
                    />
                    <Fait icone={<EmailRounded />} libelle="Email" valeur={enfant.emailParentEnfant} />
                    <Fait
                      icone={<PlaceRounded />}
                      libelle="Adresse"
                      valeur={enfant.adresseParentEnfant}
                    />
                    <Fait
                      icone={<ChurchRounded />}
                      libelle="Religion des parents"
                      valeur={enfant.religionParents}
                    />
                  </Stack>
                </Card>
              </Grid>

              <Grid xs={12} md={6}>
                <Card sx={{ p: 3, borderRadius: 3, height: 1 }}>
                  <Typography variant="h4" sx={{ fontWeight: 700, mb: 2 }}>
                    Le père
                  </Typography>
                  <Stack spacing={1.25}>
                    <Fait
                      icone={<PersonRounded />}
                      libelle="Nom et prénoms"
                      valeur={`${enfant.nomPere || ''} ${enfant.prenomPere || ''}`.trim() || null}
                    />
                    <Fait
                      icone={<HomeRounded />}
                      libelle="Lieu d'habitation"
                      valeur={enfant.lieuHabitationPere}
                    />
                    <Fait
                      icone={<WorkRounded />}
                      libelle="Profession"
                      valeur={enfant.professionPere}
                    />
                    <Fait icone={<PhoneRounded />} libelle="Contact" valeur={enfant.contactPere} />
                    <Fait
                      icone={<ChurchRounded />}
                      libelle="Converti"
                      valeur={enfant.pereConverti}
                    />
                  </Stack>
                </Card>
              </Grid>

              <Grid xs={12} md={6}>
                <Card sx={{ p: 3, borderRadius: 3, height: 1 }}>
                  <Typography variant="h4" sx={{ fontWeight: 700, mb: 2 }}>
                    La mère
                  </Typography>
                  <Stack spacing={1.25}>
                    <Fait
                      icone={<PersonRounded />}
                      libelle="Nom et prénoms"
                      valeur={`${enfant.nomMere || ''} ${enfant.prenomMere || ''}`.trim() || null}
                    />
                    <Fait
                      icone={<HomeRounded />}
                      libelle="Lieu d'habitation"
                      valeur={enfant.lieuHabitationMere}
                    />
                    <Fait
                      icone={<WorkRounded />}
                      libelle="Profession"
                      valeur={enfant.professionMere}
                    />
                    <Fait icone={<PhoneRounded />} libelle="Contact" valeur={enfant.contactMere} />
                    <Fait
                      icone={<ChurchRounded />}
                      libelle="Convertie"
                      valeur={enfant.mereConverti}
                    />
                  </Stack>
                </Card>
              </Grid>

              <Grid xs={12}>
                <Card sx={{ p: 3, borderRadius: 3 }}>
                  <Typography variant="h4" sx={{ fontWeight: 700, mb: 2 }}>
                    Parcours à l&apos;Ecodim
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid xs={12} sm={6} md={4}>
                      <Fait
                        icone={<CalendarTodayRounded />}
                        libelle="Entrée"
                        valeur={
                          [formaterDate(enfant.dateEntreeEcodim), enfant.niveauEntreeEcodim]
                            .filter(Boolean)
                            .join(' • ') || null
                        }
                      />
                    </Grid>
                    <Grid xs={12} sm={6} md={4}>
                      <Fait
                        icone={<SchoolRounded />}
                        libelle="Niveau actuel"
                        valeur={enfant.niveauActuelEcodim}
                      />
                    </Grid>
                    <Grid xs={12} sm={6} md={4}>
                      <Fait
                        icone={<ChurchRounded />}
                        libelle="Baptême dans le Saint-Esprit"
                        valeur={
                          [formaterDate(enfant.dateBaptemeEsprit), enfant.lieuBaptemeEsprit]
                            .filter(Boolean)
                            .join(' • ') || null
                        }
                      />
                    </Grid>
                    <Grid xs={12} sm={6} md={4}>
                      <Fait
                        icone={<FamilyRestroomRounded />}
                        libelle="Vit avec"
                        valeur={PERSONNES_REFERENTES[enfant.vitAvec || ''] || null}
                      />
                    </Grid>
                    <Grid xs={12} sm={6} md={4}>
                      <Fait
                        icone={<LocalActivityRounded />}
                        libelle="Situation sociale"
                        valeur={
                          [
                            SITUATIONS_SOCIALES[enfant.situationSociale || ''] || '',
                            enfant.precisionSituationSociale || '',
                          ]
                            .filter(Boolean)
                            .join(' — ') || null
                        }
                      />
                    </Grid>
                    <Grid xs={12} sm={6} md={4}>
                      <Fait
                        icone={<CalendarTodayRounded />}
                        libelle="Sortie"
                        valeur={
                          [
                            formaterDate(enfant.dateSortieEcodim),
                            CATEGORIES_SORTIE[enfant.categorieSortieEcodim || ''] || '',
                            enfant.motifSortieEcodim || '',
                          ]
                            .filter(Boolean)
                            .join(' • ') || null
                        }
                      />
                    </Grid>
                    <Grid xs={12} sm={6} md={4}>
                      <Fait
                        icone={<CalendarTodayRounded />}
                        libelle="Départ"
                        valeur={
                          [formaterDate(enfant.dateDepart), enfant.motifDepart]
                            .filter(Boolean)
                            .join(' • ') || null
                        }
                      />
                    </Grid>
                  </Grid>
                </Card>
              </Grid>
            </Grid>

          </Box>
      </Card>

      {/* Documents imprimables, montés hors écran. */}
      <Box sx={{ display: 'none' }}>
        <div ref={referenceSuivi}>
          <FicheSuiviEnfant enfant={enfant} presences={presences} />
        </div>
        <div ref={referenceInscription}>
          <FicheInscriptionEnfant enfant={enfant} />
        </div>
        <div ref={referenceIdentification}>
          <FormulaireIdentificationEnfant enfant={enfant} />
        </div>
      </Box>
      <NotificationComponent />
    </DashboardContent>
  );
}
