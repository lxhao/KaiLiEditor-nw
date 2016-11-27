$(document).ready(function () {
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

        //医院logo的存储路径
        // var path = basePath + 'img/' + nodes[1].getElementsByTagName("LOGO")[0].textContent;
        // var op = window.editor.edit.iframe.get().contentWindow.document.getElementsByClassName("CAP1");
        // var op = window.editor.edit.iframe.get().contentWindow.document.getElementById('fon');
    }


    //判断是否以字符串结尾
    String.prototype.endsWith = function (endStr) {
        var d = this.length - endStr.length;
        return (d >= 0 && this.lastIndexOf(endStr) == d)
    };

    //更新标签
    function updateNode(toTag, xmlTag, basePath) {
        //判断图片和文本
        var imgName = xmlTag.textContent;
        if (imgName.endsWith("jpg") || imgName.endsWith("png")) {
            var imgPath = basePath + "img/" + imgName;
            var img = $(toTag).children(".value");
            console.log(imgPath);
            img.attr("src", "file:" + imgPath);
        } else {
            $(toTag).children(".value").html(imgName);
        }

        //根据用户选择加载xml文件中设置的属性
        if (true) {
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
        $(".saveBtn").click(function () {
            //当前html文件是否是首次保存
            if (true) {
                $("#saveHtmlFile").click();
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
});
