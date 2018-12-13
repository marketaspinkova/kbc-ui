import React from 'react';
import assert from 'assert';
import formatCardinalNumber from './formatCardinalNumber';
import {NotAvailable} from '@keboola/indigo-ui';

describe('formatCardinalNumber', () =>{
  describe('invalid input', () => {
    it('null should return N/A', () => assert.equal(formatCardinalNumber(null), <NotAvailable/>));
    it('empty string should return N/A', () => assert.equal(formatCardinalNumber(''), <NotAvailable/>));
    it('invalid number should return N/A', () => assert.equal(formatCardinalNumber('asdafa'), <NotAvailable/>));
  });

  describe('valid string input', () => {
    it('0 should return 0', () => assert.equal(formatCardinalNumber('0'), '0'));
    it('1 should return 1', () => assert.equal(formatCardinalNumber('1'), '1'));
    it('100 should return 100', () => assert.equal(formatCardinalNumber('100'), '100'));
    it('1234 should return 1,234', () => assert.equal(formatCardinalNumber('1234'), '1,234'));
    it('1234567 should return 1,234,567', () => assert.equal(formatCardinalNumber('1234567'), '1,234,567'));
  });

  describe('valid integer input', () => {
    it('0 should return 0', () => assert.equal(formatCardinalNumber(0), '0'));
    it('1 should return 1', () => assert.equal(formatCardinalNumber(1), '1'));
    it('100 should return 100', () => assert.equal(formatCardinalNumber(100), '100'));
    it('1234 should return 1,234', () => assert.equal(formatCardinalNumber(1234), '1,234'));
    it('1234567 should return 1,234,567', () => assert.equal(formatCardinalNumber(1234567), '1,234,567'));
  });
});
