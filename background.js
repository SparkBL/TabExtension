const puppeteer = require("puppeteer");

(async () => {
  const pathToExtension = require("path").join(__dirname, "my-extension");
  const browser = await puppeteer.launch({
    headless: false,
    args: [
      `--disable-extensions-except=${pathToExtension}`,
      `--load-extension=${pathToExtension}`,
    ],
  });
  const targets = await browser.targets();
  const backgroundPageTarget = targets.find(
    (target) => target.type() === "background_page"
  );
  const backgroundPage = await backgroundPageTarget.page();
  // Test the background page as you would any other page.
  await browser.close();
})();
