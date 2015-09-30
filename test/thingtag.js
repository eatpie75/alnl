var expect = require('chai').expect;
var markdownit = require('markdown-it');
var thingtag = require('../client/thingtag');

var md = markdownit('commonmark', {'typographer': true});
md.use(thingtag);

describe('thingtag', function() {
  it('should find thingtags', function() {
    expect(md.render('@tag')).to.be.eql('<p><a href="/thing/tag" class="thing">tag</a></p>\n');
    expect(md.render('@tag extra')).to.be.eql('<p><a href="/thing/tag" class="thing">tag</a> extra</p>\n');
    expect(md.render('extra @tag extra')).to.be.eql('<p>extra <a href="/thing/tag" class="thing">tag</a> extra</p>\n');
    expect(md.render('extra @tag\'s extra')).to.be.eql('<p>extra <a href="/thing/tag" class="thing">tag</a>\'s extra</p>\n');
    expect(md.render('extra @tag.com extra')).to.be.eql('<p>extra <a href="/thing/tag" class="thing">tag</a>.com extra</p>\n');
  });

  it('shouldn\'t find thingtags in the middle of words', function() {
    expect(md.render('not@matched')).to.be.eql('<p>not@matched</p>\n');
    expect(md.render('not@matched @tag')).to.be.eql('<p>not@matched <a href="/thing/tag" class="thing">tag</a></p>\n');
    expect(md.render('not@matched @tag extra')).to.be.eql('<p>not@matched <a href="/thing/tag" class="thing">tag</a> extra</p>\n');
    expect(md.render('extra not@matched @tag extra')).to.be.eql('<p>extra not@matched <a href="/thing/tag" class="thing">tag</a> extra</p>\n');
  });

  it('shouldn\'t find thingtags without text', function() {
    expect(md.render('not matched @')).to.be.eql('<p>not matched @</p>\n');
    expect(md.render('not matched @ extra')).to.be.eql('<p>not matched @ extra</p>\n');
    expect(md.render('not matched @\nextra')).to.be.eql('<p>not matched @\nextra</p>\n');
    expect(md.render('@@')).to.be.eql('<p>@@</p>\n');
  });

});
