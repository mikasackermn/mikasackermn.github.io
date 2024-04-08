// e.g., whether the user wants copying to use a hashtag or not
var settings = {
  copyWithHashtag: false,
};

// parse an input string, looking for any number of hexadecimal color
// values, possibly with whitespace or garbage in between.  Return an array of
// color values. Supports hex shorthand.
function parseColorValues(colorValues) {
  var colorValuesArray = colorValues.match(/\b[0-9A-Fa-f]{3}\b|[0-9A-Fa-f]{6}\b/g);
  if (colorValuesArray) {
    colorValuesArray = colorValuesArray.map(function (item) {
      if (item.length === 3) {
        var newItem = item.toString().split("");
        newItem = newItem.reduce(function (acc, it) {
          return acc + it + it;
        }, "");
        return newItem;
      }

      return item;
    });
  }

  return colorValuesArray; // this could be null if there are no matches
}

// pad a hexadecimal string with zeros if it needs it
function pad(number, length) {
  var str = "" + number;
  while (str.length < length) {
    str = "0" + str;
  }
  return str;
}

// convert a hex string into an object with red, green, blue numeric properties
// '501214' => { red: 80, green: 18, blue: 20 }
function hexToRGB(colorValue) {
  return {
    red: parseInt(colorValue.substr(0, 2), 16),
    green: parseInt(colorValue.substr(2, 2), 16),
    blue: parseInt(colorValue.substr(4, 2), 16),
  };
}

// convert an integer to a 2-char hex string
// for sanity, round it and ensure it is between 0 and 255
// 43 => '2b'
function intToHex(rgbint) {
  return pad(Math.min(Math.max(Math.round(rgbint), 0), 255).toString(16), 2);
}

// convert one of our rgb color objects to a full hex color string
// { red: 80, green: 18, blue: 20 } => '501214'
function rgbToHex(rgb) {
  return intToHex(rgb.red) + intToHex(rgb.green) + intToHex(rgb.blue);
}

// shade one of our rgb color objects to a distance of i*10%
// ({ red: 80, green: 18, blue: 20 }, 1) => { red: 72, green: 16, blue: 18 }
function rgbShade(rgb, i, mode) {
  var percent = mode === "normal" ? 0.2 : 0.1;

  return {
    red: rgb.red * (1 - percent * i),
    green: rgb.green * (1 - percent * i),
    blue: rgb.blue * (1 - percent * i),
  };
}

// tint one of our rgb color objects to a distance of i*10%
// ({ red: 80, green: 18, blue: 20 }, 1) => { red: 98, green: 42, blue: 44 }
function rgbTint(rgb, i, mode) {
  var percent = mode === "normal" ? 0.2 : 0.1;

  return {
    red: rgb.red + (255 - rgb.red) * i * percent,
    green: rgb.green + (255 - rgb.green) * i * percent,
    blue: rgb.blue + (255 - rgb.blue) * i * percent,
  };
}

// take a hex color string and produce a list of 10 tints or shades of that color
// shadeOrTint should be either `rgbShade` or `rgbTint`, as defined above
// this allows us to use `calculate` for both shade and tint
function calculate(colorValue, shadeOrTint, mode) {
  var color = hexToRGB(colorValue);
  var shadeValues = [];
  var shadeValuesLength = mode === "normal" ? 5 : 9;
  for (var i = 1; i < shadeValuesLength; i++) {
    shadeValues[i - 1] = rgbToHex(shadeOrTint(color, i, mode));
  }
  return shadeValues;
}

// given a color value, return an array of ten shades in 10% increments
function calculateShades(colorValue, mode) {
  return calculate(colorValue, rgbShade, mode);
}

// given a color value, return an array of ten tints in 10% increments
function calculateTints(colorValue, mode) {
  return calculate(colorValue, rgbTint, mode);
}

function updateClipboardData() {
  // basically, all cells that have a data-clipboard-text attribute
  var colorCells = $("#tints-and-shades td[data-clipboard-text]");
  $.each(colorCells, function (i, cell) {
    var colorCode = $(cell).attr("data-clipboard-text");

    if (settings.copyWithHashtag) {
      $(cell).attr("data-clipboard-text", "#" + colorCode);
    } else {
      // strip the existing hashtag from the color code
      $(cell).attr("data-clipboard-text", colorCode.substr(1));
    }
  });
}

// create a table row holding either the color values as blocks of color
// or the hexadecimal color values in table cells, depending on the
// parameter 'displayType'
function makeTableRowColors(colors, displayType) {
  var tableRow = "<tr>";
  for (var i = 0; i < colors.length; i++) {
    var color = colors[i].toString(16);
    if (displayType == "colors") {
      // make a row of colors
      // we have to account for the prefix here in case the user toggled the checkbox before generating another palette
      var colorPrefix = settings.copyWithHashtag ? "#" : "";
      tableRow +=
        '<td tabindex="0" role="button" aria-label="Color swatch" class="hex-color" style="background-color:' +
        "#" +
        color +
        '" data-clipboard-text="' +
        colorPrefix +
        color +
        '"></td>';
    } else {
      // make a row of RGB values
      tableRow += '<td class="hex-value">' + color.toUpperCase() + "</td>";
    }
  }
  tableRow += "</tr>";
  return tableRow;
}

function createTintsAndShades(firstTime) {
  var parsedColorsArray = parseColorValues($("#color-values").val());
  if (parsedColorsArray !== null) {
    // make sure we got value color values back from parsing
    var colorDisplayRows = []; // holds html table rows for the colors to display
    var extraColorDisplayRows = []; // holds html table rows for the colors to display

    var tableRowCounter = 0;
    var extraTableRowCounter = 0;

    for (var i = 0; i < parsedColorsArray.length; i++) {
      // iterate through each inputted color value

      // calculate an array of shades from the inputted color, then make a table row
      // from the shades, and a second table row for the hex values of the shades
      var calculatedShades = calculateShades(parsedColorsArray[i], "normal");
      // calculate an array of tints from the inputted color, then make a table row
      // from the tints, and a second table row for the hex values of the tints
      var calculatedTints = calculateTints(parsedColorsArray[i], "normal")
        .reverse()
        .concat(parsedColorsArray[i]);
      var calculatedShadesAndTints = calculatedTints.concat(calculatedShades);

      colorDisplayRows[tableRowCounter] = makeTableRowColors(calculatedShadesAndTints, "colors");
      tableRowCounter++;
      colorDisplayRows[tableRowCounter] = makeTableRowColors(calculatedShadesAndTints, "RGBValues");
      tableRowCounter++;

      // extra mode
      var calculatedExtraShades = calculateShades(parsedColorsArray[i], "extra");
      var calculatedExtraTints = calculateTints(parsedColorsArray[i], "extra")
        .reverse()
        .concat(parsedColorsArray[i]);
      var calculatedExtraShadesAndTints = calculatedExtraTints.concat(calculatedExtraShades);

      extraColorDisplayRows[extraTableRowCounter] = makeTableRowColors(
        calculatedExtraShadesAndTints,
        "colors",
      );
      extraTableRowCounter++;
      extraColorDisplayRows[extraTableRowCounter] = makeTableRowColors(
        calculatedExtraShadesAndTints,
        "RGBValues",
      );
      extraTableRowCounter++;
    }

    // wrap the rows into an HTML table with a hard-coded header row
    var colorDisplayNormalTable =
      '<table><thead><tr class="table-header"><td><span>100</span></td><td><span>200</span></td><td><span>300</span></td><td><span>400</span></td><td><span>500</span></td><td><span>600</span></td><td><span>700</span></td><td><span>800</span></td><td><span>900</span></td></tr></thead>' +
      colorDisplayRows.join("") +
      "</table>";
    var colorDisplayExtraTable =
      '<table><thead><tr class="table-header"><td><span>100</span></td><td><span>150</span></td><td><span>200</span></td><td><span>250</span></td><td><span>300</span></td><td><span>350</span></td><td><span>400</span></td><td><span>450</span></td><td><span>500</span></td><td><span>550</span></td><td><span>600</span></td><td><span>650</span></td><td><span>700</span></td><td><span>750</span></td><td><span>800</span></td><td><span>850</span></td><td><span>900</span></td></thead>' +
      extraColorDisplayRows.join("") +
      "</table>";
    // replace tints-and-shades div with color display table wrapped by the same div
    $("#normal #tints-and-shades").html(colorDisplayNormalTable);
    $("#extra #tints-and-shades").html(colorDisplayExtraTable);

    // set url hash to a comma seperated list of hex codes
    window.location.hash = parsedColorsArray.join(",");

    // scroll down to show the tints-and-shades div
    $("html,body").animate({ scrollTop: $("#ts-scroll-top").offset().top }, 400);

    // set focus to the color display table after 400 milliseconds
    setTimeout(function () {
      $("#tints-and-shades").attr("tabindex", "0");
      $("#tints-and-shades").focus();
    }, 400);

    // when color display table loses focus, make it not focusable again
    $("#tints-and-shades").blur(function () {
      $("#tints-and-shades").attr("tabindex", "-1");
    });
  } else if (firstTime != true) {
    // doesn't run on page load (the first time it runs)
    // scroll back to top of page
    $("html,body")
      .stop()
      .animate({ scrollTop: 0 }, 200, function () {
        // remove any existing content from tints-and-shades div
        $("#tints-and-shades").html("");

        // reset the url hash
        window.location.hash = "";

        // show warning
        $("#warning").addClass("visible");

        // hide warning after 3 seconds
        setTimeout(function () {
          $("#warning").removeClass("visible");
        }, 3000);
      });

    // set focus back to the text area
    $("#color-values").focus();
  }
  return false;
}

// main application code. Parse the inputted color numbers, make an HTML
// with the colors in it, and render the table into the page.
$(document).ready(function () {
  // get url hash and set it as the text area value
  $("#color-values").val(window.location.hash.slice(1).replace(/,/g, " "));

  // create tints and shades with hash hex codes
  createTintsAndShades(true);

  // connect the form submit button to all of the guts
  $("#color-entry-form").submit(createTintsAndShades);

  $("#copy-with-hashtag").on("change", function (e) {
    settings.copyWithHashtag = e.target.checked;
    // this will just fail-fast if the tables haven't been generated yet
    updateClipboardData();
  });
});

// Checks if the enter key is pressed and simulates a click on the focused element
$(document).keypress(function (event) {
  if ((event.keyCode ? event.keyCode : event.which) == "13") $(":focus").click();
});

// Show a new Carbon ad every time certain elements are clicked
$(document).on("click", "#make", function () {
  // If the ad hasn't loaded yet, don't refresh it while it's still loading, or it will return two (or more) ads
  if (!$("#carbonads")[0]) return;
  // If the script hasn't loaded, don't try calling it
  if (typeof _carbonads !== "undefined") _carbonads.refresh();
});
