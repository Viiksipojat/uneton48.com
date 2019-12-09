'use strict'

console.info("\n\
                                     /   __                                 __ \n\
        /                      _/_  /      )                _/_        /  /(  )\n\
, _o o /_  _   o _   __ o __.  /    \\    -/    . . ____  _  /  __ ____'--/ ./' \n\
\\/<_<_/ <_/_)_<_/_)_(_)/_(_/|_<__    \\___/    (_/_/ / <_</_<__(_)/ / <_ / (__) \n\
               /      /                                                        \n\
              '     -'                                                         \n\
")

// polyfill NodeList.forEach (for ie11) 🦆
if (window.NodeList && ! NodeList.prototype.forEach) {
	NodeList.prototype.forEach = Array.prototype.forEach
}

// expand template components
var components = [], templates = document.querySelectorAll("template")
templates.forEach(function(template) {
	var id = template.id
	var targets = document.querySelectorAll(id)
	console.debug("COMPONENT", id, targets)

	targets.forEach(function(target) {
		var clone = document.importNode(template.content, true)
		target.appendChild(clone)
		// window[id] component functions at the bottom
		var component = window[id] instanceof Function ? new window[id](target) : target
		components.push(target)
	})
})

// plz place this multilang sitemap hack into your ghost > code injection > {{ghost_head}}
// var sitemap = {
// 	index: {
// 		fi: "/",
// 		en: "/en/",
// 	},
// }

if (! window.sitemap) var sitemap = {}
var sitemap_reverse = {}

for (var site in sitemap) {
	for (var lang in sitemap[site])
		sitemap_reverse[sitemap[site][lang]] = sitemap[site]
}
// inject alternate language target
document.querySelectorAll("#lang-switch a").forEach(function(a) {
	var path = sitemap_reverse[location.pathname]
	if (path) a.href = path[a.hreflang]

	if (a.getAttribute("href") == location.pathname) a.classList.add("current")
})

// hide alternate language navigation
document.querySelectorAll("#navigation li").forEach(function(li) {
	// var currentLang = document.documentElement.lang // GHOST FAIL
	var current = document.querySelector("#lang-switch a.current")
	var currentLang = current ? current.hreflang : "fi" // fi default
	var href = li.firstChild.getAttribute("href")

	// maybe bail
	if (! sitemap_reverse[href]) return

	if (sitemap_reverse[href][currentLang] != href) li.classList.add("hidden")
})
document.querySelector("#navigation").classList.remove("hidden")

// lazy loader vimeo player play button
// document.querySelectorAll("figure").forEach(function(figure) {
document.querySelectorAll(".filmgrid > figure, .tag-filmgrid > .post-content > figure").forEach(function(figure) {
	// warning: these are lazy selects
	var vimeo = figure.querySelector("iframe")
	var img = figure.querySelector("img")
	var button = figure.querySelector("button")

	// we have no button and no iframe, let's orchestrate them
	if (! button && ! vimeo) {
		button = document.createElement("button")
		button.innerHTML = '\
			<svg xmlns="http://www.w3.org/2000/svg">\n\
				<use href="#vimeo-play" xlink:href="#vimeo-play"></use>\n\
			</svg>'
		figure.appendChild(button)
	}

	button && button.addEventListener("click", function(e) {
		// console.log("vimeo", figure, vimeo)

		// no iframe that's clever much faster pageload 😇
		if (! vimeo) {
			vimeo = document.createElement("iframe")
			vimeo.dataset.src = "https://player.vimeo.com/video/" + figure.id.replace(/^v_/, "")
			img.parentElement.appendChild(vimeo)
		}

		// igniteeeee
		figure.classList.add("load")
		vimeo.setAttribute("allowfullscreen", "")
		vimeo.setAttribute("allow", "fullscreen, autoplay")

		// WARNING we assume no previous parameters
		vimeo.src = vimeo.dataset.src + "?transparent=false&autoplay=true"

		// coustom fun
		var player = new Vimeo.Player(vimeo)
		player.on("loaded", function(e) {
			// console.info("loaded", e)
			// player.play()
		})
		player.on("play", function(e) {
			// console.info("play", e)
			figure.classList.add("play")
		})
		player.on("pause", function(e) {
			// console.info("pause", e)
			figure.classList.remove("play")
		})
	})
})


// <TEMPLATE> COMPONENTS (autoloaded in the beginning)

function countdown(target) {
	this.target = target
	this.load = new Date()
	console.info("INIT", this)

	// plz place these inside your <countdown><script>
	// var events = {
	// 	head: { fi: "Aikaa ", en: "Time until "},
	// 	regs: { date: new Date("2020-03-20T00:00+03:00"), fi: "ensi vuoden rekisteröitymiseen", en: "next year registration"},
	// 	start: { date: new Date("2019-05-17T19:00+03:00"), fi: "kisan alkuun", en: "challenge begin"},
	// 	finish: { date: new Date("2019-05-19T19:30+03:00"), fi: "palautukseen", en: "drop-off"},
	// }

	function tick() {
		var lang = "text" //document.documentElement.lang
		var now = new Date(), remaining = 0, event

		// find current event
		for (event in events) {
			remaining = events[event].date - now
			if (remaining > 0) break
		}

		// console.info("TICK", event, getTimeUnits(remaining))
		target.className = event
		target.querySelector("h3,h2,h1").textContent = events[event][lang]
		updateTimeUnits(target.querySelector("time"), getTimeUnits(remaining))
	}

	// TIMER SYNCCCCC (disabled)
	var sync = false
	function tock() {
		var now = new Date()
		var s = now.getSeconds()
		var ms = now.getMilliseconds()
		console.info("TOCK", s, ms)
		if (sync) return

		// find zero sync....
		// if (ms < 5 || ms > 995) {
		if (Math.abs(500 - ms) < 5) {
			sync = true
			window.setInterval(tick, 1000)
			window.setInterval(tock, 1000)
			console.info("TOCK SYNC")
			return
		}

		// try next +10ms...
		window.setTimeout(tock, 8)
	}

	// IGNITE TIMER
	if (target) {
		window.setTimeout(tick, 0)
		// window.setTimeout(tock, 0)
		window.setInterval(tick, 1000)
	}

	//               ms    s   min h
	var timeunits = [1000, 60, 60, 24]
	function getTimeUnits(ts) {
		var units = []

		// past all events, ts++
		if (ts < 0) ts = 1000 - ts

		for (var i = 0; i < timeunits.length; i++) {
			var unit = timeunits[i]
			units.unshift(ts % unit)
			ts = Math.floor(ts / unit)
		}

		// scraps
		units.unshift(ts)

		return units
	}

	function updateTimeUnits(target, units) {
		// skip milliseconds fffff 🤑
		for (var i = 0 ; i < target.children.length ; i++) {
			target.children[i].textContent = units[i]
		}

		// machine duration
		target.setAttribute("datetime", "P"+units[0]+"DT"+units[1]+"H"+units[2]+"M"+units[3]+"S")
	}
}
