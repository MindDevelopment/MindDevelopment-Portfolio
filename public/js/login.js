document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
});

async function handleLogin(e) {
    e.preventDefault();
    
    const errorMessage = document.getElementById('error-message');
    errorMessage.classList.remove('show'); // Hide error message first
    
    const formData = new FormData(e.target);
    const loginData = {
        username: formData.get('username'),
        password: formData.get('password')
    };
    
    try {
        const response = await fetch('/admin/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(loginData)
        });
        
        const result = await response.json();
        
        if (result.success) {
            window.location.href = '/admin';
        } else {
            errorMessage.textContent = result.error;
            errorMessage.classList.add('show'); // Show error message
        }
    } catch (error) {
        console.error('Error:', error);
        errorMessage.textContent = 'Er is een fout opgetreden';
        errorMessage.classList.add('show'); // Show error message
    }
}
