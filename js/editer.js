/**
 * 在线编辑JS
 * JS使用说明：
 * 1.国际化：
 *        所有需要使用到国际化的元素名称都是用样式"resume_lang_xxxx"，xxxx为localLang的key值
 *        type为html表示为div内容；value表示为input值
 *        zh为中文；en为英文
 * 2.取值：
 *        基本属性（姓名、年龄等等）：
 *            class：resume_msg；for-key：属性名称；for-type：自定义；for-value：值的属性（默认：input，html：div内容，value：input）
 *        含有时间的混合属性值：
 *            class：resume_item；for-key（id）：属性名称；resume_value：属性值；resume_item_items：多项值（resume_time：时间；resume_unit：单位；resume_job：职位）
 *        图标项：
 *            class：resume_icon resume_icon_item；resume_value：单项；for-key：属性名称；for-value：属性值类型（默认：input，html：div内容，value：input）；
 *        图表项：
 *            class：resume_graph resume_graph_item；resume_value：单项；for-key：属性名称；for-value：属性值类型（默认：input，html：div内容，value：input）；
 *        自定义项：
 *            class：resume_custom；id：唯一标识；resume_name：自定义项名称；其他类同于"含有时间的混合属性值"；
 * 3.头像：
 *        头像外部div的ID：resume_head，img的class：resume_head
 * 4.线条工具：
 *        所有可编辑的线条加上class：resume_line
 * 5.图标工具:(for-id保存为key，遍历显示)
 *        所有可编辑的图标工具加上class：resume_icon_diy
 * 6.模块的显示隐藏
 *        取值：.resume_module span；for-id与模块的id值一致；
 * 7.模块排序：(分bar和foo排序)
 *        排序的模块加样式：resume_sort；同时含有唯一的标识。
 * 8.模块删除
 *        删除按钮样式：resume_delete；删除最近的一个区域：resume_delete_area
 *        内容删除按钮样式：resume_delete_；删除最近一个内容区域：resume_delete_area_
 *        自定义项删除样式：resume_custom_delete；删除最近一个自定义项区域：resume_custom_delete_area
 * 9.编辑区域
 *        所有可编辑的内容使用div+contenteditable实现
 *        所有可添加模块在尾部定义添加内容：get_resume_msg：自定义属性；get_resume_graph：自定义图表；get_resume_icon：自定义图标；
 *        get_resume_item多项值的单项；get_resume_item_area：自定义不含时间的自定义项；get_resume_items_area：自定义含时间的自定义项；
 *        编辑区域样式：
 *            baseBorder：可编辑边框
 * 10.加载参数
 *        setSquare：是否是正方形头像，是否是圆形头像
 *        setTheme：当前主题标识
 *        resumeStyle：当前主题支持的颜色（主题名称，颜色值），当前主题
 *        resumeModuleSort：排序
 * 11.导出加载
 *        var language：当前语言
 *        resumeModuleSort：排序
 * 12.提示内容
 *        提示的内容最外层div上面添加resume_notice，notice-key为提示什么内容
 * 13.拖拽内容
 *        拖拽内容为resume_drag
 * 14.简历首次保存：
 *        简历首次保存，服务器返回的是resumeId 和visitid的JSOn字符串
 *        并且使用H5的pustState功能改变了浏览器的URL
 *        并且会会把当前保存的简历在右边显示出来
 */


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
};

var fs = require("fs");
var defaultSettings = {
    "topSpace": 1.5,
    "bottomSpace": 1.5,
    "leftSpace": 1.9,
    "rightSpace": 1.9,
    "lineSize": 1,
    "imgWidth": 3.0,
    "imgGap": 0.1

};

// 初始化信息
$(function () {
    /**
     * 设置语种
     */
    function setLanguage(lang) {
        if ($(".resume_language[value=" + lang + "]").length > 0) {
            $(".resume_language[value=" + lang + "]").prop("checked", true);
        }
        if ($("#hidden_data_resume_language").length > 0) {
            $("#hidden_data_resume_language").val(lang);
        }
        i18n();
    }

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
        if (scrollt > 200)
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
     * 自动保存--两分钟自动保存一次
     */
    // setInterval(function () {
    //     if (save_trigger != undefined && save_trigger) {
    //         console.log("没有修改---不需要保存");
    //     } else {
    //         console.log("有修改---需要保存")
    //         resumeSave(false);
    //     }
    // }, 30 * 1000);

    /**
     * 线条拉升
     */
    var pullLine = null;

    function resumeLinePull() {
        $(".resume_line").live("mousedown", function () {
            var $this = $(this);
            pullLine = new Object();
            pullLine.x = window.event.clientX;
            pullLine.y = window.event.clientY;
            pullLine.width = parseInt($this.css("width"));
            pullLine.line = $this;
        });

        $(document).mouseup(function () {
            if (pullLine)
                pullLine = null;
        });

        $(document).mousemove(function (e) {
            resumeLineDraw(pullLine, window.event.clientX, window.event.clientY);
            if (dragObject)
                return false;
        });
    }

    /**
     * 重写线条
     */
    function resumeLineDraw(pullLine, x, y) {
        if (pullLine) {
            var line = pullLine.line;
            var ox = pullLine.x;
            var width = pullLine.width;
            line.css("width", (x - ox + width) + "px");
        }
    }

    /**
     * 线条工具
     */
    var nowLine = null;

    function resumeLine() {
        $("#line_width").change(function () {
            var width = $(this).val();
            if (nowLine) {
                nowLine.css({"width": width + "px"});
            } else {
                notice("请点击线条后再修改！");
            }
        });
        $(".line_style").click(function () {
            var style = $(this).attr("data-style");
            if (nowLine) {
                nowLine.css({"border-top-style": style});
            } else {
                notice("请点击线条后再修改！");
            }
        });
        $(".line_width").click(function () {
            var width = $(this).attr("data-width");
            if (nowLine) {
                nowLine.css({"border-top-width": width + "px"});
            } else {
                notice("请点击线条后再修改！");
            }
        });
        $(".resume_line").live("click", function () {
            showModule("line");
            removeFocus();
            nowLine = $(this);
            nowLine.addClass("resume_focus");
            addFocusStyle(nowLine.css("width"), nowLine.css("border-top-width"), nowLine.css("border-top-color"));
            $("#line_width").val(parseInt(nowLine.css("width")));
        });
    }


    /**
     * 离开时间
     * save_status:true:保存
     * save_status:false:编辑后未保存
     */
    var save_trigger = true; // 状态
    function saveNotice(save_status) {
        if (save_status == undefined)
            save_status = false;
        if (save_trigger != save_status) {
            save_trigger = save_status;
            if (save_status)
                $(window).unbind("beforeunload", not_save_notice);
            else
                $(window).bind("beforeunload", not_save_notice);
        }
    }

// 未保存设置
    function not_save_notice(event) {
        return "你有修改内容没有保存，确定要离开吗？";
    }

    /**
     * 清除一些\n\r等等
     */
    function clearText(text) {
        if (!text)
            return "";
        text = text.replace(/[\n]/ig, '');
        text = text.replace(/[\r]/ig, '');
        text = text.replace(/[\t]/ig, '');
        return text;
    }

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

    /**
     * 清除空白符
     */
    function clearBlank(text) {
        if (!text)
            return "";
        text = text.replace(/(^\s+)|(\s+$)/ig, '');
        return text;
    }

    $(function () {
        var baseHeight = $(".baseditBar").height();
        if (baseHeight >= 146) {
            $(".mubaninfoBar").css('margin-top', '228px');
        }
    });

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

    //设置刷新页面的快捷键
    hotkeys('ctrl+r', function (event, handler) {
        resumeConfirm("当前修改的内容没有保存,确认要重新加载数据？", function () {
            location.reload();
        }, function () {
        });
    });

    hotkeys('ctrl+shift+r', function (event, handler) {
        location.reload();
    });


    hotkeys('esc', function (event, handler) {
        //隐藏导入文件提示框,隐藏设置界面，隐藏模板列表
        $('#importReport').modal('hide');
        $('#settingsPage').modal('hide');
        $('.changeModal').css('display', 'none');
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
    hotkeys('alt+e', function (event, handler) {
        var evt = document.createEvent("HTMLEvents");
        evt.initEvent("change", false, true);
        chooser.dispatchEvent(evt);
    });

    //导入文件
    var chooser = document.querySelector('#xmlFile');
    chooser.addEventListener("change", function (evt) {
        // 检查文件是否选择:
        var filePath = this.value.toString();
        console.log(filePath);
        //开发过程中做测试用,按下alt+r载入xml文件
        if (!filePath) {
            filePath = '/home/lxhao/code/nw/KaiLiReport/report/report.xml';
        }
        $(".div_upload").find("p").text(filePath);
        readFileByPath(filePath);
    });

    function readFileByPath(filePath) {
        var fileType = filePath.substring(filePath.lastIndexOf(".") + 1);
        var basePath = filePath.substring(0, filePath.lastIndexOf("/") + 1);
        if (fileType.toLocaleLowerCase() != "xml") {
            layer.msg("只支持xml文件格式！");
            return;
        }

        fs.readFile(filePath, function (err, data) {
            if (err) {
                layer.msg("读取文件失败! :" + err.message);
                return;
            }
            //隐藏导入文件提示框
            $('#importReport').modal('hide');
            updateContent(basePath, data);
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
        var templateNode = document.body.getElementsByClassName("template");
        templateNode = templateNode[0];
        for (var i = 0; i < nodesCount; i++) {
            var xmlNode = reportContent.children[i];
            console.log(xmlNode.tagName + "的属性:");
            /**
             * 判断当前文档是否有加载当前节点, 有加载则使用直接替换innerHTML
             * 没有加载则添加当前节点
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
                    $(tags[temp]).after(cloneNode);
                    cloneNode.style.display = "inline-block";
                    tags[temp].style.display = "inline-block";
                    updateNode(cloneNode, xmlNode, basePath);
                }
                console.log(temp);
            } else {
                //模板文件不存在匹配的节点
                var cloneNode = templateNode.cloneNode(true);
                $(cloneNode).addClass(xmlNode.tagName);
                $(priorNode).after(cloneNode);
                updateNode(cloneNode, xmlNode, basePath);
            }
        }
        //自动匹配图片宽度
        if (true) {
            autoFitImgsWidth();
        }
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
        } else {
            //替换成html的换行符
            textContent = textContent.replace(/#0d/g, "<br/>");
            textContent = textContent.replace(/&/g, "");
            $(toTag).children(".value").html(textContent);
        }

        //根据用户选择加载xml文件中设置的属性
        var importAttrs = $("#importAttrs").eq(0).attr('checked') == 'checked';
        if (importAttrs) {
            var attrs = xmlTag.attributes;
            var len = attrs.length;
            for (var j = 0; j < len; j++) {
                console.log(attrs[j].name + ":" + attrs[j].value);
                if (attrs[j].name == 'name') {
                    //class为name的子节点存在与不存在分别处理
                    if (toTag.getElementsByClassName("name").length > 0) {
                        $(toTag).children(".name").html(attrs[j].value + "：");
                    }
                } else {
                    $(toTag).children(".value").css(attrs[j].name, attrs[j].value);
                }
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

    function resumeModal() {
        //更换模板
        $(".changeModalBtn").click(function () {
//			layer.msg("正在研发中  敬请期待");
            $(".changeModal").stop().fadeIn(300);
            var display = $('.changeModal').css('display');
            if (display == 'none') {
                $("html").css('overflow', 'auto');
            } else {
                $("html").css('overflow', 'hidden');
            }
            $(".gotopShow").removeAttr("style");
        });

        //更换模板
        $(".uResumeBtn").click(function () {
            $(".changeModal").stop().fadeIn(300);
            var display = $('.changeModal').css('display');
            if (display == 'none') {
                $("html").css('overflow', 'auto');
            } else {
                $("html").css('overflow', 'hidden');
            }
            $(".gotopShow").removeAttr("style");
        });
        $("#changecloseBtn").click(function () {
            $(".changeModal").stop().fadeOut(300);
            var display = $('.changeModal').css('display');
            if (display == 'none') {
                $("html").css('overflow', 'hidden');
            } else {
                $("html").css('overflow', 'auto');
            }
            $("#templateKeyword").val("");
            select_template_page = 1;
            reload_template_list();
            //$(".gotopShow").show();
        });

    }

    resumeModal();
    //模块添加隐藏
    function resumeSlide() {
        $(".iResumeBtn").click(function () {
            $(".insertModal").animate({left: "0px"}, 300);
            $(".resumebg1").css('background', 'transparent');
            $(".resumebg1").stop().show();
            $(".resumebg1").click(function () {
                $(".insertModal").animate({left: "-300px"}, 300);
                $(this).stop().hide();
            });
        });
        $(".uResumeBtn").click(function () {
            $(".rsuemeModal").animate({left: "0px"}, 300);
            $(".resumebg1").css('background', 'transparent');
            $(".resumebg1").stop().show();
            $(".resumebg1").click(function () {
                $(".rsuemeModal").animate({left: "-300px"}, 300);
                $(this).stop().hide();
            });
        });
    }

    resumeSlide();
    function mbList() {
        //列表鼠标经过效果
        $(".zx-mblist-box .list-con").each(function () {
            $(this).on('mouseenter', function (e) {
                var e = e || window.event;
                var angle = direct(e, this)
                mouseEvent(angle, this, 'in')
            })
            $(this).on('mouseleave', function (e) {
                var e = e || window.event;
                var angle = direct(e, this)
                mouseEvent(angle, this, 'off')
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

    mbList();
    //选择模板弹窗
    var select_template_page = 1;
    //搜索
    $("#templateSeach").click(function () {
        select_template_page = 1;
        reload_template_list();
    });
    $("#templateKeyword").keyup(function () {
        if (event.keyCode == 13) {
            // 回车键事件
            select_template_page = 1;
            reload_template_list();
        }
    });
    //排序
    $(".templateSort a").click(function () {
        if ($(this).hasClass("current")) {
            return;
        } else {
            var $sortList = $(".templateSort a");
            $sortList.removeClass("current");
            $(this).toggleClass("current");
            select_template_page = 1;
            reload_template_list();
        }
    });
    //简历模板点击事件
    $(".changeModal .zx-tag a").click(function () {
        $("#templateKeyword").val("");
        select_template_page = 1;
        reload_template_list();
    });
    function reload_template_list() {
        $("#loadingBtn").addClass("loadingBtn");
        var data_sort = $(".templateSort a.current").attr("data_sort");
        var keyword = $("#templateKeyword").val();
        var current_resume_type = $("#current_resume_type").val();
        //console.log(page);
        $("#without_tips").hide();
        $("#loadingBtn").show();
        if (select_template_page == 1) {
            $("#data_template_list").load("/editresume/select_template/", {
                "type": current_resume_type,
                "pageNum": select_template_page,
                "sort": data_sort,
                "keyword": keyword
            }, function () {
                var $li = $("#data_template_list").find("li");
                if ($li == null || $li.length == 0) {
                    $("#without_tips").show();
                    $("#loadingBtn").hide();
                } else if ($li.length < 15) {
                    $("#loadingBtn").hide();
                }
                $("#loadingBtn").removeClass("loadingBtn");
                mbList();
            });
        } else {
            $.get("/editresume/select_template/", {
                "type": current_resume_type,
                "pageNumber": select_template_page,
                "sort": data_sort,
                "keyword": keyword
            }, function (result) {
                if (result != null && result != "") {
                    $("#data_template_list li:last").after(result);
                    $("#loadingBtn").removeClass("loadingBtn");
                    mbList();
                } else {
                    $("#loadingBtn").hide();
                }
            });
        }
    };

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
        var bottomSpace = $("#bottomSpace").get(0).value + "cm";
        var leftSpace = $("#leftSpace").get(0).value + "cm";
        var rightSpace = $("#rightSpace").get(0).value + "cm";

        //页边距
        var editerDocument = window.editor.edit.iframe.get().contentWindow.document;
        var editorBody = $(editerDocument.body);
        editorBody.css("padding-left", leftSpace);
        editorBody.css("padding-right", rightSpace);
        editorBody.css("padding-top", topSpace);
        editorBody.css("padding-bottom", bottomSpace);

        //分隔线厚度
        var lineSize = $("#lineSize").get(0).value + "pt";
        var lineNodes = $(editerDocument.body).find(".line");
        lineNodes.each(function () {
            this.size = lineSize;
            console.log(this.size);
        });

        //图片间距, 宽度
        var imgWidth = $("#imgWidth").get(0).value + "cm";
        var imgGap = $("#imgGap").get(0).value + "cm";
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

    $(".saveBtn").click(function () {
        //当前html文件是否是首次保存
        if (true) {
            $("#saveHtmlFile").click();
            editor.sync();
            var chooser = document.querySelector('#saveHtmlFile');
            chooser.addEventListener("change", function (evt) {
                var filePath = this.value.toString();
                fs.writeFile(filePath, editor.fullHtml(), function (err) {
                    if (err) {
                        alert("保存失败!");
                    }
                });
            });
        }
    });

    KindEditor.ready(function () {
        //页边距
        var editerDocument = window.editor.edit.iframe.get().contentWindow.document;
        var editorBody = $(editerDocument.body);
        editorBody.css("padding-left", defaultSettings.leftSpace + "cm");
        editorBody.css("padding-right", defaultSettings.rightSpace + "cm");
        editorBody.css("padding-top", defaultSettings.topSpace + "cm");
        editorBody.css("padding-bottom", defaultSettings.bottomSpace + "cm");
    });
});
