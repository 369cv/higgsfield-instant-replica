import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { CardGrid } from './components/CardGrid';
import { InspectorModal } from './components/InspectorModal';
import { InPageFloatingWidget } from './components/InPageFloatingWidget';
import { HiggsfieldService } from './services/higgsfieldBridge';
import { VaultItem, SoulCharacter } from './types';

export const App: React.FC = () => {
  const [vault, setVault] = useState<VaultItem[]>([]);
  const [souls, setSouls] = useState<SoulCharacter[]>([]);
  const [selectedItem, setSelectedItem] = useState<VaultItem | null>(null);
  const [lastViewedId, setLastViewedId] = useState<string | null>(null);
  const [isRecreateOpen, setIsRecreateOpen] = useState(false);
  const [activeReference, setActiveReference] = useState('');

  // Load live tracked generations from Higgsfield CLI
  useEffect(() => {
    async function init() {
      const [vaultItems, soulList] = await Promise.all([
        HiggsfieldService.getVault(),
        HiggsfieldService.getSouls()
      ]);
      setVault(vaultItems);
      setSouls(soulList);
      if (vaultItems.length > 0) {
        setActiveReference(vaultItems[0].imageUrl);
      }
    }
    init();
  }, []);

  const handleStartRecreate = (refImage?: string) => {
    if (refImage) {
      setActiveReference(refImage);
    }
    setIsRecreateOpen(true);
  };

  const handleExecuteGeneration = async (data: {
    prompt: string;
    soulId?: string;
    aspectRatio: string;
    referenceImage: string;
  }) => {
    try {
      const newItem = await HiggsfieldService.generate({
        prompt: data.prompt,
        soulId: data.soulId,
        aspectRatio: data.aspectRatio,
        referenceImage: data.referenceImage
      });

      setVault((prev) => [newItem, ...prev]);
      setLastViewedId(newItem.id);
      setIsRecreateOpen(false);
    } catch (e) {
      console.error(e);
    }
  };

  const handleTurnToVideo = (_item: VaultItem) => {
    alert(`Job queued on Higgsfield CLI: turning into video with Google Veo 3 / Kling 3.0.`);
  };

  return (
    <div className="min-h-screen bg-[#070709] text-white flex flex-col relative selection:bg-[#d1fe17] selection:text-black">
      {/* Top Header with Natural Black Fade & 'Create your Influencer' button */}
      <Header onCreateInfluencer={() => handleStartRecreate(activeReference)} />

      {/* Main Grid View - Edge to edge, tightly packed masonry */}
      <main className="flex-1 w-full max-w-[1920px] mx-auto px-2 sm:px-3 md:px-4 pt-1 pb-10">
        <CardGrid
          items={vault}
          layout="masonry"
          cardSize={3}
          splitByDate={false}
          lastViewedId={lastViewedId}
          onSelectItem={(item) => {
            setSelectedItem(item);
            setLastViewedId(item.id);
          }}
        />
      </main>

      {/* Full Prompt Vault Inspector with Original Reference click support */}
      <InspectorModal
        item={selectedItem}
        onClose={() => setSelectedItem(null)}
        onRecreate={(item) => {
          setSelectedItem(null);
          handleStartRecreate(item.imageUrl);
        }}
        onTurnToVideo={handleTurnToVideo}
      />

      {/* Recreate Modal when user clicks 'Create your Influencer' */}
      <InPageFloatingWidget
        isOpen={isRecreateOpen}
        onClose={() => setIsRecreateOpen(false)}
        referenceImage={activeReference}
        souls={souls}
        onGenerate={handleExecuteGeneration}
      />
    </div>
  );
};
