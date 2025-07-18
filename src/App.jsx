import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Mail, Lock, Eye, EyeOff, ArrowRight, Sparkles, Shield, Users, Upload, Target, UserCheck, Building, BarChart3, Calendar, Settings, CheckCircle, User, Briefcase, Plus, TrendingUp, Zap, Menu, FileText, LogOut, X, Loader, Star, Globe, Phone, MapPin, ExternalLink, Play, Pause, Check } from 'lucide-react';

const GlassSlipperApp = () => {
  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authView, setAuthView] = useState('landing'); // landing, login, register
  const [authForm, setAuthForm] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    company: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // User state
  const [user, setUser] = useState({
    name: '',
    email: '',
    company: '',
    businessType: '',
    targetMarket: '',
    writingStyle: '',
    referralPartners: ''
  });

  // Current user (for display purposes)
  const currentUser = {
    name: 'Adam Jones',
    company: 'Demo Company',
    email: 'adam@demo.com'
  };

  // App state
  const [currentView, setCurrentView] = useState('dashboard');
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [contacts, setContacts] = useState([
    {
      id: 1,
      name: 'Nick Teige',
      company: 'Franklyn',
      position: 'Wealth Manager',
      phone: 'Search failed',
      category: 'Uncategorised',
      isEnriched: true,
      enrichmentData: {
        industry: 'Wealth Management - Financial Advice',
        location: 'Cheshire',
        website: 'https://franklyn.co.uk/',
        linkedinProfile: ''
      }
    }
  ]);

  // Contact form state
  const [contactForm, setContactForm] = useState({
    name: '',
    company: '',
    position: '',
    phone: '',
    linkedinProfile: ''
  });

  // File upload states
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef(null);

  // Modal states
  const [selectedContact, setSelectedContact] = useState(null);
  const [showContactModal, setShowContactModal] = useState(false);
  const [showAddContactModal, setShowAddContactModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showLeadMagnetModal, setShowLeadMagnetModal] = useState(false);
  const [selectedLeadMagnet, setSelectedLeadMagnet] = useState(null);
  const [showLoadingModal, setShowLoadingModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('Working on it...');
  const [successMessage, setSuccessMessage] = useState('Success!');

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

  // File upload handler
  const handleFileUpload = useCallback((event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (file.type !== 'text/csv') {
      alert('Please upload a CSV file');
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    // Simulate upload progress
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 90) {
          clearInterval(interval);
          
          // Simulate processing
          setTimeout(() => {
            setUploadProgress(100);
            setTimeout(() => {
              setUploading(false);
              setUploadProgress(0);
              
              // Add some mock contacts
              const mockContacts = [
                { id: Date.now() + 1, name: 'John Smith', company: 'Tech Corp', position: 'CEO', phone: 'Not found', category: 'Uncategorised', isEnriched: false },
                { id: Date.now() + 2, name: 'Sarah Johnson', company: 'Marketing Ltd', position: 'Director', phone: 'Not found', category: 'Uncategorised', isEnriched: false },
                { id: Date.now() + 3, name: 'Michael Chen', company: 'Finance Plus', position: 'CFO', phone: 'Not found', category: 'Uncategorised', isEnriched: false },
                { id: Date.now() + 4, name: 'Emma Wilson', company: 'Design Studio', position: 'Creative Director', phone: 'Not found', category: 'Uncategorised', isEnriched: false },
                { id: Date.now() + 5, name: 'Robert Taylor', company: 'Legal Associates', position: 'Partner', phone: 'Not found', category: 'Uncategorised', isEnriched: false }
              ];
              
              setContacts(prev => [...prev, ...mockContacts]);
              setSuccessMessage('Contacts uploaded successfully!');
              setShowSuccessModal(true);
              
              // Mark task as complete
              setTasks(prev => prev.map(task => 
                task.id === 1 ? { ...task, completed: true } : task
              ));
            }, 500);
          }, 1000);
          
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  }, []);

  // Add contact manually
  const addContact = () => {
    if (!contactForm.name || !contactForm.company || !contactForm.position) {
      alert('Please fill in all required fields');
      return;
    }

    const newContact = {
      id: Date.now(),
      ...contactForm,
      category: 'Uncategorised',
      isEnriched: false
    };

    setContacts(prev => [...prev, newContact]);
    setContactForm({
      name: '',
      company: '',
      position: '',
      phone: '',
      linkedinProfile: ''
    });
    setShowAddContactModal(false);
    setSuccessMessage('Contact added successfully!');
    setShowSuccessModal(true);
  };

  // Update contact category
  const updateCategory = (contactId, newCategory) => {
    setContacts(prev => 
      prev.map(contact => 
        contact.id === contactId 
          ? { ...contact, category: newCategory }
          : contact
      )
    );
  };

  // Enrich single contact
  const enrichContact = async (contactId) => {
    if (enrichmentsLeft <= 0) {
      alert('No enrichments left. Please upgrade your plan.');
      return;
    }

    const contact = contacts.find(c => c.id === contactId);
    if (!contact || contact.isEnriched) return;

    setLoadingMessage(`Enriching ${contact.name}'s profile...`);
    setShowLoadingModal(true);
    
    // Simulate enrichment - in real app this would call Apollo API
    setTimeout(() => {
      setContacts(prev => prev.map(c => 
        c.id === contactId
          ? { 
              ...c, 
              isEnriched: true,
              enrichmentData: {
                industry: 'Technology - Software Development',
                location: 'London, UK',
                website: 'https://example.com',
                linkedinProfile: 'https://linkedin.com/in/example'
              }
            }
          : c
      ));
      
      setEnrichmentsLeft(prev => prev - 1);
      setShowLoadingModal(false);
      setSuccessMessage('Contact enriched successfully!');
      setShowSuccessModal(true);
    }, 2000);
  };

  // Enrich all ideal clients
  const enrichIdealClients = async () => {
    const idealClients = contacts.filter(c => c.category === 'Ideal Client' && !c.isEnriched).slice(0, 50);
    
    if (idealClients.length === 0) {
      alert('No ideal clients to enrich');
      return;
    }

    if (enrichmentsLeft < idealClients.length) {
      alert(`Not enough enrichments left. You have ${enrichmentsLeft} left but need ${idealClients.length}`);
      return;
    }

    setLoadingMessage(`Enriching ${idealClients.length} ideal clients...`);
    setShowLoadingModal(true);
    
    // Simulate batch enrichment
    setTimeout(() => {
      setContacts(prev => prev.map(contact => 
        idealClients.some(ic => ic.id === contact.id)
          ? { 
              ...contact, 
              isEnriched: true,
              enrichmentData: {
                industry: 'Various Industries',
                location: 'UK',
                website: 'https://example.com',
                linkedinProfile: 'https://linkedin.com/in/example'
              }
            }
          : contact
      ));
      
      setEnrichmentsLeft(prev => prev - idealClients.length);
      setShowLoadingModal(false);
      setSuccessMessage(`Successfully enriched ${idealClients.length} ideal clients!`);
      setShowSuccessModal(true);
    }, 3000);
  };

  // AI Categorization helper
  const categorizeContact = (contact) => {
    const { targetMarket, referralPartners, businessType } = user;
    
    if (!targetMarket) return 'Other';
    
    const industry = (contact.enrichmentData?.industry || contact.position || '').toLowerCase();
    const company = (contact.company || '').toLowerCase();
    const position = (contact.position || '').toLowerCase();
    
    // Normalize target market for better matching
    const normalizedTargetMarket = targetMarket.toLowerCase();
    const normalizedReferralPartners = (referralPartners || '').toLowerCase();
    const normalizedBusinessType = (businessType || '').toLowerCase();
    
    // Enhanced matching logic with industry hierarchies and synonyms
    const industryMatches = {
      'professional services': ['consulting', 'advisory', 'legal', 'accounting', 'audit', 'tax', 'hr', 'human resources', 'recruitment', 'marketing', 'advertising', 'pr', 'communications', 'it', 'technology', 'software', 'finance', 'financial', 'wealth', 'investment', 'banking', 'insurance', 'strategy', 'management', 'business', 'operational', 'transformation', 'efficiency'],
      'finance': ['financial', 'wealth', 'investment', 'banking', 'fund', 'capital', 'money', 'treasury', 'insurance', 'pension', 'mortgage'],
      'tech': ['technology', 'software', 'it', 'digital', 'data', 'cloud', 'cyber', 'ai', 'automation', 'saas', 'platform'],
      'healthcare': ['health', 'medical', 'clinical', 'pharmaceutical', 'hospital', 'therapy', 'wellness', 'biotech'],
      'marketing': ['marketing', 'advertising', 'digital', 'social', 'media', 'content', 'brand', 'pr', 'communications', 'creative']
    };
    
    // Function to check if text matches target or referral partners
    const isMatchingIndustry = (text, target) => {
      if (text.includes(target)) return true;
      
      // Check synonyms
      for (const [key, synonyms] of Object.entries(industryMatches)) {
        if (target.includes(key) || synonyms.some(syn => target.includes(syn))) {
          return synonyms.some(syn => text.includes(syn)) || text.includes(key);
        }
      }
      
      // Check if target words appear in text
      const targetWords = target.split(' ');
      return targetWords.some(word => word.length > 2 && text.includes(word));
    };
    
    // Check for ideal client match
    if (isMatchingIndustry(industry, normalizedTargetMarket) || 
        isMatchingIndustry(company, normalizedTargetMarket) ||
        isMatchingIndustry(position, normalizedTargetMarket)) {
      return 'Ideal Client';
    }
    
    // Check for referral partner match
    if (normalizedReferralPartners && 
        (isMatchingIndustry(industry, normalizedReferralPartners) || 
         isMatchingIndustry(company, normalizedReferralPartners) ||
         isMatchingIndustry(position, normalizedReferralPartners))) {
      return 'Referral Partners';
    }
    
    // Check for competitor match (similar to user's business type)
    if (normalizedBusinessType && 
        (isMatchingIndustry(industry, normalizedBusinessType) || 
         isMatchingIndustry(company, normalizedBusinessType) ||
         isMatchingIndustry(position, normalizedBusinessType))) {
      return 'Competitors';
    }
    
    return 'Other';
  };

  // AI Categorize all contacts
  const aiCategorizeAll = () => {
    setLoadingMessage('Categorizing all contacts...');
    setShowLoadingModal(true);
    
    setTimeout(() => {
      setContacts(prev => prev.map(contact => ({
        ...contact,
        category: categorizeContact(contact)
      })));
      
      setShowLoadingModal(false);
      setSuccessMessage('All contacts categorized successfully!');
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

  // Generate generic lead magnet
  const generateGenericLeadMagnet = async () => {
    if (!strategy.oneOffer) {
      alert('Please complete your strategy first to generate a lead magnet');
      setCurrentView('strategy');
      return;
    }

    setLoadingMessage('Generating lead magnet...');
    setShowLoadingModal(true);

    try {
      const prompt = `You are creating a valuable generic lead magnet based on Adam Jones' LinkedIn Formula methodology.

User's Business:
- One Offer: ${strategy.oneOffer}
- Business Type: ${user.businessType}
- Target Market: ${user.targetMarket}
- Writing Style: ${user.writingStyle}
- What Makes Them Special: ${strategy.specialFactors}

Create a HIGH-VALUE lead magnet that can be used for ANY prospect in the ${user.targetMarket} market.

Choose the BEST format:
1. Industry Report/Trends Analysis
2. Ultimate Guide/How-To
3. Checklist/Audit Tool
4. Case Study Compilation
5. Template/Framework

Based on the LinkedIn Formula principles:
- Focus on solving ONE specific problem that's common in ${user.targetMarket}
- Provide genuine value, not just promotion
- Make it actionable and implementable immediately
- Use storytelling to make it engaging
- Address universal pain points for the industry
- Include a clear next step

Create a valuable lead magnet that:
1. Addresses a common problem all ${user.targetMarket} companies face
2. Provides actionable steps they can implement immediately
3. Demonstrates expertise without giving away everything
4. Positions the user as the go-to expert for ${strategy.oneOffer}
5. Includes a soft call-to-action for further help

Write in ${user.writingStyle || 'professional'} tone. Make it broadly applicable to any company in ${user.targetMarket}.

Length: 1000-1500 words of high-value content.

Start with an attention-grabbing title and make it incredibly valuable.`;

      const response = await window.claude.complete(prompt, 'claude-sonnet-4-20250514', 3000);
      
      // Extract title from the response (usually first line)
      const lines = response.split('\n');
      const title = lines[0].replace(/^#+\s*/, '').replace(/[*_]/g, '').trim();
      
      const newGenericLeadMagnet = {
        id: Date.now(),
        title: title || `${user.targetMarket} Industry Guide`,
        description: `A comprehensive guide for ${user.targetMarket} companies`,
        content: response,
        createdAt: new Date().toISOString(),
        isPersonalized: false
      };
      
      setLeadMagnets(prev => [...prev, newGenericLeadMagnet]);
      setSelectedLeadMagnet(newGenericLeadMagnet);
      
      setShowLoadingModal(false);
      setShowLeadMagnetModal(true);
      
      // Mark task as complete if first lead magnet
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

  // Generate lead magnet with real AI
  const generateLeadMagnet = async (contactId) => {
    const contact = contacts.find(c => c.id === contactId);
    if (!contact) return;

    setLoadingMessage('Generating personalized lead magnet...');
    setShowLoadingModal(true);

    try {
      const prompt = `You are creating a valuable lead magnet based on Adam Jones' LinkedIn Formula methodology.

Contact Details:
- Name: ${contact.name}
- Company: ${contact.company}
- Position: ${contact.position}
- Industry: ${contact.enrichmentData?.industry || 'Not specified'}
- Category: ${contact.category}

User's Business:
- One Offer: ${strategy.oneOffer}
- Business Type: ${user.businessType}
- Target Market: ${user.targetMarket}
- Writing Style: ${user.writingStyle}
- What Makes Them Special: ${strategy.specialFactors}

CRITICAL: You must choose the BEST format for this specific contact and their likely problems:

FORMAT OPTION 1 - HOW-TO GUIDE:
Use this format when the contact needs actionable steps to solve a specific problem.
Structure: "X Ways to [Solve Problem]" with numbered steps and explanations.
Best for: Operational issues, process improvements, skill development

FORMAT OPTION 2 - SELF-AUDIT CHECKLIST:
Use this format when the contact needs to assess their current situation first.
Structure: "The [Industry] Audit: Are You Making These Mistakes?" with checkboxes and scoring.
Best for: Strategic assessments, identifying gaps, competitive analysis

CHOOSE THE FORMAT that will be most valuable for ${contact.name} in ${contact.enrichmentData?.industry || 'their industry'} based on their likely pain points.

Based on the LinkedIn Formula principles:
- Focus on solving ONE specific problem
- Provide genuine value, not just promotion
- Make it actionable and implementable immediately
- Use storytelling to make it engaging
- Address specific pain points for their industry/role
- Include a clear next step

Create a valuable lead magnet that:
1. Addresses a specific problem ${contact.name} at ${contact.company} likely faces
2. Provides actionable steps they can implement immediately
3. Demonstrates expertise without giving away everything
4. Positions the user as the go-to expert for ${strategy.oneOffer}
5. Includes a soft call-to-action for further help

Write in ${user.writingStyle || 'professional'} tone. Include specific examples relevant to their ${contact.enrichmentData?.industry || 'industry'}.

Length: 800-1200 words of high-value content.

Start with the chosen format and make it incredibly valuable for their specific situation.`;

      const response = await window.claude.complete(prompt, 'claude-sonnet-4-20250514', 3000);
      
      const newPersonalizedLeadMagnet = {
        id: Date.now(),
        title: `Personalized LinkedIn Strategy for ${contact.name}`,
        description: `A personalized strategy created specifically for ${contact.name} at ${contact.company}`,
        content: response,
        createdAt: new Date().toISOString(),
        isPersonalized: true,
        contactName: contact.name,
        company: contact.company
      };
      
      // Add to the lead magnets array so it appears in the Lead Magnets section
      setLeadMagnets(prev => [...prev, newPersonalizedLeadMagnet]);
      
      // Also set as selected for immediate modal display
      setSelectedLeadMagnet(newPersonalizedLeadMagnet);
      
      setShowLoadingModal(false);
      setShowLeadMagnetModal(true);
      
      // Mark task as complete if first lead magnet
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

              <div className="bg-white bg-opacity-10 backdrop-blur rounded-xl p-6 space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <Shield className="w-6 h-6 text-green-400" />
                    <span className="text-white">Bank-level security</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Sparkles className="w-6 h-6 text-blue-400" />
                    <span className="text-white">50+ enrichments included</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Target className="w-6 h-6 text-yellow-400" />
                    <span className="text-white">Proven ABM methodology</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <button
                    onClick={() => setAuthView('register')}
                    className="w-full py-3 bg-gradient-to-r from-yellow-400 to-yellow-500 text-purple-900 font-semibold rounded-lg hover:from-yellow-500 hover:to-yellow-600 transition-all transform hover:scale-105"
                  >
                    Start Free Trial
                  </button>
                  <button
                    onClick={() => setAuthView('login')}
                    className="w-full py-3 bg-white bg-opacity-10 text-white font-semibold rounded-lg hover:bg-opacity-20 transition-all"
                  >
                    Sign In
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-3xl font-bold text-yellow-400">500+</div>
                  <div className="text-sm text-white text-opacity-70">Active Users</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-yellow-400">92%</div>
                  <div className="text-sm text-white text-opacity-70">Success Rate</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-yellow-400">3x</div>
                  <div className="text-sm text-white text-opacity-70">ROI Average</div>
                </div>
              </div>
            </div>
          )}

          {authView === 'login' && (
            <div className="bg-white bg-opacity-10 backdrop-blur rounded-xl p-8">
              <button
                onClick={() => setAuthView('landing')}
                className="mb-6 text-white text-opacity-70 hover:text-opacity-100 transition-colors"
              >
                ← Back
              </button>
              <h2 className="text-2xl font-bold text-white mb-6">Welcome Back</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-white text-opacity-70 mb-2">Email</label>
                  <input
                    type="email"
                    value={authForm.email}
                    onChange={(e) => setAuthForm({...authForm, email: e.target.value})}
                    className="w-full px-4 py-2 bg-white bg-opacity-20 text-white placeholder-white placeholder-opacity-50 rounded-lg focus:bg-opacity-30 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                    placeholder="your@email.com"
                  />
                </div>
                <div>
                  <label className="block text-white text-opacity-70 mb-2">Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={authForm.password}
                      onChange={(e) => setAuthForm({...authForm, password: e.target.value})}
                      className="w-full px-4 py-2 bg-white bg-opacity-20 text-white placeholder-white placeholder-opacity-50 rounded-lg focus:bg-opacity-30 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white text-opacity-70 hover:text-opacity-100"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
                <button
                  onClick={handleAuth}
                  disabled={!validateAuthForm()}
                  className="w-full py-3 bg-gradient-to-r from-yellow-400 to-yellow-500 text-purple-900 font-semibold rounded-lg hover:from-yellow-500 hover:to-yellow-600 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  Sign In
                </button>
                <p className="text-center text-white text-opacity-70">
                  Don't have an account?{' '}
                  <button onClick={() => setAuthView('register')} className="text-yellow-400 hover:text-yellow-300">
                    Sign up
                  </button>
                </p>
              </div>
            </div>
          )}

          {authView === 'register' && (
            <div className="bg-white bg-opacity-10 backdrop-blur rounded-xl p-8">
              <button
                onClick={() => setAuthView('landing')}
                className="mb-6 text-white text-opacity-70 hover:text-opacity-100 transition-colors"
              >
                ← Back
              </button>
              <h2 className="text-2xl font-bold text-white mb-6">Create Account</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-white text-opacity-70 mb-2">Name</label>
                  <input
                    type="text"
                    value={authForm.name}
                    onChange={(e) => setAuthForm({...authForm, name: e.target.value})}
                    className="w-full px-4 py-2 bg-white bg-opacity-20 text-white placeholder-white placeholder-opacity-50 rounded-lg focus:bg-opacity-30 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                    placeholder="Your Name"
                  />
                </div>
                <div>
                  <label className="block text-white text-opacity-70 mb-2">Company</label>
                  <input
                    type="text"
                    value={authForm.company}
                    onChange={(e) => setAuthForm({...authForm, company: e.target.value})}
                    className="w-full px-4 py-2 bg-white bg-opacity-20 text-white placeholder-white placeholder-opacity-50 rounded-lg focus:bg-opacity-30 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                    placeholder="Your Company"
                  />
                </div>
                <div>
                  <label className="block text-white text-opacity-70 mb-2">Email</label>
                  <input
                    type="email"
                    value={authForm.email}
                    onChange={(e) => setAuthForm({...authForm, email: e.target.value})}
                    className="w-full px-4 py-2 bg-white bg-opacity-20 text-white placeholder-white placeholder-opacity-50 rounded-lg focus:bg-opacity-30 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                    placeholder="your@email.com"
                  />
                </div>
                <div>
                  <label className="block text-white text-opacity-70 mb-2">Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={authForm.password}
                      onChange={(e) => setAuthForm({...authForm, password: e.target.value})}
                      className="w-full px-4 py-2 bg-white bg-opacity-20 text-white placeholder-white placeholder-opacity-50 rounded-lg focus:bg-opacity-30 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white text-opacity-70 hover:text-opacity-100"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-white text-opacity-70 mb-2">Confirm Password</label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={authForm.confirmPassword}
                      onChange={(e) => setAuthForm({...authForm, confirmPassword: e.target.value})}
                      className="w-full px-4 py-2 bg-white bg-opacity-20 text-white placeholder-white placeholder-opacity-50 rounded-lg focus:bg-opacity-30 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white text-opacity-70 hover:text-opacity-100"
                    >
                      {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
                <button
                  onClick={handleAuth}
                  disabled={!validateAuthForm()}
                  className="w-full py-3 bg-gradient-to-r from-yellow-400 to-yellow-500 text-purple-900 font-semibold rounded-lg hover:from-yellow-500 hover:to-yellow-600 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  Create Account
                </button>
                <p className="text-center text-white text-opacity-70">
                  Already have an account?{' '}
                  <button onClick={() => setAuthView('login')} className="text-yellow-400 hover:text-yellow-300">
                    Sign in
                  </button>
                </p>
              </div>
            </div>
          )}
        </div>
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
                <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-purple-900" />
                </div>
                <h1 className="text-xl font-bold text-white">Glass Slipper</h1>
              </div>
              
              {/* Desktop Navigation */}
              <nav className="hidden md:flex space-x-6">
                {navigationItems.map(item => (
                  <button
                    key={item.view}
                    onClick={() => setCurrentView(item.view)}
                    className={`text-white hover:text-yellow-400 transition-colors ${
                      currentView === item.view ? 'text-yellow-400' : ''
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
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

            {/* Onboarding Tasks */}
            <div className="bg-white bg-opacity-10 backdrop-blur rounded-xl p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Getting Started</h2>
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
                  onClick={enrichIdealClients}
                  className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-medium transition-all flex items-center space-x-2"
                >
                  <Zap className="w-4 h-4" />
                  <span>Enrich Ideal Clients</span>
                </button>
                <button
                  onClick={aiCategorizeAll}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-all flex items-center space-x-2"
                >
                  <Target className="w-4 h-4" />
                  <span>AI Categorize All</span>
                </button>
                <button
                  onClick={() => setShowAddContactModal(true)}
                  className="bg-yellow-400 hover:bg-yellow-500 text-purple-900 px-4 py-2 rounded-lg font-medium transition-all flex items-center space-x-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Contact</span>
                </button>
              </div>
            </div>

            {/* Upload Progress */}
            {uploading && (
              <div className="bg-white bg-opacity-10 backdrop-blur rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white">Uploading contacts...</span>
                  <span className="text-white">{uploadProgress}%</span>
                </div>
                <div className="w-full bg-white bg-opacity-20 rounded-full h-2">
                  <div
                    className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
              </div>
            )}

            {/* Enrichments Left */}
            <div className="bg-white bg-opacity-10 backdrop-blur rounded-xl p-4 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Sparkles className="w-5 h-5 text-yellow-400" />
                <span className="text-white">Enrichments Left: <span className="font-bold">{enrichmentsLeft}</span></span>
              </div>
              <button className="text-yellow-400 hover:text-yellow-300 text-sm">
                Upgrade Plan
              </button>
            </div>

            {/* Contacts List */}
            <div className="space-y-4">
              {contacts.length === 0 ? (
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
                            {contact.isEnriched && (
                              <span className="text-green-400 text-xs flex items-center space-x-1">
                                <CheckCircle className="w-3 h-3" />
                                <span>Enriched</span>
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <select
                          value={contact.category}
                          onChange={(e) => updateCategory(contact.id, e.target.value)}
                          className="bg-white bg-opacity-10 text-white text-sm px-3 py-1 rounded-lg focus:bg-opacity-20 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                        >
                          <option value="Uncategorised">Uncategorised</option>
                          <option value="Ideal Client">Ideal Client</option>
                          <option value="Referral Partners">Referral Partners</option>
                          <option value="Competitors">Competitors</option>
                          <option value="Other">Other</option>
                        </select>
                        
                        {!contact.isEnriched && (
                          <button
                            onClick={() => enrichContact(contact.id)}
                            className="text-yellow-400 hover:text-yellow-300 transition-colors"
                            title="Enrich contact"
                          >
                            <Sparkles className="w-5 h-5" />
                          </button>
                        )}
                        
                        <button
                          onClick={() => {
                            setSelectedContact(contact);
                            setShowContactModal(true);
                          }}
                          className="text-white hover:text-yellow-400 transition-colors"
                          title="View details"
                        >
                          <ArrowRight className="w-5 h-5" />
                        </button>
                      </div>
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
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white bg-opacity-10 backdrop-blur rounded-xl p-6">
                <h2 className="text-xl font-semibold text-white mb-4">Strategy Builder</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-white text-opacity-70 mb-2">
                      What's your ONE offer? <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={strategy.oneOffer}
                      onChange={(e) => setStrategy({...strategy, oneOffer: e.target.value})}
                      className="w-full px-4 py-2 bg-white bg-opacity-20 text-white placeholder-white placeholder-opacity-50 rounded-lg focus:bg-opacity-30 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                      placeholder="e.g., CFO services for tech startups"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-white text-opacity-70 mb-2">
                      Who are your ideal referral partners? <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={strategy.idealReferralPartners}
                      onChange={(e) => setStrategy({...strategy, idealReferralPartners: e.target.value})}
                      className="w-full px-4 py-2 bg-white bg-opacity-20 text-white placeholder-white placeholder-opacity-50 rounded-lg focus:bg-opacity-30 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                      placeholder="e.g., Business coaches, Accountants"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-white text-opacity-70 mb-2">
                      What makes you special? <span className="text-red-400">*</span>
                    </label>
                    <textarea
                      value={strategy.specialFactors}
                      onChange={(e) => setStrategy({...strategy, specialFactors: e.target.value})}
                      className="w-full px-4 py-2 bg-white bg-opacity-20 text-white placeholder-white placeholder-opacity-50 rounded-lg focus:bg-opacity-30 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                      placeholder="e.g., 20 years experience, worked with Fortune 500..."
                      rows={3}
                    />
                  </div>
                  
                  <button
                    onClick={generateStrategy}
                    disabled={!strategy.oneOffer || !strategy.idealReferralPartners || !strategy.specialFactors}
                    className="w-full py-3 bg-gradient-to-r from-yellow-400 to-yellow-500 text-purple-900 font-semibold rounded-lg hover:from-yellow-500 hover:to-yellow-600 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center space-x-2"
                  >
                    <Sparkles className="w-5 h-5" />
                    <span>Generate AI Strategy</span>
                  </button>
                </div>
              </div>
              
              <div className="bg-white bg-opacity-10 backdrop-blur rounded-xl p-6">
                <h2 className="text-xl font-semibold text-white mb-4">Your Generated Strategy</h2>
                {strategy.generatedStrategy ? (
                  <div className="text-white text-opacity-90 whitespace-pre-wrap">
                    {strategy.generatedStrategy}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Target className="w-12 h-12 text-white text-opacity-30 mx-auto mb-4" />
                    <p className="text-white text-opacity-50">
                      Fill in the form to generate your personalized LinkedIn strategy
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
            <div className="flex justify-between items-center">
              <h1 className="text-3xl font-bold text-white">Lead Magnets</h1>
              <button 
                onClick={generateGenericLeadMagnet}
                className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-purple-900 px-4 py-2 rounded-lg font-semibold hover:from-yellow-500 hover:to-yellow-600 transition-all"
              >
                <Plus className="w-5 h-5 inline mr-2" />
                Create New
              </button>
            </div>
            
            {leadMagnets.length === 0 ? (
              <div className="bg-white bg-opacity-10 backdrop-blur rounded-xl p-8 text-center">
                <FileText className="w-12 h-12 text-white text-opacity-50 mx-auto mb-4" />
                <p className="text-white text-opacity-70">No lead magnets created yet</p>
                <p className="text-white text-opacity-50 text-sm mt-2">
                  Generate personalized lead magnets from your contacts
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {leadMagnets.map(magnet => (
                  <div key={magnet.id} className="bg-white bg-opacity-10 backdrop-blur rounded-xl p-6 hover:bg-opacity-20 transition-all">
                    <h3 className="text-white font-semibold mb-2">{magnet.title}</h3>
                    <p className="text-white text-opacity-70 text-sm mb-4">{magnet.description}</p>
                    {magnet.isPersonalized && (
                      <div className="mb-4">
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
                <div className="space-y-6">
                  {taskListClients.map(client => {
                    const showFollowUp = shouldShowFollowUp(client.id);
                    const followUpCompleted = getTaskStatus(client.id, 'followUp').completed;
                    const allBasicTasksCompleted = 
                      getTaskStatus(client.id, 'viewProfile').completed &&
                      getTaskStatus(client.id, 'turnOnNotifications').completed &&
                      getTaskStatus(client.id, 'sendMessage').completed;
                    
                    return (
                      <div key={client.id} className="border-l-2 border-purple-600 pl-4">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <h3 className="text-white font-medium">{client.name}</h3>
                            <p className="text-white text-opacity-50 text-sm">
                              {client.position} at {client.company}
                            </p>
                          </div>
                          <button
                            onClick={() => {
                              setSelectedContact(client);
                              setShowContactModal(true);
                            }}
                            className="text-yellow-400 hover:text-yellow-300 transition-colors"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </button>
                        </div>
                        
                        <div className="space-y-2">
                          {/* Show follow-up task first if applicable */}
                          {showFollowUp && (
                            <div
                              className="flex items-center space-x-3 cursor-pointer"
                              onClick={() => toggleContactTask(client.id, 'followUp')}
                            >
                              <div className="w-5 h-5 rounded border border-white border-opacity-50 flex items-center justify-center">
                                {followUpCompleted && (
                                  <Check className="w-3 h-3 text-white" />
                                )}
                              </div>
                              <span className={`text-white ${
                                followUpCompleted ? 'line-through opacity-50' : ''
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
                                <span className="text-purple-400">Send direct sales message</span>
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
          </div>
        )}

        {/* Settings View */}
        {currentView === 'settings' && (
          <div className="space-y-6">
            <h1 className="text-3xl font-bold text-white">Settings</h1>
            
            <div className="bg-white bg-opacity-10 backdrop-blur rounded-xl p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Business Profile</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-white text-opacity-70 mb-2">Your Name</label>
                  <input
                    type="text"
                    value={user.name || currentUser.name}
                    onChange={(e) => setUser({...user, name: e.target.value})}
                    className="w-full px-4 py-2 bg-white bg-opacity-20 text-white placeholder-white placeholder-opacity-50 rounded-lg focus:bg-opacity-30 focus:outline-none focus:ring-2 focus:ring-yellow-400"
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
                className="mt-6 bg-gradient-to-r from-yellow-400 to-yellow-500 text-purple-900 px-6 py-2 rounded-lg font-semibold hover:from-yellow-500 hover:to-yellow-600 transition-all"
              >
                Save Settings
              </button>
            </div>
            
            <div className="bg-white bg-opacity-10 backdrop-blur rounded-xl p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Subscription</h2>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white">Current Plan: <span className="font-semibold">Pro</span></p>
                  <p className="text-white text-opacity-70 text-sm">50 enrichments per month</p>
                </div>
                <button className="text-yellow-400 hover:text-yellow-300 transition-colors">
                  Upgrade Plan →
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Contact Detail Modal */}
      {showContactModal && selectedContact && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setShowContactModal(false)} />
          <div className="relative bg-gradient-to-br from-purple-900 to-indigo-900 rounded-xl shadow-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">{selectedContact.name}</h2>
              <button
                onClick={() => setShowContactModal(false)}
                className="text-white text-opacity-70 hover:text-opacity-100"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-white text-opacity-70 text-sm">Company</p>
                  <p className="text-white font-medium">{selectedContact.company}</p>
                </div>
                <div>
                  <p className="text-white text-opacity-70 text-sm">Position</p>
                  <p className="text-white font-medium">{selectedContact.position}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-white text-opacity-70 text-sm">Category</p>
                  <div className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                    selectedContact.category === 'Ideal Client' ? 'bg-green-500 text-white' :
                    selectedContact.category === 'Referral Partners' ? 'bg-blue-500 text-white' :
                    selectedContact.category === 'Competitors' ? 'bg-red-500 text-white' :
                    selectedContact.category === 'Other' ? 'bg-gray-500 text-white' :
                    'bg-gray-600 text-gray-300'
                  }`}>
                    {selectedContact.category}
                  </div>
                </div>
                <div>
                  <p className="text-white text-opacity-70 text-sm">Status</p>
                  <p className="text-white font-medium">
                    {selectedContact.isEnriched ? 'Enriched' : 'Not Enriched'}
                  </p>
                </div>
              </div>

              {selectedContact.isEnriched && selectedContact.enrichmentData && (
                <div className="bg-white bg-opacity-10 rounded-lg p-4">
                  <h3 className="text-white font-medium mb-3">Enrichment Data</h3>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-white text-opacity-70">Industry</p>
                      <p className="text-white">{selectedContact.enrichmentData.industry}</p>
                    </div>
                    <div>
                      <p className="text-white text-opacity-70">Location</p>
                      <p className="text-white">{selectedContact.enrichmentData.location}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-white text-opacity-70">Website</p>
                      <a
                        href={selectedContact.enrichmentData.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-yellow-400 hover:text-yellow-300"
                      >
                        {selectedContact.enrichmentData.website}
                      </a>
                    </div>
                  </div>
                </div>
              )}

              {/* CHANGE 1: Add task list to contact modal */}
              <div className="mt-6 p-4 bg-white bg-opacity-10 rounded-lg">
                <h3 className="text-white font-medium mb-3">Contact Tasks</h3>
                <div className="space-y-2">
                  <div
                    className="flex items-center space-x-3 cursor-pointer"
                    onClick={() => toggleContactTask(selectedContact.id, 'viewProfile')}
                  >
                    <div className="w-5 h-5 rounded border border-white border-opacity-50 flex items-center justify-center">
                      {getTaskStatus(selectedContact.id, 'viewProfile').completed && (
                        <Check className="w-3 h-3 text-white" />
                      )}
                    </div>
                    <span className={`text-white ${
                      getTaskStatus(selectedContact.id, 'viewProfile').completed 
                        ? 'line-through opacity-50' 
                        : ''
                    }`}>
                      View profile
                    </span>
                  </div>

                  <div
                    className="flex items-center space-x-3 cursor-pointer"
                    onClick={() => toggleContactTask(selectedContact.id, 'turnOnNotifications')}
                  >
                    <div className="w-5 h-5 rounded border border-white border-opacity-50 flex items-center justify-center">
                      {getTaskStatus(selectedContact.id, 'turnOnNotifications').completed && (
                        <Check className="w-3 h-3 text-white" />
                      )}
                    </div>
                    <span className={`text-white ${
                      getTaskStatus(selectedContact.id, 'turnOnNotifications').completed 
                        ? 'line-through opacity-50' 
                        : ''
                    }`}>
                      Turn on notifications
                    </span>
                  </div>

                  <div
                    className="flex items-center space-x-3 cursor-pointer"
                    onClick={() => toggleContactTask(selectedContact.id, 'sendMessage')}
                  >
                    <div className="w-5 h-5 rounded border border-white border-opacity-50 flex items-center justify-center">
                      {getTaskStatus(selectedContact.id, 'sendMessage').completed && (
                        <Check className="w-3 h-3 text-white" />
                      )}
                    </div>
                    <span className={`text-white ${
                      getTaskStatus(selectedContact.id, 'sendMessage').completed 
                        ? 'line-through opacity-50' 
                        : ''
                    }`}>
                      Send message
                    </span>
                  </div>

                  {/* Show follow-up task if applicable */}
                  {shouldShowFollowUp(selectedContact.id) && (
                    <div
                      className="flex items-center space-x-3 cursor-pointer"
                      onClick={() => toggleContactTask(selectedContact.id, 'followUp')}
                    >
                      <div className="w-5 h-5 rounded border border-white border-opacity-50 flex items-center justify-center">
                        {getTaskStatus(selectedContact.id, 'followUp').completed && (
                          <Check className="w-3 h-3 text-white" />
                        )}
                      </div>
                      <span className={`text-white ${
                        getTaskStatus(selectedContact.id, 'followUp').completed 
                          ? 'line-through opacity-50' 
                          : ''
                      }`}>
                        <span className="text-yellow-400">Follow up</span> (3 days after message)
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex space-x-3 mt-6">
                <button
                  onClick={() => generateLeadMagnet(selectedContact.id)}
                  className="flex-1 bg-gradient-to-r from-yellow-400 to-yellow-500 text-purple-900 py-2 rounded-lg font-semibold hover:from-yellow-500 hover:to-yellow-600 transition-all flex items-center justify-center space-x-2"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Generate Lead Magnet</span>
                </button>
                
                <button
                  onClick={() => {
                    if (confirm(`Are you sure you want to delete ${selectedContact.name}?`)) {
                      deleteContact(selectedContact.id);
                    }
                  }}
                  className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-all"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Contact Modal */}
      {showAddContactModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setShowAddContactModal(false)} />
          <div className="relative bg-gradient-to-br from-purple-900 to-indigo-900 rounded-xl shadow-2xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Add New Contact</h2>
              <button
                onClick={() => setShowAddContactModal(false)}
                className="text-white text-opacity-70 hover:text-opacity-100"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-white text-opacity-90 text-sm font-medium mb-2">
                  Name *
                </label>
                <input
                  type="text"
                  value={contactForm.name}
                  onChange={(e) => setContactForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full bg-white bg-opacity-20 border border-white border-opacity-30 rounded-lg p-3 text-white placeholder-white placeholder-opacity-50 focus:outline-none focus:border-yellow-400"
                  placeholder="John Smith"
                />
              </div>

              <div>
                <label className="block text-white text-opacity-90 text-sm font-medium mb-2">
                  Company *
                </label>
                <input
                  type="text"
                  value={contactForm.company}
                  onChange={(e) => setContactForm(prev => ({ ...prev, company: e.target.value }))}
                  className="w-full bg-white bg-opacity-20 border border-white border-opacity-30 rounded-lg p-3 text-white placeholder-white placeholder-opacity-50 focus:outline-none focus:border-yellow-400"
                  placeholder="Acme Corp"
                />
              </div>

              <div>
                <label className="block text-white text-opacity-90 text-sm font-medium mb-2">
                  Position *
                </label>
                <input
                  type="text"
                  value={contactForm.position}
                  onChange={(e) => setContactForm(prev => ({ ...prev, position: e.target.value }))}
                  className="w-full bg-white bg-opacity-20 border border-white border-opacity-30 rounded-lg p-3 text-white placeholder-white placeholder-opacity-50 focus:outline-none focus:border-yellow-400"
                  placeholder="CEO"
                />
              </div>

              <div>
                <label className="block text-white text-opacity-90 text-sm font-medium mb-2">
                  Phone
                </label>
                <input
                  type="tel"
                  value={contactForm.phone}
                  onChange={(e) => setContactForm(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full bg-white bg-opacity-20 border border-white border-opacity-30 rounded-lg p-3 text-white placeholder-white placeholder-opacity-50 focus:outline-none focus:border-yellow-400"
                  placeholder="+1 (555) 123-4567"
                />
              </div>

              <div>
                <label className="block text-white text-opacity-90 text-sm font-medium mb-2">
                  LinkedIn Profile
                </label>
                <input
                  type="url"
                  value={contactForm.linkedinProfile}
                  onChange={(e) => setContactForm(prev => ({ ...prev, linkedinProfile: e.target.value }))}
                  className="w-full bg-white bg-opacity-20 border border-white border-opacity-30 rounded-lg p-3 text-white placeholder-white placeholder-opacity-50 focus:outline-none focus:border-yellow-400"
                  placeholder="https://linkedin.com/in/johnsmith"
                />
              </div>

              <button
                onClick={addContact}
                disabled={!contactForm.name || !contactForm.company || !contactForm.position}
                className={`w-full py-3 rounded-lg font-medium transition-all ${
                  contactForm.name && contactForm.company && contactForm.position
                    ? 'bg-yellow-400 hover:bg-yellow-500 text-purple-900'
                    : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                }`}
              >
                Add Contact
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lead Magnet Modal */}
      {showLeadMagnetModal && selectedLeadMagnet && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setShowLeadMagnetModal(false)} />
          <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-2xl font-bold text-gray-900">{selectedLeadMagnet.title}</h2>
              <button
                onClick={() => setShowLeadMagnetModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              <div className="prose max-w-none">
                <div className="whitespace-pre-wrap text-gray-700">
                  {selectedLeadMagnet.content}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Loading Modal */}
      {showLoadingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black bg-opacity-50" />
          <div className="relative bg-white rounded-xl shadow-2xl p-8 flex flex-col items-center space-y-4">
            <Loader className="w-12 h-12 text-purple-600 animate-spin" />
            <p className="text-lg font-medium text-gray-900">{loadingMessage}</p>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setShowSuccessModal(false)} />
          <div className="relative bg-white rounded-xl shadow-2xl p-8 flex flex-col items-center space-y-4">
            <CheckCircle className="w-12 h-12 text-green-500" />
            <p className="text-lg font-medium text-gray-900">{successMessage}</p>
            <button
              onClick={() => setShowSuccessModal(false)}
              className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg font-medium transition-all"
            >
              Continue
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default GlassSlipperApp;