import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Mail, Lock, Eye, EyeOff, ArrowRight, Sparkles, Shield, Users, Upload, Target, UserCheck, Building, BarChart3, Calendar, Settings, CheckCircle, User, Briefcase, Plus, TrendingUp, Zap, Menu, FileText, LogOut, ChevronRight, X, MessageSquare, Copy } from 'lucide-react';

export default function GlassSlipperApp() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentView, setCurrentView] = useState('login');
  const [selectedContact, setSelectedContact] = useState(null);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showPasswordLogin, setShowPasswordLogin] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const fileInputRef = useRef(null);

  // Sample user for the app
  const [currentUser] = useState({
    name: 'Alex Johnson',
    company: 'Johnson Consulting'
  });

  // Change 2 additions - Enhanced contact management
  const [maxEnrichments] = useState(100);
  const [enrichmentsUsed, setEnrichmentsUsed] = useState(0);

  // Change 3 additions - Setup task tracking and progression
  const [setupTasks, setSetupTasks] = useState([
    { id: 'complete-strategy', text: 'Complete strategy section', completed: false },
    { id: 'complete-business-info', text: 'Complete business information in settings', completed: false },
    { id: 'upload-linkedin', text: 'Upload LinkedIn connection', completed: false },
    { id: 'categorise-contacts', text: 'Categorise contacts', completed: false },
    { id: 'enrich-ideal-clients', text: 'Enrich ideal clients', completed: false }
  ]);

  const [setupComplete, setSetupComplete] = useState(false);

  // Change 4 additions - Messages functionality
  const [copyFeedback, setCopyFeedback] = useState('');

  // Change 6 additions - Writing style analysis
  const [writingQuestions, setWritingQuestions] = useState({
    business: '',
    hobby: '',
    story: ''
  });
  const [writingStyle, setWritingStyle] = useState(null);
  const [isAnalysing, setIsAnalysing] = useState(false);
  const [showWritingStyleModal, setShowWritingStyleModal] = useState(false);

  // Contact filter state
  const [contactFilter, setContactFilter] = useState('all');

  // Message generation state
  const [generatedMessage, setGeneratedMessage] = useState('');
  const [isGeneratingMessage, setIsGeneratingMessage] = useState(false);

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
  const enrichmentsLeft = maxEnrichments - enrichmentsUsed;

  // Task management state (Change 1 additions)
  const [dailyTasks, setDailyTasks] = useState([
    { id: 'send-messages', text: 'Send 5 messages', completed: false },
    { id: 'comment-posts', text: 'Comment on 5 ideal client posts', completed: false },
    { id: 'post-content', text: 'Post content', completed: false }
  ]);

  const [contactTasks, setContactTasks] = useState({}); // Object with contactId as key
  const [allDailyTasksComplete, setAllDailyTasksComplete] = useState(false);

  // Task management
  const [tasks, setTasks] = useState([
    { id: 1, text: 'Complete your strategy section', completed: false, priority: 'high' },
    { id: 2, text: 'Upload your LinkedIn connections', completed: false, priority: 'high' },
    { id: 3, text: 'Set up your business profile', completed: false, priority: 'medium' },
    { id: 4, text: 'Create your first lead magnet', completed: false, priority: 'medium' },
    { id: 5, text: 'Enrich your ideal clients', completed: false, priority: 'low' }
  ]);

  // User state
  const [user, setUser] = useState({
    name: '',
    email: '',
    company: '',
    industry: '',
    businessStage: ''
  });

  // Sample contacts data with enhanced fields for Change 2
  const [contacts, setContacts] = useState([
    {
      id: 1,
      firstName: 'Sarah',
      lastName: 'Smith',
      company: 'TechCorp Industries',
      position: 'CEO',
      email: 'sarah@techcorp.com',
      category: 'Ideal Client',
      notes: '',
      enriched: true,
      linkedinUrl: 'https://linkedin.com/in/sarahsmith',
      companySize: '100-500',
      industry: 'Technology',
      location: 'London, UK'
    },
    {
      id: 2,
      firstName: 'Mike',
      lastName: 'Johnson',
      company: 'Innovation Labs',
      position: 'Founder',
      email: 'mike@innovationlabs.com',
      category: 'Referral Partner',
      notes: '',
      enriched: false,
      linkedinUrl: 'https://linkedin.com/in/mikejohnson',
      companySize: '10-50',
      industry: 'Consulting',
      location: 'Manchester, UK'
    },
    {
      id: 3,
      firstName: 'Emma',
      lastName: 'Davis',
      company: 'Growth Solutions',
      position: 'Marketing Director',
      email: 'emma@growthsolutions.com',
      category: 'Ideal Client',
      notes: '',
      enriched: true,
      linkedinUrl: 'https://linkedin.com/in/emmadavis',
      companySize: '50-100',
      industry: 'Marketing',
      location: 'Birmingham, UK'
    }
  ]);

  // Load daily tasks from localStorage on component mount (Change 1 addition)
  useEffect(() => {
    if (isAuthenticated) {
      const today = new Date().toDateString();
      const lastLoginDate = localStorage.getItem('lastLoginDate');
      const storedTasks = localStorage.getItem('dailyTasks');
      
      if (lastLoginDate === today && storedTasks) {
        // Same day login, load saved tasks
        const savedTasks = JSON.parse(storedTasks);
        setDailyTasks(savedTasks);
        
        // Check if all tasks are complete
        const allComplete = savedTasks.every(task => task.completed);
        setAllDailyTasksComplete(allComplete);
      } else {
        // First login of the day, reset tasks
        const resetTasks = [
          { id: 'send-messages', text: 'Send 5 messages', completed: false },
          { id: 'comment-posts', text: 'Comment on 5 ideal client posts', completed: false },
          { id: 'post-content', text: 'Post content', completed: false }
        ];
        setDailyTasks(resetTasks);
        setAllDailyTasksComplete(false);
        
        // Save new login date and reset tasks
        localStorage.setItem('lastLoginDate', today);
        localStorage.setItem('dailyTasks', JSON.stringify(resetTasks));
      }
    }
  }, [isAuthenticated]);

  // Save daily tasks to localStorage whenever they change (Change 1 addition)
  useEffect(() => {
    if (isAuthenticated) {
      localStorage.setItem('dailyTasks', JSON.stringify(dailyTasks));
      localStorage.setItem('lastLoginDate', new Date().toDateString());
      
      // Check if all daily tasks are complete
      const allComplete = dailyTasks.every(task => task.completed);
      setAllDailyTasksComplete(allComplete);
    }
  }, [dailyTasks, isAuthenticated]);

  // Check if setup is complete whenever setup tasks change (Change 3 addition)
  useEffect(() => {
    const allSetupComplete = setupTasks.every(task => task.completed);
    setSetupComplete(allSetupComplete);
  }, [setupTasks]);

  // Load saved writing style from localStorage (Change 6 addition)
  useEffect(() => {
    if (isAuthenticated) {
      const savedWritingStyle = localStorage.getItem('userWritingStyle');
      if (savedWritingStyle) {
        try {
          const parsedStyle = JSON.parse(savedWritingStyle);
          setWritingStyle(parsedStyle);
        } catch (error) {
          console.error('Error loading saved writing style:', error);
        }
      }
    }
  }, [isAuthenticated]);

  // Reset contact filter when switching views
  useEffect(() => {
    if (currentView !== 'contacts') {
      setContactFilter('all');
    }
  }, [currentView]);

  // Helper function to calculate business days between two dates (Change 1 addition)
  const getBusinessDaysBetween = (startDate, endDate) => {
    let count = 0;
    const currentDate = new Date(startDate);
    
    while (currentDate < endDate) {
      const dayOfWeek = currentDate.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) { // Not Sunday (0) or Saturday (6)
        count++;
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return count;
  };

  // Function to get contact-specific tasks for a contact (Change 5 addition)
  const getContactTasks = (contactId) => {
    const contactTaskList = contactTasks[contactId] || {
      viewProfile: { completed: false, completedDate: null },
      turnOnNotifications: { completed: false, completedDate: null },
      sendMessage: { completed: false, completedDate: null },
      followUp: { completed: false, completedDate: null },
      directOutreach: { completed: false, completedDate: null }
    };

    // Check if this contact has completed the initial 4 tasks
    const initialTasksComplete = contactTaskList.viewProfile.completed && 
                                contactTaskList.turnOnNotifications.completed && 
                                contactTaskList.sendMessage.completed && 
                                contactTaskList.followUp.completed;

    // Check if follow-up should be visible (3 business days after send message)
    let showFollowUp = false;
    if (contactTaskList.sendMessage.completed && contactTaskList.sendMessage.completedDate) {
      const completedDate = new Date(contactTaskList.sendMessage.completedDate);
      const currentDate = new Date();
      const businessDaysBetween = getBusinessDaysBetween(completedDate, currentDate);
      showFollowUp = businessDaysBetween >= 3;
    }

    // If initial tasks are complete, show only direct outreach task
    if (initialTasksComplete) {
      return [
        { key: 'directOutreach', label: 'Send direct outreach message', completed: contactTaskList.directOutreach.completed, completedDate: contactTaskList.directOutreach.completedDate }
      ];
    }

    // Otherwise show the normal progression
    const tasks = [
      { key: 'viewProfile', label: 'View their profile', completed: contactTaskList.viewProfile.completed, completedDate: contactTaskList.viewProfile.completedDate },
      { key: 'turnOnNotifications', label: 'Turn on notifications', completed: contactTaskList.turnOnNotifications.completed, completedDate: contactTaskList.turnOnNotifications.completedDate },
      { key: 'sendMessage', label: 'Send message', completed: contactTaskList.sendMessage.completed, completedDate: contactTaskList.sendMessage.completedDate }
    ];

    if (showFollowUp) {
      tasks.push({ key: 'followUp', label: 'Follow up message', completed: contactTaskList.followUp.completed, completedDate: contactTaskList.followUp.completedDate });
    }

    return tasks;
  };

  // Function to get contact-specific tasks for 5 most recent ideal clients (Change 1 addition)
  const getContactSpecificTasks = () => {
    const idealClients = contacts
      .filter(c => c.category === 'Ideal Client')
      .sort((a, b) => b.id - a.id) // Most recently added first
      .slice(0, 5);

    if (idealClients.length === 0) {
      return [];
    }

    const tasksList = [];
    
    idealClients.forEach(contact => {
      const contactTaskList = contactTasks[contact.id] || {
        viewProfile: { completed: false, completedDate: null },
        turnOnNotifications: { completed: false, completedDate: null },
        sendMessage: { completed: false, completedDate: null },
        followUp: { completed: false, completedDate: null },
        directOutreach: { completed: false, completedDate: null }
      };

      // Check if initial 4 tasks are completed
      const initialTasksComplete = contactTaskList.viewProfile.completed && 
                                  contactTaskList.turnOnNotifications.completed && 
                                  contactTaskList.sendMessage.completed && 
                                  contactTaskList.followUp.completed;

      // Check if follow-up should be visible (3 business days after send message)
      let showFollowUp = false;
      if (contactTaskList.sendMessage.completed && contactTaskList.sendMessage.completedDate) {
        const completedDate = new Date(contactTaskList.sendMessage.completedDate);
        const currentDate = new Date();
        const businessDaysBetween = getBusinessDaysBetween(completedDate, currentDate);
        showFollowUp = businessDaysBetween >= 3;
      }

      // If initial tasks are complete, show direct outreach task
      if (initialTasksComplete) {
        const tasks = [
          { key: 'directOutreach', label: 'Send direct outreach message', completed: contactTaskList.directOutreach.completed }
        ];
        tasksList.push({ contact, tasks });
      } else {
        // Show normal progression
        const tasks = [
          { key: 'viewProfile', label: 'View their profile', completed: contactTaskList.viewProfile.completed },
          { key: 'turnOnNotifications', label: 'Turn on notifications', completed: contactTaskList.turnOnNotifications.completed },
          { key: 'sendMessage', label: 'Send message', completed: contactTaskList.sendMessage.completed }
        ];

        if (showFollowUp) {
          tasks.push({ key: 'followUp', label: 'Follow up message', completed: contactTaskList.followUp.completed });
        }

        tasksList.push({ contact, tasks });
      }
    });

    return tasksList;
  };

  // Function to complete daily task (Change 1 addition)
  const completeDailyTask = (taskId) => {
    setDailyTasks(prevTasks => 
      prevTasks.map(task => 
        task.id === taskId 
          ? { ...task, completed: !task.completed }
          : task
      )
    );
  };

  // Function to complete contact task (Change 1 addition)
  const completeContactTask = (contactId, taskKey) => {
    setContactTasks(prevTasks => {
      const contactTaskList = prevTasks[contactId] || {
        viewProfile: { completed: false, completedDate: null },
        turnOnNotifications: { completed: false, completedDate: null },
        sendMessage: { completed: false, completedDate: null },
        followUp: { completed: false, completedDate: null },
        directOutreach: { completed: false, completedDate: null }
      };

      const updatedTask = {
        completed: !contactTaskList[taskKey].completed,
        completedDate: !contactTaskList[taskKey].completed ? new Date().toISOString() : null
      };

      return {
        ...prevTasks,
        [contactId]: {
          ...contactTaskList,
          [taskKey]: updatedTask
        }
      };
    });
  };

  // Function to validate writing questions (Change 6 addition)
  const validateWritingQuestions = () => {
    const { business, hobby, story } = writingQuestions;
    
    if (!business.trim()) {
      alert('Please complete the business description before continuing.');
      return false;
    }
    if (!hobby.trim()) {
      alert('Please complete the hobby section before continuing.');
      return false;
    }
    if (!story.trim()) {
      alert('Please complete your story before continuing.');
      return false;
    }
    
    return true;
  };

  // Function to analyse writing style using Claude (Change 6 addition)
  const analyseWritingStyle = async () => {
    if (!validateWritingQuestions()) return;
    
    setIsAnalysing(true);
    
    try {
      const prompt = `Analyse the writing style from these three writing samples and provide a detailed style profile:

Business Description:
"${writingQuestions.business}"

Hobby Writing:
"${writingQuestions.hobby}"

Personal Story:
"${writingQuestions.story}"

Please analyse and provide a comprehensive writing style profile including:
1. Tone (formal/casual/conversational/professional)
2. Voice characteristics (authoritative/friendly/personal/educational)
3. Sentence structure preferences (short/long/varied)
4. Language complexity level
5. Personality that comes through
6. Communication style preferences
7. Key phrases or expressions they use
8. Overall writing strengths
9. British vs American English preferences (if detectable)

Respond with a JSON object in this exact format:
{
  "tone": "description of tone",
  "voice": "description of voice characteristics", 
  "sentenceStructure": "description of sentence preferences",
  "complexity": "description of language complexity",
  "personality": "description of personality that shows through",
  "communicationStyle": "description of communication preferences",
  "keyPhrases": ["phrase1", "phrase2", "phrase3"],
  "strengths": ["strength1", "strength2", "strength3"],
  "britishPreference": "whether they use British or American English naturally",
  "summary": "A brief 2-3 sentence summary of their unique writing style"
}

Your entire response MUST be valid JSON only, with no additional text or formatting. Use British English throughout.`;

      // Simulate Claude API call (in real implementation, this would call window.claude.complete)
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const analysisResult = {
        tone: "Professional yet approachable, with a conversational warmth",
        voice: "Authoritative but friendly, with educational undertones and personal authenticity",
        sentenceStructure: "Balanced mix of short punchy statements and longer explanatory sentences",
        complexity: "Moderate complexity with clear explanations, accessible to broad audiences",
        personality: "Confident and knowledgeable whilst remaining humble and relatable",
        communicationStyle: "Direct and action-oriented with supportive guidance",
        keyPhrases: ["let's dive in", "here's the thing", "practical approach"],
        strengths: ["Clear communication", "Engaging storytelling", "Professional credibility"],
        britishPreference: "Shows preference for British English spelling and phrasing",
        summary: "Your writing style combines professional expertise with genuine warmth and clarity. You have a gift for making complex topics accessible whilst maintaining authority and trustworthiness."
      };
      
      setWritingStyle(analysisResult);
      setShowWritingStyleModal(true);
      
      // Save to localStorage
      localStorage.setItem('userWritingStyle', JSON.stringify(analysisResult));
      
    } catch (error) {
      console.error('Error analysing writing style:', error);
      alert('Sorry, there was an error analysing your writing style. Please try again.');
    } finally {
      setIsAnalysing(false);
    }
  };

  const handleLogin = (e) => {
    if (e) e.preventDefault();
    setIsAuthenticated(true);
    setCurrentView('dashboard');
  };

  const handleSignUp = (e) => {
    if (e) e.preventDefault();
    setIsAuthenticated(true);
    setCurrentView('dashboard');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentView('login');
    setShowMobileMenu(false);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file && file.type === 'text/csv') {
      console.log('File uploaded:', file.name);
    }
  };

  const addContact = () => {
    const newContact = {
      id: Date.now(),
      firstName: 'New',
      lastName: 'Contact',
      company: 'Company Name',
      position: 'Position',
      email: 'email@company.com',
      category: 'Uncategorised',
      notes: '',
      enriched: false,
      linkedinUrl: '',
      companySize: '',
      industry: '',
      location: ''
    };
    setContacts([...contacts, newContact]);
  };

  const deleteContact = (id) => {
    setContacts(contacts.filter(contact => contact.id !== id));
    if (selectedContact && selectedContact.id === id) {
      setSelectedContact(null);
    }
  };

  const updateContact = (id, updates) => {
    setContacts(contacts.map(contact => 
      contact.id === id ? { ...contact, ...updates } : contact
    ));
    if (selectedContact && selectedContact.id === id) {
      setSelectedContact({ ...selectedContact, ...updates });
    }
  };

  // Clear generated message when contact modal closes
  useEffect(() => {
    if (!selectedContact) {
      setGeneratedMessage('');
    }
  }, [selectedContact]);

  const enrichContact = async (id) => {
    if (enrichmentsLeft <= 0) return;

    const contact = contacts.find(c => c.id === id);
    if (!contact || contact.enriched) return;

    // Simulate enrichment process
    await new Promise(resolve => setTimeout(resolve, 2000));

    const enrichedData = {
      enriched: true,
      companySize: '50-200',
      industry: 'Technology',
      location: 'London, UK'
    };

    updateContact(id, enrichedData);
    setEnrichmentsUsed(prev => prev + 1);
  };

  // Function to generate personalized message for contact
  const generateContactMessage = async (contact) => {
    setIsGeneratingMessage(true);
    
    try {
      // Get the most recent personalized lead magnet or use the default one
      const personalizedLeadMagnet = leadMagnets.find(lm => lm.isPersonalized) || leadMagnets[0];
      
      // Use the contact's industry or default to their company type
      const industry = contact.industry || 'business';
      
      // Get user name from user state or default
      const userName = user.name || currentUser.name || 'Best regards';
      
      // Create the exact template format as specified
      const messageTemplate = `Hi ${contact.firstName}, Hope you're doing well! I've just put together a quick guide that might be useful - "${personalizedLeadMagnet.title}". ${personalizedLeadMagnet.description}. Thought it might be handy given we're both in the ${industry} world. Happy to send it over if you'd like a copy? No sales pitch attached - just sharing something that might help! Best, ${userName}`;
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setGeneratedMessage(messageTemplate);
      
    } catch (error) {
      console.error('Error generating message:', error);
      alert('Sorry, there was an error generating the message. Please try again.');
    } finally {
      setIsGeneratingMessage(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopyFeedback('Copied!');
    setTimeout(() => setCopyFeedback(''), 2000);
  };

  // Login/Signup Page
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="bg-white bg-opacity-10 backdrop-blur rounded-xl p-8 text-white">
            <div className="text-center mb-8">
              <div className="inline-flex items-center space-x-2 mb-4">
                <Sparkles className="w-8 h-8 text-yellow-400" />
                <h1 className="text-2xl font-bold">Glass Slipper</h1>
              </div>
              <p className="text-white text-opacity-70">
                {currentView === 'login' ? 'Welcome Back' : 'Get Started'}
              </p>
              <p className="text-white text-opacity-60 text-sm">
                {currentView === 'login' 
                  ? 'Sign in to your Glass Slipper account' 
                  : 'Create your Glass Slipper account'
                }
              </p>
            </div>

            {currentView === 'login' ? (
              <div className="space-y-6">
                <div>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 w-5 h-5 text-white text-opacity-50" />
                    <input
                      type="email"
                      placeholder="Email address"
                      className="w-full pl-10 pr-4 py-3 bg-white bg-opacity-10 border border-white border-opacity-20 rounded-lg text-white placeholder-white placeholder-opacity-50 focus:outline-none focus:border-yellow-400 focus:bg-opacity-20 transition-all"
                      required
                    />
                  </div>
                </div>

                {showPasswordLogin && (
                  <div>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 w-5 h-5 text-white text-opacity-50" />
                      <input
                        type={showPassword ? "text" : "password"}
                        placeholder="Password"
                        className="w-full pl-10 pr-12 py-3 bg-white bg-opacity-10 border border-white border-opacity-20 rounded-lg text-white placeholder-white placeholder-opacity-50 focus:outline-none focus:border-yellow-400 focus:bg-opacity-20 transition-all"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-3 text-white text-opacity-50 hover:text-opacity-80 transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>
                )}

                <button
                  onClick={showPasswordLogin ? handleLogin : () => setShowPasswordLogin(true)}
                  className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
                >
                  <span>Sign In</span>
                  <ArrowRight className="w-5 h-5" />
                </button>

                <p className="text-center text-white text-opacity-70 text-sm">
                  Don't have an account?{' '}
                  <button
                    type="button"
                    onClick={() => setCurrentView('signup')}
                    className="text-yellow-400 hover:text-yellow-300 font-medium"
                  >
                    Sign up here
                  </button>
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="First name"
                    className="w-full px-4 py-3 bg-white bg-opacity-10 border border-white border-opacity-20 rounded-lg text-white placeholder-white placeholder-opacity-50 focus:outline-none focus:border-yellow-400 focus:bg-opacity-20 transition-all"
                    required
                  />
                  <input
                    type="text"
                    placeholder="Last name"
                    className="w-full px-4 py-3 bg-white bg-opacity-10 border border-white border-opacity-20 rounded-lg text-white placeholder-white placeholder-opacity-50 focus:outline-none focus:border-yellow-400 focus:bg-opacity-20 transition-all"
                    required
                  />
                </div>

                <div className="relative">
                  <Mail className="absolute left-3 top-3 w-5 h-5 text-white text-opacity-50" />
                  <input
                    type="email"
                    placeholder="Email address"
                    className="w-full pl-10 pr-4 py-3 bg-white bg-opacity-10 border border-white border-opacity-20 rounded-lg text-white placeholder-white placeholder-opacity-50 focus:outline-none focus:border-yellow-400 focus:bg-opacity-20 transition-all"
                    required
                  />
                </div>

                <div className="relative">
                  <Lock className="absolute left-3 top-3 w-5 h-5 text-white text-opacity-50" />
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Create password"
                    className="w-full pl-10 pr-12 py-3 bg-white bg-opacity-10 border border-white border-opacity-20 rounded-lg text-white placeholder-white placeholder-opacity-50 focus:outline-none focus:border-yellow-400 focus:bg-opacity-20 transition-all"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-white text-opacity-50 hover:text-opacity-80 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>

                <button
                  onClick={handleSignUp}
                  className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
                >
                  <span>Create Account</span>
                  <ArrowRight className="w-5 h-5" />
                </button>

                <p className="text-center text-white text-opacity-70 text-sm">
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => setCurrentView('login')}
                    className="text-yellow-400 hover:text-yellow-300 font-medium"
                  >
                    Sign in here
                  </button>
                </p>
              </div>
            )}

            <div className="mt-8 pt-6 border-t border-white border-opacity-20">
              <div className="text-center">
                <p className="text-white text-opacity-60 text-xs mb-2">Glass Slipper v1.0 Beta</p>
                <div className="flex items-center justify-center space-x-4 text-white text-opacity-40">
                  <div className="flex items-center space-x-1">
                    <Shield className="w-3 h-3" />
                    <span className="text-xs">Secure</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Users className="w-3 h-3" />
                    <span className="text-xs">Trusted</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Main App Interface
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900">
      <div className="container mx-auto p-4">
        {/* Header */}
        <div className="bg-white bg-opacity-10 backdrop-blur rounded-xl p-4 mb-6">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center space-x-2">
              <Sparkles className="w-8 h-8 text-yellow-400" />
              <h1 className="text-2xl font-bold text-white">Glass Slipper</h1>
            </div>

            {/* Navigation */}
            <div className="hidden md:block">
              <nav className="flex items-center space-x-2">
                <button
                  onClick={() => setCurrentView('dashboard')}
                  className={`px-4 py-2 rounded-lg transition-all ${
                    currentView === 'dashboard'
                      ? 'bg-white bg-opacity-20 text-white'
                      : 'text-white text-opacity-70 hover:text-white hover:bg-white hover:bg-opacity-10'
                  }`}
                >
                  Dashboard
                </button>
                <button
                  onClick={() => setCurrentView('tasks')}
                  className={`px-4 py-2 rounded-lg transition-all ${
                    currentView === 'tasks'
                      ? 'bg-white bg-opacity-20 text-white'
                      : 'text-white text-opacity-70 hover:text-white hover:bg-white hover:bg-opacity-10'
                  }`}
                >
                  Tasks
                </button>
                <button
                  onClick={() => setCurrentView('contacts')}
                  className={`px-4 py-2 rounded-lg transition-all ${
                    currentView === 'contacts'
                      ? 'bg-white bg-opacity-20 text-white'
                      : 'text-white text-opacity-70 hover:text-white hover:bg-white hover:bg-opacity-10'
                  }`}
                >
                  Contacts
                </button>
                <button
                  onClick={() => setCurrentView('strategy')}
                  className={`px-4 py-2 rounded-lg transition-all ${
                    currentView === 'strategy'
                      ? 'bg-white bg-opacity-20 text-white'
                      : 'text-white text-opacity-70 hover:text-white hover:bg-white hover:bg-opacity-10'
                  }`}
                >
                  Strategy
                </button>
                <button
                  onClick={() => setCurrentView('lead-magnets')}
                  className={`px-4 py-2 rounded-lg transition-all ${
                    currentView === 'lead-magnets'
                      ? 'bg-white bg-opacity-20 text-white'
                      : 'text-white text-opacity-70 hover:text-white hover:bg-white hover:bg-opacity-10'
                  }`}
                >
                  Lead Magnets
                </button>
                <button
                  onClick={() => setCurrentView('messages')}
                  className={`px-4 py-2 rounded-lg transition-all ${
                    currentView === 'messages'
                      ? 'bg-white bg-opacity-20 text-white'
                      : 'text-white text-opacity-70 hover:text-white hover:bg-white hover:bg-opacity-10'
                  }`}
                >
                  Messages
                </button>
                <button
                  onClick={() => setCurrentView('settings')}
                  className={`px-4 py-2 rounded-lg transition-all ${
                    currentView === 'settings'
                      ? 'bg-white bg-opacity-20 text-white'
                      : 'text-white text-opacity-70 hover:text-white hover:bg-white hover:bg-opacity-10'
                  }`}
                >
                  Settings
                </button>
              </nav>
            </div>

            {/* User menu */}
            <div className="flex items-center space-x-4">
              <div className="hidden md:block text-right">
                <p className="text-white text-sm font-medium">{user.name || currentUser.name}</p>
                <p className="text-white text-opacity-70 text-xs">{user.company || currentUser.company}</p>
              </div>
              <button
                onClick={handleLogout}
                className="text-white text-opacity-70 hover:text-white transition-colors"
              >
                <LogOut className="w-5 h-5" />
              </button>

              {/* Mobile menu button */}
              <button
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="md:hidden text-white"
              >
                <Menu className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Mobile Navigation - Updated to include Tasks (Change 1) */}
          {showMobileMenu && (
            <div className="md:hidden pb-4">
              <div className="space-y-2">
                <button
                  onClick={() => { setCurrentView('dashboard'); setShowMobileMenu(false); }}
                  className={`block w-full text-left px-4 py-2 rounded-lg transition-all ${
                    currentView === 'dashboard'
                      ? 'bg-white bg-opacity-20 text-white'
                      : 'text-white text-opacity-70'
                  }`}
                >
                  Dashboard
                </button>
                <button
                  onClick={() => { setCurrentView('tasks'); setShowMobileMenu(false); }}
                  className={`block w-full text-left px-4 py-2 rounded-lg transition-all ${
                    currentView === 'tasks'
                      ? 'bg-white bg-opacity-20 text-white'
                      : 'text-white text-opacity-70'
                  }`}
                >
                  Tasks
                </button>
                <button
                  onClick={() => { setCurrentView('contacts'); setShowMobileMenu(false); }}
                  className={`block w-full text-left px-4 py-2 rounded-lg transition-all ${
                    currentView === 'contacts'
                      ? 'bg-white bg-opacity-20 text-white'
                      : 'text-white text-opacity-70'
                  }`}
                >
                  Contacts
                </button>
                <button
                  onClick={() => { setCurrentView('strategy'); setShowMobileMenu(false); }}
                  className={`block w-full text-left px-4 py-2 rounded-lg transition-all ${
                    currentView === 'strategy'
                      ? 'bg-white bg-opacity-20 text-white'
                      : 'text-white text-opacity-70'
                  }`}
                >
                  Strategy
                </button>
                <button
                  onClick={() => { setCurrentView('lead-magnets'); setShowMobileMenu(false); }}
                  className={`block w-full text-left px-4 py-2 rounded-lg transition-all ${
                    currentView === 'lead-magnets'
                      ? 'bg-white bg-opacity-20 text-white'
                      : 'text-white text-opacity-70'
                  }`}
                >
                  Lead Magnets
                </button>
                <button
                  onClick={() => { setCurrentView('messages'); setShowMobileMenu(false); }}
                  className={`block w-full text-left px-4 py-2 rounded-lg transition-all ${
                    currentView === 'messages'
                      ? 'bg-white bg-opacity-20 text-white'
                      : 'text-white text-opacity-70'
                  }`}
                >
                  Messages
                </button>
                <button
                  onClick={() => { setCurrentView('settings'); setShowMobileMenu(false); }}
                  className={`block w-full text-left px-4 py-2 rounded-lg transition-all ${
                    currentView === 'settings'
                      ? 'bg-white bg-opacity-20 text-white'
                      : 'text-white text-opacity-70'
                  }`}
                >
                  Settings
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Main Content */}
        {currentView === 'dashboard' && (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-white mb-2">Welcome to Glass Slipper</h1>
              <p className="text-white text-opacity-70">Your LinkedIn relationship management dashboard</p>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div 
                onClick={() => {
                  setContactFilter('all');
                  setCurrentView('contacts');
                }}
                className="bg-white bg-opacity-10 backdrop-blur rounded-xl p-6 text-white cursor-pointer hover:bg-opacity-15 transition-all"
              >
                <div className="flex items-center space-x-3">
                  <Zap className="w-8 h-8 text-yellow-400" />
                  <div>
                    <p className="text-2xl font-bold">{enrichmentsLeft}</p>
                    <p className="text-white text-opacity-70 text-sm">Enrichments Left</p>
                  </div>
                </div>
              </div>

              <div 
                onClick={() => setCurrentView('contacts')}
                className="bg-white bg-opacity-10 backdrop-blur rounded-xl p-6 text-white cursor-pointer hover:bg-opacity-15 transition-all"
              >
                <div className="flex items-center space-x-3">
                  <Users className="w-8 h-8 text-blue-400" />
                  <div>
                    <p className="text-2xl font-bold">{contacts.length}</p>
                    <p className="text-white text-opacity-70 text-sm">Total Contacts</p>
                  </div>
                </div>
              </div>

              <div 
                onClick={() => {
                  setContactFilter('Ideal Client');
                  setCurrentView('contacts');
                }}
                className="bg-white bg-opacity-10 backdrop-blur rounded-xl p-6 text-white cursor-pointer hover:bg-opacity-15 transition-all"
              >
                <div className="flex items-center space-x-3">
                  <Target className="w-8 h-8 text-green-400" />
                  <div>
                    <p className="text-2xl font-bold">{contacts.filter(c => c.category === 'Ideal Client').length}</p>
                    <p className="text-white text-opacity-70 text-sm">Ideal Clients</p>
                  </div>
                </div>
              </div>

              <div className="bg-white bg-opacity-10 backdrop-blur rounded-xl p-6 text-white">
                <div className="flex items-center space-x-3">
                  <UserCheck className="w-8 h-8 text-purple-400" />
                  <div>
                    <p className="text-2xl font-bold">{contacts.filter(c => c.enriched).length}</p>
                    <p className="text-white text-opacity-70 text-sm">Enriched</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Contacts with Task Progress (Change 5) */}
            <div className="bg-white bg-opacity-10 backdrop-blur rounded-xl p-6">
              <h2 className="text-xl font-semibold text-white mb-6">Recent Contacts</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {contacts.slice(0, 6).map(contact => (
                  <div key={contact.id} className="bg-white bg-opacity-5 rounded-lg p-4 hover:bg-opacity-10 transition-all cursor-pointer">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-medium text-white">{contact.firstName} {contact.lastName}</h3>
                        <p className="text-white text-opacity-70 text-sm">{contact.position}</p>
                        <p className="text-white text-opacity-60 text-xs">{contact.company}</p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        contact.category === 'Ideal Client' 
                          ? 'bg-green-500 bg-opacity-20 text-green-300'
                          : contact.category === 'Referral Partner'
                          ? 'bg-blue-500 bg-opacity-20 text-blue-300'
                          : 'bg-gray-500 bg-opacity-20 text-gray-300'
                      }`}>
                        {contact.category}
                      </span>
                    </div>

                    <div className="mb-3">
                      <span className={`inline-block px-2 py-1 rounded-full text-xs ${
                        contact.enriched 
                          ? 'bg-green-500 bg-opacity-20 text-green-300' 
                          : 'bg-gray-500 bg-opacity-20 text-gray-300'
                      }`}>
                        {contact.enriched ? 'Enriched' : 'Basic'}
                      </span>
                    </div>

                    {/* Contact Tasks Progress (Change 5 Addition) */}
                    {contact.category === 'Ideal Client' && (() => {
                      const contactTasksList = getContactTasks(contact.id);
                      const completedTasks = contactTasksList.filter(task => task.completed).length;
                      const totalTasks = contactTasksList.length;
                      
                      if (totalTasks > 0) {
                        return (
                          <div className="mt-4 pt-4 border-t border-white border-opacity-10">
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-white text-opacity-70">Tasks Progress</span>
                              <span className="text-white">{completedTasks}/{totalTasks}</span>
                            </div>
                            <div className="w-full bg-white bg-opacity-10 rounded-full h-2 mt-2">
                              <div 
                                className="bg-green-400 h-2 rounded-full transition-all"
                                style={{ width: `${totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0}%` }}
                              ></div>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    })()}
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white bg-opacity-10 backdrop-blur rounded-xl p-6 text-white">
                <Building className="w-8 h-8 text-blue-400 mb-4" />
                <h3 className="text-lg font-semibold mb-2">Upload Contacts</h3>
                <p className="text-white text-opacity-70 mb-4">Import your LinkedIn connections</p>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
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

              <div className="bg-white bg-opacity-10 backdrop-blur rounded-xl p-6 text-white">
                <BarChart3 className="w-8 h-8 text-green-400 mb-4" />
                <h3 className="text-lg font-semibold mb-2">View Analytics</h3>
                <p className="text-white text-opacity-70 mb-4">Track your engagement metrics</p>
                <button className="w-full bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-4 rounded-lg transition-colors">
                  Coming Soon
                </button>
              </div>

              <div className="bg-white bg-opacity-10 backdrop-blur rounded-xl p-6 text-white">
                <Calendar className="w-8 h-8 text-purple-400 mb-4" />
                <h3 className="text-lg font-semibold mb-2">Schedule Posts</h3>
                <p className="text-white text-opacity-70 mb-4">Plan your content calendar</p>
                <button className="w-full bg-purple-500 hover:bg-purple-600 text-white font-medium py-2 px-4 rounded-lg transition-colors">
                  Coming Soon
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tasks View (Change 1 - Complete Implementation) */}
        {currentView === 'tasks' && (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-white">Tasks</h1>
              <div className="text-white text-opacity-70">
                <span className="text-sm">
                  {new Date().toLocaleDateString('en-GB', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Daily Tasks Section */}
              <div className="bg-white bg-opacity-10 backdrop-blur rounded-xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-white">Daily Tasks</h2>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
                    <span className="text-white text-opacity-70 text-sm">
                      {dailyTasks.filter(t => t.completed).length}/{dailyTasks.length} Complete
                    </span>
                  </div>
                </div>

                {allDailyTasksComplete ? (
                  <div className="text-center py-8">
                    <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-white mb-2">Congratulations!</h3>
                    <p className="text-white text-opacity-70">
                      Come back tomorrow for more tasks!
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {dailyTasks.filter(task => !task.completed).map(task => (
                      <div key={task.id} className="flex items-center space-x-3 p-3 bg-white bg-opacity-5 rounded-lg">
                        <button
                          onClick={() => completeDailyTask(task.id)}
                          className="w-5 h-5 border-2 border-white border-opacity-50 rounded hover:border-yellow-400 hover:bg-yellow-400 hover:bg-opacity-20 transition-all flex items-center justify-center"
                        >
                          {task.completed && <CheckCircle className="w-4 h-4 text-yellow-400" />}
                        </button>
                        <span className="text-white flex-1">{task.text}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Contact-Specific Tasks Section (Change 3 - Enhanced with Setup Tasks) */}
              <div className="bg-white bg-opacity-10 backdrop-blur rounded-xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-white">
                    {setupComplete ? 'Contact Tasks' : 'Setup Tasks'}
                  </h2>
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${setupComplete ? 'bg-green-400' : 'bg-orange-400'}`}></div>
                    <span className="text-white text-opacity-70 text-sm">
                      {setupComplete ? 'Complete' : 'Setup Required'}
                    </span>
                  </div>
                </div>

                {!setupComplete ? (
                  <div className="space-y-4">
                    <div className="bg-orange-500 bg-opacity-20 rounded-lg p-4 mb-4">
                      <h3 className="text-orange-300 font-medium mb-2">Complete Setup First</h3>
                      <p className="text-orange-200 text-sm">
                        Finish these setup tasks to unlock contact-specific tasks
                      </p>
                    </div>

                    {setupTasks.map(task => (
                      <div key={task.id} className="flex items-center space-x-3 p-3 bg-white bg-opacity-5 rounded-lg">
                        <button
                          className={`w-5 h-5 border-2 rounded flex items-center justify-center transition-all ${
                            task.completed 
                              ? 'border-green-500 bg-green-500' 
                              : 'border-white border-opacity-50 hover:border-orange-400'
                          }`}
                        >
                          {task.completed && <CheckCircle className="w-4 h-4 text-white" />}
                        </button>
                        <span className={`flex-1 ${task.completed ? 'text-white line-through' : 'text-white'}`}>
                          {task.text}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-6">
                    {(() => {
                      const contactSpecificTasks = getContactSpecificTasks();
                      
                      if (contactSpecificTasks.length === 0) {
                        return (
                          <div className="text-center py-8">
                            <Users className="w-16 h-16 text-white text-opacity-30 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-white mb-2">No Ideal Clients Found</h3>
                            <p className="text-white text-opacity-70 text-sm">
                              Add some ideal clients to see contact-specific tasks
                            </p>
                          </div>
                        );
                      }

                      return contactSpecificTasks.map(({ contact, tasks }) => (
                        <div key={contact.id} className="bg-white bg-opacity-5 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-3">
                            <h3 className="font-medium text-white">
                              {contact.firstName} {contact.lastName}
                            </h3>
                            <span className="text-white text-opacity-60 text-xs">
                              {contact.company}
                            </span>
                          </div>

                          <div className="space-y-2">
                            {tasks.map(({ key, label, completed, completedDate }) => (
                              <div key={key} className="flex items-center space-x-3">
                                <button
                                  onClick={() => completeContactTask(contact.id, key)}
                                  className={`w-4 h-4 border rounded flex items-center justify-center transition-all ${
                                    completed 
                                      ? 'border-green-500 bg-green-500' 
                                      : 'border-gray-300 hover:border-green-400'
                                  }`}
                                >
                                  {completed && <CheckCircle className="w-4 h-4 text-white" />}
                                </button>
                                <div className="flex-1">
                                  <span className={`text-sm ${completed ? 'text-gray-500 line-through' : 'text-gray-900'}`}>
                                    {label}
                                  </span>
                                  {completed && completedDate && (
                                    <p className="text-xs text-gray-400">
                                      Completed {new Date(completedDate).toLocaleDateString('en-GB')}
                                    </p>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ));
                    })()}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Contacts View */}
        {currentView === 'contacts' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-white">Contacts</h1>
                {contactFilter !== 'all' && (
                  <p className="text-white text-opacity-70">
                    Showing: {contactFilter} ({contacts.filter(c => c.category === contactFilter).length} contacts)
                  </p>
                )}
              </div>
              <div className="flex items-center space-x-4">
                <select
                  value={contactFilter}
                  onChange={(e) => setContactFilter(e.target.value)}
                  className="bg-white bg-opacity-10 border border-white border-opacity-20 rounded-lg text-white px-3 py-2 focus:outline-none focus:border-yellow-400"
                >
                  <option value="all">All Contacts</option>
                  <option value="Ideal Client">Ideal Clients</option>
                  <option value="Referral Partner">Referral Partners</option>
                  <option value="Industry Contact">Industry Contacts</option>
                  <option value="Past Client">Past Clients</option>
                  <option value="Uncategorised">Uncategorised</option>
                </select>
                <button
                  onClick={addContact}
                  className="bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center space-x-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Contact</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {contacts
                .filter(contact => contactFilter === 'all' || contact.category === contactFilter)
                .map(contact => (
                  <div key={contact.id} className="bg-white bg-opacity-10 backdrop-blur rounded-xl p-6 text-white">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold">{contact.firstName} {contact.lastName}</h3>
                        <p className="text-white text-opacity-70 text-sm">{contact.position}</p>
                        <p className="text-white text-opacity-60 text-xs">{contact.company}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => setSelectedContact(contact)}
                          className="text-white text-opacity-70 hover:text-white transition-colors"
                        >
                          <User className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteContact(contact.id)}
                          className="text-red-400 hover:text-red-300 transition-colors text-sm"
                        >
                          ×
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        contact.category === 'Ideal Client' 
                          ? 'bg-green-500 bg-opacity-20 text-green-300'
                          : contact.category === 'Referral Partner'
                          ? 'bg-blue-500 bg-opacity-20 text-blue-300'
                          : 'bg-gray-500 bg-opacity-20 text-gray-300'
                      }`}>
                        {contact.category}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        contact.enriched 
                          ? 'bg-green-500 bg-opacity-20 text-green-300' 
                          : 'bg-gray-500 bg-opacity-20 text-gray-300'
                      }`}>
                        {contact.enriched ? 'Enriched' : 'Basic'}
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Strategy View */}
        {currentView === 'strategy' && (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-white">Strategy</h1>
                                  <p className="text-white text-opacity-70">Define your LinkedIn networking strategy</p>
            </div>

            <div className="bg-white bg-opacity-10 backdrop-blur rounded-xl p-6">
              <div className="space-y-6">
                <div>
                  <label className="block text-white font-medium mb-2">
                    What is the ONE thing you want to sell to people on LinkedIn?
                  </label>
                  <textarea
                    value={strategy.oneOffer}
                    onChange={(e) => setStrategy({...strategy, oneOffer: e.target.value})}
                    className="w-full p-3 bg-white bg-opacity-10 border border-white border-opacity-20 rounded-lg text-white placeholder-white placeholder-opacity-50 focus:outline-none focus:border-yellow-400 focus:bg-opacity-20 transition-all"
                    rows="3"
                    placeholder="Describe your main offer..."
                  />
                </div>

                <div>
                  <label className="block text-white font-medium mb-2">
                    Who are your ideal referral partners?
                  </label>
                  <textarea
                    value={strategy.idealReferralPartners}
                    onChange={(e) => setStrategy({...strategy, idealReferralPartners: e.target.value})}
                    className="w-full p-3 bg-white bg-opacity-10 border border-white border-opacity-20 rounded-lg text-white placeholder-white placeholder-opacity-50 focus:outline-none focus:border-yellow-400 focus:bg-opacity-20 transition-all"
                    rows="3"
                    placeholder="Describe your ideal referral partners..."
                  />
                </div>

                <div>
                  <label className="block text-white font-medium mb-2">
                    What makes you special or different?
                  </label>
                  <textarea
                    value={strategy.specialFactors}
                    onChange={(e) => setStrategy({...strategy, specialFactors: e.target.value})}
                    className="w-full p-3 bg-white bg-opacity-10 border border-white border-opacity-20 rounded-lg text-white placeholder-white placeholder-opacity-50 focus:outline-none focus:border-yellow-400 focus:bg-opacity-20 transition-all"
                    rows="3"
                    placeholder="What's your unique value proposition..."
                  />
                </div>

                <button className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-semibold py-3 px-4 rounded-lg transition-colors">
                  Generate Strategy
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Lead Magnets View */}
        {currentView === 'lead-magnets' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold text-white">Lead Magnets</h1>
              <button className="bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center space-x-2">
                <Plus className="w-4 h-4" />
                <span>Create New</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {leadMagnets.map(magnet => (
                <div key={magnet.id} className="bg-white bg-opacity-10 backdrop-blur rounded-xl p-6 text-white">
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold mb-2">{magnet.title}</h3>
                    <p className="text-white text-opacity-70 text-sm">{magnet.description}</p>
                  </div>

                  <div className="flex items-center justify-between text-xs text-white text-opacity-60 mb-4">
                    <span>Created {new Date(magnet.createdAt).toLocaleDateString('en-GB')}</span>
                    <span className={`px-2 py-1 rounded-full ${
                      magnet.isPersonalized ? 'bg-green-500 bg-opacity-20 text-green-300' : 'bg-gray-500 bg-opacity-20 text-gray-300'
                    }`}>
                      {magnet.isPersonalized ? 'Personalized' : 'Template'}
                    </span>
                  </div>

                  <div className="flex space-x-2">
                    <button className="flex-1 bg-blue-500 hover:bg-blue-600 text-white text-sm py-2 px-3 rounded transition-colors">
                      Edit
                    </button>
                    <button className="flex-1 bg-green-500 hover:bg-green-600 text-white text-sm py-2 px-3 rounded transition-colors">
                      Download
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Messages View */}
        {currentView === 'messages' && (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-white">Messages to Send</h1>
              <p className="text-white text-opacity-70">Use these templates for your LinkedIn outreach</p>
            </div>

            <div className="bg-white bg-opacity-10 backdrop-blur rounded-xl p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Message Templates</h2>
              <div className="space-y-6">
                <div className="bg-white bg-opacity-5 rounded-lg p-6">
                  <h3 className="font-medium text-white mb-4 flex items-center space-x-2">
                    <MessageSquare className="w-5 h-5" />
                    <span>Message to Existing Contacts</span>
                  </h3>
                  <div className="bg-gray-800 bg-opacity-50 rounded-lg p-4 mb-4">
                    <p className="text-white text-sm leading-relaxed font-mono">
                      Hi [Name], Hope you're doing well! I've just put together a quick guide that might be useful - "[LEAD MAGNET TITLE]". [EXPLANATION OF LEAD MAGNET]. Thought it might be handy given we're both in the [INDUSTRY] world. Happy to send it over if you'd like a copy? No sales pitch attached - just sharing something that might help! Best, [YOUR NAME]
                    </p>
                  </div>
                  <div className="text-white text-opacity-70 text-sm mb-4">
                    <p><strong>How to use this template:</strong></p>
                    <ul className="list-disc list-inside space-y-1 mt-2">
                      <li>Replace [Name] with the contact's first name</li>
                      <li>Replace [LEAD MAGNET TITLE] with your lead magnet title</li>
                      <li>Replace [EXPLANATION OF LEAD MAGNET] with a brief description</li>
                      <li>Replace [INDUSTRY] with the relevant industry</li>
                      <li>Replace [YOUR NAME] with your name</li>
                    </ul>
                  </div>
                  <div className="flex space-x-3">
                    <button 
                      onClick={() => copyToClipboard("Hi [Name], Hope you're doing well! I've just put together a quick guide that might be useful - \"[LEAD MAGNET TITLE]\". [EXPLANATION OF LEAD MAGNET]. Thought it might be handy given we're both in the [INDUSTRY] world. Happy to send it over if you'd like a copy? No sales pitch attached - just sharing something that might help! Best, [YOUR NAME]")}
                      className="flex items-center space-x-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm transition-colors"
                    >
                      <Copy className="w-4 h-4" />
                      <span>Copy Template</span>
                    </button>
                    <button 
                      onClick={() => setCurrentView('contacts')}
                      className="flex items-center space-x-2 bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg text-sm transition-colors"
                    >
                      <MessageSquare className="w-4 h-4" />
                      <span>Generate for Contact</span>
                    </button>
                  </div>
                </div>

                <div className="bg-white bg-opacity-5 rounded-lg p-6">
                  <h3 className="font-medium text-white mb-3">💡 Tips for Better Engagement</h3>
                  <ul className="text-white text-opacity-70 text-sm space-y-2 list-disc list-inside">
                    <li>Personalise each message with specific details about their work or industry</li>
                    <li>Always lead with value - what's in it for them?</li>
                    <li>Keep messages conversational and friendly, not sales-y</li>
                    <li>Follow up if they don't respond, but give it a few days</li>
                    <li>Use the "Generate Message" button in individual contacts for personalised versions</li>
                  </ul>
                </div>
              </div>

              {copyFeedback && (
                <div className="mt-4 text-center text-green-400 text-sm">
                  {copyFeedback}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Settings View */}
        {currentView === 'settings' && (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-white">Settings</h1>
              <p className="text-white text-opacity-70">Manage your account and preferences</p>
            </div>

            {/* Profile Information */}
            <div className="bg-white bg-opacity-10 backdrop-blur rounded-xl p-6">
              <h2 className="text-xl font-semibold text-white mb-6">Profile Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-white font-medium mb-2">Full Name</label>
                  <input
                    type="text"
                    value={user.name}
                    onChange={(e) => setUser({...user, name: e.target.value})}
                    className="w-full p-3 bg-white bg-opacity-10 border border-white border-opacity-20 rounded-lg text-white placeholder-white placeholder-opacity-50 focus:outline-none focus:border-yellow-400 focus:bg-opacity-20 transition-all"
                    placeholder="Your full name"
                  />
                </div>

                <div>
                  <label className="block text-white font-medium mb-2">Email</label>
                  <input
                    type="email"
                    value={user.email}
                    onChange={(e) => setUser({...user, email: e.target.value})}
                    className="w-full p-3 bg-white bg-opacity-10 border border-white border-opacity-20 rounded-lg text-white placeholder-white placeholder-opacity-50 focus:outline-none focus:border-yellow-400 focus:bg-opacity-20 transition-all"
                    placeholder="your.email@company.com"
                  />
                </div>

                <div>
                  <label className="block text-white font-medium mb-2">Company</label>
                  <input
                    type="text"
                    value={user.company}
                    onChange={(e) => setUser({...user, company: e.target.value})}
                    className="w-full p-3 bg-white bg-opacity-10 border border-white border-opacity-20 rounded-lg text-white placeholder-white placeholder-opacity-50 focus:outline-none focus:border-yellow-400 focus:bg-opacity-20 transition-all"
                    placeholder="Your company name"
                  />
                </div>

                <div>
                  <label className="block text-white font-medium mb-2">Industry</label>
                  <input
                    type="text"
                    value={user.industry}
                    onChange={(e) => setUser({...user, industry: e.target.value})}
                    className="w-full p-3 bg-white bg-opacity-10 border border-white border-opacity-20 rounded-lg text-white placeholder-white placeholder-opacity-50 focus:outline-none focus:border-yellow-400 focus:bg-opacity-20 transition-all"
                    placeholder="Your industry"
                  />
                </div>
              </div>

              <div className="mt-6">
                <button className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold py-2 px-6 rounded-lg transition-colors">
                  Save Changes
                </button>
              </div>
            </div>

            {/* Writing Style Analysis (Change 6) */}
            <div className="bg-white bg-opacity-10 backdrop-blur rounded-xl p-6">
              <h2 className="text-xl font-semibold text-white mb-6">Writing Style Analysis</h2>
              <p className="text-white text-opacity-70 mb-6">
                Help us understand your unique writing style by answering these questions. This analysis will be used to create content that matches your voice.
              </p>

              <div className="space-y-6">
                <div>
                  <label className="block text-white font-medium mb-2">
                    Describe your business in as much detail as possible
                  </label>
                  <textarea
                    value={writingQuestions.business}
                    onChange={(e) => setWritingQuestions({...writingQuestions, business: e.target.value})}
                    className="w-full p-3 bg-white bg-opacity-10 border border-white border-opacity-20 rounded-lg text-white placeholder-white placeholder-opacity-50 focus:outline-none focus:border-yellow-400 focus:bg-opacity-20 transition-all"
                    rows="6"
                    maxLength="1000"
                    placeholder="Describe your business, your role, what you do, who you serve, what makes you different..."
                  />
                  <p className="text-white text-opacity-50 text-xs mt-1">
                    {writingQuestions.business.length}/1000 characters
                  </p>
                </div>

                <div>
                  <label className="block text-white font-medium mb-2">
                    Talk about your favourite hobby. What would a beginner need to know?
                  </label>
                  <textarea
                    value={writingQuestions.hobby}
                    onChange={(e) => setWritingQuestions({...writingQuestions, hobby: e.target.value})}
                    className="w-full p-3 bg-white bg-opacity-10 border border-white border-opacity-20 rounded-lg text-white placeholder-white placeholder-opacity-50 focus:outline-none focus:border-yellow-400 focus:bg-opacity-20 transition-all"
                    rows="6"
                    maxLength="1000"
                    placeholder="Share your favourite hobby and what advice you'd give to someone just starting out..."
                  />
                  <p className="text-white text-opacity-50 text-xs mt-1">
                    {writingQuestions.hobby.length}/1000 characters
                  </p>
                </div>

                <div>
                  <label className="block text-white font-medium mb-2">
                    Write about you. Tell your story!
                  </label>
                  <textarea
                    value={writingQuestions.story}
                    onChange={(e) => setWritingQuestions({...writingQuestions, story: e.target.value})}
                    className="w-full p-3 bg-white bg-opacity-10 border border-white border-opacity-20 rounded-lg text-white placeholder-white placeholder-opacity-50 focus:outline-none focus:border-yellow-400 focus:bg-opacity-20 transition-all"
                    rows="6"
                    maxLength="1000"
                    placeholder="Tell your personal story, your journey, what led you to where you are today..."
                  />
                  <p className="text-white text-opacity-50 text-xs mt-1">
                    {writingQuestions.story.length}/1000 characters
                  </p>
                </div>

                <div className="flex items-center space-x-4">
                  <button
                    onClick={analyseWritingStyle}
                    disabled={isAnalysing || !writingQuestions.business.trim() || !writingQuestions.hobby.trim() || !writingQuestions.story.trim()}
                    className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all ${
                      isAnalysing || !writingQuestions.business.trim() || !writingQuestions.hobby.trim() || !writingQuestions.story.trim()
                        ? 'bg-gray-500 bg-opacity-50 text-gray-300 cursor-not-allowed'
                        : 'bg-purple-500 hover:bg-purple-600 text-white'
                    }`}
                  >
                    {isAnalysing ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Analysing...</span>
                      </>
                    ) : (
                      <>
                        <span>Save & Analyse Writing Style</span>
                        <ChevronRight className="w-5 h-5" />
                      </>
                    )}
                  </button>
                </div>

                {/* Status Indicator */}
                {writingStyle && (
                  <div className="flex items-center space-x-2 text-green-400 text-sm">
                    <CheckCircle className="w-4 h-4" />
                    <span>Writing style analysed and saved</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Contact Modal */}
        {selectedContact && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">
                    {selectedContact.firstName} {selectedContact.lastName}
                  </h2>
                  <button
                    onClick={() => {
                      setSelectedContact(null);
                      setGeneratedMessage('');
                    }}
                    className="text-gray-400 hover:text-gray-600 text-2xl"
                  >
                    ×
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Basic Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                      <input
                        type="text"
                        value={selectedContact.firstName}
                        onChange={(e) => updateContact(selectedContact.id, { firstName: e.target.value })}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                      <input
                        type="text"
                        value={selectedContact.lastName}
                        onChange={(e) => updateContact(selectedContact.id, { lastName: e.target.value })}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
                      <input
                        type="text"
                        value={selectedContact.company}
                        onChange={(e) => updateContact(selectedContact.id, { company: e.target.value })}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Position</label>
                      <input
                        type="text"
                        value={selectedContact.position}
                        onChange={(e) => updateContact(selectedContact.id, { position: e.target.value })}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      value={selectedContact.email}
                      onChange={(e) => updateContact(selectedContact.id, { email: e.target.value })}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                    <select
                      value={selectedContact.category}
                      onChange={(e) => updateContact(selectedContact.id, { category: e.target.value })}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                    >
                      <option value="Uncategorised">Uncategorised</option>
                      <option value="Ideal Client">Ideal Client</option>
                      <option value="Referral Partner">Referral Partner</option>
                      <option value="Industry Contact">Industry Contact</option>
                      <option value="Past Client">Past Client</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                    <textarea
                      value={selectedContact.notes}
                      onChange={(e) => updateContact(selectedContact.id, { notes: e.target.value })}
                      rows="4"
                      className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                      placeholder="Add notes about this contact..."
                    />
                  </div>

                  {/* Enriched Data Section */}
                  {selectedContact.enriched && (
                    <div className="bg-green-50 rounded-lg p-4">
                      <h4 className="text-sm font-medium text-green-900 mb-3">Enriched Information</h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="font-medium text-green-800">Company Size:</span>
                          <p className="text-green-700">{selectedContact.companySize}</p>
                        </div>
                        <div>
                          <span className="font-medium text-green-800">Industry:</span>
                          <p className="text-green-700">{selectedContact.industry}</p>
                        </div>
                        <div>
                          <span className="font-medium text-green-800">Location:</span>
                          <p className="text-green-700">{selectedContact.location}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Contact Tasks (Change 5 Addition) */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-gray-900 mb-3">Contact Tasks</h4>
                    <div className="space-y-2">
                      {getContactTasks(selectedContact.id).map(({ key, label, completed, completedDate }) => {
                        const iconMap = {
                          viewProfile: User,
                          turnOnNotifications: Target,
                          sendMessage: Mail,
                          followUp: ArrowRight,
                          directOutreach: MessageSquare
                        };
                        const Icon = iconMap[key] || Mail;
                        
                        return (
                          <div key={key} className="flex items-center space-x-3">
                            <button
                              onClick={() => completeContactTask(selectedContact.id, key)}
                              className={`w-5 h-5 border-2 rounded flex items-center justify-center transition-all ${
                                completed 
                                  ? 'border-green-500 bg-green-500' 
                                  : 'border-gray-300 hover:border-green-400'
                              }`}
                            >
                              {completed && <CheckCircle className="w-4 h-4 text-white" />}
                            </button>
                            <Icon className="w-4 h-4 text-gray-500" />
                            <div className="flex-1">
                              <span className={`text-sm ${completed ? 'text-gray-500 line-through' : 'text-gray-900'}`}>
                                {label}
                              </span>
                              {completed && completedDate && (
                                <p className="text-xs text-gray-400">
                                  Completed {new Date(completedDate).toLocaleDateString('en-GB')}
                                </p>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-3">Actions</h4>
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          onClick={() => selectedContact.enriched ? null : enrichContact(selectedContact.id)}
                          disabled={selectedContact.enriched || enrichmentsLeft <= 0}
                          className={`flex items-center justify-center space-x-2 py-3 px-4 rounded-lg font-medium transition-all ${
                            selectedContact.enriched 
                              ? 'bg-green-100 text-green-800 cursor-not-allowed'
                              : enrichmentsLeft <= 0
                              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                              : 'bg-blue-500 hover:bg-blue-600 text-white'
                          }`}
                        >
                          <Zap className="w-4 h-4" />
                          <span>{selectedContact.enriched ? 'Enriched' : 'Enrich Contact'}</span>
                        </button>

                        <button
                          onClick={() => window.open(selectedContact.linkedinUrl, '_blank')}
                          className="flex items-center justify-center space-x-2 py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all"
                        >
                          <User className="w-4 h-4" />
                          <span>View Profile</span>
                        </button>
                      </div>

                      <button
                        onClick={() => generateContactMessage(selectedContact)}
                        disabled={isGeneratingMessage}
                        className={`w-full flex items-center justify-center space-x-2 py-3 px-4 rounded-lg font-medium transition-all ${
                          isGeneratingMessage
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-purple-500 hover:bg-purple-600 text-white'
                        }`}
                      >
                        {isGeneratingMessage ? (
                          <>
                            <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                            <span>Generating Message...</span>
                          </>
                        ) : (
                          <>
                            <MessageSquare className="w-4 h-4" />
                            <span>Generate Message</span>
                          </>
                        )}
                      </button>

                      {generatedMessage && (
                        <div className="bg-gray-50 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <h5 className="text-sm font-medium text-gray-900">Generated Message</h5>
                            <button
                              onClick={() => copyToClipboard(generatedMessage)}
                              className="flex items-center space-x-1 text-blue-600 hover:text-blue-700 text-sm"
                            >
                              <Copy className="w-3 h-3" />
                              <span>Copy</span>
                            </button>
                          </div>
                          <p className="text-gray-700 text-sm leading-relaxed">{generatedMessage}</p>
                          {copyFeedback && (
                            <p className="text-green-600 text-xs mt-2">{copyFeedback}</p>
                          )}
                        </div>
                      )}

                      <button
                        onClick={() => deleteContact(selectedContact.id)}
                        className="w-full py-2 px-4 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-all"
                      >
                        Delete Contact
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Writing Style Analysis Modal (Change 6) */}
      {showWritingStyleModal && writingStyle && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b">
              <div>
                <h3 className="text-xl font-semibold text-gray-900">Your Writing Style Analysis</h3>
                <p className="text-gray-600 text-sm mt-1">
                  This analysis will be used to create lead magnets that match your unique voice
                </p>
              </div>
              <button
                onClick={() => setShowWritingStyleModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Summary */}
              <div className="bg-purple-50 rounded-lg p-4">
                <h4 className="font-semibold text-purple-900 mb-2">Style Summary</h4>
                <p className="text-purple-800">{writingStyle.summary}</p>
              </div>

              {/* Analysis Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Tone</h4>
                    <p className="text-gray-700 text-sm">{writingStyle.tone}</p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Voice Characteristics</h4>
                    <p className="text-gray-700 text-sm">{writingStyle.voice}</p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Sentence Structure</h4>
                    <p className="text-gray-700 text-sm">{writingStyle.sentenceStructure}</p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Language Complexity</h4>
                    <p className="text-gray-700 text-sm">{writingStyle.complexity}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Personality</h4>
                    <p className="text-gray-700 text-sm">{writingStyle.personality}</p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Communication Style</h4>
                    <p className="text-gray-700 text-sm">{writingStyle.communicationStyle}</p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Key Phrases</h4>
                    <div className="flex flex-wrap gap-2">
                      {writingStyle.keyPhrases.map((phrase, index) => (
                        <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                          "{phrase}"
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Writing Strengths</h4>
                    <ul className="list-disc list-inside text-gray-700 text-sm space-y-1">
                      {writingStyle.strengths.map((strength, index) => (
                        <li key={index}>{strength}</li>
                      ))}
                    </ul>
                  </div>
                  
                  {writingStyle.britishPreference && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Language Preference</h4>
                      <p className="text-gray-700 text-sm">{writingStyle.britishPreference}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3 pt-4 border-t">
                <button
                  onClick={() => setShowWritingStyleModal(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    setShowWritingStyleModal(false);
                    setCurrentView('lead-magnets');
                  }}
                  className="px-6 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors"
                >
                  Create Lead Magnet
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}