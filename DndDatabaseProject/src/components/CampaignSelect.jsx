import { useState, useEffect } from 'react';
import { updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useRef } from "react";
import { signInWithPopup, signOut } from "firebase/auth";

import { auth, googleProvider } from "../firebase";
import './CampaignSelect.css';
import {
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
  serverTimestamp,
} from 'firebase/firestore';

function GoogleLogin() {
  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      
    } catch (err) {
      console.error("Login failed:", err);
    }
  };
    
  
  return (

    <button onClick={handleLogin}>Sign in with Google</button>
  );
}
 function GoogleLogout(){
    const handleLogout = async () => {
        try{
        await signOut(auth);
        }
        catch(err){
            console.error("Logout failed: ", err)
        }
    };
    return(
    <button onClick={handleLogout}>Sign out with Google</button>
    );
 }
export default function CampaignSelect({ user, onSelectCampaign }) {
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
 const handleProfile = async() => {
    try {
            <img src={user.photoURL} alt="profile" />,
            <span>{user.displayName}</span>
        } catch (err) {
            console("Nepřihlášen")
        }
 }

  return (
    <div className="page">
        {user && (
        <div className="topbar">
         <span>{user.displayName}</span>
         </div>
        )}
        <div></div>
        <div className="google-login-container">
            <GoogleLogin/>
        </div>
        <div className="google-login-container">
            <GoogleLogout/>
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

