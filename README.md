# Tanorama Falmouth website

The public website for **Tanorama of Falmouth**, 365 Main St, Falmouth, MA 02540 · (508) 495-9905.

Plain HTML, CSS, and a small script. There's no build step. GitHub Pages serves the `main` branch as-is.

## Updating hours, prices, reviews, booking, and social links

All editable content lives in **`data.js`**. Open it on GitHub, click the pencil icon, fill in the fields, and commit. The live site updates in a minute or two.

Empty fields are handled for you:

| Field | When empty, the site shows |
|---|---|
| `bookingUrl` | Every "Book" button calls the salon |
| `email`, `instagram`, `facebook` | Those buttons are hidden |
| `hours` | "Call (508) 495-9905 for today's hours." |
| `services` | "Call (508) 495-9905 for current services and pricing." |
| `reviews` | The board lists what reviewers mention (island interior, private rooms, warm desk) |

### Example

```js
bookingUrl: "https://your-booking-page.example",
email: "you@example.com",
instagram: "https://www.instagram.com/yourhandle",
facebook: "https://www.facebook.com/yourpage",

hours: [
  { days: "Monday – Friday", hours: "9:00 AM – 8:00 PM" },
  { days: "Saturday – Sunday", hours: "10:00 AM – 5:00 PM" }
],

services: [
  { group: "Tanning Beds", items: [
    { name: "Single Session", price: "$00" },
    { name: "Monthly Unlimited", price: "$00", note: "Optional short detail" }
  ]}
],

reviews: [
  { quote: "Paste the review word for word.", author: "First name L.", source: "Google" }
]
```

(The values above are examples only. Use the salon's real hours and prices.)

Keep the quotes, commas, and brackets as shown. Each entry ends with a comma except the last one in a list.

## Files

- `index.html`: page structure and the facts that don't change
- `data.js`: the content you edit
- `app.js`: puts `data.js` content on the page
- `styles.css`: design
- `og-image.png`: preview image used when the link is shared
