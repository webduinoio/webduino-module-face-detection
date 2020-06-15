+(function (window, document) {
  'use strict';

  const BASE_URL = 'https://webduinoio.github.io/webduino-module-face-tracker';

  function addHTMLContent() {
    const container = document.createElement('div');
    const wrapper = document.createElement('div');
    container.id = 'facedetect-picojs-container';
    wrapper.id = 'facedetect-picojs-wrapper';
    container.appendChild(wrapper);
    document.body.appendChild(container);
  }
  
  /*
	This code was taken from https://github.com/cbrandolino/camvas and modified to suit our needs
  */
  /*
  Copyright (c) 2012 Claudio Brandolino

  Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

  The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
  */
  // The function takes a canvas context and a `drawFunc` function.
  // `drawFunc` receives two parameters, the video and the time since
  // the last time it was called.
  function camvas(ctx, callback) {
    let self = this;
    this.ctx = ctx;
    this.callback = callback;

    // We can't `new Video()` yet, so we'll resort to the vintage
    // "hidden div" hack for dynamic loading.
    let streamContainer = document.createElement('div');
    this.video = document.createElement('video');

    // If we don't do this, the stream will not be played.
    // By the way, the play and pause controls work as usual 
    // for streamed videos.
    this.video.setAttribute('autoplay', '1');
    this.video.setAttribute('playsinline', '1'); // important for iPhones

    // The video should fill out all of the canvas
    this.video.setAttribute('width', 1);
    this.video.setAttribute('height', 1);

    streamContainer.appendChild(this.video);
    document.body.appendChild(streamContainer);

    // The callback happens when we are starting to stream the video.
    navigator.mediaDevices.getUserMedia({video: true, audio: false}).then(function(stream) {
      // Yay, now our webcam input is treated as a normal video and
      // we can start having fun
      self.video.srcObject = stream;
      // Let's start drawing the canvas!
      self.update();
    }, function(err) {
      throw err;
    })

    // As soon as we can draw a new frame on the canvas, we call the `draw` function 
    // we passed as a parameter.
    this.update = function() {
    let self = this;
      let last = Date.now();
      let loop = function() {
        // For some effects, you might want to know how much time is passed
        // since the last frame; that's why we pass along a Delta time `dt`
        // variable (expressed in milliseconds)
        let dt = Date.now() - last;
        self.callback(self.video, dt);
        last = Date.now();
        requestAnimationFrame(loop); 
      }
      requestAnimationFrame(loop);
    } 
  }

  // this function was taken from https://github.com/tehnokv/picojs/blob/master/pico.js
  // see the following post for explanation: https://tkv.io/posts/picojs-intro/
  var instantiate_detection_memory = function(size) {
    /*
      initialize a circular buffer of `size` elements
    */
    let n = 0, memory = [];
    for(let i=0; i<size; ++i)
      memory.push([]);
    /*
      build a function that:
      (1) inserts the current frame's detections into the buffer;
      (2) merges all detections from the last `size` frames and returns them
    */
    function update_memory(dets) {
      memory[n] = dets;
      n = (n+1)%memory.length;
      dets = [];
      for(let i=0; i<memory.length; ++i) {
        dets = dets.concat(memory[i]);
      }
      return dets;
    }
    /*
      we're done
    */
    return update_memory;
  }

  let update_memory = instantiate_detection_memory(5); // last 5 frames

  window._facedetect_pico_ = (function() {
    let inited = false;
    let drawBox = true;
    let opacity = 1.0;
    let values = {
      count: 0,
      data: [],
    };

    function start_tracking() {
      if (typeof Module === 'undefined' || typeof Module.asm === 'undefined' || typeof Module.asm._malloc === 'undefined') {
        console.log('waiting for wasm module loaded...')
        setTimeout(start_tracking, 100);
        return;
      }
  
      let nrows=480, ncols=640;
      let ppixels = Module._malloc(nrows*ncols);
      let pixels = new Uint8Array(Module.HEAPU8.buffer, ppixels, nrows*ncols);
  
      let maxndetections = 1024;
      let prcsq = Module._malloc(4*4*maxndetections)
      let rcsq = new Float32Array(Module.HEAPU8.buffer, prcsq, maxndetections);
  
      function rgba_to_grayscale(rgba, nrows, ncols) {
        for(let r=0; r<nrows; ++r)
          for(let c=0; c<ncols; ++c)
            // gray = 0.2*red + 0.7*green + 0.1*blue
            pixels[r*ncols + c] = (2*rgba[r*4*ncols+4*c+0]+7*rgba[r*4*ncols+4*c+1]+1*rgba[r*4*ncols+4*c+2])/10;
        return pixels;
      }
      // var ctx = document.getElementsByTagName('canvas')[0].getContext('2d');
      const canvas = document.createElement('canvas');
      canvas.width = 640;
      canvas.height = 480;
      canvas.style = 'display: block; width: 100%; height: 100%;';
      canvas.style.opacity = opacity;
      const ctx = canvas.getContext('2d');

      let t_diff = 1000;
      let dtSum = 0;
      let dtCount = 10;
      let fps = 0.0;
      let processfn = function (video, dt) {
        // clear previous values
        values.count = 0;
        values.data = [];
        // set opacity
        canvas.style.opacity = opacity;

        let t_begin = Date.now();
        // render the video frame to the canvas element
        ctx.save();
        ctx.translate(ncols, 0);
        ctx.scale(-1, 1);
        ctx.drawImage(video, 0, 0);
        ctx.restore();
  
        // Calculate and draw fps
        if (dtCount) {
          dtCount--;
          dtSum += t_diff;
        } else {
          fps = Math.round(100000 / dtSum) / 10;
          dtSum = 0;
          dtCount = 10;
        }
        ctx.fillText("fps: " + fps, 10, 10);
  
        let rgba = ctx.getImageData(0, 0, ncols, nrows).data;
        rgba_to_grayscale(rgba, nrows, ncols);
        //
        let params = {
          "shiftfactor": 0.1, // move the detection window by 10% of its size
          "minsize": 100,     // minimum size of a face
          "maxsize": 1000,    // maximum size of a face
          "scalefactor": 1.1  // for multiscale processing: resize the detection window by 10% when moving to the higher scale
        }
        // run the detector across the frame
        // rcsq is an array representing row, column, scale and detection score
        let ndetections = Module._find_faces(prcsq, maxndetections, ppixels, nrows, ncols, ncols, params.scalefactor, params.shiftfactor, params.minsize, params.maxsize);
        // this is hackish as hell but gets the job done
        // actually, we can omit this process completely but this would lead to lower detection quality
        // (a better solution: implement all this in C)
        let dets = [];
        for(let i=0; i<ndetections; ++i) {
          dets.push( [rcsq[4*i+0], rcsq[4*i+1], rcsq[4*i+2], rcsq[4*i+3]]);
        }

        dets = update_memory(dets);
        ndetections = Math.min(maxndetections, dets.length)
        for(let i=0; i<ndetections; ++i) {
          rcsq[4*i+0] = dets[i][0];
          rcsq[4*i+1] = dets[i][1];
          rcsq[4*i+2] = dets[i][2];
          rcsq[4*i+3] = dets[i][3];
        }
        // cluster multiple detections found around each face
        ndetections = Module._cluster_detections(prcsq, ndetections);
        // draw detections
        for(let i=0; i<ndetections; ++i) {
          // check the detection score
          // if it's above the (empirical) threshold, draw it
          if(rcsq[4*i+3]>50.0) {
            let w = rcsq[4*i+2];

            values.data.push({
              x: rcsq[4*i+1] - (w>>1),
              y: rcsq[4*i+0] - (w>>1),
              width: w,
              height: w,
            });

            if (drawBox) {
              ctx.beginPath();
              ctx.rect(rcsq[4*i+1] - (w>>1), rcsq[4*i+0] - (w>>1), w, w);
              ctx.lineWidth = 3;
              ctx.strokeStyle = 'red';
              ctx.stroke();
            }
          }
        }
        values.count = values.data.length;
        t_diff = Date.now() - t_begin;
      }

      // add HTML element and canvas
      addHTMLContent();
      document.getElementById('facedetect-picojs-wrapper').appendChild(canvas);
      const mycamvas = new camvas(ctx, processfn);
    }

    function init() {
      if (inited) return;
      inited = true;

      fetch(BASE_URL + '/wasmpico.wasm').then(function(response) {
        response.arrayBuffer().then(function(buffer) {
          WebAssembly.compile(buffer).then(function() {
            // the script 'wasmpico.js' will instantiate this object once the 'wasmpico.wasm' loads
            var script  = document.createElement('script');
            script.src  = BASE_URL + '/wasmpico.js';
            script.type = 'text/javascript';
            script.defer = true;
            document.getElementsByTagName('head').item(0).appendChild(script);

            console.log('* wasm loaded');
            start_tracking();
          });
        });
      });
    }

    // initialize
    init();

    return {
      /**
       * Display face box or not
       *
       * @param {boolean} display
       */
      displayBox(display) {
        if (typeof display !== 'boolean') {
          throw new Error('input argument must be a boolean');
        }

        drawBox = display;
      },

      /**
       * Set canvas opacity
       * @param {number} value
       */
      setOpacity(value) {
        opacity = value;
      },

      /**
       * Get values from results object
       * @param {number} index Index
       * @param {string} type Type
       */
      getValues(index, type) {
        index = index - 1;
        if (!values.data[index]) return;
        else return values.data[index][type];
      },

      get faceCount() {
        return values.count;
      }
    }
  })();
}(window, window.document));
