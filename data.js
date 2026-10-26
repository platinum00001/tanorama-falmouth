/* ==========================================================================
   TANORAMA FALMOUTH: BACKUP CONTENT
   --------------------------------------------------------------------------
   Day-to-day edits happen in the editor at /admin/ and are stored online.
   This file is the backup the site shows if the online content can't be
   reached, and it is what the editor was first filled in with.
   Empty values ("" or []) are handled automatically:
     - empty hours / services   -> visitors are asked to call
     - empty bookingUrl         -> every "Book" button calls the salon
     - empty instagram/facebook/email -> those buttons are hidden
     - empty reviews            -> the board shows what reviewers mention
     - empty image slots        -> the sun-and-waves artwork is shown
   ========================================================================== */
window.TANORAMA_CONFIG = {
  supabaseUrl: "https://oiousqgzqcjanikglkxl.supabase.co",
  // Publishable key: safe to be public. Writes are blocked by database rules.
  supabaseKey: "sb_publishable_IJHa5taHcttV2DSZq45fWQ_bVbRDbA2",
  table: "tanorama_site_content",
  bucket: "tanorama-images"
};

window.TANORAMA = {
  // Brand
  brand_name: "Tanorama",
  brand_place: "Falmouth",

  // Top of the page
  hero_claim: "Voted Cape Cod\u2019s #1 tanning center",
  hero_title_lead: "Look & Feel",
  hero_title_em: "Beautiful",
  hero_subline: "The Best Service. The Best Experience.",
  hero_door: "Open 7 days a week. It\u2019s always sunny here.",
  hero_neighborhood: "Falmouth Heights",
  book_button: "Book a session",

  // About
  about_kicker: "Tanorama of Falmouth",
  about_title: "A year-round tropical oasis on Cape Cod.",
  about_body: "For more than 27 years, Tanorama has been Falmouth\u2019s place to step out of the Cape weather and into the sun. It\u2019s owner-operated: Scott Boyle, with 30+ years in the business, is on the floor alongside Louis.",
  about_facts: [
    { value: "More than 27", label: "years in Falmouth" },
    { value: "30+", label: "years for Scott" },
    { value: "7", label: "days a week" }
  ],

  // Services & prices
  services_kicker: "Services & Prices",
  services_title: "Find your glow.",
  services_empty: "Call (508) 495-9905 for current services and pricing.",
  services_note: "Questions about a service? Call (508) 495-9905.",
  // { group: "Tanning Beds", items: [ { name: "Single Session", price: "$00", note: "" } ] }
  services: [],

  // Hours
  hours_kicker: "Hours",
  hours_title: "Open 7 days a week.",
  hours_subtitle: "It\u2019s always sunny here.",
  hours_empty: "Call (508) 495-9905 for today\u2019s hours.",
  hours_note: "Holiday hours may vary. Call (508) 495-9905 to confirm.",
  // { days: "Monday \u2013 Friday", hours: "9:00 AM \u2013 8:00 PM" }
  hours: [],

  // The board (reviews)
  board_kicker: "The Board",
  board_title: "What people say.",
  board_intro: "Reviewers keep coming back to the same three things:",
  board_themes: ["The handmade island interior", "Private rooms", "A warm welcome at the desk"],
  // { quote: "Exact words from the review.", author: "First name L.", source: "Google" }
  reviews: [],

  // Gallery
  gallery_kicker: "Inside Tanorama",
  gallery_title: "Come on in.",

  // Book banner
  book_title: "Ready for some sun?",
  book_copy: "Call the salon to book your session.",
  book_copy_online: "Book online, or give us a call.",

  // Visit & contact
  visit_kicker: "Visit",
  visit_title: "Find us in Falmouth Heights.",
  address_line1: "365 Main St",
  address_line2: "Falmouth, MA 02540",
  cross_street: "Near Main Street and Haddon Avenue, Falmouth Heights.",
  phone: "(508) 495-9905",
  email: "",
  bookingUrl: "",
  instagram: "",
  facebook: "",

  follow_title: "Follow along.",
  footer_tagline: "Look & Feel Beautiful",
  footer_copyright: "Tanorama of Falmouth",

  // Photos (empty = show the sun-and-waves artwork). { url, alt, path }
  hero_image: null,
  about_image: null,
  gallery: []
};
