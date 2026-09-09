import { createContext, useContext } from 'react';

interface CampaignContextType {
  campaignId: string | null;
}

export const CampaignContext = createContext<CampaignContextType>({ campaignId: null });

export function useCampaign() {
  return useContext(CampaignContext);
}
