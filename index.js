var Diffy = require('diffy')
var trim = require('diffy/trim')
var nanobus = require('nanobus')
var throttle = require('lodash.throttle')

// Fix render issues from user input
var input = require('diffy/input')()

module.exports = neatLog

function neatLog (views, opts) {
  if (!views) throw new Error('neat-log: view required')
  if (!Array.isArray(views)) views = [views]
  if (!opts) opts = {}

  var logspeed = opts.logspeed || 250
  var state = {}
  var diffy = Diffy(opts)
  var bus = nanobus()

  bus.on('render', throttle(render, logspeed))
  bus.render = render

  input.on('ctrl-c', function () {
    render()
    if (!bus.emit('exit')) return process.exit()
    bus.emit('exit')
  })

  return {
    input: input,
    trim: trim,
    render: render,
    use: function (cb) {
      cb(state, bus)
    }
  }

  function render () {
    if (opts.quiet) return
    diffy.render(function () {
      if (views.length === 1) return views[0](state)
      return views.map(function (view) {
        return view(state)
      }).join('\n')
    })
  }
}
