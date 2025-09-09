// Global variables
let cart = [];
let currentCategoryId = null;
let allPlants = []; // To store all plants for "All Trees" view

// Load categories dynamically, including "All Trees"
async function loadCategories() {
    const categoriesDiv = document.getElementById('categories');
    const loadingSpinner = document.getElementById('loading-spinner');
    loadingSpinner.classList.add('show');

    try {
        const response = await fetch('https://openapi.programming-hero.com/api/categories');
        if (!response.ok) throw new Error('Failed to fetch categories');
        const data = await response.json();

        if (data.status !== true) throw new Error(data.message || 'API error');

        categoriesDiv.innerHTML = ''; // Clear any static content

        // Add "All Trees" as the first option
        const allTreesLi = document.createElement('li');
        allTreesLi.innerHTML = `<button class="category-item" data-id="all">All Trees</button>`;
        categoriesDiv.appendChild(allTreesLi);

        // Add individual categories
        data.categories.forEach(category => {
            const li = document.createElement('li');
            li.innerHTML = `<button class="category-item" data-id="${category.id}">${category.category_name}</button>`;
            categoriesDiv.appendChild(li);
        });

        // Add click handlers after rendering
        document.querySelectorAll('.category-item').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const id = e.target.getAttribute('data-id');
                if (id === 'all') {
                    await loadAllTrees(); // Load all plants
                } else {
                    loadTreesByCategory(id);
                }
                // Highlight active
                document.querySelectorAll('.category-item').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
            });
        });

        // Load "All Trees" by default
        currentCategoryId = 'all';
        await loadAllTrees();
        document.querySelector('.category-item').classList.add('active');
    } catch (error) {
        console.error('Error loading categories:', error);
        categoriesDiv.innerHTML = '<li class="error-message">Failed to load categories. Please try again.</li>';
        alert('Error loading categories: ' + error.message);
    } finally {
        loadingSpinner.classList.remove('show');
    }
}

// Load all trees by aggregating from all categories
async function loadAllTrees() {
    const treesGrid = document.getElementById('trees-grid');
    const loadingSpinner = document.getElementById('loading-spinner');
    treesGrid.innerHTML = '';
    loadingSpinner.classList.add('show');

    try {
        const response = await fetch('https://openapi.programming-hero.com/api/categories');
        if (!response.ok) throw new Error('Failed to fetch categories');
        const data = await response.json();

        if (data.status !== true) throw new Error(data.message || 'API error');

        allPlants = []; // Reset all plants
        for (const category of data.categories) {
            const catResponse = await fetch(`https://openapi.programming-hero.com/api/category/${category.id}`);
            if (!catResponse.ok) throw new Error(`Failed to fetch category ${category.id}`);
            const catData = await catResponse.json();
            if (catData.status === true) {
                allPlants = allPlants.concat(catData.plants || []);
            }
        }

        if (allPlants.length === 0) {
            treesGrid.innerHTML = '<div class="error-message col-span-full">No trees available.</div>';
            return;
        }

        allPlants.forEach(plant => {
            const card = document.createElement('div');
            card.className = 'card bg-white p-4 rounded-lg shadow-md';
            const shortDesc = plant.description ? plant.description.slice(0, 100) + '...' : 'No description available.';
            card.innerHTML = `
                <img src="${plant.image}" alt="${plant.name}" onerror="this.src='https://via.placeholder.com/300x200?text=No+Image'" class="w-full h-48 object-cover rounded">
                <h4 class="text-lg font-bold mt-2 cursor-pointer hover:text-green-600">${plant.name}</h4>
                <p class="text-gray-600 text-sm">${shortDesc}</p>
                <p class="text-sm text-gray-500 mt-1">Category: ${plant.category || 'N/A'}</p>
                <p class="text-sm font-semibold text-green-600 mt-1">Price: ৳${plant.price || 'N/A'}</p>
                <button class="bg-green-600 text-white px-4 py-2 rounded mt-2 w-full add-to-cart hover:bg-green-700" data-id="${plant.id}">Add to Cart</button>
            `;
            treesGrid.appendChild(card);

            // Event listeners
            card.querySelector('h4').addEventListener('click', () => showModal(plant.id));
            card.querySelector('.add-to-cart').addEventListener('click', () => addToCart(plant));
        });
    } catch (error) {
        console.error('Error loading all trees:', error);
        treesGrid.innerHTML = '<div class="error-message col-span-full">Failed to load trees. Please try again.</div>';
        alert('Error loading trees: ' + error.message);
    } finally {
        loadingSpinner.classList.remove('show');
    }
}

// Load plants by category (unchanged logic, updated currency)
async function loadTreesByCategory(categoryId) {
    const treesGrid = document.getElementById('trees-grid');
    const loadingSpinner = document.getElementById('loading-spinner');
    treesGrid.innerHTML = '';
    loadingSpinner.classList.add('show');
    currentCategoryId = categoryId;

    try {
        const response = await fetch(`https://openapi.programming-hero.com/api/category/${categoryId}`);
        if (!response.ok) throw new Error('Failed to fetch plants');
        const data = await response.json();

        if (data.status !== true) throw new Error(data.message || 'API error');

        const plants = data.plants || [];

        if (plants.length === 0) {
            treesGrid.innerHTML = '<div class="error-message col-span-full">No trees available in this category.</div>';
            return;
        }

        plants.forEach(plant => {
            const card = document.createElement('div');
            card.className = 'card bg-white p-4 rounded-lg shadow-md';
            const shortDesc = plant.description ? plant.description.slice(0, 100) + '...' : 'No description available.';
            card.innerHTML = `
                <img src="${plant.image}" alt="${plant.name}" onerror="this.src='https://via.placeholder.com/300x200?text=No+Image'" class="w-full h-48 object-cover rounded">
                <h4 class="text-lg font-bold mt-2 cursor-pointer hover:text-green-600">${plant.name}</h4>
                <p class="text-gray-600 text-sm">${shortDesc}</p>
                <p class="text-sm text-gray-500 mt-1">Category: ${plant.category || 'N/A'}</p>
                <p class="text-sm font-semibold text-green-600 mt-1">Price: ৳${plant.price || 'N/A'}</p>
                <button class="bg-green-600 text-white px-4 py-2 rounded mt-2 w-full add-to-cart hover:bg-green-700" data-id="${plant.id}">Add to Cart</button>
            `;
            treesGrid.appendChild(card);

            // Event listeners
            card.querySelector('h4').addEventListener('click', () => showModal(plant.id));
            card.querySelector('.add-to-cart').addEventListener('click', () => addToCart(plant));
        });
    } catch (error) {
        console.error('Error loading trees:', error);
        treesGrid.innerHTML = '<div class="error-message col-span-full">Failed to load trees. Please try again.</div>';
        alert('Error loading trees: ' + error.message);
    } finally {
        loadingSpinner.classList.remove('show');
    }
}

// Show modal with full details (updated currency)
async function showModal(plantId) {
    const modal = document.getElementById('tree-modal');
    modal.classList.add('show');

    try {
        const response = await fetch(`https://openapi.programming-hero.com/api/plant/${plantId}`);
        if (!response.ok) throw new Error('Failed to fetch plant details');
        const data = await response.json();

        if (data.status !== true) throw new Error(data.message || 'API error');

        const plant = data.plant;
        document.getElementById('modal-image').src = plant.image || 'https://via.placeholder.com/300x200?text=No+Image';
        document.getElementById('modal-title').textContent = plant.name || 'N/A';
        document.getElementById('modal-category').querySelector('span').textContent = plant.category || 'N/A';
        document.getElementById('modal-price').querySelector('span').textContent = plant.price || 'N/A';
        document.getElementById('modal-details').textContent = plant.description || 'No details available.';
    } catch (error) {
        console.error('Error loading plant details:', error);
        document.getElementById('modal-details').innerHTML = '<p class="text-red-500">Failed to load details: ' + error.message + '</p>';
    }

    // Close modal
    document.getElementById('close-modal').onclick = () => modal.classList.remove('show');
    modal.onclick = (e) => { if (e.target === modal) modal.classList.remove('show'); };
}

// Cart functions (updated currency)
function addToCart(plant) {
    cart.push(plant);
    updateCart();
    alert(`${plant.name} added to cart!`);
}

function updateCart() {
    const cartItems = document.getElementById('cart-items');
    const cartTotal = document.getElementById('cart-total');
    cartItems.innerHTML = '';
    let total = 0;

    cart.forEach((item, index) => {
        const li = document.createElement('li');
        li.className = 'flex justify-between items-center p-2 bg-gray-50 rounded';
        li.innerHTML = `
            ${item.name} x1 - ৳${item.price || 0}
            <button class="remove-item bg-red-500 text-white px-2 py-1 rounded ml-2" data-index="${index}">✖</button>
        `;
        cartItems.appendChild(li);
        total += item.price || 0;
    });

    cartTotal.textContent = total.toFixed(2);

    // Remove handlers
    document.querySelectorAll('.remove-item').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const index = parseInt(e.target.getAttribute('data-index'));
            cart.splice(index, 1);
            updateCart();
        });
    });
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    loadCategories();
});