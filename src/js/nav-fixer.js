let $ = require('jquery')

// Header
$(window).ready(function () {
  var $el = $('.jsFixedHeader')
  var $clone = $('.jsFixedHeader').clone(true, true)
  .removeClass('jsFixedHeader')
  .addClass('jsFixedHeaderClone')

  if (!$el.length) {
    return
  }

  var activationPos = $el.position().top

  $clone.css({
    display: 'none',
    position: 'absolute',
    top: '0',
    left: '0',
    right: '0',
    zIndex: '9999'
  })

  $el.after($clone)

  function activateFixed () {
    $clone.css({
      'display': 'block',
      'position': 'fixed'
    })

    if ($('.jsDesktopNav').length) {
      $('.jsDesktopNav').addClass('is-fixed')
    }
  }

  function deactivateFixed () {
    $clone.css({
      'display': 'none',
      'position': 'absolute',
    })

    if ($('.jsDesktopNav').length) {
      $('.jsDesktopNav').removeClass('is-fixed')
    }
  }

  $(window).scroll(function (event) {
    var $container = $(window)
    if ($container.scrollTop() > activationPos) {
      activateFixed()
    } else {
      deactivateFixed()
    }
  })
})
