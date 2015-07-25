var Sequelize = require('sequelize');
var slug = require('slug');
var swig_date = require('swig/lib/filters').date;

var sequelize = new Sequelize(process.env.DATABASE_URL || 'sqlite://db.sqlite3');

var Entry = sequelize.define('Entry', {
  'date': Sequelize.DATEONLY,
  'content': Sequelize.TEXT,
  'metadata': {type:Sequelize.TEXT, defaultValue:'{}'},
  'analyzed': Sequelize.BOOLEAN,
  'analyze_date': Sequelize.DATE
}, {
  'instanceMethods': {
    'get_url': function() {
      return '/' + this.id;
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
    'analyze_information': function() {
      var metadata = this.get_metadata();
      var _this = this;
      if (metadata.information) {
        var new_information = [];
        metadata.information.forEach(function(information) {
          information.selections.forEach(function(selection) {
            var data = {
              'content': _this.content.slice(selection[0], selection[1]),
              'date': swig_date(_this.date, 'l F jS, Y')
            };
            new_information.push({'name':_this.date, 'data':JSON.stringify(data), 'ThingId':information.id});
          });
        });
        Information.bulkCreate(new_information);
      }
    }
  }
});

var Thing = sequelize.define('Thing', {
  'date_created': {type:Sequelize.DATE, defaultValue:Sequelize.NOW},
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
    }
  }
});

var Information = sequelize.define('Information', {
  'name': Sequelize.STRING,
  'kind': Sequelize.INTEGER,
  'data': {type:Sequelize.TEXT, defaultValue:'{}'},
}, {
  'instanceMethods': {
    'get_data': function() {
      return JSON.parse(this.data);
    }
  }
});
Information.belongsTo(Thing);

var Photo = sequelize.define('Photo', {
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

sequelize.sync();

module.exports = sequelize;
