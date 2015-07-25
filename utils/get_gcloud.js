module.exports = function() {
  return require('gcloud').storage({
    'projectId': 'alnl-1015',
    'credentials': {
      'client_email': process.env.GCLOUD_CLIENT_EMAIL,
      'private_key': process.env.GCLOUD_PRIVATE_KEY
    }
  });
};
