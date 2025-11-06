import Web3 from 'web3';
import { ethers } from 'ethers';

// Contract ABI (will be loaded from compiled contract)
const CONTRACT_ABI = [
  {
    "inputs": [],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "candidateId",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "name",
        "type": "string"
      }
    ],
    "name": "CandidateAdded",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "candidateId",
        "type": "uint256"
      }
    ],
    "name": "CandidateRemoved",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "voter",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "candidateId",
        "type": "uint256"
      }
    ],
    "name": "VoteCast",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "startTime",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "endTime",
        "type": "uint256"
      }
    ],
    "name": "VotingPeriodSet",
    "type": "event"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "_name",
        "type": "string"
      }
    ],
    "name": "addCandidate",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_candidateId",
        "type": "uint256"
      }
    ],
    "name": "removeCandidate",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_startTime",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "_endTime",
        "type": "uint256"
      }
    ],
    "name": "setVotingPeriod",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_candidateId",
        "type": "uint256"
      }
    ],
    "name": "vote",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getCandidateCount",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getCandidates",
    "outputs": [
      {
        "internalType": "uint256[]",
        "name": "",
        "type": "uint256[]"
      },
      {
        "internalType": "string[]",
        "name": "",
        "type": "string[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getResults",
    "outputs": [
      {
        "internalType": "uint256[]",
        "name": "",
        "type": "uint256[]"
      },
      {
        "internalType": "string[]",
        "name": "",
        "type": "string[]"
      },
      {
        "internalType": "uint256[]",
        "name": "",
        "type": "uint256[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getVotingPeriod",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "startTime",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "endTime",
        "type": "uint256"
      },
      {
        "internalType": "bool",
        "name": "isActive",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getWinner",
    "outputs": [
      {
        "internalType": "string",
        "name": "winnerName",
        "type": "string"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_voter",
        "type": "address"
      }
    ],
    "name": "hasVoted",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "isVotingPeriodActive",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "owner",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
];

class ContractService {
  private web3: Web3 | null = null;
  private contract: any = null;
  private contractAddress: string = '';
  private account: string = '';

  constructor() {
    this.initializeWeb3();
  }

  private async initializeWeb3() {
    if (typeof window !== 'undefined' && window.ethereum) {
      try {
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        this.web3 = new Web3(window.ethereum);
        await this.loadContract();
      } catch (error) {
        console.error('Failed to initialize Web3:', error);
      }
    } else {
      console.error('MetaMask is not installed');
    }
  }

  private async loadContract() {
    try {
      // Try to load contract info from deployed file
      const response = await fetch('/contractInfo.json');
      if (response.ok) {
        const contractInfo = await response.json();
        this.contractAddress = contractInfo.address;
        this.contract = new this.web3!.eth.Contract(contractInfo.abi || CONTRACT_ABI, this.contractAddress);
      } else {
        // Fallback to hardcoded address for development
        this.contractAddress = process.env.REACT_APP_CONTRACT_ADDRESS || '0x5FbDB2315678afecb367f032d93F642f64180aa3';
        this.contract = new this.web3!.eth.Contract(CONTRACT_ABI, this.contractAddress);
      }

      // Get current account
      const accounts = await this.web3!.eth.getAccounts();
      this.account = accounts[0] || '';

    } catch (error) {
      console.error('Failed to load contract:', error);
    }
  }

  async connectWallet(): Promise<string | null> {
    try {
      if (typeof window !== 'undefined' && window.ethereum) {
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        const accounts = await this.web3!.eth.getAccounts();
        this.account = accounts[0] || '';
        return this.account;
      }
      return null;
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      return null;
    }
  }

  async isOwner(): Promise<boolean> {
    try {
      if (!this.contract || !this.account) return false;
      const owner = await this.contract.methods.owner().call();
      return owner.toLowerCase() === this.account.toLowerCase();
    } catch (error) {
      console.error('Failed to check ownership:', error);
      return false;
    }
  }

  // Admin functions
  async addCandidate(name: string): Promise<string | null> {
    try {
      if (!this.contract || !this.account) throw new Error('Contract not initialized');

      const result = await this.contract.methods.addCandidate(name).send({
        from: this.account,
        gas: 200000
      });

      return result.transactionHash;
    } catch (error: any) {
      console.error('Failed to add candidate:', error);
      throw error;
    }
  }

  async removeCandidate(candidateId: number): Promise<string | null> {
    try {
      if (!this.contract || !this.account) throw new Error('Contract not initialized');

      const result = await this.contract.methods.removeCandidate(candidateId).send({
        from: this.account,
        gas: 200000
      });

      return result.transactionHash;
    } catch (error: any) {
      console.error('Failed to remove candidate:', error);
      throw error;
    }
  }

  async setVotingPeriod(startTime: number, endTime: number): Promise<string | null> {
    try {
      if (!this.contract || !this.account) throw new Error('Contract not initialized');

      const result = await this.contract.methods.setVotingPeriod(startTime, endTime).send({
        from: this.account,
        gas: 200000
      });

      return result.transactionHash;
    } catch (error: any) {
      console.error('Failed to set voting period:', error);
      throw error;
    }
  }

  // Voter functions
  async vote(candidateId: number): Promise<string | null> {
    try {
      if (!this.contract || !this.account) throw new Error('Contract not initialized');

      const result = await this.contract.methods.vote(candidateId).send({
        from: this.account,
        gas: 200000
      });

      return result.transactionHash;
    } catch (error: any) {
      console.error('Failed to vote:', error);
      throw error;
    }
  }

  async hasVoted(address?: string): Promise<boolean> {
    try {
      if (!this.contract) return false;
      const voterAddress = address || this.account;
      if (!voterAddress) return false;

      const result = await this.contract.methods.hasVoted(voterAddress).call();
      return result;
    } catch (error) {
      console.error('Failed to check if voted:', error);
      return false;
    }
  }

  // View functions
  async getCandidates(): Promise<{ ids: number[], names: string[] }> {
    try {
      if (!this.contract) return { ids: [], names: [] };

      const result = await this.contract.methods.getCandidates().call();
      return { ids: result[0], names: result[1] };
    } catch (error) {
      console.error('Failed to get candidates:', error);
      return { ids: [], names: [] };
    }
  }

  async getResults(): Promise<{ ids: number[], names: string[], votes: number[] }> {
    try {
      if (!this.contract) return { ids: [], names: [], votes: [] };

      const result = await this.contract.methods.getResults().call();
      return { ids: result[0], names: result[1], votes: result[2] };
    } catch (error) {
      console.error('Failed to get results:', error);
      return { ids: [], names: [], votes: [] };
    }
  }

  async getWinner(): Promise<string> {
    try {
      if (!this.contract) return 'No candidates';

      const result = await this.contract.methods.getWinner().call();
      return result;
    } catch (error) {
      console.error('Failed to get winner:', error);
      return 'No candidates';
    }
  }

  async getVotingPeriod(): Promise<{ startTime: number, endTime: number, isActive: boolean }> {
    try {
      if (!this.contract) return { startTime: 0, endTime: 0, isActive: false };

      const result = await this.contract.methods.getVotingPeriod().call();
      return { startTime: result[0], endTime: result[1], isActive: result[2] };
    } catch (error) {
      console.error('Failed to get voting period:', error);
      return { startTime: 0, endTime: 0, isActive: false };
    }
  }

  isReady(): boolean {
    return this.contract !== null && this.web3 !== null;
  }

  getAccount(): string {
    return this.account;
  }

  getContractAddress(): string {
    return this.contractAddress;
  }
}

declare global {
  interface Window {
    ethereum: any;
  }
}

export default new ContractService();