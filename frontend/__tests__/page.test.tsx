import { render, screen, waitFor } from '@testing-library/react'

// Mock all the dependencies before importing the component
jest.mock('../src/components/AuthProvider', () => ({
  useAuth: () => ({
    user: null,
    loading: false,
  }),
}))

jest.mock('../src/components/Auth', () => ({
  Auth: () => <div data-testid="auth-component">Sign In Form</div>,
}))

jest.mock('../src/components/auth/OAuthSignIn', () => ({
  OAuthSignIn: () => <div data-testid="oauth-signin">OAuth Sign In</div>,
}))

jest.mock('../src/hooks/usePaginatedNotes', () => ({
  usePaginatedNotes: () => ({
    notes: [],
    total: 0,
    hasMore: false,
    isInitialLoading: false,
    isPaginating: false,
    error: null,
    loadMore: jest.fn(),
    search: jest.fn(),
    refresh: jest.fn(),
    searchTerm: '',
    isSearching: false,
  }),
}))

jest.mock('../src/components/Toast', () => ({
  useToasts: () => ({
    toasts: [],
    dismissToast: jest.fn(),
    showSuccess: jest.fn(),
    showError: jest.fn(),
  }),
  ToastContainer: () => <div data-testid="toast-container" />,
}))

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
  }),
  useSearchParams: () => ({
    has: jest.fn(() => false),
    get: jest.fn(() => null),
  }),
}))

// Mock the config file
jest.mock('../config.json', () => ({
  app: {
    name: 'Neemee',
    description: 'Personal knowledge management system',
  },
}))

// Import the component after mocking
import Home from '../src/app/page'

describe('Home Page', () => {
  // Mock localStorage
  const localStorageMock = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
  }
  
  beforeAll(() => {
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
    })
  })

  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks()
  })

  it('renders the home page without crashing', async () => {
    render(<Home />)
    
    // Wait for the component to mount and check for app name
    await waitFor(() => {
      expect(screen.getByText(/neemee/i)).toBeInTheDocument()
    }, { timeout: 3000 })
  })

  it('displays sign-in content when user is not authenticated', async () => {
    render(<Home />)
    
    // Wait for content to load, then check for sign-in elements
    await waitFor(() => {
      const signInElements = screen.getAllByText(/sign/i)
      expect(signInElements.length).toBeGreaterThan(0)
    }, { timeout: 3000 })
  })

  it('has proper page structure', async () => {
    const { container } = render(<Home />)
    
    // Basic structural test - page should render without errors
    await waitFor(() => {
      expect(container.firstChild).toBeInTheDocument()
    }, { timeout: 3000 })
  })
})