import Path from 'path'
import 'npm://axios@^0.19.0'
import axios from 'axios'
import crypto from 'crypto'
import {publicVars} from './vars'

let registryCache

export var kawixDynamic = {
	time: 30000
}

async function registry(){
	if((!registryCache) || (Date.now() - registryCache.time > 1200000)){
		// renew cache
		let reg = await import(__dirname + "/registry")
		registryCache = {
			data: reg,
			time: Date.now()
		}
		reg.kawixDynamic = {time: 60000}
	}
	return registryCache.data
}

export async function versions( libInfo){

	// version cache
	if(!libInfo.versionCache  || (Date.now() - libInfo.versionCache.time > 300000)){
		// 5 minutos de caché para nuevas versiones


		let response = await axios({
			method: 'GET',
			url:libInfo.versions.url
		})
		let data = response.data
		if(typeof data == "string") data = JSON.parse(data)
		if(libInfo.versions.filter) data = data.filter(libInfo.versions.filter)
		if(libInfo.versions.map) data = data.map(libInfo.versions.map)
		if(libInfo.versions.post_filter) data = data.filter(libInfo.versions.post_filter)
		if(libInfo.versions.post) data = libInfo.versions.post(data)
		libInfo.versionCache = {
			data,
			time: Date.now()
		}
		return data
	}
	return libInfo.versionCache.data
}

export async function invoke(env, ctx){

	let repo = await registry()
	let library = env.params.lib || env.params.lib_discover_version
	if(!env.params.version){
		env.params.version = "master"
	}
	let version = "master"
	if(library){
		let y = library.indexOf("@")
		if(y > 0){
			version = library.substring(y+1)
			library = library.substring(0, y)
		}
	}
	if(env.params.version) version = env.params.version



	let libInfo = repo.database[library]
	if(!libInfo){
		return env.reply.code(404).send({
			name: library,
			version,
			message: 'NOTFOUND',
			code: 404
		})
	}

	if(env.params.lib_discover_version){
		try{
			let data= await versions(libInfo)
			env.reply.code(200).send(data)
		}catch(e){
			env.reply.code(500).send({
				error: {message:e.message,code:e.code}
			})
		}
		return
	}

	/*
	if(libInfo.version_prefix && version!="master")
		version = libInfo.version_prefix + version
	*/
	if(version != "master"){
		let vers = await versions(libInfo)
		vers = vers.filter((a)=> a.version == version)
		if(!vers.length){
			return env.reply.code(404).send({
				name: library,
				version,
				message: 'NOTFOUND',
				code: 404
			})
		}
		version = vers[0].branch
	}

	env.params.lib = library
	env.params.version = version

	let file = env.params.file = env.params["*"]
	let url = libInfo.url
	url = url.replace(/\$\{(\w[\w|\d]*)\}/g, (a,b)=> env.params[b] || "")

	let sha = "w/" + crypto.createHash('sha1').update(libInfo.url+ ">" + env.params.version + ">" + file).digest('hex')
	if(env.request.headers["if-none-match"]){
		let rsha = env.request.headers["if-none-match"]
		if(rsha == sha){
			return env.reply.code(304).send({})
		}
	}

	let cached = publicVars[sha]
	if(!cached || (Date.now() - cached.time < (24*3600000))){
		// resolved url?

		if(libInfo.extensions){

			// verificar
			let source = url, offset = 0
			while(true){

				try{
					let response = await axios({
						method: 'HEAD',
						url
					})
					/*
					if(response.data){
						env.reply.code(200)
							.header("content-type","text/plain")
							.header("etag", sha)
							.header("cache-control","public,max-age=300")
							.send(response.data)
					}*/

					// save cache
					cached = {
						time: Date.now(),
						redirect: url,
						sha
					}
					publicVars[sha] = cached

					env.reply.redirect(url)
					return
				}catch(e){}


				let ext = libInfo.extensions[offset]
				offset++
				if(!ext)break
				url = source + ext
				//console.info("URL", url)

			}

			return env.reply.code(404).send({
				name: library,
				version,
				message: 'NOTFOUND',
				code: 404,
				file
			})

		}else{

			// save cache
			cached = {
				time: Date.now(),
				redirect: url,
				sha
			}
			publicVars[sha] = cached

			env.reply.redirect(url)
			return
		}
	}else{
		if(cached.text){
			env.reply.code(200)
				.header("content-type","text/plain")
				.header("etag", sha)
				.header("cache-control","public,max-age=300")
				.send(cached.text)
		}
		else{
			env.reply.redirect(cached.redirect)
		}
	}

	// remove Cache excess
	let keys = Object.keys(publicVars)
	if(keys.length > 500){
		delete publicVars[keys[0]]
	}

}
