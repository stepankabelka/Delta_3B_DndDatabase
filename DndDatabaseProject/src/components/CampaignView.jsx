import { useState, useEffect, Popup } from 'react';
import { db,} from '../firebase';
import { Description, Dialog, DialogPanel, DialogTitle } from '@headlessui/react';
import {Cloudinary} from "@cloudinary/url-gen";
import { AdvancedImage, responsive, placeholder } from '@cloudinary/react';
import {fill} from "@cloudinary/url-gen/actions/resize";
import CloudinaryUploadWidget from './CloudinaryUploadWidget';
import {
  collection,
  deleteDoc,
  getDocs,
  addDoc,
  serverTimestamp,
   getDoc,
  setDoc,
  onSnapshot,
  doc,
  updateDoc,
} from 'firebase/firestore';
import './CampaignView.css';
import { text } from '@cloudinary/url-gen/qualifiers/source';

const SECTIONS = ['Map', 'NPC', 'World', 'Script'];

export default function CampaignView({ campaign, onBack, user, cld}) {
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
              className={`nav-btn ${activeSection === section ? 'nav-btn--active' : ""}`}
              onClick={() => setActiveSection(section)}
            >
              {section}
            </button>
          ))}
        </nav>
      </aside>

      <main className="content">
        {activeSection === 'Map'    && <MapSection campaign={campaign} user={user} cld={cld}/>}
        {activeSection === 'World'  && <WorldSection campaign={campaign} user={user}/>}
        {activeSection === 'NPC'    && <NpcSection campaign={campaign} user={user} />}
        {activeSection === 'Script' && <ScriptSection campaign={campaign} user={user}/>}
      </main>
    </div>
  );
}

function MapSection({ campaign, user, cld}) {

    const cloudName = 'dutkdvsbo';
    const uploadPreset = 'user_uploads';
    const [publicId, setPublicId] = useState('');

    const uwConfig = {
    cloudName,
    uploadPreset,
    // Uncomment and modify as needed:
    //cropping: true,
     sources: ['local', 'url'],
    // multiple: false,
    // folder: 'user_images',
    // tags: ['users', 'profile'],
    // context: { alt: 'user_uploaded' },
    // clientAllowedFormats: ['images'],
     maxImageFileSize: 2000000,
     maxImageWidth: 2000,
    // theme: 'purple',
  };
    // Instantiate a CloudinaryImage object for the image with the public ID, 'docs/models'.
  const myImage = cld.image('docs/models'); 
  myImage.resize(fill().width(600).height(600));

  useEffect(() => {
    getDoc(doc(db, 'users', user.uid, 'campaigns', campaign.id, 'maps', 'map'))
      .then(snapshot => {
        if (snapshot.exists()) {
          setPublicId(snapshot.data().publicId ?? '');
        }
      });
  }, [campaign.id, user.uid]);

  const handleSetPublicId = async (id) => {
    setPublicId(id);
    await setDoc(
      doc(db, 'users', user.uid, 'campaigns', campaign.id, 'maps', 'map'),
      { publicId: id, updatedAt: serverTimestamp() }
    );
  };

  return (
    <div>
        <h1>Map</h1>
        <CloudinaryUploadWidget uwConfig={uwConfig} setPublicId={handleSetPublicId} />
      {publicId && (
        <div
          className="image-preview"
          style={{ width: '800px', margin: '20px auto' }}
        >
          <AdvancedImage
            style={{ maxWidth: '80%' }}
            cldImg={cld.image(publicId)}
            plugins={[responsive(), placeholder()]}
          />
        </div>
      )}
      </div>
  );
}

function NpcSection({ campaign, user }) {
  const EMPTY_NPC = { name: "", look: "", motivation: "", backstory: "", traits: "" }
  const [npcs, setNpcs] = useState([])
  const [newName, setNewName] = useState("")
  const [newMotiv, setMotiv] = useState("")
  const [newChar, setChar] = useState("")
  const [newLook, setLook] = useState("")
  const [newBackstory, setBackstory] = useState("")
  const [newTraits, setTraits] = useState("")
  const [showForm, setShowForm] = useState(false)
  const [showPopup, setPopup] = useState(false)
  const [activeNpc, setActiveNpc] = useState("")
  const [activeId, setActiveId] = useState("")
  const [formData, setFormData] = useState(EMPTY_NPC)

  useEffect(() => {
  const unsub = onSnapshot(
    collection(db, 'users', user.uid, 'campaigns', campaign.id, 'npcs'),
    (snapshot) => {
      setNpcs(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));

    //  setFormData
    //  ({name: activeNpc.name ?? "", 
    //        look: activeNpc.look ?? "",
    //        motivation: activeNpc.motivation ?? "",
    //        backstory: activeNpc.backstory ?? "",
    //        traits: activeNpc.traits ?? "",
    //    });
    }
  );
  return unsub; 
}, [campaign.id]);

    const handleSelect = async(npc) =>{
        setActiveId(npc.id);
        setFormData({name: npc.name ?? "", 
            look: npc.look ?? "",
            motivation: npc.motivation ?? "",
            backstory: npc.backstory ?? "",
            traits: npc.traits ?? "",
        });
    };

    const handleDeselect = () =>{
        setActiveId(null);
        setActiveNpc(EMPTY_NPC);
        setFormData({name: "", 
            look:   "",
            motivation:  "",
            backstory:  "",
            traits:  "",
        })
    };

  const handleAdd = async (fields) => {
    if (!fields.name.trim()) return;
    const ref = await addDoc(
      collection(db, 'users', user.uid, 'campaigns', campaign.id, 'npcs'),
      { ...fields, createdAt: serverTimestamp() }
    );
    const newNpc = { id: ref.id, ...fields };

    setActiveId(ref.id)
 
  };

  const handleDelete = async(id) =>{
    await deleteDoc(doc(db,'users', user.uid, 'campaigns', campaign.id, 'npcs', id));
        setNpcs(prev => [...prev]);
  };
  const handleUpdate = async(id, fields) =>{
    await updateDoc(doc(db,"users", user.uid, "campaigns", campaign.id, "npcs", id), fields);
        setNpcs(prev => [...prev]);
  };
    
  return (
    <div className="npc-layout">
      {/* Left: list */}
      <div className="npc-list-panel">
        <h1>NPCs</h1>
 
        {npcs.length === 0 && <p className="placeholder-text">No NPCs yet.</p>}
 
        <ul className="list">
          {npcs.map(npc => (
            <li
              key={npc.id}
              className={`item npc-list-item ${activeId === npc.id ? 'npc-list-item--active' : ""}`}
              onClick={() => handleSelect(npc)}
            >
              <span>{npc.name}</span>
              <button
                className="delete-btn"
                onClick={e => { e.stopPropagation(); handleDelete(npc.id); }}
                title="Delete"
              >✕</button>
            </li>
          ))}
        </ul>
      </div>
      <div className="npc-detail-panel">
        <NpcForm
          key={activeId ?? "new"}
          activeId={activeId}
          initialData={formData}
          onCreate={handleAdd}
          onUpdate={handleUpdate}
          handleDeselect={handleDeselect}
        />
      </div>
    </div>
  );
}
function NpcForm({activeId, initialData, onCreate,onUpdate,handleDeselect}){
    const[name, setName] = useState(initialData.name ??"")
    const[look, setLook] = useState(initialData.look ??"")
    const[motivation, setMotiv] = useState(initialData.motivation ??"")
    const[backstory, setBackstory] = useState(initialData.backstory ??"")
    const[traits, setTraits] = useState(initialData.traits ??"")
    const[saved, setSaved] = useState(!!activeId)

    const isNew = !activeId
    const markUnsaved = () => {setSaved(false)}

    const handleSubmit = () => {
    const fields = { name, look, motivation, backstory, traits };
    if (isNew) {
      onCreate(fields);
      setSaved(true);
    } else {
      onUpdate(fields);
      setSaved(true);
    }
  };
  return (
    <div className="npc-detail">
      <div className="npc-detail-header">
        <h2 className="npc-detail-title">
          {isNew ? 'New NPC' : (name || 'Unnamed NPC')}
        </h2>
        <div className="npc-detail-actions">
          {!saved && !isNew && <span className="unsaved">Unsaved changes</span>}
          <button onClick={handleSubmit}>
            {isNew ? "Add" : 'Save changes'}
          </button>
           <button className="new-npc-btn" onClick={handleDeselect} title="New NPC">+ New</button>
        </div>
      </div>
 
      <div className="npc-fields">
        <label>
          Name
          <input
            value={name}
            onChange={e => { setName(e.target.value); markUnsaved(); }}
            placeholder="NPC name…"
          />
        </label>
 
        <label className="npc-field-grow">
          Look
          <input
            value={look}
            onChange={e => { setLook(e.target.value); markUnsaved(); }}
            placeholder="Physical appearance, clothing…"
          />
        </label>
 
        <label className="npc-field-grow">
          Motivation
          <input
            value={motivation}
            onChange={e => { setMotiv(e.target.value); markUnsaved(); }}
            placeholder="What drives them…"
          />
        </label>
 
        <label className="npc-field-grow">
          Backstory
          <textarea
            value={backstory}
            onChange={e => { setBackstory(e.target.value); markUnsaved(); }}
            placeholder="History and background…"
            rows={4}
          />
        </label>
 
        <label className="npc-field-grow">
          Traits
          <textarea
            value={traits}
            onChange={e => { setTraits(e.target.value); markUnsaved(); }}
            placeholder="Personality, quirks, mannerisms…"
            rows={4}
          />
        </label>
      </div>
    </div>
  );
}

function WorldSection({ campaign, user }) {
  const [content, setContent] = useState("");

  useEffect(() => {
    if (!user || !campaign?.id) return;

    // Use a clean document structure matching your other working sections
    getDoc(doc(db, 'users', user.uid, 'campaigns', campaign.id, 'worldData', 'main'))
      .then(snapshot => {
        if (snapshot.exists()) {
          setContent(snapshot.data().text ?? '');
        } else {
          console.log('No world document found. Ready to create one.');
        }
      })
      .catch(err => console.error('Load world failed:', err));
  }, [campaign.id, user.uid]);

  const handleSave = async () => {
    if (!user || !campaign?.id) return;
    
    try {
      // setDoc creates the document if it doesn't exist, or completely overwrites it if it does
      await setDoc(
        doc(db, 'users', user.uid, 'campaigns', campaign.id, 'worldData', 'main'),
        { 
          text: content, 
          updatedAt: serverTimestamp() 
        }
      );
      console.log('World data saved successfully!');
      alert('Saved successfully!'); // Helpful UI feedback to confirm it worked
    } catch (err) {
      console.error('Save world failed directly from Firestore:', err);
    }
  };

  return (
    <div>
      <h1>World Info</h1>
      <textarea
        className="worldScript"
        style={{ width: '100%', minHeight: '200px', display: 'block', marginBottom: '10px' }} // Quick CSS safety fallback
        value={content}
        onChange={e => setContent(e.target.value)} // Fixed convention (e)
        placeholder="Type your world lore here..."
      />
      <button onClick={handleSave}>Save World Info</button>
    </div>
  );
}

function ScriptSection({ campaign, user }) {
  const [paragraphs, setParagraphs] = useState([]);
  const [collapsed, setCollapsed] = useState({});
 
  useEffect(() => {
    getDoc(doc(db, 'users', user.uid, 'campaigns', campaign.id, 'scripts', 'main'))
      .then(snapshot => {
        if (snapshot.exists()) {
          const data = snapshot.data();
          // support old plain-text format
          if (Array.isArray(data.paragraphs)) {
            setParagraphs(data.paragraphs);
          } else if (data.text) {
            setParagraphs([{ id: '1', title: 'Notes', content: data.text }]);
          }
        }
      });
  }, [campaign.id, user.uid]);
 
  const save = async (updated) => {
    if(updated)
    {
        await setDoc(
      doc(db, 'users', user.uid, 'campaigns', campaign.id, 'scripts', "main"),
      { paragraphs: updated, updatedAt: serverTimestamp() }
    );
    }
    
  };
 
  const handleAddParagraph = () => {
    const newP = { id: crypto.randomUUID(), title: 'New section', content: '' };
    const updated = [...paragraphs, newP];
    setParagraphs(updated);
    save(updated);
    // expand the new one
    setCollapsed(prev => ({ ...prev, [newP.id]: false }));
  };
 
  const handleUpdateTitle = (id, title) => {
    const updated = paragraphs.map(p => p.id === id ? { ...p, title } : p);
    setParagraphs(updated);
  };
 
  const handleUpdateContent = (id, content) => {
    const updated = paragraphs.map(p => p.id === id ? { ...p, content } : p);
    setParagraphs(updated);
  };
 
  const handleSaveParagraph = (id) => {
    save(paragraphs);
  };
 
  const handleDelete = (id) => {
    const updated = paragraphs.filter(p => p.id !== id);
    setParagraphs(updated);
    save(updated);
  };
 
  const toggleCollapse = (id) => {
    setCollapsed(prev => ({ ...prev, [id]: !prev[id] }));
  };
 
  return (
    <div className="script-section">
      <div className="script-header">
        <h1>Script & Notes</h1>
        <button onClick={handleAddParagraph}>+ Add section</button>
      </div>
 
      {paragraphs.length === 0 && (
        <p className="placeholder-text">No sections yet. Click "Add section" to start.</p>
      )}
 
      <div className="script-paragraphs">
        {paragraphs.map(p => (
          <ScriptParagraph
            key={p.id}
            paragraph={p}
            isCollapsed={!!collapsed[p.id]}
            onToggle={() => toggleCollapse(p.id)}
            onTitleChange={title => handleUpdateTitle(p.id, title)}
            onContentChange={content => handleUpdateContent(p.id, content)}
            onSave={() => handleSaveParagraph(p.id)}
            onDelete={() => handleDelete(p.id)}
          />
        ))}
      </div>
    </div>
  );
}
 
function ScriptParagraph({ paragraph, isCollapsed, onToggle, onTitleChange, onContentChange, onSave, onDelete }) {
  const [saved, setSaved] = useState(true);
  const [editingTitle, setEditingTitle] = useState(false);
 
  const handleContentChange = (e) => {
    onContentChange(e.target.value);
    setSaved(false);
  };
 
  const handleTitleChange = (e) => {
    onTitleChange(e.target.value);
    setSaved(false);
  };
 
  const handleSave = () => {
    onSave();
    setSaved(true);
  };
 
  return (
    <div className="script-para">
      <div className="script-para-header">
        <button className="collapse-btn" onClick={onToggle}>
          {isCollapsed ? '▶' : '▼'}
        </button>
 
        {editingTitle ? (
          <input
            className="script-title-input"
            value={paragraph.title}
            onChange={handleTitleChange}
            onBlur={() => setEditingTitle(false)}
            onKeyDown={e => { if (e.key === 'Enter') setEditingTitle(false); }}
            autoFocus
          />
        ) : (
          <h2 className="script-para-title" onDoubleClick={() => setEditingTitle(true)}>
            {paragraph.title || 'Untitled'}
          </h2>
        )}
 
        <div className="script-para-actions">
          {!saved && <span className="unsaved">Unsaved</span>}
          {!saved && <button onClick={handleSave}>Save</button>}
          <button className="delete-btn" onClick={onDelete} title="Delete section">✕</button>
        </div>
      </div>
 
      {!isCollapsed && (
        <div className="script-para-body">
          <textarea
            className="script-para-textarea"
            value={paragraph.content}
            onChange={handleContentChange}
            placeholder="Write here…"
          />
        </div>
      )}
    </div>
  );
}