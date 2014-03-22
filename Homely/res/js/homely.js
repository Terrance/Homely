$(document).ready(function() {
    var settings = {
        "links": {
            "content": "[]"
        },
        "bookmarks": {
            "bookmarklets": true
        },
        "history": {
            "limit": 10
        }
    };
    // attempt to parse settings from storage
    var next;
    for (var key in settings) {
        next = key;
        if (localStorage[key]) {
            try {
                $.extend(settings[key], JSON.parse(localStorage[key]));
            } catch (e) {
                $("nav").after($("<div/>").addClass("alert alert-danger").text("Unable to parse the " + next + " configuration!  Go to Settings to fix it."));
            }
        }
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
        tree[0].title = "Root";
        var route = [];
        var populate = function populate(root) {
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
                        populate(el);
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
                    populate(els[els.length - 1]);
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
        populate(tree[0]);
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
    $("#settings-links-content").val(JSON.stringify(settings.links["content"], undefined, 2));
    $("#settings-bookmarks-bookmarklets").prop("checked", settings.bookmarks["bookmarklets"]);
    $("#settings-history-limit").val(settings.history["limit"]);
    var man = chrome.runtime.getManifest();
    $("#settings-about-title").html(man.name + " <small>" + man.version + "</small>");
    $("#settings").on("hide.bs.modal", function(e) {
        $("#settings-alerts").empty();
        $("#settings-tab-links, #settings-tab-history").removeClass("has-success has-error");
    });
    $("#settings-links-content").focus(function(e) {
        $("#settings-tab-links").removeClass("has-success has-error");
    }).blur(function(e) {
        // validate JSON
        try {
            JSON.parse($(this).val());
            $("#settings-tab-links").addClass("has-success");
        } catch (e) {
            $("#settings-tab-links").addClass("has-error");
        }
    });
    $("#settings-history-limit").focus(function(e) {
        $("#settings-tab-history").removeClass("has-success has-error");
    }).blur(function(e) {
        // validate number
        if (isNaN(parseInt($(this).val()))) {
            $("#settings-tab-history").addClass("has-error");
        } else {
            $("#settings-tab-history").addClass("has-success");
        }
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
        settings.history["limit"] = parseInt($("#settings-history-limit").val());
        if (isNaN(settings.history.limit)) {
            ok = false;
            $("#settings-alerts").append($("<div/>").addClass("alert alert-danger").text("The history entry limit is invalid."));
        }
        if (ok) {
            // write to local storage
            for (var key in settings) {
                localStorage[key] = JSON.stringify(settings[key]);
            }
            // reload
            $("#settings").on("hidden.bs.modal", function(e) {
                location.reload();
            }).modal("hide");
        }
    });
});
