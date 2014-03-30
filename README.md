Introduction
============

Homely is a custom New Tab page replacement for Google Chrome.  It aims to provide a quick, customizable layout of links and menus, as well as simple bookmarks and history components.


Running from source
===================

This project requires the following libraries:

* [Bootstrap](http://getboostrap.com)
* [Font Awesome](http://fontawesome.io)
* [jQuery](http://jquery.com)
* [HTML5 Sortable](http://farhadi.ir/projects/html5sortable/)
* [Mousetrap](http://craig.is/killing/mice)

Batteries are not included - the CSS and JavaScript files need to be placed in a `lib` folder with appropriate `css` and `js` subfolders (check the HTML file for where files are linked to).


Using Homely
============

Keyboard shortcuts
------------------

If enabled, the page can be navigated by keyboard.  Note that Chrome will, by default, give focus to the onmibox when opening a new tab, so you must first `Tab` into the page.

### Global

* `Q` `W` `E` `R` `T` / `L` `B` `H` `N` `S` - switch to links/bookmarks/history/notifications/settings
* `Tab` `Shift+Tab` - scroll through dropdown options

### Links

* `1` ... `0` - select nth block (`0` for 10th)
* `-` `=` - select previous/next block
* `[` `]` - select previous/next button in block
* `Enter` - open link
* `Backspace` - clear selection

### Settings

* `Tab` `Shift+Tab` - cycle tabs (ignored if a form field is active)
* `Enter` - switch to fields in tab
* `Ctrl+Enter` - save and reload
* `Esc` - cancel

> Note: shortcuts are disabled whilst input fields (text boxes, selects, buttons) are currently focused.

Links format
------------

Links can be edited in JSON from the Settings modal.  The basic format is as follows:

### Block

A block has a title, and holds one or more buttons.

```json
{
    "title": "Search Engines",
    "buttons": [...]
}
```

### Button

A button can either be a simple link, or a dropdown containing many links.  Add `"external": true` to always open a link in a new tab.

```json
{
    "title": "Google",
    "url": "http://www.google.co.uk",
    "external": true,
    "style": "light"
}
```

```json
{
    "title": "Google",
    "menu": [...],
    "style": "dark"
}
```

The styles are that of Bootstrap (`default`, `primary`, `info`, `success`, `warning` and `danger`), plus `light` and `dark` for shades of grey.

### Menu

A menu is a list of links and headings, converted into groups of links (a new group starts at each heading).  To start a group without a heading, use the empty string `""` as the label.

```json
[
    {
        "title": "Worldwide",
        "url": "http://www.google.com"
    },
    {
        "title": "UK",
        "url": "http://www.google.co.uk"
    },
    "Tools",
    {
        "title": "Images",
        "url": "http://images.google.co.uk"
    },
    {
        "title": "Maps",
        "url": "http://maps.google.co.uk",
        "external": true
    }
]
```

With the above steps, you should end up with a block and dropdown like this:

![Search Engines example](http://i.imgur.com/V6jkCoj.png)

Notifications
-------------

Notification counts are acquired by scraping sites and reading numbers or counting unread notifications manually.  Enabling a notification option will prompt for the relevant permission in order to access the given website.  Disabling a notification option will not remove this - use the revoke all option to clear any given permissions.

In order to read arbitrary websites, the global permissions `http://*/` and/or `https://*/` must be granted.  If not (i.e. adding a permission just for a given site), it will be lost if the browser is restarted, unless explicitly declared in `optional_permissions` in the manifest (see [Chrome issue #158004](https://code.google.com/p/chromium/issues/detail?id=158004)).

> Note: if an option is later re-enabled, Chrome may not seek your permission to grant the permission, however all currently granted permissions can be seen from Chrome's extension settings page (chrome://extensions).

### Gmail

The Gmail notifier can be configured for multiple accounts by specifying the user indexes (as can be found in a Google URL with `?authuser=X` or `/u/X/`).  If a user is not signed in, or does not have a Gmail account, an Authentication Required dialog will display from attempting to access the feed unauthorized.

Incognito mode
--------------

If Homely is allowed to run in incognito mode, it will also display as the New Tab page of incognito windows.  It shares settings with normal windows, however history and notifications are disabled.
