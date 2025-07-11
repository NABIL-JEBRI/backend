 function asyncHandler(fn) {
  return async function (req, res, next) {
    try {
      return await fn(req, res, next);
    } catch (e) {
      next(e);
    }
  };
}

module.exports=asyncHandler