import { useState } from 'react';
import CampaignSelect from './components/CampaignSelect';
import CampaignView from './components/CampaignView';
export default function App() {
  const [activeCampaign, setActiveCampaign] = useState(null);
console.log(import.meta.env.VITE_HELLO)

  if (activeCampaign) {
    return (
      <CampaignView
        campaign={activeCampaign}
        onBack={() => setActiveCampaign(null)}
      />
    );
  }

  return <CampaignSelect onSelectCampaign={setActiveCampaign} />;
}