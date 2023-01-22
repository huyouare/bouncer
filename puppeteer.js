const fs = require('fs').promises;

const { runCompletion, query_model } = require('./gpt');
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
WORKING_BUFFER = "";
STORAGE_BUFFER = "";

const SCRAPERS = {
    "GMAIL_EMAIL": async (page, nthEmail) => {
        let homeUrl = page.url();
        let url = await page.evaluate(nthEmail => {
            let emails = [...document.querySelector('table[bgcolor="#C3D9FF"]').nextElementSibling.firstChild.children];
            emails.splice(-1);
            return emails[nthEmail].querySelector('a').href;
        }, nthEmail);
        await page.goto(url); // open email
        let emailInfo = await page.evaluate(() => {
            let subject = document.querySelector('font[size="+1"]');
            let contentBody = subject.parentElement.parentElement.parentElement.parentElement.parentElement.nextElementSibling.firstChild.firstChild.firstChild.children[1].firstChild;
            // TODO: handle emails with replies
            let sender = contentBody.children[0].innerText;
            let messageContent = contentBody.children[3].innerText;
            return {subject: subject.innerText, sender, messageContent};
        });
        await page.goto(homeUrl); // return to original page
        return emailInfo;
    }
};

const COMMANDS = {
    "NAV": async (url) => { // Open tab & navigate to `url`
        let page = await browser.newPage();
        let cookies = await fs.readFile('./cookies.json');
        cookies = JSON.parse(cookies);
        await page.setCookie(...cookies);
        await page.goto(url); // todo: waitUntil: load?

        // page.setDefaultNavigationTimeout(3_000);
        // await page.screenshot({path: `${__dirname}/screenshot.png`});
        
    },
    "STORE": async () => {
        STORAGE_BUFFER += WORKING_BUFFER + '\n';
    },
    "LOAD": async () => {
        WORKING_BUFFER = STORAGE_BUFFER;
    },
    "SUMMARIZE": async () => {
        // runCompletion
        const summary = await runCompletion("Summarize the following text: \n" + WORKING_BUFFER);

        WORKING_BUFFER = summary;

    },
    "MAP": async (func) => {
        const mapped = await runCompletion( "Apply the following function to each item in the list below:\nFUNCTION:" 
        + func + "\nLIST:" + WORKING_BUFFER + "\nMAPPED LIST:");

        WORKING_BUFFER = mapped;
    },
    
    "FILTER": async (criteria) => {
        const filtered = await runCompletion("Filter the following list of items according to the criteria below.\nCRITERIA:" 
            + criteria + "\nLIST:" + WORKING_BUFFER + "\nFILTERED:");

        WORKING_BUFFER = filtered;
    },
    "OUTPUT": async (prompt, res) => {
        let output = await runCompletion("Generate the response to the following prompt: \n" + prompt + "\n With the following information" + STORAGE_BUFFER + "\n RESPONSE:");
        res.send(output);
    },
    "TWITTERACCOUNT": async (name, res) => {
        // Gets the Twitter account of "Firstname Lastname". Works for famous people with unique names.
        let output = await runCompletion("What is the twitter username of " + name + "? Return only one word, the twitter username of this person, preceded by @.");
        res.send(output);
    },
    "GETAUTHOR": async (email, res) => {
        // Gets the author of an email message.
        let output = await runCompletion("Find the author of the following email message: \n" + email + "\nAUTHOR:");
        res.send(output);
    },
    "GOOGLE": async (searchTerm) => {
        let page = await browser.newPage();
        await page.goto(`https://www.google.com/search?q=${searchTerm}`);
    
        let urls = await page.evaluate(() => {
            let results = [...document.querySelectorAll('h3.LC20lb')];
            return results.map(result => result.innerText.trim());
        });

        WORKING_BUFFER = urls.slice(0, 5).join('\n'); // Store the first 5 URLs in the WORKING_BUFFER
    },
    "YOUTUBE": async (searchTerm) => {
        let page = await browser.newPage();
        await page.goto(`https://www.google.com/search?q=${searchTerm}%20site:www.youtube.com/watch`);
    
        let urls = await page.evaluate(() => {
            let results = [...document.querySelectorAll('h3.LC20lb')];
            return results.map(result => result.innerText.trim());
        });

        WORKING_BUFFER = urls.slice(0, 5).join('\n'); // Store the first 5 URLs in the WORKING_BUFFER
    },
    "OPENEMAIL": async (nthEmail) => { // assumes *exactly* one gmail page open
        try {
            console.log(`nthEmail: ${nthEmail}`);
            let page = (await browser.pages()).filter(page => page.url().indexOf('google.com/mail/u') !== -1)[0];
            let {subject, sender, messageContent} = await SCRAPERS["GMAIL_EMAIL"](page, nthEmail);

            WORKING_BUFFER = `Email #${nthEmail}\nSender: ${sender}\nSubject: ${subject}\nContent: ${messageContent}\n`;
            // console.log('changed working buffer. new working buffer:', WORKING_BUFFER);
        } catch (e) {
            console.log(e);
        }
    },
    "BEGIN": async () => {
        return;
    },
    "END": async () => {
        let pages = await browser.pages();
        for (let page of pages) {
            if (page.url() == 'about:blank') continue;
            page.close();
        }
        return;
    }

};

async function performTask(task, res) {
    // <NAV> https://intoli.com/blog/not-possible-to-block-chrome-headless/chrome-headless-test.html
    // await runCommands(`
    // NAV https://mail.google.com/mail/u/0/h/
    // OPENEMAIL 0
    // SUMMARIZE
    // STORE
    // OUTPUT What is the content of my summarized email?`, res);
    // res.send(`ack: ${task}`);
    console.log('Querying model for task:', task);
    const response = await query_model('', task, '', '');
    console.log('Instructions:', response);
    await runCommands(response, res);
}

const initBrowser = async () => {
    browser = await puppeteer.launch(CONFIG.BROWSER);
    // let page = await browser.newPage();
    //     await page.goto("https://accounts.google.com/v3/signin/identifier?dsh=S-2063146824%3A1674343777686369&continue=https%3A%2F%2Fmail.google.com%2Fmail%2Fu%2F0%2F&emr=1&followup=https%3A%2F%2Fmail.google.com%2Fmail%2Fu%2F0%2F&osid=1&passive=1209600&service=mail&flowName=GlifWebSignIn&flowEntry=ServiceLogin&ifkv=AWnogHd8T3J8Q6AAwMEAxYE6a2EVucwfKXPxqQ5k-mr7UjPsOkaPpDU9KSCdOm1Xl-w8uGtKqEwxGg"); // todo: waitUntil: load?
    // setTimeout(async () => {
    //     const cookies = await page.cookies();
    //     await fs.writeFile('./cookies.json', JSON.stringify(cookies, null, 2));
    //     console.log("SAVED");
    // }, 20_000)
}
const closeBrowser = async () => await browser.close();
// const getPageURLs = async () => (await browser.pages()).map(page => page.url());

/* Format:
 * <INSTRUCTION_NAME>PARAM1|PARAM2|...\n
 */
async function runCommands(str, res) {
    let delimiter = '|';
    for (let line of str.split('\n')) {
        line = line.trim();

        // Parse command
        if (/^#/.test(line) || !line) continue; // comment or empty
        // let idx = line.indexOf('>');
        let idx = line.indexOf(' ')
        if (idx == -1) idx = line.length; // no params
        let instruction = line.substr(0, idx);
        let params = line.substr(idx + 1).split(delimiter).map(p => p.trim());
        if (instruction === 'OUTPUT') params.push(res);

        // Run command
        try {
            if (!COMMANDS[instruction]) {
                console.log(`Instruction "${instruction}" does not exist. Skipping..`);
                continue;
            }
            await COMMANDS[instruction].call(null, ...params);
        } catch (e) {
            console.log(`Error calling: ${instruction}`, e);
        }
    }
}

module.exports = { initBrowser, closeBrowser, performTask };
