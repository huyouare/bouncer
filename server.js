const express = require('express');
const app = express();
const port = 3000;
const gpt = require('./gpt.js');

const { initBrowser, closeBrowser, performTask } = require('./puppeteer');

app.use(express.json());
app.use(express.static('public'));

(async () => {
    console.log('Opening browser..');
    await initBrowser();
    console.log('Browser opened');
})();

app.get('/', (req, res) => {
    return res.sendFile('index.html', {root: `${__dirname}/public`});
});

app.post('/action', async (req, res) => {
    let {task} = req.body;
    if (!task) return res.sendStatus(400);
    
    await performTask(task, res);
});

app.listen(port, () => console.log(`Listening on port ${port}`));

async function exitHandler() {
    console.log('Cleaning up..');
    await closeBrowser();
    process.exit(0);
}

process.on('SIGINT', exitHandler);
// process.on('exit', exitHandler);
// process.on('uncaughtException', exitHandler);
