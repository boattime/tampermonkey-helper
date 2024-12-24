# tampermonkey-helper

A visual tool to assist in writing Tampermonkey scripts by providing easy element selection, code generation, and script templates.

## Features

- **Element Picker**: Visually select elements on any webpage
- **Selector Generation**: Automatically generates optimal CSS selectors for selected elements
- **Code Templates**: Quick generation of common script patterns
- **Copy to Clipboard**: One-click copying of selectors and code snippets
- **Visual Feedback**: Real-time element highlighting and information display

## Installation

1. Install the Tampermonkey browser extension
2. Create a new script in Tampermonkey
3. Copy and paste the entire script code
4. Save the script

## Usage

### Opening the Helper
- Click the floating "Open Script Helper" button in the bottom-right corner
- Use the keyboard shortcut `Ctrl + Shift + H`

### Main Functions
1. **Element Selection**
   - Click "Start Element Picker"
   - Hover over any element to see its information
   - Click an element to select it

2. **Generating Code**
   - Use "Copy Selector" to get the element's CSS selector
   - "Generate Template" creates a basic script template
   - "Generate WaitFor" creates an element wait function

### Controls
- Start/Stop Picker: Toggles element selection mode
- Copy Selector: Copies the current element's selector
- Generate Template: Creates a basic script template
- Generate WaitFor: Creates a function to wait for element existence

## Tips
- The helper will show real-time information about selected elements
- Selectors are optimized for uniqueness and reliability
- Generated code includes common Tampermonkey metadata
- The helper can be closed and reopened without losing functionality

## Keyboard Shortcuts
- `Ctrl + Shift + H`: Open/close the helper

## Compatibility
- Works with most modern browsers
- Requires Tampermonkey extension
- Compatible with most websites (some may have restrictions)

## Notes
- Some websites may block element selection due to security policies
- The helper window can be dragged to avoid blocking content
- All generated code includes necessary commenting and structure

## Support
For issues or suggestions, please open an issue in the repository or contribute to the codebase.

## License
Free to use and modify. Attribution appreciated.

---
Happy scripting!
