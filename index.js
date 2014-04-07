
module.exports = function (options) {
  var route = require('path-match')(options)

  return function (path, fn) {
    var match = route(path)

    return function* routePath(next) {
      var params = match(this.request.path, this.params)
      if (!params) return yield* next

      this.params = params
      yield* fn.call(this, next)
    }
  }
}
