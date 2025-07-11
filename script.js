// تكوين Firebase
const firebaseConfig = {
    apiKey: 'AIzaSyALJkV22o-8iVRj1UfEBgzjF0_uCc88Bus',
    appId: '1:604464445362:web:50fc15dba3580bb92e16ab',
    messagingSenderId: '604464445362',
    projectId: 'new-points-854d6',
    authDomain: 'new-points-854d6.firebaseapp.com',
    databaseURL: 'https://new-points-854d6-default-rtdb.firebaseio.com',
    storageBucket: 'new-points-854d6.firebasestorage.app',
    measurementId: 'G-LZX2BWYQ44',
};

// تهيئة Firebase
const app = firebase.initializeApp(firebaseConfig);
const database = firebase.database();

// دالة لتحسين عرض الأسماء كما طلبت
function formatUsername(email) {
    if (!email) return 'مستخدم';
    
    // إزالة الجزء بعد @ إن وجد
    let username = email.split('@')[0];
    
    // استبدال النقاط بمسافات
    username = username.replace(/\./g, ' ');
    
    // تحويل أول حرف من كل كلمة إلى حرف كبير
    username = username.split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
    
    return username || 'مستخدم';
}

// دالة جلب وعرض البيانات
function loadUsers() {
    const usersList = document.getElementById('usersList');
    
    try {
        database.ref().child('users').get().then((snapshot) => {
            if (!snapshot.exists()) {
                usersList.innerHTML = `
                    <div class="error-message">
                        لا يوجد أعضاء مسجلين بعد
                    </div>
                `;
                return;
            }
            
            const users = [];
            const usersData = snapshot.val();
            
            for (const userId in usersData) {
                if (usersData.hasOwnProperty(userId)) {
                    const user = usersData[userId];
                    const email = user.email || 'بريد غير معروف';
                    const username = formatUsername(email);
                    
                    let points = 0;
                    if (typeof user.marks !== 'undefined') {
                        points = parseInt(user.marks) || 0;
                    } else if (typeof user.points !== 'undefined') {
                        points = parseInt(user.points) || 0;
                    } else if (typeof user.score !== 'undefined') {
                        points = parseInt(user.score) || 0;
                    }
                    
                    users.push({
                        id: userId,
                        username: username,
                        points: points
                    });
                }
            }
            
            users.sort((a, b) => b.points - a.points);
            displayUsers(users);
        }).catch((error) => {
            console.error("Error loading users:", error);
            showError(error);
        });
    } catch (error) {
        console.error("Firebase connection error:", error);
        showError(error);
    }
}

// دالة عرض المستخدمين
function displayUsers(users) {
    const usersList = document.getElementById('usersList');
    
    if (!users || users.length === 0) {
        usersList.innerHTML = `
            <div class="error-message">
                لا يوجد أعضاء لعرضهم
            </div>
        `;
        return;
    }
    
    let html = '';
    
    users.forEach((user, index) => {
        const rank = index + 1;
        let rankClass = '';
        let medal = '';
        
        if (rank === 1) {
            rankClass = 'gold';
            medal = '👑';
        } else if (rank === 2) {
            rankClass = 'silver';
            medal = '🥈';
        } else if (rank === 3) {
            rankClass = 'bronze';
            medal = '🥉';
        } else {
            rankClass = 'other';
        }
        
        const isTopUser = rank <= 3;
        const topUserClass = isTopUser ? 'top-user' : '';
        
        html += `
            <li class="user-item ${topUserClass}">
                <div class="user-rank ${rankClass}">
                    ${rank}
                    ${medal ? `<span class="medal-icon">${medal}</span>` : ''}
                </div>
                <div class="user-info">
                    <div class="user-name">${user.username}</div>
                    <div class="user-points">${user.points}</div>
                </div>
            </li>
        `;
    });
    
    usersList.innerHTML = html;
}

// دالة عرض الخطأ
function showError(error) {
    const usersList = document.getElementById('usersList');
    usersList.innerHTML = `
        <div class="error-message">
            <h4>حدث خطأ في تحميل البيانات</h4>
            <p>${error.message || 'الرجاء المحاولة لاحقاً'}</p>
            <button onclick="location.reload()" class="btn btn-primary mt-2">إعادة المحاولة</button>
        </div>
    `;
}

// تحميل البيانات عند فتح الصفحة
document.addEventListener('DOMContentLoaded', () => {
    try {
        loadUsers();
        setInterval(loadUsers, 30000);
    } catch (error) {
        console.error("Initialization error:", error);
        showError(error);
    }
});