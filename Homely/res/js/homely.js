$(document).ready(function() {
    // helper methods
    var cap = function cap(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }
    var trim = function trim(str, len) {
        return str.length > len ? str.substring(0, len - 3) + "..." : str;
    }
    var pad = function pad(n) {
        return n < 10 ? "0" + n : n.toString();
    };
    var fa = function fa(icon, fw) {
        return $("<i/>").addClass("fa fa-" + icon).toggleClass("fa-fw", fw !== false);
    }
    var manif = chrome.runtime.getManifest();
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
            "bookmarklets": true,
            "foldercontents": true,
            "split": false,
            "merge": false
        },
        "history": {
            "limit": 10
        },
        "notifs": {
            "facebook": {
                "enable": {
                    "notifs": false,
                    "messages": false,
                    "friends": false
                }
            },
            "github": {
                "enable": false
            },
            "gmail": {
                "enable": false,
                "accounts": []
            },
            "outlook": {
                "enable": false
            },
            "steam": {
                "emable": false
            },
            "ticktick": {
                "enable": false,
                "due": true,
                "include": false
            },
            "twitter": {
                "enable": false
            }
        },
        "general": {
            "title": manif.name,
            "keyboard": false,
            "clock": {
                "show": true,
                "twentyfour": true,
                "seconds": true
            },
            "timer": {
                "stopwatch": false,
                "countdown": false,
                "beep": true
            },
            "weather": {
                "show": false,
                "location": ""
            },
            "proxy": false
        },
        "style": {
            "font": "Segoe UI",
            "topbar": {
                "fix": false,
                "dark": false
            },
            "panel": "default",
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
    // required permissions
    var ajaxPerms = {
        "facebook": ["https://www.facebook.com/"],
        "github": ["https://github.com/"],
        "gmail": ["https://accounts.google.com/", "https://mail.google.com/"],
        "outlook": ["https://login.live.com/", "https://*.mail.live.com/"],
        "steam": ["https://steamcommunity.com/", "http://steamcommunity.com/"],
        "ticktick": ["https://ticktick.com/"],
        "twitter": ["https://twitter.com/"],
        "weather": ["http://api.openweathermap.org/"],
        "proxy": ["http://www.whatismyproxy.com/"]
    };
    // load settings
    chrome.storage.local.get(function(store) {
        var firstRun = $.isEmptyObject(store);
        // apply settings over defaults, two levels deep then force overwrite
        for (var x in settings) {
            for (var y in settings[x]) {
                if (store[x] && typeof(store[x][y]) !== "undefined") settings[x][y] = store[x][y];
            }
        }
        // apply custom styles
        document.title = settings.general["title"];
        var css = [];
        if (settings.style["font"]) {
            css.push("* {\n"
                   + "    font-family: '" + settings.style["font"] + "';\n"
                   + "}");
        }
        if (settings.style["topbar"].fix) {
            $("body").addClass("topbar-fix");
            $("nav").addClass("navbar-fixed-top");
            $("#menu-collapse").addClass("collapse navbar-collapse");
            $("#menu-collapse-toggle").show();
        }
        if (settings.style["topbar"].dark) {
            $("nav").removeClass("navbar-default").addClass("navbar-inverse");
        }
        if (settings.style["background"].image) {
            css.push("html {\n"
                   + "    background-image: url(" + settings.style["background"].image + ");\n"
                   + "    background-repeat: " + (settings.style["background"].repeat ? "" : "no-") + "repeat;\n"
                   + "    background-position: " + (settings.style["background"].centre ? "center" : "initial") + ";\n"
                   + "    background-attachment: " + (settings.style["background"].fixed ? "fixed" : "initial") + ";\n"
                   + "    background-size: " + (settings.style["background"].stretch ? "cover" : "auto") + ";\n"
                   + "}");
        }
        if (css.length) {
            $(document.head).append($("<style/>").html(css.join("\n")));
        }
        if (settings.style["customcss"].enable) {
            $(document.head).append($("<style/>").html(settings.style["customcss"].content));
        }
        // show current time in navbar
        if (settings.general["clock"].show) {
            var time = $("<div/>").attr("id", "time").addClass("navbar-brand");
            $(".navbar-header").append($("<a/>").attr("href", "http://time.is").append(time));
            var days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
            var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
            var tick = function tick() {
                var now = new Date();
                var hours = now.getHours();
                var pm = "";
                if (settings.general["clock"].twentyfour) {
                    hours = pad(hours);
                } else {
                    pm = " AM";
                    if (hours === 0 || hours > 12) {
                        hours = (hours + 12) % 24;
                        pm = " PM";
                    }
                }
                time.text(hours + ":" + pad(now.getMinutes()) + (settings.general["clock"].seconds ? ":" + pad(now.getSeconds()) : "") + pm)
                    .attr("title", days[now.getDay()] + " " + now.getDate() + " " + months[now.getMonth()] + " " + now.getFullYear());
            }
            tick();
            setInterval(tick, 1000);
        }
        // show stopwatch / countdown timer
        if (settings.general["timer"].stopwatch || settings.general["timer"].countdown) {
            var root = $("<li/>").addClass("dropdown");
            var link = $("<a/>").addClass("dropdown-toggle").attr("data-toggle", "dropdown");
            root.append(link);
            var menu = $("<ul/>").addClass("dropdown-menu");
            root.append(menu);
            var reset = function reset() {
                link.empty().append(fa("clock-o", false)).append(" No timers ").append($("<span/>").addClass("caret"));
                menu.empty();
                var interval = 0;
                if (settings.general["timer"].stopwatch) {
                    menu.append($("<li/>").append($("<a/>").append("Start stopwatch").click(function(e) {
                        var time = 0;
                        var stopwatch = function stopwatch() {
                            time++;
                            if (time) {
                                var text = pad(Math.floor(time / (60 * 60))) + ":" + pad(Math.floor((time / 60) % 60)) + ":" + pad(time % 60);
                                $($("span", link)[0]).text(text);
                                document.title = text;
                            } else {
                                clearInterval(interval);
                                document.title = settings.general["title"];
                                reset();
                            }
                        };
                        // stopwatch menu
                        menu.empty().append($("<li/>").append($("<a/>").data("paused", false).append(fa("pause")).append(" Pause").click(function(e) {
                            if ($(this).data("paused")) {
                                interval = setInterval(stopwatch, 1000);
                                $("i", link).addClass("fa-spin");
                                $(this).data("paused", false).empty().append(fa("pause")).append(" Pause");
                            } else {
                                clearInterval(interval);
                                $("i", link).removeClass("fa-spin");
                                $(this).data("paused", true).empty().append(fa("play")).append(" Resume");
                            }
                        }))).append($("<li/>").append($("<a/>").append(fa("stop")).append(" Cancel").click(function(e) {
                            clearInterval(interval);
                            document.title = settings.general["title"];
                            reset();
                        })));
                        // show timer
                        var text = pad(Math.floor(time / (60 * 60))) + ":" + pad(Math.floor((time / 60) % 60)) + ":" + pad(time % 60);
                        link.empty().append(fa("spinner fa-spin", false)).append(" ").append($("<span/>").text(text)).append(" ").append($("<span/>").addClass("caret"));
                        document.title = text;
                        interval = setInterval(stopwatch, 1000);
                    })));
                }
                if (settings.general["timer"].countdown) {
                    menu.append($("<li/>").append($("<a/>").append("Start countdown").click(function(e) {
                        // select time
                        var time = prompt("Enter a time to countdown from (e.g. 45s, 2m30s).", "5m");
                        if (!time) return;
                        var parts = time.replace(/[^0-9hms]/g, "").match(/([0-9]+[hms])/g);
                        var time = 0;
                        for (var i in parts) {
                            var part = parts[i];
                            var params = [parseInt(part.substr(0, part.length - 1)), part.charAt(part.length - 1)];
                            switch (params[1]) {
                                case "h":
                                    time += params[0] * 60 * 60;
                                    break;
                                case "m":
                                    time += params[0] * 60;
                                    break;
                                case "s":
                                    time += params[0];
                                    break;
                            }
                        }
                        var countdown = function countdown() {
                            if (time) {
                                time--;
                                var text = pad(Math.floor(time / (60 * 60))) + ":" + pad(Math.floor((time / 60) % 60)) + ":" + pad(time % 60);
                                $($("span", link)[0]).text(text);
                                document.title = text;
                            } else {
                                if (settings.general["timer"].beep) {
                                    new Audio("../mp3/alarm.mp3").play();
                                }
                                clearInterval(interval);
                                document.title = settings.general["title"];
                                reset();
                            }
                        };
                        // countdown menu
                        menu.empty().append($("<li/>").append($("<a/>").data("paused", false).append(fa("pause")).append(" Pause").click(function(e) {
                            if ($(this).data("paused")) {
                                interval = setInterval(countdown, 1000);
                                $("i", link).addClass("fa-spin");
                                $(this).data("paused", false).empty().append(fa("pause")).append(" Pause");
                            } else {
                                clearInterval(interval);
                                $("i", link).removeClass("fa-spin");
                                $(this).data("paused", true).empty().append(fa("play")).append(" Resume");
                            }
                        }))).append($("<li/>").append($("<a/>").append(fa("stop")).append(" Cancel").click(function(e) {
                            clearInterval(interval);
                            document.title = settings.general["title"];
                            reset();
                        })));
                        // show timer
                        var text = pad(Math.floor(time / (60 * 60))) + ":" + pad(Math.floor((time / 60) % 60)) + ":" + pad(time % 60);
                        link.empty().append(fa("spinner fa-spin", false)).append(" ").append($("<span/>").text(text)).append(" ").append($("<span/>").addClass("caret"));
                        document.title = text;
                        interval = setInterval(countdown, 1000);
                    })));
                }
            };
            reset();
            $("#menu-left").append(root);
        }
        // get weather forecast
        if (settings.general["weather"].show) {
            chrome.permissions.contains({
                origins: ajaxPerms["weather"]
            }, function(has) {
                if (!has || !settings.general["weather"].location) {
                    settings.general["weather"].show = false;
                    return;
                }
                if (navigator.onLine) {
                    $.ajax({
                        url: "http://api.openweathermap.org/data/2.5/weather?q=" + encodeURIComponent(settings.general["weather"].location),
                        success: function success(resp, stat, xhr) {
                            var conds = [];
                            $.each(resp.weather, function(i, item) {
                                conds.push(item.description);
                            });
                            var link = $("<a/>").attr("href", "http://www.openweathermap.org/city/" + resp.id)
                                                .attr("title", resp.name + ": " + cap(conds.join(", "))).hide();
                            link.append(fa("cloud", false)).append(" " + Math.round(resp.main.temp - 273.15) + "&deg;C");
                            // always show before proxy link if that loads first
                            if ($("#menu-proxy").length) {
                                $("#menu-proxy").before($("<li/>").append(link));
                            } else {
                                $("#menu-left").append($("<li/>").append(link));
                            }
                            link.fadeIn();
                        }
                    });
                }
            });
        }
        // get IP address / proxy status
        if (settings.general["proxy"]) {
            chrome.permissions.contains({
                origins: ajaxPerms["proxy"]
            }, function(has) {
                if (!has) {
                    settings.general["proxy"] = false;
                    return;
                }
                if (navigator.onLine) {
                    $.ajax({
                        url: "http://www.whatismyproxy.com",
                        success: function success(resp, stat, xhr) {
                            var params = $(".h1", resp).text().split("IP address: ");
                            var link = $("<a/>").attr("href", "http://www.whatismyproxy.com").hide();
                            link.append(fa(params[0] === "No proxies were detected." ? "desktop" : "exchange", false)).append(" " + params[1]);
                            $("#menu-left").append($("<li/>").attr("id", "menu-proxy").append(link));
                            link.fadeIn();
                        },
                        error: function(xhr, stat, err) {
                            var link = $("<a/>").append(fa("power-off", false)).append(" No connection").hide();
                            $("#menu-left").append($("<li/>").attr("id", "menu-proxy").append(link));
                            link.fadeIn();
                        }
                    });
                } else {
                    var link = $("<a/>").append(fa("power-off", false)).append(" No connection").hide();
                    $("#menu-left").append($("<li/>").append(link));
                    link.fadeIn();
                }
            });
        }
        /*
        Links: customizable grid of links and menus
        */
        // monitor Ctrl key to open links in a new tab
        var ctrlDown = false;
        $(window).keydown(function(e) {
            if (e.keyCode === 17) ctrlDown = true;
        }).keyup(function(e) {
            if (e.keyCode === 17) ctrlDown = false;
        });
        // special link handling
        var fixLinkHandling = function fixLinkHandling(context) {
            // open Chrome links via Tabs API
            $(".link-chrome", context).off("click").click(function(e) {
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
            $(".link-external", context).off("click").click(function(e) {
                if (!$(this).hasClass("link-chrome")) {
                    chrome.tabs.create({url: this.href, active: true});
                    e.preventDefault();
                }
            });
        };
        var populateLinks = function populateLinks() {
            $("#alerts, #links").empty();
            if (settings.links["edit"].dragdrop) $("#links").off("sortupdate");
            // loop through blocks
            $(settings.links["content"]).each(function(i, linkBlk) {
                if (!linkBlk.title) linkBlk.title = "";
                if (!linkBlk.buttons) linkBlk.buttons = [];
                var blk = $("<div/>").addClass("panel panel-" + settings.style["panel"] + " sortable").data("pos", i);
                var head = $("<div/>").addClass("panel-heading").text(linkBlk.title);
                if (!linkBlk.title) head.html("&nbsp;");
                // edit controls dropdown on header
                if (settings.links["edit"].menu) {
                    var editRoot = $("<div/>").addClass("btn-group pull-right");
                    var editBtn = $("<button/>").addClass("btn btn-xs btn-default dropdown-toggle").attr("data-toggle", "dropdown").append($("<span/>").addClass("caret")).hide();
                    editRoot.append(editBtn);
                    var editMenu = $("<ul/>").addClass("dropdown-menu");
                    if (i > 0) {
                        editMenu.append($("<li/>").append($("<a/>").append(fa("angle-double-left")).append(" Move to start").click(function(e) {
                            for (var x = i; x > 0; x--) {
                                settings.links["content"][x] = settings.links["content"][x - 1];
                            }
                            settings.links["content"][0] = linkBlk;
                            populateLinks();
                            chrome.storage.local.set({"links": settings.links});
                        })));
                        editMenu.append($("<li/>").append($("<a/>").append(fa("angle-left")).append(" Move left").click(function(e) {
                            settings.links["content"][i] = settings.links["content"][i - 1];
                            settings.links["content"][i - 1] = linkBlk;
                            populateLinks();
                            chrome.storage.local.set({"links": settings.links});
                        })));
                    }
                    var max = settings.links["content"].length - 1;
                    if (i < max) {
                        editMenu.append($("<li/>").append($("<a/>").append(fa("angle-right")).append(" Move right").click(function(e) {
                            settings.links["content"][i] = settings.links["content"][i + 1];
                            settings.links["content"][i + 1] = linkBlk;
                            populateLinks();
                            chrome.storage.local.set({"links": settings.links});
                        })));
                        editMenu.append($("<li/>").append($("<a/>").append(fa("angle-double-right")).append(" Move to end").click(function(e) {
                            for (var x = i; x < max; x++) {
                                settings.links["content"][x] = settings.links["content"][x + 1];
                            }
                            settings.links["content"][max] = linkBlk;
                            populateLinks();
                            chrome.storage.local.set({"links": settings.links});
                        })));
                    }
                    if (i > 0 || i < max) {
                        editMenu.append($("<li/>").append($("<a/>").append(fa("arrows")).append(" Move to position").click(function(e) {
                            var pos = prompt("Enter a new position for this block.", i);
                            if (typeof(pos) === "string") {
                                pos = parseInt(pos);
                                if (!isNaN(pos)) {
                                    if (pos < 0) pos = 0;
                                    if (pos > max) pos = max;
                                    if (pos < i) {
                                        for (var x = i; x > pos; x--) {
                                            settings.links["content"][x] = settings.links["content"][x - 1];
                                        }
                                    } else if (pos > i) {
                                        for (var x = i; x < pos; x++) {
                                            settings.links["content"][x] = settings.links["content"][x + 1];
                                        }
                                    }
                                    settings.links["content"][pos] = linkBlk;
                                    populateLinks();
                                    chrome.storage.local.set({"links": settings.links});
                                }
                            }
                        })));
                        editMenu.append($("<li/>").addClass("divider"));
                    }
                    editMenu.append($("<li/>").append($("<a/>").append(fa("step-backward")).append(" New block before").click(function(e) {
                        settings.links["content"].splice(i, 0, {
                            title: "",
                            buttons: []
                        });
                        $("#links-editor").data("block", i).modal("show");
                        populateLinks();
                        chrome.storage.local.set({"links": settings.links});
                    })));
                    editMenu.append($("<li/>").append($("<a/>").append(fa("step-forward")).append(" New block after").click(function(e) {
                        settings.links["content"].splice(i + 1, 0, {
                            title: "",
                            buttons: []
                        });
                        $("#links-editor").data("block", i + 1).modal("show");
                        populateLinks();
                        chrome.storage.local.set({"links": settings.links});
                    })));
                    editMenu.append($("<li/>").append($("<a/>").append(fa("files-o")).append(" Duplicate block").click(function(e) {
                        settings.links["content"].splice(i + 1, 0, $.extend(true, {}, linkBlk));
                        populateLinks();
                        chrome.storage.local.set({"links": settings.links});
                    })));
                    editMenu.append($("<li/>").addClass("divider"));
                    editMenu.append($("<li/>").append($("<a/>").append(fa("pencil")).append(" Edit block").click(function(e) {
                        $("#links-editor").data("block", i).modal("show");
                    })));
                    editMenu.append($("<li/>").append($("<a/>").append(fa("tag")).append(" Rename block").click(function(e) {
                        var name = prompt("Enter a new name for this block.", linkBlk.title);
                        if (typeof(name) === "string") {
                            linkBlk.title = name;
                            populateLinks();
                            chrome.storage.local.set({"links": settings.links});
                        }
                    })));
                    editMenu.append($("<li/>").append($("<a/>").append(fa("trash-o")).append(" Delete block").click(function(e) {
                        if (confirm("Are you sure you want to delete " + (linkBlk.title ? linkBlk.title : "this block") + "?")) {
                            settings.links["content"].splice(i, 1);
                            populateLinks();
                            chrome.storage.local.set({"links": settings.links});
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
                                if (linkItem.url.substring(0, "chrome-extension://".length) === "chrome-extension://") item.addClass("link-chrome");
                                // always open in new tab
                                if (linkItem.external) item.addClass("link-external");
                                menu.append($("<li/>").append(item));
                            }
                        }
                        btn.append(menu);
                    } else {
                        btn = $("<a/>").addClass("btn btn-block btn-" + linkBtn.style).attr("href", linkBtn.url).text(linkBtn.title);
                        if (!linkBtn.title) btn.html("&nbsp;");
                        // workaround for accessing Chrome URLs
                        if (linkBtn.url.substring(0, "chrome://".length) === "chrome://") btn.addClass("link-chrome");
                        if (linkBtn.url.substring(0, "chrome-extension://".length) === "chrome-extension://") btn.addClass("link-chrome");
                        // always open in new tab
                        if (linkBtn.external) btn.addClass("link-external");
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
                    populateLinks();
                    chrome.storage.local.set({"links": settings.links});
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
                var scroll = noscroll ? 0 : document.body.scrollTop;
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
                        optsMenu.append($("<li/>").append($("<a/>").append(fa("angle-double-up")).append(" Move to top").click(function(e) {
                            for (var x = j; x > 0; x--) {
                                linkBlk.buttons[x] = linkBlk.buttons[x - 1];
                            }
                            linkBlk.buttons[0] = linkBtn;
                            populateLinkEditor();
                        })));
                        optsMenu.append($("<li/>").append($("<a/>").append(fa("angle-up")).append(" Move up").click(function(e) {
                            linkBlk.buttons[j] = linkBlk.buttons[j - 1];
                            linkBlk.buttons[j - 1] = linkBtn;
                            populateLinkEditor();
                        })));
                    }
                    var max = linkBlk.buttons.length - 1;
                    if (j < max) {
                        optsMenu.append($("<li/>").append($("<a/>").append(fa("angle-down")).append(" Move down").click(function(e) {
                            linkBlk.buttons[j] = linkBlk.buttons[j + 1];
                            linkBlk.buttons[j + 1] = linkBtn;
                            populateLinkEditor();
                        })));
                        optsMenu.append($("<li/>").append($("<a/>").append(fa("angle-double-down")).append(" Move to bottom").click(function(e) {
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
                    if (linkBtn.menu && linkBtn.menu.length === 1) {
                        optsMenu.append($("<li/>").append($("<a/>").append(fa("level-up")).append(" Convert to link").click(function(e) {
                            linkBtn.title = linkBtn.menu[0].title;
                            linkBtn.url = linkBtn.menu[0].url;
                            delete linkBtn.menu;
                            populateLinkEditor();
                        })));
                        optsMenu.append($("<li/>").addClass("divider"));
                    } else if (!linkBtn.menu) {
                        optsMenu.append($("<li/>").append($("<a/>").append(fa("level-down")).append(" Convert to menu").click(function(e) {
                            linkBtn.menu = [
                                {
                                    title: linkBtn.title,
                                    url: linkBtn.url
                                }
                            ];
                            linkBtn.title = "";
                            delete linkBtn.url;
                            populateLinkEditor();
                        })));
                        optsMenu.append($("<li/>").addClass("divider"));
                    }
                    optsMenu.append($("<li/>").append($("<a/>").append(fa("trash-o")).append(" Delete button").click(function(e) {
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
                            linkBtn.style = style;
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
                                menuOptsMenu.append($("<li/>").append($("<a/>").append(fa("angle-double-up")).append(" Move to top").click(function(e) {
                                    for (var x = k; x > 0; x--) {
                                        linkBtn.menu[x] = linkBtn.menu[x - 1];
                                    }
                                    linkBtn.menu[0] = linkItem;
                                    populateLinkEditor();
                                })));
                                menuOptsMenu.append($("<li/>").append($("<a/>").append(fa("angle-up")).append(" Move up").click(function(e) {
                                    linkBtn.menu[k] = linkBtn.menu[k - 1];
                                    linkBtn.menu[k - 1] = linkItem;
                                    populateLinkEditor();
                                })));
                            }
                            var max = linkBtn.menu.length - 1;
                            if (k < max) {
                                menuOptsMenu.append($("<li/>").append($("<a/>").append(fa("angle-down")).append(" Move down").click(function(e) {
                                    linkBtn.menu[k] = linkBtn.menu[k + 1];
                                    linkBtn.menu[k + 1] = linkItem;
                                    populateLinkEditor();
                                })));
                                menuOptsMenu.append($("<li/>").append($("<a/>").append(fa("angle-double-down")).append(" Move to bottom").click(function(e) {
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
                            menuOptsMenu.append($("<li/>").append($("<a/>").append(fa("trash-o")).append(" Delete item").click(function(e) {
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
                                var linkGroup = $("<div/>").addClass("input-group");
                                var url = $("<input>").attr("type", "text").addClass("form-control").attr("placeholder", "Link URL").val(linkItem.url).change(function(e) {
                                    linkItem.url = $(this).val();
                                })
                                linkGroup.append(url);
                                var linkItemRootRight = $("<span/>").addClass("input-group-btn");
                                var check = $("<button/>").addClass("btn btn-default dropdown-toggle").attr("data-toggle", "dropdown");
                                if (linkItem.external) {
                                    check.append(fa("external-link")).append(" New tab");
                                } else {
                                    check.append(fa("sign-in")).append(" Same tab");
                                }
                                check.click(function(e) {
                                    linkItem.external = !linkItem.external;
                                    check.empty();
                                    if (linkItem.external) {
                                        check.append(fa("external-link")).append(" New tab");
                                    } else {
                                        check.append(fa("sign-in")).append(" Same tab");
                                    }
                                });
                                linkItemRootRight.append(check);
                                linkGroup.append(linkItemRootRight);
                                tr.append($("<td/>").append(linkGroup));
                            }
                            tbody.append(tr);
                        });
                        blk.append($("<table/>").addClass("table table-bordered table-condensed").append(tbody));
                        var menuBtnsRoot = $("<div/>").addClass("btn-group");
                        menuBtnsRoot.append($("<button/>").addClass("btn btn-default").append(fa("globe")).append(" Add link").click(function(e) {
                            linkBtn.menu.push({
                                title: "",
                                url: ""
                            });
                            populateLinkEditor();
                        }));
                        menuBtnsRoot.append($("<button/>").addClass("btn btn-default").append(fa("indent")).append(" Add section").click(function(e) {
                            linkBtn.menu.push("");
                            populateLinkEditor();
                        }));
                        blk.append(menuBtnsRoot);
                    } else {
                        var linkGroup = $("<div/>").addClass("input-group");
                        var url = $("<input>").attr("type", "text").addClass("form-control").attr("placeholder", "Link URL").val(linkBtn.url).change(function(e) {
                            linkBtn.url = $(this).val();
                        })
                        linkGroup.append(url);
                        var linkBtnRootRight = $("<span/>").addClass("input-group-btn");
                        var check = $("<button/>").addClass("btn btn-default dropdown-toggle").attr("data-toggle", "dropdown");
                        if (linkBtn.external) {
                            check.append(fa("external-link")).append(" New tab");
                        } else {
                            check.append(fa("sign-in")).append(" Same tab");
                        }
                        check.click(function(e) {
                            linkBtn.external = !linkBtn.external;
                            check.empty();
                            if (linkBtn.external) {
                                check.append(fa("external-link")).append(" New tab");
                            } else {
                                check.append(fa("sign-in")).append(" Same tab");
                            }
                        });
                        linkBtnRootRight.append(check);
                        linkGroup.append(linkBtnRootRight);
                        blk.append(linkGroup);
                    }
                    $("#links-editor-body").append(blk);
                });
                // reset scroll position
                window.scrollTo(0, scroll);
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
                $("#links-editor").modal("hide");
                populateLinks();
                chrome.storage.local.set({"links": settings.links});
            })
            // delete block
            $("#links-editor-delete").click(function(e) {
                if (confirm("Are you sure you want to delete " + (linkBlk.title ? linkBlk.title : "this block") + "?")) {
                    settings.links["content"].splice(i, 1);
                    $("#links-editor").modal("hide");
                    populateLinks();
                    chrome.storage.local.set({"links": settings.links});
                }
            })
            populateLinkEditor(true);
        }).on("hide.bs.modal", function(e) {
            $("#links-editor-add-link, #links-editor-add-menu, #links-editor-save, #links-editor-delete").off("click");
        });
        if (firstRun) {
            var alert = $("<div/>").addClass("alert alert-success alert-dismissable");
            alert.append($("<button/>").addClass("close").attr("data-dismiss", "alert").html("&times;").click(function(e) {
                chrome.storage.local.set(settings);
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
                $("#links-editor").data("block", settings.links["content"].length - 1).modal("show");
                populateLinks();
                chrome.storage.local.set({"links": settings.links});
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
        $("#bookmarks").addClass("panel-" + settings.style["panel"]);
        // switch to bookmarks page
        $("#menu-bookmarks").click(function(e) {
            $(".navbar-right li").removeClass("active");
            $(this).addClass("active");
            $(".main").hide();
            $("#bookmarks").show();
        });
        // show split pane if enabled
        if (settings.bookmarks["split"]) {
            $("#bookmarks-block").before($("<div/>").attr("id", "bookmarks-block-folders").addClass("panel-body"));
            $("#bookmarks-block").before($("<hr/>"));
        }
        // request tree from Bookmarks API
        chrome.bookmarks.getTree(function bookmarksCallback(tree) {
            tree[0].title = "Bookmarks";
            var route = [];
            var populateBookmarks = function populateBookmarks(root) {
                // clear current list
                $("#bookmarks-title, #bookmarks-block, #bookmarks-block-folders").empty();
                if (!root.children.length) {
                    $("#bookmarks-block").show().append($("<div/>").addClass("alert alert-info").append("<span>Nothing in this folder.</span>"));
                    $("#bookmarks-block-folders").hide();
                }
                // loop through folder children
                $(root.children).each(function(i, el) {
                    // bookmark
                    if (el.url) {
                        // bookmarklet
                        if (el.url.substring(0, "javascript:".length) === "javascript:") {
                            if (settings.bookmarks["bookmarklets"]) {
                                $("#bookmarks-block").append($("<button/>").addClass("btn btn-info disabled").append(fa("code")).append(" " + el.title));
                            }
                        } else {
                            var link = $("<a/>").addClass("btn btn-primary").attr("href", el.url).append(fa("file")).append(" " + el.title);
                            // workaround for accessing Chrome URLs
                            if (el.url.substring(0, "chrome://".length) === "chrome://") link.addClass("link-chrome");
                            $("#bookmarks-block").append(link);
                        }
                    // folder
                    } else if (el.children) {
                        var container = $("#bookmarks-block" + (settings.bookmarks["split"] ? "-folders" : ""));
                        container.append($("<button/>").addClass("btn btn-warning").append(fa("folder" + (el.children.length ? "" : "-o"))).append(" " + el.title).click(function(e) {
                            // normal click
                            if (e.which === 1 && (!ctrlDown || !settings.bookmarks["foldercontents"])) {
                                route.push(i);
                                populateBookmarks(el);
                            // middle click or Ctrl+click, if enabled
                            } else if (e.which <= 2 && settings.bookmarks["foldercontents"]) {
                                $(el.children).each(function(i, child) {
                                    if (child.url && child.url.substring(0, "javascript:".length) !== "javascript:") chrome.tabs.create({url: child.url, active: false});
                                });
                            }
                        }));
                    }
                });
                $("#bookmarks-block, #bookmarks-block-folders").each(function(i, blk) {
                    $(blk).toggle(!$(blk).is(":empty"));
                });
                $("#bookmarks hr").toggle(!$("#bookmarks-block, #bookmarks-block-folders").is(":empty"));
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
            if (settings.bookmarks["merge"]) {
                $("#bookmarks").fadeIn();
            } else {
                $("#menu-bookmarks").show();
            }
        });
        /*
        History: quick drop-down of recent pages
        */
        // only show if enabled and not in incognito
        if (settings.history["limit"] && !chrome.extension.inIncognitoContext) {
            var block = true;
            $("#history-title").click(function(e) {
                // delay opening list until loaded
                if (block && !$(this).hasClass("active")) {
                    e.stopPropagation();
                    // request items from History API
                    chrome.history.search({text: "", maxResults: settings.history["limit"]}, function historyCallback(results) {
                        $("#history-list").empty();
                        // loop through history items
                        for (var i in results) {
                            var res = results[i];
                            var link = $("<a/>").attr("href", res.url).text(trim(res.title ? res.title : res.url, 50));
                            // workaround for accessing Chrome URLs
                            if (res.url.substring(0, "chrome://".length) === "chrome://" || res.url.substring(0, "chrome-extension://".length) === "chrome-extension://") {
                                link.click(function(e) {
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
                            }
                            // add to dropdown
                            $("#history-list").append($("<li/>").append(link));
                        }
                        $("#history-list").append($("<li/>").addClass("divider"));
                        $("#history-list").append($("<li/>").append($("<a/>").addClass("link-chrome").append(fa("search")).append(" More...").attr("href", "chrome://history")));
                        fixLinkHandling("#history-list");
                        block = false;
                        $("#history-title").click();
                    });
                // reset block
                } else {
                    block = true;
                }
            });
            $("#menu-history").show();
        }
        /*
        Notifications: poll websites for notification counts
        */
        // refresh notifications
        var notifRefresh = function notifRefresh() {
            // disable if no connection
            if (!navigator.onLine) {
                $("#notifs-list").append($("<li/>").addClass("disabled").append($("<a/>").append(fa("power-off")).append(" No connection")))
                                 .append($("<li/>").addClass("divider"))
                                 .append($("<li/>").append($("<a/>").append(fa("refresh")).append(" Check again").off("click").click(function (e) {
                                     $("#notifs-list").empty();
                                     notifRefresh();
                                     e.stopPropagation();
                                 })));
                $("#menu-notifs").show();
                return;
            }
            // add to list if permission available
            var pendingPerm = 0;
            var has = false;
            var refreshLink;
            var pendingCount = function pendingCount() {
                // only if at least one, once all complete
                if (--pendingPerm || !has) return;
                refreshLink = $("<a/>").append(fa("refresh fa-spin")).append(" Refreshing...").click(function (e) {
                    e.stopPropagation();
                });
                $("#notifs-list").append($("<li/>").addClass("disabled").append(refreshLink));
                $("#menu-notifs").show();
            };
            // update total count on response
            var pendingAjax = 0;
            var total = 0;
            var ajaxCount = function ajaxCount(counts) {
                var thisTotal = 0;
                for (var i in counts) {
                    if (!isNaN(counts[i])) thisTotal += counts[i];
                }
                if (thisTotal) {
                    total += thisTotal;
                    $("#notifs-title").empty().append(fa("bell", false)).append(" Notifications ");
                    $("#notifs-title").append($("<span/>").addClass("badge").text(total)).append(" ").append($("<span/>").addClass("caret"));
                    document.title = "(" + total + ") " + settings.general["title"];
                }
                // only once all complete
                if (--pendingAjax) return;
                refreshLink.empty().append(fa("refresh")).append(" Refresh").off("click").click(function (e) {
                    $("#notifs-title").empty().append(fa("bell-o", false)).append(" Notifications ").append($("<span/>").addClass("caret"));
                    document.title = settings.general["title"];
                    $("#notifs-list").empty();
                    notifRefresh();
                    e.stopPropagation();
                });
                refreshLink.parent().removeClass("disabled");
            };
            /*
            handlers = {
                settings key: {
                    title: section header,
                    api: URL to query for all counts,
                    items: function(notif) {
                        return [
                            {
                                title: item label,
                                url: URL to open on click,
                                api: URL to query for individual count,
                                count: function(notif, resp) {
                                    return count for this item
                                }
                            },
                            ...
                        ]
                    },
                    count: function(notif, resp) {
                        return list of counts corresponding to items
                    }
                },
                ...
            }
            */
            var handlers = {
                "facebook": {
                    title: "Facebook",
                    api: "https://www.facebook.com",
                    items: function(notif) {
                        var menu = [];
                        if (notif.enable.notifs) menu.push({
                            title: "Notifications",
                            url: "https://www.facebook.com/notifications"
                        });
                        if (notif.enable.messages) menu.push({
                            title: "Messages",
                            url: "https://www.facebook.com/messages/"
                        });
                        if (notif.enable.friends) menu.push({
                            title: "Requests",
                            url: "https://www.facebook.com/friends/requests/"
                        });
                        return menu;
                    },
                    count: function(notif, resp) {
                        var vals = [];
                        if (notif.enable.notifs) vals.push(parseInt($("#notificationsCountValue", resp).text()));
                        if (notif.enable.messages) vals.push(parseInt($("#mercurymessagesCountValue", resp).text()));
                        if (notif.enable.friends) vals.push(parseInt($("#requestsCountValue", resp).text()));
                        return vals;
                    }
                },
                "github": {
                    title: "GitHub",
                    api: "https://github.com/notifications",
                    items: function(notif) {
                        return [{
                            title: "Notifications",
                            url: "https://github.com/notifications"
                        }];
                    },
                    count: function(notif, resp) {
                        return [parseInt($(".count", resp).length ? $($(".count", resp)[0]).text() : "")];
                    }
                },
                "gmail": {
                    title: "Gmail",
                    items: function(notif) {
                        var accs = notif.accounts;
                        if (!accs.length) return [{
                            title: "Emails",
                            url: "https://mail.google.com/mail/u/0/",
                            api: "https://mail.google.com/mail/u/0/feed/atom",
                            count: function(notif, resp) {
                                return parseInt($("fullcount", resp).text());
                            }
                        }];
                        var menu = [];
                        for (var i in accs) {
                            menu.push({
                                title: "Account " + accs[i],
                                url: "https://mail.google.com/mail/u/" + accs[i] + "/",
                                api: "https://mail.google.com/mail/u/" + accs[i] + "/feed/atom",
                                count: function(notif, resp) {
                                    return parseInt($("fullcount", resp).text());
                                }
                            });
                        }
                        return menu;
                    }
                },
                "outlook": {
                    title: "Outlook",
                    api: "https://mail.live.com",
                    items: function(notif) {
                        return [{
                            title: "Emails",
                            url: "https://mail.live.com"
                        }];
                    },
                    count: function(notif, resp) {
                        var c = $(".count", resp);
                        return [parseInt(c.length ? ($(c[0]).text() ? $(c[0]).text() : "0") : "")];
                    }
                },
                "steam": {
                    title: "Steam",
                    api: "http://steamcommunity.com",
                    items: function(notif) {
                        return [{
                            title: "Notifications",
                            url: "http://steamcommunity.com"
                        }];
                    },
                    count: function(notif, resp) {
                        var c = $("#header_notification_link", resp);
                        window.c = c;
                        return [parseInt(c.length ? ($(c[0]).text().trim() ? $(c[0]).text().trim() : "0") : "")];
                    }
                },
                "ticktick": {
                    title: "TickTick",
                    api: "https://ticktick.com/api/v2/project/all/tasks",
                    items: function(notif) {
                        return [{
                            title: "Tasks",
                            url: "https://ticktick.com"
                        }];
                    },
                    count: function(notif, resp) {
                        var count = resp.length;
                        if (notif.due) {
                            count = 0;
                            var now = new Date();
                            for (var i in resp) {
                                if (resp[i].dueDate && new Date(resp[i].dueDate) < now) count++;
                            }
                        }
                        return [count];
                    }
                },
                "twitter": {
                    title: "Twitter",
                    api: "https://twitter.com",
                    items: function(notif) {
                        return [{
                            title: "Notifications",
                            url: "https://twitter.com/i/notifications"
                        }];
                    },
                    count: function(notif, resp) {
                        return [parseInt($(".count-inner", resp).length ? $($(".count", resp)[0]).text() : "")];
                    }
                }
            };
            $.each(settings.notifs, function(key, notif) {
                // check if at least one option enabled
                var enabled = notif.enable;
                if (typeof(notif.enable) === "object") {
                    enabled = false;
                    for (var x in notif.enable) {
                        if (notif.enable[x]) {
                            enabled = true;
                            break;
                        }
                    }
                }
                if (enabled) {
                    // check permissions exist
                    pendingPerm++;
                    has = true;
                    chrome.permissions.contains({
                        origins: ajaxPerms[key]
                    }, function(has) {
                        if (has) {
                            var handle = handlers[key];
                            // add menu items
                            $("#notifs-list").append($("<li/>").addClass("dropdown-header").text(handle.title));
                            var menu = [];
                            var items = handle.items(notif);
                            $(items).each(function(i, item) {
                                var link = $("<a/>").attr("href", item.url).text(item.title);
                                $("#notifs-list").append($("<li/>").append(link));
                                menu.push(link);
                            });
                            $("#notifs-list").append($("<li/>").addClass("divider"));
                            if (handle.api) {
                                // single API call for all items
                                pendingAjax++;
                                $.ajax({
                                    url: handle.api,
                                    success: function(resp, stat, xhr) {
                                        if (typeof(resp) === "string") {
                                            resp = resp.replace(/<img[\S\s]*?>/g, "").replace(/<script[\S\s]*?>[\S\s]*?<\/script>/g, "");
                                            resp = resp.replace(/on[a-z]*="[\S\s]*?"/g, "");
                                        }
                                        var counts = handle.count(notif, resp);
                                        for (var i in menu) {
                                            menu[i].append($("<span/>").addClass("badge pull-right").text(isNaN(counts[i]) ? "?" : counts[i]));
                                        }
                                        ajaxCount(typeof(notif.include) === "boolean" && !notif.include ? [0] : counts);
                                    },
                                    error: function(xhr, stat, err) {
                                        for (var i in menu) {
                                            menu[i].append($("<span/>").addClass("badge pull-right").text("?"));
                                        }
                                        ajaxCount([0]);
                                    }
                                });
                            } else {
                                // API call for each item
                                $(items).each(function(i, item) {
                                    pendingAjax++;
                                    $.ajax({
                                        url: item.api,
                                        success: function(resp, stat, xhr) {
                                            if (typeof(resp) === "string") {
                                                resp = resp.replace(/<img[\S\s]*?>/g, "").replace(/<script[\S\s]*?>[\S\s]*?<\/script>/g, "");
                                                resp = resp.replace(/on[a-z]*="[\S\s]*?"/g, "");
                                            }
                                            var count = item.count(notif, resp);
                                            menu[i].append($("<span/>").addClass("badge pull-right").text(isNaN(count) ? "?" : count));
                                            ajaxCount([count]);
                                        },
                                        error: function(xhr, stat, err) {
                                            menu[i].append($("<span/>").addClass("badge pull-right").text("?"));
                                            ajaxCount([0]);
                                        }
                                    });
                                });
                            }
                            pendingCount();
                        } else {
                            // permission not available
                            if (typeof(notif.enable) === "string") {
                                notif.enable = false;
                            } else {
                                for (var x in notif.enable) {
                                    notif.enable[x] = false;
                                }
                            }
                            pendingPerm--;
                        }
                    });
                }
            });
        };
        // only show if enabled and not in incognito
        if (!chrome.extension.inIncognitoContext) notifRefresh();
        /*
        Settings: modal to customize links and options
        */
        // set to current data
        var populateSettings = function populateSettings() {
            $("#settings-links-edit-menu").prop("checked", settings.links["edit"].menu);
            $("#settings-links-edit-dragdrop").prop("checked", settings.links["edit"].dragdrop);
            $("#settings-links-content").val(JSON.stringify(settings.links["content"], undefined, 2));
            $("#settings-bookmarks-bookmarklets").prop("checked", settings.bookmarks["bookmarklets"]);
            $("#settings-bookmarks-foldercontents").prop("checked", settings.bookmarks["foldercontents"]);
            $("#settings-bookmarks-split").prop("checked", settings.bookmarks["split"]);
            $("#settings-bookmarks-merge").prop("checked", settings.bookmarks["merge"]);
            $("#settings-history-limit").val(settings.history["limit"]);
            $("#settings-history-limit-value").text(settings.history["limit"]);
            $("#settings-notifs-facebook-notifs").prop("checked", settings.notifs["facebook"].enable.notifs);
            $("#settings-notifs-facebook-messages").prop("checked", settings.notifs["facebook"].enable.messages);
            $("#settings-notifs-facebook-friends").prop("checked", settings.notifs["facebook"].enable.friends);
            $("#settings-notifs-github-enable").prop("checked", settings.notifs["github"].enable);
            $("#settings-notifs-gmail-enable").prop("checked", settings.notifs["gmail"].enable);
            $("#settings-notifs-gmail-accounts").prop("disabled", !settings.notifs["gmail"].enable).val(settings.notifs["gmail"].accounts.join(", "));
            $("#settings-notifs-outlook-enable").prop("checked", settings.notifs["outlook"].enable);
            $("#settings-notifs-steam-enable").prop("checked", settings.notifs["steam"].enable);
            $("#settings-notifs-ticktick-enable").prop("checked", settings.notifs["ticktick"].enable);
            $("#settings-notifs-ticktick-due").prop("checked", settings.notifs["ticktick"].due)
                                              .prop("disabled", !settings.notifs["ticktick"].enable)
                                              .parent().toggleClass("text-muted", !settings.notifs["ticktick"].enable);
            $("#settings-notifs-ticktick-include").prop("checked", settings.notifs["ticktick"].include)
                                                  .prop("disabled", !settings.notifs["ticktick"].enable)
                                                  .parent().toggleClass("text-muted", !settings.notifs["ticktick"].enable);
            $("#settings-notifs-twitter-enable").prop("checked", settings.notifs["twitter"].enable);
            // highlight notification permissions status
            $(".settings-perm").each(function(i, group) {
                var key = $(group).data("key");
                chrome.permissions.contains({
                    origins: ajaxPerms[key]
                }, function(has) {
                    if (has) {
                        $(group).addClass("has-success");
                    } else {
                        $(group).addClass("has-warning");
                        $("input[type=checkbox]", group).prop("checked", false);
                    }
                })
            });
            $("#settings-general-title").val(settings.general["title"]);
            $("#settings-general-keyboard").prop("checked", settings.general["keyboard"]);
            $("#settings-general-clock-show").prop("checked", settings.general["clock"].show);
            $("#settings-general-clock-twentyfour").prop("checked", settings.general["clock"].twentyfour)
                                                   .prop("disabled", !settings.general["clock"].show)
                                                   .parent().toggleClass("text-muted", !settings.general["clock"].show);
            $("#settings-general-clock-seconds").prop("checked", settings.general["clock"].seconds)
                                                .prop("disabled", !settings.general["clock"].show)
                                                .parent().toggleClass("text-muted", !settings.general["clock"].show);
            $("#settings-general-timer-stopwatch").prop("checked", settings.general["timer"].stopwatch);
            $("#settings-general-timer-countdown").prop("checked", settings.general["timer"].countdown);
            $("#settings-general-timer-beep").prop("checked", settings.general["timer"].beep)
                                             .prop("disabled", !settings.general["timer"].countdown)
                                             .parent().toggleClass("text-muted", !settings.general["timer"].countdown);
            $("#settings-general-weather-show").prop("checked", settings.general["weather"].show);
            $("#settings-general-weather-location").val(settings.general["weather"].location)
                                                   .prop("disabled", !settings.general["weather"].show)
                                                   .parent().toggleClass("text-muted", !settings.general["weather"].show);
            $("#settings-general-proxy").prop("checked", settings.general["proxy"]);
            $("#settings-style-font").val(settings.style["font"]);
            $("#settings-style-topbar-fix").prop("checked", settings.style["topbar"].fix);
            $("#settings-style-topbar-dark").prop("checked", settings.style["topbar"].dark);
            $("#settings-style-panel label.btn-" + settings.style["panel"]).click();
            $("#settings-style-background-image").data("val", settings.style["background"].image).prop("placeholder", "(unchanged)");
            $("#settings-style-background-repeat").prop("checked", settings.style["background"].repeat);
            $("#settings-style-background-centre").prop("checked", settings.style["background"].centre);
            $("#settings-style-background-fixed").prop("checked", settings.style["background"].fixed);
            $("#settings-style-background-stretch").prop("checked", settings.style["background"].stretch);
            $(".settings-style-background-check").prop("disabled", !settings.style["background"].image)
                                                 .next().toggleClass("text-muted", !settings.style["background"].image);
            $("#settings-style-customcss-enable").prop("checked", settings.style["customcss"].enable);
            $("#settings-style-customcss-content").prop("disabled", !settings.style["customcss"].enable).val(settings.style["customcss"].content);
        }
        switch (settings.style["background"].image) {
            case "":
                $("#settings-style-background-image").prop("placeholder", "(none)");
                break;
            case "../img/bg.png":
                $("#settings-style-background-image").prop("placeholder", "(default)");
                break;
        }
        // request list of fonts from FontSettings API
        chrome.fontSettings.getFontList(function fontsCallback(fonts) {
            for (var i in fonts) {
                $("#settings-style-font").append($("<option/>").text(fonts[i].displayName));
            }
            $("#settings-style-font").val(settings.style["font"]);
        });
        $("#settings-about-title").html(manif.name + " <small>" + manif.version + "</small>");
        // reset modal on show
        $("#settings").on("show.bs.modal", function(e) {
            $("#settings-alerts").empty();
            $(".form-group", "#settings-tab-links").removeClass("has-success has-error");
            $("#settings-style-panel label.active").removeClass("active");
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
        // notification permission requests
        $(".settings-perm input[type=checkbox]").change(function(e) {
            $("#settings-alerts").empty();
            // grant requried permissions for notification provider
            var id = this.id;
            var type = id.split("-").splice(2);
            var perms = ajaxPerms[type[0]];
            if (this.checked) {
                chrome.permissions.request({
                    origins: perms
                }, function(success) {
                    var check = $("#" + id);
                    if (success) {
                        check.closest(".settings-perm").removeClass("has-warning").addClass("has-success");
                    } else {
                        var text = "Permission denied for " + perms.join(", ") + ".";
                        $("#settings-alerts").append($("<div/>").addClass("alert alert-danger").text(text));
                        check.prop("checked", false).change();
                    }
                });
            }
        });
        // enable fields from checkbox selection
        $("#settings-notifs-gmail-enable").change(function(e) {
            $("#settings-notifs-gmail-accounts").prop("disabled", !this.checked);
            if (this.checked) $("#settings-notifs-gmail-accounts").focus();
        });
        $("#settings-notifs-ticktick-enable").change(function(e) {
            $("#settings-notifs-ticktick-due, #settings-notifs-ticktick-include").prop("disabled", !this.checked)
                                                                                 .parent().toggleClass("text-muted", !this.checked);
        });
        $("#settings-general-clock-show").change(function(e) {
            $("#settings-general-clock-twentyfour, #settings-general-clock-seconds").prop("disabled", !this.checked)
                                                                                    .parent().toggleClass("text-muted", !this.checked);
        });
        $("#settings-general-timer-countdown").change(function(e) {
            $("#settings-general-timer-beep").prop("disabled", !this.checked)
                                             .parent().toggleClass("text-muted", !this.checked);
        });
        $("#settings-general-weather-show").change(function(e) {
            $("#settings-general-weather-location").prop("disabled", !this.checked);
            if (this.checked) $("#settings-general-weather-location").focus();
        });
        // panel style group
        $("#settings-style-panel label").click(function(e) {
            $("input", this).prop("checked", true);
        });
        // background image selector
        $("#settings-style-background-image").on("input change", function(e) {
            // lose previous value on change
            $(this).data("val", "").prop("placeholder", "(none)");
            $(".settings-style-background-check").prop("disabled", !$(this).val()).next().toggleClass("text-muted", !$(this).val());
        });
        $("#settings-style-background-choose").click(function(e) {
            // trigger hidden input field
            $("#settings-alerts").empty();
            $("#settings-style-background-file").click();
        });
        $("#settings-style-background-file").change(function(e) {
            // if a file is selected
            if (this.files.length) {
                var file = this.files.item(0);
                // if an image
                if (file.type.match(/^image\//)) {
                    var reader = new FileReader;
                    reader.readAsDataURL(file);
                    reader.onload = function readerLoaded() {
                       $("#settings-style-background-image").data("val", reader.result).prop("placeholder", file.name).val("");
                       $("#settings-style-background-file").val("");
                    };
                } else {
                    $("#settings-alerts").append($("<div/>").addClass("alert alert-danger").text(file.name + " doesn't seem to be a valid image file."));
                }
            }
        });
        // clear image
        $("#settings-style-background-none").click(function(e) {
            $("#settings-style-background-image").data("val", "").prop("placeholder", "(none)").val("");
            $(".settings-style-background-check").prop("disabled", true).next().toggleClass("text-muted", true);
        });
        // reset to default stripes
        $("#settings-style-background-default").click(function(e) {
            $("#settings-style-background-image").data("val", "../img/bg.png").prop("placeholder", "(default)").val("");
            $("#settings-style-background-repeat").prop("checked", true);
            $("#settings-style-background-centre").prop("checked", true);
            $("#settings-style-background-fixed").prop("checked", false);
            $("#settings-style-background-stretch").prop("checked", false);
            $(".settings-style-background-check").prop("disabled", false).next().toggleClass("text-muted", false);
        });
        // custom CSS editor
        $("#settings-style-customcss-enable").change(function(e) {
            $("#settings-style-customcss-content").prop("disabled", !$(this).prop("checked")).focus();
        });
        // save and reload
        $("#settings-save").click(function(e) {
            $("#settings-alerts").empty();
            var ok = true;
            try {
                settings.links["content"] = JSON.parse($("#settings-links-content").val());
            } catch (e) {
                ok = false;
                $("#settings-alerts").append($("<div/>").addClass("alert alert-danger").text("The blocks source isn't valid JSON."));
                $($("#settings-tabs a")[0]).click();
            }
            settings.links["edit"] = {
                menu: $("#settings-links-edit-menu").prop("checked"),
                dragdrop: $("#settings-links-edit-dragdrop").prop("checked")
            };
            settings.bookmarks["bookmarklets"] = $("#settings-bookmarks-bookmarklets").prop("checked");
            settings.bookmarks["foldercontents"] = $("#settings-bookmarks-foldercontents").prop("checked");
            settings.bookmarks["split"] = $("#settings-bookmarks-split").prop("checked");
            settings.bookmarks["merge"] = $("#settings-bookmarks-merge").prop("checked");
            if (!$("#settings-history-limit").val()) $("#settings-history-limit").val("10");
            settings.history["limit"] = parseInt($("#settings-history-limit").val());
            var revoke = function revoke(key) {
                chrome.permissions.remove({
                    origins: ajaxPerms[key]
                }, function(success) {
                    if (!success) revokeError = true;
                });
            }
            var revokeError = false;
            settings.notifs["facebook"] = {
                enable: {
                    notifs: $("#settings-notifs-facebook-notifs").prop("checked"),
                    messages: $("#settings-notifs-facebook-messages").prop("checked"),
                    friends: $("#settings-notifs-facebook-friends").prop("checked")
                }
            };
            var off = true;
            for (var x in settings.notifs["facebook"].enable) {
                if (settings.notifs["facebook"].enable[x]) off = false;
                break;
            }
            if (off) revoke("facebook");
            settings.notifs["github"] = {
                enable: $("#settings-notifs-github-enable").prop("checked")
            };
            var accounts = $("#settings-notifs-gmail-accounts").val().replace(/[^0-9,]/g, "");
            if (accounts) {
                accounts = accounts.split(",");
                for (var i = accounts.length - 1; i >= 0; i--) {
                    accounts[i] = parseInt(accounts[i]);
                    if (isNaN(accounts[i])) accounts.splice(i, 1);
                }
            } else {
                accounts = [];
            }
            settings.notifs["gmail"] = {
                enable: $("#settings-notifs-gmail-enable").prop("checked"),
                accounts: accounts.sort()
            };
            settings.notifs["outlook"] = {
                enable: $("#settings-notifs-outlook-enable").prop("checked")
            };
            settings.notifs["steam"] = {
                enable: $("#settings-notifs-steam-enable").prop("checked")
            };
            settings.notifs["ticktick"] = {
                enable: $("#settings-notifs-ticktick-enable").prop("checked"),
                due: $("#settings-notifs-ticktick-due").prop("checked"),
                include: $("#settings-notifs-ticktick-include").prop("checked")
            };
            settings.notifs["twitter"] = {
                enable: $("#settings-notifs-twitter-enable").prop("checked")
            };
            $.each(settings.notifs, function(key, notif) {
                if (key === "facebook") return;
                if (!notif.enable) revoke(key);
            });
            if (!$("#settings-general-title").val()) $("#settings-general-title").val(manif.name);
            settings.general["title"] = $("#settings-general-title").val();
            settings.general["keyboard"] = $("#settings-general-keyboard").prop("checked");
            settings.general["clock"] = {
                show: $("#settings-general-clock-show").prop("checked"),
                twentyfour: $("#settings-general-clock-twentyfour").prop("checked"),
                seconds: $("#settings-general-clock-seconds").prop("checked")
            };
            settings.general["timer"] = {
                stopwatch: $("#settings-general-timer-stopwatch").prop("checked"),
                countdown: $("#settings-general-timer-countdown").prop("checked"),
                beep: $("#settings-general-timer-beep").prop("checked")
            };
            settings.general["weather"] = {
                show: $("#settings-general-weather-show").prop("checked"),
                location: $("#settings-general-weather-location").val()
            };
            if (!settings.general["weather"].location) settings.general["weather"].show = false;
            if (!settings.general["weather"].show) revoke("weather");
            settings.general["proxy"] = $("#settings-general-proxy").prop("checked");
            if (!settings.general["proxy"]) revoke("proxy");
            settings.style["font"] = $("#settings-style-font").val();
            settings.style["topbar"] = {
                fix: $("#settings-style-topbar-fix").prop("checked"),
                dark: $("#settings-style-topbar-dark").prop("checked")
            };
            settings.style["panel"] = $("#settings-style-panel label.active input").val();
            settings.style["background"] = {
                image: $("#settings-style-background-image").val() ? $("#settings-style-background-image").val() : $("#settings-style-background-image").data("val"),
                repeat: $("#settings-style-background-repeat").prop("checked"),
                centre: $("#settings-style-background-centre").prop("checked"),
                fixed: $("#settings-style-background-fixed").prop("checked"),
                stretch: $("#settings-style-background-stretch").prop("checked")
            };
            settings.style["customcss"] = {
                enable: $("#settings-style-customcss-content").val() && $("#settings-style-customcss-enable").prop("checked"),
                content: $("#settings-style-customcss-content").val()
            };
            if (ok) {
                // write to local storage
                chrome.storage.local.set(settings, function() {
                    if (chrome.runtime.lastError) {
                        alert("Unable to save: " + chrome.runtime.lastError.message);
                        return;
                    }
                    if (revokeError) {
                        alert("Failed to revoke some permissions: " + chrome.runtime.lastError.message);
                    }
                    // reload page
                    $("#settings").off("hidden.bs.modal").on("hidden.bs.modal", function(e) {
                        location.reload();
                    }).modal("hide");
                });
            }
        });
        // links selection state
        var linksHotkeys = {
            curBlk: -1,
            curBtn: -1,
            blk: []
        };
        var mousetrapStop = Mousetrap.stopCallback;
        // setup keyboard shortcuts on tab change
        var setupHotkeys = function setupHotkeys(e) {
            // close any open dropdown menus
            var closeDropdowns = function closeDropdowns() {
                $(".btn-group.open, .dropdown.open").removeClass("open");
                $("#links .panel-heading .btn").hide();
            };
            // number/cycle navigation for links
            var nums = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"];
            var off = "panel-" + settings.style["panel"];
            var on = "panel-" + (off === "panel-primary" ? "default" : "primary");
            var linksSelectBlk = function linksSelectBlk(i) {
                $("#links ." + on).removeClass(on).addClass(off);
                linksHotkeys.curBlk = i;
                $("#links :nth-child(" + (linksHotkeys.curBlk + 1) + ") .panel").removeClass(off).addClass(on);
                if (linksHotkeys.curBtn > -1) {
                    $(linksHotkeys.blk[linksHotkeys.curBtn]).off("blur");
                    $("i", linksHotkeys.blk[linksHotkeys.curBtn]).remove();
                }
                linksHotkeys.blk = $("#links :nth-child(" + (linksHotkeys.curBlk + 1) + ") .panel .panel-body .btn");
                linksSelectBtn(0);
            };
            var linksSelectBtn = function linksSelectBtn(i) {
                if (linksHotkeys.curBtn > -1) {
                    $(linksHotkeys.blk[linksHotkeys.curBtn]).off("blur");
                    $("i", linksHotkeys.blk[linksHotkeys.curBtn]).remove();
                }
                linksHotkeys.curBtn = i;
                $(linksHotkeys.blk[linksHotkeys.curBtn]).prepend(" ").prepend($("<i/>").addClass("fa fa-hand-o-right")).focus().blur(function(e) {
                    $(this).off("blur");
                    linksClearSel();
                });
            }
            var linksClearSel = function linksClearSel() {
                $("#links ." + on).removeClass(on).addClass(off);
                if (linksHotkeys.curBtn > -1) $("i", linksHotkeys.blk[linksHotkeys.curBtn]).remove();
                linksHotkeys = {
                    curBlk: -1,
                    curBtn: -1,
                    blk: []
                };
            };
            // clear current state
            Mousetrap.reset();
            linksClearSel();
            // restore escape to close modal if open
            var modal = $(document.body).hasClass("modal-open");
            if (modal) {
                Mousetrap.bind("esc", function(e, key) {
                    $(".modal.in").modal("hide");
                });
            }
            // enable all keyboard shortcuts
            if (settings.general["keyboard"]) {
                // global page switch keys
                if (!modal) {
                    if (!settings.bookmarks["merge"]) {
                        Mousetrap.bind(["l", "q"], function(e, key) {
                            closeDropdowns();
                            $("#menu-links").click();
                        }).bind(["b", "w"], function(e, key) {
                            closeDropdowns();
                            $("#menu-bookmarks").click();
                        });
                    }
                    Mousetrap.bind(["h", "e"], function(e, key) {
                        if ($("#history-title").parent().hasClass("open")) {
                            $("#history-title").parent().removeClass("open");
                        } else {
                            closeDropdowns();
                            $("#history-title").click();
                        }
                    }).bind(["n", "r"], function(e, key) {
                        if ($("#notifs-title").parent().hasClass("open")) {
                            $("#notifs-title").parent().removeClass("open");
                        } else {
                            closeDropdowns();
                            $("#notifs-title").click();
                        }
                    }).bind(["s", "t"], function(e, key) {
                        closeDropdowns();
                        $("#menu-settings a").click();
                    });
                }
                // if settings modal is open
                if ($(e.target).attr("id") === "settings" && e.type === "show") {
                    Mousetrap.bind(["tab", "shift+tab"], function(e, key) {
                        var sel = $("#settings-tabs li.active").index();
                        sel = (sel + (key === "tab" ? 1 : -1)) % $("#settings-tabs li").length;
                        if (sel < 0) sel += $("#settings-tabs li").length;
                        $($("#settings-tabs a")[sel]).click();
                        e.preventDefault();
                    }).bind("enter", function(e, key) {
                        $($("#settings .tab-pane.active input")[0]).focus();
                    }).bind("ctrl+enter", function(e, key) {
                        $("#settings-save").click();
                    });
                    // override stop callback to pause on button focus
                    Mousetrap.stopCallback = function(e, element) {
                        return element.tagName === "BUTTON" || mousetrapStop(e, element);
                    }
                } else {
                    // restore stop callback
                    Mousetrap.stopCallback = mousetrapStop;
                    // if links page is active
                    if ($("nav li.active").attr("id") === "menu-links" || settings.bookmarks["merge"]) {
                        Mousetrap.bind(nums, function(e, key) {
                            closeDropdowns();
                            // select block by number
                            linksSelectBlk(nums.indexOf(key));
                        }).bind(["-", "="], function(e, key) {
                            closeDropdowns();
                            // previous/next block
                            var i = (linksHotkeys.curBlk === -1 ? 0 : (linksHotkeys.curBlk + (key === "-" ? -1 : 1)) % $("#links .panel").length);
                            if (i < 0) i += $("#links .panel").length;
                            linksSelectBlk(i);
                        }).bind(["[", "]"], function(e, key) {
                            closeDropdowns();
                            // previous/next button
                            if (linksHotkeys.curBlk === -1) linksSelectBlk(0);
                            var i = (linksHotkeys.curBtn === -1 ? 0 : (linksHotkeys.curBtn + (key === "[" ? -1 : 1)) % linksHotkeys.blk.length);
                            if (i < 0) i += linksHotkeys.blk.length;
                            linksSelectBtn(i);
                        }).bind("enter", function(e, key) {
                            // clear selection
                            setTimeout(linksClearSel, 50);
                        }).bind("backspace", function(e, key) {
                            // clear selection and lose focus
                            if (linksHotkeys.curBtn > -1) $(linksHotkeys.blk[linksHotkeys.curBtn]).blur();
                        });
                    }
                }
            }
        };
        $("#menu-links, #menu-bookmarks").click(setupHotkeys);
        // manually adjust modal-open class as not available at event trigger
        $(".modal").on("show.bs.modal", function(e) {
            $(document.body).addClass("modal-open");
            setupHotkeys(e);
        }).on("hidden.bs.modal", function(e) {
            $(document.body).removeClass("modal-open");
            setupHotkeys(e);
        });
        if (settings.bookmarks["merge"]) {
            setupHotkeys({});
            // show both links and bookmarks, hide switch links
            $("#menu-links, #menu-bookmarks").hide();
            $(document.body).addClass("merge");
        } else {
            // open on links page
            $("#menu-links").click();
        }
        // show incognito state
        if (chrome.extension.inIncognitoContext) $(".incognito").removeClass("incognito");
        // fade in once all is loaded
        $(document.body).fadeIn();
    });
});
