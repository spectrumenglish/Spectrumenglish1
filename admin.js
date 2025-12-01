// ---- FIREBASE IMPORTS & CONFIG ----
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDCWPnWFcRLy3BMxBmi5hl3RfeR8n-Tqa8",
  authDomain: "mywe-cfed3.firebaseapp.com",
  projectId: "mywe-cfed3",
  storageBucket: "mywe-cfed3.firebasestorage.app",
  messagingSenderId: "395232065402",
  appId: "1:395232065402:web:350f8ca9ea5c37c5ad48c3",
  measurementId: "G-B3CG89SX0Y"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ==== ADMIN PANEL CLASS ====
class AdminPanel {
    constructor() {
        this.categories = JSON.parse(localStorage.getItem('categories')) || [
            { id: '1', name: 'Programming' },
            { id: '2', name: 'Design' }
        ];
        this.courses = JSON.parse(localStorage.getItem('courses')) || [];
        this.tests = JSON.parse(localStorage.getItem('tests')) || [];
        this.materials = []; // Firestore سے لائیں گے!
    }
    
    initializeDefaultData() {
        console.log("Checking and initializing default data...");
        const defaultCourses = [];
        const defaultTests = [];
        if (this.courses.length === 0 && !localStorage.getItem('courses')) {
             localStorage.setItem('courses', JSON.stringify(defaultCourses));
             this.courses = defaultCourses;
        }
        if (this.tests.length === 0 && !localStorage.getItem('tests')) {
             localStorage.setItem('tests', JSON.stringify(defaultTests));
             this.tests = defaultTests;
        }
    }

    async init() {
        if (!localStorage.getItem('adminLoggedIn')) {
            window.location.href = '../login.html';
            return;
        }
        console.log('Admin Panel Loaded!');
        this.initializeDefaultData(); 
        this.loadDashboard();
        this.setupEventListeners();

        // Courses/tests old way, materials from Firestore:
        this.loadCoursesTable();
        this.loadTestsTable();
        await this.loadMaterialsFromFirestore();
    }

    setupEventListeners() {
        document.getElementById('logout-btn').addEventListener('click', () => {
            localStorage.removeItem('adminLoggedIn');
            localStorage.removeItem('adminEmail');
            window.location.href = '../login.html';
        });

        document.getElementById('course-form').addEventListener('submit', (e) => this.saveCourse(e));
        document.getElementById('test-form').addEventListener('submit', (e) => this.saveTest(e));
        document.getElementById('material-form').addEventListener('submit', (e) => this.saveMaterial(e));
    }

    loadDashboard() {
        this.courses = JSON.parse(localStorage.getItem('courses')) || [];
        this.tests = JSON.parse(localStorage.getItem('tests')) || [];
        // this.materials کو Firestore سے handle کریں گے
        document.getElementById('total-courses').textContent = this.courses.length;
        document.getElementById('total-tests').textContent = this.tests.length;
        document.getElementById('total-materials').textContent = this.materials.length;
    }

    loadCoursesTable() {
        const tableBody = document.getElementById('courses-table-body');
        if (!tableBody) return;
        tableBody.innerHTML = '';
        this.courses.forEach(course => {
            const row = tableBody.insertRow();
            row.innerHTML = `
                <td class="py-2 px-4 border-b">${course.title}</td>
                <td class="py-2 px-4 border-b">${course.category}</td>
                <td class="py-2 px-4 border-b">${course.price}</td>
                <td class="py-2 px-4 border-b">
                    <button class="text-blue-600 hover:text-blue-800 mr-2" onclick="editCourse('${course.id}')"><i class="fas fa-edit"></i></button>
                    <button class="text-red-600 hover:text-red-800" onclick="deleteCourse('${course.id}')"><i class="fas fa-trash"></i></button>
                </td>
            `;
        });
    }
    
    loadTestsTable() {
        const tableBody = document.getElementById('tests-table-body');
        if (!tableBody) return;
        tableBody.innerHTML = ''; 
        this.tests.forEach(test => {
            const row = tableBody.insertRow();
            row.innerHTML = `
                <td class="py-2 px-4 border-b">${test.name}</td>
                <td class="py-2 px-4 border-b">${test.duration} mins</td>
                <td class="py-2 px-4 border-b">${test.questions.length}</td>
                <td class="py-2 px-4 border-b">
                    <button class="text-blue-600 hover:text-blue-800 mr-2" onclick="editTest('${test.id}')"><i class="fas fa-edit"></i></button>
                    <button class="text-red-600 hover:text-red-800" onclick="deleteTest('${test.id}')"><i class="fas fa-trash"></i></button>
                </td>
            `;
        });
    }
    
    loadMaterialsTable() {
        const tableBody = document.getElementById('materials-table-body');
        if (!tableBody) return;
        tableBody.innerHTML = ''; 
        this.materials.forEach(material => {
            const row = tableBody.insertRow();
            row.innerHTML = `
                <td class="py-2 px-4 border-b">${material.title}</td>
                <td class="py-2 px-4 border-b">${material.category}</td>
                <td class="py-2 px-4 border-b"><a href="${material.file}" target="_blank" class="text-green-600"><i class="fas fa-file-download"></i></a></td>
                <td class="py-2 px-4 border-b">
                    <button class="text-blue-600 hover:text-blue-800 mr-2" onclick="editMaterial('${material.id}')"><i class="fas fa-edit"></i></button>
                    <button class="text-red-600 hover:text-red-800" onclick="deleteMaterial('${material.id}')"><i class="fas fa-trash"></i></button>
                </td>
            `;
        });
    }

    // === FIRESTORE CODE FOR MATERIALS ===
    async saveMaterial(e) {
        e.preventDefault();
        console.log('Saving material...');
        const materialData = {
            id: 'm-' + Date.now().toString(),
            title: document.getElementById('material-title').value,
            category: document.getElementById('material-category').value,
            file: document.getElementById('material-file').value || '#',
            image: document.getElementById('material-image').value || 'https://placehold.co/400x300/007bff/ffffff?text=New+Material',
            createdAt: new Date().toISOString()
        };
        try {
            await addDoc(collection(db, "materials"), materialData);
            alert('Material added successfully!');
            await this.loadMaterialsFromFirestore();
            this.closeModal('material-modal');
            e.target.reset();
        } catch (error) {
            alert("Error saving to Firestore: " + error.message);
        }
    }

    async loadMaterialsFromFirestore() {
        try {
            const querySnapshot = await getDocs(collection(db, "materials"));
            this.materials = [];
            querySnapshot.forEach((doc) => {
                this.materials.push(doc.data());
            });
            this.loadMaterialsTable();
            this.loadDashboard();
        } catch (error) {
            console.error("Error loading materials from Firestore:", error);
        }
    }

    // --- COURSE/TEST LOCAL (no Firestore), rest same ---
    saveCourse(e) {
        e.preventDefault();
        console.log('Saving course...');
        const courseData = {
            id: 'c-' + Date.now().toString(), 
            title: document.getElementById('course-title').value,
            price: parseInt(document.getElementById('course-price').value) || 0,
            description: document.getElementById('course-description').value,
            category: document.getElementById('course-category').value,
            image: document.getElementById('course-image').value || 'https://placehold.co/600x150/007bff/ffffff?text=New+Course',
            features: this.getCourseFeatures(), 
            file: document.getElementById('course-file')?.value || '#', 
            createdAt: new Date().toISOString()
        };
        this.courses.push(courseData);
        localStorage.setItem('courses', JSON.stringify(this.courses));
        localStorage.setItem('courses_updated', Date.now().toString());
        broadcastUpdate();
        alert('Course added successfully!');
        this.loadDashboard();
        this.loadCoursesTable();
        this.closeModal('course-modal');
        e.target.reset();
    }

    saveTest(e) {
        e.preventDefault();
        console.log('Saving test...');
        const testData = {
            id: 't-' + Date.now().toString(), 
            name: document.getElementById('test-name').value,
            duration: parseInt(document.getElementById('test-duration').value) || 30,
            description: document.getElementById('test-description').value,
            questions: this.getTestQuestions(), 
            createdAt: new Date().toISOString()
        };
        this.tests.push(testData);
        localStorage.setItem('tests', JSON.stringify(this.tests));
        localStorage.setItem('tests_updated', Date.now().toString());
        broadcastUpdate();
        alert('Test added successfully!');
        this.loadDashboard();
        this.loadTestsTable();
        this.closeModal('test-modal');
        e.target.reset();
    }

    getCourseFeatures() {
        return [
            "Interactive Learning",
            "Certificate Provided", 
            "Lifetime Access",
            "Mobile Friendly"
        ];
    }

    getTestQuestions() {
        return [
            {
                question: "Sample question 1?",
                options: ["Option A", "Option B", "Option C", "Option D"],
                correctAnswer: 0,
                explanation: "This is a sample explanation"
            },
            {
                question: "Sample question 2?",
                options: ["Option A", "Option B", "Option C", "Option D"],
                correctAnswer: 1,
                explanation: "This is a sample explanation"
            }
        ];
    }

    closeModal(modalId) {
        document.getElementById(modalId).classList.add('hidden');
    }
}

// ---- GLOBALS ----
function openCourseModal() {
    document.getElementById('course-modal').classList.remove('hidden');
}
function openTestModal() {
    document.getElementById('test-modal').classList.remove('hidden');
}
function openMaterialModal() {
    document.getElementById('material-modal').classList.remove('hidden');
}
function closeModal(modalId) {
    document.getElementById(modalId).classList.add('hidden');
}
function debugAdminData() {
    console.log("=== ADMIN DATA DEBUG ===");
    console.log("Courses:", JSON.parse(localStorage.getItem('courses')) || []);
    console.log("Tests:", JSON.parse(localStorage.getItem('tests')) || []);
    // Materials now in Firestore—log the class variable!
    // You can log window.adminPanel.materials from the console if needed
    console.log("Courses Updated:", localStorage.getItem('courses_updated'));
    console.log("Tests Updated:", localStorage.getItem('tests_updated'));
}
setInterval(debugAdminData, 10000);
function broadcastUpdate() {
    window.dispatchEvent(new Event('adminDataUpdated'));
}

// ---- ON PAGE LOAD ----
document.addEventListener('DOMContentLoaded', async () => {
    window.adminPanel = new AdminPanel();
    await window.adminPanel.init();
    debugAdminData();
});
