
//websocket 消息处理
function WSMessageProcessing(text) {
    if (text == "pong") {
        console.info("心跳");
    } else {
        console.info("收到消息：" + text);
        var responseJson = JSON.parse(text);
        if (responseJson.method == "CONFIG") {
            let configJson = {
                "requestId": responseJson.requestId,
                "method": responseJson.method,
                "request": 0,
                "body": {
                    "code": 0,
                    "msg": "收到",
                },
                "timestamp": new Date().getTime()
            }
            let configJsonString = JSON.stringify(configJson)
            log("响应消息:" + configJsonString);
            ws.send(configJsonString)
        }
    }
}



var ws = null
var connectState = false

function connectWebSocket() {
    ws = $web.newWebSocket("ws://47.242.170.252:9000/ws?thirdApp=WHATSAPP&thirdAppUserId=1572223&device=VJPA10011017001_00&pluginVersion=333&envType=&channelId=&extra=", {
        eventThread: 'this'
    });
    // ws = web.newWebSocket("ws://47.242.170.252:9000/ws?thirdApp=WHATSAPP&thirdAppUserId=1572223&device=VJPA10011017001_00&pluginVersion=333&envType=&channelId=&extra=");
    ws.on("open", (res, ws) => {
        log("WebSocket已连接");
        connectState = true
    }).on("failure", (err, res, ws) => {
        log("WebSocket连接失败");
        connectState = false
        console.error(err);
        setTimeout(() => {
            console.log('尝试重连...');
            ws = connectWebSocket();
        }, 5000);
    }).on("closing", (code, reason, ws) => {
        log("WebSocket关闭，code=" + code + ",reason=" + reason + ",ws=" + ws);
    }).on("text", (text, ws) => {
        WSMessageProcessing(text)
    }).on("binary", (bytes, ws) => {
        console.info("收到二进制消息:");
        console.info("hex: ", bytes.hex());
        console.info("base64: ", bytes.base64());
        console.info("md5: ", bytes.md5());
        console.info("size: ", bytes.size());
        console.info("bytes: ", bytes.toByteArray());
    }).on("closed", (code, reason, ws) => { 
        log("WebSocket已关闭: code = %d, reason = %s", code, reason);
    });
    // events.on("exit", function () {
    //     ws.close(1000, "正常关闭")
    // });
    return ws
}

ws = connectWebSocket()

setInterval(() => {
    ws.send('ping')
}, 15000);

setTimeout(() => {
    log("关闭")
    ws.close(1000, null);
}, 600000);
