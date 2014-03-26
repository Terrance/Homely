$(document).ready(function() {
    var manif = chrome.runtime.getManifest();
    // default settings
    var settings = {
        "links": {
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
                "repeat": true
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
                $("nav").after($("<div/>").addClass("alert alert-danger").text("Unable to parse the " + next + " configuration!  Go to Settings to fix it."));
            }
        }
    }
    if (firstRun) {
        var alert = $("<div/>").addClass("alert alert-success alert-dismissable");
        alert.append($("<button/>").addClass("close").attr("data-dismiss", "alert").html("&times;"));
        alert.append("<span><strong>Welcome to " + manif.name + "!</strong>  To get you started, here are a few sample blocks for your new New Tab page.  Feel free to head into the Settings to change them.</span>")
        $("nav").after(alert);
        // write to local storage
        for (var key in settings) {
            localStorage[key] = JSON.stringify(settings[key]);
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
               + "    background-repeat: " + (settings.general["background"].repeat ? "" : "no-") + "-repeat;\n"
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
    if (!settings.links["content"].length) {
        $("nav").after($("<div/>").addClass("alert alert-info").text("You don't have any links added yet!  Go to Settings to get started."));
    }
    var warn = false;
    // loop through blocks
    for (var i in settings.links["content"]) {
        var linkBlk = settings.links["content"][i];
        if (!linkBlk.title) {
            linkBlk.title = "";
            warn = true;
        };
        if (!linkBlk.buttons) {
            linkBlk.buttons = [];
            warn = true;
        };
        var blk = $("<div/>").addClass("panel panel-default");
        blk.append($("<div/>").addClass("panel-heading").text(linkBlk.title));
        var body = $("<div/>").addClass("panel-body");
        // loop through buttons
        for (var j in linkBlk.buttons) {
            var linkBtn = linkBlk.buttons[j];
            if (!linkBtn.title) {
                linkBtn.title = "";
                warn = true;
            }
            if (!linkBtn.url && !linkBtn.menu) warn = true;
            if (!linkBtn.style) linkBtn.style = "default";
            var btn;
            if (linkBtn.url) {
                btn = $("<a/>").addClass("btn btn-block btn-" + linkBtn.style).attr("href", linkBtn.url).text(linkBtn.title);
                // workaround for accessing Chrome URLs
                if (linkBtn.url.substring(0, "chrome://".length) === "chrome://") btn.addClass("link-chrome");
                // always open in new tab
                if (linkBtn.external) btn.addClass("link-external");
                // menu overrides link
                if (linkBtn.menu) warn = true;
            }
            if (linkBtn.menu) {
                btn = $("<div/>").addClass("btn-group btn-block");
                btn.append($("<button/>").addClass("btn btn-block btn-" + linkBtn.style + " dropdown-toggle").attr("type", "button").attr("data-toggle", "dropdown")
                                         .text(linkBtn.title + " ").append($("<span/>").addClass("caret")));
                var menu = $("<ul/>").addClass("dropdown-menu");
                // loop through menu items
                for (var k in linkBtn.menu) {
                    var linkItem = linkBtn.menu[k];
                    if (typeof(linkItem) === "string") {
                        if (k > 0) {
                            menu.append($("<li/>").addClass("divider"));
                        }
                        if (linkItem) {
                            menu.append($("<li/>").addClass("dropdown-header").text(linkItem));
                        }
                    } else {
                        if (!linkItem.title) {
                            linkItem.title = "";
                            warn = true;
                        }
                        if (!linkItem.url) warn = true;
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
    }
    if (warn) {
        $("nav").after($("<div/>").addClass("alert alert-warning").text("Possible errors whilst parsing saved links.  Go to Settings and check the syntax."));
    }
    // switch to links page
    $("#menu-links").click(function(e) {
        $(".navbar-right li").removeClass("active");
        $(this).addClass("active");
        $(".main").hide();
        $("#links").show();
    });
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
    // show current time in navbar
    var pad = function pad(i) {
        return i < 10 ? "0" + i : i.toString();
    };
    var tick = function tick() {
        var now = new Date();
        $("#time").text(pad(now.getHours()) + ":" + pad(now.getMinutes()) + ":" + pad(now.getSeconds()));
    }
    tick();
    setInterval(tick, 1000);
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
        $("#settings-links-content").val(JSON.stringify(settings.links["content"], undefined, 2));
        $("#settings-bookmarks-bookmarklets").prop("checked", settings.bookmarks["bookmarklets"]);
        $("#settings-history-limit").val(settings.history["limit"]);
        $("#settings-history-limit-value").text(settings.history["limit"]);
        $("#settings-general-title").val(settings.general["title"]);
        $("#settings-general-font").val(settings.general["font"]);
        $("#settings-general-topbar").prop("checked", settings.general["topbar"]);
        $("#settings-general-background-image").data("val", settings.general["background"].image).prop("placeholder", "(unchanged)");
        $("#settings-general-background-repeat").prop("checked", settings.general["background"].repeat).prop("disabled", !settings.general["background"].image)
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
        $("#settings-general-background-repeat").prop("disabled", true).next().toggleClass("text-muted", true);
    });
    // reset to default stripes
    $("#settings-general-background-default").click(function(e) {
        $("#settings-general-background-image").data("val", "../img/bg.png").prop("placeholder", "(default)").val("");
        $("#settings-general-background-repeat").prop("disabled", false).prop("checked", true).next().toggleClass("text-muted", false);
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
        settings.bookmarks["bookmarklets"] = $("#settings-bookmarks-bookmarklets").prop("checked");
        if (!$("#settings-history-limit").val()) $("#settings-history-limit").val("10");
        settings.history["limit"] = parseInt($("#settings-history-limit").val());
        if (!$("#settings-general-title").val()) $("#settings-general-title").val(manif.name);
        settings.general["title"] = $("#settings-general-title").val();
        settings.general["font"] = $("#settings-general-font").val();
        settings.general["topbar"] = $("#settings-general-topbar").prop("checked");
        settings.general["background"] = {
            image: $("#settings-general-background-image").val() ? $("#settings-general-background-image").val() : $("#settings-general-background-image").data("val"),
            repeat: $("#settings-general-background-repeat").prop("checked")
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
