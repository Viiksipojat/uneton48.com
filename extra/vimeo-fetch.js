// RUN: node [--inspect] vimeo-fetch.js [-y] [-n] PATH
// get help with no parameters

const fs = require('fs'),
	readline = require('readline'),
	util = require('util'),
	Vimeo = require('vimeo').Vimeo,
	options = {
		client: "20990d9dd6efd8d6e9ea5649c07d958753de0738", // sampumon/elokuva-arkisto
		token: "7546607bac3560d7d8af317e4187f706", // public unauthenticated
		// path: "/users/uneton48/videos",
		// base: "users_uneton48_videos",
		query: {
			// fields: "uri,name,description,type,link,duration,width,language,height,release_time,content_rating,license,privacy,pictures,tags,stats,categories",
			// sort: "alphabetical",
			sort: "manual",
			sizes: "640x",
			// per_page: 100,
			// filter: public, length>0
		}
	},
	params = {},
	meta = [
		"id",
		"name",
		"link",
		"description",
		"release_time",
		"thumbnail",
		"tags",
		"categories",
		"duration",
		"width",
		"height",
	]

// CTRL+C
process.on('SIGINT', async function(code) {
	console.error("horseyExitWoopWoop 🐴")

	console.info(`GOT ${countedVideos}/${totalVideos} videos so far (${videos.length} after filtering)`)

	if (options.force) await writeOutputFiles(videos)

	process.exit(1)
})

// BEGIN MAIN

let client = new Vimeo(options.client, options.secret, options.token)
let jobs = [], videos = {}, countedVideos = 0, totalVideos

// OPTIONS
for (const arg of process.argv.slice(2)) {
	if (arg[0] == "-") params[arg] = true
	else options.path = arg
}

if (! options.path) {
	console.info(`Usage: node [--inspect] vimeo-fetch.js [options & outputs] PATH
Example: node vimeo-fetch.js users/uneton48/albums --raw --json

      PATH  vimeo api endpoint with videos/albums, eg. /users/uneton48/videos

Options (they are optional)
 --inspect  find your debugger @ chrome://inspect
        -y  write output even on failures
        -n  dry-run
        -r  [TODO] "recursively" attempt to fetch and inject PATH/videos
     --raw  don't parse vimeo output, use if not fetching videos

Outputs (pass to enable)
    --html  template'd html figure img shit
    --json  main json video/album array
     --tsv  debug tsv for ur pleasure
   --ghost  json post to be imported into ghost > labs > import content
  --images  [TODO] fetch them thumbnail images → thumb/*

on success, outputs BASE.{json,html,tsv}, where BASE is PATH with / → _
if any vimeo page fails (or ctrl+c happens), no output [unless -y]
	`)

	process.exit()
}

// derived options [can be undefined]
options.force = params["-y"] && !params["-n"]
if (! options.base) options.base = options.path.replace(/\//g, "_")

// let's go!!
jobs.push({ path: options.path, page: 1 })
main()

function main() {
	let status = "", total = 0, done = 0, failed = 0

	for (let job of jobs) {
		if (! job.started) {
			job.started = Date.now()

			fetchThatApiChunk(job.path).then(body => {
				// videos.push(...parseVimeoChunk(body))
				if (! body instanceof Array) job.single = true
				job.results = parseVimeoChunk(body)
				job.finished = Date.now()
			}).catch(error => {
				try { error = JSON.parse(error.message) }
				catch (e) { }
				console.error(error)
				job.failed = Date.now()
			}).finally(main)
		}

		total++
		if (job.finished) done++
		if (job.failed) failed++
		status += job.finished ? "o" : job.failed ? "x" : "."
	}

	status += ` ${done}/${total}` + (failed ? ` [${failed} failed]` : "")
	console.info(status)

	// processing continues…?
	if (total > done + failed) return

	// flatten results
	videos = jobs.reduce((all, job) => all.concat(job.results), [])

	console.info(`TOTAL ${countedVideos}/${totalVideos} videos (${videos.length} after filtering)`)

	// skip output files
	if (params["-n"] || failed && ! params["-y"]) return

	writeOutputFiles(videos)
}

function fetchThatApiChunk(path) {
	return new Promise((resolve, reject) => {
		client.request({
			method: 'GET',
			path: path,
			query: options.query
		}, function (error, body, status_code, headers) {
			if (error) reject(error)
			else resolve(body)
		})
	})
}

// VIMEO HELPERS

// parse page data chunk, add jobs if first page
function parseVimeoChunk(body) {
	// console.info(`got page ${body.page}/${body.total / body.per_page}`)

	if (! body.data) {
		console.warn("parseVimeoChunk: no body.data, assuming single resource")
		// body = { data: [body] }
		return body
	}

	else if (body.paging.previous === null) {
		totalVideos = body.total
		addVimeoPageJobs(body)
	}

	countedVideos += body.data.length

	if (params["--raw"]) return body.data

	// filter empty (failed upload) & unlisted videos + parse metadata
	return body.data
		.filter(v => v.duration > 0 && v.privacy.view == "anybody")
		.map(filterVideoMetadata)
}

function addVimeoPageJobs(body) {
	const groups = body.paging.last.match(/(?<base>.*[?&]page=)(?<page>[0-9]*)/).groups

	for (let n = 2; n <= groups.page; n++)
		jobs.push({ path: groups.base + n, page: n })
}

function filterVideoMetadata(vimeo) {
	let filtered = {}
	
	for (const field of meta) filtered[field] = vimeo[field]

	// HACKS
	filtered.id = vimeo.uri.replace(/.*\//, "")
	filtered.thumbnail = vimeo.pictures.sizes[0].link.replace(/\?r=pad/, "") //.replace(/_100x75\..*/, "_320x180.jpg")
	filtered.categories = vimeo.categories.map(category => category.name)
	filtered.tags = vimeo.tags.map(tag => tag.name)

	return filtered
}

// OUTPUT GENERATORS

function debugTSVgenerator(vimeos) {
	let tsv = meta.join("\t") + "\n"

	for (const vimeo of vimeos) {
		let row = []
		for (const field of meta) row.push(vimeo[field])

		// SEMI-DANGEROUS INDEXING HACK
		row[3] = vimeo.description && vimeo.description.replace(/\n/g, "\\n").replace(/&quot;/g, "\"")

		tsv += row.join("\t") + "\n"
	}

	return tsv
}

function HTMLgenerator(vimeos, advanced=false) {
	let html_basic = "", html_advanced = ""

	for (const vimeo of vimeos) {
		html_basic += 
`<figure id="v_${vimeo.id}">
	<img class="lazy" data-src="${vimeo.thumbnail}">
	<figcaption>
		<a href="${vimeo.link}">${vimeo.name}</a>
	</figcaption>
</figure>
`
	// NOTE: even an empty iframe slows page load ~ 1s / 100 iframe
		html_advanced += 
`<figure id="v_${vimeo.id}">
	<div class="fitVids-wrapper">
		<img class="lazy" data-src="${vimeo.thumbnail}">
		<iframe data-src="https://player.vimeo.com/video/${vimeo.id}"></iframe>
	</div>
	<button>
		<svg xmlns="http://www.w3.org/2000/svg">
			<use href="#vimeo-play" xlink:href="#vimeo-play"></use>
		</svg>
	</button>
	<figcaption>
		<a href="${vimeo.link}">${vimeo.name}</a>
	</figcaption>
</figure>
`
	}

	return advanced ? html_advanced : html_basic
}

function GhostGenerator(vimeos) {
	let ghost = {
		meta: {
			exported_on: Date.now(),
			version: "2.31.1",
		},
		data: {
			posts: [{
				id: 0,
				title: "TODO: fetch title from album?",
				// https://github.com/bustle/mobiledoc-kit/blob/master/MOBILEDOC.md
				mobiledoc: {
					version: '0.3.1',
					markups: [],
					atoms: [],
					cards: [],
					sections: [],
				},
				// html: HTMLgenerator(vimeos), // need migrate
				// status: "published",
				published_at: Date.now(),
				author_id: 1,
			}],
			users: [{
				id: 1,
				name: "Vimeo-fetch",
				email: "vimeo@viiksipojat.fi",
			}]
		}
	}

	for (let i=0; i<vimeos.length; i++) {
		vimeo = vimeos[i]
		ghost.data.posts[0].mobiledoc.cards.push([
			"html", {cardName: "html", html: HTMLgenerator([vimeo])}
		])
		// 10 == magic number for mobiledoc card
		ghost.data.posts[0].mobiledoc.sections.push([10, i])
	}

	ghost.data.posts[0].mobiledoc = JSON.stringify(ghost.data.posts[0].mobiledoc)

	return ghost
}

// OUTPUT WRITERS

// write output files in parallel and log results
function writeOutputFiles(vimeos) {
	let outputs = [
		params["--json"] && writeFilePromise(options.base + ".json", JSON.stringify(vimeos, null, '\t')),
		params["--tsv"] && writeFilePromise(options.base + ".tsv", debugTSVgenerator(vimeos)),
		params["--html"] && writeFilePromise(options.base + ".html", HTMLgenerator(vimeos)),
		params["--ghost"] && writeFilePromise(options.base + "-ghost.json", JSON.stringify(GhostGenerator(vimeos))),
	].filter(out => out)

	return Promise.all(outputs)
		.then(done => console.log("DONE", done))
		.catch(outch => console.log("FAIL", outch))
}

// write file contents return PROMISE
function writeFilePromise(file, contents) {
	return new Promise((resolve, reject) => fs.writeFile(file, contents, error => {
		if (error) reject(error)
		else resolve(file)
	}))
}
