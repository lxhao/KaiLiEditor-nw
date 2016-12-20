// 国际化
var localLang = {
    // 基本信息
    "number": {"type": "value", "zh": "检查号：", "en": "Number :"},
    "model": {"type": "value", "zh": "镜体：", "en": "Model :"},
    "admission_number": {"type": "value", "zh": "住院号：", "en": "Admission Number :"},
    "name": {"type": "value", "zh": "姓名：", "en": "Name :"},
    "sex": {"type": "value", "zh": "性别：", "en": "Sex :"},
    "age": {"type": "value", "zh": "年龄：", "en": "Age :"},
    "applicant": {"type": "value", "zh": "申请者：", "en": "Applicant :"},
    "checking_time": {"type": "value", "zh": "检查时间：", "en": "Checking Time :"},
    "address": {"type": "value", "zh": "住址：", "en": "Address :"},
    "mobile": {"type": "value", "zh": "联系方式：", "en": "Mobile :"},
    "email": {"type": "value", "zh": "邮箱", "en": "E-mail :"},
    "job": {"type": "value", "zh": "职业：", "en": "Job :"},
    "examine_details": {"type": "value", "zh": "检查所见：", "en": "Examine Details :"},
    "diagnosis": {"type": "value", "zh": "活检部位：", "en": "Diagnosis :"},
    "exmaination_part": {"type": "value", "zh": "诊断：", "en": "Exmaination Part :"},
    "suggestion": {"type": "value", "zh": "建议：", "en": "Suggestions :"},
    "doctor": {"type": "value", "zh": "医生：", "en": "Doctor :"},
    "printed_time": {"type": "value", "zh": "打印时间：", "en": "Printed Time :"},
    "declaration": {"type": "value", "zh": "声明：", "en": "Declaration :"},
};


var fs = require("fs");
var fileSplit = "\\";
var userHomeFolder = process.env.USERPROFILE;
var OSX = process.platform;
if (OSX == "linux" || OSX == "darwin") {
    fileSplit = "/";
    userHomeFolder = process.env.HOME;
}
//模板文件保存到用户家目录
// var templateDir = userHomeFolder + fileSplit + '.sonoScapeEditor' + fileSplit + 'template' + fileSplit;
//模板文件保存到安转目录
var templateDir = process.cwd() + fileSplit + 'template' + fileSplit;

//文件夹不存在，创建
var exists = fs.existsSync(templateDir);
if (!exists) {
    fs.mkdirSync(userHomeFolder + fileSplit + '.sonoScapeEditor');
    fs.mkdirSync(templateDir);
}

var defaultSettings = {
    "topSpace": 1.5,
    "bottomSpace": 1.5,
    "leftSpace": 1.9,
    "rightSpace": 1.9,
    "lineSize": 1,
    "imgWidth": 3.0,
    "imgGap": 0.1

};


/**
 * 自定义确认框
 */
function resumeConfirm(content, success, cancel) {
    if (!content)
        content = "删除后该内容将不可恢复，确认删除吗？";
    $("#confirmContent").text(content);
    $('#delModal').modal("show");
    $("#confirmSuccess").click(function () {
        if (success) {
            success();
            cancel = null;
            success = null;
            $('#delModal').modal("hide");
            $("#confirmSuccess").unbind("click"); // 解除事件
        }
    });

    $("#confirmCancel").click(function () {
        if (cancel) {
            cancel();
            cancel = null;
            success = null;
            $('#delModal').modal("hide");
            $("#confirmCancel").unbind("click");
        }
    });
}

/**
 * 载入默认模板文件
 */
function importDefaultTemplate() {
    fs.readFile(templateDir + 'default.html', function (err, data) {
        if (err) {
            //可能没有设置默认模板文件
            return;
        }
        KindEditor.html('#editor_id', "");
        KindEditor.html('#editor_id', data.toString());
    });
}

/**
 * 设置快捷键
 * hotkeys 设置的快捷键不对编辑器生效，故同时调用了编辑器ctrl方法
 */
function setHotkeys(scope) {
    KindEditor.ctrl(scope, 'R', function () {
        resumeConfirm("当前修改的内容没有保存,确认要重新加载数据？", function () {
            nw.Window.get().reload();
        }, function () {
        });
    });

    hotkeys('ctrl+r', function (event, handler) {
        resumeConfirm("当前修改的内容没有保存,确认要重新加载数据？", function () {
            nw.Window.get().reload();
        }, function () {
        });
    });

    //调试用
    hotkeys('ctrl+shift+r', function (event, handler) {
        nw.Window.get().reload();
    });

    function saveHtml() {
        //当前html文件是否是首次保存
        var filePath = $(".filePath").text();
        if (filePath) {
            var html = editor.fullHtml();
            fs.writeFile(filePath, html, function (err) {
                if (err) {
                    alert("保存失败!");
                }
            });
            layer.msg("文件已保存为" + filePath);
            document.title = filePath;
            return;
        }
        $(".saveBtn").trigger("click");
    }

    KindEditor.ctrl(scope, 'S', function () {
        saveHtml();
    });

    hotkeys('ctrl+s', function (event, handler) {
        saveHtml();
    });

    hotkeys('escape', function (event, handler) {
        //隐藏导入文件提示框,隐藏设置界面，隐藏模板列表
        $('#importReport').modal('hide');
        $('#settingsPage').modal('hide');
        $('#model_template_name').modal('hide');
        $('#changecloseBtn').trigger('click');
        $('#content').trigger('click');
    });
}

/**
 * 清除空白符
 */
function clearBlank(text) {
    if (!text)
        return "";
    text = text.replace(/(^\s+)|(\s+$)/ig, '');
    return text;
}

// 初始化信息
$(function () {
    /**
     * 国际化
     * 注：导出的JS
     */
    function i18n() {
        var language = $(".langSwitch").attr("for-value");
        if (language == null || language == "") {
            language = $("#hidden_data_resume_language").val()
        }
        var nowLang = language;
        var oldLang = null;
        if (nowLang == "zh")
            oldLang = "en";
        else
            oldLang = "zh";
        for (var key in localLang) {
            var langValue = localLang[key];
            var nowValue = langValue[nowLang];
            var oldValue = langValue[oldLang];
            var value = null;
            //编辑器的根节点
            var editerDocument = window.editor.edit.iframe.get().contentWindow.document;
            var keyObj = editerDocument.getElementsByClassName("resume_lang_" + key);
            //没有对应的标签
            if (keyObj.length == 0) {
                continue;
            }
            keyObj = keyObj[0];
            var type = langValue["type"];
            if (type == "html")
                value = keyObj.html();
            else
                value = keyObj.textContent;
            value = clearBlank(value);
            //二次判断
            if (value == oldValue) {
                if (type == "html") {
                    keyObj.html(nowValue);
                }
                else
                    keyObj.innerHTML = nowValue;
            }
        }
    }

    // 返回顶部
    $(window).scroll(function () {
        var scrollt = document.body.scrollTop - document.documentElement.scrollTop;
        if (scrollt > 300)
            $(".gotop").show();
        else
            $(".gotop").hide();
    });
    $(".gotop").click(function () {
        $("html,body").animate({scrollTop: "0px"}, 200);
    });

    /**
     * 语言切换
     */
    $("#langSwitch").click(function () {
        if ($("#langSwitch").attr("for-value") == "en") {
            $("#langSwitch").attr("for-value", "zh");
            $("#langSwitch").html("english");
        } else {
            $("#langSwitch").attr("for-value", "en");
            $("#langSwitch").html("中文");
        }
        console.log("切换语言为：" + $("#langSwitch").attr("for-value"));
        i18n();
    });

    /**
     * 清除所有的HTMl的标签，计算实际内容字数
     */
    function clearAllHtmlText(text) {
        if (!text)
            return "";
        text = text.replace(/<[^>]+>/g, "");
        text = text.replace(/[\n]/ig, '');
        text = text.replace(/[\r]/ig, '');
        text = text.replace(/[\t]/ig, '');
        return text;
    }

    $(function () {
        var baseHeight = $(".baseditBar").height();
        if (baseHeight >= 146) {
            $(".mubaninfoBar").css('margin-top', '228px');
        }
    });

});

$(document).ready(function () {

    //导入诊单
    $(".importFileBtn").click(function () {
        $('#importReport').modal('show');
    });

    //设置页面
    $(".pageSettingsBtn").click(function () {
        $('#settingsPage').modal('show');
    });

    $("#closeBtn").click(function () {
        $(".vipModal").stop().slideUp(300);
    });

    //拖动读取文件
    dragReadFile();
    function dragReadFile() {
        var holder = document.body;
        holder.ondragover = function () {
            return false;
        };
        holder.ondragleave = holder.ondragend = function () {
            return false;
        };
        holder.ondrop = function (e) {
            e.preventDefault();
            var file = e.dataTransfer.files[0];
            console.log(file.path.toString());
            readFileByPath(file.path);
            return false;
        };
    }

    //开发过程中做测试用,按下alt+r载入xml文件
    // hotkeys('alt+e', function (event, handler) {
    //     var evt = document.createEvent("HTMLEvents");
    //     evt.initEvent("change", false, true);
    //     chooser.dispatchEvent(evt);
    // });

    //导入文件
    var chooser = document.querySelector('#xmlFile');
    chooser.addEventListener("change", function (evt) {
        // 检查文件是否选择:
        var filePath = this.value.toString();
        this.value = null;
        console.log(filePath);
        //开发过程中做测试用,按下alt+r载入xml文件
        if (!filePath) {
            // filePath = '/home/lxhao/code/nw/KaiLiReport/report/report.xml';
            return;
        }
        $(".div_upload").find("p").text(filePath);
        readFileByPath(filePath);
    });

    function readFileByPath(filePath) {
        if (!$(".xmlFilePath").get(0)) {
            //用来保存文件路径,再次点击保存按钮式可以直接保存
            var filePathNode = document.createElement('p');
            $(filePathNode).addClass("xmlFilePath");
            document.body.appendChild(filePathNode);
        }
        $(".xmlFilePath").html(filePath);
        document.title = filePath;
        var fileType = filePath.substring(filePath.lastIndexOf(".") + 1);
        var basePath = filePath.substring(0, filePath.lastIndexOf(fileSplit) + 1);
        if (fileType.toLocaleLowerCase() == "html") {
            readHtmlByPath(filePath);
            return;
        }

        if (fileType.toLocaleLowerCase() == "xml") {
            fs.readFile(filePath, function (err, data) {
                if (err) {
                    layer.alert('读取文件失败' + err.message, {
                        skin: 'layui-layer-lan',
                        closeBtn: 0,
                        anim: 4 //动画类型
                    });
                    return;
                }
                //隐藏导入文件提示框
                $('#importReport').modal('hide');
                updateContent(basePath, data);
            });
            return;
        }

        layer.tips("请选择xml或html类型的文件", '#xmlFile');

    }

    //读取html文件
    function readHtmlByPath(filePath) {
        fs.readFile(filePath, function (err, data) {
            if (err) {
                layer.alert('读取文件失败' + err.message, {
                    skin: 'layui-layer-lan',
                    closeBtn: 0,
                    anim: 4 //动画类型
                });
                return;
            }
            //隐藏导入文件提示框
            $('#importReport').modal('hide');
            KindEditor.html('#editor_id', data.toString());
        });

    }

    //读取xml文件内容，并对页面内容进行更新
    function updateContent(basePath, data) {

        var parser = new DOMParser();
        var xmlDoc = parser.parseFromString(data, "text/xml");
        var nodes = xmlDoc.documentElement.childNodes;
        var reportContent = nodes[1];
        var nodesCount = reportContent.childElementCount;
        console.log("节点数量:" + nodesCount);
        var editerDocument = window.editor.edit.iframe.get().contentWindow.document;
        /**
         * 把当前所有节点标记为未更新
         */
        setAttrUpdated(editerDocument.children[0]);

        var priorNode = null, tags = null;
        //模板节点
        var templateNode = document.body.getElementsByClassName("container");
        templateNode = templateNode[0];
        for (var i = 0; i < nodesCount; i++) {
            var xmlNode = reportContent.children[i];
            console.log(xmlNode.tagName + "的属性:");
            /**
             * 判断编辑器是否有从xml文件加载过当前节点, 有加载则使用直接替换内容
             * 没有加载则添加一个节点
             */
            priorNode = tags && tags[0] ? tags[0] : editerDocument.body.firstChild;
            tags = editerDocument.getElementsByClassName(xmlNode.tagName);
            if (tags.length > 0) {

                //定位到当前页面需要更新的标签,加小于10的判断是为了防止出错后死循环
                var temp = 0;
                while (tags[temp] && ('true' == tags[temp++].getAttribute("updated")) && temp < 10);
                temp--;
                if ('false' == tags[temp].getAttribute("updated")) {
                    updateNode(tags[temp], xmlNode, basePath);
                } else {
                    //扩展一个子元素
                    var cloneNode = tags[temp].cloneNode(true);
                    $(cloneNode).children(".value").html("");
                    $(cloneNode).children(".name").html("");
                    $(tags[temp]).after(cloneNode);
                    cloneNode.style.display = "inline-block";
                    tags[temp].style.display = "inline-block";
                    updateNode(cloneNode, xmlNode, basePath);
                }
                console.log(temp);
            } else {
                //模板文件不存在匹配的节点
                var cloneNode = templateNode.cloneNode(true);
                var addedNode = $(cloneNode).children("div").get(0);
                $(addedNode).addClass(xmlNode.tagName);
                //parentNode定位到class为container的父元素, next定位到分割线
                $(priorNode.parentNode).next().after(cloneNode);
                $(cloneNode).after($(".line").get(0).cloneNode(true));
                updateNode(addedNode, xmlNode, basePath);
                priorNode = addedNode;
            }
        }
        //自动匹配图片宽度
        // if (true) {
        //     autoFitImgsWidth();
        // }
    }


    //判断是否以字符串结尾
    String.prototype.endsWith = function (endStr) {
        var d = this.length - endStr.length;
        return (d >= 0 && this.lastIndexOf(endStr) == d)
    };

    //更新标签
    function updateNode(toTag, xmlTag, basePath) {
        //判断图片和文本
        var textContent = xmlTag.textContent;
        if (textContent.endsWith("jpg") || textContent.endsWith("png" || textContent.endsWith("bmp"))) {
            var imgPath = basePath + "img/" + textContent;
            var img = $(toTag).children(".value");
            console.log(imgPath);
            img.attr("src", "file:" + imgPath);
            img.attr("data-ke-src", "file:" + imgPath);
        } else {
            //替换成html的换行符
            textContent = textContent.replace(/#0d/g, "<br/>");
            textContent = textContent.replace(/&/g, "");
            $(toTag).children(".value").html(textContent);
        }

        //根据用户选择加载xml文件中设置的属性
        var importAttrs = $("#importAttrs").eq(0).attr('checked') == 'checked';
        var attrs = xmlTag.attributes;
        var len = attrs.length;
        for (var j = 0; j < len; j++) {
            console.log(attrs[j].name + ":" + attrs[j].value);
            if (attrs[j].name == 'name' && toTag.getElementsByClassName("name").length > 0) {
                //class为name的子节点存在与不存在分别处理
                $(toTag).children(".name").html(attrs[j].value + "：");
            }
            if (importAttrs) {
                $(toTag).children(".value").css(attrs[j].name, attrs[j].value);
            }
        }
        toTag.setAttribute("updated", 'true');
    }


    //给所有节点设置属性updated为false
    function setAttrUpdated(nodes) {
        nodes.setAttribute("updated", 'false');
        if (nodes.childElementCount == 0) {
            return;
        }
        for (var i = 0; i < nodes.childElementCount; i++) {
            setAttrUpdated(nodes.children[i]);
        }
    }

    //显示更换模板列表
    function resumeModal() {
        $(".changeModalBtn").click(function () {
            $(".changeModal").stop().fadeIn(300);
            var display = $('.changeModal').css('display');
            if (display == 'none') {
                $("html").css('overflow', 'auto');
            } else {
                $("html").css('overflow', 'hidden');
            }
            reload_template_list();
        });

        //关闭模板列表页面
        $("#changecloseBtn").click(function () {
            $(".changeModal").stop().fadeOut(300);
            var display = $('.changeModal').css('display');
            if (display == 'none') {
                $("html").css('overflow', 'hidden');
            } else {
                $("html").css('overflow', 'auto');
            }
            $("#templateKeyword").val("");
        });

    }

    resumeModal();

    //列表鼠标经过效果
    function mbList() {
        $(".zx-mblist-box .list-con").each(function () {
            $(this).on('mouseenter', function (e) {
                var e = e || window.event;
                var angle = direct(e, this)
                mouseEvent(angle, this, 'in')
                //显示删除叉
                $(this).find(".closeImg").css('display', 'inline-block');
            })
            $(this).on('mouseleave', function (e) {
                var e = e || window.event;
                var angle = direct(e, this)
                mouseEvent(angle, this, 'off')
                $(this).find(".closeImg").css('display', 'none');
            })
        });

        function direct(e, o) {
            var w = o.offsetWidth;
            var h = o.offsetHeight;
            var top = o.offsetTop;                    //包含滚动条滚动的部分
            var left = o.offsetLeft;
            var scrollTOP = document.body.scrollTop || document.documentElement.scrollTop;
            var scrollLeft = document.body.scrollLeft || document.documentElement.scrollLeft;
            var offTop = top - scrollTOP;
            var offLeft = left - scrollLeft;
            var ex = (e.pageX - scrollLeft) || e.clientX;
            var ey = (e.pageY - scrollTOP) || e.clientY;
            var x = (ex - offLeft - w / 2) * (w > h ? (h / w) : 1);
            var y = (ey - offTop - h / 2) * (h > w ? (w / h) : 1);

            var angle = (Math.round((Math.atan2(y, x) * (180 / Math.PI) + 180) / 90) + 3) % 4 //atan2返回的是弧度 atan2(y,x)
            var directName = ["上", "右", "下", "左"];
            return directName[angle];  //返回方向  0 1 2 3对应 上 右 下 左
        }

        function mouseEvent(angle, o, d) { //方向  元素  鼠标进入/离开
            var w = o.offsetWidth;
            var h = o.offsetHeight;

            if (d == 'in') {
                switch (angle) {
                    case '上':
                        $(o).find(".hover-btn").css({left: 0, top: -h + "px"}).stop(true).animate({
                            left: 0,
                            top: 0
                        }, 300)
                        break;
                    case '右':
                        $(o).find(".hover-btn").css({left: w + "px", top: 0}).stop(true).animate({
                            left: 0,
                            top: 0
                        }, 300)
                        break;
                    case '下':
                        $(o).find(".hover-btn").css({left: 0, top: h + "px"}).stop(true).animate({
                            left: 0,
                            top: 0
                        }, 300)
                        break;
                    case '左':
                        $(o).find(".hover-btn").css({left: -w + "px", top: 0}).stop(true).animate({
                            left: 0,
                            top: 0
                        }, 300)
                        break;
                }
            } else if (d == 'off') {
                switch (angle) {
                    case '上':
                        setTimeout(function () {
                            $(o).find(".hover-btn").stop(true).animate({left: 0, top: -h + "px"}, 300)
                        }, 200)
                        break;
                    case '右':
                        setTimeout(function () {
                            $(o).find(".hover-btn").stop(true).animate({left: w + "px", top: 0}, 300)
                        }, 200)
                        break;
                    case '下':
                        setTimeout(function () {
                            $(o).find(".hover-btn").stop(true).animate({left: 0, top: h + "px"}, 300)
                        }, 200)
                        break;
                    case '左':
                        setTimeout(function () {
                            $(o).find(".hover-btn").stop(true).animate({left: -w + "px", top: 0}, 300)
                        }, 200)
                        break;
                }
            }
        }
    }


    //字符串的占位替换
    String.prototype.format = function () {
        if (arguments.length == 0) return this;
        for (var s = this, i = 0; i < arguments.length; i++)
            s = s.replace(new RegExp("\\{" + i + "\\}", "g"), arguments[i]);
        return s;
    };

    /**
     * 载入模板列表
     */
    function reload_template_list() {
        //清空列表
        $("#data_template_list").html('');
        $("#without_tips").hide();
        fs.readdir(templateDir, function (err, files) {
            if (err) {
                layer.alert('读取模板文件出错，请检查应用程序下“template"是否存在！', {
                    skin: 'layui-layer-lan',
                    closeBtn: 0,
                    anim: 4 //动画类型
                });
            }
            if (files.length == 0) {
                $("#without_tips").show();
                return;
            }
            for (var i = 0; i < files.length; i++) {
                if (files[i].substring(files[i].lastIndexOf('.') + 1, files[i].length) != 'html') {
                    continue
                }
                var imgName = files[i].substring(0, files[i].lastIndexOf(".")) + ".png";
                var htmlCode =
                    '<div class="list-con clearfix">' +
                    '<div class="img">' +
                    '<img src="{0}"/>' +
                    '<div class="hover-btn">' +
                    '<a href="javascript:;" class="change_template">选择</a>' +
                    '<img src="../images/close_pop.png" class="del_template" alt="删除" />' +
                    '</div>' +
                    '</div>' +
                    '<input class="templateName" value={1} data={2}>' +
                    '</div>';
                htmlCode = htmlCode.format('file://' + templateDir + imgName, files[i].substring(0, files[i].lastIndexOf('.')), files[i].substring(0, files[i].lastIndexOf('.')));
                var templateNode = document.createElement('li');
                $(templateNode).addClass("data_template_list");
                templateNode.innerHTML = htmlCode;
                $("#data_template_list").get(0).appendChild(templateNode);
            }
            chooseTemplateListener();
            delTemplateListener();
            renameTemplateLintener()
            mbList();
        });
    };

    //重命名模板文件名
    function renameTemplateLintener() {
        //鼠标离开时保存用户操作
        $('.templateName').blur(function () {
            //data保存了修改前的名字
            var templateBaseName = templateDir + $(this).attr("data");
            var templateFilename = templateBaseName + ".html";
            var templateImgName = templateBaseName + ".png";

            //新模板名
            var newName = clearBlank($(this).val());
            if (!newName || newName.length == 0) {
                layer.alert('模板名不能为空', {
                    skin: 'layui-layer-lan',
                    closeBtn: 0,
                    anim: 4 //动画类型
                });

                $(this).val($(this).attr('data'));
                return;
            }

            if (newName == $(this).attr('data')) {
                return;
            }
            var newBaseName = templateDir + newName;

            //重名检查
            var nameNodes = $(".templateName");
            for (var i = 0; i < nameNodes.length; i++) {
                if ($(this).val() == ((nameNodes.eq(i).attr('data') ))) {
                    layer.alert('该模板名已存在', {
                        skin: 'layui-layer-lan',
                        closeBtn: 0,
                        anim: 4 //动画类型
                    });
                    $(this).val($(this).attr('data'));
                    return;
                }
            }

            fs.rename(templateFilename, newBaseName + ".html", function () {
                $(this).attr("data", $(this).val());
            });
            fs.rename(templateImgName, newBaseName + ".png", function () {
            });
            console.log(newBaseName);
        });
    }

    //删除模板文件
    function delTemplateListener() {
        $(".del_template").click(function () {
            var templateBaseName = templateDir + $(this).parents(".list-con").children("input").val();
            var templateFilename = templateBaseName + ".html";
            var templateImgName = templateBaseName + ".png";
            //删除模板文件
            fs.unlinkSync(templateFilename);
            fs.unlinkSync(templateImgName);
            //重新载入模板列表
            reload_template_list();
            console.log(templateFilename);
            console.log(templateImgName);
        });

        $(".del_template").hover(function () {
                $(this).css("background-color", "#f35959");
            },
            function () {
                $(this).css("background-color", "transparent");
            });

    }

    //选择模板文件
    function chooseTemplateListener() {
        $(".change_template").click(function () {
            var templateBaseName = templateDir + $(this).parents(".list-con").children("input").val();
            var templateFilename = templateBaseName + ".html";
            console.log(templateFilename);
            fs.readFile(templateFilename, function (err, data) {
                if (err) {
                    layer.alert('加载模板出错' + err.message, {
                        skin: 'layui-layer-lan',
                        closeBtn: 0,
                        anim: 4 //动画类型
                    });
                    return;
                }
                KindEditor.html('#editor_id', "");
                KindEditor.html('#editor_id', data.toString());
                //隐藏模板列表
                $('#changecloseBtn').trigger('click');
                //载入
                var xmlFilePath = $(".xmlFilePath").html();
                if (xmlFilePath && xmlFilePath.length > 0) {
                    readFileByPath(xmlFilePath)
                }
            });
        });
    }

    //恢复默认设置
    $("#defaultSettings").click(function () {
        $("#topSpace").get(0).value = defaultSettings.topSpace;
        $("#bottomSpace").get(0).value = defaultSettings.bottomSpace;
        $("#leftSpace").get(0).value = defaultSettings.leftSpace;
        $("#rightSpace").get(0).value = defaultSettings.rightSpace;
        $("#lineSize").get(0).value = defaultSettings.lineSize;
        $("#imgGap").get(0).value = defaultSettings.imgGap;
        $("#imgWidth").get(0).value = defaultSettings.imgWidth;
    });

//保存设置
    $("#saveSettings").click(function () {
        var topSpace = $("#topSpace").get(0).value + "cm";
        if (!/^[1-9]\d*\.\d+(cm)$|0\.\d*[1-9]\d*(cm)$|^[1-9]\d*(cm)$/.test(topSpace)) {
            layer.tips("上边距请输入数字或小数！", '#topSpace')
            return;
        }
        var bottomSpace = $("#bottomSpace").get(0).value + "cm";
        if (!/^[1-9]\d*\.\d+(cm)$|0\.\d*[1-9]\d*(cm)$|^[1-9]\d*(cm)$/.test(bottomSpace)) {
            layer.tips("下边距请输入数字或小数！", '#bottomSpace')
            return;
        }
        var leftSpace = $("#leftSpace").get(0).value + "cm";
        if (!/^[1-9]\d*\.\d+(cm)$|0\.\d*[1-9]\d*(cm)$|^[1-9]\d*(cm)$/.test(leftSpace)) {
            layer.tips("左边距请输入数字或小数！", "#leftSpace")
            return;
        }
        var rightSpace = $("#rightSpace").get(0).value + "cm";
        if (!/^[1-9]\d*\.\d+(cm)$|0\.\d*[1-9]\d*(cm)$|^[1-9]\d*(cm)$/.test(rightSpace)) {
            layer.tips("右边距请输入数字或小数！", "#rightSpace")
            return;
        }

        //页边距
        var editerDocument = window.editor.edit.iframe.get().contentWindow.document;
        var editorBody = $(editerDocument.body);
        editorBody.css("padding-left", leftSpace);
        editorBody.css("padding-right", rightSpace);
        editorBody.css("padding-top", topSpace);
        editorBody.css("padding-bottom", bottomSpace);

        //分隔线厚度
        var lineSize = $("#lineSize").get(0).value + "pt";
        if (!/^[1-9]\d*(pt)$/.test(lineSize)) {
            layer.tips("线条大小请输入大于0的整数！", "#lineSize")
            return;
        }
        var lineNodes = $(editerDocument.body).find(".line");
        lineNodes.each(function () {
            this.size = lineSize;
            console.log(this.size);
        });

        //图片间距, 宽度
        // var imgWidth = $("#imgWidth").get(0).value + "cm";
        var imgWidth = "auto";
        var imgGap = $("#imgGap").get(0).value + "cm";
        if (!/^[1-9]\d*\.\d+(cm)$|0\.\d*[1-9]\d*(cm)$|^[1-9]\d*(cm)$/.test(imgGap)) {
            layer.tips("图片间距请输入数字或小数！", "#imgGap")
            return;
        }
        imgNodes = $(editerDocument.body).find(".IMG1");
        imgNodes.each(function () {
            $(this).children(".value").css("width", imgWidth);
            $(this).css("padding-left", imgGap);
        });

        imgNodes = $(editerDocument.body).find(".IMG2");
        imgNodes.each(function () {
            $(this).children(".value").css("width", imgWidth);
            $(this).css("padding-left", imgGap);
        });

        $('#settingsPage').modal('hide');
    });

    //自动调整图片宽度
    function autoFitImgsWidth() {
        var editerDocument = window.editor.edit.iframe.get().contentWindow.document;

        //第一行图片
        imgNodes = $(editerDocument.body).find(".IMG1");
        //图片间距, 宽度
        var leftSpace = $("#leftSpace").get(0).value;
        var rightSpace = $("#rightSpace").get(0).value;
        var imgGap = $("#imgGap").get(0).value + "cm";
        var imgWidth = (21 - leftSpace - rightSpace) / imgNodes.length;
        imgWidth = imgWidth + "cm";

        imgNodes.each(function () {
            $(this).children(".value").css("width", imgWidth);
            $(this).css("padding-left", imgGap);
        });

        // //第二行图片
        imgNodes = $(editerDocument.body).find(".IMG2");
        imgWidth = (21 - leftSpace - rightSpace) / imgNodes.length;
        imgWidth = imgWidth - 0.1 + "cm";
        imgNodes.each(function () {
            $(this).children(".value").css("width", imgWidth);
            $(this).css("padding-left", imgGap);
        });

    }

    /**
     * html转换对象
     * @type {string}
     */
    var htmlTransf = new Object({
        _count: 0,
        toHtml: function (filePath, html) {
            fs.writeFile(filePath, html, function (err) {
                if (err) {
                    alert("保存失败!");
                }
            });
        },

        toPdf: function (filePath, html) {
        },

        toWord: function (filePath, html) {
        }
    });

    //保存为模板文件
    $(function () {
        $("#save_template_btn").click(function () {
            $('#model_template_name').modal("show");
        });

        $("#template_name_btn").click(function () {
            var filename = $("#template_name").val();
            //判断是否为合法输入
            if (!filename) {
                layer.msg("请输入合法文件名！");
            }
            var filePath = templateDir + filename + '.html';
            console.log(filePath);
            var html = editor.fullHtml();
            htmlTransf.toHtml(filePath, html);
            var editerDocument = window.editor.edit.iframe.get().contentWindow.document;
            html2canvas(editerDocument.body, {
                onrendered: function (canvas) {
                    var base64Data = canvas.toDataURL("image/png").replace(/^data:image\/png;base64,/, "")
                    fs.writeFile(templateDir + filename + '.png', base64Data, 'base64', function (err) {
                        if (err) {
                            alert("保存模板失败!");
                        }
                        $('#model_template_name').modal("hide");
                        layer.msg("模板已保存为" + filename);
                    });
                }
            });
        });
    });

    //保存为html文件
    $(".saveBtn").click(function () {
        $("#saveHtmlFile").click();
        KindEditor.sync('#editor_id');
        var chooser = document.querySelector('#saveHtmlFile');
        chooser.addEventListener("change", function (evt) {
            var filePath = this.value.toString();
            if (!filePath) {
                return;
            }
            if (!$(".filePath").get(0)) {
                //用来保存文件路径,再次点击保存按钮式可以直接保存
                var filePathNode = document.createElement('p');
                $(filePathNode).addClass("filePath");
                filePathNode.innerHTML = filePath;
                document.body.appendChild(filePathNode);
            }
            var html = editor.fullHtml();
            $(".filePath").html(filePath);
            htmlTransf.toHtml(filePath, html);
            document.title = filePath;
            layer.msg("文件已保存为" + filePath);
        });
    });

    //预览
    $("#preview_btn").click(function () {
        var editToolbar = window.editor.toolbar;
        var editPreviewBtn = editToolbar.get("preview").children("div");
        $(editPreviewBtn).trigger("click");
    });

    //打印
    $("#printBtn").click(function () {
        var editToolbar = window.editor.toolbar;
        var editPreviewBtn = editToolbar.get("print").children("div");
        $(editPreviewBtn).trigger("click");
    });

    //添加右击菜单
    $(function () {
        var gui = require('nw.gui');
        var win = nw.Window.get();
        var menu1 = new gui.Menu();
        var windowProperties = {
            width: nw.App.manifest.window.width,
            height: nw.App.manifest.window.height,
            min_width: nw.App.manifest.window.min_width,
            min_height: nw.App.manifest.window.min_height
        };
        menu1.append(new gui.MenuItem({
            icon: 'imgs/email.png', label: '新建窗口', click: function () {
                openAppWindow(nw.App.manifest.onlineURL);
            }
        }));
        menu1.append(new gui.MenuItem({
            icon: 'imgs/cut.png', label: '重新载入', click: function () {
                resumeConfirm("当前修改的内容没有保存,确认要重新加载数据？", function () {
                    nw.Window.get().reload();
                }, function () {
                });
            }
        }));
        win.window.addEventListener('contextmenu', function (ev) {
            ev.preventDefault();
            menu1.popup(ev.x, ev.y);
            return false;
        });

        function openAppWindow(onlineURL) {
            //加载编辑器页面
            nw.Window.open(onlineURL, windowProperties, function (win) {
                nw.App.on('reopen', function () {
                    win.show();
                });
                // win.window.onload = function () {
                //     win.maximize();
                // };
            });
        }

    });


// KindEditor.ready(function () {
//     //页边距
//     var editerDocument = window.editor.edit.iframe.get().contentWindow.document;
//     var editorBody = $(editerDocument.body);
//     editorBody.css("padding-left", defaultSettings.leftSpace + "cm");
//     editorBody.css("padding-right", defaultSettings.rightSpace + "cm");
//     editorBody.css("padding-top", defaultSettings.topSpace + "cm");
//     editorBody.css("padding-bottom", defaultSettings.bottomSpace + "cm");
// });
});
