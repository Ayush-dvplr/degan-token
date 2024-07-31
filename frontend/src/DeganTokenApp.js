import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import DeganTokenABI from "./DeganTokenABI.json"; // Import your ABI file
import "./DeganTokenApp.css"; // Import your CSS file

const DeganTokenApp = () => {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [contract, setContract] = useState(null);
  const [address, setAddress] = useState("");
  const [balance, setBalance] = useState("0");
  const [amount, setAmount] = useState("");
  const [recipient, setRecipient] = useState("");
  const [redemptionCode, setRedemptionCode] = useState("");
  const [isOwner, setIsOwner] = useState(false);
  const [storeStatus, setStoreStatus] = useState("");

  const contractAddress = "0xE7006Ec751EB47E1Ed21D7905c17f4446676Fe7a"; // Replace with your contract address

  useEffect(() => {
    const init = async () => {
      if (window.ethereum) {
        const provider = new ethers.BrowserProvider(window.ethereum);
        setProvider(provider);

        window.ethereum.on("accountsChanged", handleAccountsChanged);
        await handleAccountsChanged();
      } else {
        console.error("MetaMask not detected");
      }
    };

    init();

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener(
          "accountsChanged",
          handleAccountsChanged
        );
      }
    };
  }, []);

  const handleAccountsChanged = async () => {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    setSigner(signer);

    const contract = new ethers.Contract(
      contractAddress,
      DeganTokenABI,
      signer
    );
    setContract(contract);

    const address = await signer.getAddress();
    setAddress(address);

    const balance = await contract.balanceOf(address);
    setBalance(ethers.formatUnits(balance, 18));

    const owner = await contract.owner();
    setIsOwner(owner === address);

    const tx = await contract.storeAddress();
    if (tx == "0x0000000000000000000000000000000000000000")
      setStoreStatus("Closed !");
    else setStoreStatus("Open !");
  };

  const mint = async () => {
    try {
      const tx = await contract.mint(address, ethers.parseUnits(amount, 18));
      await tx.wait();
      const newBalance = await contract.balanceOf(address);
      setBalance(ethers.formatUnits(newBalance, 18));
      alert("Tokens minted successfully");
    } catch (error) {
      console.error(error);
      alert(`Minting failed : ${error?.message}`);
    } finally {
      setAmount("");
      setRecipient("");
    }
  };

  const burn = async () => {
    try {
      const tx = await contract.burn(ethers.parseUnits(amount, 18));
      await tx.wait();
      const newBalance = await contract.balanceOf(address);
      setBalance(ethers.formatUnits(newBalance, 18));
      alert("Tokens burned successfully");
    } catch (error) {
      console.error(error);
      alert(`Burning failed : ${error?.message}`);
    } finally {
      setAmount("");
      setRecipient("");
    }
  };

  const transfer = async () => {
    try {
      const tx = await contract.transfer(
        recipient,
        ethers.parseUnits(amount, 18)
      );
      await tx.wait();
      const newBalance = await contract.balanceOf(address);
      setBalance(ethers.formatUnits(newBalance, 18));
      alert("Tokens transferred successfully");
    } catch (error) {
      console.error(error);
      alert(`transfer failed : ${error?.message}`);
    } finally {
      setAmount("");
      setRecipient("");
    }
  };

  const createGiftCard = async () => {
    try {
      if (isOwner) {
        const code = `GIFT${Math.random()
          .toString(36)
          .substr(2, 16)
          .toUpperCase()}`;
        console.log(code);
        const tx = await contract.generateRedemptionCode(
          code,
          ethers.parseUnits(amount, 18)
        );
        await tx.wait();
        alert(`Gift card created with code: ${code}`);
      } else {
        alert("Only the owner can create gift cards");
      }
    } catch (error) {
      console.error(error);
      alert("Creating gift card failed : " + error?.message || "");
    }
  };

  const toggleStore = async () => {
    try {
      if (isOwner) {
        const tx = await contract.storeAddress();
        if (tx == "0x0000000000000000000000000000000000000000") {
          await contract.setStoreAddress(address);
          setStoreStatus("open");
          alert(`store is open now`);
        } else {
          await contract.setStoreAddress(
            "0x0000000000000000000000000000000000000000"
          );
          setStoreStatus("closed");
          alert(`store is closed now`);
        }
      }
    } catch (error) {
      console.error(error);
      alert("Creating gift card failed : " + error?.message || "");
    }
  };

  const redeem = async () => {
    try {
      const tx = await contract.redeem(
        ethers.parseUnits(amount, 18),
        redemptionCode
      );
      await tx.wait();
      const newBalance = await contract.balanceOf(address);
      setBalance(ethers.formatUnits(newBalance, 18));
      alert("Tokens redeemed successfully");
    } catch (error) {
      console.error(error);
      alert(`reedemtion failed : ${error?.message}`);
    } finally {
      setAmount("");
      setRecipient("");
      setRedemptionCode("");
    }
  };

  return (
    <div className="app-container">
      <h1>DeganToken</h1>
      <div className="account-info">
        <strong>Address:</strong> {address}
      </div>
      <div className="account-info">
        <strong>Contract:</strong> {contractAddress}
      </div>
      <div className="account-info">
        <strong>Balance:</strong> {balance} DGN
      </div>
      <div className="action-container">
        <div>
          <input
            type="text"
            placeholder="Amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="input-field"
          />
          <input
            type="text"
            placeholder="Recipient Address"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            className="input-field"
          />
        </div>
        <div>
          <button onClick={mint} className="action-button">
            Mint
          </button>
          <button onClick={burn} className="action-button">
            Burn
          </button>
          <button onClick={transfer} className="action-button">
            Transfer
          </button>
        </div>
      </div>

      {isOwner && (
        <>
          <div className="action-container">
            <button onClick={createGiftCard} className="action-button">
              Create Gift Card
            </button>
          </div>
          <div className="action-container">
            store:{" "}
            {
              <button onClick={toggleStore} className="action-button">
                {storeStatus}
              </button>
            }
          </div>
        </>
      )}
      <div className="action-container">
        <input
          type="text"
          placeholder="Redemption Code"
          value={redemptionCode}
          onChange={(e) => setRedemptionCode(e.target.value)}
          className="input-field"
        />
        <button onClick={redeem} className="action-button">
          Redeem
        </button>
      </div>
    </div>
  );
};

export default DeganTokenApp;
