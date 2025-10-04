#!/usr/bin/env python3
"""
Automated Video & Screenshot Capture for Kore.ai Smart Assist Testing
Captures video from start to finish + individual screenshots
"""

import time
import subprocess
import os
from datetime import datetime
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options

# Configuration
APP_URL = "http://127.0.0.1:8080"
OUTPUT_DIR = os.path.dirname(os.path.abspath(__file__))
TIMESTAMP = datetime.now().strftime("%Y%m%d_%H%M%S")
VIDEO_FILE = os.path.join(OUTPUT_DIR, f"kore_ai_demo_{TIMESTAMP}.mp4")
SCREENSHOTS_DIR = os.path.join(OUTPUT_DIR, "screenshots")

# Sample queries to test
QUERIES = [
    "🍫 How to prepare dark chocolate almond bars?",
    "🌱 What are the vegan recipes that I can prepare?",
    "🥜 What are almonds rich in?",
    "🍁 I have maple syrup with me. What can I do?",
    "🎂 How to store chocolate mousse?",
    "💪 What are the healthy food tips?",
    "💧 How much water should I drink daily?",
    "🍊 What foods are rich in vitamin C?",
    "🥥 How to make coconut whipped cream?",
    "🍌 What are the ingredients for banana bread?"
]

def start_screen_recording():
    """Start recording screen using ffmpeg"""
    print(f"🎥 Starting video recording: {VIDEO_FILE}")

    # Use ffmpeg to capture screen on macOS
    process = subprocess.Popen([
        'ffmpeg',
        '-f', 'avfoundation',
        '-framerate', '30',
        '-i', '1:0',  # Screen capture (display 1, no audio)
        '-vcodec', 'libx264',
        '-preset', 'ultrafast',
        '-pix_fmt', 'yuv420p',
        VIDEO_FILE
    ], stdout=subprocess.PIPE, stderr=subprocess.PIPE)

    time.sleep(2)  # Give ffmpeg time to start
    return process

def stop_screen_recording(process):
    """Stop the screen recording"""
    print("⏹️  Stopping video recording...")
    process.terminate()
    time.sleep(2)
    print(f"✅ Video saved: {VIDEO_FILE}")

def setup_driver():
    """Setup Chrome driver with appropriate options"""
    chrome_options = Options()
    chrome_options.add_argument('--start-maximized')
    chrome_options.add_argument('--disable-blink-features=AutomationControlled')

    driver = webdriver.Chrome(options=chrome_options)
    driver.set_window_size(1920, 1080)
    return driver

def take_screenshot(driver, name):
    """Take a screenshot and save it"""
    os.makedirs(SCREENSHOTS_DIR, exist_ok=True)
    screenshot_path = os.path.join(SCREENSHOTS_DIR, f"{name}.png")
    driver.save_screenshot(screenshot_path)
    print(f"📸 Screenshot saved: {name}.png")
    return screenshot_path

def wait_for_api_response(driver, timeout=15):
    """Wait for API response to complete loading"""
    try:
        # Wait for loading indicator to disappear
        WebDriverWait(driver, timeout).until(
            lambda d: d.find_element(By.ID, "loadingIndicator").get_attribute("style").find("none") != -1
        )
        print("✅ Loading indicator hidden")

        # Wait for search results to appear
        WebDriverWait(driver, timeout).until(
            EC.presence_of_element_located((By.ID, "searchResults"))
        )

        # Wait for actual content in results (not empty)
        WebDriverWait(driver, timeout).until(
            lambda d: len(d.find_element(By.ID, "searchResults").text.strip()) > 0
        )
        print("✅ API response loaded")

        # Extra wait for any animations
        time.sleep(2)
        return True
    except Exception as e:
        print(f"⚠️  Timeout waiting for API response: {e}")
        return False

def main():
    """Main automation flow"""
    print("=" * 60)
    print("🚀 Kore.ai Smart Assist - Video & Screenshot Automation")
    print("=" * 60)

    # Start video recording
    recording_process = start_screen_recording()

    try:
        # Setup browser
        driver = setup_driver()
        wait = WebDriverWait(driver, 15)

        # Navigate to app
        print(f"\n🌐 Opening app: {APP_URL}")
        driver.get(APP_URL)
        time.sleep(3)  # Wait for page to fully load

        # Take initial screenshot
        take_screenshot(driver, f"00_initial_interface_{TIMESTAMP}")
        time.sleep(2)

        # Scroll to top to see quick test buttons
        driver.execute_script("window.scrollTo(0, 0);")
        time.sleep(1)

        # Process each query using the quick test buttons
        button_queries = [
            ("How to prepare dark chocolate almond bars?", "chocolate"),
            ("What are almonds rich in?", "almonds"),
            ("I have maple syrup with me. What can I do?", "maple_syrup"),
            ("How long can I store chocolate mousse pie?", "mousse_storage"),
            ("What are the healthy food tips?", "healthy_tips"),
            ("What should be the amount of water consumed per day?", "water_intake"),
            ("What are the food items rich in vitamin C?", "vitamin_c"),
            ("What are the vegan recipes that I can prepare?", "vegan_recipes"),
            ("Which recipes require coconut whipped cream?", "coconut_cream"),
            ("What are the ingredients required to prepare banana bread?", "banana_bread")
        ]

        for idx, (query, query_name) in enumerate(button_queries, 1):
            print(f"\n📝 Query {idx}/10: {query}")

            # Find the button by searching for onclick attribute containing the query
            # Wait for page to be ready
            time.sleep(1)

            # Execute the quickTest function directly with proper escaping
            escaped_query = query.replace("\\", "\\\\").replace("'", "\\'").replace('"', '\\"')
            script = f"""
            if (typeof quickTest === 'function') {{
                quickTest('{escaped_query}');
            }} else {{
                console.error('quickTest function not found');
            }}
            """
            driver.execute_script(script)
            print("🖱️  Executed quickTest")

            # Wait for API response
            print("⏳ Waiting for API response...")
            if wait_for_api_response(driver):
                # Scroll to results
                results_element = driver.find_element(By.ID, "searchResults")
                driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", results_element)
                time.sleep(1)

                # Take screenshot of results
                take_screenshot(driver, f"{idx:02d}_{query_name}_result_{TIMESTAMP}")

                # Scroll through full page to show CURL output + results
                driver.execute_script("window.scrollTo(0, 0);")
                time.sleep(1)
                take_screenshot(driver, f"{idx:02d}_{query_name}_full_view_{TIMESTAMP}")

                # Scroll back to results
                driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", results_element)
                time.sleep(1)
            else:
                print(f"⚠️  Query {idx} timed out, continuing...")
                take_screenshot(driver, f"{idx:02d}_{query_name}_timeout_{TIMESTAMP}")

            # Small pause between queries
            time.sleep(2)

        # Final screenshot
        print("\n📸 Taking final screenshot...")
        take_screenshot(driver, f"99_final_view_{TIMESTAMP}")
        time.sleep(2)

        # Close browser
        driver.quit()

    except Exception as e:
        print(f"\n❌ Error: {e}")
        if 'driver' in locals():
            driver.quit()

    finally:
        # Stop recording
        stop_screen_recording(recording_process)

    print("\n" + "=" * 60)
    print("✅ Automation Complete!")
    print("=" * 60)
    print(f"📹 Video: {VIDEO_FILE}")
    print(f"📸 Screenshots: {SCREENSHOTS_DIR}/")
    print("=" * 60)

if __name__ == "__main__":
    # Check if ffmpeg is installed
    try:
        subprocess.run(['ffmpeg', '-version'], capture_output=True, check=True)
    except FileNotFoundError:
        print("❌ Error: ffmpeg not found. Install with: brew install ffmpeg")
        exit(1)

    main()