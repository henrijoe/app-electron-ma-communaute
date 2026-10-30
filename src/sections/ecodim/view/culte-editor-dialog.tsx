import { useRef, useMemo, useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Grid from '@mui/material/Unstable_Grid2';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Divider from '@mui/material/Divider';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import ListItemButton from '@mui/material/ListItemButton';
import DialogContent from '@mui/material/DialogContent';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import { AddRounded, CloseRounded, DeleteRounded, DoneAllRounded } from '@mui/icons-material';

import { apiClient, getApiErrorMessage } from 'src/utils/apiClient';
import { SelectRecherche } from 'src/components/select-recherche';

import { FONCTIONS_MONITEUR } from '../constantes';

// ----------------------------------------------------------------------
// Cahier de texte d'un culte de l'école du dimanche.
//
// Chaque dimanche, une classe réunit un dirigeant et un enseignant — souvent deux
// moniteurs, parfois le même pour les deux rôles. Le cahier est tenu à la main dans
// la classe, puis saisi ici par le secrétariat.
//
// La saisie reprend la forme d'un rapport : le plan à gauche, les sections à droite.
// Une page unique obligerait à faire défiler sans repère, alors que le cahier papier
// se lit section par section.

const MINIMUM_SUJETS = 3;
const MINIMUM_CHANTS = 3;

const SECTIONS = [
  { cle: 'general', titre: 'INFORMATIONS GÉNÉRALES' },
  { cle: 'direction', titre: 'DIRECTION DU CULTE' },
  { cle: 'enseignement', titre: 'ENSEIGNEMENT' },
  // L'appel précède le bilan : c'est lui qui en fournit les effectifs.
  { cle: 'appel', titre: 'APPEL' },
  { cle: 'bilan', titre: 'OFFRANDE ET PRÉSENCES' },
  { cle: 'signatures', titre: 'SIGNATURES' },
] as const;

/** Statuts d'appel. La valeur stockée est sans accent, comme ailleurs. */
const STATUTS_APPEL = [
  { valeur: 'present', libelle: 'Présent', couleur: 'success' as const },
  { valeur: 'absent', libelle: 'Absent', couleur: 'error' as const },
  { valeur: 'deplacement', libelle: 'Déplacement', couleur: 'warning' as const },
];

type CleSection = (typeof SECTIONS)[number]['cle'];

type CulteEditorDialogProps = {
  ouvert: boolean;
  /** Culte existant à modifier, ou null pour une nouvelle saisie. */
  culte: any | null;
  classes: any[];
  moniteurs: any[];
  /** Pour l'appel : les enfants rattachés à la classe de la séance. */
  enfants: any[];
  /** Appels déjà enregistrés, toutes séances confondues. */
  presences: any[];
  idUtilisateur: number;
  onClose: () => void;
  onEnregistre: () => void | Promise<void>;
  showNotification: (message: string, severite?: 'success' | 'info' | 'warning' | 'error') => void;
};

const nomMoniteur = (moniteur: any): string =>
  `${moniteur?.nomMembre || ''} ${moniteur?.prenomMembre || ''}`.trim();

/** Les listes sont stockées à raison d'une entrée par ligne. */
const versLignes = (valeur?: string | null): string[] => {
  const lignes = String(valeur || '')
    .split('\n')
    .map((ligne) => ligne.trim())
    .filter(Boolean);

  return lignes.length ? lignes : [''];
};

const completer = (lignes: string[], minimum: number): string[] =>
  lignes.length >= minimum ? lignes : [...lignes, ...Array(minimum - lignes.length).fill('')];

const formulaireVide = {
  idCulteEcodim: null as number | null,
  dateCulte: '',
  idClasseEcodim: '',
  idMoniteurDirigeant: '',
  nomDirigeantExterne: '',
  idMoniteurEnseignant: '',
  nomEnseignantExterne: '',
  leconDuJour: '',
  passageBiblique: '',
  resumePredication: '',
  versetOr: '',
  montantOffrande: '',
  nombreFilles: '',
  nombreGarcons: '',
  nomSignatureEnseignant: '',
  nomSignatureResponsable: '',
  nomSignatureDirection: '',
  observationsCulte: '',
};

/**
 * Un bloc du cahier. Défini ici et non dans le corps du composant : une fonction
 * composant recréée à chaque rendu fait remonter tout son sous-arbre par React, et
 * le champ en cours de saisie perdrait le focus à chaque caractère tapé.
 */
const Section = ({
  cle,
  titre,
  references,
  children,
}: {
  cle: CleSection;
  titre: string;
  references: React.MutableRefObject<Record<string, HTMLDivElement | null>>;
  children: React.ReactNode;
}) => (
  <Box
    ref={(element: HTMLDivElement | null) => {
      // eslint-disable-next-line no-param-reassign
      references.current[cle] = element;
    }}
    sx={{ bgcolor: 'background.neutral', borderRadius: 2, p: 2.5, mb: 2.5 }}
  >
    <Typography variant="subtitle2" sx={{ letterSpacing: 0.5, mb: 2 }}>
      {titre}
    </Typography>
    {children}
  </Box>
);

/** Liste de lignes libres : sujets de prière, chants. */
const ListeLignes = ({
  libelle,
  liste,
  poser,
  minimum,
  exemple,
  onRetraitRefuse,
}: {
  libelle: string;
  liste: string[];
  poser: (valeur: string[]) => void;
  minimum: number;
  exemple: string;
  onRetraitRefuse: (minimum: number) => void;
}) => {
  const modifier = (index: number, valeur: string) => {
    const copie = [...liste];
    copie[index] = valeur;
    poser(copie);
  };

  const retirer = (index: number) => {
    if (liste.length <= minimum) {
      onRetraitRefuse(minimum);
      return;
    }

    poser(liste.filter((_, position) => position !== index));
  };

  return (
    <Box sx={{ mb: 2 }}>
      <Typography variant="caption" color="text.secondary">
        {libelle} — {minimum} au minimum
      </Typography>

      <Stack spacing={1} sx={{ mt: 1 }}>
        {liste.map((valeur, index) => (
          // eslint-disable-next-line react/no-array-index-key
          <Stack key={`${libelle}-${index}`} direction="row" spacing={1} alignItems="center">
            <TextField
              size="small"
              fullWidth
              placeholder={`${exemple} ${index + 1}`}
              value={valeur}
              onChange={(event) => modifier(index, event.target.value)}
            />
            <IconButton size="small" color="error" onClick={() => retirer(index)}>
              <DeleteRounded fontSize="small" />
            </IconButton>
          </Stack>
        ))}
      </Stack>

      <Button
        size="small"
        startIcon={<AddRounded />}
        onClick={() => poser([...liste, ''])}
        sx={{ mt: 1 }}
      >
        Ajouter une ligne
      </Button>
    </Box>
  );
};

export function CulteEditorDialog({
  ouvert,
  culte,
  classes,
  moniteurs,
  enfants,
  presences,
  idUtilisateur,
  onClose,
  onEnregistre,
  showNotification,
}: CulteEditorDialogProps) {
  const [formulaire, setFormulaire] = useState<any>(formulaireVide);
  /** Appel de la séance : statut par enfant. Vide = enfant non appelé. */
  const [appel, setAppel] = useState<Record<number, string>>({});
  const [sujets, setSujets] = useState<string[]>(Array(MINIMUM_SUJETS).fill(''));
  const [chants, setChants] = useState<string[]>(Array(MINIMUM_CHANTS).fill(''));
  const [sectionActive, setSectionActive] = useState<CleSection>('general');
  const [enregistrement, setEnregistrement] = useState(false);

  const conteneur = useRef<HTMLDivElement>(null);
  const referencesSections = useRef<Record<string, HTMLDivElement | null>>({});

  // Remise à l'état d'origine à chaque ouverture : rouvrir le formulaire avec la
  // saisie précédente ferait enregistrer un culte sur les données d'un autre.
  useEffect(() => {
    if (!ouvert) {
      return;
    }

    if (culte) {
      setFormulaire({
        ...formulaireVide,
        ...culte,
        idClasseEcodim: culte.idClasseEcodim ? String(culte.idClasseEcodim) : '',
        idMoniteurDirigeant: culte.idMoniteurDirigeant ? String(culte.idMoniteurDirigeant) : '',
        idMoniteurEnseignant: culte.idMoniteurEnseignant
          ? String(culte.idMoniteurEnseignant)
          : '',
        montantOffrande: culte.montantOffrande ? String(culte.montantOffrande) : '',
        nombreFilles: culte.nombreFilles ? String(culte.nombreFilles) : '',
        nombreGarcons: culte.nombreGarcons ? String(culte.nombreGarcons) : '',
      });
      setSujets(completer(versLignes(culte.sujetsPriere), MINIMUM_SUJETS));
      setChants(completer(versLignes(culte.chantsCulte), MINIMUM_CHANTS));

      // Appel déjà enregistré pour cette séance, s'il y en a un.
      const dejaFait: Record<number, string> = {};
      presences
        .filter((presence) => Number(presence.idCulteEcodim) === Number(culte.idCulteEcodim))
        .forEach((presence) => {
          dejaFait[Number(presence.idEnfantEcodim)] = String(presence.statutPresence || '');
        });
      setAppel(dejaFait);
    } else {
      // Un culte se saisit après coup : la date du jour est le point de départ le
      // plus proche de la réalité.
      setFormulaire({ ...formulaireVide, dateCulte: new Date().toISOString().slice(0, 10) });
      setSujets(Array(MINIMUM_SUJETS).fill(''));
      setChants(Array(MINIMUM_CHANTS).fill(''));
      setAppel({});
    }

    setSectionActive('general');
    // `presences` n'est pas une dépendance : l'appel se recharge à l'ouverture,
    // pas à chaque rafraîchissement de la liste, sous peine d'écraser la saisie
    // en cours par ce qui est encore en base.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ouvert, culte]);

  /** Enfants de la classe choisie, pour l'appel. */
  const enfantsDeLaClasse = useMemo(
    () =>
      enfants
        .filter(
          (enfant) =>
            String(enfant.idClasseEcodim || '') === String(formulaire.idClasseEcodim) &&
            enfant.actifEnfant !== 0
        )
        .sort((a, b) =>
          `${a.nomEnfant || ''} ${a.prenomEnfant || ''}`.localeCompare(
            `${b.nomEnfant || ''} ${b.prenomEnfant || ''}`,
            'fr'
          )
        ),
    [enfants, formulaire.idClasseEcodim]
  );

  const compterAppel = (statut: string) =>
    enfantsDeLaClasse.filter((enfant) => appel[Number(enfant.idEnfantEcodim)] === statut).length;

  /** Moniteurs rattachés à la classe choisie ; tous tant qu'aucune n'est choisie. */
  const moniteursProposes = useMemo(() => {
    if (!formulaire.idClasseEcodim) {
      return moniteurs;
    }

    const dansLaClasse = moniteurs.filter(
      (moniteur) => String(moniteur.idClasseEcodim) === String(formulaire.idClasseEcodim)
    );

    // Une classe sans moniteur affecté ne doit pas bloquer la saisie.
    return dansLaClasse.length ? dansLaClasse : moniteurs;
  }, [moniteurs, formulaire.idClasseEcodim]);

  const totalEnfants =
    (Number(formulaire.nombreFilles) || 0) + (Number(formulaire.nombreGarcons) || 0);

  /**
   * Noms proposés pour les signatures : l'enseignant du jour, le responsable de la
   * classe et la direction de l'école. Ils sont pré-remplis mais restent modifiables,
   * puis stockés tels quels — le cahier est un document d'archive, il doit garder le
   * nom de qui a signé même si les fonctions changent l'année suivante.
   */
  useEffect(() => {
    const enseignant = moniteurs.find(
      (moniteur) => String(moniteur.idMoniteur) === String(formulaire.idMoniteurEnseignant)
    );

    const responsable = moniteurs.find(
      (moniteur) =>
        String(moniteur.idClasseEcodim) === String(formulaire.idClasseEcodim) &&
        Number(moniteur.estPrincipal) === 1
    );

    const direction = moniteurs.find((moniteur) =>
      ['Directeur', 'Directrice'].includes(String(moniteur.fonctionMoniteur || ''))
    );

    setFormulaire((precedent: any) => ({
      ...precedent,
      nomSignatureEnseignant:
        precedent.nomSignatureEnseignant ||
        nomMoniteur(enseignant) ||
        String(precedent.nomEnseignantExterne || '').trim(),
      nomSignatureResponsable: precedent.nomSignatureResponsable || nomMoniteur(responsable),
      nomSignatureDirection: precedent.nomSignatureDirection || nomMoniteur(direction),
    }));
  }, [
    moniteurs,
    formulaire.idMoniteurEnseignant,
    formulaire.nomEnseignantExterne,
    formulaire.idClasseEcodim,
  ]);

  const allerVers = useCallback((cle: CleSection) => {
    setSectionActive(cle);
    referencesSections.current[cle]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  const refuserRetrait = useCallback(
    (minimum: number) => showNotification(`Il faut au moins ${minimum} lignes.`, 'warning'),
    [showNotification]
  );

  const enregistrer = async () => {
    const sujetsRetenus = sujets.map((sujet) => sujet.trim()).filter(Boolean);
    const chantsRetenus = chants.map((chant) => chant.trim()).filter(Boolean);

    if (!formulaire.dateCulte) {
      showNotification('La date du culte est requise.', 'warning');
      allerVers('general');
      return;
    }

    if (!formulaire.idClasseEcodim) {
      showNotification('Choisissez la classe concernée.', 'warning');
      allerVers('general');
      return;
    }

    if (sujetsRetenus.length < MINIMUM_SUJETS) {
      showNotification(`Notez au moins ${MINIMUM_SUJETS} sujets de prière.`, 'warning');
      allerVers('direction');
      return;
    }

    if (chantsRetenus.length < MINIMUM_CHANTS) {
      showNotification(`Notez au moins ${MINIMUM_CHANTS} chants.`, 'warning');
      allerVers('direction');
      return;
    }

    try {
      setEnregistrement(true);

      const charge = {
        ...formulaire,
        idClasseEcodim: formulaire.idClasseEcodim ? Number(formulaire.idClasseEcodim) : null,
        idMoniteurDirigeant: formulaire.idMoniteurDirigeant
          ? Number(formulaire.idMoniteurDirigeant)
          : null,
        idMoniteurEnseignant: formulaire.idMoniteurEnseignant
          ? Number(formulaire.idMoniteurEnseignant)
          : null,
        sujetsPriere: sujetsRetenus.join('\n'),
        chantsCulte: chantsRetenus.join('\n'),
        montantOffrande: Number(formulaire.montantOffrande) || 0,
        nombreFilles: Number(formulaire.nombreFilles) || 0,
        nombreGarcons: Number(formulaire.nombreGarcons) || 0,
        idUtilisateur,
      };

      let idCulteEcodim = Number(formulaire.idCulteEcodim) || 0;

      if (idCulteEcodim) {
        await apiClient.updateCulteEcodim(charge);
        showNotification('Culte modifié.', 'success');
      } else {
        const creation: any = await apiClient.createCulteEcodim(charge);
        idCulteEcodim = Number(creation?.data) || 0;
        showNotification('Culte enregistré.', 'success');
      }

      // L'appel suit la séance : il lui est rattaché, et une séance nouvelle
      // n'a d'identifiant qu'une fois créée. Un appel vide n'est pas envoyé —
      // ce serait effacer celui d'une séance qu'on vient seulement de relire.
      const lignesAppel = enfantsDeLaClasse
        .map((enfant) => ({
          idEnfantEcodim: Number(enfant.idEnfantEcodim),
          statutPresence: appel[Number(enfant.idEnfantEcodim)] || '',
        }))
        .filter((ligne) => ligne.statutPresence !== '');

      if (idCulteEcodim && lignesAppel.length) {
        await apiClient.enregistrerAppelEcodim({
          idUtilisateur,
          idCulteEcodim,
          presences: lignesAppel,
        });
      }

      await onEnregistre();
      onClose();
    } catch (error) {
      showNotification(getApiErrorMessage(error, 'Enregistrement impossible.'), 'error');
    } finally {
      setEnregistrement(false);
    }
  };

  return (
    <Dialog open={ouvert} onClose={onClose} fullScreen>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 3,
          py: 2,
          borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
        }}
      >
        <Box>
          <Typography variant="h6">
            {formulaire.idCulteEcodim ? 'Modifier le culte' : 'Nouveau culte'}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Cahier de texte de l&apos;école du dimanche
          </Typography>
        </Box>

        <Stack direction="row" spacing={1} alignItems="center">
          <Button variant="contained" onClick={enregistrer} disabled={enregistrement}>
            {enregistrement ? 'Enregistrement...' : 'Valider'}
          </Button>
          <IconButton onClick={onClose}>
            <CloseRounded />
          </IconButton>
        </Stack>
      </Box>

      <DialogContent sx={{ display: 'flex', p: 0, overflow: 'hidden' }}>
        {/* ------------------------------------------------------- plan à gauche */}
        <Box
          sx={{
            width: 260,
            flexShrink: 0,
            borderRight: (theme) => `1px solid ${theme.palette.divider}`,
            overflowY: 'auto',
            display: { xs: 'none', md: 'block' },
            py: 2,
          }}
        >
          <Typography variant="overline" color="text.secondary" sx={{ px: 2 }}>
            Plan du culte
          </Typography>

          {SECTIONS.map((section) => (
            <ListItemButton
              key={section.cle}
              selected={sectionActive === section.cle}
              onClick={() => allerVers(section.cle)}
              sx={{ px: 2, py: 1.2 }}
            >
              <Typography variant="body2">{section.titre}</Typography>
            </ListItemButton>
          ))}
        </Box>

        {/* ----------------------------------------------------- sections à droite */}
        <Box ref={conteneur} sx={{ flex: 1, overflowY: 'auto', p: 3 }}>
          <Section cle="general" titre="INFORMATIONS GÉNÉRALES" references={referencesSections}>
            <Grid container spacing={2}>
              <Grid xs={12} md={6}>
                <TextField
                  label="Date du culte *"
                  type="date"
                  value={formulaire.dateCulte || ''}
                  onChange={(event) =>
                    setFormulaire({ ...formulaire, dateCulte: event.target.value })
                  }
                  InputLabelProps={{ shrink: true }}
                  fullWidth
                />
              </Grid>
              <Grid xs={12} md={6}>
                <SelectRecherche
                  label="Classe *"
                  value={formulaire.idClasseEcodim}
                  onChange={(event) =>
                    setFormulaire({ ...formulaire, idClasseEcodim: event.target.value })
                  }
                  fullWidth
                >
                  {classes.map((classe) => (
                    <MenuItem key={classe.idClasseEcodim} value={String(classe.idClasseEcodim)}>
                      {classe.libelleClasse}
                    </MenuItem>
                  ))}
                </SelectRecherche>
              </Grid>
            </Grid>
          </Section>

          <Section cle="direction" titre="DIRECTION DU CULTE" references={referencesSections}>
            <Grid container spacing={2} sx={{ mb: 2 }}>
              <Grid xs={12} md={6}>
                <SelectRecherche
                  label="Moniteur dirigeant"
                  value={formulaire.idMoniteurDirigeant}
                  onChange={(event) =>
                    setFormulaire({
                      ...formulaire,
                      idMoniteurDirigeant: event.target.value,
                      // Les deux champs s'excluent : choisir un moniteur efface le
                      // nom libre, et inversement. Sans cela, on ne saurait plus qui
                      // a dirigé.
                      nomDirigeantExterne: event.target.value
                        ? ''
                        : formulaire.nomDirigeantExterne,
                    })
                  }
                  fullWidth
                >
                  <MenuItem value="">Non précisé</MenuItem>
                  {moniteursProposes.map((moniteur) => (
                    <MenuItem key={moniteur.idMoniteur} value={String(moniteur.idMoniteur)}>
                      {nomMoniteur(moniteur)}
                      {moniteur.fonctionMoniteur
                        ? ` — ${FONCTIONS_MONITEUR[moniteur.fonctionMoniteur]}`
                        : ''}
                    </MenuItem>
                  ))}
                </SelectRecherche>
              </Grid>
              <Grid xs={12} md={6}>
                <TextField
                  label="Ou une autre personne"
                  placeholder="Nom d'un invité, d'un parent, d'un pasteur..."
                  helperText="Pour quelqu'un qui n'est pas moniteur"
                  value={formulaire.nomDirigeantExterne || ''}
                  onChange={(event) =>
                    setFormulaire({
                      ...formulaire,
                      nomDirigeantExterne: event.target.value,
                      idMoniteurDirigeant: event.target.value
                        ? ''
                        : formulaire.idMoniteurDirigeant,
                    })
                  }
                  fullWidth
                />
              </Grid>
            </Grid>

            <ListeLignes
              libelle="Sujets de prière"
              liste={sujets}
              poser={setSujets}
              minimum={MINIMUM_SUJETS}
              exemple="Sujet"
              onRetraitRefuse={refuserRetrait}
            />

            <Divider sx={{ my: 2 }} />

            <ListeLignes
              libelle="Chants (titres seulement)"
              liste={chants}
              poser={setChants}
              minimum={MINIMUM_CHANTS}
              exemple="Chant"
              onRetraitRefuse={refuserRetrait}
            />
          </Section>

          <Section cle="enseignement" titre="ENSEIGNEMENT" references={referencesSections}>
            <Grid container spacing={2}>
              <Grid xs={12} md={6}>
                <SelectRecherche
                  label="Moniteur enseignant"
                  value={formulaire.idMoniteurEnseignant}
                  onChange={(event) =>
                    setFormulaire({
                      ...formulaire,
                      idMoniteurEnseignant: event.target.value,
                      nomEnseignantExterne: event.target.value
                        ? ''
                        : formulaire.nomEnseignantExterne,
                    })
                  }
                  fullWidth
                >
                  <MenuItem value="">Non précisé</MenuItem>
                  {moniteursProposes.map((moniteur) => (
                    <MenuItem key={moniteur.idMoniteur} value={String(moniteur.idMoniteur)}>
                      {nomMoniteur(moniteur)}
                    </MenuItem>
                  ))}
                </SelectRecherche>
              </Grid>
              <Grid xs={12} md={6}>
                <TextField
                  label="Ou une autre personne"
                  placeholder="Nom d'un invité, d'un parent, d'un pasteur..."
                  helperText="Pour quelqu'un qui n'est pas moniteur"
                  value={formulaire.nomEnseignantExterne || ''}
                  onChange={(event) =>
                    setFormulaire({
                      ...formulaire,
                      nomEnseignantExterne: event.target.value,
                      idMoniteurEnseignant: event.target.value
                        ? ''
                        : formulaire.idMoniteurEnseignant,
                    })
                  }
                  fullWidth
                />
              </Grid>
              <Grid xs={12} md={6}>
                <TextField
                  label="Leçon du jour"
                  value={formulaire.leconDuJour}
                  onChange={(event) =>
                    setFormulaire({ ...formulaire, leconDuJour: event.target.value })
                  }
                  fullWidth
                />
              </Grid>
              <Grid xs={12}>
                <TextField
                  label="Passage biblique"
                  placeholder="Ex : Jean 3.16 à 21"
                  value={formulaire.passageBiblique}
                  onChange={(event) =>
                    setFormulaire({ ...formulaire, passageBiblique: event.target.value })
                  }
                  fullWidth
                />
              </Grid>
              <Grid xs={12}>
                <TextField
                  label="Résumé de la prédication"
                  value={formulaire.resumePredication}
                  onChange={(event) =>
                    setFormulaire({ ...formulaire, resumePredication: event.target.value })
                  }
                  multiline
                  minRows={4}
                  fullWidth
                />
              </Grid>
              <Grid xs={12}>
                <TextField
                  label="Verset d'or (facultatif)"
                  value={formulaire.versetOr}
                  onChange={(event) => setFormulaire({ ...formulaire, versetOr: event.target.value })}
                  multiline
                  minRows={2}
                  fullWidth
                />
              </Grid>
            </Grid>
          </Section>

          <Section cle="appel" titre="APPEL" references={referencesSections}>
            {!formulaire.idClasseEcodim ? (
              <Alert severity="info">
                Choisis d&apos;abord la classe : l&apos;appel porte sur ses enfants.
              </Alert>
            ) : (
              <>
                <Stack
                  direction={{ xs: 'column', sm: 'row' }}
                  spacing={1.5}
                  alignItems={{ xs: 'stretch', sm: 'center' }}
                  sx={{ mb: 2 }}
                >
                  <Button
                    variant="outlined"
                    startIcon={<DoneAllRounded />}
                    onClick={() =>
                      setAppel(
                        Object.fromEntries(
                          enfantsDeLaClasse.map((enfant) => [
                            Number(enfant.idEnfantEcodim),
                            'present',
                          ])
                        )
                      )
                    }
                  >
                    Tout présent
                  </Button>

                  <Box sx={{ flex: 1 }} />

                  <Typography variant="body2" color="text.secondary">
                    {compterAppel('present')} présent(s) · {compterAppel('absent')} absent(s) ·{' '}
                    {compterAppel('deplacement')} en déplacement
                  </Typography>
                </Stack>

                {!enfantsDeLaClasse.length ? (
                  <Alert severity="warning">Aucun enfant actif dans cette classe.</Alert>
                ) : (
                  <Stack spacing={1}>
                    {enfantsDeLaClasse.map((enfant) => (
                      <Stack
                        key={enfant.idEnfantEcodim}
                        direction="row"
                        spacing={1}
                        alignItems="center"
                        sx={{ flexWrap: 'wrap' }}
                      >
                        <Typography sx={{ flex: 1, minWidth: 180 }}>
                          {`${enfant.nomEnfant || ''} ${enfant.prenomEnfant || ''}`.trim()}
                        </Typography>

                        <ToggleButtonGroup
                          exclusive
                          size="small"
                          value={appel[Number(enfant.idEnfantEcodim)] || ''}
                          onChange={(_, valeur) =>
                            setAppel((precedent) => ({
                              ...precedent,
                              // Recliquer sur le statut déjà choisi le retire :
                              // c'est le seul moyen de revenir à « non appelé ».
                              [Number(enfant.idEnfantEcodim)]: valeur || '',
                            }))
                          }
                        >
                          {STATUTS_APPEL.map((statut) => (
                            <ToggleButton
                              key={statut.valeur}
                              value={statut.valeur}
                              color={statut.couleur}
                            >
                              {statut.libelle}
                            </ToggleButton>
                          ))}
                        </ToggleButtonGroup>
                      </Stack>
                    ))}
                  </Stack>
                )}

                <Alert severity="info" sx={{ mt: 2 }}>
                  Un enfant laissé sans réponse n&apos;a pas été appelé : sa fiche de suivi
                  restera vide pour ce dimanche, ce qui n&apos;est pas une absence. Les
                  effectifs filles et garçons ci-dessous se recalculent d&apos;après cet
                  appel.
                </Alert>
              </>
            )}
          </Section>

          <Section cle="bilan" titre="OFFRANDE ET PRÉSENCES" references={referencesSections}>
            <Grid container spacing={2}>
              <Grid xs={12} md={3}>
                <TextField
                  label="Offrande"
                  type="number"
                  value={formulaire.montantOffrande}
                  onChange={(event) =>
                    setFormulaire({ ...formulaire, montantOffrande: event.target.value })
                  }
                  fullWidth
                />
              </Grid>
              <Grid xs={6} md={3}>
                <TextField
                  label="Filles"
                  type="number"
                  value={formulaire.nombreFilles}
                  onChange={(event) =>
                    setFormulaire({ ...formulaire, nombreFilles: event.target.value })
                  }
                  fullWidth
                />
              </Grid>
              <Grid xs={6} md={3}>
                <TextField
                  label="Garçons"
                  type="number"
                  value={formulaire.nombreGarcons}
                  onChange={(event) =>
                    setFormulaire({ ...formulaire, nombreGarcons: event.target.value })
                  }
                  fullWidth
                />
              </Grid>
              <Grid xs={6} md={3}>
                {/* Le total se calcule : saisi à part, il finirait par contredire les
                    deux nombres qui le composent. */}
                <TextField
                  label="Total"
                  value={totalEnfants}
                  InputProps={{ readOnly: true }}
                  fullWidth
                />
              </Grid>
              <Grid xs={12}>
                <TextField
                  label="Observations (facultatif)"
                  value={formulaire.observationsCulte}
                  onChange={(event) =>
                    setFormulaire({ ...formulaire, observationsCulte: event.target.value })
                  }
                  multiline
                  minRows={2}
                  fullWidth
                />
              </Grid>
            </Grid>
          </Section>

          <Section cle="signatures" titre="SIGNATURES" references={referencesSections}>
            <Alert severity="info" sx={{ mb: 2 }}>
              Les noms sont proposés d&apos;après la classe et les fonctions enregistrées. Ils
              restent modifiables, et c&apos;est le nom saisi qui est conservé.
            </Alert>

            <Grid container spacing={2}>
              <Grid xs={12} md={4}>
                <TextField
                  label="L'enseignant"
                  value={formulaire.nomSignatureEnseignant}
                  onChange={(event) =>
                    setFormulaire({ ...formulaire, nomSignatureEnseignant: event.target.value })
                  }
                  fullWidth
                />
              </Grid>
              <Grid xs={12} md={4}>
                <TextField
                  label="Le responsable de la classe"
                  value={formulaire.nomSignatureResponsable}
                  onChange={(event) =>
                    setFormulaire({ ...formulaire, nomSignatureResponsable: event.target.value })
                  }
                  fullWidth
                />
              </Grid>
              <Grid xs={12} md={4}>
                <TextField
                  label="La direction"
                  value={formulaire.nomSignatureDirection}
                  onChange={(event) =>
                    setFormulaire({ ...formulaire, nomSignatureDirection: event.target.value })
                  }
                  fullWidth
                />
              </Grid>
            </Grid>
          </Section>
        </Box>
      </DialogContent>
    </Dialog>
  );
}
