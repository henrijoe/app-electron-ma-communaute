import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import PhoneIcon from '@mui/icons-material/Phone';

type ContactPhoneLinkProps = {
  fallback?: string;
  value?: string | null;
};

const normalizePhoneHref = (value: string) => value.replace(/[^\d+]/g, '');

export function ContactPhoneLink({ fallback = 'Non renseigne', value }: ContactPhoneLinkProps) {
  const phone = String(value || '').trim();

  if (!phone) {
    return (
      <Typography variant="body2" color="text.secondary">
        {fallback}
      </Typography>
    );
  }

  return (
    <Box
      component="a"
      href={`tel:${normalizePhoneHref(phone)}`}
      onClick={(event) => event.stopPropagation()}
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 0.5,
        color: 'success.main',
        fontSize: 13,
        fontWeight: 700,
        lineHeight: 1.5,
        textDecoration: 'none',
        overflowWrap: 'anywhere',
      }}
    >
      <PhoneIcon sx={{ fontSize: 15 }} />
      {phone}
    </Box>
  );
}

export default ContactPhoneLink;
