# Color Tinter and Shader
_from the [Texas State University](http://txstate.edu) web team_

## Purpose
The purpose of this tool is to accurately produce tints and shades in 10% increments based on a given base hex color.

## Why 10% Increments?
That's the standard we use in our design process at Texas State University. We believe choosing colors based on a flat percentage is a clean, reproducible way to create tint and shade color palettes.

## Calculations
We take the hex color input and convert it to RGB. Then we take each component from the RGB color and perform the following calculations before rounding and converting back to hex.
* **Tints:** New value = current value + ((255 - current value) x tint factor)
* **Shades:** New value = current value x tint factor

## Example Calculation
Let's say we want tints and shades of Rebecca Purple, #663399.

### 10% Lighter Tint
* #663399 is converted to the RGB equivalent of 102, 51, 153
* **R:** 102 + ((255 - 102) x .1) = 117.3, rounded to 117
* **G:** 51 + ((255 - 51) x .1) = 71.4, rounded to 71
* **B:** 153 + ((255 - 153) x .1) = 163.2, rounded to 163
* RGB 117, 71, 163 is converted to the hex equivalent of #7547A3

### 10% Darker Shade
* #663399 is converted to the RGB equivalent of 102, 51, 153
* **R:** 102 x .9 = 91.8, rounded to 92
* **G:** 51 x .9 = 45.9, rounded to 46
* **B:** 153 x .9 = 137.7, rounded to 138
* RGB 92, 46, 138 is converted to the hex equivalent of #5C2E8A

## Attribution
This application is remixed from [North Krimsly's](http://highintegritydesign.com/) original [Color Tinter-Shader](http://highintegritydesign.com/tools/tinter-shader) with some key modifications made to the calculation method.

## Resources
* Convert hex (or just about anything) to RGB: [http://rgb.to/](http://rgb.to/)
* Further Explanation of the calculation method: [Stack Overflow](http://stackoverflow.com/questions/6615002/given-an-rgb-value-how-do-i-create-a-tint-or-shade)