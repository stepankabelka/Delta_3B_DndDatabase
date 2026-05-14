import { useState, useEffect } from 'react';
import { db } from '../firebase';
import {
  collection,
  getDocs,
  addDoc,
  serverTimestamp,
   getDoc,
  setDoc,
  doc,
} from 'firebase/firestore';
import './CampaignView.css';

const SECTIONS = ['Map', 'NPC', 'World', 'Script'];

export default function CampaignView({ campaign, onBack, user}) {
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
        {activeSection === 'Map'    && <MapSection campaign={campaign} user={user}/>}
        {activeSection === 'NPC'    && <NpcSection campaign={campaign} user={user} />}
        {activeSection === 'World'  && <WorldSection campaign={campaign} user={user}/>}
        {activeSection === 'Script' && <ScriptSection campaign={campaign} user={user}/>}
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

function NpcSection({ campaign, user }) {
  const [npcs, setNpcs] = useState([]);
  const [newName, setNewName] = useState('');
  const [newMotiv, setMotiv] = useState("")
  const [newChar, setChar] = useState("")
  const [newLook, setLook] = useState("")
  const [newBackstory, setBackstory] = useState("")
  const [newTraits, setTraits] = useState("")
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    getDocs(collection(db, 'users', user.uid, 'campaigns', campaign.id, 'npcs'))
      .then(snapshot => setNpcs(snapshot.docs.map(d => ({ id: d.id, ...d.data() }))));
  }, [campaign.id]);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newName.trim()) return;
    const ref = await addDoc(collection(db,'users', user.uid, 'campaigns', campaign.id, 'npcs'), {
      name: newName.trim(),
      look: newLook(),
      motivation: newMotiv(),
      backstory: newBackstory(),
      traits: newTraits(),
      createdAt: serverTimestamp(),
    });
    setNpcs(prev => [...prev, { id: ref.id, name: newName.trim(),}]);
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
            placeholder="Name"
            autoFocus
          /><input
            value={newLook}
            onChange={e => setLook(e.target.value)}
            placeholder="Look"
            autoFocus
          /><input
            value={newChar}
            onChange={e => setChar(e.target.value)}
            placeholder="Character"
            autoFocus
          /><input
            value={newMotiv}
            onChange={e => setMotiv(e.target.value)}
            placeholder="Motivation"
            autoFocus
          /><input
            value={newBackstory}
            onChange={e => setBackstory(e.target.value)}
            placeholder="Backstory"
            autoFocus
          /><input
            value={newTraits}
            onChange={e => setTraits(e.target.value)}
            placeholder="Traits"
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

function ScriptSection({ campaign, user}) {
  const [text, setText] = useState('');
  const [saved, setSaved] = useState(true);
  const [script, setScripts] = useState([]);
  const [scriptName, setScriptName] = useState("script");



 
  useEffect(() => {
    getDoc(doc(db,'users', user.uid, 'campaigns', campaign.id, 'data'))
      .then(snapshot => {
        if (snapshot.exists()) {
          setText(snapshot.data().text);
        }
      });
  }, [campaign.id]);

    useEffect(() => {
    getDocs(collection(db, 'users', user.uid, 'campaigns', campaign.id, 'npcs'))
      .then(snapshot => setNpcs(snapshot.docs.map(d => ({ id: d.id, ...d.data() }))));
    }, [campaign.id]);

 
  const handleSave = async () => {
    await setDoc(doc(db,'users', user.uid, 'campaigns', campaign.id, 'data', 'script'), {
      text,
      updatedAt: serverTimestamp(),
    });
    setSaved(true);
  };

//   const handleAdd = async (e) => {
//   e.preventDefault();
//   if (!newName.trim()) return;
//   const ref = await addDoc(collection(db,'users', user.uid, 'campaigns', campaign.id, 'npcs'), {
//     name: newName.trim(),
//     createdAt: serverTimestamp(),
//   });
//   setNpcs(prev => [...prev, { id: ref.id, name: newName.trim() }]);
//   setNewName('');
//   setShowForm(false);
// };

  const handleAdd = async() =>{

  }
 
  return (
    <div>
      <h1>Script & Notes</h1>
      <textarea
        className="script-textarea"
        value={text}
        onChange={e => { setText(e.target.value); setSaved(false); }}
        placeholder="Write your script and notes here…"
      />
      <div className="script-footer">
        {!saved && <span className="unsaved">Unsaved changes</span>}
        <button onClick={handleSave}>Save</button>
      </div>
    </div>
  );
}