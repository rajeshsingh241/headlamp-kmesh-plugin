import {
  registerRoute,
  registerSidebarEntry,
} from '@kinvolk/headlamp-plugin/lib';
import { makeCustomResourceClass } from '@kinvolk/headlamp-plugin/lib/lib/k8s/crd';
import React from 'react';

// Define KmeshNodeInfo CRD (kmesh.net/v1alpha1)
const KmeshNodeInfo = makeCustomResourceClass({
  apiInfo: [{ group: 'kmesh.net', version: 'v1alpha1' }],
  isNamespaced: true,
  singularName: 'kmeshnodeinfo',
  pluralName: 'kmeshnodeinfos',
});

function KmeshNodeInfoList() {
  const [nodeInfoList, error] = KmeshNodeInfo.useList();

  if (error) {
    return <div>Error loading Kmesh resources: {error.message}</div>;
  }

  if (!nodeInfoList) {
    return <div>Loading Kmesh resources...</div>;
  }

  if (nodeInfoList.length === 0) {
    return <div>No KmeshNodeInfo resources found in this cluster.</div>;
  }

  return (
    <div>
      <h1>Kmesh Node Info</h1>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Namespace</th>
            <th>Age</th>
          </tr>
        </thead>
        <tbody>
          {nodeInfoList.map(item => (
            <tr key={item.metadata.name}>
              <td>{item.metadata.name}</td>
              <td>{item.metadata.namespace}</td>
              <td>{item.metadata.creationTimestamp}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// Register sidebar entry
registerSidebarEntry({
  parent: 'cluster',
  name: 'kmesh',
  label: 'Kmesh',
  icon: 'mdi:network',
  url: '/kmesh',
});

// Register route
registerRoute({
  path: '/kmesh',
  sidebar: 'kmesh',
  name: 'kmesh',
  component: () => <KmeshNodeInfoList />,
});
