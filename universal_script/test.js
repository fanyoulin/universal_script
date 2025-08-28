

//123  ds
function googleOpenTk() {
    app.launch("com.android.chrome")
    for (let i = 0; i < 20; i++) {
        if (i == 19) {
            comm.showLog("打开Tk失败")
        }
        //浏览器url栏已输入tk链接
        let line_one = selector().textContains("www.tiktok.com").visibleToUser(true).findOne(1000);
        if (line_one) {
            comm.clickObj(line_one)
            sleep(2000)
        } else {
            //浏览器url栏未输入tk链接
            let googleEdit = id("search_box_text").className("android.widget.EditText").clickable().visibleToUser(true).findOne(1000)
            if (googleEdit) {
                comm.clickObj(googleEdit)
                sleep(2000)
                setText("www.tiktok.com");
            }
        }
        //浏览跳转tk相关按钮
        let googleBtn = id("terms_accept").className("android.widget.Button").clickable().visibleToUser(true).findOne(1000)
        if (!googleBtn) {
            googleBtn = id("negative_button").className("android.widget.Button").clickable().visibleToUser(true).findOne(1000)
            if (!googleBtn) {
                googleBtn = className("android.widget.Button").clickable().depth("16").drawingOrder("0").visibleToUser(true).findOne(1000)//Open app
                if (!googleBtn) {
                    googleBtn = selector().textContains("Use without an account").visibleToUser(true).findOne(1000);
                    if (!googleBtn) {
                        if (packageName("com.zhiliaoapp.musically").exists()) {
                            comm.showLog("已打开TikTok")
                            break;
                        }
                    }
                }
            }
        }
        if (googleBtn) {
            comm.clickObj(googleBtn)
        }
        sleep(5000);
    }

}




var comm = {};

comm.showLog = function (txt) {
    console.log(txt)
    toast(txt)

}
// comm.showLogToFile = function (txt) {
//     console.log(txt)
//     toast(txt)
//     //
//     var sdcard_path = files.getSdcardPath()
//     var log_path = sdcard_path + "/runlog.txt"
//     try {
//         const file = files.open(log_path, 'a');
//         file.write(txt + "\n");
//         file.close();
//     } catch (error) {
//         console.error("创建文件时出错：", error);
//     }
// }
comm.showLogToFile = function (txt) {
    console.log(txt)
    toast(txt)
    //
    var sdcard_path = files.getSdcardPath()
    var log_path = sdcard_path + "/runlog.txt"
    try {
        // 使用toLocaleString获取本地时间格式
        var timeStr = "[" + new Date().toLocaleString() + "] ";
        const file = files.open(log_path, 'a');
        file.write(timeStr + txt + "\n");
        file.close();
    } catch (error) {
        console.error("创建文件时出错：", error);
    }
}

var shell_url = "http://127.0.0.1:8000"
var yun_api_url = ""
var group_code = ""
var clientNo = ""
comm.initVals = function (aa, bb, cc) {
    yun_api_url = aa
    group_code = bb
    clientNo = cc
}


comm.clickObj = function (o) {
    if (!o) {
        return
    }
    if (o == null) {
        return
    }
    try {
        let b = o.bounds()
        console.log('comm.clickObj:' + o.text() + ',' + b.centerX() + ',' + b.centerY())
        click(b.centerX(), b.centerY())
    } catch (error) {
        console.log(error)
    }

}
// 全字匹配
comm.existsTextAll = function (str) {
    let oo = selector().text(str).visibleToUser(true).exists()
    console.log("existsTextAll " + str + ":" + oo)
    return oo;
}
comm.existsText = function (str) {
    let oo = selector().textContains(str).visibleToUser(true).exists()
    console.log("existsText " + str + ":" + oo)
    return oo;
}
comm.findTextClick = function (str) {
    let oo = selector().textContains(str).visibleToUser(true).findOne(1000)
    if (oo != null) {
        sleep(1000)
        console.log("找到:" + oo.text())
        comm.clickObj(oo)
        sleep(1000)
        return true
    } else {
        console.log("未找到:" + str)
        return false
    }
}
comm.findOneText = function (str1) {

    let f = selector().textContains(str1).visibleToUser(true).findOne(1000)
    //console.log(str1+":")
    return f
}
comm.findTextAndClickLast = function (str) {
    let oo = selector().textContains(str).visibleToUser(true).find()
    if (oo && oo.length > 0) {
        sleep(1000)
        console.log("找到:" + str)
        comm.clickObj(oo[oo.length - 1])
        sleep(1000)
    }
}
comm.findTextAndClickExists = function (str) {
    let oo = selector().textContains(str).visibleToUser(true).exists()
    if (oo) {
        sleep(1000)
        comm.clickObj(selector().textContains(str).visibleToUser(true).findOne(1000))
        sleep(1000)
        return true
    } else {
        return false
    }
}
comm.findText1ClickTextMany = function (str, str2, str3) {
    let oo = selector().textContains(str).visibleToUser(true).exists()
    if (oo) {

        console.log(str)
        sleep(1000)
        let oo2 = selector().textContains(str2).visibleToUser(true).find()
        for (let index = 0; index < oo2.length; index++) {
            try {
                comm.clickObj(oo2[index])
                sleep(100)
            } catch (e) {
                console.log(e)
            }
        }
        sleep(1000)
        if (str3 && str3 != '') {
            let oo3 = selector().textContains(str3).visibleToUser(true).find()
            for (let index = 0; index < oo3.length; index++) {
                try {
                    comm.clickObj(oo3[index])
                    sleep(100)
                } catch (e) {
                    console.log(e)
                }
            }
            sleep(1000)
        }

    }
}
comm.findText1ClickText2 = function (str, str2) {
    let oo = selector().textContains(str).visibleToUser(true).exists()
    if (oo) {

        console.log(str)
        sleep(1000)
        let oo2 = selector().textContains(str2).visibleToUser(true).find()
        if (oo2.length > 0) {
            comm.clickObj(oo2[0])
        }
        sleep(1000)
    }
}



comm.findText = function (txt, className, tipTxt) {

    for (let i = 0; i < 1000; i++) {
        let tv = null;
        if (className != '') {
            tv = selector().textContains(txt).className(className).visibleToUser(true).findOne(1000)
        } else {
            tv = selector().textContains(txt).visibleToUser(true).findOne(1000)
        }
        if (tv) {
            return tv;
        } else {
            if (tipTxt && tipTxt != '') {
                if (i > 0 || i % 10 == 0) {
                    toastLog(txt)
                }
            }
            sleep(1000)
        }
    }
}
//专用，在采购任务开始，把商品名称和sku信息重新覆盖一下
comm.httpToStringShellContinue_GetProductInfo = function (url) {

    try {
        console.log(url)
        let response = http.get(url)
        let responseString = response.body.string();
        console.log(responseString)
        let taskJson = JSON.parse(responseString)
        // return responseString;
        return taskJson;
    } catch (e) {
        console.log(e)
        return "";
    }
}

comm.httpToStringShellContinue = function (url) {

    try {
        console.log(url)
        let response = http.get(url)
        let responseString = response.body.string();
        console.log(responseString)
        let taskJson = JSON.parse(responseString)
        // return responseString;
        return taskJson.msg;
    } catch (e) {
        console.log(e)
        return "";
    }
}
comm.httpToString = function (url) {

    try {
        console.log(url)
        let response = http.get(url)
        let responseString = response.body.string();
        console.log(responseString)
        // let taskJson=JSON.parse(responseString)
        return responseString;
        // return taskJson.msg;
    } catch (e) {
        console.log(e)
        return "";
    }
}
comm.postToString = function (url, jsonObj) {
    try {
        let r = http.postJson(url, jsonObj);
        let result = r.body.string();
        console.log("成功:" + result)
        return result
    } catch (e) {
        console.log("失败:请求异常" + e)
    }
    return ""
}
comm.downLoadFile = function (fileurl, filepath) {

    console.log('下载开始')
    const response = http.get(fileurl)
    if (response.statusCode !== 200) {
        console.log('下载失败')
        return false
    }
    console.log('下载: ' + fileurl)
    files.writeBytes(filepath, response.body.bytes())
    console.log('保存文件:' + filepath + '到手机完成')
    return true
}
comm.setShellUrl = function (txt) {
    //console.log(txt)
    shell_url = txt
}
comm.httpShell = function httpShell(cmdStr) {
    let jsonData = {
        client_no: clientNo + "",
        cmd: cmdStr,
        key: "63347f5d946164a23faca26b78a91e1c"
    }
    console.log("jsonData:" + JSON.stringify(jsonData))
    for (let i = 0; i < 3; i++) {
        let str = comm.postToString(httpServer + "/api/shell", jsonData)
        comm.showLog("str:" + str)
        if (str != '') {
            try {
                let jsonShell = JSON.parse(str)
                if (jsonShell.code != 0) {
                    sleep(1000)
                    str = comm.postToString(httpServer + "/api/shell", jsonData)
                    jsonShell = JSON.parse(str)
                }
                if (jsonShell.code == 0) {
                    return true
                }
            } catch (e) {
                console.log(e)
            }
        }
    }
    return false
}


comm.setProxy = function (s5) {

    if (s5.indexOf('127.0.0.1') > -1) {
        console.log('本地代理无需设置')
        sleep(8000)
        return
    }
    console.log('设置代理:' + s5)
    //let s5="socks://18680868661drf-101:zeqef6ta@hkproxy.yilian.top:5005"
    let pt = s5.replace("socks5://", "")
    pt = pt.replace("socks://", "")
    let pta = pt.split("@");
    let upa = pta[0].split(":");
    let puser = upa[0]
    let ppwd = upa[1]
    let pth = pta[1].split(":")
    let host = pth[0]
    let port = pth[1]
    //let command = "dg config -r proxy -a proxy.enabled=true -a proxy.protocol=socks5 -a proxy.host=" + host + " -a proxy.port=" +port + " -a proxy.user=" + puser + " -a proxy.pass=" + ppwd + " -a proxy.udp=true -a proxy.dns=8.8.8.8 -a proxy.dnsType=tcp";
    let s5url = yun_api_url + "/s5_set/" + group_code + "/" + clientNo + "?s5ip=" + host + "&s5port=" + port + "&s5user=" + puser + "&s5pwd=" + ppwd
    //files.write("/sdcard/s5.sh",command)
    //console.log(command)
    let shellString = comm.httpToString(s5url)
    for (let i = 0; i < 10; i++) {
        try {
            if (shellString != '') {
                let proxyJson = JSON.parse(shellString)
                if (proxyJson.code == 200) {
                    sleep(5000)
                    break
                }
            }
            shellString = comm.httpToString(s5url)
        } catch (error) {
            console.log(error)
        }
        sleep(1000)
    }
    //console.log(shellString)
}

// 下拉刷新  --
comm.pullDownRefresh = function (num) {
    let sx = random(1500, 1600)   //随机滑动
    if (device.height < 1500) {
        sx = device.height - random(360, 450)
    }
    //
    swipe(random(300, 330), random(800, 900), random(300, 330), sx, random(600, 700))
}
// 随机滑动，传入次数。comm.randomSwipe(3)
comm.randomSwipe = function (num) {
    let sx = random(1500, 1600)   //随机滑动
    if (device.height < 1500) {
        sx = device.height - random(260, 330)
    }
    for (let i = 0; i < num; i++) {
        let time = random(1000, 3000)
        swipe(random(300, 330), sx, random(300, 330), random(100, 130), random(100, 300))
        sleep(time)
    }
}
// 随机滑动慢 swipe(random(550, 600), random(1500, 1510), random(550, 600), random(1030, 1050),430)
comm.randomSwipeSlow = function (num) {
    let sx = random(1500, 1600)   //随机滑动
    if (device.height < 1500) {
        sx = device.height - random(260, 330)
    }
    for (let i = 0; i < num; i++) {
        let time = random(1000, 1800)
        // swipe(random(550, 600), sx, random(550, 600), random(1030, 1050), random(300, 450))
        swipe(random(550, 600), sx, random(550, 600), random(1030, 1050), random(300, 450))
        sleep(time)
    }
}
// 随机滑动慢且长
comm.randomSwipeSlowLong = function (num) {
    let sx = random(1500, 1600)   //随机滑动
    if (device.height < 1500) {
        sx = device.height - random(260, 330)
    }
    for (let i = 0; i < num; i++) {
        let time = random(1000, 1800)
        // swipe(random(550, 600), sx, random(550, 600), random(1030, 1050), random(300, 450))
        // swipe(random(550, 600), sx, random(550, 600), random(830, 850), random(300, 450))
        swipe(random(550, 600), sx, random(550, 600), random(900, 950), random(350, 500))
        sleep(time)
    }
}
// 来回滑动一次
comm.randomToAndFroSwipe = function () {
    let pos = []
    //
    let sx = random(1500, 1600)   //随机滑动
    if (device.height < 1500) {
        sx = device.height - random(260, 330)
    }

    pos.push([random(450, 550), sx]);
    pos.push([random(500, 650), sx - 100]);
    pos.push([random(600, 700), sx + 10]);
    //
    gesture(random(700, 800), pos)

}

// 往上滑
comm.randomSwipeToTop = function (num) {
    let sx = random(1500, 1600)   //随机滑动
    if (device.height < 1500) {
        sx = device.height - random(260, 330)
    }
    for (let i = 0; i < num; i++) {
        let time = random(2000, 4000)
        swipe(random(500, 700), random(800, 900), random(500, 700), sx, random(500, 600))
        sleep(time)
    }
}

// // 滑块验证码
// comm.sliderVerificationCode = function(text){
//     let verifyAppearLoadingTwoExist = selector().textContains(text).visibleToUser(true).findOne(1000)
//     if (verifyAppearLoadingTwoExist) { 
//         result=imageCodeVerify(false)
//         if(result!='success')
//         {
//             //重试
//             result=imageCodeVerify(false)  
//         }
//     }
// }


let email = "zAjbiLtDXAD@houjiutu.com";
let password = "lU1eXJvnEG564";

// let inputEmail = selector().className('android.widget.EditText').visibleToUser(true).findOne(1000)
//     if (inputEmail) {
//         comm.clickObj(inputEmail)
//         sleep(5000)
//         inputEmail.setText(email)
//         sleep(5000)
//         let nextBtn = boundsInside(device.width / 2, device.height / 2, device.width, device.height).className("android.widget.Button").clickable().visibleToUser(true).findOne(1000)
//         if (nextBtn) {
//             log(nextBtn)
//             comm.clickObj(nextBtn)
//         } else {
//             // return "没有next-1"
//         }
//     }

// boundsInside(0,0, device.width, device.height/3).className("android.widget.Button").clickable().visibleToUser(true).find().forEach(function(tv){
//      log(tv);
// });
let ChooseWhatYouLike = selector().textContains('Choose what you like').visibleToUser(true).findOne(2000)
    if (ChooseWhatYouLike) {
        console.log("123");
        
    }




