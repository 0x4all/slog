var pomelologger = require("pomelo-logger");
module.exports = {
	getLogger: pomelologger.getLogger,
	getDefaultLogger: pomelologger.getDefaultLogger,

	addAppender: pomelologger.addAppender,
	loadAppender: pomelologger.loadAppender,
	clearAppenders: pomelologger.clearAppenders,
	configure: pomelologger.configure,

	replaceConsole: pomelologger.replaceConsole,
	restoreConsole: pomelologger.restoreConsole,

	levels: pomelologger.levels,
	setGlobalLogLevel: pomelologger.setGlobalLogLevel,

	layouts: pomelologger.layouts,
	appenders: pomelologger.appenders
};
