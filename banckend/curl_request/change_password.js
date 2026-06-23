const response = await fetch('http://127.0.0.1:8000/api/users/change-password/', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        // Send the access token here!
        'Authorization': `Bearer ${accessToken}`
    },
    body: JSON.stringify({
        new_password: "MySuperSecretNewPassword123!"
    })
});

const data = await response.json();
