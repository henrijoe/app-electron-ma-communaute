import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Avatar from '@mui/material/Avatar';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Stepper from '@mui/material/Stepper';
import MenuItem from '@mui/material/MenuItem';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import CardContent from '@mui/material/CardContent';
import LinearProgress from '@mui/material/LinearProgress';
import CircularProgress from '@mui/material/CircularProgress';
import CloseRounded from '@mui/icons-material/CloseRounded';
import BadgeRounded from '@mui/icons-material/BadgeRounded';
import PersonRounded from '@mui/icons-material/PersonRounded';
import CheckCircleRounded from '@mui/icons-material/CheckCircleRounded';
import FactCheckRounded from '@mui/icons-material/FactCheckRounded';
import ArrowForwardRounded from '@mui/icons-material/ArrowForwardRounded';
import PhotoCameraRounded from '@mui/icons-material/PhotoCameraRounded';
import ContactPhoneRounded from '@mui/icons-material/ContactPhoneRounded';
import PersonAddAlt1Rounded from '@mui/icons-material/PersonAddAlt1Rounded';
import VolunteerActivismRounded from '@mui/icons-material/VolunteerActivismRounded';

import { apiClient, getApiErrorMessage } from 'src/utils/apiClient';

type PublicMemberForm = {
  nomMembre: string;
  prenomMembre: string;
  civiliteMembre: string;
  sexeMembre: string;
  dateNaissMembre: string;
  lieuNaissMembre: string;
  nationaliteMembre: string;
  contactMembre: string;
  emailMembre: string;
  residenceMembre: string;
  lieuTravailMembre: string;
  fonctionMembre: string;
  nouvelleAmeMembre: string;
  dateConversionMembre: string;
  baptemeEauMembre: string;
  dateBaptemeMembre: string;
  lieuBaptemeEauMembre: string;
  baptemeSaintEspritMembre: string;
  dateBaptemeSaintEspritMembre: string;
  egliseOrigineMembre: string;
  situationMatrimonialeMembre: string;
  nomFiance: string;
  nomAmiEglise: string;
  photoMembre: string;
};

const steps = [
  {
    label: 'Identité',
    description: 'Faisons connaissance ! Quelques informations sur vous.',
    icon: BadgeRounded,
  },
  {
    label: 'Contact',
    description: 'Comment l’église peut-elle vous joindre ?',
    icon: ContactPhoneRounded,
  },
  {
    label: 'Vie spirituelle',
    description: 'Parlez-nous un peu de votre parcours avec Dieu.',
    icon: VolunteerActivismRounded,
  },
  {
    label: 'Validation',
    description: 'Presque fini ! Vérifiez vos informations avant d’envoyer.',
    icon: FactCheckRounded,
  },
];

const initialForm: PublicMemberForm = {
  nomMembre: '',
  prenomMembre: '',
  civiliteMembre: '',
  sexeMembre: '',
  dateNaissMembre: '',
  lieuNaissMembre: '',
  nationaliteMembre: '',
  contactMembre: '',
  emailMembre: '',
  residenceMembre: '',
  lieuTravailMembre: '',
  fonctionMembre: '',
  nouvelleAmeMembre: '2',
  dateConversionMembre: '',
  baptemeEauMembre: '2',
  dateBaptemeMembre: '',
  lieuBaptemeEauMembre: '',
  baptemeSaintEspritMembre: '2',
  dateBaptemeSaintEspritMembre: '',
  egliseOrigineMembre: '',
  situationMatrimonialeMembre: '',
  nomFiance: '',
  nomAmiEglise: '',
  photoMembre: '',
};

const civiliteOptions = [
  { value: '1', label: 'Monsieur' },
  { value: '2', label: 'Madame' },
  { value: '3', label: 'Mademoiselle' },
];

const genreOptions = [
  { value: '1', label: 'M' },
  { value: '2', label: 'F' },
];

const yesNoOptions = [
  { value: '1', label: 'Oui' },
  { value: '2', label: 'Non' },
];

const situationOptions = [
  { value: '1', label: 'Célibataire' },
  { value: '3', label: 'Fiancé(e)' },
  { value: '5', label: 'Marié(e)' },
  { value: '6', label: 'Divorcé(e)' },
  { value: '7', label: 'Veuve' },
  { value: '8', label: 'Veuf' },
];

const isYes = (value: string) => value === '1';

// La situation "Fiancé(e)" ou "Marié(e)" est la seule ou le nom du/de la
// partenaire a un sens : on cache le champ sinon pour ne pas demander une
// information qui ne s'applique pas (célibataire, divorcé, veuf/veuve).
const showsNomFiance = (value: string) => value === '3' || value === '5';

const MOIS_LABELS = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre',
];

// Annee courante calculee une seule fois : evite de recalculer a chaque rendu
// et couvre largement les dates de naissance les plus anciennes (110 ans).
const CURRENT_YEAR = new Date().getFullYear();
const ANNEE_OPTIONS = Array.from({ length: 110 }, (_, index) => String(CURRENT_YEAR - index));

const pad2 = (value: number) => String(value).padStart(2, '0');

const parseIsoDate = (value: string) => {
  const [year = '', month = '', day = ''] = value ? value.split('-') : [];
  return { year, month, day };
};

const getDaysInMonth = (year: string, month: string) => {
  if (!year || !month) return 31;
  return new Date(Number(year), Number(month), 0).getDate();
};

export function PublicMemberRegistrationView() {
  const [searchParams] = useSearchParams();
  const [activeStep, setActiveStep] = useState(0);
  const [form, setForm] = useState<PublicMemberForm>(initialForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [photoError, setPhotoError] = useState('');

  const idUtilisateur = Number(searchParams.get('user') || searchParams.get('idUtilisateur') || 0);
  const churchName = searchParams.get('church') || 'Ma Communaute';

  const stepInfo = steps[activeStep];

  const requiredFieldsByStep = useMemo<Record<number, Array<keyof PublicMemberForm>>>(() => ({
    0: ['nomMembre'],
    1: ['contactMembre'],
    2: [],
    3: [],
  }), []);

  const setField = (name: keyof PublicMemberForm, value: string) => {
    // Le telephone n'accepte que des chiffres : on retire le reste au lieu
    // de refuser la saisie, pour ne pas perdre ce qui est deja tape.
    const sanitizedValue = name === 'contactMembre' ? value.replace(/\D/g, '') : value;
    const nextForm: PublicMemberForm = { ...form, [name]: sanitizedValue };

    if (name === 'civiliteMembre') {
      if (value === '1') {
        nextForm.sexeMembre = '1';
      }
      if (value === '2' || value === '3') {
        nextForm.sexeMembre = '2';
      }
    }

    if (name === 'baptemeEauMembre' && !isYes(value)) {
      nextForm.dateBaptemeMembre = '';
      nextForm.lieuBaptemeEauMembre = '';
    }

    if (name === 'baptemeSaintEspritMembre' && !isYes(value)) {
      nextForm.dateBaptemeSaintEspritMembre = '';
    }

    if (name === 'situationMatrimonialeMembre' && !showsNomFiance(value)) {
      nextForm.nomFiance = '';
    }

    setForm(nextForm);
    setErrors((previous) => {
      const nextErrors = { ...previous };
      delete nextErrors[name];
      if (name === 'civiliteMembre') {
        delete nextErrors.sexeMembre;
      }
      return nextErrors;
    });
  };

  const convertFileToBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });

  const handlePhotoChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setPhotoError('La photo ne doit pas dépasser 5 Mo.');
      return;
    }
    if (!file.type.startsWith('image/')) {
      setPhotoError('Veuillez sélectionner une image valide.');
      return;
    }

    setPhotoError('');
    const base64 = await convertFileToBase64(file);
    setForm((previous) => ({ ...previous, photoMembre: base64 }));
  };

  const handleRemovePhoto = () => {
    setPhotoError('');
    setForm((previous) => ({ ...previous, photoMembre: '' }));
  };

  const validateStep = (stepIndex: number) => {
    const nextErrors: Record<string, string> = {};

    requiredFieldsByStep[stepIndex].forEach((fieldName) => {
      if (!String(form[fieldName] || '').trim()) {
        nextErrors[fieldName] = 'Champ obligatoire';
      }
    });

    if (stepIndex === 1 && form.contactMembre.replace(/\D/g, '').length < 10) {
      nextErrors.contactMembre = 'Numéro incorrect (10 chiffres minimum)';
    }

    if (stepIndex === 1 && form.emailMembre.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.emailMembre.trim())) {
      nextErrors.emailMembre = 'Email invalide';
    }

    if (stepIndex === 2 && isYes(form.baptemeEauMembre) && !form.dateBaptemeMembre) {
      nextErrors.dateBaptemeMembre = "Date du baptême d'eau obligatoire";
    }

    if (stepIndex === 2 && isYes(form.baptemeSaintEspritMembre) && !form.dateBaptemeSaintEspritMembre) {
      nextErrors.dateBaptemeSaintEspritMembre = 'Date du baptême du Saint-Esprit obligatoire';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleNext = () => {
    if (!validateStep(activeStep)) {
      return;
    }

    setActiveStep((previous) => Math.min(previous + 1, steps.length - 1));
  };

  const handleBack = () => {
    setSubmitError('');
    setActiveStep((previous) => Math.max(previous - 1, 0));
  };

  const handleSubmit = async () => {
    if (!idUtilisateur) {
      setSubmitError("Ce lien d'inscription est incomplet. Demandez un nouveau QR code à l'église.");
      return;
    }

    for (let stepIndex = 0; stepIndex < steps.length - 1; stepIndex += 1) {
      if (!validateStep(stepIndex)) {
        setActiveStep(stepIndex);
        return;
      }
    }

    try {
      setSubmitting(true);
      setSubmitError('');

      const payload = {
        ...form,
        contactMembre: form.contactMembre.replace(/\D/g, ''),
        dateNaissMembre: form.dateNaissMembre || null,
        dateConversionMembre: form.dateConversionMembre || null,
        dateBaptemeMembre: form.dateBaptemeMembre || null,
        dateBaptemeSaintEspritMembre: form.dateBaptemeSaintEspritMembre || null,
        sexeMembre: Number(form.sexeMembre) || 0,
        civiliteMembre: Number(form.civiliteMembre) || 0,
        nouvelleAmeMembre: Number(form.nouvelleAmeMembre) || 0,
        baptemeEauMembre: Number(form.baptemeEauMembre) || 0,
        baptemeSaintEspritMembre: Number(form.baptemeSaintEspritMembre) || 0,
        situationMatrimonialeMembre: Number(form.situationMatrimonialeMembre) || 0,
        dateMariageMembre: null,
        capaciteSpirituelleMembre: 0,
        visiteMembre: 2,
        heureVisiteMembre: '',
        raisonNonVisiteMembre: '',
        dateDecisionMembre: null,
        photoMembre: form.photoMembre || '',
        idNiveauEtude: null,
        idCellule: null,
        idDepartement: null,
        idGroupe: null,
        idResponsabilite: null,
        estDecede: 0,
        dateDecesMembre: null,
        idUtilisateur,
      };

      const response = await apiClient.createMemberRegistrationRequest(payload);

      if (response.status !== 1) {
        throw new Error(response.message || "L'inscription n'a pas pu être envoyée.");
      }

      setSubmitted(true);
    } catch (error) {
      setSubmitError(getApiErrorMessage(error, "L'inscription n'a pas pu être envoyée."));
    } finally {
      setSubmitting(false);
    }
  };

  // Champ date en 3 listes (Jour / Mois / Année) plutot qu'un input natif type="date" :
  // sur mobile, le calendrier natif oblige a naviguer mois par mois pour atteindre une
  // annee ancienne (ex. une date de naissance en 1995), ce qui est tres penible. Ici,
  // l'annee se choisit directement dans une liste deroulante.
  const renderDateField = (name: keyof PublicMemberForm, label: string) => {
    const { day, month, year } = parseIsoDate(form[name]);
    const maxDay = getDaysInMonth(year, month);
    const jourOptions = Array.from({ length: maxDay }, (_, index) => pad2(index + 1));

    const updateDate = (nextDay: string, nextMonth: string, nextYear: string) => {
      setField(name, nextDay && nextMonth && nextYear ? `${nextYear}-${nextMonth}-${nextDay}` : '');
    };

    return (
      <Box sx={{ flex: 1, minWidth: 0, width: '100%' }}>
        <Typography variant="caption" color={errors[name] ? 'error' : 'text.secondary'} sx={{ display: 'block', mb: 0.5 }}>
          {label}
        </Typography>
        <Stack direction="row" spacing={1}>
          <TextField
            select
            label="Jour"
            value={day}
            onChange={(event) => updateDate(event.target.value, month, year)}
            error={Boolean(errors[name])}
            sx={{ flex: 1, minWidth: 0 }}
          >
            {jourOptions.map((option) => (
              <MenuItem key={option} value={option}>{option}</MenuItem>
            ))}
          </TextField>
          <TextField
            select
            label="Mois"
            value={month}
            onChange={(event) => {
              const nextMonth = event.target.value;
              const clampedMax = getDaysInMonth(year, nextMonth);
              const nextDay = day && Number(day) > clampedMax ? pad2(clampedMax) : day;
              updateDate(nextDay, nextMonth, year);
            }}
            error={Boolean(errors[name])}
            sx={{ flex: 1.6, minWidth: 0 }}
          >
            {MOIS_LABELS.map((label_, index) => (
              <MenuItem key={label_} value={pad2(index + 1)}>{label_}</MenuItem>
            ))}
          </TextField>
          <TextField
            select
            label="Année"
            value={year}
            onChange={(event) => updateDate(day, month, event.target.value)}
            error={Boolean(errors[name])}
            sx={{ flex: 1.2, minWidth: 0 }}
          >
            {ANNEE_OPTIONS.map((option) => (
              <MenuItem key={option} value={option}>{option}</MenuItem>
            ))}
          </TextField>
        </Stack>
        {errors[name] && (
          <Typography variant="caption" color="error" sx={{ display: 'block', mt: 0.5 }}>
            {errors[name]}
          </Typography>
        )}
      </Box>
    );
  };

  const renderTextField = (
    name: keyof PublicMemberForm,
    label: string,
    options?: Array<{ value: string; label: string }>,
    type = 'text'
  ) => {
    if (type === 'date') {
      return renderDateField(name, label);
    }

    return (
      <TextField
        fullWidth
        select={Boolean(options)}
        type={type}
        label={label}
        value={form[name]}
        onChange={(event) => setField(name, event.target.value)}
        error={Boolean(errors[name])}
        helperText={errors[name] || (type === 'tel' ? '10 chiffres minimum' : undefined)}
        inputProps={type === 'tel' ? { inputMode: 'numeric', maxLength: 15 } : undefined}
      >
        {options?.map((option) => (
          <MenuItem key={option.value} value={option.value}>
            {option.label}
          </MenuItem>
        ))}
      </TextField>
    );
  };

  const renderStepContent = () => {
    if (activeStep === 0) {
      return (
        <Stack spacing={2}>
          <Stack alignItems="center" spacing={1}>
            <Box position="relative">
              <Avatar
                src={form.photoMembre || undefined}
                sx={{ width: 96, height: 96, border: '2px solid #ccc', backgroundColor: '#f5f5f5' }}
              >
                {!form.photoMembre && <PersonRounded fontSize="large" />}
              </Avatar>
              <IconButton
                component="label"
                size="small"
                sx={{
                  position: 'absolute',
                  bottom: 0,
                  right: 0,
                  backgroundColor: 'primary.main',
                  color: 'white',
                  '&:hover': { backgroundColor: 'primary.dark' },
                }}
              >
                <PhotoCameraRounded fontSize="small" />
                <input type="file" hidden accept="image/*" onChange={handlePhotoChange} />
              </IconButton>
              {form.photoMembre && (
                <IconButton
                  size="small"
                  onClick={handleRemovePhoto}
                  sx={{
                    position: 'absolute',
                    top: 0,
                    right: 0,
                    backgroundColor: 'error.main',
                    color: 'white',
                    '&:hover': { backgroundColor: 'error.dark' },
                  }}
                >
                  <CloseRounded fontSize="small" />
                </IconButton>
              )}
            </Box>
            <Typography variant="caption" color={photoError ? 'error' : 'text.secondary'}>
              {photoError || 'Ajoutez votre photo (facultatif)'}
            </Typography>
          </Stack>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            {renderTextField('nomMembre', 'Nom *')}
            {renderTextField('prenomMembre', 'Prénoms')}
          </Stack>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            {renderTextField('civiliteMembre', 'Civilité', civiliteOptions)}
            {renderTextField('sexeMembre', 'Genre', genreOptions)}
          </Stack>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            {renderTextField('dateNaissMembre', 'Date de naissance', undefined, 'date')}
            {renderTextField('lieuNaissMembre', 'Lieu de naissance')}
          </Stack>
          {renderTextField('nationaliteMembre', 'Nationalité')}
        </Stack>
      );
    }

    if (activeStep === 1) {
      return (
        <Stack spacing={2}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            {renderTextField('contactMembre', 'Téléphone *', undefined, 'tel')}
            {renderTextField('emailMembre', 'Email', undefined, 'email')}
          </Stack>
          {renderTextField('residenceMembre', "Lieu d'habitation")}
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            {renderTextField('fonctionMembre', 'Fonction / profession')}
            {renderTextField('lieuTravailMembre', 'Lieu de travail')}
          </Stack>
        </Stack>
      );
    }

    if (activeStep === 2) {
      return (
        <Stack spacing={2}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            {renderTextField('nouvelleAmeMembre', 'Nouvelle âme', yesNoOptions)}
            {renderTextField('dateConversionMembre', 'Date de conversion', undefined, 'date')}
          </Stack>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            {renderTextField('baptemeEauMembre', "Baptême d'eau", yesNoOptions)}
            {isYes(form.baptemeEauMembre) && renderTextField('dateBaptemeMembre', "Date du baptême d'eau *", undefined, 'date')}
          </Stack>
          {isYes(form.baptemeEauMembre) && renderTextField('lieuBaptemeEauMembre', "Lieu du baptême d'eau")}
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            {renderTextField('baptemeSaintEspritMembre', 'Baptême du Saint-Esprit', yesNoOptions)}
            {isYes(form.baptemeSaintEspritMembre) && renderTextField('dateBaptemeSaintEspritMembre', 'Date du baptême du Saint-Esprit *', undefined, 'date')}
          </Stack>
          {renderTextField('egliseOrigineMembre', "Église d'origine")}
        </Stack>
      );
    }

    return (
      <Stack spacing={2}>
        {renderTextField('situationMatrimonialeMembre', 'Situation matrimoniale', situationOptions)}
        {showsNomFiance(form.situationMatrimonialeMembre) &&
          renderTextField('nomFiance', 'Nom fiancé(e) / conjoint')}
        {renderTextField('nomAmiEglise', "Ami à l'église")}
        <Alert severity="info" icon={<CheckCircleRounded fontSize="inherit" />}>
          Vous y êtes presque ! Vérifiez vos informations puis envoyez-les : l&apos;église les
          examinera avant de vous accueillir officiellement parmi les membres.
        </Alert>
      </Stack>
    );
  };

  const StepIcon = stepInfo.icon;
  const progressPercent = Math.round(((activeStep + 1) / steps.length) * 100);

  return (
    <Box
      sx={{
        minHeight: '100vh',
        px: { xs: 2, sm: 3 },
        py: { xs: 3, sm: 5 },
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: (theme) => theme.palette.mode === 'dark'
          ? theme.palette.background.default
          : `radial-gradient(circle at top, ${theme.palette.primary.lighter} 0%, #f4f7fb 55%)`,
      }}
    >
      <Card
        sx={{
          width: 1,
          maxWidth: 760,
          borderRadius: 4,
          overflow: 'hidden',
          boxShadow: '0 24px 70px rgba(15, 23, 42, 0.14)',
        }}
      >
        {/* Simple bandeau decoratif en haut de la carte, pour rendre le
            formulaire plus accueillant (masque une fois l'inscription envoyee). */}
        {!submitted && (
          <Box
            sx={{
              height: 6,
              background: (theme) =>
                `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.success.main})`,
            }}
          />
        )}

        <CardContent sx={{ p: { xs: 2.5, sm: 4 } }}>
          {submitted ? (
            <Stack spacing={2.5} alignItems="center" textAlign="center" py={4}>
              <Box
                sx={{
                  width: 96,
                  height: 96,
                  borderRadius: '50%',
                  display: 'grid',
                  placeItems: 'center',
                  bgcolor: 'success.lighter',
                }}
              >
                <CheckCircleRounded color="success" sx={{ fontSize: 64 }} />
              </Box>
              <Box>
                <Typography variant="h4" gutterBottom>
                  Bienvenue parmi nous&nbsp;!
                </Typography>
                <Typography color="text.secondary" sx={{ maxWidth: 420, mx: 'auto' }}>
                  Merci {form.prenomMembre || form.nomMembre}. {churchName} a bien reçu vos
                  informations et reviendra vers vous très bientôt.
                </Typography>
              </Box>
            </Stack>
          ) : (
            <Stack spacing={3}>
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
                  <PersonAddAlt1Rounded />
                </Box>
                <Box sx={{ minWidth: 0 }}>
                  <Typography variant="overline" color="text.secondary" sx={{ overflowWrap: 'anywhere' }}>
                    {churchName}
                  </Typography>
                  <Typography variant="h4" sx={{ fontSize: { xs: '1.45rem', sm: '2rem' } }}>
                    Inscription membre
                  </Typography>
                </Box>
              </Stack>

              <Stepper activeStep={activeStep} alternativeLabel sx={{ display: { xs: 'none', sm: 'flex' } }}>
                {steps.map((step) => (
                  <Step key={step.label}>
                    <StepLabel>{step.label}</StepLabel>
                  </Step>
                ))}
              </Stepper>

              {/* Barre de progression : visible meme sur mobile, contrairement au
                  Stepper ci-dessus qui est masque sur petit ecran (voir son sx). */}
              <Box>
                <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 0.75 }}>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                    Étape {activeStep + 1} sur {steps.length}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {progressPercent}%
                  </Typography>
                </Stack>
                <LinearProgress
                  variant="determinate"
                  value={progressPercent}
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
                  <StepIcon fontSize="small" />
                </Box>
                <Box>
                  <Typography variant="h6">{stepInfo.label}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {stepInfo.description}
                  </Typography>
                </Box>
              </Stack>

              {submitError && <Alert severity="error">{submitError}</Alert>}

              {renderStepContent()}

              <Stack direction="row" spacing={1.5} justifyContent="space-between">
                <Button color="inherit" disabled={activeStep === 0 || submitting} onClick={handleBack}>
                  Retour
                </Button>
                {activeStep < steps.length - 1 ? (
                  <Button
                    variant="contained"
                    size="large"
                    onClick={handleNext}
                    endIcon={<ArrowForwardRounded />}
                    sx={{ px: 3.5 }}
                  >
                    Continuer
                  </Button>
                ) : (
                  <Button
                    variant="contained"
                    color="success"
                    size="large"
                    onClick={handleSubmit}
                    disabled={submitting}
                    startIcon={submitting ? <CircularProgress size={18} color="inherit" /> : <CheckCircleRounded />}
                    sx={{ px: 3.5 }}
                  >
                    Valider l&apos;inscription
                  </Button>
                )}
              </Stack>
            </Stack>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}
