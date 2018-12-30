var pomelologger = require("pomelo-logger");


var getLogger = function(categoryName, fileName){
    var logger = pomelologger.getLogger(categoryName, fileName);
    _add_begin(logger);
    return logger;
};

var _add_begin = function(logger)
{
    logger.begin = function()
    {
        var str = new Error().stack;
        var startIndex1 = str.indexOf('(');
        startIndex1 = str.indexOf('at',startIndex1 + 1);
        str = str.substring(startIndex1+3,str.indexOf('(',startIndex1+2)) + "[  ";

        var args = Array.prototype.slice.call(arguments,0);
        for(var i = 0,l = args.length; i < l; ++i )
        {
            var arg = args[i];
            var strArg = arg + "";
            if(strArg === '[object Object]')
            {
                str += JSON.stringify(arg)+ ", ";
            }
            else if(strArg === '[object Arguments]')
            {
                str += _args2String(arg);
            }
            else
            {
                str += strArg + ", ";
            }
        }
        //str = str.substr(0,str.length - 2);
        str += " ];";

        logger.trace(str);
    };

    return logger;
};

var _args2String = function(args)
{
    var str = "";
    for(var arg in args)
    {
        if(args.hasOwnProperty(arg))
        {
            var s = args[arg] + "";
            if (s === '[object Object]')
            {
                str +=  JSON.stringify(args[arg]) + "|";
            }
            else if (s === '[object Arguments]')
            {
                str +=  JSON.stringify(args[arg]) + "|";
            }
            else
            {
                str += s + "|";
            }
        }
    }
    str = str.substr(0,str.length - 1);
    str += "";
    return str;
};




var logger = {
	getLogger: getLogger,
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

module.exports = logger;
