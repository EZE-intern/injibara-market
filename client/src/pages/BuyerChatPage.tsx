import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Send } from "lucide-react";
import CustomerNavbar from "../components/customer/CustomerNavbar";
import CustomerFooter from "../components/customer/CustomerFooter";
import { getChatByProduct, sendMessage } from "../api/messageApi";
import { getProductById } from "../api/productApi";
import { getUser } from "../utils/authStorage";
import { isBrokeredProduct } from "../utils/brokeredCategories";
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
      const isAdmin = currentUser?.role?.toLowerCase() === 'admin' || currentUser?.role?.toLowerCase() === 'super_admin';
      await sendMessage({
        product_id: productId,
        message_text: textToSend,
        ...(isAdmin ? { as_customer: true } : {}),
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

  const isTier1 = product ? isBrokeredProduct(product) : false;
  const contactLabel = isTier1 ? "Admin Broker" : sellerName;

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 flex flex-col justify-between">
      <CustomerNavbar hideSearchOnMobile={true} />

      <main className="flex-1 bg-gray-50 dark:bg-slate-950">
        <div className="mx-auto max-w-3xl px-0 sm:px-4 sm:py-6">
          {/* Header */}
          <div className="flex items-center gap-3 px-4 py-3 sm:px-0 sm:mb-4 bg-white sm:bg-transparent dark:bg-slate-900 sm:dark:bg-transparent border-b sm:border-b-0 border-gray-200 dark:border-slate-800">
            <button
              onClick={() => navigate(`/products/${productId}`)}
              className="p-2 -ml-1 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-700 dark:text-gray-200 transition cursor-pointer"
              aria-label="Back to product"
            >
              <ArrowLeft size={20} />
            </button>
            <div className="min-w-0">
              <h1 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white truncate">
                {isTier1 ? "Inquire with Admin" : `Chat with ${contactLabel}`}
              </h1>
              {product && (
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 truncate">
                  {product.name}
                  {isTier1 ? " · Admin-mediated listing" : ""}
                </p>
              )}
            </div>
          </div>

          {isTier1 && (
            <div className="px-4 sm:px-0 mb-3 sm:mb-4">
              <p className="text-xs sm:text-sm text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 rounded-xl px-3.5 py-2.5">
                This is a brokered listing. Your messages go to an Injibara Market
                admin, not the seller.
              </p>
            </div>
          )}

          {/* Chat Container */}
          <div className="bg-white dark:bg-slate-900 rounded-none sm:rounded-2xl border-y sm:border border-gray-200 dark:border-slate-800 shadow-xs overflow-hidden flex flex-col h-[calc(100dvh-130px)] sm:h-[550px]">
            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2.5 bg-gray-50 dark:bg-slate-950">
              {loading ? (
                <div className="flex items-center justify-center h-full text-gray-400 text-xs sm:text-sm">
                  <div className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-red-600 border-t-transparent mr-2" />
                  <span>Loading messages...</span>
                </div>
              ) : messages.length === 0 ? (
                <div className="flex items-center justify-center h-full text-gray-400 text-xs sm:text-sm">
                  <div className="text-center p-4">
                    <p className="font-semibold text-gray-700 dark:text-gray-300">No messages yet.</p>
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      {isTier1
                        ? "Send an inquiry to start mediation with the admin."
                        : "Send a message to start the conversation."}
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
                        className={`max-w-[80%] sm:max-w-[70%] px-3.5 py-2.5 rounded-2xl text-xs sm:text-sm leading-snug shadow-xs ${
                          isMe
                            ? "bg-red-600 text-white rounded-br-xs"
                            : "bg-white dark:bg-slate-800 text-gray-900 dark:text-white border border-gray-200 dark:border-slate-700 rounded-bl-xs"
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
            <div className="p-3 border-t border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                  placeholder={
                    isTier1
                      ? "Write your inquiry to the admin..."
                      : "Write a message..."
                  }
                  className="flex-1 border border-gray-200 dark:border-slate-700 rounded-full px-4 py-2.5 text-xs sm:text-sm focus:outline-none focus:border-red-600 bg-gray-50 dark:bg-slate-800/80 text-gray-900 dark:text-white placeholder-gray-400"
                  disabled={sending}
                />
                <button
                  onClick={handleSend}
                  disabled={sending || !newMessage.trim()}
                  className="bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white p-2.5 rounded-full transition-colors cursor-pointer shrink-0"
                  aria-label="Send message"
                >
                  <Send size={16} />
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
