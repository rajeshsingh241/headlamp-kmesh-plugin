# Headlamp Plugin for Kmesh

A [Headlamp](https://headlamp.dev) plugin that surfaces [Kmesh](https://kmesh.net) 
resources directly in the Headlamp UI, eliminating the need to switch between 
Headlamp and kubectl for Kmesh-specific inspection.

## Features

- List view for KmeshNodeInfo resources (kmesh.net/v1alpha1)
- Sidebar integration under Cluster section
- Dedicated /kmesh route
- Loading and error states

## Development

npm install
npm run build

## Plugin Architecture

### Views Implemented

1. **Kmesh Overview** (`/kmesh`)
   - Cluster summary panel with resource counts
   - KmeshNodeInfo list table (Name, Namespace, Age)
   - Loading and error states

2. **Waypoints** (`/kmesh/waypoints`)
   - Filters Kubernetes Gateways by `gatewayClassName == 'istio-waypoint'`
   - Status indicators with color-coded badges (Ready/Unknown)
   - Table view with Name, Namespace, Status, Age

### Sidebar Integration

- Registers under "Cluster" section
- Two entries: "Kmesh Overview" and "Waypoints"
- Icons: `mdi:network` and `mdi:map-marker-path`

### Technical Highlights

- Uses `makeCustomResourceClass` for KmeshNodeInfo CRD (kmesh.net/v1alpha1)
- Filters standard Gateway resources for waypoint detection
- Memoized filtering for performance
- Proper TypeScript typing throughout
- Follows Headlamp plugin conventions

## Status

Work in progress — built as part of LFX Mentorship 2026 Term 2 application 
for CNCF - Kmesh: Integrating Kmesh into Headlamp UI.

Plugin builds successfully and is ready for integration testing with a live Kmesh cluster.