import {
  _id,
  _price,
  _times,
  _company,
  _boolean,
  _fullName,
  _taskNames,
  _postTitles,
  _description,
  _productNames,
} from './_mock';

// ----------------------------------------------------------------------

export const _myAccount = {
  displayName: 'Henri Joel',
  email: 'diokrihenrijoel@gmail.com',
  photoURL: '/assets/images/avatar/avatar-25.webp',
};

// ----------------------------------------------------------------------

export const _users = [...Array(24)].map((_, index) => ({
  id: _id(index),
  name: _fullName(index),
  company: _company(index),
  isVerified: _boolean(index),
  avatarUrl: `/assets/images/avatar/avatar-${index + 1}.webp`,
  status: index % 4 ? 'active' : 'banned',
  role:
    [
      'Leader',
      'Hr Manager',
      'UI Designer',
      'UX Designer',
      'UI/UX Designer',
      'Project Manager',
      'Backend Developer',
      'Full Stack Designer',
      'Front End Developer',
      'Full Stack Developer',
    ][index] || 'UI Designer',
}));


export const _membres = [
  {
    idMembre: 1,
    nomMembre: 'Diokri',
    prenomMembre: 'Henri Joel',
    dateNaissMembre: '1988-10-10',
    lieuNaissMembre: 'Abidjan',
    sexeMembre: 'Masculin',
    emailMembre: 'email1@exemple.com',
    nationaliteMembre: 'Ivoirienne',
    fonctionMembre: 'Pasteur',
    contactMembre: '0102030401',
    ethnieMembre: 'Akan',
    residenceMembre: 'Andokoi',
    civiliteMembre: 'M.',
    nouvelleAmeMembre: 'Oui',
    dateConversionMembre: '2010-05-20',
    baptemeEauMembre: 'Oui',
    dateBaptemeMembre: '2012-07-15',
    dateMariageMembre: '2018-06-30',
    capaciteSpirituelleMembre: 'Prophétie',
    situationMatrimonialeMembre: 'Marié(e)',
    nomFiance: 'Fiancé 1',
    photoMembre: '/assets/images/avatar/avatar-1.webp',
    lieuBaptemeEauMembre: 'AD yop Gare',
    contactParentMembre: '0203040501',
    baptemeSaintEspritMembre: 'Oui',
    dateBaptemeSaintEspritMembre: '2015-08-22',
    egliseOrigineMembre: 'Église 1',
    nomPrenomParentMembre: 'Parent 1',
    lieuTravailMembre: 'Entreprise 1',
    nomAmiEglise: 'Ami 1',
    visiteMembre: 'Oui',
    heureVisiteMembre: '18:30',
    raisonNonVisiteMembre: '',
    dateDecisionMembre: '2019-09-10',
    idNiveauEtude: 1,
    idEglise: 1,
    idCellule: 1,
    idDepartement: 1,
    idGroupe: 1,
    idResponsabilite: 1,
    idDomaineActivite: 1,
    idUtilisateur: 1,
  },
  {
    idMembre: 2,
    nomMembre: 'Kouadio',
    prenomMembre: 'Marie Claire',
    dateNaissMembre: '1992-04-15',
    lieuNaissMembre: 'Yamoussoukro',
    sexeMembre: 'Féminin',
    emailMembre: 'email2@exemple.com',
    nationaliteMembre: 'Ivoirienne',
    fonctionMembre: 'Membre',
    contactMembre: '0102030402',
    ethnieMembre: 'Baoulé',
    residenceMembre: 'Zompleu',
    civiliteMembre: 'Mme',
    nouvelleAmeMembre: 'Oui',
    dateConversionMembre: '2015-02-10',
    baptemeEauMembre: 'Oui',
    dateBaptemeMembre: '2016-06-20',
    dateMariageMembre: null,
    capaciteSpirituelleMembre: 'Enseignement',
    situationMatrimonialeMembre: 'Célibataire',
    nomFiance: '',
    photoMembre: '/assets/images/avatar/avatar-2.webp',
    lieuBaptemeEauMembre: 'AD Nouveau quartier',
    contactParentMembre: '0203040502',
    baptemeSaintEspritMembre: 'Oui',
    dateBaptemeSaintEspritMembre: '2017-09-18',
    egliseOrigineMembre: 'Église 2',
    nomPrenomParentMembre: 'Parent 2',
    lieuTravailMembre: 'Entreprise 2',
    nomAmiEglise: 'Ami 2',
    visiteMembre: 'Oui',
    heureVisiteMembre: '19:00',
    raisonNonVisiteMembre: '',
    dateDecisionMembre: '2020-10-05',
    idNiveauEtude: 2,
    idEglise: 2,
    idCellule: 2,
    idDepartement: 2,
    idGroupe: 2,
    idResponsabilite: 2,
    idDomaineActivite: 2,
    idUtilisateur: 2,
  },
  {
    idMembre: 3,
    nomMembre: 'Aby',
    prenomMembre: 'Ange marie-noelle',
    dateNaissMembre: '1992-04-15',
    lieuNaissMembre: 'Yamoussoukro',
    sexeMembre: 'Féminin',
    emailMembre: 'email2@exemple.com',
    nationaliteMembre: 'Ivoirienne',
    fonctionMembre: 'Monitrice',
    contactMembre: '0102030402',
    ethnieMembre: 'Baoulé',
    residenceMembre: 'Fanny',
    civiliteMembre: 'Mme',
    nouvelleAmeMembre: 'Oui',
    dateConversionMembre: '2015-02-10',
    baptemeEauMembre: 'non',
    dateBaptemeMembre: '2016-06-20',
    dateMariageMembre: null,
    capaciteSpirituelleMembre: 'Enseignement',
    situationMatrimonialeMembre: 'Célibataire',
    nomFiance: '',
    photoMembre: '/assets/images/avatar/avatar-3.webp',
    lieuBaptemeEauMembre: 'AD Residentiel',
    contactParentMembre: '0203040502',
    baptemeSaintEspritMembre: 'Oui',
    dateBaptemeSaintEspritMembre: '2017-09-18',
    egliseOrigineMembre: 'Église 2',
    nomPrenomParentMembre: 'Parent 2',
    lieuTravailMembre: 'Entreprise 2',
    nomAmiEglise: 'Ami 2',
    visiteMembre: 'Oui',
    heureVisiteMembre: '19:00',
    raisonNonVisiteMembre: '',
    dateDecisionMembre: '2020-10-05',
    idNiveauEtude: 2,
    idEglise: 2,
    idCellule: 2,
    idDepartement: 2,
    idGroupe: 2,
    idResponsabilite: 2,
    idDomaineActivite: 2,
    idUtilisateur: 2,
  },
  {
    idMembre: 4,
    nomMembre: 'Ouattara',
    prenomMembre: 'Nabitou Cissé',
    dateNaissMembre: '1997-04-15',
    lieuNaissMembre: 'Yamoussoukro',
    sexeMembre: 'Féminin',
    emailMembre: 'email2@exemple.com',
    nationaliteMembre: 'Ivoirienne',
    fonctionMembre: 'Choriste',
    contactMembre: '0102030402',
    ethnieMembre: 'Baoulé',
    residenceMembre: 'Cité ADO',
    civiliteMembre: 'Mme',
    nouvelleAmeMembre: 'Oui',
    dateConversionMembre: '2015-02-10',
    baptemeEauMembre: 'Oui',
    dateBaptemeMembre: '2016-06-20',
    dateMariageMembre: null,
    capaciteSpirituelleMembre: 'Enseignement',
    situationMatrimonialeMembre: 'En concubinage',
    nomFiance: '',
    photoMembre: '/assets/images/avatar/avatar-4.webp',
    lieuBaptemeEauMembre: 'AD Andokoi temple peniel',
    contactParentMembre: '0203040502',
    baptemeSaintEspritMembre: 'Oui',
    dateBaptemeSaintEspritMembre: '2017-09-18',
    egliseOrigineMembre: 'Église 2',
    nomPrenomParentMembre: 'Parent 2',
    lieuTravailMembre: 'Entreprise 2',
    nomAmiEglise: 'Ami 2',
    visiteMembre: 'Oui',
    heureVisiteMembre: '19:00',
    raisonNonVisiteMembre: '',
    dateDecisionMembre: '2020-10-05',
    idNiveauEtude: 2,
    idEglise: 2,
    idCellule: 2,
    idDepartement: 2,
    idGroupe: 2,
    idResponsabilite: 2,
    idDomaineActivite: 2,
    idUtilisateur: 2,
  },
];


// ----------------------------------------------------------------------

export const _posts = [...Array(23)].map((_, index) => ({
  id: _id(index),
  title: _postTitles(index),
  description: _description(index),
  coverUrl: `/assets/images/cover/cover-${index + 1}.webp`,
  totalViews: 8829,
  totalComments: 7977,
  totalShares: 8556,
  totalFavorites: 8870,
  postedAt: _times(index),
  author: {
    name: _fullName(index),
    avatarUrl: `/assets/images/avatar/avatar-${index + 1}.webp`,
  },
}));

// ----------------------------------------------------------------------

export const COLORS = [
  '#00AB55',
  '#000000',
  '#FFFFFF',
  '#FFC0CB',
  '#FF4842',
  '#1890FF',
  '#94D82D',
  '#FFC107',
];

export const _products = [...Array(24)].map((_, index) => {
  const setIndex = index + 1;

  return {
    id: _id(index),
    price: _price(index),
    name: _productNames(index),
    priceSale: setIndex % 3 ? null : _price(index),
    coverUrl: `/assets/images/product/product-${setIndex}.webp`,
    colors:
      (setIndex === 1 && COLORS.slice(0, 2)) ||
      (setIndex === 2 && COLORS.slice(1, 3)) ||
      (setIndex === 3 && COLORS.slice(2, 4)) ||
      (setIndex === 4 && COLORS.slice(3, 6)) ||
      (setIndex === 23 && COLORS.slice(4, 6)) ||
      (setIndex === 24 && COLORS.slice(5, 6)) ||
      COLORS,
    status:
      ([1, 3, 5]?.includes(setIndex) && 'sale') || ([4, 8, 12]?.includes(setIndex) && 'new') || '',
  };
});

// ----------------------------------------------------------------------

export const _langs = [
  {
    value: 'en',
    label: 'English',
    icon: '/assets/icons/flags/ic-flag-en.svg',
  },
  {
    value: 'de',
    label: 'German',
    icon: '/assets/icons/flags/ic-flag-de.svg',
  },
  {
    value: 'fr',
    label: 'French',
    icon: '/assets/icons/flags/ic-flag-fr.svg',
  },
];

// ----------------------------------------------------------------------

export const _timeline = [...Array(5)].map((_, index) => ({
  id: _id(index),
  title: [
    '1983, orders, $4220',
    '12 Invoices have been paid',
    'Order #37745 from September',
    'New order placed #XF-2356',
    'New order placed #XF-2346',
  ][index],
  type: `order${index + 1}`,
  time: _times(index),
}));

// ----------------------------------------------------------------------

export const _tasks = [...Array(5)].map((_, index) => ({
  id: _id(index),
  name: _taskNames(index),
}));

// ----------------------------------------------------------------------

export const _notifications = [
  {
    id: _id(1),
    title: 'Your order is placed',
    description: 'waiting for shipping',
    avatarUrl: null,
    type: 'order-placed',
    postedAt: _times(1),
    isUnRead: true,
  },
  {
    id: _id(2),
    title: _fullName(2),
    description: 'answered to your comment on the Minimal',
    avatarUrl: '/assets/images/avatar/avatar-2.webp',
    type: 'friend-interactive',
    postedAt: _times(2),
    isUnRead: true,
  },
  {
    id: _id(3),
    title: 'You have new message',
    description: '5 unread messages',
    avatarUrl: null,
    type: 'chat-message',
    postedAt: _times(3),
    isUnRead: false,
  },
  {
    id: _id(4),
    title: 'You have new mail',
    description: 'sent from Guido Padberg',
    avatarUrl: null,
    type: 'mail',
    postedAt: _times(4),
    isUnRead: false,
  },
  {
    id: _id(5),
    title: 'Delivery processing',
    description: 'Your order is being shipped',
    avatarUrl: null,
    type: 'order-shipped',
    postedAt: _times(5),
    isUnRead: false,
  },
];
