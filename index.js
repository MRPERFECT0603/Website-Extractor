import puppeteer from "puppeteer";
import fs from "fs";

const url = "https://smartinbox.netlify.app";

(async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto(url, { waitUntil: "networkidle2" });

  const styles = await page.evaluate(() => {
    const elements = [...document.querySelectorAll("*")];

    const data = elements.map(el => {
      const style = window.getComputedStyle(el);
      return {
        tag: el.tagName.toLowerCase(),
        fontFamily: style.fontFamily,
        fontSize: style.fontSize,
        color: style.color,
        backgroundColor: style.backgroundColor
      };
    });

    return data;
  });

//   const uniqueFonts = [...new Set(styles.map(s => s.fontFamily))];
//   const uniqueColors = [...new Set(styles.map(s => s.color))];
//   const uniqueBackgrounds = [...new Set(styles.map(s => s.backgroundColor))];
//   const uniqueFontSizes = [...new Set(styles.map(s => s.fontSize))];

//   const designLanguage = {
//     fonts: uniqueFonts,
//     colors: {
//       text: uniqueColors,
//       backgrounds: uniqueBackgrounds
//     },
//     fontSizes: uniqueFontSizes
//   };

//   console.log("Extracted Design Language:\n", designLanguage);

  fs.writeFileSync("design-language.json", JSON.stringify(styles, null, 2));

  await browser.close();
})();