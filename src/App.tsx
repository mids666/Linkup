/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useWebRTC } from './hooks/useWebRTC';
import { Header } from './components/Header';
import { VideoDisplay } from './components/VideoDisplay';
import { ControlsBar } from './components/ControlsBar';
import { ChatDrawer } from './components/ChatDrawer';
import { FavoritesDrawer } from './components/FavoritesDrawer';
import { ReportModal } from './components/ReportModal';
import { CryptoInspectorModal } from './components/CryptoInspectorModal';
import { IncomingCallModal } from './components/IncomingCallModal';
import { SignUpModal } from './components/SignUpModal';
import { ThemeSelectionModal } from './components/ThemeSelectionModal';
import { TestOnMobileModal } from './components/TestOnMobileModal';
import { ThemeId } from './types';
import {
  THEMES,
  getStoredTheme,
  saveStoredTheme,
  applyThemeToDocument,
} from './utils/themes';

export default function App() {
  const {
    profile,
    callStatus,
    disconnectReason,
    currentPartner,
    isInitiator,
    localStream,
    remoteStream,
    isVirtualStream,
    isVideoEnabled,
    isAudioEnabled,
    isScreenSharing,
    messages,
    cryptoData,
    incomingCall,
    serverStats,
    favorites,
    favoritesStatus,
    queuePosition,
    isCurrentPartnerFavorite,
    startRandomSearch,
    cancelSearch,
    skipPartner,
    simulateTestMatch,
    reportPartner,
    toggleScreenShare,
    toggleVideo,
    toggleAudio,
    toggleVirtualMode,
    sendChatMessage,
    addCurrentToFavorites,
    removeContactFavorite,
    updateContactNotes,
    callFavorite,
    acceptIncomingCall,
    declineIncomingCall,
    refreshFavoritesStatus,
    updateProfileName,
    updateFullProfile,
    setGenderPreference,
  } = useWebRTC();

  // Theme State
  const [currentTheme, setCurrentTheme] = useState<ThemeId>(() => getStoredTheme());
  const [isThemeModalOpen, setIsThemeModalOpen] = useState(false);

  // Apply theme to DOM on mount and whenever theme changes
  useEffect(() => {
    applyThemeToDocument(currentTheme);
  }, [currentTheme]);

  // Sign-Up / Profile Modal State (Open automatically if not completed)
  const [isSignUpModalOpen, setIsSignUpModalOpen] = useState<boolean>(
    () => !profile.hasSignedUp
  );

  // Drawer & Modal States
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isFavoritesOpen, setIsFavoritesOpen] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [isCryptoInspectorOpen, setIsCryptoInspectorOpen] = useState(false);
  const [isMobileTestOpen, setIsMobileTestOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const activeTheme = THEMES[currentTheme] || THEMES['cyber-dark'];

  const handleSelectTheme = (themeId: ThemeId) => {
    setCurrentTheme(themeId);
    saveStoredTheme(themeId);
    applyThemeToDocument(themeId);
  };

  // When a new message comes in and chat is closed, increment unread counter
  const previousMessagesCountRef = React.useRef(messages.length);
  useEffect(() => {
    if (messages.length > previousMessagesCountRef.current && !isChatOpen) {
      setUnreadCount((prev) => prev + (messages.length - previousMessagesCountRef.current));
    }
    previousMessagesCountRef.current = messages.length;
  }, [messages.length, isChatOpen]);

  const handleToggleChat = () => {
    if (!isChatOpen) {
      setUnreadCount(0);
    }
    setIsChatOpen(!isChatOpen);
  };

  const handleToggleFavoriteCurrent = () => {
    if (!currentPartner) return;
    if (isCurrentPartnerFavorite) {
      removeContactFavorite(currentPartner.id);
    } else {
      addCurrentToFavorites();
    }
  };

  const handleReportSubmit = (reason: string, details: string, autoFindNext: boolean) => {
    reportPartner(reason, details, autoFindNext);
  };

  const onlineFavoritesCount = favorites.filter(
    (f) => favoritesStatus[f.id]?.online
  ).length;

  return (
    <div
      id="app-root"
      style={{
        backgroundColor: 'var(--theme-bg)',
        color: 'var(--theme-text)',
      }}
      className="flex flex-col h-screen w-screen overflow-hidden font-sans transition-colors duration-200"
    >
      {/* Platform Header */}
      <Header
        profile={profile}
        serverStats={serverStats}
        currentTheme={currentTheme}
        favoriteCount={favorites.length}
        onlineFavoritesCount={onlineFavoritesCount}
        onOpenFavorites={() => {
          refreshFavoritesStatus();
          setIsFavoritesOpen(true);
        }}
        onOpenCryptoInspector={() => setIsCryptoInspectorOpen(true)}
        onOpenThemeModal={() => setIsThemeModalOpen(true)}
        onOpenProfileModal={() => setIsSignUpModalOpen(true)}
        onOpenTestMobile={() => setIsMobileTestOpen(true)}
        onUpdateName={updateProfileName}
        isVirtualStream={isVirtualStream}
        onToggleVirtualMode={toggleVirtualMode}
      />

      {/* Main Video Stage with Dynamic Themes & Gender Preference */}
      <main className="flex-1 relative flex overflow-hidden">
        <VideoDisplay
          remoteStream={remoteStream}
          localStream={localStream}
          callStatus={callStatus}
          disconnectReason={disconnectReason}
          currentPartner={currentPartner}
          isInitiator={isInitiator}
          isCurrentPartnerFavorite={isCurrentPartnerFavorite}
          isVideoEnabled={isVideoEnabled}
          isAudioEnabled={isAudioEnabled}
          isScreenSharing={isScreenSharing}
          isVirtualStream={isVirtualStream}
          queuePosition={queuePosition}
          genderPreference={profile.genderPreference || 'any'}
          onSelectGenderPreference={setGenderPreference}
          onStartSearch={() => startRandomSearch()}
          onCancelSearch={cancelSearch}
          onToggleFavorite={handleToggleFavoriteCurrent}
          onOpenReport={() => setIsReportOpen(true)}
          onOpenCryptoInspector={() => setIsCryptoInspectorOpen(true)}
          onSkip={() => skipPartner(true)}
          onOpenTestMobile={() => setIsMobileTestOpen(true)}
          onSimulateTestMatch={simulateTestMatch}
        />

        {/* Encrypted Chat Drawer */}
        <ChatDrawer
          isOpen={isChatOpen}
          onClose={() => setIsChatOpen(false)}
          messages={messages}
          onSendMessage={sendChatMessage}
          profile={profile}
          partner={currentPartner}
          cryptoData={cryptoData}
          onOpenCryptoInspector={() => setIsCryptoInspectorOpen(true)}
        />
      </main>

      {/* Persistent Call Controls Bar */}
      <ControlsBar
        callStatus={callStatus}
        isCurrentPartnerFavorite={isCurrentPartnerFavorite}
        isVideoEnabled={isVideoEnabled}
        isAudioEnabled={isAudioEnabled}
        isScreenSharing={isScreenSharing}
        isVirtualStream={isVirtualStream}
        isChatOpen={isChatOpen}
        unreadCount={unreadCount}
        onSkip={() => skipPartner(true)}
        onStartSearch={() => startRandomSearch()}
        onToggleVideo={toggleVideo}
        onToggleAudio={toggleAudio}
        onToggleScreenShare={toggleScreenShare}
        onToggleVirtualMode={toggleVirtualMode}
        onToggleFavorite={handleToggleFavoriteCurrent}
        onOpenReport={() => setIsReportOpen(true)}
        onToggleChat={handleToggleChat}
        onOpenCryptoInspector={() => setIsCryptoInspectorOpen(true)}
      />

      {/* Sign-Up & Profile Modal */}
      <SignUpModal
        isOpen={isSignUpModalOpen}
        isMandatory={!profile.hasSignedUp}
        onClose={() => setIsSignUpModalOpen(false)}
        profile={profile}
        onSaveProfile={updateFullProfile}
      />

      {/* Theme Selection Modal */}
      <ThemeSelectionModal
        isOpen={isThemeModalOpen}
        onClose={() => setIsThemeModalOpen(false)}
        currentTheme={currentTheme}
        onSelectTheme={handleSelectTheme}
      />

      {/* Favorites Drawer */}
      <FavoritesDrawer
        isOpen={isFavoritesOpen}
        onClose={() => setIsFavoritesOpen(false)}
        favorites={favorites}
        favoritesStatus={favoritesStatus}
        onCallFavorite={(userId) => {
          setIsFavoritesOpen(false);
          callFavorite(userId);
        }}
        onRemoveFavorite={removeContactFavorite}
        onUpdateNotes={updateContactNotes}
        onRefreshStatus={refreshFavoritesStatus}
      />

      {/* Report Modal */}
      <ReportModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        partnerName={currentPartner?.name || 'Current Partner'}
        onSubmitReport={handleReportSubmit}
      />

      {/* E2EE Crypto Inspector Modal */}
      <CryptoInspectorModal
        isOpen={isCryptoInspectorOpen}
        onClose={() => setIsCryptoInspectorOpen(false)}
        cryptoData={cryptoData}
        partnerName={currentPartner?.name}
      />

      {/* Incoming Call Modal */}
      <IncomingCallModal
        incomingCall={incomingCall}
        onAccept={acceptIncomingCall}
        onDecline={declineIncomingCall}
      />

      {/* Test on Mobile & Matching Modal */}
      <TestOnMobileModal
        isOpen={isMobileTestOpen}
        onClose={() => setIsMobileTestOpen(false)}
        serverStats={serverStats}
        onSimulateTestMatch={simulateTestMatch}
      />
    </div>
  );
}
