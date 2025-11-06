import { ethers } from 'ethers';
import detectEthereumProvider from '@metamask/detect-provider';

// Contract ABI - Updated for better compatibility
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

interface WalletInfo {
  address: string;
  balance: string;
  chainId: string;
  networkName: string;
}

class ContractService {
  private provider: ethers.BrowserProvider | null = null;
  private signer: ethers.JsonRpcSigner | null = null;
  private contract: ethers.Contract | null = null;
  private contractAddress: string = '';
  private account: string = '';

  constructor() {
    this.initializeProvider();
  }

  private async initializeProvider() {
    try {
      // Try to detect provider with better device compatibility
      const detectedProvider = await detectEthereumProvider({
        mustBeMetaMask: false,
        silent: true,
        timeout: 3000
      });

      if (detectedProvider) {
        this.provider = new ethers.BrowserProvider(detectedProvider as any);
        await this.loadContract();
      } else {
        console.warn('No Ethereum provider detected. Please install MetaMask or use a Web3-enabled browser.');
      }
    } catch (error) {
      console.error('Failed to initialize provider:', error);
    }
  }

  private async loadContract() {
    try {
      // Try to load contract info from deployed file
      const response = await fetch('/contractInfo.json');
      if (response.ok) {
        const contractInfo = await response.json();
        this.contractAddress = contractInfo.address;
        this.contract = new ethers.Contract(this.contractAddress, CONTRACT_ABI, this.signer);
      } else {
        // Fallback to hardcoded address for development
        this.contractAddress = process.env.REACT_APP_CONTRACT_ADDRESS || '0x5FbDB2315678afecb367f032d93F642f64180aa3';
        this.contract = new ethers.Contract(this.contractAddress, CONTRACT_ABI, this.signer);
      }
    } catch (error) {
      console.error('Failed to load contract:', error);
    }
  }

  async connectWallet(): Promise<string | null> {
    try {
      if (!this.provider) {
        // Try to initialize provider if not available
        await this.initializeProvider();
        if (!this.provider) {
          throw new Error('No Web3 provider available. Please install MetaMask or use a Web3-enabled browser.');
        }
      }

      // Request account access with better error handling
      try {
        const accounts = await this.provider.send('eth_requestAccounts', []);
        if (accounts.length === 0) {
          throw new Error('No accounts found');
        }

        this.account = accounts[0];
        this.signer = await this.provider.getSigner();

        // Reload contract with signer
        await this.loadContract();

        return this.account;
      } catch (error: any) {
        if (error.code === 4001) {
          throw new Error('User rejected the connection request. Please try again.');
        } else if (error.code === -32002) {
          throw new Error('Please check your MetaMask extension for pending connection requests.');
        } else {
          throw new Error('Failed to connect wallet: ' + error.message);
        }
      }
    } catch (error: any) {
      console.error('Failed to connect wallet:', error);
      throw error;
    }
  }

  async getWalletInfo(): Promise<WalletInfo | null> {
    try {
      if (!this.provider || !this.account) {
        return null;
      }

      const balance = await this.provider.getBalance(this.account);
      const network = await this.provider.getNetwork();

      return {
        address: this.account,
        balance: ethers.formatEther(balance),
        chainId: network.chainId.toString(),
        networkName: network.name || 'Unknown'
      };
    } catch (error) {
      console.error('Failed to get wallet info:', error);
      return null;
    }
  }

  async isOwner(): Promise<boolean> {
    try {
      if (!this.contract || !this.account) return false;

      const owner = await this.contract.owner();
      return owner.toLowerCase() === this.account.toLowerCase();
    } catch (error) {
      console.error('Failed to check ownership:', error);
      return false;
    }
  }

  // Admin functions
  async addCandidate(name: string): Promise<string> {
    try {
      if (!this.contract || !this.signer) {
        throw new Error('Contract not initialized or wallet not connected');
      }

      const contractWithSigner = this.contract.connect(this.signer);
      const tx = await contractWithSigner.addCandidate(name);

      // Wait for transaction to be mined
      const receipt = await tx.wait();

      if (receipt?.hash) {
        return receipt.hash;
      } else {
        throw new Error('Transaction failed');
      }
    } catch (error: any) {
      console.error('Failed to add candidate:', error);
      if (error.code === 4001) {
        throw new Error('Transaction rejected by user');
      } else if (error.code === -32603) {
        throw new Error('Insufficient funds for transaction');
      } else {
        throw new Error('Failed to add candidate: ' + (error.message || error.reason));
      }
    }
  }

  async removeCandidate(candidateId: number): Promise<string> {
    try {
      if (!this.contract || !this.signer) {
        throw new Error('Contract not initialized or wallet not connected');
      }

      const contractWithSigner = this.contract.connect(this.signer);
      const tx = await contractWithSigner.removeCandidate(candidateId);

      const receipt = await tx.wait();

      if (receipt?.hash) {
        return receipt.hash;
      } else {
        throw new Error('Transaction failed');
      }
    } catch (error: any) {
      console.error('Failed to remove candidate:', error);
      if (error.code === 4001) {
        throw new Error('Transaction rejected by user');
      } else {
        throw new Error('Failed to remove candidate: ' + (error.message || error.reason));
      }
    }
  }

  async setVotingPeriod(startTime: number, endTime: number): Promise<string> {
    try {
      if (!this.contract || !this.signer) {
        throw new Error('Contract not initialized or wallet not connected');
      }

      const contractWithSigner = this.contract.connect(this.signer);
      const tx = await contractWithSigner.setVotingPeriod(startTime, endTime);

      const receipt = await tx.wait();

      if (receipt?.hash) {
        return receipt.hash;
      } else {
        throw new Error('Transaction failed');
      }
    } catch (error: any) {
      console.error('Failed to set voting period:', error);
      if (error.code === 4001) {
        throw new Error('Transaction rejected by user');
      } else {
        throw new Error('Failed to set voting period: ' + (error.message || error.reason));
      }
    }
  }

  // Voter functions
  async vote(candidateId: number): Promise<string> {
    try {
      if (!this.contract || !this.signer) {
        throw new Error('Contract not initialized or wallet not connected');
      }

      const contractWithSigner = this.contract.connect(this.signer);
      const tx = await contractWithSigner.vote(candidateId);

      const receipt = await tx.wait();

      if (receipt?.hash) {
        return receipt.hash;
      } else {
        throw new Error('Transaction failed');
      }
    } catch (error: any) {
      console.error('Failed to vote:', error);
      if (error.code === 4001) {
        throw new Error('Transaction rejected by user');
      } else if (error.message?.includes('already voted')) {
        throw new Error('You have already voted');
      } else {
        throw new Error('Failed to vote: ' + (error.message || error.reason));
      }
    }
  }

  async hasVoted(address?: string): Promise<boolean> {
    try {
      if (!this.contract) return false;

      const voterAddress = address || this.account;
      if (!voterAddress) return false;

      const result = await this.contract.hasVoted(voterAddress);
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

      const result = await this.contract.getCandidates();
      return {
        ids: result[0].map((id: any) => Number(id)),
        names: result[1]
      };
    } catch (error) {
      console.error('Failed to get candidates:', error);
      return { ids: [], names: [] };
    }
  }

  async getResults(): Promise<{ ids: number[], names: string[], votes: number[] }> {
    try {
      if (!this.contract) return { ids: [], names: [], votes: [] };

      const result = await this.contract.getResults();
      return {
        ids: result[0].map((id: any) => Number(id)),
        names: result[1],
        votes: result[2].map((vote: any) => Number(vote))
      };
    } catch (error) {
      console.error('Failed to get results:', error);
      return { ids: [], names: [], votes: [] };
    }
  }

  async getWinner(): Promise<string> {
    try {
      if (!this.contract) return 'No candidates';

      const result = await this.contract.getWinner();
      return result;
    } catch (error) {
      console.error('Failed to get winner:', error);
      return 'No candidates';
    }
  }

  async getVotingPeriod(): Promise<{ startTime: number, endTime: number, isActive: boolean }> {
    try {
      if (!this.contract) return { startTime: 0, endTime: 0, isActive: false };

      const result = await this.contract.getVotingPeriod();
      return {
        startTime: Number(result[0]),
        endTime: Number(result[1]),
        isActive: result[2]
      };
    } catch (error) {
      console.error('Failed to get voting period:', error);
      return { startTime: 0, endTime: 0, isActive: false };
    }
  }

  // Utility functions
  isReady(): boolean {
    return this.contract !== null && this.provider !== null;
  }

  isConnected(): boolean {
    return this.account !== '' && this.signer !== null;
  }

  getAccount(): string {
    return this.account;
  }

  getContractAddress(): string {
    return this.contractAddress;
  }

  async getNetworkInfo(): Promise<{ chainId: string, name: string } | null> {
    try {
      if (!this.provider) return null;

      const network = await this.provider.getNetwork();
      return {
        chainId: network.chainId.toString(),
        name: network.name || 'Unknown'
      };
    } catch (error) {
      console.error('Failed to get network info:', error);
      return null;
    }
  }

  async switchNetwork(chainId: string): Promise<boolean> {
    try {
      if (!this.provider) return false;

      await this.provider.send('wallet_switchEthereumChain', [
        { chainId: `0x${parseInt(chainId).toString(16)}` }
      ]);

      return true;
    } catch (error: any) {
      console.error('Failed to switch network:', error);
      if (error.code === 4902) {
        throw new Error('Network not found in MetaMask. Please add it manually.');
      }
      return false;
    }
  }

  async addNetwork(networkConfig: {
    chainId: string;
    chainName: string;
    rpcUrls: string[];
    nativeCurrency: {
      name: string;
      symbol: string;
      decimals: number;
    };
  }): Promise<boolean> {
    try {
      if (!this.provider) return false;

      await this.provider.send('wallet_addEthereumChain', [networkConfig]);
      return true;
    } catch (error) {
      console.error('Failed to add network:', error);
      return false;
    }
  }

  // Check if the environment supports Web3
  static isWeb3Supported(): boolean {
    return typeof window !== 'undefined' &&
           (typeof window.ethereum !== 'undefined' ||
            typeof window.web3 !== 'undefined' ||
            /ethereum|web3/i.test(navigator.userAgent));
  }

  // Get recommended browser information
  static getBrowserInfo(): {
    supported: boolean;
    recommendation: string;
    browserName: string;
  } {
    const userAgent = navigator.userAgent;
    let browserName = 'Unknown';
    let recommendation = '';

    if (userAgent.includes('Chrome')) {
      browserName = 'Chrome';
      recommendation = 'Chrome is fully supported with MetaMask extension.';
    } else if (userAgent.includes('Firefox')) {
      browserName = 'Firefox';
      recommendation = 'Firefox is supported with MetaMask extension.';
    } else if (userAgent.includes('Safari')) {
      browserName = 'Safari';
      recommendation = 'Safari is supported with MetaMask extension or Coinbase Wallet app.';
    } else if (userAgent.includes('Edge')) {
      browserName = 'Edge';
      recommendation = 'Edge is supported with built-in crypto wallet or MetaMask extension.';
    } else {
      browserName = 'Mobile Browser';
      recommendation = 'For mobile devices, we recommend using MetaMask mobile app or Trust Wallet.';
    }

    const supported = this.isWeb3Supported();

    return {
      supported,
      recommendation: supported ? recommendation : 'Please install MetaMask or use a Web3-compatible browser.',
      browserName
    };
  }
}

declare global {
  interface Window {
    ethereum?: any;
    web3?: any;
  }
}

export default new ContractService();