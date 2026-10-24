'use client';

import React from 'react';

export default function HomeView() {
  return (
    <iframe
      src="/index.html"
      title="LiveLore Concert Diary & Setlist Vault"
      className="w-full h-screen border-none bg-[#0A0D0E]"
      style={{ width: '100vw', height: '100vh', border: 'none' }}
    />
  );
}
