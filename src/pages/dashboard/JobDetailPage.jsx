import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Button from '@components/common/Button';
import Loader from '@components/common/Loader';
import JobDetails from '@components/dashboard/JobDetails';
import ProgressUpload from '@components/dashboard/ProgressUpload';
import ProgressTimeline from '@components/dashboard/ProgressTimeline';
import { dashboardApi } from '@api/dashboardApi';
import { useDashboardStore } from '@store/dashboardStore';
import { useToast } from '@hooks/useToast';
import { IoArrowBackOutline } from 'react-icons/io5';

const JobDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  
  const [loading, setLoading] = useState(true);
  const [job, setJob] = useState(null);
  const [progress, setProgress] = useState([]);

  useEffect(() => {
    fetchJobDetails();
    fetchJobProgress();
  }, [id]);

  const fetchJobDetails = async () => {
    setLoading(true);
    try {
      const response = await dashboardApi.getJob(id);
      console.log('Job details response:', response);
      setJob(response.job || response.data);
    } catch (error) {
      const message = error.message || 'Failed to fetch job details';
      toast.error(message);
      // Redirect to dashboard if job not found
      if (error.status === 404) {
        navigate('/dashboard');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchJobProgress = async () => {
    try {
      const response = await dashboardApi.getJobProgress(id);
      console.log('Full API response:', response); // Add this
      console.log('response.progress:', response.progress); // And this
      console.log('response.data:', response.data); // And this
      setProgress(response.uploads || []);
    } catch (error) {
      console.error('Failed to fetch progress:', error);
      // Don't show error toast for progress, as it's optional
    }
  };

  const handleUploadSuccess = async (newProgress) => {
  // Just refresh the entire progress list from backend
  await fetchJobProgress();
  // Refresh job details to update status if needed
  fetchJobDetails();
};

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader size="lg" text="Loading job details..." />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-primary-grey-900 mb-4">
          Job Not Found
        </h2>
        <Button variant="primary" onClick={() => navigate('/dashboard')}>
          Back to Dashboard
        </Button>
      </div>
    );
  }

  return (
    <div className="animate-fadeIn">
      {/* Back Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => navigate('/dashboard')}
        className="mb-4"
      >
        <IoArrowBackOutline size={20} />
        Back to Dashboard
      </Button>

      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold font-montserrat text-primary-grey-900 mb-2">
          Job Details
        </h1>
        {/* <p className="text-primary-grey-600">
          View job information and upload progress updates
        </p> */}
      </div>
      {/* <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3">Checklists</h3>
        
        {job.checklist_ids && job.checklist_ids.length > 0 ? (
          <div className="space-y-2">
            {job.checklist_ids.map((checklistId) => (
              <Button
                key={checklistId}
                variant="secondary"
                size="sm"
                onClick={() => {
                  navigate(`/dashboard/jobs/${job.id}/checklist/${checklistId}`);
                }}
                className="mr-2"
              >
                View Checklist {checklistId}
              </Button>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No checklists available</p>
        )}
      </div> */}

     
      
      
      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="space-y-6">
          <JobDetails job={job} />

          
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3">Checklists</h3>

            {job.checklists && job.checklists.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {job.checklists.map((checklist) => (
                  <Button
                    key={checklist.id}
                    variant="secondary"
                    size="sm"
                    // className="border-[#3D1D1C] text-[#3D1D1C] hover:bg-[#3D1D1C]/10"
                    onClick={() => {
                      navigate(`/dashboard/jobs/${job.id}/checklist/${checklist.id}`);
                    }}
                  >
                    {checklist.name}
                  </Button>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No checklists available</p>
            )}
          </div>
          {/* <ProgressUpload 
            jobId={job.id} 
            onUploadSuccess={handleUploadSuccess}
          /> */}
        </div>

        <div>
          <ProgressUpload 
            jobId={job.id} 
            onUploadSuccess={handleUploadSuccess}
          />
        </div>

        {/* Right Column */}
        <div>
          <ProgressTimeline progress={progress} />
        </div>
      </div>
    </div>
  );
};

export default JobDetailPage;
