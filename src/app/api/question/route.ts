import { NextRequest, NextResponse } from 'next/server';

// In-memory storage for questions (in production, use a database)
const questionsStore = new Map<string, QuestionData>();

interface QuestionData {
  id: string;
  title: string;
  description: string;
  language: string;
  difficulty: 'easy' | 'medium' | 'hard';
  starterCode?: string;
  expectedOutput?: string;
  testCases?: TestCase[];
  hints?: string[];
  timeLimit?: number; // in minutes
  tags?: string[];
  createdAt: Date;
  expiresAt?: Date;
}

interface TestCase {
  input: string;
  expectedOutput: string;
  description?: string;
}

// POST: Create/Update a question
export async function POST(request: NextRequest) {
  try {
    const questionData: Partial<QuestionData> = await request.json();

    if (!questionData.title || !questionData.description) {
      return NextResponse.json(
        { error: 'Title and description are required' },
        { status: 400 }
      );
    }

    const questionId = questionData.id || generateQuestionId();
    
    const question: QuestionData = {
      id: questionId,
      title: questionData.title,
      description: questionData.description,
      language: questionData.language || 'javascript',
      difficulty: questionData.difficulty || 'medium',
      starterCode: questionData.starterCode || '',
      expectedOutput: questionData.expectedOutput,
      testCases: questionData.testCases || [],
      hints: questionData.hints || [],
      timeLimit: questionData.timeLimit,
      tags: questionData.tags || [],
      createdAt: new Date(),
      expiresAt: questionData.expiresAt ? new Date(questionData.expiresAt) : undefined
    };

    questionsStore.set(questionId, question);

    return NextResponse.json({
      success: true,
      questionId,
      question,
      url: `${getBaseUrl(request)}?question=${questionId}`,
      message: 'Question created successfully'
    });

  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to create question' },
      { status: 500 }
    );
  }
}

// GET: Retrieve a question by ID
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const questionId = searchParams.get('id');

    if (!questionId) {
      // Return all questions (for admin/debug purposes)
      const allQuestions = Array.from(questionsStore.entries()).map(([id, question]) => ({
        id,
        title: question.title,
        difficulty: question.difficulty,
        language: question.language,
        createdAt: question.createdAt
      }));

      return NextResponse.json({
        success: true,
        questions: allQuestions,
        total: allQuestions.length
      });
    }

    const question = questionsStore.get(questionId);

    if (!question) {
      return NextResponse.json(
        { error: 'Question not found' },
        { status: 404 }
      );
    }

    // Check if question has expired
    if (question.expiresAt && new Date() > question.expiresAt) {
      questionsStore.delete(questionId);
      return NextResponse.json(
        { error: 'Question has expired' },
        { status: 410 }
      );
    }

    return NextResponse.json({
      success: true,
      question
    });

  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to retrieve question' },
      { status: 500 }
    );
  }
}

// DELETE: Remove a question
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const questionId = searchParams.get('id');

    if (!questionId) {
      return NextResponse.json(
        { error: 'Question ID is required' },
        { status: 400 }
      );
    }

    const deleted = questionsStore.delete(questionId);

    if (!deleted) {
      return NextResponse.json(
        { error: 'Question not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Question deleted successfully'
    });

  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to delete question' },
      { status: 500 }
    );
  }
}

function generateQuestionId(): string {
  return `q_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function getBaseUrl(request: NextRequest): string {
  const protocol = request.headers.get('x-forwarded-proto') || 'http';
  const host = request.headers.get('host');
  return `${protocol}://${host}`;
} 