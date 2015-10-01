var date_format = require('../../../utils/date_format');
var fuzzy_selection_update = require('../../utils/fuzzy_selection_update');

module.exports = function(sequelize, DataTypes) {
  var Entry = sequelize.define('Entry', {
    'date': {
      'type': DataTypes.DATEONLY,
      'unique': true,
      'defaultValue': function() {
        return date_format.date_only(new Date());
      },
      'set': function(date) {
        this.setDataValue('date', date_format.date_only(date));
      }
    },
    'content': {
      'type': DataTypes.TEXT,
      'set': function(content) {
        this.setDataValue('content', content.replace(/\r\n/g, '\n'));
      }
    },
    'metadata': {
      'type': DataTypes.TEXT,
      'defaultValue': '{}'
    },
    'analyzed': DataTypes.BOOLEAN,
    'analyze_date': DataTypes.DATE
  }, {
    'instanceMethods': {
      'get_url': function() {
        return '/' + this.date;
      },
      'get_edit_url': function() {
        return '/post/' + this.id;
      },
      'get_review_url': function() {
        return '/review/' + this.id;
      },
      'get_metadata': function() {
        return JSON.parse(this.metadata);
      },
      'update_content': function(new_content) {
        var old_content = this.content;
        this.content = new_content;
        var metadata = this.get_metadata();

        if ('information' in metadata) {
          metadata.information = fuzzy_selection_update(old_content, this.content, metadata.information);
          this.metadata = JSON.stringify(metadata);
        }
      },
      'analyze_information': function() {
        var metadata = this.get_metadata();
        var _this = this;
        var new_information = [];
        if (metadata.information) {
          metadata.information.forEach(function(information) {
            information.selections.forEach(function(selection) {
              var data = {
                'content': _this.content.slice(selection[0], selection[1]),
                'date': _this.date
              };
              new_information.push({'date': _this.date, 'data': JSON.stringify(data), 'ThingId': information.id, 'EntryId': _this.id});
            });
          });
        }

        return sequelize.models.Information.destroy({'where': {'EntryId': _this.id}}).then(function() {
          if (!new_information.length) return [];

          return sequelize.models.Information.bulkCreate(new_information);
        });
      }
    }
  });
  Entry.DATE_REGEX = /^(\d{4})-(\d{2})-(\d{2})$/;

  return Entry;
};
