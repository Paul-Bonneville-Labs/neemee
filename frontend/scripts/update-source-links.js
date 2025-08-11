const { PrismaClient } = require('@prisma/client');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: '.env.local' });

async function updateSourceLinks() {
  const prisma = new PrismaClient();
  
  try {
    console.log('Updating source link format...');
    
    // Find all notes that have content with [Source](...) format
    const notesWithSourceLinks = await prisma.note.findMany({
      where: {
        AND: [
          { content: { contains: '[Source](' } },
          { pageUrl: { not: null } }
        ]
      },
      select: {
        id: true,
        content: true,
        pageUrl: true,
        noteTitle: true
      }
    });
    
    console.log(`Found ${notesWithSourceLinks.length} notes to update`);
    
    for (const note of notesWithSourceLinks) {
      // Replace [Source](url) with [url](url)
      const updatedContent = note.content.replace(
        `[Source](${note.pageUrl})`,
        `[${note.pageUrl}](${note.pageUrl})`
      );
      
      // Update the note if content changed
      if (updatedContent !== note.content) {
        await prisma.note.update({
          where: { id: note.id },
          data: {
            content: updatedContent
          }
        });
        
        console.log(`Updated note: ${note.noteTitle || 'Untitled'} (${note.id})`);
      }
    }
    
    console.log(`Update complete! Modified ${notesWithSourceLinks.length} notes.`);
    
  } catch (error) {
    console.error('Update failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

updateSourceLinks();