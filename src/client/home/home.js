async function checkAuth() {
    try {
        const response = await fetch('http://127.0.0.1:3000/api/auth/profile', {
            credentials: 'include',
        });
        if (response.ok) {
            const data = await response.json();
            console.log('Authenticated user:', data);
        } else {
            window.location.href = "../auth/login.html";
            console.log('User is not authenticated');
        }
    } catch (error) {
        window.location.href = '../auth/login.html';
        console.error('Error checking authentication:', error);
    }
}

checkAuth();

const logoutBtn = document.getElementById('logoutBtn');

logoutBtn.addEventListener('click', async () => {

    try {

        const response = await fetch('http://127.0.0.1:3000/api/auth/logout', {

            method: 'POST',

            credentials: 'include'

        });

        if (response.ok) {

            window.location.href = "../auth/login.html";

        } else {

            alert('Logout failed');

        }

    } catch (error) {

        console.error('Error during logout:', error);

    }

});