/************************************************
 * script.js
 * ----------------------------------------------
 * - Controls step-by-step emotional selection
 * - Displays Step 1 as a pie chart (SVG)
 * - Stores user choices in localStorage
 * - Generates improvement suggestions for negative emotions
 * - Breadcrumb navigation and Restart function
 ************************************************/

/*
  Developer Notice:
  1. Feel free to adjust the core, middle, and outer arrays for each emotion 
     to match your preferred emotion wheel.
  2. The improvementSuggestions object can be expanded or updated based on 
     evidence-based guidelines.
  3. The pie chart in Step 1 is coded using SVG arcs. If you prefer fewer details, 
     you can simplify the code or remove arc labels.
*/

// Emotion wheel data (3 layers for each core emotion)
const emotionWheelData = {
    // Core (innermost)
    core: ["Joy", "Fear", "Anger", "Surprise", "Sadness", "Disgust"],
  
    // Middle layer
    middle: {
      Joy:      ["Happy", "Cheerful"],
      Fear:     ["Anxious", "Insecure"],
      Anger:    ["Frustrated", "Irritated"],
      Surprise: ["Amazed", "Startled"],
      Sadness:  ["Gloomy", "Depressed"],
      Disgust:  ["Disdain", "Loathing"]
    },
  
    // Outer layer
    outer: {
      Happy:     ["Ecstatic", "Elated"],
      Cheerful:  ["Bright", "Upbeat"],
      Anxious:   ["Worried", "Nervous"],
      Insecure:  ["Vulnerable", "Uneasy"],
      Frustrated:["Resentful", "Enraged"],
      Irritated: ["Annoyed", "Agitated"],
      Amazed:    ["Awestruck", "Astounded"],
      Startled:  ["Shocked", "Alarmed"],
      Gloomy:    ["Disheartened", "Melancholy"],
      Depressed: ["Hopeless", "Despairing"],
      Disdain:   ["Scornful", "Contemptuous"],
      Loathing:  ["Repelled", "Sickened"]
    }
  };
  
  // Evidence-based suggestions for negative core emotions
  const improvementSuggestions = {
    negative: {
      Fear:     "Try grounding techniques like mindful breathing or meditation.",
      Anger:    "Consider deep breathing exercises or a brief walk to cool down.",
      Sadness:  "Try journaling or talking with a trusted friend.",
      Disgust:  "Focus on what’s triggering your aversion and reframe the situation; consider professional support if needed."
      // Developer: Add or modify suggestions as you see fit.
    }
  };
  
  // Elements
  const step1 = document.getElementById("step-1");
  const step2 = document.getElementById("step-2");
  const step3 = document.getElementById("step-3");
  const summary = document.getElementById("summary");
  const selectedEmotionEl = document.getElementById("selected-emotion");
  const improvementEl = document.getElementById("improvement-suggestions");
  
  // Step containers
  const coreEmotionsContainer = document.getElementById("core-emotions");
  const middleEmotionsContainer = document.getElementById("middle-emotions");
  const outerEmotionsContainer = document.getElementById("outer-emotions");
  
  // Breadcrumb buttons
  const bcStep1 = document.getElementById("bc-step-1");
  const bcStep2 = document.getElementById("bc-step-2");
  const bcStep3 = document.getElementById("bc-step-3");
  const bcSummary = document.getElementById("bc-summary");
  
  // Restart button
  const restartBtn = document.getElementById("restart-btn");
  
  // Track user selection
  let userSelection = {
    core: null,
    middle: null,
    outer: null
  };
  
  /************************************************
   * PIE CHART (Step 1 Rendering)
   ************************************************/
  
  // Store random pastel colors for each core emotion so it's consistent
  let colorMap = JSON.parse(localStorage.getItem("colorMap")) || {};
  
  // Pie chart config
  const PIE_WIDTH = 300;
  const PIE_HEIGHT = 300;
  const RADIUS = Math.min(PIE_WIDTH, PIE_HEIGHT) / 2;
  
  // Sort core emotions alphabetically and assign random pastel colors if missing
  emotionWheelData.core.sort();
  emotionWheelData.core.forEach(emotion => {
    if (!colorMap[emotion]) {
      colorMap[emotion] = getRandomPastelColor();
    }
  });
  
  // Save updated colorMap
  localStorage.setItem("colorMap", JSON.stringify(colorMap));
  
  function getRandomPastelColor() {
    const hue = Math.floor(Math.random() * 360);
    // 70% saturation, 80% lightness → pastel vibes
    return `hsl(${hue}, 70%, 80%)`;
  }
  
  // Create the SVG for Step 1
  function renderPieChart(emotions, step) {
    coreEmotionsContainer.innerHTML = ""; // Clear existing
  
    // Create an <svg> element
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("width", PIE_WIDTH);
    svg.setAttribute("height", PIE_HEIGHT);
    svg.style.display = "block";
    svg.style.margin = "0 auto"; // center it
  
    coreEmotionsContainer.appendChild(svg);
  
    // Chart center
    const cx = PIE_WIDTH / 2;
    const cy = PIE_HEIGHT / 2;
  
    const totalSlices = emotions.length;
    const sliceAngle = 360 / totalSlices;
    let startAngle = 0;
  
    emotions.forEach(emotion => {
      const endAngle = startAngle + sliceAngle;
  
      // Build the arc path
      let pathData = describeArc(cx, cy, RADIUS, startAngle, endAngle);
  
      let path = document.createElementNS("http://www.w3.org/2000/svg", "path");
      path.setAttribute("d", pathData);
      path.setAttribute("fill", colorMap[emotion]);
      path.setAttribute("stroke", "#fff");
      path.setAttribute("stroke-width", "2");
      path.classList.add("slice-path");
  
      // Simple tooltip with <title>
      let title = document.createElementNS("http://www.w3.org/2000/svg", "title");
      title.textContent = emotion;
      path.appendChild(title);
  
      // Clicking a slice → handleSelection to go to Step 2
      path.addEventListener("click", () => handleSelection(step, emotion));
  
      svg.appendChild(path);
  
      // OPTIONAL: Add text on the arc
      addArcLabel(svg, emotion, (startAngle + endAngle) / 2, cx, cy);
  
      startAngle += sliceAngle;
    });
  }
  
  /**
   * Add text near the arc midpoint
   * This is a simplistic approach. For narrow slices, 
   * text may overlap or be partially hidden.
   */
  function addArcLabel(svg, emotion, angle, cx, cy) {
    // Position the text ~70% radius from center
    const labelRadius = RADIUS * 0.7;
    // Convert degrees to radians, offset by -90 to start at 12 o'clock
    const rad = (angle - 90) * (Math.PI / 180);
    const x = cx + labelRadius * Math.cos(rad);
    const y = cy + labelRadius * Math.sin(rad);
  
    let textEl = document.createElementNS("http://www.w3.org/2000/svg", "text");
    textEl.setAttribute("x", x);
    textEl.setAttribute("y", y);
    textEl.setAttribute("fill", "#333");
    textEl.setAttribute("font-size", "10");
    textEl.setAttribute("text-anchor", "middle");
    textEl.setAttribute("dominant-baseline", "middle");
    textEl.textContent = emotion;
  
    // Simple <title> tooltip if needed
    let title = document.createElementNS("http://www.w3.org/2000/svg", "title");
    title.textContent = emotion;
    textEl.appendChild(title);
  
    svg.appendChild(textEl);
  }
  
  /**
   * describeArc - returns an SVG path string describing an arc.
   * We draw from startAngle to endAngle, then line to center (pie style).
   */
  function describeArc(cx, cy, r, startAngle, endAngle) {
    const start = polarToCartesian(cx, cy, r, endAngle - 90);
    const end = polarToCartesian(cx, cy, r, startAngle - 90);
    const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
  
    return [
      "M", start.x, start.y,
      "A", r, r, 0, largeArcFlag, 0, end.x, end.y,
      "L", cx, cy,
      "Z"
    ].join(" ");
  }
  
  function polarToCartesian(cx, cy, r, angleInDegrees) {
    const angleInRadians = (angleInDegrees * Math.PI) / 180;
    return {
      x: cx + r * Math.cos(angleInRadians),
      y: cy + r * Math.sin(angleInRadians)
    };
  }
  
  /************************************************
   * Rendering & Step Handling
   ************************************************/
  
  // STEP 1 → Pie Chart
  // STEP 2 & 3 → Button-based
  
  // Renders emotion options as buttons (used for Steps 2 & 3)
  function renderOptions(container, options, step) {
    container.innerHTML = ""; // Clear container
  
    options.forEach(option => {
      const btn = document.createElement("button");
      btn.textContent = option;
      btn.classList.add("emotion-btn");
      btn.addEventListener("click", () => handleSelection(step, option));
      container.appendChild(btn);
    });
  }
  
  // Handles user selections at each step
  function handleSelection(step, option) {
    if (step === 1) {
      // The user clicked a slice in the pie chart for Step 1
      userSelection.core = option;
      localStorage.setItem("coreEmotion", option);
      updateBreadcrumb(2);
      toggleVisibility(step1, step2);
      // Step 2 uses button-based rendering
      renderOptions(middleEmotionsContainer, emotionWheelData.middle[option], 2);
  
    } else if (step === 2) {
      userSelection.middle = option;
      localStorage.setItem("middleEmotion", option);
      updateBreadcrumb(3);
      toggleVisibility(step2, step3);
      renderOptions(outerEmotionsContainer, emotionWheelData.outer[option], 3);
  
    } else if (step === 3) {
      userSelection.outer = option;
      localStorage.setItem("outerEmotion", option);
      updateBreadcrumb("summary");
      toggleVisibility(step3, summary);
      displaySummary();
    }
  }
  
  // Display final summary
  function displaySummary() {
    const { core, middle, outer } = userSelection;
    const finalEmotion = outer || middle || core; // fallback if outer is undefined
  
    selectedEmotionEl.textContent = `You identified: ${finalEmotion}`;
  
    // If core emotion is in negative suggestions, display improvement
    if (improvementSuggestions.negative[core]) {
      improvementEl.innerHTML = `
        <p>You indicated a potentially negative emotion: <strong>${core}</strong>.</p>
        <p>Suggestion: ${improvementSuggestions.negative[core]}</p>
      `;
    } else {
      improvementEl.textContent = "Thank you for exploring your emotions!";
    }
  }
  
  /************************************************
   * Breadcrumb & Restart
   ************************************************/
  
  // Update breadcrumb UI
  function updateBreadcrumb(step) {
    // Reset all to disabled
    bcStep1.disabled = true;
    bcStep2.disabled = true;
    bcStep3.disabled = true;
    bcSummary.disabled = true;
  
    if (step === 1) {
      bcStep1.disabled = false;
    } else if (step === 2) {
      bcStep1.disabled = false;
      bcStep2.disabled = false;
    } else if (step === 3) {
      bcStep1.disabled = false;
      bcStep2.disabled = false;
      bcStep3.disabled = false;
    } else if (step === "summary") {
      bcStep1.disabled = false;
      bcStep2.disabled = false;
      bcStep3.disabled = false;
      bcSummary.disabled = false;
    }
  }
  
  // Restart the application
  function restartApp() {
    userSelection = { core: null, middle: null, outer: null };
    localStorage.clear();           // Clears all stored data
    updateBreadcrumb(1);           // Resets breadcrumb to Step 1
    toggleVisibility(summary, step1);
    improvementEl.innerHTML = "";
    selectedEmotionEl.textContent = "";
  
    // Re-draw the pie chart for Step 1
    renderPieChart(emotionWheelData.core, 1);
  }
  
  /************************************************
   * Toggle Visibility
   ************************************************/
  function toggleVisibility(hideSection, showSection) {
    hideSection.classList.add("hidden");
    showSection.classList.remove("hidden");
  }
  
  /************************************************
   * Initialize
   ************************************************/
  function init() {
    // Render the pie chart for Step 1
    renderPieChart(emotionWheelData.core, 1);
    updateBreadcrumb(1);
  
    // Ensure Step 1 is visible, others hidden
    step1.classList.remove("hidden");
    step2.classList.add("hidden");
    step3.classList.add("hidden");
    summary.classList.add("hidden");
  }
  
  // Run init() after DOM loads
  window.addEventListener("DOMContentLoaded", init);
  
  // Listen for Restart button
  restartBtn.addEventListener("click", restartApp);
  