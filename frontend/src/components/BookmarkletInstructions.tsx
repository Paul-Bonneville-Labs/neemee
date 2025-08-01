'use client';

import { useState } from 'react';
import { 
  CheckCircle, 
  Circle,
  ChevronRight,
  ChevronDown,
  HelpCircle,
  AlertTriangle,
  Lightbulb,
  MousePointer,
  Bookmark,
  Zap,
  Shield,
  Globe
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
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100">
            Setup Progress
          </h3>
          <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
            {completedSteps}/{totalSteps} Complete
          </span>
        </div>
        
        <div className="w-full bg-blue-200 dark:bg-blue-800 rounded-full h-2 mb-3">
          <div 
            className="bg-blue-600 dark:bg-blue-400 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        
        <p className="text-sm text-blue-800 dark:text-blue-200">
          {completedSteps === totalSteps 
            ? 'Great! You\'re all set up and ready to start highlighting.'
            : 'Follow the steps below to complete your bookmarklet setup.'
          }
        </p>
      </div>

      {/* Step-by-Step Instructions */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Setup Steps
        </h3>
        
        <div className="space-y-3">
          {steps.map((step, index) => (
            <div 
              key={step.id}
              className={`flex items-start gap-4 p-4 rounded-lg border transition-colors ${
                step.completed 
                  ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                  : step.required
                    ? 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                    : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700'
              }`}
            >
              <div className="flex-shrink-0 mt-0.5">
                {step.completed ? (
                  <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                ) : (
                  <Circle className="h-5 w-5 text-gray-400" />
                )}
              </div>
              
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Step {index + 1}
                  </span>
                  {step.required && !step.completed && (
                    <span className="text-xs bg-amber-100 dark:bg-amber-900/20 text-amber-800 dark:text-amber-200 px-2 py-0.5 rounded-full">
                      Required
                    </span>
                  )}
                </div>
                
                <h4 className={`font-semibold mb-1 ${
                  step.completed 
                    ? 'text-green-900 dark:text-green-100'
                    : 'text-gray-900 dark:text-white'
                }`}>
                  {step.title}
                </h4>
                
                <p className={`text-sm ${
                  step.completed 
                    ? 'text-green-700 dark:text-green-300'
                    : 'text-gray-600 dark:text-gray-400'
                }`}>
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Usage Guide */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          How to Use Your Bookmarklet
        </h3>
        
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center flex-shrink-0">
              <MousePointer className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-1">
                1. Select Text
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Highlight any text on a webpage that you want to save
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center flex-shrink-0">
              <Bookmark className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-1">
                2. Click Bookmarklet
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Click your "Neemee Highlight" bookmark to capture the selection
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center flex-shrink-0">
              <Zap className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-1">
                3. See Confirmation
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                A notification will confirm your highlight was saved successfully
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 mb-3">
            <HelpCircle className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Frequently Asked Questions
            </h3>
          </div>
          
          {/* Category Tabs */}
          <div className="flex gap-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
            {(['setup', 'usage', 'troubleshooting'] as const).map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`flex-1 px-3 py-2 text-sm font-medium rounded-md capitalize transition-colors ${
                  activeCategory === category
                    ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
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
              <div key={`${activeCategory}-${index}`} className="border border-gray-200 dark:border-gray-700 rounded-lg">
                <button
                  onClick={() => toggleFAQ(faq.question)}
                  className="w-full px-4 py-3 text-left flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <span className="font-medium text-gray-900 dark:text-white pr-4">
                    {faq.question}
                  </span>
                  {expandedFAQ === faq.question ? (
                    <ChevronDown className="h-4 w-4 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                  )}
                </button>
                
                {expandedFAQ === faq.question && (
                  <div className="px-4 pb-3 border-t border-gray-200 dark:border-gray-700">
                    <p className="text-sm text-gray-600 dark:text-gray-400 pt-3">
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
      <div className="bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800 p-4">
        <div className="flex items-start gap-3">
          <Lightbulb className="h-5 w-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-yellow-900 dark:text-yellow-100 mb-2">
              Pro Tips
            </h3>
            <ul className="text-sm text-yellow-800 dark:text-yellow-200 space-y-1">
              <li>• Keep your API key secure and don't share it with others</li>
              <li>• The bookmarklet works on most websites, including news sites and blogs</li>
              <li>• You can highlight multiple selections on the same page</li>
              <li>• Your highlights are automatically organized by domain and date</li>
              <li>• Use keyboard shortcuts: Select text and press Ctrl+D (Cmd+D) to quickly access bookmarks</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Security Notice */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Shield className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
              Privacy & Security
            </h3>
            <p className="text-sm text-blue-800 dark:text-blue-200">
              Your highlights are stored securely and are only accessible to you. The bookmarklet only captures the text you select and basic page information. We never access your browsing history or other personal data.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}