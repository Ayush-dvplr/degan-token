import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import DeganTokenABI from "./DeganTokenABI.json";
import "./DeganTokenApp.css";

const DeganTokenApp = () => {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [contract, setContract] = useState(null);
  const [address, setAddress] = useState("");
  const [balance, setBalance] = useState("0");
  const [amount, setAmount] = useState("");
  const [price, setPrice] = useState("");
  const [recipient, setRecipient] = useState("");
  const [redemptionCode, setRedemptionCode] = useState("");
  const [isOwner, setIsOwner] = useState(false);
  const [storeStatus, setStoreStatus] = useState("");
  const [redemptionCodes, setRedemptionCodes] = useState([]);

  const contractAddress = "0x6351560CF1d9BE26A2C5834294A7bd220b64F3a3";

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
    if (tx === "0x0000000000000000000000000000000000000000")
      setStoreStatus("Closed !");
    else setStoreStatus("Open !");

    // Fetch all redemption codes
    const codeList = await contract.getAllRedemptionCodes();
    const codes = [];
    for (let code of codeList) {
      const details = await contract.redemptionCodes(code);
      if (details.amount > 1) {
        codes.push({
          code,
          amount: ethers.formatUnits(details.amount, 18),
          price: ethers.formatUnits(details.price, 18),
        });
      }
    }
    setRedemptionCodes(codes);
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
      alert(`Minting failed: ${error?.message}`);
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
      alert(`Burning failed: ${error?.message}`);
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
      alert(`Transfer failed: ${error?.message}`);
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
        const tx = await contract.generateRedemptionCode(
          code,
          ethers.parseUnits(amount, 18),
          ethers.parseUnits(price, 18)
        );
        await tx.wait();
        // Fetch all redemption codes
        const codeList = await contract.getAllRedemptionCodes();
        const codes = [];
        for (let code of codeList) {
          const details = await contract.redemptionCodes(code);
          if (details.amount > 1) {
            codes.push({
              code,
              amount: ethers.formatUnits(details.amount, 18),
              price: ethers.formatUnits(details.price, 18),
            });
          }
        }
        setRedemptionCodes(codes);
        alert(`Gift card created with code: ${code}`);
      } else {
        alert("Only the owner can create gift cards");
      }
    } catch (error) {
      console.error(error);
      alert("Creating gift card failed: " + (error?.message || ""));
    } finally {
      setAmount("");
      setPrice("");
    }
  };

  const toggleStore = async () => {
    try {
      if (isOwner) {
        const tx = await contract.storeAddress();
        if (tx === "0x0000000000000000000000000000000000000000") {
          await contract.setStoreAddress(address);
          setStoreStatus("Open!");
          alert(`Store is open now`);
        } else {
          await contract.setStoreAddress(
            "0x0000000000000000000000000000000000000000"
          );
          setStoreStatus("Closed!");
          alert(`Store is closed now`);
        }
      }
    } catch (error) {
      console.error(error);
      alert("Toggling store failed: " + (error?.message || ""));
    }
  };

  const redeem = async (amount, code) => {
    try {
      const tx = await contract.redeem(ethers.parseUnits(amount, 18), code);
      await tx.wait();
      const newBalance = await contract.balanceOf(address);
      setBalance(ethers.formatUnits(newBalance, 18));
      // Fetch all redemption codes
      const codeList = await contract.getAllRedemptionCodes();
      const codes = [];
      for (let code of codeList) {
        const details = await contract.redemptionCodes(code);
        if (details.amount > 1) {
          codes.push({
            code,
            amount: ethers.formatUnits(details.amount, 18),
            price: ethers.formatUnits(details.price, 18),
          });
        }
      }
      setRedemptionCodes(codes);
      alert("Tokens redeemed successfully");
    } catch (error) {
      console.error(error);
      alert(`Redemption failed: ${error?.message}`);
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
        <div className="action-container">
          <div>
            <input
              type="text"
              placeholder="Amount for Gift Card"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="input-field"
            />
            <input
              type="text"
              placeholder="Price in DGN"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="input-field"
            />
          </div>
          <div>
            <button onClick={createGiftCard} className="action-button">
              Create Gift Card
            </button>
          </div>
        </div>
      )}
      {isOwner && (
        <div className="action-container">
          <button onClick={toggleStore} className="action-button">
            {storeStatus === "Closed !" ? "Open Store" : "Close Store"}
          </button>
        </div>
      )}

      <h2>Available Redemption Codes</h2>
      <div className="redemption-code-list">
        {redemptionCodes.length > 0 ? (
          redemptionCodes.map((codeObj, index) => (
            <div key={index} className="redemption-code-item">
              <div className="code-info">
                <strong>Code:</strong> {codeObj.code}
              </div>
              <div className="code-info">
                <strong>Amount:</strong> {codeObj.amount} DGN
              </div>
              <div className="code-info">
                <strong>Price:</strong> {codeObj.price} DGN
              </div>
              <button
                onClick={() => redeem(codeObj.amount, codeObj.code)}
                className="action-button"
              >
                Buy
              </button>
            </div>
          ))
        ) : (
          <p>No redemption codes available</p>
        )}
      </div>
    </div>
  );
};

export default DeganTokenApp;
