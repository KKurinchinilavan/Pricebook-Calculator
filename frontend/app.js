let currentCountryRecord = null;

window.addEventListener("DOMContentLoaded", () => {
  const countrySelect = document.getElementById("countrySelect");
  const regionTextbox = document.getElementById("regionTextbox");

  // Load countries into dropdown
  async function loadCountries() {
    try {
      const response = await fetch("http://localhost:5000/countries");
      if (!response.ok) throw new Error("Failed to fetch countries");

      const countries = await response.json();

      // Reset dropdown with placeholder
      countrySelect.innerHTML = '<option value="" disabled selected>-- Select Country --</option>';

      // Populate dropdown
      countries.forEach(country => {
        const option = document.createElement("option");
        option.value = country;
        option.textContent = country;
        countrySelect.appendChild(option);
      });

    } catch (err) {
      console.error("Error loading countries:", err);
    }
  }

  // Fetch country data on select
  countrySelect.addEventListener("change", async function () {
    const selectedCountry = this.value;

    try {
      const response = await fetch(`http://localhost:5000/country/${encodeURIComponent(selectedCountry)}`);
      if (!response.ok) throw new Error("Failed to fetch country data");

      const countryData = await response.json();
      currentCountryRecord = countryData[0]; 

      
      regionTextbox.value = currentCountryRecord.Region;

    } catch (err) {
      console.error("Error fetching country data:", err);
    }
  });

  loadCountries();

  
  const calculateBtn = document.getElementById("calculateBtn");
  if (calculateBtn) {
    calculateBtn.addEventListener("click", yearCostCalculation);
  }
});

// Yearly cost calculation
function yearCostCalculation() {
  if (!currentCountryRecord) {
    console.warn("No country selected yet.");
    return 0;
  }

  const levelSelect = document.querySelector(".yearly-box select");
  const backfillRadios = document.querySelectorAll('input[name="yearlyOption1"]');
  const yearsInput = document.querySelector(".yearly-box .inputs");

  const selectedLevel = levelSelect.value;
  let withBackfill = null;
  backfillRadios.forEach(radio => {
    if (radio.checked) {
      withBackfill = radio.value === "yes";
    }
  });

  const numberOfYears = parseInt(yearsInput.value, 10) || 0;

  if (!selectedLevel || withBackfill === null || numberOfYears <= 0) {
    console.warn("Please select level, backfill option, and enter a valid number of years.");
    return 0;
  }

  // Dynamically get the key from user selections
  const backfillText = withBackfill ? "With_Backfill" : "Without_Backfill";
  const key = `${selectedLevel}_${backfillText}_Yearly_Rate`;

  let priceString = currentCountryRecord[key];
  if (!priceString) {
    console.warn("Price not found for the selected options.");
    return 0;
  }

  // Convertion
  const priceNumber = parseFloat(priceString.replace(/[$,]/g, ""));
  const totalCost = priceNumber * numberOfYears;

  console.log("Total yearly cost:", totalCost);

  
  const resultBox = document.getElementById("totalCost");
  if (resultBox) resultBox.value = totalCost;

  return totalCost;
}

function dailyCostCalculation() {
  if (!currentCountryRecord) {
    console.warn("No country selected yet.");
    return 0;
  }

  // Get selects and input fields
  const fulldaySelect = document.getElementById("fulldaySelect");
  const halfdaySelect = document.getElementById("halfdaySelect");
  const fulldayInput = document.getElementById("numberOfFulldays");
  const halfdayInput = document.getElementById("numberOfHalfdays");

  const selectedFullLevel = fulldaySelect.value;
  const selectedHalfLevel = halfdaySelect.value;

  const numberOfFulldays = parseInt(fulldayInput.value, 10) || 0;
  const numberOfHalfdays = parseInt(halfdayInput.value, 10) || 0;

  let totalCost = 0;

  // Fullday calculation
  if (selectedFullLevel && numberOfFulldays > 0) {
    const fullKey = `${selectedFullLevel}_Fullday_Visit_Daily_Rates`;
    const fullPrice = parseFloat((currentCountryRecord[fullKey] || "0").replace(/[$,]/g, ""));
    totalCost += fullPrice * numberOfFulldays;
  }

  // Halfday calculation
  if (selectedHalfLevel && numberOfHalfdays > 0) {
    const halfKey = `${selectedHalfLevel}_Halfday_Visit_Daily_Rates`;
    const halfPrice = parseFloat((currentCountryRecord[halfKey] || "0").replace(/[$,]/g, ""));
    totalCost += halfPrice * numberOfHalfdays;
  }

  console.log("Total daily cost:", totalCost);

  
  const resultBox = document.getElementById("dailyTotalCost");
  if (resultBox) resultBox.value = totalCost;

  return totalCost;
}

function dispatchCostCalculation() {
    if (!currentCountryRecord) return 0;

    const incidentSelect = document.getElementById("incidentSelect");
    const imacSelect = document.getElementById("imacSelect");
    const incidentHoursInput = document.getElementById("incidentDispatchHours");
    const additionalHoursInput = document.getElementById("AdditionalHoursForIncident");

    const incidentHours = parseFloat(incidentHoursInput.value) || 0;
    const additionalHours = parseFloat(additionalHoursInput.value) || 0;

    let totalCost = 0;

    // INCIDENT COST
    if (incidentSelect.selectedIndex > 0) {
        const incidentText = incidentSelect.options[incidentSelect.selectedIndex].text;
        const incidentKey = `Incident_${incidentText.replace(/ /g, "_")}`;
        const incidentRate = parseFloat((currentCountryRecord[incidentKey] || "0").replace(/[$,]/g, ""));
        totalCost += incidentRate * incidentHours;

        // Additional hours cost
        const additionalRate = parseFloat((currentCountryRecord["Incident_Additional Hour_Rate"] || "0").replace(/[$,]/g, ""));
        totalCost += additionalHours * additionalRate;
    }

    // IMAC COST (fixed rate, independent)
    if (imacSelect.selectedIndex > 0) {
        const imacText = imacSelect.options[imacSelect.selectedIndex].text;
        const imacKey = `IMAC_${imacText.replace(/ /g, "_")}_SM_Fee`;
        const imacRate = parseFloat((currentCountryRecord[imacKey] || "0").replace(/[$,]/g, ""));
        totalCost += imacRate;
    }

    // Display result
    const resultBox = document.getElementById("dispatchTotalCost");
    if (resultBox) resultBox.value = totalCost;

    console.log("Total dispatch cost:", totalCost);
    return totalCost;
}




function projectCostCalculation() {
  if (!currentCountryRecord) {
    console.warn("No country selected yet.");
    return 0;
  }

  // Get selects and inputs
  const shortTermSelect = document.getElementById("shortTermSelect");
  const longTermSelect = document.getElementById("longTermSelect");
  const shortTermMonthsInput = document.getElementById("shortTermMonths");
  const longTermMonthsInput = document.getElementById("longTermMonths");

  const selectedShortTerm = shortTermSelect.value;
  const selectedLongTerm = longTermSelect.value;

  const shortTermMonths = parseInt(shortTermMonthsInput.value, 10) || 0;
  const longTermMonths = parseInt(longTermMonthsInput.value, 10) || 0;

  let totalCost = 0;

  // Short Term Project cost
  if (selectedShortTerm && shortTermMonths > 0) {
    const shortTermKey = `ST_Project_${selectedShortTerm}_Monthly`;
    const shortTermRate = parseFloat((currentCountryRecord[shortTermKey] || "0").replace(/[$,]/g, ""));
    totalCost += shortTermRate * shortTermMonths;
  }

  // Long Term Project cost
  if (selectedLongTerm && longTermMonths > 0) {
    const longTermKey = `LT_Project_${selectedLongTerm}_Monthly`;
    const longTermRate = parseFloat((currentCountryRecord[longTermKey] || "0").replace(/[$,]/g, ""));
    totalCost += longTermRate * longTermMonths;
  }

  console.log("Total project cost:", totalCost);

  
  const resultBox = document.getElementById("projectTotalCost");
  if (resultBox) resultBox.value = totalCost;

  return totalCost;
}

function resetForm() {
    document.getElementById("myForm").reset();
}

function calculateAndRedirect() {
    // Run all calculations
    const yearlyCost = yearCostCalculation();
    const dailyCost = dailyCostCalculation();
    const dispatchCost = dispatchCostCalculation();
    const projectCost = projectCostCalculation();

    // Save to sessionStorage
    sessionStorage.setItem("yearlyCost", yearlyCost);
    sessionStorage.setItem("dailyCost", dailyCost);
    sessionStorage.setItem("dispatchCost", dispatchCost);
    sessionStorage.setItem("projectCost", projectCost);

    // Redirect to summary page
    window.location.href = "tariff.html";
}



window.yearCostCalculation = yearCostCalculation;
