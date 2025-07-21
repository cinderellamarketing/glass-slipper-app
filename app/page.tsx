'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Mail, Lock, Eye, EyeOff, ArrowRight, Sparkles, Shield, Users, Upload, Target, UserCheck, Building, BarChart3, Calendar, Settings, CheckCircle, User, Briefcase, Plus, TrendingUp, Zap, Menu, FileText, LogOut, Check, Phone, Globe, X, ChevronDown, Search, ChevronLeft, MessageSquare, Bell, TrendingDown, Award, AlertCircle, Edit2, Trash2, DollarSign, Clock, Activity, BookOpen, Download, Send, Copy, Share2, Star, Link, RefreshCw, Filter, MoreVertical, MapPin } from 'lucide-react';

// Updated interfaces with lastName support
interface Contact {
  id: number;
  name: string;
  lastName?: string; // ADD THIS LINE
  company: string;
  position: string;
  email: string;
  category?: string;
  isEnriched?: boolean;
  phone?: string;
  website?: string;
  industry?: string; // ADD THIS LINE (for enrich.js compatibility)
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

export default function GlassSlipperApp() {
  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [authView, setAuthView] = useState<string>('landing');
  const [authForm, setAuthForm] = useState<AuthForm>({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    company: ''
  });
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);

  // User and contact state
  const [user, setUser] = useState<User>({
    name: 'Sarah Thompson',
    email: 'sarah@example.com',
    company: 'Thompson Marketing',
    businessType: 'Marketing Agency',
    targetMarket: 'Small Business Owners',
    writingStyle: 'Professional and approachable',
    referralPartners: 'Accountants, Business Coaches, Web Developers'
  });

  const [contacts, setContacts] = useState<Contact[]>([]);
  
  // UI state
  const [currentView, setCurrentView] = useState<string>('dashboard');
  const [showContactModal, setShowContactModal] = useState<boolean>(false);
  const [showLeadMagnetModal, setShowLeadMagnetModal] = useState<boolean>(false);
  const [showSettingsModal, setShowSettingsModal] = useState<boolean>(false);
  const [showLoadingModal, setShowLoadingModal] = useState<boolean>(false);
  const [showSuccessModal, setShowSuccessModal] = useState<boolean>(false);
  const [showMobileMenu, setShowMobileMenu] = useState<boolean>(false);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [selectedLeadMagnet, setSelectedLeadMagnet] = useState<LeadMagnet | null>(null);
  const [loadingMessage, setLoadingMessage] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');

  // Content state
  const [leadMagnets, setLeadMagnets] = useState<LeadMagnet[]>([]);
  const [strategy, setStrategy] = useState<Strategy>({
    oneOffer: '',
    idealReferralPartners: '',
    specialFactors: '',
    generatedStrategy: ''
  });

  // File input ref
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Search and filter
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedFilter, setSelectedFilter] = useState<string>('All');

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

  // UPDATED: File upload handler with lastName extraction
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
            lastName, // ADD THIS LINE
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

        // Mark task as complete
        setTasks(prev => prev.map(task => 
          task.id === 1 ? { ...task, completed: true } : task
        ));

        // Simulate processing time for better UX
        setTimeout(() => {
          setTasks(prevTasks => prevTasks.map(task => 
            task.text === "Upload your LinkedIn connections" ? 
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
    // Update contacts with enriched data
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

  // AI categorize all contacts
  const aiCategorizeAll = async () => {
    const uncategorizedContacts = contacts.filter(c => !c.category || c.category === 'Uncategorised');

    if (uncategorizedContacts.length === 0) {
      alert('All contacts are already categorised!');
      return;
    }

    setLoadingMessage(`Categorising ${uncategorizedContacts.length} contacts using AI...`);
    setShowLoadingModal(true);

    try {
      // Simulate AI categorization
      setTimeout(() => {
        const categories = ['Ideal Client', 'Referral Partners', 'Competitors', 'Other'];
        
        const updatedContacts = contacts.map(contact => {
          if (!contact.category || contact.category === 'Uncategorised') {
            // Simple rule-based categorization
            let category = 'Other';
            
            if (contact.position.toLowerCase().includes('ceo') ||
                contact.position.toLowerCase().includes('director') ||
                contact.position.toLowerCase().includes('founder') ||
                contact.position.toLowerCase().includes('owner')) {
              category = 'Ideal Client';
            } else if (contact.position.toLowerCase().includes('consultant') ||
                       contact.position.toLowerCase().includes('coach') ||
                       contact.position.toLowerCase().includes('advisor')) {
              category = 'Referral Partners';
            } else if (contact.company.toLowerCase().includes(user.businessType.toLowerCase()) ||
                       contact.position.toLowerCase().includes(user.businessType.toLowerCase())) {
              category = 'Competitors';
            }

            return { ...contact, category };
          }
          return contact;
        });

        setContacts(updatedContacts);
        setShowLoadingModal(false);
        setSuccessMessage(`Successfully categorised ${uncategorizedContacts.length} contacts!`);
        setShowSuccessModal(true);

        // Mark task as complete
        setTasks(prev => prev.map(task => 
          task.id === 4 ? { ...task, completed: true } : task
        ));
      }, 3000);

    } catch (error) {
      console.error('Categorization failed:', error);
      setShowLoadingModal(false);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      alert(`Categorization failed: ${errorMessage}. Please try again.`);
    }
  };

  // Generate strategy
  const generateStrategy = () => {
    if (!strategy.oneOffer || !strategy.idealReferralPartners || !strategy.specialFactors) {
      alert('Please fill in all strategy fields first.');
      return;
    }

    setLoadingMessage('Generating your personalised LinkedIn strategy...');
    setShowLoadingModal(true);

    setTimeout(() => {
      const generatedStrategy = `
# Your Personalised LinkedIn ABM Strategy

## Executive Summary
Based on your business profile as a ${user.businessType} targeting ${user.targetMarket}, here's your comprehensive LinkedIn ABM strategy.

## Your Unique Value Proposition
"${strategy.oneOffer}"

## Target Audience Strategy

### Ideal Client Profile
- **Primary Target**: ${user.targetMarket}
- **Key Decision Makers**: CEOs, Directors, and Senior Managers in your target market
- **Pain Points**: Business growth challenges, operational inefficiencies, competitive pressures

### Engagement Approach
1. **Content Strategy**: Share insights relevant to ${user.targetMarket}
2. **Personal Branding**: Position yourself as the go-to expert for ${strategy.oneOffer}
3. **Relationship Building**: Focus on providing value before selling

## Referral Partner Strategy

### Target Partners
${strategy.idealReferralPartners}

### Partnership Approach
- Identify complementary service providers
- Create mutual referral opportunities
- Develop co-marketing initiatives
- Share resources and insights

## Competitive Differentiation

### Your Special Factors
${strategy.specialFactors}

### Market Positioning
- Leverage your unique strengths in all communications
- Highlight case studies and success stories
- Demonstrate expertise through valuable content
- Build thought leadership in your niche

## Implementation Roadmap

### Phase 1: Foundation (Weeks 1-2)
- Optimise LinkedIn profile with clear value proposition
- Create content calendar based on target audience needs
- Begin connecting with ideal clients and referral partners

### Phase 2: Engagement (Weeks 3-6)
- Publish valuable content weekly
- Engage meaningfully with prospects' posts
- Send personalised connection requests
- Start conversations with warm prospects

### Phase 3: Conversion (Weeks 7-12)
- Nurture relationships through consistent value delivery
- Introduce services naturally in conversations
- Leverage referral partner network
- Track and optimise performance

## Success Metrics
- Connection acceptance rate: Target 60%+
- Engagement rate on content: Target 5%+
- Meetings booked per month: Target 8-12
- Referral partner relationships: Target 10-15

## Monthly Action Plan

### Week 1:
- Connect with 25 ideal clients
- Publish 2 value-driven posts
- Engage with 50 prospect posts

### Week 2:
- Follow up with new connections
- Share 1 case study or success story
- Reach out to 5 potential referral partners

### Week 3:
- Send personalised messages to warm connections
- Publish industry insights content
- Comment thoughtfully on 30 posts

### Week 4:
- Review and optimise strategy based on results
- Plan next month's content calendar
- Strengthen existing referral relationships

This strategy is specifically designed for ${user.company} and leverages your strengths in ${user.businessType} to attract ${user.targetMarket}.
`;

      setStrategy(prev => ({
        ...prev,
        generatedStrategy
      }));

      setShowLoadingModal(false);
      setSuccessMessage('Your LinkedIn strategy has been generated!');
      setShowSuccessModal(true);

      // Mark task as complete
      setTasks(prev => prev.map(task => 
        task.id === 5 ? { ...task, completed: true } : task
      ));
    }, 3000);
  };

  // Generate lead magnet
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

  // Filtered contacts for search and category
  const filteredContacts = contacts.filter(contact => {
    const matchesSearch = contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         contact.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         contact.position.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = selectedFilter === 'All' || contact.category === selectedFilter;
    
    return matchesSearch && matchesFilter;
  });

  // Authentication handlers
  const handleAuth = () => {
    if (!authForm.email || !authForm.password) {
      alert('Please fill in all required fields');
      return;
    }

    if (authView === 'register') {
      if (!authForm.name || !authForm.company || !authForm.confirmPassword) {
        alert('Please fill in all fields');
        return;
      }
      if (authForm.password !== authForm.confirmPassword) {
        alert('Passwords do not match');
        return;
      }
    }

    // Update user with registration info if signing up
    if (authView === 'register') {
      setUser(prev => ({
        ...prev,
        name: authForm.name,
        email: authForm.email,
        company: authForm.company
      }));
    }

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
                  <h1 className="text-2xl font-bold text-white">Glass Slipper</h1>
                </div>
                
                <h2 className="text-3xl font-bold text-white">
                  Turn LinkedIn connections into <span className="text-yellow-400">qualified leads</span>
                </h2>
                
                <p className="text-white text-opacity-70">
                  Upload your LinkedIn connections, let AI categorise them intelligently, and get personalised outreach strategies.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-6">
                <div className="bg-white bg-opacity-10 backdrop-blur rounded-xl p-6 text-center">
                  <Upload className="w-8 h-8 text-blue-400 mx-auto mb-3" />
                  <h3 className="text-lg font-semibold text-white mb-2">Smart Import</h3>
                  <p className="text-white text-opacity-70 text-sm">
                    Upload LinkedIn CSV exports and watch AI categorise your connections
                  </p>
                </div>

                <div className="bg-white bg-opacity-10 backdrop-blur rounded-xl p-6 text-center">
                  <Target className="w-8 h-8 text-green-400 mx-auto mb-3" />
                  <h3 className="text-lg font-semibold text-white mb-2">AI Categorisation</h3>
                  <p className="text-white text-opacity-70 text-sm">
                    Automatically identify ideal clients, referral partners, and competitors
                  </p>
                </div>

                <div className="bg-white bg-opacity-10 backdrop-blur rounded-xl p-6 text-center">
                  <Zap className="w-8 h-8 text-purple-400 mx-auto mb-3" />
                  <h3 className="text-lg font-semibold text-white mb-2">Personalised Outreach</h3>
                  <p className="text-white text-opacity-70 text-sm">
                    Get tailored messaging strategies and content for each contact
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <button
                  onClick={() => setAuthView('register')}
                  className="w-full bg-yellow-400 text-purple-900 py-3 rounded-lg font-semibold hover:bg-yellow-500 transition-colors"
                >
                  Get Started Free
                </button>
                
                <button
                  onClick={() => setAuthView('login')}
                  className="w-full bg-white bg-opacity-20 text-white py-3 rounded-lg font-semibold hover:bg-opacity-30 transition-colors"
                >
                  Sign In
                </button>
              </div>
            </div>
          )}

          {(authView === 'login' || authView === 'register') && (
            <div className="bg-white bg-opacity-10 backdrop-blur rounded-xl p-8">
              <div className="text-center mb-8">
                <div className="flex items-center justify-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-purple-900" />
                  </div>
                  <h2 className="text-xl font-bold text-white">Glass Slipper</h2>
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  {authView === 'register' ? 'Create Your Account' : 'Welcome Back'}
                </h3>
                <p className="text-white text-opacity-70 text-sm">
                  {authView === 'register' ? 'Get started with Glass Slipper today' : 'Sign in to your account'}
                </p>
              </div>

              <div className="space-y-4">
                {authView === 'register' && (
                  <>
                    <div>
                      <label className="block text-white text-sm font-medium mb-2">Full Name</label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white text-opacity-50" />
                        <input
                          type="text"
                          value={authForm.name}
                          onChange={(e) => setAuthForm(prev => ({ ...prev, name: e.target.value }))}
                          className="w-full pl-10 pr-4 py-3 bg-white bg-opacity-20 text-white placeholder-white placeholder-opacity-50 rounded-lg focus:bg-opacity-30 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                          placeholder="Enter your full name"
                          required
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
                          placeholder="Enter your company name"
                          required
                        />
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
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-white text-sm font-medium mb-2">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white text-opacity-50" />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={authForm.password}
                      onChange={(e) => setAuthForm(prev => ({ ...prev, password: e.target.value }))}
                      className="w-full pl-10 pr-10 py-3 bg-white bg-opacity-20 text-white placeholder-white placeholder-opacity-50 rounded-lg focus:bg-opacity-30 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                      placeholder="Enter your password"
                      required
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

                {authView === 'register' && (
                  <div>
                    <label className="block text-white text-sm font-medium mb-2">Confirm Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white text-opacity-50" />
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        value={authForm.confirmPassword}
                        onChange={(e) => setAuthForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                        className="w-full pl-10 pr-10 py-3 bg-white bg-opacity-20 text-white placeholder-white placeholder-opacity-50 rounded-lg focus:bg-opacity-30 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                        placeholder="Confirm your password"
                        required
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

                <button
                  onClick={handleAuth}
                  className="w-full bg-yellow-400 text-purple-900 py-3 rounded-lg font-semibold hover:bg-yellow-500 transition-colors"
                >
                  {authView === 'register' ? 'Create Account' : 'Sign In'}
                </button>
              </div>

              <div className="mt-6 text-center">
                <p className="text-white text-opacity-70 text-sm">
                  {authView === 'register' ? 'Already have an account?' : "Don't have an account?"}{' '}
                  <button 
                    onClick={() => setAuthView(authView === 'register' ? 'login' : 'register')} 
                    className="text-yellow-400 hover:underline"
                  >
                    {authView === 'register' ? 'Sign in here' : 'Sign up here'}
                  </button>
                </p>
              </div>

              <div className="mt-4 text-center">
                <button
                  onClick={() => setAuthView('landing')}
                  className="text-white text-opacity-50 hover:text-white text-sm"
                >
                  ← Back to home
                </button>
              </div>
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
      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept=".csv"
        className="hidden"
      />

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
                      Choose {dailyTasks.chooseIdealClients.total} ideal clients to focus on
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
                      Comment on {dailyTasks.commentOnPosts.total} LinkedIn posts
                    </span>
                  </div>
                  <span className="text-white text-opacity-70 text-sm">
                    {dailyTasks.commentOnPosts.count}/{dailyTasks.commentOnPosts.total}
                  </span>
                </div>

                <div className="flex items-center justify-between">
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
                      Share valuable content on LinkedIn
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 flex items-center justify-center space-x-3"
              >
                <Upload className="w-6 h-6" />
                <span className="font-medium">Import Contacts</span>
              </button>
              
              <button
                onClick={enrichIdealClients}
                className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-200 flex items-center justify-center space-x-3"
                disabled={contacts.filter(c => !c.isEnriched).length === 0}
              >
                <Zap className="w-6 h-6" />
                <span className="font-medium">Enrich Contacts</span>
              </button>
              
              <button
                onClick={aiCategorizeAll}
                className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-6 rounded-xl hover:from-purple-600 hover:to-purple-700 transition-all duration-200 flex items-center justify-center space-x-3"
                disabled={contacts.filter(c => !c.category || c.category === 'Uncategorised').length === 0}
              >
                <Target className="w-6 h-6" />
                <span className="font-medium">AI Categorise</span>
              </button>
            </div>
          </div>
        )}

        {/* Contacts View */}
        {currentView === 'contacts' && (
          <div className="space-y-6">
            <div className="text-center space-y-4">
              <h2 className="text-3xl font-bold text-white">Contact Management</h2>
              <p className="text-white text-opacity-70">Manage and categorise your LinkedIn connections</p>
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
                              onClick={() => {
                                setSelectedContact(contact);
                                setShowContactModal(true);
                              }}
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

            {/* Action Buttons */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 flex items-center justify-center space-x-3"
              >
                <Upload className="w-5 h-5" />
                <span>Import CSV</span>
              </button>
              
              <button
                onClick={enrichIdealClients}
                className="bg-gradient-to-r from-green-500 to-green-600 text-white p-4 rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-200 flex items-center justify-center space-x-3"
                disabled={contacts.filter(c => !c.isEnriched).length === 0}
              >
                <Zap className="w-5 h-5" />
                <span>Enrich All</span>
              </button>
              
              <button
                onClick={aiCategorizeAll}
                className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-4 rounded-xl hover:from-purple-600 hover:to-purple-700 transition-all duration-200 flex items-center justify-center space-x-3"
                disabled={contacts.filter(c => !c.category || c.category === 'Uncategorised').length === 0}
              >
                <Target className="w-5 h-5" />
                <span>AI Categorise</span>
              </button>
            </div>
          </div>
        )}

        {/* Strategy View */}
        {currentView === 'strategy' && (
          <div className="space-y-6">
            <div className="text-center space-y-4">
              <h2 className="text-3xl font-bold text-white">LinkedIn Strategy Builder</h2>
              <p className="text-white text-opacity-70">Create your personalised ABM strategy</p>
            </div>

            <div className="bg-white bg-opacity-10 backdrop-blur rounded-xl p-6">
              <div className="space-y-6">
                <div>
                  <label className="block text-white text-sm font-medium mb-2">
                    What's your one main offer or service? *
                  </label>
                  <textarea
                    value={strategy.oneOffer}
                    onChange={(e) => setStrategy(prev => ({ ...prev, oneOffer: e.target.value }))}
                    className="w-full px-4 py-3 bg-white bg-opacity-20 text-white placeholder-white placeholder-opacity-50 rounded-lg focus:bg-opacity-30 focus:outline-none focus:ring-2 focus:ring-yellow-400 resize-none"
                    rows={3}
                    placeholder="e.g., We help small businesses increase their revenue by 30% through targeted digital marketing strategies..."
                  />
                </div>

                <div>
                  <label className="block text-white text-sm font-medium mb-2">
                    Who are your ideal referral partners? *
                  </label>
                  <textarea
                    value={strategy.idealReferralPartners}
                    onChange={(e) => setStrategy(prev => ({ ...prev, idealReferralPartners: e.target.value }))}
                    className="w-full px-4 py-3 bg-white bg-opacity-20 text-white placeholder-white placeholder-opacity-50 rounded-lg focus:bg-opacity-30 focus:outline-none focus:ring-2 focus:ring-yellow-400 resize-none"
                    rows={3}
                    placeholder="e.g., Accountants, business coaches, web developers, HR consultants..."
                  />
                </div>

                <div>
                  <label className="block text-white text-sm font-medium mb-2">
                    What makes you special or different? *
                  </label>
                  <textarea
                    value={strategy.specialFactors}
                    onChange={(e) => setStrategy(prev => ({ ...prev, specialFactors: e.target.value }))}
                    className="w-full px-4 py-3 bg-white bg-opacity-20 text-white placeholder-white placeholder-opacity-50 rounded-lg focus:bg-opacity-30 focus:outline-none focus:ring-2 focus:ring-yellow-400 resize-none"
                    rows={3}
                    placeholder="e.g., 15 years experience, certified Google Partner, award-winning campaigns, guaranteed results..."
                  />
                </div>

                <button
                  onClick={generateStrategy}
                  className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 text-purple-900 py-3 rounded-lg font-semibold hover:from-yellow-500 hover:to-orange-600 transition-all duration-200"
                  disabled={!strategy.oneOffer || !strategy.idealReferralPartners || !strategy.specialFactors}
                >
                  Generate My LinkedIn Strategy
                </button>
              </div>
            </div>

            {strategy.generatedStrategy && (
              <div className="bg-white bg-opacity-10 backdrop-blur rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold text-white">Your Personalised Strategy</h3>
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
                </div>
                
                <div className="bg-black bg-opacity-30 rounded-lg p-4 max-h-96 overflow-y-auto">
                  <pre className="text-white text-sm whitespace-pre-wrap font-mono">
                    {strategy.generatedStrategy}
                  </pre>
                </div>
              </div>
            )}
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
                  className="px-6 py-3 bg-yellow-400 text-purple-900 rounded-lg font-semibold hover:bg-yellow-500 transition-colors inline-flex items-center space-x-2"
                >
                  <Plus className="w-5 h-5" />
                  <span>Create Your First Lead Magnet</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {leadMagnets.map(magnet => (
                  <div key={magnet.id} className="bg-white bg-opacity-10 backdrop-blur rounded-xl p-6 hover:bg-opacity-20 transition-all duration-200">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-white mb-2">{magnet.title}</h3>
                        <p className="text-white text-opacity-70 text-sm mb-3 line-clamp-3">
                          {magnet.description}
                        </p>
                        
                        <div className="flex items-center space-x-4 text-sm text-white text-opacity-60">
                          <span className="flex items-center space-x-1">
                            <FileText className="w-4 h-4" />
                            <span>{magnet.type}</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <Calendar className="w-4 h-4" />
                            <span>{magnet.created}</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <Download className="w-4 h-4" />
                            <span>{magnet.downloads}</span>
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => downloadLeadMagnet(magnet)}
                        className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center space-x-2"
                      >
                        <Download className="w-4 h-4" />
                        <span>Download</span>
                      </button>
                      
                      <button
                        onClick={() => {
                          setSelectedLeadMagnet(magnet);
                          setShowLeadMagnetModal(true);
                        }}
                        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(magnet.content);
                          setSuccessMessage('Lead magnet content copied to clipboard!');
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
                            'bg-green-500 bg-opacity-20 text-green-400'
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
                          disabled={task.completed || contacts.filter(c => !c.isEnriched).length === 0}
                          className="px-3 py-1 bg-yellow-400 text-purple-900 rounded text-sm hover:bg-yellow-500 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
                        >
                          Enrich
                        </button>
                      )}
                      {task.id === 4 && (
                        <button
                          onClick={aiCategorizeAll}
                          disabled={task.completed || contacts.filter(c => !c.category || c.category === 'Uncategorised').length === 0}
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
                  <input
                    type="text"
                    value={user.businessType}
                    onChange={(e) => setUser(prev => ({ ...prev, businessType: e.target.value }))}
                    className="w-full px-4 py-3 bg-white bg-opacity-20 text-white placeholder-white placeholder-opacity-50 rounded-lg focus:bg-opacity-30 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                    placeholder="e.g., Marketing Agency"
                  />
                </div>

                <div>
                  <label className="block text-white text-sm font-medium mb-2">Target Market</label>
                  <input
                    type="text"
                    value={user.targetMarket}
                    onChange={(e) => setUser(prev => ({ ...prev, targetMarket: e.target.value }))}
                    className="w-full px-4 py-3 bg-white bg-opacity-20 text-white placeholder-white placeholder-opacity-50 rounded-lg focus:bg-opacity-30 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                    placeholder="e.g., Small Business Owners"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-white text-sm font-medium mb-2">Writing Style</label>
                  <textarea
                    value={user.writingStyle}
                    onChange={(e) => setUser(prev => ({ ...prev, writingStyle: e.target.value }))}
                    className="w-full px-4 py-3 bg-white bg-opacity-20 text-white placeholder-white placeholder-opacity-50 rounded-lg focus:bg-opacity-30 focus:outline-none focus:ring-2 focus:ring-yellow-400 resize-none"
                    rows={3}
                    placeholder="Describe your preferred communication style..."
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-white text-sm font-medium mb-2">Ideal Referral Partners</label>
                  <textarea
                    value={user.referralPartners}
                    onChange={(e) => setUser(prev => ({ ...prev, referralPartners: e.target.value }))}
                    className="w-full px-4 py-3 bg-white bg-opacity-20 text-white placeholder-white placeholder-opacity-50 rounded-lg focus:bg-opacity-30 focus:outline-none focus:ring-2 focus:ring-yellow-400 resize-none"
                    rows={3}
                    placeholder="List your ideal referral partner types..."
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={saveSettings}
                  className="px-6 py-3 bg-yellow-400 text-purple-900 rounded-lg font-semibold hover:bg-yellow-500 transition-colors"
                >
                  Save Settings
                </button>
              </div>
            </div>

            <div className="bg-white bg-opacity-10 backdrop-blur rounded-xl p-6">
              <h3 className="text-xl font-semibold text-white mb-4">Account Information</h3>
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-white text-sm font-medium mb-2">Name</label>
                    <p className="text-white text-opacity-70">{user.name}</p>
                  </div>
                  <div>
                    <label className="block text-white text-sm font-medium mb-2">Email</label>
                    <p className="text-white text-opacity-70">{user.email}</p>
                  </div>
                </div>
                <div>
                  <label className="block text-white text-sm font-medium mb-2">Company</label>
                  <p className="text-white text-opacity-70">{user.company}</p>
                </div>
              </div>
            </div>

            <div className="bg-white bg-opacity-10 backdrop-blur rounded-xl p-6">
              <h3 className="text-xl font-semibold text-white mb-4">Usage Statistics</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <p className="text-2xl font-bold text-yellow-400">{enrichmentsLeft}</p>
                  <p className="text-white text-opacity-70 text-sm">Enrichments Remaining</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-400">{contacts.length}</p>
                  <p className="text-white text-opacity-70 text-sm">Total Contacts</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-purple-400">{leadMagnets.length}</p>
                  <p className="text-white text-opacity-70 text-sm">Lead Magnets Created</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Contact Detail Modal */}
      {showContactModal && selectedContact && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white bg-opacity-10 backdrop-blur rounded-xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-white">Contact Details</h3>
              <button
                onClick={() => setShowContactModal(false)}
                className="text-white text-opacity-70 hover:text-white"
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
              <div>
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

              {/* Action Buttons */}
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowContactModal(false)}
                  className="flex-1 bg-white bg-opacity-20 text-white py-3 rounded-lg hover:bg-opacity-30 transition-all duration-200"
                >
                  Close
                </button>
                <button
                  onClick={() => deleteContact(selectedContact.id)}
                  className="px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all duration-200"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Lead Magnet Modal */}
      {showLeadMagnetModal && selectedLeadMagnet && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white bg-opacity-10 backdrop-blur rounded-xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-white">{selectedLeadMagnet.title}</h3>
              <button
                onClick={() => setShowLeadMagnetModal(false)}
                className="text-white text-opacity-70 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="bg-black bg-opacity-30 rounded-lg p-4 max-h-96 overflow-y-auto mb-6">
              <pre className="text-white text-sm whitespace-pre-wrap">
                {selectedLeadMagnet.content}
              </pre>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => downloadLeadMagnet(selectedLeadMagnet)}
                className="flex-1 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-all duration-200 flex items-center justify-center space-x-2"
              >
                <Download className="w-4 h-4" />
                <span>Download</span>
              </button>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(selectedLeadMagnet.content);
                  setSuccessMessage('Content copied to clipboard!');
                  setShowSuccessModal(true);
                }}
                className="px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all duration-200"
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {showSettingsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white bg-opacity-10 backdrop-blur rounded-xl p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-white">Configure Settings</h3>
              <button
                onClick={() => setShowSettingsModal(false)}
                className="text-white text-opacity-70 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-white text-sm font-medium mb-2">Business Type</label>
                <input
                  type="text"
                  value={user.businessType}
                  onChange={(e) => setUser(prev => ({ ...prev, businessType: e.target.value }))}
                  className="w-full px-4 py-3 bg-white bg-opacity-20 text-white placeholder-white placeholder-opacity-50 rounded-lg focus:bg-opacity-30 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  placeholder="e.g., Marketing Agency"
                />
              </div>

              <div>
                <label className="block text-white text-sm font-medium mb-2">Target Market</label>
                <input
                  type="text"
                  value={user.targetMarket}
                  onChange={(e) => setUser(prev => ({ ...prev, targetMarket: e.target.value }))}
                  className="w-full px-4 py-3 bg-white bg-opacity-20 text-white placeholder-white placeholder-opacity-50 rounded-lg focus:bg-opacity-30 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  placeholder="e.g., Small Business Owners"
                />
              </div>

              <button
                onClick={saveSettings}
                className="w-full bg-yellow-400 text-purple-900 py-3 rounded-lg font-semibold hover:bg-yellow-500 transition-colors"
              >
                Save Settings
              </button>
            </div>
          </div>
        </div>
      )}

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