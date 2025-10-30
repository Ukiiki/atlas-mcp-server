# Carlsbad Chamber of Commerce - System Reference Guide

## 🎯 Project Overview

This document serves as a comprehensive reference for understanding the Carlsbad Chamber of Commerce system architecture, real-world data structures, and implementation insights.

## 🔧 CopilotKit Integration - KEY INSIGHTS

### MCP Already Integrated ✅
- **Endpoint**: `http://localhost:3001/mcp`
- **Status**: Online and connected
- **Connection**: Already established, no custom setup needed

### AI Provider Support ✅
CopilotKit natively supports:
- **OpenAI** (Default)
- **Anthropic** (Claude)
- **Google Generative AI**
- **OpenAI Assistant** ⭐ (This is what we should use)
- **Groq**
- **Azure OpenAI**
- **LangChain**

### ❌ What NOT to Do
- **Don't create custom Claude endpoints** - CopilotKit handles this
- **Don't reinvent MCP integration** - Already built-in
- **Don't bypass CopilotKit's AI routing** - Use their configuration

## 🌐 Real Carlsbad Directory Structure

### Live Site Analysis
- **Directory URL**: https://web.carlsbad.org/atlas/directory/all-categories
- **Business Profile Example**: https://web.carlsbad.org/atlas/directory/category/accounting-&-tax-services/ABA-Tax-Planning-5065

### Business Profile Components

#### Public Directory View
```
Business Name: ABA Tax Planning
Member Status: Member since 2024
Contact Person: Amber Langston
Phone: (502) 419-9601
Address: 5154 Whitman Wy., Ste. 202, Carlsbad CA 92008
Website: www.abataxplanning.com
Social Media: Facebook, Instagram, LinkedIn

Products & Services: Bookkeeping, Payroll, Bill Pay, Tax Planning, Tax Preparation, Tax Resolution

Business Logo/Image: Professional photos displayed
Tagline: "A Business's Best Friend"

Contact Form: Integrated messaging system
```

#### Member Portal Features
```
Profile Management:
- Organization name, report name, sort name
- Multiple address fields (mailing vs physical)
- Phone numbers (work, cell, home, fax)
- Email and website management
- Social media links
- Custom fields and preferences

Financial Integration:
- Invoice management
- Payment history
- Billing contacts
- Revenue tracking ($250.00 recurring billing shown)

Relationship Management:
- Primary relationships (contacts linked to business)
- Committee memberships
- Referral tracking
- Sales opportunities

Content Management:
- File and image uploads
- Web content management
- Profile icons and branding
```

#### Admin Dashboard Capabilities
```
Member Analytics:
- Total members: 1076
- New members, investments, dropped members tracking
- Member retention rates (63% shown)
- Billing analytics ($354,482.00 billed, $236,931.00 paid)

Financial Reporting:
- Membership dues aging
- Non-dues aging reports
- Revenue tracking by time periods
- Outstanding balances visualization

Event Management:
- Upcoming events calendar
- Registration tracking
- Attendance analytics

Committee Structure:
- Green Business Committee (shown)
- Member assignment tracking
- Committee activity monitoring
```

## 📊 Atlas API Data Structures

### Business Listings Structure
```json
{
  "ListingID": 422,
  "ProfileID": 8251,
  "CategoryID": 3,
  "SubCategoryID": 0,
  "DisplayName": "", // Often empty - fallback needed
  "Website": "",
  "Email": "",
  "Descr": "",
  "Active": true, // KEY FIELD for status
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

### Member Profile Structure
```json
{
  "ProfileId": 173604,
  "OrgName": "Ukiiki Internet Marketing & Website Design",
  "Address": "2003 S El Camino Real, Ste. 854, Oceanside, CA 92054",
  "WorkPhone": "(760) 472-5393",
  "Email": "concierge@ukiiki.com",
  "WebSite": "ukiiki.com",
  "Member": true,
  "Industry": "Marketing & Website Design",
  "MembershipLevel": "Standard"
}
```

## 🚫 Lessons Learned - Critical Mistakes to Avoid

### 1. API Endpoint Confusion
- **Wrong**: Using `/profiles` for business listings
- **Right**: Using `/Listings` for actual business directory
- **Result**: Fixed active listing count from 5 to 362

### 2. AI Integration Approach
- **Wrong**: Creating custom Claude API endpoints
- **Right**: Configuring CopilotKit's built-in AI providers
- **Why**: CopilotKit already has MCP + multi-AI support

### 3. Data Mapping Assumptions
- **Wrong**: Assuming Atlas fields match our naming
- **Right**: Mapping actual Atlas field names to our schema
- **Key**: Many `DisplayName` fields are empty, need fallbacks

## 🔍 Implementation Priorities

### Phase 1: Fix Current Issues ✅
- [x] Correct listings API endpoint
- [x] Fix active/inactive status logic
- [x] Improve business name fallback handling

### Phase 2: CopilotKit Configuration
- [ ] Configure OpenAI Assistant as primary AI
- [ ] Remove custom Claude endpoint
- [ ] Test MCP integration with existing server

### Phase 3: Data Enhancement
- [ ] Map complete Atlas listing fields
- [ ] Add business images/logos
- [ ] Implement member portal features
- [ ] Add admin dashboard analytics

## 📋 Technical Reference

### Working Atlas Endpoints
```
✅ GET /Listings - Business directory (500 listings)
✅ GET /profiles - Member profiles
✅ GET /Events - Chamber events
✅ GET /Committees - Committee structure
✅ GET /MembershipTypes - Membership levels
✅ GET /MemberStatuses - Status options
```

### CopilotKit Configuration
```javascript
// Use existing MCP server at http://localhost:3001/mcp
// Configure AI provider through CopilotKit settings
// Don't create custom API routes
```

### Field Mapping Strategy
```javascript
// Business Name Priority
const businessName = listing.DisplayName || 
                    listing.Name || 
                    listing.CompanyName ||
                    `Listing ${listing.ListingID}` ||
                    'Unknown Business'

// Status Determination
const status = listing.Active ? 'Active' : 'Inactive'

// Address Building
const address = [
  listing.Address1,
  listing.City,
  listing.State,
  listing.Zip
].filter(Boolean).join(', ')
```

## 🎯 Success Metrics

### Current Status
- ✅ 500 total listings retrieved
- ✅ 362 active listings (vs 5 before fix)
- ✅ Proper active/inactive status display
- ✅ Fallback business names working

### Target Goals
- [ ] Match live directory UI/UX exactly
- [ ] Complete member portal integration
- [ ] Admin dashboard analytics
- [ ] Real-time data synchronization

---

*Last Updated: 2025-07-25*
*Document Purpose: Prevent reinventing existing functionality and ensure accurate implementation*
