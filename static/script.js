
// Show the selected panel and hide others
function showPanel(panelId) {
    // Hide all panels
    document.querySelectorAll('.action-panels').forEach(panel => {
        panel.classList.remove('active-panel');
    });
    
    // Show the selected panel with animation
    const selectedPanel = document.getElementById(panelId);
    selectedPanel.classList.add('active-panel');
    
    // Scroll to the panel
    selectedPanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// Handle file selection
function handleFileSelect(input, fileNameId) {
    const fileName = input.files[0]?.name;
    const fileNameElement = document.getElementById(fileNameId);
    
    if (fileName) {
        fileNameElement.textContent = fileName;
        fileNameElement.style.display = 'block';
        
        // Enable the corresponding button
        if (fileNameId === 'txtFileName') {
            document.getElementById('analyzeTxtBtn').disabled = false;
        } else if (fileNameId === 'csvFileName') {
            document.getElementById('analyzeCsvBtn').disabled = false;
        }
    }
}

// Reset panel to initial state
function resetPanel(panelId) {
    const panel = document.getElementById(panelId);
    
    // Reset form elements
    panel.querySelectorAll('input, textarea').forEach(element => {
        element.value = '';
    });
    
    // Hide results
    panel.querySelectorAll('.result-container').forEach(container => {
        container.style.display = 'none';
    });
    
    // Hide file names
    panel.querySelectorAll('.file-name').forEach(element => {
        element.style.display = 'none';
    });
    
    // Disable buttons
    if (panelId === 'txtFilePanel') {
        document.getElementById('analyzeTxtBtn').disabled = true;
    } else if (panelId === 'csvPanel') {
        document.getElementById('analyzeCsvBtn').disabled = true;
    }
}

// File drag and drop handling
document.querySelectorAll('.file-label').forEach(label => {
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        label.addEventListener(eventName, preventDefaults, false);
    });
    
    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }
    
    ['dragenter', 'dragover'].forEach(eventName => {
        label.addEventListener(eventName, highlight, false);
    });
    
    ['dragleave', 'drop'].forEach(eventName => {
        label.addEventListener(eventName, unhighlight, false);
    });
    
    function highlight() {
        label.style.borderColor = 'var(--primary-color)';
        label.style.backgroundColor = 'rgba(58, 123, 213, 0.05)';
    }
    
    function unhighlight() {
        label.style.borderColor = '#ddd';
        label.style.backgroundColor = 'transparent';
    }
    
    label.addEventListener('drop', handleDrop, false);
    
    function handleDrop(e) {
        let dt = e.dataTransfer;
        let files = dt.files;
        
        if (files.length > 0) {
            const inputId = label.getAttribute('for');
            const input = document.getElementById(inputId);
            input.files = files;
            
            // Trigger change event
            const event = new Event('change', { bubbles: true });
            input.dispatchEvent(event);
        }
    }
});
        async function predictText() {
    let text = document.getElementById("textInput").value;
    if (!text.trim()) {
        alert("Please enter text to analyze");
        return;
    }
    
    // Show loading state
    const button = document.getElementById("analyzeTextBtn");
    const originalText = button.innerHTML;
    button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Analyzing...';
    button.disabled = true;
    
    try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Simulate response (random for demo)
        const prediction = Math.random() > 0.5;
        showTextResult(prediction);
    } catch (error) {
        alert("Error analyzing text");
    } finally {
        // Reset button
        button.innerHTML = originalText;
        button.disabled = false;
    }
}

function showTextResult(prediction) {
    const resultContainer = document.getElementById("textResult");
    const resultIcon = resultContainer.querySelector(".result-icon");
    const resultText = resultContainer.querySelector(".result-text");
    
    // Update result based on prediction
    if (prediction) {
        resultContainer.className = "result-container result-true";
        resultIcon.className = "fas fa-check-circle result-icon true";
        resultText.className = "result-text true";
        resultText.textContent = "Real News";
    } else {
        resultContainer.className = "result-container result-false";
        resultIcon.className = "fas fa-times-circle result-icon false";
        resultText.className = "result-text false";
        resultText.textContent = "Fake News";
    }
    
    // Show result with animation
    resultContainer.style.display = "block";
}

async function predictFile() {
    let fileInput = document.getElementById("fileInputTxt").files[0];
    if (!fileInput) {
        alert("Please select a file to analyze");
        return;
    }
    
    // Show loading state
    const button = document.getElementById("analyzeTxtBtn");
    const originalText = button.innerHTML;
    button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Analyzing...';
    button.disabled = true;
    
    try {
        // Simulate file reading and API call
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Simulate response (random for demo)
        const prediction = Math.random() > 0.5;
        showFileResult(prediction);
    } catch (error) {
        alert("Error analyzing file");
    } finally {
        // Reset button
        button.innerHTML = originalText;
        button.disabled = false;
    }
}

function showFileResult(prediction) {
    const resultContainer = document.getElementById("fileResult");
    const resultIcon = resultContainer.querySelector(".result-icon");
    const resultText = resultContainer.querySelector(".result-text");
    
    // Update result based on prediction
    if (prediction) {
        resultContainer.className = "result-container result-true";
        resultIcon.className = "fas fa-check-circle result-icon true";
        resultText.className = "result-text true";
        resultText.textContent = "Real News";
    } else {
        resultContainer.className = "result-container result-false";
        resultIcon.className = "fas fa-times-circle result-icon false";
        resultText.className = "result-text false";
        resultText.textContent = "Fake News";
    }
    
    // Show result with animation
    resultContainer.style.display = "block";
}

async function predictCSV() {
let fileInput = document.getElementById("fileInputCSV").files[0];
if (!fileInput) {
alert("Please select a file to process");
return;
}

// Change process button to loading state
const button = document.getElementById("analyzeCsvBtn");
const originalText = button.innerHTML;
button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
button.disabled = true;

try {
let formData = new FormData();
formData.append("file", fileInput);

let response = await fetch("/predict_csv", {
    method: "POST",
    body: formData
});

if (!response.ok) {
    throw new Error("Error processing file");
}

// Get resulting file and prepare for download
let blob = await response.blob();
let url = window.URL.createObjectURL(blob);

// Update UI text elements
const resultContainer = document.getElementById("csvResult");
const resultText = resultContainer.querySelector(".result-text");
resultText.textContent = "File updated with classification results";

const resultDescription = resultContainer.querySelector(".result-description");
resultDescription.textContent = "All texts in the file have been successfully analyzed and classified";

// Show download link
const link = document.getElementById("downloadLink");
link.href = url;
let fileName = fileInput.name.split('.')[0];
link.download = `${fileName}_classified.csv`;
link.style.display = "inline-block";

// Show result with animation
resultContainer.style.display = "block";
} catch (error) {
alert("Error processing: You need a target column named 'text' in the dataset 😁");
} finally {
// Restore button to original state
button.innerHTML = originalText;
button.disabled = false;
}
}

