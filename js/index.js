var gui = require('nw.gui');

var OSX = process.platform === "darwin";
var userHomeFolder = OSX ? process.env.HOME : process.env.USERPROFILE;
var mainWindow = nw.Window.get(),
    trayIcon = OSX ? 'menubar@2x.png' : 'icon.png',
    trayIconOffline = OSX ? 'offline@2x.png' : 'icon-offline.png',
    trayIconMissed = OSX ? 'missed@2x.png' : 'missed.png';

//任务栏
var tray = new nw.Tray({icon: trayIconOffline});
//任务栏菜单
var menu = new nw.Menu();

var windowProperties = {
    width: nw.App.manifest.window.width,
    height: nw.App.manifest.window.height,
    min_width: nw.App.manifest.window.min_width,
    min_height: nw.App.manifest.window.min_height
};


//打开调试工具
function showDevTools() {
    mainWindow.showDevTools();
}

//设置快捷键
function settingShotcuts() {
    //退出快捷键
    var option = {
        key: "Ctrl+Q",
        active: function () {
            quit();
        },
        failed: function (msg) {
            console.log(msg);
        }
    };
    var shortcut = new gui.Shortcut(option);
    gui.App.registerGlobalHotKey(shortcut);
}

function quit() {
    nw.App.quit();
}

function openAppWindow(onlineURL) {
    //加载编辑器页面
    nw.Window.open(onlineURL, windowProperties, function (win) {
        win.maximize();
        // nw.App.on('reopen', function () {
        //     win.show();
        // });
        tray.on('click', function () {
            win.show();
        });

        menuitems(win);
        // win.window.onload = function () {
        //     win.maximize();
        //     setTimeout(function () {
        //         win.window.location.href = onlineURL;
        //     }, 5000);
        // };
    });
}

function menuitems(win) {
    var menu1 = new gui.Menu();
    var submenu = new gui.Menu();
    submenu.append(new gui.MenuItem({type: 'checkbox', label: 'box1'}));
    submenu.append(new gui.MenuItem({type: 'checkbox', label: 'box2'}));
    submenu.append(new gui.MenuItem({type: 'checkbox', label: 'box3'}));
    submenu.append(new gui.MenuItem({type: 'checkbox', label: 'box4'}));
    menu1.append(new gui.MenuItem({icon: 'imgs/cut.png', label: 'Cut'}));
    menu1.append(new gui.MenuItem({icon: 'imgs/edit.png', label: 'Edit'}));
    menu1.append(new gui.MenuItem({icon: 'imgs/email.png', label: 'Email'}));
    menu1.append(new gui.MenuItem({icon: 'imgs/play.png', label: 'Play'}));
    menu1.append(new gui.MenuItem({icon: 'imgs/tick.png', label: 'Tick'}));
    menu1.append(new gui.MenuItem({type: 'separator'}));
    menu1.append(new gui.MenuItem({icon: 'imgs/disk.png', label: 'Disk', submenu: submenu}));

    win.window.document.body.addEventListener('contextmenu', function (ev) {
        ev.preventDefault();
        menu1.popup(ev.x, ev.y);
        return false;
    });

}

if (window.process) {
    mainWindow.maximize();
    openAppWindow(nw.App.manifest.onlineURL);
    menu.append(new nw.MenuItem({label: '调试', click: showDevTools}));
    menu.append(new nw.MenuItem({label: '退出', click: quit}));
    tray.menu = menu;
    settingShotcuts();
    process.on('uncaughtException', function (err) {
        console.error('uncaughtException:', err);
        console.error(err.stack);
    });
}
