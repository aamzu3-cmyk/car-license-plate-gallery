// Saudi License Plates Gallery - Complete JavaScript

let plates = [];
let currentPlate = null;
let totalViews = 0;

// Initialize the app
function init() {
    loadFromStorage();
    setupEventListeners();
    renderPlates();
    updateStats();
    addSamplePlates();
}

// Setup event listeners
function setupEventListeners() {
    // Form submission
    document.getElementById('addPlateForm').addEventListener('submit', addNewPlate);
    
    // Search and filters
    document.getElementById('searchInput').addEventListener('input', filterPlates);
    document.getElementById('categoryFilter').addEventListener('change', filterPlates);
    document.getElementById('sortFilter').addEventListener('change', sortPlates);
    
    // Modal controls
    document.querySelector('.close-btn').addEventListener('click', closeModal);
    document.getElementById('plateModal').addEventListener('click', (e) => {
        if (e.target === document.getElementById('plateModal')) closeModal();
    });
    
    // Modal buttons
    document.getElementById('likeBtn').addEventListener('click', likePlate);
    document.getElementById('shareBtn').addEventListener('click', sharePlate);
    document.getElementById('deleteBtn').addEventListener('click', deletePlate);
    
    // Navigation
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
            document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
            e.target.classList.add('active');
        });
    });
}

// Add new plate
function addNewPlate(e) {
    e.preventDefault();
    
    const plateNumber = document.getElementById('plateNumber').value.trim();
    const carType = document.getElementById('carType').value.trim();
    const ownerName = document.getElementById('ownerName').value.trim();
    const plateCategory = document.getElementById('plateCategory').value;
    const description = document.getElementById('plateDescription').value.trim();
    const imageUrl = document.getElementById('plateImage').value.trim();
    
    if (!plateNumber || !carType || !ownerName || !plateCategory) {
        alert('يرجى ملء جميع الحقول المطلوبة!');
        return;
    }
    
    const newPlate = {
        id: Date.now(),
        number: plateNumber,
        carType: carType,
        owner: ownerName,
        category: plateCategory,
        description: description || 'لا يوجد وصف',
        image: imageUrl || 'https://via.placeholder.com/400x200?text=' + encodeURIComponent(plateNumber),
        date: new Date().toLocaleDateString('ar-SA'),
        views: 0,
        likes: 0
    };
    
    plates.unshift(newPlate);
    saveToStorage();
    renderPlates();
    updateStats();
    
    // Reset form
    document.getElementById('addPlateForm').reset();
    alert('تم إضافة اللوحة بنجاح! 🎉');
    
    // Scroll to gallery
    document.getElementById('gallery').scrollIntoView({ behavior: 'smooth' });
}

// Render plates gallery
function renderPlates() {
    const gallery = document.getElementById('platesGallery');
    const emptyState = document.getElementById('emptyState');
    const platesCount = document.getElementById('platesCount');
    
    gallery.innerHTML = '';
    
    if (plates.length === 0) {
        emptyState.style.display = 'block';
        platesCount.textContent = 'عدد اللوحات: 0';
        return;
    }
    
    emptyState.style.display = 'none';
    platesCount.textContent = `عدد اللوحات: ${plates.length}`;
    
    plates.forEach(plate => {
        const card = createPlateCard(plate);
        gallery.appendChild(card);
    });
}

// Create plate card
function createPlateCard(plate) {
    const card = document.createElement('div');
    card.className = 'plate-card';
    
    const categoryColors = {
        'اقتصادية': '🟢',
        'عائلية': '🔵',
        'فاخرة': '🟡',
        'رياضية': '🔴',
        'نادرة': '🟣'
    };
    
    card.innerHTML = `
        <div class="plate-image">
            <img src="${plate.image}" alt="${plate.number}" onerror="this.src='https://via.placeholder.com/400x200?text=${encodeURIComponent(plate.number)}'">
        </div>
        <div class="plate-info">
            <div class="plate-number">${plate.number}</div>
            <div class="plate-category">${categoryColors[plate.category]} ${plate.category}</div>
            <div class="plate-details">
                <div class="detail">
                    <strong>السيارة:</strong>
                    <span>${plate.carType}</span>
                </div>
                <div class="detail">
                    <strong>المالك:</strong>
                    <span>${plate.owner}</span>
                </div>
                <div class="detail">
                    <strong>التاريخ:</strong>
                    <span>${plate.date}</span>
                </div>
            </div>
            <div class="plate-stats">
                <span>👁️ ${plate.views}</span>
                <span>❤️ ${plate.likes}</span>
            </div>
        </div>
    `;
    
    card.addEventListener('click', () => showPlateDetails(plate));
    
    return card;
}

// Show plate details in modal
function showPlateDetails(plate) {
    currentPlate = plate;
    plate.views++;
    totalViews++;
    saveToStorage();
    updateStats();
    
    document.getElementById('modalPlateNumber').textContent = plate.number;
    document.getElementById('modalCarType').textContent = plate.carType;
    document.getElementById('modalOwnerName').textContent = plate.owner;
    document.getElementById('modalCategory').textContent = plate.category;
    document.getElementById('modalDate').textContent = plate.date;
    document.getElementById('modalViews').textContent = plate.views;
    document.getElementById('modalDescription').textContent = plate.description;
    document.getElementById('modalPlateImage').src = plate.image;
    document.getElementById('modalPlateImage').onerror = function() {
        this.src = 'https://via.placeholder.com/600x300?text=' + encodeURIComponent(plate.number);
    };
    
    document.getElementById('plateModal').classList.add('show');
}

// Close modal
function closeModal() {
    document.getElementById('plateModal').classList.remove('show');
    currentPlate = null;
}

// Like plate
function likePlate() {
    if (!currentPlate) return;
    
    currentPlate.likes++;
    saveToStorage();
    document.getElementById('modalViews').textContent = currentPlate.likes;
    
    const btn = document.getElementById('likeBtn');
    btn.style.background = '#ff5252';
    btn.textContent = '❤️ تم الإعجاب!';
    
    setTimeout(() => {
        btn.style.background = '';
        btn.textContent = '❤️ إعجاب';
    }, 2000);
    
    renderPlates();
}

// Share plate
function sharePlate() {
    if (!currentPlate) return;
    
    const text = `شاهد اللوحة الرائعة: ${currentPlate.number}\nالسيارة: ${currentPlate.carType}\nالمالك: ${currentPlate.owner}`;
    
    if (navigator.share) {
        navigator.share({
            title: 'لوحة سعودية',
            text: text
        });
    } else {
        // Fallback
        alert('تم نسخ تفاصيل اللوحة:\n' + text);
    }
}

// Delete plate
function deletePlate() {
    if (!currentPlate) return;
    
    if (confirm('هل تريد حذف هذه اللوحة؟')) {
        plates = plates.filter(p => p.id !== currentPlate.id);
        saveToStorage();
        renderPlates();
        updateStats();
        closeModal();
        alert('تم حذف اللوحة بنجاح!');
    }
}

// Filter plates
function filterPlates() {
    const searchText = document.getElementById('searchInput').value.toLowerCase();
    const category = document.getElementById('categoryFilter').value;
    
    const filtered = plates.filter(plate => {
        const matchSearch = plate.number.includes(searchText) || 
                          plate.owner.toLowerCase().includes(searchText) ||
                          plate.carType.toLowerCase().includes(searchText);
        const matchCategory = category === '' || plate.category === category;
        
        return matchSearch && matchCategory;
    });
    
    // Render filtered results
    const gallery = document.getElementById('platesGallery');
    gallery.innerHTML = '';
    
    if (filtered.length === 0) {
        gallery.innerHTML = '<div class="empty-state" style="grid-column: 1/-1;">لا توجد لوحات تطابق البحث 😞</div>';
        return;
    }
    
    filtered.forEach(plate => {
        const card = createPlateCard(plate);
        gallery.appendChild(card);
    });
    
    document.getElementById('platesCount').textContent = `عدد النتائج: ${filtered.length}`;
}

// Sort plates
function sortPlates() {
    const sortBy = document.getElementById('sortFilter').value;
    
    switch(sortBy) {
        case 'newest':
            plates.sort((a, b) => b.id - a.id);
            break;
        case 'popular':
            plates.sort((a, b) => b.likes - a.likes);
            break;
        case 'views':
            plates.sort((a, b) => b.views - a.views);
            break;
    }
    
    renderPlates();
}

// Update statistics
function updateStats() {
    document.getElementById('totalPlates').textContent = plates.length;
    document.getElementById('viewedPlates').textContent = totalViews;
}

// Add sample plates
function addSamplePlates() {
    if (plates.length > 0) return;
    
    const samples = [
        {
            id: 1,
            number: 'ض 1 أ',
            carType: 'Rolls-Royce Ghost',
            owner: 'الأمير خالد',
            category: 'فاخرة',
            description: 'لوحة نادرة جداً برقم فردي مشهور',
            image: 'https://images.unsplash.com/photo-1600886811228-8adcbb1c4d21?w=400',
            date: new Date().toLocaleDateString('ar-SA'),
            views: 125,
            likes: 89
        },
        {
            id: 2,
            number: 'ط 999 س د',
            carType: 'Mercedes-Benz S500',
            owner: 'أحمد محمد',
            category: 'فاخرة',
            description: 'لوحة مميزة برقم متشابه جداً',
            image: 'https://images.unsplash.com/photo-1553882900-f2b06423ff54?w=400',
            date: new Date().toLocaleDateString('ar-SA'),
            views: 98,
            likes: 76
        },
        {
            id: 3,
            number: 'م 111 ج',
            carType: 'Ferrari F8 Tributo',
            owner: 'فهد العتيبي',
            category: 'رياضية',
            description: 'سيارة رياضية فاخرة جداً',
            image: 'https://images.unsplash.com/photo-1552821081-f83b6d6ed60e?w=400',
            date: new Date().toLocaleDateString('ar-SA'),
            views: 234,
            likes: 156
        }
    ];
    
    plates = samples;
    totalViews = samples.reduce((sum, p) => sum + p.views, 0);
    saveToStorage();
    renderPlates();
    updateStats();
}

// Save to local storage
function saveToStorage() {
    localStorage.setItem('saudiPlates', JSON.stringify(plates));
    localStorage.setItem('totalViews', totalViews.toString());
}

// Load from local storage
function loadFromStorage() {
    const stored = localStorage.getItem('saudiPlates');
    if (stored) {
        plates = JSON.parse(stored);
    }
    
    const viewsStored = localStorage.getItem('totalViews');
    if (viewsStored) {
        totalViews = parseInt(viewsStored);
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', init);
