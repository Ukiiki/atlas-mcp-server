# Atlas MemberClicks API - Complete Documentation

## 🔗 API Base Information

### Authentication
- **Auth URL**: `https://www.weblinkauth.com/connect/token`
- **API Base URL**: `https://api-v1.weblinkconnect.com/api-v1`
- **Method**: OAuth2 Client Credentials
- **Scope**: `PublicWebApi`

### Authentication Request
```http
POST https://www.weblinkauth.com/connect/token
Content-Type: application/x-www-form-urlencoded

grant_type=client_credentials
scope=PublicWebApi
client_id=CarlsbadChamber
client_secret={YOUR_SECRET}
response_type=token
acr_values=tenant:carlsbad
```

### Request Headers
```http
Authorization: Bearer {access_token}
x-tenant: carlsbad
Content-Type: application/json
```

## 📊 Core Resources Overview

Atlas provides **33+ real working endpoints** across these categories:

### ✅ **Confirmed Working Resources**
1. **Profile Management** - Member profiles, custom fields, activity tracking
2. **Event Management** - Events, registration system, attendee management
3. **Financial Management** - Invoices, payments, billing
4. **Committee Management** - Committees, memberships
5. **Business Directory** - Listings, categories, types
6. **Contact Management** - Contact information
7. **Image Management** - Image uploads and management

---

## 👥 Profile Management

### Core Profile Operations

#### Get All Profiles
```http
GET /profiles?RestrictToMember=true&PageSize=100
```
**Description**: Retrieve member profiles with optional filtering
**Parameters**:
- `RestrictToMember` (boolean): Filter to members only
- `PageSize` (int): Number of results per page
- `PageNumber` (int): Page number for pagination

#### Get Profile by ID
```http
GET /profiles/{profileId}
```
**Description**: Get specific profile details

#### Create Profile
```http
POST /profiles
Content-Type: application/json

{
  "FirstName": "John",
  "LastName": "Doe", 
  "Email": "john.doe@example.com",
  "WorkPhone": "555-123-4567",
  "OrgName": "Example Company"
}
```

#### Update Profile
```http
PUT /profiles/{profileId}
Content-Type: application/json

{
  "FirstName": "Jane",
  "LastName": "Doe",
  "Email": "jane.doe@example.com"
}
```

### Profile Custom Fields ⭐ **NEW FUNCTIONALITY**

#### Get Profile Custom Fields
```http
GET /Profile/{profileId}/CustomFields
```
**Description**: Get all custom fields for a specific profile

#### Create Profile Custom Field
```http
POST /Profile/{profileId}/CustomFields
Content-Type: application/json

{
  "FieldName": "Department",
  "FieldValue": "Marketing", 
  "FieldType": "Text"
}
```

#### Update Profile Custom Field
```http
PUT /Profile/{profileId}/CustomFields/{customFieldId}
Content-Type: application/json

{
  "FieldValue": "Sales"
}
```

#### Create Custom Field Definition
```http
POST /Profile/CustomField
Content-Type: application/json

{
  "FieldName": "Department",
  "FieldType": "Text",
  "IsRequired": false
}
```

### Member Activity Tracking ⭐ **NEW FUNCTIONALITY**

#### Get Profile Member Activity
```http
GET /Profile/{profileId}/MemberActivity
```
**Description**: Get member activity history for a profile

#### Create Member Activity
```http
POST /MemberActivity
Content-Type: application/json

{
  "ProfileId": "{profileId}",
  "ActivityType": "Committee Participation",
  "Description": "Joined Marketing Committee",
  "ActivityDate": "2024-01-15T00:00:00Z"
}
```

#### Update Member Activity
```http
PUT /MemberActivity
Content-Type: application/json

{
  "ActivityId": "{activityId}",
  "Description": "Updated Committee Participation"
}
```

---

## 🎪 Event Management

### Basic Event Operations

#### Get All Events
```http
GET /Events?PageSize=100
```

#### Get Events (Enhanced v4)
```http
GET /Events-v4?PageSize=100
```
**Description**: Enhanced event data with additional fields

### Event Registration System ⭐ **NEW FUNCTIONALITY**

#### Create Event Registration
```http
POST /Event/Registrations
Content-Type: application/json

{
  "EventId": "{eventId}",
  "ProfileId": "{profileId}",
  "AttendeeCount": 1
}
```

#### Get Event Registrations
```http
GET /Event/{eventId}/Registrations
```
**Description**: Get all registrations for an event

#### Get Event Registration by ID
```http
GET /Event/Registration/{registrationId}
```

#### Update Event Registration
```http
PUT /Event/Registration/{registrationId}
Content-Type: application/json

{
  "AttendeeCount": 2,
  "Status": "Confirmed"
}
```

#### Get Event Registration Revenue Details
```http
GET /Event/Registration/{registrationId}/RevenueDetails
```
**Description**: Get financial details for a registration

#### Get Event Attendees
```http
GET /Event/{eventId}/Attendees
```

#### Get Event Registrations as CSV
```http
GET /Event/{eventId}/Registrations/csv
```

#### Mark Attendance
```http
POST /EventAttendees/FlagEventItemsAsAttendedOrNotAttended
Content-Type: application/json

{
  "EventItemIds": ["{eventItemId}"],
  "AttendeeHeaderIds": ["{attendeeHeaderId}"],
  "IsAttended": true
}
```

---

## 💰 Financial Management

### Invoice Management ⭐ **NEW FUNCTIONALITY**

#### Create Invoice
```http
POST /Invoices
Content-Type: application/json

{
  "ProfileId": "{profileId}",
  "Amount": 100.00,
  "DueDate": "2024-02-15T00:00:00Z",
  "Description": "Membership Dues"
}
```

#### Get Invoice
```http
GET /Invoice/{invoiceId}
```

#### Search Invoices
```http
GET /Invoices?ProfileId={profileId}&Status=Pending
```

#### Update Invoice
```http
PUT /Invoice/{invoiceId}
Content-Type: application/json

{
  "Amount": 120.00,
  "Status": "Sent"
}
```

#### Create Invoice Line Item
```http
POST /InvoiceLineItems
Content-Type: application/json

{
  "InvoiceId": "{invoiceId}",
  "Description": "Event Registration Fee",
  "Amount": 50.00,
  "Quantity": 1
}
```

### Payment Management ⭐ **NEW FUNCTIONALITY**

#### Create Payment
```http
POST /Payments
Content-Type: application/json

{
  "InvoiceNum": "{invoiceId}",
  "Amount": 100.00,
  "PaymentDate": "2024-01-15T00:00:00Z",
  "PaymentType": "Credit Card"
}
```

#### Get Payment
```http
GET /Payment/{paymentId}
```

#### Search Payments
```http
GET /Payments?InvoiceNum={invoiceId}
```

#### Get Invoice Payments
```http
GET /Payments/{invoiceId}
```

#### Get Active Payment Types
```http
GET /PaymentTypes/ActivePaymentTypes
```

---

## 👥 Committee Management

#### Get All Committees
```http
GET /Committees?PageSize=20
```

#### Get Committee by ID
```http
GET /Committee/{committeeId}
```

#### Get All Committee Members
```http
GET /CommitteeMembers
```

#### Get Committee Members by Committee
```http
GET /CommitteeMembers?CommitteeId={committeeId}
```

---

## 🏢 Business Directory

### Business Listings

#### Get Business Listings
```http
GET /Listings?Active=true&PageSize=200&OrderBy=DateChanged&OrderByExpression=DESC&ObjectState=0
```
**Parameters**:
- `Active` (boolean): Filter by active status
- `PageSize` (int): Results per page
- `OrderBy` (string): Sort field
- `OrderByExpression` (string): ASC/DESC
- `ObjectState` (int): Object state filter

**Response Structure**:
```json
{
  "ListingID": 422,
  "ProfileID": 8251,
  "CategoryID": 3,
  "SubCategoryID": 0,
  "DisplayName": "",
  "Website": "",
  "Email": "",
  "Descr": "",
  "Active": true,
  "WebListing": true,
  "PrintListing": true,
  "PrimaryListing": true,
  "Address1": "",
  "Address2": "",
  "City": "",
  "State": "",
  "Zip": "",
  "Phone": "",
  "Phone2": "",
  "Fax": "",
  "BusinessLogo": "",
  "CategorySubCategory": "Accommodations",
  "ProductsAndServices": "",
  "ShortDescr": "",
  "Longitude": "-117.3301082",
  "Latitude": "33.1333778"
}
```

#### Get Listing Categories
```http
GET /ListingCategories?PageSize=200&OrderBy=Category&PageNumber=1
```

#### Get Listing Types
```http
GET /ListingTypes?PageSize=200
```

---

## 📞 Contact Management

#### Get Contacts
```http
GET /Contacts?PageSize=200
```

---

## 🖼️ Image Management ⭐ **NEW FUNCTIONALITY**

#### Search Images
```http
GET /Images
```

---

## 📝 Data Structures & Field Mappings

### Profile Structure
```json
{
  "ProfileId": 173604,
  "FirstName": "John",
  "LastName": "Doe", 
  "OrgName": "Company Name",
  "Email": "email@example.com",
  "WorkPhone": "(760) 472-5393",
  "CellPhone": "",
  "HomePhone": "",
  "Fax": "",
  "Address": "123 Main St",
  "MailingAddress": "",
  "City": "Carlsbad",
  "State": "CA",
  "Zip": "92008",
  "WebSite": "example.com",
  "Member": true,
  "Industry": "Technology",
  "MembershipLevel": "Gold",
  "Notes": "",
  "Bio": ""
}
```

### Event Structure
```json
{
  "EventId": 12345,
  "EventName": "Chamber Mixer",
  "EventDate": "2024-02-15T18:00:00Z",
  "Location": "Community Center",
  "Description": "Monthly networking event",
  "RegistrationRequired": true,
  "MaxAttendees": 100,
  "Cost": 25.00
}
```

### Invoice Structure
```json
{
  "InvoiceId": 98765,
  "ProfileId": 173604,
  "InvoiceNumber": "INV-2024-001",
  "Amount": 250.00,
  "DueDate": "2024-02-01T00:00:00Z",
  "Status": "Pending",
  "Description": "Annual Membership Dues",
  "LineItems": []
}
```

---

## 🔍 Best Practices

### Authentication Management
- Cache access tokens (expire in 1 hour)
- Refresh 5 minutes before expiration
- Handle 401 errors gracefully

### Error Handling
- **401**: Authentication required/expired
- **403**: Insufficient permissions
- **404**: Resource not found
- **429**: Rate limit exceeded
- **500**: Server error

### Pagination
- Default page size: 20
- Maximum page size: 200
- Use `PageNumber` and `PageSize` parameters

### Field Mapping Strategy
```javascript
// Handle empty DisplayName fields
const businessName = listing.DisplayName || 
                    listing.Name || 
                    listing.CompanyName ||
                    `Listing ${listing.ListingID}` ||
                    'Unknown Business'

// Build addresses from components
const address = [
  listing.Address1,
  listing.City, 
  listing.State,
  listing.Zip
].filter(Boolean).join(', ')
```

---

## 🎯 Implementation Priorities

### Phase 1: Core Data ✅
- [x] Profiles (/profiles)
- [x] Business Listings (/Listings) 
- [x] Events (/Events)
- [x] Committees (/Committees)

### Phase 2: Enhanced Features 🔄
- [ ] Event Registration System
- [ ] Invoice & Payment Management
- [ ] Profile Custom Fields
- [ ] Member Activity Tracking

### Phase 3: Advanced Features 🔮
- [ ] Image Management
- [ ] Advanced Reporting
- [ ] Bulk Operations
- [ ] Webhook Integration

---

## 💡 Key Insights

### What's Actually Available
- **33+ real working endpoints** (not 5 as originally thought)
- **Complete event registration system**
- **Full invoicing and payment processing**
- **Custom fields and member activity tracking**
- **Image management capabilities**

### Critical Fields to Map
- `Active` field in Listings (key for status)
- `DisplayName` often empty (use fallbacks)
- `CategorySubCategory` for business categorization
- `PrimaryListing` indicates featured status

### Common Patterns
- All endpoints support pagination
- Most support filtering via query parameters
- Standard OAuth2 Bearer token authentication
- Consistent response format with Result arrays

---

*Last Updated: 2025-07-25*
*Source: Atlas Complete API Collection + Real Endpoints Discovery*
