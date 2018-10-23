import moment from 'moment';

export default {
  format(date, format = 'YYYY-MM-DD HH:mm:ss') {
    return moment(date).format(format);
  }
};
