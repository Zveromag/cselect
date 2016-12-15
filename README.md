#Custom select

##Description

This "plug-in" allows you to replace the standard selected on their own, which can be styled as your heart desires. Default stylized standard select. Mechanic behavior as much as possible trying to match the standard selects.

##Initialization

````javaScript
$('.select').select();
````

##Demo
````html
<form action="" method="POST">
<span class="catalog-sort__name">Sort:</span>
    <select class="select" name="select">
      <option value="?sort=price-max">to increase prices</option>
      <option value="?sort=price-min">on price reduction</option>
      <option value="?sort=date">novelty</option>
    </select>
  <input type="submit" value="Send"/>
</form>
````
[view demo](https://codepen.io/Zveromag/pen/GjjvVx)

##Options

defaults values

````javaScript
//animates the appearance of the list. There are 4 kinds of animation, but you can expand on their own.
animations : ''

//types of animations
slideInUp
zoomInDown
slideInDown
fadeIn

//it allows you to set the maximum width of the drop-down list
maxWidth : 0

//this method allows you to get a value of the selected item.
onChange : function(){}
````