const num = parseInt(new URLSearchParams(window.location.search).get('numTextAreas'));

const container = document.getElementById("userInputFields");       // Get the container for textareas & canvases
container.innerHTML = "";                                      // Clear any existing textareas

//Timer related variables
const start = document.getElementById("start");     // Get the timer start button element
const stop = document.getElementById("stop");      // Get the timer stop button element
var timer = document.getElementById("timer");      // Get the timer display element
let seconds = 0;                              // Initialize seconds for the timer
timer.textContent = "00:00:00";                 // Set initial timer display to 00:00:00

// Get the pen and eraser icon elements
const penIcon = document.getElementById('penIcon');
const eraserIcon = document.getElementById('eraserIcon');

// Get the save and clear buttons
const save = document.getElementById("save");
const clear = document.getElementById("clear");

// Get the pen colour and size input elements
const penColour = document.getElementById("penColour");
const penSize = document.getElementById("penSize");

// Get the pen and eraser elements
const pen = document.getElementById("pen");
const eraser = document.getElementById("eraser");

// Get the grid checkbox element
const grid = document.getElementById("Grid");

const audio = new Audio("keySound.mp3");    // Create a new Audio object for the key sound
audio.volume = 0.1;                       // Set the volume for the key sound

let focusCount = focusCountQ = 0;         // Initialize focus counts for textareas
        
let currentMode = "pen" ;           // Default mode is pen
let drawState = "Free Draw";        // Default drawing state is Free Draw
let drawingDetails = {};          // Object to hold details of the current drawing operation
let canvasHistory = {};          // Object to hold history of drawing operations for each canvas
let lineColor = "#ffffff";          // Preset color
let currentColor = lineColor;       // Currently used color
let isDrawing = false;            // Flag to track if drawing is in progress
let X1, Y1, X2, Y2;              // Variables to hold coordinates for drawing
// Create and add textareas and canvases based on the input number
for (let i = 1; i <= num; i++) {

    // Creating Question textarea
    const textareaQ = document.createElement("textarea");         // Question textarea creation.
    textareaQ.id = -i;                                       // Unique ID for each textarea
    textareaQ.value = "Ques." + i + ") ";                     // Add Question no. to each textarea.
    textareaQ.classList.add('auto-resize');                    // Add class for auto-resizing
    container.appendChild(textareaQ);                         // Append the textarea to the container
    container.appendChild(document.createElement("br"));        // Add a line break for spacing
    textareaQ.addEventListener("input", adjustHeightQ);         // Add input event listener for height adjustment
    textareaQ.addEventListener("focus", preventEarlyEditingQ);   // Add focus event listener to prevent editing of question no.

    // Creating Canvas
    const canvas = document.createElement("canvas");                    // Canvas creation
    canvas.id = "Canvas" + i;                                        // Unique ID for each canvas
    container.appendChild(canvas);                                    // Append the canvas to the container
    setCanvasSize(canvas);                                           // Set the size of the canvas based on screen orientation
    canvasHistory[i] = [];                                        // Initialize history for this canvas
    canvas.addEventListener("touchstart", freeDrawStart);           // Add touchstart event listener for drawing
    canvas.addEventListener("touchmove", movePenEraser);              // Add touchmove event listener for moving pen/eraser icon
    canvas.addEventListener("mousedown", freeDrawStart);           // Add mousedown event listener for drawing
    canvas.addEventListener("mousemove", movePenEraser);             // Add mousemove event listener for moving pen/eraser icon
    container.appendChild(document.createElement("br"));             // Add a line break for spacing

    // Create clear canvas button
    const clearCanvasButton = document.createElement("button");     // Clear canvas button creation
    clearCanvasButton.id = "Clear Canvas" + i;                    // Unique ID for each button
    clearCanvasButton.textContent = "Clear 🧹";                   // Set button text
    container.appendChild(clearCanvasButton);                     // Append the button to the container
    clearCanvasButton.addEventListener("click", clearCanvas);       // Add click event listener to clear the canvas
    
    container.appendChild(document.createElement("br"));        // Add line break after clear button
            
    // Create buttons for drawing options
	const straightLine = document.createElement("button");        // Straight line button creation
	straightLine.id = "Straight Line" + i;                      // Unique ID for each button
	straightLine.textContent = "Draw Line |";                    // Set button text
	container.appendChild(straightLine);                        // Append the button to the container
	straightLine.addEventListener("click", drawingState);         // Add click event listener for drawing state
						 
	const dottedLine = document.createElement("button");        // Dotted line button creation
	dottedLine.id = "Dotted Line" + i;                        // Unique ID for each button
	dottedLine.textContent = "Draw Dotted Line ---";            // Set button text
	container.appendChild(dottedLine);                        // Append the button to the container
	dottedLine.addEventListener("click", drawingState);         // Add click event listener for drawing state
						 
	const freeLine = document.createElement("button");          // Free draw button creation
	freeLine.id = "Free Line" + i;                            // Unique ID for each button
	freeLine.textContent = "Free Draw ✍️";                     // Set button text
	container.appendChild(freeLine);                          // Append the button to the container
	freeLine.addEventListener("click", drawingState);           // Add click event listener for drawing state
    freeLine.style.backgroundColor = "rgba(0, 0, 0, 0.1)"; // Set active background color for free draw button
						 
	const circle = document.createElement("button");            // Circle button creation
	circle.id = "Circle" + i;                                // Unique ID for each button
	circle.textContent = "Draw Circle ⭕";                     // Set button text
	container.appendChild(circle);                            // Append the button to the container
	circle.addEventListener("click", drawCircle);               // Add click event listener for drawing circle
						 
    const textarea = document.createElement("textarea");        // Answer textarea creation
    textarea.id = i;                                        // Unique ID for each textarea
    textarea.value = "Ans." + i + ") ";                       // Add Answer no. to each textarea
    textarea.classList.add('auto-resize');                     // Add class for auto-resizing
    container.appendChild(textarea);                          // Append the textarea to the container
    textarea.addEventListener("input", adjustHeight);           // Add input event listener for height adjustment
    textarea.addEventListener("focus", preventEarlyEditing);     // Add focus event listener to prevent editing of answer no.
    
    // Add line breaks for spacing after each question and answer pair.
    container.appendChild(document.createElement("br"));
    container.appendChild(document.createElement("br"))
    container.appendChild(document.createElement("br"))
}

function setCanvasSize(canvas) {
    redrawCanvas(canvas); // Call the function to set the canvas size based on screen orientation
    if (window.matchMedia("(orientation: portrait)").matches) {
        canvas.width = window.innerWidth * 0.6; // 60vw
        canvas.height = window.innerHeight * 0.4; // adjust as needed
    } else {
        canvas.width = screen.width * 0.9; // 90vw
        canvas.height = screen.height * 0.4; // adjust as needed
    }
}

// Function to move the pen and eraser icons based on touch or mouse events.
function movePenEraser(e) {
    const canvas = e.target;
    const canvasRect = canvas.getBoundingClientRect();

    let clientX, clientY;
    if (e.changedTouches && e.changedTouches.length > 0) {
        const touch = e.changedTouches[0];
        clientX = touch.clientX;
        clientY = touch.clientY;
    } else {
        clientX = e.clientX;
        clientY = e.clientY;
    }

    penIcon.style.left = clientX - penIcon.offsetWidth/12 + "px";
    penIcon.style.top = clientY + "px";
    eraserIcon.style.left = clientX - eraserIcon.offsetWidth/10+ "px";
    eraserIcon.style.top = clientY - eraserIcon.offsetHeight/5 + "px";
}

// Function to update the line color based on the selected color from the color picker.
function updateLineColor() {
    if (penColour.value) {                  // Check if a new color is selected from the color picker,
        currentColor = penColour.value;      // if new selected update the current color to the selected color.
    } else {                             // If no new color is selected,
        currentColor = "#ffffff";          // use default color if no new color selected.
    }
}

// Function to handle the drawing state based on the button clicked.
function drawingState(e){
    // Check if the current mode is "pen" before proceeding
    if(currentMode === "pen"){
        // Check if the clicked element is a button and has a specific text content
        if(e.target.textContent === "Draw Line |"){
            const id = e.target.id.slice(-1);                       // Extract the canvas ID from the button ID
            const canvas = document.getElementById("Canvas" + id);     // Get the corresponding canvas element
            canvas.addEventListener("touchstart", straightLineStart);    // Add touchstart event listener for straight line drawing
            canvas.addEventListener("mousedown", straightLineStart);    // Add mousedown event listener for straight line drawing
            drawState = "Straight Line";                            // Set the drawing state to "Straight Line"
            currentColor = penColour.value;                         // Update the current color to the selected pen color
            e.target.style.backgroundColor = "rgba(0, 0, 0, 0.1)";  // Change background color to indicate active state
            document.getElementById("Dotted Line" + id).style.backgroundColor = "#baff55"; // Reset background color of other buttons
            document.getElementById("Free Line" + id).style.backgroundColor = "#baff55"; // Reset background color of other buttons
        } else if(e.target.textContent === "Free Draw ✍️"){
            const id = e.target.id.slice(-1);                       // Extract the canvas ID from the button ID
            const canvas = document.getElementById("Canvas" + id);     // Get the corresponding canvas element
            canvas.addEventListener("touchstart", freeDrawStart);     // Add touchstart event listener for free drawing
            canvas.addEventListener("mousedown", freeDrawStart);     // Add mousedown event listener for free drawing
            drawState = "Free Draw";                                // Set the drawing state to "Free Draw"
            currentColor = penColour.value;                         // Update the current color to the selected pen color
            e.target.style.backgroundColor = "rgba(0, 0, 0, 0.1)";  // Change background color to indicate active state
            document.getElementById("Dotted Line" + id).style.backgroundColor = "#baff55"; // Reset background color of other buttons
            document.getElementById("Straight Line" + id).style.backgroundColor = "#baff55"; // Reset background color of other buttons
        } else if(e.target.textContent === "Draw Dotted Line ---"){
            const id =e.target.id.slice(-1);                        // Extract the canvas ID from the button ID
            const canvas = document.getElementById("Canvas" + id);     // Get the corresponding canvas element
            canvas.addEventListener("touchstart", dottedLineStart);      // Add touchstart event listener for dotted line drawing
            canvas.addEventListener("mousedown", dottedLineStart);      // Add mousedown event listener for dotted line drawing
            drawState = "Dotted Line";                              // Set the drawing state to "Dotted Line"
            currentColor = penColour.value;                         // Update the current color to the selected pen color
            e.target.style.backgroundColor = "rgba(0, 0, 0, 0.1)";  // Change background color to indicate active state
            document.getElementById("Straight Line" + id).style.backgroundColor = "#baff55"; // Reset background color of other buttons
            document.getElementById("Free Line" + id).style.backgroundColor = "#baff55"; // Reset background color of other buttons
        }
    }
}

// Function to handle the start of drawing a straight line.
function straightLineStart(e){
    // Check if the target is a canvas and the current drawing state is "Straight Line"
    if (e.target.tagName.toLowerCase() === "canvas" && drawState === "Straight Line"){
        e.stopPropagation();                                        // Prevent the event from bubbling up
        const canvas = e.target;                                   // Get the canvas element from the event target

        isDrawing = true;                                         // Set the drawing flag to true
        const canvasRect = canvas.getBoundingClientRect();            // Get the bounding rectangle of the canvas to calculate positions
        
        // Calculate the initial coordinates for the straight line
        if (e.changedTouches && e.changedTouches.length > 0) {
            // For touch events.
            const touch = e.changedTouches[0];                      // Get the first touch point
            X1 = touch.clientX - canvasRect.left - 10;                    // Calculate X coordinate relative to the canvas
            Y1 = touch.clientY - canvasRect.top + canvas.scrollTop - 10;    // Calculate Y coordinate relative to the canvas
        } else {
            // For mouse events.
            X1 = e.clientX - canvasRect.left - 10;                       // Calculate X coordinate relative to the canvas
            Y1 = e.clientY - canvasRect.top + canvas.scrollTop - 10;       // Calculate Y coordinate relative to the canvas
        }

        // Add the initial point to the drawing details
        drawingDetails = {
            mode: "pen",
            color: currentColor,
            size: penSize.value,
            type: "Straight Line",
            points: [{x: X1, y: Y1}]
        };
             
        canvas.addEventListener("touchmove", movePenEraser);        // Add touchmove event listener to move the pen/eraser icon
        canvas.addEventListener("touchend", straightLineEnd);       // Add touchend event listener to end the straight line drawing
        canvas.addEventListener("mousemove", movePenEraser);        // Add mousemove event listener to move the pen/eraser icon
        canvas.addEventListener("mouseup", straightLineEnd);        // Add mouseup event listener to end the straight line drawing
        
        e.preventDefault();                                    // Prevent the default behavior of the event to avoid scrolling or other actions
    }
}

// Function to handle the end of drawing a straight line.
function straightLineEnd(e){
    // Check if drawing is in progress
    if (!isDrawing) return;                                 // If not drawing, exit the function
    
    const canvas = e.target;                               // Get the canvas element from the event target
    const ctx = canvas.getContext('2d');                    // Get the 2D context for drawing
    ctx.lineCap = "round";                                 // Set the line cap style for the stroke
    ctx.strokeStyle = currentColor;                         // Set the stroke style to the current color
    ctx.lineWidth = penSize.value;                          // Ensure pen size is applied for live drawing
    const canvasRect = canvas.getBoundingClientRect();        // Get the bounding rectangle of the canvas to calculate positions
    
    // Check if the event is a touch event or mouse event
    if (e.changedTouches && e.changedTouches.length > 0) {
        // For touch events.
        const touch = e.changedTouches[0];                          // Get the first touch point
        X2 = touch.clientX - canvasRect.left - 10;                   // Calculate X coordinate relative to the canvas
        Y2 = touch.clientY - canvasRect.top + canvas.scrollTop - 10;   // Calculate Y coordinate relative to the canvas
    } else {
        // For mouse events.
        X2 = e.clientX - canvasRect.left - 10;                      // Calculate X coordinate relative to the canvas
        Y2 = e.clientY - canvasRect.top + canvas.scrollTop - 10;      // Calculate Y coordinate relative to the canvas
    }

    ctx.beginPath();                                            // Begin a new path for the straight line
    ctx.moveTo(X1, Y1);                                         // Move to the starting point of the line
    ctx.lineTo(X2, Y2);                                         // Draw a line to the end point
    ctx.stroke();                                              // Stroke the path to render the line on the canvas
    ctx.closePath();                                           // Close the path   
    drawingDetails.points.push({x: X2, y: Y2});                   // Add the end point to the drawing details
    canvasHistory[canvas.id.slice(-1)].push(drawingDetails);        // Push the drawing details to the canvas history

    // Remove event listeners to stop drawing
    canvas.removeEventListener("touchend", straightLineEnd);
    canvas.removeEventListener("mouseup", straightLineEnd);

    isDrawing = false;                                          // Reset drawing state
    drawingDetails = {};                                        // Clear drawing details for the next stroke
}

// Function to handle the start of drawing a dotted line.
function dottedLineStart(e){
    // Check if the target is a canvas and the current drawing state is "Dotted Line"
    if(e.target.tagName.toLowerCase() === "canvas" && drawState === "Dotted Line"){
        e.stopPropagation();                                // Prevent the event from bubbling up
        const canvas = e.target;                           // Get the canvas element from the event target

        isDrawing = true;                                 // Set the drawing flag to true
        const canvasRect = canvas.getBoundingClientRect();    // Get the bounding rectangle of the canvas to calculate positions
        
        // Calculate the initial coordinates for the dotted line
        if (e.changedTouches && e.changedTouches.length > 0) {
            // For touch events.
            const touch = e.changedTouches[0];                      // Get the first touch point
            X1 = touch.clientX - canvasRect.left - 10;                    // Calculate X coordinate relative to the canvas
            Y1 = touch.clientY - canvasRect.top + canvas.scrollTop - 10;    // Calculate Y coordinate relative to the canvas
        } else {
            // For mouse events.
            X1 = e.clientX - canvasRect.left - 10;                       // Calculate X coordinate relative to the canvas
            Y1 = e.clientY - canvasRect.top + canvas.scrollTop - 10;       // Calculate Y coordinate relative to the canvas
        }

        // Add the initial point to the drawing details
        drawingDetails = {
            mode: "pen",
            color: currentColor,
            size: penSize.value,
            type: "Dotted Line",
            points: [{x: X1, y: Y1}]
        };
        
        // Add event listeners for touchmove, touchend, mousemove & mouseup to handle the drawing
        canvas.addEventListener("touchmove", movePenEraser);
        canvas.addEventListener("touchend", dottedLineEnd);
        canvas.addEventListener("mousemove", movePenEraser);
        canvas.addEventListener("mouseup", dottedLineEnd);

        e.preventDefault();                                         // Prevent the default behavior of the event to avoid scrolling or other actions
    }
}

// Function to handle the end of drawing a dotted line.
function dottedLineEnd(e){
    if (!isDrawing) return;                                     // If not drawing, exit the function

    const canvas = e.target;                                   // Get the canvas element from the event target
    const ctx = canvas.getContext('2d');                        // Get the 2D context for drawing
    ctx.lineCap = "round";                                     // Set the line cap style for the stroke
    ctx.strokeStyle = currentColor;                             // Set the stroke style to the current color
    ctx.lineWidth = penSize.value;                             // Ensure pen size is applied for live drawing
    const canvasRect = canvas.getBoundingClientRect();           // Get the bounding rectangle of the canvas to calculate positions

    // Check if it's a touch event or mouse event
    if (e.changedTouches && e.changedTouches.length > 0) {
        // For touch events.
        const touch = e.changedTouches[0];                          // Get the first touch point
        X2 = touch.clientX - canvasRect.left - 10;                   // Calculate X coordinate relative to the canvas
        Y2 = touch.clientY - canvasRect.top + canvas.scrollTop - 10;   // Calculate Y coordinate relative to the canvas
    } else {
        // For mouse events.
        X2 = e.clientX - canvasRect.left - 10;                      // Calculate X coordinate relative to the canvas
        Y2 = e.clientY - canvasRect.top + canvas.scrollTop - 10;      // Calculate Y coordinate relative to the canvas
    }

    let x = X1;                                                 // Initialize x to the starting X coordinate
    let y = Y1;                                                 // Initialize y to the starting Y coordinate
    const step = 5;                                             // Step size for the dotted line
    const deltaX = X2 - X1;                                     // Calculate the difference in X coordinates
    const deltaY = Y2 - Y1;                                     // Calculate the difference in Y coordinates
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);  // Calculate the distance between the start and end points
    const steps = distance / step;                              // Calculate the number of steps based on the distance and step size
    const xIncrement = deltaX / steps;                          // Calculate the increment for X coordinates
    const yIncrement = deltaY / steps;                          // Calculate the increment for Y coordinates
    ctx.beginPath();                                          // Begin a new path for the dotted line
    for (let i = 0; i < steps; i += 2) {                      // Increment by 2 to create dots
        ctx.moveTo(x, y);                                     // Move to the current point
        x += xIncrement;                                     // Increment x by the calculated x increment
        y += yIncrement;                                     // Increment y by the calculated y increment
        ctx.lineTo(x, y);                                    // Draw a line to the next point
        ctx.stroke();                                        // Stroke the path to render the dotted line on the canvas
        x += xIncrement;                                    // Increment x again to skip a point for the dotted effect  
        y += yIncrement;                                    // Increment y again to skip a point for the dotted effect
    }
    ctx.closePath();                                         // Close the path

    // Add the end point to the drawing details
    drawingDetails.points.push({x: X2, y: Y2});
    canvasHistory[canvas.id.slice(-1)].push(drawingDetails);

    // Remove event listeners to stop drawing
    canvas.removeEventListener("touchend", dottedLineEnd);
    canvas.removeEventListener("mouseup", dottedLineEnd);

    drawingDetails = {};                                      // Clear drawing details for the next stroke  
    isDrawing = false;                                      // Reset drawing state
}

// Function to start free drawing.
function freeDrawStart(e) {
    // Check if the target is a canvas and the current drawing state is "Free Draw"
    if (e.target.tagName.toLowerCase() === "canvas" && drawState === "Free Draw"){
        e.stopPropagation();                                                // Prevent the event from bubbling up
        const canvas = e.target;                                           // Get the canvas element from the event target
        isDrawing = true;                                                  // Set the drawing flag to true
        const canvasRect = canvas.getBoundingClientRect();                     // Get the bounding rectangle of the canvas to calculate positions

        // Calculate the initial coordinates for free drawing
        if (e.type === "touchstart"){
            // For touch events.
            const touch = e.touches[0];                                 // Get the first touch point
            X1 = touch.clientX - canvasRect.left - 10;                    // Calculate X coordinate relative to the canvas
            Y1 = touch.clientY - canvasRect.top + canvas.scrollTop - 10;    // Calculate Y coordinate relative to the canvas
        }
        else{
            // For mouse events.
            X1 = e.clientX - canvasRect.left - 10;                     // Calculate X coordinate relative to the canvas
            Y1 = e.clientY - canvasRect.top + canvas.scrollTop - 10;     // Calculate Y coordinate relative to the canvas
        }

        // Initialize the drawingDetails object with the starting point and other details
        drawingDetails = {
            mode: currentMode,
            color: currentColor,
            size: penSize.value,
            type: "Free Draw",
            points: [{x: X1, y: Y1}]
        };

        // Add event listeners for touchmove, touchend, mousemove & mouseup to handle the drawing
        canvas.addEventListener("touchmove", freeDrawCont);
        canvas.addEventListener("mousemove", freeDrawCont);
        canvas.addEventListener("touchend", freeDrawEnd);
        canvas.addEventListener("mouseup", freeDrawEnd);

        e.preventDefault();                           // Prevent the default behavior of the event to avoid scrolling or other actions
    }
}

// Function to continue free drawing.
function freeDrawCont(e){
    movePenEraser(e);                               // Call the movePenEraser function to update the pen/eraser icon position
    if (!isDrawing) return;                         // If not drawing, exit the function

    const canvas = e.target;                       // Get the canvas element from the event target
    const ctx = canvas.getContext('2d');            // Get the 2D context for drawing
    ctx.lineCap = "round";                         // Set the line cap style for the stroke
    ctx.lineWidth = penSize.value;                  // Ensure pen size is applied for live drawing
    const canvasRect = canvas.getBoundingClientRect();       // Get the bounding rectangle of the canvas to calculate positions

    let X2_current, Y2_current; // Use distinct names to avoid confusion with global X2, Y2

    if(e.type === "touchmove"){
        const touch = e.touches[0];
        X2_current = touch.clientX - canvasRect.left - 10;
        Y2_current = touch.clientY - canvasRect.top + canvas.scrollTop - 10;
    }
    else{
        X2_current = e.clientX - canvasRect.left - 10;
        Y2_current = e.clientY - canvasRect.top + canvas.scrollTop - 10;
    }

    // Draw the current segment on the canvas
    // Use the last point in drawingDetails as the starting point
    const lastPoint = drawingDetails.points[drawingDetails.points.length - 1];

    // Apply composite operation for eraser mode during live drawing
    if (currentMode === "eraser") {
        const computedStyle = getComputedStyle(canvas);
        const backgroundColor = computedStyle.backgroundColor;        
        ctx.strokeStyle = backgroundColor;
    } else {
        ctx.strokeStyle = penColour.value;
    }

    ctx.beginPath();
    ctx.moveTo(lastPoint.x, lastPoint.y);
    ctx.lineTo(X2_current, Y2_current); // Use the current coordinates for the line segment
    ctx.stroke(); // Stroke the path to render the line on the canvas
    ctx.closePath(); // Close the path after drawing
    // Add the current point to the drawingDetails object for this stroke.
    drawingDetails.points.push({x: X2_current, y: Y2_current});
}

function freeDrawEnd(e) {
    if (!isDrawing) return; // Only process if drawing was active

    isDrawing = false;
    const canvas = e.target;
    const canvasIdNum = canvas.id.slice(-1); // Get the numeric ID for canvasHistory

    // Push the COMPLETE drawingDetails object to history ONLY ONCE here.
    canvasHistory[canvasIdNum].push(drawingDetails);

    // Clear drawingDetails to prepare for the next stroke
    drawingDetails = {};

    // Remove event listeners
    canvas.removeEventListener("touchmove", freeDrawCont);
    canvas.removeEventListener("mousemove", freeDrawCont);
    canvas.removeEventListener("touchend", freeDrawEnd);
    canvas.removeEventListener("mouseup", freeDrawEnd);
}

// Function to draw circle
async function drawCircle(e){
    if(currentMode === "eraser"){                                  // If currently in eraser mode, switch to pen mode
        currentMode = "pen";
        const penIcon = document.getElementById('penIcon');
        const eraserIcon = document.getElementById('eraserIcon');
        penIcon.classList.add('active');
        eraserIcon.classList.remove('active');
        penIcon.style.opacity = 1;
        eraserIcon.style.opacity = 0;
    }
    const canvasId = e.target.id.replace('Circle', 'Canvas');      // Get the corresponding canvas ID
    const canvas = document.getElementById(canvasId);              // Get the canvas element
    const ctx = canvas.getContext('2d');                           // Get the 2D context for drawing
    currentColor = penColour.value;                                // Set the current color to the selected pen color
    ctx.lineCap = "round";                                         // Set the line cap style for the stroke
    ctx.strokeStyle = currentColor;                                // Set the stroke style to the current color
    ctx.lineWidth = penSize.value;                                 // Ensure pen size is applied for live drawing

    // Prompt user for X coordinate of circle center
    const {value: circleX} = await Swal.fire({
        title: "X-Coordinate Of Circle's Centre →",
        input: "range",
        showDenyButton: true,
        confirmButtonText: "Submit ✔️",
        denyButtonText: "Cancel ❌",
        inputAttributes: {
            min: 0,
            max: canvas.width,
            step: 0.1
        },
        customClass: {
            popup: 'circle-x',
            input: 'my-radius-range-input',
        },
        inputValue: canvas.width / 2, // Default to the center of the canvas
        allowOutsideClick: false
    }).then((result) => {
        if (result.isDenied) {
            return; // If user denies, exit the function
        }
        return result; // Return the result for further processing

    });
    // Prompt user for Y coordinate of circle center
    const {value: circleY} = await Swal.fire({
        title: "Y-Coordinate Of Circle's Centre →",
        input: "range",
        showDenyButton: true,
        confirmButtonText: "Submit ✔️",
        denyButtonText: "Cancel ❌",
        inputAttributes: {
            min: 0,
            max: canvas.height,
            step: 0.1
        },
        customClass: {
            popup: 'circle-y',
            input: 'my-radius-range-input',
        },
        inputValue: canvas.height / 2, // Default to the center of the canvas
        allowOutsideClick: false
    }).then((result) => {
        if (result.isDenied) {
            return; // If user denies, exit the function
        }
        return result; // Return the result for further processing
    });
            
    // Prompt user for radius of the circle
    const {value: radius} = await Swal.fire({
        title: "Radius Of Circle →",
        input: "range",
        showDenyButton: true,
        confirmButtonText: "Submit ✔️",
        denyButtonText: "Cancel ❌",
        inputAttributes: {
            min: 0.1,
            max: canvas.height, // Ensure the radius does not exceed half the height of the canvas
            step: 0.1
        },
        customClass: {
            popup: 'radius',
            input: 'my-radius-range-input',
        },
        inputValue: canvas.height / 2, // Default to a quarter of the canvas height
        allowOutsideClick: false
    }).then((result) => {
        if (result.isDenied) {
            return; // If user denies, exit the function
        }
        return result; // Return the result for further processing
    });
            
    // Prompt user for start angle of the circle
    let {value: startAngle} = await Swal.fire({
        title: "Start Angle →",
        input: "range",
        showDenyButton: true,
        confirmButtonText: "Submit ✔️",
        denyButtonText: "Cancel ❌",
        inputAttributes: {
            min: "0",
            max: "360",
            step: 0.1
        },
        customClass: {
            popup: 'start-angle',
            input: 'my-radius-range-input',
        },
        inputValue: "180",
        allowOutsideClick: false
    }).then((result) => {
        if (result.isDenied) {
            return; // If user denies, exit the function
        }
        return result; // Return the result for further processing
    });
            
    // Prompt user for end angle of the circle
    let {value: endAngle} = await Swal.fire({
        title: "End Angle →",
        input: "range",
        showDenyButton: true,
        confirmButtonText: "Submit ✔️",
        denyButtonText: "Cancel ❌",
        inputAttributes: {
            min: "0",
            max: "360",
            step: 0.1
        },
        customClass: {
            popup: 'end-angle',
            input: 'my-radius-range-input',
        },
        inputValue: "180",
        allowOutsideClick: false
    }).then((result) => {
        if (result.isDenied) {
            return; // If user denies, exit the function
        }
        return result; // Return the result for further processing
    });
            
    startAngle = startAngle * Math.PI/180;                        // Convert start angle to radians
    endAngle = endAngle * Math.PI/180;                            // Convert end angle to radians
    ctx.beginPath();                                              // Begin a new path for the circle
    ctx.arc(circleX, circleY, radius, startAngle, endAngle, true);// Draw the arc (circle)
    drawingDetails = {
        mode: currentMode,
        color: currentColor,
        size: penSize.value,
        type: "Circle",
        points: [{x: circleX, y: circleY, radius: radius, startAngle: startAngle, endAngle: endAngle}] // Store circle details
    };
            
    canvasHistory[canvas.id.slice(-1)].push(drawingDetails);       // Save the circle to canvas history
    drawingDetails = {};                                           // Clear drawing details for the next operation
    ctx.stroke();                                                  // Stroke the circle
    ctx.closePath();                                               // Close the path
}
        
// Function to clear the canvas and its history
function clearCanvas(e) {
    const canvasId = e.target.id.replace('Clear Canvas', 'Canvas');    // Get the canvas ID
    const canvas = document.getElementById(canvasId);                  // Get the canvas element
    const ctx = canvas.getContext('2d');                               // Get the 2D context for drawing

    // Clear the history for this specific canvas
    const canvasNumId = canvasId.replace('Canvas', '');                // Get the numeric ID
    canvasHistory[canvasNumId] = [];                                   // Clear the history array

    ctx.clearRect(0, 0, canvas.width, canvas.height);                  // Clear the canvas

    // If the grid is currently checked, redraw it after clearing
    if (grid.checked) {
        drawGrid(canvas);                                              // Redraw the grid if enabled
    }
    // No need to call redrawCanvas here as history is cleared for this canvas
    // but for other canvases, the grid event listener will handle it.
}

window.addEventListener('resize', () => {
    document.querySelectorAll('canvas').forEach(setCanvasSize);
});
window.addEventListener('orientationchange', () => {
    document.querySelectorAll('canvas').forEach(setCanvasSize);
});

// Update pen color when color picker changes
penColour.addEventListener("input", (e) => {
    if(currentMode === "pen"){
        updateLineColor();                                             // Update the current color
    }    
});

// Update pen size for all canvases when size input changes
penSize.addEventListener("input", (e) => {
    if (e.target.tagName.toLowerCase() === "input") {
        const allCanvases = document.querySelectorAll("#textareaContainer canvas"); // Select all canvases
        for (const canvas of allCanvases) {
            const ctx = canvas.getContext('2d');
            ctx.lineWidth = penSize.value;                             // Update line width
        }
                             // Update the displayed pen size value
    }
});

// Switch to pen mode when pen icon is clicked
pen.addEventListener("click", (e) => {
    penIcon.classList.add('active');
    eraserIcon.classList.remove('active');
    penIcon.style.opacity = 1;
    eraserIcon.style.opacity = 0;
    currentMode = "pen";
});

// Switch to eraser mode when eraser icon is clicked
eraser.addEventListener("click", (e) => {
    drawState = "Free Draw"; // Eraser is typically a free-form tool
    penIcon.classList.remove('active');
    eraserIcon.classList.add('active');
    penIcon.style.opacity = 0;
    eraserIcon.style.opacity = 1;
    currentMode = "eraser"; // Make sure this is set to "eraser"
});
        
// Handle grid checkbox changes for all canvases
grid.addEventListener("change", () => {
    const canvases = document.querySelectorAll('canvas');
    canvases.forEach(canvas => {
        const ctx = canvas.getContext('2d', { willReadFrequently: true });

        // 3. ALWAYS clear the entire canvas before redrawing anything.
        // This removes old grid lines and any existing drawings.

        // 4. Conditionally draw the grid.
        // If the global grid checkbox is checked, draw the grid for this canvas.
        if(grid.checked){
            drawGrid(canvas);                                         // Draw grid if checked
        } else{
            clearGrid(canvas);                                        // Clear grid if unchecked
        }
    });
});
        
// Start timer when start button is clicked
start.addEventListener("click", () => {
    timerStart();
});

// Stop timer when stop button is clicked
stop.addEventListener("click", () => {
    timerStop();
});
        
// Textarea height adjustment for answer fields
function adjustHeight(event){
    const textarea = event.target;
    textarea.style.height = textarea.scrollHeight + 'px';             // Auto-resize textarea
    audio.currentTime = 0;                                            // Reset audio
    audio.play();                                                     // Play key sound
}
        
// Prevent editing of the answer number prefix in answer textarea
function preventEarlyEditing(event) {
    const textarea = event.target;
    focusCount ++;
    if(focusCount === 1){
        initialTextLength = textarea.value.trim().length;
    }    
    replaceText = "Ans." + textarea.id + ") ";    
    textarea.addEventListener("input", () => {
        if(textarea.selectionStart < initialTextLength + textarea.id.length){
            textarea.setSelectionRange(initialTextLength + textarea.id.length, initialTextLength + textarea.id.length);
            textarea.value = replaceText;    
        }    
    });
}
        
// Textarea height adjustment for question fields
function adjustHeightQ(event){
    const textareaQ = event.target;
    textareaQ.style.height = 'auto';
    textareaQ.style.height = textareaQ.scrollHeight + 'px';           // Auto-resize textarea
    audio.currentTime = 0;                                            // Reset audio
    audio.play();                                                     // Play key sound
    localStorage.clear();                                             // Clear local storage
}
        
// Prevent editing of the question number prefix in question textarea
function preventEarlyEditingQ(event) {
    const textareaQ = event.target;
    const textareaQId = -textareaQ.id;
    focusCountQ ++;
    if(focusCountQ === 1){
        initialTextLength = textareaQ.value.trim().length;
    }    
    replaceText = "Ques." + textareaQId + ") ";    
    textareaQ.addEventListener("input", () => {
        if(textareaQ.selectionStart < initialTextLength + textareaQ.id.length - 1){
            textareaQ.setSelectionRange(initialTextLength + textareaQ.id.length, initialTextLength + textareaQ.id.length);
            textareaQ.value = replaceText;    
        }    
    });
}

// Function to draw grid lines and labels on the canvas
function drawGrid(canvas){
    const ctx = canvas.getContext('2d');
    const gridSize = 20;
    const textColor = "#ffffff";
    const lineColor = "#000000";
    ctx.save();
    ctx.strokeStyle = lineColor;
    ctx.lineWidth = 1;
    ctx.font = "10px Arial";
    ctx.fillStyle = textColor;
    for(let x = 0; x < canvas.width; x += gridSize){
        ctx.globalCompositeOperation = "source-over";
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
        if(x > 0){
            ctx.fillText(x, x + 2, 10);
        }
    }
    for (let y = 0; y < canvas.height; y += gridSize) {
        ctx.globalCompositeOperation = "source-over";
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);                
        ctx.stroke();
        if (y > 0) {
            ctx.fillText(y, 2, y + 10);
        }
    }
    ctx.restore();
}
        
// Function to clear the grid and redraw canvas content
function clearGrid(canvas){
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    redrawCanvas(canvas); // Redraw any existing drawing after clearing grid
}
        
// Redraw all drawing operations for a single canvas from its history
function redrawCanvas(canvas) {
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    const canvasIdNum = canvas.id.replace('Canvas', '');
    const history = canvasHistory[canvasIdNum];

    if (!history) {
        return;
    }

    // Iterate through each drawing operation in the history
    history.forEach(operation => {
        ctx.beginPath();
        ctx.lineWidth = operation.size;
        ctx.lineCap = "round";

        // Set composite operation and stroke style based on mode
        if (operation.mode === "pen") {
            ctx.strokeStyle = operation.color;
        } else if (operation.mode === "eraser") {
            const computedStyle = getComputedStyle(canvas);
            const backgroundColor = computedStyle.backgroundColor;        
            ctx.strokeStyle = backgroundColor;
        }

        if (operation.type === "Straight Line" || operation.type === "Free Draw") {
            if (operation.points && operation.points.length > 0) {
                ctx.moveTo(operation.points[0].x, operation.points[0].y);
                for (let i = 1; i < operation.points.length; i++) {
                    ctx.lineTo(operation.points[i].x, operation.points[i].y);
                }
                ctx.stroke();
            }
        } else if (operation.type === "Dotted Line") {
            if (operation.points && operation.points.length > 1) {
                const step = 5;
                const p1 = operation.points[0];
                const p2 = operation.points[1];

                const deltaX = p2.x - p1.x;
                const deltaY = p2.y - p1.y;
                const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
                const stepsCount = distance / step;
                const xIncrement = deltaX / stepsCount;
                const yIncrement = deltaY / stepsCount;

                let currentX = p1.x;
                let currentY = p1.y;

                for (let j = 0; j < stepsCount; j += 2) {
                    ctx.beginPath();
                    ctx.moveTo(currentX, currentY);
                    currentX += xIncrement;
                    currentY += yIncrement;
                    ctx.lineTo(currentX, currentY);
                    ctx.stroke();
                    currentX += xIncrement;
                    currentY += yIncrement;
                }
            }
        } else if(operation.type === "Circle"){
            ctx.arc(operation.points["0"].x, operation.points["0"].y, operation.points["0"].radius, operation.points["0"].startAngle, operation.points["0"].endAngle, true);
            ctx.stroke();
        }
    });
    // It's good practice to reset to default after all operations are done
}
        
let timerIntervalId; // Declare a variable to hold the interval ID

// Start the timer and update every second
function timerStart(){
    // Prevent multiple intervals from running if start is clicked again
    if (timerIntervalId) {
        return;
    }

    timerIntervalId = setInterval(() => {
        seconds++;
        // Format the time as HH:MM:SS
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const remainingSeconds = seconds % 60;

        const formattedTime = [hours, minutes, remainingSeconds]
            .map(unit => String(unit).padStart(2, '0'))
            .join(':');

        timer.textContent = formattedTime; // Update the timer display
    }, 1000); // Update every 1000 milliseconds (1 second)
}

// Stop the timer
function timerStop(){
    if (timerIntervalId) {
        clearInterval(timerIntervalId); // Stop the interval
        timerIntervalId = null; // Reset the ID
    }
}
        
// Save all questions, answers, canvases, and timer to localStorage
save.addEventListener("click", () => {
    grid.checked = false; // Uncheck the grid checkbox before saving
    const canvases = document.querySelectorAll('canvas');
    canvases.forEach(canvas => {
        clearGrid(canvas);
    });
    timerStop(); // Stop the timer before saving
    const Questions = [];
    const Answers = [];
    let savedCanvas;
    const canvasUrl = [];
    var timerValue = timer.textContent;
    for(var j = 1; j <= num; j++){
        Questions[j] = document.getElementById(-j).value;
        Answers[j] = document.getElementById(j).value;   
        savedCanvas = document.getElementById("Canvas" + j);
        canvasUrl[j] = savedCanvas.toDataURL("img/png");
    }
    const QuestionsString = JSON.stringify(Questions);
    const AnswersString = JSON.stringify(Answers);
    const canvasString = JSON.stringify(canvasUrl);
    localStorage.setItem("savedCanvas", canvasString);
    localStorage.setItem("savedQuestions", QuestionsString);
    localStorage.setItem("savedAnswers", AnswersString);
    localStorage.setItem("savedTimer", timerValue);
    Swal.fire({
        title: 'Saved',
        text: 'Questions & Answers saved',
        icon: 'success',
        position: "top-end",
        iconColor: "#006400",
        customClass: {
            popup: 'colored-toast',
        },
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        toast: true,
    })
});
// Retrieve saved data from localStorage and restore it
const getQuestions = localStorage.getItem("savedQuestions");
const getAnswers = localStorage.getItem("savedAnswers");
const getCanvas = localStorage.getItem("savedCanvas");
const getTimer = localStorage.getItem("savedTimer");

const QuestionsArr = JSON.parse(getQuestions);
const AnswersArr = JSON.parse(getAnswers);
const CanvasArr = JSON.parse(getCanvas);

if(QuestionsArr){
    for(var k = 1; k <= num; k++){
        const textareaQ = document.getElementById(-k);
        textareaQ.value = QuestionsArr[k];
    }
}
if(AnswersArr){
    for(var l = 1; l <= num; l++){
        const textarea = document.getElementById(l);
        textarea.value = AnswersArr[l];
    }
}
if(CanvasArr){
    for(var m = 1; m <= num; m++){
        const canvas = document.getElementById("Canvas" + m);
        const ctx =  canvas.getContext("2d");
        const img = new Image();
        img.onload = function () {
            ctx.drawImage(img, 0, 0);
        };
        img.src = CanvasArr[m];
    }
}

if(getTimer){
    timer.textContent = getTimer;
    const timeParts = getTimer.split(':').map(Number); // ['HH', 'MM', 'SS'] -> [H, M, S]
    const savedHours = timeParts[0] || 0;    // Use 0 if parsing fails or part is missing
    const savedMinutes = timeParts[1] || 0;
    const savedSeconds = timeParts[2] || 0;

    seconds = (savedHours * 3600) + (savedMinutes * 60) + savedSeconds;
} 
        
// Clear all questions, answers, and localStorage when clear button is clicked
clear.addEventListener("click", () => {
    Swal.fire({
        title: 'Cleared',
        text: 'Questions & Answers cleared',
        iconHtml: '<img id = "bin" src = "bin.gif">',
        position: "top-end",
        customClass: {
            popup: 'clear-swal2',
        },
        showConfirmButton: false,
        timer: 4000,
        timerProgressBar: true,
        toast: true,
    })
    localStorage.clear();
})