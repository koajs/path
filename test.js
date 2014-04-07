
var koa = require('koa')
var request = require('supertest')

var route = require('.')()

describe('Koa Path', function () {
  it('should route and populate this.params', function (done) {
    var app = koa()
    app.use(route('/:user/:repo/:version/component.json', function* () {
      this.body = this.params
    }))

    request(app.listen())
    .get('/component/emitter/1.0.0/component.json')
    .expect(200)
    .end(function (err, res) {
      if (err) return done(err)

      res.body.should.eql({
        user: 'component',
        repo: 'emitter',
        version: '1.0.0',
      })
      done()
    })
  })

  it('should skip if the route does not match', function (done) {
    var app = koa()
    app.use(route('/:user/:repo/:version/component.json', function* () {
      this.throw(500)
    }))
    app.use(function* () {
      this.status = 204
    })

    request(app.listen())
    .get('/klajsldfj/kljasdlkfj/kljalskdjfsadf')
    .expect(204, done)
  })

  it('should reuse the same params', function (done) {
    var app = koa()
    app.use(route('/:user/:repo/:version/component.json', function* (next) {
      yield* next
    }))
    app.use(route('/:user2/:repo2/:version2/component.json', function* () {
      this.body = this.params
    }))

    request(app.listen())
    .get('/component/emitter/1.0.0/component.json')
    .expect(200)
    .end(function (err, res) {
      if (err) return done(err)

      res.body.should.eql({
        user: 'component',
        repo: 'emitter',
        version: '1.0.0',
        user2: 'component',
        repo2: 'emitter',
        version2: '1.0.0',
      })
      done()
    })
  })
})
