import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getAuthContext } from '@/lib/api-auth';

interface TestDataRequest {
  count?: number;           // Number of notes to generate (default: 100, max: 500)
  timeSpread?: 'week' | 'month' | '6months'; // Time distribution
  clear?: boolean;          // Clear existing test data first
  categories?: string[];    // Content categories to include
}

// Realistic test content organized by domain and content type
const TEST_CONTENT_SOURCES = {
  'github.com': [
    {
      title: 'React 19 RC Released',
      snippet: 'React 19 RC is now available on npm! This is a release candidate, which means the APIs are finalized and ready for adoption.',
      content: 'React 19 RC is now available on npm! This is a release candidate, which means the APIs are finalized and ready for adoption. We expect no further breaking changes before the stable release, but we want to gather feedback from the community to ensure we haven\'t missed anything.'
    },
    {
      title: 'Vue 3.4 Performance Improvements',
      snippet: 'Vue 3.4 introduces significant performance improvements with better tree-shaking and bundle size optimizations.',
      content: 'Vue 3.4 introduces significant performance improvements with better tree-shaking and bundle size optimizations. The new reactivity system is now 20% faster and memory usage has been reduced by 15% in typical applications.'
    },
    {
      title: 'TypeScript 5.0 Features',
      snippet: 'TypeScript 5.0 brings decorators, const type parameters, and extends constraints on infer type variables.',
      content: 'TypeScript 5.0 brings decorators, const type parameters, and extends constraints on infer type variables. These features enable more expressive type definitions and better runtime behavior integration with compile-time type checking.'
    }
  ],
  'stackoverflow.com': [
    {
      title: 'How to use React useCallback effectively',
      snippet: 'useCallback is a React Hook that lets you cache a function definition between re-renders.',
      content: 'useCallback is a React Hook that lets you cache a function definition between re-renders. This is useful when passing callbacks to optimized child components that rely on reference equality to prevent unnecessary renders. The key is to understand when the dependencies actually change.'
    },
    {
      title: 'Understanding JavaScript Closures',
      snippet: 'A closure gives you access to an outer function\'s scope from an inner function.',
      content: 'A closure gives you access to an outer function\'s scope from an inner function. In JavaScript, closures are created every time a function is created, at function creation time. This is one of the most powerful features of JavaScript and enables patterns like module patterns and function factories.'
    },
    {
      title: 'CSS Grid vs Flexbox: When to Use Each',
      snippet: 'CSS Grid is designed for two-dimensional layout while Flexbox is designed for one-dimensional layout.',
      content: 'CSS Grid is designed for two-dimensional layout while Flexbox is designed for one-dimensional layout. Use Grid when you need to control both rows and columns, and Flexbox when you need to control either rows or columns. They work great together in modern layouts.'
    }
  ],
  'medium.com': [
    {
      title: 'The Future of Web Development in 2024',
      snippet: 'Web development is evolving rapidly with new frameworks, tools, and paradigms emerging constantly.',
      content: 'Web development is evolving rapidly with new frameworks, tools, and paradigms emerging constantly. The rise of edge computing, WebAssembly, and AI-assisted development tools is reshaping how we build and deploy applications. Developers need to stay adaptable and focus on fundamentals while embracing new technologies.'
    },
    {
      title: 'Building Scalable APIs with GraphQL',
      snippet: 'GraphQL provides a more efficient, powerful and flexible alternative to REST.',
      content: 'GraphQL provides a more efficient, powerful and flexible alternative to REST. It allows clients to request exactly the data they need, nothing more, nothing less. This eliminates over-fetching and under-fetching of data, making applications faster and more efficient.'
    },
    {
      title: 'Microservices Architecture Best Practices',
      snippet: 'Microservices can solve many problems, but they also introduce new complexities that need careful consideration.',
      content: 'Microservices can solve many problems, but they also introduce new complexities that need careful consideration. Proper service boundaries, communication patterns, and monitoring are essential for success. Start with a monolith and extract services when you have clear boundaries and sufficient team expertise.'
    }
  ],
  'techcrunch.com': [
    {
      title: 'OpenAI Announces GPT-5 Development',
      snippet: 'OpenAI has confirmed they are working on GPT-5, promising significant improvements in reasoning and multimodal capabilities.',
      content: 'OpenAI has confirmed they are working on GPT-5, promising significant improvements in reasoning and multimodal capabilities. The new model is expected to handle complex mathematical problems, generate more accurate code, and better understand context across different types of media including text, images, and audio.'
    },
    {
      title: 'Meta\'s VR Strategy for Enterprise',
      snippet: 'Meta is shifting focus toward enterprise VR solutions with new productivity and collaboration tools.',
      content: 'Meta is shifting focus toward enterprise VR solutions with new productivity and collaboration tools. The company sees significant opportunity in virtual meetings, training simulations, and remote collaboration as businesses continue to adopt hybrid work models.'
    }
  ],
  'dev.to': [
    {
      title: 'My Journey Learning Rust',
      snippet: 'Rust\'s ownership system was confusing at first, but now I can\'t imagine programming without it.',
      content: 'Rust\'s ownership system was confusing at first, but now I can\'t imagine programming without it. The compiler\'s helpful error messages and the guarantee of memory safety without garbage collection make it incredibly powerful for systems programming and beyond.'
    },
    {
      title: '10 VS Code Extensions That Changed My Workflow',
      snippet: 'These extensions have dramatically improved my productivity and code quality.',
      content: 'These extensions have dramatically improved my productivity and code quality. From better syntax highlighting to intelligent code completion and debugging tools, the VS Code ecosystem provides everything needed for modern development workflows.'
    }
  ],
  'nytimes.com': [
    {
      title: 'The Rise of Remote Work Technology',
      snippet: 'Companies are investing billions in tools that make distributed teams more effective.',
      content: 'Companies are investing billions in tools that make distributed teams more effective. From advanced video conferencing to collaborative whiteboards and project management platforms, the technology landscape for remote work has evolved dramatically since 2020.'
    }
  ],
  'twitter.com': [
    {
      title: 'Thread: Web Performance Tips',
      snippet: 'Quick thread on web performance: 1) Optimize images, 2) Minimize JavaScript, 3) Use CDNs effectively.',
      content: 'Quick thread on web performance: 1) Optimize images, 2) Minimize JavaScript, 3) Use CDNs effectively. These three changes alone can improve your Core Web Vitals significantly.'
    }
  ]
};

// Helper function to generate random timestamp within specified range
function generateTimestamp(timeSpread: 'week' | 'month' | '6months'): string {
  const now = new Date();
  let maxAge: number;
  
  switch (timeSpread) {
    case 'week':
      maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days in ms
      break;
    case 'month':
      maxAge = 30 * 24 * 60 * 60 * 1000; // 30 days in ms
      break;
    case '6months':
      maxAge = 180 * 24 * 60 * 60 * 1000; // 180 days in ms
      break;
  }
  
  // Create realistic distribution - more recent entries
  const skewFactor = Math.random() * Math.random(); // Bias toward recent dates
  const ageMs = Math.floor(skewFactor * maxAge);
  const timestamp = new Date(now.getTime() - ageMs);
  
  return timestamp.toISOString();
}

// Helper function to get random item from array
function getRandomItem<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

// Generate test note data
function generateTestNote(userId: string, timeSpread: 'week' | 'month' | '6months') {
  const domains = Object.keys(TEST_CONTENT_SOURCES);
  const domain = getRandomItem(domains);
  const contentOptions = TEST_CONTENT_SOURCES[domain as keyof typeof TEST_CONTENT_SOURCES];
  const selectedContent = getRandomItem(contentOptions);
  
  return {
    user_id: userId,
    page_url: `https://${domain}/${Math.random().toString(36).substr(2, 9)}`,
    content: selectedContent.content,
    snippet: selectedContent.snippet,
    page_title: selectedContent.title,
    markdown_content: selectedContent.content,
    created_at: generateTimestamp(timeSpread),
    metadata: {
      content_status: 'completed',
      test_data: true,
      source_type: 'generated',
      domain: domain
    }
  };
}

export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const authContext = await getAuthContext(request);
    if (!authContext) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { userId } = authContext;

    const supabase = await createClient();
    
    // Parse request body
    const body: TestDataRequest = await request.json();
    const {
      count = 100,
      timeSpread = 'month',
      clear = false,
      categories = []
    } = body;

    // Validate count
    if (count < 1 || count > 500) {
      return NextResponse.json({
        error: 'Count must be between 1 and 500'
      }, { status: 400 });
    }

    // Clear existing test data if requested
    if (clear) {
      const { error: clearError } = await supabase
        .from('notes')
        .delete()
        .eq('user_id', userId)
        .eq('metadata->test_data', true);
        
      if (clearError) {
        console.error('Failed to clear test data:', clearError);
        return NextResponse.json({
          error: 'Failed to clear existing test data'
        }, { status: 500 });
      }
    }

    // Generate test notes
    const testNotes = [];
    for (let i = 0; i < count; i++) {
      testNotes.push(generateTestNote(userId, timeSpread));
    }

    // Batch insert notes
    const { data: createdNotes, error: insertError } = await supabase
      .from('notes')
      .insert(testNotes)
      .select('id, page_title, page_url, created_at');

    if (insertError) {
      console.error('Failed to create test notes:', insertError);
      return NextResponse.json({
        error: 'Failed to create test notes',
        details: insertError
      }, { status: 500 });
    }

    // Count total notes for user
    const { count: totalCount } = await supabase
      .from('notes')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    return NextResponse.json({
      success: true,
      message: `Successfully created ${createdNotes?.length || 0} test notes`,
      data: {
        created: createdNotes?.length || 0,
        totalNotes: totalCount || 0,
        timeSpread,
        cleared: clear
      }
    });
    
  } catch (error) {
    console.error('Generate test data error:', error);
    return NextResponse.json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// GET endpoint to check current test data status
export async function GET(request: NextRequest) {
  try {
    const authContext = await getAuthContext(request);
    if (!authContext) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { userId } = authContext;

    const supabase = await createClient();

    // Count total notes and test notes
    const [totalResult, testResult] = await Promise.all([
      supabase
        .from('notes')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId),
      supabase
        .from('notes')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('metadata->test_data', true)
    ]);

    return NextResponse.json({
      success: true,
      data: {
        totalNotes: totalResult.count || 0,
        testNotes: testResult.count || 0,
        realNotes: (totalResult.count || 0) - (testResult.count || 0)
      }
    });
    
  } catch (error) {
    console.error('Check test data error:', error);
    return NextResponse.json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// DELETE endpoint to clear test data
export async function DELETE(request: NextRequest) {
  try {
    const authContext = await getAuthContext(request);
    if (!authContext) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { userId } = authContext;

    const supabase = await createClient();

    // Delete all test data for user
    const { count, error } = await supabase
      .from('notes')
      .delete({ count: 'exact' })
      .eq('user_id', userId)
      .eq('metadata->test_data', true);

    if (error) {
      console.error('Failed to clear test data:', error);
      return NextResponse.json({
        error: 'Failed to clear test data'
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: `Cleared ${count || 0} test notes`,
      data: {
        deleted: count || 0
      }
    });
    
  } catch (error) {
    console.error('Clear test data error:', error);
    return NextResponse.json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}