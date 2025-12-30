# GPS Tracker Migration Guide: GPS-Trace → Traccar

This guide explains how to migrate GPS devices from GPS-Trace/Ruhavik to your self-hosted Traccar server.

## Table of Contents
- [Prerequisites](#prerequisites)
- [Migration Process Overview](#migration-process-overview)
- [Admin Migration Steps](#admin-migration-steps)
- [GPS Device Reconfiguration](#gps-device-reconfiguration)
- [Protocol Reference](#protocol-reference)
- [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before migrating users, ensure:

1. ✅ **Traccar server is running** and accessible
   - URL: Your Traccar server URL (e.g., `https://gps.yourcompany.com`)
   - Port: Usually 8082 for HTTP, 443 for HTTPS

2. ✅ **Traccar environment variables configured** in backend `.env`:
   ```env
   TRACCAR_API_URL=https://gps.yourcompany.com
   TRACCAR_API_USER=admin
   TRACCAR_API_PASSWORD=your_admin_password
   ```

3. ✅ **Database migrations run**:
   ```bash
   npm run typeorm:cli migration:run
   ```

4. ✅ **Test Traccar connection**:
   ```bash
   # Via API
   GET /admin/migration/test-traccar
   ```

---

## Migration Process Overview

The migration happens in 3 steps:

```
┌─────────────────┐      ┌──────────────────┐      ┌─────────────────┐
│  1. Admin       │ -->  │  2. Backend      │ -->  │  3. GPS Device  │
│  Triggers       │      │  Creates User    │      │  Reconfiguration│
│  Migration      │      │  & Devices       │      │  (Manual/SMS)   │
└─────────────────┘      └──────────────────┘      └─────────────────┘
```

### What Happens During Migration:

1. **Admin triggers migration** via API endpoint
2. **Backend automatically:**
   - Creates Traccar user account
   - Fetches devices from GPS-Trace
   - Creates corresponding devices in Traccar
   - Links devices to new Traccar user
   - Updates user's `gpsProvider` to `TRACCAR`
3. **Admin configures GPS devices** to send data to Traccar

---

## Admin Migration Steps

### Option 1: Migrate Single User

```bash
# Via API
POST /admin/migration/user/:userId

# Response:
{
  "success": true,
  "userId": "uuid-here",
  "traccarUserId": "123",
  "devicesCreated": 3,
  "message": "Successfully migrated to Traccar. Created 3 devices."
}
```

### Option 2: Migrate All Users (Bulk)

```bash
# Via API
POST /admin/migration/all

# Response:
{
  "total": 50,
  "successful": 48,
  "failed": 2,
  "results": [...]
}
```

### Option 3: Check Migration Status

```bash
# Get migration stats
GET /admin/migration/stats

# Response:
{
  "total": 50,
  "onGpsTrace": 10,
  "onTraccar": 40,
  "migrationRate": 80,
  "users": {
    "gpsTrace": ["user1@example.com", ...],
    "traccar": ["user2@example.com", ...]
  }
}

# Get detailed status per user
GET /admin/migration/status
```

### Rollback (if needed)

If migration fails or user wants to go back:

```bash
POST /admin/migration/user/:userId/rollback

# This switches the user back to GPS-Trace provider
# (does not delete Traccar account or devices)
```

---

## GPS Device Reconfiguration

After backend migration is complete, you must reconfigure each GPS device to send data to your Traccar server instead of GPS-Trace.

### Common Configuration Methods:

1. **SMS Commands** (most common)
2. **Mobile App** (device-specific)
3. **Web Platform** (some devices)
4. **Physical USB Configuration**

---

## Protocol Reference

Different GPS trackers use different protocols. Find your device's protocol below.

### 1. GT06 / GT06N Protocol (Most Common)

**Devices:** TK103, TK102, GT06, GT02, Coban, Xexun, and many Chinese GPS trackers

**Traccar Port:** `5023`

**SMS Configuration:**
```
# Set server IP/domain
SERVER,1,YOUR_TRACCAR_IP,5023,0#

# OR with domain
SERVER,1,gps.yourcompany.com,5023,0#

# Set APN (for GPRS)
APN,YOUR_APN#

# Example for T-Mobile:
APN,fast.t-mobile.com#

# Restart device
RESET#
```

**Alternative Commands:**
```
adminip123456 YOUR_IP 5023
apn123456 YOUR_APN
```

---

### 2. H02 Protocol

**Devices:** H02, some Chinese trackers

**Traccar Port:** `5013`

**SMS Configuration:**
```
# Set server
*HQ,YOUR_TRACCAR_IP,5013,0000#

# Set APN
*APN,YOUR_APN#

# Check status
*STATUS#
```

---

### 3. TK103 Protocol

**Devices:** TK103, TK103A, TK103B

**Traccar Port:** `5002`

**SMS Configuration:**
```
# Set server (replace spaces with actual IP)
adminip123456 YOUR_IP 5002

# Set APN
apn123456 YOUR_APN

# Check settings
check123456
```

---

### 4. GPS103 Protocol

**Devices:** GPS103, TK103-2

**Traccar Port:** `5001`

**SMS Configuration:**
```
# Set server
adminip123456 YOUR_IP 5001

# Set APN
apn123456 YOUR_APN
```

---

### 5. Teltonika Protocol

**Devices:** FMB920, FMB122, FMB125, FMB640, etc.

**Traccar Port:** `5027`

**Configuration via Teltonika Configurator:**
1. Connect device via USB or Bluetooth
2. Open Teltonika Configurator software
3. Go to **GPRS Settings**
4. Set:
   - **Domain:** `gps.yourcompany.com`
   - **Port:** `5027`
   - **Protocol:** `TCP`
   - **Codec:** `Codec 8` or `Codec 8 Extended`
5. Save and disconnect

**SMS Configuration (if supported):**
```
setparam 2003:gps.yourcompany.com
setparam 2004:5027
```

---

### 6. Queclink Protocol

**Devices:** GV500, GV300, GL300, GMT100

**Traccar Port:** `5024`

**SMS Configuration:**
```
# Set server
AT+GTBSI=gv300,1,,,,gps.yourcompany.com,5027,,,,0,0,,,FFFF$

# For GL series
AT+GTBSI=gl300,1,,,,gps.yourcompany.com,5027,,,,0,0,,,FFFF$
```

---

### 7. Suntech Protocol

**Devices:** ST300, ST310, ST340, ST600

**Traccar Port:** `5011`

**Configuration via Suntech Tool or SMS:**
```
# Set primary server
SA200STT;1;SERVER_IP;5011

# Example
SA200STT;1;gps.yourcompany.com;5011
```

---

### 8. Concox Protocol (Same as GT06)

**Devices:** Concox GT06N, WeTrack2, JM-VL03

**Traccar Port:** `5023`

**SMS Configuration:**
```
# Set server
SERVER,1,gps.yourcompany.com,5023,0#

# Set APN
APN,YOUR_APN#
```

---

### 9. Meiligao Protocol

**Devices:** VT310, VT300, GT60

**Traccar Port:** `5009`

**SMS Configuration:**
```
# Set server
C01,gps.yourcompany.com,5009

# Set APN
C02,YOUR_APN
```

---

### 10. Galileo Protocol

**Devices:** Galileo Sky, Galileo Hub

**Traccar Port:** `5022`

**Configuration via Galileo Configurator software.**

---

## How to Find Your Device Protocol

### Method 1: Check Device Label/Manual
- Look for brand/model on the device
- Search manual for "protocol" or "communication protocol"

### Method 2: Ask GPS-Trace/Ruhavik
- Some platforms show device protocol in settings
- Check device info in GPS-Trace dashboard

### Method 3: Try Common Protocols
Most Chinese GPS trackers use:
1. **GT06** (Port 5023) - Try this first
2. **H02** (Port 5013) - Second most common
3. **TK103** (Port 5002) - Third option

### Method 4: Check Traccar Protocol List
Full list: https://www.traccar.org/protocols/

---

## Step-by-Step Device Reconfiguration

### Example: Migrating a GT06 Device

#### Step 1: Get Device IMEI
```
IMEI: 868123456789012
```

#### Step 2: Backend Creates Device in Traccar
```bash
# This happens automatically during user migration
# Admin just needs to trigger:
POST /admin/migration/user/:userId
```

Backend will:
- Create device in Traccar with `uniqueId = IMEI`
- Link device to user's Traccar account

#### Step 3: Find Device Protocol
- Device: TK103 GPS Tracker
- Protocol: GT06
- Traccar Port: 5023

#### Step 4: Get Your Traccar Server Info
```
Domain: gps.prologix.com
IP: 157.245.XXX.XXX
Port for GT06: 5023
```

#### Step 5: Send SMS Commands to Device

**Option A: Using Domain (Recommended)**
```
SERVER,1,gps.prologix.com,5023,0#
APN,fast.t-mobile.com#
RESET#
```

**Option B: Using IP Address**
```
SERVER,1,157.245.XXX.XXX,5023,0#
APN,fast.t-mobile.com#
RESET#
```

#### Step 6: Verify Device Connection

1. **Check Traccar Web Interface:**
   - Login to Traccar at `https://gps.prologix.com`
   - Look for device with IMEI `868123456789012`
   - Check if status shows "online" or recent position

2. **Check Traccar Logs:**
   ```bash
   # On Traccar server
   tail -f /opt/traccar/logs/tracker-server.log | grep 868123456789012
   ```

3. **Check Prologix Backend:**
   ```bash
   GET /devices
   # Should show device with recent position from Traccar
   ```

#### Step 7: Test Device
- Move the GPS device outside (to get GPS signal)
- Wait 1-2 minutes
- Refresh Prologix app - should see updated position

---

## APN Configuration

The APN (Access Point Name) allows the GPS device to connect to the mobile network for data.

### Common APNs by Carrier:

**USA:**
- **T-Mobile:** `fast.t-mobile.com`
- **AT&T:** `phone` or `broadband`
- **Verizon:** `vzwinternet`
- **Sprint:** `cinet.spcs`

**Mexico:**
- **Telcel:** `internet.itelcel.com`
- **Movistar:** `internet.movistar.mx`
- **AT&T:** `altan.internet`

**International:**
- **Vodafone:** `internet.vodafone.net`
- **Orange:** `orange.fr` or `orangeworld`
- **O2:** `mobile.o2.co.uk`

### How to Set APN via SMS:

**GT06 Protocol:**
```
APN,YOUR_APN#
```

**TK103 Protocol:**
```
apn123456 YOUR_APN
```

**H02 Protocol:**
```
*APN,YOUR_APN#
```

---

## Troubleshooting

### Device Not Connecting to Traccar

**Problem:** Device configured but not showing in Traccar

**Solutions:**

1. **Check Protocol and Port:**
   ```
   # Make sure you're using the right port for your protocol
   # GT06 = 5023, H02 = 5013, TK103 = 5002, etc.
   ```

2. **Verify SMS Commands Sent Successfully:**
   ```
   # Most devices reply with "OK" after receiving SMS
   # If no reply, check SIM card balance and SMS capability
   ```

3. **Check APN:**
   ```
   # Wrong APN = no internet connection
   # Try sending APN command again
   APN,YOUR_CARRIER_APN#
   ```

4. **Check Firewall:**
   ```
   # Make sure Traccar ports are open on server firewall
   # Common ports: 5001-5027, 8082
   ```

5. **Check Traccar Logs:**
   ```bash
   tail -f /opt/traccar/logs/tracker-server.log
   # Look for connection attempts
   ```

---

### Device Shows "Offline" in Traccar

**Problem:** Device connected once but now shows offline

**Solutions:**

1. **Check Device Power:**
   - Is device turned on?
   - Is battery charged?
   - Is external power connected (if applicable)?

2. **Check SIM Card:**
   - Does SIM card have data balance?
   - Is SIM card activated?
   - Try sending SMS to SIM card number to verify it's active

3. **Check GPS Signal:**
   - Move device outside or near window
   - Some devices won't send data without GPS fix

4. **Reset Device:**
   ```
   # GT06
   RESET#

   # TK103
   reset123456
   ```

---

### Position Not Updating in Prologix App

**Problem:** Device shows in Traccar but not in Prologix app

**Solutions:**

1. **Check Backend Sync:**
   ```bash
   # Sync runs every 1 minute
   # Check backend logs for sync errors
   ```

2. **Verify User Migration:**
   ```bash
   GET /admin/migration/status
   # Make sure user's gpsProvider = TRACCAR
   # Make sure traccarUserId is set
   ```

3. **Check Device Linking:**
   ```bash
   # In Traccar web interface, verify:
   # Device is linked to correct user
   # User ID matches backend traccarUserId
   ```

4. **Manual Sync Trigger (Admin):**
   ```bash
   POST /admin/positions/sync
   # Force immediate sync from Traccar
   ```

---

### Migration Failed

**Problem:** Backend migration returns error

**Solutions:**

1. **Check Traccar Connection:**
   ```bash
   GET /admin/migration/test-traccar
   # Should return success: true
   ```

2. **Check Logs:**
   ```bash
   # Backend logs will show specific error
   # Common issues:
   # - Traccar credentials wrong
   # - Traccar server unreachable
   # - Duplicate email in Traccar
   ```

3. **Rollback and Retry:**
   ```bash
   # Rollback user
   POST /admin/migration/user/:userId/rollback

   # Fix issue, then retry
   POST /admin/migration/user/:userId
   ```

---

## Testing Checklist

After migrating a user, verify:

- [ ] User's `gpsProvider` = `TRACCAR` in database
- [ ] User's `traccarUserId` is set
- [ ] Traccar user account exists (check Traccar web interface)
- [ ] Devices created in Traccar
- [ ] Devices linked to Traccar user
- [ ] GPS device configured with SMS commands
- [ ] Device appears "online" in Traccar
- [ ] Position updates in Traccar (check map)
- [ ] Position syncs to Prologix backend (check `/positions/latest`)
- [ ] Position appears in Prologix mobile app

---

## Best Practices

1. **Migrate in Batches:**
   - Start with 1-2 test users
   - Verify everything works
   - Then migrate 10-20 at a time
   - Leave 1-2 weeks between large batches

2. **Communicate with Users:**
   - Notify users before migration
   - Provide migration date/time
   - Send SMS with new server details
   - Offer support during transition

3. **Keep GPS-Trace Access:**
   - Don't delete GPS-Trace accounts immediately
   - Keep rollback option available for 30 days
   - Helpful if device configuration issues arise

4. **Document Each Device:**
   ```
   Device IMEI: 868123456789012
   User: user@example.com
   Protocol: GT06
   Migrated: 2025-01-15
   Status: ✅ Connected
   ```

5. **Monitor Sync Service:**
   - Check `/admin/positions/sync-stats` daily
   - Ensure positions are being synced
   - Watch for sync errors

---

## Migration Timeline Example

**Week 1: Preparation**
- ✅ Setup Traccar server
- ✅ Run database migrations
- ✅ Test with 2-3 internal devices

**Week 2: Pilot**
- ✅ Migrate 5 friendly users
- ✅ Gather feedback
- ✅ Refine process

**Week 3-4: Phase 1**
- ✅ Migrate 25% of users
- ✅ Monitor closely
- ✅ Fix any issues

**Week 5-6: Phase 2**
- ✅ Migrate 50% of remaining users
- ✅ Continue monitoring

**Week 7-8: Final Phase**
- ✅ Migrate remaining users
- ✅ Verify all devices working

**Week 9-10: Cleanup**
- ✅ Cancel GPS-Trace subscription
- ✅ Archive old data
- ✅ Celebrate 90%+ cost savings! 🎉

---

## Support

For migration issues:
1. Check this guide's troubleshooting section
2. Review Traccar documentation: https://www.traccar.org/documentation/
3. Check device-specific protocol docs
4. Contact Prologix support team

---

## Cost Savings Calculation

**Before (GPS-Trace):**
- 100 devices × $5/month = $500/month = $6,000/year

**After (Traccar Self-Hosted):**
- DigitalOcean Droplet: $20/month = $240/year
- **Annual Savings: $5,760 (96% reduction!)**

Plus benefits:
- Unlimited historical data storage
- Full control and customization
- Better performance (< 2s latency)
- Advanced features (geofences, reports, alerts)
- No per-device fees ever

---

## Appendix: Protocol Ports Reference

Quick reference for Traccar protocol ports:

| Protocol | Port | Common Devices |
|----------|------|----------------|
| GPS103 | 5001 | GPS103, TK103-2 |
| TK103 | 5002 | TK103, TK103A/B |
| GL100 | 5003 | Queclink GL100/200 |
| GL200 | 5004 | Queclink GL200 |
| T55 | 5005 | Generic T55 protocol |
| Xexun | 5006 | Xexun TK102/103 |
| Totem | 5007 | Totem trackers |
| Enfora | 5008 | Enfora devices |
| Meiligao | 5009 | VT300, VT310, GT60 |
| Trv | 5010 | TRV devices |
| Suntech | 5011 | ST300/310/340/600 |
| Progress | 5012 | Progress trackers |
| H02 | 5013 | H02, many Chinese |
| Jt600 | 5014 | JT600 devices |
| Huabao | 5015 | Huabao trackers |
| V680 | 5016 | V680 devices |
| PT502 | 5017 | PT502 trackers |
| TR20 | 5018 | TR20 devices |
| Navis | 5019 | Navis trackers |
| Meitrack | 5020 | Meitrack devices |
| Skypatrol | 5021 | Skypatrol trackers |
| Galileo | 5022 | Galileo Sky/Hub |
| GT06 | 5023 | **Most Common!** |
| Queclink | 5024 | GV500/300, GL300 |
| CityEasy | 5025 | CityEasy devices |
| ATrack | 5026 | ATrack trackers |
| Teltonika | 5027 | FMB920/122/125/640 |

**Most common protocols:**
- **GT06 (5023)** - ~70% of Chinese GPS trackers
- **H02 (5013)** - ~15% of Chinese GPS trackers
- **Teltonika (5027)** - Professional trackers
- **Queclink (5024)** - Asset trackers

---

**Document Version:** 1.0
**Last Updated:** 2025-12-29
**Author:** Prologix GPS Team
