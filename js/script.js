/************************************************
 * script.js
 * ----------------------------------------------
 * - Controls step-by-step emotional selection
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
   * Rendering & Step Handling
   ************************************************/
  
  // Renders emotion options as buttons
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
      userSelection.core = option;
      localStorage.setItem("coreEmotion", option);
      updateBreadcrumb(2);
      toggleVisibility(step1, step2);
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
    localStorage.clear();
    updateBreadcrumb(1);
    toggleVisibility(summary, step1);
    improvementEl.innerHTML = "";
    selectedEmotionEl.textContent = "";
  }
  
  // Toggle visibility between sections
  function toggleVisibility(hideSection, showSection) {
    hideSection.classList.add("hidden");
    showSection.classList.remove("hidden");
  }
  
  // Initialize the first step
  function init() {
    renderOptions(coreEmotionsContainer, emotionWheelData.core, 1);
    updateBreadcrumb(1);
  }
  
  window.addEventListener("DOMContentLoaded", init);
  restartBtn.addEventListener("click", restartApp);
  