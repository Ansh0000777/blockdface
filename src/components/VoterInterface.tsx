import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ContractService from '../services/ContractService';
import { ROUTES, MESSAGES } from '../utils/constants';

interface Candidate {
  id: number;
  name: string;
}

interface VotingPeriod {
  startTime: number;
  endTime: number;
  isActive: boolean;
}

const VoterInterface: React.FC = () => {
  const navigate = useNavigate();
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [votingPeriod, setVotingPeriod] = useState<VotingPeriod>({
    startTime: 0,
    endTime: 0,
    isActive: false
  });
  const [selectedCandidate, setSelectedCandidate] = useState<number | null>(null);
  const [account, setAccount] = useState('');
  const [hasVoted, setHasVoted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [voting, setVoting] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [winner, setWinner] = useState<string>('');
  const [timeRemaining, setTimeRemaining] = useState('');

  useEffect(() => {
    initializeVoterInterface();
  }, []);

  useEffect(() => {
    if (votingPeriod.endTime > 0) {
      const timer = setInterval(() => {
        updateTimeRemaining();
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [votingPeriod]);

  const initializeVoterInterface = async () => {
    try {
      // Check if voter is authenticated
      const voterId = localStorage.getItem('blockdface_voter_id');
      if (!voterId) {
        navigate(ROUTES.HOME);
        return;
      }

      // Connect wallet
      const connectedAccount = await ContractService.connectWallet();
      if (!connectedAccount) {
        setError(MESSAGES.WALLET_NOT_CONNECTED);
        setLoading(false);
        return;
      }

      setAccount(connectedAccount);

      // Load data
      await loadData();

      // Check if already voted
      const voted = await ContractService.hasVoted();
      setHasVoted(voted);

    } catch (error) {
      console.error('Failed to initialize voter interface:', error);
      setError('Failed to initialize voting interface');
    } finally {
      setLoading(false);
    }
  };

  const loadData = async () => {
    try {
      const [candidatesData] = await ContractService.getCandidates();
      const candidatesList: Candidate[] = candidatesData.ids.map((id: number, index: number) => ({
        id,
        name: candidatesData.names[index]
      }));
      setCandidates(candidatesList);

      const votingPeriodData = await ContractService.getVotingPeriod();
      setVotingPeriod(votingPeriodData);

      // Check if voting has ended
      if (votingPeriodData.endTime > 0 && Date.now() > votingPeriodData.endTime * 1000) {
        const winnerData = await ContractService.getWinner();
        setWinner(winnerData);
      }
    } catch (error) {
      console.error('Failed to load data:', error);
      setError('Failed to load voting data');
    }
  };

  const updateTimeRemaining = () => {
    if (!votingPeriod.endTime) return;

    const now = Math.floor(Date.now() / 1000);
    const remaining = votingPeriod.endTime - now;

    if (remaining <= 0) {
      setTimeRemaining('Voting has ended');
      // Load winner when voting ends
      if (!winner) {
        loadWinner();
      }
      return;
    }

    const days = Math.floor(remaining / 86400);
    const hours = Math.floor((remaining % 86400) / 3600);
    const minutes = Math.floor((remaining % 3600) / 60);
    const seconds = remaining % 60;

    if (days > 0) {
      setTimeRemaining(`${days}d ${hours}h ${minutes}m ${seconds}s`);
    } else if (hours > 0) {
      setTimeRemaining(`${hours}h ${minutes}m ${seconds}s`);
    } else if (minutes > 0) {
      setTimeRemaining(`${minutes}m ${seconds}s`);
    } else {
      setTimeRemaining(`${seconds}s`);
    }
  };

  const loadWinner = async () => {
    try {
      const winnerData = await ContractService.getWinner();
      setWinner(winnerData);
    } catch (error) {
      console.error('Failed to load winner:', error);
    }
  };

  const handleVote = async () => {
    if (selectedCandidate === null) {
      setError('Please select a candidate before voting');
      return;
    }

    try {
      setVoting(true);
      setMessage('Casting your vote...');
      setError('');

      const transactionHash = await ContractService.vote(selectedCandidate);

      setMessage(`Vote cast successfully! Transaction: ${transactionHash}`);
      setHasVoted(true);

      // Clear message after 5 seconds
      setTimeout(() => setMessage(''), 5000);

    } catch (error: any) {
      console.error('Failed to vote:', error);
      setError(error.message || 'Failed to cast vote');
      setMessage('');
    } finally {
      setVoting(false);
    }
  };

  const handleDisconnect = () => {
    localStorage.removeItem('blockdface_voter_id');
    navigate(ROUTES.HOME);
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleString();
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loadingBox}>
          <h2>Loading Voting Interface...</h2>
          <p>Preparing your secure voting experience</p>
        </div>
      </div>
    );
  }

  const showResults = !votingPeriod.isActive && votingPeriod.endTime > 0 && Date.now() > votingPeriod.endTime * 1000;

  return (
    <div style={styles.container}>
      <div style={styles.votingBox}>
        <header style={styles.header}>
          <h1>🗳️ Voting Portal</h1>
          <div style={styles.walletInfo}>
            <span>Wallet: {formatAddress(account)}</span>
            <button onClick={handleDisconnect} style={styles.disconnectButton}>
              Disconnect
            </button>
          </div>
        </header>

        {message && (
          <div style={styles.successMessage}>
            {message}
          </div>
        )}

        {error && (
          <div style={styles.errorMessage}>
            {error}
          </div>
        )}

        {/* Voting Status */}
        <div style={styles.statusCard}>
          <h2>Voting Status</h2>

          {votingPeriod.startTime > 0 ? (
            <>
              <p><strong>Start:</strong> {formatTimestamp(votingPeriod.startTime)}</p>
              <p><strong>End:</strong> {formatTimestamp(votingPeriod.endTime)}</p>
              <p><strong>Status:</strong>
                <span style={{
                  color: votingPeriod.isActive ? '#27ae60' : '#e74c3c',
                  fontWeight: 'bold',
                  marginLeft: '10px'
                }}>
                  {votingPeriod.isActive ? '🟢 Active' : '🔴 Inactive'}
                </span>
              </p>

              {votingPeriod.isActive && (
                <div style={styles.countdown}>
                  <h3>⏰ Time Remaining</h3>
                  <div style={styles.timeDisplay}>{timeRemaining}</div>
                </div>
              )}

              {!votingPeriod.isActive && votingPeriod.endTime > 0 && Date.now() < votingPeriod.endTime * 1000 && (
                <p style={styles.notStartedMessage}>
                  📅 Voting has not started yet
                </p>
              )}

              {!votingPeriod.isActive && votingPeriod.endTime > 0 && Date.now() > votingPeriod.endTime * 1000 && (
                <p style={styles.endedMessage}>
                  🏁 Voting has ended
                </p>
              )}
            </>
          ) : (
            <p style={styles.notStartedMessage}>
              ⏳ Voting period has not been set yet
            </p>
          )}
        </div>

        {/* Results Display (after voting ends) */}
        {showResults && winner && (
          <div style={styles.resultsCard}>
            <h2>🎉 Election Results</h2>
            <div style={styles.winnerAnnouncement}>
              <h3>Winner: {winner}</h3>
              <div style={styles.confetti}>🎊 🎉 🎊 🎉 🎊</div>
            </div>
          </div>
        )}

        {/* Voting Interface */}
        {!showResults && (
          <div style={styles.votingCard}>
            <h2>Cast Your Vote</h2>

            {hasVoted ? (
              <div style={styles.alreadyVoted}>
                <h3>✅ Vote Recorded</h3>
                <p>You have successfully cast your vote. Thank you for participating!</p>
                {votingPeriod.isActive && (
                  <p>Results will be announced after the voting period ends.</p>
                )}
              </div>
            ) : (
              <>
                {!votingPeriod.isActive ? (
                  <div style={styles.notActive}>
                    {votingPeriod.startTime > 0 ? (
                      <>
                        <h3>⏰ Voting Not Active</h3>
                        {Date.now() < votingPeriod.startTime * 1000 ? (
                          <p>Voting has not started yet. Please check back during the voting period.</p>
                        ) : (
                          <p>Voting has ended. Please check the results above.</p>
                        )}
                      </>
                    ) : (
                      <p>Voting period has not been set by the administrator.</p>
                    )}
                  </div>
                ) : (
                  <>
                    {candidates.length === 0 ? (
                      <p style={styles.noCandidates}>
                        No candidates available for this election.
                      </p>
                    ) : (
                      <>
                        <div style={styles.candidatesList}>
                          {candidates.map((candidate) => (
                            <div
                              key={candidate.id}
                              style={{
                                ...styles.candidateOption,
                                ...(selectedCandidate === candidate.id ? styles.selectedCandidate : {})
                              }}
                              onClick={() => setSelectedCandidate(candidate.id)}
                            >
                              <div style={styles.candidateInfo}>
                                <div style={styles.radioButton}>
                                  {selectedCandidate === candidate.id && (
                                    <div style={styles.radioButtonSelected}></div>
                                  )}
                                </div>
                                <span style={styles.candidateName}>{candidate.name}</span>
                              </div>
                            </div>
                          ))}
                        </div>

                        <button
                          onClick={handleVote}
                          style={{
                            ...styles.voteButton,
                            ...(selectedCandidate === null ? styles.voteButtonDisabled : {})
                          }}
                          disabled={selectedCandidate === null || voting}
                        >
                          {voting ? 'Casting Vote...' : 'Cast Vote'}
                        </button>

                        <p style={styles.disclaimer}>
                          ⚠️ This action is permanent and cannot be undone. Your vote will be recorded on the blockchain.
                        </p>
                      </>
                    )}
                  </>
                )}
              </>
            )}
          </div>
        )}

        {/* Contract Info */}
        <div style={styles.infoCard}>
          <h3>Secure Voting Information</h3>
          <p>• Your vote is anonymous and recorded on the blockchain</p>
          <p>• Each wallet can vote only once per election</p>
          <p>• All transactions are transparent and verifiable</p>
          <p>• Results are automatically calculated when voting ends</p>
        </div>
      </div>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    padding: '20px'
  },
  votingBox: {
    maxWidth: '800px',
    margin: '0 auto',
    color: '#333'
  },
  loadingBox: {
    background: 'white',
    borderRadius: '20px',
    padding: '60px',
    textAlign: 'center' as const,
    boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '30px',
    background: 'white',
    padding: '20px',
    borderRadius: '15px',
    boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
  },
  walletInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px'
  },
  disconnectButton: {
    background: '#e74c3c',
    color: 'white',
    border: 'none',
    padding: '8px 16px',
    borderRadius: '6px',
    fontSize: '14px',
    cursor: 'pointer'
  },
  successMessage: {
    background: '#d4edda',
    color: '#155724',
    padding: '15px',
    borderRadius: '8px',
    marginBottom: '20px',
    border: '1px solid #c3e6cb',
    textAlign: 'center' as const
  },
  errorMessage: {
    background: '#f8d7da',
    color: '#721c24',
    padding: '15px',
    borderRadius: '8px',
    marginBottom: '20px',
    border: '1px solid #f5c6cb',
    textAlign: 'center' as const
  },
  statusCard: {
    background: 'white',
    borderRadius: '15px',
    padding: '25px',
    marginBottom: '20px',
    boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
  },
  countdown: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    padding: '20px',
    borderRadius: '10px',
    textAlign: 'center' as const,
    marginTop: '15px'
  },
  timeDisplay: {
    fontSize: '2rem',
    fontWeight: 'bold',
    margin: '10px 0'
  },
  resultsCard: {
    background: 'white',
    borderRadius: '15px',
    padding: '25px',
    marginBottom: '20px',
    boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
  },
  winnerAnnouncement: {
    background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    color: 'white',
    padding: '30px',
    borderRadius: '15px',
    textAlign: 'center' as const
  },
  confetti: {
    fontSize: '2rem',
    marginTop: '15px'
  },
  votingCard: {
    background: 'white',
    borderRadius: '15px',
    padding: '25px',
    marginBottom: '20px',
    boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
  },
  alreadyVoted: {
    textAlign: 'center' as const,
    padding: '40px',
    background: '#d4edda',
    borderRadius: '10px',
    border: '2px solid #c3e6cb'
  },
  notActive: {
    textAlign: 'center' as const,
    padding: '40px',
    background: '#fff3cd',
    borderRadius: '10px',
    border: '2px solid #ffeaa7'
  },
  notStartedMessage: {
    color: '#f39c12',
    textAlign: 'center' as const,
    fontSize: '1.1rem',
    margin: '20px 0'
  },
  endedMessage: {
    color: '#e74c3c',
    textAlign: 'center' as const,
    fontSize: '1.1rem',
    margin: '20px 0'
  },
  noCandidates: {
    textAlign: 'center' as const,
    color: '#666',
    fontStyle: 'italic',
    padding: '20px'
  },
  candidatesList: {
    marginBottom: '25px'
  },
  candidateOption: {
    display: 'flex',
    alignItems: 'center',
    padding: '20px',
    margin: '10px 0',
    border: '2px solid #e1e8ed',
    borderRadius: '10px',
    cursor: 'pointer',
    transition: 'all 0.2s'
  },
  selectedCandidate: {
    borderColor: '#667eea',
    background: '#f8f9ff'
  },
  candidateInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px'
  },
  radioButton: {
    width: '20px',
    height: '20px',
    border: '2px solid #667eea',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  radioButtonSelected: {
    width: '12px',
    height: '12px',
    background: '#667eea',
    borderRadius: '50%'
  },
  candidateName: {
    fontSize: '1.1rem',
    fontWeight: '500'
  },
  voteButton: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    border: 'none',
    padding: '15px 40px',
    borderRadius: '25px',
    fontSize: '1.1rem',
    fontWeight: 'bold',
    cursor: 'pointer',
    width: '100%',
    transition: 'transform 0.2s'
  },
  voteButtonDisabled: {
    background: '#ccc',
    cursor: 'not-allowed'
  },
  disclaimer: {
    textAlign: 'center' as const,
    color: '#666',
    fontSize: '0.9rem',
    marginTop: '20px',
    fontStyle: 'italic'
  },
  infoCard: {
    background: 'white',
    borderRadius: '15px',
    padding: '20px',
    boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
  }
};

export default VoterInterface;