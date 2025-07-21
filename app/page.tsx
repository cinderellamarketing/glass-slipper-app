'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';

import { Mail, Lock, Eye, EyeOff, ArrowRight, Sparkles, Shield, Users, Upload, Target, UserCheck, Building, BarChart3, Calendar, Settings, CheckCircle, User, Briefcase, Plus, TrendingUp, Zap, Menu, FileText, LogOut, Check, Phone, Globe, X, ChevronDown, Search, ChevronLeft, MessageSquare, Bell, TrendingDown, Award, AlertCircle, Edit2, Trash2, DollarSign, Clock, Activity, BookOpen, Download, Send, Copy, Share2, Star, Link, RefreshCw, Filter, MoreVertical, MapPin } from 'lucide-react';

// Complete TypeScript interfaces
interface Contact {
  id: number;
  name: string;
  company: string;
  position: string;
  email: string;
  category?: string;
  isEnriched?: boolean;
  phone?: string;
  website?: string;
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
// API CONFIGURATION  
// ============================================
//
// API calls now go through Next.js API routes (no CORS issues!)
// Serper and Claude API keys are stored server-side in .env.local
//

const GlassSlipperApp = () => {
  // User session state
  const [currentUser, setCurrentUser] = useState<User>({
    name: 'John Smith',
    email: 'john@example.com', 
    company: 'Growth Dynamics Ltd',
    businessType: 'Consulting',
    targetMarket: 'B2B SaaS',
    writingStyle: 'Professional yet conversational',
    referralPartners: 'Accountants, Business Coaches'
  });

  // Auth state
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [authView, setAuthView] = useState<'landing' | 'login' | 'register'>('landing');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [authForm, setAuthForm] = useState<AuthForm>({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    company: ''
  });

  // UI state
  const [currentView, setCurrentView] = useState<string>('dashboard');
  const [showMobileMenu, setShowMobileMenu] = useState<boolean>(false);
  const [showContactModal, setShowContactModal] = useState<boolean>(false);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [showLoadingModal, setShowLoadingModal] = useState<boolean>(false);
  const [loadingMessage, setLoadingMessage] = useState<string>('');
  const [showSuccessModal, setShowSuccessModal] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [showLeadMagnetModal, setShowLeadMagnetModal] = useState<boolean>(false);
  const [selectedLeadMagnet, setSelectedLeadMagnet] = useState<LeadMagnet | null>(null);
  const [showSettingsModal, setShowSettingsModal] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Business state
  const [user, setUser] = useState<User>(currentUser);
  const [contacts, setContacts] = useState<Contact[]>([]); // Start with empty contacts
  const [categories] = useState(['Ideal Client', 'Referral Partners', 'Competitors', 'Other']);

  // Search and filter state
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');

  // Filtered contacts
  const filteredContacts = contacts.filter((contact: Contact) => {
    const matchesSearch = contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.position.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'All' || contact.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  // Strategy state
  const [strategy, setStrategy] = useState<Strategy>({
    oneOffer: '',
    idealReferralPartners: '',
    specialFactors: '',
    generatedStrategy: ''
  });

  // Lead magnets state
  const [leadMagnets, setLeadMagnets] = useState<LeadMagnet[]>([]); // Start with empty lead magnets

  // Enrichments counter
  const [enrichmentsLeft, setEnrichmentsLeft] = useState<number>(50);

  // Main onboarding tasks
  const [tasks, setTasks] = useState<Task[]>([
    { id: 1, text: 'Upload your LinkedIn connections', completed: false, priority: 'high' },
    { id: 2, text: 'Configure your business settings', completed: false, priority: 'high' },
    { id: 3, text: 'Enrich your contacts with real data', completed: false, priority: 'medium' },
    { id: 4, text: 'Auto-categorise your contacts', completed: false, priority: 'medium' },
    { id: 5, text: 'Generate your LinkedIn strategy', completed: false, priority: 'medium' },
    { id: 6, text: 'Create your first lead magnet', completed: false, priority: 'low' }
  ]);

  // Contact task management state
  const [contactTasks, setContactTasks] = useState<Record<number, Record<string, ContactTaskStatus>>>({});

  // Daily tasks state
  const [dailyTasks, setDailyTasks] = useState<DailyTasks>({
    chooseIdealClients: { completed: false, count: 0, total: 5 },
    commentOnPosts: { completed: false, count: 0, total: 5 },
    postContent: { completed: false },
    lastReset: new Date().toDateString()
  });

  // Track which ideal client is currently being shown in dashboard
  const [currentIdealClientIndex, setCurrentIdealClientIndex] = useState<number>(0);

  // UPDATED: File upload handler (unchanged)
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setLoadingMessage('Processing your LinkedIn connections...');
    setShowLoadingModal(true);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        if (!e.target?.result) {
          throw new Error('Failed to read file');
        }
        const text = e.target.result as string;
        const lines = text.split('\n').filter(line => line.trim());
        const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));

        const nameIndex = headers.findIndex(h => h.toLowerCase().includes('name'));
        const companyIndex = headers.findIndex(h => h.toLowerCase().includes('company'));
        const positionIndex = headers.findIndex(h => h.toLowerCase().includes('position') || h.toLowerCase().includes('title'));
        const emailIndex = headers.findIndex(h => h.toLowerCase().includes('email'));

        const newContacts: Contact[] = [];

        for (let i = 1; i < lines.length; i++) {
          const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
          if (values.length > 1 && values[nameIndex] && values[nameIndex] !== '') {
            const contact: Contact = {
              id: Date.now() + i,
              name: values[nameIndex] || 'Unknown',
              company: values[companyIndex] || 'Unknown Company',
              position: values[positionIndex] || 'Unknown Position',
              email: values[emailIndex] || `contact${i}@example.com`,
              category: 'Uncategorised',
              isEnriched: false,
              phone: 'Not found',
              website: 'Not found'
            };
            newContacts.push(contact);
          }
        }

        setTimeout(() => {
          setContacts(prev => [...prev, ...newContacts]);
          setShowLoadingModal(false);
          setSuccessMessage(`Successfully uploaded ${newContacts.length} contacts!`);
          setShowSuccessModal(true);
          // Mark task as complete
          setTasks(prev => prev.map(task =>
            task.id === 1 ? { ...task, completed: true } : task
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

  // UPDATED: Enrich contacts using Next.js API route - ALLOW ALL CONTACTS
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
    // ... rest of function
  } catch (error) {
    console.error('💥 Error occurred:', error);
  }
};
  // UPDATED: AI categorisation using Next.js API route
  const aiCategorizeAll = async () => {
    setLoadingMessage('AI is categorising your contacts using enriched data...');
    setShowLoadingModal(true);

    try {
      // Call our Next.js API route instead of direct Claude API
      const response = await fetch('/api/categorize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contacts: contacts,
          userProfile: user
        })
      });

      if (!response.ok) {
        throw new Error(`API call failed: ${response.status}`);
      }

      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }

      setContacts(data.contacts);
      setShowLoadingModal(false);
      setSuccessMessage('Successfully categorised all contacts using AI and enriched data!');
      setShowSuccessModal(true);
      // Mark categorization task as complete (now task 4)
      setTasks(prev => prev.map(task =>
        task.id === 4 ? { ...task, completed: true } : task
      ));

    } catch (error) {
      console.error('Categorization failed:', error);
      setShowLoadingModal(false);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      alert(`AI categorization failed: ${errorMessage}. Please try again.`);
    }
  };

  // UPDATED: Generate strategy using Next.js API route
  const generateStrategy = async () => {
    if (!strategy.oneOffer || !strategy.idealReferralPartners) {
      alert('Please fill in all required fields before generating strategy.');
      return;
    }

    setLoadingMessage('Generating your personalised LinkedIn strategy...');
    setShowLoadingModal(true);

    try {
      // Call our Next.js API route
      const response = await fetch('/api/strategy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          strategy: strategy,
          userProfile: user
        })
      });

      if (!response.ok) {
        throw new Error(`API call failed: ${response.status}`);
      }

      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }

      setStrategy(prev => ({
        ...prev,
        generatedStrategy: data.generatedStrategy
      }));

      setShowLoadingModal(false);
      setSuccessMessage('Your LinkedIn strategy has been generated!');
      setShowSuccessModal(true);
      // Mark strategy task as complete (now task 5)
      setTasks(prev => prev.map(task =>
        task.id === 5 ? { ...task, completed: true } : task
      ));

    } catch (error) {
      console.error('Strategy generation failed:', error);
      setShowLoadingModal(false);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      alert(`Strategy generation failed: ${errorMessage}. Please try again.`);
    }
  };

  // Generate lead magnet function
  const generateLeadMagnet = () => {
    if (!strategy.generatedStrategy) {
      alert('Please generate your LinkedIn strategy first.');
      return;
    }

    setLoadingMessage('Creating your lead magnet...');
    setShowLoadingModal(true);

    setTimeout(() => {
      const titles = [
        `The Ultimate ${user.targetMarket} Growth Guide`,
        `7 Proven Strategies for ${user.targetMarket} Success`,
        `How to Scale Your ${user.businessType} Business in 2024`,
        `The Complete ${user.targetMarket} Playbook`,
        `Insider Secrets: ${user.targetMarket} Best Practices`
      ];

      const newLeadMagnet: LeadMagnet = {
        id: Date.now(),
        title: titles[Math.floor(Math.random() * titles.length)],
        description: `A comprehensive guide tailored for ${user.targetMarket} professionals, featuring proven strategies, case studies, and actionable insights from industry leaders.`,
        type: 'PDF Guide',
        created: new Date().toISOString().split('T')[0],
        downloads: 0,
        content: `
# ${titles[Math.floor(Math.random() * titles.length)]}

## Table of Contents

1. Introduction to ${user.targetMarket}
2. Current Market Challenges  
3. Proven Growth Strategies
4. Case Studies and Success Stories
5. Implementation Roadmap
6. Tools and Resources
7. Next Steps

## Chapter 1: Introduction

Welcome to your comprehensive guide for ${user.targetMarket} success. This guide has been specifically created for professionals like you who are looking to accelerate their growth and overcome common industry challenges.

## Chapter 2: Market Analysis

The ${user.targetMarket} landscape is evolving rapidly. Here are the key trends and challenges:

- Digital transformation acceleration
- Increased competition for talent  
- Rising customer expectations
- Need for operational efficiency

## Chapter 3: Growth Strategies

Based on analysis of successful ${user.targetMarket} companies, here are the top strategies:

### Strategy 1: Customer-Centric Approach

Focus on delivering exceptional customer value through:

- Personalised service delivery
- Proactive communication
- Continuous improvement based on feedback

### Strategy 2: Digital Optimisation

Leverage technology to:

- Streamline operations
- Improve customer experience
- Enhance data-driven decision making

### Strategy 3: Strategic Partnerships

Build relationships with complementary businesses to:

- Expand market reach
- Share resources and expertise
- Create win-win opportunities

## Implementation Roadmap

**Phase 1 (Months 1-2):** Assessment and Planning

**Phase 2 (Months 3-4):** Implementation and Testing

**Phase 3 (Months 5-6):** Optimisation and Scaling

## Conclusion

Success in ${user.targetMarket} requires a systematic approach, continuous learning, and strategic execution. Use this guide as your roadmap to sustainable growth.

---

*This guide was created specifically for ${user.company} and reflects current industry best practices.*

`
      };

      setLeadMagnets(prev => [newLeadMagnet, ...prev]);
      setShowLoadingModal(false);
      setSuccessMessage('Your lead magnet has been created!');
      setShowSuccessModal(true);
      // Mark lead magnet task as complete (now task 6)
      setTasks(prev => prev.map(task =>
        task.id === 6 ? { ...task, completed: true } : task
      ));
    }, 2500);
  };

  // Daily task functions
  const toggleDailyTask = (taskKey: keyof DailyTasks) => {
    setDailyTasks(prev => {
      const updated = { ...prev };
      if (taskKey === 'postContent') {
        updated.postContent.completed = !updated.postContent.completed;
      } else if (taskKey === 'chooseIdealClients' || taskKey === 'commentOnPosts') {
        if (updated[taskKey].completed) {
          updated[taskKey].completed = false;
          updated[taskKey].count = 0;
        } else {
          updated[taskKey].completed = true;
          updated[taskKey].count = updated[taskKey].total || 0;
        }
      }
      return updated;
    });
  };

  // Update contact category
  const updateCategory = (contactId: number, newCategory: string) => {
    setContacts(prev =>
      prev.map(contact =>
        contact.id === contactId
          ? { ...contact, category: newCategory }
          : contact
      )
    );
  };

  // Delete contact
  const deleteContact = (contactId: number) => {
    setContacts(prev => prev.filter(c => c.id !== contactId));
    setShowContactModal(false);
    setSuccessMessage('Contact deleted successfully!');
    setShowSuccessModal(true);
  };

  // Contact task functions
  const getTaskStatus = (contactId: number, taskKey: string): ContactTaskStatus => {
    return contactTasks[contactId]?.[taskKey] || { completed: false, completedDate: null };
  };

  const toggleContactTask = (contactId: number, taskKey: string) => {
    setContactTasks(prev => ({
      ...prev,
      [contactId]: {
        ...prev[contactId],
        [taskKey]: {
          completed: !getTaskStatus(contactId, taskKey).completed,
          completedDate: !getTaskStatus(contactId, taskKey).completed ? new Date().toISOString() : null
        }
      }
    }));
  };

  // Download lead magnet
  const downloadLeadMagnet = (leadMagnet: LeadMagnet) => {
    const element = document.createElement('a');
    const file = new Blob([leadMagnet.content], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `${leadMagnet.title.replace(/[^a-z0-9]/gi, '_')}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);

    // Update download count
    setLeadMagnets(prev => prev.map(lm =>
      lm.id === leadMagnet.id ? { ...lm, downloads: lm.downloads + 1 } : lm
    ));
  };

  // Form validation
  const validateAuthForm = () => {
    if (!authForm.email || !authForm.password) return false;
    if (authView === 'register' && (!authForm.name || !authForm.company || !authForm.confirmPassword)) return false;
    if (authView === 'register' && authForm.password !== authForm.confirmPassword) return false;
    return true;
  };

  // Authentication handlers
  const handleAuth = () => {
    if (!validateAuthForm()) return;

    setUser({
      name: authForm.name || currentUser.name,
      email: authForm.email,
      company: authForm.company || currentUser.company,
      businessType: user.businessType,
      targetMarket: user.targetMarket,
      writingStyle: user.writingStyle,
      referralPartners: user.referralPartners
    });

    setIsAuthenticated(true);
    setAuthForm({ email: '', password: '', confirmPassword: '', name: '', company: '' });
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setAuthView('landing');
    setCurrentView('dashboard');
  };

  // Close modals
  const closeModals = () => {
    setShowContactModal(false);
    setShowLoadingModal(false);
    setShowSuccessModal(false);
    setShowLeadMagnetModal(false);
    setShowSettingsModal(false);
    setSelectedContact(null);
    setSelectedLeadMagnet(null);
  };

  // Save settings
  const saveSettings = () => {
    setShowLoadingModal(true);
    setLoadingMessage('Saving your settings...');
    setTimeout(() => {
      setShowLoadingModal(false);
      setShowSettingsModal(false);
      setSuccessMessage('Settings saved successfully!');
      setShowSuccessModal(true);
      // Mark task as complete
      setTasks(prev => prev.map(task =>
        task.id === 2 ? { ...task, completed: true } : task
      ));
    }, 1000);
  };

  // Stats calculations
  const totalContacts = contacts.length;
  const idealClients = contacts.filter(c => c.category === 'Ideal Client').length;
  const enrichedContacts = contacts.filter(c => c.isEnriched).length;
  const referralPartners = contacts.filter(c => c.category === 'Referral Partners').length;

  // Get current ideal client for dashboard
  const idealClientsList = contacts.filter(c => c.category === 'Ideal Client').sort((a, b) => a.name.localeCompare(b.name));
  const currentIdealClient = idealClientsList[currentIdealClientIndex] || null;

  // Mobile menu items
  const navigationItems: NavigationItem[] = [
    { view: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { view: 'contacts', label: 'Contacts', icon: Users },
    { view: 'strategy', label: 'Strategy', icon: Target },
    { view: 'lead-magnets', label: 'Lead Magnets', icon: FileText },
    { view: 'tasks', label: 'Tasks', icon: CheckCircle },
    { view: 'settings', label: 'Settings', icon: Settings }
  ];

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {authView === 'landing' && (
            <div className="text-center space-y-8">
              <div className="space-y-4">
                <div className="flex items-center justify-center space-x-3">
                  <div className="w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center">
                    <Sparkles className="w-6 h-6 text-purple-900" />
                  </div>
                  <h1 className="text-3xl font-bold text-white">Glass Slipper</h1>
                </div>
                <p className="text-xl text-white text-opacity-90">AI-Powered ABM Platform</p>
                <p className="text-white text-opacity-70">Transform your LinkedIn connections into strategic business relationships</p>
              </div>

              <div className="bg-white bg-opacity-10 backdrop-blur rounded-xl p-6 space-y-4">
                <div className="flex items-center space-x-3 text-white">
                  <Shield className="w-5 h-5 text-green-400" />
                  <span>AI-powered contact categorisation</span>
                </div>
                <div className="flex items-center space-x-3 text-white">
                  <Users className="w-5 h-5 text-blue-400" />
                  <span>LinkedIn relationship intelligence</span>
                </div>
                <div className="flex items-center space-x-3 text-white">
                  <Target className="w-5 h-5 text-purple-400" />
                  <span>Automated ABM workflows</span>
                </div>
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => setAuthView('register')}
                  className="w-full bg-yellow-400 hover:bg-yellow-500 text-purple-900 py-3 rounded-lg font-semibold transition-all"
                >
                  Get Started Free
                </button>
                <button
                  onClick={() => setAuthView('login')}
                  className="w-full bg-white bg-opacity-20 hover:bg-opacity-30 text-white py-3 rounded-lg font-medium transition-all"
                >
                  Sign In
                </button>
              </div>
            </div>
          )}

          {authView === 'login' && (
            <div className="bg-white bg-opacity-10 backdrop-blur rounded-xl p-8">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-white mb-2">Welcome Back</h2>
                <p className="text-white text-opacity-70">Sign in to your Glass Slipper account</p>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-white text-sm font-medium mb-2">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white text-opacity-50" />
                    <input
                      type="email"
                      value={authForm.email}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAuthForm(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full pl-10 pr-4 py-3 bg-white bg-opacity-20 text-white placeholder-white placeholder-opacity-50 rounded-lg focus:bg-opacity-30 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                      placeholder="Enter your email"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-white text-sm font-medium mb-2">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white text-opacity-50" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={authForm.password}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAuthForm(prev => ({ ...prev, password: e.target.value }))}
                      className="w-full pl-10 pr-12 py-3 bg-white bg-opacity-20 text-white placeholder-white placeholder-opacity-50 rounded-lg focus:bg-opacity-30 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                      placeholder="Enter your password"
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
                  onClick={handleAuth}
                  disabled={!validateAuthForm()}
                  className="w-full bg-yellow-400 hover:bg-yellow-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-purple-900 py-3 rounded-lg font-semibold transition-all flex items-center justify-center space-x-2"
                >
                  <span>Sign In</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>

              <p className="text-center text-white text-opacity-70 text-sm mt-6">
                Don't have an account?{' '}
                <button onClick={() => setAuthView('register')} className="text-yellow-400 hover:underline">
                  Sign up here
                </button>
              </p>
            </div>
          )}

          {authView === 'register' && (
            <div className="bg-white bg-opacity-10 backdrop-blur rounded-xl p-8">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-white mb-2">Create Account</h2>
                <p className="text-white text-opacity-70">Join Glass Slipper and transform your LinkedIn network</p>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-white text-sm font-medium mb-2">Name</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white text-opacity-50" />
                      <input
                        type="text"
                        value={authForm.name}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAuthForm(prev => ({ ...prev, name: e.target.value }))}
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
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAuthForm(prev => ({ ...prev, company: e.target.value }))}
                        className="w-full pl-10 pr-4 py-3 bg-white bg-opacity-20 text-white placeholder-white placeholder-opacity-50 rounded-lg focus:bg-opacity-30 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                        placeholder="Your company"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-white text-sm font-medium mb-2">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white text-opacity-50" />
                    <input
                      type="email"
                      value={authForm.email}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAuthForm(prev => ({ ...prev, email: e.target.value }))}
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
                        type={showPassword ? 'text' : 'password'}
                        value={authForm.password}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAuthForm(prev => ({ ...prev, password: e.target.value }))}
                        className="w-full pl-10 pr-12 py-3 bg-white bg-opacity-20 text-white placeholder-white placeholder-opacity-50 rounded-lg focus:bg-opacity-30 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                        placeholder="Create password"
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

                  <div>
                    <label className="block text-white text-sm font-medium mb-2">Confirm Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white text-opacity-50" />
                      <input
                        type="password"
                        value={authForm.confirmPassword}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAuthForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                        className="w-full pl-10 pr-4 py-3 bg-white bg-opacity-20 text-white placeholder-white placeholder-opacity-50 rounded-lg focus:bg-opacity-30 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                        placeholder="Confirm password"
                      />
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleAuth}
                  disabled={!validateAuthForm()}
                  className="w-full bg-yellow-400 hover:bg-yellow-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-purple-900 py-3 rounded-lg font-semibold transition-all flex items-center justify-center space-x-2"
                >
                  <span>Create Account</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>

              <p className="text-center text-white text-opacity-70 text-sm mt-6">
                Already have an account?{' '}
                <button onClick={() => setAuthView('login')} className="text-yellow-400 hover:underline">
                  Sign in here
                </button>
              </p>
            </div>
          )}
        </div>

        <p className="absolute bottom-4 text-center text-white text-opacity-50 text-sm">
          Glass Slipper v1.0 Beta
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900">
      {/* Header */}
      <header className="bg-purple-900 bg-opacity-50 backdrop-blur border-b border-purple-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-8">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-purple-900" />
                </div>
                <h1 className="text-xl font-bold text-white">Glass Slipper</h1>
              </div>

              <nav className="hidden md:flex items-center space-x-1">
                {navigationItems.map((item: NavigationItem) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.view}
                      onClick={() => setCurrentView(item.view)}
                      className={`px-3 py-2 rounded-lg transition-colors flex items-center space-x-2 ${
                        currentView === item.view
                          ? 'bg-purple-800 text-yellow-400'
                          : 'text-white hover:bg-purple-800'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span className={currentView === item.view ? 'text-yellow-400' : ''}>{item.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>

            <div className="flex items-center space-x-4">
              <div className="text-right hidden md:block">
                <p className="text-white text-sm">{user.name}</p>
                <p className="text-white text-opacity-70 text-xs">{user.company}</p>
              </div>

              <button
                onClick={handleLogout}
                className="text-white hover:text-yellow-400 transition-colors"
              >
                <LogOut className="w-5 h-5" />
              </button>

              <button
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="md:hidden text-white"
              >
                <Menu className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {showMobileMenu && (
          <div className="md:hidden bg-purple-800 bg-opacity-90 border-t border-purple-700">
            <nav className="px-4 py-3 space-y-2">
              {navigationItems.map((item: NavigationItem) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.view}
                    onClick={() => {
                      setCurrentView(item.view);
                      setShowMobileMenu(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg transition-colors flex items-center space-x-3 ${
                      currentView === item.view
                        ? 'bg-purple-700 text-yellow-400'
                        : 'text-white hover:bg-purple-700'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Dashboard View */}
        {currentView === 'dashboard' && (
          <div className="space-y-8">
            {/* Dashboard Header */}
            <div className="text-center space-y-4">
              <h2 className="text-3xl font-bold text-white">Dashboard</h2>
              <p className="text-white text-opacity-70">Your LinkedIn ABM overview</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white bg-opacity-10 backdrop-blur rounded-xl p-6">
                <div className="flex items-center space-x-3">
                  <Users className="w-8 h-8 text-blue-400" />
                  <div>
                    <p className="text-2xl font-bold text-white">{totalContacts}</p>
                    <p className="text-white text-opacity-70 text-sm">Total Contacts</p>
                  </div>
                </div>
              </div>

              <div className="bg-white bg-opacity-10 backdrop-blur rounded-xl p-6">
                <div className="flex items-center space-x-3">
                  <Target className="w-8 h-8 text-green-400" />
                  <div>
                    <p className="text-2xl font-bold text-white">{idealClients}</p>
                    <p className="text-white text-opacity-70 text-sm">Ideal Clients</p>
                  </div>
                </div>
              </div>

              <div className="bg-white bg-opacity-10 backdrop-blur rounded-xl p-6">
                <div className="flex items-center space-x-3">
                  <Zap className="w-8 h-8 text-yellow-400" />
                  <div>
                    <p className="text-2xl font-bold text-white">{enrichedContacts}</p>
                    <p className="text-white text-opacity-70 text-sm">Enriched</p>
                  </div>
                </div>
              </div>

              <div className="bg-white bg-opacity-10 backdrop-blur rounded-xl p-6">
                <div className="flex items-center space-x-3">
                  <Building className="w-8 h-8 text-purple-400" />
                  <div>
                    <p className="text-2xl font-bold text-white">{referralPartners}</p>
                    <p className="text-white text-opacity-70 text-sm">Partners</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Current Focus: Ideal Client */}
            {currentIdealClient && (
              <div className="bg-white bg-opacity-10 backdrop-blur rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold text-white">Today's Focus: Ideal Client</h3>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setCurrentIdealClientIndex((prev) => prev > 0 ? prev - 1 : idealClientsList.length - 1)}
                      className="p-1 text-white hover:text-yellow-400"
                      disabled={idealClientsList.length <= 1}
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <span className="text-white text-sm">{currentIdealClientIndex + 1} of {idealClientsList.length}</span>
                    <button
                      onClick={() => setCurrentIdealClientIndex((prev) => prev < idealClientsList.length - 1 ? prev + 1 : 0)}
                      className="p-1 text-white hover:text-yellow-400"
                      disabled={idealClientsList.length <= 1}
                    >
                      <ArrowRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-lg font-medium text-white">{currentIdealClient.name}</h4>
                      <p className="text-white text-opacity-70">{currentIdealClient.position}</p>
                      <p className="text-white text-opacity-70">{currentIdealClient.company}</p>
                    </div>

                    {currentIdealClient.isEnriched && (
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <Mail className="w-4 h-4 text-blue-400" />
                          <span className="text-white text-sm">{currentIdealClient.email}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Phone className="w-4 h-4 text-green-400" />
                          <span className="text-white text-sm">{currentIdealClient.phone}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Globe className="w-4 h-4 text-purple-400" />
                          <span className="text-white text-sm">{currentIdealClient.website}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-3">
                    <h5 className="font-medium text-white">Action Items:</h5>
                    
                    <div className="space-y-2">
                      {['viewProfile', 'sendConnection', 'followUp'].map((taskKey: string) => {
                        const taskStatus = getTaskStatus(currentIdealClient.id, taskKey);
                        const taskLabels: Record<string, string> = {
                          viewProfile: 'View LinkedIn profile',
                          sendConnection: 'Send connection request',
                          followUp: 'Schedule follow-up'
                        };

                        return (
                          <div key={taskKey} className="flex items-center space-x-3">
                            <button
                              onClick={() => toggleContactTask(currentIdealClient.id, taskKey)}
                              className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                                taskStatus.completed
                                  ? 'bg-green-500 border-green-500'
                                  : 'border-white border-opacity-30 hover:border-opacity-50'
                              }`}
                            >
                              {taskStatus.completed && <Check className="w-3 h-3 text-white" />}
                            </button>
                            <span className={`text-sm ${taskStatus.completed ? 'text-green-400 line-through' : 'text-white'}`}>
                              {taskLabels[taskKey]}
                            </span>
                          </div>
                        );
                      })}
                    </div>

                    <button
                      onClick={() => {
                        setSelectedContact(currentIdealClient);
                        setShowContactModal(true);
                      }}
                      className="mt-4 px-4 py-2 bg-yellow-400 text-purple-900 rounded-lg hover:bg-yellow-500 transition-colors text-sm font-medium"
                    >
                      View Full Profile
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Daily Tasks */}
            <div className="bg-white bg-opacity-10 backdrop-blur rounded-xl p-6">
              <h3 className="text-xl font-semibold text-white mb-4">Daily ABM Tasks</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => toggleDailyTask('chooseIdealClients')}
                      className={`w-6 h-6 rounded border-2 flex items-center justify-center ${
                        dailyTasks.chooseIdealClients.completed
                          ? 'bg-green-500 border-green-500'
                          : 'border-white border-opacity-30 hover:border-opacity-50'
                      }`}
                    >
                      {dailyTasks.chooseIdealClients.completed && <Check className="w-4 h-4 text-white" />}
                    </button>
                    <span className={`${dailyTasks.chooseIdealClients.completed ? 'text-green-400 line-through' : 'text-white'}`}>
                      Choose 5 ideal clients to engage with
                    </span>
                  </div>
                  <span className="text-white text-opacity-70 text-sm">
                    {dailyTasks.chooseIdealClients.count}/{dailyTasks.chooseIdealClients.total}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => toggleDailyTask('commentOnPosts')}
                      className={`w-6 h-6 rounded border-2 flex items-center justify-center ${
                        dailyTasks.commentOnPosts.completed
                          ? 'bg-green-500 border-green-500'
                          : 'border-white border-opacity-30 hover:border-opacity-50'
                      }`}
                    >
                      {dailyTasks.commentOnPosts.completed && <Check className="w-4 h-4 text-white" />}
                    </button>
                    <span className={`${dailyTasks.commentOnPosts.completed ? 'text-green-400 line-through' : 'text-white'}`}>
                      Comment on 5 ideal client posts
                    </span>
                  </div>
                  <span className="text-white text-opacity-70 text-sm">
                    {dailyTasks.commentOnPosts.count}/{dailyTasks.commentOnPosts.total}
                  </span>
                </div>

                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => toggleDailyTask('postContent')}
                    className={`w-6 h-6 rounded border-2 flex items-center justify-center ${
                      dailyTasks.postContent.completed
                        ? 'bg-green-500 border-green-500'
                        : 'border-white border-opacity-30 hover:border-opacity-50'
                    }`}
                  >
                    {dailyTasks.postContent.completed && <Check className="w-4 h-4 text-white" />}
                  </button>
                  <span className={`${dailyTasks.postContent.completed ? 'text-green-400 line-through' : 'text-white'}`}>
                    Share valuable content for your target market
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white bg-opacity-10 backdrop-blur rounded-xl p-6">
              <h3 className="text-xl font-semibold text-white mb-4">Quick Actions</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <button
                  onClick={() => setCurrentView('contacts')}
                  className="p-4 bg-white bg-opacity-10 rounded-lg hover:bg-opacity-20 transition-colors text-left"
                >
                  <Users className="w-6 h-6 text-blue-400 mb-2" />
                  <h4 className="font-medium text-white">Manage Contacts</h4>
                  <p className="text-white text-opacity-70 text-sm">View and categorise your network</p>
                </button>

                <button
                  onClick={enrichIdealClients}
                  className="p-4 bg-white bg-opacity-10 rounded-lg hover:bg-opacity-20 transition-colors text-left"
                  disabled={contacts.filter(c => !c.isEnriched).length === 0}
                >
                  <Zap className="w-6 h-6 text-yellow-400 mb-2" />
                  <h4 className="font-medium text-white">Enrich Contacts</h4>
                  <p className="text-white text-opacity-70 text-sm">{enrichmentsLeft} enrichments remaining</p>
                </button>

                <button
                  onClick={generateLeadMagnet}
                  className="p-4 bg-white bg-opacity-10 rounded-lg hover:bg-opacity-20 transition-colors text-left"
                >
                  <FileText className="w-6 h-6 text-purple-400 mb-2" />
                  <h4 className="font-medium text-white">Create Lead Magnet</h4>
                  <p className="text-white text-opacity-70 text-sm">Generate valuable content</p>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Contacts View */}
        {currentView === 'contacts' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold text-white">Contacts</h2>
                <p className="text-white text-opacity-70">Manage your LinkedIn network</p>
              </div>

              <div className="flex items-center space-x-3">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept=".csv"
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 bg-yellow-400 text-purple-900 rounded-lg hover:bg-yellow-500 transition-colors flex items-center space-x-2"
                >
                  <Upload className="w-4 h-4" />
                  <span>Upload CSV</span>
                </button>

                <button
                  onClick={aiCategorizeAll}
                  disabled={contacts.length === 0}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>AI Categorise</span>
                </button>

                <button
                  onClick={enrichIdealClients}
                  disabled={contacts.filter(c => !c.isEnriched).length === 0}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
                >
                  <Zap className="w-4 h-4" />
                  <span>Enrich All ({enrichmentsLeft})</span>
                </button>
              </div>
            </div>

            {/* Search and Filter */}
            <div className="bg-white bg-opacity-10 backdrop-blur rounded-xl p-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white text-opacity-50" />
                    <input
                      type="text"
                      placeholder="Search contacts..."
                      value={searchTerm}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-white bg-opacity-20 text-white placeholder-white placeholder-opacity-50 rounded-lg focus:bg-opacity-30 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                    />
                  </div>
                </div>

                <select
                  value={categoryFilter}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setCategoryFilter(e.target.value)}
                  className="px-4 py-3 bg-white bg-opacity-20 text-white rounded-lg focus:bg-opacity-30 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                >
                  <option value="All">All Categories</option>
                  {categories.map((category: string) => (
                    <option key={category} value={category} className="text-black">{category}</option>
                  ))}
                  <option value="Uncategorised" className="text-black">Uncategorised</option>
                </select>
              </div>
            </div>

            {/* Contacts Table */}
            <div className="bg-white bg-opacity-10 backdrop-blur rounded-xl overflow-hidden">
              {filteredContacts.length === 0 ? (
                <div className="p-12 text-center">
                  <Users className="w-16 h-16 text-white text-opacity-30 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">No contacts found</h3>
                  <p className="text-white text-opacity-70 mb-6">
                    {contacts.length === 0 ? 'Upload your LinkedIn connections to get started' : 'Try adjusting your search or filter criteria'}
                  </p>
                  {contacts.length === 0 && (
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="px-6 py-3 bg-yellow-400 text-purple-900 rounded-lg hover:bg-yellow-500 transition-colors"
                    >
                      Upload LinkedIn CSV
                    </button>
                  )}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-white border-opacity-20">
                        <th className="text-left py-4 px-6 text-white font-medium">Name</th>
                        <th className="text-left py-4 px-6 text-white font-medium">Company</th>
                        <th className="text-left py-4 px-6 text-white font-medium">Position</th>
                        <th className="text-left py-4 px-6 text-white font-medium">Category</th>
                        <th className="text-left py-4 px-6 text-white font-medium">Status</th>
                        <th className="text-left py-4 px-6 text-white font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredContacts.map((contact: Contact) => (
                        <tr key={contact.id} className="border-b border-white border-opacity-10 hover:bg-white hover:bg-opacity-5">
                          <td className="py-4 px-6">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center">
                                <span className="text-white font-medium text-sm">
                                  {contact.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                                </span>
                              </div>
                              <div>
                                <p className="text-white font-medium">{contact.name}</p>
                                <p className="text-white text-opacity-70 text-sm">{contact.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-6 text-white">{contact.company}</td>
                          <td className="py-4 px-6 text-white">{contact.position}</td>
                          <td className="py-4 px-6">
                            <select
                              value={contact.category || 'Uncategorised'}
                              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => updateCategory(contact.id, e.target.value)}
                              className="px-3 py-1 bg-white bg-opacity-20 text-white rounded text-sm focus:bg-opacity-30 focus:outline-none"
                            >
                              <option value="Uncategorised" className="text-black">Uncategorised</option>
                              {categories.map((category: string) => (
                                <option key={category} value={category} className="text-black">{category}</option>
                              ))}
                            </select>
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex items-center space-x-2">
                              {contact.isEnriched && (
                                <span className="px-2 py-1 bg-green-500 bg-opacity-20 text-green-400 rounded text-xs">
                                  Enriched
                                </span>
                              )}
                              {contact.category === 'Ideal Client' && (
                                <span className="px-2 py-1 bg-yellow-500 bg-opacity-20 text-yellow-400 rounded text-xs">
                                  Priority
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <button
                              onClick={() => {
                                setSelectedContact(contact);
                                setShowContactModal(true);
                              }}
                              className="text-yellow-400 hover:text-yellow-300 transition-colors"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Strategy View */}
        {currentView === 'strategy' && (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-white">LinkedIn Strategy</h2>
              <p className="text-white text-opacity-70">Generate your personalised ABM approach</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Strategy Form */}
              <div className="bg-white bg-opacity-10 backdrop-blur rounded-xl p-6">
                <h3 className="text-xl font-semibold text-white mb-6">Strategy Input</h3>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-white text-sm font-medium mb-2">
                      What's your one main offer? *
                    </label>
                    <textarea
                      value={strategy.oneOffer}
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setStrategy(prev => ({ ...prev, oneOffer: e.target.value }))}
                      rows={3}
                      className="w-full px-4 py-3 bg-white bg-opacity-20 text-white placeholder-white placeholder-opacity-50 rounded-lg focus:bg-opacity-30 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                      placeholder="e.g., We help B2B SaaS companies increase their MRR by 40% through our proven sales automation system..."
                    />
                  </div>

                  <div>
                    <label className="block text-white text-sm font-medium mb-2">
                      Who are your ideal referral partners? *
                    </label>
                    <textarea
                      value={strategy.idealReferralPartners}
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setStrategy(prev => ({ ...prev, idealReferralPartners: e.target.value }))}
                      rows={3}
                      className="w-full px-4 py-3 bg-white bg-opacity-20 text-white placeholder-white placeholder-opacity-50 rounded-lg focus:bg-opacity-30 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                      placeholder="e.g., Business coaches, marketing agencies, sales consultants who work with our target market..."
                    />
                  </div>

                  <div>
                    <label className="block text-white text-sm font-medium mb-2">
                      Any special factors about your business?
                    </label>
                    <textarea
                      value={strategy.specialFactors}
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setStrategy(prev => ({ ...prev, specialFactors: e.target.value }))}
                      rows={3}
                      className="w-full px-4 py-3 bg-white bg-opacity-20 text-white placeholder-white placeholder-opacity-50 rounded-lg focus:bg-opacity-30 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                      placeholder="e.g., We're launching a new product, we have industry awards, we're expanding to new markets..."
                    />
                  </div>

                  <button
                    onClick={generateStrategy}
                    disabled={!strategy.oneOffer || !strategy.idealReferralPartners}
                    className="w-full px-6 py-3 bg-yellow-400 hover:bg-yellow-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-purple-900 rounded-lg font-semibold transition-colors flex items-center justify-center space-x-2"
                  >
                    <Sparkles className="w-5 h-5" />
                    <span>Generate Strategy</span>
                  </button>
                </div>
              </div>

              {/* Generated Strategy */}
              <div className="bg-white bg-opacity-10 backdrop-blur rounded-xl p-6">
                <h3 className="text-xl font-semibold text-white mb-6">Your LinkedIn Strategy</h3>
                
                {strategy.generatedStrategy ? (
                  <div className="space-y-4">
                    <div className="prose prose-invert max-w-none">
                      <div className="text-white whitespace-pre-wrap text-sm leading-relaxed">
                        {strategy.generatedStrategy}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3 pt-4 border-t border-white border-opacity-20">
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(strategy.generatedStrategy);
                          setSuccessMessage('Strategy copied to clipboard!');
                          setShowSuccessModal(true);
                        }}
                        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2"
                      >
                        <Copy className="w-4 h-4" />
                        <span>Copy</span>
                      </button>
                      
                      <button
                        onClick={() => {
                          const element = document.createElement('a');
                          const file = new Blob([strategy.generatedStrategy], { type: 'text/plain' });
                          element.href = URL.createObjectURL(file);
                          element.download = 'linkedin-strategy.txt';
                          document.body.appendChild(element);
                          element.click();
                          document.body.removeChild(element);
                        }}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
                      >
                        <Download className="w-4 h-4" />
                        <span>Download</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Target className="w-16 h-16 text-white text-opacity-30 mx-auto mb-4" />
                    <h4 className="text-lg font-medium text-white mb-2">No Strategy Generated</h4>
                    <p className="text-white text-opacity-70">
                      Fill in the form and click "Generate Strategy" to create your personalised LinkedIn approach.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Lead Magnets View */}
        {currentView === 'lead-magnets' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold text-white">Lead Magnets</h2>
                <p className="text-white text-opacity-70">Create valuable content for your audience</p>
              </div>

              <button
                onClick={generateLeadMagnet}
                className="px-4 py-2 bg-yellow-400 text-purple-900 rounded-lg hover:bg-yellow-500 transition-colors flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Create Lead Magnet</span>
              </button>
            </div>

            {leadMagnets.length === 0 ? (
              <div className="bg-white bg-opacity-10 backdrop-blur rounded-xl p-12 text-center">
                <FileText className="w-16 h-16 text-white text-opacity-30 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">No Lead Magnets Yet</h3>
                <p className="text-white text-opacity-70 mb-6">
                  Create your first lead magnet to start capturing and nurturing leads from your LinkedIn activities.
                </p>
                <button
                  onClick={generateLeadMagnet}
                  className="px-6 py-3 bg-yellow-400 text-purple-900 rounded-lg hover:bg-yellow-500 transition-colors"
                >
                  Create Your First Lead Magnet
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {leadMagnets.map((leadMagnet: LeadMagnet) => (
                  <div key={leadMagnet.id} className="bg-white bg-opacity-10 backdrop-blur rounded-xl p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-white mb-2">{leadMagnet.title}</h3>
                        <p className="text-white text-opacity-70 text-sm mb-3">{leadMagnet.description}</p>
                        
                        <div className="flex items-center space-x-4 text-sm text-white text-opacity-70">
                          <div className="flex items-center space-x-1">
                            <FileText className="w-4 h-4" />
                            <span>{leadMagnet.type}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Calendar className="w-4 h-4" />
                            <span>{leadMagnet.created}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Download className="w-4 h-4" />
                            <span>{leadMagnet.downloads}</span>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          setSelectedLeadMagnet(leadMagnet);
                          setShowLeadMagnetModal(true);
                        }}
                        className="text-white hover:text-yellow-400 transition-colors"
                      >
                        <MoreVertical className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => downloadLeadMagnet(leadMagnet)}
                        className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center space-x-2"
                      >
                        <Download className="w-4 h-4" />
                        <span>Download</span>
                      </button>

                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(leadMagnet.content);
                          setSuccessMessage('Lead magnet copied to clipboard!');
                          setShowSuccessModal(true);
                        }}
                        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tasks View */}
        {currentView === 'tasks' && (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-white">Onboarding Tasks</h2>
              <p className="text-white text-opacity-70">Complete these tasks to optimise your ABM setup</p>
            </div>

            <div className="bg-white bg-opacity-10 backdrop-blur rounded-xl p-6">
              <div className="space-y-4">
                {tasks.map((task: Task) => (
                  <div key={task.id} className="flex items-center justify-between p-4 bg-white bg-opacity-10 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className={`w-6 h-6 rounded border-2 flex items-center justify-center ${
                        task.completed
                          ? 'bg-green-500 border-green-500'
                          : 'border-white border-opacity-30'
                      }`}>
                        {task.completed && <Check className="w-4 h-4 text-white" />}
                      </div>
                      
                      <div>
                        <p className={`font-medium ${task.completed ? 'text-green-400 line-through' : 'text-white'}`}>
                          {task.text}
                        </p>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className={`px-2 py-1 rounded text-xs ${
                            task.priority === 'high' ? 'bg-red-500 bg-opacity-20 text-red-400' :
                            task.priority === 'medium' ? 'bg-yellow-500 bg-opacity-20 text-yellow-400' :
                            'bg-blue-500 bg-opacity-20 text-blue-400'
                          }`}>
                            {task.priority} priority
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      {task.id === 1 && (
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          disabled={task.completed}
                          className="px-3 py-1 bg-yellow-400 text-purple-900 rounded text-sm hover:bg-yellow-500 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
                        >
                          Upload CSV
                        </button>
                      )}
                      {task.id === 2 && (
                        <button
                          onClick={() => setShowSettingsModal(true)}
                          disabled={task.completed}
                          className="px-3 py-1 bg-yellow-400 text-purple-900 rounded text-sm hover:bg-yellow-500 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
                        >
                          Configure
                        </button>
                      )}
                      {task.id === 3 && (
                        <button
                          onClick={enrichIdealClients}
                          disabled={task.completed || contacts.length === 0}
                          className="px-3 py-1 bg-yellow-400 text-purple-900 rounded text-sm hover:bg-yellow-500 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
                        >
                          Enrich
                        </button>
                      )}
                      {task.id === 4 && (
                        <button
                          onClick={aiCategorizeAll}
                          disabled={task.completed || contacts.length === 0}
                          className="px-3 py-1 bg-yellow-400 text-purple-900 rounded text-sm hover:bg-yellow-500 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
                        >
                          Categorise
                        </button>
                      )}
                      {task.id === 5 && (
                        <button
                          onClick={() => setCurrentView('strategy')}
                          disabled={task.completed}
                          className="px-3 py-1 bg-yellow-400 text-purple-900 rounded text-sm hover:bg-yellow-500 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
                        >
                          Create Strategy
                        </button>
                      )}
                      {task.id === 6 && (
                        <button
                          onClick={generateLeadMagnet}
                          disabled={task.completed}
                          className="px-3 py-1 bg-yellow-400 text-purple-900 rounded text-sm hover:bg-yellow-500 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
                        >
                          Create Magnet
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 text-center">
                <div className="text-white text-opacity-70 text-sm">
                  Progress: {tasks.filter(t => t.completed).length} of {tasks.length} tasks completed
                </div>
                <div className="w-full bg-white bg-opacity-20 rounded-full h-2 mt-2">
                  <div 
                    className="bg-yellow-400 h-2 rounded-full transition-all"
                    style={{ width: `${(tasks.filter(t => t.completed).length / tasks.length) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Settings View */}
        {currentView === 'settings' && (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-white">Settings</h2>
              <p className="text-white text-opacity-70">Configure your business profile and preferences</p>
            </div>

            <div className="bg-white bg-opacity-10 backdrop-blur rounded-xl p-6">
              <h3 className="text-xl font-semibold text-white mb-6">Business Profile</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-white text-sm font-medium mb-2">Business Type</label>
                  <select
                    value={user.businessType}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setUser(prev => ({ ...prev, businessType: e.target.value }))}
                    className="w-full px-4 py-3 bg-white bg-opacity-20 text-white rounded-lg focus:bg-opacity-30 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  >
                    <option value="Consulting" className="text-black">Consulting</option>
                    <option value="SaaS" className="text-black">SaaS</option>
                    <option value="Agency" className="text-black">Agency</option>
                    <option value="E-commerce" className="text-black">E-commerce</option>
                    <option value="Professional Services" className="text-black">Professional Services</option>
                    <option value="Other" className="text-black">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-white text-sm font-medium mb-2">Target Market</label>
                  <input
                    type="text"
                    value={user.targetMarket}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUser(prev => ({ ...prev, targetMarket: e.target.value }))}
                    className="w-full px-4 py-3 bg-white bg-opacity-20 text-white placeholder-white placeholder-opacity-50 rounded-lg focus:bg-opacity-30 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                    placeholder="e.g., B2B SaaS, SME manufacturers"
                  />
                </div>

                <div>
                  <label className="block text-white text-sm font-medium mb-2">Writing Style</label>
                  <select
                    value={user.writingStyle}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setUser(prev => ({ ...prev, writingStyle: e.target.value }))}
                    className="w-full px-4 py-3 bg-white bg-opacity-20 text-white rounded-lg focus:bg-opacity-30 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  >
                    <option value="Professional" className="text-black">Professional</option>
                    <option value="Professional yet conversational" className="text-black">Professional yet conversational</option>
                    <option value="Casual and friendly" className="text-black">Casual and friendly</option>
                    <option value="Technical and detailed" className="text-black">Technical and detailed</option>
                  </select>
                </div>

                <div>
                  <label className="block text-white text-sm font-medium mb-2">Referral Partners</label>
                  <input
                    type="text"
                    value={user.referralPartners}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUser(prev => ({ ...prev, referralPartners: e.target.value }))}
                    className="w-full px-4 py-3 bg-white bg-opacity-20 text-white placeholder-white placeholder-opacity-50 rounded-lg focus:bg-opacity-30 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                    placeholder="e.g., Accountants, Business Coaches"
                  />
                </div>
              </div>

              <button
                onClick={saveSettings}
                className="mt-6 px-6 py-3 bg-yellow-400 text-purple-900 rounded-lg hover:bg-yellow-500 transition-colors font-semibold"
              >
                Save Settings
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Contact Modal */}
      {showContactModal && selectedContact && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-purple-900 rounded-xl p-6 w-full max-w-2xl max-h-90vh overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-white">Contact Details</h3>
              <button
                onClick={closeModals}
                className="text-white hover:text-yellow-400 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Contact Info */}
              <div className="bg-white bg-opacity-10 rounded-lg p-4">
                <div className="flex items-start space-x-4">
                  <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-xl">
                      {selectedContact.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </span>
                  </div>
                  
                  <div className="flex-1">
                    <h4 className="text-lg font-semibold text-white">{selectedContact.name}</h4>
                    <p className="text-white text-opacity-70">{selectedContact.position}</p>
                    <p className="text-white text-opacity-70">{selectedContact.company}</p>
                    
                    <div className="mt-3 space-y-2">
                      <div className="flex items-center space-x-2">
                        <Mail className="w-4 h-4 text-blue-400" />
                        <span className="text-white text-sm">{selectedContact.email}</span>
                      </div>
                      
                      {selectedContact.isEnriched && (
                        <>
                          <div className="flex items-center space-x-2">
                            <Phone className="w-4 h-4 text-green-400" />
                            <span className="text-white text-sm">{selectedContact.phone}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Globe className="w-4 h-4 text-purple-400" />
                            <span className="text-white text-sm">{selectedContact.website}</span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Category Selection */}
              <div>
                <label className="block text-white text-sm font-medium mb-2">Category</label>
                <select
                  value={selectedContact.category || 'Uncategorised'}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                    updateCategory(selectedContact.id, e.target.value);
                    setSelectedContact(prev => prev ? ({ ...prev, category: e.target.value }) : null);
                  }}
                  className="w-full px-4 py-3 bg-white bg-opacity-20 text-white rounded-lg focus:bg-opacity-30 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                >
                  <option value="Uncategorised" className="text-black">Uncategorised</option>
                  {categories.map((category: string) => (
                    <option key={category} value={category} className="text-black">{category}</option>
                  ))}
                </select>
              </div>

              {/* Action Items (if Ideal Client) */}
              {selectedContact.category === 'Ideal Client' && (
                <div>
                  <h5 className="text-white font-medium mb-3">Action Items</h5>
                  <div className="space-y-3">
                    {['viewProfile', 'sendConnection', 'followUp', 'personalMessage', 'engageContent'].map((taskKey: string) => {
                      const taskStatus = getTaskStatus(selectedContact.id, taskKey);
                      const taskLabels: Record<string, string> = {
                        viewProfile: 'View LinkedIn profile',
                        sendConnection: 'Send connection request',
                        followUp: 'Schedule follow-up',
                        personalMessage: 'Send personalised message',
                        engageContent: 'Engage with their content'
                      };

                      return (
                        <div key={taskKey} className="flex items-center justify-between p-3 bg-white bg-opacity-10 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <button
                              onClick={() => toggleContactTask(selectedContact.id, taskKey)}
                              className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                                taskStatus.completed
                                  ? 'bg-green-500 border-green-500'
                                  : 'border-white border-opacity-30 hover:border-opacity-50'
                              }`}
                            >
                              {taskStatus.completed && <Check className="w-3 h-3 text-white" />}
                            </button>
                            <span className={`text-sm ${taskStatus.completed ? 'text-green-400 line-through' : 'text-white'}`}>
                              {taskLabels[taskKey]}
                            </span>
                          </div>
                          
                          {taskStatus.completed && taskStatus.completedDate && (
                            <span className="text-xs text-white text-opacity-50">
                              {new Date(taskStatus.completedDate).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center space-x-3 pt-4 border-t border-white border-opacity-20">
                <button
                  onClick={() => {
                    if (confirm('Are you sure you want to delete this contact?')) {
                      deleteContact(selectedContact.id);
                    }
                  }}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete</span>
                </button>

                <button
                  onClick={closeModals}
                  className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-center"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Loading Modal */}
      {showLoadingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-purple-900 rounded-xl p-8 w-full max-w-md text-center">
            <div className="animate-spin w-12 h-12 border-4 border-yellow-400 border-t-transparent rounded-full mx-auto mb-4"></div>
            <h3 className="text-xl font-semibold text-white mb-2">Processing...</h3>
            <p className="text-white text-opacity-70">{loadingMessage}</p>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-purple-900 rounded-xl p-8 w-full max-w-md text-center">
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Success!</h3>
            <p className="text-white text-opacity-70 mb-6">{successMessage}</p>
            <button
              onClick={closeModals}
              className="px-6 py-3 bg-yellow-400 text-purple-900 rounded-lg hover:bg-yellow-500 transition-colors font-semibold"
            >
              Continue
            </button>
          </div>
        </div>
      )}

      {/* Lead Magnet Modal */}
      {showLeadMagnetModal && selectedLeadMagnet && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-purple-900 rounded-xl p-6 w-full max-w-4xl max-h-90vh overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-white">{selectedLeadMagnet.title}</h3>
              <button
                onClick={closeModals}
                className="text-white hover:text-yellow-400 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-6">
              <div className="bg-white bg-opacity-10 rounded-lg p-4">
                <p className="text-white text-opacity-70">{selectedLeadMagnet.description}</p>
                
                <div className="flex items-center space-x-4 mt-3 text-sm text-white text-opacity-70">
                  <div className="flex items-center space-x-1">
                    <FileText className="w-4 h-4" />
                    <span>{selectedLeadMagnet.type}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Calendar className="w-4 h-4" />
                    <span>{selectedLeadMagnet.created}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Download className="w-4 h-4" />
                    <span>{selectedLeadMagnet.downloads} downloads</span>
                  </div>
                </div>
              </div>

              <div className="bg-white bg-opacity-10 rounded-lg p-4">
                <h4 className="text-lg font-medium text-white mb-3">Content Preview</h4>
                <div className="bg-black bg-opacity-30 rounded p-4 max-h-96 overflow-y-auto">
                  <pre className="text-white text-sm whitespace-pre-wrap font-mono">
                    {selectedLeadMagnet.content}
                  </pre>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <button
                  onClick={() => downloadLeadMagnet(selectedLeadMagnet)}
                  className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
                >
                  <Download className="w-4 h-4" />
                  <span>Download</span>
                </button>

                <button
                  onClick={() => {
                    navigator.clipboard.writeText(selectedLeadMagnet.content);
                    setSuccessMessage('Lead magnet content copied to clipboard!');
                    setShowSuccessModal(true);
                    setShowLeadMagnetModal(false);
                    setSelectedLeadMagnet(null);
                  }}
                  className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2"
                >
                  <Copy className="w-4 h-4" />
                  <span>Copy</span>
                </button>

                <button
                  onClick={closeModals}
                  className="flex-1 px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-center"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {showSettingsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-purple-900 rounded-xl p-6 w-full max-w-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-white">Business Settings</h3>
              <button
                onClick={closeModals}
                className="text-white hover:text-yellow-400 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-white text-sm font-medium mb-2">Business Type</label>
                  <select
                    value={user.businessType}
                    onChange={(e) => setUser(prev => ({ ...prev, businessType: e.target.value }))}
                    className="w-full px-4 py-3 bg-white bg-opacity-20 text-white rounded-lg focus:bg-opacity-30 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  >
                    <option value="Consulting" className="text-black">Consulting</option>
                    <option value="SaaS" className="text-black">SaaS</option>
                    <option value="Agency" className="text-black">Agency</option>
                    <option value="E-commerce" className="text-black">E-commerce</option>
                    <option value="Professional Services" className="text-black">Professional Services</option>
                    <option value="Other" className="text-black">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-white text-sm font-medium mb-2">Target Market</label>
                  <input
                    type="text"
                    value={user.targetMarket}
                    onChange={(e) => setUser(prev => ({ ...prev, targetMarket: e.target.value }))}
                    className="w-full px-4 py-3 bg-white bg-opacity-20 text-white placeholder-white placeholder-opacity-50 rounded-lg focus:bg-opacity-30 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                    placeholder="e.g., B2B SaaS, SME manufacturers"
                  />
                </div>

                <div>
                  <label className="block text-white text-sm font-medium mb-2">Writing Style</label>
                  <select
                    value={user.writingStyle}
                    onChange={(e) => setUser(prev => ({ ...prev, writingStyle: e.target.value }))}
                    className="w-full px-4 py-3 bg-white bg-opacity-20 text-white rounded-lg focus:bg-opacity-30 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  >
                    <option value="Professional" className="text-black">Professional</option>
                    <option value="Professional yet conversational" className="text-black">Professional yet conversational</option>
                    <option value="Casual and friendly" className="text-black">Casual and friendly</option>
                    <option value="Technical and detailed" className="text-black">Technical and detailed</option>
                  </select>
                </div>

                <div>
                  <label className="block text-white text-sm font-medium mb-2">Referral Partners</label>
                  <input
                    type="text"
                    value={user.referralPartners}
                    onChange={(e) => setUser(prev => ({ ...prev, referralPartners: e.target.value }))}
                    className="w-full px-4 py-3 bg-white bg-opacity-20 text-white placeholder-white placeholder-opacity-50 rounded-lg focus:bg-opacity-30 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                    placeholder="e.g., Accountants, Business Coaches"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <button
                  onClick={saveSettings}
                  className="flex-1 px-6 py-3 bg-yellow-400 text-purple-900 rounded-lg hover:bg-yellow-500 transition-colors font-semibold"
                >
                  Save Settings
                </button>
                
                <button
                  onClick={closeModals}
                  className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept=".csv"
        className="hidden"
      />
    </div>
  );
};

export default GlassSlipperApp;