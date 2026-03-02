import { useState } from 'react';
import CampaignSelect from './components/CampaignSelect';

export default function App() {
  const [activeCampaign, setActiveCampaign] = useState(null);

  if (activeCampaign) {
    return (
      <div style={{ maxWidth: 480, margin: '60px auto', padding: '0 1rem', fontFamily: 'sans-serif' }}>
        <h2>{activeCampaign.name}</h2>
        <p style={{ color: '#888' }}>Campaign content goes here.</p>
        <button onClick={() => setActiveCampaign(null)}>← Back</button>
      </div>
    );
  }

  return <CampaignSelect onSelectCampaign={setActiveCampaign} />;
}