import {
  registerRoute,
  registerSidebarEntry,
} from '@kinvolk/headlamp-plugin/lib';
import { makeCustomResourceClass } from '@kinvolk/headlamp-plugin/lib/lib/k8s/crd';
import React from 'react';

// Define KmeshNodeInfo CRD
const KmeshNodeInfo = makeCustomResourceClass({
  apiInfo: [{ group: 'kmesh.net', version: 'v1alpha1' }],
  isNamespaced: true,
  singularName: 'kmeshnodeinfo',
  pluralName: 'kmeshnodeinfos',
});

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
  component: () => (
    <div>
      <h1>Kmesh Resources</h1>
      <p>KmeshNodeInfo list will appear here</p>
    </div>
  ),
});