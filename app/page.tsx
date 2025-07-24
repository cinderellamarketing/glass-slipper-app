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
  lastName?: string;
  industry?: string;
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
// STAGE 3: Enhanced Website URL Extraction
// The /api/enrich endpoint has been improved with:
// 1. Better website URL parsing from search results
// 2. Domain extraction logic (e.g., franklyn.co.uk from search results)
// 3. Improved Claude prompt for official company website identification
// 4. Fallback logic to extract domains from search result URLs when direct website not found
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
  const [categories] = useState(['Ideal Client', 'Champions', 'Referral Partners', 'Competitors', 'Other']);

  // Search and filter state
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');

  // Filtered contacts
  const filteredContacts = contacts.filter((contact: Contact) => {
    const matchesSearch = contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (contact.lastName && contact.lastName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (contact.industry && contact.industry.toLowerCase().includes(searchTerm.toLowerCase()));
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
  const [leadMagnets, setLeadMagnets] = useState<LeadMagnet[]>([]);

  // Tasks state
  const [tasks, setTasks] = useState<Task[]>([
    { id: 1, text: 'Upload LinkedIn CSV contacts', completed: false, priority: 'high' },
    { id: 2, text: 'Configure business settings', completed: false, priority: 'high' },
    { id: 3, text: 'Enrich ideal client contacts', completed: false, priority: 'medium' },
    { id: 4, text: 'Generate lead magnets', completed: false, priority: 'medium' },
    { id: 5, text: 'Create outreach strategy', completed: false, priority: 'low' }
  ]);

  // Contact tasks state
  const [contactTasks, setContactTasks] = useState<{[contactId: number]: {[taskKey: string]: ContactTaskStatus}}>({});

  // Ideal client navigation
  const [currentIdealClientIndex, setCurrentIdealClientIndex] = useState<number>(0);

  // Enrichments counter
  const [enrichmentsLeft, setEnrichmentsLeft] = useState<number>(100);

  // Daily tasks state
  const [dailyTasks, setDailyTasks] = useState<DailyTasks>({
    chooseIdealClients: { completed: false },
    commentOnPosts: { completed: false },
    postContent: { completed: false },
    lastReset: new Date().toDateString()
  });

  // Reset daily tasks if new day
  useEffect(() => {
    const today = new Date().toDateString();
    if (dailyTasks.lastReset !== today) {
      setDailyTasks({
        chooseIdealClients: { completed: false },
        commentOnPosts: { completed: false },
        postContent: { completed: false },
        lastReset: today
      });
    }
  }, [dailyTasks.lastReset]);

  // Sample data population
  useEffect(() => {
    if (isAuthenticated && leadMagnets.length === 0) {
      setLeadMagnets([
        {
          id: 1,
          title: "The Ultimate SaaS Growth Guide",
          description: "A comprehensive guide to scaling your SaaS business from startup to exit",
          type: "PDF Guide",
          created: "2024-01-15",
          downloads: 247,
          content: `# The Ultimate SaaS Growth Guide

## Table of Contents
1. Introduction to SaaS Growth
2. Product-Market Fit
3. Customer Acquisition Strategies
4. Retention and Expansion
5. Scaling Your Team
6. Preparing for Exit

## Chapter 1: Introduction to SaaS Growth

Welcome to the ultimate guide for scaling your SaaS business...

[This would be a full 50+ page guide with actionable insights]`
        },
        {
          id: 2,
          title: "B2B Sales Email Templates",
          description: "Proven email templates that convert prospects into customers",
          type: "Email Templates",
          created: "2024-01-18",
          downloads: 189,
          content: `# B2B Sales Email Templates

## Cold Outreach Template #1: The Value Proposition

Subject: Quick question about [Company]'s [specific challenge]

Hi [Name],

I noticed [specific observation about their company/industry].

We helped [similar company] achieve [specific result] by [brief solution description].

Would you be open to a 15-minute call to discuss how this might apply to [their company]?

Best regards,
[Your name]

---

## Follow-up Template #1: The Helpful Resource

Subject: Thought this might be helpful for [Company]

Hi [Name],

Saw your recent post about [specific challenge]. Thought you might find this resource helpful: [link to relevant content].

No agenda here - just thought it might be useful given what you're working on.

If you ever want to chat about [relevant topic], happy to share what we've learned.

Best,
[Your name]`
        }
      ]);
    }
  }, [isAuthenticated, leadMagnets.length]);

  // File upload handler
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setLoadingMessage('Processing your LinkedIn CSV...');
    setShowLoadingModal(true);

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const csv = e.target?.result as string;
        const lines = csv.split('\n');
        const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/"/g, ''));
        
        const newContacts: Contact[] = [];
        
        for (let i = 1; i < lines.length; i++) {
          const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
          
          if (values.length >= 3 && values[0]) {
            // Enhanced name parsing to extract lastName
            const firstNameIndex = headers.findIndex(h => h.includes('first'));
            const lastNameIndex = headers.findIndex(h => h.includes('last'));
            const fullNameIndex = headers.findIndex(h => h.includes('name')) !== -1 ? 
              headers.findIndex(h => h.includes('name')) : 0;
            
            let fullName = '';
            let lastName = '';
            
            if (firstNameIndex !== -1 && lastNameIndex !== -1) {
              // If we have separate first and last name columns
              const firstName = values[firstNameIndex] || '';
              lastName = values[lastNameIndex] || '';
              fullName = `${firstName} ${lastName}`.trim();
            } else if (fullNameIndex !== -1 && values[fullNameIndex]) {
              // If we have a full name column, try to extract lastName
              fullName = values[fullNameIndex];
              const nameParts = fullName.split(' ');
              if (nameParts.length > 1) {
                lastName = nameParts[nameParts.length - 1];
              }
            } else {
              fullName = values[0] || 'Unknown';
            }

            const contact: Contact = {
              id: Date.now() + i,
              name: fullName,
              lastName: lastName || undefined, // Only set if we found a lastName
              company: values[headers.indexOf('company')] || values[1] || 'Unknown Company',
              position: values[headers.indexOf('position')] || values[2] || 'Unknown Position',
              email: values[headers.indexOf('email address')] || values[3] || 'No email',
              category: undefined,
              isEnriched: false
            };

            newContacts.push(contact);
          }
        }

        if (newContacts.length === 0) {
          setShowLoadingModal(false);
          alert('No valid contacts found in the CSV file');
          return;
        }

        setContacts(newContacts);
        setShowLoadingModal(false);
        setSuccessMessage(`Successfully imported ${newContacts.length} contacts from LinkedIn!`);
        setShowSuccessModal(true);

        // Mark upload task as complete
        setTasks(prev => prev.map(task =>
          task.id === 1 ? { ...task, completed: true } : task
        ));

      } catch (error) {
        setShowLoadingModal(false);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        alert(`Error processing file. Please ensure it's a valid CSV file. ${errorMessage}`);
      }
    };
    reader.readAsText(file);
  };

  // UPDATED: Enrich contacts using Next.js API route - ALLOW ALL CONTACTS
  // STAGE 3: Enhanced with improved website URL extraction and domain detection
  const enrichIdealClients = async () => {
  console.log('🚀 Enrichment function called - Stage 3 enhanced website detection enabled');
  
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

    // STAGE 2: Add validation for enrichment data structure
    if (!data.contacts || !Array.isArray(data.contacts)) {
      throw new Error('Invalid response format from enrichment API');
    }

    // Validate each enriched contact has expected structure
    data.contacts.forEach((enrichedContact: any, index: number) => {
      if (!enrichedContact.id) {
        console.warn(`⚠️ Enriched contact at index ${index} missing ID`);
      }
      // Ensure enriched data doesn't contain email field to prevent overwrites
      if (enrichedContact.email) {
        console.warn(`⚠️ Enriched contact ${enrichedContact.id} contains email field - removing to preserve original`);
        delete enrichedContact.email;
      }
    });

    console.log('🔄 Updating contacts state...');
    // Enhanced: Update contacts with enriched data including lastName and industry
    const updatedContacts = contacts.map(contact => {
      const enrichedContact = data.contacts.find((c: Contact) => c.id === contact.id);
      if (enrichedContact) {
        // Debug: Log enrichment data for each contact
        console.log(`📋 Enriching ${contact.name}:`, {
          originalEmail: contact.email,
          originalLastName: contact.lastName,
          enrichedLastName: enrichedContact.lastName,
          originalIndustry: contact.industry,
          enrichedIndustry: enrichedContact.industry,
          phone: enrichedContact.phone,
          website: enrichedContact.website
        });
        
        // STAGE 2: Preserve original data and ensure correct field mapping
        const updatedContact = {
          ...contact, // Keep all original contact data as base
          // Only update specific enrichment fields, preserving original email
          lastName: enrichedContact.lastName || contact.lastName || null,
          industry: enrichedContact.industry || contact.industry || 'Not found',
          phone: enrichedContact.phone || 'Not found',
          website: enrichedContact.website || 'Not found',
          isEnriched: true,
          // Explicitly preserve original email - never overwrite
          email: contact.email, // Always keep original email from CSV
          // Preserve other original fields
          name: contact.name,
          company: contact.company,
          position: contact.position,
          category: contact.category
        };

        // STAGE 2: Verify email preservation
        if (updatedContact.email !== contact.email) {
          console.error(`🚨 EMAIL PRESERVATION FAILED for ${contact.name}! Original: ${contact.email}, Updated: ${updatedContact.email}`);
          updatedContact.email = contact.email; // Force restore original email
        }

        console.log(`✅ Successfully preserved data for ${contact.name}: email=${updatedContact.email}`);
        return updatedContact;
      }
      return contact;
    });

    console.log('🔄 Updated contacts with enrichment data:', updatedContacts);
    
    // STAGE 2: Final data integrity verification
    const originalEmails = contacts.map(c => c.email);
    const updatedEmails = updatedContacts.map(c => c.email);
    const emailsChanged = originalEmails.some((email, index) => email !== updatedEmails[index]);
    
    if (emailsChanged) {
      console.error('🚨 CRITICAL: Email data was modified during enrichment!');
      console.error('Original emails:', originalEmails);
      console.error('Updated emails:', updatedEmails);
      throw new Error('Email data integrity check failed - enrichment cancelled to protect original data');
    }
    
    console.log('✅ Data integrity verified - all original emails preserved');
    setContacts(updatedContacts);
    console.log('✅ State updated successfully');
    
    // Mark enrichment task as complete
    setTasks(prev => prev.map(task =>
      task.id === 3 ? { ...task, completed: true } : task
    ));
    
    setEnrichmentsLeft(prev => prev - contactsToEnrich.length);
    setShowLoadingModal(false);
    setSuccessMessage(`Successfully enriched ${contactsToEnrich.length} contacts with real data including phone numbers, websites, and industry information! Website detection has been enhanced with Stage 3 improvements.`);
    setShowSuccessModal(true);

} catch (error) {
  console.error('💥 Error occurred:', error);
  setShowLoadingModal(false);
  const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
  alert(`Enrichment failed: ${errorMessage}. Please check the console for more details.`);
}
};

  // Delete contact
  const deleteContact = (contactId: number) => {
    setContacts(prev => prev.filter(c => c.id !== contactId));
    setShowContactModal(false);
    setSelectedContact(null);
  };

  // Update contact category
  const updateCategory = (contactId: number, category: string) => {
    setContacts(prev => prev.map(contact =>
      contact.id === contactId ? { ...contact, category } : contact
    ));
  };

  // Generate lead magnet
  const generateLeadMagnet = async (type: string) => {
    setLoadingMessage('Generating your lead magnet...');
    setShowLoadingModal(true);

    // Simulate API call
    setTimeout(() => {
      const newLeadMagnet: LeadMagnet = {
        id: Date.now(),
        title: `${type} for ${user.targetMarket}`,
        description: `A comprehensive ${type.toLowerCase()} designed specifically for ${user.targetMarket} businesses`,
        type: type,
        created: new Date().toISOString().split('T')[0],
        downloads: 0,
        content: `# ${type} for ${user.targetMarket}

This is your AI-generated lead magnet content...

[Full content would be generated here based on your business type and target market]`
      };

      setLeadMagnets(prev => [...prev, newLeadMagnet]);
      setShowLoadingModal(false);
      setSuccessMessage('Lead magnet generated successfully!');
      setShowSuccessModal(true);

      // Mark lead magnet task as complete
      setTasks(prev => prev.map(task =>
        task.id === 4 ? { ...task, completed: true } : task
      ));
    }, 2000);
  };

  // Generate strategy
  const generateStrategy = async () => {
    if (!strategy.oneOffer || !strategy.idealReferralPartners || !strategy.specialFactors) {
      alert('Please fill in all fields before generating your strategy.');
      return;
    }

    setLoadingMessage('Generating your personalised strategy...');
    setShowLoadingModal(true);

    // Simulate API call
    setTimeout(() => {
      const generatedStrategy = `# Your Personalised ABM Strategy

## Core Offer Focus
${strategy.oneOffer}

## Referral Partner Network
Target these types of partners: ${strategy.idealReferralPartners}

## Unique Positioning
${strategy.specialFactors}

## Recommended Actions:
1. Create targeted content for your ideal clients in ${user.targetMarket}
2. Develop partnership programs with ${strategy.idealReferralPartners}
3. Leverage your unique factors: ${strategy.specialFactors}
4. Implement systematic outreach using the contacts you've enriched

This strategy is tailored specifically for ${user.company} in the ${user.businessType} space.`;

      setStrategy(prev => ({ ...prev, generatedStrategy }));
      setShowLoadingModal(false);
      setSuccessMessage('Strategy generated successfully!');
      setShowSuccessModal(true);

      // Mark strategy task as complete
      setTasks(prev => prev.map(task =>
        task.id === 5 ? { ...task, completed: true } : task
      ));
    }, 3000);
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

  // Handle user settings update
  const updateUserSettings = (newSettings: Partial<User>) => {
    setUser(prev => ({ ...prev, ...newSettings }));
    setShowSettingsModal(false);
    setSuccessMessage('Settings updated successfully!');
    setShowSuccessModal(true);

    // Mark business settings task as complete if not already
    if (newSettings.businessType || newSettings.targetMarket) {
      setTasks(prev => prev.map(task =>
        task.id === 2 ? { ...task, completed: true } : task
      ));
    }
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
                <p className="text-white text-opacity-80 text-lg">Transform your LinkedIn connections into strategic business relationships</p>
              </div>

              <div className="bg-white bg-opacity-10 backdrop-blur rounded-xl p-6 space-y-4">
                <div className="flex items-center space-x-3">
                  <Shield className="w-5 h-5 text-yellow-400" />
                  <span className="text-white">AI-powered contact enrichment</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Target className="w-5 h-5 text-yellow-400" />
                  <span className="text-white">Automated ABM strategies</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Users className="w-5 h-5 text-yellow-400" />
                  <span className="text-white">Smart lead magnet generation</span>
                </div>
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => setAuthView('login')}
                  className="w-full px-6 py-3 bg-yellow-400 text-purple-900 rounded-lg hover:bg-yellow-500 transition-colors font-semibold"
                >
                  Sign In
                </button>
                <button
                  onClick={() => setAuthView('register')}
                  className="w-full px-6 py-3 bg-white bg-opacity-20 text-white rounded-lg hover:bg-opacity-30 transition-colors"
                >
                  Start Free Trial
                </button>
              </div>

              <p className="text-white text-opacity-60 text-sm">Glass Slipper v1.0 Beta</p>
            </div>
          )}

          {(authView === 'login' || authView === 'register') && (
            <div className="bg-white bg-opacity-10 backdrop-blur rounded-xl p-8 space-y-6">
              <div className="text-center">
                <button
                  onClick={() => setAuthView('landing')}
                  className="text-white hover:text-yellow-400 transition-colors mb-4 flex items-center space-x-2 mx-auto"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>
                <h2 className="text-2xl font-bold text-white mb-2">
                  {authView === 'login' ? 'Welcome Back' : 'Start Your Journey'}
                </h2>
                <p className="text-white text-opacity-70">
                  {authView === 'login' ? 'Sign in to your Glass Slipper account' : 'Create your Glass Slipper account'}
                </p>
              </div>

              <div className="space-y-4">
                {authView === 'register' && (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-white text-sm font-medium mb-2">Name</label>
                      <input
                        type="text"
                        value={authForm.name}
                        onChange={(e) => setAuthForm(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full px-3 py-3 bg-white bg-opacity-20 text-white placeholder-white placeholder-opacity-50 rounded-lg focus:bg-opacity-30 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                        placeholder="John Smith"
                      />
                    </div>
                    <div>
                      <label className="block text-white text-sm font-medium mb-2">Company</label>
                      <input
                        type="text"
                        value={authForm.company}
                        onChange={(e) => setAuthForm(prev => ({ ...prev, company: e.target.value }))}
                        className="w-full px-3 py-3 bg-white bg-opacity-20 text-white placeholder-white placeholder-opacity-50 rounded-lg focus:bg-opacity-30 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                        placeholder="Company Ltd"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-white text-sm font-medium mb-2">Email</label>
                  <div className="relative">
                    <Mail className="w-5 h-5 text-white text-opacity-50 absolute left-3 top-3" />
                    <input
                      type="email"
                      value={authForm.email}
                      onChange={(e) => setAuthForm(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full pl-10 pr-4 py-3 bg-white bg-opacity-20 text-white placeholder-white placeholder-opacity-50 rounded-lg focus:bg-opacity-30 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                      placeholder="john@company.com"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-white text-sm font-medium mb-2">Password</label>
                    <div className="relative">
                      <Lock className="w-5 h-5 text-white text-opacity-50 absolute left-3 top-3" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={authForm.password}
                        onChange={(e) => setAuthForm(prev => ({ ...prev, password: e.target.value }))}
                        className="w-full pl-10 pr-10 py-3 bg-white bg-opacity-20 text-white placeholder-white placeholder-opacity-50 rounded-lg focus:bg-opacity-30 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-3 text-white text-opacity-50 hover:text-opacity-70"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  {authView === 'register' && (
                    <div>
                      <label className="block text-white text-sm font-medium mb-2">Confirm</label>
                      <input
                        type="password"
                        value={authForm.confirmPassword}
                        onChange={(e) => setAuthForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                        className="w-full px-3 py-3 bg-white bg-opacity-20 text-white placeholder-white placeholder-opacity-50 rounded-lg focus:bg-opacity-30 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                        placeholder="••••••••"
                      />
                    </div>
                  )}
                </div>
              </div>

              <button
                onClick={handleAuth}
                className="w-full px-6 py-3 bg-yellow-400 text-purple-900 rounded-lg hover:bg-yellow-500 transition-colors font-semibold flex items-center justify-center space-x-2"
              >
                <span>{authView === 'login' ? 'Sign In' : 'Create Account'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <p className="text-center text-white text-opacity-70 text-sm">
                {authView === 'login' ? "Don't have an account? " : "Already have an account? "}
                <button
                  onClick={() => setAuthView(authView === 'login' ? 'register' : 'login')}
                  className="text-yellow-400 hover:text-yellow-300 transition-colors"
                >
                  {authView === 'login' ? 'Sign up here' : 'Sign in here'}
                </button>
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900">
      {/* Header */}
      <header className="bg-white bg-opacity-10 backdrop-blur border-b border-white border-opacity-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-purple-900" />
              </div>
              <span className="text-white font-semibold text-lg">Glass Slipper</span>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.view}
                    onClick={() => setCurrentView(item.view)}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                      currentView === item.view
                        ? 'bg-yellow-400 text-purple-900'
                        : 'text-white hover:bg-white hover:bg-opacity-10'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="font-medium">{item.label}</span>
                  </button>
                );
              })}
            </nav>

            <div className="flex items-center space-x-4">
              <span className="hidden sm:block text-white text-opacity-70 text-sm">
                Welcome back, {user.name}
              </span>
              <button
                onClick={handleLogout}
                className="p-2 text-white hover:bg-white hover:bg-opacity-10 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
              <button
                onClick={() => setShowMobileMenu(true)}
                className="md:hidden p-2 text-white hover:bg-white hover:bg-opacity-10 rounded-lg transition-colors"
              >
                <Menu className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      {showMobileMenu && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 md:hidden">
          <div className="bg-purple-900 w-64 h-full p-6">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-white text-lg font-semibold">Menu</h2>
              <button
                onClick={() => setShowMobileMenu(false)}
                className="text-white hover:text-yellow-400"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <nav className="space-y-4">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.view}
                    onClick={() => {
                      setCurrentView(item.view);
                      setShowMobileMenu(false);
                    }}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                      currentView === item.view
                        ? 'bg-yellow-400 text-purple-900'
                        : 'text-white hover:bg-white hover:bg-opacity-10'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Dashboard View */}
        {currentView === 'dashboard' && (
          <div className="space-y-8">
            {/* Welcome Section */}
            <div className="text-center space-y-4">
              <h1 className="text-3xl md:text-4xl font-bold text-white">
                Welcome to Glass Slipper, {user.name}
              </h1>
              <p className="text-white text-opacity-70 text-lg max-w-2xl mx-auto">
                Transform your LinkedIn connections into strategic business relationships with AI-powered insights.
              </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white bg-opacity-10 backdrop-blur rounded-xl p-6">
                <div className="flex items-center space-x-3">
                  <Users className="w-8 h-8 text-blue-400" />
                  <div>
                    <p className="text-white text-opacity-70 text-sm">Total Contacts</p>
                    <p className="text-white text-2xl font-bold">{totalContacts}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white bg-opacity-10 backdrop-blur rounded-xl p-6">
                <div className="flex items-center space-x-3">
                  <Target className="w-8 h-8 text-green-400" />
                  <div>
                    <p className="text-white text-opacity-70 text-sm">Ideal Clients</p>
                    <p className="text-white text-2xl font-bold">{idealClients}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white bg-opacity-10 backdrop-blur rounded-xl p-6">
                <div className="flex items-center space-x-3">
                  <UserCheck className="w-8 h-8 text-purple-400" />
                  <div>
                    <p className="text-white text-opacity-70 text-sm">Enriched</p>
                    <p className="text-white text-2xl font-bold">{enrichedContacts}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white bg-opacity-10 backdrop-blur rounded-xl p-6">
                <div className="flex items-center space-x-3">
                  <Building className="w-8 h-8 text-yellow-400" />
                  <div>
                    <p className="text-white text-opacity-70 text-sm">Partners</p>
                    <p className="text-white text-2xl font-bold">{referralPartners}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white bg-opacity-10 backdrop-blur rounded-xl p-6">
                <h3 className="text-xl font-semibold text-white mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full flex items-center space-x-3 px-4 py-3 bg-yellow-400 text-purple-900 rounded-lg hover:bg-yellow-500 transition-colors"
                  >
                    <Upload className="w-5 h-5" />
                    <span>Upload LinkedIn CSV</span>
                  </button>
                  <button
                    onClick={enrichIdealClients}
                    className="w-full flex items-center space-x-3 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <Zap className="w-5 h-5" />
                    <span>Enrich Contacts ({enrichmentsLeft} left) - Enhanced Website Detection</span>
                  </button>
                  <button
                    onClick={() => setCurrentView('strategy')}
                    className="w-full flex items-center space-x-3 px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    <Target className="w-5 h-5" />
                    <span>Generate Strategy</span>
                  </button>
                </div>
              </div>

              <div className="bg-white bg-opacity-10 backdrop-blur rounded-xl p-6">
                <h3 className="text-xl font-semibold text-white mb-4">Daily Tasks</h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                      dailyTasks.chooseIdealClients.completed 
                        ? 'bg-green-500 border-green-500' 
                        : 'border-white border-opacity-30'
                    }`}>
                      {dailyTasks.chooseIdealClients.completed && <Check className="w-3 h-3 text-white" />}
                    </div>
                    <span className={`text-white ${dailyTasks.chooseIdealClients.completed ? 'line-through opacity-75' : ''}`}>
                      Choose 3 ideal clients to focus on
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                      dailyTasks.commentOnPosts.completed 
                        ? 'bg-green-500 border-green-500' 
                        : 'border-white border-opacity-30'
                    }`}>
                      {dailyTasks.commentOnPosts.completed && <Check className="w-3 h-3 text-white" />}
                    </div>
                    <span className={`text-white ${dailyTasks.commentOnPosts.completed ? 'line-through opacity-75' : ''}`}>
                      Comment on 5 LinkedIn posts
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                      dailyTasks.postContent.completed 
                        ? 'bg-green-500 border-green-500' 
                        : 'border-white border-opacity-30'
                    }`}>
                      {dailyTasks.postContent.completed && <Check className="w-3 h-3 text-white" />}
                    </div>
                    <span className={`text-white ${dailyTasks.postContent.completed ? 'line-through opacity-75' : ''}`}>
                      Post valuable content
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Current Focus */}
            {currentIdealClient && (
              <div className="bg-white bg-opacity-10 backdrop-blur rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold text-white">Current Focus</h3>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setCurrentIdealClientIndex(Math.max(0, currentIdealClientIndex - 1))}
                      disabled={currentIdealClientIndex === 0}
                      className="p-2 text-white hover:bg-white hover:bg-opacity-10 rounded-lg transition-colors disabled:opacity-50"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <span className="text-white text-sm">
                      {currentIdealClientIndex + 1} of {idealClientsList.length}
                    </span>
                    <button
                      onClick={() => setCurrentIdealClientIndex(Math.min(idealClientsList.length - 1, currentIdealClientIndex + 1))}
                      disabled={currentIdealClientIndex === idealClientsList.length - 1}
                      className="p-2 text-white hover:bg-white hover:bg-opacity-10 rounded-lg transition-colors disabled:opacity-50"
                    >
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-xl">
                      {currentIdealClient.lastName 
                        ? (currentIdealClient.name.split(' ')[0][0] + currentIdealClient.lastName[0]).toUpperCase()
                        : currentIdealClient.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
                      }
                    </span>
                  </div>
                  <div className="flex-1">
                    <h4 className="text-lg font-semibold text-white">{currentIdealClient.name}</h4>
                    <p className="text-white text-opacity-70">{currentIdealClient.position}</p>
                    <p className="text-white text-opacity-70">{currentIdealClient.company}</p>
                    <button
                      onClick={() => {
                        setSelectedContact(currentIdealClient);
                        setShowContactModal(true);
                      }}
                      className="mt-2 text-yellow-400 hover:text-yellow-300 transition-colors text-sm"
                    >
                      View Details →
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Contacts View */}
        {currentView === 'contacts' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-3xl font-bold text-white">Contacts</h2>
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 bg-yellow-400 text-purple-900 rounded-lg hover:bg-yellow-500 transition-colors flex items-center space-x-2"
                >
                  <Upload className="w-4 h-4" />
                  <span>Upload CSV</span>
                </button>
                <button
                  onClick={enrichIdealClients}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
                >
                  <Zap className="w-4 h-4" />
                  <span>Enhanced Enrich ({enrichmentsLeft})</span>
                </button>
              </div>
            </div>

            {/* Search and Filter */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="w-5 h-5 text-white text-opacity-50 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="Search contacts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white bg-opacity-20 text-white placeholder-white placeholder-opacity-50 rounded-lg focus:bg-opacity-30 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                />
              </div>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-4 py-3 bg-white bg-opacity-20 text-white rounded-lg focus:bg-opacity-30 focus:outline-none focus:ring-2 focus:ring-yellow-400"
              >
                <option value="All" className="text-black">All Categories</option>
                {categories.map((category) => (
                  <option key={category} value={category} className="text-black">{category}</option>
                ))}
              </select>
            </div>

            {/* Contacts Table */}
            {filteredContacts.length > 0 ? (
              <div className="bg-white bg-opacity-10 backdrop-blur rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-white border-opacity-20">
                        <th className="text-left py-4 px-6 text-white font-medium">Contact</th>
                        <th className="text-left py-4 px-6 text-white font-medium">Company</th>
                        <th className="text-left py-4 px-6 text-white font-medium">Position</th>
                        <th className="text-left py-4 px-6 text-white font-medium">Industry</th>
                        <th className="text-left py-4 px-6 text-white font-medium">Category</th>
                        <th className="text-left py-4 px-6 text-white font-medium">Status</th>
                        <th className="text-left py-4 px-6 text-white font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredContacts.map((contact: Contact) => {
                        // Generate avatar initials using firstName and lastName if available
                        const generateInitials = (contact: Contact) => {
                          if (contact.lastName) {
                            const firstName = contact.name.split(' ')[0];
                            return (firstName[0] + contact.lastName[0]).toUpperCase();
                          }
                          return contact.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
                        };

                        return (
                        <tr key={contact.id} className="border-b border-white border-opacity-10 hover:bg-white hover:bg-opacity-5">
                          <td className="py-4 px-6">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center">
                                <span className="text-white font-medium text-sm">
                                  {generateInitials(contact)}
                                </span>
                              </div>
                              <div>
                                <p className="text-white font-medium">{contact.name}</p>
                                <p className="text-white text-opacity-70 text-sm">{contact.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <p className="text-white">{contact.company}</p>
                          </td>
                          <td className="py-4 px-6">
                            <p className="text-white">{contact.position}</p>
                          </td>
                          <td className="py-4 px-6">
                            <p className="text-white text-opacity-70">
                              {contact.industry || 'Not available'}
                            </p>
                          </td>
                          <td className="py-4 px-6">
                            <span className={`px-3 py-1 rounded-full text-sm ${
                              contact.category === 'Ideal Client'
                                ? 'bg-green-500 bg-opacity-20 text-green-300'
                                : contact.category === 'Champions'
                                ? 'bg-orange-500 bg-opacity-20 text-orange-300'
                                : contact.category === 'Referral Partners'
                                ? 'bg-blue-500 bg-opacity-20 text-blue-300'
                                : contact.category === 'Competitors'
                                ? 'bg-red-500 bg-opacity-20 text-red-300'
                                : contact.category === 'Other'
                                ? 'bg-gray-500 bg-opacity-20 text-gray-300'
                                : 'bg-purple-500 bg-opacity-20 text-purple-300'
                            }`}>
                              {contact.category || 'Uncategorised'}
                            </span>
                          </td>
                          <td className="py-4 px-6">
                            <span className={`px-3 py-1 rounded-full text-sm ${
                              contact.isEnriched
                                ? 'bg-green-500 bg-opacity-20 text-green-300'
                                : 'bg-yellow-500 bg-opacity-20 text-yellow-300'
                            }`}>
                              {contact.isEnriched ? 'Enriched' : 'Basic'}
                            </span>
                          </td>
                          <td className="py-4 px-6">
                            <button
                              onClick={() => {
                                setSelectedContact(contact);
                                setShowContactModal(true);
                              }}
                              className="text-yellow-400 hover:text-yellow-300 transition-colors"
                            >
                              View
                            </button>
                          </td>
                        </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="bg-white bg-opacity-10 backdrop-blur rounded-xl p-12 text-center">
                <Users className="w-16 h-16 text-white text-opacity-50 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">No contacts found</h3>
                <p className="text-white text-opacity-70 mb-6">
                  {contacts.length === 0 
                    ? "Upload your LinkedIn CSV to get started"
                    : "Try adjusting your search or filter criteria"
                  }
                </p>
                {contacts.length === 0 && (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="px-6 py-3 bg-yellow-400 text-purple-900 rounded-lg hover:bg-yellow-500 transition-colors flex items-center space-x-2 mx-auto"
                  >
                    <Upload className="w-4 h-4" />
                    <span>Upload LinkedIn CSV</span>
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* Strategy View */}
        {currentView === 'strategy' && (
          <div className="space-y-8">
            <h2 className="text-3xl font-bold text-white">ABM Strategy</h2>

            {!strategy.generatedStrategy ? (
              <div className="bg-white bg-opacity-10 backdrop-blur rounded-xl p-8">
                <h3 className="text-xl font-semibold text-white mb-6">Build Your Personalised Strategy</h3>
                <div className="space-y-6">
                  <div>
                    <label className="block text-white text-sm font-medium mb-2">
                      What's your one main offer/service?
                    </label>
                    <textarea
                      value={strategy.oneOffer}
                      onChange={(e) => setStrategy(prev => ({ ...prev, oneOffer: e.target.value }))}
                      placeholder="e.g., We help SaaS companies reduce churn by 30% through predictive analytics..."
                      className="w-full px-4 py-3 bg-white bg-opacity-20 text-white placeholder-white placeholder-opacity-50 rounded-lg focus:bg-opacity-30 focus:outline-none focus:ring-2 focus:ring-yellow-400 h-24 resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-white text-sm font-medium mb-2">
                      Who are your ideal referral partners?
                    </label>
                    <textarea
                      value={strategy.idealReferralPartners}
                      onChange={(e) => setStrategy(prev => ({ ...prev, idealReferralPartners: e.target.value }))}
                      placeholder="e.g., Accountants who work with 7-figure businesses, Management consultants, Business coaches..."
                      className="w-full px-4 py-3 bg-white bg-opacity-20 text-white placeholder-white placeholder-opacity-50 rounded-lg focus:bg-opacity-30 focus:outline-none focus:ring-2 focus:ring-yellow-400 h-24 resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-white text-sm font-medium mb-2">
                      What makes your business special/different?
                    </label>
                    <textarea
                      value={strategy.specialFactors}
                      onChange={(e) => setStrategy(prev => ({ ...prev, specialFactors: e.target.value }))}
                      placeholder="e.g., 15 years experience in FinTech, Unique proprietary methodology, Previously scaled 3 companies..."
                      className="w-full px-4 py-3 bg-white bg-opacity-20 text-white placeholder-white placeholder-opacity-50 rounded-lg focus:bg-opacity-30 focus:outline-none focus:ring-2 focus:ring-yellow-400 h-24 resize-none"
                    />
                  </div>

                  <button
                    onClick={generateStrategy}
                    className="w-full px-6 py-3 bg-yellow-400 text-purple-900 rounded-lg hover:bg-yellow-500 transition-colors font-semibold flex items-center justify-center space-x-2"
                  >
                    <Target className="w-5 h-5" />
                    <span>Generate My Strategy</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-white bg-opacity-10 backdrop-blur rounded-xl p-8">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-white">Your Personalised Strategy</h3>
                  <button
                    onClick={() => setStrategy(prev => ({ ...prev, generatedStrategy: '' }))}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    Regenerate
                  </button>
                </div>
                <div className="prose prose-invert max-w-none">
                  <pre className="whitespace-pre-wrap text-white text-opacity-90 leading-relaxed">
                    {strategy.generatedStrategy}
                  </pre>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Lead Magnets View */}
        {currentView === 'lead-magnets' && (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <h2 className="text-3xl font-bold text-white">Lead Magnets</h2>
              <div className="flex items-center space-x-3">
                {['Guide', 'Checklist', 'Template', 'Whitepaper'].map((type) => (
                  <button
                    key={type}
                    onClick={() => generateLeadMagnet(type)}
                    className="px-4 py-2 bg-yellow-400 text-purple-900 rounded-lg hover:bg-yellow-500 transition-colors text-sm"
                  >
                    Generate {type}
                  </button>
                ))}
              </div>
            </div>

            {leadMagnets.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {leadMagnets.map((magnet) => (
                  <div key={magnet.id} className="bg-white bg-opacity-10 backdrop-blur rounded-xl p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-white mb-2">{magnet.title}</h3>
                        <p className="text-white text-opacity-70 text-sm mb-3">{magnet.description}</p>
                        <div className="flex items-center space-x-4 text-sm text-white text-opacity-50">
                          <span>{magnet.type}</span>
                          <span>•</span>
                          <span>{magnet.downloads} downloads</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => {
                          setSelectedLeadMagnet(magnet);
                          setShowLeadMagnetModal(true);
                        }}
                        className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm"
                      >
                        Preview
                      </button>
                      <button
                        onClick={() => downloadLeadMagnet(magnet)}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white bg-opacity-10 backdrop-blur rounded-xl p-12 text-center">
                <FileText className="w-16 h-16 text-white text-opacity-50 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">No lead magnets yet</h3>
                <p className="text-white text-opacity-70 mb-6">
                  Generate your first lead magnet to start attracting your ideal clients
                </p>
                <div className="flex items-center justify-center space-x-3">
                  {['Guide', 'Checklist', 'Template'].map((type) => (
                    <button
                      key={type}
                      onClick={() => generateLeadMagnet(type)}
                      className="px-4 py-2 bg-yellow-400 text-purple-900 rounded-lg hover:bg-yellow-500 transition-colors"
                    >
                      Generate {type}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tasks View */}
        {currentView === 'tasks' && (
          <div className="space-y-8">
            <h2 className="text-3xl font-bold text-white">Tasks</h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Setup Tasks */}
              <div className="bg-white bg-opacity-10 backdrop-blur rounded-xl p-6">
                <h3 className="text-xl font-semibold text-white mb-6">Setup Tasks</h3>
                <div className="space-y-4">
                  {tasks.map((task) => (
                    <div key={task.id} className="flex items-center justify-between p-4 bg-white bg-opacity-5 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                          task.completed 
                            ? 'bg-green-500 border-green-500' 
                            : 'border-white border-opacity-30 hover:border-opacity-50'
                        }`}>
                          {task.completed && <Check className="w-3 h-3 text-white" />}
                        </div>
                        <span className={`${task.completed ? 'text-white line-through' : 'text-white'}`}>
                          {task.text}
                        </span>
                      </div>
                      <span className={`text-xs px-3 py-1 rounded-full font-medium ${
                        task.priority === 'high'
                          ? 'bg-red-500 bg-opacity-20 text-red-300'
                          : task.priority === 'medium'
                          ? 'bg-yellow-500 bg-opacity-20 text-yellow-300'
                          : 'bg-gray-500 bg-opacity-20 text-gray-300'
                      }`}>
                        {task.priority}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Daily Tasks */}
              <div className="bg-white bg-opacity-10 backdrop-blur rounded-xl p-6">
                <h3 className="text-xl font-semibold text-white mb-6">Daily Tasks</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-white bg-opacity-5 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => setDailyTasks(prev => ({
                          ...prev,
                          chooseIdealClients: { completed: !prev.chooseIdealClients.completed }
                        }))}
                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                          dailyTasks.chooseIdealClients.completed 
                            ? 'bg-green-500 border-green-500' 
                            : 'border-white border-opacity-30 hover:border-opacity-50'
                        }`}
                      >
                        {dailyTasks.chooseIdealClients.completed && <Check className="w-3 h-3 text-white" />}
                      </button>
                      <span className={`${dailyTasks.chooseIdealClients.completed ? 'text-white line-through' : 'text-white'}`}>
                        Choose 3 ideal clients to focus on
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-white bg-opacity-5 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => setDailyTasks(prev => ({
                          ...prev,
                          commentOnPosts: { completed: !prev.commentOnPosts.completed }
                        }))}
                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                          dailyTasks.commentOnPosts.completed 
                            ? 'bg-green-500 border-green-500' 
                            : 'border-white border-opacity-30 hover:border-opacity-50'
                        }`}
                      >
                        {dailyTasks.commentOnPosts.completed && <Check className="w-3 h-3 text-white" />}
                      </button>
                      <span className={`${dailyTasks.commentOnPosts.completed ? 'text-white line-through' : 'text-white'}`}>
                        Comment on 5 LinkedIn posts
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-white bg-opacity-5 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => setDailyTasks(prev => ({
                          ...prev,
                          postContent: { completed: !prev.postContent.completed }
                        }))}
                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                          dailyTasks.postContent.completed 
                            ? 'bg-green-500 border-green-500' 
                            : 'border-white border-opacity-30 hover:border-opacity-50'
                        }`}
                      >
                        {dailyTasks.postContent.completed && <Check className="w-3 h-3 text-white" />}
                      </button>
                      <span className={`${dailyTasks.postContent.completed ? 'text-white line-through' : 'text-white'}`}>
                        Post valuable content
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Settings View */}
        {currentView === 'settings' && (
          <div className="space-y-8">
            <h2 className="text-3xl font-bold text-white">Settings</h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white bg-opacity-10 backdrop-blur rounded-xl p-6">
                <h3 className="text-xl font-semibold text-white mb-6">Business Profile</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-white text-sm font-medium mb-2">Business Type</label>
                    <input
                      type="text"
                      value={user.businessType}
                      onChange={(e) => setUser(prev => ({ ...prev, businessType: e.target.value }))}
                      className="w-full px-4 py-3 bg-white bg-opacity-20 text-white placeholder-white placeholder-opacity-50 rounded-lg focus:bg-opacity-30 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                      placeholder="e.g., Consulting, SaaS, Marketing Agency"
                    />
                  </div>

                  <div>
                    <label className="block text-white text-sm font-medium mb-2">Target Market</label>
                    <input
                      type="text"
                      value={user.targetMarket}
                      onChange={(e) => setUser(prev => ({ ...prev, targetMarket: e.target.value }))}
                      className="w-full px-4 py-3 bg-white bg-opacity-20 text-white placeholder-white placeholder-opacity-50 rounded-lg focus:bg-opacity-30 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                      placeholder="e.g., B2B SaaS, Manufacturing, Professional Services"
                    />
                  </div>

                  <div>
                    <label className="block text-white text-sm font-medium mb-2">Writing Style</label>
                    <select
                      value={user.writingStyle}
                      onChange={(e) => setUser(prev => ({ ...prev, writingStyle: e.target.value }))}
                      className="w-full px-4 py-3 bg-white bg-opacity-20 text-white rounded-lg focus:bg-opacity-30 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                    >
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

                  <button
                    onClick={() => updateUserSettings({
                      businessType: user.businessType,
                      targetMarket: user.targetMarket,
                      writingStyle: user.writingStyle,
                      referralPartners: user.referralPartners
                    })}
                    className="w-full px-6 py-3 bg-yellow-400 text-purple-900 rounded-lg hover:bg-yellow-500 transition-colors font-semibold"
                  >
                    Save Settings
                  </button>
                </div>
              </div>

              <div className="bg-white bg-opacity-10 backdrop-blur rounded-xl p-6">
                <h3 className="text-xl font-semibold text-white mb-6">Account</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-white text-sm font-medium mb-2">Name</label>
                    <input
                      type="text"
                      value={user.name}
                      onChange={(e) => setUser(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-4 py-3 bg-white bg-opacity-20 text-white placeholder-white placeholder-opacity-50 rounded-lg focus:bg-opacity-30 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                    />
                  </div>

                  <div>
                    <label className="block text-white text-sm font-medium mb-2">Email</label>
                    <input
                      type="email"
                      value={user.email}
                      onChange={(e) => setUser(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full px-4 py-3 bg-white bg-opacity-20 text-white placeholder-white placeholder-opacity-50 rounded-lg focus:bg-opacity-30 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                    />
                  </div>

                  <div>
                    <label className="block text-white text-sm font-medium mb-2">Company</label>
                    <input
                      type="text"
                      value={user.company}
                      onChange={(e) => setUser(prev => ({ ...prev, company: e.target.value }))}
                      className="w-full px-4 py-3 bg-white bg-opacity-20 text-white placeholder-white placeholder-opacity-50 rounded-lg focus:bg-opacity-30 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                    />
                  </div>

                  <div className="pt-4 border-t border-white border-opacity-20">
                    <div className="flex items-center justify-between">
                      <span className="text-white">Enrichments Remaining</span>
                      <span className="text-yellow-400 font-semibold">{enrichmentsLeft}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv"
        onChange={handleFileUpload}
        className="hidden"
      />

      {/* Loading Modal */}
      {showLoadingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white bg-opacity-10 backdrop-blur rounded-xl p-8 text-center">
            <div className="w-16 h-16 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-white text-lg">{loadingMessage}</p>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white bg-opacity-10 backdrop-blur rounded-xl p-8 text-center max-w-md">
            <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
            <p className="text-white text-lg mb-6">{successMessage}</p>
            <button
              onClick={() => setShowSuccessModal(false)}
              className="px-6 py-3 bg-yellow-400 text-purple-900 rounded-lg hover:bg-yellow-500 transition-colors"
            >
              Continue
            </button>
          </div>
        </div>
      )}

      {/* Contact Modal */}
      {showContactModal && selectedContact && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white bg-opacity-10 backdrop-blur rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-white">Contact Details</h3>
              <button
                onClick={() => setShowContactModal(false)}
                className="text-white hover:text-yellow-400"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Contact Info */}
            <div className="bg-white bg-opacity-10 rounded-lg p-4 mb-6">
              <div className="flex items-start space-x-4">
                <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-xl">
                    {selectedContact.lastName 
                      ? (selectedContact.name.split(' ')[0][0] + selectedContact.lastName[0]).toUpperCase()
                      : selectedContact.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
                    }
                  </span>
                </div>
                
                <div className="flex-1">
                  <h4 className="text-lg font-semibold text-white">{selectedContact.name}</h4>
                  <p className="text-white text-opacity-70">{selectedContact.position}</p>
                  <p className="text-white text-opacity-70">{selectedContact.company}</p>
                  {selectedContact.industry && (
                    <p className="text-white text-opacity-70 text-sm">Industry: {selectedContact.industry}</p>
                  )}
                  
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
            <div className="mb-6">
              <label className="block text-white text-sm font-medium mb-2">Category</label>
              <select
                value={selectedContact.category || 'Uncategorised'}
                onChange={(e) => {
                  updateCategory(selectedContact.id, e.target.value);
                  setSelectedContact(prev => prev ? { ...prev, category: e.target.value } : null);
                }}
                className="w-full px-3 py-2 bg-white bg-opacity-20 text-white rounded-lg focus:bg-opacity-30 focus:outline-none focus:ring-2 focus:ring-yellow-400"
              >
                <option value="Uncategorised" className="text-black">Uncategorised</option>
                {categories.map((category) => (
                  <option key={category} value={category} className="text-black">{category}</option>
                ))}
              </select>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between">
              <button
                onClick={() => deleteContact(selectedContact.id)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete</span>
              </button>
              
              <button
                onClick={() => setShowContactModal(false)}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lead Magnet Modal */}
      {showLeadMagnetModal && selectedLeadMagnet && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white bg-opacity-10 backdrop-blur rounded-xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-white">{selectedLeadMagnet.title}</h3>
              <button
                onClick={() => setShowLeadMagnetModal(false)}
                className="text-white hover:text-yellow-400"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="bg-white bg-opacity-10 rounded-lg p-6 mb-6">
              <pre className="whitespace-pre-wrap text-white text-opacity-90 leading-relaxed text-sm">
                {selectedLeadMagnet.content}
              </pre>
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
                  setSuccessMessage('Content copied to clipboard!');
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
                onClick={() => setShowLeadMagnetModal(false)}
                className="flex-1 px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-center"
              >
                Close
              </button>
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
                onClick={() => setShowSettingsModal(false)}
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
                    <option value="Marketing Agency" className="text-black">Marketing Agency</option>
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
                    placeholder="e.g., B2B SaaS, Manufacturing"
                  />
                </div>

                <div>
                  <label className="block text-white text-sm font-medium mb-2">Writing Style</label>
                  <select
                    value={user.writingStyle}
                    onChange={(e) => setUser(prev => ({ ...prev, writingStyle: e.target.value }))}
                    className="w-full px-4 py-3 bg-white bg-opacity-20 text-white rounded-lg focus:bg-opacity-30 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  >
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
                  onClick={() => updateUserSettings({
                    businessType: user.businessType,
                    targetMarket: user.targetMarket,
                    writingStyle: user.writingStyle,
                    referralPartners: user.referralPartners
                  })}
                  className="flex-1 px-6 py-3 bg-yellow-400 text-purple-900 rounded-lg hover:bg-yellow-500 transition-colors font-semibold"
                >
                  Save Settings
                </button>
                
                <button
                  onClick={() => setShowSettingsModal(false)}
                  className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GlassSlipperApp;