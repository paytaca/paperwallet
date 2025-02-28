<template>
  <div class="home-container">
    <nav>
      <div class="nav-content">
        <img src="../assets/logolo.png" alt="Bitcoin Cash Logo" class="logo" />
        <h1>Bitcoin Cash</h1>
      </div>
    </nav>

    <div class="amount-dropdown-container">
      <select v-model="paymentDetails" @change="updatePublicQRCode" class="dropdown">
        <option disabled value="">Select Payment Amount</option>
        <option v-for="amount in [0.05, 0.1, 0.25, 0.5, 0.75, 1, 5, 10]" :key="amount" :value="amount">
          {{ amount }} BCH
        </option>
      </select>
    </div>

    <div class="content-container">
      <div class="paper-wallet-container">
        <img src="@/assets/1.png" alt="Paper Wallet" class="paper-wallet-image" />
        <div class="qr-code-container">
          <img :src="qrCodeDataPublic" alt="Public QR Code" class="qr-code public-qr" />
          <img :src="qrCodeDataPrivate" alt="Private QR Code" class="qr-code private-qr" />
        </div>
      </div>
      <div class="print-container">
        <button @click="printWallet" class="print-btn">Print Wallet</button>
      </div>
    </div>
  </div>
</template>


<script>
import { binToHex, hexToBin, ripemd160, binToBase58, decodeBase58Address, encodeCashAddress, secp256k1 } from "@bitauth/libauth";
import QRCode from "qrcode";
import { Buffer } from "buffer";

export default {
  data() {
    return {
      paymentDetails: "",
      privateKeyWIF: "",
      publicKeyHex: "",
      bitcoinCashAddress: "",
      qrCodeDataPublic: "",
      qrCodeDataPrivate: "",
    };
  },
  async created() {
    await this.generateNewKeys();
  },
  methods: {
    async sha256(data = '', encoding = 'utf8') {
      let buffer;

      if (data instanceof Uint8Array) {
        buffer = data;
      } else if (encoding === 'utf8') {
        buffer = new TextEncoder().encode(data);
      } else if (encoding === 'hex') {
        buffer = hexToBin(data);
      } else {
        throw new Error('Unsupported encoding type');
      }

      const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
      return binToHex(new Uint8Array(hashBuffer));
    },

    async generateNewKeys() {
      const privateKey = await this.generatePrivateKey();
      this.privateKeyWIF = privateKey.wif;
      this.publicKeyHex = privateKey.publicKey;
      this.bitcoinCashAddress = privateKey.address;

      this.qrCodeDataPrivate = await QRCode.toDataURL(this.privateKeyWIF);
      this.updatePublicQRCode();
    },

    async generatePrivateKey() {
      // Generate a 32-byte (256-bit) cryptographically secure private key
      const privateKeyBytes = new Uint8Array(32);
      crypto.getRandomValues(privateKeyBytes);

      // Convert private key to hex
      const privateKeyHex = binToHex(privateKeyBytes);
      

      // Generate Public Key from Private Key (Compressed format)
      const publicKeyBytes = secp256k1.derivePublicKeyCompressed(privateKeyBytes);
      const publicKeyHex = binToHex(publicKeyBytes);
      

      // Hash the Public Key (SHA-256 then RIPEMD-160)
      const sha256Hash = await this.sha256(publicKeyHex, 'hex');
      const ripemdHash = ripemd160.hash(hexToBin(sha256Hash));
      

      // Encode as Bitcoin Cash Address
      const versionByte = new Uint8Array([0x00]); // Mainnet prefix for P2PKH
      const addressData = new Uint8Array([...versionByte, ...ripemdHash]);

      // Double SHA-256 for checksum
      const hash1 = await this.sha256(addressData, 'hex');
      const hash2 = await this.sha256(hexToBin(hash1), 'hex');
      const checksum = hexToBin(hash2).slice(0, 4);
     

      // Concatenate and encode in Base58Check
      const dataWithChecksum = new Uint8Array([...addressData, ...checksum]);
      const legacyAddress = binToBase58(dataWithChecksum);
 

      // Convert to Bitcoin Cash Address format
      const decodedLegacyAddress = decodeBase58Address(legacyAddress);
      const cashAddress = encodeCashAddress({
        prefix: 'bitcoincash',
        type: 'p2pkh',
        payload: decodedLegacyAddress.payload,
        throwErrors: false
      }).address;
      

      // Generate WIF Private Key
      const extendedKey = new Uint8Array([0x80, ...privateKeyBytes, 0x01]); // 0x01 for compressed
      const hashWif1 = await this.sha256(extendedKey, 'hex');
      const hashWif2 = await this.sha256(hexToBin(hashWif1), 'hex');
      const checksumWif = hexToBin(hashWif2).slice(0, 4);
      const wifKey = new Uint8Array([...extendedKey, ...checksumWif]);
      const finalWIF = binToBase58(wifKey);
      

      return {
        privateKey: privateKeyHex,
        publicKey: publicKeyHex,
        address: cashAddress,
        wif: finalWIF
      };
    },

    async updatePublicQRCode() {
      if (!this.bitcoinCashAddress) return;
      const amount = this.paymentDetails || 0;
      const qrDataPublic = `${this.bitcoinCashAddress}?amount=${amount}`;
      this.qrCodeDataPublic = await QRCode.toDataURL(qrDataPublic);
    },

    printWallet() {
      const printable = document.getElementById('printable-wallet');
      const newWindow = window.open('', '_blank');
      newWindow.document.write('<html><head><title>Print Wallet</title></head><body>');
      newWindow.document.write('<style>img { max-width: 100%; display: block; margin: auto; }</style>');
      newWindow.document.write(printable.outerHTML);
      newWindow.document.write('</body></html>');
      newWindow.document.close();
      newWindow.focus();
      setTimeout(() => {
        newWindow.print();
        newWindow.close();
      }, 500);  
    }
  }
};
</script>

<style scoped>
.landing-container {
  background-color: white;
  display: flex;
  flex-direction: column;
  align-items: center;
  min-height: 20vh;
  min-width: 20vw;
  font-family: "Poppins", sans-serif;
  width: 98.4%;
  padding: flex;
}

.landing-header {
  background-color: white;
  width: 100%;
  padding: 5px 15px;
  position: fixed;
  top: 0;
  left: 0;
  display: flex;
  align-items: center; 
  gap: 10px; 
  z-index: 1000;
}

.header-padding {
  width: 100%;
  height: 140px;
  background-color: rgb(30 41 59 );
  margin-top: 1px;
  margin-bottom: 100px;
  display: flex;
  padding: 5px 30px;
  align-items: center;
  text-align: center;
  justify-content: center;
}

.header-padding-text {
  font-size: 25px;
  font-weight: bold;
  color: white;
  margin-top: 70px;
  font-family: 'Lexend';
}

.site-logo {
  width: 25px;
  height: 25px;
}

.paper5-logo {
  width: 40px;
  height: 40px;
  margin-right: 7px;
  margin-top: 70px;
}

.site-title {
  font-size: 20px;
  font-weight: bold;
  color: rgb(30 41 59 );
  font-family:'Lexend';
}

.wallet-description {
  text-align: center;
  font-size: 20px;
  font-weight: bold;
  color: rgb(51 65 85);
  margin-top: -80px;
  margin-bottom: 20px;
  font-family: 'Lexend';
}






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
  width: 190%;
  max-width: 190px;
  height: 150px;	
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

.paper-wallet-container {
  position: relative;
  width: 100%;
  max-width: 960px;
  margin: 0 auto;
}

.paper-wallet-image {
  width: 100%;
  display: block;
}

.qr-code-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.public-qr {
  position: absolute;
  top: 12%;
  right: 7%;
  height: 125px;
  width: 127.5px;
}
.private-qr {
  position: absolute;
  top: 6%;
  left: 2.6%;
  height: 125px;
  width: 127.5px;
}
@media print {
  body {
    background: white;
    margin: 0;
    padding: 0;
  }

  .paper-wallet-container {
    width: 100%;
    max-width: 960px;
    page-break-inside: avoid;
  }

  .qr-code-container {
    display: flex;
    justify-content: space-between;
  }

  .public-qr, .private-qr {
    width: 125px;
    height: 125px;
  }
}

</style>