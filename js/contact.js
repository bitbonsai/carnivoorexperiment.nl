async function submit(event) {
    event.preventDefault();
    const form = event.target;
    const formData = new FormData(form);

    const response = await fetch('/api/submit', {
        method: 'POST',
        body: formData
    });

    if (response.ok) {
        window.location.href = '/contact/thanks';
    }
}
