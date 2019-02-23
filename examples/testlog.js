var slog = require("../index");
var path = require("path");
process.env.RAW_MESSAGE = false

slog.configure(path.resolve(__dirname,"./log4js.json"));

var logger = slog.getLogger("sys", __filename);


var ai = {};
ai.start = function(a, b,c ){
    logger.info("test start")
    logger.begin(a, b, c);
}

logger.info("test", 1, 2);
ai.start(1,3,"122",{a:1,b:"test",c:32})


var context = {};

context.test = function(a, b,c){
    logger.info(a, b, c);
}


context.test = context.test.bind(context, 222);

var t = context.test;
t(1,2);


