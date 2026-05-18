/**
 * Headlamp Plugin for Kmesh
 *
 * This plugin integrates Kmesh service mesh resources into the Headlamp Kubernetes UI.
 * It provides views for KmeshNodeInfo resources and Istio waypoint gateways, making it
 * easier to monitor and manage Kmesh service mesh deployments.
 *
 * Features:
 * - KmeshNodeInfo CRD visualization (kmesh.net/v1alpha1)
 * - Waypoint gateway filtering and display
 * - Custom sidebar entries for easy navigation
 */

import React from "react";
import {
  registerRoute,
  registerSidebarEntry,
} from "@kinvolk/headlamp-plugin/lib";
import { makeCustomResourceClass } from "@kinvolk/headlamp-plugin/lib/lib/k8s/crd";
import Gateway from "@kinvolk/headlamp-plugin/lib/lib/k8s/gateway";
import type { KubeObjectInterface } from "@kinvolk/headlamp-plugin/lib/lib/k8s/KubeObject";

// Define KmeshNodeInfo CRD interface
interface KubeKmeshNodeInfo extends KubeObjectInterface {
  spec?: any;
  status?: any;
}

// Create KmeshNodeInfo Custom Resource Class
const KmeshNodeInfo = makeCustomResourceClass({
  apiInfo: [{ group: "kmesh.net", version: "v1alpha1" }],
  isNamespaced: true,
  singularName: "kmeshnodeinfo",
  pluralName: "kmeshnodeinfos",
  kind: "KmeshNodeInfo",
});

/**
 * ClusterSummary Component
 *
 * Shows high-level metrics for Kmesh resources in the cluster.
 */
function ClusterSummary() {
  const [nodeInfoList] = KmeshNodeInfo.useList();
  const [gateways] = Gateway.useList();

  const waypoints = React.useMemo(() => {
    return (
      gateways?.filter(
        (gw) => gw.spec?.gatewayClassName === "istio-waypoint"
      ) ?? []
    );
  }, [gateways]);

  return (
    <div style={{ display: "flex", gap: "20px", marginBottom: "30px" }}>
      <div
        style={{
          flex: 1,
          padding: "20px",
          border: "1px solid #ddd",
          borderRadius: "8px",
        }}
      >
        <h3 style={{ margin: "0 0 10px 0", fontSize: "16px" }}>
          KmeshNodeInfo
        </h3>
        <div style={{ fontSize: "32px", fontWeight: "bold" }}>
          {nodeInfoList?.length || 0}
        </div>
        <p style={{ margin: "5px 0 0 0", color: "#666", fontSize: "14px" }}>
          Total Resources
        </p>
      </div>
      <div
        style={{
          flex: 1,
          padding: "20px",
          border: "1px solid #ddd",
          borderRadius: "8px",
        }}
      >
        <h3 style={{ margin: "0 0 10px 0", fontSize: "16px" }}>Waypoints</h3>
        <div style={{ fontSize: "32px", fontWeight: "bold" }}>
          {waypoints.length}
        </div>
        <p style={{ margin: "5px 0 0 0", color: "#666", fontSize: "14px" }}>
          Active Gateways
        </p>
      </div>
    </div>
  );
}

/**
 * KmeshNodeInfoList Component
 *
 * Displays a list of KmeshNodeInfo custom resources in a table format.
 * Shows Name, Namespace, and Age for each resource.
 */
function KmeshNodeInfoList() {
  const [nodeInfoList, error] = KmeshNodeInfo.useList();

  // Error state
  if (error) {
    return (
      <div style={{ padding: "20px" }}>
        <h2>Error loading Kmesh Node Info</h2>
        <p style={{ color: "#d32f2f" }}>
          {error.message ||
            "An error occurred while fetching KmeshNodeInfo resources."}
        </p>
      </div>
    );
  }

  // Loading state
  if (!nodeInfoList) {
    return (
      <div style={{ padding: "20px" }}>
        <h2>Kmesh Node Info</h2>
        <p>Loading KmeshNodeInfo resources...</p>
      </div>
    );
  }

  // Empty state
  if (nodeInfoList.length === 0) {
    return (
      <div style={{ padding: "20px" }}>
        <h2>Kmesh Node Info</h2>
        <p>No KmeshNodeInfo resources found in this cluster.</p>
      </div>
    );
  }

  // Table view
  return (
    <div style={{ padding: "20px" }}>
      <h1>Kmesh Overview</h1>
      <ClusterSummary />
      <h2>Kmesh Node Info</h2>
      <table
        style={{ width: "100%", borderCollapse: "collapse", marginTop: "20px" }}
      >
        <thead>
          <tr style={{ borderBottom: "2px solid #ddd", textAlign: "left" }}>
            <th style={{ padding: "12px 8px", fontWeight: "bold" }}>Name</th>
            <th style={{ padding: "12px 8px", fontWeight: "bold" }}>
              Namespace
            </th>
            <th style={{ padding: "12px 8px", fontWeight: "bold" }}>Age</th>
          </tr>
        </thead>
        <tbody>
          {nodeInfoList.map((item) => (
            <tr
              key={`${item.metadata.namespace}/${item.metadata.name}`}
              style={{ borderBottom: "1px solid #eee" }}
            >
              <td style={{ padding: "12px 8px" }}>{item.metadata.name}</td>
              <td style={{ padding: "12px 8px" }}>
                {item.metadata.namespace || "-"}
              </td>
              <td style={{ padding: "12px 8px" }}>{item.getAge()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/**
 * KmeshWaypointList Component
 *
 * Displays a list of Kubernetes Gateway resources filtered to show only
 * Istio waypoint gateways (gatewayClassName === 'istio-waypoint').
 * Shows Name, Namespace, Status, and Age for each waypoint.
 */
function KmeshWaypointList() {
  const [gateways, error] = Gateway.useList();

  // Filter for waypoint gateways
  const waypoints = React.useMemo(() => {
    return (
      gateways?.filter(
        (gw) => gw.spec?.gatewayClassName === "istio-waypoint"
      ) ?? []
    );
  }, [gateways]);

  // Error state
  if (error) {
    return (
      <div style={{ padding: "20px" }}>
        <h2>Error loading Waypoints</h2>
        <p style={{ color: "#d32f2f" }}>
          {error.message ||
            "An error occurred while fetching Gateway resources."}
        </p>
      </div>
    );
  }

  // Loading state
  if (!gateways) {
    return (
      <div style={{ padding: "20px" }}>
        <h2>Waypoints</h2>
        <p>Loading waypoint gateways...</p>
      </div>
    );
  }

  // Empty state
  if (waypoints.length === 0) {
    return (
      <div style={{ padding: "20px" }}>
        <h2>Waypoints</h2>
        <p>
          No waypoint gateways found in this cluster.
          {gateways.length > 0 &&
            ` (Found ${gateways.length} gateway(s), but none with gatewayClassName 'istio-waypoint')`}
        </p>
      </div>
    );
  }

  /**
   * Helper function to extract status from gateway conditions
   */
  const getStatus = (gateway: (typeof waypoints)[0]): string => {
    const conditions = gateway.status?.conditions;
    if (!conditions || conditions.length === 0) {
      return "Unknown";
    }

    // Find the "Programmed" or "Ready" condition
    const programmedCondition = conditions.find(
      (c) => c.type === "Programmed" || c.type === "Ready"
    );

    if (programmedCondition) {
      return programmedCondition.status === "True"
        ? "Ready"
        : programmedCondition.status || "Unknown";
    }

    // Fallback to first condition status
    return conditions[0].status || "Unknown";
  };

  // Table view
  return (
    <div style={{ padding: "20px" }}>
      <h1>Waypoints</h1>
      <p style={{ marginBottom: "20px", color: "#666" }}>
        Istio waypoint gateways for ambient mesh traffic management
      </p>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ borderBottom: "2px solid #ddd", textAlign: "left" }}>
            <th style={{ padding: "12px 8px", fontWeight: "bold" }}>Name</th>
            <th style={{ padding: "12px 8px", fontWeight: "bold" }}>
              Namespace
            </th>
            <th style={{ padding: "12px 8px", fontWeight: "bold" }}>Status</th>
            <th style={{ padding: "12px 8px", fontWeight: "bold" }}>Age</th>
          </tr>
        </thead>
        <tbody>
          {waypoints.map((waypoint) => (
            <tr
              key={`${waypoint.metadata.namespace}/${waypoint.metadata.name}`}
              style={{ borderBottom: "1px solid #eee" }}
            >
              <td style={{ padding: "12px 8px" }}>{waypoint.metadata.name}</td>
              <td style={{ padding: "12px 8px" }}>
                {waypoint.metadata.namespace || "-"}
              </td>
              <td style={{ padding: "12px 8px" }}>
                <span
                  style={{
                    padding: "4px 8px",
                    borderRadius: "4px",
                    fontSize: "12px",
                    fontWeight: 500,
                    backgroundColor:
                      getStatus(waypoint) === "Ready" ? "#e8f5e9" : "#fff3e0",
                    color:
                      getStatus(waypoint) === "Ready" ? "#2e7d32" : "#e65100",
                  }}
                >
                  {getStatus(waypoint)}
                </span>
              </td>
              <td style={{ padding: "12px 8px" }}>{waypoint.getAge()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// Register sidebar entries under the 'cluster' parent
registerSidebarEntry({
  parent: "cluster",
  name: "kmesh",
  label: "Kmesh Overview",
  url: "/kmesh",
  icon: "mdi:network",
});

registerSidebarEntry({
  parent: "cluster",
  name: "kmesh-waypoints",
  label: "Waypoints",
  url: "/kmesh/waypoints",
  icon: "mdi:map-marker-path",
});

// Register routes
registerRoute({
  path: "/kmesh",
  sidebar: "kmesh",
  name: "Kmesh Overview",
  component: () => <KmeshNodeInfoList />,
});

registerRoute({
  path: "/kmesh/waypoints",
  sidebar: "kmesh-waypoints",
  name: "Waypoints",
  component: () => <KmeshWaypointList />,
});
