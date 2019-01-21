import makeColumnDefinition from './makeColumnDefinition';
import { Types, DataTypes } from '../constants';

describe('makeColumnDefinition', () => {
  it('test empty connection point setup', () => {
    const definition = makeColumnDefinition({
      id: 'id',
      type: Types.CONNECTION_POINT
    });
    expect(definition.fields.type).toEqual({
      show: true,
      invalidReason: false,
      defaultValue: 'IGNORE'
    });
    expect(definition.fields.title).toEqual({
      show: true,
      invalidReason: 'GoodData Title can not be empty',
      defaultValue: 'id'
    });
    expect(definition.fields.dataType).toEqual({
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

    expect(definition.fields.type).toEqual({
      show: true,
      invalidReason: false,
      defaultValue: 'IGNORE'
    });
    expect(definition.fields.title).toEqual({
      show: true,
      invalidReason: false,
      defaultValue: 'id'
    });
    expect(definition.fields.dataType).toEqual({
      show: true
    });
    delete definition.fields.dataTypeSize.onChange;
    expect(definition.fields.dataTypeSize).toEqual({
      show: true,
      invalidReason: false,
      defaultValue: '255'
    });
    expect(definition.fields.identifier).toEqual({
      show: true
    });
    expect(definition.fields.identifierLabel).toEqual({
      show: true
    });
    expect(definition.fields.identifierSortLabel).toEqual({
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
    expect(definition.fields.type).toEqual({
      show: true,
      invalidReason: false,
      defaultValue: 'IGNORE'
    });
    expect(definition.fields.title).toEqual({
      show: false,
      invalidReason: false,
      defaultValue: 'date'
    });
    expect(definition.fields.dateDimension).toEqual({
      show: true,
      invalidReason: false
    });
    expect(definition.fields.format).toEqual({
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
    expect(definition.fields.type).toEqual({
      show: true,
      invalidReason: false,
      defaultValue: 'IGNORE'
    });
    expect(definition.fields.schemaReference).toEqual({
      show: true
    });
  });
});
