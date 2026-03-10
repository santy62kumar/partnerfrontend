import React from 'react';
import { APP_NAME } from '@utils/constants';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="surface-glass border-t border-border/70 py-4 mt-6">
      <div className="container mx-auto px-4 text-center">
        <p className="text-sm text-muted-foreground">
          © {currentYear} {APP_NAME}. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
