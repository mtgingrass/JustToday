#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const os = require('os');

// Environment detection
function getEnvironment() {
  const platform = os.platform();
  const hostname = os.hostname();
  
  // Check if we're on a Digital Ocean droplet
  if (platform === 'linux' && (hostname.includes('droplet') || process.env.DROPLET_ENV)) {
    return 'droplet';
  }
  
  // Check if we're on macOS
  if (platform === 'darwin') {
    return 'macos';
  }
  
  // Default to linux for other Linux systems
  return 'linux';
}

// Get base directory based on environment
function getBaseDirectory() {
  const env = getEnvironment();
  const homeDir = os.homedir();
  
  switch (env) {
    case 'macos':
      return path.join(homeDir, 'Developer');
    case 'droplet':
    case 'linux':
      return path.join(homeDir, 'projects'); // or wherever you keep your projects on the droplet
    default:
      return path.join(homeDir, 'projects');
  }
}

// Load site configurations from file or use defaults
function loadSiteConfigurations() {
  const baseDir = getBaseDirectory();
  const configFile = path.join(baseDir, '.rant-config.json');
  
  // Default configurations
  const defaultSites = {
    tourwithmark: {
      path: path.join(baseDir, 'tourwithmark_2025'),
      file: 'rants.qmd',
      branch: 'main'
    },
    markforchange: {
      path: path.join(baseDir, 'markforchange', 'markforchange'),
      file: 'rants.qmd',
      branch: 'main'
    },
    markgingrass: {
      path: path.join(baseDir, 'markgingrass'),
      file: 'rants.qmd',
      branch: 'main'
    }
  };
  
  // Try to load custom configuration
  try {
    if (fs.existsSync(configFile)) {
      const customConfig = JSON.parse(fs.readFileSync(configFile, 'utf8'));
      console.log(`${colors.blue}Loaded configuration from ${configFile}${colors.reset}`);
      
      // Filter out non-site entries (like _comment)
      const filteredConfig = {};
      Object.entries(customConfig).forEach(([key, value]) => {
        if (!key.startsWith('_') && typeof value === 'object' && value.path) {
          filteredConfig[key] = value;
        }
      });
      
      return { ...defaultSites, ...filteredConfig };
    }
  } catch (error) {
    console.log(`${colors.yellow}Warning: Could not load config file, using defaults${colors.reset}`);
  }
  
  return defaultSites;
}

// Site configurations (loaded dynamically)
let SITES;

// Color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

// Initialize SITES configuration
function initializeSites() {
  if (!SITES) {
    SITES = loadSiteConfigurations();
  }
}

// Parse command line arguments
function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    commit: false,
    push: false,
    editor: false,
    guiEditor: false,
    message: null,
    rantText: null,
    aiFormat: false,
    site: 'tourwithmark', // default site
    config: false,
    showEnv: false
  };

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '-c':
      case '--commit':
        options.commit = true;
        break;
      case '-p':
      case '--push':
        options.push = true;
        options.commit = true; // Push implies commit
        break;
      case '-e':
      case '--editor':
        options.editor = true;
        break;
      case '--gui':
        options.guiEditor = true;
        options.editor = true; // GUI implies editor mode
        break;
      case '-m':
      case '--message':
        if (i + 1 < args.length) {
          options.message = args[++i];
        }
        break;
      case '-f':
      case '--format':
        options.aiFormat = true;
        break;
      case '-s':
      case '--site':
        if (i + 1 < args.length) {
          const site = args[++i].toLowerCase();
          initializeSites(); // Make sure SITES is loaded
          if (SITES[site]) {
            options.site = site;
          } else {
            console.error(`${colors.red}Error: Unknown site '${site}'${colors.reset}`);
            console.log(`${colors.yellow}Available sites: ${Object.keys(SITES).join(', ')}${colors.reset}`);
            process.exit(1);
          }
        }
        break;
      case '--config':
        options.config = true;
        break;
      case '--env':
        options.showEnv = true;
        break;
      case '-h':
      case '--help':
        showHelp();
        process.exit(0);
      default:
        if (!args[i].startsWith('-')) {
          // Join all non-flag arguments as the rant text
          options.rantText = args.slice(i).join(' ');
          i = args.length; // Exit loop
        }
    }
  }

  return options;
}

// Show help message
function showHelp() {
  initializeSites(); // Make sure SITES is loaded
  const env = getEnvironment();
  const baseDir = getBaseDirectory();
  
  console.log(`
${colors.cyan}Multi-Site Rant Script - Add rants to different sites${colors.reset}

${colors.yellow}Current Environment:${colors.reset} ${env}
${colors.yellow}Base Directory:${colors.reset} ${baseDir}

${colors.yellow}Usage:${colors.reset}
  rant [options] "Your rant text here"

${colors.yellow}Options:${colors.reset}
  -s, --site       Site to add rant to (${Object.keys(SITES).join(', ')})
  -c, --commit     Add and commit the changes
  -p, --push       Add, commit, and push to GitHub
  -e, --editor     Open editor for composing rant
  --gui            Open GUI editor (VS Code, TextEdit, etc.)
  -f, --format     Format text with AI (fix grammar, add structure)
  -m, --message    Custom commit message (use with -c or -p)
  --config         Create/edit configuration file
  --env            Show environment information
  -h, --help       Show this help message

${colors.yellow}Examples:${colors.reset}
  rant --site tourwithmark "This is a TourWithMark rant"
  rant -s markforchange -p "This is a MarkForChange rant"
  rant --site markgingrass -c "Professional rant here"
  rant -s tourwithmark -f -p "unformatted text gets cleaned up"
  rant -e --site markforchange
  echo "My rant" | rant -s tourwithmark -f -p
  rant --config  # Create/edit config file
  rant --env     # Show environment info

${colors.yellow}Available sites:${colors.reset}
  tourwithmark  - Tour With Mark blog (default)
  markforchange - Mark For Change site
  markgingrass  - Professional site

${colors.yellow}Configuration:${colors.reset}
  Config file: ${path.join(baseDir, '.rant-config.json')}
  Set DROPLET_ENV=true on your droplet for proper detection
`);
}

// Get current date and time formatted
function getCurrentDateTime() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = now.getHours();
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];
  const monthName = monthNames[now.getMonth()];
  
  return {
    date: `${year}-${month}-${day}`,
    displayDate: `${monthName} ${day}, ${year}`,
    time: `${displayHours}:${minutes} ${period}`,
    timestamp: now.toISOString()
  };
}

// Read rant text from stdin if piped
async function readFromStdin() {
  if (process.stdin.isTTY) {
    return null;
  }
  
  let data = '';
  process.stdin.setEncoding('utf8');
  
  return new Promise((resolve) => {
    process.stdin.on('data', chunk => data += chunk);
    process.stdin.on('end', () => resolve(data.trim()));
  });
}

// Open editor for composing rant
function openEditor(useGui = false) {
  const tempFile = path.join(require('os').tmpdir(), `rant-${Date.now()}.md`);
  fs.writeFileSync(tempFile, '# Type your rant below this line\n\n');
  
  let editor;
  if (useGui) {
    // Try to find a GUI editor
    const guiEditors = [
      'code --wait',           // VS Code
      'subl --wait',          // Sublime Text
      'atom --wait',          // Atom
      'open -W -a TextEdit',  // Mac TextEdit
      'gedit',                // Linux Gedit
      'notepad'               // Windows Notepad
    ];
    
    editor = guiEditors.find(ed => {
      try {
        execSync(`which ${ed.split(' ')[0]}`, { stdio: 'ignore' });
        return true;
      } catch {
        return false;
      }
    });
    
    if (!editor) {
      console.log(`${colors.yellow}No GUI editor found. Install VS Code, Sublime Text, or set EDITOR environment variable.${colors.reset}`);
      console.log(`${colors.yellow}Falling back to terminal editor...${colors.reset}`);
      editor = process.env.EDITOR || 'nano';
    }
  } else {
    editor = process.env.EDITOR || 'nano';
  }
  
  try {
    console.log(`${colors.blue}Opening editor: ${editor}${colors.reset}`);
    execSync(`${editor} "${tempFile}"`, { stdio: 'inherit' });
    const content = fs.readFileSync(tempFile, 'utf8');
    fs.unlinkSync(tempFile);
    
    // Remove the instruction line and clean up
    return content.split('\n').slice(2).join('\n').trim();
  } catch (error) {
    console.error(`${colors.red}Error opening editor: ${error.message}${colors.reset}`);
    process.exit(1);
  }
}

// Format text using AI (via Claude CLI)
async function formatWithAI(text) {
  console.log(`${colors.blue}Formatting with AI...${colors.reset}`);
  
  const prompt = `Please format and improve the following text for a blog rant/post. 
Make it more readable by:
- Adding proper paragraph breaks where needed
- Converting lists into bullet points or numbered lists where appropriate
- Fixing any obvious grammar or spelling errors
- Improving sentence structure for clarity
- Adding emphasis (bold/italic) where it would help
- Ensuring proper capitalization and punctuation

Keep the original tone and meaning intact. Do not add conclusions, summaries, or additional content. 
Only format and structure what's already there.

Here's the text to format:

${text}

Please output ONLY the formatted text, nothing else.`;

  try {
    // Create a temporary file with the prompt
    const tempPromptFile = path.join(require('os').tmpdir(), `rant-prompt-${Date.now()}.txt`);
    fs.writeFileSync(tempPromptFile, prompt);
    
    // Call Claude CLI - using stdin to avoid shell escaping issues
    const result = execSync(`cat "${tempPromptFile}" | claude`, { 
      encoding: 'utf8',
      maxBuffer: 1024 * 1024 * 10 // 10MB buffer
    });
    
    // Clean up temp file
    fs.unlinkSync(tempPromptFile);
    
    // Return the formatted text
    const formattedText = result.trim();
    console.log(`${colors.green}✓ AI formatting complete${colors.reset}`);
    return formattedText;
  } catch (error) {
    console.error(`${colors.yellow}Warning: AI formatting failed, using original text${colors.reset}`);
    console.error(`${colors.yellow}Error: ${error.message}${colors.reset}`);
    return text; // Return original text if AI formatting fails
  }
}

// Convert URLs to clickable links
function autoLinkUrls(text) {
  // More comprehensive regex for URLs
  const urlRegex = /(https?:\/\/(?:[-\w.])+(?::\d+)?(?:\/(?:[\w._~!$&'()*+,;=:@]|%[0-9A-Fa-f]{2})*)*(?:\?(?:[\w._~!$&'()*+,;=:@/?]|%[0-9A-Fa-f]{2})*)?(?:#(?:[\w._~!$&'()*+,;=:@/?]|%[0-9A-Fa-f]{2})*)?|www\.(?:[-\w.])+(?::\d+)?(?:\/(?:[\w._~!$&'()*+,;=:@]|%[0-9A-Fa-f]{2})*)*(?:\?(?:[\w._~!$&'()*+,;=:@/?]|%[0-9A-Fa-f]{2})*)?(?:#(?:[\w._~!$&'()*+,;=:@/?]|%[0-9A-Fa-f]{2})*)?|(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}(?::\d+)?(?:\/(?:[\w._~!$&'()*+,;=:@]|%[0-9A-Fa-f]{2})*)*(?:\?(?:[\w._~!$&'()*+,;=:@/?]|%[0-9A-Fa-f]{2})*)?(?:#(?:[\w._~!$&'()*+,;=:@/?]|%[0-9A-Fa-f]{2})*)?)/g;
  
  return text.replace(urlRegex, (match) => {
    // Clean up any trailing punctuation that shouldn't be part of the URL
    const cleanMatch = match.replace(/[.,;:!?]+$/, '');
    const trailingPunctuation = match.substring(cleanMatch.length);
    
    let url = cleanMatch;
    
    // Add https:// if it's missing and it's not already a full URL
    if (!url.startsWith('http://') && !url.startsWith('https://') && !url.startsWith('ftp://')) {
      url = 'https://' + url;
    }
    
    return `<a href="${url}" target="_blank" rel="noopener noreferrer">${cleanMatch}</a>${trailingPunctuation}`;
  });
}

// Insert rant into the file
function insertRant(rantText, siteConfig) {
  const { date, displayDate, time, timestamp } = getCurrentDateTime();
  
  // Generate unique ID for this rant (date + timestamp in milliseconds)
  const rantId = `rant-${date}-${Date.now()}`;
  
  // Construct full path to rants file
  const rantsFile = path.join(siteConfig.path, siteConfig.file);
  
  // Check if file exists
  if (!fs.existsSync(rantsFile)) {
    console.error(`${colors.red}Error: Rants file not found at ${rantsFile}${colors.reset}`);
    console.log(`${colors.yellow}Make sure the site path and file are correct.${colors.reset}`);
    process.exit(1);
  }
  
  // Read current content
  let content = fs.readFileSync(rantsFile, 'utf8');
  
  // Find the rants-timeline div
  const timelineMatch = content.match(/<div class="rants-timeline">/);
  if (!timelineMatch) {
    console.error(`${colors.red}Error: Could not find rants-timeline div${colors.reset}`);
    process.exit(1);
  }
  
  const timelineStart = timelineMatch.index + timelineMatch[0].length;
  
  // Look for existing date section
  const datePattern = new RegExp(`<div class="rant-day" data-date="${date}">`, 'g');
  const existingDateMatch = content.match(datePattern);
  
  let insertPosition;
  let newRantHTML;
  
  if (existingDateMatch) {
    // Date exists, find where to insert within this date section
    const dateHeaderPattern = new RegExp(`<div class="rant-day" data-date="${date}">\\s*<div class="date-header">\\s*<span class="date">[^<]+</span>\\s*</div>`);
    const dateHeaderMatch = content.match(dateHeaderPattern);
    
    if (dateHeaderMatch) {
      insertPosition = dateHeaderMatch.index + dateHeaderMatch[0].length;
      // Just add the new rant entry with anchor ID and link
      newRantHTML = `

<div class="rant-entry" id="${rantId}">
<div class="time-stamp">
${time}
<a href="#${rantId}" class="rant-anchor" title="Link to this rant">🔗</a>
</div>
<div class="rant-content">
${autoLinkUrls(rantText).replace(/\n/g, '\n')}
</div>
</div>`;
    }
  } else {
    // New date, create entire date section
    // Find first date section after timeline start
    const firstDateMatch = content.substring(timelineStart).match(/<div class="rant-day" data-date="/);
    
    if (firstDateMatch) {
      insertPosition = timelineStart + firstDateMatch.index;
    } else {
      // No dates exist, insert after timeline opening
      insertPosition = timelineStart;
    }
    
    newRantHTML = `

<!-- ${date} -->
<div class="rant-day" data-date="${date}">
<div class="date-header">
<span class="date">${displayDate}</span>
</div>

<div class="rant-entry" id="${rantId}">
<div class="time-stamp">
${time}
<a href="#${rantId}" class="rant-anchor" title="Link to this rant">🔗</a>
</div>
<div class="rant-content">
${autoLinkUrls(rantText).replace(/\n/g, '\n')}
</div>
</div>

</div>`;
  }
  
  // Insert the new content
  content = content.slice(0, insertPosition) + newRantHTML + content.slice(insertPosition);
  
  // Write back to file
  fs.writeFileSync(rantsFile, content);
  
  return { 
    date: displayDate, 
    time, 
    preview: rantText.substring(0, 50) + (rantText.length > 50 ? '...' : ''),
    id: rantId,
    site: siteConfig.path 
  };
}

// Execute git operations
function gitOperations(commit, push, message, siteConfig) {
  try {
    // Change to site directory
    process.chdir(siteConfig.path);
    
    // Check git status
    const status = execSync('git status --porcelain', { encoding: 'utf8' });
    if (!status.includes(siteConfig.file)) {
      console.log(`${colors.yellow}No changes to ${siteConfig.file} detected${colors.reset}`);
      return;
    }
    
    // Add the file
    execSync(`git add ${siteConfig.file}`);
    console.log(`${colors.green}✓ Added ${siteConfig.file} to git${colors.reset}`);
    
    if (commit) {
      // Commit
      const commitMessage = message || `Add rant: ${new Date().toLocaleString()}`;
      execSync(`git commit -m "${commitMessage}"`);
      console.log(`${colors.green}✓ Committed changes${colors.reset}`);
      
      if (push) {
        // Push
        console.log(`${colors.blue}Pushing to GitHub (branch: ${siteConfig.branch})...${colors.reset}`);
        execSync(`git push origin ${siteConfig.branch}`);
        console.log(`${colors.green}✓ Pushed to GitHub${colors.reset}`);
      }
    }
  } catch (error) {
    console.error(`${colors.red}Git operation failed: ${error.message}${colors.reset}`);
    process.exit(1);
  }
}

// Show environment information
function showEnvironmentInfo() {
  const env = getEnvironment();
  const baseDir = getBaseDirectory();
  const configFile = path.join(baseDir, '.rant-config.json');
  
  console.log(`
${colors.cyan}Environment Information:${colors.reset}
${colors.yellow}Platform:${colors.reset} ${os.platform()}
${colors.yellow}Hostname:${colors.reset} ${os.hostname()}
${colors.yellow}Detected Environment:${colors.reset} ${env}
${colors.yellow}Home Directory:${colors.reset} ${os.homedir()}
${colors.yellow}Base Directory:${colors.reset} ${baseDir}
${colors.yellow}Config File:${colors.reset} ${configFile}
${colors.yellow}Config Exists:${colors.reset} ${fs.existsSync(configFile) ? 'Yes' : 'No'}
${colors.yellow}DROPLET_ENV:${colors.reset} ${process.env.DROPLET_ENV || 'Not set'}
`);
  
  initializeSites();
  console.log(`${colors.yellow}Available Sites:${colors.reset}`);
  Object.entries(SITES).forEach(([name, config]) => {
    const exists = fs.existsSync(config.path);
    console.log(`  ${name}: ${config.path} ${exists ? colors.green + '✓' + colors.reset : colors.red + '✗' + colors.reset}`);
  });
}

// Create or edit configuration file
function manageConfig() {
  const baseDir = getBaseDirectory();
  const configFile = path.join(baseDir, '.rant-config.json');
  
  console.log(`${colors.cyan}Configuration File Management${colors.reset}`);
  console.log(`${colors.yellow}Config file location:${colors.reset} ${configFile}`);
  
  // Ensure base directory exists
  if (!fs.existsSync(baseDir)) {
    try {
      fs.mkdirSync(baseDir, { recursive: true });
      console.log(`${colors.green}Created base directory: ${baseDir}${colors.reset}`);
    } catch (error) {
      console.error(`${colors.red}Error creating base directory: ${error.message}${colors.reset}`);
      process.exit(1);
    }
  }
  
  // Create default config if it doesn't exist
  if (!fs.existsSync(configFile)) {
    const defaultConfig = {
      "_comment": "Custom site configurations - modify paths as needed for your environment",
      "tourwithmark": {
        "path": path.join(baseDir, "tourwithmark_2025"),
        "file": "rants.qmd",
        "branch": "main"
      },
      "markforchange": {
        "path": path.join(baseDir, "markforchange", "markforchange"),
        "file": "rants.qmd", 
        "branch": "main"
      },
      "markgingrass": {
        "path": path.join(baseDir, "markgingrass"),
        "file": "rants.qmd",
        "branch": "main"
      }
    };
    
    try {
      fs.writeFileSync(configFile, JSON.stringify(defaultConfig, null, 2));
      console.log(`${colors.green}Created default configuration file${colors.reset}`);
    } catch (error) {
      console.error(`${colors.red}Error creating config file: ${error.message}${colors.reset}`);
      process.exit(1);
    }
  }
  
  console.log(`${colors.blue}Opening config file for editing...${colors.reset}`);
  
  // Try to open with editor
  const editor = process.env.EDITOR || 'nano';
  try {
    execSync(`${editor} "${configFile}"`, { stdio: 'inherit' });
    console.log(`${colors.green}Configuration updated${colors.reset}`);
  } catch (error) {
    console.error(`${colors.red}Error opening editor: ${error.message}${colors.reset}`);
    console.log(`${colors.yellow}You can manually edit: ${configFile}${colors.reset}`);
  }
}

// Main function
async function main() {
  const options = parseArgs();
  
  // Handle special options first
  if (options.showEnv) {
    showEnvironmentInfo();
    return;
  }
  
  if (options.config) {
    manageConfig();
    return;
  }
  
  // Initialize sites configuration
  initializeSites();
  
  // Get site configuration
  const siteConfig = SITES[options.site];
  console.log(`${colors.cyan}Using site: ${options.site}${colors.reset}`);
  console.log(`${colors.cyan}Path: ${siteConfig.path}${colors.reset}`);
  
  // Get rant text from various sources
  let rantText = options.rantText;
  
  if (!rantText && !options.editor) {
    rantText = await readFromStdin();
  }
  
  if (!rantText && options.editor) {
    rantText = openEditor(options.guiEditor);
  }
  
  if (!rantText || rantText.trim() === '') {
    console.error(`${colors.red}Error: No rant text provided${colors.reset}`);
    console.log(`${colors.yellow}Use -h for help${colors.reset}`);
    process.exit(1);
  }
  
  // Apply AI formatting if requested
  if (options.aiFormat) {
    rantText = await formatWithAI(rantText.trim());
  }
  
  // Pull latest changes first if we're going to push
  if (options.push) {
    try {
      process.chdir(siteConfig.path);
      console.log(`${colors.blue}Pulling latest changes...${colors.reset}`);
      execSync(`git pull --no-rebase origin ${siteConfig.branch}`, { encoding: 'utf8' });
      console.log(`${colors.green}✓ Updated to latest version${colors.reset}`);
    } catch (pullError) {
      console.error(`${colors.yellow}Warning: Could not pull latest changes${colors.reset}`);
      console.error(`${colors.yellow}You may need to manually sync before pushing${colors.reset}`);
      process.exit(1);
    }
  }
  
  // Insert the rant
  console.log(`${colors.blue}Adding rant...${colors.reset}`);
  const result = insertRant(rantText.trim(), siteConfig);
  console.log(`${colors.green}✓ Rant added successfully!${colors.reset}`);
  console.log(`${colors.cyan}Date: ${result.date}, Time: ${result.time}${colors.reset}`);
  console.log(`${colors.cyan}Anchor link: #${result.id}${colors.reset}`);
  
  // Handle git operations if requested
  if (options.commit || options.push) {
    gitOperations(options.commit, options.push, options.message, siteConfig);
  }
}

// Run the script
main().catch(error => {
  console.error(`${colors.red}Error: ${error.message}${colors.reset}`);
  process.exit(1);
});