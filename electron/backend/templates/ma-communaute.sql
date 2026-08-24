-- phpMyAdmin SQL Dump
-- version 4.5.4.1
-- http://www.phpmyadmin.net
--
-- Client :  localhost
-- Genere le :  Mar 17 Mars 2026 a 12:26
-- Version du serveur :  5.7.11
-- Version de PHP :  5.6.18

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de donnees :  `ma-communaute`
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

-- --------------------------------------------------------

--
-- Structure de la table `deces`
--

CREATE TABLE `deces` (
  `idDeces` int(11) NOT NULL,
  `idMembre` int(11) DEFAULT NULL,
  `nomMembreDeces` varchar(100) DEFAULT NULL,
  `dateDeces` varchar(255) DEFAULT NULL,
  `lieuDeces` varchar(255) DEFAULT NULL,
  `causeDeces` varchar(255) DEFAULT NULL,
  `idUtilisateur` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Contenu de la table `deces`
--

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
(2, 'Mecanicien'),
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

-- --------------------------------------------------------

--
-- Structure de la table `maladie`
--

CREATE TABLE `maladie` (
  `idMaladie` int(11) NOT NULL,
  `idMembre` int(11) DEFAULT NULL,
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

-- --------------------------------------------------------

--
-- Structure de la table `mariage`
--

CREATE TABLE `mariage` (
  `idMariage` int(11) NOT NULL,
  `idFrereMembre` int(11) DEFAULT NULL,
  `idSoeurMembre` int(11) DEFAULT NULL,
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
  `estDecede` int(11) DEFAULT 0,
  `dateDecesMembre` varchar(255) DEFAULT NULL,
  `idUtilisateur` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Contenu de la table `membre`
--

-- --------------------------------------------------------

--
-- Structure de la table `membre_inscription_demande`
--

CREATE TABLE `membre_inscription_demande` (
  `idDemandeInscription` int(11) NOT NULL,
  `idUtilisateur` int(11) NOT NULL,
  `nomMembre` varchar(255) DEFAULT NULL,
  `prenomMembre` varchar(255) DEFAULT NULL,
  `contactMembre` varchar(255) DEFAULT NULL,
  `payloadDemande` text NOT NULL,
  `statutDemande` varchar(50) DEFAULT 'en_attente',
  `idMembreCree` int(11) DEFAULT NULL,
  `dateCreation` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `dateTraitement` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Contenu de la table `membre_inscription_demande`
--

-- --------------------------------------------------------

--
-- Structure de la table `verset_programme`
--

CREATE TABLE `verset_programme` (
  `idVersetProgramme` int(11) NOT NULL,
  `idUtilisateur` int(11) NOT NULL,
  `dateAffichage` date NOT NULL,
  `reference` varchar(255) DEFAULT NULL,
  `texte` text NOT NULL,
  `dateCreation` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Contenu de la table `verset_programme`
--

-- --------------------------------------------------------

--
-- Structure de la table `programme_eglise`
--

CREATE TABLE `programme_eglise` (
  `idProgramme` int(11) NOT NULL,
  `idUtilisateur` int(11) NOT NULL,
  `dateProgramme` date NOT NULL,
  `direction` varchar(255) DEFAULT NULL,
  `saintCene` varchar(255) DEFAULT NULL,
  `predication` varchar(255) DEFAULT NULL,
  `offrandes` varchar(255) DEFAULT NULL,
  `annonces` varchar(255) DEFAULT NULL,
  `thematique` text,
  `dateCreation` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Contenu de la table `programme_eglise`
--

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
(2, 'College'),
(3, 'BEPC'),
(4, 'Lycee'),
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
(1, 'Pasteur principal', 'Premier responsable de l\'eglise', 1),
(2, 'Pasteur second', 'Deuxieme responsable de l\'eglise', 1),
(3, 'Pasteur', 'responsable eglise', 1),
(4, 'Ancien', 'subtitut du pasteur', 1),
(5, 'Diacre', 'charge de la propriete du temple', 1),
(6, 'Diaconesse', 'charge de la propriete du temple', 1),
(7, 'Responsable de cellule', 'charge des courses', 1),
(8, 'Responsable de departement', 'charge de veillee sur le temple', 1),
(9, 'Responsable de groupe ethnique', 'premier responsable de groupe ethnique', 1),
(10, 'Responsable AOC', 'Premiere responsable du AOC', 1),
(11, 'Directeur/Diretrice de l\'ECODIM', 'Premier(e) responsable ECODIM', 1),
(12, 'President de Jeunesse', 'premier responsable de la jeunesse', 1);

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
  `logoEglise` text,
  `nomTemple` varchar(255) DEFAULT NULL,
  `lieuEglise` varchar(255) DEFAULT NULL,
  `nomUtilisateur` varchar(255) DEFAULT NULL,
  `prenomUtilisateur` varchar(255) DEFAULT NULL,
  `telephoneUtilisateur` varchar(15) NOT NULL,
  `telephoneSecretariatEglise` varchar(30) DEFAULT NULL,
  `pasteurPrincipal` varchar(255) DEFAULT NULL,
  `pasteurSecondaire` varchar(255) DEFAULT NULL,
  `pasteurTroisieme` varchar(255) DEFAULT NULL,
  `telephonePasteurPrincipal` varchar(30) DEFAULT NULL,
  `telephonePasteurSecondaire` varchar(30) DEFAULT NULL,
  `telephonePasteurTroisieme` varchar(30) DEFAULT NULL,
  `capaciteAccueilEglise` varchar(50) DEFAULT NULL,
  `nombreCultesDimanche` varchar(50) DEFAULT NULL,
  `emailEglise` varchar(255) DEFAULT NULL,
  `boitePostaleEglise` varchar(255) DEFAULT NULL,
  `dateCreationEglise` varchar(50) DEFAULT NULL,
  `nombrePasteursEglise` varchar(50) DEFAULT NULL,
  `nombreAnciensEglise` varchar(50) DEFAULT NULL,
  `nombreDiacresEglise` varchar(50) DEFAULT NULL,
  `modeVersetDashboard` varchar(30) NOT NULL DEFAULT 'daily',
  `versetDashboardReference` varchar(255) DEFAULT NULL,
  `versetDashboardTexte` text,
  `password` varchar(255) NOT NULL,
  `confirmPassword` varchar(255) NOT NULL,
  `email` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Contenu de la table `utilisateur`
--

--
-- Index pour les tables exportees
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
-- Index pour la table `maladie`
--
ALTER TABLE `maladie`
  ADD PRIMARY KEY (`idMaladie`),
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
-- Index pour la table `membre_inscription_demande`
--
ALTER TABLE `membre_inscription_demande`
  ADD PRIMARY KEY (`idDemandeInscription`),
  ADD KEY `idx_membre_inscription_demande_utilisateur` (`idUtilisateur`,`statutDemande`);

--
-- Index pour la table `verset_programme`
--
ALTER TABLE `verset_programme`
  ADD PRIMARY KEY (`idVersetProgramme`),
  ADD UNIQUE KEY `idx_verset_programme_utilisateur_date` (`idUtilisateur`,`dateAffichage`);

--
-- Index pour la table `programme_eglise`
--
ALTER TABLE `programme_eglise`
  ADD PRIMARY KEY (`idProgramme`),
  ADD UNIQUE KEY `idx_programme_eglise_utilisateur_date` (`idUtilisateur`,`dateProgramme`);

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
-- AUTO_INCREMENT pour les tables exportees
--

--
-- AUTO_INCREMENT pour la table `cellule`
--
ALTER TABLE `cellule`
  MODIFY `idCellule` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=1;
--
-- AUTO_INCREMENT pour la table `comptabilite`
--
ALTER TABLE `comptabilite`
  MODIFY `idComptabilite` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=1;
--
-- AUTO_INCREMENT pour la table `culte`
--
ALTER TABLE `culte`
  MODIFY `idCulte` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=1;
--
-- AUTO_INCREMENT pour la table `deces`
--
ALTER TABLE `deces`
  MODIFY `idDeces` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=1;
--
-- AUTO_INCREMENT pour la table `departement`
--
ALTER TABLE `departement`
  MODIFY `idDepartement` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=1;
--
-- AUTO_INCREMENT pour la table `domaine_activite`
--
ALTER TABLE `domaine_activite`
  MODIFY `idDomaineActivite` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;
--
-- AUTO_INCREMENT pour la table `eglise`
--
ALTER TABLE `eglise`
  MODIFY `idEglise` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=1;
--
-- AUTO_INCREMENT pour la table `groupe`
--
ALTER TABLE `groupe`
  MODIFY `idGroupe` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=1;
--
-- AUTO_INCREMENT pour la table `maladie`
--
ALTER TABLE `maladie`
  MODIFY `idMaladie` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=1;
--
-- AUTO_INCREMENT pour la table `mariage`
--
ALTER TABLE `mariage`
  MODIFY `idMariage` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=1;
--
-- AUTO_INCREMENT pour la table `membre`
--
ALTER TABLE `membre`
  MODIFY `idMembre` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=1;
--
-- AUTO_INCREMENT pour la table `membre_inscription_demande`
--
ALTER TABLE `membre_inscription_demande`
  MODIFY `idDemandeInscription` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=1;
--
-- AUTO_INCREMENT pour la table `verset_programme`
--
ALTER TABLE `verset_programme`
  MODIFY `idVersetProgramme` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=1;
--
-- AUTO_INCREMENT pour la table `programme_eglise`
--
ALTER TABLE `programme_eglise`
  MODIFY `idProgramme` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=1;
--
-- AUTO_INCREMENT pour la table `naissance`
--
ALTER TABLE `naissance`
  MODIFY `idNaissance` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=1;
--
-- AUTO_INCREMENT pour la table `niveau_etude`
--
ALTER TABLE `niveau_etude`
  MODIFY `idNiveauEtude` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;
--
-- AUTO_INCREMENT pour la table `questions`
--
ALTER TABLE `questions`
  MODIFY `idQuestion` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=1;
--
-- AUTO_INCREMENT pour la table `responsabilite`
--
ALTER TABLE `responsabilite`
  MODIFY `idResponsabilite` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;
--
-- AUTO_INCREMENT pour la table `utilisateur`
--
ALTER TABLE `utilisateur`
  MODIFY `idUtilisateur` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=1;
--
-- Contraintes pour les tables exportees
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



-- --------------------------------------------------------

--
-- Structure de la table `galerie`
--

CREATE TABLE `galerie` (
  `idGalerie` int(11) NOT NULL,
  `titreGalerie` varchar(255) DEFAULT NULL,
  `typeEvenement` varchar(150) DEFAULT NULL,
  `dateEvenement` varchar(100) DEFAULT NULL,
  `lieuEvenement` varchar(255) DEFAULT NULL,
  `descriptionGalerie` text,
  `couvertureGalerie` varchar(255) DEFAULT NULL,
  `dossierGalerie` varchar(255) DEFAULT NULL,
  `dateCreation` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `idUtilisateur` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Structure de la table `galerie_image`
--

CREATE TABLE `galerie_image` (
  `idGalerieImage` int(11) NOT NULL,
  `idGalerie` int(11) NOT NULL,
  `nomFichier` varchar(255) DEFAULT NULL,
  `cheminImage` varchar(255) DEFAULT NULL,
  `tailleImage` int(11) DEFAULT NULL,
  `typeMime` varchar(120) DEFAULT NULL,
  `legendeImage` varchar(255) DEFAULT NULL,
  `dateAjout` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `idUtilisateur` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

ALTER TABLE `galerie`
  ADD PRIMARY KEY (`idGalerie`),
  ADD KEY `idUtilisateur` (`idUtilisateur`);

ALTER TABLE `galerie_image`
  ADD PRIMARY KEY (`idGalerieImage`),
  ADD KEY `idGalerie` (`idGalerie`),
  ADD KEY `idUtilisateur` (`idUtilisateur`);

CREATE TABLE IF NOT EXISTS agenda (
  idAgenda INTEGER PRIMARY KEY AUTOINCREMENT,
  titreAgenda TEXT NOT NULL,
  typeAgenda TEXT NOT NULL,
  dateAgenda TEXT,
  heureDebutAgenda TEXT,
  heureFinAgenda TEXT,
  lieuAgenda TEXT,
  descriptionAgenda TEXT,
  couleurAgenda TEXT DEFAULT '#0ea5e9',
  statutAgenda TEXT DEFAULT 'Programme',
  idUtilisateur INTEGER NOT NULL,
  dateCreation DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (idUtilisateur) REFERENCES utilisateur(idUtilisateur) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_agenda_utilisateur ON agenda (idUtilisateur);
CREATE INDEX IF NOT EXISTS idx_agenda_date ON agenda (dateAgenda);

