# CSelect
[![alt text](https://img.shields.io/npm/v/cselect.svg)](https://www.npmjs.com/package/cselect)
[![alt text](https://img.shields.io/npm/l/cselect.svg)](https://www.npmjs.com/package/cselect)
[![alt text](https://img.shields.io/bundlephobia/min/cselect.svg)](https://www.npmjs.com/package/cselect)
[![alt text](https://img.shields.io/npm/dt/cselect.svg)](https://www.npmjs.com/package/cselect)

## Description
Custom select plugin allows you to replace the standard selected on their own, which can be styled as your heart desires. Default stylized standard select. Mechanic behavior as much as possible trying to match the standard selects.

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
Simple markup
````html
<select id="sel" name="select">
  <option value="1">1</option>
  <option value="2">2</option>
  <option value="3">3</option>
</select>
````
Initialize the plugin
````javaScript
var selectEl = document.querySelector('#sel');
new CSelect(selectEl);
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
