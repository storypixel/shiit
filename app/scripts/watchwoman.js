//donotsleep.js
'use strict';

// ----------------------------------------------------------------------------
// sleepless, a Javascript lib
// Licensed under the MIT license.
// http://x
// ----------------------------------------------------------------------------
// Copyright (C) 2014 Sam Wilson
// http://iamnotsam.com/
// ----------------------------------------------------------------------------


(function (name, context, factory) {
	if (typeof module !== 'undefined' && module.exports) {
		module.exports = factory();
	} else if (typeof context.define === 'function' && context.define.amd) {
		context.define(name, [], factory);
	} else {
		context[name] = factory();
	}
    
})('watchwoman', this, function () {
    
	var watchwoman = {
		defaults: {
			document: document // iframe support
		},

		deviceIsAndroid: navigator.userAgent.indexOf('Android') > 0,
		deviceIsIOS: /iP(ad|hone|od)/.test(navigator.userAgent),
		androidSleepStarted: false,
		sleepStartedIOS: false,
		sleepStartedAndroid: false,

		prevent: function (options) {
			options = options || {};

			var loop = options.loop || '/videos/silence.mp4',
			url = options.url || '/endless/nothing',
			loopms = options.loopms || 20000,
			iOSSleepIntervalId,
			fakeVideo;
			// var pid = 0,
			//     events = [],
			//     eventsOnce = {},
			//     supported = buzz.isSupported();

			// publics
			this.caffeinate = function(){
				// this is lazy. Detect then call only the right fucntion TODO
				this.decaffeinate();
				this.preventSleepForIOS();
				this.preventSleepForAndroid();
			};

			this.decaffeinate = function(){
				// this is lazy. Detect then call only the right fucntion TODO
				this.allowSleepForIOS();
				this.allowSleepForAndroid();
			};

			this.preventSleepForIOS = function () {
				// TODO
				if (/*1 || */!watchwoman.deviceIsIOS){
					return this;
				}
				this.allowSleepForIOS();
				iOSSleepIntervalId = setInterval(function () {
					window.location.href = url;
					window.setTimeout(function () {
						window.stop();
					}, 0);
				}, loopms);

				return this;
			};

			this.allowSleepForIOS = function() {
				if (iOSSleepIntervalId){
					clearInterval(iOSSleepIntervalId);
				}
				return this;
			};

			this.preventSleepForAndroid = function () {
				if (/*0 && */!watchwoman.deviceIsAndroid){
					return this;
				}

				var that = this;
				if (watchwoman.androidSleepStarted) {
					return false;
				}

				if (fakeVideo) {
					fakeVideo.parentNode.removeChild(fakeVideo);
				}
				watchwoman.androidSleepStarted = true;
				fakeVideo = document.createElement('video');
				fakeVideo.setAttribute('id', 'videoAudioLoop');
				fakeVideo.setAttribute('loop', true);
				fakeVideo.src = loop; // see options
				// TODO: assuming ecma 3 with this named function. create alternative
				fakeVideo.addEventListener('progress', function progressCheck() {
					if (fakeVideo.currentTime === 0) {
						fakeVideo.removeEventListener('progress', progressCheck, false);
						that.androidSleepStarted = false;
					}
				});
				fakeVideo.style.display = 'none'; // make sure this doesn't negate the effect. TODO
				fakeVideo.play();
				document.body.appendChild(fakeVideo);

				return this;
			};

			this.allowSleepForAndroid = function() {
				watchwoman.androidSleepStarted = false;
				return this;
			};

			// privates
			// function someThing() {

			// }

			// init TODO
			if (/*1 || */watchwoman.deviceIsAndroid || watchwoman.deviceIsIOS) {
				//console.log('initted watchwoman');
				this.caffeinate();
			}
		}

	};

	watchwoman.prevent();

	return watchwoman;
});

// (function (name, context, factory) {
//     if (typeof module !== 'undefined' && module.exports) {
//         module.exports = factory();
//     } else if (typeof context.define === 'function' && context.define.amd) {
//         define(name, [], factory);
//     } else {
//         context[name] = factory();
//     }
// })('sleepless', this, function () {

//     var sleepless = {
//         defaults: {
//             autoplay: false,
//             duration: 5000,
//             formats: [],
//             loop: false,
//             placeholder: '--',
//             preload: 'metadata',
//             volume: 80,
//             document: document // iframe support
//         },
//         types: {
//             'mp3': 'audio/mpeg',
//             'ogg': 'audio/ogg',
//             'wav': 'audio/wav',
//             'aac': 'audio/aac',
//             'm4a': 'audio/x-m4a'
//         },
//         sounds: [],
//         el: document.createElement('audio'),

//         sound: function (src, options) {