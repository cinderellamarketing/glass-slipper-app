import React, { useState, useCallback, useEffect } from 'react';
import { Upload, User, Home, MessageSquare, UserCheck, Sparkles, Shield, Globe, Award, Users, ChevronRight, Check, X, Plus, Trash2, Edit2, RefreshCw, Mail, ExternalLink, Calendar, Phone, Building, Briefcase, Clock, CheckCircle, Info, Download, Search, Filter, TrendingUp, Target, BookOpen, Star, DollarSign, AlertCircle, ChevronDown } from 'lucide-react';

export default function GlassSlipperApp() {
  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authView, setAuthView] = useState('landing'); // 'landing', 'login', 'register'
  const [authForm, setAuthForm] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    company: ''
  });

  // User profile
  const [user, setUser] = useState({
    name: 'Adam Jones',
    email: 'adam@example.com',
    company: 'Jones Consulting',
    businessType: 'Financial Services',
    targetMarket: 'Tech Companies',
    writingStyle: 'Professional yet friendly',
    referralPartners: 'Accountants, Business Coaches'
  });

  // Navigation state
  const [currentView, setCurrentView] = useState('dashboard');
  
  // Contact management state
  const [contacts, setContacts] = useState([
    { id: 1, name: 'Emily Chen', company: 'TechStart Inc', position: 'CEO', phone: '+1-555-0123', linkedinUrl: 'https://linkedin.com/in/emilychen', category: 'Ideal Client', isEnriched: true, enrichmentData: { website: 'https://techstart.com', employees: '50-200', industry: 'Technology', revenue: '$5M-$10M', technologies: ['React', 'AWS', 'Python'], decisionMakers: 3, recentActivity: 'Raised Series A funding' } },
    { id: 2, name: 'Michael Brown', company: 'Growth Marketing Ltd', position: 'Marketing Director', phone: 'Not found', linkedinUrl: 'https://linkedin.com/in/michaelbrown', category: 'Referral Partners', isEnriched: false }
  ]);

  // Current user for demo
  const currentUser = {
    name: 'Adam Jones',
    email: 'adam@example.com',
    company: 'Jones Consulting'
  };

  // UI state
  const [selectedContact, setSelectedContact] = useState(null);
  const [showContactModal, setShowContactModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [successMessage, setSuccessMessage] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLeadMagnet, setSelectedLeadMagnet] = useState(null);
  const [showLeadMagnetModal, setShowLeadMagnetModal] = useState(false);
  const [showLoadingModal, setShowLoadingModal] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');

  // Strategy state
  const [strategy, setStrategy] = useState({
    oneOffer: '',
    idealReferralPartners: '',
    specialFactors: '',
    generatedStrategy: ''
  });

  // Lead magnets state
  const [leadMagnets, setLeadMagnets] = useState([
    {
      id: 1,
      title: 'LinkedIn Strategy Guide',
      description: 'A comprehensive guide to building your LinkedIn presence',
      content: 'This is where the full lead magnet content would go...',
      createdAt: new Date().toISOString(),
      isPersonalized: false
    }
  ]);

  // Enrichment counter
  const [enrichmentsLeft, setEnrichmentsLeft] = useState(50);

  // Task management
  const [tasks, setTasks] = useState([
    { id: 1, text: 'Complete your strategy section', completed: false, priority: 'high' },
    { id: 2, text: 'Upload your LinkedIn connections', completed: false, priority: 'high' },
    { id: 3, text: 'Set up your business profile', completed: false, priority: 'medium' },
    { id: 4, text: 'Create your first lead magnet', completed: false, priority: 'medium' },
    { id: 5, text: 'Enrich your ideal clients', completed: false, priority: 'low' }
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
                { id: Date.now() + 2, name: 'Sarah Johnson', company: 'Marketing Ltd', position: 'Director', phone: 'Not found', category: 'Uncategorised', isEnriched: false }
              ];
              
              setContacts(prev => [...prev, ...mockContacts]);
              setSuccessMessage('Contacts uploaded successfully!');
              
              setTimeout(() => setSuccessMessage(''), 3000);
            }, 500);
          }, 1000);
          
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  }, []);

  // Category update handler
  const updateCategory = (contactId, newCategory) => {
    setContacts(prev => 
      prev.map(contact => 
        contact.id === contactId 
          ? { ...contact, category: newCategory }
          : contact
      )
    );
  };

  // Contact enrichment handler
  const enrichContact = async (contactId) => {
    if (enrichmentsLeft <= 0) {
      alert('No enrichments left. Please upgrade your plan.');
      return;
    }

    const contact = contacts.find(c => c.id === contactId);
    if (!contact || contact.isEnriched) return;

    setLoadingMessage(`Enriching ${contact.name}'s profile...`);
    setShowLoadingModal(true);

    // Simulate enrichment process
    setTimeout(() => {
      const industries = ['Technology', 'Finance', 'Healthcare', 'Retail', 'Manufacturing', 'Education'];
      const technologies = [
        ['React', 'Node.js', 'AWS', 'Python'],
        ['Salesforce', 'HubSpot', 'Tableau'],
        ['Azure', 'Docker', 'Kubernetes'],
        ['Java', 'Spring', 'Oracle'],
        ['SAP', 'Microsoft 365', 'Power BI']
      ];

      const enrichmentData = {
        website: `https://${contact.company.toLowerCase().replace(/\s+/g, '')}.com`,
        employees: ['10-50', '50-200', '200-500', '500-1000'][Math.floor(Math.random() * 4)],
        industry: industries[Math.floor(Math.random() * industries.length)],
        revenue: ['$1M-$5M', '$5M-$10M', '$10M-$50M', '$50M-$100M'][Math.floor(Math.random() * 4)],
        technologies: technologies[Math.floor(Math.random() * technologies.length)],
        decisionMakers: Math.floor(Math.random() * 5) + 1,
        recentActivity: [
          'Posted about digital transformation',
          'Hiring for senior positions',
          'Launched new product line',
          'Expanded to new markets',
          'Raised funding round'
        ][Math.floor(Math.random() * 5)]
      };

      setContacts(prev =>
        prev.map(c =>
          c.id === contactId
            ? { ...c, isEnriched: true, enrichmentData }
            : c
        )
      );

      setEnrichmentsLeft(prev => prev - 1);
      setShowLoadingModal(false);
      setSuccessMessage(`Successfully enriched ${contact.name}'s profile!`);
      setTimeout(() => setSuccessMessage(''), 3000);
    }, 2000);
  };

  // Generate strategy with AI
  const generateAIStrategy = async () => {
    if (!strategy.oneOffer) {
      alert('Please fill in your one offer first');
      return;
    }

    setLoadingMessage('Generating your personalized strategy...');
    setShowLoadingModal(true);

    try {
      // In a real app, this would call your AI API
      // For demo, we'll simulate with a timeout
      setTimeout(() => {
        const generatedStrategy = `Based on your focus on "${strategy.oneOffer}" for ${user.targetMarket}, here's your LinkedIn strategy:

1. **Profile Optimization**: Position yourself as the go-to expert for ${strategy.oneOffer} in the ${user.targetMarket} industry.

2. **Content Strategy**: Share weekly insights about ${strategy.oneOffer}, focusing on problems specific to ${user.targetMarket}.

3. **Connection Strategy**: Connect with 20 ${user.targetMarket} decision-makers weekly who could benefit from ${strategy.oneOffer}.

4. **Engagement Strategy**: Comment on posts from ${user.targetMarket} leaders, adding value related to ${strategy.oneOffer}.

5. **Referral Partner Strategy**: Build relationships with ${strategy.idealReferralPartners || 'complementary service providers'} who serve ${user.targetMarket}.

${strategy.specialFactors ? `\n6. **Unique Positioning**: Leverage your ${strategy.specialFactors} to stand out in the ${user.targetMarket} space.` : ''}`;

        setStrategy(prev => ({ ...prev, generatedStrategy }));
        setShowLoadingModal(false);
        setSuccessMessage('Strategy generated successfully!');
        setTimeout(() => setSuccessMessage(''), 3000);
      }, 3000);
    } catch (error) {
      setShowLoadingModal(false);
      alert('Failed to generate strategy. Please try again.');
    }
  };

  // Lead magnet generation with real AI
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
    } catch (error) {
      console.error('Lead magnet generation failed:', error);
      setShowLoadingModal(false);
      alert('Failed to generate lead magnet. Please try again.');
    }
  };

  // Filtered contacts based on search and category
  const filteredContacts = contacts.filter(contact => {
    const matchesSearch = contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         contact.company.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || contact.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Auto-categorization logic
  const autoCategorizeContacts = () => {
    setLoadingMessage('Auto-categorizing contacts...');
    setShowLoadingModal(true);

    setTimeout(() => {
      const targetIndustries = {
        'finance': ['bank', 'investment', 'financial', 'capital', 'wealth', 'insurance', 'accounting', 'audit', 'tax', 'money', 'fund', 'asset', 'pension', 'mortgage', 'loan', 'treasury', 'risk', 'compliance', 'fintech'],
        'marketing': ['advertising', 'digital', 'social media', 'seo', 'ppc', 'content', 'brand', 'pr', 'communications', 'media', 'creative', 'campaign', 'growth', 'acquisition', 'engagement', 'analytics'],
        'tech': ['technology', 'software', 'IT', 'development', 'programming', 'data', 'analytics', 'cloud', 'cybersecurity', 'ai', 'automation', 'saas', 'platform', 'infrastructure', 'devops'],
        'consulting': ['advisory', 'consultant', 'strategy', 'management', 'business', 'operational', 'transformation', 'efficiency', 'change', 'process', 'improvement', 'optimization'],
        'healthcare': ['medical', 'health', 'pharmaceutical', 'clinical', 'hospital', 'doctor', 'nurse', 'therapy', 'wellness', 'biotech', 'diagnostics', 'treatment'],
        'education': ['training', 'learning', 'academic', 'university', 'school', 'teaching', 'course', 'certification', 'elearning', 'coaching', 'development'],
        'retail': ['ecommerce', 'shopping', 'commerce', 'sales', 'store', 'merchandise', 'consumer', 'customer', 'marketplace', 'distribution'],
        'manufacturing': ['production', 'industrial', 'factory', 'supply', 'logistics', 'operations', 'quality', 'assembly', 'fabrication', 'processing'],
        'legal': ['law', 'attorney', 'lawyer', 'solicitor', 'barrister', 'litigation', 'contracts', 'compliance', 'regulatory', 'intellectual property'],
        'hr': ['human resources', 'recruitment', 'staffing', 'talent', 'workforce', 'payroll', 'benefits', 'training', 'development', 'culture']
      };
      
      // Function to check if text matches target market or its synonyms
      const isMatchingIndustry = (text, target) => {
        // Direct match
        if (text.includes(target.toLowerCase())) return true;
        
        // Check industry synonyms
        for (const [industry, keywords] of Object.entries(targetIndustries)) {
          if (industry === target.toLowerCase() || target.toLowerCase().includes(industry)) {
            return keywords.some(keyword => text.includes(keyword));
          }
        }
        
        // Check if any keyword group matches both the text and target
        for (const keywords of Object.values(targetIndustries)) {
          const textMatches = keywords.some(keyword => text.includes(keyword));
          const targetMatches = keywords.some(keyword => target.toLowerCase().includes(keyword));
          if (textMatches && targetMatches) return true;
        }
        
        return false;
      };

      // Function to check if position indicates decision maker
      const isDecisionMaker = (position) => {
        const decisionMakerTitles = ['ceo', 'cfo', 'cto', 'coo', 'cmo', 'founder', 'owner', 'president', 'director', 'head', 'vp', 'vice president', 'partner', 'managing', 'chief', 'executive'];
        return decisionMakerTitles.some(title => position.includes(title));
      };

      const referralKeywords = ['coach', 'consultant', 'advisor', 'accountant', 'lawyer', 'attorney', 'broker', 'agent'];
      const supplierKeywords = ['vendor', 'supplier', 'provider', 'software', 'solutions', 'services', 'tools', 'platform'];

      setContacts(prev => prev.map(contact => {
        if (contact.category !== 'Uncategorised') return contact;

        const lowerCompany = contact.company.toLowerCase();
        const lowerPosition = contact.position.toLowerCase();
        const targetMarketLower = user.targetMarket.toLowerCase();

        // Check for ideal client match
        const matchesTargetMarket = isMatchingIndustry(lowerCompany, targetMarketLower) || 
                                  isMatchingIndustry(lowerPosition, targetMarketLower);
        
        const hasDecisionMakingRole = isDecisionMaker(lowerPosition);

        if (matchesTargetMarket && hasDecisionMakingRole) {
          return { ...contact, category: 'Ideal Client' };
        }

        // Check for referral partners
        const isReferralPartner = referralKeywords.some(keyword => 
          lowerPosition.includes(keyword) || lowerCompany.includes(keyword)
        );

        if (isReferralPartner) {
          return { ...contact, category: 'Referral Partners' };
        }

        // Check for suppliers
        const isSupplier = supplierKeywords.some(keyword => 
          lowerCompany.includes(keyword) || lowerPosition.includes(keyword)
        );

        if (isSupplier) {
          return { ...contact, category: 'Suppliers' };
        }

        // Default to Other if no match
        return { ...contact, category: 'Other' };
      }));

      setShowLoadingModal(false);
      setSuccessMessage('Contacts categorized successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    }, 2000);
  };

  // Stats calculations
  const totalContacts = contacts.length;
  const idealClients = contacts.filter(c => c.category === 'Ideal Client').length;
  const enrichedContacts = contacts.filter(c => c.isEnriched).length;
  const referralPartners = contacts.filter(c => c.category === 'Referral Partners').length;

  // Top 5 tasks
  const topTasks = tasks.filter(t => !t.completed).slice(0, 5);

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
                    <Globe className="w-6 h-6 text-blue-400" />
                    <span className="text-white">50+ enrichments included</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Award className="w-6 h-6 text-yellow-400" />
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
                  <input
                    type="password"
                    value={authForm.password}
                    onChange={(e) => setAuthForm({...authForm, password: e.target.value})}
                    className="w-full px-4 py-2 bg-white bg-opacity-20 text-white placeholder-white placeholder-opacity-50 rounded-lg focus:bg-opacity-30 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                    placeholder="••••••••"
                  />
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
                  <input
                    type="password"
                    value={authForm.password}
                    onChange={(e) => setAuthForm({...authForm, password: e.target.value})}
                    className="w-full px-4 py-2 bg-white bg-opacity-20 text-white placeholder-white placeholder-opacity-50 rounded-lg focus:bg-opacity-30 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                    placeholder="••••••••"
                  />
                </div>
                <div>
                  <label className="block text-white text-opacity-70 mb-2">Confirm Password</label>
                  <input
                    type="password"
                    value={authForm.confirmPassword}
                    onChange={(e) => setAuthForm({...authForm, confirmPassword: e.target.value})}
                    className="w-full px-4 py-2 bg-white bg-opacity-20 text-white placeholder-white placeholder-opacity-50 rounded-lg focus:bg-opacity-30 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                    placeholder="••••••••"
                  />
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
      {/* Success Message */}
      {successMessage && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-fade-in">
          {successMessage}
        </div>
      )}

      {/* Loading Modal */}
      {showLoadingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 max-w-sm w-full">
            <div className="flex flex-col items-center space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
              <p className="text-gray-700 text-center">{loadingMessage}</p>
            </div>
          </div>
        </div>
      )}

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
              
              <nav className="hidden md:flex space-x-6">
                <button
                  onClick={() => setCurrentView('dashboard')}
                  className={`text-white hover:text-yellow-400 transition-colors ${currentView === 'dashboard' ? 'text-yellow-400' : ''}`}
                >
                  Dashboard
                </button>
                <button
                  onClick={() => setCurrentView('contacts')}
                  className={`text-white hover:text-yellow-400 transition-colors ${currentView === 'contacts' ? 'text-yellow-400' : ''}`}
                >
                  Contacts
                </button>
                <button
                  onClick={() => setCurrentView('strategy')}
                  className={`text-white hover:text-yellow-400 transition-colors ${currentView === 'strategy' ? 'text-yellow-400' : ''}`}
                >
                  Strategy
                </button>
                <button
                  onClick={() => setCurrentView('leadMagnets')}
                  className={`text-white hover:text-yellow-400 transition-colors ${currentView === 'leadMagnets' ? 'text-yellow-400' : ''}`}
                >
                  Lead Magnets
                </button>
                <button
                  onClick={() => setCurrentView('tasks')}
                  className={`text-white hover:text-yellow-400 transition-colors ${currentView === 'tasks' ? 'text-yellow-400' : ''}`}
                >
                  Tasks
                </button>
                <button
                  onClick={() => setCurrentView('profile')}
                  className={`text-white hover:text-yellow-400 transition-colors ${currentView === 'profile' ? 'text-yellow-400' : ''}`}
                >
                  Profile
                </button>
              </nav>
            </div>

            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-white text-sm">{user.name}</p>
                <p className="text-white text-opacity-70 text-xs">{user.company}</p>
              </div>
              <button
                onClick={handleLogout}
                className="text-white hover:text-yellow-400 transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white bg-opacity-10 backdrop-blur rounded-xl p-6">
                <h2 className="text-xl font-semibold text-white mb-4">Quick Actions</h2>
                <div className="space-y-3">
                  <button
                    onClick={() => setCurrentView('contacts')}
                    className="w-full text-left px-4 py-3 bg-white bg-opacity-10 hover:bg-opacity-20 rounded-lg transition-all flex items-center justify-between group"
                  >
                    <span className="text-white">Upload LinkedIn Connections</span>
                    <Upload className="w-5 h-5 text-yellow-400 group-hover:translate-x-1 transition-transform" />
                  </button>
                  <button
                    onClick={() => setCurrentView('strategy')}
                    className="w-full text-left px-4 py-3 bg-white bg-opacity-10 hover:bg-opacity-20 rounded-lg transition-all flex items-center justify-between group"
                  >
                    <span className="text-white">Create Your Strategy</span>
                    <Target className="w-5 h-5 text-yellow-400 group-hover:translate-x-1 transition-transform" />
                  </button>
                  <button
                    onClick={() => setCurrentView('leadMagnets')}
                    className="w-full text-left px-4 py-3 bg-white bg-opacity-10 hover:bg-opacity-20 rounded-lg transition-all flex items-center justify-between group"
                  >
                    <span className="text-white">Generate Lead Magnets</span>
                    <BookOpen className="w-5 h-5 text-yellow-400 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>

              <div className="bg-white bg-opacity-10 backdrop-blur rounded-xl p-6">
                <h2 className="text-xl font-semibold text-white mb-4">Top Tasks</h2>
                <div className="space-y-3">
                  {topTasks.map(task => (
                    <div key={task.id} className="flex items-center justify-between">
                      <span className="text-white text-opacity-90">{task.text}</span>
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
            </div>

            {/* Activity Feed */}
            <div className="bg-white bg-opacity-10 backdrop-blur rounded-xl p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Recent Activity</h2>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span className="text-white text-opacity-90">Connected with Emily Chen from TechStart Inc</span>
                  <span className="text-white text-opacity-50 text-sm">2 hours ago</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                  <span className="text-white text-opacity-90">Enriched 5 new contacts</span>
                  <span className="text-white text-opacity-50 text-sm">5 hours ago</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                  <span className="text-white text-opacity-90">Generated lead magnet for Michael Brown</span>
                  <span className="text-white text-opacity-50 text-sm">1 day ago</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {currentView === 'contacts' && (
          <div className="space-y-6">
            {/* Header with Upload and Filters */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h2 className="text-2xl font-bold text-white">Contacts</h2>
              <div className="flex flex-wrap gap-3">
                <label className="relative cursor-pointer bg-gradient-to-r from-yellow-400 to-yellow-500 text-purple-900 px-4 py-2 rounded-lg font-semibold hover:from-yellow-500 hover:to-yellow-600 transition-all transform hover:scale-105">
                  <input
                    type="file"
                    className="sr-only"
                    accept=".csv"
                    onChange={handleFileUpload}
                    disabled={uploading}
                  />
                  <span className="flex items-center space-x-2">
                    <Upload className="w-4 h-4" />
                    <span>Upload CSV</span>
                  </span>
                </label>
                
                <button
                  onClick={autoCategorizeContacts}
                  className="bg-purple-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-purple-700 transition-all flex items-center space-x-2"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Auto-Categorize</span>
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

            {/* Search and Filter */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white text-opacity-50 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search contacts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-white bg-opacity-10 text-white placeholder-white placeholder-opacity-50 rounded-lg focus:bg-opacity-20 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <Filter className="text-white text-opacity-70 w-5 h-5" />
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="bg-white bg-opacity-10 text-white px-4 py-2 rounded-lg focus:bg-opacity-20 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                >
                  <option value="all">All Categories</option>
                  <option value="Ideal Client">Ideal Clients</option>
                  <option value="Referral Partners">Referral Partners</option>
                  <option value="Suppliers">Suppliers</option>
                  <option value="Other">Other</option>
                  <option value="Uncategorised">Uncategorised</option>
                </select>
              </div>
            </div>

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
              {filteredContacts.length === 0 ? (
                <div className="bg-white bg-opacity-10 backdrop-blur rounded-xl p-8 text-center">
                  <Users className="w-12 h-12 text-white text-opacity-50 mx-auto mb-4" />
                  <p className="text-white text-opacity-70">No contacts found</p>
                  <p className="text-white text-opacity-50 text-sm mt-2">
                    Upload your LinkedIn connections CSV to get started
                  </p>
                </div>
              ) : (
                filteredContacts.map(contact => (
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
                            {contact.phone !== 'Not found' && (
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
                          <option value="Suppliers">Suppliers</option>
                          <option value="Other">Other</option>
                        </select>
                        
                        {!contact.isEnriched && (
                          <button
                            onClick={() => enrichContact(contact.id)}
                            className="text-yellow-400 hover:text-yellow-300 transition-colors"
                            title="Enrich contact"
                          >
                            <RefreshCw className="w-5 h-5" />
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
                          <ChevronRight className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {currentView === 'strategy' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white">Your LinkedIn Strategy</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white bg-opacity-10 backdrop-blur rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Strategy Builder</h3>
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
                      Who are your ideal referral partners?
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
                      What makes you special?
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
                    onClick={generateAIStrategy}
                    disabled={!strategy.oneOffer}
                    className="w-full py-3 bg-gradient-to-r from-yellow-400 to-yellow-500 text-purple-900 font-semibold rounded-lg hover:from-yellow-500 hover:to-yellow-600 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center space-x-2"
                  >
                    <Sparkles className="w-5 h-5" />
                    <span>Generate AI Strategy</span>
                  </button>
                </div>
              </div>
              
              <div className="bg-white bg-opacity-10 backdrop-blur rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Your Generated Strategy</h3>
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

        {currentView === 'leadMagnets' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-white">Lead Magnets</h2>
              <button className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-purple-900 px-4 py-2 rounded-lg font-semibold hover:from-yellow-500 hover:to-yellow-600 transition-all">
                <Plus className="w-5 h-5 inline mr-2" />
                Create New
              </button>
            </div>
            
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
          </div>
        )}

        {currentView === 'tasks' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white">Tasks</h2>
            
            {/* Daily Tasks Section */}
            <div className="bg-white bg-opacity-10 backdrop-blur rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
                <Calendar className="w-5 h-5 text-yellow-400" />
                <span>Daily Tasks</span>
                <span className="text-sm text-white text-opacity-50">
                  ({new Date().toLocaleDateString()})
                </span>
              </h3>
              
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
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
                <Users className="w-5 h-5 text-yellow-400" />
                <span>Contact Specific Tasks</span>
              </h3>
              
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
                            <h4 className="text-white font-medium">{client.name}</h4>
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

        {currentView === 'profile' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white">Business Profile</h2>
            
            <div className="bg-white bg-opacity-10 backdrop-blur rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Your Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-white text-opacity-70 mb-2">Name</label>
                  <input
                    type="text"
                    value={user.name}
                    onChange={(e) => setUser({...user, name: e.target.value})}
                    className="w-full px-4 py-2 bg-white bg-opacity-20 text-white placeholder-white placeholder-opacity-50 rounded-lg focus:bg-opacity-30 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  />
                </div>
                
                <div>
                  <label className="block text-white text-opacity-70 mb-2">Company</label>
                  <input
                    type="text"
                    value={user.company}
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
              
              <button className="mt-6 bg-gradient-to-r from-yellow-400 to-yellow-500 text-purple-900 px-6 py-2 rounded-lg font-semibold hover:from-yellow-500 hover:to-yellow-600 transition-all">
                Save Changes
              </button>
            </div>
            
            <div className="bg-white bg-opacity-10 backdrop-blur rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Subscription</h3>
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

      {/* Contact Modal */}
      {showContactModal && selectedContact && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-purple-800 bg-opacity-90 backdrop-blur rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-white">{selectedContact.name}</h3>
                <button
                  onClick={() => setShowContactModal(false)}
                  className="text-white hover:text-yellow-400 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-white text-opacity-70 text-sm">Position</p>
                    <p className="text-white">{selectedContact.position}</p>
                  </div>
                  <div>
                    <p className="text-white text-opacity-70 text-sm">Company</p>
                    <p className="text-white">{selectedContact.company}</p>
                  </div>
                  <div>
                    <p className="text-white text-opacity-70 text-sm">Phone</p>
                    <p className="text-white">{selectedContact.phone}</p>
                  </div>
                  <div>
                    <p className="text-white text-opacity-70 text-sm">Category</p>
                    <p className="text-white">{selectedContact.category}</p>
                  </div>
                </div>
                
                <div className="flex space-x-3">
                  <a
                    href={selectedContact.linkedinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition-all flex items-center justify-center space-x-2"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>View LinkedIn</span>
                  </a>
                  <button
                    onClick={() => generateLeadMagnet(selectedContact.id)}
                    className="flex-1 bg-gradient-to-r from-yellow-400 to-yellow-500 text-purple-900 py-2 rounded-lg font-semibold hover:from-yellow-500 hover:to-yellow-600 transition-all flex items-center justify-center space-x-2"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Generate Lead Magnet</span>
                  </button>
                </div>
              </div>
              
              {selectedContact.isEnriched && selectedContact.enrichmentData && (
                <div className="mt-6 p-4 bg-white bg-opacity-10 rounded-lg">
                  <h4 className="text-white font-medium mb-3">Enrichment Data</h4>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-white text-opacity-70">Industry</p>
                      <p className="text-white">{selectedContact.enrichmentData.industry}</p>
                    </div>
                    <div>
                      <p className="text-white text-opacity-70">Employees</p>
                      <p className="text-white">{selectedContact.enrichmentData.employees}</p>
                    </div>
                    <div>
                      <p className="text-white text-opacity-70">Revenue</p>
                      <p className="text-white">{selectedContact.enrichmentData.revenue}</p>
                    </div>
                    <div>
                      <p className="text-white text-opacity-70">Decision Makers</p>
                      <p className="text-white">{selectedContact.enrichmentData.decisionMakers}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-white text-opacity-70">Technologies</p>
                      <p className="text-white">{selectedContact.enrichmentData.technologies.join(', ')}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-white text-opacity-70">Recent Activity</p>
                      <p className="text-white">{selectedContact.enrichmentData.recentActivity}</p>
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
            </div>
          </div>
        </div>
      )}

      {/* Lead Magnet Modal */}
      {showLeadMagnetModal && selectedLeadMagnet && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-semibold text-gray-800">{selectedLeadMagnet.title}</h3>
                  {selectedLeadMagnet.isPersonalized && (
                    <p className="text-yellow-600 text-sm mt-1">
                      Personalized for {selectedLeadMagnet.contactName} at {selectedLeadMagnet.company}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => setShowLeadMagnetModal(false)}
                  className="text-gray-500 hover:text-gray-700 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="prose max-w-none">
                <div className="whitespace-pre-wrap text-gray-700">
                  {selectedLeadMagnet.content}
                </div>
              </div>
              
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => {
                    // In a real app, this would copy to clipboard
                    alert('Lead magnet copied to clipboard!');
                  }}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-all"
                >
                  Copy to Clipboard
                </button>
                <button
                  onClick={() => {
                    // In a real app, this would download the content
                    alert('Lead magnet downloaded!');
                  }}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all flex items-center space-x-2"
                >
                  <Download className="w-4 h-4" />
                  <span>Download</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}