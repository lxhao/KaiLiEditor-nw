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
        //隐藏导入文件提示框
        $('#importReport').modal('hide');
        $('#settingsPage').modal('hide');
    });
});

