import React, { useState, useRef, useEffect } from 'react';
import { Camera, Upload, X, Loader } from 'lucide-react';

function ProfileImageUpload({ currentImage, onImageChange, darkMode }) {
  const [preview, setPreview] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [isHovering, setIsHovering] = useState(false);
  const fileInputRef = useRef(null);

  // Supported file formats
  const SUPPORTED_FORMATS = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

  useEffect(() => {
    // Reset preview when currentImage changes
    if (currentImage && !selectedFile) {
      setPreview(null);
    }
  }, [currentImage, selectedFile]);

  // Get user initials for placeholder
  const getInitials = () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const name = user.name || 'User';
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Validate file
  const validateFile = (file) => {
    setError('');

    if (!file) {
      setError('Please select a file');
      return false;
    }

    if (!SUPPORTED_FORMATS.includes(file.type)) {
      setError('Unsupported format. Please use JPG, PNG, GIF, or WEBP');
      return false;
    }

    if (file.size > MAX_FILE_SIZE) {
      setError('File too large. Maximum size is 5MB');
      return false;
    }

    return true;
  };

  // Handle file selection
  const handleFileSelect = (file) => {
    if (!validateFile(file)) {
      return;
    }

    setSelectedFile(file);
    setError('');

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  // Handle file input change
  const handleFileInputChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  // Handle drag events
  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  // Handle upload
  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Please select an image first');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Simulate upload delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Call parent callback with the selected file and preview
      if (onImageChange) {
        await onImageChange(selectedFile, preview);
      }

      // Clear selected file after successful upload
      setSelectedFile(null);
    } catch (err) {
      setError(err.message || 'Upload failed. Please try again');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle remove
  const handleRemove = async () => {
    if (!currentImage && !preview) return;

    setIsLoading(true);
    setError('');

    try {
      // Simulate delete delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Call parent callback with null to remove image
      if (onImageChange) {
        await onImageChange(null, null);
      }

      setPreview(null);
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err) {
      setError(err.message || 'Failed to remove image');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle cancel preview
  const handleCancelPreview = () => {
    setPreview(null);
    setSelectedFile(null);
    setError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Trigger file input click
  const handleClickUpload = () => {
    fileInputRef.current?.click();
  };

  // Determine which image to display
  const displayImage = preview || currentImage;
  const hasImage = !!displayImage;

  return (
    <>
      <style>{componentStyles}</style>

      <div style={styles.container}>
        {/* Avatar Display */}
        <div
          style={{
            ...styles.avatarWrapper,
            ...(isDragging ? styles.avatarWrapperDragging : {}),
          }}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={!isLoading ? handleClickUpload : undefined}
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
          className="avatar-wrapper"
        >
          {/* Avatar Circle */}
          <div
            style={{
              ...styles.avatarCircle,
              background: hasImage
                ? 'transparent'
                : darkMode
                ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                : 'linear-gradient(135deg, #10b981 0%, #06b6d4 100%)',
              borderColor: darkMode
                ? 'rgba(16, 185, 129, 0.3)'
                : 'rgba(16, 185, 129, 0.2)',
            }}
            className="avatar-circle"
          >
            {hasImage ? (
              <img
                src={displayImage}
                alt="Profile"
                style={styles.avatarImage}
              />
            ) : (
              <span
                style={{
                  ...styles.initials,
                  color: darkMode ? '#fff' : '#fff',
                }}
              >
                {getInitials()}
              </span>
            )}

            {/* Loading Overlay */}
            {isLoading && (
              <div
                style={{
                  ...styles.loadingOverlay,
                  background: darkMode
                    ? 'rgba(0, 0, 0, 0.8)'
                    : 'rgba(255, 255, 255, 0.9)',
                }}
              >
                <Loader
                  size={32}
                  style={styles.spinner}
                  className="spinner-icon"
                  color="#10b981"
                />
              </div>
            )}

            {/* Camera Overlay on Hover */}
            {!isLoading && isHovering && (
              <div
                style={{
                  ...styles.cameraOverlay,
                  background: darkMode
                    ? 'rgba(0, 0, 0, 0.7)'
                    : 'rgba(16, 185, 129, 0.7)',
                }}
                className="camera-overlay"
              >
                <Camera size={32} color="#fff" />
                <span
                  style={{
                    ...styles.cameraText,
                    color: '#fff',
                  }}
                >
                  {hasImage ? 'Change Photo' : 'Upload Photo'}
                </span>
              </div>
            )}
          </div>

          {/* Drag & Drop Text */}
          {isDragging && (
            <div
              style={{
                ...styles.dragText,
                color: darkMode ? '#10b981' : '#10b981',
              }}
            >
              Drop image here
            </div>
          )}
        </div>

        {/* File Input (Hidden) */}
        <input
          ref={fileInputRef}
          type="file"
          accept={SUPPORTED_FORMATS.join(',')}
          onChange={handleFileInputChange}
          style={styles.fileInput}
        />

        {/* Info Text */}
        <div style={styles.infoSection}>
          <p
            style={{
              ...styles.infoText,
              color: darkMode ? '#9ca3af' : '#6b7280',
            }}
          >
            Click or drag & drop to upload
          </p>
          <p
            style={{
              ...styles.infoSubtext,
              color: darkMode ? '#6b7280' : '#9ca3af',
            }}
          >
            JPG, PNG, GIF, WEBP (Max 5MB)
          </p>
        </div>

        {/* Action Buttons */}
        {(selectedFile || hasImage) && !isLoading && (
          <div style={styles.buttonGroup}>
            {selectedFile && (
              <>
                <button
                  onClick={handleUpload}
                  style={{
                    ...styles.button,
                    ...styles.uploadButton,
                  }}
                  className="upload-button"
                  disabled={isLoading}
                >
                  <Upload size={18} />
                  <span>Upload</span>
                </button>
                <button
                  onClick={handleCancelPreview}
                  style={{
                    ...styles.button,
                    ...styles.cancelButton,
                    background: darkMode
                      ? 'rgba(107, 114, 128, 0.2)'
                      : 'rgba(156, 163, 175, 0.1)',
                    color: darkMode ? '#9ca3af' : '#6b7280',
                  }}
                  className="cancel-button"
                  disabled={isLoading}
                >
                  <X size={18} />
                  <span>Cancel</span>
                </button>
              </>
            )}
            {!selectedFile && hasImage && (
              <button
                onClick={handleRemove}
                style={{
                  ...styles.button,
                  ...styles.removeButton,
                }}
                className="remove-button"
                disabled={isLoading}
              >
                <X size={18} />
                <span>Remove Photo</span>
              </button>
            )}
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div
            style={{
              ...styles.errorMessage,
              background: darkMode
                ? 'rgba(239, 68, 68, 0.1)'
                : 'rgba(239, 68, 68, 0.05)',
              color: '#ef4444',
              borderColor: 'rgba(239, 68, 68, 0.3)',
            }}
            className="error-message"
          >
            {error}
          </div>
        )}
      </div>
    </>
  );
}

const componentStyles = `
  .avatar-wrapper {
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .avatar-wrapper:hover {
    transform: scale(1.05);
  }

  .avatar-circle {
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .avatar-wrapper:hover .avatar-circle {
    box-shadow: 0 20px 60px rgba(16, 185, 129, 0.3);
    transform: translateY(-4px);
  }

  .camera-overlay {
    animation: fadeIn 0.2s ease;
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  .spinner-icon {
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }

  .upload-button {
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .upload-button:hover {
    transform: translateY(-2px);
    box-shadow: 0 12px 32px rgba(16, 185, 129, 0.4);
  }

  .upload-button:active {
    transform: translateY(0);
  }

  .cancel-button {
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .cancel-button:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(107, 114, 128, 0.3);
  }

  .remove-button {
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .remove-button:hover {
    transform: translateY(-2px);
    box-shadow: 0 12px 32px rgba(239, 68, 68, 0.4);
  }

  .error-message {
    animation: slideUp 0.3s ease;
  }

  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '1.5rem',
    width: '100%',
  },
  avatarWrapper: {
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '1rem',
  },
  avatarWrapperDragging: {
    transform: 'scale(1.08)',
  },
  avatarCircle: {
    position: 'relative',
    width: '150px',
    height: '150px',
    borderRadius: '50%',
    border: '4px solid',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    boxShadow: '0 10px 40px rgba(16, 185, 129, 0.2)',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  initials: {
    fontSize: '3rem',
    fontWeight: '700',
    userSelect: 'none',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backdropFilter: 'blur(4px)',
  },
  spinner: {
    strokeWidth: 3,
  },
  cameraOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    backdropFilter: 'blur(4px)',
  },
  cameraText: {
    fontSize: '0.875rem',
    fontWeight: '600',
    textAlign: 'center',
  },
  dragText: {
    fontSize: '1rem',
    fontWeight: '600',
    textAlign: 'center',
    marginTop: '0.5rem',
  },
  fileInput: {
    display: 'none',
  },
  infoSection: {
    textAlign: 'center',
  },
  infoText: {
    fontSize: '0.95rem',
    fontWeight: '600',
    marginBottom: '0.25rem',
  },
  infoSubtext: {
    fontSize: '0.8rem',
    fontWeight: '500',
  },
  buttonGroup: {
    display: 'flex',
    gap: '0.75rem',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  button: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.75rem 1.5rem',
    border: 'none',
    borderRadius: '12px',
    fontSize: '0.95rem',
    fontWeight: '700',
    cursor: 'pointer',
    outline: 'none',
  },
  uploadButton: {
    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    color: '#fff',
    boxShadow: '0 4px 16px rgba(16, 185, 129, 0.3)',
  },
  cancelButton: {
    border: '2px solid rgba(156, 163, 175, 0.3)',
  },
  removeButton: {
    background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
    color: '#fff',
    boxShadow: '0 4px 16px rgba(239, 68, 68, 0.3)',
  },
  errorMessage: {
    width: '100%',
    padding: '1rem',
    borderRadius: '12px',
    fontSize: '0.9rem',
    fontWeight: '600',
    textAlign: 'center',
    border: '2px solid',
  },
};

export default ProfileImageUpload;
