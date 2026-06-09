import { useEffect, useState } from 'react';
import CampaignSelect from './components/CampaignSelect';
import CampaignView from './components/CampaignView';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase';
import {Cloudinary} from "@cloudinary/url-gen";
import {AdvancedImage} from '@cloudinary/react';
import {fill} from "@cloudinary/url-gen/actions/resize";
export default function App() {
  const [activeCampaign, setActiveCampaign] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
const cld = new Cloudinary({
    cloud: {
      cloudName: 'dutkdvsbo'
    }
  });
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
        user={user}
        cld = {cld}
      />
    );
  }
 return <CampaignSelect user={user} onSelectCampaign={setActiveCampaign} />;
}