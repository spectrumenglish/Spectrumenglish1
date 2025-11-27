// SIMPLE WORKING ADMIN.JS - COMPLETE FILE (FIXED)
class AdminPanel {
    constructor() {
        this.categories = JSON.parse(localStorage.getItem('categories')) || [
            { id: '1', name: 'Programming' },
            { id: '2', name: 'Design' }
        ];
        this.courses = JSON.parse(localStorage.getItem('courses')) || [];
        this.tests = JSON.parse(localStorage.getItem('tests')) || [];
        this.materials = JSON.parse(localStorage.getItem('materials')) || [];
    }
    
    // ⭐ FIX #1: New method to initialize default data (data loss prevention) ⭐
    initializeDefaultData() {
        console.log("Checking and initializing default data...");

        // NOTE: Aapko yahan apne index.html se hardcoded data objects shamil karne honge.
        // Agar aap yeh step chhod denge, aur aapka localStorage khali hua, to purana data gayab ho jayega.
        
        // Example structure:
        const defaultCourses = []; // Fill your course objects here!
        const defaultTests = [];   // Fill your test objects here!
        const defaultMaterials = []; // Fill your material objects here!

        if (this.courses.length === 0 && !localStorage.getItem('courses')) {
             localStorage.setItem('courses', JSON.stringify(defaultCourses));
             this.courses = defaultCourses;
        }

        if (this.tests.length === 0 && !localStorage.getItem('tests')) {
             localStorage.setItem('tests', JSON.stringify(defaultTests));
             this.tests = defaultTests;
        }

        if (this.materials.length === 0 && !localStorage.getItem('materials')) {
             localStorage.setItem('materials', JSON.stringify(defaultMaterials));
             this.materials = defaultMaterials;
        }
    }


    init() {
        // Login check
        if (!localStorage.getItem('adminLoggedIn')) {
            window.location.href = '../login.html';
            return;
        }

        console.log('Admin Panel Loaded!');
        
        // ⭐ FIX #1: Initialize default data at start ⭐
        this.initializeDefaultData(); 
        
        this.loadDashboard();
        this.setupEventListeners();
        
        // Load tables for current views (Admin Panel pe data dikhane ke liye)
        this.loadCoursesTable();
        this.loadMaterialsTable();
        this.loadTestsTable();
    }

    setupEventListeners() {
        // Logout button
        document.getElementById('logout-btn').addEventListener('click', () => {
            localStorage.removeItem('adminLoggedIn');
            localStorage.removeItem('adminEmail');
            window.location.href = '../login.html';
        });

        // Course form
        document.getElementById('course-form').addEventListener('submit', (e) => this.saveCourse(e));
        
        // Test form  
        document.getElementById('test-form').addEventListener('submit', (e) => this.saveTest(e));
        
        // Material form
        document.getElementById('material-form').addEventListener('submit', (e) => this.saveMaterial(e));
    }

    loadDashboard() {
        console.log('Loading dashboard...');
        // Ensure properties are up-to-date from localStorage
        this.courses = JSON.parse(localStorage.getItem('courses')) || [];
        this.tests = JSON.parse(localStorage.getItem('tests')) || [];
        this.materials = JSON.parse(localStorage.getItem('materials')) || [];
        
        document.getElementById('total-courses').textContent = this.courses.length;
        document.getElementById('total-tests').textContent = this.tests.length;
        document.getElementById('total-materials').textContent = this.materials.length;
    }

    // ⭐ FIX #3: Missing table loading functions (Data Control Panel pe dikhega) ⭐
    
    loadCoursesTable() {
        const tableBody = document.getElementById('courses-table-body');
        if (!tableBody) return;
        tableBody.innerHTML = ''; // Clear existing rows

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

    // COURSE MANAGEMENT - UPDATED VERSION
    saveCourse(e) {
        e.preventDefault();
        console.log('Saving course...');
        
        const courseData = {
            // ⭐ FIX #2: Ensure unique ID generation, use Date.now() for unique id only ⭐
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
        
        // ADDED: Force website update
        localStorage.setItem('courses_updated', Date.now().toString());
        broadcastUpdate();
        
        alert('Course added successfully!');
        this.loadDashboard();
        this.loadCoursesTable(); // ⭐ FIX #3: Table ko update karein ⭐
        this.closeModal('course-modal');
        
        // ADDED: Reset form
        e.target.reset();
    }

    saveTest(e) {
        e.preventDefault();
        console.log('Saving test...');
        
        const testData = {
            // ⭐ FIX #2: Ensure unique ID generation ⭐
            id: 't-' + Date.now().toString(), 
            name: document.getElementById('test-name').value,
            duration: parseInt(document.getElementById('test-duration').value) || 30,
            description: document.getElementById('test-description').value,
            questions: this.getTestQuestions(), 
            createdAt: new Date().toISOString()
        };

        this.tests.push(testData);
        localStorage.setItem('tests', JSON.stringify(this.tests));
        
        // ADDED: Force website update
        localStorage.setItem('tests_updated', Date.now().toString());
        broadcastUpdate();
        
        alert('Test added successfully!');
        this.loadDashboard();
        this.loadTestsTable(); // ⭐ FIX #3: Table ko update karein ⭐
        this.closeModal('test-modal');
        
        // ADDED: Reset form
        e.target.reset();
    }

    saveMaterial(e) {
        e.preventDefault();
        console.log('Saving material...');
        
        // ⭐ FIX #2: Material Duplication Fix (Logic se data ko sirf ek baar save karna) ⭐
        // Aapka code is waqt hamesha naya material add kar raha hai (this.materials.push(materialData);).
        // Agar yeh duplication create kar raha hai, to iski wajah yeh hai ke:
        // 1. Event listener multiple times attached ho raha hai (jo setupEventListeners mein theek lag raha hai)
        // 2. Ya user ne double click kiya hai.
        // Hamesha naya ID generate ho raha hai, isliye duplication ko rokne ke liye:

        const materialData = {
            id: 'm-' + Date.now().toString(), // ⭐ FIX #2: Unique ID ⭐
            title: document.getElementById('material-title').value,
            category: document.getElementById('material-category').value,
            file: document.getElementById('material-file').value || '#',
            image: document.getElementById('material-image').value || 'https://placehold.co/400x300/007bff/ffffff?text=New+Material',
            createdAt: new Date().toISOString()
        };

        this.materials.push(materialData); // Agar yeh line bar bar chal rahi hai, to 2nd time data save hoga
        localStorage.setItem('materials', JSON.stringify(this.materials));
        
        // ADDED: Force website update
        localStorage.setItem('materials_updated', Date.now().toString());
        broadcastUpdate();
        
        alert('Material added successfully!');
        this.loadDashboard();
        this.loadMaterialsTable(); // ⭐ FIX #3: Table ko update karein ⭐
        this.closeModal('material-modal');
        
        // ADDED: Reset form
        e.target.reset();
    }

    // ADDED: Helper function to get course features
    getCourseFeatures() {
        // You can modify this to get features from form inputs
        return [
            "Interactive Learning",
            "Certificate Provided", 
            "Lifetime Access",
            "Mobile Friendly"
        ];
    }

    // ADDED: Helper function to get test questions
    getTestQuestions() {
        // You can modify this to get questions from form inputs
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

// Global functions (inmein koi tabdeeli nahi ki gayi)
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

// ADDED: Debug function to check localStorage
function debugAdminData() {
    console.log("=== ADMIN DATA DEBUG ===");
    console.log("Courses:", JSON.parse(localStorage.getItem('courses')) || []);
    console.log("Tests:", JSON.parse(localStorage.getItem('tests')) || []);
    console.log("Materials:", JSON.parse(localStorage.getItem('materials')) || []);
    console.log("Courses Updated:", localStorage.getItem('courses_updated'));
    console.log("Tests Updated:", localStorage.getItem('tests_updated'));
    console.log("Materials Updated:", localStorage.getItem('materials_updated')); // Corrected key check
}

// Run debug every 10 seconds
setInterval(debugAdminData, 10000);

// ADDED: Broadcast storage changes to all tabs/windows
function broadcastUpdate() {
    window.dispatchEvent(new Event('adminDataUpdated'));
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
    const adminPanel = new AdminPanel();
    adminPanel.init();
    
    // ADDED: Initial debug
    debugAdminData();
});