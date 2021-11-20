import * as React from "react";
import { ethers } from "ethers";
import "./App.css";
import abi from "./utils/WavePortal.json";

export default function App() {
  const [currentAccount, setCurrentAccount] = React.useState("");
  const [totalWaves, setTotalWaves] = React.useState(0);
  const [userWaves, setUserWaves] = React.useState(0);
  const [msg, setMsg] = React.useState("");
  const [allWaves, setAllWaves] = React.useState([]);
  const [isLoading, setIsLoading] = React.useState(false);

  const contractAddress = "0xa0912366B0D8dCc403DaB2394D65B035F2432349";

  const contractABI = abi.abi;

  const checkIfWalletIsConnected = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        console.log("Make sure you have metamask!");
        return;
      } else {
        console.log("We have the ethereum object", ethereum);
      }
      const accounts = await ethereum.request({ method: "eth_accounts" });

      if (accounts.length !== 0) {
        const account = accounts[0];
        console.log("Found an authorized account:", account);
        setCurrentAccount(account);
        const count = await getTotalWaveCount();
        setTotalWaves(count);
        const wavers = await getAllWaves();
        setAllWaves(wavers);
        const userWaves = await getUserWaveCount();
        setUserWaves(userWaves);
      } else {
        console.log("No authorized account found");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const connectWallet = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        alert("Get MetaMask!");
        return;
      }

      const accounts = await ethereum.request({
        method: "eth_requestAccounts",
      });

      console.log("Connected", accounts[0]);
      setCurrentAccount(accounts[0]);
    } catch (error) {
      console.log(error);
    }
  };

  const wave = async () => {
    if (msg.length === 0) {
      alert("Enter a message!");
      return;
    }

    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const wavePortalContract = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
        );

        let count = await wavePortalContract.getTotalWaves();
        console.log("Retrieved total wave count...", count.toNumber());
        setIsLoading(true);
        const waveTxn = await wavePortalContract.wave(msg, {
          gasLimit: 300000,
        });
        console.log("Mining...", waveTxn.hash);

        await waveTxn.wait();
        setIsLoading(false);
        console.log("Mined -- ", waveTxn.hash);

        count = await wavePortalContract.getTotalWaves();
        console.log("Retrieved total wave count...", count.toNumber());
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error);
    }
  };

  async function getTotalWaveCount() {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const wavePortalContract = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
        );

        let count = await wavePortalContract.getTotalWaves();
        return count.toNumber();
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error);
    }
  }

  async function getUserWaveCount() {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const wavePortalContract = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
        );

        let count = await wavePortalContract.getUserWaves();
        console.log("Retrieved user wave count...", count.toNumber());
        return count.toNumber();
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error);
    }
  }

  const getAllWaves = async () => {
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const wavePortalContract = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
        );
        const waves = await wavePortalContract.getAllWaves();
        let wavesCleaned = [];
        waves.forEach((wave) => {
          wavesCleaned.push({
            address: wave.waver,
            timestamp: new Date(wave.timestamp * 1000).toLocaleDateString(),
            message: wave.message,
          });
        });
        return wavesCleaned;
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error);
    }
  };

  React.useEffect(() => {
    checkIfWalletIsConnected();
  }, []);
  /**
   * Listen in for emitter events!
   */
  React.useEffect(() => {
    let wavePortalContract;

    const onNewWave = (from, timestamp, message) => {
      console.log("NewWave", from, timestamp, message);
      setAllWaves((prevState) => [
        ...prevState,
        {
          address: from,
          timestamp: new Date(timestamp * 1000).toLocaleDateString(),
          message: message,
        },
      ]);
      setTotalWaves((prevState) => prevState + 1);
      if (from === currentAccount) {
        setUserWaves((prevState) => prevState + 1);
      }
    };

    if (window.ethereum) {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();

      wavePortalContract = new ethers.Contract(
        contractAddress,
        contractABI,
        signer
      );
      wavePortalContract.on("NewWave", onNewWave);
    }

    return () => {
      if (wavePortalContract) {
        wavePortalContract.off("NewWave", onNewWave);
      }
    };
  }, []);

  return (
    <div className="mainContainer">
      <div className="dataContainer">
        <div className="header">👋 Hey there!</div>
        <div className="bio">
          I am Taran and I want you to wave at me? Connect your Ethereum wallet
          and wave at me! DO IT!
        </div>
        <div>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              margin: "20px 0",
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                margin: "10px",
              }}
            >
              <h1 style={{ margin: 0 }}>{totalWaves}</h1>
              <h2 style={{ margin: 0 }}>Total Waves</h2>
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                margin: "10px",
              }}
            >
              <h1 style={{ margin: 0 }}>{userWaves}</h1>
              <h2 style={{ margin: 0 }}>Your Waves</h2>
            </div>
          </div>
        </div>
        <input
          placeholder="Please enter a message!"
          type="text"
          value={msg}
          style={{ padding: "14px 10px ", margin: "10px 0" }}
          onChange={(e) => setMsg(e.target.value)}
        />
        <button className="waveButton" disabled={isLoading} onClick={wave}>
          {isLoading ? "Mining..." : "Wave at Me"}
        </button>
        {!currentAccount && (
          <button className="waveButton" onClick={connectWallet}>
            Connect Wallet
          </button>
        )}
        <table style={{ marginTop: "20px" }}>
          <thead>
            <tr>
              <th>Address</th>
              <th>Timestamp</th>
              <th>Message</th>
            </tr>
          </thead>
          <tbody>
            {allWaves?.map((wave, i) => (
              <tr key={i}>
                <td>{wave.address}</td>
                <td>{wave.timestamp}</td>
                <td>{wave.message}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
