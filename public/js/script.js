let textarea = document.querySelector('textarea');
let button = document.getElementById('action-button');

let loading = false;

button.onclick = async () => {
    if (loading) return;
    loading = true;

    button.classList.add('loading');
    button.innerHTML = '<span class="loader"></span>';

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
        while (true) {
            const {done, value} = await reader.read();
            if (done) {
                console.log("Stream closed");
                loading = false;
                button.innerText = 'Take action!';
                button.classList.remove('loading');
                break;
            }
            document.body.children[0].innerHTML += new TextDecoder().decode(value);
        }
    })();
};
