import {
  BadgeRounded,
  ChurchRounded,
  GroupsRounded,
  StorageRounded,
  QrCode2Rounded,
  LanguageRounded,
  RocketLaunchRounded,
  SystemUpdateRounded,
} from '@mui/icons-material';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import CardHeader from '@mui/material/CardHeader';
import Typography from '@mui/material/Typography';
import CardContent from '@mui/material/CardContent';

import { DashboardContent } from 'src/layouts/dashboard';

type GuideStep = {
  title: string;
  description: string;
};

type GuideSection = {
  icon: React.ReactNode;
  emoji: string;
  title: string;
  subheader: string;
  steps: GuideStep[];
};

const guideSections: GuideSection[] = [
  {
    icon: <RocketLaunchRounded color="primary" />,
    emoji: '🚀',
    title: 'Juste après la création du compte',
    subheader: 'La toute première chose à faire, avant même de penser aux membres.',
    steps: [
      {
        title: 'Se connecter avec le compte administrateur',
        description: 'Utilisez le compte créé lors de l’installation (voir la fiche « Premier démarrage » ci-dessous si ce n’est pas encore fait).',
      },
      {
        title: 'Aller directement dans Paramètres',
        description: 'Ne commencez pas par ajouter des membres : allez d’abord dans Paramètres pour configurer l’église.',
      },
      {
        title: 'Ouvrir dans le navigateur',
        description: 'Depuis Paramètres, cliquez sur « Ouvrir dans le navigateur ». C’est ce que nous conseillons au client : les boutons et options y sont plus visibles et plus faciles à repérer que dans la fenêtre de l’application.',
      },
    ],
  },
  {
    icon: <ChurchRounded color="primary" />,
    emoji: '⛪',
    title: 'Configurer l’église',
    subheader: 'Dans Paramètres, section « Informations de l’église ».',
    steps: [
      {
        title: 'Renseigner les informations de l’église',
        description: 'Nom, coordonnées, pasteurs, etc.',
      },
      {
        title: 'Ajouter le logo de l’église',
        description: 'Il apparaît ensuite sur les documents imprimés et les fiches membres.',
      },
    ],
  },
  {
    icon: <BadgeRounded color="primary" />,
    emoji: '🧩',
    title: 'Préparer les listes avant d’ajouter un membre',
    subheader: 'À faire une seule fois par l’administrateur : ces listes remplissent ensuite les menus déroulants lors de l’enregistrement d’un membre.',
    steps: [
      {
        title: 'Responsabilités 🎖️',
        description: 'Exemple : Diacre, Vigile, etc. Ces libellés apparaîtront dans le menu déroulant « Responsabilité » de la fiche membre.',
      },
      {
        title: 'Cellules 🏠',
        description: 'Utile lors de l’enregistrement d’un membre, pour lui rattacher sa cellule.',
      },
      {
        title: 'Départements 🏢',
        description: 'Utile lors de l’enregistrement d’un membre, pour lui rattacher son département.',
      },
      {
        title: 'Groupes 👥',
        description: 'Utile lors de l’enregistrement d’un membre, pour lui rattacher son groupe.',
      },
      {
        title: 'Famille de jeunesse 🧑‍🤝‍🧑',
        description: 'Utile lors de l’enregistrement d’un membre, pour lui rattacher sa famille de jeunesse.',
      },
    ],
  },
  {
    icon: <GroupsRounded color="primary" />,
    emoji: '👤',
    title: 'Ajouter les membres',
    subheader: 'Une fois l’église et les listes ci-dessus configurées, on peut commencer à ajouter les membres.',
    steps: [
      {
        title: 'Ajout manuel',
        description: 'Depuis Membre > Ajouter membre, remplissez la fiche complète (identité, contact, vie spirituelle, rattachements).',
      },
      {
        title: 'Import Excel',
        description: 'Depuis Membre > Importer membre, chargez un fichier Excel pour ajouter plusieurs membres en une fois. Les doublons (même nom et téléphone) sont automatiquement ignorés.',
      },
      {
        title: 'Auto-inscription par QR code 📱',
        description: 'Depuis Membre > QR code, affichez ou imprimez le code (bouton Imprimer/PDF en haut de la fenêtre). Le futur membre le scanne avec son téléphone, remplit sa fiche, puis l’envoie pour validation. Les demandes en attente apparaissent en haut de la page Membre : un responsable les valide (le membre est alors ajouté) ou les rejette. Le téléphone doit être connecté au même réseau Wi-Fi que le poste principal.',
      },
    ],
  },
  {
    icon: <LanguageRounded color="primary" />,
    emoji: '🌐',
    title: 'Réseau et partage',
    subheader: 'Utiliser l’application depuis plusieurs postes.',
    steps: [
      {
        title: 'Accès en réseau local',
        description: 'L’adresse réseau affichée dans Paramètres permet à n’importe quel navigateur connecté au même Wi-Fi d’accéder à l’application (utile pour un accueil, un secrétariat, etc.).',
      },
      {
        title: 'Tunnel par Internet',
        description: 'Le tunnel active un lien public temporaire pour tester l’application depuis l’extérieur du réseau local. À réserver à des tests ponctuels : le lien change à chaque activation.',
      },
    ],
  },
  {
    icon: <StorageRounded color="primary" />,
    emoji: '💾',
    title: 'Sauvegardes',
    subheader: 'Protéger les données de l’église.',
    steps: [
      {
        title: 'Sauvegarde automatique',
        description: 'Une sauvegarde de la base de données est créée automatiquement chaque jour.',
      },
      {
        title: 'Restauration',
        description: 'En cas de besoin, restaurez une sauvegarde depuis Paramètres. Attention : cela remplace les données locales actuelles. Redémarrez l’application juste après pour recharger correctement les données.',
      },
    ],
  },
  {
    icon: <SystemUpdateRounded color="primary" />,
    emoji: '🔄',
    title: 'Mises à jour',
    subheader: 'Garder l’application à jour.',
    steps: [
      {
        title: 'Lancer une mise à jour',
        description: 'Quand une mise à jour est disponible, lancez-la depuis la section Mises à jour de Paramètres.',
      },
    ],
  },
];

export function GuideView() {
  return (
    <DashboardContent>
      <Stack spacing={0.5} sx={{ mb: { xs: 3, md: 5 } }}>
        <Typography variant="h4">📖 Guide d’utilisation</Typography>
        <Typography color="text.secondary">
          L’essentiel à garder sous la main pour installer et utiliser l’application au quotidien, dans le bon ordre.
        </Typography>
      </Stack>

      <Stack spacing={2.5}>
        {guideSections.map((section) => (
          <Card key={section.title}>
            <CardHeader
              avatar={section.icon}
              title={`${section.emoji} ${section.title}`}
              subheader={section.subheader}
            />
            <CardContent>
              <Stack spacing={2}>
                {section.steps.map((step, index) => (
                  <Stack key={step.title} direction="row" spacing={1.5} alignItems="flex-start">
                    <Chip size="small" label={index + 1} color="primary" sx={{ mt: 0.25 }} />
                    <Stack spacing={0.25}>
                      <Typography variant="subtitle2">{step.title}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {step.description}
                      </Typography>
                    </Stack>
                  </Stack>
                ))}
              </Stack>
            </CardContent>
          </Card>
        ))}

        <Card>
          <CardHeader
            avatar={<QrCode2Rounded color="primary" />}
            title="📌 À retenir"
            subheader="Rappels rapides pour l’auto-inscription par QR code."
          />
          <CardContent>
            <Stack spacing={1}>
              <Typography variant="body2" color="text.secondary">
                ✅ Le QR code contient un lien propre à l’église connectée : ne le partagez pas entre deux églises différentes.
              </Typography>
              <Typography variant="body2" color="text.secondary">
                ✅ Une demande déjà en attente ou déjà validée pour le même nom et téléphone est automatiquement bloquée pour éviter les doublons.
              </Typography>
              <Typography variant="body2" color="text.secondary">
                ✅ Pensez à valider ou rejeter régulièrement les demandes en attente depuis la page Membre.
              </Typography>
            </Stack>
          </CardContent>
        </Card>
      </Stack>
    </DashboardContent>
  );
}
