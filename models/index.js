var Sequelize = require('sequelize');
var slug = require('slug');
var swig_date = require('swig/lib/filters').date;
var fuzzy_selection_update = require('../utils/fuzzy_selection_update');

var sequelize = new Sequelize(process.env.DATABASE_URL || 'sqlite://db.sqlite3', {'logging': null});

var Entry, Thing, Information, Photo;

Entry = sequelize.define('Entry', {
  'date': {
    'type': Sequelize.DATEONLY,
    'defaultValue': function() {
      return swig_date(new Date(), 'Y-m-d');
    },
    'set': function(date) {
      if (!(date instanceof Date)) date = new Date(date);
      this.setDataValue('date', swig_date(date, 'Y-m-d'));
    }
  },
  'content': {
    'type': Sequelize.TEXT,
    'set': function(content) {
      this.setDataValue('content', content.replace(/\r\n/g, '\n'));
    }
  },
  'metadata': {type: Sequelize.TEXT, defaultValue: '{}'},
  'analyzed': Sequelize.BOOLEAN,
  'analyze_date': Sequelize.DATE
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
            new_information.push({'name': _this.date, 'data': JSON.stringify(data), 'ThingId': information.id, 'EntryId': _this.id});
          });
        });
      }

      return Information.destroy({'where': {'EntryId': _this.id}}).then(function() {
        if (!new_information.length) return [];

        return Information.bulkCreate(new_information);
      });
    }
  }
});

Thing = sequelize.define('Thing', {
  'date_created': {type: Sequelize.DATE, defaultValue: Sequelize.NOW},
  'name': Sequelize.STRING,
  'slug': Sequelize.STRING,
  'content': Sequelize.TEXT
}, {
  'hooks': {
    'beforeCreate': function(instance) {
      if (instance.slug === null) {
        instance.slug = slug(instance.name);
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

Information = sequelize.define('Information', {
  'name': Sequelize.STRING,
  'kind': Sequelize.INTEGER,
  'data': {type: Sequelize.TEXT, defaultValue: '{}'}
}, {
  'instanceMethods': {
    'get_data': function() {
      return JSON.parse(this.data);
    }
  }
});
Information.belongsTo(Thing);
Information.belongsTo(Entry);

Photo = sequelize.define('Photo', {
  'name': Sequelize.STRING,
  'gid': Sequelize.STRING(512)
}, {
  'instanceMethods': {
    'get_url': function() {
      return 'https://storage.googleapis.com/alnl/' + this.gid;
    }
  }
});
Photo.belongsTo(Entry);
Entry.hasMany(Photo);

Entry.belongsToMany(Thing, {'through': 'EntryThing'});
Thing.belongsToMany(Entry, {'through': 'EntryThing'});

sequelize.sync();

module.exports = sequelize;
