$(document).ready(function() {
    // helper methods
    var cap = function cap(s) {
        return s.charAt(0).toUpperCase() + s.slice(1);
    }
    var pad = function pad(i) {
        return i < 10 ? "0" + i : i.toString();
    };
    var manif = chrome.runtime.getManifest();
    // show current time in navbar
    var tick = function tick() {
        var now = new Date();
        $("#time").text(pad(now.getHours()) + ":" + pad(now.getMinutes()) + ":" + pad(now.getSeconds()));
    }
    tick();
    setInterval(tick, 1000);
    // default settings
    var settings = {
        "links": {
            "edit": {
                "menu": true,
                "dragdrop": true
            },
            "content": [
                {
                    "title": "Chrome",
                    "buttons": [
                        {
                            "title": "Web Store",
                            "url": "https://chrome.google.com/webstore",
                            "style": "primary"
                        },
                        {
                            "title": "Settings",
                            "menu": [
                                {
                                    "title": "Settings",
                                    "url": "chrome://settings"
                                },
                                {
                                    "title": "Extensions",
                                    "url": "chrome://extensions"
                                },
                                {
                                    "title": "Flags",
                                    "url": "chrome://flags"
                                }
                            ],
                            "style": "light"
                        },
                        {
                            "title": "Content",
                            "menu": [
                                {
                                    "title": "Apps",
                                    "url": "chrome://apps"
                                },
                                {
                                    "title": "Bookmarks",
                                    "url": "chrome://bookmarks"
                                },
                                {
                                    "title": "Downloads",
                                    "url": "chrome://downloads"
                                },
                                {
                                    "title": "History",
                                    "url": "chrome://history"
                                }
                            ],
                            "style": "default"
                        }
                    ]
                },
                {
                    "title": "Storage",
                    "buttons": [
                        {
                            "title": "Dropbox",
                            "url": "https://www.dropbox.com",
                            "style": "info"
                        },
                        {
                            "title": "Google Drive",
                            "url": "https://drive.google.com",
                            "style": "warning"
                        },
                        {
                            "title": "OneDrive",
                            "url": "https://onedrive.live.com",
                            "style": "primary"
                        }
                    ]
                },
                {
                    "title": "Social",
                    "buttons": [
                        {
                            "title": "Facebook",
                            "url": "https://www.facebook.com",
                            "style": "primary"
                        },
                        {
                            "title": "Twitter",
                            "menu": [
                                {
                                    "title": "Twitter",
                                    "url": "https://twitter.com"
                                },
                                {
                                    "title": "TweetDeck",
                                    "url": "https://tweetdeck.twitter.com"
                                }
                            ],
                            "style": "info"
                        },
                        {
                            "title": "Google+",
                            "url": "https://plus.google.com",
                            "style": "danger"
                        }
                    ]
                },
                {
                    "title": "Tips",
                    "buttons": [
                        {
                            "title": "Lifehacker",
                            "url": "http://lifehacker.com",
                            "style": "success"
                        },
                        {
                            "title": "AddictiveTips",
                            "url": "http://www.addictivetips.com",
                            "style": "primary"
                        },
                        {
                            "title": "How-To Geek",
                            "url": "http://www.howtogeek.com",
                            "style": "dark"
                        }
                    ]
                }
            ]
        },
        "bookmarks": {
            "bookmarklets": true
        },
        "history": {
            "limit": 10
        },
        "general": {
            "title": manif.name,
            "font": "Segoe UI",
            "topbar": false,
            "background": {
                "image": "../img/bg.png",
                "repeat": true,
                "centre": true,
                "fixed": false,
                "stretch": false
            },
            "customcss": {
                "enable": false,
                "content": ""
            }
        }
    };
    // attempt to parse settings from storage
    var next;
    var firstRun = true;
    for (var key in settings) {
        next = key;
        if (localStorage[key]) {
            try {
                $.extend(settings[key], JSON.parse(localStorage[key]));
                firstRun = false;
            } catch (e) {
                $("#alerts").append($("<div/>").addClass("alert alert-danger").text("Unable to parse the " + next + " configuration!  Go to Settings to fix it."));
            }
        }
    }
    // apply custom styles
    document.title = settings.general["title"];
    var css = [];
    if (settings.general["font"]) {
        css.push("* {\n"
               + "    font-family: '" + settings.general["font"] + "';\n"
               + "}");
    }
    if (settings.general["topbar"]) {
        $("nav").addClass("navbar-fixed-top");
        $("body").css("padding-top", "80px");
        css.push("body {\n"
               + "    padding-top: 80px;\n"
               + "}");
    }
    if (settings.general["background"].image) {
        css.push("html {\n"
               + "    background-image: url(" + settings.general["background"].image + ");\n"
               + "    background-repeat: " + (settings.general["background"].repeat ? "" : "no-") + "repeat;\n"
               + "    background-position: " + (settings.general["background"].centre ? "center" : "initial") + ";\n"
               + "    background-attachment: " + (settings.general["background"].fixed ? "fixed" : "initial") + ";\n"
               + "    background-size: " + (settings.general["background"].stretch ? "cover" : "auto") + ";\n"
               + "}");
    }
    if (css.length) {
        $(document.head).append($("<style/>").html(css.join("\n")));
    }
    if (settings.general["customcss"].enable) {
        $(document.head).append($("<style/>").html(settings.general["customcss"].content));
    }
    /*
    Links: customizable grid of links and menus
    */
    // special link handling
    var fixLinkHandling = function fixLinkHandling() {
        // monitor Ctrl key to open links in a new tab
        var ctrlDown = false;
        $(window).keydown(function(e) {
            if (e.keyCode === 17) ctrlDown = true;
        }).keyup(function(e) {
            if (e.keyCode === 17) ctrlDown = false;
        });
        // open Chrome links via Tabs API
        $(".link-chrome").click(function(e) {
            // normal click, not external
            if (e.which === 1 && !ctrlDown && !$(this).hasClass("link-external")) {
                chrome.tabs.update({url: this.href});
                e.preventDefault();
            // middle click, Ctrl+click, or set as external
            } else if (e.which <= 2) {
                chrome.tabs.create({url: this.href, active: $(this).hasClass("link-external")});
                e.preventDefault();
            }
        });
        // always open external links in a new tab
        $(".link-external").click(function(e) {
            if (!$(this).hasClass("link-chrome")) {
                chrome.tabs.create({url: this.href, active: true});
                e.preventDefault();
            }
        });
    };
    var populateLinks = function populateLinks() {
        $("#alerts, #links").empty();
        // loop through blocks
        $(settings.links["content"]).each(function(i, linkBlk) {
            if (!linkBlk.title) linkBlk.title = "";
            if (!linkBlk.buttons) linkBlk.buttons = [];
            var blk = $("<div/>").addClass("panel panel-default sortable").data("pos", i);
            var head = $("<div/>").addClass("panel-heading").text(linkBlk.title);
            if (!linkBlk.title) head.html("&nbsp;");
            // edit controls dropdown on header
            if (settings.links["edit"].menu) {
                var editRoot = $("<div/>").addClass("btn-group pull-right");
                var editBtn = $("<button/>").addClass("btn btn-xs btn-default dropdown-toggle").attr("data-toggle", "dropdown").append($("<span/>").addClass("caret")).hide();
                editRoot.append(editBtn);
                var editMenu = $("<ul/>").addClass("dropdown-menu");
                if (i > 0) {
                    editMenu.append($("<li/>").append($("<a/>").text("Move to start").click(function(e) {
                        for (var x = i; x > 0; x--) {
                            settings.links["content"][x] = settings.links["content"][x - 1];
                        }
                        settings.links["content"][0] = linkBlk;
                        localStorage["links"] = JSON.stringify(settings.links);
                        populateLinks();
                    })));
                    editMenu.append($("<li/>").append($("<a/>").text("Move left").click(function(e) {
                        settings.links["content"][i] = settings.links["content"][i - 1];
                        settings.links["content"][i - 1] = linkBlk;
                        localStorage["links"] = JSON.stringify(settings.links);
                        populateLinks();
                    })));
                }
                var max = settings.links["content"].length - 1;
                if (i < max) {
                    editMenu.append($("<li/>").append($("<a/>").text("Move right").click(function(e) {
                        settings.links["content"][i] = settings.links["content"][i + 1];
                        settings.links["content"][i + 1] = linkBlk;
                        localStorage["links"] = JSON.stringify(settings.links);
                        populateLinks();
                    })));
                    editMenu.append($("<li/>").append($("<a/>").text("Move to end").click(function(e) {
                        for (var x = i; x < max; x++) {
                            settings.links["content"][x] = settings.links["content"][x + 1];
                        }
                        settings.links["content"][max] = linkBlk;
                        localStorage["links"] = JSON.stringify(settings.links);
                        populateLinks();
                    })));
                }
                if (i > 0 || i < max) {
                    editMenu.append($("<li/>").addClass("divider"));
                }
                editMenu.append($("<li/>").append($("<a/>").text("New block before").click(function(e) {
                    settings.links["content"].splice(i, 0, {
                        title: "",
                        buttons: []
                    });
                    localStorage["links"] = JSON.stringify(settings.links);
                    populateLinks();
                    $("#links-editor").data("block", i).modal("show");
                })));
                editMenu.append($("<li/>").append($("<a/>").text("New block after").click(function(e) {
                    settings.links["content"].splice(i + 1, 0, {
                        title: "",
                        buttons: []
                    });
                    localStorage["links"] = JSON.stringify(settings.links);
                    populateLinks();
                    $("#links-editor").data("block", i + 1).modal("show");
                })));
                editMenu.append($("<li/>").addClass("divider"));
                editMenu.append($("<li/>").append($("<a/>").text("Edit block").click(function(e) {
                    $("#links-editor").data("block", i).modal("show");
                })));
                editMenu.append($("<li/>").append($("<a/>").text("Delete block").click(function(e) {
                    if (confirm("Are you sure you want to delete " + (linkBlk.title ? linkBlk.title : "this block") + "?")) {
                        settings.links["content"].splice(i, 1);
                        localStorage["links"] = JSON.stringify(settings.links);
                        populateLinks();
                    }
                })));
                editRoot.append(editMenu);
                head.append(editRoot);
                head.mouseenter(function(e) {
                    editBtn.show();
                }).mouseleave(function(e) {
                    editBtn.hide();
                    if (editRoot.hasClass("open")) {
                        editBtn.dropdown("toggle");
                    }
                });
            }
            blk.append(head);
            var body = $("<div/>").addClass("panel-body");
            // loop through buttons
            for (var j in linkBlk.buttons) {
                var linkBtn = linkBlk.buttons[j];
                if (!linkBtn.title) linkBtn.title = "";
                if (!linkBtn.style) linkBtn.style = "default";
                var btn;
                if (linkBtn.url) {
                    btn = $("<a/>").addClass("btn btn-block btn-" + linkBtn.style).attr("href", linkBtn.url).text(linkBtn.title);
                    // workaround for accessing Chrome URLs
                    if (linkBtn.url.substring(0, "chrome://".length) === "chrome://") btn.addClass("link-chrome");
                    // always open in new tab
                    if (linkBtn.external) btn.addClass("link-external");
                }
                if (linkBtn.menu) {
                    btn = $("<div/>").addClass("btn-group btn-block");
                    btn.append($("<button/>").addClass("btn btn-block btn-" + linkBtn.style + " dropdown-toggle").attr("data-toggle", "dropdown")
                                             .text(linkBtn.title + " ").append($("<span/>").addClass("caret")));
                    var menu = $("<ul/>").addClass("dropdown-menu");
                    // loop through menu items
                    for (var k in linkBtn.menu) {
                        var linkItem = linkBtn.menu[k];
                        if (typeof(linkItem) === "string") {
                            if (k > 0) menu.append($("<li/>").addClass("divider"));
                            if (linkItem) menu.append($("<li/>").addClass("dropdown-header").text(linkItem));
                        } else {
                            if (!linkItem.title) linkItem.title = "";
                            var item = $("<a/>").attr("href", linkItem.url).text(linkItem.title);
                            // workaround for accessing Chrome URLs
                            if (linkItem.url.substring(0, "chrome://".length) === "chrome://") item.addClass("link-chrome");
                            // always open in new tab
                            if (linkItem.external) item.addClass("link-external");
                            menu.append($("<li/>").append(item));
                        }
                    }
                    btn.append(menu);
                }
                body.append(btn);
            }
            blk.append(body);
            $("#links").append($("<div/>").addClass("col-lg-2 col-md-3 col-sm-4 col-xs-6").append(blk));
        });
        // drag block headings to reorder
        if (settings.links["edit"].dragdrop) {
            $("#links").sortable({handle: ".panel-heading"}).on("sortupdate", function(e) {
                var old = settings.links["content"];
                settings.links["content"] = [];
                $(".panel", this).each(function(i, blk) {
                    settings.links["content"].push(old[$(blk).data("pos")]);
                });
                localStorage["links"] = JSON.stringify(settings.links);
                populateLinks();
            });
        }
        fixLinkHandling();
    }
    populateLinks();
    // generate editor modal
    $("#links-editor").on("show.bs.modal", function(e) {
        var i = $(this).data("block");
        // working copy
        var linkBlk = $.extend(true, {}, settings.links["content"][i]);
        $("#links-editor-title").val(linkBlk.title);
        var populateLinkEditor = function populateLinkEditor(noscroll) {
            // remember scroll position
            var pos = noscroll ? 0 : document.body.scrollTop;
            $("#links-editor-body").empty();
            if (!linkBlk.buttons.length) {
                $("#links-editor-body").append($("<div/>").addClass("alert alert-info").text("No buttons added yet."));
            }
            // loop through buttons in block
            $(linkBlk.buttons).each(function(j, linkBtn) {
                var blk = $("<div/>").addClass("well well-sm");
                var group = $("<div/>").addClass("input-group form-control-pad-bottom");
                // left menu
                var btnRootLeft = $("<span/>").addClass("input-group-btn");
                var optsBtn = $("<button/>").addClass("btn btn-default dropdown-toggle").attr("data-toggle", "dropdown").append($("<span/>").addClass("caret"));
                btnRootLeft.append(optsBtn);
                var optsMenu = $("<ul/>").addClass("dropdown-menu");
                if (j > 0) {
                    optsMenu.append($("<li/>").append($("<a/>").text("Move to top").click(function(e) {
                        for (var x = j; x > 0; x--) {
                            linkBlk.buttons[x] = linkBlk.buttons[x - 1];
                        }
                        linkBlk.buttons[0] = linkBtn;
                        populateLinkEditor();
                    })));
                    optsMenu.append($("<li/>").append($("<a/>").text("Move up").click(function(e) {
                        linkBlk.buttons[j] = linkBlk.buttons[j - 1];
                        linkBlk.buttons[j - 1] = linkBtn;
                        populateLinkEditor();
                    })));
                }
                var max = linkBlk.buttons.length - 1;
                if (j < max) {
                    optsMenu.append($("<li/>").append($("<a/>").text("Move down").click(function(e) {
                        linkBlk.buttons[j] = linkBlk.buttons[j + 1];
                        linkBlk.buttons[j + 1] = linkBtn;
                        populateLinkEditor();
                    })));
                    optsMenu.append($("<li/>").append($("<a/>").text("Move to bottom").click(function(e) {
                        for (var x = j; x < max; x++) {
                            linkBlk.buttons[x] = linkBlk.buttons[x + 1];
                        }
                        linkBlk.buttons[max] = linkBtn;
                        populateLinkEditor();
                    })));
                }
                if (j > 0 || j < max) {
                    optsMenu.append($("<li/>").addClass("divider"));
                }
                optsMenu.append($("<li/>").append($("<a/>").text("Delete button").click(function(e) {
                    if (confirm("Are you sure you want to delete " + (linkBtn.title ? linkBtn.title : "this button") + "?")) {
                        linkBlk.buttons.splice(j, 1);
                        populateLinkEditor();
                    }
                })));
                btnRootLeft.append(optsMenu);
                group.append(btnRootLeft);
                group.append($("<input>").attr("type", "text").addClass("form-control").attr("placeholder", "Button label").val(linkBtn.title).change(function(e) {
                    linkBtn.title = $(this).val();
                }));
                // right menus
                var btnRootRight = $("<span/>").addClass("input-group-btn");
                if (!linkBtn.style) {
                    linkBtn.style = "default";
                }
                var stylesBtn = $("<button/>").addClass("btn btn-" + linkBtn.style + " dropdown-toggle").attr("data-toggle", "dropdown").text(cap(linkBtn.style));
                btnRootRight.append(stylesBtn);
                var stylesMenu = $("<ul/>").addClass("dropdown-menu pull-right");
                var styles = ["default", "light", "dark", "primary", "info", "success", "warning", "danger"];
                $(styles).each(function(k, style) {
                    stylesMenu.append($("<li/>").append($("<a/>").text(cap(style)).click(function(e) {
                        // remote all button style classes
                        stylesBtn.removeClass(function(l, css) {
                            return (css.match(/\bbtn-\S+/g) || []).join(" ");
                        }).addClass("btn btn-" + styles[k]).text(cap(style));
                    })));
                });
                btnRootRight.append(stylesMenu);
                group.append(btnRootRight);
                blk.append(group);
                // link/menu options
                if (linkBtn.menu) {
                    var tbody = $("<tbody/>");
                    $(linkBtn.menu).each(function(k, linkItem) {
                        var tr = $("<tr/>");
                        var menuOptsRoot = $("<div/>").addClass("btn-group btn-block");
                        menuOptsRoot.append($("<button/>").addClass("btn btn-block btn-default dropdown-toggle").attr("data-toggle", "dropdown").append($("<span/>").addClass("caret")));
                        var menuOptsMenu = $("<ul/>").addClass("dropdown-menu");
                        if (k > 0) {
                            menuOptsMenu.append($("<li/>").append($("<a/>").text("Move to top").click(function(e) {
                                for (var x = k; x > 0; x--) {
                                    linkBtn.menu[x] = linkBtn.menu[x - 1];
                                }
                                linkBtn.menu[0] = linkItem;
                                populateLinkEditor();
                            })));
                            menuOptsMenu.append($("<li/>").append($("<a/>").text("Move up").click(function(e) {
                                linkBtn.menu[k] = linkBtn.menu[k - 1];
                                linkBtn.menu[k - 1] = linkItem;
                                populateLinkEditor();
                            })));
                        }
                        var max = linkBtn.menu.length - 1;
                        if (k < max) {
                            menuOptsMenu.append($("<li/>").append($("<a/>").text("Move down").click(function(e) {
                                linkBtn.menu[k] = linkBtn.menu[k + 1];
                                linkBtn.menu[k + 1] = linkItem;
                                populateLinkEditor();
                            })));
                            menuOptsMenu.append($("<li/>").append($("<a/>").text("Move to bottom").click(function(e) {
                                for (var x = k; x < max; x++) {
                                    linkBtn.menu[x] = linkBtn.menu[x + 1];
                                }
                                linkBtn.menu[max] = linkItem;
                                populateLinkEditor();
                            })));
                        }
                        if (k > 0 || k < max) {
                            menuOptsMenu.append($("<li/>").addClass("divider"));
                        }
                        menuOptsMenu.append($("<li/>").append($("<a/>").text("Delete item").click(function(e) {
                            linkBtn.menu.splice(k, 1);
                            populateLinkEditor();
                        })));
                        menuOptsRoot.append(menuOptsMenu);
                        tr.append($("<td/>").append(menuOptsRoot));
                        if (typeof(linkItem) === "string") {
                            var title = $("<input>").attr("type", "text").addClass("form-control").attr("placeholder", "Section header (leave blank for none)").val(linkItem).change(function(e) {
                                linkBtn.menu[k] = $(this).val();
                            });
                            tr.append($("<td/>").attr("colspan", 3).append(title));
                        } else {
                            var title = $("<input>").attr("type", "text").addClass("form-control").attr("placeholder", "Label").val(linkItem.title).change(function(e) {
                                linkItem.title = $(this).val();
                            });
                            tr.append($("<td/>").append(title));
                            var url = $("<input>").attr("type", "text").addClass("form-control").attr("placeholder", "URL").val(linkItem.url).change(function(e) {
                                linkItem.url = $(this).val();
                            });
                            tr.append($("<td/>").append(url));
                            var external = $("<input>").attr("type", "checkbox").prop("checked", linkItem.external).change(function(e) {
                                linkItem.external = $(this).prop("checked");
                            });
                            tr.append($("<td/>").append($("<label/>").addClass("checkbox-inline")
                                                                     .append(external)
                                                                     .append($("<span/>").text("External"))));
                        }
                        tbody.append(tr);
                    });
                    blk.append($("<table/>").addClass("table table-bordered table-condensed").append(tbody));
                    var menuBtnsRoot = $("<div/>").addClass("btn-group");
                    menuBtnsRoot.append($("<button/>").addClass("btn btn-default").text("Add link").click(function(e) {
                        linkBtn.menu.push({
                            title: "",
                            url: ""
                        });
                        populateLinkEditor();
                    }));
                    menuBtnsRoot.append($("<button/>").addClass("btn btn-default").text("Add section").click(function(e) {
                        linkBtn.menu.push("");
                        populateLinkEditor();
                    }));
                    blk.append(menuBtnsRoot);
                } else {
                    blk.append($("<input>").attr("type", "text").addClass("form-control").attr("placeholder", "Link URL").val(linkBtn.url).change(function(e) {
                        linkBtn.url = $(this).val();
                    }));
                    var check = $("<label/>").addClass("checkbox-inline");
                    check.append($("<input>").attr("type", "checkbox").prop("checked", linkBtn.external).change(function(e) {
                        linkBtn.external = $(this).val();
                    }));
                    check.append($("<span/>").text("External (open link in new tab)"));
                    blk.append(check);
                }
                $("#links-editor-body").append(blk);
            });
            // reset scroll position
            window.scrollTo(0, pos);
        };
        // add buttons to block
        $("#links-editor-add-link").click(function(e) {
            linkBlk.buttons.push({
                title: "",
                url: "",
                style: "default"
            });
            populateLinkEditor();
        })
        $("#links-editor-add-menu").click(function(e) {
            linkBlk.buttons.push({
                title: "",
                menu: [],
                style: "default"
            });
            populateLinkEditor();
        })
        // save block
        $("#links-editor-save").click(function(e) {
            linkBlk.title = $("#links-editor-title").val();
            settings.links["content"][i] = linkBlk;
            localStorage["links"] = JSON.stringify(settings.links);
            populateLinks();
            $("#links-editor").modal("hide");
        })
        // delete block
        $("#links-editor-delete").click(function(e) {
            if (confirm("Are you sure you want to delete " + (linkBlk.title ? linkBlk.title : "this block") + "?")) {
                settings.links["content"].splice(i, 1);
                localStorage["links"] = JSON.stringify(settings.links);
                populateLinks();
                $("#links-editor").modal("hide");
            }
        })
        populateLinkEditor(true);
    }).on("hide.bs.modal", function(e) {
        $("#links-editor-add-link, #links-editor-add-menu, #links-editor-save, #links-editor-delete").off("click");
    });
    if (firstRun) {
        var alert = $("<div/>").addClass("alert alert-success alert-dismissable");
        alert.append($("<button/>").addClass("close").attr("data-dismiss", "alert").html("&times;").click(function(e) {
            // write to local storage
            for (var key in settings) {
                localStorage[key] = JSON.stringify(settings[key]);
            }
        }));
        alert.append("<span><strong>Welcome to " + manif.name + "!</strong>  To get you started, here are a few sample blocks for your new New Tab page.  Feel free to change or add to them by hovering over the block headings for controls.  Head into Settings for more advanced options.</span>");
        $("#alerts").append(alert);
    }
    if (!settings.links["content"].length) {
        var text = $("<span><strong>You don't have any links added yet!</strong>  Get started by <a>adding a new block</a>.</span>");
        $("a", text).click(function(e) {
            settings.links["content"].push({
                title: "",
                buttons: []
            });
            localStorage["links"] = JSON.stringify(settings.links);
            populateLinks();
            $("#links-editor").data("block", settings.links["content"].length - 1).modal("show");
        })
        $("#alerts").append($("<div/>").addClass("alert alert-info").append(text));
    }
    // switch to links page
    $("#menu-links").click(function(e) {
        $(".navbar-right li").removeClass("active");
        $(this).addClass("active");
        $(".main").hide();
        $("#links").show();
    });
    /*
    Bookmarks: lightweight bookmark browser
    */
    // switch to bookmarks page
    $("#menu-bookmarks").click(function(e) {
        $(".navbar-right li").removeClass("active");
        $(this).addClass("active");
        $(".main").hide();
        $("#bookmarks").show();
    });
    // request tree from Bookmarks API
    chrome.bookmarks.getTree(function bookmarksCallback(tree) {
        tree[0].title = "Bookmarks";
        var route = [];
        var populateBookmarks = function populateBookmarks(root) {
            // clear current list
            $("#bookmarks-block, #bookmarks-title").empty();
            // loop through folder children
            $(root.children).each(function(i, el) {
                // bookmark
                if (el.url) {
                    // bookmarklet
                    if (el.url.substring(0, "javascript:".length) === "javascript:") {
                        if (settings.bookmarks["bookmarklets"]) {
                            $("#bookmarks-block").append($("<button/>").addClass("btn btn-info disabled").text(el.title));
                        }
                    } else {
                        var link = $("<a/>").addClass("btn btn-primary").attr("href", el.url).text(el.title);
                        // workaround for accessing Chrome URLs
                        if (el.url.substring(0, "chrome://".length) === "chrome://") link.addClass("link-chrome");
                        $("#bookmarks-block").append(link);
                    }
                // folder
                } else if (el.children) {
                    $("#bookmarks-block").append($("<button/>").addClass("btn btn-warning").text(el.title).click(function(e) {
                        route.push(i);
                        populateBookmarks(el);
                    }));
                }
            });
            // open Chrome links via Tabs API
            $(".link-chrome", "#bookmarks-block").click(function(e) {
                // normal click, not external
                if (e.which === 1 && !ctrlDown && !$(this).hasClass("link-external")) {
                    chrome.tabs.update({url: this.href});
                    e.preventDefault();
                // middle click, Ctrl+click, or set as external
                } else if (e.which <= 2) {
                    chrome.tabs.create({url: this.href, active: $(this).hasClass("link-external")});
                    e.preventDefault();
                }
            });
            // breadcrumb navigation
            $(traverse()).each(function(i, el) {
                if (i > 0) $("#bookmarks-title").append($("<span/>").addClass("caret-right"));
                $("#bookmarks-title").append($("<button/>").addClass("btn btn-sm btn-default").text(el.title).click(function(e) {
                    var count = route.length - i;
                    for (var j = 0; j < count; j++) {
                        route.pop();
                    }
                    var els = traverse();
                    populateBookmarks(els[els.length - 1]);
                }));
            });
        }
        // get list of items as path through bookmarks
        var traverse = function traverse() {
            var els = [tree[0]];
            for (var i in route) {
                els.push(els[els.length - 1].children[route[i]]);
            }
            return els;
        };
        populateBookmarks(tree[0]);
        $("#menu-bookmarks").show();
    });
    /*
    History: quick drop-down of recent pages
    */
    // initialize limit to 10
    if (typeof(settings.history["limit"]) === "undefined") {
        settings.history["limit"] = 10;
    }
    var trim = function trim(str, len) {
        return str.length > len ? str.substring(0, len - 3) + "..." : str;
    }
    if (settings.history["limit"]) {
        // request items from History API
        chrome.history.search({text: "", maxResults: settings.history["limit"]}, function historyCallback(results) {
            // loop through history items
            for (var i in results) {
                var res = results[i];
                // add to dropdown
                $("#hst-list").append($("<li/>").append($("<a/>").attr("href", res.url).text(trim(res.title ? res.title : res.url, 50))));
            }
            $("#hst-title").show();
        });
    }
    /*
    Settings: modal to customize links and options
    */
    // set to current data
    var populateSettings = function populateSettings() {
        $("#settings-links-edit-menu").prop("checked", settings.links["edit"].menu);
        $("#settings-links-edit-dragdrop").prop("checked", settings.links["edit"].dragdrop);
        $("#settings-links-content").val(JSON.stringify(settings.links["content"], undefined, 2));
        $("#settings-bookmarks-bookmarklets").prop("checked", settings.bookmarks["bookmarklets"]);
        $("#settings-history-limit").val(settings.history["limit"]);
        $("#settings-history-limit-value").text(settings.history["limit"]);
        $("#settings-general-title").val(settings.general["title"]);
        $("#settings-general-font").val(settings.general["font"]);
        $("#settings-general-topbar").prop("checked", settings.general["topbar"]);
        $("#settings-general-background-image").data("val", settings.general["background"].image).prop("placeholder", "(unchanged)");
        $("#settings-general-background-repeat").prop("checked", settings.general["background"].repeat);
        $("#settings-general-background-centre").prop("checked", settings.general["background"].centre);
        $("#settings-general-background-fixed").prop("checked", settings.general["background"].fixed);
        $("#settings-general-background-stretch").prop("checked", settings.general["background"].stretch);
        $(".settings-general-background-check").prop("disabled", !settings.general["background"].image)
                                               .next().toggleClass("text-muted", !settings.general["background"].image);
        $("#settings-general-customcss-enable").prop("checked", settings.general["customcss"].enable);
        $("#settings-general-customcss-content").prop("disabled", !settings.general["customcss"].enable).val(settings.general["customcss"].content);
    }
    switch (settings.general["background"].image) {
        case "":
            $("#settings-general-background-image").prop("placeholder", "(none)");
            break;
        case "../img/bg.png":
            $("#settings-general-background-image").prop("placeholder", "(default)");
            break;
    }
    // request list of fonts from FontSettings API
    chrome.fontSettings.getFontList(function fontsCallback(fonts) {
        for (var i in fonts) {
            $("#settings-general-font").append($("<option/>").text(fonts[i].displayName));
        }
        $("#settings-general-font").val(settings.general["font"]);
    });
    $("#settings-about-title").html(manif.name + " <small>" + manif.version + "</small>");
    // reset modal on show
    $("#settings").on("show.bs.modal", function(e) {
        $("#settings-alerts").empty();
        $(".form-group", "#settings-tab-links").removeClass("has-success has-error");
        populateSettings();
        $($("#settings-tabs a")[0]).click();
    });
    // links content editor
    $("#settings-links-content").focus(function(e) {
        $("#settings-alerts").empty();
        $(this).closest(".form-group").removeClass("has-success has-error");
    }).blur(function(e) {
        // validate JSON
        try {
            JSON.parse($(this).val());
            $(this).closest(".form-group").addClass("has-success");
        } catch (e) {
            $(this).closest(".form-group").addClass("has-error");
        }
    });
    $("#settings-history-limit").on("input change", function(e) {
        $("#settings-history-limit-value").text($(this).val());
    });
    // background image selector
    $("#settings-general-background-image").on("input change", function(e) {
        // lose previous value on change
        $(this).data("val", "").prop("placeholder", "(none)");
        $("#settings-general-background-repeat").prop("disabled", !$(this).val()).next().toggleClass("text-muted", !$(this).val());
    });
    $("#settings-general-background-choose").click(function(e) {
        // trigger hidden input field
        $("#settings-alerts").empty();
        $("#settings-general-background-file").click();
    });
    $("#settings-general-background-file").change(function(e) {
        // if a file is selected
        if (this.files.length) {
            var file = this.files.item(0);
            // if an image
            if (file.type.match(/^image\//)) {
                var reader = new FileReader;
                reader.readAsDataURL(file);
                reader.onload = function readerLoaded() {
                   $("#settings-general-background-image").data("val", reader.result).prop("placeholder", file.name).val("");
                   $("#settings-general-background-file").val("");
                };
            } else {
                $("#settings-alerts").append($("<div/>").addClass("alert alert-danger").text(file.name + " doesn't seem to be a valid image file."));
            }
        }
    });
    // clear image
    $("#settings-general-background-none").click(function(e) {
        $("#settings-general-background-image").data("val", "").prop("placeholder", "(none)").val("");
        $(".settings-general-background-check").prop("disabled", true).next().toggleClass("text-muted", true);
    });
    // reset to default stripes
    $("#settings-general-background-default").click(function(e) {
        $("#settings-general-background-image").data("val", "../img/bg.png").prop("placeholder", "(default)").val("");
        $("#settings-general-background-repeat").prop("checked", true);
        $("#settings-general-background-centre").prop("checked", true);
        $("#settings-general-background-fixed").prop("checked", false);
        $("#settings-general-background-stretch").prop("checked", false);
        $(".settings-general-background-check").prop("disabled", false).next().toggleClass("text-muted", false);
    });
    // custom CSS editor
    $("#settings-general-customcss-enable").change(function(e) {
        $("#settings-general-customcss-content").prop("disabled", !$(this).prop("checked")).focus();
    });
    // save and reload
    $("#settings-save").click(function(e) {
        $("#settings-alerts").empty();
        var ok = true;
        try {
            settings.links["content"] = JSON.parse($("#settings-links-content").val());
        } catch (e) {
            ok = false;
            $("#settings-alerts").append($("<div/>").addClass("alert alert-danger").text("The links content isn't valid JSON."));
        }
        settings.links["edit"] = {
            menu: $("#settings-links-edit-menu").prop("checked"),
            dragdrop: $("#settings-links-edit-dragdrop").prop("checked")
        };
        settings.bookmarks["bookmarklets"] = $("#settings-bookmarks-bookmarklets").prop("checked");
        if (!$("#settings-history-limit").val()) $("#settings-history-limit").val("10");
        settings.history["limit"] = parseInt($("#settings-history-limit").val());
        if (!$("#settings-general-title").val()) $("#settings-general-title").val(manif.name);
        settings.general["title"] = $("#settings-general-title").val();
        settings.general["font"] = $("#settings-general-font").val();
        settings.general["topbar"] = $("#settings-general-topbar").prop("checked");
        settings.general["background"] = {
            image: $("#settings-general-background-image").val() ? $("#settings-general-background-image").val() : $("#settings-general-background-image").data("val"),
            repeat: $("#settings-general-background-repeat").prop("checked"),
            centre: $("#settings-general-background-centre").prop("checked"),
            fixed: $("#settings-general-background-fixed").prop("checked"),
            stretch: $("#settings-general-background-stretch").prop("checked")
        };
        settings.general["customcss"] = {
            enable: $("#settings-general-customcss-content").val() && $("#settings-general-customcss-enable").prop("checked"),
            content: $("#settings-general-customcss-content").val()
        };
        if (ok) {
            // write to local storage
            for (var key in settings) {
                localStorage[key] = JSON.stringify(settings[key]);
            }
            // reload
            $("#settings").off("hidden.bs.modal").on("hidden.bs.modal", function(e) {
                location.reload();
            }).modal("hide");
        }
    });
});
