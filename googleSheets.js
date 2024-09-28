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

function sortData(data) {
  return Object.entries(data).sort((a, b) => b[1] - a[1]);
}

let markers = [];

function removeMarkers() {
  for (let i = 0; i < markers.length; i++) {
    markers[i].setMap(null);
  }
}

function displayGoogleMap(data, map) {
  removeMarkers();

  data.forEach((row) => {
    const name = row[0];
    const marker = new google.maps.Marker({
      position: { lat: Number(row[2]), lng: Number(row[3]) },
      map,

      title: `${name} - ${row[1]}`,
    });
    markers.push(marker);
  });
}

function handleFilterMapMarkersByName(data, name, map) {
  // filter data by name
  if (name === 'All') return displayGoogleMap(data, map);
  const filteredData = data.filter((row) => row[0] === name);

  displayGoogleMap(filteredData, map);
}

// create name dropdown
function createNameDropdown(data, map) {
  // remove first element of data array and get unique names
  data.shift();
  const uniqueNames = new Set(data.map((row) => row[0].trim()).sort());
  // sort names alphabetically

  const dropdown = document.getElementById('names');
  dropdown.addEventListener('change', (event) => {
    handleFilterMapMarkersByName(data, event.target.value, map);
  });
  uniqueNames.forEach((name) => {
    const option = document.createElement('option');
    option.value = name;
    option.textContent = name;
    dropdown.appendChild(option);
  });
}

// Function to display data
async function displayData() {
  const map = new google.maps.Map(document.getElementById('map'), {
    center: { lat: 53.537991, lng: -114.677098 },
    zoom: 4,
  });

  const data = await fetchData();
  const container = document.getElementById('overall');
  const nudistContainer = document.getElementById('nudists');
  const drinkerContainer = document.getElementById('drinkers');
  const hikerContainer = document.getElementById('hikers');
  const coldContainer = document.getElementById('cold');
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
  // console.log(data);
  createNameDropdown(data, map);
  renderTable(container, sortData(filteredData));
  renderTable(nudistContainer, sortData(nudists));
  renderTable(drinkerContainer, sortData(drinkers));
  renderTable(hikerContainer, sortData(hikers));
  renderTable(coldContainer, sortData(cold));
  displayGoogleMap(data, map);
}

// Fetch and display data on page load
window.onload = displayData;
