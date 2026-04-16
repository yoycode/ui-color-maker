'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Sun, Moon, Layout, Type, Component } from 'lucide-react';
import type { Palette } from '@/features/palette/types';
import MockupPreview from './MockupPreview';
import TypographyPreview from './TypographyPreview';
import ComponentsPreview from './ComponentsPreview';

type PreviewPanelProps = {
  palette: Palette;
};

type PreviewTab = 'mockup' | 'typography' | 'components';

const PreviewPanel = ({ palette }: PreviewPanelProps) => {
  const [activeTab, setActiveTab] = useState<PreviewTab>('mockup');
  const [isDark, setIsDark] = useState(false);

  const tabs: Array<{
    id: PreviewTab;
    label: string;
    icon: React.ReactNode;
  }> = [
    { id: 'mockup', label: '목업', icon: <Layout className="w-4 h-4" /> },
    { id: 'typography', label: '타이포', icon: <Type className="w-4 h-4" /> },
    {
      id: 'components',
      label: '컴포넌트',
      icon: <Component className="w-4 h-4" />,
    },
  ];

  const renderPreview = () => {
    switch (activeTab) {
      case 'mockup':
        return <MockupPreview palette={palette} isDark={isDark} />;
      case 'typography':
        return <TypographyPreview palette={palette} isDark={isDark} />;
      case 'components':
        return <ComponentsPreview palette={palette} isDark={isDark} />;
      default:
        return null;
    }
  };

  return (
    <div className="rounded-2xl border border-border bg-background overflow-hidden flex flex-col h-full">
      {/* Top bar with tabs and toggle */}
      <div className="flex items-center justify-between border-b border-border px-6 py-4">
        {/* Tabs */}
        <div className="flex gap-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors relative group ${
                activeTab === tab.id
                  ? 'bg-foreground text-background'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab.icon}
              <span className="text-sm font-medium">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Dark/Light toggle */}
        <button
          onClick={() => setIsDark(!isDark)}
          className="flex items-center justify-center w-10 h-10 rounded-lg border border-border hover:bg-muted transition-colors"
          aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {isDark ? (
            <Sun className="w-5 h-5 text-muted-foreground" />
          ) : (
            <Moon className="w-5 h-5 text-muted-foreground" />
          )}
        </button>
      </div>

      {/* Preview content */}
      <div className="flex-1 overflow-hidden p-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="w-full h-full"
          >
            {renderPreview()}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default PreviewPanel;
