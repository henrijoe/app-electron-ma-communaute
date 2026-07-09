import { useDispatch } from 'react-redux';
import { useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Link from '@mui/material/Link';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';
import InputAdornment from '@mui/material/InputAdornment';
import {
  LockOutlined,
  ChurchRounded,
  HomeWorkOutlined,
  StorefrontRounded,
  PhoneIphoneRounded,
  PersonOutlineRounded,
  AlternateEmailRounded,
} from '@mui/icons-material';

import { useRouter } from 'src/routes/hooks';
import { RouterLink } from 'src/routes/components';

import { apiClient, getApiErrorMessage, saveLocalAuthToken } from 'src/utils/apiClient';
import {
  type LinkedBrowserContext,
  captureLinkedBrowserContextFromCurrentUrl,
} from 'src/utils/browser-link';

import { setUserLoggedIn, setUserConnected } from 'src/store/appSlice';
import { setConnecter, setUtilisateurData } from 'src/store/userSlice';

import { useNotificationSnackbar } from 'src/components/alert/notificationSnackbar';

import {
  authLinkSx,
  authTitleSx,
  authBodyTextSx,
  authMutedTextSx,
  authTextFieldSx,
  authWarningAlertSx,
  authPrimaryButtonSx,
} from './auth-view-shared';

type RegisterForm = {
  nomTemple: string;
  nomEgliseCourt: string;
  nomEglise: string;
  nomUtilisateur: string;
  prenomUtilisateur: string;
  telephoneUtilisateur: string;
  email: string;
  password: string;
  confirmPassword: string;
};

const initialForm: RegisterForm = {
  nomTemple: '',
  nomEgliseCourt: '',
  nomEglise: '',
  nomUtilisateur: '',
  prenomUtilisateur: '',
  telephoneUtilisateur: '',
  email: '',
  password: '',
  confirmPassword: '',
};

const extractFirstItem = (data: any) => {
  if (Array.isArray(data)) return data[0] || null;
  return data || null;
};

export function SignUpView() {
  const dispatch = useDispatch();
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<RegisterForm>(initialForm);
  const [linkedBrowserContext, setLinkedBrowserContext] = useState<LinkedBrowserContext | null>(
    null
  );
  const { showNotification, NotificationComponent } = useNotificationSnackbar();

  useEffect(() => {
    setLinkedBrowserContext(captureLinkedBrowserContextFromCurrentUrl());
  }, []);

  const onChange = useCallback(
    (field: keyof RegisterForm) => (event: React.ChangeEvent<HTMLInputElement>) => {
      setForm((prev) => ({ ...prev, [field]: event.target.value }));
    },
    []
  );

  const handleRegister = useCallback(async () => {
    if (loading) return;

    if (linkedBrowserContext) {
      showNotification(
        'Ce navigateur est deja lie a une base existante. Connecte-toi avec le compte principal ou fais creer un utilisateur secondaire depuis Parametres.',
        'warning'
      );
      return;
    }

    const requiredValues = [
      form.nomTemple,
      form.nomUtilisateur,
      form.prenomUtilisateur,
      form.telephoneUtilisateur,
      form.password,
      form.confirmPassword,
    ];

    if (requiredValues.some((value) => !value.trim())) {
      showNotification('Veuillez renseigner les champs obligatoires', 'warning');
      return;
    }

    if (form.password !== form.confirmPassword) {
      showNotification('Les mots de passe ne correspondent pas', 'warning');
      return;
    }

    try {
      setLoading(true);

      const registerPayload = {
        logoUtilisateur: '',
        nomTemple: form.nomTemple.trim(),
        nomEgliseCourt: form.nomEgliseCourt.trim(),
        nomUtilisateur: form.nomUtilisateur.trim(),
        prenomUtilisateur: form.prenomUtilisateur.trim(),
        telephoneUtilisateur: form.telephoneUtilisateur.trim(),
        password: form.password,
        confirmPassword: form.confirmPassword,
        email: form.email.trim(),
      };

      const registerResponse = await apiClient.registerUtilisateur(registerPayload);

      if (registerResponse.status !== 1 || !registerResponse.data) {
        throw new Error(registerResponse.error?.message || 'Création du compte impossible');
      }

      const createdUser = extractFirstItem(registerResponse.data);
      if (!createdUser?.idUtilisateur) {
        throw new Error('Compte créé sans identifiant utilisateur');
      }

      const nomEglise = form.nomEglise.trim() || form.nomTemple.trim();

      try {
        await apiClient.createCommunauteDatabase({
          idUtilisateur: Number(createdUser.idUtilisateur),
          nomTemple: form.nomEgliseCourt.trim() || form.nomTemple.trim(),
          nomEglise,
          dossierBase: 'C:\\base-communaute',
        });
      } catch (databaseError) {
        console.warn('Création de la base SQLite non disponible ou en échec:', databaseError);
      }

      const egliseResponse = await apiClient.createEglise({
        nomEglise,
        idUtilisateur: Number(createdUser.idUtilisateur),
      });

      if (egliseResponse.status !== 1) {
        throw new Error(egliseResponse.error?.message || "Création de l'église impossible");
      }

      const loginResponse = await apiClient.login({
        nomUtilisateur: form.nomUtilisateur.trim(),
        password: form.password,
      });

      if (loginResponse.status !== 1 || !loginResponse.data) {
        throw new Error(loginResponse.error?.message || 'Connexion automatique impossible');
      }

      const connectedUser = extractFirstItem(loginResponse.data);

      dispatch(setUtilisateurData(connectedUser));
      saveLocalAuthToken(connectedUser?.token);
      dispatch(setConnecter(true));
      dispatch(setUserConnected(connectedUser));
      dispatch(setUserLoggedIn(true));

      showNotification('Compte créé et connexion réussie', 'success');
      router.push('/');
    } catch (error: any) {
      showNotification(
        getApiErrorMessage(
          error,
          'Inscription impossible. Verifiez les informations saisies puis reessayez.'
        ),
        'error'
      );
    } finally {
      setLoading(false);
    }
  }, [dispatch, form, linkedBrowserContext, loading, router, showNotification]);

  if (linkedBrowserContext) {
    return (
      <>
        <Box sx={{ mb: { xs: 4, md: 5 }, textAlign: { xs: 'center', md: 'left' } }}>
          <Typography variant="h2" sx={authTitleSx}>
            Cette base existe déjà
          </Typography>
          <Typography
            variant="body1"
            sx={{ ...authBodyTextSx, maxWidth: 560, mx: { xs: 'auto', md: 0 } }}
          >
            Ce navigateur est deja lie a {linkedBrowserContext.churchName || 'une eglise existante'}
            .
          </Typography>
        </Box>

        <Stack spacing={3}>
          <Alert severity="warning" sx={authWarningAlertSx}>
            Pour eviter de creer plusieurs eglises differentes pour les memes donnees, cette page
            d&apos;inscription est bloquee sur ce navigateur. Connecte-toi avec{' '}
            {linkedBrowserContext.username || 'le compte principal'} ou demande la creation
            d&apos;un utilisateur secondaire dans Parametres.
          </Alert>

          <Button
            component={RouterLink}
            href="/sign-in"
            variant="contained"
            color="inherit"
            sx={authPrimaryButtonSx}
          >
            Aller a la connexion
          </Button>
        </Stack>

        <NotificationComponent />
      </>
    );
  }

  return (
    <>
      <Box sx={{ mb: { xs: 4, md: 5 }, textAlign: { xs: 'center', md: 'left' } }}>
        <Typography variant="h2" sx={authTitleSx}>
          Inscription à Ma Communauté
        </Typography>
        <Typography variant="body1" sx={{ ...authBodyTextSx, mx: { xs: 'auto', md: 0 } }}>
          Créez votre compte, votre église.
        </Typography>
      </Box>

      <Stack
        component="form"
        onSubmit={(event) => {
          event.preventDefault();
          handleRegister();
        }}
        spacing={3}
      >
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Nom du temple *"
              placeholder="Ex: Temple Eben-Ezer"
              value={form.nomTemple}
              onChange={onChange('nomTemple')}
              InputLabelProps={{ shrink: true }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <ChurchRounded sx={{ color: 'text.disabled' }} />
                  </InputAdornment>
                ),
              }}
              sx={authTextFieldSx}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Nom abrege"
              placeholder="Ex: EEAD ANDOKOI PENIEL"
              value={form.nomEgliseCourt}
              onChange={onChange('nomEgliseCourt')}
              InputLabelProps={{ shrink: true }}
              helperText="Affiché dans l'entête de l'application."
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <StorefrontRounded sx={{ color: 'text.disabled' }} />
                  </InputAdornment>
                ),
              }}
              sx={authTextFieldSx}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Nom de l'église"
              placeholder="Ex: Communauté de la Grâce"
              value={form.nomEglise}
              onChange={onChange('nomEglise')}
              InputLabelProps={{ shrink: true }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <StorefrontRounded sx={{ color: 'text.disabled' }} />
                  </InputAdornment>
                ),
              }}
              sx={authTextFieldSx}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Nom utilisateur *"
              placeholder="Ex: Henri"
              value={form.nomUtilisateur}
              onChange={onChange('nomUtilisateur')}
              InputLabelProps={{ shrink: true }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <PersonOutlineRounded sx={{ color: 'text.disabled' }} />
                  </InputAdornment>
                ),
              }}
              sx={authTextFieldSx}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Prenom *"
              placeholder="Ex: Jean"
              value={form.prenomUtilisateur}
              onChange={onChange('prenomUtilisateur')}
              InputLabelProps={{ shrink: true }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <PersonOutlineRounded sx={{ color: 'text.disabled' }} />
                  </InputAdornment>
                ),
              }}
              sx={authTextFieldSx}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Téléphone *"
              placeholder="Ex: 0102030405"
              value={form.telephoneUtilisateur}
              onChange={onChange('telephoneUtilisateur')}
              InputLabelProps={{ shrink: true }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <PhoneIphoneRounded sx={{ color: 'text.disabled' }} />
                  </InputAdornment>
                ),
              }}
              sx={authTextFieldSx}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              type="email"
              label="Email *"
              placeholder="Ex: contact@eglise.com"
              value={form.email}
              onChange={onChange('email')}
              InputLabelProps={{ shrink: true }}
              helperText="Cet email servira à récupérer votre mot de passe en cas d'oubli."
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <AlternateEmailRounded sx={{ color: 'text.disabled' }} />
                  </InputAdornment>
                ),
              }}
              sx={authTextFieldSx}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Mot de passe *"
              type="password"
              placeholder="Choisissez un mot de passe"
              value={form.password}
              onChange={onChange('password')}
              InputLabelProps={{ shrink: true }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <LockOutlined sx={{ color: 'text.disabled' }} />
                  </InputAdornment>
                ),
              }}
              sx={authTextFieldSx}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Confirmer le mot de passe *"
              type="password"
              placeholder="Retapez votre mot de passe"
              value={form.confirmPassword}
              onChange={onChange('confirmPassword')}
              InputLabelProps={{ shrink: true }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <HomeWorkOutlined sx={{ color: 'text.disabled' }} />
                  </InputAdornment>
                ),
              }}
              sx={authTextFieldSx}
            />
          </Grid>
        </Grid>

        <LoadingButton
          fullWidth
          size="large"
          type="submit"
          color="inherit"
          variant="contained"
          loading={loading}
          sx={authPrimaryButtonSx}
        >
          Creer un compte
        </LoadingButton>
      </Stack>

      <Typography variant="body2" sx={{ mt: 4, textAlign: 'center', ...authMutedTextSx }}>
        Vous avez déjà un compte ?
        <Link
          component={RouterLink}
          href="/sign-in"
          variant="subtitle2"
          sx={{ ml: 0.5, ...authLinkSx }}
        >
          Se connecter
        </Link>
      </Typography>

      <NotificationComponent />
    </>
  );
}
