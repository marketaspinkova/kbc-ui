import { Map } from 'immutable';

export default function(datatype) {
  var str;
  if (!Map.isMap(datatype)) {
    return datatype;
  }
  str = datatype.get('type');
  if (datatype.get('length') !== null && datatype.get('length', '') !== '') {
    str += '(' + datatype.get('length') + ')';
  }
  if (datatype.get('compression') !== null && datatype.get('compression', '') !== '') {
    str += ' ENCODE ' + datatype.get('compression');
  }
  return str;
}
