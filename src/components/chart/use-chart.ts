import { useTheme } from '@mui/material/styles';

import type { ChartOptions } from './types';

// ----------------------------------------------------------------------

export function useChart(options?: ChartOptions): ChartOptions {
  const theme = useTheme();

  return {
    ...options,
    chart: {
      toolbar: { show: false },
      zoom: { enabled: false },
      foreColor: theme.vars.palette.text.disabled,
      fontFamily: theme.typography.fontFamily,
      ...options?.chart,
    },
    colors: options?.colors ?? [
      theme.palette.primary.main,
      theme.palette.warning.main,
      theme.palette.info.main,
      theme.palette.error.main,
      theme.palette.success.main,
    ],
    stroke: {
      curve: 'smooth',
      lineCap: 'round',
      width: 2.5,
      ...options?.stroke,
    },
    grid: {
      borderColor: theme.vars.palette.divider,
      strokeDashArray: 3,
      ...options?.grid,
    },
    xaxis: {
      axisBorder: { show: false },
      axisTicks: { show: false },
      ...options?.xaxis,
    },
    yaxis: {
      tickAmount: 5,
      ...options?.yaxis,
    },
    legend: {
      show: false,
      position: 'top',
      horizontalAlign: 'right',
      ...options?.legend,
    },
    tooltip: {
      fillSeriesColor: false,
      theme: 'light',
      ...options?.tooltip,
    },
    plotOptions: {
      ...options?.plotOptions,
      bar: {
        borderRadius: 4,
        columnWidth: '48%',
        ...options?.plotOptions?.bar,
      },
    },
  };
}

