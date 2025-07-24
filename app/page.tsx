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
    { id: 3, text: 'Enrich contacts with real data', completed: false, priority: 'medium' },
    { id: 4, text: 'Generate referral strategy', completed: false, priority: 'medium' },
    { id: 5, text: 'Create lead magnets', completed: false, priority: 'medium' },
    { id: 6, text: 'Launch first outreach campaign', completed: false, priority: 'low' }
  ]);

  // Sample data state
  const [enrichmentsLeft, setEnrichmentsLeft] = useState<number>(50);

  // Daily tasks state
  const [dailyTasks, setDailyTasks] = useState<DailyTasks>({
    chooseIdealClients: { completed: false, count: 0, total: 5 },
    commentOnPosts: { completed: false, count: 0, total: 3 },
    postContent: { completed: false },
    lastReset: new Date().toDateString()
  });

  // Navigation items
  const navigationItems: NavigationItem[] = [
    { view: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { view: 'contacts', label: 'Contacts', icon: Users },
    { view: 'strategy', label: 'Strategy', icon: Target },
    { view: 'leadmagnets', label: 'Lead Magnets', icon: Zap },
    { view: 'daily', label: 'Daily Tasks', icon: CheckCircle }
  ];

  // STAGE 1 FIX: Enhanced contact parsing with better field validation
  const parseContactsFromCSV = useCallback((csvText: string): Contact[] => {
    console.log('🔍 PARSING: Starting CSV parsing...');
    const lines = csvText.split('\n').filter((line: string) => line.trim());
    if (lines.length === 0) return [];

    const headers = lines[0].split(',').map((h: string) => h.trim().replace(/"/g, ''));
    console.log('🔍 PARSING: Headers found:', headers);
    
    const contacts: Contact[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map((v: string) => v.trim().replace(/"/g, ''));
      
      if (values.length < headers.length) continue;

      // STAGE 1 FIX: More robust field mapping with validation
      const contact: Contact = {
        id: Date.now() + i,
        name: '',
        company: '',
        position: '',
        email: '',
        category: 'Uncategorised'
      };

      // Map CSV fields to contact properties with validation
      headers.forEach((header: string, index: number) => {
        const value = values[index] || '';
        const lowerHeader = header.toLowerCase();

        // Name fields
        if (lowerHeader.includes('first name') || lowerHeader.includes('firstname')) {
          contact.name = value;
        } else if (lowerHeader.includes('last name') || lowerHeader.includes('lastname') || lowerHeader.includes('surname')) {
          contact.name = contact.name ? `${contact.name} ${value}` : value;
        } else if (lowerHeader.includes('full name') || lowerHeader === 'name') {
          contact.name = value;
        }
        
        // Company field - validate it's actually a company name
        else if (lowerHeader.includes('company') || lowerHeader.includes('organisation') || lowerHeader.includes('organization')) {
          // STAGE 1 FIX: Validate company field doesn't contain personal names
          if (value && !this.looksLikePersonalName(value)) {
            contact.company = value;
          }
        }
        
        // Position field - validate it's a job title
        else if (lowerHeader.includes('position') || lowerHeader.includes('title') || lowerHeader.includes('job')) {
          // STAGE 1 FIX: Validate position field contains job title, not company name
          if (value && this.looksLikeJobTitle(value)) {
            contact.position = value;
          }
        }
        
        // Email field
        else if (lowerHeader.includes('email')) {
          if (value && value.includes('@')) {
            contact.email = value;
          }
        }
      });

      // STAGE 1 FIX: Post-processing validation
      if (contact.name && contact.email) {
        // Ensure we have minimum required data
        if (!contact.company) contact.company = 'Not specified';
        if (!contact.position) contact.position = 'Not specified';
        
        contacts.push(contact);
        console.log('✅ PARSING: Valid contact added:', contact.name);
      }
    }

    console.log(`✅ PARSING: Successfully parsed ${contacts.length} contacts`);
    return contacts;
  }, []);

  // STAGE 1 FIX: Helper functions for field validation
  const looksLikePersonalName = (text: string): boolean => {
    const personalNamePatterns = [
      /^[A-Z][a-z]+ [A-Z][a-z]+$/,  // "John Smith" format
      /^[A-Z][a-z]+$/,               // Single name like "Smith"
    ];
    return personalNamePatterns.some(pattern => pattern.test(text.trim()));
  };

  const looksLikeJobTitle = (text: string): boolean => {
    const jobTitleKeywords = [
      'manager', 'director', 'executive', 'analyst', 'consultant', 'advisor',
      'specialist', 'coordinator', 'assistant', 'officer', 'representative',
      'administrator', 'supervisor', 'lead', 'head', 'chief', 'senior',
      'junior', 'associate', 'partner', 'founder', 'owner', 'president'
    ];
    const lowerText = text.toLowerCase();
    return jobTitleKeywords.some(keyword => lowerText.includes(keyword));
  };

  // Handle CSV upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const csvText = e.target?.result as string;
      const parsedContacts = parseContactsFromCSV(csvText);
      setContacts(parsedContacts);
      
      // Mark upload task as complete
      setTasks((prev: Task[]) => prev.map((task: Task) =>
        task.id === 1 ? { ...task, completed: true } : task
      ));

      setSuccessMessage(`Successfully uploaded ${parsedContacts.length} contacts from your CSV file!`);
      setShowSuccessModal(true);
    };

    reader.readAsText(file);
  };

  // Load sample contacts
  const loadSampleContacts = () => {
    const sampleContacts: Contact[] = [
      {
        id: 1,
        name: 'Nick Teige',
        company: 'Franklyn',
        position: 'Wealth Manager',
        email: 'nick.teige@franklyn.co.uk',
        category: 'Uncategorised'
      },
      {
        id: 2,
        name: 'Sarah Johnson',
        company: 'TechCorp Solutions',
        position: 'Marketing Director',
        email: 'sarah.johnson@techcorp.com',
        category: 'Uncategorised'
      },
      {
        id: 3,
        name: 'Michael Chen',
        company: 'Global Consulting',
        position: 'Senior Analyst',
        email: 'michael.chen@globalconsult.com',
        category: 'Uncategorised'
      }
    ];

    setContacts(sampleContacts);
    setTasks(prev => prev.map(task =>
      task.id === 1 ? { ...task, completed: true } : task
    ));
    setSuccessMessage('Sample contacts loaded successfully!');
    setShowSuccessModal(true);
  };

  // STAGE 1 FIX: Enhanced enrichment with improved data validation
  const enrichContacts = async () => {
    if (contacts.length === 0) {
      alert('Please upload contacts first');
      return;
    }

    const contactsToEnrich = contacts.filter((c: Contact) => !c.isEnriched);
    if (contactsToEnrich.length === 0) {
      alert('All contacts are already enriched');
      return;
    }

    if (contactsToEnrich.length > enrichmentsLeft) {
      alert(`You can only enrich ${enrichmentsLeft} more contacts this month`);
      return;
    }

    try {
      setShowLoadingModal(true);
      setLoadingMessage(`Enriching ${contactsToEnrich.length} contacts with real data...`);
      
      console.log('🔄 ENRICHMENT: Starting enrichment process...');
      console.log('🔍 ENRICHMENT: Contacts to enrich:', contactsToEnrich.map(c => ({ 
        name: c.name, 
        company: c.company, 
        position: c.position,
        email: c.email 
      })));

      // STAGE 1 FIX: Pre-enrichment data validation
      const validatedContacts = contactsToEnrich.map((contact: Contact) => {
        // Ensure original data integrity before enrichment
        const validated = {
          ...contact,
          // Preserve original email at all costs
          originalEmail: contact.email,
          // Validate company/position fields aren't swapped
          company: this.looksLikePersonalName(contact.company) ? 'Not specified' : contact.company,
          position: !this.looksLikeJobTitle(contact.position) ? 'Not specified' : contact.position
        };
        
        console.log('🔍 ENRICHMENT: Validated contact data:', {
          name: validated.name,
          company: validated.company,
          position: validated.position,
          emailPreserved: validated.email === validated.originalEmail
        });
        
        return validated;
      });

      const response = await fetch('/api/enrich', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ contacts: validatedContacts }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ ENRICHMENT: API request failed:', errorText);
        throw new Error(`API request failed: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      console.log('✅ ENRICHMENT: API response received:', result);

      if (result.error) {
        console.error('❌ ENRICHMENT: API returned error:', result.error);
        throw new Error(`API error: ${result.error} - ${result.details || 'No additional details'}`);
      }

      if (!result.contacts || !Array.isArray(result.contacts)) {
        console.error('❌ ENRICHMENT: Invalid API response format:', result);
        throw new Error('Invalid API response: missing contacts array');
      }

      console.log('🔍 ENRICHMENT: Processing enriched contacts...');
      
      // STAGE 1 FIX: Enhanced data integrity protection during state update
      const updatedContacts = contacts.map((contact: Contact) => {
        const enrichedData = result.contacts.find((ec: Contact) => ec.id === contact.id);
        if (enrichedData) {
          console.log(`🔍 ENRICHMENT: Processing enriched data for ${contact.name}:`, enrichedData);
          
          // STAGE 1 FIX: Rigorous field validation before applying enriched data
          const updatedContact = {
            ...contact,
            isEnriched: true,
            // CRITICAL: Always preserve original email
            email: contact.email,
            // Validate enriched fields make sense
            lastName: enrichedData.lastName || undefined,
            phone: enrichedData.phone || 'Not found',
            website: enrichedData.website || 'Not found',
            industry: enrichedData.industry || 'Not found',
            // STAGE 1 FIX: Only update company/position if enriched data is logically valid
            company: this.validateEnrichedCompany(enrichedData.company, contact.company),
            position: this.validateEnrichedPosition(enrichedData.position, contact.position)
          };

          // STAGE 1 FIX: Final validation check
          if (updatedContact.email !== contact.email) {
            console.error(`🚨 CRITICAL: Email mismatch detected for ${contact.name}!`);
            console.error(`Original: ${contact.email}, Updated: ${updatedContact.email}`);
            updatedContact.email = contact.email; // Force restore original email
          }

          // STAGE 1 FIX: Validate that enriched company isn't a personal name
          if (this.looksLikePersonalName(updatedContact.company)) {
            console.warn(`⚠️ WARNING: Company field contains personal name for ${contact.name}, preserving original`);
            updatedContact.company = contact.company;
          }

          // STAGE 1 FIX: Validate that enriched position is actually a job title
          if (updatedContact.position && !this.looksLikeJobTitle(updatedContact.position) && this.looksLikePersonalName(updatedContact.position)) {
            console.warn(`⚠️ WARNING: Position field contains company name for ${contact.name}, preserving original`);
            updatedContact.position = contact.position;
          }

          console.log(`✅ Successfully validated enriched data for ${contact.name}:`, {
            company: updatedContact.company,
            position: updatedContact.position,
            email: updatedContact.email,
            industry: updatedContact.industry
          });
          
          return updatedContact;
        }
        return contact;
      });

      console.log('🔄 Updated contacts with enrichment data:', updatedContacts);
      
      // STAGE 1 FIX: Final data integrity verification
      const originalEmails = contacts.map((c: Contact) => c.email);
      const updatedEmails = updatedContacts.map((c: Contact) => c.email);
      const emailsChanged = originalEmails.some((email: string, index: number) => email !== updatedEmails[index]);
      
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
      setTasks((prev: Task[]) => prev.map((task: Task) =>
        task.id === 3 ? { ...task, completed: true } : task
      ));
      
      setEnrichmentsLeft(prev => prev - contactsToEnrich.length);
      setShowLoadingModal(false);
      setSuccessMessage(`Successfully enriched ${contactsToEnrich.length} contacts with improved data validation! All original contact information has been preserved.`);
      setShowSuccessModal(true);

    } catch (error) {
      console.error('💥 Error occurred:', error);
      setShowLoadingModal(false);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      alert(`Enrichment failed: ${errorMessage}. Please check the console for more details.`);
    }
  };

  // STAGE 1 FIX: Helper functions for enriched data validation
  const validateEnrichedCompany = (enrichedCompany: string, originalCompany: string): string => {
    // If enriched company looks like a personal name, keep original
    if (enrichedCompany && this.looksLikePersonalName(enrichedCompany)) {
      console.warn(`⚠️ Enriched company "${enrichedCompany}" looks like personal name, keeping original: "${originalCompany}"`);
      return originalCompany;
    }
    // If enriched company is valid, use it; otherwise keep original
    return enrichedCompany && enrichedCompany !== 'Not found' ? enrichedCompany : originalCompany;
  };

  const validateEnrichedPosition = (enrichedPosition: string, originalPosition: string): string => {
    // If enriched position looks like a company name, keep original
    if (enrichedPosition && !this.looksLikeJobTitle(enrichedPosition) && enrichedPosition.length > 3) {
      console.warn(`⚠️ Enriched position "${enrichedPosition}" doesn't look like job title, keeping original: "${originalPosition}"`);
      return originalPosition;
    }
    // If enriched position is valid, use it; otherwise keep original
    return enrichedPosition && enrichedPosition !== 'Not found' ? enrichedPosition : originalPosition;
  };

  // Delete contact
  const deleteContact = (contactId: number) => {
    setContacts((prev: Contact[]) => prev.filter((c: Contact) => c.id !== contactId));
    setShowContactModal(false);
    setSelectedContact(null);
  };

  // Update contact category
  const updateCategory = (contactId: number, category: string) => {
    setContacts((prev: Contact[]) => prev.map((contact: Contact) =>
      contact.id === contactId ? { ...contact, category } : contact
    ));
    setSelectedContact(prev => prev ? { ...prev, category } : null);
  };

  // Generate strategy
  const generateStrategy = async () => {
    if (!strategy.oneOffer || !strategy.idealReferralPartners || !strategy.specialFactors) {
      alert('Please fill in all strategy fields first');
      return;
    }

    setShowLoadingModal(true);
    setLoadingMessage('Generating your personalised referral strategy...');

    // Simulate API call
    setTimeout(() => {
      const generatedContent = `Based on your input, here's your personalised referral strategy:

**Core Offer Focus:** ${strategy.oneOffer}

**Target Referral Partners:** ${strategy.idealReferralPartners}

**Key Differentiators:** ${strategy.specialFactors}

**Recommended Approach:**
1. **Partner Identification**: Focus on building relationships with ${strategy.idealReferralPartners} who serve similar clientele but offer complementary services.

2. **Value Proposition**: Lead with "${strategy.oneOffer}" as your primary offering, emphasising the unique value of ${strategy.specialFactors}.

3. **Referral Process**: Create a systematic approach to nurture these partnerships through regular check-ins, shared resources, and mutual referrals.

4. **Success Metrics**: Track referral sources, conversion rates, and partner satisfaction to optimise your approach.

This strategy aligns with current best practices in professional services referral marketing and should help you build a sustainable pipeline of quality leads.`;

      setStrategy(prev => ({ ...prev, generatedStrategy: generatedContent }));
      setShowLoadingModal(false);
      setTasks((prev: Task[]) => prev.map((task: Task) =>
        task.id === 4 ? { ...task, completed: true } : task
      ));
      setSuccessMessage('Strategy generated successfully!');
      setShowSuccessModal(true);
    }, 3000);
  };

  // Create lead magnet
  const createLeadMagnet = (type: string) => {
    const newLeadMagnet: LeadMagnet = {
      id: Date.now(),
      title: `${type} for ${user.targetMarket}`,
      description: `A valuable ${type.toLowerCase()} designed to attract and engage your target market in ${user.targetMarket}.`,
      type: type,
      created: new Date().toLocaleDateString(),
      downloads: 0,
      content: `This ${type.toLowerCase()} covers key insights relevant to ${user.targetMarket}, incorporating your ${user.writingStyle} style and business expertise in ${user.businessType}.`
    };

    setLeadMagnets(prev => [...prev, newLeadMagnet]);
    setTasks((prev: Task[]) => prev.map((task: Task) =>
      task.id === 5 ? { ...task, completed: true } : task
    ));
    setSuccessMessage(`${type} created successfully!`);
    setShowSuccessModal(true);
  };

  // Download lead magnet
  const downloadLeadMagnet = (leadMagnetId: number) => {
    setLeadMagnets((prev: LeadMagnet[]) => prev.map((lm: LeadMagnet) =>
      lm.id === leadMagnetId ? { ...lm, downloads: lm.downloads + 1 } : lm
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
      setTasks((prev: Task[]) => prev.map((task: Task) =>
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
      setTasks((prev: Task[]) => prev.map((task: Task) =>
        task.id === 2 ? { ...task, completed: true } : task
      ));
    }, 1500);
  };

  // Reset daily tasks at midnight
  useEffect(() => {
    const today = new Date().toDateString();
    if (dailyTasks.lastReset !== today) {
      setDailyTasks({
        chooseIdealClients: { completed: false, count: 0, total: 5 },
        commentOnPosts: { completed: false, count: 0, total: 3 },
        postContent: { completed: false },
        lastReset: today
      });
    }
  }, [dailyTasks.lastReset]);

  // Update daily task
  const updateDailyTask = (taskKey: keyof Omit<DailyTasks, 'lastReset'>, increment = false) => {
    setDailyTasks(prev => {
      const task = prev[taskKey];
      let newCount = task.count || 0;
      let newCompleted = task.completed;

      if (increment && 'total' in task && task.total) {
        newCount = Math.min(newCount + 1, task.total);
        newCompleted = newCount >= task.total;
      } else {
        newCompleted = !task.completed;
      }

      return {
        ...prev,
        [taskKey]: {
          ...task,
          count: newCount,
          completed: newCompleted
        }
      };
    });
  };

  // Handle authentication view
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full space-y-8">
          {authView === 'landing' && (
            <div className="text-center space-y-8">
              <div className="space-y-4">
                <div className="w-16 h-16 bg-yellow-400 rounded-full flex items-center justify-center mx-auto">
                  <Sparkles className="w-8 h-8 text-purple-900" />
                </div>
                <h1 className="text-4xl font-bold text-white">Glass Slipper</h1>
                <p className="text-xl text-white text-opacity-80">Transform Your Professional Network Into Referral Gold</p>
              </div>

              <div className="bg-white bg-opacity-10 backdrop-blur rounded-xl p-6 space-y-4">
                <div className="flex items-center space-x-3 text-white">
                  <Shield className="w-5 h-5 text-yellow-400" />
                  <span>AI-powered contact enrichment</span>
                </div>
                <div className="flex items-center space-x-3 text-white">
                  <Target className="w-5 h-5 text-yellow-400" />
                  <span>Personalised referral strategies</span>
                </div>
                <div className="flex items-center space-x-3 text-white">
                  <Users className="w-5 h-5 text-yellow-400" />
                  <span>Automated relationship management</span>
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
                  {authView === 'login' ? 
                    'Sign in to continue building your referral network' : 
                    'Create your account to unlock the power of professional networking'
                  }
                </p>
              </div>

              <div className="space-y-4">
                {authView === 'register' && (
                  <>
                    <div>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white text-opacity-60 w-4 h-4" />
                        <input
                          type="text"
                          placeholder="Full Name"
                          value={authForm.name}
                          onChange={(e) => setAuthForm(prev => ({ ...prev, name: e.target.value }))}
                          className="w-full pl-10 pr-4 py-3 bg-white bg-opacity-20 border border-white border-opacity-30 rounded-lg text-white placeholder-white placeholder-opacity-60 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                        />
                      </div>
                    </div>
                    <div>
                      <div className="relative">
                        <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white text-opacity-60 w-4 h-4" />
                        <input
                          type="text"
                          placeholder="Company Name"
                          value={authForm.company}
                          onChange={(e) => setAuthForm(prev => ({ ...prev, company: e.target.value }))}
                          className="w-full pl-10 pr-4 py-3 bg-white bg-opacity-20 border border-white border-opacity-30 rounded-lg text-white placeholder-white placeholder-opacity-60 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                        />
                      </div>
                    </div>
                  </>
                )}

                <div>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white text-opacity-60 w-4 h-4" />
                    <input
                      type="email"
                      placeholder="Email Address"
                      value={authForm.email}
                      onChange={(e) => setAuthForm(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full pl-10 pr-4 py-3 bg-white bg-opacity-20 border border-white border-opacity-30 rounded-lg text-white placeholder-white placeholder-opacity-60 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white text-opacity-60 w-4 h-4" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Password"
                      value={authForm.password}
                      onChange={(e) => setAuthForm(prev => ({ ...prev, password: e.target.value }))}
                      className="w-full pl-10 pr-10 py-3 bg-white bg-opacity-20 border border-white border-opacity-30 rounded-lg text-white placeholder-white placeholder-opacity-60 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white text-opacity-60 hover:text-white transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {authView === 'register' && (
                  <div>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white text-opacity-60 w-4 h-4" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Confirm Password"
                        value={authForm.confirmPassword}
                        onChange={(e) => setAuthForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                        className="w-full pl-10 pr-4 py-3 bg-white bg-opacity-20 border border-white border-opacity-30 rounded-lg text-white placeholder-white placeholder-opacity-60 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                      />
                    </div>
                  </div>
                )}
              </div>

              <button
                onClick={handleAuth}
                disabled={!validateAuthForm()}
                className="w-full px-6 py-3 bg-yellow-400 text-purple-900 rounded-lg hover:bg-yellow-500 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
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
              {navigationItems.map((item: NavigationItem) => {
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
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>

            {/* Mobile Menu & User Actions */}
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowSettingsModal(true)}
                className="text-white hover:text-yellow-400 transition-colors"
              >
                <Settings className="w-5 h-5" />
              </button>
              
              <button
                onClick={handleLogout}
                className="text-white hover:text-yellow-400 transition-colors"
              >
                <LogOut className="w-5 h-5" />
              </button>

              <button
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="md:hidden text-white hover:text-yellow-400 transition-colors"
              >
                <Menu className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {showMobileMenu && (
            <div className="md:hidden py-4 space-y-2">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.view}
                    onClick={() => {
                      setCurrentView(item.view);
                      setShowMobileMenu(false);
                    }}
                    className={`w-full flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                      currentView === item.view
                        ? 'bg-yellow-400 text-purple-900'
                        : 'text-white hover:bg-white hover:bg-opacity-10'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Dashboard View */}
        {currentView === 'dashboard' && (
          <div className="space-y-8">
            {/* Welcome Section */}
            <div className="bg-white bg-opacity-10 backdrop-blur rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-white mb-2">Welcome back, {user.name}!</h1>
                  <p className="text-white text-opacity-70">Let's continue building your referral network</p>
                </div>
                <div className="text-right">
                  <div className="text-sm text-white text-opacity-60">Enrichments Remaining</div>
                  <div className="text-2xl font-bold text-yellow-400">{enrichmentsLeft}</div>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white bg-opacity-10 backdrop-blur rounded-xl p-6">
                <div className="flex items-center space-x-3">
                  <Users className="w-8 h-8 text-yellow-400" />
                  <div>
                    <div className="text-2xl font-bold text-white">{contacts.length}</div>
                    <div className="text-sm text-white text-opacity-60">Total Contacts</div>
                  </div>
                </div>
              </div>

              <div className="bg-white bg-opacity-10 backdrop-blur rounded-xl p-6">
                <div className="flex items-center space-x-3">
                  <UserCheck className="w-8 h-8 text-green-400" />
                  <div>
                    <div className="text-2xl font-bold text-white">{contacts.filter(c => c.isEnriched).length}</div>
                    <div className="text-sm text-white text-opacity-60">Enriched Contacts</div>
                  </div>
                </div>
              </div>

              <div className="bg-white bg-opacity-10 backdrop-blur rounded-xl p-6">
                <div className="flex items-center space-x-3">
                  <Target className="w-8 h-8 text-blue-400" />
                  <div>
                    <div className="text-2xl font-bold text-white">{leadMagnets.length}</div>
                    <div className="text-sm text-white text-opacity-60">Lead Magnets</div>
                  </div>
                </div>
              </div>

              <div className="bg-white bg-opacity-10 backdrop-blur rounded-xl p-6">
                <div className="flex items-center space-x-3">
                  <TrendingUp className="w-8 h-8 text-purple-400" />
                  <div>
                    <div className="text-2xl font-bold text-white">{tasks.filter(t => t.completed).length}/{tasks.length}</div>
                    <div className="text-sm text-white text-opacity-60">Tasks Complete</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Items */}
            <div className="bg-white bg-opacity-10 backdrop-blur rounded-xl p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Getting Started</h2>
              <div className="space-y-3">
                {tasks.map((task: Task) => (
                  <div key={task.id} className="flex items-center justify-between p-3 bg-white bg-opacity-5 rounded-lg">
                    <div className="flex items-center space-x-3">
                      {task.completed ? (
                        <CheckCircle className="w-5 h-5 text-green-400" />
                      ) : (
                        <div className={`w-5 h-5 rounded-full border-2 ${
                          task.priority === 'high' ? 'border-red-400' :
                          task.priority === 'medium' ? 'border-yellow-400' : 'border-gray-400'
                        }`} />
                      )}
                      <span className={`${task.completed ? 'text-white text-opacity-60 line-through' : 'text-white'}`}>
                        {task.text}
                      </span>
                    </div>
                    <div className={`px-2 py-1 rounded text-xs ${
                      task.priority === 'high' ? 'bg-red-500 text-white' :
                      task.priority === 'medium' ? 'bg-yellow-500 text-white' : 'bg-gray-500 text-white'
                    }`}>
                      {task.priority}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Contacts View */}
        {currentView === 'contacts' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
              <h1 className="text-2xl font-bold text-white">Contact Management</h1>
              <div className="flex space-x-3">
                <button
                  onClick={loadSampleContacts}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Load Sample Data
                </button>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 bg-yellow-400 text-purple-900 rounded-lg hover:bg-yellow-500 transition-colors flex items-center space-x-2"
                >
                  <Upload className="w-4 h-4" />
                  <span>Upload CSV</span>
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>
            </div>

            {/* Filters and Search */}
            <div className="bg-white bg-opacity-10 backdrop-blur rounded-xl p-6">
              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white text-opacity-60 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Search contacts..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 bg-white bg-opacity-20 border border-white border-opacity-30 rounded-lg text-white placeholder-white placeholder-opacity-60 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                    />
                  </div>
                </div>
                <div className="sm:w-48">
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="w-full px-3 py-2 bg-white bg-opacity-20 border border-white border-opacity-30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                  >
                    <option value="All">All Categories</option>
                    {categories.map((category: string) => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>
                <button
                  onClick={enrichContacts}
                  disabled={contacts.filter(c => !c.isEnriched).length === 0}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
                >
                  <Zap className="w-4 h-4" />
                  <span>Enrich All ({contacts.filter(c => !c.isEnriched).length})</span>
                </button>
              </div>
            </div>

            {/* Contacts Table */}
            <div className="bg-white bg-opacity-10 backdrop-blur rounded-xl overflow-hidden">
              {filteredContacts.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-white bg-opacity-5">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-white text-opacity-60 uppercase tracking-wider">Contact</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-white text-opacity-60 uppercase tracking-wider">Company</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-white text-opacity-60 uppercase tracking-wider">Position</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-white text-opacity-60 uppercase tracking-wider">Industry</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-white text-opacity-60 uppercase tracking-wider">Category</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-white text-opacity-60 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-white text-opacity-60 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white divide-opacity-10">
                      {filteredContacts.map((contact: Contact) => (
                        <tr key={contact.id} className="hover:bg-white hover:bg-opacity-5">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center">
                                <span className="text-sm font-medium text-purple-900">
                                  {contact.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                                </span>
                              </div>
                              <div className="ml-3">
                                <div className="text-sm font-medium text-white">{contact.name}</div>
                                <div className="text-sm text-white text-opacity-60">{contact.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-white">{contact.company}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-white">{contact.position || 'Not specified'}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-white">{contact.industry || 'Not found'}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              contact.category === 'Ideal Client' ? 'bg-green-100 text-green-800' :
                              contact.category === 'Champions' ? 'bg-blue-100 text-blue-800' :
                              contact.category === 'Referral Partners' ? 'bg-purple-100 text-purple-800' :
                              contact.category === 'Competitors' ? 'bg-red-100 text-red-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {contact.category || 'Uncategorised'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              contact.isEnriched ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
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
                  <p className="text-white text-opacity-60 mb-6">Upload a CSV file or load sample data to get started</p>
                  <div className="space-x-3">
                    <button
                      onClick={loadSampleContacts}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      Load Sample Data
                    </button>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="px-4 py-2 bg-yellow-400 text-purple-900 rounded-lg hover:bg-yellow-500 transition-colors"
                    >
                      Upload CSV File
                    </button>
                  </div>
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
                    placeholder="e.g., Help small businesses increase revenue by 25%"
                    className="w-full px-3 py-2 bg-white bg-opacity-20 border border-white border-opacity-30 rounded-lg text-white placeholder-white placeholder-opacity-60 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                    rows={3}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Who are your ideal referral partners?
                  </label>
                  <textarea
                    value={strategy.idealReferralPartners}
                    onChange={(e) => setStrategy(prev => ({ ...prev, idealReferralPartners: e.target.value }))}
                    placeholder="e.g., Accountants, business coaches, HR consultants"
                    className="w-full px-3 py-2 bg-white bg-opacity-20 border border-white border-opacity-30 rounded-lg text-white placeholder-white placeholder-opacity-60 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                    rows={3}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    What makes you different?
                  </label>
                  <textarea
                    value={strategy.specialFactors}
                    onChange={(e) => setStrategy(prev => ({ ...prev, specialFactors: e.target.value }))}
                    placeholder="e.g., 15 years experience, specialised in tech startups"
                    className="w-full px-3 py-2 bg-white bg-opacity-20 border border-white border-opacity-30 rounded-lg text-white placeholder-white placeholder-opacity-60 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                    rows={3}
                  />
                </div>

                <button
                  onClick={generateStrategy}
                  disabled={!strategy.oneOffer || !strategy.idealReferralPartners || !strategy.specialFactors}
                  className="w-full px-4 py-3 bg-yellow-400 text-purple-900 rounded-lg hover:bg-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold flex items-center justify-center space-x-2"
                >
                  <Target className="w-4 h-4" />
                  <span>Generate Strategy</span>
                </button>
              </div>

              {/* Generated Strategy */}
              <div className="bg-white bg-opacity-10 backdrop-blur rounded-xl p-6">
                <h2 className="text-xl font-semibold text-white mb-4">Your Personalised Strategy</h2>
                {strategy.generatedStrategy ? (
                  <div className="prose prose-invert max-w-none">
                    <div className="whitespace-pre-wrap text-white text-opacity-90 text-sm leading-relaxed">
                      {strategy.generatedStrategy}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Target className="w-12 h-12 text-white text-opacity-40 mx-auto mb-4" />
                    <p className="text-white text-opacity-60">
                      Fill in the strategy builder to generate your personalised referral strategy
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Lead Magnets View */}
        {currentView === 'leadmagnets' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-white">Lead Magnets</h1>
              <div className="flex space-x-2">
                {['Guide', 'Checklist', 'Template', 'Webinar'].map(type => (
                  <button
                    key={type}
                    onClick={() => createLeadMagnet(type)}
                    className="px-3 py-2 bg-yellow-400 text-purple-900 rounded-lg hover:bg-yellow-500 transition-colors text-sm font-medium"
                  >
                    + {type}
                  </button>
                ))}
              </div>
            </div>

            {leadMagnets.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {leadMagnets.map((magnet: LeadMagnet) => (
                  <div key={magnet.id} className="bg-white bg-opacity-10 backdrop-blur rounded-xl p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="font-semibold text-white mb-2">{magnet.title}</h3>
                        <p className="text-sm text-white text-opacity-70 mb-3">{magnet.description}</p>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => {
                            setSelectedLeadMagnet(magnet);
                            setShowLeadMagnetModal(true);
                          }}
                          className="text-white text-opacity-60 hover:text-white transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button className="text-white text-opacity-60 hover:text-red-400 transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm text-white text-opacity-60 mb-4">
                      <span>{magnet.type}</span>
                      <span>{magnet.created}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2 text-sm text-white text-opacity-60">
                        <Download className="w-4 h-4" />
                        <span>{magnet.downloads} downloads</span>
                      </div>
                      <button
                        onClick={() => downloadLeadMagnet(magnet.id)}
                        className="px-3 py-1 bg-yellow-400 text-purple-900 rounded text-sm hover:bg-yellow-500 transition-colors"
                      >
                        Download
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white bg-opacity-10 backdrop-blur rounded-xl p-12 text-center">
                <Zap className="w-12 h-12 text-white text-opacity-40 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-white mb-2">Create Your First Lead Magnet</h3>
                <p className="text-white text-opacity-60 mb-6">
                  Lead magnets help you capture prospects and demonstrate your expertise
                </p>
                <div className="flex justify-center space-x-2">
                  {['Guide', 'Checklist', 'Template', 'Webinar'].map(type => (
                    <button
                      key={type}
                      onClick={() => createLeadMagnet(type)}
                      className="px-4 py-2 bg-yellow-400 text-purple-900 rounded-lg hover:bg-yellow-500 transition-colors font-medium"
                    >
                      Create {type}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Daily Tasks View */}
        {currentView === 'daily' && (
          <div className="space-y-6">
            <h1 className="text-2xl font-bold text-white">Daily Relationship Building</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Choose Ideal Clients */}
              <div className="bg-white bg-opacity-10 backdrop-blur rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-white">Choose Ideal Clients</h3>
                  {dailyTasks.chooseIdealClients.completed ? (
                    <CheckCircle className="w-6 h-6 text-green-400" />
                  ) : (
                    <div className="w-6 h-6 rounded-full border-2 border-yellow-400" />
                  )}
                </div>
                
                <p className="text-sm text-white text-opacity-70 mb-4">
                  Identify and categorise 5 contacts as ideal clients
                </p>
                
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm text-white text-opacity-60">Progress</span>
                  <span className="text-sm font-medium text-white">
                    {dailyTasks.chooseIdealClients.count}/{dailyTasks.chooseIdealClients.total}
                  </span>
                </div>
                
                <div className="w-full bg-white bg-opacity-20 rounded-full h-2 mb-4">
                  <div 
                    className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
                    style={{ 
                      width: `${(dailyTasks.chooseIdealClients.count! / dailyTasks.chooseIdealClients.total!) * 100}%` 
                    }}
                  />
                </div>
                
                <button
                  onClick={() => updateDailyTask('chooseIdealClients', true)}
                  disabled={dailyTasks.chooseIdealClients.completed}
                  className="w-full px-3 py-2 bg-yellow-400 text-purple-900 rounded-lg hover:bg-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
                >
                  {dailyTasks.chooseIdealClients.completed ? 'Completed' : 'Mark as Done'}
                </button>
              </div>

              {/* Comment on Posts */}
              <div className="bg-white bg-opacity-10 backdrop-blur rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-white">Engage on LinkedIn</h3>
                  {dailyTasks.commentOnPosts.completed ? (
                    <CheckCircle className="w-6 h-6 text-green-400" />
                  ) : (
                    <div className="w-6 h-6 rounded-full border-2 border-blue-400" />
                  )}
                </div>
                
                <p className="text-sm text-white text-opacity-70 mb-4">
                  Comment meaningfully on 3 posts from potential partners
                </p>
                
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm text-white text-opacity-60">Progress</span>
                  <span className="text-sm font-medium text-white">
                    {dailyTasks.commentOnPosts.count}/{dailyTasks.commentOnPosts.total}
                  </span>
                </div>
                
                <div className="w-full bg-white bg-opacity-20 rounded-full h-2 mb-4">
                  <div 
                    className="bg-blue-400 h-2 rounded-full transition-all duration-300"
                    style={{ 
                      width: `${(dailyTasks.commentOnPosts.count! / dailyTasks.commentOnPosts.total!) * 100}%` 
                    }}
                  />
                </div>
                
                <button
                  onClick={() => updateDailyTask('commentOnPosts', true)}
                  disabled={dailyTasks.commentOnPosts.completed}
                  className="w-full px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
                >
                  {dailyTasks.commentOnPosts.completed ? 'Completed' : 'Mark as Done'}
                </button>
              </div>

              {/* Share Content */}
              <div className="bg-white bg-opacity-10 backdrop-blur rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-white">Share Content</h3>
                  {dailyTasks.postContent.completed ? (
                    <CheckCircle className="w-6 h-6 text-green-400" />
                  ) : (
                    <div className="w-6 h-6 rounded-full border-2 border-purple-400" />
                  )}
                </div>
                
                <p className="text-sm text-white text-opacity-70 mb-6">
                  Share one valuable post to build your professional brand
                </p>
                
                <button
                  onClick={() => updateDailyTask('postContent')}
                  className={`w-full px-3 py-2 rounded-lg transition-colors text-sm font-medium ${
                    dailyTasks.postContent.completed
                      ? 'bg-green-500 text-white'
                      : 'bg-purple-500 text-white hover:bg-purple-600'
                  }`}
                >
                  {dailyTasks.postContent.completed ? 'Completed ✓' : 'Mark as Done'}
                </button>
              </div>
            </div>

            {/* Daily Progress */}
            <div className="bg-white bg-opacity-10 backdrop-blur rounded-xl p-6">
              <h3 className="font-semibold text-white mb-4">Today's Progress</h3>
              <div className="flex items-center space-x-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-400">
                    {Object.values(dailyTasks).filter((task: DailyTask) => task.completed && typeof task.completed === 'boolean').length}
                  </div>
                  <div className="text-sm text-white text-opacity-60">Tasks Complete</div>
                </div>
                <div className="flex-1">
                  <div className="w-full bg-white bg-opacity-20 rounded-full h-3">
                    <div 
                      className="bg-gradient-to-r from-yellow-400 to-purple-500 h-3 rounded-full transition-all duration-300"
                      style={{ 
                        width: `${(Object.values(dailyTasks).filter((task: DailyTask) => task.completed && typeof task.completed === 'boolean').length / 3) * 100}%` 
                      }}
                    />
                  </div>
                </div>
                <div className="text-sm text-white text-opacity-60">
                  Keep building those relationships!
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Contact Details Modal */}
      {showContactModal && selectedContact && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-purple-900 rounded-xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-white">Contact Details</h2>
              <button
                onClick={closeModals}
                className="text-white text-opacity-60 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center">
                  <span className="text-lg font-semibold text-purple-900">
                    {selectedContact.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </span>
                </div>
                <div>
                  <h3 className="font-semibold text-white">{selectedContact.name}</h3>
                  <p className="text-sm text-white text-opacity-60">
                    {selectedContact.company}
                  </p>
                  <p className="text-sm text-white text-opacity-60">Industry: {selectedContact.industry || 'Not found'}</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center space-x-3 text-white">
                  <Mail className="w-4 h-4 text-yellow-400" />
                  <span>{selectedContact.position || 'Wealth Manager'}</span>
                </div>
                
                {selectedContact.phone && selectedContact.phone !== 'Not found' && (
                  <div className="flex items-center space-x-3 text-white">
                    <Phone className="w-4 h-4 text-yellow-400" />
                    <span>{selectedContact.phone}</span>
                  </div>
                )}

                {selectedContact.website && selectedContact.website !== 'Not found' && (
                  <div className="flex items-center space-x-3 text-white">
                    <Globe className="w-4 h-4 text-yellow-400" />
                    <a 
                      href={selectedContact.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-yellow-400 hover:text-yellow-300 transition-colors"
                    >
                      {selectedContact.website}
                    </a>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">Category</label>
                <select
                  value={selectedContact.category || 'Uncategorised'}
                  onChange={(e) => updateCategory(selectedContact.id, e.target.value)}
                  className="w-full px-3 py-2 bg-white bg-opacity-20 border border-white border-opacity-30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                >
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => deleteContact(selectedContact.id)}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
              <button
                onClick={closeModals}
                className="flex-1 px-4 py-2 bg-yellow-400 text-purple-900 rounded-lg hover:bg-yellow-500 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Loading Modal */}
      {showLoadingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-8 max-w-sm w-full text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-900 mx-auto mb-4"></div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Processing...</h3>
            <p className="text-gray-600">{loadingMessage}</p>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-8 max-w-sm w-full text-center">
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Success!</h3>
            <p className="text-gray-600 mb-6">{successMessage}</p>
            <button
              onClick={closeModals}
              className="w-full px-4 py-2 bg-purple-900 text-white rounded-lg hover:bg-purple-800 transition-colors"
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
              <h2 className="text-xl font-semibold text-gray-900">{selectedLeadMagnet.title}</h2>
              <button
                onClick={closeModals}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="prose max-w-none">
              <div className="whitespace-pre-wrap text-gray-700">
                {selectedLeadMagnet.content}
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => downloadLeadMagnet(selectedLeadMagnet.id)}
                className="flex-1 px-4 py-2 bg-purple-900 text-white rounded-lg hover:bg-purple-800 transition-colors flex items-center justify-center space-x-2"
              >
                <Download className="w-4 h-4" />
                <span>Download</span>
              </button>
              <button
                onClick={closeModals}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
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
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Business Settings</h2>
              <button
                onClick={closeModals}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Business Type</label>
                <input
                  type="text"
                  value={user.businessType}
                  onChange={(e) => setUser(prev => ({ ...prev, businessType: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Target Market</label>
                <input
                  type="text"
                  value={user.targetMarket}
                  onChange={(e) => setUser(prev => ({ ...prev, targetMarket: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Writing Style</label>
                <select
                  value={user.writingStyle}
                  onChange={(e) => setUser(prev => ({ ...prev, writingStyle: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="Professional yet conversational">Professional yet conversational</option>
                  <option value="Formal and authoritative">Formal and authoritative</option>
                  <option value="Casual and friendly">Casual and friendly</option>
                  <option value="Technical and detailed">Technical and detailed</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Referral Partners</label>
                <input
                  type="text"
                  value={user.referralPartners}
                  onChange={(e) => setUser(prev => ({ ...prev, referralPartners: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={closeModals}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
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
    </div>
  );
};

export default GlassSlipperApp;