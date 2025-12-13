# Admin Scripts Documentation

## 📁 Folder Structure

```
scripts/
├── seeds/                      # Database seeding scripts
│   ├── seed-hotels.js         # Seeds 20 famous hotels
│   └── seed-trips.js          # Seeds 20 real-life trips
├── services/                   # Background services
│   └── trip-sync-service.js   # Real-time trip synchronization
├── admin-cli.js               # Admin command-line interface
├── create-admin.js            # Creates admin user
└── README.md                  # This file
```

## 🚀 Quick Start

### 1. Create Admin User

```bash
node scripts/create-admin.js
```

This creates an admin account with:
- **Email:** admin@travelhub.com
- **Password:** admin123

Then promote to admin role:
```bash
docker exec -it mongodb mongosh authdb --eval "db.users.updateOne({email: 'admin@travelhub.com'}, {\$set: {role: 'admin'}})"
```

### 2. Seed Database

```bash
# Seed hotels
node scripts/seeds/seed-hotels.js

# Seed trips
node scripts/seeds/seed-trips.js
```

### 3. Start Real-Time Sync Service

```bash
node scripts/services/trip-sync-service.js
```

This service runs in the background and updates trip prices/availability every 30 seconds.

### 4. Launch Admin CLI

```bash
node scripts/admin-cli.js
```

Login with your admin credentials to access the CLI.

## 🔐 Admin CLI Commands

### User Management
```bash
users                      # List all users with details
promote <userId>           # Promote user to admin role
demote <userId>            # Demote admin to regular user
deleteuser <userId>        # Permanently delete a user
resetpass <userId> <pwd>   # Reset user password
```

### Hotel Management
```bash
hotels                     # List all hotels
deletehotel <hotelId>      # Delete a hotel
```

### Trip Management
```bash
trips                      # List all trips
deletetrip <tripId>        # Delete a trip
```

### System Commands
```bash
stats                      # Show system statistics
help                       # Show all commands
exit / quit                # Exit CLI
```

## 🔒 Security Features

### Authentication
- JWT-based admin authentication
- Role-based access control (RBAC)
- Passwords hashed with bcrypt
- Admin middleware validates every request

### Protection Mechanisms
1. **Self-Protection:** Admins cannot demote or delete themselves
2. **Database-Only:** CLI restricted to database operations only
3. **Input Validation:** All commands are validated and sanitized
4. **Audit Trail:** Operations are logged for accountability
5. **Token Expiry:** JWT tokens expire after 7 days

### Password Security
- Passwords always hashed with bcrypt (10 rounds)
- Never exposed in API responses
- Admin can reset passwords securely
- Password changes require admin authentication

## 📊 Admin API Endpoints

All endpoints require `Authorization: Bearer <token>` header with admin role.

### GET /api/admin/users
List all users (passwords excluded)

### GET /api/admin/users/:id
Get specific user details

### PATCH /api/admin/users/:id/role
Update user role
```json
{ "role": "admin" | "user" }
```

### PATCH /api/admin/users/:id/credentials
Update user credentials
```json
{
  "email": "new@email.com",
  "password": "newpassword",
  "name": "New Name"
}
```

### DELETE /api/admin/users/:id
Delete user (cannot delete self)

### GET /api/admin/stats
Get system statistics

## 💡 Usage Examples

### Example 1: Create and Promote User

```bash
# 1. Create admin account
node scripts/create-admin.js

# 2. Promote to admin role
docker exec -it mongodb mongosh authdb --eval "db.users.updateOne({email: 'admin@travelhub.com'}, {\$set: {role: 'admin'}})"

# 3. Login to CLI
node scripts/admin-cli.js
# Email: admin@travelhub.com
# Password: admin123
```

### Example 2: Manage Users

```bash
admin> users                              # See all users
admin> promote 507f1f77bcf86cd799439011  # Promote user to admin
admin> resetpass 507f1f77bcf86cd799439011 newPassword123
admin> demote 507f1f77bcf86cd799439011   # Back to regular user
```

### Example 3: Monitor System

```bash
admin> stats    # View system statistics
admin> hotels   # Check hotel inventory
admin> trips    # Check trip availability
```

## ⚠️ Important Notes

1. **Never commit credentials** - Change default passwords immediately
2. **Backup before deletion** - User/hotel/trip deletions are permanent
3. **Admin CLI is powerful** - Only authorized personnel should have access
4. **Monitor logs** - Check docker logs for suspicious activity
5. **Keep tokens secure** - JWT tokens grant full admin access

## 🛡️ Security Best Practices

1. **Change Default Password**
   ```bash
   admin> resetpass <yourUserId> <strongPassword>
   ```

2. **Limit Admin Accounts**
   - Only promote trusted users
   - Regular users should not have admin access

3. **Regular Audits**
   ```bash
   admin> users    # Review user list regularly
   admin> stats    # Monitor system growth
   ```

4. **Secure Environment**
   - Run CLI only on secure machines
   - Never share admin credentials
   - Use strong, unique passwords

## 🐛 Troubleshooting

### "Authentication failed"
- Ensure user has admin role
- Check JWT_SECRET is correct in .env
- Verify auth-service is running

### "Cannot connect to services"
- Ensure all Docker containers are running
- Check API Gateway is accessible on port 8080
- Verify network connectivity

### "Command not found"
- Type `help` to see all available commands
- Check command syntax in this README
- Ensure you're in the correct directory

## 📝 Logs

Check service logs:
```bash
docker logs auth-service
docker logs api-gateway
docker logs hotel-service
docker logs trip-service
```

## 🆘 Support

For issues or questions:
1. Check this README
2. Review service logs
3. Verify all services are running
4. Check network connectivity
