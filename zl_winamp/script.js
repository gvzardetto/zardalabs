let albums; // Global variable to hold the albums data
let artists;
let showAll = false;

// Utility function to access artists and albums data safely
function getData(item) {
    //The output is a JSON so we can use it with the same method
    return item.output || item;
}
// Function to load artists data and populate carousels
async function loadArtistsData(artistsData, carouselId) {
    try {
        const carousel = document.getElementById(carouselId);
        //Clear all the childs
        while (carousel.firstChild) {
            carousel.removeChild(carousel.firstChild);
        }
        const maxItemsPerRow = 6;

        // Sort artists A to Z
        artistsData.sort((a, b) => {
            return getData(a).artist_name.localeCompare(getData(b).artist_name);
        });

        let currentRow;

        artistsData.forEach((artistData, index) => {
            const artist = getData(artistData); // Access the nested JSON structure

            if (index % maxItemsPerRow === 0) {
                currentRow = document.createElement('div');
                currentRow.classList.add('carousel-row');
                carousel.appendChild(currentRow);
            }

            const artistItem = document.createElement('div');
            artistItem.classList.add('carousel-item');

            const artistImage = document.createElement('img');
            artistImage.src = 'placeholder.gif';
            artistImage.alt = artist.artist_name;
            artistImage.dataset.src = artist.artist_image_url;

            artistImage.addEventListener('load', () => {
                artistImage.classList.add('loaded');
            });

            const artistName = document.createElement('h3');
            artistName.textContent = artist.artist_name;

            artistItem.appendChild(artistImage);
            artistItem.appendChild(artistName);


            artistItem.addEventListener('click', () => {
                window.open(`https://open.spotify.com/artist/${artist.artist_id}`, '_blank');
            });

            currentRow.appendChild(artistItem);
            artistImage.src = artistImage.dataset.src;
        });
    } catch (error) {
        console.error('Error loading artist', error)
    }
}

// Function to load Albums data and populate albums carousels
async function loadAlbumsData(albumsData, carouselId, showAll) {
    try {
        const carousel = document.getElementById(carouselId);
        //Ensure that we found it;
        if (carousel) {
            //Clear all the childs
            while (carousel.firstChild) {
                carousel.removeChild(carousel.firstChild);
            }

            const maxItemsPerRow = 6;
            let currentRow;

            const filteredAlbumsData = showAll ? albumsData : albumsData.filter(album => album.type === 'album');

            filteredAlbumsData.sort((a, b) => {
                const artistComparison = a.artist_name.localeCompare(b.artist_name);
                if (artistComparison !== 0) {
                    return artistComparison;
                }
                return new Date(b.album_release_date) - new Date(a.album_release_date);
            });

            filteredAlbumsData.forEach((album, index) => {
                if (index % maxItemsPerRow === 0) {
                    currentRow = document.createElement('div');
                    currentRow.classList.add('carousel-row');
                    carousel.appendChild(currentRow);
                }

                const albumItem = document.createElement('div');
                albumItem.classList.add('carousel-item');

                const albumName = document.createElement('h3');
                albumName.textContent = album.album_name;
                albumItem.appendChild(albumName);

                const albumImage = document.createElement('img');
                albumImage.src = 'placeholder.gif';
                albumImage.alt = album.album_name;
                albumImage.dataset.src = album.album_image_url;

                albumImage.addEventListener('load', () => {
                    albumImage.classList.add('loaded');
                });

                albumItem.appendChild(albumImage);

                const artistNameElement = document.createElement('p');
                artistNameElement.textContent = album.artist_name;
                artistNameElement.classList.add('album-artist-name');
                albumItem.appendChild(artistNameElement);

                const releaseDateElement = document.createElement('p');
                releaseDateElement.textContent = album.album_release_date;
                releaseDateElement.classList.add('album-release-date');
                albumItem.appendChild(releaseDateElement);

                albumItem.addEventListener('click', () => {
                    window.open(`https://open.spotify.com/album/${album.album_id}`, '_blank');
                });

                currentRow.appendChild(albumItem);
                albumImage.src = albumImage.dataset.src;
            });
        } else {
            console.error(`Carousel with ID ${carouselId} not found.`);
        }

    } catch (error) {
        console.error('Error loading albums', error);
    }
}

// Function to load data and perform initial setup
async function loadData() {
    try {
        const response = await fetch('artists.json'); // Fetch the JSON data
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`); // Handle HTTP errors
        }
        artists = await response.json(); // Parse the JSON data

        const albumResponse = await fetch('albums.json'); // Fetch the JSON data
        if (!albumResponse.ok) {
            throw new Error(`HTTP error! Status: ${albumResponse.status}`); // Handle HTTP errors
        }
        albums = await albumResponse.json(); // Parse the JSON data

        //Load Home carousels
        loadArtistsData(artists, 'artists-carousel');
        loadAlbumsData(albums, 'albums-carousel', false);

        //Load new carousels
        loadArtistsData(artists, 'artists-only-carousel');
        loadAlbumsData(albums, 'albums-only-carousel', false);
        loadAlbumsData(albums, 'singles-only-carousel', true);

        const stylesSubmenu = document.getElementById('styles-submenu');
        const moodsSubmenu = document.getElementById('moods-submenu');

        function getUniqueStyles(artists) {
            return [...new Set(artists.reduce((acc, artist) => {
                if (artist.output && artist.output.artist_style && Array.isArray(artist.output.artist_style)) {
                    return acc.concat(artist.output.artist_style);
                }
                return acc;
            }, []))].sort((a, b) => a.localeCompare(b));
        }

        function getUniqueMoods(artists) {
            return [...new Set(artists.reduce((acc, artist) => {
                if (artist.output && artist.output.artist_mood && Array.isArray(artist.output.artist_mood)) {
                    return acc.concat(artist.output.artist_mood);
                }
                return acc;
            }, []))].sort((a, b) => a.localeCompare(b));
        }

        const uniqueStyles = getUniqueStyles(artists);
        const uniqueMoods = getUniqueMoods(artists);

        function populateSubmenu(submenu, values, dataType) {
            values.forEach(value => {
                const li = document.createElement('li');
                li.textContent = value;
                li.dataset.type = dataType;
                li.dataset.value = value
                submenu.appendChild(li);
            });
        }

        populateSubmenu(stylesSubmenu, uniqueStyles, 'style');
        populateSubmenu(moodsSubmenu, uniqueMoods, 'mood');

        setupEventListeners(artists, albums);
    } catch (error) {
        console.error('Error loading data:', error);
    }
}

//Call the functions with Events
function setupEventListeners(artists, albums) {
    const menuItems = document.querySelectorAll('.sidebar ul li[data-category]');
    const submenusToggle = document.querySelectorAll('.toggle-submenu');
    const submenuItems = document.querySelectorAll('.submenu li');

    // Function to hide all content sections
    function hideAllContent() {
        const contentSections = document.querySelectorAll('.content > div');
        contentSections.forEach(section => section.classList.add('hidden-content'));
    }

    // Click event listener for the menu items
    menuItems.forEach(item => {
        item.addEventListener('click', () => {
            const category = item.dataset.category;

            // Remove active class from all items and add it to the clicked item
            menuItems.forEach(i => i.classList.remove('active'));
            item.classList.add('active');

            hideAllContent();

            // Show the appropriate content based on the selected category
            if (category === "home") {
                document.getElementById('home-content').classList.remove('hidden-content');
            } else if (category === "artists") {
                document.getElementById('artists-content').classList.remove('hidden-content');
            } else if (category === "albums") {
                loadAlbumsData(albums, 'albums-only-carousel',false)
                document.getElementById('albums-content').classList.remove('hidden-content');
            }else if (category === "singles") {
                loadAlbumsData(albums, 'singles-only-carousel',true)
                document.getElementById('singles-content').classList.remove('hidden-content');
            }
        });
    });

    // Click event listener for the submenus toggles
    submenusToggle.forEach(toggle => {
        toggle.addEventListener('click', (event) => {
            event.stopPropagation(); // Prevent the event from bubbling up to the parent li

            const submenuId = toggle.dataset.submenu + '-submenu';
            const submenu = document.getElementById(submenuId);

            // Toggle the visibility of the submenu
            if (submenu) {
                submenu.style.display = submenu.style.display === 'none' ? 'block' : 'none';
            }
        });
    });

    // Click event listener for the submenu items
    submenuItems.forEach(item => {
        item.addEventListener('click', () => {
            const type = item.dataset.type;
            const value = item.dataset.value;

            hideAllContent(); // Hide all other carousels

            if (type === "style") {
                console.log("Load content style");
                document.getElementById('style-content').classList.remove('hidden-content'); //Show Section.
                var values =  artists.filter(artist => artist.output.artist_style != null && artist.output.artist_style.includes(value));
                loadArtistsData(values, 'style-only-carousel')
            } else if (type === "mood") {
                console.log("Load content mood");
                document.getElementById('mood-content').classList.remove('hidden-content'); //Show Section.
                var values =  artists.filter(artist => artist.output.artist_mood != null && artist.output.artist_mood.includes(value));
                loadArtistsData(values, 'mood-only-carousel')
            }
        });
    });
}

async function loadData() {
    try {
        const response = await fetch('artists.json'); // Fetch the JSON data
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`); // Handle HTTP errors
        }
        artists = await response.json(); // Parse the JSON data

        const albumResponse = await fetch('albums.json'); // Fetch the JSON data
        if (!albumResponse.ok) {
            throw new Error(`HTTP error! Status: ${albumResponse.status}`); // Handle HTTP errors
        }
        albums = await albumResponse.json(); // Parse the JSON data

        //Load Home carousels
        loadArtistsData(artists, 'artists-carousel');
        loadAlbumsData(albums, 'albums-carousel', false);

        //Load new carousels
        loadArtistsData(artists, 'artists-only-carousel');
        loadAlbumsData(albums, 'albums-only-carousel', false);

        loadAlbumsData(albums, 'singles-only-carousel', true);

        const stylesSubmenu = document.getElementById('styles-submenu');
        const moodsSubmenu = document.getElementById('moods-submenu');

        function getUniqueStyles(artists) {
            return [...new Set(artists.reduce((acc, artist) => {
                if (artist.output && artist.output.artist_style && Array.isArray(artist.output.artist_style)) {
                    return acc.concat(artist.output.artist_style);
                }
                return acc;
            }, []))].sort((a, b) => a.localeCompare(b));
        }

        function getUniqueMoods(artists) {
            return [...new Set(artists.reduce((acc, artist) => {
                if (artist.output && artist.output.artist_mood && Array.isArray(artist.output.artist_mood)) {
                    return acc.concat(artist.output.artist_mood);
                }
                return acc;
            }, []))].sort((a, b) => a.localeCompare(b));
        }

        const uniqueStyles = getUniqueStyles(artists);
        const uniqueMoods = getUniqueMoods(artists);

        function populateSubmenu(submenu, values, dataType) {
            values.forEach(value => {
                const li = document.createElement('li');
                li.textContent = value;
                li.dataset.type = dataType;
                li.dataset.value = value
                submenu.appendChild(li);
            });
        }

        populateSubmenu(stylesSubmenu, uniqueStyles, 'style');
        populateSubmenu(moodsSubmenu, uniqueMoods, 'mood');

        setupEventListeners(artists, albums);
    } catch (error) {
        console.error('Error loading data:', error);
    }
}

// Load data and initialize
loadData();