var activeEntry;
var albumOpen;
var time_update_interval;
var player;
var firstplay;

// left: 37, up: 38, right: 39, down: 40,
// spacebar: 32, pageup: 33, pagedown: 34, end: 35, home: 36
var keys = {37: 1, 38: 1, 39: 1, 40: 1};

function preventDefault(e) {
  e = e || window.event;
  if (e.preventDefault)
      e.preventDefault();
  e.returnValue = false;
}

function preventDefaultForScrollKeys(e) {
    if (keys[e.keyCode]) {
        preventDefault(e);
        return false;
    }
}

function disableScroll() {
  if (window.addEventListener) // older FF
      window.addEventListener('DOMMouseScroll', preventDefault, false);
  window.onwheel = preventDefault; // modern standard
  window.onmousewheel = document.onmousewheel = preventDefault; // older browsers, IE
  window.ontouchmove  = preventDefault; // mobile
  document.onkeydown  = preventDefaultForScrollKeys;
}

function enableScroll() {
    if (window.removeEventListener)
        window.removeEventListener('DOMMouseScroll', preventDefault, false);
    window.onmousewheel = document.onmousewheel = null;
    window.onwheel = null;
    window.ontouchmove = null;
    document.onkeydown = null;
}

$.attractHover('.js-attract-hover', { proximity: 40, magnetism: 5 });
$.attractHover('.js-repel-hover', { proximity: 40, magnetism: 25 });

jQuery.fn.reverse = [].reverse;

$(".mainTitle").lettering('words').children('span').lettering();
$(".fancy_title").lettering('words').children('span').lettering();
$('span:contains(" ")').css({ width:"0.5em" });

function vertical(){
  $('main').css({ overflow:"hidden" });
  $("main").unmousewheel();
}
function horizontal(){
  $('main').css({ overflowY:"hidden", overflowX:"scroll" });
  $('main').on('mousewheel', function(event) {
    this.scrollLeft -= (event.deltaFactor * event.deltaY);
    event.preventDefault();
  });
}
function scrollAcross(target){
  var scrollToValue = $('main').scrollLeft() + target.parent().parent().offset().left + (target.parent().parent().width() / 2) - ($('main').width() / 2);
  $('main').delay(500).animate( { scrollLeft: scrollToValue }, {duration:1000, easing:"easeInOutExpo" });
}

function openAlbum(album){
  //Disable Scroll
  disableScroll();
  //Setup Variables
  current = album;
  activeEntry = album.parent().parent();
  //Remove Hover Effects
  album.css( { pointerEvents:"none" } );
  album.find('.attract-hover').addClass('disableHover').removeClass('attract-hover');
  album.find('.attract-hover-easing').addClass('disableHoverEasing').removeClass('attract-hover-easing');
  //Scroll Container
  scrollAcross(album);
  //Get Colour
  colour = album.find('h4').css("color");
  //disableHover
  current.off( "mouseenter mouseleave" );
  //Player colour
  $('#playpause g').css({ stroke:colour });
  $('#playpause').css({ visibility:"visible" });
  TweenLite.from($('#playpause'), 1, { delay:0.5, ease: Power4.easeInOut, x:"100%" });
  //Set Close Colour
  $('#close-icon').css({ stroke:colour });
  //Close In
  closetl = new TimelineLite({onReverseComplete:function(){
    $('#close').css({ visibility:"hidden" })
    TweenMax.set($('#close'),{ x:0, clearProps:"all"});
    TweenMax.set($('#close').find('#line1'),{ rotation:0, clearProps:"all"});
    TweenMax.set($('#close').find('#line2'),{ rotation:0, clearProps:"all"});
  }});
  closetl.set($('#close'), { visibility: "visible" })
  .from($('#close'), 0.6, { ease: Power4.easeIn, delay:1, x:"+=400%" })
  .from($('#close').find('#line1'), 0.3, { ease: Power4.easeOut, rotation:-45, transformOrigin:'center' }, "x")
  .from($('#close').find('#line2'), 0.3, { ease: Power4.easeOut, rotation:45, transformOrigin:'center' }, "x")
  //Album Tween
  tl = new TimelineLite(
    {
      onReverseComplete:function(){
        albumOpen = false;
        TweenLite.set( album, { clearProps:"all" } );
        TweenLite.set( activeEntry.find('.album'), { clearProps:"all" } );
        TweenLite.set( activeEntry.find('.album'), { clearProps:"all" } );
        TweenMax.set( album.find('.disableHoverEasing'), { clearProps:"all" });
        album.css( { pointerEvents:"" } );
        album.find('.disableHover').removeClass('disableHover').addClass('attract-hover');
        album.find('.disableHoverEasing').removeClass('disableHoverEasing').addClass('attract-hover-easing');
        activeEntry.find('.content').css({ visibility:"hidden"});
        enableScroll();
        horizontal();
        album.hover(
          function() {
            TweenLite.to( $( this ).find('#disc'), 0.3 , { x:70 } );
          }, function() {
            TweenLite.to( $( this ).find('#disc'), 0.3 , { x:120 } );
          }
        );
      },
      onComplete:function(){
        albumOpen = true;
        $('.marker').insertBefore(activeEntry);
        $('.marker').css({display:"inline"});
        activeEntry.find('.content').css({ visibility:"visible"});
        activeEntry.appendTo('.openAlbum');
        $('.openAlbum').css({ display:"inline"} );
        var innerWidth = $('.openAlbum')[0]['clientWidth'];
        var fullWidth = $('.openAlbum').width();
        $('.openAlbum').css({ paddingLeft:(fullWidth - innerWidth) });
        //activeEntry.css({ position:"fixed", top:0, left:0, right:0, height:"100%", overflowY:"scroll" });
        enableScroll();
        vertical();
        //Load Video
        TweenLite.set($('#playpause').find('#arm'), { svgOrigin:'222 32' });
        //TweenLite.to( $('#playpause').find('#arm'), 1, { ease: Back.easeInOut, rotation:"15deg"});
        //
        TweenLite.set( $('#progress-bar'), { width:"50px",rotation:"-140deg", x:40, y:90});

        var URL = activeEntry.find('.content').data('videolink');
        /*
        var htm = '<iframe id="video" width="560" height="315" src="https://www.youtube.com/embed/' + URL + '?enablejsapi=1?autoplay=1" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>';
        activeEntry.find('.videoWrapper').html(htm);
        */
        player = new YT.Player('youtubePlayer', {
          height: '390',
          width: '640',
          videoId: URL,
          playerVars: {rel: 0, showinfo: 0, ecver: 2, color:'white', modestbranding: 1},
          events: {
            'onReady': onPlayerReady,
            'onStateChange': onPlayerStateChange
          }
        });
        function onPlayerReady(event) {
          TweenLite.set(discOn, { svgOrigin:'106 106' });
          spintl = new TimelineMax({ paused:true });
          spintl.to(discOn, 3, { rotation:360, ease: Power0.easeOut, repeat:-1});
          //event.target.playVideo();
          duration = player.getDuration();
          firstplay = true;
          //updateProgressBar();
        };
        function onPlayerStateChange(event) {
          var discOn = $('#playpause').find('#discOn');
          if (event.data == YT.PlayerState.PLAYING) {
            if(firstplay === true){
              TweenLite.to( $('#playpause').find('#arm'), 0.5, { ease: Back.easeInOut, rotation:"15deg"});
              firstplay = false;
            }
            spintl.play();
            time_update_interval = setInterval(updateProgressBar, 500);
          } else {
            clearInterval(time_update_interval);
            spintl.pause();
          }
          if(event.data === 0) {
            clearInterval(time_update_interval);
            TweenLite.to( $('#playpause').find('#arm'), 1, { delay:0.5, ease: Back.easeInOut, rotation:"0deg"});
          }
        }
        $('#progress-bar').on('input change mousedown', function (e) {
          //player.pauseVideo();
          clearInterval(time_update_interval);
          var current = (25 / 100)*e.target.value;
          TweenLite.set($('#playpause').find('#arm'), { svgOrigin:'222 32' });
          TweenLite.set( $('#playpause').find('#arm'), { rotation:15+current+"deg"});
        });
        $('#progress-bar').on('mouseup touchend', function (e) {
            // Calculate the new time for the video.
            // new time in seconds = total duration in seconds * ( value of range input / 100 )
            var newTime = player.getDuration() * (e.target.value / 100);
            // Skip video to new time.
            player.seekTo(newTime);
            //player.playVideo();
        });
        function updateProgressBar(){
          // Update the value of our progress bar accordingly.
          var current = (25 / player.getDuration())*player.getCurrentTime();
          $('#progress-bar').val((player.getCurrentTime() / player.getDuration()) * 100);
          //$('#playpause').find('#arm').css({ 'transform':'rotate('+current+'deg)' })
          TweenLite.set( $('#playpause').find('#arm'), { rotation:15+current+"deg"});
          //$('#progress-bar').val((player.getCurrentTime() / player.getDuration()) * 100);
        }
      }
    });
  tl.to( album, 1, { delay:0.5, ease: Power4.easeInOut, scale: 2 }, "init")
  .to( activeEntry.prev().find('.inner') , 1, { delay:0.1, ease: Power4.easeInOut, scale: 0 }, "init")
  .to( activeEntry.next().find('.inner') , 1, { delay:0.1, ease: Power4.easeInOut, scale: 0 }, "init")
  .to( activeEntry.prev().prev().find('.inner') , 1, { ease: Power4.easeInOut, scale: 0 }, "init")
  .to( activeEntry.next().next().find('.inner') , 1, { ease: Power4.easeInOut, scale: 0 }, "init")
  .to( album.find('#disc'), 0.5, { delay:0.5, ease: Power4.easeIn, x: $( window ).width()  }, "init")
  .to( album.find('#box'), 1, { delay:0.5, ease: Power4.easeInOut, strokeWidth:"4" }, "init")
  .to( album.find('.cover'), 0.5, { delay:0.5, ease: Power4.easeIn , rotation: "0", margin:"0%", width:"100%" }, "init")
  .to( album.find('.name'), 0.5, { delay:0.5, ease: Power4.easeIn, rotation: "0", margin:"5%", width:"128%" }, "init")
  .to( $('.progress-container'), 0.5, { delay:0.5, ease: Power2.easeOut, x: "+=5px" }, "init")
  TweenMax.to( album.find('.disableHoverEasing'), 0.5, { ease: Power2.easeOut, x: "0", y:0 });
  TweenLite.set( $('#playpause').find('#discOn'), { visibility:"visible" });
  TweenLite.from( $('#playpause').find('#discOn'), 0.5, { delay:1.5, ease: Power2.easeOut, y:"200%"});
  album.find('h4 span span').reverse().each(function( index ) {
    TweenLite.to( this , 0.1, { delay:(index/50), height: 0 })
  });
  album.find('h3 span span').reverse().each(function( index ) {
    TweenLite.to( this , 0.1, { delay:(index/50), height: 0 })
  });
  album.find('h2 span span').each(function( index ) {
    TweenLite.to( this , 0.1, { delay:1.2+(index/50), height: "1em" })
  });
}

function closeAlbum(album, direction){
  player.pauseVideo();
  disableScroll();
  activeEntry = album.parent().parent();
  closetl.reverse();
  clearInterval(time_update_interval);
  spintl.pause();
  TweenLite.to( $('#playpause').find('#arm'), 1, { delay:0.5, ease: Back.easeInOut, rotation:"0deg"});
  TweenLite.to( $('#playpause').find('#discOn'), 0.5, { delay:0.5, ease: Power2.easeIn, y:"200%", onComplete:function(){
    TweenLite.set( $('#playpause').find('#discOn'), { clearProps:"y,visibility" });
    TweenLite.set( $('#playpause').find('#discOn'), { y:5,x:5 });
    TweenLite.to($('#playpause'), 1, { delay:0.5, ease: Power4.easeInOut, x:"100%",onComplete:function(){
      TweenLite.set($('#playpause'),{clearProps:"all"});
      $('#playpause').css({ visibility:"hidden" });
    }});
  }});

  $('.openAlbum').animate({ scrollTop: 0 }, 600, function(){
    $('.openAlbum > .entry').insertBefore($('.marker'));
    $('.marker').insertBefore($('.openAlbum'));
    $('.openAlbum').css({ display:"none"});

    //player.destroy();
    activeEntry.find('.videoWrapper').html('<div id="youtubePlayer"></div>');

    var total = album.find('h2 span span').length;
    album.find('h2 span span').each(function( index ) {
      TweenLite.to( this , 0.1, { delay:(index/50), height: 0 })
      if (index === total - 1) {
        TweenLite.to( this , 0.1, { delay:(index/50), height: 0, onComplete:function(){
          activeEntry.removeClass('entry-active');
          album.removeClass('inner-active');
          tl.reverse();
          album.find('h4 span span').reverse().each(function( index ) {
            TweenLite.to( this , 0.1, { delay:1+(index/50), height: "1em" })
          });
          album.find('h3 span span').each(function( index ) {
            TweenLite.to( this , 0.1, { delay:1+(index/50), height: "1em" })
          });
          if (direction === 'next'){
            setTimeout(function() {
              openAlbum(album.parent().parent().next().find('.inner'));
            }, 2000);
          } else if (direction === 'prev'){
            setTimeout(function() {
              openAlbum(album.parent().parent().prev().find('.inner'));
            }, 2000);
          }
        }})
      } else {
        TweenLite.to( this , 0.1, { delay:(index/50), height: 0 })
      }
    });
  });
}

$( ".inner" ).click(function() {
  if($(this).attr('id') != 'outro-inner'){
    openAlbum($(this));
  }
});

$( "#close" ).click(function() {
  closeAlbum(current,'none');
});
function maintainScroll(){
  var scrollToValue = $('main').scrollLeft() + $('.marker').offset().left + ($('.marker').width() / 2) - ($('main').width() / 2);
  $('main').scrollLeft( scrollToValue );
}
$(window).on('resize', function(){
  maintainScroll();
});

// When the user scrolls the page, execute myFunction
function progressBar(){
  var winScroll = $('main').scrollLeft() + $('main').width();
  var width = $('main')[0].scrollWidth;
  var scrolled = (winScroll / width) * 100;
  $('#myBar').height( scrolled + "%");
}
$('main').scroll(function(){
  progressBar();
  if (albumOpen === true){
    maintainScroll();
  };
});
// First we get the viewport height and we multiple it by 1% to get a value for a vh unit
let vh = window.innerHeight * 0.01;
// Then we set the value in the --vh custom property to the root of the document
document.documentElement.style.setProperty('--vh', `${vh}px`);
// We listen to the resize event
window.addEventListener('resize', () => {
  // We execute the same script as before
  let vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty('--vh', `${vh}px`);
});
$( ".inner" ).hover(
  function() {
    TweenLite.to( $( this ).find('#disc'), 0.3 , { x:70 } );
  }, function() {
    TweenLite.to( $( this ).find('#disc'), 0.3 , { x:120 } );
  }
);
$(document).ready(function($) {
    var Body = $('body');
    Body.addClass('preloader-site');
});
//Initialise
$(window).on('load', function() {
   //Set scroll
   horizontal();
   progressBar();
   //removeCover
    $("#cover").hide();
   //Reveal Title
   setTimeout(function(){
     $('#intro h1 span span').each(function( index ) {
       TweenLite.to( this , 0.5, { ease: Power2.easeOut, delay:(index/30), height: "1em" })
     });
   }, 500);
   TweenLite.from( $('.progress-container'), 0.5, { delay:1, ease: Power2.easeOut, x: "+=5px" })
   ////Scrollindicators
   //Desktop
   var scroller = $('.scrollindicator').find('#scroller');
   scrollertl = new TimelineMax({repeat:1});
   scrollertl.to( scroller, 0.6, { delay:1, ease: Power4.easeIn, attr:{ height: 20 } },"init")
   .to( $('.scrollindicator'), 0.6, { delay:1, ease: Power4.easeIn, y: "+=5px" },"init")
   .to( scroller, 0.6, { ease: Power4.easeOut, y: "+=20px" },"hide")
   .to( scroller, 0.6, { ease: Power4.easeOut, attr:{ height:0 }}, "hide")
   .to( $('.scrollindicator'), 0.6, { ease: Power4.easeOut, y: "-=5px" },"hide")
   .set( scroller, { y: "-=20px", attr:{ height: 0 }})
   .to( scroller, 0.6, { ease: Power4.easeOut, attr:{ height: 8 }});
   TweenLite.from( $('.scrollindicator'), 0.5, { delay:1, ease: Power2.easeOut, opacity: 0 })
   TweenLite.to( $('.scrollindicator'), 0.5, { delay:6, ease: Power2.easeOut, autoAlpha: 0 })
   //Mobile
   var swipe = $('.scrollindicator-mobile').find('#swipe');
   scrollermobiletl = new TimelineMax({repeat:1});
   scrollermobiletl.from( swipe, 0.6, { delay:1, ease: Power4.easeIn, opacity: 0 })
   .from( swipe, 0.6, { ease: Power4.easeInOut, width: "30px",x:"+=100px"})
   .to( swipe, 0.6, { ease: Power4.easeIn, width: "30px"})
   .to( swipe, 0.6, { ease: Power4.easeIn, opacity: 0})
   //Youtube API
   var tag = document.createElement('script');
  tag.src = "https://www.youtube.com/iframe_api";
  var firstScriptTag = document.getElementsByTagName('script')[0];
  firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
});
