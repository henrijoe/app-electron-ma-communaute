import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Stepper from '@mui/material/Stepper';
import MenuItem from '@mui/material/MenuItem';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import CardContent from '@mui/material/CardContent';
import CircularProgress from '@mui/material/CircularProgress';
import CheckCircleRounded from '@mui/icons-material/CheckCircleRounded';
import PersonAddAlt1Rounded from '@mui/icons-material/PersonAddAlt1Rounded';

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
};

const steps = [
  {
    label: 'Identité',
    description: 'Les informations principales du membre.',
  },
  {
    label: 'Contact',
      description: 'Adresse, téléphone et informations utiles.',
    },
  {
    label: 'Vie spirituelle',
    description: 'Conversion, bâptemes et rattachement spirituel.',
  },
  {
    label: 'Validation',
    description: 'Dernière verification avant envoi.',
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

export function PublicMemberRegistrationView() {
  const [searchParams] = useSearchParams();
  const [activeStep, setActiveStep] = useState(0);
  const [form, setForm] = useState<PublicMemberForm>(initialForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState('');

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
    const nextForm: PublicMemberForm = { ...form, [name]: value };

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

  const validateStep = (stepIndex: number) => {
    const nextErrors: Record<string, string> = {};

    requiredFieldsByStep[stepIndex].forEach((fieldName) => {
      if (!String(form[fieldName] || '').trim()) {
        nextErrors[fieldName] = 'Champ obligatoire';
      }
    });

    if (stepIndex === 1 && form.emailMembre.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.emailMembre.trim())) {
      nextErrors.emailMembre = 'Email invalide';
    }

    if (stepIndex === 2 && isYes(form.baptemeEauMembre) && !form.dateBaptemeMembre) {
      nextErrors.dateBaptemeMembre = "Date du bapteme d'eau obligatoire";
    }

    if (stepIndex === 2 && isYes(form.baptemeSaintEspritMembre) && !form.dateBaptemeSaintEspritMembre) {
      nextErrors.dateBaptemeSaintEspritMembre = 'Date du bapteme du Saint-Esprit obligatoire';
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
      setSubmitError("Ce lien d'inscription est incomplet. Demandez un nouveau QR code a l'eglise.");
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
        photoMembre: '',
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
        throw new Error(response.message || "L'inscription n'a pas pu etre envoyee.");
      }

      setSubmitted(true);
    } catch (error) {
      setSubmitError(getApiErrorMessage(error, "L'inscription n'a pas pu etre envoyee."));
    } finally {
      setSubmitting(false);
    }
  };

  const renderTextField = (
    name: keyof PublicMemberForm,
    label: string,
    options?: Array<{ value: string; label: string }>,
    type = 'text'
  ) => (
    <TextField
      fullWidth
      select={Boolean(options)}
      type={type}
      label={label}
      value={form[name]}
      onChange={(event) => setField(name, event.target.value)}
      error={Boolean(errors[name])}
      helperText={errors[name]}
      InputLabelProps={type === 'date' ? { shrink: true } : undefined}
    >
      {options?.map((option) => (
        <MenuItem key={option.value} value={option.value}>
          {option.label}
        </MenuItem>
      ))}
    </TextField>
  );

  const renderStepContent = () => {
    if (activeStep === 0) {
      return (
        <Stack spacing={2}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            {renderTextField('nomMembre', 'Nom *')}
            {renderTextField('prenomMembre', 'Prenoms')}
          </Stack>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            {renderTextField('civiliteMembre', 'Civilite', civiliteOptions)}
            {renderTextField('sexeMembre', 'Genre', genreOptions)}
          </Stack>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            {renderTextField('dateNaissMembre', 'Date de naissance', undefined, 'date')}
            {renderTextField('lieuNaissMembre', 'Lieu de naissance')}
          </Stack>
          {renderTextField('nationaliteMembre', 'Nationalite')}
        </Stack>
      );
    }

    if (activeStep === 1) {
      return (
        <Stack spacing={2}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            {renderTextField('contactMembre', 'Telephone *', undefined, 'tel')}
            {renderTextField('emailMembre', 'Email', undefined, 'email')}
          </Stack>
          {renderTextField('residenceMembre', 'Lieu d habitation')}
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
            {renderTextField('baptemeEauMembre', "Bapteme d'eau", yesNoOptions)}
            {isYes(form.baptemeEauMembre) && renderTextField('dateBaptemeMembre', "Date du bapteme d'eau *", undefined, 'date')}
          </Stack>
          {isYes(form.baptemeEauMembre) && renderTextField('lieuBaptemeEauMembre', "Lieu du bapteme d'eau")}
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            {renderTextField('baptemeSaintEspritMembre', 'Bapteme du Saint-Esprit', yesNoOptions)}
            {isYes(form.baptemeSaintEspritMembre) && renderTextField('dateBaptemeSaintEspritMembre', 'Date du bapteme du Saint-Esprit *', undefined, 'date')}
          </Stack>
          {renderTextField('egliseOrigineMembre', "Eglise d'origine")}
        </Stack>
      );
    }

    return (
      <Stack spacing={2}>
        {renderTextField('situationMatrimonialeMembre', 'Situation matrimoniale', situationOptions)}
        {renderTextField('nomFiance', 'Nom fiance(e) / conjoint')}
        {renderTextField('nomAmiEglise', "Ami a l'eglise")}
        <Alert severity="info">
          Véifiez les informations avant validation. La fiche sera envoyée à l&apos;élise pour
          verification par un responsable.
        </Alert>
      </Stack>
    );
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        px: { xs: 2, sm: 3 },
        py: { xs: 3, sm: 5 },
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: (theme) => theme.palette.mode === 'dark' ? 'background.default' : '#f4f7fb',
      }}
    >
      <Card sx={{ width: 1, maxWidth: 760, borderRadius: 3, boxShadow: '0 18px 60px rgba(15, 23, 42, 0.12)' }}>
        <CardContent sx={{ p: { xs: 2.5, sm: 4 } }}>
          {submitted ? (
            <Stack spacing={2.5} alignItems="center" textAlign="center" py={4}>
              <CheckCircleRounded color="success" sx={{ fontSize: 72 }} />
              <Box>
                <Typography variant="h4" gutterBottom>
                  Informations envoyées avec succès
                </Typography>
                <Typography color="text.secondary">
                  Merci. L&apos;église a bien reçu vos informations.
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
                  }}
                >
                  <PersonAddAlt1Rounded />
                </Box>
                <Box sx={{ minWidth: 0 }}>
                  <Typography variant="overline" color="text.secondary">
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

              <Box>
                <Typography variant="h6">{stepInfo.label}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {stepInfo.description}
                </Typography>
              </Box>

              {submitError && <Alert severity="error">{submitError}</Alert>}

              {renderStepContent()}

              <Stack direction="row" spacing={1.5} justifyContent="space-between">
                <Button color="inherit" disabled={activeStep === 0 || submitting} onClick={handleBack}>
                  Retour
                </Button>
                {activeStep < steps.length - 1 ? (
                  <Button variant="contained" onClick={handleNext}>
                    Continuer
                  </Button>
                ) : (
                  <Button
                    variant="contained"
                    onClick={handleSubmit}
                    disabled={submitting}
                    startIcon={submitting ? <CircularProgress size={18} color="inherit" /> : undefined}
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
