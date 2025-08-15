import React, { useEffect, useState } from 'react';
import { db } from '../config/firebase';
import { useAuth } from '../context/AuthContext';
import {
  collection,
  query,
  where,
  getDocs,
  getDoc,
  deleteDoc,
  doc
} from 'firebase/firestore';
import Button from '../components/UI/Button';

interface Conn {
  id: string;
  userIdA: string;
  userIdB: string;
  status: string;
}

interface UserMap {
  [id: string]: string;
}

const ConnectUps: React.FC = () => {
  const { user } = useAuth();
  const [connections, setConnections] = useState<Conn[]>([]);
  const [userMap, setUserMap] = useState<UserMap>({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchConnections = async () => {
      if (!user) return;

      try {
        const q1 = query(
          collection(db, 'connections'),
          where('status', '==', 'friends'),
          where('userIdA', '==', user.id)
        );
        const q2 = query(
          collection(db, 'connections'),
          where('status', '==', 'friends'),
          where('userIdB', '==', user.id)
        );

        const [snap1, snap2] = await Promise.all([getDocs(q1), getDocs(q2)]);
        const allConns = [...snap1.docs, ...snap2.docs].map(d => ({
          id: d.id,
          ...(d.data() as Conn)
        }));

        setConnections(allConns);

        const friendIds = new Set<string>();
        allConns.forEach(conn => {
          friendIds.add(conn.userIdA === user.id ? conn.userIdB : conn.userIdA);
        });

        const userDocs = await Promise.all(
          Array.from(friendIds).map(uid => getDoc(doc(db, 'users', uid)))
        );

        const map: UserMap = {};
        userDocs.forEach((snap) => {
          if (snap.exists()) {
            map[snap.id] = snap.data().name || 'Unknown';
          }
        });

        setUserMap(map);
      } catch (err) {
        console.error('Error loading connections:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchConnections();
  }, [user]);

  const defuseConnection = async (id: string) => {
    if (!window.confirm('Are you sure you want to defuse this connection?')) return;
    await deleteDoc(doc(db, 'connections', id));
    setConnections(prev => prev.filter(c => c.id !== id));
  };

  const filteredConnections = connections.filter(conn => {
    const otherId = conn.userIdA === user?.id ? conn.userIdB : conn.userIdA;
    const name = userMap[otherId] || '';
    return name.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div className="p-6 max-w-xl mx-auto min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white">
      <h1 className="text-2xl font-bold mb-4">Your ConnectUps</h1>

      {/* 🔍 Search Input */}
      <input
        type="text"
        placeholder="Search ConnectUps..."
        className="w-full mb-4 p-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      {loading ? (
        <p className="text-gray-500 dark:text-gray-400">Loading...</p>
      ) : filteredConnections.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400">No matching friends found.</p>
      ) : (
        <ul className="space-y-4">
          {filteredConnections.map(conn => {
            const otherId = conn.userIdA === user?.id ? conn.userIdB : conn.userIdA;
            const name = userMap[otherId] || 'Unknown';
            const initial = name.charAt(0).toUpperCase();

            return (
              <li
                key={conn.id}
                className="p-4 bg-white dark:bg-gray-800 rounded shadow flex items-center justify-between border border-gray-200 dark:border-gray-700"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold flex items-center justify-center text-sm shadow">
                    {initial}
                  </div>
                  <span className="font-medium text-gray-900 dark:text-white">{name}</span>
                </div>
                <Button variant="destructive" onClick={() => defuseConnection(conn.id)}>
                  Defuse
                </Button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default ConnectUps;
