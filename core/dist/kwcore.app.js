#!/usr/bin/env node

var Os= require('os')
var Path= require('path')
var fs= require('fs')
var Zlib= require('zlib')
var home= Os.homedir()
var corefolder= "core.0.3.16"
var verification= Path.join(home,"Kawix",corefolder, "verification.file")


if(fs.existsSync(verification)){
	module.exports= require(Path.join(home,"Kawix",corefolder))
	return 
}

var out= Path.join(home, "Kawix")
if(!fs.existsSync(out)){
	fs.mkdirSync(out)
}

out= Path.join(out, corefolder)
if(!fs.existsSync(out)){
	fs.mkdirSync(out)
}


if(!fs.existsSync(Path.join(out,"bin"))) fs.mkdirSync(Path.join(out,"bin"))
if(!fs.existsSync(Path.join(out,"crossplatform"))) fs.mkdirSync(Path.join(out,"crossplatform"))
if(!fs.existsSync(Path.join(out,"crossplatform/async"))) fs.mkdirSync(Path.join(out,"crossplatform/async"))
if(!fs.existsSync(Path.join(out,"crossplatform/async/dist"))) fs.mkdirSync(Path.join(out,"crossplatform/async/dist"))
if(!fs.existsSync(Path.join(out,"crossplatform/async/src"))) fs.mkdirSync(Path.join(out,"crossplatform/async/src"))
if(!fs.existsSync(Path.join(out,"crossplatform/dist"))) fs.mkdirSync(Path.join(out,"crossplatform/dist"))
if(!fs.existsSync(Path.join(out,"crossplatform/src"))) fs.mkdirSync(Path.join(out,"crossplatform/src"))
if(!fs.existsSync(Path.join(out,"dist"))) fs.mkdirSync(Path.join(out,"dist"))
if(!fs.existsSync(Path.join(out,"example"))) fs.mkdirSync(Path.join(out,"example"))
if(!fs.existsSync(Path.join(out,"src"))) fs.mkdirSync(Path.join(out,"src"))

var files= [".gitignore",".npmignore","KModule.js","NextJavascript.js","README.md","bin/cli.js","bin/kwcore","bin/kwcore.bat","crossplatform/async/dist/main.js","crossplatform/async/src/NextJavascript.js","crossplatform/async/src/babel.dynamic.import.js","crossplatform/async/src/babel.js","crossplatform/async/src/index.js","crossplatform/dist/index.html","crossplatform/dist/main.js","crossplatform/src/KModule.js","crossplatform/src/Promise.js","crossplatform/src/browser.fs.js","crossplatform/src/index.js","crossplatform/src/module.js","crossplatform/src/native.js","crossplatform/src/runtime.js","main.js","package.json","src/bundle.babel.js","src/npm-import.js"]
var contents= contentData()

var file, content
for(var i=0;i<files.length;i++){
	file= files[i]
	content= contents[i]
	content= Buffer.from(content,'base64')
	content= Zlib.gunzipSync(content)
	fs.writeFileSync(Path.join(out, file), content)
}

if(process.env.INSTALL_KWCORE){
	//XXX
}

fs.writeFileSync(verification, Date.now().toString())
if(process.env.KWCORE_EXECUTE == 1){
	out= Path.join(out,"bin", "cli.js")
}
module.exports= require(out)

function contentData(){
}
		