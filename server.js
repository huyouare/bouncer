const express = require('express');
const app = express();
const port = 3000;

app.use(express.json());
app.use(express.static('public'));

app.get('/', (req, res) => {
    return res.sendFile('index.html', {root: `${__dirname}/public`});
});

app.post('/action', async (req, res) => {

});

app.listen(port, () => console.log(`Listening on port ${port}`));

function exitHandler() {
    console.log('exiting');
    process.exit(0);
}

process.on('SIGINT', exitHandler);
// process.on('exit', exitHandler);
// process.on('uncaughtException', exitHandler);
