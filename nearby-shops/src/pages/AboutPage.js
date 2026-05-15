import { motion } from "framer-motion";
import "../styles/about.css";

export default function AboutPage() {
  return (
    <motion.div
      className="about-container"
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <h1>🌍 About ApnaBazaar</h1>
      <p>
        <b>ApnaBazaar</b> is a location-based discovery platform that connects
        users with nearby vendors, shops, and services. Whether you’re looking
        for a mobile repair shop, a bakery, or a grocery store — we make it easy
        to find what’s around you.
      </p>

      <div className="about-sections">
        <div className="about-card">
          <h3>🚀 Our Mission</h3>
          <p>
            To empower small local vendors by increasing their online
            visibility and helping users discover authentic neighborhood shops
            effortlessly.
          </p>
        </div>

        <div className="about-card">
          <h3>💡 Features</h3>
          <ul>
            <li>🧭 Discover nearby vendors using geolocation</li>
            <li>⭐ Rate and review your favorite shops</li>
            <li>📍 Get map directions instantly</li>
            <li>💬 Directly connect with vendors</li>
          </ul>
        </div>

        <div className="about-card">
          <h3>👨‍💻 Our Team</h3>
          <p>
            Developed by <b>B.NAGASAI , B.PRIYANKA, G.PHANINDRA, G.PRASHANTH</b> and team — passionate engineers
            building smarter local ecosystems through modern web technology.
          </p>
        </div>
      </div>

      <footer className="about-footer">
        <p>© {new Date().getFullYear()} ApnaBazaar. All Rights Reserved.</p>
      </footer>
    </motion.div>
  );
}
