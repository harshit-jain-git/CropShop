
var jcrop, selection

var overlay = ((active) => (state) => {
  active = (typeof state === 'boolean') ? state : (state === null) ? active : !active
  $('.jcrop-holder')[active ? 'show' : 'hide']()
  chrome.runtime.sendMessage({message: 'active', active})
})(false)

makeblob = function (dataURL) {
            var BASE64_MARKER = ';base64,';
            if (dataURL.indexOf(BASE64_MARKER) == -1) {
                var parts = dataURL.split(',');
                var contentType = parts[0].split(':')[1];
                var raw = decodeURIComponent(parts[1]);
                return new Blob([raw], { type: contentType });
            }
            var parts = dataURL.split(BASE64_MARKER);
            var contentType = parts[0].split(':')[1];
            var raw = window.atob(parts[1]);
            var rawLength = raw.length;

            var uInt8Array = new Uint8Array(rawLength);

            for (var i = 0; i < rawLength; ++i) {
                uInt8Array[i] = raw.charCodeAt(i);
            }

            return new Blob([uInt8Array], { type: contentType });
        }

var image = (done) => {
  var image = new Image()
  image.id = 'fake-image'
  image.src = chrome.runtime.getURL('/images/pixel.png')
  image.onload = () => {
    $('body').append(image)
    done()
  }
}

var init = (done) => {
  $('#fake-image').Jcrop({
    bgColor: 'none',
    onSelect: (e) => {
      selection = e
      capture()
    },
    onChange: (e) => {
      selection = e
    },
    onRelease: (e) => {
      setTimeout(() => {
        selection = null
      }, 100)
    }
  }, function ready () {
    jcrop = this

    $('.jcrop-hline, .jcrop-vline').css({
      backgroundImage: 'url(' + chrome.runtime.getURL('/images/Jcrop.gif') + ')'
    })

    if (selection) {
      jcrop.setSelect([
        selection.x, selection.y,
        selection.x2, selection.y2
      ])
    }

    done && done()
  })
}

var capture = (force) => {
  chrome.storage.sync.get((config) => {
    if (selection && (config.method === 'crop' || (config.method === 'wait' && force))) {
      jcrop.release()
      setTimeout(() => {
        chrome.runtime.sendMessage({
          message: 'capture', area: selection, dpr: devicePixelRatio
        }, (res) => {
          overlay(false)
          selection = null
          save(res.image)
        })
      }, 50)
    }
    else if (config.method === 'view') {
      chrome.runtime.sendMessage({
        message: 'capture',
        area: {x: 0, y: 0, w: innerWidth, h: innerHeight}, dpr: devicePixelRatio
      }, (res) => {
        overlay(false)
        save(res.image)
      })
    }
  })
}

var filename = () => {
  var pad = (n) => ((n = n + '') && (n.length >= 2 ? n : '0' + n))
  var timestamp = ((now) =>
    [pad(now.getFullYear()), pad(now.getMonth() + 1), pad(now.getDate())].join('-')
    + ' - ' +
    [pad(now.getHours()), pad(now.getMinutes()), pad(now.getSeconds())].join('-')
  )(new Date())
  return 'Screenshot Capture - ' + timestamp + '.png'
}

// code to download the image
var save = (image) => {
  var link = document.createElement('a')
  link.download = filename()
  link.href = image
  link.click()
  console.log(link.href)
  processImage()
}


function processImage() {
  
        // Replace the subscriptionKey string value with your valid subscription key.
        var subscriptionKey = "fa3347adf4584ce08b9c1fb054bd8bc9"; // Updated

        // Replace or verify the region.
        var uriBase = "https://southeastasia.api.cognitive.microsoft.com/vision/v1.0/analyze";

        // Request parameters.
        var params = {
            "visualFeatures": "Categories,Description,Color",
            "details": "",
            "language": "en",
        };

        // Display the image.
        var sourceImageUrl = image;

        // Perform the REST API call.
        $.ajax({
            url: uriBase + "?" + $.param(params),

            // Request headers.
            beforeSend: function(xhrObj){
                xhrObj.setRequestHeader("Content-Type","application/json");
                xhrObj.setRequestHeader("Ocp-Apim-Subscription-Key", subscriptionKey);
            },

            type: "POST",
            processData: false,
            contentType: 'application/octet-stream',
            data: makeblob('data:image/png;base64,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')

        })

        .done(function(data) {
            // Show formatted JSON on webpage.
            console.log(JSON.stringify(data, null, 2));
        })

        .fail(function(jqXHR, textStatus, errorThrown) {
            // Display error message.
            var errorString = (errorThrown === "") ? "Error. " : errorThrown + " (" + jqXHR.status + "): ";
            errorString += (jqXHR.responseText === "") ? "" : jQuery.parseJSON(jqXHR.responseText).message;
            alert(errorString);
        });
    };

window.addEventListener('resize', ((timeout) => () => {
  clearTimeout(timeout)
  timeout = setTimeout(() => {
    jcrop.destroy()
    init(() => overlay(null))
  }, 100)
})())

chrome.runtime.onMessage.addListener((req, sender, res) => {
  if (req.message === 'init') {
    res({}) // prevent re-injecting

    if (!jcrop) {
      image(() => init(() => {
        overlay()
        capture()
      }))
    }
    else {
      overlay()
      capture(true)
    }
  }
  return true
})
