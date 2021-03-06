import Bundler from '../../std/package/bundle.js'
import Registry from '../../std/package/registry.js'
import Path from 'path'

var init= async function(){
    var reg= new Registry()
    var moduleinfo= await reg.resolve("@babel/core","^7.3.4")
    var path= moduleinfo.folder 

    
    
    var outfile= Path.join(__dirname, "mod.js")

    var bundler= new Bundler(path)
    bundler.packageJsonSupport= true 
    bundler.virtualName= `babel$v$${moduleinfo.version}/node_modules`
    await bundler.writeToFile(outfile).bundle()
}

init()