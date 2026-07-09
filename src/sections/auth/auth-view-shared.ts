export const authTextFieldSx = {
  '& .MuiInputLabel-root': {
    color: 'rgba(226, 232, 240, 0.88)',
    fontSize: 13,
    fontWeight: 600,
  },
  '& .MuiInputLabel-root.Mui-focused': {
    color: '#bfdbfe',
  },
  '& .MuiFormHelperText-root': {
    mx: 0,
    mt: 1,
    color: 'rgba(191, 219, 254, 0.82)',
  },
  '& .MuiFormHelperText-root.Mui-error': {
    color: '#fca5a5',
  },
  '& .MuiOutlinedInput-root': {
    borderRadius: 2,
    bgcolor: 'rgba(15, 23, 42, 0.78)',
    color: '#f8fafc',
    transition: 'all 0.2s ease',
    '& fieldset': {
      borderColor: 'rgba(148, 163, 184, 0.26)',
    },
    '&:hover fieldset': {
      borderColor: 'rgba(96, 165, 250, 0.55)',
    },
    '&.Mui-focused': {
      boxShadow: '0 0 0 4px rgba(96, 165, 250, 0.14)',
    },
    '&.Mui-focused fieldset': {
      borderColor: '#60a5fa',
    },
    '&.Mui-error fieldset': {
      borderColor: '#f87171',
    },
  },
  '& .MuiInputBase-input': {
    color: '#f8fafc',
    '&::placeholder': {
      color: 'rgba(203, 213, 225, 0.72)',
      opacity: 1,
    },
  },
  '& .MuiInputAdornment-root': {
    color: 'rgba(191, 219, 254, 0.78)',
  },
};

export const authPrimaryButtonSx = {
  mt: 1,
  py: 1.7,
  borderRadius: 2,
  bgcolor: '#4361ee',
  color: 'common.white',
  fontWeight: 700,
  boxShadow: '0 18px 34px rgba(67, 97, 238, 0.28)',
  '&:hover': {
    bgcolor: '#3451cc',
    boxShadow: '0 20px 36px rgba(52, 81, 204, 0.34)',
  },
};

export const authTitleSx = {
  fontSize: { xs: 20, md: 25 },
  mb: 1.5,
  color: '#f8fafc',
  fontWeight: 800,
};

export const authBodyTextSx = {
  maxWidth: 460,
  color: 'rgba(226, 232, 240, 0.9)',
};

export const authLinkSx = {
  color: '#60a5fa',
  fontWeight: 700,
  textDecoration: 'none',
  '&:hover': {
    color: '#93c5fd',
    textDecoration: 'underline',
  },
};

export const authMutedTextSx = {
  color: 'rgba(203, 213, 225, 0.88)',
};

export const authInfoAlertSx = {
  bgcolor: 'rgba(59, 130, 246, 0.12)',
  color: '#dbeafe',
  border: '1px solid rgba(96, 165, 250, 0.24)',
  '& .MuiAlert-icon': {
    color: '#93c5fd',
  },
};

export const authWarningAlertSx = {
  bgcolor: 'rgba(245, 158, 11, 0.12)',
  color: '#fef3c7',
  border: '1px solid rgba(251, 191, 36, 0.24)',
  '& .MuiAlert-icon': {
    color: '#fcd34d',
  },
};
