// ฟังก์ชันนี้คืนค่าเป็น Object บอกว่าผ่านหรือไม่
export const validateUserData = (username: string, password: string, email: string, users: any[]) => {
    if (!username || !password || !email) return { valid: false, message: 'กรอกให้ครบดิ๊' };
    if (password.length < 6) return { valid: false, message: 'รหัสสั้นไป (ต้อง 6 ตัวขึ้น)' };
    if (users.find(u => u.username.toLowerCase() === username.toLowerCase())) return { valid: false, message: 'ชื่อนี้มีคนใช้แล้ว' };
    if (users.find(u => u.email === email)) return { valid: false, message: 'อีเมลนี้ซ้ำ' };
    
    return { valid: true };
};