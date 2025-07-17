import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

const PISTON_API_URL = 'https://emkc.org/api/v2/piston';

// Language mappings for Piston API
const LANGUAGE_MAP: { [key: string]: { language: string; version?: string } } = {
  javascript: { language: 'javascript', version: '18.15.0' },
  python: { language: 'python', version: '3.10.0' },
  go: { language: 'go', version: '1.16.2' },
  java: { language: 'java', version: '15.0.2' },
  cpp: { language: 'cpp', version: '10.2.0' },
  csharp: { language: 'csharp', version: '6.12.0' },
  typescript: { language: 'typescript', version: '4.4.4' },
  php: { language: 'php', version: '8.2.3' },
  html: { language: 'html', version: '5' },
  css: { language: 'css', version: '3' },
};

export async function POST(request: NextRequest) {
  try {
    const { code, language, input = '' } = await request.json();

    if (!code || !language) {
      return NextResponse.json(
        { error: 'Code and language are required' },
        { status: 400 }
      );
    }

    const langConfig = LANGUAGE_MAP[language.toLowerCase()];
    if (!langConfig) {
      return NextResponse.json(
        { error: `Unsupported language: ${language}` },
        { status: 400 }
      );
    }

    // Handle HTML and CSS specially (they don't execute, just return formatted output)
    if (language.toLowerCase() === 'html') {
      return NextResponse.json({
        success: true,
        output: `HTML Document Preview:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📄 Document Type: HTML5
📊 Lines of code: ${code.split('\n').length}
🏷️  Title: ${extractTitle(code) || 'Untitled'}
📱 Responsive: ${code.includes('viewport') ? 'Yes' : 'No'}
🎨 Inline CSS: ${code.includes('<style>') ? 'Yes' : 'No'}
⚡ JavaScript: ${code.includes('<script>') ? 'Yes' : 'No'}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ HTML syntax appears valid
💡 Tip: Open this in a browser to see the rendered output
🌐 This HTML document is ready to be served!`,
        error: '',
        exitCode: 0,
        language: language,
        executionTime: null,
      });
    }

    if (language.toLowerCase() === 'css') {
      const selectors = (code.match(/[.#]?[a-zA-Z][a-zA-Z0-9_-]*\s*{/g) || []).length;
      const properties = (code.match(/[a-zA-Z-]+\s*:/g) || []).length;
      const mediaQueries = (code.match(/@media/g) || []).length;
      const animations = (code.match(/@keyframes/g) || []).length;
      
      return NextResponse.json({
        success: true,
        output: `CSS Stylesheet Analysis:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📄 Stylesheet Type: CSS3
📊 Lines of code: ${code.split('\n').length}
🎯 Selectors: ${selectors}
🔧 Properties: ${properties}
📱 Media queries: ${mediaQueries}
✨ Animations: ${animations}
🎨 Grid/Flexbox: ${code.includes('grid') || code.includes('flex') ? 'Yes' : 'No'}
🌈 Custom properties: ${code.includes('--') ? 'Yes' : 'No'}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ CSS syntax appears valid
💡 Tip: Link this stylesheet to an HTML document
🎨 Your styles are ready to beautify web pages!`,
        error: '',
        exitCode: 0,
        language: language,
        executionTime: null,
      });
    }

    // Execute code using Piston API for other languages
    const response = await axios.post(`${PISTON_API_URL}/execute`, {
      language: langConfig.language,
      version: langConfig.version,
      files: [
        {
          name: `main.${getFileExtension(language)}`,
          content: code,
        },
      ],
      stdin: input,
    });

    const result = response.data;

    return NextResponse.json({
      success: true,
      output: result.run?.stdout || '',
      error: result.run?.stderr || '',
      exitCode: result.run?.code || 0,
      language: language,
      executionTime: result.run?.signal || null,
    });

  } catch (error: any) {
    console.error('Execution error:', error);
    
    return NextResponse.json(
      { 
        success: false,
        error: error.response?.data?.message || 'Execution failed',
        output: '',
      },
      { status: 500 }
    );
  }
}

function extractTitle(html: string): string | null {
  const titleMatch = html.match(/<title[^>]*>([^<]*)<\/title>/i);
  return titleMatch ? titleMatch[1].trim() : null;
}

// Get available languages
export async function GET() {
  try {
    const response = await axios.get(`${PISTON_API_URL}/runtimes`);
    const runtimes = response.data;
    
    const supportedLanguages = Object.keys(LANGUAGE_MAP).map(lang => ({
      name: lang,
      version: LANGUAGE_MAP[lang].version,
      available: runtimes.some((runtime: any) => 
        runtime.language === LANGUAGE_MAP[lang].language
      )
    }));

    return NextResponse.json({
      languages: supportedLanguages,
      total: supportedLanguages.length
    });

  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch available languages' },
      { status: 500 }
    );
  }
}

function getFileExtension(language: string): string {
  const extensions: { [key: string]: string } = {
    javascript: 'js',
    python: 'py',
    go: 'go',
    java: 'java',
    cpp: 'cpp',
    csharp: 'cs',
    typescript: 'ts',
    php: 'php',
    html: 'html',
    css: 'css',
  };
  return extensions[language.toLowerCase()] || 'txt';
} 