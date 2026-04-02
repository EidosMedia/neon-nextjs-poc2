'use client';
import React from 'react';
import { useUI } from '../ui_lib';
const TestSharedComponent = () => {
  const { SharedButton } = useUI();
  return (
    <div>
      <SharedButton variant="secondary" onClick={() => alert('This is a shared button!')}>
        Shared Button Component
      </SharedButton>
    </div>
  );
};

export default TestSharedComponent;
