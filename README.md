# Loveable - AI Project Generator

A beautiful web interface for generating complete software projects using AI. Simply describe what you want to build, and Loveable will create the entire codebase for you!

## Features

- 🎨 **Modern Web UI**: Clean, responsive interface with beautiful animations
- 🤖 **AI-Powered**: Uses advanced AI models to understand and implement your requirements
- 📁 **Complete Projects**: Generates full, functional applications with multiple files
- 🔍 **File Preview**: View generated code with syntax highlighting
- 📥 **Easy Download**: Download individual files or the entire project as a ZIP
- ⚡ **Real-time Status**: Live updates during project generation
- 🎯 **Smart Planning**: Multi-agent system for planning, architecture, and implementation

## Quick Start

### 1. Install Dependencies

```bash
# Install Python dependencies
pip install -e .

# Or using uv (recommended)
uv sync
```

### 2. Set up Environment Variables

Create a `.env` file in the project root:

```env
GROQ_API_KEY=your_groq_api_key_here
```

### 3. Run the Web Application

```bash
# Start the Flask web server
python app.py
```

The application will be available at `http://localhost:5000`

### 4. Generate Your First Project

1. Open your browser and go to `http://localhost:5000`
2. Enter a project description in the text area
3. Click "Generate Project"
4. Wait for the AI to create your project
5. Download the generated files

## Example Prompts

Try these example prompts to get started:

- "Build a modern todo app with dark mode, drag-and-drop functionality, and local storage"
- "Create a calculator app with a beautiful UI and keyboard support"
- "Make a weather app that shows current weather and 5-day forecast"
- "Build a simple blog with markdown support and comment system"
- "Create a portfolio website with smooth animations and responsive design"

## Architecture

Loveable uses a sophisticated multi-agent system:

1. **Planner Agent**: Converts your natural language description into a structured project plan
2. **Architect Agent**: Breaks down the plan into specific implementation tasks
3. **Coder Agent**: Executes each task using file system tools to write actual code

## File Structure

```
Loveable/
├── app.py                 # Flask web application
├── main.py               # Original CLI interface
├── agent/                # AI agent system
│   ├── graph.py          # LangGraph workflow orchestration
│   ├── prompts.py        # AI prompts for each agent
│   ├── states.py         # Data models and state management
│   └── tools.py          # File system tools
├── templates/            # HTML templates
│   └── index.html        # Main web interface
├── static/               # Static assets
│   ├── css/
│   │   └── style.css     # Modern CSS styling
│   └── js/
│       └── app.js        # Frontend JavaScript
├── generated_project/    # Output directory for generated projects
└── pyproject.toml        # Project configuration
```

## Web Interface Features

### Input Section
- Large text area for project descriptions
- Recursion limit configuration for complex projects
- Example prompts that cycle automatically

### Status Section
- Real-time progress updates
- Animated progress bar
- Status indicators with icons

### Results Section
- File browser with icons and metadata
- Syntax-highlighted code preview
- Individual file downloads
- Complete project ZIP download
- File type recognition and appropriate icons

### Modals
- Full-screen file viewer with syntax highlighting
- Error handling with user-friendly messages
- Keyboard shortcuts (Escape to close)

## API Endpoints

- `GET /` - Main web interface
- `POST /generate` - Start project generation
- `GET /status` - Check generation status
- `GET /download/<filename>` - Download individual file
- `GET /download-all` - Download complete project as ZIP

## Technologies Used

- **Backend**: Python, Flask, LangChain, LangGraph
- **AI Model**: Groq GPT-OSS-120B
- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Styling**: Modern CSS with gradients, animations, and responsive design
- **Code Highlighting**: Prism.js
- **Icons**: Font Awesome

## Development

### Running in Development Mode

```bash
# Enable debug mode
export FLASK_DEBUG=1
python app.py
```

### Adding New Features

1. **Backend**: Modify `app.py` for new API endpoints
2. **Frontend**: Update `templates/index.html` and `static/js/app.js`
3. **Styling**: Modify `static/css/style.css`
4. **AI Agents**: Extend `agent/` module for new capabilities

## Troubleshooting

### Common Issues

1. **"Generation already in progress"**: Wait for current generation to complete
2. **"No files were generated"**: Check your prompt and try again
3. **API Key Error**: Ensure `GROQ_API_KEY` is set in your `.env` file

### Debug Mode

Enable debug mode to see detailed logs:

```bash
export FLASK_DEBUG=1
python app.py
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is open source and available under the MIT License.

## Support

For issues and questions:
1. Check the troubleshooting section
2. Review the logs in debug mode
3. Open an issue on GitHub

---

**Happy Coding!** 🚀
