import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { db } from '../config/firebase';
import {
  collection, query, where, getDocs, doc, getDoc
} from 'firebase/firestore';
import { Timestamp } from 'firebase/firestore';

interface ChatUser {
  userId: string;
  username: string;
  lastMessage: string;
  lastTimestamp: Timestamp;
  seen: boolean;
  sentByMe: boolean;
}

export default function AllMessages() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [chatUsers, setChatUsers] = useState<ChatUser[]>([]);

  useEffect(() => {
    if (!user) return;

    const loadChats = async () => {
      const q = query(collection(db, 'messages'), where('senderId', '==', user.id));
      const r = query(collection(db, 'messages'), where('receiverId', '==', user.id));

      const [sentSnap, receivedSnap] = await Promise.all([getDocs(q), getDocs(r)]);

      const latestMap = new Map<string, { message: string; timestamp: Timestamp; seen: boolean; sentByMe: boolean }>();

      [...sentSnap.docs, ...receivedSnap.docs].forEach((docSnap) => {
        const data = docSnap.data();
        const otherUserId = data.senderId === user.id ? data.receiverId : data.senderId;
        const isSentByMe = data.senderId === user.id;

        const existing = latestMap.get(otherUserId);
        const isLater = !existing || data.timestamp.toMillis() > existing.timestamp.toMillis();

        if (isLater) {
          latestMap.set(otherUserId, {
            message: data.message,
            timestamp: data.timestamp,
            seen: data.seen ?? false,
            sentByMe: isSentByMe,
          });
        }
      });

      const chatList: ChatUser[] = [];

      for (const [userId, { message, timestamp, seen, sentByMe }] of latestMap.entries()) {
        const userSnap = await getDoc(doc(db, 'users', userId));
        const username = userSnap.exists() ? userSnap.data().username : 'Unknown';

        chatList.push({ userId, username, lastMessage: message, lastTimestamp: timestamp, seen, sentByMe });
      }

      chatList.sort((a, b) => b.lastTimestamp.toMillis() - a.lastTimestamp.toMillis());
      setChatUsers(chatList);
    };

    loadChats();
  }, [user]);

  return (
    <div className="min-h-screen bg-gray-900 text-white py-10 px-4 sm:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-white">Your Chats</h1>

        {chatUsers.length === 0 ? (
          <p className="text-gray-400">No chats yet. Start messaging someone!</p>
        ) : (
          <div className="space-y-4">
            {chatUsers.map((chat) => {
              const isUnread = !chat.sentByMe; // Received message
              const isSentByMeUnseen = chat.sentByMe && !chat.seen;
              const isSentByMeSeen = chat.sentByMe && chat.seen;

              const bgClass = isUnread
                ? 'bg-blue-900/40 hover:bg-blue-900/60'
                : 'bg-gray-800 hover:bg-gray-700';

              return (
                <div
                  key={chat.userId}
                  onClick={() => navigate(`/messageuser/${chat.username}?id=${chat.userId}`)}
                  className={`transition-all rounded-lg px-4 py-3 cursor-pointer border border-gray-700 ${bgClass}`}
                >
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      {/* Dot */}
                      {chat.sentByMe && (
                        <span
                          className={`h-2.5 w-2.5 rounded-full ${
                            chat.seen ? 'bg-green-500' : 'bg-red-500'
                          }`}
                        ></span>
                      )}
                      <span className={`text-lg ${isUnread ? 'font-semibold' : 'text-gray-300'}`}>
                        @{chat.username}
                      </span>
                    </div>
                    <span className="text-xs text-gray-400">
                      {chat.lastTimestamp.toDate().toLocaleTimeString()}
                    </span>
                  </div>
                  <p
                    className={`mt-1 text-sm truncate ${
                      isUnread ? 'text-white font-medium' : 'text-gray-400'
                    }`}
                  >
                    {chat.lastMessage}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
