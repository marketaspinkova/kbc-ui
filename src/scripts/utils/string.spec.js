import stringUtils from './string';
const {webalize} = stringUtils;

describe('string utils tests', function() {
  describe('webalize', function() {
    it('jeden dva tri styri pat -> jeden-dva-tri-styri-pat', function() {
      expect('jeden-dva-tri-styri-pat').toEqual(webalize('jeden dva tri styri pat'));
    });
    it('jeden dva  Tri -> jeden-dva-tri', function() {
      expect('jeden-dva-tri').toEqual(webalize('jeden dva  Tri'));
    });
    it('jeden DVA  Tri -> jeden-DVA-Tri', function() {
      expect('jeden-DVA-Tri').toEqual(webalize('jeden DVA  Tri', {caseSensitive: true}));
    });
    it('Háčky a čárky NEdělají problémyô->hacky-a-carky-nedelaji-problemyo', function() {
      expect('hacky-a-carky-nedelaji-problemyo').toEqual(webalize('Háčky a čárky NEdělají problémyô'));
    });
    it('LaLaLa123->lalala123', function() {
      expect('lalala123').toEqual(webalize('LaLaLa123'));
    });
    it('a_b->a_b', function() {
      expect('a_b').toEqual(webalize('a_b'));
    });
    it('__a__b___c->a_b_c', function() {
      expect('a_b_c').toEqual(webalize('__a__b___c'));
    });
    it('_a_b_->a_b', function() {
      expect('a_b').toEqual(webalize('_a_b_'));
    });
  });
});
