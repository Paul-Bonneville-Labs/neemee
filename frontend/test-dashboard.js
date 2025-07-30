/**
 * Puppeteer Test Flow for Dashboard
 * 
 * This script tests the dashboard functionality and identifies issues.
 * Run this after making changes to verify the dashboard works correctly.
 */

// 1. Navigate to landing page
// await mcp__puppeteer__puppeteer_navigate({ url: "http://localhost:3001" });
// await mcp__puppeteer__puppeteer_screenshot({ name: "landing_page" });

// 2. Navigate to dashboard
// await mcp__puppeteer__puppeteer_navigate({ url: "http://localhost:3001/dashboard" });
// await mcp__puppeteer__puppeteer_screenshot({ name: "dashboard_state" });

// 3. Check for errors and loading state
// const dashboardState = await mcp__puppeteer__puppeteer_evaluate({
//   script: `(() => {
//     const errorBanner = document.querySelector('.bg-red-50, .bg-red-900');
//     const errorMessage = errorBanner ? errorBanner.textContent : null;
//     const isLoading = !!document.querySelector('.animate-spin');
//     const filesCount = document.querySelector('.text-gray-600')?.textContent;
//     
//     return {
//       currentUrl: window.location.href,
//       hasErrorBanner: !!errorBanner,
//       errorMessage: errorMessage,
//       isLoading: isLoading,
//       pageTitle: document.title,
//       filesCount: filesCount,
//       hasFilesSection: !!document.querySelector('[class*="Files"]'),
//       hasNewFileButton: !!document.querySelector('[class*="New File"]')
//     };
//   })()`
// });

// 4. Test file creation flow
// await mcp__puppeteer__puppeteer_click({ selector: "button:contains('New File')" });
// await mcp__puppeteer__puppeteer_screenshot({ name: "create_file_modal" });

// 5. Test file selection
// await mcp__puppeteer__puppeteer_click({ selector: ".file-item:first-child" });
// await mcp__puppeteer__puppeteer_screenshot({ name: "file_editor" });

console.log("Use the above commands with the Puppeteer MCP tools to test the dashboard");