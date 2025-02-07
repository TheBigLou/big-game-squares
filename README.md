# Big Game Squares

A modern, real-time squares game platform for the big game. Built with React, Node.js, and MongoDB.

## Features

- Real-time game updates
- Automatic score calculations and payouts
- Mobile-friendly interface
- Distinct player colors
- Email notifications
- Secure player authentication

## Tech Stack

- **Frontend**: React, TypeScript, Material-UI
- **Backend**: Node.js, Express, TypeScript
- **Database**: MongoDB
- **Real-time**: WebSocket
- **State Management**: React Query

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/TheBigLou/big-game-squares.git
cd big-game-squares
```

2. Install dependencies:
```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

3. Create environment files:
```bash
# In /server
cp .env.example .env

# In /client
cp .env.example .env
```

4. Start the development servers:
```bash
# Start server (from /server directory)
npm run dev

# Start client (from /client directory)
npm run dev
```

## License

MIT

## Author

TheBigLou 