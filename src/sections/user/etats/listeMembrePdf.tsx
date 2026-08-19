import React from 'react';
import { useSelector } from 'react-redux';

import { Box, Stack, Typography, GlobalStyles } from '@mui/material';

import { normalizeText } from 'src/utils/text';
import { buildChurchLogoUrl } from 'src/utils/apiClient';
import { resolveStaticAssetUrl } from 'src/utils/asset-url';

import { getPhotoUrl } from '../utils';
import { formaterValueLabels } from '../view/filterbyIndice';
import { dataResponsabilite } from '../../../store/membreSlice';

import type { IReduxState } from '../../../store/store';

// pageStyle a fournir a <ReactToPrint> (impression navigateur, hors application desktop)
// pour l'action "Liste des membres". A utiliser à la place de PRINT_LANDSCAPE_PAGE_STYLE.
//
// Pourquoi une regle "@page" nommee et pas juste "@page { size: A4 landscape }" ?
// react-to-print (avec copyStyles, actif par defaut) recopie TOUTES les balises
// <style> du document principal dans l'iframe d'impression, une fois le pageStyle
// deja injecte. Or printEtats.tsx garde en permanence 4 documents imprimables
// montes en meme temps (juste caches), et chacun declare sa propre regle "@page"
// generique via GlobalStyles (ex. FicheInscriptionMembre en @page portrait). Ces
// regles generiques sont clonees APRES la notre et gagnent donc la cascade CSS
// (a specificite egale, la derniere regle l'emporte) : le document imprime se
// retrouvait toujours en portrait, quel que soit le document reellement cible.
// Une regle "@page" NOMMEE, associee explicitement a la racine du document via la
// propriete CSS "page", a une priorite superieure a n'importe quelle regle "@page"
// generique/anonyme : elle reste donc fiable quel que soit l'ordre de clonage.

export const MEMBER_LIST_PRINT_PAGE_STYLE = `
@page memberListLandscape {
  size: A4 landscape;
  margin: 5mm;
}

.member-list-print-root {
  page: memberListLandscape;
}

@media print {
  html, body {
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
}
`;

// Sous-ensemble des informations d'identite de l'eglise utilisees dans l'entete imprimable.
type PrintIdentity = {
  logoEglise?: string;
  logoUtilisateur?: string;
  nomTemple?: string;
  nomEgliseCourt?: string;
  lieuEglise?: string;
  telephoneSecretariatEglise?: string;
  emailEglise?: string;
};

// Determine l'URL du logo a afficher dans l'entete.
// Meme logique que les fiches de renseignement (ficheInscriptionMembre / blank-organisation-form)
// afin de garder un rendu identique entre tous les documents imprimables.
const getLogoUrl = (identity: PrintIdentity): string | null => {
  const logoPath = identity.logoEglise || identity.logoUtilisateur;

  // Aucun logo renseigne : on affichera le badge "MC" a la place.
  if (!logoPath) return null;
  // Le logo est deja une URL exploitable telle quelle (http, data, blob ou fichier local).
  if (/^(https?:|data:|blob:|file:)/i.test(logoPath)) return logoPath;
  // Logo specifique a l'eglise : on passe par le builder d'URL dedie.
  if (identity.logoEglise && logoPath === identity.logoEglise) return buildChurchLogoUrl(logoPath);

  // Sinon il s'agit d'un asset local classique (logo utilisateur).
  return resolveStaticAssetUrl(logoPath);
};

// Concatene les valeurs non vides avec un separateur, pour construire la ligne de contact du pied de page.
const joinValues = (...values: Array<string | undefined>): string =>
  values
    .map((value) => String(value || '').trim())
    .filter(Boolean)
    .join(' - ');

// Styles inline reutilises par les cellules du tableau (equivalent d'un CSS classique en JS).
// "overflow: hidden" + "wordBreak" evitent qu'un mot long (ex. "Responsabilité",
// "Département") ne deborde visuellement sur la cellule voisine si la colonne
// calculee est plus etroite que prevu (table-layout: fixed ne force pas ca tout seul :
// par defaut une cellule laisse son contenu deborder au lieu de le couper).
const thStyle: React.CSSProperties = {
  border: "1px solid #000",
  padding: "8px",
  textAlign: "center",
  fontWeight: "bold",
  background: "#f2f2f2",
  overflow: "hidden",
  wordBreak: "break-word",
};

const tdStyle: React.CSSProperties = {
  border: "1px solid #000",
  padding: "6px",
  verticalAlign: "middle",
  overflow: "hidden",
  wordBreak: "break-word",
};

const tdCenter: React.CSSProperties = {
  ...tdStyle,
  textAlign: "center",
};

const formatContact = (contact: string) => {
  if (!contact) {
    return 'Non spécifié';
  }

  const cleanedContact = contact.replace(/\D/g, '');

  if (cleanedContact.length === 10) {
    return cleanedContact.replace(/(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/, '$1 $2 $3 $4 $5');
  }

  return contact;
};

const getBaptemeDisplay = (value: string | number | null | undefined) => {
  if (value === null || value === undefined || value === '') {
    return { color: 'default' as const, label: 'Non renseigné' };
  }

  const normalizedValue = String(value).trim();

  if (normalizedValue === '1') {
    return { color: 'success' as const, label: 'Oui' };
  }

  if (normalizedValue === '0' || normalizedValue === '2') {
    return { color: 'default' as const, label: 'Non' };
  }

  return {
    color: normalizedValue.toLowerCase() === 'oui' ? ('success' as const) : ('default' as const),
    label: normalizeText(normalizedValue) || 'Non renseigné',
  };
};


//
export const ListeDesMembres = () => {

  // Donnees brutes recuperees depuis le store Redux.
  const listMembre = useSelector((state: IReduxState) => state.membre.listMembre);
  const dataFilterDepartement = useSelector((state: IReduxState) => state.departement.dataFilterDepartement);
  const dataFilterCellule = useSelector((state: IReduxState) => state.cellule.dataFilterCellule);
  // Informations d'identite de l'eglise (logo, nom, coordonnees) utilisees dans l'entete/pied de page.
  const userConnected = useSelector((state: IReduxState) => state.application.userConnected);
  const utilisateurData = useSelector((state: IReduxState) => state.authentification.utilisateurData);

  // On fusionne les deux sources d'identite : userConnected est prioritaire sur utilisateurData.
  const identity: PrintIdentity = {
    ...(utilisateurData || {}),
    ...(userConnected || {}),
  };
  const logoUrl = getLogoUrl(identity);
  // Ligne de contact affichee dans le pied de page (lieu, telephone, email).
  const contactLine = joinValues(
    identity.lieuEglise,
    identity.telephoneSecretariatEglise,
    identity.emailEglise
  );

  // Correspondances id -> libelle pour afficher des noms lisibles au lieu des identifiants numeriques.
  const dataDepartement = formaterValueLabels(
    dataFilterDepartement,
    'idDepartement',
    'libelleCourtDepartement'
  );
  const dataCellule = formaterValueLabels(dataFilterCellule, 'idCellule', 'nomCellule');

  const getMembreResponsabilite = (id: number) => {
    const responsabilite = dataResponsabilite?.find((item) => item.value === id);
    return responsabilite?.label || 'Non spécifiée';
  };

  const getMembreDepartement = (id: number) => {
    const departement = dataDepartement?.find((item: any) => item.value === id);
    return departement?.label || 'Non spécifié';
  };

  const getMembreCellule = (id: number) => {
    const cellule = dataCellule?.find((item: any) => item.value === id);
    return cellule?.label || 'Non spécifiée';
  };

  return (
    <>
      {/*
        GlobalStyles injecte une vraie balise <style> dans le <head> du document.
        C'est indispensable pour l'impression/l'export PDF depuis l'application desktop
        (Electron) : celle-ci recopie les styles presents dans le <head> au moment de
        l'impression, contrairement au style "pageStyle" de react-to-print (qui, lui,
        ne sert que pour l'impression via le navigateur web).
        La regle @page force le format A4 en PAYSAGE (par defaut le navigateur imprime
        en portrait) avec une marge de 5mm sur les 4 cotes.
      */}
      <GlobalStyles
        styles={{
          '@page': {
            size: 'A4 landscape',
            margin: '5mm',
          },
          '@media print': {
            'html, body': {
              WebkitPrintColorAdjust: 'exact',
              printColorAdjust: 'exact',
            },
            '.member-list-print-root': {
              boxShadow: 'none !important',
              paddingBottom: '10mm',
            },
            // Le pied de page reste colle en bas de la feuille et se repete sur
            // chaque page si la liste des membres deborde sur plusieurs pages.
            '.member-list-print-footer': {
              position: 'fixed',
              left: '5mm',
              right: '5mm',
              bottom: '5mm',
              background: '#ffffff',
            },
          },
        }}
      />

      {/*
        Largeur de la feuille A4 paysage (297mm) moins les marges de la page (5mm de
        chaque cote) et une petite marge de securite, comme pour les autres etats
        imprimes en paysage (voir PrintDocumentLayout).

        Cette largeur reste volontairement IDENTIQUE a l'ecran et a l'impression
        (pas de "width: 100%" sous "@media print") : une unite absolue comme "mm" a
        une taille fixe, contrairement a un pourcentage qui depend de la largeur
        resolue du conteneur parent au moment de l'impression. Avec une regle "@page"
        NOMMEE (voir MEMBER_LIST_PRINT_PAGE_STYLE), certains moteurs de rendu
        calculent cette largeur de reference de facon peu fiable, ce qui provoquait
        un tableau trop etroit et du texte qui debordait d'une colonne a l'autre.
      */}
      <Box
        className="member-list-print-root"
        sx={{
          width: '281mm',
          mx: 'auto',
          bgcolor: '#ffffff',
          color: '#101828',
          fontFamily: '"Barlow", "DM Sans", Arial, sans-serif',
          border: '1px solid #e4e7ec',
          boxShadow: '0 18px 50px rgba(15, 23, 42, 0.16)',
          '@media print': {
            border: 0,
            boxShadow: 'none',
          },
        }}
      >
        {/*
          Entete sombre identique a celle des fiches de renseignement
          (ficheInscriptionMembre.tsx / blank-organisation-form.tsx) : logo de
          l'eglise a gauche, nom court de l'eglise puis titre du document.
        */}
        <Box sx={{ bgcolor: '#020617', color: '#ffffff', px: 1, py: 1.2 }}>
          <Stack direction="row" alignItems="center" spacing={1.2}>
            {/* Pastille logo : affiche l'image si elle existe, sinon un badge "MC" par defaut. */}
            <Box
              sx={{
                width: 38,
                height: 38,
                borderRadius: 1.1,
                bgcolor: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                p: 0.4,
                flexShrink: 0,
              }}
            >
              {logoUrl ? (
                <Box
                  component="img"
                  src={logoUrl}
                  alt="Logo eglise"
                  sx={{ width: '100%', height: '100%', objectFit: 'contain' }}
                />
              ) : (
                <Typography sx={{ color: '#0f172a', fontWeight: 900 }}>MC</Typography>
              )}
            </Box>

            <Box sx={{ minWidth: 0 }}>
              <Typography sx={{ fontSize: 9.5, letterSpacing: 1.1, textTransform: 'uppercase' }}>
                {identity.nomEgliseCourt || identity.nomTemple || 'Ma Communaute'}
              </Typography>
              <Typography sx={{ fontSize: 17, fontWeight: 900, lineHeight: 1 }}>
                Liste des membres

              </Typography>
            </Box>
          </Stack>
        </Box>

        {/* Corps du document : tableau HTML natif (plus simple a maitriser en impression que les composants MUI Table). */}
        <Box sx={{ px: 1.6, pt: 1.6, pb: 1.6 }}>
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            // Largeurs de colonnes fixees en % (voir width sur chaque <th> ci-dessous)
            // plutot que calculees automatiquement, pour un rendu stable a l'impression.
            tableLayout: "fixed",
          }}
        >
          <thead>
            {/* En-tete des colonnes. */}
            <tr style={{ backgroundColor: "#f5f5f5" }}>
              <th style={{ ...thStyle, width: "4%" }}>
                N°
              </th>

              <th style={{ ...thStyle, width: "10%" }}>
                Photo
              </th>

              <th style={{ ...thStyle, width: "22%" }}>
                Nom et prénoms
              </th>

              <th style={{ ...thStyle, width: "14%" }}>
                Résidence
              </th>

              <th style={{ ...thStyle, width: "14%" }}>
                Responsabilité
              </th>

              <th style={{ ...thStyle, width: "8%" }}>
                Baptisé(e)
              </th>

              <th style={{ ...thStyle, width: "14%" }}>
                Département
              </th>

              <th style={{ ...thStyle, width: "14%" }}>
                Cellule
              </th>

              {/* <th style={{ ...thStyle, width: "10%" }}>
                Contact
              </th> */}
            </tr>
          </thead>

          <tbody>
            {/* Une ligne par membre de la liste filtree/chargee dans le store. */}
            {listMembre.map((item: any, index: number) => {
              const baptemeDisplay = getBaptemeDisplay(item.baptemeEauMembre);
              const photoUrl = getPhotoUrl(item.photoMembre);

              return (
                <tr key={item.idMembre ?? index}>
                  <td style={tdCenter}>
                    <strong>{index + 1}</strong>
                  </td>

                  <td style={tdCenter}>
                    {/* Photo du membre si disponible, sinon initiales du nom/prenom en guise d'avatar. */}
                    {photoUrl ? (
                      <img
                        src={photoUrl}
                        alt=""
                        style={{
                          width: 40,
                          height: 40,
                          borderRadius: "50%",
                          objectFit: "cover",
                        }}
                      />
                    ) : (
                      <div
                        style={{
                          width: 40,
                          height: 40,
                          borderRadius: "50%",
                          background: "#ddd",
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                          margin: "auto",
                          fontWeight: 700,
                        }}
                      >
                        {`${item.nomMembre?.charAt(0) || ""}${item.prenomMembre?.charAt(0) || ""}`}
                      </div>
                    )}
                  </td>

                  <td style={tdStyle}>
                    <div style={{ fontWeight: 700 }}>
                      {normalizeText(
                        `${item.nomMembre || ""} ${item.prenomMembre || ""}`.trim()
                      )}
                    </div>

                    <div
                      style={{
                        fontSize: "13px",
                        color: "#666",
                        marginTop: 2,
                        wordBreak: "break-word",
                      }}>
                      {formatContact(item.contactMembre)}
                    </div>
                  </td>

                  <td style={tdStyle}>
                    {normalizeText(item.residenceMembre)}
                  </td>

                  <td style={tdStyle}>
                    {normalizeText(getMembreResponsabilite(item.idResponsabilite))}
                  </td>

                  <td style={tdCenter}>
                    <strong>{baptemeDisplay.label}</strong>
                  </td>

                  <td style={tdStyle}>
                    {normalizeText(getMembreDepartement(item.idDepartement))}
                  </td>

                  <td style={tdStyle}>
                    {normalizeText(getMembreCellule(item.idCellule))}
                  </td>

                  {/* <td
                    style={{
                      ...tdStyle,
                      fontFamily: "monospace",
                      fontWeight: 700,
                    }}
                  >
                    {formatContact(item.contactMembre)}
                  </td> */}
                </tr>
              );
            })}
          </tbody>

        </table>
        </Box>

        {/* Pied de page : coordonnees de l'eglise, ou mention par defaut si rien n'est renseigne. */}
        <Box className="member-list-print-footer" sx={{ px: 1.6, pb: 1, mt: 2 }}>
          <Typography sx={{ color: '#667085', fontSize: 10 }}>
            {contactLine || "Document interne de l'église"}
          </Typography>
        </Box>
      </Box>
    </>
  );
};
