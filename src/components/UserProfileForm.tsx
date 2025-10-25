import React, { useState } from 'react';
import { User, Briefcase, GraduationCap, Code, Palette, Users, Building, ArrowRight, CheckCircle } from 'lucide-react';

interface UserProfile {
  name: string;
  role: string;
  company: string;
  experience: string;
  interests: string[];
}

interface Props {
  onProfileComplete: (profile: UserProfile) => void;
}

const UserProfileForm: React.FC<Props> = ({ onProfileComplete }) => {
  const [step, setStep] = useState(1);
  const [profile, setProfile] = useState<UserProfile>({
    name: '',
    role: '',
    company: '',
    experience: '',
    interests: []
  });

  const roles = [
    { id: 'developer', name: 'Software Developer', icon: Code, description: 'Building and maintaining applications' },
    { id: 'qa', name: 'QA Engineer', icon: CheckCircle, description: 'Testing and quality assurance' },
    { id: 'designer', name: 'UI/UX Designer', icon: Palette, description: 'Designing user experiences' },
    { id: 'student', name: 'Student', icon: GraduationCap, description: 'Learning and studying technology' },
    { id: 'manager', name: 'Project Manager', icon: Users, description: 'Managing projects and teams' },
    { id: 'devops', name: 'DevOps Engineer', icon: Building, description: 'Infrastructure and deployment' },
    { id: 'other', name: 'Other', icon: Briefcase, description: 'Something else' }
  ];

  const experienceLevels = [
    { id: 'beginner', name: 'Beginner', description: '0-1 years of experience' },
    { id: 'intermediate', name: 'Intermediate', description: '2-5 years of experience' },
    { id: 'advanced', name: 'Advanced', description: '5+ years of experience' },
    { id: 'expert', name: 'Expert', description: '10+ years of experience' }
  ];

  const interests = [
    'API Development',
    'Test Automation',
    'CI/CD Pipelines',
    'Security Testing',
    'Performance Testing',
    'Microservices',
    'Cloud Computing',
    'DevOps',
    'Quality Assurance',
    'Documentation',
    'Code Review',
    'Agile Development'
  ];

  const handleNext = () => {
    if (step < 4) {
      setStep(step + 1);
    } else {
      onProfileComplete(profile);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const toggleInterest = (interest: string) => {
    setProfile(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }));
  };

  const isStepValid = () => {
    switch (step) {
      case 1: return profile.name.trim().length > 0;
      case 2: return profile.role.length > 0;
      case 3: return profile.experience.length > 0;
      case 4: return true; // Interests are optional
      default: return false;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-gray-600">Step {step} of 4</span>
            <span className="text-sm text-gray-500">{Math.round((step / 4) * 100)}% Complete</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(step / 4) * 100}%` }}
            ></div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Step 1: Name */}
          {step === 1 && (
            <div className="text-center">
              <div className="p-4 bg-indigo-100 rounded-2xl inline-block mb-6">
                <User className="w-12 h-12 text-indigo-600" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Welcome! Let's get to know you</h2>
              <p className="text-gray-600 mb-8">We'll personalize your experience based on your profile</p>
              
              <div className="max-w-md mx-auto">
                <label className="block text-left text-sm font-medium text-gray-700 mb-2">
                  What's your name?
                </label>
                <input
                  type="text"
                  value={profile.name}
                  onChange={(e) => setProfile(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter your full name"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-lg"
                  autoFocus
                />
              </div>
            </div>
          )}

          {/* Step 2: Role */}
          {step === 2 && (
            <div>
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">What's your role?</h2>
                <p className="text-gray-600">This helps us customize the experience for you</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {roles.map((role) => {
                  const Icon = role.icon;
                  return (
                    <button
                      key={role.id}
                      onClick={() => setProfile(prev => ({ ...prev, role: role.id }))}
                      className={`p-4 rounded-xl border-2 text-left transition-all duration-200 hover:shadow-md ${
                        profile.role === role.id
                          ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        <Icon className={`w-6 h-6 mt-1 ${profile.role === role.id ? 'text-indigo-600' : 'text-gray-400'}`} />
                        <div>
                          <div className="font-semibold">{role.name}</div>
                          <div className="text-sm text-gray-500">{role.description}</div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Step 3: Experience */}
          {step === 3 && (
            <div>
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">What's your experience level?</h2>
                <p className="text-gray-600">This helps us provide relevant content and examples</p>
              </div>
              
              <div className="space-y-3 max-w-lg mx-auto">
                {experienceLevels.map((level) => (
                  <button
                    key={level.id}
                    onClick={() => setProfile(prev => ({ ...prev, experience: level.id }))}
                    className={`w-full p-4 rounded-xl border-2 text-left transition-all duration-200 hover:shadow-md ${
                      profile.experience === level.id
                        ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="font-semibold">{level.name}</div>
                    <div className="text-sm text-gray-500">{level.description}</div>
                  </button>
                ))}
              </div>

              <div className="mt-8 max-w-md mx-auto">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Company/Organization (Optional)
                </label>
                <input
                  type="text"
                  value={profile.company}
                  onChange={(e) => setProfile(prev => ({ ...prev, company: e.target.value }))}
                  placeholder="Where do you work?"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>
          )}

          {/* Step 4: Interests */}
          {step === 4 && (
            <div>
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">What interests you most?</h2>
                <p className="text-gray-600">Select topics you'd like to focus on (optional)</p>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {interests.map((interest) => (
                  <button
                    key={interest}
                    onClick={() => toggleInterest(interest)}
                    className={`p-3 rounded-lg border text-sm font-medium transition-all duration-200 ${
                      profile.interests.includes(interest)
                        ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                        : 'border-gray-200 hover:border-gray-300 text-gray-700'
                    }`}
                  >
                    {interest}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200">
            <button
              onClick={handleBack}
              disabled={step === 1}
              className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                step === 1
                  ? 'text-gray-400 cursor-not-allowed'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              Back
            </button>
            
            <button
              onClick={handleNext}
              disabled={!isStepValid()}
              className={`inline-flex items-center px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                isStepValid()
                  ? 'bg-indigo-600 text-white hover:bg-indigo-700 transform hover:scale-105'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {step === 4 ? 'Complete Setup' : 'Continue'}
              <ArrowRight className="w-4 h-4 ml-2" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfileForm;