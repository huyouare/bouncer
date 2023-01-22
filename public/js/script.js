let textarea = document.querySelector('textarea');
let button = document.querySelector('button');

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
    let res = await req.text();

    document.body.children[0].innerHTML = res;

    loading = false;
    button.innerText = 'Take action!';
    button.classList.remove('loading');
};