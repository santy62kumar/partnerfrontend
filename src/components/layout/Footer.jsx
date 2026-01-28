import React from 'react';
import { APP_NAME } from '@utils/constants';

/**
 * Footer Component
 * Shows copyright and app info
 */
const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-primary-grey-200 py-4">
      <div className="container mx-auto px-4 text-center">
        <p className="text-sm text-primary-grey-600">
          © {currentYear} {APP_NAME}. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;