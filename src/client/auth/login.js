const checkAuth = async () => {
    try {
        const response = await fetch('http://127.0.0.1:3000/', {
            method: 'GET',
            credentials: 'include'
        });
        if (response.ok) {
            window.location.href = "../home/home.html";
        }
    } catch (error) {
        // ไม่ authenticated อยู่ต่อ
    }
};

checkAuth();

const loginForm = document.getElementById('loginForm');
console.log('พบฟอร์มล็อกอิน :', loginForm);

loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        const response = await fetch('http://127.0.0.1:3000/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password }),
            credentials: 'include' // เพื่อให้ส่งคุกกี้ไปด้วย
        });

        const result = await response.json();
        console.log('Login result:', result);

        if (response.ok) {
            setTimeout(() => {
                window.location.href = "../home/home.html";
            }, 1000);
        } else {
            alert(result.message || 'Login failed!');
        }
    } catch (error) {
        console.error('Error during login:', error);
    }
});
