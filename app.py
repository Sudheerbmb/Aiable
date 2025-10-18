import os
import json
import threading
import time
from flask import Flask, render_template, request, jsonify, send_file
from pathlib import Path
import traceback
from agent.graph import agent

app = Flask(__name__)

# Global variable to store generation status
generation_status = {
    'is_running': False,
    'progress': '',
    'error': None,
    'files': [],
    'project_name': ''
}

def run_agent_generation(prompt, recursion_limit=100):
    """Run the agent generation in a separate thread"""
    global generation_status
    
    try:
        generation_status['is_running'] = True
        generation_status['progress'] = 'Starting project generation...'
        generation_status['error'] = None
        generation_status['files'] = []
        
        # Run the agent
        result = agent.invoke(
            {"user_prompt": prompt},
            {"recursion_limit": recursion_limit}
        )
        
        # Extract project information
        if 'plan' in result:
            generation_status['project_name'] = result['plan'].name
        else:
            generation_status['project_name'] = 'Generated Project'
        
        # Get generated files
        generated_dir = Path('generated_project')
        if generated_dir.exists():
            files = []
            for file_path in generated_dir.rglob('*'):
                if file_path.is_file():
                    relative_path = file_path.relative_to(generated_dir)
                    try:
                        with open(file_path, 'r', encoding='utf-8') as f:
                            content = f.read()
                        files.append({
                            'name': str(relative_path),
                            'content': content,
                            'size': len(content),
                            'type': file_path.suffix.lower()
                        })
                    except Exception as e:
                        files.append({
                            'name': str(relative_path),
                            'content': f'Error reading file: {str(e)}',
                            'size': 0,
                            'type': file_path.suffix.lower()
                        })
            generation_status['files'] = files
        
        generation_status['progress'] = 'Generation completed successfully!'
        
    except Exception as e:
        generation_status['error'] = str(e)
        generation_status['progress'] = f'Error: {str(e)}'
        print(f"Error in generation: {e}")
        traceback.print_exc()
    finally:
        generation_status['is_running'] = False

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/generate', methods=['POST'])
def generate():
    global generation_status
    
    if generation_status['is_running']:
        return jsonify({'error': 'Generation already in progress'}), 400
    
    data = request.get_json()
    prompt = data.get('prompt', '').strip()
    recursion_limit = data.get('recursion_limit', 100)
    
    if not prompt:
        return jsonify({'error': 'Prompt is required'}), 400
    
    # Start generation in a separate thread
    thread = threading.Thread(target=run_agent_generation, args=(prompt, recursion_limit))
    thread.daemon = True
    thread.start()
    
    return jsonify({'message': 'Generation started'})

@app.route('/status')
def status():
    return jsonify(generation_status)

@app.route('/download/<path:filename>')
def download_file(filename):
    """Download a specific file from the generated project"""
    file_path = Path('generated_project') / filename
    if file_path.exists() and file_path.is_file():
        return send_file(file_path, as_attachment=True)
    return jsonify({'error': 'File not found'}), 404

@app.route('/download-all')
def download_all():
    """Download all files as a zip archive"""
    import zipfile
    import io
    
    generated_dir = Path('generated_project')
    if not generated_dir.exists():
        return jsonify({'error': 'No generated project found'}), 404
    
    # Create zip in memory
    zip_buffer = io.BytesIO()
    with zipfile.ZipFile(zip_buffer, 'w', zipfile.ZIP_DEFLATED) as zip_file:
        for file_path in generated_dir.rglob('*'):
            if file_path.is_file():
                relative_path = file_path.relative_to(generated_dir)
                zip_file.write(file_path, relative_path)
    
    zip_buffer.seek(0)
    
    return send_file(
        zip_buffer,
        mimetype='application/zip',
        as_attachment=True,
        download_name='generated_project.zip'
    )

if __name__ == '__main__':
    # Ensure generated_project directory exists
    Path('generated_project').mkdir(exist_ok=True)
    app.run(debug=True, host='0.0.0.0', port=5000)
