import assert from 'assert';
import matchByWords from './matchByWords';


describe('test matchByWords', () => {
  it('should match empty query', () => {
    assert.strictEqual(matchByWords(' some input string with spaces  ', ''), true);
    assert.strictEqual(matchByWords('someinputstringwithoutspace', ''), true);
    assert.strictEqual(matchByWords('', ''), true);
  });

  it('should strict match one word query', () => {
    assert.strictEqual(matchByWords('some input param string', 'param'), true);
    assert.strictEqual(matchByWords('some input param string', 'param  '), true);
    assert.strictEqual(matchByWords('some input param string', ' param  '), true);
  });

  it('should not fuzzy match word', () => {
    assert.strictEqual(matchByWords('some input param string', 'taram'), false);
    assert.strictEqual(matchByWords('some input param string', 'taram  '), false);
    assert.strictEqual(matchByWords('some input param string', ' taram  '), false);
    assert.strictEqual(matchByWords('some input param string', ' mara  '), false);
  });

  it('should match words in order', () => {
    assert.strictEqual(matchByWords('some input param string', 'some param'), true);
    assert.strictEqual(matchByWords('some input param string', ' string param'), true);
    assert.strictEqual(matchByWords('some input param string', '  some   param  '), true);
    assert.strictEqual(matchByWords('some input param string', ' some  string   '), true);
  });

  it('should not match more words', () => {
    assert.strictEqual(matchByWords('some input param string', '  blabla   param  '), false);
    assert.strictEqual(matchByWords('some input param string', ' some  blablag   '), false);
    assert.strictEqual(matchByWords('some input param string', ' total  blablag   '), false);
  });

  it('should not fuzzy match more words', () => {
    assert.strictEqual(matchByWords('some input param string', ' prm str'), false);
    assert.strictEqual(matchByWords('some input param string', '  param   sti  '), false);
    assert.strictEqual(matchByWords('some input param string', ' sm  st '), false);
  });

  it('should fuzzy match by single characters', () => {
    assert.strictEqual(matchByWords('some input param string', ' string p r m str'), true);
    assert.strictEqual(matchByWords('some input param string', ' p r m str'), true);
    assert.strictEqual(matchByWords('some input param string', '  param   st i  '), true);
    assert.strictEqual(matchByWords('some input param string', ' som  s g '), true);
    assert.strictEqual(matchByWords('some input param string', ' i g put'), true);

    assert.strictEqual(matchByWords('some input param string', ' input  e'), true);
  });

  it('should not fuzzy match by single characters', () => {
    assert.strictEqual(matchByWords('some input param string', ' igput  s'), false);
  });
});
