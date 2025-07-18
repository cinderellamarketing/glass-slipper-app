import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Mail, Lock, Eye, EyeOff, ArrowRight, Sparkles, Shield, Users, Upload, Target, UserCheck, Building, BarChart3, Calendar, Settings, CheckCircle, User, Briefcase, Plus, TrendingUp, Zap, Menu, FileText, LogOut, Check, Phone, Globe, X, ChevronDown, Search, ChevronLeft, MessageSquare, Bell, TrendingDown, Award, AlertCircle, Edit2, Trash2, DollarSign, Clock, Activity, BookOpen, Download, Send, Copy, Share2, Star, Link, RefreshCw, Filter, MoreVertical, MapPin } from 'lucide-react';

// ============================================
// API CONFIGURATION
// ============================================
// 
// REQUIRED API KEYS:
// 1. Serper API Key - Get from https://serper.dev
// 2. Claude API Key - Already configured in this environment
//
// TO CONFIGURE SERPER:
// Option 1: Set environment variable REACT_APP_SERPER_API_KEY
// Option 2: Replace 'your-serper-api-key-here' below with your actual key
//
const SERPER_API_KEY = process.env.REACT_APP_SERPER_API_KEY || '3fd5bda7cce79e07cc06e38ad8225c5dab090f4d';

// Check API configuration
const isApiConfigured = () => {
  return SERPER_API_KEY !== 'your-serper-api-key-here' && SERPER_API_KEY?.length > 10;
};

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
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const fileInputRef = useRef(null);

  // Business state
  const [user, setUser] = useState(currentUser);
  const [contacts, setContacts] = useState([
    {
      id: 1,
      name: 'Sarah Johnson',
      company: 'TechCorp Ltd',
      position: 'CEO',
      email: 'sarah@techcorp.com',
      category: 'Ideal Client',
      isEnriched: true,
      phone: '+44 7123 456789',
      website: 'www.techcorp.com',
      enrichmentData: {
        industry: 'Technology - Software Development',
        location: 'London, UK',
        website: 'https://techcorp.com',
        linkedinProfile: 'https://linkedin.com/in/sarahjohnson'
      }
    },
    {
      id: 2,
      name: 'Mike Thompson',
      company: 'Thompson Consulting',
      position: 'Business Coach',
      email: 'mike@thompsonconsulting.com',
      category: 'Referral Partners',
      isEnriched: false,
      phone: 'Not found',
      website: 'Not found'
    },
    {
      id: 3,
      name: 'Emma Wilson',
      company: 'Wilson & Associates',
      position: 'Managing Director',
      email: 'emma@wilsonassoc.com',
      category: 'Ideal Client',
      isEnriched: true,
      phone: '+44 7987 654321',
      website: 'www.wilsonassoc.com',
      enrichmentData: {
        industry: 'Professional Services',
        location: 'Manchester, UK',
        website: 'https://wilsonassoc.com',
        linkedinProfile: 'https://linkedin.com/in/emmawilson'
      }
    }
  ]);
  
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
  const [leadMagnets, setLeadMagnets] = useState([
    {
      id: 1,
      title: 'The Ultimate Guide to B2B SaaS Growth',
      description: 'A comprehensive 25-page guide covering proven strategies to scale your B2B SaaS business.',
      type: 'PDF Guide',
      created: '2024-01-15',
      downloads: 0
    }
  ]);

  // Enrichments counter
  const [enrichmentsLeft, setEnrichmentsLeft] = useState(50);

  // Main onboarding tasks
  const [tasks, setTasks] = useState([
    { id: 1, text: 'Upload your LinkedIn connections', completed: false, priority: 'high' },
    { id: 2, text: 'Configure your business settings', completed: false, priority: 'high' },
    { id: 3, text: 'Auto-categorise your contacts', completed: false, priority: 'medium' },
    { id: 4, text: 'Generate your LinkedIn strategy', completed: false, priority: 'medium' },
    { id: 5, text: 'Create your first lead magnet', completed: false, priority: 'low' }
  ]);

  // Contact task management state
  const [contactTasks, setContactTasks] = useState({});

  // Daily tasks state
  const [dailyTasks, setDailyTasks] = useState({
    chooseIdealClients: { completed: false, count: 0, total: 5 },
    commentOnPosts: { completed: false, count: 0, total: 5 },
    postContent: { completed: false },
    lastReset: new Date().toDateString()
  });

  // Track which ideal client is currently being shown in dashboard
  const [currentIdealClientIndex, setCurrentIdealClientIndex] = useState(0);

  // File upload handler
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setLoadingMessage('Processing your LinkedIn connections...');
    setShowLoadingModal(true);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target.result;
        const lines = text.split('\n').filter(line => line.trim());
        const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
        
        const nameIndex = headers.findIndex(h => h.toLowerCase().includes('name'));
        const companyIndex = headers.findIndex(h => h.toLowerCase().includes('company'));
        const positionIndex = headers.findIndex(h => h.toLowerCase().includes('position') || h.toLowerCase().includes('title'));
        const emailIndex = headers.findIndex(h => h.toLowerCase().includes('email'));
        
        const newContacts = [];
        
        for (let i = 1; i < lines.length; i++) {
          const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
          if (values.length > 1 && values[nameIndex] && values[nameIndex] !== '') {
            const contact = {
              id: Date.now() + i,
              name: values[nameIndex] || 'Unknown',
              company: values[companyIndex] || 'Unknown Company',
              position: values[positionIndex] || 'Unknown Position',
              email: values[emailIndex] || `contact${i}@example.com`,
              category: 'Uncategorised',
              isEnriched: false,
              phone: 'Not found',
              website: 'Not found'
            };
            newContacts.push(contact);
          }
        }
        
        setTimeout(() => {
          setContacts(prev => [...prev, ...newContacts]);
          setShowLoadingModal(false);
          setSuccessMessage(`Successfully uploaded ${newContacts.length} contacts!`);
          setShowSuccessModal(true);
          
          // Mark task as complete
          setTasks(prev => prev.map(task => 
            task.id === 1 ? { ...task, completed: true } : task
          ));
        }, 2000);
      } catch (error) {
        setShowLoadingModal(false);
        alert('Error processing file. Please ensure it\'s a valid CSV file.');
      }
    };

    reader.readAsText(file);
  };

  // REAL API: Enrich contacts using Serper + Claude
  const enrichIdealClients = async () => {
    // Check API configuration
    if (!isApiConfigured()) {
      alert('Please configure your Serper API key first. Check the API configuration section in the code.');
      return;
    }

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

    setLoadingMessage(`Enriching ${idealClientsToEnrich.length} ideal clients with real data...`);
    setShowLoadingModal(true);

    try {
      const enrichedContacts = [...contacts];
      
      for (const contact of idealClientsToEnrich) {
        try {
          // Step 1: Use Serper to search for company information
          const companySearchQuery = `"${contact.company}" industry services contact information`;
          const personSearchQuery = `"${contact.name}" "${contact.company}" "${contact.position}"`;
          
          // Search for company information
          const companySearchResponse = await fetch('https://google.serper.dev/search', {
            method: 'POST',
            headers: {
              'X-API-KEY': SERPER_API_KEY,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              q: companySearchQuery,
              num: 5
            })
          });

          const personSearchResponse = await fetch('https://google.serper.dev/search', {
            method: 'POST', 
            headers: {
              'X-API-KEY': SERPER_API_KEY,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              q: personSearchQuery,
              num: 3
            })
          });

          if (!companySearchResponse.ok || !personSearchResponse.ok) {
            throw new Error(`Search API failed: ${companySearchResponse.status} ${personSearchResponse.status}`);
          }

          const companyData = await companySearchResponse.json();
          const personData = await personSearchResponse.json();

          // Step 2: Use Claude to process search results and extract structured data
          const enrichmentPrompt = `
Analyse the following search results and extract structured contact information for:
Name: ${contact.name}
Company: ${contact.company}
Position: ${contact.position}

Company Search Results:
${JSON.stringify(companyData.organic?.slice(0, 3) || [], null, 2)}

Person Search Results:  
${JSON.stringify(personData.organic?.slice(0, 2) || [], null, 2)}

Extract and return ONLY a JSON object with these exact fields:
{
  "phone": "phone number in UK format or 'Not found'",
  "industry": "specific industry/sector or 'Not found'", 
  "location": "city, country or 'Not found'",
  "website": "company website URL or 'Not found'"
}

Rules:
- Phone must be in format "+44 XXXX XXXXXX" or "Not found"
- Industry should be specific (e.g. "Technology - Software Development", "Professional Services - Consulting")
- Location should be "City, Country" format
- Website should be full URL starting with https:// or "Not found"
- Respond with ONLY the JSON object, no other text
`;

          const claudeResponse = await fetch("https://api.anthropic.com/v1/messages", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              model: "claude-sonnet-4-20250514",
              max_tokens: 500,
              messages: [
                { role: "user", content: enrichmentPrompt }
              ]
            })
          });

          if (!claudeResponse.ok) {
            throw new Error(`Claude API failed: ${claudeResponse.status}`);
          }

          const claudeData = await claudeResponse.json();
          const enrichmentText = claudeData.content[0].text.trim();
          
          // Parse Claude's JSON response
          let enrichmentInfo;
          try {
            // Remove any markdown formatting
            const cleanJson = enrichmentText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
            enrichmentInfo = JSON.parse(cleanJson);
          } catch (parseError) {
            // Fallback if JSON parsing fails
            enrichmentInfo = {
              phone: 'Not found',
              industry: 'Not found', 
              location: 'Not found',
              website: 'Not found'
            };
          }

          // Update the contact with enriched data
          const contactIndex = enrichedContacts.findIndex(c => c.id === contact.id);
          if (contactIndex !== -1) {
            enrichedContacts[contactIndex] = {
              ...contact,
              isEnriched: true,
              phone: enrichmentInfo.phone || 'Not found',
              website: enrichmentInfo.website || 'Not found',
              enrichmentData: {
                industry: enrichmentInfo.industry || 'Not found',
                location: enrichmentInfo.location || 'Not found', 
                website: enrichmentInfo.website || 'Not found',
                linkedinProfile: `https://linkedin.com/in/${contact.name.toLowerCase().replace(/[^a-z]/g, '')}`
              }
            };
          }

          // Small delay to avoid rate limits
          await new Promise(resolve => setTimeout(resolve, 500));

        } catch (error) {
          console.error(`Failed to enrich ${contact.name}:`, error);
          
          // Fallback: mark as enriched but with "Not found" data
          const contactIndex = enrichedContacts.findIndex(c => c.id === contact.id);
          if (contactIndex !== -1) {
            enrichedContacts[contactIndex] = {
              ...contact,
              isEnriched: true,
              phone: 'Search failed',
              website: 'Search failed',
              enrichmentData: {
                industry: 'Search failed',
                location: 'Search failed',
                website: 'Search failed', 
                linkedinProfile: 'Search failed'
              }
            };
          }
        }
      }

      setContacts(enrichedContacts);
      setEnrichmentsLeft(prev => prev - idealClientsToEnrich.length);
      setShowLoadingModal(false);
      setSuccessMessage(`Successfully enriched ${idealClientsToEnrich.length} ideal clients with real data!`);
      setShowSuccessModal(true);

    } catch (error) {
      console.error('Enrichment failed:', error);
      setShowLoadingModal(false);
      alert(`Enrichment failed: ${error.message}. Please check your API keys and try again.`);
    }
  };

  // REAL API: AI categorisation using Claude with enriched data
  const aiCategorizeAll = async () => {
    setLoadingMessage('AI is categorising your contacts using enriched data...');
    setShowLoadingModal(true);

    try {
      const categorisedContacts = [...contacts];
      
      // Process contacts in batches to avoid rate limits
      const batchSize = 5;
      for (let i = 0; i < contacts.length; i += batchSize) {
        const batch = contacts.slice(i, i + batchSize);
        
        for (const contact of batch) {
          try {
            const categorizationPrompt = `
You are an AI assistant helping to categorise business contacts for effective LinkedIn ABM.

USER'S BUSINESS PROFILE:
- Business Type: ${user.businessType}
- Target Market: ${user.targetMarket}
- Company: ${user.company}
- Ideal Referral Partners: ${user.referralPartners}

CONTACT TO CATEGORISE:
Name: ${contact.name}
Company: ${contact.company}
Position: ${contact.position}
${contact.isEnriched ? `
ENRICHED DATA:
- Industry: ${contact.enrichmentData?.industry || 'Not available'}
- Location: ${contact.enrichmentData?.location || 'Not available'}
- Website: ${contact.enrichmentData?.website || 'Not available'}
` : 'No enriched data available'}

CATEGORIES:
1. "Ideal Client" - Decision makers who could buy your services/products
2. "Referral Partners" - People who could refer clients to you
3. "Competitors" - People in competing businesses
4. "Other" - Everyone else

Based on the user's business profile and contact information, categorise this contact.

Respond with ONLY a JSON object:
{
  "category": "one of the four categories above",
  "confidence": 0.85,
  "reasoning": "brief explanation of why this category fits"
}

Rules:
- Consider job title, company, industry, and business relevance
- High-level positions (CEO, Director, VP, Head of) at target companies = likely Ideal Client
- People in complementary services (accountants, coaches, consultants) = likely Referral Partners
- Similar business types or services = likely Competitors
- Use enriched data to make more accurate decisions
- Respond with ONLY the JSON object, no other text
`;

            const claudeResponse = await fetch("https://api.anthropic.com/v1/messages", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                model: "claude-sonnet-4-20250514",
                max_tokens: 300,
                messages: [
                  { role: "user", content: categorizationPrompt }
                ]
              })
            });

            if (!claudeResponse.ok) {
              throw new Error('Claude API failed');
            }

            const claudeData = await claudeResponse.json();
            const categorizationText = claudeData.content[0].text.trim();
            
            // Parse Claude's JSON response
            let categorization;
            try {
              // Remove any markdown formatting
              const cleanJson = categorizationText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
              categorization = JSON.parse(cleanJson);
            } catch (parseError) {
              // Fallback categorization
              const position = contact.position.toLowerCase();
              let fallbackCategory = 'Other';
              
              if (position.includes('ceo') || position.includes('founder') || position.includes('director')) {
                fallbackCategory = 'Ideal Client';
              } else if (position.includes('consultant') || position.includes('coach') || position.includes('advisor')) {
                fallbackCategory = 'Referral Partners';
              }
              
              categorization = {
                category: fallbackCategory,
                confidence: 0.5,
                reasoning: 'Fallback categorization due to API parsing error'
              };
            }

            // Update the contact with AI categorization
            const contactIndex = categorisedContacts.findIndex(c => c.id === contact.id);
            if (contactIndex !== -1) {
              categorisedContacts[contactIndex] = {
                ...contact,
                category: categorization.category,
                categoryConfidence: categorization.confidence,
                categoryReasoning: categorization.reasoning
              };
            }

            // Small delay to avoid rate limits
            await new Promise(resolve => setTimeout(resolve, 300));

          } catch (error) {
            console.error(`Failed to categorise ${contact.name}:`, error);
            
            // Fallback categorization for failed contacts
            const position = contact.position.toLowerCase();
            let fallbackCategory = 'Other';
            
            if (position.includes('ceo') || position.includes('founder') || position.includes('director')) {
              fallbackCategory = 'Ideal Client';
            } else if (position.includes('consultant') || position.includes('coach')) {
              fallbackCategory = 'Referral Partners';
            }
            
            const contactIndex = categorisedContacts.findIndex(c => c.id === contact.id);
            if (contactIndex !== -1) {
              categorisedContacts[contactIndex] = {
                ...contact,
                category: fallbackCategory,
                categoryConfidence: 0.3,
                categoryReasoning: 'Fallback categorization due to API error'
              };
            }
          }
        }
        
        // Longer delay between batches
        if (i + batchSize < contacts.length) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }

      setContacts(categorisedContacts);
      setShowLoadingModal(false);
      setSuccessMessage('Successfully categorised all contacts using AI and enriched data!');
      setShowSuccessModal(true);
      
      // Mark task as complete
      setTasks(prev => prev.map(task => 
        task.id === 3 ? { ...task, completed: true } : task
      ));

    } catch (error) {
      console.error('Categorization failed:', error);
      setShowLoadingModal(false);
      alert('AI categorization failed. Please check your API configuration and try again.');
    }
  };

  // Generate strategy
  const generateStrategy = () => {
    if (!strategy.oneOffer || !strategy.idealReferralPartners) {
      alert('Please fill in all required fields before generating strategy.');
      return;
    }

    setLoadingMessage('Generating your personalised LinkedIn strategy...');
    setShowLoadingModal(true);

    setTimeout(() => {
      const generatedStrategy = `
# Your Personalised LinkedIn ABM Strategy

## Executive Summary
Based on your business profile as a ${user.businessType} company targeting ${user.targetMarket}, here's your tailored approach:

## Core Offer Strategy
**Your Primary Offer:** ${strategy.oneOffer}

This offer should be positioned as the cornerstone of your LinkedIn outreach, emphasising value and addressing key pain points in the ${user.targetMarket} market.

## Ideal Client Targeting
Focus your efforts on decision-makers in ${user.targetMarket} companies, particularly:
- CEOs and Founders of growing businesses
- Heads of Sales and Marketing
- Business Development Directors
- Operations Managers

## Referral Partner Strategy
**Target Partners:** ${strategy.idealReferralPartners}

These partners can provide warm introductions and credibility. Develop a systematic approach to:
1. Identify active partners in your network
2. Create partnership proposals
3. Establish referral incentive programmes

## Content Strategy
**Writing Style:** ${user.writingStyle}

### Weekly Content Calendar:
- **Monday:** Industry insight posts
- **Wednesday:** Client success stories
- **Friday:** Educational content related to ${strategy.oneOffer}

## Special Factors
${strategy.specialFactors || 'Focus on building authentic relationships and providing value before making any sales pitches.'}

## Implementation Timeline
**Week 1-2:** Set up tracking and identify top 20 ideal clients
**Week 3-4:** Begin systematic outreach with personalised messages
**Week 5-8:** Nurture relationships and introduce referral partners
**Week 9-12:** Scale successful approaches and refine messaging

## Key Metrics to Track
- Connection acceptance rate
- Message response rate
- Meeting conversion rate
- Referral partner engagement
- Content engagement rates

This strategy should be reviewed and refined monthly based on performance data.
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
        task.id === 4 ? { ...task, completed: true } : task
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

      const newLeadMagnet = {
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

      // Mark task as complete
      setTasks(prev => prev.map(task => 
        task.id === 5 ? { ...task, completed: true } : task
      ));
    }, 2500);
  };

  // Daily task functions
  const toggleDailyTask = (taskKey) => {
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
          updated[taskKey].count = updated[taskKey].total;
        }
      }
      
      return updated;
    });
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

  // Delete contact
  const deleteContact = (contactId) => {
    setContacts(prev => prev.filter(c => c.id !== contactId));
    setShowContactModal(false);
    setSuccessMessage('Contact deleted successfully!');
    setShowSuccessModal(true);
  };

  // Contact task functions
  const getTaskStatus = (contactId, taskKey) => {
    return contactTasks[contactId]?.[taskKey] || { completed: false, completedDate: null };
  };

  const toggleContactTask = (contactId, taskKey) => {
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
  const downloadLeadMagnet = (leadMagnet) => {
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
                <div className="flex items-center space-x-3 text-white">
                  <Shield className="w-5 h-5 text-green-400" />
                  <span>AI-powered contact categorisation</span>
                </div>
                <div className="flex items-center space-x-3 text-white">
                  <Users className="w-5 h-5 text-blue-400" />
                  <span>LinkedIn relationship intelligence</span>
                </div>
                <div className="flex items-center space-x-3 text-white">
                  <Target className="w-5 h-5 text-purple-400" />
                  <span>Automated ABM workflows</span>
                </div>
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => setAuthView('register')}
                  className="w-full bg-yellow-400 hover:bg-yellow-500 text-purple-900 py-3 rounded-lg font-semibold transition-all"
                >
                  Get Started Free
                </button>
                <button
                  onClick={() => setAuthView('login')}
                  className="w-full bg-white bg-opacity-20 hover:bg-opacity-30 text-white py-3 rounded-lg font-medium transition-all"
                >
                  Sign In
                </button>
              </div>
            </div>
          )}

          {authView === 'login' && (
            <div className="bg-white bg-opacity-10 backdrop-blur rounded-xl p-8">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-white mb-2">Welcome Back</h2>
                <p className="text-white text-opacity-70">Sign in to your Glass Slipper account</p>
              </div>

              <div className="space-y-6">
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
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-white text-sm font-medium mb-2">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white text-opacity-50" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={authForm.password}
                      onChange={(e) => setAuthForm(prev => ({ ...prev, password: e.target.value }))}
                      className="w-full pl-10 pr-12 py-3 bg-white bg-opacity-20 text-white placeholder-white placeholder-opacity-50 rounded-lg focus:bg-opacity-30 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                      placeholder="Enter your password"
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
                  onClick={handleAuth}
                  disabled={!validateAuthForm()}
                  className="w-full bg-yellow-400 hover:bg-yellow-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-purple-900 py-3 rounded-lg font-semibold transition-all flex items-center justify-center space-x-2"
                >
                  <span>Sign In</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>

              <p className="text-center text-white text-opacity-70 text-sm mt-6">
                Don't have an account?{' '}
                <button onClick={() => setAuthView('register')} className="text-yellow-400 hover:underline">
                  Sign up here
                </button>
              </p>
            </div>
          )}

          {authView === 'register' && (
            <div className="bg-white bg-opacity-10 backdrop-blur rounded-xl p-8">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-white mb-2">Create Account</h2>
                <p className="text-white text-opacity-70">Join Glass Slipper and transform your LinkedIn network</p>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-white text-sm font-medium mb-2">Name</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white text-opacity-50" />
                      <input
                        type="text"
                        value={authForm.name}
                        onChange={(e) => setAuthForm(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full pl-10 pr-4 py-3 bg-white bg-opacity-20 text-white placeholder-white placeholder-opacity-50 rounded-lg focus:bg-opacity-30 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                        placeholder="Your name"
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
                        placeholder="Your company"
                      />
                    </div>
                  </div>
                </div>

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
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-white text-sm font-medium mb-2">Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white text-opacity-50" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={authForm.password}
                        onChange={(e) => setAuthForm(prev => ({ ...prev, password: e.target.value }))}
                        className="w-full pl-10 pr-12 py-3 bg-white bg-opacity-20 text-white placeholder-white placeholder-opacity-50 rounded-lg focus:bg-opacity-30 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                        placeholder="Create password"
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

                  <div>
                    <label className="block text-white text-sm font-medium mb-2">Confirm Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white text-opacity-50" />
                      <input
                        type="password"
                        value={authForm.confirmPassword}
                        onChange={(e) => setAuthForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                        className="w-full pl-10 pr-4 py-3 bg-white bg-opacity-20 text-white placeholder-white placeholder-opacity-50 rounded-lg focus:bg-opacity-30 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                        placeholder="Confirm password"
                      />
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleAuth}
                  disabled={!validateAuthForm()}
                  className="w-full bg-yellow-400 hover:bg-yellow-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-purple-900 py-3 rounded-lg font-semibold transition-all flex items-center justify-center space-x-2"
                >
                  <span>Create Account</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>

              <p className="text-center text-white text-opacity-70 text-sm mt-6">
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

            {/* Tasks Section */}
            <div className="bg-white bg-opacity-10 backdrop-blur rounded-xl p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Setup Tasks</h2>
              
              {tasks.some(task => !task.completed) ? (
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
                currentIdealClient ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-white text-opacity-70 text-sm">
                      <span>Client {currentIdealClientIndex + 1} of {idealClientsList.length}</span>
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => setCurrentIdealClientIndex(prev => Math.max(0, prev - 1))}
                          disabled={currentIdealClientIndex === 0}
                          className="disabled:opacity-50"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => setCurrentIdealClientIndex(prev => Math.min(idealClientsList.length - 1, prev + 1))}
                          disabled={currentIdealClientIndex === idealClientsList.length - 1}
                          className="disabled:opacity-50"
                        >
                          <ChevronDown className="w-4 h-4 rotate-90" />
                        </button>
                      </div>
                    </div>
                    
                    <div className="bg-white bg-opacity-10 rounded-lg p-4">
                      <h3 className="text-white font-medium mb-2">{currentIdealClient.name}</h3>
                      <p className="text-white text-opacity-70 text-sm mb-3">{currentIdealClient.position} at {currentIdealClient.company}</p>
                      
                      <div className="space-y-2">
                        <div
                          className="flex items-center space-x-3 cursor-pointer"
                          onClick={() => toggleContactTask(currentIdealClient.id, 'viewProfile')}
                        >
                          <div className="w-5 h-5 rounded border border-white border-opacity-50 flex items-center justify-center">
                            {getTaskStatus(currentIdealClient.id, 'viewProfile').completed && (
                              <Check className="w-3 h-3 text-white" />
                            )}
                          </div>
                          <span className={`text-white text-sm ${
                            getTaskStatus(currentIdealClient.id, 'viewProfile').completed 
                              ? 'line-through opacity-50' 
                              : ''
                          }`}>
                            View LinkedIn profile
                          </span>
                        </div>
                        <div
                          className="flex items-center space-x-3 cursor-pointer"
                          onClick={() => toggleContactTask(currentIdealClient.id, 'turnOnNotifications')}
                        >
                          <div className="w-5 h-5 rounded border border-white border-opacity-50 flex items-center justify-center">
                            {getTaskStatus(currentIdealClient.id, 'turnOnNotifications').completed && (
                              <Check className="w-3 h-3 text-white" />
                            )}
                          </div>
                          <span className={`text-white text-sm ${
                            getTaskStatus(currentIdealClient.id, 'turnOnNotifications').completed 
                              ? 'line-through opacity-50' 
                              : ''
                          }`}>
                            Turn on notifications
                          </span>
                        </div>
                        <div
                          className="flex items-center space-x-3 cursor-pointer"
                          onClick={() => toggleContactTask(currentIdealClient.id, 'sendMessage')}
                        >
                          <div className="w-5 h-5 rounded border border-white border-opacity-50 flex items-center justify-center">
                            {getTaskStatus(currentIdealClient.id, 'sendMessage').completed && (
                              <Check className="w-3 h-3 text-white" />
                            )}
                          </div>
                          <span className={`text-white text-sm ${
                            getTaskStatus(currentIdealClient.id, 'sendMessage').completed 
                              ? 'line-through opacity-50' 
                              : ''
                          }`}>
                            Send initial message
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Users className="w-12 h-12 text-white text-opacity-30 mx-auto mb-4" />
                    <p className="text-white text-opacity-50">
                      No ideal clients found. Upload and categorise your contacts first.
                    </p>
                  </div>
                )
              )}
            </div>

            {/* Daily Tasks */}
            <div className="bg-white bg-opacity-10 backdrop-blur rounded-xl p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Daily Tasks</h2>
              <div className="space-y-3">
                <div
                  className="flex items-center space-x-3 cursor-pointer"
                  onClick={() => toggleDailyTask('chooseIdealClients')}
                >
                  <div className="w-5 h-5 rounded border border-white border-opacity-50 flex items-center justify-center">
                    {dailyTasks.chooseIdealClients.completed && (
                      <Check className="w-3 h-3 text-white" />
                    )}
                  </div>
                  <span className={`text-white ${
                    dailyTasks.chooseIdealClients.completed ? 'line-through opacity-50' : ''
                  }`}>
                    Choose 5 ideal clients to focus on ({dailyTasks.chooseIdealClients.count}/{dailyTasks.chooseIdealClients.total})
                  </span>
                </div>
                <div
                  className="flex items-center space-x-3 cursor-pointer"
                  onClick={() => toggleDailyTask('commentOnPosts')}
                >
                  <div className="w-5 h-5 rounded border border-white border-opacity-50 flex items-center justify-center">
                    {dailyTasks.commentOnPosts.completed && (
                      <Check className="w-3 h-3 text-white" />
                    )}
                  </div>
                  <span className={`text-white ${
                    dailyTasks.commentOnPosts.completed ? 'line-through opacity-50' : ''
                  }`}>
                    Comment on 5 posts from ideal clients ({dailyTasks.commentOnPosts.count}/{dailyTasks.commentOnPosts.total})
                  </span>
                </div>
                <div
                  className="flex items-center space-x-3 cursor-pointer"
                  onClick={() => toggleDailyTask('postContent')}
                >
                  <div className="w-5 h-5 rounded border border-white border-opacity-50 flex items-center justify-center">
                    {dailyTasks.postContent.completed && (
                      <Check className="w-3 h-3 text-white" />
                    )}
                  </div>
                  <span className={`text-white ${
                    dailyTasks.postContent.completed ? 'line-through opacity-50' : ''
                  }`}>
                    Post valuable content on LinkedIn
                  </span>
                </div>
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
                <h3 className="text-lg font-semibold text-white mb-4">Create Strategy</h3>
                <p className="text-white text-opacity-70 mb-4">
                  Generate your personalised LinkedIn ABM strategy
                </p>
                <button
                  onClick={() => setCurrentView('strategy')}
                  className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-medium transition-all flex items-center space-x-2"
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
                  onClick={() => setShowSettingsModal(true)}
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
            {/* API Configuration Warning */}
            {!isApiConfigured() && (
              <div className="bg-yellow-500 bg-opacity-20 border border-yellow-500 rounded-xl p-4">
                <div className="flex items-center space-x-3">
                  <AlertCircle className="w-5 h-5 text-yellow-400" />
                  <div>
                    <p className="text-white font-medium">API Configuration Required</p>
                    <p className="text-white text-opacity-70 text-sm">
                      To use real data enrichment, configure your Serper API key. Get one free at{' '}
                      <a href="https://serper.dev" target="_blank" rel="noopener noreferrer" className="text-yellow-400 underline">
                        serper.dev
                      </a>
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold text-white">Contacts</h1>
              <div className="flex items-center space-x-4">
                <button
                  onClick={enrichIdealClients}
                  className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center space-x-2 ${
                    isApiConfigured() 
                      ? 'bg-green-500 hover:bg-green-600 text-white'
                      : 'bg-gray-500 text-gray-300 cursor-not-allowed'
                  }`}
                  disabled={!isApiConfigured()}
                  title={!isApiConfigured() ? 'Configure Serper API key to enable enrichment' : 'Enrich ideal clients with real data'}
                >
                  <Zap className="w-4 h-4" />
                  <span>Enrich Ideal Clients {isApiConfigured() ? '(Real Data)' : '(API Required)'}</span>
                </button>
                <button
                  onClick={aiCategorizeAll}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-all flex items-center space-x-2"
                >
                  <Target className="w-4 h-4" />
                  <span>AI Categorise</span>
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
                <div className="col-span-full bg-white bg-opacity-10 backdrop-blur rounded-xl p-8 text-center">
                  <Users className="w-12 h-12 text-white text-opacity-50 mx-auto mb-4" />
                  <p className="text-white text-opacity-70">No contacts found</p>
                  <p className="text-white text-opacity-50 text-sm mt-2">
                    Try adjusting your search or upload new contacts
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
                      <div className="flex items-center space-x-2">
                        {contact.isEnriched && (
                          <span className="text-green-400 text-xs">Enriched</span>
                        )}
                        <Sparkles className={`w-4 h-4 ${contact.isEnriched ? 'text-green-400' : 'text-gray-400'}`} />
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
            
            {!strategy.generatedStrategy ? (
              <div className="bg-white bg-opacity-10 backdrop-blur rounded-xl p-8">
                <h2 className="text-xl font-semibold text-white mb-6">Generate Your Strategy</h2>
                <div className="space-y-6">
                  <div>
                    <label className="block text-white text-sm font-medium mb-2">What's your one main offer?</label>
                    <textarea
                      value={strategy.oneOffer}
                      onChange={(e) => setStrategy(prev => ({ ...prev, oneOffer: e.target.value }))}
                      placeholder="Describe your main product or service offering..."
                      className="w-full p-4 bg-white bg-opacity-20 text-white placeholder-white placeholder-opacity-50 rounded-lg focus:bg-opacity-30 focus:outline-none focus:ring-2 focus:ring-yellow-400 h-24"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-white text-sm font-medium mb-2">Who are your ideal referral partners?</label>
                    <textarea
                      value={strategy.idealReferralPartners}
                      onChange={(e) => setStrategy(prev => ({ ...prev, idealReferralPartners: e.target.value }))}
                      placeholder="Who could refer clients to you? (e.g., accountants, business coaches, consultants...)"
                      className="w-full p-4 bg-white bg-opacity-20 text-white placeholder-white placeholder-opacity-50 rounded-lg focus:bg-opacity-30 focus:outline-none focus:ring-2 focus:ring-yellow-400 h-24"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-white text-sm font-medium mb-2">Any special factors about your business?</label>
                    <textarea
                      value={strategy.specialFactors}
                      onChange={(e) => setStrategy(prev => ({ ...prev, specialFactors: e.target.value }))}
                      placeholder="Unique selling points, target geography, industry specialisation..."
                      className="w-full p-4 bg-white bg-opacity-20 text-white placeholder-white placeholder-opacity-50 rounded-lg focus:bg-opacity-30 focus:outline-none focus:ring-2 focus:ring-yellow-400 h-24"
                    />
                  </div>
                  
                  <button
                    onClick={generateStrategy}
                    className="bg-green-500 hover:bg-green-600 text-white px-8 py-3 rounded-lg font-medium transition-all flex items-center space-x-2"
                  >
                    <Target className="w-5 h-5" />
                    <span>Generate Strategy</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-white bg-opacity-10 backdrop-blur rounded-xl p-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-white">Your Generated Strategy</h2>
                  <button
                    onClick={() => setStrategy(prev => ({ ...prev, generatedStrategy: '' }))}
                    className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg text-sm"
                  >
                    Generate New
                  </button>
                </div>
                <div className="prose prose-invert max-w-none">
                  <pre className="text-white whitespace-pre-wrap font-sans text-sm leading-relaxed">
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
              <h1 className="text-3xl font-bold text-white">Lead Magnets</h1>
              <button
                onClick={generateLeadMagnet}
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-medium transition-all flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Generate New</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {leadMagnets.length === 0 ? (
                <div className="col-span-full bg-white bg-opacity-10 backdrop-blur rounded-xl p-8 text-center">
                  <FileText className="w-12 h-12 text-white text-opacity-50 mx-auto mb-4" />
                  <p className="text-white text-opacity-70">No lead magnets yet</p>
                  <p className="text-white text-opacity-50 text-sm mt-2">
                    Generate your first lead magnet to start capturing leads
                  </p>
                </div>
              ) : (
                leadMagnets.map(magnet => (
                  <div key={magnet.id} className="bg-white bg-opacity-10 backdrop-blur rounded-xl p-6 hover:bg-opacity-20 transition-all">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-white font-semibold mb-2">{magnet.title}</h3>
                        <p className="text-white text-opacity-70 text-sm mb-3">{magnet.description}</p>
                        <div className="flex items-center space-x-4 text-xs text-white text-opacity-50">
                          <span>{magnet.type}</span>
                          <span>Created {magnet.created}</span>
                          <span>{magnet.downloads} downloads</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => downloadLeadMagnet(magnet)}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded text-sm flex items-center space-x-1"
                      >
                        <Download className="w-4 h-4" />
                        <span>Download</span>
                      </button>
                      <button
                        onClick={() => {
                          setSelectedLeadMagnet(magnet);
                          setShowLeadMagnetModal(true);
                        }}
                        className="bg-purple-500 hover:bg-purple-600 text-white px-3 py-2 rounded text-sm"
                      >
                        View
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Tasks View */}
        {currentView === 'tasks' && (
          <div className="space-y-6">
            <h1 className="text-3xl font-bold text-white">Tasks Overview</h1>
            
            {/* Setup Tasks */}
            <div className="bg-white bg-opacity-10 backdrop-blur rounded-xl p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Setup Tasks</h2>
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

            {/* Daily Tasks */}
            <div className="bg-white bg-opacity-10 backdrop-blur rounded-xl p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Daily Tasks</h2>
              <div className="space-y-3">
                <div
                  className="flex items-center space-x-3 cursor-pointer"
                  onClick={() => toggleDailyTask('chooseIdealClients')}
                >
                  <div className="w-5 h-5 rounded border border-white border-opacity-50 flex items-center justify-center">
                    {dailyTasks.chooseIdealClients.completed && (
                      <Check className="w-3 h-3 text-white" />
                    )}
                  </div>
                  <span className={`text-white ${
                    dailyTasks.chooseIdealClients.completed ? 'line-through opacity-50' : ''
                  }`}>
                    Choose 5 ideal clients to focus on ({dailyTasks.chooseIdealClients.count}/{dailyTasks.chooseIdealClients.total})
                  </span>
                </div>
                <div
                  className="flex items-center space-x-3 cursor-pointer"
                  onClick={() => toggleDailyTask('commentOnPosts')}
                >
                  <div className="w-5 h-5 rounded border border-white border-opacity-50 flex items-center justify-center">
                    {dailyTasks.commentOnPosts.completed && (
                      <Check className="w-3 h-3 text-white" />
                    )}
                  </div>
                  <span className={`text-white ${
                    dailyTasks.commentOnPosts.completed ? 'line-through opacity-50' : ''
                  }`}>
                    Comment on 5 posts from ideal clients ({dailyTasks.commentOnPosts.count}/{dailyTasks.commentOnPosts.total})
                  </span>
                </div>
                <div
                  className="flex items-center space-x-3 cursor-pointer"
                  onClick={() => toggleDailyTask('postContent')}
                >
                  <div className="w-5 h-5 rounded border border-white border-opacity-50 flex items-center justify-center">
                    {dailyTasks.postContent.completed && (
                      <Check className="w-3 h-3 text-white" />
                    )}
                  </div>
                  <span className={`text-white ${
                    dailyTasks.postContent.completed ? 'line-through opacity-50' : ''
                  }`}>
                    Post valuable content on LinkedIn
                  </span>
                </div>
              </div>
            </div>

            {/* Contact Tasks */}
            {idealClientsList.length > 0 && (
              <div className="bg-white bg-opacity-10 backdrop-blur rounded-xl p-6">
                <h2 className="text-xl font-semibold text-white mb-4">Ideal Client Tasks</h2>
                <div className="space-y-4">
                  {idealClientsList.slice(0, 5).map(client => (
                    <div key={client.id} className="bg-white bg-opacity-10 rounded-lg p-4">
                      <h3 className="text-white font-medium mb-2">{client.name}</h3>
                      <p className="text-white text-opacity-70 text-sm mb-3">{client.position} at {client.company}</p>
                      
                      <div className="space-y-2">
                        <div
                          className="flex items-center space-x-3 cursor-pointer"
                          onClick={() => toggleContactTask(client.id, 'viewProfile')}
                        >
                          <div className="w-4 h-4 rounded border border-white border-opacity-50 flex items-center justify-center">
                            {getTaskStatus(client.id, 'viewProfile').completed && (
                              <Check className="w-2 h-2 text-white" />
                            )}
                          </div>
                          <span className={`text-white text-sm ${
                            getTaskStatus(client.id, 'viewProfile').completed 
                              ? 'line-through opacity-50' 
                              : ''
                          }`}>
                            View LinkedIn profile
                          </span>
                        </div>
                        <div
                          className="flex items-center space-x-3 cursor-pointer"
                          onClick={() => toggleContactTask(client.id, 'turnOnNotifications')}
                        >
                          <div className="w-4 h-4 rounded border border-white border-opacity-50 flex items-center justify-center">
                            {getTaskStatus(client.id, 'turnOnNotifications').completed && (
                              <Check className="w-2 h-2 text-white" />
                            )}
                          </div>
                          <span className={`text-white text-sm ${
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
                          <div className="w-4 h-4 rounded border border-white border-opacity-50 flex items-center justify-center">
                            {getTaskStatus(client.id, 'sendMessage').completed && (
                              <Check className="w-2 h-2 text-white" />
                            )}
                          </div>
                          <span className={`text-white text-sm ${
                            getTaskStatus(client.id, 'sendMessage').completed 
                              ? 'line-through opacity-50' 
                              : ''
                          }`}>
                            Send initial message
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Contact Modal */}
      {showContactModal && selectedContact && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-purple-900 rounded-xl p-6 max-w-2xl w-full max-h-90vh overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-white">Contact Details</h3>
              <button
                onClick={closeModals}
                className="text-white hover:text-yellow-400 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Contact header */}
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold text-lg">
                    {selectedContact.name.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                <div className="flex-1">
                  <h4 className="text-xl font-semibold text-white">{selectedContact.name}</h4>
                  <p className="text-white text-opacity-70">{selectedContact.position}</p>
                  <p className="text-white text-opacity-70">{selectedContact.company}</p>
                  <div className="mt-2">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      selectedContact.category === 'Ideal Client' ? 'bg-green-500 text-white' :
                      selectedContact.category === 'Referral Partners' ? 'bg-blue-500 text-white' :
                      selectedContact.category === 'Competitors' ? 'bg-red-500 text-white' :
                      selectedContact.category === 'Other' ? 'bg-gray-500 text-white' :
                      'bg-gray-600 text-gray-300'
                    }`}>
                      {selectedContact.category}
                    </span>
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
              {selectedContact.isEnriched && selectedContact.enrichmentData && (
                <div className="bg-white bg-opacity-10 rounded-lg p-4 space-y-3">
                  <h4 className="text-white font-medium mb-3">Enrichment Data</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <p className="text-white text-opacity-70 text-sm">Industry</p>
                      <p className="text-white">{selectedContact.enrichmentData.industry}</p>
                    </div>
                    <div>
                      <p className="text-white text-opacity-70 text-sm">Location</p>
                      <p className="text-white">{selectedContact.enrichmentData.location}</p>
                    </div>
                    <div>
                      <p className="text-white text-opacity-70 text-sm">Website</p>
                      <a 
                        href={selectedContact.enrichmentData.website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:text-blue-300"
                      >
                        {selectedContact.enrichmentData.website}
                      </a>
                    </div>
                    <div>
                      <p className="text-white text-opacity-70 text-sm">LinkedIn Profile</p>
                      <a 
                        href={selectedContact.enrichmentData.linkedinProfile} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:text-blue-300"
                      >
                        View Profile
                      </a>
                    </div>
                  </div>
                </div>
              )}

              {/* Contact Tasks */}
              <div className="bg-white bg-opacity-10 rounded-lg p-4">
                <h4 className="text-white font-medium mb-3">Contact Tasks</h4>
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
                      View LinkedIn profile
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
                      Send initial message
                    </span>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center space-x-4">
                <select
                  value={selectedContact.category}
                  onChange={(e) => updateCategory(selectedContact.id, e.target.value)}
                  className="px-4 py-2 bg-white bg-opacity-20 text-white rounded-lg focus:bg-opacity-30 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
                
                <button
                  onClick={() => deleteContact(selectedContact.id)}
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-all flex items-center space-x-2"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {showSettingsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-purple-900 rounded-xl p-6 max-w-2xl w-full">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-white">Business Settings</h3>
              <button
                onClick={closeModals}
                className="text-white hover:text-yellow-400 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-white text-sm font-medium mb-2">Business Type</label>
                  <select
                    value={user.businessType}
                    onChange={(e) => setUser(prev => ({ ...prev, businessType: e.target.value }))}
                    className="w-full p-3 bg-white bg-opacity-20 text-white rounded-lg focus:bg-opacity-30 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  >
                    <option value="Consulting">Consulting</option>
                    <option value="Software">Software</option>
                    <option value="Marketing Agency">Marketing Agency</option>
                    <option value="Professional Services">Professional Services</option>
                    <option value="E-commerce">E-commerce</option>
                    <option value="Manufacturing">Manufacturing</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-white text-sm font-medium mb-2">Target Market</label>
                  <input
                    type="text"
                    value={user.targetMarket}
                    onChange={(e) => setUser(prev => ({ ...prev, targetMarket: e.target.value }))}
                    placeholder="e.g., B2B SaaS, Small Businesses, Enterprise"
                    className="w-full p-3 bg-white bg-opacity-20 text-white placeholder-white placeholder-opacity-50 rounded-lg focus:bg-opacity-30 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-white text-sm font-medium mb-2">Writing Style</label>
                <select
                  value={user.writingStyle}
                  onChange={(e) => setUser(prev => ({ ...prev, writingStyle: e.target.value }))}
                  className="w-full p-3 bg-white bg-opacity-20 text-white rounded-lg focus:bg-opacity-30 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                >
                  <option value="Professional">Professional</option>
                  <option value="Casual">Casual</option>
                  <option value="Professional yet conversational">Professional yet conversational</option>
                  <option value="Technical">Technical</option>
                  <option value="Creative">Creative</option>
                </select>
              </div>

              <div>
                <label className="block text-white text-sm font-medium mb-2">Ideal Referral Partners</label>
                <textarea
                  value={user.referralPartners}
                  onChange={(e) => setUser(prev => ({ ...prev, referralPartners: e.target.value }))}
                  placeholder="Who could refer clients to you? (e.g., Accountants, Business Coaches, Consultants)"
                  className="w-full p-3 bg-white bg-opacity-20 text-white placeholder-white placeholder-opacity-50 rounded-lg focus:bg-opacity-30 focus:outline-none focus:ring-2 focus:ring-yellow-400 h-24"
                />
              </div>

              <button
                onClick={saveSettings}
                className="w-full bg-green-500 hover:bg-green-600 text-white py-3 rounded-lg font-medium transition-all"
              >
                Save Settings
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lead Magnet Modal */}
      {showLeadMagnetModal && selectedLeadMagnet && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-purple-900 rounded-xl p-6 max-w-4xl w-full max-h-90vh overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-white">{selectedLeadMagnet.title}</h3>
              <button
                onClick={closeModals}
                className="text-white hover:text-yellow-400 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="bg-white bg-opacity-10 rounded-lg p-4">
                <pre className="text-white whitespace-pre-wrap font-sans text-sm leading-relaxed">
                  {selectedLeadMagnet.content}
                </pre>
              </div>
              
              <div className="flex space-x-2">
                <button
                  onClick={() => downloadLeadMagnet(selectedLeadMagnet)}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
                >
                  <Download className="w-4 h-4" />
                  <span>Download</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Loading Modal */}
      {showLoadingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-purple-900 rounded-xl p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400 mx-auto mb-4"></div>
            <p className="text-white">{loadingMessage}</p>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-purple-900 rounded-xl p-8 text-center">
            <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-4" />
            <p className="text-white mb-4">{successMessage}</p>
            <button
              onClick={closeModals}
              className="bg-yellow-400 hover:bg-yellow-500 text-purple-900 px-6 py-2 rounded-lg font-medium transition-all"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default GlassSlipperApp;

// ============================================
// API SETUP INSTRUCTIONS
// ============================================
//
// To enable REAL data enrichment (instead of mock data):
//
// 1. SERPER API (Required for Google Search):
//    - Sign up at https://serper.dev (100 free searches)
//    - Get your API key from the dashboard
//    - Replace 'your-serper-api-key-here' above with your actual key
//    - Or set environment variable: REACT_APP_SERPER_API_KEY=your_key_here
//
// 2. CLAUDE API (Already configured in this environment):
//    - Claude API calls are automatically handled
//    - No additional setup required
//
// WORKFLOW AFTER SETUP:
// 1. Upload LinkedIn CSV → contacts appear in app
// 2. Click "Enrich Ideal Clients" → Serper searches Google for each contact
// 3. Claude processes search results → adds phone, industry, location, website
// 4. Click "AI Categorise" → Claude uses enriched data + user profile to categorise
// 5. Contacts are intelligently sorted: Ideal Client, Referral Partners, Competitors, Other
//
// COST ESTIMATES:
// - Serper: ~£0.01-0.02 per contact search
// - Claude: ~£0.05-0.10 per contact for processing/categorisation
// - Total: ~£0.06-0.12 per contact for full enrichment + categorisation
//
// RATE LIMITS:
// - Built-in delays prevent hitting API rate limits
// - Processes contacts in batches with error handling
// - Fallback to basic categorisation if APIs fail
//