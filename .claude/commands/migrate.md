# Migrate Command

Migrate data from Atlas MemberClicks to local database (Supabase).

## Steps:

1. **Setup Supabase** - Ensure Supabase project is configured
2. **Design Schema** - Create tables for members, committees, events, listings
3. **Extract Data** - Pull all data from Atlas API using MCP tools
4. **Transform Data** - Clean and normalize data for new schema
5. **Load Data** - Insert data into Supabase
6. **Verify** - Check data integrity and completeness
7. **Create Backup** - Export data as JSON for rollback capability

This is a critical operation that requires approval at each step.

Before starting, create an approval request with full migration plan details.
