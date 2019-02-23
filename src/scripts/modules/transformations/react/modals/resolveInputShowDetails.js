import { Map } from 'immutable';
import { getTableInitialDataTypes } from '../components/mapping/InputMappingRowSnowflakeEditorHelper';

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
 * @param {Object} tables Map tables
 * @return {boolean} Show details
 */
function snowflake(mapping, tables) {
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
    const sourceTable = tables.find(table => table.get('id') === mapping.get('source'), null, Map());
    return !mapping.get('datatypes').equals(getTableInitialDataTypes(sourceTable));
  }

  return false;
}

/**
 * Docker advanced columns
 * @param {Object} mapping Map mapping
 * @return {boolean} Show details
 */
function docker(mapping) {
  if (mapping.has('columns') && mapping.get('columns').count() > 0) {
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

export default function(backend, type, mapping, tables) {
  if (backend === 'redshift' && type === 'simple') {
    return redshift(mapping);
  } else if (backend === 'docker') {
    return docker(mapping);
  } else if (backend === 'snowflake') {
    return snowflake(mapping, tables);
  } else {
    return false;
  }
}
