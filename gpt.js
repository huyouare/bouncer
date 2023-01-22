require('dotenv').config();

/*
Ideas:
Download files from the computer
Play a song on X website - may be difficult
Find a funny youtube video for me to watch
Get the lyrics for X song
Find me an offline game for my Android phone to play on a airplane
Online booking: scheduling appointments and reservations for services such as hair salon, spa, or fitness classes.
*/

const { Configuration, OpenAIApi } = require("openai");

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

const createPromptBouncer = (browserContent, objective, currentUrl, previousCommand) => `
You are an agent controlling a browser. You are given:
    (1) an objective that you are trying to achieve
    (2) a working buffer (for temporary storage of text)
    (3) a storage buffer (for building the response to the user)

Your goal is to achieve the objective using a sequence of commands. 
The first command must be BEGIN and the last command must be END.
You must add comments (prefixed by "#") to explain your reasoning for each action.

You can issue these commands:
    <BEGIN> - start the sequence of commands
    <NAV> "URL" - navigate to the specified URL
    <OPENEMAIL> INDEX - open the the email at index INDEX and store contents in the working buffer
    <STORE> - append the working buffer to the storage buffer
    <SUMMARIZE> - summarize the text in the working buffer
    <OUTPUT> - output text stored in the storage buffer
    <LOAD> - copy storage buffer to working buffer
    <MAP> operation - assuming the working buffer has a list of items, it applies the operation to each element in the list
    <TWITTERACCOUNT> - get the twitter account of 
    <FILTER> -  given a list of items, filter the list according to a given filter criteria
    <GOOGLE> - return a list of the first 5 URLs
    <END> - finish the sequence of commands
      
Here are some examples:
EXAMPLE 1:
==================================================
OBJECTIVE: Summarize my last 5 emails from yesterday
COMMANDS:
BEGIN
# navigate to gmail to open emails
NAV https://mail.google.com/mail/u/0/h/
# Open the first email, then summarize, then store the summary into the text buffer
OPENEMAIL 0
SUMMARIZE
STORE
# Repeat the process with the second email
OPENEMAIL 1
SUMMARIZE
STORE
# repeat for the third, fourth, and fifth email
OPENEMAIL 2
SUMMARIZE
STORE
OPENEMAIL 3
SUMMARIZE
STORE
OPENEMAIL 4
SUMMARIZE
STORE
# all of the summarized emails have been stored in the text buffer, so we can now output to the user
OUTPUT
END
==================================================

EXAMPLE 2:
==================================================
OBJECTIVE: Find the twitter accounts of the first five people who emailed me.
COMMANDS:
BEGIN
# navigate to gmail to open emails
NAV https://mail.google.com/mail/u/0/h/
# Open the first email, get the author of the email, find their twitter account, then store the twitter handle into the text buffer
OPENEMAIL 0
GETAUTHOR
TWITTERACCOUNT
STORE
# Repeat the process with the second email
OPENEMAIL 1
GETAUTHOR
TWITTERACCOUNT
STORE
# repeat for the third, fourth, and fifth email
OPENEMAIL 2
GETAUTHOR
TWITTERACCOUNT
STORE
OPENEMAIL 3
GETAUTHOR
TWITTERACCOUNT
STORE
OPENEMAIL 4
GETAUTHOR
TWITTERACCOUNT
STORE
# all of the twitter accounts have been stored in the text buffer, so we can now output to the user
OUTPUT
END
==================================================

The objective is below. Reply with your next command to the browser.

OBJECTIVE: ${objective}
COMMANDS:`;

const stockPrompt = "Get the prices for each following stocks: Apple, Google, and Amazon."

const summarizeEmailPrompt = "Summarize my last 5 emails from yesterday."

async function query_model(browserContent, objective, currentUrl, previousCommand) {
    const my_prompt = createPromptBouncer(browserContent, objective, currentUrl, previousCommand);

    const completion = await openai.createCompletion({
        model: "text-davinci-003", // codex model: code-davinci-002
        prompt: my_prompt,
        temperature: 0.5,
        max_tokens: 1000,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0,
    });

    console.log(completion);
    return completion.data.choices[0].text;
}

async function runCompletion(prompt) {
    const res = await openai.createCompletion({
        model: "text-davinci-003",
        prompt: prompt,
    });

    return res.data.choices[0].text;
}

async function test() {
    response = await query_model('', summarizeEmailPrompt, '', '');
    console.log(response);
}

test();

module.exports = { runCompletion };
