import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Mail, Lock, Eye, EyeOff, ArrowRight, Sparkles, Shield, Users, Upload, Target, UserCheck, Building, BarChart3, Calendar, Settings, CheckCircle, User, Briefcase, Plus, TrendingUp, Zap, Menu, FileText, LogOut } from 'lucide-react';

// Storage version for backwards compatibility
const STORAGE_VERSION = '1.0';

// Storage keys
const STORAGE_KEYS = {
  USER_DATA: 'glassSlipperUserData',
  CONTACTS: 'glassSlipperContacts',
  CATEGORIES: 'glassSlipperCategories',
  TASKS: 'glassSlipperTasks',
  SETTINGS: 'glassSlipperSettings',
  VERSION: 'glassSlipperVersion'
};

// LinkedIn Formula AI Client - Updated for Vercel API
class LinkedInFormulaAI {
  constructor() {
    // Use relative URLs for Vercel API endpoints
    this.baseURL = '/api';
    
    // LinkedIn Formula Knowledge Base (from Adam Houlahan's book)
    this.linkedinFormula = {
      coreProcess: [
        "① Define your one offer",
        "② Create your value proposition",
        "③ Build your Ideal Customer Profile",
        "④ Do some customer interviews",
        "⑤ Discover your style",
        "⑥ Shoot some content",
        "⑦ Write your profile",
        "⑧ Build the strategy",
        "⑨ Start implementing it",
        "⑩ Constantly review"
      ],
      contentStrategy: {
        funnelSplit: "3 Awareness + 2 Interest + 1 Decision + 1 Action posts per week",
        philosophy: "Content moves people through funnel: Awareness → Interest → Decision → Action",
        simpleApproach: [
          "The problem you solve",
          "The results people get from working with you",
          "How people can work with you",
          "Who you are"
        ],
        contentTypes: [
          "Education - show expertise and solve problems",
          "Storytelling - case studies with emotional connection",
          "Personal - build relationships and show personality",
          "Expertise - demonstrate knowledge and give advice",
          "Sales - clear offers with strong call-to-action"
        ]
      },
      engagementPrinciples: [
        "Quality over quantity - meaningful relationships with right people",
        "Value-first approach with soft pitch, content-driven outreach",
        "Profile as landing page designed to convert viewers into connections",
        "Track quality metrics: profile views from ideal customers, reply rates, meetings booked"
      ],
      oneThingStrategy: "Be known for one specific thing rather than everything - just because you promote one thing doesn't mean you lose everything else",
      messagingApproach: "Appreciate connecting + value delivery + soft CTA, avoid spam-like automation"
    };
  }

  async callClaude(prompt, model = 'claude-3-sonnet-20240229', maxTokens = 1000) {
    try {
      const response = await fetch(`${this.baseURL}/claude`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          model,
          maxTokens
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `API request failed: ${response.status}`);
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Claude API Error:', error);
      throw error;
    }
  }

  async searchWeb(query) {
    try {
      console.log('Searching web for:', query);
      
      const response = await fetch(`${this.baseURL}/search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query, num: 10 })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Search API request failed: ${response.status}`);
      }

      const data = await response.json();
      console.log('Search API response received');
      return data.data;
    } catch (error) {
      console.error('Web search failed:', error);
      throw error;
    }
  }

  async enrichContactData(contact) {
    try {
      console.log('Starting contact enrichment for:', contact.firstName, contact.lastName, contact.company);
      
      const response = await fetch(`${this.baseURL}/enrich-contact`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ contact })
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Enrichment API Error:', errorData);
        
        // Return fallback data if provided by backend
        if (errorData.fallbackData) {
          return errorData.fallbackData;
        }
        
        throw new Error(errorData.error || `Enrichment failed: ${response.status}`);
      }

      const data = await response.json();
      console.log('Contact enrichment completed successfully');
      return data.data;

    } catch (error) {
      console.error('Contact enrichment failed:', error);
      
      // Fallback response
      return {
        basicInfo: {
          phone: "Enrichment failed",
          location: "Enrichment failed", 
          industry: "Enrichment failed",
          companyWebsite: "Enrichment failed",
          linkedinProfile: "Enrichment failed"
        },
        companyIntelligence: {
          companyFullName: contact.company || "Unknown",
          companySize: "Enrichment failed",
          services: "Enrichment failed", 
          foundOnWebsite: "API unavailable"
        },
        searchQuality: "Low",
        dataSource: `Error: ${error.message}`
      };
    }
  }

  async categoriseContact(contact, userContext = {}) {
    const prompt = `Based on LinkedIn Formula methodology, categorise this contact.

CONTACT DETAILS:
Name: ${contact.firstName} ${contact.lastName}
Company: ${contact.company}
Position: ${contact.position}
Current Category: ${contact.category || 'Uncategorised'}

USER CONTEXT:
Business Type: ${userContext.businessType || 'Not specified'}
Target Market: ${userContext.targetMarket || 'Not specified'}
Services: ${userContext.services || 'Not specified'}

CATEGORIES:
- Ideal Client: Direct prospects who need your services
- Referral Partner: Could refer business to you
- Competitor: Direct or indirect competitor
- Supplier/Vendor: Could provide services to you
- Other: Doesn't fit above categories

Respond with ONLY a JSON object:
{
  "category": "Ideal Client|Referral Partner|Competitor|Supplier/Vendor|Other",
  "confidence": 0.85,
  "reasoning": "Brief explanation of why this category fits"
}`;

    try {
      const response = await this.callClaude(prompt);
      return JSON.parse(response);
    } catch (error) {
      console.error('Contact categorisation failed:', error);
      return {
        category: 'Other',
        confidence: 0.1,
        reasoning: 'AI categorisation failed'
      };
    }
  }

  async generateMessage(contact, messageType, userContext) {
    const contextPrompt = `Generate a ${messageType} message for this contact:
Name: ${contact.firstName} ${contact.lastName}
Company: ${contact.company}
Title: ${contact.title || 'Not specified'}
Category: ${contact.category || 'Uncategorised'}

User Context: ${JSON.stringify(userContext)}
Keep it professional and personalised.
Max 150 words for connection requests, 200 words for follow-ups.

Respond with ONLY a JSON object:
{
  "message": "The complete message text",
  "subject": "Subject line if applicable",
  "callToAction": "Specific next step being requested"
}`;

    try {
      const response = await this.callClaude(contextPrompt);
      return JSON.parse(response);
    } catch (error) {
      console.error('Message generation failed:', error);
      return {
        message: `Hi ${contact.firstName}, I noticed your work at ${contact.company} and would love to connect. I believe there might be some valuable synergies between our businesses.`,
        subject: 'Connection Request',
        callToAction: 'Accept connection request'
      };
    }
  }

  async generateContentStrategy(userProfile, contacts) {
    const prompt = `Based on LinkedIn Formula methodology, create a content strategy for this user.

USER PROFILE:
${JSON.stringify(userProfile, null, 2)}

CONTACT CATEGORIES SUMMARY:
${this.generateContactSummary(contacts)}

LINKEDIN FORMULA REQUIREMENTS:
- Content funnel: 3 Awareness + 2 Interest + 1 Decision + 1 Action posts per week
- Content types: Education, Storytelling, Personal, Expertise, Sales
- Focus on one core offer/message
- Build profile as landing page

Generate a strategic content plan with specific post ideas.

Respond with ONLY a JSON object:
{
  "coreMessage": "One thing you want to be known for",
  "weeklyPosts": [
    {
      "type": "Awareness",
      "topic": "Post topic",
      "content": "Full post content"
    }
  ],
  "profileOptimisation": {
    "headline": "Optimised LinkedIn headline",
    "about": "About section content"
  }
}`;

    try {
      const response = await this.callClaude(prompt);
      return JSON.parse(response);
    } catch (error) {
      console.error('Content strategy generation failed:', error);
      return {
        error: 'Failed to generate content strategy',
        coreMessage: 'Define your unique value proposition',
        weeklyPosts: []
      };
    }
  }

  async analyzeWritingStyle(writingSamples) {
    const prompt = `Analyze the writing style from these samples to create a comprehensive style profile.

WRITING SAMPLES:
${writingSamples.map((sample, index) => `
Sample ${index + 1}:
${sample}
`).join('\n')}

ANALYSIS REQUIREMENTS:
Analyze tone, vocabulary, sentence structure, personality, formality level, and persuasion techniques.

Respond with ONLY a JSON object:
{
  "tone": "Professional|Casual|Friendly|Authoritative|Conversational",
  "personality": ["traits"],
  "vocabulary": "Simple|Sophisticated|Technical|Accessible",
  "sentenceStructure": "Short and punchy|Varied lengths|Long and detailed",
  "formalityLevel": "Formal|Semi-formal|Casual|Very casual",
  "persuasionStyle": "Direct|Consultative|Story-driven|Data-driven",
  "uniqueElements": ["distinctive features"],
  "voiceDescription": "Overall voice description"
}`;

    try {
      const response = await this.callClaude(prompt);
      return JSON.parse(response);
    } catch (error) {
      console.error('Writing style analysis failed:', error);
      return {
        tone: 'Professional',
        personality: ['Analytical'],
        vocabulary: 'Accessible',
        sentenceStructure: 'Varied lengths',
        formalityLevel: 'Semi-formal',
        persuasionStyle: 'Consultative',
        uniqueElements: ['Clear communication'],
        voiceDescription: 'Professional and approachable'
      };
    }
  }

  async generateLeadMagnet(contact, userProfile, writingStyle) {
    const prompt = `Create a personalised lead magnet for this specific contact using the LinkedIn Formula approach.

CONTACT DETAILS:
Name: ${contact.firstName} ${contact.lastName}
Company: ${contact.company}
Position: ${contact.position}
Category: ${contact.category}
${contact.enrichmentData ? `
Company Intelligence: ${JSON.stringify(contact.enrichmentData.companyIntelligence, null, 2)}
Personal Intelligence: ${JSON.stringify(contact.enrichmentData.personalIntelligence, null, 2)}
` : ''}

USER PROFILE:
Company: ${userProfile.company}
Business Type: ${userProfile.businessType}
Value Proposition: ${userProfile.goals}

WRITING STYLE:
${JSON.stringify(writingStyle, null, 2)}

LINKEDIN FORMULA PRINCIPLES:
- Focus on ONE specific problem that your ideal customer has
- Provide immediate value and actionable insights
- Position yourself as the expert solution
- Include soft CTA that leads to conversation
- Build trust through valuable content

LEAD MAGNET TYPES:
1. Checklists & Templates
2. Industry Reports & Research
3. How-to Guides & Tutorials
4. Tools & Calculators (text-based)
5. Resource Lists & Directories

Create a lead magnet that would be irresistible to this specific contact based on their role, company situation, and likely challenges.

Please respond with ONLY a JSON object in this exact format:
{
  "leadMagnetTitle": "Specific, benefit-focused title",
  "type": "Checklist|Guide|Report|Template|Resource List",
  "personalizedIntro": "Opening paragraph explaining why this is perfect for them",
  "mainContent": "Complete lead magnet content (2000-3000 words)",
  "callToAction": "Specific next step to continue the conversation",
  "deliveryMessage": "LinkedIn message to send when sharing this lead magnet",
  "followUpSequence": ["Follow-up message 1", "Follow-up message 2", "Follow-up message 3"],
  "relevanceScore": 95,
  "estimatedValue": "$500+ value equivalent"
}`;

    try {
      const response = await this.callClaude(prompt);
      return JSON.parse(response);
    } catch (error) {
      console.error('Lead magnet generation failed:', error);
      return {
        leadMagnetTitle: `Personalized Business Growth Guide for ${contact.firstName}`,
        type: "Guide",
        personalizedIntro: `Hi ${contact.firstName}, based on your role at ${contact.company}, I've created this customized guide to address the specific challenges you're likely facing.`,
        mainContent: "This comprehensive guide covers key strategies for business growth, tailored for professionals in your industry...",
        callToAction: "Would you like to discuss how these strategies could specifically apply to your situation at " + contact.company + "?",
        deliveryMessage: `Hi ${contact.firstName}, I noticed your background in ${contact.position} and thought you might find this relevant. I've put together a quick guide that might help with some of the challenges you're likely facing. Would you be interested in taking a look?`,
        followUpSequence: [
          "Did you get a chance to review the guide I sent over?",
          "I'd love to hear your thoughts on the strategies mentioned in the guide.",
          "Would you be open to a brief call to discuss how these might apply to your specific situation?"
        ],
        relevanceScore: 85,
        estimatedValue: "$300+ value equivalent"
      };
    }
  }

  generateContactSummary(contacts) {
    const categoryCounts = contacts.reduce((acc, contact) => {
      acc[contact.category || 'Uncategorised'] = (acc[contact.category || 'Uncategorised'] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(categoryCounts)
      .map(([category, count]) => `${category}: ${count}`)
      .join(', ');
  }
}

// Storage management utility
const StorageManager = {
  save: (key, data) => {
    try {
      const serialized = JSON.stringify({
        data,
        timestamp: new Date().toISOString(),
        version: STORAGE_VERSION
      });
      localStorage.setItem(key, serialized);
      return true;
    } catch (error) {
      console.error(`Failed to save ${key}:`, error);
      return false;
    }
  },

  load: (key, defaultValue = null) => {
    try {
      const item = localStorage.getItem(key);
      if (!item) return defaultValue;
      
      const parsed = JSON.parse(item);
      
      // Version compatibility check
      if (parsed.version !== STORAGE_VERSION) {
        console.warn(`Storage version mismatch for ${key}. Expected ${STORAGE_VERSION}, got ${parsed.version}`);
        return defaultValue;
      }
      
      return parsed.data;
    } catch (error) {
      console.error(`Failed to load ${key}:`, error);
      return defaultValue;
    }
  },

  remove: (key) => {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error(`Failed to remove ${key}:`, error);
      return false;
    }
  },

  clear: () => {
    try {
      Object.values(STORAGE_KEYS).forEach(key => {
        localStorage.removeItem(key);
      });
      return true;
    } catch (error) {
      console.error('Failed to clear storage:', error);
      return false;
    }
  }
};

// Main Glass Slipper App Component
const GlassSlipperApp = () => {
  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authView, setAuthView] = useState('landing'); // 'landing', 'signin', 'signup'
  const [currentUser, setCurrentUser] = useState(null);

  // Main app state
  const [activeTab, setActiveTab] = useState('dashboard');
  const [contacts, setContacts] = useState([]);
  const [selectedContact, setSelectedContact] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');

  // Task and settings state
  const [tasks, setTasks] = useState([]);
  const [user, setUser] = useState({
    businessType: '',
    targetMarket: '',
    services: '',
    goals: '',
    writingStyle: null,
    linkedinProfile: ''
  });

  // File upload state
  const fileInputRef = useRef(null);
  const [isUploading, setIsUploading] = useState(false);

  // AI client
  const [linkedinAI] = useState(() => new LinkedInFormulaAI());

  // Load data on component mount
  useEffect(() => {
    const savedUser = StorageManager.load(STORAGE_KEYS.USER_DATA);
    const savedContacts = StorageManager.load(STORAGE_KEYS.CONTACTS, []);
    const savedTasks = StorageManager.load(STORAGE_KEYS.TASKS, []);
    const savedSettings = StorageManager.load(STORAGE_KEYS.SETTINGS, {});

    if (savedUser) {
      setCurrentUser(savedUser);
      setIsAuthenticated(true);
    }

    setContacts(savedContacts);
    setTasks(savedTasks);
    setUser(prev => ({ ...prev, ...savedSettings }));
  }, []);

  // Save data when state changes
  useEffect(() => {
    if (currentUser) {
      StorageManager.save(STORAGE_KEYS.USER_DATA, currentUser);
    }
  }, [currentUser]);

  useEffect(() => {
    StorageManager.save(STORAGE_KEYS.CONTACTS, contacts);
  }, [contacts]);

  useEffect(() => {
    StorageManager.save(STORAGE_KEYS.TASKS, tasks);
  }, [tasks]);

  useEffect(() => {
    StorageManager.save(STORAGE_KEYS.SETTINGS, user);
  }, [user]);

  // Statistics calculations
  const totalUsers = 247;
  const activeUsers = 189;
  const totalContacts = contacts.length;
  const completedTasks = tasks.filter(task => task.completed).length;

  // Contact filtering
  const filteredContacts = contacts.filter(contact => {
    const matchesSearch = contact.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         contact.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         contact.company.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'All' || contact.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  // Get unique categories for filter
  const categories = ['All', ...new Set(contacts.map(c => c.category).filter(Boolean))];

  // CSV Upload functionality
  const handleFileUpload = useCallback(async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setIsUploading(true);
    
    try {
      const text = await file.text();
      const lines = text.split('\n').filter(line => line.trim());
      
      if (lines.length < 2) {
        alert('CSV file appears to be empty or invalid.');
        return;
      }

      const headers = lines[0].split(',').map(h => h.trim().replace(/['"]/g, ''));
      console.log('CSV Headers:', headers);

      const newContacts = [];
      
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim().replace(/['"]/g, ''));
        
        if (values.length >= 3) { // Minimum required fields
          const contact = {
            id: Date.now() + Math.random(),
            firstName: values[0] || 'Unknown',
            lastName: values[1] || '',
            company: values[2] || 'Unknown Company',
            position: values[3] || '',
            email: values[4] || '',
            phone: values[5] || '',
            location: values[6] || '',
            industry: values[7] || '',
            category: 'Uncategorised',
            notes: '',
            lastContact: null,
            tags: [],
            tasks: [],
            leadMagnets: [],
            imported: new Date().toISOString()
          };
          
          newContacts.push(contact);
        }
      }

      if (newContacts.length > 0) {
        setContacts(prev => [...prev, ...newContacts]);
        alert(`Successfully imported ${newContacts.length} contacts!`);
      } else {
        alert('No valid contacts found in the CSV file.');
      }
    } catch (error) {
      console.error('File upload error:', error);
      alert('Error processing CSV file. Please check the format and try again.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  }, []);

  // AI Functions
  const categoriseWithAI = async (contact) => {
    try {
      const result = await linkedinAI.categoriseContact(contact, user);
      
      const updatedContact = {
        ...contact,
        category: result.category,
        aiConfidence: result.confidence,
        aiReasoning: result.reasoning,
        lastCategorised: new Date()
      };

      setContacts(prev => prev.map(c =>
        c.id === contact.id ? updatedContact : c
      ));

      return updatedContact;
    } catch (error) {
      console.error('AI categorisation failed:', error);
      alert('AI categorisation failed. Please check your API configuration.');
      return contact;
    }
  };

  // Test Serper API connection
  const testSerperAPI = async () => {
    try {
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: 'test search',
          num: 3
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        alert(`❌ Serper API Error: ${response.status} - ${errorData.error}`);
        return;
      }

      const data = await response.json();
      console.log('API Response data:', data);
      alert('✅ Serper API is working! Check console for details.');
      
    } catch (error) {
      console.error('Serper API Test Error:', error);
      alert(`❌ API Test Failed: ${error.message}`);
    }
  };

  const enrichContactData = async (contact) => {
    try {
      const enrichmentData = await linkedinAI.enrichContactData(contact);

      const updatedContact = {
        ...contact,
        // Update main contact fields with enriched data if found
        phone: (enrichmentData.basicInfo?.phone && enrichmentData.basicInfo.phone !== 'Not found') ? enrichmentData.basicInfo.phone : contact.phone,
        location: (enrichmentData.basicInfo?.location && enrichmentData.basicInfo.location !== 'Not found') ? enrichmentData.basicInfo.location : contact.location,
        industry: (enrichmentData.basicInfo?.industry && enrichmentData.basicInfo.industry !== 'Not found') ? enrichmentData.basicInfo.industry : contact.industry,
        companyWebsite: (enrichmentData.basicInfo?.companyWebsite && enrichmentData.basicInfo.companyWebsite !== 'Not found') ? enrichmentData.basicInfo.companyWebsite : contact.companyWebsite,
        linkedinProfile: (enrichmentData.basicInfo?.linkedinProfile && enrichmentData.basicInfo.linkedinProfile !== 'Not found') ? enrichmentData.basicInfo.linkedinProfile : contact.linkedinProfile,
        // Store full enrichment data
        enrichmentData,
        lastEnriched: new Date()
      };

      setContacts(prev => prev.map(c =>
        c.id === contact.id ? updatedContact : c
      ));

      const foundItems = Object.values(enrichmentData.basicInfo || {}).filter(value => value && value !== 'Not found' && value !== 'Search failed').length;
      if (foundItems > 0) {
        alert(`✅ Contact enrichment completed! Found ${foundItems} pieces of new information. Check the contact details to see the results.`);
      } else {
        alert(`⚠️ Contact enrichment completed but no new information was found. This might be due to limited search results or API issues.`);
      }
      return updatedContact;
    } catch (error) {
      console.error('Contact enrichment failed:', error);
      alert('Contact enrichment failed. Please check your API configuration.');
      return contact;
    }
  };

  // Generate lead magnet for contact
  const generateLeadMagnet = async (contact) => {
    try {
      if (!user.writingStyle) {
        alert('Please analyze your writing style first in Settings before generating lead magnets.');
        return;
      }

      const leadMagnet = await linkedinAI.generateLeadMagnet(contact, user, user.writingStyle);

      const updatedContact = {
        ...contact,
        leadMagnets: [...(contact.leadMagnets || []), leadMagnet],
        lastLeadMagnetGenerated: new Date()
      };

      setContacts(prev => prev.map(c =>
        c.id === contact.id ? updatedContact : c
      ));

      // Show the lead magnet in a modal or alert
      alert(`Lead magnet generated: "${leadMagnet.leadMagnetTitle}"\n\nCheck the contact details to view the full content.`);
      return updatedContact;
    } catch (error) {
      console.error('Lead magnet generation failed:', error);
      alert('Lead magnet generation failed. Please check your API configuration.');
      return contact;
    }
  };

  // Categorise all uncategorised contacts with AI
  const categoriseAllWithAI = async () => {
    const uncategorised = contacts.filter(c => c.category === 'Uncategorised');

    if (uncategorised.length === 0) {
      alert('No uncategorised contacts found.');
      return;
    }

    if (!window.confirm(`This will categorise ${uncategorised.length} contacts using AI. This may take a few minutes and will use API credits. Continue?`)) {
      return;
    }

    let processed = 0;
    for (const contact of uncategorised) {
      try {
        await categoriseWithAI(contact);
        processed++;
        
        // Brief delay to avoid overwhelming the API
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.error(`Failed to categorise ${contact.firstName} ${contact.lastName}:`, error);
      }
    }

    alert(`✅ Completed! Successfully categorised ${processed} out of ${uncategorised.length} contacts.`);
  };

  // Landing page component
  const LandingPage = () => {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900">
        <div className="flex flex-col min-h-screen">
          {/* Header */}
          <header className="bg-white bg-opacity-10 backdrop-blur border-b border-white border-opacity-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center py-4">
                <div className="flex items-center space-x-3">
                  <div className="bg-yellow-400 p-2 rounded-full">
                    <Sparkles className="w-6 h-6 text-purple-900" />
                  </div>
                  <span className="text-xl font-bold text-white">Glass Slipper</span>
                  <span className="bg-yellow-400 text-purple-900 px-2 py-1 rounded-full text-xs font-semibold">
                    v1.0 Beta
                  </span>
                </div>
                <div className="flex space-x-4">
                  <button
                    onClick={() => setAuthView('signin')}
                    className="text-white hover:text-yellow-400 px-4 py-2 rounded-lg transition-all"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => setAuthView('signup')}
                    className="bg-yellow-400 hover:bg-yellow-300 text-purple-900 px-6 py-2 rounded-lg font-semibold transition-all"
                  >
                    Get Started
                  </button>
                </div>
              </div>
            </div>
          </header>

          {/* Hero Section */}
          <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto text-center">
              <div className="mb-8">
                <div className="inline-flex items-center space-x-2 bg-white bg-opacity-10 backdrop-blur rounded-full px-4 py-2 mb-6">
                  <Shield className="w-4 h-4 text-yellow-400" />
                  <span className="text-white text-sm">AI-Powered ABM Platform</span>
                </div>
                <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
                  Transform Your LinkedIn Connections Into
                  <span className="text-yellow-400"> Strategic Business Relationships</span>
                </h1>
                <p className="text-xl text-white text-opacity-80 mb-8 leading-relaxed max-w-3xl mx-auto">
                  Glass Slipper uses advanced AI to categorise your LinkedIn contacts, enrich their data, and generate personalised content that converts connections into clients.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
                <button
                  onClick={() => setAuthView('signup')}
                  className="bg-yellow-400 hover:bg-yellow-300 text-purple-900 px-8 py-4 rounded-xl font-bold text-lg transition-all transform hover:scale-105 flex items-center justify-center space-x-2"
                >
                  <span>Start Your Free Trial</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setAuthView('signin')}
                  className="bg-white bg-opacity-10 backdrop-blur hover:bg-opacity-20 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all border border-white border-opacity-20"
                >
                  Watch Demo
                </button>
              </div>

              {/* Stats */}
              <div className="flex justify-center items-center space-x-8 opacity-60">
                <div className="bg-white bg-opacity-10 px-6 py-3 rounded-lg">
                  <span className="text-white font-semibold">250+ Users</span>
                </div>
                <div className="bg-white bg-opacity-10 px-6 py-3 rounded-lg">
                  <span className="text-white font-semibold">50K+ Contacts Processed</span>
                </div>
                <div className="bg-white bg-opacity-10 px-6 py-3 rounded-lg">
                  <span className="text-white font-semibold">85% Accuracy Rate</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Sign in page component
  const SignInPage = () => {
    const [formData, setFormData] = useState({
      email: '',
      password: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleInputChange = (field, value) => {
      setFormData(prev => ({ ...prev, [field]: value }));
      if (error) setError('');
    };

    const handleSubmit = async (e) => {
      e.preventDefault();
      setIsLoading(true);
      setError('');

      try {
        // Simulate authentication delay
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // For demo purposes, any email/password combo works
        if (formData.email && formData.password) {
          const userData = {
            email: formData.email,
            name: formData.email.split('@')[0],
            lastLogin: new Date().toISOString(),
            company: 'Demo Company',
            businessType: 'Sales Professional'
          };
          
          StorageManager.save(STORAGE_KEYS.USER_DATA, userData);
          setCurrentUser(userData);
          setIsAuthenticated(true);
        } else {
          setError('Please enter both email and password');
        }
      } catch (err) {
        setError('Sign in failed. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 flex items-center justify-center px-4">
        <div className="max-w-md w-full">
          <div className="bg-white bg-opacity-10 backdrop-blur rounded-xl p-8">
            <div className="text-center mb-8">
              <div className="flex justify-center mb-4">
                <div className="bg-white bg-opacity-10 p-3 rounded-full">
                  <Sparkles className="w-8 h-8 text-yellow-400" />
                </div>
              </div>
              <h2 className="text-3xl font-bold text-white mb-2">Welcome Back</h2>
              <p className="text-white text-opacity-70">Sign in to your Glass Slipper account</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-500 bg-opacity-20 border border-red-500 text-red-200 px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-white text-sm font-medium mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white text-opacity-50 w-5 h-5" />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-white bg-opacity-10 backdrop-blur border border-white border-opacity-20 rounded-lg text-white placeholder-white placeholder-opacity-50 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                    placeholder="Enter your email"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-white text-sm font-medium mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white text-opacity-50 w-5 h-5" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    className="w-full pl-12 pr-12 py-3 bg-white bg-opacity-10 backdrop-blur border border-white border-opacity-20 rounded-lg text-white placeholder-white placeholder-opacity-50 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                    placeholder="Enter your password"
                    required
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
                type="submit"
                disabled={isLoading}
                className="w-full bg-yellow-400 hover:bg-yellow-300 disabled:bg-yellow-600 text-purple-900 font-bold py-3 px-4 rounded-lg transition-all flex items-center justify-center space-x-2"
              >
                {isLoading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-purple-900 border-t-transparent"></div>
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-white text-opacity-70">
                Don't have an account?{' '}
                <button
                  onClick={() => setAuthView('signup')}
                  className="text-yellow-400 hover:text-yellow-300 font-medium"
                >
                  Sign up here
                </button>
              </p>
            </div>

            <div className="mt-4 text-center">
              <button
                onClick={() => setAuthView('landing')}
                className="text-white text-opacity-50 hover:text-opacity-70 text-sm"
              >
                ← Back to home
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Sign up page component (simplified for demo)
  const SignUpPage = () => {
    const [formData, setFormData] = useState({
      name: '',
      email: '',
      password: '',
      company: ''
    });

    const handleSubmit = (e) => {
      e.preventDefault();
      // For demo, just redirect to sign in
      alert('Account created successfully! Please sign in.');
      setAuthView('signin');
    };

    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 flex items-center justify-center px-4">
        <div className="max-w-md w-full">
          <div className="bg-white bg-opacity-10 backdrop-blur rounded-xl p-8">
            <div className="text-center mb-8">
              <div className="flex justify-center mb-4">
                <div className="bg-white bg-opacity-10 p-3 rounded-full">
                  <Sparkles className="w-8 h-8 text-yellow-400" />
                </div>
              </div>
              <h2 className="text-3xl font-bold text-white mb-2">Create Account</h2>
              <p className="text-white text-opacity-70">Start your free trial today</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-white text-sm font-medium mb-2">Full Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-4 py-3 bg-white bg-opacity-10 backdrop-blur border border-white border-opacity-20 rounded-lg text-white placeholder-white placeholder-opacity-50 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  placeholder="Enter your full name"
                  required
                />
              </div>

              <div>
                <label className="block text-white text-sm font-medium mb-2">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-4 py-3 bg-white bg-opacity-10 backdrop-blur border border-white border-opacity-20 rounded-lg text-white placeholder-white placeholder-opacity-50 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  placeholder="Enter your email"
                  required
                />
              </div>

              <div>
                <label className="block text-white text-sm font-medium mb-2">Company</label>
                <input
                  type="text"
                  value={formData.company}
                  onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
                  className="w-full px-4 py-3 bg-white bg-opacity-10 backdrop-blur border border-white border-opacity-20 rounded-lg text-white placeholder-white placeholder-opacity-50 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  placeholder="Enter your company name"
                  required
                />
              </div>

              <div>
                <label className="block text-white text-sm font-medium mb-2">Password</label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  className="w-full px-4 py-3 bg-white bg-opacity-10 backdrop-blur border border-white border-opacity-20 rounded-lg text-white placeholder-white placeholder-opacity-50 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  placeholder="Create a password"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full bg-yellow-400 hover:bg-yellow-300 text-purple-900 font-bold py-3 px-4 rounded-lg transition-all"
              >
                Create Account
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-white text-opacity-70">
                Already have an account?{' '}
                <button
                  onClick={() => setAuthView('signin')}
                  className="text-yellow-400 hover:text-yellow-300 font-medium"
                >
                  Sign in here
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Main dashboard component
  const Dashboard = () => {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900">
        <div className="flex h-screen">
          {/* Sidebar */}
          <div className="w-64 bg-white bg-opacity-10 backdrop-blur border-r border-white border-opacity-20">
            <div className="p-6">
              <div className="flex items-center space-x-3 mb-8">
                <div className="bg-yellow-400 p-2 rounded-full">
                  <Sparkles className="w-6 h-6 text-purple-900" />
                </div>
                <div>
                  <span className="text-xl font-bold text-white">Glass Slipper</span>
                  <span className="block text-xs text-white text-opacity-60">ABM Platform</span>
                </div>
              </div>

              <nav className="space-y-2">
                {[
                  { id: 'dashboard', icon: BarChart3, label: 'Dashboard' },
                  { id: 'contacts', icon: Users, label: 'Contacts' },
                  { id: 'tasks', icon: CheckCircle, label: 'Tasks' },
                  { id: 'content', icon: FileText, label: 'Content' },
                  { id: 'settings', icon: Settings, label: 'Settings' }
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
                      activeTab === item.id
                        ? 'bg-yellow-400 text-purple-900'
                        : 'text-white hover:bg-white hover:bg-opacity-10'
                    }`}
                  >
                    <item.icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Header */}
            <div className="bg-white bg-opacity-10 backdrop-blur border-b border-white border-opacity-20 px-6 py-4">
              <div className="flex justify-between items-center">
                <div>
                  <h1 className="text-2xl font-bold text-white capitalize">{activeTab}</h1>
                  <p className="text-white text-opacity-70">Glass Slipper Platform Overview</p>
                </div>
                <button
                  onClick={() => setIsAuthenticated(false)}
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-all flex items-center space-x-2"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8 p-6">
              <div className="bg-white bg-opacity-10 backdrop-blur rounded-xl p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white text-opacity-70 text-sm">Total Users</p>
                    <p className="text-3xl font-bold text-white">{totalUsers}</p>
                  </div>
                  <Users className="w-8 h-8 text-blue-400" />
                </div>
              </div>

              <div className="bg-white bg-opacity-10 backdrop-blur rounded-xl p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white text-opacity-70 text-sm">Active Users</p>
                    <p className="text-3xl font-bold text-white">{activeUsers}</p>
                  </div>
                  <UserCheck className="w-8 h-8 text-green-400" />
                </div>
              </div>

              <div className="bg-white bg-opacity-10 backdrop-blur rounded-xl p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white text-opacity-70 text-sm">Total Contacts</p>
                    <p className="text-3xl font-bold text-white">{totalContacts.toLocaleString()}</p>
                  </div>
                  <Target className="w-8 h-8 text-purple-400" />
                </div>
              </div>

              <div className="bg-white bg-opacity-10 backdrop-blur rounded-xl p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white text-opacity-70 text-sm">Tasks Completed</p>
                    <p className="text-3xl font-bold text-white">{completedTasks}</p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-yellow-400" />
                </div>
              </div>
            </div>

            {/* Tab Content */}
            <div className="flex-1 p-6 overflow-auto">
              {activeTab === 'dashboard' && (
                <div className="space-y-6">
                  <div className="bg-white bg-opacity-10 backdrop-blur rounded-xl p-6">
                    <h2 className="text-xl font-bold text-white mb-4">Welcome to Glass Slipper</h2>
                    <p className="text-white text-opacity-70 mb-4">
                      Your AI-powered ABM platform is ready to transform your LinkedIn connections into strategic business relationships.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-white bg-opacity-5 p-4 rounded-lg">
                        <h3 className="font-semibold text-white mb-2">Quick Start</h3>
                        <p className="text-white text-opacity-60 text-sm mb-3">Upload your LinkedIn connections and let AI categorise them</p>
                        <button
                          onClick={() => setActiveTab('contacts')}
                          className="bg-yellow-400 text-purple-900 px-4 py-2 rounded-lg font-medium"
                        >
                          Upload Contacts
                        </button>
                      </div>
                      <div className="bg-white bg-opacity-5 p-4 rounded-lg">
                        <h3 className="font-semibold text-white mb-2">AI Tools</h3>
                        <p className="text-white text-opacity-60 text-sm mb-3">Configure your business profile for better AI results</p>
                        <button
                          onClick={() => setActiveTab('settings')}
                          className="bg-purple-600 text-white px-4 py-2 rounded-lg font-medium"
                        >
                          Configure Settings
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'contacts' && (
                <div className="space-y-6">
                  {/* Contact Controls */}
                  <div className="bg-white bg-opacity-10 backdrop-blur rounded-xl p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                      <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
                        <div className="relative">
                          <input
                            type="text"
                            placeholder="Search contacts..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full sm:w-64 px-4 py-2 bg-white bg-opacity-10 border border-white border-opacity-20 rounded-lg text-white placeholder-white placeholder-opacity-50 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                          />
                        </div>
                        <select
                          value={categoryFilter}
                          onChange={(e) => setCategoryFilter(e.target.value)}
                          className="px-4 py-2 bg-white bg-opacity-10 border border-white border-opacity-20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
                        >
                          {categories.map(category => (
                            <option key={category} value={category} className="bg-purple-900 text-white">
                              {category}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                        <input
                          type="file"
                          ref={fileInputRef}
                          onChange={handleFileUpload}
                          accept=".csv"
                          className="hidden"
                        />
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          disabled={isUploading}
                          className="bg-yellow-400 hover:bg-yellow-300 disabled:bg-yellow-600 text-purple-900 px-4 py-2 rounded-lg font-medium flex items-center space-x-2"
                        >
                          <Upload className="w-4 h-4" />
                          <span>{isUploading ? 'Uploading...' : 'Upload CSV'}</span>
                        </button>
                        <button
                          onClick={categoriseAllWithAI}
                          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium flex items-center space-x-2"
                        >
                          <Zap className="w-4 h-4" />
                          <span>AI Categorise All</span>
                        </button>
                        <button
                          onClick={testSerperAPI}
                          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium flex items-center space-x-2"
                        >
                          <CheckCircle className="w-4 h-4" />
                          <span>Test API</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Contacts List */}
                  <div className="bg-white bg-opacity-10 backdrop-blur rounded-xl overflow-hidden">
                    <div className="p-6 border-b border-white border-opacity-20">
                      <h2 className="text-xl font-bold text-white">
                        Contacts ({filteredContacts.length})
                      </h2>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {filteredContacts.length === 0 ? (
                        <div className="p-6 text-center">
                          <Users className="w-12 h-12 text-white text-opacity-50 mx-auto mb-4" />
                          <p className="text-white text-opacity-70">
                            {contacts.length === 0 ? 'No contacts uploaded yet' : 'No contacts match your search'}
                          </p>
                        </div>
                      ) : (
                        <div className="divide-y divide-white divide-opacity-20">
                          {filteredContacts.map((contact) => (
                            <div
                              key={contact.id}
                              className="p-4 hover:bg-white hover:bg-opacity-5 cursor-pointer transition-all"
                              onClick={() => setSelectedContact(contact)}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-4">
                                  <div className="bg-white bg-opacity-10 p-3 rounded-full">
                                    <User className="w-5 h-5 text-white" />
                                  </div>
                                  <div>
                                    <h3 className="font-semibold text-white">
                                      {contact.firstName} {contact.lastName}
                                    </h3>
                                    <p className="text-white text-opacity-70 text-sm">
                                      {contact.position} at {contact.company}
                                    </p>
                                    {contact.enrichmentData && (
                                      <p className="text-green-400 text-xs mt-1">✓ Enriched</p>
                                    )}
                                  </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                    contact.category === 'Ideal Client' ? 'bg-green-500 text-white' :
                                    contact.category === 'Referral Partner' ? 'bg-blue-500 text-white' :
                                    contact.category === 'Competitor' ? 'bg-red-500 text-white' :
                                    'bg-gray-500 text-white'
                                  }`}>
                                    {contact.category || 'Uncategorised'}
                                  </span>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      categoriseWithAI(contact);
                                    }}
                                    className="bg-purple-600 hover:bg-purple-700 text-white p-2 rounded-lg transition-all"
                                  >
                                    <Zap className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      enrichContactData(contact);
                                    }}
                                    className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg transition-all"
                                  >
                                    <TrendingUp className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'tasks' && (
                <div className="bg-white bg-opacity-10 backdrop-blur rounded-xl p-6">
                  <h2 className="text-xl font-bold text-white mb-4">Task Management</h2>
                  <p className="text-white text-opacity-70">AI-generated tasks and follow-ups will appear here.</p>
                </div>
              )}

              {activeTab === 'content' && (
                <div className="bg-white bg-opacity-10 backdrop-blur rounded-xl p-6">
                  <h2 className="text-xl font-bold text-white mb-4">Content Library</h2>
                  <p className="text-white text-opacity-70">Generated lead magnets and content will be stored here.</p>
                </div>
              )}

              {activeTab === 'settings' && (
                <div className="space-y-6">
                  <div className="bg-white bg-opacity-10 backdrop-blur rounded-xl p-6">
                    <h2 className="text-xl font-bold text-white mb-4">Business Profile</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-white text-sm font-medium mb-2">Business Type</label>
                        <input
                          type="text"
                          value={user.businessType}
                          onChange={(e) => setUser(prev => ({ ...prev, businessType: e.target.value }))}
                          className="w-full px-4 py-2 bg-white bg-opacity-10 border border-white border-opacity-20 rounded-lg text-white placeholder-white placeholder-opacity-50"
                          placeholder="e.g., Marketing Consultant"
                        />
                      </div>
                      <div>
                        <label className="block text-white text-sm font-medium mb-2">Target Market</label>
                        <input
                          type="text"
                          value={user.targetMarket}
                          onChange={(e) => setUser(prev => ({ ...prev, targetMarket: e.target.value }))}
                          className="w-full px-4 py-2 bg-white bg-opacity-10 border border-white border-opacity-20 rounded-lg text-white placeholder-white placeholder-opacity-50"
                          placeholder="e.g., SME Technology Companies"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="bg-white bg-opacity-10 backdrop-blur rounded-xl p-6">
                    <h2 className="text-xl font-bold text-white mb-4">API Configuration</h2>
                    <p className="text-white text-opacity-70 mb-4">
                      API keys are configured via environment variables for security.
                    </p>
                    <div className="flex space-x-4">
                      <button
                        onClick={testSerperAPI}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium"
                      >
                        Test Search API
                      </button>
                      <button
                        onClick={async () => {
                          try {
                            await linkedinAI.callClaude('Test prompt');
                            alert('✅ Claude API is working!');
                          } catch (error) {
                            alert(`❌ Claude API Error: ${error.message}`);
                          }
                        }}
                        className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium"
                      >
                        Test Claude API
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Contact Detail Modal */}
          {selectedContact && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white bg-opacity-10 backdrop-blur rounded-xl p-6 max-w-2xl w-full max-h-96 overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-white">
                    {selectedContact.firstName} {selectedContact.lastName}
                  </h2>
                  <button
                    onClick={() => setSelectedContact(null)}
                    className="text-white text-opacity-70 hover:text-opacity-100"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-white text-opacity-70 text-sm">Company</p>
                      <p className="text-white font-medium">{selectedContact.company}</p>
                    </div>
                    <div>
                      <p className="text-white text-opacity-70 text-sm">Position</p>
                      <p className="text-white font-medium">{selectedContact.position}</p>
                    </div>
                    <div>
                      <p className="text-white text-opacity-70 text-sm">Category</p>
                      <p className="text-white font-medium">{selectedContact.category}</p>
                    </div>
                    <div>
                      <p className="text-white text-opacity-70 text-sm">Phone</p>
                      <p className="text-white font-medium">{selectedContact.phone || 'Not available'}</p>
                    </div>
                  </div>

                  {selectedContact.enrichmentData && (
                    <div className="bg-white bg-opacity-5 p-4 rounded-lg">
                      <h3 className="text-white font-semibold mb-2">Enrichment Data</h3>
                      <div className="text-white text-opacity-70 text-sm space-y-1">
                        <p>Industry: {selectedContact.enrichmentData.basicInfo?.industry}</p>
                        <p>Location: {selectedContact.enrichmentData.basicInfo?.location}</p>
                        <p>Website: {selectedContact.enrichmentData.basicInfo?.companyWebsite}</p>
                      </div>
                    </div>
                  )}

                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => {
                        categoriseWithAI(selectedContact).then(() => {
                          alert('Contact re-categorised successfully!');
                        }).catch(() => {
                          alert('Failed to categorise contact. Please check your API configuration.');
                        });
                      }}
                      className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-3 rounded-lg transition-all flex items-center justify-center space-x-2"
                    >
                      <Zap className="w-4 h-4" />
                      <span>AI Categorise</span>
                    </button>

                    <button
                      onClick={() => {
                        enrichContactData(selectedContact);
                      }}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg transition-all flex items-center justify-center space-x-2"
                    >
                      <TrendingUp className="w-4 h-4" />
                      <span>Enrich Data</span>
                    </button>

                    <button
                      onClick={() => {
                        generateLeadMagnet(selectedContact).then(() => {
                          alert('Lead magnet generated successfully!');
                        }).catch(() => {
                          alert('Failed to generate lead magnet. Please check your API configuration.');
                        });
                      }}
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-lg transition-all flex items-center justify-center space-x-2"
                    >
                      <FileText className="w-4 h-4" />
                      <span>Generate Lead Magnet</span>
                    </button>

                    <button
                      onClick={() => {
                        linkedinAI.generateMessage(selectedContact, 'connection_request', user).then((message) => {
                          alert(`Message generated:\n\n${message.message}`);
                        }).catch(() => {
                          alert('Failed to generate message. Please check your API configuration.');
                        });
                      }}
                      className="bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-3 rounded-lg transition-all flex items-center justify-center space-x-2"
                    >
                      <Mail className="w-4 h-4" />
                      <span>Generate Message</span>
                    </button>

                    <button
                      onClick={() => {
                        if (window.confirm('Delete this contact?')) {
                          setContacts(prev => prev.filter(c => c.id !== selectedContact.id));
                          setSelectedContact(null);
                        }
                      }}
                      className="bg-red-500 hover:bg-red-600 text-white px-4 py-3 rounded-lg transition-all flex items-center justify-center space-x-2"
                    >
                      <span>Delete Contact</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Main app render logic
  if (!isAuthenticated) {
    if (authView === 'landing') {
      return <LandingPage />;
    } else if (authView === 'signin') {
      return <SignInPage />;
    } else if (authView === 'signup') {
      return <SignUpPage />;
    } else {
      return <LandingPage />;
    }
  }

  return <Dashboard />;
};

export default GlassSlipperApp;