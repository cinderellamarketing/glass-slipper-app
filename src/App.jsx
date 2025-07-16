import React, { useState, useRef, useEffect } from 'react';
import { Mail, Lock, Eye, EyeOff, ArrowRight, Sparkles, Shield, Users, Upload, Target, UserCheck, Building, BarChart3, Calendar, Settings, CheckCircle, User, Briefcase, Plus, TrendingUp, Zap, Menu, FileText, LogOut } from 'lucide-react';

// Storage version for backwards compatibility
const STORAGE_VERSION = '1.0';

// Storage keys
const STORAGE_KEYS = {
  USER_DATA: 'glassSlipperUserData',
  CONTACTS: 'glassSlipperContacts',
  CATEGORIES: 'glassSlipperCategories',
  TASKS: 'glassSlipperTasks',
  SETTINGS: 'glassSlipperSettings',
  STRATEGY: 'glassSlipperStrategy',
  LEAD_MAGNETS: 'glassSlipperLeadMagnets',
  ENRICHMENT_DATA: 'glassSlipperEnrichmentData',
  VERSION: 'glassSlipperVersion'
};

// LinkedIn Formula AI Client - Updated for Vercel API
class LinkedInFormulaAI {
  constructor() {
    this.baseURL = '/api';
  }

  async callClaude(prompt, model = 'claude-sonnet-4-20250514', maxTokens = 2000) {
    try {
      const response = await fetch(`${this.baseURL}/claude`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          model,
          maxTokens
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `API request failed: ${response.status}`);
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Claude API Error:', error);
      throw error;
    }
  }

  async enrichContactData(contact) {
    try {
      const response = await fetch(`${this.baseURL}/enrich-contact`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ contact })
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (errorData.fallbackData) {
          return errorData.fallbackData;
        }
        throw new Error(errorData.error || `Enrichment failed: ${response.status}`);
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Contact enrichment failed:', error);
      return {
        basicInfo: {
          phone: "Enrichment failed",
          location: "Enrichment failed", 
          industry: "Enrichment failed",
          companyWebsite: "Enrichment failed",
          linkedinProfile: "Enrichment failed"
        },
        companyIntelligence: {
          companyFullName: contact.company || "Unknown",
          companySize: "Enrichment failed",
          services: "Enrichment failed", 
          foundOnWebsite: "API unavailable"
        },
        searchQuality: "Low",
        dataSource: `Error: ${error.message}`
      };
    }
  }
}

// Storage management utility
const StorageManager = {
  save: (key, data) => {
    try {
      const serialized = JSON.stringify({
        data,
        timestamp: new Date().toISOString(),
        version: STORAGE_VERSION
      });
      localStorage.setItem(key, serialized);
      return true;
    } catch (error) {
      console.error(`Failed to save ${key}:`, error);
      return false;
    }
  },

  load: (key, defaultValue = null) => {
    try {
      const item = localStorage.getItem(key);
      if (!item) return defaultValue;
      
      const parsed = JSON.parse(item);
      return parsed.data;
    } catch (error) {
      console.error(`Failed to load ${key}:`, error);
      return defaultValue;
    }
  }
};

// Main Glass Slipper App Component
const GlassSlipperApp = () => {
  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authView, setAuthView] = useState('landing');
  const [currentUser, setCurrentUser] = useState(null);
  const [currentView, setCurrentView] = useState('dashboard');
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  // App state
  const [contacts, setContacts] = useState(() => {
    const savedContacts = StorageManager.load(STORAGE_KEYS.CONTACTS, []);
    // Ensure each contact has a name property for filtering
    return savedContacts.map(contact => ({
      ...contact,
      name: contact.name || `${contact.firstName || ''} ${contact.lastName || ''}`.trim() || 'Unknown'
    }));
  });

  const [selectedContact, setSelectedContact] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [user, setUser] = useState({
    name: '',
    company: '',
    businessType: '',
    targetMarket: '',
    services: '',
    goals: '',
    writingStyle: null
  });

  // File upload
  const fileInputRef = useRef(null);
  const [isUploading, setIsUploading] = useState(false);

  // AI client
  const [linkedinAI] = useState(() => new LinkedInFormulaAI());

  // Load data on component mount
  useEffect(() => {
    const savedUser = StorageManager.load(STORAGE_KEYS.USER_DATA);
    if (savedUser) {
      setCurrentUser(savedUser);
      setIsAuthenticated(true);
    }
  }, []);

  // Statistics
  const totalContacts = contacts.length;
  const idealClients = contacts.filter(c => c.category === 'Ideal Client').length;
  const enrichedContacts = contacts.filter(c => c.enrichmentData).length;

  // Filter contacts safely
  const filteredContacts = contacts.filter(contact => {
    const contactName = contact.name || `${contact.firstName || ''} ${contact.lastName || ''}`.trim() || '';
    const contactCompany = contact.company || '';
    
    const matchesSearch = contactName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         contactCompany.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'All' || contact.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  // Get unique categories for filter
  const categories = ['All', ...new Set(contacts.map(c => c.category).filter(Boolean))];

  // CSV Upload functionality
  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setIsUploading(true);
    
    try {
      const text = await file.text();
      const lines = text.split('\n').filter(line => line.trim());
      
      if (lines.length < 2) {
        alert('CSV file appears to be empty or invalid.');
        return;
      }

      const newContacts = [];
      
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim().replace(/['"]/g, ''));
        
        if (values.length >= 2) {
          const contact = {
            id: Date.now() + Math.random(),
            firstName: values[0] || 'Unknown',
            lastName: values[1] || '',
            company: values[2] || 'Unknown Company',
            position: values[3] || '',
            email: values[4] || '',
            phone: values[5] || '',
            location: values[6] || '',
            industry: values[7] || '',
            name: `${values[0] || 'Unknown'} ${values[1] || ''}`.trim(),
            category: 'Uncategorised',
            notes: '',
            lastContact: null,
            tags: [],
            imported: new Date().toISOString()
          };
          
          newContacts.push(contact);
        }
      }

      if (newContacts.length > 0) {
        const updatedContacts = [...contacts, ...newContacts];
        setContacts(updatedContacts);
        StorageManager.save(STORAGE_KEYS.CONTACTS, updatedContacts);
        alert(`Successfully imported ${newContacts.length} contacts!`);
      } else {
        alert('No valid contacts found in the CSV file.');
      }
    } catch (error) {
      console.error('File upload error:', error);
      alert('Error processing CSV file. Please check the format and try again.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Contact enrichment
  const enrichContactData = async (contact) => {
    try {
      const enrichmentData = await linkedinAI.enrichContactData(contact);

      const updatedContact = {
        ...contact,
        phone: (enrichmentData.basicInfo?.phone && enrichmentData.basicInfo.phone !== 'Not found') ? enrichmentData.basicInfo.phone : contact.phone,
        location: (enrichmentData.basicInfo?.location && enrichmentData.basicInfo.location !== 'Not found') ? enrichmentData.basicInfo.location : contact.location,
        industry: (enrichmentData.basicInfo?.industry && enrichmentData.basicInfo.industry !== 'Not found') ? enrichmentData.basicInfo.industry : contact.industry,
        companyWebsite: (enrichmentData.basicInfo?.companyWebsite && enrichmentData.basicInfo.companyWebsite !== 'Not found') ? enrichmentData.basicInfo.companyWebsite : contact.companyWebsite,
        linkedinProfile: (enrichmentData.basicInfo?.linkedinProfile && enrichmentData.basicInfo.linkedinProfile !== 'Not found') ? enrichmentData.basicInfo.linkedinProfile : contact.linkedinProfile,
        enrichmentData,
        lastEnriched: new Date()
      };

      const updatedContacts = contacts.map(c => c.id === contact.id ? updatedContact : c);
      setContacts(updatedContacts);
      StorageManager.save(STORAGE_KEYS.CONTACTS, updatedContacts);

      const foundItems = Object.values(enrichmentData.basicInfo || {}).filter(value => value && value !== 'Not found' && value !== 'Search failed').length;
      if (foundItems > 0) {
        alert(`✅ Contact enrichment completed! Found ${foundItems} pieces of new information.`);
      } else {
        alert(`⚠️ Contact enrichment completed but no new information was found.`);
      }
      return updatedContact;
    } catch (error) {
      console.error('Contact enrichment failed:', error);
      alert('Contact enrichment failed. Please check your API configuration.');
      return contact;
    }
  };

  // Landing page component
  const LandingPage = () => (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900">
      <div className="flex flex-col min-h-screen">
        <header className="bg-white bg-opacity-10 backdrop-blur border-b border-white border-opacity-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center space-x-3">
                <div className="bg-yellow-400 p-2 rounded-full">
                  <Sparkles className="w-6 h-6 text-purple-900" />
                </div>
                <span className="text-xl font-bold text-white">Glass Slipper</span>
              </div>
              <div className="flex space-x-4">
                <button
                  onClick={() => setAuthView('signin')}
                  className="text-white hover:text-yellow-400 px-4 py-2 rounded-lg transition-all"
                >
                  Sign In
                </button>
                <button
                  onClick={() => setAuthView('signup')}
                  className="bg-yellow-400 hover:bg-yellow-300 text-purple-900 px-6 py-2 rounded-lg font-semibold transition-all"
                >
                  Get Started
                </button>
              </div>
            </div>
          </div>
        </header>

        <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
              Transform Your LinkedIn Connections Into
              <span className="text-yellow-400"> Strategic Business Relationships</span>
            </h1>
            <p className="text-xl text-white text-opacity-80 mb-8 max-w-3xl mx-auto">
              Glass Slipper uses advanced AI to categorise your LinkedIn contacts, enrich their data, and generate personalised content that converts connections into clients.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => setAuthView('signup')}
                className="bg-yellow-400 hover:bg-yellow-300 text-purple-900 px-8 py-4 rounded-xl font-bold text-lg transition-all transform hover:scale-105 flex items-center justify-center space-x-2"
              >
                <span>Start Your Free Trial</span>
                <ArrowRight className="w-5 h-5" />
              </button>
              <button
                onClick={() => setAuthView('signin')}
                className="bg-white bg-opacity-10 backdrop-blur hover:bg-opacity-20 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all border border-white border-opacity-20"
              >
                Watch Demo
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Sign in page component
  const SignInPage = () => {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = async (e) => {
      e.preventDefault();
      if (formData.email && formData.password) {
        const userData = {
          email: formData.email,
          name: formData.email.split('@')[0],
          lastLogin: new Date().toISOString(),
          company: 'Demo Company',
          businessType: 'Sales Professional'
        };
        
        StorageManager.save(STORAGE_KEYS.USER_DATA, userData);
        setCurrentUser(userData);
        setIsAuthenticated(true);
      }
    };

    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 flex items-center justify-center px-4">
        <div className="max-w-md w-full">
          <div className="bg-white bg-opacity-10 backdrop-blur rounded-xl p-8">
            <div className="text-center mb-8">
              <div className="flex justify-center mb-4">
                <div className="bg-white bg-opacity-10 p-3 rounded-full">
                  <Sparkles className="w-8 h-8 text-yellow-400" />
                </div>
              </div>
              <h2 className="text-3xl font-bold text-white mb-2">Welcome Back</h2>
              <p className="text-white text-opacity-70">Sign in to your Glass Slipper account</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-white text-sm font-medium mb-2">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white text-opacity-50 w-5 h-5" />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full pl-12 pr-4 py-3 bg-white bg-opacity-10 backdrop-blur border border-white border-opacity-20 rounded-lg text-white placeholder-white placeholder-opacity-50 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                    placeholder="Enter your email"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-white text-sm font-medium mb-2">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white text-opacity-50 w-5 h-5" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                    className="w-full pl-12 pr-12 py-3 bg-white bg-opacity-10 backdrop-blur border border-white border-opacity-20 rounded-lg text-white placeholder-white placeholder-opacity-50 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                    placeholder="Enter your password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white text-opacity-50 hover:text-opacity-70"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-yellow-400 hover:bg-yellow-300 text-purple-900 font-bold py-3 px-4 rounded-lg transition-all flex items-center justify-center space-x-2"
              >
                <span>Sign In</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-white text-opacity-70">
                Don't have an account?{' '}
                <button
                  onClick={() => setAuthView('signup')}
                  className="text-yellow-400 hover:text-yellow-300 font-medium"
                >
                  Sign up here
                </button>
              </p>
            </div>

            <div className="mt-4 text-center">
              <button
                onClick={() => setAuthView('landing')}
                className="text-white text-opacity-50 hover:text-opacity-70 text-sm"
              >
                ← Back to home
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Sign up page component
  const SignUpPage = () => {
    const [formData, setFormData] = useState({ name: '', email: '', password: '', company: '' });

    const handleSubmit = (e) => {
      e.preventDefault();
      alert('Account created successfully! Please sign in.');
      setAuthView('signin');
    };

    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 flex items-center justify-center px-4">
        <div className="max-w-md w-full">
          <div className="bg-white bg-opacity-10 backdrop-blur rounded-xl p-8">
            <div className="text-center mb-8">
              <div className="flex justify-center mb-4">
                <div className="bg-white bg-opacity-10 p-3 rounded-full">
                  <Sparkles className="w-8 h-8 text-yellow-400" />
                </div>
              </div>
              <h2 className="text-3xl font-bold text-white mb-2">Create Account</h2>
              <p className="text-white text-opacity-70">Start your free trial today</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-white text-sm font-medium mb-2">Full Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-4 py-3 bg-white bg-opacity-10 backdrop-blur border border-white border-opacity-20 rounded-lg text-white placeholder-white placeholder-opacity-50 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  placeholder="Enter your full name"
                  required
                />
              </div>

              <div>
                <label className="block text-white text-sm font-medium mb-2">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-4 py-3 bg-white bg-opacity-10 backdrop-blur border border-white border-opacity-20 rounded-lg text-white placeholder-white placeholder-opacity-50 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  placeholder="Enter your email"
                  required
                />
              </div>

              <div>
                <label className="block text-white text-sm font-medium mb-2">Company</label>
                <input
                  type="text"
                  value={formData.company}
                  onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
                  className="w-full px-4 py-3 bg-white bg-opacity-10 backdrop-blur border border-white border-opacity-20 rounded-lg text-white placeholder-white placeholder-opacity-50 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  placeholder="Enter your company name"
                  required
                />
              </div>

              <div>
                <label className="block text-white text-sm font-medium mb-2">Password</label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  className="w-full px-4 py-3 bg-white bg-opacity-10 backdrop-blur border border-white border-opacity-20 rounded-lg text-white placeholder-white placeholder-opacity-50 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  placeholder="Create a password"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full bg-yellow-400 hover:bg-yellow-300 text-purple-900 font-bold py-3 px-4 rounded-lg transition-all"
              >
                Create Account
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-white text-opacity-70">
                Already have an account?{' '}
                <button
                  onClick={() => setAuthView('signin')}
                  className="text-yellow-400 hover:text-yellow-300 font-medium"
                >
                  Sign in here
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Main dashboard component
  const Dashboard = () => {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900">
        <div className="flex flex-col h-screen">
          {/* Header */}
          <div className="bg-white bg-opacity-10 backdrop-blur border-b border-white border-opacity-20 px-6 py-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-3">
                <div className="bg-yellow-400 p-2 rounded-full">
                  <Sparkles className="w-6 h-6 text-purple-900" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white">Glass Slipper</h1>
                  <p className="text-white text-opacity-70 text-sm">AI-Powered ABM Platform</p>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <nav className="hidden md:flex space-x-2">
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

                <div className="flex items-center space-x-4">
                  <div className="hidden md:block text-right">
                    <p className="text-white text-sm font-medium">{currentUser?.name}</p>
                    <p className="text-white text-opacity-70 text-xs">{currentUser?.company}</p>
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
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 overflow-auto p-6">
            {currentView === 'dashboard' && (
              <div className="space-y-6">
                {/* Stats Overview */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                        <p className="text-white text-opacity-70 text-sm">Ideal Clients</p>
                        <p className="text-3xl font-bold text-white">{idealClients}</p>
                      </div>
                      <Target className="w-8 h-8 text-green-400" />
                    </div>
                  </div>

                  <div className="bg-white bg-opacity-10 backdrop-blur rounded-xl p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-white text-opacity-70 text-sm">Enriched Contacts</p>
                        <p className="text-3xl font-bold text-white">{enrichedContacts}</p>
                      </div>
                      <UserCheck className="w-8 h-8 text-purple-400" />
                    </div>
                  </div>
                </div>

                {/* Welcome Message */}
                <div className="bg-white bg-opacity-10 backdrop-blur rounded-xl p-6">
                  <h2 className="text-xl font-bold text-white mb-4">Welcome to Glass Slipper</h2>
                  <p className="text-white text-opacity-70 mb-4">
                    Your AI-powered ABM platform is ready to transform your LinkedIn connections into strategic business relationships.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white bg-opacity-5 p-4 rounded-lg">
                      <h3 className="font-semibold text-white mb-2">Quick Start</h3>
                      <p className="text-white text-opacity-60 text-sm mb-3">Upload your LinkedIn connections and let AI categorise them</p>
                      <button
                        onClick={() => setCurrentView('contacts')}
                        className="bg-yellow-400 text-purple-900 px-4 py-2 rounded-lg font-medium"
                      >
                        Upload Contacts
                      </button>
                    </div>
                    <div className="bg-white bg-opacity-5 p-4 rounded-lg">
                      <h3 className="font-semibold text-white mb-2">Configure Settings</h3>
                      <p className="text-white text-opacity-60 text-sm mb-3">Set up your business profile for better AI results</p>
                      <button
                        onClick={() => setCurrentView('settings')}
                        className="bg-purple-600 text-white px-4 py-2 rounded-lg font-medium"
                      >
                        Configure Settings
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {currentView === 'contacts' && (
              <div className="space-y-6">
                {/* Contact Controls */}
                <div className="bg-white bg-opacity-10 backdrop-blur rounded-xl p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                    <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
                      <div className="relative">
                        <input
                          type="text"
                          placeholder="Search contacts..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="w-full sm:w-64 px-4 py-2 bg-white bg-opacity-10 border border-white border-opacity-20 rounded-lg text-white placeholder-white placeholder-opacity-50 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                        />
                      </div>
                      <select
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                        className="px-4 py-2 bg-white bg-opacity-10 border border-white border-opacity-20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
                      >
                        {categories.map(category => (
                          <option key={category} value={category} className="bg-purple-900 text-white">
                            {category}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileUpload}
                        accept=".csv"
                        className="hidden"
                      />
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading}
                        className="bg-yellow-400 hover:bg-yellow-300 disabled:bg-yellow-600 text-purple-900 px-4 py-2 rounded-lg font-medium flex items-center space-x-2"
                      >
                        <Upload className="w-4 h-4" />
                        <span>{isUploading ? 'Uploading...' : 'Upload CSV'}</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Contacts List */}
                <div className="bg-white bg-opacity-10 backdrop-blur rounded-xl overflow-hidden">
                  <div className="p-6 border-b border-white border-opacity-20">
                    <h2 className="text-xl font-bold text-white">
                      Contacts ({filteredContacts.length})
                    </h2>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {filteredContacts.length === 0 ? (
                      <div className="p-6 text-center">
                        <Users className="w-12 h-12 text-white text-opacity-50 mx-auto mb-4" />
                        <p className="text-white text-opacity-70">
                          {contacts.length === 0 ? 'No contacts uploaded yet' : 'No contacts match your search'}
                        </p>
                      </div>
                    ) : (
                      <div className="divide-y divide-white divide-opacity-20">
                        {filteredContacts.map((contact) => (
                          <div
                            key={contact.id}
                            className="p-4 hover:bg-white hover:bg-opacity-5 cursor-pointer transition-all"
                            onClick={() => setSelectedContact(contact)}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-4">
                                <div className="bg-white bg-opacity-10 p-3 rounded-full">
                                  <User className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                  <h3 className="font-semibold text-white">
                                    {contact.name}
                                  </h3>
                                  <p className="text-white text-opacity-70 text-sm">
                                    {contact.position || 'No position'} at {contact.company || 'No company'}
                                  </p>
                                  {contact.enrichmentData && (
                                    <p className="text-green-400 text-xs mt-1">✓ Enriched</p>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                  contact.category === 'Ideal Client' ? 'bg-green-500 text-white' :
                                  contact.category === 'Referral Partner' ? 'bg-blue-500 text-white' :
                                  contact.category === 'Competitor' ? 'bg-red-500 text-white' :
                                  'bg-gray-500 text-white'
                                }`}>
                                  {contact.category || 'Uncategorised'}
                                </span>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    enrichContactData(contact);
                                  }}
                                  className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg transition-all"
                                >
                                  <TrendingUp className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {currentView === 'settings' && (
              <div className="space-y-6">
                <div className="bg-white bg-opacity-10 backdrop-blur rounded-xl p-6">
                  <h2 className="text-xl font-bold text-white mb-4">Business Profile</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-white text-sm font-medium mb-2">Business Type</label>
                      <input
                        type="text"
                        value={user.businessType}
                        onChange={(e) => setUser(prev => ({ ...prev, businessType: e.target.value }))}
                        className="w-full px-4 py-2 bg-white bg-opacity-10 border border-white border-opacity-20 rounded-lg text-white placeholder-white placeholder-opacity-50"
                        placeholder="e.g., Marketing Consultant"
                      />
                    </div>
                    <div>
                      <label className="block text-white text-sm font-medium mb-2">Target Market</label>
                      <input
                        type="text"
                        value={user.targetMarket}
                        onChange={(e) => setUser(prev => ({ ...prev, targetMarket: e.target.value }))}
                        className="w-full px-4 py-2 bg-white bg-opacity-10 border border-white border-opacity-20 rounded-lg text-white placeholder-white placeholder-opacity-50"
                        placeholder="e.g., SME Technology Companies"
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-white bg-opacity-10 backdrop-blur rounded-xl p-6">
                  <h2 className="text-xl font-bold text-white mb-4">API Status</h2>
                  <p className="text-white text-opacity-70 mb-4">
                    API keys are configured via environment variables for security.
                  </p>
                  <div className="flex space-x-4">
                    <button
                      onClick={async () => {
                        try {
                          const response = await fetch('/api/search', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ query: 'test search', num: 3 })
                          });
                          if (response.ok) {
                            alert('✅ Search API is working!');
                          } else {
                            alert('❌ Search API Error');
                          }
                        } catch (error) {
                          alert(`❌ Search API Error: ${error.message}`);
                        }
                      }}
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium"
                    >
                      Test Search API
                    </button>
                    <button
                      onClick={async () => {
                        try {
                          await linkedinAI.callClaude('Test prompt');
                          alert('✅ Claude API is working!');
                        } catch (error) {
                          alert(`❌ Claude API Error: ${error.message}`);
                        }
                      }}
                      className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium"
                    >
                      Test Claude API
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Contact Detail Modal */}
          {selectedContact && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white bg-opacity-10 backdrop-blur rounded-xl p-6 max-w-2xl w-full max-h-96 overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-white">
                    {selectedContact.name}
                  </h2>
                  <button
                    onClick={() => setSelectedContact(null)}
                    className="text-white text-opacity-70 hover:text-opacity-100"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-white text-opacity-70 text-sm">Company</p>
                      <p className="text-white font-medium">{selectedContact.company}</p>
                    </div>
                    <div>
                      <p className="text-white text-opacity-70 text-sm">Position</p>
                      <p className="text-white font-medium">{selectedContact.position}</p>
                    </div>
                    <div>
                      <p className="text-white text-opacity-70 text-sm">Category</p>
                      <p className="text-white font-medium">{selectedContact.category}</p>
                    </div>
                    <div>
                      <p className="text-white text-opacity-70 text-sm">Phone</p>
                      <p className="text-white font-medium">{selectedContact.phone || 'Not available'}</p>
                    </div>
                  </div>

                  {selectedContact.enrichmentData && (
                    <div className="bg-white bg-opacity-5 p-4 rounded-lg">
                      <h3 className="text-white font-semibold mb-2">Enrichment Data</h3>
                      <div className="text-white text-opacity-70 text-sm space-y-1">
                        <p>Industry: {selectedContact.enrichmentData.basicInfo?.industry}</p>
                        <p>Location: {selectedContact.enrichmentData.basicInfo?.location}</p>
                        <p>Website: {selectedContact.enrichmentData.basicInfo?.companyWebsite}</p>
                      </div>
                    </div>
                  )}

                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => {
                        enrichContactData(selectedContact);
                      }}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg transition-all flex items-center justify-center space-x-2"
                    >
                      <TrendingUp className="w-4 h-4" />
                      <span>Enrich Data</span>
                    </button>

                    <button
                      onClick={() => {
                        if (window.confirm('Delete this contact?')) {
                          const updatedContacts = contacts.filter(c => c.id !== selectedContact.id);
                          setContacts(updatedContacts);
                          StorageManager.save(STORAGE_KEYS.CONTACTS, updatedContacts);
                          setSelectedContact(null);
                        }
                      }}
                      className="bg-red-500 hover:bg-red-600 text-white px-4 py-3 rounded-lg transition-all flex items-center justify-center space-x-2"
                    >
                      <span>Delete Contact</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
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