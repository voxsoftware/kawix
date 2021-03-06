import {Electron} from '../src/electron'
import Path from 'path'
import Url from 'url'

init()
async function init() {
	try {


		var ui = new Electron("hello.world.example")
		
		if (! await ui.requestSingleInstanceLock()){
			// only attach ...
			await ui.attachInstance()
		}
		else{
			ui.on("second-instance", function (argv, cwd) {
				console.log("You tried opening another instance: ", argv, cwd)
			})
		}

		


		
		var thisPath= __filename , url
		if(thisPath.startsWith("http:") || thisPath.startsWith("https:")){
			url= Url.resolve(thisPath, '../html/hello.world.html')
		}else{
			url= `file://${Path.join(__dirname, "..", "html", "hello.world.html")}`
		}

		var params = {
			url,
			args: {
				width: 600,
				height: 400,
				webPreferences: {
					nodeIntegration: true
				}
			}
		}


		let mainWindow = await ui.electron.BrowserWindow.construct(ui.channel.plain(params.args))
		await mainWindow.loadURL(params.url)
		await mainWindow.show()		

		
		await ui.bridge.addEventListener(mainWindow, "minimize", function () {
			console.info("Window minimized")
		})
		
		await ui.bridge.addEventListener(mainWindow, "closed", function () {
			console.info("Window closed")
			// close this 
			setTimeout(function(){
				ui.channel.close()
			},100)
		})


	} catch (e) {
		console.info("ERROR: ", e.message, e)
		//console.error("Failed running test: ", e)
	}
}
