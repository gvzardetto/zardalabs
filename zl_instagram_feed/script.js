// Function to extract user ID from inputUrl
function extractUserId(inputUrl) {
    try {
        const url = new URL(inputUrl);
        const pathSegments = url.pathname.split('/');
        // Assuming the username is the first segment after instagram.com/
        if (pathSegments.length > 1) {
            return pathSegments[1];
        }
        return null;
    } catch (error) {
        console.error("Error parsing URL:", error);
        return null;
    }
}

// Function to load the SVG configuration from JSON file
async function loadSvgConfig() {
    try {
        const response = await fetch('svg_config.json');
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const config = await response.json();
        return config;
    } catch (error) {
        console.error('Error loading SVG config:', error);
        return { instagramSvgPath: '' }; // Return a default value in case of error
    }
}

// Function to load the Instagram account categories from JSON file
async function loadAccountCategories() {
    try {
        const response = await fetch('instagram_account_categories.json');
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const config = await response.json();
        return config;
    } catch (error) {
        console.error('Error loading account categories:', error);
        return []; // Return an empty array in case of error
    }
}

async function loadData(filterUserId = null, filterCategory = null) {
    try {
        const svgConfig = await loadSvgConfig(); // Load the config
        const response = await fetch('instagram_posts.json');
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        let posts = await response.json();

        // Load account categories
        const accountCategories = await loadAccountCategories();

        // Filter posts by user ID and category if provided
        if (filterUserId || filterCategory) {
            posts = posts.filter(post => {
                const userId = extractUserId(post.inputUrl);
                const account = accountCategories.find(acc => acc.property_name === userId);

                let userMatch = true;
                let categoryMatch = true;

                if (filterUserId) {
                    userMatch = userId === filterUserId;
                }

                if (filterCategory) {
                    categoryMatch = account && account.property_category.includes(filterCategory);
                }

                return userMatch && categoryMatch;
            });
        }

        // Sort posts by timestamp (newest to oldest) - Descending Order
        posts.sort((a, b) => {
            const dateA = new Date(a.timestamp);
            const dateB = new Date(b.timestamp);
            return dateB - dateA; // Sort in descending order
        });

        // Get username and date (replace with actual data if available)
        function getUsernameAndDate(post) {
            const userId = extractUserId(post.inputUrl); // Use the post's inputUrl
            const timestamp = post.timestamp; // Get the timestamp from the post
            let formattedDate = '';

            if (timestamp) {
                const date = new Date(timestamp); // Create a Date object from the timestamp
                const year = date.getFullYear();
                const month = String(date.getMonth() + 1).padStart(2, '0');
                const day = String(date.getDate()).padStart(2, '0');
                formattedDate = `${year}-${month}-${day}`;
            } else {
                formattedDate = 'Date not available'; // Handle cases where timestamp is missing
            }

            return { username: userId, date: formattedDate };
        }

        const container = document.querySelector('.post-container');
        container.innerHTML = ''; // Clear previous content

        // Display all posts after filtering
        posts.forEach(post => {
            const { username, date } = getUsernameAndDate(post);
            const postDiv = document.createElement('div');
            postDiv.classList.add('instagram-post-container'); // Use the new class
            postDiv.innerHTML = `
              <div class="title-bar">
                <span>@${username}</span> - <span>${date}</span>
              </div>
              <blockquote class="instagram-media" data-instgrm-captioned data-instgrm-permalink="${post.url}?utm_source=ig_embed&utm_campaign=loading" data-instgrm-version="12" style=" background:#FFF; border:0; border-radius:3px; box-shadow:0 0 1px 0 rgba(0,0,0,0.5),0 1px 10px 0 rgba(0,0,0,0.15); margin: 1px; max-width:540px; min-width:326px; padding:0; width:99.375%; width:-webkit-calc(100% - 2px); width:calc(100% - 2px);">
                 <div style="padding:16px;">
                    <a href="${post.url}?utm_source=ig_embed&utm_campaign=loading" style=" background:#FFFFFF; line-height:0; padding:0 0; text-align:center; text-decoration:none; width:100%;" target="_blank">
                       <div style=" display: flex; flex-direction: row; align-items: center;">
                          <div style="background-color: #F4F4F4; border-radius: 50%; flex-grow: 0; height: 40px; margin-right: 14px; width: 40px;"></div>
                          <div style="display: flex; flex-direction: column; flex-grow: 1; justify-content: center;">
                             <div style=" background-color: #F4F4F4; border-radius: 4px; flex-grow: 0; height: 14px; margin-bottom: 6px; width: 100px;"></div>
                             <div style=" background-color: #F4F4F4; border-radius: 4px; flex-grow: 0; height: 14px; width: 60px;"></div>
                          </div>
                       </div>
                       <div style="padding: 19% 0;"></div>
                       <div style="display:block; height:50px; margin:0 auto 12px; width:50px;">
                          <svg width="50px" height="50px" viewBox="0 0 60 60" version="1.1" xmlns="https://www.w3.org/2000/svg" xmlns:xlink="https://www.w3.org/1999/xlink">
                             <g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
                                <g transform="translate(-511.000000, -20.000000)" fill="#000000">
                                   <g>
                                      <path d="${svgConfig.instagramSvgPath}"></path>
                                   </g>
                                </g>
                             </g>
                          </svg>
                       </div>
                       <div style="padding-top: 8px;">
                          <div style=" color:#3897f0; font-family:Arial,sans-serif; font-size:14px; font-style:normal; font-weight:550; line-height:18px;"> View this post on Instagram</div>
                       </div>
                       <div style="padding: 12.5% 0;"></div>
                       <div style="display: flex; flex-direction: row; margin-bottom: 14px; align-items: center;">
                          <div>
                             <div style="background-color: #F4F4F4; border-radius: 50%; height: 12.5px; width: 12.5px; transform: translateX(0px) translateY(7px);"></div>
                             <div style="background-color: #F4F4F4; height: 12.5px; transform: rotate(-45deg) translateX(3px) translateY(1px); width: 12.5px; flex-grow: 0; margin-right: 14px; margin-left: 2px;"></div>
                             <div style="background-color: #F4F4F4; border-radius: 50%; height: 12.5px; width: 12.5px; transform: translateX(9px) translateY(-18px);"></div>
                          </div>
                          <div style="margin-left: 8px;">
                             <div style=" background-color: #F4F4F4; border-radius: 50%; flex-grow: 0; height: 20px; width: 20px;"></div>
                             <div style=" width: 0; height: 0; border-top: 2px solid transparent; border-left: 6px solid #f4f4f4; border-bottom: 2px solid transparent; transform: translateX(16px) translateY(-4px) rotate(30deg)"></div>
                          </div>
                          <div style="margin-left: auto;">
                             <div style=" width: 0px; border-top: 8px solid #F4F4F4; border-right: 8px solid transparent; transform: translateY(16px);"></div>
                             <div style=" background-color: #F4F4F4; flex-grow: 0; height: 12px; width: 16px; transform: translateY(-4px);"></div>
                             <div style=" width: 0; height: 0; border-top: 8px solid #F4F4F4; border-left: 8px solid transparent; transform: translateY(-4px) translateX(8px);"></div>
                          </div>
                       </div>
                    </a>
                 </div>
              </blockquote>
            `;
            container.appendChild(postDiv);
        });

        // Load the embed script for Instagram to render the embedded posts.
        const script = document.createElement('script');
        script.src = '//www.instagram.com/embed.js';
        script.async = true;

        script.onload = function() {
            // Now that the script is loaded, process the embeds
            if (typeof instgrm !== 'undefined') {
                instgrm.Embeds.process();
            }

            // Hide loading overlay when Instagram embed script is loaded AND processed
            document.getElementById('loading-overlay').style.display = 'none';
        };

        script.onerror = function() {
            document.getElementById('loading-overlay').textContent = 'Error loading Instagram script.';
        };

        document.body.appendChild(script);

    } catch (error) {
        console.error('Error loading data:', error);
        document.getElementById('loading-overlay').textContent = 'Error loading Instagram posts.'; // Update loading message on error
    }
}

// Function to populate the dropdown with user IDs
async function populateDropdown() {
    try {
        const response = await fetch('instagram_posts.json');
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const posts = await response.json();

        const selectElement = document.getElementById('user-id-select');
        const userIds = new Set(); // Use a Set to avoid duplicate user IDs

        posts.forEach(post => {
            const userId = extractUserId(post.inputUrl);
            if (userId) {
                userIds.add(userId);
            }
        });

        // Add options to the dropdown
        userIds.forEach(userId => {
            const option = document.createElement('option');
            option.value = userId;
            option.textContent = userId;
            selectElement.appendChild(option);
        });

    } catch (error) {
        console.error('Error populating dropdown:', error);
    }
}
// Function to populate the category dropdown
async function populateCategoryDropdown() {
    try {
        const accountCategories = await loadAccountCategories();

        const selectElement = document.getElementById('category-select');
        const categories = new Set(); // Use a Set to avoid duplicate categories

        accountCategories.forEach(account => {
            account.property_category.forEach(category => {
                categories.add(category);
            });
        });

        // Add options to the dropdown
        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category;
            option.textContent = category;
            selectElement.appendChild(option);
        });

    } catch (error) {
        console.error('Error populating category dropdown:', error);
    }
}
// Function to filter posts based on user ID
function filterPosts() {
    const userId = document.getElementById('user-id-select').value;
    const category = document.getElementById('category-select').value;
    loadData(userId, category);
}
// Initial load of data and populate the dropdown
populateDropdown();
populateCategoryDropdown();
loadData();