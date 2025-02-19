import instaloader
import json
import time
import random
from datetime import datetime, timedelta

# Create an Instaloader instance
L = instaloader.Instaloader()

# Input JSON file
INPUT_FILE = "instagram_account_categories.json"
OUTPUT_FILE = "instagram_scrap.json"

# Delay between requests (in seconds) - Increase if you still get errors.
DELAY = 5  # Start with a 300-second delay, adjust as needed

# --- LOGIN (Optional but Recommended) ---
USER = "gzardetto"  # Replace with your Instagram username
PASSWORD = "SwB8H90!"  # Replace with your Instagram password

try:
    L.login(USER, PASSWORD)
    print("Successfully logged in.")
except Exception as e:
    print(f"Login failed: {e}")
    print("Continuing without login (may encounter rate limits).")

#--- OR ---
# Try loading the session from a file (if you've logged in before)
#try:
#    L.load_session_from_file(USER, 'session-YOUR_USERNAME') # Replace YOUR_USERNAME with your actual username
#    print("Successfully loaded session from file.")
#except FileNotFoundError:
#    print("Session file not found.  Login required (see above).")
#except Exception as e:
#    print(f"Error loading session: {e}")

# --- USER AGENTS (Advanced - but important if you keep getting blocked) ---
# List of User Agents (try rotating through them)
USER_AGENTS = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Safari/605.1.15",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/115.0",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:109.0) Gecko/20100101 Firefox/115.0",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36", #Older Chrome
]

def get_random_user_agent():
  return random.choice(USER_AGENTS)


def scrape_profile(profile_name):
    """Scrapes data from a given Instagram profile and returns a list of post data."""
    data = []
    try:
        # Set a random User Agent before scraping each profile
        L.user_agent = get_random_user_agent()
        print(f"Using User Agent: {L.user_agent}")

        profile = instaloader.Profile.from_username(L.context, profile_name)
        print(f"Scraping posts from {profile_name}...")

        post_count = 0
        cutoff_date = datetime.now() - timedelta(days=7)  # Calculate the cutoff date (7 days ago)
        posts = profile.get_posts()
        recent_posts = []

        # Get the 10 most recent posts
        for post in posts:
             if post.date < cutoff_date:
                print("Post is older than 7 days, stopping...")
                break  # Stop if the post is older than 7 days
             recent_posts.append(post)
             if len(recent_posts) >= 1: #changed to test
                break

        # Scrape only recent posts
        for post in recent_posts:
            try:
                post_data = {
                    "created_at": post.date.isoformat(),  # ISO 8601 format
                    "timestamp": post.date.timestamp(),  # Unix timestamp
                    "inputUrl": f"https://www.instagram.com/p/{post.shortcode}/",
                    "shortCode": post.shortcode,
                    "caption": post.caption,
                }
                data.append(post_data)
                post_count += 1
                time.sleep(5) # add delay per post

            except Exception as e:
                print(f"Error processing post {post.shortcode} from {profile_name}: {e}")

        print(f"Finished scraping {post_count} posts from {profile_name}")

    except instaloader.exceptions.ProfileNotExistsException:
        print(f"Profile '{profile_name}' not found.")
    except Exception as e:
        print(f"Error scraping profile {profile_name}: {e}")

    return data


# Load data from the input JSON file
try:
    with open(INPUT_FILE, "r", encoding="utf-8") as f:
        accounts = json.load(f)
except FileNotFoundError:
    print(f"Error: Input file '{INPUT_FILE}' not found.")
    exit()
except json.JSONDecodeError:
    print(f"Error: Invalid JSON format in '{INPUT_FILE}'.")
    exit()
except Exception as e:
    print(f"Error reading input file: {e}")
    exit()

# Scrape data for each account
all_data = {}  # Dictionary to store data for all accounts, keyed by account name

for account in accounts:
    account_name = account["name"]
    print(f"Waiting {DELAY} seconds before scraping {account_name}...")
    time.sleep(DELAY)  # Add delay BEFORE scraping each profile.

    # Before each profile scrape, set the user agent to a new random value
    L.user_agent = get_random_user_agent()
    all_data[account_name] = scrape_profile(account_name)


# Save all scraped data to the output JSON file
try:
    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(all_data, f, ensure_ascii=False, indent=4)
    print(f"Data saved to {OUTPUT_FILE}")
except Exception as e:
    print(f"Error saving to JSON file: {e}")

print("Finished scraping!")