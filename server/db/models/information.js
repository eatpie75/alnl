var date_format = require('../../../utils/date_format');

module.exports = function(sequelize, DataTypes) {
  var Information = sequelize.define('Information', {
    'date': {
      'type': DataTypes.DATEONLY,
      'set': function(date) {
        this.setDataValue('date', date_format.date_only(date));
      }
    },
    'kind': DataTypes.INTEGER,
    'data': {type: DataTypes.TEXT, defaultValue: '{}'}
  }, {
    'instanceMethods': {
      'get_data': function() {
        return JSON.parse(this.data);
      }
    }
  });

  return Information;
};
