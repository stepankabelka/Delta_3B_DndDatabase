import { useState, useEffect } from 'react';
import { db } from '../firebase';
import {
  collection,
  getDocs,
  addDoc,
  serverTimestamp,
} from 'firebase/firestore';
import './CampaignView.css';

const SECTIONS = ['Map', 'NPC', 'World', 'Script'];

export default function CampaignView({ campaign, onBack }) {
  const [activeSection, setActiveSection] = useState('Map');

  return (
    <div className="view">
      <aside className="sidebar">
        <button className="back-btn" onClick={onBack}>← Back</button>
        <h2 className="campaign-name">{campaign.name}</h2>
        <nav className="nav">
          {SECTIONS.map(section => (
            <button
              key={section}
              className={`nav-btn ${activeSection === section ? 'nav-btn--active' : ''}`}
              onClick={() => setActiveSection(section)}
            >
              {section}
            </button>
          ))}
        </nav>
      </aside>

      <main className="content">
        {activeSection === 'Map'    && <MapSection />}
        {activeSection === 'NPC'    && <NpcSection campaign={campaign} />}
        {activeSection === 'World'  && <WorldSection />}
        {activeSection === 'Script' && <ScriptSection />}
      </main>
    </div>
  );
}

function MapSection() {
  return (
    <div>
      <h1>Map</h1>
      <div className="map-placeholder">Map with clickable locations</div>
    </div>
  );
}

function NpcSection({ campaign }) {
  const [npcs, setNpcs] = useState([]);
  const [newName, setNewName] = useState('');
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    getDocs(collection(db, 'campaigns', campaign.id, 'npcs'))
      .then(snapshot => setNpcs(snapshot.docs.map(d => ({ id: d.id, ...d.data() }))));
  }, [campaign.id]);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newName.trim()) return;
    const ref = await addDoc(collection(db, 'campaigns', campaign.id, 'npcs'), {
      name: newName.trim(),
      createdAt: serverTimestamp(),
    });
    setNpcs(prev => [...prev, { id: ref.id, name: newName.trim() }]);
    setNewName('');
    setShowForm(false);
  };

  return (
    <div>
      <h1>NPC List</h1>

      {npcs.length === 0 && <p className="placeholder-text">No NPCs added yet.</p>}

      <ul className="list">
        {npcs.map(npc => (
          <li key={npc.id} className="item">{npc.name}</li>
        ))}
      </ul>

      {showForm ? (
        <form onSubmit={handleAdd} className="form">
          <input
            value={newName}
            onChange={e => setNewName(e.target.value)}
            placeholder="NPC name…"
            autoFocus
          />
          <button type="submit">Confirm</button>
          <button type="button" onClick={() => { setShowForm(false); setNewName(''); }}>Cancel</button>
        </form>
      ) : (
        <button onClick={() => setShowForm(true)}>+ Add NPC</button>
      )}
    </div>
  );
}

function WorldSection() {
  return (
    <div>
      <h1>World Info</h1>
      <button>Edit</button>
      <p className="placeholder-text">No world info yet.</p>
    </div>
  );
}

function ScriptSection() {
  return (
    <div>
      <h1>Script & Notes</h1>
      <button>Edit</button>
      <p className="placeholder-text">No notes yet.</p>
    </div>
  );
}