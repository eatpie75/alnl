var Sequelize = require('sequelize');
var slug = require('slug');
// var sequelize = new Sequelize('database', 'username', 'password', {
//   host: 'localhost',
//   dialect: 'mysql'|'mariadb'|'sqlite'|'postgres'|'mssql',

//   pool: {
//     max: 5,
//     min: 0,
//     idle: 10000
//   },

//   // SQLite only
//   storage: 'path/to/database.sqlite'
// });

// Or you can simply use a connection uri
var sequelize = new Sequelize('sqlite://db.sqlite3');

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
    'beforeCreate': function(instance, options) {
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
  'data': Sequelize.TEXT,
});
Information.belongsTo(Thing);

sequelize.sync();

module.exports = sequelize;
