// enable coffeescript,cson support
import './mod'
import IPC from './ipc'

export default async function(id){
	var ipc= new IPC(id)
	await ipc.listen()
	console.log("ELECTRON PROCESS LISTENING")
}