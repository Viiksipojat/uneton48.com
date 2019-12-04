// Vanilla version of FitVids
// Still licencened under WTFPL
//
// Not as robust and fault tolerant as the jQuery version.
// It's BYOCSS.
// And also, I don't support this at all whatsoever.

// https://gist.github.com/davatron5000/e9ef20f1d2ba4d9099711064c644d155

(function(window, document, undefined) {
	'use strict'
	
	// List of Video Vendors embeds you want to support
	var players = [
		'iframe[src*="youtube.com"]',
		'iframe[src*="vimeo.com"]',
		// 'iframe[data-src*="youtube.com"]',
		// 'iframe[data-src*="vimeo.com"]',
		'iframe.lazy',
		'.fitvid',
	]
	
	// Select videos
	var fitVids = document.querySelectorAll(players.join(','))
	
	// Loop through videos
	fitVids.forEach(function(fitVid) {
		// Get Video Information
		var width = fitVid.getAttribute('width')
		var height = fitVid.getAttribute('height')
		var aspectRatio = height/width
		var parent = fitVid.parentNode

		// Wrap it in a DIV
		var div = document.createElement('div')
		div.className = 'fitVids-wrapper'
		div.style.paddingBottom = aspectRatio * 100 + "%"
		parent.insertBefore(div, fitVid)
		div.appendChild(fitVid)

		// Clear height/width from fitVid
		fitVid.removeAttribute('height')
		fitVid.removeAttribute('width')
	})
})(window, document)
