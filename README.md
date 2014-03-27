Introduction
============

Homely is a custom New Tab page replacement for Google Chrome.  It aims to provide a quick, customizable layout of links and menus, as well as simple bookmarks and history components.


Requirements
============

This project requires the following libraries:

* [Bootstrap](http://getboostrap.com)
* [jQuery](http://jquery.com)
* [HTML5 Sortable](http://farhadi.ir/projects/html5sortable/)

Batteries are not included - the CSS and JavaScript files need to be placed in a `lib` folder with appropriate `css` and `js` subfolders (check the HTML file for where files are linked to).


Links format
============

Links can be edited in JSON from the Settings modal.  The basic format is as follows:

Block
-----

```json
{
    "title": "Search Engines",
    "buttons": [...]
}
```

A block has a title, and holds one or more buttons.

Button
------

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

Menu
----

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
