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
  categoryReason?: string;
  directMessage?: string; // ✅ NEW: Store generated direct message
}

interface User {
  name: string;
  email: string;
  company: string;
  businessType: string;
  targetMarket: string;
  writingStyle: string;
  referralPartners: string;
  // NEW FIELDS FOR WRITING STYLE ANALYSIS:
  aboutYou: string;
  aboutYourBusiness: string;
  analyzedWritingStyle: string;
  writingStyleAnalyzed: boolean;
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
  idealClientProfile: string;
  specialFactors: string;
  generatedStrategy: string;
}

interface DailyTask {
  completed: boolean;
  count?: number;
  total?: number;
}

interface DailyTasks {
  sendDMsToClients: DailyTask;
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
  businessType: string;
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
    targetMarket: '',
    writingStyle: 'Professional yet conversational',
    referralPartners: '',
    aboutYou: '',
    aboutYourBusiness: '',
    analyzedWritingStyle: '',
    writingStyleAnalyzed: false
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
    company: '',
    businessType: ''
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
    idealClientProfile: '',
    specialFactors: '',
    generatedStrategy: ''
  });

  // Lead magnets state
  const [leadMagnets, setLeadMagnets] = useState<LeadMagnet[]>([]);

  // Tasks state
  const [tasks, setTasks] = useState<Task[]>([
    { id: 1, text: 'Upload LinkedIn CSV contacts', completed: false, priority: 'high' },
    { id: 2, text: 'Configure business settings', completed: false, priority: 'high' },
    { id: 3, text: 'Enrich contacts with real data', completed: false, priority: 'medium' },
    { id: 4, text: 'Create referral strategy', completed: false, priority: 'medium' },
    { id: 5, text: 'Generate lead magnets', completed: false, priority: 'low' }
  ]);

  // Daily tasks state  
  const [dailyTasks, setDailyTasks] = useState<DailyTasks>({
    sendDMsToClients: { completed: false, count: 0, total: 5 },
    commentOnPosts: { completed: false, count: 0, total: 10 },
    postContent: { completed: false },
    lastReset: new Date().toDateString()
  });

  // Writing style analysis state
  const [aboutYouWordCount, setAboutYouWordCount] = useState<number>(0);
  const [aboutBusinessWordCount, setAboutBusinessWordCount] = useState<number>(0);
  const totalWordCount = aboutYouWordCount + aboutBusinessWordCount;

  // Helper states for contact management
  const enrichedContactsCount = contacts.filter(c => c.isEnriched).length;

  // Navigation items with Profile added at the end
  const navigationItems: NavigationItem[] = [
    { view: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { view: 'contacts', label: 'Contacts', icon: Users },
    { view: 'strategy', label: 'Strategy', icon: Target },
    { view: 'lead-magnets', label: 'Lead Magnets', icon: Zap },
    { view: 'profile', label: 'Profile', icon: User }
  ];

  // Parse CSV contacts
  const parseContactsFromCSV = useCallback((csvText: string): Contact[] => {
    const lines = csvText.split('\n').filter(line => line.trim().length > 0);
    if (lines.length < 2) return [];

    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    const contacts: Contact[] = [];

    console.log('🔍 PARSING: Found headers:', headers);

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
      
      const contact: Contact = {
        id: Date.now() + i,
        name: '',
        company: '',
        position: '',
        email: '',
        isEnriched: false
      };

      headers.forEach((header, index) => {
        const value = values[index] || '';
        const lowerHeader = header.toLowerCase();
        
        // First name field
        if (lowerHeader.includes('first name') || lowerHeader === 'first') {
          contact.name = value;
        }
        
        // Last name field  
        if (lowerHeader.includes('last name') || lowerHeader === 'last') {
          const value = values[index] || '';
          contact.name = contact.name ? `${contact.name} ${value}` : value;
          contact.lastName = value;
        }
        
        // Full name field
        if (lowerHeader.includes('full name') || lowerHeader === 'name') {
          contact.name = value;
        }

        // Company field
        if (lowerHeader.includes('company') || lowerHeader.includes('organisation') || lowerHeader.includes('organization')) {
          contact.company = value;
        }

        // Position/Title field
        if (lowerHeader.includes('position') || lowerHeader.includes('title') || lowerHeader.includes('job')) {
          contact.position = value;
        }

        // Email field
        if (lowerHeader.includes('email')) {
          contact.email = value;
        }

        // Industry field
        if (lowerHeader.includes('industry')) {
          contact.industry = value;
        }
      });

      // STAGE 1 FIX: Only add contacts with minimum required data
      if (contact.name && contact.name.trim().length > 0) {
        // Set default values for missing fields
        if (!contact.company) contact.company = 'Unknown';
        if (!contact.position) contact.position = 'Unknown';
        if (!contact.email) contact.email = 'No email';
        
        contacts.push(contact);
        console.log('🔍 PARSING: Added contact:', contact.name, contact.company, contact.position);
      } else {
        console.warn('⚠️ PARSING: Skipped contact with missing name:', values);
      }
    }

    console.log(`🔍 PARSING: Successfully parsed ${contacts.length} contacts`);
    return contacts;
  }, []);

  // File upload handler
  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.csv')) {
      alert('Please upload a CSV file');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e: ProgressEvent<FileReader>) => {
      const csvText = e.target?.result as string;
      if (csvText) {
        const parsedContacts = parseContactsFromCSV(csvText);
        if (parsedContacts.length > 0) {
          setContacts(parsedContacts);
          setTasks(prev => prev.map(task => 
            task.id === 1 ? { ...task, completed: true } : task
          ));
          
          setShowSuccessModal(true);
          setSuccessMessage(`Successfully imported ${parsedContacts.length} contacts from CSV file.`);
        } else {
          alert('No valid contacts found in the CSV file. Please check the format.');
        }
      }
    };
    reader.readAsText(file);
    
    // Reset file input
    if (event.target) {
      event.target.value = '';
    }
  }, [parseContactsFromCSV]);

  // Contact categorization function
  const categorizeContacts = async () => {
    const enrichedContacts = contacts.filter(c => c.isEnriched);
    
    if (enrichedContacts.length === 0) {
      alert('No enriched contacts to categorize. Please enrich contacts first.');
      return;
    }

    setShowLoadingModal(true);
    setLoadingMessage('Categorizing contacts using AI analysis...');

    try {
      const response = await fetch('/api/categorize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contacts: enrichedContacts,
          userProfile: {
            targetMarket: user.targetMarket,
            referralPartners: user.referralPartners,
            businessType: user.businessType,
            company: user.company
          }
        }),
      });

      if (!response.ok) {
        throw new Error(`Categorization failed: ${response.statusText}`);
      }

      const result = await response.json();

      if (result.success && result.contacts) {
        // Update contacts with categories
        const updatedContacts = contacts.map(contact => {
          const categorizedContact = result.contacts.find((c: Contact) => c.id === contact.id);
          return categorizedContact || contact;
        });
        
        setContacts(updatedContacts);
        setShowLoadingModal(false);
        setShowSuccessModal(true);
        setSuccessMessage(`Successfully categorized ${result.contacts.length} contacts!`);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('Categorization error:', error);
      setShowLoadingModal(false);
      alert(`Categorization failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  // Enrich contacts function
  const enrichContacts = async () => {
    if (contacts.length === 0) {
      alert('No contacts to enrich. Please upload a CSV file first.');
      return;
    }

    setShowLoadingModal(true);
    setLoadingMessage('Enriching contacts with real business data...');

    try {
      const response = await fetch('/api/enrich', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          contacts,
          userProfile: {
            targetMarket: user.targetMarket,
            referralPartners: user.referralPartners,
            businessType: user.businessType,
            company: user.company
          }
        }),
      });

      if (!response.ok) {
        throw new Error(`Enrichment failed: ${response.statusText}`);
      }

      const result = await response.json();

      if (result.success && result.contacts) {
        setContacts(result.contacts);
        setTasks(prev => prev.map(task => 
          task.id === 3 ? { ...task, completed: true } : task
        ));
        
        setShowLoadingModal(false);
        setShowSuccessModal(true);
        setSuccessMessage(`Successfully enriched ${result.contacts.length} contacts with business data!`);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('Enrichment error:', error);
      setShowLoadingModal(false);
      alert(`Enrichment failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  // Generate strategy function
  const generateStrategy = async () => {
    if (!strategy.oneOffer || !strategy.idealClientProfile || !strategy.specialFactors) {
      alert('Please fill in all strategy fields before generating.');
      return;
    }

    setShowLoadingModal(true);
    setLoadingMessage('Generating your personalized referral strategy...');

    try {
      const response = await fetch('/api/strategy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...strategy,
          user,
          contacts: filteredContacts,
          writingStyle: user.writingStyleAnalyzed ? user.analyzedWritingStyle : 'Professional yet conversational',
          aboutYou: user.aboutYou,
          aboutYourBusiness: user.aboutYourBusiness
        }),
      });

      if (!response.ok) {
        throw new Error(`Strategy generation failed: ${response.statusText}`);
      }

      const result = await response.json();
      
      if (result.success && result.strategy) {
        setStrategy(prev => ({ ...prev, generatedStrategy: result.strategy }));
        setTasks(prev => prev.map(task => 
          task.id === 4 ? { ...task, completed: true } : task
        ));
        
        setShowLoadingModal(false);
        setShowSuccessModal(true);
        setSuccessMessage('Your personalized referral strategy has been generated!');
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('Strategy generation error:', error);
      setShowLoadingModal(false);
      alert(`Strategy generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  // Close modals function
  const closeModals = () => {
    setShowContactModal(false);
    setShowLoadingModal(false);
    setShowSuccessModal(false);
    setShowLeadMagnetModal(false);
    setSelectedContact(null);
    setSelectedLeadMagnet(null);
  };

  // Auth handlers
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsAuthenticated(true);
    setCurrentView('dashboard');
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (authForm.password !== authForm.confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    const newUser: User = {
      name: authForm.name,
      email: authForm.email,
      company: authForm.company,
      businessType: authForm.businessType,
      targetMarket: '',
      writingStyle: 'Professional yet conversational',
      referralPartners: '',
      aboutYou: '',
      aboutYourBusiness: '',
      analyzedWritingStyle: '',
      writingStyleAnalyzed: false
    };

    setCurrentUser(newUser);
    setUser(newUser);
    setIsAuthenticated(true);
    setCurrentView('dashboard');

    // Reset daily tasks for new user
    setDailyTasks({
      sendDMsToClients: { completed: false, count: 0, total: 5 },
      commentOnPosts: { completed: false, count: 0, total: 10 },
      postContent: { completed: false },
      lastReset: new Date().toDateString()
    });
  };

  const updateUserSettings = (updatedUser: User) => {
    setUser(updatedUser);
    setCurrentUser(updatedUser);
    setTasks(prev => prev.map(task => 
      task.id === 2 ? { ...task, completed: true } : task
    ));
    
    setShowSuccessModal(true);
    setSuccessMessage('Profile settings updated successfully!');
  };

  // Generate lead magnet function
  const generateLeadMagnet = async (type: 'checklist' | 'guide') => {
    setShowLoadingModal(true);
    setLoadingMessage(`Generating ${type} lead magnet...`);

    try {
      const response = await fetch('/api/lead-magnets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type,
          user,
          strategy: strategy.generatedStrategy,
          contacts: filteredContacts,
          writingStyle: user.writingStyleAnalyzed ? user.analyzedWritingStyle : 'Professional yet conversational',
          aboutYou: user.aboutYou,
          aboutYourBusiness: user.aboutYourBusiness
        }),
      });

      if (!response.ok) {
        throw new Error(`Lead magnet generation failed: ${response.statusText}`);
      }

      const result = await response.json();
      
      if (result.success && result.leadMagnet) {
        const newLeadMagnet: LeadMagnet = {
          id: Date.now(),
          title: result.leadMagnet.title,
          description: result.leadMagnet.description,
          type: type,
          created: new Date().toLocaleDateString(),
          downloads: 0,
          content: result.leadMagnet.content
        };
        
        setLeadMagnets(prev => [...prev, newLeadMagnet]);
        setTasks(prev => prev.map(task => 
          task.id === 5 ? { ...task, completed: true } : task
        ));
        
        setShowLoadingModal(false);
        setShowSuccessModal(true);
        setSuccessMessage(`Your ${type} lead magnet has been generated in your unique writing style!`);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('Lead magnet generation error:', error);
      setShowLoadingModal(false);
      alert(`Lead magnet generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  // Daily tasks reset
  useEffect(() => {
    const today = new Date().toDateString();
    if (dailyTasks.lastReset !== today) {
      setDailyTasks({
        sendDMsToClients: { completed: false, count: 0, total: 5 },
        commentOnPosts: { completed: false, count: 0, total: 10 },
        postContent: { completed: false },
        lastReset: today
      });
    }
  }, [dailyTasks.lastReset]);

  // Initialize word counts
  useEffect(() => {
    setAboutYouWordCount(user.aboutYou.split(' ').filter(word => word.length > 0).length);
    setAboutBusinessWordCount(user.aboutYourBusiness.split(' ').filter(word => word.length > 0).length);
  }, [user.aboutYou, user.aboutYourBusiness]);

  // Single contact enrichment function
  const enrichSingleContact = async (contact: Contact) => {
    setShowLoadingModal(true);
    setLoadingMessage(`Enriching ${contact.name} with additional data...`);

    try {
      const response = await fetch('/api/enrich', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          contacts: [contact], // Single contact array
          userProfile: {
            targetMarket: user.targetMarket,
            referralPartners: user.referralPartners,
            businessType: user.businessType,
            company: user.company
          }
        }),
      });

      if (!response.ok) {
        throw new Error(`Enrichment failed: ${response.statusText}`);
      }

      const result = await response.json();

      if (result.success && result.contacts && result.contacts.length > 0) {
        const enrichedContact = result.contacts[0];
        
        // Update the contact in the contacts array
        const updatedContacts = contacts.map(c => 
          c.id === contact.id ? enrichedContact : c
        );
        setContacts(updatedContacts);
        
        // ✅ CRITICAL: Update the selected contact for the modal
        if (selectedContact && selectedContact.id === contact.id) {
          setSelectedContact(enrichedContact);
        }
        
        setShowLoadingModal(false);
        setShowSuccessModal(true);
        setSuccessMessage(`Successfully enriched ${contact.name} with additional data!`);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('Single contact enrichment error:', error);
      setShowLoadingModal(false);
      alert(`Enrichment failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  // Generate personalized lead magnet for specific contact
  const generatePersonalizedLeadMagnet = async (contact: Contact) => {
    setShowLoadingModal(true);
    setLoadingMessage(`Generating personalized lead magnet for ${contact.name} at ${contact.company}...`);

    try {
      const response = await fetch('/api/personalized-lead-magnet', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contact: contact,
          user: user,
          strategy: strategy.generatedStrategy,
          writingStyle: user.writingStyleAnalyzed ? user.analyzedWritingStyle : 'Professional yet conversational',
          aboutYou: user.aboutYou,
          aboutYourBusiness: user.aboutYourBusiness
        }),
      });

      if (!response.ok) {
        throw new Error(`Personalized lead magnet generation failed: ${response.statusText}`);
      }

      const result = await response.json();
      
      if (result.success && result.leadMagnet) {
        const newLeadMagnet: LeadMagnet = {
          id: Date.now(),
          title: result.leadMagnet.title,
          description: result.leadMagnet.description,
          type: 'personalized',
          created: new Date().toLocaleDateString(),
          downloads: 0,
          content: result.leadMagnet.content
        };
        
        setLeadMagnets(prev => [...prev, newLeadMagnet]);
        
        setShowLoadingModal(false);
        setShowSuccessModal(true);
        setSuccessMessage(`Personalized lead magnet created for ${contact.name}! Check your Lead Magnets page.`);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('Personalized lead magnet generation error:', error);
      setShowLoadingModal(false);
      alert(`Lead magnet generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  // ✅ NEW: Generate direct message for specific contact
  const generateDirectMessage = async (contact: Contact) => {
    if (!strategy.generatedStrategy) {
      alert('Please generate a strategy first to create personalized direct messages.');
      return;
    }

    setShowLoadingModal(true);
    setLoadingMessage(`Generating personalized direct message for ${contact.name}...`);

    try {
      const response = await fetch('/api/generate-direct-message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contact: contact,
          user: user,
          strategy: strategy.generatedStrategy,
          existingLeadMagnets: leadMagnets
        }),
      });

      if (!response.ok) {
        throw new Error(`Direct message generation failed: ${response.statusText}`);
      }

      const result = await response.json();
      
      if (result.success && result.message) {
        // Update the contact with the generated message
        const updatedContacts = contacts.map(c => 
          c.id === contact.id ? { ...c, directMessage: result.message } : c
        );
        setContacts(updatedContacts);
        
        // Update selected contact for modal
        if (selectedContact && selectedContact.id === contact.id) {
          setSelectedContact({ ...selectedContact, directMessage: result.message });
        }
        
        // If a new lead magnet was created, add it to the list
        if (result.leadMagnet) {
          setLeadMagnets(prev => [...prev, result.leadMagnet]);
        }
        
        setShowLoadingModal(false);
        setShowSuccessModal(true);
        setSuccessMessage(`Direct message generated for ${contact.name}! You can now copy and use it.`);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('Direct message generation error:', error);
      setShowLoadingModal(false);
      alert(`Direct message generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  // ✅ NEW: Copy direct message to clipboard
  const copyDirectMessage = (message: string) => {
    navigator.clipboard.writeText(message).then(() => {
      setShowSuccessModal(true);
      setSuccessMessage('Direct message copied to clipboard!');
    }).catch(() => {
      alert('Failed to copy message to clipboard');
    });
  };

  // Writing style analysis function
  const analyzeWritingStyle = async () => {
    if (totalWordCount < 2000) {
      alert('Please write at least 2000 words total for accurate analysis');
      return;
    }

    setShowLoadingModal(true);
    setLoadingMessage('Analyzing your unique writing style...');

    try {
      const response = await fetch('/api/analyze-writing-style', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          aboutYou: user.aboutYou,
          aboutYourBusiness: user.aboutYourBusiness,
          name: user.name,
          businessType: user.businessType
        }),
      });

      if (!response.ok) {
        throw new Error(`Writing style analysis failed: ${response.statusText}`);
      }

      const result = await response.json();
      
      if (result.success && result.analyzedStyle) {
        setUser(prev => ({
          ...prev,
          analyzedWritingStyle: result.analyzedStyle,
          writingStyleAnalyzed: true
        }));
        
        setShowLoadingModal(false);
        setShowSuccessModal(true);
        setSuccessMessage('Your writing style has been analyzed! All future AI content will match your unique voice.');
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('Writing style analysis error:', error);
      setShowLoadingModal(false);
      alert(`Writing style analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  // If not authenticated, show landing/auth
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 flex items-center justify-center p-4">
        <div className="w-full max-w-6xl">
          {authView === 'landing' && (
            <div className="text-center">
              <div className="mb-8">
                <div className="flex items-center justify-center mb-6">
                  <Sparkles className="w-16 h-16 text-yellow-400 mr-4" />
                  <h1 className="text-5xl font-bold text-white">Glass Slipper</h1>
                </div>
                <p className="text-xl text-white text-opacity-80 mb-8 max-w-2xl mx-auto">
                  Transform your LinkedIn contacts into a strategic referral network with AI-powered insights and personalized outreach
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
                  <button
                    onClick={() => setAuthView('login')}
                    className="px-8 py-3 bg-yellow-400 text-purple-900 rounded-lg hover:bg-yellow-500 transition-colors font-semibold"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => setAuthView('register')}
                    className="px-8 py-3 bg-white bg-opacity-10 text-white rounded-lg hover:bg-opacity-20 transition-colors font-semibold border border-white border-opacity-30"
                  >
                    Get Started Free
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
                  <div className="bg-white bg-opacity-10 backdrop-blur rounded-xl p-6">
                    <Shield className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-white mb-2">Smart Enrichment</h3>
                    <p className="text-white text-opacity-70">Automatically enhance your contacts with real business data and intelligent categorization</p>
                  </div>
                  
                  <div className="bg-white bg-opacity-10 backdrop-blur rounded-xl p-6">
                    <Target className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-white mb-2">AI Strategy</h3>
                    <p className="text-white text-opacity-70">Generate personalized referral strategies based on your network and business goals</p>
                  </div>
                  
                  <div className="bg-white bg-opacity-10 backdrop-blur rounded-xl p-6">
                    <Zap className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-white mb-2">Content Generation</h3>
                    <p className="text-white text-opacity-70">Create custom lead magnets and outreach messages that convert</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {authView === 'login' && (
            <div className="max-w-md mx-auto bg-white bg-opacity-10 backdrop-blur rounded-xl p-8">
              <div className="text-center mb-8">
                <Sparkles className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-white mb-2">Welcome Back</h2>
                <p className="text-white text-opacity-60">Sign in to your Glass Slipper account</p>
              </div>

              <form onSubmit={handleLogin} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-white mb-2">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      value={authForm.email}
                      onChange={(e) => setAuthForm(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full pl-10 pr-3 py-2 bg-white bg-opacity-10 border border-white border-opacity-20 rounded-lg text-white placeholder-white placeholder-opacity-40 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                      placeholder="Enter your email"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={authForm.password}
                      onChange={(e) => setAuthForm(prev => ({ ...prev, password: e.target.value }))}
                      className="w-full pl-10 pr-10 py-2 bg-white bg-opacity-10 border border-white border-opacity-20 rounded-lg text-white placeholder-white placeholder-opacity-40 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                      placeholder="Enter your password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-gray-400 hover:text-white"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-yellow-400 text-purple-900 py-2 rounded-lg hover:bg-yellow-500 transition-colors font-semibold"
                >
                  Sign In
                </button>
              </form>

              <div className="text-center mt-6">
                <p className="text-white text-opacity-60 text-sm">
                  Don't have an account?{' '}
                  <button
                    onClick={() => setAuthView('register')}
                    className="text-yellow-400 hover:text-yellow-300"
                  >
                    Sign up here
                  </button>
                </p>
                <br />
                <button
                  onClick={() => setAuthView('landing')}
                  className="text-white text-opacity-60 hover:text-opacity-80 text-sm mt-2"
                >
                  Back to home
                </button>
              </div>
            </div>
          )}

          {authView === 'register' && (
            <div className="max-w-md mx-auto bg-white bg-opacity-10 backdrop-blur rounded-xl p-8">
              <div className="text-center mb-8">
                <Sparkles className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-white mb-2">Get Started</h2>
                <p className="text-white text-opacity-60">Create your Glass Slipper account</p>
              </div>

              <form onSubmit={handleRegister} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-white mb-2">Full Name</label>
                  <input
                    type="text"
                    value={authForm.name}
                    onChange={(e) => setAuthForm(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 bg-white bg-opacity-10 border border-white border-opacity-20 rounded-lg text-white placeholder-white placeholder-opacity-40 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                    placeholder="Enter your full name"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">Email</label>
                  <input
                    type="email"
                    value={authForm.email}
                    onChange={(e) => setAuthForm(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full px-3 py-2 bg-white bg-opacity-10 border border-white border-opacity-20 rounded-lg text-white placeholder-white placeholder-opacity-40 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                    placeholder="Enter your email"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">Company</label>
                  <input
                    type="text"
                    value={authForm.company}
                    onChange={(e) => setAuthForm(prev => ({ ...prev, company: e.target.value }))}
                    className="w-full px-3 py-2 bg-white bg-opacity-10 border border-white border-opacity-20 rounded-lg text-white placeholder-white placeholder-opacity-40 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                    placeholder="Your company name"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">Business Type</label>
                  <input
                    type="text"
                    value={authForm.businessType}
                    onChange={(e) => setAuthForm(prev => ({ ...prev, businessType: e.target.value }))}
                    className="w-full px-3 py-2 bg-white bg-opacity-10 border border-white border-opacity-20 rounded-lg text-white placeholder-white placeholder-opacity-40 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                    placeholder="e.g., Digital Marketing Consultant, B2B SaaS Founder, etc."
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">Password</label>
                  <input
                    type="password"
                    value={authForm.password}
                    onChange={(e) => setAuthForm(prev => ({ ...prev, password: e.target.value }))}
                    className="w-full px-3 py-2 bg-white bg-opacity-10 border border-white border-opacity-20 rounded-lg text-white placeholder-white placeholder-opacity-40 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                    placeholder="Create a password"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">Confirm Password</label>
                  <input
                    type="password"
                    value={authForm.confirmPassword}
                    onChange={(e) => setAuthForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    className="w-full px-3 py-2 bg-white bg-opacity-10 border border-white border-opacity-20 rounded-lg text-white placeholder-white placeholder-opacity-40 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                    placeholder="Confirm your password"
                    required
                  />
                </div>

                <div className="text-center">
                  <button
                    type="submit"
                    className="w-full bg-yellow-400 text-purple-900 py-2 rounded-lg hover:bg-yellow-500 transition-colors font-semibold"
                  >
                    Create Account
                  </button>
                  <p className="text-white text-opacity-60 text-sm mt-4">
                    Already have an account?{' '}
                    <button
                      onClick={() => setAuthView('login')}
                      className="text-yellow-400 hover:text-yellow-300"
                    >
                      Sign in
                    </button>
                  </p>
                  <br />
                  <button
                    onClick={() => setAuthView('landing')}
                    className="text-white text-opacity-60 hover:text-opacity-80 text-sm mt-2"
                  >
                    Back to home
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Main app component
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900">
      {/* Header */}
      <header className="bg-white bg-opacity-10 backdrop-blur border-b border-white border-opacity-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Sparkles className="w-8 h-8 text-yellow-400 mr-3" />
              <h1 className="text-xl font-bold text-white">Glass Slipper</h1>
            </div>
            
            <div className="hidden md:flex items-center space-x-8">
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
                    <Icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* File Input (Hidden) */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          onChange={handleFileUpload}
          className="hidden"
        />

        {/* Dashboard View */}
        {currentView === 'dashboard' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-white">Dashboard</h1>
              <div className="text-sm text-white text-opacity-60">
                Welcome back, {currentUser.name}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white bg-opacity-10 backdrop-blur rounded-xl p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white text-opacity-60 text-sm">Total Contacts</p>
                    <p className="text-2xl font-bold text-white">{contacts.length}</p>
                  </div>
                  <Users className="w-8 h-8 text-yellow-400" />
                </div>
              </div>

              <div className="bg-white bg-opacity-10 backdrop-blur rounded-xl p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white text-opacity-60 text-sm">Enriched</p>
                    <p className="text-2xl font-bold text-white">{contacts.filter(c => c.isEnriched).length}</p>
                  </div>
                  <Shield className="w-8 h-8 text-green-400" />
                </div>
              </div>

              <div className="bg-white bg-opacity-10 backdrop-blur rounded-xl p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white text-opacity-60 text-sm">Lead Magnets</p>
                    <p className="text-2xl font-bold text-white">{leadMagnets.length}</p>
                  </div>
                  <Zap className="w-8 h-8 text-purple-400" />
                </div>
              </div>

              <div className="bg-white bg-opacity-10 backdrop-blur rounded-xl p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white text-opacity-60 text-sm">Completed Tasks</p>
                    <p className="text-2xl font-bold text-white">{tasks.filter(t => t.completed).length}/{tasks.length}</p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-yellow-400" />
                </div>
              </div>
            </div>

            {/* Daily Tasks - CLEANED VERSION (NO INDICATORS) */}
            <div className="bg-white bg-opacity-10 backdrop-blur rounded-xl p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Today's Tasks</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white bg-opacity-5 rounded-lg p-4">
                  <div className="mb-2">
                    <h3 className="font-medium text-white">Send DMs to Ideal Clients</h3>
                  </div>
                  <p className="text-white text-opacity-60 text-sm">Send direct messages to ideal clients and champions in your network</p>
                </div>

                <div className="bg-white bg-opacity-5 rounded-lg p-4">
                  <div className="mb-2">
                    <h3 className="font-medium text-white">Comment on Posts</h3>
                  </div>
                  <p className="text-white text-opacity-60 text-sm">Engage with your contacts' LinkedIn content</p>
                </div>

                <div className="bg-white bg-opacity-5 rounded-lg p-4">
                  <div className="mb-2">
                    <h3 className="font-medium text-white">Post Content</h3>
                  </div>
                  <p className="text-white text-opacity-60 text-sm">Share valuable content on your LinkedIn</p>
                </div>
              </div>
            </div>

            {/* Setup Tasks */}
            <div className="bg-white bg-opacity-10 backdrop-blur rounded-xl p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Setup Tasks</h2>
              <div className="space-y-3">
                {tasks.map((task) => (
                  <div
                    key={task.id}
                    className={`flex items-center justify-between p-4 rounded-lg ${
                      task.completed ? 'bg-green-500 bg-opacity-20' : 'bg-white bg-opacity-5'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                        task.completed ? 'bg-green-500' : 'bg-white bg-opacity-20'
                      }`}>
                        {task.completed && <Check className="w-3 h-3 text-white" />}
                      </div>
                      <span className={`${task.completed ? 'text-white' : 'text-white text-opacity-80'}`}>
                        {task.text}
                      </span>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      task.priority === 'high' ? 'bg-red-100 text-red-800' :
                      task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {task.priority}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white bg-opacity-10 backdrop-blur rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full flex items-center space-x-3 p-3 bg-yellow-400 text-purple-900 rounded-lg hover:bg-yellow-500 transition-colors"
                  >
                    <Upload className="w-5 h-5" />
                    <span>Upload CSV File</span>
                  </button>
                  <button
                    onClick={enrichContacts}
                    disabled={contacts.length === 0}
                    className="w-full flex items-center space-x-3 p-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Shield className="w-5 h-5" />
                    <span>Enrich Contacts</span>
                  </button>
                  <button
                    onClick={() => setCurrentView('strategy')}
                    className="w-full flex items-center space-x-3 p-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    <Target className="w-5 h-5" />
                    <span>Build Strategy</span>
                  </button>
                </div>
              </div>

              <div className="bg-white bg-opacity-10 backdrop-blur rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Recent Activity</h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 p-3 bg-white bg-opacity-5 rounded-lg">
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-white text-sm font-medium">Profile updated</p>
                      <p className="text-white text-opacity-60 text-xs">2 hours ago</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-white bg-opacity-5 rounded-lg">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                      <Users className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-white text-sm font-medium">Contacts imported</p>
                      <p className="text-white text-opacity-60 text-xs">1 day ago</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Contacts View */}
        {currentView === 'contacts' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <h1 className="text-2xl font-bold text-white">Contacts</h1>
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 bg-yellow-400 text-purple-900 rounded-lg hover:bg-yellow-500 transition-colors flex items-center"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Upload CSV
                </button>
                <button
                  onClick={enrichContacts}
                  disabled={contacts.length === 0}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  <Shield className="w-4 h-4 mr-2" />
                  Enrich All
                </button>
                <button
                  onClick={categorizeContacts}
                  disabled={enrichedContactsCount === 0}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  <Target className="w-4 h-4 mr-2" />
                  Categorize by Market
                </button>
              </div>
            </div>

            {/* Search and Filter */}
            <div className="bg-white bg-opacity-10 backdrop-blur rounded-xl p-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Search contacts..."
                      className="w-full pl-10 pr-3 py-2 bg-white bg-opacity-10 border border-white border-opacity-20 rounded-lg text-white placeholder-white placeholder-opacity-40 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                    />
                  </div>
                </div>
                <div className="sm:w-48">
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="w-full px-3 py-2 bg-white bg-opacity-10 border border-white border-opacity-20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                  >
                    <option value="All">All Categories</option>
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Contacts List */}
            <div className="bg-white bg-opacity-10 backdrop-blur rounded-xl overflow-hidden">
              {filteredContacts.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-white bg-opacity-5">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-white text-opacity-60 uppercase tracking-wider">Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-white text-opacity-60 uppercase tracking-wider">Company</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-white text-opacity-60 uppercase tracking-wider">Position</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-white text-opacity-60 uppercase tracking-wider">Category</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-white text-opacity-60 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-white text-opacity-60 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white divide-opacity-10">
                      {filteredContacts.map((contact) => (
                        <tr key={contact.id} className="hover:bg-white hover:bg-opacity-5">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-white">{contact.name}</div>
                            {contact.email && (
                              <div className="text-sm text-white text-opacity-60">{contact.email}</div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-white">{contact.company}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-white">{contact.position}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              contact.category === 'Ideal Client' ? 'bg-green-100 text-green-800' :
                              contact.category === 'Champions' ? 'bg-blue-100 text-blue-800' :
                              contact.category === 'Referral Partners' ? 'bg-purple-100 text-purple-800' :
                              contact.category === 'Competitors' ? 'bg-red-100 text-red-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {contact.category}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              contact.isEnriched ? 
                                'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {contact.isEnriched ? 'Enriched' : 'Basic'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
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
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12">
                  <Users className="w-12 h-12 text-white text-opacity-40 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-white mb-2">No contacts found</h3>
                  <p className="text-white text-opacity-60 mb-6">Upload a CSV file to get started</p>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-2 bg-yellow-400 text-purple-900 rounded-lg hover:bg-yellow-500 transition-colors"
                  >
                    Upload CSV File
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Strategy View */}
        {currentView === 'strategy' && (
          <div className="space-y-6">
            <h1 className="text-2xl font-bold text-white">Referral Strategy</h1>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Strategy Input */}
              <div className="bg-white bg-opacity-10 backdrop-blur rounded-xl p-6 space-y-6">
                <h2 className="text-xl font-semibold text-white">Strategy Builder</h2>
                
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    What is your one core offer?
                  </label>
                  <textarea
                    value={strategy.oneOffer}
                    onChange={(e) => setStrategy(prev => ({ ...prev, oneOffer: e.target.value }))}
                    placeholder="Describe the main service or solution you provide..."
                    className="w-full px-3 py-2 bg-white bg-opacity-10 border border-white border-opacity-20 rounded-lg text-white placeholder-white placeholder-opacity-40 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent backdrop-blur resize-none"
                    rows={3}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    What is your ideal client profile?
                  </label>
                  <textarea
                    value={strategy.idealClientProfile}
                    onChange={(e) => setStrategy(prev => ({ ...prev, idealClientProfile: e.target.value }))}
                    placeholder="Describe your perfect client - company size, industry, decision makers, challenges they face..."
                    className="w-full px-3 py-2 bg-white bg-opacity-10 border border-white border-opacity-20 rounded-lg text-white placeholder-white placeholder-opacity-40 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent backdrop-blur resize-none"
                    rows={3}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    What makes you special?
                  </label>
                  <textarea
                    value={strategy.specialFactors}
                    onChange={(e) => setStrategy(prev => ({ ...prev, specialFactors: e.target.value }))}
                    placeholder="What unique value do you provide..."
                    className="w-full px-3 py-2 bg-white bg-opacity-10 border border-white border-opacity-20 rounded-lg text-white placeholder-white placeholder-opacity-40 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent backdrop-blur resize-none"
                    rows={3}
                  />
                </div>

                <button
                  onClick={generateStrategy}
                  disabled={!strategy.oneOffer || !strategy.idealClientProfile || !strategy.specialFactors}
                  className="w-full px-4 py-2 bg-yellow-400 text-purple-900 rounded-lg hover:bg-yellow-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
                >
                  Generate Strategy
                </button>
              </div>

              {/* Generated Strategy */}
              <div className="bg-white bg-opacity-10 backdrop-blur rounded-xl p-6">
                <h2 className="text-xl font-semibold text-white mb-4">Your Referral Strategy</h2>
                
                {strategy.generatedStrategy ? (
                  <div className="prose prose-invert max-w-none">
                    <div className="text-white text-opacity-80 whitespace-pre-wrap">
                      {strategy.generatedStrategy}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Target className="w-12 h-12 text-white text-opacity-40 mx-auto mb-4" />
                    <p className="text-white text-opacity-60">Fill in the strategy builder to generate your personalised referral strategy</p>
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
              <h1 className="text-2xl font-bold text-white">Lead Magnets</h1>
              <div className="flex space-x-3">
                <button
                  onClick={() => generateLeadMagnet('checklist')}
                  className="px-4 py-2 bg-yellow-400 text-purple-900 rounded-lg hover:bg-yellow-500 transition-colors"
                >
                  Generate Checklist
                </button>
                <button
                  onClick={() => generateLeadMagnet('guide')}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Generate Guide
                </button>
              </div>
            </div>

            {leadMagnets.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {leadMagnets.map((magnet) => (
                  <div key={magnet.id} className="bg-white bg-opacity-10 backdrop-blur rounded-xl p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-white mb-2">{magnet.title}</h3>
                        <p className="text-white text-opacity-60 text-sm mb-4">{magnet.description}</p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        magnet.type === 'checklist' ? 'bg-green-100 text-green-800' :
                        magnet.type === 'guide' ? 'bg-blue-100 text-blue-800' :
                        'bg-purple-100 text-purple-800'
                      }`}>
                        {magnet.type}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between text-white text-opacity-60 text-sm mb-4">
                      <span>Created: {magnet.created}</span>
                      <span>{magnet.downloads} downloads</span>
                    </div>
                    
                    <button
                      onClick={() => {
                        setSelectedLeadMagnet(magnet);
                        setShowLeadMagnetModal(true);
                      }}
                      className="w-full px-4 py-2 bg-white bg-opacity-10 text-white rounded-lg hover:bg-opacity-20 transition-colors"
                    >
                      View Content
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Zap className="w-12 h-12 text-white text-opacity-40 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-white mb-2">No lead magnets yet</h3>
                <p className="text-white text-opacity-60 mb-6">Generate your first lead magnet to get started</p>
                <div className="flex justify-center space-x-3">
                  <button
                    onClick={() => generateLeadMagnet('checklist')}
                    className="px-4 py-2 bg-yellow-400 text-purple-900 rounded-lg hover:bg-yellow-500 transition-colors"
                  >
                    Generate Checklist
                  </button>
                  <button
                    onClick={() => generateLeadMagnet('guide')}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    Generate Guide
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Profile View */}
        {currentView === 'profile' && (
          <div className="space-y-6">
            <h1 className="text-2xl font-bold text-white">Profile</h1>
            
            <div className="bg-white bg-opacity-10 backdrop-blur rounded-xl p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Name</label>
                  <input
                    type="text"
                    value={user.name}
                    onChange={(e) => setUser(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                  <input
                    type="email"
                    value={user.email}
                    onChange={(e) => setUser(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Company</label>
                  <input
                    type="text"
                    value={user.company}
                    onChange={(e) => setUser(prev => ({ ...prev, company: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Business Type</label>
                  <input
                    type="text"
                    value={user.businessType}
                    onChange={(e) => setUser(prev => ({ ...prev, businessType: e.target.value }))}
                    placeholder="Describe your business type"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-300 mb-2">Target Market</label>
                  <textarea
                    value={user.targetMarket}
                    onChange={(e) => setUser(prev => ({ ...prev, targetMarket: e.target.value }))}
                    placeholder="Describe your target market and ideal clients..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                    rows={3}
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-300 mb-2">Referral Partners</label>
                  <textarea
                    value={user.referralPartners}
                    onChange={(e) => setUser(prev => ({ ...prev, referralPartners: e.target.value }))}
                    placeholder="Describe the types of people who could refer business to you..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                    rows={3}
                  />
                </div>
              </div>

              {/* Writing Style Analysis Section */}
              <div className="mt-8 pt-8 border-t border-gray-200">
                <h3 className="text-lg font-semibold text-white mb-4">Writing Style Analysis</h3>
                <p className="text-white text-opacity-70 text-sm mb-6">
                  Help us understand your unique voice by writing about yourself and your business. 
                  We need at least 2000 words total to create an accurate style guide for all AI-generated content.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      About You ({aboutYouWordCount} words)
                    </label>
                    <textarea
                      value={user.aboutYou}
                      onChange={(e) => setUser(prev => ({ ...prev, aboutYou: e.target.value }))}
                      placeholder="Write about your background, experience, personality, values, and what drives you professionally. Share your story, your journey, and what makes you unique. Aim for around 1250 words."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                      rows={12}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      About Your Business ({aboutBusinessWordCount} words)
                    </label>
                    <textarea
                      value={user.aboutYourBusiness}
                      onChange={(e) => setUser(prev => ({ ...prev, aboutYourBusiness: e.target.value }))}
                      placeholder="Describe your business philosophy, approach, methodologies, and what sets you apart. Explain how you work with clients, your beliefs about your industry, and your unique perspective. Aim for around 1250 words."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                      rows={12}
                    />
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <div className="text-sm text-white text-opacity-70">
                    Total words: <span className={totalWordCount >= 2000 ? 'text-green-400' : 'text-yellow-400'}>{totalWordCount}</span>
                    <span className="ml-2">
                      {totalWordCount < 2000 ? `(${2000 - totalWordCount} more needed)` : '✓ Ready for analysis'}
                    </span>
                  </div>
                  
                  <button
                    onClick={analyzeWritingStyle}
                    disabled={totalWordCount < 2000}
                    className="px-4 py-2 bg-yellow-400 text-purple-900 rounded-lg hover:bg-yellow-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
                  >
                    Analyze Writing Style
                  </button>
                </div>

                {user.writingStyleAnalyzed && (
                  <div className="mt-6 p-4 bg-green-500 bg-opacity-20 rounded-lg">
                    <h4 className="text-green-400 font-semibold mb-2">✓ Writing Style Analyzed!</h4>
                    <p className="text-white text-opacity-80 text-sm mb-3">
                      Your unique writing style has been analyzed and will be used for all AI-generated content.
                    </p>
                    <details className="text-white text-opacity-70">
                      <summary className="cursor-pointer font-medium">View Analysis</summary>
                      <div className="mt-2 text-sm whitespace-pre-wrap">{user.analyzedWritingStyle}</div>
                    </details>
                    <button
                      onClick={analyzeWritingStyle}
                      className="mt-3 px-4 py-2 bg-white bg-opacity-10 text-white rounded-lg hover:bg-opacity-20 transition-colors text-sm"
                    >
                      Re-analyze Style
                    </button>
                  </div>
                )}
              </div>

              <div className="flex space-x-3 mt-6">
                <button
                  onClick={() => updateUserSettings(user)}
                  className="flex-1 px-4 py-2 bg-purple-900 text-white rounded-lg hover:bg-purple-800 transition-colors"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ✅ UPDATED: Contact Detail Modal */}
      {showContactModal && selectedContact && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Contact Details</h3>
              <button
                onClick={closeModals}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <p className="text-gray-900">{selectedContact.name}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
                <p className="text-gray-900">{selectedContact.company}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Position</label>
                <p className="text-gray-900">{selectedContact.position}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <p className="text-gray-900">{selectedContact.email}</p>
              </div>

              {selectedContact.isEnriched && (
                <>
                  {selectedContact.phone && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                      <p className="text-gray-900">{selectedContact.phone}</p>
                    </div>
                  )}

                  {selectedContact.website && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
                      <p className="text-gray-900">{selectedContact.website}</p>
                    </div>
                  )}

                  {selectedContact.industry && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Industry</label>
                      <p className="text-gray-900">{selectedContact.industry}</p>
                    </div>
                  )}
                </>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <span className={`px-2 py-1 rounded-full text-xs ${
                  selectedContact.category === 'Ideal Client' ? 'bg-green-100 text-green-800' :
                  selectedContact.category === 'Champions' ? 'bg-blue-100 text-blue-800' :
                  selectedContact.category === 'Referral Partners' ? 'bg-purple-100 text-purple-800' :
                  selectedContact.category === 'Competitors' ? 'bg-red-100 text-red-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {selectedContact.category}
                </span>
                {selectedContact.categoryReason && (
                  <p className="text-xs text-gray-500 mt-1 italic">
                    {selectedContact.categoryReason}
                  </p>
                )}
              </div>

              {/* ✅ NEW: Direct Message Section */}
              {selectedContact.directMessage && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Direct Message</label>
                  <div className="bg-gray-50 rounded-lg p-3 mb-2">
                    <pre className="text-sm text-gray-800 whitespace-pre-wrap font-sans">
                      {selectedContact.directMessage}
                    </pre>
                  </div>
                  <button
                    onClick={() => copyDirectMessage(selectedContact.directMessage!)}
                    className="w-full px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Copy Message
                  </button>
                </div>
              )}
            </div>

            {/* ✅ UPDATED: Contact Actions */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Contact Actions</h4>
              <div className="space-y-3">
                {/* First Row */}
                <div className="flex space-x-3">
                  <button
                    onClick={() => {
                      enrichSingleContact(selectedContact);
                    }}
                    disabled={selectedContact.isEnriched}
                    className="flex-1 px-3 py-2 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    <Shield className="w-4 h-4 mr-2" />
                    {selectedContact.isEnriched ? 'Already Enriched' : 'Enrich Contact'}
                  </button>
                  <button
                    onClick={() => {
                      generatePersonalizedLeadMagnet(selectedContact);
                      closeModals();
                    }}
                    className="flex-1 px-3 py-2 bg-yellow-600 text-white text-sm rounded-lg hover:bg-yellow-700 transition-colors flex items-center justify-center"
                  >
                    <Zap className="w-4 h-4 mr-2" />
                    Generate Lead Magnet
                  </button>
                </div>
                
                {/* ✅ NEW: Second Row - Direct Message Button */}
                <button
                  onClick={() => {
                    generateDirectMessage(selectedContact);
                  }}
                  disabled={!strategy.generatedStrategy}
                  className="w-full px-3 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  <MessageSquare className="w-4 h-4 mr-2" />
                  {selectedContact.directMessage ? 'Regenerate Direct Message' : 'Generate Direct Message'}
                </button>
                
                {strategy.generatedStrategy === '' && (
                  <p className="text-xs text-gray-500 text-center">
                    Generate a strategy first to create direct messages
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Loading Modal */}
      {showLoadingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-sm text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-900 mx-auto mb-4"></div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Processing...</h3>
            <p className="text-gray-600">{loadingMessage}</p>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-sm text-center">
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Success!</h3>
            <p className="text-gray-600 mb-4">{successMessage}</p>
            <button
              onClick={closeModals}
              className="px-4 py-2 bg-purple-900 text-white rounded-lg hover:bg-purple-800 transition-colors"
            >
              Continue
            </button>
          </div>
        </div>
      )}

      {/* Lead Magnet Modal */}
      {showLeadMagnetModal && selectedLeadMagnet && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">{selectedLeadMagnet.title}</h3>
              <button
                onClick={closeModals}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="prose prose-sm max-w-none mb-6">
              <div className="whitespace-pre-wrap text-gray-700">
                {selectedLeadMagnet.content}
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={closeModals}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Close
              </button>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(selectedLeadMagnet.content);
                  alert('Content copied to clipboard!');
                }}
                className="flex-1 px-4 py-2 bg-purple-900 text-white rounded-lg hover:bg-purple-800 transition-colors"
              >
                Copy Content
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GlassSlipperApp;