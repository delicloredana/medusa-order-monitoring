# Order Monitoring Plugin

## Overview

The Order Monitoring Plugin is an essential administrative dashboard feature designed to highlight orders that require attention. It specifically focuses on orders with the "Not Fulfilled" and "Awaiting Payment" statuses created within the last 5 days, ensuring efficient management of pending orders.

## Installation

### Prerequisites

- [Medusa Backend](https://docs.medusajs.com/development/backend/install)

### How To Install

1. In the root of your Medusa backend, run the following command to install the `medusa-plugin-order-monitoring` plugin:

```bash
npm i medusa-plugin-order-monitoring
```

2. Add the plugin to your `medusa-config.js` file at the end of the `plugins` array:

```javascript
module.exports = {
  // ...
  plugins: [
    // ...
    {
      resolve: "medusa-plugin-order-monitoring",
      options: {
        enableUI: true,
      },
    },
  ],
  // ...
};
```

## Usage

### Admin Dashboard

1. Navigate to the Order Monitoring section on the admin dashboard.
2. **Focused Order Attention:**
   - View orders with "Not Fulfilled" and "Awaiting Payment" statuses created within the last 5 days.

