import moment from 'moment';

export const format = (date, scheme = 'YYYY-MM-DD HH:mm:ss') => {
  return moment(date).format(scheme);
};

export default {
  format
};
