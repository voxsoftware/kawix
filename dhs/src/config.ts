
import {
	EventEmitter
} from 'events'

import Path from 'path'
import Os from 'os'
import Watcher from './watcher'
import Url from 'url'


export class ConfigBase extends EventEmitter{

	parseEnvironment(obj) {
		var str
		if (typeof obj === "object") {
			// detect os
			str = obj[Os.platform()]
			if (!str) {
				str = obj.default
			}
		} else {
			str = obj
		}
		return str
	}

	resolvePath(path, parent) {
		path = this.parseEnvironment(path)
		if (path.startsWith("./") || path.startsWith("../")) {
			path = Path.resolve(Path.dirname(parent.__defined), path)
		}
		return path
	}

	pathJoin(path1, path2) {
		var pathr, uri
		uri = Url.parse(path1)
		if (uri.protocol === "file:") {
			path1 = Url.fileURLToPath(path1)
			pathr = Path.join(path1, path2)
			return pathr
		}
		if (!uri.protocol) {
			pathr = Path.join(path1, path2)
			if (path1.startsWith("./")) {
				return "./" + pathr
			}
		} else {
			return Url.resolve(path1, path2)
		}
	}

	get sites() {
		return this.readCached().sites
	}

	get hosts() {
		return this.readCached().sites
	}

	read(): any{

	}

	stop(): any{}


	readCached():any{
	}
}



export class ConfigRPA extends ConfigBase{
	_parentConfig: any
	_config : any
	_on: any


	constructor(parentConfig: any){
		super()
		this._parentConfig = parentConfig


		this._parentConfig.on("change", (config)=>{
			this._config = config
			this.emit("change", config)
		})
		this._parentConfig.on("include", this.emit.bind(this, "include"))
		this._parentConfig.on("include.remove", this.emit.bind(this, "include.remove"))

	}




	async read(){
		return this._config = (await this._parentConfig.readCached())
	}

	readCached(){
		return this._config
	}


}

export class Config extends ConfigBase {

	private file: string
	private _read
	public _config
	public watcher: Watcher



	//private _readFromParent

	constructor(file) {
		super()

		this.file = file
		if (file) {
			this.start()
		}
	}


	start() {
		if (!this.file) {
			return
		}


		this._read = setInterval(this._read1.bind(this), 10000)
		this._read.unref()
		return this._read1()
	}


	stop() {
		if (this._read) {
			return clearInterval(this._read);
		}
	}



	async _checkConfig(config) {
		if ((!this._config && config) || (this._config.__time !== config.__time)) {
			if (config.preload) {
				await this._preload(config)
			}
			if (config.include) {
				await this._loadIncludes(config)
			}
			this._config = config

			// for rpa
			config.rpa_plain = true

			return this.emit("change", config)
		}
		this._config = config
		return config
	}



	async _preload(config) {
		var id, mod, ref, results;
		config.modules = {};
		ref = config.preload;
		results = [];
		for (id in ref) {
			mod = ref[id];
			mod = this.resolvePath(mod, config);
			results.push(config.modules[id] = (await import(mod)));
		}
		return results;
	}

	_loadIncludes(config) {
		var inc, j, len, ref, ref1, self, toWatch, watcher;
		// include is a file, glob definition
		self = this;
		toWatch = {};
		if (typeof config.include === "string") {
			config.include = [config.include];
		}
		ref = config.include;
		for (j = 0, len = ref.length; j < len; j++) {
			inc = ref[j];
			// start making good with chokidar
			inc = this.parseEnvironment(inc);
			if (inc.startsWith("./") || inc.startsWith("../")) {
				inc = Path.resolve(Path.dirname(config.__defined), inc);
			}
			toWatch[inc] = true;
		}
		if ((ref1 = this.watcher) != null) {
			ref1.close();
		}
		toWatch = Object.keys(toWatch);
		if (toWatch.length) {
			watcher = this.watcher = new Watcher({
				recursive: false
			});
			watcher.watch(toWatch);
			watcher.on("add", function(path) {
				return self._include(config, path);
			});
			watcher.on("change", function(path) {
				return self._include(config, path);
			});
			return watcher.on("remove", function(path) {
				return self._removeinclude(config, path);
			});
		}
	}


	sleep(time = 100) {
		var def;
		def = this.deferred();
		setTimeout(def.resolve, time);
		return def.promise;
	}

	async _include(config, path, timeout = 400) {
		var e, newconfig, ref;
		try {

			await this.sleep(timeout);
			newconfig = (await import(path));

			if (newconfig.configfile) {
				return (await this._include(config, newconfig.configfile, timeout));
			} else if (newconfig["kawix.app"]) {
				return (await this._include(config, Path.join(newconfig["kawix.app"].resolved, "app.config"), timeout));
			}
			this.emit("include", path)

			this._removeinclude(config, path, false)
			config._includes = config._includes || {}
			config._includes[path] = true
			newconfig.__time = (ref = newconfig.__time) != null ? ref : Date.now()
			if (!newconfig.kawixDynamic) {
				Object.defineProperty(newconfig, "kawixDynamic", {
					enumerable: false,
					value: {
						time: 5000
					}
				})
			}
			return this._process(config, newconfig, path)

		} catch (error) {
			e = error
			return console.error("Failed including: ", path, e)
		}
	}

	_removeinclude(config, path, _emit) {
		var del, i, j, k, len, len1, offset, ref, ref1, results, site, todel
		if (config._includes) {
			delete config._includes[path]
		}
		if (_emit !== false) {
			this.emit("include.remove", path)
		}
		todel = [];
		config.sites = (ref = config.sites) != null ? ref : [];
		ref1 = config.sites;
		for (i = j = 0, len = ref1.length; j < len; i = ++j) {
			site = ref1[i];
			if (site.__defined === path) {
				todel.push(i);
			}
		}
		offset = 0;
		results = [];
		for (k = 0, len1 = todel.length; k < len1; k++) {
			del = todel[k];
			config.sites.splice(del - offset, 1);
			results.push(offset++);
		}
		this.emit("change", config)
		return results
	}

	_process(config, other, filename) {


		var edited, j, len, ref, site, sites;
		config.sites = (ref = config.sites) != null ? ref : [];
		edited = false;
		sites = other.host || other.site || other.app;
		if (sites) {
			if (sites instanceof Array) {
				for (j = 0, len = sites.length; j < len; j++) {
					site = sites[j];
					edited = true;
					config.sites.push(site);
					site.__defined = filename;
					this._loadSite(site);
				}
			} else {
				site = sites;
				edited = true;
				config.sites.push(site);
				site.__defined = filename;
				this._loadSite(site);
			}
		}


		if (edited) {
			//console.info("processing: ", config)
			
			this._config = config
			config.rpa_plain = true
			this.emit("change", config)
		}
		return config;
	}

	async _loadSite(site) {
		var ref;
		site.__time = (ref = site.__time) != null ? ref : Date.now();
		if (site.preload) {
			await this._preload(site);
		}
		return site.loaded = true;
	}

	deferred() {
		var def;
		def = {};
		def.promise = new Promise(function(a, b) {
			def.resolve = a;
			return def.reject = b;
		});
		return def;
	}

	read() {
		var def
		if (this._config) {
			return this._config
		}
		def = this.deferred()
		this.once("change", def.resolve)
		return def.promise
	}

	readCached() {
		this._config.rpa_plain = true
		return this._config
	}

	async _read1() {
		var config, e, ref
		try {


			try {
				config = (await import(this.file))
			} catch (error) {
				e = error
				this.sleep(100)
				config = (await import(this.file))
			}


			if (!config.kawixDynamic) {
				Object.defineProperty(config, "kawixDynamic", {
					enumerable: false,
					value: {}
				})
			}
			config = (ref = config.default) != null ? ref : config

			config.__time = config.__time || Date.now()
			if (!config.__defined) {
				config.__defined = this.file
			}
			await this._checkConfig(config)
			return config

		} catch (error) {
			e = error
			return console.error(" > [KAWIX] Failed reloading config in background: ", e)
		}
	}

	on(event: string | symbol, listener): this {
		if (!listener) return


		let self = this
		if (listener.rpa_preserve) {



			listener.rpa_preserve()
			let generated

			generated = async function () {
				try {
					return await listener.apply(this, arguments)
				} catch (e) {

					if (e.code == "RPA_DESTROYED" || e.code == "RPC_NOT_FOUND") {

						// silent pass the error
						// and remove listener
						self.removeListener(event, generated)

					} else {
						throw e
					}
				}
			}
			this.addListener(event, generated)


		} else {
			this.addListener(event, listener)
		}

		return this
	}


}

export default Config
