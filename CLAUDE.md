# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Self-Hosted Management System (SHMS) for managing Ubiquiti EdgeRouter configuration, specifically VPN routing, QoS traffic shaping, DHCP, and port forwarding through a web interface.

## Monorepo Structure

This is a monorepo with two independent components:

- **app/** - SvelteKit web application (frontend + API server)
- **pf-router/** - TypeScript CLI tools for direct router SSH management

Each has its own `package.json`, `node_modules`, `prisma/` schema, and `.env` file.

## Development Commands

### App (SvelteKit Web UI)
```bash
cd app
npm run dev              # Start dev server (http://localhost:5173)
npm run build            # Build for production
npm run preview          # Preview production build
npm run check            # Type-check without building
npm run check:watch      # Type-check in watch mode
```

### PF-Router (CLI Tools)
```bash
cd pf-router
npm run deploy-vpn-config              # Deploy VPN tunnel configuration
npm run deploy-port-forwarding-config  # Configure port forwarding
npm run deploy-dhcp-config             # Deploy DHCP settings
npm run vpn-domains                    # Manage VPN routing domains
npm run scan                           # DNS lookup for domain IPs
npm run update-ip-group                # Sync IP address-groups to router
npm run update-vpn-rules               # Create firewall rules for VPN routing
npm run qos                            # Traffic control/QoS management
```

### Database Migrations
```bash
# App database
cd app
npx prisma migrate dev
npx prisma generate

# PF-Router database
cd pf-router
npx prisma migrate dev
npx prisma generate
```

### Deployment
```bash
./publish.sh    # Build and push Docker image to local registry
./deploy.sh     # SSH to server and deploy container
cd pf-router && ./scripts/deploy_files.sh  # Deploy scripts to router
```

## Architecture

### Two-Component Design

**App Component:**
- SvelteKit SSR application using adapter-node
- Exposes web UI and REST API (port 3000, mapped to 3003 in production)
- Does NOT directly SSH into router
- Spawns pf-router CLI commands as child processes via `adapter.ts`
- Parses structured JSON responses from pf-router scripts
- PostgreSQL database (separate from pf-router) stores QoS entries

**PF-Router Component:**
- TypeScript CLI tools using ts-node
- Direct SSH communication with EdgeRouter using simple-ssh
- PostgreSQL database (separate from app) stores domain-to-IP mappings
- Can run standalone without app server

### Communication Pattern

```
Web UI → API Route → adapter.ts → spawn pf-router CLI → SSH to Router → Vyatta CLI
```

Response flow uses structured JSON format:
```
###JSON_RESPONSE_START###{"key":"value"}###JSON_RESPONSE_END###
```

Parsed by `parseJsonResponse()` in `app/src/lib/server/adapter.ts`

### SSH Command Execution

All router modifications use `pf-router/src/common/run.ts`:
- Connects via SSH using credentials from `pf-router/.env` (UBNT_IP, UBNT_USER, UBNT_PASS)
- Executes commands as `sudo bash -c "command"`
- Uses Vyatta CLI wrapper: `/opt/vyatta/sbin/vyatta-cfg-cmd-wrapper`
- **Critical:** Resets SSH connection after each command (`ssh.reset()`) to prevent leaks
- All config changes use transactional pattern: `begin → commands → commit → save → end`

### VPN Domain Routing Workflow

Most complex feature - routes specific domains through VPN tunnels:

1. **Add Domain:** User adds domain via web UI → saved to pf-router database
2. **Scan:** DNS lookup all domains (`npm run scan`), store IP addresses
3. **Update IP Groups:** Sync IPs to router's firewall address-groups (`npm run update-ip-group`)
4. **Update VPN Rules:** Create firewall rules routing those address-groups through VPN load balancer (`npm run update-vpn-rules`)

**Key Files:**
- `pf-router/src/vpn/vpn_domains.ts` - Domain CRUD operations
- `pf-router/src/vpn/scan.ts` - DNS lookup and IP tracking
- `pf-router/src/vpn/update_ip_group.ts` - Sync address-groups to router
- `pf-router/src/vpn/update_vpn_rules.ts` - Create firewall rules
- `pf-router/src/vpn/deploy_vpn_config.ts` - Initial VPN tunnel setup

### VPN Load Balancing

System manages 6 OpenVPN tunnels (vtun0-vtun5):
- Load-balance group distributes traffic across all tunnels
- Sticky connection tracking (same source → same tunnel)
- Auto-reconnect via scheduled task running `connect-vpn.sh` every minute
- Script deployed to router at `/config/scripts/remote/connect-vpn.sh`

### QoS Traffic Shaping

Per-IP bandwidth limiting using EdgeRouter's advanced-queue system:
- Each IP gets two queues: upload and download
- Queue numbering: IP index 0 → queues 1,2; index 1 → queues 3,4, etc.
- App database stores IP, upSpeed, downSpeed, name
- Uses FQ-CODEL algorithm for traffic control
- Config parsing in `app/src/lib/server/helpers.ts` uses `g2-bracket-parser` for Vyatta's bracket syntax

**Key Files:**
- `pf-router/src/qos/index.ts` - QoS deployment logic
- `app/src/routes/qos/+page.server.ts` - QoS UI backend
- `app/src/lib/server/helpers.ts` - Vyatta config parser

### Database Strategy

**Two Separate PostgreSQL Databases:**

1. **App Database** (`app/prisma/schema.prisma`):
   - `QosEntries` - Stores IP, name, upSpeed, downSpeed for traffic shaping

2. **PF-Router Database** (`pf-router/prisma/schema.prisma`):
   - `IpRecord` - Stores IP addresses discovered via DNS
   - `DomainName` - Stores domain names for VPN routing
   - Many-to-many relationship between IpRecord ↔ DomainName

**Rationale:** Separation of concerns - pf-router can run CLI operations independently

### Router Script Deployment

Scripts deployed to `/config/scripts/` on router (persistent across reboots):
- `remote/connect-vpn.sh` - Auto-reconnect VPN tunnels
- `remote/drop-vpn.sh` - Drop VPN connections
- `remote/add_group.sh` - Add IPs to address-groups
- `remote/set_rules.sh` - Create firewall rules

Deploy using: `cd pf-router && ./scripts/deploy_files.sh`

## Important Implementation Details

### Type Safety
- Both components use TypeScript with strict mode
- App uses SvelteKit's generated types (`.svelte-kit/tsconfig.json`)
- PF-Router uses ts-node with transpileOnly for faster execution
- Always define explicit types; avoid `unknown` when type can be inferred

### Config Parsing
- Router config read via SSH commands
- Output sanitized (remove spaces/newlines) before regex parsing
- `g2-bracket-parser` library converts Vyatta bracket syntax to JavaScript objects
- Example: `app/src/lib/server/helpers.ts` - `parseConfig()`

### Error Handling
- PF-router scripts throw on SSH failures
- App's adapter catches errors and returns structured responses to UI
- Always check `code` from SSH command results

### IP Validation
- Uses `ipaddr.js` for IP address processing
- Filters out IPv6 addresses (only IPv4 supported)
- Domain validation via `is-valid-domain` library

### File Paths
- App reads pf-router's `.env` to pass SSH credentials to spawned processes
- `PF_ROUTER_PATH` in `app/.env` locates sibling pf-router directory
- Router scripts deployed to `/config/scripts/` on EdgeRouter
- OpenVPN configs stored in `/config/auth/` on EdgeRouter

## Environment Setup

Three `.env` files required:

**Root `.env`** (deployment config):
```
DOCKER_REPOSITORY_IP=192.168.55.100
DOCKER_REPOSITORY_PORT=5000
DEPLOY_SERVER_IP=192.168.55.100
DEPLOY_SERVER_USER=root
DEPLOY_SERVER_SSH_KEY_PATH=./artifacts/srv
```

**app/.env**:
```
DATABASE_URL=postgresql://...
PF_ROUTER_PATH=../pf-router
```

**pf-router/.env**:
```
DATABASE_URL=postgresql://...
UBNT_IP=192.168.1.1
UBNT_USER=ubnt
UBNT_PASS=password
```

## Testing and Debugging

- No automated test suite currently
- Manual testing via web UI
- SSH directly to router to verify config: `show configuration`
- Check router logs: `show log` on EdgeRouter
- App logs via console.log (visible in Docker container logs)
- PF-router script output visible when run via npm scripts

## Code Style

- Use TypeScript strict mode
- Define explicit return types for functions
- Use async/await for SSH operations
- Avoid `console.log` in production code (prefer structured logging)
- Follow SvelteKit conventions for route files (`+page.svelte`, `+page.server.ts`)
- Use Prisma for all database operations (never raw SQL)

## Common Gotchas

1. **SSH Connection Leaks:** Always call `ssh.reset()` after command execution in `run.ts`
2. **Vyatta CLI Transactions:** Config changes require `begin` before modifications, `commit` + `save` after
3. **Two Databases:** App and pf-router have separate PostgreSQL databases - don't confuse them
4. **Router Reboots:** Scripts in `/config/scripts/` persist, but running processes don't
5. **Scheduled Tasks:** Router runs `connect-vpn.sh` every minute via task-scheduler
6. **Address-Group Naming:** Groups named after domains (e.g., "netflix.com") - must be valid identifiers
7. **Queue Numbering:** QoS queue pairs start at 1,2 (not 0,1) - off-by-one errors possible
