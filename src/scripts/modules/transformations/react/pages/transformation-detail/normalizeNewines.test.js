import normalizeNewlines from './normalizeNewlines';

describe('normalizeNewlines', function() {
  it('it should replace CRLF with LF', function() {
    expect('SELECT 1; \n SELECT 2;').toEqual(normalizeNewlines('SELECT 1; \r\n SELECT 2;'));
  });

  it('it should replace CR with LF', function() {
    expect('SELECT 1; \n SELECT 2;').toEqual(normalizeNewlines('SELECT 1; \r SELECT 2;'));
  });

  it('it should replace mixed CRLF and CR with LF', function() {
    expect('SELECT 1; \n SELECT 2; \n SELECT 3;').toEqual(normalizeNewlines('SELECT 1; \r\n SELECT 2; \r SELECT 3;'));
  });

  it('it should replace multiple CRLF with LF', function() {
    expect('SELECT 1; \n SELECT 2; \n SELECT 3;').toEqual(normalizeNewlines('SELECT 1; \r\n SELECT 2; \r\n SELECT 3;'));
  });

  it('it should replace multiple CR with LF', function() {
    expect('SELECT 1; \n SELECT 2; \n SELECT 3;').toEqual(normalizeNewlines('SELECT 1; \r SELECT 2; \r SELECT 3;'));
  });

  it('it should replace multiple mixed CRLF and CR with LF', function() {
    expect('SELECT 1; \n SELECT 2; \n SELECT 3; \n SELECT 4; \n SELECT 5;').toEqual(normalizeNewlines('SELECT 1; \r\n SELECT 2; \r SELECT 3; \r\n SELECT 4; \r SELECT 5;'));
  });

  it('it should not change value', function() {
    expect('SELECT 1; SELECT 2;').toEqual(normalizeNewlines('SELECT 1; SELECT 2;'));
  });
});
