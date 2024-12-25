function validateLogin(event) {
    event.preventDefault(); // Prevent form submission

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    if (username === 'nonabinarai' && password === 'guru@34') {
        window.location.href = 'video.html'; // Redirect to the video page
    } else {
        alert('Invalid username or password');
    }
}
