const { PrismaClient } = require('@prisma/client');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: '.env.local' });

async function migrateSnippetToContent() {
  const prisma = new PrismaClient();
  
  try {
    console.log('Starting snippet-to-content migration...');
    
    // Find all notes that have both snippet and pageUrl
    const notesWithSnippets = await prisma.note.findMany({
      where: {
        AND: [
          { snippet: { not: null } },
          { snippet: { not: '' } },
          { pageUrl: { not: null } }
        ]
      },
      select: {
        id: true,
        content: true,
        snippet: true,
        pageUrl: true,
        noteTitle: true
      }
    });
    
    console.log(`Found ${notesWithSnippets.length} notes to migrate`);
    
    for (const note of notesWithSnippets) {
      // Format content combining snippet with markdown link to URL
      const formattedContent = `> ${note.snippet}\n\n[Source](${note.pageUrl})`;
      
      // Update the note
      await prisma.note.update({
        where: { id: note.id },
        data: {
          content: formattedContent,
          snippet: null // Clear the snippet field
        }
      });
      
      console.log(`Migrated note: ${note.noteTitle || 'Untitled'} (${note.id})`);
    }
    
    console.log(`Migration complete! Updated ${notesWithSnippets.length} notes.`);
    
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

migrateSnippetToContent();