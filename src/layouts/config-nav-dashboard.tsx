import { Label } from 'src/components/label';
import { SvgColor } from 'src/components/svg-color';
import {
  Church as ChurchIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
// ----------------------------------------------------------------------

const icon = (name: string) => (
  <SvgColor width="100%" height="100%" src={`/assets/icons/navbar/${name}.svg`} />
);


export const navData = [
  {
    title: 'Dashboard',
    path: '/',
    icon: icon('ic-analytics'),
  },
  {
    title: 'Membre',
    path: '/user',
    icon: icon('ic-user'),
  },
  {
    title: 'Culte',
    path: '/culte',
    icon: (<ChurchIcon/>),
  },
  {
    title: 'Departement',
    path: '/departement',
    icon: (<PersonIcon/>),
  },
  // {
  //   title: 'Product',
  //   path: '/products',
  //   icon: icon('ic-cart'),
  //   info: (
  //     <Label color="error" variant="inverted">
  //       +3
  //     </Label>
  //   ),
  // },
  // {
  //   title: 'Blog',
  //   path: '/blog',
  //   icon: icon('ic-blog'),
  // },
  {
    title: 'Sign in',
    path: '/sign-in',
    icon: icon('ic-lock'),
  },
  {
    title: 'Not found',
    path: '/404',
    icon: icon('ic-disabled'),
  },
];
