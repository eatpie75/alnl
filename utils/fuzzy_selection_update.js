var DMP = require('diff-match-patch');

var fuzzy_selection_update = function(original_content, new_content, original_information) {
  var dmp = new DMP();
  var new_information = [];

  original_information.forEach(function(information) {
    var thing = {'id': information.id, selections: []};

    information.selections.forEach(function(selection) {
      var beginning = selection[0], end = selection[1];
      var new_selection = [];
      var length = Math.min(32, end - beginning);

      new_selection[0] = dmp.match_main(new_content, original_content.slice(beginning, beginning + length), beginning);
      new_selection[1] = dmp.match_main(new_content, original_content.slice(end - length, end), beginning) + length;

      thing.selections.push((new_selection[0] > -1 && new_selection[1] > -1) ? new_selection : selection);
    });

    new_information.push(thing);
  });

  return new_information;
};

module.exports = fuzzy_selection_update;