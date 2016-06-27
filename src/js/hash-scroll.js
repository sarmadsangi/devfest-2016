// Need to check this
let $ = require('jquery')

$(document).ready(function () {
  if (location.hash) {
    setTimeout(function () {
      hashChangeScroll()
    }, 800)
  }

  $('.downarr').click(function (event) {
    event.preventDefault()
    replaceHashAndScroll($(this))
  })

  $('.c-events-nav').on('click', 'a', function (event) {
    event.preventDefault()
    if (!$(this).hasClass('c-events__calendar')) {
      replaceHashAndScroll($(this))
    } else {
      window.location = $(this).attr('href')
    }
  })

  $('.c-community__ways').on('click', 'a', function (event) {
    event.preventDefault()
    replaceHashAndScroll($(this))
  })

  function replaceHashAndScroll ($this) {
    var hash = $this.attr('href')
    var targetHash = hash.replace('-hash', '')

    if (history.pushState) {
      history.pushState(null, null, targetHash)
    } else {
      location.hash = targetHash
    }
    hashChangeScroll()
  }

  function hashChangeScroll () {
    var eventsHeaderHeight = $('.c-events-header').outerHeight()

    // scrolls to hash location
    var curPos = $(window).scrollTop()
    var currHash = location.hash
    var targetHash = location.hash
    var $target = $(targetHash)
    var targetTop = parseInt($target.offset().top)

    // console.log($target);

    $('body').animate({
      scrollTop: targetTop - eventsHeaderHeight
    }, 1500)
  }
})
