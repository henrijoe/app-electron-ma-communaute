import { useDispatch } from 'react-redux';
import { useState, useCallback } from 'react';

import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';
import InputAdornment from '@mui/material/InputAdornment';
import {
  AlternateEmailRounded,
  ChurchRounded,
  HomeWorkOutlined,
  LockOutlined,
  PersonOutlineRounded,
  PhoneIphoneRounded,
  StorefrontRounded,
} from '@mui/icons-material';

import { RouterLink } from 'src/routes/components';
import { useRouter } from 'src/routes/hooks';

import { apiClient, getApiErrorMessage } from 'src/utils/apiClient';

import { setUserLoggedIn, setUserConnected } from 'src/store/appSlice';
import { setConnecter, setUtilisateurData } from 'src/store/userSlice';

import { useNotificationSnackbar } from 'src/components/alert/notificationSnackbar';

type RegisterForm = {
  nomTemple: string;
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
  nomEglise: '',
  nomUtilisateur: '',
  prenomUtilisateur: '',
  telephoneUtilisateur: '',
  email: '',
  password: '',
  confirmPassword: '',
};

const registerTextFieldSx = {
  '& .MuiOutlinedInput-root': {
    borderRadius: 2,
    bgcolor: (theme: any) =>
      theme.palette.mode === 'dark'
        ? 'rgba(255,255,255,0.06)'
        : '#edf2ff',
  },
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
  const { showNotification, NotificationComponent } = useNotificationSnackbar();

  const onChange = useCallback(
    (field: keyof RegisterForm) => (event: React.ChangeEvent<HTMLInputElement>) => {
      setForm((prev) => ({ ...prev, [field]: event.target.value }));
    },
    []
  );

  const handleRegister = useCallback(async () => {
    if (loading) return;

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
        nomUtilisateur: form.nomUtilisateur.trim(),
        prenomUtilisateur: form.prenomUtilisateur.trim(),
        telephoneUtilisateur: form.telephoneUtilisateur.trim(),
        password: form.password,
        confirmPassword: form.confirmPassword,
        email: form.email.trim(),
      };

      const registerResponse = await apiClient.registerUtilisateur(registerPayload);

      if (registerResponse.status !== 1 || !registerResponse.data) {
        throw new Error(registerResponse.error?.message || 'Creation du compte impossible');
      }

      const createdUser = extractFirstItem(registerResponse.data);
      if (!createdUser?.idUtilisateur) {
        throw new Error('Compte cree sans identifiant utilisateur');
      }

      const nomEglise = form.nomEglise.trim() || form.nomTemple.trim();

      try {
        await apiClient.createCommunauteDatabase({
          idUtilisateur: Number(createdUser.idUtilisateur),
          nomTemple: form.nomTemple.trim(),
          nomEglise,
          dossierBase: 'C:\\base-communaute',
        });
      } catch (databaseError) {
        console.warn('Creation de la base SQLite non disponible ou en echec:', databaseError);
      }

      const egliseResponse = await apiClient.createEglise({
        nomEglise,
        idUtilisateur: Number(createdUser.idUtilisateur),
      });

      if (egliseResponse.status !== 1) {
        throw new Error(egliseResponse.error?.message || "Creation de l'eglise impossible");
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
      dispatch(setConnecter(true));
      dispatch(setUserConnected(connectedUser));
      dispatch(setUserLoggedIn(true));

      showNotification('Compte cree et connexion reussie', 'success');
      router.push('/');
    } catch (error: any) {
      showNotification(
        getApiErrorMessage(error, "Inscription impossible. Verifiez les informations saisies puis reessayez."),
        'error'
      );
    } finally {
      setLoading(false);
    }
  }, [dispatch, form, loading, router, showNotification]);

  return (
    <>
      <Box sx={{ mb: { xs: 4, md: 5 }, textAlign: { xs: 'center', md: 'left' } }}>
        <Typography variant="h2" sx={{ fontSize: { xs: 20, md: 25 }, mb: 1.5 }}>
          Inscription à Ma Communaute
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 460, mx: { xs: 'auto', md: 0 } }}>
          Creez votre compte, votre eglise.
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
          <Grid item xs={12}>
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
              sx={registerTextFieldSx}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Nom de l'eglise"
              placeholder="Ex: Communaute de la Grace"
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
              sx={registerTextFieldSx}
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
              sx={registerTextFieldSx}
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
              sx={registerTextFieldSx}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Telephone *"
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
              sx={registerTextFieldSx}
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
              helperText="Cet email servira a recuperer votre mot de passe en cas d'oubli."
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <AlternateEmailRounded sx={{ color: 'text.disabled' }} />
                  </InputAdornment>
                ),
              }}
              sx={registerTextFieldSx}
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
              sx={registerTextFieldSx}
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
              sx={registerTextFieldSx}
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
          sx={{
            mt: 1,
            py: 1.7,
            borderRadius: 2,
            bgcolor: '#4361ee',
            color: 'common.white',
            '&:hover': { bgcolor: '#3451cc' },
          }}
        >
          Creer un compte
        </LoadingButton>
      </Stack>

      <Typography variant="body2" color="text.secondary" sx={{ mt: 4, textAlign: 'center' }}>
        Vous avez deja un compte ?
        <Link component={RouterLink} href="/sign-in" variant="subtitle2" sx={{ ml: 0.5 }}>
          Se connecter
        </Link>
      </Typography>

      <NotificationComponent />
    </>
  );
}
