-- phpMyAdmin SQL Dump
-- version 4.5.4.1
-- http://www.phpmyadmin.net
--
-- Client :  localhost
-- Généré le :  Mar 17 Mars 2026 à 12:26
-- Version du serveur :  5.7.11
-- Version de PHP :  5.6.18

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de données :  `ma-communaute`
--

-- --------------------------------------------------------

--
-- Structure de la table `cellule`
--

CREATE TABLE `cellule` (
  `idCellule` int(11) NOT NULL,
  `nomCellule` varchar(255) DEFAULT NULL,
  `lieuCellule` varchar(255) DEFAULT NULL,
  `nombreMembreCellule` int(11) DEFAULT NULL,
  `responsableCellule` varchar(225) DEFAULT NULL,
  `responsableVisiteCellule` varchar(225) CHARACTER SET utf8 DEFAULT NULL,
  `idUtilisateur` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Contenu de la table `cellule`
--

INSERT INTO `cellule` (`idCellule`, `nomCellule`, `lieuCellule`, `nombreMembreCellule`, `responsableCellule`, `responsableVisiteCellule`, `idUtilisateur`) VALUES
(1, 'El kana', 'ANDOKOI D.BAZ', 25, 'Obrou Samuel', NULL, 1),
(2, 'Morijah', 'ANDOKOI MARCHE', 23, NULL, NULL, 1),
(3, 'Aser A', 'Andokoi Zompleu', 16, 'Dah Iyorka rose', NULL, 1),
(4, 'Siloe', 'Zone Eglise', 20, NULL, NULL, 1),
(5, 'Carmel', 'Andokoi Derriere Marché', 12, NULL, NULL, 1),
(6, 'El Kaboth', 'Andokopi Cheveaux', 22, NULL, NULL, 1),
(8, 'Reoboth', 'Cité Ado', 10, 'DIOKRI HENRI JOEL', 'Henri joel', 1);

-- --------------------------------------------------------

--
-- Structure de la table `comptabilite`
--

CREATE TABLE `comptabilite` (
  `idComptabilite` int(11) NOT NULL,
  `nomComptabilite` varchar(255) DEFAULT NULL,
  `entreeComptabilite` int(11) DEFAULT NULL,
  `sortieComptabilite` int(11) DEFAULT NULL,
  `dateComptabilite` date DEFAULT NULL,
  `observationComptabilite` varchar(255) DEFAULT NULL,
  `idUtilisateur` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Contenu de la table `comptabilite`
--

INSERT INTO `comptabilite` (`idComptabilite`, `nomComptabilite`, `entreeComptabilite`, `sortieComptabilite`, `dateComptabilite`, `observationComptabilite`, `idUtilisateur`) VALUES
(1, 'Kouame', 100000, 500, '2023-07-19', 'Offrande', 1),
(2, 'Marie Ange', 1500, 800, '2023-07-20', 'Transaction 2', 1),
(3, 'Kouame', 20000, 300, '2023-07-21', 'Offrande et dime', 1),
(5, 'Kouame', 100000, 500, '2023-07-19', 'Offrande', 1),
(6, 'Kouame', 100000, 500, '2023-07-19', 'Offrande', 1),
(7, 'Kouame', 100000, 500, '2023-07-19', 'Offrande', 1);

-- --------------------------------------------------------

--
-- Structure de la table `culte`
--

CREATE TABLE `culte` (
  `idCulte` int(11) NOT NULL,
  `typeCulte` varchar(225) DEFAULT NULL,
  `dateCulte` varchar(100) DEFAULT NULL,
  `dirigeant` varchar(100) DEFAULT NULL,
  `predication` varchar(255) DEFAULT NULL,
  `passageBiblique` varchar(255) DEFAULT NULL,
  `themePredication` varchar(255) DEFAULT NULL,
  `nombreHommeCulte` varchar(50) DEFAULT NULL,
  `nombreFemmeCulte` varchar(50) DEFAULT NULL,
  `offrandeCulte` varchar(50) DEFAULT NULL,
  `ecodim` varchar(50) DEFAULT NULL,
  `filleEcodim` varchar(225) CHARACTER SET utf8 DEFAULT NULL,
  `offrandeEcodim` varchar(50) DEFAULT NULL,
  `resumePredication` text,
  `idUtilisateur` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Contenu de la table `culte`
--

INSERT INTO `culte` (`idCulte`, `typeCulte`, `dateCulte`, `dirigeant`, `predication`, `passageBiblique`, `themePredication`, `nombreHommeCulte`, `nombreFemmeCulte`, `offrandeCulte`, `ecodim`, `filleEcodim`, `offrandeEcodim`, `resumePredication`, `idUtilisateur`) VALUES
(1, '3', '2026-01-17', 'Respo komoe', 'Past Honoré', 'jean 6v6', 'La Patience', '41', '23', '120000', '53', '48', '25000', 'jbhghjijibbbbbbbbbbbbbb k k nk', NULL),
(2, '4', '2026-02-01', 'Respo Assi', 'Pasteur Troh', 'Romains 8 v 22', 'Sois un modèle de consécration', '55', '45', NULL, '100', '', NULL, 'JHJGHBEHFEBFHRBGRNGNRJGNTNTJN', NULL),
(3, '4', '2026-02-18', 'Respo komoe', 'Ancien ZOE', 'Ephésien 6 v 10', 'La FOI', '45', '29', '15000', '', '', '', '', NULL),
(4, '5', '2026-02-20', 'Respo komoe', 'Ancien ZOE', 'Romains 8 v 22', 'L\'AMOUR', '145', '250', '10000', '45', '62', '14000', '', NULL);

-- --------------------------------------------------------

--
-- Structure de la table `deces`
--

CREATE TABLE `deces` (
  `idDeces` int(11) NOT NULL,
  `nomMembreDeces` varchar(100) DEFAULT NULL,
  `dateDeces` varchar(255) DEFAULT NULL,
  `lieuDeces` varchar(255) DEFAULT NULL,
  `causeDeces` varchar(255) DEFAULT NULL,
  `idUtilisateur` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Contenu de la table `deces`
--

INSERT INTO `deces` (`idDeces`, `nomMembreDeces`, `dateDeces`, `lieuDeces`, `causeDeces`, `idUtilisateur`) VALUES
(1, 'N\'dri narcisse', '2024-06-12', 'CHU', 'Arrêt cardiaque automatique', 1);

-- --------------------------------------------------------

--
-- Structure de la table `departement`
--

CREATE TABLE `departement` (
  `idDepartement` int(11) NOT NULL,
  `libelleLongDepartement` varchar(225) DEFAULT NULL,
  `libelleCourtDepartement` varchar(225) DEFAULT NULL,
  `sloganDepartement` varchar(225) DEFAULT NULL,
  `responsableDepartement` varchar(225) NOT NULL,
  `idUtilisateur` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Contenu de la table `departement`
--

INSERT INTO `departement` (`idDepartement`, `libelleLongDepartement`, `libelleCourtDepartement`, `sloganDepartement`, `responsableDepartement`, `idUtilisateur`) VALUES
(1, 'Action des Ouvrière du Christ', 'AOC', 'AOC TOUJOURS FORT,AOC TOUJOURS CONQUERANTE', 'Moni kouka', 1),
(6, 'Jeunesse des Assemblées de Dieu de Côte d\'Ivoire', 'JADCI', 'Christ est merveilleux, alleluiaaa ', 'Jean François', 1),
(9, 'Departement Enfant des Assemblées de Dieu', 'DEEADCI', 'L\'enfant, l\'église de demain', 'Diokri henri joel', 1),
(10, 'Hommes ACTIFS POUR CHRIST', 'HACH', 'Hommes pour Jesus', 'ARNAUD', 1),
(11, 'ACCUEIL', 'AC', 'Bien reçevoir', 'Togon serge', 1),
(12, 'TEMOIN ET CONSEILLER', 'TC', 'Accompagner jusqu\'au bâptème', 'Respo kouka', 1);

-- --------------------------------------------------------

--
-- Structure de la table `domaine_activite`
--

CREATE TABLE `domaine_activite` (
  `idDomaineActivite` int(11) NOT NULL,
  `libelleDomaineActivite` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Contenu de la table `domaine_activite`
--

INSERT INTO `domaine_activite` (`idDomaineActivite`, `libelleDomaineActivite`) VALUES
(1, 'Professeur'),
(2, 'Mécanicien'),
(3, 'couturier'),
(4, 'Informaticien'),
(6, 'Menusieur'),
(9, 'Plombiers'),
(10, 'Zonnier');

-- --------------------------------------------------------

--
-- Structure de la table `eglise`
--

CREATE TABLE `eglise` (
  `idEglise` int(11) NOT NULL,
  `nomEglise` varchar(255) DEFAULT NULL,
  `idComptabilite` int(11) DEFAULT NULL,
  `idUtilisateur` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Contenu de la table `eglise`
--

INSERT INTO `eglise` (`idEglise`, `nomEglise`, `idComptabilite`, `idUtilisateur`) VALUES
(1, 'Assemblée de Dieu Andokoi Péniel', 1, 1),
(2, 'Catholique', 2, 1);

-- --------------------------------------------------------

--
-- Structure de la table `groupe`
--

CREATE TABLE `groupe` (
  `idGroupe` int(11) NOT NULL,
  `libelleGroupe` varchar(255) DEFAULT NULL,
  `descriptionGroupe` varchar(255) DEFAULT NULL,
  `responsableGroupe` varchar(225) DEFAULT NULL,
  `idUtilisateur` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Contenu de la table `groupe`
--

INSERT INTO `groupe` (`idGroupe`, `libelleGroupe`, `descriptionGroupe`, `responsableGroupe`, `idUtilisateur`) VALUES
(1, 'BAOULE', 'GROUPE BAOULE', 'Tanella Tryphène', 1),
(2, 'BETE', 'GROUPE BETE', NULL, 1),
(3, 'DIDA', 'GROUPE DIDA', NULL, 1),
(4, 'BAOULE', 'GROUPE BAOULE', NULL, 1),
(5, 'AVICKAM', 'GROUPE AVICKAME', 'Offo Aya Benedicte', 1),
(7, 'ATTIE', 'GROUPE ATTIE', 'DIOKRI HENRI JOEL', NULL);

-- --------------------------------------------------------

--
-- Structure de la table `maladie`
--

CREATE TABLE `maladie` (
  `idMaladie` int(11) NOT NULL,
  `nomMembreMaladie` varchar(100) DEFAULT NULL,
  `typeMaladie` varchar(255) DEFAULT NULL,
  `dateMaladie` varchar(255) DEFAULT NULL,
  `lieuHospitalisation` varchar(255) DEFAULT NULL,
  `observationMaladie` varchar(255) DEFAULT NULL,
  `idUtilisateur` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Contenu de la table `maladie`
--

INSERT INTO `maladie` (`idMaladie`, `nomMembreMaladie`, `typeMaladie`, `dateMaladie`, `lieuHospitalisation`, `observationMaladie`, `idUtilisateur`) VALUES
(1, 'Membre exemple', 'Hospitalisation', '2026-03-01', 'CHU', 'Suivi pastoral en cours', 1);
-- --------------------------------------------------------

--
-- Structure de la table `mariage`
--

CREATE TABLE `mariage` (
  `idMariage` int(11) NOT NULL,
  `nomFrereMariage` varchar(225) DEFAULT NULL,
  `nomSoeurMariage` varchar(225) DEFAULT NULL,
  `dateMariage` varchar(225) DEFAULT NULL,
  `lieuMariage` varchar(255) DEFAULT NULL,
  `culteMariage` varchar(255) DEFAULT NULL,
  `temoin1Mariage` varchar(100) DEFAULT NULL,
  `temoin2Mariage` varchar(100) DEFAULT NULL,
  `lieuReception` varchar(255) DEFAULT NULL,
  `contactMariage` varchar(100) DEFAULT NULL,
  `idUtilisateur` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Contenu de la table `mariage`
--

INSERT INTO `mariage` (`idMariage`, `nomFrereMariage`, `nomSoeurMariage`, `dateMariage`, `lieuMariage`, `culteMariage`, `temoin1Mariage`, `temoin2Mariage`, `lieuReception`, `contactMariage`, `idUtilisateur`) VALUES
(1, 'Kouame franck', 'Konan juliette', '11-05-2024', 'Cocody', 'andokoi', 'Maman kanga', 'Diacre koffi', 'Franciscains', '010302546', 1);

-- --------------------------------------------------------

--
-- Structure de la table `membre`
--

CREATE TABLE `membre` (
  `idMembre` int(11) NOT NULL,
  `nomMembre` varchar(255) DEFAULT NULL,
  `prenomMembre` varchar(255) DEFAULT NULL,
  `dateNaissMembre` varchar(255) DEFAULT NULL,
  `lieuNaissMembre` varchar(255) DEFAULT NULL,
  `sexeMembre` varchar(2) DEFAULT NULL,
  `emailMembre` varchar(255) DEFAULT NULL,
  `nationaliteMembre` varchar(255) DEFAULT NULL,
  `fonctionMembre` varchar(255) DEFAULT NULL,
  `contactMembre` varchar(255) DEFAULT NULL,
  `ethnieMembre` varchar(255) DEFAULT NULL,
  `residenceMembre` varchar(255) DEFAULT NULL,
  `civiliteMembre` varchar(255) DEFAULT NULL,
  `nouvelleAmeMembre` varchar(225) DEFAULT NULL,
  `dateConversionMembre` varchar(225) DEFAULT NULL,
  `baptemeEauMembre` varchar(50) DEFAULT NULL,
  `dateBaptemeMembre` varchar(255) DEFAULT NULL,
  `dateMariageMembre` varchar(255) DEFAULT NULL,
  `capaciteSpirituelleMembre` varchar(255) DEFAULT NULL,
  `situationMatrimonialeMembre` varchar(255) DEFAULT NULL,
  `nomFiance` varchar(225) DEFAULT NULL,
  `photoMembre` text,
  `lieuBaptemeEauMembre` varchar(255) DEFAULT NULL,
  `baptemeSaintEspritMembre` varchar(50) DEFAULT NULL,
  `dateBaptemeSaintEspritMembre` varchar(255) DEFAULT NULL,
  `egliseOrigineMembre` varchar(255) DEFAULT NULL,
  `nomAmiEglise` varchar(225) CHARACTER SET utf8 DEFAULT NULL,
  `visiteMembre` varchar(225) DEFAULT NULL,
  `raisonNonVisiteMembre` varchar(225) CHARACTER SET utf8 DEFAULT NULL,
  `heureVisiteMembre` varchar(225) DEFAULT NULL,
  `dateDecisionMembre` varchar(225) CHARACTER SET utf8 DEFAULT NULL,
  `lieuTravailMembre` varchar(225) DEFAULT NULL,
  `idNiveauEtude` int(11) DEFAULT NULL,
  `idEglise` int(11) DEFAULT NULL,
  `idCellule` int(11) DEFAULT NULL,
  `idDepartement` int(11) DEFAULT NULL,
  `idGroupe` int(11) DEFAULT NULL,
  `idResponsabilite` int(11) DEFAULT NULL,
  `idUtilisateur` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Contenu de la table `membre`
--

INSERT INTO `membre` (`idMembre`, `nomMembre`, `prenomMembre`, `dateNaissMembre`, `lieuNaissMembre`, `sexeMembre`, `emailMembre`, `nationaliteMembre`, `fonctionMembre`, `contactMembre`, `ethnieMembre`, `residenceMembre`, `civiliteMembre`, `nouvelleAmeMembre`, `dateConversionMembre`, `baptemeEauMembre`, `dateBaptemeMembre`, `dateMariageMembre`, `capaciteSpirituelleMembre`, `situationMatrimonialeMembre`, `nomFiance`, `photoMembre`, `lieuBaptemeEauMembre`, `baptemeSaintEspritMembre`, `dateBaptemeSaintEspritMembre`, `egliseOrigineMembre`, `nomAmiEglise`, `visiteMembre`, `raisonNonVisiteMembre`, `heureVisiteMembre`, `dateDecisionMembre`, `lieuTravailMembre`, `idNiveauEtude`, `idEglise`, `idCellule`, `idDepartement`, `idGroupe`, `idResponsabilite`, `idUtilisateur`) VALUES
(19, 'Seri', 'Ange', '1990-05-11', 'Divo', '1', 'seriange@gmail.com', 'IVOIRIENNE', 'Infographe', '0564178820', 'Bété', 'Micao', '', '1', '2026-02-04', NULL, NULL, NULL, NULL, '1', '', 'membre_19.jpg', '', NULL, NULL, 'AD ', 'kouame', '1', 'Mes parents ne veulent pas', '03:13', NULL, 'Bouafle', 2, NULL, 1, 6, 2, NULL, 1);

-- --------------------------------------------------------

--
-- Structure de la table `naissance`
--

CREATE TABLE `naissance` (
  `idNaissance` int(11) NOT NULL,
  `nomCoupleNaissance` varchar(100) DEFAULT NULL,
  `dateNaissance` varchar(225) DEFAULT NULL,
  `lieuNaissance` varchar(255) DEFAULT NULL,
  `nomEnfantNaissance` varchar(100) DEFAULT NULL,
  `datePresentationNaissance` varchar(225) DEFAULT NULL,
  `idUtilisateur` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Contenu de la table `naissance`
--

INSERT INTO `naissance` (`idNaissance`, `nomCoupleNaissance`, `dateNaissance`, `lieuNaissance`, `nomEnfantNaissance`, `datePresentationNaissance`, `idUtilisateur`) VALUES
(1, 'Kouame', '2024-06-04', 'AGEFORMA', 'KOUAME ANGE NOEL', '2024-06-01', 1);

-- --------------------------------------------------------

--
-- Structure de la table `niveau_etude`
--

CREATE TABLE `niveau_etude` (
  `idNiveauEtude` int(11) NOT NULL,
  `libelleNiveauEtude` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Contenu de la table `niveau_etude`
--

INSERT INTO `niveau_etude` (`idNiveauEtude`, `libelleNiveauEtude`) VALUES
(1, 'Primaire'),
(2, 'Collège'),
(3, 'BEPC'),
(4, 'Lycée'),
(5, 'BAC'),
(6, 'Bac+1'),
(7, 'Bac+2'),
(8, 'Licence 3'),
(9, 'Master 1'),
(10, 'Master 2'),
(13, 'Doctorat'),
(14, 'Doctorat');

-- --------------------------------------------------------

--
-- Structure de la table `questions`
--

CREATE TABLE `questions` (
  `idQuestion` int(11) NOT NULL,
  `question` text NOT NULL,
  `options` json NOT NULL,
  `correctOption` varchar(255) NOT NULL,
  `niveau` varchar(255) NOT NULL,
  `idEglise` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Contenu de la table `questions`
--

INSERT INTO `questions` (`idQuestion`, `question`, `options`, `correctOption`, `niveau`, `idEglise`) VALUES
(1, 'Donner la signification de EEADCI', '["Eglise des Evangiles des Assemblées de Dieu de Dieu de Côte d\'Ivoire", "Eglise Evangélique des Assemblées de Dieu de Côte d\'Ivoire", "Eglise Evangéliste Assemblées de Dieu de Côte d\'Ivoire"]', 'Eglise Evangélique des Assemblées de Dieu de Côte d\'Ivoire', 'facile', 1),
(2, 'Donner la signification de EEADCI', '["Eglise des Evangiles des Assemblées de Dieu de Dieu de Côte d\'Ivoire", "Eglise Evangélique des Assemblées de Dieu de Côte d\'Ivoire", "Eglise Evangéliste Assemblées de Dieu de Côte d\'Ivoire"]', 'Eglise Evangélique des Assemblées de Dieu de Côte d\'Ivoire', 'facile', 1),
(3, 'Donner la signification de EEADCI', '["Eglise des Evangiles des Assemblées de Dieu de Dieu de Côte d\'Ivoire", "Eglise Evangélique des Assemblées de Dieu de Côte d\'Ivoire", "Eglise Evangéliste Assemblées de Dieu de Côte d\'Ivoire"]', 'Eglise Evangélique des Assemblées de Dieu de Côte d\'Ivoire', 'facile', 1),
(4, 'Donner la signification de EEADCI', '["Eglise des Evangiles des Assemblées de Dieu de Dieu de Côte d\'Ivoire", "Eglise Evangélique des Assemblées de Dieu de Côte d\'Ivoire", "Eglise Evangéliste Assemblées de Dieu de Côte d\'Ivoire"]', 'Eglise Evangélique des Assemblées de Dieu de Côte d\'Ivoire', 'facile', 1);

-- --------------------------------------------------------

--
-- Structure de la table `responsabilite`
--

CREATE TABLE `responsabilite` (
  `idResponsabilite` int(11) NOT NULL,
  `libelleResponsabilite` varchar(255) DEFAULT NULL,
  `descriptionResponsabilite` varchar(255) DEFAULT NULL,
  `idUtilisateur` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Contenu de la table `responsabilite`
--

INSERT INTO `responsabilite` (`idResponsabilite`, `libelleResponsabilite`, `descriptionResponsabilite`, `idUtilisateur`) VALUES
(1, 'Pasteur principal', 'Prémier responsable de l\'église', 1),
(2, 'Pasteur second', 'Deuxième responsable de l\'église', 1),
(3, 'Pasteur', 'responsable église', 1),
(4, 'Ancien', 'subtitut du pasteur', 1),
(5, 'Diacre', 'chargé de la propriété du temple', 1),
(6, 'Diaconesse', 'chargé de la propriété du temple', 1),
(7, 'Responsable de cellule', 'chargé des courses', 1),
(8, 'Responsable de departement', 'chargé de veillée sur le temple', 1),
(9, 'Responsable de groupe ethnique', 'premier responsable de groupe ethnique', 1),
(10, 'Responsable AOC', 'Prémière responsable du AOC', 1),
(11, 'Directeur/Diretrice de l\'ECODIM', 'Premier(e) responsable ECODIM', 1),
(12, 'Président de Jeunesse', 'premier responsable de la jeunesse', 1);

-- --------------------------------------------------------

--
-- Structure de la table `responsable_cellule`
--

CREATE TABLE `responsable_cellule` (
  `idMembre` int(11) NOT NULL,
  `idCellule` int(11) DEFAULT NULL,
  `idResponsabilite` int(11) DEFAULT NULL,
  `idUtilisateur` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Structure de la table `responsable_departement`
--

CREATE TABLE `responsable_departement` (
  `idMembre` int(11) NOT NULL,
  `idUtilisateur` int(11) NOT NULL,
  `idDepartement` int(11) NOT NULL,
  `idResponsabilite` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Structure de la table `responsable_groupe`
--

CREATE TABLE `responsable_groupe` (
  `idMembre` int(11) NOT NULL,
  `idGroupe` int(11) DEFAULT NULL,
  `idResponsabilite` int(11) DEFAULT NULL,
  `idUtilisateur` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Structure de la table `utilisateur`
--

CREATE TABLE `utilisateur` (
  `idUtilisateur` int(11) NOT NULL,
  `logoUtilisateur` text,
  `nomTemple` varchar(255) DEFAULT NULL,
  `nomUtilisateur` varchar(255) DEFAULT NULL,
  `prenomUtilisateur` varchar(255) DEFAULT NULL,
  `telephoneUtilisateur` varchar(15) NOT NULL,
  `password` varchar(255) NOT NULL,
  `confirmPassword` varchar(255) NOT NULL,
  `email` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Contenu de la table `utilisateur`
--

INSERT INTO `utilisateur` (`idUtilisateur`, `logoUtilisateur`, `nomTemple`, `nomUtilisateur`, `prenomUtilisateur`, `telephoneUtilisateur`, `password`, `confirmPassword`, `email`) VALUES
(1, '', 'EEAD YABAYO', 'Henri', 'Joel', '0102030405', 'aa', '$2b$20$JWgvBof.ocjQS3Bwfr0cB.ZjnP1iKMjXQkB0r93RC9kiuEOeuxQ7u', 'joel@gmail.com'),
(11, NULL, 'EGLISE EVANGELIQUE DES ASSEMBLEES DE DIEU ANDOKOI PENIEL', 'Tanella', 'Tryphène', '0102034566', 'cc', '$2b$20$YW4LCaajyaANWa9YtRVvQOH7kXCaz848MSHks.TuKQwOkaQmdqaBm', 'tryphe@gmail.com'),
(12, NULL, 'EGLISE EVANGELIQUE DES ASSEMBLEES DE DIEU ANDOKOI PENIEL', 'KOUAME', 'ANGE', '0102030617', '0102030617', '$2b$20$KeDF4JJHSODI2LAQ0fDy.eccT07yyXdR6RO0s4Kj9Lv9i4iqSkKYu', 'kouame@gmail.com');

--
-- Index pour les tables exportées
--

--
-- Index pour la table `cellule`
--
ALTER TABLE `cellule`
  ADD PRIMARY KEY (`idCellule`),
  ADD KEY `idUtilisateur` (`idUtilisateur`);

--
-- Index pour la table `comptabilite`
--
ALTER TABLE `comptabilite`
  ADD PRIMARY KEY (`idComptabilite`),
  ADD KEY `idUtilisateur` (`idUtilisateur`);

--
-- Index pour la table `culte`
--
ALTER TABLE `culte`
  ADD PRIMARY KEY (`idCulte`),
  ADD KEY `idUtilisateur` (`idUtilisateur`);

--
-- Index pour la table `deces`
--
ALTER TABLE `deces`
  ADD PRIMARY KEY (`idDeces`),
  ADD KEY `idUtilisateur` (`idUtilisateur`);

--
-- Index pour la table `departement`
--
ALTER TABLE `departement`
  ADD PRIMARY KEY (`idDepartement`),
  ADD KEY `idUtilisateur` (`idUtilisateur`);

--
-- Index pour la table `domaine_activite`
--
ALTER TABLE `domaine_activite`
  ADD PRIMARY KEY (`idDomaineActivite`);

--
-- Index pour la table `eglise`
--
ALTER TABLE `eglise`
  ADD PRIMARY KEY (`idEglise`),
  ADD KEY `idComptabilite` (`idComptabilite`),
  ADD KEY `idUtilisateur` (`idUtilisateur`);

--
-- Index pour la table `groupe`
--
ALTER TABLE `groupe`
  ADD PRIMARY KEY (`idGroupe`),
  ADD KEY `idUtilisateur` (`idUtilisateur`);

--
-- Index pour la table `mariage`
--
ALTER TABLE `mariage`
  ADD PRIMARY KEY (`idMariage`),
  ADD KEY `idUtilisateur` (`idUtilisateur`);

--
-- Index pour la table `membre`
--
ALTER TABLE `membre`
  ADD PRIMARY KEY (`idMembre`),
  ADD KEY `idNiveauEtude` (`idNiveauEtude`),
  ADD KEY `idEglise` (`idEglise`),
  ADD KEY `fk_membre_cellule` (`idCellule`),
  ADD KEY `fk_membre_departement` (`idDepartement`),
  ADD KEY `fk_membre_groupe` (`idGroupe`),
  ADD KEY `idResponsabilite` (`idResponsabilite`),
  ADD KEY `idUtilisateur` (`idUtilisateur`);

--
-- Index pour la table `naissance`
--
ALTER TABLE `naissance`
  ADD PRIMARY KEY (`idNaissance`),
  ADD KEY `idUtilisateur` (`idUtilisateur`);

--
-- Index pour la table `niveau_etude`
--
ALTER TABLE `niveau_etude`
  ADD PRIMARY KEY (`idNiveauEtude`);

--
-- Index pour la table `questions`
--
ALTER TABLE `questions`
  ADD PRIMARY KEY (`idQuestion`),
  ADD KEY `fk_idEglise` (`idEglise`);

--
-- Index pour la table `responsabilite`
--
ALTER TABLE `responsabilite`
  ADD PRIMARY KEY (`idResponsabilite`),
  ADD KEY `idUtilisateur` (`idUtilisateur`);

--
-- Index pour la table `responsable_cellule`
--
ALTER TABLE `responsable_cellule`
  ADD PRIMARY KEY (`idMembre`),
  ADD KEY `idCellule` (`idCellule`),
  ADD KEY `idResponsabilite` (`idResponsabilite`),
  ADD KEY `idUtilisateur` (`idUtilisateur`);

--
-- Index pour la table `responsable_departement`
--
ALTER TABLE `responsable_departement`
  ADD PRIMARY KEY (`idMembre`,`idUtilisateur`,`idDepartement`,`idResponsabilite`),
  ADD KEY `idUtilisateur` (`idUtilisateur`),
  ADD KEY `idDepartement` (`idDepartement`),
  ADD KEY `idResponsabilite` (`idResponsabilite`);

--
-- Index pour la table `responsable_groupe`
--
ALTER TABLE `responsable_groupe`
  ADD PRIMARY KEY (`idMembre`),
  ADD KEY `idGroupe` (`idGroupe`),
  ADD KEY `idResponsabilite` (`idResponsabilite`),
  ADD KEY `idUtilisateur` (`idUtilisateur`);

--
-- Index pour la table `utilisateur`
--
ALTER TABLE `utilisateur`
  ADD PRIMARY KEY (`idUtilisateur`);

--
-- AUTO_INCREMENT pour les tables exportées
--

--
-- AUTO_INCREMENT pour la table `cellule`
--
ALTER TABLE `cellule`
  MODIFY `idCellule` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;
--
-- AUTO_INCREMENT pour la table `comptabilite`
--
ALTER TABLE `comptabilite`
  MODIFY `idComptabilite` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;
--
-- AUTO_INCREMENT pour la table `culte`
--
ALTER TABLE `culte`
  MODIFY `idCulte` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;
--
-- AUTO_INCREMENT pour la table `deces`
--
ALTER TABLE `deces`
  MODIFY `idDeces` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;
--
-- AUTO_INCREMENT pour la table `departement`
--
ALTER TABLE `departement`
  MODIFY `idDepartement` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;
--
-- AUTO_INCREMENT pour la table `domaine_activite`
--
ALTER TABLE `domaine_activite`
  MODIFY `idDomaineActivite` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;
--
-- AUTO_INCREMENT pour la table `eglise`
--
ALTER TABLE `eglise`
  MODIFY `idEglise` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;
--
-- AUTO_INCREMENT pour la table `groupe`
--
ALTER TABLE `groupe`
  MODIFY `idGroupe` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;
--
-- AUTO_INCREMENT pour la table `mariage`
--
ALTER TABLE `mariage`
  MODIFY `idMariage` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;
--
-- AUTO_INCREMENT pour la table `membre`
--
ALTER TABLE `membre`
  MODIFY `idMembre` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=20;
--
-- AUTO_INCREMENT pour la table `naissance`
--
ALTER TABLE `naissance`
  MODIFY `idNaissance` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;
--
-- AUTO_INCREMENT pour la table `niveau_etude`
--
ALTER TABLE `niveau_etude`
  MODIFY `idNiveauEtude` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;
--
-- AUTO_INCREMENT pour la table `questions`
--
ALTER TABLE `questions`
  MODIFY `idQuestion` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;
--
-- AUTO_INCREMENT pour la table `responsabilite`
--
ALTER TABLE `responsabilite`
  MODIFY `idResponsabilite` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;
--
-- AUTO_INCREMENT pour la table `utilisateur`
--
ALTER TABLE `utilisateur`
  MODIFY `idUtilisateur` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;
--
-- Contraintes pour les tables exportées
--

--
-- Contraintes pour la table `cellule`
--
ALTER TABLE `cellule`
  ADD CONSTRAINT `cellule_ibfk_1` FOREIGN KEY (`idUtilisateur`) REFERENCES `utilisateur` (`idUtilisateur`);

--
-- Contraintes pour la table `comptabilite`
--
ALTER TABLE `comptabilite`
  ADD CONSTRAINT `comptabilite_ibfk_1` FOREIGN KEY (`idUtilisateur`) REFERENCES `utilisateur` (`idUtilisateur`);

--
-- Contraintes pour la table `culte`
--
ALTER TABLE `culte`
  ADD CONSTRAINT `culte_ibfk_1` FOREIGN KEY (`idUtilisateur`) REFERENCES `utilisateur` (`idUtilisateur`);

--
-- Contraintes pour la table `deces`
--
ALTER TABLE `deces`
  ADD CONSTRAINT `deces_ibfk_1` FOREIGN KEY (`idUtilisateur`) REFERENCES `utilisateur` (`idUtilisateur`);

--
-- Contraintes pour la table `departement`
--
ALTER TABLE `departement`
  ADD CONSTRAINT `departement_ibfk_1` FOREIGN KEY (`idUtilisateur`) REFERENCES `utilisateur` (`idUtilisateur`);

--
-- Contraintes pour la table `eglise`
--
ALTER TABLE `eglise`
  ADD CONSTRAINT `eglise_ibfk_1` FOREIGN KEY (`idComptabilite`) REFERENCES `comptabilite` (`idComptabilite`),
  ADD CONSTRAINT `eglise_ibfk_2` FOREIGN KEY (`idUtilisateur`) REFERENCES `utilisateur` (`idUtilisateur`);

--
-- Contraintes pour la table `groupe`
--
ALTER TABLE `groupe`
  ADD CONSTRAINT `groupe_ibfk_1` FOREIGN KEY (`idUtilisateur`) REFERENCES `utilisateur` (`idUtilisateur`);

--
-- Contraintes pour la table `mariage`
--
ALTER TABLE `mariage`
  ADD CONSTRAINT `mariage_ibfk_1` FOREIGN KEY (`idUtilisateur`) REFERENCES `utilisateur` (`idUtilisateur`);

--
-- Contraintes pour la table `membre`
--
ALTER TABLE `membre`
  ADD CONSTRAINT `fk_membre_cellule` FOREIGN KEY (`idCellule`) REFERENCES `cellule` (`idCellule`),
  ADD CONSTRAINT `fk_membre_groupe` FOREIGN KEY (`idGroupe`) REFERENCES `groupe` (`idGroupe`),
  ADD CONSTRAINT `membre_ibfk_1` FOREIGN KEY (`idNiveauEtude`) REFERENCES `niveau_etude` (`idNiveauEtude`),
  ADD CONSTRAINT `membre_ibfk_2` FOREIGN KEY (`idEglise`) REFERENCES `eglise` (`idEglise`),
  ADD CONSTRAINT `membre_ibfk_3` FOREIGN KEY (`idResponsabilite`) REFERENCES `responsabilite` (`idResponsabilite`),
  ADD CONSTRAINT `membre_ibfk_5` FOREIGN KEY (`idUtilisateur`) REFERENCES `utilisateur` (`idUtilisateur`);

--
-- Contraintes pour la table `naissance`
--
ALTER TABLE `naissance`
  ADD CONSTRAINT `naissance_ibfk_1` FOREIGN KEY (`idUtilisateur`) REFERENCES `utilisateur` (`idUtilisateur`);

--
-- Contraintes pour la table `questions`
--
ALTER TABLE `questions`
  ADD CONSTRAINT `fk_idEglise` FOREIGN KEY (`idEglise`) REFERENCES `eglise` (`idEglise`);

--
-- Contraintes pour la table `responsabilite`
--
ALTER TABLE `responsabilite`
  ADD CONSTRAINT `responsabilite_ibfk_1` FOREIGN KEY (`idUtilisateur`) REFERENCES `utilisateur` (`idUtilisateur`);

--
-- Contraintes pour la table `responsable_cellule`
--
ALTER TABLE `responsable_cellule`
  ADD CONSTRAINT `responsable_cellule_ibfk_1` FOREIGN KEY (`idMembre`) REFERENCES `membre` (`idMembre`),
  ADD CONSTRAINT `responsable_cellule_ibfk_2` FOREIGN KEY (`idCellule`) REFERENCES `cellule` (`idCellule`),
  ADD CONSTRAINT `responsable_cellule_ibfk_3` FOREIGN KEY (`idResponsabilite`) REFERENCES `responsabilite` (`idResponsabilite`),
  ADD CONSTRAINT `responsable_cellule_ibfk_4` FOREIGN KEY (`idUtilisateur`) REFERENCES `utilisateur` (`idUtilisateur`);

--
-- Contraintes pour la table `responsable_departement`
--
ALTER TABLE `responsable_departement`
  ADD CONSTRAINT `responsable_departement_ibfk_1` FOREIGN KEY (`idMembre`) REFERENCES `membre` (`idMembre`),
  ADD CONSTRAINT `responsable_departement_ibfk_2` FOREIGN KEY (`idUtilisateur`) REFERENCES `utilisateur` (`idUtilisateur`),
  ADD CONSTRAINT `responsable_departement_ibfk_3` FOREIGN KEY (`idDepartement`) REFERENCES `departement` (`idDepartement`),
  ADD CONSTRAINT `responsable_departement_ibfk_4` FOREIGN KEY (`idResponsabilite`) REFERENCES `responsabilite` (`idResponsabilite`);

--
-- Contraintes pour la table `responsable_groupe`
--
ALTER TABLE `responsable_groupe`
  ADD CONSTRAINT `responsable_groupe_ibfk_1` FOREIGN KEY (`idMembre`) REFERENCES `membre` (`idMembre`),
  ADD CONSTRAINT `responsable_groupe_ibfk_2` FOREIGN KEY (`idGroupe`) REFERENCES `groupe` (`idGroupe`),
  ADD CONSTRAINT `responsable_groupe_ibfk_3` FOREIGN KEY (`idResponsabilite`) REFERENCES `responsabilite` (`idResponsabilite`),
  ADD CONSTRAINT `responsable_groupe_ibfk_4` FOREIGN KEY (`idUtilisateur`) REFERENCES `utilisateur` (`idUtilisateur`);

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;


