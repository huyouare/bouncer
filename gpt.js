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
You must add comments (prefixed by "#") to explain your reasoning for each action.

You can issue these commands:
<NAV> "URL" - navigate to the specified URL
<OPENEMAIL> INDEX - open the the email at index INDEX and store contents in the working buffer
<STORE> - append the working buffer to the storage buffer
<SUMMARIZE> - summarize the text in the working buffer
<OUTPUT> - output text stored in the storage buffer
// <LOAD> - copy storage buffer to working buffer
// <MAP> operation - assuming the working buffer has a list of items, it applies the operation to each element in the list

Here are some examples:

EXAMPLE 1:
==================================================
OBJECTIVE: Summarize my last 5 emails from yesterday
COMMANDS:
# navigate to gmail to open emails
NAV "gmail.com"
# Open the first email, then summarize, then store the summary into the text buffer
<OPENEMAIL> 0
<SUMMARIZE>
<STORE>
# Repeat the process with the second email
<OPENEMAIL> 1
<SUMMARIZE>
<STORE>
# repeat for the third, fourth, and fifth email
<OPENEMAIL> 2
<SUMMARIZE>
<STORE>
<OPENEMAIL> 3
<SUMMARIZE>
<STORE>
<OPENEMAIL> 4
<SUMMARIZE>
<STORE>
# all of the summarized emails have been stored in the text buffer, so we can now output to the user
<OUTPUT>
==================================================

The objective is below. Reply with your next command to the browser.

OBJECTIVE: ${objective}
COMMANDS:`;

async function query_model(browserContent, objective, currentUrl, previousCommand) {
    const my_prompt = createPromptBouncer(browserContent, objective, currentUrl, previousCommand);
    console.log(my_prompt);

    const completion = await openai.createCompletion    ({
        model: "text-davinci-003", // codex model: code-davinci-002
        prompt: createPromptBouncer(browserContent, objective, currentUrl, previousCommand),
    });

    // return completion.data.choices[0].text;
}

async function test() {
    response = await query_model('', 'Summarize my last 5 emails from yesterday', '', '');
    console.log(response);
}

test();
