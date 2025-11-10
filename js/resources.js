// js/resources.js - Resources loading and search functionality

class ResourcesManager {
    constructor() {
        this.resourcesData = {};
        this.filteredResources = [];
        this.currentCategory = 'all';
        this.searchQuery = '';
        this.init();
    }

    async init() {
        await this.loadResourcesData();
        this.setupEventListeners();
        
        if (document.getElementById('resources-container')) {
            this.displayAllResources();
        }
    }

    // Load resources data from JSON file
    async loadResourcesData() {
        try {
            const response = await fetch('./data/resources.json');
            if (!response.ok) {
                throw new Error('Failed to load resources data');
            }
            this.resourcesData = await response.json();
            
            // Flatten all resources for searching
            this.allResources = Object.values(this.resourcesData).flat();
            this.filteredResources = [...this.allResources];
            
            console.log(Loaded resources:, Object.keys(this.resourcesData).map(key => ({
                category: key,
                count: this.resourcesData[key].length
            })));
        } catch (error) {
            console.error('Error loading resources:', error);
            this.showErrorMessage('Failed to load resources. Please check your connection.');
        }
    }

    // Display all resources
    displayAllResources() {
        const container = document.getElementById('resources-container');
        if (!container) return;

        if (this.filteredResources.length === 0) {
            container.innerHTML = this.getNoResultsHTML();
            return;
        }

        // Group by category for display
        const groupedResources = this.groupResourcesByCategory(this.filteredResources);
        
        let html = '';
        
        if (this.currentCategory === 'all') {
            // Show all categories
            Object.keys(groupedResources).forEach(category => {
                html += this.createCategorySection(category, groupedResources[category]);
            });
        } else {
            // Show only current category
            html = this.createCategorySection(this.currentCategory, groupedResources[this.currentCategory] || []);
        }

        container.innerHTML = html;
        
        // Add animations
        setTimeout(() => {
            container.querySelectorAll('.resource-item').forEach((item, index) => {
                item.style.animationDelay = ${index * 0.1}s;
                item.classList.add('fade-in');
            });
        }, 100);
    }

    // Group resources by category
    groupResourcesByCategory(resources) {
        const grouped = {};
        
        resources.forEach(resource => {
            // Find which category this resource belongs to
            const category = Object.keys(this.resourcesData).find(cat => 
                this.resourcesData[cat].some(item => item.id === resource.id)
            );
            
            if (category) {
                if (!grouped[category]) {
                    grouped[category] = [];
                }
                grouped[category].push(resource);
            }
        });
        
        return grouped;
    }

    // Create category section HTML
    createCategorySection(category, resources) {
        const categoryInfo = this.getCategoryInfo(category);
        
        return `
            <section class="resource-category-section" id="${category}">
                <div class="category-header">
                    <h2>${categoryInfo.icon} ${categoryInfo.name}</h2>
                    <span class="resource-count">${resources.length} ${resources.length === 1 ? 'resource' : 'resources'}</span>
                </div>
                <div class="resources-list">
                    ${resources.map(resource => this.createResourceCard(resource)).join('')}
                </div>
            </section>
        `;
    }

    // Create individual resource card
    createResourceCard(resource) {
        const imageUrl = resource.image_url || this.getDefaultImage(resource.type);
        
        return `
            <div class="resource-item">
                <img src="${imageUrl}" alt="${resource.name}" class="resource-image" loading="lazy">
                <div class="resource-details">
                    <div class="resource-header">
                        <h3>${resource.name}</h3>
                        <span class="resource-type">${this.getTypeDisplayName(resource.type)}</span>
                    </div>
                    <div class="resource-location">
                        <span class="location-icon">📍</span>
                        ${resource.location}
                    </div>
                    ${resource.services && resource.services.length ? `
                        <div class="resource-services">
                            ${resource.services.map(service => `
                                <span class="service-tag">${service}</span>
                            `).join('')}
                        </div>
                    ` : ''}
                    <div class="resource-info">
                        ${resource.hours ? `
                            <div class="info-item">
                                <span class="info-label">Hours:</span>
                                <span class="info-value">${resource.hours}</span>
                            </div>
                        ` : ''}
                        ${resource.contact ? `
                            <div class="info-item">
                                <span class="info-label">Contact:</span>
                                <a href="tel:${resource.contact}" class="info-value contact-link">${resource.contact}</a>
                            </div>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;
    }

    // Get category information
    getCategoryInfo(category) {
        const categories = {
            'health_facilities': { name: 'Health Facilities', icon: '🏥' },
            'agricultural_services': { name: 'Agricultural Services', icon: '🌱' },
            'educational_resources': { name: 'Educational Resources', icon: '📚' },
            'government_offices': { name: 'Government Offices', icon: '🏛' }
        };
        return categories[category] || { name: category, icon: '📁' };
    }

    // Get default image based on resource type
    getDefaultImage(type) {
        const defaultImages = {
            'hospital': 'https://images.unsplash.com/photo-1516549655669-dfbf4e8e11d9?w=400&h=250&fit=crop',
            'health_center': 'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?w=400&h=250&fit=crop',
            'cooperative': 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=400&h=250&fit=crop',
            'government': 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400&h=250&fit=crop',
            'library': 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=400&h=250&fit=crop',
            'training_center': 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=400&h=250&fit=crop',
            'veterinary': 'https://images.unsplash.com/photo-1543944168-7d189a4d4e82?w=400&h=250&fit=crop'
        };
        return defaultImages[type] || 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&h=250&fit=crop';
    }

    // Get display name for resource type
    getTypeDisplayName(type) {
        const typeNames = {
            'hospital': 'Hospital',
            'health_center': 'Health Center',
            'cooperative': 'Cooperative',
            'government': 'Government Office',
            'library': 'Library',
            'training_center': 'Training Center',
            'veterinary': 'Veterinary Service',
            'education_office': 'Education Office',
            'administration': 'Administration'
        };
        return typeNames[type] || type;
    }

    // Filter resources by category
    filterResources(category) {
        this.currentCategory = category;
        
        if (category === 'all') {
            this.filteredResources = [...this.allResources];
        } else {
            this.filteredResources = this.resourcesData[category] || [];
        }
        
        // Apply search filter if exists
        if (this.searchQuery) {
            this.searchResources(this.searchQuery);
        } else {
            this.displayAllResources();
        }
        
        this.updateActiveCategoryButton(category);
        
        // Scroll to category section
        if (category !== 'all') {
            setTimeout(() => {
                const element = document.getElementById(category);
                if (element) {
                    element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            }, 100);
        }
    }

    // Search resources
    searchResources(query) {
        this.searchQuery = query.toLowerCase().trim();
        
        let resourcesToSearch;
        if (this.currentCategory === 'all') {
            resourcesToSearch = this.allResources;
        } else {
            resourcesToSearch = this.resourcesData[this.currentCategory] || [];
        }
        
        if (!this.searchQuery) {
            this.filteredResources = resourcesToSearch;
        } else {
            this.filteredResources = resourcesToSearch.filter(resource =>
                resource.name.toLowerCase().includes(this.searchQuery) ||
                resource.location.toLowerCase().includes(this.searchQuery) ||
                (resource.services && resource.services.some(service => 
                    service.toLowerCase().includes(this.searchQuery)
                )) ||
                resource.type.toLowerCase().includes(this.searchQuery)
            );
        }
        
        this.displayAllResources();
    }

    // Update active category button
    updateActiveCategoryButton(activeCategory) {
        const categoryButtons = document.querySelectorAll('.category-nav-btn');
        categoryButtons.forEach(btn => {
            if (btn.dataset.category === activeCategory) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
    }

    // Setup event listeners
    setupEventListeners() {
        // Category filter buttons
        const categoryButtons = document.querySelectorAll('.category-nav-btn');
        categoryButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                this.filterResources(btn.dataset.category);
            });
        });

        // Search functionality
        const searchInput = document.getElementById('resource-search');
        if (searchInput) {
            searchInput.addEventListener('input', debounce((e) => {
                this.searchResources(e.target.value);
            }, 300));
        }

        // Contact link clicks
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('contact-link')) {
                e.preventDefault();
                const phoneNumber = e.target.textContent;
                if (confirm(Call ${phoneNumber}?)) {
                    window.location.href = tel:${phoneNumber};
                }
            }
        });
    }

    // Show no results message
    getNoResultsHTML() {
        return `
            <div class="no-results">
                <div class="no-results-icon">🔍</div>
                <h3>No Resources Found</h3>
                <p>Try adjusting your search or filter criteria.</p>
                <button onclick="window.resourcesManager.filterResources('all')" class="clear-filters-btn">
                    Show All Resources
                </button>
            </div>
        `;
    }

    // Show error message
    showErrorMessage(message) {
        const container = document.getElementById('resources-container');
        if (container) {
            container.innerHTML = `
                <div class="error-message">
                    <div class="error-icon">❌</div>
                    <h3>Unable to Load Resources</h3>
                    <p>${message}</p>
                    <button onclick="window.resourcesManager.loadResourcesData()" class="retry-btn">Try Again</button>
                </div>
            `;
        }
    }
}

// Initialize resources manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.resourcesManager = new ResourcesManager();
});

// Add CSS for resources
const resourcesStyles = `
    .resource-category-section {
        margin-bottom: 3rem;
    }
    
    .category-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1.5rem;
        padding-bottom: 0.5rem;
        border-bottom: 2px solid #e1e8ed;
    }
    
    .category-header h2 {
        margin: 0;
        color: #2c5530;
    }
    
    .resource-count {
        background: #2c5530;
        color: white;
        padding: 0.25rem 0.75rem;
        border-radius: 20px;
        font-size: 0.9rem;
        font-weight: 500;
    }
    
    .resources-list {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
        gap: 1.5rem;
    }
    
    .resource-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 0.5rem;
    }
    
    .resource-header h3 {
        margin: 0;
        flex: 1;
    }
    
    .resource-type {
        background: #e1e8ed;
        padding: 0.25rem 0.5rem;
        border-radius: 4px;
        font-size: 0.8rem;
        color: #7f8c8d;
        margin-left: 0.5rem;
    }
    
    .resource-location {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        color: #7f8c8d;
        margin-bottom: 1rem;
        font-size: 0.9rem;
    }
    
    .resource-info {
        margin-top: 1rem;
    }
    
    .info-item {
        display: flex;
        justify-content: between;
        margin-bottom: 0.5rem;
        font-size: 0.9rem;
    }
    
    .info-label {
        font-weight: 500;
        color: #2c3e50;
        min-width: 80px;
    }
    
    .info-value {
        color: #7f8c8d;
        flex: 1;
    }
    
    .contact-link {
        color: #2c5530;
        text-decoration: none;
    }
    
    .contact-link:hover {
        text-decoration: underline;
    }
    
    .no-results {
        text-align: center;
        padding: 3rem 1rem;
        color: #7f8c8d;
    }
    
    .no-results-icon {
        font-size: 3rem;
        margin-bottom: 1rem;
    }
    
    .clear-filters-btn {
        background: #2c5530;
        color: white;
        border: none;
        padding: 0.5rem 1rem;
        border-radius: 4px;
        cursor: pointer;
        margin-top: 1rem;
    }
    
    @media (max-width: 768px) {
        .resources-list {
            grid-template-columns: 1fr;
        }
        
        .category-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 0.5rem;
        }
        
        .resource-header {
            flex-direction: column;
            align-items: flex-start;
        }
        
        .resource-type {
            margin-left: 0;
            margin-top: 0.25rem;
        }
    }
`;

// Inject styles
if (!document.querySelector('#resources-styles')) {
    const styleSheet = document.createElement('style');
    styleSheet.id = 'resources-styles';
    styleSheet.textContent = resourcesStyles;
    document.head.appendChild(styleSheet);
}