# Product Stock Now

Create a mobile-first web application for product search and inventory lookup.

**1. UI Layout & Core Interactions:**

- Design a clean, modern, and mobile-friendly interface (e.g., max-width 480px, centered on desktop).

- Add a prominent Search Input box at the top of the screen.

- Real-time Autocomplete/Typeahead: As soon as the user types at least 1 character, instantly display a dropdown list of matching results directly below the search box.

- When a user selects an item from the dropdown, hide the dropdown list and display a detailed "Product Card" containing the selected item's information.

**2. Data Display (Product Card):**

When an item is selected, the Product Card should clearly display the following fields based on the provided data structure:

- Product Name: {ProductDesc} (Make this prominent/bold)

- MPN: {MPN}

- Price: {Price List2021}

- Lot Size: {Lotsize}

- Quantity (01-ST): {01-ST}

- Quantity (01plus03): {01plus03}

Format the layout nicely using cards, badges, or list items to make it easy to read on a mobile screen.

**3. API & Backend Integration (Crucial):**

- The app must NOT use Supabase or any built-in database. It will fetch data via an external REST API (Power Automate HTTP Webhook acting as an API Gateway to Dataverse).

- Create an API service function using `fetch` that sends a POST request to a placeholder URL (`YOUR_POWER_AUTOMATE_WEBHOOK_URL`).

- The payload sent to the webhook should be `{"searchQuery": "the_text_user_typed"}`.

- Include a debounce mechanism (e.g., 300ms) on the search input to prevent spamming the API webhook while typing.

- Show a small loading spinner inside the search box while waiting for the API response.

**4. Initial Mock Data for UI Rendering:**

To build the UI before the real webhook is connected, use this exact mock JSON array to simulate the API response:

[

  {"MPN": "10030", "Product No.": "2143862", "ProductDesc": "OZ-500 SPECIAL-PVC CONTROL CABLE 2 X 0.75MM²", "BrandName": "HELUKABEL", "Price List2021": 22.34, "01-ST": 90, "01plus03": 90, "Lotsize": 0},

  {"MPN": "10095", "Product No.": "2143888", "ProductDesc": "JZ-500 SPECIAL-PVC CONTROL CABLE 5G X 1.5MM²", "BrandName": "HELUKABEL", "Price List2021": 85.60, "01-ST": 5170, "01plus03": 5170, "Lotsize": 0},

  {"MPN": "1125CM BK", "Product No.": "2100535", "ProductDesc": "CONDUIT PVC CORRUGATED 25MM OD 40M BLACK", "BrandName": "UPC", "Price List2021": 840.00, "01-ST": 18, "01plus03": 18, "Lotsize": 1}

]

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://stocknowt1.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/e45ef526-aa69-4302-897a-a308ccf53860).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
