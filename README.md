# Tanorama Falmouth website

The public website for **Tanorama of Falmouth**, 365 Main St, Falmouth, MA 02540 · (508) 495-9905.

Plain HTML, CSS, and a small script. There's no build step. GitHub Pages serves the `main` branch as-is.

## Editing the site (for Scott)

Go to **https://platinum00001.github.io/tanorama-falmouth/admin/**, type the password, change what you want, and tap **Save changes**. Photos save as soon as you upload or remove them. The editor page isn't linked from the public site and is hidden from search engines.

Empty items are handled for you:

| Item | When empty, the site shows |
|---|---|
| Booking link | Every "Book" button calls the salon |
| Email, Instagram, Facebook | Those buttons are hidden |
| Hours | "Call (508) 495-9905 for today's hours." |
| Services | "Call (508) 495-9905 for current services and pricing." |
| Reviews | The board lists what reviewers mention |
| Photos | The sun-and-waves artwork (gallery hidden) |

## How it works

- Content is stored in Supabase (project `james-sites`, table `tanorama_site_content`, photos in the `tanorama-images` bucket).
- The public page loads that content with the publishable key, which is meant to be public. Database rules let anyone read and only the single Tanorama editor account write.
- If Supabase can't be reached, the page falls back to the backup content in **`data.js`**.
- `data.js` is also where the editor's starting content came from. Editing it changes only the backup, not what's live.

## Files

- `index.html`: page structure and the facts that don't change
- `data.js`: backup content and Supabase settings (no secret keys)
- `admin/`: the password-protected editor
- `app.js`: loads live content (or the backup) onto the page
- `styles.css`: design
- `og-image.png`: preview image used when the link is shared
