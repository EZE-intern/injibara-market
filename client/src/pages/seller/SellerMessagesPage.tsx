import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Send } from "lucide-react";
import { getInbox, getThread, sendMessage } from "../../api/messageApi";
import { getUser } from "../../utils/authStorage";
import type { Conversation, Message } from "../../api/messageApi";

function SellerMessagesPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedContact, setSelectedContact] = useState<Conversation | null>(
    null,
  );
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

  // Load conversations list
  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const data = await getInbox();
        setConversations(data);
      } catch (err) {
        console.error("Failed to load conversations:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchConversations();
  }, []);

  // Open a conversation
  const openConversation = async (contact: Conversation) => {
    setSelectedContact(contact);
    setMessages([]);

    try {
      const data = await getThread(contact.contact_id);
      setMessages(data);
    } catch (err) {
      console.error("Failed to load messages", err);
      setMessages([]);
    }
  };

  // Send a message in the current thread
  const handleSend = async () => {
    if (!newMessage.trim() || sending || !selectedContact) return;

    const textToSend = newMessage.trim();
    setNewMessage("");

    try {
      setSending(true);

      const payload: {
        message_text: string;
        receiver_id: number;
        product_id?: number;
      } = {
        message_text: textToSend,
        receiver_id: selectedContact.contact_id,
      };

      if (selectedContact.product_id) {
        payload.product_id = selectedContact.product_id;
      }

      await sendMessage(payload);

      // Optimistic update
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          message_text: textToSend,
          sender_id: Number(currentUser?.id),
          receiver_id: selectedContact.contact_id,
          product_id: selectedContact.product_id,
          order_id: null,
          is_read: false,
          created_at: new Date().toISOString(),
        },
      ]);

      // Refresh inbox list
      const updatedInbox = await getInbox();
      setConversations(updatedInbox);
    } catch {
      setNewMessage(textToSend);
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 pb-16">
        <section className="border-b border-gray-200 bg-white">
          <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            <div className="flex items-center gap-2">
              <Link
                to="/seller"
                className="inline-flex items-center gap-1 text-xs font-bold text-gray-500 hover:text-brand-600 transition"
              >
                <ArrowLeft size={14} />
                Seller Hub
              </Link>
              <span className="text-gray-300">/</span>
              <span className="text-xs font-bold uppercase tracking-wider text-brand-600">
                Messages
              </span>
            </div>
            <h1 className="mt-1 text-2xl font-extrabold text-gray-900">
              Messages
            </h1>
          </div>
        </section>
        <div className="flex items-center justify-center h-32 text-gray-500 text-sm">
          Loading messages...
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 pb-16">
      {/* Header */}
      <section className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <Link
              to="/seller"
              className="inline-flex items-center gap-1 text-xs font-bold text-gray-500 hover:text-brand-600 transition"
            >
              <ArrowLeft size={14} />
              Seller Hub
            </Link>
            <span className="text-gray-300">/</span>
            <span className="text-xs font-bold uppercase tracking-wider text-brand-600">
              Messages
            </span>
          </div>
          <h1 className="mt-1 text-2xl font-extrabold text-gray-900">
            Messages
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            Manage conversations with buyers and respond to inquiries.
          </p>
        </div>
      </section>

      {/* Chat Interface */}
      <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col h-[560px]">
          <div className="flex flex-1 overflow-hidden">
            {/* LEFT — Conversation List */}
            <div
              className={`${
                selectedContact ? "hidden md:flex" : "flex"
              } w-full md:w-72 lg:w-80 flex-col border-r border-gray-100 bg-white`}
            >
              <div className="px-4 py-3 border-b border-gray-100">
                <h2 className="text-sm font-bold text-gray-800">Inbox</h2>
                <p className="text-xs text-gray-500">
                  {conversations.length} conversation
                  {conversations.length !== 1 ? "s" : ""}
                </p>
              </div>

              <div className="flex-1 overflow-y-auto">
                {conversations.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-gray-400 px-4 text-center">
                    <p className="text-sm">No messages yet</p>
                    <p className="text-xs mt-1">
                      Buyer inquiries will appear here.
                    </p>
                  </div>
                ) : (
                  conversations.map((conv) => (
                    <div
                      key={conv.contact_id}
                      onClick={() => openConversation(conv)}
                      className={`px-3 py-3 cursor-pointer border-b border-gray-50 transition-colors ${
                        selectedContact?.contact_id === conv.contact_id
                          ? "bg-brand-50"
                          : "hover:bg-gray-50"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-full bg-brand-100 flex items-center justify-center text-brand-600 font-bold text-sm shrink-0">
                          {(conv.contact_name || "U").charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between">
                            <p className="font-semibold text-gray-800 text-sm truncate">
                              {conv.contact_name || "Unknown"}
                            </p>
                            {conv.unread_count > 0 && (
                              <span className="ml-2 inline-flex items-center justify-center h-5 min-w-5 px-1.5 rounded-full bg-brand-600 text-white text-[10px] font-bold">
                                {conv.unread_count}
                              </span>
                            )}
                          </div>
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

            {/* RIGHT — Chat Area */}
            <div
              className={`${
                selectedContact ? "flex" : "hidden md:flex"
              } flex-1 flex-col bg-gray-50`}
            >
              {selectedContact ? (
                <>
                  {/* Thread Header */}
                  <div className="px-3 py-2.5 border-b border-gray-200 bg-white flex items-center gap-2">
                    <button
                      onClick={() => setSelectedContact(null)}
                      className="md:hidden p-1.5 rounded-full hover:bg-gray-100 text-gray-600 cursor-pointer"
                    >
                      <ArrowLeft size={18} />
                    </button>
                    <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center text-brand-600 font-bold text-xs shrink-0">
                      {(selectedContact.contact_name || "U")
                        .charAt(0)
                        .toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-gray-800 text-sm truncate">
                        {selectedContact.contact_name || "Unknown"}
                      </p>
                      <p className="text-[11px] text-gray-400">
                        {selectedContact.contact_email}
                      </p>
                    </div>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2">
                    {messages.length === 0 ? (
                      <div className="flex items-center justify-center h-full text-gray-400 text-sm">
                        No messages in this conversation yet.
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
                              className={`max-w-[75%] px-3 py-1.5 rounded-2xl text-sm leading-snug ${
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

                  {/* Input */}
                  <div className="p-2.5 border-t border-gray-200 bg-white">
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSend()}
                        placeholder="Write a reply..."
                        className="flex-1 border border-gray-200 rounded-full px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 bg-gray-50"
                        disabled={sending}
                      />
                      <button
                        onClick={handleSend}
                        disabled={sending || !newMessage.trim()}
                        className="bg-brand-600 hover:bg-brand-700 disabled:bg-gray-300 text-white p-2 rounded-full transition-colors cursor-pointer"
                      >
                        <Send size={16} />
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
                  <p className="text-sm">Select a conversation to view</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default SellerMessagesPage;
