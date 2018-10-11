import makeColumnDefinition from './makeColumnDefinition';
import {Types, DataTypes} from './Constants';
import assert from 'assert';

describe('makeColumnDefinition', () => {
  it('test empty connection point setup', () => {
    const definition = makeColumnDefinition({
      id: 'id',
      type: Types.CONNECTION_POINT
    });
    assert.deepEqual(definition.fields.type, {
      show: true,
      invalidReason: false,
      defaultValue: 'IGNORE'
    });
    assert.deepEqual(definition.fields.title, {
      show: true,
      invalidReason: 'GoodData Title can not be empty',
      defaultValue: 'id'
    });
    assert.deepEqual(definition.fields.dataType, {
      show: true
    });
  });

  it('test data type VARCHAR setup', () => {
    const definition = makeColumnDefinition({
      id: 'id',
      title: 'attribute',
      type: Types.ATTRIBUTE,
      dataType: DataTypes.VARCHAR,
      dataTypeSize: '255'
    });

    assert.deepEqual(definition.fields.type, {
      show: true,
      invalidReason: false,
      defaultValue: 'IGNORE'
    });
    assert.deepEqual(definition.fields.title, {
      show: true,
      invalidReason: false,
      defaultValue: 'id'
    });
    assert.deepEqual(definition.fields.dataType, {
      show: true
    });
    delete definition.fields.dataTypeSize.onChange;
    assert.deepEqual(definition.fields.dataTypeSize, {
      show: true,
      invalidReason: false,
      defaultValue: '255'
    });
    assert.deepEqual(definition.fields.identifier, {
      show: true
    });
    assert.deepEqual(definition.fields.identifierLabel, {
      show: true
    });
    assert.deepEqual(definition.fields.identifierSortLabel, {
      show: true
    });
  });

  it('test dateDimension setup', () => {
    const definition = makeColumnDefinition({
      id: 'date',
      type: Types.DATE,
      title: 'datum',
      dateDimension: 'dimenze'
    });
    assert.deepEqual(definition.fields.type, {
      show: true,
      invalidReason: false,
      defaultValue: 'IGNORE'
    });
    assert.deepEqual(definition.fields.title, {
      show: false,
      invalidReason: false,
      defaultValue: 'date'
    });
    assert.deepEqual(definition.fields.dateDimension, {
      show: true,
      invalidReason: false
    });
    assert.deepEqual(definition.fields.format, {
      show: true,
      invalidReason: 'Date format can not be empty',
      defaultValue: 'yyyy-MM-dd HH:mm:ss'
    });
  });


  it('test schema reference setup', () => {
    const definition = makeColumnDefinition({
      id: 'reference',
      type: Types.REFERENCE,
      schemaReference: 'tableId'
    });
    assert.deepEqual(definition.fields.type, {
      show: true,
      invalidReason: false,
      defaultValue: 'IGNORE'
    });
    assert.deepEqual(definition.fields.schemaReference, {
      show: true
    });
  });
});
