import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { db } from '../config/firebase';
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  addDoc,
  onSnapshot,
  deleteDoc,
  doc,
} from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import { Message } from '../types';
import { MoreVertical } from 'lucide-react';

const MessageUser: React.FC = () => {
  const { username } = useParams();
  const { user } = useAuth();
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [receiver, setReceiver] = useState<any>(null);
  const [showMenu, setShowMenu] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) return;

    const fetchReceiver = async () => {
      const q = query(collection(db, 'users'), where('username', '==', username));
      const snapshot = await getDocs(q);
      const receiverData = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))[0];
      setReceiver(receiverData);
    };

    fetchReceiver();
  }, [username, user]);

  useEffect(() => {
    if (!receiver) return;

    const messagesQuery = query(
      collection(db, 'messages'),
      where('senderId', 'in', [user.id, receiver.id]),
      where('receiverId', 'in', [user.id, receiver.id]),
      orderBy('timestamp', 'asc'),
      limit(100)
    );

    const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
      const liveMessages = snapshot.docs.map((doc) => ({
        ...(doc.data() as Message),
        docId: doc.id,
      }));
      setMessages(liveMessages);

      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    });

    return () => unsubscribe();
  }, [receiver]);

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    try {
      await addDoc(collection(db, 'messages'), {
        senderId: user.id,
        receiverId: receiver.id,
        message: newMessage,
        timestamp: new Date(),
        seen: false,
      });
      setNewMessage('');
    } catch (error) {
      console.error('Message send error:', error);
    }
  };

  const deleteMessage = async (docId: string) => {
    try {
      await deleteDoc(doc(db, 'messages', docId));
    } catch (error) {
      console.error('Error deleting message:', error);
    }
  };

  return (
    <div className="w-full h-screen bg-gray-900 text-white flex flex-col overflow-hidden">
      {/* Header */}
      <div className="bg-gray-800 px-6 py-4 shadow border-b border-gray-700">
        <h2 className="text-lg font-semibold">Chat with @{username}</h2>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => {
          const isSender = message.senderId === user.id;
          const initials = isSender ? user.username?.[0] : receiver?.username?.[0];

          return (
            <div
              key={index}
              className={`flex items-end gap-2 ${isSender ? 'justify-end' : 'justify-start'}`}
            >
              {!isSender && (
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-xs font-bold">
                  {initials?.toUpperCase()}
                </div>
              )}
              <div className="relative max-w-sm px-4 py-2 rounded-lg text-sm group 
                transition-all duration-200 
                shadow-sm 
                cursor-pointer 
                flex flex-col
                space-y-1
                group-hover:bg-opacity-95
                group-hover:scale-[1.01]
                " style={{ backgroundColor: isSender ? '#2563EB' : '#374151', color: isSender ? '#fff' : '#E5E7EB' }}
              >
                <p>{message.message}</p>
                <span className="block text-xs text-gray-300 text-right">
                  {new Date(message.timestamp?.seconds * 1000).toLocaleTimeString()}
                </span>

                {/* Message Menu */}
                {isSender && (
                  <div className="absolute -top-2 -right-6">
                    <button onClick={() => setShowMenu(showMenu === message.docId ? null : message.docId)}>
                      <MoreVertical className="w-4 h-4 text-gray-400 hover:text-gray-100" />
                    </button>
                    {showMenu === message.docId && (
                      <div className="absolute right-0 top-6 bg-gray-700 text-sm rounded shadow-md z-10">
                        <button
                          className="px-3 py-1 hover:bg-gray-600 w-full text-left"
                          onClick={() => {
                            deleteMessage(message.docId);
                            setShowMenu(null);
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
              {isSender && (
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-xs font-bold">
                  {initials?.toUpperCase()}
                </div>
              )}
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="bg-gray-800 px-4 py-3 border-t border-gray-700 flex items-center gap-2">
        <input
          type="text"
          placeholder="Type a message..."
          className="flex-1 p-2 rounded bg-gray-700 text-white focus:outline-none"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
        />
        <button
          onClick={sendMessage}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default MessageUser;
