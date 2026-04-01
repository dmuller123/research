// Function to fetch publications from ORCID using a CORS proxy
async function fetchORCIDPublications() {
  try {
    // Use a CORS proxy to avoid CORS issues
    const proxyUrl = 'https://cors-anywhere.herokuapp.com/';
    const orcidUrl = 'https://pub.orcid.org/v3.0/0000-0001-8184-1474/works';

    const response = await fetch(proxyUrl + orcidUrl, {
      headers: {
        'Accept': 'application/json',
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    // Extract relevant publication data
    const publications = data.group.map(group => {
      const work = group['work-summary'][0];
      const title = work.title ? work.title.title.value : "No title";
      const authors = work['contributors'] ? work['contributors'].contributor.map(c => c['credit-name'] ? c['credit-name'].value : "Unknown author") : ["Unknown author"];
      const journal = work['journal-title'] ? work['journal-title'].value : "Unknown journal";
      const year = work['publication-date'] ? work['publication-date'].year.value : "Unknown year";
      const doiObj = work['external-ids'] ? work['external-ids']['external-id'].find(id => id['external-id-type'] === 'doi') : null;
      const doi = doiObj ? doiObj['external-id-value'] : null;

      return {
        title,
        authors,
        journal,
        year,
        doi,
      };
    });

    // Generate HTML for publications
    generatePublicationHTML(publications);
  } catch (error) {
    console.error("Error fetching ORCID data:", error);
    // Fallback: Display a message if the fetch fails
    $('#publications').html('<p>Could not load publications. Please try again later.</p>');
  }
}

// Function to generate HTML for publications
function generatePublicationHTML(publications) {
  let html = '';
  publications.forEach(pub => {
    const imagePath = pub.doi ? `graphical_abstract/${pub.doi}.jpg` : null;
    html += `
      <div class="publication">
        ${imagePath ? `<div class="pub-image"><img src="${imagePath}" alt="Graphical Abstract for ${pub.title}" onerror="this.style.display='none'"></div>` : ''}
        <div class="pub-details">
          <h3>${pub.title}</h3>
          <p><strong>Authors:</strong> ${pub.authors.join(', ')}</p>
          <p><strong>Journal:</strong> ${pub.journal}</p>
          <p><strong>Year:</strong> ${pub.year}</p>
          ${pub.doi ? `<p><strong>DOI:</strong> <a href="https://doi.org/${pub.doi}" target="_blank">${pub.doi}</a></p>` : ''}
        </div>
      </div>
    `;
  });
  $('#publications').html(html);
}

// Fetch and display publications when the page loads
$(document).ready(function() {
  fetchORCIDPublications();
});

