module.exports.createSuccessResponse = function (data) {
  return {
    status: 'ok',
    ...data,
  };
};

module.exports.createErrorResponse = function (data) {

  return {
    status: 'error',
      error: {
    message: 'not found'
  },
    ...data,
  };
};
