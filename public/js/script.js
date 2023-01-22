let textarea = document.querySelector('textarea');
let button = document.querySelector('button');

let loading = false;

document.querySelector('button').onclick = run;
async function run() {
    if (loading) return;
    loading = true;

    document.querySelector('button').classList.add('loading');
    document.querySelector('button').innerHTML = '<span class="loader"></span>';

    let task = textarea.value;
    let req = await fetch('/action', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({task})
    });

    let stream = req.body;
    let reader = stream.getReader();

    await (async function read() {
        let idx = 0;
        let lastText;
        while (true) {
            const {done, value} = await reader.read();
            let text = new TextDecoder().decode(value);
            console.log(done, text)
            if (done) {
                document.body.children[0].innerHTML += text ? text : lastText;

                console.log("Stream closed");
                loading = false;
                document.querySelector('button').innerText = 'Take action!';
                document.querySelector('button').classList.remove('loading');
                document.querySelector('button').onclick = run;
                break;
            } else {
                if (text.substr(0,8) == 'ACTIONS:') {
                    let actions = text.substr(8);
                    let els = actions.split('\n').filter(x => x.indexOf('#') != 0).filter(x => x).map(x => `<span>${x}</span>`).join('');
                    document.querySelector('div.textarea-container div').innerHTML = els;
                } else if (text.substr(0,7) == 'ACTION:') {
                    console.log(idx);
                    // let action = text.substr(7);
                    let els = [...document.querySelectorAll('div.textarea-container div span')];
                    for (let i in els) {
                        let el = els[i];
                        el.style.color = parseInt(i) === idx ? 'yellow' : 'white';
                    }
                    idx += text.match(/ACTION:/g)?.length;
                }
            }
            lastText = text;
        }
    })();
};
