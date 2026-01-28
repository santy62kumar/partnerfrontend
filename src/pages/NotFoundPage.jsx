import React from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '@components/common/Button';
import { IoHomeOutline } from 'react-icons/io5';

const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-primary-grey-50 flex items-center justify-center p-4">
      <div className="text-center">
        <h1 className="text-9xl font-bold font-montserrat text-primary-grey-300">
          404
        </h1>
        <h2 className="text-3xl font-semibold font-montserrat text-primary-grey-900 mt-4">
          Page Not Found
        </h2>
        <p className="text-primary-grey-600 mt-2 mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Button
          variant="primary"
          size="lg"
          onClick={() => navigate('/dashboard')}
        >
          <IoHomeOutline size={20} />
          Go to Dashboard
        </Button>
      </div>
    </div>
  );
};

export default NotFoundPage;