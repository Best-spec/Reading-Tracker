async function checkAuth() {
    try {
        const response = await fetch('http://127.0.0.1:3000/api/auth/profile', {
            credentials: 'include',
        });
        if (response.ok) {
            const data = await response.json();
            console.log('Authenticated user:', data);
        } else {
            window.location.href = 'login.html';
            console.log('User is not authenticated');
        }
    } catch (error) {
        window.location.href = 'login.html';
        console.error('Error checking authentication:', error);
    }
}

checkAuth();