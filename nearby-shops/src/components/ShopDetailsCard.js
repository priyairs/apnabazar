import React from "react";
import { motion } from "framer-motion";
import "../styles/shopDetails.css";

// ================= STAR RATING =================

function StarRating({ rating }) {
  const fullStars = Math.floor(rating);
  const halfStar = rating - fullStars >= 0.5;
  const emptyStars =
    5 - fullStars - (halfStar ? 1 : 0);

  return (
    <span className="stars">
      {"★".repeat(fullStars)}
      {halfStar && "☆"}
      {"☆".repeat(emptyStars)}
    </span>
  );
}

// ================= COMPONENT =================

export default function ShopDetailsCard({
  shop,
  onClose,
}) {
  if (!shop) return null;

  const statusText = shop.isOpen
    ? "Open Now"
    : "Closed";

  return (
    <motion.div
      className="shopdetails-container"
      initial={{
        opacity: 0,
        x: 60,
      }}
      animate={{
        opacity: 1,
        x: 0,
      }}
      exit={{
        opacity: 0,
        x: 60,
      }}
      transition={{
        duration: 0.35,
      }}
    >
      {/* ================= HEADER ================= */}

      <div className="shop-top-section">

        {/* SHOP AVATAR */}

        <div className="shop-avatar">
          🏪
        </div>

        {/* SHOP INFO */}

        <div className="shop-main-info">

          <h1>{shop.name}</h1>

          <p className="shop-category">
            {shop.products ||
              "General Store"}
          </p>

          <div className="meta-row">

            {/* RATING */}

            <div className="rating-pill">
              <StarRating
                rating={
                  shop.averageRating || 4
                }
              />

              <span>
                (
                {shop.ratingsCount ||
                  10}{" "}
                reviews)
              </span>
            </div>

            {/* STATUS */}

            <div
              className={`status-pill ${
                shop.isOpen
                  ? "open"
                  : "closed"
              }`}
            >
              {statusText}
            </div>
          </div>
        </div>
      </div>

      {/* ================= ACTION BUTTONS ================= */}

      <div className="actions-grid">

        <button
          className="action-btn primary"
          onClick={() =>
            (window.location.href =
              "/chatbot")
          }
        >
          💬 Chat Assistant
        </button>

        <button className="action-btn outline">
          ❤ Save
        </button>

        <button
          className="action-btn success"
          onClick={() =>
            window.open(
              `tel:${shop.number}`,
              "_self"
            )
          }
        >
          📞 Call Now
        </button>
      </div>

      {/* ================= LOCATION CARD ================= */}

      <div className="details-card">

        <h3>📍 Location</h3>

        <p className="detail-text">
          {shop.address}
        </p>

        <button
          className="maps-btn"
          onClick={() =>
            window.open(
              `https://www.google.com/maps?q=${shop.lat},${shop.lng}`,
              "_blank"
            )
          }
        >
          Open in Google Maps
        </button>
      </div>

      {/* ================= CONTACT CARD ================= */}

      <div className="details-card">

        <h3>📞 Contact</h3>

        <p className="detail-text">
          {shop.number ||
            "Not Available"}
        </p>
      </div>

      {/* ================= TIMINGS CARD ================= */}

      <div className="details-card">

        <h3>🕒 Timings</h3>

        <div className="timings-list">

          {shop.timings ? (
            typeof shop.timings ===
            "string" ? (
              <div className="timing-row">
                <span>{shop.timings}</span>
              </div>
            ) : (
              Object.entries(
                shop.timings
              ).map(([day, time]) => (
                <div
                  key={day}
                  className={`timing-row ${
                    String(
                      time
                    ).toLowerCase() ===
                    "closed"
                      ? "closed"
                      : ""
                  }`}
                >
                  <span>{day}</span>

                  <span className="time">
                    {time}
                  </span>
                </div>
              ))
            )
          ) : (
            <>
              <div className="timing-row">
                <span>
                  Monday - Friday
                </span>

                <span className="time">
                  9 AM - 9 PM
                </span>
              </div>

              <div className="timing-row">
                <span>Saturday</span>

                <span className="time">
                  10 AM - 10 PM
                </span>
              </div>

              <div className="timing-row closed">
                <span>Sunday</span>

                <span className="time">
                  Closed
                </span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* ================= SERVICES CARD ================= */}

      <div className="details-card">

        <h3>✨ Services</h3>

        <div className="services-grid">

          {[
            "Home Delivery",
            "24/7 Support",
            "Easy Returns",
            "Discount Offers",
            "Customer Support",
          ].map((service, i) => (
            <div
              key={i}
              className="service-chip"
            >
              ✅ {service}
            </div>
          ))}
        </div>
      </div>

      {/* ================= FOOTER ================= */}

      <button
        className="back-btn"
        onClick={onClose}
      >
        ← Back to Shops
      </button>
    </motion.div>
  );
}