import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { Link } from "react-router-dom";

import {
  getConversation,
  getInbox,
  sendMessage,
  type ConversationSummary,
  type Message,
} from "../../api/messageApi";

import { getUser } from "../../utils/authStorage";

function CustomerMessagesPage() {
  const [conversations, setConversations] = useState<
    ConversationSummary[]
  >([]);

  const [selectedConversation, setSelectedConversation] =
    useState<ConversationSummary | null>(null);

  const [messages, setMessages] = useState<Message[]>([]);

  const [messageText, setMessageText] = useState("");

  const [loadingInbox, setLoadingInbox] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);

  const [error, setError] = useState("");

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

  const loadInbox = async () => {
    try {
      setLoadingInbox(true);
      setError("");

      const data = await getInbox();

      setConversations(data);

      /*
       * Automatically open the first conversation.
       */
      if (data.length > 0) {
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
       * Refresh inbox so latest message/unread information
       * is also updated.
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

    return parsedDate.toLocaleString();
  };

  const isOwnMessage = (message: Message) => {
    return message.sender_id === currentUser?.id;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto flex h-[calc(100vh-80px)] max-w-7xl overflow-hidden border-x border-gray-200 bg-white">
        {/* =========================
            CONVERSATION LIST
        ========================= */}

        <aside className="w-full max-w-sm border-r border-gray-200">
          <div className="border-b border-gray-200 p-5">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  Messages
                </h1>

                <p className="mt-1 text-sm text-gray-500">
                  Your conversations
                </p>
              </div>

              <Link
                to="/customer"
                className="text-sm font-medium text-gray-600 hover:text-black"
              >
                Back
              </Link>
            </div>
          </div>

          {error && (
            <div className="m-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {loadingInbox ? (
            <div className="p-6 text-center text-sm text-gray-500">
              Loading conversations...
            </div>
          ) : conversations.length === 0 ? (
            <div className="p-8 text-center">
              <h2 className="font-semibold text-gray-900">
                No conversations
              </h2>

              <p className="mt-2 text-sm text-gray-500">
                Start a conversation with a seller from a product page.
              </p>

              <Link
                to="/products"
                className="mt-5 inline-block rounded-lg bg-black px-4 py-2 text-sm font-medium text-white"
              >
                Browse Products
              </Link>
            </div>
          ) : (
            <div className="overflow-y-auto">
              {conversations.map((conversation) => {
                const isSelected =
                  selectedConversation?.contact_id ===
                  conversation.contact_id;

                return (
                  <button
                    key={`${conversation.contact_id}-${conversation.product_id}`}
                    type="button"
                    onClick={() =>
                      setSelectedConversation(conversation)
                    }
                    className={`w-full border-b border-gray-100 p-4 text-left transition ${
                      isSelected
                        ? "bg-gray-100"
                        : "hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h3 className="font-semibold text-gray-900">
                          {conversation.contact_name}
                        </h3>

                        <p className="mt-1 truncate text-sm text-gray-500">
                          {conversation.latest_message}
                        </p>
                      </div>

                      {conversation.unread_count > 0 && (
                        <span className="rounded-full bg-black px-2 py-0.5 text-xs text-white">
                          {conversation.unread_count}
                        </span>
                      )}
                    </div>

                    <p className="mt-2 text-xs text-gray-400">
                      {formatDate(conversation.latest_message_at)}
                    </p>
                  </button>
                );
              })}
            </div>
          )}
        </aside>

        {/* =========================
            CHAT
        ========================= */}

        <main className="flex min-w-0 flex-1 flex-col">
          {!selectedConversation ? (
            <div className="flex flex-1 items-center justify-center p-8 text-center">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Select a conversation
                </h2>

                <p className="mt-2 text-sm text-gray-500">
                  Choose a conversation from the left to start chatting.
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* Chat header */}

              <div className="border-b border-gray-200 p-5">
                <h2 className="font-bold text-gray-900">
                  {selectedConversation.contact_name}
                </h2>

                <p className="text-sm text-gray-500">
                  {selectedConversation.contact_email}
                </p>

                {selectedConversation.product_id && (
                  <p className="mt-1 text-xs text-gray-400">
                    Product #{selectedConversation.product_id}
                  </p>
                )}
              </div>

              {/* Messages */}

              <div className="flex-1 space-y-4 overflow-y-auto bg-gray-50 p-5">
                {loadingMessages ? (
                  <div className="text-center text-sm text-gray-500">
                    Loading conversation...
                  </div>
                ) : messages.length === 0 ? (
                  <div className="text-center text-sm text-gray-500">
                    No messages yet.
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
                          className={`max-w-[75%] rounded-2xl px-4 py-3 ${
                            own
                              ? "bg-black text-white"
                              : "bg-white text-gray-900 border border-gray-200"
                          }`}
                        >
                          <p className="whitespace-pre-wrap text-sm">
                            {message.message_text}
                          </p>

                          <p
                            className={`mt-1 text-xs ${
                              own
                                ? "text-gray-300"
                                : "text-gray-400"
                            }`}
                          >
                            {formatDate(message.created_at)}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Send message */}

              <form
                onSubmit={handleSendMessage}
                className="border-t border-gray-200 bg-white p-4"
              >
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={messageText}
                    onChange={(event) =>
                      setMessageText(event.target.value)
                    }
                    placeholder="Write a message..."
                    disabled={sending}
                    className="min-w-0 flex-1 rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-black"
                  />

                  <button
                    type="submit"
                    disabled={sending || !messageText.trim()}
                    className="rounded-lg bg-black px-5 py-3 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {sending ? "Sending..." : "Send"}
                  </button>
                </div>
              </form>
            </>
          )}
        </main>
      </div>
    </div>
  );
}

export default CustomerMessagesPage;