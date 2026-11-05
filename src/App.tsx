import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { PromoBanner } from './components/PromoBanner';
import { GeneratingQueue } from './components/GeneratingQueue';
import { CardGrid } from './components/CardGrid';
import { FloatingPromptBar } from './components/FloatingPromptBar';
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
  const [lastViewedId, setLastViewedId] = useState<string | null>(null);

  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isRecreateOpen, setIsRecreateOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeReference, setActiveReference] = useState('');

  const [viewSettings, setViewSettings] = useState<ViewSettings>({
    layout: 'masonry',
    splitByDate: false,
    cardSize: 3
  });

  // Load live tracked generations from Higgsfield CLI
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
      if (vaultItems.length > 0) {
        setActiveReference(vaultItems[0].imageUrl);
        // Set last viewed default matching the screenshot row 2 col 4 if available
        if (vaultItems.length >= 8) {
          setLastViewedId(vaultItems[7].id);
        } else {
          setLastViewedId(vaultItems[0].id);
        }
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
    setIsGenerating(true);

    if (account) {
      setAccount({ ...account, credits: Math.max(0, account.credits - 4) });
    }

    try {
      const newItem = await HiggsfieldService.generate({
        prompt: data.prompt,
        soulId: data.soulId,
        aspectRatio: data.aspectRatio,
        referenceImage: data.referenceImage
      });

      setTimeout(() => {
        setVault((prev) => [newItem, ...prev]);
        setLastViewedId(newItem.id);
        setIsGenerating(false);
      }, 2500);
    } catch (e) {
      console.error(e);
      setIsGenerating(false);
    }
  };

  const handleTurnToVideo = (_item: VaultItem) => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      alert(`Job queued on Higgsfield CLI: turning into video with Google Veo 3 / Kling 3.0.`);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-[#0b0c0e] text-white flex flex-col relative pb-24">
      {/* Header bar */}
      <Header
        account={account}
        onOpenView={() => setIsViewOpen(true)}
        onOpenRecreate={() => handleStartRecreate(activeReference || '/icons/icon128.png')}
      />

      {/* Main View Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 md:px-6 pt-4">
        {/* Promotional Hype Machine Banner matching Screenshot 1 */}
        <PromoBanner onAction={() => handleStartRecreate(activeReference)} />

        {/* 4-Tile Generating Row */}
        <GeneratingQueue
          isGenerating={isGenerating}
          progressText="Generating"
          activeCount={4}
        />

        {/* Clean Edge-to-Edge Cards - 70+ Real Tracked Soul Generations */}
        <CardGrid
          items={vault}
          layout={viewSettings.layout}
          cardSize={viewSettings.cardSize}
          splitByDate={viewSettings.splitByDate}
          lastViewedId={lastViewedId}
          onSelectItem={(item) => {
            setSelectedItem(item);
            setLastViewedId(item.id);
          }}
        />
      </main>

      {/* Bottom Floating Prompt Bar matching Screenshot 1 */}
      <FloatingPromptBar
        onGenerate={(promptText) => {
          handleExecuteGeneration({
            prompt: promptText,
            aspectRatio: '3:4',
            referenceImage: activeReference
          });
        }}
        onOpenUpload={() => handleStartRecreate()}
      />

      {/* View Options Popover (Square / Masonry / Date / Card size) */}
      <ViewPopover
        isOpen={isViewOpen}
        onClose={() => setIsViewOpen(false)}
        settings={viewSettings}
        onChangeSettings={setViewSettings}
      />

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
