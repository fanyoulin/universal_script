var windowDefaultTop = 0;
var windowDefaultLeft = 150;
var windowInfo = null;
var menuShow = false;
var runCount = 0;
var httpServer = "http://127.0.0.1:8000"
// var remoteServer="http://10.6.0.58:8022"
// var remoteServer="http://23.91.96.20:8081"
var remoteServer = "http://10.6.0.58:8081"  //采购的任务服务地址
var ttrpServer = "http://23.91.96.20:3000" //
var clientNo = "1000"
var bd_client_no = ""
var taskType = 0
var device_id = ""
var script_url = ""
var backupNo = ""
var username = ""
var username_new = ""
var email = ""
var google_token = ""
var password = ""
var password_new = ""
var result = ""
var task_id = 0
var orders_id = 0
var monitor_status = 0
var comm = require('./comm.js');
//自动运行脚本的变量
var autoRunThread = null
var monitorRunThread = null
var heartPingRunThread = null
var eScript = null
//
var test = false   //测试
var tkShareString = ""  //tk老邀新活动复制的链接
var account_id = 0
//
importClass('java.net.Inet4Address');
importClass('java.net.InetAddress');
importClass('java.net.NetworkInterface');
importClass('java.util.Enumeration');
importClass('java.net.Inet6Address');
//获取内网IP地址
var hostIp = '';
engines.all().forEach(engine => {
    runCount++;
});
comm.showLogToFile('------新任务------')
//初始化界面  --新增了一个文件的写入
startup();

//初始化脚本配置
initConfig()

// 直接写入一个测试用的任务参数
// var taskString_My='{"country":"US","account_id":111111,"username":"user001","task_info":[{"task_id":5,"task_type":3,"tk_video_id":"","product_no":"1729470731675472017","seller_id":"7495293869641271441","product_title":"Countertop Ice Maker Machine with Handle,9 Ice Cubes Ready in 6 Mins,26lbs in 24Hrs, Auto-Cleaning Portable Ice Maker with Basket and Scoop, for Home/Kitchen/Camping/RV","sku_name":"Color:Black"},{"task_id":6,"task_type":4,"follow_count":3}]}'
// var taskString_My='{"country":"US","account_id":111111,"username":"user001","task_info":[{"task_id":6,"task_type":5,"text":"第一条json数据"},{"task_id":7,"task_type":8,"video_id":"7441292710079663402","text":"第二条json数据"},{"task_id":8,"task_type":5,"text":"第三条json数据"}]}'
// var taskString_My='{"country":"US","account_id":111111,"username":"kylie.weaver5","task_info":[{"task_id":6,"task_type":13}]}'
// var taskString_My='{"country":"US","account_id":111111,"username":"kylie.weaver5","task_info":[{"task_id":1,"task_type":1,"regist_type":2,"mobile":"xxxxxx","email":"fdfsfaaba@tko123.com","password":"d049136422@3848","nickname":"chillcasey_99"}]}' //注册任务
// var taskString_My='{"country":"US","account_id":111111,"username":"kylie.weaver5","task_info":[{"task_id":1,"task_type":2,"regist_type":2,"mobile":"xxxxxx","email":"fdfsfaaba@tko123.com","password":"d049136422@3848"}]}' //登陆任务
// var taskString_My='{"country":"US","account_id":111111,"username":"kylie.weaver5","task_info":[{"task_id":1,"task_type":2,"regist_type":2,"mobile":"xxxxxx","email":"fdfsfsfsf@tko123.com","password":"d049136422@3848"}]}' //登陆任务
// var taskString_My = '{"account_id":0,"bd_client_no":"VJPA10011017011_00","country":"US","task_info":[{"email":"eNUTWaaYVNfM@louyouiu.com","password":"iCNL6hiZ6A3MZ","regist_type":3,"security_mail":"","share_url":"","task_id":17,"task_type":1}],"username":"","password":"","google_token":"","backup_no":"17","version":"41.3.3","load_type":0,"task_type":1,"timeout":900,"pkg":"com.zhiliaoapp.musically"}' //登陆任务
var taskString_My = '{"account_id":0,"bd_client_no":"VJPA10011017011_00","country":"US","task_info":[{"email":"50LEj4kzxtJD@louyouiu.com","password":"WYXVc6srEzeUo","regist_type":3,"security_mail":"","share_url":"","task_id":24,"task_type":2}],"username":"","password":"","google_token":"","backup_no":"24","version":"41.3.3","load_type":0,"task_type":2,"timeout":900,"pkg":"com.zhiliaoapp.musically"}'
//启动任务 
startTask()

function startTask() {
    // return
    comm.showLogToFile("启动任务");
    sleep(8000)
    if (test) {
        comm.showLog("中断")
        return
    }
    autoRunThread = threads.start(function () {
        device.keepScreenDim()//屏幕常亮
        sleep(2000)
        console.log("-------开始执行任务-------");
        while (true) {
            task_id = 0
            console.log("startTask")
            var sdcard_path = files.getSdcardPath()
            if (files.exists(sdcard_path + "/taskString.txt")) {
                comm.showLog("在文件中读取到任务");
                let taskString = files.read(sdcard_path + "/taskString.txt").replace(/^\uFEFF/, '').trim();  // 去除 BOM 头 // 去除首尾空格
                console.log(taskString)
                let taskJson = JSON.parse(taskString)
                // task_type = taskJson.task_type
                backupNo = taskJson.backup_no
                // task_id=taskJson.task_id

                // 
                var taskStatus = 2   //任务状态默认失败，只要有一个成功，就成功
                //
                // let taskJson=JSON.parse(taskString_My)//测试用的任务参数
                let taskInfo = taskJson.task_info
                task_id = taskJson.task_id
                username = taskJson.username
                username_new = taskJson.username
                email = taskJson.account
                account_id = taskJson.account_id
                password = taskJson.password
                password_new = taskJson.password
                google_token = taskJson.google_token
                bd_client_no = taskJson.bd_client_no
                console.log(taskInfo)
                console.log(username)
                console.log(bd_client_no)
                sleep(10000)

                // 把task_info这个json数组循环,并且判断不同的任务类型
                // 1、首页推荐：视频浏览，点赞，评论，转发，关注    ---
                // 2、观看直播  ---
                // 3、粉丝列表关注  ---
                // 4、推荐帐号关注（Inbox板块） ---
                // -5、Profile View关注,个人足迹查看和关注
                // 6、商城浏览（随机查看几个产品）  ---
                // 7、已关注帐号：视频浏览，点赞，评论，转发，关注 ---
                // -8、自己发布视频的点赞和评论用户进行关注
                for (let i = 0; i < taskInfo.length; i++) {
                    var returnMsg = "执行失败"
                    //
                    // 先写一个 回到home页面

                    // 在进行下一个循环
                    console.log("任务类型:", taskInfo[i].task_type)
                    taskType = taskInfo[i].task_type
                    task_id = taskInfo[i].task_id
                    orders_id = taskInfo[i].orders_id
                    //
                    comm.showLogToFile("=====执行任务id:" + task_id + "=====")
                    //
                    switch (taskType) {
                        case 1: //注册
                            returnMsg = AttemptOperation_Register(taskInfo[i])
                            if (returnMsg == "success") {
                                taskStatus = 1
                                console.log("上报成功");
                                //小任务上报任务完成（成功）
                                if (taskInfo[i].regist_type == 3) {
                                    updateTask(taskType, task_id, 1, returnMsg, taskInfo[i].email)
                                } else {
                                    updateTask(taskType, task_id, 1, returnMsg, username)
                                }
                            } else {
                                console.log("上报失败:", returnMsg);
                                //小任务上报任务完成（失败）
                                if (taskInfo[i].regist_type == 3) {
                                    updateTask(taskType, task_id, 2, returnMsg, taskInfo[i].email)
                                } else {
                                    updateTask(taskType, task_id, 2, returnMsg, username)
                                }
                            }
                            break;
                        case 2: //登录
                            returnMsg = AttemptOperation_Login(taskInfo[i])
                            if (returnMsg == "success") {
                                taskStatus = 1
                                // console.log("上报成功");
                                //小任务上报任务完成（成功）
                                updateTask(taskType, task_id, 1, returnMsg, username)
                            } else {
                                // console.log("上报失败:",returnMsg);
                                //小任务上报任务完成（失败）
                                updateTask(taskType, task_id, 2, returnMsg, username)
                            }
                            //
                            break;
                        case 3: //采购任务
                            comm.showLogToFile("开始任务")
                            let reqData = comm.httpToStringShellContinue_GetProductInfo(remoteServer + "/admin/api/orderPing?id=" + task_id + "&ordertaskid=" + taskInfo[i].ordertask_id + "&ordersid=" + orders_id + "&status=1&info=开始任务")
                            if (reqData.msg != '成功接收到通知') {
                                comm.showLogToFile(reqData.msg)
                                comm.showLog("系统断线，停止任务")
                                // return "系统断线，停止任务"
                                break
                            }
                            if (reqData.data.product_title != "") {
                                taskInfo[i].product_title = reqData.data.product_title
                            }
                            if (reqData.data.sku_name != "") {
                                taskInfo[i].sku_name = reqData.data.sku_name
                            }
                            // sleep(5000)
                            //分辨是全托管还是正常非全托管
                            if (taskInfo[i].is_no_shop == 1) {
                                comm.showLogToFile("全托管")
                                //处理一下sku问题
                                let hendleSku = taskInfo[i].sku_name
                                let newSku = ""
                                let skuList = hendleSku.split("----")
                                if (skuList.length != 0) {
                                    for (let j = 0; j < skuList.length; j++) {
                                        if (j > 0) {
                                            newSku += "----"
                                        }
                                        let match = skuList[j].match(/^([^:]+):(.+)$/);
                                        let skuKey = match[1]
                                        let skuValue = match[2]
                                        comm.showLog("skuValue:" + skuValue)
                                        if (skuValue == "S") {
                                            skuValue = "S(4)"
                                        } else if (skuValue == "M") {
                                            skuValue = "M(6)"
                                        } else if (skuValue == "L") {
                                            skuValue = "L(8/10)"
                                        } else if (skuValue == "XL") {
                                            skuValue = "XL(12)"
                                        }
                                        newSku += (skuKey + ":" + skuValue)
                                    }
                                }
                                taskInfo[i].sku_name = newSku
                                //
                                returnMsg = orderTask_NoShop(taskInfo[i]);
                            } else {
                                comm.showLogToFile("正常任务（非全托管）")
                                returnMsg = orderTask(taskInfo[i]);
                            }
                            //
                            comm.showLogToFile("采购返回数据：" + returnMsg)
                            if (returnMsg == "success") {
                                taskStatus = 1
                                //脚本报成功
                                comm.showLogToFile("脚本层面成功-报告服务端")
                                comm.httpToString(remoteServer + "/admin/api/orderPing?id=" + task_id + "&ordertaskid=" + taskInfo[i].ordertask_id + "&ordersid=" + orders_id + "&status=1&info=success")
                            } else {
                                comm.httpToString(remoteServer + "/admin/api/orderPing?id=" + task_id + "&ordertaskid=" + taskInfo[i].ordertask_id + "&ordersid=" + orders_id + "&status=2&info=" + returnMsg)
                                //
                                comm.showLogToFile("失败，准备截图")
                                if (sysScreenCapture_OrderFinish(task_id)) {
                                    comm.showLogToFile("截图成功，发送截图")
                                    findCapturedImageAndSend()
                                } else {
                                    comm.showLogToFile("截图失败,再次尝试截图")
                                    sleep(2000)
                                    if (sysScreenCapture_OrderFinish(task_id)) {
                                        comm.showLogToFile("再次截图成功，并发送")
                                        findCapturedImageAndSend()
                                    } else {
                                        comm.showLogToFile("再次截图失败")
                                    }
                                }
                            }
                            //
                            break;
                        case 4: //1、首页推荐：视频浏览，点赞，评论，转发，关注 ---get
                            comm.showLog("回到home页面----")
                            // backToHome();
                            // sleep(2000);
                            // comm.randomSwipe(2);
                            returnMsg = unifyAttemptOperation_v3(interactionInHome_v2, taskInfo[i]);
                            if (returnMsg == "success") {
                                taskStatus = 1
                                console.log("上报成功");
                                //小任务上报任务完成（成功）
                                updateTask(taskType, task_id, 1, returnMsg, username)
                            } else {
                                console.log("上报失败:", returnMsg);
                                //小任务上报任务完成（失败）
                                updateTask(taskType, task_id, 2, returnMsg, username)
                            }
                            break;
                        case 5: //2、观看直播   ---get
                            //
                            returnMsg = unifyAttemptOperation_v3(watchLive_v2, taskInfo[i]);
                            if (returnMsg == "success") {
                                taskStatus = 1
                                console.log("上报成功");
                                //小任务上报任务完成（成功）
                                updateTask(taskType, task_id, 1, returnMsg, username)
                            } else {
                                console.log("上报失败:", returnMsg);
                                //小任务上报任务完成（失败）
                                updateTask(taskType, task_id, 2, returnMsg, username)
                            }
                            break;
                        case 6://3、粉丝列表关注
                            //
                            returnMsg = unifyAttemptOperation_v3(followFanList_v2, taskInfo[i]);
                            if (returnMsg == "success") {
                                taskStatus = 1
                                console.log("上报成功");
                                //小任务上报任务完成（成功）
                                updateTask(taskType, task_id, 1, returnMsg, username)
                            } else {
                                console.log("上报失败:", returnMsg);
                                //小任务上报任务完成（失败）
                                updateTask(taskType, task_id, 2, returnMsg, username)
                            }
                            break;
                        case 7: //4、推荐帐号关注（Inbox板块）
                            //
                            returnMsg = unifyAttemptOperation_v3(followAccountRecommended_v2, taskInfo[i]);
                            if (returnMsg == "success") {
                                taskStatus = 1
                                console.log("上报成功");
                                //小任务上报任务完成（成功）
                                updateTask(taskType, task_id, 1, returnMsg, username)
                            } else {
                                console.log("上报失败:", returnMsg);
                                //小任务上报任务完成（失败）
                                updateTask(taskType, task_id, 2, returnMsg, username)
                            }
                            break;
                        case 8: //5、Profile View关注,个人足迹查看和关注  ---get
                            //
                            returnMsg = unifyAttemptOperation_v3(profileView_v2, taskInfo[i]);
                            if (returnMsg == "success") {
                                taskStatus = 1
                                console.log("上报成功");
                                //小任务上报任务完成（成功）
                                updateTask(taskType, task_id, 1, returnMsg, username)
                            } else {
                                console.log("上报失败:", returnMsg);
                                //小任务上报任务完成（失败）
                                updateTask(taskType, task_id, 2, returnMsg, username)
                            }
                            break;
                        case 9: //6、商城浏览（随机查看几个产品）
                            //
                            returnMsg = unifyAttemptOperation_v3(whactShop_v2, taskInfo[i]);
                            if (returnMsg == "success") {
                                taskStatus = 1
                                console.log("上报成功");
                                //小任务上报任务完成（成功）
                                updateTask(taskType, task_id, 1, returnMsg, username)
                            } else {
                                console.log("上报失败:", returnMsg);
                                //小任务上报任务完成（失败）
                                updateTask(taskType, task_id, 2, returnMsg, username)
                            }
                            break;
                        case 10: //7、已关注帐号：视频浏览，点赞，评论，转发，关注 --get
                            //
                            returnMsg = unifyAttemptOperation_v3(followedAccount_v2, taskInfo[i]);
                            if (returnMsg == "success") {
                                taskStatus = 1
                                console.log("上报成功");
                                //小任务上报任务完成（成功）
                                updateTask(taskType, task_id, 1, returnMsg, username)
                            } else {
                                console.log("上报失败:", returnMsg);
                                //小任务上报任务完成（失败）
                                updateTask(taskType, task_id, 2, returnMsg, username)
                            }
                            break;
                        case 11: //8、自己发布视频的点赞和评论用户进行关注
                            //
                            returnMsg = unifyAttemptOperation_v3(videoLikesAndUserAttention_v2, taskInfo[i]);
                            if (returnMsg == "success") {
                                taskStatus = 1
                                console.log("上报成功");
                                //小任务上报任务完成（成功）
                                updateTask(taskType, task_id, 1, returnMsg, username)
                            } else {
                                console.log("上报失败:", returnMsg);
                                //小任务上报任务完成（失败）
                                updateTask(taskType, task_id, 2, returnMsg, username)
                            }
                            break;
                        case 12: //tk的老邀新活动
                            // comm.showLog("回到home页面")
                            // backToHome();
                            // sleep(2000);
                            // comm.randomSwipe(2);
                            returnMsg = AttemptOperation_Activitie(taskInfo[i]);
                            if (tkShareString != "") {
                                taskStatus = 1
                                console.log("上报成功");
                                let upStr = returnMsg + '|' + tkShareString
                                //小任务上报任务完成（成功）//如果成功，把success报上去
                                updateTask(taskType, task_id, 1, upStr, username)
                            } else {
                                console.log("上报失败:", returnMsg);
                                //小任务上报任务完成（失败）
                                updateTask(taskType, task_id, 2, '', username)
                            }
                            break;
                        case 13: //tk获取活动链接
                            // comm.showLog("回到home页面")
                            // backToHome();
                            // sleep(2000);
                            // comm.randomSwipe(2);
                            returnMsg = AttemptOperation_ActivitieGetUrl(taskInfo[i]);
                            if (returnMsg == "success") {
                                taskStatus = 1
                                console.log("上报成功");
                                //小任务上报任务完成（成功）//如果成功，把success报上去
                                updateTask(taskType, task_id, 1, returnMsg, username)
                            } else {
                                console.log("上报失败:", returnMsg);
                                //小任务上报任务完成（失败）
                                updateTask(taskType, task_id, 2, returnMsg, username)
                            }
                            break;
                        case 14: //打开tk邀请链接，如果失败，就切换代理并且再次尝试
                            if (bd_client_no != "") {
                                //解除限速
                                comm.httpToString("http://23.91.96.20:9101/api/client/limitSpeed?bd_client_no=" + bd_client_no)
                            }
                            returnMsg = AttemptOperation_OpenUrlAndProxy(taskInfo[i]);
                            if (returnMsg == "success") {
                                taskStatus = 1
                                console.log("上报成功");
                                //小任务上报任务完成（成功）//如果成功，把success报上去
                                updateTask(taskType, task_id, 1, returnMsg, username)
                            } else {
                                console.log("上报失败:", returnMsg);
                                //小任务上报任务完成（失败）
                                updateTask(taskType, task_id, 2, returnMsg, username)
                            }
                            break;
                        case 15: //解绑手机号
                            //
                            returnMsg = unifyAttemptOperation_v3(untapePhoneNumber_v2, taskInfo[i]);
                            if (returnMsg == "success") {
                                taskStatus = 1
                                console.log("上报成功");
                                //小任务上报任务完成（成功）
                                updateTask(taskType, task_id, 1, returnMsg, username)
                            } else {
                                console.log("上报失败:", returnMsg);
                                //小任务上报任务完成（失败）
                                updateTask(taskType, task_id, 2, returnMsg, username)
                            }
                            break;
                        case 16: // 群发任务
                            //
                            returnMsg = unifyAttemptOperation_v3(massSending_v2, taskInfo[i]);
                            if (returnMsg == "success") {
                                taskStatus = 1
                                console.log("上报成功");
                                //小任务上报任务完成（成功）
                                updateTask(taskType, task_id, 1, returnMsg, username)
                            } else {
                                console.log("上报失败:", returnMsg);
                                //小任务上报任务完成（失败）
                                updateTask(taskType, task_id, 2, returnMsg, username)
                            }
                            break;
                        case 17: // 视频发布
                            //
                            returnMsg = unifyAttemptOperation_v3(postVideo_v2, taskInfo[i]);
                            sleep(60000)
                            if (returnMsg == "success") {
                                taskStatus = 1
                                console.log("上报成功");
                                //小任务上报任务完成（成功）
                                updateTask(taskType, task_id, 1, returnMsg, username)
                            } else {
                                console.log("上报失败:", returnMsg);
                                //小任务上报任务完成（失败）
                                updateTask(taskType, task_id, 2, returnMsg, username)
                            }
                            break;
                        case 18: // 添加头像
                            //
                            returnMsg = unifyAttemptOperation_v3(addAvatar, taskInfo[i]);
                            sleep(60000)
                            if (returnMsg == "success") {
                                taskStatus = 1
                                console.log("上报成功");
                                //小任务上报任务完成（成功）
                                updateTask(taskType, task_id, 1, returnMsg, username)
                            } else {
                                console.log("上报失败:", returnMsg);
                                //小任务上报任务完成（失败）
                                updateTask(taskType, task_id, 2, returnMsg, username)
                            }
                            break;
                        case 19: // 修改昵称
                            //
                            returnMsg = unifyAttemptOperation_v3(changeUsername, taskInfo[i]);
                            sleep(60000)
                            if (returnMsg == "success") {
                                taskStatus = 1
                                console.log("上报成功");
                                //小任务上报任务完成（成功）
                                updateTask(taskType, task_id, 1, returnMsg, username)
                            } else {
                                console.log("上报失败:", returnMsg);
                                //小任务上报任务完成（失败）
                                updateTask(taskType, task_id, 2, returnMsg, username)
                            }
                            break;
                        case 20: // 重新登陆
                            if (bd_client_no != "") {
                                comm.showLogToFile("执行-解除限速")
                                //解除限速
                                comm.httpToString("http://23.91.96.20:9101/api/client/limitSpeed?bd_client_no=" + bd_client_no)
                            }
                            // 等待三秒，执行opentk
                            sleep(3000)
                            //
                            // returnMsg = logInAgain(taskInfo[i]);
                            returnMsg = logInAgain_v2(taskInfo[i]);
                            comm.showLogToFile("打印重新登陆的返回：" + returnMsg)
                            if (returnMsg == "success") {
                                taskStatus = 1
                                // 成功
                                //传递密码、account的id
                                comm.showLogToFile("请求回调：")
                                for (let b = 0; b < 3; b++) {
                                    httpShell('curl "http://120.236.196.248:8083/api/v1/tasklog/logout/callback?id=' + account_id + '&password=' + password_new + "&taskStatus=" + taskStatus + '"')
                                    sleep(10000)
                                }
                                //如果密码经过了修改的话
                                //备份
                                comm.showLogToFile("执行备份：")
                                // comm.showLogToFile('curl "http://127.0.0.1:8000/api/backup?backup_no=' + backupNo + '"')
                                httpShell('curl "http://127.0.0.1:8000/api/backup?backup_no=' + backupNo + '"')
                                comm.showLogToFile("等待60秒")
                                sleep(60000)
                                //
                                comm.showLogToFile("执行刷新包：")
                                // comm.showLogToFile('curl "http://23.91.96.20:8022/api/getInfo?account_id=' + account_id + '"')
                                httpShell('curl "http://23.91.96.20:8022/api/getInfo?account_id=' + account_id + '"')
                                comm.showLogToFile("等待50秒")
                                sleep(50000)

                            } else if (returnMsg == "默认失败，没有需要登陆的页面") {
                                taskStatus = 1
                                comm.showLogToFile("失败，但是需要通知一下回调")
                                for (let b = 0; b < 3; b++) {
                                    httpShell('curl "http://120.236.196.248:8083/api/v1/tasklog/logout/callback?id=' + account_id + "&taskStatus=" + taskStatus + '"')
                                    sleep(10000)
                                }
                                comm.showLogToFile("等待50秒")
                                sleep(50000)
                            } else {
                                comm.showLogToFile("失败")
                                taskStatus = 2
                                // 失败
                                for (let b = 0; b < 3; b++) {
                                    httpShell('curl "http://120.236.196.248:8083/api/v1/tasklog/logout/callback?id=' + account_id + "&taskStatus=" + taskStatus + '"')
                                    sleep(10000)
                                }
                            }
                        case 21: // 更换用户名 username
                            returnMsg = unifyAttemptOperation_v3(changeUsername_v2, taskInfo[i]);
                            comm.showLogToFile("执行返回：" + returnMsg)
                            sleep(30000)
                            if (returnMsg == "success") {
                                taskStatus = 1
                                // 成功
                                //传递密码、account的id
                                comm.showLogToFile("请求回调：")
                                for (let b = 0; b < 3; b++) {
                                    httpShell('curl "http://120.236.196.248:8083/api/v1/tasklog/username/callback?id=' + account_id + '&username=' + username_new + "&taskStatus=" + taskStatus + '"')
                                    sleep(10000)
                                }
                                //备份
                                comm.showLogToFile("执行备份：")
                                // comm.showLogToFile('curl "http://127.0.0.1:8000/api/backup?backup_no=' + backupNo + '"')
                                httpShell('curl "http://127.0.0.1:8000/api/backup?backup_no=' + backupNo + '"')
                                comm.showLogToFile("等待60秒")
                                sleep(60000)
                                //
                                comm.showLogToFile("执行刷新包：")
                                // comm.showLogToFile('curl "http://23.91.96.20:8022/api/getInfo?account_id=' + account_id + '"')
                                httpShell('curl "http://23.91.96.20:8022/api/getInfo?account_id=' + account_id + '"')
                                //
                                comm.showLogToFile("等待30秒")
                                sleep(30000)
                            } else if (returnMsg == '重新登陆失败') {
                                taskStatus = 2
                                comm.showLogToFile("重新登陆失败，需要通知一下回调")
                                for (let b = 0; b < 3; b++) {
                                    httpShell('curl "http://120.236.196.248:8083/api/v1/tasklog/username/callback?id=' + account_id + "&taskStatus=" + taskStatus + '"')
                                    sleep(10000)
                                }
                                comm.showLogToFile("等待30秒")
                                sleep(30000)
                            } else {
                                comm.showLogToFile("失败，啥也不干")
                                taskStatus = 2
                                // 失败 啥也不干
                            }
                            break;
                        case 22: // 更换头像
                            returnMsg = unifyAttemptOperation_v3(addAvatar_v2, taskInfo[i]);
                            comm.showLogToFile("执行返回：" + returnMsg)
                            sleep(30000)
                            if (returnMsg == "success") {
                                taskStatus = 1
                                // 成功
                                //传递密码、account的id
                                comm.showLogToFile("请求回调：")
                                for (let b = 0; b < 3; b++) {
                                    httpShell('curl "http://120.236.196.248:8083/api/v1/tasklog/avatar/callback?id=' + account_id + "&taskStatus=" + taskStatus + '"')
                                    sleep(10000)
                                }
                                //备份
                                comm.showLogToFile("执行备份：")
                                // comm.showLogToFile('curl "http://127.0.0.1:8000/api/backup?backup_no=' + backupNo + '"')
                                httpShell('curl "http://127.0.0.1:8000/api/backup?backup_no=' + backupNo + '"')
                                comm.showLogToFile("等待60秒")
                                sleep(60000)
                                //
                                comm.showLogToFile("执行刷新包：")
                                // comm.showLogToFile('curl "http://23.91.96.20:8022/api/getInfo?account_id=' + account_id + '"')
                                httpShell('curl "http://23.91.96.20:8022/api/getInfo?account_id=' + account_id + '"')
                                //
                                comm.showLogToFile("等待30秒")
                                sleep(30000)
                            } else if (returnMsg == '重新登陆失败') {
                                taskStatus = 2
                                comm.showLogToFile("重新登陆失败，需要通知一下回调")
                                for (let b = 0; b < 3; b++) {
                                    httpShell('curl "http://120.236.196.248:8083/api/v1/tasklog/avatar/callback?id=' + account_id + "&taskStatus=" + taskStatus + '"')
                                    sleep(10000)
                                }
                                comm.showLogToFile("等待30秒")
                                sleep(30000)
                            } else {
                                comm.showLogToFile("失败，啥也不干")
                                taskStatus = 2
                                // 失败 啥也不干
                            }
                            break;
                    }
                    comm.showLog("完成一个循环：" + i);
                    sleep(5000);
                }
                // 
                comm.showLog("完成所有，准备上报" + taskStatus);
                // sleep(1000*60*60*5)
                finishTask(taskStatus, username, account_id)
                // 运行打开tiktok函数
                // openTiktok(3,"")
                // 
                // if(task_type==3){
                //     console.log("下一步呢")
                //     // return
                //     username=taskJson.username
                //     // 具体任务内容
                //     // 打开tiktok
                //     openTiktok(task_type,"")
                //     sleep(1000)
                //     //判断是否登录
                //     comm.showLog('判断是否登录')
                //     let result=""
                //     backToHome()
                //     //new add
                //     sleep(2000)
                //     closeAllPop()
                //     //new add
                //     let homeBtn = selector().textContains('Home').visibleToUser(true).findOne(1000)

                //     if(homeBtn){
                //     result="success"
                //     }
                //     comm.showLog('登录状态-'+result)

                //     // 滑动
                //     comm.randomSwipe(5)
                //     // 
                //     sleep(2000)
                //     comm.showLog("buy now 流程【开始】");
                //     // 打开shop页面
                //     let taskInfo=taskJson.task_info
                //     // 
                //     let req = addToCardOrBuyNow_my(task_type,taskInfo.enter_method,taskInfo.product_no,taskInfo.seller_id,taskInfo.sku_name,1,taskInfo.tk_video_id,taskInfo.product_title,"",0,taskInfo.realname,taskInfo.card_number,taskInfo.discount,taskInfo.max_amount)
                //     sleep(1000)
                //     comm.showLog("addToCardOrBuyNow_my返回："+req)
                //     sleep(3000)
                //     comm.showLog("buy now 流程【结束】");
                //     if(req=="success"){
                //         comm.showLog("发送任务上报");
                //         updateTask(1,task_id,1,result,'')
                //         sleep(10000)
                //         httpShell('am force-stop com.zhiliaoapp.musically')
                //         sleep(10000)
                //     }
                //     // 

                //     for (let i = 0; i < 1000; i++) {
                //        comm.showLog("订单编号:"+taskInfo.org_order_no)
                //        sleep(1000)
                //        comm.showLog("规格:"+taskInfo.sku_name)
                //        sleep(1000)
                //        comm.showLog("价格:"+taskInfo.product_price)
                //        sleep(10000)
                //     }


                //     /*
                //     updateTask(1,task_id,1,result,'')
                //     sleep(10000)
                //     httpShell('am force-stop com.zhiliaoapp.musically')
                //     sleep(10000)
                //     */
                //     //stopAndroid()
                //     return
                // }else if(task_type==4){ 

                //     openTiktok(task_type,"")
                //     backToHome()
                //     for (let ss = 0; ss < 6; ss++) {
                //         let sx=random(1500, 1600)
                //         if(device.height<1500){
                //             sx=device.height-random(300, 350)
                //         }
                //         swipe(random(300, 330),sx, random(300, 330), random(100, 130), random(100, 300))
                //         sleep(random(4000, 5000)) 
                //         closeAllPop()
                //         sleep(1000) 
                //     }
                //     let status=1

                //     if(task_id>0){
                //         updateTask(task_type,task_id,status,'','')
                //         sleep(5000)
                //         httpShell("am force-stop com.zhiliaoapp.musically")
                //         sleep(5000)
                //     }
                // }else if (task_type==2) {
                //     let vcode_url=taskJson.task_info.vcode
                //     username=taskJson.username
                //     let password=taskJson.task_info.password

                //     result= login(username,password,vcode_url) 
                //     if(result=='success'){
                //         updateTask(2,task_id,1,result,username)
                //         //上报任务完成
                //         finishTask(task_type,task_id,1,result,username)
                //     }else{
                //         updateTask(2,task_id,2,result,username)
                //          //上报任务完成
                //          finishTask(task_type,task_id,2,result,username)
                //     }

                // }

            } else {
                comm.showLog("没有任务文件")
            }
            break
        }
    });
}



//

//修正个人中心滑块
function fixProfileOrderSlider() {
    comm.showLogToFile("开始执行 修正个人中心滑块")
    let homebtn = selector().textContains('Home').visibleToUser(true).findOne(1000)
    let profilebtn = selector().textContains('Profile').visibleToUser(true).findOne(1000)
    if (homebtn && profilebtn) {
        //进入个人主页
        comm.findTextClick("Profile")
        comm.showLogToFile("修正个人中心滑块-进入个人中心")
        sleep(random(3000, 4000))
        closeAllPop()
        sleep(random(3000, 4000))
        closeAllPop()
        sleep(random(2000, 3000))
        let yourOrderBtn = selector().textContains('Your order').visibleToUser(true).findOne(1000)
        if (yourOrderBtn) {
            comm.clickObj(yourOrderBtn)
            sleep(random(5000, 8000))
        } else {
            comm.showLogToFile("修正个人中心滑块-没有进入订单入口")
            return false
        }
        sleep(8000)
        //判断是否存在滑块
        comm.showLogToFile("判断有没有滑块验证码")
        // imageCodeVerify_my()
        imageCodeVerify_Buy()
        comm.showLogToFile("验证码结束")
        sleep(5000)
        // 点击view all
        let viewAllBtn = selector().textContains('View all').visibleToUser(true).findOne(1000)
        if (viewAllBtn) {
            comm.clickObj(viewAllBtn)
            sleep(random(5000, 8000))
        } else {
            comm.showLogToFile("修正个人中心滑块-没有进入View-all入口")
            return false
        }
        // 
        sleep(8000)
        comm.showLogToFile("判断有没有滑块验证码")
        // imageCodeVerify_my()
        imageCodeVerify_Buy()
        comm.showLogToFile("验证码结束")
        sleep(5000)
        //
        if (selector().textContains('Your orders').visibleToUser(true).exists() || selector().text('Orders').visibleToUser(true).exists() || selector().desc('Orders,heading').visibleToUser(true).exists()) {
            comm.showLogToFile("修正个人中心滑块-成功进入个人中心订单页")
            // 返回几下，点击找到home页面
            back()
            sleep(random(3000, 4000))
            back()
            sleep(random(3000, 4000))
            //
            backToHome()
            return true
        } else {
            comm.showLogToFile("修正个人中心滑块-没有进入个人中心订单页")
            return false
        }
    }
}


// 错误和正确信息的返回
function performOperation() {
    try {
        // 你的操作代码
        let result = someSynchronousOperation();
        if (result) {
            return "操作成功";
        } else {
            throw new Error("操作失败");
        }
    } catch (error) {
        return "操作失败: " + error.message;
    }
}

//新的测试错误与重试机制_测试
function unifyAttemptOperation_Test(testFun, data) {
    let attempts = 0;
    let errMsg = "失败"
    while (attempts < 5) {
        errMsg = testFun(data)
        if (errMsg == "success") {
            return "success"; // 成功则退出函数
        } else {
            // console.log('操作失败，正在重试...');
            console.log(errMsg);
            sleep(2000)
            attempts++; // 增加尝试次数
        }
    }
    // throw new Error('操作失败五次，返回自定义错误'); // 五次失败后抛出错误
    // throw "操作失败五次，返回自定义错误"; // 五次失败后抛出错误
    return errMsg;
}
//测试
function attemptOperationHelper(data) {
    console.log(data)
    // 放置你的操作逻辑，同上例
    // return Math.random() > 0.9; // 随机成功或失败（true/false）
    let Num = Math.random()
    if (Math.random() > 0.7) {
        return "success"
    } else {
        return "一些我自己的自定义错误信息" + Num
    }
}

// 统一重试和返回机制
function unifyAttemptOperation(funName, data) {
    if (bd_client_no != "") {
        comm.showLogToFile("执行-解除限速")
        //解除限速
        comm.httpToString("http://23.91.96.20:9101/api/client/limitSpeed?bd_client_no=" + bd_client_no)
    }
    let attempts = 0;
    let errMsg = "失败"
    while (attempts < 5) {
        errMsg = funName(data)
        if (errMsg == "success") {
            return "success"; // 成功则退出函数
        } else if (errMsg == '还有验证码存在，不成功') {
            return '还有验证码存在，不成功'
        } else {
            // console.log('操作失败，正在重试...');
            console.log(errMsg);
            comm.showLog("回到home页面")
            backToHome();
            sleep(5000)
            attempts++; // 增加尝试次数
        }
    }
    return errMsg;
}

function unifyAttemptOperation_v2(funName, data) {
    if (bd_client_no != "") {
        comm.showLogToFile("执行-解除限速")
        //解除限速
        comm.httpToString("http://23.91.96.20:9101/api/client/limitSpeed?bd_client_no=" + bd_client_no)
    }


    let errMsg = funName(data)
    //
    return errMsg;
}

//新的一个，想把一些公共的比如opentk优先集中到这个环节进行处理
function unifyAttemptOperation_v3(funName, data) {
    if (bd_client_no != "") {
        comm.showLogToFile("执行-解除限速")
        //解除限速
        comm.httpToString("http://23.91.96.20:9101/api/client/limitSpeed?bd_client_no=" + bd_client_no)
    }
    // 等待三秒，执行opentk
    sleep(3000)
    let openTKMsg = openTiktok_v2() //打开tk
    comm.showLogToFile("openTiktok返回：" + openTKMsg)
    if (openTKMsg == 'success') {
        comm.showLogToFile("openTiktok执行成功")
    } else {
        return openTKMsg
    }
    //
    comm.randomSwipe(3)
    sleep(8000)

    let errMsg = funName(data)
    comm.showLogToFile("执行函数返回:" + errMsg)
    //
    return errMsg;
}



// tk活动的重试和返回机制
function AttemptOperation_Activitie(taskInfo) {
    //
    let returnMsg = tkInvitesActivities(taskInfo)
    comm.showLog("打印Activitie函数返回:" + returnMsg)
    return returnMsg

}

//tk活动获取链接的重试和返回机制
function AttemptOperation_ActivitieGetUrl(taskInfo) {
    let task_id = taskInfo.task_id
    let returnMsg = "失败"
    let stat = 2
    for (let j = 0; j < 3; j++) {
        comm.showLog("大循环:" + j)
        sleep(2000)
        // className = android.widget.LinearLayout

        returnMsg = tkInvitesActivitiesGetUrl(taskInfo)
        comm.showLog("实际执行函数返回:" + returnMsg)
        if (returnMsg == "success") {
            stat = 1
        } else {
            stat = 2
        }
        return "success"

        for (let i = 0; i < 3; i++) {
            comm.showLog("调用请求接口验证:" + i)
            //调用接口验证结果 {"code": 0, "message": "success"}
            // let requeString = httpShell("http://23.91.96.20:8022/api/invite/verify?task_id="+task_id+"&account_id="+account_id+"&status="+stat)
            let requeString = comm.httpToString('http://23.91.96.20:8022/api/invite/verify?task_id=' + task_id + '&account_id=' + account_id + '&status=' + stat)
            // comm.showLog("接口验证返回:"+requeString)
            let taskJson = JSON.parse(requeString)
            if (taskJson.message == "success") {
                return "success"
            }
            if (i == 2) {
                returnMsg = "任务结果:" + stat + "，但接口验证失败"
            }
            //等待十秒
            sleep(10000)
        }
    }
    return returnMsg

}
//浏览器打开tk链接的代理重试和返回机制
function AttemptOperation_OpenUrlAndProxy(taskInfo) {
    //
    let returnMsg = "失败"
    for (let j = 0; j < 3; j++) {
        //
        returnMsg = tkInvitesOpenUrlAndProxy(taskInfo)
        if (returnMsg == "success") {
            return "success"
        } else {
            back()
            //执行切换代理
            // let randomStr = generateRandomString(9)
            // comm.showLog("执行切换代理")
            // // httpShell("dg config -r proxy -a proxy.enabled=true -a proxy.protocol=socks5 -a proxy.host=gate2.ipweb.cc -a proxy.port=7778 -a proxy.user=B_34942_US___30_"+randomStr+" -a proxy.pass=191df999 -a proxy.udp=true -a proxy.dns=8.8.8.8 -a proxy.dnsType=tcp")
            // httpShell("dg config -r proxy -a proxy.enabled=true -a proxy.protocol=socks5 -a proxy.host=gate2.ipweb.cc -a proxy.port=7778 -a proxy.user=B_48989_US___10_"+randomStr+" -a proxy.pass=Aa798919 -a proxy.udp=true -a proxy.dns=8.8.8.8 -a proxy.dnsType=tcp")
            sleep(20000)
        }
    }
    return returnMsg
}
//菜单执行的
function AttemptOperation_OpenUrlAndProxy_Menu(taskInfo) {
    //
    let task_id = taskInfo.task_id
    let returnMsg = "失败"
    for (let j = 0; j < 3; j++) {
        //
        returnMsg = tkInvitesOpenUrlAndProxy(taskInfo)
        if (returnMsg == "success") {
            back()
            sleep(2000)
            updateTask(2, task_id, 1, returnMsg, '')
            return "success"
        } else {
            back()
            sleep(2000)
            //小任务上报任务完成（失败）
            updateTask(2, task_id, 2, returnMsg, '')
            //
            //执行切换代理
            let randomStr = generateRandomString(9)
            comm.showLog("执行切换代理")
            httpShell("dg config -r proxy -a proxy.enabled=true -a proxy.protocol=socks5 -a proxy.host=gate2.ipweb.cc -a proxy.port=7778 -a proxy.user=B_34942_US___30_" + randomStr + " -a proxy.pass=191df999 -a proxy.udp=true -a proxy.dns=8.8.8.8 -a proxy.dnsType=tcp")
        }
    }
    return returnMsg
}

// 生成随机字母
function getRandomLetter() {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    return letters.charAt(Math.floor(Math.random() * letters.length));
}

//生成随机字母组合的函数
function generateRandomString(length) {
    let result = '';
    for (let i = 0; i < length; i++) {
        result += getRandomLetter();
    }
    return result;
}



// login的重试和返回机制
function AttemptOperation_Login(taskInfo) {
    let vcode_url = taskInfo.vcode
    let password = taskInfo.password
    let loginType = taskInfo.login_type
    let email = taskInfo.email
    let returnMsg = "失败"
    for (let j = 0; j < 3; j++) {
        comm.showLog("执行大循环:" + j)
        //
        returnMsg = login(email, username, loginType, password, vcode_url)
        comm.showLog("打印login函数返回:" + returnMsg)
        if (returnMsg == 'success') {
            return "success";
        } else if (returnMsg == '账号不存在') {
            return "账号不存在"
        } else if (returnMsg == '操作频繁') {
            return "操作频繁"
        } else if (returnMsg.includes("登录警告")) {
            return returnMsg
        } else {
            comm.showLog("如果第二次之后执行，先杀掉进程")
            httpShell('am force-stop com.zhiliaoapp.musically')
            if (!app.launch('com.zhiliaoapp.musically')) {
                console.log('App 启动失败')
                return "tk启动失败"
            }
            sleep(2000);
        }
    }
    return returnMsg
}
function AttemptOperation_Login_test(taskInfo) {
    let vcode_url = taskInfo.vcode
    let password = taskInfo.password
    let loginType = taskInfo.login_type
    let email = taskInfo.email
    let returnMsg = "失败"
    for (let j = 0; j < 1; j++) {
        comm.showLog("执行大循环:" + j)
        //
        returnMsg = login(email, username, loginType, password, vcode_url)
        comm.showLog("打印login函数返回:" + returnMsg)

    }
    return returnMsg
}

// {
//     "task_id": 1,
//     "task_type": 1,     //注册
//     "regist_type": 1,     //1手机 2邮箱
//     "mobile": "xxxxxx", //要注册的账号
//     "email": "xxxxxx", //要注册的账号
//     "password": "d049136422@3848",//密码
// },
// {"country":"US","account_id":111111,"username":"kylie.weaver5","task_info":[{"task_id":1,"task_type":1,"regist_type":2,"mobile":"xxxxxx","email":"kodeblu@mailsdog.com","password":"d049136422@3848"}]}
//regist的重试和返回机制
function AttemptOperation_Register(taskInfo) {
    let regist_type = taskInfo.regist_type
    let mobile = taskInfo.mobile
    let email = taskInfo.email
    let password = taskInfo.password
    let nickname = taskInfo.nickname
    let security_mail = taskInfo.security_mail
    //
    let returnMsg = "失败"
    // for (let j=0;j<5;j++){
    for (let j = 0; j < 1; j++) {
        comm.showLog("执行大循环:" + j)
        // function register(reg_type,email,phone,password,nick_name,username,task_id,need_code)
        if (regist_type == 3) {
            returnMsg = register_google(email, password, nickname)   //谷歌登录
        } else {
            returnMsg = register(regist_type, email, mobile, password, nickname) //普通登录 (手机或者邮箱)
        }
        comm.showLog("打印register函数返回:" + returnMsg)
        sleep(20000)
        if (returnMsg == 'success') {
            return "success";
        } else if (returnMsg == '账号已注册') {
            return "账号已注册"
        } else {
            // comm.showLog("如果第二次之后执行，先杀掉进程")
            // httpShell('am force-stop com.zhiliaoapp.musically')
            // if (!app.launch('com.zhiliaoapp.musically')) {
            //     console.log('App 启动失败')
            //     return "tk启动失败"
            // }
            // sleep(2000);
            break
        }
    }
    return returnMsg
}

//测试用，会整合到注册流程中
function AttemptOperation_RegisterGoogle(taskInfo) {
    // let regist_type = taskInfo.regist_type
    let email = taskInfo.email
    let password = taskInfo.password
    let nickname = taskInfo.nickname
    bd_client_no = "VGZA10200163012_00"
    //
    let returnMsg = "失败"
    // for (let j=0;j<5;j++){
    for (let j = 0; j < 5; j++) {
        comm.showLog("执行大循环:" + j)
        returnMsg = register_google(email, password, nickname)
        comm.showLog("打印register函数返回:" + returnMsg)
        if (returnMsg == 'success') {
            return "success";
        } else if (returnMsg == '账号已注册') {
            return "账号已注册"
        } else {
            comm.showLog("如果第二次之后执行，先杀掉进程")
            httpShell('am force-stop com.zhiliaoapp.musically')
            if (!app.launch('com.zhiliaoapp.musically')) {
                console.log('App 启动失败')
                return "tk启动失败"
            }
            sleep(2000);
        }
    }
    //
    return returnMsg
}

//采购任务(测试用)
function orderTask_tast(taskInfo) {
    comm.showLogToFile("采购任务(测试)")
    // openTiktok(0)

    //判断发送消息 0短视频 1关键字 2采购 3直接购买   2采购不发送消息
    // if (taskInfo.type != 2){
    //     let seller_id = taskInfo.seller_id
    //     let stxt = taskInfo.stxt
    //     setSellerText(stxt,seller_id)
    //     sleep(20000)
    //     if (selector().textContains('Verify to continue').visibleToUser(true).exists()){
    //         comm.showLogToFile("有验证码")
    //         imageCodeVerify_Buy()
    //     }
    // }
    sleep(5000)
    let homeBtn = selector().textContains('Home').visibleToUser(true).findOne(1000)
    let profileBtn = selector().textContains('Profile').visibleToUser(true).findOne(1000)
    if (homeBtn && profileBtn) {
        comm.showLogToFile("有首页")
    } else {
        back()
    }
    sleep(2000)


    // sleep(6000)
    //先判断是不是在首页
    let product_title = taskInfo.product_title //商品的名称
    let buy_link_title = taskInfo.buy_link_title //商品购买连接标题
    let showcase_url = taskInfo.showcase_url //达人橱窗链接
    //判断是否有橱窗链接
    if (showcase_url != '' && orderShowcase(taskInfo)) {
        //空着，啥也不用写
    } else {
        // 
        comm.showLog("进行普通下单")
        //判断有没有videoid，有videoid
        if (taskInfo.tk_video_id != '') {
            comm.showLogToFile("有video_id")
            sleep(2000)
            //获取url，通过浏览器的方式打开链接
            openLinkFromBrowser(taskInfo.tk_video_id)
            comm.showLogToFile("等待10秒确保网页打开")
            sleep(10000)
            //
            for (let i = 0; i < 20; i++) {
                let openBtn = selector().textContains('Not now').visibleToUser(true).findOne(1000)
                if (!openBtn) {
                    openBtn = selector().textContains('以后再说').visibleToUser(true).findOne(1000)
                }
                if (openBtn) {
                    comm.clickObj(openBtn)
                } else {
                    openBtn = selector().textContains('Open TikTok').visibleToUser(true).findOne(1000)
                    if (!openBtn) {
                        openBtn = selector().textContains('Open app').visibleToUser(true).findOne(1000)
                        if (!openBtn) {
                            comm.showLogToFile("没有Open-app" + i)
                            openBtn = selector().textContains('Watch on TikTok').visibleToUser(true).findOne(1000)
                        }
                    }
                    if (openBtn) {
                        comm.clickObj(openBtn)
                    }
                }
                //
                comm.showLogToFile("判断有没有验证码")
                imageCodeVerify_Buy()
                comm.showLogToFile("验证码结束")
                //
                let reloadBtn = selector().textContains('Reload').visibleToUser(true).findOne(1000)
                if (reloadBtn) {
                    if (i == 5 || i == 12) {
                        comm.pullDownRefresh(1)
                        // }else if(i == 8){
                        //     comm.showLog("执行代理")
                        //     let randomStr = generateRandomString(6)
                        //     comm.showLog("执行切换代理")
                        //     httpShell("dg config -a proxy.enabled=false; sleep 2; settings put global package_verifier_enable 0; dg apt install plugin:proxy; dg config -a proxy.enabled=true -a proxy.udp=true -a proxy.dnsType=tcp -a proxy.dns=8.8.8.8 -a proxy.dns2=1.1.1.1 -a proxy.protocol=socks5 -a proxy.host=gate2.ipweb.cc -a proxy.port=7778 -a proxy.user=B_34942_US___5_FH"+randomStr+"tjt -a proxy.pass=191df999")
                        //     sleep(10000)
                    } else {
                        //
                        comm.clickObj(reloadBtn)
                    }
                }
                //
                let homeBtn = selector().textContains('Home').visibleToUser(true).findOne(1000)
                let profileBtn = selector().textContains('Profile').visibleToUser(true).findOne(1000)
                if (homeBtn && profileBtn) {
                    comm.showLogToFile("有首页")
                    break
                }
                //
                let VerifyContinue = selector().textContains('Verify to continue:').visibleToUser(true).findOne(1000)
                if (VerifyContinue) {
                    comm.showLogToFile("有验证码")
                    break
                }
                sleep(5000)
            }
            //
            for (let i = 0; i < 5; i++) {
                let productNotAvailable = selector().textContains('in your country or region').visibleToUser(true).findOne(1000)
                if (productNotAvailable) {
                    return "该产品在该国家或地区不可用"
                }
                sleep(1000)
            }
            //默认已经进入首页，检测是否真的在首页
            let homeBtn = selector().textContains('Home').visibleToUser(true).findOne(1000)
            let profileBtn = selector().textContains('Profile').visibleToUser(true).findOne(1000)
            if (homeBtn && profileBtn) {
                comm.showLogToFile("有首页")
            } else {
                //
                comm.showLogToFile("没进首页，有可能有验证码，验证一下")
                imageCodeVerify_Buy()
                comm.showLogToFile("验证码结束")
                let VerifyContinue = selector().textContains('Verify to continue:').visibleToUser(true).findOne(1000)
                if (VerifyContinue) {
                    return "验证码不通过"
                }
                //
                comm.showLogToFile("点击一下屏幕中心")
                click(device.width / 2, device.height / 2)
            }
            sleep(2000)
            homeBtn = selector().textContains('Home').visibleToUser(true).findOne(1000)
            profileBtn = selector().textContains('Profile').visibleToUser(true).findOne(1000)
            if (homeBtn && profileBtn) {
                comm.showLogToFile("有首页")
            } else {
                return "没成功进首页"
            }
            // 点击短视频-商品的入口，通过商品标题的前15个字符匹配
            // let pronBtn = selector().textContains(product_title.slice(0, 15)).visibleToUser(true).findOne(1000)
            // if(pronBtn){
            //     comm.showLog("找到商品链接按钮")
            //     comm.clickObj(pronBtn)
            // }else{
            //     comm.showLog("没有找到商品链接按钮")
            //     return "没有找到商品链接按钮"
            // }
            sleep(10000)
            //找到并点击商品按钮
            if (findTheProductLinkBtn(product_title, buy_link_title)) {
                sleep(5000)
                let eligibility = selector().textContains('you must meet the eligibility').visibleToUser(true).findOne(1000)
                if (eligibility) {
                    back()
                    sleep(2000)
                    if (!findTheProductLinkBtn(product_title, buy_link_title)) {
                        comm.showLogToFile("没有找到商品链接按钮")
                        return "没有找到商品链接按钮"
                    }
                }
            } else {
                comm.showLogToFile("没有找到商品链接按钮")
                return "没有找到商品链接按钮"
            }
            sleep(20000)
            // 判断有没有滑块验证码
            comm.showLogToFile("判断有没有滑块验证码")
            // imageCodeVerify_my()
            imageCodeVerify_Buy()
            comm.showLogToFile("验证码结束")
            let VerifyContinue = selector().textContains('Verify to continue:').visibleToUser(true).findOne(1000)
            if (VerifyContinue) {
                return "验证码不通过"
            }

        } else {
            comm.showLogToFile("没video_id")
            sleep(2000)
            comm.randomSwipe(2);
            sleep(2000)
            // 重试一下
            let contTag = false
            for (let i = 0; i < 2; i++) {
                let shopBtns = selector().text('Shop').visibleToUser(true).find()
                if (shopBtns) {
                    comm.showLogToFile("找到顶部shop按钮" + shopBtns.length)
                    if (shopBtns.length == 1) {
                        if (shopBtns[0].bounds().centerY() < 300) {
                            comm.randomSwipeSlow(1)
                            comm.clickObj(shopBtns[0])
                            contTag = true
                            break
                        }
                    } else if (shopBtns.length > 1) {
                        for (let j = 0; j < shopBtns.length; j++) {
                            if (shopBtns[j].bounds().centerY() < 300) {
                                comm.randomSwipeSlow(1)
                                comm.clickObj(shopBtns[j])
                                contTag = true
                                break
                            }
                            sleep(3000)
                        }
                    } else {
                        //kill掉tk，并启动
                        httpShell('am force-stop com.zhiliaoapp.musically')
                        if (!app.launch('com.zhiliaoapp.musically')) {
                            console.log('App 启动失败')
                            return "tk启动失败"
                        }
                        sleep(10000);
                    }
                } else {
                    comm.showLogToFile("找不到找到顶部shop按钮")
                    //kill掉tk，并启动
                    httpShell('am force-stop com.zhiliaoapp.musically')
                    if (!app.launch('com.zhiliaoapp.musically')) {
                        console.log('App 启动失败')
                        return "tk启动失败"
                    }
                    sleep(10000);
                }
                if (contTag) {
                    break
                }
            }
            sleep(5000)
            closeAllPop()
            comm.randomSwipeSlow(1)
            //等待网络加载
            for (let i = 0; i < 20; i++) {
                sleep(10000)
                if (selector().textContains('Search').visibleToUser(true).exists()) {
                    break
                }
                let tryAgain = selector().textContains('try agin').visibleToUser(true).findOne(1000)
                if (tryAgain) {
                    comm.clickObj(tryAgain)
                } else {
                    comm.pullDownRefresh(1)

                }
            }
            //获取url，通过浏览器的方式打开链接
            // openLinkFromBrowser(taskInfo.url)
            sleep(5000)

            // //可能直接打开商品的半框、可能直接打开那个搜索框
            // if(selector().textContains('buy now').visibleToUser(true).exists()){

            // }
            for (let i = 0; i < 10; i++) {
                if (i == 9) {
                    return "进入商品页面失败"
                }
                sleep(5000)
                comm.pullDownRefresh(1)
                sleep(5000)
                if (i == 0 || i == 8) {
                    openProduct(taskInfo.product_no, taskInfo.seller_id)
                    comm.showLogToFile("执行了openProduct！！！！！")
                    sleep(5000)
                }
                sleep(8000)
                //看看会不会出现没网络try again的字样 
                let contTag = false
                for (let j = 0; j < 15; j++) {
                    if (j == 14) {
                        sleep(5000)
                        let homeBtn = selector().textContains('Home').visibleToUser(true).findOne(1000)
                        let profileBtn = selector().textContains('Profile').visibleToUser(true).findOne(1000)
                        if (homeBtn && profileBtn) {
                            comm.showLogToFile("有首页")
                        } else {
                            back()
                        }
                        contTag = true
                        break
                    }
                    if (selector().textContains('Buy now').visibleToUser(true).exists()) {
                        comm.showLogToFile("有Buy now")
                        comm.randomSwipeSlow(1)
                        break
                    } else if (selector().textContains('try again').visibleToUser(true).exists()) {
                        for (let i = 0; i < 5; i++) {
                            if (selector().textContains('Shop').visibleToUser(true).exists()) {
                                comm.showLogToFile("回到shop页面")
                                break
                            } else {
                                comm.showLogToFile("没有回到shop页面")
                            }
                            back()
                            sleep(3000)
                        }
                    } else if (selector().textContains('Verify to continue').visibleToUser(true).exists()) {
                        comm.showLogToFile("有验证码")
                        imageCodeVerify_Buy()
                        sleep(5000)
                        //
                    } else {
                        comm.showLogToFile("没有验证码、没有try again" + j)
                        if (selector().textContains('Buy now').visibleToUser(true).exists()) {
                            break
                        }
                        let selectObjs = selector().textContains(product_title.slice(0, 15)).visibleToUser(true).find()
                        if (selectObjs.length == 0) {
                            comm.showLogToFile("没有匹配项" + j)
                        } else {
                            // comm.clickObj(selectObjs[0])
                            break
                        }
                    }
                    sleep(5000)
                }
                if (contTag) {
                    continue
                }
                sleep(5000)
                // 判断商品匹配项
                contTag = false
                for (let j = 0; j < 15; j++) {
                    if (j == 14) {
                        comm.showLogToFile("商品没有匹配项")
                        for (let i = 0; i < 5; i++) {
                            if (selector().textContains('Shop').visibleToUser(true).exists()) {
                                break
                            }
                            back()
                            sleep(3000)
                        }
                        contTag = true
                        break
                    }
                    comm.showLog("等待10秒页面稳定")
                    comm.showLog("找：" + product_title.slice(0, 20))
                    sleep(10000)
                    //
                    let selectObjs = selector().textContains(product_title.slice(0, 20)).visibleToUser(true).find()
                    if (selectObjs.length == 0) {
                        comm.showLogToFile("没有匹配项" + j)
                        comm.randomSwipeSlow(1)
                    } else if (selectObjs.length == 1) {
                        comm.showLogToFile("有一个匹配项" + j)
                        comm.clickObj(selectObjs[0])
                        sleep(5000)
                        break
                    } else if (selectObjs.length > 1) {
                        comm.showLogToFile("有多个匹配项" + j)
                        //可能会存在点到店铺的那个按钮,店铺名称也是同名
                        let isFond = false
                        for (let i = 0; i < selectObjs.length; i++) {
                            if (selectObjs[i].text().includes("Sold by")) {
                                continue
                            } else {
                                comm.clickObj(selectObjs[i])
                                sleep(5000)
                                isFond = true
                                break
                            }
                        }
                        if (!isFond) {
                            comm.clickObj(selectObjs[1])
                            sleep(5000)
                            break
                        } else {
                            break
                        }
                    }
                    sleep(5000)
                }
                if (contTag) {
                    continue
                }
                //判断是否进入商品页面
                contTag = false
                for (let j = 0; j < 15; j++) {
                    if (j == 14) {
                        comm.showLogToFile("没有进入商品页面")
                        for (let i = 0; i < 5; i++) {
                            if (selector().textContains('Shop').visibleToUser(true).exists()) {
                                break
                            }
                            back()
                            sleep(3000)
                        }
                        contTag = true
                        break
                    }
                    let addToCart = selector().textContains('Add to cart').visibleToUser(true).findOne(1000)
                    if (addToCart) {
                        break
                    }
                    let VerifyContinue = selector().textContains('Verify to continue:').visibleToUser(true).findOne(1000)
                    if (VerifyContinue) {
                        comm.showLogToFile("有验证码")
                        imageCodeVerify_Buy()
                        sleep(5000)
                    }
                    sleep(5000)
                }
                if (contTag) {
                    continue
                } else {
                    //如果到这里都还是false，那就中断，说明成功了
                    break
                }
                //
            }

            //
            comm.showLogToFile("成功进入商品页面")
            //
        }
    }

    ////////////////////////////////////////////////////////选商品页面///////////////////////////////////////////////////////////////
    //现象出现点进去了别商品（奇怪）
    //到这里为止，已经进入商品详情了
    sleep(10000)
    comm.randomSwipeSlow(2)
    sleep(10000)
    imageCodeVerify_Buy()
    sleep(2000)
    // 判断商品标题对不对
    let title_list = selector().textContains(product_title.slice(0, 20)).visibleToUser(true).findOne(1000)
    if (title_list) {
        comm.showLogToFile("匹配到这个标题")
        sleep(1000)
        // comm.clickObj(title_list)
        // title_list=selector().textContains(product_title).visibleToUser(true).findOne(1000)
        // if (title_list){
        //     comm.showLog("完全匹配到这个标题")
        // }
    } else {
        sleep(2000)
        comm.randomSwipeSlow(1)
        title_list = selector().textContains(product_title.slice(0, 20)).visibleToUser(true).findOne(1000)
        if (title_list) {
            comm.showLogToFile("匹配到这个标题")
            sleep(1000)
        } else {
            return "可能没找到标题"
        }
    }
    //判断一下是不是商品被移除
    let beenRem = selector().textContains("This item has been removed").visibleToUser(true).findOne(1000)
    if (beenRem) {
        return "商品被移除"
    }
    //判断购买
    if (taskInfo.enter_method == 0) {
        comm.showLogToFile("直接购买")
    } else {
        comm.showLogToFile("进入商家主页进行购买（目前没有）")
    }

    sleep(3000)
    comm.randomSwipeSlow(2)
    sleep(10000)
    imageCodeVerify_Buy()

    //判断一下有没有库存
    beenRem = selector().textContains("This item has been removed").visibleToUser(true).findOne(1000)
    if (beenRem) {
        return "商品被移除"
    }
    return "中断"
    //点一下buy now，不知道有没有sku的选择
    //
    for (let j = 0; j < 10; j++) {
        if (j == 9) {
            return "没找到buy now按钮"
        }
        let buyNow = selector().className('android.widget.Button').textContains('Buy now').findOne(1000)
        if (buyNow) {
            comm.showLogToFile("buy now按钮存在，点一下")
            comm.clickObj(buyNow)
            sleep(10000)
            imageCodeVerify_Buy()
            //
            buyNow = selector().className('android.widget.Button').textContains('Buy now').findOne(1000)
            if (buyNow) {
                comm.clickObj(buyNow)
                //如果还存在，就去选择sku
                sleep(5000)
                //来回滑动一下
                comm.randomToAndFroSwipe()
                //可能会出现选择验证码
                sleep(20000)
                // 判断有没有滑块验证码
                comm.showLogToFile("判断有没有滑块验证码")
                // imageCodeVerify_my()
                imageCodeVerify_Buy()
                comm.showLogToFile("验证码结束")
                let contTag = false
                for (let i = 0; i < 5; i++) {
                    buyNow = selector().className('android.widget.Button').textContains('Buy now').findOne(1000)
                    if (buyNow) {
                        comm.showLogToFile("开始选择sku")
                        // if(doSku(taskInfo.sku_name)){
                        if (doSku_v2(taskInfo.sku_name)) {
                            comm.showLogToFile("sku选择成功")
                            contTag = true
                            break
                        } else {
                            comm.showLogToFile("sku选择失败")
                            return "sku选择失败"
                        }
                    } else {
                        //看看是不是进checkout页面了
                        if (selector().textContains('Checkout').visibleToUser(true).exists()) {
                            comm.showLogToFile("进入了支付页面")
                            sleep(3000)
                            comm.randomToAndFroSwipe(1)
                            //支付页面也可能存在，没网络的框，判断银行卡界面有没有Payment method
                            if (selector().textContains('Payment method').visibleToUser(true).exists()) {
                                // 有这个，说明真的进checkout页面了
                                contTag = true
                                break
                            } else if (selector().textContains('Place order').visibleToUser(true).exists()) {
                                //否则，判断是不是卡了或者验证码
                                contTag = true
                                break
                            } else {
                                for (let i = 0; i < 5; i++) {
                                    if (selector().textContains('Buy now').visibleToUser(true).exists()) {
                                        break
                                    }
                                    back()
                                    sleep(3000)
                                }

                            }

                        } else if (selector().textContains('Retry').visibleToUser(true).exists()) {
                            let retryBtn = selector().textContains("Retry").visibleToUser(true).findOne(1000)
                            if (retryBtn) {
                                //如果retry存在，点击
                                comm.clickObj(retryBtn)
                                sleep(5000)
                                retryBtn = selector().textContains("Retry").visibleToUser(true).findOne(1000)
                                if (retryBtn) {
                                    //如果还存在，返回到buy now页面
                                    for (let i = 0; i < 5; i++) {
                                        if (selector().textContains('Buy now').visibleToUser(true).exists()) {
                                            break
                                        }
                                        back()
                                        sleep(3000)
                                    }

                                }
                            } else {
                                for (let i = 0; i < 5; i++) {
                                    if (selector().textContains('Buy now').visibleToUser(true).exists()) {
                                        break
                                    }
                                    back()
                                    sleep(3000)
                                }
                            }
                        } else if (selector().textContains('Verify to continue:').visibleToUser(true).exists()) {
                            //也不是checkout，也不是retry那就是验证码  Verify to continue:
                            imageCodeVerify_Buy()
                            continue
                        } else {
                            // 直接返回buy now页面
                            for (let i = 0; i < 5; i++) {
                                if (selector().textContains('Buy now').visibleToUser(true).exists()) {
                                    break
                                }
                                back()
                                sleep(3000)
                            }
                        }
                    }
                    sleep(5000)
                }
                if (contTag) {
                    break
                } else {
                    continue
                }
            } else {
                //如果不存在，就判断是不是进入了checkout页面，或者出现retry
                if (selector().textContains('Checkout').visibleToUser(true).exists()) {
                    comm.showLogToFile("进入了支付页面")
                    sleep(3000)
                    comm.randomToAndFroSwipe()
                    //支付页面也可能存在，没网络的框，判断银行卡界面有没有Payment method
                    if (selector().textContains('Payment method').visibleToUser(true).exists()) {
                        // 有这个，说明真的进checkout页面了
                        break
                    } else if (selector().textContains('Place order').visibleToUser(true).exists()) {
                        //否则，判断是不是卡了或者验证码
                        break
                        // }else{
                        //     //否则，判断是不是卡了或者验证码
                        //     for (let i = 0;i<5;i++){
                        //         if (selector().textContains('Buy now').visibleToUser(true).exists()){
                        //             break
                        //         }
                        //         back()
                        //         sleep(3000)
                        //     }

                    }
                } else if (selector().textContains('Retry').visibleToUser(true).exists()) {
                    let retryBtn = selector().textContains("Retry").visibleToUser(true).findOne(1000)
                    if (retryBtn) {
                        //如果retry存在，点击
                        comm.clickObj(retryBtn)
                        sleep(5000)
                        retryBtn = selector().textContains("Retry").visibleToUser(true).findOne(1000)
                        if (retryBtn) {
                            //如果还存在，返回到buy now页面
                            for (let i = 0; i < 5; i++) {
                                if (selector().textContains('Buy now').visibleToUser(true).exists()) {
                                    break
                                }
                                back()
                                sleep(3000)
                            }

                        }
                    } else {
                        for (let i = 0; i < 5; i++) {
                            if (selector().textContains('Buy now').visibleToUser(true).exists()) {
                                break
                            }
                            back()
                            sleep(3000)
                        }
                    }
                } else if (selector().textContains('Verify to continue:').visibleToUser(true).exists()) {
                    //也不是checkout，也不是retry那就是验证码  Verify to continue:
                    imageCodeVerify_Buy()
                    continue
                } else {
                    // 直接返回buy now页面
                    for (let i = 0; i < 5; i++) {
                        if (selector().textContains('Buy now').visibleToUser(true).exists()) {
                            break
                        }
                        back()
                        sleep(3000)
                    }
                }

            }
            //按理说点完一次，应该还会存在，如果不存在，就判断是不是在checkout页面（在，说明进去了，不在说明可能有弹窗）
            //如果存在，说明
        } else {
            beenRem = selector().textContains("This item has been removed").visibleToUser(true).findOne(1000)
            if (beenRem) {
                return "商品被移除"
            }
            //没找到buy按钮，可能进入了验证码加载
            comm.showLogToFile("可能有验证码")
            sleep(15000)
            imageCodeVerify_Buy()
            sleep(10000)
            if (selector().textContains('Checkout').visibleToUser(true).exists()) {
                comm.showLogToFile("进入了支付页面")
                sleep(3000)
                comm.randomToAndFroSwipe(1)
                //支付页面也可能存在，没网络的框，判断银行卡界面有没有Payment method
                if (selector().textContains('Payment method').visibleToUser(true).exists()) {
                    // 有这个，说明真的进checkout页面了
                    break
                } else if (selector().textContains('Place order').visibleToUser(true).exists()) {
                    //否则，判断是不是卡了或者验证码
                    break
                    // }else{
                    //     //否则，判断是不是卡了或者验证码
                    //     for (let i = 0;i<5;i++){
                    //         if (selector().textContains('Buy now').visibleToUser(true).exists()){
                    //             break
                    //         }
                    //         back()
                    //         sleep(3000)
                    //     }

                }
            } else {
                if (j > 6) {
                    for (let i = 0; i < 5; i++) {
                        if (selector().textContains('Buy now').visibleToUser(true).exists()) {
                            break
                        }
                        back()
                        sleep(3000)
                    }
                }
            }
        }
        sleep(5000)
    }
    //
    sleep(2000)
    //判断一下buynow在不在
    for (let i = 0; i < 5; i++) {
        sleep(5000)
        let buyNow = selector().className('android.widget.Button').textContains('Buy now').findOne(1000)
        if (buyNow) {
            comm.showLogToFile("点击一下buynow")
            comm.clickObj(buyNow)
            sleep(5000)
            buyNow = selector().className('android.widget.Button').textContains('Buy now').findOne(1000)
            if (buyNow) {
                continue
            } else {
                break
            }
        }
    }
    sleep(8000)
    if (selector().textContains('Checkout').visibleToUser(true).exists()) {
        comm.showLogToFile("已经进入Check-out页面")
    } else {
        comm.showLogToFile("没有进入Check-out页面")
        return "没有进入Check-out页面"
    }
    return "中断"
    ////////////////////////////////////////////////////////支付页面///////////////////////////////////////////////////////////////
    //
    // msg = comm.httpToStringShellContinue(remoteServer+"/admin/api/orderPing?id="+task_id+"&ordertaskid="+taskInfo.ordertask_id+"&status=1&info=进入checkout页面")
    // if(msg  != '成功接收到通知'){
    //     return "系统断线，停止任务"
    // }
    // 检查地址
    // 检查卡号
    // 检查优惠金额
    // 检查支付价格
    let realname = taskInfo.realname.slice(0, 10)
    let card_number = taskInfo.card_number
    let discount = taskInfo.discount
    let max_amount = taskInfo.max_amount
    let ordertask_id = taskInfo.ordertask_id
    let email = taskInfo.email
    // comm.randomSwipeSlow(1)
    //
    let order_result = orderAction_my(task_id, "", realname, card_number, discount, max_amount, ordertask_id, email)
    if (order_result == "success") {
        comm.showLogToFile("下单成功,准备滑动和截图")
        comm.randomSwipeSlow(1)
        // 
        sleep(2000)
        for (let i = 0; i < 30; i++) {
            let order_details = selector().textContains('Order details').visibleToUser(true).findOne(1000)
            if (order_details) {
                break
            }
            sleep(2000)
        }
        if (orderFinishAction(task_id)) {
            comm.showLogToFile("滑动和截图成功")
            sleep(10000)
        } else {
            comm.showLogToFile("滑动和截图失败")
            // return "滑动和截图失败"
        }
    } else {
        comm.showLogToFile("下单失败:" + order_result)
        return order_result
    }
    sleep(5000)
    // 
    return "success"
}

//采购任务之 全托管品类
function orderTask_NoShop_test(taskInfo) {
    comm.showLog("采购任务[全托管]")
    // openTiktok(0)
    // comm.randomSwipe(3)
    // closeAllPop()
    // var msg = comm.httpToStringShellContinue(remoteServer+"/admin/api/orderPing?id="+task_id+"&ordertaskid="+taskInfo.ordertask_id+"&status=1&info=开始任务2")
    // if(msg  != '成功接收到通知'){
    //     return "系统断线，停止任务"
    // }
    //判断发送消息 0短视频 1关键字 2采购 3直接购买   2采购不发送消息
    // if (taskInfo.type != 2){
    //     let seller_id = taskInfo.seller_id
    //     let stxt = taskInfo.stxt
    //     setSellerText(stxt,seller_id)
    //     sleep(20000)
    //     if (selector().textContains('Verify to continue').visibleToUser(true).exists()){
    //         comm.showLog("有验证码")
    //         imageCodeVerify_Buy()
    //     }
    // }
    sleep(5000)
    let homeBtn = selector().textContains('Home').visibleToUser(true).findOne(1000)
    let profileBtn = selector().textContains('Profile').visibleToUser(true).findOne(1000)
    if (homeBtn && profileBtn) {
        comm.showLog("有首页")
    } else {
        back()
    }
    sleep(2000)


    // sleep(6000)
    //先判断是不是在首页
    let product_title = taskInfo.product_title //商品的名称
    let buy_link_title = taskInfo.buy_link_title //商品购买连接标题
    //判断有没有videoid，有videoid
    if (taskInfo.tk_video_id != '') {
        comm.showLog("有video_id")
        // sleep(2000)
        // // 
        // let isV=openVideoProduct(taskInfo.tk_video_id,title_txt)
        // if(!isV){
        //     comm.showLog('拉起视频失败')
        //     return "拉起视频失败"    
        // }else{
        //     comm.showLog('拉起视频成功')
        // }
        sleep(2000)
        //获取url，通过浏览器的方式打开链接
        openLinkFromBrowser(taskInfo.tk_video_id)
        comm.showLog("等待10秒确保网页打开")
        sleep(10000)
        //点击open app
        // for (let i=0;i<5;i++){
        //     if (i == 5){
        //         return "没成功进首页"
        //     }
        //     //
        //     openLinkFromBrowser(taskInfo.tk_video_id)
        //     comm.showLog("等待10秒确保网页打开")
        //     sleep(10000)
        //     //
        //     let reClickJoin = clickBtnJoinTk()
        //     if (reClickJoin == "success"){
        //         break
        //     }
        // }
        //
        for (let i = 0; i < 20; i++) {
            let openBtn = selector().textContains('Not now').visibleToUser(true).findOne(1000)
            if (!openBtn) {
                openBtn = selector().textContains('以后再说').visibleToUser(true).findOne(1000)
            }
            if (openBtn) {
                comm.clickObj(openBtn)
            } else {
                openBtn = selector().textContains('Open TikTok').visibleToUser(true).findOne(1000)
                if (!openBtn) {
                    openBtn = selector().textContains('Open app').visibleToUser(true).findOne(1000)
                    if (!openBtn) {
                        comm.showLog("没有Open-app" + i)
                        openBtn = selector().textContains('Watch on TikTok').visibleToUser(true).findOne(1000)
                    }
                }
                if (openBtn) {
                    comm.clickObj(openBtn)
                }
            }
            //
            comm.showLog("判断有没有验证码")
            imageCodeVerify_Buy()
            comm.showLog("验证码结束")
            //
            let reloadBtn = selector().textContains('Reload').visibleToUser(true).findOne(1000)
            if (reloadBtn) {
                if (i == 5 || i == 12) {
                    comm.pullDownRefresh(1)
                    // }else if(i == 8){
                    //     comm.showLog("执行代理")
                    //     let randomStr = generateRandomString(6)
                    //     comm.showLog("执行切换代理")
                    //     httpShell("dg config -a proxy.enabled=false; sleep 2; settings put global package_verifier_enable 0; dg apt install plugin:proxy; dg config -a proxy.enabled=true -a proxy.udp=true -a proxy.dnsType=tcp -a proxy.dns=8.8.8.8 -a proxy.dns2=1.1.1.1 -a proxy.protocol=socks5 -a proxy.host=gate2.ipweb.cc -a proxy.port=7778 -a proxy.user=B_34942_US___5_FH"+randomStr+"tjt -a proxy.pass=191df999")
                    //     sleep(10000)
                } else {
                    //
                    comm.clickObj(reloadBtn)
                }
            }
            //
            let homeBtn = selector().textContains('Home').visibleToUser(true).findOne(1000)
            let profileBtn = selector().textContains('Profile').visibleToUser(true).findOne(1000)
            if (homeBtn && profileBtn) {
                comm.showLog("有首页")
                break
            }
            //
            let VerifyContinue = selector().textContains('Verify to continue:').visibleToUser(true).findOne(1000)
            if (VerifyContinue) {
                comm.showLog("有验证码")
                break
            }
            sleep(5000)
        }
        //
        for (let i = 0; i < 5; i++) {
            let productNotAvailable = selector().textContains('in your country or region').visibleToUser(true).findOne(1000)
            if (productNotAvailable) {
                return "该产品在该国家或地区不可用"
            }
            sleep(1000)
        }
        //默认已经进入首页，检测是否真的在首页
        let homeBtn = selector().textContains('Home').visibleToUser(true).findOne(1000)
        let profileBtn = selector().textContains('Profile').visibleToUser(true).findOne(1000)
        if (homeBtn && profileBtn) {
            comm.showLog("有首页")
        } else {
            //
            comm.showLog("没进首页，有可能有验证码，验证一下")
            imageCodeVerify_Buy()
            comm.showLog("验证码结束")
            let VerifyContinue = selector().textContains('Verify to continue:').visibleToUser(true).findOne(1000)
            if (VerifyContinue) {
                return "验证码不通过"
            }
            //
            comm.showLog("点击一下屏幕中心")
            click(device.width / 2, device.height / 2)
        }
        sleep(2000)
        homeBtn = selector().textContains('Home').visibleToUser(true).findOne(1000)
        profileBtn = selector().textContains('Profile').visibleToUser(true).findOne(1000)
        if (homeBtn && profileBtn) {
            comm.showLog("有首页")
        } else {
            return "没成功进首页"
        }
        // msg = comm.httpToStringShellContinue(remoteServer+"/admin/api/orderPing?id="+task_id+"&ordertaskid="+taskInfo.ordertask_id+"&status=1&info=成功跳转进tk")
        // if(msg  != '成功接收到通知'){
        //     return "系统断线，停止任务"
        // }
        sleep(5000)
        // 点击短视频-商品的入口，通过商品标题的前15个字符匹配
        let pronBtn = selector().textContains(product_title.slice(0, 15)).visibleToUser(true).findOne(1000)
        if (pronBtn) {
            comm.showLog("找到商品链接按钮")
            comm.clickObj(pronBtn)
        } else {
            comm.showLog("没有找到商品链接按钮")
            return "没有找到商品链接按钮"
        }
        sleep(10000)
        //找到并点击商品按钮
        if (findTheProductLinkBtn(product_title, buy_link_title)) {
            sleep(5000)
            let eligibility = selector().textContains('you must meet the eligibility').visibleToUser(true).findOne(1000)
            if (eligibility) {
                back()
                sleep(2000)
                if (!findTheProductLinkBtn(product_title, buy_link_title)) {
                    comm.showLog("没有找到商品链接按钮")
                    return "没有找到商品链接按钮"
                }
            }
        } else {
            comm.showLog("没有找到商品链接按钮")
            return "没有找到商品链接按钮"
        }
        sleep(20000)
        // 判断有没有滑块验证码
        comm.showLog("判断有没有滑块验证码")
        // imageCodeVerify_my()
        imageCodeVerify_Buy()
        comm.showLog("验证码结束")
        let VerifyContinue = selector().textContains('Verify to continue:').visibleToUser(true).findOne(1000)
        if (VerifyContinue) {
            return "验证码不通过"
        }

    } else {
        comm.showLog("没video_id")
        sleep(2000)
        comm.randomSwipeSlow(1);
        sleep(2000)
        // 重试一下
        let contTag = false
        for (let i = 0; i < 2; i++) {
            let shopBtns = selector().text('Shop').visibleToUser(true).find()
            if (shopBtns) {
                comm.showLog("找到顶部shop按钮" + shopBtns.length)
                if (shopBtns.length == 1) {
                    if (shopBtns[0].bounds().centerY() < 300) {
                        comm.randomSwipeSlow(1)
                        comm.clickObj(shopBtns[0])
                        contTag = true
                        break
                    }
                } else if (shopBtns.length > 1) {
                    for (let j = 0; j < shopBtns.length; j++) {
                        if (shopBtns[j].bounds().centerY() < 300) {
                            comm.randomSwipeSlow(1)
                            comm.clickObj(shopBtns[j])
                            contTag = true
                            break
                        }
                        sleep(3000)
                    }
                } else {
                    //kill掉tk，并启动
                    httpShell('am force-stop com.zhiliaoapp.musically')
                    if (!app.launch('com.zhiliaoapp.musically')) {
                        console.log('App 启动失败')
                        return "tk启动失败"
                    }
                    sleep(10000);
                }
            } else {
                comm.showLog("找不到找到顶部shop按钮")
                //kill掉tk，并启动
                httpShell('am force-stop com.zhiliaoapp.musically')
                if (!app.launch('com.zhiliaoapp.musically')) {
                    console.log('App 启动失败')
                    return "tk启动失败"
                }
                sleep(10000);
            }
            if (contTag) {
                break
            }
        }
        sleep(5000)
        closeAllPop()
        comm.randomSwipeSlow(1)
        //等待网络加载
        for (let i = 0; i < 20; i++) {
            if (i == 19) {
                // msg = comm.httpToStringShellContinue(remoteServer+"/admin/api/orderPing?id="+task_id+"&ordertaskid="+taskInfo.ordertask_id+"&status=1&info=shop页面没有Seach")
                // if(msg  != '成功接收到通知'){
                //     return "系统断线，停止任务"
                // }
            }
            sleep(10000)
            if (selector().textContains('Search').visibleToUser(true).exists()) {
                break
            }
            let tryAgain = selector().textContains('try agin').visibleToUser(true).findOne(1000)
            if (tryAgain) {
                comm.clickObj(tryAgain)
            } else {
                comm.pullDownRefresh(1)

            }
        }
        //获取url，通过浏览器的方式打开链接
        // openLinkFromBrowser(taskInfo.url)
        sleep(5000)

        // //可能直接打开商品的半框、可能直接打开那个搜索框
        // if(selector().textContains('buy now').visibleToUser(true).exists()){

        // }
        for (let i = 0; i < 10; i++) {
            if (i == 9) {
                return "进入商品页面失败"
            }
            sleep(5000)
            comm.pullDownRefresh(1)
            sleep(5000)
            if (i == 0 || i == 8) {
                openProduct(taskInfo.product_no, taskInfo.seller_id)
                comm.showLog("执行了openProduct！！！！！")
                // msg = comm.httpToStringShellContinue(remoteServer+"/admin/api/orderPing?id="+task_id+"&ordertaskid="+taskInfo.ordertask_id+"&status=1&info=执行了openProduct")
                // if(msg  != '成功接收到通知'){
                //     return "系统断线，停止任务"
                // }
                sleep(5000)
            }
            sleep(8000)
            //看看会不会出现没网络try again的字样 
            let contTag = false
            for (let j = 0; j < 15; j++) {
                if (j == 14) {
                    sleep(5000)
                    let homeBtn = selector().textContains('Home').visibleToUser(true).findOne(1000)
                    let profileBtn = selector().textContains('Profile').visibleToUser(true).findOne(1000)
                    if (homeBtn && profileBtn) {
                        comm.showLog("有首页")
                    } else {
                        back()
                    }
                    contTag = true
                    break
                }
                if (selector().textContains('Add to cart').visibleToUser(true).exists()) {
                    comm.showLog("有Add to cart")
                    comm.randomSwipe(1)
                    break
                } else if (selector().textContains('try again').visibleToUser(true).exists()) {
                    for (let i = 0; i < 5; i++) {
                        if (selector().textContains('Shop').visibleToUser(true).exists()) {
                            comm.showLog("回到shop页面")
                            break
                        } else {
                            comm.showLog("没有回到shop页面")
                        }
                        back()
                        sleep(3000)
                    }
                } else if (selector().textContains('Verify to continue').visibleToUser(true).exists()) {
                    comm.showLog("有验证码")
                    imageCodeVerify_Buy()
                    sleep(5000)
                    //
                } else {
                    comm.showLog("没有验证码、没有try again" + j)
                    if (selector().textContains('Add to cart').visibleToUser(true).exists()) {
                        break
                    }
                    let selectObjs = selector().textContains(product_title.slice(0, 15)).visibleToUser(true).find()
                    if (selectObjs.length == 0) {
                        comm.showLog("没有匹配项" + j)
                    } else {
                        // comm.clickObj(selectObjs[0])
                        break
                    }
                }
                sleep(5000)
            }
            if (contTag) {
                continue
            }
            // 判断商品匹配项
            contTag = false
            for (let j = 0; j < 15; j++) {
                if (j == 14) {
                    // msg = comm.httpToStringShellContinue(remoteServer+"/admin/api/orderPing?id="+task_id+"&ordertaskid="+taskInfo.ordertask_id+"&status=1&info=商品没有匹配项(重试"+i+")")
                    // if(msg  != '成功接收到通知'){
                    //     return "系统断线，停止任务"
                    // }
                    comm.showLog("商品没有匹配项")
                    for (let i = 0; i < 5; i++) {
                        if (selector().textContains('Shop').visibleToUser(true).exists()) {
                            break
                        }
                        back()
                        sleep(3000)
                    }
                    contTag = true
                    break
                }
                //
                let selectObjs = selector().textContains(product_title.slice(0, 20)).visibleToUser(true).find()
                if (selectObjs.length == 0) {
                    comm.showLog("没有匹配项" + j)
                    comm.randomSwipeSlow(1)
                } else if (selectObjs.length == 1) {
                    comm.showLog("有一个匹配项" + j)
                    comm.clickObj(selectObjs[0])
                    sleep(5000)
                    break
                } else if (selectObjs.length > 1) {
                    comm.showLog("有多个匹配项" + j)
                    let isFond = false
                    //可能会存在点到店铺的那个按钮,店铺名称也是同名
                    for (let i = 0; i < selectObjs.length; i++) {
                        if (selectObjs[i].text().includes("Sold by")) {
                            continue
                        } else {
                            comm.clickObj(selectObjs[i])
                            sleep(5000)
                            isFond = true
                            break
                        }
                    }
                    if (!isFond) {
                        comm.clickObj(selectObjs[1])
                        sleep(5000)
                        break
                    } else {
                        break
                    }
                }
                sleep(5000)
            }
            if (contTag) {
                continue
            }
            //判断是否进入商品页面
            contTag = false
            for (let j = 0; j < 15; j++) {
                if (j == 14) {
                    // msg = comm.httpToStringShellContinue(remoteServer+"/admin/api/orderPing?id="+task_id+"&ordertaskid="+taskInfo.ordertask_id+"&status=1&info=没有进入商品页面(重试"+i+")")
                    // if(msg  != '成功接收到通知'){
                    //     return "系统断线，停止任务"
                    // }
                    comm.showLog("没有进入商品页面")
                    for (let i = 0; i < 5; i++) {
                        if (selector().textContains('Shop').visibleToUser(true).exists()) {
                            break
                        }
                        back()
                        sleep(3000)
                    }
                    contTag = true
                    break
                }
                let addToCart = selector().textContains('Add to cart').visibleToUser(true).findOne(1000)
                if (addToCart) {
                    break
                }
                let VerifyContinue = selector().textContains('Verify to continue:').visibleToUser(true).findOne(1000)
                if (VerifyContinue) {
                    comm.showLog("有验证码")
                    imageCodeVerify_Buy()
                    sleep(5000)
                }
                sleep(5000)
            }
            if (contTag) {
                continue
            } else {
                //如果到这里都还是false，那就中断，说明成功了
                break
            }
            //
        }

        //
        comm.showLog("成功进入商品页面")
        //
    }
    ////////////////////////////////////////////////////////选商品页面///////////////////////////////////////////////////////////////
    //现象出现点进去了别商品（奇怪）
    //到这里为止，已经进入商品详情了
    sleep(10000)
    comm.randomSwipeSlow(2)
    sleep(10000)
    imageCodeVerify_Buy()
    sleep(2000)
    // 判断商品标题对不对
    let title_list = selector().textContains(product_title.slice(0, 20)).visibleToUser(true).findOne(1000)
    if (title_list) {
        comm.showLog("匹配到这个标题")
        sleep(1000)
        // comm.clickObj(title_list)
        // title_list=selector().textContains(product_title).visibleToUser(true).findOne(1000)
        // if (title_list){
        //     comm.showLog("完全匹配到这个标题")
        // }
    } else {
        sleep(2000)
        comm.randomSwipeSlow(1)
        title_list = selector().textContains(product_title.slice(0, 20)).visibleToUser(true).findOne(1000)
        if (title_list) {
            comm.showLog("匹配到这个标题")
            sleep(1000)
        } else {
            return "可能没找到标题"
        }
    }
    //判断一下是不是商品被移除
    let beenRem = selector().textContains("This item has been removed").visibleToUser(true).findOne(1000)
    if (beenRem) {
        // msg = comm.httpToStringShellContinue(remoteServer+"/admin/api/orderPing?id="+task_id+"&ordertaskid="+taskInfo.ordertask_id+"&status=1&info=商品被移除（This item has been removed）")
        // if(msg  != '成功接收到通知'){
        //     return "系统断线，停止任务"
        // }
        return "商品被移除"
    }
    //判断购买
    if (taskInfo.enter_method == 0) {
        comm.showLog("直接购买")
    } else {
        comm.showLog("进入商家主页进行购买（目前没有）")
    }
    // msg = comm.httpToStringShellContinue(remoteServer+"/admin/api/orderPing?id="+task_id+"&ordertaskid="+taskInfo.ordertask_id+"&status=1&info=找Buy now按钮")
    // if(msg  != '成功接收到通知'){
    //     return "系统断线，停止任务"
    // }
    sleep(3000)
    comm.randomSwipeSlow(2)
    sleep(10000)
    imageCodeVerify_Buy()

    //判断一下有没有库存
    beenRem = selector().textContains("This item has been removed").visibleToUser(true).findOne(1000)
    if (beenRem) {
        // msg = comm.httpToStringShellContinue(remoteServer+"/admin/api/orderPing?id="+task_id+"&ordertaskid="+taskInfo.ordertask_id+"&status=1&info=商品被移除（This item has been removed）")
        // if(msg  != '成功接收到通知'){
        //     return "系统断线，停止任务"
        // }
        return "商品被移除"
    }
    //点一下Add to cart，不知道有没有sku的选择
    //
    for (let j = 0; j < 10; j++) {
        if (j == 9) {
            return "没找到Add to cart按钮"
        }
        let buyNow = selector().className('android.widget.Button').textContains('Add to cart').findOne(1000)
        if (buyNow) {
            comm.showLog("Add to cart按钮存在，点一下")
            comm.clickObj(buyNow)
            sleep(10000)
            imageCodeVerify_Buy()
            //
            buyNow = selector().className('android.widget.Button').textContains('Add to cart').findOne(1000)
            if (buyNow) {
                comm.clickObj(buyNow)
                //如果还存在，就去选择sku
                sleep(5000)
                //来回滑动一下
                comm.randomToAndFroSwipe()
                //可能会出现选择验证码
                sleep(20000)
                // 判断有没有滑块验证码
                comm.showLog("判断有没有滑块验证码")
                // imageCodeVerify_my()
                imageCodeVerify_Buy()
                comm.showLog("验证码结束")
                let contTag = false
                for (let i = 0; i < 5; i++) {
                    buyNow = selector().className('android.widget.Button').textContains('Add to cart').findOne(1000)
                    if (buyNow) {
                        comm.showLog("开始选择sku")
                        // if(doSku(taskInfo.sku_name)){
                        if (doSku_v2(taskInfo.sku_name)) {
                            comm.showLog("sku选择成功")
                            contTag = true
                            break
                        } else {
                            comm.showLog("sku选择失败")
                            return "sku选择失败"
                        }
                    } else {
                        let gotucard = selector().className('android.widget.Button').textContains('Go to cart').findOne(1000)
                        if (gotucard) {
                            comm.showLog("出现go to cart")
                            contTag = true
                        }
                    }
                    sleep(5000)
                }
                if (contTag) {
                    break
                } else {
                    continue
                }
            }
        } else {
            beenRem = selector().textContains("This item has been removed").visibleToUser(true).findOne(1000)
            if (beenRem) {
                // msg = comm.httpToStringShellContinue(remoteServer+"/admin/api/orderPing?id="+task_id+"&ordertaskid="+taskInfo.ordertask_id+"&status=1&info=商品被移除（This item has been removed）")
                // if(msg  != '成功接收到通知'){
                //     return "系统断线，停止任务"
                // }
                return "商品被移除"
            }
            //没找到buy按钮，可能进入了验证码加载
            comm.showLog("可能有验证码")
            sleep(15000)
            imageCodeVerify_Buy()
            sleep(10000)
            if (selector().textContains('Shipped by TikTok').visibleToUser(true).exists()) {
                comm.showLog("进入了购物车页面页面")
                sleep(3000)
                comm.randomToAndFroSwipe(1)
                break
            } else {
                if (j > 6) {
                    for (let i = 0; i < 5; i++) {
                        if (selector().textContains('Add to cart').visibleToUser(true).exists()) {
                            break
                        }
                        back()
                        sleep(3000)
                    }
                }
            }
        }
        sleep(5000)
    }

    //
    sleep(3000)
    //判断一下购物车的checkout页面，并点击
    for (let i = 0; i < 8; i++) {
        comm.showLog("判断一下购物车的checkout页面循环中：" + i)
        if (i == 7) {
            // msg = comm.httpToStringShellContinue(remoteServer+"/admin/api/orderPing?id="+task_id+"&ordertaskid="+taskInfo.ordertask_id+"&status=1&info=没成功进入checkout页")
            // if(msg  != '成功接收到通知'){
            //     return "系统断线，停止任务"
            // }
            comm.showLog("没成功进入Check-out页")
            return "没成功进入Check-out页"
        }
        //判断一下添加购物车
        sleep(5000)
        let addToCart = selector().textContains('Add to cart').visibleToUser(true).findOne(1000)
        if (addToCart) {
            comm.showLog("点击一下Add-to-cart")
            comm.clickObj(addToCart)
            sleep(10000)
            continue
        }
        let goToCart = selector().textContains('Go to cart').visibleToUser(true).findOne(1000)
        if (goToCart) {
            comm.showLog("点击一下Go-to-cart")
            comm.clickObj(goToCart)
            sleep(10000)
            continue
        }
        let continueToCheckoutBtn = selector().textContains('Continue to checkout').visibleToUser(true).findOne(1000)
        if (continueToCheckoutBtn) {
            comm.showLog("点击一下Continue-to-checkout")
            comm.clickObj(continueToCheckoutBtn)
            sleep(10000)
            continue
        }
        if (selector().textContains('Shipping address').visibleToUser(true).exists()) {
            comm.showLog("已经进入了Check-out页面(判断Shipping-address)")
            break
        }
        // if (selector().textContains('Shipped by TikTok').visibleToUser(true).exists()){
        //     //
        //     let checkoutBtn=selector().textContains('Checkout').find()
        //     if (checkoutBtn){
        //         //判断一下是不是在画面底部（checkout按钮）
        //         if (checkoutBtn.length == 1){
        //             if (checkoutBtn.bounds().centerY() > device.height-500){
        //                 comm.showLog("点击一下Check-out")
        //                 comm.clickObj(checkoutBtn[0])
        //                 break
        //             }
        //         }else if (checkoutBtn.length > 1){
        //             for (let j = 0;j<checkoutBtn.length;j++){
        //                 comm.showLog("点击一下Chec-kout")
        //                 comm.clickObj(checkoutBtn[j])
        //                 break
        //             }
        //         }
        //     }
        // }
        sleep(5000)
    }
    //
    sleep(8000)
    if (selector().textContains('Shipping address').visibleToUser(true).exists()) {
        comm.showLog("已经进入Check-out页面(判断Shipping-address)")
    } else {
        comm.showLog("没有进入Check-out页面（判断Shipping-address）")
        return "没有进入Check-out页面"
    }
    return "中断"
    ////////////////////////////////////////////////////////支付页面///////////////////////////////////////////////////////////////
    //
    msg = comm.httpToStringShellContinue(remoteServer + "/admin/api/orderPing?id=" + task_id + "&ordertaskid=" + taskInfo.ordertask_id + "&status=1&info=进入checkout页面")
    if (msg != '成功接收到通知') {
        return "系统断线，停止任务"
    }
    // 检查地址
    // 检查卡号
    // 检查优惠金额
    // 检查支付价格
    let realname = taskInfo.realname.slice(0, 10)
    let card_number = taskInfo.card_number
    let discount = taskInfo.discount
    let max_amount = taskInfo.max_amount
    let ordertask_id = taskInfo.ordertask_id
    let email = taskInfo.email
    // comm.randomSwipeSlow(1)
    //
    let order_result = orderAction_my(task_id, "", realname, card_number, discount, max_amount, ordertask_id, email)
    if (order_result == "success") {
        comm.showLog("下单成功,准备滑动和截图")
        comm.randomSwipeSlow(1)
        // 
        sleep(2000)
        for (let i = 0; i < 30; i++) {
            let order_details = selector().textContains('Order details').visibleToUser(true).findOne(1000)
            if (order_details) {
                break
            }
            sleep(2000)
        }
        if (orderFinishAction(task_id)) {
            comm.showLog("滑动和截图成功")
            sleep(10000)
        } else {
            comm.showLog("滑动和截图失败")
            // return "滑动和截图失败"
        }
    } else {
        comm.showLog("下单失败:" + order_result)
        return order_result
    }
    sleep(5000)
    // 
    return "success"
}

//采购任务
function orderTask(taskInfo) {
    comm.showLogToFile("采购任务")
    //
    sleep(3000)
    let openTKMsg = openTiktok_v2() //打开tk
    comm.showLogToFile("openTiktok返回：" + openTKMsg)
    if (openTKMsg == 'success') {
        comm.showLogToFile("openTiktok执行成功")
    } else {
        return openTKMsg
    }
    //
    comm.randomSwipe(3)
    sleep(8000)
    // openTiktok(0)
    // comm.randomSwipe(3)
    // closeAllPop()
    var msg = comm.httpToStringShellContinue(remoteServer + "/admin/api/orderPing?id=" + task_id + "&ordertaskid=" + taskInfo.ordertask_id + "&ordersid=" + orders_id + "&status=1&info=开始任务2")
    if (msg != '成功接收到通知') {
        return "系统断线，停止任务"
    }
    //判断发送消息 0短视频 1关键字 2采购 3直接购买   2采购不发送消息
    if (taskInfo.type != 2) {
        let seller_id = taskInfo.seller_id
        let stxt = taskInfo.stxt
        setSellerText(stxt, seller_id)
        sleep(20000)
        if (selector().textContains('Verify to continue').visibleToUser(true).exists()) {
            comm.showLogToFile("有验证码")
            imageCodeVerify_Buy()
        }
    }
    sleep(5000)
    //先判断是不是在首页
    let homeBtn = selector().textContains('Home').visibleToUser(true).findOne(1000)
    let profileBtn = selector().textContains('Profile').visibleToUser(true).findOne(1000)
    if (homeBtn && profileBtn) {
        comm.showLogToFile("有首页")
    } else {
        back()
    }
    sleep(5000)

    // sleep(6000)
    let product_title = taskInfo.product_title //商品的名称
    let buy_link_title = taskInfo.buy_link_title //商品购买连接标题
    let showcase_url = taskInfo.showcase_url //达人橱窗链接
    //判断是否有橱窗链接
    if (showcase_url != '' && orderShowcase(taskInfo)) {
        //空着，啥也不用写
    } else {
        // 如果url等于空或者 在不等于空的情况下，执行橱窗下单 失败了
        comm.showLog("执行普通下单")
        //
        //判断有没有videoid，有videoid
        if (taskInfo.tk_video_id != '') {
            comm.showLogToFile("有video_id")
            // sleep(2000)
            // // 
            // let isV=openVideoProduct(taskInfo.tk_video_id,title_txt)
            // if(!isV){
            //     comm.showLog('拉起视频失败')
            //     return "拉起视频失败"    
            // }else{
            //     comm.showLog('拉起视频成功')
            // }
            sleep(2000)
            //获取url，通过浏览器的方式打开链接
            openLinkFromBrowser(taskInfo.tk_video_id)
            comm.showLogToFile("等待10秒确保网页打开")
            sleep(10000)
            //点击open app
            // for (let i=0;i<5;i++){
            //     if (i == 5){
            //         return "没成功进首页"
            //     }
            //     //
            //     openLinkFromBrowser(taskInfo.tk_video_id)
            //     comm.showLog("等待10秒确保网页打开")
            //     sleep(10000)
            //     //
            //     let reClickJoin = clickBtnJoinTk()
            //     if (reClickJoin == "success"){
            //         break
            //     }
            // }
            //
            for (let i = 0; i < 10; i++) {
                if (i == 9) {
                    comm.showLogToFile("从网页打开失败")
                    return "从网页打开失败"
                }
                //现在有个Open TikTok之后的not now会导致打开失败
                // let openBtn = selector().textContains('Not now').visibleToUser(true).findOne(1000)
                // if (!openBtn) {
                //     openBtn = selector().textContains('以后再说').visibleToUser(true).findOne(1000)
                // }
                // if (openBtn) {
                //     comm.clickObj(openBtn)
                // } else {
                //     openBtn = selector().textContains('Open TikTok').visibleToUser(true).findOne(1000)
                //     if (!openBtn) {
                //         openBtn = selector().textContains('Open app').visibleToUser(true).findOne(1000)
                //         if (!openBtn) {
                //             comm.showLogToFile("没有Open-app" + i)
                //             openBtn = selector().textContains('Watch on TikTok').visibleToUser(true).findOne(1000)
                //             if (!openBtn) {
                //                 openBtn = selector().textContains('Continue').className("android.widget.Button").visibleToUser(true).findOne(1000)
                //                 if (!openBtn) {
                //                     openBtn = selector().text('Continue').visibleToUser(true).findOne(1000)
                //                 }
                //             }
                //         }
                //     }
                //     if (openBtn) {
                //         comm.clickObj(openBtn)
                //     }
                // }
                //暂时这应改
                let openBtn = selector().textContains('Open TikTok').visibleToUser(true).findOne(1000)
                if (!openBtn) {
                    openBtn = selector().textContains('Open app').visibleToUser(true).findOne(1000)
                    if (!openBtn) {
                        comm.showLogToFile("没有Open-app" + i)
                        openBtn = selector().textContains('Watch on TikTok').visibleToUser(true).findOne(1000)
                        if (!openBtn) {
                            openBtn = selector().textContains('Continue').className("android.widget.Button").visibleToUser(true).findOne(1000)
                            if (!openBtn) {
                                openBtn = selector().text('Continue').visibleToUser(true).findOne(1000)
                            }
                        }
                    }
                }
                if (openBtn) {
                    comm.clickObj(openBtn)
                }
                //
                comm.showLogToFile("判断有没有验证码")
                // 可能会出现验证码。遇到了变速验证码。判断一下Refresh这个文字刷新是否存在，存在就走常规验证码，不存在但是存在Drag the puzzle piece into place 就走变速验证码
                let verify1 = selector().textContains('erify to continue').visibleToUser(true).exists()
                let verify2 = selector().textContains('Refresh').visibleToUser(true).exists()
                let verify3 = selector().textContains('rag the puzzle piece into place').visibleToUser(true).exists()
                if (verify1 || verify2 || verify3) {
                    let verifyMsg = ""
                    //说明有验证码
                    if (verify2) {
                        comm.showLogToFile("常规滑块验证码")
                        verifyMsg = imageCodeVerify_Buy()
                    } else {
                        comm.showLog("变化速率的滑块验证码")
                        verifyMsg = sliderVerificationCode()
                    }
                    comm.showLog("验证码部分返回：" + verifyMsg)
                }
                comm.showLogToFile("验证码结束")
                // closeAllPop()
                //
                let reloadBtn = selector().textContains('Reload').visibleToUser(true).findOne(1000)
                if (reloadBtn) {
                    if (i == 5 || i == 12) {
                        comm.pullDownRefresh(1)
                        // }else if(i == 8){
                        //     comm.showLog("执行代理")
                        //     let randomStr = generateRandomString(6)
                        //     comm.showLog("执行切换代理")
                        //     httpShell("dg config -a proxy.enabled=false; sleep 2; settings put global package_verifier_enable 0; dg apt install plugin:proxy; dg config -a proxy.enabled=true -a proxy.udp=true -a proxy.dnsType=tcp -a proxy.dns=8.8.8.8 -a proxy.dns2=1.1.1.1 -a proxy.protocol=socks5 -a proxy.host=gate2.ipweb.cc -a proxy.port=7778 -a proxy.user=B_34942_US___5_FH"+randomStr+"tjt -a proxy.pass=191df999")
                        //     sleep(10000)
                    } else {
                        //
                        comm.clickObj(reloadBtn)
                    }
                }
                //
                let homeBtn = selector().textContains('Home').visibleToUser(true).findOne(1000)
                let profileBtn = selector().textContains('Profile').visibleToUser(true).findOne(1000)
                if (homeBtn && profileBtn) {
                    comm.showLogToFile("有首页")
                    break
                } else {
                    closeAllPop()
                }
                //
                let VerifyContinue = selector().textContains('Verify to continue:').visibleToUser(true).findOne(1000)
                if (VerifyContinue) {
                    comm.showLogToFile("有验证码")
                    break
                }
                sleep(5000)
            }
            //
            for (let i = 0; i < 5; i++) {
                let productNotAvailable = selector().textContains('in your country or region').visibleToUser(true).findOne(1000)
                if (productNotAvailable) {
                    return "该产品在该国家或地区不可用"
                }
                sleep(1000)
            }
            //默认已经进入首页，检测是否真的在首页
            let homeBtn = selector().textContains('Home').visibleToUser(true).findOne(1000)
            let profileBtn = selector().textContains('Profile').visibleToUser(true).findOne(1000)
            if (homeBtn && profileBtn) {
                comm.showLogToFile("有首页")
            } else {
                //
                comm.showLogToFile("没进首页，有可能有验证码，验证一下")
                imageCodeVerify_Buy()
                comm.showLogToFile("验证码结束")
                let VerifyContinue = selector().textContains('Verify to continue:').visibleToUser(true).findOne(1000)
                if (VerifyContinue) {
                    return "验证码不通过"
                }
                //
                comm.showLogToFile("点击一下屏幕中心")
                click(device.width / 2, device.height / 2)
            }
            sleep(2000)
            homeBtn = selector().textContains('Home').visibleToUser(true).findOne(1000)
            profileBtn = selector().textContains('Profile').visibleToUser(true).findOne(1000)
            if (homeBtn && profileBtn) {
                comm.showLogToFile("有首页")
            } else {
                return "没成功进首页"
            }
            msg = comm.httpToStringShellContinue(remoteServer + "/admin/api/orderPing?id=" + task_id + "&ordertaskid=" + taskInfo.ordertask_id + "&ordersid=" + orders_id + "&status=1&info=成功跳转进tk")
            if (msg != '成功接收到通知') {
                return "系统断线，停止任务"
            }
            // 点击短视频-商品的入口，通过商品标题的前15个字符匹配
            // let pronBtn = selector().textContains(product_title.slice(0, 15)).visibleToUser(true).findOne(1000)
            // if(pronBtn){
            //     comm.showLog("找到商品链接按钮")
            //     comm.clickObj(pronBtn)
            // }else{
            //     comm.showLog("没有找到商品链接按钮")
            //     return "没有找到商品链接按钮"
            // }
            sleep(10000)

            for (let i = 0; i < 2; i++) {
                //找到并点击商品按钮
                if (findTheProductLinkBtn(product_title, buy_link_title)) {
                    sleep(5000)
                    let eligibility = selector().textContains('you must meet the eligibility').visibleToUser(true).findOne(1000)
                    if (eligibility) {
                        back()
                        sleep(2000)
                        if (!findTheProductLinkBtn(product_title, buy_link_title)) {
                            comm.showLogToFile("没有找到商品链接按钮")
                        }
                    }
                } else {
                    comm.showLogToFile("没有找到商品链接按钮")
                }
                sleep(20000)
                comm.showLogToFile("判断有没有滑块验证码")
                let verify1 = selector().textContains('erify to continue').visibleToUser(true).exists()
                let verify2 = selector().textContains('Refresh').visibleToUser(true).exists()
                let verify3 = selector().textContains('n unexpected error').visibleToUser(true).exists()
                if (verify1 && verify2) {
                    if (verify3) {
                        //返回两次，切换代理
                        httpShell('curl "http://120.236.196.248:9004/api/randProxy2?bd_client_no=' + bd_client_no + '&country_code=US"')
                        sleep(5000)
                        back()
                        sleep(5000)
                        back()
                        sleep(5000)
                    } else {
                        // imageCodeVerify_my()
                        imageCodeVerify_Buy()
                        comm.showLogToFile("验证码结束")
                        break
                    }
                } else {
                    break
                }
                //
            }
            //
            sleep(5000)
            // 判断有没有滑块验证码
            let VerifyContinue = selector().textContains('Verify to continue:').visibleToUser(true).findOne(1000)
            if (VerifyContinue) {
                return "验证码不通过"
            }

        } else {
            comm.showLogToFile("没video_id")
            sleep(2000)
            comm.randomSwipe(2);
            sleep(2000)
            // 重试一下
            let contTag = false
            for (let i = 0; i < 2; i++) {
                let shopBtns = selector().text('Shop').visibleToUser(true).find()
                if (shopBtns) {
                    comm.showLogToFile("找到顶部shop按钮" + shopBtns.length)
                    if (shopBtns.length == 1) {
                        //找shop，只有一个就点一个
                        if (shopBtns[0].bounds().centerY() < 300) {
                            comm.randomSwipeSlow(1)
                            comm.clickObj(shopBtns[0])
                            contTag = true
                            break
                        }
                    } else if (shopBtns.length > 1) {
                        //找shop，有多个就找靠近顶部的
                        for (let j = 0; j < shopBtns.length; j++) {
                            if (shopBtns[j].bounds().centerY() < 300) {
                                comm.randomSwipeSlow(1)
                                comm.clickObj(shopBtns[j])
                                contTag = true
                                break
                            }
                            //找靠近底部的
                            if (shopBtns[j].bounds().centerY() > device.height - 300) {
                                comm.randomSwipeSlow(1)
                                comm.clickObj(shopBtns[j])
                                contTag = true
                                break
                            }
                            sleep(3000)
                        }

                    } else {
                        //kill掉tk，并启动
                        httpShell('am force-stop com.zhiliaoapp.musically')
                        if (!app.launch('com.zhiliaoapp.musically')) {
                            console.log('App 启动失败')
                            return "tk启动失败"
                        }
                        sleep(10000);
                    }
                } else {
                    comm.showLogToFile("找不到找到顶部shop按钮")
                    //kill掉tk，并启动
                    httpShell('am force-stop com.zhiliaoapp.musically')
                    if (!app.launch('com.zhiliaoapp.musically')) {
                        console.log('App 启动失败')
                        return "tk启动失败"
                    }
                    sleep(10000);
                }
                if (contTag) {
                    break
                }
            }
            sleep(5000)
            closeAllPop()
            comm.randomSwipeSlow(1)
            //等待网络加载
            for (let i = 0; i < 20; i++) {
                if (i == 19) {
                    msg = comm.httpToStringShellContinue(remoteServer + "/admin/api/orderPing?id=" + task_id + "&ordertaskid=" + taskInfo.ordertask_id + "&ordersid=" + orders_id + "&status=1&info=shop页面没有Seach")
                    if (msg != '成功接收到通知') {
                        return "系统断线，停止任务"
                    }
                }
                sleep(10000)
                //
                // 可能会出现验证码。遇到了变速验证码。判断一下Refresh这个文字刷新是否存在，存在就走常规验证码，不存在但是存在Drag the puzzle piece into place 就走变速验证码
                let verify1 = selector().textContains('erify to continue').visibleToUser(true).exists()
                let verify2 = selector().textContains('Refresh').visibleToUser(true).exists()
                let verify3 = selector().textContains('rag the puzzle piece into place').visibleToUser(true).exists()
                if (verify1 || verify2 || verify3) {
                    let verifyMsg = ""
                    //说明有验证码
                    if (verify2) {
                        comm.showLogToFile("常规滑块验证码")
                        verifyMsg = imageCodeVerify_Buy()
                    } else {
                        comm.showLog("变化速率的滑块验证码")
                        verifyMsg = sliderVerificationCode()
                    }
                    comm.showLog("验证码部分返回：" + verifyMsg)
                    closeAllPop()
                }
                if (selector().textContains('Search').visibleToUser(true).exists()) {
                    break
                }
                if (selector().textContains('Share').visibleToUser(true).exists()) {
                    comm.showLogToFile("大概打开的时候，进入到直播页面中")
                    back()
                    sleep(5000)
                }
                let tryAgain = selector().textContains('try agin').visibleToUser(true).findOne(1000)
                if (tryAgain) {
                    comm.clickObj(tryAgain)
                } else {
                    comm.pullDownRefresh(1)
                }
            }
            //获取url，通过浏览器的方式打开链接
            // openLinkFromBrowser(taskInfo.url)
            sleep(5000)

            // //可能直接打开商品的半框、可能直接打开那个搜索框
            // if(selector().textContains('buy now').visibleToUser(true).exists()){

            // }
            for (let i = 0; i < 10; i++) {
                if (i == 9) {
                    return "进入商品页面失败"
                }
                sleep(5000)
                comm.pullDownRefresh(1)
                sleep(5000)
                if (i == 0 || i == 8) {
                    openProduct(taskInfo.product_no, taskInfo.seller_id)
                    comm.showLogToFile("执行了openProduct！！！！！")
                    msg = comm.httpToStringShellContinue(remoteServer + "/admin/api/orderPing?id=" + task_id + "&ordertaskid=" + taskInfo.ordertask_id + "&ordersid=" + orders_id + "&status=1&info=执行了openProduct")
                    if (msg != '成功接收到通知') {
                        return "系统断线，停止任务"
                    }
                    sleep(5000)
                }
                sleep(8000)
                //看看会不会出现没网络try again的字样 
                let contTag = false
                for (let j = 0; j < 15; j++) {
                    if (j == 14) {
                        sleep(5000)
                        let homeBtn = selector().textContains('Home').visibleToUser(true).findOne(1000)
                        let profileBtn = selector().textContains('Profile').visibleToUser(true).findOne(1000)
                        if (homeBtn && profileBtn) {
                            comm.showLogToFile("有首页")
                        } else {
                            back()
                        }
                        contTag = true
                        break
                    }
                    if (selector().textContains('Buy now').visibleToUser(true).exists()) {
                        comm.showLogToFile("有Buy now")
                        comm.randomSwipeSlow(1)
                        break
                    } else if (selector().textContains('try again').visibleToUser(true).exists()) {
                        for (let i = 0; i < 5; i++) {
                            if (selector().textContains('Shop').visibleToUser(true).exists()) {
                                comm.showLogToFile("回到shop页面")
                                break
                            } else {
                                comm.showLogToFile("没有回到shop页面")
                            }
                            back()
                            sleep(3000)
                        }
                    } else if (selector().textContains('Verify to continue').visibleToUser(true).exists()) {
                        comm.showLogToFile("有验证码")
                        imageCodeVerify_Buy()
                        sleep(5000)
                        //
                    } else {
                        comm.showLogToFile("没有验证码、没有try again" + j)
                        if (selector().textContains('Buy now').visibleToUser(true).exists()) {
                            break
                        }
                        let selectObjs = selector().textContains(product_title.slice(0, 15)).visibleToUser(true).find()
                        if (selectObjs.length == 0) {
                            comm.showLogToFile("没有匹配项" + j)
                        } else {
                            // comm.clickObj(selectObjs[0])
                            break
                        }
                    }
                    sleep(5000)
                }
                if (contTag) {
                    continue
                }
                // 判断商品匹配项
                contTag = false
                for (let j = 0; j < 15; j++) {
                    if (j == 14) {
                        msg = comm.httpToStringShellContinue(remoteServer + "/admin/api/orderPing?id=" + task_id + "&ordertaskid=" + taskInfo.ordertask_id + "&ordersid=" + orders_id + "&status=1&info=商品没有匹配项(重试" + i + ")")
                        if (msg != '成功接收到通知') {
                            return "系统断线，停止任务"
                        }
                        comm.showLogToFile("商品没有匹配项")
                        for (let i = 0; i < 5; i++) {
                            if (selector().textContains('Shop').visibleToUser(true).exists()) {
                                break
                            }
                            back()
                            sleep(3000)
                        }
                        contTag = true
                        break
                    }
                    sleep(5000)
                    //
                    let selectObjs = selector().textContains(product_title.slice(0, 20)).visibleToUser(true).find()
                    if (selectObjs.length == 0) {
                        comm.showLogToFile("没有匹配项" + j)
                        comm.randomSwipeSlow(1)
                    } else if (selectObjs.length == 1) {
                        comm.showLogToFile("有一个匹配项" + j)
                        comm.clickObj(selectObjs[0])
                        sleep(5000)
                        break
                    } else if (selectObjs.length > 1) {
                        comm.showLogToFile("有多个匹配项" + j)
                        let isFond = false
                        //可能会存在点到店铺的那个按钮,店铺名称也是同名
                        for (let i = 0; i < selectObjs.length; i++) {
                            if (selectObjs[i].text().includes("Sold by")) {
                                continue
                            } else {
                                comm.clickObj(selectObjs[i])
                                sleep(5000)
                                isFond = true
                                break
                            }
                        }
                        if (!isFond) {
                            comm.clickObj(selectObjs[1])
                            sleep(5000)
                            break
                        } else {
                            break
                        }
                    }
                    sleep(5000)
                }
                if (contTag) {
                    continue
                }
                //判断是否进入商品页面
                contTag = false
                for (let j = 0; j < 15; j++) {
                    if (j == 14) {
                        let returnMsg = "没有进入商品页面"
                        if (selector().textContains('Change address').visibleToUser(true).exists()) {
                            returnMsg = "无法送达该地址"
                        } else {
                            returnMsg = "没有进入商品页面(重试" + i + ")"
                        }
                        msg = comm.httpToStringShellContinue(remoteServer + "/admin/api/orderPing?id=" + task_id + "&ordertaskid=" + taskInfo.ordertask_id + "&ordersid=" + orders_id + "&status=1&info=" + returnMsg)
                        if (msg != '成功接收到通知') {
                            return "系统断线，停止任务"
                        }
                        comm.showLogToFile("没有进入商品页面")
                        return returnMsg
                        // for (let i = 0; i < 5; i++) {
                        //     if (selector().textContains('Shop').visibleToUser(true).exists()) {
                        //         break
                        //     }
                        //     back()
                        //     sleep(3000)
                        // }
                        // contTag = true
                        // break
                    }
                    let addToCart = selector().textContains('Add to cart').visibleToUser(true).findOne(1000)
                    if (addToCart) {
                        break
                    }
                    let VerifyContinue = selector().textContains('Verify to continue:').visibleToUser(true).findOne(1000)
                    if (VerifyContinue) {
                        comm.showLogToFile("有验证码")
                        imageCodeVerify_Buy()
                        sleep(5000)
                    }
                    sleep(5000)
                }
                if (contTag) {
                    continue
                } else {
                    //如果到这里都还是false，那就中断，说明成功了
                    break
                }
                //
            }

            //
            comm.showLogToFile("成功进入商品页面")
            //
        }
    }
    ////////////////////////////////////////////////////////选商品页面///////////////////////////////////////////////////////////////
    //现象出现点进去了别商品（奇怪）
    //到这里为止，已经进入商品详情了
    sleep(10000)
    // comm.randomSwipeSlow(2)
    comm.randomToAndFroSwipe()
    sleep(10000)
    imageCodeVerify_Buy()
    sleep(2000)
    // 判断商品标题对不对
    let title_list = selector().textContains(product_title.slice(0, 20)).visibleToUser(true).findOne(1000)
    if (title_list) {
        comm.showLogToFile("匹配到这个标题")
        sleep(1000)
        // comm.clickObj(title_list)
        // title_list=selector().textContains(product_title).visibleToUser(true).findOne(1000)
        // if (title_list){
        //     comm.showLog("完全匹配到这个标题")
        // }
    } else {
        sleep(2000)
        comm.randomSwipeSlow(1)
        title_list = selector().textContains(product_title.slice(0, 20)).visibleToUser(true).findOne(1000)
        if (title_list) {
            comm.showLogToFile("匹配到这个标题")
            sleep(1000)
        } else {
            return "可能没找到标题"
        }
    }
    //判断一下是不是商品被移除
    let beenRem = selector().textContains("This item has been removed").visibleToUser(true).findOne(1000)
    if (beenRem) {
        msg = comm.httpToStringShellContinue(remoteServer + "/admin/api/orderPing?id=" + task_id + "&ordertaskid=" + taskInfo.ordertask_id + "&ordersid=" + orders_id + "&status=1&info=商品被移除（This item has been removed）")
        if (msg != '成功接收到通知') {
            return "系统断线，停止任务"
        }
        return "商品被移除"
    }
    //判断一下是不是商品被移除
    beenRem = selector().textContains("This item is out of stock").visibleToUser(true).findOne(1000)
    if (beenRem) {
        msg = comm.httpToStringShellContinue(remoteServer + "/admin/api/orderPing?id=" + task_id + "&ordertaskid=" + taskInfo.ordertask_id + "&ordersid=" + orders_id + "&status=1&info=商品缺货（This item is out of stock）")
        if (msg != '成功接收到通知') {
            return "系统断线，停止任务"
        }
        return "商品缺货"
    }
    //判断一下有没有限单 (预计送达时间)
    // if (!selector().textContains("Estimated delivery").visibleToUser(true).exists()){
    //     msg = comm.httpToStringShellContinue(remoteServer+"/admin/api/orderPing?id="+task_id+"&ordertaskid="+taskInfo.ordertask_id+"&status=1&info=可能出现限单(Estimated delivery)")
    //     if(msg  != '成功接收到通知'){
    //         return "系统断线，停止任务"
    //     }
    // }
    //判断购买
    if (taskInfo.enter_method == 0) {
        comm.showLogToFile("直接购买")
    } else {
        comm.showLogToFile("进入商家主页进行购买（目前没有）")
    }
    msg = comm.httpToStringShellContinue(remoteServer + "/admin/api/orderPing?id=" + task_id + "&ordertaskid=" + taskInfo.ordertask_id + "&ordersid=" + orders_id + "&status=1&info=找Buy now按钮")
    if (msg != '成功接收到通知') {
        return "系统断线，停止任务"
    }
    sleep(3000)
    comm.randomSwipeSlow(1)
    sleep(10000)
    imageCodeVerify_Buy()
    sleep(5000)
    //className = android.widget.Button
    //text = Claim
    //点击领取优惠
    let claimBtns = selector().className("android.widget.Button").text("Claim").visibleToUser(true).find()
    if (claimBtns) {
        for (let i = 0; i < claimBtns.length; i++) {
            comm.clickObj(claimBtns[i])
            sleep(3000)
        }
    }
    comm.randomSwipeSlow(1)
    sleep(3000)
    comm.showLogToFile("原本打算在这里判断店铺是否错误，打印一下seller_name：" + taskInfo.seller_name)
    // 判断一下是否在当前商铺
    // if (taskInfo.seller_name != "" && selector().text("Visit shop").visibleToUser(true).exists()) {
    if (taskInfo.seller_name != "" && selector().textContains('Visit shop').visibleToUser(true).exists()) {
        comm.showLogToFile("判断店铺:" + taskInfo.seller_name)
        //
        if (taskInfo.seller_name.length > 8) {
            if (!selector().textContains(taskInfo.seller_name.slice(0, 7)).visibleToUser(true).exists()) {
                comm.showLogToFile("可能店铺错误")
                return "可能店铺错误"
            } else {
                comm.showLogToFile("店铺正确")
            }
        }
    }
    sleep(3000)
    comm.randomSwipeSlow(1)
    sleep(5000)

    //新增，判断一下是不是对应的商店，避免限单下错店
    // if (taskInfo.seller_name != null){
    //     let seller_name = taskInfo.seller_name
    //     //
    //     if(taskInfo.seller_name.length > 15){
    //         seller_name = taskInfo.seller_name.slice(0,14)
    //     }
    //     //
    //     let shopHome = selector().textContains('Visit shop').visibleToUser(true).findOne(1000)
    //     if (shopHome){
    //         comm.clickObj(shopHome)
    //         sleep(5000)
    //         if (selector().textContains(seller_name).visibleToUser(true).exists()){
    //             comm.showLog("找到了这家店")
    //             sleep(5000)
    //             back()
    //         }else{
    //             comm.showLog("不是这家店")
    //             msg = comm.httpToStringShellContinue(remoteServer+"/admin/api/orderPing?id="+task_id+"&ordertaskid="+taskInfo.ordertask_id+"&status=1&info=店铺名称没找到")
    //             if(msg  != '成功接收到通知'){
    //                 return "系统断线，停止任务"
    //             }
    //             return "店铺名称没找到"
    //         }
    //     }
    // }
    // sleep(5000)
    //判断一下有没有限单 (预计送达时间)
    // if (!selector().textContains("Estimated delivery").visibleToUser(true).exists()){
    //     msg = comm.httpToStringShellContinue(remoteServer+"/admin/api/orderPing?id="+task_id+"&ordertaskid="+taskInfo.ordertask_id+"&status=1&info=可能出现限单(Estimated delivery)")
    //     if(msg  != '成功接收到通知'){
    //         return "系统断线，停止任务"
    //     }
    //     return "可能出现限单(Estimated delivery)"
    // }
    //
    //判断一下有没有库存
    beenRem = selector().textContains("This item has been removed").visibleToUser(true).findOne(1000)
    if (beenRem) {
        msg = comm.httpToStringShellContinue(remoteServer + "/admin/api/orderPing?id=" + task_id + "&ordertaskid=" + taskInfo.ordertask_id + "&ordersid=" + orders_id + "&status=1&info=商品被移除（This item has been removed）")
        if (msg != '成功接收到通知') {
            return "系统断线，停止任务"
        }
        return "商品被移除"
    }
    //点一下buy now，不知道有没有sku的选择
    //
    for (let j = 0; j < 10; j++) {
        if (j == 9) {
            return "没找到buy now按钮"
        }
        let buyNow = selector().className('android.widget.Button').textContains('Buy now').findOne(1000)
        if (buyNow) {
            comm.showLogToFile("buy now按钮存在，点一下")
            comm.clickObj(buyNow)
            sleep(10000)
            imageCodeVerify_Buy()
            //
            buyNow = selector().className('android.widget.Button').textContains('Buy now').findOne(1000)
            if (buyNow) {
                comm.clickObj(buyNow)
                //如果还存在，就去选择sku
                sleep(5000)
                //来回滑动一下
                comm.randomToAndFroSwipe()
                //可能会出现选择验证码
                sleep(20000)
                // 判断有没有滑块验证码
                comm.showLogToFile("判断有没有滑块验证码")
                // imageCodeVerify_my()
                imageCodeVerify_Buy()
                comm.showLogToFile("验证码结束")
                let contTag = false
                for (let i = 0; i < 5; i++) {
                    buyNow = selector().className('android.widget.Button').textContains('Buy now').findOne(1000)
                    if (buyNow) {
                        comm.showLogToFile("开始选择sku")
                        // if(doSku(taskInfo.sku_name)){
                        // if (doSku_v2(taskInfo.sku_name)) {
                        if (doSku_v3(taskInfo.sku_name)) {
                            comm.showLogToFile("sku选择成功")
                            contTag = true
                            break
                        } else {
                            comm.showLogToFile("sku选择失败")
                            return "sku选择失败"
                        }
                    } else {
                        //看看是不是进checkout页面了
                        if (selector().textContains('Checkout').visibleToUser(true).exists()) {
                            comm.showLogToFile("进入了支付页面")
                            sleep(3000)
                            comm.randomToAndFroSwipe(1)
                            //支付页面也可能存在，没网络的框，判断银行卡界面有没有Payment method
                            if (selector().textContains('Payment method').visibleToUser(true).exists()) {
                                // 有这个，说明真的进checkout页面了
                                contTag = true
                                break
                            } else if (selector().textContains('Place order').visibleToUser(true).exists()) {
                                //否则，判断是不是卡了或者验证码
                                contTag = true
                                break
                            } else if (selector().textContains('payment method').visibleToUser(true).exists()) {
                                contTag = true
                                break
                            } else {
                                for (let i = 0; i < 5; i++) {
                                    if (selector().textContains('Buy now').visibleToUser(true).exists()) {
                                        break
                                    }
                                    back()
                                    sleep(3000)
                                }

                            }

                        } else if (selector().textContains('Retry').visibleToUser(true).exists()) {
                            let retryBtn = selector().textContains("Retry").visibleToUser(true).findOne(1000)
                            if (retryBtn) {
                                //如果retry存在，点击
                                comm.clickObj(retryBtn)
                                sleep(5000)
                                retryBtn = selector().textContains("Retry").visibleToUser(true).findOne(1000)
                                if (retryBtn) {
                                    //如果还存在，返回到buy now页面
                                    for (let i = 0; i < 5; i++) {
                                        if (selector().textContains('Buy now').visibleToUser(true).exists()) {
                                            break
                                        }
                                        back()
                                        sleep(3000)
                                    }

                                }
                            } else {
                                for (let i = 0; i < 5; i++) {
                                    if (selector().textContains('Buy now').visibleToUser(true).exists()) {
                                        break
                                    }
                                    back()
                                    sleep(3000)
                                }
                            }
                        } else if (selector().textContains('Verify to continue:').visibleToUser(true).exists()) {
                            //也不是checkout，也不是retry那就是验证码  Verify to continue:
                            imageCodeVerify_Buy()
                            continue
                        } else {
                            // 直接返回buy now页面
                            for (let i = 0; i < 5; i++) {
                                if (selector().textContains('Buy now').visibleToUser(true).exists()) {
                                    break
                                }
                                back()
                                sleep(3000)
                            }
                        }
                    }
                    sleep(5000)
                }
                if (contTag) {
                    break
                } else {
                    continue
                }
            } else {
                //如果不存在，就判断是不是进入了checkout页面，或者出现retry
                if (selector().textContains('Checkout').visibleToUser(true).exists()) {
                    comm.showLogToFile("进入了支付页面")
                    sleep(3000)
                    comm.randomToAndFroSwipe()
                    //支付页面也可能存在，没网络的框，判断银行卡界面有没有Payment method
                    if (selector().textContains('Payment method').visibleToUser(true).exists()) {
                        // 有这个，说明真的进checkout页面了
                        break
                    } else if (selector().textContains('Place order').visibleToUser(true).exists()) {
                        //否则，判断是不是卡了或者验证码
                        break
                        // }else{
                        //     //否则，判断是不是卡了或者验证码
                        //     for (let i = 0;i<5;i++){
                        //         if (selector().textContains('Buy now').visibleToUser(true).exists()){
                        //             break
                        //         }
                        //         back()
                        //         sleep(3000)
                        //     }

                    }
                } else if (selector().textContains('Retry').visibleToUser(true).exists()) {
                    let retryBtn = selector().textContains("Retry").visibleToUser(true).findOne(1000)
                    if (retryBtn) {
                        //如果retry存在，点击
                        comm.clickObj(retryBtn)
                        sleep(5000)
                        retryBtn = selector().textContains("Retry").visibleToUser(true).findOne(1000)
                        if (retryBtn) {
                            //如果还存在，返回到buy now页面
                            for (let i = 0; i < 5; i++) {
                                if (selector().textContains('Buy now').visibleToUser(true).exists()) {
                                    break
                                }
                                back()
                                sleep(3000)
                            }

                        }
                    } else {
                        for (let i = 0; i < 5; i++) {
                            if (selector().textContains('Buy now').visibleToUser(true).exists()) {
                                break
                            }
                            back()
                            sleep(3000)
                        }
                    }
                } else if (selector().textContains('Verify to continue:').visibleToUser(true).exists()) {
                    //也不是checkout，也不是retry那就是验证码  Verify to continue:
                    imageCodeVerify_Buy()
                    continue
                } else {
                    // 直接返回buy now页面
                    for (let i = 0; i < 5; i++) {
                        if (selector().textContains('Buy now').visibleToUser(true).exists()) {
                            break
                        }
                        back()
                        sleep(3000)
                    }
                }

            }
            //按理说点完一次，应该还会存在，如果不存在，就判断是不是在checkout页面（在，说明进去了，不在说明可能有弹窗）
            //如果存在，说明
        } else {
            beenRem = selector().textContains("This item has been removed").visibleToUser(true).findOne(1000)
            if (beenRem) {
                msg = comm.httpToStringShellContinue(remoteServer + "/admin/api/orderPing?id=" + task_id + "&ordertaskid=" + taskInfo.ordertask_id + "&ordersid=" + orders_id + "&status=1&info=商品被移除（This item has been removed）")
                if (msg != '成功接收到通知') {
                    return "系统断线，停止任务"
                }
                return "商品被移除"
            }
            //没找到buy按钮，可能进入了验证码加载
            comm.showLogToFile("可能有验证码")
            sleep(15000)
            imageCodeVerify_Buy()
            sleep(10000)
            if (selector().textContains('Checkout').visibleToUser(true).exists()) {
                comm.showLogToFile("进入了支付页面")
                sleep(3000)
                comm.randomToAndFroSwipe(1)
                //支付页面也可能存在，没网络的框，判断银行卡界面有没有Payment method
                if (selector().textContains('Payment method').visibleToUser(true).exists()) {
                    // 有这个，说明真的进checkout页面了
                    break
                } else if (selector().textContains('Place order').visibleToUser(true).exists()) {
                    //否则，判断是不是卡了或者验证码
                    break
                    // }else{
                    //     //否则，判断是不是卡了或者验证码
                    //     for (let i = 0;i<5;i++){
                    //         if (selector().textContains('Buy now').visibleToUser(true).exists()){
                    //             break
                    //         }
                    //         back()
                    //         sleep(3000)
                    //     }

                } else if (selector().textContains('payment method').visibleToUser(true).exists()) {
                    break
                }
            } else {
                if (j > 6) {
                    for (let i = 0; i < 5; i++) {
                        if (selector().textContains('Buy now').visibleToUser(true).exists()) {
                            break
                        }
                        back()
                        sleep(3000)
                    }
                }
            }
        }
        sleep(5000)
    }
    // sleep(3000)
    // //找到数量输入框 Quantity
    // comm.showLogToFile("输入购买数量")
    // for (let q =0;q<6;q++){
    //     let quant=selector().textContains("Quantity").visibleToUser(true).findOne(1000)
    //     if (quant){
    //         let editTextInput = selector().className('android.widget.EditText').findOne(2000)
    //         if (editTextInput){
    //             comm.clickObj(editTextInput)
    //             sleep(1000)
    //             editTextInput.setText("\b")
    //             sleep(1000)
    //             editTextInput.setText(taskInfo.product_quantity)
    //             break
    //         }
    //     }else{
    //         comm.randomSwipeSlow(1)
    //         sleep(5000)
    //     }
    // }
    //
    sleep(3000)
    //判断一下buynow在不在
    for (let i = 0; i < 5; i++) {
        sleep(5000)
        let buyNow = selector().className('android.widget.Button').textContains('Buy now').findOne(1000)
        if (buyNow) {
            comm.showLogToFile("点击一下buynow")
            comm.clickObj(buyNow)
            sleep(5000)
            buyNow = selector().className('android.widget.Button').textContains('Buy now').findOne(1000)
            if (buyNow) {
                continue
            } else {
                break
            }
        }
    }
    sleep(8000)
    let checkoutPage = selector().textContains('Checkout').visibleToUser(true).findOne(1000)
    if (!checkoutPage) {
        checkoutPage = selector().textContains('Order summary').visibleToUser(true).findOne(1000)
    }
    if (checkoutPage) {
        comm.showLogToFile("已经进入Check-out页面")
    } else {
        comm.showLogToFile("没有进入Check-out页面")
        return "没有进入Check-out页面"
    }





    //
    // let buyNow=selector().className('android.widget.Button').textContains('Buy now').findOne(1000)
    // if(!buyNow){
    //     comm.showLog("buy now按钮未找到")
    //     // return "buy now按钮未找到"
    //     for (let i =0;i<10;i++){
    //         buyNow=selector().className('android.widget.Button').textContains('Buy now').findOne(1000)
    //         if(buyNow){
    //             comm.clickObj(buyNow)
    //             break
    //         }else{
    //             comm.showLog("buy now按钮未找到"+i)
    //             sleep(2000)
    //         }
    //     }
    // }else{
    //     comm.showLog("buy now按钮找到")
    //     comm.clickObj(buyNow)
    // }    
    // // 判断有没有验证码
    // sleep(5000)
    // comm.showLog("判断有没有滑块验证码")
    // for (let i = 0;i<10;i++){
    //     imageCodeVerify_Buy()
    //     buyNow=selector().className('android.widget.Button').textContains('Buy now').findOne(1000)
    //     if(buyNow){
    //         comm.clickObj(buyNow)
    //         break
    //     }
    //     if (selector().textContains('Checkout').visibleToUser(true).exists()){
    //         break
    //     }
    //     sleep(5000)
    // }
    // sleep(5000)

    ////////////////////////////////////////////////////////checkout页面///////////////////////////////////////////////////////////////


    //判断是不是直接进入购买页面
    // if (selector().textContains('Checkout').visibleToUser(true).exists()){
    //     comm.showLog("已经进入了Check-out页面")
    //     //判断有没有Payment method 银行卡
    //     let paymentMethod=selector().textContains('Payment method').findOne(1000)
    //     if(paymentMethod){
    //         comm.showLog("已经进入了Check-out页面，但是页面卡了")
    //         back()
    //         sleep(5000)
    //         buyNow=selector().className('android.widget.Button').textContains('Buy now').findOne(1000)
    //         if(buyNow){
    //             comm.clickObj(buyNow)
    //         }
    //     }

    // }else{
    //     comm.showLog("没进Check-out页面")
    //     //检测是否有buynow按钮
    //     buyNow=selector().className('android.widget.Button').textContains('Buy now').findOne(1000)
    //     if(buyNow){
    //         comm.clickObj(buyNow)
    //     }else{
    //         comm.showLog("buy now按钮未找到")
    //         return "没成功进入Check-out页面"
    //     }
    //     sleep(5000)
    //     //来回滑动一下
    //     comm.randomToAndFroSwipe()
    //     //可能会出现选择验证码
    //     sleep(20000)
    //     // 判断有没有滑块验证码
    //     comm.showLog("判断有没有滑块验证码")
    //     // imageCodeVerify_my()
    //     imageCodeVerify_Buy()
    //     comm.showLog("验证码结束")
    //     // sku怎么弄
    //     comm.showLog("开始选择sku")
    //     if(doSku(taskInfo.sku_name)){
    //         comm.showLog("sku选择成功")
    //     }else{
    //         comm.showLog("sku选择失败")
    //         return "sku选择失败"
    //     }
    //     sleep(2000)
    //     // 点击buy now进入订单详情页面 
    //     buyNow=selector().className('android.widget.Button').textContains('Buy now').visibleToUser(true).findOne(1000)
    //     if(!buyNow){
    //         comm.showLog("buy now按钮未找到")
    //         return "buy now按钮未找到"
    //     }else{
    //         comm.showLog("buy now按钮找到")
    //         comm.clickObj(buyNow) //点一下
    //         sleep(2000)
    //         // 点完之后判断还有没有buy now按钮
    //         for (let i =0;i<15;i++){
    //             if(i== 14){
    //                 comm.httpToString(remoteServer+"/admin/api/orderPing?id="+task_id+"&ordertaskid="+taskInfo.ordertask_id+"&status=2&info=点击buy now按钮进入订单详情页面错误")
    //                 comm.showLog("buy now按钮找到，流程错误")
    //                 return "点击buy now按钮进入订单详情页面错误"
    //             }
    //             let buyNow2=selector().className('android.widget.Button').textContains('Buy now').visibleToUser(true).findOne(1000)
    //             if(buyNow2){
    //                 comm.showLog("buy now按钮找到"+i)
    //                 comm.clickObj(buyNow2) //点一下
    //             }
    //             if(comm.existsTextAll("Checkout")){
    //                 break
    //             }
    //             sleep(5000)
    //         }
    //     }
    //     // 检查是否在checkout页面
    //     for (let i= 0;i<10;i++){
    //         //
    //         if(comm.existsTextAll("Checkout")){
    //             comm.showLog("在checkout页面")
    //             break
    //         }else{
    //             comm.showLog("不在checkout页面")
    //             //尝试有没有Retry
    //             let retryBtn = selector().textContains('Retry').visibleToUser(true).findOne(1000)
    //             if (retryBtn){
    //                 comm.clickObj(retryBtn)
    //             }
    //         }
    //         sleep(5000)
    //     }

    // }
    // sleep(5000)
    // //
    // if(!comm.existsTextAll("Checkout")){
    //     comm.showLog("确实不在checkout页面")
    //     return "没进入checkout页面"
    // }
    ////////////////////////////////////////////////////////支付页面///////////////////////////////////////////////////////////////
    //
    msg = comm.httpToStringShellContinue(remoteServer + "/admin/api/orderPing?id=" + task_id + "&ordertaskid=" + taskInfo.ordertask_id + "&ordersid=" + orders_id + "&status=1&info=进入checkout页面")
    if (msg != '成功接收到通知') {
        return "系统断线，停止任务"
    }
    // 检查地址
    // 检查卡号
    // 检查优惠金额
    // 检查支付价格
    let realname = taskInfo.realname.slice(0, 10)
    let card_number = taskInfo.card_number
    let discount = taskInfo.discount
    let max_amount = taskInfo.max_amount
    let ordertask_id = taskInfo.ordertask_id
    let email = taskInfo.email
    let product_quantity = taskInfo.product_quantity  //下单数量
    // comm.randomSwipeSlow(1)
    //
    let order_result = orderAction_my(task_id, "", realname, card_number, discount, max_amount, ordertask_id, email, product_quantity)
    if (order_result == "success") {
        //
        comm.showLogToFile("下单成功,准备发送滑动和截图")
        comm.randomSwipeSlow(1)
        // 
        sleep(2000)
        for (let i = 0; i < 30; i++) {
            let order_details = selector().textContains('Order details').visibleToUser(true).findOne(1000)
            if (order_details) {
                break
            }
            // 可能会出现验证码。遇到了变速验证码。判断一下Refresh这个文字刷新是否存在，存在就走常规验证码，不存在但是存在Drag the puzzle piece into place 就走变速验证码
            let verify1 = selector().textContains('erify to continue').visibleToUser(true).exists()
            let verify2 = selector().textContains('Refresh').visibleToUser(true).exists()
            let verify3 = selector().textContains('rag the puzzle piece into place').visibleToUser(true).exists()
            if (verify1 || verify2 || verify3) {
                let verifyMsg = ""
                //说明有验证码
                if (verify2) {
                    comm.showLogToFile("常规滑块验证码")
                    verifyMsg = imageCodeVerify_Buy()
                } else {
                    comm.showLog("变化速率的滑块验证码")
                    verifyMsg = sliderVerificationCode()
                }
                comm.showLog("验证码部分返回：" + verifyMsg)
            } else {
                let retryBtn = selector().className('android.widget.Button').text('Retry').visibleToUser(true).findOne(1000)
                if (retryBtn) {
                    comm.showLog("opentk,点一下Retry")
                    comm.clickObj(retryBtn)
                }
            }
            sleep(5000)
        }
        if (orderFinishAction(task_id)) {
            comm.showLogToFile("滑动和截图成功，发送截图")
            findCapturedImageAndSend()
            //找到并发送订单信息
            findOrderInfoAndSend(taskInfo)
            sleep(8000)

        } else {
            comm.showLogToFile("滑动和截图失败")
            // return "滑动和截图失败"
        }
    } else {
        comm.showLogToFile("下单失败:" + order_result)
        return order_result
    }
    sleep(5000)
    // 
    return "success"
}


//找到并发送订单信息
function findOrderInfoAndSend(taskInfo) {
    comm.showLogToFile("执行-找到并发送订单信息")
    // 获取Subtotal的坐标
    let tk_order_id = ""
    let subtotal = "$0" //商品价格
    let shipping = "$0" //运费
    let taxes = "$0"    //税费
    let discounts = "$0"// 优惠
    let total = "$0"// 订单价格
    //先判断这些数据是不是在页面中
    if (selector().textContains('Subtotal').visibleToUser(true).exists() && selector().textContains('Shipping').visibleToUser(true).exists() && selector().textContains('Taxes').visibleToUser(true).exists() && selector().text('Total').visibleToUser(true).exists() && selector().textContains('Order ID').visibleToUser(true).exists()) {
        comm.showLogToFile("找到订单详情页")
        //
        let subtotalObj = selector().textContains('Subtotal').visibleToUser(true).findOne(1000)
        if (subtotalObj) {
            // 
            comm.showLog("进入$循环-Subtotal")
            let dollarObj = selector().textContains('$').visibleToUser(true).find()
            if (dollarObj) {
                for (let i = 0; i < dollarObj.length; i++) {
                    if (isDifferenceInRange(subtotalObj.bounds().centerY(), dollarObj[i].bounds().centerY(), 5)) {
                        comm.showLog("打印$号的数据内容：")
                        comm.showLog(dollarObj[i].text())
                        subtotal = dollarObj[i].text()
                        break
                    }
                }
            }
        } else {
            comm.showLog("没找到Subt-otal")
            subtotal = "$0"
        }
        //
        let shippingObj = selector().text('Shipping').visibleToUser(true).findOne(1000)
        if (shippingObj) {
            // 
            comm.showLog("进入$循环-Shipping")
            let isFond = false
            let dollarObj = selector().textContains('$').visibleToUser(true).find()
            if (dollarObj) {
                for (let i = 0; i < dollarObj.length; i++) {
                    if (isDifferenceInRange(shippingObj.bounds().centerY(), dollarObj[i].bounds().centerY(), 5)) {
                        comm.showLog("打印$号的数据内容：")
                        comm.showLog(dollarObj[i].text())
                        shipping = dollarObj[i].text()
                        //
                        isFond = true
                        break
                    }
                }
            }
            if (!isFond) {
                comm.showLog("没找到$")
                let freeObj = selector().textContains('Free').visibleToUser(true).find()
                if (freeObj) {
                    comm.showLog("找到Free，可能有多个：" + freeObj.length)
                    for (let j = 0; j < freeObj.length; j++) {
                        //
                        if (isDifferenceInRange(shippingObj.bounds().centerY(), freeObj[j].bounds().centerY(), 5)) {
                            comm.showLog("打印Free的数据内容：")
                            comm.showLog(freeObj[j].text())
                            comm.showLog("找到Free")
                            break
                        }
                    }
                } else {
                    comm.showLog("没找到Free")
                }
            }
        } else {
            comm.showLog("没找到Shipp-ing")
            shipping = "$0"
        }
        //
        let taxesObj = selector().text('Taxes').visibleToUser(true).findOne(1000)
        if (taxesObj) {
            // 
            comm.showLog("进入$循环-Taxes")
            let isFond = false
            let dollarObj = selector().textContains('$').visibleToUser(true).find()
            if (dollarObj) {
                for (let i = 0; i < dollarObj.length; i++) {
                    //
                    if (isDifferenceInRange(taxesObj.bounds().centerY(), dollarObj[i].bounds().centerY(), 5)) {
                        comm.showLog("打印$号的数据内容：")
                        comm.showLog(dollarObj[i].text())
                        taxes = dollarObj[i].text()
                        //
                        isFond = true
                        break
                    }
                }
            }
            if (!isFond) {
                comm.showLog("没找到$")
                let freeObj = selector().textContains('Free').visibleToUser(true).find()
                if (freeObj) {
                    comm.showLog("找到Free，可能有多个：" + freeObj.length)
                    for (let j = 0; j < freeObj.length; j++) {
                        //
                        if (isDifferenceInRange(taxesObj.bounds().centerY(), freeObj[j].bounds().centerY(), 5)) {
                            comm.showLog("打印Free的数据内容：")
                            comm.showLog(freeObj[j].text())
                            comm.showLog("找到Free")
                            break
                        }
                    }
                } else {
                    comm.showLog("没找到Free")
                }
            }
        } else {
            comm.showLog("没找到Ta-xes")
            taxes = "&0"
        }
        //
        let discountsObj = selector().text('Discounts').visibleToUser(true).findOne(1000)
        if (discountsObj) {
            // 
            comm.showLog("进入$循环-Subtotal")
            let dollarObj = selector().textContains('$').visibleToUser(true).find()
            if (dollarObj) {
                for (let i = 0; i < dollarObj.length; i++) {
                    if (isDifferenceInRange(discountsObj.bounds().centerY(), dollarObj[i].bounds().centerY(), 5)) {
                        comm.showLog("打印$号的数据内容：")
                        comm.showLog(dollarObj[i].text())
                        discounts = dollarObj[i].text()
                        break
                    }
                }
            }
        } else {
            comm.showLog("没找到Dis-counts")
            discounts = "$0"
        }
        //
        let totalObj = selector().text('Total').visibleToUser(true).findOne(1000)
        if (totalObj) {
            // 
            comm.showLog("进入$循环-Total")
            let dollarObj = selector().textContains('$').visibleToUser(true).find()
            if (dollarObj) {
                for (let i = 0; i < dollarObj.length; i++) {
                    if (isDifferenceInRange(totalObj.bounds().centerY(), dollarObj[i].bounds().centerY(), 5)) {
                        comm.showLog("打印$号的数据内容：")
                        comm.showLog(dollarObj[i].text())
                        total = dollarObj[i].text()
                        break
                    }
                }
            }
        } else {
            comm.showLog("没找到Total")
            total = "$0"
        }
        //
        // 获取Orderid的坐标
        let orderidObj = selector().textContains('Order ID').visibleToUser(true).findOne(1000)
        if (orderidObj) {
            // 
            comm.showLog("进入循环-Order ID：" + orderidObj.bounds().centerY())
            let isFond = false
            //className = android.widget.Image
            let imgObj = selector().className('android.widget.Image').visibleToUser(true).find()
            if (imgObj) {
                for (let i = 0; i < imgObj.length; i++) {
                    comm.showLog("打印找到的image:" + imgObj[i].bounds().centerY())

                    if (isDifferenceInRange(orderidObj.bounds().centerY(), imgObj[i].bounds().centerY(), 8)) {
                        comm.showLog("按一下复制按钮")
                        comm.clickObj(imgObj[i])
                        isFond = true
                        sleep(8000)
                        break
                    }
                }
            }
            sleep(3000)
            if (isFond) {
                comm.showLog('切换autojs')
                if (!app.launch('org.autojs.autoxjs.inrt')) {
                    comm.showLog('autojs 启动失败')
                } else {
                    sleep(8000)
                    comm.showLog('切换autojs--成功')
                    //把复制的链接放进去
                    tk_order_id = getClip()
                    sleep(2000)
                    setClip("")
                }
            }
        } else {
            comm.showLog("没找到Order ID")
            tk_order_id = ""
        }
        //发送请求
        let msg = comm.httpToStringShellContinue(remoteServer + "/admin/api/orderPing/orderinfo?id=" + task_id + "&ordertaskid=" + taskInfo.ordertask_id + "&ordersid=" + orders_id + "&status=1&info=通知订单信息&tk_order_id=" + tk_order_id + "&goods_amount=" + subtotal + "&coupon_amount=" + discounts + "&tax_amount=" + taxes + "&shipping_amount=" + shipping + "&total_amount=" + total)
        comm.showLogToFile("发送通知订单信息请求后，返回：" + msg)

    } else {
        comm.showLogToFile("没找到订单详情页")
    }

}

//上传截图
function findCapturedImageAndSend() {
    let imagePath = "/sdcard/taskid_" + task_id + ".png";
    // 检查图片是否存在
    if (files.exists(imagePath)) {
        comm.showLog("图片存在！");
        comm.showLog(remoteServer)
        // 服务器上传地址
        let uploadUrl = remoteServer + "/admin/api/orderPing/capturedImage";
        // let uploadUrl = "http://10.6.0.58:8082" + "/admin/api/orderPing/capturedImage";

        comm.showLog(uploadUrl)

        let fileName = imagePath.substring(imagePath.lastIndexOf("/") + 1);
        //
        let imgBase64 = images.toBase64(images.read(imagePath));

        let res = http.post(uploadUrl, {
            image: imgBase64, // 直接传 Base64 字符串
            filename: fileName, // 文件名
            orderid: orders_id,
        });

        // 打印服务器返回结果
        comm.showLog("上传结果：", res.body.string());

    } else {
        comm.showLog("图片不存在！");
    }
}

//橱窗下单的前缀工作
function orderShowcase(taskInfo) {
    comm.showLog("进行橱窗下单")
    let product_title = taskInfo.product_title //商品标题
    let showcase_url = taskInfo.showcase_url //达人橱窗链接
    let showcase_add_url = taskInfo.showcase_add_url //达人橱窗的添加商品的请求
    // 请求一下添加商品
    comm.showLog("商品标题:" + product_title)
    comm.showLog("达人橱窗链接:" + showcase_url)
    comm.showLog("达人橱窗的添加商品的请求:" + showcase_add_url)
    let showcasebody = ""
    for (let i = 0; i < 2; i++) {
        let showcasebodyStr = comm.httpToString(showcase_add_url)
        comm.showLog("请求返回：" + showcasebodyStr)
        if (showcasebodyStr != '') {
            showcasebody = showcasebodyStr
            break
        } else {
            sleep(5000)
        }
    }
    //
    if (showcasebody != '') {
        // comm.showLogToFile("请求添加商品的返回：" + body)  //存一下数据库
        let showcaseRep = JSON.parse(showcasebody)
        // 获取返回success，如果不是success
        if (showcaseRep.message != "success") {
            //不等于成功，直接进行普通拉起的逻辑
            return false
        } else {
            //如果添加成功，执行橱窗下单逻辑
            sleep(2000)
            //获取url，通过浏览器的方式打开链接
            openLinkFromBrowser(showcase_url)

            comm.showLogToFile("等待10秒确保网页打开")
            sleep(15000)
            // 打开浏览器
            for (let i = 0; i < 20; i++) {
                let openBtn = selector().textContains('Not now').visibleToUser(true).findOne(1000)
                if (!openBtn) {
                    openBtn = selector().textContains('以后再说').visibleToUser(true).findOne(1000)
                }
                //找到点击按钮
                if (openBtn) {
                    comm.clickObj(openBtn)
                } else {
                    openBtn = selector().textContains('Open TikTok').visibleToUser(true).findOne(1000)
                    if (!openBtn) {
                        openBtn = selector().textContains('Open app').visibleToUser(true).findOne(1000)
                        if (!openBtn) {
                            comm.showLogToFile("没有Open-app" + i)
                            openBtn = selector().textContains('Watch on TikTok').visibleToUser(true).findOne(1000)
                            if (!openBtn) {
                                openBtn = selector().textContains('Continue').className("android.widget.Button").visibleToUser(true).findOne(1000)
                                if (!openBtn) {
                                    openBtn = selector().text('Continue').visibleToUser(true).findOne(1000)
                                }
                            }
                        }
                    }
                    if (openBtn) {
                        comm.clickObj(openBtn)
                    }
                }
                sleep(5000)
                // 可能会出现验证码。遇到了变速验证码。判断一下Refresh这个文字刷新是否存在，存在就走常规验证码，不存在但是存在Drag the puzzle piece into place 就走变速验证码
                let verify1 = selector().textContains('erify to continue').visibleToUser(true).exists()
                let verify2 = selector().textContains('Refresh').visibleToUser(true).exists()
                let verify3 = selector().textContains('rag the puzzle piece into place').visibleToUser(true).exists()
                if (verify1 || verify2 || verify3) {
                    let verifyMsg = ""
                    //说明有验证码
                    if (verify2) {
                        comm.showLogToFile("常规滑块验证码")
                        verifyMsg = imageCodeVerify_Buy()
                    } else {
                        comm.showLog("变化速率的滑块验证码")
                        verifyMsg = sliderVerificationCode()
                    }
                    comm.showLog("验证码部分返回：" + verifyMsg)
                    closeAllPop()
                }
                //判断提前中断条件
                if (selector().textContains('Sort by').visibleToUser(true).exists()) {
                    break
                } else {
                    //暂时隐藏
                    // comm.showLog("可能有验证码")
                    // sleep(3000)
                    // imageCodeVerify_Buy()
                    // sleep(2000)
                    // //可能有弹窗 Claim
                    // closeAllPop()
                }
                //
                sleep(2000)
            }
            // 点击并找排序
            let sortByBtn = selector().textContains('Sort by').visibleToUser(true).findOne(1000)
            if (sortByBtn) {
                comm.showLog("点击Sort-by")
                comm.clickObj(sortByBtn)
                sleep(3000)


                // let creatorBtn = selector().textContains('Creator').visibleToUser(true).findOne(1000)
                // if (creatorBtn) {
                //     comm.showLog("点击Crea-tor-s-choice")
                //     comm.clickObj(creatorBtn)
                //     sleep(3000)
                // } else {
                //     comm.showLog("没有Crea-tor-s-choice")
                //     return false
                // }
                let saveChack = selector().className('android.view.ViewGroup').visibleToUser(true).find()
                if (saveChack) {
                    // comm.showLog(saveChack.length)
                    if (saveChack.length > 2) {
                        // comm.clickObj(saveChack[0]) //不对
                        comm.clickObj(saveChack[1]) //对
                    } else {
                        comm.showLog("没有Crea-tor-s-choice1")
                    }
                } else {
                    comm.showLog("没有Crea-tor-s-choice2")
                }
            } else {
                comm.showLog("没进到Sort-by的店铺首页")
                return false
            }
            // 点一下列表切换
            sortByBtn = selector().textContains('Sort by').visibleToUser(true).findOne(1000)
            if (sortByBtn) {
                sleep(5000)
                click(device.width - 100, sortByBtn.bounds().centerY())
            }
            sleep(5000)
            comm.showLog("找商品")
            for (let i = 0; i < 10; i++) {
                if (i == 9) {
                    comm.showLog("没找到商品")
                    return false
                }
                //
                //找商品
                let productView = selector().textContains(product_title.slice(0, 14)).visibleToUser(true).findOne(1000)
                if (productView) {
                    comm.showLog("找到商品")
                    comm.clickObj(productView)
                    sleep(3000)
                    break
                }
                comm.randomSwipeSlowLong(1)
                sleep(3000)
            }
            //找商品
            // let productView = selector().textContains(product_title.slice(0, 14)).visibleToUser(true).findOne(1000)
            // if (productView) {
            //     comm.showLog("找到商品")
            //     comm.clickObj(productView)
            //     sleep(3000)
            // } else {
            //     comm.showLog("没找到商品")
            //     return false
            // }
            // 理论是打开了buy now和添加购物车页面
            sleep(5000)
            let addToCart = selector().textContains('Add to cart').visibleToUser(true).findOne(1000)
            if (!addToCart) {
                addToCart = selector().textContains('Buy now').visibleToUser(true).findOne(1000)
            }
            if (addToCart) {
                comm.showLog("找到add-to-cart或buy-now页")
                return true
            }
            //
            return false
        }
    } else {
        comm.showLog("请求返回不为success:" + showcasebody)
        return false
    }
}
//橱窗下单的前缀工作 测试
function orderShowcase_test(taskInfo) {
    comm.showLog("进行橱窗下单")
    let product_title = taskInfo.product_title //商品标题
    let showcase_url = taskInfo.showcase_url //达人橱窗链接
    let showcase_add_url = taskInfo.showcase_add_url //达人橱窗的添加商品的请求
    // 请求一下添加商品
    comm.showLog("商品标题:" + product_title)
    comm.showLog("达人橱窗链接:" + showcase_url)
    comm.showLog("达人橱窗的添加商品的请求:" + showcase_add_url)
    let showcasebody = comm.httpToString(showcase_add_url)
    comm.showLog("请求返回：" + showcasebody)
    if (showcasebody != '') {
        // comm.showLogToFile("请求添加商品的返回：" + body)  //存一下数据库
        let showcaseRep = JSON.parse(showcasebody)
        // 获取返回success，如果不是success
        if (showcaseRep.message != "success") {
            //不等于成功，直接进行普通拉起的逻辑
            return false
        } else {
            //如果添加成功，执行橱窗下单逻辑
            sleep(2000)
            //获取url，通过浏览器的方式打开链接
            openLinkFromBrowser(showcase_url)

            comm.showLogToFile("等待15秒确保网页打开")
            sleep(15000)
            // 打开浏览器
            for (let i = 0; i < 20; i++) {
                let openBtn = selector().textContains('Not now').visibleToUser(true).findOne(1000)
                if (!openBtn) {
                    openBtn = selector().textContains('以后再说').visibleToUser(true).findOne(1000)
                }
                //找到点击按钮
                if (openBtn) {
                    comm.clickObj(openBtn)
                } else {
                    openBtn = selector().textContains('Open TikTok').visibleToUser(true).findOne(1000)
                    if (!openBtn) {
                        openBtn = selector().textContains('Open app').visibleToUser(true).findOne(1000)
                        if (!openBtn) {
                            comm.showLogToFile("没有Open-app" + i)
                            openBtn = selector().textContains('Watch on TikTok').visibleToUser(true).findOne(1000)
                            if (!openBtn) {
                                openBtn = selector().textContains('Continue').className("android.widget.Button").visibleToUser(true).findOne(1000)
                                if (!openBtn) {
                                    openBtn = selector().text('Continue').visibleToUser(true).findOne(1000)
                                }
                            }
                        }
                    }
                    if (openBtn) {
                        comm.clickObj(openBtn)
                    }
                }
                //判断提前中断条件
                if (selector().textContains('Sort by').visibleToUser(true).exists()) {
                    break
                } else {
                    comm.showLog("可能有验证码")
                    sleep(3000)
                    imageCodeVerify_Buy()
                    sleep(2000)
                    //可能有弹窗 Claim
                    closeAllPop()
                }
                //
                sleep(5000)
            }
            // 点击并找排序
            let sortByBtn = selector().textContains('Sort by').visibleToUser(true).findOne(1000)
            if (sortByBtn) {
                comm.showLog("点击Sort-by")
                comm.clickObj(sortByBtn)
                sleep(3000)


                // let creatorBtn = selector().textContains('Creator').visibleToUser(true).findOne(1000)
                // if (creatorBtn) {
                //     comm.showLog("点击Crea-tor-s-choice")
                //     comm.clickObj(creatorBtn)
                //     sleep(3000)
                // } else {
                //     comm.showLog("没有Crea-tor-s-choice")
                //     return false
                // }
                let saveChack = selector().className('android.view.ViewGroup').visibleToUser(true).find()
                if (saveChack) {
                    // comm.showLog(saveChack.length)
                    if (saveChack.length > 2) {
                        // comm.clickObj(saveChack[0]) //不对
                        comm.clickObj(saveChack[1]) //对
                    } else {
                        comm.showLog("没有Crea-tor-s-choice1")
                    }
                } else {
                    comm.showLog("没有Crea-tor-s-choice2")
                }
            } else {
                comm.showLog("没进到Sort-by的店铺首页")
                return false
            }
            // 点一下列表切换
            sortByBtn = selector().textContains('Sort by').visibleToUser(true).findOne(1000)
            if (sortByBtn) {
                sleep(5000)
                click(device.width - 100, sortByBtn.bounds().centerY())
            }
            sleep(5000)
            comm.showLog("找商品")
            for (let i = 0; i < 10; i++) {
                if (i == 9) {
                    comm.showLog("没找到商品")
                    return false
                }
                //
                //找商品
                let productView = selector().textContains(product_title.slice(0, 14)).visibleToUser(true).findOne(1000)
                if (productView) {
                    comm.showLog("找到商品")
                    comm.clickObj(productView)
                    sleep(3000)
                    break
                }
                comm.randomSwipeSlowLong(1)
                sleep(5000)
            }
            //找商品
            // let productView = selector().textContains(product_title.slice(0, 14)).visibleToUser(true).findOne(1000)
            // if (productView) {
            //     comm.showLog("找到商品")
            //     comm.clickObj(productView)
            //     sleep(3000)
            // } else {
            //     comm.showLog("没找到商品")
            //     return false
            // }
            // 理论是打开了buy now和添加购物车页面
            sleep(5000)
            let addToCart = selector().textContains('Add to cart').visibleToUser(true).findOne(1000)
            if (!addToCart) {
                addToCart = selector().textContains('Buy now').visibleToUser(true).findOne(1000)
            }
            if (addToCart) {
                comm.showLog("找到add-to-cart或buy-now页")
                return true
            }
            //
            return false
        }

    }
}


//采购任务之 全托管品类
function orderTask_NoShop(taskInfo) {
    comm.showLog("采购任务[全托管]")
    //
    sleep(3000)
    let openTKMsg = openTiktok_v2() //打开tk
    comm.showLogToFile("openTiktok返回：" + openTKMsg)
    if (openTKMsg == 'success') {
        comm.showLogToFile("openTiktok执行成功")
    } else {
        return openTKMsg
    }
    //
    comm.randomSwipe(3)
    sleep(8000)
    // openTiktok(0)
    // comm.randomSwipe(3)
    // closeAllPop()
    var msg = comm.httpToStringShellContinue(remoteServer + "/admin/api/orderPing?id=" + task_id + "&ordertaskid=" + taskInfo.ordertask_id + "&ordersid=" + orders_id + "&status=1&info=开始任务2")
    if (msg != '成功接收到通知') {
        return "系统断线，停止任务"
    }
    //判断发送消息 0短视频 1关键字 2采购 3直接购买   2采购不发送消息
    if (taskInfo.type != 2) {
        let seller_id = taskInfo.seller_id
        let stxt = taskInfo.stxt
        setSellerText(stxt, seller_id)
        sleep(20000)
        if (selector().textContains('Verify to continue').visibleToUser(true).exists()) {
            comm.showLog("有验证码")
            imageCodeVerify_Buy()
        }
    }
    sleep(5000)
    let homeBtn = selector().textContains('Home').visibleToUser(true).findOne(1000)
    let profileBtn = selector().textContains('Profile').visibleToUser(true).findOne(1000)
    if (homeBtn && profileBtn) {
        comm.showLog("有首页")
    } else {
        back()
    }
    sleep(2000)

    // sleep(6000)
    //先判断是不是在首页
    let product_title = taskInfo.product_title //商品的名称
    let buy_link_title = taskInfo.buy_link_title //商品购买连接标题
    //判断有没有videoid，有videoid
    if (taskInfo.tk_video_id != '') {
        comm.showLog("有video_id")
        // sleep(2000)
        // // 
        // let isV=openVideoProduct(taskInfo.tk_video_id,title_txt)
        // if(!isV){
        //     comm.showLog('拉起视频失败')
        //     return "拉起视频失败"    
        // }else{
        //     comm.showLog('拉起视频成功')
        // }
        sleep(2000)
        //获取url，通过浏览器的方式打开链接
        openLinkFromBrowser(taskInfo.tk_video_id)
        comm.showLog("等待10秒确保网页打开")
        sleep(10000)
        //点击open app
        // for (let i=0;i<5;i++){
        //     if (i == 5){
        //         return "没成功进首页"
        //     }
        //     //
        //     openLinkFromBrowser(taskInfo.tk_video_id)
        //     comm.showLog("等待10秒确保网页打开")
        //     sleep(10000)
        //     //
        //     let reClickJoin = clickBtnJoinTk()
        //     if (reClickJoin == "success"){
        //         break
        //     }
        // }
        //
        for (let i = 0; i < 10; i++) {
            if (i == 9) {
                comm.showLogToFile("从网页打开失败")
                return "从网页打开失败"
            }
            let openBtn = selector().textContains('Not now').visibleToUser(true).findOne(1000)
            if (!openBtn) {
                openBtn = selector().textContains('以后再说').visibleToUser(true).findOne(1000)
            }
            if (openBtn) {
                comm.clickObj(openBtn)
            } else {
                openBtn = selector().textContains('Open TikTok').visibleToUser(true).findOne(1000)
                if (!openBtn) {
                    openBtn = selector().textContains('Open app').visibleToUser(true).findOne(1000)
                    if (!openBtn) {
                        comm.showLog("没有Open-app" + i)
                        openBtn = selector().textContains('Watch on TikTok').visibleToUser(true).findOne(1000)
                        if (!openBtn) {
                            openBtn = selector().textContains('Continue').className("android.widget.Button").visibleToUser(true).findOne(1000)
                            if (!openBtn) {
                                openBtn = selector().text('Continue').visibleToUser(true).findOne(1000)
                            }
                        }
                    }
                }
                if (openBtn) {
                    comm.clickObj(openBtn)
                }
            }
            //
            comm.showLog("判断有没有验证码")
            imageCodeVerify_Buy()
            comm.showLog("验证码结束")
            //
            let reloadBtn = selector().textContains('Reload').visibleToUser(true).findOne(1000)
            if (reloadBtn) {
                if (i == 5 || i == 12) {
                    comm.pullDownRefresh(1)
                    // }else if(i == 8){
                    //     comm.showLog("执行代理")
                    //     let randomStr = generateRandomString(6)
                    //     comm.showLog("执行切换代理")
                    //     httpShell("dg config -a proxy.enabled=false; sleep 2; settings put global package_verifier_enable 0; dg apt install plugin:proxy; dg config -a proxy.enabled=true -a proxy.udp=true -a proxy.dnsType=tcp -a proxy.dns=8.8.8.8 -a proxy.dns2=1.1.1.1 -a proxy.protocol=socks5 -a proxy.host=gate2.ipweb.cc -a proxy.port=7778 -a proxy.user=B_34942_US___5_FH"+randomStr+"tjt -a proxy.pass=191df999")
                    //     sleep(10000)
                } else {
                    //
                    comm.clickObj(reloadBtn)
                }
            }
            //
            let homeBtn = selector().textContains('Home').visibleToUser(true).findOne(1000)
            let profileBtn = selector().textContains('Profile').visibleToUser(true).findOne(1000)
            if (homeBtn && profileBtn) {
                comm.showLog("有首页")
                break
            }
            //
            let VerifyContinue = selector().textContains('Verify to continue:').visibleToUser(true).findOne(1000)
            if (VerifyContinue) {
                comm.showLog("有验证码")
                break
            }
            sleep(5000)
        }
        //
        for (let i = 0; i < 5; i++) {
            let productNotAvailable = selector().textContains('in your country or region').visibleToUser(true).findOne(1000)
            if (productNotAvailable) {
                return "该产品在该国家或地区不可用"
            }
            sleep(1000)
        }
        //默认已经进入首页，检测是否真的在首页
        let homeBtn = selector().textContains('Home').visibleToUser(true).findOne(1000)
        let profileBtn = selector().textContains('Profile').visibleToUser(true).findOne(1000)
        if (homeBtn && profileBtn) {
            comm.showLog("有首页")
        } else {
            //
            comm.showLog("没进首页，有可能有验证码，验证一下")
            imageCodeVerify_Buy()
            comm.showLog("验证码结束")
            let VerifyContinue = selector().textContains('Verify to continue:').visibleToUser(true).findOne(1000)
            if (VerifyContinue) {
                return "验证码不通过"
            }
            //
            comm.showLog("点击一下屏幕中心")
            click(device.width / 2, device.height / 2)
        }
        sleep(2000)
        homeBtn = selector().textContains('Home').visibleToUser(true).findOne(1000)
        profileBtn = selector().textContains('Profile').visibleToUser(true).findOne(1000)
        if (homeBtn && profileBtn) {
            comm.showLog("有首页")
        } else {
            return "没成功进首页"
        }
        msg = comm.httpToStringShellContinue(remoteServer + "/admin/api/orderPing?id=" + task_id + "&ordertaskid=" + taskInfo.ordertask_id + "&ordersid=" + orders_id + "&status=1&info=成功跳转进tk")
        if (msg != '成功接收到通知') {
            return "系统断线，停止任务"
        }
        sleep(5000)
        // 点击短视频-商品的入口，通过商品标题的前15个字符匹配
        let pronBtn = selector().textContains(product_title.slice(0, 15)).visibleToUser(true).findOne(1000)
        if (pronBtn) {
            comm.showLog("找到商品链接按钮")
            comm.clickObj(pronBtn)
        } else {
            comm.showLog("没有找到商品链接按钮")
            return "没有找到商品链接按钮"
        }
        sleep(10000)
        //找到并点击商品按钮
        if (findTheProductLinkBtn(product_title, buy_link_title)) {
            sleep(5000)
            let eligibility = selector().textContains('you must meet the eligibility').visibleToUser(true).findOne(1000)
            if (eligibility) {
                back()
                sleep(2000)
                if (!findTheProductLinkBtn(product_title, buy_link_title)) {
                    comm.showLog("没有找到商品链接按钮")
                    return "没有找到商品链接按钮"
                }
            }
        } else {
            comm.showLog("没有找到商品链接按钮")
            return "没有找到商品链接按钮"
        }
        sleep(20000)
        // 判断有没有滑块验证码
        comm.showLog("判断有没有滑块验证码")
        // imageCodeVerify_my()
        imageCodeVerify_Buy()
        comm.showLog("验证码结束")
        let VerifyContinue = selector().textContains('Verify to continue:').visibleToUser(true).findOne(1000)
        if (VerifyContinue) {
            return "验证码不通过"
        }

    } else {
        comm.showLog("没video_id")
        sleep(2000)
        comm.randomSwipeSlow(1);
        sleep(2000)
        // 重试一下
        let contTag = false
        for (let i = 0; i < 2; i++) {
            let shopBtns = selector().text('Shop').visibleToUser(true).find()
            if (shopBtns) {
                comm.showLog("找到顶部shop按钮" + shopBtns.length)
                if (shopBtns.length == 1) {
                    if (shopBtns[0].bounds().centerY() < 300) {
                        comm.randomSwipeSlow(1)
                        comm.clickObj(shopBtns[0])
                        contTag = true
                        break
                    }
                } else if (shopBtns.length > 1) {
                    for (let j = 0; j < shopBtns.length; j++) {
                        if (shopBtns[j].bounds().centerY() < 300) {
                            comm.randomSwipeSlow(1)
                            comm.clickObj(shopBtns[j])
                            contTag = true
                            break
                        }
                        sleep(3000)
                    }
                } else {
                    //kill掉tk，并启动
                    httpShell('am force-stop com.zhiliaoapp.musically')
                    if (!app.launch('com.zhiliaoapp.musically')) {
                        console.log('App 启动失败')
                        return "tk启动失败"
                    }
                    sleep(10000);
                }
            } else {
                comm.showLog("找不到找到顶部shop按钮")
                //kill掉tk，并启动
                httpShell('am force-stop com.zhiliaoapp.musically')
                if (!app.launch('com.zhiliaoapp.musically')) {
                    console.log('App 启动失败')
                    return "tk启动失败"
                }
                sleep(10000);
            }
            if (contTag) {
                break
            }
        }
        sleep(5000)
        closeAllPop()
        comm.randomSwipeSlow(1)
        //等待网络加载
        for (let i = 0; i < 20; i++) {
            if (i == 19) {
                msg = comm.httpToStringShellContinue(remoteServer + "/admin/api/orderPing?id=" + task_id + "&ordertaskid=" + taskInfo.ordertask_id + "&ordersid=" + orders_id + "&status=1&info=shop页面没有Seach")
                if (msg != '成功接收到通知') {
                    return "系统断线，停止任务"
                }
            }
            sleep(10000)
            //
            // 可能会出现验证码。遇到了变速验证码。判断一下Refresh这个文字刷新是否存在，存在就走常规验证码，不存在但是存在Drag the puzzle piece into place 就走变速验证码
            let verify1 = selector().textContains('erify to continue').visibleToUser(true).exists()
            let verify2 = selector().textContains('Refresh').visibleToUser(true).exists()
            let verify3 = selector().textContains('rag the puzzle piece into place').visibleToUser(true).exists()
            if (verify1 || verify2 || verify3) {
                let verifyMsg = ""
                //说明有验证码
                if (verify2) {
                    comm.showLogToFile("常规滑块验证码")
                    verifyMsg = imageCodeVerify_Buy()
                } else {
                    comm.showLog("变化速率的滑块验证码")
                    verifyMsg = sliderVerificationCode()
                }
                comm.showLog("验证码部分返回：" + verifyMsg)
                closeAllPop()
            }
            if (selector().textContains('Search').visibleToUser(true).exists()) {
                break
            }
            if (selector().textContains('Share').visibleToUser(true).exists()) {
                comm.showLogToFile("大概打开的时候，进入到直播页面中")
                back()
                sleep(5000)
            }
            let tryAgain = selector().textContains('try agin').visibleToUser(true).findOne(1000)
            if (tryAgain) {
                comm.clickObj(tryAgain)
            } else {
                comm.pullDownRefresh(1)

            }
        }
        //获取url，通过浏览器的方式打开链接
        // openLinkFromBrowser(taskInfo.url)
        sleep(5000)

        // //可能直接打开商品的半框、可能直接打开那个搜索框
        // if(selector().textContains('buy now').visibleToUser(true).exists()){

        // }
        for (let i = 0; i < 10; i++) {
            if (i == 9) {
                return "进入商品页面失败"
            }
            sleep(5000)
            comm.pullDownRefresh(1)
            sleep(5000)
            if (i == 0 || i == 8) {
                openProduct(taskInfo.product_no, taskInfo.seller_id)
                comm.showLog("执行了openProduct！！！！！")
                msg = comm.httpToStringShellContinue(remoteServer + "/admin/api/orderPing?id=" + task_id + "&ordertaskid=" + taskInfo.ordertask_id + "&ordersid=" + orders_id + "&status=1&info=执行了openProduct")
                if (msg != '成功接收到通知') {
                    return "系统断线，停止任务"
                }
                sleep(5000)
            }
            sleep(8000)
            //看看会不会出现没网络try again的字样 
            let contTag = false
            for (let j = 0; j < 15; j++) {
                if (j == 14) {
                    sleep(5000)
                    let homeBtn = selector().textContains('Home').visibleToUser(true).findOne(1000)
                    let profileBtn = selector().textContains('Profile').visibleToUser(true).findOne(1000)
                    if (homeBtn && profileBtn) {
                        comm.showLog("有首页")
                    } else {
                        back()
                    }
                    contTag = true
                    break
                }
                if (selector().textContains('Add to cart').visibleToUser(true).exists()) {
                    comm.showLog("有Add to cart")
                    comm.randomSwipe(1)
                    break
                } else if (selector().textContains('try again').visibleToUser(true).exists()) {
                    for (let i = 0; i < 5; i++) {
                        if (selector().textContains('Shop').visibleToUser(true).exists()) {
                            comm.showLog("回到shop页面")
                            break
                        } else {
                            comm.showLog("没有回到shop页面")
                        }
                        back()
                        sleep(3000)
                    }
                } else if (selector().textContains('Verify to continue').visibleToUser(true).exists()) {
                    comm.showLog("有验证码")
                    imageCodeVerify_Buy()
                    sleep(5000)
                    //
                } else {
                    comm.showLog("没有验证码、没有try again" + j)
                    if (selector().textContains('Add to cart').visibleToUser(true).exists()) {
                        break
                    }
                    let selectObjs = selector().textContains(product_title.slice(0, 15)).visibleToUser(true).find()
                    if (selectObjs.length == 0) {
                        comm.showLog("没有匹配项" + j)
                    } else {
                        // comm.clickObj(selectObjs[0])
                        break
                    }
                }
                sleep(5000)
            }
            if (contTag) {
                continue
            }
            // 判断商品匹配项
            sleep(5000)
            contTag = false
            for (let j = 0; j < 15; j++) {
                if (j == 14) {
                    msg = comm.httpToStringShellContinue(remoteServer + "/admin/api/orderPing?id=" + task_id + "&ordertaskid=" + taskInfo.ordertask_id + "&ordersid=" + orders_id + "&status=1&info=商品没有匹配项(重试" + i + ")")
                    if (msg != '成功接收到通知') {
                        return "系统断线，停止任务"
                    }
                    comm.showLog("商品没有匹配项")
                    for (let i = 0; i < 5; i++) {
                        if (selector().textContains('Shop').visibleToUser(true).exists()) {
                            break
                        }
                        back()
                        sleep(3000)
                    }
                    contTag = true
                    break
                }
                //
                let selectObjs = selector().textContains(product_title.slice(0, 20)).visibleToUser(true).find()
                if (selectObjs.length == 0) {
                    comm.showLog("没有匹配项" + j)
                    comm.randomSwipeSlow(1)
                } else if (selectObjs.length == 1) {
                    comm.showLog("有一个匹配项" + j)
                    comm.clickObj(selectObjs[0])
                    sleep(5000)
                    break
                } else if (selectObjs.length > 1) {
                    comm.showLog("有多个匹配项" + j)
                    let isFond = false
                    //可能会存在点到店铺的那个按钮,店铺名称也是同名
                    for (let i = 0; i < selectObjs.length; i++) {
                        if (selectObjs[i].text().includes("Sold by")) {
                            continue
                        } else {
                            comm.clickObj(selectObjs[i])
                            sleep(5000)
                            isFond = true
                            break
                        }
                    }
                    if (!isFond) {
                        comm.clickObj(selectObjs[1])
                        sleep(5000)
                        break
                    } else {
                        break
                    }
                }
                sleep(5000)
            }
            if (contTag) {
                continue
            }
            //判断是否进入商品页面
            sleep(5000)
            contTag = false
            for (let j = 0; j < 15; j++) {
                if (j == 14) {
                    let returnMsg = "没用进入商品页面"
                    if (selector().textContains('Change address').visibleToUser(true).exists()) {
                        returnMsg = "无法送达该地址"
                    } else {
                        returnMsg = "没有进入商品页面(重试" + i + ")"
                    }
                    msg = comm.httpToStringShellContinue(remoteServer + "/admin/api/orderPing?id=" + task_id + "&ordertaskid=" + taskInfo.ordertask_id + "&ordersid=" + orders_id + "&status=1&info=" + returnMsg)
                    if (msg != '成功接收到通知') {
                        return "系统断线，停止任务"
                    }
                    comm.showLogToFile("没有进入商品页面")
                    return returnMsg
                    // for (let i = 0; i < 5; i++) {
                    //     if (selector().textContains('Shop').visibleToUser(true).exists()) {
                    //         break
                    //     }
                    //     back()
                    //     sleep(3000)
                    // }
                    // contTag = true
                    // break
                }
                let addToCart = selector().textContains('Add to cart').visibleToUser(true).findOne(1000)
                if (addToCart) {
                    break
                }
                let goToCart = selector().textContains('Go to cart').visibleToUser(true).findOne(1000)
                if (goToCart) {
                    break
                }
                let VerifyContinue = selector().textContains('Verify to continue:').visibleToUser(true).findOne(1000)
                if (VerifyContinue) {
                    comm.showLog("有验证码")
                    imageCodeVerify_Buy()
                    sleep(5000)
                }
                sleep(5000)
            }
            if (contTag) {
                continue
            } else {
                //如果到这里都还是false，那就中断，说明成功了
                break
            }
            //
        }

        //
        comm.showLog("成功进入商品页面")
        //
    }
    ////////////////////////////////////////////////////////选商品页面///////////////////////////////////////////////////////////////
    //现象出现点进去了别商品（奇怪）
    //到这里为止，已经进入商品详情了
    sleep(10000)
    // comm.randomSwipeSlow(2)
    comm.randomToAndFroSwipe(1)
    sleep(10000)
    imageCodeVerify_Buy()
    sleep(2000)
    // 判断商品标题对不对
    let title_list = selector().textContains(product_title.slice(0, 20)).visibleToUser(true).findOne(1000)
    if (title_list) {
        comm.showLogToFile("匹配到这个标题")
        sleep(1000)
        // comm.clickObj(title_list)
        // title_list=selector().textContains(product_title).visibleToUser(true).findOne(1000)
        // if (title_list){
        //     comm.showLog("完全匹配到这个标题")
        // }
    } else {
        sleep(2000)
        comm.randomSwipeSlow(1)
        title_list = selector().textContains(product_title.slice(0, 20)).visibleToUser(true).findOne(1000)
        if (title_list) {
            comm.showLogToFile("匹配到这个标题")
            sleep(1000)
        } else {
            return "可能没找到标题"
        }
    }
    //判断一下是不是商品被移除
    let beenRem = selector().textContains("This item has been removed").visibleToUser(true).findOne(1000)
    if (beenRem) {
        msg = comm.httpToStringShellContinue(remoteServer + "/admin/api/orderPing?id=" + task_id + "&ordertaskid=" + taskInfo.ordertask_id + "&ordersid=" + orders_id + "&status=1&info=商品被移除（This item has been removed）")
        if (msg != '成功接收到通知') {
            return "系统断线，停止任务"
        }
        return "商品被移除"
    }
    //判断一下有没有限单 (预计送达时间)
    // if (!selector().textContains("Estimated delivery").visibleToUser(true).exists()){
    //     msg = comm.httpToStringShellContinue(remoteServer+"/admin/api/orderPing?id="+task_id+"&ordertaskid="+taskInfo.ordertask_id+"&status=1&info=可能出现限单(Estimated delivery)")
    //     if(msg  != '成功接收到通知'){
    //         return "系统断线，停止任务"
    //     }
    // }
    //判断购买
    if (taskInfo.enter_method == 0) {
        comm.showLog("直接购买")
    } else {
        comm.showLog("进入商家主页进行购买（目前没有）")
    }
    msg = comm.httpToStringShellContinue(remoteServer + "/admin/api/orderPing?id=" + task_id + "&ordertaskid=" + taskInfo.ordertask_id + "&ordersid=" + orders_id + "&status=1&info=找Buy now按钮")
    if (msg != '成功接收到通知') {
        return "系统断线，停止任务"
    }
    sleep(3000)
    comm.randomSwipeSlow(2)
    sleep(10000)
    imageCodeVerify_Buy()
    sleep(5000)
    //新增，判断一下是不是对应的商店，避免限单下错店
    // if (taskInfo.seller_name != null){
    //     let seller_name = taskInfo.seller_name
    //     //
    //     if(taskInfo.seller_name.length > 15){
    //         seller_name = taskInfo.seller_name.slice(0,14)
    //     }
    //     //
    //     let shopHome = selector().textContains('Visit shop').visibleToUser(true).findOne(1000)
    //     if (shopHome){
    //         comm.clickObj(shopHome)
    //         sleep(5000)
    //         if (selector().textContains(seller_name).visibleToUser(true).exists()){
    //             comm.showLog("找到了这家店")
    //             sleep(5000)
    //             back()
    //         }else{
    //             comm.showLog("不是这家店")
    //             msg = comm.httpToStringShellContinue(remoteServer+"/admin/api/orderPing?id="+task_id+"&ordertaskid="+taskInfo.ordertask_id+"&status=1&info=店铺名称没找到")
    //             if(msg  != '成功接收到通知'){
    //                 return "系统断线，停止任务"
    //             }
    //             return "店铺名称没找到"
    //         }
    //     }

    // }
    // sleep(5000)
    //
    //判断一下有没有库存
    beenRem = selector().textContains("This item has been removed").visibleToUser(true).findOne(1000)
    if (beenRem) {
        msg = comm.httpToStringShellContinue(remoteServer + "/admin/api/orderPing?id=" + task_id + "&ordertaskid=" + taskInfo.ordertask_id + "&ordersid=" + orders_id + "&status=1&info=商品被移除（This item has been removed）")
        if (msg != '成功接收到通知') {
            return "系统断线，停止任务"
        }
        return "商品被移除"
    }
    //判断一下有没有限单 (预计送达时间)
    // if (!selector().textContains("Estimated delivery").visibleToUser(true).exists()){
    //     msg = comm.httpToStringShellContinue(remoteServer+"/admin/api/orderPing?id="+task_id+"&ordertaskid="+taskInfo.ordertask_id+"&status=1&info=可能出现限单(Estimated delivery)")
    //     if(msg  != '成功接收到通知'){
    //         return "系统断线，停止任务"
    //     }
    //     return "可能出现限单(Estimated delivery)"
    // }
    //点一下Add to cart，不知道有没有sku的选择
    //的回款
    for (let j = 0; j < 10; j++) {
        if (j == 9) {
            return "没找到Add to cart按钮"
        }
        let buyNow = selector().textContains('Add to cart').findOne(1000)
        if (!buyNow) {
            buyNow = selector().textContains('Go to cart').findOne(1000)
        }
        if (buyNow) {
            comm.showLog("Add to cart/Go to cart按钮存在，点一下")
            comm.clickObj(buyNow)
            sleep(10000)
            imageCodeVerify_Buy()
            //
            buyNow = selector().textContains('Add to cart').findOne(1000)
            if (!buyNow) {
                buyNow = selector().textContains('Go to cart').findOne(1000)
            }
            if (buyNow) {
                comm.clickObj(buyNow)
                //如果还存在，就去选择sku
                sleep(5000)
                //来回滑动一下
                comm.randomToAndFroSwipe()
                //可能会出现选择验证码
                sleep(20000)
                // 判断有没有滑块验证码
                comm.showLog("判断有没有滑块验证码")
                // imageCodeVerify_my()
                imageCodeVerify_Buy()
                comm.showLog("验证码结束")

                let contTag = false
                for (let i = 0; i < 5; i++) {
                    buyNow = selector().textContains('Add to cart').visibleToUser(true).findOne(1000)
                    if (buyNow) {
                        comm.showLog("开始选择sku")
                        // if(doSku(taskInfo.sku_name)){
                        // if (doSku_v2(taskInfo.sku_name)) {
                        if (doSku_v3(taskInfo.sku_name)) {
                            comm.showLog("sku选择成功")
                            contTag = true
                            break
                        } else {
                            comm.showLog("sku选择失败")
                            return "sku选择失败"
                        }
                    } else {
                        let gotucard = selector().textContains('Go to cart').visibleToUser(true).findOne(1000)
                        if (gotucard) {
                            comm.showLog("出现go to cart")
                            contTag = true
                        }
                    }
                    sleep(5000)
                }
                if (contTag) {
                    break
                } else {
                    continue
                }
            }
        } else {
            beenRem = selector().textContains("This item has been removed").visibleToUser(true).findOne(1000)
            if (beenRem) {
                msg = comm.httpToStringShellContinue(remoteServer + "/admin/api/orderPing?id=" + task_id + "&ordertaskid=" + taskInfo.ordertask_id + "&ordersid=" + orders_id + "&status=1&info=商品被移除（This item has been removed）")
                if (msg != '成功接收到通知') {
                    return "系统断线，停止任务"
                }
                return "商品被移除"
            }
            //没找到buy按钮，可能进入了验证码加载
            comm.showLog("可能有验证码")
            sleep(15000)
            imageCodeVerify_Buy()
            sleep(10000)
            if (selector().textContains('Shipped by TikTok').visibleToUser(true).exists()) {
                comm.showLog("进入了购物车页面页面")
                sleep(3000)
                comm.randomToAndFroSwipe(1)
                break
            } else {
                if (j > 6) {
                    for (let i = 0; i < 5; i++) {
                        if (selector().textContains('Add to cart').visibleToUser(true).exists()) {
                            break
                        }
                        if (selector().textContains('Go to cart').visibleToUser(true).exists()) {
                            break
                        }
                        back()
                        sleep(3000)
                    }
                }
            }
        }
        sleep(5000)
    }
    //找到数量输入框 Quantity
    // comm.showLogToFile("输入购买数量")
    // for (let q =0;q<6;q++){
    //     let quant=selector().textContains("Quantity").visibleToUser(true).findOne(1000)
    //     if (quant){
    //         let editTextInput = selector().className('android.widget.EditText').findOne(2000)
    //         if (editTextInput){
    //             comm.clickObj(editTextInput)
    //             sleep(1000)
    //             editTextInput.setText("\b")
    //             sleep(1000)
    //             editTextInput.setText(taskInfo.product_quantity)
    //             break
    //         }
    //     }else{
    //         comm.randomSwipeSlow(1)
    //         sleep(5000)
    //     }
    // }
    sleep(3000)
    //判断一下购物车的checkout页面，并点击
    for (let i = 0; i < 10; i++) {
        if (i == 9) {
            msg = comm.httpToStringShellContinue(remoteServer + "/admin/api/orderPing?id=" + task_id + "&ordertaskid=" + taskInfo.ordertask_id + "&ordersid=" + orders_id + "&status=1&info=没成功进入checkout页")
            if (msg != '成功接收到通知') {
                return "系统断线，停止任务"
            }
            comm.showLog("没成功进入Check-out页")
            return "没成功进入Check-out页"
        }
        comm.pullDownRefresh()  //下拉刷新
        //判断一下添加购物车
        sleep(5000)
        if (selector().textContains('Shipping address').visibleToUser(true).exists()) {
            comm.showLog("已经进入了Check-out页面(判断Shipping-address)")
            break
        }
        if (selector().textContains('Place order').visibleToUser(true).exists()) {
            comm.showLog("已经进入了Check-out页面(判断Place-order)")
            break
        }
        let addToCart = selector().textContains('Add to cart').visibleToUser(true).findOne(1000)
        if (addToCart) {
            comm.showLog("点击一下Add-to-cart")
            comm.clickObj(addToCart)
            sleep(10000)
            let goToCart = selector().textContains('Go to cart').visibleToUser(true).findOne(1000)
            if (goToCart) {
                comm.showLog("点击一下Go-to-cart")
                comm.clickObj(goToCart)
                sleep(10000)
            }
            continue
        }
        //关键人家检查方认不认
        let goToCart = selector().textContains('Go to cart').visibleToUser(true).findOne(1000)
        if (goToCart) {
            comm.showLog("点击一下Go-to-cart")
            comm.clickObj(goToCart)
            sleep(10000)
            continue
        }
        let checkoutBtn = selector().textContains('Checkout').visibleToUser(true).findOne(1000)
        if (checkoutBtn) {
            comm.showLog("点击一下Chec-kout")
            comm.clickObj(checkoutBtn)
            sleep(10000)
            continue
        }
        let continueToCheckoutBtn = selector().textContains('Continue to checkout').visibleToUser(true).findOne(1000)
        if (continueToCheckoutBtn) {
            comm.showLog("点击一下Continue-to-checkout")
            comm.clickObj(continueToCheckoutBtn)
            sleep(10000)
            continue
        }
        //
        comm.showLog("判断有没有滑块验证码")
        imageCodeVerify_Buy()
        comm.showLog("验证码结束")
        comm.randomToAndFroSwipe()//来回滑动一下

        // if (selector().textContains('Shipped by TikTok').visibleToUser(true).exists()){
        //     //
        //     let checkoutBtn=selector().textContains('Checkout').find()
        //     if (checkoutBtn){
        //         //判断一下是不是在画面底部（checkout按钮）
        //         if (checkoutBtn.length == 1){
        //             if (checkoutBtn.bounds().centerY() > device.height-500){
        //                 comm.showLog("点击一下Check-out")
        //                 comm.clickObj(checkoutBtn[0])
        //                 break
        //             }
        //         }else if (checkoutBtn.length > 1){
        //             for (let j = 0;j<checkoutBtn.length;j++){
        //                 comm.showLog("点击一下Chec-kout")
        //                 comm.clickObj(checkoutBtn[j])
        //                 break
        //             }
        //         }
        //     }
        // }
        sleep(8000)
    }
    //
    sleep(8000)
    let checkoutPage = selector().textContains('Checkout').visibleToUser(true).findOne(1000)
    if (!checkoutPage) {
        checkoutPage = selector().textContains('Order summary').visibleToUser(true).findOne(1000)
    }
    if (checkoutPage) {
        comm.showLogToFile("已经进入Check-out页面")
    } else {
        comm.showLogToFile("没有进入Check-out页面")
        return "没有进入Check-out页面"
    }
    //
    comm.showLog("判断有没有滑块验证码")
    imageCodeVerify_Buy()
    comm.showLog("验证码结束")
    comm.randomToAndFroSwipe()
    ////////////////////////////////////////////////////////支付页面///////////////////////////////////////////////////////////////
    //
    msg = comm.httpToStringShellContinue(remoteServer + "/admin/api/orderPing?id=" + task_id + "&ordertaskid=" + taskInfo.ordertask_id + "&ordersid=" + orders_id + "&status=1&info=进入checkout页面")
    if (msg != '成功接收到通知') {
        return "系统断线，停止任务"
    }
    // 检查地址
    // 检查卡号
    // 检查优惠金额
    // 检查支付价格
    let realname = taskInfo.realname.slice(0, 10)
    let card_number = taskInfo.card_number
    let discount = taskInfo.discount
    let max_amount = taskInfo.max_amount
    let ordertask_id = taskInfo.ordertask_id
    let email = taskInfo.email
    let product_quantity = taskInfo.product_quantity  //下单数量
    // comm.randomSwipeSlow(1)
    //
    let order_result = orderAction_my(task_id, "", realname, card_number, discount, max_amount, ordertask_id, email, product_quantity)
    if (order_result == "success") {
        comm.showLogToFile("下单成功,准备滑动和截图")
        comm.randomSwipeSlow(1)
        // 
        sleep(2000)
        for (let i = 0; i < 30; i++) {
            let order_details = selector().textContains('Order details').visibleToUser(true).findOne(1000)
            if (order_details) {
                break
            }
            sleep(2000)
        }
        if (orderFinishAction(task_id)) {
            comm.showLogToFile("滑动和截图成功，发送截图")
            findCapturedImageAndSend()
            //找到并发送订单信息
            findOrderInfoAndSend(taskInfo)
            sleep(8000)
        } else {
            comm.showLog("滑动和截图失败")
            // return "滑动和截图失败"
        }
    } else {
        comm.showLog("下单失败:" + order_result)
        return order_result
    }
    sleep(5000)
    // 
    return "success"
}

//点击按钮跳转tk
function clickBtnJoinTk() {
    //
    for (let i = 0; i < 5; i++) {
        let openBtn = selector().textContains('Not now').visibleToUser(true).findOne(1000)
        if (!openBtn) {
            openBtn = selector().textContains('以后再说').visibleToUser(true).findOne(1000)
        }
        if (openBtn) {
            comm.clickObj(openBtn)
        } else {
            openBtn = selector().textContains('Open app').visibleToUser(true).findOne(1000)
            if (!openBtn) {
                comm.showLog("没有Open-app")
                openBtn = selector().textContains('Watch on TikTok').visibleToUser(true).findOne(1000)
            }
            comm.clickObj(openBtn)
        }
        sleep(3000)
    }
    //
    for (let i = 0; i < 5; i++) {
        let productNotAvailable = selector().textContains('in your country or region').visibleToUser(true).findOne(1000)
        if (productNotAvailable) {
            return "该产品在该国家或地区不可用"
        }
        sleep(1000)
    }
    //默认已经进入首页，检测是否真的在首页
    let homeBtn = selector().textContains('Home').visibleToUser(true).findOne(1000)
    let profileBtn = selector().textContains('Profile').visibleToUser(true).findOne(1000)
    if (homeBtn && profileBtn) {
        comm.showLog("有首页")
        return "success"
    } else {
        //
        comm.showLog("没进首页，有可能有验证码，验证一下")
        imageCodeVerify_Buy()
        comm.showLog("验证码结束")
        let VerifyContinue = selector().textContains('Verify to continue:').visibleToUser(true).findOne(1000)
        if (VerifyContinue) {
            return "验证码不通过"
        }
        comm.showLog("点击一下屏幕中心")
        click(device.width / 2, device.height / 2)
    }
    sleep(2000)
    homeBtn = selector().textContains('Home').visibleToUser(true).findOne(1000)
    profileBtn = selector().textContains('Profile').visibleToUser(true).findOne(1000)
    if (homeBtn && profileBtn) {
        comm.showLog("有首页")
        return "success"
    } else {
        return "没成功进首页"
    }
}

//从浏览器打开链接
function openLinkFromBrowser(url) {
    //获取链接地址
    //拉起浏览器
    let browserPackageName = "com.android.chrome";
    // 创建 Intent 对象
    let intent = new Intent(Intent.ACTION_VIEW);
    intent.setData(android.net.Uri.parse(url));
    // 设置包名，指定浏览器
    intent.setPackage(browserPackageName);
    // 启动浏览器
    app.startActivity(intent);
    //等待足够长的时候等它打开
    sleep(20000)
    // 点击Set Chrome as your defaultbrowser app?的取消
    var joinNowBtn = selector().textContains('CANCEL').visibleToUser(true).findOne(1000)
    if (joinNowBtn) {
        comm.clickObj(joinNowBtn)
    }
    sleep(10000)
    var useWhthoutBtn = selector().textContains('Use without an account').visibleToUser(true).findOne(1000)
    if (useWhthoutBtn) {
        comm.clickObj(useWhthoutBtn)
    }
    //
    return
}

//找到并点击商品按钮
function findTheProductLinkBtn(product_title, buy_link_title) {
    let isViewed = false
    //
    for (let index = 0; index < 5; index++) {

        let click_here_to_buy = selector().textContains('Click here to buy').findOne(3000)
        if (!click_here_to_buy) {
            comm.showLog("没找到click_here_to_buy")
            let shops = selector().textContains('Shop').visibleToUser(true).find()
            for (let i = 0; i < shops.length; i++) {
                let element = shops[i];
                let b = element.bounds()
                if (b.centerX() < 200 && b.centerY() > 1300) {
                    click_here_to_buy = element
                    break
                }
            }
        }
        if (!click_here_to_buy) {
            comm.showLog("没找到click_here_to_buy2")
            click_here_to_buy = selector().textContains('Saving').visibleToUser(true).findOne(3000)
        }
        if (!click_here_to_buy) {
            comm.showLog("没找到click_here_to_buy3")
            click_here_to_buy = selector().textContains('Shop Here').visibleToUser(true).findOne(3000)
        }
        if (!click_here_to_buy) {
            comm.showLog("没找到click_here_to_buy3.1")
            click_here_to_buy = selector().textContains('Spring Sale').visibleToUser(true).findOne(3000)
        }
        if (!click_here_to_buy) {   //找shop  太接近屏幕顶部的shop不要
            comm.showLog("没找到click_here_to_buy4")
            let click_here_to_buy_s = selector().text('Shop').visibleToUser(true).find()
            if (click_here_to_buy_s.length == 1) {
                if (click_here_to_buy_s[0].bounds().centerY() > 1000 && click_here_to_buy_s[0].bounds().centerY() < device.height - (device.height * 0.1)) {
                    click_here_to_buy = click_here_to_buy_s[0]
                }
            } else if (click_here_to_buy_s.length > 1) {
                if (click_here_to_buy_s[0].bounds().centerY() > 1000 && click_here_to_buy_s[0].bounds().centerY() < device.height - (device.height * 0.1)) {
                    click_here_to_buy = click_here_to_buy_s[0]
                } else if (click_here_to_buy_s[1].bounds().centerY() > 1000 && click_here_to_buy_s[1].bounds().centerY() < device.height - (device.height * 0.1)) {
                    click_here_to_buy = click_here_to_buy_s[1]
                }
            }
            // click_here_to_buy=selector().text('Shop').visibleToUser(true).findOne(3000)
        }
        if (!click_here_to_buy) {
            comm.showLog("没找到click_here_to_buy5")
            if (buy_link_title != "") {
                click_here_to_buy = selector().textContains(buy_link_title.slice(0, 8)).visibleToUser(true).findOne(1000)
            }
        }
        if (!click_here_to_buy) {
            comm.showLog("没找到click_here_to_buy6")
            click_here_to_buy = selector().textContains(product_title.slice(0, 8)).visibleToUser(true).findOne(1000)
            if (!click_here_to_buy) {
                click_here_to_buy = selector().textContains(product_title.slice(0, 7)).visibleToUser(true).findOne(1000)
                if (!click_here_to_buy) {
                    click_here_to_buy = selector().textContains(product_title.slice(0, 6)).visibleToUser(true).findOne(1000)
                }
            }

        }
        if (click_here_to_buy) {
            comm.showLog("找到click_here_to_buy系列")
            sleep(2000)
            comm.showLog(click_here_to_buy.text())//打印那个文字
            comm.clickObj(click_here_to_buy)
            isViewed = true
            break
        }
    }
    // click(159,1585)  
    return isViewed
}

// 1、首页推荐：视频浏览，点赞，评论，转发，关注
function interactionInHome(taskInfo) {
    comm.showLog("浏览视频")
    openTiktok(0) //打开tk
    // let opMsg = openTiktok_v2(0) //打开tk
    // if (opMsg == "需要登陆") {
    //     loginJastUserameAndPassword(username, taskInfo.password, taskInfo.password)
    // }
    comm.randomSwipe(3)
    closeAllPop()
    //
    sleep(6000)
    // let actions = ['like', 'comment', 'share', 'follow', 'kong' ,'kong' ,'kong'];
    let watch_count = taskInfo.watch_count      //视频观看数量
    let digg_count = taskInfo.digg_count        //点赞数量
    let comment_count = taskInfo.comment_count  //评论数量
    let share_count = taskInfo.share_count      //转发数量
    let follow_count = taskInfo.follow_count    //关注数量
    //构造一个卡池
    var cardPool = makeActionCardPool(digg_count, comment_count, share_count, follow_count)
    let action_count = digg_count + comment_count + share_count + follow_count
    //组合action数据
    let actions = makeActions(watch_count, cardPool, action_count)
    // console.log(actions)

    //获得 actions
    for (let i = 0; i < actions.length; i++) {

        comm.showLog("进行一轮：" + i)
        //等待五秒，待页面稳定
        sleep(5000)
        //
        let condition = true;
        while (condition) {
            //判断一下是否在首页
            let homeBtn_range = selector().textContains('Home').visibleToUser(true).findOne(1000)
            let profileBtn_range = selector().textContains('Profile').visibleToUser(true).findOne(1000)
            if (homeBtn_range && profileBtn_range) {
                comm.showLogToFile("有首页")
            } else {
                comm.showLogToFile("可能有弹窗")
                closeAllPop()
                sleep(3000)
            }
            let livebtn = selector().textContains('Tap to watch').visibleToUser(true).findOne(1500)
            let viewshopbtn = selector().textContains('View in Shop').visibleToUser(true).findOne(1500)
            let sponsored = selector().textContains('Sponsored').visibleToUser(true).findOne(1500)
            let swipeup = selector().textContains('Swipe up').visibleToUser(true).findOne(1500)
            let notInterested = selector().textContains('Not interested').visibleToUser(true).findOne(1500)
            //
            if (livebtn || viewshopbtn || sponsored || swipeup || notInterested) {
                //不是用户视频
                comm.showLog("不是用户视频，跳过")
                comm.randomSwipe(1)
                sleep(random(5000, 10000))
            } else {
                condition = false
            }
        }
        let btnBox = []     //按钮box
        // 获取按钮控件并筛选组合数据
        while (true) {
            let actionBtns = selector().className("android.widget.Button").visibleToUser(true).find()
            if (actionBtns.length > 6) {
                for (let i = 0; i < actionBtns.length; i++) {
                    if (i < 7) {
                        btnBox.push(actionBtns[i])
                    } else {
                        break
                    }
                }
                break
            } else {
                comm.randomSwipe(1)
            }
        }
        console.log("mark1")
        // for (let i = 0; i < btnBox.length; i++) {
        //     let btnTest = btnBox[i].bounds()
        //     console.log('btnBox:' + btnTest.centerX() + ',' + btnTest.centerY() + "||" + btnTest.right)
        // }
        // console.log("mark2")
        // 使用 Math.abs 确保差值为正数。通过差值的比对，判断一下第一个数据是不是别的按钮控件
        if (Math.abs(btnBox[0].bounds().centerX() - btnBox[1].bounds().centerX()) > 20) {
            comm.showLog("大于20，说明第一个数据不合适，移除")
            btnBox.splice(0, 1);
        } else {
            comm.showLog("小于20，说明第一个数据合适，保留")
        }
        console.log("mark3")
        //关注、点赞、评论、分享 的按钮组合完毕
        for (let j = 0; j < actions[i].length; j++) {

            //
            comm.showLog("开始操作")
            let time = random(9000, 12000)
            //
            let searchbtn = selector().textContains('Search').visibleToUser(true).findOne(1500)
            switch (actions[i][j]) {
                case 'like':
                    comm.showLog("点赞")
                    if (searchbtn) {
                        comm.showLog("有Search！！！")
                        // click(989,1220)
                        // click(1207,1585)
                        comm.clickObj(btnBox[1])
                    } else {
                        comm.showLog("没有Search！！！")
                        // click(989,1320)
                        // click(1207,1685)
                        comm.clickObj(btnBox[1])
                    }
                    break;
                case 'comment':
                    comm.showLog("评论")
                    //
                    let commentbtn = ["😳", "😁", "🥰", "😂"]
                    let randomcomment = commentbtn[random(0, commentbtn.length - 1)];
                    if (searchbtn) {
                        comm.showLog("有Search！！！")
                        // press(989,1401,1000)
                        // press(1205,1796,2000)
                        let bt1 = btnBox[1].bounds()
                        press(bt1.centerX(), bt1.centerY() + 140, 2000) //长按 标记
                        sleep(random(300, 500))
                        // click(randomcomment,1401)
                        // click(randomcomment,1722)
                        let faceIcon = selector().className("android.widget.TextView").text(randomcomment).findOne(1500)
                        if (faceIcon) {
                            comm.clickObj(faceIcon)
                        } else {
                            comm.randomSwipe(1)
                        }
                    } else {
                        comm.showLog("没有Search！！！")
                        // press(989,1507,1000)
                        // press(1205,1896,2000)
                        let bt1 = btnBox[1].bounds()
                        press(bt1.centerX(), bt1.centerY() + 140, 2000) //长按 标记
                        sleep(random(300, 500))
                        // click(randomcomment,1507)
                        // click(randomcomment,1822)
                        let faceIcon = selector().className("android.widget.TextView").text(randomcomment).findOne(1500)
                        if (faceIcon) {
                            comm.clickObj(faceIcon)
                        } else {
                            comm.randomSwipe(1)
                        }
                    }
                    break;
                case 'share':
                    comm.showLog("分享")
                    if (searchbtn) {
                        comm.showLog("有Search！！！")
                        // click(989,1772)
                        // click(1209,2226)
                        let bt1 = btnBox[1].bounds()
                        click(bt1.centerX(), bt1.centerY() + 490)
                        sleep(1000)
                        comm.findTextClick("Copy link")
                    } else {
                        comm.showLog("没有Search！！！")
                        // click(989,1874)
                        // click(1209,2326)
                        let bt1 = btnBox[1].bounds()
                        click(bt1.centerX(), bt1.centerY() + 490)
                        sleep(1000)
                        comm.findTextClick("Copy link")
                    }
                    break;
                case 'follow':
                    comm.showLog("关注")
                    let friendbtn = selector().textContains('Your friend').visibleToUser(true).findOne(1500)
                    if (friendbtn) {
                        comm.randomSwipe(1)
                    } else {
                        if (searchbtn) {
                            comm.showLog("有Search！！！")
                            // click(989,1094)
                            // click(1209,1390)
                            // click(1209,1418)
                            comm.clickObj(btnBox[0])
                        } else {
                            comm.showLog("没有Search！！！")
                            // click(989,1200)
                            // click(1209,1490)
                            // click(1209,1518)
                            comm.clickObj(btnBox[0])
                        }
                    }
                    sleep(1000)
                    //点了之后，出现Message，back一下
                    if (selector().textContains('Message').visibleToUser(true).findOne(1500)) {
                        back()
                    }
                    break;
            }
            sleep(time)
            if (selector().textContains('Add to ').visibleToUser(true).findOne(1500) || selector().textContains('Add commen').visibleToUser(true).findOne(1500)) {
                comm.showLog("进入music了")
                back()
            }
        }
        comm.randomSwipe(1)

    }
    comm.showLog("完成首页浏览")
    return "success"
}

function interactionInHome_v2(taskInfo) {
    comm.showLog("首页推荐")
    //
    comm.randomSwipe(3)
    closeAllPop()
    //
    sleep(6000)
    // let actions = ['like', 'comment', 'share', 'follow', 'kong' ,'kong' ,'kong'];
    let watch_count = taskInfo.watch_count      //视频观看数量
    let digg_count = taskInfo.digg_count        //点赞数量
    let comment_count = taskInfo.comment_count  //评论数量
    let share_count = taskInfo.share_count      //转发数量
    let follow_count = taskInfo.follow_count    //关注数量
    //构造一个卡池
    var cardPool = makeActionCardPool(digg_count, comment_count, share_count, follow_count)
    let action_count = digg_count + comment_count + share_count + follow_count
    //组合action数据
    let actions = makeActions(watch_count, cardPool, action_count)
    // console.log(actions)

    //获得 actions
    for (let i = 0; i < actions.length; i++) {

        comm.showLog("进行一轮：" + i)
        //等待五秒，待页面稳定
        sleep(5000)
        //
        let condition = true;
        while (condition) {
            //判断一下是否在首页
            let homeBtn_range = selector().textContains('Home').visibleToUser(true).findOne(1000)
            let profileBtn_range = selector().textContains('Profile').visibleToUser(true).findOne(1000)
            if (homeBtn_range && profileBtn_range) {
                comm.showLogToFile("有首页")
            } else {
                comm.showLogToFile("可能有弹窗")
                closeAllPop()
                sleep(3000)
            }
            let livebtn = selector().textContains('Tap to watch').visibleToUser(true).findOne(1500)
            let viewshopbtn = selector().textContains('View in Shop').visibleToUser(true).findOne(1500)
            let sponsored = selector().textContains('Sponsored').visibleToUser(true).findOne(1500)
            let swipeup = selector().textContains('Swipe up').visibleToUser(true).findOne(1500)
            let notInterested = selector().textContains('Not interested').visibleToUser(true).findOne(1500)
            //
            if (livebtn || viewshopbtn || sponsored || swipeup || notInterested) {
                //不是用户视频
                comm.showLog("不是用户视频，跳过")
                comm.randomSwipe(1)
                sleep(random(5000, 10000))
            } else {
                condition = false
            }
        }
        let btnBox = []     //按钮box
        // 获取按钮控件并筛选组合数据
        while (true) {
            let actionBtns = selector().className("android.widget.Button").visibleToUser(true).find()
            if (actionBtns.length > 6) {
                for (let i = 0; i < actionBtns.length; i++) {
                    if (i < 7) {
                        btnBox.push(actionBtns[i])
                    } else {
                        break
                    }
                }
                break
            } else {
                comm.randomSwipe(1)
            }
        }
        console.log("mark1")
        // for (let i = 0; i < btnBox.length; i++) {
        //     let btnTest = btnBox[i].bounds()
        //     console.log('btnBox:' + btnTest.centerX() + ',' + btnTest.centerY() + "||" + btnTest.right)
        // }
        // console.log("mark2")
        // 使用 Math.abs 确保差值为正数。通过差值的比对，判断一下第一个数据是不是别的按钮控件
        if (Math.abs(btnBox[0].bounds().centerX() - btnBox[1].bounds().centerX()) > 20) {
            comm.showLog("大于20，说明第一个数据不合适，移除")
            btnBox.splice(0, 1);
        } else {
            comm.showLog("小于20，说明第一个数据合适，保留")
        }
        console.log("mark3")
        //关注、点赞、评论、分享 的按钮组合完毕
        for (let j = 0; j < actions[i].length; j++) {

            //
            comm.showLog("开始操作")
            let time = random(9000, 12000)
            //
            let searchbtn = selector().textContains('Search').visibleToUser(true).findOne(1500)
            switch (actions[i][j]) {
                case 'like':
                    comm.showLog("点赞")
                    if (searchbtn) {
                        comm.showLog("有Search！！！")
                        // click(989,1220)
                        // click(1207,1585)
                        comm.clickObj(btnBox[1])
                    } else {
                        comm.showLog("没有Search！！！")
                        // click(989,1320)
                        // click(1207,1685)
                        comm.clickObj(btnBox[1])
                    }
                    break;
                case 'comment':
                    comm.showLog("评论")
                    //
                    let commentbtn = ["😳", "😁", "🥰", "😂"]
                    let randomcomment = commentbtn[random(0, commentbtn.length - 1)];
                    if (searchbtn) {
                        comm.showLog("有Search！！！")
                        // press(989,1401,1000)
                        // press(1205,1796,2000)
                        let bt1 = btnBox[1].bounds()
                        press(bt1.centerX(), bt1.centerY() + 140, 2000) //长按 标记
                        sleep(random(300, 500))
                        // click(randomcomment,1401)
                        // click(randomcomment,1722)
                        let faceIcon = selector().className("android.widget.TextView").text(randomcomment).findOne(1500)
                        if (faceIcon) {
                            comm.clickObj(faceIcon)
                        } else {
                            comm.randomSwipe(1)
                        }
                    } else {
                        comm.showLog("没有Search！！！")
                        // press(989,1507,1000)
                        // press(1205,1896,2000)
                        let bt1 = btnBox[1].bounds()
                        press(bt1.centerX(), bt1.centerY() + 140, 2000) //长按 标记
                        sleep(random(300, 500))
                        // click(randomcomment,1507)
                        // click(randomcomment,1822)
                        let faceIcon = selector().className("android.widget.TextView").text(randomcomment).findOne(1500)
                        if (faceIcon) {
                            comm.clickObj(faceIcon)
                        } else {
                            comm.randomSwipe(1)
                        }
                    }
                    break;
                case 'share':
                    comm.showLog("分享")
                    if (searchbtn) {
                        comm.showLog("有Search！！！")
                        // click(989,1772)
                        // click(1209,2226)
                        let bt1 = btnBox[1].bounds()
                        click(bt1.centerX(), bt1.centerY() + 490)
                        sleep(1000)
                        comm.findTextClick("Copy link")
                    } else {
                        comm.showLog("没有Search！！！")
                        // click(989,1874)
                        // click(1209,2326)
                        let bt1 = btnBox[1].bounds()
                        click(bt1.centerX(), bt1.centerY() + 490)
                        sleep(1000)
                        comm.findTextClick("Copy link")
                    }
                    break;
                case 'follow':
                    comm.showLog("关注")
                    let friendbtn = selector().textContains('Your friend').visibleToUser(true).findOne(1500)
                    if (friendbtn) {
                        comm.randomSwipe(1)
                    } else {
                        if (searchbtn) {
                            comm.showLog("有Search！！！")
                            // click(989,1094)
                            // click(1209,1390)
                            // click(1209,1418)
                            comm.clickObj(btnBox[0])
                        } else {
                            comm.showLog("没有Search！！！")
                            // click(989,1200)
                            // click(1209,1490)
                            // click(1209,1518)
                            comm.clickObj(btnBox[0])
                        }
                    }
                    sleep(1000)
                    //点了之后，出现Message，back一下
                    if (selector().textContains('Message').visibleToUser(true).findOne(1500)) {
                        back()
                    }
                    break;
            }
            sleep(time)
            if (selector().textContains('Add to ').visibleToUser(true).findOne(1500) || selector().textContains('Add commen').visibleToUser(true).findOne(1500)) {
                comm.showLog("进入music了")
                back()
            }
        }
        comm.randomSwipe(1)

    }
    comm.showLog("完成首页浏览")
    return "success"
}

// 组装actions数据
function makeActions(watch_count, cardPool, action_count) {
    let jj = 1
    if (action_count > watch_count) {
        //如果行为数量大于查看视频的数量
        jj = Math.floor(action_count / watch_count)
        let yj = action_count % watch_count
        if (yj > 0) {
            jj = jj + 1
        }
    } else {
        jj = jj + 1
    }
    // 
    let actions = []
    //组合action数据
    //一共10条数据，每一条在4个行为中随机选择到随机数量的行为，并且一条中选择的行为不重复
    for (let a = 0; a < watch_count; a++) {
        let action = []

        //可能存在，在前期就把卡抽完了，导致后面无卡可抽
        //判断是否要点赞行为 random(0,1)
        let strList = ["like", "comment", "share", "follow"]
        let kachi = []
        for (let i = 0; i < jj; i++) {
            let t = random(0, strList.length - 1)
            kachi.push(strList[t])
            strList.splice(t, 1)
        }
        for (let j = 0; j < kachi.length; j++) {
            switch (kachi[j]) {
                case "like":
                    //点赞行为
                    if (random(0, 1)) {
                        if (cardPool.digg.length > 0) {
                            action.push("like")
                            cardPool.digg.pop()
                        }
                    }
                    break;
                case "comment":
                    //评论行为
                    if (random(0, 1)) {
                        if (cardPool.comment.length > 0) {
                            action.push("comment")
                            cardPool.comment.pop()
                        }
                    }
                    break;
                case "share":
                    //转发行为
                    if (random(0, 1)) {
                        if (cardPool.share.length > 0) {
                            action.push("share")
                            cardPool.share.pop()
                        }
                    }
                    break;
                case "follow":
                    //关注行为
                    if (random(0, 1)) {
                        if (cardPool.follow.length > 0) {
                            action.push("follow")
                            cardPool.follow.pop()
                        }
                    }
                    break;

            }

        }
        //
        actions.push(action)
    }
    return actions
}

// 创建一个卡池
function makeActionCardPool(digg_count, comment_count, share_count, follow_count) {
    //构造一个卡池
    var cardPool = {}
    //
    let dc = []     //点赞数据
    for (let i = 0; i < digg_count; i++) {
        dc.push('like')
    }
    cardPool.digg = dc
    //
    let co = []     //评论数据
    for (let i = 0; i < comment_count; i++) {
        co.push('comment')
    }
    cardPool.comment = co
    //
    let sc = []     //转发数据
    for (let i = 0; i < share_count; i++) {
        sc.push('share')
    }
    cardPool.share = sc
    //
    let fc = []     //关注数据
    for (let i = 0; i < follow_count; i++) {
        fc.push('follow')
    }
    cardPool.follow = fc
    //
    return cardPool
}

// 2、观看直播
function watchLive(taskInfo) {
    sleep(3000)
    comm.showLog("开~-~-~直播")
    openTiktok(0) //打开tk
    // let opMsg = openTiktok_v2(0) //打开tk
    // if (opMsg == "需要登陆") {
    //     loginJastUserameAndPassword(username, taskInfo.password, taskInfo.password)
    // }
    comm.randomSwipe(3)
    closeAllPop()
    //
    for (let i = 0; i < 30; i++) {
        if (i == 29) {
            return "没有成功进入直播间界面"
        }
        if (i == 6 || i == 15) {
            httpShell('am force-stop com.zhiliaoapp.musically')
            sleep(5000)
            openTiktok(0)
            comm.randomSwipe(3)
        }
        sleep(5000)
        comm.showLog("准备点击直播间按钮" + i)
        // click(80,160);//点击直播按钮
        let giftBtn = selector().textContains('Gift').visibleToUser(true).findOne(1000)
        let guestsBtn = selector().textContains('Guests').visibleToUser(true).findOne(1000)
        if (giftBtn && guestsBtn) {
            comm.showLog("判断已经进入了直播间")
            break
        } else {
            let homeBtn = selector().textContains('Home').visibleToUser(true).findOne(1000)
            let profileBtn = selector().textContains('Profile').visibleToUser(true).findOne(1000)
            if (homeBtn && profileBtn) {
                comm.showLog("还在首页，没进直播间，点一下")
                click(80, 160);//点击直播按钮
            }
        }
    }
    sleep(10000)
    let watch_time = taskInfo.watch_time  //剩下浮动30%
    let watch_time_min = watch_time * 0.7
    let watch_time_max = watch_time * 1.3
    //
    for (let ss = 0; ss < 1000; ss++) {
        //等待五秒
        sleep(10000)
        //
        let sx = random(1500, 1600)
        if (device.height < 1500) {
            sx = device.height - random(300, 350)
        }
        //通过buy字段来判断是不是购物直播间
        let buyButton = selector().textContains('Buy').visibleToUser(true).findOne(1000)
        if (buyButton) {
            comm.showLog(ss + '购物直播间，停留')
            sleep(2000)
            //关注一下购物直播间 className = android.widget.TextView   text = Follow
            //有问题的
            let followsBtn = selector().className('android.widget.Button').visibleToUser(true).find()
            if (followsBtn) {
                let btnX = followsBtn[0].bounds().right - 50
                let btnY = followsBtn[0].bounds().centerY()
                click(btnX, btnY)
            }
            sleep(3000)
            //Send Heart Me to
            let shmt = selector().textContains('Send Heart Me to').visibleToUser(true).exists()
            if (shmt) {
                comm.showLog("出现 Send Heart Me to")
                back()
            } else {
                comm.showLog("没有Send Heart Me to")
            }
            // click(559,88)  //Follow按钮
            //
            let sleepTime = random(watch_time_min, watch_time_max)
            // sleep(sleepTime) //观看时长

            // 启动定时任务，每10秒执行一次，sleepTime秒后停止
            // useStartInterval(checkDrawGuess, 20, sleepTime);
            // sleep(sleepTime)
            //
            for (let mytime = 0; mytime < (sleepTime / 10); mytime++) {
                checkDrawGuess()
                sleep(10 * 1000)
            }
        } else {
            // let sleepTimeTest = random(60, 120)
            let sleepTimeTest = random(60, 120)
            comm.showLog(ss + '非购物直播间，' + sleepTimeTest + '秒后跳过')
            // sleep(random(10000, 30000)) 
            // sleep(sleepTimeTest*1000) 
            // comm.randomSwipe(1)
            // 启动定时任务，每20秒执行一次，sleepTime秒后停止
            // useStartInterval(checkDrawGuess, 20, sleepTimeTest*1000);
            // sleep(sleepTimeTest*1000)
            for (let mytime = 0; mytime < (sleepTimeTest / 10); mytime++) {
                checkDrawGuess();
                sleep(10 * 1000)
            }
        }
        comm.randomSwipe(1)
        //
        let homeBtn = selector().textContains('Home').visibleToUser(true).findOne(3000)
        let profileBtn = selector().textContains('Profile').visibleToUser(true).findOne(3000)
        if (homeBtn && profileBtn) {
            click(81, 160);//点击直播按钮
        }
    }
    comm.showLog("看直播结束")
    return "success"
}

function watchLive_v2(taskInfo) {
    sleep(3000)
    comm.showLog("开~-~-~直播")
    //
    comm.randomSwipe(3)
    sleep(8000)
    closeAllPop()
    //
    for (let i = 0; i < 30; i++) {
        if (i == 29) {
            return "没有成功进入直播间界面"
        }
        if (i == 6 || i == 15) {
            httpShell('am force-stop com.zhiliaoapp.musically')
            sleep(5000)
            openTiktok(0)
            comm.randomSwipe(3)
        }
        sleep(5000)
        comm.showLog("准备点击直播间按钮" + i)
        // click(80,160);//点击直播按钮
        let giftBtn = selector().textContains('Gift').visibleToUser(true).findOne(1000)
        let guestsBtn = selector().textContains('Guests').visibleToUser(true).findOne(1000)
        if (giftBtn && guestsBtn) {
            comm.showLog("判断已经进入了直播间")
            break
        } else {
            let homeBtn = selector().textContains('Home').visibleToUser(true).findOne(1000)
            let profileBtn = selector().textContains('Profile').visibleToUser(true).findOne(1000)
            if (homeBtn && profileBtn) {
                comm.showLog("还在首页，没进直播间，点一下")
                click(80, 160);//点击直播按钮
            }
        }
    }
    sleep(10000)
    let watch_time = taskInfo.watch_time  //剩下浮动30%
    let watch_time_min = watch_time * 0.7
    let watch_time_max = watch_time * 1.3
    //
    for (let ss = 0; ss < 1000; ss++) {
        //等待五秒
        sleep(10000)
        //
        let sx = random(1500, 1600)
        if (device.height < 1500) {
            sx = device.height - random(300, 350)
        }
        //通过buy字段来判断是不是购物直播间
        let buyButton = selector().textContains('Buy').visibleToUser(true).findOne(1000)
        if (buyButton) {
            comm.showLog(ss + '购物直播间，停留')
            sleep(2000)
            //关注一下购物直播间 className = android.widget.TextView   text = Follow
            //有问题的
            let followsBtn = selector().className('android.widget.Button').visibleToUser(true).find()
            if (followsBtn) {
                let btnX = followsBtn[0].bounds().right - 50
                let btnY = followsBtn[0].bounds().centerY()
                click(btnX, btnY)
            }
            sleep(3000)
            //Send Heart Me to
            let shmt = selector().textContains('Send Heart Me to').visibleToUser(true).exists()
            if (shmt) {
                comm.showLog("出现 Send Heart Me to")
                back()
            } else {
                comm.showLog("没有Send Heart Me to")
            }
            // click(559,88)  //Follow按钮
            //
            let sleepTime = random(watch_time_min, watch_time_max)
            // sleep(sleepTime) //观看时长

            // 启动定时任务，每10秒执行一次，sleepTime秒后停止
            // useStartInterval(checkDrawGuess, 20, sleepTime);
            // sleep(sleepTime)
            //
            for (let mytime = 0; mytime < (sleepTime / 10); mytime++) {
                checkDrawGuess()
                sleep(10 * 1000)
            }
        } else {
            // let sleepTimeTest = random(60, 120)
            let sleepTimeTest = random(60, 120)
            comm.showLog(ss + '非购物直播间，' + sleepTimeTest + '秒后跳过')
            // sleep(random(10000, 30000)) 
            // sleep(sleepTimeTest*1000) 
            // comm.randomSwipe(1)
            // 启动定时任务，每20秒执行一次，sleepTime秒后停止
            // useStartInterval(checkDrawGuess, 20, sleepTimeTest*1000);
            // sleep(sleepTimeTest*1000)
            for (let mytime = 0; mytime < (sleepTimeTest / 10); mytime++) {
                checkDrawGuess();
                sleep(10 * 1000)
            }
        }
        comm.randomSwipe(1)
        //
        let homeBtn = selector().textContains('Home').visibleToUser(true).findOne(3000)
        let profileBtn = selector().textContains('Profile').visibleToUser(true).findOne(3000)
        if (homeBtn && profileBtn) {
            click(81, 160);//点击直播按钮
        }
    }
    comm.showLog("看直播结束")
    return "success"
}



// 定义函数，每10秒执行一次
function useStartInterval(intervalFunc, intervalTime, stopAfter) {
    // let startTime = new Date().getTime(); // 记录开始时间
    let intervalId = setInterval(intervalFunc, intervalTime * 1000); // 设置定时器
    comm.showLog(intervalId)
    // 设置停止定时器
    setTimeout(() => {
        clearInterval(intervalId); // 清除定时器
        comm.showLog("定时任务已停止"); // 提示任务停止
        // comm.randomSwipe(1);
    }, stopAfter);
}


// 示例：每10秒执行一次的函数
function checkDrawGuess() {
    comm.showLog("直播间定时检测函数")
    if (currentPackage().indexOf('com.zhiliaoapp.musically') == -1) {
        comm.showLog("当前应用不是抖音")
        if (!app.launch('com.zhiliaoapp.musically')) {
            console.log('App 启动失败')
        }
        sleep(3000)
    }
    let dAndG = selector().textContains('Draw & Guess').visibleToUser(true).findOne(1000)
    if (dAndG) {
        comm.showLog("直播间出现了Draw & Guess")
        let dgOK = selector().textContains('OK').className('android.widget.Button').visibleToUser(true).findOne(1000)
        if (dgOK) {
            comm.showLog("找OK，并点击")
            comm.clickObj(dgOK)
        } else {
            back()
        }
    }
    let addToCart = selector().textContains('Add to cart').visibleToUser(true).findOne(1000)
    if (addToCart) {
        comm.showLog("出现Add to cart")
        back()
    }
    let declineBtn = selector().textContains('Decline').className("android.widget.Button").visibleToUser(true).findOne(1000)
    if (declineBtn) {
        comm.showLog("出现连线的邀请，点一下Decline（拒绝）")
        comm.clickObj(declineBtn)
    }
    let subscribeBtn = selector().textContains('Subscribe').className("android.widget.Button").visibleToUser(true).findOne(1000)
    if (subscribeBtn) {
        comm.showLog("出现Subscribe订阅请求")
        back()
    }
    let retryBtn = selector().textContains(' Retry').className("android.widget.Button").visibleToUser(true).findOne(1000)
    if (retryBtn) {
        comm.showLog("出现网络有问题Retry")
        back()
    }
    retryBtn = selector().textContains('Retry').className("android.widget.Button").visibleToUser(true).findOne(1000)
    if (retryBtn) {
        comm.showLog("出现网络有问题Retry")
        comm.clickObj(retryBtn)
    }
    // Swipe up to watch the next LIVE
    let swips = selector().textContains('Swipe up to watch the next').visibleToUser(true).findOne(1000)
    if (swips) {
        comm.showLog("出现Swipe up to watch the next LIVE 直播评价")
        comm.randomSwipe(1)
    }
    //验证码
    let vtc = selector().textContains('Verify to continue').visibleToUser(true).findOne(1000)
    if (vtc) {
        comm.showLog("出现验证码，尝试点一下返回按钮")
        back()
    }

}


// 3、粉丝列表关注
function followFanList(taskInfo) {
    sleep(3000)
    openTiktok(0) //打开tk
    // let opMsg = openTiktok_v2(0) //打开tk
    // if (opMsg == "需要登陆") {
    //     loginJastUserameAndPassword(username, taskInfo.password, taskInfo.password)
    // }
    comm.randomSwipe(3)
    //
    comm.showLog("开~-~-~粉丝列表关注")
    let homebtn = selector().textContains('Home').visibleToUser(true).findOne(1000)
    let profilebtn = selector().textContains('Profile').visibleToUser(true).findOne(1000)
    if (homebtn && profilebtn) {
        //进入个人主页
        comm.findTextClick("Profile")
        sleep(random(3000, 4000))
        closeAllPop()
        sleep(random(3000, 4000))
        closeAllPop()
        sleep(random(2000, 3000))
        comm.findTextClick("Followers")
        sleep(random(7000, 9000))
        let fo_list = selector().textContains("Friends").visibleToUser(true).findOne(1000);
        if (fo_list) {
            // for(i = 0; i < 3; i++){
            for (i = 0; i < taskInfo.follow_count; i++) {
                let followBackButton = selector().textContains("Follow back").visibleToUser(true).findOne(1000);
                if (followBackButton) {
                    comm.findTextAndClickLast("Follow back")
                    comm.showLog("f back");
                } else {
                    let sjs = random(1, 3);
                    comm.showLog("没找到")
                    for (j = 0; j < sjs; j++) {
                        swipe(500, 1500, 500, 800, 300);
                        sleep(random(500, 800));
                    }
                }
            }
        }
    }
    comm.showLog("粉丝列表关注结束")
    return "success"
}

function followFanList_v2(taskInfo) {
    sleep(3000)

    comm.randomSwipe(3)
    sleep(8000)
    closeAllPop()
    //
    comm.showLog("开~-~-~粉丝列表关注")
    let homebtn = selector().textContains('Home').visibleToUser(true).findOne(1000)
    let profilebtn = selector().textContains('Profile').visibleToUser(true).findOne(1000)
    if (homebtn && profilebtn) {
        //进入个人主页
        comm.findTextClick("Profile")
        sleep(random(3000, 4000))
        closeAllPop()
        sleep(random(3000, 4000))
        closeAllPop()
        sleep(random(2000, 3000))
        comm.findTextClick("Followers")
        sleep(random(7000, 9000))
        let fo_list = selector().textContains("Friends").visibleToUser(true).findOne(1000);
        if (fo_list) {
            // for(i = 0; i < 3; i++){
            for (i = 0; i < taskInfo.follow_count; i++) {
                let followBackButton = selector().textContains("Follow back").visibleToUser(true).findOne(1000);
                if (followBackButton) {
                    comm.findTextAndClickLast("Follow back")
                    comm.showLog("f back");
                } else {
                    let sjs = random(1, 3);
                    comm.showLog("没找到")
                    for (j = 0; j < sjs; j++) {
                        swipe(500, 1500, 500, 800, 300);
                        sleep(random(500, 800));
                    }
                }
            }
        }
    }
    comm.showLog("粉丝列表关注结束")
    return "success"
}

//4、推荐帐号关注（Inbox板块）
function followAccountRecommended(taskInfo) {
    sleep(3000)
    let openTKMsg = openTiktok(0) //打开tk
    comm.showLogToFile("openTiktok返回：" + openTKMsg)
    if (openTKMsg == 'success') {
        comm.showLogToFile("openTiktok执行成功")
    } else if (openTKMsg == '还有验证码存在，不成功') {
        return openTKMsg
    } else if (openTKMsg == "重新登陆成功") {
        return openTKMsg
    } else {
        return openTKMsg
    }
    // let opMsg = openTiktok_v2(0) //打开tk
    // if (opMsg == "需要登陆") {
    //     loginJastUserameAndPassword(username, taskInfo.password, taskInfo.password)
    // }
    //
    comm.randomSwipe(3)
    sleep(8000)
    //
    comm.showLog("开~-~-~推荐帐号关注")
    let homebtn = selector().textContains('Home').visibleToUser(true).findOne(1000)
    let profilebtn = selector().textContains('Profile').visibleToUser(true).findOne(1000)
    if (homebtn && profilebtn) {
        comm.findTextClick("Inbox")
        sleep(random(1000, 2000))
        comm.randomToAndFroSwipe()
        sleep(10000)
        closeAllPop()
        comm.findTextClick("New followers")
        sleep(random(1000, 2000))
        // for(i = 0; i < 3; i++){//
        for (i = 0; i < taskInfo.follow_count; i++) {//
            //Add profile photo
            if (selector().textContains("dd profile photo").visibleToUser(true).exists()) {
                back()
            }
            let followBackButton = selector().textContains("Follow").visibleToUser(true).findOne(1000);
            let removebtn = selector().textContains("Remove").visibleToUser(true).findOne(1000);
            if (followBackButton && removebtn) {
                let rb = removebtn.bounds();
                click(rb.centerX() + 500, rb.centerY());
                sleep(random(1000, 2000))
                comm.randomSwipeSlow(1)
                comm.showLog("关注成功");
            } else {
                comm.showLog("没找到，下滑")
                comm.randomSwipeSlow(random(1, 3))
            }
        }
    }
    comm.showLog("推荐帐号关注结束")
    return "success"
}

function followAccountRecommended_v2(taskInfo) {
    sleep(3000)
    comm.randomSwipe(3)
    sleep(8000)
    closeAllPop()
    //
    comm.showLog("开~-~-~推荐帐号关注")
    let homebtn = selector().textContains('Home').visibleToUser(true).findOne(1000)
    let profilebtn = selector().textContains('Profile').visibleToUser(true).findOne(1000)
    if (homebtn && profilebtn) {
        comm.findTextClick("Inbox")
        sleep(random(1000, 2000))
        comm.randomToAndFroSwipe()
        sleep(10000)
        closeAllPop()
        comm.findTextClick("New followers")
        sleep(random(1000, 2000))
        // for(i = 0; i < 3; i++){//
        for (i = 0; i < taskInfo.follow_count; i++) {//
            //Add profile photo
            if (selector().textContains("dd profile photo").visibleToUser(true).exists()) {
                back()
            }
            let followBackButton = selector().textContains("Follow").visibleToUser(true).findOne(1000);
            let removebtn = selector().textContains("Remove").visibleToUser(true).findOne(1000);
            if (followBackButton && removebtn) {
                let rb = removebtn.bounds();
                click(rb.centerX() + 500, rb.centerY());
                sleep(random(1000, 2000))
                comm.randomSwipeSlow(1)
                comm.showLog("关注成功");
            } else {
                comm.showLog("没找到，下滑")
                comm.randomSwipeSlow(random(1, 3))
            }
        }
    }
    comm.showLog("推荐帐号关注结束")
    return "success"
}


// 5、Profile View关注,个人足迹查看和关注
function profileView(taskInfo) {
    openTiktok(0) //打开tk
    // let opMsg = openTiktok_v2(0) //打开tk
    // if (opMsg == "需要登陆") {
    //     loginJastUserameAndPassword(username, taskInfo.password, taskInfo.password)
    // }
    comm.randomSwipe(3)
    // 点击个人主页
    var pf = selector().textContains('Profile').visibleToUser(true).findOne(2000)
    let count = taskInfo.follow_count
    if (pf) {
        comm.clickObj(pf)
        sleep(10000);
        let futBtn = selector().className('android.widget.Button').visibleToUser(true).find()
        if (selector().textContains('Add name').visibleToUser(true).exists()) {
            //有add name，足迹按钮在第三个
            comm.clickObj(futBtn[2])
        } else {
            comm.clickObj(futBtn[1])
        }

        sleep(2000)
        // 检查Profile views
        var pfv = selector().textContains('Profile views').visibleToUser(true).findOne(2000)
        if (pfv) {
            var follow = selector().className('android.widget.Button').textContains('Follow').visibleToUser(true).find();
            if (follow) {
                comm.showLog("找到follow")
                if (follow.length > count) {
                    for (let i = 0; i < count; i++) {
                        comm.clickObj(follow[i]);
                        // comm.showLog("点一下")
                        sleep(1000);
                    }
                } else if (0 > follow.length > count) {
                    follow.forEach(function (child) {
                        comm.clickObj(child);
                        // comm.showLog("点一下")
                        sleep(1000);
                    });
                }
                back();
                return "success"  //成功
            } else {
                comm.showLog("找不到follow")
                return "找不到follow"
            }
        } else {
            return "没进入足迹页"
        }
    } else {
        return "没找到个人主页"
    }
}

function profileView_v2(taskInfo) {
    sleep(3000)
    //
    comm.randomSwipe(3)
    sleep(8000)
    closeAllPop()
    // 点击个人主页
    var pf = selector().textContains('Profile').visibleToUser(true).findOne(2000)
    let count = taskInfo.follow_count
    if (pf) {
        comm.clickObj(pf)
        sleep(10000);
        let futBtn = selector().className('android.widget.Button').visibleToUser(true).find()
        if (selector().textContains('Add name').visibleToUser(true).exists()) {
            //有add name，足迹按钮在第三个
            comm.clickObj(futBtn[2])
        } else {
            comm.clickObj(futBtn[1])
        }

        sleep(2000)
        // 检查Profile views
        var pfv = selector().textContains('Profile views').visibleToUser(true).findOne(2000)
        if (pfv) {
            var follow = selector().className('android.widget.Button').textContains('Follow').visibleToUser(true).find();
            if (follow) {
                comm.showLog("找到follow")
                if (follow.length > count) {
                    for (let i = 0; i < count; i++) {
                        comm.clickObj(follow[i]);
                        // comm.showLog("点一下")
                        sleep(1000);
                    }
                } else if (0 > follow.length > count) {
                    follow.forEach(function (child) {
                        comm.clickObj(child);
                        // comm.showLog("点一下")
                        sleep(1000);
                    });
                }
                back();
                return "success"  //成功
            } else {
                comm.showLog("找不到follow")
                return "找不到follow"
            }
        } else {
            return "没进入足迹页"
        }
    } else {
        return "没找到个人主页"
    }
}


function findShopTextByShop() {
    let contTag = false
    let shopBtns = selector().text('Shop').visibleToUser(true).find()
    if (shopBtns) {
        comm.showLogToFile("找到顶部shop按钮" + shopBtns.length)
        if (shopBtns.length == 1) {
            //找shop，只有一个就点一个
            if (shopBtns[0].bounds().centerY() < 300) {
                comm.randomSwipeSlow(1)
                comm.clickObj(shopBtns[0])
                contTag = true
                return contTag
            }
        } else if (shopBtns.length > 1) {
            //找shop，有多个就找靠近顶部的
            for (let j = 0; j < shopBtns.length; j++) {
                if (shopBtns[j].bounds().centerY() < 300) {
                    comm.randomSwipeSlow(1)
                    comm.clickObj(shopBtns[j])
                    contTag = true
                    return contTag
                }
                //找靠近底部的
                if (shopBtns[j].bounds().centerY() > device.height - 300) {
                    comm.randomSwipeSlow(1)
                    comm.clickObj(shopBtns[j])
                    contTag = true
                    return contTag
                }
                sleep(3000)
            }

        } else {
            //kill掉tk，并启动
            httpShell('am force-stop com.zhiliaoapp.musically')
            if (!app.launch('com.zhiliaoapp.musically')) {
                console.log('App 启动失败')
                return "tk启动失败"
            }
            sleep(10000);
        }
    } else {
        comm.showLogToFile("找不到找到顶部shop按钮")
    }
    if (contTag) {
        return contTag
    }
}

//6、商城浏览（随机查看几个产品）
function whactShop(taskInfo) {
    sleep(3000)
    let openTKMsg = openTiktok(0) //打开tk
    comm.showLogToFile("openTiktok返回：" + openTKMsg)
    if (openTKMsg == 'success') {
        comm.showLogToFile("openTiktok执行成功")
    } else if (openTKMsg == '还有验证码存在，不成功') {
        return openTKMsg
    } else if (openTKMsg == "重新登陆成功") {
        return openTKMsg
    } else {
        return openTKMsg
    }
    // let opMsg = openTiktok_v2(0) //打开tk
    // if (opMsg == "需要登陆") {
    //     loginJastUserameAndPassword(username, taskInfo.password, taskInfo.password)
    // }
    comm.randomSwipe(3)
    sleep(8000)

    //
    comm.showLog("开~-~-~商城浏览（随机查看几个产品）")
    for (let j = 0; j < 30; j++) {
        if (j == 29) {
            return "没有成功进入shop界面，显示Please try again之类"
        }
        if (j == 6 || j == 15) {
            httpShell('am force-stop com.zhiliaoapp.musically')
            sleep(5000)
            openTiktok(0)
            comm.randomSwipe(3)
        }
        sleep(5000)
        closeAllPop()
        //
        let homebtn = selector().textContains('Home').visibleToUser(true).findOne(1000)
        let profilebtn = selector().textContains('Profile').visibleToUser(true).findOne(1000)
        if (homebtn && profilebtn) {
            if (!findShopTextByShop()) {
                comm.findTextClick("Shop")
            }
            sleep(10000)
            closeAllPop()
        }
        //
        let pta = selector().textContains('Please try again').visibleToUser(true).exists()
        let tal = selector().textContains('Try again later').visibleToUser(true).exists()
        if (pta || tal) {
            let retryBtn = selector().className('android.widget.Button').text('Retry').visibleToUser(true).findOne(1000)
            if (retryBtn) {
                comm.showLog("opentk,点一下Retry")
                comm.clickObj(retryBtn)
            }
        } else {
            break
        }
    }
    let homeBtn = selector().textContains('Home').visibleToUser(true).findOne(1000)
    if (!homeBtn) {
        return "没进入首页"
    }
    //说明进来了
    for (let i = 0; i < taskInfo.watch_count; i++) {
        //有时候会出现 加载不出来，然后一直刷新的情况
        sleep(1000)
        comm.randomSwipeSlow(random(3, 5))
        sleep(3000)
        comm.findTextClick("sold")
        comm.randomSwipeSlow(random(1, 3))
        swipe(random(550, 600), random(1800, 2000), random(550, 600), random(300, 500), random(6000, 8000))
        let addto = selector().textContains("Add to ").visibleToUser(true).findOne(1000);
        let buyno = selector().textContains("Buy now").visibleToUser(true).findOne(1000);
        if (addto || buyno) {
            sleep(2000)
            back()
        }
    }

    comm.showLog("商城浏览结束")
    return "success"
}
function whactShop_v2(taskInfo) {
    sleep(3000)
    //
    comm.randomSwipe(3)
    sleep(8000)
    closeAllPop()
    //
    comm.showLog("开~-~-~商城浏览（随机查看几个产品）")
    for (let j = 0; j < 30; j++) {
        if (j == 29) {
            return "没有成功进入shop界面，显示Please try again之类"
        }
        if (j == 6 || j == 15) {
            httpShell('am force-stop com.zhiliaoapp.musically')
            sleep(5000)
            openTiktok(0)
            comm.randomSwipe(3)
        }
        sleep(5000)
        closeAllPop()
        //
        let homebtn = selector().textContains('Home').visibleToUser(true).findOne(1000)
        let profilebtn = selector().textContains('Profile').visibleToUser(true).findOne(1000)
        if (homebtn && profilebtn) {
            if (!findShopTextByShop()) {
                comm.findTextClick("Shop")
            }
            sleep(10000)
            closeAllPop()
        }
        //
        let pta = selector().textContains('Please try again').visibleToUser(true).exists()
        let tal = selector().textContains('Try again later').visibleToUser(true).exists()
        if (pta || tal) {
            let retryBtn = selector().className('android.widget.Button').text('Retry').visibleToUser(true).findOne(1000)
            if (retryBtn) {
                comm.showLog("opentk,点一下Retry")
                comm.clickObj(retryBtn)
            }
        } else {
            break
        }
    }
    let homeBtn = selector().textContains('Home').visibleToUser(true).findOne(1000)
    if (!homeBtn) {
        return "没进入首页"
    }
    //说明进来了
    for (let i = 0; i < taskInfo.watch_count; i++) {
        //有时候会出现 加载不出来，然后一直刷新的情况
        sleep(1000)
        comm.randomSwipeSlow(random(3, 5))
        sleep(3000)
        comm.findTextClick("sold")
        comm.randomSwipeSlow(random(1, 3))
        swipe(random(550, 600), random(1800, 2000), random(550, 600), random(300, 500), random(6000, 8000))
        let addto = selector().textContains("Add to ").visibleToUser(true).findOne(1000);
        let buyno = selector().textContains("Buy now").visibleToUser(true).findOne(1000);
        if (addto || buyno) {
            sleep(2000)
            back()
        }
    }

    comm.showLog("商城浏览结束")
    return "success"
}

//7、已关注帐号：视频浏览，点赞，评论，转发，关注
function followedAccount(taskInfo) {
    comm.showLog("浏览视频2")
    openTiktok(0) //打开tk
    // let opMsg = openTiktok_v2(0) //打开tk
    // if (opMsg == "需要登陆") {
    //     loginJastUserameAndPassword(username, taskInfo.password, taskInfo.password)
    // }
    comm.randomSwipe(3)
    //
    sleep(6000)
    comm.findTextClick("Following")
    //
    let watch_count = taskInfo.watch_count      //视频观看数量
    let digg_count = taskInfo.digg_count        //点赞数量
    let comment_count = taskInfo.comment_count  //评论数量
    let share_count = taskInfo.share_count      //转发数量
    let follow_count = 0    //关注数量
    //构造一个卡池
    var cardPool = makeActionCardPool(digg_count, comment_count, share_count, follow_count)
    // 
    //组合action数据
    let actions = makeActions(watch_count, cardPool)

    //获得actions
    for (let i = 0; i < actions.length; i++) {
        comm.showLog("进行一轮：" + i)
        //等待五秒，待页面稳定
        sleep(3000)
        //
        let condition = true;
        while (condition) {
            //判断一下是否在首页
            let homeBtn_range = selector().textContains('Home').visibleToUser(true).findOne(1000)
            let profileBtn_range = selector().textContains('Profile').visibleToUser(true).findOne(1000)
            if (homeBtn_range && profileBtn_range) {
                comm.showLogToFile("有首页")
            } else {
                comm.showLogToFile("可能有弹窗")
                closeAllPop()
                sleep(3000)
            }
            let livebtn = selector().textContains('Tap to watch').visibleToUser(true).findOne(1500)
            let viewshopbtn = selector().textContains('View in Shop').visibleToUser(true).findOne(1500)
            let sponsored = selector().textContains('Sponsored').visibleToUser(true).findOne(1500)
            let swipeup = selector().textContains('Swipe up').visibleToUser(true).findOne(1500)
            let notInterested = selector().textContains('Not interested').visibleToUser(true).findOne(1500)
            //
            if (livebtn || viewshopbtn || sponsored || swipeup || notInterested) {
                //不是用户视频
                comm.showLog("不是用户视频，跳过")
                if (notInterested) {
                    comm.showLog("出现Not interested")
                    back()
                    sleep(1000)
                }
                comm.randomSwipe(1)
                sleep(random(2000, 3000))
            } else {
                condition = false
            }
        }
        let btnBox = []     //按钮box
        // 获取按钮控件并筛选组合数据
        while (true) {
            let actionBtns = selector().className("android.widget.Button").visibleToUser(true).find()
            if (actionBtns.length > 5) {
                for (let i = 0; i < actionBtns.length; i++) {
                    if (i < 7) {
                        btnBox.push(actionBtns[i])
                    } else {
                        break
                    }
                }
                break
            } else {
                comm.randomSwipe(1)
            }
        }
        // for (let i = 0; i < btnBox.length; i++) {
        //     let btnTest = btnBox[i].bounds()
        //     console.log('btnBox:' + btnTest.centerX() + ',' + btnTest.centerY() + "||" + btnTest.right)
        // }
        // 使用 Math.abs 确保差值为正数。通过差值的比对，判断一下第一个数据是不是别的按钮控件
        if (Math.abs(btnBox[0].bounds().centerX() - btnBox[1].bounds().centerX()) > 20) {
            comm.showLog("大于20，说明第一个数据不合适，移除")
            btnBox.splice(0, 1);
        } else {
            comm.showLog("小于20，说明第一个数据合适，保留")
        }
        if (Math.abs(btnBox[4].bounds().centerX() - btnBox[5].bounds().centerX()) > 20) {
            comm.showLog("大于20，说明没有私信，保留")
        } else {
            comm.showLog("小于20，说明有私信，移除")
            btnBox.splice(0, 1);
        }
        //关注、点赞、评论、分享 的按钮组合完毕
        for (let j = 0; j < actions[i].length; j++) {
            //
            comm.showLog("开始操作")
            let time = random(8000, 11000)
            //
            let searchbtn = selector().textContains('Search').visibleToUser(true).findOne(1500)
            switch (actions[i][j]) {
                case 'like':
                    comm.showLog("点赞")
                    if (searchbtn) {
                        comm.showLog("有Search！！！")
                        // click(989,1220)
                        // click(1207,1585)
                        comm.clickObj(btnBox[0])
                    } else {
                        comm.showLog("没有Search！！！")
                        // click(989,1320)
                        // click(1207,1685)
                        comm.clickObj(btnBox[0])
                    }
                    break;
                case 'comment':
                    comm.showLog("评论")
                    //
                    let commentbtn = ["😳", "😁", "🥰", "😂"]
                    let randomcomment = commentbtn[random(0, commentbtn.length - 1)];
                    if (searchbtn) {
                        comm.showLog("有Search！！！")
                        // press(989,1401,1000)
                        // press(1205,1796,2000)
                        let bt1 = btnBox[0].bounds()
                        press(bt1.centerX(), bt1.centerY() + 140, 2000) //长按 标记

                        sleep(random(300, 500))
                        // click(randomcomment,1401)
                        // click(randomcomment,1722)
                        let faceIcon = selector().className("android.widget.TextView").text(randomcomment).findOne(1500)
                        if (faceIcon) {
                            comm.clickObj(faceIcon)
                        } else {
                            comm.randomSwipe(1)
                        }
                    } else {
                        comm.showLog("没有Search！！！")
                        // press(989,1507,1000)
                        // press(1205,1896,2000)
                        let bt1 = btnBox[0].bounds()
                        press(bt1.centerX(), bt1.centerY() + 140, 2000) //长按 标记
                        sleep(random(300, 500))
                        // click(randomcomment,1507)
                        // click(randomcomment,1822)
                        let faceIcon = selector().className("android.widget.TextView").text(randomcomment).findOne(1500)
                        if (faceIcon) {
                            comm.clickObj(faceIcon)
                        } else {
                            comm.randomSwipe(1)
                        }
                    }
                    break;
                case 'share':
                    comm.showLog("分享")
                    if (searchbtn) {
                        comm.showLog("有Search！！！")
                        // click(989,1772)
                        // click(1209,2226)
                        let bt1 = btnBox[0].bounds()
                        click(bt1.centerX(), bt1.centerY() + 490)
                        sleep(1000)
                        comm.findTextClick("Copy link")
                    } else {
                        comm.showLog("没有Search！！！")
                        // click(989,1874)
                        // click(1209,2326)
                        let bt1 = btnBox[0].bounds()
                        click(bt1.centerX(), bt1.centerY() + 490)
                        sleep(1000)
                        comm.findTextClick("Copy link")
                    }

                    break;
            }
            sleep(time)

        }
        comm.randomSwipe(1)

    }
    comm.showLog("完成已关注帐号浏览")
    return "success"
}

function followedAccount_v2(taskInfo) {
    comm.showLog("浏览视频2")

    comm.randomSwipe(3)
    //
    sleep(8000)
    closeAllPop()
    //
    comm.findTextClick("Following")
    //
    let watch_count = taskInfo.watch_count      //视频观看数量
    let digg_count = taskInfo.digg_count        //点赞数量
    let comment_count = taskInfo.comment_count  //评论数量
    let share_count = taskInfo.share_count      //转发数量
    let follow_count = 0    //关注数量
    //构造一个卡池
    var cardPool = makeActionCardPool(digg_count, comment_count, share_count, follow_count)
    // 
    //组合action数据
    let actions = makeActions(watch_count, cardPool)

    //获得actions
    for (let i = 0; i < actions.length; i++) {
        comm.showLog("进行一轮：" + i)
        //等待五秒，待页面稳定
        sleep(3000)
        //
        let condition = true;
        while (condition) {
            //判断一下是否在首页
            let homeBtn_range = selector().textContains('Home').visibleToUser(true).findOne(1000)
            let profileBtn_range = selector().textContains('Profile').visibleToUser(true).findOne(1000)
            if (homeBtn_range && profileBtn_range) {
                comm.showLogToFile("有首页")
            } else {
                comm.showLogToFile("可能有弹窗")
                closeAllPop()
                sleep(3000)
            }
            let livebtn = selector().textContains('Tap to watch').visibleToUser(true).findOne(1500)
            let viewshopbtn = selector().textContains('View in Shop').visibleToUser(true).findOne(1500)
            let sponsored = selector().textContains('Sponsored').visibleToUser(true).findOne(1500)
            let swipeup = selector().textContains('Swipe up').visibleToUser(true).findOne(1500)
            let notInterested = selector().textContains('Not interested').visibleToUser(true).findOne(1500)
            //
            if (livebtn || viewshopbtn || sponsored || swipeup || notInterested) {
                //不是用户视频
                comm.showLog("不是用户视频，跳过")
                if (notInterested) {
                    comm.showLog("出现Not interested")
                    back()
                    sleep(1000)
                }
                comm.randomSwipe(1)
                sleep(random(2000, 3000))
            } else {
                condition = false
            }
        }
        let btnBox = []     //按钮box
        // 获取按钮控件并筛选组合数据
        while (true) {
            let actionBtns = selector().className("android.widget.Button").visibleToUser(true).find()
            if (actionBtns.length > 5) {
                for (let i = 0; i < actionBtns.length; i++) {
                    if (i < 7) {
                        btnBox.push(actionBtns[i])
                    } else {
                        break
                    }
                }
                break
            } else {
                comm.randomSwipe(1)
            }
        }
        // for (let i = 0; i < btnBox.length; i++) {
        //     let btnTest = btnBox[i].bounds()
        //     console.log('btnBox:' + btnTest.centerX() + ',' + btnTest.centerY() + "||" + btnTest.right)
        // }
        // 使用 Math.abs 确保差值为正数。通过差值的比对，判断一下第一个数据是不是别的按钮控件
        if (Math.abs(btnBox[0].bounds().centerX() - btnBox[1].bounds().centerX()) > 20) {
            comm.showLog("大于20，说明第一个数据不合适，移除")
            btnBox.splice(0, 1);
        } else {
            comm.showLog("小于20，说明第一个数据合适，保留")
        }
        if (Math.abs(btnBox[4].bounds().centerX() - btnBox[5].bounds().centerX()) > 20) {
            comm.showLog("大于20，说明没有私信，保留")
        } else {
            comm.showLog("小于20，说明有私信，移除")
            btnBox.splice(0, 1);
        }
        //关注、点赞、评论、分享 的按钮组合完毕
        for (let j = 0; j < actions[i].length; j++) {
            //
            comm.showLog("开始操作")
            let time = random(8000, 11000)
            //
            let searchbtn = selector().textContains('Search').visibleToUser(true).findOne(1500)
            switch (actions[i][j]) {
                case 'like':
                    comm.showLog("点赞")
                    if (searchbtn) {
                        comm.showLog("有Search！！！")
                        // click(989,1220)
                        // click(1207,1585)
                        comm.clickObj(btnBox[0])
                    } else {
                        comm.showLog("没有Search！！！")
                        // click(989,1320)
                        // click(1207,1685)
                        comm.clickObj(btnBox[0])
                    }
                    break;
                case 'comment':
                    comm.showLog("评论")
                    //
                    let commentbtn = ["😳", "😁", "🥰", "😂"]
                    let randomcomment = commentbtn[random(0, commentbtn.length - 1)];
                    if (searchbtn) {
                        comm.showLog("有Search！！！")
                        // press(989,1401,1000)
                        // press(1205,1796,2000)
                        let bt1 = btnBox[0].bounds()
                        press(bt1.centerX(), bt1.centerY() + 140, 2000) //长按 标记

                        sleep(random(300, 500))
                        // click(randomcomment,1401)
                        // click(randomcomment,1722)
                        let faceIcon = selector().className("android.widget.TextView").text(randomcomment).findOne(1500)
                        if (faceIcon) {
                            comm.clickObj(faceIcon)
                        } else {
                            comm.randomSwipe(1)
                        }
                    } else {
                        comm.showLog("没有Search！！！")
                        // press(989,1507,1000)
                        // press(1205,1896,2000)
                        let bt1 = btnBox[0].bounds()
                        press(bt1.centerX(), bt1.centerY() + 140, 2000) //长按 标记
                        sleep(random(300, 500))
                        // click(randomcomment,1507)
                        // click(randomcomment,1822)
                        let faceIcon = selector().className("android.widget.TextView").text(randomcomment).findOne(1500)
                        if (faceIcon) {
                            comm.clickObj(faceIcon)
                        } else {
                            comm.randomSwipe(1)
                        }
                    }
                    break;
                case 'share':
                    comm.showLog("分享")
                    if (searchbtn) {
                        comm.showLog("有Search！！！")
                        // click(989,1772)
                        // click(1209,2226)
                        let bt1 = btnBox[0].bounds()
                        click(bt1.centerX(), bt1.centerY() + 490)
                        sleep(1000)
                        comm.findTextClick("Copy link")
                    } else {
                        comm.showLog("没有Search！！！")
                        // click(989,1874)
                        // click(1209,2326)
                        let bt1 = btnBox[0].bounds()
                        click(bt1.centerX(), bt1.centerY() + 490)
                        sleep(1000)
                        comm.findTextClick("Copy link")
                    }

                    break;
            }
            sleep(time)

        }
        comm.randomSwipe(1)

    }
    comm.showLogToFile("完成已关注帐号浏览")
    return "success"
}

// 8、自己发布视频的点赞和评论用户进行关注
function videoLikesAndUserAttention(taskInfo) {
    openTiktok(0) //打开tk
    // let opMsg = openTiktok_v2(0) //打开tk
    // if (opMsg == "需要登陆") {
    //     loginJastUserameAndPassword(username, taskInfo.password, taskInfo.password)
    // }
    comm.randomSwipe(3)
    sleep(2000)
    //
    let attempts = 0;
    let errMsg = "失败"
    let count = taskInfo.follow_count
    // (不进自己首页)
    while (attempts < 5) {
        //滑动两次
        comm.randomSwipe(2)
        // 点开自己的视频(通过视频id拉起)
        app.startActivity({
            action: "android.intent.action.VIEW",
            data: "snssdk1233://aweme/detail/" + taskInfo.video_id + "?refer=web&gd_label=click_wap_top_banner&page_name=reflow_videor",
            // data:"snssdk1233://webview?url=https%3A%2F%2Fwww.tiktok.com%2Ft%2FZP8Fr9vTD%2F&from=webview&refer=web", 
            packageName: "com.zhiliaoapp.musically",

        });
        // 等待两秒，确保视频已经打开
        sleep(2000);
        // 检查是否存在Privacy settings
        var checkPs = selector().textContains('Privacy settings').visibleToUser(true).findOne(2000)
        if (checkPs) {
            // 存在，说明进来了
            comm.showLog("进来了")
            sleep(5000)
            // click(1200,1940)
            let plBtn = selector().className("android.widget.Button").visibleToUser(true).find()
            if (plBtn) {
                comm.clickObj(plBtn[1])
            }
            sleep(2000)
            var element = selector().visibleToUser(true).className('android.widget.TextView').find();
            if (element) {
                // console.log("Text:", element.text()); // 获取元素的文本内容
                // console.log("Id:", element.id()); // 获取元素的id（如果存在）
                // console.log("Class Name:", element.className()); // 获取元素的类名（如果存在）
                // console.log("Bounds:", element.bounds()); // 获取元素的位置和大小信息（例如：{left: 10, top: 20, right: 100, bottom: 50}）
                // //  
                // var parentElement = element.parent(); //获取父级元素
                // // 打印父元素的标签名
                // console.log("parentElement tagName:", parentElement.className()); //android.widget.FrameLayout
                // comm.clickObj(element)
                // 
                comm.showLog("找到")
                sleep(2000)
                // 第一个是评论，第二个是点赞
                element.forEach(function (child) {
                    console.log(child.text());
                    console.log(child.className());
                });
                comm.clickObj(element[1])
                // 
                sleep(1000)
                comm.showLog("找follow")
                // 找到follow按钮，看看一共有几个，如果少于三个，就全部点，如果大于三个，就点三个
                var follow = selector().className('android.widget.Button').textContains('Follow').visibleToUser(true).find();
                if (follow) {
                    comm.showLog("follow.length:", follow.length)
                    if (follow.length > count) {
                        for (let i = 0; i < count; i++) {
                            comm.clickObj(follow[i]);
                            // comm.showLog("点一下")
                            sleep(1000);
                        }
                    } else if (0 > follow.length > count) {
                        follow.forEach(function (child) {
                            comm.clickObj(child);
                            // comm.showLog("点一下")
                            sleep(1000);
                        });
                    }
                } else {
                    comm.showLog("找不到follow")
                    errMsg = "视频无follow"
                    attempts++; // 增加尝试次数
                    continue
                }
                comm.showLog("完成")
                back();
                return "success"
            } else {
                comm.showLog("打开视频的评论点赞界面失败")
                errMsg = "打开视频的评论点赞界面失败"
                attempts++; // 增加尝试次数
                continue
            }
        } else {
            comm.showLog("拉起视频失败")
            errMsg = "拉起视频失败"
            attempts++; // 增加尝试次数
            continue
        }
    }
    return errMsg;
}
function videoLikesAndUserAttention_v2(taskInfo) {
    comm.showLog("浏览视频2")
    comm.randomSwipe(3)
    //
    sleep(8000)
    closeAllPop()
    //

    let attempts = 0;
    let errMsg = "失败"
    let count = taskInfo.follow_count
    // (不进自己首页)
    while (attempts < 5) {
        //滑动两次
        comm.randomSwipe(2)
        // 点开自己的视频(通过视频id拉起)
        app.startActivity({
            action: "android.intent.action.VIEW",
            data: "snssdk1233://aweme/detail/" + taskInfo.video_id + "?refer=web&gd_label=click_wap_top_banner&page_name=reflow_videor",
            // data:"snssdk1233://webview?url=https%3A%2F%2Fwww.tiktok.com%2Ft%2FZP8Fr9vTD%2F&from=webview&refer=web", 
            packageName: "com.zhiliaoapp.musically",

        });
        // 等待两秒，确保视频已经打开
        sleep(2000);
        // 检查是否存在Privacy settings
        var checkPs = selector().textContains('Privacy settings').visibleToUser(true).findOne(2000)
        if (checkPs) {
            // 存在，说明进来了
            comm.showLog("进来了")
            sleep(5000)
            // click(1200,1940)
            let plBtn = selector().className("android.widget.Button").visibleToUser(true).find()
            if (plBtn) {
                comm.clickObj(plBtn[1])
            }
            sleep(2000)
            var element = selector().visibleToUser(true).className('android.widget.TextView').find();
            if (element) {
                // console.log("Text:", element.text()); // 获取元素的文本内容
                // console.log("Id:", element.id()); // 获取元素的id（如果存在）
                // console.log("Class Name:", element.className()); // 获取元素的类名（如果存在）
                // console.log("Bounds:", element.bounds()); // 获取元素的位置和大小信息（例如：{left: 10, top: 20, right: 100, bottom: 50}）
                // //  
                // var parentElement = element.parent(); //获取父级元素
                // // 打印父元素的标签名
                // console.log("parentElement tagName:", parentElement.className()); //android.widget.FrameLayout
                // comm.clickObj(element)
                // 
                comm.showLog("找到")
                sleep(2000)
                // 第一个是评论，第二个是点赞
                element.forEach(function (child) {
                    console.log(child.text());
                    console.log(child.className());
                });
                comm.clickObj(element[1])
                // 
                sleep(1000)
                comm.showLog("找follow")
                // 找到follow按钮，看看一共有几个，如果少于三个，就全部点，如果大于三个，就点三个
                var follow = selector().className('android.widget.Button').textContains('Follow').visibleToUser(true).find();
                if (follow) {
                    comm.showLog("follow.length:", follow.length)
                    if (follow.length > count) {
                        for (let i = 0; i < count; i++) {
                            comm.clickObj(follow[i]);
                            // comm.showLog("点一下")
                            sleep(1000);
                        }
                    } else if (0 > follow.length > count) {
                        follow.forEach(function (child) {
                            comm.clickObj(child);
                            // comm.showLog("点一下")
                            sleep(1000);
                        });
                    }
                } else {
                    comm.showLog("找不到follow")
                    errMsg = "视频无follow"
                    attempts++; // 增加尝试次数
                    continue
                }
                comm.showLog("完成")
                back();
                return "success"
            } else {
                comm.showLog("打开视频的评论点赞界面失败")
                errMsg = "打开视频的评论点赞界面失败"
                attempts++; // 增加尝试次数
                continue
            }
        } else {
            comm.showLog("拉起视频失败")
            errMsg = "拉起视频失败"
            attempts++; // 增加尝试次数
            continue
        }
    }
    return errMsg;
}


// 12、tk老邀新活动
function tkInvitesActivities(taskInfo) {
    comm.showLog("执行tk老邀新活动")
    let urls = taskInfo.url
    let success_count = 0
    //
    for (let i = 0; i < urls.length; i++) {
        comm.showLog("开始循环:" + i)
        if (i > 0) {
            comm.showLog("如果第二次之后执行，先杀掉进程")
            httpShell('am force-stop com.zhiliaoapp.musically')
            if (!app.launch('com.zhiliaoapp.musically')) {
                console.log('App 启动失败')
                return "tk启动失败"
            }
            sleep(2000);
        }

        // 拉起浏览器
        app.openUrl(urls[i])
        // 等待两秒，确保浏览器已经打开
        sleep(10000);
        // 检查是否存在Join now
        comm.showLog("找Join now")
        var joinNowBtn = selector().textContains('Join now').visibleToUser(true).findOne(2000)
        if (joinNowBtn) {
            comm.showLog("找到Join now")
            comm.clickObj(joinNowBtn)
        }
        sleep(1000)
        //判断是不是显示活动结束
        comm.showLog("找This activity has ended")
        var activityEnded = selector().textContains('This activity has ended').visibleToUser(true).findOne(2000)
        if (activityEnded) {
            comm.showLog("显示活动结束")
            continue
        }
        //等待
        sleep(1000)
        //
        comm.showLog("找maximum number")
        var activityEnded = selector().textContains('maximum number').visibleToUser(true).findOne(2000)
        if (activityEnded) {
            comm.showLog("显示次数上限")
            continue
        }
        //等待
        sleep(1000)
        //判断 TikTok Rewards Terms and Conditions，点击那个弹窗的Continue
        comm.showLog("找Cont-inue")
        for (let i = 0; i < 5; i++) {
            let continueBtn = selector().textContains('Continue').className('android.widget.Button').visibleToUser(true).findOne(2000)
            if (continueBtn) {
                comm.showLog("找到Continue并点击")
                comm.clickObj(continueBtn)
                break
            }
            sleep(2000)
        }
        sleep(1000)
        comm.showLog("找Something went wrong")
        let someWorng = selector().textContains('Something went wrong').visibleToUser(true).findOne(2000)
        if (someWorng) {
            comm.showLog("出现Something went wrong")
            for (let bb = 0; bb < 5; bb++) {
                let retryBtn = selector().textContains('Retry').className('android.widget.Button').visibleToUser(true).findOne(1000)
                if (retryBtn) {
                    comm.clickObj(retryBtn)
                }
                sleep(10000)
            }
            // // sleep(2000)
            // //直接停止
            // continue
        }
        sleep(1000)
        //下一步,恭喜！你帮助你了你的朋友！
        comm.showLog("找Congrats")
        let congrats = selector().textContains('Congrats').visibleToUser(true).findOne(2000)
        if (congrats) {
            comm.showLog("找到Congrats并点击,ok")
            comm.clickObj(selector().textContains('OK').visibleToUser(true).findOne(2000))
        } else {
            let helpFriend = selector().textContains('You can only help your friend').visibleToUser(true).findOne(2000)
            if (helpFriend) {
                comm.showLog("找到You can only help your friend并点击,ok")
                comm.clickObj(selector().textContains('OK').visibleToUser(true).findOne(2000))
            }
        }
        //弹窗结束
        comm.showLog("弹窗结束")
        //点击邀请朋友
        sleep(1000)
        comm.showLog("找Invite friend")
        // let inviteBtn=selector().textContains('Invite f').visibleToUser(true).findOne(1000) 
        let inviteBtn = selector().className("android.widget.Button").text("Invite friends").visibleToUser(true).findOne(1000)
        if (inviteBtn) {
            comm.showLog("找到Invite friend")
            comm.clickObj(inviteBtn)
            sleep(2000)
            let copyLinkBtn = selector().textContains('Copy link').visibleToUser(true).findOne(1000)
            if (copyLinkBtn) {
                comm.showLog('点击了Copy link')
                comm.clickObj(copyLinkBtn)
                sleep(3000)
                comm.showLog('切换autojs')
                if (!app.launch('org.autojs.autoxjs.inrt')) {
                    comm.showLog('autojs 启动失败')
                }
                sleep(1000)
                //把复制的链接放进去
                let tkLink = getClip()
                tkShareString = getStrUrl(tkLink)
                //
                sleep(1000)
                comm.showLog(tkShareString)
                success_count++
            }
        }
        //
        sleep(2000)
    }
    return success_count;
}


// 13、tk老邀新活动-获取邀请链接
function tkInvitesActivitiesGetUrl(taskInfo) {
    comm.showLog("执行tk老邀新活动-获取邀请链接")
    let returnMsg = "失败"
    //判断是不是在首页
    for (let i = 0; i < 15; i++) {
        if (i > 2) {
            comm.showLog("如果第3次之后执行，先杀掉进程")
            httpShell('am force-stop com.zhiliaoapp.musically')
            if (!app.launch('com.zhiliaoapp.musically')) {
                console.log('App 启动失败')
                return "tk启动失败"
            }
            sleep(5000);
        }
        comm.showLog("判断是否已经进入tk...")
        sleep(5000)
        //有一个一直退不了的政策弹窗
        let newPolicy = selector().textContains('Got it').visibleToUser(true).findOne(1000)
        if (newPolicy) {
            comm.showLog("显示新的政策弹窗口")
            comm.clickObj(newPolicy)
            sleep(1000)
        }
        sleep(5000)
        if (selector().textContains('Home').visibleToUser(true).findOne(1000) && selector().textContains('Profile').visibleToUser(true).findOne(1000)) {
            // if (selector().textContains('Home').visibleToUser(true).findOne(2000)){
            comm.showLog('已经登录进去了')
            break
        } else {
            // //判断是否出现需要登陆的情况
            // sleep(5000)
            // comm.showLog("判断是否出现需要登陆的情况")
            // let log_in_btn = selector().textContains('Log in').visibleToUser(true).findOne(1000)
            // if (log_in_btn) {
            //     loginJastUserameAndPassword(username, taskInfo.password, taskInfo.password)
            // }
            // sleep(5000)
        }
        sleep(2000)
    }
    //
    comm.randomSwipeSlow(2)
    closeAllPop();
    //找到个人中心页面
    let profBtn = selector().textContains("Profile").className("android.widget.TextView").visibleToUser(true).findOne(1000)
    if (profBtn) {
        comm.showLog("点击进入个人中心")
        comm.clickObj(profBtn)
    }
    sleep(2000)

    //是否打开活动页面
    let pageOpen = 0
    //是否存在check in
    let checkInExist = 0

    //判断有没有进入个人中心
    for (let j = 0; j < 15; j++) {
        comm.showLog("判断有没有进入个人中心" + j)
        if (j > 5) {
            comm.showLog("检查关闭所有弹窗")
            closeAllPop();
        }
        let profBtn = selector().textContains("Profile").className("android.widget.TextView").visibleToUser(true).findOne(1000)
        if (profBtn) {
            comm.showLog("点击进入个人中心")
            comm.clickObj(profBtn)
        }
        //判断Create your TikTok  id("pae").findOne().click()  className = android.widget.ImageView
        let createYTK = selector().textContains('Get started').className('android.widget.Button').visibleToUser(true).findOne(1000)
        if (createYTK) {
            comm.showLog("有弹窗")
            click(30, 100)
            continue
        }
        let saveYTK = selector().textContains('Save').className('android.widget.Button').visibleToUser(true).findOne(1000)
        if (saveYTK) {
            comm.showLog("有弹窗save")
            click(30, 100)
            //
            sleep(1000)
            let saveLoginBtn = selector().textContains('Save login').className('android.widget.Button').visibleToUser(true).findOne(1000)
            if (saveLoginBtn) {
                comm.showLog("有弹窗Save login")
                comm.clickObj(saveLoginBtn)
            }
            continue
        }
        let remindLater = selector().textContains('Remind me later').visibleToUser(true).findOne(1000)
        if (remindLater) {
            comm.showLog("有弹窗remindLater")
            comm.clickObj(remindLater)
            continue
        }
        let follFri = selector().textContains('Follow your friends').visibleToUser(true).findOne(1000)
        if (follFri) {
            comm.showLog("有弹窗follFri")
            click(30, 100)
            continue
        }
        sleep(3000)
        if (selector().textContains('Following').visibleToUser(true).exists() && selector().textContains('Follower').visibleToUser(true).exists() && selector().textContains('Likes').visibleToUser(true).exists()) {
            comm.showLog("成功进入了个人中心，判断是否有活动按钮")
            //点击左上角的活动按钮
            let actionBtn = selector().className('android.widget.Button').visibleToUser(true).find()
            if (actionBtn) {
                if (actionBtn[0].bounds().centerX() < 300) {
                    comm.clickObj(actionBtn[0])
                } else {
                    return "没有活动按钮"
                }
            }
            sleep(1000)
            if (selector().textContains('Following').visibleToUser(true).exists() && selector().textContains('Follower').visibleToUser(true).exists() && selector().textContains('Likes').visibleToUser(true).exists()) {
                let actionBtn = selector().className('android.widget.Button').visibleToUser(true).find()
                if (actionBtn) {
                    comm.clickObj(actionBtn[0])
                }
                sleep(1000)
                break
            } else {
                break
            }
        }
        sleep(2000)
    }
    // 等待5秒，确保页面已经打开
    sleep(20000);
    for (let c = 0; c < 2; c++) {
        comm.showLog("等待页面打开" + c)
        if (c > 10) {
            back()
            sleep(2000)
            let actionBtn = selector().className('android.widget.Button').visibleToUser(true).find()
            if (actionBtn) {
                comm.clickObj(actionBtn[0])
            }
        }
        // 检查是否存在Join now
        // comm.showLog("找Join-now")
        // var joinNowBtn = selector().textContains('Join now').visibleToUser(true).findOne(2000)
        // if (joinNowBtn){
        //     comm.showLog("找到Join-now")
        //     comm.clickObj(joinNowBtn)
        // }
        // sleep(1000)
        //判断是不是显示活动结束
        comm.showLog("找This-activity-has-ended")
        var activityEnded = selector().textContains('This activity has ended').visibleToUser(true).findOne(2000)
        if (activityEnded) {
            comm.showLog("显示活动结束")
            return "显示活动结束"
        }
        //等待
        // sleep(1000)
        //
        comm.showLog("找maximum-number")
        var activityEnded = selector().textContains('maximum number').visibleToUser(true).findOne(2000)
        if (activityEnded) {
            comm.showLog("显示次数上限")
            return "显示次数上限"
        }
        //等待
        // sleep(1000)
        //判断 TikTok Rewards Terms and Conditions，点击那个弹窗的Continue
        comm.showLog("找Cont-inue")
        for (let i = 0; i < 5; i++) {
            let continueBtn = selector().textContains('Continue').className('android.widget.Button').visibleToUser(true).findOne(2000)
            if (continueBtn) {
                comm.showLog("找到Continue并点击")
                comm.clickObj(continueBtn)
                break
            }
            sleep(2000)
        }
        // sleep(1000)
        comm.showLog("找Something-went-wrong")
        let someWorng = selector().textContains('Something went wrong').visibleToUser(true).findOne(2000)
        if (someWorng) {
            comm.showLog("出现Something-went-wrong")
            sleep(2000)
            //
            comm.pullDownRefresh(); //下拉刷新一下
            sleep(3000)
        }
        // sleep(1000)
        //下一步,恭喜！你帮助你了你的朋友！
        comm.showLog("找Cong-rats")
        let congrats = selector().textContains('Congrats').visibleToUser(true).findOne(2000)
        if (congrats) {
            comm.showLog("找到Cong-rats并点击,ok")
            comm.clickObj(selector().textContains('OK').visibleToUser(true).findOne(2000))
        } else {
            let helpFriend = selector().textContains('You can only help your friend').visibleToUser(true).findOne(2000)
            if (helpFriend) {
                comm.showLog("找到You-can-only-help-your-friend并点击,ok")
                comm.clickObj(selector().textContains('OK').visibleToUser(true).findOne(2000))
            }
        }

        //
        comm.showLog("Invite-friends-to-join-TikTok")
        var inviteTikTok = selector().textContains('Invite friends to join TikTok').visibleToUser(true).findOne(2000)
        if (inviteTikTok) {
            comm.showLog("显示Invite friends to join TikTok")
            pageOpen = 1
        }

        //弹窗结束
        comm.showLog("弹窗结束")



        //判断新的活动弹窗口
        let check_in_ar1 = selector().textContains('Check in').visibleToUser(true).find()
        if (check_in_ar1) {
            comm.showLog("显示新的活动弹窗口")
            comm.clickObj(check_in_ar1[check_in_ar1.length - 1])
            sleep(10000)
            comm.clickObj(check_in_ar1[0])
            sleep(5000)
        }

        comm.clickObj(selector().textContains('OK').visibleToUser(true).findOne(2000))
        sleep(2000)

        goTextContains("Use your rewards on", 6)
        sleep(3000)


        //点击Claim
        var claimBtn = selector().textContains('Claim').visibleToUser(true).findOne(2000)
        if (claimBtn) {
            comm.showLog("找到Claim")
            // let claimX = inviteText.bounds().left + 238
            // let claimY = inviteText.bounds().bottom + 211
            // comm.showLog("claimX:" + claimX + " claimY:" + claimY)
            for (let i = 0; i < 5; i++) {
                comm.showLog("点击Claim")
                comm.clickObj(claimBtn)
                sleep(2000)
            }
        } else {
            comm.showLog("找不到Claim")
        }

        let sx = random(1500, 1600)
        if (device.height < 1500) {
            sx = device.height - random(260, 330)
        }
        // swipe(random(550, 600),sx, random(550, 600), random(350, 360),430)      
        comm.randomSwipeSlow(1)
        sleep(2000)
        let check_in_ar = selector().textContains('Check in').visibleToUser(true).find()
        if (check_in_ar.length > 0) {
            comm.clickObj(check_in_ar[check_in_ar.length - 1])
            sleep(10000)
            comm.clickObj(check_in_ar[0])
            sleep(5000)
            comm.clickObj(check_in_ar[1])
            sleep(5000)
            // returnMsg = "success"
            checkInExist = 1
            // let checkInReport = "http://10.6.0.58:8022/api/checkIn?account_id="+account_id+"&page_open="+pageOpen+"&check_in="+checkInExist
            // comm.httpToString(checkInReport)
            // return returnMsg
        } else {
            let checkInReport = "http://10.6.0.58:8022/api/checkIn?account_id=" + account_id + "&page_open=" + pageOpen + "&check_in=" + checkInExist
            comm.httpToString(checkInReport)
            checkInExist = 0
            //continue
        }
        // sleep(1000)
        comm.showLog("再点一次check-in")
        // let inviteBtn=selector().textContains('Invite f').visibleToUser(true).findOne(1000) 
        let checkkBtn = selector().className("android.widget.Button").text("Check in").visibleToUser(true).findOne(1000)
        if (checkkBtn) {
            comm.clickObj(checkkBtn)
        }
        sleep(5000)
        comm.showLog("找Invite-friend")
        let inviteBtn = selector().className("android.widget.Button").text("Invite friends").visibleToUser(true).findOne(1000)
        if (inviteBtn) {
            comm.showLog("找到Invite-friend")
            comm.clickObj(inviteBtn)
            sleep(2000)
            let copyLinkBtn = selector().textContains('Copy link').visibleToUser(true).findOne(1000)
            if (copyLinkBtn) {
                comm.showLog('点击了Copy-link')
                comm.clickObj(copyLinkBtn)
                sleep(5000)
                comm.showLog('切换autojs')
                if (!app.launch('org.autojs.autoxjs.inrt')) {
                    comm.showLog('autojs 启动失败')
                }
                sleep(3000)
                //把复制的链接放进去
                let tkLink = getClip()
                tkShareString = getStrUrl(tkLink)
                //
                sleep(1000)
                comm.showLog(tkShareString)
                //
                returnMsg = "success"
                let checkInReport = "http://10.6.0.58:8022/api/checkIn?account_id=" + account_id + "&page_open=" + pageOpen + "&check_in=" + checkInExist + "&url=" + tkShareString
                comm.httpToString(checkInReport)
                //
                return returnMsg
            }
        }
        //
        sleep(2000)
        // comm.showLog("找Invite-friend")
        // // let inviteBtn=selector().textContains('Invite f').visibleToUser(true).findOne(1000) 
        // let inviteBtn=selector().className("android.widget.Button").text("Invite friends").visibleToUser(true).findOne(1000) 
        // if(inviteBtn){
        //     comm.showLog("找到Invite-friend")
        //     comm.clickObj(inviteBtn)
        //     sleep(2000)
        //     let copyLinkBtn=selector().textContains('Copy link').visibleToUser(true).findOne(1000) 
        //     if(copyLinkBtn){
        //         comm.showLog('点击了Copy-link')
        //         comm.clickObj(copyLinkBtn)
        //         sleep(3000)
        //         comm.showLog('切换autojs')
        //         if(!app.launch('org.autojs.autoxjs.inrt')) {
        //             comm.showLog('autojs 启动失败')
        //         }
        //         sleep(1000)
        //         //把复制的链接放进去
        //         let tkLink = getClip()
        //         tkShareString=getStrUrl(tkLink)
        //         //
        //         sleep(1000)
        //         comm.showLog(tkShareString)
        //         // 用浏览器打开
        //         let browserPackageName = "com.android.chrome";
        //         // 创建 Intent 对象
        //         let intent = new Intent(Intent.ACTION_VIEW);
        //         intent.setData(android.net.Uri.parse(tkShareString));
        //         // 设置包名，指定浏览器
        //         intent.setPackage(browserPackageName);

        //         // 启动浏览器
        //         app.startActivity(intent);
        //         // 等待两秒，确保浏览器已经打开
        //         sleep(20000);
        //         //
        //         let loader = true
        //         let load_count = 0

        //         while(loader){
        //             comm.showLog("检测网页是否打开")
        //             //Use without an account
        //             let chormBtn = selector().textContains('Use without an account').visibleToUser(true).findOne(1000)
        //             if (chormBtn){
        //                 comm.clickObj(chormBtn)
        //             }
        //             //New tab
        //             let newTab = selector().textContains('New tab').visibleToUser(true).findOne(1000)
        //             if (newTab){
        //                 back()
        //             }
        //             if(load_count >5){
        //                 comm.pullDownRefresh(); //下拉刷新
        //                 sleep(3000)
        //             }
        //             if(load_count > 8){
        //                 loader = false
        //             }
        //             sleep(2000)
        //             //判断是不是显示活动结束
        //             comm.showLog("找This-activity-has-ended")
        //             let activityEnded = selector().textContains('This activity has ended').visibleToUser(true).findOne(1000)
        //             if(activityEnded){
        //                 comm.showLog("显示活动结束")
        //                 sleep(2000)
        //                 back()
        //                 returnMsg = "显示活动结束"
        //                 loader = false
        //                 break;
        //             }
        //             // 检查是否存在Join TikTok and 
        //             comm.showLog("找Join-TikTok-and")
        //             var joinNowBtn = selector().textContains('Join TikTok and').visibleToUser(true).findOne(1000)
        //             if (joinNowBtn){
        //                 comm.showLog("找到Join-TikTok-and")
        //                 sleep(2000)
        //                 back()
        //                 returnMsg = "success"
        //                 loader = false
        //             }
        //             sleep(5000)
        //             load_count ++
        //         }
        //         return returnMsg
        //     }
        // }
        // //
        // sleep(2000)
    }

    return returnMsg;
}

function tkCheckIn() {
    let check_in_ar1 = selector().textContains('Check in').visibleToUser(true).find()
    if (check_in_ar1) {
        comm.showLog("显示新的活动弹窗口")
        comm.clickObj(check_in_ar1[check_in_ar1.length - 1])
        sleep(5000)
        comm.clickObj(check_in_ar1[0])
        sleep(2000)
    }

    goTextContains("Check in", 6)

    let sx = random(1500, 1600)
    if (device.height < 1500) {
        sx = device.height - random(260, 330)
    }
    // swipe(random(550, 600),sx, random(550, 600), random(350, 360),430)      
    comm.randomSwipeSlow(1)
    sleep(2000)
    let check_in_ar = selector().textContains('Check in').visibleToUser(true).find()
    if (check_in_ar.length > 0) {
        comm.clickObj(check_in_ar[check_in_ar.length - 1])
        sleep(10000)
        comm.clickObj(check_in_ar[0])
        sleep(5000)
        comm.clickObj(check_in_ar[1])
        sleep(5000)
        // returnMsg = "success"
        let checkInExist = 1
        // let checkInReport = "http://10.6.0.58:8022/api/checkIn?account_id="+account_id+"&page_open="+pageOpen+"&check_in="+checkInExist
        // comm.httpToString(checkInReport)
        // return returnMsg
    }
}


// 14、tk浏览器打开链接，如果不超过就切换代理
function tkInvitesOpenUrlAndProxy(taskInfo) {
    comm.showLog("执行tk浏览器打开链接，如果不超过就切换代理")
    sleep(5000)
    let url = taskInfo.url
    comm.showLog("打印一下url:" + url)
    //杀一下tk进程
    // httpShell('am force-stop com.zhiliaoapp.musically')
    // 拉起浏览器
    // app.openUrl(url)
    //指定浏览器的包名
    openLinkFromBrowser(url)
    sleep(5000)
    //
    let loader = true
    let load_count = 0
    let returnMsg = "失败"
    while (loader) {
        comm.showLog("检测网页是否打开")
        if (load_count == 8 || load_count == 16) {
            comm.pullDownRefresh(); //下拉刷新
            sleep(3000)
        }
        if (load_count > 20) {
            loader = false
            return returnMsg
        }
        sleep(2000)
        //判断是不是显示活动结束
        comm.showLog("找This-activity-has-ended")
        var activityEnded = selector().textContains('This activity has ended').visibleToUser(true).findOne(1000)
        if (activityEnded) {
            comm.showLog("显示活动结束")
            returnMsg = "显示活动结束"
            //loader = false
            //return returnMsg
        }
        // 检查是否存在Join TikTok and 
        // comm.showLog("找Join-TikTok-and")
        // var joinNowBtn = selector().textContains('Join TikTok and').visibleToUser(true).findOne(1000)
        // if (joinNowBtn){
        //     comm.showLog("找到Join-TikTok-and")
        //     returnMsg = "找到Join-TikTok-and"
        //     loader = false
        // }
        // 检查是否存在Join now
        comm.showLog("找Join-now")
        let joinNowBtn = selector().desc('Join now').visibleToUser(true).findOne(1000)
        if (joinNowBtn) {
            comm.showLog("找到Join-now,点一下")
            sleep(5000)
            comm.clickObj(joinNowBtn)
            returnMsg = "找到Join-now"
            loader = false
        }
        joinNowBtn = selector().text('Join now').visibleToUser(true).findOne(1000)
        if (joinNowBtn) {
            comm.showLog("找到Join-now,点一下")
            sleep(5000)
            comm.clickObj(joinNowBtn)
            returnMsg = "找到Join-now"
            loader = false
        }
        load_count++
        sleep(5000)
    }
    //
    for (let i = 0; i < 10; i++) {
        comm.showLog("找Con-tinue")
        let continueBtn = selector().text('Continue').visibleToUser(true).findOne(1000)
        if (continueBtn) {
            comm.showLog("找到Continue,点一下")
            sleep(3000)
            comm.clickObj(continueBtn)
            returnMsg = "找到Conti-nue"
            break
        }
        sleep(2000)
    }
    //
    sleep(10000);
    for (let c = 0; c < 10; c++) {
        comm.showLog("等待页面打开" + c)
        if (c > 10) {
            back()
            sleep(2000)
            return "没打开页面"
        }
        //
        let somethingWentWeong = selector().textContains('Something went wrong').visibleToUser(true).findOne(2000)
        if (somethingWentWeong) {
            sleep(2000)
            comm.showLog("出现Something-went-wrong")
            comm.clickObj(selector().textContains('OK').visibleToUser(true).findOne(2000))
            sleep(2000)
            //tkCheckIn()
            return "出现Something-went-wrong"
        }
        //
        comm.showLog("找Cong-rats")
        let congrats = selector().textContains('Congrats').visibleToUser(true).findOne(2000)
        if (congrats) {
            sleep(2000)
            comm.showLog("找到Cong-rats并点击,ok")
            comm.clickObj(selector().textContains('OK').visibleToUser(true).findOne(2000))
            sleep(2000)
            //tkCheckIn()
            return "success"
        } else {
            let helpFriend = selector().textContains('You can only help your friend').visibleToUser(true).findOne(2000)
            if (helpFriend) {
                comm.showLog("找到You-can-only-help-your-friend并点击,ok")
                comm.clickObj(selector().textContains('OK').visibleToUser(true).findOne(2000))
                sleep(2000)
                tkCheckIn()
                return "出现You-can-only-help-you-friend"
            }
            //return "invite failed"
        }

        //判断是否
        let inviteText = selector().textContains('Invite a friend').visibleToUser(true).findOne(2000)
        if (inviteText) {
            comm.showLog("找到Invite a friend")
            return "页面加载完成，未弹出结果"
        }
        //
        sleep(8000)
    }
    // 如果没有报错这个，返回success
    return returnMsg
}

// 15、解绑手机号
function untapePhoneNumber(taskInfo) {
    for (let i = 0; i < 3; i++) {
        if (i > 3) {
            comm.showLog("如果第3次之后执行，先杀掉进程")
            httpShell('am force-stop com.zhiliaoapp.musically')
            if (!app.launch('com.zhiliaoapp.musically')) {
                console.log('App 启动失败')
                return "tk启动失败"
            }
            sleep(5000);
        }
        //
        // //判断是否出现需要登陆的情况
        // sleep(5000)
        // comm.showLog("判断是否出现需要登陆的情况")
        // let log_in_btn = selector().textContains('Log in').visibleToUser(true).findOne(1000)
        // if (log_in_btn) {
        //     loginJastUserameAndPassword(username, taskInfo.password, taskInfo.password)
        // }
        // sleep(5000)
        //
        comm.showLog("判断是否已经进入tk...")
        if (selector().textContains('Home').visibleToUser(true).findOne(1000) && selector().textContains('Profile').visibleToUser(true).findOne(1000)) {
            // if (selector().textContains('Home').visibleToUser(true).findOne(2000)){
            comm.showLog('已经登录进去了')
            sleep(2000)
            // Please try again     Retry
            let pta = selector().textContains('Please try again').visibleToUser(true).exists()
            if (pta) {
                let retryBtn = selector().className('android.widget.Button').text('Retry').visibleToUser(true).findOne(1000)
                if (retryBtn) {
                    comm.clickObj(retryBtn)
                }
            } else {
                break
            }
        }
        sleep(2000)
    }
    // 点击进入个人中心
    comm.findTextClick("Profile")
    sleep(10000)
    closeAllPop()
    //判断是否进入个人中心
    let followBtn = selector().textContains('Following').visibleToUser(true).findOne(1000)
    let followerBtn = selector().textContains('Followers').visibleToUser(true).findOne(1000)
    if (followBtn && followerBtn) {
        comm.showLog("进入个人主页")
        sleep(3000)
        //找到并点击三条杠
        let gggBtns = selector().className('android.widget.ImageView').visibleToUser(true).find()
        if (gggBtns) {
            comm.showLog("找到三条杠的ImageView控件" + gggBtns.length)
            if (gggBtns.length == 1) {
                if (gggBtns[0].bounds().centerY() < 300 && gggBtns[0].bounds().centerX() > device.width - 200) {
                    comm.clickObj(gggBtns[0])
                }
            } else if (gggBtns.length > 1) {
                for (let j = 0; j < gggBtns.length; j++) {
                    if (gggBtns[j].bounds().centerY() < 300 && gggBtns[j].bounds().centerX() > device.width - 200) {
                        comm.clickObj(gggBtns[j])
                        break
                    }
                }
            }
        } else {
            comm.showLog("找不到三条杠的imageView控件")
            return "找不到三条杠的imageView控件"
        }
        for (let i = 0; i < 5; i++) {
            let settingsAndPrivacy = selector().textContains('Settings and privacy').visibleToUser(true).findOne(1000)
            if (settingsAndPrivacy) {
                comm.findTextClick("Settings and privacy")
                break
            } else {
                comm.showLog("没找到Settings and privacy")
            }
            sleep(random(3000, 5000))
        }
        sleep(random(3000, 5000))
        comm.findTextAndClickLast("Account")
        for (let i = 0; i < 20; i++) {
            var accountInfo = selector().textContains('Account information').visibleToUser(true).findOne(1000)
            if (accountInfo) {
                comm.findTextClick("Account information")
                break
            } else {
                comm.showLog("没找到Account information")
            }
            sleep(random(5000, 6000))
        }
        sleep(random(5000, 6000))
        comm.findTextClick("Phone number")
        sleep(random(5000, 6000))
        let phonetext1 = selector().textContains("Unlink phone").visibleToUser(true).findOne(1000)
        let phonetext2 = selector().textContains("Enter phone number").visibleToUser(true).findOne(1000)
        if (phonetext1) {
            comm.showLog("手机号不为空")
            comm.findTextClick("Unlink phone")
            for (let i = 0; i < 5; i++) {
                let unlinkBtn = selector().textContains("Unlink").visibleToUser(true).findOne(1000)
                if (unlinkBtn) {
                    comm.findTextAndClickLast("Unlink")
                    sleep(random(10000, 15000))
                    return "success"
                } else {
                    comm.showLog("没找到Unlink")
                }
                sleep(random(3000, 4000))
            }
            sleep(random(3000, 4000))
        } else if (phonetext2) {
            comm.showLog("手机号为空")
            back()
            return "success"
        } else {
            comm.showLog("else,结束")
        }
    } else {
        return "没进入个人中心";
    }
}
function untapePhoneNumber_v2(taskInfo) {
    // 点击进入个人中心
    comm.findTextClick("Profile")
    sleep(10000)
    closeAllPop()
    //判断是否进入个人中心
    let followBtn = selector().textContains('Following').visibleToUser(true).findOne(1000)
    let followerBtn = selector().textContains('Followers').visibleToUser(true).findOne(1000)
    if (followBtn && followerBtn) {
        comm.showLog("进入个人主页")
        sleep(3000)
        //找到并点击三条杠
        let gggBtns = selector().className('android.widget.ImageView').visibleToUser(true).find()
        if (gggBtns) {
            comm.showLog("找到三条杠的ImageView控件" + gggBtns.length)
            if (gggBtns.length == 1) {
                if (gggBtns[0].bounds().centerY() < 300 && gggBtns[0].bounds().centerX() > device.width - 200) {
                    comm.clickObj(gggBtns[0])
                }
            } else if (gggBtns.length > 1) {
                for (let j = 0; j < gggBtns.length; j++) {
                    if (gggBtns[j].bounds().centerY() < 300 && gggBtns[j].bounds().centerX() > device.width - 200) {
                        comm.clickObj(gggBtns[j])
                        break
                    }
                }
            }
        } else {
            comm.showLog("找不到三条杠的imageView控件")
            return "找不到三条杠的imageView控件"
        }
        for (let i = 0; i < 5; i++) {
            let settingsAndPrivacy = selector().textContains('Settings and privacy').visibleToUser(true).findOne(1000)
            if (settingsAndPrivacy) {
                comm.findTextClick("Settings and privacy")
                break
            } else {
                comm.showLog("没找到Settings and privacy")
            }
            sleep(random(3000, 5000))
        }
        sleep(random(3000, 5000))
        comm.findTextAndClickLast("Account")
        for (let i = 0; i < 20; i++) {
            var accountInfo = selector().textContains('Account information').visibleToUser(true).findOne(1000)
            if (accountInfo) {
                comm.findTextClick("Account information")
                break
            } else {
                comm.showLog("没找到Account information")
            }
            sleep(random(5000, 6000))
        }
        sleep(random(5000, 6000))
        comm.findTextClick("Phone number")
        sleep(random(5000, 6000))
        let phonetext1 = selector().textContains("Unlink phone").visibleToUser(true).findOne(1000)
        let phonetext2 = selector().textContains("Enter phone number").visibleToUser(true).findOne(1000)
        if (phonetext1) {
            comm.showLog("手机号不为空")
            comm.findTextClick("Unlink phone")
            for (let i = 0; i < 5; i++) {
                let unlinkBtn = selector().textContains("Unlink").visibleToUser(true).findOne(1000)
                if (unlinkBtn) {
                    comm.findTextAndClickLast("Unlink")
                    sleep(random(10000, 15000))
                    return "success"
                } else {
                    comm.showLog("没找到Unlink")
                }
                sleep(random(3000, 4000))
            }
            sleep(random(3000, 4000))
        } else if (phonetext2) {
            comm.showLog("手机号为空")
            back()
            return "success"
        } else {
            comm.showLog("else,结束")
        }
    }
    return "没进入个人中心";
}

// 16、群发任务
function massSending(taskInfo) {
    for (let i = 0; i < 3; i++) {
        if (i > 3) {
            comm.showLog("如果第3次之后执行，先杀掉进程")
            httpShell('am force-stop com.zhiliaoapp.musically')
            if (!app.launch('com.zhiliaoapp.musically')) {
                console.log('App 启动失败')
                return "tk启动失败"
            }
            sleep(5000);
        }
        //
        // //判断是否出现需要登陆的情况
        // sleep(5000)
        // comm.showLog("判断是否出现需要登陆的情况")
        // let log_in_btn = selector().textContains('Log in').visibleToUser(true).findOne(1000)
        // if (log_in_btn) {
        //     loginJastUserameAndPassword(username, taskInfo.password, taskInfo.password)
        // }
        // sleep(5000)
        //
        comm.showLog("判断是否已经进入tk...")
        if (selector().textContains('Home').visibleToUser(true).findOne(1000) && selector().textContains('Profile').visibleToUser(true).findOne(1000)) {
            // if (selector().textContains('Home').visibleToUser(true).findOne(2000)){
            comm.showLog('已经登录进去了')
            sleep(2000)
            // Please try again     Retry
            let pta = selector().textContains('Please try again').visibleToUser(true).exists()
            if (pta) {
                let retryBtn = selector().className('android.widget.Button').text('Retry').visibleToUser(true).findOne(1000)
                if (retryBtn) {
                    comm.clickObj(retryBtn)
                }
            } else {
                break
            }
        }
        sleep(2000)
    }
    //
    sleep(10000)
    closeAllPop()
    // 通过传入的taskInfo 循环执行任务
    let stxt = taskInfo.message
    let seller_ids = taskInfo.seller_ids
    let seller_ids_array = seller_ids.split(",")
    // 如果 image_url 为空，就不发图片 
    let image_url = taskInfo.image_url
    for (let i = 0; i < seller_ids_array.length; i++) {
        comm.showLog("第" + i + "次循环,seller_id:" + seller_ids_array[i])
        if (bd_client_no != "") {
            comm.httpToString("http://23.91.96.20:9101/api/client/limitSpeed?bd_client_no=" + bd_client_no)
        }
        sleep(8000)
        //
        let reMsg = setSellerText_And_Photo(stxt, seller_ids_array[i], image_url)
        if (reMsg == "success") {
            comm.showLog("setSeller-Text_And_Photo 返回success")
        } else {
            comm.showLog("setSeller-Text_And_Photo 没有返回success")
        }
        sleep(5000)
        back()
        sleep(5000)
        back()
        sleep(5000)
        comm.randomSwipe(2)
        sleep(8000)
    }
    sleep(5000)
    return "success"
}

function massSending_v2(taskInfo) {
    // 通过传入的taskInfo 循环执行任务
    let stxt = taskInfo.message
    let seller_ids = taskInfo.seller_ids
    let seller_ids_array = seller_ids.split(",")
    // 如果 image_url 为空，就不发图片 
    let image_url = taskInfo.image_url
    for (let i = 0; i < seller_ids_array.length; i++) {
        comm.showLog("第" + i + "次循环,seller_id:" + seller_ids_array[i])
        if (bd_client_no != "") {
            comm.httpToString("http://23.91.96.20:9101/api/client/limitSpeed?bd_client_no=" + bd_client_no)
        }
        sleep(8000)
        //
        let reMsg = setSellerText_And_Photo(stxt, seller_ids_array[i], image_url)
        if (reMsg == "success") {
            comm.showLog("setSeller-Text_And_Photo 返回success")
        } else {
            comm.showLog("setSeller-Text_And_Photo 没有返回success")
        }
        sleep(5000)
        back()
        sleep(5000)
        back()
        sleep(5000)
        comm.randomSwipe(2)
        sleep(8000)
    }
    sleep(5000)
    return "success"
}

//17、发视频
function postVideo(taskInfo) {
    // 默认点击一下底部中间的发视频页
    comm.showLogToFile("点击一下发布按钮")
    click(device.width / 2, device.height - 50)
    sleep(5000)
    //找PHOTO和POST中间位置
    let PHOTOBtn = selector().textContains('PHOTO').visibleToUser(true).findOne(1000)
    let POSTBtn = selector().textContains('POST').visibleToUser(true).findOne(1000)
    if (PHOTOBtn && POSTBtn) {
        //目前现有的发视频按钮在右侧
        //据说可能有时候会出现在左侧。如果出现在左侧，无法判断和获取到底是哪个位置，只能说默认点击一下，然后通过点击之后的元素，去判断正确与否，如果不正确就进行恢复措施
        let w = (device.width / 2) + (device.width / 4) + 20
        comm.showLog(w)  //830
        let h = PHOTOBtn.bounds().centerY() + (POSTBtn.bounds().centerY() - PHOTOBtn.bounds().centerY()) / 2
        comm.showLog(h) //2174
        comm.showLog('-----------------') //2174
        comm.showLog(POSTBtn.bounds().centerY()) //2174
        comm.showLog(PHOTOBtn.bounds().centerY()) //1698
        //
        click(w, h)
        sleep(5000)
        // Select multiple
        let videoBtn = selector().textContains('Videos').visibleToUser(true).findOne(1000)
        if (videoBtn) {
            comm.clickObj(videoBtn)
            sleep(5000)
            //找到那个图片
            let imgText = selector().className("android.widget.TextView").textContains(':').visibleToUser(true).findOne(1000);
            // let imgText = selector().textContains('00:').visibleToUser(true).findOne(1000);
            if (imgText) {
                comm.showLogToFile("找到图片")
                comm.clickObj(imgText)
                sleep(5000)
                //
                let nextBtn = selector().textContains('Next').visibleToUser(true).findOne(1000)
                if (nextBtn) {
                    comm.clickObj(nextBtn)
                    sleep(5000)
                    let nextBtn2 = selector().textContains('Next').visibleToUser(true).findOne(1000)
                    if (nextBtn2) {
                        comm.clickObj(nextBtn2)
                        // 有一个弹出框
                        sleep(5000)
                        let okBtn = selector().textContains('OK').visibleToUser(true).findOne(1000)
                        if (okBtn) {
                            comm.clickObj(okBtn)
                            sleep(5000)
                        }
                        //className = android.widget.EditText
                        let editText = selector().className("android.widget.EditText").visibleToUser(true).findOne(1000)
                        if (editText) {
                            comm.showLogToFile("输入内容")
                            // editText.setText("Share my kitty cat with the whole world!")
                            editText.setText(taskInfo.content)
                            sleep(5000)
                            let postBtn = selector().textContains('Post').visibleToUser(true).findOne(1000)
                            if (postBtn) {
                                comm.showLogToFile("点击发布按钮")
                                comm.clickObj(postBtn)
                                sleep(10000)
                                // 可能会出现一些弹窗  Quickstep
                                if (selector().textContains('Quickstep').visibleToUser(true).exists()) {
                                    var CANCELBtn = selector().textContains('CANCEL').visibleToUser(true).findOne(1000)
                                    if (CANCELBtn) {
                                        comm.clickObj(CANCELBtn)
                                        sleep(5000)
                                    }
                                }
                                //
                                return "success"
                            }
                        } else {
                            comm.showLogToFile("没找到输入框")
                            return "没找到输入框"
                        }
                    } else {
                        comm.showLogToFile("没点到第二个next")
                        return "没点到第二个next"
                    }
                } else {
                    comm.showLogToFile("没点到第一个next")
                    return "没点到第一个next"
                }

            } else {
                comm.showLogToFile("没找到视频文件")
                return "没找到视频文件"
            }
        } else {
            comm.showLogToFile("没找到video按钮")
            return "没找到video按钮"
        }
    } else {
        comm.showLogToFile("没进入发布页")
        return "没进入发布页"
    }
    comm.showLogToFile("默认失败")
    return "默认失败"
}
// 修改发布的操作路径，使用内录15秒
function postVideo_v2(taskInfo) {
    comm.showLogToFile("执行视频发布")
    sleep(5000)
    let homeBtn = selector().textContains('Home').visibleToUser(true).findOne(5000)
    if (!homeBtn) {
        comm.showLogToFile("没在首页")
        return "没在首页"
    }
    // 默认点击一下底部中间的发视频页
    comm.showLogToFile("点击一下发布按钮")
    click(device.width / 2, homeBtn.bounds().top - 20)
    sleep(30000)
    for (let i = 0; i < 15; i++) {
        if (i == 14) {
            comm.showLogToFile("没进入发布页")
            return "没进入发布页"
        }
        let PHOTOBtn = selector().textContains('PHOTO').visibleToUser(true).findOne(1000)
        let POSTBtn = selector().textContains('POST').visibleToUser(true).findOne(1000)
        if (PHOTOBtn && POSTBtn) {
            comm.showLogToFile("进入发布页")
            break
        } else {
            comm.showLogToFile("没进入发布页")
            sleep(10000)
        }
    }
    //找PHOTO和POST中间位置
    let PHOTOBtn = selector().textContains('PHOTO').visibleToUser(true).findOne(1000)
    let POSTBtn = selector().textContains('POST').visibleToUser(true).findOne(1000)
    if (!(PHOTOBtn && POSTBtn)) {
        comm.showLogToFile("没进入发布页")
        return "没进入发布页"
    }
    let w = device.width / 2
    let h = PHOTOBtn.bounds().centerY() + ((POSTBtn.bounds().centerY() - PHOTOBtn.bounds().centerY()) / 3) - 5
    //点击15秒
    let video15SBtn = selector().textContains('15s').visibleToUser(true).findOne(1000)
    if (!video15SBtn) {
        comm.showLogToFile("没找到15s按钮")
        return "没找到15s按钮"
    } else {
        comm.showLogToFile("点击15秒按钮")
        comm.clickObj(video15SBtn)
        sleep(30000)
    }
    comm.showLogToFile("准备执行点击录制的操作")
    for (let i = 0; i < 15; i++) {
        if (i == 14) {
            comm.showLogToFile("没成功录制")
            return "没成功录制"
        }
        //
        // 执行命令
        httpShell("dg av write -v " + taskInfo.video_path)
        //点击录制
        click(w, h)
        sleep(random(6000, 8000))
        click(w, h)  //停止录制
        if (selector().textContains('15s').visibleToUser(true).exists()) {
            comm.showLogToFile("没成功录制")
            sleep(3000)
        } else {
            comm.showLogToFile("成功录制")
            break
        }
    }

    let redBtn = null
    let luzhi_btn = null
    //通过元素class去找到
    let redBtns_class = selector().className('android.widget.ImageView').visibleToUser(true).find()
    if (redBtns_class.length > 0) {
        comm.showLogToFile("找到imageView")
        //找到所有的，高度屏幕大于三分之二部分的，宽度大于六分之五
        let check_w = (device.width / 6) * 4
        let check_h = (device.height / 3) * 2
        //遍历所有符合这个规则的按钮，然后找到最右侧
        let select_redbtns = []
        for (let i = 0; i < redBtns_class.length; i++) {
            if (redBtns_class[i].bounds().centerX() > check_w && redBtns_class[i].bounds().centerY() > check_h) {
                select_redbtns.push(redBtns_class[i])
            }
        }
        if (select_redbtns.length > 0) {
            //找到最右侧
            let max_w = 0
            for (let i = 0; i < select_redbtns.length; i++) {
                if (select_redbtns[i].bounds().centerX() > max_w) {
                    max_w = select_redbtns[i].bounds().centerX()
                    redBtn = select_redbtns[i]
                }
            }
        }
    }
    // 方法2  找录制按钮，并通过指定计算的坐标去点击
    if (redBtn === null) {
        comm.showLogToFile("方法1没找到红色勾(其实是隔壁取消按钮)，尝试方法2")
        // className = android.widget.ImageView  找到那个发布按钮（和隔壁的发布按钮是一个水平面）
        // className = android.widget.Button (靠近底部的录制按钮)
        //找到页面中的所有imageView
        for (let j = 0; j < 15; j++) {
            if (j == 14) {
                comm.showLogToFile("方法2没找到录制按钮的坐标")
                return "方法2没找到录制按钮的坐标"
            }
            let redBtns = selector().className('android.widget.Button').visibleToUser(true).find()
            if (redBtns.length > 0) {
                let check_h = (device.height / 3) * 2
                for (let i = 0; i < redBtns.length; i++) {
                    if (redBtns[i].bounds().centerY() > check_h) {
                        // comm.clickObj(redBtns[i])
                        comm.showLogToFile("找到了")
                        luzhi_btn = redBtns[i]
                        break
                    }
                }
                if (luzhi_btn === null) {
                    comm.showLogToFile("方法2没找到录制按钮" + j)
                } else {
                    comm.showLogToFile("方法2找到录制按钮")
                    break
                }

            } else {
                comm.showLogToFile("方法2没找到录制按钮的坐标")
            }
            sleep(5000)
        }
    }

    // 最终判断有没有找到
    if (redBtn === null && luzhi_btn === null) {
        comm.showLogToFile("无法找到录制成功的红色勾")
        return "无法找到录制成功的红色勾"
    } else if (redBtn !== null) {
        comm.showLogToFile("方法1找到录制成功的红色勾(其实是隔壁取消按钮)");
        sleep(5000)
        click(redBtn.bounds().centerX() + 150, redBtn.bounds().centerY())
        sleep(15000)
    } else if (luzhi_btn !== null) {
        comm.showLogToFile("方法2找到录制成功的红色勾");
        sleep(5000)
        let red_w = luzhi_btn.bounds().centerX() + (luzhi_btn.bounds().centerX() / 3) * 2 + 10
        let red_h = luzhi_btn.bounds().centerY() + 20
        click(red_w, red_h)
        sleep(15000)
    }
    //
    //
    for (let i = 0; i < 15; i++) {
        if (i == 14) {
            comm.showLogToFile("没找到Next");
            return "没找到Next"
        }
        if (selector().textContains('Next').visibleToUser(true).exists()) {
            comm.showLogToFile("找到Next");
            break
        } else {
            comm.showLogToFile("没找到Next");
        }
        sleep(5000)
    }
    //
    let nextBtn = selector().textContains('Next').visibleToUser(true).findOne(1000)
    if (nextBtn) {
        comm.showLogToFile("点一下Next");
        comm.clickObj(nextBtn)
        sleep(30000)
        let okBtn = selector().textContains('OK').visibleToUser(true).findOne(1000)
        if (okBtn) {
            comm.clickObj(okBtn)
            sleep(15000)
        }
        //className = android.widget.EditText
        let editText = selector().className("android.widget.EditText").visibleToUser(true).findOne(1000)
        if (editText) {
            comm.showLogToFile("输入内容")
            // editText.setText("Share my kitty cat with the whole world!")
            editText.setText(taskInfo.content)
            sleep(15000)
            let postBtn = selector().textContains('Post').visibleToUser(true).findOne(1000)
            if (postBtn) {
                comm.showLogToFile("点击发布按钮")
                comm.clickObj(postBtn)
                sleep(20000)
                // 可能会出现一些弹窗  Quickstep
                let CANCELBtn = selector().textContains('CANCEL').visibleToUser(true).findOne(1000)
                if (CANCELBtn) {
                    comm.showLogToFile("点击取消按钮")
                    comm.clickObj(CANCELBtn)
                    sleep(15000)
                    closeAllPop()
                }
                //
                comm.showLogToFile("等待六十秒")
                sleep(40000)
                //
                return "success"
            }
        } else {
            comm.showLogToFile("没找到输入框")
            return "没找到输入框"
        }
    }

    comm.showLogToFile("默认失败")
    return "默认失败"
}


// 添加头像
function addAvatar(taskInfo) {
    comm.showLogToFile("执行添加头像")
    sleep(5000)
    let homeBtn = selector().textContains('Home').visibleToUser(true).findOne(5000)
    if (!homeBtn) {
        comm.showLogToFile("没在首页")
        return "没在首页"
    }
    //点击个人中心
    let profileBtn = selector().textContains('Profile').visibleToUser(true).findOne(5000)
    if (!profileBtn) {
        comm.showLogToFile("没找到个人中心")
        closeAllPop()
        sleep(5000)
        profileBtn = selector().text('Profile').visibleToUser(true).findOne(5000)
        if (!profileBtn) {
            comm.showLogToFile("确实没找到个人中心")
            return "确实没找到个人中心"
        }
    } else {
        comm.showLogToFile("点击个人中心")
        comm.clickObj(profileBtn)
        sleep(5000)
        closeAllPop()
        sleep(5000)
        let addBtn = selector().text('Add').visibleToUser(true).findOne(1000)
        if (addBtn) {
            comm.clickObj(addBtn)
            sleep(8000)
            let uploadBtn = selector().textContains('Upload photo').visibleToUser(true).findOne(1000)
            if (!uploadBtn) {
                comm.showLogToFile("没有弹出上传照片按钮")
                return "没有弹出上传照片按钮"
            } else {
                comm.clickObj(uploadBtn)
                //选择第一个
                sleep(10000)
                //className = android.widget.Button
                let imgButton = selector().className("android.widget.Button").findOne();
                if (!imgButton) {
                    return "没找到图片"
                }
                comm.clickObj(imgButton)
                sleep(10000)
                let nextText = selector().textContains("Next").visibleToUser(true).findOne(10000);
                if (!nextText) {
                    comm.showLogToFile("没有Next")
                    return "没有Next"
                }
                comm.showLogToFile("点击Next")
                comm.clickObj(nextText)
                sleep(10000)
                //点击保存
                //className = android.widget.CheckBox
                let saveChack = selector().className('android.widget.CheckBox').visibleToUser(true).findOne(1000)
                if (saveChack) {
                    if (saveChack.checked() == true) {
                        comm.clickObj(saveChack)
                    }
                }
                sleep(5000)
                //text = Save & post
                let savePostBtn = selector().textContains("Save").visibleToUser(true).findOne(1000);
                if (!savePostBtn) {
                    comm.showLogToFile("没有保存按钮")
                    return "没有保存按钮"
                }
                comm.showLogToFile("点击保存按钮")
                comm.clickObj(savePostBtn)
                sleep(30000)
                profileBtn = selector().textContains('Profile').visibleToUser(true).findOne(5000)
                if (profileBtn) {
                    comm.showLogToFile("回到个人中心页")
                    return "success"
                }
            }

        } else {
            comm.showLogToFile("不需要换头像")
            return "不需要换头像"
        }
    }
    //
    comm.showLogToFile("默认失败")
    return "默认失败"
}
// 修改头像 是用taskserver服务端版本
function addAvatar_v2(taskInfo) {
    comm.showLogToFile("执行添加头像")
    //保持tk在前台
    if (currentPackage().indexOf('com.zhiliaoapp.musically') == -1) {
        if (!app.launch('com.zhiliaoapp.musically')) {
            console.log('App 启动失败')
            return "tk启动失败"
        }
        comm.showLogToFile('重启完成')
        sleep(5000)
    }
    sleep(5000)
    let homeBtn = selector().textContains('Home').visibleToUser(true).findOne(5000)
    if (!homeBtn) {
        comm.showLogToFile("没在首页")
        return "没在首页"
    }
    //点击个人中心
    let profileBtn = selector().textContains('Profile').visibleToUser(true).findOne(5000)
    if (!profileBtn) {
        comm.showLogToFile("没找到个人中心")
        closeAllPop()
        sleep(5000)
        profileBtn = selector().text('Profile').visibleToUser(true).findOne(5000)
        if (!profileBtn) {
            comm.showLogToFile("确实没找到个人中心")
            return "确实没找到个人中心"
        }
    } else {
        comm.showLogToFile("点击个人中心")
        comm.clickObj(profileBtn)
        sleep(5000)
        closeAllPop()
        sleep(5000)
        let addBtn = selector().text('Add').visibleToUser(true).findOne(1000)
        if (addBtn) {
            comm.clickObj(addBtn)
            sleep(8000)
            let uploadBtn = selector().textContains('Upload photo').visibleToUser(true).findOne(1000)
            if (!uploadBtn) {
                comm.showLogToFile("没有弹出上传照片按钮")
                return "没有弹出上传照片按钮"
            } else {
                comm.clickObj(uploadBtn)
                //选择第一个
                sleep(10000)
                //className = android.widget.Button
                let imgButton = selector().className("android.widget.Button").findOne();
                if (!imgButton) {
                    return "没找到图片"
                }
                comm.clickObj(imgButton)
                sleep(10000)
                let nextText = selector().textContains("Next").visibleToUser(true).findOne(10000);
                if (!nextText) {
                    comm.showLogToFile("没有Next")
                    return "没有Next"
                }
                comm.showLogToFile("点击Next")
                comm.clickObj(nextText)
                sleep(10000)
                //点击保存
                //className = android.widget.CheckBox
                let saveChack = selector().className('android.widget.CheckBox').visibleToUser(true).findOne(1000)
                if (saveChack) {
                    if (saveChack.checked() == true) {
                        comm.clickObj(saveChack)
                        sleep(15000)
                    }
                }
                //text = Save & post
                let savePostBtn = selector().textContains("Save").visibleToUser(true).findOne(1000);
                if (!savePostBtn) {
                    comm.showLogToFile("没有保存按钮")
                    return "没有保存按钮"
                }
                comm.showLogToFile("点击保存按钮")
                comm.clickObj(savePostBtn)
                sleep(30000)
                profileBtn = selector().textContains('Profile').visibleToUser(true).findOne(5000)
                if (profileBtn) {
                    comm.showLogToFile("回到个人中心页")
                    return "success"
                }
            }

        } else {
            comm.showLogToFile("不需要换头像")
            return "不需要换头像"
        }
    }
    //
    comm.showLogToFile("默认失败")
    return "默认失败"
}

// 修改昵称，虽然是Username，但是实际修改的只是昵称
function changeUsername(taskInfo) {
    comm.showLogToFile("执行修改昵称")
    sleep(5000)
    let homeBtn = selector().textContains('Home').visibleToUser(true).findOne(5000)
    if (!homeBtn) {
        comm.showLogToFile("没在首页")
        return "没在首页"
    }
    //点击个人中心
    let profileBtn = selector().textContains('Profile').visibleToUser(true).findOne(5000)
    if (!profileBtn) {
        comm.showLogToFile("没找到个人中心")
        closeAllPop()
        sleep(5000)
        profileBtn = selector().text('Profile').visibleToUser(true).findOne(5000)
        if (!profileBtn) {
            comm.showLogToFile("确实没找到个人中心")
            return "确实没找到个人中心"
        }
    } else {
        comm.showLogToFile("点击个人中心")
        comm.clickObj(profileBtn)
        sleep(5000)
        closeAllPop()
        sleep(5000)
        let editProfileBtn = selector().text('Edit profile').visibleToUser(true).findOne(1000)
        if (editProfileBtn) {
            comm.clickObj(editProfileBtn)
            sleep(8000)
            let usernameBtn = selector().text('Username').visibleToUser(true).findOne(1000)
            if (!usernameBtn) {
                comm.showLogToFile("没有找到User-name按钮")
                return "没有找到User-name按钮"
            } else {
                comm.clickObj(usernameBtn)
                //点击一下输入框
                sleep(5000)
                //className = android.widget.EditText
                let inputs = selector().className('android.widget.EditText').visibleToUser(true).findOne(1000)
                if (inputs) {
                    comm.clickObj(inputs)
                    sleep(10000)
                    inputs.setText(taskInfo.username)
                    // inputs.setText(".howdy821")
                    //
                    sleep(10000)
                    let saveBtn = selector().text("Save").visibleToUser(true).findOne(1000);
                    if (!saveBtn) {
                        comm.showLogToFile("没有保存按钮")
                        return "没有保存按钮"
                    }
                    comm.clickObj(saveBtn)
                    sleep(10000)
                    let setusernameBtn = selector().text("Set username").visibleToUser(true).findOne(1000);
                    if (!setusernameBtn) {
                        comm.showLogToFile("没有set-usernameBtn按钮和按钮")
                        return "没有set-usernameBtn按钮和按钮"
                    }
                    comm.clickObj(setusernameBtn)
                    sleep(10000)
                    //判断有没有回到那个页面
                    let usernameText = selector().textContains(taskInfo.username).visibleToUser(true).findOne(5000)
                    if (!usernameText) {
                        comm.showLogToFile("可能没成功")
                        return "可能没成功"
                    } else {
                        comm.showLogToFile("修改成功")
                        return "success"
                    }
                }
            }

        } else {
            comm.showLogToFile("没找到个人资料按钮Edit-profil")
            return "没找到个人资料按钮Edit-profil"
        }
    }
    //
    comm.showLogToFile("默认失败")
    return "默认失败"
}
// 修改用户名Username 是用taskserver服务端版本
function changeUsername_v2(taskInfo) {
    comm.showLogToFile("执行修改用户名")
    //保持tk在前台
    if (currentPackage().indexOf('com.zhiliaoapp.musically') == -1) {
        if (!app.launch('com.zhiliaoapp.musically')) {
            console.log('App 启动失败')
            return "tk启动失败"
        }
        comm.showLogToFile('重启完成')
        sleep(5000)
    }
    sleep(5000)
    //
    let homeBtn = selector().textContains('Home').visibleToUser(true).findOne(5000)
    if (!homeBtn) {
        comm.showLogToFile("没在首页")
        return "没在首页"
    }
    //点击个人中心
    let profileBtn = selector().textContains('Profile').visibleToUser(true).findOne(5000)
    if (!profileBtn) {
        comm.showLogToFile("没找到个人中心")
        closeAllPop()
        sleep(5000)
        profileBtn = selector().text('Profile').visibleToUser(true).findOne(5000)
        if (!profileBtn) {
            comm.showLogToFile("确实没找到个人中心")
            return "确实没找到个人中心"
        }
    } else {
        comm.showLogToFile("点击个人中心")
        comm.clickObj(profileBtn)
        sleep(20000)
        closeAllPop()
        sleep(5000)
        comm.showLogToFile("找Edit-profile按钮")
        let editProfileBtn = selector().text('Edit profile').visibleToUser(true).findOne(1000)
        if (editProfileBtn) {
            comm.clickObj(editProfileBtn)
            sleep(8000)
            comm.showLogToFile("找User-name按钮")
            let usernameBtn = selector().text('Username').visibleToUser(true).findOne(1000)
            if (!usernameBtn) {
                comm.showLogToFile("没有找到User-name按钮")
                return "没有找到User-name按钮"
            } else {
                comm.showLogToFile("点击User-name按钮")
                comm.clickObj(usernameBtn)
                //可能会有一个什么东西 小气泡，挡住第一次点击，再点一次
                sleep(5000)
                if (selector().text('Edit profile').visibleToUser(true).exists()) {
                    comm.clickObj(usernameBtn)
                }
                //点击一下输入框
                sleep(10000)
                //className = android.widget.EditText
                let inputs = selector().className('android.widget.EditText').visibleToUser(true).findOne(1000)
                if (inputs) {
                    comm.clickObj(inputs)
                    sleep(10000)
                    username_new = taskInfo.username  //这是新的用户名
                    inputs.setText(username_new)
                    // inputs.setText(".howdy821")
                    //
                    sleep(10000)
                    comm.showLogToFile("点击保存")
                    let saveBtn = selector().text("Save").visibleToUser(true).findOne(1000);
                    if (!saveBtn) {
                        comm.showLogToFile("没有保存按钮")
                        return "没有保存按钮"
                    }
                    comm.clickObj(saveBtn)
                    sleep(10000)
                    comm.showLogToFile("点击Set-username")
                    let setusernameBtn = selector().text("Set username").visibleToUser(true).findOne(1000);
                    if (setusernameBtn) {
                        comm.clickObj(setusernameBtn)
                    } else {
                        comm.showLogToFile("没有set-usernameBtn按钮和按钮")
                        // return "没有set-usernameBtn按钮和按钮"
                        //看看是不是有那个同步按钮
                        let confirmBtn = selector().textContains("Confirm").visibleToUser(true).findOne(1000)
                        if (confirmBtn) {
                            comm.showLogToFile("点击Con-firm")
                            sleep(3000)
                            let saveChack = selector().className('android.widget.CheckBox').visibleToUser(true).findOne(1000)
                            if (saveChack) {
                                if (saveChack.checked() == false) {
                                    comm.clickObj(saveChack)
                                    sleep(3000)
                                }
                            }
                            comm.clickObj(confirmBtn)
                        }
                    }
                    sleep(15000)
                    //判断有没有回到那个页面
                    if (selector().textContains(username_new).visibleToUser(true).exists() && selector().text('Edit profile').visibleToUser(true).exists()) {
                        comm.showLogToFile("修改成功")
                        return "success"
                    } else {
                        comm.showLogToFile("可能没成功")
                        return "可能没成功"
                    }
                }
            }

        } else {
            comm.showLogToFile("没找到个人资料按钮Edit-profil")
            return "没找到个人资料按钮Edit-profil"
        }
    }
    //
    comm.showLogToFile("默认失败")
    return "默认失败"
}

//重新登陆
function logInAgain(taskInfo) {
    comm.showLogToFile("执行重新登陆")
    //保持tk在前台
    if (currentPackage().indexOf('com.zhiliaoapp.musically') == -1) {
        if (!app.launch('com.zhiliaoapp.musically')) {
            console.log('App 启动失败')
            return "tk启动失败"
        }
        comm.showLogToFile('重启完成')
        sleep(5000)
    }
    sleep(5000)
    closeAllPop()
    sleep(30000)
    //
    // 页面进入需要登陆的页面 看看有没有 account was logged out (说明登陆失效)
    let logged_out_btn = selector().textContains("account was logged out").visibleToUser(true).findOne(1000)
    let welcome_back_text = selector().textContains("Welcome back").visibleToUser(true).findOne(1000)
    let username_text = selector().textContains(username).visibleToUser(true).findOne(1000)
    if (logged_out_btn || (welcome_back_text && username_text)) {
        //登陆失效，触发登陆逻辑
        comm.showLogToFile("登陆失效")
        //写一个函数
        let loggedOutMsg = WasLoggedOutAndLogin_v2()
        comm.showLogToFile("重新登陆函数WasLoggedOutAndLogin_v2的返回：" + loggedOutMsg)
        sleep(30000)
        if (loggedOutMsg == 'success') {
            // if (password_new != '') {
            // }
            //备份
            // httpShell('curl "http://127.0.0.1:8000/api/backup?backup_no=' + backupNo + '"')
            // return "重新登陆成功"
            comm.showLogToFile("重新登陆成功")
            sleep(10000)

            return "success"

        } else {
            return "重新登陆失败"
        }
    }
    sleep(10000)
    //
    let is_login_page = selector().textContains('Log in to TikTok').visibleToUser(true).exists()
    if (is_login_page) {
        comm.showLog("当前页为: Log in to TikTok")
        //走一下登陆流程
        //登陆失效，触发登陆逻辑
        comm.showLogToFile("需要重新登陆2")
        let loggedOutMsg = WasLoggedOutAndLogin_other_v2()
        comm.showLogToFile("重新登陆2-WasLoggedOutAndLogin_other_v2函数的返回：" + loggedOutMsg)
        if (loggedOutMsg == 'success') {
            // updateTask(2, task_id, 1, "重新登陆成功", username)
            comm.showLogToFile("重新登陆成功")
            sleep(10000)
            // return "重新登陆成功"
            return "success"
            //
        } else if (loggedOutMsg == '还有验证码存在，不成功') {
            return "还有验证码存在，不成功"
        } else {
            return "重新登陆失败"
        }
    }
    return "默认失败，没有需要登陆的页面"
}

//
function logInAgain_v2(taskInfo) {
    comm.showLogToFile("执行重新登陆")
    //保持tk在前台
    if (currentPackage().indexOf('com.zhiliaoapp.musically') == -1) {
        if (!app.launch('com.zhiliaoapp.musically')) {
            console.log('App 启动失败')
            return "tk启动失败"
        }
        comm.showLogToFile('重启完成')
        sleep(5000)
    }
    sleep(5000)
    closeAllPop()
    sleep(30000)
    //生日页面存在
    //text = Already have an account? Log in
    let alreadyhaveanaccountText = selector().textContains('Already have an account').visibleToUser(true).findOne(1000)
    if (alreadyhaveanaccountText) {
        comm.clickObj(alreadyhaveanaccountText)
        sleep(15000)
        closeAllPop()
        sleep(15000)
    } else {
        comm.showLogToFile("没有生日页面的Already-have-an-account和Log-in")
    }
    //
    // 页面进入需要登陆的页面 看看有没有 account was logged out (说明登陆失效)
    let logged_out_btn = selector().textContains("account was logged out").visibleToUser(true).findOne(1000)
    let welcome_back_text = selector().textContains("Welcome back").visibleToUser(true).findOne(1000)
    let username_text = selector().textContains(username).visibleToUser(true).findOne(1000)
    if (logged_out_btn || (welcome_back_text && username_text)) {
        //登陆失效，触发登陆逻辑
        comm.showLogToFile("登陆失效")
        //写一个函数
        let loggedOutMsg = WasLoggedOutAndLogin_v3()
        comm.showLogToFile("重新登陆函数WasLoggedOutAndLogin_v3的返回：" + loggedOutMsg)
        sleep(30000)
        if (loggedOutMsg == 'success') {
            // if (password_new != '') {
            // }
            //备份
            // httpShell('curl "http://127.0.0.1:8000/api/backup?backup_no=' + backupNo + '"')
            // return "重新登陆成功"
            comm.showLogToFile("重新登陆成功")
            sleep(10000)

            return "success"

        } else {
            return "重新登陆失败"
        }
    }
    sleep(10000)
    //
    let is_login_page = selector().textContains('Log in to TikTok').visibleToUser(true).exists()
    if (is_login_page) {
        comm.showLog("当前页为: Log in to TikTok")
        //走一下登陆流程
        //登陆失效，触发登陆逻辑
        comm.showLogToFile("需要重新登陆2")
        let loggedOutMsg = WasLoggedOutAndLogin_v3()
        comm.showLogToFile("重新登陆2-WasLoggedOutAndLogin_v3函数的返回：" + loggedOutMsg)
        if (loggedOutMsg == 'success') {
            // updateTask(2, task_id, 1, "重新登陆成功", username)
            comm.showLogToFile("重新登陆成功")
            sleep(10000)
            // return "重新登陆成功"
            return "success"
            //
        } else if (loggedOutMsg == '还有验证码存在，不成功') {
            return "还有验证码存在，不成功"
        } else {
            return "重新登陆失败"
        }
    }
    return "默认失败，没有需要登陆的页面"
}

//获取字符串中的http/https开头的链接
function getStrUrl(s) {
    var reg = /(http:\/\/|https:\/\/)((\w|=|\?|\.|\/|&|-)+)/g;
    var reg = /(https?|http|ftp|file):\/\/[-A-Za-z0-9+&@#/%?=~_|!:,.;]+[-A-Za-z0-9+&@#/%=~_|]/g;
    s = s.match(reg);
    return (s && s.length ? s[0] : null);
}

//打开浏览器
function openWebTiktok(url) {
    //"https://www.tiktok.com/t/ZP8NeDGfV/"
    app.openUrl(url)
    sleep(3000)
    let agreebtn = selector().textContains('Agree').visibleToUser(true).findOne(8000)
    if (agreebtn) {
        comm.clickObj(agreebtn)
        sleep(10000)
    }
    let sx = random(1500, 1600)
    if (device.height < 1500) {
        sx = device.height - random(300, 350)
    }
    swipe(random(300, 330), sx, random(300, 330), random(100, 130), random(100, 300))
    sleep(2000)
    let joinbtn = selector().textContains('Jion now').visibleToUser(true).findOne(18000)
    if (joinbtn) {
        let joinAr = selector().textContains('Jion now').visibleToUser(true).find()
        for (let i = 0; i < joinAr.length; i++) {
            console.log(joinAr[i])
            comm.clickObj(joinAr[i])
        }
        //comm.clickObj(joinAr[joinAr.length-1]) 
    } else {
        // click(360, 465)

        comm.showLog('fuck dog')
    }
    for (let i = 0; i < 30; i++) {
        let okbtn = selector().textContains('OK').visibleToUser(true).findOne(500)
        if (okbtn) {
            comm.clickObj(okbtn)
            break
        }
    }
    return true
}


function httpShell(cmdStr) {
    return comm.httpShell(cmdStr, clientNo)
}

// 截图
function sysScreenCapture() {
    try {
        httpShell("screencap -p /sdcard/tk.png")
        sleep(3000)
        return images.read("/sdcard/tk.png");
    } catch (error) {
        console.log(error)
    }
    return null
}

// 订单完成后的截图
function sysScreenCapture_OrderFinish(task_id) {
    try {
        httpShell("screencap -p /sdcard/taskid_" + task_id + ".png")
        sleep(3000)
        // 校验截图是否存在
        if (files.exists("/sdcard/taskid_" + task_id + ".png")) {
            return true
        } else {
            return false
        }
    } catch (error) {
        console.log(error)
        return false
    }
}

function updateTask(task_type, task_id, status, note, username) {
    if (task_id < 1) {
        return
    }
    let url = httpServer + "/api/updateTask?client_no=" + clientNo + "&key=63347f5d946164a23faca26b78a91e1c&task_type=" + task_type + "&task_id=" + task_id + "&status=" + status + "&note=" + note + "&backup_no=" + backupNo
    if (username != null && username != '') {
        url = url + "&username=" + username
    }
    comm.httpToString(url)
}


// function finishTask(task_type,task_id,status,note,username)
function finishTask(status, username, account_id) {
    if (task_id < 1) {
        return
    }
    let url = httpServer + "/api/finishTask?client_no=" + clientNo + "&key=63347f5d946164a23faca26b78a91e1c&task_id=" + task_id + "&status=" + status + "&backup_no=" + backupNo + "&account_id=" + account_id
    if (username != null && username != '') {
        url = url + "&username=" + username
    }
    comm.httpToString(url)
}

// 修改过新增了模拟回滑
function imageCodeVerify_test(isEmailRegister, isMobile) {


    //刷新按钮
    let refreshBtn = selector().textContains('Refresh').visibleToUser(true).findOne(3000)
    if (!refreshBtn) {
        // 找刷新按钮，如果没有，找重新加载
        refreshBtn = selector().textContains('Reload').visibleToUser(true).findOne(3000)
        if (!refreshBtn) {
            // 找重新加载按钮，如果没有，找refresh-button
            refreshBtn = selector().idContains('refresh-button').visibleToUser(true).findOne(3000)
        }
        // 找完之后判断，如果还是没找到
        if (!refreshBtn) {
            // return '刷新验证码图片按钮控件未找到'
            comm.showLog("刷新验证码图片按钮控件未找到")
            // sleep(300000)
            // return "刷新验证码图片按钮控件未找到"
        }
    }

    let loadingTimeLimit = 0
    let loadingMustTime = 0
    let ffcnt = 0;

    while (true) {

        let imageLoading = selector().textContains('Loading').exists()
        if (!imageLoading) {

            console.log('验证码图片已加载出来')
            sleep(5000)
            //判断一下是否由于网络原因未加载出来图片
            let networkErrorInImageLoadingExist = selector().textContains('Network issue. Please try again.').visibleToUser(true).exists()
            let noInternetConnectExist = selector().textContains('No internet connection. Please try again').visibleToUser(true).exists()
            if (networkErrorInImageLoadingExist || noInternetConnectExist) {

                console.log('出现无出现无网络提示')
                //再次设置一下代理 
                //点击refresh
                if (refreshBtn) {
                    comm.clickObj(refreshBtn)
                } else {
                    click(862.9, 1589.1)
                }
                sleep(1500)

            } else {

                comm.showLog("插眼---------")

                //全部加载出来了
                let captchaImage = selector().idContains('captcha-verify-image').visibleToUser(true).findOne(1000)
                // let VerifyContinue = selector().textContains('Verify to continue:').visibleToUser(true).findOne(5000)
                let VerifyContinue = selector().textContains('Drag the puzzle piece').visibleToUser(true).findOne(5000)
                let Drag_the = selector().textContains('Drag the puzzle').visibleToUser(true).findOne(5000)
                if (VerifyContinue) {
                    captchaImage = selector().idContains('captcha-verify-image').visibleToUser(true).findOne(20000)
                    if (!captchaImage) {

                        console.log("未找到元素：captchaImage")
                        break
                    }
                } else {
                    comm.showLog("插眼2---------")
                    // break 
                }
                let imgErr = selector().textContains('Please try again').visibleToUser(true).exists()
                if (imgErr) {

                    console.log('出现网络问题,点击刷新重试')
                    comm.clickObj(refreshBtn)
                    sleep(20000)
                    for (let l = 0; l < 6; l++) {
                        imageLoading = selector().textContains('Loading').exists()
                        if (!imageLoading) {
                            break
                        } else {
                            sleep(6000)
                        }
                    }
                    continue
                }
                //检测二维码图片加载完成

                let capImg = sysScreenCapture();
                comm.showLog("开始切割图片");
                let x = VerifyContinue.bounds().left
                let y = VerifyContinue.bounds().bottom + 26
                let w = device.width - VerifyContinue.bounds().left - VerifyContinue.bounds().left
                let h = Drag_the.bounds().top - VerifyContinue.bounds().bottom - 100
                console.log("x:" + x)
                console.log("y:" + y)
                console.log("w:" + w)
                console.log("h:" + h)


                for (let c = 0; c < 10; c++) {

                    capImg = images.read("/sdcard/tk.png")
                    if (!capImg) {
                        comm.showLog("fuck_" + c)
                        sleep(3000)
                    } else {
                        break
                    }
                }
                capImg = images.clip(capImg, x, y, w, h);
                //capImg = images.clip(capImg, bounds.left, bounds.top, bounds.right-bounds.left, bounds.bottom-bounds.top);
                let base64 = images.toBase64(capImg, 'jpg', 80);
                if (base64.length > 3000) {

                    try {

                        comm.showLog("滑块图片大小：" + base64.length);
                        let token = "Hhe8XEYDbYPEiYbeS1eKW0iUdX5jAaR+z6a3Fm3Ii34";
                        let verify_type = "20110";
                        //http://70.39.126.2:8089
                        //let dRes=http.postJson(httpServer+"/api/YdmVerify",{base64:base64,token:token,verify_type:verify_type}) 
                        let dRes = http.postJson("http://70.39.126.2:8089/api/YdmVerify", { base64: base64, token: token, verify_type: verify_type })
                        let rString = dRes.body.string()
                        console.log(rString)
                        let yJson = JSON.parse(rString);

                        if (yJson.code == 10000) {

                            //||(result && result.result == 'success')

                            comm.showLog("验证码解析成功,开始模拟滑动")
                            // let randomTime = random(1500, 2100);
                            // let randomTime = random(2500, 3500);
                            let randomTime = random(3000, 4000);
                            // let randomTime1 = random(1000, 2000);
                            let scdBounds = [265, 1785]
                            let secsdkCaptDrag = selector().idContains('secsdk-captcha-drag-wrapper').visibleToUser(true).findOne(20000)
                            if (!secsdkCaptDrag) {

                                comm.showLog('验证码滑块按钮控件未找到，尝试使用坐标')
                                // return '验证码滑块按钮控件未找到'
                            } else {
                                scdBounds = secsdkCaptDrag.bounds()
                            }
                            let pos = []
                            // let pos2 = []
                            if (yJson.code == 10000) {
                                let sp = parseInt(yJson.data.data)  //502
                                // let secsdkCapBounds = secsdkCaptDrag.bounds()
                                let secsdkCapBounds = scdBounds
                                let startX = secsdkCapBounds.left + random(0, 100);
                                let startY = random(secsdkCapBounds.top - 5, secsdkCapBounds.bottom + 5);

                                // startX和startY是滑块的起点
                                // 滑块的终点是startX+sp
                                // 先确定起点和第一段变速点
                                let randomMidX = random(50, 100) //变速断点
                                let randomMidY = random(startY - 2, startY + 2)
                                // let bl = random(20, 50) //随机点
                                let bl = random(-20, 20) //随机点
                                pos.push([startX, randomMidY])
                                randomMidY = random(startY - 20, startY + 20)
                                pos.push([startX + sp - randomMidX, randomMidY])
                                // comm.showLog("第一段："+pos2[0]+","+pos2[1])
                                //
                                // 再确定第二段变速点
                                // pos2.push([startX+sp-randomMidX, randomMidY])
                                // randomMidY = random(startY-2,startY+2)
                                pos.push([startX + sp + randomMidX + bl, random(startY - 20, startY + 20)])
                                pos.push([startX + sp + random(-2, 2), random(startY - 20, startY + 20)])
                                // comm.showLog("第二段："+pos2[0]+","+pos2[1]+","+pos2[2])
                                comm.showLog("打印滑动：" + pos[0] + "," + pos[1] + "," + pos[2] + "," + pos[3])
                                // pos2.push([startX, random(startY-2,startY+2)]);
                                // // pos.push([startX+sp, random(startY-2,startY+2)]);
                                // pos2.push([startX+sp, random(startY-2,startY+2)]);
                            } else {
                                // let list = result.data.list;

                                // let secsdkCapBounds = secsdkCaptDrag.bounds()
                                // let startX = secsdkCapBounds.left + random(0, 100);
                                // let startY = random(secsdkCapBounds.top, secsdkCapBounds.bottom);
                                // for(var i = 0; i < list.length; i++){

                                //     startX += list[i];
                                //     pos.push([startX, random(startY-2,startY+2)]);
                                // }
                            }
                            // 先滑动第一段
                            gesture(randomTime, pos)
                            // 再滑动第二段
                            // gesture(randomTime1, pos2)


                            sleep(3000)
                            //如果是邮箱注册,走下面的逻辑
                            if (isEmailRegister) {
                                for (var i = 0; i < 15; i++) {

                                    console.log("正在检查...是否到达 Create password 页");
                                    let createPasswordPage = selector().textContains('Create password').findOne(1000)
                                    if (createPasswordPage) {
                                        comm.showLog("滑块验证成功,到达创建密码页");
                                        return 'success';
                                    }
                                    console.log("正在检查...是否到达 输入验证码 页");
                                    let codeTip = selector().textContains("6-digit").findOne(1000)
                                    if (codeTip) {

                                        comm.showLog("滑块验证成功,需要验证码");
                                        return 'success';
                                    }
                                }

                                let createPasswordPage = selector().textContains('Create password').findOne(1000)
                                let codeTip = selector().textContains("6-digit").findOne(1000)
                                if (!createPasswordPage && !codeTip) {

                                    //console.log('创建密码页面未找到')
                                    //判断是否还在验证码页面
                                    let refreshBtnExist = selector().textContains('Reload').visibleToUser(true).exists()
                                    if (refreshBtnExist) {
                                        console.log('刷新按钮还存在,还位于验证码页面,进行重试')
                                        comm.clickObj(refreshBtn)
                                        sleep(10000)
                                    } else {

                                        //判断是否还在邮箱输入页面,验证码验证通过了而由于网络问题导致没跳转过去
                                        let pageInEmailInputExists = selector().textContains('Next').visibleToUser(true).exists()
                                        if (pageInEmailInputExists) {

                                            console.log('处于输入邮箱页面')
                                            //再次设置一下代理 
                                            let pageInEmailInput = selector().textContains('Next').visibleToUser(true).findOne(5000)
                                            comm.clickObj(pageInEmailInput)
                                            sleep(1500)
                                            break
                                        } else {
                                            console.log('不处于输入邮箱页面')
                                        }
                                        //判断号是否已经注册过了
                                        let youAreAlreadySignPag = selector().textContains('You\'ve already signed up').enabled(true).visibleToUser(true).exists()
                                        if (youAreAlreadySignPag) {
                                            console.log('该邮箱账号已被注册过')
                                            return '该邮箱账号已被注册过'
                                        }

                                        createPasswordPage = selector().textContains('Create password').findOne(10000)
                                        if (createPasswordPage) {
                                            comm.showLog("滑块验证完成")
                                            break
                                        }
                                        codeTip = selector().textContains("6-digit").findOne(10000)
                                        if (codeTip) {
                                            comm.showLog("滑块验证完成")
                                            break
                                        }
                                    }
                                } else {
                                    let imageVerifyTips = selector().textContains('Verify to continue:').visibleToUser(true).findOne(2000)
                                    if (!imageVerifyTips) {

                                        comm.showLog("滑块验证完成")
                                        break
                                    } else {
                                        comm.showLog("Verify to continue 111 ")
                                    }
                                }
                            } else {
                                let imageVerifyTips = selector().textContains('Verify to continue:').visibleToUser(true).findOne(2000)
                                if (imageVerifyTips) {
                                    sleep(3000)
                                    imageVerifyTips = selector().textContains('Verify to continue:').visibleToUser(true).findOne(2000)
                                }
                                if (imageVerifyTips) {
                                    sleep(3000)
                                    imageVerifyTips = selector().textContains('Verify to continue:').visibleToUser(true).findOne(2000)
                                }
                                if (imageVerifyTips) {
                                    sleep(3000)
                                    imageVerifyTips = selector().textContains('Verify to continue:').visibleToUser(true).findOne(2000)
                                }
                                if (!imageVerifyTips) {

                                    comm.showLog("滑块验证完成")
                                    break
                                } else {
                                    comm.showLog("Verify to continue 111 ")
                                }
                            }
                        } else {
                            let codeTip = selector().textContains("6-digit").findOne(10000)
                            if (codeTip) {
                                comm.showLog("滑块验证完成")
                                return 'success'
                            }
                            comm.showLog("验证码解析失败")
                            //刷新验证码重试
                            comm.clickObj(refreshBtn)
                            sleep(10000)
                        }

                    } catch (e) {
                        console.log('发生错误')
                        console.log(e)
                        ffcnt++
                        if (ffcnt > 5) {
                            return "发生错误"
                        } else {
                            sleep(5000)
                        }
                    }

                } else {

                    comm.showLog('没有图片')
                    //刷新验证码
                    comm.clickObj(refreshBtn)
                    sleep(10000)
                }
            }
        } else {

            if (loadingMustTime > 5) {
                return "验证码图片未加载出来"
            }
            if (loadingTimeLimit >= 20) {
                loadingTimeLimit = 0
                loadingMustTime++
                //点击refresh
                comm.clickObj(refreshBtn)
                sleep(10000)

            } else {
                console.log('验证码图片未加载出来')
                loadingTimeLimit++
                sleep(1500)
            }
        }
    }

    //判断验证码是否还在
    let timeLimitImageVefiry = 0
    while (true) {

        let imageVerifyTipsExist = selector().textContains('Verify to continue:').enabled(true).visibleToUser(true).exists()
        if (!imageVerifyTipsExist) {
            console.log('验证码图片验证完之后不存在')
            break
        }
        if (timeLimitImageVefiry > 30) {
            console.log('验证码图片验证完之后还存在,超出时间限制')
            return '验证码图片验证完之后还存在'
        }
        timeLimitImageVefiry++
        console.log('验证码图片验证完之后还存在')
        sleep(1500)
    }
    return 'success'
}


//现在修改用这个
function imageCodeVerify_test2(isEmailRegister, isMobile) {

    let limitTimes = 0
    let tryTimes = 0
    comm.showLog("标记")
    while (true) {

        if (limitTimes > 15) {
            console.log('验证码初步加载超过时间,重新设置代理')
            limitTimes = 0
            sleep(1000)
            back()
            sleep(500)
            back();
            sleep(1000)
            let emailNext = selector().textContains('Next').visibleToUser(true).findOne(2000)
            if (emailNext) {
                comm.clickObj(emailNext)
            }
            tryTimes++
        }
        let codeTip = selector().textContains("6-digit").findOne(1000);
        if (codeTip) {
            return 'success';
        }
        let select2Text = selector().textContains("Select 2 objects").visibleToUser(true).findOne(1000)
        if (select2Text) {
            comm.showLog("Select 2 objects")

        } else {
            let imageVerifyTips = selector().textContains('Verify to continue:').visibleToUser(true).findOne(1000)
            if (imageVerifyTips) {
                break
            }
        }
        let verifyAppearLoading = selector().bounds(485, 992, 595, 1102).visibleToUser(true).enabled(true).exists()
        if (!verifyAppearLoading) {
            console.log('图片验证码出现前的loading控件不存在')
            break
        }
        console.log('图片验证码出现前的loading控件存在')

        let refreshBtn = selector().textContains('Refresh').visibleToUser(true).findOne(1000)
        if (!refreshBtn) {
            refreshBtn = selector().idContains('refresh_button').visibleToUser(true).findOne(1000)
        }
        if (refreshBtn) {
            break
        }
        if (limitTimes == 3 && !isEmailRegister) {

            back();
            sleep(1000)
            back();
            sleep(2000)
            let forgotText = selector().textContains("Forgot pass").findOne(6000)
            b = forgotText.bounds()
            y = b.centerY() + 123
            let xxx = b.centerX() + 300;
            click(xxx, y)
            sleep(3000)
        }
        if (limitTimes > 20) {
            return "验证超时"
        }
        sleep(1000)
        limitTimes++
        if (isMobile) {

            let select2Text = selector().textContains("Select 2 objects").visibleToUser(true).findOne(15000)
            let imageVerifyTips = selector().textContains('Verify to continue:').visibleToUser(true).findOne(5000)
            if (imageVerifyTips) {
                break
            }
            select2Text = selector().textContains("Select 2 objects").visibleToUser(true).findOne(15000)
            if (select2Text) {
                comm.showLog("Select 2 objects")
                break
            } else if (limitTimes == 2) {

                back();
                sleep(500)
                back();
                sleep(2000)
                let sendCode = selector().textContains("Send code").visibleToUser(true).findOne(5000);
                if (sendCode) {

                    comm.clickObj(sendCode)
                    continue;
                }
            }
            if (limitTimes > 5) {
                return "验证超时"
            }
        }

        if (tryTimes >= 5) {

            console.log('验证码初步加载超过重新设置代理次数,任务失败')
            return '验证码初步加载超过重新设置代理次数,任务失败'
        }
    }
    comm.showLog("标记2")
    //刷新按钮
    let refreshBtn = selector().textContains('Refresh').visibleToUser(true).findOne(3000)
    if (!refreshBtn) {

        refreshBtn = selector().textContains('Reload').visibleToUser(true).findOne(3000)
        if (!refreshBtn) {
            refreshBtn = selector().idContains('refresh_button').visibleToUser(true).findOne(3000)
        }
        if (!refreshBtn) {
            comm.showLog("刷新验证码图片按钮控件未找到")
            return '刷新验证码图片按钮控件未找到'
        }
    }
    let select2Text = selector().textContains("Select 2 objects").visibleToUser(true).findOne(1000)
    if (select2Text) {
        return select2ImageVcode();
    }
    comm.showLog("标记3")
    while (true) {
        //这里没找到
        // let imageVerifyTips = selector().textContains('Verify to continue:').visibleToUser(true).findOne(50000)
        let imageVerifyTips = selector().textContains('Verify to continue:').visibleToUser(true).findOne(50000) || selector().textContains('puzzle piece into place').visibleToUser(true).findOne(50000)
        if (!imageVerifyTips) {

            console.log('图片验证码未找到')

            //这里可能是网络原因,图片未加载出来
            let networkErr = selector().textContains('Please try again').visibleToUser(true).exists()
            if (networkErr && refreshBtn) {

                console.log('出现网络问题,点击刷新重试')
                comm.clickObj(refreshBtn)

            } else {
                return '图片验证码未找到'
            }

        } else {
            //sleep(random(1500, 3000))
            break
        }
        //sleep(5000)
    }

    let loadingTimeLimit = 0
    let loadingMustTime = 0
    let ffcnt = 0;
    comm.showLog("标记4")
    while (true) {

        let imageLoading = selector().textContains('Loading').exists()
        if (!imageLoading) {
            comm.showLog("标记4.1")
            console.log('验证码图片已加载出来')
            sleep(5000)
            //判断一下是否由于网络原因未加载出来图片
            let networkErrorInImageLoadingExist = selector().textContains('Network issue. Please try again.').visibleToUser(true).exists()
            let noInternetConnectExist = selector().textContains('No internet connection. Please try again').visibleToUser(true).exists()
            if (networkErrorInImageLoadingExist || noInternetConnectExist) {

                console.log('出现无出现无网络提示')
                //再次设置一下代理 
                //点击refresh
                comm.clickObj(refreshBtn)
                sleep(1500)

            } else {
                comm.showLog("标记4.2")
                //全部加载出来了
                let captchaImage = selector().idContains('captcha-verify-image').visibleToUser(true).findOne(1000)
                let VerifyContinue = selector().textContains('Verify to continue:').visibleToUser(true).findOne(5000)
                // let Drag_the = selector().textContains('Drag the puzzle').visibleToUser(true).findOne(5000)
                let Audio = selector().textContains('Audio').visibleToUser(true).findOne(5000)
                if (VerifyContinue) {
                    comm.showLog("VerifyContinue存在!!!")
                    captchaImage = selector().idContains('captcha-verify-image').visibleToUser(true).findOne(20000)
                    if (!captchaImage) {
                        console.log("未找到元素:captchaImage")
                        break
                    }
                } else {
                    comm.showLog("VerifyContinue不存在,找puzzle piece into place")
                    VerifyContinue = selector().textContains('puzzle piece into place').visibleToUser(true).findOne(5000)
                    if (VerifyContinue) {
                        comm.showLog("puzzle piece into place存在!!!")
                        captchaImage = selector().idContains('captcha-verify-image').visibleToUser(true).findOne(20000)
                        if (!captchaImage) {

                            console.log("未找到元素:captchaImage")
                            break
                        }
                    } else {
                        comm.showLog("puzzle piece into place不存在")
                        break
                    }
                }
                let imgErr = selector().textContains('Please try again').visibleToUser(true).exists()
                if (imgErr) {

                    console.log('出现网络问题,点击刷新重试')
                    comm.clickObj(refreshBtn)
                    sleep(20000)
                    for (let l = 0; l < 6; l++) {
                        imageLoading = selector().textContains('Loading').exists()
                        if (!imageLoading) {
                            break
                        } else {
                            sleep(6000)
                        }
                    }
                    continue
                }
                //检测二维码图片加载完成

                let capImg = sysScreenCapture();
                comm.showLog("开始切割图片");
                let x = VerifyContinue.bounds().left //对 108
                let y = VerifyContinue.bounds().bottom + 26  //846
                let w = device.width - VerifyContinue.bounds().left - VerifyContinue.bounds().left //864
                // let h=Drag_the.bounds().top-VerifyContinue.bounds().bottom-100 // 
                let h = Audio.bounds().top - VerifyContinue.bounds().bottom - 150
                console.log("x:" + x)
                console.log("y:" + y)
                console.log("w:" + w)
                console.log("h:" + h)


                for (let c = 0; c < 10; c++) {

                    capImg = images.read("/sdcard/tk.png")
                    if (!capImg) {
                        comm.showLog("fuck_" + c)
                        sleep(3000)
                    } else {
                        break
                    }
                }
                capImg = images.clip(capImg, x, y, w, h);
                //capImg = images.clip(capImg, bounds.left, bounds.top, bounds.right-bounds.left, bounds.bottom-bounds.top);
                let base64 = images.toBase64(capImg, 'jpg', 80);
                if (base64.length > 3000) {

                    try {

                        comm.showLog("滑块图片大小：" + base64.length);
                        let token = "Hhe8XEYDbYPEiYbeS1eKW0iUdX5jAaR+z6a3Fm3Ii34";
                        let verify_type = "20110";
                        //http://70.39.126.2:8089
                        //let dRes=http.postJson(httpServer+"/api/YdmVerify",{base64:base64,token:token,verify_type:verify_type}) 
                        let dRes = http.postJson("http://70.39.126.2:8089/api/YdmVerify", { base64: base64, token: token, verify_type: verify_type })
                        let rString = dRes.body.string()
                        console.log(rString)
                        let yJson = JSON.parse(rString);

                        if (yJson.code == 10000) {

                            //||(result && result.result == 'success')

                            comm.showLog("验证码解析成功,开始模拟滑动")
                            // let randomTime = random(1500, 2100);
                            // let randomTime = random(2500, 3500);
                            let randomTime = random(3000, 4000);
                            // let randomTime1 = random(1000, 2000);
                            // let secsdkCaptDrag = selector().idContains('secsdk-captcha-drag-wrapper').visibleToUser(true).findOne(20000)
                            // let secsdkCaptDrag = selector().idContains('captcha').visibleToUser(true).findOne(20000)
                            let secsdkCaptDrag = selector().idContains('captcha_slide_button').visibleToUser(true).findOne(20000)
                            // id("captcha_slide_button")
                            if (!secsdkCaptDrag) {

                                console.log('验证码滑块按钮控件未找到')
                                return '验证码滑块按钮控件未找到'

                            }
                            let pos = []
                            // let pos2 = []
                            if (yJson.code == 10000) {
                                let sp = parseInt(yJson.data.data)  //502
                                let secsdkCapBounds = secsdkCaptDrag.bounds()
                                let startX = secsdkCapBounds.left + random(0, 100);
                                let startY = random(secsdkCapBounds.top - 5, secsdkCapBounds.bottom + 5);

                                // startX和startY是滑块的起点
                                // 滑块的终点是startX+sp
                                // 先确定起点和第一段变速点
                                let randomMidX = random(50, 100) //变速断点
                                let randomMidY = random(startY - 2, startY + 2)
                                // let bl = random(20, 50) //随机点
                                let bl = random(-20, 20) //随机点
                                pos.push([startX, randomMidY])
                                randomMidY = random(startY - 20, startY + 20)
                                pos.push([startX + sp - randomMidX, randomMidY])
                                // comm.showLog("第一段："+pos2[0]+","+pos2[1])
                                //
                                // 再确定第二段变速点
                                // pos2.push([startX+sp-randomMidX, randomMidY])
                                // randomMidY = random(startY-2,startY+2)
                                pos.push([startX + sp + randomMidX + bl, random(startY - 20, startY + 20)])
                                pos.push([startX + sp + random(-2, 2), random(startY - 20, startY + 20)])
                                // comm.showLog("第二段："+pos2[0]+","+pos2[1]+","+pos2[2])
                                comm.showLog("打印滑动：" + pos[0] + "," + pos[1] + "," + pos[2] + "," + pos[3])
                                // pos2.push([startX, random(startY-2,startY+2)]);
                                // // pos.push([startX+sp, random(startY-2,startY+2)]);
                                // pos2.push([startX+sp, random(startY-2,startY+2)]);
                            } else {
                                // let list = result.data.list;

                                // let secsdkCapBounds = secsdkCaptDrag.bounds()
                                // let startX = secsdkCapBounds.left + random(0, 100);
                                // let startY = random(secsdkCapBounds.top, secsdkCapBounds.bottom);
                                // for(var i = 0; i < list.length; i++){

                                //     startX += list[i];
                                //     pos.push([startX, random(startY-2,startY+2)]);
                                // }
                            }
                            // 先滑动第一段
                            gesture(randomTime, pos)
                            // 再滑动第二段
                            // gesture(randomTime1, pos2)


                            sleep(3000)
                            //如果是邮箱注册,走下面的逻辑
                            if (isEmailRegister) {
                                for (var i = 0; i < 15; i++) {

                                    console.log("正在检查...是否到达 Create password 页");
                                    let createPasswordPage = selector().textContains('Create password').findOne(1000)
                                    if (createPasswordPage) {
                                        comm.showLog("滑块验证成功,到达创建密码页");
                                        return 'success';
                                    }
                                    console.log("正在检查...是否到达 输入验证码 页");
                                    let codeTip = selector().textContains("6-digit").findOne(1000)
                                    if (codeTip) {

                                        comm.showLog("滑块验证成功,需要验证码");
                                        return 'success';
                                    }
                                }

                                let createPasswordPage = selector().textContains('Create password').findOne(1000)
                                let codeTip = selector().textContains("6-digit").findOne(1000)
                                if (!createPasswordPage && !codeTip) {

                                    //console.log('创建密码页面未找到')
                                    //判断是否还在验证码页面
                                    let refreshBtnExist = selector().textContains('Reload').visibleToUser(true).exists()
                                    if (refreshBtnExist) {
                                        console.log('刷新按钮还存在,还位于验证码页面,进行重试')
                                        comm.clickObj(refreshBtn)
                                        sleep(10000)
                                    } else {

                                        //判断是否还在邮箱输入页面,验证码验证通过了而由于网络问题导致没跳转过去
                                        let pageInEmailInputExists = selector().textContains('Next').visibleToUser(true).exists()
                                        if (pageInEmailInputExists) {

                                            console.log('处于输入邮箱页面')
                                            //再次设置一下代理 
                                            let pageInEmailInput = selector().textContains('Next').visibleToUser(true).findOne(5000)
                                            comm.clickObj(pageInEmailInput)
                                            sleep(1500)
                                            break
                                        } else {
                                            console.log('不处于输入邮箱页面')
                                        }
                                        //判断号是否已经注册过了
                                        let youAreAlreadySignPag = selector().textContains('You\'ve already signed up').enabled(true).visibleToUser(true).exists()
                                        if (youAreAlreadySignPag) {
                                            console.log('该邮箱账号已被注册过')
                                            return '该邮箱账号已被注册过'
                                        }

                                        createPasswordPage = selector().textContains('Create password').findOne(10000)
                                        if (createPasswordPage) {
                                            comm.showLog("滑块验证完成")
                                            break
                                        }
                                        codeTip = selector().textContains("6-digit").findOne(10000)
                                        if (codeTip) {
                                            comm.showLog("滑块验证完成")
                                            break
                                        }
                                    }
                                } else {
                                    let imageVerifyTips = selector().textContains('Verify to continue:').visibleToUser(true).findOne(2000)
                                    if (!imageVerifyTips) {

                                        comm.showLog("滑块验证完成")
                                        break
                                    } else {
                                        comm.showLog("Verify to continue 111 ")
                                    }
                                }
                            } else {
                                let imageVerifyTips = selector().textContains('Verify to continue:').visibleToUser(true).findOne(2000)
                                if (imageVerifyTips) {
                                    sleep(3000)
                                    imageVerifyTips = selector().textContains('Verify to continue:').visibleToUser(true).findOne(2000)
                                }
                                if (imageVerifyTips) {
                                    sleep(3000)
                                    imageVerifyTips = selector().textContains('Verify to continue:').visibleToUser(true).findOne(2000)
                                }
                                if (imageVerifyTips) {
                                    sleep(3000)
                                    imageVerifyTips = selector().textContains('Verify to continue:').visibleToUser(true).findOne(2000)
                                }
                                if (!imageVerifyTips) {

                                    comm.showLog("滑块验证完成")
                                    break
                                } else {
                                    comm.showLog("Verify to continue 111 ")
                                }
                            }
                        } else {
                            let codeTip = selector().textContains("6-digit").findOne(10000)
                            if (codeTip) {
                                comm.showLog("滑块验证完成")
                                return 'success'
                            }
                            comm.showLog("验证码解析失败")
                            //刷新验证码重试
                            comm.clickObj(refreshBtn)
                            sleep(10000)
                        }

                    } catch (e) {
                        console.log('发生错误')
                        console.log(e)
                        ffcnt++
                        if (ffcnt > 5) {
                            return "发生错误"
                        } else {
                            sleep(5000)
                        }
                    }

                } else {

                    comm.showLog('没有图片')
                    //刷新验证码
                    comm.clickObj(refreshBtn)
                    sleep(10000)
                }
            }
        } else {

            if (loadingMustTime > 5) {
                return "验证码图片未加载出来"
            }
            if (loadingTimeLimit >= 20) {
                loadingTimeLimit = 0
                loadingMustTime++
                //点击refresh
                comm.clickObj(refreshBtn)
                sleep(10000)

            } else {
                console.log('验证码图片未加载出来')
                loadingTimeLimit++
                sleep(1500)
            }
        }
    }
    comm.showLog("标记5")
    //判断验证码是否还在
    let timeLimitImageVefiry = 0
    while (true) {

        let imageVerifyTipsExist = selector().textContains('Verify to continue:').enabled(true).visibleToUser(true).exists()
        if (!imageVerifyTipsExist) {
            console.log('验证码图片验证完之后不存在')
            break
        }
        if (timeLimitImageVefiry > 30) {
            console.log('验证码图片验证完之后还存在,超出时间限制')
            return '验证码图片验证完之后还存在'
        }
        timeLimitImageVefiry++
        console.log('验证码图片验证完之后还存在')
        sleep(1500)
    }
    return 'success'
}
function imageCodeVerify_test3(isEmailRegister, isMobile) {


    comm.showLog("标记2")
    //刷新按钮
    let refreshBtn = selector().textContains('Refresh').visibleToUser(true).findOne(3000)
    if (!refreshBtn) {

        refreshBtn = selector().textContains('Reload').visibleToUser(true).findOne(3000)
        if (!refreshBtn) {
            refreshBtn = selector().idContains('refresh_button').visibleToUser(true).findOne(3000)
        }
        if (!refreshBtn) {
            comm.showLog("刷新验证码图片按钮控件未找到")
            return '刷新验证码图片按钮控件未找到'
        }
    }
    let select2Text = selector().textContains("Select 2 objects").visibleToUser(true).findOne(1000)
    if (select2Text) {
        return select2ImageVcode();
    }
    comm.showLog("标记3")
    while (true) {
        //这里没找到
        // let imageVerifyTips = selector().textContains('Verify to continue:').visibleToUser(true).findOne(50000)
        let imageVerifyTips = selector().textContains('Verify to continue:').visibleToUser(true).findOne(10000) || selector().textContains('puzzle piece into place').visibleToUser(true).findOne(10000)
        if (!imageVerifyTips) {

            console.log('图片验证码未找到')

            //这里可能是网络原因,图片未加载出来
            let networkErr = selector().textContains('Please try again').visibleToUser(true).exists()
            if (networkErr && refreshBtn) {

                console.log('出现网络问题,点击刷新重试')
                comm.clickObj(refreshBtn)

            } else {
                return '图片验证码未找到'
            }

        } else {
            //sleep(random(1500, 3000))
            break
        }
        //sleep(5000)
    }

    let loadingTimeLimit = 0
    let loadingMustTime = 0
    let ffcnt = 0;
    comm.showLog("标记4")
    while (true) {

        let imageLoading = selector().textContains('Loading').exists()
        if (!imageLoading) {
            comm.showLog("标记4.1")
            console.log('验证码图片已加载出来')
            sleep(5000)
            //判断一下是否由于网络原因未加载出来图片
            let networkErrorInImageLoadingExist = selector().textContains('Network issue. Please try again.').visibleToUser(true).exists()
            let noInternetConnectExist = selector().textContains('No internet connection. Please try again').visibleToUser(true).exists()
            if (networkErrorInImageLoadingExist || noInternetConnectExist) {

                console.log('出现无出现无网络提示')
                //再次设置一下代理 
                //点击refresh
                comm.clickObj(refreshBtn)
                sleep(1500)

            } else {
                comm.showLog("标记4.2")
                //全部加载出来了
                let captchaImage = selector().idContains('captcha-verify-image').visibleToUser(true).findOne(1000)
                let VerifyContinue = selector().textContains('Verify to continue:').visibleToUser(true).findOne(5000)
                // let Drag_the = selector().textContains('Drag the puzzle').visibleToUser(true).findOne(5000)
                let Audio = selector().textContains('Audio').visibleToUser(true).findOne(5000)
                if (VerifyContinue) {
                    comm.showLog("VerifyContinue存在!!!")
                    captchaImage = selector().idContains('captcha-verify-image').visibleToUser(true).findOne(20000)
                    if (!captchaImage) {
                        console.log("未找到元素:captchaImage")
                        break
                    }
                } else {
                    comm.showLog("VerifyContinue不存在,找puzzle piece into place")
                    VerifyContinue = selector().textContains('puzzle piece into place').visibleToUser(true).findOne(5000)
                    if (VerifyContinue) {
                        comm.showLog("puzzle piece into place存在!!!")
                        captchaImage = selector().idContains('captcha-verify-image').visibleToUser(true).findOne(20000)
                        if (!captchaImage) {

                            console.log("未找到元素:captchaImage")
                            break
                        }
                    } else {
                        comm.showLog("puzzle piece into place不存在")
                        break
                    }
                }
                let imgErr = selector().textContains('Please try again').visibleToUser(true).exists()
                if (imgErr) {

                    console.log('出现网络问题,点击刷新重试')
                    comm.clickObj(refreshBtn)
                    sleep(20000)
                    for (let l = 0; l < 6; l++) {
                        imageLoading = selector().textContains('Loading').exists()
                        if (!imageLoading) {
                            break
                        } else {
                            sleep(6000)
                        }
                    }
                    continue
                }
                //检测二维码图片加载完成

                let capImg = sysScreenCapture();
                comm.showLog("开始切割图片");
                let x = VerifyContinue.bounds().left //对 108
                let y = VerifyContinue.bounds().bottom + 26  //846
                let w = device.width - VerifyContinue.bounds().left - VerifyContinue.bounds().left //864
                // let h=Drag_the.bounds().top-VerifyContinue.bounds().bottom-100 // 
                let h = Audio.bounds().top - VerifyContinue.bounds().bottom - 150
                console.log("x:" + x)
                console.log("y:" + y)
                console.log("w:" + w)
                console.log("h:" + h)


                for (let c = 0; c < 10; c++) {

                    capImg = images.read("/sdcard/tk.png")
                    if (!capImg) {
                        comm.showLog("fuck_" + c)
                        sleep(3000)
                    } else {
                        break
                    }
                }
                capImg = images.clip(capImg, x, y, w, h);
                //capImg = images.clip(capImg, bounds.left, bounds.top, bounds.right-bounds.left, bounds.bottom-bounds.top);
                let base64 = images.toBase64(capImg, 'jpg', 80);
                if (base64.length > 3000) {

                    try {

                        comm.showLog("滑块图片大小：" + base64.length);
                        let token = "Hhe8XEYDbYPEiYbeS1eKW0iUdX5jAaR+z6a3Fm3Ii34";
                        let verify_type = "20110";
                        //http://70.39.126.2:8089
                        //let dRes=http.postJson(httpServer+"/api/YdmVerify",{base64:base64,token:token,verify_type:verify_type}) 
                        let dRes = http.postJson("http://70.39.126.2:8089/api/YdmVerify", { base64: base64, token: token, verify_type: verify_type })
                        let rString = dRes.body.string()
                        console.log(rString)
                        let yJson = JSON.parse(rString);

                        if (yJson.code == 10000) {

                            //||(result && result.result == 'success')

                            comm.showLog("验证码解析成功,开始模拟滑动")
                            // let randomTime = random(1500, 2100);
                            // let randomTime = random(2500, 3500);
                            let randomTime = random(3000, 4000);
                            // let randomTime1 = random(1000, 2000);
                            // let secsdkCaptDrag = selector().idContains('secsdk-captcha-drag-wrapper').visibleToUser(true).findOne(20000)
                            // let secsdkCaptDrag = selector().idContains('captcha').visibleToUser(true).findOne(20000)
                            let secsdkCaptDrag = selector().idContains('captcha_slide_button').visibleToUser(true).findOne(20000)
                            // id("captcha_slide_button")
                            if (!secsdkCaptDrag) {

                                console.log('验证码滑块按钮控件未找到')
                                return '验证码滑块按钮控件未找到'

                            }
                            // 

                            console.log("secsdkCaptDrag.top:" + secsdkCaptDrag.bounds().top)
                            console.log("secsdkCaptDrag.bottom:" + secsdkCaptDrag.bounds().bottom)
                            let pos = []
                            // let pos2 = []
                            if (yJson.code == 10000) {
                                //解析回来的数据
                                let sp = parseInt(yJson.data.data)  //443
                                comm.showLog("打印解析数据：" + sp)
                                let secsdkCapBounds = secsdkCaptDrag.bounds()
                                console.log("[控件位置]secsdkCapBounds.left:" + secsdkCapBounds.left)
                                console.log("[控件位置]secsdkCapBounds.right:" + secsdkCapBounds.right)
                                console.log("[控件位置]secsdkCapBounds.top:" + secsdkCapBounds.top)
                                console.log("[控件位置]secsdkCapBounds.bottom:" + secsdkCapBounds.bottom)
                                // 偏移的随机位置
                                let aRandom = random(20, 100)
                                let startX = secsdkCapBounds.left + aRandom;
                                // let startY = random(secsdkCapBounds.top-5, secsdkCapBounds.bottom+5);
                                let startY = random(secsdkCapBounds.top + 20, secsdkCapBounds.bottom - 20);

                                // startX和startY是滑块的起点
                                // 滑块的终点是startX+sp
                                // 先确定起点和第一段变速点
                                let randomMidX = random(-50, 50) //变速断点
                                let randomMidY = random(startY - 2, startY + 2)
                                // let bl = random(20, 50) //随机点
                                let bl = random(-20, 20) //随机点
                                pos.push([startX, randomMidY])
                                randomMidY = random(startY - 20, startY + 20)
                                pos.push([startX + sp + randomMidX, randomMidY])
                                // comm.showLog("第一段："+pos2[0]+","+pos2[1])
                                //
                                // 再确定第二段变速点
                                // pos2.push([startX+sp-randomMidX, randomMidY])
                                // randomMidY = random(startY-2,startY+2)
                                pos.push([startX + sp + randomMidX + bl, random(startY - 20, startY + 20)])
                                // pos.push([startX+sp+aRandom+random(-2,2), random(startY-20,startY+20)])
                                pos.push([startX + sp + random(-2, 2), random(startY, startY + 50)])
                                // comm.showLog("第二段："+pos2[0]+","+pos2[1]+","+pos2[2])
                                comm.showLog("打印滑动：" + pos[0] + "--" + pos[1] + "--" + pos[2] + "--" + pos[3])
                                // pos2.push([startX, random(startY-2,startY+2)]);
                                // // pos.push([startX+sp, random(startY-2,startY+2)]);
                                // pos2.push([startX+sp, random(startY-2,startY+2)]);
                            } else {
                                // {
                                //     let sp=parseInt(yJson.data.data)  //502
                                //     comm.showLog("打印解析数据："+sp)
                                //     let secsdkCapBounds = secsdkCaptDrag.bounds()
                                //     console.log("[控件位置]secsdkCapBounds.left:"+secsdkCapBounds.left)
                                //     console.log("[控件位置]secsdkCapBounds.right:"+secsdkCapBounds.right)
                                //     console.log("[控件位置]secsdkCapBounds.top:"+secsdkCapBounds.top)
                                //     console.log("[控件位置]secsdkCapBounds.bottom:"+secsdkCapBounds.bottom)
                                //     //
                                //     let aRandom = random(5, 100)
                                //     let startX = secsdkCapBounds.left + aRandom;
                                //     // let startY = random(secsdkCapBounds.top-5, secsdkCapBounds.bottom+5);
                                //     let startY = random(secsdkCapBounds.top+20, secsdkCapBounds.bottom-20);

                                //     // startX和startY是滑块的起点
                                //     // 滑块的终点是startX+sp
                                //     // 先确定起点和第一段变速点
                                //     let randomMidX = random(50, 100) //变速断点
                                //     let randomMidY = random(startY-2,startY+2)
                                //     // let bl = random(20, 50) //随机点
                                //     let bl = random(-20, 20) //随机点
                                //     pos.push([startX, randomMidY])
                                //     randomMidY = random(startY-20,startY+20)
                                //     pos.push([startX+sp-randomMidX, randomMidY])
                                //     // comm.showLog("第一段："+pos2[0]+","+pos2[1])
                                //     //
                                //     // 再确定第二段变速点
                                //     // pos2.push([startX+sp-randomMidX, randomMidY])
                                //     // randomMidY = random(startY-2,startY+2)
                                //     pos.push([startX+sp+randomMidX+bl, random(startY-20,startY+20)])
                                //     pos.push([startX+sp-aRandom+random(-2,2), random(startY-20,startY+20)])
                                //     // comm.showLog("第二段："+pos2[0]+","+pos2[1]+","+pos2[2])
                                //     comm.showLog("打印滑动："+pos[0]+"--"+pos[1]+"--"+pos[2]+"--"+pos[3])
                                //     // pos2.push([startX, random(startY-2,startY+2)]);
                                //     // // pos.push([startX+sp, random(startY-2,startY+2)]);
                                //     // pos2.push([startX+sp, random(startY-2,startY+2)]);
                                // }else{
                                // let list = result.data.list;

                                // let secsdkCapBounds = secsdkCaptDrag.bounds()
                                // let startX = secsdkCapBounds.left + random(0, 100);
                                // let startY = random(secsdkCapBounds.top, secsdkCapBounds.bottom);
                                // for(var i = 0; i < list.length; i++){

                                //     startX += list[i];
                                //     pos.push([startX, random(startY-2,startY+2)]);
                                // }
                            }
                            // 先滑动第一段
                            gesture(randomTime, pos)
                            // comm.showLog("滑了完成")
                            // return "完成"
                            // 再滑动第二段
                            // gesture(randomTime1, pos2)


                            sleep(3000)
                            //如果是邮箱注册,走下面的逻辑
                            if (isEmailRegister) {
                                for (var i = 0; i < 15; i++) {

                                    console.log("正在检查...是否到达 Create password 页");
                                    let createPasswordPage = selector().textContains('Create password').findOne(1000)
                                    if (createPasswordPage) {
                                        comm.showLog("滑块验证成功,到达创建密码页");
                                        return 'success';
                                    }
                                    console.log("正在检查...是否到达 输入验证码 页");
                                    let codeTip = selector().textContains("6-digit").findOne(1000)
                                    if (codeTip) {

                                        comm.showLog("滑块验证成功,需要验证码");
                                        return 'success';
                                    }
                                }

                                let createPasswordPage = selector().textContains('Create password').findOne(1000)
                                let codeTip = selector().textContains("6-digit").findOne(1000)
                                if (!createPasswordPage && !codeTip) {

                                    //console.log('创建密码页面未找到')
                                    //判断是否还在验证码页面
                                    let refreshBtnExist = selector().textContains('Reload').visibleToUser(true).exists()
                                    if (refreshBtnExist) {
                                        console.log('刷新按钮还存在,还位于验证码页面,进行重试')
                                        comm.clickObj(refreshBtn)
                                        sleep(10000)
                                    } else {

                                        //判断是否还在邮箱输入页面,验证码验证通过了而由于网络问题导致没跳转过去
                                        let pageInEmailInputExists = selector().textContains('Next').visibleToUser(true).exists()
                                        if (pageInEmailInputExists) {

                                            console.log('处于输入邮箱页面')
                                            //再次设置一下代理 
                                            let pageInEmailInput = selector().textContains('Next').visibleToUser(true).findOne(5000)
                                            comm.clickObj(pageInEmailInput)
                                            sleep(1500)
                                            break
                                        } else {
                                            console.log('不处于输入邮箱页面')
                                        }
                                        //判断号是否已经注册过了
                                        let youAreAlreadySignPag = selector().textContains('You\'ve already signed up').enabled(true).visibleToUser(true).exists()
                                        if (youAreAlreadySignPag) {
                                            console.log('该邮箱账号已被注册过')
                                            return '该邮箱账号已被注册过'
                                        }

                                        createPasswordPage = selector().textContains('Create password').findOne(10000)
                                        if (createPasswordPage) {
                                            comm.showLog("滑块验证完成")
                                            break
                                        }
                                        codeTip = selector().textContains("6-digit").findOne(10000)
                                        if (codeTip) {
                                            comm.showLog("滑块验证完成")
                                            break
                                        }
                                    }
                                } else {
                                    let imageVerifyTips = selector().textContains('Verify to continue:').visibleToUser(true).findOne(2000)
                                    if (!imageVerifyTips) {

                                        comm.showLog("滑块验证完成")
                                        break
                                    } else {
                                        comm.showLog("Verify to continue 111 ")
                                    }
                                }
                            } else {
                                let imageVerifyTips = selector().textContains('Verify to continue:').visibleToUser(true).findOne(2000)
                                if (imageVerifyTips) {
                                    sleep(3000)
                                    imageVerifyTips = selector().textContains('Verify to continue:').visibleToUser(true).findOne(2000)
                                }
                                if (imageVerifyTips) {
                                    sleep(3000)
                                    imageVerifyTips = selector().textContains('Verify to continue:').visibleToUser(true).findOne(2000)
                                }
                                if (imageVerifyTips) {
                                    sleep(3000)
                                    imageVerifyTips = selector().textContains('Verify to continue:').visibleToUser(true).findOne(2000)
                                }
                                if (!imageVerifyTips) {

                                    comm.showLog("滑块验证完成")
                                    break
                                } else {
                                    comm.showLog("Verify to continue 111 ")
                                }
                            }
                        } else {
                            let codeTip = selector().textContains("6-digit").findOne(10000)
                            if (codeTip) {
                                comm.showLog("滑块验证完成")
                                return 'success'
                            }
                            comm.showLog("验证码解析失败")
                            //刷新验证码重试
                            comm.clickObj(refreshBtn)
                            sleep(10000)
                        }

                    } catch (e) {
                        console.log('发生错误')
                        console.log(e)
                        ffcnt++
                        if (ffcnt > 5) {
                            return "发生错误"
                        } else {
                            sleep(5000)
                        }
                    }

                } else {

                    comm.showLog('没有图片')
                    //刷新验证码
                    comm.clickObj(refreshBtn)
                    sleep(10000)
                }
            }
        } else {

            if (loadingMustTime > 5) {
                return "验证码图片未加载出来"
            }
            if (loadingTimeLimit >= 20) {
                loadingTimeLimit = 0
                loadingMustTime++
                //点击refresh
                comm.clickObj(refreshBtn)
                sleep(10000)

            } else {
                console.log('验证码图片未加载出来')
                loadingTimeLimit++
                sleep(1500)
            }
        }
    }
    comm.showLog("标记5")
    //判断验证码是否还在
    let timeLimitImageVefiry = 0
    while (true) {

        let imageVerifyTipsExist = selector().textContains('Verify to continue:').enabled(true).visibleToUser(true).exists()
        if (!imageVerifyTipsExist) {
            console.log('验证码图片验证完之后不存在')
            break
        }
        if (timeLimitImageVefiry > 30) {
            console.log('验证码图片验证完之后还存在,超出时间限制')
            return '验证码图片验证完之后还存在'
        }
        timeLimitImageVefiry++
        console.log('验证码图片验证完之后还存在')
        sleep(1500)
    }
    return 'success'
}

//20250308刘卓嘉的修改旧版本的验证码验证
function imageCodeVerify_Buy() {

    for (let i = 0; i < 15; i++) {
        if (i > 0) {
            sleep(8000)
            let VerifyContinue = selector().textContains('Verify to continue:').visibleToUser(true).findOne(1000)
            if (VerifyContinue) {
                back()
                sleep(10000)
                let networkErr = selector().textContains('Please try again').visibleToUser(true).exists()
                if (networkErr) {
                    comm.showLog('出现网络问题,点击刷新重试')
                    let retryBtn = selector().textContains('Retry').visibleToUser(true).findOne(1000)
                    if (retryBtn) {
                        comm.clickObj(retryBtn)
                    }
                }
            } else {
                comm.showLog('验证码可能没了')
                return "success"
            }
            sleep(5000)
        }
        let VerifyContinue = selector().textContains('Verify to continue:').visibleToUser(true).findOne(1000)
        if (VerifyContinue) {
            comm.showLog("滑块验证码存在")
            //看看图片是否已经加载出来
            for (let j = 0; j < 5; j++) {

                let captchaImage = selector().idContains('captcha-verify-image').visibleToUser(true).findOne(1000)
                if (!captchaImage) {
                    console.log("未找到元素：captchaImage")
                    sleep(5000)
                } else {
                    break
                }
            }
            sleep(5000)
            //确实不存在，之际进入下一次循环
            let captchaImage = selector().idContains('captcha-verify-image').visibleToUser(true).findOne(1000)
            if (!captchaImage) {
                continue
            }
            let Drag_the = selector().textContains('Drag the puzzle').visibleToUser(true).findOne(5000)
            //
            let capImg = sysScreenCapture();
            comm.showLog("开始切割图片");
            let x = VerifyContinue.bounds().left
            let y = VerifyContinue.bounds().bottom + 26
            let w = device.width - VerifyContinue.bounds().left - VerifyContinue.bounds().left
            let h = Drag_the.bounds().top - VerifyContinue.bounds().bottom - 100
            console.log("x:" + x)
            console.log("y:" + y)
            console.log("w:" + w)
            console.log("h:" + h)
            //
            for (let c = 0; c < 10; c++) {

                capImg = images.read("/sdcard/tk.png")
                if (!capImg) {
                    comm.showLog("fuck_" + c)
                    sleep(3000)
                } else {
                    break
                }
            }
            capImg = images.clip(capImg, x, y, w, h);
            //capImg = images.clip(capImg, bounds.left, bounds.top, bounds.right-bounds.left, bounds.bottom-bounds.top);
            let base64 = images.toBase64(capImg, 'jpg', 80);
            if (base64.length > 3000) {
                comm.showLog("滑块图片大小：" + base64.length);
                let token = "Hhe8XEYDbYPEiYbeS1eKW0iUdX5jAaR+z6a3Fm3Ii34";
                let verify_type = "20110";
                //http://70.39.126.2:8089
                //let dRes=http.postJson(httpServer+"/api/YdmVerify",{base64:base64,token:token,verify_type:verify_type}) 
                let dRes = http.postJson("http://70.39.126.2:8089/api/YdmVerify", { base64: base64, token: token, verify_type: verify_type })
                let rString = dRes.body.string()
                console.log(rString)
                let yJson = JSON.parse(rString);

                if (yJson.code == 10000) {
                    //||(result && result.result == 'success')
                    comm.showLog("验证码解析成功,开始模拟滑动")
                    // let randomTime = random(1500, 2100);
                    // let randomTime = random(2500, 3500);
                    let randomTime = random(3000, 4000);
                    // let randomTime1 = random(1000, 2000);
                    let secsdkCaptDrag = selector().idContains('secsdk-captcha-drag-wrapper').visibleToUser(true).findOne(20000)
                    if (!secsdkCaptDrag) {

                        console.log('验证码滑块按钮控件未找到')
                        return '验证码滑块按钮控件未找到'

                    }
                    let pos = []
                    // let pos2 = []
                    if (yJson.code == 10000) {
                        let sp = parseInt(yJson.data.data)  //502
                        let secsdkCapBounds = secsdkCaptDrag.bounds()
                        let startX = secsdkCapBounds.left + random(0, 100);
                        let startY = random(secsdkCapBounds.top - 5, secsdkCapBounds.bottom + 5);

                        // startX和startY是滑块的起点
                        // 滑块的终点是startX+sp
                        // 先确定起点和第一段变速点
                        let randomMidX = random(50, 100) //变速断点
                        let randomMidY = random(startY - 2, startY + 2)
                        // let bl = random(20, 50) //随机点
                        let bl = random(-20, 20) //随机点
                        pos.push([startX, randomMidY])
                        randomMidY = random(startY - 20, startY + 20)
                        pos.push([startX + sp - randomMidX, randomMidY])
                        // comm.showLog("第一段："+pos2[0]+","+pos2[1])
                        //
                        // 再确定第二段变速点
                        // pos2.push([startX+sp-randomMidX, randomMidY])
                        // randomMidY = random(startY-2,startY+2)
                        pos.push([startX + sp + randomMidX + bl, random(startY - 20, startY + 20)])
                        pos.push([startX + sp + random(-5, 2), random(startY - 20, startY + 20)])
                        // comm.showLog("第二段："+pos2[0]+","+pos2[1]+","+pos2[2])
                        comm.showLog("打印滑动：" + pos[0] + "," + pos[1] + "," + pos[2] + "," + pos[3])
                        // pos2.push([startX, random(startY-2,startY+2)]);
                        // // pos.push([startX+sp, random(startY-2,startY+2)]);
                        // pos2.push([startX+sp, random(startY-2,startY+2)]);
                        gesture(randomTime, pos)  //真正的滑动
                        //
                        sleep(5000)
                        let VerifyContinue = selector().textContains('Verify to continue:').visibleToUser(true).findOne(1000)
                        if (VerifyContinue) {
                            continue
                        }
                    }
                    sleep(3000)
                } else {
                    comm.showLog("接口请求失败")
                    //下一次循环
                    continue
                }

            } else {
                comm.showLog('没有图片')
                //刷新验证码
                // sleep(10000)
                continue
            }

        } else {
            comm.showLog("验证码不存在,判断是不是有网络问题或者已经消失")
            //也可能是两个找相同的验证
            let select2Text = selector().textContains("Select 2 objects").visibleToUser(true).findOne(1000)
            if (select2Text) {
                return select2ImageVcode();
            }
            //这里可能是网络原因,图片未加载出来
            let networkErr = selector().textContains('Please try again').visibleToUser(true).exists()
            if (networkErr) {
                console.log('出现网络问题,点击刷新重试')
                let retryBtn = selector().textContains('Retry').visibleToUser(true).findOne(1000)
                if (retryBtn) {
                    comm.clickObj(retryBtn)
                    sleep(5000)
                    continue
                }
            }
        }
    }
    return "全部执行完毕"
}


function imageCodeVerify(isEmailRegister, isMobile) {

    let limitTimes = 0
    let tryTimes = 0
    while (true) {

        if (limitTimes > 15) {
            console.log('验证码初步加载超过时间,重新设置代理')
            limitTimes = 0
            sleep(1000)
            back()
            sleep(500)
            back();
            sleep(1000)
            let emailNext = selector().textContains('Next').visibleToUser(true).findOne(2000)
            if (emailNext) {
                comm.clickObj(emailNext)
            }
            tryTimes++
        }
        let codeTip = selector().textContains("6-digit").findOne(1000);
        if (codeTip) {
            return 'success';
        }
        let select2Text = selector().textContains("Select 2 objects").visibleToUser(true).findOne(1000)
        if (select2Text) {
            comm.showLog("Select 2 objects")

        } else {
            let imageVerifyTips = selector().textContains('Verify to continue:').visibleToUser(true).findOne(1000)
            if (imageVerifyTips) {
                break
            }
        }
        let verifyAppearLoading = selector().bounds(485, 992, 595, 1102).visibleToUser(true).enabled(true).exists()
        if (!verifyAppearLoading) {
            console.log('图片验证码出现前的loading控件不存在')
            break
        }
        console.log('图片验证码出现前的loading控件存在')

        let refreshBtn = selector().textContains('Refresh').visibleToUser(true).findOne(1000)
        if (!refreshBtn) {
            refreshBtn = selector().idContains('refresh-button').visibleToUser(true).findOne(1000)
        }
        if (refreshBtn) {
            break
        }
        if (limitTimes == 3 && !isEmailRegister) {

            back();
            sleep(1000)
            back();
            sleep(2000)
            let forgotText = selector().textContains("Forgot pass").findOne(6000)
            b = forgotText.bounds()
            y = b.centerY() + 123
            let xxx = b.centerX() + 300;
            click(xxx, y)
            sleep(3000)
        }
        if (limitTimes > 20) {
            return "验证超时"
        }
        sleep(1000)
        limitTimes++
        if (isMobile) {

            let select2Text = selector().textContains("Select 2 objects").visibleToUser(true).findOne(15000)
            let imageVerifyTips = selector().textContains('Verify to continue:').visibleToUser(true).findOne(5000)
            if (imageVerifyTips) {
                break
            }
            select2Text = selector().textContains("Select 2 objects").visibleToUser(true).findOne(15000)
            if (select2Text) {
                comm.showLog("Select 2 objects")
                break
            } else if (limitTimes == 2) {

                back();
                sleep(500)
                back();
                sleep(2000)
                let sendCode = selector().textContains("Send code").visibleToUser(true).findOne(5000);
                if (sendCode) {

                    comm.clickObj(sendCode)
                    continue;
                }
            }
            if (limitTimes > 5) {
                return "验证超时"
            }
        }

        if (tryTimes >= 5) {

            console.log('验证码初步加载超过重新设置代理次数,任务失败')
            return '验证码初步加载超过重新设置代理次数,任务失败'
        }
    }
    //刷新按钮
    let refreshBtn = selector().textContains('Refresh').visibleToUser(true).findOne(3000)
    if (!refreshBtn) {

        refreshBtn = selector().textContains('Reload').visibleToUser(true).findOne(3000)
        if (!refreshBtn) {
            refreshBtn = selector().idContains('refresh-button').visibleToUser(true).findOne(3000)
        }
        if (!refreshBtn) {
            return '刷新验证码图片按钮控件未找到'
        }
    } else {
        comm.clickObj(refreshBtn)
    }
    let select2Text = selector().textContains("Select 2 objects").visibleToUser(true).findOne(1000)
    if (select2Text) {
        return select2ImageVcode();
    }
    while (true) {

        let imageVerifyTips = selector().textContains('Verify to continue:').visibleToUser(true).findOne(50000)
        if (!imageVerifyTips) {

            console.log('图片验证码未找到')

            //这里可能是网络原因,图片未加载出来
            let networkErr = selector().textContains('Please try again').visibleToUser(true).exists()
            if (networkErr && refreshBtn) {

                console.log('出现网络问题,点击刷新重试')
                comm.clickObj(refreshBtn)

            } else {
                return '图片验证码未找到'
            }

        } else {
            //sleep(random(1500, 3000))
            break
        }
        //sleep(5000)
    }

    let loadingTimeLimit = 0
    let loadingMustTime = 0
    let ffcnt = 0;
    let Drag_the = selector().textContains('Drag the puzzle').visibleToUser(true).findOne(5000)

    while (true) {

        let imageLoading = selector().textContains('Loading').exists()
        if (!imageLoading) {

            console.log('验证码图片已加载出来')
            sleep(5000)
            //判断一下是否由于网络原因未加载出来图片
            let networkErrorInImageLoadingExist = selector().textContains('Network issue. Please try again.').visibleToUser(true).exists()
            let noInternetConnectExist = selector().textContains('No internet connection. Please try again').visibleToUser(true).exists()
            if (networkErrorInImageLoadingExist || noInternetConnectExist) {

                console.log('出现无出现无网络提示')
                //再次设置一下代理 
                //点击refresh
                comm.clickObj(refreshBtn)
                sleep(1500)

            } else {
                sleep(5000)
                //全部加载出来了
                let captchaImage = selector().idContains('captcha-verify-image').visibleToUser(true).findOne(1000)
                let VerifyContinue = selector().textContains('Verify to continue:').visibleToUser(true).findOne(5000)
                Drag_the = selector().textContains('Drag the puzzle').visibleToUser(true).findOne(5000)
                if (VerifyContinue) {
                    captchaImage = selector().idContains('captcha-verify-image').visibleToUser(true).findOne(20000)
                    if (!captchaImage) {

                        console.log("未找到元素：captchaImage")
                        break
                    }
                } else {
                    break
                }
                let imgErr = selector().textContains('Please try again').visibleToUser(true).exists()
                if (imgErr) {

                    console.log('出现网络问题,点击刷新重试')
                    comm.clickObj(refreshBtn)
                    sleep(20000)
                    for (let l = 0; l < 6; l++) {
                        imageLoading = selector().textContains('Loading').exists()
                        if (!imageLoading) {
                            break
                        } else {
                            sleep(6000)
                        }
                    }
                    continue
                }
                //检测二维码图片加载完成

                let capImg = sysScreenCapture();
                comm.showLog("开始切割图片");
                let x = VerifyContinue.bounds().left
                let y = VerifyContinue.bounds().bottom + 26
                let w = device.width - VerifyContinue.bounds().left - VerifyContinue.bounds().left
                let h = Drag_the.bounds().top - VerifyContinue.bounds().bottom - 100
                console.log("x:" + x)
                console.log("y:" + y)
                console.log("w:" + w)
                console.log("h:" + h)


                for (let c = 0; c < 10; c++) {

                    capImg = images.read("/sdcard/tk.png")
                    if (!capImg) {
                        comm.showLog("fuck_" + c)
                        sleep(3000)
                    } else {
                        break
                    }
                }
                capImg = images.clip(capImg, x, y, w, h);
                //capImg = images.clip(capImg, bounds.left, bounds.top, bounds.right-bounds.left, bounds.bottom-bounds.top);
                let base64 = images.toBase64(capImg, 'jpg', 80);
                if (base64.length > 3000) {

                    try {

                        comm.showLog("滑块图片大小：" + base64.length);
                        let token = "Hhe8XEYDbYPEiYbeS1eKW0iUdX5jAaR+z6a3Fm3Ii34";
                        let verify_type = "20110";
                        //http://70.39.126.2:8089
                        //let dRes=http.postJson(httpServer+"/api/YdmVerify",{base64:base64,token:token,verify_type:verify_type}) 
                        let dRes = http.postJson("http://70.39.126.2:8089/api/YdmVerify", { base64: base64, token: token, verify_type: verify_type })
                        let rString = dRes.body.string()
                        console.log(rString)
                        let yJson = JSON.parse(rString);

                        if (yJson.code == 10000) {

                            //||(result && result.result == 'success')

                            comm.showLog("验证码解析成功,开始模拟滑动")
                            // let randomTime = random(1500, 2100);
                            // let randomTime = random(2500, 3500);
                            let randomTime = random(3000, 4000);
                            // let randomTime1 = random(1000, 2000);
                            let secsdkCaptDrag = selector().idContains('secsdk-captcha-drag-wrapper').visibleToUser(true).findOne(20000)
                            if (!secsdkCaptDrag) {

                                console.log('验证码滑块按钮控件未找到')
                                return '验证码滑块按钮控件未找到'

                            }
                            let pos = []
                            // let pos2 = []
                            if (yJson.code == 10000) {
                                let sp = parseInt(yJson.data.data)  //502
                                let secsdkCapBounds = secsdkCaptDrag.bounds()
                                let startX = secsdkCapBounds.left + random(0, 100);
                                let startY = random(secsdkCapBounds.top - 5, secsdkCapBounds.bottom + 5);

                                // startX和startY是滑块的起点
                                // 滑块的终点是startX+sp
                                // 先确定起点和第一段变速点
                                let randomMidX = random(50, 100) //变速断点
                                let randomMidY = random(startY - 2, startY + 2)
                                // let bl = random(20, 50) //随机点
                                let bl = random(-20, 20) //随机点
                                pos.push([startX, randomMidY])
                                randomMidY = random(startY - 20, startY + 20)
                                pos.push([startX + sp - randomMidX, randomMidY])
                                // comm.showLog("第一段："+pos2[0]+","+pos2[1])
                                //
                                // 再确定第二段变速点
                                // pos2.push([startX+sp-randomMidX, randomMidY])
                                // randomMidY = random(startY-2,startY+2)
                                pos.push([startX + sp + randomMidX + bl, random(startY - 20, startY + 20)])
                                pos.push([startX + sp + random(-5, 2), random(startY - 20, startY + 20)])
                                // comm.showLog("第二段："+pos2[0]+","+pos2[1]+","+pos2[2])
                                comm.showLog("打印滑动：" + pos[0] + "," + pos[1] + "," + pos[2] + "," + pos[3])
                                // pos2.push([startX, random(startY-2,startY+2)]);
                                // // pos.push([startX+sp, random(startY-2,startY+2)]);
                                // pos2.push([startX+sp, random(startY-2,startY+2)]);
                            } else {
                                // let list = result.data.list;

                                // let secsdkCapBounds = secsdkCaptDrag.bounds()
                                // let startX = secsdkCapBounds.left + random(0, 100);
                                // let startY = random(secsdkCapBounds.top, secsdkCapBounds.bottom);
                                // for(var i = 0; i < list.length; i++){

                                //     startX += list[i];
                                //     pos.push([startX, random(startY-2,startY+2)]);
                                // }
                            }
                            // 先滑动第一段
                            gesture(randomTime, pos)
                            // 再滑动第二段
                            // gesture(randomTime1, pos2)


                            sleep(3000)
                            //如果是邮箱注册,走下面的逻辑
                            if (isEmailRegister) {
                                for (var i = 0; i < 15; i++) {

                                    console.log("正在检查...是否到达 Create password 页");
                                    let createPasswordPage = selector().textContains('Create password').findOne(1000)
                                    if (createPasswordPage) {
                                        comm.showLog("滑块验证成功,到达创建密码页");
                                        return 'success';
                                    }
                                    console.log("正在检查...是否到达 输入验证码 页");
                                    let codeTip = selector().textContains("6-digit").findOne(1000)
                                    if (codeTip) {

                                        comm.showLog("滑块验证成功,需要验证码");
                                        return 'success';
                                    }
                                }

                                let createPasswordPage = selector().textContains('Create password').findOne(1000)
                                let codeTip = selector().textContains("6-digit").findOne(1000)
                                if (!createPasswordPage && !codeTip) {

                                    //console.log('创建密码页面未找到')
                                    //判断是否还在验证码页面
                                    let refreshBtnExist = selector().textContains('Reload').visibleToUser(true).exists()
                                    if (refreshBtnExist) {
                                        console.log('刷新按钮还存在,还位于验证码页面,进行重试')
                                        comm.clickObj(refreshBtn)
                                        sleep(10000)
                                    } else {

                                        //判断是否还在邮箱输入页面,验证码验证通过了而由于网络问题导致没跳转过去
                                        let pageInEmailInputExists = selector().textContains('Next').visibleToUser(true).exists()
                                        if (pageInEmailInputExists) {

                                            console.log('处于输入邮箱页面')
                                            //再次设置一下代理 
                                            let pageInEmailInput = selector().textContains('Next').visibleToUser(true).findOne(5000)
                                            comm.clickObj(pageInEmailInput)
                                            sleep(1500)
                                            break
                                        } else {
                                            console.log('不处于输入邮箱页面')
                                        }
                                        //判断号是否已经注册过了
                                        let youAreAlreadySignPag = selector().textContains('You\'ve already signed up').enabled(true).visibleToUser(true).exists()
                                        if (youAreAlreadySignPag) {
                                            console.log('该邮箱账号已被注册过')
                                            return '该邮箱账号已被注册过'
                                        }

                                        createPasswordPage = selector().textContains('Create password').findOne(10000)
                                        if (createPasswordPage) {
                                            comm.showLog("滑块验证完成")
                                            break
                                        }
                                        codeTip = selector().textContains("6-digit").findOne(10000)
                                        if (codeTip) {
                                            comm.showLog("滑块验证完成")
                                            break
                                        }
                                    }
                                } else {
                                    let imageVerifyTips = selector().textContains('Verify to continue:').visibleToUser(true).findOne(2000)
                                    if (!imageVerifyTips) {

                                        comm.showLog("滑块验证完成")
                                        break
                                    } else {
                                        comm.showLog("Verify to continue 111 ")
                                    }
                                }
                            } else {
                                let imageVerifyTips = selector().textContains('Verify to continue:').visibleToUser(true).findOne(2000)
                                if (imageVerifyTips) {
                                    sleep(3000)
                                    imageVerifyTips = selector().textContains('Verify to continue:').visibleToUser(true).findOne(2000)
                                }
                                if (imageVerifyTips) {
                                    sleep(3000)
                                    imageVerifyTips = selector().textContains('Verify to continue:').visibleToUser(true).findOne(2000)
                                }
                                if (imageVerifyTips) {
                                    sleep(3000)
                                    imageVerifyTips = selector().textContains('Verify to continue:').visibleToUser(true).findOne(2000)
                                }
                                if (!imageVerifyTips) {

                                    comm.showLog("滑块验证完成")
                                    break
                                } else {
                                    comm.showLog("Verify to continue 111 ")
                                }
                            }
                        } else {
                            let codeTip = selector().textContains("6-digit").findOne(10000)
                            if (codeTip) {
                                comm.showLog("滑块验证完成")
                                return 'success'
                            }
                            comm.showLog("验证码解析失败")
                            //刷新验证码重试
                            comm.clickObj(refreshBtn)
                            sleep(10000)
                        }

                    } catch (e) {
                        console.log('发生错误')
                        console.log(e)
                        ffcnt++
                        if (ffcnt > 5) {
                            return "发生错误"
                        } else {
                            sleep(5000)
                        }
                    }

                } else {

                    comm.showLog('没有图片')
                    //刷新验证码
                    comm.clickObj(refreshBtn)
                    sleep(10000)
                }
            }
        } else {

            if (loadingMustTime > 5) {
                return "验证码图片未加载出来"
            }
            if (loadingTimeLimit >= 20) {
                loadingTimeLimit = 0
                loadingMustTime++
                //点击refresh
                comm.clickObj(refreshBtn)
                sleep(10000)

            } else {
                console.log('验证码图片未加载出来')
                loadingTimeLimit++
                sleep(1500)
            }
        }
    }

    //判断验证码是否还在
    let timeLimitImageVefiry = 0
    while (true) {
        let imageVerifyTipsExist = selector().textContains('Verify to continue:').enabled(true).visibleToUser(true).exists()
        if (!imageVerifyTipsExist) {
            console.log('验证码图片验证完之后不存在')
            break
        }
        if (timeLimitImageVefiry > 30) {
            console.log('验证码图片验证完之后还存在,超出时间限制')
            return '验证码图片验证完之后还存在'
        }
        timeLimitImageVefiry++
        console.log('验证码图片验证完之后还存在')
        sleep(1500)
    }
    return 'success'
}


function select2ImageVcode() {
    console.log("Select 2 objects....start")
    let resMsg = '';
    for (let i = 0; i < 6; i++) {
        let select2Text = selector().textContains("Select 2 objects").visibleToUser(true).findOne(10000)
        if (!select2Text) {
            continue;
        }
        let loadingText = selector().textContains("Loading").visibleToUser(true).findOne(2000)
        for (let index = 0; index < 30; index++) {
            loadingText = selector().textContains("Loading").visibleToUser(true).findOne(1000)
            if (loadingText) {
                sleep(1500)
            } else {
                break
            }
        }

        sleep(3500)
        let capImg = sysScreenCapture();
        for (let c = 0; c < 10; c++) {

            capImg = images.read("/sdcard/tk.png")
            if (!capImg) {
                comm.showLog("fuck_" + c)
                sleep(3000)
            } else {
                break
            }
        }
        comm.showLog("开始切割图片");
        //capImg = images.clip(capImg, 144, 782-182, 936-144,1277-782);
        //左右边距
        let padding_width = 172  //todo 
        //y
        let padding_top = 1126
        //高
        let v_height = 602
        if (device.width == 720) {
            padding_width = 71
            padding_top = 436
            v_height = 358
        }


        let v_width = device.width - padding_width - padding_width
        capImg = images.clip(capImg, padding_width, padding_top, v_width, v_height);
        let base64 = images.toBase64(capImg, 'jpg', 40);
        let response = null;
        let jsonstring = "";
        let codeJson = null;
        let pic_str = "";
        let xy_arr = null;
        let isTopCon = 0;
        for (let index = 0; index < 8; index++) {
            try {
                let token = "Hhe8XEYDbYPEiYbeS1eKW0iUdX5jAaR+z6a3Fm3Ii34";
                let verify_type = "30101";
                //http://70.39.126.2:8089
                response = http.postJson("http://70.39.126.2:8089/api/YdmVerify", { base64: base64, token: token, verify_type: verify_type })
                jsonstring = response.body.string();
                if (jsonstring == "") {
                    console.log("推送解码失败");
                    sleep(5000)
                    continue;
                }
                try {
                    codeJson = JSON.parse(jsonstring);
                    if (codeJson.code == 10000) {
                        pic_str = codeJson.data.data;
                        xy_arr = pic_str.split('|')
                    } else if (codeJson.code == 10007) {
                        let refreshBtn = selector().textContains("Refresh").visibleToUser(true).findOne(1000)
                        if (refreshBtn && i < 3) {
                            comm.clickObj(refreshBtn);
                            sleep(15000);
                            isTopCon = 1;
                            break;
                        } else {
                            refreshBtn = selector().textContains('Reload').visibleToUser(true).findOne(3000)
                            if (refreshBtn && i < 3) {
                                comm.clickObj(refreshBtn);
                                sleep(15000);
                                isTopCon = 1;
                                break;
                            } else {
                                refreshBtn = selector().idContains('refresh_button').visibleToUser(true).findOne(3000)
                                if (refreshBtn && i < 3) {
                                    comm.clickObj(refreshBtn);
                                    sleep(15000);
                                    isTopCon = 1;
                                    break;
                                }
                            }

                        }
                        return "解码失败"
                    }
                } catch (ex) {
                    console.log(ex)
                }
                if (codeJson == null || pic_str == '' || xy_arr == null || xy_arr.length < 2) {
                    resMsg = "没返回验证坐标值";
                    sleep(5000)
                    continue;
                }
                resMsg = '';
                break;
            } catch (ex) {
                console.log("cjy:" + ex)
                sleep(5000)
            }
        }
        if (isTopCon == 1) {
            resMsg = "解码失败";
            continue;
        }
        if (jsonstring == "") {
            console.log("推送解码失败");
            return "推送解码失败"
        }
        console.log(jsonstring);
        if (codeJson == null || pic_str == '' || xy_arr == null || xy_arr.length < 2) {
            resMsg = "没返回验证坐标值";
            continue;
        }

        let xy1_arr = xy_arr[0].split(',');
        let xy2_arr = xy_arr[1].split(',');
        let x1 = parseInt(xy1_arr[0]) + padding_width;
        let y1 = parseInt(xy1_arr[1]) + padding_top;
        let x2 = parseInt(xy2_arr[0]) + padding_width;
        let y2 = parseInt(xy2_arr[1]) + padding_top;

        console.log(x1 + "---" + y1)
        console.log(x2 + "---" + y2)
        click(x1, y1);
        sleep(600)
        click(x2, y2);
        let confirmBtn = selector().textContains("Confirm").findOne(3000);
        if (confirmBtn) {
            sleep(1000)
            comm.clickObj(confirmBtn);
            sleep(10000)
        }
        select2Text = selector().textContains("Select 2 objects").visibleToUser(true).findOne(1000)
        if (select2Text) {
            let refreshBtn = selector().textContains("Refresh").visibleToUser(true).findOne(1000)
            if (refreshBtn) {
                comm.clickObj(refreshBtn);
                sleep(3000)
            }
        } else {
            return "success"
        }
    }
    if (resMsg.length > 0) {
        return resMsg;
    }
    return "验证失败"
}
function sysInputText(obj, txt) {
    if (obj && obj != null) {
        comm.clickObj(obj)
    }
    let result = httpShell("input text \"" + txt + "\" ");
    return result
}
function backToHome() {

    let doNotAllowBtn = selector().textContains('t allow').visibleToUser(true).findOne(1000)
    if (doNotAllowBtn) {
        comm.clickObj(doNotAllowBtn)
        sleep(1000)
    }
    let notNowBtn = selector().textContains('Not now').visibleToUser(true).findOne(1000)
    if (notNowBtn) {
        comm.clickObj(notNowBtn)
        sleep(random(1000, 2000))
    }
    let homeBtn = selector().textContains('Home').visibleToUser(true).findOne(5000)
    if (!homeBtn) {
        homeBtn = selector().textContains('For You').visibleToUser(true).findOne(1000)
    }
    if (!homeBtn) {
        httpShell('am force-stop com.zhiliaoapp.musically')
        sleep(3000)
        if (!app.launch('com.zhiliaoapp.musically')) {
            console.log('App 启动失败')
            return "tk启动失败"
        } else {
            console.log('tk启动成功')
        }
        //  sleep(6000)
        sleep(3000)
        homeBtn = selector().textContains('Home').visibleToUser(true).findOne(3000)
        for (let i = 0; i < 3; i++) {
            if (!homeBtn) {
                comm.showLog("判断并关闭弹窗")
                closeAllPop()
                doNotAllowBtn = selector().textContains('Don\'t allow').visibleToUser(true).findOne(500)
                if (doNotAllowBtn) {
                    comm.clickObj(doNotAllowBtn)
                    sleep(1000)
                }
                notNowBtn = selector().textContains('Not now').visibleToUser(true).findOne(500)
                if (notNowBtn) {
                    comm.clickObj(notNowBtn)
                    sleep(random(1000, 2000))
                }
                homeBtn = selector().textContains('Home').visibleToUser(true).findOne(3000)
            } else {
                break
            }
        }
        if (!homeBtn) {
            console.log('首页home按钮未找到')
        }
    } else {
        comm.showLog("找到home")
        comm.clickObj(homeBtn)
    }
    doNotAllowBtn = selector().textContains('Don\'t allow').visibleToUser(true).findOne(500)
    if (doNotAllowBtn) {
        comm.clickObj(doNotAllowBtn)
        sleep(1000)
    }
    notNowBtn = selector().textContains('Not now').visibleToUser(true).findOne(500)
    if (notNowBtn) {
        comm.clickObj(notNowBtn)
        sleep(random(1000, 2000))
    }
}

//登录
function login(email, username, loginType, password, code_url) {
    comm.showLog("等待10秒")
    sleep(10000)
    //第一步 进行登录界面
    for (let i = 0; i < 10; i++) {
        if (i == 9) {
            return "第一步 进行登录界面 进行不下去"
        }
        comm.showLog("登录执行次数：" + i)
        comm.showLog("启动tk")
        //每次启动tk前先关闭tk  防止一直处于白屏状态
        httpShell("am force-stop com.zhiliaoapp.musically")
        sleep(3000)
        //
        if (currentPackage().indexOf('com.zhiliaoapp.musically') == -1) {
            comm.showLog("launch tk")
            if (!app.launch('com.zhiliaoapp.musically')) {
                console.log('App 启动失败')
                return "tk启动失败"
            }
            sleep(6000)
        }
        // comm.showLog("执行closeAllPop")
        // closeAllPop()
        //
        sleep(3000)
        //
        comm.showLog("执行一个是否允许tk访问联系的权限写入")
        httpShell("pm grant com.zhiliaoapp.musically android.permission.READ_CONTACTS")
        httpShell("pm grant com.zhiliaoapp.musically android.permission.POST_NOTIFICATIONS")
        sleep(3000)
        //
        // if (selector().textContains('Use passkey').visibleToUser(true).exists()) {
        //     back()
        //     sleep(3000)
        // }


        for (let i = 0; i < 5; i++) {
            let sp = idContains("cr9").className("android.widget.TextView").clickable(false).visibleToUser(true).findOne(1000);
            if (sp) {
                console.log("到达登录页");
                break
            }
            //头像
            let profilePicture = idContains("az_").className("android.widget.Button").clickable(false).visibleToUser(true).findOne(1000);
            if (profilePicture) {
                comm.showLog('已经登录进去了')
                let ishome = idContains("lax").className("android.widget.FrameLayout").clickable().visibleToUser(true).findOne(1000)
                if (ishome) {
                    comm.clickObj(ishome)
                }
                return "success"
            }

            //skip
            let skipBtn = idContains("c43").visibleToUser(true).findOne(2000)
            if (skipBtn) {
                comm.clickObj(skipBtn)
                sleep(3000)
            }

            let agreeAndContinue = idContains("dnm").className("android.widget.Button").clickable().visibleToUser(true).findOne(1000)
            if (agreeAndContinue) {
                console.log("同意并继续");
                comm.clickObj(agreeAndContinue)
                //
            }

            //判断是否直接进入的主页,如果是主页就点击profile进入登录注册页面
            let isMainPage = idContains("lax").className("android.widget.FrameLayout").clickable().visibleToUser(true).findOne(3000)//home
            if (isMainPage) {
                let hintGesture = idContains("vw_").className("android.widget.TextView").visibleToUser(true).findOne(1000)
                if (hintGesture) {
                    console.log("发现滑动提示，滑动关闭");
                    comm.randomSwipe(1)
                    sleep(3000)
                }

                let ishome = idContains("lax").selected().className("android.widget.FrameLayout").clickable().visibleToUser(true).findOne(1000)
                if (ishome) {
                    console.log("选中home状态");
                    let myProfile = idContains("laz").className("android.widget.FrameLayout").clickable().visibleToUser(true).findOne(1000)
                    if (myProfile) {
                        console.log("发现profile，进入");
                        comm.clickObj(myProfile)
                    }
                }

            }
            sleep(2000)
        }

        for (let i = 0; i < 3; i++) {
            let sp = idContains("cr9").className("android.widget.TextView").clickable(false).visibleToUser(true).findOne(1000);
            if (sp) {
                if (sp && sp.text().indexOf("/") != -1) {
                    comm.showLog("进入User phone/email/username")
                    comm.clickObj(sp)
                } else {
                    sp = idContains("v9w").clickable().className("android.widget.Button").visibleToUser(true).findOne(1000);
                    if (sp) {
                        comm.showLog("Login按钮")
                        comm.clickObj(sp)
                    }
                }
            } else {
                let emailUsernameParent = idContains("nh5").className("android.widget.HorizontalScrollView").visibleToUser(true).findOne(3000)
                if (emailUsernameParent && emailUsernameParent.childCount() == 2) {
                    break
                }
            }
            sleep(1000)
        }

        sleep(3000)

        // comm.showLog("登录的for--1")
        // comm.httpToString(httpServer + '/api/ping?task_id=' + task_id)
        // comm.showLog("判断birth是否存在")
        // let birthday_msg = selector().textContains('birth').visibleToUser(true).exists()
        // if (birthday_msg) {
        //     comm.showLog("找到birthday")
        //     sleep(2000)
        //     let log_in_btn = selector().textContains("have an account").visibleToUser(true).findOne(1000)
        //     //let log_in_btn=selector().textContains('Log in').findOne(3000) 
        //     if (log_in_btn) {
        //         comm.showLog("点击log_in_btn")
        //         comm.clickObj(log_in_btn)
        //     } else {
        //         comm.showLog("进行生日选择")
        //         let reSelectB = selectTkBirthday()
        //         if (reSelectB) {
        //             // 判断有没有Learn more
        //             let continueBtn = selector().textContains("Continue").visibleToUser(true).findOne(1000)
        //             if (continueBtn) {
        //                 comm.showLog("选完生日,点击继续")
        //                 comm.clickObj(continueBtn)
        //             }
        //         }
        //     }
        //     sleep(3000)
        // }


        comm.showLog("找Email/Username")
        //找email/username的上上级控件,找到便点击它的第二个子控件,email/username的父控件
        let clickEmailUsername = false
        for (let i = 0; i < 10; i++) {
            //找Email/Username
            let emailUsernameParent = idContains("nh5").className("android.widget.HorizontalScrollView").visibleToUser(true).findOne(3000)
            if (emailUsernameParent && emailUsernameParent.childCount() == 2) {
                if (emailUsernameParent.child(1).selected()) {
                    comm.showLog("Email/Username已选中")
                    clickEmailUsername = true
                    break
                }
                comm.showLog("找到Email/Username并点击")
                comm.clickObj(emailUsernameParent.child(1))
            } else {
                //找Email/Username方案2
                let nh5Collect = idContains("nh5").className("android.widget.HorizontalScrollView").visibleToUser(true).find()
                if (nh5Collect.length != 0) {
                    let nh5TextView = nh5Collect.find(className("android.widget.TextView"))
                    if (nh5TextView.length != 0) {
                        if (nh5TextView[1].selected()) {
                            comm.showLog("Email/Username已选中")
                            clickEmailUsername = true
                            break
                        }
                        comm.showLog("找到Email/Username")
                        comm.clickObj(nh5TextView[1])
                    }
                }

            }
            sleep(3000)
        }

        if (clickEmailUsername) {
            break
        }

        // comm.showLog("找Email/Username")
        // let usernameTextView = selector().textContains('Email / Username').visibleToUser(true).findOne(3000)
        // if (usernameTextView) {
        //     comm.showLog("找到Email/Username并点击")
        //     comm.clickObj(usernameTextView)
        //     sleep(2000)
        //     //
        //     let inputsTest = selector().className('android.widget.EditText').find()
        //     if (inputsTest.length < 1) {
        //         comm.showLog("tk没启动:" + inputsTest.length)
        //         return "tk没启动"
        //     }
        //     //如果有Save login info，则点击Save login info
        //     // comm.showLog("找Save login info")
        //     // let saveLoginInfo=selector().textContains('Save login info').findOne(3000)
        //     // if(saveLoginInfo)
        //     // {   
        //     //     comm.showLog("点Save login info的那个按钮")
        //     //     //comm.clickObj(saveLoginInfo)
        //     //     click(149,2711)
        //     //     // let saveChack = selector().className('android.widget.CheckBox').visibleToUser(true).findOne(1000)
        //     //     // comm.clickObj(saveChack)
        //     // }
        //     break
        // }

        // comm.showLog("登录的for--3")
        // //判断是不是在首页
        // let isMainPage = idContains("lax").className("android.widget.FrameLayout").clickable().visibleToUser(true).findOne(3000)//home
        // let myProfile = idContains("laz").className("android.widget.FrameLayout").clickable().visibleToUser(true).findOne(1000)
        // if (isMainPage && myProfile) {
        //     comm.showLog('已经登录进去了')
        //     return "success"
        // }


        // if (selector().textContains('Home').visibleToUser(true).exists() && selector().textContains('Profile').visibleToUser(true).exists()) {
        //     comm.showLog('已经登录进去了')
        //     return "success"
        // }
        //
        // comm.showLog("登录的for--4")
        // if(currentPackage().indexOf('com.zhiliaoapp.musically')==-1){
        //     comm.showLog("launch tk")
        //     if(!app.launch('com.zhiliaoapp.musically')) {
        //         console.log('App 启动失败')
        //         return "tk启动失败"
        //      }
        //      sleep(6000)
        // }
    }

    //第二步 用户名密码登录
    comm.showLog("第二步 用户名密码或邮箱登录")
    if (loginType == 1) {

        let inputs = selector().className('android.widget.EditText').find()
        if (inputs) {
            httpShell('am force-stop com.google.android.inputmethod.latin')
            inputs[1].setText(username)
        }

        sleep(2000)
        let saveChack = selector().className('android.widget.CheckBox').visibleToUser(true).findOne(1000)
        if (saveChack) {
            if (saveChack.checked() == false) {
                comm.clickObj(saveChack)
            }
        }
        sleep(2000)

        let btn = className("android.widget.Button").visibleToUser(true).clickable().find()
        let continueBtn = filterButtonByPosition(btn, "bottom")
        if (continueBtn) {
            comm.clickObj(continueBtn)
        }


        // let continueBtn = selector().textContains('Continue').visibleToUser(true).findOne(2000)
        // if (continueBtn) {
        //     if (continueBtn.text() != "Continue") {
        //         return "没正确执行"
        //     } else {
        //         comm.clickObj(continueBtn)
        //         sleep(5000)
        //     }
        // }

        for (let i = 0; i < 8; i++) {
            if (!selector().textContains(username).visibleToUser(true).findOne(2000)) {
                break;
            }
            sleep(5000)
        }

        comm.showLog("输入密码")
        comm.clickObj(inputs[2])
        httpShell('am force-stop com.google.android.inputmethod.latin')
        // sysInputText(inputs[2], password)
        setText(password)

    } else {//邮箱登录
        let inputs = selector().className('android.widget.EditText').find()
        if (inputs) {
            inputs[1].setText(email)
        }
        //sysInputText(inputs[1],username)
        sleep(2000)
        let saveChack = selector().className('android.widget.CheckBox').visibleToUser(true).findOne(1000)
        if (saveChack) {
            if (saveChack.checked() == false) {
                comm.clickObj(saveChack)
            }
        }
        sleep(2000)
        //
        let btn = className("android.widget.Button").visibleToUser(true).clickable().find()
        let continueBtn = filterButtonByPosition(btn, "bottom")
        if (continueBtn) {
            comm.clickObj(continueBtn)
        }
        //
        sleep(2000)
        comm.showLog("找Account doesn't exist")
        //let accNoExist = selector().textContains("Account doesn't exist").visibleToUser(true).exists()
        // let accNoExist = selector().textContains("Account doesn").visibleToUser(true).exists()
        // if (accNoExist) {
        //     return "账号不存在"
        // } else {
        //     comm.showLog("没找到Account doesn't exist")
        // }

        comm.showLog("找Maximum number")
        // let maxRetry = selector().textContains("Maximum number").visibleToUser(true).exists()
        // if (maxRetry) {
        //     return "操作频繁"
        // } else {
        //     comm.showLog("没找到AMaximum number")
        // }


        for (let i = 0; i < 30; i++) {
            let warning = idContains("g9g").visibleToUser(true).findOne(1000)
            if (warning) {
                let warningText = "登录警告:" + warning.text()
                comm.showLog(warningText)
                return warningText
            } else {
                let verifyInput = idContains("nmb").visibleToUser(true).findOne(1000)
                if (verifyInput) {
                    break
                }
            }
        }


        // let verifyInput = idContains("nmb").visibleToUser(true).findOne(60000)
        // if (!verifyInput) {
        //     return "60s没进入验证码页"
        // }

        //
        comm.showLog("请求验证码")
        //请求并获取参数
        var emailCode = 0
        sleep(10000)
        for (let e = 0; e < 10; e++) {
            comm.showLog("请求验证码循环次数:" + e)
            emailCode = comm.httpToString('http://23.91.96.20:8022/api/getLoginCode?email=' + email)
            if (emailCode != 0) {
                comm.showLog("输入验证码")
                inputs = selector().className('android.widget.EditText').find()
                setText(emailCode)
                // sysInputText(inputs[0], emailCode)
                break
            }
            sleep(5000)
        }
        if (emailCode = 0) {
            return "验证码接口查询失败"
        }
        //Verification code is expired
        comm.showLog("找Verification code is expired")
        let expired = selector().textContains('Verification code is expired').visibleToUser(true).exists()
        if (expired) {
            return "验证码过期"
        } else {
            comm.showLog("没找到Verification code is expired")
        }

    }
    //输入之后
    sleep(3000)

    //点击continue
    let btn = className("android.widget.Button").clickable().find()
    let continueBtn = filterButtonByPosition(btn, "bottom")
    if (continueBtn) {
        comm.showLog("点击continue")
        comm.clickObj(continueBtn)
    }
    //
    sleep(8000)


    // //有个弹窗和密码验证
    // let continueBtn3 = selector().text('Agree and continue').visibleToUser(true).findOne(2000)
    // if (continueBtn3) {
    //     comm.clickObj(continueBtn3)
    //     sleep(3000)
    // }

    // 是否有密码验证
    // if (selector().textContains('Verify identity').visibleToUser(true).exists()) {
    //     let pwdBtn = selector().textContains('Password').visibleToUser(true).findOne(2000)
    //     if (pwdBtn) {
    //         comm.clickObj(pwdBtn)
    //         sleep(2000)
    //         let next2 = selector().textContains('Next').visibleToUser(true).findOne(2000)
    //         if (next2) {
    //             comm.clickObj(next2)
    //         }
    //     } else {
    //         return "有密码验证页，但是没正确找到密码验证按钮"
    //     }
    //     //
    //     sleep(2000)
    //     let input = selector().className('android.widget.EditText').visibleToUser(true).findOne(1000)
    //     if (input) {
    //         input.setText(password)
    //         sleep(3000)
    //     }
    //     let next2 = selector().textContains('Next').visibleToUser(true).findOne(2000)
    //     if (next2) {
    //         comm.clickObj(next2)
    //         sleep(3000)
    //     }
    //     sleep(5000)
    //     // 判断是否存在密码输入
    //     if (selector().textContains('Verify identity').visibleToUser(true).exists()) {
    //         return "密码输入失败"
    //     }
    // }

    //防止登录成功后又弹回Email / Username页面
    // let log_in_btn = selector().textContains('Log in').visibleToUser(true).findOne(1000)
    // if (log_in_btn) {
    //     let back = boundsInside(0, 0, device.width * 0.3, device.height * 0.15).className("android.widget.Button").clickable().visibleToUser(true).findOne(1000)//Open app
    //     console.log("又弹回Email / Username页面");
    //     comm.clickObj(back)
    //     sleep(2000)
    // }

    //skip
    let skipBtn = idContains("c43").visibleToUser(true).findOne(2000)
    if (skipBtn) {
        comm.clickObj(skipBtn)
        sleep(3000)
    }

    sleep(2000)
    // Maximum number of attempts reached
    // comm.showLog("找Maximum number")
    // let maximum = selector().textContains('Maximum number').visibleToUser(true).exists()
    // if (maximum) {
    //     return "操作频繁"
    // } else {
    //     comm.showLog("没找到Maximum number")
    // }
    //
    comm.showLog("找Account doesn't exist")
    // let accNoExist = selector().textContains("Account doesn't exist").visibleToUser(true).exists()
    // if (accNoExist) {
    //     return "账号不存在"
    // } else {
    //     comm.showLog("没找到Account doesn't exist")
    // }

    sleep(3000)
    //判断是否存在找相同验证码
    comm.showLog("判断是否存在找相同验证码")
    for (let i = 0; i < 10; i++) {
        comm.showLog('判断有没有找相同验证码')
        let skipBtn = idContains("c43").visibleToUser(true).findOne(1000)
        let newPolicy2 = idContains("x9o").visibleToUser(true).findOne(1000)
        if (skipBtn || newPolicy2) {
            break
        }


        let StartWatchingBtn = idContains("saa").visibleToUser(true).findOne(1000)
        if (StartWatchingBtn) {
            comm.randomSwipe(1)
        }

        let select2Text = selector().textContains("Select 2 objects").visibleToUser(true).findOne(1000)
        if (select2Text) {
            comm.showLog('需要找相同验证码')
            result = select2ImageVcode()
            comm.showLog("相同验证码func返回:" + result)
            if (result != 'success') {
                return "图片验证失败"
            } else {
                //点击confirm
                let confirmBtn = selector().textContains('Confirm').visibleToUser(true).findOne(2000)
                if (confirmBtn) {
                    comm.showLog('输完验证码点击Confirm')
                    comm.clickObj(confirmBtn)
                    sleep(3000)
                    break
                }
            }
        } else {
            //存在需要滑块验证码 （可能要补）
            comm.showLog("判断有没有滑块验证码")
            let imageVerifyTips = selector().textContains('Verify to continue:').visibleToUser(true).findOne(1000) || selector().textContains('puzzle piece into place').visibleToUser(true).findOne(1000)
            if (imageVerifyTips) {
                comm.showLog("遇到滑块验证码1")
                //处理滑块验证码
                for (let i = 0; i < 5; i++) {
                    if (i == 4) {
                        comm.showLog("还有滑块验证码")
                        back()
                        sleep(2000)
                        let continueBtn2 = selector().textContains('Continue').visibleToUser(true).findOne(2000)
                        if (continueBtn2) {
                            comm.clickObj(continueBtn2)
                            sleep(3000)
                            continue
                        }
                    }
                    if (sliderVerificationCode() == "success") {
                        sleep(5000)
                        //检查是否还有验证码
                        imageVerifyTips = selector().textContains('Verify to continue:').visibleToUser(true).findOne(1000) || selector().textContains('puzzle piece into place').visibleToUser(true).findOne(1000)
                        if (!imageVerifyTips) {
                            break
                        }
                    }
                }
                //
                // let secsdkCaptDrag_My = selector().idContains('captcha_slide_button').visibleToUser(true).findOne(20000)
                // if(secsdkCaptDrag_My){
                //     let allNum_My = device.width-imageVerifyTips.bounds().left-imageVerifyTips.bounds().left
                //     comm.showLog("拼图移动总长度："+allNum_My)
                //     let pos = []
                //     let secsdkCapBounds = secsdkCaptDrag_My.bounds()
                //     pos.push([secsdkCapBounds.centerX(), secsdkCapBounds.centerY()+random(-2,2)])
                //     pos.push([secsdkCapBounds.centerX()+random(20,30), secsdkCapBounds.centerY()+random(-2,2)])
                //     pos.push([secsdkCapBounds.centerX()+random(100,150), secsdkCapBounds.centerY()+random(-2,2)])
                //     pos.push([660.9,secsdkCapBounds.centerY()+10])
                //     gesture(random(15000,20000), pos)
                //     sleep(10000)
                //     if(selector().textContains('Verify to continue:').visibleToUser(true).exists()){
                //         comm.showLog("还有滑块验证码")
                //         back()
                //         sleep(2000)
                //         let continueBtn2=selector().textContains('Continue').visibleToUser(true).findOne(2000)
                //         if(continueBtn2)
                //         {
                //             comm.clickObj(continueBtn2)
                //             break
                //         }
                //         return "遇到滑块验证码"
                //     }

                // }else{
                //     comm.showLog("没找滑块按钮控件")
                //     return "没找滑块按钮控件"
                // }
                //
                // imageCodeVerify_my()// 
            } else {
                // Drag the slider to fit the puzzle 旋转验证码
                let sliderVerifyTips = selector().textContains('Drag the slider to fit the puzzle').visibleToUser(true).findOne(1000)
                if (sliderVerifyTips) {
                    comm.showLog("有旋转验证码")
                    return "有旋转验证码"
                }
            }
        }
        comm.showLog("执行完验证码判断，继续")
        // 判断有没有在第二步验证界面
        let auth2Step = idContains("csj").visibleToUser(true).exists()
        if (auth2Step) {
            break
        }

        let isMainPage = idContains("lax").className("android.widget.FrameLayout").clickable().visibleToUser(true).findOne(3000)//home
        let myProfile = idContains("laz").className("android.widget.FrameLayout").clickable().visibleToUser(true).findOne(1000)
        if (isMainPage && myProfile) {
            comm.showLog('已经登录进去了')
            comm.randomSwipe(4)
            return "success"
        }

        // let homeBtn = selector().textContains('Home').visibleToUser(true).findOne(1000)
        // if (homeBtn) {
        //     comm.randomSwipe(4)
        //     return 'success'
        // }
        // 
        sleep(5000)
    }
    comm.showLog("验证码部分全部结束，判断是否在二步验证界面")
    //判断是否在二步验证界面
    let auth2Step = idContains("csj").visibleToUser(true).exists()
    if (auth2Step) {
        for (let j = 0; j < 3; j++) {
            // let jsonData = {
            //     tokenUrl: code_url
            // }
            let vcodeStr = comm.httpToString(ttrpServer + "/api/code?token=" + code_url)
            if (vcodeStr != '' && vcodeStr.length < 10) {
                let vcode = ''
                vcode = vcodeStr
                let editText = selector().className("android.widget.EditText").visibleToUser(true).findOne(1000)
                // sysInputText(editText, vcode)
                setText(vcode)
                sleep(3000)

                //勾选不再需要二步验证
                let check2Step2 = idContains("csg").visibleToUser(true).findOne(3000)
                if (check2Step2) {
                    if (!check2Step2.checked()) {
                        comm.clickObj(check2Step2)
                    }
                }

                let btn = className("android.widget.Button").clickable().find()
                let continueBtn = filterButtonByPosition(btn, "bottom")
                if (continueBtn) {
                    comm.clickObj(continueBtn)
                    sleep(3000)
                }

                if (idContains("g9g").visibleToUser(true).exists()) {
                    comm.showLog("二步验证码错误或超时警告")
                } else {
                    break
                }
            }
            sleep(5000)
        }
    }


    //
    // let recommendations = selector().textContains('recommendations').visibleToUser(true).findOne(2000)
    // if (recommendations) {
    //     let skipBtn = selector().text('Skip').visibleToUser(true).findOne(2000)
    //     if (skipBtn) {
    //         comm.clickObj(skipBtn)
    //         sleep(3000)
    //     }
    // }


    // let ChooseWhatYouLike_2 = selector().textContains('Choose what you like').visibleToUser(true).findOne(2000)
    // if (ChooseWhatYouLike_2) {
    //     let skipBtn = selector().text('Skip').visibleToUser(true).findOne(2000)
    //     if (skipBtn) {
    //         comm.clickObj(skipBtn)
    //         sleep(3000)
    //     }
    // }

    //skip
    skipBtn = idContains("c43").visibleToUser(true).findOne(2000)
    if (skipBtn) {
        comm.clickObj(skipBtn)
        sleep(3000)
    }

    //
    // closeAllPop()
    //新政策弹窗 Got it
    let newPolicy2 = idContains("x9o").visibleToUser(true).findOne(1000)
    if (newPolicy2 && newPolicy2.childCount() == 3) {
        comm.showLog("显示新的政策弹窗口+1")
        commm.clickObj(newPolicy2.child(2))
    }



    // //登录后界面处理
    // let tooManyTips = selector().textContains('Too many attempts').visibleToUser(true).exists()
    // if (tooManyTips) {
    //     console.log('too many attempts')
    //     return 'Too many attempts'
    // }
    // let maximumMsg = selector().textContains('Maximum number').visibleToUser(true).findOne(1000)
    // if (maximumMsg) {
    //     console.log('操作频繁')
    //     // return maximumMsg.text()
    //     return "操作频繁"
    // }
    // accNoExist = selector().textContains("Account doesn't exist").visibleToUser(true).exists()
    // if (accNoExist) {
    //     return "账号不存在"
    // }
    // //判断是否网络问题
    // let networkErrorInPsdExist = selector().textContains('No network connection').visibleToUser(true).exists()
    // if (!networkErrorInPsdExist) {
    //     networkErrorInPsdExist = selector().textContains('No internet').visibleToUser(true).exists()
    // }
    // if (networkErrorInPsdExist) {
    //     console.log('输入完邮箱出现无网络提示')
    //     // return 'No network connection'
    //     return '输入完邮箱出现无网络提示'
    // }
    // let i_agree = selector().textContains('I agree').visibleToUser(true).findOne(1000)
    // if (i_agree) {
    //     comm.clickObj(i_agree)
    // }
    // let suspended = selector().textContains('suspended').visibleToUser(true).findOne(1000)
    // if (suspended) {
    //     comm.showLog('账号被封禁')
    //     // return suspended.text()
    //     return "账号被封禁"
    // }
    // closeAllPop()

    // skip
    skipBtn = idContains("c43").visibleToUser(true).findOne(2000)
    if (skipBtn) {
        comm.clickObj(skipBtn)
        sleep(3000)
        for (let ss = 0; ss < 3; ss++) {
            swipe(random(300, 330), random(1500, 1600), random(300, 330), random(100, 130), random(100, 300))
            sleep(1500)
            closeAllPop()
        }
        return 'success'
    }

    // 检查是否有home
    let isMainPage = idContains("lax").className("android.widget.FrameLayout").clickable().visibleToUser(true).findOne(3000)//home
    let myProfile = idContains("laz").className("android.widget.FrameLayout").clickable().visibleToUser(true).findOne(1000)
    if (isMainPage && myProfile) {
        comm.showLog('已经登录进去了')
        comm.randomSwipe(4)
        return "success"
    } else {
        return "失败"
    }

    // // 检查是否有home
    // let homeBtn = selector().textContains('Home').visibleToUser(true).findOne(1000)
    // if (homeBtn) {
    //     comm.showLog('已经登录进去了')
    //     comm.randomSwipe(4)
    //     return 'success'
    // }


    // let not_interested = selector().textContains('ot interested').visibleToUser(true).findOne(1000)
    // if (not_interested) {
    //     comm.clickObj(not_interested)
    // }
    // let follow_your_friends = selector().textContains('Follow your friends').visibleToUser(true).findOne(1000)
    // if (follow_your_friends) {
    //     let b = follow_your_friends.bounds()
    //     click(500, b.top - 100)
    // }
    // let doNotAllowBtn = selector().textContains('t allow').visibleToUser(true).findOne(1000)
    // if (doNotAllowBtn) {
    //     comm.clickObj(doNotAllowBtn)
    //     sleep(1000)
    //     for (let ss = 0; ss < 3; ss++) {
    //         swipe(random(300, 330), random(1500, 1600), random(300, 330), random(100, 130), random(100, 300))
    //         sleep(1000)
    //     }
    // }
    //
    //判断是不是在首页
    if (selector().textContains('Home').visibleToUser(true).exists() && selector().textContains('Profile').visibleToUser(true).exists()) {
        comm.showLog('已经登录进去了')
        comm.randomSwipe(4)
        return "success"
    } else {
        return "失败"
    }
}

//登录这是用于重新登陆
function WasLoggedOutAndLogin() {
    //第一步 进行登录界面
    comm.showLogToFile("登陆失效，执行登录")
    // 关闭Account status  Your account was logged out. Try logging inagain. 弹窗
    let logged_out_btn = selector().textContains("account was logged out").visibleToUser(true).findOne(1000)
    let welcome_back_text = selector().textContains("Welcome back").visibleToUser(true).findOne(1000)
    let username_text = selector().textContains(username).visibleToUser(true).findOne(1000)
    // if (selector().textContains("account was logged out").visibleToUser(true).exists()) {
    if (logged_out_btn || (welcome_back_text && username_text)) {
        //如果这个弹窗存在，就点一下ok
        if (logged_out_btn) {
            let OK_btn = selector().textContains("OK").visibleToUser(true).findOne(1000)
            if (OK_btn) {
                comm.showLogToFile("点击弹窗的ok，等待10秒")
                comm.clickObj(OK_btn)
                sleep(10000)
            } else {
                comm.showLogToFile("没有找到OK_btn")
                return '没有找到OK_btn'
            }
        }
        //出现该账号头像，以及Welcome back      log in  add another account 字样
        //点击log in
        //存在Log in按钮
        comm.showLogToFile("找log in按钮")
        let log_in_btn = selector().textContains('Log in').visibleToUser(true).findOne(1000)
        if (log_in_btn) {
            comm.clickObj(log_in_btn)
            sleep(3000)
        }
        //出现邮箱验证码流程 check your email
        sleep(10000)
        if (selector().textContains("heck your email").visibleToUser(true).exists()) {
            //获取和发送验证码
            let emailCode = ""
            sleep(20000)
            for (let e = 0; e < 10; e++) {
                comm.showLogToFile("请求验证码循环次数:" + e)
                // emailCode = comm.httpToString('http://120.236.196.248:9004/api/getLoginCode?email=' + email)
                emailCode = comm.httpToString('http://120.236.196.248:9004/api/getLoginCode?account_id=' + account_id)
                if (emailCode != "") {
                    comm.showLogToFile("输入验证码")
                    let inputs = selector().className('android.widget.EditText').find()
                    if (inputs.length > 0) {
                        sysInputText(inputs[0], emailCode)
                        break
                    }
                }
                sleep(8000)
            }
            if (emailCode = "") {
                comm.showLogToFile("验证码接口查询失败")
                return "验证码接口查询失败"
            }
        }
        sleep(10000)
        //判断是否在二步验证界面
        if (selector().textContains('2-step').visibleToUser(true).exists()) {
            comm.showLogToFile("有二步验证")
            //获取和发送验证码
            let emailCode = ""
            sleep(20000)
            for (let e = 0; e < 10; e++) {
                comm.showLogToFile("请求二步验证码循环次数:" + e)
                emailCode = comm.httpToString('http://23.91.96.20:3000/api/code?token=' + google_token)
                if (emailCode != "") {
                    comm.showLogToFile("输入二步验证码")
                    let inputs = selector().className('android.widget.EditText').find()
                    if (inputs.length > 0) {
                        sysInputText(inputs[0], emailCode)
                        break
                    }
                }
                sleep(8000)
            }
            if (emailCode = "") {
                comm.showLogToFile("二步验证码接口查询失败")
                return "二步验证码接口查询失败"
            }
            // 勾选并点击
            sleep(3000)
            let saveChack = selector().className('android.widget.CheckBox').visibleToUser(true).findOne(1000)
            if (saveChack) {
                if (saveChack.checked() == false) {
                    comm.clickObj(saveChack)
                }
            }
            //点击继续
            sleep(5000)
            let continueBtn = selector().textContains('Continue').visibleToUser(true).findOne(1000)
            if (continueBtn) {
                comm.clickObj(continueBtn)
                sleep(3000)
            }
        }
        sleep(10000)
        /////////////////////////////////////下面有多种可能性//////////////////////////////////
        //这里有路线分歧。有可能直接居成功进去home了，有可能还需要重新修改密码路线
        // 有可能出现需要验证密码 Verify identity    verify your identity
        if (selector().textContains('erify identity').visibleToUser(true).exists() || selector().textContains('verify your identity').visibleToUser(true).exists()) {
            let passwordBtn = selector().textContains('Password').visibleToUser(true).findOne(1000)
            if (passwordBtn) {
                comm.showLogToFile("二步之后的验证，找到密码按钮")
                comm.clickObj(passwordBtn)
                sleep(3000)
                let nextBtn = selector().textContains('Next').visibleToUser(true).findOne(1000)
                if (nextBtn) {
                    comm.clickObj(nextBtn)
                    sleep(8000)
                    if (selector().textContains('Enter password').visibleToUser(true).exists()) {
                        comm.showLogToFile("进入密码输入页")
                        let inputsTest = selector().className('android.widget.EditText').find()
                        if (inputsTest.length > 0) {
                            inputsTest[0].setText(password)
                            sleep(3000)
                            let nextBtn2 = selector().textContains('Next').visibleToUser(true).findOne(1000)
                            if (nextBtn2) {
                                comm.clickObj(nextBtn2)
                            }
                            sleep(10000)
                            //出现一些失败的报错
                            if (selector().textContains('not exist or expired').visibleToUser(true).exists()) {
                                comm.showLog("出现错误：Data-do-not-exist-or-expired")
                                return "出现错误：Data-do-not-exist-or-expired"
                            }
                            if (selector().textContains('password expired and must be changed').visibleToUser(true).exists()) {
                                comm.showLog("出现错误：password-expired-and-must-be-changed必须修改密码")
                            }
                            // Maximum number of attempts reachedTry again later.
                            if (selector().textContains('Maximum number').visibleToUser(true).exists()) {
                                comm.showLog("出现错误：Maximum-number")
                                // return "出现错误：Maximum-number"
                            }
                        }

                    } else {
                        comm.showLogToFile("没进入密码输入页")
                        return "没进入密码输入页"
                    }
                }
            } else {
                comm.showLogToFile("二步之后的验证，没有找到密码按钮")
                return "二步之后的验证，没有找到密码按钮"
            }
        }
        sleep(10000)
        //可能出现必须修改密码
        if (selector().textContains('password expired and must be changed').visibleToUser(true).exists()) {
            comm.showLogToFile("弹出密码过期必须修改，并进行密码修改")
            sleep(5000)
            let emailCode = ""
            sleep(20000)
            for (let e = 0; e < 10; e++) {
                comm.showLogToFile("请求验证码循环次数:" + e)
                // emailCode = comm.httpToString('http://120.236.196.248:9004/api/getLoginCode?email=' + email)
                emailCode = comm.httpToString('http://120.236.196.248:9004/api/getLoginCode?account_id=' + account_id)
                if (emailCode != "") {
                    comm.showLogToFile("输入验证码")
                    // let inputs = selector().className('android.widget.EditText').find()
                    // sysInputText(inputs[0], emailCode)
                    let inputs = selector().className('android.widget.EditText').findOne(2000);
                    if (!inputs) {
                        comm.showLogToFile("没找到输入框")
                        return "没找到输入框"
                    } else {
                        sysInputText(inputs, emailCode)
                        break
                    }
                }
                sleep(5000)
            }
            if (emailCode = "") {
                comm.showLogToFile("验证码接口查询失败")
                return "验证码接口查询失败"
            }
            //
            sleep(10000)
            //Create password
            if (selector().textContains('reate password').visibleToUser(true).exists()) {
                comm.showLogToFile("进入修改密码页面")
                let changePasswordText = selector().className("android.widget.EditText").findOne(2000);
                if (!changePasswordText) {
                    comm.showLogToFile("没找到输入框")
                    return "没找到输入框"
                } else {
                    password_new = password + '1'
                    sysInputText(changePasswordText, password_new)
                    comm.showLogToFile("输入新密码" + password_new)
                    sleep(15000)
                    let continueBtn = selector().textContains('Continue').visibleToUser(true).findOne(1000)
                    if (continueBtn) {
                        comm.clickObj(continueBtn)
                        sleep(5000)
                    }
                    sleep(10000)
                    //出现一些失败的报错
                    if (selector().textContains('not exist or expired').visibleToUser(true).exists()) {
                        comm.showLogToFile("出现错误：Data-do-not-exist-or-expired")
                        return "出现错误：Data-do-not-exist-or-expired"
                    }
                    // Maximum number of attempts reachedTry again later.
                    if (selector().textContains('Maximum number').visibleToUser(true).exists()) {
                        comm.showLogToFile("出现错误：Maximum-number")
                        return "出现错误：Maximum-number"
                    }
                }
            }
        }
        sleep(10000)
        //有可能弹出最大次数Maximum number of attempts，如果出现这个，看看有没有Use password insted
        if (selector().textContains('Maximum number of attempts').visibleToUser(true).exists()) {
            comm.showLogToFile("出现：Maximum-number-of-attempts")
            //判断有没有Use password instead
            let usePassinstBtn = selector().textContains('Use password instead').visibleToUser(true).findOne(1000)
            let forgotPassBtn = selector().textContains('Forgot password').visibleToUser(true).findOne(1000)
            if (forgotPassBtn) {
                comm.clickObj(forgotPassBtn)
                sleep(10000)
                let emailBtn = selector().textContains('Email').visibleToUser(true).findOne(1000)
                if (emailBtn) {
                    comm.clickObj(emailBtn)
                }
                sleep(10000)
                let continueBtn = selector().textContains('Continue').visibleToUser(true).findOne(1000)
                if (continueBtn) {
                    comm.clickObj(continueBtn)
                }
                sleep(10000)
                if (selector().textContains("erify your email").visibleToUser(true).exists()) {
                    comm.showLogToFile("获取和发送验证码")
                    //获取和发送验证码
                    let emailCode = ""
                    sleep(20000)
                    for (let e = 0; e < 10; e++) {
                        comm.showLogToFile("请求验证码循环次数:" + e)
                        // emailCode = comm.httpToString('http://120.236.196.248:9004/api/getLoginCode?email=' + email)
                        emailCode = comm.httpToString('http://120.236.196.248:9004/api/getLoginCode?account_id=' + account_id)
                        if (emailCode != "") {
                            comm.showLogToFile("输入验证码")
                            let inputs = selector().className('android.widget.EditText').find()
                            if (inputs.length > 0) {
                                sysInputText(inputs[0], emailCode)
                                break
                            }
                        }
                        sleep(8000)
                    }
                    if (emailCode = "") {
                        comm.showLogToFile("验证码接口查询失败")
                        return "验证码接口查询失败"
                    }
                }
                sleep(10000)
                if (selector().textContains('Reset password').visibleToUser(true).exists()) {
                    comm.showLogToFile("进入修改密码页面")
                    let changePasswordText = selector().className("android.widget.EditText").findOne(2000);
                    if (!changePasswordText) {
                        comm.showLogToFile("没找到输入框")
                        return "没找到输入框"
                    } else {
                        password_new = password + '1'
                        sysInputText(changePasswordText, password_new)
                        comm.showLogToFile("输入新密码" + password_new)
                        sleep(15000)
                        let continueBtn = selector().textContains('Continue').visibleToUser(true).findOne(1000)
                        if (continueBtn) {
                            comm.clickObj(continueBtn)
                            sleep(3000)
                        }
                        sleep(10000)
                        //出现一些失败的报错
                        if (selector().textContains('not exist or expired').visibleToUser(true).exists()) {
                            comm.showLogToFile("出现错误：Data-do-not-exist-or-expired")
                            return "出现错误：Data-do-not-exist-or-expired"
                        }
                        // Maximum number of attempts reachedTry again later.
                        if (selector().textContains('Maximum number').visibleToUser(true).exists()) {
                            comm.showLogToFile("出现错误：Maximum-number")
                            return "出现错误：Maximum-number"
                        }
                    }
                }

            } else if (usePassinstBtn) {
                comm.clickObj(usePassinstBtn)
            } else {
                comm.showLogToFile("没有忘记密码、没有使用密码登陆 的入口")
            }
            sleep(3000)
        }



    } else {
        comm.showLogToFile("没有 Your-account-was-logged-out")
        return 'success'
    }
    sleep(10000)
    let skipInterestBtn = selector().textContains('Skip').visibleToUser(true).findOne(1000)
    if (skipInterestBtn) {
        comm.clickObj(skipInterestBtn)
        sleep(3000)
        for (let ss = 0; ss < 3; ss++) {
            swipe(random(300, 330), random(1500, 1600), random(300, 330), random(100, 130), random(100, 300))
            sleep(1500)
            closeAllPop()
        }
        return 'success'
    }
    sleep(10000)
    // 检查是否有home
    let homeBtn = selector().textContains('Home').visibleToUser(true).findOne(1000)
    if (homeBtn) {
        comm.randomSwipe(4)

        return 'success'
    }
    let not_interested = selector().textContains('ot interested').visibleToUser(true).findOne(1000)
    if (not_interested) {
        comm.clickObj(not_interested)
    }
    let follow_your_friends = selector().textContains('Follow your friends').visibleToUser(true).findOne(1000)
    if (follow_your_friends) {
        let b = follow_your_friends.bounds()
        click(500, b.top - 100)
    }
    let doNotAllowBtn = selector().textContains('t allow').visibleToUser(true).findOne(1000)
    if (doNotAllowBtn) {
        comm.clickObj(doNotAllowBtn)
        sleep(1000)
        for (let ss = 0; ss < 3; ss++) {
            swipe(random(300, 330), random(1500, 1600), random(300, 330), random(100, 130), random(100, 300))
            sleep(1000)
        }
    }
    //
    sleep(10000)
    //判断是不是在首页
    if (selector().textContains('Home').visibleToUser(true).exists() && selector().textContains('Profile').visibleToUser(true).exists()) {
        comm.showLogToFile('已经登录进去了')
        comm.randomSwipe(4)
        //
        // comm.showLog('发送备份请求')
        // //
        // httpShell('curl "http://127.0.0.1:8000/api/backup?backup_no=' + backupNo + '"')
        //
        return "success"
    } else {
        return "不在首页，失败"
    }
}


function WasLoggedOutAndLogin_v2() {
    //第一步 进行登录界面
    comm.showLogToFile("登陆失效，执行登录")
    // 关闭Account status  Your account was logged out. Try logging inagain. 弹窗
    let logged_out_btn = selector().textContains("account was logged out").visibleToUser(true).findOne(1000)
    let welcome_back_text = selector().textContains("Welcome back").visibleToUser(true).findOne(1000)
    let username_text = selector().textContains(username).visibleToUser(true).findOne(1000)
    // if (selector().textContains("account was logged out").visibleToUser(true).exists()) {
    if (logged_out_btn || (welcome_back_text && username_text)) {
        //如果这个弹窗存在，就点一下ok
        if (logged_out_btn) {
            let OK_btn = selector().textContains("OK").visibleToUser(true).findOne(1000)
            if (OK_btn) {
                comm.showLogToFile("点击弹窗的ok，等待10秒")
                comm.clickObj(OK_btn)
                sleep(10000)
            } else {
                comm.showLogToFile("没有找到OK_btn")
                return '没有找到OK_btn'
            }
        }
        //出现该账号头像，以及Welcome back      log in  add another account 字样
        //点击log in
        //存在Log in按钮
        comm.showLogToFile("找log in按钮")
        let log_in_btn = selector().textContains('Log in').visibleToUser(true).findOne(1000)
        if (log_in_btn) {
            comm.clickObj(log_in_btn)
            sleep(3000)
        }

        for (let r = 0; r < 5; r++) {
            //出现邮箱验证码流程 check your email
            if (selector().textContains("heck your email").visibleToUser(true).exists()) {
                //获取和发送验证码
                let emailCode = ""
                sleep(20000)
                for (let e = 0; e < 10; e++) {
                    comm.showLogToFile("请求验证码循环次数:" + e)
                    // emailCode = comm.httpToString('http://120.236.196.248:9004/api/getLoginCode?email=' + email)
                    emailCode = comm.httpToString('http://120.236.196.248:9004/api/getLoginCode?account_id=' + account_id)
                    if (emailCode != "") {
                        comm.showLogToFile("输入验证码")
                        let inputs = selector().className('android.widget.EditText').find()
                        if (inputs.length > 0) {
                            sysInputText(inputs[0], emailCode)
                            break
                        }
                    }
                    sleep(8000)
                }
                if (emailCode = "") {
                    comm.showLogToFile("验证码接口查询失败")
                    return "验证码接口查询失败"
                }
                sleep(10000)
            }

            //判断是否在二步验证界面
            if (selector().textContains('2-step').visibleToUser(true).exists()) {
                comm.showLogToFile("有二步验证")
                //获取和发送验证码
                let emailCode = ""
                sleep(20000)
                for (let e = 0; e < 10; e++) {
                    comm.showLogToFile("请求二步验证码循环次数:" + e)
                    emailCode = comm.httpToString('http://23.91.96.20:3000/api/code?token=' + google_token)
                    if (emailCode != "") {
                        comm.showLogToFile("输入二步验证码")
                        let inputs = selector().className('android.widget.EditText').find()
                        if (inputs.length > 0) {
                            sysInputText(inputs[0], emailCode)
                            break
                        }
                    }
                    sleep(8000)
                }
                if (emailCode = "") {
                    comm.showLogToFile("二步验证码接口查询失败")
                    return "二步验证码接口查询失败"
                }
                // 勾选并点击
                sleep(3000)
                let saveChack = selector().className('android.widget.CheckBox').visibleToUser(true).findOne(1000)
                if (saveChack) {
                    if (saveChack.checked() == false) {
                        comm.clickObj(saveChack)
                    }
                }
                //点击继续
                sleep(5000)
                let continueBtn = selector().textContains('Continue').visibleToUser(true).findOne(1000)
                if (continueBtn) {
                    comm.clickObj(continueBtn)
                    sleep(3000)
                }
                sleep(10000)
            }

            //有可能弹出最大次数Maximum number of attempts，如果出现这个，看看有没有Use password insted
            if (selector().textContains('Maximum number of attempts').visibleToUser(true).exists()) {
                comm.showLogToFile("出现：Maximum-number-of-attempts")
                //判断有没有Use password instead
                let forgotPassBtn = selector().textContains('Forgot password?').visibleToUser(true).findOne(1000)
                let usePassinstBtn = selector().textContains('Use password instead').visibleToUser(true).findOne(1000)
                if (forgotPassBtn) {
                    comm.showLogToFile("点击忘记密码")
                    comm.clickObj(forgotPassBtn)
                    sleep(10000)
                    let emailBtn = selector().textContains('Email').visibleToUser(true).findOne(1000)
                    if (emailBtn) {
                        comm.clickObj(emailBtn)
                    }
                } else if (usePassinstBtn) {
                    comm.showLogToFile("点击使用密码登录")
                    comm.clickObj(usePassinstBtn)
                    sleep(10000)
                    let forgotPassBtn2 = selector().textContains('Forgot password?').visibleToUser(true).findOne(1000)
                    if (forgotPassBtn2) {
                        comm.showLogToFile("点击忘记密码")
                        comm.clickObj(forgotPassBtn2)
                        sleep(10000)
                        let emailBtn = selector().textContains('Email').visibleToUser(true).findOne(1000)
                        if (emailBtn) {
                            comm.clickObj(emailBtn)
                        }
                    }
                } else {
                    comm.showLogToFile("没有忘记密码、没有使用密码登陆 的入口")
                }
                sleep(10000)
            }

            //验证密码页
            if (selector().textContains('erify identity').visibleToUser(true).exists() || selector().textContains('verify your identity').visibleToUser(true).exists()) {
                let passwordBtn = selector().textContains('Password').visibleToUser(true).findOne(1000)
                if (passwordBtn) {
                    comm.showLogToFile("二步之后的验证，找到密码按钮")
                    comm.clickObj(passwordBtn)
                    sleep(3000)
                    let nextBtn = selector().textContains('Next').visibleToUser(true).findOne(1000)
                    if (nextBtn) {
                        comm.clickObj(nextBtn)
                        sleep(8000)
                        //
                        if (selector().textContains('Enter password').visibleToUser(true).exists()) {
                            comm.showLogToFile("进入密码输入页")
                            let inputsTest = selector().className('android.widget.EditText').find()
                            if (inputsTest.length > 0) {
                                inputsTest[0].setText(password)
                                sleep(3000)
                                let nextBtn2 = selector().textContains('Next').visibleToUser(true).findOne(1000)
                                if (nextBtn2) {
                                    comm.clickObj(nextBtn2)
                                }
                                sleep(10000)
                                //出现一些失败的报错
                                if (selector().textContains('not exist or expired').visibleToUser(true).exists()) {
                                    comm.showLogToFile("出现错误：Data-do-not-exist-or-expired")
                                    return "出现错误：Data-do-not-exist-or-expired"
                                }
                                if (selector().textContains('password expired and must be changed').visibleToUser(true).exists()) {
                                    comm.showLogToFile("出现错误：password-expired-and-must-be-changed必须修改密码")
                                    sleep(10000)
                                    //修改密码的邮箱验证
                                    if (selector().textContains("erify your email").visibleToUser(true).exists()) {
                                        comm.showLogToFile("获取和发送验证码")
                                        //获取和发送验证码
                                        let emailCode = ""
                                        sleep(20000)
                                        for (let e = 0; e < 10; e++) {
                                            comm.showLogToFile("请求验证码循环次数:" + e)
                                            // emailCode = comm.httpToString('http://120.236.196.248:9004/api/getLoginCode?email=' + email)
                                            emailCode = comm.httpToString('http://120.236.196.248:9004/api/getLoginCode?account_id=' + account_id)
                                            if (emailCode != "") {
                                                comm.showLogToFile("输入验证码")
                                                let inputs = selector().className('android.widget.EditText').find()
                                                if (inputs.length > 0) {
                                                    sysInputText(inputs[0], emailCode)
                                                    break
                                                }
                                            }
                                            sleep(8000)
                                        }
                                        if (emailCode = "") {
                                            comm.showLogToFile("验证码接口查询失败")
                                            return "验证码接口查询失败"
                                        }
                                    }
                                    sleep(10000)
                                    if (selector().textContains('Create password').visibleToUser(true).exists()) {
                                        comm.showLogToFile("进入修改密码页面")
                                        let changePasswordText = selector().className("android.widget.EditText").findOne(2000);
                                        if (!changePasswordText) {
                                            comm.showLogToFile("没找到输入框")
                                            return "没找到输入框"
                                        } else {
                                            password_new = password + '1'
                                            sysInputText(changePasswordText, password_new)
                                            comm.showLogToFile("输入新密码" + password_new)
                                            sleep(15000)
                                            let continueBtn = selector().textContains('Continue').visibleToUser(true).findOne(1000)
                                            if (continueBtn) {
                                                comm.clickObj(continueBtn)
                                                sleep(3000)
                                            }
                                            sleep(10000)
                                            //出现一些失败的报错
                                            if (selector().textContains('not exist or expired').visibleToUser(true).exists()) {
                                                comm.showLogToFile("出现错误：Data-do-not-exist-or-expired")
                                                return "出现错误：Data-do-not-exist-or-expired"
                                            }
                                            // Maximum number of attempts reachedTry again later.
                                            if (selector().textContains('Maximum number').visibleToUser(true).exists()) {
                                                comm.showLogToFile("出现错误：Maximum-number")
                                                // return "出现错误：Maximum-number"
                                            }
                                        }
                                    }
                                }
                                // Maximum number of attempts reachedTry again later.
                                if (selector().textContains('Maximum number').visibleToUser(true).exists()) {
                                    comm.showLogToFile("出现错误：Maximum-number")
                                    // return "出现错误：Maximum-number"
                                }
                            }

                        } else {
                            comm.showLogToFile("没进入密码输入页")
                            return "没进入密码输入页"
                        }
                    }
                } else {
                    comm.showLogToFile("二步之后的验证，没有找到密码按钮")
                    return "二步之后的验证，没有找到密码按钮"
                }
                sleep(10000)
            }

            //忘记密码路线
            if (selector().text('Forgot password').visibleToUser(true).exists()) {
                comm.showLogToFile("在忘记密码页面")
                let continueBtn = selector().textContains('Continue').visibleToUser(true).findOne(1000)
                if (continueBtn) {
                    comm.clickObj(continueBtn)
                }
                sleep(10000)
                if (selector().textContains("erify your email").visibleToUser(true).exists()) {
                    comm.showLogToFile("获取和发送验证码")
                    //获取和发送验证码
                    let emailCode = ""
                    sleep(20000)
                    for (let e = 0; e < 10; e++) {
                        comm.showLogToFile("请求验证码循环次数:" + e)
                        // emailCode = comm.httpToString('http://120.236.196.248:9004/api/getLoginCode?email=' + email)
                        emailCode = comm.httpToString('http://120.236.196.248:9004/api/getLoginCode?account_id=' + account_id)
                        if (emailCode != "") {
                            comm.showLogToFile("输入验证码")
                            let inputs = selector().className('android.widget.EditText').find()
                            if (inputs.length > 0) {
                                sysInputText(inputs[0], emailCode)
                                break
                            }
                        }
                        sleep(8000)
                    }
                    if (emailCode = "") {
                        comm.showLogToFile("验证码接口查询失败")
                        return "验证码接口查询失败"
                    }
                }
                sleep(10000)
                if (selector().textContains('Reset password').visibleToUser(true).exists()) {
                    comm.showLogToFile("进入修改密码页面")
                    let changePasswordText = selector().className("android.widget.EditText").findOne(2000);
                    if (!changePasswordText) {
                        comm.showLogToFile("没找到输入框")
                        return "没找到输入框"
                    } else {
                        password_new = password + '1'
                        sysInputText(changePasswordText, password_new)
                        comm.showLogToFile("输入新密码" + password_new)
                        sleep(15000)
                        let continueBtn = selector().textContains('Continue').visibleToUser(true).findOne(1000)
                        if (continueBtn) {
                            comm.clickObj(continueBtn)
                            sleep(3000)
                        }
                        sleep(10000)
                        //出现一些失败的报错
                        if (selector().textContains('not exist or expired').visibleToUser(true).exists()) {
                            comm.showLogToFile("出现错误：Data-do-not-exist-or-expired")
                            return "出现错误：Data-do-not-exist-or-expired"
                        }
                        // Maximum number of attempts reachedTry again later.
                        if (selector().textContains('Maximum number').visibleToUser(true).exists()) {
                            comm.showLogToFile("出现错误：Maximum-number")
                            // return "出现错误：Maximum-number"
                        }
                    }
                }
                sleep(10000)
            }
        }


    } else {
        comm.showLogToFile("没有 Your-account-was-logged-out")
        return 'success'
    }
    //算是登陆执行完了
    sleep(10000)
    if (!selector().textContains('Home').visibleToUser(true).exists()) {
        closeAllPop()
        sleep(10000)
    }
    let skipInterestBtn = selector().textContains('Skip').visibleToUser(true).findOne(1000)
    if (skipInterestBtn) {
        comm.clickObj(skipInterestBtn)
        sleep(3000)
        for (let ss = 0; ss < 3; ss++) {
            swipe(random(300, 330), random(1500, 1600), random(300, 330), random(100, 130), random(100, 300))
            sleep(1500)
            closeAllPop()
        }
        return 'success'
    }
    sleep(10000)
    // 检查是否有home
    let homeBtn = selector().textContains('Home').visibleToUser(true).findOne(1000)
    if (homeBtn) {
        comm.randomSwipe(4)

        return 'success'
    }
    let not_interested = selector().textContains('ot interested').visibleToUser(true).findOne(1000)
    if (not_interested) {
        comm.clickObj(not_interested)
    }
    let follow_your_friends = selector().textContains('Follow your friends').visibleToUser(true).findOne(1000)
    if (follow_your_friends) {
        let b = follow_your_friends.bounds()
        click(500, b.top - 100)
    }
    let doNotAllowBtn = selector().textContains('t allow').visibleToUser(true).findOne(1000)
    if (doNotAllowBtn) {
        comm.clickObj(doNotAllowBtn)
        sleep(1000)
        for (let ss = 0; ss < 3; ss++) {
            swipe(random(300, 330), random(1500, 1600), random(300, 330), random(100, 130), random(100, 300))
            sleep(1000)
        }
    }
    //
    sleep(10000)
    //判断是不是在首页
    if (selector().textContains('Home').visibleToUser(true).exists() && selector().textContains('Profile').visibleToUser(true).exists()) {
        comm.showLogToFile('已经登录进去了')
        comm.randomSwipe(4)
        //
        // comm.showLog('发送备份请求')
        // //
        // httpShell('curl "http://127.0.0.1:8000/api/backup?backup_no=' + backupNo + '"')
        //
        return "success"
    } else {
        return "不在首页，失败"
    }
}

//登录这是用于另外一个形式的重新登陆
function WasLoggedOutAndLogin_other() {
    //第一步 进行登录界面
    comm.showLogToFile("登陆失效，执行登录")
    // Last login:
    // text = Use phone / email / username

    let last_login = selector().textContains('ast login').visibleToUser(true).findOne(1000)
    let p_e_u_btn = selector().textContains('phone / email / username').visibleToUser(true).findOne(1000)
    if (last_login || p_e_u_btn) {
        if (last_login) {
            comm.clickObj(last_login)
        } else if (p_e_u_btn) {
            comm.clickObj(p_e_u_btn)
        }
        //
        sleep(5000)
        // 可能会出现那个读取本机号码的弹窗
        if (selector().textContains('Continue with').visibleToUser(true).exists() && selector().textContains('NONE OF THE ABOVE').visibleToUser(true).exists()) {
            back()
        }
        //
        comm.showLogToFile("找Email/Username")
        let usernameTextView = selector().textContains('Email / Username').visibleToUser(true).findOne(3000)
        if (usernameTextView) {
            comm.showLogToFile("找到Email/Username并点击")
            comm.clickObj(usernameTextView)
            sleep(2000)
            //
            let inputsTest = selector().className('android.widget.EditText').find()
            if (inputsTest.length < 1) {
                comm.showLogToFile("没找到输入框：" + inputsTest.length)
                return "没找到输入框"
            }
            //
            sleep(5000)
            let inputs = selector().className('android.widget.EditText').find()
            if (inputs) {
                inputs[1].setText(email)
            }
            sleep(5000)
            let saveChack = selector().className('android.widget.CheckBox').visibleToUser(true).findOne(1000)
            if (saveChack) {
                if (saveChack.checked() == false) {
                    comm.clickObj(saveChack)
                }
            }
            sleep(5000)
            let continueBtn = selector().textContains('Continue').visibleToUser(true).findOne(2000)
            if (continueBtn) {
                if (continueBtn.text() != "Continue") {
                    return "没正确执行"
                } else {
                    comm.clickObj(continueBtn)
                    sleep(3000)
                }
            }
            sleep(5000)
            comm.showLogToFile("输入密码")
            comm.clickObj(inputs[2])
            sysInputText(inputs[2], password)
            //输入之后
            sleep(5000)
            //点击continue
            comm.showLogToFile("点击continue")
            let continueBtn2 = selector().textContains('Continue').visibleToUser(true).findOne(2000)
            if (continueBtn2) {
                if (continueBtn2.text() != "Continue") {
                    return "没正确执行"
                } else {
                    comm.clickObj(continueBtn2)
                    sleep(3000)
                }
            }
        } else {
            comm.showLogToFile("没有Email-/-Username输入按钮")
            return 'success'
        }
    } else {
        comm.showLogToFile("没有 Use-phone-/-email-/-username")
        return 'success'
    }
    comm.showLogToFile("等待15秒，判断有没有滑块验证码")
    sleep(15000)
    // 可能会出现验证码。遇到了变速验证码。判断一下Refresh这个文字刷新是否存在，存在就走常规验证码，不存在但是存在Drag the puzzle piece into place 就走变速验证码
    let verify1 = selector().textContains('erify to continue').visibleToUser(true).exists()
    let verify2 = selector().textContains('Refresh').visibleToUser(true).exists()
    let verify3 = selector().textContains('rag the puzzle piece into place').visibleToUser(true).exists()
    if (verify1 || verify2 || verify3) {
        let verifyMsg = ""
        //说明有验证码
        if (verify2) {
            comm.showLogToFile("常规滑块验证码")
            verifyMsg = imageCodeVerify_Buy()
        } else {
            comm.showLogToFile("变化速率的滑块验证码")
            verifyMsg = sliderVerificationCode()
        }
        comm.showLogToFile("验证码部分返回：" + verifyMsg)
    }
    comm.showLogToFile("滑块验证码完成，等待15秒，再次判断有没有滑块验证码")
    sleep(15000)
    verify1 = selector().textContains('erify to continue').visibleToUser(true).exists()
    verify2 = selector().textContains('Refresh').visibleToUser(true).exists()
    verify3 = selector().textContains('rag the puzzle piece into place').visibleToUser(true).exists()
    if (verify1 || verify2 || verify3) {
        return '还有验证码存在，不成功'
    }
    //邮箱验证码
    //出现邮箱验证码流程 check your email
    sleep(10000)
    if (selector().textContains("heck your email").visibleToUser(true).exists()) {
        //获取和发送验证码
        let emailCode = ""
        sleep(20000)
        for (let e = 0; e < 10; e++) {
            comm.showLogToFile("请求验证码循环次数:" + e)
            // emailCode = comm.httpToString('http://120.236.196.248:9004/api/getLoginCode?email=' + email)
            emailCode = comm.httpToString('http://120.236.196.248:9004/api/getLoginCode?account_id=' + account_id)
            if (emailCode != "") {
                comm.showLogToFile("输入验证码")
                let inputs = selector().className('android.widget.EditText').find()
                if (inputs.length > 0) {
                    sysInputText(inputs[0], emailCode)
                    break
                }
            }
            sleep(5000)
        }
        if (emailCode = "") {
            comm.showLogToFile("验证码接口查询失败")
            return "验证码接口查询失败"
        }
    }
    //
    sleep(15000)
    comm.randomSwipe(3)
    let skipInterestBtn = selector().textContains('Skip').visibleToUser(true).findOne(1000)
    if (skipInterestBtn) {
        comm.clickObj(skipInterestBtn)
        sleep(3000)
        for (let ss = 0; ss < 3; ss++) {
            swipe(random(300, 330), random(1500, 1600), random(300, 330), random(100, 130), random(100, 300))
            sleep(1500)
            closeAllPop()
        }
        return 'success'
    }
    sleep(10000)
    // 检查是否有home
    let homeBtn = selector().textContains('Home').visibleToUser(true).findOne(1000)
    if (homeBtn) {
        comm.randomSwipe(4)

        return 'success'
    }
    let not_interested = selector().textContains('ot interested').visibleToUser(true).findOne(1000)
    if (not_interested) {
        comm.clickObj(not_interested)
    }
    let follow_your_friends = selector().textContains('Follow your friends').visibleToUser(true).findOne(1000)
    if (follow_your_friends) {
        let b = follow_your_friends.bounds()
        click(500, b.top - 100)
    }
    let doNotAllowBtn = selector().textContains('t allow').visibleToUser(true).findOne(1000)
    if (doNotAllowBtn) {
        comm.clickObj(doNotAllowBtn)
        sleep(1000)
        for (let ss = 0; ss < 3; ss++) {
            swipe(random(300, 330), random(1500, 1600), random(300, 330), random(100, 130), random(100, 300))
            sleep(1000)
        }
    }
    //
    sleep(10000)
    //判断是不是在首页
    if (selector().textContains('Home').visibleToUser(true).exists() && selector().textContains('Profile').visibleToUser(true).exists()) {
        comm.showLogToFile('已经登录进去了')
        comm.randomSwipe(4)
        //
        // comm.showLog('发送备份请求')
        // //
        // httpShell('curl "http://127.0.0.1:8000/api/backup?backup_no=' + backupNo + '"')
        //
        return "success"
    } else {
        return "不在首页，失败"
    }
}

function WasLoggedOutAndLogin_other_v2() {
    //第一步 进行登录界面
    comm.showLogToFile("登陆失效，执行登录")
    // Last login:
    // text = Use phone / email / username

    let last_login = selector().textContains('ast login').visibleToUser(true).findOne(1000)
    let p_e_u_btn = selector().textContains('phone / email / username').visibleToUser(true).findOne(1000)
    if (last_login || p_e_u_btn) {
        if (last_login) {
            comm.clickObj(last_login)
        } else if (p_e_u_btn) {
            comm.clickObj(p_e_u_btn)
        }
        //
        sleep(5000)
        // 可能会出现那个读取本机号码的弹窗
        if (selector().textContains('Continue with').visibleToUser(true).exists() && selector().textContains('NONE OF THE ABOVE').visibleToUser(true).exists()) {
            back()
        }
        //
        comm.showLogToFile("找Email/Username")
        let usernameTextView = selector().textContains('Email / Username').visibleToUser(true).findOne(3000)
        if (usernameTextView) {
            comm.showLogToFile("找到Email/Username并点击")
            comm.clickObj(usernameTextView)
            sleep(2000)
            //
            let inputsTest = selector().className('android.widget.EditText').find()
            if (inputsTest.length < 1) {
                comm.showLogToFile("没找到输入框：" + inputsTest.length)
                return "没找到输入框"
            }
            //
            sleep(5000)
            let inputs = selector().className('android.widget.EditText').find()
            if (inputs) {
                inputs[1].setText(email)
            }
            sleep(5000)
            let saveChack = selector().className('android.widget.CheckBox').visibleToUser(true).findOne(1000)
            if (saveChack) {
                if (saveChack.checked() == false) {
                    comm.clickObj(saveChack)
                }
            }
            sleep(5000)
            let continueBtn = selector().textContains('Continue').visibleToUser(true).findOne(2000)
            if (continueBtn) {
                if (continueBtn.text() != "Continue") {
                    return "没正确执行"
                } else {
                    comm.clickObj(continueBtn)
                    sleep(3000)
                }
            }

        }

        //一些页面的处理
        for (let r = 0; r < 5; r++) {
            //出现邮箱验证码流程 check your email
            if (selector().textContains("heck your email").visibleToUser(true).exists()) {
                //获取和发送验证码
                let emailCode = ""
                sleep(20000)
                for (let e = 0; e < 10; e++) {
                    comm.showLogToFile("请求验证码循环次数:" + e)
                    // emailCode = comm.httpToString('http://120.236.196.248:9004/api/getLoginCode?email=' + email)
                    emailCode = comm.httpToString('http://120.236.196.248:9004/api/getLoginCode?account_id=' + account_id)
                    if (emailCode != "") {
                        comm.showLogToFile("输入验证码")
                        let inputs = selector().className('android.widget.EditText').find()
                        if (inputs.length > 0) {
                            sysInputText(inputs[0], emailCode)
                            break
                        }
                    }
                    sleep(8000)
                }
                if (emailCode = "") {
                    comm.showLogToFile("验证码接口查询失败")
                    return "验证码接口查询失败"
                }
                sleep(10000)
            }

            //判断是否在二步验证界面
            if (selector().textContains('2-step').visibleToUser(true).exists()) {
                comm.showLogToFile("有二步验证")
                //获取和发送验证码
                let emailCode = ""
                sleep(20000)
                for (let e = 0; e < 10; e++) {
                    comm.showLogToFile("请求二步验证码循环次数:" + e)
                    emailCode = comm.httpToString('http://23.91.96.20:3000/api/code?token=' + google_token)
                    if (emailCode != "") {
                        comm.showLogToFile("输入二步验证码")
                        let inputs = selector().className('android.widget.EditText').find()
                        if (inputs.length > 0) {
                            sysInputText(inputs[0], emailCode)
                            break
                        }
                    }
                    sleep(8000)
                }
                if (emailCode = "") {
                    comm.showLogToFile("二步验证码接口查询失败")
                    return "二步验证码接口查询失败"
                }
                // 勾选并点击
                sleep(3000)
                let saveChack = selector().className('android.widget.CheckBox').visibleToUser(true).findOne(1000)
                if (saveChack) {
                    if (saveChack.checked() == false) {
                        comm.clickObj(saveChack)
                    }
                }
                //点击继续
                sleep(5000)
                let continueBtn = selector().textContains('Continue').visibleToUser(true).findOne(1000)
                if (continueBtn) {
                    comm.clickObj(continueBtn)
                    sleep(3000)
                }
                sleep(10000)
            }

            //有可能弹出最大次数Maximum number of attempts，如果出现这个，看看有没有Use password insted
            if (selector().textContains('Maximum number of attempts').visibleToUser(true).exists()) {
                comm.showLogToFile("出现：Maximum-number-of-attempts")
                //判断有没有Use password instead
                let forgotPassBtn = selector().textContains('Forgot password?').visibleToUser(true).findOne(1000)
                let usePassinstBtn = selector().textContains('Use password instead').visibleToUser(true).findOne(1000)
                if (forgotPassBtn) {
                    comm.showLogToFile("点击忘记密码")
                    comm.clickObj(forgotPassBtn)
                    sleep(10000)
                    let emailBtn = selector().textContains('Email').visibleToUser(true).findOne(1000)
                    if (emailBtn) {
                        comm.clickObj(emailBtn)
                    }
                } else if (usePassinstBtn) {
                    comm.showLogToFile("点击使用密码登录")
                    comm.clickObj(usePassinstBtn)
                    sleep(10000)
                    let forgotPassBtn2 = selector().textContains('Forgot password?').visibleToUser(true).findOne(1000)
                    if (forgotPassBtn2) {
                        comm.showLogToFile("点击忘记密码")
                        comm.clickObj(forgotPassBtn2)
                        sleep(10000)
                        let emailBtn = selector().textContains('Email').visibleToUser(true).findOne(1000)
                        if (emailBtn) {
                            comm.clickObj(emailBtn)
                        }
                    }
                } else {
                    comm.showLogToFile("没有忘记密码、没有使用密码登陆 的入口")
                }
                sleep(10000)
            }

            //验证密码页
            if (selector().textContains('erify identity').visibleToUser(true).exists() || selector().textContains('verify your identity').visibleToUser(true).exists()) {
                let passwordBtn = selector().textContains('Password').visibleToUser(true).findOne(1000)
                if (passwordBtn) {
                    comm.showLogToFile("二步之后的验证，找到密码按钮")
                    comm.clickObj(passwordBtn)
                    sleep(3000)
                    let nextBtn = selector().textContains('Next').visibleToUser(true).findOne(1000)
                    if (nextBtn) {
                        comm.clickObj(nextBtn)
                        sleep(8000)
                        //
                        if (selector().textContains('Enter password').visibleToUser(true).exists()) {
                            comm.showLogToFile("进入密码输入页")
                            let inputsTest = selector().className('android.widget.EditText').find()
                            if (inputsTest.length > 0) {
                                inputsTest[0].setText(password)
                                sleep(3000)
                                let nextBtn2 = selector().textContains('Next').visibleToUser(true).findOne(1000)
                                if (nextBtn2) {
                                    comm.clickObj(nextBtn2)
                                }
                                sleep(10000)
                                //出现一些失败的报错
                                if (selector().textContains('not exist or expired').visibleToUser(true).exists()) {
                                    comm.showLogToFile("出现错误：Data-do-not-exist-or-expired")
                                    return "出现错误：Data-do-not-exist-or-expired"
                                }
                                if (selector().textContains('password expired and must be changed').visibleToUser(true).exists()) {
                                    comm.showLogToFile("出现错误：password-expired-and-must-be-changed必须修改密码")
                                    sleep(10000)
                                    //修改密码的邮箱验证
                                    if (selector().textContains("erify your email").visibleToUser(true).exists()) {
                                        comm.showLogToFile("获取和发送验证码")
                                        //获取和发送验证码
                                        let emailCode = ""
                                        sleep(20000)
                                        for (let e = 0; e < 10; e++) {
                                            comm.showLogToFile("请求验证码循环次数:" + e)
                                            // emailCode = comm.httpToString('http://120.236.196.248:9004/api/getLoginCode?email=' + email)
                                            emailCode = comm.httpToString('http://120.236.196.248:9004/api/getLoginCode?account_id=' + account_id)
                                            if (emailCode != "") {
                                                comm.showLogToFile("输入验证码")
                                                let inputs = selector().className('android.widget.EditText').find()
                                                if (inputs.length > 0) {
                                                    sysInputText(inputs[0], emailCode)
                                                    break
                                                }
                                            }
                                            sleep(8000)
                                        }
                                        if (emailCode = "") {
                                            comm.showLogToFile("验证码接口查询失败")
                                            return "验证码接口查询失败"
                                        }
                                    }
                                    sleep(10000)
                                    if (selector().textContains('Create password').visibleToUser(true).exists()) {
                                        comm.showLogToFile("进入修改密码页面")
                                        let changePasswordText = selector().className("android.widget.EditText").findOne(2000);
                                        if (!changePasswordText) {
                                            comm.showLogToFile("没找到输入框")
                                            return "没找到输入框"
                                        } else {
                                            password_new = password + '1'
                                            sysInputText(changePasswordText, password_new)
                                            comm.showLogToFile("输入新密码" + password_new)
                                            sleep(15000)
                                            let continueBtn = selector().textContains('Continue').visibleToUser(true).findOne(1000)
                                            if (continueBtn) {
                                                comm.clickObj(continueBtn)
                                                sleep(3000)
                                            }
                                            sleep(10000)
                                            //出现一些失败的报错
                                            if (selector().textContains('not exist or expired').visibleToUser(true).exists()) {
                                                comm.showLogToFile("出现错误：Data-do-not-exist-or-expired")
                                                return "出现错误：Data-do-not-exist-or-expired"
                                            }
                                            // Maximum number of attempts reachedTry again later.
                                            if (selector().textContains('Maximum number').visibleToUser(true).exists()) {
                                                comm.showLogToFile("出现错误：Maximum-number")
                                                // return "出现错误：Maximum-number"
                                            }
                                        }
                                    }
                                }
                                // Maximum number of attempts reachedTry again later.
                                if (selector().textContains('Maximum number').visibleToUser(true).exists()) {
                                    comm.showLogToFile("出现错误：Maximum-number")
                                    // return "出现错误：Maximum-number"
                                }
                            }

                        } else {
                            comm.showLogToFile("没进入密码输入页")
                            return "没进入密码输入页"
                        }
                    }
                } else {
                    comm.showLogToFile("二步之后的验证，没有找到密码按钮")
                    return "二步之后的验证，没有找到密码按钮"
                }
                sleep(10000)
            }

            //忘记密码路线
            if (selector().text('Forgot password').visibleToUser(true).exists()) {
                comm.showLogToFile("在忘记密码页面")
                let continueBtn = selector().textContains('Continue').visibleToUser(true).findOne(1000)
                if (continueBtn) {
                    comm.clickObj(continueBtn)
                }
                sleep(10000)
                if (selector().textContains("erify your email").visibleToUser(true).exists()) {
                    comm.showLogToFile("获取和发送验证码")
                    //获取和发送验证码
                    let emailCode = ""
                    sleep(20000)
                    for (let e = 0; e < 10; e++) {
                        comm.showLogToFile("请求验证码循环次数:" + e)
                        // emailCode = comm.httpToString('http://120.236.196.248:9004/api/getLoginCode?email=' + email)
                        emailCode = comm.httpToString('http://120.236.196.248:9004/api/getLoginCode?account_id=' + account_id)
                        if (emailCode != "") {
                            comm.showLogToFile("输入验证码")
                            let inputs = selector().className('android.widget.EditText').find()
                            if (inputs.length > 0) {
                                sysInputText(inputs[0], emailCode)
                                break
                            }
                        }
                        sleep(8000)
                    }
                    if (emailCode = "") {
                        comm.showLogToFile("验证码接口查询失败")
                        return "验证码接口查询失败"
                    }
                }
                sleep(10000)
                if (selector().textContains('Reset password').visibleToUser(true).exists()) {
                    comm.showLogToFile("进入修改密码页面")
                    let changePasswordText = selector().className("android.widget.EditText").findOne(2000);
                    if (!changePasswordText) {
                        comm.showLogToFile("没找到输入框")
                        return "没找到输入框"
                    } else {
                        password_new = password + '1'
                        sysInputText(changePasswordText, password_new)
                        comm.showLogToFile("输入新密码" + password_new)
                        sleep(15000)
                        let continueBtn = selector().textContains('Continue').visibleToUser(true).findOne(1000)
                        if (continueBtn) {
                            comm.clickObj(continueBtn)
                            sleep(3000)
                        }
                        sleep(10000)
                        //出现一些失败的报错
                        if (selector().textContains('not exist or expired').visibleToUser(true).exists()) {
                            comm.showLogToFile("出现错误：Data-do-not-exist-or-expired")
                            return "出现错误：Data-do-not-exist-or-expired"
                        }
                        // Maximum number of attempts reachedTry again later.
                        if (selector().textContains('Maximum number').visibleToUser(true).exists()) {
                            comm.showLogToFile("出现错误：Maximum-number")
                            // return "出现错误：Maximum-number"
                        }
                    }
                }
                sleep(10000)
            }
        }


    } else {
        comm.showLogToFile("没有Email-/-Username输入按钮")
        return 'success'
    }

    comm.showLogToFile("等待15秒，判断有没有滑块验证码")
    sleep(15000)
    // 可能会出现验证码。遇到了变速验证码。判断一下Refresh这个文字刷新是否存在，存在就走常规验证码，不存在但是存在Drag the puzzle piece into place 就走变速验证码
    let verify1 = selector().textContains('erify to continue').visibleToUser(true).exists()
    let verify2 = selector().textContains('Refresh').visibleToUser(true).exists()
    let verify3 = selector().textContains('rag the puzzle piece into place').visibleToUser(true).exists()
    if (verify1 || verify2 || verify3) {
        let verifyMsg = ""
        //说明有验证码
        if (verify2) {
            comm.showLogToFile("常规滑块验证码")
            verifyMsg = imageCodeVerify_Buy()
        } else {
            comm.showLogToFile("变化速率的滑块验证码")
            verifyMsg = sliderVerificationCode()
        }
        comm.showLogToFile("验证码部分返回：" + verifyMsg)
    }
    comm.showLogToFile("滑块验证码完成，等待15秒，再次判断有没有滑块验证码")
    sleep(15000)
    verify1 = selector().textContains('erify to continue').visibleToUser(true).exists()
    verify2 = selector().textContains('Refresh').visibleToUser(true).exists()
    verify3 = selector().textContains('rag the puzzle piece into place').visibleToUser(true).exists()
    if (verify1 || verify2 || verify3) {
        return '还有验证码存在，不成功'
    }
    //算是登陆执行完了
    sleep(10000)
    closeAllPop()
    sleep(10000)
    //
    sleep(15000)
    comm.randomSwipe(3)
    let skipInterestBtn = selector().textContains('Skip').visibleToUser(true).findOne(1000)
    if (skipInterestBtn) {
        comm.clickObj(skipInterestBtn)
        sleep(3000)
        for (let ss = 0; ss < 3; ss++) {
            swipe(random(300, 330), random(1500, 1600), random(300, 330), random(100, 130), random(100, 300))
            sleep(1500)
            closeAllPop()
        }
        return 'success'
    }
    sleep(10000)
    // 检查是否有home
    let homeBtn = selector().textContains('Home').visibleToUser(true).findOne(1000)
    if (homeBtn) {
        comm.randomSwipe(4)

        return 'success'
    }
    let not_interested = selector().textContains('ot interested').visibleToUser(true).findOne(1000)
    if (not_interested) {
        comm.clickObj(not_interested)
    }
    let follow_your_friends = selector().textContains('Follow your friends').visibleToUser(true).findOne(1000)
    if (follow_your_friends) {
        let b = follow_your_friends.bounds()
        click(500, b.top - 100)
    }
    let doNotAllowBtn = selector().textContains('t allow').visibleToUser(true).findOne(1000)
    if (doNotAllowBtn) {
        comm.clickObj(doNotAllowBtn)
        sleep(1000)
        for (let ss = 0; ss < 3; ss++) {
            swipe(random(300, 330), random(1500, 1600), random(300, 330), random(100, 130), random(100, 300))
            sleep(1000)
        }
    }
    //
    sleep(10000)
    //判断是不是在首页
    if (selector().textContains('Home').visibleToUser(true).exists() && selector().textContains('Profile').visibleToUser(true).exists()) {
        comm.showLogToFile('已经登录进去了')
        comm.randomSwipe(4)
        //
        // comm.showLog('发送备份请求')
        // //
        // httpShell('curl "http://127.0.0.1:8000/api/backup?backup_no=' + backupNo + '"')
        //
        return "success"
    } else {
        return "不在首页，失败"
    }
}

function WasLoggedOutAndLogin_Test(email_my) {
    //第一步 进行登录界面
    comm.showLog("登陆失效，执行登录")
    // 关闭Account status  Your account was logged out. Try logging inagain. 弹窗
    if (selector().textContains("account was logged out").visibleToUser(true).exists()) {
        //如果这个弹窗存在，就点一下ok
        let OK_btn = selector().textContains("OK_btn").visibleToUser(true).findOne(1000)
        if (OK_btn) {
            comm.showLog("点击弹窗的ok，等待10秒")
            sleep(10000)
            //出现该账号头像，以及Welcome back      log in  add another account 字样
            //点击log in
            //存在Log in按钮
            comm.showLog("找log in按钮")
            let log_in_btn = selector().textContains('Log in').visibleToUser(true).findOne(1000)
            if (log_in_btn) {
                comm.clickObj(log_in_btn)
                sleep(3000)
            }
            sleep(10000)
            //出现邮箱验证码流程 check your email
            let checkEmailTip = selector().textContains("check your email").visibleToUser(true).exists()
            if (checkEmailTip) {
                //获取和发送验证码
                let emailCode = 0

                for (let e = 0; e < 10; e++) {
                    comm.showLog("请求邮箱验证码循环次数:" + e)
                    emailCode = comm.httpToString('http://23.91.96.20:8022/api/getLoginCode?email=' + email_my)
                    if (emailCode != 0) {
                        comm.showLog("输入验证码")
                        let inputs = selector().className('android.widget.EditText').find()
                        sysInputText(inputs[0], emailCode)
                        break
                    }
                    sleep(5000)
                }
                if (emailCode = 0) {
                    comm.showLog("邮箱验证码接口查询失败")
                    return "邮箱验证码接口查询失败"
                }
            }
            sleep(10000)
            //判断是否在二步验证界面
            if (selector().textContains('2-step').visibleToUser(true).exists()) {
                comm.showLog("有二步验证")
                //获取和发送验证码
                let emailCode = 0
                for (let e = 0; e < 10; e++) {
                    comm.showLog("请求二步验证码循环次数:" + e)
                    emailCode = comm.httpToString('http://23.91.96.20:3000/api/code?token=' + google_token)
                    if (emailCode != 0) {
                        comm.showLog("输入二步验证码")
                        let inputs = selector().className('android.widget.EditText').find()
                        sysInputText(inputs[0], emailCode)
                        break
                    }
                    sleep(5000)
                }
                if (emailCode = 0) {
                    comm.showLog("二步验证码接口查询失败")
                    return "二步验证码接口查询失败"
                }
                // 勾选并点击
                let saveChack = selector().className('android.widget.CheckBox').visibleToUser(true).findOne(1000)
                if (saveChack) {
                    if (saveChack.checked() == false) {
                        comm.clickObj(saveChack)
                    }
                }
                //点击继续
                sleep(5000)
                let continueBtn = selector().textContains('Continue').visibleToUser(true).findOne(1000)
                if (continueBtn) {
                    comm.clickObj(continueBtn)
                    sleep(3000)
                }

            }
        } else {
            comm.showLog("没有找到OK_btn")
            return '没有找到OK_btn'
        }
    } else {
        comm.showLog("没有 Your-account-was-logged-out")
        return 'success'
    }
    sleep(10000)
    let skipInterestBtn = selector().textContains('Skip').visibleToUser(true).findOne(1000)
    if (skipInterestBtn) {
        comm.clickObj(skipInterestBtn)
        sleep(3000)
        for (let ss = 0; ss < 3; ss++) {
            swipe(random(300, 330), random(1500, 1600), random(300, 330), random(100, 130), random(100, 300))
            sleep(1500)
            closeAllPop()
        }
        return 'success'
    }
    sleep(10000)
    // 检查是否有home
    let homeBtn = selector().textContains('Home').visibleToUser(true).findOne(1000)
    if (homeBtn) {
        comm.randomSwipe(4)
        return 'success'
    }
    let not_interested = selector().textContains('ot interested').visibleToUser(true).findOne(1000)
    if (not_interested) {
        comm.clickObj(not_interested)
    }
    let follow_your_friends = selector().textContains('Follow your friends').visibleToUser(true).findOne(1000)
    if (follow_your_friends) {
        let b = follow_your_friends.bounds()
        click(500, b.top - 100)
    }
    let doNotAllowBtn = selector().textContains('t allow').visibleToUser(true).findOne(1000)
    if (doNotAllowBtn) {
        comm.clickObj(doNotAllowBtn)
        sleep(1000)
        for (let ss = 0; ss < 3; ss++) {
            swipe(random(300, 330), random(1500, 1600), random(300, 330), random(100, 130), random(100, 300))
            sleep(1000)
        }
    }
    //
    sleep(10000)
    //判断是不是在首页
    if (selector().textContains('Home').visibleToUser(true).exists() && selector().textContains('Profile').visibleToUser(true).exists()) {
        comm.showLog('已经登录进去了')
        comm.randomSwipe(4)
        //
        comm.showLog('发送备份请求')
        //
        httpShell('curl "http://127.0.0.1:8000/api/backup?backup_no=' + backupNo + '"')
        //
        return "success"
    } else {
        return "不在首页，失败"
    }
}

//一个综合的结合两种的登陆
function WasLoggedOutAndLogin_v3() {
    //第一步 进行登录界面
    comm.showLogToFile("登陆失效，执行登录")
    // 关闭Account status  Your account was logged out. Try logging inagain. 弹窗
    let logged_out_btn = selector().textContains("account was logged out").visibleToUser(true).findOne(1000)
    let welcome_back_text = selector().textContains("Welcome back").visibleToUser(true).findOne(1000)
    let username_text = selector().textContains(username).visibleToUser(true).findOne(1000)
    // if (selector().textContains("account was logged out").visibleToUser(true).exists()) {
    if (logged_out_btn || (welcome_back_text && username_text)) {
        //如果这个弹窗存在，就点一下ok
        if (logged_out_btn) {
            let OK_btn = selector().textContains("OK").visibleToUser(true).findOne(1000)
            if (OK_btn) {
                comm.showLogToFile("点击弹窗的ok，等待10秒")
                comm.clickObj(OK_btn)
                sleep(10000)
                closeAllPop()  //有可能会有一个弹窗
                sleep(10000)
            } else {
                comm.showLogToFile("没有找到OK_btn")
                return '没有找到OK_btn'
            }
        }

    } else {
        comm.showLogToFile("没有 Your-account-was-logged-out")
    }
    //
    let last_login = selector().textContains('ast login').visibleToUser(true).findOne(1000)
    let p_e_u_btn = selector().textContains('phone / email / username').visibleToUser(true).findOne(1000)
    if (last_login || p_e_u_btn) {
        if (last_login) {
            comm.clickObj(last_login)
        } else if (p_e_u_btn) {
            comm.clickObj(p_e_u_btn)
        }
        //
        sleep(5000)
        // 可能会出现那个读取本机号码的弹窗
        if (selector().textContains('Continue with').visibleToUser(true).exists() && selector().textContains('NONE OF THE ABOVE').visibleToUser(true).exists()) {
            back()
        }
        //
        comm.showLogToFile("找Email/Username")
        let usernameTextView = selector().textContains('Email / Username').visibleToUser(true).findOne(3000)
        if (usernameTextView) {
            comm.showLogToFile("找到Email/Username并点击")
            comm.clickObj(usernameTextView)
            sleep(2000)
            //
            let inputsTest = selector().className('android.widget.EditText').find()
            if (inputsTest.length < 1) {
                comm.showLogToFile("没找到输入框：" + inputsTest.length)
                return "没找到输入框"
            }
            //
            sleep(5000)
            let inputs = selector().className('android.widget.EditText').find()
            if (inputs) {
                inputs[1].setText(email)
            }
            sleep(5000)
            let saveChack = selector().className('android.widget.CheckBox').visibleToUser(true).findOne(1000)
            if (saveChack) {
                if (saveChack.checked() == false) {
                    comm.clickObj(saveChack)
                }
            }
            sleep(5000)
            let continueBtn = selector().textContains('Continue').visibleToUser(true).findOne(2000)
            if (continueBtn) {
                if (continueBtn.text() != "Continue") {
                    return "没正确执行"
                } else {
                    comm.clickObj(continueBtn)
                    sleep(3000)
                }
            }

        }
        sleep(15000)
    } else {
        comm.showLogToFile("没有Email-/-Username输入按钮")
    }
    //
    //出现该账号头像，以及Welcome back      log in  add another account 字样
    //点击log in
    //存在Log in按钮
    comm.showLogToFile("找log in按钮")
    let log_in_btn = selector().textContains('Log in').visibleToUser(true).findOne(1000)
    if (log_in_btn) {
        comm.clickObj(log_in_btn)
        sleep(3000)
    }

    for (let r = 0; r < 5; r++) {
        comm.showLogToFile("循环中：" + r)
        sleep(8000)
        //出现邮箱验证码流程 check your email
        if (selector().textContains("heck your email").visibleToUser(true).exists()) {
            //获取和发送验证码
            let emailCode = ""
            sleep(20000)
            for (let e = 0; e < 10; e++) {
                comm.showLogToFile("请求验证码循环次数:" + e)
                // emailCode = comm.httpToString('http://120.236.196.248:9004/api/getLoginCode?email=' + email)
                emailCode = comm.httpToString('http://120.236.196.248:9004/api/getLoginCode?account_id=' + account_id)
                if (emailCode != "") {
                    comm.showLogToFile("输入验证码")
                    let inputs = selector().className('android.widget.EditText').find()
                    if (inputs.length > 0) {
                        sysInputText(inputs[0], emailCode)
                        break
                    }
                }
                sleep(8000)
            }
            if (emailCode = "") {
                comm.showLogToFile("验证码接口查询失败")
                return "验证码接口查询失败"
            }
            sleep(10000)
        }

        //判断是否在二步验证界面
        if (selector().textContains('2-step').visibleToUser(true).exists()) {
            comm.showLogToFile("有二步验证")
            //获取和发送验证码
            let emailCode = ""
            sleep(20000)
            for (let e = 0; e < 10; e++) {
                comm.showLogToFile("请求二步验证码循环次数:" + e)
                emailCode = comm.httpToString('http://23.91.96.20:3000/api/code?token=' + google_token)
                if (emailCode != "") {
                    comm.showLogToFile("输入二步验证码")
                    let inputs = selector().className('android.widget.EditText').find()
                    if (inputs.length > 0) {
                        sysInputText(inputs[0], emailCode)
                        break
                    }
                }
                sleep(8000)
            }
            if (emailCode = "") {
                comm.showLogToFile("二步验证码接口查询失败")
                return "二步验证码接口查询失败"
            }
            // 勾选并点击
            sleep(3000)
            let saveChack = selector().className('android.widget.CheckBox').visibleToUser(true).findOne(1000)
            if (saveChack) {
                if (saveChack.checked() == false) {
                    comm.clickObj(saveChack)
                }
            }
            //点击继续
            sleep(5000)
            let continueBtn = selector().textContains('Continue').visibleToUser(true).findOne(1000)
            if (continueBtn) {
                comm.clickObj(continueBtn)
                sleep(3000)
            }
            sleep(10000)
        }

        //有可能弹出最大次数Maximum number of attempts，如果出现这个，看看有没有Use password insted
        if (selector().textContains('Maximum number of attempts').visibleToUser(true).exists()) {
            comm.showLogToFile("出现：Maximum-number-of-attempts")
            //判断有没有Use password instead
            let forgotPassBtn = selector().textContains('Forgot password?').visibleToUser(true).findOne(1000)
            let usePassinstBtn = selector().textContains('Use password instead').visibleToUser(true).findOne(1000)
            if (forgotPassBtn) {
                comm.showLogToFile("点击忘记密码")
                comm.clickObj(forgotPassBtn)
                sleep(10000)
                let emailBtn = selector().textContains('Email').visibleToUser(true).findOne(1000)
                if (emailBtn) {
                    comm.clickObj(emailBtn)
                }
            } else if (usePassinstBtn) {
                comm.showLogToFile("点击使用密码登录")
                comm.clickObj(usePassinstBtn)
                sleep(10000)
                let forgotPassBtn2 = selector().textContains('Forgot password?').visibleToUser(true).findOne(1000)
                if (forgotPassBtn2) {
                    comm.showLogToFile("点击忘记密码")
                    comm.clickObj(forgotPassBtn2)
                    sleep(10000)
                    let emailBtn = selector().textContains('Email').visibleToUser(true).findOne(1000)
                    if (emailBtn) {
                        comm.clickObj(emailBtn)
                    }
                }
            } else {
                comm.showLogToFile("没有忘记密码、没有使用密码登陆 的入口")
                //回退到那个页面  有个页面需要找到x按钮
                back()
                sleep(8000)
                back()
                sleep(8000)
                //找到右上角的叉叉   className = android.widget.Button
                comm.showLogToFile("找到右上角的叉叉")
                let xBtns = selector().className('android.widget.Button').visibleToUser(true).findOne()
                if (xBtns) {
                    comm.clickObj(xBtns)
                    sleep(10000)
                    comm.showLogToFile("找Use-password-instead")
                    let usePassinstBtn2 = selector().textContains('Use password instead').visibleToUser(true).findOne(1000)
                    if (usePassinstBtn2) {
                        comm.clickObj(usePassinstBtn2)
                        sleep(8000)
                    }
                    comm.showLogToFile("找Forgot-password?")
                    let forgotPassBtn3 = selector().textContains('Forgot password?').visibleToUser(true).findOne(1000)
                    if (forgotPassBtn3) {
                        comm.showLogToFile("点击忘记密码")
                        comm.clickObj(forgotPassBtn3)
                        sleep(10000)
                        let emailBtn = selector().textContains('Email').visibleToUser(true).findOne(1000)
                        if (emailBtn) {
                            comm.clickObj(emailBtn)
                        }
                    }

                }
            }
            sleep(10000)
        }

        //验证密码页
        if (selector().textContains('erify identity').visibleToUser(true).exists() || selector().textContains('verify your identity').visibleToUser(true).exists()) {
            let passwordBtn = selector().textContains('Password').visibleToUser(true).findOne(1000)
            if (passwordBtn) {
                comm.showLogToFile("二步之后的验证，找到密码按钮")
                comm.clickObj(passwordBtn)
                sleep(10000)
                let nextBtn = selector().textContains('Next').visibleToUser(true).findOne(1000)
                if (nextBtn) {
                    comm.clickObj(nextBtn)
                    sleep(10000)
                    //
                    if (selector().textContains('Enter password').visibleToUser(true).exists()) {
                        comm.showLogToFile("进入密码输入页")
                        let inputsTest = selector().className('android.widget.EditText').find()
                        if (inputsTest.length > 0) {
                            inputsTest[0].setText(password)
                            sleep(10000)
                            let nextBtn2 = selector().textContains('Next').visibleToUser(true).findOne(1000)
                            if (nextBtn2) {
                                comm.clickObj(nextBtn2)
                            }
                            sleep(10000)
                            //出现一些失败的报错
                            if (selector().textContains('not exist or expired').visibleToUser(true).exists()) {
                                comm.showLogToFile("出现错误：Data-do-not-exist-or-expired")
                                return "出现错误：Data-do-not-exist-or-expired"
                            }
                            if (selector().textContains('password expired and must be changed').visibleToUser(true).exists()) {
                                comm.showLogToFile("出现错误：password-expired-and-must-be-changed必须修改密码")
                                sleep(10000)
                                //修改密码的邮箱验证
                                if (selector().textContains("erify your email").visibleToUser(true).exists()) {
                                    comm.showLogToFile("获取和发送验证码")
                                    //获取和发送验证码
                                    let emailCode = ""
                                    sleep(20000)
                                    for (let e = 0; e < 10; e++) {
                                        comm.showLogToFile("请求验证码循环次数:" + e)
                                        // emailCode = comm.httpToString('http://120.236.196.248:9004/api/getLoginCode?email=' + email)
                                        emailCode = comm.httpToString('http://120.236.196.248:9004/api/getLoginCode?account_id=' + account_id)
                                        if (emailCode != "") {
                                            comm.showLogToFile("输入验证码")
                                            let inputs = selector().className('android.widget.EditText').find()
                                            if (inputs.length > 0) {
                                                sysInputText(inputs[0], emailCode)
                                                break
                                            }
                                        }
                                        sleep(8000)
                                    }
                                    if (emailCode = "") {
                                        comm.showLogToFile("验证码接口查询失败")
                                        return "验证码接口查询失败"
                                    }
                                }
                                sleep(10000)
                                if (selector().textContains('Create password').visibleToUser(true).exists()) {
                                    comm.showLogToFile("进入修改密码页面")
                                    let changePasswordText = selector().className("android.widget.EditText").findOne(2000);
                                    if (!changePasswordText) {
                                        comm.showLogToFile("没找到输入框")
                                        return "没找到输入框"
                                    } else {
                                        password_new = password + '1'
                                        sysInputText(changePasswordText, password_new)
                                        comm.showLogToFile("输入新密码" + password_new)
                                        sleep(15000)
                                        let continueBtn = selector().textContains('Continue').visibleToUser(true).findOne(1000)
                                        if (continueBtn) {
                                            comm.clickObj(continueBtn)
                                            sleep(3000)
                                        }
                                        sleep(10000)
                                        //出现一些失败的报错
                                        if (selector().textContains('not exist or expired').visibleToUser(true).exists()) {
                                            comm.showLogToFile("出现错误：Data-do-not-exist-or-expired")
                                            return "出现错误：Data-do-not-exist-or-expired"
                                        }
                                        // Maximum number of attempts reachedTry again later.
                                        if (selector().textContains('Maximum number').visibleToUser(true).exists()) {
                                            comm.showLogToFile("出现错误：Maximum-number")
                                            // return "出现错误：Maximum-number"
                                        }
                                        // 没网络 No internet connection
                                        if (selector().textContains('No internet connection').visibleToUser(true).exists()) {
                                            comm.showLogToFile("出现错误：No-internet-connection无网络")
                                            return "出现错误：No-internet-connection无网络"
                                        }
                                    }
                                }
                            }
                            // Maximum number of attempts reachedTry again later.
                            if (selector().textContains('Maximum number').visibleToUser(true).exists()) {
                                comm.showLogToFile("出现错误：Maximum-number")
                                // return "出现错误：Maximum-number"
                            }
                        }

                    } else {
                        comm.showLogToFile("没进入密码输入页")
                        return "没进入密码输入页"
                    }
                }
            } else {
                comm.showLogToFile("二步之后的验证，没有找到密码按钮")
                return "二步之后的验证，没有找到密码按钮"
            }
            sleep(10000)
        }

        //忘记密码路线
        if (selector().text('Forgot password').visibleToUser(true).exists()) {
            comm.showLogToFile("在忘记密码页面")
            let continueBtn = selector().textContains('Continue').visibleToUser(true).findOne(1000)
            if (continueBtn) {
                comm.clickObj(continueBtn)
            } else {
                let resetTexts = selector().text('Reset').visibleToUser(true).find()
                if (resetTexts.length == 1) {
                    comm.clickObj(resetTexts[0])
                } else if (resetTexts.length > 1) {
                    comm.clickObj(resetTexts[1])
                }
            }
            sleep(10000)
            if (selector().textContains("erify your email").visibleToUser(true).exists() || selector().textContains("Enter 6-digit code").visibleToUser(true).exists()) {
                comm.showLogToFile("获取和发送验证码")
                //获取和发送验证码
                let emailCode = ""
                sleep(20000)
                for (let e = 0; e < 10; e++) {
                    comm.showLogToFile("请求验证码循环次数:" + e)
                    // emailCode = comm.httpToString('http://120.236.196.248:9004/api/getLoginCode?email=' + email)
                    emailCode = comm.httpToString('http://120.236.196.248:9004/api/getLoginCode?account_id=' + account_id)
                    if (emailCode != "") {
                        comm.showLogToFile("输入验证码")
                        let inputs = selector().className('android.widget.EditText').find()
                        if (inputs.length > 0) {
                            sysInputText(inputs[0], emailCode)
                            break
                        }
                    }
                    sleep(8000)
                }
                if (emailCode = "") {
                    comm.showLogToFile("验证码接口查询失败")
                    return "验证码接口查询失败"
                }
            }
            sleep(10000)
            if (selector().textContains('Reset password').visibleToUser(true).exists()) {
                comm.showLogToFile("进入修改密码页面")
                let changePasswordText = selector().className("android.widget.EditText").findOne(2000);
                if (!changePasswordText) {
                    comm.showLogToFile("没找到输入框")
                    return "没找到输入框"
                } else {
                    password_new = password + '1'
                    sysInputText(changePasswordText, password_new)
                    comm.showLogToFile("输入新密码" + password_new)
                    sleep(15000)
                    let continueBtn = selector().textContains('Continue').visibleToUser(true).findOne(1000)
                    if (continueBtn) {
                        comm.clickObj(continueBtn)
                        sleep(3000)
                    }
                    sleep(10000)
                    //出现一些失败的报错
                    if (selector().textContains('not exist or expired').visibleToUser(true).exists()) {
                        comm.showLogToFile("出现错误：Data-do-not-exist-or-expired")
                        return "出现错误：Data-do-not-exist-or-expired"
                    }
                    // Maximum number of attempts reachedTry again later.
                    if (selector().textContains('Maximum number').visibleToUser(true).exists()) {
                        comm.showLogToFile("出现错误：Maximum-number")
                        // return "出现错误：Maximum-number"
                    }
                    // 没网络 No internet connection
                    if (selector().textContains('No internet connection').visibleToUser(true).exists()) {
                        comm.showLogToFile("出现错误：No-internet-connection无网络")
                        return "出现错误：No-internet-connection无网络"
                    }
                }
            }
            sleep(10000)
        }

    }
    comm.showLogToFile("执行完循环---")
    //算是登陆执行完了
    sleep(10000)
    if (!selector().textContains('Home').visibleToUser(true).exists()) {
        closeAllPop()
        sleep(10000)
    }

    let skipInterestBtn = selector().textContains('Skip').visibleToUser(true).findOne(1000)
    if (skipInterestBtn) {
        comm.clickObj(skipInterestBtn)
        sleep(3000)
        for (let ss = 0; ss < 3; ss++) {
            swipe(random(300, 330), random(1500, 1600), random(300, 330), random(100, 130), random(100, 300))
            sleep(1500)
            closeAllPop()
        }
        return 'success'
    }
    sleep(10000)
    // 检查是否有home
    let homeBtn = selector().textContains('Home').visibleToUser(true).findOne(1000)
    if (homeBtn) {
        comm.randomSwipe(4)

        return 'success'
    }
    let not_interested = selector().textContains('ot interested').visibleToUser(true).findOne(1000)
    if (not_interested) {
        comm.clickObj(not_interested)
    }
    let follow_your_friends = selector().textContains('Follow your friends').visibleToUser(true).findOne(1000)
    if (follow_your_friends) {
        let b = follow_your_friends.bounds()
        click(500, b.top - 100)
    }
    let doNotAllowBtn = selector().textContains('t allow').visibleToUser(true).findOne(1000)
    if (doNotAllowBtn) {
        comm.clickObj(doNotAllowBtn)
        sleep(1000)
        for (let ss = 0; ss < 3; ss++) {
            swipe(random(300, 330), random(1500, 1600), random(300, 330), random(100, 130), random(100, 300))
            sleep(1000)
        }
    }
    //
    sleep(10000)
    //判断是不是在首页
    if (selector().textContains('Home').visibleToUser(true).exists() && selector().textContains('Profile').visibleToUser(true).exists()) {
        comm.showLogToFile('已经登录进去了')
        comm.randomSwipe(4)
        //
        // comm.showLog('发送备份请求')
        // //
        // httpShell('curl "http://127.0.0.1:8000/api/backup?backup_no=' + backupNo + '"')
        //
        return "success"
    } else {
        return "不在首页，失败"
    }
}

//登录
function loginJastUserameAndPassword(username, password, code_url) {
    //第一步 进行登录界面
    comm.showLog("执行登录")
    //
    closeAllPop()
    //
    sleep(3000)
    //
    comm.showLog("执行一个是否允许tk访问联系的权限写入")
    httpShell("pm grant com.zhiliaoapp.musically android.permission.READ_CONTACTS")
    httpShell("pm grant com.zhiliaoapp.musically android.permission.POST_NOTIFICATIONS")
    sleep(3000)
    //
    //存在Log in按钮
    comm.showLog("找log in按钮")
    let log_in_btn = selector().textContains('Log in').visibleToUser(true).findOne(1000)
    if (log_in_btn) {
        comm.clickObj(log_in_btn)
        sleep(3000)
    }
    comm.showLog("登录的for--1")
    comm.httpToString(httpServer + '/api/ping?task_id=' + task_id)
    comm.showLog("判断birth是否存在")
    let birthday_msg = selector().textContains('birth').visibleToUser(true).exists()
    if (birthday_msg) {
        comm.showLog("找到birthday")
        sleep(2000)
        let log_in_btn = selector().textContains("have an account").visibleToUser(true).findOne(1000)
        //let log_in_btn=selector().textContains('Log in').findOne(3000) 
        if (log_in_btn) {
            comm.showLog("点击log_in_btn")
            comm.clickObj(log_in_btn)
        }
        sleep(3000)
    }
    comm.showLog("登录的for--2")
    comm.showLog("找Use phone")
    let use_phone = selector().textContains('Use phone').visibleToUser(true).findOne(1000)
    if (use_phone) {
        comm.showLog("找到Use phone并点击")
        comm.clickObj(use_phone)
        sleep(2000)
    }
    comm.showLog("找Email/Username")
    let usernameTextView = selector().textContains('Email / Username').visibleToUser(true).findOne(3000)
    if (usernameTextView) {
        comm.showLog("找到Email/Username并点击")
        comm.clickObj(usernameTextView)
        sleep(2000)
        //
        let inputsTest = selector().className('android.widget.EditText').find()
        if (inputsTest.length < 1) {
            comm.showLog("tk没启动:" + inputsTest.length)
            return "tk没启动"
        }
    }
    comm.showLog("登录的for--3")
    //判断是不是在首页
    if (selector().textContains('Home').visibleToUser(true).exists() && selector().textContains('Profile').visibleToUser(true).exists()) {
        comm.showLog('已经登录进去了')
        return "success"
    }
    //
    // comm.showLog("登录的for--4")
    // if(currentPackage().indexOf('com.zhiliaoapp.musically')==-1){
    //     comm.showLog("launch tk")
    //     if(!app.launch('com.zhiliaoapp.musically')) {
    //         console.log('App 启动失败')
    //         return "tk启动失败"
    //      }
    //      sleep(6000)
    // }


    //第二步 用户名密码登录
    comm.showLog("第二步 用户名密码登录")

    let inputs = selector().className('android.widget.EditText').find()
    if (inputs) {
        inputs[1].setText(username)
    }
    sleep(2000)
    let saveChack = selector().className('android.widget.CheckBox').visibleToUser(true).findOne(1000)
    if (saveChack) {
        if (saveChack.checked() == false) {
            comm.clickObj(saveChack)
        }
    }
    sleep(2000)
    let continueBtn = selector().textContains('Continue').visibleToUser(true).findOne(2000)
    if (continueBtn) {
        if (continueBtn.text() != "Continue") {
            return "没正确执行"
        } else {
            comm.clickObj(continueBtn)
            sleep(3000)
        }
    }
    comm.showLog("输入密码")
    comm.clickObj(inputs[2])
    sysInputText(inputs[2], password)

    //输入之后
    sleep(3000)

    //点击continue
    comm.showLog("点击continue")
    let continueBtn2 = selector().textContains('Continue').visibleToUser(true).findOne(2000)
    if (continueBtn2) {
        if (continueBtn2.text() != "Continue") {
            return "没正确执行"
        } else {
            comm.clickObj(continueBtn2)
            sleep(3000)
        }
    }

    sleep(2000)
    // Maximum number of attempts reached
    comm.showLog("找Maximum number")
    let maximum = selector().textContains('Maximum number').visibleToUser(true).exists()
    if (maximum) {
        return "操作频繁"
    } else {
        comm.showLog("没找到Maximum number")
    }
    //
    comm.showLog("找Account doesn't exist")
    let accNoExist = selector().textContains("Account doesn't exist").visibleToUser(true).exists()
    if (accNoExist) {
        return "账号不存在"
    } else {
        comm.showLog("没找到Account doesn't exist")
    }

    sleep(3000)
    //判断是否存在找相同验证码
    comm.showLog("判断是否存在找相同验证码")
    for (let i = 0; i < 10; i++) {
        comm.showLog('判断有没有找相同验证码')
        let select2Text = selector().textContains("Select 2 objects").visibleToUser(true).findOne(1000)
        if (select2Text) {
            comm.showLog('需要找相同验证码')
            result = select2ImageVcode()
            comm.showLog("相同验证码func返回:" + result)
            if (result != 'success') {
                return "图片验证失败"
            } else {
                //点击confirm
                let confirmBtn = selector().textContains('Confirm').visibleToUser(true).findOne(2000)
                if (confirmBtn) {
                    comm.showLog('输完验证码点击Confirm')
                    comm.clickObj(confirmBtn)
                    sleep(3000)
                    break
                }
            }
        } else {
            //存在需要滑块验证码 （可能要补）
            comm.showLog("判断有没有滑块验证码")
            let imageVerifyTips = selector().textContains('Verify to continue:').visibleToUser(true).findOne(1000) || selector().textContains('puzzle piece into place').visibleToUser(true).findOne(1000)
            if (imageVerifyTips) {
                comm.showLog("遇到滑块验证码1")
                //处理滑块验证码
                for (let i = 0; i < 5; i++) {
                    if (i == 4) {
                        comm.showLog("还有滑块验证码")
                        back()
                        sleep(2000)
                        let continueBtn2 = selector().textContains('Continue').visibleToUser(true).findOne(2000)
                        if (continueBtn2) {
                            comm.clickObj(continueBtn2)
                            sleep(3000)
                            continue
                        }
                    }
                    if (sliderVerificationCode() == "success") {
                        sleep(5000)
                        //检查是否还有验证码
                        imageVerifyTips = selector().textContains('Verify to continue:').visibleToUser(true).findOne(1000) || selector().textContains('puzzle piece into place').visibleToUser(true).findOne(1000)
                        if (!imageVerifyTips) {
                            break
                        }
                    }
                }
                //
                // let secsdkCaptDrag_My = selector().idContains('captcha_slide_button').visibleToUser(true).findOne(20000)
                // if(secsdkCaptDrag_My){
                //     let allNum_My = device.width-imageVerifyTips.bounds().left-imageVerifyTips.bounds().left
                //     comm.showLog("拼图移动总长度："+allNum_My)
                //     let pos = []
                //     let secsdkCapBounds = secsdkCaptDrag_My.bounds()
                //     pos.push([secsdkCapBounds.centerX(), secsdkCapBounds.centerY()+random(-2,2)])
                //     pos.push([secsdkCapBounds.centerX()+random(20,30), secsdkCapBounds.centerY()+random(-2,2)])
                //     pos.push([secsdkCapBounds.centerX()+random(100,150), secsdkCapBounds.centerY()+random(-2,2)])
                //     pos.push([660.9,secsdkCapBounds.centerY()+10])
                //     gesture(random(15000,20000), pos)
                //     sleep(10000)
                //     if(selector().textContains('Verify to continue:').visibleToUser(true).exists()){
                //         comm.showLog("还有滑块验证码")
                //         back()
                //         sleep(2000)
                //         let continueBtn2=selector().textContains('Continue').visibleToUser(true).findOne(2000)
                //         if(continueBtn2)
                //         {
                //             comm.clickObj(continueBtn2)
                //             break
                //         }
                //         return "遇到滑块验证码"
                //     }

                // }else{
                //     comm.showLog("没找滑块按钮控件")
                //     return "没找滑块按钮控件"
                // }
                //
                // imageCodeVerify_my()// 
            } else {
                // Drag the slider to fit the puzzle 旋转验证码
                let sliderVerifyTips = selector().textContains('Drag the slider to fit the puzzle').visibleToUser(true).findOne(1000)
                if (sliderVerifyTips) {
                    comm.showLog("有旋转验证码")
                    return "有旋转验证码"
                }
            }
        }
        comm.showLog("执行完验证码判断，继续")

        // 判断有没有在第二步验证界面
        let auth2Step = selector().textContains('2-step').visibleToUser(true).exists()
        if (auth2Step) {
            break
        }
        // 
        sleep(5000)
    }
    comm.showLog("验证码部分全部结束，判断是否在二步验证界面")
    //判断是否在二步验证界面
    let auth2Step = selector().textContains('2-step').visibleToUser(true).exists()
    if (auth2Step) {

        for (let j = 0; j < 3; j++) {
            // let jsonData = {
            //     tokenUrl: code_url
            // }
            let vcodeStr = comm.httpToString(ttrpServer + "/api/code?token=" + code_url)
            if (vcodeStr != '') {
                let vcode = ''
                //{"code":0,"message":"get code success","data":{"task_id":"5","vcode":"123456"}}
                if (vcodeStr.length > 10) {
                    let jsonVcode = JSON.parse(vcodeStr)
                    vcode = jsonVcode.data.vcode
                } else {
                    vcode = vcodeStr
                }
                let editText = selector().className("android.widget.EditText").visibleToUser(true).findOne(1000)
                sysInputText(editText, vcode)
                sleep(3000)
                let continueBtn2 = selector().textContains('Continue').visibleToUser(true).findOne(3000)
                if (!continueBtn2) {
                    continueBtn2 = selector().textContains('Next').visibleToUser(true).findOne(3000)
                }
                if (continueBtn2) {
                    let trustBtn = selector().textContains('Trust this').visibleToUser(true).findOne(3000)
                    if (trustBtn) {
                        comm.clickObj(trustBtn)
                        sleep(2000)
                    }
                    comm.clickObj(continueBtn2)
                    sleep(5000)
                }
                break
            }
        }
    }

    //登录后界面处理
    let tooManyTips = selector().textContains('Too many attempts').visibleToUser(true).exists()
    if (tooManyTips) {
        console.log('too many attempts')
        return 'Too many attempts'
    }
    let maximumMsg = selector().textContains('Maximum number').visibleToUser(true).findOne(1000)
    if (maximumMsg) {
        console.log('操作频繁')
        // return maximumMsg.text()
        return "操作频繁"
    }
    accNoExist = selector().textContains("Account doesn't exist").visibleToUser(true).exists()
    if (accNoExist) {
        return "账号不存在"
    }
    //判断是否网络问题
    let networkErrorInPsdExist = selector().textContains('No network connection').visibleToUser(true).exists()
    if (!networkErrorInPsdExist) {
        networkErrorInPsdExist = selector().textContains('No internet').visibleToUser(true).exists()
    }
    if (networkErrorInPsdExist) {
        console.log('输入完邮箱出现无网络提示')
        // return 'No network connection'
        return '输入完邮箱出现无网络提示'
    }
    let i_agree = selector().textContains('I agree').visibleToUser(true).findOne(1000)
    if (i_agree) {
        comm.clickObj(i_agree)
    }
    let suspended = selector().textContains('suspended').visibleToUser(true).findOne(1000)
    if (suspended) {
        comm.showLog('账号被封禁')
        // return suspended.text()
        return "账号被封禁"
    }
    closeAllPop()
    let skipInterestBtn = selector().textContains('Skip').visibleToUser(true).findOne(1000)
    if (skipInterestBtn) {
        comm.clickObj(skipInterestBtn)
        sleep(3000)
        for (let ss = 0; ss < 3; ss++) {
            swipe(random(300, 330), random(1500, 1600), random(300, 330), random(100, 130), random(100, 300))
            sleep(1500)
            closeAllPop()
        }
        return 'success'
    }
    // 检查是否有home
    let homeBtn = selector().textContains('Home').visibleToUser(true).findOne(1000)
    if (homeBtn) {
        comm.randomSwipe(4)
        return 'success'
    }
    let not_interested = selector().textContains('ot interested').visibleToUser(true).findOne(1000)
    if (not_interested) {
        comm.clickObj(not_interested)
    }
    let follow_your_friends = selector().textContains('Follow your friends').visibleToUser(true).findOne(1000)
    if (follow_your_friends) {
        let b = follow_your_friends.bounds()
        click(500, b.top - 100)
    }
    let doNotAllowBtn = selector().textContains('t allow').visibleToUser(true).findOne(1000)
    if (doNotAllowBtn) {
        comm.clickObj(doNotAllowBtn)
        sleep(1000)
        for (let ss = 0; ss < 3; ss++) {
            swipe(random(300, 330), random(1500, 1600), random(300, 330), random(100, 130), random(100, 300))
            sleep(1000)
        }
    }
    //
    //判断是不是在首页
    if (selector().textContains('Home').visibleToUser(true).exists() && selector().textContains('Profile').visibleToUser(true).exists()) {
        comm.showLog('已经登录进去了')
        comm.randomSwipe(4)
        //
        comm.showLog('发送备份请求')
        //
        httpShell('curl "http://127.0.0.1:8000/api/backup?backup_no=' + backupNo + '"')
        //
        return "success"
    } else {
        return "失败"
    }
}

//修改过的验证码部分，新的，适应滑块和手指移动不同步的版本--lau
function sliderVerificationCode() {
    //
    //先找一下刷新按钮
    comm.showLog("找刷新按钮")
    let refreshBtn = selector().textContains('Refresh').visibleToUser(true).findOne(3000)
    if (!refreshBtn) {

        refreshBtn = selector().textContains('Reload').visibleToUser(true).findOne(3000)
        if (!refreshBtn) {
            refreshBtn = selector().idContains('refresh_button').visibleToUser(true).findOne(3000)
        }
        if (!refreshBtn) {
            comm.showLog("刷新验证码图片按钮控件未找到")
            return '刷新验证码图片按钮控件未找到'
        }
    }
    comm.showLog("找是不是相同的验证码")
    //如果是找两个相同的，就跳到找两个相同的那里
    let select2Text = selector().textContains("Select 2 objects").visibleToUser(true).findOne(1000)
    if (select2Text) {
        return select2ImageVcode();
    }
    //
    while (true) {
        comm.showLog("验证码是否出来")
        //找一下验证码是否出来
        // let imageVerifyTips = selector().textContains('Verify to continue:').visibleToUser(true).findOne(50000)
        let imageVerifyTips = selector().textContains('Verify to continue:').visibleToUser(true).findOne(50000) || selector().textContains('puzzle piece into place').visibleToUser(true).findOne(50000)
        if (!imageVerifyTips) {

            console.log('图片验证码未找到')

            //这里可能是网络原因,图片未加载出来
            let networkErr = selector().textContains('Please try again').visibleToUser(true).exists()
            if (networkErr && refreshBtn) {

                console.log('出现网络问题,点击刷新重试')
                comm.clickObj(refreshBtn)

            } else {
                return '图片验证码未找到'
            }

        } else {
            // console.log('图片验证码找到')
            //sleep(random(1500, 3000))
            break
        }
        //sleep(5000)
    }
    //
    comm.showLog("开始处理滑块验证码")
    let markTag = true
    let mark_count = 0
    while (markTag) {
        if (mark_count > 5) {
            return "滑块处理未成功"
        }
        let imageLoading = selector().textContains('Loading').exists()
        if (!imageLoading) {
            console.log('验证码图片已加载出来')
            sleep(5000)
            //判断一下是否由于网络原因未加载出来图片
            let networkErrorInImageLoadingExist = selector().textContains('Network issue. Please try again.').visibleToUser(true).exists()
            let noInternetConnectExist = selector().textContains('No internet connection. Please try again').visibleToUser(true).exists()
            if (networkErrorInImageLoadingExist || noInternetConnectExist) {

                console.log('出现无出现无网络提示')
                //再次设置一下代理 
                //点击refresh
                comm.clickObj(refreshBtn)
                sleep(1500)


            } else {
                let captchaImage = selector().idContains('captcha-verify-image').visibleToUser(true).findOne(1000)
                //
                let Audio = selector().textContains('Audio').visibleToUser(true).findOne(5000)
                //
                let VerifyContinue = selector().textContains('puzzle piece into place').visibleToUser(true).findOne(5000)
                if (VerifyContinue) {
                    comm.showLog("找到滑块验证码模块")
                    captchaImage = selector().idContains('captcha-verify-image').visibleToUser(true).findOne(20000)
                    if (!captchaImage) {
                        console.log("未找到元素:captchaImage")
                        break
                    }
                    let btnTest = VerifyContinue.bounds()
                    console.log('comm.clickObj:' + btnTest.centerX() + ',' + btnTest.centerY())
                    console.log('comm.clickObj:' + btnTest.left)
                    console.log('comm.clickObj:' + btnTest.right)
                    console.log('comm.clickObj:' + btnTest.top)
                    console.log('comm.clickObj:' + btnTest.bottom)
                } else {
                    comm.showLog("VerifyContinue不存在,找puzzle piece into place")
                    VerifyContinue = selector().textContains('puzzle piece into place').visibleToUser(true).findOne(5000)
                    if (VerifyContinue) {
                        comm.showLog("puzzle piece into place存在!!!")
                        captchaImage = selector().idContains('captcha-verify-image').visibleToUser(true).findOne(20000)
                        if (!captchaImage) {

                            console.log("未找到元素:captchaImage")
                            break
                        }
                    } else {
                        comm.showLog("puzzle piece into place不存在")
                        break
                    }
                }
                //
                let imgErr = selector().textContains('Please try again').visibleToUser(true).exists()
                if (imgErr) {

                    console.log('出现网络问题,点击刷新重试')
                    comm.clickObj(refreshBtn)
                    sleep(20000)
                    for (let l = 0; l < 6; l++) {
                        imageLoading = selector().textContains('Loading').exists()
                        if (!imageLoading) {
                            break
                        } else {
                            sleep(6000)
                        }
                    }
                    continue
                }

                sleep(2000)
                let capImg = sysScreenCapture();
                comm.showLog("开始切割图片");
                let x = VerifyContinue.bounds().left //对 108
                let y = VerifyContinue.bounds().bottom + 26  //846
                let w = device.width - VerifyContinue.bounds().left - VerifyContinue.bounds().left //864
                // let h=Drag_the.bounds().top-VerifyContinue.bounds().bottom-100 // 
                let h = Audio.bounds().top - VerifyContinue.bounds().bottom - 150
                console.log("x:" + x)
                console.log("y:" + y)
                console.log("w:" + w)
                console.log("h:" + h)
                //
                for (let c = 0; c < 10; c++) {
                    capImg = images.read("/sdcard/tk.png")
                    if (!capImg) {
                        comm.showLog("fuck_" + c)
                        sleep(3000)
                    } else {
                        break
                    }
                }
                //
                capImg = images.clip(capImg, x, y, w, h);
                let base64 = images.toBase64(capImg, 'jpg', 80);
                if (base64.length > 3000) {
                    try {
                        comm.showLog("滑块图片大小：" + base64.length);
                        //
                        let token = "Hhe8XEYDbYPEiYbeS1eKW0iUdX5jAaR+z6a3Fm3Ii34";
                        let verify_type = "20110";
                        //http://70.39.126.2:8089
                        //let dRes=http.postJson(httpServer+"/api/YdmVerify",{base64:base64,token:token,verify_type:verify_type}) 
                        let dRes = http.postJson("http://70.39.126.2:8089/api/YdmVerify", { base64: base64, token: token, verify_type: verify_type })
                        let rString = dRes.body.string()
                        console.log(rString)
                        let yJson = JSON.parse(rString);
                        if (yJson.code == 10000) {
                            comm.showLog("验证码解析成功,开始模拟滑动")
                            //
                            let secsdkCaptDrag = selector().idContains('captcha_slide_button').visibleToUser(true).findOne(20000)
                            if (secsdkCaptDrag) {
                                comm.showLog("找到滑块按钮控件")
                                let btnTest = secsdkCaptDrag_My.bounds()
                                console.log('comm.clickObj:' + btnTest.centerX() + ',' + btnTest.centerY())
                                console.log('comm.clickObj:' + btnTest.left)
                                console.log('comm.clickObj:' + btnTest.right)
                                console.log('comm.clickObj:' + btnTest.top)
                                console.log('comm.clickObj:' + btnTest.bottom)
                            } else {
                                comm.showLog("没找滑块按钮控件")
                                return "没找滑块按钮控件"
                            }
                            sleep(2000)
                            comm.showLog("屏幕总宽度:" + device.width)
                            comm.showLog("屏幕总长度:" + device.height)

                            //
                            let sp = yJson.data.data
                            comm.showLog("接口返回数据:" + sp)
                            //
                            //拼图的实际移动长度为  VerifyContinue.bounds().left   ---  device.width-VerifyContinue.bounds().left-VerifyContinue.bounds().left
                            //因为移动速率是不同步的，找出当拼图完全走完，我手指实际移动的距离
                            let allNum_My = device.width - VerifyContinue.bounds().left - VerifyContinue.bounds().left
                            comm.showLog("拼图总长度：" + allNum_My)
                            let pos = []
                            let secsdkCapBounds = secsdkCaptDrag.bounds()
                            pos.push([secsdkCapBounds.centerX(), secsdkCapBounds.centerY() - 2])
                            // pos.push([877,secsdkCapBounds.centerY()+10])
                            // pos.push([877,secsdkCapBounds.centerY()+10])
                            let move_count = (sp - 18.45652) / 1.23913
                            console.log("计算的移动数据:" + move_count)
                            console.log("计算的移动数据:" + secsdkCapBounds.centerX() + move_count)
                            // VerifyContinue.bounds().centerX()+move_count
                            pos.push([secsdkCapBounds.centerX() + sp - random(10, 15), secsdkCapBounds.centerY() + random(-10, 10)])
                            pos.push([secsdkCapBounds.centerX() + move_count + random(10, 15), secsdkCapBounds.centerY() + random(-10, 10)])
                            //
                            pos.push([secsdkCapBounds.centerX() + move_count, secsdkCapBounds.centerY() + random(-5, 5)])
                            //
                            //
                            // comm.showLog("准备滑动");
                            // let randomTime = random(20000, 25000);
                            sleep(2000)
                            gesture(random(12000, 15000), pos)
                            sleep(5000)
                            markTag = true
                            return "success"
                        }
                    } catch (e) {
                        console.log('发生错误')
                        console.log(e)
                        mark_count++
                    }
                } else {
                    mark_count++
                }

            }
        } else {
            sleep(2000)
            mark_count++
        }
    }

    return "失败"
}



//注册--google账号
function register_google(email, password, nickname) {

    // "http://23.91.96.20:9101/api/client/limitSpeed?bd_client_no="
    comm.httpToString("http://23.91.96.20:9101/api/client/limitSpeed?bd_client_no=" + bd_client_no)

    //第一步，先进入注册页面
    for (let i = 0; i < 4; i++) {
        if (i == 3) {
            return "第一步 找到注册页面 进行不下去"
        }
        //
        comm.showLog("注册执行次数：" + i)
        if (currentPackage().indexOf('com.zhiliaoapp.musically') == -1) {
            comm.showLog("launch tk")
            if (googleOpenTk() == false) {
                return "tk启动失败"
            }
            // if (!app.launch('com.zhiliaoapp.musically')) {
            //     console.log('App 启动失败')
            //     return "tk启动失败"
            // }
            sleep(6000)
        }
        closeAllPop()
        sleep(3000)

        let agreeAndContinue = idContains("dnm").className("android.widget.Button").clickable().visibleToUser(true).findOne(1000)
        if (agreeAndContinue) {
            console.log("同意并继续");
            comm.clickObj(agreeAndContinue)
            //
        }
        let ignore = idContains("c43").className("android.widget.Button").clickable().visibleToUser(true).findOne(5000)
        if (ignore) {
            console.log("忽略");
            comm.clickObj(ignore)
            //
        }

        // 判断是否在登录页面中如果是登录页面，就选择Continue with Google
        // 也可能一打开就是在生日选择页面
        //查看是否在生日页面
        comm.showLog("判断是否在生日页面")
        sleep(2000)
        let yourBirthdateWonModel = selector().textContains('Your birthdate won').visibleToUser(true).findOne(1000)
        if (!yourBirthdateWonModel) {
            yourBirthdateWonModel = selector().textContains('Your birthday won').visibleToUser(true).findOne(1000)
        }
        if (yourBirthdateWonModel) {
            comm.showLog("在生日页面中")
            //
        } else {
            comm.showLog("不在生日页面中")
        }

        //判断是否直接进入的主页,如果是主页就点击profile进入登录注册页面
        let isMainPage = idContains("lax").className("android.widget.FrameLayout").clickable().visibleToUser(true).findOne(3000)//home
        if (isMainPage) {
            comm.showLog("在主页")
            for (let i = 0; i < 5; i++) {
                let hintGesture = idContains("vw_").className("android.widget.TextView").visibleToUser(true).findOne(1000)
                if (hintGesture) {
                    console.log("发现滑动提示，滑动关闭");
                    comm.randomSwipe(1)
                    sleep(3000)
                }

                let ishome = idContains("lax").selected().className("android.widget.FrameLayout").clickable().visibleToUser(true).findOne(1000)
                if (ishome) {
                    console.log("选中home状态");
                    let myProfile = idContains("laz").className("android.widget.FrameLayout").clickable().visibleToUser(true).findOne(1000)
                    if (myProfile) {
                        console.log("发现profile，进入");
                        comm.clickObj(myProfile)
                    }
                }


                let sp = idContains("cr9").className("android.widget.TextView").clickable(false).visibleToUser(true).findOne(1000);
                if (sp) {
                    console.log("到达登录页");
                    break
                }

                sleep(3000)
            }
        } else {
            comm.showLog("不在主页")
        }

        //进入Google注册页面
        for (let i = 0; i < 3; i++) {
            let sp = idContains("cr9").className("android.widget.TextView").clickable(false).visibleToUser(true).findOne(1000);
            if (sp) {
                if (sp && sp.text().indexOf("/") != -1) {
                    //点击进入Google注册
                    sp = idContains("cr9").textContains("Google").className("android.widget.TextView").clickable(false).visibleToUser(true).findOne(1000)
                    if (sp) {
                        comm.showLog("进入Google注册")
                        comm.clickObj(sp)
                    }
                } else {
                    //
                    sp = idContains("v9w").clickable().className("android.widget.Button").visibleToUser(true).findOne(1000);
                    if (sp) {
                        comm.showLog("Login按钮")
                        comm.clickObj(sp)
                    }
                }
            }
            sleep(5000)
        }

        //
        // comm.showLog("判断是否在 Log in to TikTok页")
        // if (selector().textContains('Log in to TikTok').visibleToUser(true).exists()) {
        //     let signUp = selector().textContains('Sign up').visibleToUser(true).findOne(1000)
        //     if (signUp) {
        //         comm.showLog("点一下Sign-Upe")
        //         comm.clickObj(signUp)
        //     }
        // }
        // sleep(5000)
        comm.showLog("判断是否跳转Google Sign In页")
        for (let i = 0; i < 10; i++) {
            if (idContains("learnMore").visibleToUser(true).className("android.widget.Button").exists()) {
                comm.showLog("跳转成功")
                break
            } else {
                if (packageName("com.google.android.gms").visibleToUser(true).exists()) {
                    comm.showLog("等待Google Sign In页")
                }
            }
            sleep(5000)
        }

        if (packageName("com.google.android.gms").visibleToUser(true).exists()) {
            sleep(5000)
            break
        }
    }
    sleep(10000)
    for (let i = 0; i < 20; i++) {
        if (i == 9) {
            return "没进入账号输入页"
        }
        // 判断是不是对应页面 Learn more about using your account
        if (idContains("learnMore").visibleToUser(true).className("android.widget.Button").exists()) {
            comm.showLog("在邮箱输入页")
            break
        } else {
            comm.showLog("没在邮箱输入页")
        }
        sleep(5000)
    }
    // 输入email和点击next
    let inputEmail = selector().className('android.widget.EditText').visibleToUser(true).findOne(1000)
    if (inputEmail) {
        comm.clickObj(inputEmail)
        httpShell('am force-stop com.google.android.inputmethod.latin')
        sleep(5000)
        inputEmail.setText(email)
        sleep(5000)
        let nextBtn = boundsInside(device.width / 2, device.height / 2, device.width, device.height).className("android.widget.Button").clickable().visibleToUser(true).findOne(1000)
        if (nextBtn) {
            comm.clickObj(nextBtn)
        } else {
            return "没有next-1"
        }
    }
    //
    sleep(5000)
    for (let i = 0; i < 10; i++) {
        if (i == 9) {
            return "没进入密码输入页"
        }
        // 判断是不是对应页面Show password
        if (idContains("selectionc1").visibleToUser(true).exists()) {
            comm.showLog("在密码输入页")
            break
        } else {
            comm.showLog("没在密码输入页")
        }
        sleep(5000)
    }
    // 输入email和点击next className = android.widget.EditText   android.widget.TextView
    let inputPassWord = selector().className('android.widget.EditText').visibleToUser(true).findOne(1000)
    if (inputPassWord) {
        comm.clickObj(inputPassWord)
        httpShell('am force-stop com.google.android.inputmethod.latin')
        sleep(5000)
        inputPassWord.setText(password)
        sleep(5000)
        let nextBtn = boundsInside(device.width / 2, device.height / 2, device.width, device.height).className("android.widget.Button").clickable().visibleToUser(true).findOne(1000)
        if (nextBtn) {
            comm.clickObj(nextBtn)
        } else {
            return "没有next-2"
        }
    }
    //
    sleep(8000)
    let markTag = false
    //
    for (let i = 0; i < 10; i++) {
        //
        if (i > 9) {
            comm.showLog("尝试 10 次后仍未完成，判定失败");
            return "尝试 10 次后仍未完成，判定失败";
        }
        //
        if (packageName("com.zhiliaoapp.musically").exists()) {
            break;
        }
        if (idContains("yDmH0d").findOne(1000)) {
            let nextBtn = packageName("com.google.android.gms").boundsInside(device.width / 2, device.height / 2, device.width, device.height).className("android.widget.Button").clickable().visibleToUser(true).findOne(1000)
            if (nextBtn) {
                console.log("找到nextBtn");
                nextBtn.click();
            } else {
                console.log("没找到nextBtn");
                comm.randomSwipe(2)
            }
        } else {
            if (idContains("agree_backup").findOne(1000)) {
                console.log("找到agree_backup");
                let nextBtn = packageName("com.google.android.gms").boundsInside(device.width / 2, device.height / 2, device.width, device.height).className("android.widget.Button").clickable().visibleToUser(true).findOne(1000)
                if (nextBtn) {
                    console.log("找到nextBtn");
                    nextBtn.click();
                } else {
                    console.log("没找到nextBtn");
                    comm.randomSwipe(2)
                }
            } else {
                console.log("没找到agree_backup");
            }
        }
        sleep(8000);
    }

    //
    sleep(10000)
    for (let i = 0; i < 10; i++) {
        //
        let yourBirthdateWonModel = selector().visibleToUser(true).className('android.widget.SeekBar').find() //idContains("ice").visibleToUser(true).findOne(1000)
        if (yourBirthdateWonModel) {
            comm.showLog("在生日页面中")
            break
        }
        //
        let agreeBtn = selector().textContains('Agree and continue').visibleToUser(true).findOne(1000)
        if (agreeBtn) {
            comm.clickObj(agreeBtn);
        }
        //
        let accountBtn = selector().textContains('Your account was').visibleToUser(true).findOne(1000)
        if (accountBtn) {
            comm.showLog("出现Your account was弹窗")
            return "可能账号被封"
        }
        let wrongBtn = selector().textContains('wrong').visibleToUser(true).findOne(1000)
        if (wrongBtn) {
            comm.showLog("出现Something went wr-ong弹窗")
            return "出现Something went wrong弹窗"
        }
        //Try again later.
        let tryBtn = selector().textContains('Try again later').visibleToUser(true).findOne(1000)
        if (tryBtn) {
            comm.showLog("出现Try-again-later弹窗")
            return "出现Try again later弹窗"
        }
        sleep(8000)
    }
    sleep(5000)
    // 选择生日
    let reSelectB = selectTkBirthday()
    if (reSelectB) {
        //点击next
        let nextBtn = selector().textContains('Next').visibleToUser(true).findOne(1000)
        if (nextBtn) {
            comm.clickObj(nextBtn)
        }
    } else {
        return "选择生日函数返回false"
    }
    // 昵称页面
    sleep(10000)
    for (let i = 0; i < 5; i++) {
        let skipBtn = boundsInside(0, 0, device.width * 0.3, device.height * 0.15).className("android.widget.Button").clickable().visibleToUser(true).findOne(1000)//Skip 
        if (skipBtn) {
            comm.clickObj(skipBtn)
        }

        let agree_and_continue = idContains("w4e").visibleToUser(true).findOne(1000)
        if (agree_and_continue) {
            comm.clickObj(agree_and_continue.child(1))
        } else {

        }
        sleep(5000)
    }
    // 等待十五秒
    sleep(15000)
    comm.randomSwipe(5)
    //判断是否在首页
    //判断是否直接进入的主页,如果是主页就点击profile进入登录注册页面
    let isMainPage = idContains("lax").className("android.widget.FrameLayout").clickable().visibleToUser(true).findOne(3000)//home
    let myProfile = idContains("laz").className("android.widget.FrameLayout").clickable().visibleToUser(true).findOne(1000)
    if (isMainPage && myProfile) {
        comm.showLog("有首页")
    } else {
        comm.showLog("没有首页")
    }
    //480
    comm.showLog("流程执行完了")
    sleep(5000)
    return "success"

    // for (let i = 0; i < 10; i++) {
    //     if (i == 9) {
    //         return "没成功点完那些同意页面"
    //     }

    //     let someNextBtn = selector().textContains('I UNDERSTAND').visibleToUser(true).findOne(1000)
    //     if (!someNextBtn) {
    //         someNextBtn = selector().textContains('I agree').visibleToUser(true).findOne(1000)
    //         if (!someNextBtn) {
    //             someNextBtn = selector().textContains('ACCEPT').visibleToUser(true).findOne(1000)
    //         }
    //     }

    //     if (someNextBtn) {
    //         comm.clickObj(someNextBtn)
    //     }

    //     sleep(8000)
    // }
    // //...后续不确定
    // comm.showLog("流程执行完了")
    // sleep(5000)
    // return "success"
}


function register_google_bak(email, password, nickname) {

    // "http://23.91.96.20:9101/api/client/limitSpeed?bd_client_no="
    comm.httpToString("http://23.91.96.20:9101/api/client/limitSpeed?bd_client_no=" + bd_client_no)
    //第一步，先进入注册页面
    for (let i = 0; i < 3; i++) {
        if (i == 2) {
            return "第一步 找到注册页面 进行不下去"
        }
        //
        comm.showLog("注册执行次数：" + i)
        if (currentPackage().indexOf('com.zhiliaoapp.musically') == -1) {
            comm.showLog("launch tk")
            if (!app.launch('com.zhiliaoapp.musically')) {
                console.log('App 启动失败')
                return "tk启动失败"
            }
            sleep(6000)
        }
        closeAllPop()
        sleep(3000)
        // 判断是否在登录页面中如果是登录页面，就选择Continue with Google
        // 也可能一打开就是在生日选择页面
        //查看是否在生日页面
        comm.showLog("判断是否在生日页面")
        sleep(2000)
        let yourBirthdateWonModel = selector().textContains('Your birthdate won').visibleToUser(true).findOne(1000)
        if (!yourBirthdateWonModel) {
            yourBirthdateWonModel = selector().textContains('Your birthday won').visibleToUser(true).findOne(1000)
        }
        if (yourBirthdateWonModel) {
            comm.showLog("在生日页面中")
            let sp = selector().textContains('Sign up').visibleToUser(true).findOne(1000)
            if (sp) {
                comm.showLog("点一下sign up")
                comm.clickObj(sp)
            } else {
                comm.showLog("没找到sign up")
            }
            sleep(5000)
            //
            comm.showLog("判断是否在 Sign up for TikTok页")
            if (selector().textContains('Sign up for TikTok').visibleToUser(true).exists()) {
                //
                let continueWithGoogle = selector().textContains('Continue with Google').visibleToUser(true).findOne(1000)
                if (continueWithGoogle) {
                    comm.showLog("点一下Continue-with-Google")
                    comm.clickObj(continueWithGoogle)
                    //需要等待十秒，进入google的登录页面
                    break
                }
            }
            //
        }
    }
    sleep(5000)
    for (let i = 0; i < 10; i++) {
        if (i == 9) {
            return "没进入账号输入页"
        }
        // 判断是不是对应页面 Learn more about using your account
        if (selector().textContains("Learn more about using your account").visibleToUser(true).exists()) {
            comm.showLog("在邮箱输入页")
            break
        } else {
            comm.showLog("没在邮箱输入页")
        }
        sleep(5000)
    }
    // 输入email和点击next
    let inputEmail = selector().className('android.widget.EditText').visibleToUser(true).findOne(1000)
    if (inputEmail) {
        comm.clickObj(inputEmail)
        sleep(5000)
        inputEmail.setText(email)
        sleep(5000)
        let nextBtn = selector().textContains('NEXT').visibleToUser(true).findOne(1000)
        if (!nextBtn) {
            return "没有next 1"
        } else {
            comm.clickObj(nextBtn)
        }
    }
    //
    sleep(5000)
    for (let i = 0; i < 10; i++) {
        if (i == 9) {
            return "没进入密码输入页"
        }
        // 判断是不是对应页面Show password
        if (selector().textContains("Show password").visibleToUser(true).exists()) {
            comm.showLog("在密码输入页")
            break
        } else {
            comm.showLog("没在密码输入页")
        }
        sleep(5000)
    }
    // 输入email和点击next className = android.widget.EditText   android.widget.TextView
    let inputPassWord = selector().className('android.widget.EditText').visibleToUser(true).findOne(1000)
    if (inputPassWord) {
        comm.clickObj(inputPassWord)
        sleep(5000)
        inputPassWord.setText(password)
        sleep(5000)
        let nextBtn = selector().textContains('NEXT').visibleToUser(true).findOne(1000)
        if (!nextBtn) {
            return "没有next 2"
        } else {
            comm.clickObj(nextBtn)
        }
    }
    //
    sleep(8000)
    for (let i = 0; i < 10; i++) {
        if (i == 9) {
            return "没进入Welcome协议页"
        }
        // 判断是不是对应页面Welcome to your new account
        if (selector().textContains("Welcome to your new account").visibleToUser(true).exists()) {
            comm.showLog("在Welcome协议页")
            break
        } else {
            comm.showLog("没在Welcome协议页")
        }
        sleep(5000)
    }
    //
    let understandBtn = selector().textContains('I UNDERSTAND').visibleToUser(true).findOne(1000)
    if (!understandBtn) {
        return "没有I-UNDERSTAND协议页"
    } else {
        comm.randomSwipeSlow(2)
        sleep(8000)
        comm.clickObj(understandBtn)
    }
    //
    sleep(10000)
    for (let i = 0; i < 10; i++) {
        if (i == 9) {
            return "没进入Google-Terms-of-ervice协议页"
        }
        // 判断是不是对应页面Google Terms of Service
        if (selector().textContains("Google Terms of Service").visibleToUser(true).exists()) {
            comm.showLog("在Google-Terms-of-Service协议页")
            break
        } else {
            comm.showLog("没在Google-Terms-of-Service协议页")
        }
        sleep(5000)
    }
    //text = I agree
    let iAgreeBtn = selector().textContains('I agree').visibleToUser(true).findOne(1000)
    if (!iAgreeBtn) {
        return "没有I-agree页"
    } else {
        sleep(3000)
        comm.clickObj(iAgreeBtn)
    }
    //...后续不确定
    comm.showLog("流程执行完了")
    sleep(5000)
    return "success"
}


//注册
function register(reg_type, email, mobile, password, nickname) {

    //第一步，先进入注册页面
    for (let i = 0; i < 3; i++) {
        if (i == 2) {
            return "第一步 找到注册页面 进行不下去"
        }
        //
        comm.showLog("注册执行次数：" + i)
        if (currentPackage().indexOf('com.zhiliaoapp.musically') == -1) {
            comm.showLog("launch tk")
            if (!app.launch('com.zhiliaoapp.musically')) {
                console.log('App 启动失败')
                return "tk启动失败"
            }
            sleep(6000)
        }
        closeAllPop()
        sleep(3000)
        // 判断是否在页面中
        comm.showLog("判断是否在Log in to TikTok页")
        if (selector().textContains('Log in to TikTok').visibleToUser(true).exists()) {
            //在页面中，查找  Sign up 或者 Don't have an account?
            let sp = selector().textContains('Sign up').visibleToUser(true).findOne(1000)
            if (sp) {
                comm.showLog("点一下sign up")
                comm.clickObj(sp)
            }
        }
        sleep(2000)
        // Log in to TikTok 不存在，看看是不是 已经在登陆页面
        comm.showLog("判断是否在 Sign up for TikTok页")
        if (selector().textContains('Sign up for TikTok').visibleToUser(true).exists()) {
            //
            let usePhoneEmail = selector().textContains('Use phone or email').visibleToUser(true).findOne(1000)
            if (usePhoneEmail) {
                comm.showLog("点一下Use phone or email")
                comm.clickObj(usePhoneEmail)
            }
        }
        //查看是否在生日页面
        comm.showLog("判断是否在 生日页面")
        sleep(2000)
        if (selector().textContains("Your birthday won").visibleToUser(true).exists()) {
            //
            comm.showLog("在生日页面中")
            let reSelectB = selectTkBirthday()
            if (reSelectB) {
                // 判断有没有Learn more
                if (selector().textContains("Learn more").visibleToUser(true).exists()) {
                    comm.showLog("在手机和邮箱输入页面中")
                    break
                }
            } else {
                return reSelectB
            }
        }

    }
    // 执行成功
    // 选择Phone 还是 Email,这里默认reg_type是手机:id("lda").findOne().children().forEach(child => {
    // var target = child.findOne(id("cxl").className("android.view.ViewGroup").selected(true));
    // target.click();
    // });
    //先执行一个授权权限
    comm.showLog("执行一个是否允许tk访问联系的权限写入")
    httpShell("pm grant com.zhiliaoapp.musically android.permission.READ_CONTACTS")
    httpShell("pm grant com.zhiliaoapp.musically android.permission.POST_NOTIFICATIONS")
    sleep(3000)
    //
    comm.showLog("第二步 手机号或者邮箱注册")
    if (reg_type == 1) {
        //点一下phone
        let phoneViewGroup = selector().textContains("Phone").visibleToUser(true).findOne(1000)
        if (phoneViewGroup) {
            comm.clickObj(phoneViewGroup)
        }
        sleep(1000)
        let inputs = selector().className('android.widget.EditText').find()
        if (inputs) {
            inputs[0].setText(mobile)
        }
    } else {
        //点一下email
        let emailViewGroup = selector().textContains("Email").visibleToUser(true).findOne(1000)
        if (emailViewGroup) {
            comm.clickObj(emailViewGroup)
        }
        sleep(1000)
        let inputs = selector().className('android.widget.EditText').find()
        if (inputs) {
            inputs[1].setText(email)
        }
    }
    sleep(2000)
    //点一下save
    if (selector().textContains("Save login info to log in").visibleToUser(true).exists()) {
        let saveLoginBox = selector().className("android.widget.CheckBox").visibleToUser(true).findOne(1000)
        if (saveLoginBox) {
            comm.clickObj(saveLoginBox)
        }
    }
    //点击Continue
    sleep(2000)
    let continueBtn = selector().textContains('Continue').visibleToUser(true).findOne(2000)
    if (continueBtn) {
        if (continueBtn.text() != "Continue") {
            return "没正确执行"
        } else {
            comm.clickObj(continueBtn)
            sleep(3000)
        }
    }
    sleep(3000)
    for (let j = 0; j < 10; j++) {
        if (j == 10) {
            comm.showLog("没进入创建密码页")
            return "没进入创建密码页"
        }
        //判断是否在Create password，创建密码页面
        let creatPWD = selector().textContains('Create password').visibleToUser(true).findOne(2000)
        if (!creatPWD) {
            comm.showLog("没成功进入创建密码页，判断是否已注册")
            //判断有没有You've already signed up，有就报错并上报账号已注册
            let youAreSigned = selector().textContains("ve already signed up").visibleToUser(true).findOne(2000)
            if (youAreSigned) {
                comm.showLog("账号已注册")
                return "账号已注册"
            }

        } else {
            break
        }
        sleep(3000)
    }
    //在密码输入界面
    sleep(2000)
    let inputs = selector().className('android.widget.EditText').find()
    if (inputs) {
        inputs[0].setText(password)
    }
    //点击继续按钮
    sleep(2000)
    continueBtn = selector().textContains('Continue').visibleToUser(true).findOne(2000)
    if (continueBtn) {
        if (continueBtn.text() != "Continue") {
            comm.showLog("没正确执行")
            return "没正确执行"
        } else {
            comm.clickObj(continueBtn)
            sleep(3000)
        }
    }
    sleep(5000)
    // 这里进入创建昵称界面
    //可能会弹出一个系统界面 DON'T ALLOW
    // httpShell("pm grant com.zhiliaoapp.musically android.permission.READ_CONTACTS")
    // httpShell("pm grant com.zhiliaoapp.musically android.permission.POST_NOTIFICATIONS")
    if (selector().textContains("Create nickname").visibleToUser(true).exists()) {
        //找到输入框,昵称会传过来
        inputs = selector().className('android.widget.EditText').find()
        if (inputs) {
            inputs[0].setText(nickname)
        }
        sleep(2000)
        //点击继续
        continueBtn = selector().textContains('Continue').visibleToUser(true).findOne(2000)
        if (continueBtn) {
            if (continueBtn.text() != "Continue") {
                comm.showLog("没正确执行")
                return "没正确执行"
            } else {
                comm.clickObj(continueBtn)
                sleep(3000)
            }
        }
    }
    sleep(3000)
    for (let k = 0; k < 10; k++) {
        if (k == 10) {
            comm.showLog('没有进入首页')
            return "没有进入首页"
        }
        //判断是否进入首页
        if (selector().textContains('Home').visibleToUser(true).findOne(1000) && selector().textContains('Profile').visibleToUser(true).findOne(1000)) {
            // if (selector().textContains('Home').visibleToUser(true).findOne(2000)){
            comm.showLog('已经登录进去了')
            break
        }
        sleep(3000)
    }
    comm.randomSwipe(3)
    comm.showLog("流程执行完了")
    return "success"
}


function register_bak(reg_type, email, phone, password, nick_name, username, task_id, need_code) {
    let step = 0
    let check_email_status = 0
    let do_cnt = 0
    for (let i = 0; i < 30; i++) {

        if (step > 0) {
            do_cnt++
            if (do_cnt > 9) {
                comm.showLog('重新开始注册流程')
                httpShell('am force-stop com.zhiliaoapp.musically')
                openTiktok(2)
                sleep(1000)
                do_cnt = 0
                step = 0
            }
        }
        let agreebtn = selector().textContains('I agree').visibleToUser(true).find()
        if (agreebtn.length > 0) {
            sleep(1000)
            comm.showLog("找到:I agree")
            comm.clickObj(agreebtn[agreebtn.length - 1])
            sleep(1000)
        }
        //进入注册页
        if (step == 0) {

            let registerBtn = selector().textContains('Use phone or email').visibleToUser(true).findOne(20000)
            if (registerBtn) {
                comm.clickObj(registerBtn)
                sleep(1000)
                step = 1
            }
        }
        if (step > 0) {
            //生日页
            let birth_page = selector().textContains('birthday').visibleToUser(true).findOne(1000)
            if (birth_page) {
                let result = false;//tkcomm.selectTkBirthday() 
                if (reg_type == 3) {
                    result = selectTkBirthday2()
                } else {
                    result = selectTkBirthday(task_id)
                }
                if (result == false) {
                    comm.showLog('选择出生日期失败')
                    return '选择出生日期失败'
                } else {
                    comm.showLog('选择出生日期完成')
                    if (reg_type == 3) {
                        step = 2
                    }
                }
            }
            sleep(1000)
            //填写手机号或邮箱页

            if (step != 2) {
                //选择注册类型
                let phone_tab = selector().textContains('Phone').visibleToUser(true).findOne(1000)
                let email_tab = selector().textContains('Email').visibleToUser(true).findOne(1000)
                let sign_up = selector().textContains('Sign up').visibleToUser(true).findOne(1000)
                if (phone_tab && email_tab && sign_up) {
                    if (reg_type == 2) {
                        //邮箱
                        comm.clickObj(email_tab)
                    } else {
                        //手机
                        comm.clickObj(phone_tab)
                    }
                    step = 2
                    sleep(2000)
                }
            }
            if (step == 2) {

                //邮箱注册
                if (reg_type == 2) {
                    let email_edit_text = selector().textContains('Email addres').className('android.widget.EditText').visibleToUser(true).findOne(1000)
                    if (email_edit_text) {
                        comm.clickObj(email_edit_text)
                        email_edit_text.setText('')
                        //clearText()
                        if (email == '') {
                            let emailStr = comm.httpToString(remoteServer + "/api/getEmail?client_no=" + client_no + "&key=63347f5d946164a23faca26b78a91e1c&task_id=" + task_id)
                            if (emailStr != '') {
                                try {
                                    let jsonEmail = JSON.parse(emailStr)
                                    if (jsonEmail.code == 0 && jsonEmail.data.email != null) {
                                        email = jsonEmail.data.email
                                    }
                                } catch (e) {
                                    console.log(e)
                                }
                            }
                        }
                        if (email == '' || email == null) {
                            return '无邮箱'
                        }
                        sysInputText(email_edit_text, email)
                        sleep(2000)
                        back()
                        sleep(1000)
                        let emailNext = selector().textContains('Continue').visibleToUser(true).findOne(3000)
                        if (!emailNext) {
                            emailNext = selector().textContains('Next').visibleToUser(true).findOne(5000)
                        }
                        if (!emailNext) {
                            comm.showLog('输入完email next按钮控件未找到')
                            return '输入完email next按钮控件未找到'
                        }
                        comm.clickObj(emailNext)  //next
                        sleep(random(6000, 7000));
                        check_email_status = 1
                    }
                }
                //手机注册
                if (reg_type == 1) {
                    let phone_edit_text = selector().className("android.widget.EditText").textContains("Phone number").visibleToUser(true).findOne(1000);
                    if (phone_edit_text) {
                        comm.clickObj(phone_edit_text)
                        phone_edit_text.setText('')
                        //clearText()
                        if (phone == '') {
                            let phoneStr = comm.httpToString(remoteServer + "/api/getMobile?client_no=" + client_no + "&key=63347f5d946164a23faca26b78a91e1c&task_id=" + task_id)
                            if (phoneStr != '') {
                                try {
                                    let jsonPhone = JSON.parse(phoneStr)
                                    if (jsonPhone.code == 0 && jsonPhone.data.mobile != null) {
                                        phone = jsonPhone.data.mobile
                                    }
                                } catch (e) {
                                    console.log(e)
                                }
                            }
                        }
                        if (phone == '' || phone == null) {
                            return '无号码'
                        }
                        sysInputText(phone_edit_text, phone)
                        sleep(1000)
                        let sendCode = selector().textContains("Send code").visibleToUser(true).findOne(5000);
                        if (sendCode) {

                            comm.clickObj(sendCode)
                            sleep(8000)
                        }
                    }
                }
                if (reg_type == 3) {

                    let usernameText = selector().textContains("username").visibleToUser(true).findOne(1000)
                    //let chooseText=selector().textContains("Choose").visibleToUser(true).findOne(1000)
                    if (usernameText) {
                        comm.showLog('填写用户名')
                        let username_edit = selector().className("android.widget.EditText").visibleToUser(true).findOne(1000);
                        if (username_edit) {
                            if (username_edit.text() != username) {
                                username_edit.setText('')
                                sysInputText(username_edit, username)
                                sleep(1000)
                            }
                            let btnNext = selector().textContains('Continue').visibleToUser(true).findOne(2000)
                            if (!btnNext) {
                                btnNext = selector().textContains('Next').visibleToUser(true).findOne(5000)
                            }
                            sleep(1000)
                            comm.clickObj(btnNext)
                            sleep(3000)
                        }
                    }
                }
            }
            let sendCode = selector().textContains("Send code").visibleToUser(true).findOne(1000);
            if (sendCode) {

                comm.clickObj(sendCode)
                sleep(8000)
            }
            let isAlreadUse = selector().textContains("is already in use").findOne(2000)
            if (isAlreadUse) {
                comm.showLog("用户名已存在")
                return "用户名已存在"
            }

            let createPassWord = selector().textContains("password").findOne(2000)
            if (createPassWord) {
                check_email_status = 2
                //输入密码并提交
                let passwordInput = selector().className('android.widget.EditText').findOne(5000)
                if (passwordInput) {
                    sleep(1000)
                    passwordInput.setText(password)
                    sleep(2000)
                    back()
                    sleep(2000)
                    let passwordNextBtn = selector().textContains('Next').visibleToUser(true).findOne(5000)
                    if (passwordNextBtn) {
                        comm.clickObj(passwordNextBtn)
                        sleep(6000)
                        if (reg_type == 3) {
                            sleep(5000)
                            for (let v = 0; v < 20; v++) {
                                let is_imageVerifyTips = selector().textContains('Verify to continue:').visibleToUser(true).exists()
                                let is_home = selector().textContains('Home').visibleToUser(true).exists()
                                let is_watchingBtn = selector().textContains("watching").visibleToUser(true).exists();
                                let is_gotitbtn = selector().textContains('Got it').visibleToUser(true).exists()
                                if (is_imageVerifyTips || is_home || is_watchingBtn || is_gotitbtn) {
                                    break
                                } else {
                                    sleep(1000)
                                }
                            }
                        }
                    }
                }
            }
            let select2Text = selector().textContains("Select 2 objects").visibleToUser(true).findOne(1000)
            let imageVerifyTips = selector().textContains('Verify to continue:').visibleToUser(true).findOne(3000)
            let dragTheSlider = selector().textContains('Drag the slider').visibleToUser(true).exists()
            if (imageVerifyTips) {
                comm.showLog('需要滑块图片验证码')
                check_email_status = 2
                let result = imageCodeVerify(false)
                if (result != 'success') {
                    return "滑块验证失败"
                }
            } else if (select2Text) {

                comm.showLog('相同对象')
                sleep(3000)
                if (device.width == 1312) {
                    result = select2ImageVcode()
                    if (result != 'success') {
                        return "图片验证失败"
                    }
                }
                if (retry_cnt < 2) {
                    back()
                    sleep(1000)
                    back()
                    retry_cnt++
                    comm.showLog('开始切换ip')
                    comm.httpToString(httpServer + '/api/setProxy?client_no=' + client_no + '&key=63347f5d946164a23faca26b78a91e1c&task_id=' + task_id)
                    sleep(3000)
                    continue
                }
                return "Select 2 objects"

            } else if (dragTheSlider) {
                comm.showLog('圆开滑块')
                sleep(3000)
                if (retry_cnt < 2) {
                    back()
                    sleep(1000)
                    back()
                    retry_cnt++
                    comm.showLog('开始切换ip')
                    comm.httpToString(httpServer + '/api/setProxy?client_no=' + client_no + '&key=63347f5d946164a23faca26b78a91e1c&task_id=' + task_id)
                    sleep(3000)
                    continue
                }
                return "Drag the slider"
            }
            // //邮箱验证码流程
            let vcodeTip = selector().textContains("-digit").visibleToUser(true).exists()
            let verifycodeTip = selector().textContains("erify your email").visibleToUser(true).exists()
            let checkEmailTip = selector().textContains("heck your email").visibleToUser(true).exists()
            if (vcodeTip || verifycodeTip || checkEmailTip) {
                check_email_status = 2
                if (reg_type == 2 && need_code == 0) {
                    comm.showLog('需要邮箱验证码')
                    sleep(3000)
                    if (retry_cnt < 2) {
                        back()
                        sleep(1000)
                        back()
                        retry_cnt++
                        comm.showLog('开始切换ip')
                        comm.httpToString(httpServer + '/api/setProxy?client_no=' + client_no + '&key=63347f5d946164a23faca26b78a91e1c&task_id=' + task_id)
                        sleep(3000)
                        continue
                    }
                    return "需要邮箱验证码"
                }
                let vcode = getVcode(task_id, reg_type)
                if (vcode == '') {
                    return "无验证码"
                }
                let vcode_result = verifyVcode(vcode)
                verifycodeTip = selector().textContains("erify your email").visibleToUser(true).exists()
                checkEmailTip = selector().textContains("heck your email").visibleToUser(true).exists()
                if (verifycodeTip || checkEmailTip) {
                    comm.showLog('重启tk...')
                    httpShell('am force-stop com.zhiliaoapp.musically')
                    sleep(1000)
                    if (!app.launch('com.zhiliaoapp.musically')) {
                        console.log('App 启动失败')
                        return "tk启动失败"
                    }
                    sleep(6000)
                    let birthday_msg = selector().textContains('birth').findOne(5000)
                    if (birthday_msg) {
                        return '邮箱验证失败'
                    }
                    vcode_result = 'success'
                }
                if (vcode_result != 'success') {
                    return vcode_result
                }
                sleep(3000)
                //createPassWord=selector().textContains("password").findOne(3000)   
                continue
            }
            //comm.showLog('next按钮控件loading不存在')
            //判断是否出现too many
            let tooManyTips = selector().textContains('Too many attempts.').visibleToUser(true).exists()
            if (tooManyTips) {
                console.log('too many attempts')
                return 'Too many attempts,邮箱已被使用'
            }

            //判断是否网络问题
            let networkErrorInPsdExist = selector().textContains('No network connection').visibleToUser(true).exists()
            if (!networkErrorInPsdExist) {

                networkErrorInPsdExist = selector().textContains('No internet').visibleToUser(true).exists()

            }
            if (networkErrorInPsdExist) {

                console.log('输入完邮箱(号码)出现无网络提示')
                comm.httpToString(httpServer + '/api/setProxy?client_no=' + client_no + '&key=63347f5d946164a23faca26b78a91e1c&task_id=' + task_id)
                sleep(5000)
                if (step == 2) {
                    continue
                }
            }
            let alreadysign = selector().textContains("signed up").visibleToUser(true).findOne(1000)
            if (alreadysign) {
                return "已被注册"
            }
            //重试NEXT
            let emailText = selector().textContains(email).findOne(1000)
            let emailNext = selector().textContains('Next').visibleToUser(true).findOne(1000)
            if (emailText && emailNext) {
                comm.clickObj(emailNext)  //next 
            }
            let watchingBtn = selector().textContains("watching").visibleToUser(true).find();
            if (watchingBtn.length > 0) {
                comm.clickObj(watchingBtn[watchingBtn.length - 1])
                sleep(6900)
            }
            let gotitbtn = selector().textContains('Got it').visibleToUser(true).find()
            if (gotitbtn.length > 0) {
                sleep(1000)
                comm.showLog("找到:Got it")
                comm.clickObj(gotitbtn[gotitbtn.length - 1])
                sleep(1000)
            }
            let signBtn = selector().textContains('Sign up').findOne(1000)
            if (signBtn) {
                let nicknameBtn = selector().textContains('nickname').findOne(1000)
                if (nicknameBtn) {
                    check_email_status = 2
                    let nick_name_ed = selector().className('android.widget.EditText').findOne(5000)
                    if (nick_name_ed) {
                        sleep(1000)
                        nick_name_ed.setText(nick_name)
                        sleep(1000)
                        back()
                        sleep(1000)
                        let confirmBtn = selector().textContains("Confirm").visibleToUser(true).findOne(5000)
                        if (!confirmBtn) {
                            confirmBtn = selector().textContains("Continue").visibleToUser(true).findOne(100)
                        }
                        if (!confirmBtn) {
                            confirmBtn = selector().textContains("Next").visibleToUser(true).findOne(100)
                        }
                        if (confirmBtn) {
                            step = 3
                            comm.clickObj(confirmBtn)
                            sleep(8000)
                        }
                    }
                }
                let skipInterestBtn = selector().textContains('Skip').visibleToUser(true).enabled(true).findOne(1000)
                if (skipInterestBtn) {
                    let iscreatePassWord = selector().textContains("password").visibleToUser(true).exists()
                    if (iscreatePassWord) {
                        continue
                    }
                    comm.clickObj(skipInterestBtn)
                    sleep(3000)
                    let sx = random(1500, 1600)
                    if (device.height < 1500) {
                        sx = device.height - random(260, 330)
                    }
                    swipe(random(300, 330), sx, random(300, 330), random(100, 130), random(100, 300))
                    sleep(600)
                    swipe(random(300, 330), sx, random(300, 330), random(100, 130), random(100, 300))
                    sleep(600)
                    swipe(random(300, 330), sx, random(300, 330), random(100, 130), random(100, 300))
                    sleep(600)
                    swipe(random(300, 330), sx, random(300, 330), random(100, 130), random(100, 300))
                }
            } else {
                let doNotAllowBtn = selector().textContains('t allow').visibleToUser(true).findOne(1000)
                if (doNotAllowBtn) {
                    comm.clickObj(doNotAllowBtn)
                    sleep(1000)
                    let sx = random(1500, 1600)
                    if (device.height < 1500) {
                        sx = device.height - random(260, 330)
                    }
                    swipe(random(300, 330), sx, random(300, 330), random(100, 130), random(100, 300))
                    sleep(600)
                    swipe(random(300, 330), sx, random(300, 330), random(100, 130), random(100, 300))

                }
                let sx = random(1500, 1600)
                if (device.height < 1500) {
                    sx = device.height - random(260, 330)
                }
                let notNowBtn = selector().textContains('Not now').visibleToUser(true).findOne(1000)
                if (notNowBtn) {
                    comm.clickObj(notNowBtn)
                    sleep(random(1000, 2000))

                    swipe(random(300, 330), sx, random(300, 330), random(100, 130), random(100, 300))
                    sleep(600)
                    swipe(random(300, 330), sx, random(300, 330), random(100, 130), random(100, 300))
                }
                let skipInterestBtn = selector().textContains('Skip').visibleToUser(true).enabled(true).findOne(1000)
                if (skipInterestBtn) {
                    let iscreatePassWord = selector().textContains("password").visibleToUser(true).exists()
                    if (iscreatePassWord) {
                        continue
                    }
                    comm.clickObj(skipInterestBtn)
                    sleep(3000)
                    swipe(random(300, 330), sx, random(300, 330), random(100, 130), random(100, 300))
                    sleep(600)
                    swipe(random(300, 330), sx, random(300, 330), random(100, 130), random(100, 300))
                    sleep(600)
                    swipe(random(300, 330), sx, random(300, 330), random(100, 130), random(100, 300))
                    sleep(600)
                    swipe(random(300, 330), sx, random(300, 330), random(100, 130), random(100, 300))
                } else {
                    swipe(random(300, 330), sx, random(300, 330), random(100, 130), random(100, 300))
                    sleep(600)
                }
                let meBtn = selector().textContains("Profile").visibleToUser(true).findOne(1000)
                if (!meBtn) {
                    closeAllPop();
                    meBtn = selector().textContains("Profile").visibleToUser(true).findOne(2000)
                }
                if (meBtn) {
                    if (reg_type == 3) {
                        tkusername = username
                        return "register success"
                    }
                    // let fcnt=0
                    // for (let f = 0; f < 10; f++) {
                    //     let allImgs=selector().className("android.widget.ImageView").visibleToUser(true).find()
                    //     let index_c=0
                    //     for (let index = 0; index < allImgs.length; index++) {
                    //             let element = allImgs[index];  
                    //             console.log(element.bounds().left)
                    //             console.log(device.width-300)
                    //             if(element.bounds().centerY()<(device.height/5))
                    //             {
                    //                continue
                    //             }
                    //             if(element.bounds().left>(device.width-300)){
                    //                 index_c++
                    //                 console.log(element) 
                    //                 console.log(element.bounds()) 
                    //                 if(index_c==2){
                    //                     fcnt++
                    //                     comm.clickObj(element)
                    //                     break
                    //                 }
                    //             }  
                    //     }
                    //     if(fcnt>1){
                    //         break
                    //     }
                    //     swipe(random(300, 330), sx, random(300, 330), random(100, 130), random(100, 300)) 
                    //     sleep(3000)   
                    // }    
                    // backToHome()
                    // meBtn = selector().textContains("Profile").visibleToUser(true).findOne(2000)  
                    comm.clickObj(meBtn)
                    sleep(3000)
                }

                let allTextViews = selector().textContains("@").find()
                for (let index = 0; index < allTextViews.length; index++) {

                    let tv = allTextViews[index];
                    if (tv.text().startsWith("@")) {
                        tkusername = tv.text().replace("@", "");
                        tkusername = tkusername.replace(' T', '')
                        comm.showLog(tkusername);
                        return "register success"
                    }
                }
                if (step > 1 && (i > 10 || step == 3)) {
                    click(300, 300)
                    backToHome()
                    continue
                }
            }
            //sleep(1000)  
            closeAllPop()

            // if(currentPackage().indexOf('com.zhiliaoapp.musically')==-1){
            //     comm.showLog("重启tiktok...")  
            //     if(!app.launch('com.zhiliaoapp.musically')) {
            //         console.log('App 启动失败')
            //         return "tk启动失败"
            //      }
            //      sleep(8000)
            //      //openTiktok(4)
            // }else{
            //     comm.showLog("等待中...")  
            // }
            comm.showLog("等待中...")
            let email_edit_text = selector().textContains('@').className('android.widget.EditText').visibleToUser(true).findOne(1000)
            imageVerifyTips = selector().textContains('Verify to continue:').visibleToUser(true).findOne(300)
            if (email_edit_text && email_edit_text.text() != '' && !imageVerifyTips) {
                step = 2
                let emailNext = selector().textContains('Continue').visibleToUser(true).findOne(1000)
                if (!emailNext) {
                    emailNext = selector().textContains('Next').visibleToUser(true).findOne(1000)
                }
                if (emailNext) {
                    comm.clickObj(emailNext)
                    sleep(8000)
                }
            }
            if (check_email_status == 1) {

                check_email_status = 2
                back()
            }

        }
    }
    return "注册失败"
}

// type=0 无  type=1 login type=2 register
function openTiktok(type, url) {
    comm.showLog("打开Tiktok【开始】");
    //初始化权限
    if (type < 3) {
        //httpShell("pm clear com.zhiliaoapp.musically")
        httpShell("pm grant com.zhiliaoapp.musically android.permission.READ_CONTACTS")
        httpShell("pm grant com.zhiliaoapp.musically android.permission.POST_NOTIFICATIONS")

        //initPermission()
        sleep(1000)
        if (url && url != null && url != '') {
            openWebTiktok(url)
        } else {
            if (!app.launch('com.zhiliaoapp.musically')) {
                console.log('App 启动失败')
                return 'App 启动失败'
            }
        }

        sleep(6000)
        comm.showLog('启动完成')
    }
    //
    // 可能会出现验证码。遇到了变速验证码。判断一下Refresh这个文字刷新是否存在，存在就走常规验证码，不存在但是存在Drag the puzzle piece into place 就走变速验证码
    let verify1 = selector().textContains('erify to continue').visibleToUser(true).exists()
    let verify2 = selector().textContains('Refresh').visibleToUser(true).exists()
    let verify3 = selector().textContains('rag the puzzle piece into place').visibleToUser(true).exists()
    if (verify1 || verify2 || verify3) {
        comm.showLogToFile("判断有没有验证码")
        imageCodeVerify_Buy()
        comm.showLogToFile("验证码结束")
        closeAllPop()
    } else {
        closeAllPop()
    }
    // if(type==3){
    //     type=1
    // }else if(type==4){
    //     type=2
    // }
    for (let i = 0; i < 1; i++) {

        if (i == 6 || i == 15) {
            httpShell('am force-stop com.zhiliaoapp.musically')
        }
        if (currentPackage().indexOf('com.zhiliaoapp.musically') == -1 || i == 6 || i == 15) {
            if (!app.launch('com.zhiliaoapp.musically')) {
                console.log('App 启动失败')
                return "tk启动失败"
            }
            comm.showLog('重启完成')
            sleep(5000)
        }
        sleep(5000)
        //是否到达登录页
        // closeAllPop()
        //
        let Sign_in_another_btn = selector().textContains('Sign in another').visibleToUser(true).findOne(1000)
        if (Sign_in_another_btn) {
            comm.showLogToFile("点击一下屏幕中心")
            click(device.width / 2, device.height / 2)
            sleep(3000)
        }
        let skipInterestBtn = selector().textContains('Skip').visibleToUser(true).findOne(1000)
        if (skipInterestBtn) {
            comm.showLog("跳过兴趣");
            comm.clickObj(skipInterestBtn)
            sleep(2000)
            let sx = random(1500, 1600)
            if (device.height < 1500) {
                sx = device.height - random(80, 150)
            }
            swipe(random(300, 330), sx, random(300, 330), random(100, 130), random(100, 300))
            sleep(1000)
            swipe(random(300, 330), sx, random(300, 330), random(100, 130), random(100, 300))
            sleep(1000)
            swipe(random(300, 330), sx, random(300, 330), random(100, 130), random(100, 300))
            sleep(1000)
        }
        //页面进入home
        let homeBtn = selector().textContains('Home').visibleToUser(true).findOne(1000)
        if (homeBtn) {
            sleep(3000)
            closeAllPop()
            // 暂时不知道下面代码有什么用
            if (type == 0) {
                break
            } else if (type == 3) {
                break
            } else {
                let meBtn = selector().textContains("Profile").visibleToUser(true).findOne(1000)
                if (meBtn) {
                    comm.showLog("点击个人中心");
                    comm.clickObj(meBtn)
                    sleep(3000)
                    let saveBtn = selector().textContains("Save").visibleToUser(true).findOne(3000)
                    if (saveBtn) {
                        comm.showLog("点击保存");
                        comm.clickObj(saveBtn)
                        sleep(2000)
                    }
                    let usernameText = selector().textContains(username).visibleToUser(true).findOne(5000)
                    if (usernameText) {
                        // tkusername = username
                        break
                    }
                }
            }
        }
        //页面进入生日页面
        let birthday_msg = selector().textContains('birth').exists()
        if (birthday_msg) {
            comm.showLog("birthday")
            sleep(3000)
            let log_in_btn = selector().textContains("have an account").visibleToUser(true).findOne(1000)
            if (!log_in_btn) {
                log_in_btn = selector().textContains("more great").visibleToUser(true).findOne(1000)
            }
            if (!log_in_btn) {
                let sign_up = selector().textContains('Sign up').visibleToUser(true).find()
                if (sign_up.length > 0) {
                    //comm.showLog(sign_up[sign_up.length-1].text())
                    let b = sign_up[sign_up.length - 1].bounds()
                    //comm.showLog('click:'+b.centerX()+','+b.centerY())
                    click(b.left + 20, b.centerY())
                    sleep(3000)
                    continue
                }
            }
            if (!log_in_btn) {
                log_in_btn = selector().textContains("Log in").visibleToUser(true).findOne(1000)
            }
            //let log_in_btn=selector().textContains('Log in').findOne(3000) 
            if (log_in_btn) {
                comm.showLog("点击登录");
                comm.clickObj(log_in_btn)
            }
            sleep(6000)
        }
        // 页面进入需要登陆的页面 看看有没有 account was logged out (说明登陆失效)
        let logged_out_btn = selector().textContains("account was logged out").visibleToUser(true).findOne(1000)
        let welcome_back_text = selector().textContains("Welcome back").visibleToUser(true).findOne(1000)
        let username_text = selector().textContains(username).visibleToUser(true).findOne(1000)
        if (logged_out_btn || (welcome_back_text && username_text)) {
            //登陆失效，触发登陆逻辑
            comm.showLog("登陆失效")
            sleep(8000)
            closeAllPop()
            //写一个函数
            // let loggedOutMsg = WasLoggedOutAndLogin()
            let loggedOutMsg = "WasLoggedOutAndLogin()"
            comm.showLog("重新登陆函数的返回：" + loggedOutMsg)
            if (loggedOutMsg == 'success') {
                if (password_new != '') {
                    for (let b = 0; b < 5; b++) {
                        httpShell('curl "http://120.236.196.248:9004/api/account/updatePassword?account_id=' + account_id + '&password=' + password_new + '"')
                        sleep(5000)
                    }
                }
                updateTask(2, task_id, 1, "重新登陆成功", username)
                // sleep(10000)
                // //备份
                // httpShell('curl "http://127.0.0.1:8000/api/backup?backup_no=' + backupNo + '"')
                return "重新登陆成功"
            } else {
                return "重新登陆失败"
            }
        }
        //
        let is_login_page = selector().textContains('Log in to TikTok').visibleToUser(true).exists()
        if (is_login_page) {
            comm.showLog("当前页为: Log in to TikTok")
            if (type == 2 || type == 4) {
                //sleep(2000)
                let bottom_change = selector().textContains("have an account").visibleToUser(true).findOne(1000)
                if (bottom_change) {
                    comm.showLog("点击注册");
                    comm.clickObj(bottom_change)
                    break
                } else {
                    sleep(1000)
                    continue
                }
            } else {
                //走一下登陆流程
                //登陆失效，触发登陆逻辑
                comm.showLog("需要重新登陆2")
                sleep(8000)
                closeAllPop()
                // let loggedOutMsg = WasLoggedOutAndLogin_other()
                let loggedOutMsg = "WasLoggedOutAndLogin_other()"
                comm.showLog("重新登陆2函数的返回：" + loggedOutMsg)
                if (loggedOutMsg == 'success') {
                    updateTask(2, task_id, 1, "重新登陆成功", username)
                    // sleep(10000)
                    // //备份
                    // httpShell('curl "http://127.0.0.1:8000/api/backup?backup_no=' + backupNo + '"')
                    return "重新登陆成功"
                    //
                } else if (loggedOutMsg == '还有验证码存在，不成功') {
                    return "还有验证码存在，不成功"
                } else {
                    return "重新登陆2失败"
                }
            }

        }
        let is_sign_page = selector().textContains('Sign up for TikTok').visibleToUser(true).exists()
        if (is_sign_page) {
            comm.showLog("当前页为: Sign up for TikTok")
            if (type == 1 || type == 3) {
                let bottom_change = selector().textContains("have an account").visibleToUser(true).findOne(1000)
                if (bottom_change) {
                    comm.showLog("点击注册");
                    comm.clickObj(bottom_change)
                    break
                }
            } else {
                break
            }
        }
        // Please try again     Retry
        let pta = selector().textContains('Please try again').visibleToUser(true).exists()
        let tal = selector().textContains('Try again later').visibleToUser(true).exists()
        if (pta || tal) {
            let retryBtn = selector().className('android.widget.Button').text('Retry').visibleToUser(true).findOne(1000)
            if (retryBtn) {
                comm.showLog("opentk,点一下Retry")
                comm.clickObj(retryBtn)
            }
        }
        // Not interested
        let notInterested = selector().textContains('Not interested').visibleToUser(true).exists()
        if (notInterested) {
            back()
        }
        // 按钮Not interested，检测弹窗内容问题
        notInterested = selector().textContains('You can redeem your').visibleToUser(true).exists()
        if (notInterested) {
            back()
        }
        sleep(3000)
    }
    // comm.showLog(type == 1 ? "login" : type == 2 ? "register" : type == 3 ? "login" : type == 4 ? "register" : "none")
    // sleep(1000)
    // comm.showLog("打开Tiktok【完成】");
    // return "success"
    sleep(5000)
    let homePop = selector().textContains('Home').visibleToUser(true).exists()
    if (homePop) {
        comm.showLog("成功进入首页")
        return "success"

    } else {
        comm.showLog("没成功进首页")
        return "没成功进首页"
    }
}
function openTiktok_bak(type, url) {
    comm.showLog("打开Tiktok【开始】");
    //初始化权限
    if (type < 3) {
        //httpShell("pm clear com.zhiliaoapp.musically")
        httpShell("pm grant com.zhiliaoapp.musically android.permission.READ_CONTACTS")
        httpShell("pm grant com.zhiliaoapp.musically android.permission.POST_NOTIFICATIONS")

        //initPermission()
        sleep(1000)
        if (url && url != null && url != '') {
            openWebTiktok(url)
        } else {
            if (!app.launch('com.zhiliaoapp.musically')) {
                console.log('App 启动失败')
                return 'App 启动失败'
            }
        }

        sleep(6000)
        comm.showLog('启动完成')
    }
    //
    // 可能会出现验证码。遇到了变速验证码。判断一下Refresh这个文字刷新是否存在，存在就走常规验证码，不存在但是存在Drag the puzzle piece into place 就走变速验证码
    let verify1 = selector().textContains('erify to continue').visibleToUser(true).exists()
    let verify2 = selector().textContains('Refresh').visibleToUser(true).exists()
    let verify3 = selector().textContains('rag the puzzle piece into place').visibleToUser(true).exists()
    if (verify1 || verify2 || verify3) {
        comm.showLogToFile("判断有没有验证码")
        imageCodeVerify_Buy()
        comm.showLogToFile("验证码结束")
    } else {
        closeAllPop()
    }
    // if(type==3){
    //     type=1
    // }else if(type==4){
    //     type=2
    // }
    for (let i = 0; i < 1; i++) {

        if (i == 6 || i == 15) {
            httpShell('am force-stop com.zhiliaoapp.musically')
        }
        if (currentPackage().indexOf('com.zhiliaoapp.musically') == -1 || i == 6 || i == 15) {
            if (!app.launch('com.zhiliaoapp.musically')) {
                console.log('App 启动失败')
                return "tk启动失败"
            }
            comm.showLog('重启完成')
            sleep(5000)
        }
        sleep(5000)
        //是否到达登录页
        // closeAllPop()
        //
        let Sign_in_another_btn = selector().textContains('Sign in another').visibleToUser(true).findOne(1000)
        if (Sign_in_another_btn) {
            comm.showLogToFile("点击一下屏幕中心")
            click(device.width / 2, device.height / 2)
            sleep(3000)
        }
        let skipInterestBtn = selector().textContains('Skip').visibleToUser(true).findOne(1000)
        if (skipInterestBtn) {
            comm.showLog("跳过兴趣");
            comm.clickObj(skipInterestBtn)
            sleep(2000)
            let sx = random(1500, 1600)
            if (device.height < 1500) {
                sx = device.height - random(80, 150)
            }
            swipe(random(300, 330), sx, random(300, 330), random(100, 130), random(100, 300))
            sleep(1000)
            swipe(random(300, 330), sx, random(300, 330), random(100, 130), random(100, 300))
            sleep(1000)
            swipe(random(300, 330), sx, random(300, 330), random(100, 130), random(100, 300))
            sleep(1000)
        }
        //页面进入home
        let homeBtn = selector().textContains('Home').visibleToUser(true).findOne(1000)
        if (homeBtn) {
            sleep(3000)
            closeAllPop()
            // 暂时不知道下面代码有什么用
            if (type == 0) {
                break
            } else if (type == 3) {
                break
            } else {
                let meBtn = selector().textContains("Profile").visibleToUser(true).findOne(1000)
                if (meBtn) {
                    comm.showLog("点击个人中心");
                    comm.clickObj(meBtn)
                    sleep(3000)
                    let saveBtn = selector().textContains("Save").visibleToUser(true).findOne(3000)
                    if (saveBtn) {
                        comm.showLog("点击保存");
                        comm.clickObj(saveBtn)
                        sleep(2000)
                    }
                    let usernameText = selector().textContains(username).visibleToUser(true).findOne(5000)
                    if (usernameText) {
                        // tkusername = username
                        break
                    }
                }
            }
        }
        //页面进入生日页面
        let birthday_msg = selector().textContains('birth').exists()
        if (birthday_msg) {
            comm.showLog("birthday")
            sleep(3000)
            let log_in_btn = selector().textContains("have an account").visibleToUser(true).findOne(1000)
            if (!log_in_btn) {
                log_in_btn = selector().textContains("more great").visibleToUser(true).findOne(1000)
            }
            if (!log_in_btn) {
                let sign_up = selector().textContains('Sign up').visibleToUser(true).find()
                if (sign_up.length > 0) {
                    //comm.showLog(sign_up[sign_up.length-1].text())
                    let b = sign_up[sign_up.length - 1].bounds()
                    //comm.showLog('click:'+b.centerX()+','+b.centerY())
                    click(b.left + 20, b.centerY())
                    sleep(3000)
                    continue
                }
            }
            if (!log_in_btn) {
                log_in_btn = selector().textContains("Log in").visibleToUser(true).findOne(1000)
            }
            //let log_in_btn=selector().textContains('Log in').findOne(3000) 
            if (log_in_btn) {
                comm.showLog("点击登录");
                comm.clickObj(log_in_btn)
            }
            sleep(6000)
        }
        // 页面进入需要登陆的页面 看看有没有 account was logged out (说明登陆失效)
        let logged_out_btn = selector().textContains("account was logged out").visibleToUser(true).findOne(1000)
        let welcome_back_text = selector().textContains("Welcome back").visibleToUser(true).findOne(1000)
        let username_text = selector().textContains(username).visibleToUser(true).findOne(1000)
        if (logged_out_btn || (welcome_back_text && username_text)) {
            //登陆失效，触发登陆逻辑
            comm.showLog("登陆失效")
            sleep(8000)
            closeAllPop()
            //写一个函数
            let loggedOutMsg = WasLoggedOutAndLogin()
            comm.showLog("重新登陆函数的返回：" + loggedOutMsg)
            if (loggedOutMsg == 'success') {
                if (password_new != '') {
                    for (let b = 0; b < 5; b++) {
                        httpShell('curl "http://120.236.196.248:9004/api/account/updatePassword?account_id=' + account_id + '&password=' + password_new + '"')
                        sleep(5000)
                    }
                }
                updateTask(2, task_id, 1, "重新登陆成功", username)
                // sleep(10000)
                // //备份
                // httpShell('curl "http://127.0.0.1:8000/api/backup?backup_no=' + backupNo + '"')
                return "重新登陆成功"
            } else {
                return "重新登陆失败"
            }
        }
        //
        let is_login_page = selector().textContains('Log in to TikTok').visibleToUser(true).exists()
        if (is_login_page) {
            comm.showLog("当前页为: Log in to TikTok")
            if (type == 2 || type == 4) {
                //sleep(2000)
                let bottom_change = selector().textContains("have an account").visibleToUser(true).findOne(1000)
                if (bottom_change) {
                    comm.showLog("点击注册");
                    comm.clickObj(bottom_change)
                    break
                } else {
                    sleep(1000)
                    continue
                }
            } else {
                //走一下登陆流程
                //登陆失效，触发登陆逻辑
                comm.showLog("需要重新登陆2")
                sleep(8000)
                closeAllPop()
                let loggedOutMsg = WasLoggedOutAndLogin_other()
                comm.showLog("重新登陆2函数的返回：" + loggedOutMsg)
                if (loggedOutMsg == 'success') {
                    updateTask(2, task_id, 1, "重新登陆成功", username)
                    // sleep(10000)
                    // //备份
                    // httpShell('curl "http://127.0.0.1:8000/api/backup?backup_no=' + backupNo + '"')
                    return "重新登陆成功"
                    //
                } else if (loggedOutMsg == '还有验证码存在，不成功') {
                    return "还有验证码存在，不成功"
                } else {
                    return "重新登陆2失败"
                }
            }

        }
        let is_sign_page = selector().textContains('Sign up for TikTok').visibleToUser(true).exists()
        if (is_sign_page) {
            comm.showLog("当前页为: Sign up for TikTok")
            if (type == 1 || type == 3) {
                let bottom_change = selector().textContains("have an account").visibleToUser(true).findOne(1000)
                if (bottom_change) {
                    comm.showLog("点击注册");
                    comm.clickObj(bottom_change)
                    break
                }
            } else {
                break
            }
        }
        // Please try again     Retry
        let pta = selector().textContains('Please try again').visibleToUser(true).exists()
        let tal = selector().textContains('Try again later').visibleToUser(true).exists()
        if (pta || tal) {
            let retryBtn = selector().className('android.widget.Button').text('Retry').visibleToUser(true).findOne(1000)
            if (retryBtn) {
                comm.showLog("opentk,点一下Retry")
                comm.clickObj(retryBtn)
            }
        }
        // Not interested
        let notInterested = selector().textContains('Not interested').visibleToUser(true).exists()
        if (notInterested) {
            back()
        }
        // 按钮Not interested，检测弹窗内容问题
        notInterested = selector().textContains('You can redeem your').visibleToUser(true).exists()
        if (notInterested) {
            back()
        }
        sleep(3000)
    }
    // comm.showLog(type == 1 ? "login" : type == 2 ? "register" : type == 3 ? "login" : type == 4 ? "register" : "none")
    // sleep(1000)
    // comm.showLog("打开Tiktok【完成】");
    // return "success"
    sleep(5000)
    let homePop = selector().textContains('Home').visibleToUser(true).exists()
    if (homePop) {
        comm.showLog("成功进入首页")
        return "success"

    } else {
        comm.showLog("没成功进首页")
        return "没成功进首页"
    }
}

// 新写一个openTiktok
function openTiktok_v2() {
    //
    comm.showLogToFile("打开Tiktok【开始】");
    //初始化权限
    //httpShell("pm clear com.zhiliaoapp.musically")
    httpShell("pm grant com.zhiliaoapp.musically android.permission.READ_CONTACTS")
    httpShell("pm grant com.zhiliaoapp.musically android.permission.POST_NOTIFICATIONS")

    //initPermission()
    sleep(1000)

    if (!app.launch('com.zhiliaoapp.musically')) {
        console.log('App 启动失败')

        return 'App 启动失败'
    } else {
        sleep(6000)
        comm.showLogToFile('启动完成')
    }

    // 进入执行
    for (let i = 0; i < 5; i++) {
        //保持tk在前台
        if (currentPackage().indexOf('com.zhiliaoapp.musically') == -1) {
            if (!app.launch('com.zhiliaoapp.musically')) {
                console.log('App 启动失败')
                return "tk启动失败"
            }
            comm.showLogToFile('重启完成')
            sleep(5000)
        }
        sleep(5000)
        //是否到达登录页
        // 可能会出现验证码。遇到了变速验证码。判断一下Refresh这个文字刷新是否存在，存在就走常规验证码，不存在但是存在Drag the puzzle piece into place 就走变速验证码
        let verify1 = selector().textContains('erify to continue').visibleToUser(true).exists()
        let verify2 = selector().textContains('Refresh').visibleToUser(true).exists()
        let verify3 = selector().textContains('rag the puzzle piece into place').visibleToUser(true).exists()
        if (verify1 || verify2 || verify3) {
            let verifyMsg = ""
            //说明有验证码
            if (verify2) {
                comm.showLogToFile("常规滑块验证码")
                verifyMsg = imageCodeVerify_Buy()
            } else {
                comm.showLog("变化速率的滑块验证码")
                verifyMsg = sliderVerificationCode()
            }
            comm.showLog("验证码部分返回：" + verifyMsg)
            //
            closeAllPop()
        } else {
            closeAllPop()
        }
        //
        let Sign_in_another_btn = selector().textContains('Sign in another').visibleToUser(true).findOne(1000)
        if (Sign_in_another_btn) {
            comm.showLogToFile("点击一下屏幕中心")
            click(device.width / 2, device.height / 2)
            sleep(3000)
        }
        let skipInterestBtn = selector().textContains('Skip').visibleToUser(true).findOne(1000)
        if (skipInterestBtn) {
            comm.showLog("跳过兴趣");
            comm.clickObj(skipInterestBtn)
            sleep(2000)
            let sx = random(1500, 1600)
            if (device.height < 1500) {
                sx = device.height - random(80, 150)
            }
            swipe(random(300, 330), sx, random(300, 330), random(100, 130), random(100, 300))
            sleep(1000)
            swipe(random(300, 330), sx, random(300, 330), random(100, 130), random(100, 300))
            sleep(1000)
            swipe(random(300, 330), sx, random(300, 330), random(100, 130), random(100, 300))
            sleep(1000)
        }
        //页面进入home，那就直接中断这个op的循环
        let homeBtn = selector().textContains('Home').visibleToUser(true).findOne(1000)
        if (homeBtn) {
            sleep(3000)
            break
        }
        //页面进入生日页面
        let birthday_msg = selector().textContains('birth').exists()
        if (birthday_msg) {
            comm.showLog("birthday")
            sleep(3000)
            let log_in_btn = selector().textContains("have an account").visibleToUser(true).findOne(1000)
            if (!log_in_btn) {
                log_in_btn = selector().textContains("more great").visibleToUser(true).findOne(1000)
            }
            if (!log_in_btn) {
                let sign_up = selector().textContains('Sign up').visibleToUser(true).find()
                if (sign_up.length > 0) {
                    //comm.showLog(sign_up[sign_up.length-1].text())
                    let b = sign_up[sign_up.length - 1].bounds()
                    //comm.showLog('click:'+b.centerX()+','+b.centerY())
                    click(b.left + 20, b.centerY())
                    sleep(3000)
                    continue
                }
            }
            if (!log_in_btn) {
                log_in_btn = selector().textContains("Log in").visibleToUser(true).findOne(1000)
            }
            //let log_in_btn=selector().textContains('Log in').findOne(3000) 
            if (log_in_btn) {
                comm.showLog("点击登录");
                comm.clickObj(log_in_btn)
            }
            sleep(6000)
        }
        // 页面进入需要登陆的页面 看看有没有 account was logged out (说明登陆失效)
        let logged_out_btn = selector().textContains("account was logged out").visibleToUser(true).findOne(1000)
        let welcome_back_text = selector().textContains("Welcome back").visibleToUser(true).findOne(1000)
        let username_text = selector().textContains(username).visibleToUser(true).findOne(1000)
        if (logged_out_btn || (welcome_back_text && username_text)) {
            //登陆失效，触发登陆逻辑
            comm.showLog("登陆失效")
            //写一个函数
            // let loggedOutMsg = WasLoggedOutAndLogin()
            let loggedOutMsg = "WasLoggedOutAndLogin()"
            comm.showLog("重新登陆函数的返回：" + loggedOutMsg)
            if (loggedOutMsg == 'success') {
                // if (password_new != '') {
                //     for (let b = 0; b < 5; b++) {
                //         httpShell('curl "http://120.236.196.248:9004/api/account/updatePassword?account_id=' + account_id + '&password=' + password_new + '"')
                //         sleep(5000)
                //     }
                // }
                updateTask(2, task_id, 1, "重新登陆成功", username)
                sleep(10000)
                //备份
                // httpShell('curl "http://127.0.0.1:8000/api/backup?backup_no=' + backupNo + '"')
                // return "重新登陆成功"
                comm.showLog("重新登陆成功")
                break
            } else {
                return "重新登陆失败"
            }
        }
        //
        let is_login_page = selector().textContains('Log in to TikTok').visibleToUser(true).exists()
        if (is_login_page) {
            comm.showLog("当前页为: Log in to TikTok")
            //走一下登陆流程
            //登陆失效，触发登陆逻辑
            comm.showLog("需要重新登陆2")
            // let loggedOutMsg = WasLoggedOutAndLogin_other()
            let loggedOutMsg = "WasLoggedOutAndLogin_other()"
            comm.showLog("重新登陆2函数的返回：" + loggedOutMsg)
            if (loggedOutMsg == 'success') {
                updateTask(2, task_id, 1, "重新登陆成功", username)
                sleep(10000)
                //备份
                // httpShell('curl "http://127.0.0.1:8000/api/backup?backup_no=' + backupNo + '"')
                // return "重新登陆成功"
                comm.showLog("重新登陆成功")
                break
                //
            } else if (loggedOutMsg == '还有验证码存在，不成功') {
                return "还有验证码存在，不成功"
            } else {
                return "重新登陆失败"
            }
        }
        //
        let is_sign_page = selector().textContains('Sign up for TikTok').visibleToUser(true).exists()
        if (is_sign_page) {
            comm.showLog("当前页为: Sign up for TikTok")
            return "出现Sign up for TikTok"
        }
        // Please try again     Retry
        let pta = selector().textContains('Please try again').visibleToUser(true).exists()
        let tal = selector().textContains('Try again later').visibleToUser(true).exists()
        if (pta || tal) {
            let retryBtn = selector().className('android.widget.Button').text('Retry').visibleToUser(true).findOne(1000)
            if (retryBtn) {
                comm.showLog("opentk,点一下Retry")
                comm.clickObj(retryBtn)
            }
        }
        // Not interested
        let notInterested = selector().textContains('Not interested').visibleToUser(true).exists()
        if (notInterested) {
            back()
        }
        // 按钮Not interested，检测弹窗内容问题
        notInterested = selector().textContains('You can redeem your').visibleToUser(true).exists()
        if (notInterested) {
            back()
        }
        sleep(3000)
    }
    // comm.showLog(type == 1 ? "login" : type == 2 ? "register" : type == 3 ? "login" : type == 4 ? "register" : "none")
    sleep(5000)
    for (let i = 0; i < 5; i++) {
        let homePop = selector().textContains('Home').visibleToUser(true).exists()
        if (homePop) {
            comm.showLog("成功进入首页")
            return "success"
        } else {
            comm.showLog("没成功进首页")
            closeAllPop()
            sleep(5000)
        }

    }
    return "默认openTiktok失败"
    // comm.showLog("打开Tiktok【完成】");
}




//不知道什么时候的v2
// type=0 无  type=1 login type=2 register
function openTiktok_v2_bak(type, url) {
    comm.showLog("打开Tiktok【开始】");
    //初始化权限
    if (type < 3) {
        //httpShell("pm clear com.zhiliaoapp.musically")
        httpShell("pm grant com.zhiliaoapp.musically android.permission.READ_CONTACTS")
        httpShell("pm grant com.zhiliaoapp.musically android.permission.POST_NOTIFICATIONS")

        //initPermission()
        sleep(1000)
        if (url && url != null && url != '') {
            openWebTiktok(url)
        } else {
            if (!app.launch('com.zhiliaoapp.musically')) {
                console.log('App 启动失败')
                return ''
            }
        }

        sleep(6000)
        comm.showLog('启动完成')
    }
    // if(type==3){
    //     type=1
    // }else if(type==4){
    //     type=2
    // }
    for (let i = 0; i < 30; i++) {

        if (i == 6 || i == 15) {
            httpShell('am force-stop com.zhiliaoapp.musically')
        }
        if (currentPackage().indexOf('com.zhiliaoapp.musically') == -1 || i == 6 || i == 15) {
            if (!app.launch('com.zhiliaoapp.musically')) {
                console.log('App 启动失败')
                return "tk启动失败"
            }
            comm.showLog('重启完成')
            sleep(5000)
        }
        //是否到达登录页
        closeAllPop()
        //
        let Sign_in_another_btn = selector().textContains('Sign in another').visibleToUser(true).findOne(1000)
        if (Sign_in_another_btn) {
            comm.showLogToFile("点击一下屏幕中心")
            click(device.width / 2, device.height / 2)
            sleep(3000)
        }
        let skipInterestBtn = selector().textContains('Skip').visibleToUser(true).findOne(1000)
        if (skipInterestBtn) {
            comm.showLog("跳过兴趣");
            comm.clickObj(skipInterestBtn)
            sleep(2000)
            let sx = random(1500, 1600)
            if (device.height < 1500) {
                sx = device.height - random(80, 150)
            }
            swipe(random(300, 330), sx, random(300, 330), random(100, 130), random(100, 300))
            sleep(1000)
            swipe(random(300, 330), sx, random(300, 330), random(100, 130), random(100, 300))
            sleep(1000)
            swipe(random(300, 330), sx, random(300, 330), random(100, 130), random(100, 300))
            sleep(1000)
        }
        let homeBtn = selector().textContains('Home').visibleToUser(true).findOne(1000)
        if (homeBtn) {
            sleep(3000)
            closeAllPop()
            // 暂时不知道下面代码有什么用
            if (type == 0) {
                break
            } else if (type == 3) {
                break
            } else {
                let meBtn = selector().textContains("Profile").visibleToUser(true).findOne(1000)
                if (meBtn) {
                    comm.showLog("点击个人中心");
                    comm.clickObj(meBtn)
                    sleep(3000)
                    let saveBtn = selector().textContains("Save").visibleToUser(true).findOne(3000)
                    if (saveBtn) {
                        comm.showLog("点击保存");
                        comm.clickObj(saveBtn)
                        sleep(2000)
                    }
                    let usernameText = selector().textContains(username).visibleToUser(true).findOne(5000)
                    if (usernameText) {
                        tkusername = username
                        break
                    }
                }
            }
        }
        let birthday_msg = selector().textContains('birth').exists()
        if (birthday_msg) {
            comm.showLog("birthday")
            sleep(3000)
            let log_in_btn = selector().textContains("have an account").visibleToUser(true).findOne(1000)
            if (!log_in_btn) {
                log_in_btn = selector().textContains("more great").visibleToUser(true).findOne(1000)
            }
            if (!log_in_btn) {
                let sign_up = selector().textContains('Sign up').visibleToUser(true).find()
                if (sign_up.length > 0) {
                    //comm.showLog(sign_up[sign_up.length-1].text())
                    let b = sign_up[sign_up.length - 1].bounds()
                    //comm.showLog('click:'+b.centerX()+','+b.centerY())
                    click(b.left + 20, b.centerY())
                    sleep(3000)
                    continue
                }
            }
            if (!log_in_btn) {
                log_in_btn = selector().textContains("Log in").visibleToUser(true).findOne(1000)
            }
            //let log_in_btn=selector().textContains('Log in').findOne(3000) 
            if (log_in_btn) {
                comm.showLog("点击登录");
                comm.clickObj(log_in_btn)
            }
            sleep(6000)
        }
        let is_login_page = selector().textContains('Log in to TikTok').visibleToUser(true).exists()
        if (is_login_page) {
            comm.showLog("当前页为: Log in to TikTok")
            if (type == 2 || type == 4) {
                //sleep(2000)
                let bottom_change = selector().textContains("have an account").visibleToUser(true).findOne(1000)
                if (bottom_change) {
                    comm.showLog("点击注册");
                    comm.clickObj(bottom_change)
                    break
                } else {
                    sleep(1000)
                    continue
                }
            } else {
                comm.showLog("需要登陆");
                // break
                return "需要登陆"
            }

        }
        let is_sign_page = selector().textContains('Sign up for TikTok').visibleToUser(true).exists()
        if (is_sign_page) {
            comm.showLog("当前页为: Sign up for TikTok")
            if (type == 1 || type == 3) {
                let bottom_change = selector().textContains("have an account").visibleToUser(true).findOne(1000)
                if (bottom_change) {
                    comm.showLog("点击注册");
                    comm.clickObj(bottom_change)
                    break
                }
            } else {
                break
            }
        }
        // Please try again     Retry
        let pta = selector().textContains('Please try again').visibleToUser(true).exists()
        let tal = selector().textContains('Try again later').visibleToUser(true).exists()
        if (pta || tal) {
            let retryBtn = selector().className('android.widget.Button').text('Retry').visibleToUser(true).findOne(1000)
            if (retryBtn) {
                comm.showLog("opentk,点一下Retry")
                comm.clickObj(retryBtn)
            }
        }
        // Not interested
        let notInterested = selector().textContains('Not interested').visibleToUser(true).exists()
        if (notInterested) {
            back()
        }
        // 按钮Not interested，检测弹窗内容问题
        notInterested = selector().textContains('You can redeem your').visibleToUser(true).exists()
        if (notInterested) {
            back()
        }
        sleep(3000)
    }
    comm.showLog(type == 1 ? "login" : type == 2 ? "register" : type == 3 ? "login" : type == 4 ? "register" : "none")
    sleep(1000)
    comm.showLog("打开Tiktok【完成】");
}

//关闭所有弹窗
function closeAllPop() {
    comm.showLog("检测关闭所有弹窗")
    try {
        //新弹窗
        if (selector().textContains('he higher you rank').visibleToUser(true).exists()) {
            let not_interestedBtn = selector().textContains('ot interested').visibleToUser(true).findOne(1000);
            if (not_interestedBtn) {
                comm.clickObj(not_interestedBtn)
                sleep(2000)
            }
        }
        //读取你的Facebook列表，接受个性化广告推送Give TikTok access to yourFacebook friends list and email?This will be used to improve yourexperience, including connectingyou with friends and personalizingyour ads. Learn more in the Help Center
        if (selector().textContains('acebook friends list').visibleToUser(true).exists()) {
            let do_not_allowBtn = selector().textContains('t allow').visibleToUser(true).findOne(1000);
            if (do_not_allowBtn) {
                comm.clickObj(do_not_allowBtn)
                sleep(2000)
            }
        }
        //登陆失效的一个，从下部弹出的弹窗Sign in another way，大概和谷歌相关
        if (selector().textContains('ign in another way').visibleToUser(true).exists()) {
            comm.showLog("点击一下屏幕中心")
            click(device.width / 2, device.height / 2)
            sleep(3000)
        }
        //链接电子邮件 通过链接您的Android电子邮件地址，帮助广告更相关地展示给您可能认识的人。
        if (selector().textContains('Link email').visibleToUser(true).exists()) {
            let notNowBtn = selector().textContains('Not now').visibleToUser(true).findOne(1000);
            if (notNowBtn) {
                comm.clickObj(notNowBtn)
                sleep(3000)
            }
        }
        //是否订阅某些东西的浏览
        if (selector().textContains('via SMS').visibleToUser(true).exists()) {
            let notNowBtn = selector().textContains('Not now').visibleToUser(true).findOne(1000);
            if (notNowBtn) {
                comm.clickObj(notNowBtn)
                sleep(3000)
            }
        }
        //Create a passkey 进入个人中心的有可能弹出谷歌页面
        if (selector().textContains('reate a passkey').visibleToUser(true).exists()) {
            let cancelBtn = selector().textContains('Cancel').visibleToUser(true).findOne(1000);
            if (cancelBtn) {
                comm.clickObj(cancelBtn)
                sleep(3000)
            }
        }
        //TikTok is more fun withfriends. By syncing yourohone contacts, you can findand get discovered by peopleyou know.   Don't allow
        let tikTokShopOffersBtn = selector().textContains('TikTok Shop Offers').visibleToUser(true).findOne(500);
        if (tikTokShopOffersBtn) {
            back()
            sleep(2000)
        }
        //text = Don’t allow   className = android.widget.Button
        //TikTok is more fun withfriends. By syncing yourohone contacts, you can findand get discovered by peopleyou know.   Don't allow
        let dtaBtn = selector().textContains('Don\'t allow').visibleToUser(true).findOne(500);
        if (dtaBtn) {
            comm.clickObj(dtaBtn)
            sleep(1000)
        }
        dtaBtn = selector().textContains('t allow').visibleToUser(true).findOne(500);
        if (dtaBtn) {
            comm.clickObj(dtaBtn)
            sleep(1000)
        }
        //显示是否创建tk个性化头像
        let getStartedBtn = selector().text('Get started').visibleToUser(true).findOne(1000)
        if (getStartedBtn) {
            comm.showLog("显示是否创建tk个性化头像")
            back()
            sleep(1000)
        }
        //是否同意新条款
        let AgreeBtn = selector().text('Agree').visibleToUser(true).findOne(1000)
        if (AgreeBtn) {
            comm.showLog("是否同意新条款")
            comm.clickObj(AgreeBtn)
            sleep(1000)
        }
        //是否接受个性化广告
        let AcceptBtn = selector().text('Accept').visibleToUser(true).findOne(1000)
        if (AcceptBtn) {
            comm.showLog("是否接受个性化广告弹窗")
            comm.clickObj(AcceptBtn)
            sleep(1000)
        }
        //新政策弹窗
        let cookieBtn = selector().textContains('cookies and similar').visibleToUser(true).findOne(1000)
        if (cookieBtn) {
            comm.showLog("浏览器显示cookie授权弹窗")
            let allowAll = selector().textContains('Allow all').visibleToUser(true).findOne(1000)
            if (allowAll) {
                comm.clickObj(allowAll)
            }
            sleep(1000)
        }
        //有一个选兴趣的弹窗
        let updateyourinterestsPop = selector().textContains('Update your interests').visibleToUser(true).findOne(1000)
        if (updateyourinterestsPop) {
            back()
            sleep(1000)
        }
        //新政策弹窗
        let newPolicy = selector().textContains('Got it').visibleToUser(true).findOne(1000)
        if (newPolicy) {
            comm.showLog("显示新的政策弹窗口")
            comm.clickObj(newPolicy)
            sleep(1000)
        }

        //新政策弹窗 Got it
        let newPolicy2 = idContains("x9o").visibleToUser(true).findOne(1000)
        if (newPolicy2 && newPolicy2.childCount() == 3) {
            comm.showLog("显示新的政策弹窗口+1")
            commm.clickObj(newPolicy2.child(2))
        }


        //新政策弹窗+1  Limited time event! Collect flowersto fill the gift box and gainrewards!
        let notInterestedBtn = selector().textContains('Not interested').visibleToUser(true).findOne(1000)
        if (notInterestedBtn) {
            comm.showLog("显示新的政策弹窗口+1")
            // back()
            comm.clickObj(notInterestedBtn)
            sleep(1000)
        }
        //个人中心首页Sign in to your Google Account tocreate passkeys
        let cancelBtn = selector().textContains('Cancel').visibleToUser(true).findOne(1000)
        if (cancelBtn) {
            comm.showLog("个人中心首页Sign in to your Google Account tocreate passkeys")
            comm.clickObj(cancelBtn)
            sleep(1000)
        }
        let dismissBtn = selector().textContains('Dismiss').visibleToUser(true).findOne(1000)
        if (dismissBtn) {
            comm.showLog("我们无法在抖音机里保存你的密钥。您可以在设置中创建一个新的密钥。")
            comm.clickObj(dismissBtn)
            sleep(1000)
        }
        if (selector().textContains('Complete a few personalized security').visibleToUser(true).exists()) {
            comm.showLog("安全检查")
            let completeContinue = selector().textContains('Continue').visibleToUser(true).findOne(1000)
            if (completeContinue) {
                comm.showLog("点一下Continue，五秒后back")
                comm.clickObj(completeContinue)
                sleep(5000)
                back()
            }
        }

        //尝试处理一个弹窗（Save login for next time?Log in to spoiled.cupid on thisdevice without needing to enteryour info. You can change this atany time in Settings.Not now/Save login）
        let slfnt = selector().textContains('Save login for next time').visibleToUser(true).findOne(1000);
        if (slfnt) {
            sleep(1000)
            comm.clickObj(selector().className("android.widget.Button").text('Save login').visibleToUser(true).findOne(1000))
        }

        let welcomeBack = selector().textContains('Welcome back').visibleToUser(true).findOne(1000)
        if (welcomeBack) {
            sleep(5000)
            back()
        }
        let termsApply = selector().textContains('Terms apply').visibleToUser(true).findOne(1000)
        if (termsApply) {
            sleep(5000)
            back()
        }
        // let claimBtn = selector().textContains('Claim').visibleToUser(true).findOne(1000)
        // if (claimBtn) {
        //     sleep(5000)
        //     comm.clickObj(claimBtn)
        // }
        let claimNow = selector().textContains('Claim now').visibleToUser(true).findOne(1000)
        if (claimNow) {
            sleep(5000)
            back()
        }
        claimNow = selector().textContains('On orders over').visibleToUser(true).findOne(1000)
        if (claimNow) {
            sleep(5000)
            back()
        }
        let cafpPop = selector().textContains('Complete a few personalized ').visibleToUser(true).findOne(1000);
        if (cafpPop) {
            comm.clickObj(selector().className("android.widget.Button").text('Continue').visibleToUser(true).findOne(1000))
            sleep(5000)
            back()
        }
        let gotit = selector().textContains('Got it').visibleToUser(true).findOne(1000);
        if (gotit) {
            comm.clickObj(gotit)
            sleep(2000)
        }
        let dacPop = selector().textContains(' days after claiming').visibleToUser(true).findOne(1000);
        if (dacPop) {
            sleep(2000)
            back()
        }
        let follFri = selector().textContains('Follow your friends').visibleToUser(true).findOne(1000)
        if (follFri) {
            comm.showLog("有弹窗follFri")
            click(30, 100)
        }
        let securityCheckupPop = selector().textContains('Security checkup').visibleToUser(true).findOne(1000);
        if (securityCheckupPop) {
            back()
        }
        //
        let madr = selector().textContains('Message and data rates').visibleToUser(true).findOne(1000);
        if (madr) {
            sleep(1000)
            comm.clickObj(selector().className("android.widget.Button").text('Not now').visibleToUser(true).findOne(1000))
        }
        //
        // 按钮 Not interested （上面这条似乎没有效果）
        let notInterested = selector().textContains('Not interested').visibleToUser(true).exists()
        if (notInterested) {
            back()
        }
        // 按钮Not interested，检测弹窗内容问题
        notInterested = selector().textContains('You can redeem your').visibleToUser(true).exists()
        if (notInterested) {
            back()
        }
        let notInterested1 = selector().textContains('Not interested').visibleToUser(true).exists()
        if (notInterested1) {
            comm.clickObj(notInterested1)
        }
        // 可能会出现的滑块
        /*
        comm.showLogToFile("判断有没有滑块验证码closeAllPop")
        imageCodeVerify_Buy()
        comm.showLogToFile("滑块验证码结束closeAllPop")
        */

        //
        let closeBtnn = selector().textContains('Follow your friends').visibleToUser(true).findOne(1000);
        if (closeBtnn) {
            sleep(500)
            click(1187, 582)
        }
        //new add
        let faceBookText = selector().textContains("FaceBook").visibleToUser(true).findOne(500);
        if (faceBookText) {

            let skipbtn = selector().text("Skip").visibleToUser(true).findOne(500);
            if (skipbtn) {
                comm.clickObj(skipbtn);
                sleep(1000)
            }

        }

        //syncing your phone contacts
        let syncingYourPhoneContacts = selector().textContains("syncing your phone contacts").visibleToUser(true).findOne(500);
        if (syncingYourPhoneContacts) {
            let okBtn = selector().text("OK").visibleToUser(true).findOne(500);
            if (okBtn) {
                comm.clickObj(okBtn);
                sleep(1000)
            }

        }
        //
        let friendText = selector().textContains("with friends").visibleToUser(true).findOne(500);
        if (friendText) {
            let skipbtn = selector().text("Skip").visibleToUser(true).findOne(500);
            if (skipbtn) {
                comm.clickObj(skipbtn);
                sleep(1000)
            }
        }
        let skipffText = selector().textContains('Skip finding Facebook').visibleToUser(true).exists()
        if (skipffText) {
            let skipBtn = selector().text('Skip').visibleToUser(true).findOne(1000)
            if (skipBtn) {
                comm.clickObj(skipBtn)
                sleep(2500)
            }
        }
        let skipText = selector().textContains('Skip').visibleToUser(true).exists()
        if (skipText) {
            let skipInterestBtn = selector().textContains('Skip').visibleToUser(true).findOne(1000)
            if (skipInterestBtn) {
                comm.clickObj(skipInterestBtn)
                sleep(2500)
                skipInterestBtn = selector().textContains('Skip').visibleToUser(true).findOne(1000)
                if (skipInterestBtn) {
                    comm.clickObj(skipInterestBtn)
                    sleep(2000)
                }
                for (let i = 0; i < 3; i++) {
                    swipe(random(300, 330), random(1500, 1600), random(300, 330), random(100, 130), random(100, 300))
                    sleep(1000)
                }
            }
        }
        let friendsText = selector().textContains('friends').visibleToUser(true).exists()
        if (friendsText) {
            let doneBtn = selector().textContains('Done').visibleToUser(true).findOne(100)
            if (doneBtn) {
                comm.clickObj(doneBtn)
            }
            doneBtn = selector().textContains('DONE').visibleToUser(true).findOne(100)
            if (doneBtn) {
                comm.clickObj(doneBtn)
            }
        }

        let retryBtn = selector().textContains('Retry').findOne(1000)
        if (retryBtn) {
            sleep(1000)
            comm.clickObj(retryBtn)
            sleep(6000)
        }
        let agreebtn = selector().textContains('I agree').visibleToUser(true).find()
        if (agreebtn.length > 0) {
            sleep(1000)
            comm.showLog("找到:I agree")
            comm.clickObj(agreebtn[agreebtn.length - 1])
            sleep(1000)
            swipe(random(300, 330), random(1500, 1600), random(300, 330), random(100, 130), random(100, 300))
            sleep(1000)
            swipe(random(300, 330), random(1500, 1600), random(300, 330), random(100, 130), random(100, 300))
            sleep(1000)
        }

        let review_account = selector().textContains('eview your').visibleToUser(true).exists()
        if (review_account) {
            let remind_me_later = selector().textContains('Remind me').visibleToUser(true).findOne(1000)
            if (remind_me_later) {
                comm.clickObj(remind_me_later)
            }
        }
        let personalizedads = selector().textContains('personalized ads').visibleToUser(true).exists()
        if (personalizedads) {
            let accepts = selector().textContains('Accept').visibleToUser(true).find()
            if (accepts.length > 1) {
                comm.clickObj(accepts[accepts.length - 1])
            }
        }
        let lastSwipeUp = selector().textContains('Swipe up').visibleToUser(true).exists()
        if (lastSwipeUp) {
            let sx = random(1500, 1600)
            if (device.height < 1500) {
                sx = device.height - random(300, 350)
            }
            swipe(random(300, 330), sx, random(300, 330), random(100, 130), random(100, 300))
            sleep(1000)
            swipe(random(300, 330), sx, random(300, 330), random(100, 130), random(100, 300))
            sleep(1000)
        }
        let languages_understand = selector().textContains('anguages do you understand').visibleToUser(true).exists()
        if (languages_understand) {
            let confirmBtn = selector().textContains("Confirm").visibleToUser(true).findOne(1000)
            comm.clickObj(confirmBtn)
        }

        let str = "Agree and continue"
        let oo = selector().textContains(str).visibleToUser(true).find()
        if (oo && oo.length > 0) {
            sleep(1000)
            console.log("找到:" + str)
            comm.clickObj(oo[oo.length - 1])
            sleep(1000)
        }
        str = "TikTok is now available"
        oo = selector().textContains(str).visibleToUser(true).find()
        if (oo && oo.length > 0) {
            sleep(1000)
            console.log("找到:" + str)
            comm.clickObj(selector().textContains("Dismiss").visibleToUser(true).findOne(1000))
            sleep(1000)
        }
        str = "Select both"
        oo = selector().textContains(str).visibleToUser(true).find()
        if (oo && oo.length > 0) {
            sleep(1000)
            console.log("找到:" + str)
            comm.clickObj(selector().textContains("Continue").visibleToUser(true).findOne(1000))
            sleep(1000)
        }
        str = "updating our"
        oo = selector().textContains(str).visibleToUser(true).find()
        if (oo && oo.length > 0) {
            sleep(1000)
            console.log("找到:" + str)
            comm.clickObj(selector().textContains("OK").visibleToUser(true).findOne(1000))
            sleep(1000)
        }

        str = "FaceBook"
        oo = selector().textContains(str).visibleToUser(true).find()
        if (oo && oo.length > 0) {
            sleep(1000)
            console.log("找到:" + str)
            comm.clickObj(selector().textContains("FaceBook").visibleToUser(true).findOne(1000))
            sleep(1000)
        }
        str = "Allow tren"
        oo = selector().textContains(str).visibleToUser(true).find()
        if (oo && oo.length > 0) {
            sleep(1000)
            console.log("找到:" + str)
            comm.clickObj(selector().textContains("Allow").visibleToUser(true).findOne(1000))
            sleep(1000)
        }
        str = "Update of Privacy Policy"
        oo = selector().textContains(str).visibleToUser(true).find()
        if (oo && oo.length > 0) {
            sleep(1000)
            console.log("找到:" + str)
            comm.clickObj(selector().textContains("OK").visibleToUser(true).findOne(1000))
            sleep(1000)
        }

        str = "t allow"
        oo = selector().textContains(str).visibleToUser(true).find()
        if (oo && oo.length > 0) {
            sleep(1000)
            console.log("找到:" + str)
            comm.clickObj(oo[oo.length - 1])
            sleep(1000)
        }
        str = "Not now"
        oo = selector().textContains(str).visibleToUser(true).find()
        if (oo && oo.length > 0) {
            sleep(1000)
            console.log("找到:" + str)
            comm.clickObj(oo[oo.length - 1])
            sleep(1000)
        }

        str = "Got it"
        oo = selector().textContains(str).visibleToUser(true).find()
        if (oo && oo.length > 0) {
            sleep(1000)
            console.log("找到:" + str)
            comm.clickObj(oo[oo.length - 1])
            sleep(1000)
        }

    } catch (e) {
        console.log('检查是否有弹窗并进行处理错误')
        console.log(e)
    }
}
function selectTkBirthday2() {

    //设置出生年月日

    sleep(1000)
    let seekBars = selector().visibleToUser(true).className('android.widget.SeekBar').find()
    comm.showLog("seekBars " + seekBars.length)
    for (let i = 0; i < seekBars.length; i++) {
        let child = seekBars[i];
        //屏幕上滑
        //let btnWidth = child.bounds().right - child.bounds().left - 50
        //let btnHeight = child.bounds().bottom - child.bounds().top - 80
        let currentBtnX = child.bounds().centerX()
        //- random((0 - btnWidth) / 2, btnWidth / 2)

        //comm.showLog(currentBtnX+","+currentBtnY)
        //- random((0 - btnHeight) / 2 , btnHeight / 2)
        let swipeCount = 6
        if (i === 0) {
            swipeCount = random(3, 5)
        } else if (i === 1) {
            swipeCount = random(1, 5)
        } else if (i === 2) {
            swipeCount = random(1, 3)
        }
        for (j = 0; j < swipeCount; j++) {
            let currentBtnY = child.bounds().centerY() - (random(80, 100))
            swipe(currentBtnX, currentBtnY, currentBtnX, child.bounds().bottom + random(100, 123), random(500, 700))
            sleep(random(100, 500))
        }
        if (child.desc().indexOf("Year") > -1) {

            for (let k = 0; k < 15; k++) {
                sleep(1000)
                let editText = selector().className('android.widget.EditText').visibleToUser(true).findOne(1000)
                let ymd = editText.text()
                let y = parseInt(ymd.substring(ymd.length - 4));
                if (y >= 2014) {
                    comm.showLog("年龄太小:" + y)
                    let currentBtnY = child.bounds().centerY() - (random(80, 100))
                    swipe(currentBtnX, currentBtnY, currentBtnX, child.bounds().bottom + random(100, 108), random(500, 700))
                    sleep(random(100, 500))
                } else {
                    comm.showLog("年龄通过:" + y)
                    break
                }
            }
        }
        sleep(1000)
    }

    let registerNextBtn = selector().visibleToUser(true).textContains('Next').findOne(10000)
    if (!registerNextBtn) {
        toastLog('注册选完年龄下一步控件未找到')
        return '注册选完年龄下一步控件未找到'
    }
    comm.clickObj(registerNextBtn)
    sleep(6000)
    let result = false
    let fcnt = 0
    for (let index = 0; index < 10; index++) {

        let letsgo = selector().textContains("s go").visibleToUser(true).findOne(1000)
        if (letsgo) {
            comm.clickObj(letsgo)
            result = true
            break
        }
        let password = selector().textContains("password").visibleToUser(true).findOne(1000)
        if (password) {
            result = true
            break
        }
        let nickname = selector().textContains("nickname").visibleToUser(true).findOne(1000)
        if (nickname) {
            result = true
            break
        }
        let username = selector().textContains("username").visibleToUser(true).findOne(1000)
        if (username) {
            result = true
            break
        }
        let phone = selector().textContains("Phone").visibleToUser(true).findOne(1000)
        let email = selector().textContains("Email").visibleToUser(true).findOne(1000)
        if (email && phone) {
            result = true
            break
        }
        registerNextBtn = selector().visibleToUser(true).textContains('Next').findOne(1000)
        if (registerNextBtn) {
            if (fcnt > 3) {
                break
            }
            comm.clickObj(registerNextBtn)
            toastLog("重新点击next")
            sleep(6000)
            fcnt++
        }
    }
    return result
}
function selectTkBirthday(task_id) {
    //设置出生年月日
    sleep(1000)
    let seekBars = selector().visibleToUser(true).className('android.widget.SeekBar').find()
    comm.showLog("seekBars " + seekBars.length)
    let x_1 = 0
    let y_1 = 0
    let x_2 = 0
    let y_2 = 0
    let yearChild = 2//默认美国版年龄控件为第3个
    for (let i = 0; i < seekBars.length; i++) {
        let child = seekBars[i];
        //屏幕上滑
        //let btnWidth = child.bounds().right - child.bounds().left - 50
        //let btnHeight = child.bounds().bottom - child.bounds().top - 80
        let currentBtnX = child.bounds().centerX()
        //- random((0 - btnWidth) / 2, btnWidth / 2)

        //comm.showLog(currentBtnX+","+currentBtnY)
        //- random((0 - btnHeight) / 2 , btnHeight / 2)
        let swipeCount = 6
        //默认年龄控件为2  第三个子控件
        if (yearChild > 0) {
            if (i === 0) {
                swipeCount = random(3, 5)
            } else if (i === 1) {
                swipeCount = random(1, 5)
            } else if (i === 2) {
                swipeCount = random(4, 10)
            }
        } else {
            if (i === 1) {
                swipeCount = random(1, 5)
            } else if (i === 2) {
                swipeCount = random(3, 5)
            }
        }

        if (i == 1) {
            x_1 = currentBtnX
            y_1 = child.bounds().centerY() - (random(50, 100))
            x_2 = currentBtnX
            y_2 = child.bounds().bottom + random(150, 200)
        }
        for (let j = 0; j < swipeCount; j++) {
            let currentBtnY = child.bounds().centerY() - (random(50, 100))
            swipe(currentBtnX, currentBtnY, currentBtnX, child.bounds().bottom + random(150, 200), random(500, 700))
            sleep(random(100, 500))
        }

        //每次循环都获取一次年龄  年龄控件默认为2024 不在范围内则代表刚刚变动 如果年龄不在需求范围内则代表当前子控件是年龄控件  调整至需求范围
        let editText = selector().className('android.widget.EditText').visibleToUser(true).findOne(1000)
        let year = parseInt(editText.text().match(/\d{4}/g));
        if (year < 2024 && year > 2004) {
            //如果年龄子控件为第一个则
            if (i == 0) {
                yearChild = 0
                swipeCount = random(4, 10)
                for (let j = 0; j < swipeCount; j++) {
                    let currentBtnY = child.bounds().centerY() - (random(50, 100))
                    swipe(currentBtnX, currentBtnY, currentBtnX, child.bounds().bottom + random(150, 200), random(500, 700))
                    sleep(random(100, 500))
                }
            }

            for (let k = 0; k < 15; k++) {
                sleep(1000)
                let editText = selector().className('android.widget.EditText').visibleToUser(true).findOne(1000)
                let year = parseInt(editText.text().match(/\d{4}/g));
                if (year > 2004) {
                    comm.showLog("年龄太小:" + year)
                    let currentBtnY = child.bounds().centerY() - (random(100, 200))
                    swipe(currentBtnX, currentBtnY, currentBtnX, child.bounds().bottom + random(150, 200), random(500, 700))
                    sleep(random(100, 500))
                } else {
                    comm.showLog("年龄通过:" + year)
                    break
                }
            }
        }
        sleep(1000)
    }

    let continueBtn = boundsInside(0, device.height / 2, device.width, device.height).className("android.widget.Button").clickable().visibleToUser(true).findOne(1000)
    if (continueBtn) {
        comm.clickObj(continueBtn)
        sleep(3000)
    } else {
        let continueBtnU = idContains("a8o").className("android.widget.Button").clickable().visibleToUser(true).findOne(1000)
        if (continueBtnU) {
            comm.clickObj(continueBtnU)
            sleep(3000)
        } else {
            comm.showLog("获取不到continueBtn")
        }
    }


    let registerNextBtn = selector().visibleToUser(true).textContains('Next').findOne(10000)
    if (!registerNextBtn) {
        toastLog('注册选完年龄下一步控件未找到')
        return '注册选完年龄下一步控件未找到'
    }

    comm.clickObj(registerNextBtn)
    sleep(6000)
    let result = false
    let fcnt = 0
    for (let index = 0; index < 10; index++) {
        let password = selector().textContains("password").visibleToUser(true).findOne(2000)
        if (password) {
            result = true
            break
        }
        let nickname = selector().textContains("nickname").visibleToUser(true).findOne(2000)
        if (nickname) {
            result = true
            break
        }
        let phone = selector().textContains("Phone").visibleToUser(true).findOne(1000)
        let email = selector().textContains("Email").visibleToUser(true).findOne(1000)
        if (email && phone) {
            result = true
            break
        }
        registerNextBtn = selector().visibleToUser(true).textContains('Next').findOne(1000)
        if (registerNextBtn) {
            if (fcnt > 3) {
                break
            }
            swipe(x_1, y_1, x_2, y_2, random(500, 700))
            sleep(2000)
            //   comm.showLog('开始切换ip')
            //   comm.httpToString(httpServer+'/api/setProxy?client_no='+client_no+'&key=63347f5d946164a23faca26b78a91e1c&task_id='+task_id)
            //   sleep(2000)
            comm.clickObj(registerNextBtn)
            toastLog("重新点击next")
            sleep(6000)
            fcnt++
        }
    }
    return result
}
function heartPing() {

    heartPingRunThread = threads.start(function () {
        let i = 0;
        device.keepScreenOn()
        device.keepScreenDim()
        while (true) {
            //app.startActivity("console");

            if (device_id == 'VCZB10213234074_03') {
                break
            }

            if (currentActivity().indexOf("ScriptExecuteActivity") > -1) {
                app.startActivity("console");
            }
            try {
                if (i == 0 || i % 100 == 0) {
                    console.log('发送心跳*****')
                    if (clientNo !== "" && accountNo !== "") {
                        comm.httpToString(httpServer + "/api/heart?client_no=" + clientNo + "&key=63347f5d946164a23faca26b78a91e1c")
                    }
                }
                sleep(500)
            } catch (e) {
                console.log('发送心跳发送错误')
                console.log(e)
                sleep(1000)
                break
            }
            i++;
        }
    });

}
function monitor_task() {
    monitorRunThread = threads.start(function () {
        device.keepScreenOn()
        device.keepScreenDim()
        while (true) {
            try {

                sleep(15000)
                if (monitor_status == 1) {
                    comm.showLog('直播监控中')
                    let imageVerifyTips = selector().textContains('Verify to continue:').visibleToUser(true).findOne(1000)
                    if (imageVerifyTips) {
                        comm.showLog('需要滑块图片验证码')
                        imageCodeVerify(false)
                        sleep(30000)
                    } else {
                        sleep(5000)
                    }
                }
            } catch (error) {
                console.log(error)
            }
        }
    })

}

function imageCodeVerify2(isEmailRegister, isMobile) {

    let limitTimes = 0
    let tryTimes = 0
    while (true) {

        if (limitTimes > 15) {
            console.log('验证码初步加载超过时间,重新设置代理')
            limitTimes = 0
            sleep(1000)
            back()
            sleep(500)
            back();
            sleep(1000)
            let emailNext = selector().textContains('Next').visibleToUser(true).findOne(2000)
            if (emailNext) {
                comm.clickObj(emailNext)
            }
            tryTimes++
        }
        let dragThePuzzle = selector().textContains('Drag the puzzle').visibleToUser(true).exists()
        if (dragThePuzzle) {
            break
        }
        let codeTip = selector().textContains("6-digit").findOne(1000);
        if (codeTip) {
            return 'success';
        }

        let select2Text = selector().textContains("Select 2 objects").visibleToUser(true).findOne(1000)
        if (select2Text) {
            comm.showLog("Select 2 objects")

        } else {
            let imageVerifyTips = selector().textContains('Verify to continue:').visibleToUser(true).findOne(1000)
            if (imageVerifyTips) {
                break
            }
        }
        let verifyAppearLoading = selector().bounds(485, 992, 595, 1102).visibleToUser(true).enabled(true).exists()
        if (!verifyAppearLoading) {
            console.log('图片验证码出现前的loading控件不存在')
            break
        }
        console.log('图片验证码出现前的loading控件存在')

        let refreshBtn = selector().textContains('Refresh').visibleToUser(true).findOne(1000)
        if (!refreshBtn) {
            refreshBtn = selector().idContains('refresh-button').visibleToUser(true).findOne(1000)
        }
        if (refreshBtn) {
            break
        }
        if (limitTimes == 3 && !isEmailRegister) {

            back();
            sleep(1000)
            back();
            sleep(2000)
            let forgotText = selector().textContains("Forgot pass").findOne(6000)
            b = forgotText.bounds()
            y = b.centerY() + 123
            let xxx = b.centerX() + 300;
            click(xxx, y)
            sleep(3000)
        }
        if (limitTimes > 20) {
            return "验证超时"
        }
        sleep(1000)
        limitTimes++
        if (isMobile) {

            let select2Text = selector().textContains("Select 2 objects").visibleToUser(true).findOne(15000)
            let imageVerifyTips = selector().textContains('Verify to continue:').visibleToUser(true).findOne(5000)
            if (imageVerifyTips) {
                break
            }
            select2Text = selector().textContains("Select 2 objects").visibleToUser(true).findOne(15000)
            if (select2Text) {
                comm.showLog("Select 2 objects")
                break
            } else if (limitTimes == 2) {

                back();
                sleep(500)
                back();
                sleep(2000)
                let sendCode = selector().textContains("Send code").visibleToUser(true).findOne(5000);
                if (sendCode) {

                    comm.clickObj(sendCode)
                    continue;
                }
            }
            if (limitTimes > 5) {
                return "验证超时"
            }
        }

        if (tryTimes >= 5) {

            console.log('验证码初步加载超过重新设置代理次数,任务失败')
            return '验证码初步加载超过重新设置代理次数,任务失败'
        }
    }
    //刷新按钮
    let refreshBtn = selector().textContains('Refresh').visibleToUser(true).findOne(1000)
    // if (!refreshBtn) {

    //     refreshBtn = selector().textContains('Reload').visibleToUser(true).findOne(3000)
    //     if(!refreshBtn)
    //     {
    //         refreshBtn = selector().idContains('refresh-button').visibleToUser(true).findOne(3000)      
    //     }
    //     if(!refreshBtn){
    //         console.log('刷新验证码图片按钮控件未找到')
    //         return '刷新验证码图片按钮控件未找到'
    //     }                 
    // }
    let select2Text = selector().textContains("Select 2 objects").visibleToUser(true).findOne(100)
    if (select2Text) {
        return select2ImageVcode();
    }
    while (true) {
        let dragThePuzzle = selector().textContains('Drag the puzzle').visibleToUser(true).exists()
        if (dragThePuzzle) {
            break
        }
        let imageVerifyTips = selector().textContains('Verify to continue:').visibleToUser(true).findOne(2000)
        if (!imageVerifyTips) {

            console.log('图片验证码未找到')
            //这里可能是网络原因,图片未加载出来
            let networkErr = selector().textContains('Please try again').visibleToUser(true).exists()
            if (networkErr && refreshBtn) {

                console.log('出现网络问题,点击刷新重试')
                comm.clickObj(refreshBtn)

            } else {
                return '图片验证码未找到'
            }

        } else {
            //sleep(random(1500, 3000))
            break
        }
        //sleep(5000)
    }

    let loadingTimeLimit = 0
    let loadingMustTime = 0
    let ffcnt = 0;

    while (true) {

        let imageLoading = selector().textContains('Loading').exists()
        if (!imageLoading) {

            console.log('验证码图片已加载出来')
            sleep(5000)
            //判断一下是否由于网络原因未加载出来图片
            let networkErrorInImageLoadingExist = selector().textContains('Network issue. Please try again.').visibleToUser(true).exists()
            let noInternetConnectExist = selector().textContains('No internet connection. Please try again').visibleToUser(true).exists()
            if (networkErrorInImageLoadingExist || noInternetConnectExist) {

                console.log('出现无出现无网络提示')
                //再次设置一下代理 
                //点击refresh
                comm.clickObj(refreshBtn)
                sleep(1500)

            } else {
                let dragThePuzzle = selector().textContains('Drag the puzzle').visibleToUser(true).exists()
                //全部加载出来了
                let captchaImage = selector().idContains('captcha-verify-image').visibleToUser(true).findOne(1000)
                let VerifyContinue = dragThePuzzle ? null : selector().textContains('Verify to continue:').visibleToUser(true).findOne(1000)
                let Drag_the = dragThePuzzle ? null : selector().textContains('Drag the puzzle').visibleToUser(true).findOne(1000)
                if (!dragThePuzzle) {
                    captchaImage = selector().idContains('captcha-verify-image').visibleToUser(true).findOne(10000)
                    if (captchaImage) {
                        comm.showLog('找到找到元素：captchaImage')
                    } else {
                        comm.showLog('未找到元素：captchaImage')
                    }
                }
                let imgErr = selector().textContains('Please try again').visibleToUser(true).exists()
                if (imgErr) {
                    console.log('出现网络问题,点击刷新重试')
                    comm.clickObj(refreshBtn)
                    sleep(20000)
                    for (let l = 0; l < 6; l++) {
                        imageLoading = selector().textContains('Loading').exists()
                        if (!imageLoading) {
                            break
                        } else {
                            sleep(6000)
                        }
                    }
                    continue
                }
                comm.showLog("开始截图");
                //检测二维码图片加载完成
                let capImg = sysScreenCapture();
                comm.showLog("开始切割图片");
                let x = 130
                let y = 523
                let w = 469
                let h = 291
                if (VerifyContinue != null && Drag_the != nu && VerifyContinue && Drag_the) {
                    x = VerifyContinue.bounds().left
                    y = VerifyContinue.bounds().bottom + 26//拖动
                    w = device.width - VerifyContinue.bounds().left - VerifyContinue.bounds().left
                    h = Drag_the.bounds().top - VerifyContinue.bounds().bottom - 100
                } else if (captchaImage) {
                    x = captchaImage.bounds().left
                    y = captchaImage.bounds().top
                    w = device.width - captchaImage.bounds().left - captchaImage.bounds().left
                    h = captchaImage.bounds().bottom - captchaImage.bounds().top
                }
                console.log("x:" + x + " y:" + y + " w:" + w + " h:" + h)
                for (let c = 0; c < 10; c++) {

                    capImg = images.read("/sdcard/tk.png")
                    if (!capImg) {
                        comm.showLog("fuck_" + c)
                        sleep(3000)
                    } else {
                        break
                    }
                }
                capImg = images.clip(capImg, x, y, w, h);
                let base64 = images.toBase64(capImg, 'jpg', 80);
                if (base64.length > 3000) {

                    try {
                        comm.showLog("滑块图片大小：" + base64.length);
                        let token = "Hhe8XEYDbYPEiYbeS1eKW0iUdX5jAaR+z6a3Fm3Ii34";
                        let verify_type = "20110";
                        let dRes = http.postJson("http://70.39.126.2:8089/api/YdmVerify", { base64: base64, token: token, verify_type: verify_type })
                        //let dRes=http.postJson("http://174.128.224.122:8092/api/YdmVerify",{base64:base64})
                        let rString = dRes.body.string()
                        console.log(rString)
                        let yJson = JSON.parse(rString);

                        if (yJson.code == 10000) {

                            comm.showLog("验证码解析成功,开始模拟滑动")
                            let randomTime = random(1500, 2100);
                            let secsdkCaptDrag = selector().idContains('secsdk-captcha-drag-wrapper').visibleToUser(true).findOne(1000)
                            if (!secsdkCaptDrag) {
                                console.log('验证码滑块按钮控件未找到')
                            }
                            let pos = []
                            if (yJson.code == 10000) {
                                let sp = parseInt(yJson.data.data)
                                let startX = random(145, 198)//剪头的x坐标
                                let startY = 840//剪头的y坐标
                                if (secsdkCaptDrag) {
                                    let secsdkCapBounds = secsdkCaptDrag.bounds()
                                    startX = secsdkCapBounds.left + random(0, 100);
                                    startY = random(secsdkCapBounds.top, secsdkCapBounds.bottom);
                                } else {
                                    sp = sp * 77 / 100//todo 需要计算
                                }

                                pos.push([startX, random(startY - 2, startY + 2)]);
                                pos.push([startX + sp, random(startY - 2, startY + 2)]);
                            } else {
                                sleep(3000)
                                continue
                            }
                            gesture(randomTime, pos)
                            sleep(3000)
                            //如果是邮箱注册,走下面的逻辑
                            if (isEmailRegister) {
                                for (var i = 0; i < 15; i++) {

                                    console.log("正在检查...是否到达 Create password 页");
                                    let createPasswordPage = selector().textContains('Create password').findOne(1000)
                                    if (createPasswordPage) {
                                        comm.showLog("滑块验证成功,到达创建密码页");
                                        return 'success';
                                    }
                                    console.log("正在检查...是否到达 输入验证码 页");
                                    let codeTip = selector().textContains("6-digit").findOne(1000)
                                    if (codeTip) {

                                        comm.showLog("滑块验证成功,需要验证码");
                                        return 'success';
                                    }
                                }

                                let createPasswordPage = selector().textContains('Create password').findOne(1000)
                                let codeTip = selector().textContains("6-digit").findOne(1000)
                                if (!createPasswordPage && !codeTip) {

                                    //console.log('创建密码页面未找到')
                                    //判断是否还在验证码页面
                                    let refreshBtnExist = selector().textContains('Reload').visibleToUser(true).exists()
                                    if (refreshBtnExist) {
                                        console.log('刷新按钮还存在,还位于验证码页面,进行重试')
                                        comm.clickObj(refreshBtn)
                                        sleep(10000)
                                    } else {

                                        //判断是否还在邮箱输入页面,验证码验证通过了而由于网络问题导致没跳转过去
                                        let pageInEmailInputExists = selector().textContains('Next').visibleToUser(true).exists()
                                        if (pageInEmailInputExists) {

                                            console.log('处于输入邮箱页面')
                                            //再次设置一下代理 
                                            let pageInEmailInput = selector().textContains('Next').visibleToUser(true).findOne(5000)
                                            comm.clickObj(pageInEmailInput)
                                            sleep(1500)
                                            break
                                        } else {
                                            console.log('不处于输入邮箱页面')
                                        }
                                        //判断号是否已经注册过了
                                        let youAreAlreadySignPag = selector().textContains('You\'ve already signed up').enabled(true).visibleToUser(true).exists()
                                        if (youAreAlreadySignPag) {
                                            console.log('该邮箱账号已被注册过')
                                            return '该邮箱账号已被注册过'
                                        }

                                        createPasswordPage = selector().textContains('Create password').findOne(10000)
                                        if (createPasswordPage) {
                                            comm.showLog("滑块验证完成")
                                            break
                                        }
                                        codeTip = selector().textContains("6-digit").findOne(10000)
                                        if (codeTip) {
                                            comm.showLog("滑块验证完成")
                                            break
                                        }
                                    }
                                } else {
                                    let imageVerifyTips = selector().textContains('Verify to continue:').visibleToUser(true).findOne(2000)
                                    if (!imageVerifyTips) {

                                        comm.showLog("滑块验证完成")
                                        break
                                    } else {
                                        comm.showLog("Verify to continue 111 ")
                                    }
                                }
                            } else {
                                sleep(2000)
                                let imageVerifyTips = selector().textContains('Drag the puzzle').visibleToUser(true).findOne(1000)
                                if (!imageVerifyTips) {
                                    imageVerifyTips = selector().textContains('Verify to continue:').visibleToUser(true).findOne(1000)
                                }
                                for (let k = 0; k < 5; k++) {

                                    if (imageVerifyTips) {
                                        sleep(3000)
                                        imageVerifyTips = selector().textContains('Drag the puzzle').visibleToUser(true).findOne(1000)
                                        if (!imageVerifyTips) {
                                            imageVerifyTips = selector().textContains('Verify to continue:').visibleToUser(true).findOne(1000)
                                        }
                                    } else {
                                        break
                                    }
                                }
                                if (!imageVerifyTips) {

                                    comm.showLog("滑块验证完成")
                                    break
                                } else {
                                    comm.showLog("验证失败，重新验证")
                                    //sleep(5000) 
                                    continue
                                }
                            }
                        } else {
                            let codeTip = selector().textContains("6-digit").findOne(10000)
                            if (codeTip) {
                                comm.showLog("滑块验证完成")
                                return 'success'
                            }
                            comm.showLog("验证码解析失败")
                            //刷新验证码重试
                            comm.clickObj(refreshBtn)
                            sleep(10000)
                        }

                    } catch (e) {
                        console.log('发生错误')
                        console.log(e)
                        ffcnt++
                        if (ffcnt > 5) {
                            return "发生错误"
                        } else {
                            sleep(5000)
                        }
                    }

                } else {

                    comm.showLog('没有图片')
                    //刷新验证码
                    comm.clickObj(refreshBtn)
                    sleep(10000)
                }
            }
        } else {

            if (loadingMustTime > 5) {
                return "验证码图片未加载出来"
            }
            if (loadingTimeLimit >= 20) {
                loadingTimeLimit = 0
                loadingMustTime++
                //点击refresh
                comm.clickObj(refreshBtn)
                sleep(10000)

            } else {
                console.log('验证码图片未加载出来')
                loadingTimeLimit++
                sleep(1500)
            }
        }
    }
    //判断验证码是否还在
    let timeLimitImageVefiry = 0
    while (true) {

        let imageVerifyTipsExist = selector().textContains('Verify to continue:').enabled(true).visibleToUser(true).exists()
        if (!imageVerifyTipsExist) {
            imageVerifyTipsExist = selector().textContains('Drag the puzzle').visibleToUser(true).exists()
        }
        if (!imageVerifyTipsExist) {
            console.log('验证码图片验证完之后不存在')
            break
        }
        if (timeLimitImageVefiry > 30) {
            console.log('验证码图片验证完之后还存在,超出时间限制')
            return '验证码图片验证完之后还存在'
        }
        timeLimitImageVefiry++
        console.log('验证码图片验证完之后还存在')
        sleep(1500)
    }
    return 'success'
}
function goTextContains(txt, type) {
    let finded = false
    let existsTxt = selector().textContains(txt).visibleToUser(true).findOne(1000)
    if (existsTxt) {
        comm.showLog('找到' + txt)
        return true
    }
    let sx = random(1500, 1600)
    let sx2 = random(1230, 1250)
    if (device.height < 1500) {
        sx = device.height - random(300, 350)
        sx2 = sx - random(300, 350)
        //sy=random(300, 330)
    }
    if (type == 1) {
        //向上找
        for (let i = 0; i < 10; i++) {
            let paymentMsg = selector().textContains(txt).visibleToUser(true).findOne(500)
            if (!paymentMsg) {
                swipe(random(550, 600), random(300, 310), random(550, 600), random(800, 810), 430)
                sleep(500)
            } else {
                comm.showLog('找到' + txt)
                finded = true
                break
            }
        }
        sleep(500)
        swipe(random(550, 600), random(300, 310), random(550, 600), random(500, 510), random(300, 430))
    } else {
        let cnt = type == 4 ? 15 : 10
        if (type == 6) {
            cnt = 6
        }

        //let sy=random(550, 600)

        //向下找
        for (let i = 0; i < cnt; i++) {
            let paymentMsg = selector().textContains(txt).visibleToUser(true).findOne(500)
            if (!paymentMsg) {
                let x = random(550, 600)
                let y = sx
                let x1 = random(550, 600)
                let y1 = sx2
                comm.showLog(x + "," + y + " " + x1 + "," + y1)
                swipe(x, y, x1, y1, 430)
                sleep(500)
            } else {
                comm.showLog('找到' + txt)
                finded = true
                break
            }
        }
        sleep(500)
        if (type == 6) {
            return finded
        }
        if (type == 3) {
            swipe(random(550, 600), sx, random(550, 600), random(350, 360), 430)
        } else {
            swipe(random(550, 600), sx, random(550, 600), sx2, 430)
        }

    }
    return finded
}
function initConfig() {
    // comm.showLog("initConfig加载配置文件【开始】");
    comm.showLogToFile("initConfig加载配置文件【开始】");
    if (hostIp == null || hostIp == '') {
        try {
            var nis = NetworkInterface.getNetworkInterfaces();
            var ia = null;
            while (nis.hasMoreElements()) {
                var ni = nis.nextElement();
                var ias = ni.getInetAddresses();
                while (ias.hasMoreElements()) {
                    ia = ias.nextElement();
                    if (ia instanceof Inet6Address) {
                        continue;
                    }
                    var ip = ia.getHostAddress();
                    if (!"127.0.0.1".equals(ip)) {
                        hostIp = ia.getHostAddress();
                        break;
                    }
                }
            }
        } catch (e) {
            comm.showLog(e);
        }
        console.log(hostIp);
    }
    var sdcard_path = files.getSdcardPath()
    if (files.exists(sdcard_path + "/config.txt")) {
        let configStr = files.read(sdcard_path + "/config.txt")
        let jsonConfig = JSON.parse(configStr)
        httpServer = jsonConfig.task_url
        clientNo = jsonConfig.client_no
        script_url = jsonConfig.script_url

        console.log('当前设备ID:' + clientNo)
        httpServer = httpServer.replace('192.168.7.40', '192.168.7.93')

        //httpServer=httpServer.replace('192.168.7.93', '192.168.7.40')

        if (jsonConfig.task_id != null && jsonConfig.task_id != undefined && jsonConfig.task_id != 'undefined') {
            task_id = jsonConfig.task_id
        }

        if (jsonConfig.username != null && jsonConfig.username != undefined && jsonConfig.username != 'undefined') {
            username = jsonConfig.username
        }
        if (jsonConfig.account_id != null && jsonConfig.account_id != undefined && jsonConfig.account_id != 'undefined') {
            account_id = jsonConfig.account_id
        }
    }
    comm.showLog("initConfig加载配置文件【完成】");
}

function startup() {
    // console.log('初始化界面【开始】')
    comm.showLogToFile('初始化界面【开始】')
    //判断辅助功能是否开启
    // 获取 AccessibilityManager
    let am = context.getSystemService(context.ACCESSIBILITY_SERVICE);

    // 检查辅助功能是否启用
    let isAccessibilityEnabled = am.isEnabled();
    if (isAccessibilityEnabled) {
        toast("辅助功能已开启");
    } else {
        toast("辅助功能未开启");
        //通过shell命令打开辅助功能
        httpShell("settings put secure enabled_accessibility_services org.autojs.autoxjs.inrt/com.stardust.autojs.core.accessibility.AccessibilityService");
        sleep(3000)
    }

    auto();
    setScreenMetrics(device.width, device.height);
    events.observeKey();
    windowInfo = floaty.rawWindow(

        <frame gravity="center" alpha="0.5" bg="#00ff00">
            <vertical>
                <text id="text" gravity="center" margin="0" line="3">Vdroid Auto</text>
            </vertical>
        </frame>
    );
    windowMenu = floaty.rawWindow(

        <frame gravity="center" bg="#2E8B57">
            <vertical>
                <text id="menu" gravity="center" textColor="white" textSize="20sp" margin="0">菜单 </text>
            </vertical>
        </frame>
    );
    requestScreenCapture();
    windowInfo.setPosition(windowDefaultLeft, windowDefaultTop);
    windowInfo.setSize(600, 50);
    windowInfo.exitOnClose();
    windowInfo.setTouchable(false);
    windowInfo.text.click(() => {
        if (windowInfo.isAdjustEnabled()) {
            windowInfo.setAdjustEnabled(false);
        } else {
            windowInfo.setAdjustEnabled(true);
        }
    });
    windowMenu.setPosition(device.width - 100, device.height / 5 + 150);
    windowMenu.menu.on("click", () => {
        if (menuShow) {
            return;
        }
        threads.start(function () {
            menuShow = true;
            menu();
            menuShow = false;
        });
    });
    //sleep(5000);
    console.log('加载脚本成功:' + device.width + ',' + device.height);
    sleep(1000)
    comm.showLog("初始化界面【完成】");

    //console.log("剪贴板内容为:" + getClip()) 
}

//计算两个数字的差值，取绝对值，如果在某个范围内容，返回true
function isDifferenceInRange(a, b, range) {
    return Math.abs(a - b) <= range;
}
//text("Accept & continue")


function googleOpenTk() {
    app.launch("com.android.chrome")
    for (let i = 0; i < 20; i++) {
        if (i == 19) {
            comm.showLog("打开Tk失败")
            return false
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
        if (packageName("com.zhiliaoapp.musically").exists()) {
            comm.showLog("已打开TikTok")
            break;
        }
        //浏览跳转tk相关按钮
        let googleBtn = id("terms_accept").className("android.widget.Button").clickable().visibleToUser(true).findOne(1000)
        if (!googleBtn) {
            googleBtn = id("negative_button").className("android.widget.Button").clickable().visibleToUser(true).findOne(1000)
            if (!googleBtn) {
                googleBtn = idContains("message_primary_button").className("android.widget.Button").clickable().visibleToUser(true).findOne(1000)
                if (!googleBtn) {
                    googleBtn = packageName("com.android.chrome").boundsInside(0, 0, device.width, device.height / 3).className("android.widget.Button").clickable().visibleToUser(true).findOne(1000)//Open app
                    if (!googleBtn) {
                        googleBtn = idContains("message_primary_button").className("android.widget.Button").clickable().visibleToUser(true).findOne(1000);
                        if (!googleBtn) {
                            googleBtn = idContains("signin_fre_dismiss_button").visibleToUser(true).findOne(1000);
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
function menu() {
    var selIdx = dialogs.select("请选择功能", [

        "停止脚本", //0
        "任务完成", //1
        "产品跳转", //2
        "重启脚本", //3
        "测试登录", //4
        "---test",   //5
        "执行临时任务【浏览器打开tk好友链接】",   //6
        "测试链接和浏览器",   //7
        "测试注册任务",   //8
        "测试浏览器/下单任务拉起（执行备份）",   //9 
        "BB测试观看直播",   //10
        "刷新备份包",   //11
        "BB测试解绑手机号",   //12
        "AA获取总长度",   //13
        "开始执行命令行打开商品",   //14
        "滑动测试",   //15

    ]);

    switch (selIdx) {
        case 0:
            comm.showLog("开始停止脚本");
            if (heartPingRunThread != null) {
                try {
                    heartPingRunThread.interrupt();
                    heartPingRunThread = null;
                } catch (error) {
                    console.log(error)
                }
            }
            if (monitorRunThread != null) {
                try {
                    monitorRunThread.interrupt();
                    monitorRunThread = null;
                } catch (error) {
                    console.log(error)
                }
            }

            try {
                if (eScript != null && !eScript.getEngine().isDestroyed()) {
                    eScript.getEngine().forceStop()
                }
            } catch (error) {
                console.log(error)
            }
            if (autoRunThread != null) {
                try {
                    autoRunThread.interrupt();
                    autoRunThread = null;
                } catch (error) {
                    console.log(error)
                }
            }
            engines.myEngine().forceStop()
            break;
        case 1:
            // if(monitor_status==0){
            //     monitor_status=1
            //     monitor_task()
            // }

            var sdcard_path = files.getSdcardPath()
            if (files.exists(sdcard_path + "/taskString.txt")) {
                comm.showLog("在文件中读取到任务");
                let taskString = files.read(sdcard_path + "/taskString.txt")
                console.log(taskString)
                sleep(2000)
                let taskJson = JSON.parse(taskString)
                task_id = taskJson.task_id
                //
                result = "success"
                updateTask(1, task_id, 1, result, '')
                sleep(10000)
                httpShell('am force-stop com.zhiliaoapp.musically')
                sleep(10000)
            }
            // 
            break;
        case 2:
            let input = rawInput("请输入产品链接或ID");
            toast("你输入了：" + input);
            let url = "http://38.54.119.104:8080/api/product/basic?product_no=" + input;
            if (input == '') {
                toast("请输入产品链接或ID");
                return;
            }

            threads.start(function () {
                try {
                    let response = comm.httpToString(url);
                    //toast("返回：" + response);
                    let result = JSON.parse(response);
                    openProduct(result.product_no, result.seller_id);
                } catch (e) {
                    toast("请求失败：" + e.message);
                }
            });
            break;
        case 3:
            let starturl = "http://127.0.0.1:8000/api/start"
            comm.httpToString(starturl);
            break;
        case 4:
            username = "kylie.weaver5"
            let password2 = "d049136422@3848"
            var vcode_url = "http://23.91.96.20:3000/api/code?token=T5ADVCO2JEF4OOZ3Y5GQNFGKYMPMNXHU"
            result = login(username, password2, vcode_url)
            comm.showLog(result)
            if (result != 'success') {
                return result
            }
        case 5: //不要改
            comm.showLog("开启测试模式")
            test = true
            sleep(2000)
            let email = "karilynmonroe1206@mailsdog.com";
            let loginType = 1;
            let username = "karilynmonroe1206"
            let password = "ec649a9d8c@96e2";
            let vcode_url = "TQJIMQPIYXCHLO62IBUODGLSHBEV3S44";
            sleep(2000)
            login(email, username, loginType, password, vcode_url)
            // login(email, username, loginType, password, vcode_url) == "success"

            // let email = "macaleb00@ttusmail.com";
            // let loginType = 2;
            // let username = "macaleb00"
            // let password = "8bc239a8dc@1e56";
            // let vcode_url = "DLYXYDH5L6T4QP6FNYNJKXDT25FZNQEH";
            // sleep(2000)
            // httpShell('am force-stop com.zhiliaoapp.musically')
            // httpShell('pm clear com.zhiliaoapp.musically')
            // for (let i = 0; i < 20; i++) {
            //     if (login(email, username, loginType, password, vcode_url) == "success") {
            //         httpShell('am force-stop com.zhiliaoapp.musically')
            //         httpShell('pm clear com.zhiliaoapp.musically')
            //         sleep(5000)
            //     } else {
            //         alert("第:" + i + "次登录失败")
            //         break
            //     }
            // }


            // let email = "7OwBjz8n734@houjiutu.com";
            // let password = "HH2gR5GqKQ48B";
            // let nickname = ""

            // register_google(email, password, nickname)

            console.log("测试结束");
            break
            sleep(8000);
        case 6: //不要改
            sleep(2000)
            comm.showLog("执行手动浏览器打开链接任务")
            while (true) {
                comm.showLog("执行中...")
                //
                let taskString = comm.httpToString('http://23.91.96.20:9001/api/getLinkTask');
                console.log(taskString)
                let taskJson = JSON.parse(taskString)
                //通过链接，获取任务
                AttemptOperation_OpenUrlAndProxy_Menu(taskJson);
                sleep(5000)
            }

            break;
        case 7:
            sleep(2000)
            comm.showLog("准备开始")
            //
            let taskJson = JSON.parse(taskString_My)
            let taskInfo = taskJson.task_info
            username = taskJson.username
            account_id = taskJson.account_id
            let returnMsg = "执行失败"
            // comm.pullDownRefresh();
            returnMsg = AttemptOperation_ActivitieGetUrl(taskInfo[0]);
            if (returnMsg == "success") {
                // taskStatus = 1
                console.log("上报成功");
                //小任务上报任务完成（成功）//如果成功，把success报上去
                updateTask(2, task_id, 1, returnMsg, username)
            } else {
                console.log("上报失败:", returnMsg);
                //小任务上报任务完成（失败）
                updateTask(2, task_id, 2, returnMsg, username)
            }

            break;
        case 8:
            sleep(2000)
            // 解析获取任务 注册
            taskJson = JSON.parse(taskString_My)
            taskInfo = taskJson.task_info
            // //
            returnMsg = AttemptOperation_Register(taskInfo[0])
            if (returnMsg == "success") {
                console.log("上报成功");
            } else {
                console.log("上报失败:", returnMsg);
            }


            comm.showLog("完成")
            break;
        case 9:
            sleep(2000)
            comm.showLog("测试浏览器/下单任务拉起")
            // if (backupNo != '') {
            //     comm.showLog("执行备份")
            //     sleep(8000)
            //     httpShell('curl "http://127.0.0.1:8000/api/backup?backup_no=' + backupNo + '"')
            // } else {
            //     comm.showLog("执行备份2")
            //     sleep(8000)
            //     httpShell('curl "http://120.236.196.248:8083/test"')
            //     // httpShell_v2('curl "http://127.0.0.1:8000/api/backup?backup_no=4322485"')
            //     // 使用示例
            //     // let jsonData = {
            //     //     backup_no: "4322485",
            //     // }
            //     // console.log("jsonData:" + JSON.stringify(jsonData))
            //     // let url = "http://127.0.0.1:8000/api/backup?backup_no=4322485";
            //     // let url = "http://120.236.196.248:8083/health";
            //     // let url = "http://120.236.196.248:8083/test";
            //     // let response = curlGet(url);
            //     // if (response) {
            //     //     console.log("服务器返回:", response);
            //     // }

            //     // let jsonData = {
            //     //     client_no: "VGZA10200163021_00",
            //     //     // cmd: 'curl "http://127.0.0.1:8000/api/backup?backup_no=4322485"',
            //     //     // cmd: 'curl "http://120.236.196.248:8083/test"',
            //     //     cmd: 'ifconfig',
            //     //     key: "63347f5d946164a23faca26b78a91e1c"
            //     // }
            //     // console.log("jsonData:" + JSON.stringify(jsonData))
            //     // console.log("url:" + httpServer + "/api/shell")

            //     // let str = comm.postToString(httpServer + "/api/shell", jsonData)
            //     // comm.showLog("str:" + str)
            //     // if (str != '') {
            //     //     try {
            //     //         let jsonShell = JSON.parse(str)
            //     //         if (jsonShell.code == 0) {
            //     //             return true
            //     //         }
            //     //     } catch (e) {
            //     //         console.log(e)
            //     //     }
            //     // }else{
            //     //     comm.showLog("str为空")
            //     // }


            // }
            //
            openProduct("1729789099483108067", "8646942781248279267")
            // openProduct("1729456382127739039", "7495482150996445343")
            // openProduct("1730901687569191659","7496093891441167083")
            // openProduct("1729547589531570540","7495315062248409452")
            // openProduct("1729697036762256067","7495945743988656835")
            // addAvatar()
            // changeUsername()

            comm.showLog("完成")
            break;
        case 10:
            comm.showLog("sku处理")
            sleep(2000)

            let taskinf_my = `{
                "task_id": 0,
                "task_type": 3,
                "enter_method": 0,
                "tk_video_id": "",
                "buy_link_title": "",
                "product_no": "1729789099483108067",
                "seller_id": "8646942781248279267",
                "seller_name": "BESTDEER",
                "product_title": "30-in-1/64-in-1 Ratchet Magnetic Screwdriver Bit Set, Flat Handle Screwdriver Bit Set for Precision Instrument/Furniture Repair, Multipurpose Screwdriver, Industrial Tools, High Quality Hardware",
                "sku_name": "Specification:30in1----Color:Black",
                "product_quantity": 1,
                "url": "",
                "realname": "Tim Hodges",
                "card_number": "3376",
                "discount": 0,
                "max_amount": 22.18,
                "orders_id": 153668,
                "ordertask_id": 42211,
                "type": 2,
                "stxt": "Is there a manual or guide included?",
                "email": "juliannebankshe@mailsdog.com",
                "is_no_shop": 1,
                "showcase_url": "https://vt.tiktok.com/ZT6rBeoPK/?page=TikTokShop",
                "showcase_add_url": "http://23.91.96.20:9102/api/creator/add_product?account_id=3876756\u0026product_id=1729789099483108067"
            }`
            //
            // let taskJson_My = JSON.parse(taskinf_my)  //找到Buy now页面之后，点击
            //
            // oidtext.bounds().centerY
            // openProduct("1729752744451608937","7495969693205301609")
            // comm.randomToAndFroSwipe()
            // let lau = clickBtnJoinTk()
            // comm.showLog(lau)
            // let gggBtns = selector().className('android.widget.ImageView').visibleToUser(true).find()
            // if(gggBtns){
            //     comm.showLog(gggBtns.length)
            //     comm.showLog("找到三条杠")
            //     comm.clickObj(gggBtns[1])
            // }else{
            //     comm.showLog("找不到三条杠")
            // }
            // let gggBtns = selector().className('android.widget.ImageView').visibleToUser(true).find()
            // if(gggBtns){
            //     comm.showLog("找到三条杠的ImageView控件"+gggBtns.length)
            //     if (gggBtns.length == 1){
            //         if (gggBtns[0].bounds().centerY() <300 && gggBtns[0].bounds().centerX() > device.width-200){
            //             comm.clickObj(gggBtns[0])
            //         }
            //     }else if(gggBtns.length > 1){
            //         for(let j = 0;j <gggBtns.length;j++){
            //             if (gggBtns[j].bounds().centerY() <300 && gggBtns[j].bounds().centerX() > device.width-200){
            //                 comm.clickObj(gggBtns[j])
            //                 break
            //             }
            //         }
            //     }
            // }else{
            //     comm.showLog("找不到三条杠的imageView控件")
            // }
            // if (findTheProductLinkBtn("Bunion Corrector for Big")){
            //     comm.showLog("成功")
            // }else{
            //     comm.showLog("失败")
            // }

            //
            // text = Green 1 
            let tsku = "Specification:30in1----Color:Black"
            // let tsku = "Battery:Green 1 battery"
            // let tsku = "Trendy black:Trendy black"
            // let tsku = "Battery:Green 1 "
            // let tsku = "Color:Sand----Size:X-Large(Fits 34K, 36J, 38I, 40H, 42G, 44DDD/F)"
            // let tsku = "Size:10mm----Ring Gauge:18G"
            // let tsku = "Color:gold----Letter:A----length:7.5inch"
            // let tsku = "Color:Coffee + Dark Grey----Size:S"
            // let tsku = "Size:26----Hair Type:Elastic Drawstring"
            // let tsku = "Colour:Sea Grey----Size:0.5KG(0.14gallons)"
            // let tsku = "Colour:stevia"
            // let tsku = "Hair Texture:eyelash----Length:1/pcs"
            // let tsku = "Flavors:Midwest Mama-pineapple/tropical "
            // let tsku = "Flavors:Fat Bottom Girls-Peach/Mango/Pink Lemonade/punch"    //成功
            // let tsku = "color:silver"
            // let tsku = "Crystal Type:amethyst----color:silver"
            // let tsku = "Color:black"
            // let tsku = "Color:Emerald Green----Size:L(8/10)"
            // let tsku = "Color:Black----Size:XL"
            // let tsku = "Size:18"
            // let tsku = "Size:18"
            // let tsku = "Color:NO.1:Fishnet  knee-high socks"
            // let tsku = "lace:wig cap----Size:wig cap"
            // let tsku = "Color:22 - Light Pink----Size:Twin"
            // let tsku = "Color:22 - Light Pink"
            // let skuValueObj=selector().text("Black").visibleToUser(true).findOne(500)
            // let skuValueObj=selector().text("L").findOne(1000) //匹配得上
            // let skuValueObj=selector().text("Black").findOne(1000) //匹配不上
            // let skuValueObj=selector().text("Color: Black").findOne(1000) //匹配得上
            // let skuValueObj=selector().textContains("Black").findOne(1000) //匹配得上
            // if (skuValueObj){
            if (doSku_v3(tsku)) {
                comm.showLog("成功")
            } else {
                comm.showLog("失败")
            }
            // for (let i = 0; i < 1; i++) {
            //     sleep(5000)
            //     let buyNow = selector().className('android.widget.Button').textContains('Buy now').findOne(1000)
            //     if (buyNow) {
            //         comm.showLogToFile("点击一下buynow")
            //         comm.clickObj(buyNow)
            //         sleep(5000)
            //         buyNow = selector().className('android.widget.Button').textContains('Buy now').findOne(1000)
            //         if (buyNow) {
            //             continue
            //         } else {
            //             break
            //         }
            //     }
            // }
            // sleep(8000)
            // let checkoutPage = selector().textContains('Checkout').visibleToUser(true).findOne(1000)
            // if (!checkoutPage) {
            //     checkoutPage = selector().textContains('Order summary').visibleToUser(true).findOne(1000)
            // }
            // if (checkoutPage) {
            //     comm.showLogToFile("已经进入Check-out页面")
            // } else {
            //     comm.showLogToFile("没有进入Check-out页面")
            //     return "没有进入Check-out页面"
            // }
            // className = android.widget.Button
            // text = CANCEL
            // let CANCELBtn = selector().textContains('CANCEL').visibleToUser(true).findOne(1000)
            // if (CANCELBtn) {
            //     comm.showLogToFile("点击取消按钮")
            //     comm.clickObj(CANCELBtn)
            //     sleep(5000)
            // }
            //

            comm.showLog("看直播结束")
            //
            break;
        case 11:
            sleep(2000)
            // skuValue:X-Large(Fits 34K, 36J, 38I, 40H, 42G, 44DDD/F)
            // X-Large(Fits 34K, 36J, 38I, 40H, 42G, 44DDD/F)
            // let mytestText = `X-Large(Fits 34K, 36J, 38I, 40H, 42G, 44DDD/F)`
            // let singoObj = selector().text(mytestText).visibleToUser(true).find()
            // if (singoObj.length == 1) {
            //     comm.clickObj(singoObj[0])
            //     comm.showLog("找到一个")
            //     sleep(3000)
            // } else {
            //     comm.showLog("有多个或者没找到")
            // }
            if (account_id != '') {
                httpShell('curl "http://23.91.96.20:8022/api/getInfo?account_id=' + account_id + '"')
            }

            // comm.showLog("开始查找 -android.widget.LinearLayout")
            // let actionBtn = selector().className('android.widget.LinearLayout').visibleToUser(true).find()
            // if (actionBtn) {
            //     console.log("inputs:" + actionBtn.length)
            //     for (let i = 0; i < actionBtn.length; i++) {
            //         let btnTest = actionBtn[i].bounds()
            //         console.log('comm.clickObj:' + btnTest.centerX() + ',' + btnTest.centerY())
            //     }
            // }
            // comm.showLog("开始查找2 -android.widget.Button")
            // let actionBtn2 = selector().className('android.widget.Button').visibleToUser(true).find()
            // if (actionBtn2) {
            //     console.log("inputs:" + actionBtn2.length)
            //     for (let i = 0; i < actionBtn2.length; i++) {
            //         let btnTest = actionBtn2[i].bounds()
            //         console.log('comm.clickObj:' + btnTest.centerX() + ',' + btnTest.centerY() + "||" + btnTest.right)
            //     }
            // }
            // comm.showLog("开始查找3 -android.widget.ImageView")
            // let actionBtn3 = selector().className('android.widget.ImageView').visibleToUser(true).find()
            // if (actionBtn3) {
            //     console.log("inputs:" + actionBtn3.length)
            //     for (let i = 0; i < actionBtn3.length; i++) {
            //         let btnTest = actionBtn3[i].bounds()
            //         console.log('comm.clickObj:' + btnTest.centerX() + ',' + btnTest.centerY() + "||" + btnTest.right)
            //     }
            // }
            // let actionBtn2=selector().className('android.widget.Button').visibleToUser(true).find()  第二个是足迹按钮
            comm.showLog("完成")
            //
            break;
        case 12:
            sleep(2000)
            comm.showLog("分享")
            let btnBox = []     //按钮box
            // 获取按钮控件并筛选组合数据
            while (true) {
                let actionBtns = selector().className("android.widget.Button").visibleToUser(true).find()
                if (actionBtns.length > 5) {
                    for (let i = 0; i < actionBtns.length; i++) {
                        if (i < 7) {
                            btnBox.push(actionBtns[i])
                        } else {
                            break
                        }
                    }
                    break
                } else {
                    comm.randomSwipe(1)
                }
            }
            for (let i = 0; i < btnBox.length; i++) {
                let btnTest = btnBox[i].bounds()
                console.log('comm.clickObj:' + btnTest.centerX() + ',' + btnTest.centerY() + "||" + btnTest.right)
            }
            // 使用 Math.abs 确保差值为正数。通过差值的比对，判断一下第一个数据是不是别的按钮控件
            if (Math.abs(btnBox[0].bounds().centerX() - btnBox[1].bounds().centerX()) > 20) {
                comm.showLog("大于20，说明第一个数据不合适，移除")
                btnBox.splice(0, 1);
            } else {
                comm.showLog("小于20，说明第一个数据合适，保留")
            }
            if (Math.abs(btnBox[4].bounds().centerX() - btnBox[5].bounds().centerX()) > 20) {
                comm.showLog("大于20，说明没有私信，保留")
            } else {
                comm.showLog("小于20，说明有私信，移除")
                btnBox.splice(0, 1);
            }
            //
            comm.clickObj(btnBox[4])
            sleep(1000)
            comm.findTextClick("Copy link")

            //
            break;
        case 13:
            sleep(2000)
            //截图
            httpShell('screencap -p /sdcard/taskid_0502.png') // /sdcard/taskid_0502.png
            // taskJson=JSON.parse(taskString_My)
            // taskInfo = taskJson.task_info
            // username=taskJson.username
            // account_id=taskJson.account_id

            // AttemptOperation_Login_test(taskInfo[0])
            let Audio = selector().textContains('Audio').visibleToUser(true).findOne(5000)
            //
            let VerifyContinue_My = selector().textContains('puzzle piece into place').visibleToUser(true).findOne(5000)
            if (VerifyContinue_My) {
                comm.showLog("找到滑块验证码模块")
                let btnTest = VerifyContinue_My.bounds()
                console.log('comm.clickObj:' + btnTest.centerX() + ',' + btnTest.centerY())
                console.log('comm.clickObj:' + btnTest.left)
                console.log('comm.clickObj:' + btnTest.right)
                console.log('comm.clickObj:' + btnTest.top)
                console.log('comm.clickObj:' + btnTest.bottom)
            } else {
                comm.showLog("没找到滑块验证码模块")
            }
            //
            let secsdkCaptDrag_My = selector().idContains('captcha_slide_button').visibleToUser(true).findOne(20000)
            if (secsdkCaptDrag_My) {
                comm.showLog("找到滑块按钮控件")
                let btnTest = secsdkCaptDrag_My.bounds()
                console.log('comm.clickObj:' + btnTest.centerX() + ',' + btnTest.centerY())
                console.log('comm.clickObj:' + btnTest.left)
                console.log('comm.clickObj:' + btnTest.right)
                console.log('comm.clickObj:' + btnTest.top)
                console.log('comm.clickObj:' + btnTest.bottom)
            } else {
                comm.showLog("没找滑块按钮控件")
            }
            sleep(2000)
            comm.showLog("屏幕总宽度:" + device.width)
            comm.showLog("屏幕总长度:" + device.height)

            //
            sleep(2000)
            let capImg = sysScreenCapture();
            comm.showLog("开始切割图片");
            let x = VerifyContinue_My.bounds().left //对 108
            let y = VerifyContinue_My.bounds().bottom + 26  //846
            let w = device.width - VerifyContinue_My.bounds().left - VerifyContinue_My.bounds().left //864
            // let h=Drag_the.bounds().top-VerifyContinue.bounds().bottom-100 // 
            let h = Audio.bounds().top - VerifyContinue_My.bounds().bottom - 150
            console.log("x:" + x)
            console.log("y:" + y)
            console.log("w:" + w)
            console.log("h:" + h)
            //
            for (let c = 0; c < 10; c++) {
                capImg = images.read("/sdcard/tk.png")
                if (!capImg) {
                    comm.showLog("fuck_" + c)
                    sleep(3000)
                } else {
                    break
                }
            }
            //
            capImg = images.clip(capImg, x, y, w, h);
            let base64 = images.toBase64(capImg, 'jpg', 80);
            let token = "Hhe8XEYDbYPEiYbeS1eKW0iUdX5jAaR+z6a3Fm3Ii34";
            let verify_type = "20110";
            //http://70.39.126.2:8089
            //let dRes=http.postJson(httpServer+"/api/YdmVerify",{base64:base64,token:token,verify_type:verify_type}) 
            let dRes = http.postJson("http://70.39.126.2:8089/api/YdmVerify", { base64: base64, token: token, verify_type: verify_type })
            let rString = dRes.body.string()
            console.log(rString)
            let yJson = JSON.parse(rString);
            let sp = yJson.data.data
            comm.showLog("接口返回数据:" + sp)
            //
            //拼图的实际移动长度为  VerifyContinue.bounds().left   ---  device.width-VerifyContinue.bounds().left-VerifyContinue.bounds().left
            //因为移动速率是不同步的，找出当拼图完全走完，我手指实际移动的距离
            let allNum_My = device.width - VerifyContinue_My.bounds().left - VerifyContinue_My.bounds().left
            comm.showLog("拼图总长度：" + allNum_My)
            let pos = []
            let secsdkCapBounds = secsdkCaptDrag_My.bounds()
            pos.push([secsdkCapBounds.centerX(), secsdkCapBounds.centerY() - 2])
            // pos.push([877,secsdkCapBounds.centerY()+10])
            // pos.push([877,secsdkCapBounds.centerY()+10])
            let move_count = (sp - 18.45652) / 1.23913
            console.log("计算的移动数据:" + move_count)
            console.log("计算的移动数据:" + secsdkCapBounds.centerX() + move_count)
            // VerifyContinue_My.bounds().centerX()+move_count
            //
            pos.push([secsdkCapBounds.centerX() + move_count, secsdkCapBounds.centerY() + 5])
            //
            //前3次为了跑全程，检查核对一下具体数据
            //
            // comm.showLog("准备滑动");
            // let randomTime = random(20000, 25000);
            gesture(10000, pos)

            //
            comm.showLog("完成")
            //
            break;
        case 14:
            sleep(2000)
            comm.showLog("开始执行命令行打开商品")
            let product_id = "1730782783167369217"
            let seller_id = "7496104615834716161"
            //
            let p = 'pdp?biz_type=0\u0026fullScreen=false\u0026orderRequestParams=%7B%7D\u0026requestParams=%7B%22product_id%22%3A%5B%22' + product_id + '%22%5D%7D\u0026visitReportParams=%7B%22chain_key%22%3A%22%22%2C%22material_id%22%3A%22' + product_id + '%22%2C%22material_type%22%3A1%2C%22seller_id%22%3A%22' + seller_id + '%22%7D'
            app.startActivity({

                action: "android.intent.action.VIEW",
                data: "snssdk1233://ec/" + p,
                packageName: "com.zhiliaoapp.musically",
            });
            //
            comm.showLog("完成")
            break;
        case 15:

            sleep(random(3000, 4000))
            closeAllPop()
            sleep(random(3000, 4000))
            comm.showLog("完成")
            //
            break;
    }

}
function curlGet(url) {
    try {
        let response = http.get(url, {
            timeout: 300000 // 300秒 = 5分钟
        });
        let result = response.body.string();
        console.log("请求成功:", result);
        return result;
    } catch (e) {
        console.log("请求失败:", e);
        return null;
    }
}



// 目前发送消息
function setSellerText(content, seller_id) {
    sleep(6000)
    let imstr = "webview?__INTERNAL_ROUTE__=%2Fchat\u0026__status_bar=true\u0026allow_webview_gesture=1\u0026container_color_auto_dark=1\u0026disableBounces=1\u0026hide_nav_bar=1\u0026hide_source=1\u0026should_full_screen=0\u0026url=https%3A%2F%2Foec-api.tiktokv.com%2Fview%2Ffe_tiktok_ecommerce_chat%2Fh5%2Fmain.html%3F__INTERNAL_ROUTE__%3D%252Fchat%26__status_bar%3Dtrue%26container_color_auto_dark%3D1%26disableBounces%3D1%26hide_nav_bar%3D1%26hide_source%3D1%26orderId%3D0%26productId%3D0%26shopId%3D" + seller_id + "%26should_full_screen%3D0%26source%3D14%26use_spark%3D1\u0026use_spark=1"
    app.startActivity({
        action: "android.intent.action.VIEW",
        data: "snssdk1233://" + imstr,
        packageName: "com.zhiliaoapp.musically",
    });
    sleep(5000)
    let editText = selector().className("android.widget.EditText").findOne(55000);
    if (!editText) {

        return
    }
    sleep(3000)
    editText.setText(content)
    sleep(2000)
    let b = editText.bounds();
    let x = device.width - 50
    let y = b.bottom - 50
    click(x, y)
    sleep(15000)
    back()
    sleep(1000)
    back()
    sleep(1000)
}


//发送文字和图片
//发送文字和图片
function setSellerText_And_Photo(content, seller_id, image_url) {
    sleep(8000)
    let imstr = "webview?__INTERNAL_ROUTE__=%2Fchat\u0026__status_bar=true\u0026allow_webview_gesture=1\u0026container_color_auto_dark=1\u0026disableBounces=1\u0026hide_nav_bar=1\u0026hide_source=1\u0026should_full_screen=0\u0026url=https%3A%2F%2Foec-api.tiktokv.com%2Fview%2Ffe_tiktok_ecommerce_chat%2Fh5%2Fmain.html%3F__INTERNAL_ROUTE__%3D%252Fchat%26__status_bar%3Dtrue%26container_color_auto_dark%3D1%26disableBounces%3D1%26hide_nav_bar%3D1%26hide_source%3D1%26orderId%3D0%26productId%3D0%26shopId%3D" + seller_id + "%26should_full_screen%3D0%26source%3D14%26use_spark%3D1\u0026use_spark=1"
    app.startActivity({
        action: "android.intent.action.VIEW",
        data: "snssdk1233://" + imstr,
        packageName: "com.zhiliaoapp.musically",
    });
    sleep(30000)
    let editText = selector().className("android.widget.EditText").findOne(15000);
    if (!editText) {
        return "没找到输入框"
    }
    comm.showLog("找到输入框")
    sleep(8000)
    editText.setText(content[0])
    sleep(10000)
    let b = editText.bounds();
    let x = device.width - 50
    let y = b.bottom - 50
    click(x, y)  //发送了第一条消息
    comm.showLog("发送了第一条消息")
    sleep(8000)
    //
    editText = selector().className("android.widget.EditText").findOne(15000);
    if (!editText) {
        return "没找到输入框2"
    }
    comm.showLog("找到输入框2")
    sleep(8000)
    editText.setText(content[1])
    sleep(10000)
    b = editText.bounds();
    x = device.width - 50
    y = b.bottom - 50
    click(x, y)  //发送了第二条消息
    comm.showLog("发送了第二条消息")
    sleep(10000)
    //再找
    editText = selector().className("android.widget.EditText").findOne(15000);
    if (!editText) {
        return "没找到输入框2"
    }
    sleep(10000)
    if (image_url != "") {
        b = editText.bounds();
        x = device.width - 50
        y = b.bottom - 50
        click(x, y)  //点开更多操作按钮
        comm.showLog("点击+号")
        sleep(10000)
        //
        let photoText = selector().textContains("Photos").visibleToUser(true).findOne(10000);
        if (!photoText) {
            return "没找到图片入口"
        }
        comm.clickObj(photoText)
        sleep(10000)
        let imgText = selector().className("android.widget.TextView").find();
        if (!imgText) {
            return "没找到图片"
        }
        if (imgText.length < 2) {
            return "没找到图片2"
        }
        comm.clickObj(imgText[1])
        sleep(10000)
        let okText = selector().textContains("OK").visibleToUser(true).findOne(10000);
        if (!okText) {
            return "没有ok"
        }
        comm.showLog("点击ok")
        comm.clickObj(okText)
        sleep(10000)
    }
    return "success"
    //
    // back()
    // sleep(2000)
    // back()
    // sleep(1000)
}

// 打开商品
function openProduct(product_id, seller_id) {
    let p = 'pdp?biz_type=0\u0026fullScreen=false\u0026orderRequestParams=%7B%7D\u0026requestParams=%7B%22product_id%22%3A%5B%22' + product_id + '%22%5D%7D\u0026visitReportParams=%7B%22chain_key%22%3A%22%22%2C%22material_id%22%3A%22' + product_id + '%22%2C%22material_type%22%3A1%2C%22seller_id%22%3A%22' + seller_id + '%22%7D'
    app.startActivity({
        action: "android.intent.action.VIEW",
        data: "snssdk1233://ec/" + p,
        packageName: "com.zhiliaoapp.musically",
    });
}

//enter_method：0 直接购买1 进主页找商品
function addToCardOrBuyNow_my(type, enter_method, product_id, seller_id, s, sku_qty, video_id, title_txt, stxt, is_api_order, realname, card_number, discount, max_amount) {
    if (stxt != '') {
        // 设置商家
        setSellerText(stxt, seller_id)
    }
    sleep(2000)
    // 浏览商品
    comm.showLog("判断video_id是否为空")
    sleep(2000)


    if (video_id != '') {
        comm.showLog("从短视频进入商品详情")
        // 可能会存在拉起视频失败，需要重试
        for (let i = 0; i < 30; i++) {
            let isV = openVideoProduct(video_id, title_txt)
            if (!isV) {
                comm.showLog('浏览商品失败')
                sleep(2000)
                comm.randomSwipe(1)
            } else {
                break
            }
        }
        sleep(2000)
        comm.showLog("接下来检查是否有滑块验证码")
        // 判断有没有滑块验证码
        imageCodeVerify_my()
    } else {
        comm.showLog("从商家进入商品详情")
        // 打开商品详情
        openProduct(product_id, seller_id)   //这里结束之后，会有个滑块验证码，但是不是每次都有。关联 imageCodeVerify 函数
        sleep(2000)
        // 判断有没有滑块验证码
        comm.showLog("判断有没有滑块验证码")
        imageCodeVerify_my()
    }
    sleep(2000)
    // 默认已经弹出了商品详情
    //判断enter_method     0 直接购买   1 进主页找商品
    if (enter_method == 0) {
        comm.showLog("直接购买")
    } else {
        comm.showLog("进主页找商品")
        for (let i = 0; i < 30; i++) {
            // let shopHome=selector().textContains("About this shop").findOne(3000)
            let shopHome = selector().textContains("Visit shop").findOne(3000)
            if (!shopHome) {
                comm.showLog("店铺首页未找到")
                comm.randomSwipeSlow(1)
                sleep(500)
            } else {
                comm.showLog("找到店铺首页")
                sleep(1000)
                comm.clickObj(shopHome)
                break
            }
            sleep(1000)
        }
        // 短视频/商家入口 商品详情拉起流程结束，开始滑动找到店铺首页
        // 滑动找到店铺首页
        // 判断页面中有没有 Home    Products    Reviews
        // comm.existsText("Home")
        // comm.existsText("Products")
        // comm.existsText("Reviews")
        sleep(4000)
        for (let i = 0; i < 30; i++) {
            if (comm.existsText("Products") && comm.existsText("Reviews")) {
                comm.showLog("页面中有 ProductsReviews")
                break
                // return "页面中有 HomeProductsReviews"
            } else {
                comm.showLog("页面中没有 ProductsReviews")
                sleep(1000)
            }
        }
        // 点一下Products
        sleep(1000)
        comm.clickObj(selector().visibleToUser(true).textContains("Products").find(1000)[1])
        sleep(1000)
        for (let i = 0; i < 10; i++) {
            // 找buy按钮
            let buyBtn = comm.findOneText("Buy")
            if (!buyBtn) {
                comm.showLog("buy按钮未找到")

            } else {
                comm.showLog("buy按钮找到")
                break
            }
            // 切换列表模式，有follow和无follow的区别 3.7好像没事
            click(random(1190, 1247), random(1125, 1173)) //找到列表模式切换的按钮
            sleep(1000)
        }
        // 找商品标题匹配 Countertop lce Maker Machine w...
        sleep(1000)
        comm.showLog("开始找商品标题")
        // 找到这个商品的标题
        let isViewed = findTitle(title_txt)
        if (isViewed) {
            comm.showLog("商品标题找到")
        } else {
            comm.showLog("商品标题未找到")
            return "商品标题未找到"
        }
        // return "商品标题找到"
        // imageCodeVerify_my()
    }
    sleep(1000)
    comm.randomSwipeSlow(3)
    sleep(1000)
    let buyNow = selector().className('android.widget.Button').textContains('Buy now').findOne(1000)
    if (!buyNow) {
        comm.showLog("buy now按钮未找到")
        return "buy now按钮未找到"
    } else {
        comm.showLog("buy now按钮找到")
        comm.clickObj(buyNow)
    }
    // 判断有没有验证码
    sleep(2000)
    comm.showLog("判断有没有滑块验证码")
    imageCodeVerify_my()
    sleep(2000)
    // // sku怎么弄
    comm.showLog("开始选择sku")
    if (doSku(s)) {
        comm.showLog("sku选择成功")
    } else {
        comm.showLog("sku选择失败")
        return "sku选择失败"
    }
    sleep(2000)
    // 点击buy now进入订单详情页面
    buyNow = selector().className('android.widget.Button').textContains('Buy now').visibleToUser(true).findOne(1000)
    if (!buyNow) {
        comm.showLog("buy now按钮未找到")
        return "buy now按钮未找到"
    } else {
        comm.showLog("buy now按钮找到")
        comm.clickObj(buyNow) //点一下
        sleep(2000)
        // 点完之后判断还有没有buy now按钮
        let buyNow2 = selector().className('android.widget.Button').textContains('Buy now').visibleToUser(true).findOne(1000)
        if (buyNow2) {
            // 流程错误
            comm.showLog("buy now按钮找到，流程错误")
            return "点击buy now按钮进入订单详情页面错误"
        } else {
            // 流程正确
            comm.showLog("buy now按钮未找到，流程正确")
        }
    }
    sleep(2000)
    // 检查是否在checkout页面
    if (comm.existsTextAll("Checkout")) {
        comm.showLog("在checkout页面")
    } else {
        comm.showLog("不在checkout页面")
        return "不在checkout页面"
    }
    // 检查地址
    // 检查卡号
    // 检查优惠金额
    // 检查支付价格
    let order_result = orderAction_my(task_id, "", realname, card_number, discount, max_amount)
    if (order_result == "success") {
        comm.showLog("下单成功,准备滑动和截图")
        // 
        sleep(2000)
        if (orderFinishAction(task_id)) {
            comm.showLog("滑动和截图成功")
        } else {
            comm.showLog("滑动和截图失败")
            return "滑动和截图失败"
        }
    } else {
        comm.showLog("下单失败:" + order_result)
        return order_result
    }
    // 
    return "success"


}

// 订单完成之后的滑动和截图
function orderFinishAction(task_id) {
    let address_opent = false
    for (let i = 0; i < 30; i++) {
        let seemoreBtn = selector().textContains("See more").visibleToUser(true).findOne(1000)
        if (seemoreBtn) {
            comm.showLog("找到See-more")
            comm.clickObj(seemoreBtn)
            sleep(3000)
        }
        comm.randomSwipeSlow(1)
        // 找到地址Shipping address，点一下
        if (!address_opent) {
            let shippingAddress = selector().textContains("Shipping address").visibleToUser(true).findOne(1000)
            if (shippingAddress) {
                comm.showLog("找到Shipping-address")
                comm.clickObj(shippingAddress)
                address_opent = true
            }
        }
        sleep(1000)
        // 判断有没有订单完成
        let orderFinish = selector().textContains("Download the receipt").visibleToUser(true).findOne(1000)
        if (orderFinish) {
            comm.showLog("找到Download-the-receipt字样，准备截图")

            //增加一个同步和发送订单信息的逻辑



            if (sysScreenCapture_OrderFinish(task_id)) {
                comm.showLog("截图成功")
                return true
            } else {
                comm.showLog("截图失败,再次尝试截图")
                sleep(2000)
                if (sysScreenCapture_OrderFinish(task_id)) {
                    comm.showLog("再次截图成功")
                    return true
                } else {
                    comm.showLog("再次截图失败")
                    return false
                }
            }
        }
    }
}

// 专门处理滑块验证码
function imageCodeVerify_my() {
    let vcnt = 1
    for (let i = 0; i < 30; i++) {
        comm.showLog('imageCodeVerify_my循环中:' + i)
        let doStr = 'Add to '
        let loadingBtn = selector().textContains(doStr).findOne(3000)
        if (loadingBtn) {
            break
        } else {
            closeAllPop()
        }
        // if(i>5){

        //     let homeBtn = selector().textContains('Home').visibleToUser(true).findOne(1000)
        //     if(homeBtn){
        //         openProduct(product_id,seller_id)
        //         sleep(5000)  
        //     }
        // }
        let retryBtn = selector().textContains('Retry').findOne(1000)
        if (retryBtn) {
            sleep(6000)
            comm.clickObj(retryBtn)
            sleep(6000)
            continue  //停止当前循环，继续下一次循环
        }
        // if(i==10&&vcnt==1){
        //     httpToString(httpServer+'/api/setProxy?client_no='+client_no+'&key=63347f5d946164a23faca26b78a91e1c&task_id='+last_task_id) 
        // }
        let isVerifyCnt = 6
        let imageVerifyTips = selector().textContains('Verify to continue:').visibleToUser(true).findOne(1000) || selector().textContains('puzzle piece into place').visibleToUser(true).findOne(1000)
        if (imageVerifyTips) {
            comm.showLog('Verify to continue,存在')
            if (isVerifyCnt > 5) {
                comm.showLog('开始等待....')
                sleep(2000)
                if (vcnt < 3) {
                    comm.showLog('尝试走付费验证流程')
                    // 初始尝试走付费验证流程
                    imageCodeVerify(false)
                    vcnt++
                    continue
                }
                if (vcnt == 3) {
                    comm.showLog('开始验证码滑块【vcnt==3】') //一个随机的滑动长度
                    let scdBounds = [265, 1785]  //预定一个滑块坐标
                    let randomTime = random(1500, 2100);
                    let secsdkCaptDrag = selector().idContains('secsdk-captcha-drag-wrapper').visibleToUser(true).findOne(20000)
                    if (!secsdkCaptDrag) {
                        comm.showLog('验证码滑块按钮控件未找到')
                        continue
                        //return '验证码滑块按钮控件未找到'
                    } else {
                        scdBounds = secsdkCaptDrag.bounds()
                    }
                    sleep(1000)
                    let sp = random(300, 630)
                    let pos = []
                    // let secsdkCapBounds = secsdkCaptDrag.bounds()
                    let secsdkCapBounds = scdBounds
                    let startX = secsdkCapBounds.left + random(0, 100);
                    let startY = random(secsdkCapBounds.top, secsdkCapBounds.bottom);
                    pos.push([startX, random(startY - 2, startY + 2)]);
                    pos.push([startX + sp, random(startY - 2, startY + 2)]);
                    gesture(randomTime, pos)
                    sleep(5000)
                }
                if (vcnt == 8) {
                    comm.showLog('开始验证码滑块【vcnt==8】')
                    imageCodeVerify(false)
                } else {
                    comm.showLog('开始验证码滑块【vcnt==8else】')
                    for (let j = 0; j < 10; j++) {
                        loadingBtn = selector().textContains(doStr).findOne(1000)
                        if (loadingBtn) {
                            break
                        }
                    }
                }
                // comm.showLog('开始切换ip')
                // if(vcnt%2==1){
                //     httpToString(httpServer+'/api/setProxy?client_no='+client_no+'&key=63347f5d946164a23faca26b78a91e1c&task_id='+last_task_id)
                //     //httpToString(httpServer+'/api/setProxy?client_no='+client_no+'&key=63347f5d946164a23faca26b78a91e1c&task_id='+last_task_id)
                //     sleep(3000)
                // }
                vcnt++
                comm.showLog('关闭滑块')
                sleep(1000)
                click(1118, 979)
                retryBtn = selector().textContains('Retry').findOne(2000)
                if (retryBtn) {
                    sleep(6000)
                    comm.clickObj(retryBtn)
                    sleep(6000)
                }
                continue
            }

            if (isVerifyCnt > 2) {
                comm.showLog('开始验证码滑块【isVerifyCnt>2】')
                sleep(10000)
            }
            // comm.showLog('开始切换ip')
            // httpToString(httpServer+'/api/setProxy?client_no='+client_no+'&key=63347f5d946164a23faca26b78a91e1c&task_id='+last_task_id)
            // httpShell('am force-stop com.zhiliaoapp.musically')
            // sleep(3000)
            // if(!app.launch('com.zhiliaoapp.musically')) {
            //     console.log('App 启动失败')
            //     return "tk启动失败"
            //  }
            //  sleep(10000)
            //  app.startActivity({ 

            //     action: "android.intent.action.VIEW", 
            //     data:"snssdk1233://ec/"+p,
            //     packageName: "com.zhiliaoapp.musically",    
            // });
            // sleep(5000)
            if (isVerifyCnt < 5 && isVerifyCnt == 0) {
                comm.showLog('开始验证码滑块【isVerifyCnt<5&&isVerifyCnt==0】')
                let randomTime = random(1500, 2100);
                let secsdkCaptDrag = selector().idContains('secsdk-captcha-drag-wrapper').visibleToUser(true).findOne(20000)
                if (!secsdkCaptDrag) {
                    console.log('验证码滑块按钮控件未找到')
                    return '验证码滑块按钮控件未找到'
                }
                sleep(5000)
                try {
                    for (let i = 0; i < 3; i++) {
                        sleep(10000)
                        let sp = random(300, 630)
                        comm.showLog('sp:' + sp)
                        let pos = []
                        let secsdkCapBounds = secsdkCaptDrag.bounds()
                        let startX = secsdkCapBounds.left + random(0, 100);
                        comm.showLog('startX:' + startX)
                        let startY = random(secsdkCapBounds.top, secsdkCapBounds.bottom);
                        comm.showLog('startY:' + startY)
                        pos.push([startX, random(startY - 2, startY + 2)]);
                        comm.showLog('pos[0]:' + pos[0])
                        pos.push([startX + sp, random(startY - 2, startY + 2)]);
                        comm.showLog('pos[1]:' + pos[1])
                        gesture(randomTime, pos)
                        sleep(5000)
                    }
                } catch (e) {
                    console.log(e)
                }
                back()
                sleep(5000)
                //back() 
                // comm.showLog('开始切换ip')
                // httpToString(httpServer+'/api/setProxy?client_no='+client_no+'&key=63347f5d946164a23faca26b78a91e1c&task_id='+last_task_id)
                // httpToString(httpServer+'/api/setProxy?client_no='+client_no+'&key=63347f5d946164a23faca26b78a91e1c&task_id='+last_task_id)
                // sleep(10000)
                retryBtn = selector().textContains('Retry').findOne(3000)
                if (retryBtn) {
                    comm.clickObj(retryBtn)
                    sleep(6000)
                    continue
                }
            } else if (isVerifyCnt < 5) {
                comm.showLog('开始验证码滑块【isVerifyCnt<5】')
                imageCodeVerify(false)
                //isVerifyCnt=0
            }
        } else {
            comm.showLog('没有找到Verify to continue')
            break
        }
    }
}
function imageCodeVerify_my_new() {
    let vcnt = 1
    for (let i = 0; i < 30; i++) {
        comm.showLog('imageCodeVerify_my循环中:' + i)
        let doStr = 'Add to '
        let loadingBtn = selector().textContains(doStr).findOne(3000)
        if (loadingBtn) {
            break
        } else {
            closeAllPop()
        }
        // if(i>5){

        //     let homeBtn = selector().textContains('Home').visibleToUser(true).findOne(1000)
        //     if(homeBtn){
        //         openProduct(product_id,seller_id)
        //         sleep(5000)  
        //     }
        // }
        let retryBtn = selector().textContains('Retry').findOne(1000)
        if (retryBtn) {
            sleep(6000)
            comm.clickObj(retryBtn)
            sleep(6000)
            continue  //停止当前循环，继续下一次循环
        }
        // if(i==10&&vcnt==1){
        //     httpToString(httpServer+'/api/setProxy?client_no='+client_no+'&key=63347f5d946164a23faca26b78a91e1c&task_id='+last_task_id) 
        // }
        let isVerifyCnt = 6
        let imageVerifyTips = selector().textContains('Verify to continue:').visibleToUser(true).findOne(1000) || selector().textContains('puzzle piece into place').visibleToUser(true).findOne(1000)
        if (imageVerifyTips) {
            comm.showLog('Verify to continue,存在')
            if (isVerifyCnt > 5) {
                comm.showLog('开始等待....')
                sleep(2000)
                if (vcnt < 3) {
                    comm.showLog('尝试走付费验证流程')
                    // 初始尝试走付费验证流程
                    // imageCodeVerify(false)
                    imageCodeVerify_test2()
                    vcnt++
                    continue
                }
                if (vcnt == 3) {
                    comm.showLog('开始验证码滑块【vcnt==3】') //一个随机的滑动长度
                    let scdBounds = [265, 1785]  //预定一个滑块坐标
                    let randomTime = random(1500, 2100);
                    let secsdkCaptDrag = selector().idContains('secsdk-captcha-drag-wrapper').visibleToUser(true).findOne(20000)
                    if (!secsdkCaptDrag) {
                        comm.showLog('验证码滑块按钮控件未找到')
                        continue
                        //return '验证码滑块按钮控件未找到'
                    } else {
                        scdBounds = secsdkCaptDrag.bounds()
                    }
                    sleep(1000)
                    let sp = random(300, 630)
                    let pos = []
                    // let secsdkCapBounds = secsdkCaptDrag.bounds()
                    let secsdkCapBounds = scdBounds
                    let startX = secsdkCapBounds.left + random(0, 100);
                    let startY = random(secsdkCapBounds.top, secsdkCapBounds.bottom);
                    pos.push([startX, random(startY - 2, startY + 2)]);
                    pos.push([startX + sp, random(startY - 2, startY + 2)]);
                    gesture(randomTime, pos)
                    sleep(5000)
                }
                if (vcnt == 8) {
                    comm.showLog('开始验证码滑块【vcnt==8】')
                    imageCodeVerify(false)
                } else {
                    comm.showLog('开始验证码滑块【vcnt==8else】')
                    for (let j = 0; j < 10; j++) {
                        loadingBtn = selector().textContains(doStr).findOne(1000)
                        if (loadingBtn) {
                            break
                        }
                    }
                }
                // comm.showLog('开始切换ip')
                // if(vcnt%2==1){
                //     httpToString(httpServer+'/api/setProxy?client_no='+client_no+'&key=63347f5d946164a23faca26b78a91e1c&task_id='+last_task_id)
                //     //httpToString(httpServer+'/api/setProxy?client_no='+client_no+'&key=63347f5d946164a23faca26b78a91e1c&task_id='+last_task_id)
                //     sleep(3000)
                // }
                vcnt++
                comm.showLog('关闭滑块')
                sleep(1000)
                click(1118, 979)
                retryBtn = selector().textContains('Retry').findOne(2000)
                if (retryBtn) {
                    sleep(6000)
                    comm.clickObj(retryBtn)
                    sleep(6000)
                }
                continue
            }

            if (isVerifyCnt > 2) {
                comm.showLog('开始验证码滑块【isVerifyCnt>2】')
                sleep(10000)
            }
            // comm.showLog('开始切换ip')
            // httpToString(httpServer+'/api/setProxy?client_no='+client_no+'&key=63347f5d946164a23faca26b78a91e1c&task_id='+last_task_id)
            // httpShell('am force-stop com.zhiliaoapp.musically')
            // sleep(3000)
            // if(!app.launch('com.zhiliaoapp.musically')) {
            //     console.log('App 启动失败')
            //     return "tk启动失败"
            //  }
            //  sleep(10000)
            //  app.startActivity({ 

            //     action: "android.intent.action.VIEW", 
            //     data:"snssdk1233://ec/"+p,
            //     packageName: "com.zhiliaoapp.musically",    
            // });
            // sleep(5000)
            if (isVerifyCnt < 5 && isVerifyCnt == 0) {
                comm.showLog('开始验证码滑块【isVerifyCnt<5&&isVerifyCnt==0】')
                let randomTime = random(1500, 2100);
                let secsdkCaptDrag = selector().idContains('secsdk-captcha-drag-wrapper').visibleToUser(true).findOne(20000)
                if (!secsdkCaptDrag) {
                    console.log('验证码滑块按钮控件未找到')
                    return '验证码滑块按钮控件未找到'
                }
                sleep(5000)
                try {
                    for (let i = 0; i < 3; i++) {
                        sleep(10000)
                        let sp = random(300, 630)
                        comm.showLog('sp:' + sp)
                        let pos = []
                        let secsdkCapBounds = secsdkCaptDrag.bounds()
                        let startX = secsdkCapBounds.left + random(0, 100);
                        comm.showLog('startX:' + startX)
                        let startY = random(secsdkCapBounds.top, secsdkCapBounds.bottom);
                        comm.showLog('startY:' + startY)
                        pos.push([startX, random(startY - 2, startY + 2)]);
                        comm.showLog('pos[0]:' + pos[0])
                        pos.push([startX + sp, random(startY - 2, startY + 2)]);
                        comm.showLog('pos[1]:' + pos[1])
                        gesture(randomTime, pos)
                        sleep(5000)
                    }
                } catch (e) {
                    console.log(e)
                }
                back()
                sleep(5000)
                //back() 
                // comm.showLog('开始切换ip')
                // httpToString(httpServer+'/api/setProxy?client_no='+client_no+'&key=63347f5d946164a23faca26b78a91e1c&task_id='+last_task_id)
                // httpToString(httpServer+'/api/setProxy?client_no='+client_no+'&key=63347f5d946164a23faca26b78a91e1c&task_id='+last_task_id)
                // sleep(10000)
                retryBtn = selector().textContains('Retry').findOne(3000)
                if (retryBtn) {
                    comm.clickObj(retryBtn)
                    sleep(6000)
                    continue
                }
            } else if (isVerifyCnt < 5) {
                comm.showLog('开始验证码滑块【isVerifyCnt<5】')
                imageCodeVerify(false)
                //isVerifyCnt=0
            }
        } else {
            comm.showLog('没有找到Verify to continue')
            break
        }
    }
}

// 处理sku
function doSku(sku) {
    // 判断sku是否为空
    if (sku == '') {
        return true
    }
    // 通过"---"分割sku
    let skuList = sku.split("----")
    if (skuList.length == 0) {
        return false
    }
    let rMark = true
    for (let i = 0; i < skuList.length; i++) {
        comm.showLog("找：" + skuList[i])
        sleep(2000)
        if (!skuList[i].includes(":")) {
            return false
        }
        let isSwipe = 0
        for (let j = 0; j < 10; j++) {
            comm.showLog("doSku循环中:" + j)

            sleep(2000)
            let skuItem = skuList[i]
            if (findSkuBtn(skuItem)) {
                comm.showLog("skuItem找到")
                rMark = true
                break
            } else {
                comm.showLog("skuItem未找到")
                rMark = false
                sleep(1000)
                if (isSwipe == 3) {
                    break
                }
                // 找一下see more(不知道实测对不对)
                let seeMore = selector().textContains('See more').visibleToUser(true).findOne(1000)
                if (seeMore) {
                    comm.showLog("see more找到")
                    comm.clickObj(seeMore)
                    comm.randomSwipeSlow(2)
                }

                if (isSwipe == 0) {  //如果还没有滑动过
                    //
                    comm.showLog("开始查找 -android.widget.GridView")
                    let gridView = selector().className('android.widget.GridView').visibleToUser(true).find()
                    if (gridView.length > 0) {
                        swipe(gridView[0].bounds().centerX() + 150, gridView[0].bounds().centerY(), gridView[0].bounds().centerX() - 250, gridView[0].bounds().centerY() + 5, random(300, 450))
                        isSwipe = 1
                    }
                }
                if (isSwipe == 2) {  //如果还没有滑动过
                    comm.randomSwipeSlow(1)
                    isSwipe = 3
                }
                isSwipe = 2
            }
        }
        sleep(5000)
        comm.randomSwipeSlow(1)
    }
    // Texture:Loose Deep Wave---Length:20 22 24
    // for (let i = 0; i < skuList.length; i++) {
    //     if (!skuList[i].includes(":")){
    //         return false
    //     }
    //     let isSwipe=false
    //     for (let j = 0; j < 30; j++) {
    //         comm.showLog("doSku循环中:"+j)
    //         let skuItem=skuList[i]
    //         if (findSkuBtn(skuItem)){
    //             comm.showLog("skuItem找到")
    //             break
    //         }else{
    //             comm.showLog("skuItem未找到")
    //             sleep(1000)
    //             if(isSwipe){
    //                 break
    //             }
    //             // 找一下see more(不知道实测对不对)
    //             if(!isSwipe){  //如果还没有滑动过
    //                 let seeMore=selector().textContains('See more').visibleToUser(true).findOne(1000)
    //                 if(seeMore){
    //                     comm.showLog("see more找到")
    //                     comm.clickObj(seeMore)
    //                 }
    //             }
    //             if (!isSwipe){  //如果还没有滑动过
    //                 comm.randomSwipeSlow(1)
    //                 isSwipe=true
    //             }
    //         }
    //         sleep(1000)
    //     }
    //     sleep(1000)
    //     comm.randomSwipeSlow(1)
    // }
    return true
}
// 具体找对应sku按钮
function findSkuBtn(skuItem) {
    comm.showLog("触发findSkuBtn" + skuItem)
    comm.randomToAndFroSwipe()
    sleep(2000)
    // Texture:Loose Deep Wave
    // Length:20 22 24
    let isFind = false
    let skuKey = skuItem.split(":")[0]
    // comm.showLog("skuKey"+skuKey)
    let skuValue = skuItem.split(":")[1]
    //率先判断有没有唯一的一个完全一样的
    let singoObj = selector().text(skuValue).visibleToUser(true).find()
    if (singoObj.length == 1) {
        comm.clickObj(singoObj[0])
        return true
    }
    //
    let skuVslic = skuValue.split("") //切成["H", "e", "l", "l", "o"]
    console.log("skuVslic.lengh:" + skuVslic.length)
    for (let i = skuVslic.length; i > 0; i--) {
        // 找到对应选项
        //如果是xl的话，会存在很多带xl结尾的数据，每一个都点，然后判断显示的内容对不对
        // selector().text("完整文本").findOne();
        // let skuValueObj=selector().text(skuValue.slice(0,i)).findOne(5000)
        console.log("要找的文字:" + skuValue.slice(0, i))
        let skuValueObj = selector().textContains(skuValue.slice(0, i)).visibleToUser(true).find()
        // let skuValueObj=selector().textContains(skuValue).visibleToUser(true).findOne(500)
        if (skuValueObj.length == 1) {
            comm.showLog(skuValue + "存在，准备点一下")
            sleep(2000)
            comm.clickObj(skuValueObj[0]) //如果只有一个，点一下
            isFind = true
            break
        } else if (skuValueObj.length > 1) {
            comm.showLog("存在多个skuValueObj，准备点一下")
            //点一下，判断页面中有没有完全匹配
            for (let j = 0; j < skuValueObj.length; j++) {
                let isVcount1 = selector().textContains(skuValue.slice(0, i)).visibleToUser(true).find()
                comm.showLog("该元素的数量" + isVcount1.length)
                comm.clickObj(skuValueObj[j])
                //
                let isV = selector().text(skuValue).visibleToUser(true).findOne(1000)
                if (isV) {
                    let isVcount2 = selector().textContains(skuValue.slice(0, i)).visibleToUser(true).find()
                    comm.showLog("点完之后的数量" + isVcount2.length)
                    if (isVcount1.length < isVcount2.length) {
                        return true
                    }
                } else {
                    comm.clickObj(skuValueObj[j])
                    sleep(2000)
                }
            }
            return false
        } else {
            comm.showLog("skuValueObj未找到")
            skuValueObj = selector().text(skuKey + ": " + skuValue).findOne(1000)
            if (skuValueObj) {
                //说明已经默认选上
                isFind = true
                break
            }
            sleep(2000)
            // comm.randomSwipeSlow(1)
        }
    }
    return isFind

}

// 递归查找 TextView
function findTextView(view) {
    if (!view) return null;
    if (view.className() === "android.widget.TextView") return view;
    for (let child of view.children()) {
        let result = findTextView(child);
        if (result) return result;
    }
    return null;
}

function doSku_v2_test(sku) {
    // 判断sku是否为空
    if (sku == '') {
        return true
    }
    // 通过"---"分割sku
    let skuList = sku.split("----")
    if (skuList.length == 0) {
        return false
    }
    //把页面中所有seemore全部点开
    // for (let i=0;i<10;i++){
    //     comm.randomSwipeSlow(1)
    //     sleep(2000)
    //     let seeMore=selector().textContains('See more').visibleToUser(true).findOne(1000)
    //     if(seeMore){
    //         comm.showLog("see more找到")
    //         comm.clickObj(seeMore)
    //     }
    //     let quantity=selector().textContains('Quantity:').visibleToUser(true).findOne(1000)
    //     if (quantity){
    //          break
    //     }
    // }

    let rMark = false
    for (let i = 0; i < skuList.length; i++) {
        comm.showLog("找：" + skuList[i])
        sleep(2000)
        if (!skuList[i].includes(":")) {
            return false
        }
        for (let j = 0; j < 10; j++) {
            comm.showLog("doSku循环中:" + j)
            //限定一个坐标范围
            let top = 0
            // let bottom = 0
            let match = skuList[i].match(/^([^:]+):(.+)$/);
            console.log(match[1])
            let checkKey = selector().textContains(match[1]).visibleToUser(true).findOne(1000)
            if (checkKey) {
                top = checkKey.bounds().centerY()
            }
            comm.showLog("打印top:" + top)
            // if (i+1 <= skuList.length){
            //     let checkKey = selector().text(skuList[i+1].split(":")[0]+":").visibleToUser(true).findOne(1000)
            //     if (checkKey){
            //         bottom = checkKey.bounds().centerX()
            //     }
            // }
            //
            sleep(2000)
            let skuItem = skuList[i]
            if (findSkuGrid_v2_test(skuItem, top)) {
                comm.showLog("skuItem找到【滑动grid】")
                rMark = true
                break
            } else if (findSkuBtn_v2_test(skuItem, top)) {
                comm.showLog("skuItem找到【按钮】")
                rMark = true
                break
            } else if (findSkuGrid_v2_NoText(skuItem, top)) {
                comm.showLog("skuItem找到【无文字滑动grid】")
                rMark = true
                break
            } else {
                comm.showLog("skuItem未找到")
                rMark = false
                //看看是不是有seemore
                let seeMore = selector().textContains('See more').visibleToUser(true).findOne(1000)
                if (seeMore) {
                    comm.showLog("see more找到")
                    comm.clickObj(seeMore)
                    comm.randomSwipeSlowLong(1)
                }
            }

            comm.randomSwipeSlowLong(1)
            sleep(3000)
        }
    }
    return rMark
}


function doSku_v2_2(sku) {
    // 判断sku是否为空
    if (sku == '') {
        return true
    }
    // 通过"---"分割sku
    let skuList = sku.split("----")
    if (skuList.length == 0) {
        return false
    }
    //把页面中所有seemore全部点开
    // for (let i=0;i<10;i++){
    //     comm.randomSwipeSlow(1)
    //     sleep(2000)
    //     let seeMore=selector().textContains('See more').visibleToUser(true).findOne(1000)
    //     if(seeMore){
    //         comm.showLog("see more找到")
    //         comm.clickObj(seeMore)
    //     }
    //     let quantity=selector().textContains('Quantity:').visibleToUser(true).findOne(1000)
    //     if (quantity){
    //          break
    //     }
    // }

    let rMark = false
    for (let i = 0; i < skuList.length; i++) {
        comm.showLog("找：" + skuList[i])
        sleep(2000)
        if (!skuList[i].includes(":")) {
            return false
        }
        for (let j = 0; j < 5; j++) {
            comm.showLog("doSku循环中:" + j)
            //限定一个坐标范围
            let top = 0
            // let bottom = 0
            let match = skuList[i].match(/^([^:]+):(.+)$/);
            console.log(match[1])
            let checkKey = selector().textContains(match[1]).visibleToUser(true).findOne(1000)
            if (checkKey) {
                top = checkKey.bounds().centerY()
            }
            comm.showLog("打印top111:" + top)
            // if (i+1 <= skuList.length){
            //     let checkKey = selector().text(skuList[i+1].split(":")[0]+":").visibleToUser(true).findOne(1000)
            //     if (checkKey){
            //         bottom = checkKey.bounds().centerX()
            //     }
            // }
            //
            sleep(2000)
            let skuItem = skuList[i]
            //有可能直接就有一个
            // let match2 = skuItem.match(/^([^:]+):+:?(.*)$/);
            // let keyword = match2[2].trim()
            // comm.showLog("直接skuValue:" + keyword)
            // let keywordObj = selector().text(keyword).visibleToUser(true).findOne(1000)
            // if (keywordObj) {
            //     comm.clickObj(keywordObj)
            //     rMark = true
            //     break
            // }
            comm.showLog("没有直接的，需要进逻辑")
            if (findSkuGrid_v2(skuItem, top)) {
                comm.showLog("skuItem找到【滑动grid】")
                rMark = true
                break
            } else if (findSkuBtn_v2(skuItem, top)) {
                comm.showLog("skuItem找到【按钮】")
                rMark = true
                break
            } else if (findSkuGrid_v2_NoText(skuItem, top)) {
                comm.showLog("skuItem找到【无文字滑动grid】")
                rMark = true
                break
            } else {
                comm.showLog("skuItem未找到")
                //看看是不是有seemore
                let seeMore = selector().textContains('See more').visibleToUser(true).findOne(1000)
                if (seeMore) {
                    comm.showLog("see more找到")
                    comm.clickObj(seeMore)
                    comm.randomSwipeSlowLong(1)
                }
            }
            if (i < 0) {
                comm.randomSwipeSlowLong(1)
                sleep(3000)
            }
        }
        comm.randomSwipeSlow(1)
        sleep(3000)
    }
    return rMark
}


function doSku_v2(sku) {
    // 判断sku是否为空
    if (sku == '') {
        return true
    }
    // 通过"---"分割sku
    let skuList = sku.split("----")
    if (skuList.length == 0) {
        return false
    }
    //把页面中所有seemore全部点开
    // for (let i=0;i<10;i++){
    //     comm.randomSwipeSlow(1)
    //     sleep(2000)
    //     let seeMore=selector().textContains('See more').visibleToUser(true).findOne(1000)
    //     if(seeMore){
    //         comm.showLog("see more找到")
    //         comm.clickObj(seeMore)
    //     }
    //     let quantity=selector().textContains('Quantity:').visibleToUser(true).findOne(1000)
    //     if (quantity){
    //          break
    //     }
    // }

    let rMark = false
    for (let i = 0; i < skuList.length; i++) {
        comm.showLog("找：" + skuList[i])
        sleep(2000)
        if (!skuList[i].includes(":")) {
            return false
        }
        for (let j = 0; j < 5; j++) {
            comm.showLog("doSku循环中:" + j)
            //限定一个坐标范围
            let top = 0
            // let bottom = 0
            let match = skuList[i].match(/^([^:]+):(.+)$/);
            console.log(match[1])
            console.log(match[2])
            let checkKey = selector().textContains(match[1]).visibleToUser(true).findOne(1000)
            if (checkKey) {
                top = checkKey.bounds().centerY()
            }
            comm.showLog("打印top:" + top)
            //判断一下前面key的位置和value的位置有没有一起的，然后判断需不需要按
            // let checkValue = selector().textContains(match[2]).visibleToUser(true).findOne(1000)
            // if (checkValue) {
            //     let top_value = checkValue.bounds().centerY()
            //     comm.showLog("打印top_value:" + top_value)
            //     //判断是否在范围内
            //     if (isDifferenceInRange(top, top_value, 8)) {
            //         comm.showLog("不用点了，已经有了")
            //         rMark = true
            //         break
            //     } else {
            //         comm.showLog("不在范围内")
            //     }
            // }

            // if (i+1 <= skuList.length){
            //     let checkKey = selector().text(skuList[i+1].split(":")[0]+":").visibleToUser(true).findOne(1000)
            //     if (checkKey){
            //         bottom = checkKey.bounds().centerX()
            //     }
            // }
            //
            sleep(2000)
            let skuItem = skuList[i]
            if (findSkuGrid_v2(skuItem, top)) {
                comm.showLog("skuItem找到【滑动grid】")
                rMark = true
                break
            } else if (findSkuBtn_v2(skuItem, top)) {
                comm.showLog("skuItem找到【按钮】")
                rMark = true
                break
            } else if (findSkuGrid_v2_NoText(skuItem, top)) {
                comm.showLog("skuItem找到【无文字滑动grid】")
                rMark = true
                break
            } else {
                comm.showLog("skuItem未找到")
                //看看是不是有seemore
                let seeMore = selector().textContains('See more').visibleToUser(true).findOne(1000)
                if (seeMore) {
                    comm.showLog("see more找到")
                    comm.clickObj(seeMore)
                    comm.randomSwipeSlowLong(1)
                }
            }
            if (i < 0) {
                comm.randomSwipeSlowLong(1)
                sleep(3000)
            }
        }
        comm.randomSwipeSlow(1)
        sleep(3000)
    }
    return rMark
}


function doSku_v3(sku) {
    // 判断sku是否为空
    if (sku == '') {
        return true
    }
    // 通过"---"分割sku
    let skuList = sku.split("----")
    if (skuList.length == 0) {
        return false
    }
    //把页面中所有seemore全部点开
    // for (let i=0;i<10;i++){
    //     comm.randomSwipeSlow(1)
    //     sleep(2000)
    //     let seeMore=selector().textContains('See more').visibleToUser(true).findOne(1000)
    //     if(seeMore){
    //         comm.showLog("see more找到")
    //         comm.clickObj(seeMore)
    //     }
    //     let quantity=selector().textContains('Quantity:').visibleToUser(true).findOne(1000)
    //     if (quantity){
    //          break
    //     }
    // }

    var rMark = false
    for (let i = 0; i < skuList.length; i++) {
        rMark = false
        comm.showLog("找：" + skuList[i])
        sleep(2000)
        if (!skuList[i].includes(":")) {
            return false
        }
        for (let j = 0; j < 5; j++) {
            comm.showLog("doSku循环中:" + j)
            //限定一个坐标范围
            let top = 0
            // let bottom = 0
            let match = skuList[i].match(/^([^:]+):(.+)$/);
            console.log(match[1])  //kay
            console.log(match[2])  //value
            let checkKey = selector().textContains(match[1]).visibleToUser(true).findOne(1000)
            if (checkKey) {
                top = checkKey.bounds().centerY()
            }
            comm.showLog("打印top:" + top)
            //判断一下前面key的位置和value的位置有没有一起的，然后判断需不需要按
            let checkValues = selector().textContains(match[2]).visibleToUser(true).find()
            if (checkValues.length > 0) {
                for (let o = 0; o < checkValues.length; o++) {
                    let top_value_Y = checkValues[o].bounds().centerY()
                    if (isDifferenceInRange(top, top_value_Y, 8)) {
                        //说明他们是在同一行
                        comm.showLog("同一行，但是不知道是不是同一个,打印一下那个文字：")
                        comm.showLog(checkValues[o].text())
                        comm.showLog(skuList[i])
                        comm.showLog(match[1] + `: ` + match[2])
                        comm.showLog(match[1] + `：` + match[2])
                        comm.showLog(match[2])
                        // Ring Gauge: 18G
                        if (checkValues[o].text() == match[2] || checkValues[o].text() == (match[1] + `: ` + match[2]) || checkValues[o].text() == (match[1] + `：` + match[2]) || checkValues[o].text() == skuList[i]) {
                            comm.showLog("不用点了，已经有了")
                            rMark = true
                            break
                        }
                    }
                }
                if (rMark) {
                    break
                } else {
                    comm.showLog("不在范围内")
                }
            }

            // if (i+1 <= skuList.length){
            //     let checkKey = selector().text(skuList[i+1].split(":")[0]+":").visibleToUser(true).findOne(1000)
            //     if (checkKey){
            //         bottom = checkKey.bounds().centerX()
            //     }
            // }
            //
            sleep(2000)
            let skuItem = skuList[i]
            if (findSkuGrid_v2(skuItem, top)) {
                comm.showLog("skuItem找到【滑动grid】")
                rMark = true
                break
            } else if (findSkuBtn_v2(skuItem, top)) {
                comm.showLog("skuItem找到【按钮】")
                rMark = true
                break
            } else if (findSkuGrid_v2_NoText(skuItem, top)) {
                comm.showLog("skuItem找到【无文字滑动grid】")
                rMark = true
                break
            } else {
                comm.showLog("skuItem未找到")
                //看看是不是有seemore
                let seeMore = selector().textContains('See more').visibleToUser(true).findOne(1000)
                if (seeMore) {
                    comm.showLog("see more找到")
                    comm.clickObj(seeMore)
                    comm.randomSwipeSlowLong(1)
                }
            }
            if (j > 1) {
                sleep(3000)
                comm.showLog("划一下--" + j)
                comm.randomSwipeSlowLong(1)
                sleep(3000)
            }
        }
        comm.randomSwipeSlow(1)
        sleep(3000)
    }
    return rMark
}
//
function doSku_v4(sku) {
    // 判断sku是否为空
    if (sku == '') {
        return true
    }
    // 通过"---"分割sku
    let skuList = sku.split("----")
    if (skuList.length == 0) {
        return false
    }
    //把页面中所有seemore全部点开
    // for (let i=0;i<10;i++){
    //     comm.randomSwipeSlow(1)
    //     sleep(2000)
    //     let seeMore=selector().textContains('See more').visibleToUser(true).findOne(1000)
    //     if(seeMore){
    //         comm.showLog("see more找到")
    //         comm.clickObj(seeMore)
    //     }
    //     let quantity=selector().textContains('Quantity:').visibleToUser(true).findOne(1000)
    //     if (quantity){
    //          break
    //     }
    // }

    var rMark = false
    for (let i = 0; i < skuList.length; i++) {
        rMark = false
        comm.showLog("找：" + skuList[i])
        sleep(2000)
        if (!skuList[i].includes(":")) {
            return false
        }
        for (let j = 0; j < 1; j++) {
            comm.showLog("doSku循环中:" + j)
            //限定一个坐标范围
            let top = 0
            // let bottom = 0
            let match = skuList[i].match(/^([^:]+):(.+)$/);
            console.log(match[1])
            console.log(match[2])
            let checkKey = selector().textContains(match[1]).visibleToUser(true).findOne(1000)
            if (checkKey) {
                top = checkKey.bounds().centerY()
            }
            comm.showLog("打印top:" + top)
            //判断一下前面key的位置和value的位置有没有一起的，然后判断需不需要按
            let checkValues = selector().textContains(match[2]).visibleToUser(true).find()
            if (checkValues.length > 0) {
                for (let o = 0; o < checkValues.length; o++) {
                    let top_value_Y = checkValues[o].bounds().centerY()
                    if (isDifferenceInRange(top, top_value_Y, 8)) {
                        //说明他们是在同一行
                        comm.showLog("同一行，但是不知道是不是同一个,打印一下那个文字：")
                        comm.showLog(checkValues[o].text())
                        comm.showLog(skuList[i])
                        comm.showLog(match[1] + `: ` + match[2])
                        comm.showLog(match[1] + `：` + match[2])
                        comm.showLog(match[2])
                        // Ring Gauge: 18G
                        if (checkValues[o].text() == match[2] || checkValues[o].text() == (match[1] + `: ` + match[2]) || checkValues[o].text() == (match[1] + `：` + match[2]) || checkValues[o].text() == skuList[i]) {
                            comm.showLog("不用点了，已经有了")
                            rMark = true
                            break
                        }
                    }
                }
                if (rMark) {
                    break
                } else {
                    comm.showLog("不在范围内")
                }
            }

            // if (i+1 <= skuList.length){
            //     let checkKey = selector().text(skuList[i+1].split(":")[0]+":").visibleToUser(true).findOne(1000)
            //     if (checkKey){
            //         bottom = checkKey.bounds().centerX()
            //     }
            // }
            //
            sleep(2000)
            let skuItem = skuList[i]
            if (findSkuBtn_v2(skuItem, top)) {
                comm.showLog("skuItem找到【按钮】")
                rMark = true
                comm.showLog("检查break1--" + j)
                break
                // } else if (findSkuBtn_v2(skuItem, top)) {
                //     comm.showLog("skuItem找到【按钮】")
                //     rMark = true
                //     break
                // } else if (findSkuGrid_v2_NoText(skuItem, top)) {
                //     comm.showLog("skuItem找到【无文字滑动grid】")
                //     rMark = true
                //     comm.showLog("检查break2--" + j)
                //     break
                // } else {
                //     comm.showLog("skuItem未找到")
                //     //看看是不是有seemore
                //     let seeMore = selector().textContains('See more').visibleToUser(true).findOne(1000)
                //     if (seeMore) {
                //         comm.showLog("see more找到")
                //         comm.clickObj(seeMore)
                //         comm.randomSwipeSlowLong(1)
                //     }
                //     comm.showLog("检查break3--" + j)
            }
            if (j > 1) {
                sleep(3000)
                comm.showLog("划一下--" + j)
                comm.randomSwipeSlowLong(1)
                sleep(3000)
            }
        }
        comm.randomSwipeSlow(1)
        sleep(3000)
    }
    return rMark
}

// 具体找对应sku按钮
function findSkuBtn_v2_test(skuItem, top) {
    comm.showLog("触发findSkuBtn:" + skuItem)
    // comm.randomToAndFroSwipe()
    sleep(2000)
    // Texture:Loose Deep Wave
    // Length:20 22 24
    let isFind = false
    let match = skuItem.match(/^([^:]+):(.+)$/);
    let skuKey = match[1]
    comm.showLog("skuKey:" + skuKey)
    let skuValue = match[2]
    comm.showLog("skuValue:" + skuValue)
    //率先判断有没有唯一的一个完全一样的
    let singoObj = selector().text(skuValue).visibleToUser(true).find()
    if (singoObj.length == 1) {
        comm.clickObj(singoObj[0])
        return true
    }
    //
    let skuVslic = skuValue.split("") //切成["H", "e", "l", "l", "o"]
    console.log("skuVslic.lengh:" + skuVslic.length)
    if (skuVslic.length > 8) {
        skuValue = skuValue.slice(0, 8)
        skuVslic = skuValue.split("")
    }
    if (skuVslic.length < 3) {
        let singoObj = selector().text(skuValue).visibleToUser(true).find()
        if (singoObj.length == 1) {
            comm.clickObj(singoObj[0])
            return true
        } else {
            return false
        }
    } else {
        for (let i = skuVslic.length; i > 3; i--) {
            // 找到对应选项
            //如果是xl的话，会存在很多带xl结尾的数据，每一个都点，然后判断显示的内容对不对
            // selector().text("完整文本").findOne();
            // let skuValueObj=selector().text(skuValue.slice(0,i)).findOne(5000)
            console.log("要找的文字:" + skuValue.slice(0, i))
            let skuValueObj = selector().textContains(skuValue.slice(0, i)).visibleToUser(true).find()
            // let skuValueObj=selector().textContains(skuValue).visibleToUser(true).findOne(500)
            if (skuValueObj.length == 1) {
                comm.showLog(skuValue + "存在，准备点一下")
                comm.showLog(skuValueObj[0].text() + "存在，准备匹配一下")
                if (skuValueObj[0].text() == skuValue) {
                    //匹配文字是不是完全一样
                    sleep(2000)
                    comm.clickObj(skuValueObj[0]) //如果只有一个，点一下
                    isFind = true
                    break
                }
                // 如果包含 key 也包含value
                if (skuValueObj[0].text().includes(skuKey) && skuValueObj[0].text().includes(skuValue)) {
                    sleep(2000)
                    comm.clickObj(skuValueObj[0]) //如果只有一个，点一下
                    isFind = true
                    break
                }

                // comm.showLog(skuValue + "存在，准备点一下")
                // sleep(2000)
                // comm.clickObj(skuValueObj[0]) //如果只有一个，点一下
                // isFind = true
                // break
            } else if (skuValueObj.length > 1) {
                comm.showLog("存在多个skuValueObj，准备点一下")
                //点一下，判断页面中有没有完全匹配
                for (let j = 0; j < skuValueObj.length; j++) {
                    if (skuValueObj[j].bounds().centerY() < top) {
                        comm.showLog("跳过这个在上面的" + skuValueObj[j].bounds().centerY())
                        continue
                    } else {
                        comm.showLog("不跳" + skuValueObj[j].bounds().centerY())
                    }
                    let isVcount1 = selector().textContains(skuValue.slice(0, i)).visibleToUser(true).find()
                    comm.showLog("该元素的数量" + isVcount1.length)
                    comm.clickObj(skuValueObj[j])
                    //
                    let isV = selector().text(skuValue).visibleToUser(true).findOne(1000)
                    if (isV) {
                        let isVcount2 = selector().textContains(skuValue.slice(0, i)).visibleToUser(true).find()
                        comm.showLog("点完之后的数量" + isVcount2.length)
                        if (isVcount1.length < isVcount2.length) {
                            return true
                        }
                    } else {
                        comm.clickObj(skuValueObj[j])
                        sleep(2000)
                    }
                }
                return false
            } else {
                comm.showLog("skuValueObj未找到")
                skuValueObj = selector().text(skuKey + ": " + skuValue).findOne(1000)
                if (skuValueObj) {
                    //说明已经默认选上
                    isFind = true
                    break
                }
                sleep(2000)
                // comm.randomSwipeSlow(1)
            }
            //
            if (i < 3) {
                return false
            }
        }
    }
    return isFind

}
// 具体找对应sku按钮
function findSkuBtn_v2(skuItem, top) {
    comm.showLog("触发findSkuBtn:" + skuItem)
    // comm.randomToAndFroSwipe()
    sleep(2000)
    // Texture:Loose Deep Wave
    // Length:20 22 24
    let isFind = false
    // let match = skuItem.match(/^([^:]+):(.+)$/);
    // let skuKey = match[1]
    // comm.showLog("skuKey:" + skuKey)
    // let skuValue = match[2]
    // comm.showLog("skuValue:" + skuValue)
    //
    let match = skuItem.match(/^([^:]+):+:?(.*)$/);
    let skuKey = match[1].trim()
    comm.showLog("skuKey:" + skuKey)
    let skuValue = match[2]
    comm.showLog("skuValue:" + skuValue)
    //率先判断有没有唯一的一个完全一样的，判断一个可能带空格，如果没有
    let singoObj_min = selector().text(skuValue).visibleToUser(true).find()
    let singoObj = []
    //可能会出现两个Quantity
    let quantitys = selector().textContains('Quantity').visibleToUser(true).find()
    let quantity = null
    //找到最下面的quantity
    let max_y = 0
    for (let i = 0; i < quantitys.length; i++) {
        if (quantitys[i].bounds().centerY() > max_y) {
            max_y = quantitys[i].bounds().centerY()
            quantity = quantitys[i]
        }
    }
    if (quantity) {
        for (let i = 0; i < singoObj_min.length; i++) {
            if (singoObj_min[i].bounds().centerY() < quantity.bounds().centerY() && singoObj_min[i].bounds().centerY() > top) {
                singoObj.push(singoObj_min[i])
            }
        }
    } else {
        singoObj = singoObj_min
    }
    if (singoObj.length == 1) {
        comm.clickObj(singoObj[0])
        comm.showLog("找到一个")
        sleep(3000)
        return true
    } else if (singoObj.length > 1) {
        comm.showLog("有多个")
    } else {
        comm.showLog("没找到")
    }
    comm.showLog("在检查一下这个skuValue:----" + skuValue)
    //
    let skuVslic = skuValue.split("") //切成["H", "e", "l", "l", "o"]
    console.log("skuVslic.lengh:" + skuVslic.length)
    if (skuVslic.length > 8) {
        skuValue = skuValue.slice(0, 8)
        skuVslic = skuValue.split("")
    }
    if (skuVslic.length < 3) {
        let singoObj = selector().text(skuValue).visibleToUser(true).find()
        if (singoObj.length == 1) {
            comm.clickObj(singoObj[0])
            return true
        } else {
            return false
        }
    } else {
        for (let i = skuVslic.length; i > 3; i--) {
            // 找到对应选项
            //如果是xl的话，会存在很多带xl结尾的数据，每一个都点，然后判断显示的内容对不对
            // selector().text("完整文本").findOne();
            // let skuValueObj=selector().text(skuValue.slice(0,i)).findOne(5000)
            console.log("要找的文字:" + skuValue.slice(0, i))
            let skuValueObj = selector().textContains(skuValue.slice(0, i)).visibleToUser(true).find()
            // let skuValueObj=selector().textContains(skuValue).visibleToUser(true).findOne(500)
            if (skuValueObj.length == 1) {
                comm.showLog(skuValue + "存在，准备点一下")
                comm.showLog(skuValueObj[0].text() + "存在，准备匹配一下")
                if (skuValueObj[0].text() == skuValue) {
                    //匹配文字是不是完全一样
                    sleep(2000)
                    comm.clickObj(skuValueObj[0]) //如果只有一个，点一下
                    isFind = true
                    break
                }
                // 如果包含 key 也包含value
                if (skuValueObj[0].text().includes(skuKey) && skuValueObj[0].text().includes(skuValue)) {
                    sleep(2000)
                    comm.clickObj(skuValueObj[0]) //如果只有一个，点一下
                    isFind = true
                    break
                }
                // comm.showLog(skuValue + "存在，准备点一下")
                // sleep(2000)
                // comm.clickObj(skuValueObj[0]) //如果只有一个，点一下
                // isFind = true
                // break
            } else if (skuValueObj.length > 1) {
                comm.showLog("存在多个skuValueObj，准备点一下")
                //点一下，判断页面中有没有完全匹配
                for (let j = 0; j < skuValueObj.length; j++) {
                    if (skuValueObj[j].bounds().centerY() < top) {
                        comm.showLog("跳过这个在上面的" + skuValueObj[j].bounds().centerY())
                        continue
                    } else {
                        comm.showLog("不跳" + skuValueObj[j].bounds().centerY())
                    }
                    let isVcount1 = selector().textContains(skuValue.slice(0, i)).visibleToUser(true).find()
                    comm.showLog("该元素的数量" + isVcount1.length)
                    comm.clickObj(skuValueObj[j])
                    //
                    let isV = selector().text(skuValue).visibleToUser(true).findOne(1000)
                    if (isV) {
                        let isVcount2 = selector().textContains(skuValue.slice(0, i)).visibleToUser(true).find()
                        comm.showLog("点完之后的数量" + isVcount2.length)
                        if (isVcount1.length < isVcount2.length) {
                            return true
                        }
                    } else {
                        comm.clickObj(skuValueObj[j])
                        sleep(2000)
                    }
                }
                return false
            } else {
                comm.showLog("skuValueObj未找到")
                skuValueObj = selector().text(skuKey + ": " + skuValue).findOne(1000)
                if (skuValueObj) {
                    //说明已经默认选上
                    isFind = true
                    break
                }
                sleep(2000)
                // comm.randomSwipeSlow(1)
            }
            //
            if (i < 3) {
                return false
            }
        }
    }
    return isFind

}
// 具体找对应sku滑块
function findSkuGrid_v2_test(skuItem, top) {
    comm.showLog("触发Sku滑块" + skuItem)
    let match = skuItem.match(/^([^:]+):(.+)$/);
    let keyword = match[2].replace(/^:/, "");
    comm.showLog("skuValue:" + keyword)
    // comm.randomToAndFroSwipe()
    sleep(2000)
    // 获取所有GridView（可能多个）
    let gridViews = className("android.widget.GridView").find();
    if (gridViews.empty()) {
        console.log("未找到任何GridView");
        return;
    }

    console.log("共找到", gridViews.length, "个GridView");
    var found = false;
    // 遍历处理每个GridView
    for (let i = 0; i < gridViews.length; i++) {
        console.log("\n开始处理第" + (i + 1) + "个GridView");
        let bounds = gridViews[i].bounds();
        console.log("位置:", bounds.left + "," + bounds.top + " - " + bounds.right + "," + bounds.bottom);
        if (bounds.centerY() < top) {
            continue
        }
        // 确保GridView在屏幕可见区域
        if (bounds.top < 0 || bounds.bottom > device.height) {
            console.log("需要滚动到可见区域...");
            scrollTo(bounds.centerX(), bounds.centerY());
            sleep(1000);
        }

        // 处理当前GridView
        found = processGridView_test(gridViews[i], i, keyword);
        if (found) {
            console.log("已在当前GridView找到目标");
            return true; // 退出forEach循环
        }
    };

    console.log("所有GridView处理完成");
    return found
}
function findSkuGrid_v2(skuItem, top) {
    comm.showLog("触发Sku滑块" + skuItem) //text = 01:09:06.395/D: 触发Sku滑块Battery:Green 1 
    // let match = skuItem.match(/^([^:]+):(.+)$/);
    // let keyword = match[2].replace(/^:/, "");
    let match = skuItem.match(/^([^:]+):+:?(.*)$/);
    // let keyword = match[2].trim()
    let keyword = match[2]
    comm.showLog("skuValue:" + keyword)  //text = 01:09:06.396/D: skuValue:Green 1
    // comm.randomToAndFroSwipe()
    sleep(2000)
    // 获取所有GridView（可能多个）
    let gridViews = className("android.widget.GridView").find();
    if (gridViews.empty()) {
        console.log("未找到任何GridView");
        return;
    }

    console.log("共找到", gridViews.length, "个GridView");
    var found = false;
    // 遍历处理每个GridView
    for (let i = 0; i < gridViews.length; i++) {
        console.log("\n开始处理第" + (i + 1) + "个GridView");
        let bounds = gridViews[i].bounds();
        console.log("位置:", bounds.left + "," + bounds.top + " - " + bounds.right + "," + bounds.bottom);
        if (bounds.centerY() < top) {
            continue
        }
        // 确保GridView在屏幕可见区域
        if (bounds.top < 0 || bounds.bottom > device.height) {
            console.log("需要滚动到可见区域...");
            scrollTo(bounds.centerX(), bounds.centerY());
            sleep(1000);
        }

        // 处理当前GridView
        found = processGridView(gridViews[i], i, keyword);
        if (found) {
            console.log("已在当前GridView找到目标");
            return true; // 退出forEach循环
        }
    };

    console.log("所有GridView处理完成");
    return found
}

// 处理单个GridView的函数
function processGridView_test(gridView, index, keyword) {
    let maxAttempts = 5;
    for (let i = 0; i < maxAttempts; i++) {
        // 必须重新获取当前GridView的子项
        let currentGridViews = className("android.widget.GridView").find();
        let currentGridView = currentGridViews[index]
        if (!currentGridView || !currentGridView.bounds().intersect(gridView.bounds())) {
            console.log("GridView已不在当前视图");
            return false;
        }

        console.log("=== 处理第" + (i + 1) + "页 ===");
        let children = currentGridView.children();

        // 遍历当前页所有子项
        for (let child of children) {
            let textView = findTextView(child);
            if (textView) {
                let content = textView.text() || textView.desc();
                console.log("检查内容:", content);
                if (content && content.includes(keyword)) {
                    if (content == keyword || content.length <= keyword.length) {
                        console.log("找到匹配项:", content);
                        child.click();
                        return true; // 找到并点击后返回
                    }
                }
            }
        }

        // 滚动到下一页
        currentGridView.scrollForward();
        sleep(1500); // 必须等待足够时间
    }
    for (let j = 0; j < maxAttempts; j++) {
        gridView.scrollBackward();
        sleep(1500);
    }
    return false;
}
function processGridView(gridView, index, keyword) {
    let maxAttempts = 5;
    for (let i = 0; i < maxAttempts; i++) {
        // 必须重新获取当前GridView的子项
        let currentGridViews = className("android.widget.GridView").find();
        let currentGridView = currentGridViews[index]
        if (!currentGridView || !currentGridView.bounds().intersect(gridView.bounds())) {
            console.log("GridView已不在当前视图");
            return false;
        }

        console.log("=== 处理第" + (i + 1) + "页 ===");
        let children = currentGridView.children();

        // 遍历当前页所有子项
        for (let child of children) {
            let textView = findTextView(child);
            if (textView) {
                let content = textView.text() || textView.desc();
                console.log("检查内容:", content);
                // if (content && content.includes(keyword)) {   //includes是模糊匹配，现在发现会匹配到类似名称，直接用全匹配吧
                // if (content == keyword) {   //includes是模糊匹配，现在发现会匹配到类似名称，直接用全匹配吧
                //     console.log("找到匹配项:", content);
                //     child.click();
                //     return true; // 找到并点击后返回
                // }
                if (content && content.includes(keyword)) {
                    comm.showLog("------------有啦有啦")
                    if (content == keyword || content.length <= keyword.length) {
                        console.log("找到匹配项:", content);
                        child.click();
                        return true; // 找到并点击后返回
                    }
                }
            }
        }

        // 滚动到下一页
        currentGridView.scrollForward();
        sleep(1500); // 必须等待足够时间
    }
    for (let j = 0; j < maxAttempts; j++) {
        gridView.scrollBackward();
        sleep(1500);
    }
    return false;
}

//没有文字版本
function findSkuGrid_v2_NoText(skuItem, top) {
    comm.showLog("触发Sku滑块【无文字】" + skuItem)
    // let match = skuItem.match(/^([^:]+):(.+)$/);
    // let keyword = match[2].replace(/^:/, "");
    let match = skuItem.match(/^([^:]+):+:?(.*)$/);
    let skuKey = match[1].trim()
    comm.showLog("skuKey:" + skuKey)
    let keyword = match[2].trim()
    comm.showLog("skuValue:" + keyword)
    // comm.randomToAndFroSwipe()
    sleep(2000)
    // 获取所有GridView（可能多个）
    let gridViews = className("android.widget.GridView").find();
    if (gridViews.empty()) {
        console.log("未找到任何GridView");
        return;
    }

    console.log("共找到", gridViews.length, "个GridView");
    var found = false;
    // 遍历处理每个GridView
    for (let i = 0; i < gridViews.length; i++) {
        console.log("\n开始处理第" + (i + 1) + "个GridView");
        let bounds = gridViews[i].bounds();
        console.log("位置:", bounds.left + "," + bounds.top + " - " + bounds.right + "," + bounds.bottom);
        if (bounds.centerY() < top) {
            continue
        }
        // 确保GridView在屏幕可见区域
        if (bounds.top < 0 || bounds.bottom > device.height) {
            console.log("需要滚动到可见区域...");
            scrollTo(bounds.centerX(), bounds.centerY());
            sleep(1000);
        }
        // 处理当前GridView
        found = processGridView_NoText(gridViews[i], i, keyword);
        if (found) {
            console.log("已在当前GridView找到目标");
            return true; // 退出forEach循环
        }
    };

    console.log("所有GridView处理完成");
    //出现没有文字的版本的GridView
    return found
}

// 处理单个GridView的函数 没有文字版本
function processGridView_NoText(gridView, index, keyword) {
    let maxAttempts = 5;
    for (let i = 0; i < maxAttempts; i++) {
        // 必须重新获取当前GridView的子项
        let currentGridViews = className("android.widget.GridView").find();
        let currentGridView = currentGridViews[index]
        if (!currentGridView || !currentGridView.bounds().intersect(gridView.bounds())) {
            console.log("GridView已不在当前视图");
            return false;
        }

        console.log("=== 处理第" + (i + 1) + "页 ===");
        let children = currentGridView.children();

        // 遍历当前页所有子项
        for (let child of children) {
            //判断一下页面中，有没有keyword
            child.click();
            sleep(3000);
            if (selector().textContains(keyword).visibleToUser(true).exists()) {
                //
                return true;
            }
        }

        // 滚动到下一页
        currentGridView.scrollForward();
        sleep(1500); // 必须等待足够时间
    }
    for (let j = 0; j < maxAttempts; j++) {
        gridView.scrollBackward();
        sleep(1500);
    }
    return false;
}

// 循环截取并找到对应标题（新增加点击，并且点进详情中，点一下全称然后匹配是不是同一个商品，同一个，表示已经找到并返回true）
function findTitle(title_txt) {

    let viewed = false
    for (let j = 0; j < 30; j++) {
        comm.showLog("开始判断findTitle")
        // 判断有没有 no more products
        if (findTitleOnThePage(title_txt)) {
            viewed = true
            break
        } else {
            sleep(1000)
            let noMoreProducts = selector().textContains("No more product").visibleToUser(true).findOne(1000)
            if (noMoreProducts) {
                comm.showLog("findTitle没有更多商品")
                break
            } else {
                comm.randomSwipeSlowLong(1) //滑动一个长且慢的
            }
        }

    }
    return viewed
}
// 从当前页面找到商品标题
function findTitleOnThePage(title_txt) {
    let newTitle = title_txt.slice(0, 40)
    let isOutFor = false
    let isFind = false
    // 循环找当前页面中有没有符合的标题
    outerLoop: for (let i = 40; i > 5; i--) {
        if (isOutFor) break outerLoop;
        newTitle = title_txt.slice(0, i)
        comm.showLog("findTitle循环中:" + i)
        // 
        let title_list = selector().textContains(newTitle).visibleToUser(true).find()
        if (title_list.length > 1) {
            comm.showLog("findTitle商品标题找到,有" + title_list.length + "个:" + newTitle)
            for (let j = 0; j < title_list.length; j++) {
                comm.clickObj(title_list[j])
                sleep(2000)
                // 点一下详情的标题
                comm.clickObj(selector().textContains(newTitle).visibleToUser(true).findOne(1000))
                // 判断全标题对不对
                let trueViewed = selector().textContains(title_txt).visibleToUser(true).findOne(1000)
                if (trueViewed) {
                    comm.showLog("确认商品标题:" + newTitle)
                    isOutFor = true
                    isFind = true
                    break
                } else {
                    isOutFor = true
                    back() //返回上一页
                    sleep(1000)
                }
            }
            isOutFor = true
        } else {
            comm.showLog("findTitle商品标题未找到:" + newTitle)
        }

    }
    return isFind
}


// 打开video
function openVideoProduct(video_id) {
    let isViewed = false
    backToHome()
    //let video_id='7314877638118788398';
    sleep(1000)
    closeAllPop()
    comm.showLog("打开短视频" + video_id)
    app.startActivity({

        action: "android.intent.action.VIEW",
        data: "snssdk1233://aweme/detail/" + video_id + "?refer=web&gd_label=click_wap_top_banner&page_name=reflow_videor",
        // data:"snssdk1233://webview?url=https%3A%2F%2Fwww.tiktok.com%2Ft%2FZP8Fr9vTD%2F&from=webview&refer=web", 
        packageName: "com.zhiliaoapp.musically",

    });
    sleep(6000)
    for (let index = 0; index < 5; index++) {

        let click_here_to_buy = selector().textContains('Click here to buy').findOne(3000)
        if (!click_here_to_buy) {
            comm.showLog("没找到click_here_to_buy")
            let shops = selector().textContains('Shop').visibleToUser(true).find()
            for (let i = 0; i < shops.length; i++) {
                let element = shops[i];
                let b = element.bounds()
                if (b.centerX() < 200 && b.centerY() > 1300) {
                    click_here_to_buy = element
                    break
                }
            }
        }
        if (!click_here_to_buy) {
            comm.showLog("没找到click_here_to_buy2")
            click_here_to_buy = selector().textContains('Saving').visibleToUser(true).findOne(3000)
        }
        if (!click_here_to_buy) {
            comm.showLog("没找到click_here_to_buy3")
            click_here_to_buy = selector().textContains('Shop Here').visibleToUser(true).findOne(3000)
        }
        if (click_here_to_buy) {
            comm.showLog("找到click_here_to_buy3")
            sleep(2000)
            comm.showLog(click_here_to_buy.text())//打印那个文字
            comm.clickObj(click_here_to_buy)
            isViewed = true
            break
        }
    }
    // click(159,1585)  
    return isViewed
}

// 进入订单详情页面  lau
function orderAction_my(task_id, order_bak, realname, card_number, discount, estimate, ordertask_id, email, product_quantity) {
    let msg = ''
    //let select_google_pay=0
    //||addAnAddress||disable_addr_script
    //    if(goTextContains('Payment method',0)){  //判断是不是在支付页
    //         comm.showLog("判断在支付页")
    //    }else if(goTextContains('Place order',0)){
    //         comm.showLog("判断在支付页")
    //    }else{
    //         comm.httpToString(remoteServer+"/admin/api/orderPing?id="+task_id+"&ordertaskid="+ordertask_id+"&status=2&info=不在支付页")
    //         comm.showLog("不在支付页")
    //         return "不在支付页"
    //    }
    sleep(10000)
    // if (selector().textContains('Checkout').visibleToUser(true).exists()) {
    //     comm.showLog("判断在支付页")
    // } else {
    //     msg = comm.httpToStringShellContinue(remoteServer + "/admin/api/orderPing?id=" + task_id + "&ordertaskid=" + ordertask_id + "&ordersid=" + orders_id + "&status=2&info=不在支付页")
    //     if (msg != '成功接收到通知') {
    //         return "系统断线，停止任务"
    //     }
    //     comm.showLog("不在支付页")
    //     return "不在支付页"
    // }
    //
    let checkoutPage = selector().textContains('Checkout').visibleToUser(true).findOne(1000)
    if (!checkoutPage) {
        checkoutPage = selector().textContains('Order summary').visibleToUser(true).findOne(1000)
    }
    if (checkoutPage) {
        comm.showLog("判断在支付页")
    } else {
        msg = comm.httpToStringShellContinue(remoteServer + "/admin/api/orderPing?id=" + task_id + "&ordertaskid=" + ordertask_id + "&ordersid=" + orders_id + "&status=2&info=不在支付页")
        if (msg != '成功接收到通知') {
            return "系统断线，停止任务"
        }
        comm.showLog("不在支付页")
        return "不在支付页"
    }
    sleep(5000)
    comm.showLogToFile("判断地址名称")
    if (realname == "") {
        return "任务地址为空，出错"
    }
    //    判断地址名称对不对
    for (let j = 0; j < 6; j++) {
        if (j == 5) {
            msg = comm.httpToStringShellContinue(remoteServer + "/admin/api/orderPing?id=" + task_id + "&ordertaskid=" + ordertask_id + "&ordersid=" + orders_id + "&status=2&info=地址名称错误")
            if (msg != '成功接收到通知') {
                return "系统断线，停止任务"
            }
            return "地址名称错误"
        }
        let breakTag = false
        let address_name = selector().textContains(realname).visibleToUser(true).findOne(6000)
        if (!address_name) {
            //可能存在多个地址
            let shippaddress = selector().textContains("Shipping address").visibleToUser(true).findOne(1000)
            if (shippaddress) {
                //点击一下地址选择按钮
                comm.showLog("默认地址不对，点击一下地址选择按钮")
                // click(shippaddress.bounds().centerX(),shippaddress.bounds().centerY()+150) //点了一下地址的东西
                let shipY = shippaddress.bounds().centerY() + 150
                //
                for (let i = 0; i < 10; i++) {
                    click(shippaddress.bounds().centerX(), shipY)
                    sleep(2000)
                    if (selector().textContains('Select an address').visibleToUser(true).exists()) {
                        break
                    }
                    shipY = shipY + 10
                }
                comm.showLog("成功打开地址选择框")
                sleep(5000)
                for (let i = 0; i < 15; i++) {
                    let address_name_list = selector().textContains(realname).visibleToUser(true).findOne(1000)
                    if (address_name_list) {
                        comm.clickObj(address_name_list)
                        sleep(2000)
                        let saveBtn = selector().textContains("Save").visibleToUser(true).findOne(1000)
                        if (saveBtn) {
                            comm.clickObj(saveBtn)
                            sleep(2000)
                            breakTag = true
                            break
                        }
                    } else {
                        comm.showLog("滑一下")
                        comm.randomSwipeSlow(1)
                    }
                    sleep(3000)
                }
                if (breakTag) {
                    continue
                }
                // if (address_name){
                //     comm.clickObj(address_name)
                //     sleep(2000)
                //     let saveBtn=selector().textContains("Save").visibleToUser(true).findOne(1000)
                //     if (saveBtn){
                //         comm.clickObj(saveBtn)
                //         sleep(5000)
                //         address_name=selector().textContains(realname).visibleToUser(true).findOne(1000)
                //         if (!address_name){
                //             comm.httpToString(remoteServer+"/admin/api/orderPing?id="+task_id+"&ordertaskid="+ordertask_id+"&status=2&info=地址名称错误(多地址失败)")
                //             return "地址名称错误(多地址失败)"
                //         }
                //     }else{
                //         comm.httpToString(remoteServer+"/admin/api/orderPing?id="+task_id+"&ordertaskid="+ordertask_id+"&status=2&info=地址名称错误(没有save)")
                //         return "地址名称错误(没有save)"
                //     }
                // }else{
                //     comm.httpToString(remoteServer+"/admin/api/orderPing?id="+task_id+"&ordertaskid="+ordertask_id+"&status=2&info=地址名称错误")
                //     return "地址名称错误"
                // }
            }
        } else {
            comm.showLogToFile("找到了地址")
            break
        }
    }

    // sleep(2000)
    // comm.showLogToFile("判断卡号")
    // let choosepm = selector().textContains("Choose a payment method").visibleToUser(true).findOne(6000)
    // if (choosepm) {
    //     let cardendingin = selector().textContains("Card ending in").visibleToUser(true).findOne(6000)
    //     comm.clickObj(cardendingin)
    // }
    // if (card_number == "") {
    //     return "任务卡号为空，出错"
    // }
    // // 判断卡号是否正确
    // let card_ending_in = selector().textContains("Card ending in " + card_number).visibleToUser(true).findOne(6000)
    // if (!card_ending_in) {
    //     msg = comm.httpToStringShellContinue(remoteServer + "/admin/api/orderPing?id=" + task_id + "&ordertaskid=" + ordertask_id + "&ordersid=" + orders_id + "&status=2&info=不显卡或卡号错误")
    //     if (msg != '成功接收到通知') {
    //         return "系统断线，停止任务"
    //     }
    //     return "不显卡或卡号错误"
    // } else {
    //     comm.clickObj(card_ending_in)
    // }
    sleep(2000)
    comm.showLogToFile("找银行卡部分")
    comm.randomSwipeToTop(5)
    sleep(8000)
    //
    for (let j = 0; j < 15; j++) {
        if (j == 14) {
            msg = comm.httpToStringShellContinue(remoteServer + "/admin/api/orderPing?id=" + task_id + "&ordertaskid=" + ordertask_id + "&ordersid=" + orders_id + "&status=2&info=不显卡")
            if (msg != '成功接收到通知') {
                return "系统断线，停止任务"
            }
            return "不显卡"
        }
        //找银行卡
        let choosepm = selector().textContains("Choose a payment method").visibleToUser(true).findOne(3000)
        if (!choosepm) {
            choosepm = selector().textContains("Payment method").visibleToUser(true).findOne(3000)
            if (!choosepm) {
                choosepm = selector().textContains("Place order").visibleToUser(true).findOne(3000)
                if (!choosepm) {
                    choosepm = selector().textContains("Order placed").visibleToUser(true).findOne(3000)
                }
            }
        }
        //
        if (choosepm) {
            comm.showLogToFile("判断卡号")
            let cardendingin = selector().textContains("Card ending in").visibleToUser(true).findOne(6000)
            if (cardendingin) {
                comm.clickObj(cardendingin)
                if (card_number == "") {
                    return "任务卡号为空，出错"
                }
                // 判断卡号是否正确
                let card_ending_in = selector().textContains("Card ending in " + card_number).visibleToUser(true).findOne(6000)
                if (!card_ending_in) {
                    msg = comm.httpToStringShellContinue(remoteServer + "/admin/api/orderPing?id=" + task_id + "&ordertaskid=" + ordertask_id + "&ordersid=" + orders_id + "&status=2&info=卡号错误")
                    if (msg != '成功接收到通知') {
                        return "系统断线，停止任务"
                    }
                    return "卡号错误"
                } else {
                    comm.clickObj(card_ending_in)
                    break
                }
            } else {
                comm.showLogToFile("没有Card-ending-in")
                comm.randomSwipeSlow(1)
                sleep(3000)
            }
        }
    }
    //
    sleep(2000)
    comm.showLogToFile("判断最下面的那个下单按钮在不在")
    //    return "测试，固定中断"
    //    comm.showLog('选择支付卡：'+card_ending_in.text())
    //    comm.clickObj(card_ending_in)
    // 判断最下面的那个下单按钮在不在
    let place_order = selector().textContains("Place order").visibleToUser(true).findOne(6000)
    if (!place_order) {
        place_order = selector().textContains("Order placed").visibleToUser(true).findOne(6000)
    }
    if (!place_order) {
        msg = comm.httpToStringShellContinue(remoteServer + "/admin/api/orderPing?id=" + task_id + "&ordertaskid=" + ordertask_id + "&ordersid=" + orders_id + "&status=2&info=进入下单页失败")
        if (msg != '成功接收到通知') {
            return "系统断线，停止任务"
        }
        return '进入下单页失败'
    } else {
        msg = comm.httpToStringShellContinue(remoteServer + "/admin/api/orderPing?id=" + task_id + "&ordertaskid=" + ordertask_id + "&ordersid=" + orders_id + "&status=1&info=点击下订单")
        if (msg != '成功接收到通知') {
            return "系统断线，停止任务"
        }
    }
    sleep(3000)
    if (order_bak != '') {
        //order_bak='bug'
        let add_note = selector().textContains('Add note').findOne(6000)
        if (add_note) {
            comm.clickObj(add_note)
            sleep(3000)

            place_order = selector().textContains("Place order").visibleToUser(true).findOne(1000)
            if (!place_order) {
                click(500, 1560)
                sysInputText(null, order_bak)
                sleep(1000)
                clearText()
                sleep(1000)
                let saveBtn = selector().className('android.widget.Button').textContains('Save').findOne(12000)
                if (saveBtn) {
                    comm.clickObj(saveBtn)
                }
                sleep(2000)
                //    place_order=selector().textContains("Place order").visibleToUser(true).findOne(1000)    
            }
        }
    }
    //--------需要设置信用----------
    //let card_id=taskJson.card_id+''

    //addPayCard(taskJson.id) 
    //sleep(200000)
    //    swipe(random(400, 430), random(1000,1010), random(400, 430), random(200, 220), random(200, 300))
    //    swipe(random(400, 430), random(1000,1010), random(400, 430), random(200, 220), random(200, 300))
    //    sleep(3000)
    sleep(5000)
    comm.showLog("滑动5下,并且找商品数量")
    comm.randomSwipeToTop(5)
    sleep(8000)

    if (product_quantity == 1) {
        comm.randomSwipeSlowLong(5)
    } else {
        for (let q = 0; q < 5; q++) {
            let add_note = selector().textContains('Add note').findOne(6000)
            if (add_note) {
                comm.showLog("找到Add-note，再向下划一下，然后通过点击输入数量")
                comm.randomSwipeSlowLong(1)
                sleep(8000)
                let editTextInput = selector().className('android.widget.EditText').findOne(2000)
                if (editTextInput) {
                    let lauX_reduce = editTextInput.bounds().left - 20
                    let lauX = editTextInput.bounds().right + 20
                    let lauY = editTextInput.bounds().centerY()
                    for (let r = 0; r < 3; r++) {
                        click(lauX_reduce, lauY)
                        sleep(1000)
                    }
                    sleep(1500)
                    //先减少，再增加
                    for (let i = 1; i < product_quantity; i++) {
                        click(lauX, lauY)
                        sleep(1000)
                    }
                    break
                }
            } else {
                comm.randomSwipeSlowLong(1)
                sleep(5000)
            }

        }
    }

    // if(taskJson.free_shipping==0)
    // {
    //     let n=getShoppingVal()
    //     if(n>0)
    //     {
    //         comm.showLog('需要运费 '+n) 
    //         return '需要运费 '+n;
    //     }else{
    //         comm.showLog('不需要运费')
    //     }
    // } 
    // 判断优惠价格
    // sleep(500)
    // comm.showLog("判断优惠价格") //不做限制只做提醒
    // let discountMoney=getDiscountVal()
    // comm.showLog("discountMoney:"+discountMoney)
    // if(discount==discountMoney)
    // {
    //     comm.showLog("优惠价格正确")
    // }else if(discountMoney>discount){
    //     comm.showLog("优惠价格高于预估")
    // }else{
    //     comm.showLog("优惠价格低于预估")
    // }

    // 判断价格
    // sleep(500)
    // comm.showLog("判断价格")
    // let totalMoney=getTotalVal()
    // // if(totalMoney>9.5){
    // //    return '价格高于预估值'  
    // // }
    // comm.showLog("totalMoney:"+totalMoney)
    // if(estimate>0&&totalMoney>0)
    // {
    //     //estimate=estimate*1.1
    //     if(totalMoney>estimate) //最大预估值
    //     {
    //         return '价格高于预估值'
    //     }else{
    //         comm.showLog("价格低于或者等于预估价，正确")
    //     }
    // }
    // return "暂时中断"
    sleep(15000)
    // for (let i = 0;i<5;i++){
    place_order = selector().textContains("Place order").visibleToUser(true).findOne(6000)
    if (place_order) {
        msg = comm.httpToStringShellContinue(remoteServer + "/admin/api/orderPing?id=" + task_id + "&ordertaskid=" + ordertask_id + "&ordersid=" + orders_id + "&status=1&info=准备点击下订单")
        if (msg != '成功接收到通知') {
            return "系统断线，停止任务"
        }
        comm.showLogToFile("准备点击下订单按钮Place-order")
        // comm.clickObj(place_order)
        msg = comm.httpToStringShellContinue(remoteServer + "/admin/api/orderPing?id=" + task_id + "&ordertaskid=" + ordertask_id + "&ordersid=" + orders_id + "&status=1&info=点击下订单")
        if (msg != '成功接收到通知') {
            return "系统断线，停止任务"
        }
        sleep(8000)
        // 看看有没有这个新的弹窗 Continue to checkout
        comm.showLogToFile("准备找Continue-to-checkout")
        sleep(10000)
        let continueToCheckoutBtn = selector().textContains("Continue to checkout").visibleToUser(true).findOne(6000)
        if (continueToCheckoutBtn) {
            comm.showLogToFile("准备点击继续按钮Continue-to-checkout")
            //
            comm.clickObj(continueToCheckoutBtn)
            msg = comm.httpToStringShellContinue(remoteServer + "/admin/api/orderPing?id=" + task_id + "&ordertaskid=" + ordertask_id + "&ordersid=" + orders_id + "&status=1&info=存在Continue-to-checkout")
            if (msg != '成功接收到通知') {
                return "系统断线，停止任务"
            }
        }
        sleep(8000)
        //
        place_order = selector().textContains("Place order").visibleToUser(true).findOne(6000)
        if (place_order) {
            msg = comm.httpToStringShellContinue(remoteServer + "/admin/api/orderPing?id=" + task_id + "&ordertaskid=" + ordertask_id + "&ordersid=" + orders_id + "&status=1&info=再点一次下订单")
            if (msg != '成功接收到通知') {
                return "系统断线，停止任务"
            }
            comm.clickObj(place_order)
        }
        // break
    } else {
        comm.showLogToFile("没有订单按钮Place-order")
        msg = comm.httpToStringShellContinue(remoteServer + "/admin/api/orderPing?id=" + task_id + "&ordertaskid=" + ordertask_id + "&ordersid=" + orders_id + "&status=1&info=没有Place order按钮")
        if (msg != '成功接收到通知') {
            return "系统断线，停止任务"
        }
        return "没有订单按钮Place-order"
    }
    sleep(8000)
    // }
    //    place_order=selector().textContains("Place order").visibleToUser(true).findOne(6000)
    //    if(place_order)
    //    {
    //        comm.clickObj(place_order)
    //        sleep(10000)
    //     //    comm.httpToString(httpServer+"/api/orderPing?id="+task_id+"&status=1&info=&client_no=" + 1000+"&click=1")
    //        comm.httpToString(remoteServer+"/admin/api/orderPing?id="+task_id+"&ordertaskid="+ordertask_id+"&status=1&info=点击下订单")
    //    }
    let payCnt = 0
    let payFailCnt = 0
    let isClickContinue = false
    let isPlaceOrder = false
    for (let index = 0; index < 10; index++) {
        if (!isClickContinue) {
            comm.showLog("准备找Continue-to-checkout2")
            let continueToCheckoutBtn2 = selector().textContains("Continue to checkout").visibleToUser(true).findOne(6000)
            if (continueToCheckoutBtn2) {
                comm.showLogToFile("准备点击继续按钮Continue-to-checkout-2")
                //
                comm.clickObj(continueToCheckoutBtn2)
                isClickContinue = true
            }
        }
        //增加一个验证码判断
        let verify1 = selector().textContains('erify to continue').visibleToUser(true).exists()
        let verify2 = selector().textContains('Refresh').visibleToUser(true).exists()
        let verify3 = selector().textContains('rag the puzzle piece into place').visibleToUser(true).exists()
        if (verify1 || verify2 || verify3) {
            let verifyMsg = ""
            //说明有验证码
            if (verify2) {
                comm.showLogToFile("常规滑块验证码")
                verifyMsg = imageCodeVerify_Buy()
            } else {
                comm.showLog("变化速率的滑块验证码")
                verifyMsg = sliderVerificationCode()
            }
            comm.showLog("验证码部分返回：" + verifyMsg)
        }
        // sleep(5000)
        // comm.httpToString(remoteServer+"/api/orderPing?id="+task_id+"&status=1&info=&client_no=" + 1000)
        // comm.httpToString(remoteServer+"/admin/api/orderPing?id="+task_id+"&ordertaskid="+ordertask_id+"&status=1&info=点击下订单下面的循环")
        let promotionMsg = selector().textContains('Promotion is ine').visibleToUser(true).findOne(1000)
        let payment_fail = selector().textContains('Payment failed').visibleToUser(true).findOne(1000)
        if (promotionMsg || payment_fail) {
            comm.showLog('支付风控' + index)
            payFailCnt++
            if (payFailCnt > 3) {
                let iBbtn = selector().textContains("Insufficient balance").visibleToUser(true).findOne(1000)
                if (iBbtn) {
                    msg = comm.httpToStringShellContinue(remoteServer + "/admin/api/orderPing?id=" + task_id + "&ordertaskid=" + ordertask_id + "&ordersid=" + orders_id + "&status=2&info=银行卡余额不足")
                    if (msg != '成功接收到通知') {
                        return "系统断线，停止任务"
                    }
                    let okbtn = selector().textContains("OK").visibleToUser(true).findOne(1000)
                    if (okbtn) {
                        comm.clickObj(okbtn)
                    }
                    sleep(2000)
                    return '银行卡余额不足';
                } else {
                    msg = comm.httpToStringShellContinue(remoteServer + "/admin/api/orderPing?id=" + task_id + "&ordertaskid=" + ordertask_id + "&ordersid=" + orders_id + "&status=2&info=支付风控")
                    if (msg != '成功接收到通知') {
                        return "系统断线，停止任务"
                    }
                    // comm.httpToString(remoteServer+"/api/orderPing?id="+task_id+"&status=0&info=支付风控&client_no=" + 1000)
                    let okbtn = selector().textContains("OK").visibleToUser(true).findOne(1000)
                    if (okbtn) {
                        comm.clickObj(okbtn)
                    }
                    sleep(2000)
                    return '支付风控';

                }
            }
        }
        sleep(3000)
        //需要手机验证码
        let confirm_code = selector().textContains('Confirm code').visibleToUser(true).findOne(1000)
        if (confirm_code) {
            msg = comm.httpToStringShellContinue(remoteServer + "/admin/api/orderPing?id=" + task_id + "&ordertaskid=" + ordertask_id + "&ordersid=" + orders_id + "&status=2&info=需要手机验证码")
            if (msg != '成功接收到通知') {
                return "系统断线，停止任务"
            }
            comm.showLogToFile("请求验证码")
            //请求并获取参数
            var emailCode = 0
            sleep(10000)
            for (let e = 0; e < 10; e++) {
                comm.showLog("请求验证码循环次数:" + e)
                // let repCode = comm.httpToString('http://38.54.119.104:9000/api/getMailDetail?email='+email)
                let repCode = comm.httpToString('http://23.91.96.20:9101/api/getShoppingCode?email=' + email)
                if (repCode == '暂无购物验证码') {
                    sleep(5000)
                    continue
                } else {
                    emailCode = repCode
                }
                sleep(2000)
                if (emailCode != 0) {
                    comm.showLogToFile("输入验证码:" + emailCode)
                    let inputs = selector().className('android.widget.EditText').find()
                    sysInputText(inputs[0], emailCode)
                    // inputs[0].setText(emailCode)  //如果不行就试试这个
                    break
                }
                sleep(5000)
            }
            if (emailCode == 0) {
                return "手机验证码接口查询失败"
            }
        }
        sleep(5000)
        let somethingMsg = selector().textContains('Something went wrong').findOne(1000)
        if (somethingMsg) {
            payFailCnt++
            comm.showLogToFile('风按钮 ' + index)
            if (payFailCnt > 3) {
                // comm.httpToString(remoteServer+"/api/orderPing?id="+task_id+"&status=0&info=风控&client_no=" + 1000)
                msg = comm.httpToStringShellContinue(remoteServer + "/admin/api/orderPing?id=" + task_id + "&ordertaskid=" + ordertask_id + "&ordersid=" + orders_id + "&status=2&info=风控")
                if (msg != '成功接收到通知') {
                    return "系统断线，停止任务"
                }
                return '风控';
            }
            let okbtn = selector().textContains("OK").visibleToUser(true).findOne(1000)
            if (okbtn) {
                comm.clickObj(okbtn)
            }

        } else {
            let finStr = "View order details"
            let viewOrderDetails = selector().textContains(finStr).visibleToUser(true).findOne(5000)
            if (!viewOrderDetails) {
                finStr = "View order"
                viewOrderDetails = selector().textContains(finStr).visibleToUser(true).findOne(5000)
            }
            if (viewOrderDetails) {
                msg = comm.httpToStringShellContinue(remoteServer + "/admin/api/orderPing?id=" + task_id + "&ordertaskid=" + ordertask_id + "&ordersid=" + orders_id + "&status=1&info=下单成功")
                if (msg != '成功接收到通知') {
                    return "系统断线，停止任务"
                }
                comm.showLogToFile('下单成功 ' + index)
                sleep(2000)
                viewOrderDetails = selector().textContains(finStr).findOne(5000)
                if (viewOrderDetails) {
                    comm.clickObj(viewOrderDetails)
                    sleep(6000)
                }
                let order_text = selector().textContains('Order#').findOne(60000)
                if (order_text) {
                    let orderId = ''
                    let array = order_text.parent().children()
                    for (let index = 0; index < array.length; index++) {
                        let element = array[index];
                        if (element.className() == 'android.widget.TextView') {
                            let stxt = element.text()
                            if (stxt.length == 18) {
                                orderId = stxt

                            }
                        }
                    }
                    if (orderId != '') {
                        comm.showLog("上传订单号: " + orderId)
                        //    comm.httpToString(remoteServer+"/api/orderPing?id="+task_id+"&status=1&info=&order_id="+orderId+"&client_no=" + 1000)  
                        msg = comm.httpToStringShellContinue(remoteServer + "/admin/api/orderPing?id=" + task_id + "&ordertaskid=" + ordertask_id + "&ordersid=" + orders_id + "&status=3&info=下单成功&order_id=" + orderId)
                        if (msg != '成功接收到通知') {
                            return "系统断线，停止任务"
                        }
                    }
                } else {

                    // comm.httpToString(remoteServer+"/api/orderPing?id="+task_id+"&status=1&info=下单成功&client_no=" + 1000)  
                    msg = comm.httpToStringShellContinue(remoteServer + "/admin/api/orderPing?id=" + task_id + "&ordertaskid=" + ordertask_id + "&ordersid=" + orders_id + "&status=3&info=下单成功（无单号）")
                    if (msg != '成功接收到通知') {
                        return "系统断线，停止任务"
                    }
                }
                sleep(10000)
                return 'success'    //下单成功
            } else {
                comm.showLogToFile("还存在Place-order")
                place_order = selector().textContains("Place order").visibleToUser(true).findOne(1000)
                if (place_order) {
                    //向上查找支付方法
                    goTextContains('Payment method', 1)
                    let paymentMethods = selector().textContains('Payment method').visibleToUser(true).findOne(1000)
                    if (paymentMethods) {
                        let selectDifferentPay = selector().textContains('different payment method').visibleToUser(true).findOne(2000)
                        if (selectDifferentPay) {
                            payFailCnt++
                            //    comm.httpToString(remoteServer+"/api/orderPing?id="+task_id+"&status=1&info="+selectDifferentPay.text()+"&client_no=" + 1000)
                            msg = comm.httpToStringShellContinue(remoteServer + "/admin/api/orderPing?id=" + task_id + "&ordertaskid=" + ordertask_id + "&ordersid=" + orders_id + "&status=2&info=" + selectDifferentPay.text())
                            if (msg != '成功接收到通知') {
                                return "系统断线，停止任务"
                            }
                            if (payFailCnt > 2) {
                                return selectDifferentPay.text();
                            }
                        }
                        let card_ending_in = selector().textContains("Card ending in").visibleToUser(true).findOne(6000)
                        if (!card_ending_in) {
                            return "不显卡"
                        }
                        comm.showLogToFile('选择支付卡：' + card_ending_in.text())
                        comm.clickObj(card_ending_in)
                        sleep(5000)
                        goTextContains('Order summary', 3)
                        if (payCnt > 3) {

                            // comm.httpToString(remoteServer+"/api/orderPing?id="+task_id+"&status=1&info=支付失败&client_no=" + 1000)
                            msg = comm.httpToStringShellContinue(remoteServer + "/admin/api/orderPing?id=" + task_id + "&ordertaskid=" + ordertask_id + "&ordersid=" + orders_id + "&status=2&info=支付失败")
                            if (msg != '成功接收到通知') {
                                return "系统断线，停止任务"
                            }
                            return '支付失败';
                        }
                        sleep(5000)
                        //加个标识，至少保证在这段逻辑中，只点击一次
                        if (!isPlaceOrder) {
                            comm.showLogToFile("准备点击Place-order")
                            place_order = selector().textContains("Place order").visibleToUser(true).findOne(1000)
                            if (place_order) {
                                comm.clickObj(place_order)
                                isPlaceOrder = true
                            }
                        }
                        //   comm.clickObj(place_order)  //不去重复点--为了不要重复下单，暂时屏蔽
                        sleep(20000)
                        //    comm.httpToString(remoteServer+"/api/orderPing?id="+task_id+"&status=1&info=&client_no=" + 1000+"&click=1")
                        payCnt++
                    } else {
                        sleep(6000)
                    }
                    continue
                } else {
                    comm.showLogToFile('等待下单结果... ' + index)
                    let verify_you_card = selector().textContains("your card to keep").visibleToUser(true).findOne(1000)
                    let is_get_code = selector().textContains("et code").visibleToUser(true).findOne(1000)
                    let to_send_code = selector().textContains("to send code").visibleToUser(true).findOne(1000)
                    let cation_code = selector().textContains("cation code").visibleToUser(true).findOne(1000)
                    if (verify_you_card || is_get_code || to_send_code || cation_code) {
                        // comm.httpToString(remoteServer+"/api/orderPing?id="+task_id+"&status=1&info=信用卡需验证&client_no=" + 1000)
                        msg = comm.httpToStringShellContinue(remoteServer + "/admin/api/orderPing?id=" + task_id + "&ordertaskid=" + ordertask_id + "&ordersid=" + orders_id + "&status=2&info=信用卡需验证")
                        if (msg != '成功接收到通知') {
                            return "系统断线，停止任务"
                        }

                        sleep(7200)
                    }
                }
            }
        }
    }
    //    comm.httpToString(remoteServer+"/api/orderPing?id="+task_id+"&status=1&info=支付超时&client_no=" + 1000)
    msg = comm.httpToStringShellContinue(remoteServer + "/admin/api/orderPing?id=" + task_id + "&ordertaskid=" + ordertask_id + "&ordersid=" + orders_id + "&status=2&info=支付超时")
    if (msg != '成功接收到通知') {
        return "系统断线，停止任务"
    }

    return "支付超时"
}

// 获取尝试获取优惠价格
function getDiscountVal() {
    try {

        let Total = selector().textContains('Discounts').findOne(1000)
        if (!Total) {
            return 0
        }
        let ts = selector().textContains('- $').find()
        comm.showLog(ts.length)

        Total = ts[ts.length - 1]
        let array = Total.parent().children()
        let smoney = ''
        for (let index = 0; index < array.length; index++) {
            let element = array[index];
            let stxt = element.text()
            console.log(element.className() + ":" + stxt)
            if (stxt.startsWith('- $')) {
                comm.showLog(stxt)
                smoney = stxt.replace('- $', '')
                smoney = smoney.trim()
            }

        }

        let n = 0
        if (smoney != '') {
            n = Number(smoney)
        }
        return n
    } catch (ex) {
        return 0
    }
}

// 获取购物车总价
function getTotalVal() {
    try {

        let Total = selector().textContains('Total').findOne(1000)
        if (!Total) {
            return 0
        }
        let ts = selector().textContains('$').find()
        Total = ts[ts.length - 1]
        let array = Total.parent().children()
        let smoney = ''
        for (let index = 0; index < array.length; index++) {
            let element = array[index];
            let stxt = element.text()
            console.log(element.className() + ":" + stxt)
            if (stxt.startsWith('$')) {
                comm.showLog(stxt)
                smoney = stxt.replace('$', '')
                smoney = smoney.trim()
            }

        }
        let n = 0
        if (smoney != '') {
            n = Number(smoney)
        }
        return n
    } catch (ex) {
        return 0
    }
}


// 查找查看店铺的商品
function findViewShopProduct2(title_txt) {
    let isViewed = false
    //let t_title=''
    // if(title_txt.length>50)
    // {
    //     let title_tv=selector().textContains(title_txt.substring(0,50)).visibleToUser(true).findOne(500)
    //     if(title_tv)
    //     {
    //         title_txt= title_tv.text()
    //         comm.showLog('新title_txt:'+title_txt) //这里不知道为什么会有个价格的标识在前面
    //     }
    // }
    //let search_icon=selector().className("android.widget.ImageView").bounds(772, 99, 827, 154).visibleToUser(true).findOne(1000)
    let shop_icon = selector().text('Shop').bounds(44, 1944, 124, 1985).visibleToUser(true).findOne(1000)
    swipe(random(550, 600), random(1500, 1510), random(550, 600), random(630, 650), 430)
    sleep(1000)
    swipe(random(550, 600), random(1500, 1510), random(550, 600), random(930, 950), 430)
    sleep(1000)
    goTextContains('View shop', 4)
    sleep(1000)
    let inShopInfo = false
    let viewShop = selector().textContains('View shop').visibleToUser(true).findOne(3000)
    if (viewShop) {
        if (viewShop.text().indexOf('reviews')) {
            swipe(random(550, 600), random(1500, 1510), random(550, 600), random(930, 950), 430)
            sleep(1000)
            swipe(random(550, 600), random(1500, 1510), random(550, 600), random(1000, 1050), 430)
            sleep(1000)
            viewShop = selector().text('View shop').visibleToUser(true).findOne(3000)
        }
        sleep(3000)
        comm.clickObj(viewShop)
        sleep(5000)
        let recommend = null
        for (let l = 0; l < 15; l++) {
            recommend = selector().textContains('Recommended').visibleToUser(true).findOne(3000)
            if (recommend) {
                break
            }
            let iv = selector().className("android.widget.ImageView").bounds(996, 1858, 1040, 1902).visibleToUser(true).findOne(1000)
            if (iv) {
                comm.clickObj(iv)
                sleep(2000)
            }
            if (!recommend) {
                if (l == 3) {
                    click(1235, 2655)
                    sleep(1000)
                }
                recommend = selector().textContains('Products').visibleToUser(true).findOne(1000)
                let shop_home = selector().textContains('Home').visibleToUser(true).findOne(1000)
                if (recommend && shop_home) {
                    break

                } else if (l > 0) {

                    if (recommend) {
                        break
                    }
                    recommend = selector().textContains('sold').visibleToUser(true).findOne(4000)
                    if (recommend) {
                        break
                    }
                    recommend = selector().textContains('Sort by').visibleToUser(true).findOne(1000)
                    if (recommend) {
                        break
                    }
                    let search_in = selector().textContains('Search in store').visibleToUser(true).findOne(1000)
                    if (!search_in) {
                        search_in = selector().className('com.lynx.tasm.behavior.ui.text.FlattenUIText').textContains('Search').findOne(1000)
                    }
                    if (search_in) {
                        break
                    }
                }
            }
        }
        if (!recommend) {
            comm.showLog('Recommended lost')
            return false
        }
        inShopInfo = true
    }
    let search_in = selector().textContains('Search in store').visibleToUser(true).findOne(2000)
    if (!search_in) {
        search_in = selector().className('com.lynx.tasm.behavior.ui.text.FlattenUIText').textContains('Search').findOne(1000)
    }
    if (search_in || shop_icon || inShopInfo) {
        let can_search = true
        let is_view_home = true
        if (is_view_home) {
            comm.showLog('is_view_home=' + can_search)
        } else if (search_in) {
            comm.clickObj(search_in)
        } else if (shop_icon) {

            comm.clickObj(shop_icon)
            sleep(5000)
            let recommend = selector().textContains('Recommended').visibleToUser(true).findOne(60000)
            if (!recommend) {
                return false
            }
            search_in = selector().textContains('Search in store').visibleToUser(true).findOne(3000)
            if (!search_in) {
                search_in = selector().className('com.lynx.tasm.behavior.ui.text.FlattenUIText').textContains('Search').findOne(1000)
            }
            if (search_in) {
                comm.clickObj(search_in)
            }
        } else {
            can_search = false
        }
        comm.showLog('can_search=' + can_search)
        let like_title_txt = title_txt.substring(0, 10)
        if (title_txt.length > 15) {
            like_title_txt = title_txt.substring(0, 15)
        }
        let tt = title_txt.length > 100 ? title_txt.substring(0, 100) : title_txt
        setClip(tt)

        try {

            if (can_search) {
                sleep(6000)
                //text = About this shop,heading
                let about_this_shop = selector().textContains("About this shop").exists()
                let sellerInfo = selector().textContains("Seller info").exists()

                if (!is_view_home) {
                    let shop_products = selector().textContains('Products').visibleToUser(true).findOne(1000)
                    let shop_home = selector().textContains('Home').visibleToUser(true).findOne(1000)
                    if (shop_home && shop_products) {
                        is_view_home = true
                    }
                } else {
                    isViewed = selectShopProductHome(like_title_txt, title_txt)
                }
                let isClickSearch = !is_view_home && !about_this_shop && !sellerInfo
                if (is_view_home && !isViewed) {
                    click(917, 167)
                    isClickSearch = true
                }

                if (isClickSearch) {
                    comm.showLog('开始搜索...')
                    let searchTxt = selector().textContains("Search").visibleToUser(true).findOne(10000)
                    for (let j = 0; j < 30; j++) {

                        let retryBtn = selector().textContains('Retry').findOne(1000)
                        if (retryBtn) {
                            comm.httpToString(httpServer + '/api/setProxy?client_no=' + client_no + '&key=63347f5d946164a23faca26b78a91e1c&task_id=' + last_task_id)
                            sleep(1000)
                            comm.clickObj(retryBtn)
                            sleep(6000)
                            continue
                        }
                        searchTxt = selector().textContains("Search").visibleToUser(true).findOne(2000)
                        if (searchTxt) {
                            break
                        }
                    }
                    if (!searchTxt) {
                        return false
                    }
                    setClip(tt)
                    //sleep(1000)
                    //sysInputTextFast(title_txt) 
                    //let editText=selector().className('android.widget.EditText').findOne(1000)
                    //editText.setText(tt)
                    sleep(5000)
                    //sysInputText(null,tt)
                    press(530, 150, 3000)
                    sleep(3000)
                    //back()
                    press(330, 150, 3000)
                    sleep(5000)
                    // let searchs=selector().textContains("Search").visibleToUser(true).find()
                    // if(searchs.length>0){
                    //     comm.clickObj(searchs[searchs.length-1]) 
                    //     sleep(3000)
                    // }
                    click(301, 360)
                    sleep(2000)
                    //comm.clickObj(searchTxt)
                    click(device.width - 150, 150)
                    sleep(5000)
                    for (let j = 0; j < 15; j++) {
                        let retryBtn = selector().textContains('Retry').findOne(1000)
                        if (retryBtn) {
                            comm.httpToString(httpServer + '/api/setProxy?client_no=' + client_no + '&key=63347f5d946164a23faca26b78a91e1c&task_id=' + last_task_id)
                            sleep(1000)
                            comm.clickObj(retryBtn)
                            sleep(6000)
                            continue
                        }
                        let bestTxt = selector().textContains("Best").visibleToUser(true).findOne(1000)
                        let noResults = selector().textContains("No resu").visibleToUser(true).findOne(1000)
                        let like_ar_obj = selector().className('com.lynx.tasm.behavior.ui.text.UIText').textStartsWith(like_title_txt).findOne(1000)
                        if (bestTxt || noResults || like_ar_obj) {
                            break
                        }
                    }
                    //sleep(5000)
                    let bestTxt = selector().textContains("Best").visibleToUser(true).findOne(3000)
                    let noResults = selector().textContains("No resu").visibleToUser(true).findOne(3000)
                    if (!noResults) {
                        bestTxt = selector().textContains("Best").visibleToUser(true).findOne(1000)
                    }
                    if (!bestTxt) {
                        let like_ar1 = selector().textContains(like_title_txt).find()
                        if (!like_ar1) {
                            for (let i = 0; i < 3; i++) {
                                back()
                                let buyNow = selector().className('android.widget.Button').textContains('Buy now').findOne(3000)
                                if (buyNow) {
                                    break
                                }
                            }
                            return false
                        }
                        swipe(random(550, 600), random(1500, 1510), random(550, 600), random(1230, 1250), 430)
                        sleep(1000)
                    }
                } else if (!is_view_home) {
                    is_view_home = true
                    back()
                }
            }
            if (!isViewed) {
                let like_ar_obj = selector().className('com.lynx.tasm.behavior.ui.text.UIText').textStartsWith(like_title_txt).findOne(5000)
                if (like_ar_obj) {
                    comm.showLog('找到相关商品了')
                }
                //搜索页内容
                let like_ar = selector().className('com.lynx.tasm.behavior.ui.text.UIText').textStartsWith(like_title_txt).find()
                if (like_ar.length == 0) {
                    //like_title_txt=like_title_txt.substring(2)
                    like_ar = selector().className('com.lynx.tasm.behavior.ui.text.UIText').textContains(like_title_txt.substring(2, like_title_txt.length - 2)).find()
                }
                if (like_ar.length == 0 && like_title_txt.length > 10) {
                    like_ar = selector().className('com.lynx.tasm.behavior.ui.text.UIText').textContains(like_title_txt.substring(0, 10)).find()
                    if (like_ar.length == 0) {
                        like_ar = selector().textContains(like_title_txt.substring(0, 10)).find()
                    }
                }
                let nomoreTxt = selector().textContains("No more product").findOne(1000)
                let isNoMore = 0
                if (nomoreTxt) {
                    comm.showLog('No more product')
                    sleep(10000)
                    isNoMore = 1
                }
                sleep(1000)
                for (let c = 0; c < 3; c++) {
                    for (let i = 0; like_ar.length > 0; i++) {
                        let isSame = isSameProduct(like_ar, title_txt)
                        if (isSame == 1) {
                            isViewed = true
                            break
                        }
                    }

                    if (isNoMore) {
                        break
                    }
                    if (c < 2 && !isViewed) {
                        sleep(1000)
                        swipe(random(550, 600), random(1500, 1510), random(550, 600), random(1030, 1050), 430)
                        sleep(2000)
                        like_ar = selector().className('com.lynx.tasm.behavior.ui.text.UIText').textStartsWith(like_title_txt).find()
                        if (like_ar.length == 0) {
                            like_ar = selector().className('com.lynx.tasm.behavior.ui.text.UIText').textStartsWith(like_title_txt.substring(2, like_title_txt.length - 2)).find()
                        }
                        if (like_ar.length == 0 && like_title_txt.length > 10) {
                            like_ar = selector().className('com.lynx.tasm.behavior.ui.text.UIText').textStartsWith(like_title_txt.substring(0, 10)).find()
                        }
                    }
                }
            }
            if (!isViewed) {
                for (let i = 0; i < 3; i++) {
                    back()
                    let buyNow = selector().className('android.widget.Button').textContains('Buy now').findOne(3000)
                    if (buyNow) {
                        break
                    }
                }
            }
            //paste()
        } catch (error1) {
            console.log('error1:' + error1)
        }
    } else {
        comm.showLog('找不到 Search in store')
    }
    return isViewed
}

function isSameProduct(like_ar, title_txt) {

    for (let i = 0; i < like_ar.length; i++) {

        comm.clickObj(like_ar[i])
        let buyNow = selector().className('android.widget.Button').textContains('Buy now').findOne(5000)
        let addToCard = selector().className('android.widget.Button').textContains('dd to cart').findOne(5000)
        for (let j = 0; j < 20; j++) {
            let imageVerifyTips = selector().textContains('Verify to continue:').visibleToUser(true).findOne(1000)
            if (imageVerifyTips) {
                sleep(5000)
                comm.showLog('关闭滑块')
                sleep(1000)
                click(1118, 979)
                let retryBtn = selector().textContains('Retry').findOne(5000)
                if (retryBtn) {
                    sleep(6000)
                    comm.clickObj(retryBtn)
                }
                sleep(10000)
                continue
            }
            buyNow = selector().className('android.widget.Button').textContains('Buy now').findOne(1000)
            if (buyNow) {
                break
            }
            addToCard = selector().className('android.widget.Button').textContains('dd to cart').findOne(1000)
            if (addToCard) {
                break
            }
        }
        if (!buyNow && !addToCard) {
            buyNow = selector().className('android.widget.Button').textContains('Buy now').findOne(3000)
            addToCard = selector().className('android.widget.Button').textContains('dd to cart').findOne(3000)
        } else {
            comm.showLog('到达商品详情页')
        }
        if (!buyNow && !addToCard) {
            let shop_products = selector().text('Products').visibleToUser(true).findOne(1000)
            let shop_home = selector().text('Home').visibleToUser(true).findOne(1000)
            if (shop_products || shop_home) {
                continue
            }
            back()
            sleep(3000)
            continue
        }
        //swipe(random(550, 600), random(1500, 1510), random(550, 600), random(1230, 1250),430)
        sleep(2000)
        // new add*******

        let segments = title_txt.match(/\S+/g);
        comm.showLog(segments)
        sleep(2000)
        let seglength = segments.length
        comm.showLog(seglength)
        //new add*****

        let result = selector().textContains(title_txt).visibleToUser(true).findOne(1000)

        if (!result) {
            swipe(random(550, 600), random(1500, 1510), random(550, 600), random(1130, 1150), 430)
            sleep(2000)
            //改为匹配7个连续字符串  
            result = selector().textContains(segments[0]).visibleToUser(true).findOne(1000) &&
                selector().textContains(segments[1]).visibleToUser(true).findOne(1000) &&
                selector().textContains(segments[2]).visibleToUser(true).findOne(1000) &&
                selector().textContains(segments[3]).visibleToUser(true).findOne(1000) &&
                selector().textContains(segments[4]).visibleToUser(true).findOne(1000) &&
                selector().textContains(segments[5]).visibleToUser(true).findOne(1000) &&
                selector().textContains(segments[6]).visibleToUser(true).findOne(1000)
        }
        //new add*****
        //let result=goTextContains(title_txt,0)
        if (result) {
            comm.showLog("是相同商品")
            sleep(5000)
            for (let v = 0; v < 3; v++) {
                swipe(random(550, 600), random(1500, 1510), random(550, 600), random(930, 1050), 430)
                sleep(5000)
            }
            sleep(1000)
            return 1
        } else {
            comm.showLog("不是相同商品")
            back()
            sleep(3000)
        }
    }
    return 0
}

function selectShopProductHome(like_title_txt, title_txt) {

    let isViewed = false
    sleep(2000)
    swipe(random(550, 600), random(1500, 1510), random(550, 600), random(1230, 1250), 430)
    sleep(1000)
    let like_ar = selector().className('com.lynx.tasm.behavior.ui.text.FlattenUIText').visibleToUser(true).textContains(like_title_txt).find()
    if (like_ar.length == 0) {
        like_ar = selector().className('com.lynx.tasm.behavior.ui.text.FlattenUIText').visibleToUser(true).textContains(like_title_txt.substring(2, like_title_txt.length - 2)).find()
    }

    let nomoreTxt = selector().textContains("No more product").findOne(1000)
    let maxlen = 10
    if (nomoreTxt) {
        maxlen = 1
    }
    if (like_ar.length == 0 && like_title_txt.length > 10) {
        like_ar = selector().className('com.lynx.tasm.behavior.ui.text.FlattenUIText').textContains(like_title_txt.substring(0, 10)).find()
        if (like_ar.length == 0) {
            like_ar = selector().textContains(like_title_txt.substring(0, 10)).find()
        }
    }
    for (let i = 0; i < maxlen; i++) {

        if (like_ar.length == 0) {
            swipe(random(550, 600), random(1500, 1510), random(550, 600), random(1030, 1050), 430)
            sleep(2000)
            like_ar = selector().className('com.lynx.tasm.behavior.ui.text.FlattenUIText').visibleToUser(true).textContains(like_title_txt).find()
            if (like_ar.length == 0) {
                like_ar = selector().className('com.lynx.tasm.behavior.ui.text.FlattenUIText').visibleToUser(true).textContains(like_title_txt.substring(2, like_title_txt.length - 2)).find()
            }
        } else {
            break
        }
    }
    for (let i = 0; i < 6; i++) {
        if (like_ar.length > 0) {
            let isSame = isSameProduct(like_ar, title_txt)
            if (isSame == 1) {
                isViewed = true
                break
            }
        }
        if (maxlen == 1) {
            break
        }
        if (i < 5) {
            sleep(1000)
            swipe(random(550, 600), random(1500, 1510), random(550, 600), random(1030, 1050), 430)
            sleep(2000)
            like_ar = selector().className('com.lynx.tasm.behavior.ui.text.FlattenUIText').visibleToUser(true).textContains(like_title_txt).find()
            if (like_ar.length == 0) {
                like_ar = selector().className('com.lynx.tasm.behavior.ui.text.FlattenUIText').visibleToUser(true).textContains(like_title_txt.substring(2, like_title_txt.length - 2)).find()
            }
        }
    }
    return isViewed
}

/**
 * 从按钮集合中筛选指定位置的控件
 * @param {UiObject[]} buttons - 按钮控件数组
 * @param {string} position - 位置参数：left|right|top|bottom|topLeft|topRight|bottomLeft|bottomRight
 * @returns {UiObject|null} 返回匹配的控件或null
 */
function filterButtonByPosition(buttons, position) {
    if (!buttons || buttons.length === 0) return null;

    let result = buttons[0];
    const boundsCache = buttons.map(btn => btn.bounds());

    switch (position) {
        case 'left':
            result = buttons.reduce((prev, curr, idx) =>
                boundsCache[idx].left < prev.bounds().left ? curr : prev);
            break;
        case 'right':
            result = buttons.reduce((prev, curr, idx) =>
                boundsCache[idx].right > prev.bounds().right ? curr : prev);
            break;
        case 'top':
            result = buttons.reduce((prev, curr, idx) =>
                boundsCache[idx].top < prev.bounds().top ? curr : prev);
            break;
        case 'bottom':
            result = buttons.reduce((prev, curr, idx) =>
                boundsCache[idx].bottom > prev.bounds().bottom ? curr : prev);
            break;
        case 'topLeft':
            result = buttons.reduce((prev, curr, idx) => {
                const currBounds = boundsCache[idx];
                const prevBounds = prev.bounds();
                return (currBounds.left + currBounds.top) < (prevBounds.left + prevBounds.top)
                    ? curr : prev;
            });
            break;
        case 'topRight':
            result = buttons.reduce((prev, curr, idx) => {
                const currBounds = boundsCache[idx];
                const prevBounds = prev.bounds();
                return (currBounds.right - currBounds.top) > (prevBounds.right - prevBounds.top)
                    ? curr : prev;
            });
            break;
        case 'bottomLeft':
            result = buttons.reduce((prev, curr, idx) => {
                const currBounds = boundsCache[idx];
                const prevBounds = prev.bounds();
                return (currBounds.left - currBounds.bottom) < (prevBounds.left - prevBounds.bottom)
                    ? curr : prev;
            });
            break;
        case 'bottomRight':
            result = buttons.reduce((prev, curr, idx) => {
                const currBounds = boundsCache[idx];
                const prevBounds = prev.bounds();
                return (currBounds.right + currBounds.bottom) > (prevBounds.right + prevBounds.bottom)
                    ? curr : prev;
            });
            break;
        default:
            throw new Error('Invalid position parameter');
    }
    return result;
}