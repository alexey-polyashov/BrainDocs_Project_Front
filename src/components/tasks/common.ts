export const colors = {
  green: '#008109',
  orange: '#cbae1f',
  blue: 'blue',
  red: '#c93030',
  gray: 'gray',
  default: 'auto',
};

type ColorInfo = {
  [p: number]: {
    type: string;
    color: string;
    iconName: string;
  };
};

export const executorStatusColors: ColorInfo = {
  3: {
    type: 'success',
    color: colors.green,
    iconName: 'check_circle_outline',
  },
  2: {
    type: 'warning',
    color: colors.orange,
    iconName: 'error_outline',
  },
  4: {
    type: 'danger',
    color: colors.red,
    iconName: 'highlight_off',
  },
  1: {
    type: 'warning',
    color: colors.orange,
    iconName: 'error_outline',
  },
};

export const executorResultColors: ColorInfo = {
  1: {
    type: 'success',
    color: '#57b95e',
    iconName: 'check_circle_outline',
  },
  2: {
    type: 'warning',
    color: '#d9b76b',
    iconName: 'error_outline',
  },
  3: {
    type: 'danger',
    color: '#d55454',
    iconName: 'highlight_off',
  },
  4: {
    type: '',
    color: 'auto',
    iconName: 'check_circle_outline',
  },
};

export const taskStatusColors: ColorInfo = {
  3: {
    type: 'info',
    color: colors.gray,
    iconName: 'check_circle_outline',
  },
  2: {
    type: 'success',
    color: colors.green,
    iconName: 'error_outline',
  },
  1: {
    type: 'warning',
    color: colors.blue,
    iconName: 'error_outline',
  },
};
