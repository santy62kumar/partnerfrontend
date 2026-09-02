import React from 'react';
import Loader from './Loader';

// One spinner in the app. This keeps the older `message` prop working on top of Loader.
const LoadingSpinner = ({ message = 'Loading…' }) => (
  <div className="flex min-h-screen items-center justify-center bg-background">
    <Loader size="lg" text={message} />
  </div>
);

export default LoadingSpinner;
