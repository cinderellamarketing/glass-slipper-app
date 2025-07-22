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

  // UPDATED: File upload handler - Enhanced lastName extraction
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const text = e.target?.result as string;
        const lines = text.split('\n');
        
        if (lines.length < 2) {
          alert('CSV file appears to be empty or invalid');
          return;
        }

        setLoadingMessage('Processing your LinkedIn connections...');
        setShowLoadingModal(true);

        // Parse CSV headers and data
        const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/"/g, ''));
        const newContacts: Contact[] = [];

        for (let i = 1; i < lines.length; i++) {
          const line = lines[i].trim();
          if (!line) continue;

          const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
          
          if (values.length >= 3) {
            // Enhanced: Extract firstName and lastName separately if available
            const firstNameIndex = headers.indexOf('first name');
            const lastNameIndex = headers.indexOf('last name');
            const fullNameIndex = headers.indexOf('name') !== -1 ? headers.indexOf('name') : 0;
            
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
    // Enhanced: Update contacts with enriched data including lastName and industry
    const updatedContacts = contacts.map(contact => {
      const enrichedContact = data.contacts.find((c: Contact) => c.id === contact.id);
      if (enrichedContact) {
        // Debug: Log enrichment data for each contact
        console.log(`📋 Enriching ${contact.name}:`, {
          originalLastName: contact.lastName,
          enrichedLastName: enrichedContact.lastName,
          originalIndustry: contact.industry,
          enrichedIndustry: enrichedContact.industry,
          phone: enrichedContact.phone,
          website: enrichedContact.website
        });
        
        // Ensure all enriched fields are properly mapped
        return {
          ...contact,
          ...enrichedContact,
          isEnriched: true,
          phone: enrichedContact.phone || 'Not found',
          website: enrichedContact.website || 'Not found',
          lastName: enrichedContact.lastName || null,
          industry: enrichedContact.industry || 'Not found'
        };
      }
      return contact;
    });

    console.log('🔄 Updated contacts with enrichment data:', updatedContacts);
    setContacts(updatedContacts);
    console.log('✅ State updated successfully');
    
    // Mark enrichment task as complete
    setTasks(prev => prev.map(task =>
      task.id === 3 ? { ...task, completed: true } : task
    ));
    
    setEnrichmentsLeft(prev => prev - contactsToEnrich.length);
    setShowLoadingModal(false);
    setSuccessMessage(`Successfully enriched ${contactsToEnrich.length} contacts with real data including phone numbers, websites, and industry information!`);
    setShowSuccessModal(true);

} catch (error) {
  console.error('💥 Error occurred:', error);
  setShowLoadingModal(false);
  const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
  alert(`Enrichment failed: ${errorMessage}. Claude API may be experiencing issues or your API keys may need configuration.`);
}
};

  // Categorise contacts function - Enhanced with industry data
  const categoriseContacts = async () => {
    const uncategorisedContacts = contacts.filter(c => !c.category);
    
    if (uncategorisedContacts.length === 0) {
      alert('All contacts are already categorised');
      return;
    }

    setLoadingMessage(`Categorising ${uncategorisedContacts.length} contacts using enhanced UK business intelligence...`);
    setShowLoadingModal(true);

    try {
      // Enhanced UK categorisation with comprehensive decision maker recognition and industry data
      const updatedContacts = contacts.map(contact => {
        if (contact.category) return contact;

        let category = 'Other';
        const position = contact.position?.toLowerCase() || '';
        const company = contact.company?.toLowerCase() || '';
        const industry = contact.industry?.toLowerCase() || '';

        // ENHANCED: Comprehensive UK decision maker identification
        if (
          // C-Suite & Chiefs
          position.includes('ceo') || position.includes('chief') ||
          position.includes('cfo') || position.includes('cto') || position.includes('coo') ||
          position.includes('cmo') || position.includes('cro') || position.includes('cso') ||
          
          // Managing Directors (very common in UK)
          position.includes('managing director') || position.includes('md') ||
          
          // Directors (including UK SME directors)
          position.includes('director') ||
          
          // Presidents & VPs
          position.includes('president') || position.includes('vp') || 
          position.includes('v.p.') || position.includes('vice president') ||
          
          // Partners & Principals  
          position.includes('partner') || position.includes('principal') ||
          
          // Ownership titles
          position.includes('owner') || position.includes('proprietor') ||
          
          // Head of roles (common in UK)
          position.includes('head of') || position.includes('department head') ||
          
          // Board & Chair positions
          position.includes('chairman') || position.includes('chairwoman') || 
          position.includes('chair') || position.includes('board') ||
          
          // Executive roles
          position.includes('executive') ||
          
          // Founders
          position.includes('founder')
        ) {
          category = 'Ideal Client';
        }
        
        // CHAMPIONS: Decision influencers (COMPREHENSIVE UK SENIOR TITLES)
        else if (
          // Senior Management (Non-Director)
          position.includes('senior manager') || position.includes('senior executive') || position.includes('senior leader') ||
          position.includes('deputy manager') || position.includes('assistant manager') || position.includes('associate manager') ||
          position.includes('regional manager') || position.includes('area manager') || position.includes('branch manager') ||
          position.includes('district manager') || position.includes('territory manager') || position.includes('zone manager') ||
          
          // Department Management (excluding directors already caught above)
          (position.includes('manager') && !position.includes('managing director') && !position.includes('general manager')) ||
          position.includes('finance manager') || position.includes('financial manager') || position.includes('accounting manager') ||
          position.includes('operations manager') || position.includes('operational manager') || position.includes('production manager') ||
          position.includes('sales manager') || position.includes('business development manager') || position.includes('account manager') ||
          position.includes('marketing manager') || position.includes('digital marketing manager') || position.includes('brand manager') ||
          position.includes('hr manager') || position.includes('human resources manager') || position.includes('people manager') ||
          position.includes('it manager') || position.includes('technology manager') || position.includes('systems manager') ||
          position.includes('project manager') || position.includes('programme manager') || position.includes('portfolio manager') ||
          position.includes('quality manager') || position.includes('compliance manager') || position.includes('risk manager') ||
          position.includes('procurement manager') || position.includes('purchasing manager') || position.includes('supply chain manager') ||
          position.includes('customer service manager') || position.includes('client services manager') ||
          position.includes('facilities manager') || position.includes('property manager') || position.includes('office manager') ||
          
          // Team Leadership
          position.includes('team leader') || position.includes('team lead') || position.includes('team manager') || position.includes('team supervisor') ||
          position.includes('squad leader') || position.includes('squad lead') || position.includes('group leader') || position.includes('section leader') ||
          position.includes('unit leader') || position.includes('department lead') || position.includes('practice lead') ||
          
          // Supervisory Roles
          position.includes('supervisor') || position.includes('senior supervisor') || position.includes('shift supervisor') ||
          position.includes('floor supervisor') || position.includes('production supervisor') || position.includes('operations supervisor') ||
          position.includes('site supervisor') || position.includes('field supervisor') ||
          
          // Technical Leadership
          position.includes('technical lead') || position.includes('tech lead') || position.includes('lead developer') || position.includes('lead engineer') ||
          position.includes('senior developer') || position.includes('senior engineer') || position.includes('senior programmer') ||
          position.includes('principal developer') || position.includes('principal engineer') || position.includes('staff engineer') ||
          position.includes('senior software engineer') || position.includes('senior systems engineer') ||
          
          // Architecture & Design
          position.includes('architect') || position.includes('solution architect') || position.includes('system architect') || position.includes('software architect') ||
          position.includes('technical architect') || position.includes('enterprise architect') || position.includes('cloud architect') ||
          position.includes('data architect') || position.includes('security architect') || position.includes('infrastructure architect') ||
          
          // Specialist Technical Roles
          position.includes('senior analyst') || position.includes('systems analyst') || position.includes('business analyst') ||
          position.includes('data analyst') || position.includes('senior data analyst') || position.includes('research analyst') ||
          position.includes('cybersecurity analyst') || position.includes('security analyst') || position.includes('network analyst') ||
          position.includes('devops engineer') || position.includes('senior devops engineer') || position.includes('platform engineer') ||
          position.includes('database administrator') || position.includes('senior dba') || position.includes('network administrator') ||
          position.includes('system administrator') || position.includes('senior sysadmin') ||
          
          // Senior Finance Roles
          position.includes('senior accountant') || position.includes('management accountant') || position.includes('financial accountant') ||
          position.includes('senior financial analyst') || position.includes('financial analyst') || position.includes('budget analyst') ||
          position.includes('investment analyst') || position.includes('credit analyst') || position.includes('treasury analyst') ||
          position.includes('controller') || position.includes('assistant controller') || position.includes('finance controller') ||
          position.includes('cost accountant') || position.includes('senior bookkeeper') ||
          
          // Specialist Finance
          position.includes('treasury manager') || position.includes('credit manager') || position.includes('collections manager') ||
          position.includes('financial planning manager') || position.includes('budgeting manager') || position.includes('audit manager') ||
          position.includes('tax manager') || position.includes('payroll manager') || position.includes('accounts payable manager') ||
          position.includes('accounts receivable manager') ||
          
          // Senior Sales Roles
          position.includes('senior sales executive') || position.includes('sales executive') || position.includes('account executive') ||
          position.includes('key account manager') || position.includes('national account manager') || position.includes('regional sales manager') ||
          position.includes('territory sales manager') || position.includes('inside sales manager') || position.includes('channel manager') ||
          position.includes('partnership manager') || position.includes('alliance manager') || position.includes('relationship manager') ||
          
          // Marketing Specialists
          position.includes('senior marketing executive') || position.includes('marketing executive') || position.includes('marketing specialist') ||
          position.includes('digital marketing specialist') || position.includes('content marketing manager') || position.includes('seo manager') ||
          position.includes('social media manager') || position.includes('campaign manager') || position.includes('product marketing manager') ||
          position.includes('market research manager') || position.includes('communications manager') ||
          
          // Project & Programme Management
          position.includes('senior project manager') || position.includes('principal project manager') ||
          position.includes('senior programme manager') || position.includes('delivery manager') || position.includes('implementation manager') || position.includes('change manager') ||
          
          // Agile & Scrum
          position.includes('scrum master') || position.includes('senior scrum master') || position.includes('agile coach') ||
          position.includes('product owner') || position.includes('senior product owner') || position.includes('product manager') ||
          position.includes('release manager') || position.includes('iteration manager') ||
          
          // Analysis & Consulting
          position.includes('principal business analyst') || position.includes('principal consultant') ||
          position.includes('senior consultant') || position.includes('technical consultant') || position.includes('business consultant') ||
          position.includes('advisor') || position.includes('senior advisor') || position.includes('specialist') || position.includes('senior specialist') ||
          position.includes('subject matter expert') || position.includes('competitive analyst') || position.includes('strategy analyst') || position.includes('planning analyst') ||
          
          // Healthcare Management
          position.includes('practice manager') || position.includes('clinic manager') || position.includes('service manager') ||
          position.includes('patient services manager') || position.includes('nursing manager') || position.includes('senior nurse') || position.includes('charge nurse') ||
          position.includes('theatre manager') || position.includes('ward manager') || position.includes('senior clinician') || position.includes('clinical specialist') ||
          
          // Education & Academic
          position.includes('subject leader') || position.includes('year head') || position.includes('senior teacher') || position.includes('lead teacher') ||
          position.includes('curriculum manager') || position.includes('assessment manager') || position.includes('senior lecturer') ||
          position.includes('programme leader') || position.includes('course leader') || position.includes('student services manager') ||
          position.includes('admissions manager') || position.includes('academic registrar') || position.includes('examinations manager') || position.includes('library manager') ||
          
          // Public Sector
          position.includes('senior civil servant') || position.includes('policy manager') || position.includes('senior policy advisor') ||
          position.includes('senior administrator') || position.includes('principal officer') || position.includes('senior officer') || position.includes('executive officer') ||
          position.includes('senior social worker') || position.includes('senior planner') || position.includes('senior environmental health officer') ||
          
          // Legal & Compliance
          position.includes('senior solicitor') || position.includes('associate solicitor') || position.includes('legal counsel') ||
          position.includes('senior legal advisor') || position.includes('senior compliance officer') ||
          position.includes('senior risk officer') || position.includes('governance manager') || position.includes('contracts manager') || position.includes('senior paralegal') ||
          
          // Retail & Customer Service
          position.includes('store manager') || position.includes('assistant store manager') || position.includes('department manager') ||
          position.includes('area supervisor') || position.includes('shift manager') || position.includes('duty manager') ||
          position.includes('merchandising manager') || position.includes('visual merchandising manager') ||
          
          // Creative & Media
          position.includes('creative manager') || position.includes('senior creative') || position.includes('art director') ||
          position.includes('senior designer') || position.includes('lead designer') || position.includes('design manager') ||
          position.includes('content manager') || position.includes('senior copywriter') || position.includes('editorial manager') ||
          position.includes('production manager') || position.includes('senior producer') ||
          
          // Coordinator & Administrative
          position.includes('coordinator') || position.includes('senior coordinator') || position.includes('administrator') ||
          
          // Officer roles (not Chief Officers)
          (position.includes('officer') && !position.includes('chief'))
        ) {
          category = 'Champions';
        } 
        else if (position.includes('consultant') || position.includes('coach') || company.includes('consulting') || industry.includes('consulting')) {
          category = 'Referral Partners';
        } else if (company.includes(user.businessType.toLowerCase()) || position.includes(user.businessType.toLowerCase()) || industry.includes(user.businessType.toLowerCase())) {
          category = 'Competitors';
        } else if (industry && (industry.includes('accounting') || industry.includes('finance') || industry.includes('coaching') || industry.includes('training'))) {
          // Use industry data to identify potential referral partners
          category = 'Referral Partners';
        }

        return { ...contact, category };
      });

      setContacts(updatedContacts);
      setShowLoadingModal(false);
      setSuccessMessage(`Successfully categorised ${uncategorisedContacts.length} contacts using enhanced UK business intelligence!`);
      setShowSuccessModal(true);

      // Mark categorisation task as complete
      setTasks(prev => prev.map(task =>
        task.id === 4 ? { ...task, completed: true } : task
      ));

    } catch (error) {
      setShowLoadingModal(false);
      console.error('Categorisation failed:', error);
      alert('Categorisation failed. Using fallback categorisation.');
    }
  };

  // Calculate stats
  const totalContacts = contacts.length;
  const idealClients = contacts.filter(c => c.category === 'Ideal Client').length;
  const champions = contacts.filter(c => c.category === 'Champions').length;
  const enrichedContacts = contacts.filter(c => c.isEnriched).length;
  const referralPartners = contacts.filter(c => c.category === 'Referral Partners').length;

  // Get ideal clients list for dashboard focus
  const idealClientsList = contacts.filter(c => c.category === 'Ideal Client');
  const currentIdealClient = idealClientsList[currentIdealClientIndex];

  // Generate LinkedIn strategy
  const generateStrategy = async () => {
    setLoadingMessage('Generating your personalised LinkedIn strategy...');
    setShowLoadingModal(true);

    // Simulate strategy generation with realistic content
    setTimeout(() => {
      const generatedStrategy = `# LinkedIn ABM Strategy for ${user.company}

## Executive Summary
Based on your business profile and contact analysis, here's your personalised LinkedIn Account-Based Marketing strategy.

## Your Business Context
- **Industry**: ${user.businessType}
- **Target Market**: ${user.targetMarket}
- **Contact Base**: ${totalContacts} LinkedIn connections
- **Ideal Clients Identified**: ${idealClients} prospects

## Strategic Approach

### 1. Content Strategy
**Posting Schedule**: 3-4 posts per week focused on ${user.targetMarket} challenges
**Content Themes**:
- Industry insights and trends
- Case studies from your ${user.businessType} work
- Practical tips for ${user.targetMarket} leaders
- Behind-the-scenes business content

### 2. Engagement Strategy
**Daily Activities**:
- Comment meaningfully on 5 ideal client posts
- Share relevant industry content with your insights
- Send 3-5 personalised connection requests to target prospects

### 3. Lead Generation Approach
**Ideal Client Focus**: Target ${user.targetMarket} decision-makers
**Value-First Outreach**: Share insights before pitching services
**Multi-Touch Campaign**: 
1. Engaging content comment
2. Connection request with personalised note
3. Value-add message post-connection
4. Direct meeting invitation

### 4. Referral Partner Strategy
**Target Partners**: ${user.referralPartners}
**Collaboration Approach**: Cross-referral partnerships and content collaboration
**Value Exchange**: Mutual introductions and joint content creation

## Key Performance Indicators
- **Weekly connection requests**: 15-25 qualified prospects
- **Monthly meetings booked**: 8-12 discovery calls
- **Content engagement**: 50+ reactions per post
- **Pipeline growth**: 20% monthly increase in qualified opportunities

## Next Steps
1. Begin implementing daily engagement routine
2. Create content calendar for next 4 weeks
3. Identify top 20 ideal clients for immediate outreach
4. Set up tracking system for measuring progress

## Tools & Resources
- Use Glass Slipper for contact management and lead magnet creation
- LinkedIn Sales Navigator for advanced prospecting
- Calendar booking system for streamlined meeting scheduling

---

*Strategy generated on ${new Date().toLocaleDateString()}*
*Next review: ${new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}*
`;

      setStrategy(prev => ({ ...prev, generatedStrategy }));
      setShowLoadingModal(false);
      setSuccessMessage('Your LinkedIn strategy has been generated!');
      setShowSuccessModal(true);

      // Mark strategy task as complete
      setTasks(prev => prev.map(task =>
        task.id === 5 ? { ...task, completed: true } : task
      ));

    }, 3000);
  };

  // Generate lead magnet
  const generateLeadMagnet = async () => {
    setLoadingMessage('Creating your personalised lead magnet...');
    setShowLoadingModal(true);

    // Simulate lead magnet generation
    setTimeout(() => {
      const newLeadMagnet: LeadMagnet = {
        id: Date.now(),
        title: `${user.targetMarket} Success Guide`,
        description: `A comprehensive guide to help ${user.targetMarket} leaders overcome common challenges and achieve sustainable growth.`,
        type: 'PDF Guide',
        created: new Date().toISOString().split('T')[0],
        downloads: 0,
        content: `# The Ultimate ${user.targetMarket} Success Guide

## Table of Contents
1. Industry Overview & Current Challenges
2. Key Success Factors for ${user.targetMarket} Leaders
3. Common Pitfalls to Avoid
4. Step-by-Step Implementation Framework
5. Measurement & KPIs
6. Resources & Next Steps

---

## Chapter 1: Industry Overview & Current Challenges

The ${user.targetMarket} industry is experiencing unprecedented change. Leaders face mounting pressure to deliver results while navigating complex market dynamics.

### Key Challenges Facing ${user.targetMarket} Leaders:
- Digital transformation requirements
- Increasing competition and market saturation
- Talent acquisition and retention difficulties
- Economic uncertainty and budget constraints
- Regulatory compliance complexities

### Market Trends to Watch:
- Technology integration becoming essential
- Customer expectations rising rapidly
- Data-driven decision making now mandatory
- Sustainability and ESG concerns growing
- Remote work permanently changing operations

## Chapter 2: Key Success Factors

Based on our experience working with successful ${user.targetMarket} companies, here are the critical success factors:

### 1. Strategic Vision & Planning
- Clear 3-5 year roadmap
- Quarterly milestone tracking
- Agile strategy adaptation capabilities
- Stakeholder alignment processes

### 2. Operational Excellence
- Process optimization and automation
- Quality management systems
- Performance measurement frameworks
- Continuous improvement culture

### 3. Technology & Innovation
- Digital infrastructure investment
- Data analytics capabilities
- Innovation pipeline management
- Technology adoption strategies

### 4. People & Culture
- Leadership development programs
- Employee engagement initiatives
- Skills development and training
- Cultural transformation management

## Chapter 3: Common Pitfalls to Avoid

### Pitfall #1: Rushing Digital Transformation
Many ${user.targetMarket} companies attempt to digitise everything at once, leading to:
- Employee resistance and confusion
- System integration failures
- Budget overruns and delays
- Poor user adoption rates

**Solution**: Implement phased transformation with clear milestones and extensive change management.

### Pitfall #2: Ignoring Company Culture
Focusing solely on processes and technology while neglecting cultural change:
- Creates resistance to new initiatives
- Reduces employee engagement
- Limits innovation and creativity
- Impacts customer satisfaction

**Solution**: Invest equally in people development and cultural transformation alongside operational changes.

### Pitfall #3: Lack of Data Strategy
Making decisions without proper data analysis:
- Leads to ineffective resource allocation
- Creates missed opportunities
- Increases risk of strategic errors
- Reduces competitive advantage

**Solution**: Develop comprehensive data collection, analysis, and decision-making frameworks.

## Chapter 4: Step-by-Step Implementation Framework

### Phase 1: Assessment & Planning (Weeks 1-4)
- Current state analysis
- Gap identification
- Stakeholder mapping
- Resource requirement planning
- Timeline development

### Phase 2: Foundation Building (Weeks 5-12)
- Team structure establishment
- Process documentation
- Technology infrastructure setup
- Training program development
- Communication plan execution

### Phase 3: Implementation (Weeks 13-26)
- Pilot program launch
- Feedback collection and analysis
- System refinements
- Full rollout preparation
- Change management activities

### Phase 4: Optimization & Scale (Weeks 27-52)
- Performance monitoring
- Continuous improvement
- Best practice documentation
- Success story development
- Future planning

## Chapter 5: Measurement & KPIs

### Financial Metrics
- Revenue growth percentage
- Profit margin improvement
- Cost reduction achievements
- ROI on transformation investments

### Operational Metrics
- Process efficiency gains
- Quality improvement scores
- Customer satisfaction ratings
- Employee engagement levels

### Strategic Metrics
- Market share changes
- Innovation pipeline strength
- Competitive positioning
- Brand recognition metrics

## Chapter 6: Resources & Next Steps

### Recommended Reading
- Industry-specific research reports
- Best practice case studies
- Technology trend analyses
- Leadership development resources

### Professional Development Opportunities
- Industry conferences and events
- Online learning platforms
- Professional certifications
- Networking groups and associations

### Implementation Support
For organisations ready to begin their transformation journey, consider:
- Strategic planning workshops
- Implementation consulting services
- Technology selection assistance
- Change management support

### About ${user.company}
${user.company} specialises in helping ${user.targetMarket} leaders navigate complex challenges and achieve sustainable growth. Our ${user.businessType} approach combines industry expertise with proven methodologies to deliver measurable results.

**Ready to discuss your specific challenges and opportunities?**
Contact us to schedule a confidential consultation where we can explore how these frameworks apply to your unique situation.

---

*This guide represents current best practices as of ${new Date().toLocaleDateString()}. Market conditions and recommendations may evolve.*

### Contact Information
**${user.company}**
Email: ${user.email}
LinkedIn: Connect with ${user.name}

Use this guide as your roadmap to sustainable growth.

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

  // Handle logout
  const handleLogout = () => {
    setIsAuthenticated(false);
    setAuthView('landing');
    setCurrentView('dashboard');
  };

  // Handle authentication
  const handleAuth = (type: 'login' | 'register') => {
    // Simple validation
    if (!authForm.email || !authForm.password) {
      alert('Please fill in all required fields');
      return;
    }

    if (type === 'register') {
      if (authForm.password !== authForm.confirmPassword) {
        alert('Passwords do not match');
        return;
      }
      if (!authForm.name || !authForm.company) {
        alert('Please fill in all registration fields');
        return;
      }
    }

    // Update user data for registration
    if (type === 'register') {
      setUser(prev => ({
        ...prev,
        name: authForm.name,
        email: authForm.email,
        company: authForm.company
      }));
    }

    setIsAuthenticated(true);
    setAuthForm({
      email: '',
      password: '',
      confirmPassword: '',
      name: '',
      company: ''
    });
  };

  // Navigation items
  const navigationItems: NavigationItem[] = [
    { view: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { view: 'contacts', label: 'Contacts', icon: Users },
    { view: 'strategy', label: 'Strategy', icon: Target },
    { view: 'content', label: 'Content', icon: FileText },
    { view: 'tasks', label: 'Tasks', icon: CheckCircle }
  ];

  // Auth screens
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 flex items-center justify-center p-4">
        <div className="bg-white bg-opacity-10 backdrop-blur rounded-2xl p-8 w-full max-w-md relative">
          {authView === 'landing' && (
            <div className="text-center space-y-6">
              <div className="flex items-center justify-center space-x-3 mb-8">
                <div className="w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-purple-900" />
                </div>
                <h1 className="text-2xl font-bold text-white">Glass Slipper</h1>
              </div>

              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-white">Transform Your LinkedIn into a Lead Generation Engine</h2>
                <p className="text-white text-opacity-70">
                  AI-powered ABM platform for professional services. Turn your LinkedIn connections into qualified prospects with intelligent automation.
                </p>
              </div>

              <div className="grid grid-cols-3 gap-4 my-8">
                <div className="text-center">
                  <div className="w-10 h-10 bg-yellow-400 bg-opacity-20 rounded-lg flex items-center justify-center mx-auto mb-2">
                    <Users className="w-5 h-5 text-yellow-400" />
                  </div>
                  <p className="text-white text-sm">Smart Contact Management</p>
                </div>
                <div className="text-center">
                  <div className="w-10 h-10 bg-yellow-400 bg-opacity-20 rounded-lg flex items-center justify-center mx-auto mb-2">
                    <Target className="w-5 h-5 text-yellow-400" />
                  </div>
                  <p className="text-white text-sm">AI Categorisation</p>
                </div>
                <div className="text-center">
                  <div className="w-10 h-10 bg-yellow-400 bg-opacity-20 rounded-lg flex items-center justify-center mx-auto mb-2">
                    <Zap className="w-5 h-5 text-yellow-400" />
                  </div>
                  <p className="text-white text-sm">Lead Generation</p>
                </div>
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => setAuthView('register')}
                  className="w-full py-3 bg-yellow-400 text-purple-900 rounded-lg font-medium hover:bg-yellow-500 transition-colors"
                >
                  Get Started Free
                </button>
                <button
                  onClick={() => setAuthView('login')}
                  className="w-full py-3 border border-white border-opacity-30 text-white rounded-lg font-medium hover:bg-white hover:bg-opacity-10 transition-colors"
                >
                  Sign In
                </button>
              </div>

              <div className="flex items-center space-x-4 text-white text-opacity-70 text-sm">
                <div className="flex items-center space-x-1">
                  <Shield className="w-4 h-4" />
                  <span>Secure</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Zap className="w-4 h-4" />
                  <span>Fast Setup</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Award className="w-4 h-4" />
                  <span>AI-Powered</span>
                </div>
              </div>
            </div>
          )}

          {authView === 'login' && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="flex items-center justify-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-purple-900" />
                  </div>
                  <h1 className="text-xl font-bold text-white">Glass Slipper</h1>
                </div>
                <h2 className="text-lg font-semibold text-white">Welcome Back</h2>
                <p className="text-white text-opacity-70 text-sm">Sign in to your Glass Slipper account</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-white text-sm font-medium mb-2">Email</label>
                  <div className="relative">
                    <Mail className="w-5 h-5 text-white text-opacity-50 absolute left-3 top-3" />
                    <input
                      type="email"
                      value={authForm.email}
                      onChange={(e) => setAuthForm(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full pl-10 pr-4 py-3 bg-white bg-opacity-20 text-white placeholder-white placeholder-opacity-50 rounded-lg focus:bg-opacity-30 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                      placeholder="Enter your email"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-white text-sm font-medium mb-2">Password</label>
                  <div className="relative">
                    <Lock className="w-5 h-5 text-white text-opacity-50 absolute left-3 top-3" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={authForm.password}
                      onChange={(e) => setAuthForm(prev => ({ ...prev, password: e.target.value }))}
                      className="w-full pl-10 pr-12 py-3 bg-white bg-opacity-20 text-white placeholder-white placeholder-opacity-50 rounded-lg focus:bg-opacity-30 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                      placeholder="Enter your password"
                    />
                    <button
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-white text-opacity-50 hover:text-opacity-80"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <button
                  onClick={() => handleAuth('login')}
                  className="w-full py-3 bg-yellow-400 text-purple-900 rounded-lg font-medium hover:bg-yellow-500 transition-colors flex items-center justify-center space-x-2"
                >
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              <p className="text-white text-opacity-70 text-sm text-center">
                Don't have an account?{' '}
                <button onClick={() => setAuthView('register')} className="text-yellow-400 hover:underline">
                  Sign up here
                </button>
              </p>
            </div>
          )}

          {authView === 'register' && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="flex items-center justify-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-purple-900" />
                  </div>
                  <h1 className="text-xl font-bold text-white">Glass Slipper</h1>
                </div>
                <h2 className="text-lg font-semibold text-white">Create Account</h2>
                <p className="text-white text-opacity-70 text-sm">Start your LinkedIn ABM journey</p>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-white text-sm font-medium mb-2">Full Name</label>
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
                    <input
                      type="password"
                      value={authForm.password}
                      onChange={(e) => setAuthForm(prev => ({ ...prev, password: e.target.value }))}
                      className="w-full px-3 py-3 bg-white bg-opacity-20 text-white placeholder-white placeholder-opacity-50 rounded-lg focus:bg-opacity-30 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                      placeholder="Password"
                    />
                  </div>
                  <div>
                    <label className="block text-white text-sm font-medium mb-2">Confirm</label>
                    <input
                      type="password"
                      value={authForm.confirmPassword}
                      onChange={(e) => setAuthForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      className="w-full px-3 py-3 bg-white bg-opacity-20 text-white placeholder-white placeholder-opacity-50 rounded-lg focus:bg-opacity-30 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                      placeholder="Confirm"
                    />
                  </div>
                </div>

                <button
                  onClick={() => handleAuth('register')}
                  className="w-full py-3 bg-yellow-400 text-purple-900 rounded-lg font-medium hover:bg-yellow-500 transition-colors flex items-center justify-center space-x-2"
                >
                  <span>Create Account</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              <p className="text-white text-opacity-70 text-sm text-center">
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
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
                  <UserCheck className="w-8 h-8 text-orange-400" />
                  <div>
                    <p className="text-2xl font-bold text-white">{champions}</p>
                    <p className="text-white text-opacity-70 text-sm">Champions</p>
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
                      {currentIdealClient.lastName && (
                        <p className="text-white text-opacity-60 text-sm">Last Name: {currentIdealClient.lastName}</p>
                      )}
                      <p className="text-white text-opacity-70">{currentIdealClient.position}</p>
                      <p className="text-white text-opacity-70">{currentIdealClient.company}</p>
                      {currentIdealClient.industry && (
                        <p className="text-white text-opacity-70 text-sm">Industry: {currentIdealClient.industry}</p>
                      )}
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
                            <span className={`text-sm ${taskStatus.completed ? 'text-white line-through' : 'text-white text-opacity-70'}`}>
                              {taskLabels[taskKey]}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="bg-white bg-opacity-10 backdrop-blur rounded-xl p-6 text-left hover:bg-opacity-20 transition-all"
              >
                <Upload className="w-8 h-8 text-blue-400 mb-3" />
                <h3 className="text-lg font-semibold text-white mb-2">Upload Contacts</h3>
                <p className="text-white text-opacity-70 text-sm">Import your LinkedIn connections CSV</p>
              </button>

              <button
                onClick={enrichIdealClients}
                className="bg-white bg-opacity-10 backdrop-blur rounded-xl p-6 text-left hover:bg-opacity-20 transition-all"
                disabled={contacts.filter(c => !c.isEnriched).length === 0}
              >
                <Zap className="w-8 h-8 text-yellow-400 mb-3" />
                <h3 className="text-lg font-semibold text-white mb-2">Enrich Contacts</h3>
                <p className="text-white text-opacity-70 text-sm">Add phone numbers and company data</p>
                <p className="text-yellow-400 text-xs mt-1">{enrichmentsLeft} enrichments remaining</p>
              </button>

              <button
                onClick={categoriseContacts}
                className="bg-white bg-opacity-10 backdrop-blur rounded-xl p-6 text-left hover:bg-opacity-20 transition-all"
                disabled={contacts.filter(c => !c.category).length === 0}
              >
                <Target className="w-8 h-8 text-green-400 mb-3" />
                <h3 className="text-lg font-semibold text-white mb-2">Categorise Contacts</h3>
                <p className="text-white text-opacity-70 text-sm">AI-powered contact classification</p>
              </button>
            </div>

            {/* Daily Tasks */}
            <div className="bg-white bg-opacity-10 backdrop-blur rounded-xl p-6">
              <h3 className="text-xl font-semibold text-white mb-4">Today's LinkedIn Activities</h3>
              
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
                    <span className={`${dailyTasks.chooseIdealClients.completed ? 'text-white line-through' : 'text-white'}`}>
                      Choose 5 ideal clients to focus on
                    </span>
                  </div>
                  <span className="text-white text-opacity-70 text-sm">
                    {dailyTasks.chooseIdealClients.count || 0}/5
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
                    <span className={`${dailyTasks.commentOnPosts.completed ? 'text-white line-through' : 'text-white'}`}>
                      Comment on 5 ideal client posts
                    </span>
                  </div>
                  <span className="text-white text-opacity-70 text-sm">
                    {dailyTasks.commentOnPosts.count || 0}/5
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
                    <span className={`${dailyTasks.postContent.completed ? 'text-white line-through' : 'text-white'}`}>
                      Post valuable content on LinkedIn
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Onboarding Tasks */}
            <div className="bg-white bg-opacity-10 backdrop-blur rounded-xl p-6">
              <h3 className="text-xl font-semibold text-white mb-4">Setup Progress</h3>
              
              <div className="space-y-3">
                {tasks.map((task: Task) => (
                  <div key={task.id} className="flex items-center space-x-3">
                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                      task.completed
                        ? 'bg-green-500 border-green-500'
                        : task.priority === 'high'
                        ? 'border-red-400'
                        : task.priority === 'medium'
                        ? 'border-yellow-400'
                        : 'border-gray-400'
                    }`}>
                      {task.completed && <Check className="w-3 h-3 text-white" />}
                    </div>
                    <span className={`flex-1 ${task.completed ? 'text-white line-through' : 'text-white'}`}>
                      {task.text}
                    </span>
                    <span className={`text-xs px-2 py-1 rounded ${
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
          </div>
        )}

        {/* Contacts View */}
        {currentView === 'contacts' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white">Contacts</h2>
                <p className="text-white text-opacity-70">Manage and categorise your LinkedIn connections</p>
              </div>
              
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
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2"
                  disabled={contacts.filter(c => !c.isEnriched).length === 0}
                >
                  <Zap className="w-4 h-4" />
                  <span>Enrich Contacts</span>
                </button>
              </div>
            </div>

            {/* Search and Filter */}
            <div className="bg-white bg-opacity-10 backdrop-blur rounded-xl p-6">
              <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="w-5 h-5 text-white text-opacity-50 absolute left-3 top-3" />
                    <input
                      type="text"
                      placeholder="Search by name, company, position, industry..."
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
                                : 'bg-yellow-500 bg-opacity-20 text-yellow-300'
                            }`}>
                              {contact.category || 'Uncategorised'}
                            </span>
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex items-center space-x-2">
                              {contact.isEnriched ? (
                                <div className="flex items-center space-x-1">
                                  <CheckCircle className="w-4 h-4 text-green-400" />
                                  <span className="text-green-400 text-sm">
                                    Enriched
                                    {contact.lastName && contact.industry && contact.industry !== 'Not found' && 
                                      <span className="text-green-300 text-xs ml-1">(Full)</span>
                                    }
                                  </span>
                                </div>
                              ) : (
                                <div className="flex items-center space-x-1">
                                  <AlertCircle className="w-4 h-4 text-yellow-400" />
                                  <span className="text-yellow-400 text-sm">Basic</span>
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <button
                              onClick={() => {
                                setSelectedContact(contact);
                                setShowContactModal(true);
                              }}
                              className="text-white hover:text-yellow-400 transition-colors"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                        );
                      })}
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
            <div>
              <h2 className="text-2xl font-bold text-white">LinkedIn Strategy</h2>
              <p className="text-white text-opacity-70">Generate and manage your ABM strategy</p>
            </div>

            {!strategy.generatedStrategy ? (
              <div className="bg-white bg-opacity-10 backdrop-blur rounded-xl p-8 text-center">
                <Target className="w-16 h-16 text-purple-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-4">Generate Your LinkedIn Strategy</h3>
                <p className="text-white text-opacity-70 mb-6">
                  Create a personalised ABM strategy based on your business profile and contact analysis
                </p>
                <button
                  onClick={generateStrategy}
                  className="px-6 py-3 bg-yellow-400 text-purple-900 rounded-lg hover:bg-yellow-500 transition-colors"
                >
                  Generate Strategy
                </button>
              </div>
            ) : (
              <div className="bg-white bg-opacity-10 backdrop-blur rounded-xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-white">Your LinkedIn ABM Strategy</h3>
                  <button
                    onClick={generateStrategy}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2"
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span>Regenerate</span>
                  </button>
                </div>
                
                <div className="prose prose-invert max-w-none">
                  <div className="whitespace-pre-wrap text-white text-opacity-90">
                    {strategy.generatedStrategy}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Content View */}
        {currentView === 'content' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white">Content Library</h2>
                <p className="text-white text-opacity-70">Manage your lead magnets and marketing materials</p>
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
              <div className="bg-white bg-opacity-10 backdrop-blur rounded-xl p-8 text-center">
                <FileText className="w-16 h-16 text-purple-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-4">No Content Yet</h3>
                <p className="text-white text-opacity-70 mb-6">
                  Create your first lead magnet to start building your content library
                </p>
                <button
                  onClick={generateLeadMagnet}
                  className="px-6 py-3 bg-yellow-400 text-purple-900 rounded-lg hover:bg-yellow-500 transition-colors"
                >
                  Create Lead Magnet
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {leadMagnets.map((leadMagnet: LeadMagnet) => (
                  <div key={leadMagnet.id} className="bg-white bg-opacity-10 backdrop-blur rounded-xl p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
                          <FileText className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-white">{leadMagnet.title}</h3>
                          <p className="text-white text-opacity-70 text-sm">{leadMagnet.type}</p>
                        </div>
                      </div>
                      
                      <button
                        onClick={() => {
                          setSelectedLeadMagnet(leadMagnet);
                          setShowLeadMagnetModal(true);
                        }}
                        className="text-white hover:text-yellow-400"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>
                    
                    <p className="text-white text-opacity-70 text-sm mb-4">{leadMagnet.description}</p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 text-white text-opacity-70 text-sm">
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-4 h-4" />
                          <span>{leadMagnet.created}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Download className="w-4 h-4" />
                          <span>{leadMagnet.downloads}</span>
                        </div>
                      </div>
                      
                      <button
                        onClick={() => downloadLeadMagnet(leadMagnet)}
                        className="px-3 py-1 bg-yellow-400 text-purple-900 rounded text-sm hover:bg-yellow-500 transition-colors"
                      >
                        Download
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
            <div>
              <h2 className="text-2xl font-bold text-white">Tasks & Activities</h2>
              <p className="text-white text-opacity-70">Track your progress and daily activities</p>
            </div>

            {/* Daily Tasks Section */}
            <div className="bg-white bg-opacity-10 backdrop-blur rounded-xl p-6">
              <h3 className="text-xl font-semibold text-white mb-4">Today's LinkedIn Activities</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-white bg-opacity-10 rounded-lg">
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
                    <div>
                      <span className={`font-medium ${dailyTasks.chooseIdealClients.completed ? 'text-white line-through' : 'text-white'}`}>
                        Choose 5 ideal clients to focus on
                      </span>
                      <p className="text-white text-opacity-70 text-sm">
                        Review your ideal client list and select priority contacts for today
                      </p>
                    </div>
                  </div>
                  <span className="text-white text-opacity-70 text-sm font-medium">
                    {dailyTasks.chooseIdealClients.count || 0}/5
                  </span>
                </div>

                <div className="flex items-center justify-between p-4 bg-white bg-opacity-10 rounded-lg">
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
                    <div>
                      <span className={`font-medium ${dailyTasks.commentOnPosts.completed ? 'text-white line-through' : 'text-white'}`}>
                        Comment on 5 ideal client posts
                      </span>
                      <p className="text-white text-opacity-70 text-sm">
                        Engage meaningfully with your target prospects' content
                      </p>
                    </div>
                  </div>
                  <span className="text-white text-opacity-70 text-sm font-medium">
                    {dailyTasks.commentOnPosts.count || 0}/5
                  </span>
                </div>

                <div className="flex items-center justify-between p-4 bg-white bg-opacity-10 rounded-lg">
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
                    <div>
                      <span className={`font-medium ${dailyTasks.postContent.completed ? 'text-white line-through' : 'text-white'}`}>
                        Post valuable content on LinkedIn
                      </span>
                      <p className="text-white text-opacity-70 text-sm">
                        Share insights that demonstrate your expertise to your network
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Setup Tasks Section */}
            <div className="bg-white bg-opacity-10 backdrop-blur rounded-xl p-6">
              <h3 className="text-xl font-semibold text-white mb-4">Setup Progress</h3>
              
              <div className="space-y-3">
                {tasks.map((task: Task) => (
                  <div key={task.id} className="flex items-center justify-between p-4 bg-white bg-opacity-10 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                        task.completed
                          ? 'bg-green-500 border-green-500'
                          : task.priority === 'high'
                          ? 'border-red-400'
                          : task.priority === 'medium'
                          ? 'border-yellow-400'
                          : 'border-gray-400'
                      }`}>
                        {task.completed && <Check className="w-3 h-3 text-white" />}
                      </div>
                      <span className={`flex-1 font-medium ${task.completed ? 'text-white line-through' : 'text-white'}`}>
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
                  {selectedContact.lastName && (
                    <p className="text-white text-opacity-60 text-sm">Last Name: {selectedContact.lastName}</p>
                  )}
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
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                  updateCategory(selectedContact.id, e.target.value);
                  setSelectedContact(prev => prev ? { ...prev, category: e.target.value } : null);
                }}
                className="w-full px-3 py-2 bg-white bg-opacity-20 text-white rounded-lg focus:bg-opacity-30 focus:outline-none focus:ring-2 focus:ring-yellow-400"
              >
                <option value="Uncategorised" className="text-black">Uncategorised</option>
                {categories.map((category: string) => (
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
              <div className="prose prose-invert max-w-none">
                <div className="whitespace-pre-wrap text-white text-opacity-90 text-sm">
                  {selectedLeadMagnet.content}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4 text-white text-opacity-70 text-sm">
                <span>Created: {selectedLeadMagnet.created}</span>
                <span>Downloads: {selectedLeadMagnet.downloads}</span>
              </div>
              
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => downloadLeadMagnet(selectedLeadMagnet)}
                  className="px-4 py-2 bg-yellow-400 text-purple-900 rounded-lg hover:bg-yellow-500 transition-colors flex items-center space-x-2"
                >
                  <Download className="w-4 h-4" />
                  <span>Download</span>
                </button>
                
                <button
                  onClick={() => setShowLeadMagnetModal(false)}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white bg-opacity-10 backdrop-blur rounded-xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-white">Settings</h3>
              <button
                onClick={() => setShowSettingsModal(false)}
                className="text-white hover:text-yellow-400"
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
                  className="w-full px-3 py-2 bg-white bg-opacity-20 text-white placeholder-white placeholder-opacity-50 rounded-lg focus:bg-opacity-30 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                />
              </div>

              <div>
                <label className="block text-white text-sm font-medium mb-2">Target Market</label>
                <input
                  type="text"
                  value={user.targetMarket}
                  onChange={(e) => setUser(prev => ({ ...prev, targetMarket: e.target.value }))}
                  className="w-full px-3 py-2 bg-white bg-opacity-20 text-white placeholder-white placeholder-opacity-50 rounded-lg focus:bg-opacity-30 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                />
              </div>

              <div>
                <label className="block text-white text-sm font-medium mb-2">Referral Partners</label>
                <input
                  type="text"
                  value={user.referralPartners}
                  onChange={(e) => setUser(prev => ({ ...prev, referralPartners: e.target.value }))}
                  className="w-full px-3 py-2 bg-white bg-opacity-20 text-white placeholder-white placeholder-opacity-50 rounded-lg focus:bg-opacity-30 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                />
              </div>
            </div>

            <div className="flex items-center justify-between mt-6">
              <button
                onClick={() => setShowSettingsModal(false)}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              
              <button
                onClick={() => updateUserSettings({
                  businessType: user.businessType,
                  targetMarket: user.targetMarket,
                  referralPartners: user.referralPartners
                })}
                className="px-4 py-2 bg-yellow-400 text-purple-900 rounded-lg hover:bg-yellow-500 transition-colors"
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