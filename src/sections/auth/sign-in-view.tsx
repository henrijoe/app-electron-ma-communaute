import { useDispatch } from 'react-redux';
import { useState, useCallback } from 'react';

import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Alert from '@mui/material/Alert';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import LoadingButton from '@mui/lab/LoadingButton';
import InputAdornment from '@mui/material/InputAdornment';
import {
  LockOutlined,
  PersonOutlineRounded,
} from '@mui/icons-material';

import { RouterLink } from 'src/routes/components';
import { useRouter } from 'src/routes/hooks';

import { apiClient, getApiErrorMessage } from 'src/utils/apiClient';

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
  const [forgotOpen, setForgotOpen] = useState(false);
  const [forgotStep, setForgotStep] = useState<'request' | 'reset'>('request');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotData, setForgotData] = useState({
    nomUtilisateur: '',
    email: '',
    code: '',
    password: '',
    confirmPassword: '',
  });
  const { showNotification, NotificationComponent } = useNotificationSnackbar();
  const isDesktopApp = Boolean((window as any)?.desktopApp?.isDesktop);

  const handleOpenForgotPassword = useCallback(() => {
    setForgotStep('request');
    setForgotData({
      nomUtilisateur: nomUtilisateur.trim(),
      email: '',
      code: '',
      password: '',
      confirmPassword: '',
    });
    setForgotOpen(true);
  }, [nomUtilisateur]);

  const handleCloseForgotPassword = useCallback(() => {
    if (!forgotLoading) {
      setForgotOpen(false);
    }
  }, [forgotLoading]);

  const handleForgotDataChange = useCallback((field: keyof typeof forgotData, value: string) => {
    setForgotData((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleRequestPasswordReset = useCallback(async () => {
    if (!forgotData.nomUtilisateur.trim() || !forgotData.email.trim()) {
      showNotification("Renseignez le nom utilisateur et l'email du compte.", 'warning');
      return;
    }

    try {
      setForgotLoading(true);
      const response = await apiClient.requestPasswordReset({
        nomUtilisateur: forgotData.nomUtilisateur.trim(),
        email: forgotData.email.trim(),
      });

      if (response.status !== 1) {
        throw new Error(response.error?.message || response.message || 'Demande impossible.');
      }

      setForgotStep('reset');
      showNotification(
        response.data?.message || 'Si ce compte existe, un code a été envoyé par email.',
        'success'
      );
    } catch (error) {
      showNotification(getApiErrorMessage(error, 'Impossible de demander le code.'), 'error');
    } finally {
      setForgotLoading(false);
    }
  }, [forgotData.email, forgotData.nomUtilisateur, showNotification]);

  const handleResetPassword = useCallback(async () => {
    if (
      !forgotData.nomUtilisateur.trim()
      || !forgotData.email.trim()
      || !forgotData.code.trim()
      || !forgotData.password
      || !forgotData.confirmPassword
    ) {
      showNotification('Tous les champs sont requis.', 'warning');
      return;
    }

    if (forgotData.password !== forgotData.confirmPassword) {
      showNotification('Les mots de passe ne correspondent pas.', 'warning');
      return;
    }

    try {
      setForgotLoading(true);
      const response = await apiClient.resetPassword({
        nomUtilisateur: forgotData.nomUtilisateur.trim(),
        email: forgotData.email.trim(),
        code: forgotData.code.trim(),
        password: forgotData.password,
        confirmPassword: forgotData.confirmPassword,
      });

      if (response.status !== 1) {
        throw new Error(response.error?.message || response.message || 'Reinitialisation impossible.');
      }

      setPassword(forgotData.password);
      setForgotOpen(false);
      showNotification('Mot de passe modifié. Vous pouvez vous connecter.', 'success');
    } catch (error) {
      showNotification(getApiErrorMessage(error, 'Code invalide ou expire.'), 'error');
    } finally {
      setForgotLoading(false);
    }
  }, [forgotData, showNotification]);

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

      showNotification('Connexion réussie', 'success');
      router.push('/');
    } catch (error: any) {
      const errorMessage = getApiErrorMessage(
        error,
        "Connexion impossible. Verifiez vos identifiants ou l'adresse du serveur."
      );
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
      showNotification('Le code de déblocage est requis.', 'warning');
      return;
    }

    try {
      setUnlockLoading(true);
      const response = await apiClient.unlockDesktopAccessWithCode({
        nomUtilisateur: nomUtilisateur.trim(),
        code: unlockCode.trim(),
      });

      if (response.status !== 1) {
        throw new Error(response.error?.message || 'Code de déblocage invalide');
      }

      setUnlockCode('');
      setShowUnlockCodeForm(false);
      showNotification('Application débloquée. Tu peux maintenant te connecter.', 'success');
    } catch (error: any) {
      showNotification(getApiErrorMessage(error, 'Code de déblocage invalide.'), 'error');
    } finally {
      setUnlockLoading(false);
    }
  }, [nomUtilisateur, showNotification, unlockCode, unlockLoading]);

  return (
    <>
      <Box sx={{ mb: 5 }}>
        <Typography variant="h1" sx={{ fontSize: { xs: 20, md: 25 }, mb: 1.5 }}>
          Connexion à Ma Communauté
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

        <Link
          component="button"
          type="button"
          variant="body2"
          color="inherit"
          onClick={handleOpenForgotPassword}
          sx={{ alignSelf: 'flex-end', mt: -1 }}
        >
          Mot de passe oublié ?
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
            J&apos;ai un code de déblocage
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
              Saisis le code fourni par le développeur pour débloquer cette installation.
            </Alert>

            <TextField
              fullWidth
              label="Code de déblocage"
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
          Créer une église
        </Link>
      </Typography>

      <NotificationComponent />

      <Dialog open={forgotOpen} onClose={handleCloseForgotPassword} fullWidth maxWidth="xs">
        <DialogTitle>
          {forgotStep === 'request' ? 'Mot de passe oublié' : 'Nouveau mot de passe'}
        </DialogTitle>

        <DialogContent>
          <Stack spacing={2.5} sx={{ pt: 1 }}>
            {forgotStep === 'request' && (
              <>
                <Alert severity="info">
                  Saisissez le nom utilisateur et l&apos;email du compte. Un code sera envoyé par email.
                </Alert>

                <TextField
                  fullWidth
                  label="Nom utilisateur"
                  value={forgotData.nomUtilisateur}
                  onChange={(event) => handleForgotDataChange('nomUtilisateur', event.target.value)}
                />

                <TextField
                  fullWidth
                  type="email"
                  label="Email du compte"
                  value={forgotData.email}
                  onChange={(event) => handleForgotDataChange('email', event.target.value)}
                />
              </>
            )}

            {forgotStep === 'reset' && (
              <>
                <Alert severity="info">
                  Entrez le code reçu par email puis choisissez un nouveau mot de passe.
                </Alert>

                <TextField
                  fullWidth
                  label="Code recu"
                  value={forgotData.code}
                  onChange={(event) => handleForgotDataChange('code', event.target.value)}
                />

                <TextField
                  fullWidth
                  type="password"
                  label="Nouveau mot de passe"
                  value={forgotData.password}
                  onChange={(event) => handleForgotDataChange('password', event.target.value)}
                />

                <TextField
                  fullWidth
                  type="password"
                  label="Confirmer le mot de passe"
                  value={forgotData.confirmPassword}
                  onChange={(event) => handleForgotDataChange('confirmPassword', event.target.value)}
                />
              </>
            )}
          </Stack>
        </DialogContent>

        <DialogActions>
          <LoadingButton type="button" color="inherit" onClick={handleCloseForgotPassword}>
            Annuler
          </LoadingButton>
          <LoadingButton
            type="button"
            variant="contained"
            loading={forgotLoading}
            onClick={forgotStep === 'request' ? handleRequestPasswordReset : handleResetPassword}
          >
            {forgotStep === 'request' ? 'Recevoir le code' : 'Modifier'}
          </LoadingButton>
        </DialogActions>
      </Dialog>
    </>
  );
}
