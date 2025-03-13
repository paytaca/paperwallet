<template>
  <div class="landing-container">
    <header class="landing-header">
      <img src="@/assets/paytaca.jpg" alt="Paytaca Logo" class="site-logo">
      <a href="https://www.paytaca.com/#home" target="_blank" class="site-title">Paytaca.com</a>
    </header>

    <div class="header-padding">
      <img src="@/assets/paper5.png" class="paper5-logo">
      <h1 class="header-padding-text">Bitcoin Cash (BCH) Paper Wallet</h1>
    </div>

    <p class="wallet-description">Move your mouse to generate Bitcoin Cash (BCH) Address</p>

    <div class="hash-generator">
      <!-- Progress Container -->
      <div class="progress-container">
        <p>Generating Bitcoin (BCH) Address</p>

        <!-- Progress Bar with percentage -->
        <div class="progress-bar-container">
          <div class="progress-bar" :style="{ width: progress + '%' }">
            <span class="progress-text">{{ progress.toFixed(1) }}%</span>
          </div>
        </div>
        
        <!-- Manual input area -->
        <input class="input-bar" v-model="manualEntropy" @input="updateEntropy" placeholder="no mouse? enter random text here">
      </div>
    </div>

    <!-- 🆕 Jumbled text that moves dynamically -->
    <p class="jumbled-text" :style="{ transform: `translate(${offsetX}px, ${offsetY}px)` }">
      {{ jumbledText }}
    </p>

  </div>
</template>

<script>
import { binToHex, hexToBin, ripemd160, binToBase58, encodeCashAddress, decodeBase58Address, secp256k1 } from "@bitauth/libauth";
import QRCode from "qrcode";

export default {
  name: "BCHAddressGenerator",
  data() {
    return {
      entropy: "",
      manualEntropy: "",
      progress: 0,
      generatedAddress: "",
      addressGenerated: false,
      qrCodeData: "",
      jumbledText: this.generateJumbledText(),
      offsetX: 0,
      offsetY: 0
    };
  },
  mounted() {
    window.addEventListener("mousemove", this.captureEntropy);
  },
  beforeDestroy() {
    window.removeEventListener("mousemove", this.captureEntropy);
  },
  methods: {
    captureEntropy(event) {
      if (this.addressGenerated || this.progress >= 100) return;
      this.entropy += `${event.clientX},${event.clientY}|`;
      this.progress += 0.1;
      if (this.progress >= 100) {
        this.progress = 100;
        this.generateAddress();
      }
      this.jumbledText = this.generateJumbledText();
      this.offsetX = Math.random() * 10 - 5;
      this.offsetY = Math.random() * 10 - 5;
    },

    updateEntropy() {
      if (this.addressGenerated || this.progress >= 100) return;
      this.entropy += this.manualEntropy;
      this.progress += 0.1;
      if (this.progress >= 100) {
        this.progress = 100;
        this.generateAddress();
      }
    },

    async generateAddress() {
      // Generate a valid Bitcoin Cash address from the entropy
      const privateKey = await this.generatePrivateKeyFromEntropy(this.entropy);
      const publicKey = privateKey.publicKey;
      const cashAddress = privateKey.address;

      this.generatedAddress = cashAddress;
      this.addressGenerated = true;
      this.qrCodeData = await QRCode.toDataURL(this.generatedAddress);
      console.log(this.generatedAddress);
      this.redirectToWalletGenerator();
    },

    async generatePrivateKeyFromEntropy(entropy) {
      // Convert the entropy to a private key (32 bytes)
      const privateKeyBytes = new Uint8Array(32);
      for (let i = 0; i < 32; i++) {
        privateKeyBytes[i] = entropy.charCodeAt(i % entropy.length); // Fill the entropy into the private key
      }

      // Derive the public key from the private key (compressed format) using secp256k1 from @bitauth/libauth
      const publicKeyBytes = secp256k1.derivePublicKeyCompressed(privateKeyBytes);
      const publicKeyHex = binToHex(publicKeyBytes);

      // Hash the public key to get the Bitcoin address
      const sha256Hash = await this.sha256(publicKeyHex, 'hex');
      const ripemdHash = ripemd160.hash(hexToBin(sha256Hash));

      // Encode as Bitcoin Cash Address (P2PKH)
      const versionByte = new Uint8Array([0x00]);
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

      // Check if payload exists before encoding the cash address
      if (!decodedLegacyAddress || !decodedLegacyAddress.payload) {
        throw new Error("Decoded legacy address does not have a valid payload.");
      }

      const cashAddress = encodeCashAddress({
        prefix: 'bitcoincash',
        type: 'p2pkh',
        payload: decodedLegacyAddress.payload,
        throwErrors: false,
      }).address;

      return { privateKey: privateKeyBytes, publicKey: publicKeyHex, address: cashAddress };
    },

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

    redirectToWalletGenerator() {
      this.$router.push("/walletgenerator");
    },

    generateJumbledText() {
      const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
      return Array.from({ length: 40 })
        .map(() => characters.charAt(Math.floor(Math.random() * characters.length)))
        .join("");
    }
  }
};
</script>


<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Lexend:wght@100..900&display=swap');

.lexend {
  font-family: "Lexend", serif;
  font-optical-sizing: auto;
  font-weight: bold;
  font-style: normal;
}

.landing-container {
  background-color: white;
  position: fixed;
  background-size: 105%;
  z-index: -1;
  width: 100vw;
  height: 100vh;
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
  padding: 15px 30px;
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
  width: 50px;
  height: 50px;
  margin-right:5px;
  margin-top: 50px;
}

.site-title {
  font-size: 20px;
  font-weight: bold;
  color: rgb(30 41 59 );
  font-family:'Lexend';
  text-decoration: none;
}

.wallet-description {
  text-align: center;
  font-size: 25px;
  font-weight: bold;
  color: rgb(51 65 85);
  margin-top: -80px;
  margin-bottom: 20px;
  font-family: 'Lexend';
}

.progress-container {
  text-align: center;
  margin-top: 20px;
  color: rgb(51 65 85);
  font-weight: bold;
  font-size: 20px;
  font-family: 'Lexend';
  
}

.progress-bar-container {
  width: 100%;
  height: 40px;
  background: #ccc;
  border-radius: 10px;
  overflow: hidden;
  position: relative;
  font-size: 20px;
  width: 100%;
  border-left-width: 300%;
}

.progress-bar {
  height: 100%;
  background: rgb(51 65 85);
  transition: width 0.3s ease;
  display: flex;
  justify-content: center;
  align-items: center;
  position: center;
  size: 20px;
}

.progress-text {
  color: white;
  font-weight: bold;
  font-size: 18px;
  position: absolute;
  font-family: 'Lexend';
}

.input-bar {
  width: 85%;
  height: 40px;
  border: 2px solid #ccc;
  border-radius: 5px;
  margin-top: 10px;
  padding: 0 10px;
  font-size: 20px;
}

.hash-generator {
  width: 400px; 
  background-color: white; 
  padding: 20px; 
  border-radius: 10px; 
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2); 
  text-align: center; 
  margin: 30px auto 0; 
  position: relative; 
}

.jumbled-text {
  font-size: 20px;
  font-weight: bold;
  color: rgb(30 41 59 );
  text-align: center;
  margin-top: 15px;
  transition: transform 0.1s ease-in-out;
  font-family: 'Lexend';
}

</style>
