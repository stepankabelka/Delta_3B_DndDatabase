import { useState, useEffect } from 'react';
import { updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useRef } from "react";

import {
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
  serverTimestamp,
} from 'firebase/firestore';
import './CampaignSelect.css';

function GoogleLogin() {
  const buttonRef = useRef(null);

  useEffect(() => {
    if (!window.google || !buttonRef.current) return;

    window.google.accounts.id.initialize({
      client_id: "795566622579-6nfmqf19f807pombkbffjufsbjl251ig.apps.googleusercontent.com",
      callback: (response) => {
        console.log(response.credential);
      }
    });

    window.google.accounts.id.renderButton(buttonRef.current, {
      theme: "outline",
      size: "large"
    });

  }, []);

  return <div ref={buttonRef}></div>;
}
export default function CampaignSelect({ onSelectCampaign }) {
  const [campaigns, setCampaigns] = useState([]);
  const [newName, setNewName] = useState('');
  const [renamingId, setRenamingId] = useState(null);
  const [renameValue, setRenameValue] = useState('');

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

  const handleRename = async (id, newName) =>
  {
    await updateDoc(doc(db,'campaigns', id), { name: newName.trim() });
    setCampaigns(prev => prev.map(c => c.id === id ? { ...c, name: newName.trim() } : c));
  }

  const handleDelete = async (id) => {
    await deleteDoc(doc(db, 'campaigns', id));
    setCampaigns(prev => prev.filter(c => c.id !== id));
  };


  return (
    <div className="page">
        <div className="google-login-container">
            <GoogleLogin />
        </div>
      <h1>My Campaigns</h1>
      

      {campaigns.length === 0 && <p className="empty">No campaigns yet.</p>}

      <ul className="list">
        {campaigns.map(c => (
          <li key={c.id} className="item">
  {renamingId === c.id ? (
    <input
      value={renameValue}
      onChange={e => setRenameValue(e.target.value)}
      onKeyDown={e => {
        if (e.key === 'Enter') { handleRename(c.id, renameValue); setRenamingId(null); }
        if (e.key === 'Escape') setRenamingId(null);
      }}
      autoFocus
    />
  ) : (
        <span>{c.name}</span>
  )}
    <div className="item-buttons">
        <button onClick={() => onSelectCampaign(c)}>Open</button>
        <button onClick={() => { setRenamingId(c.id); setRenameValue(c.name); }}>Rename</button>
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

