import React, { useState, useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';
import BackgroundSelectionModal from './BackgroundSelectionModal';
import { backgroundSelectionService } from '../lib/backgroundSelectionService';
import toast from 'react-hot-toast';

const BackgroundSelectionWrapper = ({ children }) => {
  const { user, isLoaded } = useUser();
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [hasBackground, setHasBackground] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkBackgroundSelection = async () => {
      if (!isLoaded || !user) {
        setLoading(false);
        return;
      }

      try {
        const hasSelection = await backgroundSelectionService.hasBackgroundSelection(user.id);
        setHasBackground(hasSelection);
        
        // Show modal if user doesn't have background selection
        if (!hasSelection) {
          setShowModal(true);
        }
      } catch (error) {
        console.error('Error checking background selection:', error);
        // If there's an error, assume no background and show modal
        setShowModal(true);
      } finally {
        setLoading(false);
      }
    };

    checkBackgroundSelection();
  }, [user, isLoaded]);

  const handleSaveBackground = async (backgroundData) => {
    try {
      await backgroundSelectionService.saveBackgroundSelection(backgroundData, user.id);
      setHasBackground(true);
      setShowModal(false);
      toast.success('Background saved! Redirecting to your personalized form...');
      
      // Redirect to intake page after a short delay
      setTimeout(() => {
        navigate('/intake');
      }, 1000);
    } catch (error) {
      console.error('Error saving background selection:', error);
      toast.error('Failed to save background selection. Please try again.');
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    // If user skips, they'll get the default form
    navigate('/intake');
  };

  // Show loading state while checking background
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p>Loading your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {children}
      <BackgroundSelectionModal
        isOpen={showModal}
        onSave={handleSaveBackground}
        onClose={handleCloseModal}
      />
    </>
  );
};

export default BackgroundSelectionWrapper;
