# GraphQL Integration Guide for Frontend Team

Welcome! This guide outlines how to interact with the backend GraphQL API of the Texon ERP system. It includes instructions on authentication, endpoint configuration, all available queries, and sample client implementation codes.

---

## 1. Connection Details & Testing

### GraphQL Endpoint
*   **Development URL:** `http://localhost:8000/graphql/`
*   **Method:** `POST`
*   **Content-Type:** `application/json`

### Testing with GraphiQL
When `DEBUG = True` in settings, accessing `http://localhost:8000/graphql/` in your browser displays the **GraphiQL IDE**.
*   **Authentication in GraphiQL:** Because requests from the browser IDE don't automatically include custom headers, you should first log into the Django Admin at `http://localhost:8000/admin/` using your credentials. This initializes a session cookie. The backend `JWTAuthMiddleware` will detect this session and allow you to test queries within GraphiQL without needing a JWT header.

---

## 2. Authentication Flow (JWT)

For programmatic calls (e.g., from React/Vue/Mobile apps), all requests are authenticated via **JSON Web Tokens (JWT)**.

### Step 1: Obtain a Access Token
Send a `POST` request to the token endpoint with the user's credentials:
*   **URL:** `/api/users/api/token/`
*   **Request Body:**
    ```json
    {
      "email": "user@example.com",
      "password": "your_secure_password"
    }
    ```
*   **Response Body:**
    ```json
    {
      "access": "eyJhbGciOi...",
      "refresh": "eyJhbGciOi..."
    }
    ```

### Step 2: Include JWT in GraphQL Requests
Every query sent to the `/graphql/` endpoint must include the access token in the `Authorization` header:
```http
Authorization: Bearer <your_access_token>
```

> [!IMPORTANT]
> The backend enforces authentication on all GraphQL requests. If the header is missing, incorrect, or expired, the backend returns a `400 Bad Request` or GraphQL errors:
> `Authentication required. Please provide a valid 'Authorization: Bearer <token>' header.`

---

## 3. GraphQL Queries Reference

All query names are automatically converted from Python's snake_case to standard frontend **camelCase**.

Below are the queries exposed by the gateway schema, divided by app.

### A. Orders App Schema
This schema enables querying purchase orders, buyers, style details, sample development status, and tracking logs.

| Query Field | Return Type | Arguments | Description |
| :--- | :--- | :--- | :--- |
| `allOrders` | `[PurchaseOrderType]` | *None* | Retrieves all purchase orders in the database. |
| `orderByPoNumber` | `PurchaseOrderType` | `poNumber: String!` | Retrieves a specific purchase order by its PO number. |

#### Type Structure: `PurchaseOrderType`
*   `id`: `ID!`
*   `poNumber`: `String!`
*   `qty`: `Int!`
*   `shipDate`: `Date!` (Format: `YYYY-MM-DD`)
*   `currentStage`: `OrdersPurchaseOrderCurrentStageChoices!` (Enums: `PO_RECEIVED`, `FABRIC_SOURCING`, `PRODUCTION`, `SHIPPING`)
*   `createdAt`: `DateTime!`
*   `style`: `StyleType!` (Detailed info on buyer, season, and samples)
*   `items`: `[OrderItemType!]!` (Color, size, and quantities)
*   `stageLogs`: `[OrderStageLogType!]!` (Audit trail of stage changes)
*   `riskScore`: `Float` (AI-calculated risk metrics)
*   `riskLevel`: `String` (AI-calculated risk tier, e.g., `"Low"`)

---

### B. Production App Schema
This schema exposes factory floor operations, machinery logs, capacity metrics, shift details, and real-time efficiency/OEE scores.

| Query Field | Return Type | Arguments | Description |
| :--- | :--- | :--- | :--- |
| `allProductionUnits` | `[ProductionUnitType]` | *None* | Retrieves all production units. |
| `productionUnit` | `ProductionUnitType` | `id: Int!` | Retrieves a single production unit. |
| `allProductionLines` | `[ProductionLineType]` | *None* | Retrieves all production lines. |
| `productionLine` | `ProductionLineType` | `id: Int!` | Retrieves a single production line. |
| `allLineCapacities` | `[LineCapacityType]` | *None* | Retrieves daily capacity details for lines. |
| `lineCapacity` | `LineCapacityType` | `id: Int!` | Retrieves capacity for a specific line. |
| `allProductionShifts` | `[ProductionShiftType]` | *None* | Retrieves all production shift configurations. |
| `productionShift` | `ProductionShiftType` | `id: Int!` | Retrieves shift details. |
| `allProductionRecords` | `[ProductionRecordType]` | *None* | Retrieves actual production quantity outputs. |
| `productionRecord` | `ProductionRecordType` | `id: Int!` | Retrieves a single production output record. |
| `allOeeLogs` | `[OEELogType]` | *None* | Retrieves OEE records (Availability, Performance, Quality, Score). |
| `oeeLog` | `OEELogType` | `id: Int!` | Retrieves a single OEE entry. |
| `allDowntimeEvents` | `[DowntimeEventType]` | *None* | Retrieves logs of machinery stoppages and durations. |
| `downtimeEvent` | `DowntimeEventType` | `id: Int!` | Retrieves details on a single downtime event. |
| `allDefectLogs` | `[DefectLogType]` | *None* | Retrieves defect counts, check sizes, and rate data. |
| `defectLog` | `DefectLogType` | `id: Int!` | Retrieves a specific defect log. |
| `allHeatmapData` | `[HeatmapDataType]` | *None* | Retrieves active floor metric data. |
| `heatmapData` | `HeatmapDataType` | `id: Int!` | Retrieves a single heatmap data point. |
| `allBottleneckAlerts` | `[BottleneckAlertType]` | *None* | Retrieves alerts raised on machine / throughput bottlenecks. |
| `bottleneckAlert` | `BottleneckAlertType` | `id: Int!` | Retrieves details on a single bottleneck alert. |

---

## 4. Example Query Layouts

Here are some query configurations structured to retrieve nested related data.

### Querying All Orders (Deeply Nested Structure)
Retrieve active orders along with their styles, buyer names, custom item colors/sizes, stage logs, and AI risk prediction metrics.

```graphql
query GetAllOrdersWithDetails {
  allOrders {
    id
    poNumber
    qty
    shipDate
    currentStage
    riskScore
    riskLevel
    style {
      code
      description
      buyer {
        name
        code
        country
      }
      season {
        name
        year
      }
      samples {
        sampleType
        status
        submissionDate
        comments
      }
    }
    items {
      color
      size
      qty
    }
    stageLogs {
      stage
      changedAt
      notes
    }
  }
}
```

### Querying a Specific Order by PO Number (With Variables)
Retrieve information for a single purchase order by utilizing variables.

```graphql
query GetOrderDetails($poNumber: String!) {
  orderByPoNumber(poNumber: $poNumber) {
    id
    poNumber
    qty
    shipDate
    currentStage
    style {
      code
      buyer {
        name
      }
    }
  }
}
```
*Variables Payload:*
```json
{
  "poNumber": "PO-84920"
}
```

### Querying Live Production Metrics & OEE Data
Query all production lines with their parent units, daily capacities, output records, OEE calculations, and active bottlenecks.

```graphql
query GetProductionDashboard {
  allProductionLines {
    id
    name
    isActive
    productionUnit {
      name
      location
    }
    capacity {
      dailyCapacityPcs
      updatedAt
    }
    oeeLogs {
      oeeScore
      availabilityRate
      performanceRate
      qualityRate
      timestamp
    }
    bottleneckAlerts {
      alertMessage
      isResolved
      createdAt
    }
  }
}
```

---

## 5. Frontend Integration Recipes

Below are implementation examples for common frontend toolsets.

### Recipe A: Vanilla JavaScript `fetch`
Ideal for utility files or lightweight script actions.

```javascript
async function fetchGraphQL(query, variables = {}, token = null) {
  const headers = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch('http://localhost:8000/graphql/', {
    method: 'POST',
    headers: headers,
    body: JSON.stringify({ query, variables }),
  });

  const result = await response.json();
  if (result.errors) {
    console.error('GraphQL Errors:', result.errors);
    throw new Error(result.errors[0].message);
  }
  
  return result.data;
}

// Usage Example:
const query = `
  query GetOrder($po: String!) {
    orderByPoNumber(poNumber: $po) {
      poNumber
      qty
      shipDate
      riskLevel
    }
  }
`;

fetchGraphQL(query, { po: "PO-84920" }, "YOUR_JWT_ACCESS_TOKEN")
  .then(data => console.log('Order retrieved:', data.orderByPoNumber))
  .catch(err => console.error(err));
```

### Recipe B: React with Apollo Client Setup
First, install the library:
```bash
npm install @apollo/client graphql
```

Set up the client in your application entry point (e.g., `main.tsx` / `App.tsx`):

```typescript
import React from 'react';
import { 
  ApolloClient, 
  InMemoryCache, 
  ApolloProvider, 
  createHttpLink 
} from '@apollo/client';
import { setContext } from '@apollo/client/link/context';

const httpLink = createHttpLink({
  uri: 'http://localhost:8000/graphql/',
});

const authLink = setContext((_, { headers }) => {
  // Retrieve token from local storage (or your application state store)
  const token = localStorage.getItem('token');
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : "",
    }
  }
});

const client = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
});

export default function App() {
  return (
    <ApolloProvider client={client}>
      <MyDashboard />
    </ApolloProvider>
  );
}
```

Now use the client hooks inside your functional components:

```typescript
import { useQuery, gql } from '@apollo/client';

const GET_OEE_DASHBOARD = gql`
  query GetOEEDashboard {
    allProductionLines {
      id
      name
      isActive
      oeeLogs {
        oeeScore
        timestamp
      }
    }
  }
`;

function MyDashboard() {
  const { loading, error, data } = useQuery(GET_OEE_DASHBOARD);

  if (loading) return <p>Loading dashboard metrics...</p>;
  if (error) return <p>Error loading dashboard: {error.message}</p>;

  return (
    <div>
      <h2>Production Line Status</h2>
      {data.allProductionLines.map((line: any) => (
        <div key={line.id}>
          <h3>{line.name} (Active: {line.isActive ? "Yes" : "No"})</h3>
          <p>Latest OEE: {line.oeeLogs[0]?.oeeScore ?? "N/A"}%</p>
        </div>
      ))}
    </div>
  );
}
```
