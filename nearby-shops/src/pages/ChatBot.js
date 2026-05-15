import React, { useState } from "react";
import "../styles/chatbot.css";

export default function ChatBot() {
  const [messages, setMessages] = useState([
    { sender: "bot", text: "👋 Hi! I’m Apnabazar Assistant. Ask me about nearby shops or vendors." },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  // 🔹 Predefined simple answers
  const staticResponses = {
    hello: "Hello there! 😊 You can ask me things like 'Show grocery shops' or 'Find salons nearby'.",
    hi: "Hi 👋! I'm here to help you explore local vendors.",
    help: "You can try commands like:\n👉 Show grocery shops\n👉 Show all vendors\n👉 Find shops in Hyderabad",
    open: "Most shops are open from 9:00 AM to 9:00 PM ⏰.",
    vendor: "Vendors can register from the Vendor Register page 🧑‍💼.",
    default: "Hmm 🤔 I didn’t understand that. Try saying 'show shops' or 'find grocery vendors'.",
  };

  // 🔹 Smart fetch and filtering logic
  const fetchShops = async (query) => {
    try {
      setLoading(true);
      const res = await fetch("http://localhost:5000/api/shops"); // or "/api/shops" if proxy added
      const data = await res.json();
      setLoading(false);

      if (!Array.isArray(data) || data.length === 0) {
        return "Sorry, I couldn’t find any shops right now 😕.";
      }

      const lowerQuery = query.toLowerCase();

      // 🧠 Smart keyword mapping
      const keywordMap = {
        grocery: ["vegetable", "grocery", "provision", "mart"],
        fruit: ["fruit", "fruits", "juice"],
        bakery: ["bakery", "snack", "cake", "pastry"],
        water: ["water", "aqua", "bottle"],
        food: ["food", "canteen", "restaurant", "hotel"],
        hyderabad: ["hyderabad", "secunderabad", "mozamjahi"],
        vendor: ["shop", "vendor", "market", "store"],
      };

      // Identify main category keyword
      const detectedCategory = Object.keys(keywordMap).find((key) =>
        lowerQuery.includes(key)
      );

      // ✅ Safe filtering
      const filtered = data.filter((shop) => {
        const name = shop.name?.toLowerCase() || "";
        const products = shop.products?.toLowerCase() || "";
        const address = shop.address?.toLowerCase() || "";
        const description = shop.description?.toLowerCase() || "";

        // If category detected → match related words
        if (detectedCategory) {
          const relatedWords = keywordMap[detectedCategory];
          return relatedWords.some(
            (word) =>
              name.includes(word) ||
              products.includes(word) ||
              description.includes(word) ||
              address.includes(word)
          );
        }

        // Otherwise → normal search
        return (
          name.includes(lowerQuery) ||
          products.includes(lowerQuery) ||
          description.includes(lowerQuery) ||
          address.includes(lowerQuery)
        );
      });

      if (filtered.length === 0) {
        return "No exact matches found 😕 Try asking like 'Show fruit shops' or 'Find bakeries nearby'.";
      }

      // ✅ Format chatbot reply
      let response = `🗺️ I found ${filtered.length} shops matching your query:\n`;
      filtered.slice(0, 3).forEach((shop, i) => {
        response += `\n${i + 1}. 🏪 ${shop.name} — ${shop.products || "General"} (${shop.address || "No address"})`;
      });

      response += `\n\n💡 Tip: Try 'shops in Hyderabad' or 'find water vendors nearby.'`;
      return response;
    } catch (error) {
      console.error("ChatBot Fetch Error:", error);
      setLoading(false);
      return "⚠️ Unable to fetch shops right now. Please try again later.";
    }
  };

  // 🔹 Handle user input
  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg = { sender: "user", text: input };
    setMessages((prev) => [...prev, userMsg]);

    const lower = input.toLowerCase();
    let botReply = "";

    // Check if user is asking about shops/vendors
    if (
      lower.includes("shop") ||
      lower.includes("vendor") ||
      lower.includes("store") ||
      lower.includes("find") ||
      lower.includes("nearby") ||
      lower.includes("show")
    ) {
      botReply = await fetchShops(lower);
    } else {
      const key = Object.keys(staticResponses).find((k) => lower.includes(k));
      botReply = staticResponses[key] || staticResponses.default;
    }

    setMessages((prev) => [...prev, { sender: "bot", text: botReply }]);
    setInput("");
  };

  return (
    <div className="chatbot-container">
      <h2>🤖 Apnabazar Assistant</h2>

      <div className="chatbot-box">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`message ${msg.sender === "user" ? "sent" : "received"}`}
          >
            {msg.text.split("\n").map((line, index) => (
              <p key={index} style={{ margin: "3px 0" }}>
                {line}
              </p>
            ))}
          </div>
        ))}
        {loading && <p className="loading">⏳ Searching nearby shops...</p>}
      </div>

      <form onSubmit={handleSend} className="chatbot-input">
        <input
          type="text"
          placeholder="Ask me about shops, vendors or help..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button type="submit">Send</button>
      </form>
    </div>
  );
}
