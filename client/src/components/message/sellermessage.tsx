import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { FiArrowLeft, FiSend } from "react-icons/fi";

const API_URL = "http://localhost:5000";

function SellerMessage() {
  const [conversations, setConversations] = useState<any[]>([]);
  const [selectedContact, setSelectedContact] = useState<any>(null);
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

  // Load conversations list
 useEffect(() => {
  const fetchConversations = async () => {
    console.log("=== STARTING FETCH CONVERSATIONS ===");
    console.log("Token exists?", !!token);
    console.log("Token value:", token);

    if (!token) {
      console.warn("No token found → skipping request");
      setLoading(false);
      return;
    }

    try {
      console.log("Sending request to:", `${API_URL}/api/messages/inbox`);
      
      const res = await axios.get(`${API_URL}/api/messages/inbox`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log("Response received:", res.data);
      setConversations(res.data.data || []);
    } catch (err: any) {
      console.error("Failed to load conversations:", err);
      console.error("Error response:", err?.response?.data);
    } finally {
      setLoading(false);
    }
  };

  fetchConversations();
}, [token]);

  // Open a conversation
  const openConversation = async (contact: any) => {
    setSelectedContact(contact);
    setMessages([]);

    const contactId = contact.contact_id || contact.id;

    try {
      const res = await axios.get(
        `${API_URL}/api/messages/thread/${contactId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setMessages(res.data.data || []);
    } catch (err) {
      console.error("Failed to load messages", err);
      setMessages([]);
    }
  };

  // Send message
  const handleSend = async () => {
    if (!newMessage.trim() || !selectedContact || sending) return;

    const textToSend = newMessage.trim();
    setNewMessage("");

    try {
      setSending(true);

      const contactId = selectedContact.contact_id || selectedContact.id;

      const payload: any = {
        message_text: textToSend,
        receiver_id: contactId,
      };

      // Keep product_id if we have it (important for buyer side)
      if (selectedContact.product_id) {
        payload.product_id = selectedContact.product_id;
      }

      await axios.post(`${API_URL}/api/messages`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Optimistic update
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          message_text: textToSend,
          sender_id: currentUser?.id,
          receiver_id: contactId,
          created_at: new Date().toISOString(),
        },
      ]);

      // Refresh the conversation to get the real data
      await openConversation(selectedContact);

      // Also refresh the list so latest_message updates
      const res = await axios.get(`${API_URL}/api/messages/inbox`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setConversations(res.data.data || []);
    } catch (err: any) {
      console.error("Send failed", err);
      alert(err?.response?.data?.message || "መልዕክት መላክ አልተሳካም");
      setNewMessage(textToSend);
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32 text-gray-500 text-sm">
        መልዕክቶች በመጫን ላይ...
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col h-[500px]">
        <div className="flex flex-1 overflow-hidden">
          {/* LEFT - Conversation List */}
          <div
            className={`${
              selectedContact ? "hidden md:flex" : "flex"
            } w-full md:w-72 lg:w-80 flex-col border-r border-gray-100 bg-white`}
          >
            <div className="px-4 py-2.5 border-b border-gray-100">
              <h2 className="text-base font-bold text-gray-800">Messages</h2>
              <p className="text-xs text-gray-500">
                {conversations.length} conversation
                {conversations.length !== 1 ? "s" : ""}
              </p>
            </div>

            <div className="flex-1 overflow-y-auto">
              {conversations.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-400 px-4 text-center">
                  <p className="text-sm">ምንም መልዕክት የለም</p>
                </div>
              ) : (
                conversations.map((conv) => (
                  <div
                    key={conv.contact_id}
                    onClick={() => openConversation(conv)}
                    className={`px-3 py-2 cursor-pointer border-b border-gray-50 transition-colors ${
                      selectedContact?.contact_id === conv.contact_id
                        ? "bg-red-50"
                        : "hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-red-600 font-bold text-sm shrink-0">
                        {(conv.contact_name || "B").charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-gray-800 text-sm truncate">
                          {conv.contact_name || "Buyer"}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {conv.latest_message || "No messages yet"}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* RIGHT - Chat Area */}
          <div
            className={`${
              selectedContact ? "flex" : "hidden md:flex"
            } flex-1 flex-col bg-gray-50`}
          >
            {selectedContact ? (
              <>
                {/* Header */}
                <div className="px-3 py-2 border-b border-gray-200 bg-white flex items-center gap-2">
                  <button
                    onClick={() => setSelectedContact(null)}
                    className="md:hidden p-1.5 rounded-full hover:bg-gray-100 text-gray-600"
                  >
                    <FiArrowLeft size={18} />
                  </button>

                  <div className="w-7 h-7 rounded-full bg-red-100 flex items-center justify-center text-red-600 font-bold text-xs shrink-0">
                    {(selectedContact.contact_name || "B")
                      .charAt(0)
                      .toUpperCase()}
                  </div>

                  <div className="min-w-0">
                    <p className="font-semibold text-gray-800 text-sm truncate">
                      {selectedContact.contact_name || "Buyer"}
                    </p>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto px-3 py-2 space-y-2">
                  {messages.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-gray-400 text-sm">
                      ውይይት ጀምር...
                    </div>
                  ) : (
                    messages.map((msg) => {
                      const isMe =
                        Number(msg.sender_id) === Number(currentUser?.id);

                      return (
                        <div
                          key={msg.id}
                          className={`flex ${
                            isMe ? "justify-end" : "justify-start"
                          }`}
                        >
                          <div
                            className={`max-w-[75%] px-3 py-1.5 rounded-2xl text-sm leading-snug ${
                              isMe
                                ? "bg-red-600 text-white rounded-br-md"
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

                {/* Input */}
                <div className="p-2 border-t border-gray-200 bg-white">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSend()}
                      placeholder="መልዕክት ይጻፉ..."
                      className="flex-1 border border-gray-200 rounded-full px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 bg-gray-50"
                      disabled={sending}
                    />
                    <button
                      onClick={handleSend}
                      disabled={sending || !newMessage.trim()}
                      className="bg-red-600 hover:bg-red-700 disabled:bg-red-300 text-white p-2 rounded-full transition-colors"
                    >
                      <FiSend size={15} />
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
                <p className="text-sm">ውይይት ይምረጡ</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default SellerMessage;
