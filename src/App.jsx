import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Mail, Lock, Eye, EyeOff, ArrowRight, Sparkles, Shield, Users, Upload, Target, UserCheck, Building, BarChart3, Calendar, Settings, CheckCircle, User, Briefcase, Plus, TrendingUp, Zap, Menu, FileText, LogOut, Bell, MessageSquare, Send, Clock, BookOpen, ClipboardCheck, X, Loader } from 'lucide-react';

// Storage version for backwards compatibility
const STORAGE_VERSION = '1.1';

// Storage keys
const STORAGE_KEYS = {
  USER_DATA: 'glassSlipperUserData',
  CONTACTS: 'glassSlipperContacts',
  CATEGORIES: 'glassSlipperCategories',
  TASKS: 'glassSlipperTasks',
  SETTINGS: 'glassSlipperSettings',
  VERSION: 'glassSlipperVersion',
  STRATEGY: 'glassSlipperStrategy',
  LEAD_MAGNETS: 'glassSlipperLeadMagnets',
  ENRICHMENT_DATA: 'glassSlipperEnrichmentData'
};

// LinkedIn Formula AI Client - Powered by Claude API
class LinkedInFormulaAI {
  constructor() {
    this.apiKey = import.meta.env.VITE_CLAUDE_API_KEY;
    this.baseURL = 'https://api.anthropic.com/v1/messages';
    this.model = 'claude-3-sonnet-20240229';
    
    // LinkedIn Formula Knowledge Base (from Adam Houlahan's book)
    this.linkedinFormula = {
      coreProcess: [
        "① Define your one offer",
        "② Create your value proposition",
        "③ Build your Ideal Customer Profile",
        "④ Do some customer interviews",
        "⑤ Discover your style",
        "⑥ Shoot some content",
        "⑦ Write your profile",
        "⑧ Build the strategy",
        "⑨ Start implementing it",
        "⑩ Constantly review"
      ],
      contentStrategy: {
        funnelSplit: "3 Awareness + 2 Interest + 1 Decision + 1 Action posts per week",
        philosophy: "Content moves people through funnel: Awareness → Interest → Decision → Action",
        simpleApproach: [
          "The problem you solve",
          "The results people get from working with you",
          "How people can work with you",
          "Who you are"
        ],
        contentTypes: [
          "Education - show expertise and solve problems",
          "Storytelling - case studies with emotional connection",
          "Personal - build relationships and show personality",
          "Expertise - demonstrate knowledge and give advice",
          "Sales - clear offers with strong call-to-action"
        ]
      },
      engagementPrinciples: [
        "Quality over quantity - meaningful relationships with right people",
        "Value-first approach with soft pitch, content-driven outreach",
        "Profile as landing page designed to convert viewers into connections",
        "Track quality metrics: profile views from ideal customers, reply rates, meetings booked"
      ],
      oneThingStrategy: "Be known for one specific thing rather than everything - just because you promote one thing doesn't mean you lose everything else",
      messagingApproach: "Appreciate connecting + value delivery + soft CTA, avoid spam-like automation"
    };
  }

  async callClaude(prompt) {
    if (!this.apiKey) {
      throw new Error('Claude API key not configured. Please add VITE_CLAUDE_API_KEY to your environment variables.');
    }

    try {
      const response = await fetch('/api/claude', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.model,
          messages: [{
            role: 'user',
            content: prompt
          }],
          max_tokens: 4000
        })
      });

      if (!response.ok) {
        throw new Error(`Claude API failed: ${response.status}`);
      }

      const data = await response.json();
      return data.content[0].text;
    } catch (error) {
      console.error('Claude API Error:', error);
      throw error;
    }
  }

  async categoriseContact(contact, targetMarket, businessType, referralPartners = '') {
    const prompt = `Based on The LinkedIn Formula by Adam Houlahan, categorise this LinkedIn contact.

Contact Information:
Name: ${contact.name}
Company: ${contact.company || 'Not specified'}
Industry: ${contact.industry || 'Not specified'}
Title: ${contact.title || 'Not specified'}
Location: ${contact.location || 'Not specified'}

Business Context:
Target Market: ${targetMarket}
Business Type: ${businessType}
Ideal Referral Partners: ${referralPartners}

Categories:
1. Ideal Client - Matches target market (be flexible with matching - e.g., "wealth management" matches "Finance", "copywriting" matches "Marketing")
2. Referral Partner - Could refer ideal clients
3. Competitor - Same business type/service
4. Other - Doesn't fit above categories

Consider fuzzy matching for industries. For example:
- Finance includes: wealth management, banking, investment, accounting
- Marketing includes: copywriting, advertising, branding, digital marketing
- Technology includes: software, IT, tech startups, SaaS

Respond with ONLY the category name, nothing else.`;

    const response = await this.callClaude(prompt);
    return response.trim();
  }

  async generateStrategy(strategyData, businessInfo, writingStyle) {
    const prompt = `Based on The LinkedIn Formula by Adam Houlahan, create a comprehensive LinkedIn strategy.

Strategy Information:
One Offer: ${strategyData.oneOffer}
Ideal Referral Partners: ${strategyData.referralPartners}
What Makes You Special: ${strategyData.specialFactors}

Business Information:
Company: ${businessInfo.company}
Business Type: ${businessInfo.businessType}
Target Market: ${businessInfo.targetClients}
Goals: ${businessInfo.goals}

Writing Style: ${writingStyle ? JSON.stringify(writingStyle) : 'Not analyzed yet'}

Create a detailed strategy following The LinkedIn Formula principles including:
1. Profile optimization recommendations
2. Content strategy with specific post types
3. Ideal client pain points and how to address them
4. Engagement strategy for building relationships
5. Referral partner approach
6. Key messages and value propositions

Format as actionable bullet points.`;

    const response = await this.callClaude(prompt);
    return response;
  }

  async generateLeadMagnet(type, businessInfo, strategy, contactName = null, companyName = null) {
    const prompt = `Based on The LinkedIn Formula by Adam Houlahan, create a lead magnet.

Type: ${type}
Business: ${businessInfo.company}
Target Market: ${businessInfo.targetClients}
One Offer: ${strategy.oneOffer}
${contactName ? `Personalized for: ${contactName} at ${companyName}` : 'Generic version'}

Create a comprehensive ${type} that:
1. Addresses specific pain points of the target market
2. Provides immediate value and actionable insights
3. Positions the business as the expert solution
4. Includes a soft call-to-action
5. Follows The LinkedIn Formula content principles

${contactName ? 'Personalize it by mentioning their name and company where appropriate.' : 'Keep it generic but highly relevant to the target market.'}

Format with clear sections and actionable content.`;

    const response = await this.callClaude(prompt);
    return response;
  }

  async generateLinkedInMessage(contact, context, businessInfo) {
    const prompt = `Using The LinkedIn Formula by Adam Houlahan's messaging approach, write a LinkedIn message.

Contact: ${contact.name} at ${contact.company}
Their Role: ${contact.title || 'Not specified'}
Category: ${contact.category}
Context: ${context}

Your Business: ${businessInfo.company}
Your Offer: ${businessInfo.targetClients}

Following the formula:
- Appreciate connecting
- Provide value (no immediate pitch)
- Soft CTA if appropriate
- Conversational tone
- Under 150 words

Write the message:`;

    const response = await this.callClaude(prompt);
    return response;
  }

  async analyzeWritingStyle(writingSamples) {
    const prompt = `Analyze these writing samples to determine the author's LinkedIn content style based on The LinkedIn Formula principles.

WRITING SAMPLES:
${writingSamples.map((sample, index) => `
Sample ${index + 1}:
${sample}
`).join('\n')}

ANALYSIS REQUIREMENTS:
Analyze tone, vocabulary, sentence structure, personality, formality level, and persuasion techniques.

Please respond with ONLY a JSON object in this exact format:
{
  "styleProfile": {
    "tone": "Professional, Conversational, Authoritative, Friendly, etc.",
    "formalityLevel": "Formal|Semi-formal|Casual",
    "vocabularyLevel": "Technical|Business|Accessible|Mixed",
    "sentenceStructure": "Short and punchy|Varied length|Long and detailed",
    "personalityTraits": ["Authentic", "Data-driven", "Storytelling", "Direct", "Empathetic"],
    "persuasionStyle": "Logic-based|Emotion-driven|Authority-based|Social proof|Mixed"
  },
  "contentPatterns": {
    "commonPhrases": ["phrase1", "phrase2", "phrase3"],
    "preferredStructure": "Hook + Value + CTA|Story + Lesson + Application|etc.",
    "contentTypes": ["Education", "Storytelling", "Personal", "Expertise", "Sales"],
    "engagementTechniques": ["Questions", "Controversies", "Data points", "Personal stories"]
  },
  "writingFormula": "Brief description of their unique content formula"
}`;

    try {
      const response = await this.callClaude(prompt);
      return JSON.parse(response);
    } catch (error) {
      console.error('Error parsing writing style analysis:', error);
      return null;
    }
  }
}

// Storage manager with error handling and versioning
class StorageManager {
  static save(key, data) {
    try {
      const dataToSave = {
        version: STORAGE_VERSION,
        timestamp: new Date().toISOString(),
        data: data
      };
      localStorage.setItem(key, JSON.stringify(dataToSave));
      return true;
    } catch (error) {
      console.error(`Error saving to localStorage (${key}):`, error);
      return false;
    }
  }

  static load(key, defaultValue = null) {
    try {
      const stored = localStorage.getItem(key);
      if (!stored) return defaultValue;
      
      const parsed = JSON.parse(stored);
      
      // Handle version mismatch or direct data (backwards compatibility)
      if (!parsed.version || !parsed.data) {
        // Old format, return as is
        return parsed;
      }
      
      return parsed.data;
    } catch (error) {
      console.error(`Error loading from localStorage (${key}):`, error);
      return defaultValue;
    }
  }

  static remove(key) {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error(`Error removing from localStorage (${key}):`, error);
      return false;
    }
  }

  static clear() {
    try {
      Object.values(STORAGE_KEYS).forEach(key => {
        localStorage.removeItem(key);
      });
      return true;
    } catch (error) {
      console.error('Error clearing localStorage:', error);
      return false;
    }
  }
}

// Modal Component
const Modal = ({ isOpen, onClose, title, children, size = 'medium' }) => {
  if (!isOpen) return null;

  const sizeClasses = {
    small: 'max-w-md',
    medium: 'max-w-2xl',
    large: 'max-w-4xl'
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose} />
      <div className={`relative bg-white rounded-xl shadow-2xl ${sizeClasses[size]} w-full mx-4 max-h-[90vh] overflow-hidden`}>
        <div className="flex items-center justify-between p-6 border-b">
          <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {children}
        </div>
      </div>
    </div>
  );
};

// Loading Modal Component
const LoadingModal = ({ isOpen, message = 'Working on it...' }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black bg-opacity-50" />
      <div className="relative bg-white rounded-xl shadow-2xl p-8 flex flex-col items-center space-y-4">
        <Loader className="w-12 h-12 text-purple-600 animate-spin" />
        <p className="text-lg font-medium text-gray-900">{message}</p>
      </div>
    </div>
  );
};

// Success Modal Component
const SuccessModal = ({ isOpen, onClose, message = 'Success!' }) => {
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        onClose();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
      <div className="relative bg-white rounded-xl shadow-2xl p-8 flex flex-col items-center space-y-4 pointer-events-auto">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
          <CheckCircle className="w-10 h-10 text-green-600" />
        </div>
        <p className="text-lg font-medium text-gray-900">{message}</p>
      </div>
    </div>
  );
};

// Contact Card Component
const ContactCard = ({ contact, onEdit, onCategorise, onGenerateLeadMagnet }) => {
  const getCategoryColor = (category) => {
    const colors = {
      'Ideal Client': 'bg-green-500',
      'Referral Partner': 'bg-blue-500',
      'Competitor': 'bg-red-500',
      'Other': 'bg-gray-500'
    };
    return colors[category] || 'bg-gray-500';
  };

  return (
    <div className="bg-white bg-opacity-10 backdrop-blur rounded-xl p-6 hover:bg-opacity-20 transition-all">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h4 className="text-lg font-semibold text-white">{contact.name}</h4>
          {contact.company && (
            <p className="text-white text-opacity-70 text-sm">{contact.company}</p>
          )}
          {contact.title && (
            <p className="text-white text-opacity-70 text-sm">{contact.title}</p>
          )}
        </div>
        {contact.category && (
          <span className={`${getCategoryColor(contact.category)} text-white text-xs px-3 py-1 rounded-full`}>
            {contact.category}
          </span>
        )}
      </div>

      {contact.enriched && (
        <div className="mb-4 space-y-2">
          {contact.industry && (
            <p className="text-white text-opacity-70 text-sm">
              <span className="font-medium">Industry:</span> {contact.industry}
            </p>
          )}
          {contact.companySize && (
            <p className="text-white text-opacity-70 text-sm">
              <span className="font-medium">Company Size:</span> {contact.companySize}
            </p>
          )}
          {contact.linkedinUrl && (
            <a
              href={contact.linkedinUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300 text-sm underline"
            >
              View LinkedIn Profile
            </a>
          )}
        </div>
      )}

      <div className="flex space-x-2">
        <button
          onClick={() => onEdit(contact)}
          className="flex-1 bg-white bg-opacity-20 hover:bg-opacity-30 text-white py-2 px-3 rounded-lg transition-all text-sm"
        >
          View Details
        </button>
        {!contact.category && (
          <button
            onClick={() => onCategorise(contact)}
            className="flex-1 bg-purple-500 hover:bg-purple-600 text-white py-2 px-3 rounded-lg transition-all text-sm"
          >
            Categorise
          </button>
        )}
        {contact.category === 'Ideal Client' && (
          <button
            onClick={() => onGenerateLeadMagnet(contact)}
            className="flex-1 bg-indigo-500 hover:bg-indigo-600 text-white py-2 px-3 rounded-lg transition-all text-sm"
          >
            Lead Magnet
          </button>
        )}
      </div>
    </div>
  );
};

// Task Card Component
const TaskCard = ({ task, onComplete, onSnooze }) => {
  const getTaskIcon = (type) => {
    const icons = {
      'Set notifications': Bell,
      'Engage with post': MessageSquare,
      'Send message': Send,
      'Follow up': Clock
    };
    const Icon = icons[type] || CheckCircle;
    return <Icon className="w-5 h-5" />;
  };

  return (
    <div className="bg-white bg-opacity-10 backdrop-blur rounded-xl p-6">
      <div className="flex items-start space-x-4">
        <div className="bg-purple-500 bg-opacity-20 p-3 rounded-lg">
          {getTaskIcon(task.type)}
        </div>
        <div className="flex-1">
          <h4 className="text-lg font-semibold text-white mb-1">{task.type}</h4>
          <p className="text-white text-opacity-70 text-sm mb-2">
            {task.contact.name} - {task.contact.company}
          </p>
          <p className="text-white text-opacity-60 text-xs">
            Due: {new Date(task.dueDate).toLocaleDateString()}
          </p>
        </div>
      </div>
      <div className="flex space-x-2 mt-4">
        <button
          onClick={() => onComplete(task.id)}
          className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-lg transition-all text-sm"
        >
          Complete
        </button>
        <button
          onClick={() => onSnooze(task.id)}
          className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded-lg transition-all text-sm"
        >
          Snooze 24h
        </button>
      </div>
    </div>
  );
};

// Main Glass Slipper App Component
const GlassSlipperApp = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authView, setAuthView] = useState('landing');
  const [currentUser, setCurrentUser] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const fileInputRef = useRef(null);

  // Initialize AI client
  const ai = new LinkedInFormulaAI();

  // Auth form states
  const [authForm, setAuthForm] = useState({
    email: '',
    password: '',
    name: '',
    company: ''
  });

  // Landing page component
  const LandingPage = () => {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <div className="flex justify-center items-center space-x-3 mb-6">
              <Sparkles className="w-12 h-12 text-yellow-400 animate-pulse" />
              <h1 className="text-5xl font-bold text-white">Glass Slipper</h1>
            </div>
            <p className="text-xl text-purple-200 mb-8">Find Your Perfect-Fit Clients with AI-Powered ABM</p>
            <div className="flex justify-center space-x-4">
              <button
                onClick={() => setAuthView('signup')}
                className="bg-yellow-400 hover:bg-yellow-500 text-purple-900 px-8 py-3 rounded-lg font-semibold transition-all transform hover:scale-105"
              >
                Start Free Trial
              </button>
              <button
                onClick={() => setAuthView('signin')}
                className="bg-purple-700 hover:bg-purple-600 text-white px-8 py-3 rounded-lg font-semibold transition-all"
              >
                Sign In
              </button>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <div className="bg-white bg-opacity-10 backdrop-blur rounded-xl p-8 text-center">
              <Upload className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Import Contacts</h3>
              <p className="text-purple-200">Upload your LinkedIn connections and watch the magic happen</p>
            </div>
            <div className="bg-white bg-opacity-10 backdrop-blur rounded-xl p-8 text-center">
              <Target className="w-16 h-16 text-green-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">AI Categorisation</h3>
              <p className="text-purple-200">Automatically identify ideal clients and warm prospects</p>
            </div>
            <div className="bg-white bg-opacity-10 backdrop-blur rounded-xl p-8 text-center">
              <Zap className="w-16 h-16 text-blue-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Personalised Outreach</h3>
              <p className="text-purple-200">Generate custom messages that actually convert</p>
            </div>
          </div>

          {/* Testimonial */}
          <div className="bg-white bg-opacity-10 backdrop-blur rounded-xl p-8 text-center max-w-2xl mx-auto">
            <p className="text-lg text-white mb-4 italic">
              "Glass Slipper transformed our LinkedIn outreach. We went from 2% to 27% response rates in just 30 days!"
            </p>
            <p className="text-purple-200">- Sarah Chen, CEO of TechStart</p>
          </div>

          {/* Footer */}
          <div className="text-center mt-16 text-purple-300">
            <p>Glass Slipper v1.0 Beta | Built with The LinkedIn Formula</p>
          </div>
        </div>
      </div>
    );
  };

  // Sign in page component
  const SignInPage = () => {
    const handleSignIn = (e) => {
      e.preventDefault();
      setCurrentUser({
        email: authForm.email,
        name: authForm.email.split('@')[0],
        company: 'Demo Company'
      });
      setIsAuthenticated(true);
    };

    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 flex items-center justify-center px-4">
        <div className="max-w-md w-full">
          <div className="bg-white bg-opacity-10 backdrop-blur rounded-2xl p-8 shadow-2xl">
            <div className="text-center mb-8">
              <Sparkles className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
              <h2 className="text-3xl font-bold text-white">Welcome Back</h2>
              <p className="text-purple-200 mt-2">Sign in to your Glass Slipper account</p>
            </div>

            <form onSubmit={handleSignIn} className="space-y-6">
              <div>
                <label className="block text-white text-opacity-90 text-sm font-medium mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white text-opacity-50" />
                  <input
                    type="email"
                    value={authForm.email}
                    onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })}
                    className="w-full bg-white bg-opacity-20 border border-white border-opacity-30 rounded-lg py-3 pl-10 pr-4 text-white placeholder-white placeholder-opacity-50 focus:outline-none focus:border-yellow-400 focus:bg-opacity-30 transition-all"
                    placeholder="you@company.com"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-white text-opacity-90 text-sm font-medium mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white text-opacity-50" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={authForm.password}
                    onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })}
                    className="w-full bg-white bg-opacity-20 border border-white border-opacity-30 rounded-lg py-3 pl-10 pr-12 text-white placeholder-white placeholder-opacity-50 focus:outline-none focus:border-yellow-400 focus:bg-opacity-30 transition-all"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white text-opacity-50 hover:text-opacity-80"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-yellow-400 hover:bg-yellow-500 text-purple-900 py-3 rounded-lg font-semibold transition-all transform hover:scale-105 flex items-center justify-center space-x-2"
              >
                <span>Sign In</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-white text-opacity-70">
                Don't have an account?{' '}
                <button
                  onClick={() => setAuthView('signup')}
                  className="text-yellow-300 hover:text-yellow-200 font-medium transition-colors"
                >
                  Sign up here
                </button>
              </p>
              <p className="text-white text-opacity-50 text-sm mt-4">
                Demo: Use any email/password to explore
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Sign up page component
  const SignUpPage = () => {
    const handleSignUp = (e) => {
      e.preventDefault();
      setCurrentUser({
        email: authForm.email,
        name: authForm.name,
        company: authForm.company
      });
      setIsAuthenticated(true);
    };

    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 flex items-center justify-center px-4">
        <div className="max-w-md w-full">
          <div className="bg-white bg-opacity-10 backdrop-blur rounded-2xl p-8 shadow-2xl">
            <div className="text-center mb-8">
              <Sparkles className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
              <h2 className="text-3xl font-bold text-white">Create Account</h2>
              <p className="text-purple-200 mt-2">Start your 14-day free trial</p>
            </div>

            <form onSubmit={handleSignUp} className="space-y-6">
              <div>
                <label className="block text-white text-opacity-90 text-sm font-medium mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white text-opacity-50" />
                  <input
                    type="text"
                    value={authForm.name}
                    onChange={(e) => setAuthForm({ ...authForm, name: e.target.value })}
                    className="w-full bg-white bg-opacity-20 border border-white border-opacity-30 rounded-lg py-3 pl-10 pr-4 text-white placeholder-white placeholder-opacity-50 focus:outline-none focus:border-yellow-400 focus:bg-opacity-30 transition-all"
                    placeholder="John Smith"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-white text-opacity-90 text-sm font-medium mb-2">
                  Company Name
                </label>
                <div className="relative">
                  <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white text-opacity-50" />
                  <input
                    type="text"
                    value={authForm.company}
                    onChange={(e) => setAuthForm({ ...authForm, company: e.target.value })}
                    className="w-full bg-white bg-opacity-20 border border-white border-opacity-30 rounded-lg py-3 pl-10 pr-4 text-white placeholder-white placeholder-opacity-50 focus:outline-none focus:border-yellow-400 focus:bg-opacity-30 transition-all"
                    placeholder="Acme Corp"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-white text-opacity-90 text-sm font-medium mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white text-opacity-50" />
                  <input
                    type="email"
                    value={authForm.email}
                    onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })}
                    className="w-full bg-white bg-opacity-20 border border-white border-opacity-30 rounded-lg py-3 pl-10 pr-4 text-white placeholder-white placeholder-opacity-50 focus:outline-none focus:border-yellow-400 focus:bg-opacity-30 transition-all"
                    placeholder="you@company.com"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-white text-opacity-90 text-sm font-medium mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white text-opacity-50" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={authForm.password}
                    onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })}
                    className="w-full bg-white bg-opacity-20 border border-white border-opacity-30 rounded-lg py-3 pl-10 pr-12 text-white placeholder-white placeholder-opacity-50 focus:outline-none focus:border-yellow-400 focus:bg-opacity-30 transition-all"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white text-opacity-50 hover:text-opacity-80"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-yellow-400 hover:bg-yellow-500 text-purple-900 py-3 rounded-lg font-semibold transition-all transform hover:scale-105 flex items-center justify-center space-x-2"
              >
                <span>Create Account</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-white text-opacity-70">
                Already have an account?{' '}
                <button
                  onClick={() => setAuthView('signin')}
                  className="text-yellow-300 hover:text-yellow-200 font-medium transition-colors"
                >
                  Sign in here
                </button>
              </p>
            </div>

            <div className="mt-6 pt-6 border-t border-white border-opacity-20 text-center">
              <p className="text-white text-opacity-50 text-xs">
                By creating an account, you agree to our Terms of Service and Privacy Policy
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Dashboard component
  const Dashboard = () => {
    const [currentView, setCurrentView] = useState('dashboard');
    const [showMobileMenu, setShowMobileMenu] = useState(false);
    const [selectedContact, setSelectedContact] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState('all');
    const [loadingModal, setLoadingModal] = useState({ isOpen: false, message: '' });
    const [successModal, setSuccessModal] = useState({ isOpen: false, message: '' });

    // User account state (initialized from localStorage and login)
    const [user, setUser] = useState(() => {
      const savedUser = StorageManager.load(STORAGE_KEYS.USER_DATA);
      return savedUser || currentUser || {
        name: '',
        company: '',
        businessType: '',
        targetClients: '',
        referralPartners: '',
        goals: '',
        writingSamples: [],
        writingStyle: null
      };
    });

    // Initialize enrichment data
    const [enrichmentData, setEnrichmentData] = useState(() => {
      const saved = StorageManager.load(STORAGE_KEYS.ENRICHMENT_DATA);
      if (!saved || !saved.resetDate) {
        const newData = {
          count: 50,
          resetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        };
        StorageManager.save(STORAGE_KEYS.ENRICHMENT_DATA, newData);
        return newData;
      }
      
      // Check if reset date has passed
      if (new Date(saved.resetDate) <= new Date()) {
        const newData = {
          count: 50,
          resetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        };
        StorageManager.save(STORAGE_KEYS.ENRICHMENT_DATA, newData);
        return newData;
      }
      
      return saved;
    });

    // Initialize contacts state from localStorage
    const [contacts, setContacts] = useState(() => {
      return StorageManager.load(STORAGE_KEYS.CONTACTS, []);
    });

    const [categories] = useState([
      { id: 1, name: 'Ideal Client', color: 'bg-green-500', count: 0 },
      { id: 2, name: 'Referral Partner', color: 'bg-blue-500', count: 0 },
      { id: 3, name: 'Competitor', color: 'bg-red-500', count: 0 },
      { id: 4, name: 'Other', color: 'bg-gray-500', count: 0 }
    ]);

    const [tasks, setTasks] = useState(() => {
      return StorageManager.load(STORAGE_KEYS.TASKS, []);
    });

    const [strategy, setStrategy] = useState(() => {
      return StorageManager.load(STORAGE_KEYS.STRATEGY, {
        oneOffer: '',
        referralPartners: '',
        specialFactors: '',
        fullStrategy: ''
      });
    });

    const [leadMagnets, setLeadMagnets] = useState(() => {
      return StorageManager.load(STORAGE_KEYS.LEAD_MAGNETS, []);
    });

    const [showStrategyModal, setShowStrategyModal] = useState(false);
    const [showLeadMagnetModal, setShowLeadMagnetModal] = useState(false);
    const [selectedLeadMagnet, setSelectedLeadMagnet] = useState(null);
    const [showGenerateLeadMagnetModal, setShowGenerateLeadMagnetModal] = useState(false);

    // Save data to localStorage whenever it changes
    useEffect(() => {
      StorageManager.save(STORAGE_KEYS.USER_DATA, user);
    }, [user]);

    useEffect(() => {
      StorageManager.save(STORAGE_KEYS.CONTACTS, contacts);
    }, [contacts]);

    useEffect(() => {
      StorageManager.save(STORAGE_KEYS.TASKS, tasks);
    }, [tasks]);

    useEffect(() => {
      StorageManager.save(STORAGE_KEYS.STRATEGY, strategy);
    }, [strategy]);

    useEffect(() => {
      StorageManager.save(STORAGE_KEYS.LEAD_MAGNETS, leadMagnets);
    }, [leadMagnets]);

    useEffect(() => {
      StorageManager.save(STORAGE_KEYS.ENRICHMENT_DATA, enrichmentData);
    }, [enrichmentData]);

    // Calculate stats
    const totalContacts = contacts.length;
    const idealClients = contacts.filter(c => c.category === 'Ideal Client').length;
    const enrichedContacts = contacts.filter(c => c.enriched).length;
    const tasksCompleted = tasks.filter(t => t.completed).length;

    // Get active tasks (not completed, due date has passed)
    const activeTasks = tasks
      .filter(task => !task.completed && new Date(task.dueDate) <= new Date())
      .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
      .slice(0, 5);

    // Filter contacts based on search and category
    const filteredContacts = contacts.filter(contact => {
      const matchesSearch = contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (contact.company && contact.company.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesFilter = filterCategory === 'all' || contact.category === filterCategory;
      return matchesSearch && matchesFilter;
    });

    // Helper function to check if can enrich
    const canEnrich = () => enrichmentData.count > 0;

    // Helper function to use enrichment
    const useEnrichment = () => {
      if (enrichmentData.count > 0) {
        setEnrichmentData(prev => ({
          ...prev,
          count: prev.count - 1
        }));
        return true;
      }
      return false;
    };

    // Create tasks for a contact
    const createTasksForContact = (contact) => {
      const taskTypes = [
        { type: 'Set notifications', delay: 0 },
        { type: 'Engage with post', delay: 1 },
        { type: 'Send message', delay: 2 },
        { type: 'Follow up', delay: 3 }
      ];

      const newTasks = taskTypes.map((taskType, index) => ({
        id: `${contact.id}-task-${Date.now()}-${index}`,
        contactId: contact.id,
        contact: contact,
        type: taskType.type,
        dueDate: new Date(Date.now() + taskType.delay * 24 * 60 * 60 * 1000).toISOString(),
        completed: false,
        order: taskType.delay
      }));

      // Only add the first task initially
      setTasks(prev => [...prev, newTasks[0]]);

      // Store the remaining tasks to be revealed later
      contact.queuedTasks = newTasks.slice(1);
    };

    // Complete a task and reveal the next one
    const completeTask = (taskId) => {
      const task = tasks.find(t => t.id === taskId);
      if (!task) return;

      // Mark task as completed
      setTasks(prev => prev.map(t => 
        t.id === taskId ? { ...t, completed: true } : t
      ));

      // Find the contact and add the next queued task if available
      const contact = contacts.find(c => c.id === task.contactId);
      if (contact && contact.queuedTasks && contact.queuedTasks.length > 0) {
        const nextTask = contact.queuedTasks[0];
        nextTask.dueDate = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
        
        setTasks(prev => [...prev, nextTask]);
        
        // Update contact's queued tasks
        setContacts(prev => prev.map(c => 
          c.id === contact.id 
            ? { ...c, queuedTasks: c.queuedTasks.slice(1) }
            : c
        ));
      }

      setSuccessModal({ isOpen: true, message: 'Task completed!' });
    };

    // Snooze a task for 24 hours
    const snoozeTask = (taskId) => {
      setTasks(prev => prev.map(task => 
        task.id === taskId 
          ? { ...task, dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() }
          : task
      ));
      setSuccessModal({ isOpen: true, message: 'Task snoozed for 24 hours' });
    };

    // Handle file upload
    const handleFileUpload = async (event) => {
      const file = event.target.files[0];
      if (!file) return;

      if (!file.name.endsWith('.csv')) {
        alert('Please upload a CSV file');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const text = e.target.result;
          const lines = text.split('\n');
          const headers = lines[0].split(',').map(h => h.trim());
          
          const nameIndex = headers.findIndex(h => h.toLowerCase().includes('name'));
          const companyIndex = headers.findIndex(h => h.toLowerCase().includes('company'));
          const titleIndex = headers.findIndex(h => h.toLowerCase().includes('title') || h.toLowerCase().includes('position'));
          const emailIndex = headers.findIndex(h => h.toLowerCase().includes('email'));
          const urlIndex = headers.findIndex(h => h.toLowerCase().includes('url') || h.toLowerCase().includes('linkedin'));

          const newContacts = [];
          for (let i = 1; i < lines.length; i++) {
            const values = lines[i].split(',').map(v => v.trim());
            if (values.length > 1 && values[nameIndex]) {
              newContacts.push({
                id: Date.now() + i,
                name: values[nameIndex] || '',
                company: companyIndex >= 0 ? values[companyIndex] : '',
                title: titleIndex >= 0 ? values[titleIndex] : '',
                email: emailIndex >= 0 ? values[emailIndex] : '',
                linkedinUrl: urlIndex >= 0 ? values[urlIndex] : '',
                category: null,
                enriched: false,
                dateAdded: new Date().toISOString()
              });
            }
          }

          setContacts(prev => [...prev, ...newContacts]);
          setSuccessModal({ isOpen: true, message: `${newContacts.length} contacts imported successfully!` });
        } catch (error) {
          console.error('Error parsing CSV:', error);
          alert('Error parsing CSV file. Please ensure it\'s properly formatted.');
        }
      };

      reader.readAsText(file);
      event.target.value = '';
    };

    // Categorise contact with AI
    const categoriseContactWithAI = async (contact) => {
      if (!canEnrich()) {
        alert('No enrichments left. Please wait for your monthly reset.');
        return;
      }

      setLoadingModal({ isOpen: true, message: 'Categorising contact...' });

      try {
        const category = await ai.categoriseContact(
          contact, 
          user.targetClients, 
          user.businessType,
          user.referralPartners
        );
        
        const updatedContact = { ...contact, category, enriched: true };
        setContacts(prev => prev.map(c => c.id === contact.id ? updatedContact : c));
        
        useEnrichment();
        
        // Create tasks if ideal client
        if (category === 'Ideal Client') {
          createTasksForContact(updatedContact);
        }
        
        setLoadingModal({ isOpen: false });
        setSuccessModal({ isOpen: true, message: `Contact categorised as ${category}` });
      } catch (error) {
        setLoadingModal({ isOpen: false });
        console.error('Categorisation error:', error);
        alert('Failed to categorise contact. Please check your API configuration.');
      }
    };

    // Bulk categorise all uncategorised contacts
    const bulkCategorise = async () => {
      const uncategorised = contacts.filter(c => !c.category);
      if (uncategorised.length === 0) {
        alert('No contacts to categorise');
        return;
      }

      const maxToProcess = Math.min(uncategorised.length, enrichmentData.count);
      if (maxToProcess === 0) {
        alert('No enrichments left. Please wait for your monthly reset.');
        return;
      }

      setLoadingModal({ isOpen: true, message: `Categorising ${maxToProcess} contacts...` });

      let processed = 0;
      for (const contact of uncategorised.slice(0, maxToProcess)) {
        if (!canEnrich()) break;
        
        try {
          const category = await ai.categoriseContact(
            contact, 
            user.targetClients, 
            user.businessType,
            user.referralPartners
          );
          
          const updatedContact = { ...contact, category, enriched: true };
          setContacts(prev => prev.map(c => c.id === contact.id ? updatedContact : c));
          
          useEnrichment();
          processed++;
          
          // Create tasks if ideal client
          if (category === 'Ideal Client') {
            createTasksForContact(updatedContact);
          }
          
          setLoadingModal({ isOpen: true, message: `Categorising contacts... (${processed}/${maxToProcess})` });
        } catch (error) {
          console.error('Error categorising contact:', contact.name, error);
        }
      }

      setLoadingModal({ isOpen: false });
      setSuccessModal({ isOpen: true, message: `Categorised ${processed} contacts successfully!` });
    };

    // Bulk enrich ideal clients
    const bulkEnrichIdealClients = async () => {
      const unenrichedIdealClients = contacts.filter(c => c.category === 'Ideal Client' && !c.enriched);
      if (unenrichedIdealClients.length === 0) {
        alert('No ideal clients to enrich');
        return;
      }

      const maxToProcess = Math.min(Math.min(unenrichedIdealClients.length, 50), enrichmentData.count);
      if (maxToProcess === 0) {
        alert('No enrichments left. Please wait for your monthly reset.');
        return;
      }

      setLoadingModal({ isOpen: true, message: `Enriching ${maxToProcess} ideal clients...` });

      let processed = 0;
      for (const contact of unenrichedIdealClients.slice(0, maxToProcess)) {
        if (!canEnrich()) break;
        
        // Simulate enrichment (in real app, this would call an API)
        const enrichedData = {
          industry: ['Technology', 'Finance', 'Healthcare', 'Retail'][Math.floor(Math.random() * 4)],
          companySize: ['1-10', '11-50', '51-200', '201-500', '500+'][Math.floor(Math.random() * 5)],
          location: ['London', 'Manchester', 'Birmingham', 'Edinburgh'][Math.floor(Math.random() * 4)]
        };
        
        const updatedContact = { ...contact, ...enrichedData, enriched: true };
        setContacts(prev => prev.map(c => c.id === contact.id ? updatedContact : c));
        
        useEnrichment();
        processed++;
        
        // Create tasks
        createTasksForContact(updatedContact);
        
        setLoadingModal({ isOpen: true, message: `Enriching ideal clients... (${processed}/${maxToProcess})` });
        
        // Small delay to show progress
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      setLoadingModal({ isOpen: false });
      setSuccessModal({ isOpen: true, message: `Enriched ${processed} ideal clients successfully!` });
    };

    // Enrich single contact
    const enrichSingleContact = async (contact) => {
      if (!canEnrich()) {
        alert('No enrichments left. Please wait for your monthly reset.');
        return;
      }

      setLoadingModal({ isOpen: true, message: 'Enriching contact data...' });

      // Simulate enrichment
      const enrichedData = {
        industry: ['Technology', 'Finance', 'Healthcare', 'Retail'][Math.floor(Math.random() * 4)],
        companySize: ['1-10', '11-50', '51-200', '201-500', '500+'][Math.floor(Math.random() * 5)],
        location: ['London', 'Manchester', 'Birmingham', 'Edinburgh'][Math.floor(Math.random() * 4)]
      };
      
      const updatedContact = { ...contact, ...enrichedData, enriched: true };
      setContacts(prev => prev.map(c => c.id === contact.id ? updatedContact : c));
      setSelectedContact(updatedContact);
      
      useEnrichment();
      
      setLoadingModal({ isOpen: false });
      setSuccessModal({ isOpen: true, message: 'Contact enriched successfully!' });
    };

    // Generate strategy
    const generateStrategy = async () => {
      if (!strategy.oneOffer || !strategy.referralPartners || !strategy.specialFactors) {
        alert('Please fill in all strategy fields first');
        return;
      }

      setLoadingModal({ isOpen: true, message: 'Building your LinkedIn strategy...' });

      try {
        const fullStrategy = await ai.generateStrategy(strategy, user, user.writingStyle);
        setStrategy(prev => ({ ...prev, fullStrategy }));
        setLoadingModal({ isOpen: false });
        setSuccessModal({ isOpen: true, message: 'Strategy generated successfully!' });
      } catch (error) {
        setLoadingModal({ isOpen: false });
        console.error('Strategy generation error:', error);
        alert('Failed to generate strategy. Please check your API configuration.');
      }
    };

    // Generate lead magnet
    const generateLeadMagnet = async (type, contact = null) => {
      setLoadingModal({ isOpen: true, message: 'Creating lead magnet...' });

      try {
        const content = await ai.generateLeadMagnet(
          type,
          user,
          strategy,
          contact?.name,
          contact?.company
        );

        const newLeadMagnet = {
          id: Date.now(),
          type,
          title: `${type} - ${contact ? `${contact.name} (${contact.company})` : 'Generic'}`,
          content,
          contactId: contact?.id || null,
          createdAt: new Date().toISOString()
        };

        setLeadMagnets(prev => [...prev, newLeadMagnet]);
        setLoadingModal({ isOpen: false });
        setSuccessModal({ isOpen: true, message: 'Lead magnet created!' });
        setShowGenerateLeadMagnetModal(false);
      } catch (error) {
        setLoadingModal({ isOpen: false });
        console.error('Lead magnet generation error:', error);
        alert('Failed to generate lead magnet. Please check your API configuration.');
      }
    };

    // Analyze writing style
    const analyzeWritingStyle = async () => {
      if (user.writingSamples.length === 0) {
        alert('Please add at least one writing sample first');
        return;
      }

      setLoadingModal({ isOpen: true, message: 'Analyzing your writing style...' });

      try {
        const analysis = await ai.analyzeWritingStyle(user.writingSamples);
        setUser(prev => ({ ...prev, writingStyle: analysis }));
        setLoadingModal({ isOpen: false });
        setSuccessModal({ isOpen: true, message: 'Writing style analyzed!' });
      } catch (error) {
        setLoadingModal({ isOpen: false });
        console.error('Writing style analysis error:', error);
        alert('Failed to analyze writing style. Please check your API configuration.');
      }
    };

    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900">
        {/* Header */}
        <div className="border-b border-white border-opacity-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Sparkles className="w-8 h-8 text-yellow-400" />
                  <h1 className="text-2xl font-bold text-white">Glass Slipper</h1>
                </div>

                {/* Desktop Navigation */}
                <nav className="hidden md:flex space-x-6 ml-8">
                  <button
                    onClick={() => setCurrentView('dashboard')}
                    className={`px-4 py-2 rounded-lg transition-all ${
                      currentView === 'dashboard'
                        ? 'bg-white bg-opacity-20 text-white'
                        : 'text-white text-opacity-70 hover:text-white hover:bg-white hover:bg-opacity-10'
                    }`}
                  >
                    Dashboard
                  </button>
                  <button
                    onClick={() => setCurrentView('contacts')}
                    className={`px-4 py-2 rounded-lg transition-all ${
                      currentView === 'contacts'
                        ? 'bg-white bg-opacity-20 text-white'
                        : 'text-white text-opacity-70 hover:text-white hover:bg-white hover:bg-opacity-10'
                    }`}
                  >
                    Contacts
                  </button>
                  <button
                    onClick={() => setCurrentView('strategy')}
                    className={`px-4 py-2 rounded-lg transition-all ${
                      currentView === 'strategy'
                        ? 'bg-white bg-opacity-20 text-white'
                        : 'text-white text-opacity-70 hover:text-white hover:bg-white hover:bg-opacity-10'
                    }`}
                  >
                    Strategy
                  </button>
                  <button
                    onClick={() => setCurrentView('lead-magnets')}
                    className={`px-4 py-2 rounded-lg transition-all ${
                      currentView === 'lead-magnets'
                        ? 'bg-white bg-opacity-20 text-white'
                        : 'text-white text-opacity-70 hover:text-white hover:bg-white hover:bg-opacity-10'
                    }`}
                  >
                    Lead Magnets
                  </button>
                  <button
                    onClick={() => setCurrentView('tasks')}
                    className={`px-4 py-2 rounded-lg transition-all ${
                      currentView === 'tasks'
                        ? 'bg-white bg-opacity-20 text-white'
                        : 'text-white text-opacity-70 hover:text-white hover:bg-white hover:bg-opacity-10'
                    }`}
                  >
                    Tasks
                  </button>
                  <button
                    onClick={() => setCurrentView('settings')}
                    className={`px-4 py-2 rounded-lg transition-all ${
                      currentView === 'settings'
                        ? 'bg-white bg-opacity-20 text-white'
                        : 'text-white text-opacity-70 hover:text-white hover:bg-white hover:bg-opacity-10'
                    }`}
                  >
                    Settings
                  </button>
                </nav>
              </div>

              {/* User menu */}
              <div className="flex items-center space-x-4">
                <div className="hidden md:block text-right">
                  <p className="text-white text-sm font-medium">{user.name || currentUser.name}</p>
                  <p className="text-white text-opacity-70 text-xs">{user.company || currentUser.company}</p>
                </div>
                <button
                  onClick={() => {
                    if (confirm('Are you sure you want to sign out?')) {
                      setIsAuthenticated(false);
                      setAuthView('landing');
                    }
                  }}
                  className="text-white text-opacity-70 hover:text-white transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                </button>

                {/* Mobile menu button */}
                <button
                  onClick={() => setShowMobileMenu(!showMobileMenu)}
                  className="md:hidden text-white"
                >
                  <Menu className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Mobile Navigation */}
            {showMobileMenu && (
              <div className="md:hidden pb-4">
                <div className="space-y-2">
                  <button
                    onClick={() => { setCurrentView('dashboard'); setShowMobileMenu(false); }}
                    className={`block w-full text-left px-4 py-2 rounded-lg transition-all ${
                      currentView === 'dashboard'
                        ? 'bg-white bg-opacity-20 text-white'
                        : 'text-white text-opacity-70'
                    }`}
                  >
                    Dashboard
                  </button>
                  <button
                    onClick={() => { setCurrentView('contacts'); setShowMobileMenu(false); }}
                    className={`block w-full text-left px-4 py-2 rounded-lg transition-all ${
                      currentView === 'contacts'
                        ? 'bg-white bg-opacity-20 text-white'
                        : 'text-white text-opacity-70'
                    }`}
                  >
                    Contacts
                  </button>
                  <button
                    onClick={() => { setCurrentView('strategy'); setShowMobileMenu(false); }}
                    className={`block w-full text-left px-4 py-2 rounded-lg transition-all ${
                      currentView === 'strategy'
                        ? 'bg-white bg-opacity-20 text-white'
                        : 'text-white text-opacity-70'
                    }`}
                  >
                    Strategy
                  </button>
                  <button
                    onClick={() => { setCurrentView('lead-magnets'); setShowMobileMenu(false); }}
                    className={`block w-full text-left px-4 py-2 rounded-lg transition-all ${
                      currentView === 'lead-magnets'
                        ? 'bg-white bg-opacity-20 text-white'
                        : 'text-white text-opacity-70'
                    }`}
                  >
                    Lead Magnets
                  </button>
                  <button
                    onClick={() => { setCurrentView('tasks'); setShowMobileMenu(false); }}
                    className={`block w-full text-left px-4 py-2 rounded-lg transition-all ${
                      currentView === 'tasks'
                        ? 'bg-white bg-opacity-20 text-white'
                        : 'text-white text-opacity-70'
                    }`}
                  >
                    Tasks
                  </button>
                  <button
                    onClick={() => { setCurrentView('settings'); setShowMobileMenu(false); }}
                    className={`block w-full text-left px-4 py-2 rounded-lg transition-all ${
                      currentView === 'settings'
                        ? 'bg-white bg-opacity-20 text-white'
                        : 'text-white text-opacity-70'
                    }`}
                  >
                    Settings
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Dashboard View */}
          {currentView === 'dashboard' && (
            <div className="space-y-8">
              {/* Stats Overview */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white bg-opacity-10 backdrop-blur rounded-xl p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white text-opacity-70 text-sm">Enrichments Left</p>
                      <p className="text-3xl font-bold text-white">{enrichmentData.count}</p>
                      <p className="text-white text-opacity-50 text-xs mt-1">
                        Resets: {new Date(enrichmentData.resetDate).toLocaleDateString()}
                      </p>
                    </div>
                    <Zap className="w-8 h-8 text-yellow-400" />
                  </div>
                </div>

                <div className="bg-white bg-opacity-10 backdrop-blur rounded-xl p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white text-opacity-70 text-sm">Ideal Clients</p>
                      <p className="text-3xl font-bold text-white">{idealClients}</p>
                      {idealClients > 0 && (
                        <p className="text-white text-opacity-50 text-xs mt-1">
                          Ready to engage
                        </p>
                      )}
                    </div>
                    <Target className="w-8 h-8 text-green-400" />
                  </div>
                </div>

                <div className="bg-white bg-opacity-10 backdrop-blur rounded-xl p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white text-opacity-70 text-sm">Total Contacts</p>
                      <p className="text-3xl font-bold text-white">{totalContacts}</p>
                    </div>
                    <Users className="w-8 h-8 text-blue-400" />
                  </div>
                </div>

                <div className="bg-white bg-opacity-10 backdrop-blur rounded-xl p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white text-opacity-70 text-sm">Tasks Completed</p>
                      <p className="text-3xl font-bold text-white">{tasksCompleted}</p>
                    </div>
                    <CheckCircle className="w-8 h-8 text-purple-400" />
                  </div>
                </div>
              </div>

              {/* Top Tasks */}
              {activeTasks.length > 0 && (
                <div className="bg-white bg-opacity-10 backdrop-blur rounded-xl p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-semibold text-white">Top 5 Tasks to Do</h3>
                    <button
                      onClick={() => setCurrentView('tasks')}
                      className="text-yellow-400 hover:text-yellow-300 text-sm"
                    >
                      View All Tasks →
                    </button>
                  </div>
                  {idealClients > 0 && (
                    <p className="text-white text-opacity-70 mb-6">
                      You have <span className="font-bold text-yellow-400">{idealClients} ideal clients</span> who could work with you. Start building a relationship now!
                    </p>
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {activeTasks.map(task => (
                      <TaskCard
                        key={task.id}
                        task={task}
                        onComplete={completeTask}
                        onSnooze={snoozeTask}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Quick Actions */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-white bg-opacity-10 backdrop-blur rounded-xl p-6 hover:bg-opacity-20 transition-all text-left"
                >
                  <Upload className="w-8 h-8 text-yellow-400 mb-3" />
                  <h4 className="text-lg font-semibold text-white mb-1">Import Contacts</h4>
                  <p className="text-white text-opacity-70 text-sm">Upload LinkedIn CSV</p>
                </button>

                <button
                  onClick={() => setCurrentView('strategy')}
                  className="bg-white bg-opacity-10 backdrop-blur rounded-xl p-6 hover:bg-opacity-20 transition-all text-left"
                >
                  <Target className="w-8 h-8 text-green-400 mb-3" />
                  <h4 className="text-lg font-semibold text-white mb-1">Build Strategy</h4>
                  <p className="text-white text-opacity-70 text-sm">Create your LinkedIn plan</p>
                </button>

                <button
                  onClick={() => setCurrentView('lead-magnets')}
                  className="bg-white bg-opacity-10 backdrop-blur rounded-xl p-6 hover:bg-opacity-20 transition-all text-left"
                >
                  <BookOpen className="w-8 h-8 text-blue-400 mb-3" />
                  <h4 className="text-lg font-semibold text-white mb-1">Lead Magnets</h4>
                  <p className="text-white text-opacity-70 text-sm">Create valuable content</p>
                </button>
              </div>

              {/* Recent Activity */}
              {contacts.length > 0 && (
                <div className="bg-white bg-opacity-10 backdrop-blur rounded-xl p-6">
                  <h3 className="text-xl font-semibold text-white mb-6">Recent Contacts</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {contacts.slice(-6).reverse().map(contact => (
                      <ContactCard
                        key={contact.id}
                        contact={contact}
                        onEdit={(contact) => {
                          setSelectedContact(contact);
                          setCurrentView('contacts');
                        }}
                        onCategorise={categoriseContactWithAI}
                        onGenerateLeadMagnet={(contact) => {
                          setSelectedContact(contact);
                          setShowGenerateLeadMagnetModal(true);
                        }}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Contacts View */}
          {currentView === 'contacts' && (
            <div className="space-y-6">
              {/* Contacts Header */}
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                <div>
                  <h2 className="text-2xl font-bold text-white">Contact Management</h2>
                  <p className="text-white text-opacity-70">
                    {filteredContacts.length} of {totalContacts} contacts
                  </p>
                </div>

                {/* Hidden file input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  onChange={handleFileUpload}
                  className="hidden"
                />

                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-yellow-400 hover:bg-yellow-500 text-purple-900 px-4 py-2 rounded-lg font-semibold transition-all flex items-center justify-center space-x-2"
                  >
                    <Upload className="w-4 h-4" />
                    <span>Import CSV</span>
                  </button>
                  <button
                    onClick={bulkCategorise}
                    className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg font-semibold transition-all flex items-center justify-center space-x-2"
                  >
                    <Zap className="w-4 h-4" />
                    <span>AI Categorise All</span>
                  </button>
                  <button
                    onClick={bulkEnrichIdealClients}
                    className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-semibold transition-all flex items-center justify-center space-x-2"
                  >
                    <Target className="w-4 h-4" />
                    <span>Enrich Ideal Clients</span>
                  </button>
                </div>
              </div>

              {/* Search and Filter */}
              <div className="bg-white bg-opacity-10 backdrop-blur rounded-xl p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Search contacts..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="bg-white bg-opacity-20 border border-white border-opacity-30 rounded-lg px-4 py-2 text-white placeholder-white placeholder-opacity-50 focus:outline-none focus:border-yellow-400"
                  />
                  <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="bg-white bg-opacity-20 border border-white border-opacity-30 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-yellow-400"
                  >
                    <option value="all">All Categories</option>
                    <option value="Ideal Client">Ideal Clients</option>
                    <option value="Referral Partner">Referral Partners</option>
                    <option value="Competitor">Competitors</option>
                    <option value="Other">Other</option>
                    <option value="">Uncategorised</option>
                  </select>
                </div>
              </div>

              {/* Contacts Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredContacts.map(contact => (
                  <ContactCard
                    key={contact.id}
                    contact={contact}
                    onEdit={setSelectedContact}
                    onCategorise={categoriseContactWithAI}
                    onGenerateLeadMagnet={(contact) => {
                      setSelectedContact(contact);
                      setShowGenerateLeadMagnetModal(true);
                    }}
                  />
                ))}
              </div>

              {filteredContacts.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-white text-opacity-70">
                    {searchTerm || filterCategory !== 'all' 
                      ? 'No contacts match your search criteria'
                      : 'No contacts yet. Import a CSV to get started!'}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Strategy View */}
          {currentView === 'strategy' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">LinkedIn Strategy</h2>
                <p className="text-white text-opacity-70">Build your strategy based on The LinkedIn Formula</p>
              </div>

              <div className="bg-white bg-opacity-10 backdrop-blur rounded-xl p-6">
                <h3 className="text-xl font-semibold text-white mb-6">Strategy Components</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-white text-opacity-90 text-sm font-medium mb-2">
                      One Offer
                    </label>
                    <textarea
                      value={strategy.oneOffer}
                      onChange={(e) => setStrategy(prev => ({ ...prev, oneOffer: e.target.value }))}
                      className="w-full bg-white bg-opacity-20 border border-white border-opacity-30 rounded-lg p-3 text-white placeholder-white placeholder-opacity-50 focus:outline-none focus:border-yellow-400"
                      placeholder="What is the one thing you want to be known for?"
                      rows={3}
                    />
                  </div>

                  <div>
                    <label className="block text-white text-opacity-90 text-sm font-medium mb-2">
                      Ideal Referral Partners
                    </label>
                    <textarea
                      value={strategy.referralPartners}
                      onChange={(e) => setStrategy(prev => ({ ...prev, referralPartners: e.target.value }))}
                      className="w-full bg-white bg-opacity-20 border border-white border-opacity-30 rounded-lg p-3 text-white placeholder-white placeholder-opacity-50 focus:outline-none focus:border-yellow-400"
                      placeholder="Who are your ideal referral partners? (e.g., Business coaches, Marketing consultants)"
                      rows={3}
                    />
                  </div>

                  <div>
                    <label className="block text-white text-opacity-90 text-sm font-medium mb-2">
                      What Makes You Special
                    </label>
                    <textarea
                      value={strategy.specialFactors}
                      onChange={(e) => setStrategy(prev => ({ ...prev, specialFactors: e.target.value }))}
                      className="w-full bg-white bg-opacity-20 border border-white border-opacity-30 rounded-lg p-3 text-white placeholder-white placeholder-opacity-50 focus:outline-none focus:border-yellow-400"
                      placeholder="What unique value do you bring? What makes you different?"
                      rows={3}
                    />
                  </div>

                  <button
                    onClick={generateStrategy}
                    className="bg-yellow-400 hover:bg-yellow-500 text-purple-900 px-6 py-3 rounded-lg font-semibold transition-all"
                  >
                    Generate Full Strategy
                  </button>
                </div>

                {strategy.fullStrategy && (
                  <div className="mt-6 pt-6 border-t border-white border-opacity-20">
                    <h4 className="text-lg font-semibold text-white mb-4">Your LinkedIn Strategy</h4>
                    <div className="bg-white bg-opacity-10 rounded-lg p-4">
                      <p className="text-white whitespace-pre-line">{strategy.fullStrategy}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Lead Magnets View */}
          {currentView === 'lead-magnets' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">Lead Magnets</h2>
                  <p className="text-white text-opacity-70">Create valuable content for your ideal clients</p>
                </div>
                <button
                  onClick={() => setShowGenerateLeadMagnetModal(true)}
                  className="bg-yellow-400 hover:bg-yellow-500 text-purple-900 px-4 py-2 rounded-lg font-semibold transition-all flex items-center space-x-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create Lead Magnet</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {leadMagnets.map(magnet => (
                  <div
                    key={magnet.id}
                    className="bg-white bg-opacity-10 backdrop-blur rounded-xl p-6 hover:bg-opacity-20 transition-all cursor-pointer"
                    onClick={() => setSelectedLeadMagnet(magnet)}
                  >
                    <BookOpen className="w-8 h-8 text-yellow-400 mb-3" />
                    <h4 className="text-lg font-semibold text-white mb-2">{magnet.type}</h4>
                    <p className="text-white text-opacity-70 text-sm mb-2">{magnet.title}</p>
                    <p className="text-white text-opacity-50 text-xs">
                      Created: {new Date(magnet.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>

              {leadMagnets.length === 0 && (
                <div className="text-center py-12">
                  <BookOpen className="w-16 h-16 text-white text-opacity-30 mx-auto mb-4" />
                  <p className="text-white text-opacity-70">
                    No lead magnets created yet. Click "Create Lead Magnet" to get started!
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Tasks View */}
          {currentView === 'tasks' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">Task Management</h2>
                <p className="text-white text-opacity-70">
                  {activeTasks.length} active tasks • {tasksCompleted} completed
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {activeTasks.map(task => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onComplete={completeTask}
                    onSnooze={snoozeTask}
                  />
                ))}
              </div>

              {activeTasks.length === 0 && (
                <div className="text-center py-12">
                  <ClipboardCheck className="w-16 h-16 text-white text-opacity-30 mx-auto mb-4" />
                  <p className="text-white text-opacity-70">
                    No active tasks. Tasks will be created when you enrich ideal clients!
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Settings View */}
          {currentView === 'settings' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">Account Settings</h2>
                <p className="text-white text-opacity-70">Manage your profile and preferences</p>
              </div>

              {/* Business Information */}
              <div className="bg-white bg-opacity-10 backdrop-blur rounded-xl p-6">
                <h3 className="text-xl font-semibold text-white mb-6">Business Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-white text-opacity-90 text-sm font-medium mb-2">
                      Your Name
                    </label>
                    <input
                      type="text"
                      value={user.name}
                      onChange={(e) => setUser(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full bg-white bg-opacity-20 border border-white border-opacity-30 rounded-lg px-4 py-2 text-white placeholder-white placeholder-opacity-50 focus:outline-none focus:border-yellow-400"
                    />
                  </div>
                  <div>
                    <label className="block text-white text-opacity-90 text-sm font-medium mb-2">
                      Company Name
                    </label>
                    <input
                      type="text"
                      value={user.company}
                      onChange={(e) => setUser(prev => ({ ...prev, company: e.target.value }))}
                      className="w-full bg-white bg-opacity-20 border border-white border-opacity-30 rounded-lg px-4 py-2 text-white placeholder-white placeholder-opacity-50 focus:outline-none focus:border-yellow-400"
                    />
                  </div>
                  <div>
                    <label className="block text-white text-opacity-90 text-sm font-medium mb-2">
                      Business Type
                    </label>
                    <input
                      type="text"
                      value={user.businessType}
                      onChange={(e) => setUser(prev => ({ ...prev, businessType: e.target.value }))}
                      className="w-full bg-white bg-opacity-20 border border-white border-opacity-30 rounded-lg px-4 py-2 text-white placeholder-white placeholder-opacity-50 focus:outline-none focus:border-yellow-400"
                      placeholder="e.g., Marketing Agency, Consultant"
                    />
                  </div>
                  <div>
                    <label className="block text-white text-opacity-90 text-sm font-medium mb-2">
                      Target Market
                    </label>
                    <input
                      type="text"
                      value={user.targetClients}
                      onChange={(e) => setUser(prev => ({ ...prev, targetClients: e.target.value }))}
                      className="w-full bg-white bg-opacity-20 border border-white border-opacity-30 rounded-lg px-4 py-2 text-white placeholder-white placeholder-opacity-50 focus:outline-none focus:border-yellow-400"
                      placeholder="e.g., B2B SaaS, Healthcare"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-white text-opacity-90 text-sm font-medium mb-2">
                      Referral Partners
                    </label>
                    <input
                      type="text"
                      value={user.referralPartners}
                      onChange={(e) => setUser(prev => ({ ...prev, referralPartners: e.target.value }))}
                      className="w-full bg-white bg-opacity-20 border border-white border-opacity-30 rounded-lg px-4 py-2 text-white placeholder-white placeholder-opacity-50 focus:outline-none focus:border-yellow-400"
                      placeholder="e.g., Business coaches, Marketing consultants, Web designers"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-white text-opacity-90 text-sm font-medium mb-2">
                      Business Goals
                    </label>
                    <textarea
                      value={user.goals}
                      onChange={(e) => setUser(prev => ({ ...prev, goals: e.target.value }))}
                      className="w-full bg-white bg-opacity-20 border border-white border-opacity-30 rounded-lg px-4 py-3 text-white placeholder-white placeholder-opacity-50 focus:outline-none focus:border-yellow-400"
                      placeholder="What are your main business goals?"
                      rows={3}
                    />
                  </div>
                </div>
              </div>

              {/* Writing Style Analysis */}
              <div className="bg-white bg-opacity-10 backdrop-blur rounded-xl p-6">
                <h3 className="text-xl font-semibold text-white mb-6">Writing Style Analysis</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-white text-opacity-90 text-sm font-medium mb-2">
                      Add Writing Sample
                    </label>
                    <textarea
                      className="w-full bg-white bg-opacity-20 border border-white border-opacity-30 rounded-lg px-4 py-3 text-white placeholder-white placeholder-opacity-50 focus:outline-none focus:border-yellow-400"
                      placeholder="Paste a sample of your writing (LinkedIn post, email, etc.)"
                      rows={4}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && e.shiftKey) {
                          const sample = e.target.value.trim();
                          if (sample) {
                            setUser(prev => ({
                              ...prev,
                              writingSamples: [...prev.writingSamples, sample]
                            }));
                            e.target.value = '';
                          }
                        }
                      }}
                    />
                    <p className="text-white text-opacity-50 text-sm mt-1">
                      Press Shift+Enter to add sample
                    </p>
                  </div>

                  {user.writingSamples.length > 0 && (
                    <div>
                      <p className="text-white text-opacity-90 text-sm font-medium mb-2">
                        Writing Samples ({user.writingSamples.length})
                      </p>
                      <div className="space-y-2">
                        {user.writingSamples.map((sample, index) => (
                          <div key={index} className="bg-white bg-opacity-10 rounded-lg p-3 text-white text-sm">
                            {sample.substring(0, 100)}...
                            <button
                              onClick={() => {
                                setUser(prev => ({
                                  ...prev,
                                  writingSamples: prev.writingSamples.filter((_, i) => i !== index)
                                }));
                              }}
                              className="ml-2 text-red-400 hover:text-red-300"
                            >
                              Remove
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <button
                    onClick={analyzeWritingStyle}
                    disabled={user.writingSamples.length === 0}
                    className={`${
                      user.writingSamples.length === 0
                        ? 'bg-gray-500 cursor-not-allowed'
                        : 'bg-purple-500 hover:bg-purple-600'
                    } text-white px-4 py-2 rounded-lg transition-all`}
                  >
                    Analyze Writing Style
                  </button>

                  {user.writingStyle && (
                    <div className="mt-4 space-y-4">
                      <h4 className="text-white font-medium">Your Writing Style Profile</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-white bg-opacity-10 p-4 rounded-lg">
                          <h5 className="text-yellow-400 font-medium mb-2">Style Profile</h5>
                          <p className="text-white text-sm">
                            <strong>Tone:</strong> {user.writingStyle.styleProfile?.tone}<br/>
                            <strong>Formality:</strong> {user.writingStyle.styleProfile?.formalityLevel}<br/>
                            <strong>Vocabulary:</strong> {user.writingStyle.styleProfile?.vocabularyLevel}
                          </p>
                        </div>
                        <div className="bg-white bg-opacity-10 p-4 rounded-lg">
                          <h5 className="text-green-400 font-medium mb-2">Content Patterns</h5>
                          <p className="text-white text-sm">
                            <strong>Structure:</strong> {user.writingStyle.contentPatterns?.preferredStructure}<br/>
                            <strong>Types:</strong> {user.writingStyle.contentPatterns?.contentTypes?.join(', ')}
                          </p>
                        </div>
                      </div>
                      <div className="bg-white bg-opacity-10 p-4 rounded-lg">
                        <h5 className="text-blue-400 font-medium mb-2">Writing Formula</h5>
                        <p className="text-white text-sm">{user.writingStyle.writingFormula}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modals */}
        <LoadingModal isOpen={loadingModal.isOpen} message={loadingModal.message} />
        <SuccessModal 
          isOpen={successModal.isOpen} 
          onClose={() => setSuccessModal({ isOpen: false, message: '' })}
          message={successModal.message}
        />

        {/* Contact Detail Modal */}
        {selectedContact && !showGenerateLeadMagnetModal && (
          <Modal
            isOpen={true}
            onClose={() => setSelectedContact(null)}
            title="Contact Details"
            size="medium"
          >
            <div className="space-y-6">
              <div>
                <h3 className="text-2xl font-semibold text-gray-900">{selectedContact.name}</h3>
                {selectedContact.category && (
                  <span className={`inline-block mt-2 ${
                    selectedContact.category === 'Ideal Client' ? 'bg-green-500' :
                    selectedContact.category === 'Referral Partner' ? 'bg-blue-500' :
                    selectedContact.category === 'Competitor' ? 'bg-red-500' :
                    'bg-gray-500'
                  } text-white text-xs px-3 py-1 rounded-full`}>
                    {selectedContact.category}
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Company</p>
                  <p className="font-medium">{selectedContact.company || 'Not specified'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Title</p>
                  <p className="font-medium">{selectedContact.title || 'Not specified'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="font-medium">{selectedContact.email || 'Not specified'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Location</p>
                  <p className="font-medium">{selectedContact.location || 'Not specified'}</p>
                </div>
                {selectedContact.enriched && (
                  <>
                    <div>
                      <p className="text-sm text-gray-600">Industry</p>
                      <p className="font-medium">{selectedContact.industry || 'Not specified'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Company Size</p>
                      <p className="font-medium">{selectedContact.companySize || 'Not specified'}</p>
                    </div>
                  </>
                )}
              </div>

              {selectedContact.linkedinUrl && (
                <div>
                  <p className="text-sm text-gray-600 mb-1">LinkedIn Profile</p>
                  <a
                    href={selectedContact.linkedinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-700 underline"
                  >
                    View LinkedIn Profile →
                  </a>
                </div>
              )}

              <div className="flex space-x-3 pt-4 border-t">
                {!selectedContact.enriched && (
                  <button
                    onClick={() => enrichSingleContact(selectedContact)}
                    className="flex-1 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-all"
                  >
                    Enrich Data
                  </button>
                )}
                {selectedContact.category === 'Ideal Client' && (
                  <button
                    onClick={() => setShowGenerateLeadMagnetModal(true)}
                    className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-all"
                  >
                    Generate Lead Magnet
                  </button>
                )}
                <button
                  onClick={() => {
                    if (window.confirm('Delete this contact?')) {
                      setContacts(prev => prev.filter(c => c.id !== selectedContact.id));
                      setSelectedContact(null);
                    }
                  }}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-all"
                >
                  Delete
                </button>
              </div>
            </div>
          </Modal>
        )}

        {/* Lead Magnet Generation Modal */}
        {showGenerateLeadMagnetModal && (
          <Modal
            isOpen={true}
            onClose={() => {
              setShowGenerateLeadMagnetModal(false);
              if (selectedContact && currentView !== 'contacts') {
                setSelectedContact(null);
              }
            }}
            title="Generate Lead Magnet"
            size="small"
          >
            <div className="space-y-4">
              <p className="text-gray-600">
                Choose a lead magnet type to generate
                {selectedContact && ` for ${selectedContact.name}`}:
              </p>
              
              <div className="space-y-2">
                <button
                  onClick={() => generateLeadMagnet('Self-Audit Questionnaire', selectedContact)}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white p-3 rounded-lg transition-all text-left"
                >
                  <h4 className="font-semibold">Self-Audit Questionnaire</h4>
                  <p className="text-sm text-purple-200">Help prospects evaluate their current situation</p>
                </button>
                
                <button
                  onClick={() => generateLeadMagnet('Quick Start Guide', selectedContact)}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white p-3 rounded-lg transition-all text-left"
                >
                  <h4 className="font-semibold">Quick Start Guide</h4>
                  <p className="text-sm text-indigo-200">Actionable steps to solve their main problem</p>
                </button>
                
                <button
                  onClick={() => generateLeadMagnet('Industry Report', selectedContact)}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-lg transition-all text-left"
                >
                  <h4 className="font-semibold">Industry Report</h4>
                  <p className="text-sm text-blue-200">Data-driven insights for their industry</p>
                </button>
                
                <button
                  onClick={() => generateLeadMagnet('Checklist', selectedContact)}
                  className="w-full bg-green-600 hover:bg-green-700 text-white p-3 rounded-lg transition-all text-left"
                >
                  <h4 className="font-semibold">Checklist</h4>
                  <p className="text-sm text-green-200">Step-by-step process to achieve success</p>
                </button>
              </div>
            </div>
          </Modal>
        )}

        {/* Lead Magnet View Modal */}
        {selectedLeadMagnet && (
          <Modal
            isOpen={true}
            onClose={() => setSelectedLeadMagnet(null)}
            title={selectedLeadMagnet.title}
            size="large"
          >
            <div className="prose prose-gray max-w-none">
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <p className="text-sm text-gray-600 mb-1">Type: {selectedLeadMagnet.type}</p>
                <p className="text-sm text-gray-600">Created: {new Date(selectedLeadMagnet.createdAt).toLocaleString()}</p>
              </div>
              
              <div className="whitespace-pre-line">{selectedLeadMagnet.content}</div>
              
              <div className="mt-6 flex space-x-3">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(selectedLeadMagnet.content);
                    setSuccessModal({ isOpen: true, message: 'Copied to clipboard!' });
                  }}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-all"
                >
                  Copy to Clipboard
                </button>
                <button
                  onClick={() => setSelectedLeadMagnet(null)}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-all"
                >
                  Close
                </button>
              </div>
            </div>
          </Modal>
        )}
      </div>
    );
  };

  // Main app render logic
  if (!isAuthenticated) {
    if (authView === 'landing') {
      return <LandingPage />;
    } else if (authView === 'signin') {
      return <SignInPage />;
    } else if (authView === 'signup') {
      return <SignUpPage />;
    } else {
      return <LandingPage />;
    }
  }

  return <Dashboard />;
};

export default GlassSlipperApp;