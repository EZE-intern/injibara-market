import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Send } from "lucide-react";
import CustomerNavbar from "../components/customer/CustomerNavbar";
import CustomerFooter from "../components/customer/CustomerFooter";
import { getChatByProduct, sendMessage } from "../api/messageApi";
import { getProductById } from "../api/productApi";
import { getUser } from "../utils/authStorage";
import type { Message } from "../api/messageApi";
import type { Product } from "../types/Product";

function BuyerChatPage() {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();

  const [product, setProduct] = useState<Product | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const currentUser = getUser();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load product details
  useEffect(() => {
    if (!productId) return;
    const fetchProduct = async () => {
      try {
        const data = await getProductById(productId);
        setProduct(data);
      } catch (err) {
        console.error("Failed to load product", err);
      }
    };
    fetchProduct();
  }, [productId]);

  // Load messages with polling
  useEffect(() => {
    if (!productId) return;

    const loadMessages = async () => {
      try {
        const data = await getChatByProduct(productId);
        setMessages(data);
      } catch (err) {
        console.error("Failed to load messages", err);
      } finally {
        setLoading(false);
      }
    };

    loadMessages();
    const interval = setInterval(loadMessages, 5000);
    return () => clearInterval(interval);
  }, [productId]);

  const handleSend = async () => {
    if (!newMessage.trim() || sending || !productId) return;

    const textToSend = newMessage.trim();
    setNewMessage("");

    try {
      setSending(true);
      await sendMessage({
        product_id: productId,
        message_text: textToSend,
      });

      // Optimistic update
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          message_text: textToSend,
          sender_id: Number(currentUser?.id),
          receiver_id: 0,
          product_id: Number(productId),
          order_id: null,
          is_read: false,
          created_at: new Date().toISOString(),
        },
      ]);
    } catch {
      setNewMessage(textToSend);
    } finally {
      setSending(false);
    }
  };

  const rawProduct = product as (Product & {
    stores?: { store_name?: string } | null;
    store?: { store_name?: string } | null;
    users?: { full_name?: string } | null;
    seller?: { full_name?: string } | null;
  }) | null;

  const sellerName =
    rawProduct?.stores?.store_name ||
    rawProduct?.store?.store_name ||
    rawProduct?.users?.full_name ||
    rawProduct?.seller?.full_name ||
    "Seller";

  return (
    <div className="min-h-screen bg-white flex flex-col justify-between">
      <CustomerNavbar />

      <main className="flex-1 bg-gray-50">
        <div className="mx-auto max-w-3xl px-4 py-6">
          {/* Header */}
          <div className="flex items-center gap-3 mb-4">
            <button
              onClick={() => navigate(`/products/${productId}`)}
              className="p-2 rounded-full hover:bg-gray-100 text-gray-600 transition cursor-pointer"
            >
              <ArrowLeft size={20} />
            </button>
            <div className="min-w-0">
              <h1 className="text-lg font-bold text-gray-900 truncate">
                Chat with {sellerName}
              </h1>
              {product && (
                <p className="text-sm text-gray-500 truncate">
                  {product.name}
                </p>
              )}
            </div>
          </div>

          {/* Chat Container */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col h-[500px]">
            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2 bg-gray-50">
              {loading ? (
                <div className="flex items-center justify-center h-full text-gray-400 text-sm">
                  Loading messages...
                </div>
              ) : messages.length === 0 ? (
                <div className="flex items-center justify-center h-full text-gray-400 text-sm">
                  <div className="text-center">
                    <p>No messages yet.</p>
                    <p className="mt-1 text-xs">
                      Send a message to start the conversation.
                    </p>
                  </div>
                </div>
              ) : (
                messages.map((msg) => {
                  const isMe =
                    Number(msg.sender_id) === Number(currentUser?.id);
                  return (
                    <div
                      key={msg.id}
                      className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[75%] px-3 py-2 rounded-2xl text-sm leading-snug ${
                          isMe
                            ? "bg-brand-600 text-white rounded-br-md"
                            : "bg-white text-gray-800 border border-gray-100 rounded-bl-md"
                        }`}
                      >
                        {msg.message_text}
                      </div>
                    </div>
                  );
                })
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
                  placeholder="Write a message..."
                  className="flex-1 border border-gray-200 rounded-full px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 bg-gray-50"
                  disabled={sending}
                />
                <button
                  onClick={handleSend}
                  disabled={sending || !newMessage.trim()}
                  className="bg-brand-600 hover:bg-brand-700 disabled:bg-gray-300 text-white p-2.5 rounded-full transition-colors cursor-pointer"
                >
                  <Send size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      <CustomerFooter />
    </div>
  );
}

export default BuyerChatPage;
