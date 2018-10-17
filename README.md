# Custom select

## Description
This plugin allows you to replace the standard selected on their own, which can be styled as your heart desires. Default stylized standard select. Mechanic behavior as much as possible trying to match the standard selects.

## Demo
[view demo](https://codepen.io/k-ivan/pen/VQGpqz)

## How to use
Include the plugin styles
````html
<link rel="stylesheet" src="cselect.css">
````
Include the custom select plugin
````html
<script src="cselect.js"></script>
````
If you using a module bundler
````
npm i cselect --save
````
````scss
@import './node_modules/cselect/src/scss/cselect.scss'
````
````js
import CSelect from 'cselect'
````

Initialize the plugin
````javaScript
new CSelect(el, options);
````

## Options
Available options and default values

````javaScript
maxWidth      : null, // maximum width value
customClass   : '', // Additional class for more customization
animation     : null, // Toggle animation effect
showMaxOptions: null, // Number of visible items
onChange      : function () { } // Callback return the selected item info
````
Available animation classes fadeIn | slideInDown | slideInUp | zoomInDown or you can add your own.

### `onChnage()`
This method returns the following information `event type`, `selected value`, `selected text`, `selected index`.
