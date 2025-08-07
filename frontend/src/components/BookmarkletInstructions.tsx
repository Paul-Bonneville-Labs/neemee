'use client';

import { useState } from 'react';
import { 
  CheckCircle, 
  Circle,
  ChevronRight,
  ChevronDown,
  HelpCircle,
  Lightbulb,
  Shield
} from 'lucide-react';

interface BookmarkletInstructionsProps {
  hasApiKey: boolean;
  hasBookmarklet: boolean;
  className?: string;
}

interface Step {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  required: boolean;
}

interface FAQItem {
  question: string;
  answer: string;
  category: 'setup' | 'usage' | 'troubleshooting';
}

export function BookmarkletInstructions({ 
  hasApiKey, 
  hasBookmarklet, 
  className = '' 
}: BookmarkletInstructionsProps) {
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<'setup' | 'usage' | 'troubleshooting'>('setup');

  const steps: Step[] = [
    {
      id: 'api-key',
      title: 'Generate API Key',
      description: 'Create your personal API key for authentication',
      completed: hasApiKey,
      required: true
    },
    {
      id: 'install',
      title: 'Install Bookmarklet',
      description: 'Drag the bookmarklet button to your bookmarks bar',
      completed: hasBookmarklet && hasApiKey,
      required: true
    },
    {
      id: 'test',
      title: 'Test Capture',
      description: 'Select text on any webpage and click your bookmarklet',
      completed: false,
      required: false
    },
    {
      id: 'organize',
      title: 'Organize Highlights',
      description: 'Review and manage your captured highlights',
      completed: false,
      required: false
    }
  ];

  const faqItems: FAQItem[] = [
    // Setup FAQs
    {
      question: 'How do I make my bookmarks bar visible?',
      answer: 'In Chrome: Press Ctrl+Shift+B (Cmd+Shift+B on Mac). In Firefox: Press Ctrl+Shift+B or go to View → Toolbars → Bookmarks Toolbar. In Safari: Go to View → Show Favorites Bar.',
      category: 'setup'
    },
    {
      question: 'Can I rename the bookmarklet?',
      answer: 'Yes! After installing, right-click the bookmarklet and select "Edit" or "Properties" to change its name to whatever you prefer.',
      category: 'setup'
    },
    {
      question: 'Will this work on mobile browsers?',
      answer: 'Bookmarklets have limited support on mobile browsers. They work best on desktop browsers like Chrome, Firefox, and Safari. We recommend using desktop for the best experience.',
      category: 'setup'
    },
    {
      question: 'Is my API key secure?',
      answer: 'Yes, your API key is encrypted and only used to authenticate your highlights. Never share your API key publicly, and regenerate it if you suspect it has been compromised.',
      category: 'setup'
    },
    
    // Usage FAQs
    {
      question: 'How do I capture a highlight?',
      answer: 'Select any text on a webpage, then click your "Neemee Highlight" bookmarklet. You\'ll see a notification confirming the highlight was saved.',
      category: 'usage'
    },
    {
      question: 'What happens to the original webpage content?',
      answer: 'We save the highlighted text along with the page title and URL. OpenGraph metadata (title, description, image URLs) is also captured for context and preview purposes.',
      category: 'usage'
    },
    {
      question: 'Can I highlight from any website?',
      answer: 'Yes! The bookmarklet works on most websites. Some sites with strict security policies might block bookmarklets, but this is rare.',
      category: 'usage'
    },
    {
      question: 'How much text can I highlight at once?',
      answer: 'You can highlight up to 10,000 characters at once. For longer content, break it into smaller highlights.',
      category: 'usage'
    },
    
    // Troubleshooting FAQs
    {
      question: 'The bookmarklet button doesn\'t work',
      answer: 'First, make sure you have an active API key. Check that JavaScript is enabled in your browser. Try refreshing the page and ensuring you\'ve selected text before clicking the bookmarklet.',
      category: 'troubleshooting'
    },
    {
      question: 'I see "Unauthorized" errors',
      answer: 'This usually means your API key has expired or is invalid. Try regenerating your API key and updating your bookmarklet.',
      category: 'troubleshooting'
    },
    {
      question: 'Highlights aren\'t appearing in my dashboard',
      answer: 'Check that you\'re signed in to the same account. Highlights may take a moment to appear. Try refreshing your dashboard or checking your internet connection.',
      category: 'troubleshooting'
    },
    {
      question: 'The bookmarklet isn\'t in my bookmarks bar',
      answer: 'Make sure your bookmarks bar is visible and try dragging the button again. You can also try the copy-paste installation method as an alternative.',
      category: 'troubleshooting'
    }
  ];

  const filteredFAQs = faqItems.filter(item => item.category === activeCategory);

  const toggleFAQ = (question: string) => {
    setExpandedFAQ(expandedFAQ === question ? null : question);
  };

  const completedSteps = steps.filter(step => step.completed).length;
  const totalSteps = steps.length;
  const progress = (completedSteps / totalSteps) * 100;

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Progress Overview */}
      <div role="alert" className="alert alert-soft">
        <CheckCircle className="h-5 w-5 shrink-0 self-start" />
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold">
              Setup Progress
            </h3>
            <span className="text-sm font-medium">
              {completedSteps}/{totalSteps} Complete
            </span>
          </div>
          
          <div className="w-full bg-base-300 rounded-full h-2 mb-3">
            <div 
              className="bg-info h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          
          <p className="text-sm">
            {completedSteps === totalSteps 
              ? 'Great! You\'re all set up and ready to start highlighting.'
              : 'Follow the steps below to complete your bookmarklet setup.'
            }
          </p>
        </div>
      </div>

      {/* Step-by-Step Instructions */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-base-content">
          Setup Steps
        </h3>
        
        <div className="space-y-3">
          {steps.map((step, index) => (
            <div 
              key={step.id}
              className={`flex items-start gap-4 p-4 rounded-lg border transition-colors ${
                step.completed 
                  ? 'bg-success/10 border-success/20'
                  : step.required
                    ? 'bg-base-100 border-base-300'
                    : 'bg-base-200 border-base-300'
              }`}
            >
              <div className="flex-shrink-0 mt-0.5">
                {step.completed ? (
                  <CheckCircle className="h-5 w-5 text-success" />
                ) : (
                  <Circle className="h-5 w-5 text-base-content/40" />
                )}
              </div>
              
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium text-base-content/60">
                    Step {index + 1}
                  </span>
                  {step.required && !step.completed && (
                    <span className="text-xs bg-warning/20 text-warning-content px-2 py-0.5 rounded-full">
                      Required
                    </span>
                  )}
                </div>
                
                <h4 className={`font-semibold mb-1 ${
                  step.completed 
                    ? 'text-success-content'
                    : 'text-base-content'
                }`}>
                  {step.title}
                </h4>
                
                <p className={`text-sm ${
                  step.completed 
                    ? 'text-success-content/80'
                    : 'text-base-content/70'
                }`}>
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>


      {/* FAQ Section */}
      <div className="bg-base-100 rounded-lg border border-base-300">
        <div className="p-4 border-b border-base-300">
          <div className="flex items-center gap-2 mb-3">
            <HelpCircle className="h-5 w-5 text-base-content/60" />
            <h3 className="text-lg font-semibold text-base-content">
              Frequently Asked Questions
            </h3>
          </div>
          
          {/* Category Tabs */}
          <div className="flex gap-1 bg-base-200 rounded-lg p-1">
            {(['setup', 'usage', 'troubleshooting'] as const).map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`flex-1 px-3 py-2 text-sm font-medium rounded-md capitalize transition-colors ${
                  activeCategory === category
                    ? 'bg-base-100 text-base-content shadow-sm'
                    : 'text-base-content/70 hover:text-base-content'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
        
        <div className="p-4">
          <div className="space-y-3">
            {filteredFAQs.map((faq, index) => (
              <div key={`${activeCategory}-${index}`} className="border border-base-300 rounded-lg">
                <button
                  onClick={() => toggleFAQ(faq.question)}
                  className="w-full px-4 py-3 text-left flex items-center justify-between hover:bg-base-200 transition-colors"
                >
                  <span className="font-medium text-base-content pr-4">
                    {faq.question}
                  </span>
                  {expandedFAQ === faq.question ? (
                    <ChevronDown className="h-4 w-4 text-base-content/60 flex-shrink-0" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-base-content/60 flex-shrink-0" />
                  )}
                </button>
                
                {expandedFAQ === faq.question && (
                  <div className="px-4 pb-3 border-t border-base-300">
                    <p className="text-sm text-base-content/70 pt-3">
                      {faq.answer}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tips & Best Practices */}
      <div role="alert" className="alert alert-soft">
        <Lightbulb className="h-5 w-5 shrink-0 self-start" />
        <div>
          <h3 className="font-semibold mb-2">Pro Tips</h3>
          <ul className="text-sm space-y-1">
            <li>• Keep your API key secure and don&apos;t share it with others</li>
            <li>• The bookmarklet works on most websites, including news sites and blogs</li>
            <li>• You can highlight multiple selections on the same page</li>
            <li>• Your highlights are automatically organized by domain and date</li>
            <li>• Use keyboard shortcuts: Select text and press Ctrl+D (Cmd+D) to quickly access bookmarks</li>
          </ul>
        </div>
      </div>

      {/* Security Notice */}
      <div role="alert" className="alert alert-soft">
        <Shield className="h-5 w-5 shrink-0 self-start" />
        <div>
          <h3 className="font-semibold mb-2">Privacy & Security</h3>
          <p className="text-sm">
            Your highlights are stored securely and are only accessible to you. The bookmarklet only captures the text you select and basic page information. We never access your browsing history or other personal data.
          </p>
        </div>
      </div>
    </div>
  );
}