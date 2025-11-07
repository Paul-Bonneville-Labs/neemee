# Neemee Roadmap

This roadmap outlines the planned features and improvements for Neemee. We update this regularly based on community feedback and our development priorities.

**Last Updated:** January 2025

---

## ✅ Current Features

These features are live and available in Neemee today:

### Core Functionality
- ✅ **Rich Markdown Editor** - Full-featured editor with live preview and syntax highlighting
- ✅ **MCP Integration** - Bidirectional AI integration with Claude Code, ChatGPT, and MCP-enabled tools
- ✅ **Web Clipper Bookmarklet** - Single-click content capture from any website
- ✅ **Notebook Organization** - Organize notes into custom notebooks
- ✅ **Powerful Search** - Full-text search with filtering by tags, domains, notebooks, and dates
- ✅ **Version History** - Automatic backups (up to 50 versions per note)
- ✅ **Flexible Metadata** - YAML frontmatter with custom fields (string, boolean, date, number, array, choice)
- ✅ **Portable Markdown** - All notes stored as standard markdown files
- ✅ **User Authentication** - OAuth via Google and GitHub, plus Clerk integration

### Technical Features
- ✅ **Next.js 15 App** - Modern web application with TypeScript
- ✅ **PostgreSQL Database** - Robust data storage with Prisma ORM
- ✅ **AWS S3 Integration** - Secure version history storage
- ✅ **Rate Limiting** - Upstash Redis-based protection
- ✅ **Email Notifications** - AWS SES for contact forms and notifications

---

## 🚧 In Progress

Features currently under active development:

### Q1 2025
- 🚧 **Enhanced MCP Tools** - Additional operations and improved performance
- 🚧 **Search Improvements** - Fuzzy search and relevance scoring
- 🚧 **Performance Optimizations** - Faster load times and improved caching

---

## 📋 Planned Features

Features we're planning to build, organized by priority:

### High Priority

#### Native iOS App
**Timeline:** Q2 2025

Take your notes mobile with a native iOS app featuring:
- Full offline support with sync
- Native sharing and capturing
- Seamless MCP integration with AI tools
- Dark mode and accessibility features
- Widget support for quick note creation

**Status:** Design phase

---

#### Intelligent Note Connections
**Timeline:** Q2-Q3 2025

Make your notes a living, interconnected system:
- Automatic linking between related notes
- Visual graph of note connections
- Discovery of connections you didn't know existed
- Backlinks and forward links
- Tag-based relationship suggestions

**Status:** Research phase

---

#### Browser Extensions
**Timeline:** Q3 2025

Capture notes from anywhere:
- Chrome, Firefox, and Safari extensions
- One-click web clipping (enhanced from bookmarklet)
- Sidebar for note access while browsing
- Quick search across all notes
- Offline access to recent notes

**Status:** Planned

---

### Medium Priority

#### Collaborative Notebooks
**Timeline:** Q3-Q4 2025

Share and collaborate on notes:
- Invite others to view or edit notebooks
- Real-time collaborative editing
- Comment threads on notes
- Activity feed and notifications
- Permission levels (view, comment, edit)

**Status:** Design considerations

---

#### Full Public API
**Timeline:** Q4 2025

Build custom integrations:
- RESTful API for all operations
- Comprehensive documentation
- SDKs for popular languages (Python, JavaScript, Go)
- Webhook support for events
- OAuth 2.0 authentication

**Status:** API design in progress (MCP server provides foundation)

---

#### Advanced Export Options
**Timeline:** Q4 2025

Export your data in multiple formats:
- Bulk export of all notes
- Export to PDF, DOCX, HTML
- Notion/Obsidian compatible formats
- Scheduled backups to cloud storage
- CLI tool for bulk operations

**Status:** Planned

---

### Lower Priority / Future Considerations

These features are on our radar but not yet scheduled:

- 📋 **Android App** - Native Android application
- 📋 **Desktop Apps** - Native macOS, Windows, and Linux applications
- 📋 **Team Workspaces** - Multi-user teams with shared notebooks
- 📋 **AI-Powered Summaries** - Automatic note summarization
- 📋 **Smart Tags** - Auto-tagging based on content analysis
- 📋 **Email-to-Note** - Create notes via email
- 📋 **Zapier Integration** - Connect Neemee to thousands of apps
- 📋 **Templates** - Pre-built note templates for common use cases
- 📋 **Public Note Sharing** - Share read-only public links to notes
- 📋 **Encrypted Notes** - End-to-end encryption for sensitive content

---

## 🗳️ Community Input

**Want to influence our roadmap?**

- 💡 **Request Features** - [Submit a feature request](https://github.com/Paul-Bonneville-Labs/neemee/issues/new?template=feature_request.md)
- 👍 **Vote on Issues** - Add 👍 reactions to feature requests you want to see
- 💬 **Join Discord** - [Discuss roadmap items](https://discord.gg/jZjjTY9H) with the community
- 📧 **Contact Us** - [Send feedback](https://neemee.app/contact) directly to the team

---

## 📊 How We Prioritize

Our roadmap is shaped by:

1. **Community Feedback** - Feature requests and votes from users
2. **User Impact** - How many users will benefit from the feature
3. **Technical Feasibility** - Complexity and dependencies
4. **Strategic Alignment** - Fits with our vision for Neemee
5. **Resource Availability** - Development team capacity

---

## ⚠️ Disclaimer

This roadmap is a living document and subject to change. We cannot guarantee delivery dates or that all features will be implemented exactly as described. Priorities may shift based on user feedback, technical discoveries, or business needs.

**Timeline estimates are approximate and may change.**

---

**Questions about the roadmap?** [Join our Discord](https://discord.gg/jZjjTY9H) or [open a discussion](https://github.com/Paul-Bonneville-Labs/neemee/issues).
