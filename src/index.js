const fs = require("fs");
const mustache = require("mustache");
const Color = require("color");
const _ = require("lodash");

const variants = ["Bright", "Dark"];
const ansiMapping = {
  0: "normal.black",
  1: "normal.red",
  2: "normal.green",
  3: "normal.yellow",
  4: "normal.blue",
  5: "normal.magenta",
  6: "normal.cyan",
  7: "normal.white",
  8: "bright.black",
  9: "bright.red",
  10: "bright.green",
  11: "bright.yellow",
  12: "bright.blue",
  13: "bright.magenta",
  14: "bright.cyan",
  15: "bright.white",
};

const itermColors = (globals) => {
  const ansiColors = Object.keys(ansiMapping)
    .map((n) => n.toString())
    .sort()
    .map((numberString) => {
      const number = Number.parseInt(numberString);
      const c = Color(_.get(globals, `${"ansi"}.${ansiMapping[number]}`));

      return {
        number,
        a: c.alpha(),
        r: c.red() / 255.0,
        g: c.green() / 255.0,
        b: c.blue() / 255.0,
      };
    });

  const colorMapping = [
    ["Background Color", "ui.background"],
    ["Badge Color", "ui.secondaryAccentAlt", "alpha.low"],
    ["Bold Color", "ui.secondaryAccentAlt"],
    ["Cursor Color", "ui.accentAlt", "alpha.med"],
    ["Cursor Guide Color", "ansi.normal.black"],
    ["Cursor Text Color", "ui.lightText"],
    ["Link Color", "ui.secondaryAccentAlt"],
    ["Selected Text Color", "ui.lightText", "alpha.none"],
    ["Selection Color", "ui.accentAlt", "alpha.medLow"],
    ["Tab Color", "ansi.normal.black"],
  ];

  const colors = colorMapping.map(([n, accessor, alpha]) => {
    let color;
    if (alpha) {
      color = `${_.get(globals, accessor)}${_.get(globals, alpha)}`;
    } else {
      color = `${_.get(globals, accessor)}`;
    }

    const c = Color(color);
    return {
      key: n,
      a: c.alpha(),
      r: c.red() / 255.0,
      g: c.green() / 255.0,
      b: c.blue() / 255.0,
    };
  });

  return { ansiColors, colors };
};

variants.forEach((vCap) => {
  const v = vCap.toLowerCase();
  const globals = require(`./${v}/globals`);
  const vsTemplate = JSON.stringify(require(`${__dirname}/${v}/template.json`));
  const themeNames = ["", "-italic", "-bold"].map((suf) => `dusk-${v}${suf}`);

  themeNames.forEach((n) => {
    const content = require(`${__dirname}/${v}/${n}.json`);
    const theme = mustache.render(vsTemplate, { ...content, ...globals });
    fs.writeFileSync(`${__dirname}/../themes/${n}.json`, theme);
  });

  const itermTemplate = fs
    .readFileSync(`${__dirname}/iterm.mustache`)
    .toString();
  const colors = itermColors(globals);
  const itermTheme = mustache.render(itermTemplate, colors);
  fs.writeFileSync(
    `${__dirname}/../themes/Dusk ${vCap}.itermcolors`,
    itermTheme
  );
});
