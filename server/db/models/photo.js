module.exports = function(sequelize, DataTypes) {
  var Photo = sequelize.define('Photo', {
    'name': DataTypes.STRING,
    'gid': DataTypes.STRING(512)
  }, {
    'instanceMethods': {
      'get_url': function() {
        return 'https://storage.googleapis.com/alnl/' + this.gid;
      }
    }
  });

  return Photo;
};
