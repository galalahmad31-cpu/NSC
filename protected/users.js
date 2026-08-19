// جدول المشتركين السري
const USERS_DATABASE = {
    "ahmed_fit": { password: "pass123", expireDate: "2026-09-15" }, 
    "mona_diet": { password: "fit99",   expireDate: "2026-08-30" }, 
    "coach_ali": { password: "ali2026", expireDate: "2026-10-01" }
};

// جعل الملف متاحاً لصفحة الهبوط بأمان
window.USERS_DATABASE = USERS_DATABASE;
