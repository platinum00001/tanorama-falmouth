/* ==========================================================================
   TANORAMA FALMOUTH — SITE CONTENT
   --------------------------------------------------------------------------
   This is the ONLY file you need to edit to update hours, prices, reviews,
   booking, email, and social links. Anything left empty ("" or []) is
   handled automatically:
     - empty hours / services  -> visitors are asked to call for details
     - empty bookingUrl        -> every "Book" button calls the salon
     - empty instagram/facebook/email -> those buttons are hidden
     - empty reviews           -> the board shows what reviewers mention
   See README.md for examples.
   ========================================================================== */
window.TANORAMA = {
  phoneDisplay: "(508) 495-9905",
  phoneLink: "tel:+15084959905",

  // Online booking page, e.g. "https://example-booking-site.com/tanorama"
  bookingUrl: "",

  // Contact & social (full URLs). Leave "" to hide the button.
  email: "",          // e.g. "hello@example.com"
  instagram: "",      // e.g. "https://www.instagram.com/yourhandle"
  facebook: "",       // e.g. "https://www.facebook.com/yourpage"

  // Hours. One row per line on the sign. Example:
  //   { days: "Monday – Friday", hours: "9:00 AM – 8:00 PM" },
  hours: [],

  // Services & prices, grouped. Example:
  //   { group: "Tanning Beds", items: [
  //       { name: "Single Session", price: "$00", note: "optional detail" }
  //   ]},
  services: [],

  // The board: customer reviews, word-for-word. Example:
  //   { quote: "Exact words from the review.", author: "First name L.", source: "Google" },
  reviews: []
};
