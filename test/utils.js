var expect = require('chai').expect;
var markdownit = require('markdown-it');
var thingtag = require('../client/thingtag');
var utils = require('../public/js/utils');

var md = markdownit('commonmark', {'typographer': true});
md.use(thingtag);

describe('utils', function() {
  describe('get_parsed_thingtags', function() {
    var get_parsed_thingtags = utils.get_parsed_thingtags;

    it('should return an array', function() {
      var result;

      result = get_parsed_thingtags(md);
      expect(result).to.be.an('array');
      expect(result).to.have.length(0);

      result = get_parsed_thingtags(md, '');
      expect(result).to.be.an('array');
      expect(result).to.have.length(0);

      result = get_parsed_thingtags(md, '@tag');
      expect(result).to.be.an('array');
      expect(result).to.have.length(1);
    });

    it('should find parsed thingtags', function() {
      var result = get_parsed_thingtags(md, '@tag extra @tag2');

      expect(result).to.have.length(2);
      expect(result[0].content).to.be.eql('tag');
      expect(result[1].content).to.be.eql('tag2');
    });

  });
});
