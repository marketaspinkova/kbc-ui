var assert = require('assert');

import { replaceTemplateVariables } from "./helpers";

describe('HttpError extens Error', () => {
  it('should replace one variable', () => {
    assert.deepEqual(
      replaceTemplateVariables({
        name: 'some value and {{VARIABLE}}'
      }, {
        'VARIABLE': 'another value'
      }),
      {
        name: 'some value and another value'
      }
    );
  });

  it('should replace same variable two times', () => {
    assert.deepEqual(
      replaceTemplateVariables({
        name: 'some value and {{VARIABLE}}',
        anotherName: 'some value and {{VARIABLE}}'
      }, {
        'VARIABLE': 'another value'
      }),
      {
        name: 'some value and another value',
        anotherName: 'some value and another value'
      }
    );
  });

  it('should replace more variables multiple times', () => {
    assert.deepEqual(
      replaceTemplateVariables({
        name: 'some value and {{VARIABLE-1}}',
        anotherName: 'some value and {{VARIABLE-2}}',
        first: 'some value and {{VARIABLE-1}}',
        second: 'some value and {{VARIABLE-2}}'
      }, {
        'VARIABLE-1': 'another value',
        'VARIABLE-2': 'another value',
      }),
      {
        name: 'some value and another value',
        anotherName: 'some value and another value',
        first: 'some value and another value',
        second: 'some value and another value'
      }
    );
  });
});
