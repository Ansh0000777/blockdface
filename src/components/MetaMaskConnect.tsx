import React, { useState, useEffect } from 'react';
import ContractService from '../services/ContractService';

interface MetaMaskConnectProps {
  onConnect?: (account: string) => void;
  onDisconnect?: () => void;
  showBalance?: boolean;
}

const MetaMaskConnect: React.FC<MetaMaskConnectProps> = ({
  onConnect,
  onDisconnect,
  showBalance = false
}) => {
  const [account, setAccount] = useState<string>('');
  const [balance, setBalance] = useState<string>('0');
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string>('');
  const [isMetaMaskInstalled, setIsMetaMaskInstalled] = useState(true);

  useEffect(() => {
    checkMetaMaskInstallation();
    checkExistingConnection();
  }, []);

  const checkMetaMaskInstallation = () => {
    if (typeof window !== 'undefined' && !window.ethereum) {
      setIsMetaMaskInstalled(false);
      setError('MetaMask is not installed. Please install MetaMask to continue.');
    }
  };

  const checkExistingConnection = async () => {
    try {
      if (window.ethereum) {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          if (onConnect) {
            onConnect(accounts[0]);
          }
          if (showBalance) {
            await updateBalance(accounts[0]);
          }
        }
      }
    } catch (error) {
      console.error('Failed to check existing connection:', error);
    }
  };

  const updateBalance = async (address: string) => {
    try {
      const web3 = ContractService;
      if (web3.isReady()) {
        const balanceInWei = await (web3 as any).web3.eth.getBalance(address);
        const balanceInEth = (web3 as any).web3.utils.fromWei(balanceInWei, 'ether');
        setBalance(parseFloat(balanceInEth).toFixed(4));
      }
    } catch (error) {
      console.error('Failed to get balance:', error);
    }
  };

  const handleConnect = async () => {
    if (!isMetaMaskInstalled) {
      window.open('https://metamask.io/download/', '_blank');
      return;
    }

    setIsConnecting(true);
    setError('');

    try {
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      });

      if (accounts.length > 0) {
        setAccount(accounts[0]);
        if (onConnect) {
          onConnect(accounts[0]);
        }
        if (showBalance) {
          await updateBalance(accounts[0]);
        }
      }
    } catch (error: any) {
      console.error('Failed to connect wallet:', error);
      if (error.code === 4001) {
        setError('User rejected the request. Please try again.');
      } else {
        setError('Failed to connect wallet. Please try again.');
      }
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = () => {
    setAccount('');
    setBalance('0');
    setError('');
    if (onDisconnect) {
      onDisconnect();
    }
  };

  const formatAddress = (address: string) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const handleAccountsChanged = (accounts: string[]) => {
    if (accounts.length === 0) {
      handleDisconnect();
    } else if (accounts[0] !== account) {
      setAccount(accounts[0]);
      if (onConnect) {
        onConnect(accounts[0]);
      }
      if (showBalance) {
        updateBalance(accounts[0]);
      }
    }
  };

  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', handleAccountsChanged);

      return () => {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      };
    }
  }, [account]);

  if (!isMetaMaskInstalled) {
    return (
      <div style={styles.container}>
        <div style={styles.errorBox}>
          <h3>🦊 MetaMask Not Found</h3>
          <p>MetaMask is required to use this application.</p>
          <button
            onClick={() => window.open('https://metamask.io/download/', '_blank')}
            style={styles.installButton}
          >
            Install MetaMask
          </button>
        </div>
      </div>
    );
  }

  if (account) {
    return (
      <div style={styles.container}>
        <div style={styles.connectedBox}>
          <div style={styles.accountInfo}>
            <span style={styles.address}>{formatAddress(account)}</span>
            {showBalance && (
              <span style={styles.balance}>{balance} ETH</span>
            )}
          </div>
          <button
            onClick={handleDisconnect}
            style={styles.disconnectButton}
          >
            Disconnect
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <button
        onClick={handleConnect}
        disabled={isConnecting}
        style={{
          ...styles.connectButton,
          ...(isConnecting ? styles.connectButtonDisabled : {})
        }}
      >
        {isConnecting ? 'Connecting...' : 'Connect MetaMask'}
      </button>

      {error && (
        <div style={styles.errorMessage}>
          {error}
        </div>
      )}
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    gap: '10px'
  },
  errorBox: {
    background: '#fff5f5',
    border: '2px solid #fed7d7',
    borderRadius: '10px',
    padding: '20px',
    textAlign: 'center' as const,
    maxWidth: '300px'
  },
  connectedBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
    background: '#f0fff4',
    border: '2px solid #9ae6b4',
    borderRadius: '10px',
    padding: '10px 15px'
  },
  accountInfo: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'flex-start'
  },
  address: {
    fontSize: '14px',
    fontWeight: 'bold',
    color: '#2d3748'
  },
  balance: {
    fontSize: '12px',
    color: '#4a5568'
  },
  connectButton: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    border: 'none',
    padding: '12px 24px',
    borderRadius: '25px',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'all 0.2s',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  connectButtonDisabled: {
    opacity: 0.6,
    cursor: 'not-allowed'
  },
  disconnectButton: {
    background: '#e53e3e',
    color: 'white',
    border: 'none',
    padding: '8px 16px',
    borderRadius: '15px',
    fontSize: '12px',
    fontWeight: 'bold',
    cursor: 'pointer'
  },
  installButton: {
    background: '#f687b3',
    color: 'white',
    border: 'none',
    padding: '12px 24px',
    borderRadius: '25px',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
    marginTop: '15px'
  },
  errorMessage: {
    color: '#e53e3e',
    fontSize: '14px',
    textAlign: 'center' as const,
    maxWidth: '300px',
    background: '#fff5f5',
    padding: '10px',
    borderRadius: '8px',
    border: '1px solid #fed7d7'
  }
};

declare global {
  interface Window {
    ethereum: any;
  }
}

export default MetaMaskConnect;