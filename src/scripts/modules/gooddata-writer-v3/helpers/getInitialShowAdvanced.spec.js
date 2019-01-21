import getInitialShowAdvanced from './getInitialShowAdvanced';

describe('get initial show advanced test', () => {
  it('should test empty columns case', () => {
    expect(true).toEqual(!getInitialShowAdvanced([]));
  });

  it('should test nonempty columns case and return false', () => {
    const columns = [
      {bar: 'identifier'},
      {a: 1}
    ];
    expect(true).toEqual(!getInitialShowAdvanced(columns));
  });

  it('should test nonempty columns case and return true', () => {
    const columns = [
      {identifier: 'foo'},
      {identifierLabel: 'bar'},
      {identifierSortLabel: 'foo bar'},
      {a: 1}
    ];
    expect(true).toEqual(getInitialShowAdvanced(columns));
  });
});
