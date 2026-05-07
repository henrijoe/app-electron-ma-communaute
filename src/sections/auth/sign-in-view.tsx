import { useDispatch } from 'react-redux';
import { useState, useCallback } from 'react';

import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Alert from '@mui/material/Alert';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';
import InputAdornment from '@mui/material/InputAdornment';
import {
  LockOutlined,
  PersonOutlineRounded,
} from '@mui/icons-material';

import { RouterLink } from 'src/routes/components';
import { useRouter } from 'src/routes/hooks';

import { apiClient } from 'src/utils/apiClient';

import { setUserLoggedIn, setUserConnected } from 'src/store/appSlice';
import { setConnecter, setUtilisateurData } from 'src/store/userSlice';

import { Iconify } from 'src/components/iconify';
import { useNotificationSnackbar } from 'src/components/alert/notificationSnackbar';

export function SignInView() {
  const dispatch = useDispatch();
  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [unlockLoading, setUnlockLoading] = useState(false);
  const [nomUtilisateur, setNomUtilisateur] = useState('');
  const [password, setPassword] = useState('');
  const [unlockCode, setUnlockCode] = useState('');
  const [showUnlockCodeForm, setShowUnlockCodeForm] = useState(false);
  const { showNotification, NotificationComponent } = useNotificationSnackbar();
  const isDesktopApp = Boolean((window as any)?.desktopApp?.isDesktop);

  const handleSignIn = useCallback(async () => {
    if (loading) {
      return;
    }

    if (!nomUtilisateur.trim() || !password.trim()) {
      showNotification('Veuillez renseigner le nom utilisateur et le mot de passe', 'warning');
      return;
    }

    try {
      setLoading(true);
      const response = await apiClient.login({
        nomUtilisateur: nomUtilisateur.trim(),
        password,
      });

      if (response.status !== 1 || !response.data) {
        throw new Error(response.error?.message || 'Identifiants invalides');
      }

      const utilisateurConnecte = response.data;

      dispatch(setUtilisateurData(utilisateurConnecte));
      dispatch(setConnecter(true));
      dispatch(setUserConnected(utilisateurConnecte));
      dispatch(setUserLoggedIn(true));

      showNotification('Connexion reussie', 'success');
      router.push('/');
    } catch (error: any) {
      const errorMessage = error?.message || 'Echec de la connexion';
      showNotification(errorMessage, 'error');

      if (isDesktopApp && /licence|bloqu/i.test(errorMessage)) {
        setShowUnlockCodeForm(true);
      }
    } finally {
      setLoading(false);
    }
  }, [dispatch, isDesktopApp, loading, nomUtilisateur, password, router, showNotification]);

  const handleUnlockWithCode = useCallback(async () => {
    if (unlockLoading) {
      return;
    }

    if (!nomUtilisateur.trim()) {
      showNotification("Renseigne d'abord le nom utilisateur du client.", 'warning');
      return;
    }

    if (!unlockCode.trim()) {
      showNotification('Le code de deblocage est requis.', 'warning');
      return;
    }

    try {
      setUnlockLoading(true);
      const response = await apiClient.unlockDesktopAccessWithCode({
        nomUtilisateur: nomUtilisateur.trim(),
        code: unlockCode.trim(),
      });

      if (response.status !== 1) {
        throw new Error(response.error?.message || 'Code de deblocage invalide');
      }

      setUnlockCode('');
      setShowUnlockCodeForm(false);
      showNotification('Application debloquee. Tu peux maintenant te connecter.', 'success');
    } catch (error: any) {
      showNotification(error?.message || 'Code de deblocage invalide.', 'error');
    } finally {
      setUnlockLoading(false);
    }
  }, [nomUtilisateur, showNotification, unlockCode, unlockLoading]);

  return (
    <>
      <Box sx={{ mb: 5 }}>
        <Typography variant="h1" sx={{ fontSize: { xs: 20, md: 25 }, mb: 1.5 }}>
          Connexion à Ma Communaute
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 450 }}>
          Connectez-vous pour retrouver les membres, cultes, departements.
        </Typography>
      </Box>

      <Stack
        component="form"
        onSubmit={(event) => {
          event.preventDefault();
          handleSignIn();
        }}
        spacing={3}
      >
        <TextField
          fullWidth
          name="nomUtilisateur"
          label="Nom utilisateur"
          placeholder="Entrez votre nom utilisateur"
          value={nomUtilisateur}
          onChange={(event) => setNomUtilisateur(event.target.value)}
          InputLabelProps={{ shrink: true }}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <PersonOutlineRounded sx={{ color: 'text.disabled' }} />
              </InputAdornment>
            ),
          }}
          sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, bgcolor: '#edf2ff' } }}
        />

        <Link variant="body2" color="inherit" sx={{ alignSelf: 'flex-end', mt: -1 }}>
          Mot de passe oublie ?
        </Link>

        <TextField
          fullWidth
          name="password"
          label="Mot de passe"
          placeholder="Entrez votre mot de passe"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          InputLabelProps={{ shrink: true }}
          type={showPassword ? 'text' : 'password'}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={() => setShowPassword(!showPassword)} edge="end" size="small">
                  <Iconify icon={showPassword ? 'solar:eye-bold' : 'solar:eye-closed-bold'} />
                </IconButton>
              </InputAdornment>
            ),
          }}
          sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, bgcolor: '#edf2ff' } }}
        />

        <LoadingButton
          fullWidth
          size="large"
          type="submit"
          color="inherit"
          variant="contained"
          loading={loading}
          sx={{
            py: 1.7,
            borderRadius: 2,
            bgcolor: '#4361ee',
            color: 'common.white',
            '&:hover': { bgcolor: '#3451cc' },
          }}
        >
          Se connecter
        </LoadingButton>

        {isDesktopApp && !showUnlockCodeForm && (
          <Link
            component="button"
            type="button"
            variant="body2"
            color="inherit"
            onClick={() => setShowUnlockCodeForm(true)}
            sx={{ alignSelf: 'center' }}
          >
            J&apos;ai un code de deblocage
          </Link>
        )}

        {isDesktopApp && showUnlockCodeForm && (
          <Stack
            spacing={2}
            sx={{
              p: 2,
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 2,
              bgcolor: 'background.neutral',
            }}
          >
            <Alert severity="info">
              Saisis le code fourni par le developpeur pour debloquer cette installation.
            </Alert>

            <TextField
              fullWidth
              label="Code de deblocage"
              value={unlockCode}
              onChange={(event) => setUnlockCode(event.target.value.toUpperCase())}
              placeholder="MC-XXXX-XXXX-XXXX-XXXX"
            />

            <LoadingButton
              fullWidth
              type="button"
              variant="outlined"
              loading={unlockLoading}
              onClick={handleUnlockWithCode}
            >
              Debloquer avec ce code
            </LoadingButton>
          </Stack>
        )}
      </Stack>

      <Typography variant="body2" color="text.secondary" sx={{ mt: 4, textAlign: 'center' }}>
        Vous n&apos;avez pas encore de compte ?
        <Link component={RouterLink} href="/sign-up" variant="subtitle2" sx={{ ml: 0.5 }}>
          Creer une eglise
        </Link>
      </Typography>

      <NotificationComponent />
    </>
  );
}
