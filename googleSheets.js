const API_KEY = 'AIzaSyAJgXqtZgIPQ8r9pwFHAJrBxw0NNrztmhw';

const SPREADSHEET_ID = '1tcSxnIrAz6tnGWijpZ35WQaOtFICSiVnFsOnugcX_wo';
// Range of cells to fetch
const RANGE = 'Sheet1!A:J';

// Function to fetch data from Google Sheets
async function fetchData() {
  const response = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${RANGE}?key=${API_KEY}`
  );
  const data = await response.json();
  return data.values;
}

function renderTable(node, data) {
  data.forEach(([key, value]) => {
    const rowDiv = document.createElement('tr');
    // create td for name and sum within rowDiv
    rowDiv.innerHTML = `<td>${key}</td><td>${value}</td>`;
    node.appendChild(rowDiv);
  });
}

// Function to display data
async function displayData() {
  const data = await fetchData();
  const container = document.getElementById('overall');
  const nudistContainer = document.getElementById('nudists');
  const drinkerContainer = document.getElementById('drinkers');
  const hikerContainer = document.getElementById('hikers');
  const coldContainer = document.getElementById('cold');
  container.innerHTML = '';
  const filteredData = {};
  const nudists = {};
  const drinkers = {};
  const hikers = {};
  const cold = {};

  data.forEach((row, index) => {
    if (index === 0) return; // Skip the first row
    const sum = row.slice(4).reduce((acc, val) => acc + Number(val), 0); // Sum the numeric values in the row
    filteredData[row[0].trim()] = (filteredData[row[0].trim()] || 0) + sum;
    nudists[row[0].trim()] = (nudists[row[0].trim()] || 0) + Number(row[6]);
    drinkers[row[0].trim()] = (drinkers[row[0].trim()] || 0) + Number(row[7]);
    hikers[row[0].trim()] = (hikers[row[0].trim()] || 0) + Number(row[8]);
    cold[row[0].trim()] = (cold[row[0].trim()] || 0) + Number(row[9]);
  });

  // sort the data by the sum of the numeric values
  const sortedData = Object.entries(filteredData).sort((a, b) => b[1] - a[1]);
  const sortedNudists = Object.entries(nudists).sort((a, b) => b[1] - a[1]);
  const sortedDrinkers = Object.entries(drinkers).sort((a, b) => b[1] - a[1]);
  const sortedHikers = Object.entries(hikers).sort((a, b) => b[1] - a[1]);
  const sortedCold = Object.entries(cold).sort((a, b) => b[1] - a[1]);
  console.log(nudists, sortedNudists);

  renderTable(container, sortedData);
  renderTable(nudistContainer, sortedNudists);
  renderTable(drinkerContainer, sortedDrinkers);
  renderTable(hikerContainer, sortedHikers);
  renderTable(coldContainer, sortedCold);

  /*  sortedData.forEach(([key, value]) => {
    const rowDiv = document.createElement('tr');
    // create td for name and sum within rowDiv
    rowDiv.innerHTML = `<td>${key}</td><td>${value}</td>`;
    container.appendChild(rowDiv);
  }); */

  // create a google map with coordinates from each data row
  const map = new google.maps.Map(document.getElementById('map'), {
    zoom: 2,
    center: { lat: 0, lng: 0 },
  });
}

// Fetch and display data on page load
window.onload = displayData;
