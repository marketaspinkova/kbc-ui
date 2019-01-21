import matchByWords from './matchByWords';

describe('test matchByWords', () => {
  it('should match empty query', () => {
    expect(true).toEqual(matchByWords(' some input string with spaces  ', ''));
    expect(true).toEqual(matchByWords('someinputstringwithoutspace', ''));
    expect(true).toEqual(matchByWords('', ''));
  });

  it('should strict match one word query', () => {
    expect(true).toEqual(matchByWords('some input param string', 'param'));
    expect(true).toEqual(matchByWords('some input param string', 'param  '));
    expect(true).toEqual(matchByWords('some input param string', ' param  '));
  });

  it('should not fuzzy match word', () => {
    expect(false).toEqual(matchByWords('some input param string', 'taram'));
    expect(false).toEqual(matchByWords('some input param string', 'taram  '));
    expect(false).toEqual(matchByWords('some input param string', ' taram  '));
    expect(false).toEqual(matchByWords('some input param string', ' mara  '));
  });

  it('should match words in order', () => {
    expect(true).toEqual(matchByWords('some input param string', 'some param'));
    expect(true).toEqual(matchByWords('some input param string', ' string param'));
    expect(true).toEqual(matchByWords('some input param string', '  some   param  '));
    expect(true).toEqual(matchByWords('some input param string', ' some  string   '));
  });

  it('should not match more words', () => {
    expect(false).toEqual(matchByWords('some input param string', '  blabla   param  '));
    expect(false).toEqual(matchByWords('some input param string', ' some  blablag   '));
    expect(false).toEqual(matchByWords('some input param string', ' total  blablag   '));
  });

  it('should not fuzzy match more words', () => {
    expect(false).toEqual(matchByWords('some input param string', ' prm str'));
    expect(false).toEqual(matchByWords('some input param string', '  param   sti  '));
    expect(false).toEqual(matchByWords('some input param string', ' sm  st '));
  });

  it('should fuzzy match by single characters', () => {
    expect(true).toEqual(matchByWords('some input param string', ' string p r m str'));
    expect(true).toEqual(matchByWords('some input param string', ' p r m str'));
    expect(true).toEqual(matchByWords('some input param string', '  param   st i  '));
    expect(true).toEqual(matchByWords('some input param string', ' som  s g '));
    expect(true).toEqual(matchByWords('some input param string', ' i g put'));
    expect(true).toEqual(matchByWords('some input param string', ' input  e'));
  });

  it('should not fuzzy match by single characters', () => {
    expect(false).toEqual(matchByWords('some input param string', ' igput  s'));
  });
});
