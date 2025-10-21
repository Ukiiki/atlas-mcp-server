from playwright.sync_api import sync_playwright

def run(playwright):
    browser = playwright.chromium.launch()
    page = browser.new_page()

    # Verify business listings page
    page.goto("http://localhost:3001/listings")
    page.wait_for_selector('.btn-secondary')
    page.screenshot(path="jules-scratch/verification/listings_page.png")

    # Verify events page
    page.goto("http://localhost:3001/events")
    page.wait_for_selector('.btn-secondary')
    page.screenshot(path="jules-scratch/verification/events_page.png")

    # Verify event registrations download button
    download_button = page.query_selector('button.text-blue-600')
    if download_button:
        download_button.screenshot(path="jules-scratch/verification/event_registrations.png")
    else:
        page.screenshot(path="jules-scratch/verification/event_registrations.png")

    browser.close()

with sync_playwright() as playwright:
    run(playwright)
