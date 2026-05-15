import React, { useEffect, useState, useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";
import { motion, AnimatePresence } from "framer-motion";
import { getShops, getReviews } from "../services/api";
import "../styles/userDashboard.css";
import ShopDetailsCard from "../components/ShopDetailsCard";

// ================= ICONS =================

const userIcon = L.icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/149/149071.png",
  iconSize: [36, 36],
  iconAnchor: [18, 36],
});

const shopIcon = L.icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/535/535239.png",
  iconSize: [40, 40],
  iconAnchor: [20, 40],
  popupAnchor: [0, -35],
});

// ================= DISTANCE FUNCTION =================

function haversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;

  const toRad = (x) => (x * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) ** 2;

  return (
    R *
    2 *
    Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  ).toFixed(2);
}

// ================= COMPONENT =================

export default function UserDashboard() {
  const [shops, setShops] = useState([]);
  const [selectedShop, setSelectedShop] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("nearest");

  // ================= USER LOCATION =================

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) =>
        setUserLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        }),
      (err) => console.error("Location error:", err)
    );
  }, []);

  // ================= FETCH SHOPS =================

  useEffect(() => {
    getShops()
      .then(setShops)
      .catch(console.error);
  }, []);

  // ================= FILTER SHOPS =================

  const filtered = useMemo(() => {
    const s = search.toLowerCase();

    return shops.filter(
      (shop) =>
        shop.name?.toLowerCase().includes(s) ||
        shop.products?.toLowerCase().includes(s) ||
        shop.address?.toLowerCase().includes(s)
    );
  }, [shops, search]);

  // ================= SORT SHOPS =================

  const sorted = useMemo(() => {
    const arr = [...filtered];

    if (sortBy === "name") {
      arr.sort((a, b) =>
        a.name.localeCompare(b.name)
      );
    } else if (sortBy === "rating") {
      arr.sort(
        (a, b) =>
          (b.averageRating || 0) -
          (a.averageRating || 0)
      );
    } else if (
      sortBy === "nearest" &&
      userLocation
    ) {
      arr.sort((a, b) => {
        const da =
          a.lat && a.lng
            ? +haversineDistance(
                userLocation.lat,
                userLocation.lng,
                a.lat,
                a.lng
              )
            : 1e9;

        const db =
          b.lat && b.lng
            ? +haversineDistance(
                userLocation.lat,
                userLocation.lng,
                b.lat,
                b.lng
              )
            : 1e9;

        return da - db;
      });
    }

    return arr;
  }, [filtered, sortBy, userLocation]);

  // ================= OPEN DETAILS =================

  const openShopDetails = async (shop) => {
    setSelectedShop(shop);

    try {
      const r = await getReviews(shop._id);
      shop.reviews = r.reviews || [];
    } catch {
      shop.reviews = [];
    }
  };

  // ================= LOADING =================

  if (!userLocation) {
    return (
      <div className="location-loading">
        📍 Detecting your location...
      </div>
    );
  }

  // ================= UI =================

  return (
    <div className="dashboard-container">

      {/* ================= MAP SECTION ================= */}

      <div className="map-section">
        <MapContainer
          center={[
            userLocation.lat,
            userLocation.lng,
          ]}
          zoom={13}
          style={{
            height: "100%",
            width: "100%",
          }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution="&copy; OpenStreetMap contributors"
          />

          {/* USER LOCATION */}

          <Marker
            position={[
              userLocation.lat,
              userLocation.lng,
            ]}
            icon={userIcon}
          >
            <Popup>You are here 🧍</Popup>
          </Marker>

          {/* SHOP MARKERS */}

          <MarkerClusterGroup>
            {sorted.map(
              (shop) =>
                shop.lat &&
                shop.lng && (
                  <Marker
                    key={shop._id}
                    position={[
                      shop.lat,
                      shop.lng,
                    ]}
                    icon={shopIcon}
                    eventHandlers={{
                      click: () =>
                        openShopDetails(shop),
                    }}
                  >
                    <Popup>
                      <b>{shop.name}</b>
                      <br />
                      {shop.address}
                    </Popup>
                  </Marker>
                )
            )}
          </MarkerClusterGroup>
        </MapContainer>
      </div>

      {/* ================= RIGHT SIDE ================= */}

      <div className="shop-list-panel">

        {/* HEADER */}

        <header className="list-header">
          <h1>Nearby Shops 🛍</h1>

          <div className="controls">
            <input
              type="text"
              placeholder="Search nearby shops..."
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
            />

            <select
              value={sortBy}
              onChange={(e) =>
                setSortBy(e.target.value)
              }
            >
              <option value="nearest">
                Nearest
              </option>

              <option value="rating">
                Top Rated
              </option>

              <option value="name">
                Name
              </option>
            </select>
          </div>
        </header>

        {/* SHOP GRID */}

        <div className="shop-grid full-width-grid">
          <AnimatePresence>
            {sorted.map((shop) => (
              <motion.div
                key={shop._id}
                className="shop-card"
                initial={{
                  opacity: 0,
                  y: 15,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                whileHover={{
                  scale: 1.02,
                }}
                transition={{
                  duration: 0.2,
                }}
                onClick={() =>
                  openShopDetails(shop)
                }
              >
                <div className="shop-image">
                  🏪
                </div>

                <h3>{shop.name}</h3>

                <p className="desc">
                  {shop.products}
                </p>

                <p className="address">
                  {shop.address}
                </p>

                <div className="info">
                  <span>
                    ⭐ {shop.averageRating?.toFixed(1) || 0}
                  </span>

                  {shop.lat && (
                    <span>
                      📍
                      {haversineDistance(
                        userLocation.lat,
                        userLocation.lng,
                        shop.lat,
                        shop.lng
                      )}
                      km
                    </span>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* ================= DETAILS MODAL ================= */}

      <AnimatePresence>
        {selectedShop && (
          <>
            {/* BACKDROP */}

            <motion.div
              className="details-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() =>
                setSelectedShop(null)
              }
            />

            {/* DETAILS PANEL */}

            <motion.div
              className="fullscreen-details"
              initial={{
                x: "100%",
              }}
              animate={{
                x: 0,
              }}
              exit={{
                x: "100%",
              }}
              transition={{
                type: "spring",
                damping: 24,
                stiffness: 180,
              }}
            >
              <ShopDetailsCard
                shop={selectedShop}
                onClose={() =>
                  setSelectedShop(null)
                }
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

