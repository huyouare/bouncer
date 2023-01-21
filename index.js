const puppeteer = require('puppeteer');
let browser;

// let status = {};

/* Note: some websites may reject headless browsers, although it's possible to get past this
 * Resources: https://intoli.com/blog/not-possible-to-block-chrome-headless/chrome-headless-test.html
 * https://bot.incolumitas.com/
 */
const CONFIG = {
    BROWSER: {
        headless: false
    },
    VIEWPORT: {width: 1080, height: 1024}
};

const COMMANDS = {
    "NAV": async (url) => { // Open tab & navigate to `url`
        let page = await browser.newPage();
        await page.goto(url); // todo: waitUntil: load?

        // page.setDefaultNavigationTimeout(3_000);
        // await page.screenshot({path: `${__dirname}/screenshot.png`});
        
    }
};


const initBrowser = async () => await puppeteer.launch(CONFIG.BROWSER);
const getPageURLs = async () => (await browser.pages()).map(page => page.url());

/* Format:
 * <INSTRUCTION_NAME>PARAM1|PARAM2|...\n
 */
async function runCommands(str) {
    let delimiter = '|';
    for (let line of str.split('\n')) {
        line = line.trim();

        // Parse command
        if (!/^<(.*?)>(.*?)$/.test(line)) continue; // unable to parse line
        let idx = line.indexOf('>');
        let instruction = line.substr(0, idx).slice(1);
        let params = line.substr(idx + 1).split(delimiter);

        // Run command
        await COMMANDS[instruction].call(null, ...params);
    }
}

(async () => {
    browser = await initBrowser();

    // page = await browser.newPage();
    
    // await page.setViewport(CONFIG.VIEWPORT);

    // await page.goto("https://scale.com");
    await runCommands(`
<NAV> https://intoli.com/blog/not-possible-to-block-chrome-headless/chrome-headless-test.html
    `);

    console.log(await getPageURLs());

    setTimeout(async () => {
        await browser.close();
    }, 3_000)
})();

module.exports = { initBrowser };
