import React, { useState, useEffect } from 'react'
import { useUser } from '@clerk/clerk-react'
import { supabase, SUPABASE_TABLE } from '../lib/supabaseClient'
import { Link } from 'react-router-dom'

export default function Profile() {
  const { user } = useUser()
  const [profileData, setProfileData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function fetchProfile() {
      if (!user?.id) return
      
      try {
        const { data, error: err } = await supabase
          .from(SUPABASE_TABLE)
          .select('*')
          .eq('user_id', user.id)
          .single()
        
        if (err && err.code !== 'PGRST116') { // PGRST116 means no rows found
          throw err
        }
        
        setProfileData(data)
      } catch (err) {
        setError(err?.message || 'Failed to fetch profile')
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [user])

  if (loading) {
    return (
      <div className="text-white">
        <div className="card">
          <p className="text-white/70">Loading profile...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-white">
        <div className="card">
          <div className="rounded-md border border-red-400/30 bg-red-500/15 p-3 text-red-200">
            {error}
          </div>
        </div>
      </div>
    )
  }

  if (!profileData) {
    return (
      <div className="text-white">
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Your Profile</h2>
          <p className="text-white/70 mb-4">You haven't submitted your intake form yet.</p>
          <Link to="/intake" className="btn btn-primary">
            Complete Intake Form
          </Link>
        </div>
      </div>
    )
  }

  const { name, email, tier, grade, responses, created_at, updated_at } = profileData

  return (
    <div className="text-white">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold">Your Profile</h2>
        <p className="text-white/70 text-sm">View and manage your learning profile</p>
      </div>

      <div className="card mb-6">
        <div className="toolbar mb-4">
          <h3 className="text-lg font-semibold">Basic Information</h3>
          <Link to="/intake" className="btn btn-sm">
            Edit Profile
          </Link>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Name</label>
            <p className="text-white/90">{name || 'Not provided'}</p>
          </div>
          <div>
            <label className="label">Email</label>
            <p className="text-white/90">{email || 'Not provided'}</p>
          </div>
          {tier && (
            <div>
              <label className="label">Learning Tier</label>
              <p className="text-white/90 capitalize">{tier}</p>
            </div>
          )}
          {grade && (
            <div>
              <label className="label">Grade</label>
              <p className="text-white/90">{grade}</p>
            </div>
          )}
        </div>
      </div>

      {responses && (
        <div className="card">
          <div className="toolbar mb-4">
            <h3 className="text-lg font-semibold">Learning Profile</h3>
          </div>
          
          <div className="space-y-4">
            {responses.age && (
              <div>
                <label className="label">Age</label>
                <p className="text-white/90">{responses.age}</p>
              </div>
            )}
            
            {responses.phone && (
              <div>
                <label className="label">Phone</label>
                <p className="text-white/90">{responses.phone}</p>
              </div>
            )}
            
            {responses.education_level && (
              <div>
                <label className="label">Education Level</label>
                <p className="text-white/90">{responses.education_level}</p>
              </div>
            )}
            
            {responses.field_of_study && (
              <div>
                <label className="label">Field of Study</label>
                <p className="text-white/90">{responses.field_of_study}</p>
              </div>
            )}
            
            {responses.current_skills && responses.current_skills.length > 0 && (
              <div>
                <label className="label">Current Skills</label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {responses.current_skills.map((skill, i) => (
                    <span key={i} className="px-2 py-1 bg-white/10 rounded-md text-sm">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            {responses.interests && responses.interests.length > 0 && (
              <div>
                <label className="label">Interests</label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {responses.interests.map((interest, i) => (
                    <span key={i} className="px-2 py-1 bg-white/10 rounded-md text-sm">
                      {interest}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            {responses.goals && (
              <div>
                <label className="label">Goals</label>
                <p className="text-white/90">{responses.goals}</p>
              </div>
            )}
            
            {responses.preferred_learning_style && (
              <div>
                <label className="label">Preferred Learning Style</label>
                <p className="text-white/90">{responses.preferred_learning_style}</p>
              </div>
            )}
            
            {responses.availability_per_week_hours && (
              <div>
                <label className="label">Weekly Availability</label>
                <p className="text-white/90">{responses.availability_per_week_hours} hours</p>
              </div>
            )}
            
            {responses.experience_years !== null && responses.experience_years !== undefined && (
              <div>
                <label className="label">Years of Experience</label>
                <p className="text-white/90">{responses.experience_years}</p>
              </div>
            )}
          </div>
          
          <div className="mt-6 pt-4 border-t border-white/10 text-xs text-white/50">
            <p>Profile created: {new Date(created_at).toLocaleDateString()}</p>
            {updated_at && updated_at !== created_at && (
              <p>Last updated: {new Date(updated_at).toLocaleDateString()}</p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
