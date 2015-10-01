var slug = require('slug');

module.exports = function(sequelize, DataTypes) {
  var Thing = sequelize.define('Thing', {
    'date_created': {
      'type': DataTypes.DATE,
      'defaultValue': DataTypes.NOW
    },
    'name': DataTypes.STRING,
    'slug': DataTypes.STRING,
    'content': DataTypes.TEXT
  }, {
    'hooks': {
      'beforeCreate': function(instance) {
        if (instance.slug === null) {
          instance.slug = slug(instance.name, {'lower': true});
        }
      }
    },
    'instanceMethods': {
      'get_url': function() {
        return '/thing/' + this.id + '/' + this.slug;
      },
      'search_output': function() {
        return {
          'id': this.id,
          'name': this.name,
          'url': this.get_url()
        };
      }
    }
  });

  return Thing;
};
