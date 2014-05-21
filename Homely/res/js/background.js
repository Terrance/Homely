var links;
chrome.omnibox.onInputStarted.addListener(function() {
    chrome.storage.local.get("links", function(store) {
        var newLinks = [];
        for (var i in store.links["content"]) {
            var blk = store.links["content"][i];
            for (var j in blk.buttons) {
                var btn = blk.buttons[j];
                if (btn.menu) {
                    for (var k in btn.menu) {
                        var item = btn.menu[k];
                        if (typeof(item) === "object" && item.url) {
                            if (!item.title) item.title = item.url;
                            if (btn.title) item.title = btn.title + " > " + item.title;
                            if (blk.title) item.title = blk.title + " > " + item.title;
                            newLinks.push(item);
                        }
                    }
                } else if (btn.url) {
                    if (!btn.title) btn.title = btn.url;
                    if (blk.title) btn.title = blk.title + " > " + btn.title;
                    newLinks.push(btn);
                }
            }
        }
        links = newLinks;
    });
});
chrome.omnibox.onInputChanged.addListener(function(text, suggest) {
    var matches = [];
    for (var i in links) {
        var source = links[i].title.toLowerCase();
        var index = source.indexOf(text.toLowerCase());
        if (index > -1) {
            var desc = links[i].title.substr(0, index)
                     + "<match>" + links[i].title.substr(index, text.length) + "</match>"
                     + links[i].title.substr(index + text.length)
                     + "  <url>" + links[i].url + "</url>";
            var match = {
                content: links[i].url,
                description: desc.replace(/&/g, "&amp;")
            }
            matches.push(match);
        }
    }
    suggest(matches);
});
chrome.omnibox.onInputEntered.addListener(function(text, disposition) {
    if (text.match(/^.*?:(\/\/)?/)) {
        switch (disposition) {
            case "currentTab":
                chrome.tabs.update({url: text});
                break;
            case "newForegroundTab":
                chrome.tabs.create({url: text});
                break;
            case "newBackgroundTab":
                chrome.tabs.create({url: text, active: false});
                break;
        }
    } else {
        if (disposition === "currentTab") {
            chrome.tabs.update({url: "chrome://newtab"});
        } else {
            chrome.tabs.create({url: "chrome://newtab"});
        }
    }
});
