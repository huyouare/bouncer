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
const { encode } = require('gpt-3-encoder');

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

const createPromptBouncerV1_1 = (browserContent, objective, currentUrl, previousCommand) => `
You are a powerful language model agent controlling a browser.
Your goal is to produce the provided objective to completion.

You are given:
    (1) an objective that you are trying to achieve
    (2) a working buffer (for temporary storage of text)
    (3) a storage buffer (for building the response to the user)

Your goal is to achieve the objective using a sequence of commands.
The first command must be BEGIN and the last command must be END.
You should not use any commands that are not listed below.
You must add comments (prefixed by "#") to explain your reasoning for each action.

You can ONLY issue these commands:
    - <BEGIN> - start the sequence of commands
    - <NAV> "URL" - navigate to the specified URL
    - <OPENEMAIL> INDEX - open the the email at index INDEX and store contents in the working buffer
    - <STORE> - append the working buffer to the storage buffer
    - <SUMMARIZE> - summarize the text in the working buffer
    - <OUTPUT> OBJECTIVE - output text stored in the storage buffer. Needs to begin with the objective provided.
    - <LOAD> - copy storage buffer to working buffer
    - <MAP> operation - assuming the working buffer has a list of items, it applies the operation to each element in the list
    - <FILTER> - given a list of items, filter the list according to a given filter criteria
    - <GOOGLE> term - return a list of the first 5 URLs for the google search 'term'
    - <YOUTUBE> term - return a relevant YouTube video
    - <END> - finish the sequence of commands
If 

Here are some examples:
EXAMPLE 1:
OBJECTIVE: Summarize my last 3 emails from yesterday
COMMANDS:
BEGIN
# navigate to gmail to open emails
NAV https://mail.google.com/mail/u/0/h/
# Open the first email, then summarize, then store the summary into the text buffer
# emails are sorted in reverse chronological order, with 0 being the most recent (aka last) email, 1 being second most recent, etc..
OPENEMAIL 0
SUMMARIZE
STORE
# Repeat the process with the second email
OPENEMAIL 1
SUMMARIZE
STORE
# repeat for the third out of 3 emails
OPENEMAIL 2
SUMMARIZE
STORE
# all of the summarized emails have been stored in the text buffer, so we can now output to the user
OUTPUT Summarize my last 3 emails from yesterday
END

EXAMPLE 2:
OBJECTIVE: Return the first 3 results for the google search Scale AI reworded like a pirate
COMMANDS:
BEGIN
# get the names of the first 5 results in working memory
GOOGLE ScaleAI
# filter working memory to be the first three items
FILTER first three items
# convert the first three items to pirate speak
MAP pirate speak
STORE
OUTPUT
END

EXAMPLE 3:
OBJECTIVE: ${objective}
COMMANDS:`;

const createPromptBouncer = (browserContent, objective, currentUrl, previousCommand) => `
You are an agent controlling a browser. You are given:
    (1) an objective that you are trying to achieve
    (2) a working buffer (for temporary storage of text)
    (3) a storage buffer (for building the response to the user)

Your goal is to achieve the objective using a sequence of commands. 
The first command must be BEGIN and the last command must be END.
You must add comments (prefixed by "#") to explain your reasoning for each action.

You can issue these commands:
    - <BEGIN> - start the sequence of commands
    - <NAV> "URL" - navigate to the specified URL
    - <OPENEMAIL> INDEX - open the the email at index INDEX and store contents in the working buffer
    - <STORE> - append the working buffer to the storage buffer
    - <SUMMARIZE> - summarize the text in the working buffer
    - <OUTPUT> OBJECTIVE - output text stored in the storage buffer. Needs to begin with the objective provided.
    - <LOAD> - copy storage buffer to working buffer
    - <MAP> operation - assuming the working buffer has a list of items, it applies the operation to each element in the list
    - <FILTER> -  given a list of items, filter the list according to a given filter criteria
    - <GOOGLE> - return a list of the first 5 URLs
    - <END> - finish the sequence of commands

Here are some examples:
EXAMPLE 1:
==================================================
OBJECTIVE: Summarize my last 3 emails from yesterday
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
# repeat for the third out of 3 emails
OPENEMAIL 2
SUMMARIZE
STORE
# all of the summarized emails have been stored in the text buffer, so we can now output to the user
OUTPUT Summarize my last 3 emails from yesterday
END
==================================================

The objective is below. Reply with your next command to the browser.

OBJECTIVE: ${objective}
COMMANDS:`;


/// VErsion 2

const createPromptBouncerV2 = (browserContent, objective, currentUrl, previousCommand) => `
You are an agent controlling a browser. You are given:
    (1) an objective that you are trying to achieve
    (2) a working buffer (for temporary storage of text)
    (3) a storage buffer (for building the response to the user)

Your goal is to achieve the objective using a sequence of commands. 
The first command must be BEGIN and the last command must be END.
You must add comments (prefixed by "#") to explain your reasoning for each action.

You can issue these commands:
    - <BEGIN> - start the sequence of commands
    - <NAV> "URL" - navigate to the specified URL
    - <OPENEMAIL> INDEX - open the the email at index INDEX and store contents in the working buffer
    - <STORE> - append the working buffer to the storage buffer
    - <SUMMARIZE> - summarize the text in the working buffer
    - <OUTPUT> OBJECTIVE - output text stored in the storage buffer. Needs to begin with the objective provided.
    - <LOAD> - copy storage buffer to working buffer
    - <MAP> operation - assuming the working buffer has a list of items, it applies the operation to each element in the list
    - <FILTER> -  given a list of items, filter the list according to a given filter criteria
    - <GOOGLE> - return a list of the first 5 URLs
    - <END> - finish the sequence of commands

Here are some examples:
EXAMPLE 1:
==================================================
OBJECTIVE: Summarize my last 3 emails from yesterday
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
# repeat for the third out of 3 emails
OPENEMAIL 2
SUMMARIZE
STORE
# all of the summarized emails have been stored in the text buffer, so we can now output to the user
OUTPUT Summarize my last 3 emails from yesterday
END
==================================================

EXAMPLE 2:
==================================================
OBJECTIVE:
Find the twitter account of the first person who emailed me.
COMMANDS:
BEGIN
# navigate to gmail to open emails
NAV https://mail.google.com/mail/u/0/h/
# Open the first email
OPENEMAIL 0
# Get the author of the email, and store it buffer
GETAUTHOR
# Find their twitter account
TWITTERACCOUNT
# Store the twitter account into the buffer
STORE
# Output the twitter account to the user
OUTPUT Find the twitter account of the first person who emailed me.
END
==================================================

The objective is below. Reply with your next command to the browser.

OBJECTIVE: ${objective}
COMMANDS:`;

// End version 2


const stockPrompt = "Get the prices for each following stocks: Apple, Google, and Amazon."

const summarizeEmailPrompt = "Summarize my last 5 emails from yesterday."
const twitterAccountPrompt = "Find the twitter account of the first person who emailed me."


async function query_model(browserContent, objective, currentUrl, previousCommand) {
    const my_prompt = createPromptBouncerV1_1(browserContent, objective, currentUrl, previousCommand);

    const completion = await openai.createCompletion({
        model: "text-davinci-003", // codex model: code-davinci-002
        prompt: my_prompt,
        temperature: 0.0,
        max_tokens: 1000,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0,
    });

    return completion.data.choices[0].text;
}

async function runCompletion(prompt) {
    // console.log(`runCompletion prompt: ${prompt}`);
    const max_tokens = 3800 - encode(prompt).length;
    const res = await openai.createCompletion({
        model: "text-davinci-003",
        prompt: prompt,
        max_tokens
    });
    
    return res.data.choices[0].text;
}

// async function test() {
//     response = await query_model('', summarizeEmailPrompt, '', '');
//     // console.log(response);
// }

// test();

async function query_spellbook(browserContent, objective, currentUrl, previousCommand) {
    const my_prompt = createPromptBouncerV1_1('', objective, '', '');

    const res = await fetch('https://dashboard.scale.com/spellbook/api/app/yw2l3rkb', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Basic cld6sx13300ngq11awzqg66yb'
        },
        // body: '{"input": ""}',
        body: JSON.stringify({
            'input': my_prompt
        })
    })

    if (res.ok) {
        const data = await res.json();
        console.log(data.text);
    }
}

query_spellbook('', 'Summarize the last 3 emails', '', '');

module.exports = { runCompletion, query_model };


const createPromptBouncerV3 = (browserContent, objective, currentUrl, previousCommand) => `
You are a powerful language model agent controlling a browser.
Your goal is to produce the provided objective to completion.

You are given:
    (1) an objective that you are trying to achieve
    (2) a working buffer (for temporary storage of text)
    (3) a storage buffer (for building the response to the user)

Your goal is to achieve the objective using a sequence of commands.
The first command must be BEGIN and the last command must be END.
You should not use any commands that are not listed below.
You must add comments (prefixed by "#") to explain your reasoning for each action.

You can ONLY issue these commands:
    - <BEGIN> - start the sequence of commands
    - <NAV> "URL" - navigate to the specified URL
    - <OPENEMAIL> INDEX - open the the email at index INDEX and store contents in the working buffer
    - <DETECTSPAM> - classify the the selected email as spam
    - <STORE> - append the working buffer to the storage buffer
    - <SUMMARIZE> - summarize the text in the working buffer
    - <OUTPUT> OBJECTIVE - output text stored in the storage buffer. Needs to begin with the objective provided.
    - <LOAD> - copy storage buffer to working buffer
    - <MAP> operation - assuming the working buffer has a list of items, it applies the operation to each element in the list
    - <FILTER> - given a list of items, filter the list according to a given filter criteria
    - <GOOGLE> term - return a list of the first 5 URLs for the google search 'term'
    - <YOUTUBE> term - return a relevant YouTube video
    - <END> - finish the sequence of commands
If 

Here are some examples:
EXAMPLE 1:
OBJECTIVE: Summarize my last 3 emails from yesterday
COMMANDS:
BEGIN
# navigate to gmail to open emails
NAV https://mail.google.com/mail/u/0/h/
# Open the first email, then summarize, then store the summary into the text buffer
# emails are sorted in reverse chronological order, with 0 being the most recent (aka last) email, 1 being second most recent, etc..
OPENEMAIL 0
SUMMARIZE
STORE
# Repeat the process with the second email
OPENEMAIL 1
SUMMARIZE
STORE
# repeat for the third out of 3 emails
OPENEMAIL 2
SUMMARIZE
STORE
# all of the summarized emails have been stored in the text buffer, so we can now output to the user
OUTPUT Summarize my last 3 emails from yesterday
END

EXAMPLE 2:
OBJECTIVE: Return the first 3 results for the google search Scale AI reworded like a pirate
COMMANDS:
BEGIN
# get the names of the first 5 results in working memory
GOOGLE ScaleAI
# filter working memory to be the first three items
FILTER first three items
# convert the first three items to pirate speak
MAP pirate speak
STORE
OUTPUT
END

EXAMPLE 3:
OBJECTIVE: ${objective}
COMMANDS:`;
