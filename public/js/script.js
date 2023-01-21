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
};