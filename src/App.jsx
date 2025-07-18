import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Mail, Lock, Eye, EyeOff, ArrowRight, Sparkles, Shield, Users, Upload, Target, UserCheck, Building, BarChart3, Calendar, Settings, CheckCircle, User, Briefcase, Plus, TrendingUp, Zap, Menu, FileText, LogOut, Check, Phone, Globe, X, ChevronDown, Search, ChevronLeft, MessageSquare, Bell, TrendingDown, Award, AlertCircle, Edit2, Trash2, DollarSign, Clock, Activity, BookOpen, Download, Send, Copy, Share2, Star, Link, RefreshCw, Filter, MoreVertical, MapPin } from 'lucide-react';

const GlassSlipperApp = () => {
  // User session state
  const [currentUser, setCurrentUser] = useState({
    name: 'John Smith',
    email: 'john@example.com',
    company: 'Growth Dynamics Ltd',
    businessType: 'Consulting',
    targetMarket: 'B2B SaaS',
    writingStyle: 'Professional yet conversational',
    referralPartners: 'Accountants, Business Coaches'
  });

  // Auth state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authView, setAuthView] = useState('landing');
  const [showPassword, setShowPassword] = useState(false);
  const [authForm, setAuthForm] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    company: ''
  });

  // UI state
  const [currentView, setCurrentView] = useState('dashboard');
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [selectedContact, setSelectedContact] = useState(null);
  const [showLoadingModal, setShowLoadingModal] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [showLeadMagnetModal, setShowLeadMagnetModal] = useState(false);
  const [selectedLeadMagnet, setSelectedLeadMagnet] = useState(null);
  const fileInputRef = useRef(null);

  // Business state
  const [user, setUser] = useState(currentUser);
  const [contacts, setContacts] = useState([]);
  const [categories] = useState(['Ideal Client', 'Referral Partners', 'Competitors', 'Other']);
  
  // Search and filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');

  // Filtered contacts
  const filteredContacts = contacts.filter(contact => {
    const matchesSearch = contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         contact.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         contact.position.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'All' || contact.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  // Strategy state
  const [strategy, setStrategy] = useState({
    oneOffer: '',
    idealReferralPartners: '',
    specialFactors: '',
    generatedStrategy: ''
  });

  // Lead magnets state
  const [leadMagnets, setLeadMagnets] = useState([]);

  // Enrichments counter
  const [enrichmentsLeft, setEnrichmentsLeft] = useState(50);

  // Main onboarding tasks
  const [tasks, setTasks] = useState([
    { id: 1, text: 'Upload your LinkedIn connections', completed: false, priority: 'high' },
    { id: 2, text: 'Configure your business settings', completed: false, priority: 'high' },
    { id: 3, text: 'Auto-categorize your contacts', completed: false, priority: 'medium' },
    { id: 4, text: 'Generate your LinkedIn strategy', completed: false, priority: 'medium' },
    { id: 5, text: 'Create your first lead magnet', completed: false, priority: 'low' }
  ]);

  // CHANGE 1: Contact task management state
  const [contactTasks, setContactTasks] = useState({});

  // CHANGE 2: Daily tasks state
  const [dailyTasks, setDailyTasks] = useState({
    chooseIdealClients: { completed: false, count: 0, total: 5 },
    commentOnPosts: { completed: false, count: 0, total: 5 },
    postContent: { completed: false },
    lastReset: new Date().toDateString()
  });

  // CHANGE 2: Track which ideal clients are shown in tasks
  const [taskListClients, setTaskListClients] = useState([]);
  const [completedAllIdealClients, setCompletedAllIdealClients] = useState(false);

  // CHANGE 3: Track which ideal client is currently being shown in dashboard
  const [currentIdealClientIndex, setCurrentIdealClientIndex] = useState(0);
  const [isDirectOutreachCycle, setIsDirectOutreachCycle] = useState(false);

  // CHANGE 1: Load contact tasks from localStorage on mount
  useEffect(() => {
    const savedTasks = localStorage.getItem('contactTasks');
    if (savedTasks) {
      setContactTasks(JSON.parse(savedTasks));
    }
  }, []);

  // CHANGE 1: Save contact tasks to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('contactTasks', JSON.stringify(contactTasks));
  }, [contactTasks]);

  // CHANGE 2: Load and save daily tasks
  useEffect(() => {
    const savedDailyTasks = localStorage.getItem('dailyTasks');
    if (savedDailyTasks) {
      const parsed = JSON.parse(savedDailyTasks);
      // Check if we need to reset (new day)
      const today = new Date().toDateString();
      if (parsed.lastReset !== today) {
        // Reset daily tasks
        setDailyTasks({
          chooseIdealClients: { completed: false, count: 0, total: 5 },
          commentOnPosts: { completed: false, count: 0, total: 5 },
          postContent: { completed: false },
          lastReset: today
        });
      } else {
        setDailyTasks(parsed);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('dailyTasks', JSON.stringify(dailyTasks));
  }, [dailyTasks]);

  // CHANGE 2: Update task list clients when contacts or tasks change
  useEffect(() => {
    updateTaskListClients();
  }, [contacts, contactTasks]);

  // CHANGE 3: Load and save current ideal client index
  useEffect(() => {
    const savedIndex = localStorage.getItem('currentIdealClientIndex');
    const savedCycle = localStorage.getItem('isDirectOutreachCycle');
    if (savedIndex) {
      setCurrentIdealClientIndex(parseInt(savedIndex));
    }
    if (savedCycle) {
      setIsDirectOutreachCycle(savedCycle === 'true');
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('currentIdealClientIndex', currentIdealClientIndex.toString());
    localStorage.setItem('isDirectOutreachCycle', isDirectOutreachCycle.toString());
  }, [currentIdealClientIndex, isDirectOutreachCycle]);

  // CHANGE 3: Update current client index when tasks are completed
  useEffect(() => {
    const idealClients = contacts.filter(c => c.category === 'Ideal Client').sort((a, b) => a.name.localeCompare(b.name));
    if (idealClients.length === 0) return;

    const currentClient = idealClients[currentIdealClientIndex];
    if (!currentClient) return;

    const tasks = contactTasks[currentClient.id] || {};
    const allBasicTasksComplete = tasks.viewProfile?.completed && 
                                  tasks.turnOnNotifications?.completed && 
                                  tasks.sendMessage?.completed;
    
    const followUpComplete = !shouldShowFollowUp(currentClient.id) || tasks.followUp?.completed;
    const directOutreachComplete = !isDirectOutreachCycle || tasks.sendDirectSalesMessage?.completed;

    // Check if current client's tasks are complete
    if (isDirectOutreachCycle) {
      if (directOutreachComplete) {
        // Move to next client in direct outreach cycle
        if (currentIdealClientIndex < idealClients.length - 1) {
          setCurrentIdealClientIndex(currentIdealClientIndex + 1);
        } else {
          // Completed full cycle - start over
          setCurrentIdealClientIndex(0);
          setIsDirectOutreachCycle(false);
        }
      }
    } else {
      if (allBasicTasksComplete && followUpComplete) {
        // Move to next client
        if (currentIdealClientIndex < idealClients.length - 1) {
          setCurrentIdealClientIndex(currentIdealClientIndex + 1);
        } else {
          // Completed all clients - start direct outreach cycle
          setCurrentIdealClientIndex(0);
          setIsDirectOutreachCycle(true);
        }
      }
    }
  }, [contacts, contactTasks, currentIdealClientIndex, isDirectOutreachCycle]);

  // CHANGE 2: Function to update which clients show in task list
  const updateTaskListClients = () => {
    const idealClients = contacts.filter(c => c.category === 'Ideal Client');
    
    // First, get all clients with pending follow-up tasks
    const clientsWithFollowUps = idealClients.filter(client => 
      shouldShowFollowUp(client.id) && !getTaskStatus(client.id, 'followUp').completed
    );
    
    // Then get clients with any incomplete tasks (excluding those already in follow-ups)
    const clientsWithIncompleteTasks = idealClients.filter(client => {
      const hasFollowUp = clientsWithFollowUps.some(c => c.id === client.id);
      if (hasFollowUp) return false;
      
      const tasks = contactTasks[client.id] || {};
      const hasIncompleteTasks = 
        !tasks.viewProfile?.completed ||
        !tasks.turnOnNotifications?.completed ||
        !tasks.sendMessage?.completed ||
        (completedAllIdealClients && !tasks.sendDirectSalesMessage?.completed);
      
      return hasIncompleteTasks;
    });
    
    // Combine and take first 5
    const allRelevantClients = [...clientsWithFollowUps, ...clientsWithIncompleteTasks];
    setTaskListClients(allRelevantClients.slice(0, 5));
    
    // Check if all ideal clients have completed all tasks
    const allCompleted = idealClients.length > 0 && idealClients.every(client => {
      const tasks = contactTasks[client.id] || {};
      return tasks.viewProfile?.completed &&
             tasks.turnOnNotifications?.completed &&
             tasks.sendMessage?.completed &&
             (!shouldShowFollowUp(client.id) || tasks.followUp?.completed);
    });
    
    setCompletedAllIdealClients(allCompleted);
  };

  // CHANGE 1: Function to check if follow-up task should be shown
  const shouldShowFollowUp = (contactId) => {
    const tasks = contactTasks[contactId];
    if (!tasks || !tasks.sendMessage || !tasks.sendMessage.completed) return false;
    
    const completedDate = new Date(tasks.sendMessage.completedDate);
    const currentDate = new Date();
    const diffTime = Math.abs(currentDate - completedDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays >= 3;
  };

  // CHANGE 1: Function to toggle task completion
  const toggleContactTask = (contactId, taskKey) => {
    setContactTasks(prev => {
      const updatedTasks = { ...prev };
      if (!updatedTasks[contactId]) {
        updatedTasks[contactId] = {};
      }
      
      if (!updatedTasks[contactId][taskKey]) {
        updatedTasks[contactId][taskKey] = { completed: false, completedDate: null };
      }
      
      // Toggle completion status
      if (updatedTasks[contactId][taskKey].completed) {
        // Uncomplete the task
        updatedTasks[contactId][taskKey] = {
          completed: false,
          completedDate: null
        };
      } else {
        // Complete the task
        updatedTasks[contactId][taskKey] = {
          completed: true,
          completedDate: new Date().toISOString()
        };
      }
      
      return updatedTasks;
    });
  };

  // CHANGE 1: Function to get task status
  const getTaskStatus = (contactId, taskKey) => {
    return contactTasks[contactId]?.[taskKey] || { completed: false, completedDate: null };
  };

  // CHANGE 2: Toggle daily task functions
  const toggleDailyTask = (taskKey) => {
    setDailyTasks(prev => {
      const updated = { ...prev };
      
      if (taskKey === 'postContent') {
        updated.postContent.completed = !updated.postContent.completed;
      } else if (taskKey === 'chooseIdealClients' || taskKey === 'commentOnPosts') {
        if (updated[taskKey].completed) {
          // Uncomplete
          updated[taskKey].completed = false;
          updated[taskKey].count = 0;
        } else {
          // Complete
          updated[taskKey].completed = true;
          updated[taskKey].count = updated[taskKey].total;
        }
      }
      
      return updated;
    });
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

  // Delete contact
  const deleteContact = (contactId) => {
    setContacts(prev => prev.filter(c => c.id !== contactId));
    setShowContactModal(false);
    setSuccessMessage('Contact deleted successfully!');
    setShowSuccessModal(true);
  };

  // AI categorization function
  const aiCategorize = (contact) => {
    const position = contact.position.toLowerCase();
    const name = contact.name.toLowerCase();
    const company = contact.company.toLowerCase();
    
    // Simple rule-based categorization for demo
    if (position.includes('ceo') || position.includes('founder') || position.includes('owner') || 
        position.includes('director') || position.includes('head of') || position.includes('vp')) {
      return 'Ideal Client';
    } else if (position.includes('consultant') || position.includes('coach') || 
               position.includes('advisor') || position.includes('accountant')) {
      return 'Referral Partners';
    } else if (company.includes('competitor') || position.includes('sales') || 
               position.includes('business development')) {
      return 'Competitors';
    } else {
      return 'Other';
    }
  };

  // File upload handler
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result;
      const lines = text.split('\n');
      const headers = lines[0].split(',').map(h => h.trim());
      
      const nameIndex = headers.findIndex(h => h.toLowerCase().includes('name'));
      const companyIndex = headers.findIndex(h => h.toLowerCase().includes('company'));
      const positionIndex = headers.findIndex(h => h.toLowerCase().includes('position') || h.toLowerCase().includes('title'));
      const emailIndex = headers.findIndex(h => h.toLowerCase().includes('email'));
      
      const newContacts = [];
      
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim());
        if (values.length > 1 && values[nameIndex]) {
          const contact = {
            id: Date.now() + i,
            name: values[nameIndex] || 'Unknown',
            company: values[companyIndex] || 'Unknown Company',
            position: values[positionIndex] || 'Unknown Position',
            email: values[emailIndex] || 'email@example.com',
            category: 'Uncategorized',
            isEnriched: false
          };
          newContacts.push(contact);
        }
      }
      
      setContacts(newContacts);
      setSuccessMessage(`Successfully uploaded ${newContacts.length} contacts!`);
      setShowSuccessModal(true);
      
      // Mark task as complete
      setTasks(prev => prev.map(task => 
        task.id === 1 ? { ...task, completed: true } : task
      ));
    };
    
    reader.readAsText(file);
  };

  // AI categorize all contacts
  const aiCategorizeAll = () => {
    if (contacts.length === 0) {
      alert('Please upload contacts first');
      return;
    }

    setLoadingMessage('AI is categorizing your contacts...');
    setShowLoadingModal(true);
    
    setTimeout(() => {
      const categorizedContacts = contacts.map(contact => ({
        ...contact,
        category: aiCategorize(contact)
      }));
      
      setContacts(categorizedContacts);
      setShowLoadingModal(false);
      setSuccessMessage('All contacts have been categorized!');
      setShowSuccessModal(true);
      
      // Mark task as complete
      setTasks(prev => prev.map(task => 
        task.id === 3 ? { ...task, completed: true } : task
      ));
    }, 1500);
  };

  // Generate strategy with real AI
  const generateStrategy = async () => {
    if (!strategy.oneOffer || !strategy.idealReferralPartners || !strategy.specialFactors) {
      alert('Please fill in all strategy fields first');
      return;
    }

    setLoadingMessage('Generating your LinkedIn strategy...');
    setShowLoadingModal(true);
    
    try {
      // Create comprehensive prompt based on LinkedIn Formula
      const prompt = `You are an expert LinkedIn strategist implementing Adam Jones' LinkedIn Formula methodology. 

User's Business Details:
- One Offer: ${strategy.oneOffer}
- Ideal Referral Partners: ${strategy.idealReferralPartners}
- What Makes Them Special: ${strategy.specialFactors}
- Business Type: ${user.businessType}
- Target Market: ${user.targetMarket}
- Writing Style: ${user.writingStyle}

Based on Adam Jones' LinkedIn Formula 10-step process:
1. Define your one offer ✓
2. Create your value proposition
3. Build your Ideal Customer Profile
4. Do some customer interviews
5. Discover your style ✓
6. Shoot some content
7. Write your profile
8. Build the strategy
9. Start implementing it
10. Constantly review

Key principles from the LinkedIn Formula:
- Focus on ONE thing to be known for
- Your profile is a landing page
- Content funnel: 3x Awareness, 2x Interest, 1x Decision, 1x Action
- Content types: Education, Storytelling, Personal, Expertise, Sales
- Success requires strategic preparation - 8 of 10 steps happen before posting
- Stop selling, start helping
- Content strategy: Case Study → Advice → Personal → Sales → Testimonial

Create a comprehensive LinkedIn strategy that includes:

1. **Value Proposition** (following Adam's 3-part formula: What you provide + Who you provide it to + What makes you unique)

2. **Ideal Customer Profile** (detailed description of who will buy from them)

3. **Content Strategy** (specific content calendar following the funnel approach)

4. **Profile Optimization** (headline, about section, call-to-action)

5. **Engagement Strategy** (how to find and engage with ideal clients)

6. **Pain Points** (specific problems their ideal clients face)

7. **Implementation Plan** (step-by-step next actions)

8. **Messaging Framework** (how to start conversations that lead to business)

Make this strategy actionable, specific, and based on proven LinkedIn Formula principles. Write in a straightforward, conversational tone that values radical candour. Include specific examples and avoid generic advice.`;

      const response = await window.claude.complete(prompt, 'claude-sonnet-4-20250514', 4000);
      
      setStrategy(prev => ({ ...prev, generatedStrategy: response }));
      setShowLoadingModal(false);
      setSuccessMessage('Strategy generated successfully!');
      setShowSuccessModal(true);
      
      // Mark task as complete
      setTasks(prev => prev.map(task => 
        task.id === 4 ? { ...task, completed: true } : task
      ));
    } catch (error) {
      console.error('Strategy generation failed:', error);
      setShowLoadingModal(false);
      alert('Failed to generate strategy. Please try again.');
    }
  };

  // Enrich ideal clients with Apollo data
  const enrichIdealClients = async () => {
    const idealClientsToEnrich = contacts.filter(c => 
      c.category === 'Ideal Client' && !c.isEnriched
    );

    if (idealClientsToEnrich.length === 0) {
      alert('No ideal clients to enrich');
      return;
    }

    if (enrichmentsLeft < idealClientsToEnrich.length) {
      alert(`You only have ${enrichmentsLeft} enrichments left. Please select specific contacts.`);
      return;
    }

    setLoadingMessage(`Enriching ${idealClientsToEnrich.length} ideal clients...`);
    setShowLoadingModal(true);

    try {
      // Simulate API enrichment
      setTimeout(() => {
        const enrichedContacts = contacts.map(contact => {
          if (contact.category === 'Ideal Client' && !contact.isEnriched) {
            return {
              ...contact,
              isEnriched: true,
              phone: '+44 7XXX XXXXXX',
              website: `www.${contact.company.toLowerCase().replace(/\s+/g, '')}.com`,
              revenue: '£2-5M',
              employees: '50-200',
              industry: 'Technology',
              technologies: ['Salesforce', 'HubSpot', 'Slack'],
              recentNews: [
                'Recently raised Series A funding',
                'Launched new product line',
                'Expanding to European markets'
              ]
            };
          }
          return contact;
        });

        setContacts(enrichedContacts);
        setEnrichmentsLeft(prev => prev - idealClientsToEnrich.length);
        setShowLoadingModal(false);
        setSuccessMessage(`Successfully enriched ${idealClientsToEnrich.length} ideal clients!`);
        setShowSuccessModal(true);
      }, 2000);
    } catch (error) {
      console.error('Enrichment failed:', error);
      setShowLoadingModal(false);
      alert('Enrichment failed. Please try again.');
    }
  };

  // Generate personalized lead magnet
  const generateLeadMagnet = async (contactId = null) => {
    if (!strategy.generatedStrategy) {
      alert('Please generate your LinkedIn strategy first');
      return;
    }

    const contact = contactId ? contacts.find(c => c.id === contactId) : null;
    const isPersonalized = !!contact;

    setLoadingMessage(isPersonalized 
      ? `Creating personalized lead magnet for ${contact.name}...`
      : 'Creating general lead magnet...'
    );
    setShowLoadingModal(true);

    try {
      const prompt = isPersonalized 
        ? `Create a highly personalized lead magnet for ${contact.name} at ${contact.company} (${contact.position}).
           
           Their company details:
           - Industry: ${contact.industry || 'Not specified'}
           - Size: ${contact.employees || 'Unknown'} employees
           - Revenue: ${contact.revenue || 'Unknown'}
           - Technologies used: ${contact.technologies?.join(', ') || 'Unknown'}
           
           My business: ${user.businessType}
           My offer: ${strategy.oneOffer}
           
           Create a compelling, specific lead magnet title and outline that addresses their likely pain points.`
        : `Create a general lead magnet for my target market.
           
           My business: ${user.businessType}
           My target market: ${user.targetMarket}
           My offer: ${strategy.oneOffer}
           
           Create a compelling lead magnet title and outline that addresses common pain points.`;

      const response = await window.claude.complete(prompt, 'claude-sonnet-4-20250514', 1500);
      
      const newLeadMagnet = {
        id: Date.now(),
        title: response.split('\n')[0].replace(/[*#]/g, '').trim(),
        content: response,
        isPersonalized,
        contactId: contact?.id,
        contactName: contact?.name,
        createdAt: new Date().toISOString()
      };

      setLeadMagnets(prev => [...prev, newLeadMagnet]);
      setShowLoadingModal(false);
      setSuccessMessage('Lead magnet created successfully!');
      setShowSuccessModal(true);
      
      // Mark task as complete if it's the first lead magnet
      if (leadMagnets.length === 0) {
        setTasks(prev => prev.map(task => 
          task.id === 5 ? { ...task, completed: true } : task
        ));
      }
    } catch (error) {
      console.error('Lead magnet generation failed:', error);
      setShowLoadingModal(false);
      alert('Failed to generate lead magnet. Please try again.');
    }
  };

  // Stats calculations
  const totalContacts = contacts.length;
  const idealClients = contacts.filter(c => c.category === 'Ideal Client').length;
  const enrichedContacts = contacts.filter(c => c.isEnriched).length;
  const referralPartners = contacts.filter(c => c.category === 'Referral Partners').length;

  // Mobile menu items
  const navigationItems = [
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
                <button 
                  onClick={() => setAuthView('login')}
                  className="w-full bg-yellow-400 hover:bg-yellow-500 text-purple-900 py-3 px-6 rounded-lg font-semibold transition-all flex items-center justify-center space-x-2"
                >
                  <Mail className="w-5 h-5" />
                  <span>Sign In</span>
                </button>
                
                <button 
                  onClick={() => setAuthView('register')}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 px-6 rounded-lg font-semibold transition-all flex items-center justify-center space-x-2"
                >
                  <Sparkles className="w-5 h-5" />
                  <span>Get Started</span>
                </button>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <Shield className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
                  <p className="text-white text-opacity-70 text-sm">Enterprise Security</p>
                </div>
                <div className="text-center">
                  <Target className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
                  <p className="text-white text-opacity-70 text-sm">AI-Powered</p>
                </div>
                <div className="text-center">
                  <Users className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
                  <p className="text-white text-opacity-70 text-sm">Smart CRM</p>
                </div>
              </div>
            </div>
          )}

          {authView === 'login' && (
            <div className="bg-white bg-opacity-10 backdrop-blur rounded-xl p-8 space-y-6">
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold text-white">Welcome Back</h2>
                <p className="text-white text-opacity-70">Sign in to your Glass Slipper account</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-white text-opacity-70 mb-2">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white text-opacity-50" />
                    <input
                      type="email"
                      value={authForm.email}
                      onChange={(e) => setAuthForm({...authForm, email: e.target.value})}
                      className="w-full pl-10 pr-4 py-3 bg-white bg-opacity-20 text-white placeholder-white placeholder-opacity-50 rounded-lg focus:bg-opacity-30 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                      placeholder="john@example.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-white text-opacity-70 mb-2">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white text-opacity-50" />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={authForm.password}
                      onChange={(e) => setAuthForm({...authForm, password: e.target.value})}
                      className="w-full pl-10 pr-12 py-3 bg-white bg-opacity-20 text-white placeholder-white placeholder-opacity-50 rounded-lg focus:bg-opacity-30 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                      placeholder="••••••••"
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
              </div>

              <button
                onClick={handleAuth}
                disabled={!validateAuthForm()}
                className="w-full bg-yellow-400 hover:bg-yellow-500 disabled:bg-gray-500 text-purple-900 py-3 px-6 rounded-lg font-semibold transition-all flex items-center justify-center space-x-2"
              >
                <ArrowRight className="w-5 h-5" />
                <span>Sign In</span>
              </button>

              <p className="text-center text-white text-opacity-70">
                Don't have an account?{' '}
                <button onClick={() => setAuthView('register')} className="text-yellow-400 hover:underline">
                  Sign up here
                </button>
              </p>
            </div>
          )}

          {authView === 'register' && (
            <div className="bg-white bg-opacity-10 backdrop-blur rounded-xl p-8 space-y-6">
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold text-white">Create Account</h2>
                <p className="text-white text-opacity-70">Start your Glass Slipper journey</p>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-white text-opacity-70 mb-2">Name</label>
                    <input
                      type="text"
                      value={authForm.name}
                      onChange={(e) => setAuthForm({...authForm, name: e.target.value})}
                      className="w-full px-4 py-3 bg-white bg-opacity-20 text-white placeholder-white placeholder-opacity-50 rounded-lg focus:bg-opacity-30 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                      placeholder="John"
                    />
                  </div>
                  <div>
                    <label className="block text-white text-opacity-70 mb-2">Company</label>
                    <input
                      type="text"
                      value={authForm.company}
                      onChange={(e) => setAuthForm({...authForm, company: e.target.value})}
                      className="w-full px-4 py-3 bg-white bg-opacity-20 text-white placeholder-white placeholder-opacity-50 rounded-lg focus:bg-opacity-30 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                      placeholder="Acme Ltd"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-white text-opacity-70 mb-2">Email</label>
                  <input
                    type="email"
                    value={authForm.email}
                    onChange={(e) => setAuthForm({...authForm, email: e.target.value})}
                    className="w-full px-4 py-3 bg-white bg-opacity-20 text-white placeholder-white placeholder-opacity-50 rounded-lg focus:bg-opacity-30 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                    placeholder="john@example.com"
                  />
                </div>

                <div>
                  <label className="block text-white text-opacity-70 mb-2">Password</label>
                  <input
                    type="password"
                    value={authForm.password}
                    onChange={(e) => setAuthForm({...authForm, password: e.target.value})}
                    className="w-full px-4 py-3 bg-white bg-opacity-20 text-white placeholder-white placeholder-opacity-50 rounded-lg focus:bg-opacity-30 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                    placeholder="••••••••"
                  />
                </div>

                <div>
                  <label className="block text-white text-opacity-70 mb-2">Confirm Password</label>
                  <input
                    type="password"
                    value={authForm.confirmPassword}
                    onChange={(e) => setAuthForm({...authForm, confirmPassword: e.target.value})}
                    className="w-full px-4 py-3 bg-white bg-opacity-20 text-white placeholder-white placeholder-opacity-50 rounded-lg focus:bg-opacity-30 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <button
                onClick={handleAuth}
                disabled={!validateAuthForm()}
                className="w-full bg-yellow-400 hover:bg-yellow-500 disabled:bg-gray-500 text-purple-900 py-3 px-6 rounded-lg font-semibold transition-all"
              >
                Create Account
              </button>

              <p className="text-center text-white text-opacity-70">
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
                {navigationItems.map(item => {
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
                <p className="text-white text-sm">{user.name || currentUser.name}</p>
                <p className="text-white text-opacity-70 text-xs">{user.company || currentUser.company}</p>
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
              {navigationItems.map(item => {
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
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white bg-opacity-10 backdrop-blur rounded-xl p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white text-opacity-70">Total Contacts</p>
                    <p className="text-3xl font-bold text-white">{totalContacts}</p>
                  </div>
                  <Users className="w-8 h-8 text-yellow-400" />
                </div>
              </div>
              
              <div className="bg-white bg-opacity-10 backdrop-blur rounded-xl p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white text-opacity-70">Ideal Clients</p>
                    <p className="text-3xl font-bold text-white">{idealClients}</p>
                  </div>
                  <Target className="w-8 h-8 text-green-400" />
                </div>
              </div>
              
              <div className="bg-white bg-opacity-10 backdrop-blur rounded-xl p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white text-opacity-70">Enriched</p>
                    <p className="text-3xl font-bold text-white">{enrichedContacts}</p>
                  </div>
                  <Sparkles className="w-8 h-8 text-blue-400" />
                </div>
              </div>
              
              <div className="bg-white bg-opacity-10 backdrop-blur rounded-xl p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white text-opacity-70">Referral Partners</p>
                    <p className="text-3xl font-bold text-white">{referralPartners}</p>
                  </div>
                  <UserCheck className="w-8 h-8 text-purple-400" />
                </div>
              </div>
            </div>

            {/* Tasks Section - CHANGE 3: Modified to show ideal client tasks after setup */}
            <div className="bg-white bg-opacity-10 backdrop-blur rounded-xl p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Tasks to do</h2>
              
              {/* Check if all setup tasks are complete */}
              {tasks.some(task => !task.completed) ? (
                // Show setup tasks
                <div className="space-y-3">
                  {tasks.map(task => (
                    <div key={task.id} className="flex items-center space-x-3">
                      <button
                        onClick={() => {
                          setTasks(prev => prev.map(t => 
                            t.id === task.id ? { ...t, completed: !t.completed } : t
                          ));
                        }}
                        className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                          task.completed 
                            ? 'bg-green-500 border-green-500' 
                            : 'border-white border-opacity-50 hover:border-yellow-400'
                        }`}
                      >
                        {task.completed && <Check className="w-3 h-3 text-white" />}
                      </button>
                      <span className={`text-white ${task.completed ? 'line-through opacity-50' : ''}`}>
                        {task.text}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        task.priority === 'high' ? 'bg-red-500 text-white' :
                        task.priority === 'medium' ? 'bg-yellow-500 text-white' :
                        'bg-green-500 text-white'
                      }`}>
                        {task.priority}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                // Show ideal client tasks - CHANGE 3
                (() => {
                  const sortedIdealClients = contacts.filter(c => c.category === 'Ideal Client').sort((a, b) => a.name.localeCompare(b.name));
                  const currentClient = sortedIdealClients[currentIdealClientIndex];
                  
                  if (!currentClient) {
                    return (
                      <div className="text-center py-8">
                        <Users className="w-12 h-12 text-white text-opacity-30 mx-auto mb-4" />
                        <p className="text-white text-opacity-50">
                          No ideal clients found. Upload and categorise your contacts first.
                        </p>
                      </div>
                    );
                  }

                  const clientTasks = contactTasks[currentClient.id] || {};
                  const showFollowUp = shouldShowFollowUp(currentClient.id);
                  const allBasicTasksCompleted = clientTasks.viewProfile?.completed && 
                                                clientTasks.turnOnNotifications?.completed && 
                                                clientTasks.sendMessage?.completed;

                  return (
                    <div className="space-y-4">
                      {/* Progress indicator */}
                      <div className="flex items-center justify-between text-white text-opacity-70 text-sm">
                        <span>Client {currentIdealClientIndex + 1} of {sortedIdealClients.length}</span>
                        <span>{isDirectOutreachCycle ? 'Direct Outreach Cycle' : 'Initial Contact Cycle'}</span>
                      </div>
                      
                      {/* Client info */}
                      <div className="bg-white bg-opacity-10 rounded-lg p-3 mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center">
                            <span className="text-white font-semibold text-sm">
                              {currentClient.name.split(' ').map(n => n[0]).join('')}
                            </span>
                          </div>
                          <div>
                            <p className="text-white font-medium">{currentClient.name}</p>
                            <p className="text-white text-opacity-70 text-sm">
                              {currentClient.position} at {currentClient.company}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Tasks for current client */}
                      <div className="space-y-3">
                        {!isDirectOutreachCycle ? (
                          <>
                            {/* Regular tasks */}
                            <div
                              className="flex items-center space-x-3 cursor-pointer"
                              onClick={() => toggleContactTask(currentClient.id, 'viewProfile')}
                            >
                              <div className="w-5 h-5 rounded border border-white border-opacity-50 flex items-center justify-center">
                                {clientTasks.viewProfile?.completed && (
                                  <Check className="w-3 h-3 text-white" />
                                )}
                              </div>
                              <span className={`text-white ${
                                clientTasks.viewProfile?.completed 
                                  ? 'line-through opacity-50' 
                                  : ''
                              }`}>
                                View profile
                              </span>
                            </div>

                            <div
                              className="flex items-center space-x-3 cursor-pointer"
                              onClick={() => toggleContactTask(currentClient.id, 'turnOnNotifications')}
                            >
                              <div className="w-5 h-5 rounded border border-white border-opacity-50 flex items-center justify-center">
                                {clientTasks.turnOnNotifications?.completed && (
                                  <Check className="w-3 h-3 text-white" />
                                )}
                              </div>
                              <span className={`text-white ${
                                clientTasks.turnOnNotifications?.completed 
                                  ? 'line-through opacity-50' 
                                  : ''
                              }`}>
                                Turn on notifications
                              </span>
                            </div>

                            <div
                              className="flex items-center space-x-3 cursor-pointer"
                              onClick={() => toggleContactTask(currentClient.id, 'sendMessage')}
                            >
                              <div className="w-5 h-5 rounded border border-white border-opacity-50 flex items-center justify-center">
                                {clientTasks.sendMessage?.completed && (
                                  <Check className="w-3 h-3 text-white" />
                                )}
                              </div>
                              <span className={`text-white ${
                                clientTasks.sendMessage?.completed 
                                  ? 'line-through opacity-50' 
                                  : ''
                              }`}>
                                Send message
                              </span>
                            </div>

                            {/* Follow-up task (shows 3 days after message) */}
                            {showFollowUp && (
                              <div
                                className="flex items-center space-x-3 cursor-pointer"
                                onClick={() => toggleContactTask(currentClient.id, 'followUp')}
                              >
                                <div className="w-5 h-5 rounded border border-white border-opacity-50 flex items-center justify-center">
                                  {clientTasks.followUp?.completed && (
                                    <Check className="w-3 h-3 text-white" />
                                  )}
                                </div>
                                <span className={`text-white ${
                                  clientTasks.followUp?.completed 
                                    ? 'line-through opacity-50' 
                                    : ''
                                }`}>
                                  <span className="text-yellow-400">Follow up</span> (3 days after message)
                                </span>
                              </div>
                            )}
                          </>
                        ) : (
                          // Direct outreach cycle
                          <div
                            className="flex items-center space-x-3 cursor-pointer"
                            onClick={() => toggleContactTask(currentClient.id, 'sendDirectSalesMessage')}
                          >
                            <div className="w-5 h-5 rounded border border-white border-opacity-50 flex items-center justify-center">
                              {clientTasks.sendDirectSalesMessage?.completed && (
                                <Check className="w-3 h-3 text-white" />
                              )}
                            </div>
                            <span className={`text-white ${
                              clientTasks.sendDirectSalesMessage?.completed 
                                ? 'line-through opacity-50' 
                                : ''
                            }`}>
                              If no engagement, send direct outreach message
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })()
              )}
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white bg-opacity-10 backdrop-blur rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Upload Contacts</h3>
                <p className="text-white text-opacity-70 mb-4">
                  Import your LinkedIn connections to get started
                </p>
                <label className="block">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-yellow-400 hover:bg-yellow-500 text-purple-900 px-6 py-3 rounded-lg font-medium transition-all flex items-center space-x-2"
                  >
                    <Upload className="w-5 h-5" />
                    <span>Upload CSV</span>
                  </button>
                </label>
              </div>

              <div className="bg-white bg-opacity-10 backdrop-blur rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Build Strategy</h3>
                <p className="text-white text-opacity-70 mb-4">
                  Generate your personalized LinkedIn strategy
                </p>
                <button
                  onClick={() => setCurrentView('strategy')}
                  className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-3 rounded-lg font-medium transition-all flex items-center space-x-2"
                >
                  <Target className="w-5 h-5" />
                  <span>Create Strategy</span>
                </button>
              </div>

              <div className="bg-white bg-opacity-10 backdrop-blur rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Configure Settings</h3>
                <p className="text-white text-opacity-70 mb-4">
                  Set up your business profile for better AI results
                </p>
                <button
                  onClick={() => setCurrentView('settings')}
                  className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-3 rounded-lg font-medium transition-all flex items-center space-x-2"
                >
                  <Settings className="w-5 h-5" />
                  <span>Configure Settings</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Contacts View */}
        {currentView === 'contacts' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold text-white">Contacts</h1>
              <div className="flex items-center space-x-4">
                <button
                  onClick={enrichContacts}
                  className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-medium transition-all flex items-center space-x-2"
                >
                  <Zap className="w-4 h-4" />
                  <span>Enrich Contacts</span>
                </button>
                <button
                  onClick={aiCategorizeAll}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-all flex items-center space-x-2"
                >
                  <Target className="w-4 h-4" />
                  <span>AI Categorize</span>
                </button>
                <label className="block">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-yellow-400 hover:bg-yellow-500 text-purple-900 px-4 py-2 rounded-lg font-medium transition-all flex items-center space-x-2"
                  >
                    <Upload className="w-4 h-4" />
                    <span>Upload CSV</span>
                  </button>
                </label>
              </div>
            </div>

            {/* Search and filter bar */}
            <div className="flex items-center space-x-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white text-opacity-50" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search contacts..."
                  className="w-full pl-10 pr-4 py-2 bg-white bg-opacity-20 text-white placeholder-white placeholder-opacity-50 rounded-lg focus:bg-opacity-30 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                />
              </div>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-4 py-2 bg-white bg-opacity-20 text-white rounded-lg focus:bg-opacity-30 focus:outline-none focus:ring-2 focus:ring-yellow-400"
              >
                <option value="All">All Categories</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Contacts grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredContacts.length === 0 ? (
                <div className="bg-white bg-opacity-10 backdrop-blur rounded-xl p-8 text-center">
                  <Users className="w-12 h-12 text-white text-opacity-50 mx-auto mb-4" />
                  <p className="text-white text-opacity-70">No contacts yet</p>
                  <p className="text-white text-opacity-50 text-sm mt-2">
                    Upload your LinkedIn connections CSV to get started
                  </p>
                </div>
              ) : (
                contacts.map(contact => (
                  <div key={contact.id} className="bg-white bg-opacity-10 backdrop-blur rounded-xl p-6 hover:bg-opacity-20 transition-all">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center">
                          <span className="text-white font-semibold">
                            {contact.name.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                        <div>
                          <h3 className="text-white font-semibold">{contact.name}</h3>
                          <p className="text-white text-opacity-70 text-sm">{contact.position} at {contact.company}</p>
                          <div className="flex items-center space-x-4 mt-1">
                            {contact.phone !== 'Not found' && contact.phone !== 'Search failed' && (
                              <span className="text-white text-opacity-50 text-xs flex items-center space-x-1">
                                <Phone className="w-3 h-3" />
                                <span>{contact.phone}</span>
                              </span>
                            )}
                            {contact.website !== 'Not found' && contact.website !== 'Search failed' && (
                              <span className="text-white text-opacity-50 text-xs flex items-center space-x-1">
                                <Globe className="w-3 h-3" />
                                <span>{contact.website}</span>
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          setSelectedContact(contact);
                          setShowContactModal(true);
                        }}
                        className="text-white hover:text-yellow-400 transition-colors"
                      >
                        <ChevronDown className="w-5 h-5" />
                      </button>
                    </div>
                    <div className="mt-4 flex items-center justify-between">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        contact.category === 'Ideal Client' ? 'bg-green-500 text-white' :
                        contact.category === 'Referral Partners' ? 'bg-blue-500 text-white' :
                        contact.category === 'Competitors' ? 'bg-red-500 text-white' :
                        contact.category === 'Other' ? 'bg-gray-500 text-white' :
                        'bg-gray-600 text-gray-300'
                      }`}>
                        {contact.category}
                      </span>
                      {contact.isEnriched && (
                        <span className="text-yellow-400 text-xs flex items-center space-x-1">
                          <Sparkles className="w-3 h-3" />
                          <span>Enriched</span>
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Strategy View */}
        {currentView === 'strategy' && (
          <div className="space-y-6">
            <h1 className="text-3xl font-bold text-white">LinkedIn Strategy</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Strategy inputs */}
              <div className="bg-white bg-opacity-10 backdrop-blur rounded-xl p-6">
                <h2 className="text-xl font-semibold text-white mb-4">Your Business Details</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-white text-opacity-70 mb-2">What's your ONE offer?</label>
                    <input
                      type="text"
                      value={strategy.oneOffer}
                      onChange={(e) => setStrategy({...strategy, oneOffer: e.target.value})}
                      className="w-full px-4 py-2 bg-white bg-opacity-20 text-white placeholder-white placeholder-opacity-50 rounded-lg focus:bg-opacity-30 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                      placeholder="e.g., LinkedIn ABM consulting for B2B companies"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-white text-opacity-70 mb-2">Who are your ideal referral partners?</label>
                    <input
                      type="text"
                      value={strategy.idealReferralPartners}
                      onChange={(e) => setStrategy({...strategy, idealReferralPartners: e.target.value})}
                      className="w-full px-4 py-2 bg-white bg-opacity-20 text-white placeholder-white placeholder-opacity-50 rounded-lg focus:bg-opacity-30 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                      placeholder="e.g., Business coaches, marketing agencies"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-white text-opacity-70 mb-2">What makes you special?</label>
                    <textarea
                      value={strategy.specialFactors}
                      onChange={(e) => setStrategy({...strategy, specialFactors: e.target.value})}
                      className="w-full px-4 py-2 bg-white bg-opacity-20 text-white placeholder-white placeholder-opacity-50 rounded-lg focus:bg-opacity-30 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                      rows={3}
                      placeholder="e.g., 15 years experience, worked with Fortune 500, unique methodology"
                    />
                  </div>
                  
                  <button
                    onClick={generateStrategy}
                    disabled={!strategy.oneOffer || !strategy.idealReferralPartners || !strategy.specialFactors}
                    className="w-full bg-yellow-400 hover:bg-yellow-500 disabled:bg-gray-500 text-purple-900 px-6 py-3 rounded-lg font-medium transition-all flex items-center justify-center space-x-2"
                  >
                    <Sparkles className="w-5 h-5" />
                    <span>Generate AI Strategy</span>
                  </button>
                </div>
              </div>

              {/* Strategy preview */}
              <div className="bg-white bg-opacity-10 backdrop-blur rounded-xl p-6">
                <h2 className="text-xl font-semibold text-white mb-4">Your LinkedIn Formula Strategy</h2>
                {strategy.generatedStrategy ? (
                  <div className="prose prose-invert max-w-none">
                    <div className="text-white text-opacity-90 whitespace-pre-wrap">
                      {strategy.generatedStrategy}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Target className="w-12 h-12 text-white text-opacity-30 mx-auto mb-4" />
                    <p className="text-white text-opacity-50">
                      Fill in your business details to generate your personalized LinkedIn strategy
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Strategy metrics */}
            {strategy.generatedStrategy && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white bg-opacity-10 backdrop-blur rounded-xl p-6 text-center">
                  <TrendingUp className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
                  <p className="text-3xl font-bold text-white">3x</p>
                  <p className="text-white text-opacity-70">Expected ROI</p>
                </div>
                <div className="bg-white bg-opacity-10 backdrop-blur rounded-xl p-6 text-center">
                  <Calendar className="w-8 h-8 text-green-400 mx-auto mb-2" />
                  <p className="text-3xl font-bold text-white">90</p>
                  <p className="text-white text-opacity-70">Days to Results</p>
                </div>
                <div className="bg-white bg-opacity-10 backdrop-blur rounded-xl p-6 text-center">
                  <Award className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                  <p className="text-3xl font-bold text-white">Top 5%</p>
                  <p className="text-white text-opacity-70">LinkedIn Performance</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Lead Magnets View */}
        {currentView === 'lead-magnets' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold text-white">Lead Magnets</h1>
              <button
                onClick={() => generateLeadMagnet()}
                className="bg-yellow-400 hover:bg-yellow-500 text-purple-900 px-4 py-2 rounded-lg font-medium transition-all flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Create New</span>
              </button>
            </div>

            {leadMagnets.length === 0 ? (
              <div className="bg-white bg-opacity-10 backdrop-blur rounded-xl p-8 text-center">
                <FileText className="w-12 h-12 text-white text-opacity-50 mx-auto mb-4" />
                <p className="text-white text-opacity-70">No lead magnets yet</p>
                <p className="text-white text-opacity-50 text-sm mt-2">
                  Generate your strategy first, then create lead magnets
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {leadMagnets.map(magnet => (
                  <div key={magnet.id} className="bg-white bg-opacity-10 backdrop-blur rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-white mb-2">{magnet.title}</h3>
                    {magnet.isPersonalized && (
                      <div className="mb-3">
                        <span className="text-yellow-400 text-xs flex items-center space-x-1">
                          <Star className="w-3 h-3" />
                          <span>Personalized for {magnet.contactName}</span>
                        </span>
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="text-white text-opacity-50 text-xs">
                        {new Date(magnet.createdAt).toLocaleDateString()}
                      </span>
                      <button
                        onClick={() => {
                          setSelectedLeadMagnet(magnet);
                          setShowLeadMagnetModal(true);
                        }}
                        className="text-yellow-400 hover:text-yellow-300 transition-colors text-sm"
                      >
                        View →
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* CHANGE 2: Tasks View */}
        {currentView === 'tasks' && (
          <div className="space-y-6">
            <h1 className="text-3xl font-bold text-white">Tasks</h1>
            
            {/* Daily Tasks Section */}
            <div className="bg-white bg-opacity-10 backdrop-blur rounded-xl p-6">
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center space-x-2">
                <Calendar className="w-5 h-5 text-yellow-400" />
                <span>Daily Tasks</span>
                <span className="text-sm text-white text-opacity-50">
                  ({new Date().toLocaleDateString()})
                </span>
              </h2>
              
              <div className="space-y-3">
                <div
                  className="flex items-center space-x-3 cursor-pointer group"
                  onClick={() => toggleDailyTask('chooseIdealClients')}
                >
                  <div className="w-5 h-5 rounded border border-white border-opacity-50 flex items-center justify-center">
                    {dailyTasks.chooseIdealClients.completed && (
                      <Check className="w-3 h-3 text-white" />
                    )}
                  </div>
                  <span className={`text-white flex-1 ${
                    dailyTasks.chooseIdealClients.completed 
                      ? 'line-through opacity-50' 
                      : ''
                  }`}>
                    Choose 5 ideal clients to send messages to
                  </span>
                  <span className="text-white text-opacity-50 text-sm">
                    {dailyTasks.chooseIdealClients.count}/{dailyTasks.chooseIdealClients.total}
                  </span>
                </div>

                <div
                  className="flex items-center space-x-3 cursor-pointer group"
                  onClick={() => toggleDailyTask('commentOnPosts')}
                >
                  <div className="w-5 h-5 rounded border border-white border-opacity-50 flex items-center justify-center">
                    {dailyTasks.commentOnPosts.completed && (
                      <Check className="w-3 h-3 text-white" />
                    )}
                  </div>
                  <span className={`text-white flex-1 ${
                    dailyTasks.commentOnPosts.completed 
                      ? 'line-through opacity-50' 
                      : ''
                  }`}>
                    Comment on 5 ideal client posts
                  </span>
                  <span className="text-white text-opacity-50 text-sm">
                    {dailyTasks.commentOnPosts.count}/{dailyTasks.commentOnPosts.total}
                  </span>
                </div>

                <div
                  className="flex items-center space-x-3 cursor-pointer group"
                  onClick={() => toggleDailyTask('postContent')}
                >
                  <div className="w-5 h-5 rounded border border-white border-opacity-50 flex items-center justify-center">
                    {dailyTasks.postContent.completed && (
                      <Check className="w-3 h-3 text-white" />
                    )}
                  </div>
                  <span className={`text-white ${
                    dailyTasks.postContent.completed 
                      ? 'line-through opacity-50' 
                      : ''
                  }`}>
                    Post content
                  </span>
                </div>
              </div>
            </div>

            {/* Contact Specific Tasks Section */}
            <div className="bg-white bg-opacity-10 backdrop-blur rounded-xl p-6">
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center space-x-2">
                <Users className="w-5 h-5 text-yellow-400" />
                <span>Contact Specific Tasks</span>
              </h2>
              
              {taskListClients.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="w-12 h-12 text-white text-opacity-30 mx-auto mb-4" />
                  <p className="text-white text-opacity-50">
                    No ideal clients found. Upload and categorize your contacts first.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {taskListClients.map(client => {
                    const showFollowUp = shouldShowFollowUp(client.id);
                    const followUpCompleted = getTaskStatus(client.id, 'followUp').completed;
                    const allBasicTasksCompleted = getTaskStatus(client.id, 'viewProfile').completed &&
                                                   getTaskStatus(client.id, 'turnOnNotifications').completed &&
                                                   getTaskStatus(client.id, 'sendMessage').completed;
                    
                    return (
                      <div key={client.id} className="bg-white bg-opacity-10 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center">
                              <span className="text-white font-semibold text-sm">
                                {client.name.split(' ').map(n => n[0]).join('')}
                              </span>
                            </div>
                            <div>
                              <p className="text-white font-medium">{client.name}</p>
                              <p className="text-white text-opacity-70 text-sm">
                                {client.position} at {client.company}
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={() => generateLeadMagnet(client.id)}
                            className="text-yellow-400 hover:text-yellow-300 transition-colors text-sm"
                          >
                            Create Lead Magnet
                          </button>
                        </div>
                        
                        <div className="space-y-2">
                          {/* Follow-up task (shows 3 days after message) */}
                          {showFollowUp && !followUpCompleted && (
                            <div
                              className="flex items-center space-x-3 cursor-pointer"
                              onClick={() => toggleContactTask(client.id, 'followUp')}
                            >
                              <div className="w-5 h-5 rounded border border-white border-opacity-50 flex items-center justify-center">
                                {getTaskStatus(client.id, 'followUp').completed && (
                                  <Check className="w-3 h-3 text-white" />
                                )}
                              </div>
                              <span className={`text-white ${
                                getTaskStatus(client.id, 'followUp').completed 
                                  ? 'line-through opacity-50' 
                                  : ''
                              }`}>
                                <span className="text-yellow-400">Follow up</span> (3 days after message)
                              </span>
                            </div>
                          )}
                          
                          {/* Regular tasks */}
                          {!allBasicTasksCompleted && (
                            <>
                              <div
                                className="flex items-center space-x-3 cursor-pointer"
                                onClick={() => toggleContactTask(client.id, 'viewProfile')}
                              >
                                <div className="w-5 h-5 rounded border border-white border-opacity-50 flex items-center justify-center">
                                  {getTaskStatus(client.id, 'viewProfile').completed && (
                                    <Check className="w-3 h-3 text-white" />
                                  )}
                                </div>
                                <span className={`text-white ${
                                  getTaskStatus(client.id, 'viewProfile').completed 
                                    ? 'line-through opacity-50' 
                                    : ''
                                }`}>
                                  View profile
                                </span>
                              </div>

                              <div
                                className="flex items-center space-x-3 cursor-pointer"
                                onClick={() => toggleContactTask(client.id, 'turnOnNotifications')}
                              >
                                <div className="w-5 h-5 rounded border border-white border-opacity-50 flex items-center justify-center">
                                  {getTaskStatus(client.id, 'turnOnNotifications').completed && (
                                    <Check className="w-3 h-3 text-white" />
                                  )}
                                </div>
                                <span className={`text-white ${
                                  getTaskStatus(client.id, 'turnOnNotifications').completed 
                                    ? 'line-through opacity-50' 
                                    : ''
                                }`}>
                                  Turn on notifications
                                </span>
                              </div>

                              <div
                                className="flex items-center space-x-3 cursor-pointer"
                                onClick={() => toggleContactTask(client.id, 'sendMessage')}
                              >
                                <div className="w-5 h-5 rounded border border-white border-opacity-50 flex items-center justify-center">
                                  {getTaskStatus(client.id, 'sendMessage').completed && (
                                    <Check className="w-3 h-3 text-white" />
                                  )}
                                </div>
                                <span className={`text-white ${
                                  getTaskStatus(client.id, 'sendMessage').completed 
                                    ? 'line-through opacity-50' 
                                    : ''
                                }`}>
                                  Send message
                                </span>
                              </div>
                            </>
                          )}
                          
                          {/* Direct sales message for completed cycles */}
                          {completedAllIdealClients && allBasicTasksCompleted && (!showFollowUp || followUpCompleted) && (
                            <div
                              className="flex items-center space-x-3 cursor-pointer"
                              onClick={() => toggleContactTask(client.id, 'sendDirectSalesMessage')}
                            >
                              <div className="w-5 h-5 rounded border border-white border-opacity-50 flex items-center justify-center">
                                {getTaskStatus(client.id, 'sendDirectSalesMessage').completed && (
                                  <Check className="w-3 h-3 text-white" />
                                )}
                              </div>
                              <span className={`text-white ${
                                getTaskStatus(client.id, 'sendDirectSalesMessage').completed 
                                  ? 'line-through opacity-50' 
                                  : ''
                              }`}>
                                If no engagement, send direct outreach message
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Onboarding Progress */}
            <div className="bg-white bg-opacity-10 backdrop-blur rounded-xl p-6">
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-yellow-400" />
                <span>Onboarding Progress</span>
              </h2>
              
              <div className="space-y-3">
                {tasks.map(task => (
                  <div key={task.id} className="flex items-center space-x-3">
                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                      task.completed 
                        ? 'bg-green-500 border-green-500' 
                        : 'border-white border-opacity-50'
                    }`}>
                      {task.completed && <Check className="w-3 h-3 text-white" />}
                    </div>
                    <span className={`text-white ${task.completed ? 'line-through opacity-50' : ''}`}>
                      {task.text}
                    </span>
                  </div>
                ))}
              </div>
              
              <div className="mt-4 pt-4 border-t border-white border-opacity-20">
                <div className="flex items-center justify-between">
                  <span className="text-white text-opacity-70">Overall Progress</span>
                  <span className="text-white font-semibold">
                    {tasks.filter(t => t.completed).length}/{tasks.length} Complete
                  </span>
                </div>
                <div className="mt-2 bg-white bg-opacity-20 rounded-full h-2">
                  <div 
                    className="bg-yellow-400 h-2 rounded-full transition-all"
                    style={{ width: `${(tasks.filter(t => t.completed).length / tasks.length) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Settings View */}
        {currentView === 'settings' && (
          <div className="space-y-6">
            <h1 className="text-3xl font-bold text-white">Settings</h1>
            
            <div className="bg-white bg-opacity-10 backdrop-blur rounded-xl p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Business Profile</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-white text-opacity-70 mb-2">Name</label>
                  <input
                    type="text"
                    value={user.name || currentUser.name}
                    onChange={(e) => setUser({...user, name: e.target.value})}
                    className="w-full px-4 py-2 bg-white bg-opacity-20 text-white placeholder-white placeholder-opacity-50 rounded-lg focus:bg-opacity-30 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  />
                </div>
                
                <div>
                  <label className="block text-white text-opacity-70 mb-2">Email</label>
                  <input
                    type="email"
                    value={user.email || currentUser.email}
                    onChange={(e) => setUser({...user, email: e.target.value})}
                    className="w-full px-4 py-2 bg-white bg-opacity-20 text-white placeholder-white placeholder-opacity-50 rounded-lg focus:bg-opacity-30 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                    disabled
                  />
                </div>
                
                <div>
                  <label className="block text-white text-opacity-70 mb-2">Company</label>
                  <input
                    type="text"
                    value={user.company || currentUser.company}
                    onChange={(e) => setUser({...user, company: e.target.value})}
                    className="w-full px-4 py-2 bg-white bg-opacity-20 text-white placeholder-white placeholder-opacity-50 rounded-lg focus:bg-opacity-30 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  />
                </div>
                
                <div>
                  <label className="block text-white text-opacity-70 mb-2">Business Type</label>
                  <input
                    type="text"
                    value={user.businessType}
                    onChange={(e) => setUser({...user, businessType: e.target.value})}
                    className="w-full px-4 py-2 bg-white bg-opacity-20 text-white placeholder-white placeholder-opacity-50 rounded-lg focus:bg-opacity-30 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                    placeholder="e.g., Financial Services"
                  />
                </div>
                
                <div>
                  <label className="block text-white text-opacity-70 mb-2">Target Market</label>
                  <input
                    type="text"
                    value={user.targetMarket}
                    onChange={(e) => setUser({...user, targetMarket: e.target.value})}
                    className="w-full px-4 py-2 bg-white bg-opacity-20 text-white placeholder-white placeholder-opacity-50 rounded-lg focus:bg-opacity-30 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                    placeholder="e.g., Tech Companies"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-white text-opacity-70 mb-2">Writing Style</label>
                  <input
                    type="text"
                    value={user.writingStyle}
                    onChange={(e) => setUser({...user, writingStyle: e.target.value})}
                    className="w-full px-4 py-2 bg-white bg-opacity-20 text-white placeholder-white placeholder-opacity-50 rounded-lg focus:bg-opacity-30 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                    placeholder="e.g., Professional yet friendly"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-white text-opacity-70 mb-2">Ideal Referral Partners</label>
                  <input
                    type="text"
                    value={user.referralPartners}
                    onChange={(e) => setUser({...user, referralPartners: e.target.value})}
                    className="w-full px-4 py-2 bg-white bg-opacity-20 text-white placeholder-white placeholder-opacity-50 rounded-lg focus:bg-opacity-30 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                    placeholder="e.g., Accountants, Business Coaches"
                  />
                </div>
              </div>
              
              <button
                onClick={() => {
                  setSuccessMessage('Settings saved successfully!');
                  setShowSuccessModal(true);
                  // Mark settings task as complete
                  setTasks(prev => prev.map(task => 
                    task.id === 2 ? { ...task, completed: true } : task
                  ));
                }}
                className="mt-6 bg-yellow-400 hover:bg-yellow-500 text-purple-900 px-6 py-3 rounded-lg font-medium transition-all"
              >
                Save Settings
              </button>
            </div>

            {/* Enrichment Credits */}
            <div className="bg-white bg-opacity-10 backdrop-blur rounded-xl p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Apollo Enrichment Credits</h2>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-bold text-white">{enrichmentsLeft}</p>
                  <p className="text-white text-opacity-70">Credits remaining</p>
                </div>
                <button className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg font-medium transition-all">
                  Buy More Credits
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Contact Details Modal */}
      {showContactModal && selectedContact && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-purple-800 rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Contact Details</h2>
              <button
                onClick={() => setShowContactModal(false)}
                className="text-white hover:text-yellow-400 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Contact header */}
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-xl">
                    {selectedContact.name.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-white">{selectedContact.name}</h3>
                  <p className="text-white text-opacity-70">{selectedContact.position} at {selectedContact.company}</p>
                  <div className={`inline-block mt-2 text-xs px-2 py-1 rounded-full ${
                    selectedContact.category === 'Ideal Client' ? 'bg-green-500 text-white' :
                    selectedContact.category === 'Referral Partners' ? 'bg-blue-500 text-white' :
                    selectedContact.category === 'Competitors' ? 'bg-red-500 text-white' :
                    selectedContact.category === 'Other' ? 'bg-gray-500 text-white' :
                    'bg-gray-600 text-gray-300'
                  }`}>
                    {selectedContact.category}
                  </div>
                </div>
              </div>

              {/* Contact info grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-white text-opacity-70 text-sm">Email</p>
                  <p className="text-white">{selectedContact.email}</p>
                </div>
                <div>
                  <p className="text-white text-opacity-70 text-sm">Status</p>
                  <p className="text-white">{selectedContact.isEnriched ? 'Enriched' : 'Not enriched'}</p>
                </div>
              </div>

              {/* Enrichment Data */}
              {selectedContact.isEnriched && selectedContact.enrichmentData ? (
                <div className="bg-white bg-opacity-10 rounded-lg p-4 space-y-3">
                  <h4 className="text-white font-medium mb-3">Enrichment Data</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <p className="text-white text-opacity-70 text-sm">Industry</p>
                      <p className="text-white">{selectedContact.enrichmentData.industry !== 'Not found' ? selectedContact.enrichmentData.industry : 'Not available'}</p>
                    </div>
                    <div>
                      <p className="text-white text-opacity-70 text-sm">Location</p>
                      <p className="text-white">{selectedContact.enrichmentData.location !== 'Not found' ? selectedContact.enrichmentData.location : 'Not available'}</p>
                    </div>
                    <div>
                      <p className="text-white text-opacity-70 text-sm">Website</p>
                      {selectedContact.enrichmentData.website !== 'Not found' ? (
                        <a 
                          href={selectedContact.enrichmentData.website} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-400 hover:text-blue-300"
                        >
                          {selectedContact.enrichmentData.website}
                        </a>
                      ) : (
                        <p className="text-white">Not available</p>
                      )}
                    </div>
                    <div>
                      <p className="text-white text-opacity-70 text-sm">LinkedIn Profile</p>
                      {selectedContact.enrichmentData.linkedinProfile !== 'Not found' ? (
                        <a 
                          href={selectedContact.enrichmentData.linkedinProfile} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-400 hover:text-blue-300"
                        >
                          View Profile
                        </a>
                      ) : (
                        <p className="text-white">Not available</p>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-white bg-opacity-10 rounded-lg p-4">
                  <p className="text-white text-opacity-70 text-center">Awaiting enrichment</p>
                </div>
              )}

              {/* Category selector */}
              <div>
                <p className="text-white text-opacity-70 text-sm mb-2">Change Category</p>
                <select
                  value={selectedContact.category}
                  onChange={(e) => {
                    const updatedContacts = contacts.map(c => 
                      c.id === selectedContact.id ? { ...c, category: e.target.value } : c
                    );
                    setContacts(updatedContacts);
                    setSelectedContact({ ...selectedContact, category: e.target.value });
                  }}
                  className="w-full px-4 py-2 bg-white bg-opacity-20 text-white rounded-lg focus:bg-opacity-30 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat} className="bg-purple-800">{cat}</option>
                  ))}
                </select>
              </div>

              {/* Action buttons */}
              <div className="flex items-center justify-between pt-4 border-t border-white border-opacity-20">
                <button
                  onClick={() => deleteContact(selectedContact.id)}
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium transition-all flex items-center space-x-2"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete Contact</span>
                </button>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => generateLeadMagnet(selectedContact.id)}
                    className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg font-medium transition-all"
                  >
                    Create Lead Magnet
                  </button>
                  <button
                    onClick={() => setShowContactModal(false)}
                    className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium transition-all"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Loading Modal */}
      {showLoadingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-purple-800 rounded-xl p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-yellow-400 border-t-transparent mx-auto mb-4"></div>
            <p className="text-white text-lg">{loadingMessage}</p>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-purple-800 rounded-xl p-8 text-center">
            <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-4" />
            <p className="text-white text-lg">{successMessage}</p>
            <button
              onClick={() => setShowSuccessModal(false)}
              className="mt-4 bg-yellow-400 hover:bg-yellow-500 text-purple-900 px-6 py-2 rounded-lg font-medium transition-all"
            >
              Continue
            </button>
          </div>
        </div>
      )}

      {/* Lead Magnet Modal */}
      {showLeadMagnetModal && selectedLeadMagnet && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-purple-800 rounded-xl p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-white">{selectedLeadMagnet.title}</h2>
                {selectedLeadMagnet.isPersonalized && (
                  <p className="text-yellow-400 text-sm mt-1">
                    Personalized for {selectedLeadMagnet.contactName}
                  </p>
                )}
              </div>
              <button
                onClick={() => setShowLeadMagnetModal(false)}
                className="text-white hover:text-yellow-400 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="prose prose-invert max-w-none">
              <div className="text-white text-opacity-90 whitespace-pre-wrap">
                {selectedLeadMagnet.content}
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 mt-6 pt-6 border-t border-white border-opacity-20">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(selectedLeadMagnet.content);
                  setSuccessMessage('Content copied to clipboard!');
                  setShowSuccessModal(true);
                }}
                className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg font-medium transition-all flex items-center space-x-2"
              >
                <Copy className="w-4 h-4" />
                <span>Copy Content</span>
              </button>
              <button
                onClick={() => setShowLeadMagnetModal(false)}
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Mock Claude API for development
if (typeof window !== 'undefined' && !window.claude) {
  window.claude = {
    complete: async (prompt, model, maxTokens) => {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Return mock strategy response
      return `**Your LinkedIn Formula Strategy**

**1. Value Proposition**
You provide ${prompt.includes('LinkedIn ABM') ? 'LinkedIn ABM consulting' : 'strategic business solutions'} to ${prompt.includes('B2B') ? 'B2B companies' : 'growing businesses'} with a unique approach that combines AI-powered insights with personalized relationship building.

**2. Ideal Customer Profile**
- Company Size: 50-500 employees
- Industry: Technology, SaaS, Professional Services
- Decision Makers: CEOs, CMOs, VPs of Sales
- Pain Points: Struggling with lead generation, need predictable pipeline

**3. Content Strategy (Weekly)**
Monday: Educational post about ABM best practices
Tuesday: Case study from recent client success
Wednesday: Personal story about business challenges
Thursday: Industry insights and trends
Friday: Direct value post with actionable tips

**4. Profile Optimization**
Headline: "Helping B2B Companies Generate 3x More Qualified Leads Through LinkedIn ABM | £2M+ Pipeline Generated"
About: Focus on transformation stories and specific results
CTA: "Book a free LinkedIn audit → [calendar link]"

**5. Engagement Strategy**
- Comment on 5 ideal client posts daily
- Send 10 personalized connection requests weekly
- Share valuable insights in relevant LinkedIn groups
- Use video messages for high-value prospects

**6. Implementation Plan**
Week 1-2: Profile optimization and content calendar creation
Week 3-4: Begin daily engagement routine
Week 5-6: Launch first campaign to ideal clients
Week 7-8: Analyze results and refine approach

Remember: Success on LinkedIn = Consistency + Value + Authentic Relationships`;
    }
  };
}

// Configure API keys
// Replace 'your-serper-api-key-here' with your actual Serper API key from https://serper.dev
if (typeof window !== 'undefined') {
  window.SERPER_API_KEY = window.SERPER_API_KEY || '3fd5bda7cce79e07cc06e38ad8225c5dab090f4d';
  
  // Alternatively, you can set it via environment variable in your build process:
  // Create a .env file in your project root with:
  // REACT_APP_SERPER_API_KEY=your-actual-serper-api-key
  // Then the app will use process.env.REACT_APP_SERPER_API_KEY
}

export default GlassSlipperApp;