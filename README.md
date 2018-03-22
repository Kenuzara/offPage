# jQuery offPage

**Version:** 1.7<br />
**Author:** Chris McClean<br />
**Repo:** http://github.com/Kenuzara/jquery-offPage/ 

## Description

Javascript plugin that slides or pushes in a panel over the top of the active window's content to reveal an additional info.

## Requirements

jQuery 1.10 or greater
 
 
## Options (and their defaults)
```
animMethod:  'overlay',         // Accepts 2 options: 'overlay' or 'push', controls how the panel enters the viewport.
speed:       540,               // Accepts standard jQuery effects speeds (i.e. fast, normal or milliseconds)
direction:   'left',            // Direction offPage enters from, accepts 'left' or 'right' or 'up' or 'down'.
easing:      'easeInOutQuad',   // See ui_functions.js Effects -> Easing section for available easing options.
modal:       false,             // If set to true, you must explicitly close offPage using $.offPage.close();
iframe:      true,              // By default, linked pages are loaded into an iframe. Set this to false if you don't want an iframe.
href:        null,              // Override the source of the content. Optional in most cases, but required when opening offPage programmatically.
collapsible: false              // Toggles whether offPage can be collapsed or not (think Bootstrap collapsible panel), defaults to false. ONLY WORKS WITH UP/DOWN.
```

## Implementation

There are 2 ways to activate this plugin, either by drawing content from a pre-defined element as seen in the first example below.
Or programatically, as shown in the 2nd example. The 2nd method is useful if your panel content is being loaded dynamically onto the screen.

Whether you open the offPage programatically or not, you will need a trigger element to launch the offPage panel.

### Example 1
```
$(element).offPage(options);
```

### Example 2 (if using this method, the HREF option is **required**)
```
$.offPage({
  animMethod: 'overlay',
  direction: 'left',
  speed: 540,
  href: dataSrc,
});
```

## To Do
- [ ] Refactor collapse code
- [ ] Add ability to collapse horizontally opened offPage panels

## Copyright

Copyright (c) 2014-2018 Chris McClean | [wheelercentral.net](http://www.wheelercentral.net)<br />
Dual licensed under the MIT and GPL licenses.
