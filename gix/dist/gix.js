#!/usr/bin/env node

var Os= require('os')
var Path= require('path')
var fs= require('fs')
var Zlib= require('zlib')
var home= Os.homedir()

var corefolder= "stdlib.0.4.2"
var coredefault= Path.join(home, "Kawix", "gix")
var corevdefault= Path.join(home, "Kawix", "gix", "verification.file")
var verification= Path.join(home, "Kawix", corefolder,  "gix", "verification.file")
var out, installed

main()

function _export(out){
	module.exports = {
		filename: out ,
		dirname: Path.dirname(out)
	}
}

function main(){
	
	/* this is commented, because the idea is load specific version

	if(fs.existsSync(corevdefault)){
		installed= fs.readFileSync(corevdefault,'utf8')
		if(installed >= "0.4.2"){
			out= Path.join(home,"Kawix", "gix")
			out= Path.join(out,"mod")
			_export(out)
			return 
		}
	}*/


	if(fs.existsSync(verification)){
		out= Path.join(home,"Kawix", corefolder, "gix")
		out= Path.join(out,"mod")
		_export(out)
		return 
	}

	out= Path.join(home, "Kawix")
	if(!fs.existsSync(out)){
		fs.mkdirSync(out)
	}

	out= Path.join(out, corefolder)
	if(!fs.existsSync(out)){
		fs.mkdirSync(out)
	}

	out= Path.join(out, "gix")
	if(!fs.existsSync(out)){
		fs.mkdirSync(out)
	}


	if(!fs.existsSync(Path.join(out,"dist"))) fs.mkdirSync(Path.join(out,"dist"))
if(!fs.existsSync(Path.join(out,"html"))) fs.mkdirSync(Path.join(out,"html"))
if(!fs.existsSync(Path.join(out,"src"))) fs.mkdirSync(Path.join(out,"src"))
if(!fs.existsSync(Path.join(out,"src/lib"))) fs.mkdirSync(Path.join(out,"src/lib"))
if(!fs.existsSync(Path.join(out,"test"))) fs.mkdirSync(Path.join(out,"test"))

	var files= ["README.md","bundle-electron-download.js","bundle-extract-zip.js","electron-download.js","electron-install.js","extract-zip.js","html/hello.world.html","mod.js","src/_electron_boot.js","src/exception.coffee","src/gui.coffee","src/ipc.coffee","src/lib/_fs.js","src/lib/_ipc.js","src/lib/_registry.js","src/lib/_uniqid.js","src/mod.js","src/start.js"]
	var contents= contentData()

	var file, content
	for(var i=0;i<files.length;i++){
		file= files[i]
		content= contents[i]
		content= Buffer.from(content,'base64')
		content= Zlib.gunzipSync(content)
		fs.writeFileSync(Path.join(out, file), content)
	}
	fs.writeFileSync(verification, "0.4.2")


	/*
	// make a junction or symlink 
	if(fs.existsSync(coredefault)){
		fs.unlinkSync(coredefault)
	}
	if(Os.platform() == "win32")
		fs.symlinkSync(out, coredefault,"junction")
	else 
		fs.symlinkSync(out, coredefault)

	*/


	out= Path.join(out, "mod")
	_export(out)
}

function contentData(){
}
		