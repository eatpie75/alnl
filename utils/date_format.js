var zero_pad = function(input) {
  return (input < 10) ? '0' + input : '' + input;
};

var date_only = function(date) {
  if (!(date instanceof Date)) date = new Date(date);
  var year = date.getFullYear();
  var month = zero_pad(date.getMonth());
  var day = zero_pad(date.getDate());

  return [year, month, day].join('-');
};

module.exports = {
  'date_only': date_only
};
