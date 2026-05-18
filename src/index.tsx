import React from "react";
import {
  registerRoute,
  registerSidebarEntry,
} from "@kinvolk/headlamp-plugin/lib";
import { makeCustomResourceClass } from "@kinvolk/headlamp-plugin/lib/lib/k8s/crd";
import Gateway from "@kinvolk/headlamp-plugin/lib/lib/k8s/gateway";

const KmeshNodeInfo = makeCustomResourceClass({
  apiInfo: [{ group: "kmesh.net", version: "v1alpha1" }],
  isNamespaced: true,
  singularName: "kmeshnodeinfo",
  pluralName: "kmeshnodeinfos",
  kind: "KmeshNodeInfo",
});

function ClusterSummary() {
  const [nodeInfoList] = KmeshNodeInfo.useList();
  const [gateways] = Gateway.useList();

  const waypoints = React.useMemo(
    () =>
      gateways?.filter(
        (gw) => gw.spec?.gatewayClassName === "istio-waypoint"
      ) ?? [],
    [gateways]
  );

  const cardStyle = {
    flex: 1,
    padding: "20px",
    border: "1px solid #ddd",
    borderRadius: "8px",
  };

  return (
    <div style={{ display: "flex", gap: "20px", marginBottom: "30px" }}>
      <div style={cardStyle}>
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
      <div style={cardStyle}>
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

function KmeshNodeInfoList() {
  const [nodeInfoList, error] = KmeshNodeInfo.useList();

  if (error) {
    return (
      <div style={{ padding: "20px" }}>
        <h2>Error loading Kmesh Node Info</h2>
        <p style={{ color: "#d32f2f" }}>{error.message}</p>
      </div>
    );
  }

  if (!nodeInfoList) {
    return (
      <div style={{ padding: "20px" }}>
        <p>Loading...</p>
      </div>
    );
  }

  if (nodeInfoList.length === 0) {
    return (
      <div style={{ padding: "20px" }}>
        <h2>Kmesh Node Info</h2>
        <p>No KmeshNodeInfo resources found in this cluster.</p>
      </div>
    );
  }

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
            <th style={{ padding: "12px 8px" }}>Name</th>
            <th style={{ padding: "12px 8px" }}>Namespace</th>
            <th style={{ padding: "12px 8px" }}>Age</th>
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

// waypoint status comes from Gateway conditions — "Programmed" is the k8s-standard one,
// but older Istio versions use "Ready", so we check both
function getWaypointStatus(
  gateway: ReturnType<typeof Gateway.useList>[0][number]
): string {
  const conditions = gateway.status?.conditions;
  if (!conditions?.length) return "Unknown";

  const match = conditions.find(
    (c) => c.type === "Programmed" || c.type === "Ready"
  );
  if (match)
    return match.status === "True" ? "Ready" : match.status ?? "Unknown";

  return conditions[0].status ?? "Unknown";
}

function KmeshWaypointList() {
  const [gateways, error] = Gateway.useList();

  const waypoints = React.useMemo(
    () =>
      gateways?.filter(
        (gw) => gw.spec?.gatewayClassName === "istio-waypoint"
      ) ?? [],
    [gateways]
  );

  if (error) {
    return (
      <div style={{ padding: "20px" }}>
        <h2>Error loading Waypoints</h2>
        <p style={{ color: "#d32f2f" }}>{error.message}</p>
      </div>
    );
  }

  if (!gateways) {
    return (
      <div style={{ padding: "20px" }}>
        <p>Loading...</p>
      </div>
    );
  }

  if (waypoints.length === 0) {
    return (
      <div style={{ padding: "20px" }}>
        <h2>Waypoints</h2>
        <p>
          No istio-waypoint gateways found.
          {gateways.length > 0 &&
            ` (${gateways.length} other gateway(s) exist in this cluster)`}
        </p>
      </div>
    );
  }

  return (
    <div style={{ padding: "20px" }}>
      <h1>Waypoints</h1>
      <p style={{ marginBottom: "20px", color: "#666" }}>
        Istio waypoint gateways for ambient mesh traffic management
      </p>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ borderBottom: "2px solid #ddd", textAlign: "left" }}>
            <th style={{ padding: "12px 8px" }}>Name</th>
            <th style={{ padding: "12px 8px" }}>Namespace</th>
            <th style={{ padding: "12px 8px" }}>Status</th>
            <th style={{ padding: "12px 8px" }}>Age</th>
          </tr>
        </thead>
        <tbody>
          {waypoints.map((waypoint) => {
            const status = getWaypointStatus(waypoint);
            const isReady = status === "Ready";
            return (
              <tr
                key={`${waypoint.metadata.namespace}/${waypoint.metadata.name}`}
                style={{ borderBottom: "1px solid #eee" }}
              >
                <td style={{ padding: "12px 8px" }}>
                  {waypoint.metadata.name}
                </td>
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
                      backgroundColor: isReady ? "#e8f5e9" : "#fff3e0",
                      color: isReady ? "#2e7d32" : "#e65100",
                    }}
                  >
                    {status}
                  </span>
                </td>
                <td style={{ padding: "12px 8px" }}>{waypoint.getAge()}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

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
