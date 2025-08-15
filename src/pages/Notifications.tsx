import React, { useEffect, useState } from 'react';
import { db } from '../config/firebase';
import { useAuth } from '../context/AuthContext';
import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
  doc,
  updateDoc,
  addDoc,
  getDoc,
  Timestamp,
} from 'firebase/firestore';
import Button from '../components/UI/Button';

interface Notif {
  id: string;
  toUserId: string;
  fromUserId: string;
  type: string;
  createdAt: any;
  fromUserName?: string;
}

interface Conn {
  id: string;
  userIdA: string;
  userIdB: string;
  status: string;
}

const Notifications: React.FC = () => {
  const { user } = useAuth();
  const [notifs, setNotifs] = useState<Notif[]>([]);
  const [conns, setConns] = useState<Conn[]>([]);
  const [accepted, setAccepted] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (!user) return;

      try {
        // Load notifications
        const nq = query(
          collection(db, 'notifications'),
          where('toUserId', '==', user.id),
          orderBy('createdAt', 'desc')
        );
        const nqSnap = await getDocs(nq);
        const rawNotifs = nqSnap.docs.map(d => ({ id: d.id, ...(d.data() as Notif) }));

        // Load usernames
        const userIds = Array.from(new Set(rawNotifs.map(n => n.fromUserId)));
        const userDocs = await Promise.all(
          userIds.map(uid => getDoc(doc(db, 'users', uid)))
        );
        const userMap: { [id: string]: string } = {};
        userDocs.forEach((docSnap, idx) => {
          if (docSnap.exists()) {
            const data = docSnap.data();
            userMap[userIds[idx]] = data.name || 'Unknown';
          }
        });

        // Add usernames into notifications
        const enriched = rawNotifs.map(n => ({
          ...n,
          fromUserName: userMap[n.fromUserId] || n.fromUserId,
        }));

        setNotifs(enriched);

        // Load pending connections
        const cq = query(
          collection(db, 'connections'),
          where('userIdB', '==', user.id),
          where('status', '==', 'pending')
        );
        const cqSnap = await getDocs(cq);
        setConns(cqSnap.docs.map(d => ({ id: d.id, ...(d.data() as Conn) })));
      } catch (err) {
        console.error('Error fetching notifications:', err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [user]);

  const accept = async (n: Notif) => {
  const conn = conns.find(
    c =>
      (c.userIdA === n.fromUserId && c.userIdB === user!.id) ||
      (c.userIdB === n.fromUserId && c.userIdA === user!.id)
  );

  if (!conn) return;

  // ✅ Step 1: Update the connection to 'friends'
  await updateDoc(doc(db, 'connections', conn.id), { status: 'friends' });

  // ✅ Step 2: Add 'connect_accepted' notification
  await addDoc(collection(db, 'notifications'), {
    toUserId: conn.userIdA,
    fromUserId: user!.id,
    type: 'connect_accepted',
    createdAt: Timestamp.now(),
  });

  // ✅ Step 3: Remove connection from pending list
  setConns(prev => prev.filter(c => c.id !== conn.id));

  // ✅ Step 4: Convert this notification to 'connect_accepted'
  setNotifs(prev =>
    prev.map(item =>
      item.id === n.id
        ? { ...item, type: 'connect_accepted' } // convert in-place
        : item
    )
  );
};


  const renderMessage = (n: Notif) => {
  const name = n.fromUserName || n.fromUserId;

  const isStillPending = conns.some(
    c =>
      (c.userIdA === n.fromUserId && c.userIdB === user?.id) ||
      (c.userIdB === n.fromUserId && c.userIdA === user?.id)
  );

  if (n.type === 'connect_accepted') {
    return <span>👥 <strong>{name}</strong> is now your friend.</span>;
  }

  if (n.type === 'connect_request') {
    return isStillPending ? (
      <div className="flex justify-between items-center">
        <span>👋 <strong>{name}</strong> sent you a connect request.</span>
        <Button size="sm" onClick={() => accept(n)}>Accept</Button>
      </div>
    ) : (
      <span>👥 <strong>{name}</strong> is now your friend.</span>
    );
  }

  if (n.type === 'like') {
    return <span>❤️ <strong>{name}</strong> liked your post.</span>;
  }

  if (n.type === 'comment') {
    return <span>💬 <strong>{name}</strong> commented on your post.</span>;
  }

  return <span>🔔 You have a new notification.</span>;
};




  return (
    <div className="p-6 max-w-xl mx-auto min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white">
      <h1 className="text-2xl font-bold mb-4">Notifications</h1>

      {loading ? (
        <p className="text-gray-500 dark:text-gray-400">Loading...</p>
      ) : notifs.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400">No notifications yet.</p>
      ) : (
        <ul className="space-y-3">
          {notifs.map(n => (
            <li
              key={n.id}
              className="p-4 bg-white dark:bg-gray-800 rounded shadow border border-gray-200 dark:border-gray-700"
            >
              {renderMessage(n)}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Notifications;
