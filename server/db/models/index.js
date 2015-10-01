var Sequelize = require('sequelize');

var sequelize = new Sequelize(process.env.DATABASE_URL || 'sqlite://db.sqlite3', {'logging': null});

var Entry = sequelize.import('./entry');
var Thing = sequelize.import('./thing');
var Information = sequelize.import('./information');
var Photo = sequelize.import('./photo');

Information.belongsTo(Thing);
Information.belongsTo(Entry);

Photo.belongsTo(Entry);
Entry.hasMany(Photo);

Entry.belongsToMany(Thing, {'through': 'EntryThing'});
Thing.belongsToMany(Entry, {'through': 'EntryThing'});

sequelize.sync();

module.exports = sequelize;
