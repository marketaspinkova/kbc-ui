var assert = require('assert');
var timeInWords = require('./duration').timeInWords;

describe('duration', function() {
  describe('duration without round param - default', function() {
    it('0 seconds should return "0 sec"', function() {
      assert.equal('0 sec', timeInWords(0));
    });
    it('1 second should return "1 sec"', function() {
      assert.equal('1 sec', timeInWords(1));
    });
    it('59 seconds should return "59 sec"', function() {
      assert.equal('59 sec', timeInWords(59));
    });
    it('60 seconds should return "1 min"', function() {
      assert.equal('1 min', timeInWords(60));
    });
    it('61 seconds should return "1 min 1 sec"', function() {
      assert.equal('1 min 1 sec', timeInWords(61));
    });
    it('3599 seconds should return "59 min 59 sec"', function() {
      assert.equal('59 min 59 sec', timeInWords(3599));
    });
    it('3600 seconds should return "1 hr"', function() {
      assert.equal('1 hr', timeInWords(3600));
    });
    it('3601 seconds should return "1 hr 1 sec"', function() {
      assert.equal('1 hr 1 sec', timeInWords(3601));
    });
    it('3660 seconds should return "1 hr 1 min"', function() {
      assert.equal('1 hr 1 min', timeInWords(3660));
    });
    it('3661 seconds should return "1 hr 1 min 1 sec"', function() {
      assert.equal('1 hr 1 min 1 sec', timeInWords(3661));
    });
    it('86399 seconds should return "23 hr 59 min 59 sec"', function() {
      assert.equal('23 hrs 59 min 59 sec', timeInWords(86399));
    });
    it('86400 seconds should return "more than 24 hrs"', function() {
      assert.equal('more than 24 hrs', timeInWords(86400));
    });
  });

  describe('duration with round param (should trim seconds part)', function() {
    it('0 seconds should return "0 sec"', function() {
      assert.equal('0 sec', timeInWords(0, true));
    });
    it('1 seconds should return "1 sec"', function() {
      assert.equal('1 sec', timeInWords(1, true));
    });
    it('59 seconds should return "59 sec"', function() {
      assert.equal('59 sec', timeInWords(59, true));
    });
    it('60 seconds should return "1 min"', function() {
      assert.equal('1 min', timeInWords(60, true));
    });
    it('61 seconds should return "1 min 1 sec"', function() {
      assert.equal('1 min 1 sec', timeInWords(61, true));
    });
    it('3599 seconds should return "59 min 59 sec"', function() {
      assert.equal('59 min 59 sec', timeInWords(3599, true));
    });
    it('3600 seconds should return "1 hr"', function() {
      assert.equal('1 hr', timeInWords(3600, true));
    });
    it('3601 seconds should return "1 hr"', function() {
      assert.equal('1 hr', timeInWords(3601, true));
    });
    it('3660 seconds should return "1 hr 1 min"', function() {
      assert.equal('1 hr 1 min', timeInWords(3660, true));
    });
    it('3661 seconds should return "1 hr 1 min"', function() {
      assert.equal('1 hr 1 min', timeInWords(3661, true));
    });
    it('86399 seconds should return "23 hr 59 min"', function() {
      assert.equal('23 hrs 59 min', timeInWords(86399, true));
    });
    it('86400 seconds should return "more than 24 hrs"', function() {
      assert.equal('more than 24 hrs', timeInWords(86400, true));
    });
  });
});
