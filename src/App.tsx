import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { GeneratingQueue } from './components/GeneratingQueue';
import { CardGrid } from './components/CardGrid';
import { ViewPopover } from './components/ViewPopover';
import { InspectorModal } from './components/InspectorModal';
import { InPageFloatingWidget } from './components/InPageFloatingWidget';
import { HiggsfieldService } from './services/higgsfieldBridge';
import { VaultItem, AccountInfo, SoulCharacter, ViewSettings } from './types';

export const App: React.FC = () => {
  const [account, setAccount] = useState<AccountInfo | null>(null);
  const [vault, setVault] = useState<VaultItem[]>([]);
  const [souls, setSouls] = useState<SoulCharacter[]>([]);
  const [selectedItem, setSelectedItem] = useState<VaultItem | null>(null);

  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isRecreateOpen, setIsRecreateOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeReference, setActiveReference] = useState('/gallery/ferrari_selfie.jpg');

  const [viewSettings, setViewSettings] = useState<ViewSettings>({
    layout: 'masonry',
    splitByDate: false,
    cardSize: 3
  });

  // Load initial state
  useEffect(() => {
    async function init() {
      const [acc, vaultItems, soulList] = await Promise.all([
        HiggsfieldService.getAccount(),
        HiggsfieldService.getVault(),
        HiggsfieldService.getSouls()
      ]);
      setAccount(acc);
      setVault(vaultItems);
      setSouls(soulList);
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
    // 1. Trigger the 4-tile generating row
    setIsGenerating(true);

    // Deduct simulated 4 credits from workspace
    if (account) {
      setAccount({ ...account, credits: Math.max(0, account.credits - 4) });
    }

    try {
      // Simulate/call CLI generate
      const newItem = await HiggsfieldService.generate({
        prompt: data.prompt,
        soulId: data.soulId,
        aspectRatio: data.aspectRatio,
        referenceImage: data.referenceImage
      });

      // Show generating status for 2.5 seconds to match the UI screenshot
      setTimeout(() => {
        setVault((prev) => [newItem, ...prev]);
        setIsGenerating(false);
      }, 2500);
    } catch (e) {
      console.error(e);
      setIsGenerating(false);
    }
  };

  const handleTurnToVideo = (item: VaultItem) => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      alert(`Job queued on Higgsfield CLI: turning "${item.title}" into video with Google Veo 3 / Kling 3.0.`);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-[#0b0c0e] text-white flex flex-col">
      {/* Header bar */}
      <Header
        account={account}
        onOpenView={() => setIsViewOpen(true)}
        onOpenRecreate={() => handleStartRecreate('/gallery/ferrari_selfie.jpg')}
      />

      {/* Main View Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6">
        {/* 4-Tile Generating Row Matching User Screenshot */}
        <GeneratingQueue
          isGenerating={isGenerating}
          progressText="Generating"
          activeCount={4}
        />

        {/* Clean Edge-to-Edge Cards - ZERO TEXT OVERLAY */}
        <CardGrid
          items={vault}
          layout={viewSettings.layout}
          cardSize={viewSettings.cardSize}
          splitByDate={viewSettings.splitByDate}
          onSelectItem={(item) => setSelectedItem(item)}
        />
      </main>

      {/* View Options Popover (Square / Masonry / Date / Card size) */}
      <ViewPopover
        isOpen={isViewOpen}
        onClose={() => setIsViewOpen(false)}
        settings={viewSettings}
        onChangeSettings={setViewSettings}
      />

      {/* Full Prompt Vault Inspector ('savage_mode' Ferrari view) */}
      <InspectorModal
        item={selectedItem}
        onClose={() => setSelectedItem(null)}
        onRecreate={(item) => {
          setSelectedItem(null);
          handleStartRecreate(item.imageUrl);
        }}
        onTurnToVideo={handleTurnToVideo}
      />

      {/* In-Page Floating Recreate Widget */}
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
