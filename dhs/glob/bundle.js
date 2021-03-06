import Bundler from '/virtual/@kawix/std/package/bundle.js'
import Registry from '/virtual/@kawix/std/package/registry.js'
import Path from 'path'

var init= async function(){
    var reg= new Registry()
    var moduleinfo= await reg.resolve("glob@^7.1.3")
    var path= moduleinfo.folder

    var outfile= Path.join(__dirname, "mod.js")

    var bundler= new Bundler(path)
    bundler.disableTranspile= true
    bundler.packageJsonSupport= true
    bundler.virtualName= `glob$v$${moduleinfo.version}`
    await bundler.writeToFile(outfile).bundle()
}

init()
