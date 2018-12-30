var slog = require("./index");
var logger = slog.getLogger("sys", __filename);

var ai = {};
ai.start = function(a, b,c ){
    logger.info("test start")
    logger.begin(a, b, c);
}

logger.info("test", 1, 2);
ai.start(1,3,"122",{a:1,b:"test",c:32})