// // import puppeteer from "puppeteer";
// // import fs from "fs";

// // const url = "https://www.youtube.com/";

// // (async () => {
// //   const browser = await puppeteer.launch({ headless: true });
// //   const page = await browser.newPage();
// //   await page.goto(url, { waitUntil: "networkidle2" });

// //   // 1. Extract CSS variables (design tokens)
// //   const cssVars = await page.evaluate(() => {
// //     const styles = getComputedStyle(document.documentElement);
// //     const vars = {};
// //     for (let i = 0; i < styles.length; i++) {
// //       const prop = styles[i];
// //       if (prop.startsWith("--")) {
// //         vars[prop] = styles.getPropertyValue(prop).trim();
// //       }
// //     }
// //     return vars;
// //   });

// //   // 2. Extract stylesheets (raw CSS rules)
// //   const styleSheets = await page.evaluate(() => {
// //     return [...document.styleSheets]
// //       .map(sheet => {
// //         try {
// //           return [...sheet.cssRules].map(rule => rule.cssText).join("\n");
// //         } catch (e) {
// //           // Some stylesheets are blocked (cross-origin)
// //           return null;
// //         }
// //       })
// //       .filter(Boolean);
// //   });

// //   // 3. Extract unique computed styles
// //   const uniqueComputed = await page.evaluate(() => {
// //     const elements = [...document.querySelectorAll("*")];
// //     const unique = new Set();
// //     const data = [];

// //     elements.forEach(el => {
// //       const style = getComputedStyle(el);
// //       const key = `${style.fontFamily}|${style.fontSize}|${style.color}|${style.backgroundColor}`;
// //       if (!unique.has(key)) {
// //         unique.add(key);
// //         data.push({
// //           tag: el.tagName.toLowerCase(),
// //           fontFamily: style.fontFamily,
// //           fontSize: style.fontSize,
// //           color: style.color,
// //           backgroundColor: style.backgroundColor
// //         });
// //       }
// //     });

// //     return data;
// //   });

// //   // Final structured design language object
// //   const designLanguage = {
// //     tokens: cssVars,
// //     stylesheets: styleSheets,
// //     uniqueComputedStyles: uniqueComputed
// //   };

// //   // Save to file
// //   fs.writeFileSync("design-language.json", JSON.stringify(designLanguage, null, 2));

// //   console.log("✅ Design language extracted to design-language.json");

// //   await browser.close();
// // })();





// import puppeteer from "puppeteer";
// import fs from "fs";

// const url = "https://www.youtube.com/";

// (async () => {
//   const browser = await puppeteer.launch({ headless: true });
//   const page = await browser.newPage();

//   // Connect to CDP
//   const client = await page.target().createCDPSession();
//   await client.send("Network.enable");

//   // Capture CSS files
//   const cssResponses = [];
//   client.on("Network.responseReceived", async (event) => {
//     const { response } = event;
//     if (response.url.endsWith(".css")) {
//       try {
//         const data = await client.send("Network.getResponseBody", {
//           requestId: event.requestId,
//         });
//         cssResponses.push({
//           url: response.url,
//           text: data.body,
//         });
//       } catch (err) {
//         console.error("Failed to fetch CSS:", response.url, err.message);
//       }
//     }
//   });

//   await page.goto(url, { waitUntil: "networkidle2" });

//   // Save CSS to file
//   fs.writeFileSync("youtube-css.json", JSON.stringify(cssResponses, null, 2));

//   console.log("✅ Saved all CSS files to youtube-css.json");

//   await browser.close();
// })();

// index.js
import puppeteer from "puppeteer";
import fs from "fs";
import fetch from "node-fetch"; // Only needed if Node <18

const url = "https://www.quora.com/";

(async () => {
  // 1. Launch Puppeteer
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  try {
    // 2. Navigate to the page
    await page.goto(url, { waitUntil: "networkidle2" });

    // 3. Collect all external stylesheet URLs
    const styleSheetUrls = await page.evaluate(() =>
      [...document.styleSheets]
        .map((s) => s.href)
        .filter(Boolean) // only external CSS
    );

    console.log("Found stylesheets:", styleSheetUrls.length);

    // 4. Fetch CSS files via Node fetch
    const cssResponses = [];
    for (const href of styleSheetUrls) {
      try {
        console.log("Fetching:", href);
        const res = await fetch(href);
        if (!res.ok) {
          console.warn("Failed to fetch:", href, res.status);
          continue;
        }
        const text = await res.text();
        cssResponses.push({ url: href, text });
      } catch (err) {
        console.error("Error fetching CSS:", href, err.message);
      }
    }

    // 5. Save CSS content to JSON file
    fs.writeFileSync("quora-css.json", JSON.stringify(cssResponses, null, 2));
    console.log("✅ Saved all CSS files to quora-css.json");
  } catch (err) {
    console.error("Error during Puppeteer script:", err);
  } finally {
    await browser.close();
  }
})();