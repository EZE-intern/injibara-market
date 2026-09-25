import { useEffect, useState, useRef } from "react";
import type { FormEvent } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Send, MessageSquare, ShoppingBag } from "lucide-react";

import {
  getConversation,
  getInbox,
  sendMessage,
  type ConversationSummary,
  type Message,
} from "../../api/messageApi";

import { getUser } from "../../utils/authStorage";
import CustomerNavbar from "../../components/customer/CustomerNavbar";
import CustomerBottomNav from "../../components/customer/CustomerBottomNav";

function CustomerMessagesPage() {
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [selectedConversation, setSelectedConversation] =
    useState<ConversationSummary | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageText, setMessageText] = useState("");
  const [loadingInbox, setLoadingInbox] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const currentUser = getUser();

  /*
   * Load inbox when page opens.
   */
  useEffect(() => {
    loadInbox();
  }, []);

  /*
   * Load messages when the selected conversation changes.
   */
  useEffect(() => {
    if (!selectedConversation) {
      setMessages([]);
      return;
    }

    loadConversation(selectedConversation.contact_id);
  }, [selectedConversation]);

  /*
   * Auto scroll chat to bottom when messages update.
   */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const loadInbox = async () => {
    try {
      setLoadingInbox(true);
      setError("");

      const data = await getInbox();
      setConversations(data);

      /*
       * Automatically open the first conversation ONLY on desktop/tablet screens.
       * On mobile screens (<768px), keep selectedConversation null so the user sees their inbox list.
       */
      if (
        data.length > 0 &&
        typeof window !== "undefined" &&
        window.innerWidth >= 768
      ) {
        setSelectedConversation(data[0]);
      }
    } catch {
      setError("Unable to load your messages.");
    } finally {
      setLoadingInbox(false);
    }
  };

  const loadConversation = async (contactId: number) => {
    try {
      setLoadingMessages(true);
      setError("");

      const data = await getConversation(contactId);
      setMessages(data);
    } catch {
      setError("Unable to load this conversation.");
    } finally {
      setLoadingMessages(false);
    }
  };

  const handleSendMessage = async (event: FormEvent) => {
    event.preventDefault();

    if (!selectedConversation) return;

    const trimmedMessage = messageText.trim();
    if (!trimmedMessage) return;

    try {
      setSending(true);
      setError("");

      await sendMessage({
        receiver_id: selectedConversation.contact_id,
        product_id: selectedConversation.product_id ?? undefined,
        message_text: trimmedMessage,
      });

      setMessageText("");

      /*
       * The send endpoint returns only message metadata,
       * so reload the actual conversation.
       */
      await loadConversation(selectedConversation.contact_id);

      /*
       * Refresh inbox so latest message/unread information is updated.
       */
      const updatedInbox = await getInbox();
      setConversations(updatedInbox);

      const updatedConversation = updatedInbox.find(
        (conversation) =>
          conversation.contact_id === selectedConversation.contact_id
      );

      if (updatedConversation) {
        setSelectedConversation(updatedConversation);
      }
    } catch {
      setError("Unable to send your message.");
    } finally {
      setSending(false);
    }
  };

  const formatDate = (date: string) => {
    const parsedDate = new Date(date);
    if (Number.isNaN(parsedDate.getTime())) {
      return "";
    }

    const isToday =
      new Date().toDateString() === parsedDate.toDateString();
    if (isToday) {
      return parsedDate.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    }

    return parsedDate.toLocaleDateString([], {
      month: "short",
      day: "numeric",
    });
  };

  const isOwnMessage = (message: Message) => {
    return message.sender_id === currentUser?.id;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 flex flex-col justify-between">
      <CustomerNavbar hideSearchOnMobile={true} />

      <main className="flex-1 flex flex-col max-w-7xl w-full mx-auto sm:px-4 sm:py-6">
        <div className="flex-1 flex h-[calc(100dvh-60px)] sm:h-[calc(100vh-140px)] overflow-hidden rounded-none sm:rounded-2xl border-y sm:border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
          {/* ========================================================
              CONVERSATION LIST (INBOX)
              - On mobile: visible only when selectedConversation === null
              - On desktop: always visible (w-80 lg:w-96)
          ======================================================== */}
          <aside
            className={`${
              selectedConversation ? "hidden md:flex" : "flex"
            } w-full md:w-80 lg:w-96 flex-col border-r border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 shrink-0`}
          >
            {/* Inbox Header */}
            <div className="flex items-center justify-between border-b border-gray-200 dark:border-slate-800 p-4">
              <div>
                <h1 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
                  Messages
                </h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {conversations.length} conversation{conversations.length === 1 ? "" : "s"}
                </p>
              </div>

              <Link
                to="/"
                className="inline-flex items-center gap-1 text-xs font-semibold text-gray-600 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 transition"
              >
                <ArrowLeft size={14} />
                <span>Marketplace</span>
              </Link>
            </div>

            {error && (
              <div className="m-3 rounded-xl border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/40 p-3 text-xs text-red-700 dark:text-red-300">
                {error}
              </div>
            )}

            {/* Conversation Items List */}
            {loadingInbox ? (
              <div className="flex flex-1 items-center justify-center p-8 text-center text-xs text-gray-400">
                <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-red-600 border-t-transparent mr-2" />
                <span>Loading conversations...</span>
              </div>
            ) : conversations.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center p-8 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-50 dark:bg-red-950/50 text-red-600 mb-3">
                  <MessageSquare size={24} />
                </div>
                <h2 className="font-bold text-gray-900 dark:text-white text-sm">
                  No conversations yet
                </h2>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 max-w-[200px]">
                  Contact sellers from product listings to start chatting.
                </p>
                <Link
                  to="/"
                  className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-red-600 hover:bg-red-700 px-4 py-2 text-xs font-bold text-white transition shadow-xs"
                >
                  <ShoppingBag size={14} />
                  <span>Browse Products</span>
                </Link>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto divide-y divide-gray-100 dark:divide-slate-800/60">
                {conversations.map((conversation) => {
                  const isSelected =
                    selectedConversation?.contact_id ===
                    conversation.contact_id;

                  const initial =
                    conversation.contact_name?.charAt(0).toUpperCase() || "U";

                  return (
                    <button
                      key={`${conversation.contact_id}-${conversation.product_id}`}
                      type="button"
                      onClick={() => setSelectedConversation(conversation)}
                      className={`w-full p-4 text-left transition cursor-pointer flex items-start gap-3 ${
                        isSelected
                          ? "bg-red-50/60 dark:bg-slate-800/80 border-l-4 border-l-red-600"
                          : "hover:bg-gray-50 dark:hover:bg-slate-800/40"
                      }`}
                    >
                      {/* Avatar */}
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-red-500 to-rose-600 text-white font-bold text-sm shadow-xs">
                        {initial}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <h3 className="font-semibold text-sm text-gray-900 dark:text-white truncate">
                            {conversation.contact_name}
                          </h3>
                          <span className="text-[10px] text-gray-400 dark:text-gray-500 shrink-0">
                            {formatDate(conversation.latest_message_at)}
                          </span>
                        </div>

                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 truncate">
                          {conversation.latest_message}
                        </p>

                        {conversation.product_id && (
                          <span className="mt-1.5 inline-block text-[10px] font-medium text-gray-400 dark:text-gray-500">
                            Listing #{conversation.product_id}
                          </span>
                        )}
                      </div>

                      {conversation.unread_count > 0 && (
                        <span className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-red-600 px-1.5 text-[10px] font-bold text-white">
                          {conversation.unread_count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </aside>

          {/* ========================================================
              ACTIVE CHAT VIEW
              - On mobile: visible only when selectedConversation !== null
              - On desktop: always visible (flex-1)
          ======================================================== */}
          <main
            className={`${
              selectedConversation ? "flex" : "hidden md:flex"
            } flex-1 flex-col bg-gray-50 dark:bg-slate-950 min-w-0`}
          >
            {!selectedConversation ? (
              <div className="flex flex-1 flex-col items-center justify-center p-8 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 dark:bg-slate-800 text-gray-400 mb-3">
                  <MessageSquare size={28} />
                </div>
                <h2 className="text-base font-bold text-gray-900 dark:text-white">
                  Select a conversation
                </h2>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 max-w-xs">
                  Choose a chat thread from the left to start messaging.
                </p>
              </div>
            ) : (
              <>
                {/* Chat Top Header */}
                <div className="flex items-center justify-between border-b border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-3 shadow-xs">
                  <div className="flex items-center gap-2.5 min-w-0">
                    {/* Mobile Back Button */}
                    <button
                      type="button"
                      onClick={() => setSelectedConversation(null)}
                      className="md:hidden flex h-8 w-8 items-center justify-center rounded-full text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-800 transition cursor-pointer"
                      aria-label="Back to conversations"
                    >
                      <ArrowLeft size={18} />
                    </button>

                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-red-500 to-rose-600 text-white font-bold text-sm">
                      {selectedConversation.contact_name?.charAt(0).toUpperCase() ||
                        "U"}
                    </div>

                    <div className="min-w-0">
                      <h2 className="text-sm font-bold text-gray-900 dark:text-white truncate">
                        {selectedConversation.contact_name}
                      </h2>
                      <p className="text-[11px] text-gray-400 dark:text-gray-500 truncate">
                        {selectedConversation.contact_email}
                      </p>
                    </div>
                  </div>

                  {selectedConversation.product_id && (
                    <Link
                      to={`/products/${selectedConversation.product_id}`}
                      className="shrink-0 text-xs font-semibold text-red-600 dark:text-red-400 hover:underline px-2.5 py-1 rounded-lg bg-red-50 dark:bg-red-950/50"
                    >
                      View Product #{selectedConversation.product_id}
                    </Link>
                  )}
                </div>

                {/* Messages Thread */}
                <div className="flex-1 space-y-3 overflow-y-auto p-4 sm:p-5">
                  {loadingMessages ? (
                    <div className="flex h-full items-center justify-center text-xs text-gray-400">
                      <div className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-red-600 border-t-transparent mr-2" />
                      Loading messages...
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="flex h-full flex-col items-center justify-center text-xs text-gray-400">
                      <p>No messages yet.</p>
                      <p className="mt-1 text-[11px] text-gray-400">
                        Say hello to get things started!
                      </p>
                    </div>
                  ) : (
                    messages.map((message) => {
                      const own = isOwnMessage(message);

                      return (
                        <div
                          key={message.id}
                          className={`flex ${
                            own ? "justify-end" : "justify-start"
                          }`}
                        >
                          <div
                            className={`max-w-[80%] sm:max-w-[70%] rounded-2xl px-4 py-2.5 text-xs sm:text-sm ${
                              own
                                ? "bg-red-600 text-white rounded-br-xs shadow-xs"
                                : "bg-white dark:bg-slate-800 text-gray-900 dark:text-white border border-gray-200 dark:border-slate-700 rounded-bl-xs shadow-xs"
                            }`}
                          >
                            <p className="whitespace-pre-wrap leading-relaxed">
                              {message.message_text}
                            </p>
                            <p
                              className={`mt-1 text-[10px] text-right ${
                                own ? "text-red-200" : "text-gray-400"
                              }`}
                            >
                              {formatDate(message.created_at)}
                            </p>
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input Bar */}
                <form
                  onSubmit={handleSendMessage}
                  className="border-t border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3 sm:p-4"
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      placeholder="Write a message..."
                      disabled={sending}
                      className="min-w-0 flex-1 rounded-full border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800/80 px-4 py-2.5 text-xs sm:text-sm text-gray-900 dark:text-white placeholder-gray-400 outline-none focus:border-red-600 focus:bg-white dark:focus:bg-slate-800 transition"
                    />

                    <button
                      type="submit"
                      disabled={sending || !messageText.trim()}
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white shadow-xs transition cursor-pointer"
                      aria-label="Send message"
                    >
                      <Send size={16} />
                    </button>
                  </div>
                </form>
              </>
            )}
          </main>
        </div>
      </main>

      {/* Mobile Bottom Navigation (Only visible when browsing inbox list on mobile) */}
      {!selectedConversation && (
        <div className="block md:hidden">
          <CustomerBottomNav />
        </div>
      )}
    </div>
  );
}

export default CustomerMessagesPage;