import React, { useState } from 'react';
import { Heart, Upload } from 'lucide-react';
import { User } from '../../types';
import { apiService } from '../../services/api';

interface AuthPageProps {
  onAuthSuccess: (user: User) => void;
  onError: (error: string) => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({ onAuthSuccess, onError }) => {
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signup');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    photo: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || (authMode === 'signup' && !formData.description)) return;

    try {
      setLoading(true);
      onError('');

      let user: User;
      if (authMode === 'signup') {
        user = await apiService.signUp({
          name: formData.name,
          description: formData.description,
          photo: formData.photo || 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=500'
        });
      } else {
        user = await apiService.signIn(formData.name);
      }
      
      setFormData({ name: '', description: '', photo: '' });
      onAuthSuccess(user);
    } catch (err) {
      console.error('Authentication failed:', err);
      onError(err instanceof Error ? err.message : 'Authentication failed');
      if (authMode === 'signin') {
        alert('User not found. Please sign up first.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setFormData(prev => ({ ...prev, photo: e.target?.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <div className="logo">
            <Heart className="logo-icon" />
            <h1>LoveConnect</h1>
          </div>
          <p className="tagline">Find your perfect match</p>
        </div>

        <div className="auth-toggle">
          <button
            onClick={() => setAuthMode('signup')}
            className={`auth-toggle-btn ${authMode === 'signup' ? 'active' : ''}`}
          >
            Sign Up
          </button>
          <button
            onClick={() => setAuthMode('signin')}
            className={`auth-toggle-btn ${authMode === 'signin' ? 'active' : ''}`}
          >
            Sign In
          </button>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label>Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Enter your name"
              required
            />
          </div>

          {authMode === 'signup' && (
            <>
              <div className="form-group">
                <label>Photo</label>
                <div className="photo-upload">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    id="photo-upload"
                    style={{ display: 'none' }}
                  />
                  <label htmlFor="photo-upload" className="upload-btn">
                    <Upload className="upload-icon" />
                    Upload Photo
                  </label>
                  {formData.photo && (
                    <img
                      src={formData.photo}
                      alt="Preview"
                      className="photo-preview"
                    />
                  )}
                </div>
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Tell us about yourself..."
                  rows={3}
                  required
                />
              </div>
            </>
          )}

          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? 'Please wait...' : (authMode === 'signup' ? 'Create Account' : 'Sign In')}
          </button>
        </form>
      </div>
    </div>
  );
};
