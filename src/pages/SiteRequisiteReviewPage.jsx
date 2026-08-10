import { ArrowLeft } from 'lucide-react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Button } from '@components/ui/button';
import useRequisiteStore from '../store/requisiteStore';
import BucketPage from './BucketPage';
import SubmitPage from './SubmitPage';

const SiteRequisiteReviewPage = () => {
  const navigate = useNavigate();
  const bucket = useRequisiteStore((state) => state.bucket);

  if (bucket.length === 0) {
    return <Navigate to="/site-requisite" replace />;
  }

  return (
    <div className="animate-fadeIn mx-auto w-full max-w-6xl">
      <header className="mb-8 flex items-center gap-3 border-b border-border pb-6">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => navigate('/site-requisite')}
          aria-label="Back to component selection"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold font-heading text-foreground sm:text-3xl">Review Site Requisite</h1>
          <p className="mt-1 text-sm text-muted-foreground">Complete each component and submit the request.</p>
        </div>
      </header>

      <BucketPage />
      <SubmitPage />
    </div>
  );
};

export default SiteRequisiteReviewPage;
