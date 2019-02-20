import makeColumnDefinition from './makeColumnDefinition';
import {Types} from './constants';

describe('makeColumnDefinition', () => {
  it('test type STRING setup', () => {
    const definition = makeColumnDefinition({
      name: 'id',
      dbName: 'id',
      type: Types.STRING
    });
    expect(definition.fields.dbName).toEqual({
      show: true,
      defaultValue: 'id'
    });
    expect(definition.fields.type).toEqual({
      show: true,
      defaultValue: Types.IGNORE
    });
  });

  it('test type IGNORE setup', () => {
    const definition = makeColumnDefinition({
      name: 'id',
      dbName: 'id',
      type: Types.IGNORE
    });
    expect(definition.fields.dbName).toEqual({
      show: false,
      defaultValue: 'id'
    });
    expect(definition.fields.type).toEqual({
      show: true,
      defaultValue: Types.IGNORE
    });
  });
});
