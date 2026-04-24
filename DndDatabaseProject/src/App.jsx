import { useEffect, useState } from 'react';
import CampaignSelect from './components/CampaignSelect';
import CampaignView from './components/CampaignView';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase';
export default function App() {
  const [activeCampaign, setActiveCampaign] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });
    return unsub;
  }, []);


  if (activeCampaign) {
    return (
      <CampaignView
        campaign={activeCampaign}
        onBack={() => setActiveCampaign(null)}
      />
    );
  }
 return <CampaignSelect user={user} onSelectCampaign={setActiveCampaign} />;
}