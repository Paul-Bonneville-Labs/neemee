/**
 * Date formatting utilities for consistent date/time display across the application
 */

export const formatDateTime = (dateString: string, options: {
  includeTime?: boolean;
  includeSeconds?: boolean;
  relativeDates?: boolean;
} = {}) => {
  const {
    includeTime = true,
    includeSeconds = false,
    relativeDates = true
  } = options;

  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    // For relative dates, show human-friendly relative time for recent items
    if (relativeDates) {
      if (diffInMinutes < 1) {
        return 'Just now';
      } else if (diffInMinutes < 60) {
        return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
      } else if (diffInHours < 24) {
        return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
      } else if (diffInDays === 1) {
        return includeTime 
          ? `Yesterday at ${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}`
          : 'Yesterday';
      } else if (diffInDays < 7) {
        return includeTime
          ? `${diffInDays} days ago at ${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}`
          : `${diffInDays} days ago`;
      }
    }

    // For older dates or when relative dates are disabled, show full date/time
    const dateOptions: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      ...(includeTime && {
        hour: 'numeric',
        minute: '2-digit',
        ...(includeSeconds && { second: '2-digit' }),
        hour12: true
      })
    };

    return date.toLocaleString('en-US', dateOptions);
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Invalid date';
  }
};

/**
 * Format date for display in highlight lists (compact format with relative dates)
 */
export const formatHighlightDate = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInDays = Math.floor(diffInMs / (24 * 60 * 60 * 1000));

    if (diffInDays === 0) {
      return 'Today';
    } else if (diffInDays === 1) {
      return 'Yesterday';
    } else if (diffInDays < 7) {
      return `${diffInDays} days ago`;
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
      });
    }
  } catch (error) {
    console.error('Error formatting highlight date:', error);
    return 'Unknown date';
  }
};

/**
 * Format date for detailed view (includes full date and time)
 */
export const formatDetailedDate = (dateString: string): string => {
  return formatDateTime(dateString, { 
    includeTime: true, 
    relativeDates: false 
  });
};

/**
 * Check if a date is recent (within last 7 days)
 */
export const isRecent = (dateString: string): boolean => {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInDays = diffInMs / (24 * 60 * 60 * 1000);
    return diffInDays < 7;
  } catch (error) {
    return false;
  }
};