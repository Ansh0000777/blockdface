# BlockDFace - Decentralized Voting System

A blockchain-based voting platform with face authentication, built with React, Solidity, and face-api.js.

## Features

- 🗳️ Secure blockchain voting using Ethereum smart contracts
- 👤 Face-based voter authentication
- 🦊 MetaMask wallet integration
- 🏛️ Admin dashboard for candidate management
- ⏰ Time-based voting periods
- 🎊 Automatic winner announcement
- 🔒 Privacy-preserving face recognition (local processing only)

## Setup Instructions

### Prerequisites

1. **Node.js** (v16 or higher)
2. **MetaMask** browser extension
3. **Ganache** for local blockchain development

### Installation

1. **Clone and install dependencies:**
   ```bash
   cd blockdface
   npm install
   ```

2. **Download face recognition models:**
   ```bash
   npm run setup:models
   ```

3. **Start local blockchain:**
   ```bash
   npm run node
   ```
   (Keep this running in a separate terminal)

4. **Compile and deploy smart contract:**
   ```bash
   npm run compile
   npm run deploy
   ```

5. **Configure MetaMask:**
   - Add Localhost 8545 network
   - Import first Ganache account (100 ETH)
   - Set network to "Localhost 8545"

6. **Start the application:**
   ```bash
   npm start
   ```

### Usage

#### Admin Setup
1. Visit `http://localhost:3000/admin`
2. Connect MetaMask with admin account
3. Add candidates using the dashboard
4. Set voting period (start/end times)
5. Monitor results in real-time

#### Voter Registration & Voting
1. Visit `http://localhost:3000`
2. Click "Register Face" for new voters
3. Allow camera access and follow prompts
4. Login with face for returning voters
5. Connect MetaMask wallet
6. Select candidate and cast vote
7. View results after voting period ends

### Development

```bash
# Start development server
npm start

# Compile smart contracts
npm run compile

# Deploy to local blockchain
npm run deploy

# Run local blockchain
npm run node

# Setup face models
npm run setup:models
```

### Security Features

- Face data processed locally (never leaves device)
- One vote per wallet enforcement
- Smart contract-based access control
- MetaMask transaction confirmations
- Time-locked voting periods
- 
## 📸 Project Screenshots

### 🧑 Face Authentication Interface (Privacy Preserved)
The system performs facial authentication locally to verify voter identity before allowing access to the voting interface.
User privacy is preserved, and facial data is never stored or transmitted.

<img width="100%" alt="Face Authentication Interface" src="https://github.com/user-attachments/assets/5de4ef65-9865-4889-a9a1-6261f6d522a9" />

---

### 🛠 Admin Dashboard
The admin dashboard allows election administrators to manage candidates, configure voting periods,
and monitor the overall election status in real time.

<img width="100%" alt="Admin Dashboard" src="https://github.com/user-attachments/assets/cced3666-b7cf-4e22-bc29-7c0ec6db8248" />

---

### 🗳 Voting Interface
Authenticated voters are presented with a simple and intuitive voting interface.
Each voter can select only one candidate and proceed to cast their vote securely.

<img width="100%" alt="Voting Interface" src="https://github.com/user-attachments/assets/9375c750-eb7d-4753-b479-248a034458a0" />

---

### 🔐 Blockchain Transaction (MetaMask)
Votes are recorded on the Ethereum blockchain using MetaMask.
This ensures transparency, immutability, and tamper-resistance of the voting process.

<img width="100%" alt="MetaMask Transaction" src="https://github.com/user-attachments/assets/d49a6906-338c-4a3a-a149-5b3343247fd9" />

---

## 🗳️ Vote Confirmation
After successful face authentication and blockchain verification, the vote is permanently recorded.
The system prevents duplicate voting and confirms successful submission to the voter.

<img width="100%" alt="Vote Confirmed" src="https://github.com/user-attachments/assets/3541697d-f26d-4468-a19a-1a2c4809d9c8" />

---

## 🛠️ Admin Panel – Candidate Vote Tracking
The admin panel displays live vote counts for each candidate.
Vote totals are fetched directly from the blockchain, ensuring accuracy and transparency.

<img width="500" alt="Candidate Vote Tracking" src="https://github.com/user-attachments/assets/87fb9482-ef34-47b9-ae52-480be6bba7d5" />

---

## 🏆 Election Results & Winner Declaration
Once the voting period ends, results are computed from on-chain data.
The winning candidate is declared in a transparent and verifiable manner.

<img width="500" alt="Election Results" src="https://github.com/user-attachments/assets/1ca76b87-6261-426d-97d1-5adaf91ae4f3" />

### License

MIT License
