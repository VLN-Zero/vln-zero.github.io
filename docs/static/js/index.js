window.HELP_IMPROVE_VIDEOJS = false;

var INTERP_BASE = "./static/interpolation/stacked";
var NUM_INTERP_FRAMES = 240;

var interp_images = [];
function preloadInterpolationImages() {
  for (var i = 0; i < NUM_INTERP_FRAMES; i++) {
    var path = INTERP_BASE + '/' + String(i).padStart(6, '0') + '.jpg';
    interp_images[i] = new Image();
    interp_images[i].src = path;
  }
}

function setInterpolationImage(i) {
  var image = interp_images[i];
  image.ondragstart = function() { return false; };
  image.oncontextmenu = function() { return false; };
  $('#interpolation-image-wrapper').empty().append(image);
}


$(document).ready(function() {
    // Check for click events on the navbar burger icon
    $(".navbar-burger").click(function() {
      // Toggle the "is-active" class on both the "navbar-burger" and the "navbar-menu"
      $(".navbar-burger").toggleClass("is-active");
      $(".navbar-menu").toggleClass("is-active");

    });

    var options = {
			slidesToScroll: 1,
			slidesToShow: 3,
			loop: true,
			infinite: true,
			autoplay: false,
			autoplaySpeed: 3000,
    }

		// Initialize all div with carousel class
    var carousels = bulmaCarousel.attach('.carousel', options);

    // Loop on each carousel initialized
    for(var i = 0; i < carousels.length; i++) {
    	// Add listener to  event
    	carousels[i].on('before:show', state => {
    		console.log(state);
    	});
    }

    // Access to bulmaCarousel instance of an element
    var element = document.querySelector('#my-element');
    if (element && element.bulmaCarousel) {
    	// bulmaCarousel instance is available as element.bulmaCarousel
    	element.bulmaCarousel.on('before-show', function(state) {
    		console.log(state);
    	});
    }

    /*var player = document.getElementById('interpolation-video');
    player.addEventListener('loadedmetadata', function() {
      $('#interpolation-slider').on('input', function(event) {
        console.log(this.value, player.duration);
        player.currentTime = player.duration / 100 * this.value;
      })
    }, false);*/
    preloadInterpolationImages();

    $('#interpolation-slider').on('input', function(event) {
      setInterpolationImage(this.value);
    });
    setInterpolationImage(0);
    $('#interpolation-slider').prop('max', NUM_INTERP_FRAMES - 1);

    bulmaSlider.attach();

    // Arrange example GIFs so similar heights are adjacent
    function arrangeExamplesByHeight() {
      var $gallery = $('.scroll-gallery');
      if ($gallery.length === 0) return;

      var $imgs = $gallery.find('img');
      var total = $imgs.length;
      if (total === 0) return;

      var loadedCount = 0;
      var items = [];

      function tryArrange() {
        if (loadedCount < total) return;
        // Group by exact height so same-height GIFs share rows
        var groupsByHeight = {};
        items.forEach(function(it){
          var key = String(it.h);
          if (!groupsByHeight[key]) groupsByHeight[key] = [];
          groupsByHeight[key].push(it);
        });
        var heights = Object.keys(groupsByHeight).map(function(k){ return parseInt(k, 10); });
        heights.sort(function(a, b){ return a - b; });
        var leftovers = [];
        heights.forEach(function(h){
          var group = groupsByHeight[String(h)];
          for (var i = 0; i < group.length; i += 2) {
            var a = group[i];
            var b = group[i + 1];
            if (a && b) {
              $gallery.append(a.el);
              $gallery.append(b.el);
            } else if (a) {
              leftovers.push(a);
            }
          }
        });
        // Pair any leftovers (no exact match available)
        for (var j = 0; j < leftovers.length; j += 2) {
          if (leftovers[j]) $gallery.append(leftovers[j].el);
          if (leftovers[j + 1]) $gallery.append(leftovers[j + 1].el);
        }
      }

      $imgs.each(function(i) {
        var img = this;
        var originalIndex = i;
        function onReady() {
          items.push({ el: img, h: img.naturalHeight || img.height || 0, idx: originalIndex });
          loadedCount += 1;
          tryArrange();
        }
        if (img.complete && img.naturalHeight) {
          onReady();
        } else {
          $(img).one('load', onReady).one('error', function(){ onReady(); });
        }
      });
    }

    arrangeExamplesByHeight();
    // Also rearrange after a short delay in case of cached async loads
    setTimeout(arrangeExamplesByHeight, 500);
    setTimeout(arrangeExamplesByHeight, 1500);

    // Ensure GIFs replay by periodically resetting src (cache-busting)
    function enableGifLoop($imgs, intervalMs) {
      $imgs.each(function() {
        var img = this;
        var baseSrc = img.getAttribute('data-base-src') || img.getAttribute('src');
        // Strip prior cache-busting if present
        baseSrc = baseSrc.split('?')[0];
        img.setAttribute('data-base-src', baseSrc);

        function scheduleNext() {
          var declaredDuration = parseInt(img.getAttribute('data-duration-ms') || '', 10);
          var period = intervalMs || (isNaN(declaredDuration) ? 8000 : (declaredDuration + 1000));
          setTimeout(function() {
            var ts = Date.now();
            // After reload, schedule again
            $(img).one('load', function(){ scheduleNext(); });
            img.src = baseSrc + '?t=' + ts;
          }, period);
        }

        // Start independent loop for this image
        scheduleNext();
      });
    }

    // Apply looping to both examples and comparison GIFs
    enableGifLoop($('.scroll-gallery img'));
    enableGifLoop($('.comparison img'));

})
