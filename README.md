# ProjectToyota-Intvent-apps1.0

Toyota Dealer Inventory Management System - A web and mobile app for managing dealer inventory, vehicle counting, sales flow tracking, and customer acquisition assistance.

## Features

### Import Duty Calculator
Estimate import duties for vehicles being imported to Puerto Rico or exported to other countries.

#### Key Features:
- **Two Vehicle Input Methods:**
  - Enter VIN (Vehicle Identification Number) with 17-character format validation
  - Enter Make, Model, and Year manually

- **Puerto Rico Import Duty Calculation:**
  - Implements the official Puerto Rico tax bracket system
  - Shows detailed calculation breakdown (fixed tax + percentage of excess)
  - Includes link to SURI portal for official information

- **Export Duty Calculation:**
  - Supports 20+ countries including US, Canada, Mexico, EU countries, and more
  - Shows duty rates and additional fees for each destination

## Getting Started

### Prerequisites
- Node.js (v18 or higher recommended)
- npm

### Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Run tests
npm test
```

## Project Structure

```
src/
├── components/
│   └── ImportDutyCalculator.jsx  # Main duty calculator component
├── utils/
│   ├── vinValidator.js           # VIN validation and parsing
│   └── dutyCalculator.js         # Duty calculation logic
├── __tests__/
│   ├── vinValidator.test.js      # VIN validator tests
│   └── dutyCalculator.test.js    # Duty calculator tests
├── App.jsx                       # Main application component
└── main.jsx                      # Application entry point
```

## Testing

The project includes comprehensive tests for the duty calculation and VIN validation logic:

```bash
npm test
```

## License

MIT License - see [LICENSE](LICENSE) for details.
