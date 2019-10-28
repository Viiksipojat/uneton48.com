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

// expand components
var components = [], templates = document.querySelectorAll("template")
templates.forEach(function(component) {
	var id = component.id
	var targets = document.querySelectorAll(id)
	// console.debug("COMPONENT", id, targets)

	targets.forEach(function(target) {
		var clone = document.importNode(component.content, true)
		target.appendChild(clone)
		components.push(new window[id](target))
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
