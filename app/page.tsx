'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';

import { Mail, Lock, Eye, EyeOff, ArrowRight, Sparkles, Shield, Users, Upload, Target, UserCheck, Building, BarChart3, Calendar, Settings, CheckCircle, User, Briefcase, Plus, TrendingUp, Zap, Menu, FileText, LogOut, Check, Phone, Globe, X, ChevronDown, Search, ChevronLeft, MessageSquare, Bell, TrendingDown, Award, AlertCircle, Edit2, Trash2, DollarSign, Clock, Activity, BookOpen, Download, Send, Copy, Share2, Star, Link, RefreshCw, Filter, MoreVertical, MapPin } from 'lucide-react';

// Updated TypeScript interfaces with lastName support
interface Contact {
  id: number;
  name: string;
  lastName?: string; // Added lastName field
  company: string;
  position: string;
  email: string;
  category?: string;
  isEnriched?: boolean;
  phone?: string;
  website?: string;
  industry?: string; // Added industry field to match enrich.js response
}

interface User {
  name: string;
  email: string;
  company: string;
  businessType: string;
  targetMarket: string;
  writingStyle: string;
  referralPartners: string;
}

interface Task {
  id: number;
  text: string;
  completed: boolean;
  priority: 'high' | 'medium' | 'low';
}

interface LeadMagnet {
  id: number;
  title: string;
  description: string;
  type: string;
  created: string;
  downloads: number;
  content: string;
}

interface Strategy {
  oneOffer: string;
  idealReferralPartners: string;
  specialFactors: string;
  generatedStrategy: string;
}

interface DailyTask {
  completed: boolean;
  count?: number;
  total?: number;
}

interface DailyTasks {
  chooseIdealClients: DailyTask;
  commentOnPosts: DailyTask;
  postContent: DailyTask;
  lastReset: string;
}

interface AuthForm {
  email: string;
  password: string;
  confirmPassword: string;
  name: string;
  company: string;
}

interface ContactTaskStatus {
  completed: boolean;
  completedDate: string | null;
}

interface NavigationItem {
  view: string;
  label: string;
  icon: any;
}

// ============================================
// MAIN GLASS SLIPPER COMPONENT
// ============================================

export default function GlassSlipperApp() {
  // Core state management
  const [currentView, setCurrentView] = useState('landing');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [enrichmentsLeft, setEnrichmentsLeft] = useState(100);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [showLoadingModal, setShowLoadingModal] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');

  // User and contact management
  const [user, setUser] = useState<User>({
    name: 'Sarah Thompson',
    email: 'sarah@example.com',
    company: 'Thompson Marketing',
    businessType: 'Marketing Agency',
    targetMarket: 'Small Business Owners',
    writingStyle: 'Professional and approachable',
    referralPartners: 'Accountants, Business Coaches, Web Developers'
  });

  const [authForm, setAuthForm] = useState<AuthForm>({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    company: ''
  });

  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('All');

  // Tasks and strategy management
  const [tasks, setTasks] = useState<Task[]>([
    { id: 1, text: "Review this week's ideal client list", completed: false, priority: 'high' },
    { id: 2, text: "Create lead magnet for Q1", completed: false, priority: 'medium' },
    { id: 3, text: "Update LinkedIn profile with recent wins", completed: true, priority: 'low' }
  ]);

  const [leadMagnets, setLeadMagnets] = useState<LeadMagnet[]>([]);
  const [strategy, setStrategy] = useState<Strategy>({
    oneOffer: '',
    idealReferralPartners: '',
    specialFactors: '',
    generatedStrategy: ''
  });

  const [dailyTasks, setDailyTasks] = useState<DailyTasks>({
    chooseIdealClients: { completed: false, count: 0, total: 50 },
    commentOnPosts: { completed: false, count: 0, total: 10 },
    postContent: { completed: false },
    lastReset: new Date().toDateString()
  });

  const [contactTasks, setContactTasks] = useState<Record<string, Record<string, ContactTaskStatus>>>({});
  const [currentIdealClientIndex, setCurrentIdealClientIndex] = useState(0);

  // File handling
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Navigation configuration
  const navigationItems: NavigationItem[] = [
    { view: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { view: 'contacts', label: 'Contact Management', icon: Users },
    { view: 'strategy', label: 'Strategy Builder', icon: Target },
    { view: 'content', label: 'Content Creation', icon: FileText },
    { view: 'settings', label: 'Settings', icon: Settings }
  ];

  // ============================================
  // UTILITY FUNCTIONS
  // ============================================

  // Contact filtering and searching
  const filteredContacts = contacts.filter(contact => {
    const matchesSearch = contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         contact.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         contact.position.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = selectedFilter === 'All' || contact.category === selectedFilter;
    
    return matchesSearch && matchesFilter;
  });

  // Get contacts by category
  const idealClientsList = contacts.filter(c => c.category === 'Ideal Client');
  const referralPartnersList = contacts.filter(c => c.category === 'Referral Partners');
  const competitorsList = contacts.filter(c => c.category === 'Competitors');
  const othersList = contacts.filter(c => c.category === 'Other');

  const currentIdealClient = idealClientsList[currentIdealClientIndex];

  // Task management for contacts
  const getTaskStatus = (contactId: number, taskKey: string): ContactTaskStatus => {
    return contactTasks[contactId]?.[taskKey] || { completed: false, completedDate: null };
  };

  const toggleContactTask = (contactId: number, taskKey: string) => {
    setContactTasks(prev => {
      const contactTasksState = prev[contactId] || {};
      const currentStatus = contactTasksState[taskKey] || { completed: false, completedDate: null };
      
      return {
        ...prev,
        [contactId]: {
          ...contactTasksState,
          [taskKey]: {
            completed: !currentStatus.completed,
            completedDate: !currentStatus.completed ? new Date().toISOString() : null
          }
        }
      };
    });
  };

  // Category management
  const updateCategory = (contactId: number, category: string) => {
    setContacts(prevContacts =>
      prevContacts.map(contact =>
        contact.id === contactId ? { ...contact, category } : contact
      )
    );
  };

  // ============================================
  // CSV PROCESSING WITH LASTNAME EXTRACTION
  // ============================================

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.csv')) {
      alert('Please upload a CSV file');
      return;
    }

    setLoadingMessage('Processing CSV file...');
    setShowLoadingModal(true);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const csv = e.target?.result as string;
        const lines = csv.split('\n').filter(line => line.trim() !== '');
        
        if (lines.length < 2) {
          throw new Error('CSV file appears to be empty or invalid');
        }

        const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
        console.log('CSV Headers:', headers);

        // Find column indices
        const nameIndex = headers.findIndex(h => 
          h.toLowerCase().includes('name') && 
          (h.toLowerCase().includes('first') || h.toLowerCase() === 'name')
        );
        const companyIndex = headers.findIndex(h => h.toLowerCase().includes('company'));
        const positionIndex = headers.findIndex(h => 
          h.toLowerCase().includes('position') || h.toLowerCase().includes('title')
        );
        const emailIndex = headers.findIndex(h => h.toLowerCase().includes('email'));

        if (nameIndex === -1 || companyIndex === -1 || emailIndex === -1) {
          throw new Error('CSV must contain Name, Company, and Email columns');
        }

        const newContacts: Contact[] = [];
        let contactId = Math.max(...contacts.map(c => c.id), 0) + 1;

        // Process data rows
        for (let i = 1; i < lines.length; i++) {
          const row = lines[i].split(',').map(cell => cell.trim().replace(/"/g, ''));
          
          if (row.length < headers.length) continue;

          const name = row[nameIndex]?.trim();
          const company = row[companyIndex]?.trim();
          const position = row[positionIndex]?.trim() || 'Not specified';
          const email = row[emailIndex]?.trim();

          // Skip invalid rows
          if (!name || !company || !email) continue;

          // Extract lastName from full name
          const nameParts = name.split(' ').filter(part => part.length > 0);
          const lastName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : '';

          newContacts.push({
            id: contactId++,
            name,
            lastName, // Include extracted lastName
            company,
            position,
            email,
            category: 'Uncategorised',
            isEnriched: false
          });
        }

        setContacts(prevContacts => [...prevContacts, ...newContacts]);
        setShowLoadingModal(false);
        setSuccessMessage(`Successfully imported ${newContacts.length} contacts!`);
        setShowSuccessModal(true);

        // Simulate processing time for better UX
        setTimeout(() => {
          setTasks(prevTasks => prevTasks.map(task => 
            task.text === "Review this week's ideal client list" ? 
            { ...task, completed: true } : task
          ));
        }, 2000);

      } catch (error) {
        setShowLoadingModal(false);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        alert(`Error processing file. Please ensure it's a valid CSV file. ${errorMessage}`);
      }
    };
    reader.readAsText(file);
  };

  // ============================================
  // ENRICHMENT FUNCTION - COMPATIBLE WITH ENRICH.JS
  // ============================================

  const enrichIdealClients = async () => {
    console.log('🚀 Enrichment function called');
    
    // Debug: Check contacts
    console.log('📊 All contacts:', contacts);
    console.log('📊 Total contacts:', contacts.length);
    
    const contactsToEnrich = contacts.filter(c => !c.isEnriched);
    console.log('📊 Contacts to enrich:', contactsToEnrich);
    console.log('📊 Contacts to enrich count:', contactsToEnrich.length);

    if (contactsToEnrich.length === 0) {
      console.log('❌ No contacts to enrich - exiting');
      alert('No contacts to enrich');
      return;
    }

    console.log('📊 Enrichments left:', enrichmentsLeft);
    
    if (enrichmentsLeft < contactsToEnrich.length) {
      console.log('❌ Not enough enrichments left - exiting');
      alert(`You only have ${enrichmentsLeft} enrichments left. Please select specific contacts.`);
      return;
    }

    console.log('✅ All checks passed - starting enrichment');
    setLoadingMessage(`Enriching ${contactsToEnrich.length} contacts with real data...`);
    setShowLoadingModal(true);

    try {
      console.log('🌐 Making API call to /api/enrich');
      
      const response = await fetch('/api/enrich', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ contacts: contactsToEnrich })
      });
      
      console.log('🌐 API response received:', response.status);

      if (!response.ok) {
        throw new Error(`API call failed: ${response.status}`);
      }

      console.log('📥 Parsing response data...');
      const data = await response.json();
      console.log('📥 Response data:', data);

      if (data.error) {
        throw new Error(data.error);
      }

      console.log('🔄 Updating contacts state...');
      // Update contacts with enriched data including lastName
      const updatedContacts = contacts.map(contact => {
        const enrichedContact = data.contacts.find((c: Contact) => c.id === contact.id);
        return enrichedContact || contact;
      });

      console.log('🔄 Updated contacts:', updatedContacts);
      setContacts(updatedContacts);
      console.log('✅ State updated successfully');
      
      setEnrichmentsLeft(prev => prev - contactsToEnrich.length);
      setShowLoadingModal(false);
      setSuccessMessage(`Successfully enriched ${contactsToEnrich.length} contacts with real data!`);
      setShowSuccessModal(true);

    } catch (error) {
      console.error('💥 Error occurred:', error);
      setShowLoadingModal(false);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      alert(`Error enriching contacts: ${errorMessage}`);
    }
  };

  // ============================================
  // AUTHENTICATION FUNCTIONS
  // ============================================

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isSignUp) {
      if (authForm.password !== authForm.confirmPassword) {
        alert('Passwords do not match');
        return;
      }
      if (!authForm.name || !authForm.company) {
        alert('Please fill in all fields');
        return;
      }
    }

    // Simulate authentication
    setIsAuthenticated(true);
    setCurrentView('dashboard');
    
    if (isSignUp) {
      setUser(prev => ({
        ...prev,
        name: authForm.name,
        email: authForm.email,
        company: authForm.company
      }));
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentView('landing');
    setAuthForm({
      email: '',
      password: '',
      confirmPassword: '',
      name: '',
      company: ''
    });
  };

  // ============================================
  // RENDER FUNCTIONS
  // ============================================

  // Landing page component
  const renderLanding = () => (
    <div className="text-center space-y-8">
      <div className="space-y-4">
        <div className="flex items-center justify-center space-x-3 mb-8">
          <div className="w-12 h-12 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center">
            <Sparkles className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white">Glass Slipper</h1>
        </div>
        
        <h2 className="text-3xl md:text-5xl font-bold text-white leading-tight">
          Turn LinkedIn connections into
          <span className="bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent"> qualified leads</span>
        </h2>
        
        <p className="text-xl text-white text-opacity-80 max-w-3xl mx-auto">
          Upload your LinkedIn connections, let AI categorise them intelligently, and get personalised outreach strategies that actually work.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
        <div className="bg-white bg-opacity-10 backdrop-blur rounded-xl p-6 text-center">
          <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Upload className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">Smart Import</h3>
          <p className="text-white text-opacity-70">
            Upload LinkedIn CSV exports and watch as AI intelligently categorises your connections.
          </p>
        </div>

        <div className="bg-white bg-opacity-10 backdrop-blur rounded-xl p-6 text-center">
          <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Target className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">AI Categorisation</h3>
          <p className="text-white text-opacity-70">
            Automatically identify ideal clients, referral partners, and competitors from your network.
          </p>
        </div>

        <div className="bg-white bg-opacity-10 backdrop-blur rounded-xl p-6 text-center">
          <div className="w-16 h-16 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Zap className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">Personalised Outreach</h3>
          <p className="text-white text-opacity-70">
            Get tailored messaging strategies and content suggestions for each contact category.
          </p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <button
          onClick={() => setCurrentView('auth')}
          className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black px-8 py-4 rounded-lg font-semibold hover:from-yellow-500 hover:to-orange-600 transition-all duration-200 flex items-center justify-center space-x-2"
        >
          <span>Get Started Free</span>
          <ArrowRight className="w-5 h-5" />
        </button>
        
        <button 
          onClick={() => setCurrentView('demo')}
          className="bg-white bg-opacity-20 text-white px-8 py-4 rounded-lg font-semibold hover:bg-opacity-30 transition-all duration-200"
        >
          Watch Demo
        </button>
      </div>

      <div className="bg-white bg-opacity-10 backdrop-blur rounded-xl p-6 max-w-md mx-auto">
        <div className="flex items-center space-x-4">
          <Shield className="w-8 h-8 text-green-400" />
          <div className="text-left">
            <h4 className="text-white font-semibold">Completely Secure</h4>
            <p className="text-white text-opacity-70 text-sm">Your data is encrypted and never shared with third parties.</p>
          </div>
        </div>
      </div>
    </div>
  );

  // Authentication component
  const renderAuth = () => (
    <div className="max-w-md mx-auto">
      <div className="bg-white bg-opacity-10 backdrop-blur rounded-xl p-8">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white">Glass Slipper</h2>
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">
            {isSignUp ? 'Create Your Account' : 'Welcome Back'}
          </h3>
          <p className="text-white text-opacity-70">
            {isSignUp ? 'Get started with Glass Slipper today' : 'Sign in to your Glass Slipper account'}
          </p>
        </div>

        <form onSubmit={handleAuth} className="space-y-6">
          {isSignUp && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-white text-sm font-medium mb-2">Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white text-opacity-50" />
                    <input
                      type="text"
                      value={authForm.name}
                      onChange={(e) => setAuthForm(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full pl-10 pr-4 py-3 bg-white bg-opacity-20 text-white placeholder-white placeholder-opacity-50 rounded-lg focus:bg-opacity-30 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                      placeholder="Your name"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-white text-sm font-medium mb-2">Company</label>
                  <div className="relative">
                    <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white text-opacity-50" />
                    <input
                      type="text"
                      value={authForm.company}
                      onChange={(e) => setAuthForm(prev => ({ ...prev, company: e.target.value }))}
                      className="w-full pl-10 pr-4 py-3 bg-white bg-opacity-20 text-white placeholder-white placeholder-opacity-50 rounded-lg focus:bg-opacity-30 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                      placeholder="Your company"
                    />
                  </div>
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block text-white text-sm font-medium mb-2">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white text-opacity-50" />
              <input
                type="email"
                value={authForm.email}
                onChange={(e) => setAuthForm(prev => ({ ...prev, email: e.target.value }))}
                className="w-full pl-10 pr-4 py-3 bg-white bg-opacity-20 text-white placeholder-white placeholder-opacity-50 rounded-lg focus:bg-opacity-30 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                placeholder="Enter your email"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-white text-sm font-medium mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white text-opacity-50" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={authForm.password}
                  onChange={(e) => setAuthForm(prev => ({ ...prev, password: e.target.value }))}
                  className="w-full pl-10 pr-10 py-3 bg-white bg-opacity-20 text-white placeholder-white placeholder-opacity-50 rounded-lg focus:bg-opacity-30 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  placeholder="Enter password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white text-opacity-50 hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {isSignUp && (
              <div>
                <label className="block text-white text-sm font-medium mb-2">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white text-opacity-50" />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={authForm.confirmPassword}
                    onChange={(e) => setAuthForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    className="w-full pl-10 pr-10 py-3 bg-white bg-opacity-20 text-white placeholder-white placeholder-opacity-50 rounded-lg focus:bg-opacity-30 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                    placeholder="Confirm password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white text-opacity-50 hover:text-white"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            )}
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 text-black py-3 rounded-lg font-semibold hover:from-yellow-500 hover:to-orange-600 transition-all duration-200"
          >
            {isSignUp ? 'Create Account' : 'Sign In'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-white text-opacity-70 hover:text-white"
          >
            {isSignUp ? 'Already have an account? Sign in here' : "Don't have an account? Sign up here"}
          </button>
        </div>

        <div className="mt-6 text-center">
          <button
            onClick={() => setCurrentView('landing')}
            className="text-white text-opacity-50 hover:text-white text-sm"
          >
            ← Back to home
          </button>
        </div>
      </div>
    </div>
  );

  // Main dashboard
  const renderDashboard = () => (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-white bg-opacity-10 backdrop-blur rounded-xl p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">Welcome back, {user.name}!</h2>
            <p className="text-white text-opacity-70">Here's what's happening with your business network</p>
          </div>
          <div className="text-right">
            <div className="text-sm text-white text-opacity-70">Enrichments Remaining</div>
            <div className="text-2xl font-bold text-yellow-400">{enrichmentsLeft}</div>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white bg-opacity-10 backdrop-blur rounded-xl p-6 text-center">
          <Users className="w-8 h-8 text-blue-400 mx-auto mb-2" />
          <div className="text-2xl font-bold text-white">{contacts.length}</div>
          <div className="text-white text-opacity-70 text-sm">Total Contacts</div>
        </div>
        
        <div className="bg-white bg-opacity-10 backdrop-blur rounded-xl p-6 text-center">
          <Target className="w-8 h-8 text-green-400 mx-auto mb-2" />
          <div className="text-2xl font-bold text-white">{idealClientsList.length}</div>
          <div className="text-white text-opacity-70 text-sm">Ideal Clients</div>
        </div>
        
        <div className="bg-white bg-opacity-10 backdrop-blur rounded-xl p-6 text-center">
          <UserCheck className="w-8 h-8 text-purple-400 mx-auto mb-2" />
          <div className="text-2xl font-bold text-white">{referralPartnersList.length}</div>
          <div className="text-white text-opacity-70 text-sm">Referral Partners</div>
        </div>
        
        <div className="bg-white bg-opacity-10 backdrop-blur rounded-xl p-6 text-center">
          <Briefcase className="w-8 h-8 text-orange-400 mx-auto mb-2" />
          <div className="text-2xl font-bold text-white">{competitorsList.length}</div>
          <div className="text-white text-opacity-70 text-sm">Competitors</div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white bg-opacity-10 backdrop-blur rounded-xl p-6">
        <h3 className="text-xl font-semibold text-white mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 flex items-center space-x-3"
          >
            <Upload className="w-5 h-5" />
            <span>Import Contacts</span>
          </button>
          
          <button
            onClick={enrichIdealClients}
            className="bg-gradient-to-r from-green-500 to-green-600 text-white p-4 rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-200 flex items-center space-x-3"
            disabled={contacts.filter(c => !c.isEnriched).length === 0}
          >
            <Zap className="w-5 h-5" />
            <span>Enrich Contacts</span>
          </button>
          
          <button
            onClick={() => setCurrentView('strategy')}
            className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-4 rounded-lg hover:from-purple-600 hover:to-purple-700 transition-all duration-200 flex items-center space-x-3"
          >
            <Target className="w-5 h-5" />
            <span>Build Strategy</span>
          </button>
        </div>
      </div>

      {/* Recent Activities */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white bg-opacity-10 backdrop-blur rounded-xl p-6">
          <h3 className="text-xl font-semibold text-white mb-4">Recent Tasks</h3>
          <div className="space-y-3">
            {tasks.slice(0, 3).map(task => (
              <div key={task.id} className="flex items-center space-x-3">
                <div className={`w-4 h-4 rounded-full ${task.completed ? 'bg-green-400' : 'bg-gray-400'}`} />
                <span className={`text-white ${task.completed ? 'opacity-70 line-through' : ''}`}>
                  {task.text}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white bg-opacity-10 backdrop-blur rounded-xl p-6">
          <h3 className="text-xl font-semibold text-white mb-4">Weekly Progress</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-white text-sm mb-2">
                <span>Ideal Clients Selected</span>
                <span>{dailyTasks.chooseIdealClients.count}/{dailyTasks.chooseIdealClients.total}</span>
              </div>
              <div className="w-full bg-white bg-opacity-20 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-yellow-400 to-orange-500 h-2 rounded-full"
                  style={{ width: `${(dailyTasks.chooseIdealClients.count! / dailyTasks.chooseIdealClients.total!) * 100}%` }}
                />
              </div>
            </div>
            
            <div>
              <div className="flex justify-between text-white text-sm mb-2">
                <span>Posts Commented</span>
                <span>{dailyTasks.commentOnPosts.count}/{dailyTasks.commentOnPosts.total}</span>
              </div>
              <div className="w-full bg-white bg-opacity-20 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-green-400 to-green-500 h-2 rounded-full"
                  style={{ width: `${(dailyTasks.commentOnPosts.count! / dailyTasks.commentOnPosts.total!) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Contact management with lastName display
  const renderContacts = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        <div>
          <h2 className="text-2xl font-bold text-white">Contact Management</h2>
          <p className="text-white text-opacity-70">Manage and categorise your LinkedIn connections</p>
        </div>
        
        <div className="flex space-x-3">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 flex items-center space-x-2"
          >
            <Upload className="w-4 h-4" />
            <span>Import CSV</span>
          </button>
          
          <button
            onClick={enrichIdealClients}
            className="bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-2 rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-200 flex items-center space-x-2"
            disabled={contacts.filter(c => !c.isEnriched).length === 0}
          >
            <Zap className="w-4 h-4" />
            <span>Enrich All</span>
          </button>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white bg-opacity-10 backdrop-blur rounded-xl p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white text-opacity-50" />
            <input
              type="text"
              placeholder="Search contacts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white bg-opacity-20 text-white placeholder-white placeholder-opacity-50 rounded-lg focus:bg-opacity-30 focus:outline-none focus:ring-2 focus:ring-yellow-400"
            />
          </div>
          
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white text-opacity-50" />
            <select
              value={selectedFilter}
              onChange={(e) => setSelectedFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white bg-opacity-20 text-white rounded-lg focus:bg-opacity-30 focus:outline-none focus:ring-2 focus:ring-yellow-400 appearance-none"
            >
              <option value="All">All Categories</option>
              <option value="Ideal Client">Ideal Clients</option>
              <option value="Referral Partners">Referral Partners</option>
              <option value="Competitors">Competitors</option>
              <option value="Other">Other</option>
              <option value="Uncategorised">Uncategorised</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white text-opacity-50 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Contact List */}
      <div className="bg-white bg-opacity-10 backdrop-blur rounded-xl p-6">
        <div className="space-y-4">
          {filteredContacts.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-white text-opacity-30 mx-auto mb-4" />
              <h3 className="text-xl text-white text-opacity-70 mb-2">No contacts found</h3>
              <p className="text-white text-opacity-50">
                {contacts.length === 0 
                  ? "Upload a CSV file to get started" 
                  : "Try adjusting your search or filter criteria"
                }
              </p>
            </div>
          ) : (
            filteredContacts.map(contact => (
              <div key={contact.id} className="bg-white bg-opacity-10 rounded-lg p-4 hover:bg-opacity-20 transition-all duration-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-semibold">
                        {contact.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                      </span>
                    </div>
                    
                    <div>
                      <h4 className="text-white font-semibold">
                        {contact.name}
                        {contact.lastName && (
                          <span className="text-white text-opacity-70 ml-2 text-sm">
                            (Last: {contact.lastName})
                          </span>
                        )}
                      </h4>
                      <p className="text-white text-opacity-70 text-sm">{contact.position}</p>
                      <p className="text-white text-opacity-60 text-sm">{contact.company}</p>
                      {contact.isEnriched && contact.industry && (
                        <p className="text-white text-opacity-50 text-xs mt-1">
                          Industry: {contact.industry}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    {contact.isEnriched && (
                      <div className="flex items-center space-x-2 text-green-400">
                        <CheckCircle className="w-4 h-4" />
                        <span className="text-sm">Enriched</span>
                      </div>
                    )}
                    
                    <div className="flex items-center space-x-2">
                      <select
                        value={contact.category || 'Uncategorised'}
                        onChange={(e) => updateCategory(contact.id, e.target.value)}
                        className="bg-white bg-opacity-20 text-white text-sm px-3 py-1 rounded border border-white border-opacity-30 focus:bg-opacity-30 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                      >
                        <option value="Uncategorised">Uncategorised</option>
                        <option value="Ideal Client">Ideal Client</option>
                        <option value="Referral Partners">Referral Partners</option>
                        <option value="Competitors">Competitors</option>
                        <option value="Other">Other</option>
                      </select>
                      
                      <button
                        onClick={() => setSelectedContact(contact)}
                        className="text-white text-opacity-70 hover:text-white p-2"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Contact Detail Modal */}
      {selectedContact && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white bg-opacity-10 backdrop-blur rounded-xl p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-white">Contact Details</h3>
              <button
                onClick={() => setSelectedContact(null)}
                className="text-white text-opacity-70 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Contact Info */}
            <div className="bg-white bg-opacity-10 rounded-lg p-4 mb-6">
              <div className="flex items-start space-x-4">
                <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-xl">
                    {selectedContact.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </span>
                </div>
                
                <div className="flex-1">
                  <h4 className="text-lg font-semibold text-white">{selectedContact.name}</h4>
                  {selectedContact.lastName && (
                    <p className="text-white text-opacity-60 text-sm">Last Name: {selectedContact.lastName}</p>
                  )}
                  <p className="text-white text-opacity-70">{selectedContact.position}</p>
                  <p className="text-white text-opacity-70">{selectedContact.company}</p>
                  
                  <div className="mt-3 space-y-2">
                    <div className="flex items-center space-x-2">
                      <Mail className="w-4 h-4 text-blue-400" />
                      <span className="text-white text-sm">{selectedContact.email}</span>
                    </div>
                    
                    {selectedContact.isEnriched && (
                      <>
                        {selectedContact.phone && (
                          <div className="flex items-center space-x-2">
                            <Phone className="w-4 h-4 text-green-400" />
                            <span className="text-white text-sm">{selectedContact.phone}</span>
                          </div>
                        )}
                        {selectedContact.website && (
                          <div className="flex items-center space-x-2">
                            <Globe className="w-4 h-4 text-purple-400" />
                            <span className="text-white text-sm">{selectedContact.website}</span>
                          </div>
                        )}
                        {selectedContact.industry && (
                          <div className="flex items-center space-x-2">
                            <Briefcase className="w-4 h-4 text-orange-400" />
                            <span className="text-white text-sm">{selectedContact.industry}</span>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Category Selection */}
            <div className="mb-6">
              <label className="block text-white text-sm font-medium mb-2">Category</label>
              <select
                value={selectedContact.category || 'Uncategorised'}
                onChange={(e) => {
                  updateCategory(selectedContact.id, e.target.value);
                  setSelectedContact(prev => prev ? { ...prev, category: e.target.value } : null);
                }}
                className="w-full bg-white bg-opacity-20 text-white px-4 py-3 rounded-lg border border-white border-opacity-30 focus:bg-opacity-30 focus:outline-none focus:ring-2 focus:ring-yellow-400"
              >
                <option value="Uncategorised">Uncategorised</option>
                <option value="Ideal Client">Ideal Client</option>
                <option value="Referral Partners">Referral Partners</option>
                <option value="Competitors">Competitors</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setSelectedContact(null)}
                className="flex-1 bg-white bg-opacity-20 text-white py-3 rounded-lg hover:bg-opacity-30 transition-all duration-200"
              >
                Close
              </button>
              {!selectedContact.isEnriched && (
                <button
                  onClick={() => {
                    // Enrich single contact logic would go here
                    setSelectedContact(null);
                  }}
                  className="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white py-3 rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-200"
                >
                  Enrich
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // Render main navigation
  const renderNavigation = () => (
    <nav className="bg-white bg-opacity-10 backdrop-blur rounded-xl p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-white">Glass Slipper</span>
            <span className="text-xs bg-yellow-400 text-black px-2 py-1 rounded-full font-medium">v1.0 Beta</span>
          </div>
          
          <div className="hidden md:flex items-center space-x-1">
            {navigationItems.map(item => (
              <button
                key={item.view}
                onClick={() => setCurrentView(item.view)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                  currentView === item.view
                    ? 'bg-white bg-opacity-20 text-white'
                    : 'text-white text-opacity-70 hover:text-white hover:bg-white hover:bg-opacity-10'
                }`}
              >
                <item.icon className="w-4 h-4" />
                <span className="text-sm">{item.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="text-right hidden md:block">
            <div className="text-white font-medium">{user.name}</div>
            <div className="text-white text-opacity-70 text-sm">{user.company}</div>
          </div>
          
          <button
            onClick={handleLogout}
            className="text-white text-opacity-70 hover:text-white p-2"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    </nav>
  );

  // ============================================
  // MAIN RENDER
  // ============================================

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 p-4">
      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept=".csv"
        className="hidden"
      />

      <div className="max-w-7xl mx-auto">
        {isAuthenticated && renderNavigation()}
        
        <div className={`${isAuthenticated ? 'mt-6' : ''}`}>
          {!isAuthenticated ? (
            <>
              {currentView === 'landing' && renderLanding()}
              {currentView === 'auth' && renderAuth()}
            </>
          ) : (
            <>
              {currentView === 'dashboard' && renderDashboard()}
              {currentView === 'contacts' && renderContacts()}
              {currentView === 'strategy' && (
                <div className="text-center py-12">
                  <Target className="w-16 h-16 text-white text-opacity-30 mx-auto mb-4" />
                  <h3 className="text-xl text-white text-opacity-70">Strategy Builder</h3>
                  <p className="text-white text-opacity-50">Coming soon...</p>
                </div>
              )}
              {currentView === 'content' && (
                <div className="text-center py-12">
                  <FileText className="w-16 h-16 text-white text-opacity-30 mx-auto mb-4" />
                  <h3 className="text-xl text-white text-opacity-70">Content Creation</h3>
                  <p className="text-white text-opacity-50">Coming soon...</p>
                </div>
              )}
              {currentView === 'settings' && (
                <div className="text-center py-12">
                  <Settings className="w-16 h-16 text-white text-opacity-30 mx-auto mb-4" />
                  <h3 className="text-xl text-white text-opacity-70">Settings</h3>
                  <p className="text-white text-opacity-50">Coming soon...</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white bg-opacity-10 backdrop-blur rounded-xl p-6 max-w-md w-full text-center">
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Success!</h3>
            <p className="text-white text-opacity-70 mb-6">{successMessage}</p>
            <button
              onClick={() => setShowSuccessModal(false)}
              className="bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-3 rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-200"
            >
              Continue
            </button>
          </div>
        </div>
      )}

      {/* Loading Modal */}
      {showLoadingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white bg-opacity-10 backdrop-blur rounded-xl p-6 max-w-md w-full text-center">
            <div className="w-16 h-16 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <h3 className="text-xl font-semibold text-white mb-2">Processing...</h3>
            <p className="text-white text-opacity-70">{loadingMessage}</p>
          </div>
        </div>
      )}
    </div>
  );
}