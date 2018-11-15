import assert from 'assert';
import matchByWords from './matchByWords';


describe('test matchByWords', () => {
  it('should match empty query', () => {
    assert.ok(matchByWords(' some input string with spaces  ', ''));
    assert.ok(matchByWords('someinputstringwithoutspace', ''));
    assert.ok(matchByWords('', ''));
  });

  it('should strict match one word query', () => {
    assert.ok(matchByWords('some input param string', 'param'));
    assert.ok(matchByWords('some input param string', 'param  '));
    assert.ok(matchByWords('some input param string', ' param  '));
  });

  it('should not fuzzy match word', () => {
    assert.ok(!matchByWords('some input param string', 'taram'));
    assert.ok(!matchByWords('some input param string', 'taram  '));
    assert.ok(!matchByWords('some input param string', ' taram  '));
    assert.ok(!matchByWords('some input param string', ' mara  '));
  });

  it('should match words in order', () => {
    assert.ok(matchByWords('some input param string', 'some param'));
    assert.ok(matchByWords('some input param string', ' string param'));
    assert.ok(matchByWords('some input param string', '  some   param  '));
    assert.ok(matchByWords('some input param string', ' some  string   '));
  });

  it('should not match more words', () => {
    assert.ok(!matchByWords('some input param string', '  blabla   param  '));
    assert.ok(!matchByWords('some input param string', ' some  blablag   '));
    assert.ok(!matchByWords('some input param string', ' total  blablag   '));
  });

  it('should not fuzzy match more words', () => {
    assert.ok(!matchByWords('some input param string', ' prm str'));
    assert.ok(!matchByWords('some input param string', '  param   sti  '));
    assert.ok(!matchByWords('some input param string', ' sm  st '));
  });

  it('should fuzzy match by single characters', () => {
    assert.ok(matchByWords('some input param string', ' string p r m str'));
    assert.ok(matchByWords('some input param string', ' p r m str'));
    assert.ok(matchByWords('some input param string', '  param   st i  '));
    assert.ok(matchByWords('some input param string', ' som  s g '));
    assert.ok(matchByWords('some input param string', ' i g put'));

    assert.ok(matchByWords('some input param string', ' input  e'));
  });

  it('should not fuzzy match by single characters', () => {
    assert.ok(!matchByWords('some input param string', ' igput  s'));
  });
});
