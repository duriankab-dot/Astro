// script.js - เชื่อมต่อหน้าเว็บกับ Netlify Function API

// ตั้งค่า API URL
const API_URL = '/.netlify/functions/natal-chart';

// ฟังก์ชันหลักสำหรับเรียก API
async function callNatalChartAPI(data) {
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }

        const result = await response.json();
        return result;
    } catch (error) {
        console.error('Error calling API:', error);
        throw error;
    }
}

// ฟังก์ชันสำหรับโหลดข้อมูลเมื่อหน้าเว็บโหลดเสร็จ
document.addEventListener('DOMContentLoaded', function() {
    // แสดงสถานะโหลด
    showLoadingState();
    
    // ดึงข้อมูลจาก Local Storage หรือ API
    loadUserData();
    
    // ตั้งค่า Event Listeners
    setupEventListeners();
});

// แสดงสถานะกำลังโหลด
function showLoadingState() {
    const loadingElements = document.querySelectorAll('.loading-placeholder');
    loadingElements.forEach(el => {
        el.innerHTML = `
            <div class="loading-spinner">
                <div class="spinner"></div>
                <p>กำลังวิเคราะห์ข้อมูล...</p>
            </div>
        `;
    });
}

// โหลดข้อมูลผู้ใช้
async function loadUserData() {
    // ตรวจสอบว่ามีข้อมูลใน Local Storage หรือไม่
    const savedData = localStorage.getItem('astrovera_user_data');
    
    if (savedData) {
        try {
            const userData = JSON.parse(savedData);
            displayUserData(userData);
            return;
        } catch (e) {
            console.error('Error parsing saved data:', e);
        }
    }
    
    // ถ้าไม่มีข้อมูลใน Local Storage ให้เรียก API
    try {
        // ใช้ข้อมูลตัวอย่างสำหรับการทดสอบ
        const sampleData = {
            birthDate: '1990-01-01',
            birthTime: '12:00',
            birthPlace: 'Bangkok',
            bloodType: 'O'
        };
        
        const result = await callNatalChartAPI(sampleData);
        
        if (result.success) {
            displayUserData(result.data);
            // บันทึกข้อมูลใน Local Storage
            localStorage.setItem('astrovera_user_data', JSON.stringify(result.data));
        } else {
            showError('ไม่สามารถโหลดข้อมูลได้ กรุณาลองใหม่');
        }
    } catch (error) {
        showError('เกิดข้อผิดพลาดในการเชื่อมต่อ');
    }
}

// แสดงข้อมูลผู้ใช้
function displayUserData(data) {
    // อัปเดตองค์ประกอบต่างๆ ในหน้า
    const userTypeElement = document.querySelector('.user-type');
    if (userTypeElement) {
        userTypeElement.textContent = data.userType || 'Visionary Builder';
    }
    
    const userTypeDescription = document.querySelector('.user-type-description');
    if (userTypeDescription) {
        userTypeDescription.textContent = data.description || 'ผู้นำแห่งการเปลี่ยนแปลง';
    }
    
    // อัปเดตชั้นการวิเคราะห์
    updateAnalysisLayers(data);
    
    // อัปเดตจังหวะชีวิต
    updateLifePhase(data);
    
    // ซ่อนสถานะโหลด
    hideLoadingState();
}

// อัปเดตชั้นการวิเคราะห์
function updateAnalysisLayers(data) {
    const layers = data.analysisLayers || {};
    
    // อัปเดตแต่ละชั้น
    const layerElements = document.querySelectorAll('.analysis-layer');
    layerElements.forEach((el, index) => {
        const layerKey = ['meaning', 'feeling', 'question', 'action', 'journal'][index];
        if (layers[layerKey]) {
            el.innerHTML = layers[layerKey];
        }
    });
}

// อัปเดตจังหวะชีวิต
function updateLifePhase(data) {
    const phaseElement = document.querySelector('.life-phase');
    if (phaseElement && data.lifePhase) {
        phaseElement.textContent = data.lifePhase;
    }
}

// แสดงข้อผิดพลาด
function showError(message) {
    const errorContainer = document.querySelector('.error-container');
    if (errorContainer) {
        errorContainer.innerHTML = `
            <div class="error-message">
                <span class="error-icon">⚠️</span>
                <p>${message}</p>
                <button onclick="retryLoad()" class="retry-btn">ลองใหม่</button>
            </div>
        `;
    }
}

// ฟังก์ชันลองใหม่
window.retryLoad = function() {
    location.reload();
};

// ซ่อนสถานะโหลด
function hideLoadingState() {
    const loadingElements = document.querySelectorAll('.loading-placeholder');
    loadingElements.forEach(el => {
        el.classList.remove('loading-placeholder');
        el.classList.add('loaded');
    });
}

// ตั้งค่า Event Listeners
function setupEventListeners() {
    // ปุ่มสำหรับบันทึกข้อมูล
    const saveButton = document.querySelector('.save-data-btn');
    if (saveButton) {
        saveButton.addEventListener('click', saveUserData);
    }
    
    // ปุ่มสำหรับอัปเดตข้อมูล
    const updateButton = document.querySelector('.update-data-btn');
    if (updateButton) {
        updateButton.addEventListener('click', updateUserData);
    }
    
    // ฟอร์มสำหรับกรอกข้อมูล
    const dataForm = document.querySelector('.user-data-form');
    if (dataForm) {
        dataForm.addEventListener('submit', handleFormSubmit);
    }
}

// บันทึกข้อมูลผู้ใช้
async function saveUserData() {
    const formData = collectFormData();
    
    if (!validateFormData(formData)) {
        showError('กรุณากรอกข้อมูลให้ครบถ้วน');
        return;
    }
    
    try {
        const result = await callNatalChartAPI(formData);
        
        if (result.success) {
            localStorage.setItem('astrovera_user_data', JSON.stringify(result.data));
            displayUserData(result.data);
            showSuccess('บันทึกข้อมูลสำเร็จ');
        } else {
            showError('ไม่สามารถบันทึกข้อมูลได้');
        }
    } catch (error) {
        showError('เกิดข้อผิดพลาดในการบันทึก');
    }
}

// อัปเดตข้อมูลผู้ใช้
async function updateUserData() {
    await saveUserData();
}

// เก็บข้อมูลจากฟอร์ม
function collectFormData() {
    return {
        birthDate: document.querySelector('#birth-date')?.value || '',
        birthTime: document.querySelector('#birth-time')?.value || '',
        birthPlace: document.querySelector('#birth-place')?.value || '',
        bloodType: document.querySelector('#blood-type')?.value || ''
    };
}

// ตรวจสอบข้อมูลฟอร์ม
function validateFormData(data) {
    return data.birthDate && data.birthTime && data.birthPlace;
}

// แสดงข้อความสำเร็จ
function showSuccess(message) {
    const notification = document.querySelector('.notification');
    if (notification) {
        notification.innerHTML = `
            <div class="success-message">
                <span class="success-icon">✅</span>
                <p>${message}</p>
            </div>
        `;
        setTimeout(() => {
            notification.innerHTML = '';
        }, 3000);
    }
}

// จัดการการส่งฟอร์ม
async function handleFormSubmit(event) {
    event.preventDefault();
    await saveUserData();
}

// ฟังก์ชันสำหรับ Life Decision Tracker
async function saveDecision(decisionData) {
    try {
        const result = await callNatalChartAPI({
            action: 'save_decision',
            data: decisionData
        });
        
        if (result.success) {
            // บันทึกการตัดสินใจใน Local Storage
            const decisions = JSON.parse(localStorage.getItem('astrovera_decisions') || '[]');
            decisions.push({
                ...decisionData,
                timestamp: new Date().toISOString(),
                id: Date.now()
            });
            localStorage.setItem('astrovera_decisions', JSON.stringify(decisions));
            return true;
        }
        return false;
    } catch (error) {
        console.error('Error saving decision:', error);
        return false;
    }
}

// ฟังก์ชันสำหรับบันทึก Journal
async function saveJournalEntry(entry) {
    try {
        const result = await callNatalChartAPI({
            action: 'save_journal',
            data: entry
        });
        
        if (result.success) {
            const entries = JSON.parse(localStorage.getItem('astrovera_journal') || '[]');
            entries.push({
                ...entry,
                timestamp: new Date().toISOString(),
                id: Date.now()
            });
            localStorage.setItem('astrovera_journal', JSON.stringify(entries));
            return true;
        }
        return false;
    } catch (error) {
        console.error('Error saving journal:', error);
        return false;
    }
}

// ฟังก์ชันสำหรับบันทึกการติดตามผล
async function saveFollowUp(followUpData) {
    try {
        const result = await callNatalChartAPI({
            action: 'save_followup',
            data: followUpData
        });
        
        if (result.success) {
            const followUps = JSON.parse(localStorage.getItem('astrovera_followups') || '[]');
            followUps.push({
                ...followUpData,
                timestamp: new Date().toISOString(),
                id: Date.now()
            });
            localStorage.setItem('astrovera_followups', JSON.stringify(followUps));
            return true;
        }
        return false;
    } catch (error) {
        console.error('Error saving follow-up:', error);
        return false;
    }
}

// ฟังก์ชันสำหรับ VERA AI Chat
async function askVERA(question) {
    try {
        const result = await callNatalChartAPI({
            action: 'ask_vera',
            question: question
        });
        
        if (result.success) {
            return result.answer;
        }
        return 'ขออภัย ไม่สามารถตอบคำถามได้ในตอนนี้';
    } catch (error) {
        console.error('Error asking VERA:', error);
        return 'เกิดข้อผิดพลาดในการเชื่อมต่อกับ VERA';
    }
}

// ส่งออกฟังก์ชันสำหรับใช้ในส่วนอื่น
export {
    callNatalChartAPI,
    saveDecision,
    saveJournalEntry,
    saveFollowUp,
    askVERA
};
