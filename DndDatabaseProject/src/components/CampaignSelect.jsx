import { useState, useEffect } from 'react';
import { db } from '../firebase';
import {
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
  serverTimestamp,
} from 'firebase/firestore';
import './CampaignSelect.css';

export default function CampaignSelect({ onSelectCampaign }) {
  const [campaigns, setCampaigns] = useState([]);
  const [newName, setNewName] = useState('');

  useEffect(() => {
    getDocs(collection(db, 'campaigns'))
      .then(snapshot => setCampaigns(snapshot.docs.map(d => ({ id: d.id, ...d.data() }))));
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newName.trim()) return;
    const ref = await addDoc(collection(db, 'campaigns'), {
      name: newName.trim(),
      createdAt: serverTimestamp(),
    });
    setCampaigns(prev => [...prev, { id: ref.id, name: newName.trim() }]);
    setNewName('');
  };

  const handleDelete = async (id) => {
    await deleteDoc(doc(db, 'campaigns', id));
    setCampaigns(prev => prev.filter(c => c.id !== id));
  };

  return (
    <div className="page">
      <h1>My Campaigns</h1>

      {campaigns.length === 0 && <p className="empty">No campaigns yet.</p>}

      <ul className="list">
        {campaigns.map(c => (
          <li key={c.id} className="item">
            <span>{c.name}</span>
            <div className="item-buttons">
              <button onClick={() => onSelectCampaign(c)}>Open</button>
              <button onClick={() => handleDelete(c.id)}>Delete</button>
            </div>
          </li>
        ))}
      </ul>

      <form onSubmit={handleCreate} className="form">
        <input
          value={newName}
          onChange={e => setNewName(e.target.value)}
          placeholder="New campaign name…"
        />
        <button type="submit">Create</button>
      </form>
    </div>
  );
}