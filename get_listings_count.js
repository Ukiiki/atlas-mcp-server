import fetch from 'node-fetch';

const AUTH_URL = 'https://www.weblinkauth.com/connect/token';
const API_BASE_URL = 'https://api-v1.weblinkconnect.com/api-v1';
const CLIENT_ID = 'CarlsbadChamber';
const CLIENT_SECRET = '1bd58eb5-f765-4fee-a139-312c9d4dead2';
const TENANT = 'carlsbad';

async function getAccessToken() {
  const params = new URLSearchParams({
    grant_type: 'client_credentials',
    scope: 'PublicWebApi',
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
    response_type: 'token',
    acr_values: `tenant:${TENANT}`
  });

  const response = await fetch(AUTH_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params,
  });

  if (!response.ok) {
    throw new Error(`Authentication failed: ${response.statusText}`);
  }

  const data = await response.json();
  return data.access_token;
}

async function getListings() {
  try {
    console.log('🔐 Getting access token...');
    const token = await getAccessToken();
    console.log('✅ Got access token');

    console.log('📊 Fetching all listings from Atlas API with pagination...');
    
    let allListings = [];
    let pageNumber = 1;
    const pageSize = 500;
    let hasMore = true;
    
    while (hasMore) {
      console.log(`📄 Fetching page ${pageNumber}...`);
      const response = await fetch(`${API_BASE_URL}/Listings?PageSize=${pageSize}&PageNumber=${pageNumber}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'x-tenant': TENANT,
        },
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      const listings = data.Result || data || [];
      
      console.log(`  ✓ Retrieved ${listings.length} listings from page ${pageNumber}`);
      
      allListings = allListings.concat(listings);
      
      // Check if we got a full page - if not, we're done
      hasMore = listings.length === pageSize;
      pageNumber++;
    }
    
    console.log(`\n✅ Fetching complete! Total pages: ${pageNumber - 1}`);
    
    console.log('\n📈 ATLAS LISTINGS ANALYSIS:');
    console.log('═══════════════════════════');
    console.log(`Total listings: ${allListings.length}`);
    
    const activeListings = allListings.filter(listing => listing.Active === true);
    const inactiveListings = allListings.filter(listing => listing.Active === false);
    
    console.log(`Active listings: ${activeListings.length}`);
    console.log(`Inactive listings: ${inactiveListings.length}`);
    
    console.log('\n📋 Sample listing fields:');
    if (allListings.length > 0) {
      const sample = allListings[0];
      console.log('Available fields:', Object.keys(sample).join(', '));
      
      console.log('\n📌 Sample active listing:');
      const activeSample = activeListings[0];
      if (activeSample) {
        console.log(`- ID: ${activeSample.ListingID}`);
        console.log(`- ProfileID: ${activeSample.ProfileID}`);
        console.log(`- DisplayName: "${activeSample.DisplayName}"`);
        console.log(`- Category: ${activeSample.CategorySubCategory}`);
        console.log(`- Active: ${activeSample.Active}`);
        console.log(`- Address: ${activeSample.Address1}, ${activeSample.City}`);
        console.log(`- Phone: ${activeSample.Phone}`);
        console.log(`- Website: ${activeSample.Website}`);
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

getListings();
