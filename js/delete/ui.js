var gui = require('nw.gui');
var menubar = new gui.Menu({type: 'menubar'});
menubar.append(new gui.MenuItem({
        label: '菜单1',
        click: function () {
            alert("aa");
        }
    })
);
var win = gui.Window.get();
win.menu = menubar;
