// js/article.js - Article page functionality

class ArticleManager {
    constructor() {
        this.newsData = [];
        this.currentArticle = null;
        this.init();
    }

    async init() {
        await this.loadNewsData();
        this.displayArticle();
        this.displayRelatedNews();
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
        } catch (error) {
            console.error('Error loading news:', error);
            this.showErrorMessage('Failed to load article. Please check your connection.');
        }
    }

    // Display the current article
    displayArticle() {
        const container = document.getElementById('article-container');
        const articleId = sessionStorage.getItem('currentArticleId');

        if (!articleId) {
            container.innerHTML = this.getErrorHTML('No article selected. Please go back to news and select an article.');
            return;
        }

        this.currentArticle = this.newsData.find(article => article.id == articleId);

        if (!this.currentArticle) {
            container.innerHTML = this.getErrorHTML('Article not found. Please select a different article.');
            return;
        }

        // Update page title
        document.title = ${this.currentArticle.title} - Bomet County Hub;

        container.innerHTML = this.createArticleHTML(this.currentArticle);
    }

    // Create article HTML
    createArticleHTML(article) {
        const imageUrl = article.image_url || 'https://images.unsplash.com/photo-1585829365295-ab7cd400d167?w=800&h=400&fit=crop';
        
        return `
            <article class="full-article">
                <div class="article-header">
                    <div class="article-meta">
                        <span class="article-date">${this.formatDate(article.date)}</span>
                        <span class="article-category ${article.category}">${this.getCategoryName(article.category)}</span>
                    </div>
                    <h1 class="article-title">${article.title}</h1>
                    <div class="article-source">
                        <strong>Source:</strong> ${article.source}
                        ${article.important ? '<span class="important-badge">Important</span>' : ''}
                    </div>
                </div>

                <div class="article-image">
                    <img src="${imageUrl}" alt="${article.title}" loading="lazy">
                </div>

                <div class="article-content">
                    <p class="article-summary"><strong>Summary:</strong> ${article.summary}</p>
                    <div class="article-full-text">
                        ${article.content || 'Full article content not available.'}
                    </div>
                </div>

                <div class="article-actions">
                    <button onclick="window.history.back()" class="back-btn">← Back to News</button>
                    <button onclick="window.print()" class="print-btn">🖨 Print Article</button>
                    <button onclick="this.shareArticle()" class="share-btn">📤 Share</button>
                </div>
            </article>
        `;
    }

    // Display related news
    displayRelatedNews() {
        const container = document.getElementById('related-news-container');
        if (!container || !this.currentArticle) return;

        // Get 3 related articles (same category, excluding current)
        const relatedNews = this.newsData
            .filter(article => 
                article.id !== this.currentArticle.id && 
                article.category === this.currentArticle.category
            )
            .slice(0, 3);

        if (relatedNews.length === 0) {
            container.innerHTML = '<p>No related articles found.</p>';
            return;
        }

        container.innerHTML = relatedNews.map(article => `
            <article class="news-card" data-article-id="${article.id}">
                <img src="${article.image_url}" alt="${article.title}" class="news-image" loading="lazy">
                <div class="news-content">
                    <div class="news-meta">
                        <span class="news-date">${this.formatDate(article.date)}</span>
                        <span class="news-category ${article.category}">${this.getCategoryName(article.category)}</span>
                    </div>
                    <h3>${article.title}</h3>
                    <p class="news-summary">${article.summary}</p>
                    <button class="read-more-btn" data-article-id="${article.id}">Read More</button>
                </div>
            </article>
        `).join('');

        // Add click events to related news
        this.attachRelatedNewsEvents();
    }

    // Attach events to related news
    attachRelatedNewsEvents() {
        document.querySelectorAll('#related-news-container .news-card, #related-news-container .read-more-btn').forEach(element => {
            element.addEventListener('click', (e) => {
                const articleId = element.getAttribute('data-article-id') || 
                                 element.closest('.news-card').getAttribute('data-article-id');
                
                sessionStorage.setItem('currentArticleId', articleId);
                window.location.reload();
            });
        });
    }

    // Share article
    shareArticle() {
        if (navigator.share && this.currentArticle) {
            navigator.share({
                title: this.currentArticle.title,
                text: this.currentArticle.summary,
                url: window.location.href,
            })
            .catch(error => console.log('Error sharing:', error));
        } else {
            // Fallback: copy to clipboard
            const tempInput = document.createElement('input');
            tempInput.value = window.location.href;
            document.body.appendChild(tempInput);
            tempInput.select();
            document.execCommand('copy');
            document.body.removeChild(tempInput);
            alert('Article link copied to clipboard!');
        }
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
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        };
        return new Date(dateString).toLocaleDateString('en-KE', options);
    }

    // Error HTML
    getErrorHTML(message) {
        return `
            <div class="error-message">
                <div class="error-icon">❌</div>
                <h3>Article Error</h3>
                <p>${message}</p>
                <button onclick="window.location.href='news.html'" class="retry-btn">Go to News</button>
            </div>
        `;
    }

    // Show error message
    showErrorMessage(message) {
        const container = document.getElementById('article-container');
        if (container) {
            container.innerHTML = this.getErrorHTML(message);
        }
    }
}

// Make shareArticle available globally
window.shareArticle = function() {
    if (window.articleManager) {
        window.articleManager.shareArticle();
    }
};

// Initialize article manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.articleManager = new ArticleManager();
});