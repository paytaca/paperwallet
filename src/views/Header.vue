<template>
  <div class="home-container">
    <nav>
      <div class="nav-content">
        <img src="../assets/logolo.png" alt="Bitcoin Cash Logo" class="logo" />
        <h1>Bitcoin Cash</h1>
      </div>
    </nav>

    <div class="container">
      <select v-model="paymentDetails" @change="updateHashAndQR" class="dropdown">
        <option disabled value="">Select Payment Amount</option>
        <option v-for="amount in 10" :key="amount" :value="amount + ' BCH'">{{ amount }} BCH</option>
      </select>

      <div class="paper-wallet" id="printable-wallet">
        <div class="wallet-content">
          <div class="left-section">
            <h3>Public Address</h3>
            <img :src="qrCodeDataPublic" alt="Public QR Code" class="qr-code" />
            <p class="instruction">Scan to Pay</p>
          </div>
          
          <div class="middle-section">
            <h2>Bitcoin Cash Paper Wallet</h2>
            <div class="detail-item">
              <label>Amount:</label>
              <p class="amount">{{ paymentDetails || '0 BCH' }}</p>
            </div>
            <div class="detail-item">
              <label>Public Key:</label>
              <p class="hash">
                <span class="bch-prefix">bitcoincash:</span>{{ hashedPublicKey || 'No Hash Generated' }}
              </p>
            </div>
            <div class="detail-item">
              <label>Private Key:</label>
              <p class="hash">{{ hashedPrivateKey || 'No Hash Generated' }}</p>
            </div>
          </div>

          <div class="right-section">
            <h3>Private Key</h3>
            <img :src="qrCodeDataPrivate" alt="Private QR Code" class="qr-code" />
            <p class="instruction private-warning">Make it Private</p>
          </div>
        </div>
      </div>
      
      <div class="print-container">
        <button @click="printWallet" class="print-btn">Print Wallet</button>
      </div>
    </div>
  </div>
</template>

<script>
import QRCode from "qrcode";

export default {
  data() {
    return {
      paymentDetails: "",
      hashedPublicKey: "",
      hashedPrivateKey: "",
      qrCodeDataPublic: "",
      qrCodeDataPrivate: ""
    };
  },
  created() {
    this.updateHashAndQR();
  },
  methods: {
    async hashWithSHA256(input) {
      const encoder = new TextEncoder();
      const data = encoder.encode(input);
      const hashBuffer = await crypto.subtle.digest("SHA-256", data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(byte => byte.toString(16).padStart(2, "0")).join("");
    },
    async updateHashAndQR() {
      const defaultAmount = this.paymentDetails || "0 BCH";
      
      this.hashedPublicKey = await this.hashWithSHA256(defaultAmount + "public");
      this.hashedPrivateKey = await this.hashWithSHA256(defaultAmount + "private");
      
      this.qrCodeDataPublic = await QRCode.toDataURL(this.hashedPublicKey);
      this.qrCodeDataPrivate = await QRCode.toDataURL(this.hashedPrivateKey);
    },
    printWallet() {
      const printable = document.getElementById('printable-wallet');
      const newWindow = window.open('', '_blank');
      newWindow.document.write('<html><head><title>Print Wallet</title></head><body>');
      newWindow.document.write(printable.innerHTML);
      newWindow.document.write('</body></html>');
      newWindow.document.close();
      newWindow.print();
    }
  }
};
</script>

<style scoped>
.home-container, .container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
}

body {
  background-color: #f4f4f4;
  font-family: 'Arial', sans-serif;
}

nav {
  width: 100%;
  background-color: rgb(15, 207, 159);
  padding: 1rem;
  color: white;
  font-weight: bold;
  display: flex;
  justify-content: center;
}

.nav-content {
  display: flex;
  align-items: center;
  gap: 15px;
}

.logo {
  height: 4rem;
  width: auto;
  max-height: 100%;
}

h1 {
  font-size: 2.5rem;
  margin: 0;
}

.dropdown {
  margin-top: 15px;
}

.paper-wallet {
  background: #fff;
  padding: 2rem;
  border-radius: 15px;
  width: 100%;
  max-width: 960px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  margin-top: 20px;
  display: flex;
  flex-direction: column;
  border: 2px solid #2e8b57;
}

.wallet-content {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 1.5rem;
}

.left-section, .right-section {
  flex: 1;
  text-align: center;
}

.middle-section {
  flex: 1.5;
  text-align: center;
  padding: 0 1rem;
}

.qr-code {
  width: 100%;
  max-width: 180px;
  height: auto;
  border: 3px solid #2e8b57;
  padding: 10px;
  border-radius: 10px;
}

.private-warning {
  color: red;
  font-weight: bold;
  font-size: 0.9rem;
}

.detail-item label {
  font-weight: bold;
  color: #2e8b57;
  font-size: 1rem;
}

.hash {
  word-break: break-word;
  font-family: monospace;
  font-size: 0.9rem;
  color: #555;
  background: #f8f8f8;
  padding: 5px;
  border-radius: 5px;
}

.print-container {
  margin-top: 15px;
  text-align: center;
}

.print-btn {
  background: rgb(15, 207, 159);
  color: white;
  padding: 12px 24px;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  font-size: 1rem;
  transition: background 0.3s;
}

.print-btn:hover {
  background: rgb(12, 180, 140);
}

</style>

