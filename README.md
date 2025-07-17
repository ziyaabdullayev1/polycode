# PolyCode - Multi-language Coding Interview Platform

A modern, web-based coding interview platform that allows candidates to write, run, and test code in multiple programming languages simultaneously. Built with Next.js, TypeScript, and the Piston API for code execution.

![PolyCode Screenshot](https://via.placeholder.com/1200x600/4f46e5/ffffff?text=PolyCode+Multi-Language+Editor)

## 🚀 Features

- **Multi-language Support**: JavaScript, Python, Go, Java, C++, C#, TypeScript, PHP, HTML, CSS
- **Three-Panel Layout**: Side-by-side code editors with resizable panels
- **Real-time Execution**: Live code execution using the Piston API
- **Syntax Highlighting**: Monaco Editor with language-specific syntax highlighting
- **Global Input**: Share input data across all editors
- **Individual Controls**: Each editor has its own run, reset, and clear functions
- **Responsive Design**: Modern UI built with Tailwind CSS
- **Dynamic Editor Management**: Add/remove editors on the fly (up to 6 editors)

## 🛠️ Tech Stack

- **Frontend**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Code Editor**: Monaco Editor (VS Code editor)
- **Layout**: React Resizable Panels
- **API**: Piston API for code execution
- **HTTP Client**: Axios

## 📦 Installation

1. **Clone the repository:**
   ```bash
   git clone <your-repo-url>
   cd polycode-app
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

4. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🎯 Use Cases

- **Technical Interviews**: Conduct coding interviews with multi-language support
- **Coding Assessments**: Evaluate candidates across different programming languages
- **Educational Platform**: Compare syntax and logic across languages
- **Pair Programming**: Collaborative coding sessions
- **Coding Competitions**: Live programming challenges

## 🔧 Supported Languages

| Language   | Version | File Extension |
|------------|---------|----------------|
| JavaScript | 18.15.0 | .js           |
| Python     | 3.10.0  | .py           |
| Go         | 1.16.2  | .go           |
| Java       | 15.0.2  | .java         |
| C++        | 10.2.0  | .cpp          |
| C#         | 6.12.0  | .cs           |
| TypeScript | 4.4.4   | .ts           |
| PHP        | 8.2.3   | .php          |
| HTML       | 5       | .html         |
| CSS        | 3       | .css          |

## 🖥️ Usage

### Basic Operations

1. **Writing Code**: Click on any editor panel and start typing
2. **Changing Language**: Use the dropdown in each editor header
3. **Running Code**: Click the "Run" button in individual editors or "Run All"
4. **Input Data**: Toggle "Input" or "Global Input" for stdin data
5. **Resizing Panels**: Drag the dividers between editors

### Advanced Features

- **Add Editors**: Click "+ Add Editor" (max 6 editors)
- **Remove Editors**: Hover over an editor and click the × button
- **Reset Code**: Restore default code examples
- **Clear Output**: Remove execution results
- **Global Operations**: Run, clear, or reset all editors simultaneously

## 🏗️ Project Structure

```
polycode-app/
├── src/
│   ├── app/
│   │   ├── api/execute/route.ts    # Piston API integration
│   │   ├── layout.tsx              # Root layout
│   │   ├── page.tsx                # Main page
│   │   └── globals.css             # Global styles
│   ├── components/
│   │   ├── CodeEditor.tsx          # Individual code editor
│   │   └── PolyCode.tsx            # Main application component
│   ├── config/
│   │   └── languages.ts            # Language configurations
│   └── types/
│       └── index.ts                # TypeScript definitions
├── package.json
└── README.md
```

## 🔌 API Integration

The platform uses the [Piston API](https://github.com/engineer-man/piston) for code execution:

- **Endpoint**: `https://emkc.org/api/v2/piston`
- **Features**: Multi-language support, stdin input, real-time execution
- **Security**: Sandboxed execution environment

### Custom API Route

The `/api/execute` endpoint handles:
- Code validation
- Language mapping
- Error handling
- Response formatting

## 🎨 Customization

### Adding New Languages

1. Update `LANGUAGE_MAP` in `/api/execute/route.ts`
2. Add language config in `/config/languages.ts`
3. Update Monaco language mapping in `CodeEditor.tsx`

### Styling Modifications

The project uses Tailwind CSS. Key components:
- **Colors**: Blue primary, gray neutrals
- **Layout**: Flexbox and CSS Grid
- **Responsive**: Mobile-first approach

## 🚀 Deployment

### Vercel (Recommended)

```bash
npm run build
vercel --prod
```

### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## 🔧 Environment Variables

Currently, no environment variables are required as the platform uses the public Piston API. For production, consider:

```env
PISTON_API_URL=https://emkc.org/api/v2/piston
RATE_LIMIT_REQUESTS=100
RATE_LIMIT_WINDOW=60000
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Piston API](https://github.com/engineer-man/piston) for code execution
- [Monaco Editor](https://microsoft.github.io/monaco-editor/) for the code editor
- [Next.js](https://nextjs.org/) for the React framework
- [Tailwind CSS](https://tailwindcss.com/) for styling

## 📞 Support

For support, email your-email@example.com or open an issue on GitHub.

---

**PolyCode** - Empowering multi-language coding interviews and assessments! 🚀
