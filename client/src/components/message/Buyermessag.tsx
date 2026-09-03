import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { FiArrowLeft, FiSend } from "react-icons/fi";

const API_URL = "http://localhost:5000";

function BuyerMessage() {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();

  const [product, setProduct] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const token = localStorage.getItem("token");
  const currentUser = localStorage.getItem("user")
    ? JSON.parse(localStorage.getItem("user") || "{}")
    : null;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // ምርቱን መጫን
  useEffect(() => {
    if (!productId) return;

    const fetchProduct = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/products/${productId}`);
        setProduct(res.data);
      } catch (err) {
        console.error("Failed to load product", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId]);

  // መልዕክቶችን በ polling ማምጣት
  useEffect(() => {
    if (!productId || !token) return;

    const loadMessages = async () => {
      try {
        const res = await axios.get(
          `${API_URL}/api/messages/chat/${productId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const rawMessages = res.data.data || res.data || [];
        const formatted = Array.isArray(rawMessages)
          ? rawMessages.map((msg: any) => ({
              ...msg,
              is_me: Number(msg.sender_id) === Number(currentUser?.id),
              text: msg.message_text || msg.message || msg.text || "",
            }))
          : [];

        setMessages(formatted);
      } catch (err) {
        console.error("Failed to load messages", err);
      }
    };

    loadMessages();
    const interval = setInterval(loadMessages, 3000);

    return () => clearInterval(interval);
  }, [productId, token, currentUser?.id]);

  // መልዕክት መላክ
  const handleSend = async () => {
    if (!newMessage.trim() || sending) return;

    const textToSend = newMessage.trim();
    setNewMessage("");

    try {
      setSending(true);

      await axios.post(
        `${API_URL}/api/messages`,
        {
          product_id: productId,
          message_text: textToSend,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Optimistic update
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          message_text: textToSend,
          text: textToSend,
          is_me: true,
          sender_id: currentUser?.id,
        },
      ]);
    } catch (err: any) {
      alert(err?.response?.data?.message || "መልዕክት መላክ አልተሳካም።");
      setNewMessage(textToSend);
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32 text-gray-500 text-sm">
        መረጃ በመጫን ላይ...
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-6">
      <div className="flex items-center gap-3 mb-4">
        <button
          onClick={() => navigate(`/product/${productId}`)}
          className="p-2 rounded-full hover:bg-gray-100 text-gray-600"
        >
          <FiArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-lg font-bold text-gray-900">
            Chat with{" "}
            {product?.seller?.name ||
              product?.seller_name ||
              product?.user?.name ||
              "Seller"}
          </h1>
          <p className="text-sm text-gray-500 truncate">
            {product?.name || product?.title}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col h-[500px]">
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2 bg-gray-50">
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full text-gray-400 text-sm">
              ውይይት ጀምር...
            </div>
          ) : (
            messages.map((msg: any) => (
              <div
                key={msg.id}
                className={`flex ${msg.is_me ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[75%] px-3 py-2 rounded-2xl text-sm leading-snug ${
                    msg.is_me
                      ? "bg-red-600 text-white rounded-br-md"
                      : "bg-white text-gray-800 border border-gray-100 rounded-bl-md"
                  }`}
                >
                  {msg.text || msg.message_text}
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-3 border-t border-gray-200 bg-white">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="መልዕክት ይጻፉ..."
              className="flex-1 border border-gray-200 rounded-full px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 bg-gray-50"
              disabled={sending}
            />
            <button
              onClick={handleSend}
              disabled={sending || !newMessage.trim()}
              className="bg-red-600 hover:bg-red-700 disabled:bg-red-300 text-white p-2.5 rounded-full transition-colors"
            >
              <FiSend size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BuyerMessage;
