document.addEventListener('DOMContentLoaded', function () {

    function extractSourceFromUrl(url) {
        try {
            const urlObj = new URL(url);
            const hostname = urlObj.hostname;
            // Remove "www." prefix, if present
            let sourceName = hostname.replace(/^www\./, '');
            // Get only the part of the domain before the first '/'
            const parts = sourceName.split('/');
            sourceName = parts[0];
            return sourceName;
        } catch (error) {
            console.error('Error parsing URL:', error);
            return 'Unknown Source';
        }
    }

    async function loadNewsData(categoryFilter = '') {
        try {
            const response = await fetch('news.json');
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            let newsData = await response.json();

            // Filter by category if a category is selected
            if (categoryFilter !== '') {
                newsData = newsData.filter(news => news.category === categoryFilter);
            }

            // Sort newsData by pubDate in descending order (newest to oldest)
            newsData.sort((a, b) => {
                return new Date(b.pubDate) - new Date(a.pubDate);
            });

            const newsSection = document.getElementById('news-section');
            let newsHTML = '';

            newsData.forEach(news => {
                const sourceName = extractSourceFromUrl(news.link);
                newsHTML += `
                    <div class="news-item">
                        <h3><a href="${news.link}" target="_blank">${news.title}</a></h3>
                        <p class="news-summary">${news.summary}</p>
                        <p class="news-source">Source: <a href="${news.link}" target="_blank">${sourceName}</a> - Published Date: ${news.pubDate}</p>
                    </div>
                `;
            });

            newsSection.innerHTML = newsHTML;

        } catch (error) {
            console.error('Error loading news data:', error);
            document.getElementById('news-section').innerHTML = '<p>Failed to load news feed.</p>';
        }
    }

    // Initial load of data with all categories
    loadNewsData();

    // Function to apply the category filter
    window.filterNews = function () {
        const selectedCategory = document.getElementById('category-filter').value;
        loadNewsData(selectedCategory);
    };
});