import { getInitialDataTypes } from '../components/mapping/InputMappingRowSnowflakeEditorHelper';

/**
 * Mysql advanced columns
 * @param {Object} mapping Map mapping
 * @return {boolean} Show details
 */
function mysql(mapping) {
  if (mapping.has('columns') && mapping.get('columns').count() > 0) {
    return true;
  }

  if (mapping.has('datatypes') && mapping.get('datatypes').size > 0) {
    return true;
  }

  if (mapping.has('indexes') && mapping.get('indexes').size > 0) {
    return true;
  }

  if (mapping.get('optional')) {
    return true;
  }

  if (mapping.get('whereColumn')) {
    return true;
  }

  if (mapping.get('days') > 0) {
    return true;
  }

  if (mapping.get('changedSince')) {
    return true;
  }

  if (mapping.has('whereValues') && mapping.get('whereValues').size > 0) {
    return true;
  }
  return false;
}

/**
 * Redshift advanced columns
 * @param {Object} mapping Map mapping
 * @return {boolean} Show details
 */
function redshift(mapping) {
  if (mapping.has('columns') && mapping.get('columns').count() > 0) {
    return true;
  }

  if (mapping.has('datatypes') && mapping.get('datatypes').size > 0) {
    return true;
  }

  if (mapping.get('days') > 0) {
    return true;
  }

  if (mapping.get('changedSince')) {
    return true;
  }

  if (mapping.get('distStyle')) {
    return true;
  }

  if (mapping.get('optional')) {
    return true;
  }

  if (mapping.get('sortKey')) {
    return true;
  }

  if (mapping.get('whereColumn')) {
    return true;
  }

  if (mapping.has('whereValues') && mapping.get('whereValues').size > 0) {
    return true;
  }
  return false;
}


/**
 * Redshift advanced columns
 * @param {Object} mapping Map mapping
 * @return {boolean} Show details
 */
function snowflake(mapping) {
  if (mapping.has('columns') && mapping.get('columns').count() > 0) {
    return true;
  }

  if (mapping.get('days') > 0) {
    return true;
  }

  if (mapping.get('changedSince')) {
    return true;
  }

  if (mapping.get('whereColumn')) {
    return true;
  }

  if (mapping.has('whereValues') && mapping.get('whereValues').size > 0) {
    return true;
  }

  if (mapping.has('datatypes') && mapping.get('datatypes').size > 0) {
    return !mapping.get('datatypes').equals(getInitialDataTypes(mapping.get('source')));
  }

  return false;
}

/**
 * Docker advanced columns
 * @param {Object} mapping Map mapping
 * @return {boolean} Show details
 */
function docker(mapping) {
  return mysql(mapping);
}

export default function(backend, type, mapping) {
  if (backend === 'mysql' && type === 'simple') {
    return mysql(mapping);
  } else if (backend === 'redshift' && type === 'simple') {
    return redshift(mapping);
  } else if (backend === 'docker') {
    return docker(mapping);
  } else if (backend === 'snowflake') {
    return snowflake(mapping);
  } else {
    return false;
  }
}
