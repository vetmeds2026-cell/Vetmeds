import { NextResponse } from 'next/server';
import { db } from '@/app/configs/db';
import { chats } from '@/app/configs/schema';
import { desc, eq } from 'drizzle-orm';


export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userEmail = searchParams.get('userEmail');
    
    if (!userEmail) {
      return NextResponse.json(
        { success: false, error: 'User email is required' },
        { status: 400 }
      );
    }
    
    const userChats = await db.select().from(chats)
      .where(eq(chats.userEmail, userEmail))
      .orderBy(desc(chats.updatedAt));
      
    return NextResponse.json({ success: true, data: userChats });
  } catch (error) {
    console.error('Error fetching chats:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch chats' },
      { status: 500 }
    );
  }
}


export async function POST(request) {
  try {
    const body = await request.json();
    
    if (!body.userEmail || !body.chatName) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const newChat = await db.insert(chats).values({
      userEmail: body.userEmail,
      chatName: body.chatName,
      chatHistory: body.chatHistory || '[]',
      uploadedImage: body.uploadedImage || null,
    }).returning();

    return NextResponse.json({ 
      success: true, 
      data: newChat[0],
      message: 'Chat created successfully!' 
    });
  } catch (error) {
    console.error('Error creating chat:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create chat' },
      { status: 500 }
    );
  }
}


export async function PUT(request) {
  try {
    const body = await request.json();
    const { id, chatName, chatHistory } = body;
    
    if (!id || (!chatName && !chatHistory)) {
      return NextResponse.json(
        { success: false, error: 'ID and either chatName or chatHistory are required' },
        { status: 400 }
      );
    }

    const updateData = { updatedAt: new Date() };
    if (chatName) updateData.chatName = chatName;
    if (chatHistory) updateData.chatHistory = chatHistory;

    const updatedChat = await db
      .update(chats)
      .set(updateData)
      .where(eq(chats.id, parseInt(id)))
      .returning();

    return NextResponse.json({ 
      success: true, 
      data: updatedChat[0],
      message: 'Chat updated successfully'
    });
  } catch (error) {
    console.error('Error updating chat:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update chat' },
      { status: 500 }
    );
  }
}


export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Chat ID is required' },
        { status: 400 }
      );
    }

    await db.delete(chats).where(eq(chats.id, parseInt(id)));
    
    return NextResponse.json({ 
      success: true, 
      message: 'Chat deleted successfully!' 
    });
  } catch (error) {
    console.error('Error deleting chat:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete chat' },
      { status: 500 }
    );
  }
}
