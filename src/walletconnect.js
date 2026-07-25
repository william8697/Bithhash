import { EthereumProvider } from "@walletconnect/ethereum-provider";

// Make the provider available globally for your existing dashboard.js
window.WalletConnectProvider = {
    EthereumProvider
};

console.log("✅ WalletConnect SDK loaded successfully");
console.log(window.WalletConnectProvider);