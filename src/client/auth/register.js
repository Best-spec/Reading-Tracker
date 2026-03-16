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

const registerForm = document.getElementById('registerForm');
console.log('พบฟอร์มสมัครสมาชิก :', registerForm);

registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('email').value;
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    try {
        const response = await fetch('http://127.0.0.1:3000/api/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, username, password }),
            credentials: 'include' // เพื่อให้ส่งคุกกี้ไปด้วย
        });

        const result = await response.json();
        console.log('Registration result:', result);

        if (response.ok) {
            alert('สมัครสมาชิกสำเร็จ!');
            setTimeout(() => {
                window.location.href = "login.html";
            }, 1000);
        } else {
            alert(result.message || 'Registration failed!');
        }
    } catch (error) {
        console.error('Error during registration:', error);
    }
});
