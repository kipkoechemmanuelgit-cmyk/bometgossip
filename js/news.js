// js/news.js - News loading and display functionality

class NewsManager {
    constructor() {
        this.newsData = [];
        this.filteredNews = [];
        this.currentFilter = 'all';
        this.init();
    }

    async init() {
        await this.loadNewsData();
        this.setupEventListeners();
        
        // Load appropriate news based on current page
        if (document.getElementById('news-container')) {
            this.displayLatestNews();
        }
        if (document.getElementById('all-news-container')) {
            this.displayAllNews();
        }
        if (document.getElementById('important-news-container')) {
            this.displayImportantNews();
        }
    }

    // Load news data from JSON file
    async loadNewsData() {
        try {
            const response = await fetch('./data/news.json');
            if (!response.ok) {
                throw new Error('Failed to load news data');
            }
            const data = await response.json();
            this.newsData = data.news;
            this.filteredNews = [...this.newsData];
            
            console.log(Loaded ${this.newsData.length} news articles);
        } catch (error) {
            console.error('Error loading news:', error);
            this.showErrorMessage('Failed to load news. Please check your connection.');
        }
    }

    // Display latest news on homepage
    displayLatestNews() {
        const container = document.getElementById('news-container');
        if (!container) return;

        if (this.newsData.length === 0) {
            container.innerHTML = '<div class="loading">Loading latest news...</div>';
            return;
        }

        // Get 3 latest news items
        const latestNews = this.newsData
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, 3);

        container.innerHTML = latestNews.map(news => this.createNewsCard(news)).join('');
        
        // Add click events to news cards
        this.attachNewsClickEvents();
    }

    // Display all news on news page
    displayAllNews() {
        const container = document.getElementById('all-news-container');
        if (!container) return;

        if (this.filteredNews.length === 0) {
            container.innerHTML = '<div class="no-news">No news articles found for the selected filter.</div>';
            return;
        }

        const sortedNews = this.filteredNews.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        container.innerHTML = sortedNews.map(news => this.createNewsCard(news, true)).join('');
        
        // Add click events to news cards
        this.attachNewsClickEvents();
    }

    // Display important news
    displayImportantNews() {
        const container = document.getElementById('important-news-container');
        if (!container) return;

        const importantNews = this.newsData.filter(news => news.important);
        
        if (importantNews.length === 0) {
            container.innerHTML = '<div class="no-news">No important announcements at this time.</div>';
            return;
        }

        container.innerHTML = importantNews.map(news => `
            <div class="important-alert" data-article-id="${news.id}">
                <div class="alert-icon">⚠</div>
                <div class="alert-content">
                    <h4>${news.title}</h4>
                    <p>${news.summary}</p>
                    <small>${this.formatDate(news.date)} • ${news.source}</small>
                </div>
            </div>
        `).join('');

        // Add click events to important alerts
        document.querySelectorAll('.important-alert').forEach(alert => {
            alert.style.cursor = 'pointer';
            alert.addEventListener('click', () => {
                const articleId = alert.getAttribute('data-article-id');
                this.openArticle(articleId);
            });
        });
    }

    // Create news card HTML
    createNewsCard(news, expanded = false) {
        const cardClass = news.important ? 'news-card important' : 'news-card';
        const imageUrl = news.image_url || 'https://images.unsplash.com/photo-1585829365295-ab7cd400d167?w=400&h=250&fit=crop';
        
        return `
            <article class="${cardClass}" data-article-id="${news.id}">
                <img src="${imageUrl}" alt="${news.title}" class="news-image" loading="lazy">
                <div class="news-content">
                    <div class="news-meta">
                        <span class="news-date">${this.formatDate(news.date)}</span>
                        <span class="news-category ${news.category}">${this.getCategoryName(news.category)}</span>
                    </div>
                    <h3>${news.title}</h3>
                    <p class="news-summary">${news.summary}</p>
                    <div class="news-footer">
                        <span class="news-source">Source: ${news.source}</span>
                        <button class="read-more-btn" data-article-id="${news.id}">Read Full Article</button>
                    </div>
                </div>
            </article>
        `;
    }

    // Attach click events to news cards
    attachNewsClickEvents() {
        // Make entire news card clickable
        document.querySelectorAll('.news-card').forEach(card => {
            card.style.cursor = 'pointer';
            card.addEventListener('click', (e) => {
                // Don't trigger if clicking the read more button
                if (!e.target.classList.contains('read-more-btn')) {
                    const articleId = card.getAttribute('data-article-id');
                    this.openArticle(articleId);
                }
            });
        });

        // Read more buttons
        document.querySelectorAll('.read-more-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation(); // Prevent card click event
                const articleId = btn.getAttribute('data-article-id');
                this.openArticle(articleId);
            });
        });
    }

    // Open article in new page
    openArticle(articleId) {
        // Store the article ID in sessionStorage
        sessionStorage.setItem('currentArticleId', articleId);
        // Navigate to article page
        window.location.href = 'article.html';
    }

    // Get category display name
    getCategoryName(categoryId) {
        const categories = {
            'agriculture': '🌱 Agriculture',
            'health': '🏥 Health',
            'education': '📚 Education',
            'infrastructure': '🏗 Infrastructure',
            'market': '💰 Market',
            'weather': '🌦 Weather'
        };
        return categories[categoryId] || categoryId;
    }

    // Format date
    formatDate(dateString) {
        const options = { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric'
        };
        return new Date(dateString).toLocaleDateString('en-KE', options);
    }

    // Filter news by category
    filterNews(category) {
        this.currentFilter = category;
        
        if (category === 'all') {
            this.filteredNews = [...this.newsData];
        } else {
            this.filteredNews = this.newsData.filter(news => news.category === category);
        }
        
        this.displayAllNews();
        this.updateActiveFilterButton(category);
    }

    // Update active filter button
    updateActiveFilterButton(activeCategory) {
        const filterButtons = document.querySelectorAll('.filter-btn');
        filterButtons.forEach(btn => {
            if (btn.dataset.filter === activeCategory) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
    }

    // Setup event listeners
    setupEventListeners() {
        // News filter buttons
        const filterButtons = document.querySelectorAll('.filter-btn');
        filterButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                this.filterNews(btn.dataset.filter);
            });
        });
    }

    // Show error message
    showErrorMessage(message) {
        const container = document.getElementById('news-container') || 
                         document.getElementById('all-news-container');
        if (container) {
            container.innerHTML = `
                <div class="error-message">
                    <div class="error-icon">❌</div>
                    <h3>Unable to Load News</h3>
                    <p>${message}</p>
                    <button onclick="window.newsManager.loadNewsData()" class="retry-btn">Try Again</button>
                </div>
            `;
        }
    }
}

// Initialize news manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.newsManager = new NewsManager();
});