export const site = {
  name: "Xeroura Technologies",
  legalName: "Xeroura Technologies Private Limited",
  tagline: "Humanising Intelligence, Powered by AI",
  description:
    "Xeroura Technologies builds production-ready AI products and enterprise platforms — copilots, workflow automation, and dedicated delivery pods from Hyderabad, India.",
  email: "Connect@Xeroura.com",
  address: {
    lines: [
      "Xeroura Technologies Pvt Ltd",
      "Awfis N Heights, Level 6, Plot No 38, Phase 2",
      "HITEC City, Siddiq Nagar",
      "Hyderabad, Telangana 500081",
    ],
    lat: 17.451441,
    lng: 78.371071,
    /** Opens Google Maps (app or web) at the office pin */
    googleMapsUrl:
      "https://www.google.com/maps/search/?api=1&query=17.451441%2C78.371071",
    /** Embedded preview (no API key); clicking the block uses `googleMapsUrl` */
    googleMapsEmbedUrl:
      "https://www.google.com/maps?q=17.451441%2C78.371071&z=17&output=embed",
  },
} as const;

export const navLinks = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/products", label: "Products" },
  { href: "/services", label: "Services" },
  { href: "/careers", label: "Careers" },
  { href: "/contact", label: "Contact" },
] as const;
